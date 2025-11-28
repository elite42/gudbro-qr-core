/**
 * Zalo Social QR Code - Unit Tests
 *
 * Tests for Vietnam's #1 messaging app (74M+ users)
 */

const {
  validateVietnamesePhone,
  validateZaloId,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  generateZaloUrl,
  getZaloPlatformInfo
} = require('../utils/zalo');

describe('Zalo Social QR Code', () => {
  describe('validateVietnamesePhone', () => {
    test('should accept valid Vietnamese phone numbers (international format)', () => {
      expect(validateVietnamesePhone('84912345678')).toBe('84912345678');
      expect(validateVietnamesePhone('84987654321')).toBe('84987654321');
      expect(validateVietnamesePhone('84356789012')).toBe('84356789012');
      expect(validateVietnamesePhone('84567890123')).toBe('84567890123');
      expect(validateVietnamesePhone('84789012345')).toBe('84789012345');
    });

    test('should accept valid Vietnamese phone numbers (local format)', () => {
      expect(validateVietnamesePhone('0912345678')).toBe('0912345678');
      expect(validateVietnamesePhone('0987654321')).toBe('0987654321');
      expect(validateVietnamesePhone('0356789012')).toBe('0356789012');
      expect(validateVietnamesePhone('0567890123')).toBe('0567890123');
      expect(validateVietnamesePhone('0789012345')).toBe('0789012345');
    });

    test('should remove spaces, dashes, and parentheses', () => {
      expect(validateVietnamesePhone('091 234 5678')).toBe('0912345678');
      expect(validateVietnamesePhone('091-234-5678')).toBe('0912345678');
      expect(validateVietnamesePhone('(091) 234-5678')).toBe('0912345678');
      expect(validateVietnamesePhone('84 91 234 5678')).toBe('84912345678');
    });

    test('should reject invalid phone numbers', () => {
      expect(() => validateVietnamesePhone('123456789')).toThrow('Invalid Vietnamese phone number');
      expect(() => validateVietnamesePhone('01234567890')).toThrow(); // Wrong prefix
      expect(() => validateVietnamesePhone('8491234567')).toThrow(); // Too short
      expect(() => validateVietnamesePhone('849123456789')).toThrow(); // Too long
      expect(() => validateVietnamesePhone('0212345678')).toThrow(); // Invalid prefix (02)
      expect(() => validateVietnamesePhone('0112345678')).toThrow(); // Invalid prefix (01)
      expect(() => validateVietnamesePhone('abc')).toThrow();
      expect(() => validateVietnamesePhone('')).toThrow('Phone number is required');
      expect(() => validateVietnamesePhone(null)).toThrow('Phone number is required');
    });

    test('should accept all valid Vietnamese mobile prefixes', () => {
      // 03x series
      expect(() => validateVietnamesePhone('0312345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0332345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0362345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0382345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0392345678')).not.toThrow();

      // 05x series
      expect(() => validateVietnamesePhone('0512345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0562345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0592345678')).not.toThrow();

      // 07x series
      expect(() => validateVietnamesePhone('0712345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0762345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0792345678')).not.toThrow();

      // 08x series
      expect(() => validateVietnamesePhone('0812345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0862345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0892345678')).not.toThrow();

      // 09x series
      expect(() => validateVietnamesePhone('0912345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0962345678')).not.toThrow();
      expect(() => validateVietnamesePhone('0992345678')).not.toThrow();
    });
  });

  describe('validateZaloId', () => {
    test('should accept valid Zalo IDs', () => {
      expect(validateZaloId('gudbro')).toBe('gudbro');
      expect(validateZaloId('restaurant123')).toBe('restaurant123');
      expect(validateZaloId('user_name_123')).toBe('user_name_123');
      expect(validateZaloId('UPPERCASE')).toBe('UPPERCASE');
      expect(validateZaloId('MixedCase123')).toBe('MixedCase123');
    });

    test('should trim whitespace', () => {
      expect(validateZaloId('  gudbro  ')).toBe('gudbro');
      expect(validateZaloId('   zalouser   ')).toBe('zalouser');
    });

    test('should reject invalid Zalo IDs', () => {
      expect(() => validateZaloId('short')).toThrow('6-30 alphanumeric'); // Too short (5 chars)
      expect(() => validateZaloId('a'.repeat(31))).toThrow('6-30 alphanumeric'); // Too long
      expect(() => validateZaloId('user@name')).toThrow(); // Invalid character (@)
      expect(() => validateZaloId('user-name')).toThrow(); // Invalid character (-)
      expect(() => validateZaloId('user name')).toThrow(); // Space not allowed
      expect(() => validateZaloId('user.name')).toThrow(); // Dot not allowed
      expect(() => validateZaloId('')).toThrow('Zalo ID is required');
      expect(() => validateZaloId(null)).toThrow('Zalo ID is required');
    });
  });

  describe('validateDisplayName', () => {
    test('should accept valid display names', () => {
      expect(validateDisplayName('Gudbro Restaurant')).toBe('Gudbro Restaurant');
      expect(validateDisplayName('Nguyen Van A')).toBe('Nguyen Van A');
      expect(validateDisplayName('Cafe 24/7')).toBe('Cafe 24/7');
    });

    test('should return null for empty values', () => {
      expect(validateDisplayName(undefined)).toBeNull();
      expect(validateDisplayName(null)).toBeNull();
      expect(validateDisplayName('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDisplayName('  Gudbro  ')).toBe('Gudbro');
      expect(validateDisplayName('   Cafe   ')).toBe('Cafe');
    });

    test('should reject invalid display names', () => {
      expect(() => validateDisplayName('A')).toThrow('at least 2 characters');
      expect(() => validateDisplayName('A'.repeat(101))).toThrow('not exceed 100 characters');
    });
  });

  describe('validateMessage', () => {
    test('should accept valid messages', () => {
      expect(validateMessage('Xin chào')).toBe('Xin chào');
      expect(validateMessage('Hello, I want to make a reservation')).toBe('Hello, I want to make a reservation');
      expect(validateMessage('Tôi muốn đặt bàn cho 4 người')).toBe('Tôi muốn đặt bàn cho 4 người');
    });

    test('should return null for empty values', () => {
      expect(validateMessage(undefined)).toBeNull();
      expect(validateMessage(null)).toBeNull();
      expect(validateMessage('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateMessage('  Hello  ')).toBe('Hello');
      expect(validateMessage('   Xin chào   ')).toBe('Xin chào');
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(501);
      expect(() => validateMessage(longMessage)).toThrow('not exceed 500 characters');
    });
  });

  describe('normalizePhoneToInternational', () => {
    test('should convert local format to international', () => {
      expect(normalizePhoneToInternational('0912345678')).toBe('84912345678');
      expect(normalizePhoneToInternational('0987654321')).toBe('84987654321');
    });

    test('should keep international format unchanged', () => {
      expect(normalizePhoneToInternational('84912345678')).toBe('84912345678');
      expect(normalizePhoneToInternational('84987654321')).toBe('84987654321');
    });

    test('should handle +84 format', () => {
      expect(normalizePhoneToInternational('+84912345678')).toBe('84912345678');
      expect(normalizePhoneToInternational('+84987654321')).toBe('84987654321');
    });

    test('should remove spaces and dashes', () => {
      expect(normalizePhoneToInternational('091 234 5678')).toBe('84912345678');
      expect(normalizePhoneToInternational('091-234-5678')).toBe('84912345678');
    });
  });

  describe('generateZaloUrl', () => {
    test('should generate Zalo URL with phone number', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678'
      });

      expect(result.url).toBe('https://zalo.me/84912345678');
      expect(result.identifier).toBe('84912345678');
      expect(result.identifierType).toBe('phone');
      expect(result.rawIdentifier).toBe('0912345678');
      expect(result.displayName).toBeNull();
      expect(result.message).toBeNull();
    });

    test('should generate Zalo URL with Zalo ID', () => {
      const result = generateZaloUrl({
        zaloId: 'gudbrovietnam'
      });

      expect(result.url).toBe('https://zalo.me/gudbrovietnam');
      expect(result.identifier).toBe('gudbrovietnam');
      expect(result.identifierType).toBe('zaloId');
      expect(result.rawIdentifier).toBe('gudbrovietnam');
    });

    test('should generate Zalo URL with display name', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        displayName: 'Gudbro Restaurant'
      });

      expect(result.url).toBe('https://zalo.me/84912345678');
      expect(result.displayName).toBe('Gudbro Restaurant');
    });

    test('should generate Zalo URL with message', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        message: 'Xin chào, tôi muốn đặt bàn'
      });

      expect(result.url).toContain('https://zalo.me/84912345678?msg=');
      expect(result.url).toContain('Xin%20ch%C3%A0o'); // URL encoded
      expect(result.message).toBe('Xin chào, tôi muốn đặt bàn');
    });

    test('should generate Zalo URL with all fields', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        displayName: 'Gudbro Restaurant',
        message: 'Hello, I want to book a table'
      });

      expect(result.url).toContain('https://zalo.me/84912345678?msg=');
      expect(result.url).toContain('Hello'); // Message encoded
      expect(result.identifier).toBe('84912345678');
      expect(result.displayName).toBe('Gudbro Restaurant');
      expect(result.message).toBe('Hello, I want to book a table');
    });

    test('should prioritize phone number over Zalo ID', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        zaloId: 'gudbrovietnam'
      });

      expect(result.url).toBe('https://zalo.me/84912345678');
      expect(result.identifierType).toBe('phone');
    });

    test('should handle international phone format', () => {
      const result = generateZaloUrl({
        phoneNumber: '84912345678'
      });

      expect(result.url).toBe('https://zalo.me/84912345678');
      expect(result.identifier).toBe('84912345678');
    });

    test('should encode special characters in message', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        message: 'Booking #123 for 4 people @ 7pm'
      });

      expect(result.url).toContain('?msg=');
      expect(result.url).toContain('%23'); // # encoded
      expect(result.url).toContain('%40'); // @ encoded
    });

    test('should throw error when neither phone nor ID provided', () => {
      expect(() => generateZaloUrl({})).toThrow('Either phoneNumber or zaloId is required');
      expect(() => generateZaloUrl({ displayName: 'Test' })).toThrow('Either phoneNumber or zaloId is required');
    });

    test('should handle Vietnamese characters in message', () => {
      const result = generateZaloUrl({
        phoneNumber: '0912345678',
        message: 'Tôi muốn đặt bàn cho 4 người'
      });

      expect(result.url).toContain('?msg=');
      expect(result.message).toBe('Tôi muốn đặt bàn cho 4 người');
      // URL should encode Vietnamese characters
      expect(result.url).toContain('%');
    });
  });

  describe('getZaloPlatformInfo', () => {
    test('should return Zalo platform information', () => {
      const info = getZaloPlatformInfo();

      expect(info).toHaveProperty('name', 'Zalo');
      expect(info).toHaveProperty('country', 'Vietnam');
      expect(info).toHaveProperty('users', '74M+');
      expect(info).toHaveProperty('market');
      expect(info).toHaveProperty('usageNotes');
      expect(Array.isArray(info.usageNotes)).toBe(true);
      expect(info.usageNotes.length).toBeGreaterThan(0);
    });
  });
});
