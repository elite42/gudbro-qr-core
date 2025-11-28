/**
 * Mock QR Engine API Server for Frontend Testing
 * Runs on port 3001 and returns mock QR code responses
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Generate a simple mock QR code image (base64 SVG)
function generateMockQRImage(type, data) {
  const content = JSON.stringify(data).substring(0, 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="white"/>
    <rect x="20" y="20" width="160" height="160" fill="black" opacity="0.8"/>
    <rect x="30" y="30" width="140" height="140" fill="white"/>
    <text x="100" y="90" text-anchor="middle" font-family="Arial" font-size="14" fill="black">MOCK QR</text>
    <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="12" fill="gray">${type.toUpperCase()}</text>
    <text x="100" y="130" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">${content}...</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Generate mock QR response
function createMockQRResponse(type, data) {
  const id = randomUUID();
  return {
    id,
    user_id: 'mock-user-123',
    type,
    data,
    qr_image: generateMockQRImage(type, data),
    short_url: `http://qr.mock/${id.substring(0, 8)}`,
    created_at: new Date().toISOString(),
  };
}

// Essential QR Types
app.post('/api/qr/sms', (req, res) => {
  console.log('📱 POST /api/qr/sms', req.body);
  res.json(createMockQRResponse('sms', req.body));
});

app.post('/api/qr/email', (req, res) => {
  console.log('📧 POST /api/qr/email', req.body);
  res.json(createMockQRResponse('email', req.body));
});

app.post('/api/qr/wifi', (req, res) => {
  console.log('📶 POST /api/qr/wifi', req.body);
  res.json(createMockQRResponse('wifi', req.body));
});

app.post('/api/qr/social', (req, res) => {
  console.log('👥 POST /api/qr/social', req.body);
  res.json(createMockQRResponse('social', req.body));
});

app.post('/api/qr/event', (req, res) => {
  console.log('📅 POST /api/qr/event', req.body);
  res.json(createMockQRResponse('event', req.body));
});

app.post('/api/qr/vcard', (req, res) => {
  console.log('👤 POST /api/qr/vcard', req.body);
  res.json(createMockQRResponse('vcard', req.body));
});

// Asia-Pacific QR Types
app.post('/api/qr/zalo', (req, res) => {
  console.log('🇻🇳 POST /api/qr/zalo', req.body);
  res.json(createMockQRResponse('zalo', req.body));
});

app.post('/api/qr/kakaotalk', (req, res) => {
  console.log('🇰🇷 POST /api/qr/kakaotalk', req.body);
  res.json(createMockQRResponse('kakaotalk', req.body));
});

app.post('/api/qr/line', (req, res) => {
  console.log('🇹🇭 POST /api/qr/line', req.body);
  res.json(createMockQRResponse('line', req.body));
});

app.post('/api/qr/wechat-pay', (req, res) => {
  console.log('🇨🇳 POST /api/qr/wechat-pay', req.body);
  res.json(createMockQRResponse('wechat-pay', req.body));
});

app.post('/api/qr/vietqr', (req, res) => {
  console.log('🇻🇳 POST /api/qr/vietqr', req.body);
  res.json(createMockQRResponse('vietqr', req.body));
});

app.get('/api/qr/vietqr/banks', (req, res) => {
  console.log('🏦 GET /api/qr/vietqr/banks');
  res.json({
    banks: [
      { code: 'VCB', name: 'Vietcombank', shortName: 'VCB', bin: '970436', logo: 'https://cdn.vietqr.io/img/VCB.png' },
      { code: 'BIDV', name: 'BIDV', shortName: 'BIDV', bin: '970418', logo: 'https://cdn.vietqr.io/img/BIDV.png' },
      { code: 'ICB', name: 'VietinBank', shortName: 'VietinBank', bin: '970415', logo: 'https://cdn.vietqr.io/img/ICB.png' },
      { code: 'VBA', name: 'Agribank', shortName: 'Agribank', bin: '970405', logo: 'https://cdn.vietqr.io/img/VBA.png' },
      { code: 'TCB', name: 'Techcombank', shortName: 'TCB', bin: '970407', logo: 'https://cdn.vietqr.io/img/TCB.png' },
      { code: 'MB', name: 'MB Bank', shortName: 'MB', bin: '970422', logo: 'https://cdn.vietqr.io/img/MB.png' },
      { code: 'VPB', name: 'VPBank', shortName: 'VPBank', bin: '970432', logo: 'https://cdn.vietqr.io/img/VPB.png' },
      { code: 'ACB', name: 'ACB', shortName: 'ACB', bin: '970416', logo: 'https://cdn.vietqr.io/img/ACB.png' },
      { code: 'VIB', name: 'VIB', shortName: 'VIB', bin: '970441', logo: 'https://cdn.vietqr.io/img/VIB.png' },
      { code: 'SHB', name: 'SHB', shortName: 'SHB', bin: '970443', logo: 'https://cdn.vietqr.io/img/SHB.png' },
      { code: 'OCB', name: 'OCB', shortName: 'OCB', bin: '970448', logo: 'https://cdn.vietqr.io/img/OCB.png' },
      { code: 'MSB', name: 'MSB', shortName: 'MSB', bin: '970426', logo: 'https://cdn.vietqr.io/img/MSB.png' },
      { code: 'SCB', name: 'SCB', shortName: 'SCB', bin: '970429', logo: 'https://cdn.vietqr.io/img/SCB.png' },
      { code: 'TPB', name: 'TPBank', shortName: 'TPBank', bin: '970423', logo: 'https://cdn.vietqr.io/img/TPB.png' },
      { code: 'NAB', name: 'Nam A Bank', shortName: 'NAB', bin: '970428', logo: 'https://cdn.vietqr.io/img/NAB.png' },
      { code: 'PVCB', name: 'PVcomBank', shortName: 'PVcomBank', bin: '970412', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
      { code: 'EIB', name: 'Eximbank', shortName: 'Eximbank', bin: '970431', logo: 'https://cdn.vietqr.io/img/EIB.png' },
      { code: 'SEAB', name: 'SeABank', shortName: 'SeABank', bin: '970440', logo: 'https://cdn.vietqr.io/img/SEAB.png' },
      { code: 'HDB', name: 'HDBank', shortName: 'HDBank', bin: '970437', logo: 'https://cdn.vietqr.io/img/HDB.png' },
      { code: 'VCCB', name: 'VietCapitalBank', shortName: 'VietCapitalBank', bin: '970454', logo: 'https://cdn.vietqr.io/img/VCCB.png' },
      { code: 'BAB', name: 'BacABank', shortName: 'BacABank', bin: '970409', logo: 'https://cdn.vietqr.io/img/BAB.png' },
      { code: 'STB', name: 'Sacombank', shortName: 'Sacombank', bin: '970403', logo: 'https://cdn.vietqr.io/img/STB.png' },
    ],
  });
});

// Standard QR Types
app.post('/api/qr/pdf', (req, res) => {
  console.log('📄 POST /api/qr/pdf', req.body);
  res.json(createMockQRResponse('pdf', req.body));
});

app.post('/api/qr/app-store', (req, res) => {
  console.log('📱 POST /api/qr/app-store', req.body);
  res.json(createMockQRResponse('app-store', req.body));
});

app.post('/api/qr/video', (req, res) => {
  console.log('🎥 POST /api/qr/video', req.body);
  res.json(createMockQRResponse('video', req.body));
});

app.post('/api/qr/audio', (req, res) => {
  console.log('🎵 POST /api/qr/audio', req.body);
  res.json(createMockQRResponse('audio', req.body));
});

app.post('/api/qr/multi-url', (req, res) => {
  console.log('🔀 POST /api/qr/multi-url', req.body);
  res.json(createMockQRResponse('multi-url', req.body));
});

app.post('/api/qr/business-page', (req, res) => {
  console.log('🏢 POST /api/qr/business-page', req.body);
  res.json(createMockQRResponse('business-page', req.body));
});

app.post('/api/qr/coupon', (req, res) => {
  console.log('🎟️ POST /api/qr/coupon', req.body);
  res.json(createMockQRResponse('coupon', req.body));
});

app.post('/api/qr/feedback-form', (req, res) => {
  console.log('📋 POST /api/qr/feedback-form', req.body);
  res.json(createMockQRResponse('feedback-form', req.body));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-qr-api', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('\n🎭 Mock QR Engine API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Running on: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/qr`);
  console.log('\n💡 This is a MOCK server for UI testing');
  console.log('   Returns dummy QR codes for all 19 types!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
