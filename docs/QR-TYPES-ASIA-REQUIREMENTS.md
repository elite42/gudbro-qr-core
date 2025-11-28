# QR Types - Asia Market Requirements

**Version:** 1.0  
**Date:** 2025-11-02  
**For:** QR Engine - Asia Market Expansion  
**Priority:** P0 (Critical for Vietnam market)

---

## Overview

Implement Asia-specific QR code types essential for Vietnam and regional markets. Based on market research showing payment QR dominance in Asia and local social platform usage.

**Target Markets:**
- 🇻🇳 Vietnam (VietQR + Zalo - critical)
- 🇨🇳 China (WeChat Pay - tourist market)
- 🇰🇷 Korea (KakaoTalk - future)
- 🇹🇭 Thailand (LINE - future)

---

## 1. VietQR Payment QR Code 🔥 PRIORITY 0

### Purpose
National payment standard for Vietnam. Enables instant bank transfers via QR code using NAPAS infrastructure. Critical for F&B businesses accepting cashless payments.

### Market Context
- Launched 2021 by NAPAS (National Payment Corporation of Vietnam)
- Supported by all major banks: Vietcombank, BIDV, VietinBank, Agribank
- Standard format ensures interoperability across all Vietnamese banks
- No competitor (QR Tiger, Flowcode) supports this

### API Endpoint
```
POST /qr/vietqr
```

### Request Parameters

```typescript
interface VietQRPayload {
  // Bank Information (required)
  bankCode: string;           // Bank BIN code (e.g., 'VCB', 'BIDV', 'VTB', 'ARB')
  accountNumber: string;      // Bank account number (6-20 digits)
  accountName: string;        // Account holder name
  
  // Payment Details (optional)
  amount?: number;            // Payment amount in VND (if fixed)
  description?: string;       // Payment description/reference (max 255 chars)
  
  // QR Metadata (optional)
  title?: string;
  qrDescription?: string;     // Different from payment description
  
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

### Bank Codes (Major Banks)
```javascript
const VIETNAM_BANKS = {
  VCB: 'Vietcombank',
  BIDV: 'BIDV',
  VTB: 'VietinBank', 
  ARB: 'Agribank',
  TCB: 'Techcombank',
  MB: 'MB Bank',
  ACB: 'ACB',
  VPB: 'VPBank',
  SHB: 'SHB',
  SCB: 'SCB',
  // Add more as needed
};
```

### QR Data Format

**VietQR Standard (EMVCo-based):**
```
00020101021238570010A00000072701270006970422011499999999999990208QRIBFTTC53037045802VN62150811Invoice12363046017
```

**Field breakdown:**
- Payload Format Indicator: 00020101
- Point of Initiation: 0102
- Merchant Account: 38...
  - Global ID: 0010A000000727
  - Payment Network: 01270006970422 (NAPAS)
  - Beneficiary ID: 0114[account_number]
  - Service Code: 0208QRIBFTTC
- Transaction Currency: 5303704 (VND)
- Transaction Amount: 5802VN (if specified)
- Additional Data: 6215...
- CRC: 6304

**Simplified format for implementation:**
```
https://img.vietqr.io/image/[BANK_CODE]-[ACCOUNT_NUMBER]-[TEMPLATE].jpg?amount=[AMOUNT]&addInfo=[DESCRIPTION]
```

### Validation Rules

```javascript
// Bank code validation
if (!VIETNAM_BANKS[bankCode]) {
  throw new Error('Invalid bank code');
}

// Account number validation
if (!/^\d{6,20}$/.test(accountNumber)) {
  throw new Error('Account number must be 6-20 digits');
}

// Account name validation
if (accountName.length < 2 || accountName.length > 50) {
  throw new Error('Account name must be 2-50 characters');
}

// Amount validation (optional)
if (amount !== undefined) {
  if (amount <= 0 || amount > 500000000) { // Max 500M VND
    throw new Error('Amount must be between 1 and 500,000,000 VND');
  }
}

