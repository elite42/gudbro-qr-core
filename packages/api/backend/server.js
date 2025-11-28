// Module 6: API & Integrations - Main Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const { createClient } = require('redis');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Routes
const apiKeysRoutes = require('./routes/api-keys');
const webhooksRoutes = require('./routes/webhooks');
const usageRoutes = require('./routes/usage');

// Middleware
const { authenticateApiKey, logApiResponse } = require('./middleware/apiAuth');
const { apiKeyRateLimit, globalRateLimit } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3005;

// ============================================
// Database Setup
// ============================================

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/qr_platform',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected');
  }
});

// ============================================
// Redis Setup
// ============================================

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('connect', () => console.log('✅ Redis connected'));

redis.connect().catch(console.error);

// Make db and redis available to routes
app.locals.db = db;
app.locals.redis = redis;

// ============================================
// Middleware
// ============================================

app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Global rate limit (by IP)
app.use(globalRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  message: 'Too many requests from this IP address'
}));

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'api-integrations',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API Documentation (Swagger)
// ============================================

try {
  const swaggerDocument = YAML.load('./docs/openapi.yaml');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'QR Platform API Documentation',
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  console.log('📚 Swagger UI available at /docs');
} catch (error) {
  console.warn('⚠️  Swagger documentation not available:', error.message);
}

// ============================================
// Routes (Protected with JWT from Module 1)
// ============================================

// Note: In production, these routes should be protected with JWT auth
// from Module 1. For standalone testing, we'll skip JWT validation.

// Middleware to simulate user from JWT (replace with real JWT auth)
app.use((req, res, next) => {
  // In production, extract from JWT token
  // For now, use test user
  req.user = {
    id: process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000'
  };
  next();
});

// Mount routes
app.use('/api/keys', apiKeysRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/usage', usageRoutes);

// ============================================
// Public API Example (with API Key auth)
// ============================================

// Example of API endpoint that uses API key authentication
app.get('/api/qr',
  authenticateApiKey,
  apiKeyRateLimit(),
  logApiResponse,
  async (req, res) => {
    // This would normally call Module 1's QR listing
    res.json({
      message: 'This is an example endpoint that requires API key authentication',
      authenticated_as: req.apiKey.name,
      permissions: req.apiKey.permissions,
      rate_limit: {
        limit: req.apiKey.rate_limit,
        remaining: res.getHeader('X-RateLimit-Remaining')
      }
    });
  }
);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    documentation: '/docs'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// Server Start
// ============================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Module 6: API & Integrations Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  server.close(async () => {
    console.log('Server closed');
    
    await db.end();
    console.log('Database pool closed');
    
    await redis.quit();
    console.log('Redis connection closed');
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  server.close(async () => {
    await db.end();
    await redis.quit();
    process.exit(0);
  });
});

module.exports = app;
