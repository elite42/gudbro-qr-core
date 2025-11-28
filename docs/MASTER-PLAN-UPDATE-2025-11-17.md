# Master Plan Update - November 2025

**Date:** 2025-11-17
**Type:** Architecture Reconciliation
**Trigger:** Root Cause Analysis discovered documentation-reality gap
**Status:** Recommendations for Master Plan alignment

---

## Purpose

This document provides updates to the GUDBRO Master Plan based on:
1. **Phase 1:** Comprehensive Audit (docs/AUDIT-REPORT-2025-11-04.md)
2. **Phase 2:** Root Cause Analysis (docs/ROOT-CAUSE-ANALYSIS-2025-11-17.md)
3. **Phase 3:** Structural Solution (this document)

**Goal:** Align Master Plan with current reality while documenting target architecture.

---

## Section 1: Architecture Status (UPDATE)

### Current Master Plan Says:
- "Integrated microservices platform"
- "12 core modules working together"
- "Centralized services (Auth, i18n, Analytics)"

### Current Reality:
- **Core Platform:** 12 integrated microservices ✅ (Modules 1-12)
- **Vertical Packages:** 3 standalone Next.js apps ✅ (Rentals, Wellness, Coffeeshop)
- **Integration:** Vertical packages do NOT use core modules (by design)

### Recommended Update:

Add new section to Master Plan:

```markdown
## Architecture: Hybrid Approach

GUDBRO consists of TWO architectures working in parallel:

### 1. Core QR Platform (Integrated Microservices)
- **Purpose:** QR code creation, analytics, multi-venue management
- **Stack:** Node.js microservices + PostgreSQL + Kong Gateway
- **Deployment:** Docker Compose (development), Kubernetes (production)
- **Modules:** 1-12 (QR Engine, Analytics, Auth, i18n, etc.)
- **Ports:** 3000-3013
- **Languages:** VN, KO, CN, EN (Module 10)

### 2. Vertical Business Templates (Standalone Apps)
- **Purpose:** Complete websites for specific industries
- **Stack:** Next.js 14 + Express (where needed) + Vercel/Railway
- **Deployment:** Independent (per vertical)
- **Verticals:** Rentals, Wellness, Coffeeshop (more to come)
- **Ports:** 3020+ (assigned per vertical)
- **Languages:** Per market (Coffeeshop: EN/VI/IT, Rentals: TBD, Wellness: TBD)

**Strategic Decision:** Nov 5-6, 2025 (documented in ADR 001)
**Rationale:** Faster time-to-market for MVPs, independent scaling, deployment simplicity
**Trade-off:** Code duplication (i18n) vs speed (10-day MVP achieved)
**Future:** Gradual integration via Module 10 when adding 5th language or 5th vertical
```

---

## Section 2: Language Support (UPDATE)

### Current Master Plan Says (Line 22):
```markdown
Multi-language support (VN, KO, CN, EN)
```

### Current Reality:
- **Core Platform:** VN, KO, CN, EN ✅ (Module 10)
- **Coffeeshop:** EN, VI, IT ⚠️ (own system)
- **Rentals:** TBD
- **Wellness:** TBD

### Recommended Update:

```markdown
## Language Support Strategy

### Official Platform Languages (Module 10):
- Vietnamese (VN)
- Korean (KO)
- Chinese (CN)
- English (EN)

### Vertical-Specific Languages (Current State):
- **Coffeeshop:** EN, VI (Vietnamese), IT (Italian) - own i18n system
- **Rentals:** To be determined
- **Wellness:** To be determined

### Migration Path:
When adding 5th language or 5th vertical, migrate all verticals to Module 10 for scalability.
See: `/docs/I18N-MIGRATION-ROADMAP.md`

### Adding New Languages:
1. If core platform feature → Add to Module 10
2. If vertical-specific need → Add to vertical's own system
3. When duplication becomes painful → Migrate to Module 10

**Current Status:** Vertical-specific OK for MVP, centralization planned for scale
```

---

## Section 3: Port Allocations (NEW SECTION)

### Add New Section:

