# GUDBRO Centralized Database System

**Version 1.0.0** | **GUDBRO Sistema 51 Filtri v2.0**

## Overview

The GUDBRO Centralized Database is a **strategic moat** for the platform - a comprehensive ingredient and product database that automatically computes allergens, intolerances, and dietary compatibility. This system serves as the foundation for Coffee Shops, Restaurants, and Street Food products.

### Key Innovation

**Managers only select ingredients** → System automatically calculates:
- ✅ 30 Allergens (EU 14 + Korea 7 + Japan 7 + GUDBRO 2)
- ✅ 10 Intolerances (Lactose, Gluten/Celiac, FODMAP, MSG, etc.)
- ✅ 11 Dietary Restrictions (Buddhist, Halal, Kosher, Vegan, etc.)
- ✅ 5 Spice Levels (with Scoville ratings)
- ✅ Multi-nation compliance (EU, USA, Korea, Japan, 9+ nations)

## Why This Matters

### 1. **Safety First**
Reduces human error on **potentially LETHAL allergies**. No manual entry of allergen data means fewer mistakes.

### 2. **Ease of Use**
Managers simply select ingredients from a dropdown. All safety data is computed automatically.

### 3. **Multi-Nation Compliance**
Automatic compliance with food safety regulations in:
- 🇪🇺 European Union (EU Regulation 1169/2011)
- 🇺🇸 USA (FDA FALCPA + Big 9)
- 🇰🇷 Korea (21 allergens)
- 🇯🇵 Japan (28 mandatory + recommended)
- Plus: Canada, Australia, China, Singapore, Vietnam

### 4. **Strategic Moat**
- **Network Effects**: More merchants → More ingredients → Better database → More merchants
- **First-Mover Advantage**: Hard to replicate without years of data collection
- **Cross-Vertical Leverage**: Same database serves multiple product types
- **B2B Monetization**: Premium ingredients, recipe marketplace, analytics

## Architecture

```
packages/shared/database/
├── types/                    # TypeScript type definitions
│   └── index.ts             # All types (30 allergens, 10 intolerances, 11 diets)
├── ingredients/             # Ingredient database
│   └── common-ingredients.ts # 28 initial ingredients
├── products/                # Product templates
│   └── example-products.ts  # 4 example products from ROOTS menu
├── utils/                   # Auto-computation functions
│   └── auto-compute.ts      # Core auto-computation logic
├── index.ts                 # Main entry point
└── README.md               # This file
```

## GUDBRO Sistema 51 Filtri v2.0

### 30 Allergens

#### EU 14 Mandatory (EU Regulation 1169/2011)
1. Gluten (wheat, rye, barley, oats)
2. Crustaceans
3. Eggs
4. Fish
5. Peanuts
6. Soybeans
7. Milk (including lactose)
8. Nuts (almonds, hazelnuts, walnuts, cashews, etc.)
9. Celery
10. Mustard
11. Sesame seeds
12. Sulphur dioxide and sulphites >10mg/kg
13. Lupin
14. Molluscs

#### Korea +7 Additional
15. Pork (돼지고기)
16. Peach (복숭아)
17. Tomato (토마토)
18. Beef (쇠고기)
19. Chicken (닭고기)
20. Squid (오징어)
21. Pine nuts (잣)

#### Japan +7 Additional
22. Kiwi (キウイ)
23. Banana (バナナ)
24. Mango (マンゴー)
25. Apple (りんご)
26. Orange (オレンジ)
27. Matsutake mushroom (まつたけ)
28. Yam (やまいも)

#### GUDBRO +2 Custom (Asia-Pacific Focus)
29. **Coriander** (OR6A2 gene - 14% population tastes soap)
30. **Chili Pepper** (Capsaicin sensitivity)

### 10 Intolerances

1. **Lactose** (87.8% of Asians, 65% global)
2. **Gluten/Celiac** (Celiac disease, different from wheat allergy)
3. **Fructose**
4. **FODMAP** (Fermentable Oligo-, Di-, Mono-saccharides And Polyols)
5. **MSG** (Monosodium Glutamate - E621)
6. **Histamine** (Fermented/aged foods)
7. **Salicylates** (Spices, fruits)
8. **Sulphites** (Different from sulphite allergy)
9. **Caffeine**
10. **Alcohol**