// Description validation (optional)
if (description && description.length > 255) {
  throw new Error('Description max 255 characters');
}
```

### Implementation Options

**Option A: VietQR.io API (Recommended)**
```javascript
const generateVietQR = async ({ bankCode, accountNumber, accountName, amount, description }) => {
  const template = 'compact'; // or 'print', 'qr_only'
  const url = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg`;
  
  const params = new URLSearchParams();
  if (amount) params.append('amount', amount);
  if (description) params.append('addInfo', description);
  params.append('accountName', accountName);
  
  return `${url}?${params.toString()}`;
};
```

**Option B: EMVCo Standard (Advanced)**
Implement full EMVCo QR format for offline usage (no API dependency).

### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "vietqr",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "qrUrl": "https://img.vietqr.io/...",
    "metadata": {
      "bankCode": "VCB",
      "bankName": "Vietcombank",
      "accountNumber": "1234567890",
      "accountName": "NGUYEN VAN A",
      "amount": 100000,
      "description": "Thanh toan don hang #123"
    }
  }
}
```

### Testing Checklist

- [ ] Valid bank code generates QR
- [ ] Invalid bank code returns error
- [ ] Account number validation works
- [ ] Amount is optional
- [ ] Description is optional
- [ ] QR scans correctly in Vietnamese banking apps:
  - [ ] Vietcombank
  - [ ] BIDV
  - [ ] Momo
  - [ ] ZaloPay
- [ ] Unicode Vietnamese characters handled correctly
- [ ] Special characters in description escaped properly

### Acceptance Criteria

- [ ] POST /qr/vietqr endpoint created
- [ ] All validation rules implemented
- [ ] Supports all major Vietnamese banks (10+)
- [ ] QR code scans in real banking apps
- [ ] Error messages clear and helpful
- [ ] Database stores VietQR metadata
- [ ] Unit tests cover all validations (10+ tests)
- [ ] Integration test with actual QR scan

---

## 2. Zalo Social QR Code 🇻🇳 PRIORITY 0

### Purpose
Zalo is Vietnam's #1 messaging app (74+ million users). Essential for Vietnamese businesses to connect with local customers.

### Market Context
- Zalo > WhatsApp in Vietnam
- Used for business communication, marketing, customer support
- QR codes for adding friends/following business accounts
- No competitor supports Zalo QR

### API Endpoint
```
POST /qr/zalo
```

### Request Parameters

```typescript
interface ZaloQRPayload {
  // Zalo identifier (one required)
  phoneNumber?: string;       // Phone number (with country code)
  zaloId?: string;           // Zalo ID (if known)
  
  // Metadata
  displayName?: string;      // Display name for the contact
  message?: string;          // Pre-filled message (optional)
  
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

### QR Data Format

**Zalo deep link format:**
```
https://zalo.me/[PHONE_NUMBER]
https://zalo.me/[ZALO_ID]
```

**With pre-filled message:**
```
https://zalo.me/[IDENTIFIER]?msg=[ENCODED_MESSAGE]
```

**Examples:**
```
https://zalo.me/84912345678
https://zalo.me/0912345678
https://zalo.me/zaloOAID?msg=Xin%20ch%C3%A0o
```

### Validation Rules

```javascript
// Phone number validation (Vietnam format)
const validateVietnamesePhone = (phone) => {
  // Remove spaces, dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check formats:
  // 84xxxxxxxxx (country code)
  // 0xxxxxxxxx (local format)
  if (!/^(84|0)(3|5|7|8|9)\d{8}$/.test(cleaned)) {
    throw new Error('Invalid Vietnamese phone number');
  }
  
  return cleaned;
};

// Zalo ID validation
const validateZaloId = (id) => {
  // Alphanumeric, 6-30 chars
  if (!/^[a-zA-Z0-9_]{6,30}$/.test(id)) {
    throw new Error('Invalid Zalo ID format');
  }
  return id;
};

// Message validation
if (message && message.length > 500) {
  throw new Error('Message max 500 characters');
}
```

### Implementation

```javascript
const generateZaloQR = ({ phoneNumber, zaloId, message }) => {
  let identifier;
  
  if (phoneNumber) {
    identifier = validateVietnamesePhone(phoneNumber);
    // Convert to international format if needed
    if (identifier.startsWith('0')) {
      identifier = '84' + identifier.substring(1);
    }
  } else if (zaloId) {
    identifier = validateZaloId(zaloId);
  } else {
    throw new Error('Phone number or Zalo ID required');
  }
  
  let url = `https://zalo.me/${identifier}`;
  
  if (message) {
    const encoded = encodeURIComponent(message);
    url += `?msg=${encoded}`;
  }
  
  return url;
};
```

### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "zalo",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "destinationUrl": "https://zalo.me/84912345678",
    "metadata": {
      "phoneNumber": "0912345678",
      "displayName": "Gudbro Restaurant",
      "message": "Xin chào, tôi muốn đặt bàn"
    }
  }
}
```

