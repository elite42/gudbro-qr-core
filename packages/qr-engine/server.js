const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initRedis, closeRedis, healthCheck, getCacheStats } = require('./utils/cache');
const qrRoutes = require('./routes/qr');
const qrDecodeRoutes = require('./routes/qrDecode');
const redirectRoutes = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes only (not redirects)
app.use('/qr', limiter);

// ===== ROUTES =====

// Health check endpoint
app.get('/health', async (req, res) => {
  const redisHealthy = await healthCheck();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      redis: redisHealthy ? 'up' : 'down',
      database: 'up' // TODO: Add DB health check
    }
  });
});

// Cache statistics endpoint
app.get('/cache/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      cache: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache stats'
    });
  }
});

// QR management routes
app.use('/qr', qrRoutes);

// QR decode & rework routes
app.use('/api/qr', qrDecodeRoutes);

// Redirect routes (short URLs)
app.use('/', redirectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    message: 'The requested resource does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====

async function startServer() {
  try {
    // Initialize Redis
    console.log('🔄 Initializing Redis...');
    await initRedis();
    console.log('✅ Redis initialized');

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 QR Platform - Module 1: QR Engine Core');
      console.log('='.repeat(50));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Base: http://localhost:${PORT}/qr`);
      console.log(`🔗 Redirect: http://localhost:${PORT}/:shortCode`);
      console.log('='.repeat(50) + '\n');
      console.log('📚 API Endpoints:');
      console.log('   POST   /qr                    - Create QR code');
      console.log('   GET    /qr                    - List QR codes');
      console.log('   GET    /qr/:id                - Get QR details');
      console.log('   PATCH  /qr/:id                - Update QR code');
      console.log('   DELETE /qr/:id                - Delete QR code');
      console.log('   POST   /api/qr/decode         - 🆕 Decode QR from image');
      console.log('   POST   /api/qr/rework         - 🆕 Decode & rework QR');
      console.log('   GET    /api/qr/rework/info    - 🆕 Rework info');
      console.log('   GET    /:shortCode            - Redirect to destination');
      console.log('   GET    /health                - Health check');
      console.log('   GET    /cache/stats           - Cache statistics');
      console.log('='.repeat(50) + '\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app; // For testing
