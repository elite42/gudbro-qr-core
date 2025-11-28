/**
 * Usage examples for @gudbro/content-templates
 */

import { generateQRData, validateTemplate, getTemplateTypes, templates } from '../src/index.js';

console.log('=== @gudbro/content-templates Examples ===\n');

// 1. Get all available template types
console.log('1. Available Templates:');
const types = getTemplateTypes();
console.log(types);
console.log('');

// 2. Email QR Code
console.log('2. Email QR Code:');
const emailQR = generateQRData('email', {
  email: 'hello@gudbro.com',
  subject: 'Contact from QR Code',
  body: 'Hi! I scanned your QR code and would like to get in touch.'
});
console.log(emailQR);
console.log('');

// 3. WhatsApp QR Code
console.log('3. WhatsApp QR Code:');
const whatsappQR = generateQRData('whatsapp', {
  phone: '+39 123 456 7890',
  message: 'Ciao! Ho scansionato il tuo QR code.'
});
console.log(whatsappQR);
console.log('');

// 4. Social Media QR Code
console.log('4. Instagram QR Code:');
const socialQR = generateQRData('social', {
  platform: 'instagram',
  username: '@gudbro'
});
console.log(socialQR);
console.log('');

// 5. Geolocation QR Code
console.log('5. Geolocation QR Code (Colosseo):');
const geoQR = generateQRData('geo', {
  latitude: '41.9028',
  longitude: '12.4964',
  label: 'Colosseo, Roma, Italia'
});
console.log(geoQR);
console.log('');

// 6. Video QR Code
console.log('6. YouTube Video QR Code:');
const videoQR = generateQRData('video', {
  platform: 'youtube',
  videoId: 'dQw4w9WgXcQ'
});
console.log(videoQR);
console.log('');

// 7. Payment QR Code
console.log('7. PayPal Payment QR Code:');
const paymentQR = generateQRData('payment', {
  provider: 'paypal',
  paymentId: 'yourpaypalme',
  amount: '10.00',
  currency: 'EUR'
});
console.log(paymentQR);
console.log('');

// 8. Validation Example
console.log('8. Validation Example:');
const validation = validateTemplate('email', {
  email: 'invalid-email', // Invalid email
  subject: 'Test'
});
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
console.log('');

// 9. Get Template Fields
console.log('9. Email Template Fields:');
const emailTemplate = templates.email;
console.log('Fields:', emailTemplate.fields.map(f => ({
  name: f.name,
  label: f.label,
  type: f.type,
  required: f.required
})));
console.log('');

// 10. Error Handling
console.log('10. Error Handling:');
try {
  generateQRData('email', {
    // Missing required email field
    subject: 'Test'
  });
} catch (error) {
  console.log('Error caught:', error.message);
}

