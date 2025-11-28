/**
 * QR Decode & Rework Routes
 * Decode existing QR codes and optionally rework them with artistic styles
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  decodeQRFromImage,
  validateQRImageFile,
  getQRTypeInfo,
} = require('../utils/qrDecoder');
const { generateQRCode } = require('../utils/qrGenerator');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/qr-decode/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PNG, JPG, JPEG, WebP, PDF'));
    }
  },
});

/**
 * POST /api/qr/decode
 * Decode QR code from uploaded image
 *
 * Upload: multipart/form-data with 'qrImage' field
 * Response: Decoded QR data with type and parsed content
 */
router.post('/decode', upload.single('qrImage'), async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload a QR code image (PNG, JPG, JPEG, WebP, or PDF)',
      });
    }

    uploadedFilePath = req.file.path;

    // Validate file
    try {
      validateQRImageFile(req.file);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file',
        message: error.message,
      });
    }

    // Decode QR code
    console.log(`Decoding QR from: ${req.file.originalname} (${req.file.size} bytes)`);
    const decoded = await decodeQRFromImage(uploadedFilePath);

    if (!decoded.success) {
      return res.status(400).json({
        success: false,
        error: 'QR decode failed',
        message: decoded.error || 'No QR code found in image',
      });
    }

    // Get type info for UI
    const typeInfo = getQRTypeInfo(decoded.type);

    // Return decoded data
    res.json({
      success: true,
      message: 'QR code decoded successfully',
      qr: {
        content: decoded.data,
        type: decoded.type,
        typeInfo,
        parsed: decoded.parsed,
        metadata: decoded.metadata,
      },
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('QR decode error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  } finally {
    // Clean up uploaded file
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (err) {
        console.warn('Failed to delete uploaded file:', err.message);
      }
    }
  }
});

/**
 * POST /api/qr/rework
 * Decode QR code and generate new artistic QR with same content
 *
 * Upload: multipart/form-data with 'qrImage' field
 * Body fields:
 * - style: QR style (dots, squares, rounded, etc.)
 * - color: { dark, light } - QR colors
 * - logo: Logo URL (optional)
 * - errorCorrectionLevel: L, M, Q, H (default: H for artistic)
 * - width: QR size (default: 300)
 *
 * Response: Decoded data + newly generated artistic QR
 */
router.post('/rework', upload.single('qrImage'), async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload a QR code image',
      });
    }

    uploadedFilePath = req.file.path;

    // Validate file
    try {
      validateQRImageFile(req.file);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file',
        message: error.message,
      });
    }

    // Decode original QR
    console.log(`Reworking QR from: ${req.file.originalname}`);
    const decoded = await decodeQRFromImage(uploadedFilePath);

    if (!decoded.success) {
      return res.status(400).json({
        success: false,
        error: 'QR decode failed',
        message: decoded.error || 'No QR code found in image',
      });
    }

    // Check if QR type can be reworked
    const typeInfo = getQRTypeInfo(decoded.type);
    if (!typeInfo.canRework) {
      return res.status(400).json({
        success: false,
        error: 'Cannot rework this QR type',
        message: `QR type "${decoded.type}" cannot be reworked`,
      });
    }

    // Parse styling options from request body
    const style = req.body.style || 'dots';
    const errorCorrectionLevel = req.body.errorCorrectionLevel || 'H'; // High for artistic QR
    const width = parseInt(req.body.width) || 300;

    // Parse colors
    let color = { dark: '#000000', light: '#ffffff' };
    if (req.body.color) {
      try {
        const parsedColor = typeof req.body.color === 'string'
          ? JSON.parse(req.body.color)
          : req.body.color;
        color = { ...color, ...parsedColor };
      } catch (e) {
        console.warn('Invalid color format, using defaults');
      }
    }

    // Generate new artistic QR with same content
    const newQROptions = {
      errorCorrectionLevel,
      width,
      color,
      margin: 4,
    };

    console.log(`Generating new QR with style: ${style}, ECL: ${errorCorrectionLevel}`);
    const newQR = await generateQRCode(decoded.data, newQROptions);

    // Return both original data and new QR
    res.json({
      success: true,
      message: 'QR reworked successfully',
      original: {
        content: decoded.data,
        type: decoded.type,
        typeInfo,
        parsed: decoded.parsed,
      },
      reworked: {
        qr: newQR,
        style,
        options: newQROptions,
      },
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('QR rework error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  } finally {
    // Clean up uploaded file
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (err) {
        console.warn('Failed to delete uploaded file:', err.message);
      }
    }
  }
});

/**
 * GET /api/qr/rework/info
 * Get information about supported QR types for rework
 */
router.get('/rework/info', (req, res) => {
  const supportedTypes = [
    'wifi',
    'vcard',
    'email',
    'sms',
    'phone',
    'url',
    'vietqr',
    'zalo',
    'gcash',
    'paymaya',
    'promptpay',
    'alipay',
    'wechat',
    'pdf',
    'text',
  ];

  const typeDetails = {};
  supportedTypes.forEach((type) => {
    typeDetails[type] = getQRTypeInfo(type);
  });

  res.json({
    success: true,
    supportedTypes,
    typeDetails,
    limits: {
      maxFileSize: '10MB',
      allowedFormats: ['PNG', 'JPG', 'JPEG', 'WebP', 'PDF'],
      preprocessingStrategies: 4,
    },
    features: {
      autoTypeDetection: true,
      contentParsing: true,
      multiplePreprocessing: true,
      styleCustomization: true,
    },
  });
});

module.exports = router;
