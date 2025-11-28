const sharp = require('sharp');

/**
 * QR Code Eye (Position Detection Pattern) Styles
 *
 * Eyes are the three square patterns in corners of QR codes
 * Currently: 3 eye styles (square, rounded, dot)
 * Adding: 5 new styles (leaf, frame, extra-rounded, diamond, shield)
 * Total: 8 eye styles
 */

const EYE_STYLES = {
  'square': {
    id: 'square',
    name: 'Square',
    description: 'Classic square corners (default)',
    category: 'basic',
    outerRadius: 0,
    innerRadius: 0
  },

  'rounded': {
    id: 'rounded',
    name: 'Rounded',
    description: 'Rounded corner eyes',
    category: 'basic',
    outerRadius: 3,
    innerRadius: 2
  },

  'dot': {
    id: 'dot',
    name: 'Dot',
    description: 'Circular dot eyes',
    category: 'basic',
    outerRadius: 999, // Very high to make it circular
    innerRadius: 999
  },

  // NEW EYE STYLES (Week 2)

  'extra-rounded': {
    id: 'extra-rounded',
    name: 'Extra Rounded',
    description: 'Heavily rounded corners for smooth look',
    category: 'modern',
    outerRadius: 6,
    innerRadius: 5
  },

  'leaf': {
    id: 'leaf',
    name: 'Leaf',
    description: 'Organic leaf-shaped eyes with pointed corners',
    category: 'creative',
    outerRadius: 4,
    innerRadius: 3,
    special: 'leaf'
  },

  'frame': {
    id: 'frame',
    name: 'Frame',
    description: 'Thick frame with square inner dot',
    category: 'modern',
    outerRadius: 2,
    innerRadius: 0,
    special: 'frame'
  },

  'diamond': {
    id: 'diamond',
    name: 'Diamond',
    description: 'Diamond-shaped eyes rotated 45 degrees',
    category: 'creative',
    outerRadius: 0,
    innerRadius: 0,
    special: 'diamond'
  },

  'shield': {
    id: 'shield',
    name: 'Shield',
    description: 'Shield-shaped eyes with rounded top',
    category: 'premium',
    outerRadius: 5,
    innerRadius: 3,
    special: 'shield'
  }
};

/**
 * Get all available eye styles
 * @returns {Array} Array of eye style metadata
 */
function getEyeStyles() {
  return Object.values(EYE_STYLES);
}

/**
 * Get a specific eye style by ID
 * @param {string} eyeId - Eye style ID
 * @returns {object|null} Eye style metadata or null if not found
 */
function getEyeStyle(eyeId) {
  return EYE_STYLES[eyeId] || null;
}

/**
 * Apply eye style to SVG QR code
 * @param {string} svgString - QR code SVG string
 * @param {string} eyeStyleId - Eye style ID
 * @param {string} color - Eye color
 * @returns {string} - Modified SVG string
 */
function applySVGEyeStyle(svgString, eyeStyleId, color = '#000000') {
  const eyeStyle = getEyeStyle(eyeStyleId);
  if (!eyeStyle) {
    return svgString; // Return unchanged if style not found
  }

  let styled = svgString;

  // Apply basic rounded corners
  if (eyeStyle.outerRadius > 0) {
    const rx = eyeStyle.outerRadius;
    styled = styled.replace(/<rect/g, `<rect rx="${rx}" ry="${rx}"`);
  }

  // Apply special eye transformations
  if (eyeStyle.special) {
    styled = applySpecialEyeStyle(styled, eyeStyle, color);
  }

  return styled;
}

/**
 * Apply special eye style transformations
 * @param {string} svgString - SVG string
 * @param {object} eyeStyle - Eye style configuration
 * @param {string} color - Eye color
 * @returns {string} - Modified SVG string
 */
function applySpecialEyeStyle(svgString, eyeStyle, color) {
  let styled = svgString;

  switch (eyeStyle.special) {
    case 'leaf':
      // Add pointed corners by using path instead of rect
      // This is a simplified version - in production, detect and replace eye patterns
      styled = styled.replace(/<rect rx="4"/g, '<rect rx="8"');
      break;

    case 'frame':
      // Make outer frame thicker, inner dot smaller
      // This requires detecting the three eye positions in the QR code
      // For now, apply general styling
      styled = styled.replace(/<rect rx="2"/g, '<rect rx="2" stroke-width="2"');
      break;

    case 'diamond':
      // Rotate eye elements 45 degrees
      // Detect eye positions (corners) and apply transform
      styled = styled.replace(/<rect([^>]*)>/g, '<rect$1 transform="rotate(45)">');
      break;

    case 'shield':
      // Asymmetric rounding - more rounded at top
      // SVG doesn't support different corner radii easily, use approximation
      styled = styled.replace(/<rect rx="5"/g, '<rect rx="7" ry="5"');
      break;
  }

  return styled;
}

