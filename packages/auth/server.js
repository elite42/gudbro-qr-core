const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.AUTH_PORT || 3013;

// ===== DATABASE CONNECTION =====

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// ===== REDIS CONNECTION =====

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect()
  .then(() => console.log('✅ Redis connected'))
  .catch((err) => console.error('❌ Redis connection error:', err));

// ===== MIDDLEWARE =====

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3020', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from this origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting for auth endpoints (stricter than other services)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: {
    success: false,
    error: 'Troppi tentativi. Riprova più tardi.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Apply stricter rate limiting to login and register
app.use('/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Troppi tentativi di login. Riprova tra 15 minuti.',
    code: 'LOGIN_RATE_LIMIT'
  }
}));

app.use('/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 registrations per hour per IP
  message: {
    success: false,
    error: 'Troppi tentativi di registrazione. Riprova più tardi.',
    code: 'REGISTER_RATE_LIMIT'
  }
}));

app.use('/auth/reset-password-request', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset requests per hour
  message: {
    success: false,
    error: 'Troppi tentativi di reset password. Riprova più tardi.',
    code: 'RESET_RATE_LIMIT'
  }
}));

// ===== ROUTES =====

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database
    const dbResult = await pool.query('SELECT NOW()');
    const dbHealthy = !!dbResult.rows[0];

    // Check Redis
    let redisHealthy = false;
    try {
      await redisClient.ping();
      redisHealthy = true;
    } catch (err) {
      console.error('Redis health check failed:', err);
    }

    const allHealthy = dbHealthy && redisHealthy;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'auth',
      version: '1.0.0',
      services: {
        api: 'up',
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'QR Platform - Authentication Service',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      logout: 'POST /auth/logout',
      refresh: 'POST /auth/refresh',
      me: 'GET /auth/me',
      resetRequest: 'POST /auth/reset-password-request',
      resetPassword: 'POST /auth/reset-password'
    },
    documentation: 'https://docs.qrplatform.com/auth'
  });
});

// Auth routes
app.use('/auth', authRoutes);

// ===== ERROR HANDLING =====

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trovato',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS error: Origin not allowed',
      code: 'CORS_ERROR'
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Formato JSON non valido',
      code: 'INVALID_JSON'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Errore interno del server',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== GRACEFUL SHUTDOWN =====

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  // Close server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close database connections
  await pool.end();
  console.log('Database pool closed');

  // Close Redis connection
  await redisClient.quit();
  console.log('Redis connection closed');

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');

  server.close(() => {
    console.log('HTTP server closed');
  });

  await pool.end();
  await redisClient.quit();

  process.exit(0);
});

// ===== START SERVER =====

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('🔐 Auth Service');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = app;
