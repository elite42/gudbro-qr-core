/**
 * Script to extract unique ingredients from JSON menu files
 *
 * This analyzes:
 * - Restaurant_Menu_Complete.json (ROOTS menu)
 * - Coffee_House_Recipes_Serving.json (Armenia coffee chain)
 *
 * And extracts all unique ingredients to help populate the database
 */

const fs = require('fs');
const path = require('path');

// Paths to JSON files
const ROOTS_MENU_PATH = '/Users/gianfrancodagostino/Desktop/Restaurant_Menu_Complete.json';
const COFFEE_HOUSE_PATH = '/Users/gianfrancodagostino/Desktop/Coffee_House_Recipes_Serving.json';

// Read JSON files (handle NaN values)
const rootsRaw = fs.readFileSync(ROOTS_MENU_PATH, 'utf8').replace(/NaN/g, 'null');
const coffeeHouseRaw = fs.readFileSync(COFFEE_HOUSE_PATH, 'utf8').replace(/NaN/g, 'null');

const rootsData = JSON.parse(rootsRaw);
const coffeeHouseData = JSON.parse(coffeeHouseRaw);

// Extract ingredients
const ingredientsSet = new Set();

// Process ROOTS menu
console.log('📋 Processing ROOTS Menu...');
const rootsMenu = rootsData['Menu Data'];
let rootsCount = 0;

rootsMenu.forEach(item => {
  if (item.Ingredients && item.Ingredients.trim()) {
    // Split by comma and clean up
    const ingredients = item.Ingredients
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing && ing.length > 0);

    ingredients.forEach(ing => {
      ingredientsSet.add(ing.toLowerCase());
      rootsCount++;
    });
  }
});

console.log(`  ✅ Processed ${rootsMenu.length} products`);
console.log(`  ✅ Found ${rootsCount} ingredient entries`);
console.log();

// Process Coffee House menu
console.log('📋 Processing Coffee House Menu...');
const coffeeHouseMenu = coffeeHouseData['Sheet1'];
let coffeeHouseCount = 0;

coffeeHouseMenu.forEach(item => {
  if (item['Main Ingredients'] && item['Main Ingredients'].trim()) {
    // Split by comma and clean up
    const ingredients = item['Main Ingredients']
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing && ing.length > 0);

    ingredients.forEach(ing => {
      ingredientsSet.add(ing.toLowerCase());
      coffeeHouseCount++;
    });
  }
});

console.log(`  ✅ Processed ${coffeeHouseMenu.length} products`);
console.log(`  ✅ Found ${coffeeHouseCount} ingredient entries`);
console.log();

// Convert to sorted array
const uniqueIngredients = Array.from(ingredientsSet).sort();

console.log('='.repeat(80));
console.log(`🎯 UNIQUE INGREDIENTS FOUND: ${uniqueIngredients.length}`);
console.log('='.repeat(80));
console.log();

// Categorize ingredients
const categories = {
  beverages: [],
  dairy: [],
  plantMilk: [],
  fruits: [],
  vegetables: [],
  grains: [],
  proteins: [],
  nuts: [],
  spices: [],
  sweeteners: [],
  sauces: [],
  oils: [],
  alcohol: [],
  other: []
};

// Simple categorization based on keywords
uniqueIngredients.forEach(ing => {
  const lower = ing.toLowerCase();

  if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('tea')) {
    categories.beverages.push(ing);
  } else if (lower.includes('milk') && !lower.includes('coconut') && !lower.includes('oat') && !lower.includes('soy') && !lower.includes('almond')) {
    categories.dairy.push(ing);
  } else if (lower.includes('oat milk') || lower.includes('soy milk') || lower.includes('almond') || lower.includes('coconut milk')) {
    categories.plantMilk.push(ing);
  } else if (lower.includes('banana') || lower.includes('berry') || lower.includes('fruit') || lower.includes('mango') || lower.includes('apple')) {
    categories.fruits.push(ing);
  } else if (lower.includes('spinach') || lower.includes('kale') || lower.includes('lettuce') || lower.includes('vegetable') || lower.includes('tomato')) {
    categories.vegetables.push(ing);
  } else if (lower.includes('rice') || lower.includes('quinoa') || lower.includes('oat') || lower.includes('wheat') || lower.includes('bread')) {
    categories.grains.push(ing);
  } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('tofu') || lower.includes('protein')) {
    categories.proteins.push(ing);
  } else if (lower.includes('nut') || lower.includes('almond') || lower.includes('cashew') || lower.includes('seed')) {
    categories.nuts.push(ing);
  } else if (lower.includes('pepper') || lower.includes('spice') || lower.includes('herb') || lower.includes('salt') || lower.includes('cinnamon')) {
    categories.spices.push(ing);
  } else if (lower.includes('sugar') || lower.includes('honey') || lower.includes('syrup') || lower.includes('sweetener')) {
    categories.sweeteners.push(ing);
  } else if (lower.includes('sauce') || lower.includes('dressing') || lower.includes('mayo')) {
    categories.sauces.push(ing);
  } else if (lower.includes('oil') || lower.includes('butter')) {
    categories.oils.push(ing);
  } else if (lower.includes('wine') || lower.includes('beer') || lower.includes('alcohol') || lower.includes('grapes')) {
    categories.alcohol.push(ing);
  } else {
    categories.other.push(ing);
  }
});

// Print categorized ingredients
console.log('📦 CATEGORIZED INGREDIENTS:');
console.log();

Object.entries(categories).forEach(([category, items]) => {
  if (items.length > 0) {
    console.log(`${category.toUpperCase()} (${items.length}):`);
    items.forEach(item => console.log(`  - ${item}`));
    console.log();
  }
});

console.log('='.repeat(80));
console.log('📊 STATISTICS:');
console.log('='.repeat(80));
console.log(`Total unique ingredients: ${uniqueIngredients.length}`);
console.log(`ROOTS menu products: ${rootsMenu.length}`);
console.log(`Coffee House products: ${coffeeHouseMenu.length}`);
console.log(`Total products analyzed: ${rootsMenu.length + coffeeHouseMenu.length}`);
console.log();

// Save to file for reference
const outputPath = path.join(__dirname, 'extracted-ingredients.json');
const output = {
  total: uniqueIngredients.length,
  ingredients: uniqueIngredients,
  categorized: categories,
  statistics: {
    rootsProducts: rootsMenu.length,
    coffeeHouseProducts: coffeeHouseMenu.length,
    totalProducts: rootsMenu.length + coffeeHouseMenu.length
  }
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`✅ Results saved to: ${outputPath}`);
console.log();

// Print all ingredients as a simple list
console.log('='.repeat(80));
console.log('📝 ALL UNIQUE INGREDIENTS (ALPHABETICAL):');
console.log('='.repeat(80));
uniqueIngredients.forEach((ing, idx) => {
  console.log(`${String(idx + 1).padStart(3, ' ')}. ${ing}`);
});
