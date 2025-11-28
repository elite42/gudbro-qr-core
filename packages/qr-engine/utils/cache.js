const redis = require('redis');

let redisClient = null;
let isReady = false;

/**
 * Initialize Redis connection
 * @returns {Promise<RedisClient>}
 */
async function initRedis() {
  if (redisClient && isReady) {
    return redisClient;
  }

  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('❌ Redis: Max reconnection attempts reached');
          return new Error('Redis reconnection failed');
        }
        return retries * 100; // Exponential backoff
      }
    }
  });

  // Event listeners
  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
    isReady = false;
  });

  redisClient.on('connect', () => {
    console.log('🔄 Redis: Connecting...');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis: Ready');
    isReady = true;
  });

  redisClient.on('end', () => {
    console.log('🔌 Redis: Connection closed');
    isReady = false;
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * Get cached destination URL for a short code
 * @param {string} shortCode - The short code to lookup
 * @returns {Promise<string|null>} - Destination URL or null if not cached
 */
async function getCachedURL(shortCode) {
  try {
    if (!isReady) {
      console.warn('⚠️  Redis not ready, skipping cache lookup');
      return null;
    }

    const key = `qr:redirect:${shortCode}`;
    const url = await redisClient.get(key);
    
    if (url) {
      console.log(`✅ Cache HIT: ${shortCode}`);
    } else {
      console.log(`❌ Cache MISS: ${shortCode}`);
    }
    
    return url;
  } catch (error) {
    console.error('Redis GET error:', error.message);
    return null; // Graceful degradation
  }
}

/**
 * Cache a destination URL for a short code
 * @param {string} shortCode - The short code
 * @param {string} destinationUrl - The destination URL
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<boolean>} - Success status
 */
async function cacheURL(shortCode, destinationUrl, ttl = null) {
  try {
    if (!isReady) {
      console.warn('⚠️  Redis not ready, skipping cache set');
      return false;
    }

    const key = `qr:redirect:${shortCode}`;
    const cacheTTL = ttl || parseInt(process.env.CACHE_TTL) || 3600;
    
    await redisClient.setEx(key, cacheTTL, destinationUrl);
    console.log(`💾 Cached: ${shortCode} → ${destinationUrl} (TTL: ${cacheTTL}s)`);
    
    return true;
  } catch (error) {
    console.error('Redis SET error:', error.message);
    return false;
  }
}

/**
 * Invalidate cache for a short code
 * Used when QR destination is updated (Module 5)
 * @param {string} shortCode - The short code to invalidate
 * @returns {Promise<boolean>} - Success status
 */
async function invalidateCache(shortCode) {
  try {
    if (!isReady) {
      console.warn('⚠️  Redis not ready, skipping cache invalidation');
      return false;
    }

    const key = `qr:redirect:${shortCode}`;
    const deleted = await redisClient.del(key);
    
    if (deleted) {
      console.log(`🗑️  Cache invalidated: ${shortCode}`);
    }
    
    return deleted > 0;
  } catch (error) {
    console.error('Redis DEL error:', error.message);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
async function getCacheStats() {
  try {
    if (!isReady) {
      return { available: false };
    }

    const info = await redisClient.info('stats');
    const keyspace = await redisClient.info('keyspace');
    
    // Parse Redis INFO output
    const stats = {
      available: true,
      totalKeys: 0,
      hits: 0,
      misses: 0,
      hitRate: 0
    };

    // Extract keyspace info
    const dbMatch = keyspace.match(/db0:keys=(\d+)/);
    if (dbMatch) {
      stats.totalKeys = parseInt(dbMatch[1]);
    }

    // Extract stats
    const hitsMatch = info.match(/keyspace_hits:(\d+)/);
    const missesMatch = info.match(/keyspace_misses:(\d+)/);
    
    if (hitsMatch) stats.hits = parseInt(hitsMatch[1]);
    if (missesMatch) stats.misses = parseInt(missesMatch[1]);
    
    // Calculate hit rate
    const total = stats.hits + stats.misses;
    if (total > 0) {
      stats.hitRate = ((stats.hits / total) * 100).toFixed(2);
    }

    return stats;
  } catch (error) {
    console.error('Redis stats error:', error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Health check for Redis connection
 * @returns {Promise<boolean>} - True if healthy
 */
async function healthCheck() {
  try {
    if (!isReady) return false;
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error.message);
    return false;
  }
}

/**
 * Close Redis connection gracefully
 */
async function closeRedis() {
  if (redisClient && isReady) {
    await redisClient.quit();
    console.log('👋 Redis connection closed');
  }
}

module.exports = {
  initRedis,
  getCachedURL,
  cacheURL,
  invalidateCache,
  getCacheStats,
  healthCheck,
  closeRedis
};
