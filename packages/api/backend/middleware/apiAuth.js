// API Authentication Middleware
const { parseApiKeyFromHeader, verifyApiKey, maskApiKey } = require('../utils/keyGenerator');

/**
 * Authenticate API key from Authorization header
 * Sets req.apiKey with validated key info
 */
async function authenticateApiKey(req, res, next) {
  const db = req.app.locals.db;
  
  // Extract API key from header
  const authHeader = req.headers.authorization;
  const apiKey = parseApiKeyFromHeader(authHeader);
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid API key in the Authorization header',
      example: 'Authorization: Bearer qrp_live_...'
    });
  }
  
  try {
    // Find API key in database by prefix
    const prefix = apiKey.substring(0, 12);
    
    const query = `
      SELECT * FROM api_keys
      WHERE key_prefix = $1
      AND is_active = true
    `;
    
    const result = await db.query(query, [prefix]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }
    
    // Check all matching keys (should only be 1, but handle collisions)
    let validKey = null;
    
    for (const key of result.rows) {
      const isValid = await verifyApiKey(apiKey, key.key_hash);
      if (isValid) {
        validKey = key;
        break;
      }
    }
    
    if (!validKey) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      });
    }
    
    // Check expiry
    if (validKey.expires_at && new Date(validKey.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'API key expired',
        message: 'This API key has expired',
        expired_at: validKey.expires_at
      });
    }
    
    // Update last_used_at (async, don't wait)
    db.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [validKey.id]
    ).catch(err => console.error('Failed to update last_used_at:', err));
    
    // Attach API key info to request
    req.apiKey = {
      id: validKey.id,
      user_id: validKey.user_id,
      name: validKey.name,
      permissions: validKey.permissions,
      rate_limit: validKey.rate_limit,
      masked: maskApiKey(apiKey)
    };
    
    // Log API usage (async, don't wait)
    logApiUsage(db, {
      api_key_id: validKey.id,
      endpoint: req.path,
      method: req.method,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    next();
  } catch (error) {
    console.error('API authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred while authenticating your API key'
    });
  }
}

/**
 * Optional authentication - allows unauthenticated requests
 * Sets req.apiKey if authenticated, otherwise continues
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.apiKey = null;
    return next();
  }
  
  // If auth header present, validate it
  return authenticateApiKey(req, res, next);
}

/**
 * Check if API key has required permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'This endpoint requires authentication'
      });
    }
    
    const permissions = req.apiKey.permissions || [];
    
    // Check if has admin permission (grants all)
    if (permissions.includes('admin')) {
      return next();
    }
    
    // Check specific permission
    if (permissions.includes(permission)) {
      return next();
    }
    
    // Check wildcard permissions (e.g., "qr:write" includes "write")
    const [category, action] = permission.split(':');
    if (action && permissions.includes(action)) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Insufficient permissions',
      message: `This endpoint requires the "${permission}" permission`,
      your_permissions: permissions
    });
  };
}

/**
 * Require multiple permissions (all required)
 */
function requirePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    const permissions = req.apiKey.permissions || [];
    
    if (permissions.includes('admin')) {
      return next();
    }
    
    const missingPermissions = requiredPermissions.filter(
      perm => !permissions.includes(perm)
    );
    
    if (missingPermissions.length > 0) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have all required permissions',
        missing: missingPermissions,
        your_permissions: permissions
      });
    }
    
    next();
  };
}

/**
 * Require at least one of the specified permissions
 */
function requireAnyPermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    const permissions = req.apiKey.permissions || [];
    
    if (permissions.includes('admin')) {
      return next();
    }
    
    const hasPermission = requiredPermissions.some(perm => 
      permissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You need at least one of these permissions',
        required_any: requiredPermissions,
        your_permissions: permissions
      });
    }
    
    next();
  };
}

/**
 * Log API usage for analytics
 */
async function logApiUsage(db, usage) {
  const query = `
    INSERT INTO api_usage_logs (
      api_key_id,
      endpoint,
      method,
      ip_address,
      user_agent
    ) VALUES ($1, $2, $3, $4, $5)
  `;
  
  try {
    await db.query(query, [
      usage.api_key_id,
      usage.endpoint,
      usage.method,
      usage.ip_address,
      usage.user_agent
    ]);
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

/**
 * Middleware to log API request completion (status, response time)
 */
function logApiResponse(req, res, next) {
  if (!req.apiKey) {
    return next();
  }
  
  const startTime = Date.now();
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const db = req.app.locals.db;
    
    // Update usage log with response data
    db.query(
      `UPDATE api_usage_logs 
       SET status_code = $1, response_time_ms = $2
       WHERE api_key_id = $3 
       AND endpoint = $4 
       AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC
       LIMIT 1`,
      [res.statusCode, responseTime, req.apiKey.id, req.path]
    ).catch(err => console.error('Failed to update API usage log:', err));
    
    return originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  authenticateApiKey,
  optionalAuth,
  requirePermission,
  requirePermissions,
  requireAnyPermission,
  logApiResponse
};
