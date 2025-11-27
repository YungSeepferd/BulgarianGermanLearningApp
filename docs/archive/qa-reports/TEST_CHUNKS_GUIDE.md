# Chunked Testing Guide

## Overview

Tests have been organized into **5 focused chunks** that can be run independently. This allows systematic testing and easier debugging.

---

## 🔧 Critical Fix Applied

**Problem**: Tests used absolute paths (`/practice/`) which bypass Hugo's baseURL subpath  
**Solution**: All tests now use relative paths (`practice/`) which correctly resolve to the full URL

**Evidence**:
```
✗ page.goto("/practice/")  → http://127.0.0.1:1313/practice/ (404)
✓ page.goto("practice/")   → http://127.0.0.1:1313/BulgarianGermanLearningApp/practice/ ✅
```

---

## 📦 Test Chunks

### Chunk 1: Practice Initialization (5 tests)
**File**: `tests/playwright/chunks/01-practice-initialization.spec.js`  
**Purpose**: Verify practice page loads and initializes correctly

**Tests**:
1. Practice page loads successfully
2. Practice session initializes
3. Flashcard DOM elements exist
4. Vocabulary data loaded
5. Spaced repetition system loaded

**Run**:
```bash
npx playwright test tests/playwright/chunks/01-practice-initialization.spec.js
```

**Expected**: All 5 tests should pass

---

### Chunk 2: Flashcard Interaction (5 tests)
**File**: `tests/playwright/chunks/02-flashcard-interaction.spec.js`  
**Purpose**: Test card flipping and basic interactions

**Tests**:
1. Show answer button reveals flashcard back
2. Space key flips flashcard
3. Enter key flips flashcard
4. Flashcard displays word and translation
5. Audio button exists and is interactive

**Run**:
```bash
npx playwright test tests/playwright/chunks/02-flashcard-interaction.spec.js
```

**Expected**: 4-5 tests pass (audio may be optional)

---

### Chunk 3: Grading and Progress (5 tests)
**File**: `tests/playwright/chunks/03-grading-and-progress.spec.js`  
**Purpose**: Test grading functionality and statistics

**Tests**:
1. Grading with keyboard (grade 3)
2. All grade keys work (1-5)
3. Accuracy updates correctly
4. Progress counter increments
5. Session timer runs

**Run**:
```bash
npx playwright test tests/playwright/chunks/03-grading-and-progress.spec.js
```

**Expected**: 4-5 tests pass (timer may be optional)

---

### Chunk 4: Data Persistence (5 tests)
**File**: `tests/playwright/chunks/04-data-persistence.spec.js`  
**Purpose**: Test localStorage and state saving

**Tests**:
1. Review state saved to localStorage after grading
2. Direction-specific review states
3. Session history saved on completion
4. Language direction persisted
5. localStorage keys use bgde: prefix

**Run**:
```bash
npx playwright test tests/playwright/chunks/04-data-persistence.spec.js
```

**Expected**: 3-5 tests pass (some features may not be fully implemented)

---

### Chunk 5: Vocabulary Page (6 tests)
**File**: `tests/playwright/chunks/05-vocabulary-page.spec.js`  
**Purpose**: Test vocabulary browsing functionality

**Tests**:
1. Vocabulary page loads
2. Vocabulary cards render
3. "Üben" practice button exists
4. Vocabulary data embedded in page
5. Filters exist (if implemented)
6. Search box exists (if implemented)

**Run**:
```bash
npx playwright test tests/playwright/chunks/05-vocabulary-page.spec.js
```

**Expected**: 2-4 tests pass (some features may not be implemented)

---

## 🚀 Running Tests

### Run All Chunks
```bash
npx playwright test tests/playwright/chunks/
```

### Run Single Chunk
```bash
npx playwright test tests/playwright/chunks/01-practice-initialization.spec.js
```

### Run Specific Test
```bash
npx playwright test tests/playwright/chunks/01-practice-initialization.spec.js -g "practice page loads"
```

