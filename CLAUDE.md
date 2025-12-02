# GUDBRO QR Core - Claude Code Context

**Repository:** gudbro-qr-core
**Purpose:** QR Code Generation Platform - Core microservices & Admin UI
**Tech Stack:** Node.js (Express) + Next.js 15 (Frontend)
**Status:** Ready for Deployment
**Last Updated:** 2025-12-02

---

## Quick Context

This is the **QR Platform Core** - a complete QR code generation SaaS with:
- **19 QR code types** (URL, WiFi, vCard, VietQR, WeChat Pay, etc.)
- **AI Artistic QR** generation via Replicate
- **Multi-format output** (PNG, SVG, PDF)
- **Dynamic QR** with redirect tracking
- **Analytics** dashboard
- **Multi-language** support (EN, VN, KO, CN)

**Relationship to other repos:**
- `gudbro-verticals` → Standalone vertical apps (coffeeshop, wellness, rentals)
- `gudbro-qr-core` → This repo - QR platform services
- `qr-platform-complete` → ARCHIVED - Original 1.9GB monorepo (do not use)

---

## Repository Structure

```
gudbro-qr-core/
├── frontend/                 # Next.js 15 Admin UI (Port 3000)
│   ├── app/
│   │   ├── page.tsx         # Dev Dashboard - service status
│   │   ├── qr/              # QR Code creation pages
│   │   │   ├── page.tsx     # QR list/management
│   │   │   └── create/      # 19 QR type creation forms
│   │   │       ├── wifi/
│   │   │       ├── vcard/
│   │   │       ├── email/
│   │   │       ├── sms/
│   │   │       ├── event/
│   │   │       ├── social/
│   │   │       ├── vietqr/
│   │   │       ├── wechat-pay/
│   │   │       ├── zalo/
│   │   │       ├── kakaotalk/
│   │   │       ├── line/
│   │   │       ├── app-store/
│   │   │       ├── pdf/
│   │   │       ├── video/
│   │   │       ├── audio/
│   │   │       ├── multi-url/
│   │   │       ├── business-page/
│   │   │       ├── coupon/
│   │   │       └── feedback-form/
│   │   └── hub/             # Admin Hub pages
│   ├── components/          # React components
│   └── lib/                 # Frontend utilities
│
├── packages/                 # Backend Microservices
│   ├── qr-engine/           # QR Generation Engine (Port 3001)
│   │   ├── server.js        # Express server
│   │   ├── routes/
│   │   │   ├── qr.js        # Main QR CRUD routes (65KB!)
│   │   │   ├── qrDecode.js  # Decode & rework routes
│   │   │   ├── redirect.js  # Short URL redirects
│   │   │   └── artistic.js  # AI artistic QR routes
│   │   ├── services/
│   │   │   ├── artistic-qr-service.js  # Replicate AI integration
│   │   │   ├── cache-manager.js
│   │   │   └── gcs-uploader.js         # Google Cloud Storage
│   │   └── utils/
│   │       ├── qrGenerator.js    # Core QR generation (PNG/SVG/Buffer)
│   │       ├── qrTypes.js        # WiFi, vCard, Email, SMS, Event, Social
│   │       ├── vietqr.js         # Vietnamese QR payments
│   │       ├── wechatpay.js      # WeChat Pay integration
│   │       ├── zalo.js           # Zalo messaging
│   │       ├── kakaotalk.js      # KakaoTalk integration
│   │       ├── line.js           # LINE integration
│   │       ├── appstore.js       # App Store links
│   │       ├── pdf.js            # PDF QR codes
│   │       ├── video.js          # Video QR codes
│   │       ├── audio.js          # Audio QR codes
│   │       ├── multiurl.js       # Multi-URL QR codes
│   │       ├── businesspage.js   # Business page QR
│   │       ├── coupon.js         # Coupon QR codes
│   │       ├── feedbackform.js   # Feedback form QR
│   │       ├── qrDecoder.js      # Decode existing QR
│   │       ├── shortcode.js      # Short code generation
│   │       ├── cache.js          # Redis caching
│   │       └── styles-library.js # Artistic QR style presets
│   │
│   ├── analytics/           # Analytics Service (Port 3002)
│   ├── api/                 # API Gateway (Port 3000)
│   ├── auth/                # Auth Service (Port 3003)
│   ├── bulk/                # Bulk Operations (Port 3006)
│   ├── customization/       # QR Customization (Port 3007)
│   ├── filters/             # Safety Filters (Port 3009)
│   ├── hub/                 # Admin Hub (Port 3010)
│   ├── i18n/                # i18n Service (Port 3011)
│   ├── menu/                # Menu Management (Port 3012)
│   ├── menu-template/       # Reusable menu components
│   ├── templates/           # QR Templates (Port 3013)
│   └── shared/              # Shared utilities & database
│
└── docs/                    # Documentation
    ├── adr/                 # Architecture Decision Records
    └── REPOSITORY-SPLIT-MIGRATION-2025-11-28.md
```

