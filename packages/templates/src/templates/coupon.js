/**
 * Coupon Template
 * Generates QR codes for discount coupons and offers
 */

export const couponTemplate = {
  type: 'coupon',
  name: 'Coupon/Discount',
  icon: '🎟️',
  description: 'Discount code and special offers',
  
  fields: [
    {
      name: 'couponCode',
      label: 'Coupon Code',
      type: 'text',
      required: true,
      placeholder: 'SAVE20',
      maxLength: 50,
      hint: 'The discount code customers will use',
      validation: (value) => {
        return value.length > 0 && value.length <= 50;
      }
    },
    {
      name: 'discount',
      label: 'Discount',
      type: 'text',
      required: true,
      placeholder: '20% OFF',
      maxLength: 50,
      hint: 'e.g., "20% OFF", "€10 discount", "Buy 1 Get 1 Free"'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Valid on all products. Minimum purchase €50.',
      maxLength: 200
    },
    {
      name: 'expiryDate',
      label: 'Expiry Date (optional)',
      type: 'text',
      required: false,
      placeholder: '31/12/2025',
      maxLength: 20
    },
    {
      name: 'redeemUrl',
      label: 'Redeem URL (optional)',
      type: 'text',
      required: false,
      placeholder: 'https://example.com/redeem',
      hint: 'Link to redemption page (optional)',
      validation: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    }
  ],

  generate: (data) => {
    const { couponCode, discount, description, expiryDate, redeemUrl } = data;
    
    if (!couponCode || !discount) {
      throw new Error('Coupon code and discount are required');
    }

    // If redeem URL is provided, use it
    if (redeemUrl) {
      try {
        new URL(redeemUrl);
        return redeemUrl;
      } catch {
        throw new Error('Invalid redeem URL');
      }
    }

    // Otherwise, generate a text-based coupon
    let couponText = `COUPON: ${couponCode}\n`;
    couponText += `DISCOUNT: ${discount}\n`;
    
    if (description) {
      couponText += `\n${description}\n`;
    }
    
    if (expiryDate) {
      couponText += `\nExpires: ${expiryDate}`;
    }

    return couponText;
  },

  example: {
    couponCode: 'WELCOME20',
    discount: '20% OFF',
    description: 'Valid on first purchase. Minimum order €30.',
    expiryDate: '31/12/2025',
    redeemUrl: 'https://example.com/promo/welcome20'
  }
};

