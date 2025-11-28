const sharp = require('sharp');

/**
 * QR Code Gradient Colors Support
 *
 * Supports linear and radial gradients for QR code foreground
 * Works with SVG format (gradients not fully supported in PNG via sharp)
 */

const GRADIENT_PRESETS = {
  'sunset': {
    id: 'sunset',
    name: 'Sunset',
    type: 'linear',
    angle: 135,
    colors: [
      { offset: '0%', color: '#FF512F' },
      { offset: '100%', color: '#F09819' }
    ]
  },

  'ocean': {
    id: 'ocean',
    name: 'Ocean',
    type: 'linear',
    angle: 180,
    colors: [
      { offset: '0%', color: '#2E3192' },
      { offset: '100%', color: '#1BFFFF' }
    ]
  },

  'forest': {
    id: 'forest',
    name: 'Forest',
    type: 'linear',
    angle: 90,
    colors: [
      { offset: '0%', color: '#134E5E' },
      { offset: '100%', color: '#71B280' }
    ]
  },

  'purple-haze': {
    id: 'purple-haze',
    name: 'Purple Haze',
    type: 'linear',
    angle: 45,
    colors: [
      { offset: '0%', color: '#360033' },
      { offset: '100%', color: '#0B8793' }
    ]
  },

  'fire': {
    id: 'fire',
    name: 'Fire',
    type: 'linear',
    angle: 90,
    colors: [
      { offset: '0%', color: '#F00000' },
      { offset: '50%', color: '#DC281E' },
      { offset: '100%', color: '#FF6A00' }
    ]
  },

  'mint': {
    id: 'mint',
    name: 'Mint',
    type: 'linear',
    angle: 135,
    colors: [
      { offset: '0%', color: '#00F260' },
      { offset: '100%', color: '#0575E6' }
    ]
  },

  'royal': {
    id: 'royal',
    name: 'Royal',
    type: 'linear',
    angle: 180,
    colors: [
      { offset: '0%', color: '#141E30' },
      { offset: '100%', color: '#243B55' }
    ]
  },

  'sunrise': {
    id: 'sunrise',
    name: 'Sunrise',
    type: 'radial',
    colors: [
      { offset: '0%', color: '#FFE000' },
      { offset: '100%', color: '#799F0C' }
    ]
  },

  'neon': {
    id: 'neon',
    name: 'Neon',
    type: 'linear',
    angle: 45,
    colors: [
      { offset: '0%', color: '#00FFA3' },
      { offset: '100%', color: '#DC1FFF' }
    ]
  },

  'rainbow': {
    id: 'rainbow',
    name: 'Rainbow',
    type: 'linear',
    angle: 90,
    colors: [
      { offset: '0%', color: '#FF0000' },
      { offset: '16%', color: '#FF7F00' },
      { offset: '33%', color: '#FFFF00' },
      { offset: '50%', color: '#00FF00' },
      { offset: '66%', color: '#0000FF' },
      { offset: '83%', color: '#4B0082' },
      { offset: '100%', color: '#9400D3' }
    ]
  }
};

/**
 * Get all gradient presets
 * @returns {Array} Array of gradient presets
 */
function getGradientPresets() {
  return Object.values(GRADIENT_PRESETS);
}

/**
 * Get a specific gradient preset by ID
 * @param {string} gradientId - Gradient ID
 * @returns {object|null} Gradient preset or null if not found
 */
function getGradientPreset(gradientId) {
  return GRADIENT_PRESETS[gradientId] || null;
}

/**
 * Apply gradient to SVG QR code
 * @param {string} svgString - QR code SVG string
 * @param {object} gradient - Gradient configuration
 * @returns {string} - Modified SVG with gradient
 */
function applySVGGradient(svgString, gradient) {
  // Extract SVG dimensions
  const widthMatch = svgString.match(/width="(\d+)"/);
  const heightMatch = svgString.match(/height="(\d+)"/);
  const width = widthMatch ? widthMatch[1] : '100';
  const height = heightMatch ? heightMatch[1] : '100';

  // Generate gradient definition
  const gradientDef = generateGradientDef(gradient, width, height);
  const gradientId = 'qr-gradient';

  // Insert gradient definition into SVG
  let modifiedSVG = svgString.replace(
    '</svg>',
    `<defs>${gradientDef}</defs></svg>`
  );

  // Replace fill color with gradient reference
  // Find the dark color attribute and replace with gradient
  modifiedSVG = modifiedSVG.replace(
    /fill="[^"]*"/g,
    (match) => {
      // Only replace if it's not white/light color (preserve background)
      if (match.includes('#000') || match.includes('rgb(0')) {
        return `fill="url(#${gradientId})"`;
      }
      return match;
    }
  );

  return modifiedSVG;
}

