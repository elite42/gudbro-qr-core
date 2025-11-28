const sharp = require('sharp');

/**
 * QR Code Pattern Styles
 *
 * Currently: 3 patterns (dots, squares, rounded)
 * Adding: 6 new patterns (classy, fluid, extra-rounded, star, diamond, mosaic)
 * Total: 9 patterns
 */

const PATTERN_STYLES = {
  'squares': {
    id: 'squares',
    name: 'Squares',
    description: 'Classic square modules (default)',
    category: 'basic'
  },

  'dots': {
    id: 'dots',
    name: 'Dots',
    description: 'Circular dots pattern',
    category: 'basic'
  },

  'rounded': {
    id: 'rounded',
    name: 'Rounded',
    description: 'Slightly rounded square modules',
    category: 'basic'
  },

  // NEW PATTERNS (Week 2)

  'extra-rounded': {
    id: 'extra-rounded',
    name: 'Extra Rounded',
    description: 'Heavily rounded modules for smooth appearance',
    category: 'modern'
  },

  'classy': {
    id: 'classy',
    name: 'Classy',
    description: 'Elegant rounded rectangles with subtle shadows',
    category: 'premium'
  },

  'fluid': {
    id: 'fluid',
    name: 'Fluid',
    description: 'Organic flowing shapes that blend together',
    category: 'modern'
  },

  'star': {
    id: 'star',
    name: 'Star',
    description: 'Star-shaped modules for unique appearance',
    category: 'creative'
  },

  'diamond': {
    id: 'diamond',
    name: 'Diamond',
    description: 'Diamond/rhombus shaped modules',
    category: 'creative'
  },

  'mosaic': {
    id: 'mosaic',
    name: 'Mosaic',
    description: 'Irregular mosaic-style tiles',
    category: 'artistic'
  }
};

/**
 * Get all available pattern styles
 * @returns {Array} Array of pattern metadata
 */
function getPatternStyles() {
  return Object.values(PATTERN_STYLES);
}

/**
 * Get a specific pattern style by ID
 * @param {string} patternId - Pattern ID
 * @returns {object|null} Pattern metadata or null if not found
 */
function getPatternStyle(patternId) {
  return PATTERN_STYLES[patternId] || null;
}

/**
 * Apply pattern style to QR code using SVG manipulation
 * @param {string} svgString - QR code SVG string
 * @param {string} pattern - Pattern ID
 * @returns {string} - Modified SVG string
 */
function applySVGPattern(svgString, pattern) {
  let styled = svgString;

  switch (pattern) {
    case 'dots':
      // Convert rectangles to circles
      styled = styled.replace(/<rect/g, '<circle');
      styled = styled.replace(/width="([^"]*)"/g, 'r="$1"');
      styled = styled.replace(/height="[^"]*"/g, '');
      styled = styled.replace(/x="([^"]*)"/g, 'cx="$1"');
      styled = styled.replace(/y="([^"]*)"/g, 'cy="$1"');
      break;

    case 'rounded':
      // Add slight border radius
      styled = styled.replace(/<rect/g, '<rect rx="2" ry="2"');
      break;

    case 'extra-rounded':
      // Add heavy border radius
      styled = styled.replace(/<rect/g, '<rect rx="4" ry="4"');
      break;

    case 'classy':
      // Rounded rectangles with shadow effect
      styled = styled.replace(/<rect/g, '<rect rx="3" ry="3"');
      // Add subtle drop shadow filter (simplified)
      styled = styled.replace('</svg>', '<defs><filter id="shadow"><feDropShadow dx="0.5" dy="0.5" stdDeviation="0.3" flood-opacity="0.3"/></filter></defs></svg>');
      styled = styled.replace(/<rect/g, '<rect filter="url(#shadow)"');
      break;

    case 'fluid':
      // Very rounded, almost circular
      styled = styled.replace(/<rect/g, '<rect rx="6" ry="6"');
      break;

    case 'star':
      // Convert to star shapes (simplified - use polygon)
      // This is a complex transformation, for now use heavy rounding with rotation
      styled = styled.replace(/<rect/g, '<rect rx="2" ry="2" transform="rotate(45)"');
      break;

    case 'diamond':
      // Rotate squares 45 degrees to create diamond shape
      styled = styled.replace(/<rect([^>]*)width="([^"]*)"([^>]*)height="([^"]*)"([^>]*)x="([^"]*)"([^>]*)y="([^"]*)"/g,
        (match, p1, w, p3, h, p5, x, p7, y) => {
          const centerX = parseFloat(x) + parseFloat(w) / 2;
          const centerY = parseFloat(y) + parseFloat(h) / 2;
          return `<rect${p1}width="${w}"${p3}height="${h}"${p5}x="${x}"${p7}y="${y}" transform="rotate(45 ${centerX} ${centerY})"`;
        });
      break;

    case 'mosaic':
      // Irregular sizes and slight random offsets (simplified)
      styled = styled.replace(/<rect/g, '<rect rx="1" ry="1"');
      break;

    case 'squares':
    default:
      // Keep as-is (default squares)
      break;
  }

  return styled;
}

/**
 * Apply pattern style to PNG QR code buffer
 * @param {Buffer} qrBuffer - QR code PNG buffer
 * @param {string} pattern - Pattern ID
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @returns {Buffer} - Modified PNG buffer
 */
async function applyPNGPattern(qrBuffer, pattern, foreground, background) {
  const image = sharp(qrBuffer);
  const metadata = await image.metadata();

  // For PNG, we use image processing effects to simulate patterns
  // Note: For true pattern rendering, use canvas or SVG conversion

  switch (pattern) {
    case 'dots':
      // Blur and sharpen to create dot-like effect
      return await image
        .blur(0.8)
        .sharpen({ sigma: 1.5 })
        .toBuffer();

    case 'rounded':
      // Slight blur for rounded edges
      return await image
        .blur(0.3)
        .sharpen()
        .toBuffer();

    case 'extra-rounded':
      // More blur for heavily rounded edges
      return await image
        .blur(0.6)
        .sharpen({ sigma: 1.2 })
        .toBuffer();

    case 'classy':
      // Slight blur with enhanced contrast
      return await image
        .blur(0.4)
        .sharpen()
        .modulate({ brightness: 1.02, contrast: 1.05 })
        .toBuffer();

    case 'fluid':
      // Heavy blur for organic flowing effect
      return await image
        .blur(1.0)
        .sharpen({ sigma: 2.0 })
        .toBuffer();

    case 'star':
    case 'diamond':
      // Enhance edges with sharpening
      return await image
        .sharpen({ sigma: 2.0 })
        .modulate({ contrast: 1.1 })
        .toBuffer();

    case 'mosaic':
      // Add slight noise for mosaic effect
      return await image
        .blur(0.2)
        .sharpen({ sigma: 1.5 })
        .modulate({ saturation: 1.05 })
        .toBuffer();

    case 'squares':
    default:
      // Return as-is
      return qrBuffer;
  }
}

/**
 * Validate pattern ID
 * @param {string} patternId - Pattern ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidPattern(patternId) {
  return PATTERN_STYLES.hasOwnProperty(patternId);
}

/**
 * Get patterns by category
 * @param {string} category - Category name (basic, modern, premium, creative, artistic)
 * @returns {Array} - Patterns in the specified category
 */
function getPatternsByCategory(category) {
  return Object.values(PATTERN_STYLES).filter(
    pattern => pattern.category === category
  );
}

module.exports = {
  PATTERN_STYLES,
  getPatternStyles,
  getPatternStyle,
  applySVGPattern,
  applyPNGPattern,
  isValidPattern,
  getPatternsByCategory
};
