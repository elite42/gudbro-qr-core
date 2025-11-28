const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const redis = require('redis');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken
} = require('../utils/jwt');
const {
  registerSchema,
  loginSchema,
  resetRequestSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  validate,
  sanitizeEmail
} = require('../utils/validation');
const { authenticateToken } = require('../middleware/authMiddleware');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection for blacklisting tokens
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.connect().catch(console.error);

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour for password reset

/**
 * POST /auth/register - Register new user
 */
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validate(req.body, registerSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Errore di validazione',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password, name } = value;
    const sanitizedEmail = sanitizeEmail(email);

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [sanitizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email già registrata',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, email_verified, is_active)
       VALUES ($1, $2, $3, 'user', false, true)
       RETURNING id, email, name, role, plan, created_at`,
      [sanitizedEmail, passwordHash, name || null]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, expiresAt, req.ip, req.headers['user-agent']]
    );

    res.status(201).json({
      success: true,
      message: 'Registrazione completata con successo',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la registrazione',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * POST /auth/login - User login
 */
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validate(req.body, loginSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Errore di validazione',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password } = value;
    const sanitizedEmail = sanitizeEmail(email);

    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, name, role, plan, is_active, email_verified
       FROM users
       WHERE email = $1`,
      [sanitizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email o password non validi',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account disabilitato',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email o password non validi',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, expiresAt, req.ip, req.headers['user-agent']]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          emailVerified: user.email_verified
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il login',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * POST /auth/refresh - Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validate(req.body, refreshTokenSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token richiesto',
        code: 'MISSING_TOKEN'
      });
    }

    const { refreshToken } = value;

    // Verify refresh token JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: err.message,
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if refresh token exists in database and not revoked
    const result = await pool.query(
      `SELECT rt.*, u.role, u.plan, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token non valido o scaduto',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    const tokenData = result.rows[0];

    // Check if user is still active
    if (!tokenData.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account disabilitato',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: tokenData.role,
      plan: tokenData.plan
    });

    res.json({
      success: true,
      message: 'Token rinnovato con successo',
      data: {
        accessToken: newAccessToken,
        expiresIn: '15m'
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il rinnovo del token',
      code: 'REFRESH_ERROR'
    });
  }
});

/**
 * POST /auth/logout - Logout user (revoke refresh token)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke specific refresh token
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1 AND user_id = $2',
        [refreshToken, req.user.id]
      );
    } else {
      // Revoke all user's refresh tokens
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
        [req.user.id]
      );
    }

    res.json({
      success: true,
      message: 'Logout effettuato con successo'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il logout',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * POST /auth/reset-password-request - Request password reset
 */
router.post('/reset-password-request', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validate(req.body, resetRequestSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Email richiesta',
        details: error.details.map(d => d.message)
      });
    }

    const { email } = value;
    const sanitizedEmail = sanitizeEmail(email);

    // Find user
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1 AND is_active = true',
      [sanitizedEmail]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Se l\'email esiste, riceverai le istruzioni per il reset'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store reset token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, resetToken, expiresAt, req.ip]
    );

    // TODO: Send email with reset link
    // For now, log it (in production, use email service)
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: 'Se l\'email esiste, riceverai le istruzioni per il reset',
      // REMOVE IN PRODUCTION - only for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la richiesta di reset',
      code: 'RESET_REQUEST_ERROR'
    });
  }
});

/**
 * POST /auth/reset-password - Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validate(req.body, resetPasswordSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Errore di validazione',
        details: error.details.map(d => d.message)
      });
    }

    const { token, newPassword } = value;

    // Find valid reset token
    const result = await pool.query(
      `SELECT pr.*, u.id as user_id, u.email
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token = $1 AND pr.used_at IS NULL AND pr.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Token non valido o scaduto',
        code: 'INVALID_TOKEN'
      });
    }

    const resetData = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, resetData.user_id]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = $1',
      [resetData.id]
    );

    // Revoke all refresh tokens for security
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [resetData.user_id]
    );

    res.json({
      success: true,
      message: 'Password reimpostata con successo'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il reset della password',
      code: 'RESET_ERROR'
    });
  }
});

/**
 * GET /auth/me - Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, plan, email_verified, created_at, last_login
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utente non trovato',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il recupero dei dati utente',
      code: 'GET_USER_ERROR'
    });
  }
});

module.exports = router;
