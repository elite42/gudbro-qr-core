-- Module 11: Centralized Menu Database Schema
-- Version: 1.0
-- Uses JSONB for scalable translations

-- Shared Menu Items (Centralized Database)
CREATE TABLE IF NOT EXISTS shared_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Translations (JSONB for scalability)
    name_translations JSONB NOT NULL,         -- {"vn": "Cà phê", "ko": "커피", "cn": "咖啡", "en": "Coffee"}
    description_translations JSONB,           -- {"vn": "...", "ko": "...", "cn": "...", "en": "..."}
    
    -- Classification
    category VARCHAR(50) NOT NULL,            -- beverage, food, dessert
    subcategory VARCHAR(50),                  -- beer, wine, coffee, pasta, pizza
    
    -- Content
    ingredients TEXT[],                       -- ['coffee beans', 'water']
    allergens TEXT[],                         -- ['dairy', 'nuts']
    dietary_flags TEXT[],                     -- ['vegan', 'vegetarian', 'halal']
    
    -- Media
    photo_url TEXT,
    base_price_vnd INTEGER NOT NULL,          -- Base price before modifiers
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Item modifiers (sizes, styles, order types)
CREATE TABLE IF NOT EXISTS menu_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES shared_menu_items(id) ON DELETE CASCADE,
    
    modifier_type VARCHAR(50) NOT NULL,       -- size, style, blend, order_type, extras
    modifier_value VARCHAR(100) NOT NULL,     -- small, large, lungo, takeaway, etc.
    name_translations JSONB NOT NULL,         -- {"vn": "Lớn", "ko": "크게", "cn": "大", "en": "Large"}
    
    price_modifier INTEGER DEFAULT 0,         -- +5000, -2000, 0
    is_default BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant Menu Items (Per-restaurant customization)
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL,              -- References users(id)
    shared_item_id UUID NOT NULL REFERENCES shared_menu_items(id),
    
    -- Customization
    custom_price_vnd INTEGER,                 -- Override base price (NULL = use base)
    custom_ingredients TEXT[],                -- Override ingredients
    custom_description_translations JSONB,    -- Override descriptions
    enabled_modifiers UUID[],                 -- Which modifiers are available (NULL = all)
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    menu_section VARCHAR(100),                -- 'Appetizers', 'Main Course', etc.
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(restaurant_id, shared_item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_items_category ON shared_menu_items(category);
CREATE INDEX IF NOT EXISTS idx_shared_items_subcategory ON shared_menu_items(subcategory);
CREATE INDEX IF NOT EXISTS idx_shared_items_name ON shared_menu_items USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_shared_items_desc ON shared_menu_items USING GIN (description_translations);
CREATE INDEX IF NOT EXISTS idx_shared_items_active ON shared_menu_items(is_active);

CREATE INDEX IF NOT EXISTS idx_modifiers_item ON menu_item_modifiers(item_id);
CREATE INDEX IF NOT EXISTS idx_modifiers_type ON menu_item_modifiers(modifier_type);

CREATE INDEX IF NOT EXISTS idx_restaurant_items_restaurant ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_items_shared ON restaurant_menu_items(shared_item_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_items_available ON restaurant_menu_items(is_available);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shared_items_updated_at
    BEFORE UPDATE ON shared_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER restaurant_items_updated_at
    BEFORE UPDATE ON restaurant_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE shared_menu_items IS 'Centralized menu item database with JSONB translations';
COMMENT ON TABLE menu_item_modifiers IS 'Item modifiers (size, style, order type, etc.)';
COMMENT ON TABLE restaurant_menu_items IS 'Restaurant-specific menu items with custom pricing';
COMMENT ON COLUMN shared_menu_items.name_translations IS 'Item names in all languages: {"vn": "...", "ko": "...", "cn": "...", "en": "..."}';
COMMENT ON COLUMN shared_menu_items.base_price_vnd IS 'Base price before modifiers in VND';
COMMENT ON COLUMN menu_item_modifiers.price_modifier IS 'Price adjustment in VND (+5000, -2000, 0)';
