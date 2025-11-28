# Gudbro QR Engine API Documentation

Complete API documentation for the Gudbro QR Engine - supporting **26+ QR code types** for restaurants, businesses, and digital services.

## 📚 Documentation Access

### OpenAPI/Swagger UI

View interactive API documentation:

```bash
# Install swagger-ui-express
npm install swagger-ui-express yamljs

# Add to your server.js
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Access at: `http://localhost:3000/api-docs`

### Alternative Viewers

1. **Swagger Editor**: https://editor.swagger.io (paste `docs/openapi.yaml`)
2. **Redoc**: More readable documentation format
3. **Postman**: Import OpenAPI file for testing

## 🎯 Quick Start Examples

### Asia Payment QR

#### VietQR (Vietnam)
```bash
curl -X POST http://localhost:3000/api/qr/vietqr \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "VCB",
    "accountNumber": "0123456789",
    "accountName": "NGUYEN VAN A",
    "amount": 500000,
    "description": "Table 5 - Pho"
  }'
```

#### GCash (Philippines)
```bash
curl -X POST http://localhost:3000/api/qr/gcash \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "09171234567",
    "amount": 500,
    "reference": "Order 12345"
  }'
```

#### PromptPay (Thailand)
```bash
curl -X POST http://localhost:3000/api/qr/promptpay \
  -H "Content-Type: application/json" \
  -d '{
    "promptPayId": "0812345678",
    "amount": 500,
    "reference": "Bill#123"
  }'
```

### Standard QR

#### App Store (Dual Platform)
```bash
curl -X POST http://localhost:3000/api/qr/appstore \
  -H "Content-Type: application/json" \
  -d '{
    "appleAppId": "123456789",
    "googlePackageName": "com.gudbro.app",
    "appName": "Gudbro Restaurant",
    "platform": "dual"
  }'
```

#### Multi-URL (Language Selection)
```bash
curl -X POST http://localhost:3000/api/qr/multiurl \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      {
        "url": "https://restaurant.com/menu-en",
        "label": "English Menu",
        "priority": 1
      },
      {
        "url": "https://restaurant.com/menu-vi",
        "label": "Vietnamese Menu",
        "priority": 2
      }
    ],
    "title": "Select Your Language",
    "routingStrategy": "choice"
  }'
```

#### Coupon (Discount Code)
```bash
curl -X POST http://localhost:3000/api/qr/coupon \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "SAVE20",
    "title": "20% Off Happy Hour",
    "discountType": "percentage",
    "discountValue": 20,
    "validFrom": "2024-01-01T17:00:00Z",
    "validUntil": "2024-12-31T19:00:00Z",
    "minimumPurchase": 50000,
    "terms": ["Valid Mon-Fri 5pm-7pm", "Cannot combine with other offers"],
    "businessName": "Gudbro Restaurant"
  }'
```

### Essential QR

#### WiFi
```bash
curl -X POST http://localhost:3000/api/qr/wifi \
  -H "Content-Type: application/json" \
  -d '{
    "ssid": "Gudbro-WiFi",
    "password": "password123",
    "encryption": "WPA"
  }'
```

#### Business Card (vCard)
```bash
curl -X POST http://localhost:3000/api/qr/vcard \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-123-4567",
    "email": "john@example.com",
    "company": "Gudbro Inc",
    "title": "Manager"
  }'
```

## 📊 API Categories

### 1. Asia Payment QR (13 types)
Perfect for restaurants and businesses accepting local payment methods:

| Country/Region | Endpoint | Payment Method |
|---|---|---|
| 🇻🇳 Vietnam | `/api/qr/vietqr` | Bank transfers (VietQR) |
| 🇻🇳 Vietnam | `/api/qr/zalo` | Zalo messaging/chat |
| 🇵🇭 Philippines | `/api/qr/gcash` | GCash mobile wallet |
| 🇵🇭 Philippines | `/api/qr/paymaya` | PayMaya payments |
| 🇨🇳 China | `/api/qr/alipay` | Alipay |
| 🇨🇳 China | `/api/qr/wechat` | WeChat Pay |
| 🇹🇭 Thailand | `/api/qr/promptpay` | PromptPay |
| 🇹🇭 Thailand | `/api/qr/truemoney` | TrueMoney wallet |
| 🇯🇵🇹🇭🇹🇼 Multi | `/api/qr/line` | LINE messaging/pay |
| 🇰🇷 South Korea | `/api/qr/kakaotalk` | KakaoTalk/KakaoPay |
| 🇸🇬 Singapore | `/api/qr/paynow` | PayNow |
| 🌏 SEA | `/api/qr/grabpay` | GrabPay |
| 🌏 SEA | `/api/qr/shopeepay` | ShopeePay |

### 2. Standard QR (8 types)
Universal QR codes for any business:

| Type | Endpoint | Use Case |
|---|---|---|
| 📱 App Store | `/api/qr/appstore` | App downloads (iOS & Android) |
| 📄 PDF | `/api/qr/pdf` | Menus, brochures, documents |
| 🎥 Video | `/api/qr/video` | YouTube, Vimeo, social videos |
| 🎵 Audio | `/api/qr/audio` | Spotify, Apple Music playlists |
| 🔗 Multi-URL | `/api/qr/multiurl` | Smart routing, multi-language |
| 💼 Business Page | `/api/qr/businesspage` | Complete business info |
| 🎟️ Coupon | `/api/qr/coupon` | Discounts, promotions |
| 📝 Feedback | `/api/qr/feedbackform` | Customer surveys, reviews |

### 3. Essential QR (6 types)
Basic utility QR codes:

