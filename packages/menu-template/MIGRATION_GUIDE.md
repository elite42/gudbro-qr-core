# Migration Guide - Vertical to Menu Template

This guide documents the process and patterns discovered while migrating the wellness vertical to use the `@gudbro/menu-template` system.

## Overview

The migration process involves:
1. Creating a vertical-specific configuration file
2. Updating pages to use centralized config
3. Replacing inline values with config references
4. Testing the integration

## Step-by-Step Migration Process

### 1. Create Vertical Configuration

**File**: `packages/{vertical}/frontend/config/{vertical}.config.ts`

```typescript
import { VerticalConfig } from '../../../menu-template/types';

export const {vertical}Config: VerticalConfig = {
  vertical: 'wellness', // or 'restaurant', 'hotel', etc.
  name: 'Business Name',

  business: {
    name: 'Business Name',
    logo: 'https://...',
    tagline: 'Your tagline',
    description: 'Business description'
  },

  contact: {
    phone: '+XX XXX XXX XXX',
    zaloId: 'XXXXXXX',
    whatsappNumber: '+XXXXXXXXXXX',
    email: 'info@business.com'
  },

  social: {
    facebook: 'https://facebook.com/...',
    instagram: 'https://instagram.com/...',
    tiktok: 'https://tiktok.com/@...'
  },

  location: {
    address: 'Your address',
    googleMapsUrl: 'https://maps.google.com/?q=...',
    coordinates: { lat: XX.XXXX, lng: XX.XXXX }
  },

  reviews: {
    googleReviewUrl: 'https://g.page/r/.../review',
    tripadvisorUrl: 'https://tripadvisor.com/...'
  },

  paymentMethods: ['Cash', 'Card', 'MoMo', 'ZaloPay', 'GrabPay'],

  ui: {
    itemCard: {
      components: ['duration', 'price', 'image'], // Vertical-specific
      showExtras: false // true for restaurants, false for spas
    },
    filters: ['category', 'duration', 'price'],
    bookingFlow: 'direct-contact', // or 'cart-based', 'form-based'
    labels: {
      items: 'Trattamenti', // Customize per vertical
      category: 'Tipo',
      price: 'Tariffa',
      duration: 'Durata',
      search: 'Cerca servizi',
      packages: 'Pacchetti VIP',
      promotions: 'Promozioni',
      bookNow: 'Prenota su Zalo'
    },
    theme: {
      primary: '#EC4899',
      secondary: '#A855F7',
      accent: '#F59E0B'
    }
  },

  features: {
    enableLanguageSelector: true,
    enableCurrencyConverter: true,
    enableSearch: true,
    enablePackages: true,
    enablePromotions: true
  },

  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: [
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
      // ... more languages
    ],
    defaultCurrency: 'VND',
    supportedCurrencies: ['VND', 'USD', 'EUR']
  }
};

// Helper functions
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013/api/{vertical}';
}

export const HUB_ID = 'your-hub-id';
```

### 2. Update Page Imports

**Before:**
```typescript
const businessConfig = {
  businessName: 'My Business',
  logo: '...',
  // ... 50+ lines of inline config
};
const languages = [...];
const currencies = [...];
```

**After:**
```typescript
import { wellnessConfig } from '../config/wellness.config';

export default function HomePage() {
  const [language, setLanguage] = useState(wellnessConfig.i18n?.defaultLanguage || 'en');
  const [currency, setCurrency] = useState(wellnessConfig.i18n?.defaultCurrency || 'VND');

  // Destructure for easier access
  const { business, contact, social, location, reviews, paymentMethods, i18n, ui } = wellnessConfig;

  // ... rest of component
}
```

### 3. Replace Inline Values with Config References

Common replacements discovered during wellness migration:

| Before | After | Section |
|--------|-------|---------|
| `businessConfig.logo` | `business.logo` | Header |
| `businessConfig.businessName` | `business.name` | Header |
| `businessConfig.tagline` | `business.tagline` | Header |
| `businessConfig.facebook` | `social?.facebook` | Social Links |
| `businessConfig.instagram` | `social?.instagram` | Social Links |
| `businessConfig.tiktok` | `social?.tiktok` | Social Links |
| `languages.map(...)` | `(i18n?.supportedLanguages \|\| []).map(...)` | Language Selector |
| `currencies.map(...)` | `(i18n?.supportedCurrencies \|\| []).map(...)` | Currency Selector |
| `businessConfig.googleReviewUrl` | `reviews?.googleReviewUrl` | Reviews |
| `businessConfig.tripadvisorUrl` | `reviews?.tripadvisorUrl` | Reviews |
| `businessConfig.zaloId` | `contact?.zaloId` | Contact Links |
| `businessConfig.whatsappNumber` | `contact?.whatsappNumber` | Contact Links |
| `businessConfig.phone` | `contact?.phone` | Contact Links |
| `businessConfig.paymentMethods` | `paymentMethods` | Payment Methods |
| `businessConfig.googleMapsUrl` | `location?.googleMapsUrl` | Location |
| `businessConfig.address` | `location?.address` | Location |

