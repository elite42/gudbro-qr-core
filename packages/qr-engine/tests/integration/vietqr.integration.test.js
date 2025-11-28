/**
 * VietQR Payment QR Code - Integration Tests
 *
 * Tests the complete VietQR flow through API endpoints
 */

const request = require('supertest');
const app = require('../../app');

describe('VietQR API Integration', () => {
  describe('POST /api/qr/vietqr', () => {
    test('should generate VietQR with required fields only', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'vietqr');
      expect(response.body.data).toHaveProperty('qr_string');
      expect(response.body.data).toHaveProperty('qr_image');
      expect(response.body.data.qr_string).toContain('https://img.vietqr.io/image/VCB-1234567890');

      // Check metadata
      const metadata = response.body.data.metadata;
      expect(metadata.bankCode).toBe('VCB');
      expect(metadata.bankName).toBe('Vietcombank');
      expect(metadata.accountNumber).toBe('1234567890');
      expect(metadata.accountName).toBe('NGUYEN VAN A');
      expect(metadata.amount).toBeNull();
      expect(metadata.description).toBeNull();
    });

    test('should generate VietQR with amount', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'BIDV',
          accountNumber: '9876543210',
          accountName: 'TRAN THI B',
          amount: 100000
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('amount=100000');
      expect(response.body.data.metadata.amount).toBe(100000);
      expect(response.body.data.metadata.formattedAmount).toContain('100.000');
    });

    test('should generate VietQR with description', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VTB',
          accountNumber: '1111222233',
          accountName: 'LE VAN C',
          description: 'Thanh toan don hang #123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('addInfo=');
      expect(response.body.data.metadata.description).toBe('Thanh toan don hang #123');
    });

    test('should generate VietQR with all optional fields', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'TCB',
          accountNumber: '5555666677',
          accountName: 'PHAM VAN D',
          amount: 250000,
          description: 'Payment for order #456',
          title: 'VietQR Payment',
          template: 'print'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('print.jpg');
      expect(response.body.data.qr_string).toContain('amount=250000');
      expect(response.body.data.metadata.template).toBe('print');
    });

    test('should support e-wallets (Momo)', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'MOMO',
          accountNumber: '0912345678',
          accountName: 'MOMO USER',
          amount: 50000
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.bankCode).toBe('MOMO');
      expect(response.body.data.metadata.bankName).toBe('Momo');
    });

    test('should normalize bank code to uppercase', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'vcb',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.bankCode).toBe('VCB');
    });

    test('should clean account number (remove spaces)', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '123 456 789',
          accountName: 'NGUYEN VAN A'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.accountNumber).toBe('123456789');
    });

    test('should return QR code image as base64', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A'
        })
        .expect(200);

      expect(response.body.data.qr_image).toMatch(/^data:image\/png;base64,/);

      // Check if base64 is valid (should decode without errors)
      const base64Data = response.body.data.qr_image.replace(/^data:image\/png;base64,/, '');
      expect(() => Buffer.from(base64Data, 'base64')).not.toThrow();
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890'
          // Missing accountName
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject invalid bank code', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'INVALID',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('bank code');
    });

    test('should reject invalid account number', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '12345', // Too short
          accountName: 'NGUYEN VAN A'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('6-20 digits');
    });

    test('should reject amount exceeding limit', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          amount: 600000000 // Exceeds 500M limit
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('500,000,000');
    });

    test('should reject negative amount', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          amount: -1000
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject description exceeding 255 characters', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          description: 'A'.repeat(256)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('255 characters');
    });

    test('should reject invalid template', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          template: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should support different templates', async () => {
      const templates = ['compact', 'print', 'qr_only'];

      for (const template of templates) {
        const response = await request(app)
          .post('/api/qr/vietqr')
          .send({
            bankCode: 'VCB',
            accountNumber: '1234567890',
            accountName: 'NGUYEN VAN A',
            template
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.qr_string).toContain(`${template}.jpg`);
      }
    });
  });

  describe('GET /api/qr/vietqr/banks', () => {
    test('should return list of supported banks', async () => {
      const response = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data).toHaveProperty('banks');
      expect(Array.isArray(response.body.data.banks)).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(20);
    });

    test('should include Big 4 banks', async () => {
      const response = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      const bankCodes = response.body.data.banks.map(b => b.code);

      expect(bankCodes).toContain('VCB');
      expect(bankCodes).toContain('BIDV');
      expect(bankCodes).toContain('VTB');
      expect(bankCodes).toContain('ARB');
    });

    test('should include e-wallets', async () => {
      const response = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      const bankCodes = response.body.data.banks.map(b => b.code);

      expect(bankCodes).toContain('MOMO');
      expect(bankCodes).toContain('ZALOPAY');
    });

    test('should return banks with correct structure', async () => {
      const response = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      const banks = response.body.data.banks;

      banks.forEach(bank => {
        expect(bank).toHaveProperty('code');
        expect(bank).toHaveProperty('name');
        expect(bank).toHaveProperty('bin');
        expect(typeof bank.code).toBe('string');
        expect(typeof bank.name).toBe('string');
        expect(typeof bank.bin).toBe('string');
      });
    });

    test('should include Vietcombank with correct details', async () => {
      const response = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      const vcb = response.body.data.banks.find(b => b.code === 'VCB');

      expect(vcb).toBeDefined();
      expect(vcb.name).toBe('Vietcombank');
      expect(vcb.bin).toBe('970436');
    });
  });

  describe('VietQR End-to-End Scenarios', () => {
    test('should handle complete payment flow', async () => {
      // Step 1: Get supported banks
      const banksResponse = await request(app)
        .get('/api/qr/vietqr/banks')
        .expect(200);

      expect(banksResponse.body.data.banks.length).toBeGreaterThan(0);

      // Step 2: Generate VietQR for first bank
      const firstBank = banksResponse.body.data.banks[0];
      const qrResponse = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: firstBank.code,
          accountNumber: '1234567890',
          accountName: 'TEST USER',
          amount: 100000,
          description: 'Test payment'
        })
        .expect(200);

      expect(qrResponse.body.success).toBe(true);
      expect(qrResponse.body.data.metadata.bankCode).toBe(firstBank.code);
      expect(qrResponse.body.data.metadata.bankName).toBe(firstBank.name);
    });

    test('should handle Vietnamese characters in account name', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYỄN VĂN ÁNH' // Vietnamese diacritics
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.accountName).toBe('NGUYỄN VĂN ÁNH');
    });

    test('should handle Vietnamese characters in description', async () => {
      const response = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          description: 'Thanh toán đơn hàng số 123' // Vietnamese diacritics
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.description).toBe('Thanh toán đơn hàng số 123');
    });

    test('should generate different QR codes for different amounts', async () => {
      const response1 = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          amount: 100000
        })
        .expect(200);

      const response2 = await request(app)
        .post('/api/qr/vietqr')
        .send({
          bankCode: 'VCB',
          accountNumber: '1234567890',
          accountName: 'NGUYEN VAN A',
          amount: 200000
        })
        .expect(200);

      // URLs should be different due to different amounts
      expect(response1.body.data.qr_string).not.toBe(response2.body.data.qr_string);
      expect(response1.body.data.qr_image).not.toBe(response2.body.data.qr_image);
    });
  });
});
