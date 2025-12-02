# Quick Cleanup Guide

**Generated**: October 17, 2025  
**Purpose**: Fast-track guide for immediate repository cleanup

For comprehensive details, see `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md`

---

## 🚨 Critical Issues (Fix Today)

### 1. Remove Build Artifacts (5 minutes)

**Impact**: 30+ files polluting git history, ~10MB repository bloat

```bash
# Navigate to repository root
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh

# Remove all build artifacts
git rm -r index.html index.json index.xml search-index.json sitemap.xml
git rm -r categories/ tags/ levels/ grammar/ vocabulary/ practice/
git rm -r css/ js/ fonts/ images/ mermaid/ offline/
git rm -r playwright-report/ test-results/

# Remove duplicate config
git rm config.toml

# Remove committed env file
git rm --cached .env.production

# Commit
git commit -m "chore: remove build artifacts and duplicates from version control"

# Verify
git status  # Should show only .gitignore as modified
```

**✅ Already done**: `.gitignore` has been updated to prevent this in future

---

### 2. Delete Deprecated JavaScript (2 minutes)

**Impact**: 4 files, ~40KB of dead code

```bash
# Remove deprecated files
git rm assets/js/practice-simple.js
git rm assets/js/spaced-repetition-simple.js
git rm assets/js/vocabulary-simple.js
git rm assets/js/vocabulary-old.js

# Commit
git commit -m "refactor: remove deprecated JavaScript modules"
```

---

### 3. Verify Build Still Works (3 minutes)

```bash
# Test Hugo build
hugo --logLevel debug -D

# Test production build
npm run build

# Test dev server
npm run dev  # Open http://localhost:1313 to verify

# Press Ctrl+C to stop
```

**Expected**: All commands succeed with no errors

---

## ⚠️ Important Issues (This Week)

### 4. Audit Enhanced JavaScript Files (30 minutes)

**Decision needed**: Should these be merged into core modules?

Files to review:
- `assets/js/enhanced-bidirectional-system.js` (15KB)
- `assets/js/enhanced-practice-session.js` (10KB)
- `assets/js/enhanced-spaced-repetition.js` (4KB)
- `assets/js/enhanced-vocab-cards.js` (2KB)

**Action**: 
1. Check if they're imported anywhere: `grep -r "enhanced-" layouts/ assets/js/`
2. If not used: delete them
3. If used: document their purpose in `assets/js/README.md`

---

### 5. Convert Theme to Submodule (15 minutes)

**Impact**: 209 files moved out of main repo

```bash
# Backup current theme
mv themes/learn themes/learn-backup

# Remove from git
git rm -r themes/learn

# Add as submodule
git submodule add https://github.com/matcornic/hugo-theme-learn.git themes/learn

# Test
hugo --logLevel debug -D

# If it works, commit
git commit -m "refactor: convert Hugo Learn theme to submodule"

# If it fails, restore backup
# mv themes/learn-backup themes/learn
```

---

### 6. Refactor Go Tool (45 minutes)

**File**: `tools/cmd/hugo-bg-de/main.go`

**Remove these functions** (lines 354-412):
- `minifyCSSFile` - Hugo handles this
- `minifyJSFile` - Hugo handles this
- `optimizeStaticAssets` - Not needed
- `generateServiceWorker` - Should be separate
- `getStaticAssetList` - Not used
- `createServiceWorkerTemplate` - Not used
- `postBuildHook` - Calls above functions
- `buildCommand` - Wraps Hugo unnecessarily

**Keep**:
- `processDataCommand` ✅
- `validateCommand` ✅
- `devCommand` ✅
- `preBuildHook` ✅ (only data processing part)

**Test after changes**:
```bash
npm run build-tools
./bin/hugo-bg-de validate
./bin/hugo-bg-de process-data
```

---

## 📋 Documentation Tasks (Optional, Low Priority)

### 7. Complete API Documentation TODOs

Edit `docs/API.md`:

