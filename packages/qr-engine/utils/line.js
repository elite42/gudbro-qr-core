/**
 * LINE QR Code Generator
 * Popular Messaging App in Thailand, Taiwan, and Japan
 *
 * Market: Thailand (49M), Taiwan (21M), Japan (95M)
 * Users: 165M+ users across 3 countries
 * Competitive Advantage: Critical for Thai and Taiwanese tourists
 *
 * Context:
 * - Thailand: 75% of population uses LINE
 * - Taiwan: 90% market penetration
 * - Vietnam-Thailand tourism: 800K visitors/year
 * - Thai restaurants, massage parlors, hotels need this
 */

/**
 * Validate LINE ID
 * Alphanumeric with periods and underscores, 4-20 characters
 */
const validateLineId = (lineId) => {
  if (!lineId) {
    throw new Error('LINE ID is required');
  }

  const trimmed = String(lineId).trim();

  // Alphanumeric + periods + underscores, 4-20 chars
  if (!/^[a-zA-Z0-9._]{4,20}$/.test(trimmed)) {
    throw new Error('LINE ID must be 4-20 characters (alphanumeric, periods, and underscores allowed)');
  }

  return trimmed;
};

/**
 * Validate Official Account ID (Business Account)
 * Must start with @, followed by 3-20 alphanumeric characters or underscores
 */
const validateOfficialAccountId = (officialAccountId) => {
  if (!officialAccountId) {
    throw new Error('Official Account ID is required');
  }

  const trimmed = String(officialAccountId).trim();

  // Must start with @, followed by 3-20 alphanumeric + underscores
  if (!/^@[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
    throw new Error('Official Account ID must start with @ and be 4-21 characters total (e.g., @businessname)');
  }

  return trimmed;
};

/**
 * Validate phone number (Thailand, Taiwan, Japan)
 * Thailand: +66
 * Taiwan: +886
 * Japan: +81
 */
const validateLinePhone = (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove spaces, dashes, parentheses
  const cleaned = String(phoneNumber).replace(/[\s\-()]/g, '');

  // Thailand: +66 + 8-10 digits
  // Taiwan: +886 + 8-10 digits
  // Japan: +81 + 8-10 digits
  const linePhoneRegex = /^(\+?(66|886|81))\d{8,10}$/;

  if (!linePhoneRegex.test(cleaned)) {
    throw new Error(
      'Invalid phone number. Supported countries: Thailand (+66), Taiwan (+886), Japan (+81)'
    );
  }

  return cleaned;
};

/**
 * Validate display name (optional)
 */
const validateDisplayName = (displayName) => {
  if (!displayName) {
    return null;
  }

  const trimmed = String(displayName).trim();

  if (trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters');
  }

  if (trimmed.length > 100) {
    throw new Error('Display name must not exceed 100 characters');
  }

  return trimmed;
};

/**
 * Validate message (optional)
 */
const validateMessage = (message) => {
  if (!message) {
    return null;
  }

  const trimmed = String(message).trim();

  if (trimmed.length > 500) {
    throw new Error('Message must not exceed 500 characters');
  }

  return trimmed;
};

/**
 * Normalize phone to international format
 * Adds + if missing
 */
const normalizePhoneToInternational = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }

  return cleaned;
};

/**
 * Detect country from phone number
 */
const detectCountryFromPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.includes('66') || cleaned.startsWith('66')) {
    return { code: 'TH', name: 'Thailand', dialCode: '+66' };
  }

  if (cleaned.includes('886') || cleaned.startsWith('886')) {
    return { code: 'TW', name: 'Taiwan', dialCode: '+886' };
  }

  if (cleaned.includes('81') || cleaned.startsWith('81')) {
    return { code: 'JP', name: 'Japan', dialCode: '+81' };
  }

  return { code: 'UNKNOWN', name: 'Unknown', dialCode: '' };
};

/**
 * Generate LINE deep link URL
 *
 * Priority: Official Account > LINE ID > Phone Number
 *
 * @param {Object} options
 * @param {string} [options.lineId] - LINE ID
 * @param {string} [options.phoneNumber] - Phone number (Thailand/Taiwan/Japan)
 * @param {string} [options.officialAccountId] - Official Account ID (business)
 * @param {string} [options.displayName] - Display name (metadata only)
 * @param {string} [options.message] - Pre-filled message
 * @returns {Object} LINE data
 */
