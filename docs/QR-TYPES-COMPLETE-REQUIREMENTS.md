# QR Types - Complete Feature Parity Requirements

**Version:** 1.0  
**Date:** 2025-11-03  
**For:** QR Engine - Complete Market Coverage  
**Priority:** P1 (Required before AI QR Creator)

---

## Overview

Complete QR Engine feature parity with industry leaders (QR Tiger, Flowcode, Bitly). Implements 13 missing QR types across Asia-specific and universal categories.

**Implementation Order:**
1. **Asia Social** (Priority 0) - VietQR, Zalo, WeChat Pay, KakaoTalk, LINE
2. **Standard Types** (Priority 1) - App Store, PDF, Video, Audio, Multi-URL, Business Page, Coupon, Feedback

**Total Effort:** ~48 hours (6 days)

---

## PART 1: ASIA SOCIAL QR CODES

### 1. VietQR Payment QR Code ✅

**Status:** Fully documented in `QR-TYPES-ASIA-REQUIREMENTS.md` [Section 1]  
**Effort:** 8 hours  
**Priority:** P0

Reference existing documentation for:
- National payment standard (NAPAS infrastructure)
- Bank codes and validation
- VietQR.io API integration
- EMVCo format specification

---

### 2. Zalo Social QR Code ✅

**Status:** Fully documented in `QR-TYPES-ASIA-REQUIREMENTS.md` [Section 2]  
**Effort:** 4 hours  
**Priority:** P0

Reference existing documentation for:
- Vietnam's #1 messaging app (74M users)
- Phone number and Zalo ID formats
- Deep link structure
- Message pre-fill support

---

### 3. WeChat Pay QR Code ✅

**Status:** Fully documented in `QR-TYPES-ASIA-REQUIREMENTS.md` [Section 3]  
**Effort:** 6 hours  
**Priority:** P1

Reference existing documentation for:
- Chinese tourist payment method
- Merchant ID integration
- Static vs dynamic QR approach
- Currency handling (CNY/VND)

---

### 4. KakaoTalk QR Code 🇰🇷

#### Purpose
KakaoTalk is South Korea's dominant messaging app (95% market penetration, 47M users). Critical for Korean tourists visiting Vietnam (40% of international arrivals in Da Nang) and Korean-Vietnamese business connections.

#### Market Context
- 95% of South Koreans use KakaoTalk
- Primary communication for Korean tourists
- Vietnam-Korea tourism: 3.5M visitors/year (pre-pandemic)
- Korean restaurants, cafes, cosmetics shops in Vietnam need this

#### API Endpoint
```
POST /qr/kakaotalk
```

#### Request Parameters

```typescript
interface KakaoTalkQRPayload {
  // Identifier (one required)
  phoneNumber?: string;       // Phone with country code (+82)
  kakaoId?: string;          // KakaoTalk ID (if known)
  
  // Plus Friend (business account)
  plusFriendId?: string;     // @businessname format
  
  // Metadata
  displayName?: string;      // Display name
  message?: string;          // Pre-filled message
  
  // Standard QR options
  title?: string;
  description?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Personal chat:**
```
https://open.kakao.com/o/[CHAT_ID]
kakaotalk://open/friend?id=[PHONE_OR_ID]
```

**Plus Friend (Business):**
```
https://pf.kakao.com/[PLUS_FRIEND_ID]
kakaotalk://plusfriend/friend/@[PLUS_FRIEND_ID]
```

**With message:**
```
https://open.kakao.com/o/[CHAT_ID]?msg=[ENCODED_MESSAGE]
```

**Examples:**
```
kakaotalk://open/friend?id=82-10-1234-5678
https://pf.kakao.com/@gudbrovietnam
kakaotalk://plusfriend/friend/@gudbrovietnam
```

#### Validation Rules

```javascript
// Korean phone number validation
const validateKoreanPhone = (phone) => {
  // Remove spaces, dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Formats: +82-10-xxxx-xxxx or 010-xxxx-xxxx
  if (!/^(\+?82)?0?10\d{8}$/.test(cleaned)) {
    throw new Error('Invalid Korean phone number');
  }
  
  // Normalize to international format
  return cleaned.replace(/^0/, '82');
};

// KakaoTalk ID validation
const validateKakaoId = (id) => {
  // Alphanumeric, underscore, 4-20 chars
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(id)) {
    throw new Error('Invalid KakaoTalk ID format');
  }
  return id;
};

// Plus Friend ID validation
const validatePlusFriendId = (id) => {
  // Must start with @, alphanumeric + underscore, 3-30 chars
  if (!/^@[a-zA-Z0-9_]{3,30}$/.test(id)) {
    throw new Error('Invalid Plus Friend ID (must start with @)');
  }
  return id;
};

// Message validation
if (message && message.length > 500) {
  throw new Error('Message max 500 characters');
}
```

#### Implementation

```javascript
const generateKakaoTalkQR = ({ phoneNumber, kakaoId, plusFriendId, message }) => {
  let url;
  
  // Priority: Plus Friend > KakaoId > Phone
  if (plusFriendId) {
    const validated = validatePlusFriendId(plusFriendId);
    url = `https://pf.kakao.com/${validated}`;
  } else if (kakaoId) {
    const validated = validateKakaoId(kakaoId);
    url = `kakaotalk://open/friend?id=${validated}`;
  } else if (phoneNumber) {
    const validated = validateKoreanPhone(phoneNumber);
    url = `kakaotalk://open/friend?id=${validated}`;
  } else {
    throw new Error('Phone number, KakaoTalk ID, or Plus Friend ID required');
  }
  
  if (message && !plusFriendId) {
    const encoded = encodeURIComponent(message);
    url += `${url.includes('?') ? '&' : '?'}msg=${encoded}`;
  }
  
  return url;
};
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "kakaotalk",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://pf.kakao.com/@gudbrovietnam",
    "metadata": {
      "plusFriendId": "@gudbrovietnam",
      "displayName": "Gudbro Vietnam",
      "accountType": "business"
    }
  }
}
```

#### Testing Checklist

- [ ] Valid Korean phone generates QR
- [ ] Phone validation rejects invalid formats
- [ ] International format (+82) handled
- [ ] Local format (010-) converted
- [ ] KakaoTalk ID validation works
- [ ] Plus Friend ID validated (@ prefix)
- [ ] Message parameter optional
- [ ] Korean characters in message work
- [ ] QR scans and opens KakaoTalk:
  - [ ] iOS
  - [ ] Android
- [ ] Deep link vs web link fallback
- [ ] Business account (Plus Friend) works

#### Acceptance Criteria

- [ ] POST /qr/kakaotalk endpoint created
- [ ] Phone number validation (Korean format)
- [ ] KakaoTalk ID support
- [ ] Plus Friend (business) support
- [ ] Message pre-fill optional
- [ ] QR opens KakaoTalk app
- [ ] Error messages clear
- [ ] Unit tests (10+ tests)
- [ ] Real device testing (iOS + Android)

**Effort:** 2-3 hours

---

### 5. LINE QR Code 🇹🇭

#### Purpose
LINE is the dominant messaging app in Thailand (49M users), Taiwan (21M), and Japan (95M). Critical for Thai and Taiwanese tourists visiting Vietnam and cross-border F&B businesses.

#### Market Context
- Thailand: 75% of population uses LINE
- Taiwan: 90% market penetration
- Vietnam-Thailand tourism: 800K visitors/year
- Thai restaurants, massage parlors, hotels need this

#### API Endpoint
```
POST /qr/line
```

#### Request Parameters

```typescript
interface LINEQRPayload {
  // Identifier (one required)
  lineId?: string;           // LINE ID (if known)
  phoneNumber?: string;      // Phone with country code
  
  // Official Account (business)
  officialAccountId?: string; // @businessname format
  
  // Metadata
  displayName?: string;      // Display name
  message?: string;          // Pre-filled message
  
  // Standard QR options
  title?: string;
  description?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Add friend:**
```
https://line.me/ti/p/[LINE_ID]
https://line.me/R/ti/p/[LINE_ID]
line://ti/p/[LINE_ID]
```

**Official Account:**
```
https://line.me/R/ti/p/@[OFFICIAL_ID]
line://ti/p/@[OFFICIAL_ID]
```

**With message:**
```
https://line.me/ti/p/[LINE_ID]?msg=[ENCODED_MESSAGE]
```

**Examples:**
```
https://line.me/ti/p/~john.doe
https://line.me/R/ti/p/@gudbrovietnam
line://ti/p/@gudbrovietnam
```

#### Validation Rules

```javascript
// LINE ID validation
const validateLineId = (id) => {
  // Alphanumeric, period, underscore, 4-20 chars
  if (!/^[a-zA-Z0-9._]{4,20}$/.test(id)) {
    throw new Error('Invalid LINE ID format');
  }
  return id;
};

// Official Account ID validation
const validateOfficialAccount = (id) => {
  // Must start with @, alphanumeric + underscore, 3-20 chars
  if (!/^@[a-zA-Z0-9_]{3,20}$/.test(id)) {
    throw new Error('Invalid Official Account ID (must start with @)');
  }
  return id;
};

// Phone validation (Thailand, Taiwan, Japan)
const validateLinePhone = (phone) => {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Thailand: +66, Taiwan: +886, Japan: +81
  if (!/^(\+?(66|886|81))\d{8,10}$/.test(cleaned)) {
    throw new Error('Invalid phone number (Thailand/Taiwan/Japan)');
  }
  
  return cleaned;
};

// Message validation
if (message && message.length > 500) {
  throw new Error('Message max 500 characters');
}
```

#### Implementation

```javascript
const generateLINEQR = ({ lineId, phoneNumber, officialAccountId, message }) => {
  let identifier;
  let isOfficial = false;
  
  // Priority: Official Account > LINE ID > Phone
  if (officialAccountId) {
    identifier = validateOfficialAccount(officialAccountId);
    isOfficial = true;
  } else if (lineId) {
    identifier = validateLineId(lineId);
  } else if (phoneNumber) {
    identifier = validateLinePhone(phoneNumber);
  } else {
    throw new Error('LINE ID, phone number, or Official Account ID required');
  }
  
  // Use web format for better compatibility
  let url = isOfficial 
    ? `https://line.me/R/ti/p/${identifier}`
    : `https://line.me/ti/p/~${identifier}`;
  
  if (message) {
    const encoded = encodeURIComponent(message);
    url += `?msg=${encoded}`;
  }
  
