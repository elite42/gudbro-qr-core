const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const Joi = require('joi');
const { generateQRCode, isValidURL } = require('../utils/qrGenerator');
const { generateUniqueShortCode, generateCustomShortCode } = require('../utils/shortcode');
const { cacheURL, invalidateCache } = require('../utils/cache');
const {
  generateWiFiQR,
  generateVCardQR,
  generateEmailQR,
  generateSMSQR,
  generateEventQR,
  generateSocialQR
} = require('../utils/qrTypes');
const {
  generateVietQRUrl,
  getSupportedBanks
} = require('../utils/vietqr');
const {
  generateZaloUrl,
  getZaloPlatformInfo
} = require('../utils/zalo');
const {
  generateWeChatPayUrl,
  getWeChatPayPlatformInfo,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY
} = require('../utils/wechatpay');
const {
  generateKakaoTalkUrl,
  getKakaoTalkPlatformInfo
} = require('../utils/kakaotalk');
const {
  generateLineUrl,
  getLinePlatformInfo
} = require('../utils/line');
const {
  generateAppStoreQRData,
  getAppStorePlatformInfo
} = require('../utils/appstore');
const {
  generatePdfQRData,
  getPdfQRPlatformInfo
} = require('../utils/pdf');
const {
  generateVideoQRData,
  getVideoQRPlatformInfo
} = require('../utils/video');
const {
  generateAudioQRData,
  getAudioQRPlatformInfo
} = require('../utils/audio');
const {
  generateMultiUrlQRData,
  getMultiUrlQRPlatformInfo
} = require('../utils/multiurl');
const {
  generateBusinessPageQRData,
  getBusinessPageQRPlatformInfo
} = require('../utils/businesspage');
const {
  generateCouponQRData,
  getCouponQRPlatformInfo
} = require('../utils/coupon');
const {
  generateFeedbackFormQRData,
  getFeedbackFormQRPlatformInfo
} = require('../utils/feedbackform');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Validation schemas
const createQRSchema = Joi.object({
  destination_url: Joi.string().uri().required(),
  title: Joi.string().max(120).optional(),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('static', 'dynamic').default('static'),
  custom_code: Joi.string().alphanum().min(4).max(32).optional(),
  max_scans: Joi.number().integer().min(1).optional(),
  expires_at: Joi.date().iso().optional(),
  is_active: Joi.boolean().optional()
});


const updateQRSchema = Joi.object({
  destination_url: Joi.string().uri().optional(),
  title: Joi.string().max(120).optional(),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('static', 'dynamic').optional(),
  custom_code: Joi.string().alphanum().min(4).max(32).optional(),
  max_scans: Joi.number().integer().min(1).optional(),
  expires_at: Joi.date().iso().optional(),
  is_active: Joi.boolean().optional()
});


/**
 * POST /qr - Create a new QR code
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = createQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { destination_url, title, description, type, custom_code } = value;

    // Additional URL validation
    if (!isValidURL(destination_url)) {
      return res.status(400).json({
        error: 'Invalid destination URL. Must be http:// or https://'
      });
    }

    // Generate short code
    let shortCode;
    if (custom_code) {
      // Custom code (premium feature - for now just validate)
      const checkExists = async (code) => {
        const result = await pool.query(
          'SELECT 1 FROM qr_codes WHERE short_code = $1',
          [code]
        );
        return result.rows.length > 0;
      };
      shortCode = await generateCustomShortCode(custom_code, checkExists);
    } else {
      // Generate random short code
      const checkExists = async (code) => {
        const result = await pool.query(
          'SELECT 1 FROM qr_codes WHERE short_code = $1',
          [code]
        );
        return result.rows.length > 0;
      };
      shortCode = await generateUniqueShortCode(checkExists);
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO qr_codes (short_code, destination_url, title, description, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, short_code, destination_url, title, description, type, created_at`,
      [shortCode, destination_url, title, description, type]
    );

    const qrCode = result.rows[0];

    // Generate QR code image
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    const qrImage = await generateQRCode(shortUrl);

    // Cache the URL in Redis
    await cacheURL(shortCode, destination_url);

    // Return response
    res.status(201).json({
      success: true,
      data: {
        id: qrCode.id,
        short_code: qrCode.short_code,
        short_url: shortUrl,
        destination_url: qrCode.destination_url,
        title: qrCode.title,
        description: qrCode.description,
        type: qrCode.type,
        qr_image: qrImage,
        created_at: qrCode.created_at
      }
    });

    console.log(`✅ QR created: ${shortCode} → ${destination_url}`);

  } catch (error) {
    console.error('Create QR error:', error);
    
    if (error.message.includes('already taken')) {
      return res.status(409).json({
        error: 'Custom code already taken',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/:id - Get QR code details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id, short_code, destination_url, title, description, type,
        is_active, total_scans, last_scanned_at, created_at, updated_at
       FROM qr_codes 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    const qrCode = result.rows[0];
    const shortUrl = `${process.env.BASE_URL}/${qrCode.short_code}`;

    res.json({
      success: true,
      data: {
        ...qrCode,
        short_url: shortUrl
      }
    });

  } catch (error) {
    console.error('Get QR error:', error);
    res.status(500).json({
      error: 'Failed to fetch QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr - List all QR codes (with pagination)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM qr_codes');
    const total = parseInt(countResult.rows[0].count);

    // Get paginated QR codes
    const result = await pool.query(
      `SELECT 
        id, short_code, destination_url, title, type,
        is_active, total_scans, last_scanned_at, created_at
       FROM qr_codes 
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const qrCodes = result.rows.map(qr => ({
      ...qr,
      short_url: `${process.env.BASE_URL}/${qr.short_code}`
    }));

    res.json({
      success: true,
      data: qrCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('List QR error:', error);
    res.status(500).json({
      error: 'Failed to fetch QR codes',
      message: error.message
    });
  }
});

/**
 * PATCH /qr/:id - Update QR code
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = updateQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (value.destination_url !== undefined) {
      if (!isValidURL(value.destination_url)) {
        return res.status(400).json({
          error: 'Invalid destination URL'
        });
      }
      updates.push(`destination_url = $${paramIndex++}`);
      values.push(value.destination_url);
    }

    if (value.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(value.title);
    }

    if (value.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(value.description);
    }

    if (value.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(value.is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update'
      });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE qr_codes 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, short_code, destination_url, title, description, is_active, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    const qrCode = result.rows[0];

    // If destination URL changed, invalidate cache
    if (value.destination_url !== undefined) {
      await invalidateCache(qrCode.short_code);
      await cacheURL(qrCode.short_code, value.destination_url);
      console.log(`🔄 Updated QR: ${qrCode.short_code} → ${value.destination_url}`);
    }

    res.json({
      success: true,
      data: {
        ...qrCode,
        short_url: `${process.env.BASE_URL}/${qrCode.short_code}`
      }
    });

  } catch (error) {
    console.error('Update QR error:', error);
    res.status(500).json({
      error: 'Failed to update QR code',
      message: error.message
    });
  }
});

/**
 * DELETE /qr/:id - Delete QR code
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get short code before deleting (for cache invalidation)
    const qrResult = await pool.query(
      'SELECT short_code FROM qr_codes WHERE id = $1',
      [id]
    );

    if (qrResult.rows.length === 0) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    const shortCode = qrResult.rows[0].short_code;

    // Delete from database (CASCADE will delete scans)
    await pool.query('DELETE FROM qr_codes WHERE id = $1', [id]);

    // Invalidate cache
    await invalidateCache(shortCode);

    console.log(`🗑️  Deleted QR: ${shortCode}`);

    res.status(204).send();

  } catch (error) {
    console.error('Delete QR error:', error);
    res.status(500).json({
      error: 'Failed to delete QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/wifi - Generate WiFi QR code
 */
