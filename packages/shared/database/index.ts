/**
 * GUDBRO Centralized Database
 *
 * Main entry point for the ingredient and product database system.
 * This system automatically computes allergens, intolerances, and dietary
 * compatibility from ingredient lists - reducing human error on potentially
 * life-threatening allergies.
 *
 * @packageDocumentation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export * from './types';

// ============================================================================
// INGREDIENT DATABASE
// ============================================================================
export { commonIngredients, INGREDIENT_COUNT } from './ingredients/common-ingredients';
export { beveragesSuperfoods, BEVERAGES_SUPERFOODS_COUNT } from './ingredients/beverages-superfoods';
export { citrusHerbsVegetables, CITRUS_HERBS_VEGETABLES_COUNT } from './ingredients/citrus-herbs-vegetables';
export { saucesOilsSweeteners, SAUCES_OILS_SWEETENERS_COUNT } from './ingredients/sauces-oils-sweeteners';

// Combined ingredient database
import { commonIngredients } from './ingredients/common-ingredients';
import { beveragesSuperfoods } from './ingredients/beverages-superfoods';
import { citrusHerbsVegetables } from './ingredients/citrus-herbs-vegetables';
import { saucesOilsSweeteners } from './ingredients/sauces-oils-sweeteners';

export const allIngredients = [
  ...commonIngredients,
  ...beveragesSuperfoods,
  ...citrusHerbsVegetables,
  ...saucesOilsSweeteners,
];

export const TOTAL_INGREDIENT_COUNT = allIngredients.length;

// ============================================================================
// PRODUCT DATABASE
// ============================================================================
export {
  exampleProducts,
  PRODUCT_COUNT,
  oatsCappuccino,
  tropicalPitayaBowl,
  greenPowerSmoothie,
  buddhaBowl,
  demonstrateAutoComputation,
} from './products/example-products';

export {
  rootsProducts,
  ROOTS_PRODUCT_COUNT,
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
} from './products/roots-products';

// ============================================================================
// AUTO-COMPUTATION UTILITIES
// ============================================================================
export {
  autoComputeProduct,
  computeAllergens,
  computeAllergensByCountry,
  computeIntolerances,
  computeDietaryCompatibility,
  computeSpiceLevel,
  computeCompliance,
  getIngredientMasters,
} from './utils/auto-compute';

// ============================================================================
// VERSION
// ============================================================================
export const DATABASE_VERSION = '1.0.0';
export const SISTEMA_FILTRI_VERSION = '2.0'; // GUDBRO Sistema 51 Filtri v2.0
