// Validators - Joi schemas for input validation
const Joi = require('joi');

// ============================================
// API Key Validation
// ============================================

const createApiKeySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  permissions: Joi.array()
    .items(
      Joi.string().valid(
        'read',
        'write',
        'admin',
        'qr:read',
        'qr:write',
        'analytics:read',
        'webhooks:read',
        'webhooks:write'
      )
    )
    .min(1)
    .default(['read']),
  rate_limit: Joi.number().integer().min(10).max(10000).default(100),
  expires_at: Joi.date().iso().greater('now').optional()
});

const updateApiKeySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  permissions: Joi.array()
    .items(
      Joi.string().valid(
        'read',
        'write',
        'admin',
        'qr:read',
        'qr:write',
        'analytics:read',
        'webhooks:read',
        'webhooks:write'
      )
    )
    .min(1)
    .optional(),
  rate_limit: Joi.number().integer().min(10).max(10000).optional(),
  is_active: Joi.boolean().optional(),
  expires_at: Joi.date().iso().greater('now').optional().allow(null)
}).min(1); // At least one field required

// ============================================
// Webhook Validation
// ============================================

const createWebhookSchema = Joi.object({
  url: Joi.string()
    .uri({ scheme: ['https'] }) // HTTPS only for security
    .required()
    .messages({
      'string.uri': 'Webhook URL must be a valid HTTPS URL',
      'any.required': 'Webhook URL is required'
    }),
  events: Joi.array()
    .items(
      Joi.string().valid(
        'scan',
        'qr.created',
        'qr.updated',
        'qr.deleted',
        'qr.expired',
        'limit.reached',
        'webhook.test'
      )
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one event type is required'
    }),
  retry_count: Joi.number().integer().min(0).max(5).default(3),
  timeout_ms: Joi.number().integer().min(1000).max(30000).default(5000)
});

const updateWebhookSchema = Joi.object({
  url: Joi.string().uri({ scheme: ['https'] }).optional(),
  events: Joi.array()
    .items(
      Joi.string().valid(
        'scan',
        'qr.created',
        'qr.updated',
        'qr.deleted',
        'qr.expired',
        'limit.reached',
        'webhook.test'
      )
    )
    .min(1)
    .optional(),
  is_active: Joi.boolean().optional(),
  retry_count: Joi.number().integer().min(0).max(5).optional(),
  timeout_ms: Joi.number().integer().min(1000).max(30000).optional()
}).min(1);

// ============================================
// Query Parameter Validation
// ============================================

const usageQuerySchema = Joi.object({
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

const deliveriesQuerySchema = Joi.object({
  event_type: Joi.string().optional(),
  succeeded: Joi.boolean().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

// ============================================
// UUID Validation
// ============================================

const uuidSchema = Joi.string().uuid({ version: 'uuidv4' }).required();

// ============================================
// Validation Middleware Generator
// ============================================

/**
 * Create validation middleware for request body
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.body = value; // Use validated/sanitized value
    next();
  };
}

/**
 * Create validation middleware for query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: errors
      });
    }
    
    req.query = value;
    next();
  };
}

/**
 * Create validation middleware for URL parameters
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Invalid URL parameters',
        details: errors
      });
    }
    
    req.params = value;
    next();
  };
}

/**
 * Validate UUID parameter
 */
function validateUUID(paramName) {
  return validateParams(Joi.object({
    [paramName]: uuidSchema
  }));
}

// ============================================
// Custom Validators
// ============================================

/**
 * Validate webhook URL is reachable
 */
async function validateWebhookUrl(url) {
  try {
    const axios = require('axios');
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: null
    });
    
    // Accept any response (endpoint exists)
    return response.status < 500;
  } catch (error) {
    return false;
  }
}

/**
 * Validate API key format
 */
function validateApiKeyFormat(apiKey) {
  const regex = /^qrp_(live|test|dev)_[a-zA-Z0-9]{32}$/;
  return regex.test(apiKey);
}

module.exports = {
  // Schemas
  createApiKeySchema,
  updateApiKeySchema,
  createWebhookSchema,
  updateWebhookSchema,
  usageQuerySchema,
  deliveriesQuerySchema,
  uuidSchema,
  
  // Middleware
  validateBody,
  validateQuery,
  validateParams,
  validateUUID,
  
  // Custom validators
  validateWebhookUrl,
  validateApiKeyFormat
};
