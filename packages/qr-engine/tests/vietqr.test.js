/**
 * VietQR Payment QR Code - Unit Tests
 *
 * Tests for Vietnam National Payment Standard (NAPAS)
 */

const {
  validateBankCode,
  validateAccountNumber,
  validateAccountName,
  validateAmount,
  validateDescription,
  generateVietQRUrl,
  getSupportedBanks,
  VIETNAM_BANKS
} = require('../utils/vietqr');

describe('VietQR Payment QR Code', () => {
  describe('validateBankCode', () => {
    test('should accept valid bank codes', () => {
      expect(() => validateBankCode('VCB')).not.toThrow();
      expect(() => validateBankCode('BIDV')).not.toThrow();
      expect(() => validateBankCode('VTB')).not.toThrow();
      expect(() => validateBankCode('ARB')).not.toThrow();
      expect(() => validateBankCode('TCB')).not.toThrow();
      expect(() => validateBankCode('MB')).not.toThrow();
      expect(() => validateBankCode('MOMO')).not.toThrow();
    });

    test('should normalize bank codes to uppercase', () => {
      expect(validateBankCode('vcb')).toBe('VCB');
      expect(validateBankCode('bidv')).toBe('BIDV');
      expect(validateBankCode('VcB')).toBe('VCB');
    });

    test('should reject invalid bank codes', () => {
      expect(() => validateBankCode('INVALID')).toThrow('Invalid bank code');
      expect(() => validateBankCode('XYZ')).toThrow();
      expect(() => validateBankCode('')).toThrow('Bank code is required');
      expect(() => validateBankCode(null)).toThrow('Bank code is required');
    });
  });

  describe('validateAccountNumber', () => {
    test('should accept valid account numbers', () => {
      expect(validateAccountNumber('123456')).toBe('123456');
      expect(validateAccountNumber('1234567890')).toBe('1234567890');
      expect(validateAccountNumber('12345678901234567890')).toBe('12345678901234567890'); // 20 digits
    });

    test('should remove spaces and dashes', () => {
      expect(validateAccountNumber('123 456 789')).toBe('123456789');
      expect(validateAccountNumber('123-456-789')).toBe('123456789');
      expect(validateAccountNumber('12-34-56-78-90')).toBe('1234567890');
    });

    test('should reject invalid account numbers', () => {
      expect(() => validateAccountNumber('12345')).toThrow('6-20 digits'); // Too short
      expect(() => validateAccountNumber('123456789012345678901')).toThrow('6-20 digits'); // Too long
      expect(() => validateAccountNumber('12abc34')).toThrow('6-20 digits'); // Contains letters
      expect(() => validateAccountNumber('')).toThrow('Account number is required');
      expect(() => validateAccountNumber(null)).toThrow('Account number is required');
    });
  });

  describe('validateAccountName', () => {
    test('should accept valid account names', () => {
      expect(validateAccountName('NGUYEN VAN A')).toBe('NGUYEN VAN A');
      expect(validateAccountName('Tran Thi B')).toBe('Tran Thi B');
      expect(validateAccountName('Le Van C')).toBe('Le Van C');
    });

    test('should trim whitespace', () => {
      expect(validateAccountName('  NGUYEN VAN A  ')).toBe('NGUYEN VAN A');
      expect(validateAccountName('   Tran Thi B   ')).toBe('Tran Thi B');
    });

    test('should reject invalid account names', () => {
      expect(() => validateAccountName('A')).toThrow('at least 2 characters');
      expect(() => validateAccountName('A'.repeat(51))).toThrow('not exceed 50 characters');
      expect(() => validateAccountName('')).toThrow('Account name is required');
      expect(() => validateAccountName(null)).toThrow('Account name is required');
    });
  });

  describe('validateAmount', () => {
    test('should accept valid amounts', () => {
      expect(validateAmount(1000)).toBe(1000);
      expect(validateAmount(50000)).toBe(50000);
      expect(validateAmount(1000000)).toBe(1000000);
      expect(validateAmount(100000000)).toBe(100000000);
    });

    test('should return null for empty values', () => {
      expect(validateAmount(undefined)).toBeNull();
      expect(validateAmount(null)).toBeNull();
      expect(validateAmount('')).toBeNull();
    });

    test('should reject invalid amounts', () => {
      expect(() => validateAmount(0)).toThrow('greater than 0');
      expect(() => validateAmount(-1000)).toThrow('greater than 0');
      expect(() => validateAmount(500000001)).toThrow('not exceed 500,000,000 VND');
      expect(() => validateAmount('abc')).toThrow('valid number');
    });
  });

  describe('validateDescription', () => {
    test('should accept valid descriptions', () => {
      expect(validateDescription('Thanh toan don hang #123')).toBe('Thanh toan don hang #123');
      expect(validateDescription('Payment for invoice')).toBe('Payment for invoice');
    });

    test('should return null for empty values', () => {
      expect(validateDescription(undefined)).toBeNull();
      expect(validateDescription(null)).toBeNull();
      expect(validateDescription('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateDescription('  Test description  ')).toBe('Test description');
    });

    test('should reject descriptions that are too long', () => {
      const longDesc = 'A'.repeat(256);
      expect(() => validateDescription(longDesc)).toThrow('not exceed 255 characters');
    });
  });

  describe('generateVietQRUrl', () => {
    test('should generate VietQR URL with required fields only', () => {
      const result = generateVietQRUrl({
        bankCode: 'VCB',
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A'
      });

      expect(result.url).toContain('https://img.vietqr.io/image/VCB-1234567890-compact.jpg');
      expect(result.url).toContain('accountName=NGUYEN+VAN+A');
      expect(result.bankCode).toBe('VCB');
      expect(result.bankName).toBe('Vietcombank');
      expect(result.accountNumber).toBe('1234567890');
      expect(result.accountName).toBe('NGUYEN VAN A');
      expect(result.amount).toBeNull();
      expect(result.description).toBeNull();
    });

    test('should generate VietQR URL with amount', () => {
      const result = generateVietQRUrl({
        bankCode: 'BIDV',
        accountNumber: '9876543210',
        accountName: 'TRAN THI B',
        amount: 100000
      });

      expect(result.url).toContain('https://img.vietqr.io/image/BIDV-9876543210-compact.jpg');
      expect(result.url).toContain('amount=100000');
      expect(result.amount).toBe(100000);
    });

    test('should generate VietQR URL with description', () => {
      const result = generateVietQRUrl({
        bankCode: 'VTB',
        accountNumber: '1111222233',
        accountName: 'LE VAN C',
        description: 'Thanh toan don hang #123'
      });

      expect(result.url).toContain('https://img.vietqr.io/image/VTB-1111222233-compact.jpg');
      expect(result.url).toContain('addInfo=Thanh+toan+don+hang+%23123');
      expect(result.description).toBe('Thanh toan don hang #123');
    });

    test('should generate VietQR URL with all fields', () => {
      const result = generateVietQRUrl({
        bankCode: 'TCB',
        accountNumber: '5555666677',
        accountName: 'PHAM VAN D',
        amount: 250000,
        description: 'Payment for order #456',
        template: 'print'
      });

      expect(result.url).toContain('https://img.vietqr.io/image/TCB-5555666677-print.jpg');
      expect(result.url).toContain('amount=250000');
      expect(result.url).toContain('addInfo=Payment+for+order+%23456');
      expect(result.bankCode).toBe('TCB');
      expect(result.bankName).toBe('Techcombank');
      expect(result.template).toBe('print');
    });

    test('should support different templates', () => {
      const compact = generateVietQRUrl({
        bankCode: 'MB',
        accountNumber: '1234567890',
        accountName: 'TEST USER',
        template: 'compact'
      });
      expect(compact.url).toContain('compact.jpg');

      const print = generateVietQRUrl({
        bankCode: 'MB',
        accountNumber: '1234567890',
        accountName: 'TEST USER',
        template: 'print'
      });
      expect(print.url).toContain('print.jpg');

      const qrOnly = generateVietQRUrl({
        bankCode: 'MB',
        accountNumber: '1234567890',
        accountName: 'TEST USER',
        template: 'qr_only'
      });
      expect(qrOnly.url).toContain('qr_only.jpg');
    });

    test('should support e-wallets', () => {
      const momo = generateVietQRUrl({
        bankCode: 'MOMO',
        accountNumber: '0912345678',
        accountName: 'MOMO USER'
      });
      expect(momo.bankCode).toBe('MOMO');
      expect(momo.bankName).toBe('Momo');

      const zalopay = generateVietQRUrl({
        bankCode: 'ZALOPAY',
        accountNumber: '0987654321',
        accountName: 'ZALOPAY USER'
      });
      expect(zalopay.bankCode).toBe('ZALOPAY');
      expect(zalopay.bankName).toBe('ZaloPay');
    });
  });

  describe('getSupportedBanks', () => {
    test('should return all supported banks', () => {
      const banks = getSupportedBanks();

      expect(Array.isArray(banks)).toBe(true);
      expect(banks.length).toBeGreaterThan(20); // At least 20 banks

      // Check structure
      banks.forEach(bank => {
        expect(bank).toHaveProperty('code');
        expect(bank).toHaveProperty('name');
        expect(bank).toHaveProperty('bin');
      });
    });

    test('should include major Vietnamese banks', () => {
      const banks = getSupportedBanks();
      const codes = banks.map(b => b.code);

      // Big 4
      expect(codes).toContain('VCB');
      expect(codes).toContain('BIDV');
      expect(codes).toContain('VTB');
      expect(codes).toContain('ARB');

      // Top private banks
      expect(codes).toContain('TCB');
      expect(codes).toContain('MB');
      expect(codes).toContain('ACB');
      expect(codes).toContain('VPB');

      // E-wallets
      expect(codes).toContain('MOMO');
      expect(codes).toContain('ZALOPAY');
    });
  });

  describe('VIETNAM_BANKS constant', () => {
    test('should have Big 4 banks', () => {
      expect(VIETNAM_BANKS.VCB).toBeDefined();
      expect(VIETNAM_BANKS.BIDV).toBeDefined();
      expect(VIETNAM_BANKS.VTB).toBeDefined();
      expect(VIETNAM_BANKS.ARB).toBeDefined();
    });

    test('should have correct bank names', () => {
      expect(VIETNAM_BANKS.VCB.name).toBe('Vietcombank');
      expect(VIETNAM_BANKS.BIDV.name).toBe('BIDV');
      expect(VIETNAM_BANKS.VTB.name).toBe('VietinBank');
      expect(VIETNAM_BANKS.ARB.name).toBe('Agribank');
    });

    test('should have BIN codes', () => {
      expect(VIETNAM_BANKS.VCB.bin).toBe('970436');
      expect(VIETNAM_BANKS.BIDV.bin).toBe('970418');
      expect(VIETNAM_BANKS.VTB.bin).toBe('970415');
      expect(VIETNAM_BANKS.ARB.bin).toBe('970405');
    });
  });
});
