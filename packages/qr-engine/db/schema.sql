-- QR Platform - Module 1 Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- QR Codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    
    -- Type & Status
    type VARCHAR(20) DEFAULT 'static' CHECK (type IN ('static', 'dynamic')),
    is_active BOOLEAN DEFAULT true,
    
    -- Customization (JSON for future Module 3)
    design_json JSONB DEFAULT '{}',
    
    -- Features (for future Module 5)
    password_hash VARCHAR(255),
    expires_at TIMESTAMP,
    max_scans INTEGER,
    
    -- Tracking
    total_scans INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- QR Code Scans tracking table
CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE NOT NULL,
    
    -- Scan Metadata
    scanned_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    -- Geo Data (parsed from IP - Module 2)
    country VARCHAR(2),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Device Data (parsed from user_agent - Module 2)
    device_type VARCHAR(20),
    os VARCHAR(50),
    browser VARCHAR(50),
    
    -- UTM Parameters (if present)
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_country ON qr_scans(country);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for qr_codes updated_at
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for QR code statistics (for Module 2 Analytics)
CREATE OR REPLACE VIEW qr_code_stats AS
SELECT 
    qc.id,
    qc.short_code,
    qc.destination_url,
    qc.title,
    qc.total_scans,
    qc.last_scanned_at,
    COUNT(DISTINCT qs.ip_address) as unique_visitors,
    COUNT(DISTINCT DATE(qs.scanned_at)) as active_days
FROM qr_codes qc
LEFT JOIN qr_scans qs ON qc.id = qs.qr_code_id
GROUP BY qc.id, qc.short_code, qc.destination_url, qc.title, qc.total_scans, qc.last_scanned_at;

-- Sample user for testing (password: test123)
INSERT INTO users (email, password_hash, name, plan) 
VALUES (
    'demo@qrplatform.com',
    '$2b$10$rKVqwZxGJB5xGJxGJxGJxOHqL6P8ZxGJxGJxGJxGJxGJxGJxGJxGJ',
    'Demo User',
    'free'
) ON CONFLICT (email) DO NOTHING;
