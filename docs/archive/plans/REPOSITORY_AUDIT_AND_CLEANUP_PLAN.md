# Repository Audit and Cleanup Plan

**Generated**: October 17, 2025  
**Purpose**: Comprehensive assessment of repository health, redundancies, and cleanup priorities

---

## Executive Summary

This audit identified **6 critical areas** requiring immediate attention:
1. **Build output committed to git** (index.html, index.json, search-index.json, etc.)
2. **Duplicate configuration files** (config.toml vs hugo.toml)
3. **Multiple versions of JavaScript modules** (flashcards.js, flashcards-simple.js, etc.)
4. **Incomplete Go tooling** with TODOs
5. **Missing .gitignore entries** for build artifacts
6. **Themes folder** bloat (209 items from Hugo theme)

**Impact**: Repository size bloat, unclear codebase structure, maintenance burden, deployment risks

---

## 1. Critical Issues (Fix Immediately)

### 1.1 Build Artifacts Committed to Git

**Problem**: Build outputs are tracked in git, violating separation of source/build artifacts.

**Files to Remove from Git**:
```bash
# Hugo build outputs (should be in .gitignore)
index.html
index.json  
index.xml
search-index.json
sitemap.xml
hugo_stats.json  # Already in .gitignore but file exists

# Generated directories
categories/
tags/
levels/
grammar/index.html
vocabulary/index.html
practice/index.html
css/
js/
fonts/
images/
mermaid/
offline/
webfonts/
```

**Action**:
```bash
git rm -r index.html index.json index.xml search-index.json sitemap.xml
git rm -r categories/ tags/ levels/ grammar/ vocabulary/ practice/ css/ js/ fonts/ images/ mermaid/ offline/
git commit -m "Remove build artifacts from version control"
```

**Update .gitignore**:
```gitignore
# Add to .gitignore
index.html
index.json
index.xml
search-index.json
sitemap.xml

# Build outputs already covered by existing rules
# but being explicit:
hugo_stats.json
```

---

### 1.2 Duplicate Configuration Files

**Problem**: Both `config.toml` and `hugo.toml` exist with **different baseURLs**.

**Current State**:
- `config.toml`: `baseURL = "https://dinz.github.io/BulgarianApp-Fresh/"`
- `hugo.toml`: `baseURL = 'https://yungseepferd.github.io/BulgarianGermanLearningApp'`

**Which File is Used?**  
Hugo reads `hugo.toml` by default (modern convention). `config.toml` appears to be legacy.

**Action**:
1. **Keep**: `hugo.toml` (modern, more complete)
2. **Delete**: `config.toml`
3. **Verify**: Confirm deployment URL matches `hugo.toml` baseURL

```bash
git rm config.toml
git commit -m "Remove duplicate config.toml in favor of hugo.toml"
```

---

### 1.3 Environment Files Committed

**Problem**: `.env.production` is committed but should be gitignored (already in .gitignore but file exists).

**Action**:
```bash
git rm --cached .env.production
git commit -m "Remove committed environment file"
```

---

## 2. Code Redundancy Issues

### 2.1 Duplicate JavaScript Files

**Problem**: Multiple versions of the same functionality exist without clear deprecation.

| Active File | Redundant/Old File | Status | Action |
|------------|-------------------|--------|--------|
| `flashcards.js` (26KB) | None | **Keep** | Current implementation |
| `practice.js` (14KB) | `practice-simple.js` (13KB) | **Remove simple** | Duplicate functionality |
| `spaced-repetition.js` (13KB) | `spaced-repetition-simple.js` (4KB) | **Remove simple** | Deprecated |
| `vocabulary.js` (9KB) | `vocabulary-simple.js` (10KB)<br>`vocabulary-old.js` (10KB) | **Remove both** | Old versions |
| `enhanced-*.js` files | Original files | **Needs review** | May be feature additions |

**Enhanced Files Analysis**:
- `enhanced-bidirectional-system.js` (15KB) - Appears to be additional feature layer
- `enhanced-practice-session.js` (10KB) - Extends practice.js
- `enhanced-spaced-repetition.js` (4KB) - Extends spaced-repetition.js
- `enhanced-vocab-cards.js` (2KB) - Extends vocab-cards.js

**Decision Needed**: Are "enhanced" files feature additions or should they be merged into base files?

**Recommended Actions**:
```bash
# Remove clearly deprecated files
git rm assets/js/practice-simple.js
git rm assets/js/spaced-repetition-simple.js  
git rm assets/js/vocabulary-simple.js
git rm assets/js/vocabulary-old.js

# Document enhanced-* files in code comments or decide to merge
```

