// Seed Data - 15 Menu Items with Modifiers
// Run: node seed/seedData.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const items = [
  // BEVERAGES - Beer (5)
  {
    name_translations: { vn: 'Tiger Beer', ko: '타이거 비어', cn: '虎牌啤酒', en: 'Tiger Beer' },
    description_translations: { 
      vn: 'Bia Tiger truyền thống của Singapore',
      ko: '싱가포르 전통 라거 맥주',
      cn: '新加坡传统拉格啤酒',
      en: 'Singapore traditional lager beer'
    },
    category: 'beverage',
    subcategory: 'beer',
    ingredients: ['water', 'barley', 'hops'],
    allergens: ['gluten'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800',
    base_price_vnd: 35000,
    modifiers: [
      { type: 'size', value: '330ml', name: { vn: 'Nhỏ (330ml)', ko: '작은 (330ml)', cn: '小 (330ml)', en: 'Small (330ml)' }, price: 0, default: true },
      { type: 'size', value: '500ml', name: { vn: 'Lớn (500ml)', ko: '큰 (500ml)', cn: '大 (500ml)', en: 'Large (500ml)' }, price: 10000 },
      { type: 'temperature', value: 'cold', name: { vn: 'Lạnh', ko: '차가운', cn: '冷', en: 'Cold' }, price: 0, default: true },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Ăn tại chỗ', ko: '매장 식사', cn: '堂食', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -1750 } // -5%
    ]
  },
  {
    name_translations: { vn: 'Heineken', ko: '하이네켄', cn: '喜力啤酒', en: 'Heineken' },
    description_translations: { 
      vn: 'Bia Heineken cao cấp Hà Lan',
      ko: '프리미엄 네덜란드 라거',
      cn: '荷兰优质拉格',
      en: 'Premium Dutch lager'
    },
    category: 'beverage',
    subcategory: 'beer',
    ingredients: ['water', 'barley', 'hops'],
    allergens: ['gluten'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
    base_price_vnd: 40000,
    modifiers: [
      { type: 'size', value: '330ml', name: { vn: 'Nhỏ (330ml)', ko: '작은 (330ml)', cn: '小 (330ml)', en: 'Small (330ml)' }, price: 0, default: true },
      { type: 'size', value: '500ml', name: { vn: 'Lớn (500ml)', ko: '큰 (500ml)', cn: '大 (500ml)', en: 'Large (500ml)' }, price: 12000 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Ăn tại chỗ', ko: '매장 식사', cn: '堂食', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -2000 }
    ]
  },
  {
    name_translations: { vn: 'Bia Sài Gòn', ko: '사이공 비어', cn: '西贡啤酒', en: 'Saigon Beer' },
    description_translations: { 
      vn: 'Bia Việt Nam truyền thống',
      ko: '베트남 전통 맥주',
      cn: '越南传统啤酒',
      en: 'Traditional Vietnamese beer'
    },
    category: 'beverage',
    subcategory: 'beer',
    ingredients: ['water', 'rice', 'barley', 'hops'],
    allergens: ['gluten'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=800',
    base_price_vnd: 25000,
    modifiers: [
      { type: 'size', value: '330ml', name: { vn: 'Nhỏ (330ml)', ko: '작은 (330ml)', cn: '小 (330ml)', en: 'Small (330ml)' }, price: 0, default: true },
      { type: 'size', value: '500ml', name: { vn: 'Lớn (500ml)', ko: '큰 (500ml)', cn: '大 (500ml)', en: 'Large (500ml)' }, price: 8000 }
    ]
  },

  // BEVERAGES - Wine (2)
  {
    name_translations: { vn: 'Rượu vang đỏ', ko: '레드 와인', cn: '红葡萄酒', en: 'Red Wine' },
    description_translations: { 
      vn: 'Rượu vang đỏ Pháp',
      ko: '프랑스 레드 와인',
      cn: '法国红葡萄酒',
      en: 'French red wine'
    },
    category: 'beverage',
    subcategory: 'wine',
    ingredients: ['grapes', 'sulfites'],
    allergens: ['sulfites'],
    dietary_flags: ['vegan'],
    photo_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    base_price_vnd: 80000,
    modifiers: [
      { type: 'serving', value: 'glass', name: { vn: 'Ly', ko: '잔', cn: '杯', en: 'Glass' }, price: 0, default: true },
      { type: 'serving', value: 'bottle', name: { vn: 'Chai', ko: '병', cn: '瓶', en: 'Bottle' }, price: 320000 },
      { type: 'vintage', value: '2020', name: { vn: 'Rượu 2020', ko: '2020년산', cn: '2020年份', en: 'Vintage 2020' }, price: 0, default: true },
      { type: 'vintage', value: '2018', name: { vn: 'Rượu 2018', ko: '2018년산', cn: '2018年份', en: 'Vintage 2018' }, price: 30000 }
    ]
  },
  {
    name_translations: { vn: 'Rượu vang trắng', ko: '화이트 와인', cn: '白葡萄酒', en: 'White Wine' },
    description_translations: { 
      vn: 'Rượu vang trắng Ý',
      ko: '이탈리아 화이트 와인',
      cn: '意大利白葡萄酒',
      en: 'Italian white wine'
    },
    category: 'beverage',
    subcategory: 'wine',
    ingredients: ['grapes', 'sulfites'],
    allergens: ['sulfites'],
    dietary_flags: ['vegan'],
    photo_url: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800',
    base_price_vnd: 75000,
    modifiers: [
      { type: 'serving', value: 'glass', name: { vn: 'Ly', ko: '잔', cn: '杯', en: 'Glass' }, price: 0, default: true },
      { type: 'serving', value: 'bottle', name: { vn: 'Chai', ko: '병', cn: '瓶', en: 'Bottle' }, price: 300000 }
    ]
  },

  // BEVERAGES - Coffee (3)
  {
    name_translations: { vn: 'Espresso', ko: '에스프레소', cn: '意式浓缩', en: 'Espresso' },
    description_translations: { 
      vn: 'Cà phê Espresso Ý truyền thống',
      ko: '전통 이탈리아 에스프레소',
      cn: '传统意大利浓缩咖啡',
      en: 'Traditional Italian espresso'
    },
    category: 'beverage',
    subcategory: 'coffee',
    ingredients: ['coffee beans', 'water'],
    allergens: [],
    dietary_flags: ['vegan'],
    photo_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800',
    base_price_vnd: 35000,
    modifiers: [
      { type: 'style', value: 'corto', name: { vn: 'Corto (ngắn)', ko: '코르토 (짧은)', cn: '短萃 (Corto)', en: 'Corto (short)' }, price: 0, default: true },
      { type: 'style', value: 'lungo', name: { vn: 'Lungo (dài)', ko: '룽고 (긴)', cn: '长萃 (Lungo)', en: 'Lungo (long)' }, price: 3000 },
      { type: 'size', value: 'single', name: { vn: 'Đơn', ko: '싱글', cn: '单份', en: 'Single' }, price: 0, default: true },
      { type: 'size', value: 'double', name: { vn: 'Đôi', ko: '더블', cn: '双份', en: 'Double' }, price: 15000 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Uống tại chỗ', ko: '매장 음용', cn: '堂饮', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -1750 }
    ]
  },
  {
    name_translations: { vn: 'Cappuccino', ko: '카푸치노', cn: '卡布奇诺', en: 'Cappuccino' },
    description_translations: { 
      vn: 'Cappuccino với sữa tươi',
      ko: '신선한 우유로 만든 카푸치노',
      cn: '鲜奶卡布奇诺',
      en: 'Cappuccino with fresh milk'
    },
    category: 'beverage',
    subcategory: 'coffee',
    ingredients: ['coffee beans', 'milk', 'water'],
    allergens: ['dairy'],
    dietary_flags: ['vegetarian'],
    photo_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
    base_price_vnd: 45000,
    modifiers: [
      { type: 'size', value: 'small', name: { vn: 'Nhỏ', ko: '작은', cn: '小杯', en: 'Small' }, price: -5000 },
      { type: 'size', value: 'regular', name: { vn: 'Vừa', ko: '보통', cn: '中杯', en: 'Regular' }, price: 0, default: true },
      { type: 'size', value: 'large', name: { vn: 'Lớn', ko: '큰', cn: '大杯', en: 'Large' }, price: 10000 },
      { type: 'milk', value: 'regular', name: { vn: 'Sữa thường', ko: '일반 우유', cn: '普通牛奶', en: 'Regular milk' }, price: 0, default: true },
      { type: 'milk', value: 'oat', name: { vn: 'Sữa yến mạch', ko: '오트 밀크', cn: '燕麦奶', en: 'Oat milk' }, price: 8000 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Uống tại chỗ', ko: '매장 음용', cn: '堂饮', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -2250 }
    ]
  },
  {
    name_translations: { vn: 'Cà phê sữa đá', ko: '베트남 아이스커피', cn: '越南冰咖啡', en: 'Vietnamese Iced Coffee' },
    description_translations: { 
      vn: 'Cà phê phin truyền thống với sữa đặc',
      ko: '전통 베트남 필터 커피와 연유',
      cn: '传统越南滴漏咖啡加炼乳',
      en: 'Traditional drip coffee with condensed milk'
    },
    category: 'beverage',
    subcategory: 'coffee',
    ingredients: ['coffee beans', 'condensed milk', 'ice'],
    allergens: ['dairy'],
    dietary_flags: ['vegetarian'],
    photo_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
    base_price_vnd: 30000,
    modifiers: [
      { type: 'sweetness', value: 'normal', name: { vn: 'Bình thường', ko: '보통', cn: '正常', en: 'Normal' }, price: 0, default: true },
      { type: 'sweetness', value: 'less', name: { vn: 'Ít ngọt', ko: '적게', cn: '少糖', en: 'Less sweet' }, price: 0 },
      { type: 'sweetness', value: 'extra', name: { vn: 'Thêm ngọt', ko: '많이', cn: '多糖', en: 'Extra sweet' }, price: 0 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Uống tại chỗ', ko: '매장 음용', cn: '堂饮', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -1500 }
    ]
  },

  // FOOD - Vietnamese (3)
  {
    name_translations: { vn: 'Phở bò', ko: '쌀국수 소고기', cn: '牛肉河粉', en: 'Beef Pho' },
    description_translations: { 
      vn: 'Phở bò truyền thống Hà Nội',
      ko: '전통 하노이 쌀국수',
      cn: '传统河内牛肉河粉',
      en: 'Traditional Hanoi beef noodle soup'
    },
    category: 'food',
    subcategory: 'vietnamese',
    ingredients: ['rice noodles', 'beef', 'bone broth', 'herbs'],
    allergens: [],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
    base_price_vnd: 65000,
    modifiers: [
      { type: 'size', value: 'small', name: { vn: 'Nhỏ', ko: '작은 그릇', cn: '小碗', en: 'Small bowl' }, price: -10000 },
      { type: 'size', value: 'regular', name: { vn: 'Vừa', ko: '보통 그릇', cn: '中碗', en: 'Regular bowl' }, price: 0, default: true },
      { type: 'size', value: 'large', name: { vn: 'Lớn', ko: '큰 그릇', cn: '大碗', en: 'Large bowl' }, price: 15000 },
      { type: 'meat', value: 'rare', name: { vn: 'Tái', ko: '레어', cn: '半熟', en: 'Rare' }, price: 0, default: true },
      { type: 'meat', value: 'well_done', name: { vn: 'Chín', ko: '웰던', cn: '全熟', en: 'Well-done' }, price: 0 },
      { type: 'extras', value: 'extra_meat', name: { vn: 'Thêm thịt', ko: '고기 추가', cn: '加肉', en: 'Extra meat' }, price: 20000 }
    ]
  },
  {
    name_translations: { vn: 'Bánh mì thịt', ko: '반미 (돼지고기)', cn: '猪肉法棍', en: 'Pork Banh Mi' },
    description_translations: { 
      vn: 'Bánh mì Việt Nam với thịt nướng',
      ko: '구운 돼지고기 베트남 샌드위치',
      cn: '烤猪肉越南法棍',
      en: 'Vietnamese sandwich with grilled pork'
    },
    category: 'food',
    subcategory: 'vietnamese',
    ingredients: ['baguette', 'pork', 'pickled vegetables', 'herbs', 'pâté'],
    allergens: ['gluten'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800',
    base_price_vnd: 35000,
    modifiers: [
      { type: 'spice', value: 'mild', name: { vn: 'Không cay', ko: '안맵게', cn: '不辣', en: 'Mild' }, price: 0, default: true },
      { type: 'spice', value: 'spicy', name: { vn: 'Cay', ko: '맵게', cn: '辣', en: 'Spicy' }, price: 0 },
      { type: 'extras', value: 'extra_meat', name: { vn: 'Thêm thịt', ko: '고기 추가', cn: '加肉', en: 'Extra meat' }, price: 15000 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Ăn tại chỗ', ko: '매장 식사', cn: '堂食', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -1750 }
    ]
  },
  {
    name_translations: { vn: 'Gỏi cuốn', ko: '월남쌈', cn: '越南春卷', en: 'Fresh Spring Rolls' },
    description_translations: { 
      vn: 'Gỏi cuốn tươi với tôm và rau',
      ko: '새우와 채소 월남쌈',
      cn: '鲜虾蔬菜春卷',
      en: 'Fresh spring rolls with shrimp and vegetables'
    },
    category: 'food',
    subcategory: 'vietnamese',
    ingredients: ['rice paper', 'shrimp', 'vegetables', 'herbs', 'peanut sauce'],
    allergens: ['shellfish', 'peanuts'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1593252719534-b616a48cc169?w=800',
    base_price_vnd: 45000,
    modifiers: [
      { type: 'quantity', value: '2_rolls', name: { vn: '2 cuốn', ko: '2개', cn: '2个', en: '2 rolls' }, price: 0, default: true },
      { type: 'quantity', value: '4_rolls', name: { vn: '4 cuốn', ko: '4개', cn: '4个', en: '4 rolls' }, price: 45000 },
      { type: 'filling', value: 'shrimp', name: { vn: 'Tôm', ko: '새우', cn: '虾', en: 'Shrimp' }, price: 0, default: true },
      { type: 'filling', value: 'pork', name: { vn: 'Thịt', ko: '돼지고기', cn: '猪肉', en: 'Pork' }, price: 0 }
    ]
  },

  // FOOD - International (2)
  {
    name_translations: { vn: 'Pizza Margherita', ko: '마르게리타 피자', cn: '玛格丽特披萨', en: 'Margherita Pizza' },
    description_translations: { 
      vn: 'Pizza Ý truyền thống với sốt cà chua, mozzarella và húng quế',
      ko: '토마토 소스, 모차렐라, 바질 이탈리아 피자',
      cn: '番茄酱、马苏里拉奶酪和罗勒意大利披萨',
      en: 'Traditional Italian pizza with tomato sauce, mozzarella, and basil'
    },
    category: 'food',
    subcategory: 'italian',
    ingredients: ['flour', 'tomato', 'mozzarella', 'basil', 'olive oil'],
    allergens: ['gluten', 'dairy'],
    dietary_flags: ['vegetarian'],
    photo_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    base_price_vnd: 150000,
    modifiers: [
      { type: 'size', value: 'medium', name: { vn: 'Vừa (9 inch)', ko: '중간 (9인치)', cn: '中 (9寸)', en: 'Medium (9")' }, price: 0, default: true },
      { type: 'size', value: 'large', name: { vn: 'Lớn (12 inch)', ko: '큰 (12인치)', cn: '大 (12寸)', en: 'Large (12")' }, price: 50000 },
      { type: 'crust', value: 'thin', name: { vn: 'Đế mỏng', ko: '씬 크러스트', cn: '薄底', en: 'Thin crust' }, price: 0, default: true },
      { type: 'crust', value: 'thick', name: { vn: 'Đế dày', ko: '도우', cn: '厚底', en: 'Thick crust' }, price: 10000 }
    ]
  },
  {
    name_translations: { vn: 'Burger bò phô mai', ko: '치즈버거', cn: '芝士汉堡', en: 'Cheeseburger' },
    description_translations: { 
      vn: 'Burger bò Úc với phô mai cheddar',
      ko: '체다 치즈 호주산 소고기 버거',
      cn: '切达奶酪澳洲牛肉汉堡',
      en: 'Australian beef burger with cheddar cheese'
    },
    category: 'food',
    subcategory: 'american',
    ingredients: ['beef patty', 'bun', 'cheese', 'lettuce', 'tomato', 'sauce'],
    allergens: ['gluten', 'dairy'],
    dietary_flags: [],
    photo_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    base_price_vnd: 95000,
    modifiers: [
      { type: 'patty', value: 'single', name: { vn: 'Đơn', ko: '싱글 패티', cn: '单层', en: 'Single patty' }, price: 0, default: true },
      { type: 'patty', value: 'double', name: { vn: 'Đôi', ko: '더블 패티', cn: '双层', en: 'Double patty' }, price: 40000 },
      { type: 'sides', value: 'fries', name: { vn: 'Kèm khoai tây', ko: '감자튀김 포함', cn: '加薯条', en: 'With fries' }, price: 25000 },
      { type: 'order_type', value: 'dine_in', name: { vn: 'Ăn tại chỗ', ko: '매장 식사', cn: '堂食', en: 'Dine-in' }, price: 0, default: true },
      { type: 'order_type', value: 'takeaway', name: { vn: 'Mang đi', ko: '테이크아웃', cn: '外带', en: 'Takeaway' }, price: -4750 }
    ]
  }
];

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('Starting seed...');
    await client.query('BEGIN');

    for (const item of items) {
      // Insert item
      const itemQuery = `
        INSERT INTO shared_menu_items (
          name_translations,
          description_translations,
          category,
          subcategory,
          ingredients,
          allergens,
          dietary_flags,
          photo_url,
          base_price_vnd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

      const itemValues = [
        JSON.stringify(item.name_translations),
        JSON.stringify(item.description_translations),
        item.category,
        item.subcategory,
        item.ingredients,
        item.allergens,
        item.dietary_flags,
        item.photo_url,
        item.base_price_vnd
      ];

      const itemResult = await client.query(itemQuery, itemValues);
      const itemId = itemResult.rows[0].id;

      console.log(`✓ Created: ${item.name_translations.en} (${itemId})`);

      // Insert modifiers
      for (const modifier of item.modifiers) {
        const modQuery = `
          INSERT INTO menu_item_modifiers (
            item_id,
            modifier_type,
            modifier_value,
            name_translations,
            price_modifier,
            is_default
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const modValues = [
          itemId,
          modifier.type,
          modifier.value,
          JSON.stringify(modifier.name),
          modifier.price,
          modifier.default || false
        ];

        await client.query(modQuery, modValues);
      }

      console.log(`  → Added ${item.modifiers.length} modifiers`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!');
    console.log(`Total items created: ${items.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
