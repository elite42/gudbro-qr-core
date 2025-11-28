/**
 * URL Template
 * Generates QR codes for simple website links
 */

export const urlTemplate = {
  type: 'url',
  name: 'URL',
  icon: '🌐',
  description: 'Simple website link',
  
  fields: [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com',
      hint: 'Full URL including https://',
      validation: (value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      }
    }
  ],

  generate: (data) => {
    const { url } = data;
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Validate URL
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error('URL must start with http:// or https://');
      }
    } catch {
      throw new Error('Invalid URL format');
    }

    return url;
  },

  example: {
    url: 'https://gudbro.com'
  }
};

