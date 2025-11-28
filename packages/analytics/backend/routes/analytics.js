const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * GET /qr/:id/analytics
 * Complete analytics overview for a QR code
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Validate QR code exists
    const qrCheck = await pool.query(
      'SELECT id, short_code, destination_url, title, created_at FROM qr_codes WHERE id = $1',
      [id]
    );

    if (qrCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    const qrCode = qrCheck.rows[0];

    // Build date filter
    let dateFilter = 'AND scanned_at >= $2';
    const queryParams = [id];
    
    if (start_date) {
      queryParams.push(start_date);
      if (end_date) {
        dateFilter += ' AND scanned_at <= $3';
        queryParams.push(end_date);
      }
    } else {
      // Default: last 30 days
      queryParams.push(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    // Total scans in period
    const totalScansQuery = await pool.query(
      `SELECT COUNT(*) as total_scans FROM qr_scans WHERE qr_code_id = $1 ${dateFilter}`,
      queryParams
    );

    // Unique visitors (unique IPs)
    const uniqueVisitorsQuery = await pool.query(
      `SELECT COUNT(DISTINCT ip_address) as unique_visitors FROM qr_scans WHERE qr_code_id = $1 ${dateFilter}`,
      queryParams
    );

    // Today's scans
    const todayScansQuery = await pool.query(
      `SELECT COUNT(*) as today_scans 
       FROM qr_scans 
       WHERE qr_code_id = $1 AND DATE(scanned_at) = CURRENT_DATE`,
      [id]
    );

    // Device breakdown
    const deviceQuery = await pool.query(
      `SELECT 
        device_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY device_type
       ORDER BY count DESC`,
      queryParams
    );

    // OS breakdown
    const osQuery = await pool.query(
      `SELECT 
        os,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY os
       ORDER BY count DESC
       LIMIT 5`,
      queryParams
    );

    // Browser breakdown
    const browserQuery = await pool.query(
      `SELECT 
        browser,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY browser
       ORDER BY count DESC
       LIMIT 5`,
      queryParams
    );

    // Top countries
    const countryQuery = await pool.query(
      `SELECT 
        country,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter} AND country IS NOT NULL
       GROUP BY country
       ORDER BY scans DESC
       LIMIT 10`,
      queryParams
    );

    // Average scans per day
    const avgScansQuery = await pool.query(
      `SELECT 
        ROUND(COUNT(*)::numeric / GREATEST(CURRENT_DATE - MIN(DATE(scanned_at)), 1), 2) as avg_scans_per_day
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}`,
      queryParams
    );

    // Peak hour
    const peakHourQuery = await pool.query(
      `SELECT 
        EXTRACT(HOUR FROM scanned_at) as hour,
        COUNT(*) as scans
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY hour
       ORDER BY scans DESC
       LIMIT 1`,
      queryParams
    );

    res.json({
      success: true,
      qr_code: {
        id: qrCode.id,
        short_code: qrCode.short_code,
        destination_url: qrCode.destination_url,
        title: qrCode.title,
        created_at: qrCode.created_at
      },
      period: {
        start: start_date || queryParams[1],
        end: end_date || new Date().toISOString()
      },
      overview: {
        total_scans: parseInt(totalScansQuery.rows[0].total_scans),
        unique_visitors: parseInt(uniqueVisitorsQuery.rows[0].unique_visitors),
        today_scans: parseInt(todayScansQuery.rows[0].today_scans),
        avg_scans_per_day: parseFloat(avgScansQuery.rows[0].avg_scans_per_day) || 0,
        peak_hour: peakHourQuery.rows[0] ? parseInt(peakHourQuery.rows[0].hour) : null
      },
      devices: deviceQuery.rows.map(row => ({
        device_type: row.device_type || 'unknown',
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })),
      operating_systems: osQuery.rows.map(row => ({
        os: row.os || 'unknown',
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })),
      browsers: browserQuery.rows.map(row => ({
        browser: row.browser || 'unknown',
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })),
      top_countries: countryQuery.rows.map(row => ({
        country: row.country,
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      }))
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

/**
 * GET /qr/:id/analytics/timeline
 * Scans over time (daily/hourly breakdown)
 */
router.get('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, granularity = 'day' } = req.query;

    // Validate granularity
    if (!['hour', 'day', 'week', 'month'].includes(granularity)) {
      return res.status(400).json({
        error: 'Invalid granularity. Use: hour, day, week, or month'
      });
    }

    // Build date filter
    let dateFilter = '';
    const queryParams = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND scanned_at >= $${paramIndex++}`;
      queryParams.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND scanned_at <= $${paramIndex++}`;
      queryParams.push(end_date);
    }

    // Build query based on granularity
    let timeQuery;
    if (granularity === 'hour') {
      timeQuery = `
        SELECT 
          DATE_TRUNC('hour', scanned_at) as timestamp,
          COUNT(*) as scans,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM qr_scans 
        WHERE qr_code_id = $1 ${dateFilter}
        GROUP BY DATE_TRUNC('hour', scanned_at)
        ORDER BY timestamp ASC
      `;
    } else if (granularity === 'day') {
      timeQuery = `
        SELECT 
          DATE(scanned_at) as date,
          COUNT(*) as scans,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM qr_scans 
        WHERE qr_code_id = $1 ${dateFilter}
        GROUP BY DATE(scanned_at)
        ORDER BY date ASC
      `;
    } else if (granularity === 'week') {
      timeQuery = `
        SELECT 
          DATE_TRUNC('week', scanned_at) as week_start,
          COUNT(*) as scans,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM qr_scans 
        WHERE qr_code_id = $1 ${dateFilter}
        GROUP BY DATE_TRUNC('week', scanned_at)
        ORDER BY week_start ASC
      `;
    } else { // month
      timeQuery = `
        SELECT 
          DATE_TRUNC('month', scanned_at) as month_start,
          COUNT(*) as scans,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM qr_scans 
        WHERE qr_code_id = $1 ${dateFilter}
        GROUP BY DATE_TRUNC('month', scanned_at)
        ORDER BY month_start ASC
      `;
    }

    const result = await pool.query(timeQuery, queryParams);

    res.json({
      success: true,
      granularity,
      data: result.rows.map(row => ({
        timestamp: row.date || row.timestamp || row.week_start || row.month_start,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors)
      }))
    });

  } catch (error) {
    console.error('Timeline analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch timeline data',
      message: error.message
    });
  }
});

