/**
 * Business Page QR Code Generator
 * Digital business card with comprehensive information
 *
 * More complete than vCard - includes social media, hours, multiple locations
 * Perfect for restaurants, shops, service businesses
 *
 * Use Cases:
 * - Restaurant info pages
 * - Shop/store information
 * - Service business cards
 * - Contact information hubs
 */

/**
 * Validate business name
 */
const validateBusinessName = (name) => {
  if (!name) {
    throw new Error('Business name is required');
  }

  const trimmed = String(name).trim();

  if (trimmed.length < 2) {
    throw new Error('Business name must be at least 2 characters');
  }

  if (trimmed.length > 200) {
    throw new Error('Business name must not exceed 200 characters');
  }

  return trimmed;
};

/**
 * Validate business description
 */
const validateDescription = (description) => {
  if (!description) {
    return null;
  }

  const trimmed = String(description).trim();

  if (trimmed.length > 1000) {
    throw new Error('Description must not exceed 1000 characters');
  }

  return trimmed;
};

/**
 * Validate URL
 */
const validateUrl = (url, fieldName = 'URL') => {
  if (!url) {
    return null;
  }

  const trimmed = String(url).trim();

  if (!/^https?:\/\/.+/.test(trimmed)) {
    throw new Error(`${fieldName} must start with http:// or https://`);
  }

  return trimmed;
};

/**
 * Validate email
 */
const validateEmail = (email) => {
  if (!email) {
    return null;
  }

  const trimmed = String(email).trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Invalid email format');
  }

  return trimmed;
};

/**
 * Validate phone
 */
const validatePhone = (phone) => {
  if (!phone) {
    return null;
  }

  const trimmed = String(phone).trim();

  if (trimmed.length < 8 || trimmed.length > 20) {
    throw new Error('Phone number must be between 8 and 20 characters');
  }

  return trimmed;
};

/**
 * Validate address
 */
const validateAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return null;
  }

  const validated = {};

  if (address.street) {
    validated.street = String(address.street).trim();
  }
  if (address.city) {
    validated.city = String(address.city).trim();
  }
  if (address.state) {
    validated.state = String(address.state).trim();
  }
  if (address.country) {
    validated.country = String(address.country).trim();
  }
  if (address.postalCode) {
    validated.postalCode = String(address.postalCode).trim();
  }

  return Object.keys(validated).length > 0 ? validated : null;
};

/**
 * Validate business hours
 */
const validateBusinessHours = (hours) => {
  if (!hours || typeof hours !== 'object') {
    return null;
  }

  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const validated = {};

  for (const day of validDays) {
    if (hours[day]) {
      validated[day] = String(hours[day]).trim();
    }
  }

  return Object.keys(validated).length > 0 ? validated : null;
};

/**
 * Validate social links
 */
const validateSocialLinks = (social) => {
  if (!social || typeof social !== 'object') {
    return null;
  }

  const validated = {};
  const validPlatforms = [
    'facebook', 'instagram', 'twitter', 'x', 'linkedin',
    'tiktok', 'youtube', 'whatsapp', 'zalo', 'line',
    'kakaotalk', 'wechat', 'website'
  ];

  for (const platform of validPlatforms) {
    if (social[platform]) {
      const value = String(social[platform]).trim();
      // For website, validate URL format
      if (platform === 'website') {
        if (/^https?:\/\/.+/.test(value)) {
          validated[platform] = value;
        }
      } else {
        validated[platform] = value;
      }
    }
  }

  return Object.keys(validated).length > 0 ? validated : null;
};

/**
 * Validate categories/tags
 */
const validateCategories = (categories) => {
  if (!categories) {
    return null;
  }

  if (!Array.isArray(categories)) {
    throw new Error('Categories must be an array');
  }

  if (categories.length > 10) {
    throw new Error('Maximum 10 categories allowed');
  }

  return categories
    .map(cat => String(cat).trim())
    .filter(cat => cat.length > 0 && cat.length <= 50);
};

/**
 * Generate Business Page QR data
 *
 * @param {Object} options
 * @param {string} options.businessName - Business name (required)
 * @param {string} [options.description] - Business description
 * @param {string} [options.websiteUrl] - Website URL
 * @param {string} [options.email] - Email address
 * @param {string} [options.phone] - Phone number
 * @param {Object} [options.address] - Address object {street, city, state, country, postalCode}
 * @param {Object} [options.businessHours] - Hours object {monday: "9-5", tuesday: "9-5", ...}
 * @param {Object} [options.socialLinks] - Social media links {facebook, instagram, ...}
 * @param {Array} [options.categories] - Business categories/tags
 * @param {string} [options.logo] - Logo URL
 * @param {string} [options.coverImage] - Cover image URL
 * @param {string} [options.landingPageUrl] - Custom landing page URL
 * @returns {Object} Business Page QR data
 */
