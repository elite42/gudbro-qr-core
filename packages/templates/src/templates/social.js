/**
 * Social Media Template
 * Generates QR codes for social media profiles
 */

export const socialTemplate = {
  type: 'social',
  name: 'Social Media',
  icon: '👥',
  description: 'Link to your social media profile',
  
  fields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'twitter', label: 'Twitter (X)' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'snapchat', label: 'Snapchat' },
        { value: 'pinterest', label: 'Pinterest' }
      ]
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
      placeholder: '@yourhandle',
      validation: (value) => {
        return value.length > 0 && value.length <= 100;
      }
    }
  ],

  generate: (data) => {
    const { platform, username } = data;
    
    if (!platform || !username) {
      throw new Error('Platform and username are required');
    }

    // Remove @ if present
    const cleanUsername = username.replace('@', '');

    const platformUrls = {
      instagram: `https://instagram.com/${cleanUsername}`,
      facebook: `https://facebook.com/${cleanUsername}`,
      twitter: `https://twitter.com/${cleanUsername}`,
      linkedin: `https://linkedin.com/in/${cleanUsername}`,
      tiktok: `https://tiktok.com/@${cleanUsername}`,
      youtube: `https://youtube.com/@${cleanUsername}`,
      snapchat: `https://snapchat.com/add/${cleanUsername}`,
      pinterest: `https://pinterest.com/${cleanUsername}`
    };

    const url = platformUrls[platform];

    if (!url) {
      throw new Error('Invalid platform');
    }

    return url;
  },

  example: {
    platform: 'instagram',
    username: '@gudbro'
  }
};

