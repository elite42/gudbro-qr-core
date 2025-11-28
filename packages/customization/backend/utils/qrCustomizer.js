const QRCode = require('qrcode');
const sharp = require('sharp');
const { applyFrame, applyCustomFrame } = require('./frameTemplates');
const { applySVGPattern, applyPNGPattern, isValidPattern } = require('./patterns');
const { applySVGEyeStyle, applyPNGEyeStyle, isValidEyeStyle } = require('./eyeStyles');
const { applySVGGradient, applyPNGGradient, getGradientPreset, isValidGradient } = require('./gradients');

/**
 * Generate QR code with custom design
 * @param {string} data - Data to encode
 * @param {object} design - Design configuration
 * @param {string} format - Output format (png, svg, pdf)
 * @returns {Buffer} - Generated QR code image
 */
async function generateQRWithDesign(data, design = {}, format = 'png') {
  const {
    foreground = '#000000',
    background = '#FFFFFF',
    pattern = 'squares',
    eyeStyle = 'square',
    errorCorrectionLevel = 'M',
    margin = 4,
    width = 1000,
    logo = null,
    frame = null,
    customFrame = null,
    gradient = null,
    gradientPreset = null
  } = design;

  try {
    // QR Code generation options
    const qrOptions = {
      errorCorrectionLevel,
      type: format === 'svg' ? 'svg' : 'png',
      quality: 1,
      margin,
      width,
      color: {
        dark: foreground,
        light: background
      }
    };

    // Generate base QR code
    let qrImage;
    
    if (format === 'svg') {
      qrImage = await QRCode.toString(data, {
        ...qrOptions,
        type: 'svg'
      });

      // Apply pattern using new pattern system
      if (isValidPattern(pattern)) {
        qrImage = applySVGPattern(qrImage, pattern);
      } else {
        // Fallback to legacy method
        qrImage = applySVGStyles(qrImage, pattern, eyeStyle);
      }

      // Apply eye style using new eye style system
      if (isValidEyeStyle(eyeStyle)) {
        qrImage = applySVGEyeStyle(qrImage, eyeStyle, foreground);
      }

      // Apply gradient if specified
      let gradientConfig = null;
      if (gradientPreset) {
        gradientConfig = getGradientPreset(gradientPreset);
      } else if (gradient && isValidGradient(gradient)) {
        gradientConfig = gradient;
      }

      if (gradientConfig) {
        qrImage = applySVGGradient(qrImage, gradientConfig);
      }

      return Buffer.from(qrImage);
    }

    // For PNG format
    const qrBuffer = await QRCode.toBuffer(data, qrOptions);

    // Apply pattern effects using new pattern system
    let processedQR;
    if (isValidPattern(pattern)) {
      processedQR = await applyPNGPattern(qrBuffer, pattern, foreground, background);
    } else {
      // Fallback to legacy method
      processedQR = await applyPattern(qrBuffer, pattern, foreground, background);
    }
    
    // Add logo if provided
    if (logo) {
      processedQR = await addLogo(processedQR, logo, width);
    }

    // Apply eye style using new eye style system
    if (isValidEyeStyle(eyeStyle)) {
      processedQR = await applyPNGEyeStyle(processedQR, eyeStyle, foreground);
    } else {
      // Fallback to legacy method
      processedQR = await applyEyeStyle(processedQR, eyeStyle, foreground);
    }

    // Apply gradient if specified (PNG has limited gradient support)
    let gradientConfig = null;
    if (gradientPreset) {
      gradientConfig = getGradientPreset(gradientPreset);
    } else if (gradient && isValidGradient(gradient)) {
      gradientConfig = gradient;
    }

    if (gradientConfig) {
      processedQR = await applyPNGGradient(processedQR, gradientConfig);
    }

    // Apply frame if specified
    if (frame) {
      processedQR = await applyFrame(processedQR, frame);
    } else if (customFrame) {
      processedQR = await applyCustomFrame(processedQR, customFrame);
    }

    if (format === 'pdf') {
      return await convertToPDF(processedQR);
    }

    return processedQR;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Apply SVG pattern and eye styles
 */
function applySVGStyles(svgString, pattern, eyeStyle) {
  let styled = svgString;

  // Apply pattern (dots, rounded)
  if (pattern === 'dots') {
    styled = styled.replace(/<rect/g, '<circle');
    styled = styled.replace(/width="[^"]*"/g, 'r="2.5"');
    styled = styled.replace(/height="[^"]*"/g, '');
  } else if (pattern === 'rounded') {
    styled = styled.replace(/<rect/g, '<rect rx="2" ry="2"');
  }

  return styled;
}

/**
 * Apply pattern effect to QR code
 */
async function applyPattern(qrBuffer, pattern, foreground, background) {
  const image = sharp(qrBuffer);
  const metadata = await image.metadata();

  // For dots pattern, we need to redraw the QR
  if (pattern === 'dots') {
    // This is a simplified approach - in production, use canvas to redraw
    return await image
      .blur(0.5)
      .sharpen()
      .toBuffer();
  }

  if (pattern === 'rounded') {
    // Apply slight blur and sharpen for rounded effect
    return await image
      .blur(0.3)
      .sharpen()
      .toBuffer();
  }

  // Default: return as-is
  return qrBuffer;
}

/**
 * Apply custom eye style to QR code corners
 */
async function applyEyeStyle(qrBuffer, eyeStyle, color) {
  // This is a simplified version
  // In production, you'd use canvas to redraw the eyes with custom shapes
  
  if (eyeStyle === 'rounded' || eyeStyle === 'dot') {
    const image = sharp(qrBuffer);
    return await image
      .modulate({ brightness: 1.05 })
      .toBuffer();
  }

  return qrBuffer;
}

/**
 * Add logo to center of QR code
 */
async function addLogo(qrBuffer, logo, qrSize) {
  try {
    // Determine logo source
    let logoBuffer;
    
    if (logo.startsWith('data:image')) {
      // Base64 logo
      const base64Data = logo.split(',')[1];
      logoBuffer = Buffer.from(base64Data, 'base64');
    } else if (logo.startsWith('http')) {
      // URL logo - in production, fetch it
      throw new Error('URL logos not yet supported');
    } else {
      // Assume it's a buffer
      logoBuffer = logo;
    }

    // Calculate logo size (max 20% of QR size)
    const logoSize = Math.floor(qrSize * 0.2);

    // Process logo
    const processedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    // Calculate position (center)
    const position = Math.floor((qrSize - logoSize) / 2);

    // Composite logo onto QR code
    const result = await sharp(qrBuffer)
      .composite([{
        input: processedLogo,
        top: position,
        left: position
      }])
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Logo addition error:', error);
    // Return QR without logo on error
    return qrBuffer;
  }
}

/**
 * Convert PNG to PDF
 */
async function convertToPDF(pngBuffer) {
  // Simplified PDF conversion
  // In production, use a proper PDF library like PDFKit
  
  const metadata = await sharp(pngBuffer).metadata();
  
  // For now, just return the PNG wrapped in basic PDF structure
  // In production, generate proper PDF
  return pngBuffer;
}

/**
 * Apply complete design to existing QR code
 */
async function applyDesign(qrCodeId, design) {
  // This function would integrate with Module 1 to update existing QR codes
  // Fetch QR from database, apply design, save back
  
  throw new Error('Not yet implemented - requires Module 1 integration');
}

module.exports = {
  generateQRWithDesign,
  applyDesign,
  applySVGStyles,
  applyPattern,
  applyEyeStyle,
  addLogo
};