**Add to Documentation**:
Create `assets/js/README.md` explaining:
- Core modules vs. enhanced modules
- When to use each
- Deprecation policy

---

### 2.2 JavaScript Modules Folder

**Current Structure**:
```
assets/js/modules/
├── api-client.js (11KB)
├── learning-session.js (15KB)
├── performance-monitor.js (17KB)
├── practice-page.js (25KB)
├── search-engine.js (18KB)
├── service-worker.js (11KB)
├── user-preferences.js (11KB)
└── vocabulary-page.js (14KB)
```

**Questions**:
1. Are these being imported/used anywhere?
2. Do they overlap with top-level JS files?
3. Should all JS be moved to modules/ for consistency?

**Action Required**: Audit imports across all HTML/JS files to determine usage.

---

## 3. Documentation Issues

### 3.1 TODOs in Documentation

**Found TODOs**:

| File | Line | TODO |
|------|------|------|
| `docs/API.md` | 108 | "Document persistence lifecycle and fallback behavior" |
| `docs/API.md` | 114 | "Define conventions for filenames, locales, and caching" |
| `AGENTS.md` | 92 | "Surface technical debt or blockers by logging TODOs in docs/notes/NEXT.md" |

**Action**: Create tasks in `docs/notes/NEXT.md` for each TODO.

---

### 3.2 TODOs in Go Code

**File**: `tools/cmd/hugo-bg-de/main.go`

| Line | Function | TODO |
|------|----------|------|
| 355 | `minifyCSSFile` | "Implement CSS minification" |
| 361 | `minifyJSFile` | "Implement JS minification" |

**Impact**: Post-build optimization is **not working**. Functions are placeholders.