---

## Tech Stack

### Frontend (Admin UI)
```json
{
  "framework": "Next.js 15.0.3",
  "react": "18.3.1",
  "styling": "Tailwind CSS 3.4.1",
  "state": "Zustand 5.x + TanStack Query 5.x",
  "icons": "Lucide React"
}
```

### Backend (QR Engine)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4.18",
  "qr": "qrcode 1.5.3",
  "image": "sharp 0.34, jimp 0.22",
  "ai": "replicate 0.25 (Artistic QR)",
  "database": "PostgreSQL (pg 8.11)",
  "cache": "Redis (ioredis 5.3)",
  "storage": "Google Cloud Storage"
}
```

---

## QR Types Supported (19 Total)

| Type | File | Description |
|------|------|-------------|
| URL | `qrGenerator.js` | Standard URL QR |
| WiFi | `qrTypes.js` | WiFi network credentials |
| vCard | `qrTypes.js` | Contact card |
| Email | `qrTypes.js` | Pre-filled email |
| SMS | `qrTypes.js` | Pre-filled SMS |
| Event | `qrTypes.js` | Calendar event |
| Social | `qrTypes.js` | Social media profile |
| VietQR | `vietqr.js` | Vietnamese bank payment |
| WeChat Pay | `wechatpay.js` | WeChat payment |
| Zalo | `zalo.js` | Zalo messaging |
| KakaoTalk | `kakaotalk.js` | KakaoTalk messaging |
| LINE | `line.js` | LINE messaging |
| App Store | `appstore.js` | iOS/Android app link |
| PDF | `pdf.js` | PDF document link |
| Video | `video.js` | Video link |
| Audio | `audio.js` | Audio link |
| Multi-URL | `multiurl.js` | Multiple URLs |
| Business Page | `businesspage.js` | Business landing page |
| Coupon | `coupon.js` | Discount coupon |
| Feedback Form | `feedbackform.js` | Customer feedback |

---

## API Endpoints (QR Engine)

### QR Management
```
POST   /qr                    - Create QR code
GET    /qr                    - List QR codes
GET    /qr/:id                - Get QR details
PATCH  /qr/:id                - Update QR code
DELETE /qr/:id                - Delete QR code
```

### QR Decode & Rework
```
POST   /api/qr/decode         - Decode QR from image
POST   /api/qr/rework         - Decode & regenerate QR
GET    /api/qr/rework/info    - Rework capabilities info
```

### Redirects & Health
```
GET    /:shortCode            - Redirect to destination URL
GET    /health                - Health check
GET    /cache/stats           - Cache statistics
```

---

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3006
NEXT_PUBLIC_QR_ENGINE_URL=http://localhost:3001
NEXT_PUBLIC_MENU_URL=http://localhost:3011
NEXT_PUBLIC_I18N_URL=http://localhost:3010
NEXT_PUBLIC_HUB_URL=http://localhost:3009
NEXT_PUBLIC_ANALYTICS_URL=http://localhost:3002
NEXT_PUBLIC_APP_NAME=Gudbro QR Platform
```

### QR Engine (.env)
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
BASE_URL=https://your-domain.com
REPLICATE_API_TOKEN=...          # For AI Artistic QR
GCS_BUCKET=gudbro-qr-images      # Google Cloud Storage
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Development