const generateBusinessPageQRData = ({
  businessName,
  description,
  websiteUrl,
  email,
  phone,
  address,
  businessHours,
  socialLinks,
  categories,
  logo,
  coverImage,
  landingPageUrl
}) => {
  // Validate required fields
  const validatedName = validateBusinessName(businessName);

  // Validate optional fields
  const validatedDescription = validateDescription(description);
  const validatedWebsite = validateUrl(websiteUrl, 'Website URL');
  const validatedEmail = validateEmail(email);
  const validatedPhone = validatePhone(phone);
  const validatedAddress = validateAddress(address);
  const validatedHours = validateBusinessHours(businessHours);
  const validatedSocial = validateSocialLinks(socialLinks);
  const validatedCategories = validateCategories(categories);
  const validatedLogo = validateUrl(logo, 'Logo URL');
  const validatedCoverImage = validateUrl(coverImage, 'Cover image URL');

  // Determine destination URL
  const destinationUrl = landingPageUrl || validatedWebsite || '#';

  // Build business info object
  const businessInfo = {
    name: validatedName,
    description: validatedDescription,
    website: validatedWebsite,
    email: validatedEmail,
    phone: validatedPhone,
    address: validatedAddress,
    businessHours: validatedHours,
    socialLinks: validatedSocial,
    categories: validatedCategories,
    logo: validatedLogo,
    coverImage: validatedCoverImage
  };

  // Remove null values
  Object.keys(businessInfo).forEach(key => {
    if (businessInfo[key] === null) {
      delete businessInfo[key];
    }
  });

  return {
    url: destinationUrl,
    businessInfo,
    implementationPhase: 'basic-info',
    note: landingPageUrl
      ? 'Using custom landing page URL'
      : validatedWebsite
      ? 'Using business website as primary URL'
      : 'No URL provided - requires custom landing page implementation'
  };
};

/**
 * Get Business Page QR platform info
 */
const getBusinessPageQRPlatformInfo = () => {
  return {
    name: 'Business Page QR Code',
    description: 'Comprehensive digital business card with full contact information, hours, and social links',
    fields: {
      required: ['businessName'],
      recommended: ['description', 'phone', 'email', 'websiteUrl'],
      optional: [
        'address',
        'businessHours',
        'socialLinks',
        'categories',
        'logo',
        'coverImage',
        'landingPageUrl'
      ]
    },
    addressFields: {
      street: 'Street address',
      city: 'City',
      state: 'State/Province',
      country: 'Country',
      postalCode: 'Postal/ZIP code'
    },
    businessHoursDays: [
      'monday', 'tuesday', 'wednesday', 'thursday',
      'friday', 'saturday', 'sunday'
    ],
    businessHoursFormat: 'Flexible format (e.g., "9am-5pm", "9:00-17:00", "Closed")',
    supportedSocialPlatforms: [
      'facebook', 'instagram', 'twitter', 'x', 'linkedin',
      'tiktok', 'youtube', 'whatsapp', 'zalo', 'line',
      'kakaotalk', 'wechat', 'website'
    ],
    limits: {
      businessNameMax: 200,
      descriptionMax: 1000,
      categoriesMax: 10,
      categoryLengthMax: 50
    },
    useCases: [
      'Restaurant information hub',
      'Retail store details',
      'Service business cards',
      'Hotel/accommodation info',
      'Spa/salon information',
      'Cafe/coffee shop details',
      'Professional services',
      'Event venue information'
    ],
    restaurantExample: {
      businessName: 'Gudbro Vietnamese Restaurant',
      description: 'Authentic Vietnamese cuisine in the heart of Ho Chi Minh City',
      phone: '+84-28-1234-5678',
      email: 'info@gudbro.com',
      address: {
        street: '123 Nguyen Hue Street',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        postalCode: '700000'
      },
      businessHours: {
        monday: '11:00 - 22:00',
        tuesday: '11:00 - 22:00',
        wednesday: '11:00 - 22:00',
        thursday: '11:00 - 22:00',
        friday: '11:00 - 23:00',
        saturday: '11:00 - 23:00',
        sunday: '11:00 - 22:00'
      },
      socialLinks: {
        facebook: 'gudbrovietnam',
        instagram: 'gudbrovietnam',
        zalo: '84912345678'
      },
      categories: ['Vietnamese', 'Asian', 'Fine Dining']
    },
    implementation: {
      current: 'Phase 1 - Data Structure',
      currentDescription: 'Provides structured business data. QR points to website or custom landing page.',
      future: 'Phase 2 - Rendered Landing Page',
      futureFeatures: [
        'Auto-generated responsive business page',
        'Click-to-call phone numbers',
        'Click-to-email contact',
        'Map integration with address',
        'Social media quick links',
        'Add to contacts button',
        'Share business page',
        'Custom themes and branding',
        'Analytics tracking',
        'Multiple location support'
      ]
    },
    bestPractices: [
      'Include accurate, up-to-date contact information',
      'Use high-quality logo and cover images',
      'Keep business hours current',
      'Provide clear, concise description',
      'Link all active social media accounts',
      'Include complete address with country',
      'Use international phone format',
      'Test all links before deploying',
      'Update regularly (hours, contact info)',
      'Consider multiple languages for tourist areas'
    ]
  };
};

module.exports = {
  validateBusinessName,
  validateDescription,
  validateUrl,
  validateEmail,
  validatePhone,
  validateAddress,
  validateBusinessHours,
  validateSocialLinks,
  validateCategories,
  generateBusinessPageQRData,
  getBusinessPageQRPlatformInfo
};
