# Complete Testing Guide

**Comprehensive testing documentation for the Bulgarian-German Learning App**  
*Consolidates: QA_TESTING.md, QA_TESTING_STRATEGY.md, TESTING.md, TEST_CHUNKS_GUIDE.md, MANUAL_TESTING_CHECKLIST_PAGINATION_FIX.md*

---

## Overview

This guide covers all testing approaches for our Hugo-based language learning application, from quick smoke tests to comprehensive end-to-end testing with Playwright.

## Testing Philosophy

**Focus**: Lightweight, repeatable checks aligned with Hugo + vanilla JS stack  
**Strategy**: Smoke tests during development, comprehensive coverage before releases  
**Tools**: Node.js unit tests + Playwright E2E tests for complete coverage

---

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install
```

### Daily Testing Commands
```bash
# Quick smoke test
npm test                    # Fast unit tests (~2 seconds)

# Full test suite  
npm run test:all           # Unit + E2E tests (~60 seconds)

# Visual testing
npm run test:ui            # Playwright with browser UI

# Debug mode
npm run test:debug         # Interactive debugging
```

---

## Test Suite Architecture

### 1. Node.js Unit Tests (`tests/qa/core-functionality.test.mjs`)
- **28 test cases** covering data integrity and business logic
- **Fast execution** (~1-2 seconds)
- **No browser required** - pure JavaScript testing
- **Best for**: Data validation, algorithms, regression testing

### 2. Playwright E2E Tests (`tests/qa/vocabulary-pagination-visual.spec.js`)
- **25+ test cases** covering UI/UX and user journeys
- **Real browser testing** (Chromium, Firefox, WebKit)
- **Visual regression** detection
- **Best for**: User workflows, cross-browser compatibility

### 3. Search Functionality Tests (`tests/playwright/search-functionality.spec.js`)
- **4 comprehensive test scenarios** for search regression prevention
- **Loading order verification** to catch module initialization issues
- **Console logging capture** for debugging

---

## Testing Priorities

### P0 - Critical User Flows (Must Work)
1. **Complete Practice Session**: Home → Vocabulary → Practice → Finish
2. **Language Toggle**: BG→DE ↔ DE→BG switching
3. **Flashcard Interaction**: Flip cards and grade answers
4. **Progress Persistence**: LocalStorage data integrity
5. **Spaced Repetition**: SM-2 algorithm correctness

### P1 - Core Features
1. **Vocabulary Browsing**: Category and level filtering
2. **Search Functionality**: Real-time vocabulary search
3. **Individual Practice**: Single word practice sessions
4. **Session Statistics**: Accuracy and progress tracking
5. **Navigation**: Menu and page transitions

### P2 - Enhanced Features
1. **Speech Recognition**: Audio pronunciation feedback
2. **Cultural Context**: Grammar and cultural notes
3. **Keyboard Shortcuts**: Accessibility features
4. **Mobile Responsiveness**: Touch interactions
5. **PWA Features**: Offline functionality

---

## Smoke Testing (Daily Development)

### Hugo Server Health
```bash
# Must start without warnings
hugo server -D --logLevel=debug

# Check for template errors in console
# Verify no 404s for assets
# Confirm hot reload works
```

### Production Build Verification  
```bash
# Must complete successfully
npm run build

# Check output directory
ls -la public/

# Verify minification worked
du -sh public/
```

### JavaScript Syntax Validation
```bash
# ES module syntax check
npm run lint:esm

# Individual file validation
node --experimental-warnings --check assets/js/flashcards.js
```

---

## Unit Testing

### Test Structure
```javascript
// Example unit test structure
describe('Vocabulary Data Integrity', () => {
  test('all vocabulary items have required fields', () => {
    const vocabulary = loadTestData();
    vocabulary.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('word');
      expect(item).toHaveProperty('translation');
      expect(item).toHaveProperty('level');
    });
  });
});
```

### Core Test Categories

**Data Validation Tests**
- Vocabulary JSON structure integrity
- Grammar data completeness
- CEFR level consistency
- Category standardization

**Algorithm Tests**
- SM-2 spaced repetition calculations
- Progress tracking accuracy  
- Session statistics computation
- Language direction handling

**Utility Function Tests**
- Text sanitization functions
- Date/time calculations
- LocalStorage helpers
- Configuration parsing

### Running Unit Tests
```bash
# All unit tests
npm test

