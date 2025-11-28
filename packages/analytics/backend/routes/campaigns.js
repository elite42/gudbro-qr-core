const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Campaign Management Routes
 * Week 4: Enhanced Analytics - Campaign Management
 */

/**
 * POST /campaigns
 * Create a new campaign
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      status = 'draft',
      start_date,
      end_date,
      budget,
      target_scans,
      utm_source,
      utm_medium,
      utm_campaign,
      user_id
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }

    const result = await pool.query(
      `INSERT INTO campaigns (
        user_id, name, description, status, start_date, end_date,
        budget, target_scans, utm_source, utm_medium, utm_campaign
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [user_id, name, description, status, start_date, end_date, budget, target_scans, utm_source, utm_medium, utm_campaign]
    );

    res.status(201).json({
      success: true,
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

/**
 * GET /campaigns
 * List all campaigns for a user
 */
router.get('/', async (req, res) => {
  try {
    const { user_id, status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM campaigns WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      campaigns: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error.message
    });
  }
});

/**
 * GET /campaigns/:id
 * Get campaign details with analytics
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign
    const campaignResult = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Get QR codes in campaign
    const qrCodesResult = await pool.query(
      `SELECT id, short_code, destination_url, title, created_at
       FROM qr_codes
       WHERE campaign_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    // Get campaign performance from view
    const perfResult = await pool.query(
      'SELECT * FROM v_campaign_performance WHERE campaign_id = $1',
      [id]
    );

    res.json({
      success: true,
      campaign: {
        ...campaign,
        qr_codes: qrCodesResult.rows,
        performance: perfResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error.message
    });
  }
});

/**
 * PUT /campaigns/:id
 * Update campaign
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      start_date,
      end_date,
      budget,
      target_scans,
      utm_source,
      utm_medium,
      utm_campaign
    } = req.body;

    const updates = [];
    const params = [id];
    let paramIndex = 2;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      params.push(end_date);
    }
    if (budget !== undefined) {
      updates.push(`budget = $${paramIndex++}`);
      params.push(budget);
    }
    if (target_scans !== undefined) {
      updates.push(`target_scans = $${paramIndex++}`);
      params.push(target_scans);
    }
    if (utm_source !== undefined) {
      updates.push(`utm_source = $${paramIndex++}`);
      params.push(utm_source);
    }
    if (utm_medium !== undefined) {
      updates.push(`utm_medium = $${paramIndex++}`);
      params.push(utm_medium);
    }
    if (utm_campaign !== undefined) {
      updates.push(`utm_campaign = $${paramIndex++}`);
      params.push(utm_campaign);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await pool.query(
      `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      error: 'Failed to update campaign',
      message: error.message
    });
  }
});

/**
 * DELETE /campaigns/:id
 * Delete campaign (sets campaign_id to NULL in QR codes)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
});

/**
 * POST /campaigns/:id/qr-codes
 * Add QR codes to campaign
 */
router.post('/:id/qr-codes', async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_code_ids } = req.body;

    if (!Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
      return res.status(400).json({ error: 'qr_code_ids must be a non-empty array' });
    }

    // Update QR codes
    const result = await pool.query(
      `UPDATE qr_codes
       SET campaign_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2)
       RETURNING id, short_code, title`,
      [id, qr_code_ids]
    );

    res.json({
      success: true,
      updated: result.rows.length,
      qr_codes: result.rows
    });
  } catch (error) {
    console.error('Add QR codes to campaign error:', error);
    res.status(500).json({
      error: 'Failed to add QR codes to campaign',
      message: error.message
    });
  }
});

/**
 * DELETE /campaigns/:id/qr-codes/:qr_code_id
 * Remove QR code from campaign
 */
router.delete('/:id/qr-codes/:qr_code_id', async (req, res) => {
  try {
    const { id, qr_code_id } = req.params;

    const result = await pool.query(
      `UPDATE qr_codes
       SET campaign_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND campaign_id = $2
       RETURNING id`,
      [qr_code_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code not found in campaign' });
    }

    res.json({
      success: true,
      message: 'QR code removed from campaign'
    });
  } catch (error) {
    console.error('Remove QR code from campaign error:', error);
    res.status(500).json({
      error: 'Failed to remove QR code from campaign',
      message: error.message
    });
  }
});

/**
 * GET /campaigns/:id/analytics
 * Get detailed campaign analytics
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Build date filter
    let dateFilter = '';
    const params = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND s.scanned_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND s.scanned_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Overall stats
    const statsResult = await pool.query(
      `SELECT
        COUNT(DISTINCT q.id) as total_qr_codes,
        COUNT(s.id) as total_scans,
        COUNT(DISTINCT s.ip_address) as unique_visitors,
        COUNT(DISTINCT s.country) as countries_reached,
        COUNT(DISTINCT DATE(s.scanned_at)) as active_days
       FROM campaigns c
       LEFT JOIN qr_codes q ON q.campaign_id = c.id
       LEFT JOIN qr_scans s ON s.qr_code_id = q.id
       WHERE c.id = $1 ${dateFilter}
       GROUP BY c.id`,
      params
    );

    // Top performing QR codes
    const topQRResult = await pool.query(
      `SELECT
        q.id,
        q.short_code,
        q.title,
        COUNT(s.id) as scans,
        COUNT(DISTINCT s.ip_address) as unique_visitors
       FROM qr_codes q
       LEFT JOIN qr_scans s ON s.qr_code_id = q.id
       WHERE q.campaign_id = $1 ${dateFilter}
       GROUP BY q.id, q.short_code, q.title
       ORDER BY scans DESC
       LIMIT 10`,
      params
    );

    // Timeline (daily scans)
    const timelineResult = await pool.query(
      `SELECT
        DATE(s.scanned_at) as date,
        COUNT(*) as scans,
        COUNT(DISTINCT s.ip_address) as unique_visitors
       FROM qr_scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.campaign_id = $1 ${dateFilter}
       GROUP BY DATE(s.scanned_at)
       ORDER BY date ASC`,
      params
    );

    // Device breakdown
    const deviceResult = await pool.query(
      `SELECT
        s.device_type,
        COUNT(*) as scans,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
       FROM qr_scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.campaign_id = $1 ${dateFilter}
       GROUP BY s.device_type
       ORDER BY scans DESC`,
      params
    );

    res.json({
      success: true,
      overview: statsResult.rows[0] || {},
      top_qr_codes: topQRResult.rows,
      timeline: timelineResult.rows.map(row => ({
        date: row.date,
        scans: parseInt(row.scans),
        unique_visitors: parseInt(row.unique_visitors)
      })),
      devices: deviceResult.rows.map(row => ({
        device_type: row.device_type || 'unknown',
        scans: parseInt(row.scans),
        percentage: parseFloat(row.percentage)
      }))
    });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign analytics',
      message: error.message
    });
  }
});

module.exports = router;
