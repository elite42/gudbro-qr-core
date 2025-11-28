/**
 * SMS Template
 * Generates QR codes for sending pre-filled SMS messages
 */

export const smsTemplate = {
  type: 'sms',
  name: 'SMS',
  icon: '💬',
  description: 'Send a pre-filled SMS message',
  
  fields: [
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: '+39 123 456 7890',
      hint: 'Include country code (e.g., +39 for Italy)'
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: false,
      placeholder: 'Hello! I would like to...',
      maxLength: 160,
      hint: 'Pre-filled message text (max 160 characters)'
    }
  ],

  generate: (data) => {
    const { phoneNumber, message = '' } = data;
    
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // SMS QR code format: SMSTO:number:message
    // Some devices also support: sms:number?body=message
    const smsString = `SMSTO:${cleanNumber}:${message}`;
    
    return smsString;
  },

  example: {
    phoneNumber: '+39 123 456 7890',
    message: 'Hello! I scanned your QR code.'
  }
};

