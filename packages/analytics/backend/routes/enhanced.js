const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Enhanced Analytics Routes
 * Week 4: Referrer Breakdown, Scan Velocity, Performance Scores, Multi-QR Comparison
 */

// ================================================================
// REFERRER ANALYTICS
// ================================================================

/**
 * GET /enhanced/referrers/:id
 * Get detailed referrer breakdown for a QR code
 */
router.get('/referrers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, limit = 20 } = req.query;

    let dateFilter = '';
    const params = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND scanned_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND scanned_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Referrer domains
    const domainsResult = await pool.query(
      `SELECT
        referer_domain,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage,
        MIN(scanned_at) as first_scan,
        MAX(scanned_at) as last_scan
       FROM qr_scans
       WHERE qr_code_id = $1 ${dateFilter} AND referer_domain IS NOT NULL
       GROUP BY referer_domain
       ORDER BY scans DESC
       LIMIT $${paramIndex}`,
      [...params, limit]
    );

    // Direct vs Referral split
    const splitResult = await pool.query(
      `SELECT
        CASE WHEN referer IS NULL OR referer = '' THEN 'direct' ELSE 'referral' END as type,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans
       WHERE qr_code_id = $1 ${dateFilter}
       GROUP BY type`,
      params
    );

    // UTM parameters breakdown
    const utmResult = await pool.query(
      `SELECT
        utm_source,
        utm_medium,
        utm_campaign,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_visitors
       FROM qr_scans
       WHERE qr_code_id = $1 ${dateFilter}
         AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
       GROUP BY utm_source, utm_medium, utm_campaign
       ORDER BY scans DESC
       LIMIT 10`,
      params
    );

    res.json({
      success: true,
      top_referrers: domainsResult.rows.map(row => ({
        domain: row.referer_domain,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors),
        percentage: parseFloat(row.percentage),
        first_scan: row.first_scan,
        last_scan: row.last_scan
      })),
      traffic_split: splitResult.rows.map(row => ({
        type: row.type,
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      })),
      utm_breakdown: utmResult.rows.map(row => ({
        source: row.utm_source,
        medium: row.utm_medium,
        campaign: row.utm_campaign,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors)
      }))
    });
  } catch (error) {
    console.error('Referrer analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch referrer analytics',
      message: error.message
    });
  }
});

// ================================================================
// SCAN VELOCITY & TRENDS
// ================================================================

/**
 * GET /enhanced/velocity/:id
 * Get scan velocity and trends for a QR code
 */
router.get('/velocity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;

    // Calculate time windows
    let hoursBack = 24;
    if (period === '7d') hoursBack = 24 * 7;
    else if (period === '30d') hoursBack = 24 * 30;

    // Hourly velocity for the period
    const hourlyResult = await pool.query(
      `SELECT
        DATE_TRUNC('hour', scanned_at) as hour,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        ROUND(COUNT(*)::numeric / 1, 2) as scans_per_hour
       FROM qr_scans
       WHERE qr_code_id = $1
         AND scanned_at >= NOW() - INTERVAL '${hoursBack} hours'
       GROUP BY DATE_TRUNC('hour', scanned_at)
       ORDER BY hour ASC`,
      [id]
    );

    // Peak hours
    const peakHoursResult = await pool.query(
      `SELECT
        EXTRACT(HOUR FROM scanned_at)::integer as hour,
        COUNT(*) as scans,
        ROUND(AVG(COUNT(*)) OVER(), 2) as avg_scans
       FROM qr_scans
       WHERE qr_code_id = $1
         AND scanned_at >= NOW() - INTERVAL '30 days'
       GROUP BY EXTRACT(HOUR FROM scanned_at)
       ORDER BY scans DESC
       LIMIT 5`,
      [id]
    );

    // Day of week patterns
    const dowResult = await pool.query(
      `SELECT
        TO_CHAR(scanned_at, 'Day') as day_name,
        EXTRACT(DOW FROM scanned_at)::integer as day_number,
        COUNT(*) as scans,
        ROUND(AVG(COUNT(*)) OVER(), 2) as avg_scans
       FROM qr_scans
       WHERE qr_code_id = $1
         AND scanned_at >= NOW() - INTERVAL '30 days'
       GROUP BY day_name, day_number
       ORDER BY day_number`,
      [id]
    );

    // Growth trend (week over week)
    const trendResult = await pool.query(
      `WITH weekly_scans AS (
        SELECT
          DATE_TRUNC('week', scanned_at) as week,
          COUNT(*) as scans
        FROM qr_scans
        WHERE qr_code_id = $1
          AND scanned_at >= NOW() - INTERVAL '8 weeks'
        GROUP BY week
        ORDER BY week DESC
      )
      SELECT
        week,
        scans,
        LAG(scans) OVER (ORDER BY week) as previous_week_scans,
        ROUND(
          ((scans - LAG(scans) OVER (ORDER BY week))::numeric /
          NULLIF(LAG(scans) OVER (ORDER BY week), 0)) * 100,
          2
        ) as growth_percentage
      FROM weekly_scans
      ORDER BY week DESC
      LIMIT 4`,
      [id]
    );

    // Calculate current velocity
    const currentVelocity = await pool.query(
      `SELECT
        COUNT(*) as scans_last_hour,
        ROUND(COUNT(*)::numeric * 24, 2) as projected_daily
       FROM qr_scans
       WHERE qr_code_id = $1
         AND scanned_at >= NOW() - INTERVAL '1 hour'`,
      [id]
    );

    res.json({
      success: true,
      current_velocity: {
        scans_last_hour: parseInt(currentVelocity.rows[0].scans_last_hour),
        projected_daily: parseFloat(currentVelocity.rows[0].projected_daily)
      },
      hourly_data: hourlyResult.rows.map(row => ({
        hour: row.hour,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors),
        scans_per_hour: parseFloat(row.scans_per_hour)
      })),
      peak_hours: peakHoursResult.rows.map(row => ({
        hour: row.hour,
        scans: parseInt(row.scans),
        avg_scans: parseFloat(row.avg_scans)
      })),
      day_of_week_pattern: dowResult.rows.map(row => ({
        day_name: row.day_name.trim(),
        day_number: row.day_number,
        scans: parseInt(row.scans),
        avg_scans: parseFloat(row.avg_scans)
      })),
      weekly_trend: trendResult.rows.map(row => ({
        week: row.week,
        scans: parseInt(row.scans),
        previous_week_scans: row.previous_week_scans ? parseInt(row.previous_week_scans) : null,
        growth_percentage: row.growth_percentage ? parseFloat(row.growth_percentage) : null
      }))
    });
  } catch (error) {
    console.error('Velocity analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch velocity analytics',
      message: error.message
    });
  }
});

