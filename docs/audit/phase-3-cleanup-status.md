# Phase 3 Cleanup Status

Last Updated: 2025-10-19

## Overview

Phase 3 focuses on template cleanup, asset optimization, test coverage, and documentation refresh following the consolidation work in Phases 1-2.

## Completed Tasks

### Phase 3.A — Template Archive & Cleanup

- [x] Created `layouts/archive/test-flashcards/` directory structure
- [x] Archived `layouts/test-flashcards/single.html` (legacy testing template)
- [x] Removed empty `layouts/test-flashcards/` directory
- [x] Verified `static/js/` already clean (no legacy files present)

### Phase 1.C (Deferred work completed)

- [x] Pinned GitHub Actions to commit SHAs in `.github/workflows/ci.yml`
- [x] Added `npm audit --audit-level=high` security scanning step
- [x] Added `govulncheck` Go vulnerability scanning
- [x] Created `.github/dependabot.yml` for automated dependency updates
  - npm packages (weekly on Monday)
  - Go modules (weekly on Monday)  
  - GitHub Actions (weekly on Monday)

## Remaining Tasks

### Phase 3.B — Inline Asset Extraction

**Priority: Medium**

Extract inline CSS/JS from templates into proper asset bundles:

#### `layouts/practice/single.html`

- **Inline CSS:** ~60 lines of practice container styling (lines 17-79)
- **Inline JS:** ~30 lines of practice session initialization (lines 290+)
- **Action:** Create `assets/scss/pages/_practice.scss` and move CSS there
- **Action:** Create `assets/js/practice-init.js` module and wire via Hugo Pipes
- **Benefit:** Better caching, CSP compliance, maintainability

#### `layouts/_default/offline.html`

- **Inline CSS:** Minimal fallback styling
- **Status:** Keep as-is (critical path for offline UX)

#### `layouts/partials/pwa-register.html`

- **Inline CSS:** Update notification styling
- **Status:** Keep as-is (PWA registration must be inline)

### Phase 3.C — Test Coverage Expansion

**Priority: High**

Add Playwright specs for new unified modules:

1. **Unified Practice Flow:**
   - Load practice session with unified module
   - Flip card (Space/Enter)
   - Grade cards (1-5 keys)
   - Complete session and verify stats
   - Check session history localStorage

2. **Unified SM-2 Migration:**
   - Seed legacy `bgde:review:<id>` keys
   - Load practice session
   - Verify automatic migration to `bgde:review_<id>_<direction>`
   - Confirm state preservation

3. **Direction-Aware Notes:**
   - Toggle language direction
   - Start practice session
   - Verify directional notes render (`notes_bg_to_de` vs `notes_de_to_bg`)
   - Check cultural context display

4. **Service Worker Precache:**
   - Build site with Hugo
   - Register SW
   - Verify fingerprinted assets cached
   - Test offline navigation

**Test File:** `tests/playwright/unified-practice-flow.spec.js`

### Phase 3.D — Documentation Refresh

**Priority: Medium**

Update core documentation to reflect unified architecture:

1. **`docs/ARCHITECTURE.md`:**
   - Document unified SM-2 schema v2
   - Explain migration strategy
   - Update localStorage schema section
   - Add service worker cache alignment notes

2. **`docs/DEVELOPMENT.md`:**
   - Update module import paths (point to unified modules)
   - Document CSP/security headers
   - Add Dependabot workflow notes
   - Remove references to deprecated `vocabulary-enhanced.json`

3. **`README.md`:**
   - Refresh feature list (unified practice, direction-aware, auto-migration)
   - Update architecture diagram if present
   - Add badge for security scanning

4. **`assets/js/README.md`:**
   - Mark `enhanced-spaced-repetition.js` as DEPRECATED (use unified)
   - Mark `enhanced-practice-session.js` as DEPRECATED (use unified)
   - Mark `practice.js` as DEPRECATED (use unified)
   - Document unified module APIs

5. **`docs/audit/README.md` (NEW):**
   - Index all audit slices
   - Link to refactoring roadmap
   - Track completion status

### Phase 3.E — Asset Optimization

**Priority: Low**

- [ ] Compress `static/images/icons/app-icon-192.png` (currently ~15KB, target <10KB)
- [ ] Compress `static/images/icons/app-icon-512.png` (currently ~45KB, target <30KB)
- [ ] Run `npm run build` and verify bundle sizes under threshold
- [ ] Document asset pipeline in `docs/ASSET_PIPELINE.md`

## Deferred / Not Required

- **Vocabulary dataset merge:** Strategy documented in `docs/VOCABULARY_MERGE_STRATEGY.md`, script outlined but not yet implemented. Defer until data validation confirms need.
- **Legacy module removal:** Keep `enhanced-*.js` and `practice.js` until all templates migrated and tests pass. Mark as deprecated in docs.
- **Server-level security headers:** CSP/HSTS meta tags in place. Server headers require hosting config (GitHub Pages, Cloudflare). Document in deployment guide.

## Acceptance Criteria

- [ ] No orphan template directories in `layouts/`
- [ ] All inline CSS/JS extracted or explicitly documented as intentional
- [ ] Unified practice flow covered by E2E tests
- [ ] Core docs reference unified modules
- [ ] Build completes without warnings
- [ ] Lighthouse scores maintain or improve

## Next Steps

1. Implement `tests/playwright/unified-practice-flow.spec.js`
2. Update `docs/ARCHITECTURE.md` and `assets/js/README.md`
3. Extract inline practice CSS/JS (optional, based on CSP violations)
4. Run full test suite and verify no regressions
