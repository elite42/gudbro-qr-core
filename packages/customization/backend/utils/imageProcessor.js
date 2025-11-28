const sharp = require('sharp');

/**
 * Process uploaded logo
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {object} options - Processing options
 * @returns {Buffer} - Processed image buffer
 */
async function processLogo(imageBuffer, options = {}) {
  const {
    maxWidth = 200,
    maxHeight = 200,
    format = 'png',
    quality = 90,
    removeBackground = false
  } = options;

  try {
    let processor = sharp(imageBuffer);

    // Get metadata
    const metadata = await processor.metadata();

    // Resize while maintaining aspect ratio
    processor = processor.resize(maxWidth, maxHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    });

    // Remove background if requested (simple approach)
    if (removeBackground) {
      processor = processor
        .threshold(200)
        .negate()
        .flatten({ background: '#ffffff' });
    }

    // Convert to specified format
    if (format === 'png') {
      processor = processor.png({ quality, compressionLevel: 9 });
    } else if (format === 'jpeg' || format === 'jpg') {
      processor = processor.jpeg({ quality });
    } else if (format === 'webp') {
      processor = processor.webp({ quality });
    }

    const processedBuffer = await processor.toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process logo: ${error.message}`);
  }
}

/**
 * Validate image file
 */
async function validateImage(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    const errors = [];

    // Check format
    const supportedFormats = ['jpeg', 'png', 'webp', 'gif', 'svg'];
    if (!supportedFormats.includes(metadata.format)) {
      errors.push(`Unsupported format: ${metadata.format}`);
    }

    // Check dimensions
    if (metadata.width > 2000 || metadata.height > 2000) {
      errors.push('Image too large (max 2000x2000px)');
    }

    // Check file size (if available)
    if (metadata.size && metadata.size > 5 * 1024 * 1024) {
      errors.push('File size too large (max 5MB)');
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size
      }
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid image file'],
      metadata: null
    };
  }
}

/**
 * Create thumbnail
 */
async function createThumbnail(imageBuffer, size = 100) {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw new Error(`Failed to create thumbnail: ${error.message}`);
  }
}

/**
 * Get image info
 */
async function getImageInfo(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
      dominant: stats.dominant,
      entropy: stats.entropy
    };
  } catch (error) {
    console.error('Get image info error:', error);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
}

/**
 * Optimize image for web
 */
async function optimizeForWeb(imageBuffer, options = {}) {
  const {
    maxWidth = 1200,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    let processor = sharp(imageBuffer);

    // Resize if needed
    const metadata = await processor.metadata();
    if (metadata.width > maxWidth) {
      processor = processor.resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to optimal format
    if (format === 'webp') {
      processor = processor.webp({ quality });
    } else if (format === 'jpeg') {
      processor = processor.jpeg({ quality, progressive: true });
    } else {
      processor = processor.png({ quality, compressionLevel: 9 });
    }

    return await processor.toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
}

module.exports = {
  processLogo,
  validateImage,
  createThumbnail,
  getImageInfo,
  optimizeForWeb
};
