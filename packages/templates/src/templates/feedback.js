/**
 * Feedback Template
 * Generates QR codes for feedback forms and ratings
 */

export const feedbackTemplate = {
  type: 'feedback',
  name: 'Feedback/Rating',
  icon: '⭐',
  description: 'Collect customer feedback and ratings',
  
  fields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'googleform', label: 'Google Form' },
        { value: 'typeform', label: 'Typeform' },
        { value: 'surveymonkey', label: 'SurveyMonkey' },
        { value: 'custom', label: 'Custom URL' }
      ]
    },
    {
      name: 'formUrl',
      label: 'Form URL',
      type: 'text',
      required: true,
      placeholder: 'https://forms.gle/xxxxx',
      hint: 'Link to your feedback form',
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
      name: 'title',
      label: 'Title (optional)',
      type: 'text',
      required: false,
      placeholder: 'Customer Satisfaction Survey',
      maxLength: 100
    },
    {
      name: 'incentive',
      label: 'Incentive (optional)',
      type: 'text',
      required: false,
      placeholder: 'Complete the survey and get 10% OFF',
      maxLength: 150,
      hint: 'Offer to encourage feedback'
    }
  ],

  generate: (data) => {
    const { formUrl } = data;
    
    if (!formUrl) {
      throw new Error('Form URL is required');
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
    platform: 'googleform',
    formUrl: 'https://forms.gle/ABC123xyz',
    title: 'How was your experience?',
    incentive: 'Get 10% OFF your next purchase'
  }
};