// ================================================================
// PERFORMANCE SCORES
// ================================================================

/**
 * GET /enhanced/performance/:id
 * Get performance score and breakdown for a QR code
 */
router.get('/performance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Calculate period dates
    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    const periodEnd = new Date();

    // Calculate performance score using the database function
    const scoreResult = await pool.query(
      `SELECT calculate_performance_score($1, $2, $3) as score`,
      [id, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
    );

    // Get detailed metrics for score breakdown
    const metricsResult = await pool.query(
      `SELECT
        COUNT(*) as total_scans,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(scanned_at)) as active_days,
        COUNT(DISTINCT country) as countries_reached,
        COUNT(DISTINCT device_type) as device_types,
        ROUND(COUNT(*)::numeric / GREATEST(COUNT(DISTINCT DATE(scanned_at)), 1), 2) as avg_scans_per_day,
        ROUND(COUNT(DISTINCT ip_address)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as engagement_rate
       FROM qr_scans
       WHERE qr_code_id = $1
         AND scanned_at >= $2`,
      [id, periodStart]
    );

    const metrics = metricsResult.rows[0];

    // Score breakdown
    const volumeScore = Math.min(40, (parseInt(metrics.total_scans) / 100) * 40);
    const engagementScore = metrics.total_scans > 0 ?
      (parseInt(metrics.unique_visitors) / parseInt(metrics.total_scans)) * 30 : 0;
    const consistencyScore = Math.min(15, (parseInt(metrics.active_days) / days) * 15);
    const reachScore = Math.min(7.5, parseInt(metrics.countries_reached) * 1.5) +
                      Math.min(7.5, parseInt(metrics.device_types) * 2.5);

    res.json({
      success: true,
      performance_score: parseFloat(scoreResult.rows[0].score) || 0,
      score_breakdown: {
        volume: {
          score: Math.round(volumeScore * 100) / 100,
          max: 40,
          percentage: Math.round((volumeScore / 40) * 100)
        },
        engagement: {
          score: Math.round(engagementScore * 100) / 100,
          max: 30,
          percentage: Math.round((engagementScore / 30) * 100)
        },
        consistency: {
          score: Math.round(consistencyScore * 100) / 100,
          max: 15,
          percentage: Math.round((consistencyScore / 15) * 100)
        },
        reach: {
          score: Math.round(reachScore * 100) / 100,
          max: 15,
          percentage: Math.round((reachScore / 15) * 100)
        }
      },
      metrics: {
        total_scans: parseInt(metrics.total_scans),
        unique_visitors: parseInt(metrics.unique_visitors),
        active_days: parseInt(metrics.active_days),
        countries_reached: parseInt(metrics.countries_reached),
        device_types: parseInt(metrics.device_types),
        avg_scans_per_day: parseFloat(metrics.avg_scans_per_day),
        engagement_rate: parseFloat(metrics.engagement_rate)
      },
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        days
      }
    });
  } catch (error) {
    console.error('Performance score error:', error);
    res.status(500).json({
      error: 'Failed to calculate performance score',
      message: error.message
    });
  }
});

// ================================================================
// MULTI-QR COMPARISON
// ================================================================

/**
 * POST /enhanced/compare
 * Compare multiple QR codes side-by-side
 *
 * Body: { "qr_code_ids": ["id1", "id2", ...], "start_date": "2025-01-01", "end_date": "2025-01-31" }
 */
