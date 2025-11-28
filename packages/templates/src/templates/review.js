/**
 * Review Template
 * Generates QR codes for review links (Google, Yelp, etc)
 */

export const reviewTemplate = {
  type: 'review',
  name: 'Review',
  icon: '⭐',
  description: 'Link to leave a review on Google, Yelp, etc',
  
  fields: [
    {
      name: 'platform',
      label: 'Review Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'google', label: 'Google Reviews' },
        { value: 'yelp', label: 'Yelp' },
        { value: 'trustpilot', label: 'Trustpilot' },
        { value: 'tripadvisor', label: 'TripAdvisor' }
      ]
    },
    {
      name: 'businessId',
      label: 'Business ID / URL',
      type: 'text',
      required: true,
      placeholder: 'your-business-name',
      hint: 'For Google: Place ID. For others: business name or full review URL'
    }
  ],

  generate: (data) => {
    const { platform, businessId } = data;
    
    if (!platform || !businessId) {
      throw new Error('Platform and business ID are required');
    }

    if (platform === 'google') {
      // Google Review URL
      return `https://search.google.com/local/writereview?placeid=${businessId}`;
    }

    if (platform === 'yelp') {
      // Yelp Review URL
      return `https://www.yelp.com/biz/${businessId}`;
    }

    if (platform === 'trustpilot') {
      // Trustpilot Review URL
      return `https://www.trustpilot.com/evaluate/${businessId}`;
    }

    if (platform === 'tripadvisor') {
      // TripAdvisor Review URL
      return `https://www.tripadvisor.com/${businessId}`;
    }

    throw new Error('Invalid platform');
  },

  example: {
    platform: 'google',
    businessId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
  }
};

