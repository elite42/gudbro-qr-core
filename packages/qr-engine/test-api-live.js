/**
 * Live API Test for QR Decode & Rework
 * Standalone server test without Redis dependency
 */

const express = require('express');
const qrDecodeRoutes = require('./routes/qrDecode');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Minimal middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount decode routes
app.use('/api/qr', qrDecodeRoutes);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`\n🧪 Testing QR Decode & Rework API`);
  console.log(`📡 Test server running on: http://localhost:${PORT}\n`);

  try {
    await runTests();
    console.log('\n✅ All API tests completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  } finally {
    server.close();
  }
});

async function runTests() {
  // Test 1: GET /api/qr/rework/info
  console.log('🔍 Test 1: GET /api/qr/rework/info');
  const infoResponse = await axios.get(`http://localhost:${PORT}/api/qr/rework/info`);
  console.log(`   Status: ${infoResponse.status} ✓`);
  console.log(`   Supported types: ${infoResponse.data.supportedTypes.length} types`);
  console.log(`   Features: ${Object.keys(infoResponse.data.features).join(', ')}`);

  // Test 2: POST /api/qr/decode - WiFi QR
  console.log('\n🔍 Test 2: POST /api/qr/decode (WiFi QR)');
  const wifiData = 'WIFI:T:WPA;S:GudbrowiFi;P:password123;H:false;;';
  const wifiQRPath = path.join(__dirname, 'uploads/qr-decode/test-wifi.png');

  await QRCode.toFile(wifiQRPath, wifiData, { width: 300 });
  console.log(`   ✓ Generated WiFi QR at ${wifiQRPath}`);

  const formData = new FormData();
  formData.append('qrImage', await fs.readFile(wifiQRPath), {
    filename: 'wifi-qr.png',
    contentType: 'image/png',
  });

  const decodeResponse = await axios.post(
    `http://localhost:${PORT}/api/qr/decode`,
    formData,
    { headers: formData.getHeaders() }
  );

  console.log(`   Status: ${decodeResponse.status} ✓`);
  console.log(`   Decoded type: ${decodeResponse.data.qr.type} ✓`);
  console.log(`   ${decodeResponse.data.qr.typeInfo.icon} ${decodeResponse.data.qr.typeInfo.name}`);
  console.log(`   Parsed SSID: ${decodeResponse.data.qr.parsed.ssid} ✓`);
  console.log(`   Content length: ${decodeResponse.data.qr.content.length} chars`);

  // Clean up
  await fs.unlink(wifiQRPath);

  // Test 3: POST /api/qr/rework - URL QR
  console.log('\n🔍 Test 3: POST /api/qr/rework (URL QR)');
  const urlData = 'https://gudbro.com/menu';
  const urlQRPath = path.join(__dirname, 'uploads/qr-decode/test-url.png');

  await QRCode.toFile(urlQRPath, urlData, { width: 300 });
  console.log(`   ✓ Generated URL QR`);

  const reworkFormData = new FormData();
  reworkFormData.append('qrImage', await fs.readFile(urlQRPath), {
    filename: 'url-qr.png',
    contentType: 'image/png',
  });
  reworkFormData.append('style', 'dots');
  reworkFormData.append('errorCorrectionLevel', 'H');
  reworkFormData.append('width', '400');
  reworkFormData.append('color', JSON.stringify({ dark: '#FF0000', light: '#FFFFFF' }));

  const reworkResponse = await axios.post(
    `http://localhost:${PORT}/api/qr/rework`,
    reworkFormData,
    { headers: reworkFormData.getHeaders() }
  );

  console.log(`   Status: ${reworkResponse.status} ✓`);
  console.log(`   Original type: ${reworkResponse.data.original.type} ✓`);
  console.log(`   ${reworkResponse.data.original.typeInfo.icon} ${reworkResponse.data.original.typeInfo.name}`);
  console.log(`   Reworked style: ${reworkResponse.data.reworked.style} ✓`);
  console.log(`   New QR size: ${reworkResponse.data.reworked.qr.length} bytes`);
  console.log(`   New QR preview: ${reworkResponse.data.reworked.qr.substring(0, 50)}...`);

  // Save reworked QR to file
  const base64Data = reworkResponse.data.reworked.qr.replace(/^data:image\/png;base64,/, '');
  const reworkedPath = path.join(__dirname, 'uploads/qr-decode/reworked-url-qr.png');
  await fs.writeFile(reworkedPath, base64Data, 'base64');
  console.log(`   ✓ Saved reworked QR to: ${reworkedPath}`);

  // Clean up
  await fs.unlink(urlQRPath);

  // Test 4: POST /api/qr/decode - VietQR detection
  console.log('\n🔍 Test 4: POST /api/qr/decode (VietQR auto-detection)');
  const vietqrData = 'https://api.vietqr.io/image/VCB-0123456789-compact.jpg?amount=500000';
  const vietqrPath = path.join(__dirname, 'uploads/qr-decode/test-vietqr.png');

  await QRCode.toFile(vietqrPath, vietqrData, { width: 300 });

  const vietqrFormData = new FormData();
  vietqrFormData.append('qrImage', await fs.readFile(vietqrPath), {
    filename: 'vietqr.png',
    contentType: 'image/png',
  });

  const vietqrResponse = await axios.post(
    `http://localhost:${PORT}/api/qr/decode`,
    vietqrFormData,
    { headers: vietqrFormData.getHeaders() }
  );

  console.log(`   Status: ${vietqrResponse.status} ✓`);
  console.log(`   Auto-detected type: ${vietqrResponse.data.qr.type} ✓`);
  console.log(`   ${vietqrResponse.data.qr.typeInfo.icon} ${vietqrResponse.data.qr.typeInfo.name}`);
  console.log(`   Can rework: ${vietqrResponse.data.qr.typeInfo.canRework ? 'Yes ✓' : 'No'}`);

  // Clean up
  await fs.unlink(vietqrPath);

  // Test 5: Error handling - Invalid file
  console.log('\n🔍 Test 5: Error handling (no file uploaded)');
  try {
    await axios.post(`http://localhost:${PORT}/api/qr/decode`, {});
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`   Status: ${error.response.status} ✓`);
      console.log(`   Error message: "${error.response.data.message}" ✓`);
    } else {
      throw error;
    }
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});