router.post('/compare', async (req, res) => {
  try {
    const { qr_code_ids, start_date, end_date } = req.body;

    if (!Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
      return res.status(400).json({ error: 'qr_code_ids must be a non-empty array' });
    }

    if (qr_code_ids.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 QR codes can be compared at once' });
    }

    // Build date filter
    let dateFilter = '';
    const params = [qr_code_ids];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND s.scanned_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND s.scanned_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Get basic info for all QR codes
    const qrInfoResult = await pool.query(
      `SELECT id, short_code, destination_url, title, created_at
       FROM qr_codes
       WHERE id = ANY($1)`,
      [qr_code_ids]
    );

    // Get metrics for each QR code
    const metricsResult = await pool.query(
      `SELECT
        q.id,
        q.short_code,
        q.title,
        COUNT(s.id) as total_scans,
        COUNT(DISTINCT s.ip_address) as unique_visitors,
        COUNT(DISTINCT s.country) as countries,
        COUNT(DISTINCT DATE(s.scanned_at)) as active_days,
        ROUND(AVG(EXTRACT(EPOCH FROM (s.scanned_at - q.created_at)) / 86400), 2) as avg_days_to_scan
       FROM qr_codes q
       LEFT JOIN qr_scans s ON s.qr_code_id = q.id ${dateFilter.replace('s.scanned_at', 's.scanned_at')}
       WHERE q.id = ANY($1)
       GROUP BY q.id, q.short_code, q.title
       ORDER BY total_scans DESC`,
      params
    );

    // Get timeline comparison (daily scans for each QR)
    const timelineResult = await pool.query(
      `SELECT
        q.id as qr_code_id,
        DATE(s.scanned_at) as date,
        COUNT(*) as scans
       FROM qr_codes q
       LEFT JOIN qr_scans s ON s.qr_code_id = q.id
       WHERE q.id = ANY($1) ${dateFilter}
       GROUP BY q.id, DATE(s.scanned_at)
       ORDER BY date ASC`,
      params
    );

    // Get device breakdown for each
    const deviceResult = await pool.query(
      `SELECT
        q.id as qr_code_id,
        s.device_type,
        COUNT(*) as scans
       FROM qr_codes q
       LEFT JOIN qr_scans s ON s.qr_code_id = q.id
       WHERE q.id = ANY($1) ${dateFilter}
       GROUP BY q.id, s.device_type
       ORDER BY q.id, scans DESC`,
      params
    );

    // Organize data by QR code
    const comparison = qr_code_ids.map(qrId => {
      const info = qrInfoResult.rows.find(r => r.id === qrId) || {};
      const metrics = metricsResult.rows.find(r => r.id === qrId) || {};
      const timeline = timelineResult.rows.filter(r => r.qr_code_id === qrId);
      const devices = deviceResult.rows.filter(r => r.qr_code_id === qrId);

      return {
        id: qrId,
        short_code: info.short_code,
        title: info.title,
        destination_url: info.destination_url,
        created_at: info.created_at,
        metrics: {
          total_scans: parseInt(metrics.total_scans) || 0,
          unique_visitors: parseInt(metrics.unique_visitors) || 0,
          countries: parseInt(metrics.countries) || 0,
          active_days: parseInt(metrics.active_days) || 0,
          avg_days_to_scan: parseFloat(metrics.avg_days_to_scan) || 0
        },
        timeline: timeline.map(t => ({
          date: t.date,
          scans: parseInt(t.scans)
        })),
        devices: devices.map(d => ({
          device_type: d.device_type || 'unknown',
          scans: parseInt(d.scans)
        }))
      };
    });

    // Calculate rankings
    const rankings = {
      by_total_scans: [...comparison].sort((a, b) => b.metrics.total_scans - a.metrics.total_scans),
      by_unique_visitors: [...comparison].sort((a, b) => b.metrics.unique_visitors - a.metrics.unique_visitors),
      by_countries: [...comparison].sort((a, b) => b.metrics.countries - a.metrics.countries)
    };

    res.json({
      success: true,
      period: {
        start: start_date || 'all time',
        end: end_date || 'now'
      },
      comparison,
      rankings: {
        by_total_scans: rankings.by_total_scans.map((qr, index) => ({
          rank: index + 1,
          id: qr.id,
          short_code: qr.short_code,
          total_scans: qr.metrics.total_scans
        })),
        by_unique_visitors: rankings.by_unique_visitors.map((qr, index) => ({
          rank: index + 1,
          id: qr.id,
          short_code: qr.short_code,
          unique_visitors: qr.metrics.unique_visitors
        })),
        by_countries: rankings.by_countries.map((qr, index) => ({
          rank: index + 1,
          id: qr.id,
          short_code: qr.short_code,
          countries: qr.metrics.countries
        }))
      }
    });
  } catch (error) {
    console.error('QR comparison error:', error);
    res.status(500).json({
      error: 'Failed to compare QR codes',
      message: error.message
    });
  }
});

module.exports = router;
