# i18n Migration Roadmap - Module 10 Integration

**Status:** Planned (Migration trigger: When adding next language)
**Estimated Effort:** 20-30 hours total
**Priority:** Medium (High when adding 5th language or 5th vertical)
**Decision Date:** 2025-11-17

---

## Executive Summary

**Current State:** Each vertical package (Coffeeshop, Rentals, Wellness) has its own duplicate i18n system.

**Target State:** All verticals use Module 10 (centralized i18n service) for translations.

**Why Migrate:**
- **Scalability:** Add 1 language → automatically available in all verticals (30 min vs 4+ hours)
- **Consistency:** All verticals support same languages
- **Maintenance:** Update translation once, applies everywhere
- **Cost Reduction:** ~359 lines of duplicate code eliminated per vertical

**When to Migrate:**
- ✅ When adding Spanish, French, German, or other new language
- ✅ When reaching 5+ vertical packages
- ✅ When enterprise customer requests consistent multi-language

---

## Current i18n Systems Inventory

### Module 10 (Centralized - EXISTS BUT UNUSED)

| Property | Value |
|----------|-------|
| **Location** | `packages/i18n/` |
| **Port** | 3010 |
| **Languages** | VN, KO, CN, EN (official platform languages) |
| **Status** | ✅ Production Ready, UNUSED by verticals |
| **Storage** | PostgreSQL JSONB |
| **API** | `/api/i18n/:lang`, `/api/i18n/translate` |
| **Features** | 4-language support, currency conversion, auto-detection |

### Coffeeshop (Duplicate System)

| Property | Value |
|----------|-------|
| **Location** | `packages/coffeeshop/frontend/lib/translations.ts` |
| **Languages** | EN, VI, IT |
| **Lines of Code** | 359 lines |
| **Storage** | JavaScript object (static) |
| **Features** | React hook, localStorage persistence, event-based updates |

### Rentals (To Be Determined)

| Property | Value |
|----------|-------|
| **Location** | TBD (not yet implemented) |
| **Languages** | TBD |
| **Status** | 🔄 Needs i18n system |

### Wellness (To Be Determined)

| Property | Value |
|----------|-------|
| **Location** | TBD (not yet implemented) |
| **Languages** | TBD |
| **Status** | 🔄 Needs i18n system |

---

## Migration Strategy: Hybrid Approach

### Keep What Works

✅ **Standalone vertical architecture** (deployment independence)
✅ **Fast time-to-market** for new verticals
✅ **SEO infrastructure sharing** (packages/shared/seo/)

### Centralize What Scales

✅ **Translations via Module 10** (multi-language scalability)
✅ **Common utilities** (currency conversion, date formatting)
✅ **Language preferences** (user settings)

---

## Migration Phases

### Phase 1: Extend Module 10 (2-3 hours)

**Goal:** Add missing languages to Module 10

**Tasks:**
1. Add Italian (IT) language to Module 10:
   ```bash
   cd packages/i18n/backend/locales
   cp en.json it.json
   # Translate strings or copy from coffeeshop
   ```

2. Add Spanish (ES), French (FR), German (DE) if needed:
   ```bash
   cp en.json es.json
   cp en.json fr.json
   cp en.json de.json
   ```

3. Update Module 10 API to support new languages

4. Test Module 10 with all languages:
   ```bash
   curl http://localhost:3010/api/i18n/it
   curl http://localhost:3010/api/i18n/es
   ```

**Deliverable:** Module 10 supports all current + future languages

---

### Phase 2: Create i18n Client Library (4-6 hours)

**Goal:** Reusable React hook for verticals to consume Module 10

**File:** `packages/shared/i18n-client/use-module10-translation.ts`

