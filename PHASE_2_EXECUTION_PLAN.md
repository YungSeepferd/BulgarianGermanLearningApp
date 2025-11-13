# Phase 2 Execution Plan: Performance & Accessibility

**Duration**: Weeks 5-8 (4 weeks)  
**Status**: Ready to plan (Phase 1 must complete first)  
**Overall Effort**: 30-40 hours (~7-10 hours/week)  
**Dependencies**: Phase 1.1 local execution (npm install, npx husky install)

---

## Executive Summary

Phase 2 focuses on **user experience optimization** through accessibility and performance improvements. Three parallel workstreams run concurrently:

- **Track A (Accessibility)**: Weeks 5-6 — Automated a11y testing + WCAG AA compliance
- **Track B (Performance)**: Weeks 6-7 — Lighthouse CI integration with performance budgets
- **Track C (Data Optimization)**: Weeks 7-8 — Vocabulary data chunking + lazy loading

**Success Criteria**: 
- ✅ 0 axe violations (accessibility)
- ✅ WCAG 2.1 AA certified
- ✅ Lighthouse 90+ (Performance, Best Practices, SEO)
- ✅ Initial payload <300KB (after chunking)

---

## Timeline Overview

```
Week 5:  [Track A.0 ▓ A.1 ▓▓] [Track B.0 ▓] 
Week 6:  [A.1 ▓▓▓▓] [B.0 ▓▓ B.3 ▓▓]
Week 7:  [B.3 ▓▓▓] [Track C.0 ▓▓▓ C.1 ▓]
Week 8:  [C.1 ▓▓▓▓ C.2 ▓▓ C.3 ▓▓ C.4 ▓]
```

---

## Phase Dependencies

### Required Before Phase 2.0 Starts
- ✅ Phase 1.0: Configuration complete
- ✅ Phase 1.2: CI/CD updated
- ✅ Phase 1.3: Documentation complete
- ⏳ **Phase 1.1: Local npm install & husky setup** (blocking)

### Phase 2.0 Dependencies
- Playwright tests configured and working
- Pre-commit hooks active
- npm scripts validated

---

## Track A: Accessibility (Weeks 5-6)

### Phase 2.0: Accessibility Test Infrastructure (Week 5, Est. 4-6 hours)

**Objective**: Set up automated accessibility testing framework

**Deliverables**:
1. New packages in package.json:
   ```json
   {
     "devDependencies": {
       "axe-core": "^4.8.0",
       "@testing-library/dom": "^9.3.4"
     }
   }
   ```

2. New test file: `tests/playwright/accessibility.spec.js` (200+ lines)
   - Test all main pages: `/`, `/vocabulary/`, `/practice/`, `/grammar/`
   - Use axe-core to detect violations
   - Check contrast ratios
   - Verify ARIA attributes
   - Report violations in test output

3. New test file: `tests/playwright/keyboard-navigation.spec.js` (100+ lines)
   - Tab key navigation through all controls
   - Enter/Space for buttons and links
   - Arrow keys for component navigation
   - Escape for closing modals
   - 0-5 keys for flashcard grading

4. New npm scripts:
   ```json
   {
     "scripts": {
       "test:a11y": "playwright test tests/playwright/accessibility.spec.js",
       "test:a11y:headed": "playwright test --headed tests/playwright/accessibility.spec.js",
       "test:a11y:debug": "playwright test --debug tests/playwright/accessibility.spec.js"
     }
   }
   ```

5. Updated `.github/workflows/ci.yml`:
   - Add a11y test step (runs after E2E tests)
   - Configuration: fail_on_violations=true
   - Report violations in CI logs

6. Documentation:
   - Update README.md with a11y section
   - Document keyboard shortcuts
   - Add accessibility testing to CONTRIBUTING.md

**Success Criteria**:
- ✅ Packages installed
- ✅ Test files created and valid
- ✅ Tests run without syntax errors
- ✅ CI integration working
- ✅ npm scripts functional
- ✅ Documentation updated

**Time Estimate**: 4-6 hours  
**Owner**: Accessibility track  
**Blocker**: None (depends on Phase 1.1 completion)

