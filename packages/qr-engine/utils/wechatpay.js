/**
 * WeChat Pay QR Code Generator
 * Chinese Payment Platform for Tourist Payments
 *
 * Market: China + Chinese tourists globally
 * Users: 1+ billion WeChat users
 * Competitive Advantage: Critical for Chinese tourist market
 *
 * Implementation: Phase 1 (Static Merchant QR)
 * - Customers scan and enter amount manually in WeChat app
 * - Does not require full WeChat Pay API integration
 * - Suitable for small/medium businesses accepting Chinese tourists
 */

/**
 * Supported currencies
 */
const SUPPORTED_CURRENCIES = ['CNY', 'VND'];

/**
 * Default currency
 */
const DEFAULT_CURRENCY = 'CNY';

/**
 * Max amount limits by currency
 */
const MAX_AMOUNTS = {
  CNY: 1000000,    // 1 million CNY (~$140,000)
  VND: 5000000000  // 5 billion VND (~$200,000)
};

/**
 * Validate WeChat Pay merchant ID
 * Format: 10 digits
 */
const validateMerchantId = (merchantId) => {
  if (!merchantId) {
    throw new Error('Merchant ID is required');
  }

  const cleaned = String(merchantId).replace(/[\s-]/g, '');

  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error('WeChat Pay merchant ID must be exactly 10 digits');
  }

  return cleaned;
};

/**
 * Validate currency
 */
const validateCurrency = (currency) => {
  if (!currency) {
    return DEFAULT_CURRENCY;
  }

  const upperCurrency = currency.toUpperCase();

  if (!SUPPORTED_CURRENCIES.includes(upperCurrency)) {
    throw new Error(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }

  return upperCurrency;
};

/**
 * Validate amount (optional)
 */
const validateAmount = (amount, currency = DEFAULT_CURRENCY) => {
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

  const maxAmount = MAX_AMOUNTS[currency];
  if (numAmount > maxAmount) {
    const formattedMax = new Intl.NumberFormat().format(maxAmount);
    throw new Error(`Amount must not exceed ${formattedMax} ${currency}`);
  }

  // Round to 2 decimal places
  return Math.round(numAmount * 100) / 100;
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
 * Validate order ID (optional)
 */
const validateOrderId = (orderId) => {
  if (!orderId) {
    return null;
  }

  const trimmed = String(orderId).trim();

  if (trimmed.length < 1 || trimmed.length > 32) {
    throw new Error('Order ID must be 1-32 characters');
  }

  // Only alphanumeric and common symbols
  if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
    throw new Error('Order ID can only contain alphanumeric characters, underscores, and dashes');
  }

  return trimmed;
};

/**
 * Generate WeChat Pay QR code data
 *
 * Phase 1 Implementation: Static Merchant QR
 * - Generates a static merchant collection QR code
 * - Customer scans and enters amount manually in WeChat app
 * - Suitable for small businesses without full API integration
 *
 * @param {Object} options
 * @param {string} options.merchantId - WeChat Pay merchant ID (10 digits)
 * @param {number} [options.amount] - Amount (optional, for display only in Phase 1)
 * @param {string} [options.currency='CNY'] - Currency: CNY or VND
 * @param {string} [options.description] - Payment description (optional)
 * @param {string} [options.orderId] - Merchant order ID (optional)
 * @returns {Object} WeChat Pay QR data
 */
const generateWeChatPayUrl = ({
  merchantId,
  amount,
  currency = DEFAULT_CURRENCY,
  description,
  orderId
}) => {
  // Validate inputs
  const validatedMerchantId = validateMerchantId(merchantId);
  const validatedCurrency = validateCurrency(currency);
  const validatedAmount = validateAmount(amount, validatedCurrency);
  const validatedDescription = validateDescription(description);
  const validatedOrderId = validateOrderId(orderId);

  // Phase 1: Static Merchant QR Code
  // Format: weixin://wxpay/bizpayurl?pr=[CODE] or simplified version
  // Note: This is a simplified static QR. Full dynamic QR requires API integration.

  // For static merchant QR, we use a simplified format
  // Real merchants would get this URL from WeChat Pay merchant backend
  const wechatPayUrl = `weixin://wxpay/bizpayurl?mchid=${validatedMerchantId}`;

  return {
    url: wechatPayUrl,
    merchantId: validatedMerchantId,
    amount: validatedAmount,
    currency: validatedCurrency,
    description: validatedDescription,
    orderId: validatedOrderId,
    implementationPhase: 'static',
    note: 'Static merchant QR - customer enters amount in WeChat app'
  };
};

/**
 * Format amount for display
 */
const formatAmount = (amount, currency = DEFAULT_CURRENCY) => {
  if (!amount) return null;

  if (currency === 'CNY') {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  }

  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  return `${currency} ${amount}`;
};

/**
 * Get WeChat Pay platform info
 */
const getWeChatPayPlatformInfo = () => {
  return {
    name: 'WeChat Pay',
    country: 'China',
    users: '1B+',
    market: 'Primary payment method for Chinese tourists',
    implementationPhase: 'Phase 1 (Static Merchant QR)',
    supportedCurrencies: SUPPORTED_CURRENCIES,
    usageNotes: [
      'Phase 1: Static merchant QR code',
      'Customers scan and enter amount manually',
      'Requires WeChat Pay merchant account',
      'Ideal for Chinese tourist payments',
      'Full API integration (Phase 2) requires additional setup'
    ],
    merchantSetup: [
      '1. Register for WeChat Pay merchant account',
      '2. Complete business verification',
      '3. Obtain 10-digit merchant ID',
      '4. Generate QR codes for your business',
      '5. Display QR at checkout/payment locations'
    ]
  };
};

/**
 * Get currency conversion rate (placeholder)
 * In production, this should call a real exchange rate API
 */
const getCurrencyConversionRate = (fromCurrency, toCurrency) => {
  // Placeholder conversion rates (as of 2024)
  const rates = {
    'CNY-VND': 3500,    // 1 CNY ≈ 3,500 VND
    'VND-CNY': 0.00029  // 1 VND ≈ 0.00029 CNY
  };

  const key = `${fromCurrency}-${toCurrency}`;
  return rates[key] || 1;
};

/**
 * Convert amount between currencies
 */
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    // Round to 2 decimal places even for same currency
    return Math.round(amount * 100) / 100;
  }

  const rate = getCurrencyConversionRate(fromCurrency, toCurrency);
  return Math.round(amount * rate * 100) / 100;
};

module.exports = {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  MAX_AMOUNTS,
  validateMerchantId,
  validateCurrency,
  validateAmount,
  validateDescription,
  validateOrderId,
  generateWeChatPayUrl,
  formatAmount,
  getWeChatPayPlatformInfo,
  getCurrencyConversionRate,
  convertCurrency
};
