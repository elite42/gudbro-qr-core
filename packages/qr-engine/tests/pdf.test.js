/**
 * PDF QR Code - Unit Tests
 *
 * Tests for PDF QR codes (direct links to PDF files)
 * Use cases: menus, brochures, wine lists, downloadable content
 */

const {
  validatePdfUrl,
  validatePdfTitle,
  validateDownload,
  generatePdfQRData,
  getPdfQRPlatformInfo
} = require('../utils/pdf');

describe('PDF QR Code', () => {
  describe('validatePdfUrl', () => {
    test('should accept valid PDF URLs', () => {
      expect(validatePdfUrl('https://example.com/menu.pdf')).toBe('https://example.com/menu.pdf');
      expect(validatePdfUrl('http://example.com/brochure.pdf')).toBe('http://example.com/brochure.pdf');
      expect(validatePdfUrl('https://cdn.example.com/files/document.pdf'))
        .toBe('https://cdn.example.com/files/document.pdf');
    });

    test('should accept URLs that contain pdf but do not end with .pdf', () => {
      // Some servers use dynamic URLs
      const url = 'https://example.com/download?file=menu.pdf&token=abc';
      expect(validatePdfUrl(url)).toBe(url);
    });

    test('should accept URLs without .pdf extension (with warning)', () => {
      // Should warn but not fail - could be dynamic URL
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const url = 'https://example.com/document';

      expect(validatePdfUrl(url)).toBe(url);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('does not appear to be a PDF'));

      consoleSpy.mockRestore();
    });

    test('should trim whitespace', () => {
      expect(validatePdfUrl('  https://example.com/menu.pdf  '))
        .toBe('https://example.com/menu.pdf');
    });

    test('should reject invalid URLs', () => {
      expect(() => validatePdfUrl('example.com/menu.pdf')).toThrow('http://');
      expect(() => validatePdfUrl('ftp://example.com/menu.pdf')).toThrow('http://');
      expect(() => validatePdfUrl('')).toThrow('PDF URL is required');
      expect(() => validatePdfUrl(null)).toThrow('PDF URL is required');
    });
  });

  describe('validatePdfTitle', () => {
    test('should accept valid PDF titles', () => {
      expect(validatePdfTitle('Restaurant Menu')).toBe('Restaurant Menu');
      expect(validatePdfTitle('Wine List 2024')).toBe('Wine List 2024');
      expect(validatePdfTitle('Brochure')).toBe('Brochure');
    });

    test('should return null for empty values', () => {
      expect(validatePdfTitle(undefined)).toBeNull();
      expect(validatePdfTitle(null)).toBeNull();
      expect(validatePdfTitle('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validatePdfTitle('  Menu  ')).toBe('Menu');
    });

    test('should reject titles that are too short', () => {
      expect(() => validatePdfTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validatePdfTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateDownload', () => {
    test('should return true for truthy download values', () => {
      expect(validateDownload(true)).toBe(true);
      expect(validateDownload('true')).toBe(true);
      expect(validateDownload(1)).toBe(true);
    });

    test('should return false for falsy download values', () => {
      expect(validateDownload(false)).toBe(false);
      expect(validateDownload(0)).toBe(false);
      expect(validateDownload('')).toBe(false);
    });

    test('should return false for undefined/null (default)', () => {
      expect(validateDownload(undefined)).toBe(false);
      expect(validateDownload(null)).toBe(false);
    });
  });

  describe('generatePdfQRData', () => {
    test('should generate PDF QR data with minimum required fields', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf'
      });

      expect(result.url).toBe('https://example.com/menu.pdf');
      expect(result.pdfUrl).toBe('https://example.com/menu.pdf');
      expect(result.pdfTitle).toBeNull();
      expect(result.download).toBe(false);
      expect(result.fileSize).toBeNull();
      expect(result.note).toBe('Opens PDF in browser');
    });

    test('should generate PDF QR data with all fields', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf',
        pdfTitle: 'Restaurant Menu 2024',
        download: true,
        fileSize: 2500000
      });

      expect(result.pdfUrl).toBe('https://example.com/menu.pdf');
      expect(result.pdfTitle).toBe('Restaurant Menu 2024');
      expect(result.download).toBe(true);
      expect(result.fileSize).toBe(2500000);
      expect(result.note).toContain('Download mode enabled');
    });

    test('should add download parameter when download mode is enabled', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf',
        download: true
      });

      expect(result.url).toBe('https://example.com/menu.pdf?download=1');
      expect(result.download).toBe(true);
    });

    test('should not add download parameter when already present', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf?download=1',
        download: true
      });

      expect(result.url).toBe('https://example.com/menu.pdf?download=1');
    });

    test('should use & separator when URL already has query params', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf?token=abc',
        download: true
      });

      expect(result.url).toBe('https://example.com/menu.pdf?token=abc&download=1');
    });

    test('should not modify URL when download is false', () => {
      const result = generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf',
        download: false
      });

      expect(result.url).toBe('https://example.com/menu.pdf');
      expect(result.note).toBe('Opens PDF in browser');
    });

    test('should handle complex PDF URLs', () => {
      const complexUrl = 'https://cdn.example.com/files/2024/menu.pdf?v=1.2&lang=en';
      const result = generatePdfQRData({
        pdfUrl: complexUrl,
        pdfTitle: 'Multilingual Menu',
        fileSize: 1500000
      });

      expect(result.pdfUrl).toBe(complexUrl);
      expect(result.url).toBe(complexUrl);
      expect(result.pdfTitle).toBe('Multilingual Menu');
      expect(result.fileSize).toBe(1500000);
    });

    test('should validate PDF URL', () => {
      expect(() => generatePdfQRData({
        pdfUrl: 'invalid-url'
      })).toThrow('http://');
    });

    test('should validate PDF title', () => {
      expect(() => generatePdfQRData({
        pdfUrl: 'https://example.com/menu.pdf',
        pdfTitle: 'A'
      })).toThrow('at least 2 characters');
    });
  });

  describe('getPdfQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getPdfQRPlatformInfo();

      expect(info).toHaveProperty('name', 'PDF QR Code');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('features');
      expect(info).toHaveProperty('bestPractices');
      expect(info).toHaveProperty('supportedHosts');
    });

    test('should include use cases', () => {
      const info = getPdfQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
      // Check if at least one use case mentions menus
      const hasMenuUseCase = info.useCases.some(useCase =>
        useCase.toLowerCase().includes('menu')
      );
      expect(hasMenuUseCase).toBe(true);
    });

    test('should describe view and download modes', () => {
      const info = getPdfQRPlatformInfo();

      expect(info.features).toHaveProperty('viewMode');
      expect(info.features).toHaveProperty('downloadMode');
      expect(info.features.viewMode).toContain('browser');
      expect(info.features.downloadMode).toContain('download');
    });

    test('should include best practices', () => {
      const info = getPdfQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });

    test('should list supported hosting platforms', () => {
      const info = getPdfQRPlatformInfo();

      expect(Array.isArray(info.supportedHosts)).toBe(true);
      expect(info.supportedHosts.length).toBeGreaterThan(0);
    });

    test('should include file size recommendations', () => {
      const info = getPdfQRPlatformInfo();

      expect(info.features).toHaveProperty('fileSize');
    });
  });
});
