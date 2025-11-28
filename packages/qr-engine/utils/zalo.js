/**
 * Zalo Social QR Code Generator
 * Vietnam's #1 Messaging App (74M+ users)
 *
 * Market: Vietnam
 * Users: 74+ million users
 * Competitive Advantage: NO competitor supports this
 */

/**
 * Validate Vietnamese phone number
 * Formats supported:
 * - 84xxxxxxxxx (international format)
 * - 0xxxxxxxxx (local format)
 */
const validateVietnamesePhone = (phoneNumber) => {
  if (!phoneNumber) {
    throw new Error('Phone number is required');
  }

  // Remove spaces, dashes, parentheses
  const cleaned = String(phoneNumber).replace(/[\s\-()]/g, '');

  // Check Vietnamese phone format
  // Valid patterns:
  // - 84 + (3|5|7|8|9) + 8 digits
  // - 0 + (3|5|7|8|9) + 8 digits
  const vnPhoneRegex = /^(84|0)(3|5|7|8|9)\d{8}$/;

  if (!vnPhoneRegex.test(cleaned)) {
    throw new Error(
      'Invalid Vietnamese phone number. Format: 84xxxxxxxxx or 0xxxxxxxxx (must start with 03, 05, 07, 08, or 09)'
    );
  }

  return cleaned;
};

/**
 * Validate Zalo ID
 * Alphanumeric with underscores, 6-30 characters
 */
const validateZaloId = (zaloId) => {
  if (!zaloId) {
    throw new Error('Zalo ID is required');
  }

  const trimmed = String(zaloId).trim();

  // Alphanumeric + underscores, 6-30 chars
  if (!/^[a-zA-Z0-9_]{6,30}$/.test(trimmed)) {
    throw new Error('Zalo ID must be 6-30 alphanumeric characters (underscores allowed)');
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
 * Converts 0912345678 -> 84912345678
 */
const normalizePhoneToInternational = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // If starts with 0, replace with 84
  if (cleaned.startsWith('0')) {
    return '84' + cleaned.substring(1);
  }

  // If starts with +84, remove +
  if (cleaned.startsWith('+84')) {
    return cleaned.substring(1);
  }

  // Already in international format (84xxx)
  return cleaned;
};

/**
 * Generate Zalo deep link URL
 *
 * @param {Object} options
 * @param {string} [options.phoneNumber] - Vietnamese phone number
 * @param {string} [options.zaloId] - Zalo ID
 * @param {string} [options.displayName] - Display name (metadata only)
 * @param {string} [options.message] - Pre-filled message
 * @returns {Object} Zalo data
 */
const generateZaloUrl = ({ phoneNumber, zaloId, displayName, message }) => {
  // At least one identifier required
  if (!phoneNumber && !zaloId) {
    throw new Error('Either phoneNumber or zaloId is required');
  }

  let identifier;
  let identifierType;
  let rawIdentifier;

  // Priority: phoneNumber > zaloId
  if (phoneNumber) {
    const validatedPhone = validateVietnamesePhone(phoneNumber);
    rawIdentifier = validatedPhone;
    identifier = normalizePhoneToInternational(validatedPhone);
    identifierType = 'phone';
  } else {
    identifier = validateZaloId(zaloId);
    rawIdentifier = identifier;
    identifierType = 'zaloId';
  }

  // Validate optional fields
  const validatedDisplayName = validateDisplayName(displayName);
  const validatedMessage = validateMessage(message);

  // Build Zalo URL
  // Format: https://zalo.me/[IDENTIFIER]
  let zaloUrl = `https://zalo.me/${identifier}`;

  // Add message parameter if provided
  if (validatedMessage) {
    const encodedMessage = encodeURIComponent(validatedMessage);
    zaloUrl += `?msg=${encodedMessage}`;
  }

  return {
    url: zaloUrl,
    identifier,
    identifierType,
    rawIdentifier,
    displayName: validatedDisplayName,
    message: validatedMessage
  };
};

/**
 * Get Zalo platform info
 */
const getZaloPlatformInfo = () => {
  return {
    name: 'Zalo',
    country: 'Vietnam',
    users: '74M+',
    market: "Vietnam's #1 messaging app",
    usageNotes: [
      'Zalo QR codes open the Zalo app directly',
      'Users can add friend or start chat instantly',
      'Message pre-fill is optional',
      'Works on both iOS and Android',
      'Vietnamese phone format: 84xxxxxxxxx or 0xxxxxxxxx'
    ]
  };
};

module.exports = {
  validateVietnamesePhone,
  validateZaloId,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  generateZaloUrl,
  getZaloPlatformInfo
};
