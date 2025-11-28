/**
 * WeChat Pay QR Code - Integration Tests
 *
 * Tests the complete WeChat Pay flow through API endpoints
 * Phase 1: Static merchant QR implementation
 */

const request = require('supertest');
const app = require('../../app');

describe('WeChat Pay API Integration', () => {
  describe('POST /api/qr/wechat-pay', () => {
    test('should generate WeChat Pay QR with merchant ID only', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'wechat-pay');
      expect(response.body.data).toHaveProperty('qr_string');
      expect(response.body.data).toHaveProperty('qr_image');
      expect(response.body.data.qr_string).toContain('weixin://wxpay/bizpayurl?mchid=1234567890');

      // Check metadata
      const metadata = response.body.data.metadata;
      expect(metadata.merchantId).toBe('1234567890');
      expect(metadata.currency).toBe('CNY'); // Default
      expect(metadata.implementationPhase).toBe('static');
      expect(metadata.note).toContain('customer enters amount');
    });

    test('should generate WeChat Pay QR with amount (CNY)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 100,
          currency: 'CNY'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(100);
      expect(response.body.data.metadata.currency).toBe('CNY');
    });

    test('should generate WeChat Pay QR with amount (VND)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '9876543210',
          amount: 500000,
          currency: 'VND'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(500000);
      expect(response.body.data.metadata.currency).toBe('VND');
    });

    test('should generate WeChat Pay QR with description', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          description: 'Restaurant dinner payment'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.description).toBe('Restaurant dinner payment');
    });

    test('should generate WeChat Pay QR with order ID', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          orderId: 'ORDER-2024-001'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.orderId).toBe('ORDER-2024-001');
    });

    test('should generate WeChat Pay QR with all fields', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 150,
          currency: 'CNY',
          description: 'Gudbro Restaurant - Table 5',
          orderId: 'ORDER-123',
          title: 'WeChat Payment'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(150);
      expect(response.body.data.metadata.currency).toBe('CNY');
      expect(response.body.data.metadata.description).toBe('Gudbro Restaurant - Table 5');
      expect(response.body.data.metadata.orderId).toBe('ORDER-123');
      expect(response.body.data.title).toBe('WeChat Payment');
    });

    test('should default to CNY when currency not specified', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 100
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.currency).toBe('CNY');
    });

    test('should handle merchant ID with spaces', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '123 456 7890'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.merchantId).toBe('1234567890');
      expect(response.body.data.qr_string).toContain('1234567890');
    });

    test('should handle Chinese characters in description', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          description: '餐厅付款 - 景点门票'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.description).toBe('餐厅付款 - 景点门票');
    });

    test('should return QR code image as base64', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890'
        })
        .expect(200);

      expect(response.body.data.qr_image).toMatch(/^data:image\/png;base64,/);

      // Check if base64 is valid
      const base64Data = response.body.data.qr_image.replace(/^data:image\/png;base64,/, '');
      expect(() => Buffer.from(base64Data, 'base64')).not.toThrow();
    });

    test('should reject missing merchant ID', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          amount: 100
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject invalid merchant ID (too short)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '123456789' // Only 9 digits
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exactly 10 digits');
    });

    test('should reject invalid merchant ID (contains letters)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '12345abc90'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('10 digits');
    });

    test('should reject invalid currency', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          currency: 'USD'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject negative amount', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: -100
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('greater than 0');
    });

    test('should reject amount exceeding CNY limit', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 1000001,
          currency: 'CNY'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not exceed');
    });

    test('should reject amount exceeding VND limit', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 5000000001,
          currency: 'VND'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not exceed');
    });

    test('should reject description exceeding 255 characters', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          description: 'A'.repeat(256)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('255 characters');
    });

    test('should reject invalid order ID (special characters)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          orderId: 'ORDER@123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('alphanumeric');
    });

    test('should accept valid order ID with dashes and underscores', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          orderId: 'ORDER_2024-001'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.orderId).toBe('ORDER_2024-001');
    });
  });

  describe('GET /api/qr/wechat-pay/info', () => {
    test('should return WeChat Pay platform information', async () => {
      const response = await request(app)
        .get('/api/qr/wechat-pay/info')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'WeChat Pay');
      expect(response.body.data).toHaveProperty('country', 'China');
      expect(response.body.data).toHaveProperty('users', '1B+');
      expect(response.body.data).toHaveProperty('market');
      expect(response.body.data).toHaveProperty('implementationPhase', 'Phase 1 (Static Merchant QR)');
      expect(response.body.data).toHaveProperty('supportedCurrencies');
      expect(response.body.data).toHaveProperty('usageNotes');
      expect(response.body.data).toHaveProperty('merchantSetup');
      expect(Array.isArray(response.body.data.usageNotes)).toBe(true);
      expect(Array.isArray(response.body.data.merchantSetup)).toBe(true);
    });
  });

  describe('GET /api/qr/wechat-pay/currencies', () => {
    test('should return supported currencies', async () => {
      const response = await request(app)
        .get('/api/qr/wechat-pay/currencies')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('default', 'CNY');
      expect(response.body.data).toHaveProperty('supported');
      expect(response.body.data.supported).toEqual(['CNY', 'VND']);
    });
  });

  describe('WeChat Pay End-to-End Scenarios', () => {
    test('should handle complete payment flow', async () => {
      // Step 1: Get platform info
      const infoResponse = await request(app)
        .get('/api/qr/wechat-pay/info')
        .expect(200);

      expect(infoResponse.body.success).toBe(true);
      expect(infoResponse.body.data.name).toBe('WeChat Pay');

      // Step 2: Get supported currencies
      const currenciesResponse = await request(app)
        .get('/api/qr/wechat-pay/currencies')
        .expect(200);

      expect(currenciesResponse.body.data.supported).toContain('CNY');
      expect(currenciesResponse.body.data.supported).toContain('VND');

      // Step 3: Generate WeChat Pay QR
      const qrResponse = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 100,
          currency: 'CNY'
        })
        .expect(200);

      expect(qrResponse.body.success).toBe(true);
      expect(qrResponse.body.data.metadata.merchantId).toBe('1234567890');
    });

    test('should handle restaurant payment scenario (CNY)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 198,
          currency: 'CNY',
          description: 'Gudbro Restaurant - Dinner for 2',
          orderId: 'TABLE-05-2024110301',
          title: 'Restaurant Bill'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(198);
      expect(response.body.data.metadata.currency).toBe('CNY');
      expect(response.body.data.title).toBe('Restaurant Bill');
    });

    test('should handle tourist payment scenario (VND)', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '9876543210',
          amount: 700000,
          currency: 'VND',
          description: 'Da Nang City Tour',
          orderId: 'TOUR-001'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(700000);
      expect(response.body.data.metadata.currency).toBe('VND');
    });

    test('should generate different QR codes for different merchants', async () => {
      const response1 = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890'
        })
        .expect(200);

      const response2 = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '9876543210'
        })
        .expect(200);

      // URLs should be different
      expect(response1.body.data.qr_string).not.toBe(response2.body.data.qr_string);
      expect(response1.body.data.qr_image).not.toBe(response2.body.data.qr_image);
    });

    test('should support decimal amounts', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 99.99,
          currency: 'CNY'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(99.99);
    });

    test('should round amounts to 2 decimal places', async () => {
      const response = await request(app)
        .post('/api/qr/wechat-pay')
        .send({
          merchantId: '1234567890',
          amount: 100.123,
          currency: 'CNY'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.amount).toBe(100.12);
    });
  });
});