---

### Phase 2.1: WCAG 2.1 AA Compliance (Weeks 5-6, Est. 6-10 hours)

**Objective**: Achieve WCAG 2.1 Level AA certification

**Deliverables**:

1. **Accessibility Audit Report** (`docs/ACCESSIBILITY_AUDIT.md`):
   - Current state analysis
   - Issues found by axe-core
   - Issues found by manual testing
   - Categorized by type (contrast, ARIA, semantic HTML, etc.)

2. **Color Contrast Fixes** (SCSS updates):
   - Run accessibility tests to find contrast violations
   - Update `assets/scss/` variables for accessibility colors
   - Verify 4.5:1 ratio for normal text
   - Verify 3:1 ratio for large text
   - Update theme colors if needed

3. **ARIA and Semantic HTML Fixes** (Template updates):
   - Update `layouts/` templates with ARIA labels
   - Fix semantic HTML structure
   - Add role attributes where needed
   - Document ARIA usage in CONTRIBUTING.md

4. **Focus Management** (CSS/JS updates):
   - Ensure focus indicators always visible
   - Add custom focus styles to components
   - Test with keyboard-only navigation
   - Verify focus trap in modals

5. **Screen Reader Testing**:
   - Test with at least one: NVDA, JAWS, or macOS VoiceOver
   - Test flashcard interface
   - Test practice session
   - Test navigation and menus
   - Document results

6. **Regression Testing**:
   - Run all accessibility tests
   - Verify no new violations introduced
   - Check E2E tests still pass

**Success Criteria**:
- ✅ All automated a11y tests pass (npm run test:a11y)
- ✅ 0 axe violations
- ✅ Manual accessibility audit passed
- ✅ Screen reader testing successful
- ✅ WCAG AA compliance verified
- ✅ No E2E test regressions

**Time Estimate**: 6-10 hours  
**Owner**: Accessibility track  
**Blocker**: Phase 2.0 (test infrastructure)

---

## Track B: Performance (Weeks 6-7)

### Phase 2.2: Lighthouse Setup & Baseline (Week 6, Est. 3-4 hours)

**Objective**: Establish performance baseline and define budgets

**Deliverables**:

1. **Install Lighthouse CI**:
   ```bash
   npm install --save-dev @lhci/cli @lhci/server
   ```

2. **Create `lighthouserc.json`** (configuration file):
   ```json
   {
     "ci": {
       "collect": {
         "url": [
           "http://localhost:1313/",
           "http://localhost:1313/vocabulary/",
           "http://localhost:1313/practice/",
           "http://localhost:1313/grammar/"
         ],
         "numberOfRuns": 3,
         "staticDistDir": "./public"
       },
       "assert": {
         "assertMatrix": [
           {
             "matchingUrlPattern": "^http",
             "assertions": {
               "categories:performance": ["error", {"minScore": 0.85}],
               "categories:accessibility": ["error", {"minScore": 0.95}],
               "categories:best-practices": ["error", {"minScore": 0.90}],
               "categories:seo": ["error", {"minScore": 0.90}]
             }
           }
         ]
       }
     }
   }
   ```

3. **Run Baseline Audit**:
   - Start dev server: `npm run dev`
   - Run Lighthouse: `npx lhci collect --config=lighthouserc.json`
   - Document scores for each page
   - Identify slow resources

4. **Create Performance Report** (`docs/PERFORMANCE_BASELINE.md`):
   - Scores for each page
   - Metrics: FCP, LCP, CLS, TTI
   - Identifying bottlenecks
   - Optimization recommendations

5. **Add npm scripts**:
   ```json
   {
     "scripts": {
       "lighthouse": "lhci autorun",
       "lighthouse:collect": "lhci collect",
       "lighthouse:assert": "lhci assert",
       "lighthouse:upload": "lhci upload"
     }
   }
   ```

6. **Documentation**:
   - Update README with performance section
   - Add Lighthouse explanation to CONTRIBUTING.md
   - Document performance budgets

