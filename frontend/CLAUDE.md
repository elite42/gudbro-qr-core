# QR Platform Frontend - Claude Code Context

**App:** QR Platform Admin Dashboard
**Tech Stack:** Next.js 15.0.3 + React 18.3.1 + Tailwind 3.4.1
**Port:** 3000
**Status:** Ready for Deployment
**Last Updated:** 2025-12-02

---

## Quick Context

This is the **Admin Dashboard** for GUDBRO's QR Platform. It provides:
- QR code creation for 19 different types
- QR code management and analytics
- Hub administration
- Service status monitoring

**NOT a public-facing app** - this is for business administrators.

---

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Dev Dashboard (service status cards)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + GUDBRO brand colors
│   │
│   ├── qr/                   # QR Code Management
│   │   ├── page.tsx          # QR list/grid view
│   │   └── create/           # 19 QR type creation forms
│   │       ├── [type]/       # Dynamic route for all types
│   │       ├── wifi/page.tsx
│   │       ├── vcard/page.tsx
│   │       ├── email/page.tsx
│   │       ├── sms/page.tsx
│   │       ├── event/page.tsx
│   │       ├── social/page.tsx
│   │       ├── vietqr/page.tsx
│   │       ├── wechat-pay/page.tsx
│   │       ├── zalo/page.tsx
│   │       ├── kakaotalk/page.tsx
│   │       ├── line/page.tsx
│   │       ├── app-store/page.tsx
│   │       ├── pdf/page.tsx
│   │       ├── video/page.tsx
│   │       ├── audio/page.tsx
│   │       ├── multi-url/page.tsx
│   │       ├── business-page/page.tsx
│   │       ├── coupon/page.tsx
│   │       └── feedback-form/page.tsx
│   │
│   └── hub/                  # Admin Hub
│       ├── page.tsx          # Hub list
│       ├── create/page.tsx   # Create hub
│       └── [id]/edit/page.tsx # Edit hub
│
├── components/
│   ├── ui/                   # UI components
│   ├── hub/                  # Hub-specific components
│   ├── qr/                   # QR-specific components
│   ├── filters/              # Filter components
│   ├── menu/                 # Menu components
│   └── layout/               # Layout components
│
├── lib/                      # Utilities
│   ├── api/                  # API client functions
│   └── utils/                # Helper functions
│
├── public/                   # Static assets
│
├── mock-hub-api.js           # Mock API for development
├── mock-qr-api.js            # Mock QR API for development
│
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.mjs        # PostCSS configuration
├── next.config.js            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Tech Stack

```json
{
  "framework": "Next.js 15.0.3",
  "react": "18.3.1",
  "styling": "Tailwind CSS 3.4.1",
  "state": "Zustand 5.x",
  "data": "TanStack Query 5.x",
  "icons": "Lucide React",
  "dates": "date-fns 4.x"
}
```

---

## GUDBRO Brand Colors

Defined in `globals.css` and `tailwind.config.js`:

```css
:root {
  --gudbro-red: #CD0931;      /* Primary */
  --gudbro-black: #000000;
  --gudbro-yellow: #F8AD16;   /* Secondary/Gold */
  --gudbro-gray-light: #F2F2F2;
  --gudbro-blue: #0931CD;
  --gudbro-gray-dark: #333333;
}
```

**Health Filter Colors:**
- Vegan: `#10B981` (green)
- Alert: `#F97316` (orange)
- Info: `#3B82F6` (blue)
- Allergen: `#EF4444` (red)

---

## Environment Variables

```bash
# Backend API URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3006
NEXT_PUBLIC_QR_ENGINE_URL=http://localhost:3001
NEXT_PUBLIC_MENU_URL=http://localhost:3011
NEXT_PUBLIC_I18N_URL=http://localhost:3010
NEXT_PUBLIC_HUB_URL=http://localhost:3009
NEXT_PUBLIC_ANALYTICS_URL=http://localhost:3002

# App Config
NEXT_PUBLIC_APP_NAME=Gudbro QR Platform
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,vn,ko,cn
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
```

---

## Development

### Start Dev Server
```bash
npm run dev
# Opens http://localhost:3000
```

### Start Mock APIs (for development without backend)
```bash
npm run mock-api      # Hub API mock
npm run mock-qr-api   # QR Engine mock
```

### Build Production
```bash
npm run build
```

### Lint
```bash
npm run lint
```

---

