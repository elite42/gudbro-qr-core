const {
  generateShortCode,
  generateUniqueShortCode,
  isValidShortCode,
  generateCustomShortCode
} = require('../utils/shortcode');

describe('Short Code Generator', () => {
  describe('generateShortCode', () => {
    test('should generate code of default length 6', () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
    });

    test('should generate code with custom length', () => {
      const code = generateShortCode(8);
      expect(code).toHaveLength(8);
    });

    test('should only contain alphanumeric characters', () => {
      const code = generateShortCode();
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    });

    test('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      // Should have generated 100 unique codes
      expect(codes.size).toBe(100);
    });
  });

  describe('generateUniqueShortCode', () => {
    test('should generate unique code when no collision', async () => {
      const checkExists = async () => false;
      const code = await generateUniqueShortCode(checkExists);
      expect(code).toHaveLength(6);
    });

    test('should retry on collision and succeed', async () => {
      let callCount = 0;
      const checkExists = async (code) => {
        callCount++;
        // Simulate collision on first 2 attempts
        return callCount <= 2;
      };
      
      const code = await generateUniqueShortCode(checkExists);
      expect(code).toHaveLength(6);
      expect(callCount).toBe(3); // 2 collisions + 1 success
    });

    test('should throw error after max retries', async () => {
      const checkExists = async () => true; // Always collision
      
      await expect(
        generateUniqueShortCode(checkExists, 6, 3)
      ).rejects.toThrow('Failed to generate unique short code');
    });
  });

  describe('isValidShortCode', () => {
    test('should validate correct codes', () => {
      expect(isValidShortCode('abc123')).toBe(true);
      expect(isValidShortCode('XYZ789')).toBe(true);
      expect(isValidShortCode('a1B2c3')).toBe(true);
    });

    test('should reject invalid codes', () => {
      expect(isValidShortCode('ab')).toBe(false); // Too short
      expect(isValidShortCode('12345678901')).toBe(false); // Too long
      expect(isValidShortCode('abc-123')).toBe(false); // Contains dash
      expect(isValidShortCode('abc 123')).toBe(false); // Contains space
      expect(isValidShortCode('abc@123')).toBe(false); // Contains special char
      expect(isValidShortCode('')).toBe(false); // Empty
      expect(isValidShortCode(null)).toBe(false); // Null
    });
  });

  describe('generateCustomShortCode', () => {
    test('should accept valid custom code', async () => {
      const checkExists = async () => false;
      const code = await generateCustomShortCode('mycode', checkExists);
      expect(code).toBe('mycode');
    });

    test('should reject invalid custom code', async () => {
      const checkExists = async () => false;
      
      await expect(
        generateCustomShortCode('ab', checkExists)
      ).rejects.toThrow('Invalid custom code format');
      
      await expect(
        generateCustomShortCode('my-code', checkExists)
      ).rejects.toThrow('Invalid custom code format');
    });

    test('should reject taken custom code', async () => {
      const checkExists = async () => true;
      
      await expect(
        generateCustomShortCode('mycode', checkExists)
      ).rejects.toThrow('already taken');
    });
  });
});
