# Module 7: Content Templates

> **Version:** 1.0.0  
> **Status:** Production Ready  
> **Last Updated:** 2025-10-29

QR Code content templates for various use cases: Email, Phone, WhatsApp, Social Media, Videos, Payments, Reviews, and more.

---

## 🎯 Features

✅ **25 Template Types** organized in 3 tiers:

### Original Templates (9)
- 📧 **Email** - mailto: links with subject and body
- 📞 **Phone** - tel: links for direct calling
- 💬 **WhatsApp** - wa.me links with pre-filled messages
- 📍 **Geolocation** - Google Maps coordinates
- 👥 **Social Media** - Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube
- 🎥 **Video** - YouTube, Vimeo links
- 📱 **App Download** - App Store, Play Store links
- 💳 **Payment** - PayPal, Stripe payment links
- ⭐ **Review** - Google, Yelp, Trustpilot, TripAdvisor

### TIER 1: Must Have (4)
- 📝 **Text** - Plain text (works offline)
- 📄 **PDF** - PDF document upload
- 🔗 **Link in Bio** - Social media link aggregator (Linktree-style)
- 🎵 **Audio** - MP3, Spotify, Apple Music, SoundCloud

### TIER 2: Important (6)
- 📁 **File** - Any file type (PDF, images, videos, documents)
- 🖼️ **Image Gallery** - Multiple images in one QR
- 📋 **Google Form** - Survey and feedback forms
- 🍽️ **Restaurant Menu** - Digital menu for restaurants
- 🎟️ **Coupon** - Discount codes and offers
- 👤 **MECARD** - Lightweight business card (alternative to vCard)

### TIER 3: Advanced (6)
- ₿ **Bitcoin/Crypto** - Cryptocurrency wallet addresses
- 🗺️ **Waze** - Waze navigation (alternative to Google Maps)
- ⭐ **Feedback** - Customer feedback and rating forms
- 📄 **Landing Page** - Custom landing pages with UTM tracking
- 🔀 **Multi URL** - Conditional redirects (device, language, location)
- 📦 **GS1 Digital Link** - Product identification for supply chain (B2B/Enterprise)

✅ **Validation** - Built-in validation for all template fields  
✅ **Type-safe** - Full TypeScript support (coming soon)  
✅ **Extensible** - Easy to add custom templates  
✅ **Zero dependencies** - Lightweight and fast

---

## 📦 Installation

```bash
npm install @gudbro/content-templates
# or
pnpm add @gudbro/content-templates
```

---

## 🚀 Quick Start

```javascript
import { generateQRData, templates } from '@gudbro/content-templates';

// Generate email QR code
const emailQR = generateQRData('email', {
  email: 'hello@gudbro.com',
  subject: 'Contact from QR Code',
  body: 'Hi! I scanned your QR code.'
});
// Result: "mailto:hello@gudbro.com?subject=Contact%20from%20QR%20Code&body=Hi!%20I%20scanned%20your%20QR%20code."

// Generate WhatsApp QR code
const whatsappQR = generateQRData('whatsapp', {
  phone: '+39 123 456 7890',
  message: 'Ciao! Ho scansionato il tuo QR code.'
});
// Result: "https://wa.me/39123456789?text=Ciao!%20Ho%20scansionato%20il%20tuo%20QR%20code."

// Generate social media QR code
const socialQR = generateQRData('social', {
  platform: 'instagram',
  username: '@gudbro'
});
// Result: "https://instagram.com/gudbro"
```

---

## 📖 API Reference

### `generateQRData(type, data)`

Generate QR code data from template.

**Parameters:**
- `type` (string) - Template type (email, phone, whatsapp, etc)
- `data` (object) - Template data

**Returns:** (string) Generated QR data

**Example:**
```javascript
const qrData = generateQRData('email', {
  email: 'test@example.com',
  subject: 'Hello'
});
```

---

### `validateTemplate(type, data)`

Validate template data.

**Parameters:**
- `type` (string) - Template type
- `data` (object) - Data to validate

**Returns:** (object) `{ valid: boolean, errors: Array }`

**Example:**
```javascript
const validation = validateTemplate('email', {
  email: 'invalid-email'
});
// { valid: false, errors: ['Email address is invalid'] }
```

---

### `getTemplate(type)`

Get template object by type.

**Parameters:**
- `type` (string) - Template type

**Returns:** (object) Template object

**Example:**
```javascript
const emailTemplate = getTemplate('email');
console.log(emailTemplate.fields); // Array of field definitions
```

---

### `getTemplateTypes()`

Get all available template types.

**Returns:** (Array) Array of template type strings

**Example:**
```javascript
const types = getTemplateTypes();
// ['email', 'phone', 'whatsapp', 'geo', 'social', 'video', 'appstore', 'payment', 'review']
```

---

## 📋 Template Reference

### Email Template

```javascript
generateQRData('email', {
  email: 'contact@example.com',
  subject: 'Hello!',           // optional
  body: 'Your message here...' // optional
});
```

### Phone Template

```javascript
generateQRData('phone', {
  phone: '+39 123 456 7890'
});
```

### WhatsApp Template

```javascript
generateQRData('whatsapp', {
  phone: '+39 123 456 7890',
  message: 'Hi! I scanned your QR code.' // optional
});
```

### Geolocation Template

```javascript
generateQRData('geo', {
  latitude: '41.9028',
  longitude: '12.4964',
  label: 'Colosseo, Roma' // optional
});
```

### Social Media Template

```javascript
generateQRData('social', {
  platform: 'instagram', // instagram, facebook, twitter, linkedin, tiktok, youtube, snapchat, pinterest
  username: '@yourhandle'
});
```

### Video Template

```javascript
generateQRData('video', {
  platform: 'youtube', // youtube, vimeo, custom
  videoId: 'dQw4w9WgXcQ'
});
```

### App Store Template

```javascript
generateQRData('appstore', {
  store: 'android', // ios, android
  appId: 'com.whatsapp'
});
```

### Payment Template

```javascript
generateQRData('payment', {
  provider: 'paypal', // paypal, stripe, custom
  paymentId: 'yourpaypalme',
  amount: '10.00',    // optional
  currency: 'EUR',    // optional
  description: 'Product purchase' // optional
});
```

### Review Template

```javascript
generateQRData('review', {
  platform: 'google', // google, yelp, trustpilot, tripadvisor
  businessId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
});
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📄 License

MIT © GUDBRO

