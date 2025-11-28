# QR ENGINE - Development Brief

**Version:** 1.0 | **Target:** Claude Code AI Assistant

---

## OBJECTIVE

Build a competitive QR code generation platform with 3 revenue streams:
1. B2C standalone product ($10-100/mo)
2. Internal API for Gudbro products (QR Menu, Instant Feedback, Link Aggregator)
3. External B2B API for developers ($29-499/mo)

**Unique Value:** AI artistic QR + hospitality vertical integration (menu + health filters)

---

## CURRENT STACK

```
Backend: Node.js + Express
Database: PostgreSQL 15 + Redis 7
QR Libraries: qrcode (node), Replicate API (artistic)
Infrastructure: Docker Compose → GCP Cloud Run
Frontend (planned): Next.js 16 + React 19 + Tailwind 4
```

**Existing Services:**
- `qr-engine`: Static/Dynamic/Artistic QR generation
- `customization`: Design templates, logo embedding
- 11 microservices total (all UP)

---

## IMPLEMENTED FEATURES

**✅ QR Artistic (AI)**
- Replicate ControlNet API
- 15 templates (nature, urban, art, food, seasonal)
- Custom prompt support
- 5 parameters: steps, guidance, conditioning, seed, resolution

**✅ QR Static/Dynamic**
- 3 patterns: dots, squares, rounded
- 3 eye styles: square, rounded, dot
- Colors: foreground/background
- Logo embedding (auto-resize, max 5MB)
- Export: PNG, SVG, PDF
- Error correction: L/M/Q/H

**✅ Dynamic QR**
- Editable destination URL
- Short code (random/custom)
- Analytics: total_scans, last_scanned_at
- Expiration date, max scans, active toggle

---

## PRIORITY FEATURES TO BUILD

### **P0 - Feature Parity (Week 1-3, 60h)**

**Week 1: Essential QR Types (20h)**
```javascript
// WiFi QR
{ ssid, password, encryption }
→ "WIFI:T:WPA;S:name;P:pass;;"

// vCard QR
{ name, phone, email, company }
→ vCard format string

// Email/SMS
mailto:email@test.com?subject=Hi
sms:+1234567890?body=Message

// Event (iCalendar)
{ title, start, end, location }

// Social links
{ platform: 'instagram', username: 'account' }
```

**Week 2: Advanced Customization (20h)**
- Frame templates (10): "Scan me", "Menu here", "Follow us"
- Pattern expansion: +6 (classy, fluid, extra-rounded, star)
- Eye styles: +5 (leaf, frame, extra-rounded)
- Gradient colors support

**Week 3: Export Quality (20h)**
- High-res PNG (300 DPI)
- Print-ready PDF (with bleed)
- EPS export
- Bulk ZIP download

### **P1 - Frontend MVP (Week 4-5, 40h)**

**Week 4: Core UI (20h)**
```
/                  → Landing page
/generate          → QR generator (type select + customization)
/preview           → Real-time preview
```

**Week 5: Dashboard (20h)**
```
/auth/signup       → User registration
/auth/login        → Login
/dashboard         → My QR codes (list/grid)
/dashboard/qr/:id  → Edit dynamic QR
/analytics         → Scans, geo, device
```

### **P2 - API & Docs (Week 6-8, 40h)**

**Week 6: REST API (20h)**
```
POST   /v1/qr/generate        # Create QR
GET    /v1/qr/:id             # Fetch QR
PUT    /v1/qr/:id             # Update dynamic
DELETE /v1/qr/:id             # Delete
GET    /v1/qr                 # List (paginated)
POST   /v1/webhooks/register  # Register webhook
```

**Authentication:** API key (Bearer token)
**Rate limiting:** 10/100/500/2000 req/min per tier

**Week 7-8: Developer Experience (20h)**
- OpenAPI/Swagger docs
- Interactive playground
- JavaScript SDK
- Python SDK (optional)
- Code examples (cURL, JS, Python)

---

## API PRICING MODEL

```
FREE:
- 1,000 QR/mo
- 10,000 scans/mo
- Full API access
- No credit card

STARTER ($29/mo):
- 10,000 QR/mo
- 100,000 scans/mo
- All features
- Email support

GROWTH ($99/mo):
- 50,000 QR/mo
- 500,000 scans/mo
- White-label
- Webhooks
- SLA 99.5%

ENTERPRISE (Custom):
- Unlimited
- Dedicated support
- SLA 99.9%
```

---

## ARCHITECTURE GUIDELINES