  return url;
};
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "line",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://line.me/R/ti/p/@gudbrovietnam",
    "metadata": {
      "officialAccountId": "@gudbrovietnam",
      "displayName": "Gudbro Vietnam",
      "accountType": "official"
    }
  }
}
```

#### Testing Checklist

- [ ] Valid LINE ID generates QR
- [ ] LINE ID validation works
- [ ] Official Account ID validated
- [ ] Phone validation (TH/TW/JP)
- [ ] Message parameter optional
- [ ] Thai/Chinese characters in message work
- [ ] QR scans and opens LINE:
  - [ ] iOS
  - [ ] Android
- [ ] Deep link fallback works
- [ ] Official Account redirects correctly

#### Acceptance Criteria

- [ ] POST /qr/line endpoint created
- [ ] LINE ID validation
- [ ] Official Account support
- [ ] Phone number validation (3 countries)
- [ ] Message pre-fill optional
- [ ] QR opens LINE app
- [ ] Error messages clear
- [ ] Unit tests (10+ tests)
- [ ] Real device testing

**Effort:** 2-3 hours

---

## PART 2: STANDARD QR TYPES

### 6. App Store QR Code

#### Purpose
Direct users to download mobile apps from Apple App Store or Google Play Store. Critical for restaurants with ordering apps, loyalty programs, or custom F&B solutions.

#### Market Context
- Essential for app-based loyalty programs
- Restaurant ordering apps (especially during COVID)
- QR codes in-store driving app installs
- Competitors: QR Tiger, Flowcode all support this

#### API Endpoint
```
POST /qr/app-store
```

#### Request Parameters

```typescript
interface AppStoreQRPayload {
  // App identifiers (at least one required)
  appleAppId?: string;       // Apple App Store ID (numeric)
  appleAppUrl?: string;      // Full App Store URL
  googlePackageName?: string; // Android package name
  googleAppUrl?: string;     // Full Play Store URL
  
  // Smart routing
  platform?: 'ios' | 'android' | 'auto'; // Default: auto
  fallbackUrl?: string;      // Desktop fallback URL
  
  // Metadata
  appName?: string;          // App display name
  appIcon?: string;          // App icon URL
  
  // Standard QR options
  title?: string;
  description?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Option A: Direct Store Links**
```
iOS: https://apps.apple.com/app/id[APP_ID]
Android: https://play.google.com/store/apps/details?id=[PACKAGE_NAME]
```

**Option B: Smart Router (Recommended)**
```
https://qr.gudbro.com/app/[QR_ID]

Backend detects user agent:
- iOS → App Store
- Android → Play Store
- Desktop → Fallback URL or landing page
```

**Option C: Universal Links (Advanced)**
```
https://[APP_DOMAIN]/[PATH]

Supports:
- Branch.io
- Firebase Dynamic Links
- AppsFlyer OneLink
```

#### Validation Rules

```javascript
// Apple App ID validation
const validateAppleAppId = (id) => {
  // Numeric, typically 9-10 digits
  if (!/^\d{9,10}$/.test(id)) {
    throw new Error('Invalid Apple App ID (must be 9-10 digits)');
  }
  return id;
};

// Google package name validation
const validateGooglePackageName = (packageName) => {
  // Format: com.company.app
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
    throw new Error('Invalid Android package name');
  }
  return packageName;
};

// URL validation
const validateAppStoreUrl = (url, platform) => {
  if (platform === 'ios' && !url.includes('apps.apple.com')) {
    throw new Error('Invalid App Store URL');
  }
  if (platform === 'android' && !url.includes('play.google.com')) {
    throw new Error('Invalid Play Store URL');
  }
  return url;
};

// At least one platform required
if (!appleAppId && !appleAppUrl && !googlePackageName && !googleAppUrl) {
  throw new Error('At least one app identifier required');
}
```

#### Implementation

```javascript
const generateAppStoreQR = async ({ 
  appleAppId, 
  appleAppUrl, 
  googlePackageName, 
  googleAppUrl,
  platform = 'auto',
  fallbackUrl,
  appName
}) => {
  // Build store URLs
  const iosUrl = appleAppUrl || (appleAppId 
    ? `https://apps.apple.com/app/id${appleAppId}`
    : null);
    
  const androidUrl = googleAppUrl || (googlePackageName
    ? `https://play.google.com/store/apps/details?id=${googlePackageName}`
    : null);
  
  let destinationUrl;
  
  if (platform === 'ios' && iosUrl) {
    destinationUrl = iosUrl;
  } else if (platform === 'android' && androidUrl) {
    destinationUrl = androidUrl;
  } else if (platform === 'auto') {
    // Create smart router URL
    const qrId = await createQRRecord({
      type: 'app-store',
      iosUrl,
      androidUrl,
      fallbackUrl,
      appName
    });
    destinationUrl = `https://qr.gudbro.com/app/${qrId}`;
  }
  
  return destinationUrl;
};

// Smart router endpoint
app.get('/app/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const userAgent = req.headers['user-agent'];
  
  const qrData = await getQRRecord(qrId);
  
  // Detect platform
  if (/iPhone|iPad|iPod/.test(userAgent) && qrData.iosUrl) {
    return res.redirect(qrData.iosUrl);
  }
  
  if (/Android/.test(userAgent) && qrData.androidUrl) {
    return res.redirect(qrData.androidUrl);
  }
  
  // Desktop fallback
  return res.redirect(qrData.fallbackUrl || qrData.iosUrl || qrData.androidUrl);
});
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "app-store",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/app/abc123",
    "metadata": {
      "platform": "auto",
      "appName": "Gudbro Restaurant",
      "iosUrl": "https://apps.apple.com/app/id123456789",
      "androidUrl": "https://play.google.com/store/apps/details?id=com.gudbro.restaurant",
      "fallbackUrl": "https://gudbro.com"
    }
  }
}
```

#### Testing Checklist

- [ ] iOS App ID generates correct URL
- [ ] Android package name generates correct URL
- [ ] Smart router detects iOS devices
- [ ] Smart router detects Android devices
- [ ] Desktop fallback works
- [ ] Invalid App ID rejected
- [ ] Invalid package name rejected
- [ ] QR scans and opens correct store:
  - [ ] iOS → App Store
  - [ ] Android → Play Store
  - [ ] Desktop → Fallback
- [ ] Analytics tracks platform splits
- [ ] Universal links supported (if provided)

#### Acceptance Criteria

- [ ] POST /qr/app-store endpoint created
- [ ] Both iOS and Android support
- [ ] Smart platform detection
- [ ] Fallback URL option
- [ ] Validation for all formats
- [ ] Analytics track platform
- [ ] Unit tests (12+ tests)
- [ ] Integration test with router
- [ ] Real device testing

**Effort:** 3 hours

---

### 7. PDF QR Code

#### Purpose
Link to PDF documents - menus, catalogs, brochures, manuals, reports. Critical for restaurants (digital menus), hotels (service guides), events (programs).

#### Market Context
- COVID accelerated PDF menus
- Reduces printing costs
- Easy updates without reprinting
- Competitors support but often charge premium

#### API Endpoint
```
POST /qr/pdf
```

#### Request Parameters

```typescript
interface PDFQRPayload {
  // PDF source (one required)
  pdfUrl?: string;           // Direct PDF URL
  pdfFile?: File;            // Upload PDF file
  
  // Display options
  viewMode?: 'download' | 'inline' | 'viewer'; // Default: viewer
  filename?: string;         // Download filename
  
  // Security
  password?: string;         // PDF password (if protected)
  expiryDate?: string;       // ISO date for URL expiry
  
  // Metadata
  title?: string;
  description?: string;
  fileSize?: number;         // In bytes
  pageCount?: number;
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Option A: Direct PDF Link**
```
https://example.com/menu.pdf
```

**Option B: PDF Viewer (Recommended)**
```
https://qr.gudbro.com/pdf/[QR_ID]

Backend serves with appropriate headers:
- Content-Type: application/pdf
- Content-Disposition: inline (viewer) or attachment (download)
```

**Option C: Hosted PDF**
```
https://cdn.gudbro.com/pdfs/[USER_ID]/[FILENAME].pdf

Uploaded via API, stored in cloud storage
```

#### Validation Rules

```javascript
// URL validation
const validatePDFUrl = (url) => {
  try {
    const parsed = new URL(url);
    
    // Check if URL ends with .pdf or has pdf content type
    if (!url.toLowerCase().endsWith('.pdf') && 
        !url.includes('application/pdf')) {
      console.warn('URL may not be a PDF');
    }
    
    return url;
  } catch (error) {
    throw new Error('Invalid PDF URL');
  }
};

// File validation
const validatePDFFile = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!file.type.includes('pdf')) {
    throw new Error('File must be PDF format');
  }
  
  if (file.size > maxSize) {
    throw new Error('PDF file too large (max 50MB)');
  }
  
  return true;
};

// Filename validation
const validateFilename = (filename) => {
  // Sanitize filename
  const sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
    
  if (!sanitized.endsWith('.pdf')) {
    return sanitized + '.pdf';
  }
  
  return sanitized;
};

// Expiry date validation
if (expiryDate) {
  const expiry = new Date(expiryDate);
  if (expiry < new Date()) {
    throw new Error('Expiry date must be in the future');
  }
}
```

#### Implementation

```javascript
const generatePDFQR = async ({ pdfUrl, pdfFile, viewMode, filename, expiryDate }) => {
  let finalUrl;
  
  if (pdfFile) {
    // Upload to cloud storage
    const uploadedUrl = await uploadToStorage({
      file: pdfFile,
      path: `pdfs/${userId}/${filename}`,
      contentType: 'application/pdf'
    });
    
    finalUrl = uploadedUrl;
  } else if (pdfUrl) {
    validatePDFUrl(pdfUrl);
    finalUrl = pdfUrl;
  } else {
    throw new Error('PDF URL or file required');
  }
  
  // Create QR record with metadata
  const qrId = await createQRRecord({
    type: 'pdf',
    pdfUrl: finalUrl,
    viewMode,
    filename: filename || 'document.pdf',
    expiryDate
  });
  
  // Return viewer URL
  return `https://qr.gudbro.com/pdf/${qrId}`;
};

