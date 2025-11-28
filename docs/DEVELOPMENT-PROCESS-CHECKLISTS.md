# Development Process Checklists

**Purpose:** Prevent architectural divergence and documentation drift
**Created:** 2025-11-17
**Related:** Root Cause Analysis, Phase 3 Structural Solution

---

## Pre-Session Checklist

Run this checklist **BEFORE starting any new feature or module**.

### 1. Review Context (5 min)

- [ ] Read previous session handover document
- [ ] Check git log for recent changes: `git log --oneline -20`
- [ ] Review current branch status: `git status`

### 2. Check for Existing Solutions (10 min)

**CRITICAL: Don't build what already exists!**

- [ ] Search Module Registry: `grep -i "<feature_keyword>" docs/MODULE-REGISTRY.md`
- [ ] Search codebase: `grep -ri "<feature_keyword>" packages/`
- [ ] Check if Module 10 (i18n) can be used for translations
- [ ] Check if shared packages exist (seo, menu-template, etc.)

**Example:** Before building i18n, search for "translation", "i18n", "language"

### 3. Port Availability (2 min)

**If creating new backend service:**

- [ ] Check PORT-REGISTRY.json for available ports
- [ ] Use core range (3000-3013) ONLY for core platform modules
- [ ] Use vertical range (3020+) for business verticals
- [ ] Update PORT-REGISTRY.json immediately after assignment

### 4. Language Requirements (2 min)

**If feature involves UI text:**

- [ ] Check official platform languages: VN, KO, CN, EN (Master Plan line 22)
- [ ] Decide: Use Module 10 or vertical-specific i18n?
- [ ] If vertical-specific, document reason in ADR

### 5. Architecture Alignment (5 min)

- [ ] Review current architecture in Master Plan
- [ ] Check if your feature fits integrated platform or standalone vertical
- [ ] If uncertain, ask user for clarification
- [ ] Document decision if significant

### 6. Dependencies Check (3 min)

- [ ] Does this feature need auth? → Check Module 12
- [ ] Does this need analytics? → Check Module 2
- [ ] Does this need multi-venue? → Check Module 3
- [ ] Does this need SEO? → Check packages/shared/seo/

---

## During Development Checklist

### 1. Naming Conventions

- [ ] Modules: kebab-case (qr-engine, multi-venue)
- [ ] Files: camelCase.ts or kebab-case.tsx
- [ ] Ports: Document in comments why chosen

### 2. Documentation

- [ ] Add README.md for new modules
- [ ] Update existing README if modifying module
- [ ] Add code comments for complex logic
- [ ] Document API endpoints

### 3. Testing

- [ ] Write unit tests for critical logic
- [ ] Manual testing before committing
- [ ] Check for port conflicts (lsof -i :PORT)

### 4. Context Window Management (IMPORTANT)

**Best Practice:** Keep context window clean for optimal Claude Code performance

**During Long Sessions (Every 30-60 minutes):**

- [ ] **Run `/clear`** - Clear irrelevant context (old file reads, stale outputs)
  - Use after completing each major task
  - Preserves important recent work
  - Prevents context window pollution
  - **Make this muscle memory!**

- [ ] **Run `/context`** - Monitor token usage
  - Check how much of 200k context window is used
  - Baseline: ~20k tokens (10%) for monorepo fresh session
  - Remaining: ~180k for making changes
  - If >150k tokens used, consider /clear

**Signs You Need /clear:**
- Responses becoming slower
- Irrelevant information appearing in responses
- Old file contents being referenced
- Stale error logs mentioned

**Example Workflow:**
```
1. Complete feature A → /clear
2. Work on feature B (30-60 min) → /context (check usage)
3. Complete feature B → /clear
4. Work on feature C...
```

**What /clear Does:**
- ✅ Removes old tool call results
- ✅ Clears stale file reads
- ✅ Removes irrelevant command outputs
- ❌ Does NOT clear project knowledge (CLAUDE.md auto-loads)
- ❌ Does NOT clear recent work context

**What /context Shows:**
```
Context Window Usage:
- Total: 200,000 tokens
- Used: 45,000 tokens (22.5%)
- Remaining: 155,000 tokens (77.5%)

Top Contributors:
- File reads: 25,000 tokens
- Command outputs: 15,000 tokens
- Conversation: 5,000 tokens
```

---

## End-of-Session Checklist

Run this checklist **AFTER completing work, BEFORE ending session**.

### 1. Code Review (Self) (5 min)

- [ ] Review all changes: `git diff`
- [ ] Remove debug code, console.logs
- [ ] Check for hardcoded values (move to .env)
- [ ] Ensure no secrets committed

### 2. Documentation Updates (10-15 min)

**MANDATORY:**

- [ ] Create handover document in `docs/handovers/YYYY-MM-DD-<topic>.md`
- [ ] Update Module Registry if added/modified module
- [ ] Update Port Registry if assigned new port
- [ ] Update Master Plan if architecture changed
- [ ] Create ADR if significant decision made

**Handover Template:**
```markdown
# Session Handover - <Topic>

**Date:** YYYY-MM-DD
**Duration:** X hours
**Status:** ✅ Complete / 🔄 In Progress

## What Was Completed
- Feature 1
- Feature 2

## Files Modified/Created
- path/to/file.ts

## Known Issues
- Issue 1

## Next Steps
- Task 1
- Task 2
```

