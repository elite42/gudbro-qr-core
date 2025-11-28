const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Enterprise Middleware
 * Week 7: Rate Limiting, RBAC, Audit Logging
 */

// ================================================================
// RATE LIMITING MIDDLEWARE
// ================================================================

/**
 * Rate limiting middleware
 * Checks and enforces rate limits based on user/organization/IP
 */
const rateLimiter = (options = {}) => {
  const {
    identifier = 'user', // 'user', 'organization', 'ip', 'api_key'
    endpoint = '*' // specific endpoint or '*' for all
  } = options;

  return async (req, res, next) => {
    try {
      // Determine identifier value
      let identifierValue;
      switch (identifier) {
        case 'user':
          identifierValue = req.user?.id || req.headers['x-user-id'];
          break;
        case 'organization':
          identifierValue = req.organization?.id || req.headers['x-organization-id'];
          break;
        case 'ip':
          identifierValue = req.ip || req.connection.remoteAddress;
          break;
        case 'api_key':
          identifierValue = req.headers['x-api-key'];
          break;
        default:
          identifierValue = 'anonymous';
      }

      if (!identifierValue) {
        // No identifier, skip rate limiting
        return next();
      }

      // Determine endpoint
      const targetEndpoint = endpoint === '*' ? req.path : endpoint;

      // Check rate limit
      const result = await pool.query(
        'SELECT check_rate_limit($1, $2, $3) as is_allowed',
        [identifier, identifierValue, targetEndpoint]
      );

      const isAllowed = result.rows[0]?.is_allowed;

      if (!isAllowed) {
        // Get current limit info for headers
        const limitInfo = await pool.query(
          `SELECT max_requests, current_requests, window_seconds, window_start
           FROM api_rate_limits
           WHERE identifier_type = $1
             AND identifier_value = $2
             AND endpoint = $3`,
          [identifier, identifierValue, targetEndpoint]
        );

        if (limitInfo.rows.length > 0) {
          const limit = limitInfo.rows[0];
          const resetTime = new Date(limit.window_start);
          resetTime.setSeconds(resetTime.getSeconds() + limit.window_seconds);

          // Set rate limit headers
          res.setHeader('X-RateLimit-Limit', limit.max_requests);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retry_after: limitInfo.rows[0]?.window_seconds || 60
        });
      }

      // Add rate limit headers
      const limitInfo = await pool.query(
        `SELECT max_requests, current_requests, window_seconds, window_start
         FROM api_rate_limits
         WHERE identifier_type = $1
           AND identifier_value = $2
           AND endpoint = $3`,
        [identifier, identifierValue, targetEndpoint]
      );

      if (limitInfo.rows.length > 0) {
        const limit = limitInfo.rows[0];
        const remaining = Math.max(0, limit.max_requests - limit.current_requests);
        const resetTime = new Date(limit.window_start);
        resetTime.setSeconds(resetTime.getSeconds() + limit.window_seconds);

        res.setHeader('X-RateLimit-Limit', limit.max_requests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      next();
    }
  };
};

// ================================================================
// RBAC MIDDLEWARE
// ================================================================

/**
 * Permission check middleware
 * Verifies user has required permission in organization
 */
const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || req.headers['x-user-id'];
      const organizationId = req.organization?.id || req.headers['x-organization-id'] || req.params.organization_id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      if (!organizationId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Organization context required'
        });
      }

      // Check permission
      const result = await pool.query(
        'SELECT has_permission($1, $2, $3, $4) as has_permission',
        [userId, organizationId, resource, action]
      );

      const hasPermission = result.rows[0]?.has_permission;

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You do not have permission to ${action} ${resource}`
        });
      }

      // Attach permissions to request for later use
      req.permissions = req.permissions || {};
      req.permissions[resource] = req.permissions[resource] || {};
      req.permissions[resource][action] = true;

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Organization member check middleware
 * Verifies user is member of organization
 */
const requireOrganizationMember = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    const organizationId = req.organization?.id || req.headers['x-organization-id'] || req.params.organization_id;

    if (!userId || !organizationId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User and organization context required'
      });
    }

    // Check membership
    const result = await pool.query(
      `SELECT om.*, r.name as role_name, r.slug as role_slug
       FROM organization_members om
       JOIN roles r ON r.id = om.role_id
       WHERE om.user_id = $1
         AND om.organization_id = $2
         AND om.status = 'active'`,
      [userId, organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this organization'
      });
    }

    // Attach member info to request
    req.organizationMember = result.rows[0];

    next();
  } catch (error) {
    console.error('Organization member check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ================================================================
// AUDIT LOGGING MIDDLEWARE
// ================================================================

/**
 * Audit logging middleware
 * Logs all requests for compliance
 */
const auditLogger = (options = {}) => {
  const {
    actions = ['create', 'update', 'delete'], // Which actions to log
    includeReads = false // Whether to log read operations
  } = options;

  return async (req, res, next) => {
    // Capture original res.json
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Extract resource info from URL
      const pathParts = req.path.split('/').filter(p => p);
      const resourceType = pathParts[0] || 'unknown';
      const resourceId = req.params.id || null;

      // Determine action from method
      const methodActions = {
        'POST': 'create',
        'PUT': 'update',
        'PATCH': 'update',
        'DELETE': 'delete',
        'GET': 'read'
      };

      const action = methodActions[req.method] || 'unknown';

      // Check if we should log this action
      const shouldLog = includeReads || actions.includes(action);

      if (shouldLog && res.statusCode < 400) {
        // Log async (don't wait)
        pool.query(
          `INSERT INTO audit_logs (
            organization_id, user_id, action, resource_type, resource_id,
            old_values, new_values, ip_address, user_agent, endpoint, method, status_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            req.organization?.id || req.headers['x-organization-id'],
            req.user?.id || req.headers['x-user-id'],
            `${resourceType}.${action}`,
            resourceType,
            resourceId,
            null, // old_values (would need to fetch before update)
            req.method !== 'DELETE' ? JSON.stringify(req.body) : null,
            req.ip || req.connection.remoteAddress,
            req.headers['user-agent'],
            req.path,
            req.method,
            res.statusCode
          ]
        ).catch(err => console.error('Audit log error:', err));
      }

      return originalJson(data);
    };

    next();
  };
};

