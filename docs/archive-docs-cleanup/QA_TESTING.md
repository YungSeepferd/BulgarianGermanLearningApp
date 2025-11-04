# QA Testing Procedures

**Last Updated:** October 27, 2025
**Status:** Active
**Maintainer:** Development Team

## Overview

This document describes the Quality Assurance (QA) testing procedures for the Bulgarian-German Learning App. These tests ensure core functionality works correctly and help prevent regressions during development.

## Test Suite Overview

We have **two complementary test suites**:

1. **Node.js Unit Tests** (`tests/qa/core-functionality.test.mjs`)
   - 28 test cases covering data integrity, business logic, and algorithms
   - Fast execution (~1-2 seconds)
   - Runs without a browser
   - Best for: Data validation, math/logic verification, regression testing

2. **Playwright E2E Tests** (`tests/qa/vocabulary-pagination-visual.spec.js`)
   - 25+ test cases covering UI/UX, interactions, and user journeys
   - Slower execution (~30-60 seconds)
   - Runs in real browsers (Chromium, Firefox, WebKit)
   - Best for: Visual regression, user workflows, cross-browser testing

---

## Quick Start

### Running Node.js Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
node --test tests/qa/core-functionality.test.mjs

# Run with verbose output
node --test --test-reporter=spec tests/qa/core-functionality.test.mjs
```

**Expected Output:**
```
✔ QA-001: Vocabulary data loads correctly (0.5ms)
✔ QA-002: All vocabulary items have required fields (2.1ms)
✔ QA-003: CEFR levels are valid (A1-C2) (0.8ms)
...
✔ 28 tests passed
```

### Running Playwright E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test tests/qa/vocabulary-pagination-visual.spec.js

# Run with UI mode (interactive debugging)
npx playwright test tests/qa/vocabulary-pagination-visual.spec.js --ui

# Run in specific browser
npx playwright test tests/qa/vocabulary-pagination-visual.spec.js --project=chromium

# Run in headed mode (see browser)
npx playwright test tests/qa/vocabulary-pagination-visual.spec.js --headed
```

**Expected Output:**
```
Running 25 tests using 1 worker

  ✓  [chromium] › QA-VIS-001: Pagination controls are visible (1.2s)
  ✓  [chromium] › QA-VIS-002: Pagination shows correct page count (0.8s)
  ✓  [chromium] › QA-NAV-001: Next button navigates to page 2 (1.5s)
  ...
  25 passed (45.3s)
```

---

## Test Coverage Matrix

### 1. Node.js Unit Tests (`core-functionality.test.mjs`)

| Test ID | Category | Description | Critical? |
|---------|----------|-------------|-----------|
| QA-001 | Data Integrity | Vocabulary data loads correctly | ✅ Yes |
| QA-002 | Data Integrity | All items have required fields | ✅ Yes |
| QA-003 | Data Integrity | CEFR levels are valid (A1-C2) | ✅ Yes |
| QA-004 | Data Integrity | Categories are valid | ✅ Yes |
| QA-005 | Data Integrity | No duplicate IDs exist | ✅ Yes |
| QA-006 | Data Integrity | All items have translations | ✅ Yes |
| QA-007 | Pagination Logic | Total page calculation is correct | ✅ Yes |
| QA-008 | Pagination Logic | Pagination slices items correctly | ✅ Yes |
| QA-009 | Pagination Logic | Edge case: Last page shows correct items | ✅ Yes |
| QA-010 | Pagination Logic | Page 1 shows first 50 items | ✅ Yes |
| QA-011 | Pagination Logic | Page boundaries are correct | ✅ Yes |
| QA-012 | Filter Logic | Level filter works correctly | ⚠️ High |
| QA-013 | Filter Logic | Category filter works correctly | ⚠️ High |
| QA-014 | Filter Logic | Search filter works correctly | ⚠️ High |
| QA-015 | Filter Logic | Combined filters work together | ⚠️ High |
| QA-016 | Language Direction | BG→DE direction works | ⚠️ High |
| QA-017 | Language Direction | DE→BG direction works | ⚠️ High |
| QA-018 | SM-2 Algorithm | Initial interval calculation | ⚠️ High |
| QA-019 | SM-2 Algorithm | Ease factor adjustment | ⚠️ High |
| QA-020 | Performance | Vocabulary data size is reasonable | 🔵 Medium |
| QA-021 | Performance | Pagination performance is acceptable | 🔵 Medium |
| QA-022 | Data Quality | All A1 words have translations | 🔵 Medium |
| QA-023 | Data Quality | Cultural notes are present | 🟡 Low |
| QA-024 | Data Quality | Etymology fields are populated | 🟡 Low |
| QA-025 | URL Parsing | Page parameter parsing works | ⚠️ High |
| QA-026 | Regression | Pagination total matches vocabulary count | ✅ Yes |
| QA-027 | Regression | No items are lost during pagination | ✅ Yes |
| QA-028 | Regression | First and last pages have correct counts | ✅ Yes |

