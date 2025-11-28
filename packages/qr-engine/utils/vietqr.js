/**
 * VietQR Payment QR Code Generator
 * Vietnam National Payment Standard (NAPAS)
 *
 * Market: Vietnam
 * Users: All Vietnamese banks, 100M+ users
 * Competitive Advantage: NO competitor supports this
 */

// Vietnamese Banks (Major + Popular)
const VIETNAM_BANKS = {
  // Big 4
  VCB: { name: 'Vietcombank', bin: '970436' },
  BIDV: { name: 'BIDV', bin: '970418' },
  VTB: { name: 'VietinBank', bin: '970415' },
  ARB: { name: 'Agribank', bin: '970405' },

  // Top Private Banks
  TCB: { name: 'Techcombank', bin: '970407' },
  MB: { name: 'MB Bank', bin: '970422' },
  ACB: { name: 'ACB', bin: '970416' },
  VPB: { name: 'VPBank', bin: '970432' },
  SHB: { name: 'SHB', bin: '970443' },
  SCB: { name: 'SCB', bin: '970429' },

  // Other Popular Banks
  TPB: { name: 'TPBank', bin: '970423' },
  MSB: { name: 'Maritime Bank', bin: '970426' },
  STB: { name: 'Sacombank', bin: '970403' },
  EIB: { name: 'Eximbank', bin: '970431' },
  OCB: { name: 'OCB', bin: '970448' },
  NAB: { name: 'Nam A Bank', bin: '970428' },
  VAB: { name: 'VietABank', bin: '970427' },
  ABB: { name: 'ABBANK', bin: '970425' },
  BAB: { name: 'BacABank', bin: '970409' },
  LPB: { name: 'LienVietPostBank', bin: '970449' },

  // E-Wallets (VietQR compatible)
  MOMO: { name: 'Momo', bin: 'MOMO' },
  VNPAY: { name: 'VNPay', bin: 'VNPAY' },
  ZALOPAY: { name: 'ZaloPay', bin: 'ZALOPAY' }
};

/**
 * Validate bank code
 */
const validateBankCode = (bankCode) => {
  if (!bankCode) {
    throw new Error('Bank code is required');
  }

  const upperCode = bankCode.toUpperCase();
  if (!VIETNAM_BANKS[upperCode]) {
    const validCodes = Object.keys(VIETNAM_BANKS).join(', ');
    throw new Error(`Invalid bank code. Valid codes: ${validCodes}`);
  }

  return upperCode;
};

/**
 * Validate account number
 */
const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    throw new Error('Account number is required');
  }

  // Remove spaces and dashes
  const cleaned = String(accountNumber).replace(/[\s-]/g, '');

  // Must be 6-20 digits
  if (!/^\d{6,20}$/.test(cleaned)) {
    throw new Error('Account number must be 6-20 digits');
  }

  return cleaned;
};

/**
 * Validate account name
 */
const validateAccountName = (accountName) => {
  if (!accountName) {
    throw new Error('Account name is required');
  }

  const trimmed = accountName.trim();

  if (trimmed.length < 2) {
    throw new Error('Account name must be at least 2 characters');
  }

  if (trimmed.length > 50) {
    throw new Error('Account name must not exceed 50 characters');
  }

  return trimmed;
};

/**
 * Validate amount (optional)
 */
const validateAmount = (amount) => {
  if (amount === undefined || amount === null || amount === '') {
    return null;
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    throw new Error('Amount must be a valid number');
  }

  if (numAmount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (numAmount > 500000000) {
    throw new Error('Amount must not exceed 500,000,000 VND');
  }

  return numAmount;
};

/**
 * Validate description (optional)
 */
const validateDescription = (description) => {
  if (!description) {
    return null;
  }

  const trimmed = String(description).trim();

  if (trimmed.length > 255) {
    throw new Error('Description must not exceed 255 characters');
  }

  return trimmed;
};

/**
 * Generate VietQR URL using VietQR.io API
 *
 * @param {Object} options
 * @param {string} options.bankCode - Bank code (e.g., 'VCB', 'BIDV')
 * @param {string} options.accountNumber - Bank account number
 * @param {string} options.accountName - Account holder name
 * @param {number} [options.amount] - Payment amount in VND (optional)
 * @param {string} [options.description] - Payment description (optional)
 * @param {string} [options.template='compact'] - QR template (compact, print, qr_only)
 * @returns {Object} VietQR data
 */
const generateVietQRUrl = ({
  bankCode,
  accountNumber,
  accountName,
  amount,
  description,
  template = 'compact'
}) => {
  // Validate inputs
  const validatedBankCode = validateBankCode(bankCode);
  const validatedAccountNumber = validateAccountNumber(accountNumber);
  const validatedAccountName = validateAccountName(accountName);
  const validatedAmount = validateAmount(amount);
  const validatedDescription = validateDescription(description);

  // Get bank info
  const bankInfo = VIETNAM_BANKS[validatedBankCode];

  // Build VietQR.io URL
  // Format: https://img.vietqr.io/image/[BANK_CODE]-[ACCOUNT_NUMBER]-[TEMPLATE].jpg
  const baseUrl = `https://img.vietqr.io/image/${validatedBankCode}-${validatedAccountNumber}-${template}.jpg`;

  // Build query parameters
  const params = new URLSearchParams();
  params.append('accountName', validatedAccountName);

  if (validatedAmount !== null) {
    params.append('amount', validatedAmount);
  }

  if (validatedDescription) {
    params.append('addInfo', validatedDescription);
  }

  const vietqrUrl = `${baseUrl}?${params.toString()}`;

  return {
    url: vietqrUrl,
    bankCode: validatedBankCode,
    bankName: bankInfo.name,
    bankBin: bankInfo.bin,
    accountNumber: validatedAccountNumber,
    accountName: validatedAccountName,
    amount: validatedAmount,
    description: validatedDescription,
    template
  };
};

/**
 * Format amount for display (Vietnamese format)
 */
const formatAmount = (amount) => {
  if (!amount) return null;

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Get all supported banks
 */
const getSupportedBanks = () => {
  return Object.entries(VIETNAM_BANKS).map(([code, info]) => ({
    code,
    name: info.name,
    bin: info.bin
  }));
};

module.exports = {
  VIETNAM_BANKS,
  validateBankCode,
  validateAccountNumber,
  validateAccountName,
  validateAmount,
  validateDescription,
  generateVietQRUrl,
  formatAmount,
  getSupportedBanks
};
