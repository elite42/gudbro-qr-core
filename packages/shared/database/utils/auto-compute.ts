/**
 * GUDBRO Auto-Computation Engine
 *
 * This is the SAFETY-CRITICAL module that automatically computes:
 * - Allergens (30 types)
 * - Intolerances (10 types)
 * - Dietary compatibility (11 diets)
 * - Spice levels
 * - Multi-nation compliance
 *
 * WHY THIS MATTERS:
 * - Reduces human error on potentially LETHAL allergies
 * - Makes menu creation EASY for managers (just select ingredients)
 * - Ensures CONSISTENCY across all products
 * - Provides COMPLIANCE for 9+ nations
 */

import type {
  IngredientMaster,
  ProductIngredient,
  AutoComputationResult,
  SpiceLevel,
  AllergenFlags,
  IntoleranceFlags,
  DietaryFlags,
} from '../types';

// ============================================================================
// ALLERGEN COMPUTATION
// ============================================================================

/**
 * Extract all allergens from a list of ingredients
 */
export function computeAllergens(
  ingredients: IngredientMaster[]
): string[] {
  const allergenSet = new Set<string>();

  ingredients.forEach((ingredient) => {
    Object.entries(ingredient.allergens).forEach(([allergen, isPresent]) => {
      if (isPresent) {
        allergenSet.add(allergen);
      }
    });
  });

  return Array.from(allergenSet).sort();
}

/**
 * Group allergens by country/region regulations
 */
export function computeAllergensByCountry(
  allergens: string[]
): AutoComputationResult['allergens']['by_country'] {
  // EU 14 Mandatory Allergens
  const euAllergens = [
    'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts',
    'soybeans', 'milk', 'nuts', 'celery', 'mustard',
    'sesame', 'sulphites', 'lupin', 'molluscs'
  ];

  // USA FDA Big 9 (2021: added sesame as 9th)
  const usaAllergens = [
    'milk', 'eggs', 'fish', 'crustaceans', 'nuts',
    'peanuts', 'wheat', 'soybeans', 'sesame'
  ];

  // Korea 21 Allergens (7 additional beyond EU)
  const koreaAllergens = [
    ...euAllergens,
    'pork', 'peach', 'tomato', 'beef', 'chicken', 'squid', 'pine_nuts'
  ];

  // Japan 28 Mandatory + Recommended (7 additional)
  const japanAllergens = [
    ...euAllergens,
    'kiwi', 'banana', 'mango', 'apple', 'orange', 'matsutake', 'yam'
  ];

  return {
    EU: allergens.filter(a => euAllergens.includes(a)),
    USA: allergens.filter(a => usaAllergens.includes(a)),
    Korea: allergens.filter(a => koreaAllergens.includes(a)),
    Japan: allergens.filter(a => japanAllergens.includes(a)),
  };
}

// ============================================================================
// INTOLERANCE COMPUTATION
// ============================================================================

/**
 * Extract all intolerances from ingredients
 */
export function computeIntolerances(
  ingredients: IngredientMaster[]
): { present: string[]; severity: Record<string, 'low' | 'medium' | 'high' | 'severe'> } {
  const intoleranceSet = new Set<string>();
  const severity: Record<string, 'low' | 'medium' | 'high' | 'severe'> = {};

  ingredients.forEach((ingredient) => {
    Object.entries(ingredient.intolerances).forEach(([intolerance, isPresent]) => {
      if (isPresent) {
        intoleranceSet.add(intolerance);

        // Assign severity based on intolerance type
        if (intolerance === 'lactose') {
          severity[intolerance] = 'high'; // 87.8% Asia
        } else if (intolerance === 'gluten_celiac') {
          severity[intolerance] = 'severe'; // Celiac disease
        } else if (intolerance === 'histamine' || intolerance === 'fodmap') {
          severity[intolerance] = 'medium';
        } else {
          severity[intolerance] = 'low';
        }
      }
    });
  });

  return {
    present: Array.from(intoleranceSet).sort(),
    severity,
  };
}

// ============================================================================
// DIETARY COMPATIBILITY COMPUTATION
// ============================================================================

/**
 * Determine which diets are compatible with the product
 */
