/**
 * App Store Template
 * Generates QR codes for app download links
 */

export const appstoreTemplate = {
  type: 'appstore',
  name: 'App Download',
  icon: '📱',
  description: 'Link to app on App Store or Play Store',
  
  fields: [
    {
      name: 'store',
      label: 'Store',
      type: 'select',
      required: true,
      options: [
        { value: 'ios', label: 'Apple App Store' },
        { value: 'android', label: 'Google Play Store' }
      ]
    },
    {
      name: 'appId',
      label: 'App ID',
      type: 'text',
      required: true,
      placeholder: 'com.example.app',
      hint: 'For iOS: app ID (e.g., 123456789). For Android: package name (e.g., com.example.app)'
    }
  ],

  generate: (data) => {
    const { store, appId } = data;
    
    if (!store || !appId) {
      throw new Error('Store and app ID are required');
    }

    if (store === 'ios') {
      // iOS App Store URL
      return `https://apps.apple.com/app/id${appId}`;
    }

    if (store === 'android') {
      // Google Play Store URL
      return `https://play.google.com/store/apps/details?id=${appId}`;
    }

    throw new Error('Invalid store');
  },

  example: {
    store: 'android',
    appId: 'com.whatsapp'
  }
};