router.post('/wifi', async (req, res) => {
  try {
    const schema = Joi.object({
      ssid: Joi.string().required(),
      password: Joi.string().when('encryption', {
        is: Joi.string().valid('WPA', 'WEP'),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      encryption: Joi.string().valid('WPA', 'WEP', 'nopass').default('WPA'),
      hidden: Joi.boolean().default(false),
      // Optional customization
      title: Joi.string().max(120).optional(),
      description: Joi.string().max(500).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { ssid, password, encryption, hidden, title, description } = value;

    // Generate WiFi QR string
    const wifiString = generateWiFiQR({ ssid, password, encryption, hidden });

    // Generate QR code image
    const qrImage = await generateQRCode(wifiString);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'wifi',
        ssid,
        encryption,
        hidden,
        qr_string: wifiString,
        qr_image: qrImage,
        title,
        description
      }
    });

    console.log(`✅ WiFi QR created: ${ssid} (${encryption})`);

  } catch (error) {
    console.error('Create WiFi QR error:', error);
    res.status(500).json({
      error: 'Failed to generate WiFi QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/vcard - Generate vCard (contact) QR code
 */
router.post('/vcard', async (req, res) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().optional(),
      phone: Joi.string().optional(),
      email: Joi.string().email().optional(),
      company: Joi.string().optional(),
      title: Joi.string().optional(),
      address: Joi.string().optional(),
      website: Joi.string().uri().optional(),
      note: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate vCard string
    const vcardString = generateVCardQR(value);

    // Generate QR code image
    const qrImage = await generateQRCode(vcardString);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'vcard',
        contact: value,
        qr_string: vcardString,
        qr_image: qrImage
      }
    });

    console.log(`✅ vCard QR created: ${value.firstName} ${value.lastName || ''}`);

  } catch (error) {
    console.error('Create vCard QR error:', error);
    res.status(500).json({
      error: 'Failed to generate vCard QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/email - Generate Email QR code
 */
router.post('/email', async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      subject: Joi.string().optional(),
      body: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate email mailto string
    const emailString = generateEmailQR(value);

    // Generate QR code image
    const qrImage = await generateQRCode(emailString);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'email',
        email: value.email,
        subject: value.subject,
        qr_string: emailString,
        qr_image: qrImage
      }
    });

    console.log(`✅ Email QR created: ${value.email}`);

  } catch (error) {
    console.error('Create Email QR error:', error);
    res.status(500).json({
      error: 'Failed to generate Email QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/sms - Generate SMS QR code
 */
router.post('/sms', async (req, res) => {
  try {
    const schema = Joi.object({
      phone: Joi.string().required(),
      message: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate SMS string
    const smsString = generateSMSQR(value);

    // Generate QR code image
    const qrImage = await generateQRCode(smsString);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'sms',
        phone: value.phone,
        message: value.message,
        qr_string: smsString,
        qr_image: qrImage
      }
    });

    console.log(`✅ SMS QR created: ${value.phone}`);

  } catch (error) {
    console.error('Create SMS QR error:', error);
    res.status(500).json({
      error: 'Failed to generate SMS QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/event - Generate Event (iCalendar) QR code
 */
router.post('/event', async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      start: Joi.date().iso().required(),
      end: Joi.date().iso().required(),
      location: Joi.string().optional(),
      description: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate event iCalendar string
    const eventString = generateEventQR(value);

    // Generate QR code image
    const qrImage = await generateQRCode(eventString);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'event',
        event: value,
        qr_string: eventString,
        qr_image: qrImage
      }
    });

    console.log(`✅ Event QR created: ${value.title}`);

  } catch (error) {
    console.error('Create Event QR error:', error);
    res.status(500).json({
      error: 'Failed to generate Event QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/social - Generate Social Media QR code
 */
router.post('/social', async (req, res) => {
  try {
    const schema = Joi.object({
      platform: Joi.string()
        .valid('instagram', 'facebook', 'twitter', 'x', 'linkedin', 'tiktok', 'youtube', 'github')
        .required(),
      username: Joi.string().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate social media URL
    const socialURL = generateSocialQR(value);

    // Generate QR code image
    const qrImage = await generateQRCode(socialURL);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'social',
        platform: value.platform,
        username: value.username,
        url: socialURL,
        qr_string: socialURL,
        qr_image: qrImage
      }
    });

    console.log(`✅ Social QR created: ${value.platform}/${value.username}`);

  } catch (error) {
    console.error('Create Social QR error:', error);
    res.status(500).json({
      error: 'Failed to generate Social QR code',
      message: error.message
    });
  }
});

/**
 * POST /qr/vietqr - Create VietQR Payment QR Code
 *
 * Vietnam National Payment Standard (NAPAS)
 * Supports all major Vietnamese banks + e-wallets
 *
 * @route POST /qr/vietqr
 * @param {string} bankCode - Bank code (VCB, BIDV, VTB, ARB, etc.)
 * @param {string} accountNumber - Bank account number (6-20 digits)
 * @param {string} accountName - Account holder name
 * @param {number} [amount] - Payment amount in VND (optional)
 * @param {string} [description] - Payment description (optional)
 * @param {string} [title] - QR title (optional)
 * @param {string} [template=compact] - QR template: compact, print, qr_only
 *
 * @returns {Object} VietQR data with QR image
 */
router.post('/vietqr', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      bankCode: Joi.string().required(),
      accountNumber: Joi.string().required(),
      accountName: Joi.string().required(),
      amount: Joi.number().min(0).max(500000000).optional(),
      description: Joi.string().max(255).optional(),
      title: Joi.string().max(120).optional(),
      template: Joi.string().valid('compact', 'print', 'qr_only').default('compact')
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate VietQR URL and metadata
    const vietqrData = generateVietQRUrl({
      bankCode: value.bankCode,
      accountNumber: value.accountNumber,
      accountName: value.accountName,
      amount: value.amount,
      description: value.description,
      template: value.template
    });

    // Generate QR code from VietQR URL
    const qrImage = await generateQRCode(vietqrData.url, {
      errorCorrectionLevel: 'M', // Medium for payment QR
      width: 512
    });

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'vietqr',
        qr_string: vietqrData.url,
        qr_image: qrImage,
        metadata: {
          bankCode: vietqrData.bankCode,
          bankName: vietqrData.bankName,
          bankBin: vietqrData.bankBin,
          accountNumber: vietqrData.accountNumber,
          accountName: vietqrData.accountName,
          amount: vietqrData.amount,
          description: vietqrData.description,
          template: vietqrData.template,
          vietqrUrl: vietqrData.url
        },
        title: value.title || `VietQR - ${vietqrData.bankName}`
      }
    });

    console.log(`✅ VietQR created: ${vietqrData.bankCode} - ${vietqrData.accountNumber}`);

  } catch (error) {
    console.error('Create VietQR error:', error);
    res.status(500).json({
      error: 'Failed to generate VietQR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/vietqr/banks - Get supported Vietnamese banks
 *
 * @route GET /qr/vietqr/banks
 * @returns {Array} List of supported banks
 */
router.get('/vietqr/banks', (req, res) => {
  try {
    const banks = getSupportedBanks();

    res.status(200).json({
      success: true,
      data: {
        count: banks.length,
        banks: banks
      }
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({
      error: 'Failed to get supported banks',
      message: error.message
    });
  }
});

/**
 * POST /qr/zalo - Create Zalo Social QR Code
 *
 * Zalo is Vietnam's #1 messaging app (74M+ users)
 * QR code opens Zalo app to add friend or start chat
 *
 * @route POST /qr/zalo
 * @param {string} [phoneNumber] - Vietnamese phone number (84xxxxxxxxx or 0xxxxxxxxx)
 * @param {string} [zaloId] - Zalo ID (if known)
 * @param {string} [displayName] - Display name (optional)
 * @param {string} [message] - Pre-filled message (optional, max 500 chars)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} Zalo QR data with QR image
 */
router.post('/zalo', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      phoneNumber: Joi.string().optional(),
      zaloId: Joi.string().optional(),
      displayName: Joi.string().max(100).optional(),
      message: Joi.string().max(500).optional(),
      title: Joi.string().max(120).optional()
    }).or('phoneNumber', 'zaloId'); // At least one required

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate Zalo URL and metadata
    const zaloData = generateZaloUrl({
      phoneNumber: value.phoneNumber,
      zaloId: value.zaloId,
      displayName: value.displayName,
      message: value.message
    });

    // Generate QR code from Zalo URL
    const qrImage = await generateQRCode(zaloData.url, {
      errorCorrectionLevel: 'M', // Medium for social QR
      width: 512
    });

    // Format response metadata
    const metadata = {
      identifier: zaloData.identifier,
      identifierType: zaloData.identifierType,
      zaloUrl: zaloData.url
    };

    if (value.phoneNumber) {
      metadata.phoneNumber = zaloData.rawIdentifier;
      metadata.internationalPhone = zaloData.identifier;
    }

    if (value.zaloId) {
      metadata.zaloId = zaloData.identifier;
    }

    if (zaloData.displayName) {
      metadata.displayName = zaloData.displayName;
    }

    if (zaloData.message) {
      metadata.message = zaloData.message;
    }

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'zalo',
        qr_string: zaloData.url,
        qr_image: qrImage,
        metadata: metadata,
        title: value.title || `Zalo - ${zaloData.displayName || zaloData.identifier}`
      }
    });

    console.log(`✅ Zalo QR created: ${zaloData.identifierType} - ${zaloData.identifier}`);

  } catch (error) {
    console.error('Create Zalo QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Zalo QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/zalo/info - Get Zalo platform information
 *
 * @route GET /qr/zalo/info
 * @returns {Object} Zalo platform details
 */
router.get('/zalo/info', (req, res) => {
  try {
    const platformInfo = getZaloPlatformInfo();

    res.status(200).json({
      success: true,
      data: platformInfo
    });
  } catch (error) {
    console.error('Get Zalo info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Zalo platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/wechat-pay - Create WeChat Pay QR Code
 *
 * WeChat Pay for Chinese tourists (1B+ users)
 * Phase 1: Static merchant QR - customer enters amount manually
 *
 * @route POST /qr/wechat-pay
 * @param {string} merchantId - WeChat Pay merchant ID (10 digits)
 * @param {number} [amount] - Amount (optional, display only in Phase 1)
 * @param {string} [currency=CNY] - Currency: CNY or VND
 * @param {string} [description] - Payment description (optional)
 * @param {string} [orderId] - Merchant order ID (optional)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} WeChat Pay QR data with QR image
 */
router.post('/wechat-pay', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      merchantId: Joi.string().required(),
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().valid(...SUPPORTED_CURRENCIES).default(DEFAULT_CURRENCY),
      description: Joi.string().max(255).optional(),
      orderId: Joi.string().min(1).max(32).optional(),
      title: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate WeChat Pay URL and metadata
    const wechatPayData = generateWeChatPayUrl({
      merchantId: value.merchantId,
      amount: value.amount,
      currency: value.currency,
      description: value.description,
      orderId: value.orderId
    });

    // Generate QR code from WeChat Pay URL
    const qrImage = await generateQRCode(wechatPayData.url, {
      errorCorrectionLevel: 'M', // Medium for payment QR
      width: 512
    });

    // Format response metadata
    const metadata = {
      merchantId: wechatPayData.merchantId,
      currency: wechatPayData.currency,
      wechatPayUrl: wechatPayData.url,
      implementationPhase: wechatPayData.implementationPhase,
      note: wechatPayData.note
    };

    if (wechatPayData.amount !== null) {
      metadata.amount = wechatPayData.amount;
    }

    if (wechatPayData.description) {
      metadata.description = wechatPayData.description;
    }

    if (wechatPayData.orderId) {
      metadata.orderId = wechatPayData.orderId;
    }

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'wechat-pay',
        qr_string: wechatPayData.url,
        qr_image: qrImage,
        metadata: metadata,
        title: value.title || `WeChat Pay - ${wechatPayData.merchantId}`
      }
    });

    console.log(`✅ WeChat Pay QR created: Merchant ${wechatPayData.merchantId} - ${wechatPayData.currency}`);

  } catch (error) {
    console.error('Create WeChat Pay QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate WeChat Pay QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/wechat-pay/info - Get WeChat Pay platform information
 *
 * @route GET /qr/wechat-pay/info
 * @returns {Object} WeChat Pay platform details
 */
router.get('/wechat-pay/info', (req, res) => {
  try {
    const platformInfo = getWeChatPayPlatformInfo();

    res.status(200).json({
      success: true,
      data: platformInfo
    });
  } catch (error) {
    console.error('Get WeChat Pay info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get WeChat Pay platform info',
      message: error.message
    });
  }
});

/**
 * GET /qr/wechat-pay/currencies - Get supported currencies
 *
 * @route GET /qr/wechat-pay/currencies
 * @returns {Array} List of supported currencies
 */
router.get('/wechat-pay/currencies', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        default: DEFAULT_CURRENCY,
        supported: SUPPORTED_CURRENCIES
      }
    });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported currencies',
      message: error.message
    });
  }
});

/**
 * POST /qr/kakaotalk - Create KakaoTalk QR Code
 *
 * KakaoTalk is South Korea's dominant messaging app (95% penetration, 47M users)
 * Critical for Korean tourists in Vietnam
 *
 * @route POST /qr/kakaotalk
 * @param {string} [phoneNumber] - Korean phone number (+82-10-xxxx-xxxx or 010-xxxx-xxxx)
 * @param {string} [kakaoId] - KakaoTalk ID (4-20 chars)
 * @param {string} [plusFriendId] - Plus Friend ID for business (@businessname)
 * @param {string} [displayName] - Display name (optional)
 * @param {string} [message] - Pre-filled message (optional, max 500 chars)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} KakaoTalk QR data with QR image
 */
router.post('/kakaotalk', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      phoneNumber: Joi.string().optional(),
      kakaoId: Joi.string().optional(),
      plusFriendId: Joi.string().optional(),
      displayName: Joi.string().max(100).optional(),
      message: Joi.string().max(500).optional(),
      title: Joi.string().max(120).optional()
    }).or('phoneNumber', 'kakaoId', 'plusFriendId'); // At least one required

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate KakaoTalk URL and metadata
    const kakaoData = generateKakaoTalkUrl({
      phoneNumber: value.phoneNumber,
      kakaoId: value.kakaoId,
      plusFriendId: value.plusFriendId,
      displayName: value.displayName,
      message: value.message
    });

    // Generate QR code from KakaoTalk URL
    const qrImage = await generateQRCode(kakaoData.url, {
      errorCorrectionLevel: 'M', // Medium for social QR
      width: 512
    });

    // Format response metadata
    const metadata = {
      identifier: kakaoData.identifier,
      identifierType: kakaoData.identifierType,
      accountType: kakaoData.accountType,
      kakaoTalkUrl: kakaoData.url
    };

    if (value.phoneNumber) {
      metadata.phoneNumber = kakaoData.rawIdentifier;
      metadata.internationalPhone = kakaoData.identifier;
    }

    if (value.kakaoId) {
      metadata.kakaoId = kakaoData.identifier;
    }

    if (value.plusFriendId) {
      metadata.plusFriendId = kakaoData.identifier;
    }

    if (kakaoData.displayName) {
      metadata.displayName = kakaoData.displayName;
    }

    if (kakaoData.message) {
      metadata.message = kakaoData.message;
    }

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'kakaotalk',
        qr_string: kakaoData.url,
        qr_image: qrImage,
        metadata: metadata,
        title: value.title || `KakaoTalk - ${kakaoData.displayName || kakaoData.identifier}`
      }
    });

    console.log(`✅ KakaoTalk QR created: ${kakaoData.identifierType} - ${kakaoData.identifier}`);

  } catch (error) {
    console.error('Create KakaoTalk QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate KakaoTalk QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/kakaotalk/info - Get KakaoTalk platform information
 *
 * @route GET /qr/kakaotalk/info
 * @returns {Object} KakaoTalk platform details
 */
router.get('/kakaotalk/info', (req, res) => {
  try {
    const platformInfo = getKakaoTalkPlatformInfo();

    res.status(200).json({
      success: true,
      data: platformInfo
    });
  } catch (error) {
    console.error('Get KakaoTalk info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KakaoTalk platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/line - Create LINE QR Code
 *
 * LINE is popular in Thailand (49M), Taiwan (21M), and Japan (95M)
 * Critical for Thai and Taiwanese tourists in Vietnam
 *
 * @route POST /qr/line
 * @param {string} [lineId] - LINE ID (4-20 chars, alphanumeric + . _)
 * @param {string} [phoneNumber] - Phone number (+66 TH, +886 TW, +81 JP)
 * @param {string} [officialAccountId] - Official Account ID for business (@businessname)
 * @param {string} [displayName] - Display name (optional)
 * @param {string} [message] - Pre-filled message (optional, max 500 chars)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} LINE QR data with QR image
 */
router.post('/line', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      lineId: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
      officialAccountId: Joi.string().optional(),
      displayName: Joi.string().max(100).optional(),
      message: Joi.string().max(500).optional(),
      title: Joi.string().max(120).optional()
    }).or('lineId', 'phoneNumber', 'officialAccountId'); // At least one required

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate LINE URL and metadata
    const lineData = generateLineUrl({
      lineId: value.lineId,
      phoneNumber: value.phoneNumber,
      officialAccountId: value.officialAccountId,
      displayName: value.displayName,
      message: value.message
    });

    // Generate QR code from LINE URL
    const qrImage = await generateQRCode(lineData.url, {
      errorCorrectionLevel: 'M', // Medium for social QR
      width: 512
    });

    // Format response metadata
    const metadata = {
      identifier: lineData.identifier,
      identifierType: lineData.identifierType,
      accountType: lineData.accountType,
      lineUrl: lineData.url
    };

    if (value.lineId) {
      metadata.lineId = lineData.identifier;
    }

    if (value.phoneNumber) {
      metadata.phoneNumber = lineData.rawIdentifier;
      metadata.internationalPhone = lineData.identifier;
      if (lineData.country) {
        metadata.country = lineData.country;
      }
    }

    if (value.officialAccountId) {
      metadata.officialAccountId = lineData.identifier;
    }

    if (lineData.displayName) {
      metadata.displayName = lineData.displayName;
    }

    if (lineData.message) {
      metadata.message = lineData.message;
    }

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'line',
        qr_string: lineData.url,
        qr_image: qrImage,
        metadata: metadata,
        title: value.title || `LINE - ${lineData.displayName || lineData.identifier}`
      }
    });

    console.log(`✅ LINE QR created: ${lineData.identifierType} - ${lineData.identifier}`);

  } catch (error) {
    console.error('Create LINE QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate LINE QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/line/info - Get LINE platform information
 *
 * @route GET /qr/line/info
 * @returns {Object} LINE platform details
 */
router.get('/line/info', (req, res) => {
  try {
    const platformInfo = getLinePlatformInfo();

    res.status(200).json({
      success: true,
      data: platformInfo
    });
  } catch (error) {
    console.error('Get LINE info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get LINE platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/app-store - Create App Store QR Code
 *
 * Direct users to download apps from Apple App Store or Google Play Store
 * Essential for restaurant ordering apps and loyalty programs
 *
 * @route POST /qr/app-store
 * @param {string} [appleAppId] - Apple App Store ID (9-10 digits)
 * @param {string} [appleAppUrl] - Full Apple App Store URL
 * @param {string} [googlePackageName] - Android package name (com.company.app)
 * @param {string} [googleAppUrl] - Full Google Play Store URL
 * @param {string} [platform=auto] - Target platform: ios, android, or auto
 * @param {string} [fallbackUrl] - Desktop fallback URL
 * @param {string} [appName] - App display name
 * @param {string} [appIcon] - App icon URL
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} App Store QR data with QR image
 */
router.post('/app-store', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      appleAppId: Joi.string().optional(),
      appleAppUrl: Joi.string().uri().optional(),
      googlePackageName: Joi.string().optional(),
      googleAppUrl: Joi.string().uri().optional(),
      platform: Joi.string().valid('ios', 'android', 'auto').default('auto'),
      fallbackUrl: Joi.string().uri().optional(),
      appName: Joi.string().max(100).optional(),
      appIcon: Joi.string().uri().optional(),
      title: Joi.string().max(120).optional()
    }).or('appleAppId', 'appleAppUrl', 'googlePackageName', 'googleAppUrl'); // At least one required

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    // Generate App Store QR data
    const appStoreData = generateAppStoreQRData({
      appleAppId: value.appleAppId,
      appleAppUrl: value.appleAppUrl,
      googlePackageName: value.googlePackageName,
      googleAppUrl: value.googleAppUrl,
      platform: value.platform,
      fallbackUrl: value.fallbackUrl,
      appName: value.appName,
      appIcon: value.appIcon
    });

    // Generate QR code from destination URL
    const qrImage = await generateQRCode(appStoreData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    // Format response metadata
    const metadata = {
      platform: appStoreData.platform,
      destinationUrl: appStoreData.url
    };

    if (appStoreData.iosUrl) {
      metadata.iosUrl = appStoreData.iosUrl;
    }

    if (appStoreData.androidUrl) {
      metadata.androidUrl = appStoreData.androidUrl;
    }

    if (appStoreData.fallbackUrl) {
      metadata.fallbackUrl = appStoreData.fallbackUrl;
    }

    if (appStoreData.appName) {
      metadata.appName = appStoreData.appName;
    }

    if (appStoreData.appIcon) {
      metadata.appIcon = appStoreData.appIcon;
    }

    if (appStoreData.note) {
      metadata.note = appStoreData.note;
    }

    // Return response
    res.status(200).json({
      success: true,
      data: {
        type: 'app-store',
        qr_string: appStoreData.url,
        qr_image: qrImage,
        metadata: metadata,
        title: value.title || `Download App${appStoreData.appName ? ` - ${appStoreData.appName}` : ''}`
      }
    });

    console.log(`✅ App Store QR created: ${appStoreData.platform} - ${appStoreData.url}`);

  } catch (error) {
    console.error('Create App Store QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate App Store QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/app-store/info - Get App Store QR platform information
 *
 * @route GET /qr/app-store/info
 * @returns {Object} App Store platform details
 */
router.get('/app-store/info', (req, res) => {
  try {
    const platformInfo = getAppStorePlatformInfo();

    res.status(200).json({
      success: true,
      data: platformInfo
    });
  } catch (error) {
    console.error('Get App Store info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get App Store platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/pdf - Create PDF QR Code
 */
router.post('/pdf', async (req, res) => {
  try {
    const schema = Joi.object({
      pdfUrl: Joi.string().uri().required(),
      pdfTitle: Joi.string().max(200).optional(),
      download: Joi.boolean().default(false),
      fileSize: Joi.number().integer().positive().optional(),
      title: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const pdfData = generatePdfQRData({
      pdfUrl: value.pdfUrl,
      pdfTitle: value.pdfTitle,
      download: value.download,
      fileSize: value.fileSize
    });

    const qrImage = await generateQRCode(pdfData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'pdf',
        qr_string: pdfData.url,
        qr_image: qrImage,
        metadata: {
          pdfUrl: pdfData.pdfUrl,
          pdfTitle: pdfData.pdfTitle,
          download: pdfData.download,
          fileSize: pdfData.fileSize,
          note: pdfData.note
        },
        title: value.title || pdfData.pdfTitle || 'PDF Document'
      }
    });

    console.log(`✅ PDF QR created: ${pdfData.pdfUrl}`);
  } catch (error) {
    console.error('Create PDF QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate PDF QR code',
      message: error.message
    });
  }
});

router.get('/pdf/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getPdfQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get PDF platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/video - Create Video QR Code
 *
 * Link to video content on various platforms
 * Supports YouTube, Vimeo, Facebook, Instagram, TikTok, and direct video files
 *
 * @route POST /qr/video
 * @param {string} videoUrl - Video URL (required)
 * @param {string} [videoTitle] - Video title/description (optional)
 * @param {string} [platform] - Platform override (optional)
 * @param {boolean} [autoplay=false] - Autoplay flag (YouTube only)
 * @param {number} [startTime] - Start time in seconds (YouTube only)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} Video QR data with QR image
 */
router.post('/video', async (req, res) => {
  try {
    const schema = Joi.object({
      videoUrl: Joi.string().uri().required(),
      videoTitle: Joi.string().max(200).optional(),
      platform: Joi.string().optional(),
      autoplay: Joi.boolean().default(false),
      startTime: Joi.number().integer().positive().optional(),
      title: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const videoData = generateVideoQRData({
      videoUrl: value.videoUrl,
      videoTitle: value.videoTitle,
      platform: value.platform,
      autoplay: value.autoplay,
      startTime: value.startTime
    });

    const qrImage = await generateQRCode(videoData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'video',
        qr_string: videoData.url,
        qr_image: qrImage,
        metadata: {
          videoUrl: videoData.videoUrl,
          videoTitle: videoData.videoTitle,
          platform: videoData.platform,
          autoplay: videoData.autoplay,
          startTime: videoData.startTime
        },
        title: value.title || videoData.videoTitle || `Video - ${videoData.platform}`
      }
    });

    console.log(`✅ Video QR created: ${videoData.platform} - ${videoData.videoUrl}`);
  } catch (error) {
    console.error('Create Video QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Video QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/video/info - Get Video QR platform information
 *
 * @route GET /qr/video/info
 * @returns {Object} Video platform details
 */
router.get('/video/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getVideoQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Video platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/audio - Create Audio QR Code
 *
 * Link to audio content on various platforms
 * Supports Spotify, Apple Music, SoundCloud, YouTube Music, and direct audio files
 *
 * @route POST /qr/audio
 * @param {string} audioUrl - Audio URL (required)
 * @param {string} [audioTitle] - Audio title/track name (optional)
 * @param {string} [artistName] - Artist name (optional)
 * @param {string} [platform] - Platform override (optional)
 * @param {string} [audioType] - Type: track, album, playlist, podcast, artist (optional)
 * @param {number} [duration] - Duration in seconds (optional)
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} Audio QR data with QR image
 */
router.post('/audio', async (req, res) => {
  try {
    const schema = Joi.object({
      audioUrl: Joi.string().uri().required(),
      audioTitle: Joi.string().max(200).optional(),
      artistName: Joi.string().max(100).optional(),
      platform: Joi.string().optional(),
      audioType: Joi.string().valid('track', 'album', 'playlist', 'podcast', 'artist').optional(),
      duration: Joi.number().integer().positive().optional(),
      title: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const audioData = generateAudioQRData({
      audioUrl: value.audioUrl,
      audioTitle: value.audioTitle,
      artistName: value.artistName,
      platform: value.platform,
      audioType: value.audioType,
      duration: value.duration
    });

    const qrImage = await generateQRCode(audioData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'audio',
        qr_string: audioData.url,
        qr_image: qrImage,
        metadata: {
          audioUrl: audioData.audioUrl,
          audioTitle: audioData.audioTitle,
          artistName: audioData.artistName,
          platform: audioData.platform,
          audioType: audioData.audioType,
          duration: audioData.duration
        },
        title: value.title || audioData.audioTitle || `Audio - ${audioData.platform}`
      }
    });

    console.log(`✅ Audio QR created: ${audioData.platform} - ${audioData.audioUrl}`);
  } catch (error) {
    console.error('Create Audio QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Audio QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/audio/info - Get Audio QR platform information
 *
 * @route GET /qr/audio/info
 * @returns {Object} Audio platform details
 */
router.get('/audio/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getAudioQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Audio platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/multi-url - Create Multi-URL QR Code
 *
 * Smart QR code that can direct to different URLs based on device type,
 * priority, or provide user choice landing page
 *
 * @route POST /qr/multi-url
 * @param {Array} urls - Array of URL objects: [{url, label, device, priority, description}]
 * @param {string} [title] - Landing page title (default: "Choose Your Link")
 * @param {string} [routingStrategy=primary] - Strategy: primary, device, choice, priority
 * @param {string} [landingPageUrl] - Custom landing page URL (optional)
 * @param {string} [qrTitle] - QR title for metadata (optional)
 *
 * @returns {Object} Multi-URL QR data with QR image
 */
router.post('/multi-url', async (req, res) => {
  try {
    const schema = Joi.object({
      urls: Joi.array().min(2).max(10).items(
        Joi.object({
          url: Joi.string().uri().required(),
          label: Joi.string().max(100).optional(),
          device: Joi.string().valid('all', 'ios', 'android', 'desktop', 'mobile').default('all'),
          priority: Joi.number().integer().min(1).max(100).optional(),
          description: Joi.string().max(500).optional()
        })
      ).required(),
      title: Joi.string().max(200).optional(),
      routingStrategy: Joi.string().valid('primary', 'device', 'choice', 'priority').default('primary'),
      landingPageUrl: Joi.string().uri().optional(),
      qrTitle: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const multiUrlData = generateMultiUrlQRData({
      urls: value.urls,
      title: value.title,
      routingStrategy: value.routingStrategy,
      landingPageUrl: value.landingPageUrl
    });

    const qrImage = await generateQRCode(multiUrlData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'multi-url',
        qr_string: multiUrlData.url,
        qr_image: qrImage,
        metadata: {
          primaryUrl: multiUrlData.primaryUrl,
          urls: multiUrlData.urls,
          title: multiUrlData.title,
          routingStrategy: multiUrlData.routingStrategy,
          urlCount: multiUrlData.urlCount,
          implementationPhase: multiUrlData.implementationPhase,
          note: multiUrlData.note
        },
        title: value.qrTitle || multiUrlData.title
      }
    });

    console.log(`✅ Multi-URL QR created: ${multiUrlData.routingStrategy} - ${multiUrlData.urlCount} URLs`);
  } catch (error) {
    console.error('Create Multi-URL QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Multi-URL QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/multi-url/info - Get Multi-URL QR platform information
 *
 * @route GET /qr/multi-url/info
 * @returns {Object} Multi-URL platform details
 */
router.get('/multi-url/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getMultiUrlQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Multi-URL platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/business-page - Create Business Page QR Code
 *
 * Comprehensive digital business card with full information
 * Perfect for restaurants, shops, service businesses
 *
 * @route POST /qr/business-page
 * @param {string} businessName - Business name (required)
 * @param {string} [description] - Business description
 * @param {string} [websiteUrl] - Website URL
 * @param {string} [email] - Email address
 * @param {string} [phone] - Phone number
 * @param {Object} [address] - Address {street, city, state, country, postalCode}
 * @param {Object} [businessHours] - Hours {monday, tuesday, ...}
 * @param {Object} [socialLinks] - Social links {facebook, instagram, ...}
 * @param {Array} [categories] - Categories/tags
 * @param {string} [logo] - Logo URL
 * @param {string} [coverImage] - Cover image URL
 * @param {string} [landingPageUrl] - Custom landing page URL
 * @param {string} [title] - QR title (optional)
 *
 * @returns {Object} Business Page QR data with QR image
 */
router.post('/business-page', async (req, res) => {
  try {
    const schema = Joi.object({
      businessName: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(1000).optional(),
      websiteUrl: Joi.string().uri().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().min(8).max(20).optional(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        postalCode: Joi.string().optional()
      }).optional(),
      businessHours: Joi.object({
        monday: Joi.string().optional(),
        tuesday: Joi.string().optional(),
        wednesday: Joi.string().optional(),
        thursday: Joi.string().optional(),
        friday: Joi.string().optional(),
        saturday: Joi.string().optional(),
        sunday: Joi.string().optional()
      }).optional(),
      socialLinks: Joi.object({
        facebook: Joi.string().optional(),
        instagram: Joi.string().optional(),
        twitter: Joi.string().optional(),
        x: Joi.string().optional(),
        linkedin: Joi.string().optional(),
        tiktok: Joi.string().optional(),
        youtube: Joi.string().optional(),
        whatsapp: Joi.string().optional(),
        zalo: Joi.string().optional(),
        line: Joi.string().optional(),
        kakaotalk: Joi.string().optional(),
        wechat: Joi.string().optional(),
        website: Joi.string().uri().optional()
      }).optional(),
      categories: Joi.array().items(Joi.string().max(50)).max(10).optional(),
      logo: Joi.string().uri().optional(),
      coverImage: Joi.string().uri().optional(),
      landingPageUrl: Joi.string().uri().optional(),
      title: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const businessPageData = generateBusinessPageQRData({
      businessName: value.businessName,
      description: value.description,
      websiteUrl: value.websiteUrl,
      email: value.email,
      phone: value.phone,
      address: value.address,
      businessHours: value.businessHours,
      socialLinks: value.socialLinks,
      categories: value.categories,
      logo: value.logo,
      coverImage: value.coverImage,
      landingPageUrl: value.landingPageUrl
    });

    const qrImage = await generateQRCode(businessPageData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'business-page',
        qr_string: businessPageData.url,
        qr_image: qrImage,
        metadata: {
          businessInfo: businessPageData.businessInfo,
          implementationPhase: businessPageData.implementationPhase,
          note: businessPageData.note
        },
        title: value.title || `Business - ${businessPageData.businessInfo.name}`
      }
    });

    console.log(`✅ Business Page QR created: ${businessPageData.businessInfo.name}`);
  } catch (error) {
    console.error('Create Business Page QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Business Page QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/business-page/info - Get Business Page QR platform information
 *
 * @route GET /qr/business-page/info
 * @returns {Object} Business Page platform details
 */
router.get('/business-page/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getBusinessPageQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Business Page platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/coupon - Create Coupon QR Code
 *
 * Digital coupons and promotional vouchers
 * Perfect for discounts, special offers, and loyalty rewards
 *
 * @route POST /qr/coupon
 * @param {string} couponCode - Unique coupon code (required)
 * @param {string} title - Coupon title (required)
 * @param {string} [description] - Coupon description
 * @param {string} [discountType] - Type: percentage, fixed, bogo, free-item, free-shipping
 * @param {number} [discountValue] - Discount value
 * @param {string} [currency=VND] - Currency code
 * @param {string} [validFrom] - Start date (ISO format)
 * @param {string} [validUntil] - Expiry date (ISO format)
 * @param {number} [minimumPurchase] - Minimum purchase amount
 * @param {number} [maxUses] - Maximum uses
 * @param {string|Array} [terms] - Terms and conditions
 * @param {string} [redemptionUrl] - Redemption URL
 * @param {string} [businessName] - Business name
 * @param {string} [qrTitle] - QR title (optional)
 *
 * @returns {Object} Coupon QR data with QR image
 */
router.post('/coupon', async (req, res) => {
  try {
    const schema = Joi.object({
      couponCode: Joi.string().min(3).max(50).required(),
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(1000).optional(),
      discountType: Joi.string()
        .valid('percentage', 'fixed', 'bogo', 'free-item', 'free-shipping')
        .optional(),
      discountValue: Joi.number().optional(),
      currency: Joi.string().length(3).default('VND'),
      validFrom: Joi.date().iso().optional(),
      validUntil: Joi.date().iso().optional(),
      minimumPurchase: Joi.number().min(0).optional(),
      maxUses: Joi.number().integer().min(1).max(1000000).optional(),
      terms: Joi.alternatives()
        .try(
          Joi.string().max(2000),
          Joi.array().items(Joi.string().max(500))
        )
        .optional(),
      redemptionUrl: Joi.string().uri().optional(),
      businessName: Joi.string().max(200).optional(),
      qrTitle: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const couponData = generateCouponQRData({
      couponCode: value.couponCode,
      title: value.title,
      description: value.description,
      discountType: value.discountType,
      discountValue: value.discountValue,
      currency: value.currency,
      validFrom: value.validFrom,
      validUntil: value.validUntil,
      minimumPurchase: value.minimumPurchase,
      maxUses: value.maxUses,
      terms: value.terms,
      redemptionUrl: value.redemptionUrl,
      businessName: value.businessName
    });

    const qrImage = await generateQRCode(couponData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'coupon',
        qr_string: couponData.url,
        qr_image: qrImage,
        metadata: {
          coupon: couponData.coupon,
          implementationPhase: couponData.implementationPhase,
          note: couponData.note
        },
        title: value.qrTitle || `Coupon - ${couponData.coupon.code}`
      }
    });

    console.log(`✅ Coupon QR created: ${couponData.coupon.code} - ${couponData.coupon.title}`);
  } catch (error) {
    console.error('Create Coupon QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Coupon QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/coupon/info - Get Coupon QR platform information
 *
 * @route GET /qr/coupon/info
 * @returns {Object} Coupon platform details
 */
router.get('/coupon/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getCouponQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Coupon platform info',
      message: error.message
    });
  }
});

/**
 * POST /qr/feedback-form - Create Feedback Form QR Code
 *
 * Customer feedback forms, reviews, and satisfaction surveys
 * Link to Google Forms, Typeform, or custom feedback forms
 *
 * @route POST /qr/feedback-form
 * @param {string} formTitle - Form title (required)
 * @param {string} [formDescription] - Form description
 * @param {string} [formUrl] - Direct link to existing form (Google Forms, Typeform, etc.)
 * @param {string} [submissionUrl] - Custom submission endpoint
 * @param {Array} [questions] - Array of question objects
 * @param {string} [businessName] - Business name
 * @param {string} [ratingType=stars] - Rating type: stars, numbers, emoji, thumbs
 * @param {boolean} [collectEmail=false] - Collect email
 * @param {boolean} [collectName=false] - Collect name
 * @param {string} [thankYouMessage] - Thank you message
 * @param {string} [qrTitle] - QR title (optional)
 *
 * @returns {Object} Feedback Form QR data with QR image
 */
router.post('/feedback-form', async (req, res) => {
  try {
    const schema = Joi.object({
      formTitle: Joi.string().min(2).max(200).required(),
      formDescription: Joi.string().max(1000).optional(),
      formUrl: Joi.string().uri().optional(),
      submissionUrl: Joi.string().uri().optional(),
      questions: Joi.array().max(20).items(
        Joi.object({
          question: Joi.string().max(500).required(),
          type: Joi.string()
            .valid('rating', 'text', 'textarea', 'multiple-choice', 'yes-no', 'scale')
            .default('text'),
          required: Joi.boolean().default(false),
          options: Joi.array().items(Joi.string()).optional(),
          min: Joi.number().integer().optional(),
          max: Joi.number().integer().optional(),
          minLabel: Joi.string().optional(),
          maxLabel: Joi.string().optional()
        })
      ).optional(),
      businessName: Joi.string().max(200).optional(),
      ratingType: Joi.string().valid('stars', 'numbers', 'emoji', 'thumbs').default('stars'),
      collectEmail: Joi.boolean().default(false),
      collectName: Joi.boolean().default(false),
      thankYouMessage: Joi.string().max(500).optional(),
      qrTitle: Joi.string().max(120).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const feedbackFormData = generateFeedbackFormQRData({
      formTitle: value.formTitle,
      formDescription: value.formDescription,
      formUrl: value.formUrl,
      submissionUrl: value.submissionUrl,
      questions: value.questions,
      businessName: value.businessName,
      ratingType: value.ratingType,
      collectEmail: value.collectEmail,
      collectName: value.collectName,
      thankYouMessage: value.thankYouMessage
    });

    const qrImage = await generateQRCode(feedbackFormData.url, {
      errorCorrectionLevel: 'M',
      width: 512
    });

    res.status(200).json({
      success: true,
      data: {
        type: 'feedback-form',
        qr_string: feedbackFormData.url,
        qr_image: qrImage,
        metadata: {
          form: feedbackFormData.form,
          submissionUrl: feedbackFormData.submissionUrl,
          implementationPhase: feedbackFormData.implementationPhase,
          note: feedbackFormData.note
        },
        title: value.qrTitle || `Feedback - ${feedbackFormData.form.title}`
      }
    });

    console.log(`✅ Feedback Form QR created: ${feedbackFormData.form.title}`);
  } catch (error) {
    console.error('Create Feedback Form QR error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to generate Feedback Form QR code',
      message: error.message
    });
  }
});

/**
 * GET /qr/feedback-form/info - Get Feedback Form QR platform information
 *
 * @route GET /qr/feedback-form/info
 * @returns {Object} Feedback Form platform details
 */
router.get('/feedback-form/info', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: getFeedbackFormQRPlatformInfo()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get Feedback Form platform info',
      message: error.message
    });
  }
});

module.exports = router;