| Type | Endpoint | Use Case |
|---|---|---|
| 📶 WiFi | `/api/qr/wifi` | Network connection |
| 👤 vCard | `/api/qr/vcard` | Contact information |
| ✉️ Email | `/api/qr/email` | Send email |
| 💬 SMS | `/api/qr/sms` | Send SMS |
| 📅 Event | `/api/qr/event` | Calendar events |
| 📱 Social | `/api/qr/social` | Social media profiles |

## 🎨 Common Parameters

All endpoints support these optional styling parameters:

```json
{
  // ... endpoint-specific data ...

  // QR Styling (optional)
  "errorCorrectionLevel": "M",  // L, M, Q, H
  "width": 300,                  // QR size in pixels
  "color": {
    "dark": "#000000",
    "light": "#ffffff"
  },
  "margin": 4,                   // Border margin
  "style": "dots",               // dots, squares, rounded
  "logo": "https://example.com/logo.png"  // Center logo
}
```

## 📥 Response Format

All endpoints return a consistent response:

```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KG...",  // Base64 QR image
  "data": {
    // QR metadata (varies by type)
  },
  "note": "Implementation notes or warnings"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation error",
  "details": "Missing required field: accountNumber"
}
```

## 🔒 Authentication (Future)

API key authentication will be added:

```bash
curl -X POST http://localhost:3000/api/qr/vietqr \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## 📊 Rate Limits (Future)

- **Free Tier**: 100 requests/day
- **Basic**: 1,000 requests/day
- **Pro**: 10,000 requests/day
- **Enterprise**: Custom limits

## 🧪 Testing

### Using Postman

1. Import `docs/openapi.yaml` into Postman
2. All endpoints auto-configured with examples
3. Test directly from Postman interface

### Using cURL

See examples above for each QR type.

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

async function generateVietQR() {
  try {
    const response = await axios.post('http://localhost:3000/api/qr/vietqr', {
      bankCode: 'VCB',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN A',
      amount: 500000,
      description: 'Payment for Table 5'
    });

    console.log('QR Generated:', response.data.qr);

    // Save to file
    const base64Data = response.data.qr.replace(/^data:image\/png;base64,/, '');
    require('fs').writeFileSync('vietqr.png', base64Data, 'base64');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generateVietQR();
```

### Using Python

```python
import requests
import base64

def generate_vietqr():
    url = 'http://localhost:3000/api/qr/vietqr'
    data = {
        'bankCode': 'VCB',
        'accountNumber': '0123456789',
        'accountName': 'NGUYEN VAN A',
        'amount': 500000,
        'description': 'Payment for Table 5'
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        result = response.json()

        # Extract base64 image
        qr_data = result['qr'].split(',')[1]

        # Save to file
        with open('vietqr.png', 'wb') as f:
            f.write(base64.b64decode(qr_data))

        print('QR code saved as vietqr.png')
    else:
        print('Error:', response.json())

generate_vietqr()
```

## 🌟 Best Practices

### 1. Error Correction Level
- **L** (7%): Simple URLs, plain backgrounds
- **M** (15%): Default, good balance
- **Q** (25%): Logos, artistic QR
- **H** (30%): Heavy customization, must-scan

### 2. QR Size
- **Minimum**: 200x200px for mobile screens
- **Recommended**: 300x300px for print
- **Large Format**: 500x500px+ for posters

### 3. Testing
- Always test QR codes with multiple devices
- Test in different lighting conditions
- Verify QR works on printed materials

### 4. Payment QR
- Always validate amounts before generating
- Include clear payment descriptions
- Test with actual payment apps

### 5. Multi-language Support
- Use Multi-URL QR for language selection
- Provide clear labels for each language
- Test with native speakers

## 🚀 Integration Examples

### Restaurant Menu System

```javascript
// Generate QR for multi-language menu
const menuQR = await generateMultiURLQR({
  urls: [
    { url: 'https://restaurant.com/menu-en', label: 'English' },
    { url: 'https://restaurant.com/menu-vi', label: 'Tiếng Việt' },
    { url: 'https://restaurant.com/menu-zh', label: '中文' }
  ],
  title: 'Select Menu Language',
  routingStrategy: 'choice'
});

// Print QR on table stands
printQR(menuQR, { size: '10cm' });
```

### Payment Collection

```javascript
// Generate VietQR for table payment
const paymentQR = await generateVietQR({
  bankCode: 'VCB',
  accountNumber: restaurantAccount,
  accountName: restaurantName,
  amount: calculateTotal(tableOrder),
  description: `Table ${tableNumber} - Bill #${billId}`
});

// Display on bill
displayQROnReceipt(paymentQR);
```

### Customer Feedback

```javascript
// Generate feedback form QR
const feedbackQR = await generateFeedbackFormQR({
  formTitle: 'How was your meal?',
  formUrl: 'https://forms.google.com/restaurant-feedback',
  businessName: 'Gudbro Restaurant'
});

// Print on receipts
addQRToReceipt(feedbackQR, 'We value your feedback!');
```

## 📞 Support

- **Documentation**: https://docs.gudbro.com
- **API Issues**: https://github.com/gudbro/qr-engine/issues
- **Email**: api-support@gudbro.com

## 🔄 Changelog

### v1.0.0 (Week 9 Complete)
- ✅ 13 Asia Payment QR types
- ✅ 8 Standard QR types
- ✅ 6 Essential QR types
- ✅ Complete OpenAPI documentation
- ✅ 697 unit tests passing

### Coming in v2.0
- 🔄 QR Rework Service (decode & beautify existing QR)
- 🔄 Batch QR generation
- 🔄 API authentication
- 🔄 Usage analytics
- 🔄 Custom landing pages

---

**Made with ❤️ by Gudbro** | Powered by Node.js, Express, qrcode
