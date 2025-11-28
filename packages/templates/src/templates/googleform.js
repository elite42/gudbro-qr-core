/**
 * Google Form Template
 * Generates QR codes for Google Forms
 */

export const googleformTemplate = {
  type: 'googleform',
  name: 'Google Form',
  icon: '📋',
  description: 'Link to Google Form for surveys and feedback',
  
  fields: [
    {
      name: 'formUrl',
      label: 'Google Form URL',
      type: 'text',
      required: true,
      placeholder: 'https://forms.gle/xxxxx or https://docs.google.com/forms/...',
      hint: 'Paste your Google Form link here',
      validation: (value) => {
        try {
          const url = new URL(value);
          return (url.hostname === 'forms.gle' || 
                  url.hostname === 'docs.google.com' ||
                  url.protocol === 'http:' || 
                  url.protocol === 'https:');
        } catch {
          return false;
        }
      }
    },
    {
      name: 'title',
      label: 'Form Title (optional)',
      type: 'text',
      required: false,
      placeholder: 'Customer Feedback Survey',
      maxLength: 100
    }
  ],

  generate: (data) => {
    const { formUrl } = data;
    
    if (!formUrl) {
      throw new Error('Google Form URL is required');
    }

    // Validate URL
    try {
      new URL(formUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    return formUrl;
  },

  example: {
    formUrl: 'https://forms.gle/ABC123xyz',
    title: 'Event Registration Form'
  }
};