// PDF viewer endpoint
app.get('/pdf/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  
  // Check expiry
  if (qrData.expiryDate && new Date(qrData.expiryDate) < new Date()) {
    return res.status(410).send('This PDF link has expired');
  }
  
  // Set headers based on view mode
  const headers = {
    'Content-Type': 'application/pdf',
  };
  
  if (qrData.viewMode === 'download') {
    headers['Content-Disposition'] = `attachment; filename="${qrData.filename}"`;
  } else {
    headers['Content-Disposition'] = `inline; filename="${qrData.filename}"`;
  }
  
  // Stream PDF
  const pdfStream = await fetchPDF(qrData.pdfUrl);
  res.set(headers);
  pdfStream.pipe(res);
});
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "pdf",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/pdf/abc123",
    "metadata": {
      "filename": "menu-november-2025.pdf",
      "fileSize": 2457600,
      "pageCount": 12,
      "viewMode": "viewer",
      "expiryDate": "2025-12-31T23:59:59Z",
      "pdfUrl": "https://cdn.gudbro.com/pdfs/user123/menu.pdf"
    }
  }
}
```

#### Testing Checklist

- [ ] Direct PDF URL works
- [ ] File upload works (<50MB)
- [ ] Large file rejected (>50MB)
- [ ] Non-PDF file rejected
- [ ] Viewer mode displays inline
- [ ] Download mode triggers download
- [ ] Filename sanitization works
- [ ] Expiry date blocks access
- [ ] Password-protected PDFs handled
- [ ] Mobile PDF viewer works:
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Analytics track views/downloads

#### Acceptance Criteria

- [ ] POST /qr/pdf endpoint created
- [ ] File upload support (multipart)
- [ ] Cloud storage integration
- [ ] View mode options (viewer/download)
- [ ] Expiry date support
- [ ] Filename sanitization
- [ ] File size validation
- [ ] Unit tests (10+ tests)
- [ ] Integration test with storage
- [ ] Real device testing

**Effort:** 3 hours

---

### 8. Video QR Code

#### Purpose
Link to video content - promotions, tutorials, virtual tours, chef interviews. Critical for restaurants showcasing dishes, hotels with property tours, events with highlights.

#### Market Context
- Video content drives engagement
- YouTube, Vimeo, custom hosting
- Virtual restaurant tours popular post-COVID
- Competitors charge premium for video QR

#### API Endpoint
```
POST /qr/video
```

#### Request Parameters

```typescript
interface VideoQRPayload {
  // Video source (one required)
  videoUrl?: string;         // YouTube, Vimeo, direct video URL
  videoFile?: File;          // Upload video file
  
  // Video platform
  platform?: 'youtube' | 'vimeo' | 'facebook' | 'instagram' | 'tiktok' | 'custom';
  
  // Playback options
  autoplay?: boolean;        // Start playing automatically
  startTime?: number;        // Start at specific second
  endTime?: number;          // End at specific second
  
  // Metadata
  title?: string;
  description?: string;
  thumbnail?: string;        // Thumbnail image URL
  duration?: number;         // Video duration in seconds
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**YouTube:**
```
Standard: https://www.youtube.com/watch?v=[VIDEO_ID]
Short: https://youtu.be/[VIDEO_ID]
Embed: https://www.youtube.com/embed/[VIDEO_ID]
With time: https://youtu.be/[VIDEO_ID]?t=30s
Autoplay: https://www.youtube.com/embed/[VIDEO_ID]?autoplay=1
```

**Vimeo:**
```
Standard: https://vimeo.com/[VIDEO_ID]
Embed: https://player.vimeo.com/video/[VIDEO_ID]
With time: https://vimeo.com/[VIDEO_ID]#t=30s
```

**Facebook:**
```
https://www.facebook.com/watch/?v=[VIDEO_ID]
```

**Instagram:**
```
https://www.instagram.com/reel/[REEL_ID]
https://www.instagram.com/p/[POST_ID]
```

**TikTok:**
```
https://www.tiktok.com/@[USERNAME]/video/[VIDEO_ID]
```

**Custom video player:**
```
https://qr.gudbro.com/video/[QR_ID]
```

#### Validation Rules

```javascript
// Video URL validation and platform detection
const detectVideoPlatform = (url) => {
  const patterns = {
    youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    vimeo: /vimeo\.com\/(?:video\/)?(\d+)/,
    facebook: /facebook\.com\/(?:watch\/\?v=|video\.php\?v=)(\d+)/,
    instagram: /instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/,
    tiktok: /tiktok\.com\/@[^/]+\/video\/(\d+)/
  };
  
  for (const [platform, pattern] of Object.entries(patterns)) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform,
        videoId: match[1],
        originalUrl: url
      };
    }
  }
  
  // Custom video URL
  if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return {
      platform: 'custom',
      videoId: null,
      originalUrl: url
    };
  }
  
  throw new Error('Unsupported video URL');
};

// Video file validation
const validateVideoFile = (file) => {
  const maxSize = 500 * 1024 * 1024; // 500MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Video must be MP4, WebM, or OGG format');
  }
  
  if (file.size > maxSize) {
    throw new Error('Video file too large (max 500MB)');
  }
  
  return true;
};

// Time validation
if (startTime !== undefined && startTime < 0) {
  throw new Error('Start time must be positive');
}

if (endTime !== undefined && endTime < startTime) {
  throw new Error('End time must be after start time');
}
```

#### Implementation

```javascript
const generateVideoQR = async ({ 
  videoUrl, 
  videoFile, 
  platform,
  autoplay,
  startTime,
  endTime,
  title
}) => {
  let finalUrl;
  let detectedPlatform;
  
  if (videoFile) {
    // Upload to cloud storage
    const uploadedUrl = await uploadToStorage({
      file: videoFile,
      path: `videos/${userId}/${videoFile.name}`,
      contentType: videoFile.type
    });
    
    finalUrl = uploadedUrl;
    detectedPlatform = 'custom';
  } else if (videoUrl) {
    const detected = detectVideoPlatform(videoUrl);
    detectedPlatform = platform || detected.platform;
    finalUrl = buildVideoUrl(detected, { autoplay, startTime, endTime });
  } else {
    throw new Error('Video URL or file required');
  }
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'video',
    videoUrl: finalUrl,
    platform: detectedPlatform,
    autoplay,
    startTime,
    endTime,
    title
  });
  
  // Return player URL
  return `https://qr.gudbro.com/video/${qrId}`;
};

// Build platform-specific URLs
const buildVideoUrl = ({ platform, videoId, originalUrl }, options) => {
  const { autoplay, startTime, endTime } = options;
  
  switch (platform) {
    case 'youtube':
      let params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (startTime) params.set('start', Math.floor(startTime));
      if (endTime) params.set('end', Math.floor(endTime));
      
      return `https://www.youtube.com/embed/${videoId}?${params}`;
      
    case 'vimeo':
      let vimeoParams = new URLSearchParams();
      if (autoplay) vimeoParams.set('autoplay', '1');
      
      let vimeoUrl = `https://player.vimeo.com/video/${videoId}?${vimeoParams}`;
      if (startTime) vimeoUrl += `#t=${Math.floor(startTime)}s`;
      
      return vimeoUrl;
      
    default:
      return originalUrl;
  }
};

// Video player endpoint
app.get('/video/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  
  // Render video player page
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${qrData.title || 'Video'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { margin: 0; background: #000; }
        .video-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
        }
        .video-container iframe,
        .video-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="video-container">
        ${generateVideoEmbed(qrData)}
      </div>
    </body>
    </html>
  `);
});
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "video",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/video/abc123",
    "metadata": {
      "platform": "youtube",
      "videoId": "dQw4w9WgXcQ",
      "title": "Chef's Special Technique",
      "duration": 245,
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "autoplay": true,
      "startTime": 30
    }
  }
}
```

#### Testing Checklist

- [ ] YouTube URLs detected and parsed
- [ ] Vimeo URLs detected and parsed
- [ ] Facebook video URLs work
- [ ] Instagram reels work
- [ ] TikTok videos work
- [ ] Custom video URLs work
- [ ] Video file upload works (<500MB)
- [ ] Large file rejected (>500MB)
- [ ] Autoplay parameter works
- [ ] Start time parameter works
- [ ] End time parameter works
- [ ] Video player responsive:
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Thumbnail extraction works
- [ ] Analytics track plays

#### Acceptance Criteria

- [ ] POST /qr/video endpoint created
- [ ] 5+ platform support (YouTube, Vimeo, FB, IG, TikTok)
- [ ] File upload support
- [ ] Cloud storage integration
- [ ] Autoplay option
- [ ] Start/end time support
- [ ] Responsive video player
- [ ] Platform auto-detection
- [ ] Unit tests (12+ tests)
- [ ] Integration test with platforms
- [ ] Real device testing

**Effort:** 2-3 hours

---

### 9. Audio/MP3 QR Code

#### Purpose
Link to audio content - music, podcasts, audio guides, language lessons. Critical for museums (audio tours), events (speeches), music venues (playlists).

#### Market Context
- Museum audio guides (post-COVID contactless)
- Restaurant ambient music playlists
- Podcast promotion
- Audio menus for visually impaired
- Competitors rarely support audio-specific QR

#### API Endpoint
```
POST /qr/audio
```

#### Request Parameters

```typescript
interface AudioQRPayload {
  // Audio source (one required)
  audioUrl?: string;         // Spotify, Apple Music, SoundCloud, direct audio
  audioFile?: File;          // Upload audio file
  
  // Platform
  platform?: 'spotify' | 'apple-music' | 'soundcloud' | 'youtube-music' | 'custom';
  
  // Playback options
  autoplay?: boolean;        // Start playing automatically
  loop?: boolean;            // Loop playback
  
  // Metadata
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;         // Duration in seconds
  coverArt?: string;         // Cover art image URL
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Spotify:**
```
Track: https://open.spotify.com/track/[TRACK_ID]
Album: https://open.spotify.com/album/[ALBUM_ID]
Playlist: https://open.spotify.com/playlist/[PLAYLIST_ID]
Artist: https://open.spotify.com/artist/[ARTIST_ID]
URI: spotify:track:[TRACK_ID]
```

**Apple Music:**
```
https://music.apple.com/[COUNTRY]/album/[ALBUM]/[ALBUM_ID]?i=[TRACK_ID]
https://music.apple.com/[COUNTRY]/playlist/[PLAYLIST_NAME]/[PLAYLIST_ID]
```

**SoundCloud:**
```
https://soundcloud.com/[ARTIST]/[TRACK]
https://soundcloud.com/[ARTIST]/sets/[PLAYLIST]
```

**YouTube Music:**
```
https://music.youtube.com/watch?v=[VIDEO_ID]
https://music.youtube.com/playlist?list=[PLAYLIST_ID]
```

**Custom audio player:**
```
https://qr.gudbro.com/audio/[QR_ID]
```

#### Validation Rules

```javascript
// Audio URL validation and platform detection
const detectAudioPlatform = (url) => {
  const patterns = {
    spotify: /open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/,
    appleMusic: /music\.apple\.com\/[a-z]{2}\/(album|playlist)\/[^/]+\/([a-zA-Z0-9]+)/,
    soundcloud: /soundcloud\.com\/([^/]+)\/(?:sets\/)?([^/?]+)/,
    youtubeMusic: /music\.youtube\.com\/(?:watch\?v=|playlist\?list=)([a-zA-Z0-9_-]+)/
  };
  
  for (const [platform, pattern] of Object.entries(patterns)) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform,
        contentType: match[1] || 'track',
        contentId: match[2],
        originalUrl: url
      };
    }
  }
  
  // Custom audio URL
  if (url.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
    return {
      platform: 'custom',
      contentId: null,
      originalUrl: url
    };
  }
  
  throw new Error('Unsupported audio URL');
};

// Audio file validation
const validateAudioFile = (file) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'audio/mpeg',      // MP3
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/aac'
  ];
  
  if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
    throw new Error('Audio must be MP3, WAV, OGG, M4A, or AAC format');
  }
  
  if (file.size > maxSize) {
    throw new Error('Audio file too large (max 100MB)');
  }
  
  return true;
};

