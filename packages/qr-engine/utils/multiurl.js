/**
 * Multi-URL QR Code Generator
 * Smart routing to different URLs based on device, location, or user choice
 *
 * Implementation: Phase 1 - Primary URL with metadata
 * Future: Smart router with device/location detection
 *
 * Use Cases:
 * - Different URLs for iOS vs Android
 * - Regional content (different languages/locations)
 * - Time-based content (day/night menus)
 * - User choice landing page
 */

/**
 * Validate single URL entry
 */
const validateUrlEntry = (entry, index) => {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`URL entry ${index + 1} must be an object`);
  }

  if (!entry.url) {
    throw new Error(`URL entry ${index + 1} is missing 'url' field`);
  }

  const trimmedUrl = String(entry.url).trim();
  if (!/^https?:\/\/.+/.test(trimmedUrl)) {
    throw new Error(`URL entry ${index + 1}: URL must start with http:// or https://`);
  }

  // Validate label
  let label = entry.label ? String(entry.label).trim() : `Link ${index + 1}`;
  if (label.length > 100) {
    throw new Error(`URL entry ${index + 1}: Label must not exceed 100 characters`);
  }

  // Validate device type
  const validDevices = ['all', 'ios', 'android', 'desktop', 'mobile'];
  let device = entry.device ? String(entry.device).toLowerCase() : 'all';
  if (!validDevices.includes(device)) {
    throw new Error(`URL entry ${index + 1}: Device must be one of: ${validDevices.join(', ')}`);
  }

  // Validate priority
  let priority = entry.priority !== undefined ? parseInt(entry.priority) : index + 1;
  if (priority < 1 || priority > 100) {
    throw new Error(`URL entry ${index + 1}: Priority must be between 1 and 100`);
  }

  return {
    url: trimmedUrl,
    label,
    device,
    priority,
    description: entry.description ? String(entry.description).trim() : null
  };
};

/**
 * Validate URLs array
 */
const validateUrls = (urls) => {
  if (!urls || !Array.isArray(urls)) {
    throw new Error('URLs must be an array');
  }

  if (urls.length < 2) {
    throw new Error('Multi-URL QR requires at least 2 URLs');
  }

  if (urls.length > 10) {
    throw new Error('Multi-URL QR supports maximum 10 URLs');
  }

  return urls.map((entry, index) => validateUrlEntry(entry, index));
};

/**
 * Validate multi-URL title
 */
