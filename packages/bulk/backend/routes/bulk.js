/**
 * Bulk Operations Routes
 * Handles CSV upload and direct JSON bulk QR creation
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const csvParser = require('../utils/csvParser');
const jobManager = require('../utils/jobManager');
const { validateBulkUpload, validateDirectBulk } = require('../utils/validators');

/**
 * POST /api/bulk/upload
 * Upload CSV file for bulk QR generation
 */
router.post('/upload', async (req, res) => {
  try {
    const upload = req.app.locals.upload;
    
    // Handle file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          error: 'File upload failed', 
          message: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: 'No file uploaded' 
        });
      }

      try {
        // Parse options (if provided)
        let options = {};
        if (req.body.options) {
          try {
            options = typeof req.body.options === 'string' 
              ? JSON.parse(req.body.options) 
              : req.body.options;
          } catch (e) {
            return res.status(400).json({ 
              error: 'Invalid options format',
              message: 'Options must be valid JSON'
            });
          }
        }

        // Validate options
        const { error: validationError } = validateBulkUpload(options);
        if (validationError) {
          await fs.unlink(req.file.path); // Clean up uploaded file
          return res.status(400).json({ 
            error: 'Validation error',
            details: validationError.details.map(d => d.message)
          });
        }

        // Parse CSV file
        const qrData = await csvParser.parseCSV(req.file.path);
        
        // Clean up uploaded file
        await fs.unlink(req.file.path);

        // Validate row count
        if (qrData.length === 0) {
          return res.status(400).json({ 
            error: 'Empty CSV file',
            message: 'CSV file contains no valid rows'
          });
        }

        if (qrData.length > 10000) {
          return res.status(400).json({ 
            error: 'Too many rows',
            message: `Maximum 10,000 rows allowed. Your file has ${qrData.length} rows.`
          });
        }

        // Create job
        const job = await jobManager.createJob(qrData, options);

        // Return job details
        res.status(202).json({
          job_id: job.id,
          status: job.status,
          total_rows: qrData.length,
          estimated_completion: job.estimatedCompletion,
          message: 'Job queued for processing'
        });

      } catch (parseError) {
        // Clean up file if it exists
        try {
          await fs.unlink(req.file.path);
        } catch (e) {
          // File already deleted or doesn't exist
        }
        
        throw parseError;
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process upload',
      message: error.message 
    });
  }
});

/**
 * POST /api/bulk/direct
 * Direct JSON bulk QR creation (no file upload)
 */
router.post('/direct', async (req, res) => {
  try {
    const { qr_codes, options = {} } = req.body;

    // Validate request
    const { error } = validateDirectBulk({ qr_codes, options });
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Validate row count
    if (!qr_codes || qr_codes.length === 0) {
      return res.status(400).json({ 
        error: 'No QR codes provided',
        message: 'qr_codes array is empty or missing'
      });
    }

    if (qr_codes.length > 10000) {
      return res.status(400).json({ 
        error: 'Too many QR codes',
        message: `Maximum 10,000 QR codes allowed. You provided ${qr_codes.length}.`
      });
    }

    // Create job
    const job = await jobManager.createJob(qr_codes, options);

    // Return job details
    res.status(202).json({
      job_id: job.id,
      status: job.status,
      total_rows: qr_codes.length,
      estimated_completion: job.estimatedCompletion,
      message: 'Job queued for processing'
    });

  } catch (error) {
    console.error('Direct bulk error:', error);
    res.status(500).json({ 
      error: 'Failed to create bulk job',
      message: error.message 
    });
  }
});

/**
 * GET /api/bulk/template
 * Download CSV template file
 */
router.get('/template', (req, res) => {
  const template = `destination_url,title,folder,description
https://example.com/product1,Product 1,Marketing,QR code for Product 1
https://example.com/product2,Product 2,Marketing,QR code for Product 2
https://example.com/event,Event Page,Events,Event registration QR
https://example.com/menu,Restaurant Menu,Hospitality,Digital menu access`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="qr-bulk-template.csv"');
  res.send(template);
});

/**
 * GET /api/bulk/stats
 * Get bulk operations statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await jobManager.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error.message 
    });
  }
});

module.exports = router;