const generateLineUrl = ({
  lineId,
  phoneNumber,
  officialAccountId,
  displayName,
  message
}) => {
  // At least one identifier required
  if (!lineId && !phoneNumber && !officialAccountId) {
    throw new Error('Either lineId, phoneNumber, or officialAccountId is required');
  }

  let url;
  let identifier;
  let identifierType;
  let rawIdentifier;
  let accountType;
  let country = null;

  // Priority: Official Account > LINE ID > Phone
  if (officialAccountId) {
    identifier = validateOfficialAccountId(officialAccountId);
    rawIdentifier = identifier;
    identifierType = 'officialAccount';
    accountType = 'business';
    // Official Account uses /R/ format
    url = `https://line.me/R/ti/p/${identifier}`;
  } else if (lineId) {
    identifier = validateLineId(lineId);
    rawIdentifier = identifier;
    identifierType = 'lineId';
    accountType = 'personal';
    // LINE ID uses /ti/p/~ format
    url = `https://line.me/ti/p/~${identifier}`;
  } else {
    const validatedPhone = validateLinePhone(phoneNumber);
    rawIdentifier = validatedPhone;
    identifier = normalizePhoneToInternational(validatedPhone);
    identifierType = 'phone';
    accountType = 'personal';
    country = detectCountryFromPhone(validatedPhone);
    // Phone uses /ti/p/ format with phone number
    url = `https://line.me/ti/p/${identifier}`;
  }

  // Validate optional fields
  const validatedDisplayName = validateDisplayName(displayName);
  const validatedMessage = validateMessage(message);

  // Add message parameter if provided
  if (validatedMessage) {
    const encodedMessage = encodeURIComponent(validatedMessage);
    url += `?msg=${encodedMessage}`;
  }

  const result = {
    url,
    identifier,
    identifierType,
    accountType,
    rawIdentifier,
    displayName: validatedDisplayName,
    message: validatedMessage
  };

  // Add country info if phone was used
  if (country) {
    result.country = country;
  }

  return result;
};

/**
 * Get LINE platform info
 */
const getLinePlatformInfo = () => {
  return {
    name: 'LINE',
    countries: [
      { code: 'TH', name: 'Thailand', users: '49M', penetration: '75%' },
      { code: 'TW', name: 'Taiwan', users: '21M', penetration: '90%' },
      { code: 'JP', name: 'Japan', users: '95M', penetration: '~70%' }
    ],
    totalUsers: '165M+',
    market: 'Dominant messaging app in Thailand, Taiwan, and Japan',
    tourismContext: {
      vietnamThailandTourism: '800K visitors/year',
      keyBusinesses: 'Thai restaurants, massage parlors, hotels, tour agencies'
    },
    accountTypes: {
      personal: {
        identifiers: ['LINE ID', 'Phone number'],
        webUrl: 'https://line.me/ti/p/~[ID]',
        features: ['Add friend', 'Start chat', 'Message pre-fill']
      },
      business: {
        identifier: 'Official Account ID (@businessname)',
        webUrl: 'https://line.me/R/ti/p/@businessname',
        features: ['Follow business', 'Customer support', 'Marketing', 'Rich menus']
      }
    },
    supportedCountries: [
      { code: 'TH', dialCode: '+66', name: 'Thailand' },
      { code: 'TW', dialCode: '+886', name: 'Taiwan' },
      { code: 'JP', dialCode: '+81', name: 'Japan' }
    ],
    usageNotes: [
      'LINE QR codes open the LINE app directly',
      'Official Account IDs must start with @',
      'Personal accounts can use LINE ID or phone number',
      'Message pre-fill works for all account types',
      'Works on both iOS and Android',
      'Phone formats: +66 (TH), +886 (TW), +81 (JP)'
    ]
  };
};

module.exports = {
  validateLineId,
  validateOfficialAccountId,
  validateLinePhone,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  detectCountryFromPhone,
  generateLineUrl,
  getLinePlatformInfo
};