### Run with UI Mode (recommended for debugging)
```bash
npx playwright test tests/playwright/chunks/01-practice-initialization.spec.js --ui
```

### Run Single Browser
```bash
npx playwright test tests/playwright/chunks/01-practice-initialization.spec.js --project=chromium
```

---

## 📊 Expected Results Summary

| Chunk | File | Tests | Expected Pass | Status |
|-------|------|-------|---------------|--------|
| 1 | 01-practice-initialization.spec.js | 5 | 5/5 | ✅ Should pass |
| 2 | 02-flashcard-interaction.spec.js | 5 | 4-5/5 | ✅ Should pass |
| 3 | 03-grading-and-progress.spec.js | 5 | 4-5/5 | ✅ Should pass |
| 4 | 04-data-persistence.spec.js | 5 | 3-5/5 | ⚠️ Partial |
| 5 | 05-vocabulary-page.spec.js | 6 | 2-4/6 | ⚠️ Needs work |

**Total**: 26 tests, expecting 18-24 to pass

---

## 🐛 Debugging Failed Tests

### 1. View Test Output
```bash
npx playwright test --reporter=list
```

### 2. Check Screenshots
Failed tests automatically save screenshots to `test-results/`

### 3. View HTML Report
```bash
npx playwright show-report
```

### 4. Run with Trace
```bash
npx playwright test --trace on
```

### 5. Use Debug Mode
```bash
npx playwright test --debug
```

---

## 📝 Test Development Workflow

### 1. Pick a Chunk
Start with Chunk 1 (initialization) as it's foundational

### 2. Run Tests
```bash
npx playwright test tests/playwright/chunks/01-*.spec.js --project=chromium
```

### 3. Analyze Failures
- Check console output
- View screenshots
- Read error messages

### 4. Fix Application Code
- **Not test code** - fix the actual application logic
- Update JavaScript in `assets/js/`
- Update templates in `layouts/`

### 5. Verify Fix
```bash
# Restart Hugo server to pick up changes
pkill -f "hugo server"
hugo server -D &

# Re-run tests
npx playwright test tests/playwright/chunks/01-*.spec.js
```

### 6. Move to Next Chunk
Once all tests in a chunk pass, move to the next

---

## 🎯 Priority Order

1. **Chunk 1** (initialization) - MUST work for everything else
2. **Chunk 2** (interaction) - Core user experience
3. **Chunk 3** (grading) - Core functionality
4. **Chunk 4** (persistence) - Important but not critical
5. **Chunk 5** (vocabulary) - Secondary page

---

## 🔍 Common Issues

### Issue: Tests timeout
**Cause**: Session not initializing  
**Fix**: Check console logs, ensure JS loaded correctly

### Issue: Element not found
**Cause**: Selector changed or element doesn't exist  
**Fix**: Inspect page, update selectors in application

### Issue: 404 errors
**Cause**: Wrong URL path  
**Fix**: Use relative paths, not absolute

### Issue: Timing issues
**Cause**: Animations or async operations  
**Fix**: Add `waitForFunction` or increase timeouts

---

## 📌 Test Maintenance

### Update Tests When:
- ❌ **WRONG**: Application behavior is correct but test fails → Update TEST
- ✅ **RIGHT**: Test fails because feature is broken → Fix APPLICATION

### Never:
- Delete failing tests without fixing the application
- Make tests less strict to pass
- Skip tests permanently

### Always:
- Keep tests in sync with requirements
- Document known issues in test comments
- Run full suite before committing changes

---

## 🎉 Success Criteria

**Ready for Production**:
- Chunk 1: 5/5 passing ✅
- Chunk 2: 5/5 passing ✅
- Chunk 3: 5/5 passing ✅
- Chunk 4: 4/5 passing ✅
- Chunk 5: 3/6 passing ⚠️

**Minimum**: 22/26 tests passing (85%)
**Target**: 26/26 tests passing (100%)

---

**Last Updated**: October 21, 2025  
**Status**: Chunked tests created, ready for execution