## Pages Overview

### Dev Dashboard (`/`)
Service status cards showing health of all microservices:
- QR Engine, Analytics, Customization, Bulk Ops
- Dynamic QR, API Gateway, Hub, i18n, Menu, Filters

### QR Management (`/qr`)
- Grid view of all QR codes
- Filter by type, status, date
- Quick actions (edit, delete, download)

### QR Creation (`/qr/create/*`)
19 specialized forms for each QR type:
- Each type has its own validation
- Preview QR before saving
- Download in PNG/SVG

### Hub Management (`/hub`)
- List all hubs
- Create/edit hubs
- Manage hub settings

---

## QR Types & Their Routes

| Type | Route | Description |
|------|-------|-------------|
| WiFi | `/qr/create/wifi` | Network name, password, encryption |
| vCard | `/qr/create/vcard` | Contact information |
| Email | `/qr/create/email` | Pre-filled email |
| SMS | `/qr/create/sms` | Pre-filled SMS |
| Event | `/qr/create/event` | Calendar event |
| Social | `/qr/create/social` | Social media link |
| VietQR | `/qr/create/vietqr` | Vietnamese bank payment |
| WeChat Pay | `/qr/create/wechat-pay` | WeChat payment |
| Zalo | `/qr/create/zalo` | Zalo messaging |
| KakaoTalk | `/qr/create/kakaotalk` | KakaoTalk messaging |
| LINE | `/qr/create/line` | LINE messaging |
| App Store | `/qr/create/app-store` | App download link |
| PDF | `/qr/create/pdf` | PDF document |
| Video | `/qr/create/video` | Video link |
| Audio | `/qr/create/audio` | Audio link |
| Multi-URL | `/qr/create/multi-url` | Multiple destinations |
| Business Page | `/qr/create/business-page` | Business landing page |
| Coupon | `/qr/create/coupon` | Discount coupon |
| Feedback Form | `/qr/create/feedback-form` | Customer feedback |

---

## Recent Changes

### 2025-12-02: Stack Downgrade for Vercel Compatibility

**Problem:** Original stack used Next.js 16 (canary) + React 19 + Tailwind v4 which caused build failures.

**Solution:** Downgraded to stable versions:
- Next.js 16 → 15.0.3
- React 19 → 18.3.1
- Tailwind v4 → v3.4.1

**Files Modified:**
1. `package.json` - Updated all dependencies
2. `postcss.config.mjs` - Changed from `@tailwindcss/postcss` to `tailwindcss` + `autoprefixer`
3. `tailwind.config.js` - Created (didn't exist for v4)
4. `globals.css` - Changed from `@import "tailwindcss"` to `@tailwind base/components/utilities`
5. `next.config.js` - Simplified, removed TypeScript config
6. Deleted `next.config.ts`

**Build Result:** SUCCESS - 27 static pages generated

---

## Known Issues

### Current
- Geist font warnings (cosmetic, doesn't affect functionality)
- PWA disabled (was causing build issues with new stack)

### Technical Debt
- Mock APIs used instead of real backend connection
- No authentication flow implemented
- TypeScript errors ignored (`ignoreBuildErrors: true`)

---

## Accessibility

The app follows WCAG AA compliance:
- All text meets 4.5:1 contrast ratio
- Form labels properly associated
- Focus states visible
- Keyboard navigation supported

---

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Mock APIs
npm run mock-api
npm run mock-qr-api

# Type check (disabled in build)
npx tsc --noEmit
```

---

## Dependencies on Backend Services

This frontend expects these services to be running:

| Service | Port | Purpose |
|---------|------|---------|
| QR Engine | 3001 | QR code generation |
| Analytics | 3002 | Scan tracking |
| Auth | 3003 | Authentication |
| API Gateway | 3006 | Request routing |
| Hub | 3009 | Hub management |
| i18n | 3010 | Translations |
| Menu | 3011 | Menu data |
| Filters | 3012 | Safety filters |

---

## Deployment

### Vercel Configuration
```
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Required Environment Variables (Vercel)
```
NEXT_PUBLIC_QR_ENGINE_URL=https://api.gudbro.com/qr
NEXT_PUBLIC_API_BASE_URL=https://api.gudbro.com
NEXT_PUBLIC_APP_NAME=Gudbro QR Platform
```

---

**This file provides frontend-specific context for Claude Code sessions.**

**Last Updated:** 2025-12-02
