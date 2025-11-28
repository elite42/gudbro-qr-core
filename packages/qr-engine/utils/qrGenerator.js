const QRCode = require('qrcode');

/**
 * QR Code generation utility
 * Uses node-qrcode library for image generation
 */

/**
 * Generate QR code as PNG data URL (base64)
 * 
 * @param {string} url - URL to encode in QR
 * @param {Object} options - QR generation options
 * @returns {Promise<string>} - Base64 data URL
 */
async function generateQRCode(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: process.env.QR_ERROR_CORRECTION || 'M',
    type: 'image/png',
    width: parseInt(process.env.QR_IMAGE_SIZE) || 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(url, mergedOptions);
    return qrDataURL;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as Buffer (for file storage)
 * 
 * @param {string} url - URL to encode in QR
 * @param {Object} options - QR generation options
 * @returns {Promise<Buffer>} - PNG buffer
 */
async function generateQRBuffer(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: process.env.QR_ERROR_CORRECTION || 'M',
    width: parseInt(process.env.QR_IMAGE_SIZE) || 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const buffer = await QRCode.toBuffer(url, mergedOptions);
    return buffer;
  } catch (error) {
    console.error('QR buffer generation error:', error);
    throw new Error('Failed to generate QR buffer');
  }
}

/**
 * Generate QR code as SVG string
 * 
 * @param {string} url - URL to encode in QR
 * @param {Object} options - QR generation options
 * @returns {Promise<string>} - SVG string
 */
async function generateQRSVG(url, options = {}) {
  const defaultOptions = {
    errorCorrectionLevel: process.env.QR_ERROR_CORRECTION || 'M',
    width: parseInt(process.env.QR_IMAGE_SIZE) || 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const svg = await QRCode.toString(url, { ...mergedOptions, type: 'svg' });
    return svg;
  } catch (error) {
    console.error('QR SVG generation error:', error);
    throw new Error('Failed to generate QR SVG');
  }
}

/**
 * Validate URL before QR generation
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Calculate estimated QR code capacity
 * Based on error correction level
 * 
 * @param {string} level - Error correction level (L, M, Q, H)
 * @returns {number} - Max characters
 */
function getQRCapacity(level = 'M') {
  const capacities = {
    'L': 2953,  // Low (7% error correction)
    'M': 2331,  // Medium (15% error correction)
    'Q': 1663,  // Quartile (25% error correction)
    'H': 1273   // High (30% error correction)
  };
  return capacities[level] || capacities['M'];
}

module.exports = {
  generateQRCode,
  generateQRBuffer,
  generateQRSVG,
  isValidURL,
  getQRCapacity
};