### Testing Checklist

- [ ] Valid Vietnamese phone generates QR
- [ ] Phone validation rejects invalid formats
- [ ] Zalo ID validation works
- [ ] International format (84xxx) handled
- [ ] Local format (0xxx) converted correctly
- [ ] Message parameter optional
- [ ] Message URL-encoded correctly
- [ ] Vietnamese characters in message work
- [ ] QR scans and opens Zalo app:
  - [ ] iOS
  - [ ] Android
- [ ] Pre-filled message appears in chat

### Acceptance Criteria

- [ ] POST /qr/zalo endpoint created
- [ ] Phone number validation (VN format)
- [ ] Zalo ID support
- [ ] Message pre-fill optional
- [ ] QR opens Zalo app on mobile
- [ ] Error messages in English
- [ ] Unit tests (8+ tests)
- [ ] Real device testing (iOS + Android)

---

## 3. WeChat Pay QR Code 🇨🇳 PRIORITY 1

### Purpose
Enable Chinese tourists to pay at Vietnamese businesses using WeChat Pay. Major revenue opportunity for tourism-dependent F&B.

### Market Context
- 1+ billion WeChat users globally
- Primary payment method for Chinese tourists
- Different from WeChat social (this is payment-focused)
- Requires merchant WeChat Pay account

### API Endpoint
```
POST /qr/wechat-pay
```

### Request Parameters

```typescript
interface WeChatPayQRPayload {
  // Merchant Information (required)
  merchantId: string;         // WeChat Pay merchant ID
  
  // Payment Details
  amount?: number;            // Amount in CNY (optional)
  currency?: 'CNY' | 'VND';  // Default: CNY
  description?: string;       // Payment description
  orderId?: string;          // Merchant order ID
  
  // QR Metadata
  title?: string;
  qrDescription?: string;
  
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

### QR Data Format

**WeChat Pay deep link:**
```
weixin://wxpay/bizpayurl?pr=[PAYMENT_CODE]
```

**Note:** Actual implementation requires WeChat Pay merchant API integration.

### Implementation Notes

**Phase 1 (Basic):**
```javascript
// Generate static merchant QR
// Customer scans and enters amount manually
const generateWeChatPayQR = ({ merchantId }) => {
  // WeChat merchant collection QR format
  return `weixin://wxpay/bizpayurl/up?appid=[APP_ID]&mchid=${merchantId}`;
};
```

**Phase 2 (Advanced - requires API):**
```javascript
// Dynamic amount QR via WeChat Pay API
// Requires:
// - WeChat Pay merchant account
// - API credentials
// - Backend integration with WeChat servers
```

### Validation Rules

```javascript
// Merchant ID validation
if (!/^\d{10}$/.test(merchantId)) {
  throw new Error('Invalid WeChat Pay merchant ID (must be 10 digits)');
}

// Amount validation
if (amount !== undefined) {
  if (amount <= 0 || amount > 1000000) { // Max 1M CNY
    throw new Error('Amount must be between 0.01 and 1,000,000');
  }
}