**Success Criteria**:
- ✅ Lighthouse CI installed
- ✅ lighthouserc.json created
- ✅ Baseline scores documented
- ✅ Performance report generated
- ✅ Budgets defined and justified
- ✅ npm scripts working

**Time Estimate**: 3-4 hours  
**Owner**: Performance track  
**Blocker**: None (can run in parallel with Track A)

---

### Phase 2.3: Lighthouse CI Integration (Weeks 6-7, Est. 2-3 hours)

**Objective**: Integrate performance monitoring into GitHub Actions

**Deliverables**:

1. **Update `.github/workflows/ci.yml`**:
   - Add Lighthouse CI step
   - Position after E2E tests
   - Configure to fail on budget violation
   - Enable GitHub status checks

2. **GitHub Actions Configuration**:
   ```yaml
   - name: Build for Lighthouse
     run: npm run build
     
   - name: Run Lighthouse CI
     uses: treosh/lighthouse-ci-action@v10
     with:
       configPath: './lighthouserc.json'
       uploadArtifacts: true
       temporaryPublicStorage: true
   ```

3. **Performance Monitoring**:
   - Lighthouse runs on every push to main
   - Lighthouse runs on every PR
   - Status check fails if budgets violated
   - Results stored in GitHub Actions artifacts

4. **Optional: Lighthouse Server**:
   - Consider https://lighthouseapp.com/ for historical tracking
   - Set up GitHub token for uploads (optional)
   - Configure webhook notifications

5. **Documentation**:
   - Update CI/CD documentation
   - Explain budget enforcement
   - Document failure resolution

**Success Criteria**:
- ✅ CI/CD workflow updated
- ✅ Lighthouse runs on every push
- ✅ Budget enforcement working
- ✅ Status checks visible on GitHub
- ✅ Performance reports accessible
- ✅ No false positives

**Time Estimate**: 2-3 hours  
**Owner**: Performance track  
**Blocker**: Phase 2.2 (baseline established)

---

## Track C: Data Optimization (Weeks 7-8)

### Phase 2.4: Vocabulary Data Chunking (Weeks 7-8, Est. 8-12 hours)

**Objective**: Split large vocabulary data and implement lazy loading

**Deliverables**:

1. **Analysis Phase** (2 hours):
   - Load and parse `data/vocabulary.json` (current: ~968KB)
   - Analyze structure and entry count
   - Break down by CEFR levels (A1, A2, B1, B2, C1, C2)
   - Count entries per category
   - Determine optimal chunk size
   - Decision: Split by CEFR level (better for learning progression)

2. **Chunking Implementation** (3-4 hours):
   - Create split script: `scripts/chunk-vocabulary.mjs`
   - Generate chunk files:
     - `data/vocabulary-a1.json`
     - `data/vocabulary-a2.json`
     - `data/vocabulary-b1.json`
     - `data/vocabulary-b2.json`
     - `data/vocabulary-c1-c2.json`
     - `data/vocabulary-index.json` (metadata)
   - Verify no data loss
   - Create chunk manifest

3. **Lazy Loading Implementation** (3-4 hours):
   - Update `assets/js/unified-practice-session.js`:
     - Implement chunk loader
     - Cache loaded chunks in memory
     - Lazy-load on demand
     - Handle missing chunks gracefully
   - Update `assets/js/vocab-cards.js`:
     - Filter by available chunks
     - Show loading indicator
   - Add storage usage tracking

4. **Template Updates** (1-2 hours):
   - Update `layouts/flashcards.html`:
     - Remove inline full vocabulary
     - Embed vocabulary-index.json only
     - Initialize chunk loader
   - Update `layouts/vocab-grid.html`:
     - Add loading states
     - Handle dynamic data
   - Test embedded data still works

5. **Performance Testing** (2 hours):
   - Measure initial page load time (before/after)
   - Test lazy loading works
   - Verify no broken functionality
   - Benchmark chunk loading speed
   - Create performance report

6. **Documentation** (1 hour):
   - Update data schema documentation
   - Document chunking strategy
   - Add troubleshooting guide
   - Update README

