const sharp = require('sharp');

/**
 * Frame Templates for QR Codes
 *
 * Each frame is a decorative border with text around the QR code
 * Designed to increase scan rates and provide context
 */

const FRAME_TEMPLATES = {
  'scan-me': {
    id: 'scan-me',
    name: 'Scan Me',
    description: 'Classic "Scan Me" frame with arrow pointer',
    text: 'SCAN ME',
    subtext: null,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderColor: '#000000',
    borderWidth: 4,
    padding: 40,
    fontSize: 32,
    icon: 'arrow-down'
  },

  'menu-here': {
    id: 'menu-here',
    name: 'Menu Here',
    description: 'Restaurant menu indicator frame',
    text: 'MENU',
    subtext: 'Scan for digital menu',
    backgroundColor: '#1E3A8A',
    textColor: '#FFFFFF',
    borderColor: '#1E3A8A',
    borderWidth: 6,
    padding: 50,
    fontSize: 36,
    icon: 'utensils'
  },

  'follow-us': {
    id: 'follow-us',
    name: 'Follow Us',
    description: 'Social media follow frame',
    text: 'FOLLOW US',
    subtext: 'Connect on social media',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    borderColor: '#10B981',
    borderWidth: 5,
    padding: 45,
    fontSize: 34,
    icon: 'heart'
  },

  'wifi-access': {
    id: 'wifi-access',
    name: 'WiFi Access',
    description: 'WiFi network connection frame',
    text: 'FREE WiFi',
    subtext: 'Scan to connect',
    backgroundColor: '#8B5CF6',
    textColor: '#FFFFFF',
    borderColor: '#8B5CF6',
    borderWidth: 4,
    padding: 45,
    fontSize: 32,
    icon: 'wifi'
  },

  'contact-info': {
    id: 'contact-info',
    name: 'Contact Info',
    description: 'Business contact information frame',
    text: 'SAVE CONTACT',
    subtext: 'Add to your phone',
    backgroundColor: '#F97316',
    textColor: '#FFFFFF',
    borderColor: '#F97316',
    borderWidth: 5,
    padding: 45,
    fontSize: 30,
    icon: 'user'
  },

  'payment': {
    id: 'payment',
    name: 'Payment',
    description: 'Payment/checkout frame',
    text: 'PAY HERE',
    subtext: 'Quick & secure payment',
    backgroundColor: '#EF4444',
    textColor: '#FFFFFF',
    borderColor: '#EF4444',
    borderWidth: 6,
    padding: 50,
    fontSize: 36,
    icon: 'credit-card'
  },

  'event-ticket': {
    id: 'event-ticket',
    name: 'Event Ticket',
    description: 'Event or ticket access frame',
    text: 'EVENT PASS',
    subtext: 'Scan for entry',
    backgroundColor: '#EC4899',
    textColor: '#FFFFFF',
    borderColor: '#EC4899',
    borderWidth: 5,
    padding: 45,
    fontSize: 34,
    icon: 'ticket'
  },

  'feedback': {
    id: 'feedback',
    name: 'Feedback',
    description: 'Customer feedback/review frame',
    text: 'YOUR FEEDBACK',
    subtext: 'Help us improve',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    borderColor: '#3B82F6',
    borderWidth: 4,
    padding: 45,
    fontSize: 30,
    icon: 'star'
  },

  'website': {
    id: 'website',
    name: 'Website',
    description: 'Website/URL access frame',
    text: 'VISIT WEBSITE',
    subtext: 'Learn more online',
    backgroundColor: '#6366F1',
    textColor: '#FFFFFF',
    borderColor: '#6366F1',
    borderWidth: 5,
    padding: 45,
    fontSize: 32,
    icon: 'globe'
  },

  'download-app': {
    id: 'download-app',
    name: 'Download App',
    description: 'Mobile app download frame',
    text: 'GET THE APP',
    subtext: 'Download now',
    backgroundColor: '#14B8A6',
    textColor: '#FFFFFF',
    borderColor: '#14B8A6',
    borderWidth: 5,
    padding: 45,
    fontSize: 32,
    icon: 'mobile'
  }
};

/**
 * Get all available frame templates
 * @returns {Array} Array of frame template metadata
 */
function getFrameTemplates() {
  return Object.values(FRAME_TEMPLATES).map(frame => ({
    id: frame.id,
    name: frame.name,
    description: frame.description,
    preview: {
      backgroundColor: frame.backgroundColor,
      textColor: frame.textColor,
      text: frame.text
    }
  }));
}

/**
 * Get a specific frame template by ID
 * @param {string} frameId - Frame template ID
 * @returns {object|null} Frame template or null if not found
 */
function getFrameTemplate(frameId) {
  return FRAME_TEMPLATES[frameId] || null;
}

/**
 * Apply frame to QR code image
 * @param {Buffer} qrBuffer - QR code image buffer
 * @param {string} frameId - Frame template ID
 * @param {object} options - Custom frame options (override defaults)
 * @returns {Buffer} - QR code with frame applied
 */
