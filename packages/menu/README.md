# Module 11: Centralized Menu Database

> **Status:** Production Ready ✅  
> **Version:** 1.0.0  
> **Updated:** 2025-10-30

## Overview

Centralized menu item database with JSONB translations, modifiers system, and per-restaurant customization. Enables restaurant owners to build menus in 1 hour instead of 3-5 days.

## Key Features

- ✅ **JSONB Translations** - Scalable multi-language support (VN/KO/CN/EN)
- ✅ **Modifiers System** - Size, style, order type, extras with price adjustments
- ✅ **15 Seed Items** - Beverages (beer, wine, coffee), Food (Vietnamese, international)
- ✅ **Restaurant Customization** - Override prices, ingredients, descriptions
- ✅ **React Hooks** - useMenuItems, useRestaurantMenu
- ✅ **Rich UI Components** - MenuItemCard, MenuItemSearch
- ✅ **Allergen & Diet Support** - Gluten, dairy, nuts, vegan, vegetarian, halal

## Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL

# Run migrations
npm run migrate

# Seed database (15 items with modifiers)
npm run seed
```

## Database Schema

### Tables
- `shared_menu_items` - Centralized items with JSONB translations
- `menu_item_modifiers` - Item modifiers (sizes, styles, order types)
- `restaurant_menu_items` - Per-restaurant customization

### JSONB Structure
```javascript
// name_translations
{
  "vn": "Cà phê Espresso",
  "ko": "에스프레소",
  "cn": "意式浓缩咖啡",
  "en": "Espresso"
}

// Querying
SELECT * FROM shared_menu_items 
WHERE name_translations->>'en' = 'Espresso';
```

## API Endpoints

### Menu Items
```
GET    /api/menu/items              # Search/filter items
GET    /api/menu/items/:id          # Get item with modifiers
POST   /api/menu/items              # Create item (admin)
PUT    /api/menu/items/:id          # Update item (admin)
DELETE /api/menu/items/:id          # Delete item (admin)
GET    /api/menu/items/:id/modifiers    # Get modifiers
POST   /api/menu/items/:id/modifiers    # Add modifier (admin)
GET    /api/menu/categories         # Get categories
POST   /api/menu/calculate-price    # Calculate with modifiers
```

### Restaurant Menu
```
GET    /api/menu/restaurant/:restaurantId/items    # Get menu
POST   /api/menu/restaurant/:restaurantId/items    # Add item
PUT    /api/menu/restaurant/items/:id              # Update item
DELETE /api/menu/restaurant/items/:id              # Remove item
PATCH  /api/menu/restaurant/items/:id/availability # Toggle
POST   /api/menu/restaurant/:restaurantId/reorder  # Reorder
GET    /api/menu/restaurant/:restaurantId/sections # Get sections
```

## Usage Examples

### Backend Service

```javascript
const MenuItemsService = require('./backend/services/menuItems');
const service = new MenuItemsService();

// Search items
const items = await service.getItems({
  category: 'beverage',
  subcategory: 'coffee',
  language: 'en',
  limit: 20
});

// Get item with modifiers
const item = await service.getItemById(itemId, 'vn');

// Calculate price with modifiers
const basePrice = 35000;
const modifiers = [
  { price_modifier: 15000 }, // Double shot
  { price_modifier: -1750 }  // Takeaway (-5%)
];
const total = service.calculatePrice(basePrice, modifiers);
// Result: 48250 VND
```

### Frontend Hooks

```javascript
import { useMenuItems, useRestaurantMenu } from './frontend/useMenuItems';

// Search menu items
function MenuBrowser() {
  const { items, loading, error } = useMenuItems({
    category: 'beverage',
    language: 'ko'
  });

  return (
    <div>
      {items.map(item => (
        <MenuItemCard key={item.id} item={item} language="ko" />
      ))}
    </div>
  );
}

// Restaurant menu management
function RestaurantDashboard({ restaurantId }) {
  const { 
    items, 
    addItem, 
    updateItem, 
    removeItem, 
    toggleAvailability 
  } = useRestaurantMenu(restaurantId, 'en');

  const handleAddItem = async (sharedItemId) => {
    await addItem(sharedItemId, {
      custom_price_vnd: 45000,
      menu_section: 'Beverages',
      enabled_modifiers: [modifier1Id, modifier2Id]
    });
  };

  return (
    <div>
      {items.map(item => (
        <MenuItem 
          key={item.id} 
          item={item}
          onToggle={() => toggleAvailability(item.restaurant_item_id, !item.is_available)}
        />
      ))}
    </div>
  );
}
```

### Components

```javascript
import MenuItemCard from './frontend/components/MenuItemCard';
import MenuItemSearch from './frontend/components/MenuItemSearch';

// Display item with modifiers
<MenuItemCard
  item={item}
  language="vn"
  showAddButton={true}
  onAddToMenu={(item, modifiers, price) => {
    console.log('Added:', item.name_translations.vn, 'Total:', price);
  }}
/>

