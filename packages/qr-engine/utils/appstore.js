/**
 * App Store QR Code Generator
 * Direct users to download apps from Apple App Store or Google Play Store
 *
 * Use Cases:
 * - Restaurant ordering apps
 * - Loyalty programs
 * - Custom F&B solutions
 * - In-store app installs
 *
 * Implementation: Direct Store Links (Option A)
 * - Simple and immediate
 * - No server-side routing required
 * - Platform-specific or dual-platform support
 */

/**
 * Validate Apple App ID
 * Must be 9-10 digits (numeric only)
 */
const validateAppleAppId = (appId) => {
  if (!appId) {
    throw new Error('Apple App ID is required');
  }

  const cleaned = String(appId).replace(/[\s-]/g, '');

  // Must be 9-10 digits
  if (!/^\d{9,10}$/.test(cleaned)) {
    throw new Error('Apple App ID must be 9-10 digits');
  }

  return cleaned;
};

/**
 * Validate Apple App Store URL
 */
const validateAppleAppUrl = (url) => {
  if (!url) {
    throw new Error('Apple App Store URL is required');
  }

  const trimmed = String(url).trim();

  // Must be a valid App Store URL
  if (!trimmed.includes('apps.apple.com') && !trimmed.includes('itunes.apple.com')) {
    throw new Error('Invalid Apple App Store URL (must contain apps.apple.com or itunes.apple.com)');
  }

  return trimmed;
};

/**
 * Validate Google Package Name
 * Format: com.company.app (lowercase, dots)
 */
const validateGooglePackageName = (packageName) => {
  if (!packageName) {
    throw new Error('Google package name is required');
  }

  const trimmed = String(packageName).trim();

  // Format: com.company.app (at least 2 segments)
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(trimmed)) {
    throw new Error('Invalid Google package name (format: com.company.app)');
  }

  return trimmed;
};

/**
 * Validate Google Play Store URL
 */
const validateGoogleAppUrl = (url) => {
  if (!url) {
    throw new Error('Google Play Store URL is required');
  }

  const trimmed = String(url).trim();

  // Must be a valid Play Store URL
  if (!trimmed.includes('play.google.com')) {
    throw new Error('Invalid Google Play Store URL (must contain play.google.com)');
  }

  return trimmed;
};

/**
 * Validate app name (optional)
 */
const validateAppName = (appName) => {
  if (!appName) {
    return null;
  }

  const trimmed = String(appName).trim();

  if (trimmed.length < 2) {
    throw new Error('App name must be at least 2 characters');
  }

  if (trimmed.length > 100) {
    throw new Error('App name must not exceed 100 characters');
  }

  return trimmed;
};

/**
 * Validate fallback URL (optional)
 */
const validateFallbackUrl = (url) => {
  if (!url) {
    return null;
  }

  const trimmed = String(url).trim();

  // Basic URL validation
  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error('Fallback URL must start with http:// or https://');
  }

  return trimmed;
};

/**
 * Generate App Store URLs from identifiers
 */
const generateStoreUrls = ({
  appleAppId,
  appleAppUrl,
  googlePackageName,
  googleAppUrl
}) => {
  let iosUrl = null;
  let androidUrl = null;

  // iOS URL
  if (appleAppUrl) {
    iosUrl = validateAppleAppUrl(appleAppUrl);
  } else if (appleAppId) {
    const validatedId = validateAppleAppId(appleAppId);
    iosUrl = `https://apps.apple.com/app/id${validatedId}`;
  }

  // Android URL
  if (googleAppUrl) {
    androidUrl = validateGoogleAppUrl(googleAppUrl);
  } else if (googlePackageName) {
    const validatedPackage = validateGooglePackageName(googlePackageName);
    androidUrl = `https://play.google.com/store/apps/details?id=${validatedPackage}`;
  }

  return { iosUrl, androidUrl };
};

/**
 * Generate App Store QR Code data
 *
 * @param {Object} options
 * @param {string} [options.appleAppId] - Apple App Store ID (9-10 digits)
 * @param {string} [options.appleAppUrl] - Full Apple App Store URL
 * @param {string} [options.googlePackageName] - Android package name (com.company.app)
 * @param {string} [options.googleAppUrl] - Full Google Play Store URL
 * @param {string} [options.platform='auto'] - Target platform: ios, android, or auto
 * @param {string} [options.fallbackUrl] - Desktop fallback URL
 * @param {string} [options.appName] - App display name
 * @param {string} [options.appIcon] - App icon URL
 * @returns {Object} App Store QR data
 */
