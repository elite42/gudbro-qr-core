/**
 * @gudbro/content-templates
 * QR Code content templates for various use cases
 */

// Import all templates
// Essential (5 new)
import { urlTemplate } from './templates/url.js';
import { vcardTemplate } from './templates/vcard.js';
import { wifiTemplate } from './templates/wifi.js';
import { smsTemplate } from './templates/sms.js';
import { eventTemplate } from './templates/event.js';

// Original templates
import { emailTemplate } from './templates/email.js';
import { phoneTemplate } from './templates/phone.js';
import { whatsappTemplate } from './templates/whatsapp.js';
import { geoTemplate } from './templates/geo.js';
import { socialTemplate } from './templates/social.js';
import { videoTemplate } from './templates/video.js';
import { appstoreTemplate } from './templates/appstore.js';
import { paymentTemplate } from './templates/payment.js';
import { reviewTemplate } from './templates/review.js';

// TIER 1: Must Have
import { textTemplate } from './templates/text.js';
import { pdfTemplate } from './templates/pdf.js';
import { linkinbioTemplate } from './templates/linkinbio.js';
import { audioTemplate } from './templates/audio.js';

// TIER 2: Important
import { fileTemplate } from './templates/file.js';
import { galleryTemplate } from './templates/gallery.js';
import { googleformTemplate } from './templates/googleform.js';
import { menuTemplate } from './templates/menu.js';
import { couponTemplate } from './templates/coupon.js';
import { mecardTemplate } from './templates/mecard.js';

// TIER 3: Advanced
import { bitcoinTemplate } from './templates/bitcoin.js';
import { wazeTemplate } from './templates/waze.js';
import { feedbackTemplate } from './templates/feedback.js';
import { landingpageTemplate } from './templates/landingpage.js';
import { multiurlTemplate } from './templates/multiurl.js';
import { gs1Template } from './templates/gs1.js';

// Export all templates
export const templates = {
  // Essential (5 new)
  url: urlTemplate,
  vcard: vcardTemplate,
  wifi: wifiTemplate,
  sms: smsTemplate,
  event: eventTemplate,
  
  // Original
  email: emailTemplate,
  phone: phoneTemplate,
  whatsapp: whatsappTemplate,
  geo: geoTemplate,
  social: socialTemplate,
  video: videoTemplate,
  appstore: appstoreTemplate,
  payment: paymentTemplate,
  review: reviewTemplate,
  
  // TIER 1
  text: textTemplate,
  pdf: pdfTemplate,
  linkinbio: linkinbioTemplate,
  audio: audioTemplate,
  
  // TIER 2
  file: fileTemplate,
  gallery: galleryTemplate,
  googleform: googleformTemplate,
  menu: menuTemplate,
  coupon: couponTemplate,
  mecard: mecardTemplate,
  
  // TIER 3
  bitcoin: bitcoinTemplate,
  waze: wazeTemplate,
  feedback: feedbackTemplate,
  landingpage: landingpageTemplate,
  multiurl: multiurlTemplate,
  gs1: gs1Template
};

// Export individual templates
export {
  // Essential (5 new)
  urlTemplate,
  vcardTemplate,
  wifiTemplate,
  smsTemplate,
  eventTemplate,
  
  // Original
  emailTemplate,
  phoneTemplate,
  whatsappTemplate,
  geoTemplate,
  socialTemplate,
  videoTemplate,
  appstoreTemplate,
  paymentTemplate,
  reviewTemplate,
  
  // TIER 1
  textTemplate,
  pdfTemplate,
  linkinbioTemplate,
  audioTemplate,
  
  // TIER 2
  fileTemplate,
  galleryTemplate,
  googleformTemplate,
  menuTemplate,
  couponTemplate,
  mecardTemplate,
  
  // TIER 3
  bitcoinTemplate,
  wazeTemplate,
  feedbackTemplate,
  landingpageTemplate,
  multiurlTemplate,
  gs1Template
};

/**
 * Get template by type
 * @param {string} type - Template type
 * @returns {object} Template object
 */
export function getTemplate(type) {
  const template = templates[type];
  if (!template) {
    throw new Error(`Template "${type}" not found`);
  }
  return template;
}

/**
 * Get all template types
 * @returns {Array} Array of template types
 */
export function getTemplateTypes() {
  return Object.keys(templates);
}

/**
 * Validate template data
 * @param {string} type - Template type
 * @param {object} data - Data to validate
 * @returns {object} Validation result { valid: boolean, errors: Array }
 */
export function validateTemplate(type, data) {
  const template = getTemplate(type);
  const errors = [];

  template.fields.forEach(field => {
    const value = data[field.name];

    // Check required fields
    if (field.required && (!value || value === '')) {
      errors.push(`${field.label} is required`);
      return;
    }

    // Run custom validation if provided
    if (value && field.validation && !field.validation(value)) {
      errors.push(`${field.label} is invalid`);
    }

    // Check maxLength
    if (value && field.maxLength && value.length > field.maxLength) {
      errors.push(`${field.label} exceeds maximum length of ${field.maxLength}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate QR data from template
 * @param {string} type - Template type
 * @param {object} data - Template data
 * @returns {string} Generated QR data (URL, mailto, tel, etc)
 */
export function generateQRData(type, data) {
  const template = getTemplate(type);
  
  // Validate data first
  const validation = validateTemplate(type, data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Generate QR data
  return template.generate(data);
}

// Default export
export default {
  templates,
  getTemplate,
  getTemplateTypes,
  validateTemplate,
  generateQRData
};

