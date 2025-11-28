/**
 * Cache Manager for Artistic QR
 * Redis cache for generated QR codes
 */

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const CACHE_PREFIX = 'artistic-qr:';
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Get cached QR
 */
export async function getCached(cacheKey) {
  try {
    const cached = await redis.get(CACHE_PREFIX + cacheKey);
    if (cached) {
      console.log('✅ Cache HIT:', cacheKey);
      return JSON.parse(cached);
    }
    console.log('❌ Cache MISS:', cacheKey);
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cache
 */
export async function setCache(cacheKey, data) {
  try {
    await redis.setex(
      CACHE_PREFIX + cacheKey,
      CACHE_TTL,
      JSON.stringify(data)
    );
    console.log('💾 Cached:', cacheKey);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Clear cache for specific key
 */
export async function clearCache(cacheKey) {
  try {
    await redis.del(CACHE_PREFIX + cacheKey);
    console.log('🗑️  Cache cleared:', cacheKey);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Get cache stats
 */
export async function getCacheStats() {
  try {
    const keys = await redis.keys(CACHE_PREFIX + '*');
    return {
      totalCached: keys.length,
      cachePrefix: CACHE_PREFIX
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { totalCached: 0 };
  }
}

export default {
  getCached,
  setCache,
  clearCache,
  getCacheStats
};