// ================================================================
// SUBSCRIPTION TIER CHECK
// ================================================================

/**
 * Subscription tier middleware
 * Checks if organization has required subscription tier
 */
const requireSubscriptionTier = (requiredTier) => {
  const tierHierarchy = {
    'free': 0,
    'pro': 1,
    'enterprise': 2,
    'custom': 3
  };

  return async (req, res, next) => {
    try {
      const organizationId = req.organization?.id || req.headers['x-organization-id'];

      if (!organizationId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Organization context required'
        });
      }

      // Get organization tier
      const result = await pool.query(
        'SELECT subscription_tier, subscription_status FROM organizations WHERE id = $1',
        [organizationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Organization not found'
        });
      }

      const org = result.rows[0];

      // Check subscription status
      if (org.subscription_status !== 'active') {
        return res.status(402).json({
          error: 'Payment Required',
          message: 'Organization subscription is not active',
          subscription_status: org.subscription_status
        });
      }

      // Check tier level
      const orgTierLevel = tierHierarchy[org.subscription_tier] || 0;
      const requiredTierLevel = tierHierarchy[requiredTier] || 0;

      if (orgTierLevel < requiredTierLevel) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `This feature requires ${requiredTier} subscription or higher`,
          current_tier: org.subscription_tier,
          required_tier: requiredTier
        });
      }

      next();
    } catch (error) {
      console.error('Subscription tier check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  rateLimiter,
  requirePermission,
  requireOrganizationMember,
  auditLogger,
  requireSubscriptionTier
};
