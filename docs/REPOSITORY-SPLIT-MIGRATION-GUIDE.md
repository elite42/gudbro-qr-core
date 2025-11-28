# Repository Split Migration Guide

**Status:** Ready for Execution
**Decision Date:** 2025-11-27
**Estimated Time:** 2-3 hours
**Complexity:** Medium
**Reversibility:** Full (with git checkpoints)

---

## Executive Summary

This guide documents the strategy to split the current monorepo into two independent repositories:

1. **gudbro-qr-core** (~640MB) - Core QR platform + microservices
2. **gudbro-verticals** (~835MB) - Standalone vertical business apps

**Strategy Chosen:** Clean Cut with Shared Code Duplication (Opzione A)

**Rationale:**
- 3MB of shared code duplication is negligible (0.15% of total)
- Complete deployment independence
- No overhead of NPM private packages
- Simpler CI/CD pipelines

---

## Current State Analysis

### Size Breakdown (Post Phase 1 Cleanup)

**Total:** 1.9GB

**Components:**
- Frontend (QR Platform UI): 602MB
- Coffeeshop vertical: 287MB
- Wellness vertical: 270MB
- Rentals vertical: 270MB
- Core packages: ~40MB
- Shared packages: 3MB (shared + menu-template)
- Docs: 984KB
- Root files: ~500KB

### Dependencies

**Vertical apps import from:**
- `@gudbro/shared/database/types` (1 type only)
- `packages/menu-template/types` (1 type only)

**Conclusion:** Minimal coupling, perfect for split.

---

## Target Architecture

### Repository 1: gudbro-qr-core

```
gudbro-qr-core/
├── frontend/              [602MB] QR Platform Admin UI
├── packages/
│   ├── qr-engine/         [796KB] QR Generation Service (Port 3001)
│   ├── analytics/         [300KB] Port 3002
│   ├── api/               [208KB] Port 3000
│   ├── auth/              [52KB]  Port 3003
│   ├── bulk/              [136KB] Port 3008
│   ├── customization/     [34MB]  Port 3005
│   ├── dynamic-qr/        [120KB] Port 3007
│   ├── filters/           [80KB]  Port 3006
│   ├── hub/               [148KB] Port 3013
│   ├── i18n/              [88KB]  Port 3010 (Module 10)
│   ├── menu/              [212KB] Port 3009
│   ├── templates/         [156KB] Port 3011
│   ├── shared/            [384KB] ⭐ DUPLICATED
│   └── menu-template/     [2.6MB] ⭐ DUPLICATED
├── docs/
│   ├── core/              Selected core documentation
│   └── architecture/      System architecture docs
├── docker-compose.yml
├── package.json
├── .gitignore
└── README.md

**Purpose:** Core QR code generation platform
**Ports:** 3000-3013
**Deploy:** Stable releases (monthly/quarterly)
```

### Repository 2: gudbro-verticals

```
gudbro-verticals/
├── apps/
│   ├── coffeeshop/        [287MB] Production Ready
│   │   └── frontend/      Port 3020
│   ├── wellness/          [270MB] In Development
│   │   └── frontend/      Port 3021
│   └── rentals/           [270MB] In Development
│       └── frontend/      Port 3022
├── shared/
│   ├── database/          [384KB] ⭐ COPIED from core
│   └── menu-template/     [2.6MB] ⭐ COPIED from core
├── docs/
│   └── verticals/         Vertical-specific docs
├── package.json
├── .gitignore
└── README.md

**Purpose:** Standalone vertical business applications
**Ports:** 3020+
**Deploy:** Rapid iterations (weekly)
```

---

## Migration Scripts

### Phase 1: Safety Checkpoint

```bash
#!/bin/bash
# checkpoint.sh

cd /Users/gianfrancodagostino/Desktop/qr-platform-complete

echo "🔒 Creating safety checkpoint..."

# Verify clean working directory
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Working directory not clean. Commit or stash changes first."
  exit 1
fi

# Create checkpoint tag
git tag -a "pre-split-$(date +%Y%m%d)" -m "Checkpoint before repository split"

# Push to remote
git push origin main --tags

echo "✅ Safety checkpoint created: pre-split-$(date +%Y%m%d)"
```

### Phase 2: Create gudbro-qr-core

