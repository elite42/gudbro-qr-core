// API Usage Analytics Routes
const express = require('express');
const router = express.Router();
const {
  usageQuerySchema,
  validateQuery,
  validateUUID
} = require('../utils/validators');
const { getRateLimitStatus } = require('../middleware/rateLimit');

/**
 * GET /api/usage
 * Get overall API usage for user
 */
router.get('/',
  validateQuery(usageQuerySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const { start_date, end_date, limit, offset } = req.query;
    
    try {
      // Get all API keys for user
      const keysQuery = 'SELECT id FROM api_keys WHERE user_id = $1';
      const keysResult = await db.query(keysQuery, [userId]);
      const keyIds = keysResult.rows.map(row => row.id);
      
      if (keyIds.length === 0) {
        return res.json({
          total_requests: 0,
          by_endpoint: [],
          by_method: [],
          avg_response_time_ms: 0,
          error_rate: 0
        });
      }
      
      // Build query
      let query = `
        SELECT 
          endpoint,
          method,
          COUNT(*) as requests,
          AVG(response_time_ms) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
        FROM api_usage_logs
        WHERE api_key_id = ANY($1)
      `;
      
      const values = [keyIds];
      let paramCount = 2;
      
      if (start_date) {
        query += ` AND created_at >= $${paramCount++}`;
        values.push(start_date);
      }
      
      if (end_date) {
        query += ` AND created_at <= $${paramCount++}`;
        values.push(end_date);
      }
      
      query += ` GROUP BY endpoint, method ORDER BY requests DESC LIMIT $${paramCount++}`;
      values.push(limit);
      
      const result = await db.query(query, values);
      
      // Calculate totals
      const totalRequests = result.rows.reduce((sum, row) => sum + parseInt(row.requests), 0);
      const totalErrors = result.rows.reduce((sum, row) => sum + parseInt(row.errors), 0);
      const avgResponseTime = result.rows.reduce((sum, row) => sum + parseFloat(row.avg_response_time || 0), 0) / result.rows.length;
      
      // Group by endpoint
      const byEndpoint = {};
      result.rows.forEach(row => {
        if (!byEndpoint[row.endpoint]) {
          byEndpoint[row.endpoint] = 0;
        }
        byEndpoint[row.endpoint] += parseInt(row.requests);
      });
      
      // Group by method
      const byMethod = {};
      result.rows.forEach(row => {
        if (!byMethod[row.method]) {
          byMethod[row.method] = 0;
        }
        byMethod[row.method] += parseInt(row.requests);
      });
      
      res.json({
        period: {
          start: start_date || null,
          end: end_date || null
        },
        total_requests: totalRequests,
        by_endpoint: Object.entries(byEndpoint).map(([endpoint, count]) => ({
          endpoint,
          requests: count,
          percentage: ((count / totalRequests) * 100).toFixed(2)
        })),
        by_method: Object.entries(byMethod).map(([method, count]) => ({
          method,
          requests: count,
          percentage: ((count / totalRequests) * 100).toFixed(2)
        })),
        avg_response_time_ms: avgResponseTime.toFixed(2),
        error_rate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0,
        errors: totalErrors
      });
    } catch (error) {
      console.error('Get usage error:', error);
      res.status(500).json({
        error: 'Failed to get API usage',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/usage/keys/:id
 * Get usage for specific API key
 */
router.get('/keys/:id',
  validateUUID('id'),
  validateQuery(usageQuerySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const redisClient = req.app.locals.redis;
    const userId = req.user.id;
    const keyId = req.params.id;
    const { start_date, end_date, limit } = req.query;
    
    try {
      // Check ownership
      const checkQuery = 'SELECT id, rate_limit FROM api_keys WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [keyId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'API key not found'
        });
      }
      
      const rateLimit = checkResult.rows[0].rate_limit;
      
      // Get rate limit status from Redis
      const rateLimitStatus = await getRateLimitStatus(redisClient, keyId);
      
      // Build query
      let query = `
        SELECT 
          endpoint,
          method,
          COUNT(*) as requests,
          AVG(response_time_ms) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
          MIN(created_at) as first_request,
          MAX(created_at) as last_request
        FROM api_usage_logs
        WHERE api_key_id = $1
      `;
      
      const values = [keyId];
      let paramCount = 2;
      
      if (start_date) {
        query += ` AND created_at >= $${paramCount++}`;
        values.push(start_date);
      }
      
      if (end_date) {
        query += ` AND created_at <= $${paramCount++}`;
        values.push(end_date);
      }
      
      query += ` GROUP BY endpoint, method ORDER BY requests DESC LIMIT $${paramCount}`;
      values.push(limit);
      
      const result = await db.query(query, values);
      
      // Calculate stats
      const totalRequests = result.rows.reduce((sum, row) => sum + parseInt(row.requests), 0);
      const totalErrors = result.rows.reduce((sum, row) => sum + parseInt(row.errors), 0);
      
      res.json({
        api_key_id: keyId,
        period: {
          start: start_date || null,
          end: end_date || null
        },
        rate_limit: {
          limit: rateLimit,
          current: rateLimitStatus?.current || 0,
          remaining: Math.max(0, rateLimit - (rateLimitStatus?.current || 0)),
          reset_at: rateLimitStatus?.reset || null
        },
        total_requests: totalRequests,
        total_errors: totalErrors,
        error_rate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0,
        by_endpoint: result.rows.map(row => ({
          endpoint: row.endpoint,
          method: row.method,
          requests: parseInt(row.requests),
          avg_response_time_ms: parseFloat(row.avg_response_time || 0).toFixed(2),
          errors: parseInt(row.errors),
          error_rate: ((parseInt(row.errors) / parseInt(row.requests)) * 100).toFixed(2)
        }))
      });
    } catch (error) {
      console.error('Get key usage error:', error);
      res.status(500).json({
        error: 'Failed to get API key usage',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/usage/timeline
 * Get usage over time (hourly/daily aggregation)
 */
router.get('/timeline',
  validateQuery(usageQuerySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const { start_date, end_date } = req.query;
    
    try {
      // Get all API keys for user
      const keysQuery = 'SELECT id FROM api_keys WHERE user_id = $1';
      const keysResult = await db.query(keysQuery, [userId]);
      const keyIds = keysResult.rows.map(row => row.id);
      
      if (keyIds.length === 0) {
        return res.json({
          timeline: []
        });
      }
      
      // Determine granularity based on date range
      const start = start_date ? new Date(start_date) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = end_date ? new Date(end_date) : new Date();
      const daysDiff = (end - start) / (24 * 60 * 60 * 1000);
      
      const granularity = daysDiff <= 2 ? 'hour' : 'day';
      const truncFunc = granularity === 'hour' ? 'date_trunc(\'hour\', created_at)' : 'DATE(created_at)';
      
      const query = `
        SELECT 
          ${truncFunc} as time_bucket,
          COUNT(*) as requests,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
          AVG(response_time_ms) as avg_response_time
        FROM api_usage_logs
        WHERE api_key_id = ANY($1)
        AND created_at >= $2
        AND created_at <= $3
        GROUP BY time_bucket
        ORDER BY time_bucket ASC
      `;
      
      const result = await db.query(query, [keyIds, start, end]);
      
      res.json({
        granularity,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        timeline: result.rows.map(row => ({
          time: row.time_bucket,
          requests: parseInt(row.requests),
          errors: parseInt(row.errors),
          error_rate: ((parseInt(row.errors) / parseInt(row.requests)) * 100).toFixed(2),
          avg_response_time_ms: parseFloat(row.avg_response_time || 0).toFixed(2)
        }))
      });
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({
        error: 'Failed to get usage timeline',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/usage/top-endpoints
 * Get most used endpoints
 */
router.get('/top-endpoints',
  validateQuery(usageQuerySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const { start_date, end_date, limit } = req.query;
    
    try {
      const keysQuery = 'SELECT id FROM api_keys WHERE user_id = $1';
      const keysResult = await db.query(keysQuery, [userId]);
      const keyIds = keysResult.rows.map(row => row.id);
      
      if (keyIds.length === 0) {
        return res.json({ endpoints: [] });
      }
      
      let query = `
        SELECT 
          endpoint,
          method,
          COUNT(*) as requests,
          AVG(response_time_ms) as avg_response_time,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
        FROM api_usage_logs
        WHERE api_key_id = ANY($1)
      `;
      
      const values = [keyIds];
      let paramCount = 2;
      
      if (start_date) {
        query += ` AND created_at >= $${paramCount++}`;
        values.push(start_date);
      }
      
      if (end_date) {
        query += ` AND created_at <= $${paramCount++}`;
        values.push(end_date);
      }
      
      query += ` GROUP BY endpoint, method ORDER BY requests DESC LIMIT $${paramCount}`;
      values.push(limit);
      
      const result = await db.query(query, values);
      
      res.json({
        endpoints: result.rows.map(row => ({
          endpoint: row.endpoint,
          method: row.method,
          requests: parseInt(row.requests),
          avg_response_time_ms: parseFloat(row.avg_response_time || 0).toFixed(2),
          errors: parseInt(row.errors),
          error_rate: ((parseInt(row.errors) / parseInt(row.requests)) * 100).toFixed(2)
        }))
      });
    } catch (error) {
      console.error('Get top endpoints error:', error);
      res.status(500).json({
        error: 'Failed to get top endpoints',
        message: error.message
      });
    }
  }
);

module.exports = router;