### 2. Playwright E2E Tests (`vocabulary-pagination-visual.spec.js`)

| Test ID | Category | Description | Critical? |
|---------|----------|-------------|-----------|
| QA-VIS-001 | UI Visibility | Pagination controls are visible | ✅ Yes |
| QA-VIS-002 | UI Visibility | Pagination shows correct page count | ✅ Yes |
| QA-VIS-003 | UI Visibility | Shows exactly 50 cards on page 1 | ✅ Yes |
| QA-VIS-004 | UI Visibility | Total count shows 750 vocabularies | ✅ Yes |
| QA-VIS-005 | UI Visibility | Showing count displays 50 on first page | ✅ Yes |
| QA-NAV-001 | Navigation | Next button navigates to page 2 | ✅ Yes |
| QA-NAV-002 | Navigation | Previous button works on page 2 | ✅ Yes |
| QA-NAV-003 | Navigation | Page jump dropdown works | ✅ Yes |
| QA-NAV-004 | Navigation | Direct URL access to page 8 works | ✅ Yes |
| QA-NAV-005 | Navigation | Last page (15) shows correct content | ✅ Yes |
| QA-FILT-001 | Filter Integration | Filtering resets to page 1 | ⚠️ High |
| QA-FILT-002 | Filter Integration | Search filter updates pagination | ⚠️ High |
| QA-KEY-001 | Keyboard Shortcuts | PageDown navigates to next page | ⚠️ High |
| QA-KEY-002 | Keyboard Shortcuts | PageUp navigates to previous page | ⚠️ High |
| QA-KEY-003 | Keyboard Shortcuts | End key jumps to last page | ⚠️ High |
| QA-KEY-004 | Keyboard Shortcuts | Home key jumps to first page | ⚠️ High |
| QA-URL-001 | URL State | URL includes page parameter | ⚠️ High |
| QA-URL-002 | URL State | Browser back button restores previous page | ⚠️ High |
| QA-URL-003 | URL State | URL includes filters and page | ⚠️ High |
| QA-MOB-001 | Mobile | Pagination works on mobile viewport | ⚠️ High |
| QA-PERS-001 | Persistence | Returns to last viewed page on reload | 🔵 Medium |
| QA-A11Y-001 | Accessibility | Pagination has proper ARIA labels | 🔵 Medium |
| QA-A11Y-002 | Accessibility | Buttons are keyboard accessible | 🔵 Medium |
| QA-PERF-001 | Performance | Page navigation is fast (<500ms) | 🟡 Low |

---

## Test Execution Schedule

### During Development (Manual)
- **Run unit tests** before each commit
- **Run E2E tests** before creating a pull request
- **Run full suite** after major feature changes

### CI/CD Pipeline (Automated)
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Node.js unit tests
        run: npm test

      - name: Run Playwright E2E tests
        run: npx playwright test tests/qa/
```

### Weekly Regression Testing
- Run full test suite every Monday morning
- Review failed tests and create issues
- Update tests to cover new features

---

## Interpreting Test Results

### ✅ All Tests Passing
- **Status:** Green light for deployment
- **Action:** None required

### ⚠️ Some Tests Failing
- **Status:** Investigate and fix before deployment
- **Action:**
  1. Review test failure logs
  2. Identify root cause (code bug vs. test bug)
  3. Fix code or update test expectations
  4. Re-run tests to verify fix

### ❌ Many Tests Failing (>30%)
- **Status:** STOP - Major regression detected
- **Action:**
  1. Do NOT deploy to production
  2. Review recent changes (git diff)
  3. Consider reverting problematic commits
  4. Fix critical issues before continuing

---

## Debugging Failed Tests

### Node.js Unit Tests

**Example Failure:**
```
✗ QA-008: Pagination slices items correctly for each page
  AssertionError: Page 1 should have 50 items
  Expected: 50
  Actual: 0
```

**Debugging Steps:**
1. Add console.log to see actual values:
   ```javascript
   console.log('Page items:', pageItems);
   console.log('Length:', pageItems.length);
   ```
2. Run test again: `node --test tests/qa/core-functionality.test.mjs`
3. Check if vocabulary data is loading correctly
4. Verify pagination math: `(page - 1) * itemsPerPage`

### Playwright E2E Tests

**Example Failure:**
```
✗ QA-NAV-001: Next button navigates to page 2
  TimeoutError: Timeout 5000ms exceeded waiting for locator('.pagination-next')
```

**Debugging Steps:**
1. Run in headed mode to see browser:
   ```bash
   npx playwright test tests/qa/vocabulary-pagination-visual.spec.js --headed --project=chromium
   ```
2. Check browser console for JavaScript errors
3. Verify HTML element exists: `page.locator('.pagination-next').count()`
4. Add screenshot on failure:
   ```javascript
   await page.screenshot({ path: 'failure.png' });
   ```

---

## Adding New Tests

### When to Add Tests
- ✅ New feature added (add E2E test)
- ✅ Bug fixed (add regression test)
- ✅ New data validation rule (add unit test)
- ✅ New user workflow (add E2E test)

### Test Naming Convention
```
QA-[CATEGORY]-[NUMBER]: [Description]