// Currency validation
if (!['CNY', 'VND'].includes(currency)) {
  throw new Error('Currency must be CNY or VND');
}
```

### Response Format

```json
{
  "success": true,
  "qr": {
    "id": "uuid",
    "type": "wechat-pay",
    "qrData": "base64_image_data",
    "qrSvg": "<svg>...</svg>",
    "metadata": {
      "merchantId": "1234567890",
      "amount": 100,
      "currency": "CNY",
      "description": "Restaurant payment"
    },
    "note": "Customer enters amount in WeChat app"
  }
}
```

### Testing Checklist

- [ ] Valid merchant ID generates QR
- [ ] Merchant ID validation works
- [ ] Amount is optional
- [ ] Currency defaults to CNY
- [ ] QR scans in WeChat app
- [ ] Payment flow works (if merchant account available)
- [ ] Handles both CNY and VND
- [ ] Error messages clear

### Acceptance Criteria

- [ ] POST /qr/wechat-pay endpoint created
- [ ] Merchant ID validation
- [ ] Optional amount support
- [ ] Currency selection (CNY/VND)
- [ ] QR opens WeChat Pay
- [ ] Documentation for merchant setup
- [ ] Unit tests (6+ tests)
- [ ] Integration test (if merchant available)

**Note:** Full WeChat Pay integration requires merchant account and API credentials. Phase 1 can implement static merchant QR codes that allow customers to scan and enter amounts manually.

---

## 4. Social Platform Extensions

### 4.1 Update Existing Social Endpoint

Current implementation supports 8 platforms. Verify these work:

```javascript
// In routes/qr.js - POST /qr/social
const SUPPORTED_PLATFORMS = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  twitter: 'https://twitter.com/',
  x: 'https://x.com/',
  linkedin: 'https://linkedin.com/in/',
  tiktok: 'https://tiktok.com/@',
  youtube: 'https://youtube.com/@',
  github: 'https://github.com/'
};
```

### 4.2 Add Missing Asia Platforms

Extend to include:

```javascript
const ASIA_PLATFORMS = {
  ...SUPPORTED_PLATFORMS,
  
  // Already implemented separately
  zalo: 'https://zalo.me/',
  
  // Future additions
  wechat: 'https://u.wechat.com/',      // WeChat social profile
  line: 'https://line.me/ti/p/',         // LINE Thailand/Taiwan
  kakaotalk: 'https://open.kakao.com/',  // KakaoTalk Korea
  
  // Regional
  xiaohongshu: 'https://xiaohongshu.com/user/profile/', // RED China
  weibo: 'https://weibo.com/',           // Weibo China
};
```

**Note:** Implement LINE and KakaoTalk as Priority 2 after VietQR/Zalo/WeChat Pay.

---

## Implementation Plan

### Phase 1: Critical (This Sprint)
1. **VietQR Payment** - 8h
   - API endpoint
   - Validation
   - VietQR.io integration or EMVCo format
   - Tests (10+)
   
2. **Zalo Social** - 4h
   - API endpoint
   - Phone/ID validation
   - Message pre-fill
   - Tests (8+)

3. **WeChat Pay** - 6h
   - Basic merchant QR
   - Validation
   - Documentation
   - Tests (6+)

**Total:** ~18-20 hours

### Phase 2: Regional Expansion (Next Sprint)
4. LINE Social - 3h
5. KakaoTalk Social - 3h
6. WeChat Pay API Integration - 8h (if merchant account available)

---

## Testing Strategy

### Unit Tests
Each type needs:
- Valid input generates correct format
- Invalid input returns proper errors
- Edge cases handled
- Special characters escaped
- Optional parameters work

### Integration Tests
- QR code generates successfully
- Database stores metadata
- Analytics tracking works

### Real Device Tests
**Critical:**
- [ ] VietQR scans in Vietcombank app
- [ ] VietQR scans in Momo
- [ ] Zalo QR opens Zalo app (iOS/Android)
- [ ] WeChat Pay QR opens WeChat

### Performance Tests
- Generation time < 500ms
- Handle concurrent requests
- Validation doesn't slow down generation

---

## Database Schema Updates

Add to `qr_codes` table or create `qr_metadata` JSONB:

```sql
-- VietQR metadata
{
  "type": "vietqr",
  "bankCode": "VCB",
  "accountNumber": "1234567890",
  "amount": 100000,
  "description": "Payment description"
}

-- Zalo metadata
{
  "type": "zalo",
  "phoneNumber": "84912345678",
  "displayName": "Business Name",
  "message": "Pre-filled message"
}

-- WeChat Pay metadata
{
  "type": "wechat-pay",
  "merchantId": "1234567890",
  "amount": 100,
  "currency": "CNY"
}
```

---

## Documentation Updates

Update after implementation:

1. **API Docs** (`/docs/api/`)
   - Add VietQR endpoint docs
   - Add Zalo endpoint docs
   - Add WeChat Pay endpoint docs

2. **README.md**
   - Add Asia-specific QR types section
   - Merchant setup guides (WeChat Pay)

3. **Master Plan**
   - Update module status
   - Add to competitive advantages
   - Update decisions log

---

## Competitive Advantage

After implementation:

| Feature | QR Tiger | Flowcode | Gudbro |
|---------|----------|----------|--------|
| VietQR Payment | ❌ | ❌ | ✅ **ÚNICO** |
| Zalo Social | ❌ | ❌ | ✅ **ÚNICO** |
| WeChat Pay | ❓ | ❓ | ✅ |
| Vietnam Focus | ❌ | ❌ | ✅ |

**Result:** Dominant position in Vietnam market.

---

## Success Metrics

- [ ] All 3 types implemented and tested
- [ ] 24+ unit tests passing
- [ ] Real device scans successful
- [ ] API documented
- [ ] Competitive advantage validated
- [ ] Ready for customer demos

---

**End of Requirements**

Ready for Claude Code implementation.
