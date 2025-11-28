// Webhook Sender - Send webhook events with retry logic
const axios = require('axios');
const { generateWebhookSignature } = require('./keyGenerator');

/**
 * Send webhook event
 * @param {Object} webhook - Webhook configuration
 * @param {string} eventType - Event type (scan, qr.created, etc.)
 * @param {Object} eventData - Event payload data
 * @param {Object} db - Database pool
 * @returns {Promise<Object>} Delivery result
 */
async function sendWebhook(webhook, eventType, eventData, db) {
  const startTime = Date.now();
  
  // Prepare payload
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: eventData,
    webhook_id: webhook.id
  };
  
  // Generate signature
  const signature = generateWebhookSignature(payload, webhook.secret);
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
    'X-Webhook-Event': eventType,
    'X-Webhook-ID': webhook.id,
    'X-Webhook-Timestamp': payload.timestamp,
    'User-Agent': 'QRPlatform-Webhooks/1.0'
  };
  
  let attemptNumber = 1;
  let lastError = null;
  
  // Retry loop
  while (attemptNumber <= webhook.retry_count) {
    try {
      // Send HTTP request
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: webhook.timeout_ms || 5000,
        validateStatus: null // Don't throw on any status code
      });
      
      const duration = Date.now() - startTime;
      
      // Consider 2xx as success
      const succeeded = response.status >= 200 && response.status < 300;
      
      // Log delivery
      await logDelivery(db, {
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_code: response.status,
        response_body: JSON.stringify(response.data).substring(0, 1000), // Limit size
        response_headers: response.headers,
        attempt_number: attemptNumber,
        succeeded,
        duration_ms: duration,
        error_message: succeeded ? null : `HTTP ${response.status}`
      });
      
      if (succeeded) {
        return {
          success: true,
          status_code: response.status,
          attempts: attemptNumber,
          duration_ms: duration
        };
      }
      
      lastError = `HTTP ${response.status}: ${JSON.stringify(response.data)}`;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      lastError = error.message;
      
      // Log failed delivery
      await logDelivery(db, {
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_code: null,
        response_body: null,
        response_headers: null,
        attempt_number: attemptNumber,
        succeeded: false,
        duration_ms: duration,
        error_message: error.message
      });
    }
    
    // If not last attempt, wait with exponential backoff
    if (attemptNumber < webhook.retry_count) {
      const backoffMs = calculateBackoff(attemptNumber);
      await sleep(backoffMs);
    }
    
    attemptNumber++;
  }
  
  // All retries failed
  return {
    success: false,
    attempts: attemptNumber - 1,
    error: lastError,
    duration_ms: Date.now() - startTime
  };
}

/**
 * Log webhook delivery to database
 */
async function logDelivery(db, delivery) {
  const query = `
    INSERT INTO webhook_deliveries (
      webhook_id,
      event_type,
      payload,
      response_code,
      response_body,
      response_headers,
      attempt_number,
      succeeded,
      duration_ms,
      error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;
  
  const values = [
    delivery.webhook_id,
    delivery.event_type,
    delivery.payload,
    delivery.response_code,
    delivery.response_body,
    delivery.response_headers,
    delivery.attempt_number,
    delivery.succeeded,
    delivery.duration_ms,
    delivery.error_message
  ];
  
  try {
    await db.query(query, values);
  } catch (error) {
    console.error('Failed to log webhook delivery:', error);
  }
}

/**
 * Calculate exponential backoff delay
 * Attempt 1: 1s, Attempt 2: 2s, Attempt 3: 4s
 */
function calculateBackoff(attemptNumber) {
  return Math.pow(2, attemptNumber - 1) * 1000; // 1s, 2s, 4s, 8s, ...
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send webhook to all active webhooks subscribed to an event
 */
async function broadcastWebhook(db, eventType, eventData) {
  // Get all active webhooks subscribed to this event
  const query = `
    SELECT * FROM webhooks
    WHERE is_active = true
    AND events @> $1::jsonb
  `;
  
  const result = await db.query(query, [JSON.stringify([eventType])]);
  const webhooks = result.rows;
  
  if (webhooks.length === 0) {
    return { sent: 0, succeeded: 0, failed: 0 };
  }
  
  // Send to all webhooks (in parallel)
  const results = await Promise.allSettled(
    webhooks.map(webhook => sendWebhook(webhook, eventType, eventData, db))
  );
  
  const stats = {
    sent: webhooks.length,
    succeeded: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
    failed: results.filter(r => r.status === 'rejected' || !r.value.success).length
  };
  
  return stats;
}

/**
 * Test webhook endpoint (send test event)
 */
async function testWebhook(webhook, db) {
  const testPayload = {
    test: true,
    message: 'This is a test webhook from QR Platform',
    webhook_id: webhook.id,
    webhook_url: webhook.url
  };
  
  return await sendWebhook(webhook, 'webhook.test', testPayload, db);
}

/**
 * Get webhook delivery statistics
 */
async function getWebhookStats(db, webhookId, days = 7) {
  const query = `
    SELECT 
      COUNT(*) as total_deliveries,
      SUM(CASE WHEN succeeded THEN 1 ELSE 0 END) as successful_deliveries,
      SUM(CASE WHEN NOT succeeded THEN 1 ELSE 0 END) as failed_deliveries,
      ROUND(100.0 * SUM(CASE WHEN succeeded THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
      AVG(duration_ms) as avg_duration_ms,
      MAX(delivered_at) as last_delivery_at
    FROM webhook_deliveries
    WHERE webhook_id = $1
    AND delivered_at > NOW() - INTERVAL '${days} days'
  `;
  
  const result = await db.query(query, [webhookId]);
  return result.rows[0];
}

/**
 * Clean up old webhook delivery logs
 */
async function cleanupOldDeliveries(db, daysToKeep = 30) {
  const query = `
    DELETE FROM webhook_deliveries
    WHERE delivered_at < NOW() - INTERVAL '${daysToKeep} days'
  `;
  
  const result = await db.query(query);
  return result.rowCount;
}

module.exports = {
  sendWebhook,
  broadcastWebhook,
  testWebhook,
  getWebhookStats,
  cleanupOldDeliveries
};
