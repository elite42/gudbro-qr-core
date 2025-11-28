// Health Filters Constants
// GUDBRO 51 Filters System: 30 Allergens + 10 Intolerances + 11 Diets

// LAYER 1: 30 ALLERGENS (Safety Critical)
// Tier 1: EU 14 Allergens (Mandatory EU)
// Tier 2: Korea Extended 21 (+7 vs EU)
// Tier 3: Japan Extended 28 (+7 vs Korea)
// Tier 4: GUDBRO Extended 30 (+2 vs Japan)

const ALLERGENS = [
  // Tier 1: EU 14 Allergens (EU Regulation 1169/2011)
  { id: 'gluten', label: { en: 'Gluten (Cereals)', vn: 'Gluten (Ngũ cốc)', ko: '글루텐', cn: '麸质' }, icon: '🌾', tier: 'EU' },
  { id: 'crustaceans', label: { en: 'Crustaceans', vn: 'Giáp xác', ko: '갑각류', cn: '甲壳类' }, icon: '🦐', tier: 'EU' },
  { id: 'eggs', label: { en: 'Eggs', vn: 'Trứng', ko: '계란', cn: '鸡蛋' }, icon: '🥚', tier: 'EU' },
  { id: 'fish', label: { en: 'Fish', vn: 'Cá', ko: '생선', cn: '鱼' }, icon: '🐟', tier: 'EU' },
  { id: 'peanuts', label: { en: 'Peanuts', vn: 'Đậu phộng', ko: '땅콩', cn: '花生' }, icon: '🥜', tier: 'EU' },
  { id: 'soybeans', label: { en: 'Soybeans', vn: 'Đậu nành', ko: '대두', cn: '大豆' }, icon: '🫘', tier: 'EU' },
  { id: 'dairy', label: { en: 'Milk/Dairy', vn: 'Sữa/Bơ sữa', ko: '유제품', cn: '奶制品' }, icon: '🥛', tier: 'EU' },
  { id: 'tree-nuts', label: { en: 'Tree Nuts', vn: 'Hạt cây', ko: '견과류', cn: '坚果' }, icon: '🌰', tier: 'EU' },
  { id: 'celery', label: { en: 'Celery', vn: 'Cần tây', ko: '셀러리', cn: '芹菜' }, icon: '🥬', tier: 'EU' },
  { id: 'mustard', label: { en: 'Mustard', vn: 'Mù tạt', ko: '겨자', cn: '芥末' }, icon: '🌭', tier: 'EU' },
  { id: 'sesame', label: { en: 'Sesame', vn: 'Mè', ko: '참깨', cn: '芝麻' }, icon: '🌱', tier: 'EU' },
  { id: 'sulfites', label: { en: 'Sulfites', vn: 'Sulfite', ko: '아황산염', cn: '亚硫酸盐' }, icon: '⚗️', tier: 'EU' },
  { id: 'lupin', label: { en: 'Lupin', vn: 'Lupin', ko: '루핀', cn: '羽扇豆' }, icon: '🫘', tier: 'EU' },
  { id: 'molluscs', label: { en: 'Molluscs', vn: 'Nhuyễn thể', ko: '연체동물', cn: '软体动物' }, icon: '🦪', tier: 'EU' },
  
  // Tier 2: Korea Extended (+7)
  { id: 'pork', label: { en: 'Pork', vn: 'Thịt lợn', ko: '돼지고기', cn: '猪肉' }, icon: '🐷', tier: 'Korea' },
  { id: 'peach', label: { en: 'Peach', vn: 'Đào', ko: '복숭아', cn: '桃子' }, icon: '🍑', tier: 'Korea' },
  { id: 'tomato', label: { en: 'Tomato', vn: 'Cà chua', ko: '토마토', cn: '番茄' }, icon: '🍅', tier: 'Korea' },
  { id: 'beef', label: { en: 'Beef', vn: 'Thịt bò', ko: '소고기', cn: '牛肉' }, icon: '🥩', tier: 'Korea' },
  { id: 'chicken', label: { en: 'Chicken', vn: 'Thịt gà', ko: '닭고기', cn: '鸡肉' }, icon: '🍗', tier: 'Korea' },
  { id: 'squid', label: { en: 'Squid/Calamari', vn: 'Mực', ko: '오징어', cn: '鱿鱼' }, icon: '🦑', tier: 'Korea' },
  { id: 'pine-nuts', label: { en: 'Pine Nuts', vn: 'Hạt thông', ko: '잣', cn: '松子' }, icon: '🌲', tier: 'Korea' },
  
  // Tier 3: Japan Extended (+7)
  { id: 'kiwi', label: { en: 'Kiwi', vn: 'Kiwi', ko: '키위', cn: '猕猴桃' }, icon: '🥝', tier: 'Japan' },
  { id: 'banana', label: { en: 'Banana', vn: 'Chuối', ko: '바나나', cn: '香蕉' }, icon: '🍌', tier: 'Japan' },
  { id: 'mango', label: { en: 'Mango', vn: 'Xoài', ko: '망고', cn: '芒果' }, icon: '🥭', tier: 'Japan' },
  { id: 'apple', label: { en: 'Apple', vn: 'Táo', ko: '사과', cn: '苹果' }, icon: '🍎', tier: 'Japan' },
  { id: 'orange', label: { en: 'Orange', vn: 'Cam', ko: '오렌지', cn: '橙子' }, icon: '🍊', tier: 'Japan' },
  { id: 'matsutake', label: { en: 'Matsutake (Mushroom)', vn: 'Nấm Matsutake', ko: '마츠타케', cn: '松茸' }, icon: '🍄', tier: 'Japan' },
  { id: 'yam', label: { en: 'Yam', vn: 'Khoai mỡ', ko: '참마', cn: '山药' }, icon: '🍠', tier: 'Japan' },
  
  // Tier 4: GUDBRO Extended (+2) - Tourism-weighted
  { id: 'cilantro', label: { en: 'Cilantro/Coriander', vn: 'Rau mùi', ko: '고수', cn: '香菜' }, icon: '🌿', tier: 'GUDBRO' },
  { id: 'chili', label: { en: 'Chili/Capsaicin', vn: 'Ớt', ko: '고추', cn: '辣椒' }, icon: '🌶️', tier: 'GUDBRO' }
];

