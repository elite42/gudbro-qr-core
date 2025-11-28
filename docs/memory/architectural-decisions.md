# Architectural Decisions - Memory File

**Purpose:** Quick reference for key architectural choices
**Usage:** Claude Code can read this for instant context on "why we built it this way"
**Maintenance:** Update when making significant architectural changes

---

## Hybrid Architecture (Nov 5-6, 2025)

**Decision:** Use standalone vertical templates instead of integrating with core platform

**Rationale:**
- 10-day MVP deadline (achieved in 2-3 days per vertical)
- Simpler deployment (Vercel vs Kubernetes)
- Independent scaling per vertical
- Faster iteration

**Trade-offs:**
- ✅ Speed: 2-3 days per vertical vs estimated 10 days
- ✅ Simplicity: No Docker orchestration for MVP
- ⚠️ Duplication: i18n code duplicated (359 lines in Coffeeshop)
- ⚠️ Consistency: Different languages per vertical

**Result:** 3 verticals (Rentals, Wellness, Coffeeshop) created in 4 days total

**See:** docs/adr/001-standalone-vertical-templates.md

---

## Port Allocation Strategy (Nov 17, 2025)

**Decision:** Core modules 3000-3013, Verticals 3020+, Testing 4000+

**Rationale:**
- Prevents conflicts between core and verticals
- Clear separation of concerns
- Easy to identify module type by port

**Current Conflicts:**
- Coffeeshop on 3004 → Should be 3020
- Rentals on 3012/3013 → Should be 3021-3022

**Resolution Plan:** Move during next refactoring (low priority - no immediate impact)

**See:** docs/PORT-REGISTRY.json

---

## i18n Strategy (Nov 17, 2025)

**Decision:** Defer Module 10 migration until adding 5th language or 5th vertical

**Rationale:**
- Current duplication (359 lines) manageable for 1 vertical
- Italian (IT) needed for Coffeeshop but Module 10 only has VN/KO/CN/EN
- Migration effort (20-30 hours) better spent when benefit is clear

**Trigger Conditions:**
- Adding 5th language (ES, FR, DE, etc.)
- OR adding 5th vertical package
- OR enterprise customer requiring multi-language consistency

**Benefit After Migration:** 9.5 hours saved per language

**See:** docs/I18N-MIGRATION-ROADMAP.md

---

## Shared Code via menu-template (Nov 6, 2025)

**Decision:** Create menu-template package for 80% code reuse

**Rationale:**
- Multiple food/beverage verticals planned
- Common patterns: MenuCard, CategoryTabs, ProductCustomization
- Faster development for new verticals

**Result:** Coffeeshop achieved ~80% code reuse from menu-template

**See:** packages/menu-template/

---

## SEO Infrastructure Sharing (Nov 6, 2025)

**Decision:** Centralize SEO components in packages/shared/seo/

**Rationale:**
- Same SEO patterns across all verticals
- Single implementation, $0 scaling cost
- Consistent metadata, og:tags, structured data

**Usage:** All verticals (Rentals, Wellness, Coffeeshop) import from shared/seo

**See:** packages/shared/seo/

---

## No Integration with Module 10 (i18n) for Verticals

**Decision:** Verticals use own i18n systems (for now)

**Rationale:**
- Module 10 has VN/KO/CN/EN
- Coffeeshop needs EN/VI/IT (different set)
- Faster to build standalone than integrate

**Future:** Migrate to Module 10 when trigger occurs

**Impact:** 359 lines duplicate code in Coffeeshop

**See:** docs/I18N-MIGRATION-ROADMAP.md

---

## PostgreSQL for Data Persistence

**Decision:** Use PostgreSQL for all backends requiring database

**Rationale:**
- Robust, proven technology
- JSONB for flexible schemas (translations, metadata)
- Strong ecosystem

**Current Usage:**
- Wellness backend (spa services, bookings)
- Planned for Rentals, Coffeeshop when adding persistence

---

## Next.js 14 App Router for Frontends

**Decision:** All vertical frontends use Next.js 14 with App Router

**Rationale:**
- Server-side rendering (SSR) for SEO
- React Server Components for performance
- File-based routing (simple, predictable)
- Vercel deployment (optimized)

**Current Usage:** Coffeeshop, Rentals frontend, Wellness frontend (pending)

---

## Best Practices Adoption (Nov 17, 2025)

**Decision:** Implement Claude Code official best practices (CLAUDE.md, PROJECT-PLAN.md, etc.)

**Rationale:**
- Prevent "session amnesia" (Module 10 forgotten after 7 days)
- Documentation-reality gap discovered in audit
- Industry-standard practices improve maintainability

**Implemented:**
- Root CLAUDE.md (auto-loaded context)
- PROJECT-PLAN.md (session continuity)
- Vertical CLAUDE.md files (focused context)
- Context management (/clear, /context)
- Memory files (this file)

**Result:** 74% → 95%+ compliance with best practices

---

**Last Updated:** 2025-11-17
**Review Next:** When making next architectural change
**Owner:** Development Team
