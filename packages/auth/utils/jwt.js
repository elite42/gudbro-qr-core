const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT configuration
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || crypto.randomBytes(32).toString('hex');
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString('hex');
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

/**
 * Generate access token (short-lived)
 * @param {Object} payload - User data to encode
 * @returns {String} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'qr-platform-auth',
    audience: 'qr-platform-api'
  });
}

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - User data to encode
 * @returns {String} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'qr-platform-auth',
    audience: 'qr-platform-api'
  });
}

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'qr-platform-auth',
      audience: 'qr-platform-api'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'qr-platform-auth',
      audience: 'qr-platform-api'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Generate password reset token (random, not JWT)
 * @returns {String} Random token (32 bytes hex)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
  extractToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
