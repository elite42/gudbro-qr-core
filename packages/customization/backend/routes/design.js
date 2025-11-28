const express = require('express');
const router = express.Router();
const multer = require('multer');
const { applyDesign, generateQRWithDesign } = require('../utils/qrCustomizer');
const { processLogo } = require('../utils/imageProcessor');
const { validateDesign } = require('../utils/validators');
const { getFrameTemplates, getFrameTemplate } = require('../utils/frameTemplates');
const { getPatternStyles, getPatternsByCategory } = require('../utils/patterns');
const { getEyeStyles, getEyeStylesByCategory, generateEyeSVG } = require('../utils/eyeStyles');
const { getGradientPresets, getGradientsByType } = require('../utils/gradients');

// Configure multer for logo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/design/apply
 * Apply a custom design to a QR code
 * 
 * Body:
 * {
 *   "data": "https://example.com",
 *   "design": {
 *     "foreground": "#000000",
 *     "background": "#FFFFFF",
 *     "pattern": "dots|squares|rounded",
 *     "eyeStyle": "square|rounded|dot",
 *     "errorCorrectionLevel": "L|M|Q|H",
 *     "margin": 4,
 *     "logo": "base64_string_or_url"
 *   },
 *   "format": "png|svg|pdf"
 * }
 */
router.post('/apply', async (req, res) => {
  try {
    const { data, design, format = 'png' } = req.body;

    // Validate input
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const { error } = validateDesign(design);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate QR code with custom design
    const qrImage = await generateQRWithDesign(data, design, format);

    // Return based on format
    if (format === 'svg') {
      res.set('Content-Type', 'image/svg+xml');
      res.send(qrImage);
    } else if (format === 'pdf') {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'attachment; filename="qr-code.pdf"');
      res.send(qrImage);
    } else {
      // PNG (default)
      res.set('Content-Type', 'image/png');
      res.send(qrImage);
    }
  } catch (error) {
    console.error('Design application error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/design/upload-logo
 * Upload and process a logo for QR code
 */
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    // Process logo (resize, optimize)
    const processedLogo = await processLogo(req.file.buffer, {
      maxWidth: 200,
      maxHeight: 200,
      format: 'png'
    });

    // Return base64 encoded logo
    const base64Logo = processedLogo.toString('base64');
    
    res.json({
      logo: `data:image/png;base64,${base64Logo}`,
      size: processedLogo.length
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/design/preview
 * Generate a preview of QR code with design (lower resolution for speed)
 */
router.post('/preview', async (req, res) => {
  try {
    const { data, design } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Generate lower resolution for preview
    const previewDesign = {
      ...design,
      width: 200, // Smaller for preview
      margin: design.margin || 4
    };

    const qrImage = await generateQRWithDesign(data, previewDesign, 'png');

    res.set('Content-Type', 'image/png');
    res.send(qrImage);
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/patterns
 * Get available QR patterns
 */
router.get('/patterns', (req, res) => {
  try {
    const { category } = req.query;

    let patterns;
    if (category) {
      patterns = getPatternsByCategory(category);
    } else {
      patterns = getPatternStyles();
    }

    res.json({
      patterns,
      total: patterns.length
    });
  } catch (error) {
    console.error('Patterns fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/eye-styles
 * Get available eye styles
 */
router.get('/eye-styles', (req, res) => {
  try {
    const { category } = req.query;

    let eyeStyles;
    if (category) {
      eyeStyles = getEyeStylesByCategory(category);
    } else {
      eyeStyles = getEyeStyles();
    }

    res.json({
      eyeStyles,
      total: eyeStyles.length
    });
  } catch (error) {
    console.error('Eye styles fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/eye-styles/:id/preview
 * Get SVG preview of a specific eye style
 */
router.get('/eye-styles/:id/preview', (req, res) => {
  try {
    const { id } = req.params;
    const { color = '#000000', size = 70 } = req.query;

    const eyeSVG = generateEyeSVG(id, color, parseInt(size));

    if (!eyeSVG) {
      return res.status(404).json({ error: 'Eye style not found' });
    }

    res.set('Content-Type', 'image/svg+xml');
    res.send(eyeSVG);
  } catch (error) {
    console.error('Eye style preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/frames
 * Get available frame templates
 */
router.get('/frames', (req, res) => {
  try {
    const frames = getFrameTemplates();
    res.json({
      frames,
      total: frames.length
    });
  } catch (error) {
    console.error('Frames fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/frames/:id
 * Get a specific frame template by ID
 */
router.get('/frames/:id', (req, res) => {
  try {
    const { id } = req.params;
    const frame = getFrameTemplate(id);

    if (!frame) {
      return res.status(404).json({ error: 'Frame template not found' });
    }

    res.json(frame);
  } catch (error) {
    console.error('Frame fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/design/gradients
 * Get available gradient presets
 */
router.get('/gradients', (req, res) => {
  try {
    const { type } = req.query;

    let gradients;
    if (type) {
      gradients = getGradientsByType(type);
    } else {
      gradients = getGradientPresets();
    }

    res.json({
      gradients,
      total: gradients.length
    });
  } catch (error) {
    console.error('Gradients fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
