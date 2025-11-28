/**
 * KakaoTalk QR Code Generator
 * South Korea's #1 Messaging App (95% market penetration, 47M users)
 *
 * Market: South Korea + Korean tourists globally
 * Users: 47+ million users (95% of South Koreans)
 * Competitive Advantage: Critical for Korean tourist market in Vietnam
 *
 * Context: 3.5M Korean tourists visit Vietnam yearly (pre-pandemic)
 * 40% of international arrivals in Da Nang are Korean
 */

/**
 * Validate Korean phone number
 * Formats supported:
 * - 82-10-xxxx-xxxx (international format)
 * - +82-10-xxxx-xxxx (international with +)
 * - 010-xxxx-xxxx (local format)
 */
const validateKoreanPhone = (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove spaces, dashes, parentheses
  const cleaned = String(phoneNumber).replace(/[\s\-()]/g, '');

  // Check Korean mobile phone format
  // Valid patterns:
  // - 82 + 10 + 8 digits (international)
  // - +82 + 10 + 8 digits (international with +)
  // - 010 + 8 digits (local format)
  const koreanPhoneRegex = /^(\+?82)?0?10\d{8}$/;

  if (!koreanPhoneRegex.test(cleaned)) {
    throw new Error(
      'Invalid Korean phone number. Format: +82-10-xxxx-xxxx or 010-xxxx-xxxx'
    );
  }

  return cleaned;
};

/**
 * Validate KakaoTalk ID
 * Alphanumeric with underscores, 4-20 characters
 */
const validateKakaoId = (kakaoId) => {
  if (!kakaoId) {
    throw new Error('KakaoTalk ID is required');
  }

  const trimmed = String(kakaoId).trim();

  // Alphanumeric + underscores, 4-20 chars
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(trimmed)) {
    throw new Error('KakaoTalk ID must be 4-20 alphanumeric characters (underscores allowed)');
  }

  return trimmed;
};

/**
 * Validate Plus Friend ID (Business Account)
 * Must start with @, followed by 3-30 alphanumeric characters or underscores
 */
const validatePlusFriendId = (plusFriendId) => {
  if (!plusFriendId) {
    throw new Error('Plus Friend ID is required');
  }

  const trimmed = String(plusFriendId).trim();

  // Must start with @, followed by 3-30 alphanumeric + underscores
  if (!/^@[a-zA-Z0-9_]{3,30}$/.test(trimmed)) {
    throw new Error('Plus Friend ID must start with @ and be 4-31 characters total (e.g., @businessname)');
  }

  return trimmed;
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
 * Normalize phone number to international format
 * Converts 010-xxxx-xxxx -> 82-10-xxxx-xxxx
 */
const normalizePhoneToInternational = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If starts with +82, remove +
  if (cleaned.startsWith('+82')) {
    return cleaned.substring(1);
  }

  // If starts with 010, replace with 82-10
  if (cleaned.startsWith('010')) {
    return '82' + cleaned.substring(1);
  }

  // If starts with 0, replace with 82
  if (cleaned.startsWith('0')) {
    return '82' + cleaned.substring(1);
  }

  // Already in international format (82xxx)
  return cleaned;
};

/**
 * Generate KakaoTalk deep link URL
 *
 * Priority: Plus Friend > KakaoTalk ID > Phone Number
 *
 * @param {Object} options
 * @param {string} [options.phoneNumber] - Korean phone number
 * @param {string} [options.kakaoId] - KakaoTalk ID
 * @param {string} [options.plusFriendId] - Plus Friend ID (business account)
 * @param {string} [options.displayName] - Display name (metadata only)
 * @param {string} [options.message] - Pre-filled message
 * @returns {Object} KakaoTalk data
 */
const generateKakaoTalkUrl = ({
  phoneNumber,
  kakaoId,
  plusFriendId,
  displayName,
  message
}) => {
  // At least one identifier required
  if (!phoneNumber && !kakaoId && !plusFriendId) {
    throw new Error('Either phoneNumber, kakaoId, or plusFriendId is required');
  }

  let url;
  let identifier;
  let identifierType;
  let rawIdentifier;
  let accountType;

  // Priority: Plus Friend > KakaoId > Phone
  if (plusFriendId) {
    identifier = validatePlusFriendId(plusFriendId);
    rawIdentifier = identifier;
    identifierType = 'plusFriend';
    accountType = 'business';
    // Plus Friend uses web URL (https://pf.kakao.com/@businessname)
    url = `https://pf.kakao.com/${identifier}`;
  } else if (kakaoId) {
    identifier = validateKakaoId(kakaoId);
    rawIdentifier = identifier;
    identifierType = 'kakaoId';
    accountType = 'personal';
    // KakaoTalk ID uses deep link
    url = `kakaotalk://open/friend?id=${identifier}`;
  } else {
    const validatedPhone = validateKoreanPhone(phoneNumber);
    rawIdentifier = validatedPhone;
    identifier = normalizePhoneToInternational(validatedPhone);
    identifierType = 'phone';
    accountType = 'personal';
    // Phone uses deep link
    url = `kakaotalk://open/friend?id=${identifier}`;
  }

  // Validate optional fields
  const validatedDisplayName = validateDisplayName(displayName);
  const validatedMessage = validateMessage(message);

  // Add message parameter if provided (not for Plus Friend)
  // Plus Friend messages work differently (through chat interface)
  if (validatedMessage && identifierType !== 'plusFriend') {
    const encodedMessage = encodeURIComponent(validatedMessage);
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}msg=${encodedMessage}`;
  }

  return {
    url,
    identifier,
    identifierType,
    accountType,
    rawIdentifier,
    displayName: validatedDisplayName,
    message: validatedMessage
  };
};

/**
 * Get KakaoTalk platform info
 */
const getKakaoTalkPlatformInfo = () => {
  return {
    name: 'KakaoTalk',
    country: 'South Korea',
    users: '47M+',
    marketPenetration: '95%',
    market: "South Korea's dominant messaging app",
    tourismContext: {
      koreanTouristsToVietnam: '3.5M/year (pre-pandemic)',
      daNangInternationalArrivals: '40% Korean',
      keyBusinesses: 'Korean restaurants, cafes, cosmetics shops'
    },
    accountTypes: {
      personal: {
        identifiers: ['Phone number', 'KakaoTalk ID'],
        deepLink: 'kakaotalk://open/friend?id=[ID]',
        features: ['Add friend', 'Start chat', 'Message pre-fill']
      },
      business: {
        identifier: 'Plus Friend ID (@businessname)',
        webLink: 'https://pf.kakao.com/@businessname',
        features: ['Follow business', 'Customer support', 'Marketing']
      }
    },
    usageNotes: [
      'KakaoTalk QR codes open the KakaoTalk app directly',
      'Plus Friend IDs must start with @',
      'Personal accounts can use phone or KakaoTalk ID',
      'Message pre-fill works for personal accounts',
      'Works on both iOS and Android',
      'Korean phone format: +82-10-xxxx-xxxx or 010-xxxx-xxxx'
    ]
  };
};

module.exports = {
  validateKoreanPhone,
  validateKakaoId,
  validatePlusFriendId,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  generateKakaoTalkUrl,
  getKakaoTalkPlatformInfo
};
