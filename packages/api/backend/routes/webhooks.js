// Webhooks Management Routes
const express = require('express');
const router = express.Router();
const { generateWebhookSecret } = require('../utils/keyGenerator');
const { testWebhook, getWebhookStats } = require('../utils/webhookSender');
const {
  createWebhookSchema,
  updateWebhookSchema,
  deliveriesQuerySchema,
  validateBody,
  validateQuery,
  validateUUID
} = require('../utils/validators');

/**
 * POST /api/webhooks
 * Create new webhook
 */
router.post('/',
  validateBody(createWebhookSchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    
    try {
      const { url, events, retry_count, timeout_ms } = req.body;
      
      // Generate webhook secret
      const secret = generateWebhookSecret();
      
      // Insert into database
      const query = `
        INSERT INTO webhooks (
          user_id,
          url,
          events,
          secret,
          retry_count,
          timeout_ms
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, url, events, secret, is_active, retry_count, timeout_ms, created_at
      `;
      
      const values = [
        userId,
        url,
        JSON.stringify(events),
        secret,
        retry_count || 3,
        timeout_ms || 5000
      ];
      
      const result = await db.query(query, values);
      const webhook = result.rows[0];
      
      res.status(201).json({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret, // ⚠️ SHOW ONLY ONCE!
        is_active: webhook.is_active,
        retry_count: webhook.retry_count,
        timeout_ms: webhook.timeout_ms,
        created_at: webhook.created_at,
        warning: 'Save the secret securely! Use it to verify webhook signatures.'
      });
    } catch (error) {
      console.error('Create webhook error:', error);
      res.status(500).json({
        error: 'Failed to create webhook',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/webhooks
 * List all webhooks for user
 */
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.user.id;
  
  try {
    const query = `
      SELECT 
        id,
        url,
        events,
        is_active,
        retry_count,
        timeout_ms,
        created_at,
        updated_at
      FROM webhooks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    // Get delivery stats for each webhook
    const webhooksWithStats = await Promise.all(
      result.rows.map(async (webhook) => {
        const stats = await getWebhookStats(db, webhook.id, 7);
        return {
          ...webhook,
          stats: {
            total_deliveries: parseInt(stats.total_deliveries) || 0,
            success_rate: parseFloat(stats.success_rate) || 0,
            last_delivery_at: stats.last_delivery_at
          }
        };
      })
    );
    
    res.json({
      webhooks: webhooksWithStats
    });
  } catch (error) {
    console.error('List webhooks error:', error);
    res.status(500).json({
      error: 'Failed to list webhooks',
      message: error.message
    });
  }
});

/**
 * GET /api/webhooks/:id
 * Get single webhook details
 */
router.get('/:id',
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    
    try {
      const query = `
        SELECT 
          id,
          url,
          events,
          is_active,
          retry_count,
          timeout_ms,
          created_at,
          updated_at
        FROM webhooks
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await db.query(query, [webhookId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      const webhook = result.rows[0];
      
      // Get stats
      const stats = await getWebhookStats(db, webhookId, 30);
      
      res.json({
        ...webhook,
        stats: {
          total_deliveries: parseInt(stats.total_deliveries) || 0,
          successful_deliveries: parseInt(stats.successful_deliveries) || 0,
          failed_deliveries: parseInt(stats.failed_deliveries) || 0,
          success_rate: parseFloat(stats.success_rate) || 0,
          avg_duration_ms: parseInt(stats.avg_duration_ms) || 0,
          last_delivery_at: stats.last_delivery_at
        }
      });
    } catch (error) {
      console.error('Get webhook error:', error);
      res.status(500).json({
        error: 'Failed to get webhook',
        message: error.message
      });
    }
  }
);

/**
 * PATCH /api/webhooks/:id
 * Update webhook
 */
router.patch('/:id',
  validateUUID('id'),
  validateBody(updateWebhookSchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    
    try {
      // Check ownership
      const checkQuery = 'SELECT id FROM webhooks WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [webhookId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (req.body.url !== undefined) {
        updates.push(`url = $${paramCount++}`);
        values.push(req.body.url);
      }
      
      if (req.body.events !== undefined) {
        updates.push(`events = $${paramCount++}`);
        values.push(JSON.stringify(req.body.events));
      }
      
      if (req.body.is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(req.body.is_active);
      }
      
      if (req.body.retry_count !== undefined) {
        updates.push(`retry_count = $${paramCount++}`);
        values.push(req.body.retry_count);
      }
      
      if (req.body.timeout_ms !== undefined) {
        updates.push(`timeout_ms = $${paramCount++}`);
        values.push(req.body.timeout_ms);
      }
      
      updates.push(`updated_at = NOW()`);
      
      values.push(webhookId, userId);
      
      const query = `
        UPDATE webhooks
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      const webhook = result.rows[0];
      
      res.json({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        is_active: webhook.is_active,
        retry_count: webhook.retry_count,
        timeout_ms: webhook.timeout_ms,
        updated_at: webhook.updated_at
      });
    } catch (error) {
      console.error('Update webhook error:', error);
      res.status(500).json({
        error: 'Failed to update webhook',
        message: error.message
      });
    }
  }
);

/**
 * DELETE /api/webhooks/:id
 * Delete webhook
 */
router.delete('/:id',
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    
    try {
      const query = `
        DELETE FROM webhooks
        WHERE id = $1 AND user_id = $2
        RETURNING url
      `;
      
      const result = await db.query(query, [webhookId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      res.json({
        message: 'Webhook deleted successfully',
        url: result.rows[0].url
      });
    } catch (error) {
      console.error('Delete webhook error:', error);
      res.status(500).json({
        error: 'Failed to delete webhook',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/webhooks/:id/test
 * Test webhook by sending a test event
 */
router.post('/:id/test',
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    
    try {
      // Get webhook
      const query = 'SELECT * FROM webhooks WHERE id = $1 AND user_id = $2';
      const result = await db.query(query, [webhookId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      const webhook = result.rows[0];
      
      // Send test webhook
      const testResult = await testWebhook(webhook, db);
      
      res.json({
        message: 'Test webhook sent',
        result: {
          success: testResult.success,
          status_code: testResult.status_code,
          attempts: testResult.attempts,
          duration_ms: testResult.duration_ms,
          error: testResult.error || null
        }
      });
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(500).json({
        error: 'Failed to test webhook',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/webhooks/:id/deliveries
 * Get webhook delivery logs
 */
router.get('/:id/deliveries',
  validateUUID('id'),
  validateQuery(deliveriesQuerySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    const { event_type, succeeded, limit, offset } = req.query;
    
    try {
      // Check ownership
      const checkQuery = 'SELECT id FROM webhooks WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [webhookId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      // Build query
      let query = `
        SELECT 
          id,
          event_type,
          response_code,
          attempt_number,
          succeeded,
          duration_ms,
          error_message,
          delivered_at
        FROM webhook_deliveries
        WHERE webhook_id = $1
      `;
      
      const values = [webhookId];
      let paramCount = 2;
      
      if (event_type) {
        query += ` AND event_type = $${paramCount++}`;
        values.push(event_type);
      }
      
      if (succeeded !== undefined) {
        query += ` AND succeeded = $${paramCount++}`;
        values.push(succeeded);
      }
      
      query += ` ORDER BY delivered_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      values.push(limit, offset);
      
      const result = await db.query(query, values);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM webhook_deliveries WHERE webhook_id = $1';
      const countValues = [webhookId];
      
      if (event_type) {
        countQuery += ' AND event_type = $2';
        countValues.push(event_type);
      }
      if (succeeded !== undefined) {
        countQuery += ` AND succeeded = $${countValues.length + 1}`;
        countValues.push(succeeded);
      }
      
      const countResult = await db.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count);
      
      res.json({
        deliveries: result.rows,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get deliveries error:', error);
      res.status(500).json({
        error: 'Failed to get webhook deliveries',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/webhooks/:id/deliveries/:delivery_id
 * Get single delivery details (including full payload)
 */
router.get('/:id/deliveries/:delivery_id',
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const webhookId = req.params.id;
    const deliveryId = req.params.delivery_id;
    
    try {
      // Check webhook ownership
      const checkQuery = 'SELECT id FROM webhooks WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [webhookId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Webhook not found'
        });
      }
      
      // Get delivery
      const query = `
        SELECT *
        FROM webhook_deliveries
        WHERE id = $1 AND webhook_id = $2
      `;
      
      const result = await db.query(query, [deliveryId, webhookId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Delivery not found'
        });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get delivery error:', error);
      res.status(500).json({
        error: 'Failed to get delivery details',
        message: error.message
      });
    }
  }
);

module.exports = router;