# Specific test file
npm test -- --grep "vocabulary"

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## End-to-End Testing with Playwright

### Test Environment Setup
```javascript
// playwright.config.js
export default {
  testDir: './tests/playwright',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:1313',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

### Critical User Journey Tests

**Complete Practice Flow**
```javascript
test('complete vocabulary practice session', async ({ page }) => {
  await page.goto('/practice/');
  
  // Verify flashcard loads
  await expect(page.locator('.flashcard')).toBeVisible();
  
  // Test card interaction
  await page.click('.flashcard-front');
  await expect(page.locator('.flashcard-back')).toBeVisible();
  
  // Grade the card
  await page.click('[data-grade="4"]');
  
  // Verify progress update
  await expect(page.locator('.progress-counter')).toContainText('2/20');
});
```

**Language Direction Toggle**
```javascript
test('language direction switching', async ({ page }) => {
  await page.goto('/vocabulary/');
  
  // Check initial direction
  const initialDirection = await page.textContent('[data-direction]');
  
  // Toggle direction
  await page.click('#language-toggle');
  await page.click('#confirm-toggle');
  
  // Verify direction changed
  const newDirection = await page.textContent('[data-direction]');
  expect(newDirection).not.toBe(initialDirection);
  
  // Check localStorage persistence
  const stored = await page.evaluate(() => 
    localStorage.getItem('bgde:language-direction')
  );
  expect(stored).toBe(newDirection);
});
```

### Visual Regression Testing
```javascript
test('vocabulary page visual consistency', async ({ page }) => {
  await page.goto('/vocabulary/');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot for comparison
  await expect(page).toHaveScreenshot('vocabulary-page.png');
  
  // Test responsive layouts
  await page.setViewportSize({ width: 360, height: 640 });
  await expect(page).toHaveScreenshot('vocabulary-mobile.png');
});
```

### Running E2E Tests
```bash
# All E2E tests
npx playwright test

# Specific test file
npx playwright test vocabulary-pagination-visual.spec.js

# Interactive mode
npx playwright test --ui

# Debug mode with browser
npx playwright test --debug

# Generate test reports
npx playwright test --reporter=html
```

---

## Search Functionality Testing

### Regression Prevention
The search functionality has specific tests to prevent loading order issues:

```javascript
test('search input filters vocabulary cards', async ({ page }) => {
  await page.goto('/vocabulary/');
  
  // Wait for vocabulary grid
  await page.waitForSelector('#vocabulary-grid .vocab-card');
  
  // Count initial cards
  const initialCount = await page.locator('.vocab-card:visible').count();
  
  // Test search
  await page.fill('#search-input', 'дом');
  await page.waitForTimeout(500); // Debounce
  
  // Verify filtering
  const filteredCount = await page.locator('.vocab-card:visible').count();
  expect(filteredCount).toBeLessThan(initialCount);
  
  // Check counter update
  const showingCount = await page.textContent('#showing-count');
  expect(parseInt(showingCount)).toBe(filteredCount);
});
```

### Module Loading Verification
```javascript
test('vocabulary modules load correctly', async ({ page }) => {
  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('[VocabPage]')) {
      logs.push(msg.text());
    }
  });
  
  await page.goto('/vocabulary/');
  await page.waitForTimeout(2000);
  
  // Verify initialization logs
  const initLogs = logs.filter(log => log.includes('Init attempt'));
  expect(initLogs.length).toBeGreaterThan(0);
  
  // Check for successful initialization
  const successLogs = logs.filter(log => 
    log.includes('Successfully initialized') || 
    log.includes('basic search fallback')
  );
  expect(successLogs.length).toBeGreaterThan(0);
});
```

---

## Performance Testing

### Build Performance Monitoring
```bash
# Measure build time
time npm run build

# Profile Hugo build
hugo --templateMetrics --templateMetricsHints

# Check bundle sizes
du -sh public/assets/
```

### Runtime Performance Tests
```javascript
test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/vocabulary/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second limit
});

