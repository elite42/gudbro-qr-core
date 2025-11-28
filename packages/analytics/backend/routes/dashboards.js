const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Dashboard & Filter Management Routes
 * Week 6: Customizable Dashboards & Advanced Filtering
 */

// ================================================================
// DASHBOARD CONFIGURATIONS
// ================================================================

/**
 * POST /dashboards
 * Create dashboard configuration
 */
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      name,
      description,
      is_default = false,
      layout = {},
      widgets = [],
      theme = 'light',
      refresh_interval = 300
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // If setting as default, unset other defaults for this user
    if (is_default && user_id) {
      await pool.query(
        'UPDATE dashboard_configurations SET is_default = FALSE WHERE user_id = $1',
        [user_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO dashboard_configurations (
        user_id, name, description, is_default, layout, widgets, theme, refresh_interval
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        user_id,
        name,
        description,
        is_default,
        JSON.stringify(layout),
        JSON.stringify(widgets),
        theme,
        refresh_interval
      ]
    );

    res.status(201).json({
      success: true,
      dashboard: result.rows[0]
    });
  } catch (error) {
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /dashboards
 * List dashboard configurations
 */
router.get('/', async (req, res) => {
  try {
    const { user_id, is_default, is_template } = req.query;

    let query = 'SELECT * FROM dashboard_configurations WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (is_default !== undefined) {
      query += ` AND is_default = $${paramIndex++}`;
      params.push(is_default === 'true');
    }
    if (is_template !== undefined) {
      query += ` AND is_template = $${paramIndex++}`;
      params.push(is_template === 'true');
    }

    query += ' ORDER BY is_default DESC, last_viewed_at DESC NULLS LAST, created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      dashboards: result.rows
    });
  } catch (error) {
    console.error('List dashboards error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /dashboards/:id
 * Get dashboard configuration
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM dashboard_configurations WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Update last_viewed_at
    await pool.query(
      'UPDATE dashboard_configurations SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      dashboard: result.rows[0]
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /dashboards/:id
 * Update dashboard configuration
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'is_default', 'layout', 'widgets',
      'theme', 'refresh_interval', 'is_public', 'shared_with'
    ];

    // Handle is_default flag
    if (req.body.is_default === true) {
      // Get user_id of this dashboard
      const dashResult = await pool.query(
        'SELECT user_id FROM dashboard_configurations WHERE id = $1',
        [id]
      );

      if (dashResult.rows.length > 0 && dashResult.rows[0].user_id) {
        // Unset other defaults
        await pool.query(
          'UPDATE dashboard_configurations SET is_default = FALSE WHERE user_id = $1 AND id != $2',
          [dashResult.rows[0].user_id, id]
        );
      }
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        // Stringify JSON fields
        if (['layout', 'widgets', 'shared_with'].includes(field) && typeof value === 'object') {
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
      `UPDATE dashboard_configurations SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({ success: true, dashboard: result.rows[0] });
  } catch (error) {
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /dashboards/:id
 * Delete dashboard configuration
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM dashboard_configurations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({ success: true, message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboards/:id/clone
 * Clone dashboard configuration
 */
router.post('/:id/clone', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, name } = req.body;

    // Get original dashboard
    const originalResult = await pool.query(
      'SELECT * FROM dashboard_configurations WHERE id = $1',
      [id]
    );

    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const original = originalResult.rows[0];
    const cloneName = name || `${original.name} (Copy)`;

    // Create clone
    const result = await pool.query(
      `INSERT INTO dashboard_configurations (
        user_id, name, description, layout, widgets, theme, refresh_interval
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        user_id || original.user_id,
        cloneName,
        original.description,
        original.layout,
        original.widgets,
        original.theme,
        original.refresh_interval
      ]
    );

    res.status(201).json({
      success: true,
      dashboard: result.rows[0],
      message: 'Dashboard cloned successfully'
    });
  } catch (error) {
    console.error('Clone dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// FILTER PRESETS
// ================================================================

/**
 * POST /dashboards/filters/presets
 * Create filter preset
 */
router.post('/filters/presets', async (req, res) => {
  try {
    const {
      user_id,
      name,
      description,
      category,
      filters,
      is_favorite = false
    } = req.body;

    if (!name || !filters) {
      return res.status(400).json({
        error: 'name and filters are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO filter_presets (
        user_id, name, description, category, filters, is_favorite
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        user_id,
        name,
        description,
        category,
        JSON.stringify(filters),
        is_favorite
      ]
    );

    res.status(201).json({
      success: true,
      preset: result.rows[0]
    });
  } catch (error) {
    console.error('Create filter preset error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /dashboards/filters/presets
 * List filter presets
 */
router.get('/filters/presets', async (req, res) => {
  try {
    const { user_id, category, is_favorite, is_public } = req.query;

    let query = 'SELECT * FROM filter_presets WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (is_favorite !== undefined) {
      query += ` AND is_favorite = $${paramIndex++}`;
      params.push(is_favorite === 'true');
    }
    if (is_public !== undefined) {
      query += ` AND is_public = $${paramIndex++}`;
      params.push(is_public === 'true');
    }

    query += ' ORDER BY is_favorite DESC, use_count DESC, created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      presets: result.rows
    });
  } catch (error) {
    console.error('List filter presets error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /dashboards/filters/presets/:id
 * Get filter preset and increment usage
 */
router.get('/filters/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM filter_presets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    // Increment usage
    await pool.query(
      'SELECT increment_filter_preset_usage($1)',
      [id]
    );

    res.json({
      success: true,
      preset: result.rows[0]
    });
  } catch (error) {
    console.error('Get filter preset error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /dashboards/filters/presets/:id
 * Update filter preset
 */
router.put('/filters/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'category', 'filters', 'is_favorite', 'is_public', 'shared_with'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        // Stringify JSON fields
        if (['filters', 'shared_with'].includes(field) && typeof value === 'object') {
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
      `UPDATE filter_presets SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json({ success: true, preset: result.rows[0] });
  } catch (error) {
    console.error('Update filter preset error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /dashboards/filters/presets/:id
 * Delete filter preset
 */
router.delete('/filters/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM filter_presets WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json({ success: true, message: 'Preset deleted successfully' });
  } catch (error) {
    console.error('Delete filter preset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// VISUALIZATION SETTINGS
// ================================================================

/**
 * GET /dashboards/settings/:user_id
 * Get user visualization settings
 */
router.get('/settings/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM visualization_settings WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        success: true,
        settings: {
          user_id,
          preferred_chart_library: 'chartjs',
          default_color_scheme: 'default',
          color_palette: [],
          default_export_format: 'png',
          default_export_size: { width: 1200, height: 800 },
          include_watermark: false,
          auto_refresh: true,
          default_refresh_interval: 300,
          heatmap_color_start: '#4A90E2',
          heatmap_color_end: '#E74C3C',
          heatmap_opacity: 0.8
        }
      });
    }

    res.json({
      success: true,
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Get visualization settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /dashboards/settings/:user_id
 * Update user visualization settings
 */
router.put('/settings/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = [];
    const params = [user_id];
    let paramIndex = 2;

    const allowedFields = [
      'preferred_chart_library', 'default_color_scheme', 'color_palette',
      'default_export_format', 'default_export_size', 'include_watermark', 'watermark_text',
      'default_dashboard_id', 'auto_refresh', 'default_refresh_interval',
      'heatmap_color_start', 'heatmap_color_end', 'heatmap_opacity'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        // Stringify JSON fields
        if (['color_palette', 'default_export_size'].includes(field) && typeof value === 'object') {
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
    const result = await pool.query(
      `INSERT INTO visualization_settings (user_id, ${allowedFields.filter(f => req.body[f] !== undefined).join(', ')})
       VALUES ($1, ${updates.map((_, i) => `$${i + 2}`).join(', ')})
       ON CONFLICT (user_id)
       DO UPDATE SET ${updates.join(', ')}
       RETURNING *`,
      params
    );

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error('Update visualization settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
