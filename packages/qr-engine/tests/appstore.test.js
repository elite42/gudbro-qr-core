/**
 * App Store QR Code - Unit Tests
 *
 * Tests for iOS App Store and Google Play Store QR codes
 * Dual platform support for app downloads
 */

const {
  validateAppleAppId,
  validateAppleAppUrl,
  validateGooglePackageName,
  validateGoogleAppUrl,
  validateAppName,
  validateFallbackUrl,
  generateStoreUrls,
  generateAppStoreQRData,
  getAppStorePlatformInfo
} = require('../utils/appstore');

describe('App Store QR Code', () => {
  describe('validateAppleAppId', () => {
    test('should accept valid 9-digit Apple App IDs', () => {
      expect(validateAppleAppId('123456789')).toBe('123456789');
      expect(validateAppleAppId('987654321')).toBe('987654321');
    });

    test('should accept valid 10-digit Apple App IDs', () => {
      expect(validateAppleAppId('1234567890')).toBe('1234567890');
      expect(validateAppleAppId('9876543210')).toBe('9876543210');
    });

    test('should remove spaces and dashes', () => {
      expect(validateAppleAppId('123 456 789')).toBe('123456789');
      expect(validateAppleAppId('123-456-789')).toBe('123456789');
      expect(validateAppleAppId('1234-567-890')).toBe('1234567890');
    });

    test('should reject invalid Apple App IDs', () => {
      expect(() => validateAppleAppId('12345678')).toThrow('9-10 digits'); // Too short
      expect(() => validateAppleAppId('12345678901')).toThrow('9-10 digits'); // Too long
      expect(() => validateAppleAppId('abc123456')).toThrow('9-10 digits'); // Contains letters
      expect(() => validateAppleAppId('123.456.789')).toThrow('9-10 digits'); // Contains dots
      expect(() => validateAppleAppId('')).toThrow('Apple App ID is required');
      expect(() => validateAppleAppId(null)).toThrow('Apple App ID is required');
    });
  });

  describe('validateAppleAppUrl', () => {
    test('should accept valid Apple App Store URLs', () => {
      expect(validateAppleAppUrl('https://apps.apple.com/app/id123456789'))
        .toBe('https://apps.apple.com/app/id123456789');
      expect(validateAppleAppUrl('https://itunes.apple.com/app/id123456789'))
        .toBe('https://itunes.apple.com/app/id123456789');
    });

    test('should trim whitespace', () => {
      expect(validateAppleAppUrl('  https://apps.apple.com/app/id123456789  '))
        .toBe('https://apps.apple.com/app/id123456789');
    });

    test('should reject invalid Apple App Store URLs', () => {
      expect(() => validateAppleAppUrl('https://google.com')).toThrow('apps.apple.com');
      expect(() => validateAppleAppUrl('https://play.google.com')).toThrow('apps.apple.com');
      expect(() => validateAppleAppUrl('')).toThrow('Apple App Store URL is required');
      expect(() => validateAppleAppUrl(null)).toThrow('Apple App Store URL is required');
    });
  });

  describe('validateGooglePackageName', () => {
    test('should accept valid Google package names', () => {
      expect(validateGooglePackageName('com.example.app')).toBe('com.example.app');
      expect(validateGooglePackageName('com.company.myapp')).toBe('com.company.myapp');
      expect(validateGooglePackageName('io.github.project')).toBe('io.github.project');
      expect(validateGooglePackageName('com.a.b')).toBe('com.a.b');
    });

    test('should accept package names with underscores and numbers', () => {
      expect(validateGooglePackageName('com.example.my_app')).toBe('com.example.my_app');
      expect(validateGooglePackageName('com.example.app2')).toBe('com.example.app2');
      expect(validateGooglePackageName('com.example2.app')).toBe('com.example2.app');
    });

    test('should trim whitespace', () => {
      expect(validateGooglePackageName('  com.example.app  ')).toBe('com.example.app');
    });

    test('should reject invalid Google package names', () => {
      expect(() => validateGooglePackageName('example')).toThrow('com.company.app');
      expect(() => validateGooglePackageName('Example.App')).toThrow('com.company.app'); // Uppercase
      expect(() => validateGooglePackageName('com.Example.app')).toThrow('com.company.app'); // Uppercase
      expect(() => validateGooglePackageName('com')).toThrow('com.company.app'); // Single segment
      expect(() => validateGooglePackageName('com..app')).toThrow('com.company.app'); // Double dot
      expect(() => validateGooglePackageName('com.app-name.test')).toThrow('com.company.app'); // Dash
      expect(() => validateGooglePackageName('')).toThrow('Google package name is required');
      expect(() => validateGooglePackageName(null)).toThrow('Google package name is required');
    });
  });

  describe('validateGoogleAppUrl', () => {
    test('should accept valid Google Play Store URLs', () => {
      expect(validateGoogleAppUrl('https://play.google.com/store/apps/details?id=com.example.app'))
        .toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    test('should trim whitespace', () => {
      expect(validateGoogleAppUrl('  https://play.google.com/store/apps/details?id=com.example.app  '))
        .toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    test('should reject invalid Google Play Store URLs', () => {
      expect(() => validateGoogleAppUrl('https://google.com')).toThrow('play.google.com');
      expect(() => validateGoogleAppUrl('https://apps.apple.com')).toThrow('play.google.com');
      expect(() => validateGoogleAppUrl('')).toThrow('Google Play Store URL is required');
      expect(() => validateGoogleAppUrl(null)).toThrow('Google Play Store URL is required');
    });
  });

  describe('validateAppName', () => {
    test('should accept valid app names', () => {
      expect(validateAppName('My App')).toBe('My App');
      expect(validateAppName('Restaurant Ordering')).toBe('Restaurant Ordering');
      expect(validateAppName('Loyalty Program')).toBe('Loyalty Program');
    });

    test('should return null for empty values', () => {
      expect(validateAppName(undefined)).toBeNull();
      expect(validateAppName(null)).toBeNull();
      expect(validateAppName('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateAppName('  My App  ')).toBe('My App');
    });

    test('should reject invalid app names', () => {
      expect(() => validateAppName('A')).toThrow('at least 2 characters');
      expect(() => validateAppName('A'.repeat(101))).toThrow('not exceed 100 characters');
    });
  });

  describe('validateFallbackUrl', () => {
    test('should accept valid fallback URLs', () => {
      expect(validateFallbackUrl('https://example.com')).toBe('https://example.com');
      expect(validateFallbackUrl('http://example.com')).toBe('http://example.com');
    });

    test('should return null for empty values', () => {
      expect(validateFallbackUrl(undefined)).toBeNull();
      expect(validateFallbackUrl(null)).toBeNull();
      expect(validateFallbackUrl('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateFallbackUrl('  https://example.com  ')).toBe('https://example.com');
    });

    test('should reject invalid URLs', () => {
      expect(() => validateFallbackUrl('example.com')).toThrow('http://');
      expect(() => validateFallbackUrl('ftp://example.com')).toThrow('http://');
    });
  });

  describe('generateStoreUrls', () => {
    test('should generate iOS URL from Apple App ID', () => {
      const result = generateStoreUrls({
        appleAppId: '123456789'
      });

      expect(result.iosUrl).toBe('https://apps.apple.com/app/id123456789');
      expect(result.androidUrl).toBeNull();
    });

    test('should use provided Apple App URL over App ID', () => {
      const result = generateStoreUrls({
        appleAppId: '123456789',
        appleAppUrl: 'https://apps.apple.com/us/app/myapp/id123456789'
      });

      expect(result.iosUrl).toBe('https://apps.apple.com/us/app/myapp/id123456789');
    });

    test('should generate Android URL from Google package name', () => {
      const result = generateStoreUrls({
        googlePackageName: 'com.example.app'
      });

      expect(result.iosUrl).toBeNull();
      expect(result.androidUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    test('should use provided Google App URL over package name', () => {
      const result = generateStoreUrls({
        googlePackageName: 'com.example.app',
        googleAppUrl: 'https://play.google.com/store/apps/details?id=com.example.app&hl=en'
      });

      expect(result.androidUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app&hl=en');
    });

    test('should generate both iOS and Android URLs', () => {
      const result = generateStoreUrls({
        appleAppId: '123456789',
        googlePackageName: 'com.example.app'
      });

      expect(result.iosUrl).toBe('https://apps.apple.com/app/id123456789');
      expect(result.androidUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });
  });

  describe('generateAppStoreQRData', () => {
    test('should generate App Store QR data with Apple App ID only', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789'
      });

      expect(result.url).toBe('https://apps.apple.com/app/id123456789');
      expect(result.platform).toBe('ios');
      expect(result.iosUrl).toBe('https://apps.apple.com/app/id123456789');
      expect(result.androidUrl).toBeNull();
    });

    test('should generate App Store QR data with Google package name only', () => {
      const result = generateAppStoreQRData({
        googlePackageName: 'com.example.app'
      });

      expect(result.url).toBe('https://play.google.com/store/apps/details?id=com.example.app');
      expect(result.platform).toBe('android');
      expect(result.iosUrl).toBeNull();
      expect(result.androidUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    test('should handle dual platform (both iOS and Android)', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        googlePackageName: 'com.example.app',
        platform: 'auto'
      });

      expect(result.platform).toBe('dual');
      expect(result.url).toBe('https://apps.apple.com/app/id123456789'); // Defaults to iOS
      expect(result.iosUrl).toBe('https://apps.apple.com/app/id123456789');
      expect(result.androidUrl).toBe('https://play.google.com/store/apps/details?id=com.example.app');
      expect(result.note).toContain('QR code points to iOS App Store');
    });

    test('should respect platform parameter for iOS', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        googlePackageName: 'com.example.app',
        platform: 'ios'
      });

      expect(result.platform).toBe('ios');
      expect(result.url).toBe('https://apps.apple.com/app/id123456789');
    });

    test('should respect platform parameter for Android', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        googlePackageName: 'com.example.app',
        platform: 'android'
      });

      expect(result.platform).toBe('android');
      expect(result.url).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    });

    test('should include app name when provided', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        appName: 'My Restaurant App'
      });

      expect(result.appName).toBe('My Restaurant App');
    });

    test('should include fallback URL when provided', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        fallbackUrl: 'https://example.com'
      });

      expect(result.fallbackUrl).toBe('https://example.com');
    });

    test('should include app icon URL when provided', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        appIcon: 'https://example.com/icon.png'
      });

      expect(result.appIcon).toBe('https://example.com/icon.png');
    });

    test('should throw error when no app identifier provided', () => {
      expect(() => generateAppStoreQRData({}))
        .toThrow('At least one app identifier required');
    });

    test('should throw error when invalid platform specified', () => {
      expect(() => generateAppStoreQRData({
        appleAppId: '123456789',
        platform: 'windows'
      })).toThrow('Platform must be one of');
    });

    test('should throw error when iOS platform selected but no iOS identifier', () => {
      expect(() => generateAppStoreQRData({
        googlePackageName: 'com.example.app',
        platform: 'ios'
      })).toThrow('iOS platform selected but no Apple App ID/URL provided');
    });

    test('should throw error when Android platform selected but no Android identifier', () => {
      expect(() => generateAppStoreQRData({
        appleAppId: '123456789',
        platform: 'android'
      })).toThrow('Android platform selected but no Google Package Name/URL provided');
    });

    test('should handle complete app information', () => {
      const result = generateAppStoreQRData({
        appleAppId: '123456789',
        googlePackageName: 'com.example.app',
        appName: 'Restaurant Ordering App',
        fallbackUrl: 'https://restaurant.example.com',
        appIcon: 'https://example.com/icon.png',
        platform: 'auto'
      });

      expect(result.platform).toBe('dual');
      expect(result.appName).toBe('Restaurant Ordering App');
      expect(result.fallbackUrl).toBe('https://restaurant.example.com');
      expect(result.appIcon).toBe('https://example.com/icon.png');
      expect(result.iosUrl).toBeTruthy();
      expect(result.androidUrl).toBeTruthy();
    });
  });

  describe('getAppStorePlatformInfo', () => {
    test('should return platform information', () => {
      const info = getAppStorePlatformInfo();

      expect(info).toHaveProperty('name', 'App Store QR');
      expect(info).toHaveProperty('platforms');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('implementationModes');
      expect(info).toHaveProperty('bestPractices');
    });

    test('should include iOS platform details', () => {
      const info = getAppStorePlatformInfo();

      expect(info.platforms.ios).toHaveProperty('store', 'Apple App Store');
      expect(info.platforms.ios).toHaveProperty('appIdFormat');
      expect(info.platforms.ios).toHaveProperty('urlFormat');
    });

    test('should include Android platform details', () => {
      const info = getAppStorePlatformInfo();

      expect(info.platforms.android).toHaveProperty('store', 'Google Play Store');
      expect(info.platforms.android).toHaveProperty('packageFormat');
      expect(info.platforms.android).toHaveProperty('urlFormat');
    });

    test('should include use cases', () => {
      const info = getAppStorePlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include implementation modes', () => {
      const info = getAppStorePlatformInfo();

      expect(info.implementationModes).toHaveProperty('directLink');
      expect(info.implementationModes).toHaveProperty('smartRouter');
    });

    test('should include best practices', () => {
      const info = getAppStorePlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });
  });
});
