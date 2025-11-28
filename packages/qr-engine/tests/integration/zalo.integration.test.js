/**
 * Zalo Social QR Code - Integration Tests
 *
 * Tests the complete Zalo flow through API endpoints
 */

const request = require('supertest');
const app = require('../../app');

describe('Zalo API Integration', () => {
  describe('POST /api/qr/zalo', () => {
    test('should generate Zalo QR with phone number (local format)', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'zalo');
      expect(response.body.data).toHaveProperty('qr_string');
      expect(response.body.data).toHaveProperty('qr_image');
      expect(response.body.data.qr_string).toBe('https://zalo.me/84912345678');

      // Check metadata
      const metadata = response.body.data.metadata;
      expect(metadata.identifier).toBe('84912345678');
      expect(metadata.identifierType).toBe('phone');
      expect(metadata.phoneNumber).toBe('0912345678');
      expect(metadata.internationalPhone).toBe('84912345678');
    });

    test('should generate Zalo QR with phone number (international format)', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '84987654321'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toBe('https://zalo.me/84987654321');
      expect(response.body.data.metadata.identifier).toBe('84987654321');
    });

    test('should generate Zalo QR with Zalo ID', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          zaloId: 'gudbrovietnam'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toBe('https://zalo.me/gudbrovietnam');
      expect(response.body.data.metadata.identifierType).toBe('zaloId');
      expect(response.body.data.metadata.zaloId).toBe('gudbrovietnam');
    });

    test('should generate Zalo QR with display name', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'Gudbro Restaurant'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.displayName).toBe('Gudbro Restaurant');
      expect(response.body.data.title).toContain('Gudbro Restaurant');
    });

    test('should generate Zalo QR with message', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          message: 'Xin chào, tôi muốn đặt bàn'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('https://zalo.me/84912345678?msg=');
      expect(response.body.data.metadata.message).toBe('Xin chào, tôi muốn đặt bàn');
    });

    test('should generate Zalo QR with all optional fields', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'Gudbro Restaurant',
          message: 'Hello, I want to book a table for 4 people',
          title: 'Chat with Gudbro'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('?msg=');
      expect(response.body.data.metadata.displayName).toBe('Gudbro Restaurant');
      expect(response.body.data.metadata.message).toBe('Hello, I want to book a table for 4 people');
      expect(response.body.data.title).toBe('Chat with Gudbro');
    });

    test('should prioritize phone number over Zalo ID', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          zaloId: 'gudbrovietnam'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toBe('https://zalo.me/84912345678');
      expect(response.body.data.metadata.identifierType).toBe('phone');
    });

    test('should handle phone with spaces and dashes', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '091 234 5678'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toBe('https://zalo.me/84912345678');
    });

    test('should handle Vietnamese characters in message', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          message: 'Tôi muốn đặt bàn cho 4 người lúc 19h'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('?msg=');
      expect(response.body.data.metadata.message).toBe('Tôi muốn đặt bàn cho 4 người lúc 19h');
    });

    test('should return QR code image as base64', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678'
        })
        .expect(200);

      expect(response.body.data.qr_image).toMatch(/^data:image\/png;base64,/);

      // Check if base64 is valid
      const base64Data = response.body.data.qr_image.replace(/^data:image\/png;base64,/, '');
      expect(() => Buffer.from(base64Data, 'base64')).not.toThrow();
    });

    test('should reject when neither phone nor ID provided', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          displayName: 'Test'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject invalid Vietnamese phone number', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0123456789' // Invalid prefix
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid Vietnamese phone number');
    });

    test('should reject invalid Zalo ID (too short)', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          zaloId: 'short' // Only 5 chars
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('6-30 alphanumeric');
    });

    test('should reject invalid Zalo ID (special characters)', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          zaloId: 'user@name'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should reject message exceeding 500 characters', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          message: 'A'.repeat(501)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('500 characters');
    });

    test('should reject display name exceeding 100 characters', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'A'.repeat(101)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('100 characters');
    });

    test('should support all Vietnamese mobile prefixes', async () => {
      const prefixes = ['03', '05', '07', '08', '09'];

      for (const prefix of prefixes) {
        const response = await request(app)
          .post('/api/qr/zalo')
          .send({
            phoneNumber: `${prefix}12345678`
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.qr_string).toContain('https://zalo.me/84');
      }
    });
  });

  describe('GET /api/qr/zalo/info', () => {
    test('should return Zalo platform information', async () => {
      const response = await request(app)
        .get('/api/qr/zalo/info')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Zalo');
      expect(response.body.data).toHaveProperty('country', 'Vietnam');
      expect(response.body.data).toHaveProperty('users', '74M+');
      expect(response.body.data).toHaveProperty('market');
      expect(response.body.data).toHaveProperty('usageNotes');
      expect(Array.isArray(response.body.data.usageNotes)).toBe(true);
    });
  });

  describe('Zalo End-to-End Scenarios', () => {
    test('should handle complete Zalo contact flow', async () => {
      // Step 1: Get platform info
      const infoResponse = await request(app)
        .get('/api/qr/zalo/info')
        .expect(200);

      expect(infoResponse.body.success).toBe(true);
      expect(infoResponse.body.data.name).toBe('Zalo');

      // Step 2: Generate Zalo QR
      const qrResponse = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'Gudbro Restaurant',
          message: 'Xin chào!'
        })
        .expect(200);

      expect(qrResponse.body.success).toBe(true);
      expect(qrResponse.body.data.metadata.displayName).toBe('Gudbro Restaurant');
    });

    test('should handle restaurant reservation scenario', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'Gudbro Da Nang',
          message: 'Tôi muốn đặt bàn cho 4 người vào tối nay lúc 19h',
          title: 'Book a Table'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qr_string).toContain('?msg=');
      expect(response.body.data.metadata.message).toContain('đặt bàn');
      expect(response.body.data.title).toBe('Book a Table');
    });

    test('should handle customer support scenario', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          zaloId: 'gudbro_support',
          displayName: 'Gudbro Customer Support',
          message: 'Tôi cần hỗ trợ về đơn hàng'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.identifierType).toBe('zaloId');
      expect(response.body.data.metadata.zaloId).toBe('gudbro_support');
    });

    test('should generate different QR codes for different phones', async () => {
      const response1 = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678'
        })
        .expect(200);

      const response2 = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0987654321'
        })
        .expect(200);

      // URLs should be different
      expect(response1.body.data.qr_string).not.toBe(response2.body.data.qr_string);
      expect(response1.body.data.qr_image).not.toBe(response2.body.data.qr_image);
    });

    test('should handle bilingual messages', async () => {
      const response = await request(app)
        .post('/api/qr/zalo')
        .send({
          phoneNumber: '0912345678',
          displayName: 'Gudbro Restaurant',
          message: 'Hello / Xin chào - We welcome international guests!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metadata.message).toContain('Hello');
      expect(response.body.data.metadata.message).toContain('Xin chào');
    });
  });
});
