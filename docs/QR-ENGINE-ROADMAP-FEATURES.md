# QR Engine - Roadmap Nuove Funzionalità

**Data**: 3 Novembre 2025  
**Documento per**: Claude Code Implementation

---

## Overview

Specifiche nuove funzionalità QR Engine basate su analisi 25 competitor.

**Stato attuale**: 19 tipi QR  
**Target**: 30+ tipi QR (market leader)

---

## TIER 1: Payment QR (23-31h)

### PIX Payment (Brasile) - 6-8h
- 150M+ utenti
- Sistema Banca Centrale Brasile
- EMV standard

**Campi**:
```json
{
  "pix_key": "CPF/CNPJ/Email/Phone",
  "amount": "BRL optional",
  "beneficiary_name": "required"
}
```

**Endpoints**: `POST /api/qr/pix`, `GET /api/qr/pix/info`  
**Tests**: 40+ unit tests

---

### UPI Payment (India) - 8-10h
- 300M+ utenti
- NPCI Unified Payments Interface
- 200+ banks

**Campi**:
```json
{
  "vpa": "username@bank",
  "beneficiary_name": "required",
  "amount": "INR optional"
}
```

**Endpoints**: `POST /api/qr/upi`, `GET /api/qr/upi/banks`  
**Tests**: 50+ unit tests

---

### PromptPay (Thailandia) - 5-7h
- 50M+ utenti
- EMV QR standard

**Campi**:
```json
{
  "promptpay_id": "Phone/National ID",
  "amount": "THB optional"
}
```

**Endpoints**: `POST /api/qr/promptpay`  
**Tests**: 35+ unit tests

---

### PayNow (Singapore) - 4-6h
- 5M+ utenti (89% penetration)
- SGQR standard

**Campi**:
```json
{
  "proxy_type": "mobile/uen/vpa",
  "proxy_value": "value",
  "amount": "SGD optional"
}
```

**Endpoints**: `POST /api/qr/paynow`  
**Tests**: 30+ unit tests

---

## TIER 2: Dynamic Features (23-31h)

### Link Scheduling - 6-8h
- Attiva/disattiva per date
- Multiple schedules
- Timezone support

**DB**:
```sql
CREATE TABLE qr_schedules (
  qr_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  destination_url TEXT,
  timezone TEXT
);
```

**Endpoints**: `POST /api/qr/schedule`, `GET /api/qr/:id/schedules`  
**Tests**: 40+ unit tests

---

### Geofencing - 8-10h
- QR attivo solo in location
- Radius-based
- Multiple zones

**DB**:
```sql
CREATE TABLE qr_geofences (
  qr_id UUID,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  radius_meters INTEGER,
  outside_behavior TEXT
);
```

**Endpoints**: `POST /api/qr/geofence`, `POST /api/qr/geofence/check`  
**Tests**: 45+ unit tests

---

### Password Protection - 3-5h
- Bcrypt hashing
- Rate limiting (5 attempts → 15min lockout)
- Landing page: gudbro.com/p/[id]

**DB**:
```sql
CREATE TABLE qr_password_protection (
  qr_id UUID UNIQUE,
  password_hash TEXT,
  max_attempts INTEGER DEFAULT 5,
  lockout_minutes INTEGER DEFAULT 15
);
```

**Endpoints**: `POST /api/qr/password`, `POST /api/qr/password/verify`  
**Tests**: 30+ unit tests

---

### Retargeting Pixels - 6-8h
- Facebook/Meta Pixel
- Google Tag Manager
- Webhook on scan

**DB**:
```sql
CREATE TABLE qr_pixels (
  qr_id UUID,
  pixel_type TEXT, -- 'facebook', 'google_tag_manager'
  pixel_id TEXT,
  events JSONB
);
```

**Endpoints**: `POST /api/qr/pixel`, `GET /api/qr/:id/pixels`  
**Tests**: 35+ unit tests

---

## TIER 3: Conversion Tools (22-27h)

### Lead Capture Forms - 10-12h
- Email/SMS signup
- Custom fields
- CRM integrations (Mailchimp, HubSpot)

**DB**:
```sql
CREATE TABLE qr_forms (
  qr_id UUID,
  fields JSONB,
  webhook_url TEXT,
  integrations JSONB
);

CREATE TABLE qr_form_submissions (
  form_id UUID,
  data JSONB,
  submitted_at TIMESTAMPTZ
);
```

**Endpoints**: `POST /api/qr/form`, `POST /api/qr/form/:id/submit`  
**Tests**: 50+ unit tests

---

### A/B Testing - 12-15h
- Traffic splitting
- Goal tracking
- Auto-winner selection

**DB**:
```sql
CREATE TABLE qr_ab_tests (
  variants JSONB,
  goal_metric TEXT,
  duration_days INTEGER,
  winner_variant_id UUID
);
```

**Endpoints**: `POST /api/qr/ab-test`, `GET /api/qr/ab-test/:id`  
**Tests**: 60+ unit tests

---

## TIER 4: Polish (24-30h) - Optional

### Heatmap Analytics - 10-12h
- Geographic, time, device heatmaps
- Visual dashboard

### Animated Backgrounds - 8-10h
- GIF support (max 15 frames)
- Frame-by-frame generation

### Import/Convert QR - 6-8h
- Upload existing QR
- Decode + artistic redesign

---

## Implementation Sequence

**Phase 1**: Payment QR (Tier 1) - 23-31h  
**Phase 2**: Dynamic Features (Tier 2) - 23-31h  
**Phase 3**: Conversion Tools (Tier 3) - 22-27h  
**Phase 4**: Polish (Tier 4) - 24-30h (optional)

**Total**: 92-119h (11-15 giorni)

---

## Result

| Metric | Before | After |
|--------|--------|-------|
| QR Types | 19 | 30+ |
| Payment Systems | 2 | 9 |
| Dynamic Features | 0 | 4 |
| Conversion Tools | 0 | 2 |

**Competitive Position**: Market leader Asia-Pacific

---

## Per Claude Code

1. Read Master Plan + questo doc
2. Implement Phase 1-4 sequentially
3. 30+ unit tests per feature
4. Update OpenAPI/Swagger docs
5. Commit + Push

**Standard**: Production-ready, fully tested, documented.
