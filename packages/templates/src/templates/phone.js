/**
 * Phone Template
 * Generates tel: QR codes for direct calling
 */

export const phoneTemplate = {
  type: 'phone',
  name: 'Phone',
  icon: '📞',
  description: 'Call a phone number directly',
  
  fields: [
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: '+1 234 567 8900',
      validation: (value) => {
        // Remove all non-digit characters except +
        const cleaned = value.replace(/[^\d+]/g, '');
        return cleaned.length >= 10;
      }
    }
  ],

  generate: (data) => {
    const { phone } = data;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanedPhone = phone.replace(/[^\d+]/g, '');

    return `tel:${cleanedPhone}`;
  },

  example: {
    phone: '+39 123 456 7890'
  }
};

