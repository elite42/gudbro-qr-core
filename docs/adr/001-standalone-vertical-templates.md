# ADR 001: Standalone Vertical Business Templates

**Status:** Accepted
**Date:** 2025-11-17 (Documented retroactively)
**Decision Made:** 2025-11-05 to 2025-11-06
**Deciders:** Development team
**Related:** Root Cause Analysis (`ROOT-CAUSE-ANALYSIS-2025-11-17.md`)

---

## Context

On **November 5-6, 2025**, after completing the core platform (Modules 1-12) with integrated microservices architecture, a strategic pivot was made when developing vertical business packages (Rentals, Wellness, Coffeeshop).

### The Situation

- **Core Platform:** 12 integrated microservices with centralized services (Auth, i18n, Analytics, etc.)
- **Pressure:** 10-day MVP deadline to launch first customer-facing templates
- **Goal:** Validate product-market fit with Da Nang bike rental and spa businesses

### The Question

Should vertical packages:
- **Option A:** Integrate with core platform modules (use Module 10 for i18n, Module 12 for auth, etc.)?
- **Option B:** Build as standalone Next.js applications with own dependencies?

---

## Decision

**We chose Option B: Standalone Vertical Templates**

Vertical business packages (Rentals, Wellness, Coffeeshop) were built as **independent Next.js 14 applications** with:
- Own Express backends (where needed)
- Own database schemas
- Own i18n systems
- Own ports (3020+ range)
- Separate deployment units

---

## Rationale

### Why Standalone Was Chosen (Nov 5-6, 2025)

1. **Faster Time-to-Market**
   - No integration complexity with core platform
   - Parallel development possible
   - MVP launch in 10 days achievable

2. **Simpler Deployment**
   - Deploy to Vercel/Railway independently
   - No Docker orchestration needed for MVP
   - Easier for non-technical customers

3. **Independent Scaling**
   - Each vertical can scale independently
   - No shared infrastructure bottlenecks
   - Customer isolation

4. **Clear Separation of Concerns**
   - Vertical logic isolated
   - Easier to understand for new developers
   - Simpler debugging

5. **Flexibility Per Vertical**
   - Different languages per market (Coffeeshop: EN/VI/IT vs Platform: VN/KO/CN/EN)
   - Vertical-specific features
   - Customized UX per industry

### Evidence from Handovers

From `/docs/handovers/2025-11-05-rentals-frontend-complete.md` line 360:

> **4. Separate Frontend Package (vs monolithic)**
> **Rationale:** Easier deployment, independent scaling, clear separation of concerns

From `/docs/handovers/2025-11-06-seo-wellness-session.md` line 133-155:

> **Before This Session:** "QR Code Tool"
> **After This Session:** "Complete Business Website SaaS with Professional SEO"

This shows the strategic product pivot.

---

## Consequences

### Positive Outcomes

✅ **MVP Speed:** Rentals, Wellness, Coffeeshop built in 2-3 days each
✅ **Independent Deploys:** Each vertical deployable separately
✅ **Market Validation:** Faster customer feedback loop
✅ **Flexibility:** Italian added to Coffeeshop without affecting other verticals

### Negative Outcomes (Discovered Later)

⚠️ **Code Duplication:** 359+ lines of duplicate i18n code in Coffeeshop
⚠️ **Port Conflicts:** Verticals using same ports as core modules (3004, 3012, 3013)
⚠️ **Inconsistent Languages:** Coffeeshop EN/VI/IT vs Platform VN/KO/CN/EN
⚠️ **Forgotten Module 10:** Centralized i18n exists but unused
⚠️ **Documentation Gap:** Master Plan not updated to reflect new architecture

---

## Current Status (Nov 2025)

### What Works

- All 3 verticals functional and deployable
- Each vertical has own working i18n
- SEO infrastructure shared successfully (packages/shared/seo/)
- Menu-template system provides code reuse (80%)

### What Needs Fixing

1. **Port Conflicts:** Reassign vertical ports to 3020+ range
2. **i18n Strategy:** Decide migration to Module 10 or document separation
3. **Documentation:** Update Master Plan with current reality
4. **Process:** Prevent future divergence with checklists

---

## Future Direction (Recommended)

### Path Forward: Hybrid Approach

**Keep standalone architecture for verticals** ✅
**BUT integrate with Module 10 for i18n** ✅

**Why:** Best of both worlds
- Maintain deployment independence
- Gain multi-language scalability
- Reduce code duplication
- Preserve fast time-to-market

### Migration Trigger

Migrate to Module 10 when:
- **Adding next language** (ES, FR, DE, etc.)
- **5+ verticals exist** (duplication pain becomes severe)
- **Enterprise customer** requests consistent multi-language

**Estimated Effort:** 20-30 hours to migrate all verticals to Module 10

---

## Lessons Learned

### What Went Well

1. ✅ Decision was sound for MVP goals
2. ✅ Speed advantage achieved (10-day deadline met)
3. ✅ SEO infrastructure showed good code sharing is possible

### What Could Be Improved

1. ⚠️ Should have updated Master Plan immediately
2. ⚠️ Should have created ADR at time of decision
3. ⚠️ Should have checked for existing solutions (Module 10) before building new i18n
4. ⚠️ Should have reserved port ranges (core vs vertical)

---

## Compliance

This ADR **retroactively documents** a decision made on Nov 5-6, 2025, discovered through root cause analysis on Nov 17, 2025.

**References:**
- Root Cause Analysis: `/docs/ROOT-CAUSE-ANALYSIS-2025-11-17.md`
- Audit Report: `/docs/AUDIT-REPORT-2025-11-04.md`
- Handovers: `/docs/handovers/2025-11-05-*.md`, `/docs/handovers/2025-11-06-*.md`
- Git Commits: `e6b93e8` (Rentals), `17ddda6` (Menu-template), `30bd723` (Coffeeshop)

---

**Status:** ✅ Accepted (Retroactive documentation of existing decision)
**Next Review:** When adding 5th vertical or next language support
**Owner:** Development team + Product owner