**Success Criteria**:
- ✅ vocabulary.json split into CEFR-based chunks
- ✅ No data loss
- ✅ Lazy loading implemented and working
- ✅ Initial payload <300KB
- ✅ All functionality preserved
- ✅ E2E tests pass
- ✅ Performance improved by 30%+
- ✅ Documentation updated

**Time Estimate**: 8-12 hours  
**Owner**: Data optimization track  
**Blocker**: None (can run in parallel)

---

## Implementation Order

### Week 5 (Priority: A > B > C)
1. **Phase 2.0 (Track A)**: Accessibility test infrastructure [4-6 hours]
2. **Phase 2.1 (Track A)**: Start WCAG compliance work [3-4 hours from 6-10]
3. **Phase 2.2 (Track B)**: Lighthouse baseline [3-4 hours]

**Total Week 5**: ~10-14 hours

### Week 6 (Priority: A > B > C)
1. **Phase 2.1 (Track A)**: Finish WCAG compliance [3-6 hours remaining]
2. **Phase 2.3 (Track B)**: Lighthouse CI integration [2-3 hours]
3. **Phase 2.4 (Track C)**: Start analysis phase [2 hours]

**Total Week 6**: ~10-14 hours

### Week 7 (Priority: C > B completion)
1. **Phase 2.4 (Track C)**: Chunking implementation [3-4 hours]
2. **Phase 2.4 (Track C)**: Lazy loading implementation [3-4 hours]
3. **Track B**: Final testing and polish [1-2 hours]

**Total Week 7**: ~10-12 hours

### Week 8 (Priority: C completion)
1. **Phase 2.4 (Track C)**: Template updates [1-2 hours]
2. **Phase 2.4 (Track C)**: Performance testing [2 hours]
3. **Phase 2.4 (Track C)**: Documentation [1 hour]
4. **All Tracks**: Integration testing and polish [2-3 hours]

**Total Week 8**: ~8-10 hours

**Total Phase 2**: ~38-50 hours (average 9.5-12.5 hours/week)

---

## Dependencies & Blockers

### Blocking Dependencies
- ⏳ **Phase 1.1 must complete** (npm install, husky setup)
  - Required before Phase 2.0 starts
  - Estimated 30 min after local push

### Track Dependencies
- Phase 2.0 → Phase 2.1 (a11y tests needed for compliance audit)
- Phase 2.2 → Phase 2.3 (baseline needed before CI integration)
- No dependency between tracks (A, B, C can run in parallel)

### External Blockers
- Access to screen reader (for Phase 2.1)
- Lighthouse server (optional, for Phase 2.3)
- Performance baseline (for chunking decisions in Phase 2.4)

---

## Success Metrics

### Accessibility Track (Track A)
- ✅ 0 axe violations across all pages
- ✅ 100% WCAG 2.1 AA compliance (verified by auditor)
- ✅ 100% keyboard navigation works
- ✅ Screen reader tested and working
- ✅ All accessibility tests passing

### Performance Track (Track B)
- ✅ Lighthouse Performance score: 90+
- ✅ Lighthouse Accessibility score: 95+ (after Track A)
- ✅ Lighthouse Best Practices: 90+
- ✅ Lighthouse SEO: 90+
- ✅ Performance budgets enforced in CI

### Data Optimization Track (Track C)
- ✅ Initial payload: <300KB (was 968KB)
- ✅ Chunk loading: <200ms per chunk
- ✅ No functionality broken
- ✅ All E2E tests pass
- ✅ Vocabulary search still works
- ✅ Performance improvement: 30%+

### Overall Phase 2
- ✅ All tracks complete by end of Week 8
- ✅ 0 regressions from Phase 1
- ✅ All documentation updated
- ✅ CI/CD enforces new standards
- ✅ Ready for Phase 3

---

## Deliverables Checklist

