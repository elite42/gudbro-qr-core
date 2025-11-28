/**
 * GUDBRO Ingredient Database - Sauces, Oils & Sweeteners
 *
 * Additional ingredients extracted from ROOTS and Coffee House menus
 * Focus: Syrups, Sauces, Oils, Alternative Sweeteners
 */

import type { IngredientMaster } from '../types';

export const saucesOilsSweeteners: IngredientMaster[] = [
  // ========================================================================
  // SYRUPS & SWEETENERS
  // ========================================================================
  {
    id: 'ING_VANILLA_SYRUP',
    slug: 'vanilla-syrup',
    name: {
      en: 'Vanilla Syrup',
      it: 'Sciroppo di Vaniglia',
      vi: 'Siro Vani',
      ko: '바닐라 시럽',
      ja: 'バニラシロップ',
    },
    category: { main: 'sweeteners', sub: 'syrups' },
    allergens: {},
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 65.0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 65.0,
      calories_kcal: 260,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_CARAMEL_SYRUP',
    slug: 'caramel-syrup',
    name: {
      en: 'Caramel Syrup',
      it: 'Sciroppo di Caramello',
      vi: 'Siro Caramel',
      ko: '캐러멜 시럽',
      ja: 'キャラメルシロップ',
    },
    category: { main: 'sweeteners', sub: 'syrups' },
    allergens: {},
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 67.0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 67.0,
      calories_kcal: 268,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_CHOCOLATE_SYRUP',
    slug: 'chocolate-syrup',
    name: {
      en: 'Chocolate Syrup',
      it: 'Sciroppo di Cioccolato',
      vi: 'Siro Sô-cô-la',
      ko: '초콜릿 시럽',
      ja: 'チョコレートシロップ',
    },
    category: { main: 'sweeteners', sub: 'syrups' },
    allergens: {},
    intolerances: {
      caffeine: true,
      histamine: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 1.0,
      carbs_g: 65.0,
      fat_g: 0.5,
      fiber_g: 2.0,
      sugar_g: 60.0,
      calories_kcal: 270,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_MAPLE_SYRUP',
    slug: 'maple-syrup',
    name: {
      en: 'Maple Syrup',
      it: 'Sciroppo d\'Acero',
      vi: 'Siro Phong',
      ko: '메이플 시럽',
      ja: 'メープルシロップ',
    },
    description: {
      en: 'Pure maple syrup, natural sweetener',
      it: 'Sciroppo d\'acero puro, dolcificante naturale',
      vi: 'Siro phong nguyên chất',
    },
    category: { main: 'sweeteners', sub: 'natural' },
    allergens: {},
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 67.0,
      fat_g: 0.2,
      fiber_g: 0,
      sugar_g: 60.0,
      calories_kcal: 260,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_AGAVE_SYRUP',
    slug: 'agave-syrup',
    name: {
      en: 'Agave Syrup',
      it: 'Sciroppo di Agave',
      vi: 'Siro Agave',
      ko: '아가베 시럽',
      ja: 'アガベシロップ',
    },
    description: {
      en: 'Natural sweetener from agave plant, low glycemic index',
      it: 'Dolcificante naturale dalla pianta di agave, basso indice glicemico',
      vi: 'Chất ngọt tự nhiên từ cây agave, chỉ số đường huyết thấp',
    },
    category: { main: 'sweeteners', sub: 'natural' },
    allergens: {},
    intolerances: {
      fructose: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.1,
      carbs_g: 76.4,
      fat_g: 0.5,
      fiber_g: 0.2,
      sugar_g: 68.0,
      calories_kcal: 310,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_DATES',
    slug: 'dates',
    name: {
      en: 'Dates',
      it: 'Datteri',
      vi: 'Chà Là',
      ko: '대추야자',
      ja: 'ナツメヤシ',
    },
    description: {
      en: 'Natural sweetener, whole food',
      it: 'Dolcificante naturale, cibo integrale',
      vi: 'Chất ngọt tự nhiên từ trái cây',
    },
    category: { main: 'fruits', sub: 'dried' },
    allergens: {},
    intolerances: {
      fodmap: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 2.5,
      carbs_g: 75.0,
      fat_g: 0.4,
      fiber_g: 8.0,
      sugar_g: 63.4,
      calories_kcal: 282,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // OILS & FATS
  // ========================================================================
  {
    id: 'ING_OLIVE_OIL',
    slug: 'olive-oil',
    name: {
      en: 'Olive Oil',
      it: 'Olio d\'Oliva',
      vi: 'Dầu Ô-liu',
      ko: '올리브 오일',
      ja: 'オリーブオイル',
    },
    category: { main: 'oils', sub: 'vegetable' },
    allergens: {
      olive: true, // Can be an allergen for some
    },
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 0,
      fat_g: 100.0,
      fiber_g: 0,
      calories_kcal: 884,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SAUCES & CONDIMENTS
  // ========================================================================
  {
    id: 'ING_PESTO',
    slug: 'pesto',
    name: {
      en: 'Pesto',
      it: 'Pesto',
      vi: 'Sốt Pesto',
      ko: '페스토',
      ja: 'ペスト',
    },
    description: {
      en: 'Basil pesto sauce',
      it: 'Salsa al pesto di basilico',
      vi: 'Sốt pesto húng quế',
    },
    category: { main: 'sauces', sub: 'paste' },
    allergens: {
      nuts: true, // Pine nuts
      milk: true, // Parmesan cheese
    },
    intolerances: {
      lactose: true,
    },
    dietary_restrictions: {
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 5.0,
      carbs_g: 5.0,
      fat_g: 50.0,
      fiber_g: 1.0,
      calories_kcal: 500,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_HUMMUS',
    slug: 'hummus',
    name: {
      en: 'Hummus',
      it: 'Hummus',
      vi: 'Hummus',
      ko: '후무스',
      ja: 'フムス',
    },
    description: {
      en: 'Chickpea and tahini spread',
      it: 'Crema di ceci e tahini',
      vi: 'Tương đậu gà và mè',
    },
    category: { main: 'sauces', sub: 'spread' },
    allergens: {
      sesame: true, // From tahini
    },
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 7.9,
      carbs_g: 14.3,
      fat_g: 10.0,
      fiber_g: 6.0,
      calories_kcal: 166,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_SOY_SAUCE',
    slug: 'soy-sauce',
    name: {
      en: 'Soy Sauce',
      it: 'Salsa di Soia',
      vi: 'Nước Tương',
      ko: '간장',
      ja: '醤油',
    },
    category: { main: 'sauces', sub: 'fermented' },
    allergens: {
      soybeans: true,
      gluten: true, // Most soy sauce contains wheat
    },
    intolerances: {
      gluten_celiac: true,
      histamine: true,
      msg: true, // Can contain naturally occurring MSG
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 10.5,
      carbs_g: 8.1,
      fat_g: 0.1,
      fiber_g: 0.8,
      salt_g: 16.0,
      calories_kcal: 53,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_BALSAMIC_VINEGAR',
    slug: 'balsamic-vinegar',
    name: {
      en: 'Balsamic Vinegar',
      it: 'Aceto Balsamico',
      vi: 'Giấm Balsamic',
      ko: '발사믹 식초',
      ja: 'バルサミコ酢',
    },
    category: { main: 'sauces', sub: 'vinegar' },
    allergens: {
      sulphites: true,
    },
    intolerances: {
      sulphites_intolerance: true,
      histamine: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.5,
      carbs_g: 17.0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 14.0,
      calories_kcal: 88,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_APPLE_CIDER_VINEGAR',
    slug: 'apple-cider-vinegar',
    name: {
      en: 'Apple Cider Vinegar',
      it: 'Aceto di Mele',
      vi: 'Giấm Táo',
      ko: '사과 식초',
      ja: 'アップルサイダービネガー',
    },
    category: { main: 'sauces', sub: 'vinegar' },
    allergens: {},
    intolerances: {
      histamine: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 0.9,
      fat_g: 0,
      fiber_g: 0,
      calories_kcal: 22,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // BREAD & WRAPS
  // ========================================================================
  {
    id: 'ING_SOURDOUGH_BREAD',
    slug: 'sourdough-bread',
    name: {
      en: 'Sourdough Bread',
      it: 'Pane a Lievitazione Naturale',
      vi: 'Bánh Mì Men Chua',
      ko: '사워도우 빵',
      ja: 'サワードウブレッド',
    },
    category: { main: 'grains', sub: 'bread' },
    allergens: {
      gluten: true,
    },
    intolerances: {
      gluten_celiac: true,
      fodmap: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 9.0,
      carbs_g: 49.0,
      fat_g: 1.5,
      fiber_g: 2.5,
      calories_kcal: 240,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_PITA_BREAD',
    slug: 'pita-bread',
    name: {
      en: 'Pita Bread',
      it: 'Pane Pita',
      vi: 'Bánh Mì Pita',
      ko: '피타 빵',
      ja: 'ピタパン',
    },
    category: { main: 'grains', sub: 'bread' },
    allergens: {
      gluten: true,
    },
    intolerances: {
      gluten_celiac: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 8.7,
      carbs_g: 55.7,
      fat_g: 1.2,
      fiber_g: 2.2,
      calories_kcal: 262,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SPECIAL INGREDIENTS
  // ========================================================================
  {
    id: 'ING_NUTRITIONAL_YEAST',
    slug: 'nutritional-yeast',
    name: {
      en: 'Nutritional Yeast',
      it: 'Lievito Alimentare',
      vi: 'Men Dinh Dưỡng',
      ko: '영양 효모',
      ja: '栄養酵母',
    },
    description: {
      en: 'Deactivated yeast, vegan cheese flavor',
      it: 'Lievito disattivato, sapore di formaggio vegano',
      vi: 'Men bất hoạt, hương vị phô mai chay',
    },
    category: { main: 'supplements', sub: 'yeast' },
    allergens: {},
    intolerances: {
      histamine: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 50.0,
      carbs_g: 40.0,
      fat_g: 7.0,
      fiber_g: 25.0,
      calories_kcal: 325,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_TEMPEH',
    slug: 'tempeh',
    name: {
      en: 'Tempeh',
      it: 'Tempeh',
      vi: 'Tempeh',
      ko: '템페',
      ja: 'テンペ',
    },
    description: {
      en: 'Fermented soybean cake',
      it: 'Torta di soia fermentata',
      vi: 'Bánh đậu nành lên men',
    },
    category: { main: 'proteins', sub: 'plant-based' },
    allergens: {
      soybeans: true,
    },
    intolerances: {
      histamine: true,
    },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 19.0,
      carbs_g: 9.0,
      fat_g: 11.0,
      fiber_g: 9.0,
      calories_kcal: 193,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },
];

export const SAUCES_OILS_SWEETENERS_COUNT = saucesOilsSweeteners.length;