```markdown
## Port Allocation Registry

All ports are tracked in `/docs/PORT-REGISTRY.json`

### Core Platform Modules (3000-3013):
| Port | Module | Status |
|------|--------|--------|
| 3000 | Frontend (Main) | Active |
| 3001 | QR Engine | Active |
| 3002 | Analytics | Active |
| 3003 | Multi-Venue | Active |
| 3004 | Bulk | Active ⚠️ Conflict with Coffeeshop |
| 3005 | Customization | Active |
| 3006 | Dynamic QR | Active |
| 3007 | Reserved | Available |
| 3008 | Templates | Active |
| 3009 | QR Rework | Active |
| 3010 | i18n | Active (unused by verticals) |
| 3011 | Hub Admin | Active |
| 3012 | Auth | Active ⚠️ Conflict with Rentals |
| 3013 | Filters | Active ⚠️ Conflict with Rentals |

### Vertical Business Packages (3020+):
| Port | Vertical | Status |
|------|----------|--------|
| 3020 | Coffeeshop Frontend (Target) | Recommended |
| 3021 | Rentals Backend (Target) | Recommended |
| 3022 | Rentals Frontend (Target) | Recommended |
| 3023 | Wellness Backend | Reserved |
| 3024 | Wellness Frontend | Reserved |
| 3025+ | Future Verticals | Available |

### Conflicts to Resolve:
1. **Coffeeshop** currently on 3004 → Move to 3020
2. **Rentals Backend** currently on 3012 → Move to 3021
3. **Rentals Frontend** currently on 3013 → Move to 3022

**Policy:** Core modules (3000-3013), Verticals (3020+), Testing (4000+)
```

---

## Section 4: Module Status Table (UPDATE)

### Current Table Needs:

Add rows for vertical packages:

```markdown
| Module | Status | Port | Languages | Integration |
|--------|--------|------|-----------|-------------|
| ... (existing 1-12) ... |
| **Vertical Packages** |
| Rentals | ✅ MVP Complete | 3021* | TBD | Standalone |
| Wellness | 🔄 Backend Ready | 3023* | TBD | Standalone |
| Coffeeshop | ✅ Production Ready | 3020* | EN/VI/IT | Standalone |

*Target ports (migration pending)
```

---

## Section 5: Documentation Index (NEW SECTION)

### Add to Master Plan:

```markdown
## Documentation Map

### Strategic Documents:
- `/docs/GUDBRO-MASTER-PLAN.md` - This file (strategic vision)
- `/docs/ROOT-CAUSE-ANALYSIS-2025-11-17.md` - How we got to current state
- `/docs/adr/001-standalone-vertical-templates.md` - ADR for architectural pivot

### Operational Documents:
- `/docs/MODULE-REGISTRY.md` - Complete module inventory
- `/docs/PORT-REGISTRY.json` - Machine-readable port allocation
- `/docs/DEVELOPMENT-PROCESS-CHECKLISTS.md` - Pre/post session checklists
- `/docs/I18N-MIGRATION-ROADMAP.md` - Multi-language scalability plan

### Audit Reports:
- `/docs/AUDIT-REPORT-2025-11-04.md` - Nov 4 comprehensive audit
- `/docs/AUDIT-REPORT-2025-11-17.md` - Nov 17 audit (if created)

### Session Handovers:
- `/docs/handovers/YYYY-MM-DD-*.md` - Daily development records
```

---

## Section 6: Roadmap Updates

### Phase 2 Vertical Business Templates (UPDATE STATUS)

**Current Master Plan Status:** Planned

**Actual Status:** IN PROGRESS

```markdown
## Phase 2: Vertical Business Templates

### Completed ✅:
- [x] Rentals Module (Bike/scooter rental) - Nov 5-6, 2025
- [x] Wellness Module Backend (Spa/massage) - Nov 6, 2025
- [x] Coffeeshop Module (Digital menu) - Nov 9, 2025
- [x] Menu-Template System (Code sharing) - Nov 6, 2025
- [x] Shared SEO Infrastructure - Nov 6, 2025

### In Progress 🔄:
- [ ] Wellness Frontend (2-3 hours remaining)
- [ ] Port conflict resolution (0.5 day)
- [ ] i18n migration preparation (when triggered)

### Planned 📅:
- [ ] Hotel/Accommodation vertical
- [ ] Retail/E-commerce vertical
- [ ] Services (barber, salon, etc.)
```

---

## Section 7: Known Issues & Technical Debt (NEW SECTION)

### Add to Master Plan:

```markdown
## Known Issues & Technical Debt

### Port Conflicts (HIGH Priority):
- Coffeeshop on 3004 conflicts with Bulk module
- Rentals on 3012/3013 conflicts with Auth/Filters modules
- **Action:** Reassign to 3020+ range
- **Effort:** 0.5 day
- **Risk:** Low

### i18n Duplication (MEDIUM Priority):
- Coffeeshop has 359 lines of duplicate i18n code
- Module 10 exists but unused by verticals
- **Action:** Migrate when adding 5th language
- **Effort:** 20-30 hours
- **Risk:** Low
- **Roadmap:** `/docs/I18N-MIGRATION-ROADMAP.md`

### Documentation Gaps (LOW Priority):
- Coffeeshop, Wellness lack README.md files
- **Action:** Create module documentation
- **Effort:** 2-3 days
- **Risk:** None

### Process Improvements (ONGOING):
- Implemented Pre/Post session checklists
- Created Module/Port registries
- Established ADR process
- **Status:** ✅ Complete
```