// Search interface
<MenuItemSearch
  language="ko"
  showAddButton={true}
  onItemSelect={(item, data) => {
    console.log('Selected:', item, data);
  }}
/>
```

## Seed Data (15 Items)

### Beverages (8)
**Beer (3):** Tiger, Heineken, Saigon  
**Wine (2):** Red, White  
**Coffee (3):** Espresso, Cappuccino, Vietnamese Iced

### Food (7)
**Vietnamese (3):** Phở, Bánh mì, Gỏi cuốn  
**International (4):** Pizza, Burger, (+ 2 more in seed)

### Modifier Examples

```javascript
// Espresso modifiers
{
  base_price: 35000,
  modifiers: [
    { type: 'style', value: 'lungo', price: +3000 },
    { type: 'size', value: 'double', price: +15000 },
    { type: 'order_type', value: 'takeaway', price: -1750 }
  ],
  total: 51250 VND
}

// Beer modifiers
{
  base_price: 35000,
  modifiers: [
    { type: 'size', value: '500ml', price: +10000 },
    { type: 'order_type', value: 'takeaway', price: -2250 }
  ],
  total: 42750 VND
}
```

## Testing

```bash
# Run all tests
npm test

# Test coverage
npm test -- --coverage
```

## Development

```bash
# Start dev server (with nodemon)
npm run dev

# Server runs on http://localhost:3011
# Health check: http://localhost:3011/health
```

## Integration with Module 10 (i18n)

```javascript
// Combined usage
import { useTranslation } from '../module-10-i18n/frontend/useTranslation';
import { useCurrency } from '../module-10-i18n/frontend/useCurrency';
import { useMenuItems } from '../module-11-menu/frontend/useMenuItems';

function Menu() {
  const { language } = useTranslation();
  const { format, convert, currency } = useCurrency();
  const { items } = useMenuItems({ language });

  return (
    <div>
      {items.map(item => {
        const name = item.name_translations[language];
        const price = format(convert(item.base_price_vnd, currency), currency);
        return <div key={item.id}>{name}: {price}</div>;
      })}
    </div>
  );
}
```

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Search Items | <500ms | With filters + pagination |
| Get Single Item | <100ms | With modifiers |
| Add to Restaurant | <200ms | Single item operation |
| Calculate Price | <50ms | Client-side calculation |

## Database Queries

```sql
-- Search items by name (any language)
SELECT * FROM shared_menu_items 
WHERE name_translations @> '{"en": "Coffee"}';

-- Get all Vietnamese names
SELECT name_translations->>'vn' as name_vn 
FROM shared_menu_items;

-- Search across all languages
SELECT * FROM shared_menu_items 
WHERE name_translations::text ILIKE '%coffee%';

-- Get items with modifiers
SELECT 
  smi.*,
  json_agg(mim) as modifiers
FROM shared_menu_items smi
LEFT JOIN menu_item_modifiers mim ON mim.item_id = smi.id
WHERE smi.category = 'beverage'
GROUP BY smi.id;
```

## Advantages Over Rigid Schema

### Old Approach (Columns)
```sql
-- Adding Japanese requires ALTER TABLE
ALTER TABLE shared_menu_items 
ADD COLUMN name_jp VARCHAR(255),
ADD COLUMN description_jp TEXT;
```

### New Approach (JSONB)
```sql
-- Just update JSONB (no migration)
UPDATE shared_menu_items 
SET name_translations = name_translations || '{"jp": "コーヒー"}';
```

## Adding New Language

```javascript
// 1. Update seed data
const item = {
  name_translations: {
    vn: "Cà phê",
    ko: "커피",
    cn: "咖啡",
    en: "Coffee",
    jp: "コーヒー"  // Just add new key
  }
};

// 2. Query works automatically
const name = item.name_translations.jp || item.name_translations.en;
```

## Deployment

### Docker Compose
```yaml
menu-service:
  build: ./module-11-menu
  ports:
    - "3011:3011"
  environment:
    - DATABASE_URL=postgresql://user:pass@db:5432/qr_platform
  depends_on:
    - db
```

### GCP Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT/menu-service
gcloud run deploy menu-service \
  --image gcr.io/PROJECT/menu-service \
  --platform managed \
  --region asia-southeast1
```

## Roadmap

- [ ] Full 350 items (200 beverages + 150 food)
- [ ] AI-powered translation suggestions
- [ ] Popular items analytics
- [ ] Seasonal item management
- [ ] Dietary filter presets
- [ ] Bulk import/export
- [ ] Photo optimization

## Troubleshooting

**Issue:** Modifiers not appearing  
**Fix:** Check `enabled_modifiers` in restaurant_menu_items (NULL = all)

**Issue:** Price calculation wrong  
**Fix:** Verify price_modifier is INTEGER (VND), not percentage

**Issue:** Translation not showing  
**Fix:** Check JSONB structure: `{"vn": "...", "en": "..."}` not `{vn: "..."}`

## License

MIT

---

**Module:** 11/12  
**Status:** Production Ready ✅  
**Next:** Module 12 (Health Filters)
