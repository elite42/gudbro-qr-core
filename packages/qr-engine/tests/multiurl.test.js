/**
 * Multi-URL QR Code - Unit Tests
 *
 * Tests for Multi-URL QR codes
 * Smart routing to different URLs based on device, location, or user choice
 * Routing strategies: primary, device, choice, priority
 */

const {
  validateUrlEntry,
  validateUrls,
  validateMultiUrlTitle,
  validateRoutingStrategy,
  determinePrimaryUrl,
  generateMultiUrlQRData,
  getMultiUrlQRPlatformInfo
} = require('../utils/multiurl');

describe('Multi-URL QR Code', () => {
  describe('validateUrlEntry', () => {
    test('should validate basic URL entry', () => {
      const entry = {
        url: 'https://example.com'
      };

      const result = validateUrlEntry(entry, 0);

      expect(result.url).toBe('https://example.com');
      expect(result.label).toBe('Link 1');
      expect(result.device).toBe('all');
      expect(result.priority).toBe(1);
      expect(result.description).toBeNull();
    });

    test('should validate URL entry with all fields', () => {
      const entry = {
        url: 'https://example.com/menu',
        label: 'English Menu',
        device: 'mobile',
        priority: 5,
        description: 'Our full menu in English'
      };

      const result = validateUrlEntry(entry, 2);

      expect(result.url).toBe('https://example.com/menu');
      expect(result.label).toBe('English Menu');
      expect(result.device).toBe('mobile');
      expect(result.priority).toBe(5);
      expect(result.description).toBe('Our full menu in English');
    });

    test('should trim URL and label whitespace', () => {
      const entry = {
        url: '  https://example.com  ',
        label: '  Menu Link  '
      };

      const result = validateUrlEntry(entry, 0);

      expect(result.url).toBe('https://example.com');
      expect(result.label).toBe('Menu Link');
    });

    test('should normalize device to lowercase', () => {
      const entry = {
        url: 'https://example.com',
        device: 'IOS'
      };

      const result = validateUrlEntry(entry, 0);

      expect(result.device).toBe('ios');
    });

    test('should accept valid device types', () => {
      const devices = ['all', 'ios', 'android', 'desktop', 'mobile'];

      devices.forEach((device, index) => {
        const entry = {
          url: 'https://example.com',
          device
        };

        const result = validateUrlEntry(entry, index);
        expect(result.device).toBe(device);
      });
    });

    test('should reject invalid URL entry object', () => {
      expect(() => validateUrlEntry(null, 0)).toThrow('must be an object');
      expect(() => validateUrlEntry('not an object', 0)).toThrow('must be an object');
      expect(() => validateUrlEntry(undefined, 0)).toThrow('must be an object');
    });

    test('should reject missing URL field', () => {
      const entry = {
        label: 'Menu'
      };

      expect(() => validateUrlEntry(entry, 0)).toThrow("is missing 'url' field");
    });

    test('should reject invalid URL format', () => {
      const invalidUrls = [
        { url: 'example.com' },
        { url: 'ftp://example.com' },
        { url: 'www.example.com' }
      ];

      invalidUrls.forEach((entry, index) => {
        expect(() => validateUrlEntry(entry, index)).toThrow('must start with http://');
      });
    });

    test('should reject empty URL', () => {
      const entry = { url: '' };
      expect(() => validateUrlEntry(entry, 0)).toThrow("is missing 'url' field");
    });

    test('should reject label that is too long', () => {
      const entry = {
        url: 'https://example.com',
        label: 'A'.repeat(101)
      };

      expect(() => validateUrlEntry(entry, 0)).toThrow('Label must not exceed 100 characters');
    });

    test('should reject invalid device type', () => {
      const entry = {
        url: 'https://example.com',
        device: 'windows'
      };

      expect(() => validateUrlEntry(entry, 0)).toThrow('Device must be one of');
    });

    test('should reject invalid priority values', () => {
      expect(() => validateUrlEntry({
        url: 'https://example.com',
        priority: 0
      }, 0)).toThrow('Priority must be between 1 and 100');

      expect(() => validateUrlEntry({
        url: 'https://example.com',
        priority: 101
      }, 0)).toThrow('Priority must be between 1 and 100');

      expect(() => validateUrlEntry({
        url: 'https://example.com',
        priority: -5
      }, 0)).toThrow('Priority must be between 1 and 100');
    });

    test('should use index + 1 as default priority', () => {
      const entry = {
        url: 'https://example.com'
      };

      expect(validateUrlEntry(entry, 0).priority).toBe(1);
      expect(validateUrlEntry(entry, 4).priority).toBe(5);
      expect(validateUrlEntry(entry, 9).priority).toBe(10);
    });

    test('should trim description whitespace', () => {
      const entry = {
        url: 'https://example.com',
        description: '  Full menu  '
      };

      const result = validateUrlEntry(entry, 0);
      expect(result.description).toBe('Full menu');
    });
  });

  describe('validateUrls', () => {
    test('should validate array of URLs', () => {
      const urls = [
        { url: 'https://example.com/en' },
        { url: 'https://example.com/vi' }
      ];

      const result = validateUrls(urls);

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://example.com/en');
      expect(result[1].url).toBe('https://example.com/vi');
    });

    test('should validate array with maximum URLs', () => {
      const urls = Array.from({ length: 10 }, (_, i) => ({
        url: `https://example.com/${i}`
      }));

      const result = validateUrls(urls);

      expect(result).toHaveLength(10);
    });

    test('should reject non-array values', () => {
      expect(() => validateUrls(null)).toThrow('URLs must be an array');
      expect(() => validateUrls(undefined)).toThrow('URLs must be an array');
      expect(() => validateUrls('not an array')).toThrow('URLs must be an array');
      expect(() => validateUrls({})).toThrow('URLs must be an array');
    });

    test('should reject array with less than 2 URLs', () => {
      expect(() => validateUrls([])).toThrow('requires at least 2 URLs');
      expect(() => validateUrls([{ url: 'https://example.com' }]))
        .toThrow('requires at least 2 URLs');
    });

    test('should reject array with more than 10 URLs', () => {
      const urls = Array.from({ length: 11 }, (_, i) => ({
        url: `https://example.com/${i}`
      }));

      expect(() => validateUrls(urls)).toThrow('maximum 10 URLs');
    });

    test('should validate all entries in array', () => {
      const urls = [
        { url: 'https://example.com/1', label: 'Link 1' },
        { url: 'https://example.com/2', label: 'Link 2' },
        { url: 'https://example.com/3', label: 'Link 3' }
      ];

      const result = validateUrls(urls);

      expect(result).toHaveLength(3);
      result.forEach((entry, index) => {
        expect(entry.url).toBe(`https://example.com/${index + 1}`);
        expect(entry.label).toBe(`Link ${index + 1}`);
      });
    });

    test('should reject if any entry is invalid', () => {
      const urls = [
        { url: 'https://example.com/valid' },
        { url: 'invalid-url' }
      ];

      expect(() => validateUrls(urls)).toThrow('must start with http://');
    });
  });

  describe('validateMultiUrlTitle', () => {
    test('should accept valid titles', () => {
      expect(validateMultiUrlTitle('Choose Your Menu')).toBe('Choose Your Menu');
      expect(validateMultiUrlTitle('Select Language')).toBe('Select Language');
      expect(validateMultiUrlTitle('Download Our App')).toBe('Download Our App');
    });

    test('should return default title for empty values', () => {
      expect(validateMultiUrlTitle(undefined)).toBe('Choose Your Link');
      expect(validateMultiUrlTitle(null)).toBe('Choose Your Link');
      expect(validateMultiUrlTitle('')).toBe('Choose Your Link');
    });

    test('should trim whitespace', () => {
      expect(validateMultiUrlTitle('  Menu Options  ')).toBe('Menu Options');
    });

    test('should reject titles that are too short', () => {
      expect(() => validateMultiUrlTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validateMultiUrlTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateRoutingStrategy', () => {
    test('should accept valid routing strategies', () => {
      expect(validateRoutingStrategy('primary')).toBe('primary');
      expect(validateRoutingStrategy('device')).toBe('device');
      expect(validateRoutingStrategy('choice')).toBe('choice');
      expect(validateRoutingStrategy('priority')).toBe('priority');
    });

    test('should return default strategy for empty values', () => {
      expect(validateRoutingStrategy(undefined)).toBe('primary');
      expect(validateRoutingStrategy(null)).toBe('primary');
      expect(validateRoutingStrategy('')).toBe('primary');
    });

    test('should normalize to lowercase', () => {
      expect(validateRoutingStrategy('PRIMARY')).toBe('primary');
      expect(validateRoutingStrategy('Device')).toBe('device');
      expect(validateRoutingStrategy('CHOICE')).toBe('choice');
    });

    test('should reject invalid routing strategies', () => {
      expect(() => validateRoutingStrategy('random')).toThrow('must be one of');
      expect(() => validateRoutingStrategy('location')).toThrow('must be one of');
    });
  });

  describe('determinePrimaryUrl', () => {
    test('should return first URL for primary strategy', () => {
      const urls = [
        { url: 'https://example.com/first', priority: 1 },
        { url: 'https://example.com/second', priority: 2 }
      ];

      expect(determinePrimaryUrl(urls, 'primary')).toBe('https://example.com/first');
    });

    test('should return first URL for choice strategy', () => {
      const urls = [
        { url: 'https://example.com/first', priority: 2 },
        { url: 'https://example.com/second', priority: 1 }
      ];

      expect(determinePrimaryUrl(urls, 'choice')).toBe('https://example.com/first');
    });

    test('should return highest priority URL for priority strategy', () => {
      const urls = [
        { url: 'https://example.com/low', priority: 10 },
        { url: 'https://example.com/high', priority: 1 },
        { url: 'https://example.com/medium', priority: 5 }
      ];

      expect(determinePrimaryUrl(urls, 'priority')).toBe('https://example.com/high');
    });

    test('should prefer all devices for device strategy', () => {
      const urls = [
        { url: 'https://example.com/ios', device: 'ios' },
        { url: 'https://example.com/all', device: 'all' },
        { url: 'https://example.com/android', device: 'android' }
      ];

      expect(determinePrimaryUrl(urls, 'device')).toBe('https://example.com/all');
    });

    test('should return first URL if no all device found for device strategy', () => {
      const urls = [
        { url: 'https://example.com/ios', device: 'ios' },
        { url: 'https://example.com/android', device: 'android' }
      ];

      expect(determinePrimaryUrl(urls, 'device')).toBe('https://example.com/ios');
    });

    test('should handle priority ties by returning first in array', () => {
      const urls = [
        { url: 'https://example.com/first', priority: 1 },
        { url: 'https://example.com/second', priority: 1 }
      ];

      expect(determinePrimaryUrl(urls, 'priority')).toBe('https://example.com/first');
    });
  });

  describe('generateMultiUrlQRData', () => {
    test('should generate Multi-URL QR data with minimum required fields', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/en' },
          { url: 'https://example.com/vi' }
        ]
      });

      expect(result.url).toBe('https://example.com/en');
      expect(result.primaryUrl).toBe('https://example.com/en');
      expect(result.urls).toHaveLength(2);
      expect(result.title).toBe('Choose Your Link');
      expect(result.routingStrategy).toBe('primary');
      expect(result.urlCount).toBe(2);
      expect(result.implementationPhase).toBe('direct-primary');
    });

    test('should generate Multi-URL QR data with all fields', () => {
      const result = generateMultiUrlQRData({
        urls: [
          {
            url: 'https://example.com/en',
            label: 'English',
            description: 'English menu',
            priority: 1
          },
          {
            url: 'https://example.com/vi',
            label: 'Vietnamese',
            description: 'Vietnamese menu',
            priority: 2
          }
        ],
        title: 'Choose Your Language',
        routingStrategy: 'choice'
      });

      expect(result.title).toBe('Choose Your Language');
      expect(result.routingStrategy).toBe('choice');
      expect(result.urls[0].label).toBe('English');
      expect(result.urls[0].description).toBe('English menu');
    });

    test('should use primary routing strategy', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/1', priority: 10 },
          { url: 'https://example.com/2', priority: 1 }
        ],
        routingStrategy: 'primary'
      });

      expect(result.url).toBe('https://example.com/1'); // First URL
      expect(result.primaryUrl).toBe('https://example.com/1');
    });

    test('should use priority routing strategy', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/low', priority: 10 },
          { url: 'https://example.com/high', priority: 1 }
        ],
        routingStrategy: 'priority'
      });

      expect(result.url).toBe('https://example.com/high'); // Highest priority
      expect(result.primaryUrl).toBe('https://example.com/high');
    });

    test('should use device routing strategy', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/ios', device: 'ios' },
          { url: 'https://example.com/all', device: 'all' }
        ],
        routingStrategy: 'device'
      });

      expect(result.url).toBe('https://example.com/all'); // Prefer 'all' device
    });

    test('should sort URLs by priority', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/3', priority: 3 },
          { url: 'https://example.com/1', priority: 1 },
          { url: 'https://example.com/2', priority: 2 }
        ]
      });

      expect(result.urls[0].priority).toBe(1);
      expect(result.urls[1].priority).toBe(2);
      expect(result.urls[2].priority).toBe(3);
    });

    test('should use custom landing page URL when provided', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/1' },
          { url: 'https://example.com/2' }
        ],
        landingPageUrl: 'https://router.example.com/abc123'
      });

      expect(result.url).toBe('https://router.example.com/abc123');
      expect(result.primaryUrl).toBe('https://example.com/1');
      expect(result.note).toContain('custom landing page');
    });

    test('should handle multi-language menu scenario', () => {
      const result = generateMultiUrlQRData({
        urls: [
          { url: 'https://restaurant.com/menu-en', label: 'English', priority: 1 },
          { url: 'https://restaurant.com/menu-vi', label: 'Vietnamese', priority: 2 },
          { url: 'https://restaurant.com/menu-zh', label: 'Chinese', priority: 3 }
        ],
        title: 'Select Your Menu Language',
        routingStrategy: 'choice'
      });

      expect(result.urlCount).toBe(3);
      expect(result.title).toBe('Select Your Menu Language');
      expect(result.urls.map(u => u.label)).toEqual(['English', 'Vietnamese', 'Chinese']);
    });

    test('should handle app download scenario', () => {
      const result = generateMultiUrlQRData({
        urls: [
          {
            url: 'https://apps.apple.com/app/id123',
            label: 'iOS App',
            device: 'ios',
            priority: 1
          },
          {
            url: 'https://play.google.com/store/apps/details?id=com.example',
            label: 'Android App',
            device: 'android',
            priority: 2
          }
        ],
        title: 'Download Our App',
        routingStrategy: 'device'
      });

      expect(result.title).toBe('Download Our App');
      expect(result.routingStrategy).toBe('device');
      expect(result.urls[0].device).toBe('ios');
      expect(result.urls[1].device).toBe('android');
    });

    test('should validate URLs array', () => {
      expect(() => generateMultiUrlQRData({
        urls: [{ url: 'https://example.com' }]
      })).toThrow('requires at least 2 URLs');
    });

    test('should validate title', () => {
      expect(() => generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/1' },
          { url: 'https://example.com/2' }
        ],
        title: 'A'
      })).toThrow('at least 2 characters');
    });

    test('should validate routing strategy', () => {
      expect(() => generateMultiUrlQRData({
        urls: [
          { url: 'https://example.com/1' },
          { url: 'https://example.com/2' }
        ],
        routingStrategy: 'invalid'
      })).toThrow('must be one of');
    });

    test('should handle maximum URLs', () => {
      const urls = Array.from({ length: 10 }, (_, i) => ({
        url: `https://example.com/${i}`,
        label: `Link ${i + 1}`
      }));

      const result = generateMultiUrlQRData({ urls });

      expect(result.urlCount).toBe(10);
      expect(result.urls).toHaveLength(10);
    });

    test('should preserve URL entry descriptions', () => {
      const result = generateMultiUrlQRData({
        urls: [
          {
            url: 'https://example.com/1',
            label: 'Option 1',
            description: 'First option description'
          },
          {
            url: 'https://example.com/2',
            label: 'Option 2',
            description: 'Second option description'
          }
        ]
      });

      expect(result.urls[0].description).toBe('First option description');
      expect(result.urls[1].description).toBe('Second option description');
    });
  });

  describe('getMultiUrlQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Multi-URL QR Code');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('routingStrategies');
      expect(info).toHaveProperty('deviceTypes');
      expect(info).toHaveProperty('limits');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('restaurantExamples');
      expect(info).toHaveProperty('implementation');
      expect(info).toHaveProperty('bestPractices');
    });

    test('should describe all routing strategies', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(info.routingStrategies).toHaveProperty('primary');
      expect(info.routingStrategies).toHaveProperty('priority');
      expect(info.routingStrategies).toHaveProperty('device');
      expect(info.routingStrategies).toHaveProperty('choice');

      expect(info.routingStrategies.primary).toHaveProperty('name');
      expect(info.routingStrategies.primary).toHaveProperty('description');
      expect(info.routingStrategies.primary).toHaveProperty('useCase');
    });

    test('should list all device types', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(Array.isArray(info.deviceTypes)).toBe(true);
      expect(info.deviceTypes).toContain('all');
      expect(info.deviceTypes).toContain('ios');
      expect(info.deviceTypes).toContain('android');
      expect(info.deviceTypes).toContain('desktop');
      expect(info.deviceTypes).toContain('mobile');
    });

    test('should define URL and content limits', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(info.limits.minUrls).toBe(2);
      expect(info.limits.maxUrls).toBe(10);
      expect(info.limits.maxLabelLength).toBe(100);
      expect(info.limits.maxTitleLength).toBe(200);
    });

    test('should include use cases', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include restaurant-specific examples', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(Array.isArray(info.restaurantExamples)).toBe(true);
      expect(info.restaurantExamples.length).toBeGreaterThan(0);

      const example = info.restaurantExamples[0];
      expect(example).toHaveProperty('title');
      expect(example).toHaveProperty('urls');
      expect(Array.isArray(example.urls)).toBe(true);
    });

    test('should describe implementation phases', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(info.implementation).toHaveProperty('current');
      expect(info.implementation).toHaveProperty('currentDescription');
      expect(info.implementation).toHaveProperty('future');
      expect(info.implementation).toHaveProperty('futureFeatures');
      expect(Array.isArray(info.implementation.futureFeatures)).toBe(true);
    });

    test('should include best practices', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });

    test('should specify which strategies require landing page', () => {
      const info = getMultiUrlQRPlatformInfo();

      expect(info.routingStrategies.device.requiresLandingPage).toBe(true);
      expect(info.routingStrategies.choice.requiresLandingPage).toBe(true);
      expect(info.routingStrategies.primary.requiresLandingPage).toBeUndefined();
      expect(info.routingStrategies.priority.requiresLandingPage).toBeUndefined();
    });
  });
});