// LAYER 2: 10 INTOLERANCES (Health & Comfort)
// Not regulated, but critical for tourist comfort (especially lactose: 87.8% Asia)
const INTOLERANCES = [
  { id: 'lactose', label: { en: 'Lactose', vn: 'Đường lactose', ko: '유당', cn: '乳糖' }, icon: '🥛', severity: 'high', prevalence: '87.8% Asia' },
  { id: 'gluten-celiac', label: { en: 'Gluten (Celiac)', vn: 'Gluten (Celiac)', ko: '셀리악병', cn: '乳糜泻' }, icon: '🌾', severity: 'high', prevalence: '1-6%' },
  { id: 'fructose', label: { en: 'Fructose', vn: 'Đường fructose', ko: '과당', cn: '果糖' }, icon: '🍎', severity: 'medium', prevalence: '30-40%' },
  { id: 'fodmap', label: { en: 'FODMAP', vn: 'FODMAP', ko: '포드맵', cn: 'FODMAP' }, icon: '🥦', severity: 'medium', prevalence: '10-15%' },
  { id: 'msg', label: { en: 'MSG (Glutamate)', vn: 'Bột ngọt (MSG)', ko: 'MSG', cn: '味精' }, icon: '🧂', severity: 'low', prevalence: '1-2%' },
  { id: 'histamine', label: { en: 'Histamine', vn: 'Histamine', ko: '히스타민', cn: '组胺' }, icon: '🧀', severity: 'medium', prevalence: '1-3%' },
  { id: 'salicylates', label: { en: 'Salicylates', vn: 'Salicylate', ko: '살리실산', cn: '水杨酸' }, icon: '🍓', severity: 'low', prevalence: '1-2%' },
  { id: 'sulfites-intol', label: { en: 'Sulfites (Intolerance)', vn: 'Sulfite (Không dung nạp)', ko: '아황산염', cn: '亚硫酸盐' }, icon: '🍷', severity: 'medium', prevalence: '3-5%' },
  { id: 'caffeine', label: { en: 'Caffeine', vn: 'Caffeine', ko: '카페인', cn: '咖啡因' }, icon: '☕', severity: 'low', prevalence: '10-15%' },
  { id: 'alcohol', label: { en: 'Alcohol', vn: 'Rượu', ko: '알코올', cn: '酒精' }, icon: '🍺', severity: 'medium', prevalence: '30-50% Asia' }
];