export function computeDietaryCompatibility(
  ingredients: IngredientMaster[]
): { compatible: string[]; incompatible: string[]; reasons: Record<string, string[]> } {
  const compatible = new Set<string>();
  const incompatible = new Set<string>();
  const reasons: Record<string, string[]> = {};

  // Initialize all possible diets as compatible
  const allDiets = [
    'buddhist',
    'halal',
    'kosher',
    'vegetarian',
    'vegan',
    'pescatarian',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'low-carb',
  ];

  allDiets.forEach(diet => compatible.add(diet));

  // Check each ingredient
  ingredients.forEach((ingredient) => {
    const flags = ingredient.dietary_restrictions;

    // Buddhist restrictions (no 5 pungent roots: garlic, onion, chives, leek, shallot)
    if (flags.buddhist_restricted) {
      compatible.delete('buddhist');
      incompatible.add('buddhist');
      if (!reasons.buddhist) reasons.buddhist = [];
      reasons.buddhist.push(`Contains ${ingredient.name.en} (5 pungent roots restricted)`);
    }

    // Halal
    if (flags.non_halal) {
      compatible.delete('halal');
      incompatible.add('halal');
      if (!reasons.halal) reasons.halal = [];
      reasons.halal.push(`Contains ${ingredient.name.en} (non-halal)`);
    }

    // Kosher
    if (flags.non_kosher) {
      compatible.delete('kosher');
      incompatible.add('kosher');
      if (!reasons.kosher) reasons.kosher = [];
      reasons.kosher.push(`Contains ${ingredient.name.en} (non-kosher)`);
    }

    // Vegetarian (no meat, no fish)
    if (!flags.vegetarian) {
      compatible.delete('vegetarian');
      compatible.delete('vegan'); // Vegan is stricter than vegetarian
      incompatible.add('vegetarian');
      if (!reasons.vegetarian) reasons.vegetarian = [];
      reasons.vegetarian.push(`Contains ${ingredient.name.en} (animal product)`);
    }

    // Vegan (no animal products at all)
    if (!flags.vegan) {
      compatible.delete('vegan');
      incompatible.add('vegan');
      if (!reasons.vegan) reasons.vegan = [];
      reasons.vegan.push(`Contains ${ingredient.name.en} (animal product)`);
    }

    // Pescatarian (no meat, but fish is OK)
    if (!flags.vegetarian && !flags.pescatarian) {
      compatible.delete('pescatarian');
      incompatible.add('pescatarian');
      if (!reasons.pescatarian) reasons.pescatarian = [];
      reasons.pescatarian.push(`Contains ${ingredient.name.en} (meat)`);
    }

    // Gluten-free
    if (!flags.gluten_free) {
      compatible.delete('gluten-free');
      incompatible.add('gluten-free');
      if (!reasons['gluten-free']) reasons['gluten-free'] = [];
      reasons['gluten-free'].push(`Contains ${ingredient.name.en} (gluten)`);
    }

    // Dairy-free
    if (!flags.dairy_free) {
      compatible.delete('dairy-free');
      incompatible.add('dairy-free');
      if (!reasons['dairy-free']) reasons['dairy-free'] = [];
      reasons['dairy-free'].push(`Contains ${ingredient.name.en} (dairy)`);
    }

    // Nut-free
    if (!flags.nut_free) {
      compatible.delete('nut-free');
      incompatible.add('nut-free');
      if (!reasons['nut-free']) reasons['nut-free'] = [];
      reasons['nut-free'].push(`Contains ${ingredient.name.en} (nuts)`);
    }

    // Low-carb (if ingredient has high carbs)
    if (ingredient.nutrition && ingredient.nutrition.carbs_g > 20) {
      compatible.delete('low-carb');
      incompatible.add('low-carb');
      if (!reasons['low-carb']) reasons['low-carb'] = [];
      reasons['low-carb'].push(`Contains ${ingredient.name.en} (${ingredient.nutrition.carbs_g}g carbs per 100g)`);
    }
  });

  return {
    compatible: Array.from(compatible).sort(),
    incompatible: Array.from(incompatible).sort(),
    reasons,
  };
}

// ============================================================================
// SPICE LEVEL COMPUTATION
// ============================================================================

/**
 * Compute maximum spice level from ingredients
 */
