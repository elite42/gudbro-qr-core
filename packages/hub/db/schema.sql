-- Module 9: Hub Aggregator - Database Schema

-- Hub Pages (Landing pages con multiple links)
CREATE TABLE hub_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    
    -- Identity
    short_code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    
    -- Branding
    logo_url TEXT,
    cover_image_url TEXT,
    favicon_url TEXT,
    
    -- Template & Theme
    template VARCHAR(50) NOT NULL, -- restaurant, hotel, coffeeshop, etc.
    theme_json JSONB NOT NULL DEFAULT '{
        "primaryColor": "#000000",
        "secondaryColor": "#ffffff",
        "backgroundColor": "#f5f5f5",
        "textColor": "#333333",
        "fontFamily": "Inter",
        "borderRadius": "8px",
        "buttonStyle": "solid"
    }'::jsonb,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    password_hash VARCHAR(255), -- optional password protection
    custom_domain VARCHAR(255),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id),
    INDEX idx_qr_code_id (qr_code_id),
    INDEX idx_template (template),
    INDEX idx_created_at (created_at)
);

-- Hub Links (Individual links dentro ogni hub)
CREATE TABLE hub_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_page_id UUID REFERENCES hub_pages(id) ON DELETE CASCADE,
    
    -- Link Data
    type VARCHAR(50) NOT NULL, -- url, qr, email, phone, social, payment, etc.
    icon VARCHAR(100), -- lucide icon name or emoji
    label VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    
    -- Optional QR Code (se link è un QR generato)
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    
    -- Styling
    color VARCHAR(7), -- hex color override
    background_color VARCHAR(7),
    button_style VARCHAR(20), -- solid, outline, minimal
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    click_count INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_hub_page_id (hub_page_id),
    INDEX idx_display_order (display_order),
    INDEX idx_type (type),
    INDEX idx_qr_code_id (qr_code_id)
);

-- Hub Analytics (Detailed tracking)
CREATE TABLE hub_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_page_id UUID REFERENCES hub_pages(id) ON DELETE CASCADE,
    hub_link_id UUID REFERENCES hub_links(id) ON DELETE SET NULL,
    
    -- Event
    event_type VARCHAR(50) NOT NULL, -- view, click
    
    -- Visitor Data
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    -- Geo Data
    country VARCHAR(2),
    city VARCHAR(100),
    
    -- Device Data
    device_type VARCHAR(20),
    os VARCHAR(50),
    browser VARCHAR(50),
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_hub_page_id (hub_page_id),
    INDEX idx_hub_link_id (hub_link_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- Hub Templates (Saved custom templates)
CREATE TABLE hub_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- restaurant, hotel, etc.
    
    -- Template Configuration
    config_json JSONB NOT NULL, -- includes theme, default links, etc.
    preview_image_url TEXT,
    
    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
);

-- Trigger: Update updated_at on hub_pages
CREATE OR REPLACE FUNCTION update_hub_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hub_pages_updated_at
BEFORE UPDATE ON hub_pages
FOR EACH ROW
EXECUTE FUNCTION update_hub_pages_updated_at();

-- Trigger: Update updated_at on hub_links
CREATE OR REPLACE FUNCTION update_hub_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hub_links_updated_at
BEFORE UPDATE ON hub_links
FOR EACH ROW
EXECUTE FUNCTION update_hub_links_updated_at();

-- View: Hub Stats Summary
CREATE VIEW hub_stats AS
SELECT 
    hp.id,
    hp.short_code,
    hp.title,
    hp.template,
    hp.view_count,
    hp.unique_visitors,
    COUNT(DISTINCT hl.id) as total_links,
    COUNT(DISTINCT hl.id) FILTER (WHERE hl.is_active = true) as active_links,
    COALESCE(SUM(hl.click_count), 0) as total_clicks,
    hp.created_at
FROM hub_pages hp
LEFT JOIN hub_links hl ON hp.id = hl.hub_page_id
GROUP BY hp.id;
