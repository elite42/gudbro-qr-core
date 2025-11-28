// Rate Limiting Middleware
const redis = require('redis');

/**
 * Rate limit middleware for API keys
 * Uses Redis for distributed rate limiting
 */
function apiKeyRateLimit() {
  return async (req, res, next) => {
    // Skip if no API key (authentication middleware will handle)
    if (!req.apiKey) {
      return next();
    }
    
    const keyId = req.apiKey.id;
    const rateLimit = req.apiKey.rate_limit || 100; // Requests per hour
    
    try {
      const redisClient = req.app.locals.redis;
      
      // Use sliding window rate limiting
      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1 hour
      const key = `ratelimit:apikey:${keyId}`;
      
      // Remove old entries outside the window
      await redisClient.zRemRangeByScore(key, 0, now - windowMs);
      
      // Count requests in current window
      const requestCount = await redisClient.zCard(key);
      
      // Check if limit exceeded
      if (requestCount >= rateLimit) {
        // Get oldest request timestamp to calculate reset time
        const oldest = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });
        const resetTime = oldest.length > 0 
          ? new Date(parseInt(oldest[0].score) + windowMs)
          : new Date(now + windowMs);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `You have exceeded the rate limit of ${rateLimit} requests per hour`,
          limit: rateLimit,
          remaining: 0,
          reset: resetTime.toISOString(),
          reset_in_seconds: Math.ceil((resetTime.getTime() - now) / 1000)
        });
      }
      
      // Add current request
      await redisClient.zAdd(key, {
        score: now,
        value: `${now}:${Math.random()}`
      });
      
      // Set TTL on key (cleanup)
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
      
      // Add rate limit headers
      const remaining = rateLimit - requestCount - 1;
      const oldestInWindow = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });
      const resetTime = oldestInWindow.length > 0
        ? new Date(parseInt(oldestInWindow[0].score) + windowMs)
        : new Date(now + windowMs);
      
      res.setHeader('X-RateLimit-Limit', rateLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
      res.setHeader('X-RateLimit-Reset', Math.floor(resetTime.getTime() / 1000));
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // On Redis error, allow request but log
      console.warn('Rate limiting disabled due to Redis error');
      next();
    }
  };
}

/**
 * Global rate limit by IP address
 * Protects against abuse from unauthenticated requests
 */
function globalRateLimit(options = {}) {
  const {
    windowMs = 60 * 60 * 1000, // 1 hour
    maxRequests = 1000,
    message = 'Too many requests from this IP'
  } = options;
  
  return async (req, res, next) => {
    try {
      const redisClient = req.app.locals.redis;
      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:ip:${ip}`;
      const now = Date.now();
      
      // Remove old entries
      await redisClient.zRemRangeByScore(key, 0, now - windowMs);
      
      // Count requests
      const requestCount = await redisClient.zCard(key);
      
      if (requestCount >= maxRequests) {
        const oldest = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });
        const resetTime = oldest.length > 0
          ? new Date(parseInt(oldest[0].score) + windowMs)
          : new Date(now + windowMs);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message,
          retry_after: Math.ceil((resetTime.getTime() - now) / 1000)
        });
      }
      
      // Add request
      await redisClient.zAdd(key, {
        score: now,
        value: `${now}:${Math.random()}`
      });
      
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
      
      next();
    } catch (error) {
      console.error('Global rate limit error:', error);
      next();
    }
  };
}

/**
 * Custom rate limit for specific endpoints
 */
function customRateLimit(maxRequests, windowMs = 60000) {
  return async (req, res, next) => {
    try {
      const redisClient = req.app.locals.redis;
      const identifier = req.apiKey ? req.apiKey.id : req.ip;
      const key = `ratelimit:custom:${req.path}:${identifier}`;
      const now = Date.now();
      
      await redisClient.zRemRangeByScore(key, 0, now - windowMs);
      
      const requestCount = await redisClient.zCard(key);
      
      if (requestCount >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `This endpoint is limited to ${maxRequests} requests per ${windowMs / 1000} seconds`
        });
      }
      
      await redisClient.zAdd(key, {
        score: now,
        value: `${now}:${Math.random()}`
      });
      
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
      
      next();
    } catch (error) {
      console.error('Custom rate limit error:', error);
      next();
    }
  };
}

/**
 * Check current rate limit status without incrementing
 */
async function getRateLimitStatus(redisClient, keyId) {
  const key = `ratelimit:apikey:${keyId}`;
  const windowMs = 60 * 60 * 1000;
  const now = Date.now();
  
  try {
    await redisClient.zRemRangeByScore(key, 0, now - windowMs);
    const requestCount = await redisClient.zCard(key);
    
    const oldest = await redisClient.zRange(key, 0, 0, { WITHSCORES: true });
    const resetTime = oldest.length > 0
      ? new Date(parseInt(oldest[0].score) + windowMs)
      : new Date(now + windowMs);
    
    return {
      current: requestCount,
      reset: resetTime.toISOString()
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return null;
  }
}

/**
 * Reset rate limit for a specific API key (admin function)
 */
async function resetRateLimit(redisClient, keyId) {
  const key = `ratelimit:apikey:${keyId}`;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
    return false;
  }
}

/**
 * Fallback rate limiting using PostgreSQL (if Redis unavailable)
 */
async function fallbackRateLimit(db, keyId, rateLimit) {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  
  // Get or create rate limit record
  const query = `
    INSERT INTO rate_limits (api_key_id, window_start, request_count)
    VALUES ($1, NOW(), 1)
    ON CONFLICT (api_key_id, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count
  `;
  
  const result = await db.query(query, [keyId]);
  const requestCount = result.rows[0].request_count;
  
  // Cleanup old windows
  await db.query(
    'DELETE FROM rate_limits WHERE window_start < $1',
    [windowStart]
  );
  
  return requestCount <= rateLimit;
}

module.exports = {
  apiKeyRateLimit,
  globalRateLimit,
  customRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  fallbackRateLimit
};