/**
 * Generate SVG gradient definition
 * @param {object} gradient - Gradient configuration
 * @param {string|number} width - SVG width
 * @param {string|number} height - SVG height
 * @returns {string} - SVG gradient definition
 */
function generateGradientDef(gradient, width, height) {
  const { type = 'linear', angle = 0, colors = [] } = gradient;
  const gradientId = 'qr-gradient';

  if (type === 'linear') {
    // Calculate gradient vector from angle
    const radians = (angle * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians);
    const y1 = 50 - 50 * Math.sin(radians);
    const x2 = 50 + 50 * Math.cos(radians);
    const y2 = 50 + 50 * Math.sin(radians);

    const stops = colors.map(({ offset, color }) =>
      `<stop offset="${offset}" stop-color="${color}" />`
    ).join('\n');

    return `
      <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        ${stops}
      </linearGradient>
    `.trim();
  } else if (type === 'radial') {
    const stops = colors.map(({ offset, color }) =>
      `<stop offset="${offset}" stop-color="${color}" />`
    ).join('\n');

    return `
      <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
        ${stops}
      </radialGradient>
    `.trim();
  }

  return '';
}

/**
 * Apply gradient to PNG QR code (limited support)
 * Note: True gradient rendering in PNG requires canvas manipulation
 * This function applies a color overlay approximation
 *
 * @param {Buffer} qrBuffer - QR code PNG buffer
 * @param {object} gradient - Gradient configuration
 * @returns {Buffer} - Modified PNG buffer with color tint
 */
async function applyPNGGradient(qrBuffer, gradient) {
  try {
    // For PNG, we can approximate gradient by applying a color tint
    // Use the first color in the gradient as the primary color
    const primaryColor = gradient.colors && gradient.colors[0]
      ? gradient.colors[0].color
      : '#000000';

    // Convert hex to RGB
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);

    // Apply color tint using modulate and tint
    const result = await sharp(qrBuffer)
      .tint({ r, g, b })
      .toBuffer();

    return result;
  } catch (error) {
    console.error('PNG gradient application error:', error);
    // Return original buffer on error
    return qrBuffer;
  }
}

/**
 * Create custom gradient configuration
 * @param {object} config - Gradient configuration
 * @returns {object} - Validated gradient configuration
 */
function createCustomGradient(config) {
  const {
    type = 'linear',
    angle = 0,
    colors = []
  } = config;

  // Validate colors array
  if (!Array.isArray(colors) || colors.length < 2) {
    throw new Error('Gradient must have at least 2 colors');
  }

  // Validate each color
  colors.forEach((colorStop, index) => {
    if (!colorStop.offset || !colorStop.color) {
      throw new Error(`Color stop ${index} must have offset and color properties`);
    }
  });

  return {
    type,
    angle: type === 'linear' ? angle : undefined,
    colors
  };
}

/**
 * Validate gradient configuration
 * @param {object} gradient - Gradient to validate
 * @returns {boolean} - True if valid
 */
function isValidGradient(gradient) {
  if (!gradient || typeof gradient !== 'object') {
    return false;
  }

  const { type, colors } = gradient;

  if (!['linear', 'radial'].includes(type)) {
    return false;
  }

  if (!Array.isArray(colors) || colors.length < 2) {
    return false;
  }

  return colors.every(c => c.offset && c.color);
}

/**
 * Get gradient presets by type
 * @param {string} type - Gradient type (linear or radial)
 * @returns {Array} - Gradients of the specified type
 */
function getGradientsByType(type) {
  return Object.values(GRADIENT_PRESETS).filter(
    gradient => gradient.type === type
  );
}

module.exports = {
  GRADIENT_PRESETS,
  getGradientPresets,
  getGradientPreset,
  applySVGGradient,
  applyPNGGradient,
  generateGradientDef,
  createCustomGradient,
  isValidGradient,
  getGradientsByType
};
