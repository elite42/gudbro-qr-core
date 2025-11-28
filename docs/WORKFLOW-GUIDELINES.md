# WORKFLOW GUIDELINES

**Version:** 1.1
**Last Updated:** 2025-11-04  
**Purpose:** How to work with Claude (Web + Code) on Gudbro platform  
**Maintained by:** Project team

---

## 📚 Table of Contents

1. [Philosophy](#philosophy)
2. [Tools & Roles](#tools--roles)
3. [File Structure](#file-structure)
4. [Naming Conventions](#naming-conventions)
5. [Handoff Protocol](#handoff-protocol)
6. [Session Handovers](#session-handovers) ⭐ NEW
7. [Commit Standards](#commit-standards)
8. [Interaction Rules](#interaction-rules)
9. [Session Templates](#session-templates)
10. [Decision Framework](#decision-framework)
11. [Emergency Protocol](#emergency-protocol)
12. [Quality Checklist](#quality-checklist)
13. [Claude Web Project Setup](#claude-web-project-setup)

---

## Philosophy

### Core Principles

1. **Single Source of Truth**  
   → `GUDBRO-MASTER-PLAN.md` is the authoritative reference for project state, priorities, and decisions

2. **Separation of Concerns**  
   → Planning happens on Claude Web (strategic thinking)  
   → Implementation happens on Claude Code (tactical execution)

3. **Documentation First**  
   → Requirements written and reviewed before code is written  
   → No feature starts without clear acceptance criteria

4. **Frequent Commits**  
   → Small, atomic commits with clear messages  
   → Every completed phase = commit  
   → Master Plan updated after major milestones

5. **Version Control = History**  
   → Git log should tell the story of the project  
   → Commit messages are documentation

---

## Tools & Roles

### Claude Web (Strategic Planning)

**Best for:**
- ✅ Brainstorming new features
- ✅ Writing requirements documents
- ✅ Architectural discussions
- ✅ Business decisions and strategy
- ✅ Long-form planning sessions
- ✅ Reviewing and refining documentation

**Characteristics:**
- No time pressure (can take hours to think)
- Projects feature = persistent context
- Great for iterative refinement
- Better for "why" and "what" questions

**Typical Output:**
- Requirements documents (`.md` files)
- Architecture diagrams
- Decision rationales
- Strategic plans

---

### Claude Code (Tactical Implementation)

**Best for:**
- ✅ Reading and implementing requirements
- ✅ Writing code, tests, configurations
- ✅ Debugging and fixing issues
- ✅ Git operations (commit, push, branch)
- ✅ Running and testing services
- ✅ Updating Master Plan with progress

**Characteristics:**
- Direct access to codebase
- Can run commands and tests
- Time-bounded sessions
- Better for "how" questions

**Typical Output:**
- Code files
- Tests
- Git commits
- Updated documentation
- Database migrations

---

## File Structure

```
qr-platform-complete/
├── docs/
│   ├── GUDBRO-MASTER-PLAN.md          ← Source of truth
│   ├── WORKFLOW-GUIDELINES.md         ← This document
│   ├── handovers/                     ← Session handover docs
│   │   ├── TEMPLATE.md                ← Template for handovers
│   │   └── YYYY-MM-DD-session-N.md    ← Session-specific handovers
│   ├── QRMENU-REQUIREMENTS.md         ← Feature requirements
│   ├── QR-ENGINE-DEVELOPMENT-BRIEF.md ← QR Engine specs
│   ├── CUSTOMER-ENGAGEMENT-PLATFORM.md ← Long-term vision
│   └── [FEATURE]-REQUIREMENTS.md      ← Additional features
├── packages/
│   ├── qr-engine/
│   ├── menu/
│   └── [other services]/
└── shared/
    └── database/
        └── migrations/
```

### Document Types

| Type | Pattern | Purpose |
|------|---------|---------|
| Master Plan | `GUDBRO-MASTER-PLAN.md` | Project vision, priorities, decisions |
| Session Handover | `handovers/YYYY-MM-DD-session-N.md` | Session work summary, prevent context loss |
| Requirements | `[PRODUCT]-REQUIREMENTS.md` | Feature specifications |
| Development Brief | `[PRODUCT]-DEVELOPMENT-BRIEF.md` | Technical implementation guide |
| Handoff | `[FEATURE]-HANDOFF.md` | Optional transition from Web to Code |
| Workflow | `WORKFLOW-GUIDELINES.md` | This document |

---

## Naming Conventions

### Documents

**Pattern:** `[SCOPE]-[TYPE].md`

**Examples:**
- `QRMENU-REQUIREMENTS.md` (product requirements)
- `FEEDBACK-SYSTEM-REQUIREMENTS.md` (feature requirements)
- `QR-ENGINE-DEVELOPMENT-BRIEF.md` (technical specs)
- `MULTI-VENUE-HANDOFF.md` (implementation handoff)

**Rules:**
- ALL CAPS for scope (consistency with Master Plan)
- Kebab-case for multi-word scopes
- Type can be plural (REQUIREMENTS) ✓

### Git Branches

**Pattern:** `[type]/[description]`

**Types:**
- `feature/` - New feature development
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions
- `refactor/` - Code refactoring

**Examples:**
- `feature/multi-venue-management`
- `fix/qr-artistic-timeout`
- `docs/update-master-plan`

---

## Handoff Protocol

### When to Use Handoff Documents

**Required:**
- Complex features (>3 phases)
- Features with multiple unknowns
- When you need to pause and resume later

**Optional:**
- Simple features (<2 days work)
- Hotfixes
- Documentation updates

### Handoff Document Template

```markdown
# [FEATURE] - Handoff to Implementation

**Status:** Ready for implementation  
**Planned by:** Claude Web Project "[project name]"  
**Date:** YYYY-MM-DD  
**Estimated Effort:** X days

---

## What's Ready

- ✅ Requirements documented in `[FILE].md`
- ✅ Database schema designed
- ✅ API endpoints specified
- ✅ Frontend mockups described
- ✅ Dependencies mapped

---

## Implementation Phases

### Phase 1: [Name] (Xh)
- Task 1
- Task 2
- Deliverable: [what's done]

### Phase 2: [Name] (Xh)
- Task 1
- Task 2
- Deliverable: [what's done]

[... more phases ...]

---

## Entry Point for Claude Code

Read `docs/[FILE].md` [section X].

Start with Phase 1: [description]

---

## Known Challenges

- Challenge 1: [description + mitigation]
- Challenge 2: [description + mitigation]

---

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests passing
- [ ] Master Plan updated
```

---

## Session Handovers

### Purpose

Session handovers prevent context loss between sessions. When Claude Code runs out of context or a session ends, the handover document ensures the next session can resume seamlessly.

### When to Create Handovers

**Always create a handover at the end of every session:**
- ✅ Major features completed
- ✅ Long sessions (>2 hours)
- ✅ Session ended due to context limits
- ✅ Before switching to different work
- ✅ When discoveries were made (forms already existed, etc.)

### Handover Document Structure

Use the template at `docs/handovers/TEMPLATE.md`

**Key sections:**
1. **Session metadata** - Date, duration, focus, model used
2. **Objectives** - What was planned vs what was completed
3. **What was completed** - Detailed list with code snippets
4. **Known issues** - Problems to address later
5. **Code changes** - All modified files
6. **Next session recommendations** - What to work on next
7. **Lessons learned** - Process improvements discovered

### Naming Convention

**Pattern:** `YYYY-MM-DD-session-N.md`

**Examples:**
- `2025-11-04-session-4.md` (4th session on Nov 4)
- `2025-11-05-session-1.md` (1st session on Nov 5)

**Location:** `docs/handovers/`

### At Start of Each Session

**New workflow (CRITICAL):**
```
1. Read Master Plan
2. Read latest handover doc (docs/handovers/)
3. Quick codebase scan if needed (ls relevant dirs)
4. Ask user about recent changes if unclear
5. Proceed with work
```

**Old workflow (DON'T do this):**
```
❌ 1. Read Master Plan
❌ 2. Start working immediately
   Problem: May not know what was completed in previous sessions
```

### Example Start-of-Session Prompt

```
Read Master Plan.
Read docs/handovers/2025-11-04-session-4.md

Context from handover:
- VietQR form enhanced with searchable bank selector
- All 19 QR forms verified and working
- Changes uncommitted

Today's task:
[Your task here]

Start now.
```

### Creating Handover at End of Session

**When to do it:**
- Session reaching context limits
- Completed a major milestone
- About to switch tasks
- End of work day

**How to do it:**
1. Use `docs/handovers/TEMPLATE.md` as starting point
2. Document everything completed in the session
3. Include code snippets for complex implementations
4. List all modified files
5. Note commit status (committed or uncommitted)
6. Recommend next steps
7. Save as `docs/handovers/YYYY-MM-DD-session-N.md`

### Benefits

**Prevents:**
- ❌ Not knowing forms already exist
- ❌ Duplicate work
- ❌ Lost context between sessions
- ❌ Forgetting uncommitted changes
- ❌ Unclear next steps

**Enables:**
- ✅ Seamless session continuity
- ✅ Clear progress tracking
- ✅ Better collaboration
- ✅ Knowledge preservation
- ✅ Faster onboarding for new sessions

---

## Commit Standards

### Commit Message Format

```
[type]: [short description]

[optional body with more details]

[optional footer with references]
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature or enhancement | `feat: Multi-venue management Phase 1-3` |
| `fix` | Bug fix | `fix: QR artistic generation timeout` |
| `docs` | Documentation changes | `docs: Update Master Plan with progress` |
| `test` | Adding or updating tests | `test: Add integration tests for webhooks` |
| `refactor` | Code refactoring | `refactor: Simplify QR generation logic` |
| `style` | Code style/formatting | `style: Format with Prettier` |
| `chore` | Maintenance tasks | `chore: Update dependencies` |
| `perf` | Performance improvements | `perf: Cache QR generation results` |

### Examples

**Good commits:**
```
feat: WiFi QR generation
- Implement WIFI:T:WPA format parser
- Add encryption type validation
- Test with real devices (iOS/Android)

fix: Dynamic QR expiration check
- Fix timezone issue in expiration logic
- Add test for edge cases

docs: Update Master Plan - Multi-venue complete
- Mark Phase 1-3 as complete
- Update Decisions Log with commit hash
- Add Phase 4 to Immediate Next Steps
```

**Bad commits:**
```
✗ "update stuff"
✗ "fix bug"
✗ "wip"
✗ "asdfasdf"
```

---

## Interaction Rules

### Working with Claude Code (DO's) ✅

1. **Always provide context**
   ```
   Read Master Plan. 
   
   Context:
   - [What we're building]
   - Requirements: docs/[FILE].md [section]
   
   Task:
   [Specific action]
   
   Start now.
   ```

2. **Be specific about entry points**
   - Don't say: "Build the feedback system"
   - Do say: "Read docs/QRMENU-REQUIREMENTS.md [section 2]. Implement Phase 1: Database schema."

3. **Request Master Plan updates**
   - After completing major milestones
   - "Update Master Plan with today's progress before commit"

4. **Use todo lists for complex tasks**
   - Claude Code maintains them automatically
   - You can see real-time progress

5. **Commit frequently**
   - Each completed phase = commit
   - Don't wait to finish everything

6. **Approve plans explicitly**
   - When Claude Code proposes implementation plan
   - Say "approved" or "ok proceed" or "start"
   - Otherwise Claude waits for confirmation

7. **Reference documents precisely**
   - Good: "docs/QRMENU-REQUIREMENTS.md section 1"
   - Bad: "the requirements file"

### Working with Claude Code (DON'Ts) ❌

1. **Don't ask for complex brainstorming**
   - Claude Web is better for this
   - Give Claude Code ready requirements

2. **Don't ask to write requirements from scratch**
   - Claude Code can refine/clarify
   - Initial planning better on Web (more time)

3. **Don't work on multiple features in parallel**
   - Focus on 1 feature at a time
   - Finish → Commit → Next

4. **Don't forget to say "approved"**
   - Claude Code waits for confirmation after proposals
   - Be explicit when plan is good

5. **Don't skip Master Plan reads**
   - Even if you think Claude Code knows context
   - Always start with "Read Master Plan"

6. **Don't commit without testing**
   - Run tests first
   - Verify services start correctly

---

## Session Templates

### Template 1: Starting New Feature

```
Read Master Plan.
Read docs/handovers/[latest-handover].md

Context:
- [Feature name] requirements finalized with Claude Web
- Requirements: docs/[FILE].md [section X]
- Dependencies: [list any]

Task:
Implement Phase 1: [description]

Start now.
```

**Example:**
```
Read Master Plan.
Read docs/handovers/2025-11-04-session-4.md

Context:
- Feedback System requirements finalized with Claude Web
- Requirements: docs/QRMENU-REQUIREMENTS.md [section 2]
- Dependencies: Multi-venue management (already done)

Task:
Implement Phase 1: Database schema for feedback collection

Start now.
```

---

### Template 2: Continuing Work

```
Read Master Plan.
Read docs/handovers/[latest-handover].md

Status: Phase X of [Feature] in progress

Next:
Implement Phase Y: [description]

Continue.
```

---

### Template 3: Bug Fix

```
Read Master Plan.

Bug:
[Description of issue]

Expected behavior:
[What should happen]

Actual behavior:
[What's happening]

Fix this issue.
```

---

### Template 4: Testing Request

```
Read Master Plan.

Feature: [name]
Status: Implementation complete

Task:
Write integration tests for [specific functionality]

Requirements:
- Test coverage: [X]%
- Edge cases: [list]

Start testing.
```

---

### Template 5: Master Plan Update

```
Read Master Plan.

Task:
Update Master Plan with following changes:
- [Change 1]
- [Change 2]

Then commit.
```

---

## Decision Framework

### When to Use Claude Web

Ask yourself: "Am I deciding **WHAT** or **WHY**?"

**Use Claude Web for:**
- ❓ "Should we build this feature?" (strategy)
- 🎨 "How should the architecture look?" (design)
- 📝 "What are the requirements for X?" (planning)
- 💰 "What's the business impact?" (analysis)
- 🤔 "Is this approach better than that?" (evaluation)
- 📊 "How do competitors solve this?" (research)
- 🎯 "What's the MVP scope?" (prioritization)

**Process:**
1. Open Claude Web project
2. Reference Master Plan and relevant docs
3. Brainstorm and refine
4. Output: Requirements document
5. Save to `/docs/`

---

### When to Use Claude Code

Ask yourself: "Am I executing **HOW**?"

**Use Claude Code for:**
- ⚡ "Implement feature X following requirements" (coding)
- 🐛 "Debug this error" (troubleshooting)
- 🧪 "Add tests for Y" (testing)
- 📦 "Deploy service Z" (operations)
- 🔧 "Refactor component A" (maintenance)
- 📝 "Update Master Plan with progress" (documentation)
- 🚀 "Run migration script" (execution)

**Process:**
1. Start with context (read Master Plan)
2. Reference specific requirements
3. Claude Code implements
4. Test and commit
5. Update Master Plan if milestone

---

## Emergency Protocol

### If Implementation Diverges from Plan

**Symptoms:**
- Requirements don't match reality
- Architecture doesn't work as expected
- Dependencies discovered that weren't planned
- Original approach is blocked

**Action:**
1. ⏸️ **STOP implementation** (don't force it)
2. 📝 **Document why** (in code comments or GitHub issue)
   ```javascript
   // TODO: Original plan was to use Redis for caching,
   // but we discovered Redis doesn't support this query pattern.
   // Need to revise requirements with Claude Web.
   ```
3. 🔙 **Go back to Claude Web** to revise requirements
4. ✏️ **Update requirements doc** with new approach
5. ▶️ **Resume with Claude Code** following updated plan
6. 📋 **Add to Decisions Log** in Master Plan

---

### If Master Plan is Out of Sync

**Symptoms:**
- Master Plan says "Phase 1 done" but code shows otherwise
- Decisions Log missing recent changes
- Priorities don't match actual work

**Action:**
1. 🔍 **Run comparison**
   ```bash
   git diff HEAD~5 docs/GUDBRO-MASTER-PLAN.md
   ```
2. 📊 **Manually reconcile** differences
   - What's actually done?
   - What's documented as done?
3. ✅ **Commit corrected version**
   ```bash
   git commit -m "docs: Sync Master Plan with actual state"
   ```
4. 📝 **Add note in Decisions Log**
   ```markdown
   ### 2025-11-02
   - ⚠️ Master Plan was out of sync
   - Corrected: [what was wrong]
   - Actual state: [current reality]
   ```

---

### If Requirements are Unclear During Implementation

**Symptoms:**
- Claude Code asks questions about ambiguous requirements
- Multiple valid interpretations exist
- Edge cases not covered in requirements

**Action:**
1. 🛑 **Pause implementation**
2. 📝 **List specific questions**
   - What's ambiguous?
   - What edge cases need decisions?
3. 🔙 **Ask Claude Web for clarification**
   - Provide context from implementation attempt
   - Reference specific requirement sections
4. ✏️ **Update requirements** with answers
5. ▶️ **Resume implementation** with clarity

**DO NOT:**
- ❌ Guess and implement (creates tech debt)
- ❌ Skip the ambiguous part (creates holes)
- ❌ Ask Claude Code to decide (not its role)

---

## Quality Checklist

### Before Closing a Feature

Use this checklist before marking a feature as "Done":

#### Code Quality
- [ ] Feature implemented according to requirements
- [ ] All acceptance criteria met
- [ ] Code follows project style/conventions
- [ ] No commented-out code (unless documented reason)
- [ ] No `console.log` or debug statements
- [ ] Error handling implemented
- [ ] Input validation added

#### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Edge cases covered
- [ ] Test coverage >80% (if applicable)
- [ ] Manual testing completed

#### Documentation
- [ ] Code comments for complex logic
- [ ] API endpoints documented (if applicable)
- [ ] Database schema documented
- [ ] Master Plan updated with progress
- [ ] Requirements marked as complete

#### Git & Deployment
- [ ] All commits follow naming standard
- [ ] No merge conflicts
- [ ] Services start correctly
- [ ] Database migrations run successfully
- [ ] No breaking changes to other services

#### Cleanup
- [ ] TODOs either resolved or documented in backlog
- [ ] Temporary files removed
- [ ] Test data cleaned up
- [ ] Environment variables documented

---

## Claude Web Project Setup

### Creating the Planning Project

**Project Name:** "Gudbro Planning & Strategy"

**Project Description:**
```
Strategic planning and requirements for Gudbro QR platform.
Focus: brainstorming, architecture, requirements, business decisions.
```

---

### Custom Instructions

```
# Role
You are a strategic planning assistant for Gudbro QR platform.

# Your Responsibilities
- Brainstorm new features and improvements
- Refine requirements with clear acceptance criteria
- Make architectural decisions with rationale
- Evaluate business impact of features
- Plan implementation phases

# Key Constraints
- Always reference Master Plan before proposing changes
- Maintain consistency with existing architecture
- Consider Vietnam market context (pricing, languages)
- Prioritize based on Master Plan priorities (P0 > P1 > P2 > P3)

# Output Format
When planning features, structure output as:

## [FEATURE NAME]
**Priority:** P1/P2/P3
**Effort:** X days
**Dependencies:** [list]

### Problem
[What problem does this solve?]

### Solution
[High-level approach]

### Database Schema
[Tables, columns, relationships]

### API Endpoints
[REST endpoints with methods and params]

### Frontend Components
[Page/component structure]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Implementation Phases
1. Phase 1: [Name] (Xh)
2. Phase 2: [Name] (Xh)

# Handoff
After planning, provide:
1. Updated requirements markdown (ready to copy)
2. Clear entry point for Claude Code
3. Known challenges and mitigations
```

---

### Knowledge Base (Attach These Files)

**Required:**
1. `GUDBRO-MASTER-PLAN.md` ← Source of truth
2. `WORKFLOW-GUIDELINES.md` ← This document
3. `QRMENU-REQUIREMENTS.md` ← Current requirements
4. `QR-ENGINE-DEVELOPMENT-BRIEF.md` ← Technical specs
5. `CUSTOMER-ENGAGEMENT-PLATFORM.md` ← Long-term vision

**Optional (attach as needed):**
- `FEEDBACK-SYSTEM-REQUIREMENTS.md`
- `[OTHER]-REQUIREMENTS.md`
- Any handoff documents for active features

**How to Attach:**
- In project settings → Knowledge
- Upload files or paste content
- Keep updated as documents evolve

---

### Example Planning Session

**Your Prompt:**
```
I want to plan the Loyalty System feature for QR Menu.

Current context:
- QR Menu is at 90% complete
- Multi-venue management is done
- Target: increase customer retention from 10% to 30%

Read Master Plan and QRMENU-REQUIREMENTS.md [section 3].

Help me refine:
1. Should we do points-based or visit-based loyalty?
2. What's the optimal reward structure for Vietnamese market?
3. Database schema design
4. API endpoints needed
5. Implementation phases

Let's start with business model discussion.
```

**Claude Web Response:**
```
[Strategic analysis, market research, recommendations]
[Refined requirements document]
[Implementation plan]
```

**Your Action:**
1. Review and approve the plan
2. Copy refined requirements to local file
3. Commit: `git add docs/LOYALTY-SYSTEM-REQUIREMENTS.md`
4. Open Claude Code with requirements

---

## Maintenance

### Updating This Document

**When to Update:**
- New workflow patterns emerge
- Tools or processes change
- Team grows and needs onboarding
- Pain points discovered in current workflow

**How to Update:**
1. Discuss changes (in team or with Claude Web)
2. Update this document
3. Increment version number
4. Update "Last Updated" date
5. Commit: `docs: Update workflow guidelines v1.X`
6. Sync to Claude Web project knowledge

**Version History:**
- v1.1 (2025-11-04): Added Session Handovers system to prevent context loss
- v1.0 (2025-11-02): Initial version based on Claude Code recommendations

---

## Quick Reference

### Most Common Commands

**Starting new feature:**
```bash
# In Claude Code
Read Master Plan.
Read docs/handovers/[latest-handover].md
Implement [Feature] Phase 1: [description]
Requirements: docs/[FILE].md [section]
```

**Checking status:**
```bash
# In Claude Code
Read Master Plan.
What's the current status? What's next?
```

**Committing progress:**
```bash
# In Claude Code
Tests passing. Commit with message:
"feat: [Feature] Phase X - [description]"
```

**Updating Master Plan:**
```bash
# In Claude Code
Update Master Plan:
- Mark Phase X complete
- Update Decisions Log
- Update Next Steps
```

---

## Support & Questions

**If something is unclear:**
1. Check this document first
2. Ask in Claude Code: "Read WORKFLOW-GUIDELINES.md. [your question]"
3. Discuss with Claude Web for strategic clarifications
4. Update this document with answer for future reference

**If workflow isn't working:**
1. Document the pain point
2. Propose solution
3. Test for 1-2 sessions
4. Update guidelines if solution works

---

**END OF WORKFLOW GUIDELINES**

---

*This is a living document. Keep it updated as the team and project evolve.*
