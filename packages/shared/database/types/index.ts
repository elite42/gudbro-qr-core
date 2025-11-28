/**
 * GUDBRO Centralized Database - Type Definitions
 *
 * This is the foundation for the centralized ingredient and product database
 * that will serve Coffee Shops, Restaurants, and Street Food products.
 *
 * Sistema 51 Filtri v2.0:
 * - 30 Allergens (EU 14 + Korea 7 + Japan 7 + GUDBRO 2)
 * - 10 Intolerances
 * - 11 Diets
 * - 5 Spice Levels
 */

// ============================================================================
// MULTI-LANGUAGE SUPPORT
// ============================================================================

export interface MultiLangText {
  en: string;
  it: string;
  vi: string;
  ko?: string;
  ja?: string;
  zh?: string;
  th?: string;
  es?: string;
  fr?: string;
}

// ============================================================================
// ALLERGENS - 30 Total (Sistema 51 Filtri v2.0)
// ============================================================================

export interface AllergenFlags {
  // EU 14 Mandatory Allergens
  gluten?: boolean;           // Cereali contenenti glutine
  crustaceans?: boolean;      // Crostacei
  eggs?: boolean;             // Uova
  fish?: boolean;             // Pesce
  peanuts?: boolean;          // Arachidi
  soybeans?: boolean;         // Soia
  milk?: boolean;             // Latte
  nuts?: boolean;             // Frutta a guscio (noci, mandorle, etc.)
  celery?: boolean;           // Sedano
  mustard?: boolean;          // Senape
  sesame?: boolean;           // Semi di sesamo
  sulphites?: boolean;        // Anidride solforosa e solfiti >10mg/kg
  lupin?: boolean;            // Lupini
  molluscs?: boolean;         // Molluschi

  // Korea +7 Additional Allergens
  pork?: boolean;             // 돼지고기 (Maiale)
  peach?: boolean;            // 복숭아 (Pesca)
  tomato?: boolean;           // 토마토 (Pomodoro)
  beef?: boolean;             // 쇠고기 (Manzo)
  chicken?: boolean;          // 닭고기 (Pollo)
  squid?: boolean;            // 오징어 (Calamari)
  pine_nuts?: boolean;        // 잣 (Pinoli)

  // Japan +7 Additional Allergens
  kiwi?: boolean;             // キウイ
  banana?: boolean;           // バナナ
  mango?: boolean;            // マンゴー
  apple?: boolean;            // りんご
  orange?: boolean;           // オレンジ
  matsutake?: boolean;        // まつたけ (Fungo matsutake)
  yam?: boolean;              // やまいも (Igname)

  // GUDBRO +2 Custom (Asia-Pacific Focus)
  coriander?: boolean;        // Coriandolo (gene OR6A2 - 14% popolazione)
  chili_pepper?: boolean;     // Peperoncino (capsaicina)
}

// ============================================================================
// INTOLERANCES - 10 Total (GUDBRO Sistema)
// ============================================================================

export interface IntoleranceFlags {
  lactose?: boolean;          // Intolleranza al lattosio (87.8% Asia, 65% mondo)
  gluten_celiac?: boolean;    // Celiachia (diverso dall'allergia al glutino)
  fructose?: boolean;         // Intolleranza al fruttosio
  fodmap?: boolean;           // FODMAP (fermentabili oligo-di-mono-saccaridi e polioli)
  msg?: boolean;              // Glutammato monosodico (E621)
  histamine?: boolean;        // Istamina (alimenti fermentati, stagionati)
  salicylates?: boolean;      // Salicilati (spezie, frutta)
  sulphites_intolerance?: boolean; // Solfiti (diverso dall'allergia)
  caffeine?: boolean;         // Caffeina
  alcohol?: boolean;          // Alcol
}

// ============================================================================
// DIETARY RESTRICTIONS - 11 Total (GUDBRO Sistema)
// ============================================================================

export interface DietaryFlags {
  // Religious/Cultural
  buddhist_restricted?: boolean;  // Buddhista (no aglio, cipolla, erba cipollina, porro, scalogno)
  halal?: boolean;               // Halal (permesso Islam)
  non_halal?: boolean;           // Non-Halal (maiale, alcol)
  kosher?: boolean;              // Kosher (permesso ebraismo)
  non_kosher?: boolean;          // Non-Kosher (crostacei, maiale, mix latte-carne)

