/**
 * Job Management Routes
 * Handle job status, results download, and cancellation
 */

const express = require('express');
const router = express.Router();
const jobManager = require('../utils/jobManager');
const path = require('path');
const fs = require('fs').promises;

/**
 * GET /api/jobs/:job_id
 * Get job status and details
 */
router.get('/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;
    
    const job = await jobManager.getJob(job_id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found',
        message: `No job found with ID: ${job_id}`
      });
    }

    res.json({
      job_id: job.id,
      status: job.status,
      total_rows: job.totalRows,
      processed: job.processed,
      successful: job.successful,
      failed: job.failed,
      progress: job.progress,
      created_at: job.createdAt,
      started_at: job.startedAt,
      completed_at: job.completedAt,
      estimated_completion: job.estimatedCompletion,
      error: job.error,
      options: job.options
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      error: 'Failed to get job status',
      message: error.message 
    });
  }
});

/**
 * GET /api/jobs/:job_id/results
 * Download job results (CSV or ZIP)
 */
router.get('/:job_id/results', async (req, res) => {
  try {
    const { job_id } = req.params;
    const { format = 'csv' } = req.query;

    const job = await jobManager.getJob(job_id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found'
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Job not completed',
        message: `Job is currently: ${job.status}`,
        current_status: job.status
      });
    }

    if (!job.resultsPath) {
      return res.status(404).json({ 
        error: 'Results not available',
        message: 'No results file generated for this job'
      });
    }

    // Get results file
    const resultsFile = await jobManager.getResultsFile(job_id, format);
    
    if (!resultsFile) {
      return res.status(404).json({ 
        error: 'Results file not found',
        message: 'Results file may have been deleted'
      });
    }

    // Set appropriate headers
    const filename = format === 'zip' 
      ? `qr-codes-${job_id}.zip`
      : `qr-results-${job_id}.csv`;

    const contentType = format === 'zip' 
      ? 'application/zip'
      : 'text/csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file
    res.sendFile(resultsFile);

  } catch (error) {
    console.error('Download results error:', error);
    res.status(500).json({ 
      error: 'Failed to download results',
      message: error.message 
    });
  }
});

/**
 * POST /api/jobs/:job_id/cancel
 * Cancel a running job
 */
router.post('/:job_id/cancel', async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await jobManager.getJob(job_id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found'
      });
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({ 
        error: 'Cannot cancel job',
        message: `Job already ${job.status}`,
        current_status: job.status
      });
    }

    if (job.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Job already cancelled',
        message: 'This job was previously cancelled'
      });
    }

    // Cancel the job
    await jobManager.cancelJob(job_id);

    res.json({
      message: 'Job cancelled successfully',
      job_id: job_id,
      status: 'cancelled'
    });

  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel job',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/jobs/:job_id
 * Delete a job and its results
 */
router.delete('/:job_id', async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await jobManager.getJob(job_id);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Job not found'
      });
    }

    if (job.status === 'processing') {
      return res.status(400).json({ 
        error: 'Cannot delete running job',
        message: 'Please cancel the job first'
      });
    }

    // Delete the job
    await jobManager.deleteJob(job_id);

    res.json({
      message: 'Job deleted successfully',
      job_id: job_id
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      error: 'Failed to delete job',
      message: error.message 
    });
  }
});

/**
 * GET /api/jobs
 * List all jobs (with pagination)
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status 
    } = req.query;

    const jobs = await jobManager.listJobs({
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json(jobs);

  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to list jobs',
      message: error.message 
    });
  }
});

module.exports = router;
