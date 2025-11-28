import { VerticalConfig } from '../types';

/**
 * Example Restaurant Vertical Configuration
 * This shows how to configure the menu template for a restaurant/bar
 */
export const restaurantConfig: VerticalConfig = {
  // Vertical type
  vertical: 'restaurant',
  name: 'Trattoria Italiana',

  // Business information
  business: {
    name: 'Trattoria Italiana',
    logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&h=120&fit=crop',
    tagline: 'Authentic Italian Cuisine',
    description: 'Traditional Italian dishes made with fresh, local ingredients'
  },

  // Contact information
  contact: {
    phone: '+39 02 1234567',
    zaloId: '0932594962', // For Vietnam/Asia markets
    whatsappNumber: '+390212345678',
    email: 'info@trattoria.it'
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/trattoria',
    instagram: 'https://instagram.com/trattoria',
    tiktok: 'https://tiktok.com/@trattoria'
  },

  // Location information
  location: {
    address: 'Via Roma 123, Milano, Italy',
    googleMapsUrl: 'https://maps.google.com/?q=Via+Roma+123+Milano',
    coordinates: {
      lat: 45.4642,
      lng: 9.1900
    }
  },

  // Review platforms
  reviews: {
    googleReviewUrl: 'https://g.page/r/xxx/review',
    tripadvisorUrl: 'https://tripadvisor.com/trattoria',
    yelpUrl: 'https://yelp.com/biz/trattoria'
  },

  // Accepted payment methods
  paymentMethods: ['Cash', 'Card', 'Apple Pay', 'Google Pay', 'Satispay'],

  // UI Configuration
  ui: {
    // Components to show in item cards
    itemCard: {
      components: ['allergens', 'spicy', 'dietary', 'price', 'image'],
      showExtras: true // Restaurants have extras (extra cheese, bacon, etc.)
    },

    // Available filters
    filters: ['category', 'dietary', 'allergens', 'spicy', 'price'],

    // Booking flow: cart-based (add items to cart before ordering)
    bookingFlow: 'cart-based',

    // Custom labels/terminology
    labels: {
      items: 'Piatti',
      category: 'Portata',
      price: 'Prezzo',
      search: 'Cerca nel menu',
      packages: 'Menu Degustazione',
      promotions: 'Offerte Speciali',
      bookNow: 'Aggiungi al carrello',
      addToCart: 'Aggiungi',
      viewCart: 'Vedi Carrello'
    },

    // Theme colors
    theme: {
      primary: '#EF4444', // red-500 (Italian theme)
      secondary: '#10B981', // green-500 (Italian flag)
      accent: '#F59E0B'    // amber-500
    }
  },

  // Feature flags
  features: {
    enableLanguageSelector: true,
    enableCurrencyConverter: true,
    enableSearch: true,
    enablePackages: true, // Tasting menus
    enablePromotions: true
  },

  // Internationalization
  i18n: {
    defaultLanguage: 'it',
    supportedLanguages: [
      { code: 'it', flag: '🇮🇹', name: 'Italiano' },
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
      { code: 'es', flag: '🇪🇸', name: 'Español' }
    ],
    defaultCurrency: 'EUR',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF']
  }
};

/**
 * Example restaurant items with restaurant-specific metadata
 */
export const restaurantItemsExample = [
  {
    id: 'pasta-carbonara',
    name: 'Pasta alla Carbonara',
    description: 'Traditional Roman pasta with eggs, pecorino, guanciale and black pepper',
    price: 12.50,
    category: 'Primi Piatti',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
    metadata: {
      // Restaurant-specific fields
      allergens: ['gluten', 'eggs', 'dairy'],
      spicyLevel: 0, // 0-5 scale
      dietary: ['non-vegetarian'],
      preparationTime: 15, // minutes
      servingSize: '350g',

      // Extra ingredients available
      extras: [
        { name: 'Pancetta extra', price: 2.00 },
        { name: 'Parmigiano extra', price: 1.50 },
        { name: 'Pepe nero macinato fresco', price: 0.50 }
      ],

      // When is it available
      availableAt: ['lunch', 'dinner'],

      // Nutritional info (optional)
      calories: 520,

      // Chef recommendations
      pairsWith: ['vino-bianco-frascati', 'acqua-frizzante']
    }
  },
  {
    id: 'pizza-margherita',
    name: 'Pizza Margherita',
    description: 'Classic Neapolitan pizza with tomato, mozzarella and basil',
    price: 8.50,
    category: 'Pizze',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
    metadata: {
      allergens: ['gluten', 'dairy'],
      spicyLevel: 0,
      dietary: ['vegetarian'],
      preparationTime: 10,
      servingSize: '350g',

      extras: [
        { name: 'Mozzarella di bufala', price: 3.00 },
        { name: 'Prosciutto crudo', price: 3.50 },
        { name: 'Funghi freschi', price: 2.00 },
        { name: 'Olive nere', price: 1.50 },
        { name: 'Rucola', price: 1.00 }
      ],

      availableAt: ['lunch', 'dinner', 'takeaway'],
      calories: 780,

      // Pizza-specific
      doughType: 'napoletana',
      bakingMethod: 'wood-fired'
    }
  },
  {
    id: 'insalata-caprese',
    name: 'Insalata Caprese',
    description: 'Fresh mozzarella, tomatoes, basil and extra virgin olive oil',
    price: 9.00,
    category: 'Antipasti',
    image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5',
    metadata: {
      allergens: ['dairy'],
      spicyLevel: 0,
      dietary: ['vegetarian', 'gluten-free'],
      preparationTime: 5,
      servingSize: '250g',

      extras: [
        { name: 'Mozzarella di bufala upgrade', price: 2.00 },
        { name: 'Aceto balsamico invecchiato', price: 1.50 }
      ],

      availableAt: ['lunch', 'dinner'],
      calories: 280,

      // Salad-specific
      dressing: 'olio-extravergine',
      seasonal: true
    }
  }
];

/**
 * Example restaurant packages (tasting menus)
 */
export const restaurantPackagesExample = [
  {
    id: 'menu-degustazione',
    name: 'Menu Degustazione',
    description: '5-course tasting menu featuring our chef\'s specialties',
    duration: '2 hours',
    price: 45.00,
    items: ['antipasto-chef', 'primo-chef', 'secondo-chef', 'dolce-chef', 'caffe'],
    icon: '👨‍🍳',
    popular: true
  },
  {
    id: 'menu-famiglia',
    name: 'Menu Famiglia',
    description: 'Family-style sharing menu for 4 people',
    duration: '1.5 hours',
    price: 80.00,
    items: ['antipasti-misti', 'pasta-carbonara', 'pizza-margherita', 'tiramisù'],
    icon: '👨‍👩‍👧‍👦',
    popular: false
  }
];

/**
 * Example promotions
 */
export const restaurantPromotionsExample = [
  {
    id: 'lunch-special',
    title: 'Pranzo del Giorno',
    description: 'Primo + Secondo + Contorno + Acqua',
    discount: {
      type: 'fixed' as const,
      value: 5.00
    },
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    applicableCategories: ['Primi Piatti', 'Secondi Piatti']
  }
];
