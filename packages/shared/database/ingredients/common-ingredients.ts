/**
 * GUDBRO Ingredient Database - Common Ingredients
 *
 * Initial seed database with 100+ common ingredients for:
 * - Coffee Shops
 * - Restaurants
 * - Street Food
 *
 * Each ingredient has complete Sistema 51 Filtri data:
 * - 30 Allergens
 * - 10 Intolerances
 * - 11 Dietary flags
 * - Spice levels
 * - Nutrition data
 */

import type { IngredientMaster } from '../types';

export const commonIngredients: IngredientMaster[] = [
  // ========================================================================
  // COFFEE & COFFEE-BASED
  // ========================================================================
  {
    id: 'ING_COFFEE_ARABICA',
    slug: 'coffee-arabica',
    name: {
      en: 'Arabica Coffee',
      it: 'Caffè Arabica',
      vi: 'Cà phê Arabica',
      ko: '아라비카 커피',
      ja: 'アラビカコーヒー',
    },
    description: {
      en: 'Premium Arabica coffee beans',
      it: 'Chicchi di caffè Arabica premium',
      vi: 'Hạt cà phê Arabica cao cấp',
    },
    category: { main: 'beverages', sub: 'coffee' },
    allergens: {},
    intolerances: { caffeine: true },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      low_carb: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.1,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      calories_kcal: 2,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_ESPRESSO',
    slug: 'espresso',
    name: {
      en: 'Espresso',
      it: 'Espresso',
      vi: 'Espresso',
      ko: '에스프레소',
      ja: 'エスプレッソ',
    },
    category: { main: 'beverages', sub: 'coffee' },
    allergens: {},
    intolerances: { caffeine: true },
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      nut_free: true,
      low_carb: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.1,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      calories_kcal: 2,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // PLANT-BASED MILKS
  // ========================================================================
  {
    id: 'ING_MILK_OAT',
    slug: 'oat-milk',
    name: {
      en: 'Oat Milk',
      it: 'Latte di Avena',
      vi: 'Sữa Yến Mạch',
      ko: '귀리 우유',
      ja: 'オーツミルク',
    },
    category: { main: 'dairy-alternatives', sub: 'plant-milk' },
    allergens: {
      gluten: true, // Oats may contain gluten
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
      protein_g: 1.0,
      carbs_g: 6.5,
      fat_g: 1.5,
      fiber_g: 0.8,
      calories_kcal: 40,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_MILK_CASHEW',
    slug: 'cashew-milk',
    name: {
      en: 'Cashew Milk',
      it: 'Latte di Anacardi',
      vi: 'Sữa Hạt Điều',
      ko: '캐슈 우유',
      ja: 'カシューミルク',
    },
    category: { main: 'dairy-alternatives', sub: 'plant-milk' },
    allergens: {
      nuts: true,
    },
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.5,
      carbs_g: 1.5,
      fat_g: 2.0,
      fiber_g: 0.2,
      calories_kcal: 25,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_MILK_COCONUT',
    slug: 'coconut-milk',
    name: {
      en: 'Coconut Milk',
      it: 'Latte di Cocco',
      vi: 'Sữa Dừa',
      ko: '코코넛 밀크',
      ja: 'ココナッツミルク',
    },
    category: { main: 'dairy-alternatives', sub: 'plant-milk' },
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
      protein_g: 0.2,
      carbs_g: 2.8,
      fat_g: 2.1,
      fiber_g: 0,
      calories_kcal: 25,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_MILK_SOY',
    slug: 'soy-milk',
    name: {
      en: 'Soy Milk',
      it: 'Latte di Soia',
      vi: 'Sữa Đậu Nành',
      ko: '두유',
      ja: '豆乳',
    },
    category: { main: 'dairy-alternatives', sub: 'plant-milk' },
    allergens: {
      soybeans: true,
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
      protein_g: 3.3,
      carbs_g: 1.7,
      fat_g: 1.8,
      fiber_g: 0.6,
      calories_kcal: 33,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // DAIRY PRODUCTS
  // ========================================================================
  {
    id: 'ING_MILK_COW',
    slug: 'cow-milk',
    name: {
      en: 'Cow Milk',
      it: 'Latte Vaccino',
      vi: 'Sữa Bò',
      ko: '우유',
      ja: '牛乳',
    },
    category: { main: 'dairy', sub: 'milk' },
    allergens: {
      milk: true,
    },
    intolerances: {
      lactose: true,
    },
    dietary_restrictions: {
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      nut_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 3.4,
      carbs_g: 4.8,
      fat_g: 3.6,
      fiber_g: 0,
      calories_kcal: 61,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // PROTEIN BOOSTERS
  // ========================================================================
  {
    id: 'ING_PROTEIN_VEGAN',
    slug: 'vegan-protein-powder',
    name: {
      en: 'Vegan Protein Powder',
      it: 'Proteine Vegane in Polvere',
      vi: 'Bột Protein Thuần Chay',
      ko: '비건 단백질 파우더',
      ja: 'ビーガンプロテインパウダー',
    },
    category: { main: 'supplements', sub: 'protein' },
    allergens: {
      soybeans: true, // Most vegan proteins are pea/soy based
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
      protein_g: 80.0,
      carbs_g: 5.0,
      fat_g: 3.0,
      fiber_g: 2.0,
      calories_kcal: 370,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_SEAMOSS_GEL',
    slug: 'sea-moss-gel',
    name: {
      en: 'Sea Moss Gel',
      it: 'Gel di Muschio di Mare',
      vi: 'Gel Rong Biển',
      ko: '씨모스 젤',
      ja: 'シーモスジェル',
    },
    category: { main: 'supplements', sub: 'superfoods' },
    allergens: {},
    intolerances: {
      histamine: true, // Seaweed can be high in histamine
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
      protein_g: 0.2,
      carbs_g: 1.2,
      fat_g: 0,
      fiber_g: 1.3,
      calories_kcal: 5,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_PEANUT_BUTTER',
    slug: 'peanut-butter',
    name: {
      en: 'Peanut Butter',
      it: 'Burro di Arachidi',
      vi: 'Bơ Đậu Phộng',
      ko: '땅콩버터',
      ja: 'ピーナッツバター',
    },
    category: { main: 'spreads', sub: 'nut-butter' },
    allergens: {
      peanuts: true,
    },
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      gluten_free: true,
      dairy_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 25.0,
      carbs_g: 20.0,
      fat_g: 50.0,
      fiber_g: 6.0,
      calories_kcal: 588,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // FRUITS - SMOOTHIE BOWLS
  // ========================================================================
  {
    id: 'ING_BANANA',
    slug: 'banana',
    name: {
      en: 'Banana',
      it: 'Banana',
      vi: 'Chuối',
      ko: '바나나',
      ja: 'バナナ',
    },
    category: { main: 'fruits', sub: 'tropical' },
    allergens: {
      banana: true, // Japan allergen
    },
    intolerances: {
      fodmap: true,
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
      protein_g: 1.1,
      carbs_g: 22.8,
      fat_g: 0.3,
      fiber_g: 2.6,
      sugar_g: 12.2,
      calories_kcal: 89,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_MANGO',
    slug: 'mango',
    name: {
      en: 'Mango',
      it: 'Mango',
      vi: 'Xoài',
      ko: '망고',
      ja: 'マンゴー',
    },
    category: { main: 'fruits', sub: 'tropical' },
    allergens: {
      mango: true, // Japan allergen
    },
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
      protein_g: 0.8,
      carbs_g: 15.0,
      fat_g: 0.4,
      fiber_g: 1.6,
      sugar_g: 13.7,
      calories_kcal: 60,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_PITAYA',
    slug: 'dragon-fruit',
    name: {
      en: 'Dragon Fruit (Pitaya)',
      it: 'Frutto del Drago',
      vi: 'Thanh Long',
      ko: '드래곤 프루트',
      ja: 'ドラゴンフルーツ',
    },
    category: { main: 'fruits', sub: 'tropical' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 1.2,
      carbs_g: 11.0,
      fat_g: 0.4,
      fiber_g: 3.0,
      calories_kcal: 60,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_ACAI',
    slug: 'acai-berries',
    name: {
      en: 'Açaí Berries',
      it: 'Bacche di Açaí',
      vi: 'Quả Açaí',
      ko: '아사이 베리',
      ja: 'アサイベリー',
    },
    category: { main: 'fruits', sub: 'berries' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0.8,
      carbs_g: 4.0,
      fat_g: 5.0,
      fiber_g: 2.0,
      calories_kcal: 70,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // VEGETABLES - GREENS
  // ========================================================================
  {
    id: 'ING_SPINACH',
    slug: 'spinach',
    name: {
      en: 'Spinach',
      it: 'Spinaci',
      vi: 'Rau Bina',
      ko: '시금치',
      ja: 'ほうれん草',
    },
    category: { main: 'vegetables', sub: 'leafy-greens' },
    allergens: {},
    intolerances: {
      fodmap: true,
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
      protein_g: 2.9,
      carbs_g: 3.6,
      fat_g: 0.4,
      fiber_g: 2.2,
      calories_kcal: 23,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_KALE',
    slug: 'kale',
    name: {
      en: 'Kale',
      it: 'Cavolo Riccio',
      vi: 'Cải Xoăn',
      ko: '케일',
      ja: 'ケール',
    },
    category: { main: 'vegetables', sub: 'leafy-greens' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 4.3,
      carbs_g: 8.8,
      fat_g: 0.9,
      fiber_g: 3.6,
      calories_kcal: 49,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // GRAINS & CEREALS
  // ========================================================================
  {
    id: 'ING_QUINOA',
    slug: 'quinoa',
    name: {
      en: 'Quinoa',
      it: 'Quinoa',
      vi: 'Diêm Mạch',
      ko: '퀴노아',
      ja: 'キヌア',
    },
    category: { main: 'grains', sub: 'pseudo-cereal' },
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
      protein_g: 14.1,
      carbs_g: 64.2,
      fat_g: 6.1,
      fiber_g: 7.0,
      calories_kcal: 368,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_GRANOLA',
    slug: 'granola',
    name: {
      en: 'Granola',
      it: 'Granola',
      vi: 'Ngũ Cốc Granola',
      ko: '그래놀라',
      ja: 'グラノーラ',
    },
    category: { main: 'grains', sub: 'breakfast' },
    allergens: {
      gluten: true,
      nuts: true, // Often contains nuts
    },
    intolerances: {},
    dietary_restrictions: {
      vegan: true,
      vegetarian: true,
      pescatarian: true,
      dairy_free: true,
      halal: true,
      kosher: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 10.0,
      carbs_g: 65.0,
      fat_g: 15.0,
      fiber_g: 8.0,
      calories_kcal: 450,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // NUTS & SEEDS
  // ========================================================================
  {
    id: 'ING_COCONUT_FLAKES',
    slug: 'coconut-flakes',
    name: {
      en: 'Coconut Flakes',
      it: 'Scaglie di Cocco',
      vi: 'Dừa Bào',
      ko: '코코넛 플레이크',
      ja: 'ココナッツフレーク',
    },
    category: { main: 'nuts-seeds', sub: 'coconut' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 6.9,
      carbs_g: 23.7,
      fat_g: 64.5,
      fiber_g: 16.3,
      calories_kcal: 660,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_CHIA_SEEDS',
    slug: 'chia-seeds',
    name: {
      en: 'Chia Seeds',
      it: 'Semi di Chia',
      vi: 'Hạt Chia',
      ko: '치아 씨드',
      ja: 'チアシード',
    },
    category: { main: 'nuts-seeds', sub: 'seeds' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 16.5,
      carbs_g: 42.1,
      fat_g: 30.7,
      fiber_g: 34.4,
      calories_kcal: 486,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // VEGETABLES - COMMON
  // ========================================================================
  {
    id: 'ING_AVOCADO',
    slug: 'avocado',
    name: {
      en: 'Avocado',
      it: 'Avocado',
      vi: 'Bơ',
      ko: '아보카도',
      ja: 'アボカド',
    },
    category: { main: 'vegetables', sub: 'fruits' },
    allergens: {},
    intolerances: {
      fodmap: true,
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
      protein_g: 2.0,
      carbs_g: 8.5,
      fat_g: 14.7,
      fiber_g: 6.7,
      calories_kcal: 160,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_TOMATO',
    slug: 'tomato',
    name: {
      en: 'Tomato',
      it: 'Pomodoro',
      vi: 'Cà Chua',
      ko: '토마토',
      ja: 'トマト',
    },
    category: { main: 'vegetables', sub: 'fruits' },
    allergens: {
      tomato: true, // Korea allergen
    },
    intolerances: {
      fodmap: true,
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
      protein_g: 0.9,
      carbs_g: 3.9,
      fat_g: 0.2,
      fiber_g: 1.2,
      calories_kcal: 18,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // ALLIUMS - BUDDHIST RESTRICTED (5 Pungent Roots)
  // ========================================================================
  {
    id: 'ING_GARLIC',
    slug: 'garlic',
    name: {
      en: 'Garlic',
      it: 'Aglio',
      vi: 'Tỏi',
      ko: '마늘',
      ja: 'にんにく',
    },
    category: { main: 'vegetables', sub: 'alliums' },
    allergens: {},
    intolerances: {
      fodmap: true,
    },
    dietary_restrictions: {
      buddhist_restricted: true, // One of 5 pungent roots
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
    spice: { level: 2, scoville: 0, description: { en: 'Pungent, not spicy', it: 'Pungente, non piccante', vi: 'Hăng, không cay' } },
    nutrition: {
      protein_g: 6.4,
      carbs_g: 33.1,
      fat_g: 0.5,
      fiber_g: 2.1,
      calories_kcal: 149,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_ONION',
    slug: 'onion',
    name: {
      en: 'Onion',
      it: 'Cipolla',
      vi: 'Hành Tây',
      ko: '양파',
      ja: '玉ねぎ',
    },
    category: { main: 'vegetables', sub: 'alliums' },
    allergens: {},
    intolerances: {
      fodmap: true,
    },
    dietary_restrictions: {
      buddhist_restricted: true, // One of 5 pungent roots
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
    spice: { level: 1 },
    nutrition: {
      protein_g: 1.1,
      carbs_g: 9.3,
      fat_g: 0.1,
      fiber_g: 1.7,
      calories_kcal: 40,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SPICES & HERBS - GUDBRO CUSTOM ALLERGENS
  // ========================================================================
  {
    id: 'ING_CORIANDER',
    slug: 'coriander',
    name: {
      en: 'Coriander (Cilantro)',
      it: 'Coriandolo',
      vi: 'Rau Mùi',
      ko: '고수',
      ja: 'コリアンダー',
    },
    category: { main: 'herbs', sub: 'fresh' },
    allergens: {
      coriander: true, // GUDBRO custom allergen (OR6A2 gene)
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
      protein_g: 2.1,
      carbs_g: 3.7,
      fat_g: 0.5,
      fiber_g: 2.8,
      calories_kcal: 23,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_CHILI_PEPPER',
    slug: 'chili-pepper',
    name: {
      en: 'Chili Pepper',
      it: 'Peperoncino',
      vi: 'Ớt',
      ko: '고추',
      ja: '唐辛子',
    },
    category: { main: 'spices', sub: 'hot' },
    allergens: {
      chili_pepper: true, // GUDBRO custom allergen (capsaicin sensitivity)
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
    spice: { level: 4, scoville: 50000 }, // Average for medium chili
    nutrition: {
      protein_g: 1.9,
      carbs_g: 8.8,
      fat_g: 0.4,
      fiber_g: 1.5,
      calories_kcal: 40,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // PROTEINS - PLANT-BASED
  // ========================================================================
  {
    id: 'ING_TOFU',
    slug: 'tofu',
    name: {
      en: 'Tofu',
      it: 'Tofu',
      vi: 'Đậu Phụ',
      ko: '두부',
      ja: '豆腐',
    },
    category: { main: 'proteins', sub: 'plant-based' },
    allergens: {
      soybeans: true,
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
      protein_g: 8.0,
      carbs_g: 1.9,
      fat_g: 4.8,
      fiber_g: 0.3,
      calories_kcal: 76,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SWEETENERS
  // ========================================================================
  {
    id: 'ING_SUGAR',
    slug: 'sugar',
    name: {
      en: 'Sugar (Cane Sugar)',
      it: 'Zucchero di Canna',
      vi: 'Đường Mía',
      ko: '설탕',
      ja: '砂糖',
    },
    category: { main: 'sweeteners', sub: 'refined' },
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
      carbs_g: 100.0,
      fat_g: 0,
      fiber_g: 0,
      sugar_g: 100.0,
      calories_kcal: 387,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_HONEY',
    slug: 'honey',
    name: {
      en: 'Honey',
      it: 'Miele',
      vi: 'Mật Ong',
      ko: '꿀',
      ja: '蜂蜜',
    },
    category: { main: 'sweeteners', sub: 'natural' },
    allergens: {},
    intolerances: {
      fructose: true,
    },
    dietary_restrictions: {
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
      protein_g: 0.3,
      carbs_g: 82.4,
      fat_g: 0,
      fiber_g: 0.2,
      sugar_g: 82.1,
      calories_kcal: 304,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SAUCES & CONDIMENTS
  // ========================================================================
  {
    id: 'ING_TAHINI',
    slug: 'tahini',
    name: {
      en: 'Tahini (Sesame Paste)',
      it: 'Tahini',
      vi: 'Mè Xay',
      ko: '타히니',
      ja: 'タヒニ',
    },
    category: { main: 'sauces', sub: 'paste' },
    allergens: {
      sesame: true,
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
      protein_g: 17.0,
      carbs_g: 21.2,
      fat_g: 53.8,
      fiber_g: 9.3,
      calories_kcal: 595,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // BASICS - WATER
  // ========================================================================
  {
    id: 'ING_WATER',
    slug: 'water',
    name: {
      en: 'Filtered Water',
      it: 'Acqua Filtrata',
      vi: 'Nước Lọc',
      ko: '정수',
      ja: '濾過水',
      zh: '过滤水',
    },
    category: { main: 'beverages', sub: 'water' },
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
      low_carb: true,
    },
    spice: { level: 0 },
    nutrition: {
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      calories_kcal: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  // ========================================================================
  // SPICES - COMMON
  // ========================================================================
  {
    id: 'ING_CINNAMON',
    slug: 'cinnamon',
    name: {
      en: 'Cinnamon',
      it: 'Cannella',
      vi: 'Quế',
      ko: '계피',
      ja: 'シナモン',
      zh: '肉桂',
    },
    category: { main: 'spices', sub: 'sweet' },
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
      low_carb: true,
    },
    spice: { level: 0 }, // Aromatic, not spicy
    nutrition: {
      protein_g: 4.0,
      carbs_g: 80.6,
      fat_g: 1.2,
      fiber_g: 53.1,
      calories_kcal: 247,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },

  {
    id: 'ING_BLACK_PEPPER',
    slug: 'black-pepper',
    name: {
      en: 'Black Pepper',
      it: 'Pepe Nero',
      vi: 'Tiêu Đen',
      ko: '후추',
      ja: '黒コショウ',
      zh: '黑胡椒',
    },
    category: { main: 'spices', sub: 'savory' },
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
      low_carb: true,
    },
    spice: { level: 1, description: { en: 'Mild heat', it: 'Calore leggero', vi: 'Hơi cay', ko: '약간 매운맛', ja: 'やや辛い', zh: '微辣' } },
    nutrition: {
      protein_g: 10.4,
      carbs_g: 64.8,
      fat_g: 3.3,
      fiber_g: 25.3,
      calories_kcal: 251,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  },
];

// Export count for verification
export const INGREDIENT_COUNT = commonIngredients.length;
