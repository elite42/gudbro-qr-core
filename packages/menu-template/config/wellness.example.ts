import { VerticalConfig } from '../types';

/**
 * Example Wellness/Spa Vertical Configuration
 * This shows how to configure the menu template for a spa/massage center
 */
export const wellnessConfig: VerticalConfig = {
  // Vertical type
  vertical: 'wellness',
  name: 'Jennie SPA',

  // Business information
  business: {
    name: 'Jennie SPA',
    logo: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=120&h=120&fit=crop&crop=center',
    tagline: 'Traditional Vietnamese Massage',
    description: 'Experience authentic Vietnamese spa and wellness treatments'
  },

  // Contact information
  contact: {
    phone: '+84 932 594 962',
    zaloId: '0932594962',
    whatsappNumber: '+84932594962',
    email: 'info@jenniespa.com'
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/jenniespa',
    instagram: 'https://instagram.com/jenniespa',
    tiktok: 'https://tiktok.com/@jenniespa'
  },

  // Location information
  location: {
    address: '34 An Thuong 2, Da Nang',
    googleMapsUrl: 'https://maps.google.com/?q=34+An+Thuong+2+Da+Nang',
    coordinates: {
      lat: 16.0544,
      lng: 108.2022
    }
  },

  // Review platforms
  reviews: {
    googleReviewUrl: 'https://g.page/r/CZtKXZ0Z0Z0ZEAE/review',
    tripadvisorUrl: 'https://tripadvisor.com/jenniespa'
  },

  // Accepted payment methods
  paymentMethods: ['Cash', 'Card', 'MoMo', 'ZaloPay', 'GrabPay'],

  // UI Configuration
  ui: {
    // Components to show in item cards
    itemCard: {
      components: ['duration', 'price', 'image'],
      showExtras: false // Spas don't usually have extras
    },

    // Available filters
    filters: ['category', 'duration', 'price'],

    // Booking flow: direct contact via Zalo/WhatsApp (no cart)
    bookingFlow: 'direct-contact',

    // Custom labels/terminology
    labels: {
      items: 'Trattamenti',
      category: 'Tipo',
      price: 'Tariffa',
      duration: 'Durata',
      search: 'Cerca servizi',
      packages: 'Pacchetti VIP',
      promotions: 'Promozioni',
      bookNow: 'Prenota su Zalo'
    },

    // Theme colors
    theme: {
      primary: '#EC4899', // pink-500
      secondary: '#A855F7', // purple-500
      accent: '#F59E0B'   // amber-500
    }
  },

  // Feature flags
  features: {
    enableLanguageSelector: true,
    enableCurrencyConverter: true,
    enableSearch: true,
    enablePackages: true,
    enablePromotions: true
  },

  // Internationalization
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: [
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
      { code: 'ko', flag: '🇰🇷', name: '한국어' },
      { code: 'zh', flag: '🇨🇳', name: '中文' },
      { code: 'ja', flag: '🇯🇵', name: '日本語' }
    ],
    defaultCurrency: 'VND',
    supportedCurrencies: ['VND', 'USD', 'EUR', 'CNY', 'KRW', 'JPY']
  }
};

/**
 * Example service items with wellness-specific metadata
 */
export const wellnessItemsExample = [
  {
    id: 'thai-massage-60',
    name: 'Thai Massage',
    description: 'Traditional Thai massage combining stretching and pressure points',
    price: 350000,
    category: 'Body Massage',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1',
    metadata: {
      duration: 60, // minutes
      therapists: ['linh-nguyen', 'mai-tran'], // Available therapists
      contraindications: ['pregnancy', 'recent-surgery'], // Safety warnings
      benefits: ['stress-relief', 'flexibility', 'circulation']
    }
  },
  {
    id: 'korean-facial-45',
    name: 'Korean Facial Treatment',
    description: '10-step Korean skincare routine for glowing skin',
    price: 200000,
    category: 'Facial',
    image: 'https://images.unsplash.com/photo-1552693673-1bf958298935',
    metadata: {
      duration: 45,
      therapists: ['hana-kim'],
      skinTypes: ['all', 'sensitive', 'dry', 'oily'],
      includes: ['cleansing', 'exfoliation', 'mask', 'massage', 'moisturizing']
    }
  }
];

/**
 * Example packages with multiple services
 */
export const wellnessPackagesExample = [
  {
    id: 'vip-1',
    name: 'VIP Package 1',
    description: 'Complete facial care and relaxation',
    duration: '60 min',
    price: 400000,
    items: ['ear-cleaning', 'face-shaving', 'facial', 'shampoo'],
    icon: '✨',
    popular: false
  },
  {
    id: 'vip-2',
    name: 'VIP Package 2',
    description: 'Our most complete wellness experience',
    duration: '90 min',
    price: 550000,
    items: ['face-shaving', 'ear-cleaning', 'facial', 'face-mask', 'shampoo', 'head-neck-shoulder-massage'],
    icon: '💎',
    popular: true
  }
];
