/**
 * Artistic QR Module - Main Entry Point
 * Exports all services, routes, and workers
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import artisticRouter from './routes/artistic.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/qr', artisticRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'artistic-qr' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🎨 Artistic QR API running on port ${PORT}`);
  });
}

export default app;

// Export services for programmatic use
export { generateArtisticQR } from './services/artistic-qr-service.js';
export { queueArtisticQR, getJobStatus } from './workers/queue-worker.js';
export { artisticStyles } from './utils/styles-library.js';
