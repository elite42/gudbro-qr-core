/**
 * Input Validators
 * Joi schemas for request validation
 */

const Joi = require('joi');

/**
 * Design object schema
 */
const designSchema = Joi.object({
  foreground: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  background: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  pattern: Joi.string().valid('dots', 'squares', 'rounded').default('squares'),
  eyeStyle: Joi.string().valid('square', 'rounded', 'dot').default('square'),
  errorCorrectionLevel: Joi.string().valid('L', 'M', 'Q', 'H').default('M'),
  margin: Joi.number().min(0).max(10).default(4),
  width: Joi.number().min(100).max(2000).default(1000),
  logo: Joi.string().allow(null).default(null)
});

/**
 * Bulk upload options schema
 */
const bulkUploadSchema = Joi.object({
  type: Joi.string().valid('static', 'dynamic').default('static'),
  design: designSchema.optional(),
  batchSize: Joi.number().min(10).max(500).default(100),
  folder: Joi.string().max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

/**
 * Direct bulk QR code item schema
 */
const qrCodeItemSchema = Joi.object({
  destination_url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  title: Joi.string().max(255).optional(),
  folder: Joi.string().max(100).optional(),
  description: Joi.string().max(1000).optional()
});

/**
 * Direct bulk request schema
 */
const directBulkSchema = Joi.object({
  qr_codes: Joi.array().items(qrCodeItemSchema).min(1).max(10000).required(),
  options: bulkUploadSchema.optional()
});

/**
 * Job query filters schema
 */
const jobFiltersSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  status: Joi.string().valid('queued', 'processing', 'completed', 'failed', 'cancelled').optional()
});

/**
 * Validate bulk upload options
 * @param {Object} data - Options to validate
 * @returns {Object} Validation result
 */
function validateBulkUpload(data) {
  return bulkUploadSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Validate direct bulk request
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result
 */
function validateDirectBulk(data) {
  return directBulkSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Validate job filters
 * @param {Object} data - Filters to validate
 * @returns {Object} Validation result
 */
function validateJobFilters(data) {
  return jobFiltersSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Validate single QR code data
 * @param {Object} data - QR code data
 * @returns {Object} Validation result
 */
function validateQRCode(data) {
  return qrCodeItemSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
}

/**
 * Custom validator: Check URL accessibility (optional, expensive)
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if accessible
 */
async function validateURLAccessibility(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize CSV data to prevent injection
 * @param {string} value - Value to sanitize
 * @returns {string} Sanitized value
 */
function sanitizeCSVValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potential CSV injection characters
  const dangerous = ['=', '+', '-', '@', '\t', '\r'];
  
  if (dangerous.some(char => value.startsWith(char))) {
    return "'" + value; // Prefix with single quote
  }
  
  return value;
}

/**
 * Validate file upload
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
function validateFileUpload(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file uploaded');
    return { valid: false, errors };
  }
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check file extension
  const allowedExtensions = ['.csv', '.txt'];
  const fileExt = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExt)) {
    errors.push(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
  }
  
  // Check MIME type
  const allowedMimeTypes = ['text/csv', 'text/plain', 'application/csv'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push('Invalid file MIME type');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateBulkUpload,
  validateDirectBulk,
  validateJobFilters,
  validateQRCode,
  validateURLAccessibility,
  sanitizeCSVValue,
  validateFileUpload,
  // Export schemas for direct use if needed
  schemas: {
    designSchema,
    bulkUploadSchema,
    qrCodeItemSchema,
    directBulkSchema,
    jobFiltersSchema
  }
};