```typescript
// Example structure
import { useState, useEffect } from 'react';

export function useModule10Translation(vertical: string, defaultLang: Language) {
  const [t, setT] = useState({});
  const [language, setLanguage] = useState(defaultLang);

  useEffect(() => {
    // Fetch from Module 10 API
    fetch(`http://localhost:3010/api/i18n/${language}?vertical=${vertical}`)
      .then(res => res.json())
      .then(translations => setT(translations));
  }, [language, vertical]);

  return { t, language, setLanguage };
}
```

**Features:**
- Fetches from Module 10 API
- Caches in localStorage
- Event-based sync across tabs
- Fallback to default language
- Replace placeholder function

**Deliverable:** Shared React hook package ready for use

---

### Phase 3: Migrate Coffeeshop (6-8 hours)

**Goal:** Replace coffeeshop's local i18n with Module 10 client

**Tasks:**

1. **Install shared package:**
   ```bash
   cd packages/coffeeshop/frontend
   npm install @gudbro/i18n-client
   ```

2. **Migrate translations from coffeeshop to Module 10:**
   ```bash
   # Extract coffeeshop translations
   node scripts/extract-coffeeshop-translations.js > coffeeshop.json

   # Import to Module 10 database
   node packages/i18n/scripts/import-translations.js coffeeshop.json
   ```

3. **Update coffeeshop code:**
   ```typescript
   // BEFORE:
   import { useTranslation } from '../lib/use-translation';

   // AFTER:
   import { useModule10Translation } from '@gudbro/i18n-client';
   const { t, language, setLanguage } = useModule10Translation('coffeeshop', 'en');
   ```

4. **Remove local i18n files:**
   ```bash
   rm packages/coffeeshop/frontend/lib/translations.ts  # 359 lines deleted!
   rm packages/coffeeshop/frontend/lib/use-translation.ts
   ```

5. **Test all pages:**
   - Homepage (/app/page.tsx)
   - Menu (/app/menu/page.tsx)
   - Language selector
   - All translations working

6. **Deploy and verify:**
   - Test EN, VI, IT all working
   - Verify localStorage persistence
   - Check network tab for Module 10 calls

**Deliverable:** Coffeeshop using Module 10, 359 lines removed

---

### Phase 4: Migrate Rentals (4-6 hours)

**Goal:** Set up Rentals i18n using Module 10 from start

**Tasks:**

1. Install i18n client package
2. Add Rentals translations to Module 10 database
3. Use `useModule10Translation('rentals', 'en')` in components
4. Choose languages: EN, VN, KO (targeting Vietnam + Korea markets)
5. Test and deploy

**Deliverable:** Rentals using Module 10, no duplicate code

---

### Phase 5: Migrate Wellness (4-6 hours)

**Goal:** Set up Wellness i18n using Module 10 from start

**Tasks:**

1. Install i18n client package
2. Add Wellness translations to Module 10 database (spa/massage terminology)
3. Use `useModule10Translation('wellness', 'en')` in components
4. Choose languages: EN, VN, TH (targeting Thailand spa market)
5. Test and deploy

**Deliverable:** Wellness using Module 10, no duplicate code

---

## Migration Timeline

### Immediate (When adding next language)

**Weeks 1-2:**
- Phase 1: Extend Module 10 (add ES, IT, or other needed language)
- Phase 2: Create i18n client library

**Weeks 3-4:**
- Phase 3: Migrate Coffeeshop

**Total:** 1 month for first vertical

### Gradual (For remaining verticals)

**Option A: Migrate all at once (recommended)**
- Phases 4-5: 2-3 weeks
- All verticals standardized quickly

**Option B: Migrate on-demand**
- Migrate each vertical when touching i18n code
- Lower immediate effort, longer total time

---

## Benefits After Migration

### Scalability Example

**Adding Spanish (ES):**

**Before Migration (Current State):**
```
1. Add ES to coffeeshop/lib/translations.ts  → 2 hours
2. Add ES to rentals/lib/translations.ts     → 2 hours
3. Add ES to wellness/lib/translations.ts    → 2 hours
4. Add ES to future vertical #4              → 2 hours
5. Add ES to future vertical #5              → 2 hours
---
Total: 10 hours
```

**After Migration (Module 10):**
```
1. Add ES to Module 10: packages/i18n/backend/locales/es.json → 30 min
2. Restart Module 10 service                                   → 1 min
3. All verticals automatically see ES in language selector     → 0 min
---
Total: 31 minutes
```

**Time Saved:** 9.5 hours per language × N future languages

---

## Technical Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Vertical Packages (Standalone Next.js Apps)   │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Coffeeshop│  │ Rentals  │  │ Wellness │      │
│  │  :3020   │  │  :3021   │  │  :3023   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │
│       └─────────────┴─────────────┘             │
│                     │                           │
│                     ▼                           │
│         ┌───────────────────────┐               │
│         │  @gudbro/i18n-client  │               │
│         │   (Shared Package)    │               │
│         └───────────┬───────────┘               │
│                     │                           │
└─────────────────────┼───────────────────────────┘
                      │
                      ▼ HTTP API Calls
         ┌────────────────────────┐
         │     Module 10 (i18n)   │
         │       Port 3010        │
         ├────────────────────────┤
         │  Languages: VN/KO/CN/  │
         │  EN/IT/ES/FR/DE...     │
         ├────────────────────────┤
         │   PostgreSQL JSONB     │
         │  (Translations DB)     │
         └────────────────────────┘
```