  // Lifestyle
  vegetarian?: boolean;          // Vegetariano (no carne, no pesce)
  vegan?: boolean;               // Vegano (no prodotti animali)
  pescatarian?: boolean;         // Pescetariano (no carne, sì pesce)

  // Health
  gluten_free?: boolean;         // Senza glutine
  dairy_free?: boolean;          // Senza latticini
  nut_free?: boolean;            // Senza frutta a guscio
  low_carb?: boolean;            // Basso contenuto di carboidrati / Keto
}

// ============================================================================
// SPICE LEVEL - 5 Levels (GUDBRO Sistema)
// ============================================================================

export type SpiceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SpiceInfo {
  level: SpiceLevel;             // 0=None, 1=Lieve, 2=Media, 3=Forte, 4=Extra Forte, 5=Estremo
  scoville?: number;             // Scala Scoville (unità di piccantezza)
  description?: MultiLangText;   // Descrizione personalizzata
}

// ============================================================================
// NUTRITION - Per 100g
// ============================================================================

export interface NutritionPer100g {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g?: number;
  salt_g?: number;
  calories_kcal: number;

  // Micronutrienti (opzionali)
  vitamin_c_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
}

// ============================================================================
// MEDIA - Multi-image and Video Support
// ============================================================================

export interface VideoSource {
  type: 'youtube' | 'vimeo' | 'direct';
  url: string;
  thumbnail?: string;
  duration_sec?: number;
  title?: MultiLangText;
}

export interface ProductMedia {
  images: {
    thumbnail: string;           // Thumbnail principale (400x300)
    gallery: string[];           // Galleria immagini multiple
    hero?: string;               // Hero image ad alta risoluzione
  };
  videos?: {
    preparation?: VideoSource[]; // Video preparazione
    presentation?: VideoSource[]; // Video presentazione
    promotional?: VideoSource[]; // Video promozionali
  };
}

// ============================================================================
// INGREDIENT MASTER - Centralized Ingredient Database
// ============================================================================

export interface IngredientMaster {
  // Identificativi
  id: string;                    // Unique ID (es: "ING_COFFEE_ARABICA")
  slug: string;                  // URL-friendly slug (es: "coffee-arabica")
  name: MultiLangText;           // Nome multilingua
  description?: MultiLangText;   // Descrizione opzionale

  // Categoria
  category: {
    main: string;                // Categoria principale (es: "beverages", "vegetables", "proteins")
    sub?: string;                // Sottocategoria (es: "coffee", "leafy-greens", "legumes")
  };

  // Sistema 51 Filtri - AUTO-ASSIGNED
  allergens: AllergenFlags;
  intolerances: IntoleranceFlags;
  dietary_restrictions: DietaryFlags;
  spice: SpiceInfo;

  // Dati nutrizionali (per 100g)
  nutrition?: NutritionPer100g;

  // Origine e stagionalità
  origin?: {
    countries: string[];         // Paesi di origine (ISO 3166-1 alpha-2)
    seasonal?: {
      best_months: number[];     // Mesi migliori (1-12)
    };
  };

  // Immagine rappresentativa
  image?: string;

  // Metadata
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
  version: number;               // Versioning per aggiornamenti
}

// ============================================================================
// PRODUCT INGREDIENT - Ingredient used in a product
// ============================================================================

export interface ProductIngredient {
  ingredient_id: string;         // Riferimento a IngredientMaster.id
  quantity?: {
    amount: number;
    unit: 'g' | 'ml' | 'oz' | 'cups' | 'tbsp' | 'tsp' | 'pieces';
  };
  optional?: boolean;            // Ingrediente opzionale
  notes?: MultiLangText;         // Note speciali (es: "organic", "locally sourced")
}

// ============================================================================
// PRODUCT - Dish/Beverage/Food Item
// ============================================================================

export interface Product {
  // Identificativi
  id: string;                    // Unique ID (es: "PROD_OATS_CAPPUCCINO")
  slug: string;                  // URL-friendly slug
  same_id?: string;              // ID per varianti dello stesso prodotto
  name: MultiLangText;
  description?: MultiLangText;

