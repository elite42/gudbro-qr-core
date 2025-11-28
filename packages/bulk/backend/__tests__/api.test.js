/**
 * Module 4: Bulk Operations - Tests
 * Basic test suite for bulk operations
 */

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

// Mock app (you'll need to export app from server.js)
const app = require('../server');

describe('Module 4: Bulk Operations API', () => {
  
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
      expect(response.body.module).toBe('bulk-operations');
    });
  });

  describe('GET /api/bulk/template', () => {
    it('should download CSV template', async () => {
      const response = await request(app)
        .get('/api/bulk/template')
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('destination_url');
    });
  });

  describe('POST /api/bulk/direct', () => {
    it('should create bulk job from JSON', async () => {
      const data = {
        qr_codes: [
          {
            destination_url: 'https://example.com/1',
            title: 'Test QR 1'
          },
          {
            destination_url: 'https://example.com/2',
            title: 'Test QR 2'
          }
        ],
        options: {
          batchSize: 50
        }
      };

      const response = await request(app)
        .post('/api/bulk/direct')
        .send(data)
        .expect(202);
      
      expect(response.body.job_id).toBeDefined();
      expect(response.body.status).toBe('queued');
      expect(response.body.total_rows).toBe(2);
    });

    it('should reject invalid URLs', async () => {
      const data = {
        qr_codes: [
          {
            destination_url: 'not-a-url',
            title: 'Invalid'
          }
        ]
      };

      await request(app)
        .post('/api/bulk/direct')
        .send(data)
        .expect(400);
    });

    it('should reject empty request', async () => {
      await request(app)
        .post('/api/bulk/direct')
        .send({ qr_codes: [] })
        .expect(400);
    });
  });

  describe('GET /api/jobs/:job_id', () => {
    let jobId;

    beforeAll(async () => {
      // Create a job first
      const response = await request(app)
        .post('/api/bulk/direct')
        .send({
          qr_codes: [
            { destination_url: 'https://example.com/test' }
          ]
        });
      jobId = response.body.job_id;
    });

    it('should get job status', async () => {
      const response = await request(app)
        .get(`/api/jobs/${jobId}`)
        .expect(200);
      
      expect(response.body.job_id).toBe(jobId);
      expect(response.body.status).toBeDefined();
      expect(response.body.total_rows).toBe(1);
    });

    it('should return 404 for non-existent job', async () => {
      await request(app)
        .get('/api/jobs/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/jobs', () => {
    it('should list all jobs', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);
      
      expect(response.body.jobs).toBeDefined();
      expect(Array.isArray(response.body.jobs)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/jobs?status=queued')
        .expect(200);
      
      expect(response.body.jobs).toBeDefined();
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/jobs?page=1&limit=10')
        .expect(200);
      
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/jobs/:job_id/cancel', () => {
    let jobId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bulk/direct')
        .send({
          qr_codes: [
            { destination_url: 'https://example.com/test' }
          ]
        });
      jobId = response.body.job_id;
    });

    it('should cancel a job', async () => {
      const response = await request(app)
        .post(`/api/jobs/${jobId}/cancel`)
        .expect(200);
      
      expect(response.body.message).toContain('cancelled');
      expect(response.body.status).toBe('cancelled');
    });
  });

  describe('GET /api/bulk/stats', () => {
    it('should return statistics', async () => {
      const response = await request(app)
        .get('/api/bulk/stats')
        .expect(200);
      
      expect(response.body.total).toBeDefined();
      expect(response.body.queued).toBeDefined();
      expect(response.body.completed).toBeDefined();
    });
  });
});

describe('CSV Parser', () => {
  const csvParser = require('../utils/csvParser');

  describe('parseCSV', () => {
    it('should parse valid CSV', async () => {
      const csvContent = `destination_url,title
https://example.com/1,Test 1
https://example.com/2,Test 2`;
      
      const tempFile = path.join(__dirname, 'temp-test.csv');
      await fs.writeFile(tempFile, csvContent);
      
      const result = await csvParser.parseCSV(tempFile);
      
      expect(result.length).toBe(2);
      expect(result[0].destination_url).toBe('https://example.com/1');
      
      // Cleanup
      await fs.unlink(tempFile);
    });

    it('should reject invalid URLs', async () => {
      const csvContent = `destination_url,title
not-a-url,Test`;
      
      const tempFile = path.join(__dirname, 'temp-test.csv');
      await fs.writeFile(tempFile, csvContent);
      
      await expect(csvParser.parseCSV(tempFile)).rejects.toThrow();
      
      // Cleanup
      await fs.unlink(tempFile);
    });
  });

  describe('generateResultsCSV', () => {
    it('should generate CSV from results', () => {
      const results = [
        {
          destination_url: 'https://example.com/1',
          title: 'Test 1',
          short_code: 'abc123',
          short_url: 'https://qr.me/abc123',
          status: 'success'
        }
      ];

      const csv = csvParser.generateResultsCSV(results);
      
      expect(csv).toContain('destination_url');
      expect(csv).toContain('abc123');
      expect(csv).toContain('success');
    });

    it('should escape CSV values properly', () => {
      const results = [
        {
          destination_url: 'https://example.com',
          title: 'Test, with comma',
          short_code: 'abc123',
          status: 'success'
        }
      ];

      const csv = csvParser.generateResultsCSV(results);
      
      // Should wrap value with comma in quotes
      expect(csv).toContain('"Test, with comma"');
    });
  });
});

describe('QR Generator', () => {
  const qrGenerator = require('../utils/qrGenerator');

  describe('generateQR', () => {
    it('should generate QR code', async () => {
      const qrData = {
        destination_url: 'https://example.com',
        title: 'Test QR'
      };

      const result = await qrGenerator.generateQR(qrData);
      
      expect(result.short_code).toBeDefined();
      expect(result.short_url).toBeDefined();
      expect(result.qr_image).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('should apply custom design', async () => {
      const qrData = {
        destination_url: 'https://example.com'
      };
      
      const design = {
        foreground: '#FF0000',
        background: '#FFFFFF',
        margin: 2
      };

      const result = await qrGenerator.generateQR(qrData, design);
      
      expect(result.design).toEqual(design);
      expect(result.qr_image).toBeDefined();
    });
  });

  describe('generateShortCode', () => {
    it('should generate 6-character code', () => {
      const code = qrGenerator.generateShortCode();
      
      expect(code.length).toBe(6);
      expect(/^[a-zA-Z0-9]+$/.test(code)).toBe(true);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      
      for (let i = 0; i < 100; i++) {
        codes.add(qrGenerator.generateShortCode());
      }
      
      // Should have 100 unique codes
      expect(codes.size).toBe(100);
    });
  });
});

describe('Validators', () => {
  const validators = require('../utils/validators');

  describe('validateBulkUpload', () => {
    it('should accept valid options', () => {
      const options = {
        type: 'dynamic',
        batchSize: 100
      };

      const { error } = validators.validateBulkUpload(options);
      
      expect(error).toBeUndefined();
    });

    it('should reject invalid batch size', () => {
      const options = {
        batchSize: 1000 // Too large
      };

      const { error } = validators.validateBulkUpload(options);
      
      expect(error).toBeDefined();
    });
  });

  describe('validateDirectBulk', () => {
    it('should accept valid request', () => {
      const data = {
        qr_codes: [
          {
            destination_url: 'https://example.com',
            title: 'Test'
          }
        ]
      };

      const { error } = validators.validateDirectBulk(data);
      
      expect(error).toBeUndefined();
    });

    it('should require destination_url', () => {
      const data = {
        qr_codes: [
          {
            title: 'Test' // Missing URL
          }
        ]
      };

      const { error } = validators.validateDirectBulk(data);
      
      expect(error).toBeDefined();
    });
  });
});
