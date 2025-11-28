const Joi = require('joi');
const validator = require('validator');

/**
 * Validation schemas using Joi
 */

// User registration validation
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': 'Email non valida',
      'any.required': 'Email obbligatoria',
      'string.max': 'Email troppo lunga (max 255 caratteri)'
    }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password deve essere almeno 8 caratteri',
      'string.max': 'Password troppo lunga (max 100 caratteri)',
      'string.pattern.base': 'Password deve contenere almeno una lettera maiuscola, una minuscola e un numero',
      'any.required': 'Password obbligatoria'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Nome troppo corto (min 2 caratteri)',
      'string.max': 'Nome troppo lungo (max 100 caratteri)'
    })
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email non valida',
      'any.required': 'Email obbligatoria'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password obbligatoria'
    })
});

// Password reset request validation
const resetRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email non valida',
      'any.required': 'Email obbligatoria'
    })
});

// Password reset validation
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Token obbligatorio'
    }),
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password deve essere almeno 8 caratteri',
      'string.max': 'Password troppo lunga (max 100 caratteri)',
      'string.pattern.base': 'Password deve contenere almeno una lettera maiuscola, una minuscola e un numero',
      'any.required': 'Nuova password obbligatoria'
    })
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token obbligatorio'
    })
});

/**
 * Validate data against schema
 * @param {Object} data - Data to validate
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Object} Validation result { error, value }
 */
function validate(data, schema) {
  return schema.validate(data, {
    abortEarly: false, // Return all errors
    stripUnknown: true // Remove unknown fields
  });
}

/**
 * Sanitize email (lowercase, trim)
 * @param {String} email - Email to sanitize
 * @returns {String} Sanitized email
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return validator.normalizeEmail(email.trim().toLowerCase());
}

/**
 * Check password strength
 * @param {String} password - Password to check
 * @returns {Object} { score: 0-4, feedback: String }
 */
function checkPasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score <= 2) feedback.push('Password debole');
  if (score === 3) feedback.push('Password media');
  if (score >= 4) feedback.push('Password forte');

  return {
    score: Math.min(score, 4),
    feedback: feedback.join(', ')
  };
}

module.exports = {
  registerSchema,
  loginSchema,
  resetRequestSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  validate,
  sanitizeEmail,
  checkPasswordStrength
};