// Metadata validation
if (duration !== undefined && duration <= 0) {
  throw new Error('Duration must be positive');
}

if (title && title.length > 200) {
  throw new Error('Title max 200 characters');
}
```

#### Implementation

```javascript
const generateAudioQR = async ({ 
  audioUrl, 
  audioFile, 
  platform,
  autoplay,
  loop,
  title,
  artist
}) => {
  let finalUrl;
  let detectedPlatform;
  let metadata = {};
  
  if (audioFile) {
    // Upload to cloud storage
    const uploadedUrl = await uploadToStorage({
      file: audioFile,
      path: `audio/${userId}/${audioFile.name}`,
      contentType: audioFile.type
    });
    
    finalUrl = uploadedUrl;
    detectedPlatform = 'custom';
  } else if (audioUrl) {
    const detected = detectAudioPlatform(audioUrl);
    detectedPlatform = platform || detected.platform;
    finalUrl = audioUrl;
    
    // Fetch metadata if possible
    if (detectedPlatform === 'spotify') {
      metadata = await fetchSpotifyMetadata(detected.contentId);
    }
  } else {
    throw new Error('Audio URL or file required');
  }
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'audio',
    audioUrl: finalUrl,
    platform: detectedPlatform,
    autoplay,
    loop,
    title: title || metadata.title,
    artist: artist || metadata.artist,
    ...metadata
  });
  
  // Return player URL
  return `https://qr.gudbro.com/audio/${qrId}`;
};

// Audio player endpoint
app.get('/audio/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  
  if (qrData.platform !== 'custom') {
    // Redirect to streaming platform
    return res.redirect(qrData.audioUrl);
  }
  
  // Render custom audio player
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${qrData.title || 'Audio'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .player {
          background: white;
          border-radius: 20px;
          padding: 30px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .cover {
          width: 100%;
          aspect-ratio: 1;
          background: #f0f0f0;
          border-radius: 15px;
          margin-bottom: 20px;
          background-image: url('${qrData.coverArt || ''}');
          background-size: cover;
          background-position: center;
        }
        .info {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .artist {
          font-size: 18px;
          color: #666;
        }
        audio {
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div class="player">
        ${qrData.coverArt ? `<div class="cover"></div>` : ''}
        <div class="info">
          <div class="title">${qrData.title || 'Audio Track'}</div>
          ${qrData.artist ? `<div class="artist">${qrData.artist}</div>` : ''}
        </div>
        <audio 
          controls 
          ${qrData.autoplay ? 'autoplay' : ''}
          ${qrData.loop ? 'loop' : ''}
          src="${qrData.audioUrl}"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    </body>
    </html>
  `);
});
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "audio",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/audio/abc123",
    "metadata": {
      "platform": "spotify",
      "contentType": "track",
      "title": "Restaurant Ambiance Mix",
      "artist": "Various Artists",
      "duration": 2400,
      "coverArt": "https://i.scdn.co/image/...",
      "autoplay": false,
      "loop": true
    }
  }
}
```

#### Testing Checklist

- [ ] Spotify URLs detected and parsed
- [ ] Apple Music URLs work
- [ ] SoundCloud URLs work
- [ ] YouTube Music URLs work
- [ ] Custom audio URLs work
- [ ] Audio file upload works (<100MB)
- [ ] Large file rejected (>100MB)
- [ ] Autoplay parameter works
- [ ] Loop parameter works
- [ ] Audio player works:
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Cover art displays
- [ ] Metadata extraction works (Spotify)
- [ ] Analytics track plays

#### Acceptance Criteria

- [ ] POST /qr/audio endpoint created
- [ ] 4+ platform support (Spotify, Apple, SoundCloud, YouTube Music)
- [ ] File upload support
- [ ] Cloud storage integration
- [ ] Autoplay and loop options
- [ ] Custom audio player UI
- [ ] Platform auto-detection
- [ ] Metadata extraction (where possible)
- [ ] Unit tests (10+ tests)
- [ ] Integration test
- [ ] Real device testing

**Effort:** 2-3 hours

---

### 10. Multi-URL QR Code (Advanced)

#### Purpose
Single QR code that routes to different URLs based on rules - A/B testing, geo-targeting, device detection, time-based routing. Critical for agencies running campaigns and businesses with multi-location presence.

#### Market Context
- Premium feature in QR Tiger ($99/mo), Flowcode ($250/mo)
- Essential for marketing campaigns
- A/B testing for landing pages
- Geo-routing for multi-location businesses
- Device-specific content (app deep links)

#### API Endpoint
```
POST /qr/multi-url
```

#### Request Parameters

```typescript
interface MultiURLQRPayload {
  // Routing rules (at least 2 URLs required)
  rules: RoutingRule[];
  
  // Default fallback
  defaultUrl: string;
  
  // Metadata
  title?: string;
  description?: string;
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

interface RoutingRule {
  // Rule conditions (AND logic within rule, first match wins)
  conditions?: {
    // Geographic
    country?: string[];        // ['VN', 'US', 'KR']
    city?: string[];           // ['Hanoi', 'Da Nang']
    
    // Device
    device?: 'mobile' | 'tablet' | 'desktop';
    os?: 'ios' | 'android' | 'windows' | 'macos' | 'linux';
    
    // Time-based
    timeRange?: {
      start: string;           // ISO datetime or time (HH:MM)
      end: string;
      timezone?: string;
    };
    dayOfWeek?: number[];      // 0-6 (Sunday-Saturday)
    
    // Language
    language?: string[];       // ['vi', 'en', 'ko']
    
    // A/B Testing
    percentage?: number;       // 0-100 (traffic split)
  };
  
  // Destination for this rule
  url: string;
  
  // Rule metadata
  label?: string;              // "iOS Users", "Vietnam Traffic"
  priority?: number;           // Higher priority evaluated first
}
```

#### QR Data Format

**Router URL:**
```
https://qr.gudbro.com/r/[QR_ID]
```

Backend evaluates rules and redirects accordingly.

#### Validation Rules

```javascript
// Rules validation
const validateRoutingRules = (rules, defaultUrl) => {
  if (!rules || rules.length < 1) {
    throw new Error('At least 1 routing rule required');
  }
  
  if (rules.length > 50) {
    throw new Error('Maximum 50 routing rules allowed');
  }
  
  // Validate each rule
  rules.forEach((rule, index) => {
    if (!rule.url) {
      throw new Error(`Rule ${index + 1}: URL required`);
    }
    
    try {
      new URL(rule.url);
    } catch {
      throw new Error(`Rule ${index + 1}: Invalid URL format`);
    }
    
    // Validate percentage for A/B testing
    if (rule.conditions?.percentage !== undefined) {
      const pct = rule.conditions.percentage;
      if (pct < 0 || pct > 100) {
        throw new Error(`Rule ${index + 1}: Percentage must be 0-100`);
      }
    }
    
    // Validate time range
    if (rule.conditions?.timeRange) {
      const { start, end } = rule.conditions.timeRange;
      if (new Date(start) >= new Date(end)) {
        throw new Error(`Rule ${index + 1}: Invalid time range`);
      }
    }
  });
  
  // Validate default URL
  try {
    new URL(defaultUrl);
  } catch {
    throw new Error('Invalid default URL format');
  }
  
  // Check percentage total (for A/B testing rules)
  const percentageRules = rules.filter(r => r.conditions?.percentage);
  if (percentageRules.length > 0) {
    const total = percentageRules.reduce((sum, r) => sum + r.conditions.percentage, 0);
    if (total > 100) {
      throw new Error('Total percentage across rules cannot exceed 100%');
    }
  }
};

// Country code validation
const validateCountryCode = (code) => {
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new Error('Country code must be 2-letter ISO code (e.g., VN, US)');
  }
};

// Language code validation
const validateLanguageCode = (code) => {
  if (!/^[a-z]{2}$/.test(code)) {
    throw new Error('Language code must be 2-letter ISO code (e.g., vi, en)');
  }
};
```

#### Implementation

```javascript
const generateMultiURLQR = async ({ rules, defaultUrl, title }) => {
  // Validate all rules
  validateRoutingRules(rules, defaultUrl);
  
  // Sort rules by priority
  const sortedRules = rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'multi-url',
    rules: sortedRules,
    defaultUrl,
    title
  });
  
  return `https://qr.gudbro.com/r/${qrId}`;
};

// Router endpoint
app.get('/r/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  
  // Extract request context
  const context = {
    country: await getCountryFromIP(req.ip),
    city: await getCityFromIP(req.ip),
    device: detectDevice(req.headers['user-agent']),
    os: detectOS(req.headers['user-agent']),
    language: req.headers['accept-language']?.split(',')[0]?.substring(0, 2),
    timestamp: new Date(),
    randomValue: Math.random() * 100 // For percentage-based routing
  };
  
  // Evaluate rules in priority order
  for (const rule of qrData.rules) {
    if (matchesRule(rule, context)) {
      // Log analytics
      await trackRedirect(qrId, rule.label || rule.url, context);
      return res.redirect(rule.url);
    }
  }
  
  // Default fallback
  await trackRedirect(qrId, 'default', context);
  return res.redirect(qrData.defaultUrl);
});

// Rule matching logic
const matchesRule = (rule, context) => {
  if (!rule.conditions) return false;
  
  const { conditions } = rule;
  
  // Country check
  if (conditions.country && !conditions.country.includes(context.country)) {
    return false;
  }
  
  // City check
  if (conditions.city && !conditions.city.includes(context.city)) {
    return false;
  }
  
  // Device check
  if (conditions.device && conditions.device !== context.device) {
    return false;
  }
  
  // OS check
  if (conditions.os && conditions.os !== context.os) {
    return false;
  }
  
  // Language check
  if (conditions.language && !conditions.language.includes(context.language)) {
    return false;
  }
  
  // Time range check
  if (conditions.timeRange) {
    const now = context.timestamp;
    const start = new Date(conditions.timeRange.start);
    const end = new Date(conditions.timeRange.end);
    
    if (now < start || now > end) {
      return false;
    }
  }
  
  // Day of week check
  if (conditions.dayOfWeek) {
    const day = context.timestamp.getDay();
    if (!conditions.dayOfWeek.includes(day)) {
      return false;
    }
  }
  
  // Percentage check (A/B testing)
  if (conditions.percentage !== undefined) {
    if (context.randomValue > conditions.percentage) {
      return false;
    }
  }
  
  // All conditions matched
  return true;
};
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "multi-url",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/r/abc123",
    "metadata": {
      "rulesCount": 4,
      "rules": [
        {
          "label": "iOS Users in Vietnam",
          "conditions": {
            "country": ["VN"],
            "os": "ios"
          },
          "url": "https://apps.apple.com/vn/app/...",
          "priority": 10
        },
        {
          "label": "Android Users in Vietnam",
          "conditions": {
            "country": ["VN"],
            "os": "android"
          },
          "url": "https://play.google.com/store/apps/...",
          "priority": 9
        },
        {
          "label": "Business Hours",
          "conditions": {
            "timeRange": {
              "start": "09:00",
              "end": "18:00"
            },
            "dayOfWeek": [1, 2, 3, 4, 5]
          },
          "url": "https://gudbro.com/contact",
          "priority": 5
        },
        {
          "label": "A/B Test - Variant A",
          "conditions": {
            "percentage": 50
          },
          "url": "https://gudbro.com/landing-a",
          "priority": 1
        }
      ],
      "defaultUrl": "https://gudbro.com"
    }
  }
}
```

#### Testing Checklist

- [ ] At least 1 rule required
- [ ] Maximum 50 rules enforced
- [ ] Default URL required
- [ ] URL validation works
- [ ] Priority sorting correct
- [ ] Country routing works
- [ ] City routing works
- [ ] Device detection accurate
- [ ] OS detection accurate
- [ ] Language detection works
- [ ] Time range routing works
- [ ] Day of week routing works
- [ ] Percentage A/B testing works
- [ ] Multiple conditions (AND logic)
- [ ] First matching rule wins
- [ ] Default fallback works
- [ ] Analytics track rule hits
- [ ] Performance (eval time <50ms)

#### Acceptance Criteria

- [ ] POST /qr/multi-url endpoint created
- [ ] Rule validation comprehensive
- [ ] 7+ condition types supported
- [ ] Priority-based evaluation
- [ ] AND logic within rules
- [ ] First match wins logic
- [ ] Default fallback always works
- [ ] Analytics per rule
- [ ] Performance optimized (<50ms)
- [ ] Unit tests (20+ tests)
- [ ] Integration test with all conditions
- [ ] Real-world testing (geo/device)

**Effort:** 4 hours

---

### 11. Business Page QR Code

#### Purpose
Comprehensive business profile combining vCard + website + social links + location. Critical for restaurants (complete contact info), hotels (booking + info), retail (store details).

#### Market Context
- All-in-one business contact solution
- Replaces multiple QR codes
- Google My Business alternative
- Competitors charge premium for this

#### API Endpoint
```
POST /qr/business-page
```

#### Request Parameters

```typescript
interface BusinessPageQRPayload {
  // Business information
  businessName: string;
  tagline?: string;
  description?: string;
  logo?: string;              // Logo image URL
  coverImage?: string;        // Header/cover image URL
  
  // Contact information
  phone?: string;
  email?: string;
  website?: string;
  
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Business hours
  hours?: {
    [day: string]: {         // 'monday', 'tuesday', etc.
      open: string;          // '09:00'
      close: string;         // '18:00'
      closed?: boolean;
    };
  };
  
  // Social links
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    zalo?: string;
    // Add more as needed
  };
  
  // Call-to-action buttons
  cta?: {
    primary?: {
      label: string;         // 'Book Now', 'Order Online'
      url: string;
    };
    secondary?: {
      label: string;
      url: string;
    };
  };
  
  // Categories/tags
  category?: string;         // 'Restaurant', 'Hotel', 'Retail'
  tags?: string[];           // ['Vietnamese', 'Seafood', 'Fine Dining']
  
  // Theme customization
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  
  // Standard QR options
  title?: string;
  description?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Business page URL:**
```
https://qr.gudbro.com/biz/[QR_ID]
https://qr.gudbro.com/b/[CUSTOM_SLUG] (optional vanity URL)
```

#### Validation Rules

```javascript
// Business name validation
if (!businessName || businessName.length < 2 || businessName.length > 100) {
  throw new Error('Business name must be 2-100 characters');
}

// Phone validation (international)
const validateBusinessPhone = (phone) => {
  // Remove formatting
  const cleaned = phone.replace(/[\s\-()+]/g, '');
  
  // Check if valid international format
  if (!/^\+?\d{8,15}$/.test(cleaned)) {
    throw new Error('Invalid phone number format');
  }
  
  return cleaned;
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email.toLowerCase();
};

// URL validation
const validateURL = (url, field = 'URL') => {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`Invalid ${field} format`);
  }
};

// Coordinates validation
if (address?.latitude !== undefined || address?.longitude !== undefined) {
  if (address.latitude < -90 || address.latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (address.longitude < -180 || address.longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
}

// Hours validation
if (hours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  Object.keys(hours).forEach(day => {
    if (!days.includes(day.toLowerCase())) {
      throw new Error(`Invalid day: ${day}`);
    }
    
    if (!hours[day].closed) {
      const { open, close } = hours[day];
      if (!/^\d{2}:\d{2}$/.test(open) || !/^\d{2}:\d{2}$/.test(close)) {
        throw new Error(`Invalid time format for ${day} (use HH:MM)`);
      }
    }
  });
}

// Social links validation
if (social) {
  Object.entries(social).forEach(([platform, url]) => {
    validateURL(url, platform);
  });
}

// CTA validation
if (cta?.primary) {
  if (!cta.primary.label || cta.primary.label.length > 30) {
    throw new Error('Primary CTA label required (max 30 chars)');
  }
  validateURL(cta.primary.url, 'Primary CTA');
}
```

#### Implementation

```javascript
const generateBusinessPageQR = async (payload) => {
  // Validate required fields
  if (!payload.businessName) {
    throw new Error('Business name required');
  }
  
  // Validate all fields
  if (payload.phone) payload.phone = validateBusinessPhone(payload.phone);
  if (payload.email) payload.email = validateEmail(payload.email);
  if (payload.website) validateURL(payload.website);
  
  // Generate custom slug if not provided
  const slug = payload.customSlug || generateSlug(payload.businessName);
  
  // Check slug availability
  const slugExists = await checkSlugExists(slug);
  if (slugExists) {
    throw new Error('Custom slug already taken');
  }
  
  // Create business page record
  const pageId = await createBusinessPage({
    ...payload,
    slug,
    createdAt: new Date(),
    views: 0
  });
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'business-page',
    businessPageId: pageId,
    ...payload
  });
  
  return {
    qrUrl: `https://qr.gudbro.com/biz/${qrId}`,
    pageUrl: `https://qr.gudbro.com/b/${slug}`,
    editUrl: `https://qr.gudbro.com/dashboard/business/${pageId}/edit`
  };
};