// LAYER 3: 11 DIETS (Cultural & Lifestyle)
// Buddhist is UNIQUE to GUDBRO (60%+ Asia tourists are Buddhist)
const DIETARY_PREFERENCES = [
  { 
    id: 'buddhist', 
    label: { en: 'Buddhist', vn: 'Phật giáo', ko: '불교', cn: '佛教' }, 
    icon: '☸️', 
    color: '#ff9800',
    description: { 
      en: 'No meat, fish, eggs (some), pungent vegetables (some), alcohol',
      vn: 'Không thịt, cá, trứng (một số), rau có mùi hăng (một số), rượu',
      ko: '육류, 생선, 계란(일부), 자극적인 채소(일부), 알코올 제외',
      cn: '不含肉类、鱼类、鸡蛋(部分)、刺激性蔬菜(部分)、酒精'
    },
    restrictions: ['meat', 'fish', 'eggs', 'onion', 'garlic', 'alcohol'],
    unique: true // ONLY GUDBRO has this filter
  },
  { 
    id: 'halal', 
    label: { en: 'Halal', vn: 'Halal', ko: '할랄', cn: '清真' }, 
    icon: '☪️', 
    color: '#009688',
    description: { 
      en: 'No pork, alcohol, blood. Meat must be halal-certified.',
      vn: 'Không thịt lợn, rượu, máu. Thịt phải được chứng nhận halal.',
      ko: '돼지고기, 알코올, 피 제외. 육류는 할랄 인증 필요.',
      cn: '不含猪肉、酒精、血液。肉类需清真认证。'
    },
    restrictions: ['pork', 'alcohol', 'blood']
  },
  { 
    id: 'vegetarian', 
    label: { en: 'Vegetarian', vn: 'Ăn chay', ko: '채식주의', cn: '素食' }, 
    icon: '🥕', 
    color: '#8bc34a',
    description: { 
      en: 'No meat, fish, seafood. Eggs and dairy allowed.',
      vn: 'Không thịt, cá, hải sản. Cho phép trứng và sữa.',
      ko: '육류, 생선, 해산물 제외. 계란과 유제품 허용.',
      cn: '不含肉类、鱼类、海鲜。允许鸡蛋和奶制品。'
    },
    restrictions: ['meat', 'fish', 'seafood']
  },
  { 
    id: 'vegan', 
    label: { en: 'Vegan', vn: 'Thuần chay', ko: '비건', cn: '纯素食' }, 
    icon: '🌱', 
    color: '#4caf50',
    description: { 
      en: 'No animal products (meat, fish, eggs, dairy, honey)',
      vn: 'Không có sản phẩm động vật (thịt, cá, trứng, sữa, mật ong)',
      ko: '동물성 제품 제외 (육류, 생선, 계란, 유제품, 꿀)',
      cn: '不含动物产品（肉类、鱼类、鸡蛋、奶制品、蜂蜜）'
    },
    restrictions: ['meat', 'fish', 'eggs', 'dairy', 'honey']
  },
  { 
    id: 'pescatarian', 
    label: { en: 'Pescatarian', vn: 'Ăn cá', ko: '페스카테리안', cn: '鱼素' }, 
    icon: '🐟', 
    color: '#03a9f4',
    description: { 
      en: 'No meat. Fish, seafood, eggs and dairy allowed.',
      vn: 'Không thịt. Cho phép cá, hải sản, trứng và sữa.',
      ko: '육류 제외. 생선, 해산물, 계란, 유제품 허용.',
      cn: '不含肉类。允许鱼类、海鲜、鸡蛋和奶制品。'
    },
    restrictions: ['meat']
  },
  { 
    id: 'no-pork', 
    label: { en: 'No Pork', vn: 'Không thịt lợn', ko: '돼지고기 제외', cn: '不含猪肉' }, 
    icon: '🚫🐷', 
    color: '#f44336',
    description: { 
      en: 'No pork meat or pork products',
      vn: 'Không có thịt lợn hoặc sản phẩm từ thịt lợn',
      ko: '돼지고기 및 돼지고기 제품 제외',
      cn: '不含猪肉或猪肉制品'
    },
    restrictions: ['pork']
  },
  { 
    id: 'kosher', 
    label: { en: 'Kosher', vn: 'Kosher', ko: '코셔', cn: '犹太洁食' }, 
    icon: '✡️', 
    color: '#2196f3',
    description: { 
      en: 'No pork, shellfish, mixing meat and dairy. Must be kosher-certified.',
      vn: 'Không thịt lợn, hải sản có vỏ, trộn thịt và sữa. Phải được chứng nhận kosher.',
      ko: '돼지고기, 조개류, 육류와 유제품 혼합 제외. 코셔 인증 필요.',
      cn: '不含猪肉、贝类、肉类与奶制品混合。需犹太洁食认证。'
    },
    restrictions: ['pork', 'shellfish', 'meat-dairy-mix']
  },
  { 
    id: 'gluten-free', 
    label: { en: 'Gluten-Free', vn: 'Không gluten', ko: '글루텐 프리', cn: '无麸质' }, 
    icon: '🚫🌾', 
    color: '#ff9800',
    description: { 
      en: 'No wheat, barley, rye, or gluten-containing grains',
      vn: 'Không có lúa mì, lúa mạch, lúa mạch đen hoặc ngũ cốc chứa gluten',
      ko: '밀, 보리, 호밀 또는 글루텐 함유 곡물 제외',
      cn: '不含小麦、大麦、黑麦或含麸质谷物'
    },
    restrictions: ['gluten', 'wheat', 'barley', 'rye']
  },
  { 
    id: 'dairy-free', 
    label: { en: 'Dairy-Free', vn: 'Không sữa', ko: '유제품 프리', cn: '无奶制品' }, 
    icon: '🚫🥛', 
    color: '#ff5722',
    description: { 
      en: 'No milk, cheese, butter, cream, yogurt or dairy products',
      vn: 'Không có sữa, phô mai, bơ, kem, sữa chua hoặc sản phẩm từ sữa',
      ko: '우유, 치즈, 버터, 크림, 요거트 또는 유제품 제외',
      cn: '不含牛奶、奶酪、黄油、奶油、酸奶或奶制品'
    },
    restrictions: ['dairy', 'milk', 'cheese', 'butter', 'cream', 'yogurt']
  },
  { 
    id: 'nut-free', 
    label: { en: 'Nut-Free', vn: 'Không hạt', ko: '견과류 프리', cn: '无坚果' }, 
    icon: '🚫🥜', 
    color: '#f44336',
    description: { 
      en: 'No tree nuts or peanuts',
      vn: 'Không có hạt cây hoặc đậu phộng',
      ko: '견과류 또는 땅콩 제외',
      cn: '不含坚果或花生'
    },
    restrictions: ['nuts', 'tree-nuts', 'peanuts']
  },
  { 
    id: 'low-carb', 
    label: { en: 'Low-Carb/Keto', vn: 'Ít tinh bột/Keto', ko: '저탄수화물/키토', cn: '低碳水/生酮' }, 
    icon: '🥩', 
    color: '#673ab7',
    description: { 
      en: 'No rice, pasta, bread, sugar, potatoes',
      vn: 'Không cơm, mì, bánh mì, đường, khoai tây',
      ko: '쌀, 파스타, 빵, 설탕, 감자 제외',
      cn: '不含米饭、面食、面包、糖、土豆'
    },
    restrictions: ['rice', 'pasta', 'bread', 'sugar', 'potatoes']
  }
];

