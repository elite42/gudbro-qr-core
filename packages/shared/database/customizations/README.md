# Database-Driven Product Customizations - Configuration Guide

## Overview

This system allows you to configure product customizations (size, milk type, extras, etc.) directly in the database, which are then rendered dynamically in the frontend. No more hardcoded customization logic!

## Architecture

```
Database (Product) → Frontend (DynamicCustomizationRenderer) → UI Components
```

### Key Components

1. **Database Types** (`types/index.ts`):
   - `ProductCustomization`: Configuration for a customization group
   - `CustomizationOption`: Individual option within a group
   - `CustomizationType`: 'radio' | 'checkbox' | 'quantity' | 'text'

2. **Frontend Renderers** (`frontend/components/customizations/`):
   - `RadioGroupCustomization`: Single-choice options
   - `CheckboxGroupCustomization`: Multiple-choice options
   - `QuantityCustomization`: Numeric input with +/- controls
   - `TextInputCustomization`: Free text input
   - `DynamicCustomizationRenderer`: Master orchestrator

3. **Product Configuration** (`database/customizations/*.ts`):
   - Customization definitions for each product type
   - Organized by product (e.g., `espresso-customizations.ts`)

## Proof of Concept: Caffè Espresso

Location: `database/customizations/espresso-customizations.ts`

The espresso product demonstrates all customization features:

### 1. Coffee Length (Radio - Required)
```typescript
{
  id: 'espresso-length',
  type: 'radio',
  required: true,
  options: [
    { id: 'corto', name: 'Short (Ristretto)', price_modifier: 0 },
    { id: 'normale', name: 'Normal', price_modifier: 0, is_default: true },
    { id: 'lungo', name: 'Long (Lungo)', price_modifier: 0 }
  ]
}
```

### 2. Cup Size (Radio - Optional)
```typescript
{
  id: 'espresso-cup-size',
  type: 'radio',
  required: false,
  options: [
    { id: 'piccola', name: 'Small Cup (60ml)', price_modifier: 0, is_default: true },
    { id: 'grande', name: 'Large Cup (120ml)', price_modifier: 0 }
  ]
}
```

### 3. Shot Count (Radio - Required with Price)
```typescript
{
  id: 'espresso-shot-count',
  type: 'radio',
  required: true,
  options: [
    { id: 'singolo', name: 'Single Shot', price_modifier: 0, is_default: true },
    { id: 'doppio', name: 'Double Shot', price_modifier: 15000 }
  ]
}
```

### 4. Consumption Location (Radio - Required)
```typescript
{
  id: 'espresso-consumption',
  type: 'radio',
  required: true,
  options: [
    { id: 'al-tavolo', name: 'Dine In', price_modifier: 0, is_default: true },
    { id: 'da-portare-via', name: 'Takeaway', price_modifier: 2000 }
  ]
}
```

### 5. Milk Addition (Radio - Optional with Multiple Prices)
```typescript
{
  id: 'espresso-milk',
  type: 'radio',
  required: false,
  options: [
    { id: 'no-milk', name: 'No Milk', price_modifier: 0, is_default: true },
    { id: 'cow-milk', name: 'Regular Milk', price_modifier: 5000 },
    { id: 'oat-milk', name: 'Oat Milk', price_modifier: 7000 },
    { id: 'soy-milk', name: 'Soy Milk', price_modifier: 7000 },
    { id: 'almond-milk', name: 'Almond Milk', price_modifier: 8000 }
  ]
}
```

### 6. Liquor Addition (Radio - Optional with License & Age Restriction)
```typescript
{
  id: 'espresso-liquor',
  type: 'radio',
  required: false,
  requires_license: 'alcohol',  // ⚠️ Requires alcohol license
  age_restricted: 18,             // ⚠️ 18+ only
  options: [
    { id: 'no-liquor', name: 'No Liquor', price_modifier: 0, is_default: true },
    { id: 'grappa', name: 'Grappa', price_modifier: 25000 },
    { id: 'sambuca', name: 'Sambuca', price_modifier: 25000 },
    { id: 'baileys', name: 'Baileys', price_modifier: 30000 },
    { id: 'amaretto', name: 'Amaretto', price_modifier: 25000 }
  ]
}
```

## How to Configure Your Product

### Step 1: Create Customization File

Create a new file in `database/customizations/` for your product:

```typescript
// database/customizations/your-product-customizations.ts
import type { ProductCustomization } from '../types';

export const yourProductCustomization: ProductCustomization = {
  id: 'your-customization-id',
  type: 'radio', // or 'checkbox', 'quantity', 'text'
  name: {
    en: 'English Name',
    it: 'Nome Italiano',
    vi: 'Tên Tiếng Việt'
  },
  description: {
    en: 'English description',
    it: 'Descrizione italiana',
    vi: 'Mô tả tiếng Việt'
  },
  required: true, // or false
  display_order: 1, // Lower numbers show first
  display_style: 'buttons', // or 'list', 'grid', 'dropdown'
  icon: '☕', // Optional emoji icon
  options: [
    {
      id: 'option-1',
      name: { en: 'Option 1', it: 'Opzione 1', vi: 'Tùy chọn 1' },
      description: { en: 'Description', it: 'Descrizione', vi: 'Mô tả' },
      price_modifier: 0,
      is_default: true,
      available: true
    }
  ]
};

export const yourProductCustomizations: ProductCustomization[] = [
  yourProductCustomization,
  // ... more customizations
];
```

### Step 2: Add to Product

In `database/products/your-products.ts`:

```typescript
import { yourProductCustomizations } from '../customizations/your-product-customizations';

export const yourProduct: Product = {
  id: 'PROD_YOUR_PRODUCT',
  // ... other product fields
  customizations: yourProductCustomizations,
  // ... metadata
};
```