```bash
#!/bin/bash
# create-qr-core.sh

SOURCE="/Users/gianfrancodagostino/Desktop/qr-platform-complete"
TARGET="/Users/gianfrancodagostino/Desktop/gudbro-qr-core"

echo "🏗️  Creating gudbro-qr-core repository..."

# Create directory
mkdir -p "$TARGET"
cd "$TARGET"

# Initialize git
git init
git checkout -b main

# Copy core components
echo "📦 Copying frontend..."
cp -r "$SOURCE/frontend" .

echo "📦 Copying core packages..."
mkdir -p packages
for pkg in qr-engine analytics api auth bulk customization dynamic-qr filters hub i18n menu templates; do
  echo "  - $pkg"
  cp -r "$SOURCE/packages/$pkg" packages/
done

# Copy shared packages (duplicated)
echo "📦 Copying shared packages..."
cp -r "$SOURCE/packages/shared" packages/
cp -r "$SOURCE/packages/menu-template" packages/

# Copy root files
echo "📄 Copying root configuration..."
cp "$SOURCE/package.json" .
cp "$SOURCE/.gitignore" .
cp "$SOURCE/.env.example" .
cp "$SOURCE/docker-compose.yml" .

# Copy selected docs
echo "📚 Copying documentation..."
mkdir -p docs
cp -r "$SOURCE/docs/architecture" docs/ 2>/dev/null || true
cp -r "$SOURCE/docs/adr" docs/ 2>/dev/null || true
cp "$SOURCE/CLAUDE.md" .

# Create README
cat > README.md <<'EOF'
# GUDBRO QR Core Platform

Core QR code generation platform and microservices.

## Architecture

- **Frontend:** QR Platform Admin UI (Port 3000)
- **QR Engine:** QR Generation Service (Port 3001)
- **Modules:** Analytics, Auth, Filters, i18n, etc. (Ports 3002-3013)

## Quick Start

\`\`\`bash
npm install
docker-compose up
\`\`\`

## Documentation

See `docs/` for architecture and ADRs.
EOF

# Initial commit
git add .
git commit -m "feat: Initialize gudbro-qr-core repository

Extracted from qr-platform-complete monorepo.
Includes core platform, QR engine, and all microservices.

Size: ~640MB
Shared packages: Duplicated from monorepo (3MB)
"

echo "✅ gudbro-qr-core created at: $TARGET"
```

### Phase 3: Create gudbro-verticals

```bash
#!/bin/bash
# create-verticals.sh

SOURCE="/Users/gianfrancodagostino/Desktop/qr-platform-complete"
TARGET="/Users/gianfrancodagostino/Desktop/gudbro-verticals"

echo "🏗️  Creating gudbro-verticals repository..."

# Create directory
mkdir -p "$TARGET"
cd "$TARGET"

# Initialize git
git init
git checkout -b main

# Create apps structure
echo "📦 Copying vertical apps..."
mkdir -p apps

# Copy coffeeshop
echo "  - coffeeshop (Production)"
mkdir -p apps/coffeeshop
cp -r "$SOURCE/packages/coffeeshop"/* apps/coffeeshop/

# Copy wellness
echo "  - wellness (Development)"
mkdir -p apps/wellness
cp -r "$SOURCE/packages/wellness"/* apps/wellness/

# Copy rentals
echo "  - rentals (Development)"
mkdir -p apps/rentals
cp -r "$SOURCE/packages/rentals"/* apps/rentals/

# Copy shared packages (duplicated)
echo "📦 Copying shared packages..."
mkdir -p shared
cp -r "$SOURCE/packages/shared"/* shared/
mkdir -p shared/menu-template
cp -r "$SOURCE/packages/menu-template"/* shared/menu-template/

# Copy docs
echo "📚 Copying documentation..."
mkdir -p docs/verticals
cp -r "$SOURCE/docs/coffeeshop"* docs/verticals/ 2>/dev/null || true

# Create root package.json
cat > package.json <<'EOF'
{
  "name": "gudbro-verticals",
  "version": "1.0.0",
  "private": true,
  "description": "GUDBRO vertical business applications",
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev:coffeeshop": "cd apps/coffeeshop/frontend && npm run dev",
    "dev:wellness": "cd apps/wellness && npm start",
    "dev:rentals": "cd apps/rentals && npm start"
  }
}
EOF

# Create .gitignore
cat > .gitignore <<'EOF'
# Dependencies
node_modules/
npm-debug.log*
package-lock.json

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
EOF

# Create README
cat > README.md <<'EOF'
# GUDBRO Verticals

Standalone vertical business applications powered by GUDBRO platform.

## Apps

### Coffeeshop (Port 3020) ✅ Production
Plant-based cafe digital menu with ordering system.

### Wellness (Port 3021) 🚧 Development
Wellness center booking and class management.

### Rentals (Port 3022) 🚧 Development
Vehicle rental management system.

## Quick Start

\`\`\`bash
# Install all dependencies
npm install

# Run coffeeshop
npm run dev:coffeeshop

# Run wellness
npm run dev:wellness

# Run rentals
npm run dev:rentals
\`\`\`

## Shared Code

Shared packages are duplicated from gudbro-qr-core:
- `shared/database`: Product types and utilities
- `shared/menu-template`: Reusable UI components

To sync updates from core:
\`\`\`bash
./scripts/sync-shared.sh
\`\`\`
EOF

# Initial commit
git add .
git commit -m "feat: Initialize gudbro-verticals repository

Extracted from qr-platform-complete monorepo.
Includes coffeeshop, wellness, and rentals apps.

Size: ~835MB
Shared packages: Duplicated from core (3MB)
Status: Coffeeshop production-ready, others in development
"

echo "✅ gudbro-verticals created at: $TARGET"
```

