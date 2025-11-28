/**
 * KakaoTalk QR Code - Unit Tests
 *
 * Tests for South Korea's #1 messaging app (95% market penetration, 47M users)
 */

const {
  validateKoreanPhone,
  validateKakaoId,
  validatePlusFriendId,
  validateDisplayName,
  validateMessage,
  normalizePhoneToInternational,
  generateKakaoTalkUrl,
  getKakaoTalkPlatformInfo
} = require('../utils/kakaotalk');

describe('KakaoTalk QR Code', () => {
  describe('validateKoreanPhone', () => {
    test('should accept valid Korean phone numbers (international format)', () => {
      expect(validateKoreanPhone('821012345678')).toBe('821012345678');
      expect(validateKoreanPhone('821098765432')).toBe('821098765432');
      expect(validateKoreanPhone('821011112222')).toBe('821011112222');
    });

    test('should accept valid Korean phone numbers (with +)', () => {
      expect(validateKoreanPhone('+821012345678')).toBe('+821012345678');
      expect(validateKoreanPhone('+821098765432')).toBe('+821098765432');
    });

    test('should accept valid Korean phone numbers (local format)', () => {
      expect(validateKoreanPhone('01012345678')).toBe('01012345678');
      expect(validateKoreanPhone('01098765432')).toBe('01098765432');
      expect(validateKoreanPhone('01011112222')).toBe('01011112222');
    });

    test('should remove spaces, dashes, and parentheses', () => {
      expect(validateKoreanPhone('010 1234 5678')).toBe('01012345678');
      expect(validateKoreanPhone('010-1234-5678')).toBe('01012345678');
      expect(validateKoreanPhone('(010) 1234-5678')).toBe('01012345678');
      expect(validateKoreanPhone('82 10 1234 5678')).toBe('821012345678');
    });

    test('should reject invalid phone numbers', () => {
      expect(() => validateKoreanPhone('123456789')).toThrow('Invalid Korean phone number');
      expect(() => validateKoreanPhone('01112345678')).toThrow(); // Wrong prefix (011)
      expect(() => validateKoreanPhone('02012345678')).toThrow(); // Wrong prefix (020)
      expect(() => validateKoreanPhone('821112345678')).toThrow(); // Wrong prefix (8211)
      expect(() => validateKoreanPhone('abc')).toThrow();
      expect(() => validateKoreanPhone('')).toThrow('Phone number is required');
      expect(() => validateKoreanPhone(null)).toThrow('Phone number is required');
    });
  });

  describe('validateKakaoId', () => {
    test('should accept valid KakaoTalk IDs', () => {
      expect(validateKakaoId('user123')).toBe('user123');
      expect(validateKakaoId('kakaofriend')).toBe('kakaofriend');
      expect(validateKakaoId('user_name_123')).toBe('user_name_123');
      expect(validateKakaoId('UPPERCASE')).toBe('UPPERCASE');
      expect(validateKakaoId('MixedCase123')).toBe('MixedCase123');
      expect(validateKakaoId('1234')).toBe('1234'); // Minimum 4 chars
      expect(validateKakaoId('12345678901234567890')).toBe('12345678901234567890'); // Maximum 20 chars
    });

    test('should trim whitespace', () => {
      expect(validateKakaoId('  user123  ')).toBe('user123');
      expect(validateKakaoId('   kakao   ')).toBe('kakao');
    });

    test('should reject invalid KakaoTalk IDs', () => {
      expect(() => validateKakaoId('abc')).toThrow('4-20 alphanumeric'); // Too short (3 chars)
      expect(() => validateKakaoId('a'.repeat(21))).toThrow('4-20 alphanumeric'); // Too long
      expect(() => validateKakaoId('user@name')).toThrow(); // Invalid character (@)
      expect(() => validateKakaoId('user-name')).toThrow(); // Invalid character (-)
      expect(() => validateKakaoId('user name')).toThrow(); // Space not allowed
      expect(() => validateKakaoId('user.name')).toThrow(); // Dot not allowed
      expect(() => validateKakaoId('')).toThrow('KakaoTalk ID is required');
      expect(() => validateKakaoId(null)).toThrow('KakaoTalk ID is required');
    });
  });

  describe('validatePlusFriendId', () => {
    test('should accept valid Plus Friend IDs', () => {
      expect(validatePlusFriendId('@business')).toBe('@business');
      expect(validatePlusFriendId('@gudbrovietnam')).toBe('@gudbrovietnam');
      expect(validatePlusFriendId('@company_name')).toBe('@company_name');
      expect(validatePlusFriendId('@UPPERCASE')).toBe('@UPPERCASE');
      expect(validatePlusFriendId('@abc')).toBe('@abc'); // Minimum: @ + 3 chars
      expect(validatePlusFriendId('@' + 'a'.repeat(30))).toBe('@' + 'a'.repeat(30)); // Maximum: @ + 30 chars
    });

    test('should trim whitespace', () => {
      expect(validatePlusFriendId('  @business  ')).toBe('@business');
      expect(validatePlusFriendId('   @company   ')).toBe('@company');
    });

    test('should reject invalid Plus Friend IDs', () => {
      expect(() => validatePlusFriendId('business')).toThrow('must start with @'); // Missing @
      expect(() => validatePlusFriendId('@ab')).toThrow(); // Too short (@ + 2 chars)
      expect(() => validatePlusFriendId('@' + 'a'.repeat(31))).toThrow(); // Too long
      expect(() => validatePlusFriendId('@user@name')).toThrow(); // Extra @
      expect(() => validatePlusFriendId('@user-name')).toThrow(); // Invalid character (-)
      expect(() => validatePlusFriendId('@user name')).toThrow(); // Space not allowed
      expect(() => validatePlusFriendId('@user.name')).toThrow(); // Dot not allowed
      expect(() => validatePlusFriendId('')).toThrow('Plus Friend ID is required');
      expect(() => validatePlusFriendId(null)).toThrow('Plus Friend ID is required');
    });
  });

  describe('validateDisplayName', () => {
    test('should accept valid display names', () => {
      expect(validateDisplayName('Gudbro Restaurant')).toBe('Gudbro Restaurant');
      expect(validateDisplayName('Korean Cafe')).toBe('Korean Cafe');
      expect(validateDisplayName('김치찌개')).toBe('김치찌개'); // Korean characters
    });

    test('should return null for empty values', () => {
      expect(validateDisplayName(undefined)).toBeNull();
      expect(validateDisplayName(null)).toBeNull();
      expect(validateDisplayName('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDisplayName('  Gudbro  ')).toBe('Gudbro');
      expect(validateDisplayName('   Cafe   ')).toBe('Cafe');
    });

    test('should reject invalid display names', () => {
      expect(() => validateDisplayName('A')).toThrow('at least 2 characters');
      expect(() => validateDisplayName('A'.repeat(101))).toThrow('not exceed 100 characters');
    });
  });

  describe('validateMessage', () => {
    test('should accept valid messages', () => {
      expect(validateMessage('안녕하세요')).toBe('안녕하세요'); // Korean "Hello"
      expect(validateMessage('Hello, I want to make a reservation')).toBe('Hello, I want to make a reservation');
      expect(validateMessage('예약하고 싶습니다')).toBe('예약하고 싶습니다'); // Korean "I want to make a reservation"
    });

    test('should return null for empty values', () => {
      expect(validateMessage(undefined)).toBeNull();
      expect(validateMessage(null)).toBeNull();
      expect(validateMessage('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateMessage('  Hello  ')).toBe('Hello');
      expect(validateMessage('   안녕   ')).toBe('안녕');
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(501);
      expect(() => validateMessage(longMessage)).toThrow('not exceed 500 characters');
    });
  });

  describe('normalizePhoneToInternational', () => {
    test('should convert local format (010) to international (8210)', () => {
      expect(normalizePhoneToInternational('01012345678')).toBe('821012345678');
      expect(normalizePhoneToInternational('01098765432')).toBe('821098765432');
    });

    test('should keep international format unchanged', () => {
      expect(normalizePhoneToInternational('821012345678')).toBe('821012345678');
      expect(normalizePhoneToInternational('821098765432')).toBe('821098765432');
    });

    test('should handle +82 format', () => {
      expect(normalizePhoneToInternational('+821012345678')).toBe('821012345678');
      expect(normalizePhoneToInternational('+821098765432')).toBe('821098765432');
    });

    test('should remove spaces and dashes', () => {
      expect(normalizePhoneToInternational('010 1234 5678')).toBe('821012345678');
      expect(normalizePhoneToInternational('010-1234-5678')).toBe('821012345678');
    });
  });

  describe('generateKakaoTalkUrl', () => {
    test('should generate KakaoTalk URL with phone number (local format)', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '01012345678'
      });

      expect(result.url).toBe('kakaotalk://open/friend?id=821012345678');
      expect(result.identifier).toBe('821012345678');
      expect(result.identifierType).toBe('phone');
      expect(result.accountType).toBe('personal');
      expect(result.rawIdentifier).toBe('01012345678');
    });

    test('should generate KakaoTalk URL with phone number (international format)', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '821012345678'
      });

      expect(result.url).toBe('kakaotalk://open/friend?id=821012345678');
      expect(result.identifier).toBe('821012345678');
      expect(result.identifierType).toBe('phone');
    });

    test('should generate KakaoTalk URL with KakaoTalk ID', () => {
      const result = generateKakaoTalkUrl({
        kakaoId: 'user123'
      });

      expect(result.url).toBe('kakaotalk://open/friend?id=user123');
      expect(result.identifier).toBe('user123');
      expect(result.identifierType).toBe('kakaoId');
      expect(result.accountType).toBe('personal');
    });

    test('should generate KakaoTalk URL with Plus Friend ID', () => {
      const result = generateKakaoTalkUrl({
        plusFriendId: '@gudbrovietnam'
      });

      expect(result.url).toBe('https://pf.kakao.com/@gudbrovietnam');
      expect(result.identifier).toBe('@gudbrovietnam');
      expect(result.identifierType).toBe('plusFriend');
      expect(result.accountType).toBe('business');
    });

    test('should generate KakaoTalk URL with display name', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '01012345678',
        displayName: 'Gudbro Restaurant'
      });

      expect(result.displayName).toBe('Gudbro Restaurant');
    });

    test('should generate KakaoTalk URL with message (personal account)', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '01012345678',
        message: '안녕하세요, 예약하고 싶습니다'
      });

      expect(result.url).toContain('kakaotalk://open/friend?id=821012345678');
      expect(result.url).toContain('msg=');
      expect(result.message).toBe('안녕하세요, 예약하고 싶습니다');
    });

    test('should NOT add message to Plus Friend URL', () => {
      const result = generateKakaoTalkUrl({
        plusFriendId: '@gudbrovietnam',
        message: 'Hello'
      });

      expect(result.url).toBe('https://pf.kakao.com/@gudbrovietnam');
      expect(result.url).not.toContain('msg=');
      expect(result.message).toBe('Hello'); // Message stored but not in URL
    });

    test('should prioritize Plus Friend over KakaoTalk ID', () => {
      const result = generateKakaoTalkUrl({
        plusFriendId: '@business',
        kakaoId: 'user123'
      });

      expect(result.url).toBe('https://pf.kakao.com/@business');
      expect(result.identifierType).toBe('plusFriend');
    });

    test('should prioritize KakaoTalk ID over phone number', () => {
      const result = generateKakaoTalkUrl({
        kakaoId: 'user123',
        phoneNumber: '01012345678'
      });

      expect(result.url).toBe('kakaotalk://open/friend?id=user123');
      expect(result.identifierType).toBe('kakaoId');
    });

    test('should generate URL with all fields (personal)', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '01012345678',
        displayName: 'Korean Friend',
        message: 'Hello, how are you?'
      });

      expect(result.identifier).toBe('821012345678');
      expect(result.displayName).toBe('Korean Friend');
      expect(result.message).toBe('Hello, how are you?');
      expect(result.url).toContain('msg=');
    });

    test('should throw error when no identifier provided', () => {
      expect(() => generateKakaoTalkUrl({})).toThrow('phoneNumber, kakaoId, or plusFriendId is required');
      expect(() => generateKakaoTalkUrl({ displayName: 'Test' })).toThrow('phoneNumber, kakaoId, or plusFriendId is required');
    });

    test('should encode special characters in message', () => {
      const result = generateKakaoTalkUrl({
        phoneNumber: '01012345678',
        message: 'Reservation #123 @ 7pm'
      });

      expect(result.url).toContain('msg=');
      expect(result.url).toContain('%23'); // # encoded
      expect(result.url).toContain('%40'); // @ encoded
    });
  });

  describe('getKakaoTalkPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getKakaoTalkPlatformInfo();

      expect(info).toHaveProperty('name', 'KakaoTalk');
      expect(info).toHaveProperty('country', 'South Korea');
      expect(info).toHaveProperty('users', '47M+');
      expect(info).toHaveProperty('marketPenetration', '95%');
      expect(info).toHaveProperty('market');
      expect(info).toHaveProperty('tourismContext');
      expect(info).toHaveProperty('accountTypes');
      expect(info).toHaveProperty('usageNotes');
      expect(Array.isArray(info.usageNotes)).toBe(true);
      expect(info.accountTypes).toHaveProperty('personal');
      expect(info.accountTypes).toHaveProperty('business');
    });

    test('should include tourism context', () => {
      const info = getKakaoTalkPlatformInfo();

      expect(info.tourismContext).toHaveProperty('koreanTouristsToVietnam');
      expect(info.tourismContext).toHaveProperty('daNangInternationalArrivals');
      expect(info.tourismContext.daNangInternationalArrivals).toContain('40% Korean');
    });
  });
});