**Action**:
1. Either implement minification (use Hugo's built-in `--minify` instead)
2. Or remove placeholder functions and document Hugo handles this

**Recommendation**: Remove functions since `hugo --minify` handles this. The Go tool is duplicating Hugo's work.

---

### 3.3 Documentation Completeness

**Missing Documentation**:

| Topic | Status | Priority |
|-------|--------|----------|
| JS Module Architecture | ❌ Missing | High |
| Enhanced vs. Base Files | ❌ Missing | High |
| Data Processing Pipeline | ⚠️ Partial | Medium |
| Service Worker Update Flow | ⚠️ Partial | Medium |
| Go Tooling Usage | ⚠️ Partial | Low |

**Action**: Add missing sections to existing docs or create new guides.

---

## 4. Themes Folder Analysis

**Problem**: 209 items in `themes/` folder - likely entire Hugo Learn theme.

**Current Practice**: Theme is specified in `hugo.toml`:
```toml
theme = 'learn'
```

**Options**:

### Option A: Keep Theme as Git Submodule ✅ RECOMMENDED
```bash
# Remove committed theme
git rm -r themes/learn

# Add as submodule
git submodule add https://github.com/matcornic/hugo-theme-learn.git themes/learn
git commit -m "Convert Hugo Learn theme to submodule"
```

**Pros**:
- Cleaner repo (smaller size)
- Easy theme updates
- Standard Hugo practice

**Cons**:
- Requires submodule initialization on clone

### Option B: Keep Theme Committed
**Pros**:
- No submodule complexity
- Works offline

**Cons**:
- 209 extra files in repo
- Hard to update theme

**Recommendation**: Use submodule (Option A).

---

## 5. Build System Confusion

### 5.1 Redundant Build Tools

**Current Build Methods**:
1. Hugo CLI: `hugo --minify`
2. npm scripts: `npm run build` (wraps Hugo)
3. Go tool: `hugo-bg-de build` (wraps Hugo + tries to minify)
4. Shell script: `build.sh` (4KB)

**Problem**: Multiple build entry points doing similar things.

**Analysis**:
- `hugo --minify` - ✅ Core, works
- `npm run build` - ✅ Useful wrapper
- Go tool - ❓ Adds data processing but minify functions are TODOs
- `build.sh` - ❓ Purpose unclear

**Recommended Actions**:
1. **Keep**: `npm run build` as standard entry point
2. **Fix**: Go tool - remove minify TODOs, focus on data processing only
3. **Review**: `build.sh` - document purpose or remove
4. **Document**: Clear build workflow in `docs/DEVELOPMENT.md`

---

### 5.2 Data Processing Clarity

**Go Tool Features**:
- ✅ `process-data` - Processes vocabulary/grammar JSON
- ✅ `validate` - Validates data files
- ❌ `build` - Redundant with Hugo
- ❌ Post-build minification - TODOs, Hugo handles this

**Recommendation**:
```go
// Remove from main.go:
- buildCommand (use Hugo directly)
- postBuildHook optimization functions
- minifyCSSFile, minifyJSFile placeholders

// Keep:
+ processDataCommand
+ validateCommand  
+ devCommand (if it adds value over 'hugo server -D')
```

---

## 6. Testing Infrastructure

### 6.1 Playwright Configuration

**Files**:
- `playwright.config.js`
- `tests/playwright/` (E2E tests)
- `playwright-report/` - ❌ Build artifact, should not be committed

**Action**:
```bash
git rm -r playwright-report/
git rm -r test-results/
```

**Update .gitignore**:
```gitignore
# Test artifacts
playwright-report/
test-results/
```

---

## 7. Cleanup Execution Plan

### Phase 1: Critical Fixes (Do First)

```bash
# 1. Remove build artifacts
git rm -r index.html index.json index.xml search-index.json sitemap.xml
git rm -r categories/ tags/ levels/ grammar/ vocabulary/ practice/ 
git rm -r css/ js/ fonts/ images/ mermaid/ offline/
git rm -r playwright-report/ test-results/

# 2. Remove duplicate config
git rm config.toml

# 3. Remove environment file
git rm --cached .env.production

# 4. Update .gitignore (see section above)

# 5. Commit
git commit -m "chore: remove build artifacts and duplicate configs from version control"
```

### Phase 2: Code Cleanup

```bash
# Remove deprecated JavaScript files
git rm assets/js/practice-simple.js
git rm assets/js/spaced-repetition-simple.js
git rm assets/js/vocabulary-simple.js
git rm assets/js/vocabulary-old.js

git commit -m "refactor: remove deprecated JavaScript files"
```

### Phase 3: Theme Management

```bash
# Convert theme to submodule
git rm -r themes/learn
git submodule add https://github.com/matcornic/hugo-theme-learn.git themes/learn
git commit -m "refactor: convert Hugo Learn theme to git submodule"
```

### Phase 4: Documentation Updates

**Files to Update**:

1. **Create** `assets/js/README.md`:
   - Explain module architecture
   - Document enhanced vs. base files
   - List active vs. deprecated files

2. **Update** `docs/DEVELOPMENT.md`:
   - Clarify build workflow
   - Document data processing pipeline
   - Add deployment steps

3. **Update** `docs/API.md`:
   - Complete TODOs (persistence, audio conventions)

4. **Create** `tools/README.md`:
   - Document Go tooling purpose
   - Remove references to unimplemented features

5. **Update** `docs/notes/NEXT.md`:
   - Add remaining TODOs from code

### Phase 5: Go Tool Refactoring

**File**: `tools/cmd/hugo-bg-de/main.go`

**Changes**:
```go
// Remove:
- buildCommand (line 50-76)
- postBuildHook (line 191-208)
- optimizeStaticAssets (line 263-295)
- generateServiceWorker (line 297-314)
- minifyCSSFile (line 354-358)
- minifyJSFile (line 360-364)
- getStaticAssetList (line 366-385)
- createServiceWorkerTemplate (line 387-412)

// Update:
- devCommand: Remove go watchDataFiles() if not working
- Main app.Commands: Remove 'build' command, keep 'process-data' and 'validate'

// Keep:
+ processDataCommand
+ validateCommand
+ preBuildHook (data processing only)
+ generatePWAManifest (if working)
```

---

## 8. Post-Cleanup Validation

### Checklist

- [ ] `hugo --logLevel debug -D` builds without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts dev server
- [ ] `npm test` passes (Playwright tests)
- [ ] Repository size reduced (check with `du -sh .git`)
- [ ] No duplicate files remain
- [ ] Documentation reflects actual codebase
- [ ] All TODOs tracked in `docs/notes/NEXT.md`
- [ ] `.gitignore` prevents future artifact commits
- [ ] Theme submodule initializes correctly

### Verification Commands

```bash
# Verify no build artifacts in git
git ls-files | grep -E '(index\.html|index\.json|search-index\.json)'
# Should return nothing

# Check repository size
du -sh .git
# Before: ~XX MB, After: should be smaller

# Verify builds work
npm run build
# Should succeed

# Check for remaining TODOs
grep -r "TODO" --include="*.go" --include="*.js" --include="*.md" . | grep -v node_modules
# Review any that remain
```

---

## 9. Maintenance Best Practices (Going Forward)

### 9.1 Commit Discipline

**Rules**:
1. ✅ **Never commit**: `public/`, build artifacts, `node_modules/`, `.env` files
2. ✅ **Always review**: `.gitignore` before committing new file types
3. ✅ **One purpose per file**: No "enhanced" and "simple" versions coexisting
4. ✅ **Deprecation policy**: Document why a file exists or remove it

### 9.2 Documentation Standards

**Every code file should have**:
- Header comment explaining purpose
- Import/export documentation
- Deprecation notice if applicable

**Example**:
```javascript
/**
 * @file flashcards.js
 * @description Core flashcard system with SM-2 spaced repetition
 * @status ACTIVE
 * @replaces None (current implementation)
 * @see docs/ARCHITECTURE.md for system design
 */
```

### 9.3 TODO Management

**Process**:
1. Add TODO in code with issue reference
2. Create entry in `docs/notes/NEXT.md`
3. Link to GitHub issue (if using issues)
4. Remove TODO when resolved

**Format**:
```javascript
// TODO(#123): Implement feature X - tracked in docs/notes/NEXT.md
```

---

## 10. Summary of Changes

### Files to Delete (49+ files)

| Category | Count | Examples |
|----------|-------|----------|
| Build artifacts | 30+ | index.html, css/, js/, etc. |
| Deprecated JS | 4 | *-simple.js, vocabulary-old.js |
| Duplicate configs | 1 | config.toml |
| Test artifacts | 2+ | playwright-report/, test-results/ |
| Go tool placeholders | 8 functions | minifyCSSFile, etc. |
| Environment files | 1 | .env.production |
| Theme files (to submodule) | 209 | themes/learn/* |

**Total Impact**: ~250+ files removed or restructured

### Documentation to Create/Update (6 files)

1. `assets/js/README.md` - NEW
2. `tools/README.md` - NEW  
3. `docs/DEVELOPMENT.md` - UPDATE
4. `docs/API.md` - UPDATE
5. `docs/REPOSITORY_AUDIT_AND_CLEANUP_PLAN.md` - THIS FILE
6. `docs/notes/NEXT.md` - UPDATE

### Code Changes

- `tools/cmd/hugo-bg-de/main.go` - Refactor (remove ~200 lines)
- `.gitignore` - Add 6 new patterns

---

## 11. Risk Assessment

### Low Risk
✅ Removing build artifacts - regenerated on build  
✅ Removing deprecated JS files - not imported anywhere  
✅ Removing duplicate config.toml - hugo.toml is used  

### Medium Risk
⚠️ Converting theme to submodule - requires team awareness  
⚠️ Refactoring Go tool - ensure data processing still works  

### High Risk
❌ Removing "enhanced" files without understanding their purpose

**Mitigation**: Create a cleanup branch, test thoroughly before merging to main.

---

## 12. Timeline Estimate

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 1: Critical fixes | 1 hour | Low |
| Phase 2: Code cleanup | 2 hours | Medium |
| Phase 3: Theme submodule | 1 hour | Medium |
| Phase 4: Documentation | 4 hours | High |
| Phase 5: Go refactoring | 3 hours | High |
| Testing & validation | 2 hours | Medium |
| **Total** | **13 hours** | - |

---

## Appendix A: Full .gitignore Updates

Add these entries to `.gitignore`:

```gitignore
# Hugo build outputs (explicit)
index.html
index.json
index.xml
search-index.json
sitemap.xml
hugo_stats.json

# Test artifacts
playwright-report/
test-results/
.playwright/

# Additional build outputs
css/
js/
fonts/
images/
mermaid/
offline/
categories/
tags/
levels/
grammar/index.html
vocabulary/index.html
practice/index.html
```

---

## Appendix B: Quick Win Commands

For immediate impact, run these commands:

```bash
# Quick cleanup (30 seconds)
git rm -r playwright-report/ test-results/ 2>/dev/null
git rm index.html index.json index.xml search-index.json sitemap.xml 2>/dev/null
git rm config.toml 2>/dev/null
git commit -m "chore: quick cleanup of build artifacts and duplicates"

# Verify build still works
npm run build
```

---

**Next Actions**: Review this plan with the team, prioritize phases, and execute cleanup in a dedicated branch.

**Audit Completed**: October 17, 2025