### Phase 2.0
- [ ] package.json updated with axe-core, @testing-library/dom
- [ ] tests/playwright/accessibility.spec.js created (200+ lines)
- [ ] tests/playwright/keyboard-navigation.spec.js created (100+ lines)
- [ ] npm scripts added (test:a11y, test:a11y:headed, test:a11y:debug)
- [ ] .github/workflows/ci.yml updated with a11y tests
- [ ] README.md updated with accessibility section
- [ ] CONTRIBUTING.md updated with a11y testing guidelines

### Phase 2.1
- [ ] docs/ACCESSIBILITY_AUDIT.md created
- [ ] All color contrast issues fixed
- [ ] All ARIA labels added
- [ ] Semantic HTML corrected
- [ ] Focus indicators visible
- [ ] Screen reader testing completed
- [ ] All a11y tests passing (npm run test:a11y)

### Phase 2.2
- [ ] package.json updated with @lhci/cli, @lhci/server
- [ ] lighthouserc.json created
- [ ] Baseline audit completed
- [ ] docs/PERFORMANCE_BASELINE.md created
- [ ] npm scripts added (lighthouse, lighthouse:collect, etc.)
- [ ] README updated with performance section

### Phase 2.3
- [ ] .github/workflows/ci.yml updated with Lighthouse step
- [ ] GitHub Actions configuration working
- [ ] Performance monitoring active
- [ ] Status checks visible on PRs
- [ ] Budget enforcement tested

### Phase 2.4
- [ ] vocabulary.json analysis completed
- [ ] Chunk files created (vocabulary-a1.json, etc.)
- [ ] scripts/chunk-vocabulary.mjs created
- [ ] Lazy loading implemented
- [ ] Templates updated
- [ ] Performance testing completed
- [ ] docs/VOCABULARY_CHUNKING.md created

---

## Known Considerations

### Accessibility
- axe-core will catch ~80% of issues; manual testing essential
- Screen reader testing requires actual device/software
- WCAG AA is achievable; AAA (highest level) is more restrictive
- Keyboard navigation testing must cover all interactive elements

### Performance
- Lighthouse scores vary based on network/device simulation
- Budgets should be realistic (90+ is ambitious but achievable)
- Chunking will improve initial load but adds complexity
- Test on real slow networks (Chrome DevTools throttling)

### Data Optimization
- CEFR-based chunking aligns with learning progression
- Lazy loading adds minor complexity to practice session
- Vocabulary index must be lightweight
- Consider caching strategy for mobile users

---

## References

- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Testing Library](https://github.com/Playwright-Testing-Library)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse CI Documentation](https://github.com/GoogleChromeLabs/lighthouse-ci)
- [Web Performance Best Practices](https://web.dev/performance/)

---

## Timeline Summary

| Week | Focus | Deliverables | Status |
|------|-------|--------------|--------|
| 5 | A.0 + A.1 start + B.2 | Test infra, A11y audit start, Lighthouse baseline | ⏳ Ready |
| 6 | A.1 finish + B.3 + C.0 start | WCAG AA complete, CI integration, data analysis | ⏳ Ready |
| 7 | C.1 + C.2 + B polish | Chunking + lazy loading, performance polish | ⏳ Ready |
| 8 | C finish + integration | Data optimization complete, Phase 2 closure | ⏳ Ready |

---

## Getting Started

After Phase 1.1 completes (npm install + husky install locally):

1. **Verify Phase 1 complete**:
   ```bash
   npm run lint:js      # Should pass
   npm run test:unit    # 25/25 passing
   npm run build        # Should succeed
   ```

2. **Start Phase 2.0**:
   ```bash
   npm install axe-core @testing-library/dom
   # Then create test files per Phase 2.0 deliverables
   ```

3. **Run accessibility tests**:
   ```bash
   npm run test:a11y    # First run, will fail (expected)
   npm run test:a11y:headed  # Visual debugging
   ```

4. **Start Lighthouse baseline**:
   ```bash
   npm run dev          # Terminal 1
   npm run lighthouse   # Terminal 2
   ```

---

**Created**: November 13, 2025  
**Status**: Ready for implementation after Phase 1.1  
**Next Review**: After Phase 1 local execution complete  
**Questions**: See PHASE_EXECUTION_ROADMAP.md for 12-week context
