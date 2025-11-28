const {
  generateQRCode,
  generateQRBuffer,
  generateQRSVG,
  isValidURL,
  getQRCapacity
} = require('../utils/qrGenerator');

describe('QR Code Generator', () => {
  describe('generateQRCode', () => {
    test('should generate base64 data URL', async () => {
      const url = 'https://example.com';
      const qrDataURL = await generateQRCode(url);
      
      expect(qrDataURL).toMatch(/^data:image\/png;base64,/);
      expect(qrDataURL.length).toBeGreaterThan(100);
    });

    test('should generate QR for various URLs', async () => {
      const urls = [
        'https://example.com',
        'http://localhost:3000',
        'https://example.com/path/to/page?param=value'
      ];
      
      for (const url of urls) {
        const qr = await generateQRCode(url);
        expect(qr).toMatch(/^data:image\/png;base64,/);
      }
    });

    test('should accept custom options', async () => {
      const url = 'https://example.com';
      const qr = await generateQRCode(url, {
        width: 500,
        color: { dark: '#FF0000', light: '#FFFFFF' }
      });
      
      expect(qr).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('generateQRBuffer', () => {
    test('should generate PNG buffer', async () => {
      const url = 'https://example.com';
      const buffer = await generateQRBuffer(url);
      
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
      // Check PNG signature
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50); // 'P'
      expect(buffer[2]).toBe(0x4E); // 'N'
      expect(buffer[3]).toBe(0x47); // 'G'
    });
  });

  describe('generateQRSVG', () => {
    test('should generate SVG string', async () => {
      const url = 'https://example.com';
      const svg = await generateQRSVG(url);
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns');
    });
  });

  describe('isValidURL', () => {
    test('should validate correct URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://example.com/path?query=1')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('ftp://example.com')).toBe(false);
      expect(isValidURL('javascript:alert(1)')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL('example.com')).toBe(false); // No protocol
    });
  });

  describe('getQRCapacity', () => {
    test('should return capacity for error correction levels', () => {
      expect(getQRCapacity('L')).toBe(2953);
      expect(getQRCapacity('M')).toBe(2331);
      expect(getQRCapacity('Q')).toBe(1663);
      expect(getQRCapacity('H')).toBe(1273);
    });

    test('should default to M level', () => {
      expect(getQRCapacity()).toBe(2331);
      expect(getQRCapacity('INVALID')).toBe(2331);
    });
  });
});