### Phase 4: Create Sync Script

```bash
#!/bin/bash
# gudbro-verticals/scripts/sync-shared.sh

CORE_PATH="/Users/gianfrancodagostino/Desktop/gudbro-qr-core"
VERTICALS_PATH="/Users/gianfrancodagostino/Desktop/gudbro-verticals"

echo "🔄 Syncing shared packages from gudbro-qr-core..."

if [ ! -d "$CORE_PATH" ]; then
  echo "❌ Error: gudbro-qr-core not found at $CORE_PATH"
  exit 1
fi

cd "$VERTICALS_PATH"

# Sync shared package
echo "📦 Syncing shared/database..."
rsync -av --delete "$CORE_PATH/packages/shared/" shared/

# Sync menu-template
echo "📦 Syncing shared/menu-template..."
rsync -av --delete "$CORE_PATH/packages/menu-template/" shared/menu-template/

# Update CHANGELOG
cat >> shared/CHANGELOG.md <<EOF

## [$(date +%Y-%m-%d)] - Sync from Core
- Synced from gudbro-qr-core commit: $(cd "$CORE_PATH" && git rev-parse --short HEAD)

EOF

echo "✅ Shared packages synced successfully"
echo "📝 Updated shared/CHANGELOG.md"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test apps: npm run dev:coffeeshop"
echo "3. Commit: git commit -am 'chore: sync shared packages from core'"
```

---

## Execution Checklist

### Pre-Migration

- [ ] Commit all pending changes
- [ ] Push to GitHub
- [ ] Run `npm install` to ensure dependencies are up to date
- [ ] Verify all apps are working (coffeeshop on port 3020)
- [ ] Create checkpoint tag (run `checkpoint.sh`)
- [ ] Backup `.git` directory (optional but recommended)

### Migration

- [ ] Run `create-qr-core.sh`
- [ ] Verify gudbro-qr-core structure
- [ ] Test QR Platform frontend (cd frontend && npm run dev)
- [ ] Run `create-verticals.sh`
- [ ] Verify gudbro-verticals structure
- [ ] Test coffeeshop app (cd apps/coffeeshop/frontend && npm run dev)

### Post-Migration

- [ ] Create GitHub repositories
  - [ ] `gudbro-qr-core` (private)
  - [ ] `gudbro-verticals` (private)
- [ ] Push both repos to GitHub
- [ ] Update local git remotes
- [ ] Document repository URLs in team wiki
- [ ] Update CI/CD pipelines (if any)
- [ ] Update deployment documentation

### Cleanup

- [ ] Archive original monorepo (rename to `qr-platform-complete-archive`)
- [ ] Remove from active projects folder
- [ ] Update bookmarks/shortcuts to new repos

---

## Testing Procedure

### Test gudbro-qr-core

```bash
cd /Users/gianfrancodagostino/Desktop/gudbro-qr-core

# Install dependencies
npm install

# Test QR Platform frontend
cd frontend
npm run dev
# Visit: http://localhost:3000

# Verify QR generation works
# Create a test QR code from admin UI

# Test module independence
cd ../packages/qr-engine
npm install
npm test (if tests exist)
```

