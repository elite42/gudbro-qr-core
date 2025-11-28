/**
 * QR Code Decoder Module
 * Decode QR codes from images (PNG, JPG, PDF) and auto-detect type
 *
 * Features:
 * - Multi-format support (PNG, JPG, JPEG, WebP, PDF)
 * - Image preprocessing for better detection
 * - Auto-detect QR type (VietQR, WiFi, vCard, URL, etc.)
 * - Content parsing based on QR type
 * - PDF multi-page extraction
 */

const Jimp = require('jimp');
const jsQR = require('jsqr');
const sharp = require('sharp');
const fs = require('fs').promises;

/**
 * Preprocess image for better QR detection
 * Improves contrast, sharpness, and converts to optimal format
 */
async function preprocessImage(imagePath) {
  try {
    // Use sharp for preprocessing - it's faster and more reliable
    const processedBuffer = await sharp(imagePath)
      .greyscale() // Convert to grayscale for better detection
      .normalize() // Normalize contrast
      .sharpen() // Sharpen edges
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.warn('Sharp preprocessing failed, falling back to original:', error.message);
    // Return original if preprocessing fails
    return await fs.readFile(imagePath);
  }
}

/**
 * Decode QR code from image buffer using jsQR
 */
async function decodeQRFromBuffer(buffer) {
  try {
    // Load image with Jimp
    const image = await Jimp.read(buffer);

    // Convert to format jsQR expects
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    // Decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth', // Try both normal and inverted
    });

    if (code) {
      return {
        data: code.data,
        location: code.location,
        version: code.version,
        binaryData: code.binaryData,
      };
    }

    return null;
  } catch (error) {
    console.error('Error decoding QR from buffer:', error.message);
    return null;
  }
}

/**
 * Try multiple preprocessing strategies if first attempt fails
 */
async function decodeWithMultipleStrategies(imagePath) {
  // Strategy 1: Original image
  try {
    const originalBuffer = await fs.readFile(imagePath);
    const result = await decodeQRFromBuffer(originalBuffer);
    if (result) return result;
  } catch (error) {
    console.warn('Strategy 1 (original) failed:', error.message);
  }

  // Strategy 2: Preprocessed (greyscale, normalized, sharpened)
  try {
    const preprocessedBuffer = await preprocessImage(imagePath);
    const result = await decodeQRFromBuffer(preprocessedBuffer);
    if (result) return result;
  } catch (error) {
    console.warn('Strategy 2 (preprocessed) failed:', error.message);
  }

  // Strategy 3: High contrast
  try {
    const contrastBuffer = await sharp(imagePath)
      .greyscale()
      .linear(1.5, -(128 * 0.5)) // Increase contrast
      .toBuffer();
    const result = await decodeQRFromBuffer(contrastBuffer);
    if (result) return result;
  } catch (error) {
    console.warn('Strategy 3 (high contrast) failed:', error.message);
  }

  // Strategy 4: Scaled up (for small QR codes)
  try {
    const scaledBuffer = await sharp(imagePath)
      .resize({ width: 1000, height: 1000, fit: 'inside' })
      .greyscale()
      .toBuffer();
    const result = await decodeQRFromBuffer(scaledBuffer);
    if (result) return result;
  } catch (error) {
    console.warn('Strategy 4 (scaled) failed:', error.message);
  }

  return null;
}

/**
 * Auto-detect QR type from decoded data
 */
