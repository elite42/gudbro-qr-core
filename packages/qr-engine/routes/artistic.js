/**
 * Artistic QR Routes
 * POST /qr/artistic - Generate artistic QR (async via queue)
 * GET /qr/artistic/:jobId - Get job status
 * GET /qr/artistic/styles - List available styles
 */

import express from 'express';
import { artisticStyles, getStylesByCategory, getCategories } from '../utils/styles-library.js';
import { generateCacheKey, estimateCost } from '../services/artistic-qr-service.js';
import { getCached } from '../services/cache-manager.js';
import { queueArtisticQR, getJobStatus } from '../workers/queue-worker.js';

const router = express.Router();

/**
 * POST /qr/artistic
 * Generate artistic QR code (async)
 */
router.post('/artistic', async (req, res) => {
  try {
    const { 
      url, 
      style = 'sunset', 
      customPrompt, 
      options = {},
      qualityCheck = true // Enable by default
    } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Check cache
    const cacheKey = generateCacheKey(url, customPrompt || style, options);
    const cached = await getCached(cacheKey);
    
    if (cached) {
      return res.json({
        status: 'completed',
        cached: true,
        result: cached
      });
    }

    // Queue job
    const job = await queueArtisticQR({
      url,
      style,
      customPrompt,
      options,
      cacheKey,
      qualityCheck
    });

    // Estimate cost
    const cost = estimateCost(options);

    res.json({
      status: 'queued',
      jobId: job.jobId,
      estimatedCost: `$${cost}`,
      estimatedTime: qualityCheck ? '8-15 seconds' : '5-10 seconds',
      qualityCheck,
      checkStatusUrl: `/qr/artistic/${job.jobId}`
    });
  } catch (error) {
    console.error('Artistic QR error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /qr/artistic/:jobId
 * Get job status and result
 */
router.get('/artistic/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /qr/artistic/styles
 * List all available styles
 */
router.get('/artistic/styles', (req, res) => {
  const { category } = req.query;
  
  if (category) {
    const styles = getStylesByCategory(category);
    return res.json({ category, styles });
  }
  
  res.json({
    styles: artisticStyles,
    categories: getCategories()
  });
});

export default router;