const generateAppStoreQRData = ({
  appleAppId,
  appleAppUrl,
  googlePackageName,
  googleAppUrl,
  platform = 'auto',
  fallbackUrl,
  appName,
  appIcon
}) => {
  // At least one platform required
  if (!appleAppId && !appleAppUrl && !googlePackageName && !googleAppUrl) {
    throw new Error('At least one app identifier required (Apple App ID/URL or Google Package Name/URL)');
  }

  // Validate platform
  const validPlatforms = ['ios', 'android', 'auto'];
  if (!validPlatforms.includes(platform)) {
    throw new Error(`Platform must be one of: ${validPlatforms.join(', ')}`);
  }

  // Generate store URLs
  const { iosUrl, androidUrl } = generateStoreUrls({
    appleAppId,
    appleAppUrl,
    googlePackageName,
    googleAppUrl
  });

  // Validate optional fields
  const validatedAppName = validateAppName(appName);
  const validatedFallbackUrl = validateFallbackUrl(fallbackUrl);

  // Determine destination URL based on platform
  let destinationUrl;
  let selectedPlatform;

  if (platform === 'ios') {
    if (!iosUrl) {
      throw new Error('iOS platform selected but no Apple App ID/URL provided');
    }
    destinationUrl = iosUrl;
    selectedPlatform = 'ios';
  } else if (platform === 'android') {
    if (!androidUrl) {
      throw new Error('Android platform selected but no Google Package Name/URL provided');
    }
    destinationUrl = androidUrl;
    selectedPlatform = 'android';
  } else {
    // Auto mode: prefer iOS if both available, otherwise use what's available
    if (iosUrl && androidUrl) {
      // Both available - use note to inform user
      destinationUrl = iosUrl; // Default to iOS
      selectedPlatform = 'dual'; // Both platforms available
    } else if (iosUrl) {
      destinationUrl = iosUrl;
      selectedPlatform = 'ios';
    } else {
      destinationUrl = androidUrl;
      selectedPlatform = 'android';
    }
  }

  return {
    url: destinationUrl,
    platform: selectedPlatform,
    iosUrl,
    androidUrl,
    fallbackUrl: validatedFallbackUrl,
    appName: validatedAppName,
    appIcon,
    note: selectedPlatform === 'dual'
      ? 'QR code points to iOS App Store. For Android users, provide separate QR or use smart routing.'
      : null
  };
};

/**
 * Get App Store platform info
 */
const getAppStorePlatformInfo = () => {
  return {
    name: 'App Store QR',
    platforms: {
      ios: {
        store: 'Apple App Store',
        appIdFormat: '9-10 digits (e.g., 1234567890)',
        urlFormat: 'https://apps.apple.com/app/id[APP_ID]',
        alternateUrl: 'https://itunes.apple.com/app/id[APP_ID]'
      },
      android: {
        store: 'Google Play Store',
        packageFormat: 'Reverse domain notation (e.g., com.company.app)',
        urlFormat: 'https://play.google.com/store/apps/details?id=[PACKAGE_NAME]'
      }
    },
    useCases: [
      'Restaurant ordering apps',
      'Loyalty program apps',
      'Custom F&B solutions',
      'In-store app install campaigns',
      'App download promotions',
      'QR codes on printed materials'
    ],
    implementationModes: {
      directLink: {
        name: 'Direct Store Link (Current)',
        description: 'QR points directly to App Store or Play Store',
        pros: ['Simple', 'No server required', 'Immediate'],
        cons: ['Platform-specific', 'No analytics', 'No A/B testing']
      },
      smartRouter: {
        name: 'Smart Router (Future)',
        description: 'Server detects device and redirects appropriately',
        pros: ['Cross-platform', 'Analytics', 'Desktop fallback'],
        cons: ['Requires server', 'More complex', 'Slight delay']
      }
    },
    bestPractices: [
      'Always provide both iOS and Android options when possible',
      'Use platform parameter to create platform-specific QRs if needed',
      'Test QR codes on both iOS and Android devices',
      'Include app name in QR metadata for clarity',
      'Consider smart router for cross-platform support'
    ]
  };
};

module.exports = {
  validateAppleAppId,
  validateAppleAppUrl,
  validateGooglePackageName,
  validateGoogleAppUrl,
  validateAppName,
  validateFallbackUrl,
  generateStoreUrls,
  generateAppStoreQRData,
  getAppStorePlatformInfo
};