async function applyFrame(qrBuffer, frameId, options = {}) {
  try {
    // Get frame template
    const template = getFrameTemplate(frameId);
    if (!template) {
      throw new Error(`Frame template '${frameId}' not found`);
    }

    // Merge options with template defaults
    const frame = { ...template, ...options };

    // Get QR code dimensions
    const qrMeta = await sharp(qrBuffer).metadata();
    const qrSize = qrMeta.width;

    // Calculate canvas dimensions
    const canvasWidth = qrSize + (frame.padding * 2);
    const canvasHeight = qrSize + (frame.padding * 2) + 120; // Extra space for text

    // Create SVG frame with text
    const frameSVG = createFrameSVG(frame, qrSize, canvasWidth, canvasHeight);

    // Convert SVG to buffer
    const frameBuffer = Buffer.from(frameSVG);

    // Composite QR code onto frame
    const result = await sharp(frameBuffer)
      .composite([{
        input: qrBuffer,
        top: frame.padding + 80, // Offset for top text
        left: frame.padding
      }])
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Frame application error:', error);
    throw new Error(`Failed to apply frame: ${error.message}`);
  }
}

/**
 * Create SVG frame with text and styling
 * @param {object} frame - Frame configuration
 * @param {number} qrSize - QR code size
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {string} - SVG string
 */
function createFrameSVG(frame, qrSize, width, height) {
  const {
    backgroundColor,
    textColor,
    borderColor,
    borderWidth,
    padding,
    text,
    subtext,
    fontSize
  } = frame;

  // Calculate text positioning
  const textY = 50;
  const subtextY = subtext ? 75 : 0;
  const centerX = width / 2;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>

      <!-- Border -->
      <rect
        x="${borderWidth / 2}"
        y="${borderWidth / 2}"
        width="${width - borderWidth}"
        height="${height - borderWidth}"
        fill="none"
        stroke="${borderColor}"
        stroke-width="${borderWidth}"
        rx="10"
      />

      <!-- Main text -->
      <text
        x="${centerX}"
        y="${textY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
      >
        ${text}
      </text>

      ${subtext ? `
        <!-- Subtext -->
        <text
          x="${centerX}"
          y="${subtextY}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="16"
          fill="${textColor}"
          text-anchor="middle"
          opacity="0.8"
        >
          ${subtext}
        </text>
      ` : ''}

      <!-- Decorative elements -->
      ${createDecorations(frame, centerX, textY + 20, qrSize)}
    </svg>
  `.trim();
}

/**
 * Create decorative elements based on frame style
 * @param {object} frame - Frame configuration
 * @param {number} x - Center X position
 * @param {number} y - Y position
 * @param {number} qrSize - QR code size
 * @returns {string} - SVG decorations
 */
function createDecorations(frame, x, y, qrSize) {
  const { icon, textColor } = frame;

  switch (icon) {
    case 'arrow-down':
      return `
        <polygon
          points="${x},${y} ${x - 10},${y - 15} ${x + 10},${y - 15}"
          fill="${textColor}"
          opacity="0.7"
        />
      `;

    case 'heart':
      return `
        <path
          d="M ${x} ${y + 5}
             C ${x} ${y - 5}, ${x - 8} ${y - 10}, ${x - 12} ${y - 6}
             C ${x - 16} ${y - 2}, ${x - 16} ${y + 4}, ${x - 12} ${y + 8}
             L ${x} ${y + 15}
             L ${x + 12} ${y + 8}
             C ${x + 16} ${y + 4}, ${x + 16} ${y - 2}, ${x + 12} ${y - 6}
             C ${x + 8} ${y - 10}, ${x} ${y - 5}, ${x} ${y + 5} Z"
          fill="${textColor}"
          opacity="0.6"
        />
      `;

    case 'star':
      return `
        <polygon
          points="${x},${y - 10} ${x + 3},${y} ${x + 12},${y} ${x + 5},${y + 6}
                  ${x + 8},${y + 15} ${x},${y + 9} ${x - 8},${y + 15} ${x - 5},${y + 6}
                  ${x - 12},${y} ${x - 3},${y}"
          fill="${textColor}"
          opacity="0.6"
        />
      `;

    default:
      // Simple decorative line
      return `
        <line
          x1="${x - 30}"
          y1="${y}"
          x2="${x + 30}"
          y2="${y}"
          stroke="${textColor}"
          stroke-width="2"
          opacity="0.5"
        />
      `;
  }
}

/**
 * Create custom frame with user-provided configuration
 * @param {Buffer} qrBuffer - QR code image buffer
 * @param {object} config - Custom frame configuration
 * @returns {Buffer} - QR code with custom frame
 */
async function applyCustomFrame(qrBuffer, config) {
  const defaultConfig = {
    text: 'SCAN QR CODE',
    subtext: null,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderColor: '#000000',
    borderWidth: 4,
    padding: 40,
    fontSize: 32,
    icon: 'none'
  };

  const frameConfig = { ...defaultConfig, ...config };

  // Get QR code dimensions
  const qrMeta = await sharp(qrBuffer).metadata();
  const qrSize = qrMeta.width;

  // Calculate canvas dimensions
  const canvasWidth = qrSize + (frameConfig.padding * 2);
  const canvasHeight = qrSize + (frameConfig.padding * 2) + 120;

  // Create SVG frame
  const frameSVG = createFrameSVG(frameConfig, qrSize, canvasWidth, canvasHeight);
  const frameBuffer = Buffer.from(frameSVG);

  // Composite QR code onto frame
  const result = await sharp(frameBuffer)
    .composite([{
      input: qrBuffer,
      top: frameConfig.padding + 80,
      left: frameConfig.padding
    }])
    .png()
    .toBuffer();

  return result;
}

module.exports = {
  FRAME_TEMPLATES,
  getFrameTemplates,
  getFrameTemplate,
  applyFrame,
  applyCustomFrame
};
