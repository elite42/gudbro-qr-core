# GUDBRO Platform - Module Registry

**Last Updated:** 2025-11-17
**Purpose:** Central registry of all modules, packages, and services in the platform
**Usage:** Check this BEFORE creating new modules to avoid duplication

---

## How to Use This Registry

### Before Starting Any New Feature:

1. **Search this file** for keywords related to your feature
2. **Check if a module already exists** that does what you need
3. **Check port availability** in the Port column
4. **If building new module:** Add it here immediately

### When Adding a Module:

```markdown
| Module Name | Port | Status | Purpose | i18n Support | Location |
```

---

## Core Platform Modules (Integrated Microservices)

### Module 1: QR Engine
| Property | Value |
|----------|-------|
| **Port** | 3001 |
| **Status** | ✅ Production Ready |
| **Purpose** | QR code generation and customization (13 types) |
| **Languages** | N/A (visual output) |
| **Location** | `packages/qr-engine/` |
| **Dependencies** | PostgreSQL, qrcode library |
| **API Endpoints** | `/api/qr/generate`, `/api/qr/customize` |
| **Key Features** | URL, WiFi, vCard, Email, SMS, Event, Social, Multi-QR |
| **Documentation** | `packages/qr-engine/README.md` |

---

### Module 2: Analytics
| Property | Value |
|----------|-------|
| **Port** | 3002 |
| **Status** | ✅ Production Ready |
| **Purpose** | QR code scan tracking and analytics |
| **Languages** | N/A (data only) |
| **Location** | `packages/analytics/` |
| **Dependencies** | PostgreSQL, TimescaleDB |
| **API Endpoints** | `/api/analytics/track`, `/api/analytics/reports` |
| **Key Features** | Scan tracking, geo-location, device detection, conversion goals |
| **Documentation** | `packages/analytics/README.md` |

---

### Module 3: Multi-Venue
| Property | Value |
|----------|-------|
| **Port** | 3003 |
| **Status** | ✅ Production Ready |
| **Purpose** | Multi-location management for businesses |
| **Languages** | N/A (management only) |
| **Location** | `packages/multi-venue/` |
| **Dependencies** | PostgreSQL |
| **API Endpoints** | `/api/venues/`, `/api/venues/:id` |
| **Key Features** | Multiple locations, location-specific QR codes, permissions |
| **Documentation** | `packages/multi-venue/README.md` |

---

### Module 4: Bulk
| Property | Value |
|----------|-------|
| **Port** | 3004 ⚠️ **CONFLICT WITH COFFEESHOP** |
| **Status** | ✅ Production Ready |
| **Purpose** | Bulk QR code generation |
| **Languages** | N/A |
| **Location** | `packages/bulk/` |
| **Dependencies** | PostgreSQL, Worker Queue |
| **API Endpoints** | `/api/bulk/generate`, `/api/bulk/status` |
| **Key Features** | CSV upload, batch generation, download ZIP |
| **Documentation** | `packages/bulk/README.md` |
| **⚠️ PORT CONFLICT:** Coffeeshop uses 3004, need to reassign |

---

### Module 5: Customization
| Property | Value |
|----------|-------|
| **Port** | 3005 |
| **Status** | ✅ Production Ready |
| **Purpose** | Advanced QR code visual customization |
| **Languages** | N/A |
| **Location** | `packages/customization/` |
| **Dependencies** | Canvas, Sharp (image processing) |
| **API Endpoints** | `/api/customize/template`, `/api/customize/preview` |
| **Key Features** | Colors, logos, patterns, frames, gradients |
| **Documentation** | `packages/customization/README.md` |

---

### Module 6: Dynamic QR
| Property | Value |
|----------|-------|
| **Port** | 3006 |
| **Status** | ✅ Production Ready |
| **Purpose** | Dynamic QR codes (URL changes without reprinting) |
| **Languages** | N/A |
| **Location** | `packages/dynamic-qr/` |
| **Dependencies** | PostgreSQL, Redis (caching) |
| **API Endpoints** | `/api/dynamic/:shortcode`, `/api/dynamic/update` |
| **Key Features** | Short URLs, A/B testing, schedule changes, geo-targeting |
| **Documentation** | `packages/dynamic-qr/README.md` |

---

