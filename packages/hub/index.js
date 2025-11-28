// Module 9: Hub Aggregator - Main Server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import hubRoutes from './backend/routes/hub.js';
import linkRoutes from './backend/routes/links.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    module: 'hub-aggregator',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/', hubRoutes);
app.use('/', linkRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Module 9 (Hub Aggregator) running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