### **API Design**
- RESTful endpoints
- JSON responses
- Consistent error format:
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "URL is required",
    "field": "url"
  }
}
```

### **Performance Targets**
- API latency: <100ms p95
- QR generation: <200ms
- Artistic QR: <10s (Replicate dependency)
- Cache: Redis for repeat QR (MD5 hash key)

### **Security**
- Input validation (Joi schemas)
- Rate limiting (Redis-based)
- API key rotation support
- HTTPS only
- SQL injection prevention (parameterized queries)

### **Database Schema Additions Needed**

```sql
-- New QR types
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'url', 'wifi', 'vcard', 'email', etc.
  data JSONB, -- Type-specific data
  style_config JSONB, -- Pattern, colors, logo
  image_url TEXT,
  short_code VARCHAR(20) UNIQUE,
  is_dynamic BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE qr_scans (
  id UUID PRIMARY KEY,
  qr_id UUID REFERENCES qr_codes(id),
  scanned_at TIMESTAMP DEFAULT NOW(),
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  user_agent TEXT
);

-- API keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  key_hash VARCHAR(255), -- bcrypt hash
  key_prefix VARCHAR(10), -- 'pk_live_', 'pk_test_'
  name VARCHAR(100),
  tier VARCHAR(50), -- 'free', 'starter', 'growth', 'enterprise'
  rate_limit INTEGER, -- requests per minute
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);
```

---

## TESTING REQUIREMENTS

**Unit Tests:**
- QR generation functions (all types)
- URL validation
- vCard format generation
- WiFi string format

**Integration Tests:**
- API endpoints (create, read, update, delete)
- Authentication flow
- Rate limiting
- Webhook delivery

**Performance Tests:**
- 1000 concurrent QR generations
- API latency under load
- Cache hit rate >80%

---

## DEPLOYMENT

**Development:**
```bash
docker compose up
```

**Production (GCP Cloud Run):**
```
qr-engine → Cloud Run service
PostgreSQL → Cloud SQL
Redis → Memorystore
Images → Cloud Storage
```

**Environment Variables:**
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
REPLICATE_API_TOKEN=r8_xxx
GCS_BUCKET=qr-engine-prod
API_BASE_URL=https://api.qrengine.com
JWT_SECRET=xxx
```

---

## SUCCESS METRICS

**Development:**
- Feature parity: 3 weeks
- Frontend MVP: 2 weeks
- API + docs: 3 weeks
- **Total:** 8 weeks to launch

**Business (Year 1):**
- 500 B2C users × $20 = $10k MRR
- 50 API customers × $150 = $7.5k MRR
- Internal products: $11k MRR
- **Target ARR:** $335k

---

## IMMEDIATE NEXT STEPS

1. **WiFi QR implementation** (2h)
   - Parse { ssid, password, encryption }
   - Generate `WIFI:T:WPA;S:name;P:pass;;` string
   - Test with real devices

2. **vCard QR implementation** (3h)
   - Generate vCard 3.0 format
   - Support: name, phone, email, company, address
   - Test import on iOS/Android

3. **Frame templates** (6h)
   - Design 10 SVG frames
   - Overlay logic (QR + frame composition)
   - Export with frame included

4. **API key system** (4h)
   - Generate keys: `pk_live_xxxxx`, `pk_test_xxxxx`
   - Hash + store in DB
   - Middleware for authentication

---

## COMPETITOR BENCHMARKS

**Beat these targets:**
- QR Tiger: 500-3000 API calls/mo on paid tier → **Offer 10,000**
- Flowcode: AI art at $250/mo → **Offer at $30/mo**
- All competitors: No native SDKs → **Build JS + Python SDKs**
- All competitors: "Contact sales" API → **Public pricing**

---

## KEY CONSTRAINTS

- **No breaking changes** to existing QR Menu, Instant Feedback integrations
- **Backward compatibility** for all API endpoints
- **Replicate API cost:** ~$0.07/artistic QR (manage budget)
- **Vietnam market:** Target $20-25/mo ARPU (local purchasing power)

---

## RESOURCES

**Docs:**
- QR Code spec: ISO/IEC 18004
- vCard 3.0: RFC 2426
- iCalendar: RFC 5545
- WiFi QR: Android spec

**APIs:**
- Replicate: https://replicate.com/docs
- Stripe: https://stripe.com/docs/api
- Kong Gateway: https://docs.konghq.com

**Libraries:**
- qrcode: https://github.com/soldair/node-qrcode
- sharp: Image processing
- joi: Validation
- ioredis: Redis client

---

**END OF BRIEF**
