/**
 * Job Manager
 * Orchestrate bulk QR generation jobs
 */

const { v4: uuidv4 } = require('uuid');
const Queue = require('bull');
const path = require('path');
const fs = require('fs').promises;

// Redis connection (update with your Redis URL)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Bull queue
const bulkQueue = new Queue('bulk-qr-generation', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: false,
    removeOnFail: false
  }
});

// In-memory job storage (in production, use PostgreSQL)
const jobs = new Map();

/**
 * Create a new bulk job
 * @param {Array} qrData - Array of QR code data
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job details
 */
async function createJob(qrData, options = {}) {
  const jobId = uuidv4();
  
  // Calculate estimated completion time
  // Assume ~200ms per QR code
  const estimatedSeconds = Math.ceil((qrData.length * 200) / 1000);
  const estimatedCompletion = new Date(Date.now() + estimatedSeconds * 1000);
  
  // Create job record
  const job = {
    id: jobId,
    status: 'queued',
    totalRows: qrData.length,
    processed: 0,
    successful: 0,
    failed: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    estimatedCompletion: estimatedCompletion.toISOString(),
    options: {
      type: options.type || 'static',
      design: options.design || null,
      batchSize: options.batchSize || 100
    },
    error: null,
    resultsPath: null
  };
  
  // Store job
  jobs.set(jobId, job);
  
  // Add to queue
  await bulkQueue.add({
    jobId,
    qrData,
    options: job.options
  });
  
  return job;
}

/**
 * Get job details
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} Job details or null
 */
async function getJob(jobId) {
  return jobs.get(jobId) || null;
}

/**
 * Update job status
 * @param {string} jobId - Job ID
 * @param {Object} updates - Updates to apply
 */
async function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  // Apply updates
  Object.assign(job, updates);
  
  // Recalculate progress
  if (job.totalRows > 0) {
    job.progress = Math.round((job.processed / job.totalRows) * 100);
  }
  
  jobs.set(jobId, job);
}

/**
 * Cancel a job
 * @param {string} jobId - Job ID
 */
async function cancelJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  // Find Bull job and remove it
  const bullJobs = await bulkQueue.getJobs(['waiting', 'active', 'delayed']);
  const bullJob = bullJobs.find(bj => bj.data.jobId === jobId);
  
  if (bullJob) {
    await bullJob.remove();
  }
  
  // Update job status
  await updateJob(jobId, {
    status: 'cancelled',
    completedAt: new Date().toISOString()
  });
}

/**
 * Delete a job
 * @param {string} jobId - Job ID
 */
async function deleteJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  // Delete results file if exists
  if (job.resultsPath) {
    try {
      await fs.unlink(job.resultsPath);
    } catch (error) {
      console.error('Error deleting results file:', error);
    }
  }
  
  // Delete job record
  jobs.delete(jobId);
}

/**
 * Get results file path
 * @param {string} jobId - Job ID
 * @param {string} format - 'csv' or 'zip'
 * @returns {Promise<string|null>} File path or null
 */
async function getResultsFile(jobId, format = 'csv') {
  const job = jobs.get(jobId);
  if (!job || !job.resultsPath) {
    return null;
  }
  
  const resultsDir = path.dirname(job.resultsPath);
  let filePath;
  
  if (format === 'zip') {
    filePath = path.join(resultsDir, `${jobId}.zip`);
  } else {
    filePath = job.resultsPath; // CSV file
  }
  
  try {
    await fs.access(filePath);
    return filePath;
  } catch (error) {
    return null;
  }
}

/**
 * List jobs with filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated job list
 */
async function listJobs(filters = {}) {
  const {
    page = 1,
    limit = 20,
    status = null
  } = filters;
  
  let jobList = Array.from(jobs.values());
  
  // Filter by status if provided
  if (status) {
    jobList = jobList.filter(job => job.status === status);
  }
  
  // Sort by creation date (newest first)
  jobList.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  // Paginate
  const total = jobList.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = jobList.slice(startIndex, endIndex);
  
  return {
    jobs: paginatedJobs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get job statistics
 * @returns {Promise<Object>} Statistics
 */
async function getStats() {
  const allJobs = Array.from(jobs.values());
  
  const stats = {
    total: allJobs.length,
    queued: allJobs.filter(j => j.status === 'queued').length,
    processing: allJobs.filter(j => j.status === 'processing').length,
    completed: allJobs.filter(j => j.status === 'completed').length,
    failed: allJobs.filter(j => j.status === 'failed').length,
    cancelled: allJobs.filter(j => j.status === 'cancelled').length,
    totalQRsGenerated: allJobs.reduce((sum, j) => sum + j.successful, 0),
    totalQRsFailed: allJobs.reduce((sum, j) => sum + j.failed, 0)
  };
  
  return stats;
}

/**
 * Clean up old completed jobs (older than 7 days)
 */
async function cleanupOldJobs() {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const [jobId, job] of jobs.entries()) {
    if (job.status === 'completed' || job.status === 'failed') {
      const completedAt = new Date(job.completedAt).getTime();
      if (completedAt < sevenDaysAgo) {
        console.log(`Cleaning up old job: ${jobId}`);
        await deleteJob(jobId);
      }
    }
  }
}

// Schedule cleanup every day
setInterval(cleanupOldJobs, 24 * 60 * 60 * 1000);

module.exports = {
  createJob,
  getJob,
  updateJob,
  cancelJob,
  deleteJob,
  getResultsFile,
  listJobs,
  getStats,
  bulkQueue,
  jobs // Export for worker access
};
