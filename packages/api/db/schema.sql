-- Module 6: API & Integrations - Database Schema
-- PostgreSQL Schema for API keys, webhooks, and usage tracking

-- ============================================
-- API Keys Table
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References users(id) from Module 1
    
    -- Key Management
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(12) NOT NULL, -- First 12 chars for display (e.g., "qrp_live_abc")
    name VARCHAR(100),
    description TEXT,
    
    -- Permissions & Limits
    permissions JSONB DEFAULT '["read"]'::jsonb,
    rate_limit INTEGER DEFAULT 100, -- requests per hour
    
    -- Status & Tracking
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- Webhooks Table
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Webhook Configuration
    url TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '[]'::jsonb, -- ['scan', 'qr.created', 'qr.updated', 'qr.deleted']
    secret VARCHAR(255) NOT NULL, -- For HMAC signature
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 5000,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT fk_webhook_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);

-- ============================================
-- Webhook Deliveries Table (Logs)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    
    -- Delivery Data
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    
    -- Response
    response_code INTEGER,
    response_body TEXT,
    response_headers JSONB,
    
    -- Retry Management
    attempt_number INTEGER DEFAULT 1,
    succeeded BOOLEAN DEFAULT false,
    error_message TEXT,
    
    -- Timing
    delivered_at TIMESTAMP DEFAULT NOW(),
    duration_ms INTEGER,
    
    CONSTRAINT fk_webhook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_succeeded ON webhook_deliveries(succeeded);

-- ============================================
-- API Usage Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL,
    
    -- Request Data
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    
    -- Response Data
    status_code INTEGER,
    response_time_ms INTEGER,
    
    -- Additional Context
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    
    -- Timing
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_api_key FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- ============================================
-- Rate Limit Tracking (In-Memory Redis preferred, this is backup)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL,
    
    -- Tracking
    window_start TIMESTAMP NOT NULL,
    request_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_rate_limit_key FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_api_key_id ON rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- ============================================
-- Sample Permissions JSON Structure
-- ============================================
-- permissions: [
--   "read",           // GET endpoints only
--   "write",          // POST/PUT/PATCH/DELETE
--   "qr:read",        // QR-specific read
--   "qr:write",       // QR-specific write
--   "analytics:read", // Analytics access
--   "admin"           // Full access
-- ]

-- ============================================
-- Sample Events JSON Structure
-- ============================================
-- events: [
--   "scan",          // QR code scanned
--   "qr.created",    // New QR created
--   "qr.updated",    // QR updated
--   "qr.deleted",    // QR deleted
--   "qr.expired",    // QR expired
--   "limit.reached"  // Scan limit reached
-- ]

-- ============================================
-- Useful Queries
-- ============================================

-- Get API key usage in last 24 hours
-- SELECT 
--   COUNT(*) as requests,
--   AVG(response_time_ms) as avg_response_time,
--   COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
-- FROM api_usage_logs
-- WHERE api_key_id = 'uuid' 
-- AND created_at > NOW() - INTERVAL '24 hours';

-- Get webhook delivery success rate
-- SELECT 
--   webhook_id,
--   COUNT(*) as total_deliveries,
--   SUM(CASE WHEN succeeded THEN 1 ELSE 0 END) as successful,
--   ROUND(100.0 * SUM(CASE WHEN succeeded THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
-- FROM webhook_deliveries
-- WHERE delivered_at > NOW() - INTERVAL '7 days'
-- GROUP BY webhook_id;

-- Clean up old logs (run periodically)
-- DELETE FROM api_usage_logs WHERE created_at < NOW() - INTERVAL '90 days';
-- DELETE FROM webhook_deliveries WHERE delivered_at < NOW() - INTERVAL '30 days';
-- DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours';

COMMENT ON TABLE api_keys IS 'API keys for external integrations';
COMMENT ON TABLE webhooks IS 'Webhook endpoints for event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery logs and retry tracking';
COMMENT ON TABLE api_usage_logs IS 'API usage tracking for analytics and billing';
COMMENT ON TABLE rate_limits IS 'Rate limiting tracking (backup to Redis)';
