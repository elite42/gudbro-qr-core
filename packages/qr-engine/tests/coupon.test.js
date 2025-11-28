/**
 * Coupon QR Code - Unit Tests
 *
 * Tests for Coupon QR codes
 * Digital coupons, vouchers, and promotional codes
 * Use Cases: Restaurant discounts, loyalty rewards, promotional campaigns
 */

const {
  validateCouponCode,
  validateCouponTitle,
  validateDescription,
  validateDiscount,
  validateDate,
  validateMinimumPurchase,
  validateMaxUses,
  validateTerms,
  generateCouponQRData,
  getCouponQRPlatformInfo
} = require('../utils/coupon');

describe('Coupon QR Code', () => {
  describe('validateCouponCode', () => {
    test('should accept valid coupon codes', () => {
      expect(validateCouponCode('SAVE20')).toBe('SAVE20');
      expect(validateCouponCode('HAPPY-HOUR')).toBe('HAPPY-HOUR');
      expect(validateCouponCode('FIRST_TIME_50')).toBe('FIRST_TIME_50');
      expect(validateCouponCode('abc123')).toBe('ABC123');
    });

    test('should convert to uppercase', () => {
      expect(validateCouponCode('save20')).toBe('SAVE20');
      expect(validateCouponCode('HaPpY-HoUr')).toBe('HAPPY-HOUR');
    });

    test('should trim whitespace', () => {
      expect(validateCouponCode('  SAVE20  ')).toBe('SAVE20');
    });

    test('should accept codes with numbers', () => {
      expect(validateCouponCode('SAVE2024')).toBe('SAVE2024');
      expect(validateCouponCode('20OFF')).toBe('20OFF');
    });

    test('should accept codes with hyphens', () => {
      expect(validateCouponCode('HAPPY-HOUR')).toBe('HAPPY-HOUR');
      expect(validateCouponCode('BUY-ONE-GET-ONE')).toBe('BUY-ONE-GET-ONE');
    });

    test('should accept codes with underscores', () => {
      expect(validateCouponCode('FIRST_TIME')).toBe('FIRST_TIME');
      expect(validateCouponCode('VIP_MEMBER')).toBe('VIP_MEMBER');
    });

    test('should reject empty coupon code', () => {
      expect(() => validateCouponCode('')).toThrow('Coupon code is required');
      expect(() => validateCouponCode(null)).toThrow('Coupon code is required');
      expect(() => validateCouponCode(undefined)).toThrow('Coupon code is required');
    });

    test('should reject codes that are too short', () => {
      expect(() => validateCouponCode('AB')).toThrow('at least 3 characters');
      expect(() => validateCouponCode('A')).toThrow('at least 3 characters');
    });

    test('should reject codes that are too long', () => {
      const longCode = 'A'.repeat(51);
      expect(() => validateCouponCode(longCode)).toThrow('not exceed 50 characters');
    });

    test('should reject codes with invalid characters', () => {
      expect(() => validateCouponCode('SAVE 20')).toThrow('can only contain');
      expect(() => validateCouponCode('SAVE!20')).toThrow('can only contain');
      expect(() => validateCouponCode('SAVE@20')).toThrow('can only contain');
      expect(() => validateCouponCode('SAVE.20')).toThrow('can only contain');
    });
  });

  describe('validateCouponTitle', () => {
    test('should accept valid coupon titles', () => {
      expect(validateCouponTitle('20% Off All Items')).toBe('20% Off All Items');
      expect(validateCouponTitle('Happy Hour Special')).toBe('Happy Hour Special');
      expect(validateCouponTitle('Free Appetizer')).toBe('Free Appetizer');
    });

    test('should trim whitespace', () => {
      expect(validateCouponTitle('  Special Offer  ')).toBe('Special Offer');
    });

    test('should reject empty title', () => {
      expect(() => validateCouponTitle('')).toThrow('Coupon title is required');
      expect(() => validateCouponTitle(null)).toThrow('Coupon title is required');
      expect(() => validateCouponTitle(undefined)).toThrow('Coupon title is required');
    });

    test('should reject titles that are too short', () => {
      expect(() => validateCouponTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validateCouponTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateDescription', () => {
    test('should accept valid descriptions', () => {
      expect(validateDescription('Get 20% off your entire meal')).toBe('Get 20% off your entire meal');
      expect(validateDescription('Valid for lunch and dinner')).toBe('Valid for lunch and dinner');
    });

    test('should return null for empty values', () => {
      expect(validateDescription(undefined)).toBeNull();
      expect(validateDescription(null)).toBeNull();
      expect(validateDescription('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDescription('  Description  ')).toBe('Description');
    });

    test('should reject descriptions that are too long', () => {
      const longDesc = 'A'.repeat(1001);
      expect(() => validateDescription(longDesc)).toThrow('not exceed 1000 characters');
    });
  });

  describe('validateDiscount', () => {
    test('should validate percentage discount', () => {
      const result = validateDiscount('percentage', 20);
      expect(result.type).toBe('percentage');
      expect(result.value).toBe(20);
    });

    test('should validate fixed discount', () => {
      const result = validateDiscount('fixed', 100000);
      expect(result.type).toBe('fixed');
      expect(result.value).toBe(100000);
    });

    test('should validate BOGO discount', () => {
      const result = validateDiscount('bogo', null);
      expect(result.type).toBe('bogo');
      expect(result.value).toBeNull();
    });

    test('should validate free-item discount', () => {
      const result = validateDiscount('free-item');
      expect(result.type).toBe('free-item');
      expect(result.value).toBeNull();
    });

    test('should validate free-shipping discount', () => {
      const result = validateDiscount('free-shipping');
      expect(result.type).toBe('free-shipping');
      expect(result.value).toBeNull();
    });

    test('should normalize discount type to lowercase', () => {
      const result = validateDiscount('PERCENTAGE', 20);
      expect(result.type).toBe('percentage');
    });

    test('should return null for empty discount type', () => {
      expect(validateDiscount(null)).toBeNull();
      expect(validateDiscount(undefined)).toBeNull();
    });

    test('should reject invalid discount type', () => {
      expect(() => validateDiscount('invalid', 20)).toThrow('must be one of');
    });

    test('should reject percentage discount out of range', () => {
      expect(() => validateDiscount('percentage', 0)).toThrow('between 0 and 100');
      expect(() => validateDiscount('percentage', -10)).toThrow('between 0 and 100');
      expect(() => validateDiscount('percentage', 101)).toThrow('between 0 and 100');
    });

    test('should accept valid percentage range', () => {
      expect(validateDiscount('percentage', 0.01).value).toBe(0.01);
      expect(validateDiscount('percentage', 50).value).toBe(50);
      expect(validateDiscount('percentage', 100).value).toBe(100);
    });

    test('should reject fixed discount <= 0', () => {
      expect(() => validateDiscount('fixed', 0)).toThrow('must be greater than 0');
      expect(() => validateDiscount('fixed', -100)).toThrow('must be greater than 0');
    });

    test('should accept valid fixed discount', () => {
      expect(validateDiscount('fixed', 50000).value).toBe(50000);
      expect(validateDiscount('fixed', 0.01).value).toBe(0.01);
    });
  });

  describe('validateDate', () => {
    test('should accept valid ISO date strings', () => {
      const result = validateDate('2024-12-31T23:59:59Z', 'expiry date');
      expect(result).toBe('2024-12-31T23:59:59.000Z');
    });

    test('should accept JavaScript Date objects', () => {
      const date = new Date('2024-12-31');
      const result = validateDate(date, 'expiry date');
      expect(typeof result).toBe('string');
      expect(new Date(result).getFullYear()).toBe(2024);
    });

    test('should return null for empty values', () => {
      expect(validateDate(undefined, 'date')).toBeNull();
      expect(validateDate(null, 'date')).toBeNull();
      expect(validateDate('', 'date')).toBeNull();
    });

    test('should reject invalid dates', () => {
      expect(() => validateDate('invalid-date', 'expiry date')).toThrow('Invalid expiry date');
      expect(() => validateDate('2024-13-01', 'start date')).toThrow('Invalid start date');
    });

    test('should use custom field name in error', () => {
      expect(() => validateDate('invalid', 'custom field')).toThrow('Invalid custom field');
    });
  });

  describe('validateMinimumPurchase', () => {
    test('should accept valid minimum purchase amounts', () => {
      expect(validateMinimumPurchase(50000)).toBe(50000);
      expect(validateMinimumPurchase(100)).toBe(100);
      expect(validateMinimumPurchase(0)).toBe(0);
    });

    test('should parse string numbers', () => {
      expect(validateMinimumPurchase('50000')).toBe(50000);
      expect(validateMinimumPurchase('100.50')).toBe(100.50);
    });

    test('should return null for empty values', () => {
      expect(validateMinimumPurchase(undefined)).toBeNull();
      expect(validateMinimumPurchase(null)).toBeNull();
    });

    test('should reject negative amounts', () => {
      expect(() => validateMinimumPurchase(-100)).toThrow('cannot be negative');
      expect(() => validateMinimumPurchase(-0.01)).toThrow('cannot be negative');
    });
  });

  describe('validateMaxUses', () => {
    test('should accept valid max uses', () => {
      expect(validateMaxUses(1)).toBe(1);
      expect(validateMaxUses(100)).toBe(100);
      expect(validateMaxUses(1000000)).toBe(1000000);
    });

    test('should parse string numbers', () => {
      expect(validateMaxUses('100')).toBe(100);
      expect(validateMaxUses('1000')).toBe(1000);
    });

    test('should return null for empty values', () => {
      expect(validateMaxUses(undefined)).toBeNull();
      expect(validateMaxUses(null)).toBeNull();
    });

    test('should reject uses less than 1', () => {
      expect(() => validateMaxUses(0)).toThrow('at least 1');
      expect(() => validateMaxUses(-1)).toThrow('at least 1');
    });

    test('should reject uses exceeding 1,000,000', () => {
      expect(() => validateMaxUses(1000001)).toThrow('cannot exceed 1,000,000');
      expect(() => validateMaxUses(2000000)).toThrow('cannot exceed 1,000,000');
    });
  });

  describe('validateTerms', () => {
    test('should accept valid terms as string', () => {
      const terms = 'Valid for dine-in only. Cannot be combined with other offers.';
      expect(validateTerms(terms)).toBe(terms);
    });

    test('should accept terms as array', () => {
      const terms = [
        'Valid Mon-Fri 5pm-7pm',
        'Cannot combine with other offers',
        'One per customer'
      ];

      const result = validateTerms(terms);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(terms);
    });

    test('should trim whitespace from array items', () => {
      const terms = [
        '  Valid Mon-Fri  ',
        '  One per customer  '
      ];

      const result = validateTerms(terms);

      expect(result).toEqual([
        'Valid Mon-Fri',
        'One per customer'
      ]);
    });

    test('should filter out empty array items', () => {
      const terms = [
        'Valid Mon-Fri',
        '',
        '  ',
        'One per customer'
      ];

      const result = validateTerms(terms);

      expect(result).toEqual([
        'Valid Mon-Fri',
        'One per customer'
      ]);
    });

    test('should filter out array items that are too long', () => {
      const longTerm = 'A'.repeat(501);
      const terms = [
        'Valid term',
        longTerm,
        'Another valid term'
      ];

      const result = validateTerms(terms);

      expect(result).toEqual([
        'Valid term',
        'Another valid term'
      ]);
    });

    test('should return null for empty values', () => {
      expect(validateTerms(undefined)).toBeNull();
      expect(validateTerms(null)).toBeNull();
      expect(validateTerms('')).toBeNull();
    });

    test('should reject string terms that are too long', () => {
      const longTerms = 'A'.repeat(2001);
      expect(() => validateTerms(longTerms)).toThrow('not exceed 2000 characters');
    });
  });

  describe('generateCouponQRData', () => {
    test('should generate Coupon QR with minimum required fields', () => {
      const result = generateCouponQRData({
        couponCode: 'SAVE20',
        title: '20% Off Your Order'
      });

      expect(result.coupon.code).toBe('SAVE20');
      expect(result.coupon.title).toBe('20% Off Your Order');
      expect(result.url).toBe('#coupon-SAVE20');
      expect(result.implementationPhase).toBe('basic-coupon');
    });

    test('should generate Coupon QR with all fields', () => {
      const result = generateCouponQRData({
        couponCode: 'HAPPY20',
        title: 'Happy Hour 20% Off',
        description: 'Get 20% off during happy hour',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01T17:00:00Z',
        validUntil: '2024-12-31T19:00:00Z',
        minimumPurchase: 50000,
        maxUses: 100,
        terms: ['Valid Mon-Fri 5pm-7pm', 'Cannot combine with other offers'],
        redemptionUrl: 'https://restaurant.com/redeem/HAPPY20',
        businessName: 'Gudbro Restaurant',
        currency: 'VND'
      });

      expect(result.coupon.code).toBe('HAPPY20');
      expect(result.coupon.title).toBe('Happy Hour 20% Off');
      expect(result.coupon.description).toBe('Get 20% off during happy hour');
      expect(result.coupon.discount.type).toBe('percentage');
      expect(result.coupon.discount.value).toBe(20);
      expect(result.coupon.validity.from).toBeTruthy();
      expect(result.coupon.validity.until).toBeTruthy();
      expect(result.coupon.minimumPurchase.amount).toBe(50000);
      expect(result.coupon.minimumPurchase.currency).toBe('VND');
      expect(result.coupon.maxUses).toBe(100);
      expect(result.coupon.terms).toEqual(['Valid Mon-Fri 5pm-7pm', 'Cannot combine with other offers']);
      expect(result.coupon.businessName).toBe('Gudbro Restaurant');
      expect(result.url).toBe('https://restaurant.com/redeem/HAPPY20');
    });

    test('should use redemption URL when provided', () => {
      const result = generateCouponQRData({
        couponCode: 'TEST',
        title: 'Test Coupon',
        redemptionUrl: 'https://example.com/redeem'
      });

      expect(result.url).toBe('https://example.com/redeem');
      expect(result.note).toContain('custom redemption URL');
    });

    test('should use default URL when no redemption URL', () => {
      const result = generateCouponQRData({
        couponCode: 'TEST',
        title: 'Test Coupon'
      });

      expect(result.url).toBe('#coupon-TEST');
      expect(result.note).toContain('No redemption URL');
    });

    test('should include currency with fixed discount', () => {
      const result = generateCouponQRData({
        couponCode: 'SAVE100K',
        title: '100K Off',
        discountType: 'fixed',
        discountValue: 100000,
        currency: 'VND'
      });

      expect(result.coupon.discount.type).toBe('fixed');
      expect(result.coupon.discount.value).toBe(100000);
      expect(result.coupon.discount.currency).toBe('VND');
    });

    test('should not include currency with percentage discount', () => {
      const result = generateCouponQRData({
        couponCode: 'SAVE20',
        title: '20% Off',
        discountType: 'percentage',
        discountValue: 20,
        currency: 'VND'
      });

      expect(result.coupon.discount.type).toBe('percentage');
      expect(result.coupon.discount.value).toBe(20);
      expect(result.coupon.discount.currency).toBeNull();
    });

    test('should validate date order', () => {
      expect(() => generateCouponQRData({
        couponCode: 'TEST',
        title: 'Test',
        validFrom: '2024-12-31',
        validUntil: '2024-01-01'
      })).toThrow('Valid from date must be before valid until date');
    });

    test('should determine if coupon is currently valid', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = generateCouponQRData({
        couponCode: 'FUTURE',
        title: 'Future Coupon',
        validFrom: futureDate.toISOString()
      });

      expect(result.coupon.validity.isCurrentlyValid).toBe(false);
    });

    test('should handle BOGO discount', () => {
      const result = generateCouponQRData({
        couponCode: 'BOGO',
        title: 'Buy One Get One',
        discountType: 'bogo'
      });

      expect(result.coupon.discount.type).toBe('bogo');
      expect(result.coupon.discount.value).toBeNull();
    });

    test('should handle free-item discount', () => {
      const result = generateCouponQRData({
        couponCode: 'FREEAPP',
        title: 'Free Appetizer',
        discountType: 'free-item'
      });

      expect(result.coupon.discount.type).toBe('free-item');
    });

    test('should validate coupon code', () => {
      expect(() => generateCouponQRData({
        couponCode: '',
        title: 'Test'
      })).toThrow('Coupon code is required');
    });

    test('should validate title', () => {
      expect(() => generateCouponQRData({
        couponCode: 'TEST',
        title: ''
      })).toThrow('Coupon title is required');
    });

    test('should validate discount type', () => {
      expect(() => generateCouponQRData({
        couponCode: 'TEST',
        title: 'Test',
        discountType: 'invalid'
      })).toThrow('must be one of');
    });

    test('should validate discount value', () => {
      expect(() => generateCouponQRData({
        couponCode: 'TEST',
        title: 'Test',
        discountType: 'percentage',
        discountValue: 150
      })).toThrow('between 0 and 100');
    });
  });

  describe('getCouponQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getCouponQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Coupon QR Code');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('fields');
      expect(info).toHaveProperty('discountTypes');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('restaurantExamples');
      expect(info).toHaveProperty('implementation');
      expect(info).toHaveProperty('bestPractices');
      expect(info).toHaveProperty('redemptionMethods');
    });

    test('should define required, recommended, and optional fields', () => {
      const info = getCouponQRPlatformInfo();

      expect(info.fields.required).toEqual(['couponCode', 'title']);
      expect(Array.isArray(info.fields.recommended)).toBe(true);
      expect(Array.isArray(info.fields.optional)).toBe(true);
    });

    test('should describe all discount types', () => {
      const info = getCouponQRPlatformInfo();

      expect(info.discountTypes).toHaveProperty('percentage');
      expect(info.discountTypes).toHaveProperty('fixed');
      expect(info.discountTypes).toHaveProperty('bogo');
      expect(info.discountTypes).toHaveProperty('free-item');
      expect(info.discountTypes).toHaveProperty('free-shipping');

      expect(info.discountTypes.percentage).toHaveProperty('name');
      expect(info.discountTypes.percentage).toHaveProperty('description');
      expect(info.discountTypes.percentage).toHaveProperty('valueRange');
    });

    test('should specify which types require currency', () => {
      const info = getCouponQRPlatformInfo();

      expect(info.discountTypes.fixed.requiresCurrency).toBe(true);
      expect(info.discountTypes.percentage.requiresCurrency).toBeUndefined();
    });

    test('should include use cases', () => {
      const info = getCouponQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include restaurant examples', () => {
      const info = getCouponQRPlatformInfo();

      expect(Array.isArray(info.restaurantExamples)).toBe(true);
      expect(info.restaurantExamples.length).toBeGreaterThan(0);

      const example = info.restaurantExamples[0];
      expect(example).toHaveProperty('title');
      expect(example).toHaveProperty('code');
      expect(example).toHaveProperty('discountType');
    });

    test('should describe implementation phases', () => {
      const info = getCouponQRPlatformInfo();

      expect(info.implementation).toHaveProperty('current');
      expect(info.implementation).toHaveProperty('currentDescription');
      expect(info.implementation).toHaveProperty('future');
      expect(info.implementation).toHaveProperty('futureFeatures');
      expect(Array.isArray(info.implementation.futureFeatures)).toBe(true);
    });

    test('should include best practices', () => {
      const info = getCouponQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });

    test('should describe redemption methods', () => {
      const info = getCouponQRPlatformInfo();

      expect(info.redemptionMethods).toHaveProperty('manual');
      expect(info.redemptionMethods).toHaveProperty('integrated');
      expect(info.redemptionMethods).toHaveProperty('online');
      expect(info.redemptionMethods).toHaveProperty('hybrid');
    });
  });
});