Examples:
- QA-VIS-001: Pagination controls are visible
- QA-NAV-001: Next button navigates to page 2
- QA-FILT-001: Filtering resets to page 1
```

**Categories:**
- **VIS**: Visual/UI visibility tests
- **NAV**: Navigation tests
- **FILT**: Filter/search tests
- **KEY**: Keyboard shortcut tests
- **URL**: URL state tests
- **MOB**: Mobile responsiveness tests
- **PERS**: Persistence/localStorage tests
- **A11Y**: Accessibility tests
- **PERF**: Performance tests
- **DATA**: Data integrity tests
- **REG**: Regression tests

### Example: Adding a New Unit Test

```javascript
// tests/qa/core-functionality.test.mjs
test('QA-029: Vocabulary items have valid difficulty ratings', () => {
  const invalidDifficulty = vocabularyData.filter(item => {
    const diff = item.difficulty;
    return !diff || diff < 1 || diff > 5;
  });

  assert.strictEqual(
    invalidDifficulty.length,
    0,
    `Found ${invalidDifficulty.length} items with invalid difficulty (should be 1-5)`
  );
});
```

### Example: Adding a New E2E Test

```javascript
// tests/qa/vocabulary-pagination-visual.spec.js
test('QA-NAV-006: Double-clicking next doesn\'t skip pages', async ({ page }) => {
  const nextButton = page.locator('.pagination-next');

  // Double-click next button
  await nextButton.click();
  await nextButton.click();
  await page.waitForLoadState('networkidle');

  // Should be on page 2, not page 3
  const paginationInfo = page.locator('.pagination-info').first();
  const infoText = await paginationInfo.textContent();
  expect(infoText).toContain('Seite 2');
});
```

---

## Known Issues & Limitations

### Current Test Limitations
1. **No visual regression testing** - We don't detect CSS/styling changes
2. **Limited cross-browser coverage** - Tests primarily run on Chromium
3. **No load testing** - We don't test with 10,000+ vocabulary items
4. **No accessibility audit** - We check ARIA labels but not full WCAG compliance

### Future Improvements
- [ ] Add Percy.io or Chromatic for visual regression testing
- [ ] Add Axe-core for automated accessibility testing
- [ ] Add performance budgets (Lighthouse CI)
- [ ] Add cross-browser testing matrix (Chrome, Firefox, Safari, Edge)
- [ ] Add load testing with Artillery or k6
- [ ] Add mutation testing with Stryker

---

## Bug Fix: Pagination UI Visibility (October 27, 2025)

### Issue
Pagination UI element disappeared after implementing client-side pagination, making only 50 of 750 vocabularies accessible.

### Root Cause
The `updatePaginationUI()` method was hiding pagination when `this.totalPages <= 1`. This could happen if:
1. Filters reduced visible items to ≤50
2. DOM wasn't fully loaded when pagination calculated
3. Timing issue during initialization

**Problematic Code:**
```javascript
// OLD CODE (BUGGY)
const paginationNav = document.querySelector('.pagination');
if (paginationNav) {
  paginationNav.style.display = this.totalPages > 1 ? '' : 'none';
}
```

### Fix
Added `this.totalItems` property to track unfiltered total count, and changed visibility logic to always show pagination if total items exceed 50:

**Fixed Code:**
```javascript
// NEW CODE (FIXED)
const shouldShowPagination = this.totalItems > this.itemsPerPage || this.totalPages > 1;
paginationNav.style.display = shouldShowPagination ? '' : 'none';
```

**Changes Made:**
1. `vocabulary-page.js:26` - Added `this.totalItems = 0` property
2. `vocabulary-page.js:350` - Store total count: `this.totalItems = allCards.length`
3. `vocabulary-page.js:598-599` - Fixed visibility logic to use `totalItems`

### Verification
Run these tests to verify the fix:
```bash
# Unit tests - should all pass
npm test

# E2E tests - should all pass
npx playwright test tests/qa/vocabulary-pagination-visual.spec.js

# Manual verification
# 1. Visit http://localhost:1313/vocabulary/
# 2. Verify pagination controls are visible
# 3. Click "Next" - should navigate to page 2
# 4. Verify 750 vocabularies are accessible across 15 pages
```

---

## Contact & Support

**Questions about testing?**
- Review this document
- Check test file comments
- Ask in team chat

**Found a bug?**
- Create GitHub issue with test failure logs
- Include browser/environment details
- Provide steps to reproduce

**Want to improve tests?**
- Follow "Adding New Tests" guidelines above
- Create pull request with new tests
- Update this documentation

---

**Document Version:** 1.0
**Last Review:** October 27, 2025
**Next Review:** November 27, 2025
