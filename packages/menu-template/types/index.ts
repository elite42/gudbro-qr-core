/**
 * Menu Template - Type Definitions
 * Base types for all menu-based verticals (restaurants, spas, hotels, etc.)
 */

// ==================== BASE ITEM ====================
export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;

  // Metadata flessibile - ogni verticale aggiunge i suoi campi
  metadata?: Record<string, any>;
}

// ==================== VERTICAL CONFIG ====================
export interface VerticalConfig {
  // Informazioni verticale
  vertical: 'restaurant' | 'wellness' | 'hotel' | 'retail' | 'custom';
  name: string;

  // Business info
  business: {
    name: string;
    logo?: string;
    tagline?: string;
    description?: string;
  };

  // Contact info
  contact: {
    phone?: string;
    zaloId?: string;
    whatsappNumber?: string;
    email?: string;
  };

  // Social media
  social?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };

  // Location
  location?: {
    address: string;
    googleMapsUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Reviews
  reviews?: {
    googleReviewUrl?: string;
    tripadvisorUrl?: string;
    yelpUrl?: string;
  };

  // Payment methods
  paymentMethods: string[];

  // UI Configuration
  ui: {
    // Item card components to show
    itemCard: {
      components: string[];
      showExtras?: boolean;
    };

    // Available filters
    filters: string[];

    // Booking flow type
    bookingFlow: 'cart-based' | 'direct-contact' | 'form-based';

    // Custom labels/terminology
    labels: {
      items: string;
      category: string;
      price: string;
      [key: string]: string;
    };

    // Theme colors
    theme?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };

  // Feature flags
  features?: {
    enableLanguageSelector?: boolean;
    enableCurrencyConverter?: boolean;
    enableSearch?: boolean;
    enablePackages?: boolean;
    enablePromotions?: boolean;
  };

  // Language & Currency
  i18n?: {
    defaultLanguage: string;
    supportedLanguages: Language[];
    defaultCurrency: string;
    supportedCurrencies: string[];
  };
}

// ==================== LANGUAGE ====================
export interface Language {
  code: string;
  flag: string;
  name: string;
}

// ==================== PACKAGE/COMBO ====================
export interface Package {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  price: number;
  items: string[]; // IDs of items included
  icon?: string;
  popular?: boolean;
}

// ==================== CATEGORY ====================
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
}

// ==================== PROMOTION ====================
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  validFrom?: string;
  validTo?: string;
  applicableItems?: string[]; // IDs
  applicableCategories?: string[]; // Category IDs
}

// ==================== COMPONENT PROPS ====================
export interface ItemCardProps {
  item: BaseItem;
  config: VerticalConfig;
  onClick?: () => void;
}

export interface HeaderProps {
  config: VerticalConfig;
  onLanguageChange?: (lang: string) => void;
  onCurrencyChange?: (currency: string) => void;
}

export interface BottomNavProps {
  config: VerticalConfig;
  currentPath: string;
}

export interface ContactCardProps {
  contact: VerticalConfig['contact'];
  labels?: Record<string, string>;
}

export interface MapCardProps {
  location: VerticalConfig['location'];
  labels?: Record<string, string>;
}

export interface ReviewsCardProps {
  reviews: VerticalConfig['reviews'];
  labels?: Record<string, string>;
}

export interface PaymentMethodsCardProps {
  methods: string[];
  labels?: Record<string, string>;
}

// ==================== HOOK RETURN TYPES ====================
export interface UseVerticalConfigReturn {
  config: VerticalConfig;
  loading: boolean;
  error: Error | null;
}

export interface UseItemsReturn {
  items: BaseItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseCurrencyConverterReturn {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number, from?: string, to?: string) => number;
}

export interface UseLanguageReturn {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}
