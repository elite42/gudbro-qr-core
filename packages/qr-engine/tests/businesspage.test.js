/**
 * Business Page QR Code - Unit Tests
 *
 * Tests for Business Page QR codes
 * Digital business card with comprehensive information
 * Use Cases: Restaurant info pages, shop details, service business cards
 */

const {
  validateBusinessName,
  validateDescription,
  validateUrl,
  validateEmail,
  validatePhone,
  validateAddress,
  validateBusinessHours,
  validateSocialLinks,
  validateCategories,
  generateBusinessPageQRData,
  getBusinessPageQRPlatformInfo
} = require('../utils/businesspage');

describe('Business Page QR Code', () => {
  describe('validateBusinessName', () => {
    test('should accept valid business names', () => {
      expect(validateBusinessName('Gudbro Restaurant')).toBe('Gudbro Restaurant');
      expect(validateBusinessName('Coffee Shop')).toBe('Coffee Shop');
      expect(validateBusinessName('My Business Inc.')).toBe('My Business Inc.');
    });

    test('should trim whitespace', () => {
      expect(validateBusinessName('  Gudbro  ')).toBe('Gudbro');
    });

    test('should reject empty business name', () => {
      expect(() => validateBusinessName('')).toThrow('Business name is required');
      expect(() => validateBusinessName(null)).toThrow('Business name is required');
      expect(() => validateBusinessName(undefined)).toThrow('Business name is required');
    });

    test('should reject names that are too short', () => {
      expect(() => validateBusinessName('A')).toThrow('at least 2 characters');
    });

    test('should reject names that are too long', () => {
      const longName = 'A'.repeat(201);
      expect(() => validateBusinessName(longName)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateDescription', () => {
    test('should accept valid descriptions', () => {
      expect(validateDescription('Authentic Vietnamese cuisine')).toBe('Authentic Vietnamese cuisine');
      expect(validateDescription('Best coffee in town')).toBe('Best coffee in town');
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

  describe('validateUrl', () => {
    test('should accept valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe('https://example.com');
      expect(validateUrl('http://example.com')).toBe('http://example.com');
    });

    test('should return null for empty values', () => {
      expect(validateUrl(undefined)).toBeNull();
      expect(validateUrl(null)).toBeNull();
      expect(validateUrl('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateUrl('  https://example.com  ')).toBe('https://example.com');
    });

    test('should reject invalid URLs', () => {
      expect(() => validateUrl('example.com')).toThrow('must start with http://');
      expect(() => validateUrl('ftp://example.com')).toThrow('must start with http://');
    });

    test('should use custom field name in error message', () => {
      expect(() => validateUrl('invalid', 'Logo URL')).toThrow('Logo URL must start with');
    });
  });

  describe('validateEmail', () => {
    test('should accept valid email addresses', () => {
      expect(validateEmail('info@example.com')).toBe('info@example.com');
      expect(validateEmail('contact@gudbro.vn')).toBe('contact@gudbro.vn');
      expect(validateEmail('user+tag@domain.co.uk')).toBe('user+tag@domain.co.uk');
    });

    test('should return null for empty values', () => {
      expect(validateEmail(undefined)).toBeNull();
      expect(validateEmail(null)).toBeNull();
      expect(validateEmail('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateEmail('  info@example.com  ')).toBe('info@example.com');
    });

    test('should reject invalid email formats', () => {
      expect(() => validateEmail('invalid')).toThrow('Invalid email format');
      expect(() => validateEmail('invalid@')).toThrow('Invalid email format');
      expect(() => validateEmail('@example.com')).toThrow('Invalid email format');
      expect(() => validateEmail('invalid@domain')).toThrow('Invalid email format');
      expect(() => validateEmail('invalid @domain.com')).toThrow('Invalid email format');
    });
  });

  describe('validatePhone', () => {
    test('should accept valid phone numbers', () => {
      expect(validatePhone('+84-28-1234-5678')).toBe('+84-28-1234-5678');
      expect(validatePhone('0123456789')).toBe('0123456789');
      expect(validatePhone('+1-555-123-4567')).toBe('+1-555-123-4567');
    });

    test('should return null for empty values', () => {
      expect(validatePhone(undefined)).toBeNull();
      expect(validatePhone(null)).toBeNull();
      expect(validatePhone('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validatePhone('  0123456789  ')).toBe('0123456789');
    });

    test('should reject phone numbers that are too short', () => {
      expect(() => validatePhone('1234567')).toThrow('between 8 and 20 characters');
    });

    test('should reject phone numbers that are too long', () => {
      const longPhone = '1'.repeat(21);
      expect(() => validatePhone(longPhone)).toThrow('between 8 and 20 characters');
    });
  });

  describe('validateAddress', () => {
    test('should accept valid address object', () => {
      const address = {
        street: '123 Main St',
        city: 'Ho Chi Minh City',
        state: 'HCM',
        country: 'Vietnam',
        postalCode: '700000'
      };

      const result = validateAddress(address);

      expect(result).toEqual({
        street: '123 Main St',
        city: 'Ho Chi Minh City',
        state: 'HCM',
        country: 'Vietnam',
        postalCode: '700000'
      });
    });

    test('should accept partial address', () => {
      const address = {
        city: 'Ho Chi Minh City',
        country: 'Vietnam'
      };

      const result = validateAddress(address);

      expect(result).toEqual({
        city: 'Ho Chi Minh City',
        country: 'Vietnam'
      });
    });

    test('should trim whitespace from address fields', () => {
      const address = {
        street: '  123 Main St  ',
        city: '  City  '
      };

      const result = validateAddress(address);

      expect(result.street).toBe('123 Main St');
      expect(result.city).toBe('City');
    });

    test('should return null for empty address', () => {
      expect(validateAddress(null)).toBeNull();
      expect(validateAddress(undefined)).toBeNull();
      expect(validateAddress({})).toBeNull();
    });

    test('should return null for non-object address', () => {
      expect(validateAddress('not an object')).toBeNull();
      expect(validateAddress(123)).toBeNull();
    });
  });

  describe('validateBusinessHours', () => {
    test('should accept valid business hours', () => {
      const hours = {
        monday: '9:00 - 17:00',
        tuesday: '9:00 - 17:00',
        wednesday: '9:00 - 17:00',
        thursday: '9:00 - 17:00',
        friday: '9:00 - 17:00',
        saturday: '10:00 - 14:00',
        sunday: 'Closed'
      };

      const result = validateBusinessHours(hours);

      expect(result).toEqual(hours);
    });

    test('should accept partial business hours', () => {
      const hours = {
        monday: '9am-5pm',
        friday: '9am-5pm'
      };

      const result = validateBusinessHours(hours);

      expect(result).toEqual({
        monday: '9am-5pm',
        friday: '9am-5pm'
      });
    });

    test('should trim whitespace from hours', () => {
      const hours = {
        monday: '  9:00 - 17:00  '
      };

      const result = validateBusinessHours(hours);

      expect(result.monday).toBe('9:00 - 17:00');
    });

    test('should ignore invalid day names', () => {
      const hours = {
        monday: '9-5',
        invalidday: '10-6'
      };

      const result = validateBusinessHours(hours);

      expect(result).toEqual({
        monday: '9-5'
      });
      expect(result.invalidday).toBeUndefined();
    });

    test('should return null for empty hours', () => {
      expect(validateBusinessHours(null)).toBeNull();
      expect(validateBusinessHours(undefined)).toBeNull();
      expect(validateBusinessHours({})).toBeNull();
    });

    test('should return null for non-object hours', () => {
      expect(validateBusinessHours('not an object')).toBeNull();
      expect(validateBusinessHours(123)).toBeNull();
    });
  });

  describe('validateSocialLinks', () => {
    test('should accept valid social links', () => {
      const social = {
        facebook: 'gudbrovietnam',
        instagram: 'gudbrovietnam',
        twitter: 'gudbro',
        zalo: '84912345678',
        website: 'https://gudbro.com'
      };

      const result = validateSocialLinks(social);

      expect(result).toEqual(social);
    });

    test('should accept all supported platforms', () => {
      const social = {
        facebook: 'page',
        instagram: 'account',
        twitter: 'handle',
        x: 'handle',
        linkedin: 'company',
        tiktok: 'account',
        youtube: 'channel',
        whatsapp: '1234567890',
        zalo: '1234567890',
        line: 'id',
        kakaotalk: 'id',
        wechat: 'id',
        website: 'https://example.com'
      };

      const result = validateSocialLinks(social);

      expect(result).toEqual(social);
    });

    test('should validate website URL format', () => {
      const social = {
        facebook: 'page',
        website: 'https://example.com'
      };

      const result = validateSocialLinks(social);

      expect(result.website).toBe('https://example.com');
    });

    test('should reject invalid website URL', () => {
      const social = {
        facebook: 'page',
        website: 'not-a-url'
      };

      const result = validateSocialLinks(social);

      expect(result.facebook).toBe('page');
      expect(result.website).toBeUndefined();
    });

    test('should trim whitespace from social links', () => {
      const social = {
        facebook: '  gudbro  ',
        instagram: '  gudbro  '
      };

      const result = validateSocialLinks(social);

      expect(result.facebook).toBe('gudbro');
      expect(result.instagram).toBe('gudbro');
    });

    test('should ignore unsupported platforms', () => {
      const social = {
        facebook: 'gudbro',
        unsupported: 'value'
      };

      const result = validateSocialLinks(social);

      expect(result.facebook).toBe('gudbro');
      expect(result.unsupported).toBeUndefined();
    });

    test('should return null for empty social links', () => {
      expect(validateSocialLinks(null)).toBeNull();
      expect(validateSocialLinks(undefined)).toBeNull();
      expect(validateSocialLinks({})).toBeNull();
    });

    test('should return null for non-object social links', () => {
      expect(validateSocialLinks('not an object')).toBeNull();
      expect(validateSocialLinks(123)).toBeNull();
    });
  });

  describe('validateCategories', () => {
    test('should accept valid categories array', () => {
      const categories = ['Vietnamese', 'Asian', 'Fine Dining'];

      const result = validateCategories(categories);

      expect(result).toEqual(categories);
    });

    test('should trim whitespace from categories', () => {
      const categories = ['  Vietnamese  ', '  Asian  '];

      const result = validateCategories(categories);

      expect(result).toEqual(['Vietnamese', 'Asian']);
    });

    test('should filter out empty categories', () => {
      const categories = ['Vietnamese', '', '  ', 'Asian'];

      const result = validateCategories(categories);

      expect(result).toEqual(['Vietnamese', 'Asian']);
    });

    test('should filter out categories that are too long', () => {
      const longCategory = 'A'.repeat(51);
      const categories = ['Vietnamese', longCategory, 'Asian'];

      const result = validateCategories(categories);

      expect(result).toEqual(['Vietnamese', 'Asian']);
    });

    test('should return null for empty categories', () => {
      expect(validateCategories(undefined)).toBeNull();
      expect(validateCategories(null)).toBeNull();
    });

    test('should reject non-array categories', () => {
      expect(() => validateCategories('not an array')).toThrow('must be an array');
      expect(() => validateCategories({})).toThrow('must be an array');
    });

    test('should reject too many categories', () => {
      const categories = Array.from({ length: 11 }, (_, i) => `Category ${i}`);

      expect(() => validateCategories(categories)).toThrow('Maximum 10 categories');
    });

    test('should accept maximum 10 categories', () => {
      const categories = Array.from({ length: 10 }, (_, i) => `Category ${i}`);

      const result = validateCategories(categories);

      expect(result).toHaveLength(10);
    });
  });

  describe('generateBusinessPageQRData', () => {
    test('should generate Business Page QR with minimum required fields', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro Restaurant'
      });

      expect(result.businessInfo.name).toBe('Gudbro Restaurant');
      expect(result.url).toBe('#');
      expect(result.implementationPhase).toBe('basic-info');
      expect(result.note).toContain('No URL provided');
    });

    test('should generate Business Page QR with all fields', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro Restaurant',
        description: 'Authentic Vietnamese cuisine',
        websiteUrl: 'https://gudbro.com',
        email: 'info@gudbro.com',
        phone: '+84-28-1234-5678',
        address: {
          street: '123 Nguyen Hue Street',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          postalCode: '700000'
        },
        businessHours: {
          monday: '11:00 - 22:00',
          friday: '11:00 - 23:00'
        },
        socialLinks: {
          facebook: 'gudbrovietnam',
          instagram: 'gudbrovietnam',
          zalo: '84912345678'
        },
        categories: ['Vietnamese', 'Asian', 'Fine Dining'],
        logo: 'https://gudbro.com/logo.png',
        coverImage: 'https://gudbro.com/cover.jpg'
      });

      expect(result.businessInfo.name).toBe('Gudbro Restaurant');
      expect(result.businessInfo.description).toBe('Authentic Vietnamese cuisine');
      expect(result.businessInfo.website).toBe('https://gudbro.com');
      expect(result.businessInfo.email).toBe('info@gudbro.com');
      expect(result.businessInfo.phone).toBe('+84-28-1234-5678');
      expect(result.businessInfo.address.city).toBe('Ho Chi Minh City');
      expect(result.businessInfo.businessHours.monday).toBe('11:00 - 22:00');
      expect(result.businessInfo.socialLinks.facebook).toBe('gudbrovietnam');
      expect(result.businessInfo.categories).toEqual(['Vietnamese', 'Asian', 'Fine Dining']);
      expect(result.businessInfo.logo).toBe('https://gudbro.com/logo.png');
      expect(result.businessInfo.coverImage).toBe('https://gudbro.com/cover.jpg');
      expect(result.url).toBe('https://gudbro.com');
    });

    test('should use website URL as destination', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro Restaurant',
        websiteUrl: 'https://gudbro.com'
      });

      expect(result.url).toBe('https://gudbro.com');
      expect(result.note).toContain('Using business website');
    });

    test('should prefer landing page URL over website', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro Restaurant',
        websiteUrl: 'https://gudbro.com',
        landingPageUrl: 'https://business.example.com/gudbro'
      });

      expect(result.url).toBe('https://business.example.com/gudbro');
      expect(result.note).toContain('custom landing page');
    });

    test('should not include null fields in businessInfo', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro Restaurant',
        description: 'Vietnamese cuisine'
      });

      expect(result.businessInfo.name).toBe('Gudbro Restaurant');
      expect(result.businessInfo.description).toBe('Vietnamese cuisine');
      expect(result.businessInfo.email).toBeUndefined();
      expect(result.businessInfo.phone).toBeUndefined();
      expect(result.businessInfo.address).toBeUndefined();
    });

    test('should validate business name', () => {
      expect(() => generateBusinessPageQRData({
        businessName: ''
      })).toThrow('Business name is required');
    });

    test('should validate description', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        description: 'A'.repeat(1001)
      })).toThrow('not exceed 1000 characters');
    });

    test('should validate email', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        email: 'invalid-email'
      })).toThrow('Invalid email format');
    });

    test('should validate phone', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        phone: '123'
      })).toThrow('between 8 and 20 characters');
    });

    test('should validate website URL', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        websiteUrl: 'invalid-url'
      })).toThrow('Website URL must start with');
    });

    test('should validate logo URL', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        logo: 'invalid-url'
      })).toThrow('Logo URL must start with');
    });

    test('should validate categories', () => {
      expect(() => generateBusinessPageQRData({
        businessName: 'Gudbro',
        categories: Array.from({ length: 11 }, (_, i) => `Cat${i}`)
      })).toThrow('Maximum 10 categories');
    });

    test('should handle partial address', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro',
        address: {
          city: 'Ho Chi Minh City',
          country: 'Vietnam'
        }
      });

      expect(result.businessInfo.address).toEqual({
        city: 'Ho Chi Minh City',
        country: 'Vietnam'
      });
    });

    test('should handle partial business hours', () => {
      const result = generateBusinessPageQRData({
        businessName: 'Gudbro',
        businessHours: {
          monday: '9-5',
          friday: '9-5'
        }
      });

      expect(result.businessInfo.businessHours).toEqual({
        monday: '9-5',
        friday: '9-5'
      });
    });
  });

  describe('getBusinessPageQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Business Page QR Code');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('fields');
      expect(info).toHaveProperty('addressFields');
      expect(info).toHaveProperty('businessHoursDays');
      expect(info).toHaveProperty('supportedSocialPlatforms');
      expect(info).toHaveProperty('limits');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('restaurantExample');
      expect(info).toHaveProperty('implementation');
      expect(info).toHaveProperty('bestPractices');
    });

    test('should define required, recommended, and optional fields', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.fields.required).toEqual(['businessName']);
      expect(Array.isArray(info.fields.recommended)).toBe(true);
      expect(Array.isArray(info.fields.optional)).toBe(true);
    });

    test('should list all address fields', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.addressFields).toHaveProperty('street');
      expect(info.addressFields).toHaveProperty('city');
      expect(info.addressFields).toHaveProperty('state');
      expect(info.addressFields).toHaveProperty('country');
      expect(info.addressFields).toHaveProperty('postalCode');
    });

    test('should list all business hours days', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.businessHoursDays).toEqual([
        'monday', 'tuesday', 'wednesday', 'thursday',
        'friday', 'saturday', 'sunday'
      ]);
    });

    test('should list all supported social platforms', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(Array.isArray(info.supportedSocialPlatforms)).toBe(true);
      expect(info.supportedSocialPlatforms).toContain('facebook');
      expect(info.supportedSocialPlatforms).toContain('instagram');
      expect(info.supportedSocialPlatforms).toContain('zalo');
      expect(info.supportedSocialPlatforms).toContain('website');
    });

    test('should define field limits', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.limits.businessNameMax).toBe(200);
      expect(info.limits.descriptionMax).toBe(1000);
      expect(info.limits.categoriesMax).toBe(10);
      expect(info.limits.categoryLengthMax).toBe(50);
    });

    test('should include use cases', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include restaurant example', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.restaurantExample).toHaveProperty('businessName');
      expect(info.restaurantExample).toHaveProperty('description');
      expect(info.restaurantExample).toHaveProperty('address');
      expect(info.restaurantExample).toHaveProperty('businessHours');
      expect(info.restaurantExample).toHaveProperty('socialLinks');
    });

    test('should describe implementation phases', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(info.implementation).toHaveProperty('current');
      expect(info.implementation).toHaveProperty('currentDescription');
      expect(info.implementation).toHaveProperty('future');
      expect(info.implementation).toHaveProperty('futureFeatures');
      expect(Array.isArray(info.implementation.futureFeatures)).toBe(true);
    });

    test('should include best practices', () => {
      const info = getBusinessPageQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });
  });
});