### Test gudbro-verticals

```bash
cd /Users/gianfrancodagostino/Desktop/gudbro-verticals

# Install dependencies
npm install

# Test coffeeshop
cd apps/coffeeshop/frontend
npm run dev
# Visit: http://localhost:3020

# Verify:
# - Homepage loads
# - Menu displays
# - Cart works
# - Theme toggle works
# - Language selector works

# Test wellness (if ready)
cd ../../wellness
npm start
# Visit: http://localhost:3021

# Test rentals (if ready)
cd ../rentals
npm start
# Visit: http://localhost:3022
```

---

## Rollback Plan

If migration fails or issues are discovered:

### Option 1: Revert to Checkpoint

```bash
cd /Users/gianfrancodagostino/Desktop/qr-platform-complete

# List checkpoints
git tag | grep pre-split

# Revert to checkpoint
git reset --hard pre-split-YYYYMMDD

# Verify
git status
```

### Option 2: Delete New Repos

```bash
# Remove new repositories
rm -rf /Users/gianfrancodagostino/Desktop/gudbro-qr-core
rm -rf /Users/gianfrancodagostino/Desktop/gudbro-verticals

# Continue using monorepo
cd /Users/gianfrancodagostino/Desktop/qr-platform-complete
```

---

## Post-Migration Best Practices

### 1. Shared Code Synchronization

**Frequency:** As needed (estimated 1-2 times/year)

**Process:**
1. Update shared code in `gudbro-qr-core`
2. Run sync script in `gudbro-verticals`
3. Test all vertical apps
4. Commit changes

**Monitor for:**
- Breaking changes in shared types
- API changes in menu-template

### 2. Version Management

**Core Repository:**
- Semantic versioning: v1.0.0
- Tag stable releases
- Changelog for each release

**Verticals Repository:**
- Independent versioning per app
- coffeeshop: v1.x.x
- wellness: v0.x.x (beta)
- rentals: v0.x.x (beta)

### 3. Documentation

**Maintain:**
- `shared/CHANGELOG.md` - Track sync history
- Architecture diagrams showing repo relationship
- API documentation for shared interfaces

### 4. CI/CD Strategy

**Core:**
- Run tests on PR
- Deploy to staging on merge to main
- Manual promotion to production

**Verticals:**
- Independent pipelines per app
- Coffeeshop: Auto-deploy to production
- Wellness/Rentals: Deploy to staging only

---

## When to Reconsider NPM Packages

Migrate to NPM private packages if:

1. **Shared code exceeds 20-30MB** (10x current size)
2. **Weekly synchronization** becomes necessary
3. **3+ teams** work on different repos simultaneously
4. **Breaking changes** in shared code occur frequently

**Current verdict:** Not necessary. 3MB duplication is acceptable.

---

## Expected Outcomes

### Benefits

✅ **Complete Independence**
- Deploy core and verticals separately
- No cross-repo dependencies
- Faster CI/CD (test only what changed)

✅ **Team Separation**
- Core platform team → gudbro-qr-core
- Product teams → gudbro-verticals
- Clear ownership boundaries

✅ **Reduced Build Time**
- Smaller repositories = faster clones
- Parallel CI/CD pipelines
- Independent npm installs

✅ **Flexible Scaling**
- Add new verticals without touching core
- Update core without affecting verticals
- Different release cadences

### Trade-offs

⚠️ **3MB Code Duplication**
- Shared packages duplicated
- Manual sync required (rare)
- Acceptable overhead

⚠️ **Two Repositories to Maintain**
- Separate issues/PRs
- Coordinate shared updates
- Track sync history

---

## Timeline Estimate

**Total:** 2-3 hours

- Preparation: 30 min
- Script execution: 45 min
- Testing: 60 min
- Documentation: 30 min
- GitHub setup: 15 min

**Best time to execute:** Weekend or Friday evening

---

## Support

**Questions or Issues:**

1. Review this document
2. Check checkpoint tags: `git tag | grep pre-split`
3. Verify scripts are executable: `chmod +x *.sh`
4. Test in dry-run mode first (comment out commits in scripts)

**Emergency Rollback:**
```bash
cd qr-platform-complete
git reset --hard pre-split-YYYYMMDD
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Author:** Claude Code (AI Assistant)
**Approved By:** Gianfranco D'Agostino