  // Categoria (Struttura a 3 Livelli + Origine)
  category: {
    // Livello 1: Portata/Menu principale (visibile al cliente)
    main: 'antipasti' | 'primi' | 'secondi' | 'contorni' | 'piatti-unici' | 'dessert' | 'bevande' | 'coffee' | 'smoothie' | 'bowl' | 'wellness';

    // Livello 2:
    // - Per PIATTI: Origine geografica (italiano, vietnamita, giapponese, etc.)
    // - Per BEVANDE: Tipo di bevanda (wine, beer, spirits, acqua, soft-drinks, etc.)
    sub?: 'italiano' | 'vietnamita' | 'giapponese' | 'thailandese' | 'cinese' | 'coreano' | 'americano' | 'messicano' | 'mediterraneo' |
          // Bevande - Tipi principali
          'acqua' | 'soft-drinks' | 'hot-beverages' | 'beer' | 'wine' | 'sparkling' | 'champagne' | 'cocktails' | 'spirits' |
          // Spirits - Sottotipi
          'whiskey' | 'vodka' | 'gin' | 'rum' | 'tequila-mezcal' | 'brandy-cognac' | 'grappa' | 'amari' | 'liqueurs' |
          string;

    // Livello 3: Sottotipo (principalmente per bevande)
    // Esempi: 'red' (per wine), 'draft' (per beer), 'scotch' (per whiskey), 'brut' (per champagne)
    tertiary?: 'red' | 'white' | 'rose' | 'dessert-wine' | 'fortified' |  // Vini
               'draft' | 'bottled' | 'lager' | 'ale' | 'ipa' | 'stout' | 'wheat' |  // Birre
               'scotch' | 'irish' | 'bourbon' | 'tennessee' | 'japanese' | 'canadian' |  // Whiskey
               'naturale' | 'frizzante' | 'tonica' |  // Acqua
               'classic' | 'signature' | 'spritz' | 'mocktails' |  // Cocktails
               'grappa-bianca' | 'grappa-invecchiata' | 'grappa-aromatica' |  // Grappa
               'amaro' | 'fernet' | 'cynar' |  // Amari
               'brut' | 'extra-brut' | 'demi-sec' |  // Champagne
               string;

    // Origine geografica (opzionale, separato dalla categorizzazione)
    // Utile per filtrare vini italiani, birre tedesche, whisky scozzesi, etc.
    origin?: 'italian' | 'french' | 'spanish' | 'german' | 'belgian' | 'irish' | 'scottish' |
             'american' | 'mexican' | 'argentinian' | 'chilean' | 'australian' |
             'japanese' | 'chinese' | 'vietnamese' | 'thai' | 'korean' | string;
  };

  // Ingredienti
  ingredients: ProductIngredient[];

  // AUTO-COMPUTED from ingredients (calcolato automaticamente)
  computed: {
    allergens: string[];                    // Lista allergens presenti
    intolerances: string[];                 // Lista intolerances
    suitable_for_diets: string[];           // Liste diete compatibili
    spice_level: SpiceLevel;                // Livello piccantezza massimo
    allergen_compliance: {                  // Compliance multi-nazione
      EU: boolean;
      USA: boolean;
      Korea: boolean;
      Japan: boolean;
      Canada: boolean;
      Australia: boolean;
      China: boolean;
      Singapore: boolean;
      Vietnam: boolean;
    };
  };

  // Prezzi
  pricing?: {
    cost_usd?: number;           // Costo ingredienti
    selling_price_usd?: number;  // Prezzo vendita USD
    selling_price_local?: {      // Prezzo locale
      amount: number;
      currency: string;          // ISO 4217 (VND, EUR, etc.)
    };
    profit_margin_percent?: number;
  };

  // Preparazione
  preparation?: {
    method?: MultiLangText;      // Metodo preparazione
    prep_time_sec?: number;      // Tempo preparazione (secondi)
    skill_level?: 1 | 2 | 3;     // 1=Facile, 2=Medio, 3=Difficile
    serving_glass?: string;      // Tipo bicchiere/piatto
    temperature?: 'hot' | 'cold' | 'room';
  };

  // Dati nutrizionali (per porzione)
  nutrition_per_serving?: {
    serving_size_g?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    calories_kcal?: number;
  };

  // Media (multi-image + video support)
  media: ProductMedia;

  // Disponibilità
  availability?: {
    seasonal?: boolean;
    months?: number[];           // Mesi disponibili (1-12)
    limited_edition?: boolean;
    time_slots?: ('breakfast' | 'lunch' | 'dinner' | 'aperitivo' | 'late-night' | 'all-day')[]; // Fasce orarie disponibilità
  };

