/**
 * ESPRESSO CUSTOMIZATIONS - Proof of Concept
 *
 * This file demonstrates the complete customization configuration for Caffè Espresso.
 * This is the first product migrated to the new database-driven customization system.
 *
 * User Requirements (from conversation):
 * "caffe espresso che è un prodotto semplice può essere, corto normale lungo,
 * in tazza grande o tazza piccola, doppio o shot singolo, da bere al tavolo
 * oppure da portare via, macchiato con latte (quale latte e disponibile)
 * corretto con liquore (quale liquore)"
 */

import type { ProductCustomization } from '../types';

/**
 * Customization 1: Coffee Length (Lunghezza)
 * How much water to use - affects taste intensity
 */
export const espressoLengthCustomization: ProductCustomization = {
  id: 'espresso-length',
  type: 'radio',
  name: {
    en: 'Coffee Length',
    it: 'Lunghezza',
    vi: 'Độ dài cà phê'
  },
  description: {
    en: 'Choose your preferred coffee strength',
    it: 'Scegli la forza del caffè preferita',
    vi: 'Chọn độ đậm đà cà phê của bạn'
  },
  required: true,
  display_order: 1,
  display_style: 'buttons',
  icon: '☕',
  options: [
    {
      id: 'corto',
      name: {
        en: 'Short (Ristretto)',
        it: 'Corto (Ristretto)',
        vi: 'Ngắn (Ristretto)'
      },
      description: {
        en: 'Concentrated, intense flavor (20ml)',
        it: 'Concentrato, sapore intenso (20ml)',
        vi: 'Đậm đặc, hương vị mạnh (20ml)'
      },
      price_modifier: 0,
      is_default: false,
      available: true
    },
    {
      id: 'normale',
      name: {
        en: 'Normal',
        it: 'Normale',
        vi: 'Bình thường'
      },
      description: {
        en: 'Classic espresso (30ml)',
        it: 'Espresso classico (30ml)',
        vi: 'Espresso cổ điển (30ml)'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'lungo',
      name: {
        en: 'Long (Lungo)',
        it: 'Lungo',
        vi: 'Dài (Lungo)'
      },
      description: {
        en: 'Milder, more volume (50ml)',
        it: 'Più delicato, più volume (50ml)',
        vi: 'Nhẹ hơn, nhiều hơn (50ml)'
      },
      price_modifier: 0,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Customization 2: Cup Size (Tazza)
 * Physical cup size selection
 */
export const espressoCupSizeCustomization: ProductCustomization = {
  id: 'espresso-cup-size',
  type: 'radio',
  name: {
    en: 'Cup Size',
    it: 'Dimensione Tazza',
    vi: 'Kích thước cốc'
  },
  description: {
    en: 'Select cup size',
    it: 'Seleziona la dimensione della tazza',
    vi: 'Chọn kích thước cốc'
  },
  required: false,
  display_order: 2,
  display_style: 'buttons',
  icon: '🥤',
  options: [
    {
      id: 'piccola',
      name: {
        en: 'Small Cup (60ml)',
        it: 'Tazza Piccola (60ml)',
        vi: 'Cốc nhỏ (60ml)'
      },
      description: {
        en: 'Traditional espresso cup',
        it: 'Tazza da espresso tradizionale',
        vi: 'Cốc espresso truyền thống'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'grande',
      name: {
        en: 'Large Cup (120ml)',
        it: 'Tazza Grande (120ml)',
        vi: 'Cốc lớn (120ml)'
      },
      description: {
        en: 'Bigger cup, same coffee',
        it: 'Tazza più grande, stesso caffè',
        vi: 'Cốc lớn hơn, cùng lượng cà phê'
      },
      price_modifier: 0,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Customization 3: Shot Count (Numero Shot)
 * Single or double espresso shot
 */
export const espressoShotCountCustomization: ProductCustomization = {
  id: 'espresso-shot-count',
  type: 'radio',
  name: {
    en: 'Espresso Shot',
    it: 'Numero di Shot',
    vi: 'Số lượng shot'
  },
  description: {
    en: 'Single or double espresso shot',
    it: 'Shot singolo o doppio',
    vi: 'Shot đơn hoặc đôi'
  },
  required: true,
  display_order: 3,
  display_style: 'buttons',
  icon: '🎯',
  options: [
    {
      id: 'singolo',
      name: {
        en: 'Single Shot',
        it: 'Shot Singolo',
        vi: 'Shot đơn'
      },
      description: {
        en: 'One espresso shot (30ml)',
        it: 'Un solo shot di espresso (30ml)',
        vi: 'Một shot espresso (30ml)'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'doppio',
      name: {
        en: 'Double Shot',
        it: 'Shot Doppio',
        vi: 'Shot đôi'
      },
      description: {
        en: 'Two espresso shots (60ml)',
        it: 'Due shot di espresso (60ml)',
        vi: 'Hai shot espresso (60ml)'
      },
      price_modifier: 15000,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Customization 4: Consumption Location (Dove Consumare)
 * Dine-in or takeaway
 */
export const espressoConsumptionCustomization: ProductCustomization = {
  id: 'espresso-consumption',
  type: 'radio',
  name: {
    en: 'Where to Enjoy',
    it: 'Dove Consumare',
    vi: 'Nơi thưởng thức'
  },
  description: {
    en: 'Dine in or takeaway',
    it: 'Al tavolo o da asporto',
    vi: 'Tại chỗ hay mang đi'
  },
  required: true,
  display_order: 4,
  display_style: 'buttons',
  icon: '🏠',
  options: [
    {
      id: 'al-tavolo',
      name: {
        en: 'Dine In',
        it: 'Al Tavolo',
        vi: 'Tại chỗ'
      },
      description: {
        en: 'Enjoy at your table',
        it: 'Goditi al tuo tavolo',
        vi: 'Thưởng thức tại bàn'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'da-portare-via',
      name: {
        en: 'Takeaway',
        it: 'Da Portare Via',
        vi: 'Mang đi'
      },
      description: {
        en: 'To go in disposable cup',
        it: 'Da asporto in tazza usa e getta',
        vi: 'Mang đi trong cốc giấy'
      },
      price_modifier: 2000,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Customization 5: Milk Addition (Latte - Macchiato)
 * Add milk to create macchiato variations
 */
export const espressoMilkCustomization: ProductCustomization = {
  id: 'espresso-milk',
  type: 'radio',
  name: {
    en: 'Add Milk (Macchiato)',
    it: 'Aggiungi Latte (Macchiato)',
    vi: 'Thêm sữa (Macchiato)'
  },
  description: {
    en: 'Add a splash of milk to your espresso',
    it: 'Aggiungi un goccio di latte al tuo espresso',
    vi: 'Thêm một chút sữa vào espresso'
  },
  required: false,
  display_order: 5,
  display_style: 'list',
  icon: '🥛',
  options: [
    {
      id: 'no-milk',
      name: {
        en: 'No Milk (Pure Espresso)',
        it: 'Senza Latte (Espresso Puro)',
        vi: 'Không sữa (Espresso nguyên chất)'
      },
      description: {
        en: 'Classic espresso, no additions',
        it: 'Espresso classico, senza aggiunte',
        vi: 'Espresso cổ điển, không thêm gì'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'cow-milk',
      name: {
        en: 'Regular Milk',
        it: 'Latte Vaccino',
        vi: 'Sữa bò'
      },
      description: {
        en: 'Classic macchiato with cow milk',
        it: 'Macchiato classico con latte vaccino',
        vi: 'Macchiato cổ điển với sữa bò'
      },
      price_modifier: 5000,
      is_default: false,
      available: true
    },
    {
      id: 'oat-milk',
      name: {
        en: 'Oat Milk',
        it: 'Latte di Avena',
        vi: 'Sữa yến mạch'
      },
      description: {
        en: 'Creamy plant-based option',
        it: 'Opzione vegetale cremosa',
        vi: 'Tùy chọn thực vật kem'
      },
      price_modifier: 7000,
      is_default: false,
      available: true
    },
    {
      id: 'soy-milk',
      name: {
        en: 'Soy Milk',
        it: 'Latte di Soia',
        vi: 'Sữa đậu nành'
      },
      description: {
        en: 'Classic plant-based alternative',
        it: 'Alternativa vegetale classica',
        vi: 'Thay thế thực vật cổ điển'
      },
      price_modifier: 7000,
      is_default: false,
      available: true
    },
    {
      id: 'almond-milk',
      name: {
        en: 'Almond Milk',
        it: 'Latte di Mandorla',
        vi: 'Sữa hạnh nhân'
      },
      description: {
        en: 'Light and nutty',
        it: 'Leggero e nocciola',
        vi: 'Nhẹ và vị hạt'
      },
      price_modifier: 8000,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Customization 6: Liquor Addition (Liquore - Corretto)
 * Add liquor to create "caffè corretto"
 * REQUIRES: Alcohol license
 * AGE RESTRICTION: 18+
 */
export const espressoLiquorCustomization: ProductCustomization = {
  id: 'espresso-liquor',
  type: 'radio',
  name: {
    en: 'Add Liquor (Corretto)',
    it: 'Aggiungi Liquore (Corretto)',
    vi: 'Thêm rượu (Corretto)'
  },
  description: {
    en: 'Add a shot of liquor to your espresso',
    it: 'Aggiungi un goccio di liquore al tuo espresso',
    vi: 'Thêm một chút rượu vào espresso'
  },
  required: false,
  display_order: 6,
  display_style: 'list',
  icon: '🥃',
  requires_license: 'alcohol',
  age_restricted: 18,
  options: [
    {
      id: 'no-liquor',
      name: {
        en: 'No Liquor',
        it: 'Senza Liquore',
        vi: 'Không rượu'
      },
      description: {
        en: 'Pure espresso, no alcohol',
        it: 'Espresso puro, senza alcol',
        vi: 'Espresso nguyên chất, không có cồn'
      },
      price_modifier: 0,
      is_default: true,
      available: true
    },
    {
      id: 'grappa',
      name: {
        en: 'Grappa',
        it: 'Grappa',
        vi: 'Grappa'
      },
      description: {
        en: 'Traditional Italian grape brandy',
        it: 'Tradizionale acquavite d\'uva italiana',
        vi: 'Rượu nho truyền thống Ý'
      },
      price_modifier: 25000,
      is_default: false,
      available: true
    },
    {
      id: 'sambuca',
      name: {
        en: 'Sambuca',
        it: 'Sambuca',
        vi: 'Sambuca'
      },
      description: {
        en: 'Anise-flavored Italian liqueur',
        it: 'Liquore italiano all\'anice',
        vi: 'Rượu Ý vị hồi'
      },
      price_modifier: 25000,
      is_default: false,
      available: true
    },
    {
      id: 'baileys',
      name: {
        en: 'Baileys',
        it: 'Baileys',
        vi: 'Baileys'
      },
      description: {
        en: 'Irish cream liqueur',
        it: 'Crema di whisky irlandese',
        vi: 'Kem rượu Ireland'
      },
      price_modifier: 30000,
      is_default: false,
      available: true
    },
    {
      id: 'amaretto',
      name: {
        en: 'Amaretto',
        it: 'Amaretto',
        vi: 'Amaretto'
      },
      description: {
        en: 'Sweet almond-flavored liqueur',
        it: 'Liquore dolce alle mandorle',
        vi: 'Rượu vị hạnh nhân ngọt'
      },
      price_modifier: 25000,
      is_default: false,
      available: true
    }
  ]
};

/**
 * Complete customizations array for Espresso product
 * Ready to be added to the espresso product definition
 */
export const espressoCustomizations: ProductCustomization[] = [
  espressoLengthCustomization,
  espressoCupSizeCustomization,
  espressoShotCountCustomization,
  espressoConsumptionCustomization,
  espressoMilkCustomization,
  espressoLiquorCustomization
];