/**
 * GET /qr/:id/analytics/geo
 * Geographic breakdown of scans
 */
router.get('/:id/geo', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Build date filter
    let dateFilter = '';
    const queryParams = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND scanned_at >= $${paramIndex++}`;
      queryParams.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND scanned_at <= $${paramIndex++}`;
      queryParams.push(end_date);
    }

    // Country stats
    const countryQuery = await pool.query(
      `SELECT 
        country,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter} AND country IS NOT NULL
       GROUP BY country
       ORDER BY scans DESC`,
      queryParams
    );

    // City stats (top 20)
    const cityQuery = await pool.query(
      `SELECT 
        country,
        city,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter} AND city IS NOT NULL
       GROUP BY country, city
       ORDER BY scans DESC
       LIMIT 20`,
      queryParams
    );

    res.json({
      success: true,
      countries: countryQuery.rows.map(row => ({
        country: row.country,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors),
        percentage: parseFloat(row.percentage)
      })),
      cities: cityQuery.rows.map(row => ({
        country: row.country,
        city: row.city,
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      }))
    });

  } catch (error) {
    console.error('Geo analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch geographic data',
      message: error.message
    });
  }
});

/**
 * GET /qr/:id/analytics/devices
 * Detailed device, OS, and browser statistics
 */
router.get('/:id/devices', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Build date filter
    let dateFilter = '';
    const queryParams = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND scanned_at >= $${paramIndex++}`;
      queryParams.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND scanned_at <= $${paramIndex++}`;
      queryParams.push(end_date);
    }

    // Device types
    const deviceQuery = await pool.query(
      `SELECT 
        device_type,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY device_type
       ORDER BY scans DESC`,
      queryParams
    );

    // Operating systems
    const osQuery = await pool.query(
      `SELECT 
        os,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY os
       ORDER BY scans DESC`,
      queryParams
    );

    // Browsers
    const browserQuery = await pool.query(
      `SELECT 
        browser,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY browser
       ORDER BY scans DESC`,
      queryParams
    );

    // Device + OS combinations (insights)
    const combinationQuery = await pool.query(
      `SELECT 
        device_type,
        os,
        COUNT(*) as scans
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY device_type, os
       ORDER BY scans DESC
       LIMIT 10`,
      queryParams
    );

    res.json({
      success: true,
      devices: deviceQuery.rows.map(row => ({
        device_type: row.device_type || 'unknown',
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors),
        percentage: parseFloat(row.percentage)
      })),
      operating_systems: osQuery.rows.map(row => ({
        os: row.os || 'unknown',
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      })),
      browsers: browserQuery.rows.map(row => ({
        browser: row.browser || 'unknown',
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      })),
      top_combinations: combinationQuery.rows.map(row => ({
        device: row.device_type || 'unknown',
        os: row.os || 'unknown',
        scans: parseInt(row.scans)
      }))
    });

  } catch (error) {
    console.error('Device analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch device data',
      message: error.message
    });
  }
});

/**
 * GET /qr/:id/analytics/export
 * Export analytics data as CSV or JSON
 */
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'csv', start_date, end_date } = req.query;

    // Build date filter
    let dateFilter = '';
    const queryParams = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND scanned_at >= $${paramIndex++}`;
      queryParams.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND scanned_at <= $${paramIndex++}`;
      queryParams.push(end_date);
    }

    // Fetch all scan data
    const scansQuery = await pool.query(
      `SELECT 
        scanned_at,
        ip_address,
        device_type,
        os,
        browser,
        country,
        city,
        referer,
        utm_source,
        utm_medium,
        utm_campaign
       FROM qr_scans 
       WHERE qr_code_id = $1 ${dateFilter}
       ORDER BY scanned_at DESC`,
      queryParams
    );

    if (format === 'json') {
      res.json({
        success: true,
        count: scansQuery.rows.length,
        data: scansQuery.rows
      });
    } else if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Timestamp', 'IP Address', 'Device', 'OS', 'Browser', 
        'Country', 'City', 'Referer', 'UTM Source', 'UTM Medium', 'UTM Campaign'
      ];
      
      let csv = headers.join(',') + '\n';
      
      scansQuery.rows.forEach(row => {
        csv += [
          row.scanned_at,
          row.ip_address,
          row.device_type || '',
          row.os || '',
          row.browser || '',
          row.country || '',
          row.city || '',
          row.referer || '',
          row.utm_source || '',
          row.utm_medium || '',
          row.utm_campaign || ''
        ].map(field => `"${field}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="qr-analytics-${id}.csv"`);
      res.send(csv);
    } else {
      res.status(400).json({
        error: 'Invalid format. Use: csv or json'
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      error: 'Failed to export data',
      message: error.message
    });
  }
});

module.exports = router;
