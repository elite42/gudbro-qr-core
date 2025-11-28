/**
 * Feedback Form QR Code Generator
 * Customer feedback, reviews, ratings, and surveys
 *
 * Use Cases:
 * - Restaurant reviews
 * - Service feedback
 * - Product ratings
 * - Customer satisfaction surveys
 * - Post-dining experience feedback
 */

/**
 * Validate form title
 */
const validateFormTitle = (title) => {
  if (!title) {
    throw new Error('Form title is required');
  }

  const trimmed = String(title).trim();

  if (trimmed.length < 2) {
    throw new Error('Form title must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Form title must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate form description
 */
const validateFormDescription = (description) => {
  if (!description) {
    return null;
  }

  const trimmed = String(description).trim();

  if (trimmed.length > 1000) {
    throw new Error('Form description must not exceed 1000 characters');
  }

  return trimmed;
};

/**
 * Validate submission URL
 */
const validateSubmissionUrl = (url) => {
  if (!url) {
    return null;
  }

  const trimmed = String(url).trim();

  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error('Submission URL must start with http:// or https://');
  }

  return trimmed;
};

/**
 * Validate feedback questions
 */
const validateQuestions = (questions) => {
  if (!questions) {
    return null;
  }

  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }

  if (questions.length === 0) {
    return null;
  }

  if (questions.length > 20) {
    throw new Error('Maximum 20 questions allowed');
  }

  const validTypes = ['rating', 'text', 'textarea', 'multiple-choice', 'yes-no', 'scale'];

  return questions.map((q, index) => {
    if (!q || typeof q !== 'object') {
      throw new Error(`Question ${index + 1} must be an object`);
    }

    if (!q.question) {
      throw new Error(`Question ${index + 1} is missing 'question' field`);
    }

    const question = String(q.question).trim();
    if (question.length > 500) {
      throw new Error(`Question ${index + 1} must not exceed 500 characters`);
    }

    const type = q.type ? String(q.type).toLowerCase() : 'text';
    if (!validTypes.includes(type)) {
      throw new Error(`Question ${index + 1}: Type must be one of: ${validTypes.join(', ')}`);
    }

    const validated = {
      question,
      type,
      required: q.required !== undefined ? Boolean(q.required) : false
    };

    // For multiple-choice, validate options
    if (type === 'multiple-choice') {
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Question ${index + 1}: Multiple choice requires at least 2 options`);
      }
      validated.options = q.options.map(opt => String(opt).trim());
    }

    // For rating/scale, validate range
    if (type === 'rating' || type === 'scale') {
      validated.min = q.min !== undefined ? parseInt(q.min) : 1;
      validated.max = q.max !== undefined ? parseInt(q.max) : 5;
      if (validated.max <= validated.min) {
        throw new Error(`Question ${index + 1}: Max must be greater than min`);
      }
    }

    // For scale, validate labels
    if (type === 'scale') {
      if (q.minLabel) validated.minLabel = String(q.minLabel).trim();
      if (q.maxLabel) validated.maxLabel = String(q.maxLabel).trim();
    }

    return validated;
  });
};

/**
 * Validate rating type
 */
const validateRatingType = (ratingType) => {
  if (!ratingType) {
    return null;
  }

  const validTypes = ['stars', 'numbers', 'emoji', 'thumbs'];
  const type = String(ratingType).toLowerCase();

  if (!validTypes.includes(type)) {
    throw new Error(`Rating type must be one of: ${validTypes.join(', ')}`);
  }

  return type;
};

/**
 * Validate thank you message
 */
const validateThankYouMessage = (message) => {
  if (!message) {
    return 'Thank you for your feedback!';
  }

  const trimmed = String(message).trim();

  if (trimmed.length > 500) {
    throw new Error('Thank you message must not exceed 500 characters');
  }

  return trimmed;
};

/**
 * Generate Feedback Form QR data
 *
 * @param {Object} options
 * @param {string} options.formTitle - Form title (required)
 * @param {string} [options.formDescription] - Form description
 * @param {string} [options.submissionUrl] - URL to submit form data
 * @param {Array} [options.questions] - Array of question objects
 * @param {string} [options.businessName] - Business name
 * @param {string} [options.ratingType] - Rating display: stars, numbers, emoji, thumbs
 * @param {boolean} [options.collectEmail=false] - Collect email address
 * @param {boolean} [options.collectName=false] - Collect customer name
 * @param {string} [options.thankYouMessage] - Thank you message after submission
 * @param {string} [options.formUrl] - Direct link to existing form (Google Forms, Typeform, etc.)
 * @returns {Object} Feedback Form QR data
 */
const generateFeedbackFormQRData = ({
  formTitle,
  formDescription,
  submissionUrl,
  questions,
  businessName,
  ratingType = 'stars',
  collectEmail = false,
  collectName = false,
  thankYouMessage,
  formUrl
}) => {
  // Validate required fields
  const validatedTitle = validateFormTitle(formTitle);

  // Validate optional fields
  const validatedDescription = validateFormDescription(formDescription);
  const validatedSubmissionUrl = validateSubmissionUrl(submissionUrl);
  const validatedQuestions = validateQuestions(questions);
  const validatedRatingType = validateRatingType(ratingType);
  const validatedThankYouMessage = validateThankYouMessage(thankYouMessage);

  // Build form data
  const formData = {
    title: validatedTitle,
    description: validatedDescription,
    businessName: businessName ? String(businessName).trim() : null,
    ratingType: validatedRatingType,
    collectEmail: Boolean(collectEmail),
    collectName: Boolean(collectName),
    thankYouMessage: validatedThankYouMessage
  };

  if (validatedQuestions && validatedQuestions.length > 0) {
    formData.questions = validatedQuestions;
    formData.questionCount = validatedQuestions.length;
  }

  // Determine destination URL
  let destinationUrl;
  if (formUrl) {
    // User provided existing form URL (Google Forms, Typeform, etc.)
    destinationUrl = validateSubmissionUrl(formUrl);
  } else if (validatedSubmissionUrl) {
    // User provided custom submission endpoint
    destinationUrl = validatedSubmissionUrl;
  } else {
    // No URL provided - would need custom form builder
    destinationUrl = '#feedback-form';
  }

  return {
    url: destinationUrl,
    form: formData,
    submissionUrl: validatedSubmissionUrl,
    implementationPhase: formUrl ? 'external-form' : 'basic-structure',
    note: formUrl
      ? 'Using external form service (Google Forms, Typeform, etc.)'
      : validatedSubmissionUrl
      ? 'Using custom submission URL - requires form implementation'
      : 'No form URL provided - requires custom form builder or external service'
  };
};

/**
 * Get Feedback Form QR platform info
 */
const getFeedbackFormQRPlatformInfo = () => {
  return {
    name: 'Feedback Form QR Code',
    description: 'Customer feedback forms, reviews, ratings, and satisfaction surveys',
    fields: {
      required: ['formTitle'],
      recommended: ['formDescription', 'questions', 'formUrl'],
      optional: [
        'submissionUrl',
        'businessName',
        'ratingType',
        'collectEmail',
        'collectName',
        'thankYouMessage'
      ]
    },
    questionTypes: {
      rating: {
        name: 'Rating',
        description: 'Numeric rating (e.g., 1-5 stars)',
        fields: ['min', 'max']
      },
      text: {
        name: 'Short Text',
        description: 'Single-line text input',
        fields: []
      },
      textarea: {
        name: 'Long Text',
        description: 'Multi-line text input for detailed feedback',
        fields: []
      },
      'multiple-choice': {
        name: 'Multiple Choice',
        description: 'Select one option from a list',
        fields: ['options (array)']
      },
      'yes-no': {
        name: 'Yes/No',
        description: 'Simple yes or no question',
        fields: []
      },
      scale: {
        name: 'Scale',
        description: 'Rating scale with labels (e.g., "Very Bad" to "Very Good")',
        fields: ['min', 'max', 'minLabel', 'maxLabel']
      }
    },
    ratingTypes: {
      stars: '⭐⭐⭐⭐⭐ Star rating',
      numbers: '1 2 3 4 5 Numeric rating',
      emoji: '😞😐🙂😊😍 Emoji rating',
      thumbs: '👍👎 Thumbs up/down'
    },
    useCases: [
      'Post-dining experience feedback',
      'Food quality ratings',
      'Service satisfaction surveys',
      'Cleanliness ratings',
      'Atmosphere feedback',
      'Google/Yelp review requests',
      'Staff performance feedback',
      'Menu item ratings',
      'Delivery experience feedback',
      'Event feedback surveys'
    ],
    restaurantExamples: [
      {
        title: 'Dining Experience Feedback',
        description: 'Help us improve your experience',
        questions: [
          { question: 'How was your overall experience?', type: 'rating', min: 1, max: 5, required: true },
          { question: 'How was the food quality?', type: 'rating', min: 1, max: 5, required: true },
          { question: 'How was the service?', type: 'rating', min: 1, max: 5, required: true },
          { question: 'Would you recommend us to a friend?', type: 'yes-no', required: false },
          { question: 'Any additional comments?', type: 'textarea', required: false }
        ],
        collectEmail: true,
        ratingType: 'stars'
      },
      {
        title: 'Quick Rating',
        description: 'Rate your meal in 30 seconds',
        questions: [
          { question: 'How satisfied are you?', type: 'scale', min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied' }
        ],
        ratingType: 'emoji'
      }
    ],
    externalFormServices: [
      {
        name: 'Google Forms',
        description: 'Free, easy to use',
        urlFormat: 'https://docs.google.com/forms/d/e/...'
      },
      {
        name: 'Typeform',
        description: 'Beautiful, conversational forms',
        urlFormat: 'https://form.typeform.com/to/...'
      },
      {
        name: 'SurveyMonkey',
        description: 'Professional surveys',
        urlFormat: 'https://www.surveymonkey.com/r/...'
      },
      {
        name: 'Microsoft Forms',
        description: 'Microsoft ecosystem integration',
        urlFormat: 'https://forms.office.com/...'
      },
      {
        name: 'Jotform',
        description: 'Customizable forms',
        urlFormat: 'https://form.jotform.com/...'
      }
    ],
    implementation: {
      current: 'Phase 1 - Form Structure or External Link',
      currentDescription: 'Supports linking to existing forms (Google Forms, etc.) or provides form structure for custom implementation',
      future: 'Phase 2 - Built-in Form Builder',
      futureFeatures: [
        'Drag-and-drop form builder',
        'Real-time response collection',
        'Response analytics and insights',
        'Email notifications for responses',
        'Response export (CSV, Excel)',
        'Conditional logic (show/hide questions)',
        'Multi-language support',
        'Custom branding and themes',
        'Integration with CRM systems',
        'Sentiment analysis',
        'Automated follow-ups',
        'Response statistics dashboard'
      ]
    },
    bestPractices: [
      'Keep forms short (5-7 questions max for best completion rates)',
      'Make critical questions required, others optional',
      'Use clear, simple language',
      'Mix question types for engagement',
      'Always include a "Comments" field',
      'Offer incentive for completion (discount, free item)',
      'Test form on mobile devices',
      'Thank customers for their time',
      'Act on feedback received',
      'Monitor completion rates',
      'Follow up on negative feedback promptly',
      'Use feedback to improve service'
    ],
    quickImplementation: {
      googleForms: [
        '1. Create form at forms.google.com',
        '2. Configure questions',
        '3. Click "Send" and copy link',
        '4. Use link as formUrl parameter'
      ],
      typeform: [
        '1. Create form at typeform.com',
        '2. Design your questions',
        '3. Publish and copy share link',
        '4. Use link as formUrl parameter'
      ]
    }
  };
};

module.exports = {
  validateFormTitle,
  validateFormDescription,
  validateSubmissionUrl,
  validateQuestions,
  validateRatingType,
  validateThankYouMessage,
  generateFeedbackFormQRData,
  getFeedbackFormQRPlatformInfo
};
