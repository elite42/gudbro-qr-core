/**
 * Coupon QR Code Generator
 * Digital coupons, vouchers, and promotional codes
 *
 * Use Cases:
 * - Restaurant discounts
 * - Limited-time offers
 * - Loyalty rewards
 * - Promotional campaigns
 * - Special event vouchers
 */

/**
 * Validate coupon code
 */
const validateCouponCode = (code) => {
  if (!code) {
    throw new Error('Coupon code is required');
  }

  const trimmed = String(code).trim().toUpperCase();

  if (trimmed.length < 3) {
    throw new Error('Coupon code must be at least 3 characters');
  }

  if (trimmed.length > 50) {
    throw new Error('Coupon code must not exceed 50 characters');
  }

  // Allow alphanumeric and some special characters
  if (!/^[A-Z0-9\-_]+$/.test(trimmed)) {
    throw new Error('Coupon code can only contain letters, numbers, hyphens, and underscores');
  }

  return trimmed;
};

/**
 * Validate coupon title
 */
const validateCouponTitle = (title) => {
  if (!title) {
    throw new Error('Coupon title is required');
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('Coupon title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Coupon title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate description
 */
const validateDescription = (description) => {
  if (!description) {
    return null;
  }

  const trimmed = String(description).trim();

  if (trimmed.length > 1000) {
    throw new Error('Description must not exceed 1000 characters');
  }

  return trimmed;
};

/**
 * Validate discount type and value
 */
const validateDiscount = (discountType, discountValue) => {
  const validTypes = ['percentage', 'fixed', 'bogo', 'free-item', 'free-shipping'];

  if (discountType) {
    const type = String(discountType).toLowerCase();
    if (!validTypes.includes(type)) {
      throw new Error(`Discount type must be one of: ${validTypes.join(', ')}`);
    }

    // Validate value based on type
    if (discountValue !== undefined && discountValue !== null) {
      const value = parseFloat(discountValue);

      if (type === 'percentage') {
        if (value <= 0 || value > 100) {
          throw new Error('Percentage discount must be between 0 and 100');
        }
      } else if (type === 'fixed') {
        if (value <= 0) {
          throw new Error('Fixed discount must be greater than 0');
        }
      }

      return { type, value };
    }

    return { type, value: null };
  }

  return null;
};

/**
 * Validate date
 */
const validateDate = (date, fieldName) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return parsedDate.toISOString();
};

/**
 * Validate minimum purchase
 */
const validateMinimumPurchase = (amount) => {
  if (amount === undefined || amount === null) {
    return null;
  }

  const parsed = parseFloat(amount);
  if (parsed < 0) {
    throw new Error('Minimum purchase amount cannot be negative');
  }

  return parsed;
};

/**
 * Validate max uses
 */
const validateMaxUses = (uses) => {
  if (uses === undefined || uses === null) {
    return null;
  }

  const parsed = parseInt(uses);
  if (parsed < 1) {
    throw new Error('Max uses must be at least 1');
  }

  if (parsed > 1000000) {
    throw new Error('Max uses cannot exceed 1,000,000');
  }

  return parsed;
};

/**
 * Validate terms and conditions
 */
const validateTerms = (terms) => {
  if (!terms) {
    return null;
  }

  if (Array.isArray(terms)) {
    return terms
      .map(term => String(term).trim())
      .filter(term => term.length > 0 && term.length <= 500);
  }

  const trimmed = String(terms).trim();
  if (trimmed.length > 2000) {
    throw new Error('Terms and conditions must not exceed 2000 characters');
  }

  return trimmed;
};

/**
 * Generate Coupon QR data
 *
 * @param {Object} options
 * @param {string} options.couponCode - Unique coupon code (required)
 * @param {string} options.title - Coupon title (required)
 * @param {string} [options.description] - Coupon description
 * @param {string} [options.discountType] - Type: percentage, fixed, bogo, free-item, free-shipping
 * @param {number} [options.discountValue] - Discount value (depends on type)
 * @param {string} [options.currency] - Currency code (for fixed discounts)
 * @param {string} [options.validFrom] - Start date (ISO format)
 * @param {string} [options.validUntil] - Expiry date (ISO format)
 * @param {number} [options.minimumPurchase] - Minimum purchase amount
 * @param {number} [options.maxUses] - Maximum number of uses
 * @param {string|Array} [options.terms] - Terms and conditions
 * @param {string} [options.redemptionUrl] - URL for redemption
 * @param {string} [options.businessName] - Business name
 * @returns {Object} Coupon QR data
 */
const generateCouponQRData = ({
  couponCode,
  title,
  description,
  discountType,
  discountValue,
  currency = 'VND',
  validFrom,
  validUntil,
  minimumPurchase,
  maxUses,
  terms,
  redemptionUrl,
  businessName
}) => {
  // Validate required fields
  const validatedCode = validateCouponCode(couponCode);
  const validatedTitle = validateCouponTitle(title);

  // Validate optional fields
  const validatedDescription = validateDescription(description);
  const validatedDiscount = validateDiscount(discountType, discountValue);
  const validatedValidFrom = validateDate(validFrom, 'valid from date');
  const validatedValidUntil = validateDate(validUntil, 'valid until date');
  const validatedMinPurchase = validateMinimumPurchase(minimumPurchase);
  const validatedMaxUses = validateMaxUses(maxUses);
  const validatedTerms = validateTerms(terms);

  // Validate date logic
  if (validatedValidFrom && validatedValidUntil) {
    if (new Date(validatedValidFrom) > new Date(validatedValidUntil)) {
      throw new Error('Valid from date must be before valid until date');
    }
  }

  // Check if coupon is currently valid
  const now = new Date();
  let isCurrentlyValid = true;
  if (validatedValidFrom && new Date(validatedValidFrom) > now) {
    isCurrentlyValid = false;
  }
  if (validatedValidUntil && new Date(validatedValidUntil) < now) {
    isCurrentlyValid = false;
  }

  // Build coupon data
  const couponData = {
    code: validatedCode,
    title: validatedTitle,
    description: validatedDescription,
    businessName: businessName ? String(businessName).trim() : null
  };

  if (validatedDiscount) {
    couponData.discount = {
      type: validatedDiscount.type,
      value: validatedDiscount.value,
      currency: validatedDiscount.type === 'fixed' ? currency : null
    };
  }

  if (validatedValidFrom || validatedValidUntil) {
    couponData.validity = {
      from: validatedValidFrom,
      until: validatedValidUntil,
      isCurrentlyValid
    };
  }

  if (validatedMinPurchase !== null) {
    couponData.minimumPurchase = {
      amount: validatedMinPurchase,
      currency
    };
  }

  if (validatedMaxUses !== null) {
    couponData.maxUses = validatedMaxUses;
  }

  if (validatedTerms) {
    couponData.terms = validatedTerms;
  }

  // Determine destination URL
  const destinationUrl = redemptionUrl || `#coupon-${validatedCode}`;

  return {
    url: destinationUrl,
    coupon: couponData,
    implementationPhase: 'basic-coupon',
    note: redemptionUrl
      ? 'Using custom redemption URL'
      : 'No redemption URL provided - requires custom landing page or POS integration'
  };
};

/**
 * Get Coupon QR platform info
 */
const getCouponQRPlatformInfo = () => {
  return {
    name: 'Coupon QR Code',
    description: 'Digital coupons, vouchers, and promotional codes for discounts and special offers',
    fields: {
      required: ['couponCode', 'title'],
      recommended: ['description', 'discountType', 'discountValue', 'validUntil'],
      optional: [
        'validFrom',
        'minimumPurchase',
        'maxUses',
        'terms',
        'redemptionUrl',
        'businessName',
        'currency'
      ]
    },
    discountTypes: {
      percentage: {
        name: 'Percentage Discount',
        description: 'Discount as percentage of total (e.g., 20% off)',
        valueRange: '0-100'
      },
      fixed: {
        name: 'Fixed Amount Discount',
        description: 'Fixed amount off (e.g., $10 off)',
        valueRange: '> 0',
        requiresCurrency: true
      },
      bogo: {
        name: 'Buy One Get One',
        description: 'Buy one get one free or at discount',
        valueRange: 'Optional (e.g., 50 for BOGO 50% off)'
      },
      'free-item': {
        name: 'Free Item',
        description: 'Free specific item with purchase',
        valueRange: 'Not required'
      },
      'free-shipping': {
        name: 'Free Shipping/Delivery',
        description: 'Free delivery with order',
        valueRange: 'Not required'
      }
    },
    useCases: [
      'Restaurant meal discounts',
      'Happy hour promotions',
      'First-time customer offers',
      'Loyalty rewards',
      'Holiday special offers',
      'Birthday discounts',
      'Referral rewards',
      'Seasonal promotions',
      'Event-specific vouchers',
      'Free appetizer/dessert coupons'
    ],
    restaurantExamples: [
      {
        title: 'Happy Hour 20% Off',
        code: 'HAPPY20',
        discountType: 'percentage',
        discountValue: 20,
        validFrom: '2024-01-01T17:00:00Z',
        validUntil: '2024-12-31T19:00:00Z',
        minimumPurchase: 50000,
        terms: ['Valid Mon-Fri 5pm-7pm', 'Cannot combine with other offers']
      },
      {
        title: 'Free Spring Roll',
        code: 'FREEROLL',
        discountType: 'free-item',
        validUntil: '2024-12-31T23:59:59Z',
        minimumPurchase: 100000,
        terms: ['One per customer', 'Dine-in only']
      },
      {
        title: '100K Off Total Bill',
        code: 'SAVE100K',
        discountType: 'fixed',
        discountValue: 100000,
        currency: 'VND',
        validUntil: '2024-12-31T23:59:59Z',
        minimumPurchase: 500000,
        maxUses: 100
      }
    ],
    implementation: {
      current: 'Phase 1 - Coupon Data Structure',
      currentDescription: 'Provides structured coupon data. Requires manual redemption or POS integration.',
      future: 'Phase 2 - Automated Redemption',
      futureFeatures: [
        'Auto-generated unique codes',
        'Real-time validation',
        'Usage tracking and analytics',
        'Automatic POS integration',
        'One-time use enforcement',
        'Redemption history',
        'Bulk coupon generation',
        'A/B testing for offers',
        'Geo-fencing (location-based)',
        'Time-based auto-activation',
        'Customer-specific coupons'
      ]
    },
    bestPractices: [
      'Use clear, memorable coupon codes',
      'Set realistic expiry dates',
      'Clearly state terms and conditions',
      'Include minimum purchase if applicable',
      'Test redemption process',
      'Make discount value prominent',
      'Use urgency (limited time/quantity)',
      'Track redemption rates',
      'Train staff on coupon redemption',
      'Consider anti-fraud measures for high-value coupons',
      'Display business name for clarity'
    ],
    redemptionMethods: {
      manual: 'Staff manually applies discount at POS',
      integrated: 'QR scans directly into POS system',
      online: 'Customer enters code on website/app',
      hybrid: 'Combination of manual and automated'
    }
  };
};

module.exports = {
  validateCouponCode,
  validateCouponTitle,
  validateDescription,
  validateDiscount,
  validateDate,
  validateMinimumPurchase,
  validateMaxUses,
  validateTerms,
  generateCouponQRData,
  getCouponQRPlatformInfo
};
