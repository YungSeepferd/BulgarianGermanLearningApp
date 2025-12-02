# Comprehensive QA Testing Strategy

## Overview
This document outlines a systematic approach to testing the Bulgarian-German Learning App using Playwright to ensure all functionality works as intended.

## Testing Priorities

### P0 - Critical User Flows (Must Work)
1. **Home → Vocabulary → Practice → Complete Session**
2. **Language Toggle (BG→DE ↔ DE→BG)**
3. **Flashcard Flip & Grade**
4. **Progress Tracking & LocalStorage Persistence**
5. **Spaced Repetition Algorithm (SM-2)**

### P1 - Core Features
1. **Vocabulary Browsing & Filtering**
2. **Search Functionality**
3. **Category & Level Filters**
4. **Practice Single Word (Üben button)**
5. **Session Statistics Display**

### P2 - Enhanced Features
1. **Cultural & Linguistic Notes**
2. **Audio Pronunciation**
3. **Keyboard Shortcuts**
4. **Responsive Design (Mobile/Desktop)**
5. **PWA/Offline Mode**

## Test Suite Structure

```
tests/playwright/
├── critical/
│   ├── 01-home-to-practice-flow.spec.js
│   ├── 02-flashcard-session.spec.js
│   ├── 03-language-toggle.spec.js
│   └── 04-spaced-repetition.spec.js
├── features/
│   ├── vocabulary-browsing.spec.js
│   ├── vocabulary-filters.spec.js
│   ├── single-word-practice.spec.js
│   └── session-stats.spec.js
├── interactions/
│   ├── keyboard-shortcuts.spec.js
│   ├── button-clicks.spec.js
│   └── form-interactions.spec.js
├── edge-cases/
│   ├── empty-states.spec.js
│   ├── error-handling.spec.js
│   ├── data-loading-failures.spec.js
│   └── localStorage-issues.spec.js
└── visual/
    ├── responsive-layouts.spec.js
    └── animations.spec.js
```

## Testing Approach

### 1. Test Isolation
- Each test should be independent
- Reset localStorage before each test
- Use fresh browser context
- Mock external dependencies when needed

### 2. Stability Patterns
```javascript
// Wait for app initialization
await page.waitForFunction(() => {
  return window.UnifiedPracticeSession && 
         document.getElementById('practice-session');
});

// Wait for data load
await page.waitForSelector('#flashcard', { state: 'visible' });

// Wait for animations
await page.waitForTimeout(300); // After transitions
```

### 3. Assertion Strategies
```javascript
// Visual state
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Content validation
const text = await element.textContent();
expect(text).toMatch(/pattern/);

// DOM state
await expect(element).toHaveAttribute('aria-pressed', 'true');

// Data validation
const stored = await page.evaluate(() => 
  JSON.parse(localStorage.getItem('bgde:review_state'))
);
expect(stored).toBeDefined();
```

### 4. Error Detection
- Console error monitoring
- Network request failures
- JavaScript exceptions
- Missing DOM elements
- Incorrect data flow

## Critical Test Scenarios

### Scenario 1: Complete Practice Session
```
1. Navigate to /vocabulary/
2. Click "Üben" on a word
3. Verify redirect to /practice/
4. Verify card displays correctly
5. Click "Show Answer"
6. Verify back shows
7. Grade with keyboard (1-5)
8. Verify progress updates
9. Complete 3+ cards
10. Verify session complete screen
11. Verify stats accuracy
12. Verify localStorage saved
```

### Scenario 2: Language Direction Change
```
1. Start practice session (BG→DE)
2. Complete 1 card
3. Toggle to DE→BG
4. Verify card flips direction
5. Verify notes change
6. Complete another card
7. Verify both directions saved separately
```

### Scenario 3: Spaced Repetition Flow
```
1. Grade card as "easy" (5)
2. Verify next_review date set
3. Check localStorage state
4. Verify interval calculation
5. Mock time advance
6. Verify card becomes due
7. Practice again
8. Verify interval increases
```

### Scenario 4: Data Loading & Errors
```
1. Block JSON endpoint
2. Verify fallback to inline data
3. Verify error messages
4. Verify graceful degradation
5. Test with empty vocabulary
6. Test with malformed JSON
```

## Implementation Plan

### Phase 1: Critical Flows (Week 1)
- [x] Fix flashcard-retry.spec.js
- [ ] Implement home-to-practice-flow.spec.js
- [ ] Implement flashcard-session.spec.js
- [ ] Implement language-toggle.spec.js

### Phase 2: Feature Coverage (Week 2)
- [ ] Vocabulary browsing tests
- [ ] Filter & search tests
- [ ] Single word practice tests
- [ ] Stats display tests

### Phase 3: Edge Cases (Week 3)
- [ ] Empty state handling
- [ ] Error scenarios
- [ ] LocalStorage edge cases
- [ ] Network failures

### Phase 4: Polish (Week 4)
- [ ] Visual regression tests
- [ ] Responsive design tests
- [ ] Performance benchmarks
- [ ] Accessibility audits

## Test Execution

### Local Development
```bash
# Run all tests
npm test

# Run specific suite
npx playwright test tests/playwright/critical/

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Run Playwright Tests
  run: |
    npm run build
    PW_REUSE_SERVER=1 npx playwright test
```

## Success Criteria

### Test Coverage
- ✅ 100% of P0 flows covered
- ✅ 80%+ of P1 features covered
- ✅ 50%+ of P2 features covered
- ✅ Key edge cases handled

### Test Quality
- ✅ <5% flaky test rate
- ✅ Clear failure messages
- ✅ Fast execution (<2 min total)
- ✅ Maintainable test code

### App Quality
- ✅ 0 console errors in happy paths
- ✅ Graceful error handling
- ✅ Data persistence works
- ✅ All user flows complete successfully

## Next Steps

1. **Audit Current State**: Document all known issues
2. **Fix Blockers**: Address initialization issues causing test timeouts
3. **Implement Tests**: Build out comprehensive test suite
4. **Run & Iterate**: Execute tests, fix bugs, refine tests
5. **Automate**: Integrate into CI/CD pipeline
6. **Monitor**: Track test results over time

## Known Issues to Test

Based on previous sessions:
- [ ] Practice session initialization timing
- [ ] Window object availability (`enhancedPracticeSession` vs `UnifiedPracticeSession`)
- [ ] Flashcard flip animation consistency
- [ ] Response buttons visibility
- [ ] Progress counter updates
- [ ] LocalStorage key naming (`bgde:*` prefix)
- [ ] Language toggle event propagation
- [ ] SM-2 state migration
- [ ] Audio button availability
- [ ] Mobile viewport issues

## Test Data Strategy

### Fixtures
```javascript
// tests/fixtures/vocabulary.json
[
  {
    "id": "test-001",
    "word": "здравей",
    "translation": "hallo",
    "level": "A1",
    "category": "Begrüßung"
  }
]
```

### Test Helpers
```javascript
// tests/helpers/practice-session.js
export async function startPracticeSession(page) {
  await page.goto('/practice/');
  await page.waitForSelector('#flashcard');
  return {
    flipCard: () => page.click('#show-answer'),
    gradeCard: (grade) => page.keyboard.press(String(grade))
  };
}
```

## Documentation Updates

After test implementation:
- [ ] Update README with test instructions
- [ ] Document test patterns in CONTRIBUTING.md
- [ ] Create troubleshooting guide
- [ ] Add test coverage badges