### Start Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### Start QR Engine
```bash
cd packages/qr-engine
npm install
npm run dev  # http://localhost:3001
```

### Build for Production
```bash
cd frontend
npm run build
```

---

## Deployment Status

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Frontend | Vercel | https://gudbro-qr-platform.vercel.app | ✅ LIVE |
| QR Engine | TBD | TBD | ⏳ Pending |
| Database | Supabase | TBD | ⏳ Pending |
| Redis | Upstash | TBD | ⏳ Pending |

---

## Recent Changes

### 2025-12-02: Stack Downgrade for Vercel Deployment
- **Frontend**: Next.js 16 → 15.0.3, React 19 → 18.3.1, Tailwind v4 → v3.4.1
- **Reason**: Next.js 16 and React 19 were experimental/unstable
- **Files Modified**:
  - `frontend/package.json` - Updated dependencies
  - `frontend/postcss.config.mjs` - Tailwind v3 config
  - `frontend/tailwind.config.js` - Created for v3
  - `frontend/app/globals.css` - Converted from `@import "tailwindcss"` to `@tailwind`
  - `frontend/next.config.js` - Simplified, removed TypeScript
- **Build Status**: SUCCESS (27 static pages generated)

---

## Known Issues & Technical Debt

### High Priority
- [x] ~~No GitHub remote configured~~ - Pushed to GitHub (elite42/gudbro-qr-core)
- [ ] QR Engine needs PostgreSQL database setup
- [ ] Redis connection required for caching
- [ ] Replicate API token revoked - need to create new one

### Medium Priority
- [ ] Frontend mock APIs used in development
- [ ] No authentication implemented yet
- [ ] Analytics service not connected

### Low Priority
- [ ] Geist font warnings (cosmetic)
- [ ] PWA disabled (was causing build issues)

---

## Architecture Decisions

### ADR-001: Microservices Architecture
Each service runs independently with its own port:
- Frontend: 3000
- QR Engine: 3001
- Analytics: 3002
- Auth: 3003
- etc.

### ADR-002: Redis for URL Caching
Short codes are cached in Redis for fast redirects. Falls back to PostgreSQL.

### ADR-003: Replicate for AI QR
Artistic QR uses Replicate's API for AI image generation. Requires API token.

---

## Quick Commands

```bash
# Start dev frontend
cd frontend && npm run dev

# Start QR engine
cd packages/qr-engine && npm run dev

# Build frontend
cd frontend && npm run build

# Run tests
cd packages/qr-engine && npm test
```

---

## Related Repositories

- **gudbro-verticals** - Standalone vertical apps (coffeeshop PWA, wellness, rentals)
- **qr-platform-complete** - ARCHIVED original monorepo (do not use)

---

## Getting Help

**Within this repo:**
- Check this file (CLAUDE.md)
- Review `/docs/` for architecture docs
- Check individual package README.md files

**Project-Wide:**
- `/docs/MODULE-REGISTRY.md` - All modules
- `/docs/adr/` - Architecture Decision Records

---

**This file provides project-wide context for Claude Code sessions.**

**Last Updated:** 2025-12-02

---

## Claude Code Session Rules

### Auto-Update Rule

**IMPORTANTE:** Claude deve aggiornare questo file CLAUDE.md automaticamente dopo:
1. Ogni **deploy** completato
2. Ogni **fix critico** risolto
3. Ogni **nuova feature** implementata
4. Ogni **decisione architetturale** importante
5. Prima di **chiudere sessioni lunghe** (quando il contesto si riempie)

### Come Aggiornare
- Aggiornare la sezione "Recent Changes" con data e descrizione
- Aggiornare "Deployment Status" se cambia
- Aggiornare "Known Issues" se risolti o nuovi
- Aggiornare "Last Updated" con la data corrente
- Fare commit delle modifiche

### Trigger Frase
Se l'utente dice "Aggiorna CLAUDE.md" o "salva contesto", Claude deve aggiornare immediatamente questo file con lo stato attuale della sessione