---

## Section 8: Decision Log (NEW SECTION)

### Add new section tracking architectural decisions:

```markdown
## Major Architectural Decisions

| Date | Decision | Rationale | Status | ADR |
|------|----------|-----------|--------|-----|
| 2025-11-05 | Standalone vertical templates | Faster MVP (10 days) | ✅ Accepted | ADR-001 |
| 2025-11-06 | Menu-template system | 80% code sharing | ✅ Accepted | Inline |
| 2025-11-06 | Shared SEO infrastructure | $0 cost at scale | ✅ Accepted | Inline |
| 2025-11-17 | Defer i18n migration | Wait for natural trigger | ✅ Accepted | Roadmap |
| 2025-11-17 | Vertical port range 3020+ | Avoid core conflicts | ✅ Accepted | PORT-REGISTRY |
```

---

## Section 9: Success Metrics (UPDATE)

### Add Current Reality to Metrics:

```markdown
## Success Metrics

### Development Velocity:
- **Target:** 10-day MVP per vertical
- **Actual:** ✅ Achieved (Rentals: 2 days, Wellness: 2 days, Coffeeshop: 2 days)

### Code Reuse:
- **Target:** 80% shared code via menu-template
- **Actual:** ✅ ~80% achieved (menu-template + SEO shared)
- **Trade-off:** i18n duplicated (acceptable for MVP)

### Time to Market:
- **Target:** 3 verticals in 1 month
- **Actual:** ✅ 3 verticals created Nov 5-9 (4 days)

### Port Management:
- **Target:** No conflicts
- **Actual:** ⚠️ 3 conflicts discovered (Coffeeshop, Rentals)
- **Action:** Migration to 3020+ range planned
```

---

## Implementation Checklist

To apply these updates to GUDBRO-MASTER-PLAN.md:

- [ ] Add "Architecture: Hybrid Approach" section
- [ ] Update "Language Support Strategy" section
- [ ] Add "Port Allocation Registry" section
- [ ] Update Module Status Table with verticals
- [ ] Add "Documentation Map" section
- [ ] Update Phase 2 roadmap status
- [ ] Add "Known Issues & Technical Debt" section
- [ ] Add "Major Architectural Decisions" table
- [ ] Update Success Metrics with actuals
- [ ] Add reference to this update document at top

---

## Alternative: Separate Master Plans

**Instead of updating existing Master Plan, consider:**

### Option A: Two Master Plans

1. **MASTER-PLAN-CORE.md** - Core QR platform (Modules 1-12)
2. **MASTER-PLAN-VERTICALS.md** - Business templates (Rentals, Wellness, Coffeeshop)

**Pros:** Clear separation, easier to maintain
**Cons:** Two sources of truth

### Option B: Master Plan + Vertical READMEs

1. **MASTER-PLAN.md** - High-level strategy (keep current)
2. **packages/rentals/README.md** - Rentals specifics
3. **packages/wellness/README.md** - Wellness specifics
4. **packages/coffeeshop/README.md** - Coffeeshop specifics

**Pros:** Documentation co-located with code
**Cons:** Scattered information

### Option C: Single Master Plan with Sections (RECOMMENDED)

1. Keep **GUDBRO-MASTER-PLAN.md** as single source of truth
2. Add sections for "Core Platform" and "Vertical Packages"
3. Link to detailed docs for each

**Pros:** One place to start, links to details
**Cons:** File becomes large

---

## Recommendation

**Implement Option C:**

1. Update Master Plan with sections from this document
2. Keep detailed docs in separate files (MODULE-REGISTRY, ADRs, etc.)
3. Master Plan becomes "index + high-level strategy"
4. Detailed docs provide depth

**Effort:** 1-2 hours to update Master Plan
**Priority:** MEDIUM (good documentation hygiene)
**Risk:** None

---

## Next Steps

1. **User Decision:** Review this update document
2. **Apply Changes:** Update MASTER-PLAN.md with approved sections
3. **Link Docs:** Ensure cross-references between documents
4. **Commit:** Git commit with message "docs: Update Master Plan to reflect hybrid architecture"

---

**Created By:** Claude Code (Phase 3 Structural Solution)
**Date:** 2025-11-17
**Purpose:** Reconcile Master Plan with current reality
**Status:** ✅ Ready for review and application
