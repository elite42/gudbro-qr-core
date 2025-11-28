const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Visualization Routes
 * Week 6: Heatmaps & Chart Exports
 */

// ================================================================
// HEATMAP GENERATION
// ================================================================

/**
 * GET /visualizations/heatmap/geographic/:qr_code_id
 * Generate geographic heatmap data
 */
router.get('/heatmap/geographic/:qr_code_id', async (req, res) => {
  try {
    const { qr_code_id } = req.params;
    const {
      start_date = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0],
      use_cache = 'true'
    } = req.query;

    // Check cache first
    if (use_cache === 'true') {
      const cacheResult = await pool.query(
        `SELECT data, calculated_at FROM heatmap_data
         WHERE qr_code_id = $1
           AND heatmap_type = 'geographic'
           AND period_start = $2
           AND period_end = $3
           AND calculated_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'`,
        [qr_code_id, start_date, end_date]
      );

      if (cacheResult.rows.length > 0) {
        return res.json({
          success: true,
          heatmap: cacheResult.rows[0].data,
          cached: true,
          calculated_at: cacheResult.rows[0].calculated_at
        });
      }
    }

    // Calculate fresh data using database function
    const result = await pool.query(
      'SELECT calculate_geographic_heatmap($1, $2, $3) as heatmap_data',
      [qr_code_id, start_date, end_date]
    );

    const heatmapData = result.rows[0].heatmap_data;

    // Cache the result
    await pool.query(
      `INSERT INTO heatmap_data (
        qr_code_id, heatmap_type, period_start, period_end, data, max_value, data_points_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (qr_code_id, heatmap_type, period_start, period_end)
      DO UPDATE SET data = $5, max_value = $6, data_points_count = $7, calculated_at = CURRENT_TIMESTAMP`,
      [
        qr_code_id,
        'geographic',
        start_date,
        end_date,
        heatmapData,
        heatmapData?.max_value || 0,
        heatmapData?.points ? heatmapData.points.length : 0
      ]
    );

    res.json({
      success: true,
      heatmap: heatmapData,
      cached: false,
      calculated_at: new Date()
    });
  } catch (error) {
    console.error('Geographic heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/heatmap/time/:qr_code_id
 * Generate time-based heatmap (day of week x hour)
 */
router.get('/heatmap/time/:qr_code_id', async (req, res) => {
  try {
    const { qr_code_id } = req.params;
    const {
      start_date = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0],
      use_cache = 'true'
    } = req.query;

    // Check cache
    if (use_cache === 'true') {
      const cacheResult = await pool.query(
        `SELECT data, calculated_at FROM heatmap_data
         WHERE qr_code_id = $1
           AND heatmap_type = 'time_based'
           AND period_start = $2
           AND period_end = $3
           AND calculated_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'`,
        [qr_code_id, start_date, end_date]
      );

      if (cacheResult.rows.length > 0) {
        return res.json({
          success: true,
          heatmap: cacheResult.rows[0].data,
          cached: true,
          calculated_at: cacheResult.rows[0].calculated_at
        });
      }
    }

    // Calculate fresh data
    const result = await pool.query(
      'SELECT calculate_time_heatmap($1, $2, $3) as heatmap_data',
      [qr_code_id, start_date, end_date]
    );

    const heatmapData = result.rows[0].heatmap_data;

    // Cache the result
    await pool.query(
      `INSERT INTO heatmap_data (
        qr_code_id, heatmap_type, period_start, period_end, data, max_value, data_points_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (qr_code_id, heatmap_type, period_start, period_end)
      DO UPDATE SET data = $5, max_value = $6, data_points_count = $7, calculated_at = CURRENT_TIMESTAMP`,
      [
        qr_code_id,
        'time_based',
        start_date,
        end_date,
        heatmapData,
        heatmapData?.max_value || 0,
        heatmapData?.grid ? heatmapData.grid.length : 0
      ]
    );

    res.json({
      success: true,
      heatmap: heatmapData,
      cached: false,
      calculated_at: new Date()
    });
  } catch (error) {
    console.error('Time heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/heatmap/device-browser/:qr_code_id
 * Generate device x browser heatmap matrix
 */
router.get('/heatmap/device-browser/:qr_code_id', async (req, res) => {
  try {
    const { qr_code_id } = req.params;
    const {
      start_date = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    // Calculate device x browser matrix
    const result = await pool.query(
      `SELECT
        device_type,
        browser,
        COUNT(*) as scan_count
       FROM qr_scans
       WHERE qr_code_id = $1
         AND DATE(scanned_at) BETWEEN $2 AND $3
         AND device_type IS NOT NULL
         AND browser IS NOT NULL
       GROUP BY device_type, browser
       ORDER BY scan_count DESC`,
      [qr_code_id, start_date, end_date]
    );

    // Get unique devices and browsers
    const devices = [...new Set(result.rows.map(r => r.device_type))];
    const browsers = [...new Set(result.rows.map(r => r.browser))];

    // Build matrix
    const matrix = {};
    let maxValue = 0;

    result.rows.forEach(row => {
      const key = `${row.device_type}|${row.browser}`;
      const value = parseInt(row.scan_count);
      matrix[key] = value;
      if (value > maxValue) maxValue = value;
    });

    const heatmapData = {
      type: 'device_browser',
      devices,
      browsers,
      matrix,
      max_value: maxValue,
      data: result.rows
    };

    res.json({
      success: true,
      heatmap: heatmapData
    });
  } catch (error) {
    console.error('Device-browser heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/heatmap/conversion-flow/:funnel_id
 * Generate conversion funnel flow heatmap
 */
router.get('/heatmap/conversion-flow/:funnel_id', async (req, res) => {
  try {
    const { funnel_id } = req.params;
    const {
      start_date = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0]
    } = req.query;

    // Get funnel steps
    const funnelResult = await pool.query(
      'SELECT steps FROM conversion_funnels WHERE id = $1',
      [funnel_id]
    );

    if (funnelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    const steps = funnelResult.rows[0].steps;

    // Calculate transitions between steps
    const transitionsResult = await pool.query(
      `SELECT
        current_step,
        COUNT(*) as session_count,
        COUNT(CASE WHEN is_completed THEN 1 END) as completed_count
       FROM funnel_sessions
       WHERE funnel_id = $1
         AND DATE(started_at) BETWEEN $2 AND $3
       GROUP BY current_step
       ORDER BY current_step`,
      [funnel_id, start_date, end_date]
    );

    const flowData = {
      type: 'conversion_flow',
      steps: steps,
      transitions: transitionsResult.rows,
      total_sessions: transitionsResult.rows.reduce((sum, r) => sum + parseInt(r.session_count), 0)
    };

    res.json({
      success: true,
      heatmap: flowData
    });
  } catch (error) {
    console.error('Conversion flow heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// CHART TEMPLATES
// ================================================================

/**
 * POST /visualizations/charts/templates
 * Create chart template
 */
router.post('/charts/templates', async (req, res) => {
  try {
    const {
      user_id,
      name,
      description,
      chart_type,
      config,
      style = {},
      default_format = 'png',
      default_size = { width: 800, height: 600 }
    } = req.body;

    if (!name || !chart_type || !config) {
      return res.status(400).json({
        error: 'name, chart_type, and config are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO chart_templates (
        user_id, name, description, chart_type, config, style, default_format, default_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        user_id,
        name,
        description,
        chart_type,
        JSON.stringify(config),
        JSON.stringify(style),
        default_format,
        JSON.stringify(default_size)
      ]
    );

    res.status(201).json({
      success: true,
      template: result.rows[0]
    });
  } catch (error) {
    console.error('Create chart template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/charts/templates
 * List chart templates
 */
router.get('/charts/templates', async (req, res) => {
  try {
    const { user_id, chart_type, is_favorite } = req.query;

    let query = 'SELECT * FROM chart_templates WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (chart_type) {
      query += ` AND chart_type = $${paramIndex++}`;
      params.push(chart_type);
    }
    if (is_favorite !== undefined) {
      query += ` AND is_favorite = $${paramIndex++}`;
      params.push(is_favorite === 'true');
    }

    query += ' ORDER BY use_count DESC, created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      templates: result.rows
    });
  } catch (error) {
    console.error('List chart templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/charts/templates/:id
 * Get chart template
 */
router.get('/charts/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM chart_templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      success: true,
      template: result.rows[0]
    });
  } catch (error) {
    console.error('Get chart template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /visualizations/charts/templates/:id
 * Update chart template
 */
router.put('/charts/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'chart_type', 'config', 'style',
      'default_format', 'default_size', 'is_favorite'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        // Stringify JSON fields
        if (['config', 'style', 'default_size'].includes(field) && typeof value === 'object') {
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

    const result = await pool.query(
      `UPDATE chart_templates SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, template: result.rows[0] });
  } catch (error) {
    console.error('Update chart template error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /visualizations/charts/templates/:id
 * Delete chart template
 */
router.delete('/charts/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM chart_templates WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete chart template error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// CHART EXPORTS
// ================================================================

/**
 * POST /visualizations/charts/export
 * Export chart as PNG/PDF/SVG
 */
router.post('/charts/export', async (req, res) => {
  try {
    const {
      user_id,
      template_id,
      chart_type,
      title,
      format = 'png',
      data_source,
      data_filters = {},
      config,
      width = 800,
      height = 600
    } = req.body;

    if (!chart_type) {
      return res.status(400).json({ error: 'chart_type is required' });
    }

    // Increment template usage if template_id provided
    if (template_id) {
      await pool.query(
        'SELECT increment_chart_template_usage($1)',
        [template_id]
      );
    }

    // In a real implementation, this would:
    // 1. Generate the chart using Chart.js/Puppeteer/QuickChart
    // 2. Save to S3 or local storage
    // 3. Generate signed URL
    // For now, we'll create a record with the export metadata

    const result = await pool.query(
      `INSERT INTO exported_charts (
        user_id, template_id, chart_type, title, format,
        data_source, data_filters, width, height
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id,
        template_id,
        chart_type,
        title,
        format,
        data_source,
        JSON.stringify(data_filters),
        width,
        height
      ]
    );

    // Generate export URL (placeholder)
    const exportId = result.rows[0].id;
    const exportUrl = `/api/exports/charts/${exportId}.${format}`;

    res.status(201).json({
      success: true,
      export: {
        ...result.rows[0],
        file_url: exportUrl
      },
      message: 'Chart export queued. In production, this would generate actual image/PDF.'
    });
  } catch (error) {
    console.error('Export chart error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/charts/exports
 * List exported charts
 */
router.get('/charts/exports', async (req, res) => {
  try {
    const { user_id, template_id, format, limit = 50 } = req.query;

    let query = 'SELECT * FROM exported_charts WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (template_id) {
      query += ` AND template_id = $${paramIndex++}`;
      params.push(template_id);
    }
    if (format) {
      query += ` AND format = $${paramIndex++}`;
      params.push(format);
    }

    query += ` ORDER BY generated_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      exports: result.rows
    });
  } catch (error) {
    console.error('List chart exports error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /visualizations/charts/export/:id
 * Get exported chart details
 */
router.get('/charts/export/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM exported_charts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Export not found' });
    }

    res.json({
      success: true,
      export: result.rows[0]
    });
  } catch (error) {
    console.error('Get chart export error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