// LAYER 4: SPICE LEVEL (Comfort - Critical for Vietnamese cuisine)
const SPICE_LEVELS = [
  { id: 'none', label: { en: 'No Spice', vn: 'Không cay', ko: '안 매움', cn: '不辣' }, icon: '😊', level: 0, color: '#4caf50' },
  { id: 'mild', label: { en: 'Mild', vn: 'Hơi cay', ko: '약간 매움', cn: '微辣' }, icon: '😐', level: 1, color: '#8bc34a' },
  { id: 'medium', label: { en: 'Medium', vn: 'Cay vừa', ko: '중간 매움', cn: '中辣' }, icon: '😅', level: 2, color: '#ffc107' },
  { id: 'hot', label: { en: 'Hot', vn: 'Cay', ko: '매움', cn: '辣' }, icon: '🥵', level: 3, color: '#ff9800' },
  { id: 'extra-hot', label: { en: 'Extra Hot', vn: 'Rất cay', ko: '아주 매움', cn: '特辣' }, icon: '🔥', level: 4, color: '#f44336' }
];

// Filter helper functions

// Layer 1: Allergen filtering (Exclusion - remove items with ANY selected allergen)
function filterItemsByAllergens(items, selectedAllergens) {
  if (!selectedAllergens || selectedAllergens.length === 0) {
    return items;
  }

  return items.filter(item => {
    const itemAllergens = item.allergens || [];
    // Exclude items that contain ANY of the selected allergens
    return !selectedAllergens.some(allergen => itemAllergens.includes(allergen));
  });
}

