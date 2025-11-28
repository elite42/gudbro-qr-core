# Memory Files - Persistent Insights

**Purpose:** Store durable facts and insights that persist across Claude Code sessions
**Usage:** Small, focused files for specific knowledge areas
**Best Practice:** Claude can read/write these files instead of re-sending info perpetually

---

## What Goes Here

**Good Candidates:**
- Architectural decisions and rationale
- Known issues with workarounds
- Deployment gotchas
- Configuration patterns
- Performance optimizations discovered
- Security considerations
- Common debugging approaches

**Bad Candidates:**
- Code (should be in packages/)
- Complete documentation (use docs/)
- Session handovers (use docs/handovers/)
- Temporary notes

---

## Current Memory Files

### architectural-decisions.md
- Key architecture choices
- Why certain patterns were chosen
- Trade-offs made

### known-issues.md
- Current bugs and workarounds
- Blockers and their status
- Technical debt items

### deployment-notes.md
- Deployment procedures
- Environment-specific gotchas
- Configuration requirements

---

## Usage Pattern

### During Development

When you discover something worth remembering:

```bash
# Add to appropriate memory file
echo "- Port conflicts resolved by using 3020+ for verticals" >> docs/memory/architectural-decisions.md
```

### At Session Start

Claude Code can quickly read these files for context:

```bash
# Quick context load
cat docs/memory/architectural-decisions.md
cat docs/memory/known-issues.md
```

---

## Maintenance

**Update Frequency:** As needed when new insights discovered
**Review Frequency:** Monthly cleanup to remove stale items
**Max File Size:** Keep under 200 lines per file (split if larger)

---

**Last Updated:** 2025-11-17
**Owner:** Development Team
