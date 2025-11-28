/**
 * Artistic QR Service
 * Handles generation of artistic QR codes via Replicate API
 */

import Replicate from 'replicate';
import crypto from 'crypto';
import { getStyle } from '../utils/styles-library.js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'r8_0ilY3ShSwgE5VFzuAuS1dgNcAykUDlx0nYTI3'
});

const MODEL = "monster-labs/control_v1p_sd15_qrcode_monster:4c0e63f6e8e5748e0ef3a284aff5ed22eb87bb7b64e23253de6badf67e555b98";

/**
 * Generate cache key for artistic QR
 */
export function generateCacheKey(url, styleOrPrompt, options = {}) {
  const data = JSON.stringify({ url, styleOrPrompt, options });
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Generate artistic QR code
 */
export async function generateArtisticQR({
  url,
  style = 'sunset',
  customPrompt = null,
  options = {}
}) {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  // Get style or use custom prompt
  let prompt, negativePrompt;
  if (customPrompt) {
    prompt = customPrompt;
    negativePrompt = 'low quality, blurry, distorted, ugly, bad';
  } else {
    const styleData = getStyle(style);
    if (!styleData) {
      throw new Error(`Style "${style}" not found`);
    }
    prompt = styleData.prompt;
    negativePrompt = styleData.negativePrompt;
  }

  // Default options
  const replicateInput = {
    prompt,
    negative_prompt: negativePrompt,
    qr_code_content: url,
    controlnet_conditioning_scale: options.conditioningScale || 1.5,
    guidance_scale: options.guidanceScale || 7.5,
    num_inference_steps: options.steps || 30,
    seed: options.seed || Math.floor(Math.random() * 1000000),
    width: options.width || 768,
    height: options.height || 768
  };

  console.log(`🎨 Generating artistic QR: ${style || 'custom'}`);
  console.log(`📍 URL: ${url}`);

  try {
    const output = await replicate.run(MODEL, { input: replicateInput });
    
    // Replicate returns array of image URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    console.log(`✅ Generated: ${imageUrl}`);
    
    return {
      imageUrl,
      prompt,
      url,
      style: customPrompt ? 'custom' : style,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Replicate error:', error);
    throw new Error(`Failed to generate artistic QR: ${error.message}`);
  }
}

/**
 * Estimate cost for generation
 */
export function estimateCost(options = {}) {
  const steps = options.steps || 30;
  const baseCost = 0.0023; // per second
  const estimatedTime = steps / 5; // ~5 steps per second
  return (baseCost * estimatedTime).toFixed(4);
}

export default {
  generateArtisticQR,
  generateCacheKey,
  estimateCost
};