### Module 7: Filters
| Property | Value |
|----------|-------|
| **Port** | 3013 ⚠️ **CONFLICT WITH RENTALS FRONTEND** |
| **Status** | ✅ Production Ready |
| **Purpose** | 51-filter categorization system for menu items |
| **Languages** | Multi-language (uses Module 10) |
| **Location** | `packages/filters/` |
| **Dependencies** | PostgreSQL |
| **API Endpoints** | `/api/filters/`, `/api/filters/category/:id` |
| **Key Features** | 51 filters (vegan, gluten-free, spicy, etc.), icons, colors |
| **Documentation** | `packages/filters/README.md`, `docs/research/GUDBRO-Sistema-51-Filtri-v2.md` |
| **⚠️ PORT CONFLICT:** Rentals frontend uses 3013, need to reassign |

---

### Module 8: Templates
| Property | Value |
|----------|-------|
| **Port** | 3008 |
| **Status** | ✅ Production Ready |
| **Purpose** | Pre-designed QR code templates |
| **Languages** | N/A (visual templates) |
| **Location** | `packages/templates/` |
| **Dependencies** | PostgreSQL |
| **API Endpoints** | `/api/templates/`, `/api/templates/:id` |
| **Key Features** | 20+ professional templates, industry-specific designs |
| **Documentation** | `packages/templates/README.md` |

---

### Module 9: QR Rework
| Property | Value |
|----------|-------|
| **Port** | 3009 |
| **Status** | ✅ Production Ready (INNOVATIVE) |
| **Purpose** | AI-powered QR code redesign service |
| **Languages** | N/A |
| **Location** | `packages/qr-rework/` (Phase 2.5 feature) |
| **Dependencies** | PostgreSQL, AI/ML service |
| **API Endpoints** | `/api/rework/analyze`, `/api/rework/suggest` |
| **Key Features** | Pattern recognition, style transfer, enhancement suggestions |
| **Documentation** | Git commit f249158 |

---

### Module 10: i18n (Internationalization) ⭐ **CRITICAL**
| Property | Value |
|----------|-------|
| **Port** | 3010 |
| **Status** | ✅ Production Ready **BUT UNUSED BY VERTICALS** |
| **Purpose** | Centralized translation and multi-language support |
| **Languages** | **VN, KO, CN, EN** (official platform languages) |
| **Location** | `packages/i18n/` |
| **Dependencies** | PostgreSQL (JSONB for translations) |
| **API Endpoints** | `/api/i18n/:lang`, `/api/i18n/translate` |
| **Key Features** | 4-language support, currency conversion, automatic detection |
| **Documentation** | `packages/i18n/README.md` |
| **⚠️ IMPORTANT:** Currently vertical packages (coffeeshop, rentals, wellness) have DUPLICATE i18n systems. See Migration Roadmap. |
| **Target State:** All verticals should use Module 10 for scalable multi-language support |

---

### Module 11: Hub Admin
| Property | Value |
|----------|-------|
| **Port** | 3011 |
| **Status** | ✅ Production Ready |
| **Purpose** | Admin dashboard for hub management |
| **Languages** | Uses Module 10 (VN/KO/CN/EN) |
| **Location** | `packages/hub/` |
| **Dependencies** | PostgreSQL, RBAC system |
| **API Endpoints** | `/api/hub/dashboard`, `/api/hub/settings` |
| **Key Features** | WCAG AA accessibility, multi-tenant, RBAC, white-label |
| **Documentation** | Git commit 3b92ffa |

---

### Module 12: Auth
| Property | Value |
|----------|-------|
| **Port** | 3012 ⚠️ **CONFLICT WITH RENTALS BACKEND** |
| **Status** | ✅ Production Ready |
| **Purpose** | Authentication and authorization |
| **Languages** | Uses Module 10 |
| **Location** | `packages/auth/` |
| **Dependencies** | PostgreSQL, JWT, bcrypt |
| **API Endpoints** | `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh` |
| **Key Features** | JWT tokens, RBAC, SSO ready, multi-tenant |
| **Documentation** | Git commit 37c94ac |
| **⚠️ PORT CONFLICT:** Rentals backend uses 3012, need to reassign |

---

## Vertical Business Packages (Standalone Next.js Apps)