### 4. Handle Optional Chaining

**Important**: Always use optional chaining (`?.`) for nested config properties:

```typescript
// ✅ GOOD - Safe with optional chaining
<a href={social?.facebook}>...</a>
{(i18n?.supportedLanguages || []).map(...)}
<p>{location?.address}</p>

// ❌ BAD - Will crash if config section is undefined
<a href={social.facebook}>...</a>
{i18n.supportedLanguages.map(...)}
<p>{location.address}</p>
```

### 5. Handle Arrays Safely

Always provide fallback empty arrays:

```typescript
// ✅ GOOD
{(i18n?.supportedLanguages || []).map(lang => (...))}
{paymentMethods.map(method => (...))}

// ❌ BAD - Crashes if undefined
{i18n?.supportedLanguages.map(lang => (...))}
```

### 6. Test the Integration

After migration:
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `npm run dev`
3. Verify page loads without errors
4. Check browser console for runtime errors
5. Test all interactive elements (selectors, links, etc.)

## Common Patterns

### Pattern 1: Config Destructuring

Always destructure config at component level for cleaner code:

```typescript
export default function HomePage() {
  const { business, contact, social, location, reviews, paymentMethods, i18n, ui } = wellnessConfig;

  return (
    <div>
      <h1>{business.name}</h1>
      <p>{business.tagline}</p>
    </div>
  );
}
```

### Pattern 2: Default Values for State

Use config defaults for language and currency state:

```typescript
const [language, setLanguage] = useState(wellnessConfig.i18n?.defaultLanguage || 'en');
const [currency, setCurrency] = useState(wellnessConfig.i18n?.defaultCurrency || 'VND');
```

### Pattern 3: Conditional Rendering Based on Config

Use feature flags and optional sections:

```typescript
{wellnessConfig.features?.enableLanguageSelector && (
  <select>
    {(i18n?.supportedLanguages || []).map(lang => (...))}
  </select>
)}

{social?.facebook && (
  <a href={social.facebook}>Facebook</a>
)}
```

### Pattern 4: Payment Method Icons

Map payment methods to icons:

```typescript
{paymentMethods.map((method, idx) => (
  <span key={idx}>
    {method === 'Cash' && '💵'}
    {method === 'Card' && '💳'}
    {method === 'MoMo' && '📱'}
    {method === 'ZaloPay' && '💰'}
    {method === 'GrabPay' && '🚗'}
    {' '}{method}
  </span>
))}
```

## Vertical-Specific Considerations

### Wellness/Spa
- **Booking flow**: `direct-contact` (no cart needed)
- **Item components**: `['duration', 'price', 'image']`
- **Filters**: `['category', 'duration', 'price']`
- **Extras**: `showExtras: false`
- **Metadata**: `duration`, `therapists`, `contraindications`

### Restaurant
- **Booking flow**: `cart-based` (add to cart before ordering)
- **Item components**: `['allergens', 'spicy', 'dietary', 'price', 'image']`
- **Filters**: `['category', 'dietary', 'allergens', 'spicy', 'price']`
- **Extras**: `showExtras: true`
- **Metadata**: `allergens`, `spicyLevel`, `dietary`, `extras`, `preparationTime`

### Hotel
- **Booking flow**: `form-based` (fill form before confirmation)
- **Item components**: `['roomType', 'amenities', 'capacity', 'price', 'image']`
- **Filters**: `['roomType', 'capacity', 'amenities', 'price']`
- **Extras**: `showExtras: false`
- **Metadata**: `roomType`, `capacity`, `amenities`, `bedConfiguration`

## Benefits of This Approach

1. **Single Source of Truth**: All config in one file
2. **Type Safety**: TypeScript validates config structure
3. **Reusability**: Same pattern works for all verticals
4. **Maintainability**: Easy to update business info
5. **Testability**: Can swap configs for testing
6. **Scalability**: New verticals follow same pattern

## Next Steps

After completing migration:
1. Extract common UI components to `@gudbro/menu-template`
2. Create vertical-specific components as needed
3. Implement i18n translation system
4. Add currency conversion functionality
5. Document vertical-specific metadata patterns

## Troubleshooting

### Issue: "Cannot read property 'X' of undefined"
**Solution**: Add optional chaining (`?.`) to config access

### Issue: "X.map is not a function"
**Solution**: Add fallback empty array: `(config?.array || []).map(...)`

### Issue: Fast Refresh full reload
**Solution**: Normal during migration, should stabilize after initial compile

### Issue: Config changes not reflecting
**Solution**: Clear `.next` cache and restart dev server

## Lessons Learned

1. **Always use optional chaining** for nested config properties
2. **Provide fallback values** for arrays and state initialization
3. **Destructure config early** in component for cleaner code
4. **Test thoroughly** after migration, especially interactive elements
5. **Document vertical differences** for future reference

---

**Migration completed successfully for wellness vertical on 2025-11-06**
