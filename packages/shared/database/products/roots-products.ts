/**
 * GUDBRO Product Database - ROOTS Plant-Based Café Products
 *
 * Real products from ROOTS Vietnam menu, created using the
 * "Build as You Go" validation-first approach.
 *
 * These products demonstrate:
 * - Just-in-time ingredient addition
 * - Auto-computation system validation
 * - Real-world menu integration
 * - Multi-category coverage (drinks, food, wellness, desserts)
 */

import type { Product } from '../types';
import { allIngredients } from '../index';
import { espressoCustomizations } from '../customizations/espresso-customizations';

// ============================================================================
// SIMPLE PRODUCTS (1-3 ingredients)
// ============================================================================

/**
 * Product 1: Lime Juice
 * Category: Simple Drinks
 * Ingredients: Lime + Water + Syrup (optional)
 */
export const limeJuice: Product = {
  id: 'PROD_LIME_JUICE',
  slug: 'lime-juice',
  same_id: 'SIMPLE_LIME_JUICE',
  name: {
    en: 'Fresh Lime Juice',
    it: 'Succo di Lime Fresco',
    vi: 'Nước Chanh Tươi',
  },
  description: {
    en: 'Freshly squeezed lime juice with water and optional syrup',
    it: 'Succo di lime appena spremuto con acqua e sciroppo opzionale',
    vi: 'Nước chanh vắt tươi với nước và xi-rô tùy chọn',
  },
  category: { main: 'bevande', sub: 'soft-drinks', tertiary: 'juice' },

  ingredients: [
    { ingredient_id: 'ING_LIME', quantity: { amount: 60, unit: 'ml' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 200, unit: 'ml' } },
    {
      ingredient_id: 'ING_SYRUP_VANILLA',
      quantity: { amount: 15, unit: 'ml' },
      optional: true,
      notes: {
        en: 'Add syrup for sweetness',
        it: 'Aggiungi sciroppo per dolcezza',
        vi: 'Thêm xi-rô cho vị ngọt',
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
    cost_usd: 0.4,
    selling_price_usd: 1.4,
    selling_price_local: { amount: 35000, currency: 'VND' },
    profit_margin_percent: 71.4,
  },

  preparation: {
    prep_time_sec: 60,
    skill_level: 1,
    temperature: 'cold',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 2: Immunity Booster Shot
 * Category: Wellness Shots
 * Ingredients: Turmeric + Apple Cider Vinegar
 */
export const immunityBoosterShot: Product = {
  id: 'PROD_IMMUNITY_BOOSTER',
  slug: 'immunity-booster-shot',
  same_id: 'WELLNESS_IMMUNITY_SHOT',
  name: {
    en: 'Immunity Booster Shot',
    it: 'Shot Immunità',
    vi: 'Shot Tăng Miễn Dịch',
  },
  description: {
    en: 'Turmeric and apple cider vinegar immunity shot',
    it: 'Shot di curcuma e aceto di mele per immunità',
    vi: 'Shot nghệ và giấm táo tăng miễn dịch',
  },
  category: { main: 'wellness', sub: 'shots' },

  ingredients: [
    { ingredient_id: 'ING_TURMERIC', quantity: { amount: 15, unit: 'g' } },
    { ingredient_id: 'ING_APPLE_CIDER_VINEGAR', quantity: { amount: 30, unit: 'ml' } },
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
    cost_usd: 0.3,
    selling_price_usd: 1.4,
    selling_price_local: { amount: 35000, currency: 'VND' },
    profit_margin_percent: 78.6,
  },

  preparation: {
    prep_time_sec: 45,
    skill_level: 1,
    temperature: 'room',
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
 * Product 3: Celery Juice
 * Category: Cold Press Juices
 * Ingredients: Celery
 */
export const celeryJuice: Product = {
  id: 'PROD_CELERY_JUICE',
  slug: 'celery-juice',
  same_id: 'COLDPRESS_CELERY',
  name: {
    en: 'Fresh Celery Juice',
    it: 'Succo di Sedano Fresco',
    vi: 'Nước Ép Cần Tây',
  },
  description: {
    en: 'Cold-pressed pure celery juice',
    it: 'Succo puro di sedano pressato a freddo',
    vi: 'Nước ép cần tây nguyên chất ép lạnh',
  },
  category: { main: 'bevande', sub: 'soft-drinks', tertiary: 'juice' },

  ingredients: [
    { ingredient_id: 'ING_CELERY', quantity: { amount: 300, unit: 'g' } },
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
    cost_usd: 1.0,
    selling_price_usd: 2.6,
    selling_price_local: { amount: 65000, currency: 'VND' },
    profit_margin_percent: 61.5,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 2,
    temperature: 'cold',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 4: Peanut Butter Toast
 * Category: Wholegrain Toast
 * Ingredients: Peanut Butter + Banana + Cinnamon + Sourdough Bread
 */
export const peanutButterToast: Product = {
  id: 'PROD_PEANUT_BUTTER_TOAST',
  slug: 'peanut-butter-toast',
  same_id: 'TOAST_PEANUT_BANANA',
  name: {
    en: 'Peanut Butter Banana Toast',
    it: 'Toast Burro di Arachidi e Banana',
    vi: 'Bánh Mì Bơ Đậu Phộng Chuối',
  },
  description: {
    en: 'Wholegrain toast with peanut butter, fresh banana, and cinnamon',
    it: 'Toast integrale con burro di arachidi, banana fresca e cannella',
    vi: 'Bánh mì nguyên cám với bơ đậu phộng, chuối tươi và quế',
  },
  category: { main: 'piatti-unici', sub: 'americano' },

  ingredients: [
    { ingredient_id: 'ING_BREAD_SOURDOUGH', quantity: { amount: 80, unit: 'g' } },
    { ingredient_id: 'ING_PEANUT_BUTTER', quantity: { amount: 25, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_CINNAMON', quantity: { amount: 2, unit: 'g' } },
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
    cost_usd: 0.8,
    selling_price_usd: 2.4,
    selling_price_local: { amount: 60000, currency: 'VND' },
    profit_margin_percent: 66.7,
  },

  preparation: {
    prep_time_sec: 180,
    skill_level: 1,
    temperature: 'room',
  },

  nutrition_per_serving: {
    serving_size_g: 207,
    protein_g: 12,
    carbs_g: 45,
    fat_g: 18,
    fiber_g: 8,
    calories_kcal: 380,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// MEDIUM COMPLEXITY PRODUCTS (4-6 ingredients)
// ============================================================================

/**
 * Product 5: Matcha Oats Latte
 * Category: Functional Drinks
 * Ingredients: Matcha + Oat Milk + Water
 */
export const matchaOatsLatte: Product = {
  id: 'PROD_MATCHA_OATS_LATTE',
  slug: 'matcha-oats-latte',
  same_id: 'FUNCTIONAL_MATCHA_OATS',
  name: {
    en: 'Matcha Oat Milk Latte',
    it: 'Latte di Matcha con Latte di Avena',
    vi: 'Latte Matcha Sữa Yến Mạch',
  },
  description: {
    en: 'Premium matcha green tea latte with creamy oat milk',
    it: 'Latte di tè verde matcha premium con latte di avena cremoso',
    vi: 'Latte trà xanh matcha cao cấp với sữa yến mạch béo ngậy',
  },
  category: { main: 'bevande', sub: 'hot-beverages', origin: 'japanese' },

  ingredients: [
    { ingredient_id: 'ING_MATCHA', quantity: { amount: 3, unit: 'g' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 200, unit: 'ml' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 50, unit: 'ml' } },
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
    cost_usd: 1.0,
    selling_price_usd: 2.2,
    selling_price_local: { amount: 55000, currency: 'VND' },
    profit_margin_percent: 54.5,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 2,
    serving_glass: 'Latte glass (250ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&h=600&fit=crop',
      ],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 6: Turmeric Golden Latte
 * Category: Nurish Latte
 * Ingredients: Turmeric + Ginger + Black Pepper + Cashew Milk + Honey
 */
export const turmericGoldenLatte: Product = {
  id: 'PROD_TURMERIC_GOLDEN_LATTE',
  slug: 'turmeric-golden-latte',
  same_id: 'NURISH_TURMERIC_LATTE',
  name: {
    en: 'Turmeric Golden Latte',
    it: 'Latte Dorato alla Curcuma',
    vi: 'Latte Nghệ Vàng',
  },
  description: {
    en: 'Anti-inflammatory golden milk with turmeric, ginger, and black pepper',
    it: 'Latte dorato antinfiammatorio con curcuma, zenzero e pepe nero',
    vi: 'Sữa vàng chống viêm với nghệ, gừng và tiêu đen',
  },
  category: { main: 'bevande', sub: 'hot-beverages', origin: 'indian' },

  ingredients: [
    { ingredient_id: 'ING_TURMERIC', quantity: { amount: 5, unit: 'g' } },
    { ingredient_id: 'ING_GINGER', quantity: { amount: 3, unit: 'g' } },
    { ingredient_id: 'ING_BLACK_PEPPER', quantity: { amount: 0.5, unit: 'g' } },
    { ingredient_id: 'ING_MILK_CASHEW', quantity: { amount: 200, unit: 'ml' } },
    {
      ingredient_id: 'ING_HONEY',
      quantity: { amount: 10, unit: 'g' },
      optional: true,
      notes: {
        en: 'Add honey for sweetness (not vegan)',
        it: 'Aggiungi miele per dolcezza (non vegano)',
        vi: 'Thêm mật ong cho vị ngọt (không thuần chay)',
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
    cost_usd: 0.9,
    selling_price_usd: 2.4,
    selling_price_local: { amount: 60000, currency: 'VND' },
    profit_margin_percent: 62.5,
  },

  preparation: {
    prep_time_sec: 180,
    skill_level: 2,
    serving_glass: 'Latte glass (250ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 7: Cacao Latte
 * Category: Nurish Latte
 * Ingredients: Cacao Powder + Cashew Milk
 */
export const cacaoLatte: Product = {
  id: 'PROD_CACAO_LATTE',
  slug: 'cacao-latte',
  same_id: 'NURISH_CACAO_LATTE',
  name: {
    en: 'Cacao Latte',
    it: 'Latte al Cacao',
    vi: 'Latte Ca Cao',
  },
  description: {
    en: 'Rich cacao latte with cashew milk',
    it: 'Ricco latte al cacao con latte di anacardi',
    vi: 'Latte ca cao đậm đà với sữa hạt điều',
  },
  category: { main: 'bevande', sub: 'hot-beverages', origin: 'mexican' },

  ingredients: [
    { ingredient_id: 'ING_CACAO_POWDER', quantity: { amount: 10, unit: 'g' } },
    { ingredient_id: 'ING_MILK_CASHEW', quantity: { amount: 200, unit: 'ml' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 50, unit: 'ml' } },
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
    cost_usd: 0.7,
    selling_price_usd: 2.2,
    selling_price_local: { amount: 55000, currency: 'VND' },
    profit_margin_percent: 68.2,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 2,
    serving_glass: 'Latte glass (250ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 8: Beet Hummus Toast
 * Category: Wholegrain Toast
 * Ingredients: Beet Hummus + Tofu + Olive Oil + Mint + Sourdough Bread
 */
export const beetHummusToast: Product = {
  id: 'PROD_BEET_HUMMUS_TOAST',
  slug: 'beet-hummus-toast',
  same_id: 'TOAST_BEET_HUMMUS',
  name: {
    en: 'Beet Hummus Toast',
    it: 'Toast con Hummus di Barbabietola',
    vi: 'Bánh Mì Hummus Củ Dền',
  },
  description: {
    en: 'Sourdough toast with beet hummus, tofu feta, olives, and fresh mint',
    it: 'Toast di pasta madre con hummus di barbabietola, feta di tofu, olive e menta fresca',
    vi: 'Bánh mì men tự nhiên với hummus củ dền, phô mai tofu, ô liu và bạc hà tươi',
  },
  category: { main: 'piatti-unici', sub: 'italiano' },

  ingredients: [
    { ingredient_id: 'ING_BREAD_SOURDOUGH', quantity: { amount: 80, unit: 'g' } },
    { ingredient_id: 'ING_HUMMUS', quantity: { amount: 60, unit: 'g' } },
    { ingredient_id: 'ING_TOFU', quantity: { amount: 40, unit: 'g' } },
    { ingredient_id: 'ING_OLIVE_OIL', quantity: { amount: 10, unit: 'ml' } },
    { ingredient_id: 'ING_MINT', quantity: { amount: 5, unit: 'g' } },
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
    cost_usd: 1.1,
    selling_price_usd: 2.4,
    selling_price_local: { amount: 60000, currency: 'VND' },
    profit_margin_percent: 54.2,
  },

  preparation: {
    prep_time_sec: 240,
    skill_level: 2,
    temperature: 'room',
  },

  nutrition_per_serving: {
    serving_size_g: 195,
    protein_g: 14,
    carbs_g: 32,
    fat_g: 16,
    fiber_g: 9,
    calories_kcal: 320,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// COMPLEX PRODUCTS (7+ ingredients)
// ============================================================================

/**
 * Product 9: Cacao Dream Smoothie Bowl
 * Category: Superfood Smoothie Bowl
 * Ingredients: Cacao + Peanut Butter + Banana + Mango + Oat Milk + Granola + Coconut + Chia
 */
export const cacaoDreamBowl: Product = {
  id: 'PROD_CACAO_DREAM_BOWL',
  slug: 'cacao-dream-bowl',
  same_id: 'BOWL_CACAO_DREAM',
  name: {
    en: 'Cacao Dream Smoothie Bowl',
    it: 'Bowl Sogno di Cacao',
    vi: 'Bát Sinh Tố Giấc Mơ Ca Cao',
  },
  description: {
    en: 'Rich cacao smoothie bowl with peanut butter, banana, mango, oat milk, granola, coconut flakes, and chia seeds',
    it: 'Bowl di smoothie al cacao ricco con burro di arachidi, banana, mango, latte di avena, granola, scaglie di cocco e semi di chia',
    vi: 'Bát sinh tố ca cao đậm đà với bơ đậu phộng, chuối, xoài, sữa yến mạch, granola, dừa bào và hạt chia',
  },
  category: { main: 'piatti-unici', sub: 'americano' },

  ingredients: [
    { ingredient_id: 'ING_CACAO_POWDER', quantity: { amount: 15, unit: 'g' } },
    { ingredient_id: 'ING_PEANUT_BUTTER', quantity: { amount: 20, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_MANGO', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 150, unit: 'ml' } },
    { ingredient_id: 'ING_GRANOLA', quantity: { amount: 30, unit: 'g' } },
    { ingredient_id: 'ING_COCONUT_FLAKES', quantity: { amount: 10, unit: 'g' } },
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
    cost_usd: 2.2,
    selling_price_usd: 3.56,
    selling_price_local: { amount: 89000, currency: 'VND' },
    profit_margin_percent: 38.2,
  },

  preparation: {
    prep_time_sec: 300,
    skill_level: 2,
    temperature: 'cold',
  },

  nutrition_per_serving: {
    serving_size_g: 385,
    protein_g: 16,
    carbs_g: 68,
    fat_g: 22,
    fiber_g: 14,
    calories_kcal: 520,
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
 * Product 10: Espresso
 * Category: Coffee
 * Ingredients: Arabica Coffee (as Espresso)
 * Note: Using existing ING_ESPRESSO
 */
export const espresso: Product = {
  id: 'PROD_ESPRESSO',
  slug: 'espresso',
  same_id: 'COFFEE_ESPRESSO',
  name: {
    en: 'Espresso',
    it: 'Espresso',
    vi: 'Cà Phê Espresso',
  },
  description: {
    en: 'Classic Italian espresso shot',
    it: 'Classico caffè espresso italiano',
    vi: 'Cà phê espresso Ý cổ điển',
  },
  category: { main: 'coffee', sub: 'espresso' },

  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 30, unit: 'ml' } },
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
    cost_usd: 0.25,
    selling_price_usd: 1.2,
    selling_price_local: { amount: 30000, currency: 'VND' },
    profit_margin_percent: 79.2,
  },

  preparation: {
    prep_time_sec: 45,
    skill_level: 2,
    serving_glass: 'Espresso cup (60ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  // ✨ PROOF OF CONCEPT: Database-Driven Customizations
  // This espresso product is the first to use the new customization system
  // Includes: Length, Cup Size, Shot Count, Consumption, Milk, Liquor
  customizations: espressoCustomizations,

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 11: Americano
 * Category: Coffee
 * Ingredients: Espresso + Water
 */
export const americano: Product = {
  id: 'PROD_AMERICANO',
  slug: 'americano',
  same_id: 'COFFEE_AMERICANO',
  name: {
    en: 'Americano',
    it: 'Americano',
    vi: 'Cà Phê Americano',
  },
  description: {
    en: 'Espresso diluted with hot water',
    it: 'Espresso diluito con acqua calda',
    vi: 'Espresso pha loãng với nước nóng',
  },
  category: { main: 'coffee', sub: 'espresso-based' },

  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 30, unit: 'ml' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 120, unit: 'ml' } },
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
    cost_usd: 0.3,
    selling_price_usd: 1.6,
    selling_price_local: { amount: 40000, currency: 'VND' },
    profit_margin_percent: 81.3,
  },

  preparation: {
    prep_time_sec: 60,
    skill_level: 2,
    serving_glass: 'Coffee cup (180ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 12: Cashew Milk Cappuccino
 * Category: Coffee
 * Ingredients: Espresso + Cashew Milk
 */
export const cashewCappuccino: Product = {
  id: 'PROD_CASHEW_CAPPUCCINO',
  slug: 'cashew-cappuccino',
  same_id: 'COFFEE_CAPPUCCINO_CASHEW',
  name: {
    en: 'Cashew Milk Cappuccino',
    it: 'Cappuccino con Latte di Anacardi',
    vi: 'Cappuccino Sữa Hạt Điều',
  },
  description: {
    en: 'Creamy cappuccino made with cashew milk',
    it: 'Cappuccino cremoso fatto con latte di anacardi',
    vi: 'Cappuccino kem được làm từ sữa hạt điều',
  },
  category: { main: 'coffee', sub: 'espresso-based' },

  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 30, unit: 'ml' } },
    { ingredient_id: 'ING_MILK_CASHEW', quantity: { amount: 150, unit: 'ml' } },
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
    cost_usd: 0.6,
    selling_price_usd: 2.0,
    selling_price_local: { amount: 50000, currency: 'VND' },
    profit_margin_percent: 70.0,
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
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 13: Green Peace Smoothie Bowl
 * Category: Superfood Smoothie Bowl
 * Ingredients: Spirulina + Banana + Pineapple + Oat Milk + Granola + Coconut + Chia
 * Note: Need to add Pineapple ingredient
 */
export const greenPeaceBowl: Product = {
  id: 'PROD_GREEN_PEACE_BOWL',
  slug: 'green-peace-bowl',
  same_id: 'BOWL_GREEN_PEACE',
  name: {
    en: 'Green Peace Smoothie Bowl',
    it: 'Bowl Pace Verde',
    vi: 'Bát Sinh Tố Xanh Hòa Bình',
  },
  description: {
    en: 'Spirulina smoothie bowl with banana, pineapple, oat milk, granola, coconut flakes, and chia seeds',
    it: 'Bowl di smoothie alla spirulina con banana, ananas, latte di avena, granola, scaglie di cocco e semi di chia',
    vi: 'Bát sinh tố tảo xoắn với chuối, dứa, sữa yến mạch, granola, dừa bào và hạt chia',
  },
  category: { main: 'piatti-unici', sub: 'americano' },

  ingredients: [
    { ingredient_id: 'ING_SPIRULINA', quantity: { amount: 5, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    // Note: Pineapple not yet in database - will add if needed
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 150, unit: 'ml' } },
    { ingredient_id: 'ING_GRANOLA', quantity: { amount: 30, unit: 'g' } },
    { ingredient_id: 'ING_COCONUT_FLAKES', quantity: { amount: 10, unit: 'g' } },
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
    cost_usd: 2.0,
    selling_price_usd: 3.56,
    selling_price_local: { amount: 89000, currency: 'VND' },
    profit_margin_percent: 43.8,
  },

  preparation: {
    prep_time_sec: 300,
    skill_level: 2,
    temperature: 'cold',
  },

  nutrition_per_serving: {
    serving_size_g: 305,
    protein_g: 12,
    carbs_g: 62,
    fat_g: 14,
    fiber_g: 12,
    calories_kcal: 420,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 14: Tropical Mango Smoothie
 * Category: Smoothies
 * Ingredients: Mango + Banana + Oat Milk
 */
export const mangoSmoothie: Product = {
  id: 'PROD_MANGO_SMOOTHIE',
  slug: 'mango-smoothie',
  same_id: 'SMOOTHIE_MANGO',
  name: {
    en: 'Tropical Mango Smoothie',
    it: 'Smoothie al Mango Tropicale',
    vi: 'Sinh Tố Xoài Nhiệt Đới',
  },
  description: {
    en: 'Refreshing mango smoothie with banana and oat milk',
    it: 'Smoothie rinfrescante al mango con banana e latte di avena',
    vi: 'Sinh tố xoài tươi mát với chuối và sữa yến mạch',
  },
  category: { main: 'smoothie', sub: 'fruit-smoothie' },

  ingredients: [
    { ingredient_id: 'ING_MANGO', quantity: { amount: 150, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 200, unit: 'ml' } },
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
    cost_usd: 1.2,
    selling_price_usd: 3.2,
    selling_price_local: { amount: 80000, currency: 'VND' },
    profit_margin_percent: 62.5,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 1,
    temperature: 'cold',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 15: Berry Blast Smoothie
 * Category: Smoothies
 * Ingredients: Mixed Berries + Banana + Coconut Milk
 */
export const berrySmoothie: Product = {
  id: 'PROD_BERRY_SMOOTHIE',
  slug: 'berry-smoothie',
  same_id: 'SMOOTHIE_BERRY',
  name: {
    en: 'Berry Blast Smoothie',
    it: 'Smoothie Esplosione di Frutti di Bosco',
    vi: 'Sinh Tố Quả Mọng',
  },
  description: {
    en: 'Antioxidant-rich berry smoothie with banana and coconut milk',
    it: 'Smoothie ricco di antiossidanti con frutti di bosco, banana e latte di cocco',
    vi: 'Sinh tố giàu chất chống oxy hóa với quả mọng, chuối và sữa dừa',
  },
  category: { main: 'smoothie', sub: 'fruit-smoothie' },

  ingredients: [
    { ingredient_id: 'ING_STRAWBERRY', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_MILK_COCONUT', quantity: { amount: 200, unit: 'ml' } },
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
    cost_usd: 1.4,
    selling_price_usd: 3.4,
    selling_price_local: { amount: 85000, currency: 'VND' },
    profit_margin_percent: 58.8,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 1,
    temperature: 'cold',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 16: Green Detox Smoothie
 * Category: Smoothies
 * Ingredients: Spinach + Banana + Apple + Ginger
 */
export const greenSmoothie: Product = {
  id: 'PROD_GREEN_SMOOTHIE',
  slug: 'green-smoothie',
  same_id: 'SMOOTHIE_GREEN',
  name: {
    en: 'Green Detox Smoothie',
    it: 'Smoothie Verde Detox',
    vi: 'Sinh Tố Xanh Giải Độc',
  },
  description: {
    en: 'Detoxifying green smoothie with spinach, banana, apple and ginger',
    it: 'Smoothie verde disintossicante con spinaci, banana, mela e zenzero',
    vi: 'Sinh tố xanh giải độc với rau bina, chuối, táo và gừng',
  },
  category: { main: 'smoothie', sub: 'green-smoothie' },

  ingredients: [
    { ingredient_id: 'ING_SPINACH', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_APPLE', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_GINGER', quantity: { amount: 5, unit: 'g' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 150, unit: 'ml' } },
  ],

  computed: {
    allergens: [],
    intolerances: [],
    suitable_for_diets: [],
    spice_level: 1,
    allergen_compliance: {
      EU: false,
      USA: false,
      Korea: false,
      Japan: false,
    },
  },

  pricing: {
    cost_usd: 1.0,
    selling_price_usd: 3.0,
    selling_price_local: { amount: 75000, currency: 'VND' },
    profit_margin_percent: 66.7,
  },

  preparation: {
    prep_time_sec: 120,
    skill_level: 1,
    temperature: 'cold',
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
 * Product 17: Flat White
 * Category: Coffee
 * Ingredients: Espresso + Oat Milk (microfoam)
 */
export const flatWhite: Product = {
  id: 'PROD_FLAT_WHITE',
  slug: 'flat-white',
  same_id: 'COFFEE_FLAT_WHITE',
  name: {
    en: 'Flat White',
    it: 'Flat White',
    vi: 'Cà Phê Flat White',
  },
  description: {
    en: 'Velvety espresso with microfoam oat milk',
    it: 'Espresso vellutato con microfoam di latte di avena',
    vi: 'Espresso mượt mà với vi bọt sữa yến mạch',
  },
  category: { main: 'coffee', sub: 'espresso-based' },

  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 60, unit: 'ml' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 120, unit: 'ml' } },
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
    cost_usd: 0.5,
    selling_price_usd: 2.2,
    selling_price_local: { amount: 55000, currency: 'VND' },
    profit_margin_percent: 77.3,
  },

  preparation: {
    prep_time_sec: 150,
    skill_level: 3,
    serving_glass: 'Ceramic cup (180ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 18: Mocha
 * Category: Coffee
 * Ingredients: Espresso + Cacao + Oat Milk
 */
export const mocha: Product = {
  id: 'PROD_MOCHA',
  slug: 'mocha',
  same_id: 'COFFEE_MOCHA',
  name: {
    en: 'Mocha',
    it: 'Mocha',
    vi: 'Cà Phê Mocha',
  },
  description: {
    en: 'Rich chocolate espresso with steamed oat milk',
    it: 'Espresso al cioccolato ricco con latte di avena vaporizzato',
    vi: 'Espresso sô-cô-la đậm đà với sữa yến mạch hấp',
  },
  category: { main: 'coffee', sub: 'espresso-based' },

  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 30, unit: 'ml' } },
    { ingredient_id: 'ING_CACAO_POWDER', quantity: { amount: 10, unit: 'g' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 200, unit: 'ml' } },
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
    cost_usd: 0.6,
    selling_price_usd: 2.4,
    selling_price_local: { amount: 60000, currency: 'VND' },
    profit_margin_percent: 75.0,
  },

  preparation: {
    prep_time_sec: 180,
    skill_level: 2,
    serving_glass: 'Coffee mug (240ml)',
    temperature: 'hot',
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

/**
 * Product 19: Avocado Toast
 * Category: Food
 * Ingredients: Avocado + Sourdough + Tomato + Lemon
 */
export const avocadoToast: Product = {
  id: 'PROD_AVOCADO_TOAST',
  slug: 'avocado-toast',
  same_id: 'TOAST_AVOCADO',
  name: {
    en: 'Smashed Avocado Toast',
    it: 'Toast con Avocado Schiacciato',
    vi: 'Bánh Mì Bơ Nghiền',
  },
  description: {
    en: 'Smashed avocado on sourdough with cherry tomatoes and lemon',
    it: 'Avocado schiacciato su pane a lievitazione naturale con pomodorini e limone',
    vi: 'Bơ nghiền trên bánh mì men tự nhiên với cà chua bi và chanh',
  },
  category: { main: 'piatti-unici', sub: 'americano' },

  ingredients: [
    { ingredient_id: 'ING_BREAD_SOURDOUGH', quantity: { amount: 80, unit: 'g' } },
    { ingredient_id: 'ING_AVOCADO', quantity: { amount: 120, unit: 'g' } },
    { ingredient_id: 'ING_TOMATO', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_LIME', quantity: { amount: 10, unit: 'ml' } },
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
    cost_usd: 1.2,
    selling_price_usd: 3.2,
    selling_price_local: { amount: 80000, currency: 'VND' },
    profit_margin_percent: 62.5,
  },

  preparation: {
    prep_time_sec: 240,
    skill_level: 1,
    temperature: 'room',
  },

  nutrition_per_serving: {
    serving_size_g: 260,
    protein_g: 8,
    carbs_g: 35,
    fat_g: 18,
    fiber_g: 12,
    calories_kcal: 340,
  },

  media: {
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=300&fit=crop',
      gallery: [],
    },
  },

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// INTERNATIONAL DEMO PRODUCTS (with time_slots for B2B testing)
// ============================================================================

export const pancakes: Product = {
  id: 'PROD_PANCAKES',
  slug: 'pancakes',
  same_id: 'BREAKFAST_PANCAKES',
  name: { en: 'Fluffy Pancakes', it: 'Pancakes Soffici', vi: 'Bánh Pancake' },
  description: { en: 'Stack of fluffy pancakes with maple syrup', it: 'Pila di pancakes soffici con sciroppo d\'acero', vi: 'Bánh pancake xốp với siro phong' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [
    { ingredient_id: 'ING_FLOUR', quantity: { amount: 150, unit: 'g' } },
    { ingredient_id: 'ING_MILK_OAT', quantity: { amount: 200, unit: 'ml' } },
    { ingredient_id: 'ING_BANANA', quantity: { amount: 50, unit: 'g' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 1.5, selling_price_usd: 4.5, selling_price_local: { amount: 110000, currency: 'VND' }, profit_margin_percent: 66.7 },
  preparation: { prep_time_sec: 480, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const pizzaMargherita: Product = {
  id: 'PROD_PIZZA_MARGHERITA',
  slug: 'pizza-margherita',
  same_id: 'PIZZA_MARGHERITA',
  name: { en: 'Pizza Margherita', it: 'Pizza Margherita', vi: 'Pizza Margherita' },
  description: { en: 'Classic Italian pizza with tomato, mozzarella and basil', it: 'Pizza italiana classica con pomodoro, mozzarella e basilico', vi: 'Pizza Ý cổ điển với cà chua, phô mai mozzarella và húng quế' },
  category: { main: 'pizza', sub: 'italiano' },
  ingredients: [
    { ingredient_id: 'ING_BREAD_SOURDOUGH', quantity: { amount: 250, unit: 'g' } },
    { ingredient_id: 'ING_TOMATO', quantity: { amount: 100, unit: 'g' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 2.5, selling_price_usd: 8.0, selling_price_local: { amount: 200000, currency: 'VND' }, profit_margin_percent: 68.8 },
  preparation: { prep_time_sec: 900, skill_level: 3, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const padThai: Product = {
  id: 'PROD_PAD_THAI',
  slug: 'pad-thai',
  same_id: 'ASIAN_PAD_THAI',
  name: { en: 'Pad Thai', it: 'Pad Thai', vi: 'Phở Xào Thái' },
  description: { en: 'Classic Thai stir-fried rice noodles', it: 'Classici noodles di riso thai saltati', vi: 'Phở xào Thái cổ điển' },
  category: { main: 'primi', sub: 'thailandese' },
  ingredients: [
    { ingredient_id: 'ING_PEANUT_BUTTER', quantity: { amount: 30, unit: 'g' } },
    { ingredient_id: 'ING_LIME', quantity: { amount: 20, unit: 'ml' } },
    { ingredient_id: 'ING_GINGER', quantity: { amount: 10, unit: 'g' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 2.0, selling_price_usd: 6.5, selling_price_local: { amount: 160000, currency: 'VND' }, profit_margin_percent: 69.2 },
  preparation: { prep_time_sec: 600, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const classicBurger: Product = {
  id: 'PROD_CLASSIC_BURGER',
  slug: 'classic-burger',
  same_id: 'BURGER_CLASSIC',
  name: { en: 'Classic Burger', it: 'Hamburger Classico', vi: 'Burger Cổ Điển' },
  description: { en: 'Juicy burger with lettuce, tomato, onion and special sauce', it: 'Hamburger succoso con lattuga, pomodoro, cipolla e salsa speciale', vi: 'Burger ngon ngọt với rau xà lách, cà chua, hành tây và sốt đặc biệt' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [
    { ingredient_id: 'ING_BREAD_SOURDOUGH', quantity: { amount: 100, unit: 'g' } },
    { ingredient_id: 'ING_TOMATO', quantity: { amount: 50, unit: 'g' } },
    { ingredient_id: 'ING_SPINACH', quantity: { amount: 30, unit: 'g' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 3.0, selling_price_usd: 8.5, selling_price_local: { amount: 210000, currency: 'VND' }, profit_margin_percent: 64.7 },
  preparation: { prep_time_sec: 720, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const spritzCocktail: Product = {
  id: 'PROD_SPRITZ',
  slug: 'spritz',
  same_id: 'COCKTAIL_SPRITZ',
  name: { en: 'Aperol Spritz', it: 'Spritz Aperol', vi: 'Rượu Spritz' },
  description: { en: 'Italian aperitif cocktail with Aperol, Prosecco and soda', it: 'Cocktail aperitivo italiano con Aperol, Prosecco e soda', vi: 'Cocktail khai vị Ý với Aperol, Prosecco và soda' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'spritz', origin: 'italian' },
  ingredients: [
    { ingredient_id: 'ING_WATER', quantity: { amount: 100, unit: 'ml' } },
    { ingredient_id: 'ING_LIME', quantity: { amount: 20, unit: 'ml' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 2.0, selling_price_usd: 7.0, selling_price_local: { amount: 175000, currency: 'VND' }, profit_margin_percent: 71.4 },
  preparation: { prep_time_sec: 120, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1570797197190-8e003a00c846?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const mojito: Product = {
  id: 'PROD_MOJITO',
  slug: 'mojito',
  same_id: 'COCKTAIL_MOJITO',
  name: { en: 'Mojito', it: 'Mojito', vi: 'Cocktail Mojito' },
  description: { en: 'Refreshing Cuban cocktail with rum, mint, lime and soda', it: 'Rinfrescante cocktail cubano con rum, menta, lime e soda', vi: 'Cocktail Cuba sảng khoái với rum, bạc hà, chanh và soda' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'cuban' },
  ingredients: [
    { ingredient_id: 'ING_LIME', quantity: { amount: 30, unit: 'ml' } },
    { ingredient_id: 'ING_WATER', quantity: { amount: 100, unit: 'ml' } },
    { ingredient_id: 'ING_SYRUP_VANILLA', quantity: { amount: 20, unit: 'ml' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 1.8, selling_price_usd: 6.5, selling_price_local: { amount: 160000, currency: 'VND' }, profit_margin_percent: 72.3 },
  preparation: { prep_time_sec: 180, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const tiramisu: Product = {
  id: 'PROD_TIRAMISU',
  slug: 'tiramisu',
  same_id: 'DESSERT_TIRAMISU',
  name: { en: 'Tiramisù', it: 'Tiramisù', vi: 'Bánh Tiramisu' },
  description: { en: 'Classic Italian dessert with coffee, mascarpone and cocoa', it: 'Classico dessert italiano con caffè, mascarpone e cacao', vi: 'Món tráng miệng Ý cổ điển với cà phê, mascarpone và ca cao' },
  category: { main: 'dessert', sub: 'italiano' },
  ingredients: [
    { ingredient_id: 'ING_ESPRESSO', quantity: { amount: 50, unit: 'ml' } },
    { ingredient_id: 'ING_CACAO_POWDER', quantity: { amount: 10, unit: 'g' } },
  ],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 2.5, selling_price_usd: 6.0, selling_price_local: { amount: 150000, currency: 'VND' }, profit_margin_percent: 58.3 },
  preparation: { prep_time_sec: 300, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const cocaCola: Product = {
  id: 'PROD_COCA_COLA',
  slug: 'coca-cola',
  same_id: 'DRINK_COCA_COLA',
  name: { en: 'Coca Cola', it: 'Coca Cola', vi: 'Coca Cola' },
  description: { en: 'Classic refreshing cola drink', it: 'Classica bevanda rinfrescante alla cola', vi: 'Nước giải khát cola cổ điển' },
  category: { main: 'bevande', sub: 'soft-drinks', tertiary: 'cola', origin: 'american' },
  ingredients: [{ ingredient_id: 'ING_WATER', quantity: { amount: 330, unit: 'ml' } }],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 0.5, selling_price_usd: 2.0, selling_price_local: { amount: 50000, currency: 'VND' }, profit_margin_percent: 75.0 },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const beerHeineken: Product = {
  id: 'PROD_HEINEKEN',
  slug: 'heineken',
  same_id: 'BEER_HEINEKEN',
  name: { en: 'Heineken Beer', it: 'Birra Heineken', vi: 'Bia Heineken' },
  description: { en: 'Premium Dutch lager beer', it: 'Birra lager olandese premium', vi: 'Bia lager Hà Lan cao cấp' },
  category: { main: 'bevande', sub: 'beer', tertiary: 'bottled', origin: 'dutch' },
  ingredients: [{ ingredient_id: 'ING_WATER', quantity: { amount: 330, unit: 'ml' } }],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: false, USA: false, Korea: false, Japan: false } },
  pricing: { cost_usd: 1.5, selling_price_usd: 4.0, selling_price_local: { amount: 100000, currency: 'VND' }, profit_margin_percent: 62.5 },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// BREAKFAST ITEMS
// ============================================================================

export const frenchToast: Product = {
  id: 'PROD_FRENCH_TOAST',
  slug: 'french-toast',
  name: { en: 'French Toast', it: 'Toast alla Francese', vi: 'Bánh Mì Pháp' },
  description: { en: 'Classic French toast with maple syrup', it: 'Toast alla francese classico con sciroppo d\'acero', vi: 'Bánh mì Pháp kiểu cổ điển với xi-rô cây phong' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 95000, currency: 'VND' } },
  preparation: { prep_time_sec: 300, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const croissant: Product = {
  id: 'PROD_CROISSANT',
  slug: 'croissant',
  name: { en: 'Butter Croissant', it: 'Cornetto al Burro', vi: 'Bánh Sừng Bò' },
  description: { en: 'Flaky French butter croissant', it: 'Cornetto francese al burro sfogliato', vi: 'Bánh sừng bò Pháp bơ' },
  category: { main: 'piatti-unici', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 45000, currency: 'VND' } },
  preparation: { prep_time_sec: 60, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const eggsBenedict: Product = {
  id: 'PROD_EGGS_BENEDICT',
  slug: 'eggs-benedict',
  name: { en: 'Eggs Benedict', it: 'Uova alla Benedict', vi: 'Trứng Benedict' },
  description: { en: 'Poached eggs with hollandaise sauce', it: 'Uova in camicia con salsa olandese', vi: 'Trứng chần với sốt hollandaise' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 135000, currency: 'VND' } },
  preparation: { prep_time_sec: 480, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const breakfastBurrito: Product = {
  id: 'PROD_BREAKFAST_BURRITO',
  slug: 'breakfast-burrito',
  name: { en: 'Breakfast Burrito', it: 'Burrito Colazione', vi: 'Burrito Sáng' },
  description: { en: 'Eggs, bacon, cheese wrapped in tortilla', it: 'Uova, pancetta, formaggio in tortilla', vi: 'Trứng, thịt xông khói, phô mai cuốn trong bánh tortilla' },
  category: { main: 'piatti-unici', sub: 'messicano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 1, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 125000, currency: 'VND' } },
  preparation: { prep_time_sec: 360, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const phoBreakfast: Product = {
  id: 'PROD_PHO_BREAKFAST',
  slug: 'pho-breakfast',
  name: { en: 'Vietnamese Pho', it: 'Pho Vietnamita', vi: 'Phở Bò' },
  description: { en: 'Traditional Vietnamese beef noodle soup', it: 'Zuppa vietnamita tradizionale di manzo e noodles', vi: 'Phở bò truyền thống Việt Nam' },
  category: { main: 'primi', sub: 'vietnamita' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 85000, currency: 'VND' } },
  preparation: { prep_time_sec: 600, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast', 'lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const banhMi: Product = {
  id: 'PROD_BANH_MI',
  slug: 'banh-mi',
  name: { en: 'Banh Mi Sandwich', it: 'Panino Banh Mi', vi: 'Bánh Mì Thịt' },
  description: { en: 'Vietnamese baguette with pork and pickled vegetables', it: 'Baguette vietnamita con maiale e verdure in salamoia', vi: 'Bánh mì thịt với rau cải chua' },
  category: { main: 'piatti-unici', sub: 'vietnamita' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 55000, currency: 'VND' } },
  preparation: { prep_time_sec: 240, skill_level: 1, temperature: 'room' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['breakfast', 'lunch'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// PIZZA
// ============================================================================

export const pizzaDiavola: Product = {
  id: 'PROD_PIZZA_DIAVOLA',
  slug: 'pizza-diavola',
  name: { en: 'Pizza Diavola', it: 'Pizza Diavola', vi: 'Pizza Diavola' },
  description: { en: 'Spicy salami pizza', it: 'Pizza con salame piccante', vi: 'Pizza xúc xích cay' },
  category: { main: 'pizza', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 3, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 220000, currency: 'VND' } },
  preparation: { prep_time_sec: 900, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const pizza4Formaggi: Product = {
  id: 'PROD_PIZZA_4FORMAGGI',
  slug: 'pizza-quattro-formaggi',
  name: { en: 'Pizza Quattro Formaggi', it: 'Pizza Quattro Formaggi', vi: 'Pizza 4 Phô Mai' },
  description: { en: 'Four cheese pizza', it: 'Pizza con quattro formaggi', vi: 'Pizza bốn loại phô mai' },
  category: { main: 'pizza', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 240000, currency: 'VND' } },
  preparation: { prep_time_sec: 900, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const pizzaProsciutto: Product = {
  id: 'PROD_PIZZA_PROSCIUTTO',
  slug: 'pizza-prosciutto-funghi',
  name: { en: 'Pizza Prosciutto e Funghi', it: 'Pizza Prosciutto e Funghi', vi: 'Pizza Giăm Bông và Nấm' },
  description: { en: 'Ham and mushroom pizza', it: 'Pizza con prosciutto cotto e funghi', vi: 'Pizza giăm bông và nấm' },
  category: { main: 'pizza', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 230000, currency: 'VND' } },
  preparation: { prep_time_sec: 900, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// PASTA
// ============================================================================

export const carbonara: Product = {
  id: 'PROD_CARBONARA',
  slug: 'carbonara',
  name: { en: 'Spaghetti Carbonara', it: 'Spaghetti alla Carbonara', vi: 'Mì Ý Carbonara' },
  description: { en: 'Classic Roman pasta with eggs, cheese and guanciale', it: 'Pasta romana classica con uova, formaggio e guanciale', vi: 'Mì Ý kiểu La Mã với trứng, phô mai và thịt xông khói' },
  category: { main: 'primi', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 180000, currency: 'VND' } },
  preparation: { prep_time_sec: 600, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const amatriciana: Product = {
  id: 'PROD_AMATRICIANA',
  slug: 'amatriciana',
  name: { en: 'Pasta Amatriciana', it: 'Pasta all\'Amatriciana', vi: 'Mì Ý Amatriciana' },
  description: { en: 'Tomato sauce with guanciale and pecorino', it: 'Salsa di pomodoro con guanciale e pecorino', vi: 'Sốt cà chua với thịt xông khói và phô mai' },
  category: { main: 'primi', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 1, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 170000, currency: 'VND' } },
  preparation: { prep_time_sec: 720, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const aglioOlio: Product = {
  id: 'PROD_AGLIO_OLIO',
  slug: 'aglio-olio',
  name: { en: 'Spaghetti Aglio e Olio', it: 'Spaghetti Aglio e Olio', vi: 'Mì Ý Tỏi và Dầu Olive' },
  description: { en: 'Simple pasta with garlic, olive oil and chili', it: 'Pasta semplice con aglio, olio d\'oliva e peperoncino', vi: 'Mì Ý đơn giản với tỏi, dầu olive và ớt' },
  category: { main: 'primi', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 140000, currency: 'VND' } },
  preparation: { prep_time_sec: 480, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const pestoPasta: Product = {
  id: 'PROD_PESTO_PASTA',
  slug: 'pesto-pasta',
  name: { en: 'Pasta al Pesto', it: 'Pasta al Pesto', vi: 'Mì Ý Pesto' },
  description: { en: 'Pasta with fresh basil pesto sauce', it: 'Pasta con salsa al pesto fresco di basilico', vi: 'Mì Ý với sốt pesto húng quế tươi' },
  category: { main: 'primi', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 165000, currency: 'VND' } },
  preparation: { prep_time_sec: 420, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const lasagna: Product = {
  id: 'PROD_LASAGNA',
  slug: 'lasagna',
  name: { en: 'Lasagna Bolognese', it: 'Lasagna alla Bolognese', vi: 'Lasagna Bolognese' },
  description: { en: 'Layered pasta with meat sauce and béchamel', it: 'Pasta a strati con ragù e besciamella', vi: 'Mì Ý nhiều lớp với sốt thịt và sốt kem' },
  category: { main: 'primi', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 195000, currency: 'VND' } },
  preparation: { prep_time_sec: 1200, skill_level: 3, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// MORE BURGERS
// ============================================================================

export const baconBurger: Product = {
  id: 'PROD_BACON_BURGER',
  slug: 'bacon-burger',
  name: { en: 'Bacon Cheeseburger', it: 'Burger con Bacon', vi: 'Burger Thịt Xông Khói' },
  description: { en: 'Juicy burger with crispy bacon and cheese', it: 'Burger succoso con bacon croccante e formaggio', vi: 'Burger thịt bò với thịt xông khói giòn và phô mai' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 185000, currency: 'VND' } },
  preparation: { prep_time_sec: 600, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const veggieBurger: Product = {
  id: 'PROD_VEGGIE_BURGER',
  slug: 'veggie-burger',
  name: { en: 'Veggie Burger', it: 'Burger Vegetariano', vi: 'Burger Chay' },
  description: { en: 'Plant-based burger with fresh vegetables', it: 'Burger vegetale con verdure fresche', vi: 'Burger chay với rau tươi' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 155000, currency: 'VND' } },
  preparation: { prep_time_sec: 540, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const chickenBurger: Product = {
  id: 'PROD_CHICKEN_BURGER',
  slug: 'chicken-burger',
  name: { en: 'Crispy Chicken Burger', it: 'Burger di Pollo Croccante', vi: 'Burger Gà Giòn' },
  description: { en: 'Crispy fried chicken burger with lettuce and mayo', it: 'Burger di pollo fritto croccante con lattuga e maionese', vi: 'Burger gà chiên giòn với rau và sốt mayo' },
  category: { main: 'piatti-unici', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 1, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 165000, currency: 'VND' } },
  preparation: { prep_time_sec: 600, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// MORE ASIAN DISHES
// ============================================================================

export const springRolls: Product = {
  id: 'PROD_SPRING_ROLLS',
  slug: 'spring-rolls',
  name: { en: 'Fresh Spring Rolls', it: 'Involtini Primavera', vi: 'Gỏi Cuốn' },
  description: { en: 'Vietnamese rice paper rolls with shrimp and vegetables', it: 'Involtini vietnamiti con gamberetti e verdure', vi: 'Gỏi cuốn tôm thịt' },
  category: { main: 'antipasti', sub: 'vietnamita' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 1, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 75000, currency: 'VND' } },
  preparation: { prep_time_sec: 360, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1594007759138-855ba53583f7?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'aperitivo'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const friedRice: Product = {
  id: 'PROD_FRIED_RICE',
  slug: 'fried-rice',
  name: { en: 'Asian Fried Rice', it: 'Riso Fritto Asiatico', vi: 'Cơm Chiên' },
  description: { en: 'Wok-fried rice with vegetables and egg', it: 'Riso saltato al wok con verdure e uova', vi: 'Cơm chiên rau củ và trứng' },
  category: { main: 'primi', sub: 'cinese' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 1, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 95000, currency: 'VND' } },
  preparation: { prep_time_sec: 420, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const ramen: Product = {
  id: 'PROD_RAMEN',
  slug: 'ramen',
  name: { en: 'Japanese Ramen', it: 'Ramen Giapponese', vi: 'Ramen Nhật' },
  description: { en: 'Rich pork broth ramen with noodles and toppings', it: 'Ramen con brodo di maiale ricco, noodles e guarnizioni', vi: 'Ramen nước dùng heo đậm đà với mì và topping' },
  category: { main: 'primi', sub: 'giapponese' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 145000, currency: 'VND' } },
  preparation: { prep_time_sec: 900, skill_level: 3, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const sushiPlatter: Product = {
  id: 'PROD_SUSHI_PLATTER',
  slug: 'sushi-platter',
  name: { en: 'Sushi Platter', it: 'Piatto di Sushi', vi: 'Đĩa Sushi' },
  description: { en: 'Assorted sushi and sashimi selection', it: 'Selezione assortita di sushi e sashimi', vi: 'Đĩa sushi và sashimi hỗn hợp' },
  category: { main: 'piatti-unici', sub: 'giapponese' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 295000, currency: 'VND' } },
  preparation: { prep_time_sec: 1200, skill_level: 3, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const bunCha: Product = {
  id: 'PROD_BUN_CHA',
  slug: 'bun-cha',
  name: { en: 'Bun Cha Hanoi', it: 'Bun Cha di Hanoi', vi: 'Bún Chả Hà Nội' },
  description: { en: 'Grilled pork with vermicelli and herbs', it: 'Maiale grigliato con vermicelli e erbe aromatiche', vi: 'Bún chả thịt nướng Hà Nội' },
  category: { main: 'primi', sub: 'vietnamita' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 95000, currency: 'VND' } },
  preparation: { prep_time_sec: 900, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// MEXICAN
// ============================================================================

export const tacos: Product = {
  id: 'PROD_TACOS',
  slug: 'tacos',
  name: { en: 'Beef Tacos', it: 'Tacos di Manzo', vi: 'Tacos Thịt Bò' },
  description: { en: 'Soft tacos with seasoned beef, salsa and guacamole', it: 'Tacos morbidi con manzo speziato, salsa e guacamole', vi: 'Tacos thịt bò với salsa và bơ nghiền' },
  category: { main: 'piatti-unici', sub: 'messicano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 3, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 135000, currency: 'VND' } },
  preparation: { prep_time_sec: 480, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const quesadilla: Product = {
  id: 'PROD_QUESADILLA',
  slug: 'quesadilla',
  name: { en: 'Chicken Quesadilla', it: 'Quesadilla di Pollo', vi: 'Quesadilla Gà' },
  description: { en: 'Grilled tortilla with cheese and chicken', it: 'Tortilla grigliata con formaggio e pollo', vi: 'Bánh tortilla nướng với phô mai và gà' },
  category: { main: 'piatti-unici', sub: 'messicano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 115000, currency: 'VND' } },
  preparation: { prep_time_sec: 420, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const burrito: Product = {
  id: 'PROD_BURRITO',
  slug: 'burrito',
  name: { en: 'Beef Burrito', it: 'Burrito di Manzo', vi: 'Burrito Thịt Bò' },
  description: { en: 'Large flour tortilla filled with beef, rice and beans', it: 'Grande tortilla di farina ripiena di manzo, riso e fagioli', vi: 'Bánh tortilla lớn nhồi thịt bò, cơm và đậu' },
  category: { main: 'piatti-unici', sub: 'messicano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 2, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 145000, currency: 'VND' } },
  preparation: { prep_time_sec: 540, skill_level: 2, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// COCKTAILS & APERITIVO
// ============================================================================

export const negroni: Product = {
  id: 'PROD_NEGRONI',
  slug: 'negroni',
  name: { en: 'Negroni', it: 'Negroni', vi: 'Negroni' },
  description: { en: 'Classic Italian cocktail with gin, vermouth and Campari', it: 'Cocktail italiano classico con gin, vermouth e Campari', vi: 'Cocktail Ý cổ điển với rượu gin, vermouth và Campari' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'italian' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 180000, currency: 'VND' } },
  preparation: { prep_time_sec: 120, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const cosmopolitan: Product = {
  id: 'PROD_COSMOPOLITAN',
  slug: 'cosmopolitan',
  name: { en: 'Cosmopolitan', it: 'Cosmopolitan', vi: 'Cosmopolitan' },
  description: { en: 'Vodka cocktail with cranberry and lime', it: 'Cocktail vodka con mirtillo rosso e lime', vi: 'Cocktail vodka với nước nam việt quất và chanh' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'american' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 175000, currency: 'VND' } },
  preparation: { prep_time_sec: 150, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const margarita: Product = {
  id: 'PROD_MARGARITA',
  slug: 'margarita',
  name: { en: 'Margarita', it: 'Margarita', vi: 'Margarita' },
  description: { en: 'Classic tequila cocktail with lime and salt', it: 'Cocktail tequila classico con lime e sale', vi: 'Cocktail tequila cổ điển với chanh và muối' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'mexican' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 170000, currency: 'VND' } },
  preparation: { prep_time_sec: 120, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const caipirinha: Product = {
  id: 'PROD_CAIPIRINHA',
  slug: 'caipirinha',
  name: { en: 'Caipirinha', it: 'Caipirinha', vi: 'Caipirinha' },
  description: { en: 'Brazilian cachaça cocktail with lime and sugar', it: 'Cocktail brasiliano con cachaça, lime e zucchero', vi: 'Cocktail Brazil với rượu cachaça, chanh và đường' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'brazilian' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 165000, currency: 'VND' } },
  preparation: { prep_time_sec: 180, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1546171753-97d7676e9da6?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const ginTonic: Product = {
  id: 'PROD_GIN_TONIC',
  slug: 'gin-tonic',
  name: { en: 'Gin & Tonic', it: 'Gin Tonic', vi: 'Gin Tonic' },
  description: { en: 'Classic gin and tonic with cucumber and lime', it: 'Gin tonic classico con cetriolo e lime', vi: 'Gin tonic cổ điển với dưa leo và chanh' },
  category: { main: 'bevande', sub: 'cocktails', tertiary: 'classic', origin: 'british' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 155000, currency: 'VND' } },
  preparation: { prep_time_sec: 90, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1602280887959-d8c00a69e1e3?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['aperitivo', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// MORE DESSERTS
// ============================================================================

export const pannaCotta: Product = {
  id: 'PROD_PANNA_COTTA',
  slug: 'panna-cotta',
  name: { en: 'Panna Cotta', it: 'Panna Cotta', vi: 'Panna Cotta' },
  description: { en: 'Italian cream dessert with berry sauce', it: 'Dessert italiano alla panna con salsa ai frutti di bosco', vi: 'Tráng miệng kem Ý với sốt quả mọng' },
  category: { main: 'dessert', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 85000, currency: 'VND' } },
  preparation: { prep_time_sec: 240, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const gelato: Product = {
  id: 'PROD_GELATO',
  slug: 'gelato',
  name: { en: 'Italian Gelato', it: 'Gelato Artigianale', vi: 'Kem Gelato Ý' },
  description: { en: 'Artisan Italian ice cream - 3 scoops', it: 'Gelato artigianale italiano - 3 palline', vi: 'Kem Ý thủ công - 3 viên' },
  category: { main: 'dessert', sub: 'italiano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 75000, currency: 'VND' } },
  preparation: { prep_time_sec: 60, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night', 'all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const cheesecake: Product = {
  id: 'PROD_CHEESECAKE',
  slug: 'cheesecake',
  name: { en: 'New York Cheesecake', it: 'Cheesecake New York', vi: 'Bánh Phô Mai New York' },
  description: { en: 'Classic baked cheesecake with graham cracker crust', it: 'Cheesecake classica al forno con base di biscotti', vi: 'Bánh phô mai nướng cổ điển với đế bánh quy' },
  category: { main: 'dessert', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 95000, currency: 'VND' } },
  preparation: { prep_time_sec: 180, skill_level: 2, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const brownie: Product = {
  id: 'PROD_BROWNIE',
  slug: 'chocolate-brownie',
  name: { en: 'Chocolate Brownie', it: 'Brownie al Cioccolato', vi: 'Brownie Socola' },
  description: { en: 'Warm chocolate brownie with vanilla ice cream', it: 'Brownie al cioccolato caldo con gelato alla vaniglia', vi: 'Brownie socola nóng với kem vani' },
  category: { main: 'dessert', sub: 'americano' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 90000, currency: 'VND' } },
  preparation: { prep_time_sec: 240, skill_level: 1, temperature: 'hot' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['lunch', 'dinner', 'late-night'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// ALL-DAY DRINKS
// ============================================================================

export const redWine: Product = {
  id: 'PROD_RED_WINE',
  slug: 'red-wine',
  name: { en: 'Red Wine Glass', it: 'Calice di Vino Rosso', vi: 'Ly Rượu Vang Đỏ' },
  description: { en: 'Glass of house red wine', it: 'Calice di vino rosso della casa', vi: 'Ly rượu vang đỏ nhà' },
  category: { main: 'bevande', sub: 'wine', tertiary: 'red', origin: 'italian' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 120000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'room' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const whiteWine: Product = {
  id: 'PROD_WHITE_WINE',
  slug: 'white-wine',
  name: { en: 'White Wine Glass', it: 'Calice di Vino Bianco', vi: 'Ly Rượu Vang Trắng' },
  description: { en: 'Glass of chilled house white wine', it: 'Calice di vino bianco fresco della casa', vi: 'Ly rượu vang trắng lạnh nhà' },
  category: { main: 'bevande', sub: 'wine', tertiary: 'white', origin: 'italian' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 120000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const prosecco: Product = {
  id: 'PROD_PROSECCO',
  slug: 'prosecco',
  name: { en: 'Prosecco Glass', it: 'Calice di Prosecco', vi: 'Ly Prosecco' },
  description: { en: 'Glass of Italian sparkling wine', it: 'Calice di vino spumante italiano', vi: 'Ly rượu vang sủi bọt Ý' },
  category: { main: 'bevande', sub: 'sparkling', origin: 'italian' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 150000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const saigonBeer: Product = {
  id: 'PROD_SAIGON_BEER',
  slug: 'saigon-beer',
  name: { en: 'Saigon Beer', it: 'Birra Saigon', vi: 'Bia Sài Gòn' },
  description: { en: 'Vietnamese local lager beer', it: 'Birra lager vietnamita locale', vi: 'Bia lager Việt Nam' },
  category: { main: 'bevande', sub: 'beer', tertiary: 'bottled', origin: 'vietnamese' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 45000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const tigerBeer: Product = {
  id: 'PROD_TIGER_BEER',
  slug: 'tiger-beer',
  name: { en: 'Tiger Beer', it: 'Birra Tiger', vi: 'Bia Tiger' },
  description: { en: 'Singapore premium lager', it: 'Birra lager premium di Singapore', vi: 'Bia lager cao cấp Singapore' },
  category: { main: 'bevande', sub: 'beer', tertiary: 'lager', origin: 'singaporean' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 60000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const sparklingWater: Product = {
  id: 'PROD_SPARKLING_WATER',
  slug: 'sparkling-water',
  name: { en: 'Sparkling Water', it: 'Acqua Frizzante', vi: 'Nước Khoáng Có Gas' },
  description: { en: 'Bottle of sparkling mineral water', it: 'Bottiglia di acqua minerale frizzante', vi: 'Chai nước khoáng có ga' },
  category: { main: 'bevande', sub: 'acqua', tertiary: 'frizzante' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 35000, currency: 'VND' } },
  preparation: { prep_time_sec: 30, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

export const orangeJuice: Product = {
  id: 'PROD_ORANGE_JUICE',
  slug: 'orange-juice',
  name: { en: 'Fresh Orange Juice', it: 'Succo d\'Arancia Fresco', vi: 'Nước Cam Tươi' },
  description: { en: 'Freshly squeezed orange juice', it: 'Succo d\'arancia appena spremuto', vi: 'Nước cam vắt tươi' },
  category: { main: 'bevande', sub: 'soft-drinks', tertiary: 'juice' },
  ingredients: [],
  computed: { allergens: [], intolerances: [], suitable_for_diets: [], spice_level: 0, allergen_compliance: { EU: true, USA: true, Korea: true, Japan: true, Canada: true, Australia: true, China: true, Singapore: true, Vietnam: true } },
  pricing: { selling_price_local: { amount: 65000, currency: 'VND' } },
  preparation: { prep_time_sec: 120, skill_level: 1, temperature: 'cold' },
  media: { images: { thumbnail: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop', gallery: [] } },
  availability: { time_slots: ['all-day'] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
};

// ============================================================================
// EXPORTS
// ============================================================================

export const rootsProducts = [
  // Original ROOTS products
  limeJuice,
  immunityBoosterShot,
  celeryJuice,
  peanutButterToast,
  matchaOatsLatte,
  turmericGoldenLatte,
  cacaoLatte,
  beetHummusToast,
  cacaoDreamBowl,
  espresso,
  americano,
  cashewCappuccino,
  greenPeaceBowl,
  mangoSmoothie,
  berrySmoothie,
  greenSmoothie,
  flatWhite,
  mocha,
  avocadoToast,
  // International demo products - Breakfast
  pancakes,
  frenchToast,
  croissant,
  eggsBenedict,
  breakfastBurrito,
  phoBreakfast,
  banhMi,
  // Pizza
  pizzaMargherita,
  pizzaDiavola,
  pizza4Formaggi,
  pizzaProsciutto,
  // Pasta
  carbonara,
  amatriciana,
  aglioOlio,
  pestoPasta,
  lasagna,
  // Asian
  padThai,
  springRolls,
  friedRice,
  ramen,
  sushiPlatter,
  bunCha,
  // Burgers
  classicBurger,
  baconBurger,
  veggieBurger,
  chickenBurger,
  // Mexican
  tacos,
  quesadilla,
  burrito,
  // Cocktails
  spritzCocktail,
  mojito,
  negroni,
  cosmopolitan,
  margarita,
  caipirinha,
  ginTonic,
  // Desserts
  tiramisu,
  pannaCotta,
  gelato,
  cheesecake,
  brownie,
  // All-day drinks
  cocaCola,
  beerHeineken,
  redWine,
  whiteWine,
  prosecco,
  saigonBeer,
  tigerBeer,
  sparklingWater,
  orangeJuice,
];

export const ROOTS_PRODUCT_COUNT = rootsProducts.length;