// Layer 2: Intolerance filtering (Exclusion - remove items with ANY selected intolerance)
function filterItemsByIntolerances(items, selectedIntolerances) {
  if (!selectedIntolerances || selectedIntolerances.length === 0) {
    return items;
  }

  return items.filter(item => {
    const itemIntolerances = item.intolerances || [];
    // Exclude items that contain ANY of the selected intolerances
    return !selectedIntolerances.some(intol => itemIntolerances.includes(intol));
  });
}

// Layer 3: Dietary filtering (Inclusion - show items matching ALL selected diets)
function filterItemsByDietary(items, selectedDietary) {
  if (!selectedDietary || selectedDietary.length === 0) {
    return items;
  }

  return items.filter(item => {
    const itemFlags = item.dietary_flags || [];
    // Include items that match ALL selected dietary preferences
    return selectedDietary.every(diet => itemFlags.includes(diet));
  });
}

// Layer 4: Spice level filtering (Exclusion - remove items above max spice)
function filterItemsBySpiceLevel(items, maxSpiceLevel) {
  if (maxSpiceLevel === undefined || maxSpiceLevel === null) {
    return items;
  }

  const maxLevel = SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.level;
  if (maxLevel === undefined) {
    return items;
  }

  return items.filter(item => {
    const itemSpiceId = item.spice_level || 'none';
    const itemSpiceLevel = SPICE_LEVELS.find(s => s.id === itemSpiceId)?.level || 0;
    // Include items with spice level <= max
    return itemSpiceLevel <= maxLevel;
  });
}

// Combined filter function (all 4 layers)
function filterItems(items, filters = {}) {
  const { 
    selectedAllergens = [], 
    selectedIntolerances = [],
    selectedDietary = [],
    maxSpiceLevel = null
  } = filters;

  let filtered = items;

  // Layer 1: Apply allergen filters
  if (selectedAllergens.length > 0) {
    filtered = filterItemsByAllergens(filtered, selectedAllergens);
  }

  // Layer 2: Apply intolerance filters
  if (selectedIntolerances.length > 0) {
    filtered = filterItemsByIntolerances(filtered, selectedIntolerances);
  }

  // Layer 3: Apply dietary filters
  if (selectedDietary.length > 0) {
    filtered = filterItemsByDietary(filtered, selectedDietary);
  }

  // Layer 4: Apply spice level filter
  if (maxSpiceLevel) {
    filtered = filterItemsBySpiceLevel(filtered, maxSpiceLevel);
  }

  return filtered;
}

// Helper functions for labels
function getAllergenLabel(allergenId, language = 'en') {
  const allergen = ALLERGENS.find(a => a.id === allergenId);
  return allergen ? allergen.label[language] : allergenId;
}

function getIntoleranceLabel(intoleranceId, language = 'en') {
  const intolerance = INTOLERANCES.find(i => i.id === intoleranceId);
  return intolerance ? intolerance.label[language] : intoleranceId;
}

function getDietaryLabel(dietaryId, language = 'en') {
  const dietary = DIETARY_PREFERENCES.find(d => d.id === dietaryId);
  return dietary ? dietary.label[language] : dietaryId;
}

function getSpiceLevelLabel(spiceLevelId, language = 'en') {
  const spiceLevel = SPICE_LEVELS.find(s => s.id === spiceLevelId);
  return spiceLevel ? spiceLevel.label[language] : spiceLevelId;
}

// Statistics helper
function getFilterStats(items, filters = {}) {
  const filtered = filterItems(items, filters);
  return {
    total: items.length,
    filtered: filtered.length,
    removed: items.length - filtered.length,
    percentage: items.length > 0 ? Math.round((filtered.length / items.length) * 100) : 0
  };
}

module.exports = {
  filterItems,
  filterItemsByAllergens,
  filterItemsByIntolerances,
  filterItemsByDietary,
  filterItemsBySpiceLevel,
  getAllergenLabel,
  getIntoleranceLabel,
  getDietaryLabel,
  getSpiceLevelLabel,
  getFilterStats
};
