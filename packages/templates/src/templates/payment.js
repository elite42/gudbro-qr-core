/**
 * Payment Template
 * Generates QR codes for payment links
 */

export const paymentTemplate = {
  type: 'payment',
  name: 'Payment',
  icon: '💳',
  description: 'Link to payment page (PayPal, Stripe, etc)',
  
  fields: [
    {
      name: 'provider',
      label: 'Payment Provider',
      type: 'select',
      required: true,
      options: [
        { value: 'paypal', label: 'PayPal' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'custom', label: 'Custom Payment Link' }
      ]
    },
    {
      name: 'paymentId',
      label: 'Payment ID / Email / URL',
      type: 'text',
      required: true,
      placeholder: 'your@email.com',
      hint: 'For PayPal: your PayPal email. For Stripe: payment link. For custom: full URL'
    },
    {
      name: 'amount',
      label: 'Amount (optional)',
      type: 'number',
      required: false,
      placeholder: '10.00',
      step: '0.01',
      min: '0'
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: false,
      options: [
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'GBP', label: 'GBP (£)' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: false,
      placeholder: 'Payment for...',
      maxLength: 200
    }
  ],

  generate: (data) => {
    const { provider, paymentId, amount, currency = 'EUR', description } = data;
    
    if (!provider || !paymentId) {
      throw new Error('Provider and payment ID are required');
    }

    if (provider === 'paypal') {
      let paypalUrl = `https://www.paypal.com/paypalme/${paymentId}`;
      
      if (amount) {
        paypalUrl += `/${amount}${currency}`;
      }

      return paypalUrl;
    }

    if (provider === 'stripe' || provider === 'custom') {
      // Validate URL
      try {
        new URL(paymentId);
        return paymentId;
      } catch {
        throw new Error('Invalid payment URL');
      }
    }

    throw new Error('Invalid provider');
  },

  example: {
    provider: 'paypal',
    paymentId: 'yourpaypalme',
    amount: '10.00',
    currency: 'EUR',
    description: 'Product purchase'
  }
};

