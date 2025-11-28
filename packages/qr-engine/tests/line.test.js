/**
 * LINE QR Code - Unit Tests
 *
 * Tests for LINE messaging app (Thailand, Taiwan, Japan - 165M+ users)
 */

const {
  validateLineId,
  validateOfficialAccountId,
  validateLinePhone,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  detectCountryFromPhone,
  generateLineUrl,
  getLinePlatformInfo
} = require('../utils/line');

describe('LINE QR Code', () => {
  describe('validateLineId', () => {
    test('should accept valid LINE IDs', () => {
      expect(validateLineId('user123')).toBe('user123');
      expect(validateLineId('john.doe')).toBe('john.doe');
      expect(validateLineId('user_name')).toBe('user_name');
      expect(validateLineId('test.user_123')).toBe('test.user_123');
      expect(validateLineId('UPPERCASE')).toBe('UPPERCASE');
      expect(validateLineId('1234')).toBe('1234'); // Minimum 4 chars
      expect(validateLineId('12345678901234567890')).toBe('12345678901234567890'); // Maximum 20 chars
    });

    test('should trim whitespace', () => {
      expect(validateLineId('  user123  ')).toBe('user123');
      expect(validateLineId('   john.doe   ')).toBe('john.doe');
    });

    test('should reject invalid LINE IDs', () => {
      expect(() => validateLineId('abc')).toThrow('4-20 characters'); // Too short
      expect(() => validateLineId('a'.repeat(21))).toThrow('4-20 characters'); // Too long
      expect(() => validateLineId('user@name')).toThrow(); // Invalid character (@)
      expect(() => validateLineId('user-name')).toThrow(); // Invalid character (-)
      expect(() => validateLineId('user name')).toThrow(); // Space not allowed
      expect(() => validateLineId('user#name')).toThrow(); // Invalid character (#)
      expect(() => validateLineId('')).toThrow('LINE ID is required');
      expect(() => validateLineId(null)).toThrow('LINE ID is required');
    });
  });

  describe('validateOfficialAccountId', () => {
    test('should accept valid Official Account IDs', () => {
      expect(validateOfficialAccountId('@business')).toBe('@business');
      expect(validateOfficialAccountId('@gudbrovietnam')).toBe('@gudbrovietnam');
      expect(validateOfficialAccountId('@company_name')).toBe('@company_name');
      expect(validateOfficialAccountId('@UPPERCASE')).toBe('@UPPERCASE');
      expect(validateOfficialAccountId('@abc')).toBe('@abc'); // Minimum: @ + 3 chars
      expect(validateOfficialAccountId('@' + 'a'.repeat(20))).toBe('@' + 'a'.repeat(20)); // Maximum: @ + 20 chars
    });

    test('should trim whitespace', () => {
      expect(validateOfficialAccountId('  @business  ')).toBe('@business');
      expect(validateOfficialAccountId('   @company   ')).toBe('@company');
    });

    test('should reject invalid Official Account IDs', () => {
      expect(() => validateOfficialAccountId('business')).toThrow('must start with @'); // Missing @
      expect(() => validateOfficialAccountId('@ab')).toThrow(); // Too short (@ + 2 chars)
      expect(() => validateOfficialAccountId('@' + 'a'.repeat(21))).toThrow(); // Too long
      expect(() => validateOfficialAccountId('@user@name')).toThrow(); // Extra @
      expect(() => validateOfficialAccountId('@user-name')).toThrow(); // Invalid character (-)
      expect(() => validateOfficialAccountId('@user.name')).toThrow(); // Dot not allowed
      expect(() => validateOfficialAccountId('')).toThrow('Official Account ID is required');
      expect(() => validateOfficialAccountId(null)).toThrow('Official Account ID is required');
    });
  });

  describe('validateLinePhone', () => {
    test('should accept valid Thailand phone numbers', () => {
      expect(validateLinePhone('+66812345678')).toBe('+66812345678');
      expect(validateLinePhone('66912345678')).toBe('66912345678');
      expect(validateLinePhone('+6681234567')).toBe('+6681234567'); // 8 digits
      expect(validateLinePhone('+668123456789')).toBe('+668123456789'); // 10 digits
    });

    test('should accept valid Taiwan phone numbers', () => {
      expect(validateLinePhone('+886912345678')).toBe('+886912345678');
      expect(validateLinePhone('886912345678')).toBe('886912345678');
      expect(validateLinePhone('+88691234567')).toBe('+88691234567'); // 8 digits
    });

    test('should accept valid Japan phone numbers', () => {
      expect(validateLinePhone('+819012345678')).toBe('+819012345678');
      expect(validateLinePhone('819012345678')).toBe('819012345678');
      expect(validateLinePhone('+8190123456')).toBe('+8190123456'); // 8 digits
    });

    test('should remove spaces, dashes, and parentheses', () => {
      expect(validateLinePhone('+66 81 234 5678')).toBe('+66812345678');
      expect(validateLinePhone('+66-81-234-5678')).toBe('+66812345678');
      expect(validateLinePhone('(+66) 812345678')).toBe('+66812345678');
    });

    test('should reject invalid phone numbers', () => {
      expect(() => validateLinePhone('+1234567890')).toThrow(); // Wrong country code
      expect(() => validateLinePhone('+6681234567890123')).toThrow(); // Too long
      expect(() => validateLinePhone('+6681234')).toThrow(); // Too short
      expect(() => validateLinePhone('abc')).toThrow();
      expect(() => validateLinePhone('')).toThrow('Phone number is required');
      expect(() => validateLinePhone(null)).toThrow('Phone number is required');
    });
  });

  describe('validateDisplayName', () => {
    test('should accept valid display names', () => {
      expect(validateDisplayName('Gudbro Restaurant')).toBe('Gudbro Restaurant');
      expect(validateDisplayName('Thai Massage')).toBe('Thai Massage');
      expect(validateDisplayName('台灣餐廳')).toBe('台灣餐廳'); // Chinese characters
      expect(validateDisplayName('タイ料理')).toBe('タイ料理'); // Japanese characters
      expect(validateDisplayName('ร้านอาหาร')).toBe('ร้านอาหาร'); // Thai characters
    });

    test('should return null for empty values', () => {
      expect(validateDisplayName(undefined)).toBeNull();
      expect(validateDisplayName(null)).toBeNull();
      expect(validateDisplayName('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDisplayName('  Gudbro  ')).toBe('Gudbro');
    });

    test('should reject invalid display names', () => {
      expect(() => validateDisplayName('A')).toThrow('at least 2 characters');
      expect(() => validateDisplayName('A'.repeat(101))).toThrow('not exceed 100 characters');
    });
  });

  describe('validateMessage', () => {
    test('should accept valid messages', () => {
      expect(validateMessage('สวัสดี')).toBe('สวัสดี'); // Thai "Hello"
      expect(validateMessage('你好')).toBe('你好'); // Chinese "Hello"
      expect(validateMessage('こんにちは')).toBe('こんにちは'); // Japanese "Hello"
      expect(validateMessage('Hello, I want to book a massage')).toBe('Hello, I want to book a massage');
    });

    test('should return null for empty values', () => {
      expect(validateMessage(undefined)).toBeNull();
      expect(validateMessage(null)).toBeNull();
      expect(validateMessage('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateMessage('  Hello  ')).toBe('Hello');
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(501);
      expect(() => validateMessage(longMessage)).toThrow('not exceed 500 characters');
    });
  });

  describe('normalizePhoneToInternational', () => {
    test('should add + if missing', () => {
      expect(normalizePhoneToInternational('66812345678')).toBe('+66812345678');
      expect(normalizePhoneToInternational('886912345678')).toBe('+886912345678');
      expect(normalizePhoneToInternational('819012345678')).toBe('+819012345678');
    });

    test('should keep + if already present', () => {
      expect(normalizePhoneToInternational('+66812345678')).toBe('+66812345678');
      expect(normalizePhoneToInternational('+886912345678')).toBe('+886912345678');
    });

    test('should remove spaces and dashes', () => {
      expect(normalizePhoneToInternational('66 81 234 5678')).toBe('+66812345678');
      expect(normalizePhoneToInternational('66-81-234-5678')).toBe('+66812345678');
    });
  });

  describe('detectCountryFromPhone', () => {
    test('should detect Thailand (+66)', () => {
      const country = detectCountryFromPhone('+66812345678');
      expect(country.code).toBe('TH');
      expect(country.name).toBe('Thailand');
      expect(country.dialCode).toBe('+66');
    });

    test('should detect Taiwan (+886)', () => {
      const country = detectCountryFromPhone('+886912345678');
      expect(country.code).toBe('TW');
      expect(country.name).toBe('Taiwan');
      expect(country.dialCode).toBe('+886');
    });

    test('should detect Japan (+81)', () => {
      const country = detectCountryFromPhone('+819012345678');
      expect(country.code).toBe('JP');
      expect(country.name).toBe('Japan');
      expect(country.dialCode).toBe('+81');
    });

    test('should return UNKNOWN for unsupported countries', () => {
      const country = detectCountryFromPhone('+1234567890');
      expect(country.code).toBe('UNKNOWN');
    });
  });

  describe('generateLineUrl', () => {
    test('should generate LINE URL with LINE ID', () => {
      const result = generateLineUrl({
        lineId: 'john.doe'
      });

      expect(result.url).toBe('https://line.me/ti/p/~john.doe');
      expect(result.identifier).toBe('john.doe');
      expect(result.identifierType).toBe('lineId');
      expect(result.accountType).toBe('personal');
    });

    test('should generate LINE URL with phone number (Thailand)', () => {
      const result = generateLineUrl({
        phoneNumber: '+66812345678'
      });

      expect(result.url).toBe('https://line.me/ti/p/+66812345678');
      expect(result.identifier).toBe('+66812345678');
      expect(result.identifierType).toBe('phone');
      expect(result.accountType).toBe('personal');
      expect(result.country.code).toBe('TH');
      expect(result.country.name).toBe('Thailand');
    });

    test('should generate LINE URL with phone number (Taiwan)', () => {
      const result = generateLineUrl({
        phoneNumber: '886912345678'
      });

      expect(result.url).toBe('https://line.me/ti/p/+886912345678');
      expect(result.country.code).toBe('TW');
    });

    test('should generate LINE URL with phone number (Japan)', () => {
      const result = generateLineUrl({
        phoneNumber: '+819012345678'
      });

      expect(result.url).toBe('https://line.me/ti/p/+819012345678');
      expect(result.country.code).toBe('JP');
    });

    test('should generate LINE URL with Official Account ID', () => {
      const result = generateLineUrl({
        officialAccountId: '@gudbrovietnam'
      });

      expect(result.url).toBe('https://line.me/R/ti/p/@gudbrovietnam');
      expect(result.identifier).toBe('@gudbrovietnam');
      expect(result.identifierType).toBe('officialAccount');
      expect(result.accountType).toBe('business');
    });

    test('should generate LINE URL with display name', () => {
      const result = generateLineUrl({
        lineId: 'user123',
        displayName: 'Gudbro Restaurant'
      });

      expect(result.displayName).toBe('Gudbro Restaurant');
    });

    test('should generate LINE URL with message', () => {
      const result = generateLineUrl({
        lineId: 'user123',
        message: 'สวัสดี, ฉันต้องการจอง'
      });

      expect(result.url).toContain('https://line.me/ti/p/~user123');
      expect(result.url).toContain('?msg=');
      expect(result.message).toBe('สวัสดี, ฉันต้องการจอง');
    });

    test('should generate LINE URL with all fields', () => {
      const result = generateLineUrl({
        lineId: 'thai.friend',
        displayName: 'Thai Massage',
        message: 'Hello, I want to book a massage'
      });

      expect(result.identifier).toBe('thai.friend');
      expect(result.displayName).toBe('Thai Massage');
      expect(result.message).toBe('Hello, I want to book a massage');
      expect(result.url).toContain('?msg=');
    });

    test('should prioritize Official Account over LINE ID', () => {
      const result = generateLineUrl({
        officialAccountId: '@business',
        lineId: 'user123'
      });

      expect(result.url).toBe('https://line.me/R/ti/p/@business');
      expect(result.identifierType).toBe('officialAccount');
    });

    test('should prioritize LINE ID over phone number', () => {
      const result = generateLineUrl({
        lineId: 'user123',
        phoneNumber: '+66812345678'
      });

      expect(result.url).toBe('https://line.me/ti/p/~user123');
      expect(result.identifierType).toBe('lineId');
    });

    test('should throw error when no identifier provided', () => {
      expect(() => generateLineUrl({})).toThrow('lineId, phoneNumber, or officialAccountId is required');
      expect(() => generateLineUrl({ displayName: 'Test' })).toThrow('lineId, phoneNumber, or officialAccountId is required');
    });

    test('should encode special characters in message', () => {
      const result = generateLineUrl({
        lineId: 'user123',
        message: 'Booking #123 @ 7pm'
      });

      expect(result.url).toContain('?msg=');
      expect(result.url).toContain('%23'); // # encoded
      expect(result.url).toContain('%40'); // @ encoded
    });
  });

  describe('getLinePlatformInfo', () => {
    test('should return platform information', () => {
      const info = getLinePlatformInfo();

      expect(info).toHaveProperty('name', 'LINE');
      expect(info).toHaveProperty('countries');
      expect(info).toHaveProperty('totalUsers', '165M+');
      expect(info).toHaveProperty('market');
      expect(info).toHaveProperty('tourismContext');
      expect(info).toHaveProperty('accountTypes');
      expect(info).toHaveProperty('supportedCountries');
      expect(info).toHaveProperty('usageNotes');
      expect(Array.isArray(info.countries)).toBe(true);
      expect(Array.isArray(info.usageNotes)).toBe(true);
    });

    test('should include all 3 countries', () => {
      const info = getLinePlatformInfo();

      expect(info.countries.length).toBe(3);

      const countryCodes = info.countries.map(c => c.code);
      expect(countryCodes).toContain('TH');
      expect(countryCodes).toContain('TW');
      expect(countryCodes).toContain('JP');
    });

    test('should include tourism context', () => {
      const info = getLinePlatformInfo();

      expect(info.tourismContext).toHaveProperty('vietnamThailandTourism');
      expect(info.tourismContext.vietnamThailandTourism).toContain('800K');
    });

    test('should include account types', () => {
      const info = getLinePlatformInfo();

      expect(info.accountTypes).toHaveProperty('personal');
      expect(info.accountTypes).toHaveProperty('business');
      expect(info.accountTypes.business.identifier).toContain('@');
    });
  });
});