### Rentals Module
| Property | Value |
|----------|-------|
| **Backend Port** | 3012 ⚠️ **CONFLICTS WITH AUTH** |
| **Frontend Port** | 3013 ⚠️ **CONFLICTS WITH FILTERS** |
| **Status** | ✅ MVP Complete |
| **Purpose** | Bike/scooter rental business template |
| **Languages** | **Own i18n system** (not using Module 10) |
| **Location** | `packages/rentals/` |
| **Dependencies** | Express, Next.js 14, PostgreSQL (own schema) |
| **API Endpoints** | `/api/rentals/:hubId/fleet`, `/api/rentals/:hubId/inquiry` |
| **Key Features** | Multi-venue, 4 vehicle categories, duration pricing, Zalo/WhatsApp |
| **Documentation** | `packages/rentals/README.md`, `docs/handovers/2025-11-05-rentals-frontend-complete.md` |
| **Created** | Nov 5, 2025 (Commit e6b93e8) |
| **Strategic Decision:** Standalone for faster MVP, future integration with Module 10 planned |

---

### Wellness Module
| Property | Value |
|----------|-------|
| **Backend Port** | TBD (not yet assigned) |
| **Frontend Port** | TBD (not yet assigned) |
| **Status** | 🔄 Backend Complete, Frontend Pending |
| **Purpose** | Spa/massage/beauty business template |
| **Languages** | **Own i18n system** (not using Module 10) |
| **Location** | `packages/wellness/` |
| **Dependencies** | Express, Next.js 14 (planned), PostgreSQL (own schema) |
| **API Endpoints** | `/api/wellness/:hubId/services`, `/api/wellness/:hubId/staff` |
| **Key Features** | Multi-venue, staff profiles, service-staff associations, booking system |
| **Documentation** | `packages/wellness/db/schema-v1-multi-venue.sql`, `docs/handovers/2025-11-06-seo-wellness-session.md` |
| **Created** | Nov 6, 2025 (Commit 17ddda6) |
| **Unique Feature:** Staff member profiles with ratings and specialties |

---

### Coffeeshop Module (ROOTS)
| Property | Value |
|----------|-------|
| **Frontend Port** | 3004 ⚠️ **CONFLICTS WITH BULK** |
| **Backend Port** | None (uses static data currently) |
| **Status** | ✅ Production Ready (Digital Menu TIER 1) |
| **Purpose** | Restaurant/coffee shop digital menu template |
| **Languages** | **EN, VI, IT** (own i18n system, NOT Module 10) |
| **Location** | `packages/coffeeshop/frontend/` |
| **Dependencies** | Next.js 14, Tailwind CSS |
| **Key Features** | Digital menu, WiFi QR, feedback system, currency converter, user preferences |
| **Documentation** | `packages/coffeeshop/frontend/config/coffeeshop.config.ts` |
| **Created** | Nov 9, 2025 (Commit 30bd723) |
| **⚠️ i18n ISSUE:** Has duplicate 359-line translation system. Korean added to config but no translations exist. |
| **Target State:** Migrate to Module 10 when adding next language |

---

## Shared Packages

### Menu Template System
| Property | Value |
|----------|-------|
| **Port** | N/A (library package) |
| **Status** | ✅ Production Ready |
| **Purpose** | Reusable template system for vertical businesses |
| **Languages** | Config-driven (each vertical chooses) |
| **Location** | `packages/menu-template/` |
| **Dependencies** | TypeScript types only |
| **Key Features** | BaseItem, VerticalConfig, flexible metadata, booking flows |
| **Documentation** | `packages/menu-template/README.md`, `packages/menu-template/MIGRATION_GUIDE.md` |
| **Created** | Nov 6, 2025 (Commit 17ddda6) |
| **Purpose:** 80% code sharing across verticals (restaurant, spa, hotel, retail) |

---

### Shared SEO Infrastructure
| Property | Value |
|----------|-------|
| **Port** | N/A (library package) |
| **Status** | ✅ Production Ready |
| **Purpose** | SEO utilities for all vertical packages |
| **Languages** | Multi-language support (vi, en, ko, zh) |
| **Location** | `packages/shared/seo/` |
| **Dependencies** | None (static generation) |
| **Key Features** | Schema.org, Open Graph, Twitter Cards, sitemaps, robots.txt |
| **Documentation** | `packages/shared/seo/README.md` |
| **Created** | Nov 6, 2025 |
| **Cost:** $0 at scale (pure code, no infrastructure) |

---

## Frontend Main Application

### Main Frontend (QR Engine UI)
| Property | Value |
|----------|-------|
| **Port** | 3000 |
| **Status** | ✅ Production Ready |
| **Purpose** | Main QR code creation and management UI |
| **Languages** | Uses Module 10 (VN/KO/CN/EN) |
| **Location** | `frontend/` |
| **Dependencies** | Next.js 14, React 19, Tailwind CSS |
| **Key Features** | QR creation, analytics dashboard, hub management, multi-tenant |
| **Documentation** | `frontend/README.md` |