// Business page endpoint
app.get('/biz/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  const businessData = await getBusinessPage(qrData.businessPageId);
  
  // Increment view count
  await incrementPageViews(businessData.id);
  
  // Render business page
  res.send(renderBusinessPage(businessData));
});

// Vanity URL endpoint
app.get('/b/:slug', async (req, res) => {
  const { slug } = req.params;
  const businessData = await getBusinessPageBySlug(slug);
  
  if (!businessData) {
    return res.status(404).send('Business page not found');
  }
  
  await incrementPageViews(businessData.id);
  res.send(renderBusinessPage(businessData));
});

// Business page renderer
const renderBusinessPage = (data) => {
  const {
    businessName,
    tagline,
    description,
    logo,
    coverImage,
    phone,
    email,
    website,
    address,
    hours,
    social,
    cta,
    theme = {}
  } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${businessName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="${description || tagline || ''}">
      ${logo ? `<link rel="icon" href="${logo}">` : ''}
      <style>
        :root {
          --primary-color: ${theme.primaryColor || '#3b82f6'};
          --accent-color: ${theme.accentColor || '#10b981'};
          --font-family: ${theme.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: var(--font-family);
          color: #1f2937;
          background: #f9fafb;
        }
        .cover {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          background-image: url('${coverImage}');
          background-size: cover;
          background-position: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
          box-shadow: 0 0 40px rgba(0,0,0,0.1);
        }
        .header {
          padding: 20px;
          text-align: center;
          transform: translateY(-60px);
          margin-bottom: -40px;
        }
        .logo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 5px solid white;
          background: white;
          margin: 0 auto 15px;
          background-image: url('${logo}');
          background-size: cover;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .business-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .tagline {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        .content {
          padding: 0 20px 20px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--primary-color);
        }
        .description {
          line-height: 1.6;
          color: #4b5563;
        }
        .contact-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f3f4f6;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
        }
        .contact-item:hover {
          background: #e5e7eb;
        }
        .contact-icon {
          width: 40px;
          text-align: center;
          font-size: 20px;
          margin-right: 12px;
        }
        .cta-button {
          display: block;
          text-align: center;
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        }
        .cta-primary {
          background: var(--primary-color);
          color: white;
        }
        .cta-secondary {
          background: white;
          color: var(--primary-color);
          border: 2px solid var(--primary-color);
        }
        .hours-grid {
          display: grid;
          gap: 8px;
        }
        .hour-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
        }
        .day {
          font-weight: 500;
          text-transform: capitalize;
        }
        .time {
          color: #6b7280;
        }
        .time.closed {
          color: #ef4444;
        }
        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }
        .social-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          font-size: 14px;
        }
        .social-link:hover {
          background: #e5e7eb;
        }
        .social-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .map {
          width: 100%;
          height: 200px;
          border-radius: 12px;
          border: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${coverImage ? '<div class="cover"></div>' : ''}
        
        <div class="header">
          ${logo ? '<div class="logo"></div>' : ''}
          <div class="business-name">${businessName}</div>
          ${tagline ? `<div class="tagline">${tagline}</div>` : ''}
        </div>
        
        <div class="content">
          ${renderCTA(cta)}
          ${renderDescription(description)}
          ${renderContact(phone, email, website)}
          ${renderAddress(address)}
          ${renderHours(hours)}
          ${renderSocial(social)}
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper renderers
const renderCTA = (cta) => {
  if (!cta) return '';
  
  return `
    <div class="section">
      ${cta.primary ? `
        <a href="${cta.primary.url}" class="cta-button cta-primary">
          ${cta.primary.label}
        </a>
      ` : ''}
      ${cta.secondary ? `
        <a href="${cta.secondary.url}" class="cta-button cta-secondary">
          ${cta.secondary.label}
        </a>
      ` : ''}
    </div>
  `;
};

const renderContact = (phone, email, website) => {
  if (!phone && !email && !website) return '';
  
  return `
    <div class="section">
      <div class="section-title">Contact</div>
      ${phone ? `
        <a href="tel:${phone}" class="contact-item">
          <div class="contact-icon">📞</div>
          <div>${phone}</div>
        </a>
      ` : ''}
      ${email ? `
        <a href="mailto:${email}" class="contact-item">
          <div class="contact-icon">📧</div>
          <div>${email}</div>
        </a>
      ` : ''}
      ${website ? `
        <a href="${website}" class="contact-item" target="_blank">
          <div class="contact-icon">🌐</div>
          <div>${website.replace(/^https?:\/\//, '')}</div>
        </a>
      ` : ''}
    </div>
  `;
};

// ... more helper functions
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "business-page",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/biz/abc123",
    "pageUrl": "https://qr.gudbro.com/b/gudbro-restaurant",
    "editUrl": "https://qr.gudbro.com/dashboard/business/abc123/edit",
    "metadata": {
      "businessName": "Gudbro Restaurant",
      "category": "Restaurant",
      "slug": "gudbro-restaurant",
      "hasLogo": true,
      "hasCoverImage": true,
      "contactMethodsCount": 3,
      "socialLinksCount": 4,
      "theme": {
        "primaryColor": "#3b82f6",
        "accentColor": "#10b981"
      }
    }
  }
}
```

#### Testing Checklist

- [ ] Business name required
- [ ] All optional fields work
- [ ] Phone validation (international)
- [ ] Email validation
- [ ] URL validation (website, social)
- [ ] Address with coordinates renders map
- [ ] Business hours display correctly
- [ ] Closed days marked properly
- [ ] Social links work (10+ platforms)
- [ ] CTA buttons functional
- [ ] Custom slug generation
- [ ] Slug uniqueness enforced
- [ ] Theme customization works
- [ ] Mobile responsive:
  - [ ] iOS Safari
  - [ ] Android Chrome
- [ ] Page editable after creation
- [ ] View counter increments
- [ ] SEO meta tags present
- [ ] vCard download option
- [ ] Save to contacts button

#### Acceptance Criteria

- [ ] POST /qr/business-page endpoint created
- [ ] Complete business profile support
- [ ] Contact information (phone/email/website)
- [ ] Address with map integration
- [ ] Business hours with closed days
- [ ] 10+ social platform support
- [ ] CTA buttons (primary/secondary)
- [ ] Custom vanity URLs
- [ ] Theme customization
- [ ] Mobile-optimized page
- [ ] vCard download option
- [ ] Analytics (views, clicks)
- [ ] Edit interface
- [ ] Unit tests (15+ tests)
- [ ] Integration test
- [ ] Real device testing

**Effort:** 3 hours

---

### 12. Coupon QR Code

#### Purpose
Digital coupons and discount codes with expiry dates, usage limits, and redemption tracking. Critical for restaurants (promotions), retail (sales), events (early bird discounts).

#### Market Context
- Replace paper coupons
- Track redemption rates
- Prevent fraud with one-time codes
- Competitors charge premium for this feature

#### API Endpoint
```
POST /qr/coupon
```

#### Request Parameters

```typescript
interface CouponQRPayload {
  // Coupon details
  code: string;              // Unique coupon code
  title: string;             // 'Buy 1 Get 1 Free'
  description?: string;      // Detailed terms
  
  // Discount
  discountType: 'percentage' | 'fixed' | 'free-item';
  discountValue?: number;    // 20 (for 20% off) or 100000 (for 100k VND off)
  currency?: string;         // For fixed discounts
  
  // Validity
  validFrom?: string;        // ISO datetime
  validUntil?: string;       // ISO datetime
  
  // Usage limits
  maxUses?: number;          // Total redemptions allowed
  maxUsesPerUser?: number;   // Per-user limit
  minPurchase?: number;      // Minimum purchase required
  
  // Visual
  brandLogo?: string;        // Brand logo URL
  brandColor?: string;       // Brand color
  couponImage?: string;      // Promotional image
  
  // Redemption
  redemptionUrl?: string;    // Where to apply coupon
  redemptionInstructions?: string;
  
  // Terms & conditions
  terms?: string[];          // Array of terms
  
  // Metadata
  campaignId?: string;       // Link to campaign
  category?: string;         // 'Food & Beverage', 'Retail'
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}
```

#### QR Data Format

**Coupon landing page:**
```
https://qr.gudbro.com/coupon/[QR_ID]
https://qr.gudbro.com/c/[COUPON_CODE] (vanity URL)
```

Backend displays coupon details and tracks redemptions.

#### Validation Rules

```javascript
// Coupon code validation
const validateCouponCode = (code) => {
  // Alphanumeric, dash, underscore, 3-20 chars
  if (!/^[A-Z0-9_-]{3,20}$/i.test(code)) {
    throw new Error('Coupon code must be 3-20 alphanumeric characters');
  }
  
  // Check uniqueness
  return code.toUpperCase();
};

// Discount validation
const validateDiscount = (type, value, currency) => {
  if (type === 'percentage') {
    if (value <= 0 || value > 100) {
      throw new Error('Percentage discount must be 1-100');
    }
  } else if (type === 'fixed') {
    if (!currency) {
      throw new Error('Currency required for fixed discount');
    }
    if (value <= 0) {
      throw new Error('Fixed discount must be positive');
    }
  }
};

// Date validation
const validateDates = (validFrom, validUntil) => {
  if (validFrom && validUntil) {
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    
    if (from >= until) {
      throw new Error('validUntil must be after validFrom');
    }
  }
  
  if (validUntil && new Date(validUntil) < new Date()) {
    throw new Error('validUntil must be in the future');
  }
};

// Usage limits validation
if (maxUsesPerUser && maxUsesPerUser > maxUses) {
  throw new Error('maxUsesPerUser cannot exceed maxUses');
}

if (minPurchase && minPurchase < 0) {
  throw new Error('minPurchase must be positive');
}

// Required fields
if (!code || !title || !discountType) {
  throw new Error('code, title, and discountType required');
}
```

#### Implementation

```javascript
const generateCouponQR = async (payload) => {
  // Validate coupon code
  const code = validateCouponCode(payload.code);
  
  // Check if code already exists
  const exists = await couponCodeExists(code);
  if (exists) {
    throw new Error('Coupon code already exists');
  }
  
  // Validate discount
  validateDiscount(
    payload.discountType,
    payload.discountValue,
    payload.currency
  );
  
  // Validate dates
  validateDates(payload.validFrom, payload.validUntil);
  
  // Create coupon record
  const couponId = await createCoupon({
    ...payload,
    code,
    currentUses: 0,
    status: 'active',
    createdAt: new Date()
  });
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'coupon',
    couponId,
    code
  });
  
  return {
    qrUrl: `https://qr.gudbro.com/coupon/${qrId}`,
    couponUrl: `https://qr.gudbro.com/c/${code}`,
    redeemUrl: `https://qr.gudbro.com/redeem/${couponId}`
  };
};

