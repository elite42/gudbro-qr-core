/**
 * Landing Page Template
 * Generates QR codes for custom landing pages
 */

export const landingpageTemplate = {
  type: 'landingpage',
  name: 'Landing Page',
  icon: '📄',
  description: 'Custom landing page for campaigns',
  
  fields: [
    {
      name: 'pageUrl',
      label: 'Landing Page URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/campaign',
      hint: 'URL to your landing page',
      validation: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'campaignName',
      label: 'Campaign Name (optional)',
      type: 'text',
      required: false,
      placeholder: 'Summer Sale 2025',
      maxLength: 100
    },
    {
      name: 'utmSource',
      label: 'UTM Source (optional)',
      type: 'text',
      required: false,
      placeholder: 'qrcode',
      maxLength: 50,
      hint: 'For tracking (e.g., "qrcode", "poster", "flyer")'
    },
    {
      name: 'utmMedium',
      label: 'UTM Medium (optional)',
      type: 'text',
      required: false,
      placeholder: 'offline',
      maxLength: 50
    },
    {
      name: 'utmCampaign',
      label: 'UTM Campaign (optional)',
      type: 'text',
      required: false,
      placeholder: 'summer_sale_2025',
      maxLength: 50
    }
  ],

  generate: (data) => {
    const { pageUrl, utmSource, utmMedium, utmCampaign } = data;
    
    if (!pageUrl) {
      throw new Error('Landing page URL is required');
    }

    // Validate URL
    let url;
    try {
      url = new URL(pageUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    // Add UTM parameters if provided
    const utmParams = [];
    
    if (utmSource) {
      utmParams.push(`utm_source=${encodeURIComponent(utmSource)}`);
    }
    
    if (utmMedium) {
      utmParams.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
    }
    
    if (utmCampaign) {
      utmParams.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
    }

    if (utmParams.length > 0) {
      const separator = url.search ? '&' : '?';
      return pageUrl + separator + utmParams.join('&');
    }

    return pageUrl;
  },

  example: {
    pageUrl: 'https://example.com/promo',
    campaignName: 'Black Friday 2025',
    utmSource: 'qrcode',
    utmMedium: 'offline',
    utmCampaign: 'blackfriday_2025'
  }
};

