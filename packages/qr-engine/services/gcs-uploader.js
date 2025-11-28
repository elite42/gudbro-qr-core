/**
 * GCS Storage Manager
 * Upload and manage artistic QR images in Google Cloud Storage
 */

import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import crypto from 'crypto';

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_IMAGES || 'qr-images-artistic';

/**
 * Upload image from URL to GCS
 */
export async function uploadFromUrl(imageUrl, metadata = {}) {
  try {
    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // Generate filename
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const filename = `artistic/${hash}.png`;
    
    // Upload to GCS
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);
    
    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString()
        }
      },
      public: true
    });
    
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    console.log('☁️  Uploaded to GCS:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('GCS upload error:', error);
    throw new Error(`Failed to upload to GCS: ${error.message}`);
  }
}

/**
 * Delete file from GCS
 */
export async function deleteFile(filename) {
  try {
    const bucket = storage.bucket(bucketName);
    await bucket.file(filename).delete();
    console.log('🗑️  Deleted from GCS:', filename);
  } catch (error) {
    console.error('GCS delete error:', error);
  }
}

/**
 * List files in bucket
 */
export async function listFiles(prefix = 'artistic/') {
  try {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix });
    return files.map(f => f.name);
  } catch (error) {
    console.error('GCS list error:', error);
    return [];
  }
}

export default {
  uploadFromUrl,
  deleteFile,
  listFiles
};