const validateMultiUrlTitle = (title) => {
  if (!title) {
    return 'Choose Your Link';
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('Title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate routing strategy
 */
const validateRoutingStrategy = (strategy) => {
  if (!strategy) {
    return 'primary'; // Default strategy
  }

  const validStrategies = ['primary', 'device', 'choice', 'priority'];
  const trimmed = String(strategy).toLowerCase();

  if (!validStrategies.includes(trimmed)) {
    throw new Error(`Routing strategy must be one of: ${validStrategies.join(', ')}`);
  }

  return trimmed;
};

/**
 * Determine primary URL based on routing strategy
 */
const determinePrimaryUrl = (urls, strategy) => {
  switch (strategy) {
    case 'priority':
      // Sort by priority (lower number = higher priority) and return first
      const sorted = [...urls].sort((a, b) => a.priority - b.priority);
      return sorted[0].url;

    case 'device':
      // For device strategy, prefer 'all' device type as primary
      const allDevices = urls.find(u => u.device === 'all');
      return allDevices ? allDevices.url : urls[0].url;

    case 'choice':
    case 'primary':
    default:
      // Return first URL
      return urls[0].url;
  }
};

/**
 * Generate Multi-URL QR data
 *
 * @param {Object} options
 * @param {Array} options.urls - Array of URL objects: [{url, label, device, priority, description}]
 * @param {string} [options.title] - Landing page title
 * @param {string} [options.routingStrategy=primary] - Routing strategy: primary, device, choice, priority
 * @param {string} [options.landingPageUrl] - Custom landing page URL (future)
 * @returns {Object} Multi-URL QR data
 */
const generateMultiUrlQRData = ({
  urls,
  title,
  routingStrategy = 'primary',
  landingPageUrl
}) => {
  // Validate inputs
  const validatedUrls = validateUrls(urls);
  const validatedTitle = validateMultiUrlTitle(title);
  const validatedStrategy = validateRoutingStrategy(routingStrategy);

  // Determine which URL to use as primary (for QR code)
  const primaryUrl = determinePrimaryUrl(validatedUrls, validatedStrategy);

  // Sort URLs by priority for consistent ordering
  const sortedUrls = [...validatedUrls].sort((a, b) => a.priority - b.priority);

  return {
    url: landingPageUrl || primaryUrl, // Use custom landing page or primary URL
    primaryUrl,
    urls: sortedUrls,
    title: validatedTitle,
    routingStrategy: validatedStrategy,
    urlCount: validatedUrls.length,
    implementationPhase: 'direct-primary',
    note: landingPageUrl
      ? 'Using custom landing page for multi-URL routing'
      : 'Currently using primary URL. Deploy landing page service for full multi-URL functionality.'
  };
};

/**
 * Get Multi-URL QR platform info
 */
const getMultiUrlQRPlatformInfo = () => {
  return {
    name: 'Multi-URL QR Code',
    description: 'Smart QR code that can direct users to different URLs based on conditions',
    routingStrategies: {
      primary: {
        name: 'Primary URL',
        description: 'QR always points to the first URL in the list',
        useCase: 'Simple fallback with metadata for alternatives'
      },
      priority: {
        name: 'Priority-based',
        description: 'QR points to highest priority URL (lowest priority number)',
        useCase: 'Most important link gets primary position'
      },
      device: {
        name: 'Device Detection',
        description: 'Route based on device type (iOS, Android, Desktop)',
        useCase: 'Different app store links or device-specific content',
        requiresLandingPage: true
      },
      choice: {
        name: 'User Choice',
        description: 'Show landing page with all URL options',
        useCase: 'Let users choose between multiple options',
        requiresLandingPage: true
      }
    },
    deviceTypes: ['all', 'ios', 'android', 'desktop', 'mobile'],
    limits: {
      minUrls: 2,
      maxUrls: 10,
      maxLabelLength: 100,
      maxTitleLength: 200
    },
    useCases: [
      'App downloads (iOS App Store vs Google Play)',
      'Multi-language content (select your language)',
      'Regional menus (different locations)',
      'Day/night menus (time-based)',
      'Platform-specific content',
      'Social media hub (all your social links)',
      'Menu variations (lunch vs dinner)',
      'Seasonal content'
    ],
    restaurantExamples: [
      {
        title: 'Menu Language Selection',
        urls: [
          { label: 'English Menu', url: 'https://example.com/menu-en' },
          { label: 'Vietnamese Menu', url: 'https://example.com/menu-vi' },
          { label: 'Chinese Menu', url: 'https://example.com/menu-zh' }
        ]
      },
      {
        title: 'Time-Based Menu',
        urls: [
          { label: 'Breakfast Menu', url: 'https://example.com/breakfast' },
          { label: 'Lunch Menu', url: 'https://example.com/lunch' },
          { label: 'Dinner Menu', url: 'https://example.com/dinner' }
        ]
      },
      {
        title: 'App Download',
        urls: [
          { label: 'iOS App', url: 'https://apps.apple.com/app/id123', device: 'ios' },
          { label: 'Android App', url: 'https://play.google.com/store/apps/details?id=com.example', device: 'android' }
        ]
      }
    ],
    implementation: {
      current: 'Phase 1 - Direct Primary URL',
      currentDescription: 'QR points to primary URL with metadata for alternatives',
      future: 'Phase 2 - Smart Router Landing Page',
      futureFeatures: [
        'Device detection and auto-redirect',
        'Location-based routing',
        'Time-based routing',
        'A/B testing',
        'Analytics and tracking',
        'Custom landing page designs',
        'Short URL with routing logic'
      ]
    },
    bestPractices: [
      'Use clear, descriptive labels for each URL',
      'Set appropriate priorities',
      'Test all URLs on target devices',
      'Use consistent branding across all destination pages',
      'Consider user experience for manual choice pages',
      'For device routing, ensure URLs are device-appropriate',
      'Keep URL count reasonable (2-5 for best UX)'
    ]
  };
};

module.exports = {
  validateUrlEntry,
  validateUrls,
  validateMultiUrlTitle,
  validateRoutingStrategy,
  determinePrimaryUrl,
  generateMultiUrlQRData,
  getMultiUrlQRPlatformInfo
};