### Step 3: Frontend Will Automatically Render

The `DynamicCustomizationRenderer` component automatically handles rendering. No frontend code changes needed!

## Customization Types

### 1. Radio (Single Choice)

Use for: Size selection, milk type, coffee strength

```typescript
type: 'radio'
required: true/false
options: CustomizationOption[]
```

Frontend: Renders as button group or list with radio buttons

### 2. Checkbox (Multiple Choice)

Use for: Pizza toppings, extras, add-ons

```typescript
type: 'checkbox'
required: false
min_selections?: 2 // Minimum number of selections
max_selections?: 5 // Maximum number of selections
options: CustomizationOption[]
```

Frontend: Renders as checkbox list with selection counter

### 3. Quantity (Numeric Input)

Use for: Sugar level, spice level, extra shots

```typescript
type: 'quantity'
quantity_config: {
  min: 0,
  max: 5,
  step: 1,
  default: 2,
  unit: { en: 'spoons', it: 'cucchiaini', vi: 'thìa' }
}
```

Frontend: Renders as +/- controls with progress bar

### 4. Text (Free Input)

Use for: Special instructions, name on cup, gift message

```typescript
type: 'text'
required: false
options?: [] // Optional suggestions
```

Frontend: Renders as textarea with character counter

## Advanced Features

### Price Modifiers

Each option can have a price modifier (positive, negative, or zero):

```typescript
options: [
  { id: 'free', price_modifier: 0 },       // No change
  { id: 'extra', price_modifier: 10000 },  // Add ₫10,000
  { id: 'discount', price_modifier: -5000 } // Subtract ₫5,000
]
```

### License Requirements

For alcohol, tobacco, or other regulated items:

```typescript
requires_license: 'alcohol' // or 'tobacco', 'custom'
age_restricted: 18 // Minimum age in years
```

Frontend displays warning badges

### Multi-Language Support

All text fields support multiple languages:

```typescript
name: {
  en: 'English',
  it: 'Italiano',
  vi: 'Tiếng Việt'
}
```

### Display Styles

Control how options are presented:

```typescript
display_style: 'buttons' // Large touch-friendly buttons
display_style: 'list'    // Compact radio/checkbox list
display_style: 'grid'    // 2-3 column grid with images
display_style: 'dropdown' // Compact dropdown menu
```

### Hidden by Default

For advanced options:

```typescript
hidden_by_default: true // Shows in "Advanced Options" accordion
```

### Category/Product Filtering

Apply customizations only to specific categories or products:

```typescript
applies_to_categories: ['coffee', 'bevande']
applies_to_products: ['PROD_ESPRESSO', 'PROD_AMERICANO']
```

## Frontend Integration

### Basic Usage

```typescript
import { DynamicCustomizationRenderer, CustomizationState } from '@/components/customizations';

const [customizationState, setCustomizationState] = useState<CustomizationState>({});

const handleChange = (id: string, value: string | string[] | number) => {
  setCustomizationState(prev => ({ ...prev, [id]: value }));
};

<DynamicCustomizationRenderer
  customizations={product.customizations}
  state={customizationState}
  onChange={handleChange}
  language="it"
/>
```

### Validation

```typescript
import { validateCustomizations } from '@/components/customizations';

const { isValid, errors } = validateCustomizations(
  product.customizations,
  customizationState
);

if (!isValid) {
  console.error('Validation errors:', errors);
}
```

### Price Calculation

```typescript
import { calculateCustomizationPrice } from '@/components/customizations';

const priceModifier = calculateCustomizationPrice(
  product.customizations,
  customizationState
);

const finalPrice = product.price + priceModifier;
```

## Best Practices

### 1. Use Meaningful IDs

```typescript
// ✅ Good
id: 'espresso-milk-type'

// ❌ Bad
id: 'custom1'
```

### 2. Set Sensible Defaults

Always mark one option as `is_default: true` for radio groups

### 3. Group Related Customizations

Use `display_order` to keep related options together

### 4. Provide Descriptions

Help customers understand each option:

```typescript
description: {
  en: 'Concentrated, intense flavor (20ml)',
  it: 'Concentrato, sapore intenso (20ml)'
}
```

### 5. Use Icons Sparingly

Icons add visual interest but don't overuse them:

```typescript
icon: '☕' // Coffee-related customization
icon: '🥛' // Milk-related customization
icon: '🎯' // Shot count
icon: '🏠' // Dine in / Takeaway
```

### 6. Consider Mobile UX

Use `display_style: 'buttons'` for touch-friendly interfaces

### 7. Test Edge Cases

- Required fields with no default
- Min/max selections for checkboxes
- Price calculations with negative modifiers
- License restrictions

## Next Steps

### Phase 1: Core Products ✅
- [x] Espresso (proof-of-concept complete)

### Phase 2: Coffee Category
- [ ] Americano
- [ ] Cappuccino
- [ ] Latte
- [ ] Flat White
- [ ] Mocha

### Phase 3: Other Categories
- [ ] Pizza (toppings, crust)
- [ ] Primi (pasta types, sauces)
- [ ] Secondi (cooking style, sides)
- [ ] Piatti Unici (burger, sushi)
- [ ] Bevande (size, ice)
- [ ] Smoothies & Bowls (add-ons)

### Phase 4: Backoffice UI
- [ ] Design customization management interface
- [ ] Implement CRUD operations
- [ ] Add preview functionality
- [ ] Multi-language editor

## Questions?

See `/database/customizations/espresso-customizations.ts` for a complete working example.

The system is designed to be flexible and extendable. If you need a feature that's not covered here, the types in `types/index.ts` can be extended without breaking existing customizations.

---

**Generated**: 2025-11-11
**Version**: 1.0.0
**Status**: Production Ready ✅
