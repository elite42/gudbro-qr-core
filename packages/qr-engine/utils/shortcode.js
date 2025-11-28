const { customAlphabet } = require('nanoid');

// Base62 charset: a-z, A-Z, 0-9
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate a random short code
 * Default length: 6 characters
 * 62^6 = 56,800,235,584 possible combinations
 * 
 * @param {number} length - Length of the short code (default: 6)
 * @returns {string} - Random short code
 */
function generateShortCode(length = 6) {
  const nanoid = customAlphabet(CHARSET, length);
  return nanoid();
}

/**
 * Generate a unique short code with collision detection
 * Retries up to maxRetries times if collision occurs
 * 
 * @param {Function} checkExists - Async function to check if code exists
 * @param {number} length - Length of the short code
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Unique short code
 * @throws {Error} - If max retries exceeded
 */
async function generateUniqueShortCode(checkExists, length = 6, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateShortCode(length);
    
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
    
    // Log collision (rare event, worth tracking)
    console.warn(`⚠️  Short code collision detected: ${code} (attempt ${attempt + 1}/${maxRetries})`);
  }
  
  throw new Error(`Failed to generate unique short code after ${maxRetries} attempts`);
}

/**
 * Validate short code format
 * @param {string} code - Short code to validate
 * @returns {boolean} - True if valid
 */
function isValidShortCode(code) {
  if (!code || typeof code !== 'string') return false;
  
  // Must be 3-10 characters, alphanumeric only
  const regex = /^[a-zA-Z0-9]{3,10}$/;
  return regex.test(code);
}

/**
 * Generate custom short code (for premium users)
 * @param {string} custom - Custom code requested
 * @param {Function} checkExists - Function to check availability
 * @returns {Promise<string>} - Custom code if available
 * @throws {Error} - If code is invalid or taken
 */
async function generateCustomShortCode(custom, checkExists) {
  // Validate format
  if (!isValidShortCode(custom)) {
    throw new Error('Invalid custom code format. Use 3-10 alphanumeric characters.');
  }
  
  // Check if taken
  const exists = await checkExists(custom);
  if (exists) {
    throw new Error('Custom code already taken. Please choose another.');
  }
  
  return custom;
}

module.exports = {
  generateShortCode,
  generateUniqueShortCode,
  isValidShortCode,
  generateCustomShortCode
};
