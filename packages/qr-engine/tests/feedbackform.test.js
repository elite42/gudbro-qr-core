/**
 * Feedback Form QR Code - Unit Tests
 *
 * Tests for Feedback Form QR codes
 * Customer feedback, reviews, ratings, and surveys
 * Use Cases: Post-dining feedback, service ratings, customer satisfaction surveys
 */

const {
  validateFormTitle,
  validateFormDescription,
  validateSubmissionUrl,
  validateQuestions,
  validateRatingType,
  validateThankYouMessage,
  generateFeedbackFormQRData,
  getFeedbackFormQRPlatformInfo
} = require('../utils/feedbackform');

describe('Feedback Form QR Code', () => {
  describe('validateFormTitle', () => {
    test('should accept valid form titles', () => {
      expect(validateFormTitle('Dining Experience Feedback')).toBe('Dining Experience Feedback');
      expect(validateFormTitle('Rate Your Meal')).toBe('Rate Your Meal');
      expect(validateFormTitle('Customer Survey')).toBe('Customer Survey');
    });

    test('should trim whitespace', () => {
      expect(validateFormTitle('  Feedback Form  ')).toBe('Feedback Form');
    });

    test('should reject empty title', () => {
      expect(() => validateFormTitle('')).toThrow('Form title is required');
      expect(() => validateFormTitle(null)).toThrow('Form title is required');
      expect(() => validateFormTitle(undefined)).toThrow('Form title is required');
    });

    test('should reject titles that are too short', () => {
      expect(() => validateFormTitle('A')).toThrow('at least 2 characters');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'A'.repeat(201);
      expect(() => validateFormTitle(longTitle)).toThrow('not exceed 200 characters');
    });
  });

  describe('validateFormDescription', () => {
    test('should accept valid descriptions', () => {
      expect(validateFormDescription('Help us improve your experience'))
        .toBe('Help us improve your experience');
      expect(validateFormDescription('Rate your meal in 30 seconds'))
        .toBe('Rate your meal in 30 seconds');
    });

    test('should return null for empty values', () => {
      expect(validateFormDescription(undefined)).toBeNull();
      expect(validateFormDescription(null)).toBeNull();
      expect(validateFormDescription('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateFormDescription('  Description  ')).toBe('Description');
    });

    test('should reject descriptions that are too long', () => {
      const longDesc = 'A'.repeat(1001);
      expect(() => validateFormDescription(longDesc)).toThrow('not exceed 1000 characters');
    });
  });

  describe('validateSubmissionUrl', () => {
    test('should accept valid URLs', () => {
      expect(validateSubmissionUrl('https://example.com/submit')).toBe('https://example.com/submit');
      expect(validateSubmissionUrl('http://example.com/api/feedback')).toBe('http://example.com/api/feedback');
    });

    test('should return null for empty values', () => {
      expect(validateSubmissionUrl(undefined)).toBeNull();
      expect(validateSubmissionUrl(null)).toBeNull();
      expect(validateSubmissionUrl('')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(validateSubmissionUrl('  https://example.com  ')).toBe('https://example.com');
    });

    test('should reject invalid URLs', () => {
      expect(() => validateSubmissionUrl('example.com')).toThrow('must start with http://');
      expect(() => validateSubmissionUrl('ftp://example.com')).toThrow('must start with http://');
    });
  });

  describe('validateQuestions', () => {
    test('should validate array of questions', () => {
      const questions = [
        { question: 'How was your meal?', type: 'rating' },
        { question: 'Any comments?', type: 'text' }
      ];

      const result = validateQuestions(questions);

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('How was your meal?');
      expect(result[0].type).toBe('rating');
    });

    test('should use default type "text" if not specified', () => {
      const questions = [
        { question: 'What is your name?' }
      ];

      const result = validateQuestions(questions);

      expect(result[0].type).toBe('text');
    });

    test('should set required to false by default', () => {
      const questions = [
        { question: 'Optional question?' }
      ];

      const result = validateQuestions(questions);

      expect(result[0].required).toBe(false);
    });

    test('should accept all valid question types', () => {
      const types = ['rating', 'text', 'textarea', 'multiple-choice', 'yes-no', 'scale'];

      types.forEach((type, index) => {
        const questions = [
          { question: `Question ${index}`, type, options: type === 'multiple-choice' ? ['A', 'B'] : undefined }
        ];

        const result = validateQuestions(questions);
        expect(result[0].type).toBe(type);
      });
    });

    test('should normalize question type to lowercase', () => {
      const questions = [
        { question: 'Test', type: 'RATING' }
      ];

      const result = validateQuestions(questions);

      expect(result[0].type).toBe('rating');
    });

    test('should trim question text', () => {
      const questions = [
        { question: '  How was it?  ' }
      ];

      const result = validateQuestions(questions);

      expect(result[0].question).toBe('How was it?');
    });

    test('should validate multiple-choice questions have options', () => {
      const questions = [
        { question: 'Choose one', type: 'multiple-choice', options: ['A', 'B', 'C'] }
      ];

      const result = validateQuestions(questions);

      expect(result[0].options).toEqual(['A', 'B', 'C']);
    });

    test('should require at least 2 options for multiple-choice', () => {
      const questions = [
        { question: 'Choose one', type: 'multiple-choice', options: ['A'] }
      ];

      expect(() => validateQuestions(questions)).toThrow('at least 2 options');
    });

    test('should reject multiple-choice without options', () => {
      const questions = [
        { question: 'Choose one', type: 'multiple-choice' }
      ];

      expect(() => validateQuestions(questions)).toThrow('at least 2 options');
    });

    test('should validate rating questions have min/max', () => {
      const questions = [
        { question: 'Rate us', type: 'rating', min: 1, max: 10 }
      ];

      const result = validateQuestions(questions);

      expect(result[0].min).toBe(1);
      expect(result[0].max).toBe(10);
    });

    test('should use default min/max for rating if not specified', () => {
      const questions = [
        { question: 'Rate us', type: 'rating' }
      ];

      const result = validateQuestions(questions);

      expect(result[0].min).toBe(1);
      expect(result[0].max).toBe(5);
    });

    test('should reject rating/scale where max <= min', () => {
      const questions = [
        { question: 'Rate us', type: 'rating', min: 5, max: 5 }
      ];

      expect(() => validateQuestions(questions)).toThrow('Max must be greater than min');
    });

    test('should validate scale questions have labels', () => {
      const questions = [
        {
          question: 'How satisfied?',
          type: 'scale',
          min: 1,
          max: 5,
          minLabel: 'Very Unsatisfied',
          maxLabel: 'Very Satisfied'
        }
      ];

      const result = validateQuestions(questions);

      expect(result[0].minLabel).toBe('Very Unsatisfied');
      expect(result[0].maxLabel).toBe('Very Satisfied');
    });

    test('should return null for empty questions', () => {
      expect(validateQuestions(undefined)).toBeNull();
      expect(validateQuestions(null)).toBeNull();
      expect(validateQuestions([])).toBeNull();
    });

    test('should reject non-array questions', () => {
      expect(() => validateQuestions('not an array')).toThrow('must be an array');
      expect(() => validateQuestions({})).toThrow('must be an array');
    });

    test('should reject too many questions', () => {
      const questions = Array.from({ length: 21 }, (_, i) => ({
        question: `Question ${i}`
      }));

      expect(() => validateQuestions(questions)).toThrow('Maximum 20 questions');
    });

    test('should accept maximum 20 questions', () => {
      const questions = Array.from({ length: 20 }, (_, i) => ({
        question: `Question ${i}`
      }));

      const result = validateQuestions(questions);

      expect(result).toHaveLength(20);
    });

    test('should reject questions without question field', () => {
      const questions = [
        { type: 'text' }
      ];

      expect(() => validateQuestions(questions)).toThrow("is missing 'question' field");
    });

    test('should reject questions that are too long', () => {
      const longQuestion = 'A'.repeat(501);
      const questions = [
        { question: longQuestion }
      ];

      expect(() => validateQuestions(questions)).toThrow('must not exceed 500 characters');
    });

    test('should reject invalid question type', () => {
      const questions = [
        { question: 'Test', type: 'invalid' }
      ];

      expect(() => validateQuestions(questions)).toThrow('Type must be one of');
    });

    test('should reject non-object questions', () => {
      const questions = [
        'not an object'
      ];

      expect(() => validateQuestions(questions)).toThrow('must be an object');
    });
  });

  describe('validateRatingType', () => {
    test('should accept valid rating types', () => {
      expect(validateRatingType('stars')).toBe('stars');
      expect(validateRatingType('numbers')).toBe('numbers');
      expect(validateRatingType('emoji')).toBe('emoji');
      expect(validateRatingType('thumbs')).toBe('thumbs');
    });

    test('should normalize to lowercase', () => {
      expect(validateRatingType('STARS')).toBe('stars');
      expect(validateRatingType('Emoji')).toBe('emoji');
    });

    test('should return null for empty values', () => {
      expect(validateRatingType(undefined)).toBeNull();
      expect(validateRatingType(null)).toBeNull();
      expect(validateRatingType('')).toBeNull();
    });

    test('should reject invalid rating types', () => {
      expect(() => validateRatingType('hearts')).toThrow('must be one of');
      expect(() => validateRatingType('invalid')).toThrow('must be one of');
    });
  });

  describe('validateThankYouMessage', () => {
    test('should accept valid thank you messages', () => {
      expect(validateThankYouMessage('Thank you for your feedback!'))
        .toBe('Thank you for your feedback!');
      expect(validateThankYouMessage('We appreciate your time'))
        .toBe('We appreciate your time');
    });

    test('should return default message for empty values', () => {
      expect(validateThankYouMessage(undefined)).toBe('Thank you for your feedback!');
      expect(validateThankYouMessage(null)).toBe('Thank you for your feedback!');
      expect(validateThankYouMessage('')).toBe('Thank you for your feedback!');
    });

    test('should trim whitespace', () => {
      expect(validateThankYouMessage('  Thank you  ')).toBe('Thank you');
    });

    test('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(501);
      expect(() => validateThankYouMessage(longMessage)).toThrow('not exceed 500 characters');
    });
  });

  describe('generateFeedbackFormQRData', () => {
    test('should generate Feedback Form QR with minimum required fields', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Dining Experience Feedback'
      });

      expect(result.form.title).toBe('Dining Experience Feedback');
      expect(result.url).toBe('#feedback-form');
      expect(result.form.ratingType).toBe('stars'); // Default rating type
      expect(result.form.collectEmail).toBe(false);
      expect(result.form.collectName).toBe(false);
      expect(result.form.thankYouMessage).toBe('Thank you for your feedback!');
      expect(result.implementationPhase).toBe('basic-structure');
    });

    test('should generate Feedback Form QR with all fields', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Customer Satisfaction Survey',
        formDescription: 'Help us improve',
        submissionUrl: 'https://api.example.com/feedback',
        questions: [
          { question: 'How was your meal?', type: 'rating', min: 1, max: 5, required: true },
          { question: 'Any comments?', type: 'textarea', required: false }
        ],
        businessName: 'Gudbro Restaurant',
        ratingType: 'stars',
        collectEmail: true,
        collectName: true,
        thankYouMessage: 'We appreciate your feedback!'
      });

      expect(result.form.title).toBe('Customer Satisfaction Survey');
      expect(result.form.description).toBe('Help us improve');
      expect(result.form.businessName).toBe('Gudbro Restaurant');
      expect(result.form.ratingType).toBe('stars');
      expect(result.form.collectEmail).toBe(true);
      expect(result.form.collectName).toBe(true);
      expect(result.form.thankYouMessage).toBe('We appreciate your feedback!');
      expect(result.form.questions).toHaveLength(2);
      expect(result.form.questionCount).toBe(2);
      expect(result.submissionUrl).toBe('https://api.example.com/feedback');
    });

    test('should use formUrl when provided (external form)', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Customer Feedback',
        formUrl: 'https://docs.google.com/forms/d/e/abc123'
      });

      expect(result.url).toBe('https://docs.google.com/forms/d/e/abc123');
      expect(result.implementationPhase).toBe('external-form');
      expect(result.note).toContain('external form service');
    });

    test('should use submissionUrl when formUrl not provided', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Feedback',
        submissionUrl: 'https://api.example.com/submit'
      });

      expect(result.url).toBe('https://api.example.com/submit');
      expect(result.submissionUrl).toBe('https://api.example.com/submit');
      expect(result.note).toContain('custom submission URL');
    });

    test('should prefer formUrl over submissionUrl', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Feedback',
        formUrl: 'https://forms.google.com/abc',
        submissionUrl: 'https://api.example.com/submit'
      });

      expect(result.url).toBe('https://forms.google.com/abc');
    });

    test('should handle Google Forms URL', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Feedback',
        formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_xyz/viewform'
      });

      expect(result.url).toContain('google.com/forms');
      expect(result.implementationPhase).toBe('external-form');
    });

    test('should handle Typeform URL', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Feedback',
        formUrl: 'https://form.typeform.com/to/abc123'
      });

      expect(result.url).toContain('typeform.com');
    });

    test('should include question count when questions provided', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Survey',
        questions: [
          { question: 'Q1' },
          { question: 'Q2' },
          { question: 'Q3' }
        ]
      });

      expect(result.form.questionCount).toBe(3);
    });

    test('should not include questionCount when no questions', () => {
      const result = generateFeedbackFormQRData({
        formTitle: 'Survey'
      });

      expect(result.form.questionCount).toBeUndefined();
      expect(result.form.questions).toBeUndefined();
    });

    test('should convert collectEmail to boolean', () => {
      expect(generateFeedbackFormQRData({
        formTitle: 'Test',
        collectEmail: 'true'
      }).form.collectEmail).toBe(true);

      expect(generateFeedbackFormQRData({
        formTitle: 'Test',
        collectEmail: 1
      }).form.collectEmail).toBe(true);

      expect(generateFeedbackFormQRData({
        formTitle: 'Test',
        collectEmail: 0
      }).form.collectEmail).toBe(false);
    });

    test('should convert collectName to boolean', () => {
      expect(generateFeedbackFormQRData({
        formTitle: 'Test',
        collectName: true
      }).form.collectName).toBe(true);

      expect(generateFeedbackFormQRData({
        formTitle: 'Test',
        collectName: false
      }).form.collectName).toBe(false);
    });

    test('should validate form title', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: ''
      })).toThrow('Form title is required');
    });

    test('should validate form description', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: 'Test',
        formDescription: 'A'.repeat(1001)
      })).toThrow('not exceed 1000 characters');
    });

    test('should validate questions', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: 'Test',
        questions: 'not an array'
      })).toThrow('must be an array');
    });

    test('should validate rating type', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: 'Test',
        ratingType: 'invalid'
      })).toThrow('must be one of');
    });

    test('should validate thank you message', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: 'Test',
        thankYouMessage: 'A'.repeat(501)
      })).toThrow('not exceed 500 characters');
    });

    test('should validate formUrl', () => {
      expect(() => generateFeedbackFormQRData({
        formTitle: 'Test',
        formUrl: 'invalid-url'
      })).toThrow('must start with http://');
    });
  });

  describe('getFeedbackFormQRPlatformInfo', () => {
    test('should return platform information', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info).toHaveProperty('name', 'Feedback Form QR Code');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('fields');
      expect(info).toHaveProperty('questionTypes');
      expect(info).toHaveProperty('ratingTypes');
      expect(info).toHaveProperty('useCases');
      expect(info).toHaveProperty('restaurantExamples');
      expect(info).toHaveProperty('externalFormServices');
      expect(info).toHaveProperty('implementation');
      expect(info).toHaveProperty('bestPractices');
      expect(info).toHaveProperty('quickImplementation');
    });

    test('should define required, recommended, and optional fields', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info.fields.required).toEqual(['formTitle']);
      expect(Array.isArray(info.fields.recommended)).toBe(true);
      expect(Array.isArray(info.fields.optional)).toBe(true);
    });

    test('should describe all question types', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info.questionTypes).toHaveProperty('rating');
      expect(info.questionTypes).toHaveProperty('text');
      expect(info.questionTypes).toHaveProperty('textarea');
      expect(info.questionTypes).toHaveProperty('multiple-choice');
      expect(info.questionTypes).toHaveProperty('yes-no');
      expect(info.questionTypes).toHaveProperty('scale');

      expect(info.questionTypes.rating).toHaveProperty('name');
      expect(info.questionTypes.rating).toHaveProperty('description');
      expect(info.questionTypes.rating).toHaveProperty('fields');
    });

    test('should list all rating types', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info.ratingTypes).toHaveProperty('stars');
      expect(info.ratingTypes).toHaveProperty('numbers');
      expect(info.ratingTypes).toHaveProperty('emoji');
      expect(info.ratingTypes).toHaveProperty('thumbs');
    });

    test('should include use cases', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(Array.isArray(info.useCases)).toBe(true);
      expect(info.useCases.length).toBeGreaterThan(0);
    });

    test('should include restaurant examples', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(Array.isArray(info.restaurantExamples)).toBe(true);
      expect(info.restaurantExamples.length).toBeGreaterThan(0);

      const example = info.restaurantExamples[0];
      expect(example).toHaveProperty('title');
      expect(example).toHaveProperty('description');
      expect(example).toHaveProperty('questions');
      expect(Array.isArray(example.questions)).toBe(true);
    });

    test('should list external form services', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(Array.isArray(info.externalFormServices)).toBe(true);
      expect(info.externalFormServices.length).toBeGreaterThan(0);

      const service = info.externalFormServices[0];
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('urlFormat');
    });

    test('should include Google Forms in external services', () => {
      const info = getFeedbackFormQRPlatformInfo();

      const googleForms = info.externalFormServices.find(s => s.name === 'Google Forms');
      expect(googleForms).toBeTruthy();
      expect(googleForms.urlFormat).toContain('google.com/forms');
    });

    test('should describe implementation phases', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info.implementation).toHaveProperty('current');
      expect(info.implementation).toHaveProperty('currentDescription');
      expect(info.implementation).toHaveProperty('future');
      expect(info.implementation).toHaveProperty('futureFeatures');
      expect(Array.isArray(info.implementation.futureFeatures)).toBe(true);
    });

    test('should include best practices', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(Array.isArray(info.bestPractices)).toBe(true);
      expect(info.bestPractices.length).toBeGreaterThan(0);
    });

    test('should include quick implementation guides', () => {
      const info = getFeedbackFormQRPlatformInfo();

      expect(info.quickImplementation).toHaveProperty('googleForms');
      expect(info.quickImplementation).toHaveProperty('typeform');
      expect(Array.isArray(info.quickImplementation.googleForms)).toBe(true);
      expect(Array.isArray(info.quickImplementation.typeform)).toBe(true);
    });
  });
});