/**
 * Apply eye style to PNG QR code buffer
 * @param {Buffer} qrBuffer - QR code PNG buffer
 * @param {string} eyeStyleId - Eye style ID
 * @param {string} color - Eye color
 * @returns {Buffer} - Modified PNG buffer
 */
async function applyPNGEyeStyle(qrBuffer, eyeStyleId, color = '#000000') {
  const eyeStyle = getEyeStyle(eyeStyleId);
  if (!eyeStyle) {
    return qrBuffer; // Return unchanged if style not found
  }

  const image = sharp(qrBuffer);

  // For PNG, we use image processing to approximate eye styles
  // Note: True eye style rendering requires canvas manipulation or SVG conversion

  switch (eyeStyleId) {
    case 'rounded':
    case 'extra-rounded':
      // Slight blur to create rounded effect
      const blurAmount = eyeStyleId === 'extra-rounded' ? 0.5 : 0.3;
      return await image
        .blur(blurAmount)
        .sharpen()
        .toBuffer();

    case 'dot':
      // Heavy blur for circular eyes
      return await image
        .blur(0.8)
        .sharpen({ sigma: 1.5 })
        .toBuffer();

    case 'leaf':
    case 'shield':
      // Moderate blur with sharpening
      return await image
        .blur(0.4)
        .sharpen({ sigma: 1.2 })
        .modulate({ brightness: 1.02 })
        .toBuffer();

    case 'frame':
      // Enhance contrast for frame effect
      return await image
        .sharpen({ sigma: 1.5 })
        .modulate({ contrast: 1.1 })
        .toBuffer();

    case 'diamond':
      // Sharpen for angular effect
      return await image
        .sharpen({ sigma: 2.0 })
        .modulate({ contrast: 1.15 })
        .toBuffer();

    case 'square':
    default:
      // Return as-is
      return qrBuffer;
  }
}

/**
 * Validate eye style ID
 * @param {string} eyeStyleId - Eye style ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEyeStyle(eyeStyleId) {
  return EYE_STYLES.hasOwnProperty(eyeStyleId);
}

/**
 * Get eye styles by category
 * @param {string} category - Category name (basic, modern, creative, premium)
 * @returns {Array} - Eye styles in the specified category
 */
function getEyeStylesByCategory(category) {
  return Object.values(EYE_STYLES).filter(
    style => style.category === category
  );
}

/**
 * Generate SVG for individual eye (position detection pattern)
 * Useful for previews or custom rendering
 *
 * @param {string} eyeStyleId - Eye style ID
 * @param {string} color - Eye color
 * @param {number} size - Eye size in pixels (default 70)
 * @returns {string} - SVG string for the eye
 */
function generateEyeSVG(eyeStyleId, color = '#000000', size = 70) {
  const eyeStyle = getEyeStyle(eyeStyleId);
  if (!eyeStyle) {
    return '';
  }

  const outerSize = size;
  const middleSize = size * 0.7;
  const innerSize = size * 0.4;
  const outerPos = 0;
  const middlePos = (outerSize - middleSize) / 2;
  const innerPos = (outerSize - innerSize) / 2;

  const { outerRadius, innerRadius } = eyeStyle;

  let svg = `
    <svg width="${outerSize}" height="${outerSize}" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer square -->
      <rect
        x="${outerPos}"
        y="${outerPos}"
        width="${outerSize}"
        height="${outerSize}"
        fill="${color}"
        rx="${outerRadius}"
        ry="${outerRadius}"
      />

      <!-- Middle square (white/background) -->
      <rect
        x="${middlePos}"
        y="${middlePos}"
        width="${middleSize}"
        height="${middleSize}"
        fill="white"
        rx="${outerRadius * 0.7}"
        ry="${outerRadius * 0.7}"
      />

      <!-- Inner square (dot) -->
      <rect
        x="${innerPos}"
        y="${innerPos}"
        width="${innerSize}"
        height="${innerSize}"
        fill="${color}"
        rx="${innerRadius}"
        ry="${innerRadius}"
      />
    </svg>
  `.trim();

  // Apply special transformations
  if (eyeStyle.special === 'diamond') {
    const center = outerSize / 2;
    svg = svg.replace(/<rect/g, `<rect transform="rotate(45 ${center} ${center})"`);
  }

  return svg;
}

module.exports = {
  EYE_STYLES,
  getEyeStyles,
  getEyeStyle,
  applySVGEyeStyle,
  applyPNGEyeStyle,
  isValidEyeStyle,
  getEyeStylesByCategory,
  generateEyeSVG
};
