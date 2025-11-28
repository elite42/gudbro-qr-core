/**
 * Multi URL Template
 * Generates QR codes with conditional redirects (language, device, location, time)
 * Note: This requires backend logic to handle redirects
 */

export const multiurlTemplate = {
  type: 'multiurl',
  name: 'Multi URL (Advanced)',
  icon: '🔀',
  description: 'Different URLs based on device, language, or location',
  
  fields: [
    {
      name: 'defaultUrl',
      label: 'Default URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com',
      hint: 'Fallback URL if no condition matches',
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
      name: 'iosUrl',
      label: 'iOS URL (optional)',
      type: 'text',
      required: false,
      placeholder: 'https://apps.apple.com/...',
      hint: 'URL for iPhone/iPad users',
      validation: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'androidUrl',
      label: 'Android URL (optional)',
      type: 'text',
      required: false,
      placeholder: 'https://play.google.com/...',
      hint: 'URL for Android users',
      validation: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'redirectService',
      label: 'Redirect Service URL (optional)',
      type: 'text',
      required: false,
      placeholder: 'https://your-redirect-service.com/qr123',
      hint: 'If you have a custom redirect service that handles device detection',
      validation: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    }
  ],

  generate: (data) => {
    const { defaultUrl, iosUrl, androidUrl, redirectService } = data;
    
    if (!defaultUrl) {
      throw new Error('Default URL is required');
    }

    // Validate default URL
    try {
      new URL(defaultUrl);
    } catch {
      throw new Error('Invalid default URL');
    }

    // If custom redirect service is provided, use it
    if (redirectService) {
      try {
        new URL(redirectService);
        return redirectService;
      } catch {
        throw new Error('Invalid redirect service URL');
      }
    }

    // If only default URL is provided, return it
    if (!iosUrl && !androidUrl) {
      return defaultUrl;
    }

    // For multi-URL, we need a redirect service
    // Return a note that this requires backend implementation
    console.warn('Multi URL QR requires a redirect service. Using default URL.');
    return defaultUrl;
  },

  example: {
    defaultUrl: 'https://example.com',
    iosUrl: 'https://apps.apple.com/app/example',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.example',
    redirectService: ''
  },

  note: 'Multi URL QR codes require a backend redirect service to detect device type and redirect accordingly. Consider using services like Branch.io, Bitly, or implement your own redirect logic.'
};

