# @gudbro/menu-template

Reusable menu template system for all Gudbro verticals (restaurants, spas, hotels, retail, etc.)

## 🎯 Purpose

This package provides a **flexible, config-driven template** that can be customized for any business vertical with a catalog of items/services. It eliminates code duplication across verticals while allowing each to have its specific requirements.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      @gudbro/menu-template              │
│  (Base Template - 80% shared code)     │
│                                         │
│  - Type definitions                    │
│  - Config system                       │
│  - Base components                     │
│  - Common UI patterns                  │
└─────────────────────────────────────────┘
              ↓ extends
    ┌─────────┴───────┬──────────────┐
    │                 │              │
┌───────────┐  ┌──────────┐  ┌─────────────┐
│ Wellness  │  │Restaurant│  │   Hotel     │
│ Vertical  │  │ Vertical │  │  Vertical   │
│           │  │          │  │             │
│ +Duration │  │+Allergens│  │ +Room Types │
│ +Therapist│  │ +Spicy   │  │ +Amenities  │
│           │  │ +Extras  │  │             │
└───────────┘  └──────────┘  └─────────────┘
```

## ✨ Key Features

### 1. **Flexible Metadata System**
Each item can have custom metadata based on the vertical:

- **Wellness**: `duration`, `therapists`, `contraindications`
- **Restaurant**: `allergens`, `spicy`, `dietary`, `extras`
- **Hotel**: `roomType`, `amenities`, `capacity`

### 2. **Config-Driven UI**
Configure which components to show without changing code:

```typescript
ui: {
  itemCard: {
    components: ['allergens', 'spicy', 'price'], // What to show
    showExtras: true // Enable extras selector
  }
}
```

### 3. **Multiple Booking Flows**
- `direct-contact`: Contact via Zalo/WhatsApp (Wellness, Services)
- `cart-based`: Add to cart before checkout (Restaurants, Retail)
- `form-based`: Fill form before confirmation (Hotels, Tours)

### 4. **Built-in i18n & Currency Converter**
Multi-language support and real-time currency conversion

## 📦 Installation

```bash
cd packages/your-vertical
npm install @gudbro/menu-template
```

## 🚀 Quick Start

### 1. Create Your Vertical Config

```typescript
// packages/wellness/config/wellness.config.ts
import { VerticalConfig } from '@gudbro/menu-template/types';

export const config: VerticalConfig = {
  vertical: 'wellness',
  name: 'My Spa',

  business: {
    name: 'My Spa',
    tagline: 'Relax & Rejuvenate'
  },

  contact: {
    phone: '+84 xxx',
    zaloId: 'xxxxx'
  },

  ui: {
    itemCard: {
      components: ['duration', 'price'],
      showExtras: false
    },
    bookingFlow: 'direct-contact',
    labels: {
      items: 'Treatments',
      category: 'Type'
    }
  },

  // ... more config
};
```

### 2. Define Your Items with Metadata

```typescript
// Wellness example
const service = {
  id: 'thai-massage',
  name: 'Thai Massage',
  price: 350000,
  category: 'Massage',
  metadata: {
    duration: 60,
    therapists: ['therapist-1']
  }
};

// Restaurant example
const dish = {
  id: 'carbonara',
  name: 'Pasta Carbonara',
  price: 12.50,
  category: 'Primi',
  metadata: {
    allergens: ['gluten', 'eggs', 'dairy'],
    spicyLevel: 0,
    extras: [
      { name: 'Extra cheese', price: 2.00 }
    ]
  }
};
```

### 3. Use Template Components

```typescript
import { Header, ItemCard, BottomNav } from '@gudbro/menu-template';
import { config } from './config/wellness.config';

export default function Page() {
  return (
    <>
      <Header config={config} />

      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          config={config}
        />
      ))}

      <BottomNav config={config} />
    </>
  );
}
```

## 📋 Migration Guide

If you're migrating an existing vertical to use this template system, see the comprehensive [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) which includes:

- Step-by-step migration process
- Common patterns and best practices
- Config replacement reference table
- Vertical-specific considerations
- Troubleshooting guide

The wellness vertical has been successfully migrated and serves as a real-world example.

## 📋 Examples

See the `config/` folder for complete examples:
- `wellness.example.ts` - Spa/Massage center configuration
- `restaurant.example.ts` - Restaurant/Bar configuration

## 🎨 Customization

### Custom Components

Create vertical-specific components:

```typescript
// packages/restaurant/components/AllergenBadges.tsx
export function AllergenBadges({ allergens }: { allergens: string[] }) {
  return (
    <div className="flex gap-1">
      {allergens.map(a => (
        <span key={a} className="badge">
          {allergenIcons[a]} {a}
        </span>
      ))}
    </div>
  );
}
```

Then use it in your item card:

```typescript
<ItemCard item={item} config={config}>
  {item.metadata.allergens && (
    <AllergenBadges allergens={item.metadata.allergens} />
  )}
</ItemCard>
```

## 🔧 Backend Integration

The backend should support flexible metadata:

```typescript
// API endpoint
GET /api/:vertical/:hubId/items

// Response
{
  "data": {
    "items": [
      {
        "id": "item-1",
        "name": "Service Name",
        "price": 100,
        "category": "Category",
        "metadata": {
          // Any custom fields for this vertical
          "duration": 60,
          "allergens": ["gluten"]
        }
      }
    ]
  }
}
```

## 🌍 Supported Verticals

| Vertical | Status | Key Features |
|----------|--------|--------------|
| Wellness/Spa | ✅ Complete | Duration, Therapists, Contraindications |
| Restaurant | 🚧 Planned | Allergens, Spicy, Dietary, Extras |
| Hotel | 📋 TODO | Room Types, Amenities, Capacity |
| Retail | 📋 TODO | Sizes, Colors, Stock |
| Tours | 📋 TODO | Schedule, Group Size, Difficulty |

## 📚 Type Definitions

See `types/index.ts` for complete TypeScript definitions:
- `BaseItem` - Base item structure
- `VerticalConfig` - Configuration interface
- `Package` - Combo/package definition
- `Promotion` - Promotion/discount definition

## 🤝 Contributing

When adding a new vertical:

1. Create config in `config/your-vertical.example.ts`
2. Define metadata structure in comments
3. Create vertical-specific components
4. Update this README with your vertical info

## 📝 License

MIT

---

Built with ❤️ by Gudbro Team