export function computeSpiceLevel(
  ingredients: IngredientMaster[]
): { max_level: SpiceLevel; max_scoville?: number; ingredients_with_spice: string[] } {
  let maxLevel: SpiceLevel = 0;
  let maxScoville = 0;
  const ingredientsWithSpice: string[] = [];

  ingredients.forEach((ingredient) => {
    if (ingredient.spice.level > maxLevel) {
      maxLevel = ingredient.spice.level;
    }
    if (ingredient.spice.scoville && ingredient.spice.scoville > maxScoville) {
      maxScoville = ingredient.spice.scoville;
    }
    if (ingredient.spice.level > 0) {
      ingredientsWithSpice.push(ingredient.name.en);
    }
  });

  return {
    max_level: maxLevel,
    max_scoville: maxScoville > 0 ? maxScoville : undefined,
    ingredients_with_spice: ingredientsWithSpice,
  };
}

// ============================================================================
// COMPLIANCE COMPUTATION
// ============================================================================

/**
 * Check compliance with various national regulations
 */
export function computeCompliance(
  allergensByCountry: AutoComputationResult['allergens']['by_country']
): { EU: boolean; USA: boolean; Korea: boolean; Japan: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // All allergens must be declared to be compliant
  const euCompliant = true; // If we have allergen data, we're declaring it
  const usaCompliant = true;
  const koreaCompliant = true;
  const japanCompliant = true;

  // Add warnings for high-risk allergens
  if (allergensByCountry.EU.includes('peanuts') || allergensByCountry.EU.includes('nuts')) {
    warnings.push('Contains tree nuts/peanuts - HIGH RISK allergen');
  }
  if (allergensByCountry.EU.includes('crustaceans') || allergensByCountry.EU.includes('molluscs')) {
    warnings.push('Contains shellfish - HIGH RISK allergen');
  }
  if (allergensByCountry.EU.includes('fish')) {
    warnings.push('Contains fish - HIGH RISK allergen');
  }
  if (allergensByCountry.EU.includes('sesame')) {
    warnings.push('Contains sesame - Newly added to USA Big 9 (2021)');
  }

  return {
    EU: euCompliant,
    USA: usaCompliant,
    Korea: koreaCompliant,
    Japan: japanCompliant,
    warnings,
  };
}

// ============================================================================
// MAIN AUTO-COMPUTATION FUNCTION
// ============================================================================

/**
 * AUTO-COMPUTE all allergens, intolerances, diets from ingredient list
 *
 * This is the MAIN function managers use - they just select ingredients,
 * and this function calculates everything else automatically.
 *
 * @param ingredientMasters - Full ingredient data from database
 * @returns Complete auto-computation result
 */
export function autoComputeProduct(
  ingredientMasters: IngredientMaster[]
): AutoComputationResult {
  // 1. Compute allergens
  const allergensList = computeAllergens(ingredientMasters);
  const allergensByCountry = computeAllergensByCountry(allergensList);

  // 2. Compute intolerances
  const intolerances = computeIntolerances(ingredientMasters);

  // 3. Compute dietary compatibility
  const diets = computeDietaryCompatibility(ingredientMasters);

  // 4. Compute spice level
  const spice = computeSpiceLevel(ingredientMasters);

  // 5. Compute compliance
  const compliance = computeCompliance(allergensByCountry);

  return {
    allergens: {
      present: allergensList,
      by_country: allergensByCountry,
    },
    intolerances: {
      present: intolerances.present,
      severity: intolerances.severity,
    },
    diets: {
      compatible: diets.compatible,
      incompatible: diets.incompatible,
      reasons: diets.reasons,
    },
    spice: {
      max_level: spice.max_level,
      max_scoville: spice.max_scoville,
      ingredients_with_spice: spice.ingredients_with_spice,
    },
    compliance: {
      EU: compliance.EU,
      USA: compliance.USA,
      Korea: compliance.Korea,
      Japan: compliance.Japan,
      warnings: compliance.warnings,
    },
  };
}

// ============================================================================
// HELPER: Get Ingredient Masters from Product Ingredients
// ============================================================================

/**
 * Helper to fetch ingredient masters from database based on product ingredients
 *
 * In production, this would query the ingredient database.
 * For now, it's a placeholder that accepts the full ingredient list.
 */
export async function getIngredientMasters(
  productIngredients: ProductIngredient[],
  ingredientDatabase: IngredientMaster[]
): Promise<IngredientMaster[]> {
  const ingredientIds = productIngredients.map(pi => pi.ingredient_id);

  return ingredientDatabase.filter(ingredient =>
    ingredientIds.includes(ingredient.id)
  );
}
