# QR Menu - Product Specification

**Status:** Planned (Phase 3 - After Rentals Module Validation)
**Product Type:** Vertical SaaS for F&B/Services
**Core Dependency:** QR Engine (background service) + Hub Templates System

---

## 1. Product Vision

**What it is:**
Digital menu platform for restaurants, cafes, spas, salons in Vietnam (Da Nang focus).

**What it's NOT:**
- Not a general QR generator (that's QR Engine)
- Not AI chat interface (that's AI QR Creator)

**Core value:**
Physical menu → Digital menu + QR code in 30 seconds (with AI) or 5 minutes (manual).

---

## 2. Target Market

### Primary Segments:
- **Restaurants** (pho, banh mi, western food)
- **Cafes** (coffee shops, juice bars)
- **Spas/Salons** (massage, nails, hair)
- **Street vendors** (waffle stands, smoothie carts)

### Geography:
- Phase 1: Da Nang
- Phase 2: Vietnam major cities
- Phase 3: SEA expansion

---

## 3. Core Features

### 3.1 Smart Menu Import (Phase 2 - AI Feature)
- Upload photo → AI extracts text/prices
- Auto-categorization
- Image database matching
- DALL-E generation fallback
- Mobile flow (Claude AI → JSON → Import)

### 3.2 Digital Menu Builder (MVP)
- Drag & drop categories
- Item management (name, price, description, image)
- Multi-language support (VN, EN, KR)
- Mobile-first responsive design
- Template library (20+ industry-specific)

### 3.3 QR Code Generation
**Uses QR Engine API**
- Generates URL QR pointing to digital menu
- Auto-regenerates on menu updates
- Downloadable formats (PNG, SVG, PDF)
- Customization (colors, logo)

### 3.4 Menu Display (Public)
- Fast loading (<2s)
- Offline-capable (PWA)
- Search/filter
- Currency display (VND)
- Call-to-action buttons (Order, Reserve, Call)

### 3.5 Analytics
- Views per menu/item
- Peak hours
- Popular items
- Geographic data
- Device breakdown

### 3.6 Ordering Integration (Future)
- In-app ordering
- Payment gateway (VietQR, MoMo, ZaloPay)
- Kitchen display system
- Order management

---

## 4. Unified Hub Templates Architecture

**Strategic Decision (2025-11-05):**
QR Menu will be built on the same infrastructure as Rentals Module.

### Shared Components Library:
```
packages/hub-templates/
├── components/
│   ├── HeroSection.tsx      (reuse from Rentals)
│   ├── GalleryGrid.tsx      (adapt: bikes → menu items)
│   ├── ContactForm.tsx      (WhatsApp integration)
│   ├── PaymentWidget.tsx    (VietQR - reuse)
│   └── BookingWidget.tsx    (external integrations)
├── templates/
│   ├── rental-service/      (Rentals Module - ✅ Complete)
│   ├── qr-menu/             (This product - 📋 Planned)
│   ├── spa-massage/         (📋 Future)
│   └── hotel-accommodation/ (📋 Future)
└── utils/
    ├── api-client.ts
    ├── qr-engine-integration.ts
    └── analytics.ts
```

**Benefits:**
- 70% code reuse from Rentals Module
- Faster development (2-3 weeks vs 6-8 weeks)
- Consistent UX across verticals
- Easier maintenance

---

## 5. User Flows

### Flow A: First-Time Setup (Manual - MVP)
```
1. Sign up
2. Create menu (name, description, logo)
3. Add categories (Starters, Mains, Drinks, etc.)
4. Add items (name, price, description, image)
5. Choose template
6. Publish menu
7. Download QR code
8. Print & display
```

### Flow A2: First-Time Setup (AI - Phase 2)
```
1. Sign up
2. Upload menu photo
3. AI extracts data (30 seconds)
4. Review/edit extracted items
5. Choose template
6. Publish menu
7. Download QR code
8. Print & display
```

### Flow B: Menu Update
```
1. Login
2. Edit item (price/description/image)
3. Auto-save
4. QR code unchanged (same URL)
5. Changes live immediately
```

### Flow C: Customer Scan
```
1. Scan QR code
2. Menu loads (mobile-optimized)
3. Browse categories
4. View item details
5. [Future] Order & pay
```

---

## 6. QR Engine Integration

**Dependency:** QR Engine provides QR generation service.

**Integration points:**
1. **Menu publish** → Call QR Engine API → Generate URL QR
2. **Menu update** → No QR regeneration (same URL)
3. **Custom branding** → Pass style params to QR Engine
4. **Analytics** → QR scan tracking via QR Engine

**API Contract:**
```typescript
// QR Menu calls QR Engine
POST /api/qr-engine/generate
{
  "type": "url",
  "data": {
    "url": "https://menu.gudbro.com/jennie-spa"
  },
  "style": {
    "fgColor": "#000000",
    "bgColor": "#FFFFFF",
    "logo": "https://cdn.gudbro.com/logos/jennie-spa.png"
  },
  "metadata": {
    "source": "qr-menu",
    "business_id": "uuid-123"
  }
}

Response:
{
  "qr_id": "uuid-456",
  "image_url": "https://cdn.gudbro.com/qr/uuid-456.png",
  "download_urls": {
    "png": "...",
    "svg": "...",
    "pdf": "..."
  }
}
```

---

## 7. Technical Stack

### Frontend:
- React 18 + Next.js (shared with Rentals)
- Tailwind CSS
- PWA (offline capability)

### Backend:
- Node.js + Express (shared infrastructure)
- PostgreSQL (menu data)
- Redis (caching)

### Media:
- S3/CloudFlare R2 (images)
- Image database (pre-built library - Phase 2)

### AI (Phase 2):
- Claude Vision (OCR)
- DALL-E 3 (image generation)
- Real-ESRGAN (upscaling)

### Dependencies:
- **QR Engine API** (QR generation)
- **Hub Templates System** (shared components)
- PostHog (analytics)
- Stripe/VietQR (payments - future)

---

## 8. Pricing Model

**Unified Pricing (All Vertical Templates):**

### Free Tier:
- 1 Hub (any template)
- Basic features
- 7 days analytics
- Watermark on QR

### Starter ($9.99/month):
- 1 vertical template
- No watermark
- 30 days analytics
- Custom branding

### Pro ($29/month):
- Unlimited templates (mix & match)
- Custom domain
- 12 months analytics
- Priority support
- AI Smart Import (Phase 2)

### Enterprise ($79/month):
- Multi-location
- White-label
- API access
- Custom integrations
- Dedicated support

---

## 9. Competitors Analysis

### Global Leaders:

**MENU TIGER** (QR Code Tiger)
- **Pricing:** $17-119/month (subscription)
- **Features:** Full ordering system, payment integration (Stripe/PayPal), multi-store management, analytics, POS integration
- **Strengths:** Comprehensive, established (since 2018), 21 language support
- **Weaknesses:** Monthly recurring cost, no AI import, manual menu creation (30+ min)

**Menuzen**
- **Pricing:** Free + $13/month (Grow plan)
- **Features:** Menu design/management, templates, real-time updates, multi-location
- **Strengths:** Affordable, beautiful templates, no ordering commission
- **Weaknesses:** No ordering system (view-only), no AI import, no Vietnam-specific features

**Minimal Menu**
- **Pricing:** $14.90/month
- **Features:** Simple QR menu builder, view-only, fast load times
- **Strengths:** Clean design, mobile-first, affordable
- **Weaknesses:** View-only (no ordering), no customization, no AI

**Orderlina**
- **Pricing:** Free (limited 200 visits/month) + paid plans
- **Features:** Social media integration (FB/Instagram), commission-free, Loyverse POS
- **Strengths:** Free tier, social-first
- **Weaknesses:** Limited features, no AI import, no branded website

**SpotMenus**
- **Pricing:** Free (usage-based fees)
- **Features:** Dynamic QR codes, menu scheduling
- **Strengths:** Free, real-time updates
- **Weaknesses:** View-only, no admin users, no language support

**Others:**
- **FineDine:** $3.97-76.51/month (view-only to full)
- **Menuflow:** $25/month + $1-1.50 per QR card
- **uQR.me:** $4.95/month (view-only, PDF upload)
- **BuonMenu:** Basic menu builder
- **Menubly:** $9.99/month, commission-free

### Vietnam Market:
- **No local players** with AI-powered features
- Most use global tools (MENU TIGER, Menuzen)
- Manual menu creation standard
- No VietQR/MoMo/ZaloPay integration in competitors

### Gudbro Competitive Advantages:

**1. AI-Powered Import (Phase 2 - Unique)**
- Photo → Digital menu in 30 seconds
- Competitors: 30-60 min manual setup
- **10-20x faster**

**2. Pricing Model**
- $9.99-29/month (flexible)
- Competitors: $13-119/month recurring
- **Better value**

**3. Vietnam-Specific**
- VietQR, MoMo, ZaloPay integration
- Vietnamese/English/Korean support
- Da Nang local focus
- Competitors: Generic global tools

**4. Mobile-First Flow**
- Claude AI integration (Phase 2)
- No desktop required
- Competitors: Desktop-only menu builders

**5. Image Database (Phase 2)**
- 200+ pre-built Vietnam service images
- 80% match rate
- Competitors: User must provide all images

**6. No Commission**
- Keep 100% revenue
- Competitors: Some charge per order/transaction

**7. Hub Templates System**
- Unified platform (Menu + Booking + more)
- Cross-sell opportunities
- Competitors: Single-purpose tools

### Market Gaps (Our Opportunities):

✅ **AI menu extraction** - No competitor offers this (Phase 2)
✅ **Vietnam payment integration** - Missing in all tools
✅ **Unified hub platform** - Competitors are single-purpose
✅ **Mobile workflow** - Most require desktop
✅ **Image database** - No pre-built libraries for Vietnam (Phase 2)

### Threats:

⚠️ **MENU TIGER** could add AI import (market leader)
⚠️ **Menuzen** has strong design focus (brand appeal)
⚠️ **New entrants** may copy our AI approach

### Strategic Response:

1. **Validate first** - Launch Rentals Module, prove Hub Templates work
2. **Vietnam dominance** - Deep local integration (VietQR, banks, language)
3. **Network effects** - Build image database moat (200 → 2,000 items) (Phase 2)
4. **Platform play** - Multiple verticals on one platform = harder to compete

---

## 10. Success Metrics

- **Activation:** 70%+ complete first menu
- **Time-to-publish:** < 5 minutes (MVP) or < 1 minute (with AI - Phase 2)
- **Import accuracy (Phase 2):** > 95%
- **Conversion (free→paid):** 30%+
- **NPS:** > 50

---

## 11. Roadmap

### Phase 1: Rentals Module Validation (Week 1-2) ✅ IN PROGRESS
- Complete Rentals MVP
- Deploy demo
- Recruit 3-5 Da Nang bike shops
- Validate Hub Templates architecture
- **Decision Gate:** Only proceed if Rentals succeeds

### Phase 2: Extract Shared Components (Week 3-4)
- Refactor Rentals into reusable templates
- Create `packages/hub-templates/` structure
- Build shared components library
- Document template creation guide

### Phase 3: QR Menu MVP (Week 5-7)
- Clone Rentals template structure
- Adapt for F&B use case
- Manual menu builder (no AI yet)
- Basic analytics
- Deploy & test

### Phase 4: Da Nang Pilot (Week 8-10)
- Recruit 3-5 restaurants/cafes
- Free pilot program (3 months)
- Gather feedback
- Iterate on UX

### Phase 5: AI Features (Week 11-14)
- Integrate Claude Vision for Smart Menu Import
- Build image database (Vietnam-specific)
- Add DALL-E fallback generation
- Premium feature pricing

### Phase 6: Ordering System (Week 15-20)
- In-app ordering
- Payment integration (VietQR, MoMo, ZaloPay)
- Kitchen display
- Order management

---

## 12. Open Questions

**Q1:** Single menu URL format?
**A:** `hub.gudbro.com/{business-slug}` (unified with all templates)

**Q2:** Offline editing?
**A:** No - requires internet (AI dependency for Phase 2)

**Q3:** Print menu generation?
**A:** Future - export to PDF with layout

**Q4:** Integration with POS systems?
**A:** Phase 6 - start with API webhooks

**Q5:** AI costs sustainable?
**A:** Phase 2 analysis needed - Claude Vision + DALL-E costs per menu

---

## 13. Strategic Decision Log

### 2025-11-05: Rentals-First Strategy
**Decision:** Build Rentals Module first, then QR Menu on same infrastructure.

**Rationale:**
- Validate Hub Templates architecture with simpler use case
- Rentals = less complex (no AI dependency for MVP)
- Faster time-to-market (1-2 weeks vs 6-8 weeks)
- Lower cost (no AI API costs initially)
- Proven demand (EMOVE competitor exists in Da Nang)
- 70% code reuse for QR Menu after Rentals validation

**Timeline:**
- Rentals MVP: Week 1-2
- Shared components extraction: Week 3-4
- QR Menu MVP (manual): Week 5-7
- QR Menu AI features: Week 11-14

---

## 14. Related Documents

- `/docs/qr-menu/SMART-MENU-IMPORT.md` - AI import feature (Phase 2)
- `/docs/qr-menu/QR-ENGINE-INTEGRATION.md` - Dependency spec
- `/docs/qr-menu/TEMPLATE-LIBRARY.md` - Design templates
- `/docs/qr-menu/ANALYTICS-SPEC.md` - Tracking & insights
- `/docs/verticals/README.md` - Parent vertical business strategy
- `/packages/rentals/README.md` - Rentals Module (reference architecture)

---

**Source:** Claude Web brainstorming session (2025-11-05)
**Status:** Planned - Awaiting Rentals Module validation
**Next Review:** After Rentals pilot program results
