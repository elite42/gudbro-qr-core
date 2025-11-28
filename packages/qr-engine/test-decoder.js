/**
 * Quick test for QR Decoder
 * 1. Generate a WiFi QR code
 * 2. Decode it
 * 3. Verify content matches
 */

const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const { decodeQRFromImage, detectQRType, getQRTypeInfo } = require('./utils/qrDecoder');

async function testDecoder() {
  console.log('🧪 Testing QR Decoder...\n');

  try {
    // 1. Generate test QR codes
    const testCases = [
      {
        name: 'WiFi QR',
        data: 'WIFI:T:WPA;S:GudbrowiFi;P:password123;H:false;;',
        expectedType: 'wifi'
      },
      {
        name: 'URL QR',
        data: 'https://gudbro.com',
        expectedType: 'url'
      },
      {
        name: 'VietQR URL',
        data: 'https://api.vietqr.io/image/VCB-0123456789-compact.jpg?amount=500000',
        expectedType: 'vietqr'
      },
      {
        name: 'Email QR',
        data: 'mailto:info@gudbro.com?subject=Test&body=Hello',
        expectedType: 'email'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.name}`);
      console.log(`   Data: ${testCase.data.substring(0, 50)}${testCase.data.length > 50 ? '...' : ''}`);

      // Generate QR image
      const testFile = path.join(__dirname, 'uploads', 'qr-decode', `test-${Date.now()}.png`);
      await QRCode.toFile(testFile, testCase.data, {
        errorCorrectionLevel: 'M',
        width: 300
      });
      console.log(`   ✓ Generated QR image`);

      // Decode QR
      const decoded = await decodeQRFromImage(testFile);

      if (!decoded.success) {
        console.log(`   ❌ FAILED: ${decoded.error}`);
        continue;
      }

      console.log(`   ✓ Decoded successfully`);
      console.log(`   Type: ${decoded.type} ${decoded.type === testCase.expectedType ? '✓' : '❌ Expected: ' + testCase.expectedType}`);
      console.log(`   Content matches: ${decoded.data === testCase.data ? '✓' : '❌'}`);

      // Show parsed content
      if (Object.keys(decoded.parsed).length > 0) {
        console.log(`   Parsed:`, JSON.stringify(decoded.parsed, null, 2).split('\n').join('\n     '));
      }

      // Type info
      const typeInfo = getQRTypeInfo(decoded.type);
      console.log(`   ${typeInfo.icon} ${typeInfo.name} - ${typeInfo.description}`);
      console.log(`   Can rework: ${typeInfo.canRework ? '✓ Yes' : '❌ No'}`);

      // Clean up
      await fs.unlink(testFile);
    }

    console.log('\n\n✅ All decoder tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testDecoder();
