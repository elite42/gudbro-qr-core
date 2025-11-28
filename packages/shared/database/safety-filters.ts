export type FilterType = 'allergen' | 'intolerance' | 'diet';

export interface SafetyFilter {
    id: string;
    label: {
        en: string;
        it: string;
        vi: string;
    };
    type: FilterType;
    icon?: string; // Emoji or icon name
    description?: {
        en: string;
        it: string;
        vi: string;
    };
}

export const safetyFilters: SafetyFilter[] = [
    // --- LEVEL 1: ALLERGENS (30+) ---
    // EU 14
    { id: 'gluten', label: { en: 'Gluten', it: 'Glutine', vi: 'Gluten' }, type: 'allergen', icon: '🌾' },
    { id: 'crustaceans', label: { en: 'Crustaceans', it: 'Crostacei', vi: 'Giáp xác' }, type: 'allergen', icon: '🦐' },
    { id: 'eggs', label: { en: 'Eggs', it: 'Uova', vi: 'Trứng' }, type: 'allergen', icon: '🥚' },
    { id: 'fish', label: { en: 'Fish', it: 'Pesce', vi: 'Cá' }, type: 'allergen', icon: '🐟' },
    { id: 'peanuts', label: { en: 'Peanuts', it: 'Arachidi', vi: 'Đậu phộng' }, type: 'allergen', icon: '🥜' },
    { id: 'soy', label: { en: 'Soy', it: 'Soia', vi: 'Đậu nành' }, type: 'allergen', icon: '🫘' },
    { id: 'milk', label: { en: 'Milk', it: 'Latte', vi: 'Sữa' }, type: 'allergen', icon: '🥛' },
    { id: 'nuts', label: { en: 'Tree Nuts', it: 'Frutta a guscio', vi: 'Hạt cây' }, type: 'allergen', icon: '🌰' },
    { id: 'celery', label: { en: 'Celery', it: 'Sedano', vi: 'Cần tây' }, type: 'allergen', icon: '🥬' },
    { id: 'mustard', label: { en: 'Mustard', it: 'Senape', vi: 'Mù tạt' }, type: 'allergen', icon: '🌭' },
    { id: 'sesame', label: { en: 'Sesame Seeds', it: 'Semi di sesamo', vi: 'Hạt mè' }, type: 'allergen', icon: '🥯' },
    { id: 'sulphites', label: { en: 'Sulphites', it: 'Solfiti', vi: 'Sunfit' }, type: 'allergen', icon: '🍷' },
    { id: 'lupin', label: { en: 'Lupin', it: 'Lupini', vi: 'Đậu lupin' }, type: 'allergen', icon: '🌸' },
    { id: 'molluscs', label: { en: 'Molluscs', it: 'Molluschi', vi: 'Nhuyễn thể' }, type: 'allergen', icon: '🐚' },

    // SEA / Korea Additional
    { id: 'shellfish', label: { en: 'Shellfish', it: 'Frutti di mare', vi: 'Hải sản vỏ' }, type: 'allergen', icon: '🦞' },
    { id: 'squid', label: { en: 'Squid', it: 'Calamari', vi: 'Mực' }, type: 'allergen', icon: '🦑' },
    { id: 'shrimp', label: { en: 'Shrimp', it: 'Gamberetti', vi: 'Tôm' }, type: 'allergen', icon: '🍤' },
    { id: 'shrimp-paste', label: { en: 'Shrimp Paste', it: 'Pasta di Gamberetti', vi: 'Mắm tôm' }, type: 'allergen', icon: '🥣' },
    { id: 'sesame-oil', label: { en: 'Sesame Oil', it: 'Olio di Sesamo', vi: 'Dầu mè' }, type: 'allergen', icon: '🫗' },
    { id: 'peanut-oil', label: { en: 'Peanut Oil', it: 'Olio di Arachidi', vi: 'Dầu đậu phộng' }, type: 'allergen', icon: '🏺' },
    { id: 'msg-allergen', label: { en: 'MSG (Allergen)', it: 'MSG (Allergene)', vi: 'Bột ngọt (Dị ứng)' }, type: 'allergen', icon: '🧂' },
    // Placeholders to reach 30+ as per strategy
    { id: 'buckwheat', label: { en: 'Buckwheat', it: 'Grano saraceno', vi: 'Kiều mạch' }, type: 'allergen', icon: '🌾' },
    { id: 'wheat', label: { en: 'Wheat', it: 'Grano', vi: 'Lúa mì' }, type: 'allergen', icon: '🍞' },
    { id: 'mackerel', label: { en: 'Mackerel', it: 'Sgombro', vi: 'Cá thu' }, type: 'allergen', icon: '🐟' },
    { id: 'crab', label: { en: 'Crab', it: 'Granchio', vi: 'Cua' }, type: 'allergen', icon: '🦀' },
    { id: 'pork-allergen', label: { en: 'Pork', it: 'Maiale', vi: 'Thịt heo' }, type: 'allergen', icon: '🐖' },
    { id: 'peach', label: { en: 'Peach', it: 'Pesca', vi: 'Đào' }, type: 'allergen', icon: '🍑' },
    { id: 'tomato', label: { en: 'Tomato', it: 'Pomodoro', vi: 'Cà chua' }, type: 'allergen', icon: '🍅' },
    { id: 'chicken', label: { en: 'Chicken', it: 'Pollo', vi: 'Gà' }, type: 'allergen', icon: '🐔' },
    { id: 'beef', label: { en: 'Beef', it: 'Manzo', vi: 'Bò' }, type: 'allergen', icon: '🐄' },

    // --- LEVEL 2: INTOLERANCES (10) ---
    { id: 'lactose', label: { en: 'Lactose', it: 'Lattosio', vi: 'Lactose' }, type: 'intolerance', icon: '🥛' },
    { id: 'gluten-sensitivity', label: { en: 'Gluten Sensitivity', it: 'Sensibilità al Glutine', vi: 'Nhạy cảm Gluten' }, type: 'intolerance', icon: '🍞' },
    { id: 'fodmap', label: { en: 'FODMAP', it: 'FODMAP', vi: 'FODMAP' }, type: 'intolerance', icon: '🍏' },
    { id: 'histamine', label: { en: 'Histamine', it: 'Istamina', vi: 'Histamine' }, type: 'intolerance', icon: '🧀' },
    { id: 'fructose', label: { en: 'Fructose', it: 'Fruttosio', vi: 'Fructose' }, type: 'intolerance', icon: '🍇' },
    { id: 'caffeine', label: { en: 'Caffeine', it: 'Caffeina', vi: 'Caffeine' }, type: 'intolerance', icon: '☕' },
    { id: 'alcohol', label: { en: 'Alcohol', it: 'Alcool', vi: 'Cồn' }, type: 'intolerance', icon: '🍷' },
    { id: 'msg-intolerance', label: { en: 'MSG Sensitivity', it: 'Sensibilità MSG', vi: 'Nhạy cảm Bột ngọt' }, type: 'intolerance', icon: '🍜' },
    { id: 'sulphites-sensitivity', label: { en: 'Sulphites Sensitivity', it: 'Sensibilità Solfiti', vi: 'Nhạy cảm Sunfit' }, type: 'intolerance', icon: '🍷' },
    { id: 'spiciness', label: { en: 'Spiciness Level', it: 'Livello Piccantezza', vi: 'Độ cay' }, type: 'intolerance', icon: '🌶️' },

    // --- LEVEL 3: DIETS (11) ---
    { id: 'vegan', label: { en: 'Vegan', it: 'Vegano', vi: 'Thuần chay' }, type: 'diet', icon: '🌱' },
    { id: 'vegetarian', label: { en: 'Vegetarian', it: 'Vegetariano', vi: 'Chay' }, type: 'diet', icon: '🥗' },
    { id: 'halal', label: { en: 'Halal', it: 'Halal', vi: 'Halal' }, type: 'diet', icon: '🕌' },
    { id: 'kosher', label: { en: 'Kosher', it: 'Kosher', vi: 'Kosher' }, type: 'diet', icon: '✡️' },
    { id: 'pork-free', label: { en: 'Pork Free', it: 'Senza Maiale', vi: 'Không thịt heo' }, type: 'diet', icon: '🐖' },
    { id: 'buddhist', label: { en: 'Buddhist', it: 'Buddista', vi: 'Phật giáo' }, type: 'diet', icon: '☸️' },
    { id: 'pescatarian', label: { en: 'Pescatarian', it: 'Pescetariano', vi: 'Ăn chay + Hải sản' }, type: 'diet', icon: '🐟' },
    { id: 'low-carb', label: { en: 'Low Carb', it: 'Low Carb', vi: 'Ít tinh bột' }, type: 'diet', icon: '🥑' },
    { id: 'gluten-free', label: { en: 'Gluten Free', it: 'Senza Glutine', vi: 'Không Gluten' }, type: 'diet', icon: '🌾' },
    { id: 'dairy-free', label: { en: 'Dairy Free', it: 'Senza Latticini', vi: 'Không sữa' }, type: 'diet', icon: '🥛' },
    { id: 'nut-free', label: { en: 'Nut Free', it: 'Senza Frutta a Guscio', vi: 'Không hạt' }, type: 'diet', icon: '🌰' },
];