// Coupon display endpoint
app.get('/coupon/:qrId', async (req, res) => {
  const { qrId } = req.params;
  const qrData = await getQRRecord(qrId);
  const couponData = await getCoupon(qrData.couponId);
  
  // Check if coupon is valid
  const validation = validateCouponStatus(couponData);
  
  if (!validation.isValid) {
    return res.send(renderExpiredCoupon(couponData, validation.reason));
  }
  
  // Track view
  await trackCouponView(couponData.id);
  
  // Render coupon page
  res.send(renderCouponPage(couponData));
});

// Coupon validation
const validateCouponStatus = (coupon) => {
  const now = new Date();
  
  // Check if not yet valid
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return {
      isValid: false,
      reason: 'not_yet_valid',
      message: `This coupon will be valid from ${formatDate(coupon.validFrom)}`
    };
  }
  
  // Check if expired
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return {
      isValid: false,
      reason: 'expired',
      message: 'This coupon has expired'
    };
  }
  
  // Check usage limit
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return {
      isValid: false,
      reason: 'max_uses_reached',
      message: 'This coupon has reached its usage limit'
    };
  }
  
  // Check if deactivated
  if (coupon.status !== 'active') {
    return {
      isValid: false,
      reason: 'inactive',
      message: 'This coupon is no longer active'
    };
  }
  
  return { isValid: true };
};

// Redemption endpoint
app.post('/redeem/:couponId', async (req, res) => {
  const { couponId } = req.params;
  const { userId } = req.body; // Optional user tracking
  
  const coupon = await getCoupon(couponId);
  
  // Validate coupon
  const validation = validateCouponStatus(coupon);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: validation.message
    });
  }
  
  // Check per-user limit
  if (userId && coupon.maxUsesPerUser) {
    const userUses = await getUserCouponUses(couponId, userId);
    if (userUses >= coupon.maxUsesPerUser) {
      return res.status(400).json({
        success: false,
        error: 'You have reached the usage limit for this coupon'
      });
    }
  }
  
  // Record redemption
  await recordRedemption({
    couponId,
    userId,
    redeemedAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Increment usage counter
  await incrementCouponUses(couponId);
  
  // Return success with coupon details
  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      redemptionUrl: coupon.redemptionUrl,
      instructions: coupon.redemptionInstructions
    }
  });
});

