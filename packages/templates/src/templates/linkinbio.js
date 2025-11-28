/**
 * Link in Bio Template
 * Generates QR codes for social media link aggregator (Linktree-style)
 */

export const linkinbioTemplate = {
  type: 'linkinbio',
  name: 'Link in Bio',
  icon: '🔗',
  description: 'All your links in one place (Linktree-style)',
  
  fields: [
    {
      name: 'pageUrl',
      label: 'Link in Bio Page URL',
      type: 'text',
      required: true,
      placeholder: 'https://linktr.ee/yourname or custom URL',
      hint: 'Your Linktree, Beacons, or custom link-in-bio page URL',
      validation: (value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      }
    },
    {
      name: 'username',
      label: 'Username (optional)',
      type: 'text',
      required: false,
      placeholder: '@yourhandle',
      maxLength: 50
    }
  ],

  generate: (data) => {
    const { pageUrl } = data;
    
    if (!pageUrl) {
      throw new Error('Link in Bio page URL is required');
    }

    // Validate URL
    try {
      new URL(pageUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    return pageUrl;
  },

  example: {
    pageUrl: 'https://linktr.ee/gudbro',
    username: '@gudbro'
  }
};

