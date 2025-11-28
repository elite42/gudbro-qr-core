// API Key Generator - Secure key generation with bcrypt hashing
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate a secure API key
 * Format: qrp_{env}_{random}
 * Example: qrp_live_abc123def456ghi789jkl012mno345
 */
function generateApiKey(environment = 'live') {
  // Generate 32 random bytes (256 bits)
  const randomBytes = crypto.randomBytes(32);
  
  // Convert to base62 (alphanumeric only)
  const base62Chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  
  for (let i = 0; i < 32; i++) {
    const index = randomBytes[i] % base62Chars.length;
    key += base62Chars[index];
  }
  
  // Format: qrp_{env}_{random}
  const fullKey = `qrp_${environment}_${key}`;
  
  return fullKey;
}

/**
 * Generate API key prefix for display
 * Shows first 12 characters: qrp_live_abc
 */
function generateKeyPrefix(fullKey) {
  return fullKey.substring(0, 12);
}

/**
 * Hash API key for secure storage
 * Uses bcrypt with salt rounds = 10
 */
async function hashApiKey(apiKey) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(apiKey, saltRounds);
  return hash;
}

/**
 * Verify API key against stored hash
 */
async function verifyApiKey(apiKey, hash) {
  return await bcrypt.compare(apiKey, hash);
}

/**
 * Generate webhook secret
 * Format: whsec_{random}
 */
function generateWebhookSecret() {
  const randomBytes = crypto.randomBytes(32);
  const secret = randomBytes.toString('hex');
  return `whsec_${secret}`;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateWebhookSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = generateWebhookSignature(payload, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Parse API key from Authorization header
 * Supports: "Bearer qrp_live_...", "qrp_live_...", "ApiKey qrp_live_..."
 */
function parseApiKeyFromHeader(authHeader) {
  if (!authHeader) return null;
  
  // Remove "Bearer " or "ApiKey " prefix if present
  const key = authHeader
    .replace(/^Bearer\s+/i, '')
    .replace(/^ApiKey\s+/i, '')
    .trim();
  
  // Validate format
  if (!key.startsWith('qrp_')) {
    return null;
  }
  
  return key;
}

/**
 * Validate API key format
 */
function validateApiKeyFormat(apiKey) {
  // Format: qrp_{env}_{32chars}
  const regex = /^qrp_(live|test|dev)_[a-zA-Z0-9]{32}$/;
  return regex.test(apiKey);
}

/**
 * Generate random ID for tracking
 */
function generateRequestId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Mask API key for logging
 * Shows: qrp_live_abc...xyz (first 12 + last 3 chars)
 */
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 15) return '***';
  
  const prefix = apiKey.substring(0, 12);
  const suffix = apiKey.substring(apiKey.length - 3);
  
  return `${prefix}...${suffix}`;
}

module.exports = {
  generateApiKey,
  generateKeyPrefix,
  hashApiKey,
  verifyApiKey,
  generateWebhookSecret,
  generateWebhookSignature,
  verifyWebhookSignature,
  parseApiKeyFromHeader,
  validateApiKeyFormat,
  generateRequestId,
  maskApiKey
};
