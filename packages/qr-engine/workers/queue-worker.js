/**
 * Queue Worker for Artistic QR Generation
 * Processes jobs from Bull queue
 */

import Queue from 'bull';
import { generateArtisticQR } from '../services/artistic-qr-service.js';
import { uploadFromUrl } from '../services/gcs-uploader.js';
import { setCache } from '../services/cache-manager.js';
import { testReadability, suggestRetryParams } from '../services/readability-test.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queue
export const artisticQRQueue = new Queue('artistic-qr', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Process jobs
artisticQRQueue.process(async (job) => {
  const { url, style, customPrompt, options, cacheKey, qualityCheck = true } = job.data;
  
  console.log(`🎨 Processing job ${job.id}: ${style || 'custom'}`);
  
  let attempts = 0;
  let currentOptions = { ...options };
  let result;
  let readabilityResult;
  
  while (attempts < 2) {
    attempts++;
    
    try {
      // Generate artistic QR via Replicate
      result = await generateArtisticQR({
        url,
        style,
        customPrompt,
        options: currentOptions
      });
      
      // Test readability if enabled
      if (qualityCheck) {
        console.log(`🔍 Testing readability (attempt ${attempts})...`);
        readabilityResult = await testReadability(result.imageUrl);
        
        console.log(`📊 Readability score: ${readabilityResult.score}/100 (Grade: ${readabilityResult.grade})`);
        
        // If score is poor and first attempt, retry with adjusted params
        if (readabilityResult.score < 70 && attempts === 1) {
          const retryParams = suggestRetryParams(currentOptions, readabilityResult.score);
          if (retryParams) {
            console.log(`🔄 Retrying with adjusted parameters...`);
            currentOptions = retryParams;
            continue;
          }
        }
      }
      
      break; // Success, exit loop
    } catch (error) {
      if (attempts >= 2) throw error;
      console.log(`⚠️ Attempt ${attempts} failed, retrying...`);
    }
  }
  
  // Upload to GCS
  const gcsUrl = await uploadFromUrl(result.imageUrl, {
    url,
    style: result.style,
    prompt: result.prompt
  });
  
  const finalResult = {
    ...result,
    gcsUrl,
    replicateUrl: result.imageUrl,
    readability: readabilityResult || null,
    attempts
  };
  
  // Cache result
  if (cacheKey) {
    await setCache(cacheKey, finalResult);
  }
  
  console.log(`✅ Job ${job.id} completed (score: ${readabilityResult?.score || 'N/A'})`);
  
  return finalResult;
});

// Error handling
artisticQRQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

artisticQRQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result.gcsUrl);
});

/**
 * Add job to queue
 */
export async function queueArtisticQR(data) {
  const job = await artisticQRQueue.add(data, {
    priority: data.priority || 5
  });
  
  console.log(`📋 Queued job ${job.id}`);
  
  return {
    jobId: job.id,
    status: 'queued'
  };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId) {
  const job = await artisticQRQueue.getJob(jobId);
  
  if (!job) {
    return { status: 'not_found' };
  }
  
  const state = await job.getState();
  const progress = job.progress();
  
  if (state === 'completed') {
    return {
      status: 'completed',
      result: job.returnvalue
    };
  }
  
  if (state === 'failed') {
    return {
      status: 'failed',
      error: job.failedReason
    };
  }
  
  return {
    status: state,
    progress
  };
}

export default {
  queueArtisticQR,
  getJobStatus,
  artisticQRQueue
};