### 3. Compatibility Check (5 min)

**Did your changes:**

- [ ] Create port conflicts? → Update PORT-REGISTRY.json
- [ ] Add new language? → Document in i18n strategy
- [ ] Duplicate existing code? → Consider refactoring or note for future
- [ ] Break existing features? → Test affected modules

### 4. Git Commit (5 min)

- [ ] Stage relevant files: `git add <files>`
- [ ] Write clear commit message following convention:
  ```
  type(scope): description

  - Detail 1
  - Detail 2

  Generated with Claude Code
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- [ ] Push to remote: `git push origin main`

### 5. Communication (2 min)

**If discovered issues:**

- [ ] List incompatibilities in handover
- [ ] Tag decisions needed from user
- [ ] Highlight blockers

**If architectural change:**

- [ ] Create ADR documenting decision
- [ ] Update Master Plan
- [ ] Notify in handover

---

## Master Plan Update Checklist

**When to update Master Plan:**

- ✅ New module added
- ✅ Architecture changed (integrated ↔ standalone)
- ✅ Language support changed
- ✅ Major milestone completed

**What to update:**

- [ ] Module status table
- [ ] Current State section
- [ ] Supported languages list
- [ ] Port allocations
- [ ] Timeline/roadmap

---

## ADR (Architectural Decision Record) Checklist

**When to create ADR:**

- Major architectural decision
- Choosing between 2+ significant options
- Changing existing architecture
- Adding new technology/framework

**ADR Template:**
```markdown
# ADR XXX: <Title>

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** Who made decision

## Context
What is the situation?

## Decision
What did we decide?

## Rationale
Why did we decide this?

## Consequences
- Positive: +X
- Negative: -Y

## Alternatives Considered
1. Option A: Reason rejected
2. Option B: Reason rejected
```

---

## Port Assignment Process

### Before Assigning Port:

1. Check PORT-REGISTRY.json
2. Choose from appropriate range:
   - 3000-3013: Core platform modules
   - 3020-3099: Vertical business packages
   - 4000+: Test environments
3. Update PORT-REGISTRY.json
4. Update MODULE-REGISTRY.md
5. Document in code comments

### Port Conflict Resolution:

**If conflict discovered:**

1. Identify which module is core vs vertical
2. Keep core module on original port
3. Move vertical to 3020+ range
4. Update both registries
5. Update .env files
6. Test after change

---

## i18n Strategy Decision Tree

```
Need translations?
  ├─ YES → Building core platform module?
  │         ├─ YES → Use Module 10 (VN/KO/CN/EN)
  │         └─ NO → Building vertical package?
  │                 ├─ Market needs Module 10 languages? → Use Module 10
  │                 └─ Market needs different languages? → Vertical-specific i18n
  │                                                         (Document in ADR)
  └─ NO → Continue without i18n
```

---

## Quick Reference Commands

### Search for existing solutions:
```bash
grep -i "keyword" docs/MODULE-REGISTRY.md
grep -ri "keyword" packages/
```

### Check port availability:
```bash
lsof -i :3004  # Check if port in use
cat docs/PORT-REGISTRY.json | grep "3004"
```

### Update documentation:
```bash
# After adding module, update both:
vim docs/MODULE-REGISTRY.md
vim docs/PORT-REGISTRY.json
```

### Checklist before committing:
```bash
git status
git diff
# Review changes, then:
git add <files>
git commit -m "type(scope): description"
git push origin main
```

---

## Session Handover Best Practices

### DO:
- ✅ Document what was built
- ✅ List files created/modified
- ✅ Explain decisions made
- ✅ List next steps clearly
- ✅ Mention blockers or questions

### DON'T:
- ❌ Skip handover ("too tired")
- ❌ Only list features without files
- ❌ Forget to mention port/language choices
- ❌ Leave decisions undocumented

---

## Enforcement

**These checklists are MANDATORY for:**

- Creating new modules
- Making architectural changes
- Adding new languages
- Assigning ports
- Ending development sessions

**Optional but recommended for:**

- Small bug fixes
- Documentation-only changes
- Minor UI tweaks

---

## Examples

### Good Pre-Session:
```
✅ Checked MODULE-REGISTRY.md - no existing auth system for verticals
✅ Checked PORT-REGISTRY.json - 3021 available
✅ Module 10 exists but we need vertical-specific i18n (IT not supported)
→ Proceed with vertical-specific, document in ADR
```

### Bad Pre-Session:
```
❌ Started building i18n without checking
❌ Assigned port 3004 without checking conflicts
❌ Didn't search for existing solutions
→ Result: Duplicate code, port conflict
```

### Good End-of-Session:
```
✅ Created handover document
✅ Updated MODULE-REGISTRY.md with new vertical
✅ Updated PORT-REGISTRY.json with port 3021
✅ Created ADR for language choice
✅ Pushed commits to main
```

### Bad End-of-Session:
```
❌ No handover created
❌ Registries not updated
❌ Language choice not documented
❌ Next session confused about ports
```

---

## Automation (Future)

**Planned improvements:**

- [ ] Pre-commit hook checking documentation updates
- [ ] Script to validate PORT-REGISTRY.json vs actual code
- [ ] GitHub Actions to enforce checklist compliance
- [ ] Automated handover template generation

---

**Last Updated:** 2025-11-17
**Owner:** Development team
**Review Frequency:** After every major incident or architecture change