---

## Port Allocation Summary

| Port | Module | Status | Conflict |
|------|--------|--------|----------|
| 3000 | Frontend (Main) | ✅ OK | None |
| 3001 | QR Engine | ✅ OK | None |
| 3002 | Analytics | ✅ OK | None |
| 3003 | Multi-Venue | ✅ OK | None |
| 3004 | Bulk Module | ⚠️ CONFLICT | Coffeeshop also uses 3004 |
| 3005 | Customization | ✅ OK | None |
| 3006 | Dynamic QR | ✅ OK | None |
| 3007 | (Available) | - | None |
| 3008 | Templates | ✅ OK | None |
| 3009 | QR Rework | ✅ OK | None |
| 3010 | i18n | ✅ OK | None |
| 3011 | Hub Admin | ✅ OK | None |
| 3012 | Auth Module | ⚠️ CONFLICT | Rentals backend also uses 3012 |
| 3013 | Filters Module | ⚠️ CONFLICT | Rentals frontend also uses 3013 |
| 3014+ | (Available) | - | None |

---

## Recommended Port Reassignments

| Package | Current Port | Recommended New Port | Reason |
|---------|--------------|---------------------|--------|
| Coffeeshop Frontend | 3004 | **3020** | Avoid conflict with Bulk (core module) |
| Rentals Backend | 3012 | **3021** | Avoid conflict with Auth (core module) |
| Rentals Frontend | 3013 | **3022** | Avoid conflict with Filters (core module) |
| Wellness Backend | TBD | **3023** | Future assignment |
| Wellness Frontend | TBD | **3024** | Future assignment |

**Rationale:** Ports 3001-3013 reserved for core platform modules. Vertical packages use 3020+ range.

---

## i18n Strategy Overview

### Current State (Nov 2025):
- **Core Platform:** Uses Module 10 (VN/KO/CN/EN) ✅
- **Rentals:** Own i18n system (languages TBD) ⚠️
- **Wellness:** Own i18n system (languages TBD) ⚠️
- **Coffeeshop:** Own i18n system (EN/VI/IT) ⚠️

### Target State (Future):
- **All packages:** Use Module 10 for centralized translations
- **Benefits:** Add 1 language → automatically available everywhere
- **Migration:** Planned when next language is added (ES, FR, DE, etc.)

### Why Migration is Important:
If you want to add **Spanish** in the future:

**Current (Standalone):**
- Add Spanish to coffeeshop manually
- Add Spanish to rentals manually
- Add Spanish to wellness manually
- Add Spanish to every new vertical manually
- **Total:** 4+ hours per language

**With Module 10 (Integrated):**
- Add Spanish to Module 10 once
- All verticals automatically get it
- **Total:** 30 minutes per language

---

## Quick Reference Commands

### Check if a module exists:
```bash
grep -i "keyword" docs/MODULE-REGISTRY.md
```

### Check port availability:
```bash
node docs/check-port.js 3015
```

### View all ports in use:
```bash
cat docs/PORT-REGISTRY.json
```

---

## Maintenance Guidelines

### When Adding a New Module:

1. ✅ Check this registry for duplicates
2. ✅ Choose available port (3014+)
3. ✅ Add entry to this file
4. ✅ Update `PORT-REGISTRY.json`
5. ✅ Create module documentation
6. ✅ Update Master Plan if architecture changes

### When Modifying a Module:

1. ✅ Update this registry
2. ✅ Update module's README
3. ✅ Update Master Plan if needed
4. ✅ Create handover document

---

## Related Documents

- **Port Registry:** `/docs/PORT-REGISTRY.json` (machine-readable)
- **Master Plan:** `/docs/GUDBRO-MASTER-PLAN.md` (strategic vision)
- **Root Cause Analysis:** `/docs/ROOT-CAUSE-ANALYSIS-2025-11-17.md` (why this registry exists)
- **Migration Roadmap:** `/docs/I18N-MIGRATION-ROADMAP.md` (future i18n integration)
- **ADR:** `/docs/adr/001-standalone-vertical-templates.md` (architectural decision)

---

**Last Updated:** 2025-11-17
**Maintained By:** Development team (update after every module addition)
**Purpose:** Prevent duplicate work, port conflicts, and architectural confusion
