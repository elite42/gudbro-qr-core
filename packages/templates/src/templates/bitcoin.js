/**
 * Bitcoin/Crypto Wallet Template
 * Generates QR codes for cryptocurrency wallet addresses
 */

export const bitcoinTemplate = {
  type: 'bitcoin',
  name: 'Crypto Wallet',
  icon: '₿',
  description: 'Bitcoin and cryptocurrency payment address',
  
  fields: [
    {
      name: 'crypto',
      label: 'Cryptocurrency',
      type: 'select',
      required: true,
      options: [
        { value: 'bitcoin', label: 'Bitcoin (BTC)' },
        { value: 'ethereum', label: 'Ethereum (ETH)' },
        { value: 'litecoin', label: 'Litecoin (LTC)' },
        { value: 'dogecoin', label: 'Dogecoin (DOGE)' },
        { value: 'usdt', label: 'Tether (USDT)' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'address',
      label: 'Wallet Address',
      type: 'text',
      required: true,
      placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      hint: 'Your cryptocurrency wallet address',
      validation: (value) => {
        return value.length > 20; // Basic validation
      }
    },
    {
      name: 'amount',
      label: 'Amount (optional)',
      type: 'number',
      required: false,
      placeholder: '0.001',
      step: '0.00000001',
      min: '0'
    },
    {
      name: 'label',
      label: 'Label (optional)',
      type: 'text',
      required: false,
      placeholder: 'Donation',
      maxLength: 100,
      hint: 'Description of the payment'
    }
  ],

  generate: (data) => {
    const { crypto, address, amount, label } = data;
    
    if (!crypto || !address) {
      throw new Error('Cryptocurrency type and wallet address are required');
    }

    // Bitcoin URI scheme: bitcoin:address?amount=0.001&label=Donation
    let uri = '';

    if (crypto === 'bitcoin') {
      uri = `bitcoin:${address}`;
    } else if (crypto === 'ethereum') {
      uri = `ethereum:${address}`;
    } else if (crypto === 'litecoin') {
      uri = `litecoin:${address}`;
    } else if (crypto === 'dogecoin') {
      uri = `dogecoin:${address}`;
    } else {
      // For other cryptos, just return the address
      return address;
    }

    const params = [];
    
    if (amount) {
      params.push(`amount=${amount}`);
    }
    
    if (label) {
      params.push(`label=${encodeURIComponent(label)}`);
    }

    if (params.length > 0) {
      uri += '?' + params.join('&');
    }

    return uri;
  },

  example: {
    crypto: 'bitcoin',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    amount: '0.001',
    label: 'Donation to GUDBRO'
  }
};

