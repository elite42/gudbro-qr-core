-- Translation Keys
CREATE TABLE IF NOT EXISTS translation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    context VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Translations
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
    language VARCHAR(2) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(key_id, language)
);

-- Currency Rates
CREATE TABLE IF NOT EXISTS currency_rates (
    base_currency VARCHAR(3) DEFAULT 'VND',
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(12, 6) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (base_currency, target_currency)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language);
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_currency_rates_updated ON currency_rates(updated_at);

-- Insert initial currency rates (fallback)
INSERT INTO currency_rates (base_currency, target_currency, rate) VALUES
    ('VND', 'VND', 1.000000),
    ('VND', 'KRW', 0.055000),
    ('VND', 'CNY', 0.000290),
    ('VND', 'USD', 0.000040),
    ('VND', 'EUR', 0.000037)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for translations
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
