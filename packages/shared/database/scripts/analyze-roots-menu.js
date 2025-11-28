const fs = require('fs');

const data = JSON.parse(
  fs.readFileSync('/Users/gianfrancodagostino/Desktop/Restaurant_Menu_Complete.json', 'utf8')
    .replace(/NaN/g, 'null')
);

const menu = data['Menu Data'];

// Group by category (EN only)
const byCategory = {};
menu.forEach(item => {
  if (item.Language === 'EN') {
    const cat = item.Category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push({
      name: item['Product Name'],
      ingredients: item.Ingredients,
      price: item['Price (VND)'],
      priceUSD: item['Price (USD)'],
      description: item.Description,
      protein: item['Protein (g)'],
      calories: item['Calories']
    });
  }
});

console.log('ROOTS MENU ANALYSIS');
console.log('='.repeat(80));
console.log(`Total Products (EN): ${menu.filter(i => i.Language === 'EN').length}`);
console.log(`Categories: ${Object.keys(byCategory).length}`);
console.log('='.repeat(80));

// Print by category
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`\n${cat} (${byCategory[cat].length} items):`);
  byCategory[cat].forEach((item, i) => {
    console.log(`  ${i+1}. ${item.name} - ${item.priceUSD || item.price || 'N/A'}`);
    if (item.ingredients && item.ingredients.trim()) {
      const ing = item.ingredients.length > 80
        ? item.ingredients.substring(0, 80) + '...'
        : item.ingredients;
      console.log(`     → ${ing}`);
    }
  });
});

// Suggest best products for database
console.log('\n' + '='.repeat(80));
console.log('SUGGESTED PRODUCTS FOR DATABASE (Variety + Popular):');
console.log('='.repeat(80));

const suggestions = [
  { cat: 'Coffee', name: 'Cappuccino', reason: 'Popular espresso drink' },
  { cat: 'Coffee', name: 'Latte', reason: 'Popular milk-based' },
  { cat: 'Smoothie Bowls', name: 'Tropical Pitaya Smoothie Bowl', reason: 'Complex, multi-ingredient' },
  { cat: 'Smoothie Bowls', name: 'Açaí Smoothie Bowl', reason: 'Popular superfood bowl' },
  { cat: 'Salads & Bowls', name: 'Buddha Bowl', reason: 'Savory, complete meal' },
  { cat: 'Toasts & Wraps', name: 'Falafel Wrap', reason: 'Street food style' },
  { cat: 'Desserts', name: 'Raw Vegan Cake', reason: 'Dessert category' },
  { cat: 'Fresh Juices & Smoothies', name: 'Green Power Smoothie', reason: 'Healthy smoothie' },
];

suggestions.forEach((s, i) => {
  console.log(`${i+1}. [${s.cat}] ${s.name} - ${s.reason}`);
});
