const Joi = require('joi');

/**
 * Design schema validation
 */
const designSchema = Joi.object({
  foreground: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#000000')
    .messages({
      'string.pattern.base': 'Foreground must be a valid hex color (e.g., #000000)'
    }),
  
  background: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#FFFFFF')
    .messages({
      'string.pattern.base': 'Background must be a valid hex color (e.g., #FFFFFF)'
    }),
  
  pattern: Joi.string()
    .valid('dots', 'squares', 'rounded')
    .default('squares'),
  
  eyeStyle: Joi.string()
    .valid('square', 'rounded', 'dot')
    .default('square'),
  
  errorCorrectionLevel: Joi.string()
    .valid('L', 'M', 'Q', 'H')
    .default('M')
    .messages({
      'any.only': 'Error correction level must be L, M, Q, or H'
    }),
  
  margin: Joi.number()
    .integer()
    .min(0)
    .max(10)
    .default(4),
  
  width: Joi.number()
    .integer()
    .min(200)
    .max(2000)
    .default(1000),
  
  logo: Joi.string()
    .allow(null)
    .optional()
});

/**
 * Template schema validation
 */
const templateSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Template name is required',
      'string.max': 'Template name must be less than 100 characters'
    }),
  
  design: designSchema.required(),
  
  isPublic: Joi.boolean()
    .default(false)
});

/**
 * Validate design object
 */
function validateDesign(design) {
  return designSchema.validate(design, { abortEarly: false });
}

/**
 * Validate template object
 */
function validateTemplate(template) {
  return templateSchema.validate(template, { abortEarly: false });
}

/**
 * Validate color contrast
 */
function validateColorContrast(foreground, background) {
  // Convert hex to RGB
  const fgRGB = hexToRGB(foreground);
  const bgRGB = hexToRGB(background);
  
  // Calculate relative luminance
  const fgLum = relativeLuminance(fgRGB);
  const bgLum = relativeLuminance(bgRGB);
  
  // Calculate contrast ratio
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const contrast = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: contrast,
    sufficient: contrast >= 4.5, // WCAG AA standard
    level: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'Fail'
  };
}

/**
 * Convert hex color to RGB
 */
function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

/**
 * Calculate relative luminance
 */
function relativeLuminance(rgb) {
  const { r, g, b } = rgb;
  
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

module.exports = {
  validateDesign,
  validateTemplate,
  validateColorContrast,
  designSchema,
  templateSchema
};
