/**
 * GUDBRO Product Database - Example Products
 *
 * This file demonstrates how the auto-computation system works:
 * 1. Manager selects ingredients
 * 2. System automatically calculates allergens, intolerances, diets
 * 3. Complete safety data is generated instantly
 *
 * Based on ROOTS Plant-Based Café menu
 */

import type { Product, ProductIngredient } from '../types';
import { commonIngredients } from '../ingredients/common-ingredients';
import { autoComputeProduct, getIngredientMasters } from '../utils/auto-compute';

// ============================================================================
// EXAMPLE PRODUCTS FROM ROOTS MENU
// ============================================================================

/**
 * Example 1: Oats Cappuccino
 * Ingredients: Espresso + Oat Milk
 */
export const oatsCappuccino: Product = {
  id: 'PROD_OATS_CAPPUCCINO',
  slug: 'oats-cappuccino',
  same_id: 'COF_CAPPUCCINO_OATS',
  name: {
    en: 'Oats Cappuccino',
    it: 'Cappuccino di Avena',
    vi: 'Cappuccino Yến Mạch',
  },
  description: {
    en: 'Creamy cappuccino made with oat milk',
    it: 'Cappuccino cremoso fatto con latte di avena',
    vi: 'Cappuccino kem được làm từ sữa yến mạch',
  },
  category: { main: 'coffee', sub: 'espresso-based' },

  // Manager ONLY needs to select ingredients!
  ingredients: [
    {
      ingredient_id: 'ING_ESPRESSO',
      quantity: { amount: 30, unit: 'ml' },
    },
    {
      ingredient_id: 'ING_MILK_OAT',
      quantity: { amount: 150, unit: 'ml' },
    },
  ],

  // AUTO-COMPUTED (this gets filled automatically)
  computed: {
    allergens: [], // Will be auto-computed
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 0,
    allergen_compliance: {
      EU: false,
      USA: false,
      Korea: false,
      Japan: false,
    },
  },

  pricing: {
    cost_usd: 0.5,
    selling_price_usd: 2.0,
    selling_price_local: { amount: 50000, currency: 'VND' },
    profit_margin_percent: 75,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 2,
    serving_glass: 'Cappuccino cup (180ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
      ],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Example 2: Tropical Pitaya Smoothie Bowl
 * Complex product with multiple ingredients
 */
export const tropicalPitayaBowl: Product = {
  id: 'PROD_TROPICAL_PITAYA_BOWL',
  slug: 'tropical-pitaya-bowl',
  same_id: 'BOWL_PITAYA_TROPICAL',
  name: {
    en: 'Tropical Pitaya Smoothie Bowl',
    it: 'Bowl di Smoothie al Pitaya Tropicale',
    vi: 'Bát Sinh Tố Thanh Long Nhiệt Đới',
  },
  description: {
    en: 'Dragon fruit, banana, mango, coconut water, granola, coconut flakes, peanut butter chia pudding, mint, lime & fresh fruits',
    it: 'Frutto del drago, banana, mango, acqua di cocco, granola, scaglie di cocco, budino di chia al burro di arachidi, menta, lime e frutta fresca',
    vi: 'Thanh long, chuối, xoài, nước dừa, granola, dừa bào, pudding hạt chia bơ đậu phộng, bạc hà, chanh và trái cây tươi',
  },
  category: { main: 'bowl', sub: 'smoothie-bowl' },

  ingredients: [
    { ingredient_id: 'ING_PITAYA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_MANGO', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_GRANOLA', quantity: { amount: 30, unit: 'g' } },
    { ingredient_id: 'ING_COCONUT_FLAKES', quantity: { amount: 10, unit: 'g' } },
    { ingredient_id: 'ING_PEANUT_BUTTER', quantity: { amount: 15, unit: 'g' } },
    { ingredient_id: 'ING_CHIA_SEEDS', quantity: { amount: 10, unit: 'g' } },
  ],

  computed: {
    allergens: [],
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 0,
    allergen_compliance: {
      EU: false,
      USA: false,
      Korea: false,
      Japan: false,
    },
  },

  pricing: {
    cost_usd: 2.5,
    selling_price_usd: 3.5,
    selling_price_local: { amount: 89000, currency: 'VND' },
    profit_margin_percent: 28.5,
  },

  preparation: {
    prep_time_sec: 300,
    skill_level: 2,
    temperature: 'cold',
  },

  nutrition_per_serving: {
    serving_size_g: 350,
    protein_g: 12,
    carbs_g: 65,
    fat_g: 18,
    fiber_g: 12,
    calories_kcal: 450,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
      ],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Example 3: Green Power Smoothie with Protein Booster
 * Demonstrates optional extras
 */
export const greenPowerSmoothie: Product = {
  id: 'PROD_GREEN_POWER_SMOOTHIE',
  slug: 'green-power-smoothie',
  name: {
    en: 'Green Power Smoothie',
    it: 'Smoothie Verde Energetico',
    vi: 'Sinh Tố Xanh Năng Lượng',
  },
  description: {
    en: 'Spinach, kale, banana, mango, coconut water',
    it: 'Spinaci, cavolo riccio, banana, mango, acqua di cocco',
    vi: 'Rau bina, cải xoăn, chuối, xoài, nước dừa',
  },
  category: { main: 'smoothie' },

  ingredients: [
    { ingredient_id: 'ING_SPINACH', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_KALE', quantity: { amount: 30, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_MANGO', quantity: { amount: 80, unit: 'g' } },
    {
      ingredient_id: 'ING_PROTEIN_VEGAN',
      quantity: { amount: 15, unit: 'g' },
      optional: true,
      notes: {
        en: 'Add Vegan Protein +$1.20',
        it: 'Aggiungi Proteine Vegane +$1.20',
        vi: 'Thêm Protein Thuần Chay +$1.20',
      },
    },
  ],

  computed: {
    allergens: [],
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 0,
    allergen_compliance: {
      EU: false,
      USA: false,
      Korea: false,
      Japan: false,
    },
  },

  pricing: {
    cost_usd: 1.8,
    selling_price_usd: 2.8,
    selling_price_local: { amount: 70000, currency: 'VND' },
    profit_margin_percent: 35.7,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Example 4: Buddha Bowl (demonstrates Buddhist diet restriction)
 */
export const buddhaBowl: Product = {
  id: 'PROD_BUDDHA_BOWL',
  slug: 'buddha-bowl',
  name: {
    en: 'Buddha Bowl',
    it: 'Buddha Bowl',
    vi: 'Bát Phật',
  },
  description: {
    en: 'Quinoa, roasted vegetables, avocado, tahini dressing, fresh greens',
    it: 'Quinoa, verdure arrostite, avocado, condimento tahini, verdure fresche',
    vi: 'Diêm mạch, rau nướng, bơ, sốt tahini, rau xanh tươi',
  },
  category: { main: 'lunch', sub: 'bowl' },

  ingredients: [
    { ingredient_id: 'ING_QUINOA', quantity: { amount: 150, unit: 'g' } },
    { ingredient_id: 'ING_AVOCADO', quantity: { amount: 80, unit: 'g' } },
    { ingredient_id: 'ING_TAHINI', quantity: { amount: 20, unit: 'g' } },
    { ingredient_id: 'ING_SPINACH', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_TOMATO', quantity: { amount: 60, unit: 'g' } },
    // NOTE: No garlic/onion - Buddhist-friendly!
  ],

  computed: {
    allergens: [],
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 0,
    allergen_compliance: {
      EU: false,
      USA: false,
      Korea: false,
      Japan: false,
    },
  },

  pricing: {
    cost_usd: 3.0,
    selling_price_usd: 4.8,
    selling_price_local: { amount: 120000, currency: 'VND' },
    profit_margin_percent: 37.5,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// DEMONSTRATION: AUTO-COMPUTATION IN ACTION
// ============================================================================

/**
 * This function demonstrates how the auto-computation system works
 * Manager creates a product → System computes everything automatically
 */
export async function demonstrateAutoComputation() {
  console.log('='.repeat(80));
  console.log('GUDBRO AUTO-COMPUTATION DEMONSTRATION');
  console.log('='.repeat(80));
  console.log();

  // Example 1: Oats Cappuccino
  console.log('📋 PRODUCT: Oats Cappuccino');
  console.log('Manager selects: Espresso + Oat Milk');
  console.log();

  const cappuccinoIngredients = await getIngredientMasters(
    oatsCappuccino.ingredients,
    commonIngredients
  );
  const cappuccinoResult = autoComputeProduct(cappuccinoIngredients);

  console.log('✅ AUTO-COMPUTED RESULTS:');
  console.log('Allergens:', cappuccinoResult.allergens.present);
  console.log('  - EU:', cappuccinoResult.allergens.by_country.EU);
  console.log('  - USA:', cappuccinoResult.allergens.by_country.USA);
  console.log('Intolerances:', cappuccinoResult.intolerances.present);
  console.log('Compatible Diets:', cappuccinoResult.diets.compatible);
  console.log('Spice Level:', cappuccinoResult.spice.max_level);
  console.log('Compliance:', cappuccinoResult.compliance);
  console.log();

  // Example 2: Tropical Pitaya Bowl
  console.log('📋 PRODUCT: Tropical Pitaya Bowl');
  console.log('Manager selects: Pitaya + Banana + Mango + Granola + Coconut + Peanut Butter + Chia');
  console.log();

  const pitayaIngredients = await getIngredientMasters(
    tropicalPitayaBowl.ingredients,
    commonIngredients
  );
  const pitayaResult = autoComputeProduct(pitayaIngredients);

  console.log('✅ AUTO-COMPUTED RESULTS:');
  console.log('Allergens:', pitayaResult.allergens.present);
  console.log('  - EU:', pitayaResult.allergens.by_country.EU);
  console.log('  - USA:', pitayaResult.allergens.by_country.USA);
  console.log('  - Korea:', pitayaResult.allergens.by_country.Korea);
  console.log('  - Japan:', pitayaResult.allergens.by_country.Japan);
  console.log('Intolerances:', pitayaResult.intolerances.present);
  console.log('Compatible Diets:', pitayaResult.diets.compatible);
  console.log('❌ NOT Compatible:', pitayaResult.diets.incompatible);
  console.log('Reasons:', pitayaResult.diets.reasons);
  console.log('⚠️ Warnings:', pitayaResult.compliance.warnings);
  console.log();

  // Example 3: Buddha Bowl (Buddhist-friendly)
  console.log('📋 PRODUCT: Buddha Bowl');
  console.log('Manager selects: Quinoa + Avocado + Tahini + Spinach + Tomato (NO garlic/onion)');
  console.log();

  const buddhaIngredients = await getIngredientMasters(
    buddhaBowl.ingredients,
    commonIngredients
  );
  const buddhaResult = autoComputeProduct(buddhaIngredients);

  console.log('✅ AUTO-COMPUTED RESULTS:');
  console.log('Allergens:', buddhaResult.allergens.present);
  console.log('Compatible Diets:', buddhaResult.diets.compatible);
  console.log('☸️ Buddhist-friendly:', buddhaResult.diets.compatible.includes('buddhist'));
  console.log();

  console.log('='.repeat(80));
  console.log('KEY BENEFITS:');
  console.log('='.repeat(80));
  console.log('✅ Manager only selects ingredients - NO manual allergen entry');
  console.log('✅ System auto-computes 30 allergens + 10 intolerances + 11 diets');
  console.log('✅ Multi-nation compliance (EU, USA, Korea, Japan, etc.)');
  console.log('✅ Reduces human error on LIFE-THREATENING allergies');
  console.log('✅ Updates automatically if ingredient database is updated');
  console.log('='.repeat(80));
}

// ============================================================================
// EXPORTS
// ============================================================================

export const exampleProducts = [
  oatsCappuccino,
  tropicalPitayaBowl,
  greenPowerSmoothie,
  buddhaBowl,
];

export const PRODUCT_COUNT = exampleProducts.length;
