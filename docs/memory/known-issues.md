# Known Issues - Memory File

**Purpose:** Track current issues with workarounds and status
**Usage:** Quick reference for blockers and technical debt
**Maintenance:** Update when issues resolved or new ones discovered

---

## High Priority

### None Currently

All high-priority issues have been documented and have resolution plans.

---

## Medium Priority

### Port Conflicts (3 instances)

**Issue:** Vertical packages using core platform port range

**Affected:**
- Coffeeshop on port 3004 (conflicts with Bulk module)
- Rentals backend on port 3012 (conflicts with Auth module)
- Rentals frontend on port 3013 (conflicts with Filters module)

**Impact:** Low - Services don't run simultaneously in current workflow

**Workaround:** None needed - conflicts documented, low impact

**Resolution Plan:**
- Move Coffeeshop: 3004 → 3020
- Move Rentals backend: 3012 → 3021
- Move Rentals frontend: 3013 → 3022

**Timeline:** When refactoring ports (next touching those modules)

**Status:** Documented in PORT-REGISTRY.json

**See:** docs/PORT-REGISTRY.json

---

### i18n Code Duplication

**Issue:** 359 lines of translation code duplicated in Coffeeshop vs Module 10

**Affected:**
- packages/coffeeshop/frontend/lib/translations.ts
- packages/coffeeshop/frontend/lib/use-translation.ts

**Impact:** Medium - Maintenance overhead, scalability concern

**Workaround:** Accept duplication for now (1 vertical manageable)

**Resolution Plan:**
- Migrate to Module 10 when adding 5th language OR 5th vertical
- Estimated effort: 20-30 hours (all verticals)
- Benefit: 9.5 hours saved per language after migration

**Trigger Conditions:**
- Adding Spanish, French, German, or other new language
- OR reaching 5+ vertical packages
- OR enterprise customer requiring multi-language consistency

**Status:** Roadmap created, waiting for trigger

**See:** docs/I18N-MIGRATION-ROADMAP.md

---

### Module 10 Unused by Verticals

**Issue:** Centralized i18n service (Module 10) exists but vertical packages don't use it

**Affected:**
- All verticals (Coffeeshop, Rentals, Wellness)
- Module 10 sits idle on port 3010

**Impact:** Medium - Duplicate effort when adding languages

**Root Cause:**
- Module 10 has VN/KO/CN/EN
- Coffeeshop needed EN/VI/IT (different set)
- Strategic decision for MVP speed

**Workaround:** Each vertical has own i18n system

**Resolution Plan:** Same as "i18n Code Duplication" above

**Status:** Accepted for now, migration planned

**See:** docs/I18N-MIGRATION-ROADMAP.md

---

## Low Priority

### Missing Vertical READMEs

**Issue:** Coffeeshop, Rentals, Wellness lack README.md files

**Impact:** Low - CLAUDE.md files serve this purpose

**Workaround:** Use vertical CLAUDE.md files

**Resolution Plan:** Create README.md when time permits (2-3 days total)

**Status:** Backlog

---

### No Automated Testing

**Issue:** No unit tests, integration tests, or E2E tests

**Affected:** Entire codebase

**Impact:** Medium - Regression risk when making changes

**Workaround:** Manual testing before commits

**Resolution Plan:**
- Setup testing infrastructure (Jest, Playwright)
- Add unit tests for critical paths
- Add integration tests for API endpoints
- Add E2E tests for user flows

**Effort:** 1-2 weeks

**Status:** Planned for next sprint

**See:** docs/PROJECT-PLAN.md

---

### Wellness Frontend Not Created

**Issue:** Backend complete, frontend UI not yet built

**Impact:** High for Wellness vertical, low for overall platform

**Workaround:** N/A - feature incomplete

**Resolution Plan:**
- Create Next.js 14 frontend
- Connect to backend API (port 3023)
- Estimated effort: 2-3 hours

**Status:** Next high-priority task

**See:** packages/wellness/CLAUDE.md

---

## Resolved Issues

### ~~Korean Language in Coffeeshop~~ ✅ RESOLVED (Nov 17, 2025)

**Issue:** Korean appeared in language selector but no translations existed

**Resolution:** Removed Korean from supportedLanguages in coffeeshop.config.ts

**Documented:** Will add back when migrating to Module 10 (which has Korean)

---

### ~~Documentation-Reality Gap~~ ✅ RESOLVED (Nov 17, 2025)

**Issue:** Master Plan described ideal state, not current reality. Discovered during audit.

**Resolution:** Created comprehensive documentation:
- MODULE-REGISTRY.md
- PORT-REGISTRY.json
- ROOT-CAUSE-ANALYSIS-2025-11-17.md
- ADR-001
- DEVELOPMENT-PROCESS-CHECKLISTS.md

**Result:** 95%+ documentation accuracy

---

## Monitoring & Prevention

**Pre-Session Checklist:** Prevents building duplicate features
**End-of-Session Checklist:** Ensures documentation stays current
**Module Registry:** Single source of truth for what exists
**Port Registry:** Automated conflict detection

**See:** docs/DEVELOPMENT-PROCESS-CHECKLISTS.md

---

**Last Updated:** 2025-11-17
**Review Next:** Weekly during development sprints
**Owner:** Development Team