### 11 Dietary Restrictions

#### Religious/Cultural
1. **Buddhist** ☸️ (No 5 pungent roots: garlic, onion, chives, leek, shallot)
2. **Halal** ☪️ (Islamic dietary law)
3. **Kosher** ✡️ (Jewish dietary law)

#### Lifestyle
4. **Vegetarian** 🥕 (No meat, no fish)
5. **Vegan** 🌱 (No animal products)
6. **Pescatarian** 🐟 (No meat, yes fish)

#### Health
7. **Gluten-Free** (Celiac-safe)
8. **Dairy-Free** (No milk products)
9. **Nut-Free** (No tree nuts)
10. **Low-Carb / Keto** (< 20g carbs per 100g)

### 5 Spice Levels

0. **None** (No spice)
1. **Lieve** (Mild - < 1,000 SHU)
2. **Media** (Medium - 1,000-10,000 SHU)
3. **Forte** (Strong - 10,000-50,000 SHU)
4. **Extra Forte** (Very Strong - 50,000-100,000 SHU)
5. **Estremo** (Extreme - > 100,000 SHU)

*SHU = Scoville Heat Units*

## Usage Examples

### 1. Basic Usage: Get Ingredient Data

```typescript
import { commonIngredients } from '@gudbro/shared/database';

// Get all coffee ingredients
const coffeeIngredients = commonIngredients.filter(
  ing => ing.category.main === 'beverages'
);

// Find specific ingredient
const oatMilk = commonIngredients.find(
  ing => ing.id === 'ING_MILK_OAT'
);

console.log(oatMilk?.allergens); // { gluten: true }
console.log(oatMilk?.dietary_restrictions); // { vegan: true, dairy_free: true, ... }
```

### 2. Auto-Compute Product Safety Data

```typescript
import {
  autoComputeProduct,
  getIngredientMasters,
  commonIngredients
} from '@gudbro/shared/database';

// Manager creates a cappuccino
const cappuccino = {
  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 30, unit: 'ml' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 150, unit: 'ml' } }
  ]
};

// Get full ingredient data
const ingredientMasters = await getIngredientMasters(
  cappuccino.ingredients,
  commonIngredients
);

// AUTO-COMPUTE everything!
const result = autoComputeProduct(ingredientMasters);

console.log(result);
/*
{
  allergens: {
    present: ['gluten'],
    by_country: {
      EU: ['gluten'],
      USA: ['wheat'],
      Korea: ['gluten'],
      Japan: ['gluten']
    }
  },
  intolerances: {
    present: ['caffeine', 'gluten_celiac'],
    severity: { caffeine: 'medium', gluten_celiac: 'severe' }
  },
  diets: {
    compatible: ['vegan', 'vegetarian', 'dairy_free', 'nut_free', 'halal', 'kosher'],
    incompatible: ['gluten_free'],
    reasons: { gluten_free: ['Contains Oat Milk (gluten)'] }
  },
  spice: {
    max_level: 0,
    ingredients_with_spice: []
  },
  compliance: {
    EU: true,
    USA: true,
    Korea: true,
    Japan: true,
    warnings: []
  }
}
*/
```

### 3. Create a New Product

```typescript
import type { Product } from '@gudbro/shared/database';

const myNewSmoothie: Product = {
  id: 'PROD_MY_SMOOTHIE',
  slug: 'my-smoothie',
  name: {
    en: 'My Green Smoothie',
    it: 'Il Mio Frullato Verde',
    vi: 'Sinh Tố Xanh Của Tôi'
  },
  category: { main: 'smoothie' },

  // Just select ingredients!
  ingredients: [
    { ingredient_id: 'ING_SPINACH', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_MILK_COCONUT', quantity: { amount: 200, unit: 'ml' } }
  ],

  // This will be auto-computed
  computed: {
    allergens: [],
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 0,
    allergen_compliance: {
      EU: false, USA: false, Korea: false, Japan: false
    }
  },

  // ... rest of product data
};
```