### API Flow

1. User selects language in vertical UI
2. `useModule10Translation()` hook called
3. Checks localStorage cache first
4. If miss, fetches from Module 10: `GET /api/i18n/:lang?vertical=coffeeshop`
5. Module 10 returns translations JSON
6. Hook caches in localStorage
7. Hook provides `t` object to components
8. Components render: `{t.menu.title}`

---

## Rollback Plan

**If migration fails:**

1. Keep old `lib/translations.ts` files in git history
2. Revert package.json to remove `@gudbro/i18n-client`
3. Restore import statements
4. Redeploy

**Risk:** Low (migration is per-vertical, can rollback individually)

---

## Testing Checklist

### Unit Tests

- [ ] Module 10 API returns correct translations
- [ ] `useModule10Translation` hook fetches correctly
- [ ] Fallback to default language works
- [ ] Placeholder replacement works

### Integration Tests

- [ ] All vertical pages render in all languages
- [ ] Language selector changes UI language
- [ ] localStorage persists selection
- [ ] Multi-tab sync works

### Performance Tests

- [ ] Module 10 API response time < 50ms
- [ ] Client-side cache prevents redundant calls
- [ ] No flickering during language switch

---

## Dependencies

### Required Before Migration

- [ ] Module 10 is running and stable (Port 3010)
- [ ] PostgreSQL database accessible
- [ ] All translations from coffeeshop extracted

### Required During Migration

- [ ] Test environment for each vertical
- [ ] Ability to rollback if needed
- [ ] User acceptance testing

---

## Cost-Benefit Analysis

### One-Time Migration Cost

- **Effort:** 20-30 hours (developer time)
- **Risk:** Low (incremental, per-vertical)
- **Complexity:** Medium (React hooks, API integration)

### Ongoing Benefits

- **Time Saved per Language:** 9.5 hours
- **Maintenance Reduction:** 60% (one system vs three)
- **Code Duplication Eliminated:** 359 lines × 3 verticals = 1,077 lines
- **Consistency:** All verticals speak same languages
- **Scalability:** Unlimited languages, unlimited verticals

**Break-Even Point:** After adding 2-3 new languages OR 2-3 new verticals

---

## Decision Point: When to Trigger Migration

### Trigger Conditions (Any of these)

✅ **User requests new language** (ES, FR, DE, etc.)
✅ **5th vertical package created**
✅ **Enterprise customer** requires multi-language consistency
✅ **Code duplication pain** becomes severe

### Don't Migrate If:

- Only 1-2 verticals exist
- No plans to add more languages
- Verticals target completely different markets with different languages

---

## Current Recommendation

**Status:** ✅ **WAIT for natural trigger**

**Rationale:**
- Current duplicate code (359 lines) is manageable
- Only 1 vertical (Coffeeshop) has full i18n implemented
- Benefit doesn't outweigh cost yet

**Recommended Trigger:** When you add **Spanish (ES)** or **5th vertical**, begin migration

**Preparation:** Use Phase 1 (Extend Module 10) to add IT now, so it's ready when trigger occurs

---

**Last Updated:** 2025-11-17
**Owner:** Development team + Product owner
**Next Review:** When adding next language or 5th vertical
