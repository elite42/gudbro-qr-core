/**
 * Text Template
 * Generates QR codes for plain text (works offline)
 */

export const textTemplate = {
  type: 'text',
  name: 'Plain Text',
  icon: '📝',
  description: 'Display plain text (works without internet)',
  
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'textarea',
      required: true,
      placeholder: 'Enter your text here...',
      maxLength: 1000,
      hint: 'Maximum 1000 characters. This QR code works offline.',
      validation: (value) => {
        return value.length > 0 && value.length <= 1000;
      }
    }
  ],

  generate: (data) => {
    const { text } = data;
    
    if (!text || text.trim() === '') {
      throw new Error('Text is required');
    }

    if (text.length > 1000) {
      throw new Error('Text exceeds maximum length of 1000 characters');
    }

    // Plain text QR code - just return the text as-is
    // No URL encoding needed, QR code will encode it directly
    return text;
  },

  example: {
    text: 'Welcome to GUDBRO! Scan this QR code to get started.'
  }
};

