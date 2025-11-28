/**
 * Module 4: Bulk Operations - Main Server
 * Handles bulk QR code generation from CSV uploads
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const bulkRoutes = require('./routes/bulk');
const jobsRoutes = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Make upload middleware available to routes
app.locals.upload = upload;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    module: 'bulk-operations',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/bulk', bulkRoutes);
app.use('/api/jobs', jobsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Module 4 (Bulk Operations) running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   - POST /api/bulk/upload`);
  console.log(`   - POST /api/bulk/direct`);
  console.log(`   - GET  /api/bulk/template`);
  console.log(`   - GET  /api/jobs/:id`);
  console.log(`   - GET  /api/jobs/:id/results`);
  console.log(`   - POST /api/jobs/:id/cancel`);
});

module.exports = app;