**Line 108**: Add section on persistence lifecycle:
```markdown
### Persistence Lifecycle

localStorage keys under `bgde:` prefix:
- Written on every flashcard grade
- Read on page load
- Fallback to in-memory if localStorage unavailable
- Import/export via JSON download
```

**Line 114**: Add audio conventions:
```markdown
### Audio File Conventions

- **Location**: `static/audio/{vocabulary|grammar}/`
- **Naming**: `{id}.mp3` (e.g., `zdravei.mp3`)
- **Format**: MP3, 64kbps, mono
- **Fallback**: Silent if file missing, no errors
```

---

## 📊 Verification Checklist

After running cleanup phases 1-3:

- [ ] `git status` shows only `.gitignore` modified
- [ ] `hugo --logLevel debug -D` builds without errors
- [ ] `npm run build` completes successfully
- [ ] `npm test` passes (or skip if tests broken)
- [ ] Repository size reduced: `du -sh .git` (check if smaller)
- [ ] No build artifacts in git: `git ls-files | grep "index.html"` returns nothing
- [ ] All deprecated JS files removed
- [ ] Site works in browser (test locally)

---

## 🎯 Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Files tracked in git | ~400+ | ~150 | <200 |
| Repository size (.git) | Unknown | TBD | -50% |
| JavaScript files | 30 | 26 | <25 |
| Duplicate configs | 2 | 1 | 1 |
| TODOs in code | 4 | 0 | 0 |
| Build artifacts in git | 30+ | 0 | 0 |

---

## ⏱️ Time Estimates

| Phase | Duration | Priority |
|-------|----------|----------|
| Remove build artifacts | 5 min | 🔴 Critical |
| Delete deprecated JS | 2 min | 🔴 Critical |
| Verify build | 3 min | 🔴 Critical |
| Audit enhanced JS | 30 min | 🟡 Important |
| Convert theme | 15 min | 🟡 Important |
| Refactor Go tool | 45 min | 🟡 Important |
| Document API TODOs | 20 min | 🟢 Optional |
| **Total** | **2 hours** | - |

---

## 🚀 Quick Start (30 Second Version)

**Just want to fix the most critical issues NOW?**

```bash
# Remove build artifacts
git rm -r index.html index.json index.xml search-index.json sitemap.xml categories/ tags/ levels/ grammar/ vocabulary/ practice/ css/ js/ fonts/ images/ mermaid/ offline/ playwright-report/ test-results/ config.toml
git rm --cached .env.production 2>/dev/null
git commit -m "chore: critical cleanup - remove build artifacts"

# Remove deprecated code
git rm assets/js/*-simple.js assets/js/vocabulary-old.js
git commit -m "refactor: remove deprecated JavaScript"

# Verify
npm run build
```

**Done!** Repository is now 50%+ cleaner.

---

## ❓ Questions & Answers

**Q: Will this break the site?**  
A: No. We're removing generated files that Hugo recreates on every build.

**Q: What if I need to roll back?**  
A: All changes are in git. Use `git revert <commit-hash>` or restore from backup.

**Q: Can I skip the theme submodule conversion?**  
A: Yes, it's optional. Just adds 209 files to your repo size.

**Q: What about the enhanced-*.js files?**  
A: Need analysis. They might be actively used or redundant. Don't delete until verified.

**Q: Why remove the Go tool functions?**  
A: They're placeholder TODOs that don't work. Hugo's `--minify` handles optimization.

---

## 📞 Need Help?

**Issues during cleanup?**

1. Check `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md` for detailed explanations
2. Review git history: `git log --oneline`
3. Test build after each phase before committing
4. Create a cleanup branch first: `git checkout -b repo-cleanup`

**Safe rollback**:
```bash
git checkout main
git branch -D repo-cleanup
```

---

**See Also**:
- `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md` - Comprehensive analysis
- `assets/js/README.md` - JavaScript module documentation
- `tools/README.md` - Go tooling documentation
- `docs/notes/NEXT.md` - Full TODO list

**Last Updated**: October 17, 2025