  // Customizations (Database-Driven Dynamic Customizations)
  // Optional array of customization groups for this product
  // Each customization defines user choices (milk type, size, extras, etc.)
  customizations?: ProductCustomization[];

  // Metadata
  created_at: string;
  updated_at: string;
  version: number;
}

// ============================================================================
// AUTO-COMPUTATION RESULT - Result of auto-computation
// ============================================================================

export interface AutoComputationResult {
  allergens: {
    present: string[];           // Allergens trovati
    by_country: {
      EU: string[];
      USA: string[];
      Korea: string[];
      Japan: string[];
    };
  };
  intolerances: {
    present: string[];
    severity: {
      [key: string]: 'low' | 'medium' | 'high' | 'severe';
    };
  };
  diets: {
    compatible: string[];        // Diete compatibili
    incompatible: string[];      // Diete incompatibili
    reasons?: {
      [diet: string]: string[];  // Motivi incompatibilità
    };
  };
  spice: {
    max_level: SpiceLevel;
    max_scoville?: number;
    ingredients_with_spice: string[];
  };
  compliance: {
    EU: boolean;
    USA: boolean;
    Korea: boolean;
    Japan: boolean;
    warnings: string[];
  };
}

// ============================================================================
// PRODUCT CUSTOMIZATIONS - Database-Driven Dynamic Customizations
// ============================================================================

/**
 * Type of customization input control
 * - radio: Single choice from options (e.g., cup size, milk type)
 * - checkbox: Multiple choices from options (e.g., extra toppings)
 * - quantity: Number input with min/max (e.g., sugar level, ice level)
 * - text: Free text input (e.g., special instructions)
 */
export type CustomizationType = 'radio' | 'checkbox' | 'quantity' | 'text';

/**
 * Single customization option
 * Each option can have a price modifier (positive, negative, or zero)
 */
export interface CustomizationOption {
  id: string;                      // Unique option ID (e.g., "oat-milk", "large-cup")
  name: MultiLangText;             // Option name in all languages
  price_modifier: number;          // Price change (can be +, -, or 0)
  is_default: boolean;             // Whether this option is pre-selected
  description?: MultiLangText;     // Optional detailed description
  image?: string;                  // Optional image for visual selection

  // Availability constraints
  available?: boolean;             // Can be disabled temporarily
  max_per_order?: number;          // Max quantity for this option (for checkboxes)
}

/**
 * Product Customization Configuration
 * Defines a single customization group (e.g., "Milk Type", "Cup Size")
 */
export interface ProductCustomization {
  id: string;                      // Unique customization ID (e.g., "milk-type", "cup-size")
  type: CustomizationType;         // Input control type
  name: MultiLangText;             // Customization group name
  description?: MultiLangText;     // Optional description/help text

  // Validation rules
  required: boolean;               // Whether customer MUST select an option
  min_selections?: number;         // Min selections (for checkboxes, default: 0)
  max_selections?: number;         // Max selections (for checkboxes, default: unlimited)

  // For quantity type
  quantity_config?: {
    min: number;                   // Minimum value
    max: number;                   // Maximum value
    step: number;                  // Step increment (e.g., 0.5 for half portions)
    default: number;               // Default value
    unit?: MultiLangText;          // Unit label (e.g., "spoons", "shots")
  };

  // Options (for radio/checkbox types)
  options: CustomizationOption[];

  // Display configuration
  display_order: number;           // Order to show in UI (lower = first)
  display_style?: 'list' | 'grid' | 'buttons' | 'dropdown'; // UI presentation style
  icon?: string;                   // Optional icon/emoji for the group

  // Business logic
  applies_to_categories?: string[]; // Only show for specific categories
  applies_to_products?: string[];   // Only show for specific product IDs
  hidden_by_default?: boolean;     // Show in "Advanced options" section

  // License/Permission requirements
  requires_license?: 'alcohol' | 'tobacco' | 'custom'; // Special license required
  age_restricted?: number;         // Minimum age (e.g., 18 for alcohol)
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  AllergenFlags,
  IntoleranceFlags,
  DietaryFlags,
  SpiceInfo,
  NutritionPer100g,
  VideoSource,
  ProductMedia,
  IngredientMaster,
  ProductIngredient,
  Product,
  AutoComputationResult,
  CustomizationType,
  CustomizationOption,
  ProductCustomization,
};
