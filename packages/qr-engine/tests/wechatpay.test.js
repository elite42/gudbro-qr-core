/**
 * WeChat Pay QR Code - Unit Tests
 *
 * Tests for Chinese payment platform (1B+ users)
 * Phase 1: Static merchant QR implementation
 */

const {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  MAX_AMOUNTS,
  validateMerchantId,
  validateCurrency,
  validateAmount,
  validateDescription,
  validateOrderId,
  generateWeChatPayUrl,
  formatAmount,
  getWeChatPayPlatformInfo,
  getCurrencyConversionRate,
  convertCurrency
} = require('../utils/wechatpay');

describe('WeChat Pay QR Code', () => {
  describe('validateMerchantId', () => {
    test('should accept valid 10-digit merchant ID', () => {
      expect(validateMerchantId('1234567890')).toBe('1234567890');
      expect(validateMerchantId('9876543210')).toBe('9876543210');
      expect(validateMerchantId('1000000000')).toBe('1000000000');
    });

    test('should remove spaces and dashes', () => {
      expect(validateMerchantId('123 456 7890')).toBe('1234567890');
      expect(validateMerchantId('123-456-7890')).toBe('1234567890');
    });

    test('should reject invalid merchant IDs', () => {
      expect(() => validateMerchantId('123456789')).toThrow('exactly 10 digits'); // Too short
      expect(() => validateMerchantId('12345678901')).toThrow('exactly 10 digits'); // Too long
      expect(() => validateMerchantId('12345abc90')).toThrow('exactly 10 digits'); // Contains letters
      expect(() => validateMerchantId('')).toThrow('Merchant ID is required');
      expect(() => validateMerchantId(null)).toThrow('Merchant ID is required');
    });
  });

  describe('validateCurrency', () => {
    test('should accept valid currencies', () => {
      expect(validateCurrency('CNY')).toBe('CNY');
      expect(validateCurrency('VND')).toBe('VND');
    });

    test('should normalize to uppercase', () => {
      expect(validateCurrency('cny')).toBe('CNY');
      expect(validateCurrency('vnd')).toBe('VND');
      expect(validateCurrency('CnY')).toBe('CNY');
    });

    test('should return default currency when not provided', () => {
      expect(validateCurrency(undefined)).toBe('CNY');
      expect(validateCurrency(null)).toBe('CNY');
      expect(validateCurrency('')).toBe('CNY');
    });

    test('should reject invalid currencies', () => {
      expect(() => validateCurrency('USD')).toThrow('Currency must be one of');
      expect(() => validateCurrency('EUR')).toThrow('Currency must be one of');
      expect(() => validateCurrency('JPY')).toThrow('Currency must be one of');
    });
  });

  describe('validateAmount', () => {
    test('should accept valid CNY amounts', () => {
      expect(validateAmount(100, 'CNY')).toBe(100);
      expect(validateAmount(1000.50, 'CNY')).toBe(1000.5);
      expect(validateAmount(999999, 'CNY')).toBe(999999);
    });

    test('should accept valid VND amounts', () => {
      expect(validateAmount(100000, 'VND')).toBe(100000);
      expect(validateAmount(5000000, 'VND')).toBe(5000000);
      expect(validateAmount(1000000000, 'VND')).toBe(1000000000);
    });

    test('should return null for empty values', () => {
      expect(validateAmount(undefined)).toBeNull();
      expect(validateAmount(null)).toBeNull();
      expect(validateAmount('')).toBeNull();
    });

    test('should round to 2 decimal places', () => {
      expect(validateAmount(100.123, 'CNY')).toBe(100.12);
      expect(validateAmount(99.999, 'CNY')).toBe(100);
      expect(validateAmount(50.555, 'CNY')).toBe(50.56);
    });

    test('should reject invalid amounts', () => {
      expect(() => validateAmount(0, 'CNY')).toThrow('greater than 0');
      expect(() => validateAmount(-100, 'CNY')).toThrow('greater than 0');
      expect(() => validateAmount('abc', 'CNY')).toThrow('valid number');
    });

    test('should reject amounts exceeding limits', () => {
      expect(() => validateAmount(1000001, 'CNY')).toThrow('not exceed');
      expect(() => validateAmount(1000001, 'CNY')).toThrow('CNY');
      expect(() => validateAmount(5000000001, 'VND')).toThrow('not exceed');
      expect(() => validateAmount(5000000001, 'VND')).toThrow('VND');
    });
  });

  describe('validateDescription', () => {
    test('should accept valid descriptions', () => {
      expect(validateDescription('Restaurant payment')).toBe('Restaurant payment');
      expect(validateDescription('Order #12345')).toBe('Order #12345');
      expect(validateDescription('景点门票')).toBe('景点门票'); // Chinese characters
    });

    test('should return null for empty values', () => {
      expect(validateDescription(undefined)).toBeNull();
      expect(validateDescription(null)).toBeNull();
      expect(validateDescription('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDescription('  Payment  ')).toBe('Payment');
      expect(validateDescription('   Order   ')).toBe('Order');
    });

    test('should reject descriptions that are too long', () => {
      const longDesc = 'A'.repeat(256);
      expect(() => validateDescription(longDesc)).toThrow('not exceed 255 characters');
    });
  });

  describe('validateOrderId', () => {
    test('should accept valid order IDs', () => {
      expect(validateOrderId('ORDER123')).toBe('ORDER123');
      expect(validateOrderId('order-456')).toBe('order-456');
      expect(validateOrderId('order_789')).toBe('order_789');
      expect(validateOrderId('12345')).toBe('12345');
    });

    test('should return null for empty values', () => {
      expect(validateOrderId(undefined)).toBeNull();
      expect(validateOrderId(null)).toBeNull();
      expect(validateOrderId('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateOrderId('  ORDER123  ')).toBe('ORDER123');
    });

    test('should reject invalid order IDs', () => {
      expect(() => validateOrderId('A'.repeat(33))).toThrow('1-32 characters'); // Too long
      expect(() => validateOrderId('order@123')).toThrow('alphanumeric'); // Invalid char
      expect(() => validateOrderId('order#123')).toThrow('alphanumeric'); // Invalid char
      expect(() => validateOrderId('order 123')).toThrow('alphanumeric'); // Space
    });
  });

  describe('generateWeChatPayUrl', () => {
    test('should generate WeChat Pay URL with merchant ID only', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890'
      });

      expect(result.url).toContain('weixin://wxpay/bizpayurl?mchid=1234567890');
      expect(result.merchantId).toBe('1234567890');
      expect(result.currency).toBe('CNY');
      expect(result.amount).toBeNull();
      expect(result.description).toBeNull();
      expect(result.orderId).toBeNull();
      expect(result.implementationPhase).toBe('static');
      expect(result.note).toContain('customer enters amount');
    });

    test('should generate WeChat Pay URL with amount (CNY)', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        amount: 100,
        currency: 'CNY'
      });

      expect(result.url).toContain('1234567890');
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('CNY');
    });

    test('should generate WeChat Pay URL with amount (VND)', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        amount: 500000,
        currency: 'VND'
      });

      expect(result.url).toContain('1234567890');
      expect(result.amount).toBe(500000);
      expect(result.currency).toBe('VND');
    });

    test('should generate WeChat Pay URL with description', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        description: 'Restaurant payment for Table 5'
      });

      expect(result.description).toBe('Restaurant payment for Table 5');
    });

    test('should generate WeChat Pay URL with order ID', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        orderId: 'ORDER-2024-001'
      });

      expect(result.orderId).toBe('ORDER-2024-001');
    });

    test('should generate WeChat Pay URL with all fields', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        amount: 150,
        currency: 'CNY',
        description: 'Dinner at Gudbro Restaurant',
        orderId: 'ORDER-123'
      });

      expect(result.merchantId).toBe('1234567890');
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('CNY');
      expect(result.description).toBe('Dinner at Gudbro Restaurant');
      expect(result.orderId).toBe('ORDER-123');
    });

    test('should default to CNY when currency not specified', () => {
      const result = generateWeChatPayUrl({
        merchantId: '1234567890',
        amount: 100
      });

      expect(result.currency).toBe('CNY');
    });

    test('should handle merchant ID with spaces', () => {
      const result = generateWeChatPayUrl({
        merchantId: '123 456 7890'
      });

      expect(result.merchantId).toBe('1234567890');
      expect(result.url).toContain('1234567890');
    });
  });

  describe('formatAmount', () => {
    test('should format CNY amounts', () => {
      const formatted = formatAmount(100, 'CNY');
      expect(formatted).toContain('100');
      expect(formatted).toContain('¥'); // CNY symbol
    });

    test('should format VND amounts', () => {
      const formatted = formatAmount(100000, 'VND');
      expect(formatted).toContain('100');
      expect(formatted).toContain('₫'); // VND symbol
    });

    test('should return null for empty amounts', () => {
      expect(formatAmount(null)).toBeNull();
      expect(formatAmount(undefined)).toBeNull();
    });
  });

  describe('getWeChatPayPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getWeChatPayPlatformInfo();

      expect(info).toHaveProperty('name', 'WeChat Pay');
      expect(info).toHaveProperty('country', 'China');
      expect(info).toHaveProperty('users', '1B+');
      expect(info).toHaveProperty('market');
      expect(info).toHaveProperty('implementationPhase');
      expect(info).toHaveProperty('supportedCurrencies');
      expect(info).toHaveProperty('usageNotes');
      expect(info).toHaveProperty('merchantSetup');
      expect(Array.isArray(info.usageNotes)).toBe(true);
      expect(Array.isArray(info.merchantSetup)).toBe(true);
      expect(info.supportedCurrencies).toEqual(['CNY', 'VND']);
    });
  });

  describe('getCurrencyConversionRate', () => {
    test('should return conversion rate CNY to VND', () => {
      const rate = getCurrencyConversionRate('CNY', 'VND');
      expect(rate).toBe(3500);
    });

    test('should return conversion rate VND to CNY', () => {
      const rate = getCurrencyConversionRate('VND', 'CNY');
      expect(rate).toBe(0.00029);
    });

    test('should return 1 for same currency', () => {
      const rate = getCurrencyConversionRate('CNY', 'CNY');
      expect(rate).toBe(1);
    });
  });

  describe('convertCurrency', () => {
    test('should convert CNY to VND', () => {
      const converted = convertCurrency(100, 'CNY', 'VND');
      expect(converted).toBe(350000); // 100 CNY * 3500
    });

    test('should convert VND to CNY', () => {
      const converted = convertCurrency(350000, 'VND', 'CNY');
      expect(converted).toBe(101.5); // 350000 * 0.00029
    });

    test('should return same amount for same currency', () => {
      const converted = convertCurrency(100, 'CNY', 'CNY');
      expect(converted).toBe(100);
    });

    test('should round to 2 decimal places', () => {
      const converted = convertCurrency(100.123, 'CNY', 'CNY');
      expect(converted).toBe(100.12);
    });
  });

  describe('Constants', () => {
    test('should have correct supported currencies', () => {
      expect(SUPPORTED_CURRENCIES).toEqual(['CNY', 'VND']);
    });

    test('should have CNY as default currency', () => {
      expect(DEFAULT_CURRENCY).toBe('CNY');
    });

    test('should have correct max amounts', () => {
      expect(MAX_AMOUNTS.CNY).toBe(1000000);
      expect(MAX_AMOUNTS.VND).toBe(5000000000);
    });
  });
});