test('search response time', async ({ page }) => {
  await page.goto('/vocabulary/');
  await page.waitForSelector('#search-input');
  
  const startTime = Date.now();
  await page.fill('#search-input', 'test');
  await page.waitForFunction(() => 
    document.querySelectorAll('.vocab-card:visible').length > 0
  );
  const searchTime = Date.now() - startTime;
  
  expect(searchTime).toBeLessThan(500); // 500ms limit
});
```

---

## Mobile & Accessibility Testing

### Touch Interaction Tests
```javascript
test('mobile flashcard interactions', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/practice/');
  
  // Test touch targets
  const flashcard = page.locator('.flashcard');
  await expect(flashcard).toBeVisible();
  
  // Tap to flip
  await flashcard.tap();
  await expect(page.locator('.flashcard-back')).toBeVisible();
  
  // Test grade buttons size
  const gradeButtons = page.locator('.grade-btn');
  const boundingBox = await gradeButtons.first().boundingBox();
  expect(boundingBox.width).toBeGreaterThan(44); // 44px minimum
  expect(boundingBox.height).toBeGreaterThan(44);
});
```

### Keyboard Navigation Tests
```javascript
test('keyboard accessibility', async ({ page }) => {
  await page.goto('/practice/');
  
  // Test space bar to flip
  await page.keyboard.press('Space');
  await expect(page.locator('.flashcard-back')).toBeVisible();
  
  // Test number keys for grading
  await page.keyboard.press('4');
  await expect(page.locator('.progress-counter')).toContainText('2/');
  
  // Test tab navigation
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement.tagName);
  expect(['BUTTON', 'INPUT', 'A']).toContain(focused);
});
```

---

## Test Data Management

### Test Data Structure
```text
tests/
├── fixtures/
│   ├── vocabulary-sample.json    # Sample vocabulary data
│   ├── user-progress.json        # Sample progress data
│   └── session-history.json      # Sample session data
├── helpers/
│   ├── test-utils.js             # Common test utilities
│   ├── data-generators.js        # Test data generators
│   └── mock-storage.js           # localStorage mocking
└── qa/
    ├── core-functionality.test.mjs  # Unit tests
    └── vocabulary-pagination-visual.spec.js  # E2E tests
```

### Test Utilities
```javascript
// test-utils.js
export const loadTestVocabulary = () => {
  return JSON.parse(fs.readFileSync('tests/fixtures/vocabulary-sample.json'));
};

export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value,
    removeItem: (key) => delete store[key],
    clear: () => Object.keys(store).forEach(key => delete store[key])
  };
};

export const generateTestSession = (wordCount = 5) => {
  const words = loadTestVocabulary().slice(0, wordCount);
  return {
    id: `test-session-${Date.now()}`,
    words,
    startTime: new Date().toISOString(),
    direction: 'bg-de'
  };
};
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.128.0'
          extended: true
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run unit tests
        run: npm test
        
      - name: Start Hugo server
        run: npm run dev &
        
      - name: Wait for server
        run: npx wait-on http://localhost:1313
        
      - name: Run E2E tests
        run: npx playwright test
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/
```

---

## Debugging & Troubleshooting

### Common Test Failures

**"Test timeout"**
- Increase timeout in test configuration
- Check for infinite loading states
- Verify server is running and accessible

**"Element not found"**
- Add explicit waits: `waitForSelector()`
- Check element selectors in browser DevTools
- Verify content loads before interaction

**"Flaky tests"**
- Add proper wait conditions
- Use `waitForLoadState('networkidle')`
- Implement retry logic for unstable elements

### Debug Commands
```bash
# Run single test with debug
npx playwright test --debug vocabulary-search

# Generate trace files
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace trace.zip

# Run with headed browser
npx playwright test --headed

# Record test videos
npx playwright test --video on
```

### Test Environment Issues
```bash
# Clear test cache
rm -rf node_modules/.cache/

# Reset Playwright
npx playwright install --force

# Check Hugo server
curl http://localhost:1313/vocabulary/

# Verify test data
node -e "console.log(require('./tests/fixtures/vocabulary-sample.json').length)"
```

---

## Best Practices

### Test Organization
- **Group related tests** in describe blocks
- **Use descriptive test names** that explain expected behavior
- **Keep tests independent** - no shared state between tests
- **Use fixtures** for consistent test data

### Performance Considerations
- **Parallel execution** for E2E tests when possible
- **Mock external dependencies** in unit tests
- **Minimize page loads** by testing multiple features per session
- **Use fast selectors** - prefer `data-testid` over complex CSS

### Maintenance Guidelines
- **Update tests** when features change
- **Remove obsolete tests** for removed features
- **Document test purpose** in comments
- **Regular test cleanup** to prevent accumulation

---

This comprehensive testing guide ensures reliable, maintainable test coverage for all aspects of the Bulgarian-German Learning App while supporting efficient development workflows.