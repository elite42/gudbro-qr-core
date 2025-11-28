/**
 * QR Generator
 * Generate QR codes with optional customization
 */

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a QR code
 * @param {Object} qrData - QR code data
 * @param {Object} design - Design options (optional)
 * @returns {Promise<Object>} Generated QR code details
 */
async function generateQR(qrData, design = null) {
  try {
    // Generate short code (in production, check for collisions)
    const shortCode = generateShortCode();
    const shortUrl = `${process.env.BASE_URL || 'https://qr.me'}/${shortCode}`;
    
    // QR code options
    const qrOptions = {
      errorCorrectionLevel: design?.errorCorrectionLevel || 'M',
      type: 'image/png',
      margin: design?.margin || 4,
      width: design?.width || 1000,
      color: {
        dark: design?.foreground || '#000000',
        light: design?.background || '#FFFFFF'
      }
    };
    
    // Generate QR code image (base64)
    const qrImage = await QRCode.toDataURL(shortUrl, qrOptions);
    
    // Return QR code details
    return {
      id: uuidv4(),
      short_code: shortCode,
      short_url: shortUrl,
      destination_url: qrData.destination_url,
      title: qrData.title || 'Untitled',
      folder: qrData.folder || null,
      description: qrData.description || null,
      type: 'static', // In production, support dynamic
      qr_image: qrImage,
      qr_image_url: `${process.env.BASE_URL || 'https://qr.me'}/images/${shortCode}.png`,
      design: design || null,
      created_at: new Date().toISOString(),
      status: 'success'
    };
    
  } catch (error) {
    console.error('QR generation error:', error);
    return {
      ...qrData,
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Generate multiple QR codes in batch
 * @param {Array} qrDataArray - Array of QR data
 * @param {Object} design - Design options
 * @returns {Promise<Array>} Array of generated QR codes
 */
async function generateBatch(qrDataArray, design = null) {
  const results = [];
  
  for (const qrData of qrDataArray) {
    const result = await generateQR(qrData, design);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate short code (Base62)
 * @returns {string} 6-character short code
 */
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
}

/**
 * Apply custom design to QR code
 * @param {string} shortUrl - Short URL to encode
 * @param {Object} design - Design options
 * @returns {Promise<string>} Base64 QR image
 */
async function applyCustomDesign(shortUrl, design) {
  const qrOptions = {
    errorCorrectionLevel: design.errorCorrectionLevel || 'M',
    type: 'image/png',
    margin: design.margin || 4,
    width: design.width || 1000,
    color: {
      dark: design.foreground || '#000000',
      light: design.background || '#FFFFFF'
    }
  };
  
  // For advanced patterns (dots, rounded, etc.), you would need to use
  // a more advanced library like qr-image or custom canvas manipulation
  // For now, we use basic qrcode library
  
  const qrImage = await QRCode.toDataURL(shortUrl, qrOptions);
  return qrImage;
}

/**
 * Validate QR data before generation
 * @param {Object} qrData - QR data to validate
 * @returns {Object} Validation result
 */
function validateQRData(qrData) {
  const errors = [];
  
  if (!qrData.destination_url) {
    errors.push('destination_url is required');
  }
  
  // Validate URL format
  try {
    new URL(qrData.destination_url);
  } catch (error) {
    errors.push('Invalid URL format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate QR code as Buffer (for file storage)
 * @param {string} text - Text to encode
 * @param {Object} options - QR options
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateQRBuffer(text, options = {}) {
  const qrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'image/png',
    margin: options.margin || 4,
    width: options.width || 1000,
    color: {
      dark: options.foreground || '#000000',
      light: options.background || '#FFFFFF'
    }
  };
  
  return await QRCode.toBuffer(text, qrOptions);
}

/**
 * Generate QR code as SVG string
 * @param {string} text - Text to encode
 * @param {Object} options - QR options
 * @returns {Promise<string>} SVG string
 */
async function generateQRSVG(text, options = {}) {
  const qrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'svg',
    margin: options.margin || 4,
    width: options.width || 1000,
    color: {
      dark: options.foreground || '#000000',
      light: options.background || '#FFFFFF'
    }
  };
  
  return await QRCode.toString(text, qrOptions);
}

module.exports = {
  generateQR,
  generateBatch,
  generateShortCode,
  applyCustomDesign,
  validateQRData,
  generateQRBuffer,
  generateQRSVG
};