// Coupon page renderer
const renderCouponPage = (coupon) => {
  const {
    code,
    title,
    description,
    discountType,
    discountValue,
    currency,
    validUntil,
    maxUses,
    currentUses,
    minPurchase,
    brandLogo,
    brandColor,
    couponImage,
    terms,
    redemptionUrl,
    redemptionInstructions
  } = coupon;
  
  // Calculate discount display
  let discountDisplay;
  if (discountType === 'percentage') {
    discountDisplay = `${discountValue}% OFF`;
  } else if (discountType === 'fixed') {
    discountDisplay = `${discountValue} ${currency} OFF`;
  } else {
    discountDisplay = 'FREE ITEM';
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${code}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .coupon-card {
          background: white;
          border-radius: 20px;
          max-width: 400px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .coupon-header {
          background: ${brandColor || '#3b82f6'};
          color: white;
          padding: 30px 20px;
          text-align: center;
          position: relative;
        }
        ${brandLogo ? `
          .brand-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: white;
            margin: 0 auto 15px;
            background-image: url('${brandLogo}');
            background-size: cover;
          }
        ` : ''}
        .discount-badge {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .coupon-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .coupon-code {
          background: rgba(255,255,255,0.2);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-top: 15px;
          border: 2px dashed white;
        }
        .coupon-body {
          padding: 30px 20px;
        }
        ${couponImage ? `
          .coupon-image {
            width: 100%;
            height: 200px;
            background-image: url('${couponImage}');
            background-size: cover;
            background-position: center;
            margin-bottom: 20px;
            border-radius: 12px;
          }
        ` : ''}
        .description {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .info-grid {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 14px;
        }
        .info-label {
          color: #6b7280;
        }
        .info-value {
          font-weight: 600;
          color: #1f2937;
        }
        .redeem-button {
          display: block;
          width: 100%;
          padding: 16px;
          background: ${brandColor || '#3b82f6'};
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          margin-bottom: 15px;
        }
        .redeem-button:hover {
          opacity: 0.9;
        }
        .copy-button {
          display: block;
          width: 100%;
          padding: 16px;
          background: white;
          color: ${brandColor || '#3b82f6'};
          text-align: center;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: 2px solid ${brandColor || '#3b82f6'};
          cursor: pointer;
        }
        .terms {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .terms-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #6b7280;
        }
        .terms-list {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.5;
        }
        .terms-list li {
          margin-bottom: 5px;
        }
        .usage-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 5px;
        }
        .usage-fill {
          height: 100%;
          background: ${brandColor || '#3b82f6'};
          transition: width 0.3s;
        }
      </style>
    </head>
    <body>
      <div class="coupon-card">
        <div class="coupon-header">
          ${brandLogo ? '<div class="brand-logo"></div>' : ''}
          <div class="discount-badge">${discountDisplay}</div>
          <div class="coupon-title">${title}</div>
          <div class="coupon-code">${code}</div>
        </div>
        
        <div class="coupon-body">
          ${couponImage ? '<div class="coupon-image"></div>' : ''}
          
          ${description ? `<div class="description">${description}</div>` : ''}
          
          <div class="info-grid">
            ${validUntil ? `
              <div class="info-item">
                <span class="info-label">Valid Until</span>
                <span class="info-value">${formatDate(validUntil)}</span>
              </div>
            ` : ''}
            
            ${minPurchase ? `
              <div class="info-item">
                <span class="info-label">Min Purchase</span>
                <span class="info-value">${minPurchase} ${currency}</span>
              </div>
            ` : ''}
            
            ${maxUses ? `
              <div class="info-item">
                <span class="info-label">Redemptions</span>
                <span class="info-value">${currentUses} / ${maxUses} used</span>
              </div>
              <div class="usage-bar">
                <div class="usage-fill" style="width: ${(currentUses/maxUses*100)}%"></div>
              </div>
            ` : ''}
          </div>
          
          ${redemptionUrl ? `
            <a href="${redemptionUrl}" class="redeem-button">
              ${redemptionInstructions || 'Redeem Now'}
            </a>
          ` : ''}
          
          <button class="copy-button" onclick="copyCouponCode()">
            📋 Copy Code
          </button>
          
          ${terms && terms.length > 0 ? `
            <div class="terms">
              <div class="terms-title">Terms & Conditions</div>
              <ul class="terms-list">
                ${terms.map(term => `<li>${term}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
      
      <script>
        function copyCouponCode() {
          navigator.clipboard.writeText('${code}');
          alert('Coupon code copied to clipboard!');
        }
      </script>
    </body>
    </html>
  `;
};
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "coupon",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/coupon/abc123",
    "couponUrl": "https://qr.gudbro.com/c/SAVE20",
    "redeemUrl": "https://qr.gudbro.com/redeem/abc123",
    "metadata": {
      "code": "SAVE20",
      "title": "20% Off Your Order",
      "discountType": "percentage",
      "discountValue": 20,
      "validUntil": "2025-12-31T23:59:59Z",
      "maxUses": 1000,
      "currentUses": 47,
      "status": "active"
    }
  }
}
```

#### Testing Checklist

- [ ] Coupon code validation
- [ ] Code uniqueness enforced
- [ ] Discount validation (percentage/fixed/free)
- [ ] Date validation (validFrom/validUntil)
- [ ] Usage limits work (total)
- [ ] Per-user limits work
- [ ] Min purchase enforcement
- [ ] Expired coupons display error
- [ ] Max uses reached display error
- [ ] Not yet valid display error
- [ ] Copy code button works
- [ ] Redemption tracking accurate
- [ ] Analytics per coupon:
  - [ ] Views
  - [ ] Redemptions
  - [ ] Conversion rate
- [ ] Mobile responsive
- [ ] Multiple redemptions by same user blocked (if limit set)

#### Acceptance Criteria

- [ ] POST /qr/coupon endpoint created
- [ ] 3 discount types (percentage/fixed/free)
- [ ] Validity date range
- [ ] Usage limits (total + per-user)
- [ ] Min purchase requirement
- [ ] Redemption tracking
- [ ] Copy code functionality
- [ ] Terms & conditions display
- [ ] Expired/max uses handling
- [ ] Visual customization (brand colors/logo)
- [ ] Redemption API endpoint
- [ ] Analytics (views/redemptions)
- [ ] Unit tests (18+ tests)
- [ ] Integration test with redemption
- [ ] Real device testing

**Effort:** 3 hours

---

### 13. Feedback Form QR Code

#### Purpose
Link to feedback/survey forms for collecting customer opinions. Critical for restaurants (post-meal feedback), hotels (service quality), events (attendee experience).

#### Market Context
- Replace paper comment cards
- More hygienic than tablets
- Integrates with existing tools (Google Forms, Typeform)
- Can also be standalone Gudbro forms

#### API Endpoint
```
POST /qr/feedback
```

#### Request Parameters

```typescript
interface FeedbackQRPayload {
  // Form source (one required)
  formUrl?: string;          // Google Forms, Typeform, etc.
  formType?: 'google' | 'typeform' | 'microsoft' | 'jotform' | 'gudbro';
  
  // Gudbro form (if not using external)
  gudbro Form?: {
    title: string;
    questions: FeedbackQuestion[];
    thankYouMessage?: string;
    collectEmail?: boolean;
    collectName?: boolean;
  };
  
  // Metadata
  title?: string;
  description?: string;
  category?: string;         // 'Restaurant', 'Hotel', 'Event'
  
  // Incentive
  incentive?: {
    type: 'discount' | 'points' | 'freebie';
    value: string;           // '10% off', '100 points', 'Free dessert'
    description: string;
  };
  
  // Standard QR options
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

interface FeedbackQuestion {
  type: 'rating' | 'text' | 'multiple-choice' | 'checkbox';
  question: string;
  required?: boolean;
  options?: string[];        // For multiple-choice/checkbox
  scale?: number;            // For rating (1-5, 1-10)
}
```

#### QR Data Format

**External form:**
```
https://forms.google.com/... (direct link)
https://typeform.com/to/... (direct link)
```

**Gudbro form:**
```
https://qr.gudbro.com/feedback/[QR_ID]
```

#### Validation Rules

```javascript
// Form URL validation
const validateFormUrl = (url, formType) => {
  const validDomains = {
    google: ['forms.google.com', 'docs.google.com/forms'],
    typeform: ['typeform.com'],
    microsoft: ['forms.office.com', 'forms.microsoft.com'],
    jotform: ['jotform.com']
  };
  
  if (formType && formType !== 'gudbro') {
    const domains = validDomains[formType];
    const isValid = domains.some(domain => url.includes(domain));
    
    if (!isValid) {
      throw new Error(`URL must be from ${domains.join(' or ')}`);
    }
  }
  
  return url;
};

// Gudbro form validation
const validateGudbro​Form = (form) => {
  if (!form.title || form.title.length < 3 || form.title.length > 100) {
    throw new Error('Form title must be 3-100 characters');
  }
  
  if (!form.questions || form.questions.length === 0) {
    throw new Error('At least one question required');
  }
  
  if (form.questions.length > 50) {
    throw new Error('Maximum 50 questions allowed');
  }
  
  // Validate each question
  form.questions.forEach((q, index) => {
    if (!q.question || q.question.length < 3) {
      throw new Error(`Question ${index + 1}: Text too short (min 3 chars)`);
    }
    
    if (!['rating', 'text', 'multiple-choice', 'checkbox'].includes(q.type)) {
      throw new Error(`Question ${index + 1}: Invalid type`);
    }
    
    if ((q.type === 'multiple-choice' || q.type === 'checkbox') && 
        (!q.options || q.options.length < 2)) {
      throw new Error(`Question ${index + 1}: At least 2 options required`);
    }
    
    if (q.type === 'rating' && (!q.scale || q.scale < 3 || q.scale > 10)) {
      throw new Error(`Question ${index + 1}: Rating scale must be 3-10`);
    }
  });
};

// At least one required
if (!formUrl && !gudbro Form) {
  throw new Error('Form URL or Gudbro form required');
}
```

#### Implementation

```javascript
const generateFeedbackQR = async ({ 
  formUrl, 
  formType, 
  gudbro Form,
  title,
  incentive
}) => {
  let finalUrl;
  
  if (gudbro Form) {
    // Create Gudbro form
    validateGudbro Form(gudbro Form);
    
    const formId = await createForm({
      ...gudbro Form,
      createdAt: new Date(),
      responses: 0
    });
    
    finalUrl = `https://qr.gudbro.com/feedback/${formId}`;
  } else {
    // External form
    validateFormUrl(formUrl, formType);
    finalUrl = formUrl;
  }
  
  // Create QR record
  const qrId = await createQRRecord({
    type: 'feedback',
    formUrl: finalUrl,
    formType: formType || 'gudbro',
    title,
    incentive
  });
  
  return finalUrl;
};

// Gudbro feedback form endpoint
app.get('/feedback/:formId', async (req, res) => {
  const { formId } = req.params;
  const formData = await getForm(formId);
  
  if (!formData) {
    return res.status(404).send('Form not found');
  }
  
  res.send(renderFeedbackForm(formData));
});

// Form submission endpoint
app.post('/feedback/:formId/submit', async (req, res) => {
  const { formId } = req.params;
  const { answers, email, name } = req.body;
  
  const form = await getForm(formId);
  
  // Validate answers
  const validation = validateAnswers(form.questions, answers);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors
    });
  }
  
  // Store response
  await storeResponse({
    formId,
    answers,
    email,
    name,
    submittedAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Increment response counter
  await incrementFormResponses(formId);
  
  // Return success
  res.json({
    success: true,
    message: form.thankYouMessage || 'Thank you for your feedback!',
    incentive: form.incentive
  });
});

// Feedback form renderer
const renderFeedbackForm = (form) => {
  const {
    title,
    questions,
    collectEmail,
    collectName,
    incentive
  } = form;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f3f4f6;
          padding: 20px;
          min-height: 100vh;
        }
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .form-header {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .form-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        ${incentive ? `
          .incentive-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
            border: 1px solid rgba(255,255,255,0.3);
          }
        ` : ''}
        .form-body {
          padding: 30px 20px;
        }
        .question-block {
          margin-bottom: 30px;
        }
        .question-label {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #1f2937;
        }
        .required {
          color: #ef4444;
        }
        input[type="text"],
        input[type="email"],
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        .rating-scale {
          display: flex;
          gap: 8px;
          justify-content: space-between;
        }
        .rating-button {
          flex: 1;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .rating-button:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .rating-button.selected {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .option-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .option-item:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .option-item.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .option-item input {
          margin-right: 12px;
        }
        .submit-button {
          width: 100%;
          padding: 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-button:hover {
          background: #2563eb;
        }
        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 5px;
        }
        .thank-you {
          text-align: center;
          padding: 60px 20px;
        }
        .thank-you-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .thank-you-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1f2937;
        }
        .thank-you-message {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <div class="form-header">
          <div class="form-title">${title}</div>
          ${incentive ? `
            <div class="incentive-badge">
              🎁 ${incentive.description}
            </div>
          ` : ''}
        </div>
        
        <form id="feedbackForm" class="form-body">
          ${collectName ? `
            <div class="question-block">
              <div class="question-label">Your Name</div>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name"
                required
              />
            </div>
          ` : ''}
          
          ${collectEmail ? `
            <div class="question-block">
              <div class="question-label">Email Address</div>
              <input 
                type="email" 
                name="email" 
                placeholder="your@email.com"
                required
              />
            </div>
          ` : ''}
          
          ${questions.map((q, index) => renderQuestion(q, index)).join('')}
          
          <button type="submit" class="submit-button">
            Submit Feedback
          </button>
        </form>
      </div>
      
      <script src="/js/feedback-form.js"></script>
    </body>
    </html>
  `;
};

// Question renderers
const renderQuestion = (question, index) => {
  const { type, question: text, required, options, scale } = question;
  
  switch (type) {
    case 'rating':
      return `
        <div class="question-block">
          <div class="question-label">
            ${text}
            ${required ? '<span class="required">*</span>' : ''}
          </div>
          <div class="rating-scale">
            ${Array.from({ length: scale }, (_, i) => i + 1).map(value => `
              <button 
                type="button" 
                class="rating-button" 
                data-question="${index}"
                data-value="${value}"
                onclick="selectRating(this)"
              >
                ${value}
              </button>
            `).join('')}
          </div>
          <input type="hidden" name="q${index}" ${required ? 'required' : ''} />
        </div>
      `;
      
    case 'text':
      return `
        <div class="question-block">
          <div class="question-label">
            ${text}
            ${required ? '<span class="required">*</span>' : ''}
          </div>
          <textarea 
            name="q${index}" 
            placeholder="Type your answer here..."
            ${required ? 'required' : ''}
          ></textarea>
        </div>
      `;
      
    case 'multiple-choice':
      return `
        <div class="question-block">
          <div class="question-label">
            ${text}
            ${required ? '<span class="required">*</span>' : ''}
          </div>
          <div class="options-list">
            ${options.map((option, optIndex) => `
              <label class="option-item">
                <input 
                  type="radio" 
                  name="q${index}" 
                  value="${option}"
                  ${required ? 'required' : ''}
                />
                ${option}
              </label>
            `).join('')}
          </div>
        </div>
      `;
      
    case 'checkbox':
      return `
        <div class="question-block">
          <div class="question-label">
            ${text}
            ${required ? '<span class="required">*</span>' : ''}
          </div>
          <div class="options-list">
            ${options.map((option, optIndex) => `
              <label class="option-item">
                <input 
                  type="checkbox" 
                  name="q${index}[]" 
                  value="${option}"
                />
                ${option}
              </label>
            `).join('')}
          </div>
        </div>
      `;
  }
};
```

#### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "feedback",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://qr.gudbro.com/feedback/abc123",
    "metadata": {
      "formType": "gudbro",
      "title": "How was your meal?",
      "questionsCount": 5,
      "responsesCount": 127,
      "hasIncentive": true,
      "incentive": {
        "type": "discount",
        "value": "10% off",
        "description": "Get 10% off your next visit"
      }
    }
  }
}
```

#### Testing Checklist

- [ ] External form URL validation
- [ ] Platform-specific URL validation
- [ ] Gudbro form creation works
- [ ] Question validation (all types)
- [ ] Required fields enforced
- [ ] Rating scale (1-10) works
- [ ] Multiple choice works
- [ ] Checkboxes work
- [ ] Text input works
- [ ] Email/name collection optional
- [ ] Form submission works
- [ ] Response storage accurate
- [ ] Thank you message displays
- [ ] Incentive shown after submit
- [ ] Mobile responsive
- [ ] Analytics tracking:
  - [ ] Form views
  - [ ] Submissions
  - [ ] Completion rate
  - [ ] Average ratings

#### Acceptance Criteria

- [ ] POST /qr/feedback endpoint created
- [ ] External form URL support (4+ platforms)
- [ ] Gudbro custom form builder
- [ ] 4 question types (rating/text/multiple-choice/checkbox)
- [ ] Required fields enforcement
- [ ] Email/name collection optional
- [ ] Incentive display feature
- [ ] Form submission API
- [ ] Response storage
- [ ] Thank you page
- [ ] Analytics per form
- [ ] Mobile-optimized
- [ ] Unit tests (15+ tests)
- [ ] Integration test with submission
- [ ] Real device testing

**Effort:** 2-3 hours

---

## Implementation Summary

### Total Effort Breakdown

| Priority | Type | Count | Total Hours |
|----------|------|-------|-------------|
| P0 | Asia Social | 5 | 22h |
| P1 | Standard | 8 | 22h |
| **TOTAL** | **All Types** | **13** | **44h (~6 days)** |

### Phase 1: Asia Social (P0) - 22h
1. VietQR Payment - 8h ✅ (documented)
2. Zalo Social - 4h ✅ (documented)
3. WeChat Pay - 6h ✅ (documented)
4. KakaoTalk - 2h ⭐ NEW
5. LINE - 2h ⭐ NEW

### Phase 2: Standard Types (P1) - 22h
6. App Store - 3h
7. PDF - 3h
8. Video - 2h
9. Audio/MP3 - 2h
10. Multi-URL (Advanced) - 4h
11. Business Page - 3h
12. Coupon - 3h
13. Feedback Form - 2h

---

## Database Schema Updates

Add to `qr_codes` table JSONB metadata field or create type-specific tables:

```sql
-- QR codes table update
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS qr_metadata JSONB;
CREATE INDEX IF NOT EXISTS idx_qr_metadata ON qr_codes USING GIN (qr_metadata);

-- Type-specific tables for complex types

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed', 'free-item'
  discount_value NUMERIC,
  currency VARCHAR(3),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_user INTEGER,
  min_purchase NUMERIC,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon redemptions
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Business pages
CREATE TABLE business_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  business_name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  tagline VARCHAR(200),
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  contact_info JSONB,
  address JSONB,
  hours JSONB,
  social_links JSONB,
  cta JSONB,
  theme JSONB,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback forms
CREATE TABLE feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  questions JSONB NOT NULL,
  collect_email BOOLEAN DEFAULT false,
  collect_name BOOLEAN DEFAULT false,
  thank_you_message TEXT,
  incentive JSONB,
  responses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback responses
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES feedback_forms(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  email VARCHAR(255),
  name VARCHAR(100),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Multi-URL routing rules
CREATE TABLE multi_url_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  label VARCHAR(100),
  conditions JSONB,
  destination_url TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX idx_business_pages_slug ON business_pages(slug);
CREATE INDEX idx_coupon_redemptions_user_id ON coupon_redemptions(user_id);
CREATE INDEX idx_feedback_responses_form_id ON feedback_responses(form_id);
CREATE INDEX idx_multi_url_rules_qr_id ON multi_url_rules(qr_id);
CREATE INDEX idx_multi_url_rules_priority ON multi_url_rules(priority DESC);
```

---

## API Routes Summary

All new routes in `packages/qr-engine/src/routes/qr.js`:

```javascript
// Asia Social
router.post('/qr/vietqr', createVietQR);
router.post('/qr/zalo', createZaloQR);
router.post('/qr/wechat-pay', createWeChatPayQR);
router.post('/qr/kakaotalk', createKakaoTalkQR);
router.post('/qr/line', createLINEQR);

// Standard Types
router.post('/qr/app-store', createAppStoreQR);
router.post('/qr/pdf', createPDFQR);
router.post('/qr/video', createVideoQR);
router.post('/qr/audio', createAudioQR);
router.post('/qr/multi-url', createMultiURLQR);
router.post('/qr/business-page', createBusinessPageQR);
router.post('/qr/coupon', createCouponQR);
router.post('/qr/feedback', createFeedbackQR);

// Viewer/Router endpoints
router.get('/app/:qrId', routeAppStore);
router.get('/pdf/:qrId', servePDF);
router.get('/video/:qrId', serveVideo);
router.get('/audio/:qrId', serveAudio);
router.get('/r/:qrId', routeMultiURL);
router.get('/biz/:qrId', serveBusinessPage);
router.get('/b/:slug', serveBusinessPageBySlug);
router.get('/coupon/:qrId', serveCoupon);
router.get('/c/:code', serveCouponByCode);
router.post('/redeem/:couponId', redeemCoupon);
router.get('/feedback/:formId', serveFeedbackForm);
router.post('/feedback/:formId/submit', submitFeedback);
```

---

## Testing Strategy

### Unit Tests (150+ total)

**Per QR type (average 10-15 tests):**
- Request validation (valid/invalid inputs)
- URL generation
- Data format correctness
- Edge cases
- Error handling

### Integration Tests (26 total)

**One per QR type:**
- End-to-end generation
- Database storage
- QR code scannability
- Analytics tracking

**Complex types (additional tests):**
- Multi-URL: Rule evaluation
- Coupon: Redemption flow
- Business Page: Edit flow
- Feedback: Submission flow

### Real Device Tests

**Critical paths:**
- VietQR scans in banking apps
- Zalo/KakaoTalk/LINE open correct apps
- App Store smart routing (iOS/Android)
- Video/audio players (iOS Safari, Android Chrome)
- Business page responsive design
- Coupon copy-to-clipboard
- Feedback form submission

---

## Success Metrics

After implementation:

- [ ] All 13 QR types implemented
- [ ] 150+ unit tests passing
- [ ] 26+ integration tests passing
- [ ] Real device tests passed
- [ ] API documentation complete
- [ ] Master Plan updated
- [ ] Feature parity with QR Tiger achieved
- [ ] Ready for AI QR Creator integration

---

## Competitive Position After Completion

| Feature | QR Tiger | Flowcode | iCheckQR | Gudbro |
|---------|----------|----------|----------|--------|
| **Asia Social** |
| VietQR | âŒ | âŒ | âŒ | âœ… |
| Zalo | âŒ | âŒ | âŒ | âœ… |
| WeChat Pay | â" | â" | âŒ | âœ… |
| KakaoTalk | âŒ | âŒ | âŒ | âœ… |
| LINE | âŒ | âŒ | âŒ | âœ… |
| **Standard Types** |
| App Store | âœ… | âœ… | âŒ | âœ… |
| PDF | âœ… | âœ… | âœ… | âœ… |
| Video | âœ… | âœ… | âœ… | âœ… |
| Audio/MP3 | âœ… | âœ… | âŒ | âœ… |
| Multi-URL | âœ… ($99) | âœ… ($250) | âŒ | âœ… |
| Business Page | âœ… | âœ… | âœ… | âœ… |
| Coupon | âœ… ($99) | âœ… | âŒ | âœ… |
| Feedback | âœ… | âœ… | âœ… | âœ… |
| **Total Types** | ~25 | ~20 | ~12 | **25+** |

**Result:** Feature parity + Asia dominance = market leadership position

---

## Next Steps

1. **Review this document** - Ensure all specs are correct
2. **Implement Phase 1** (Asia Social) - 22h
3. **Implement Phase 2** (Standard) - 22h
4. **Testing** - 10h
5. **Documentation** - 4h
6. **Update Master Plan** - 1h
7. **Launch** - Ready for AI QR Creator

**Total:** ~59 hours (~7-8 days)

---

**END OF REQUIREMENTS**

Ready for Claude Code implementation.