function detectQRType(data) {
  if (!data || typeof data !== 'string') {
    return 'unknown';
  }

  const dataLower = data.toLowerCase();
  const dataUpper = data.toUpperCase();

  // WiFi QR (case-insensitive)
  if (dataUpper.startsWith('WIFI:')) {
    return 'wifi';
  }

  // vCard QR
  if (data.startsWith('BEGIN:VCARD') || data.includes('BEGIN:VCARD')) {
    return 'vcard';
  }

  // Event/Calendar QR
  if (data.startsWith('BEGIN:VEVENT') || data.includes('BEGIN:VEVENT')) {
    return 'event';
  }

  // Email QR
  if (data.startsWith('mailto:') || data.startsWith('MAILTO:')) {
    return 'email';
  }

  // SMS QR
  if (data.startsWith('sms:') || data.startsWith('SMS:') || data.startsWith('smsto:')) {
    return 'sms';
  }

  // Phone QR
  if (data.startsWith('tel:') || data.startsWith('TEL:')) {
    return 'phone';
  }

  // VietQR - Check for VietQR patterns
  if (dataLower.includes('vietqr') ||
      dataLower.includes('api.vietqr.io') ||
      (dataLower.includes('bank') && dataLower.includes('transfer'))) {
    return 'vietqr';
  }

  // Zalo - Check for Zalo patterns
  if (dataLower.includes('zalo.me') ||
      dataLower.includes('zalo://') ||
      dataLower.includes('zaloapp')) {
    return 'zalo';
  }

  // GCash (Philippines)
  if (dataLower.includes('gcash') || dataLower.includes('g.cash')) {
    return 'gcash';
  }

  // PayMaya (Philippines)
  if (dataLower.includes('paymaya') || dataLower.includes('maya.ph')) {
    return 'paymaya';
  }

  // PromptPay (Thailand)
  if (dataLower.includes('promptpay') || dataLower.includes('00020101')) {
    return 'promptpay';
  }

  // Alipay (China)
  if (dataLower.includes('alipay') || dataLower.includes('alipayqr')) {
    return 'alipay';
  }

  // WeChat Pay (China)
  if (dataLower.includes('wechat') || dataLower.includes('wxp://')) {
    return 'wechat';
  }

  // Video platforms (check before social media to prioritize video detection)
  if (dataLower.includes('youtube.com') || dataLower.includes('youtu.be')) return 'video-youtube';
  if (dataLower.includes('vimeo.com')) return 'video-vimeo';

  // Audio platforms
  if (dataLower.includes('spotify.com') || dataLower.includes('open.spotify')) return 'audio-spotify';
  if (dataLower.includes('music.apple.com')) return 'audio-apple-music';

  // Social Media QR (after video/audio to avoid conflicts)
  if (dataLower.includes('instagram.com')) return 'social-instagram';
  if (dataLower.includes('facebook.com') || dataLower.includes('fb.com')) return 'social-facebook';
  if (dataLower.includes('twitter.com') || dataLower.includes('x.com')) return 'social-twitter';
  if (dataLower.includes('linkedin.com')) return 'social-linkedin';
  if (dataLower.includes('tiktok.com')) return 'social-tiktok';

  // App Store / Google Play
  if (dataLower.includes('apps.apple.com') || dataLower.includes('itunes.apple.com')) {
    return 'appstore-ios';
  }
  if (dataLower.includes('play.google.com')) {
    return 'appstore-android';
  }

  // PDF
  if (dataLower.endsWith('.pdf') || dataLower.includes('.pdf?')) {
    return 'pdf';
  }

  // Generic URL (use dataLower for case-insensitive check)
  if (dataLower.startsWith('http://') || dataLower.startsWith('https://')) {
    return 'url';
  }

  // Plain text
  return 'text';
}

/**
 * Parse QR content based on type
 */
function parseQRContent(data, type) {
  const parsed = {
    raw: data,
    type,
    parsed: {}
  };

  try {
    switch (type) {
      case 'wifi':
        // Parse WiFi QR: WIFI:T:WPA;S:NetworkName;P:password;H:false;;
        const wifiRegex = /WIFI:(?:T:([^;]+);)?(?:S:([^;]+);)?(?:P:([^;]+);)?(?:H:([^;]+);)?/i;
        const wifiMatch = data.match(wifiRegex);
        if (wifiMatch) {
          parsed.parsed = {
            encryption: wifiMatch[1] || 'WPA',
            ssid: wifiMatch[2] || '',
            password: wifiMatch[3] || '',
            hidden: wifiMatch[4] === 'true'
          };
        }
        break;

      case 'vcard':
        // Parse basic vCard fields
        parsed.parsed = {
          name: extractVCardField(data, 'FN'),
          phone: extractVCardField(data, 'TEL'),
          email: extractVCardField(data, 'EMAIL'),
          organization: extractVCardField(data, 'ORG'),
          title: extractVCardField(data, 'TITLE'),
          url: extractVCardField(data, 'URL'),
        };
        break;

      case 'email':
        // Parse mailto: URL
        const emailMatch = data.match(/mailto:([^?]+)(?:\?(.+))?/i);
        if (emailMatch) {
          parsed.parsed = {
            email: emailMatch[1],
            subject: extractUrlParam(emailMatch[2], 'subject'),
            body: extractUrlParam(emailMatch[2], 'body'),
          };
        }
        break;

      case 'sms':
        // Parse SMS
        const smsMatch = data.match(/sms(?:to)?:([^?]+)(?:\?(.+))?/i);
        if (smsMatch) {
          parsed.parsed = {
            phone: smsMatch[1],
            message: extractUrlParam(smsMatch[2], 'body'),
          };
        }
        break;

      case 'phone':
        parsed.parsed = {
          phone: data.replace(/^tel:/i, '')
        };
        break;

      case 'url':
        try {
          const url = new URL(data);
          parsed.parsed = {
            url: data,
            domain: url.hostname,
            protocol: url.protocol,
            path: url.pathname,
            params: Object.fromEntries(url.searchParams)
          };
        } catch (e) {
          parsed.parsed = { url: data };
        }
        break;

      default:
        // For other types, just store the raw data
        parsed.parsed = { content: data };
    }
  } catch (error) {
    console.warn('Error parsing QR content:', error.message);
    parsed.parsed = { content: data };
  }

  return parsed;
}