## Current Database Stats

- **Ingredients**: 28 common ingredients
- **Products**: 4 example products
- **Languages**: 6 supported (EN, IT, VI, KO, JA, ZH)
- **Allergen Coverage**: 30 allergens (9+ nations)
- **Intolerance Coverage**: 10 intolerances
- **Diet Coverage**: 11 dietary restrictions

## Roadmap

### Phase 1: Foundation (COMPLETED ✅)
- [x] Type definitions (30 allergens + 10 intolerances + 11 diets)
- [x] Auto-computation engine
- [x] Initial ingredient database (28 ingredients)
- [x] Example products (4 from ROOTS menu)

### Phase 2: Expansion (NEXT)
- [ ] Expand to 100+ ingredients
- [ ] Add more coffee/beverage ingredients
- [ ] Add restaurant ingredients (meats, seafood, sauces)
- [ ] Add street food ingredients (bread, condiments)
- [ ] Integrate with ROOTS menu JSON data
- [ ] Integrate with Coffee House Armenia JSON data

### Phase 3: Features
- [ ] Multi-image support (gallery arrays)
- [ ] Video support (YouTube, Vimeo, direct links)
- [ ] Recipe step-by-step instructions
- [ ] Prep time and skill level tracking
- [ ] Cost calculation and profit margins
- [ ] Seasonal availability tracking

### Phase 4: Analytics & Intelligence
- [ ] Track consumption by nationality (via device language)
- [ ] Popular ingredient combinations
- [ ] Trending diets by region
- [ ] Allergen heatmaps
- [ ] Price optimization suggestions

### Phase 5: B2B Monetization
- [ ] Premium ingredient marketplace
- [ ] Recipe template marketplace
- [ ] White-label database licensing
- [ ] API access for third-party developers
- [ ] Analytics dashboard subscriptions

## Competitive Advantage

### vs. Manual Entry Systems
- ❌ Manual: Manager types "contains peanuts" → Human error risk
- ✅ GUDBRO: Manager selects "peanut butter" → Auto-computes all 30 allergens

### vs. Basic Allergen Lists
- ❌ Basic: Only EU 14 allergens
- ✅ GUDBRO: 30 allergens covering 9+ nations

### vs. Static Databases
- ❌ Static: Allergen data never updates
- ✅ GUDBRO: Update ingredient once → All products update automatically

### Market Leaders Comparison
- **Deliveroo**: ~14 allergens (EU only)
- **UberEats**: ~9 allergens (USA Big 9)
- **IGREK** (best competitor): 28 allergens
- **GUDBRO**: **30 allergens + 10 intolerances + 11 diets = 51 FILTERS** 🏆

**GUDBRO Advantage: +82% vs. Best Competitor**

## Technical Details

### Type Safety
Full TypeScript support with strict typing for all 51 filters.

### Multi-Language Support
All text fields use `MultiLangText` type with support for:
- English (en)
- Italian (it)
- Vietnamese (vi)
- Korean (ko)
- Japanese (ja)
- Chinese (zh)
- Thai (th)
- Spanish (es)
- French (fr)

### Compliance Tracking
Automatic compliance verification for:
- EU Regulation 1169/2011
- USA FDA FALCPA + Big 9
- Korea Food Labeling Standards
- Japan Food Labeling Act
- Canada Food and Drug Regulations
- Australia FSANZ
- China GB 7718-2011
- Singapore Sale of Food Act
- Vietnam Circular 15/2018/TT-BYT

### Versioning
- Database Version: 1.0.0
- Sistema Filtri: v2.0
- Each ingredient and product has version tracking

## Contributing

To add a new ingredient:

1. Follow the `IngredientMaster` type definition
2. Fill in ALL 51 filter flags (30 allergens + 10 intolerances + 11 diets)
3. Add multi-language names (minimum: EN, IT, VI)
4. Include nutrition data per 100g
5. Add to `common-ingredients.ts`
6. Update `INGREDIENT_COUNT`

## Support

For questions or issues, contact the GUDBRO development team.

---

**Built with ❤️ for merchant safety and customer trust**

*"No more guessing. No more mistakes. Just science-backed safety data."*
