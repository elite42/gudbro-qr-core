const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Enterprise Features Routes
 * Week 7: White-Label, Rate Limiting, Audit Logs
 */

// ================================================================
// WHITE-LABEL BRANDING
// ================================================================

/**
 * GET /enterprise/branding/:organization_id
 * Get organization branding
 */
router.get('/branding/:organization_id', async (req, res) => {
  try {
    const { organization_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM organization_branding WHERE organization_id = $1',
      [organization_id]
    );

    if (result.rows.length === 0) {
      // Return default branding
      return res.json({
        success: true,
        branding: {
          organization_id,
          primary_color: '#4A90E2',
          secondary_color: '#E74C3C',
          accent_color: '#2ECC71',
          settings: {}
        }
      });
    }

    res.json({
      success: true,
      branding: result.rows[0]
    });
  } catch (error) {
    console.error('Get branding error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /enterprise/branding/:organization_id
 * Update organization branding
 */
router.put('/branding/:organization_id', async (req, res) => {
  try {
    const { organization_id } = req.params;
    const updates = [];
    const params = [organization_id];
    let paramIndex = 2;

    const allowedFields = [
      'logo_url', 'logo_dark_url', 'favicon_url',
      'primary_color', 'secondary_color', 'accent_color',
      'custom_domain', 'custom_domain_verified',
      'email_from_name', 'email_from_address', 'email_header_color', 'email_footer_text',
      'custom_css', 'custom_js',
      'meta_title', 'meta_description', 'meta_keywords',
      'og_image_url', 'twitter_handle',
      'settings'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        if (field === 'settings' && typeof value === 'object') {
          value = JSON.stringify(value);
        }

        updates.push(`${field} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Upsert
    const checkResult = await pool.query(
      'SELECT id FROM organization_branding WHERE organization_id = $1',
      [organization_id]
    );

    let result;
    if (checkResult.rows.length === 0) {
      // Insert
      const insertFields = allowedFields.filter(f => req.body[f] !== undefined);
      const insertValues = insertFields.map(f => {
        if (f === 'settings' && typeof req.body[f] === 'object') {
          return JSON.stringify(req.body[f]);
        }
        return req.body[f];
      });

      result = await pool.query(
        `INSERT INTO organization_branding (organization_id, ${insertFields.join(', ')})
         VALUES ($1, ${insertFields.map((_, i) => `$${i + 2}`).join(', ')})
         RETURNING *`,
        [organization_id, ...insertValues]
      );
    } else {
      // Update
      result = await pool.query(
        `UPDATE organization_branding SET ${updates.join(', ')}
         WHERE organization_id = $1
         RETURNING *`,
        params
      );
    }

    res.json({ success: true, branding: result.rows[0] });
  } catch (error) {
    console.error('Update branding error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /enterprise/branding/:organization_id/verify-domain
 * Verify custom domain
 */
router.post('/branding/:organization_id/verify-domain', async (req, res) => {
  try {
    const { organization_id } = req.params;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'domain is required' });
    }

    // In production, this would:
    // 1. Check DNS records (TXT record verification)
    // 2. Verify SSL certificate
    // 3. Check domain accessibility

    // For now, we'll simulate verification
    const result = await pool.query(
      `UPDATE organization_branding
       SET custom_domain = $2,
           custom_domain_verified = TRUE,
           custom_domain_verified_at = CURRENT_TIMESTAMP
       WHERE organization_id = $1
       RETURNING *`,
      [organization_id, domain]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Branding not found' });
    }

    res.json({
      success: true,
      branding: result.rows[0],
      message: 'Domain verified successfully'
    });
  } catch (error) {
    console.error('Verify domain error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// API RATE LIMITING MANAGEMENT
// ================================================================

/**
 * POST /enterprise/rate-limits
 * Create or update rate limit
 */
router.post('/rate-limits', async (req, res) => {
  try {
    const {
      identifier_type,
      identifier_value,
      endpoint,
      max_requests,
      window_seconds,
      tier
    } = req.body;

    if (!identifier_type || !identifier_value || !endpoint || !max_requests || !window_seconds) {
      return res.status(400).json({
        error: 'identifier_type, identifier_value, endpoint, max_requests, and window_seconds are required'
      });
    }

    // Upsert
    const result = await pool.query(
      `INSERT INTO api_rate_limits (
        identifier_type, identifier_value, endpoint,
        max_requests, window_seconds, tier
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (identifier_type, identifier_value, endpoint)
      DO UPDATE SET
        max_requests = $4,
        window_seconds = $5,
        tier = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [identifier_type, identifier_value, endpoint, max_requests, window_seconds, tier]
    );

    res.status(201).json({
      success: true,
      rate_limit: result.rows[0]
    });
  } catch (error) {
    console.error('Create rate limit error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /enterprise/rate-limits
 * List rate limits
 */
router.get('/rate-limits', async (req, res) => {
  try {
    const { identifier_type, identifier_value, endpoint } = req.query;

    let query = 'SELECT * FROM v_rate_limit_status WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (identifier_type) {
      query += ` AND identifier_type = $${paramIndex++}`;
      params.push(identifier_type);
    }
    if (identifier_value) {
      query += ` AND identifier_value = $${paramIndex++}`;
      params.push(identifier_value);
    }
    if (endpoint) {
      query += ` AND endpoint = $${paramIndex++}`;
      params.push(endpoint);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      rate_limits: result.rows
    });
  } catch (error) {
    console.error('List rate limits error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /enterprise/rate-limits/check
 * Check rate limit (used by middleware)
 */
router.post('/rate-limits/check', async (req, res) => {
  try {
    const { identifier_type, identifier_value, endpoint } = req.body;

    if (!identifier_type || !identifier_value || !endpoint) {
      return res.status(400).json({
        error: 'identifier_type, identifier_value, and endpoint are required'
      });
    }

    const result = await pool.query(
      'SELECT check_rate_limit($1, $2, $3) as is_allowed',
      [identifier_type, identifier_value, endpoint]
    );

    const isAllowed = result.rows[0].is_allowed;

    res.json({
      success: true,
      is_allowed: isAllowed
    });
  } catch (error) {
    console.error('Check rate limit error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /enterprise/rate-limits/logs
 * Get rate limit logs
 */
router.get('/rate-limits/logs', async (req, res) => {
  try {
    const { identifier_type, identifier_value, endpoint, was_allowed, limit = 100 } = req.query;

    let query = 'SELECT * FROM rate_limit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (identifier_type) {
      query += ` AND identifier_type = $${paramIndex++}`;
      params.push(identifier_type);
    }
    if (identifier_value) {
      query += ` AND identifier_value = $${paramIndex++}`;
      params.push(identifier_value);
    }
    if (endpoint) {
      query += ` AND endpoint = $${paramIndex++}`;
      params.push(endpoint);
    }
    if (was_allowed !== undefined) {
      query += ` AND was_allowed = $${paramIndex++}`;
      params.push(was_allowed === 'true');
    }

    query += ` ORDER BY logged_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Get rate limit logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /enterprise/rate-limits/:id
 * Delete rate limit
 */
router.delete('/rate-limits/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM api_rate_limits WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rate limit not found' });
    }

    res.json({ success: true, message: 'Rate limit deleted successfully' });
  } catch (error) {
    console.error('Delete rate limit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// AUDIT LOGS
// ================================================================

/**
 * POST /enterprise/audit-logs
 * Create audit log entry
 */
router.post('/audit-logs', async (req, res) => {
  try {
    const {
      organization_id,
      user_id,
      action,
      resource_type,
      resource_id,
      old_values = null,
      new_values = null,
      ip_address,
      user_agent,
      endpoint,
      method,
      status_code
    } = req.body;

    if (!action || !resource_type) {
      return res.status(400).json({
        error: 'action and resource_type are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO audit_logs (
        organization_id, user_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent, endpoint, method, status_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        ip_address,
        user_agent,
        endpoint,
        method,
        status_code
      ]
    );

    res.status(201).json({
      success: true,
      audit_log: result.rows[0]
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /enterprise/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const {
      organization_id,
      user_id,
      action,
      resource_type,
      start_date,
      end_date,
      limit = 100
    } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (organization_id) {
      query += ` AND organization_id = $${paramIndex++}`;
      params.push(organization_id);
    }
    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    if (resource_type) {
      query += ` AND resource_type = $${paramIndex++}`;
      params.push(resource_type);
    }
    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      audit_logs: result.rows
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /enterprise/audit-logs/export
 * Export audit logs as CSV
 */
router.get('/audit-logs/export', async (req, res) => {
  try {
    const { organization_id, start_date, end_date } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (organization_id) {
      query += ` AND organization_id = $${paramIndex++}`;
      params.push(organization_id);
    }
    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Convert to CSV (simplified)
    const headers = [
      'ID', 'Organization ID', 'User ID', 'Action', 'Resource Type',
      'Resource ID', 'IP Address', 'Timestamp'
    ].join(',');

    const rows = result.rows.map(log => {
      return [
        log.id,
        log.organization_id || '',
        log.user_id || '',
        log.action,
        log.resource_type,
        log.resource_id || '',
        log.ip_address || '',
        log.created_at
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
