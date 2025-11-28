/**
 * Email Template
 * Generates mailto: QR codes
 */

export const emailTemplate = {
  type: 'email',
  name: 'Email',
  icon: '📧',
  description: 'Send an email with pre-filled subject and body',
  
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'contact@example.com',
      validation: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      }
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      required: false,
      placeholder: 'Hello!',
      maxLength: 200
    },
    {
      name: 'body',
      label: 'Message Body',
      type: 'textarea',
      required: false,
      placeholder: 'Your message here...',
      maxLength: 1000
    }
  ],

  generate: (data) => {
    const { email, subject, body } = data;
    
    if (!email) {
      throw new Error('Email address is required');
    }

    let mailto = `mailto:${email}`;
    const params = [];

    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }

    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }

    if (params.length > 0) {
      mailto += `?${params.join('&')}`;
    }

    return mailto;
  },

  example: {
    email: 'hello@gudbro.com',
    subject: 'Contact from QR Code',
    body: 'Hi! I scanned your QR code and would like to get in touch.'
  }
};

