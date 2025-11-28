const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Conversion Tracking Routes
 * Week 5: Conversion & Goals
 */

// ================================================================
// CONVERSION GOALS MANAGEMENT
// ================================================================

/**
 * POST /conversions/goals
 * Create a new conversion goal
 */
router.post('/goals', async (req, res) => {
  try {
    const {
      user_id,
      qr_code_id,
      campaign_id,
      name,
      description,
      goal_type,
      target_url,
      target_value,
      goal_value,
      currency = 'USD',
      tracking_method = 'url_match'
    } = req.body;

    if (!name || !goal_type) {
      return res.status(400).json({ error: 'Name and goal_type are required' });
    }

    const result = await pool.query(
      `INSERT INTO conversion_goals (
        user_id, qr_code_id, campaign_id, name, description, goal_type,
        target_url, target_value, goal_value, currency, tracking_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [user_id, qr_code_id, campaign_id, name, description, goal_type,
       target_url, target_value, goal_value, currency, tracking_method]
    );

    res.status(201).json({
      success: true,
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/goals
 * List conversion goals
 */
router.get('/goals', async (req, res) => {
  try {
    const { user_id, qr_code_id, campaign_id, is_active } = req.query;

    let query = 'SELECT * FROM conversion_goals WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (qr_code_id) {
      query += ` AND qr_code_id = $${paramIndex++}`;
      params.push(qr_code_id);
    }
    if (campaign_id) {
      query += ` AND campaign_id = $${paramIndex++}`;
      params.push(campaign_id);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      goals: result.rows
    });
  } catch (error) {
    console.error('List goals error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/goals/:id
 * Get goal details with conversion stats
 */
router.get('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const goalResult = await pool.query(
      'SELECT * FROM conversion_goals WHERE id = $1',
      [id]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Get conversion stats
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total_conversions,
        COUNT(DISTINCT user_identifier) as unique_conversions,
        SUM(event_value) as total_value,
        AVG(event_value) as avg_value,
        COUNT(DISTINCT DATE(converted_at)) as active_days
       FROM conversion_events
       WHERE goal_id = $1`,
      [id]
    );

    res.json({
      success: true,
      goal: goalResult.rows[0],
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /conversions/goals/:id
 * Update conversion goal
 */
router.put('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'goal_type', 'target_url', 'target_value',
      'goal_value', 'currency', 'tracking_method', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await pool.query(
      `UPDATE conversion_goals SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ success: true, goal: result.rows[0] });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /conversions/goals/:id
 * Delete conversion goal
 */
router.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM conversion_goals WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// CONVERSION EVENTS TRACKING
// ================================================================

/**
 * POST /conversions/track
 * Track a conversion event
 */
router.post('/track', async (req, res) => {
  try {
    const {
      goal_id,
      qr_code_id,
      scan_id,
      event_type,
      event_value = 0,
      user_identifier,
      ip_address,
      referer,
      user_agent,
      device_type,
      os,
      browser,
      country,
      city,
      utm_source,
      utm_medium,
      utm_campaign,
      metadata = {}
    } = req.body;

    if (!goal_id || !qr_code_id) {
      return res.status(400).json({ error: 'goal_id and qr_code_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO conversion_events (
        goal_id, qr_code_id, scan_id, event_type, event_value,
        user_identifier, ip_address, referer, user_agent,
        device_type, os, browser, country, city,
        utm_source, utm_medium, utm_campaign, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [goal_id, qr_code_id, scan_id, event_type, event_value,
       user_identifier, ip_address, referer, user_agent,
       device_type, os, browser, country, city,
       utm_source, utm_medium, utm_campaign, JSON.stringify(metadata)]
    );

    res.status(201).json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Track conversion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/events
 * Get conversion events
 */
router.get('/events', async (req, res) => {
  try {
    const { goal_id, qr_code_id, start_date, end_date, limit = 100 } = req.query;

    let query = 'SELECT * FROM conversion_events WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (goal_id) {
      query += ` AND goal_id = $${paramIndex++}`;
      params.push(goal_id);
    }
    if (qr_code_id) {
      query += ` AND qr_code_id = $${paramIndex++}`;
      params.push(qr_code_id);
    }
    if (start_date) {
      query += ` AND converted_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND converted_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    query += ` ORDER BY converted_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      events: result.rows
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// CONVERSION RATES ANALYTICS
// ================================================================

/**
 * GET /conversions/rates/:qr_code_id
 * Get conversion rates for a QR code
 */
router.get('/rates/:qr_code_id', async (req, res) => {
  try {
    const { qr_code_id } = req.params;
    const { start_date, end_date, segment_by } = req.query;

    // Overall conversion rate
    const overallResult = await pool.query(
      `SELECT * FROM calculate_conversion_rate($1, NULL, $2, $3)`,
      [qr_code_id,
       start_date || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
       end_date || new Date().toISOString().split('T')[0]]
    );

    // By goal
    const byGoalResult = await pool.query(
      `SELECT
        cg.id as goal_id,
        cg.name as goal_name,
        COUNT(DISTINCT s.id) as scans,
        COUNT(DISTINCT ce.id) as conversions,
        ROUND(COUNT(DISTINCT ce.id)::numeric / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2) as conversion_rate,
        SUM(ce.event_value) as total_value
       FROM conversion_goals cg
       CROSS JOIN qr_scans s
       LEFT JOIN conversion_events ce ON ce.goal_id = cg.id AND ce.qr_code_id = s.qr_code_id
       WHERE s.qr_code_id = $1
         AND cg.qr_code_id = $1
         AND cg.is_active = TRUE
       GROUP BY cg.id, cg.name
       ORDER BY conversion_rate DESC`,
      [qr_code_id]
    );

    // Segmented rates (if requested)
    let segmentedRates = [];
    if (segment_by) {
      const segmentQuery = `
        SELECT
          s.${segment_by} as segment,
          COUNT(DISTINCT s.id) as scans,
          COUNT(DISTINCT ce.id) as conversions,
          ROUND(COUNT(DISTINCT ce.id)::numeric / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2) as conversion_rate
        FROM qr_scans s
        LEFT JOIN conversion_events ce ON ce.qr_code_id = s.qr_code_id
        WHERE s.qr_code_id = $1
        GROUP BY s.${segment_by}
        ORDER BY conversion_rate DESC
      `;
      const segmentResult = await pool.query(segmentQuery, [qr_code_id]);
      segmentedRates = segmentResult.rows;
    }

    res.json({
      success: true,
      overall: overallResult.rows[0],
      by_goal: byGoalResult.rows,
      segmented: segmentedRates
    });
  } catch (error) {
    console.error('Get conversion rates error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/summary/:qr_code_id
 * Get conversion summary from view
 */
router.get('/summary/:qr_code_id', async (req, res) => {
  try {
    const { qr_code_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM v_conversion_summary WHERE qr_code_id = $1',
      [qr_code_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({
      success: true,
      summary: result.rows[0]
    });
  } catch (error) {
    console.error('Get conversion summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// FUNNEL MANAGEMENT
// ================================================================

/**
 * POST /conversions/funnels
 * Create a new conversion funnel
 */
router.post('/funnels', async (req, res) => {
  try {
    const {
      user_id,
      campaign_id,
      name,
      description,
      steps,
      time_window_hours = 24
    } = req.body;

    if (!name || !steps || !Array.isArray(steps) || steps.length < 2) {
      return res.status(400).json({
        error: 'Name and at least 2 steps are required'
      });
    }

    // Validate steps structure
    const validSteps = steps.every((step, idx) =>
      step.step === idx + 1 && step.name && step.goal_type
    );

    if (!validSteps) {
      return res.status(400).json({
        error: 'Invalid steps structure. Each step needs: step, name, goal_type'
      });
    }

    const result = await pool.query(
      `INSERT INTO conversion_funnels (
        user_id, campaign_id, name, description, steps, time_window_hours
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id, campaign_id, name, description, JSON.stringify(steps), time_window_hours]
    );

    res.status(201).json({
      success: true,
      funnel: result.rows[0]
    });
  } catch (error) {
    console.error('Create funnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/funnels
 * List conversion funnels
 */
router.get('/funnels', async (req, res) => {
  try {
    const { user_id, campaign_id, is_active } = req.query;

    let query = 'SELECT * FROM conversion_funnels WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (campaign_id) {
      query += ` AND campaign_id = $${paramIndex++}`;
      params.push(campaign_id);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      funnels: result.rows
    });
  } catch (error) {
    console.error('List funnels error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/funnels/:id
 * Get funnel details with performance
 */
router.get('/funnels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const funnelResult = await pool.query(
      'SELECT * FROM conversion_funnels WHERE id = $1',
      [id]
    );

    if (funnelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    // Get performance from view
    const perfResult = await pool.query(
      'SELECT * FROM v_funnel_performance WHERE funnel_id = $1',
      [id]
    );

    res.json({
      success: true,
      funnel: funnelResult.rows[0],
      performance: perfResult.rows[0] || null
    });
  } catch (error) {
    console.error('Get funnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /conversions/funnels/:id
 * Update funnel
 */
router.put('/funnels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'steps', 'time_window_hours', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        // Stringify steps if it's an array
        if (field === 'steps' && Array.isArray(value)) {
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
      `UPDATE conversion_funnels SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json({ success: true, funnel: result.rows[0] });
  } catch (error) {
    console.error('Update funnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /conversions/funnels/:id
 * Delete funnel
 */
router.delete('/funnels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM conversion_funnels WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json({ success: true, message: 'Funnel deleted successfully' });
  } catch (error) {
    console.error('Delete funnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// FUNNEL SESSION TRACKING
// ================================================================

/**
 * POST /conversions/funnels/:id/sessions
 * Start a new funnel session
 */
router.post('/funnels/:id/sessions', async (req, res) => {
  try {
    const { id: funnel_id } = req.params;
    const {
      qr_code_id,
      session_id,
      user_identifier
    } = req.body;

    if (!qr_code_id || !session_id) {
      return res.status(400).json({
        error: 'qr_code_id and session_id are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO funnel_sessions (
        funnel_id, qr_code_id, session_id, user_identifier, current_step
      ) VALUES ($1, $2, $3, $4, 1)
      RETURNING *`,
      [funnel_id, qr_code_id, session_id, user_identifier]
    );

    res.status(201).json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Create funnel session error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /conversions/funnels/sessions/:session_id/track
 * Track funnel progress
 */
router.post('/funnels/sessions/:session_id/track', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { step } = req.body;

    if (!step || step < 1) {
      return res.status(400).json({ error: 'Valid step number required' });
    }

    // Use the database function to update progress
    await pool.query(
      'SELECT update_funnel_session_progress($1, $2)',
      [session_id, step]
    );

    // Get updated session
    const result = await pool.query(
      'SELECT * FROM funnel_sessions WHERE session_id = $1',
      [session_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Track funnel progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/funnels/:id/analytics
 * Get funnel analytics with step-by-step breakdown
 */
router.get('/funnels/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Get funnel details
    const funnelResult = await pool.query(
      'SELECT * FROM conversion_funnels WHERE id = $1',
      [id]
    );

    if (funnelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funnel not found' });
    }

    const funnel = funnelResult.rows[0];
    const steps = funnel.steps;

    // Build date filter
    let dateFilter = '';
    const params = [id];
    let paramIndex = 2;

    if (start_date) {
      dateFilter += ` AND started_at >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      dateFilter += ` AND started_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Get overall stats
    const overallResult = await pool.query(
      `SELECT
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN is_completed THEN 1 END) as completed_sessions,
        ROUND(
          COUNT(CASE WHEN is_completed THEN 1 END)::numeric /
          NULLIF(COUNT(*), 0) * 100,
          2
        ) as completion_rate,
        AVG(
          EXTRACT(EPOCH FROM (COALESCE(completed_at, last_activity_at) - started_at)) / 60
        )::integer as avg_duration_minutes,
        AVG(current_step) as avg_steps_completed
       FROM funnel_sessions
       WHERE funnel_id = $1 ${dateFilter}`,
      params
    );

    // Get step-by-step breakdown
    const stepAnalysis = [];
    for (let i = 0; i < steps.length; i++) {
      const stepNum = i + 1;

      const stepResult = await pool.query(
        `SELECT
          COUNT(*) as entered,
          COUNT(CASE WHEN current_step >= $2 THEN 1 END) as completed,
          ROUND(
            COUNT(CASE WHEN current_step >= $2 THEN 1 END)::numeric /
            NULLIF(COUNT(*), 0) * 100,
            2
          ) as completion_rate,
          COUNT(CASE WHEN dropped_at_step = $2 THEN 1 END) as dropped_here
         FROM funnel_sessions
         WHERE funnel_id = $1
           AND current_step >= $2 ${dateFilter}`,
        [id, stepNum, ...(start_date ? [start_date] : []), ...(end_date ? [end_date] : [])]
      );

      stepAnalysis.push({
        step: stepNum,
        name: steps[i].name,
        goal_type: steps[i].goal_type,
        ...stepResult.rows[0]
      });
    }

    // Calculate drop-off rates between steps
    for (let i = 0; i < stepAnalysis.length - 1; i++) {
      const current = stepAnalysis[i];
      const next = stepAnalysis[i + 1];

      current.drop_off_to_next = current.entered - next.entered;
      current.drop_off_rate = current.entered > 0
        ? Math.round((current.drop_off_to_next / current.entered) * 100 * 100) / 100
        : 0;
    }

    res.json({
      success: true,
      funnel: {
        id: funnel.id,
        name: funnel.name,
        total_steps: steps.length
      },
      overall: overallResult.rows[0],
      steps: stepAnalysis
    });
  } catch (error) {
    console.error('Get funnel analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /conversions/funnels/sessions
 * Get funnel sessions
 */
router.get('/funnels/sessions', async (req, res) => {
  try {
    const { funnel_id, qr_code_id, is_completed, limit = 100 } = req.query;

    let query = 'SELECT * FROM funnel_sessions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (funnel_id) {
      query += ` AND funnel_id = $${paramIndex++}`;
      params.push(funnel_id);
    }
    if (qr_code_id) {
      query += ` AND qr_code_id = $${paramIndex++}`;
      params.push(qr_code_id);
    }
    if (is_completed !== undefined) {
      query += ` AND is_completed = $${paramIndex++}`;
      params.push(is_completed === 'true');
    }

    query += ` ORDER BY started_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Get funnel sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
