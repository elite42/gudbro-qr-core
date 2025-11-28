/**
 * QR Readability Test Service
 * Tests artistic QR codes for scanability across devices
 */

import Jimp from 'jimp';
import jsQR from 'jsqr';
import axios from 'axios';

/**
 * Test QR readability with different blur levels (simulating device quality)
 */
export async function testReadability(imageUrl) {
  try {
    // Download image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const image = await Jimp.read(Buffer.from(response.data));
    
    const tests = [
      { device: 'modern', blur: 0, name: 'iPhone 12+ / Android 2020+' },
      { device: 'mid-range', blur: 1, name: 'iPhone 8-11 / Android 2017-2019' },
      { device: 'old', blur: 2, name: 'iPhone 6-7 / Android 2015-2016' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      const testImage = image.clone();
      
      // Apply blur to simulate lower quality cameras
      if (test.blur > 0) {
        testImage.blur(test.blur);
      }
      
      // Get image data
      const imageData = {
        data: new Uint8ClampedArray(testImage.bitmap.data),
        width: testImage.bitmap.width,
        height: testImage.bitmap.height
      };
      
      // Try to decode QR
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      results.push({
        device: test.device,
        deviceName: test.name,
        success: !!code,
        data: code?.data || null,
        confidence: code ? calculateConfidence(code) : 0
      });
    }
    
    // Calculate overall score
    const successCount = results.filter(r => r.success).length;
    const score = Math.round((successCount / tests.length) * 100);
    
    // Determine grade
    let grade;
    if (score >= 90) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 50) grade = 'C';
    else grade = 'F';
    
    return {
      score,
      grade,
      passedTests: successCount,
      totalTests: tests.length,
      results,
      recommendation: getRecommendation(score)
    };
  } catch (error) {
    console.error('Readability test error:', error);
    throw new Error(`Failed to test readability: ${error.message}`);
  }
}

/**
 * Calculate confidence score from QR code detection
 */
function calculateConfidence(qrCode) {
  // Based on location pattern strength
  const { topLeftFinderPattern, topRightFinderPattern, bottomLeftFinderPattern } = qrCode.location;
  
  // Simple confidence based on pattern detection
  const hasAllPatterns = !!(topLeftFinderPattern && topRightFinderPattern && bottomLeftFinderPattern);
  return hasAllPatterns ? 100 : 50;
}

/**
 * Get recommendation based on score
 */
function getRecommendation(score) {
  if (score >= 90) {
    return 'Excellent readability across all devices. Safe for printing.';
  } else if (score >= 70) {
    return 'Good readability on modern devices. May have issues on older phones.';
  } else if (score >= 50) {
    return 'Limited readability. Consider increasing conditioning scale or using simpler style.';
  } else {
    return 'Poor readability. Regenerate with higher conditioning scale (1.7-2.0).';
  }
}

/**
 * Retry generation with adjusted parameters if readability is poor
 */
export function suggestRetryParams(currentParams, score) {
  if (score >= 70) {
    return null; // No retry needed
  }
  
  // Increase conditioning scale for better QR pattern visibility
  const newScale = Math.min(2.0, (currentParams.conditioningScale || 1.5) + 0.3);
  
  return {
    ...currentParams,
    conditioningScale: newScale,
    guidance_scale: Math.max(currentParams.guidance_scale || 7.5, 8.0)
  };
}

export default {
  testReadability,
  suggestRetryParams
};