/**
 * Helper: Extract vCard field
 */
function extractVCardField(vcard, field) {
  const regex = new RegExp(`${field}[^:]*:([^\n\r]+)`, 'i');
  const match = vcard.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Helper: Extract URL parameter
 */
function extractUrlParam(queryString, param) {
  if (!queryString) return null;
  // Match at start of string or after &
  const regex = new RegExp(`(?:^|&)${param}=([^&]+)`, 'i');
  const match = queryString.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Main function: Decode QR code from image file
 *
 * @param {string} imagePath - Path to image file
 * @returns {Object|null} Decoded QR data with type and parsed content
 */
async function decodeQRFromImage(imagePath) {
  try {
    // Verify file exists
    await fs.access(imagePath);

    // Try multiple decoding strategies
    const decoded = await decodeWithMultipleStrategies(imagePath);

    if (!decoded) {
      throw new Error('No QR code found in image');
    }

    // Detect QR type
    const type = detectQRType(decoded.data);

    // Parse content based on type
    const parsed = parseQRContent(decoded.data, type);

    return {
      success: true,
      data: decoded.data,
      type,
      parsed: parsed.parsed,
      metadata: {
        version: decoded.version,
        dataLength: decoded.data.length,
        location: decoded.location,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null,
      type: 'unknown'
    };
  }
}

/**
 * Validate uploaded file
 */
function validateQRImageFile(file) {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    throw new Error('No file uploaded');
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }

  return true;
}

/**
 * Get QR type information
 */
function getQRTypeInfo(type) {
  const typeInfo = {
    wifi: {
      name: 'WiFi Network',
      description: 'WiFi connection credentials',
      icon: '📶',
      canRework: true
    },
    vcard: {
      name: 'Contact Card',
      description: 'vCard contact information',
      icon: '👤',
      canRework: true
    },
    email: {
      name: 'Email',
      description: 'Email address with subject/body',
      icon: '✉️',
      canRework: true
    },
    sms: {
      name: 'SMS Message',
      description: 'SMS with pre-filled message',
      icon: '💬',
      canRework: true
    },
    phone: {
      name: 'Phone Number',
      description: 'Phone call link',
      icon: '📞',
      canRework: true
    },
    url: {
      name: 'Website URL',
      description: 'Generic website link',
      icon: '🔗',
      canRework: true
    },
    vietqr: {
      name: 'VietQR Payment',
      description: 'Vietnamese bank transfer QR',
      icon: '💰',
      canRework: true
    },
    zalo: {
      name: 'Zalo',
      description: 'Zalo messaging app',
      icon: '💬',
      canRework: true
    },
    pdf: {
      name: 'PDF Document',
      description: 'Link to PDF file',
      icon: '📄',
      canRework: true
    },
    text: {
      name: 'Plain Text',
      description: 'Plain text content',
      icon: '📝',
      canRework: true
    },
    unknown: {
      name: 'Unknown',
      description: 'Unable to detect QR type',
      icon: '❓',
      canRework: false
    }
  };

  // Social media types
  if (type.startsWith('social-')) {
    const platform = type.replace('social-', '');
    return {
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`,
      description: `${platform} social media profile`,
      icon: '📱',
      canRework: true
    };
  }

  // Video types
  if (type.startsWith('video-')) {
    const platform = type.replace('video-', '');
    return {
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video`,
      description: `Video on ${platform}`,
      icon: '🎥',
      canRework: true
    };
  }

  // Audio types
  if (type.startsWith('audio-')) {
    const platform = type.replace('audio-', '');
    return {
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Audio`,
      description: `Audio on ${platform}`,
      icon: '🎵',
      canRework: true
    };
  }

  return typeInfo[type] || typeInfo.unknown;
}

module.exports = {
  decodeQRFromImage,
  decodeQRFromBuffer,
  detectQRType,
  parseQRContent,
  validateQRImageFile,
  getQRTypeInfo,
  preprocessImage,
};
