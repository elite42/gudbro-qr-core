/**
 * Bulk Generator Worker
 * Process bulk QR generation jobs from the queue
 */

const { bulkQueue, jobs } = require('../utils/jobManager');
const qrGenerator = require('../utils/qrGenerator');
const csvParser = require('../utils/csvParser');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

// Results directory
const RESULTS_DIR = path.join(__dirname, '../results');

// Ensure results directory exists
(async () => {
  try {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    console.log('✅ Results directory created/verified');
  } catch (error) {
    console.error('❌ Failed to create results directory:', error);
  }
})();

/**
 * Process a bulk QR generation job
 */
bulkQueue.process(async (job) => {
  const { jobId, qrData, options } = job.data;
  
  console.log(`\n🔄 Processing job: ${jobId}`);
  console.log(`   Total QR codes: ${qrData.length}`);
  console.log(`   Batch size: ${options.batchSize}`);
  
  // Get job record
  const jobRecord = jobs.get(jobId);
  if (!jobRecord) {
    throw new Error(`Job record not found: ${jobId}`);
  }
  
  // Update job status
  jobRecord.status = 'processing';
  jobRecord.startedAt = new Date().toISOString();
  jobs.set(jobId, jobRecord);
  
  // Results array
  const results = [];
  const batchSize = options.batchSize || 100;
  
  try {
    // Process in batches
    for (let i = 0; i < qrData.length; i += batchSize) {
      // Check if job was cancelled
      if (jobRecord.status === 'cancelled') {
        console.log(`❌ Job cancelled: ${jobId}`);
        throw new Error('Job cancelled by user');
      }
      
      const batch = qrData.slice(i, i + batchSize);
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(qrData.length / batchSize)}`);
      
      // Generate QR codes for this batch
      const batchResults = await qrGenerator.generateBatch(batch, options.design);
      results.push(...batchResults);
      
      // Update progress
      jobRecord.processed = results.length;
      jobRecord.successful = results.filter(r => r.status === 'success').length;
      jobRecord.failed = results.filter(r => r.status === 'failed').length;
      jobRecord.progress = Math.round((results.length / qrData.length) * 100);
      jobs.set(jobId, jobRecord);
      
      // Update Bull job progress
      job.progress(jobRecord.progress);
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < qrData.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Save results to files
    const resultsPath = await saveResults(jobId, results);
    
    // Update job as completed
    jobRecord.status = 'completed';
    jobRecord.completedAt = new Date().toISOString();
    jobRecord.resultsPath = resultsPath;
    jobs.set(jobId, jobRecord);
    
    console.log(`✅ Job completed: ${jobId}`);
    console.log(`   Successful: ${jobRecord.successful}`);
    console.log(`   Failed: ${jobRecord.failed}`);
    console.log(`   Results: ${resultsPath}\n`);
    
    return {
      jobId,
      status: 'completed',
      successful: jobRecord.successful,
      failed: jobRecord.failed
    };
    
  } catch (error) {
    console.error(`❌ Job failed: ${jobId}`, error);
    
    // Update job as failed
    jobRecord.status = error.message === 'Job cancelled by user' ? 'cancelled' : 'failed';
    jobRecord.completedAt = new Date().toISOString();
    jobRecord.error = error.message;
    jobs.set(jobId, jobRecord);
    
    throw error;
  }
});

/**
 * Save results to CSV and ZIP files
 * @param {string} jobId - Job ID
 * @param {Array} results - QR generation results
 * @returns {Promise<string>} Path to CSV file
 */
async function saveResults(jobId, results) {
  // Generate CSV
  const csv = csvParser.generateResultsCSV(results);
  const csvPath = path.join(RESULTS_DIR, `${jobId}.csv`);
  await fs.writeFile(csvPath, csv);
  
  // Generate ZIP with QR images
  const zipPath = path.join(RESULTS_DIR, `${jobId}.zip`);
  await createZipArchive(results, zipPath);
  
  return csvPath;
}

/**
 * Create ZIP archive with QR code images
 * @param {Array} results - QR generation results
 * @param {string} zipPath - Path to save ZIP file
 */
async function createZipArchive(results, zipPath) {
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    output.on('close', () => {
      console.log(`   ZIP created: ${archive.pointer()} bytes`);
      resolve();
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add each QR code image to the archive
    for (const qr of results) {
      if (qr.status === 'success' && qr.qr_image) {
        // Extract base64 data
        const base64Data = qr.qr_image.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Add to archive
        const filename = `${qr.short_code || 'qr'}.png`;
        archive.append(buffer, { name: filename });
      }
    }
    
    archive.finalize();
  });
}

/**
 * Handle job completion
 */
bulkQueue.on('completed', (job, result) => {
  console.log(`✅ Bull job completed: ${job.id}`);
});

/**
 * Handle job failure
 */
bulkQueue.on('failed', (job, err) => {
  console.error(`❌ Bull job failed: ${job.id}`, err.message);
});

/**
 * Handle job stalled (worker died)
 */
bulkQueue.on('stalled', (job) => {
  console.warn(`⚠️  Bull job stalled: ${job.id}`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing worker...');
  await bulkQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing worker...');
  await bulkQueue.close();
  process.exit(0);
});

console.log('🚀 Bulk Generator Worker started');
console.log(`   Listening to queue: bulk-qr-generation`);
console.log(`   Results directory: ${RESULTS_DIR}`);
console.log(`   Concurrency: 1 (configurable)`);
console.log('   Waiting for jobs...\n');
