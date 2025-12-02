# MCP Playwright Functional Testing Plan

**Comprehensive manual testing protocol using MCP browser automation tools**

## Overview

This document outlines a systematic approach to functional testing of the Bulgarian-German Learning App using MCP (Model Context Protocol) Playwright browser automation tools. This testing protocol ensures comprehensive coverage of all features, user flows, and edge cases.

## Testing Environment Setup

### Prerequisites
```bash
# Ensure Hugo server is running
npm run dev
# Server should be accessible at http://localhost:1313/
```

### MCP Tools Available
- `mcp__mcp-playwright__browser_navigate` - Navigate to URLs
- `mcp__mcp-playwright__browser_snapshot` - Capture accessibility tree
- `mcp__mcp-playwright__browser_click` - Click elements
- `mcp__mcp-playwright__browser_type` - Type text into fields
- `mcp__mcp-playwright__browser_take_screenshot` - Visual verification
- `mcp__mcp-playwright__browser_console_messages` - Check for errors
- `mcp__mcp-playwright__browser_evaluate` - Execute JavaScript

---

## Test Suite Structure

### 1. Initial Load & Home Page Tests
### 2. Navigation & Routing Tests
### 3. Vocabulary Browsing Tests
### 4. Flashcard Practice Tests
### 5. Spaced Repetition Tests
### 6. Language Direction Toggle Tests
### 7. Search & Filter Tests
### 8. Accessibility Tests
### 9. Mobile Responsiveness Tests
### 10. Offline Functionality Tests
### 11. LocalStorage Persistence Tests
### 12. Performance Tests

---

## Test Suite 1: Initial Load & Home Page

### T1.1: Homepage Loads Successfully
**Objective**: Verify homepage loads without errors

**Steps**:
1. Navigate to `http://localhost:1313/`
2. Capture page snapshot
3. Check console for errors
4. Verify page title contains "Bulgarian"

**Expected Results**:
- Page loads within 3 seconds
- No console errors
- Navigation menu visible
- Hero section displays

**MCP Tools**: `browser_navigate`, `browser_snapshot`, `browser_console_messages`

### T1.2: Critical Resources Load
**Objective**: Verify CSS, JS, and data files load

**Steps**:
1. Navigate to homepage
2. Check network requests for 200 status
3. Verify `vocabulary.json` loads
4. Check CSS files load

**Expected Results**:
- All resources return 200 status
- vocabulary.json size ~968KB
- No 404 errors in console

**MCP Tools**: `browser_navigate`, `browser_console_messages`, `browser_evaluate`

### T1.3: Main Navigation Visible
**Objective**: Verify all navigation links present

**Steps**:
1. Navigate to homepage
2. Capture snapshot
3. Identify navigation menu elements
4. Verify links: Home, Vocabulary, Practice, Grammar

**Expected Results**:
- Navigation menu renders
- All links are clickable
- Active page indicator works

**MCP Tools**: `browser_snapshot`, `browser_click`

---

## Test Suite 2: Navigation & Routing

### T2.1: Navigate to Vocabulary Page
**Objective**: Test vocabulary page navigation

**Steps**:
1. From homepage, click "Vocabulary" link
2. Verify URL changes to `/vocabulary/`
3. Capture snapshot
4. Check for vocabulary grid rendering

**Expected Results**:
- URL: `http://localhost:1313/vocabulary/`
- Vocabulary cards display
- Filter controls visible
- No console errors

**MCP Tools**: `browser_click`, `browser_snapshot`

### T2.2: Navigate to Practice Page
**Objective**: Test practice page navigation

**Steps**:
1. From homepage, click "Practice" link
2. Verify URL changes to `/practice/`
3. Capture snapshot
4. Check for practice session UI

**Expected Results**:
- URL: `http://localhost:1313/practice/`
- Practice interface loads
- Language direction selector visible
- "Start Practice" button present

**MCP Tools**: `browser_click`, `browser_snapshot`

### T2.3: Navigate to Grammar Page
**Objective**: Test grammar page navigation

**Steps**:
1. From homepage, click "Grammar" link
2. Verify URL changes to `/grammar/`
3. Capture snapshot
4. Check for grammar topics list

**Expected Results**:
- URL: `http://localhost:1313/grammar/`
- Grammar topics display (13 topics expected)
- Topic cards clickable
- No console errors

**MCP Tools**: `browser_click`, `browser_snapshot`

### T2.4: Browser Back Button
**Objective**: Verify browser navigation works

**Steps**:
1. Navigate: Home → Vocabulary → Practice
2. Click browser back button twice
3. Verify return to home

**Expected Results**:
- Back button works correctly
- Page state preserved
- No JavaScript errors

**MCP Tools**: `browser_navigate_back`

---

## Test Suite 3: Vocabulary Browsing

### T3.1: Vocabulary Grid Renders
**Objective**: Verify vocabulary cards display correctly

**Steps**:
1. Navigate to `/vocabulary/`
2. Capture snapshot
3. Count visible vocabulary cards
4. Verify card structure (word, translation, level)

**Expected Results**:
- At least 20 cards visible initially
- Each card shows: Bulgarian word, German translation, CEFR level
- Cards are properly styled
- No broken layouts

**MCP Tools**: `browser_snapshot`, `browser_evaluate`

### T3.2: CEFR Level Filter
**Objective**: Test filtering by CEFR level

**Steps**:
1. Navigate to `/vocabulary/`
2. Click "A1" level filter
3. Verify only A1 words display
4. Click "B1" level filter
5. Verify only B1 words display

**Expected Results**:
- Filter buttons respond to clicks
- Vocabulary updates dynamically
- Active filter highlighted
- No page reload required

**MCP Tools**: `browser_click`, `browser_snapshot`, `browser_evaluate`

### T3.3: Category Filter
**Objective**: Test filtering by category

**Steps**:
1. Navigate to `/vocabulary/`
2. Click "Begrüßung" (Greetings) category
3. Verify only greeting words display
4. Click "Lebensmittel" (Food) category
5. Verify only food words display

**Expected Results**:
- Category filters work independently
- Vocabulary updates instantly
- Filter state persists during session
- Clear filters button works

**MCP Tools**: `browser_click`, `browser_snapshot`

### T3.4: Search Functionality
**Objective**: Test vocabulary search

**Steps**:
1. Navigate to `/vocabulary/`
2. Type "Здравей" in search box
3. Verify results show greeting words
4. Type "Wasser" in search box
5. Verify results show water-related words

**Expected Results**:
- Search updates as you type
- Both Bulgarian and German search work
- Case-insensitive search
- No results message appears when appropriate

**MCP Tools**: `browser_type`, `browser_snapshot`

### T3.5: Vocabulary Card Details
**Objective**: Test clicking vocabulary card for details

**Steps**:
1. Navigate to `/vocabulary/`
2. Click first vocabulary card
3. Verify detail modal/page opens
4. Check for: examples, notes, etymology

**Expected Results**:
- Detail view opens
- All metadata displays correctly
- Examples show Bulgarian + German
- Close button works

**MCP Tools**: `browser_click`, `browser_snapshot`

---

## Test Suite 4: Flashcard Practice

### T4.1: Start Practice Session
**Objective**: Initiate flashcard practice

**Steps**:
1. Navigate to `/practice/`
2. Select "Bulgarian → German" direction
3. Click "Start Practice" button
4. Verify first flashcard appears

**Expected Results**:
- Direction selection works
- Practice session starts
- First card shows Bulgarian word
- Flip button visible

**MCP Tools**: `browser_click`, `browser_snapshot`

### T4.2: Card Flip Interaction (Mouse)
**Objective**: Test flipping cards with mouse

**Steps**:
1. Start practice session
2. Click card to flip
3. Verify German translation shows
4. Click again to flip back

**Expected Results**:
- Card flips with smooth animation
- Back shows German translation
- Flip is reversible
- No console errors

**MCP Tools**: `browser_click`, `browser_snapshot`, `browser_evaluate`

### T4.3: Card Flip Interaction (Keyboard)
**Objective**: Test keyboard shortcut for flipping

**Steps**:
1. Start practice session
2. Press Space key
3. Verify card flips
4. Press Enter key
5. Verify card flips back

**Expected Results**:
- Space flips card
- Enter flips card
- Keyboard shortcuts documented
- Focus state visible

**MCP Tools**: `browser_press_key`, `browser_snapshot`

### T4.4: Grading Cards (Mouse)
**Objective**: Test grading flashcards

**Steps**:
1. Start practice session
2. Flip card to reveal answer
3. Click "Again" (0) button
4. Verify next card appears
5. Click "Easy" (5) button

**Expected Results**:
- All grade buttons work (0-5)
- Next card loads immediately
- Progress counter updates
- Grading recorded in localStorage

**MCP Tools**: `browser_click`, `browser_snapshot`, `browser_evaluate`

### T4.5: Grading Cards (Keyboard)
**Objective**: Test keyboard shortcuts for grading

**Steps**:
1. Start practice session
2. Flip card (Space)
3. Press "0" key (Again)
4. Verify next card
5. Press "5" key (Easy)

**Expected Results**:
- Number keys 0-5 work for grading
- Keyboard shortcuts faster than mouse
- Visual feedback for key press
- No accidental form submissions

**MCP Tools**: `browser_press_key`, `browser_snapshot`

### T4.6: Session Completion
**Objective**: Complete a practice session

**Steps**:
1. Start practice session
2. Grade 10 cards
3. Verify session summary appears
4. Check statistics: accuracy, time, streaks

**Expected Results**:
- Session completes after all cards
- Summary shows accurate stats
- Option to restart or return home
- Statistics saved to localStorage

**MCP Tools**: `browser_click`, `browser_snapshot`, `browser_evaluate`

---

## Test Suite 5: Spaced Repetition System

### T5.1: Review Schedule Creation
**Objective**: Verify SM-2 algorithm creates schedules

**Steps**:
1. Start practice session
2. Grade first card "Good" (3)
3. Check localStorage for review schedule
4. Verify `bgde:review_<id>_<direction>` key exists

**Expected Results**:
- Review data saved to localStorage
- Schema v2 format used
- nextReview timestamp set correctly
- easeFactor calculated

**MCP Tools**: `browser_evaluate`, `browser_console_messages`

### T5.2: Direction-Specific Difficulty
**Objective**: Test bidirectional difficulty multipliers

**Steps**:
1. Practice same word BG→DE direction
2. Check difficulty multiplier (1.1x)
3. Practice same word DE→BG direction
4. Check difficulty multiplier (1.2x)

**Expected Results**:
- BG→DE uses 1.1x multiplier
- DE→BG uses 1.2x multiplier
- Separate review schedules per direction
- Review intervals differ appropriately

**MCP Tools**: `browser_evaluate`

### T5.3: Due Cards Filtering
**Objective**: Verify only due cards appear

**Steps**:
1. Set some cards to future review dates
2. Start practice session
3. Verify only due/new cards appear
4. Check no future cards shown

**Expected Results**:
- Future cards not shown
- Due cards prioritized
- New cards appear after due cards
- Accurate count of due cards

**MCP Tools**: `browser_evaluate`, `browser_snapshot`

### T5.4: Review History Tracking
**Objective**: Test session history storage

**Steps**:
1. Complete practice session
2. Check localStorage for `bgde:session_history`
3. Verify session data includes: date, accuracy, card count

**Expected Results**:
- Session history array exists
- Each session has timestamp
- Accuracy percentage recorded
- Streak counter updates

**MCP Tools**: `browser_evaluate`

### T5.5: Legacy Data Migration
**Objective**: Test schema v1 → v2 migration

**Steps**:
1. Manually create legacy `bgde:review:<id>` entry
2. Start practice session
3. Verify automatic migration to v2 format
4. Check old entry removed

**Expected Results**:
- Legacy format detected
- Migrated to `bgde:review_<id>_bgde`
- Old format cleaned up
- No data loss

**MCP Tools**: `browser_evaluate`

---

## Test Suite 6: Language Direction Toggle

### T6.1: Direction Selection
**Objective**: Test language direction selector

**Steps**:
1. Navigate to `/practice/`
2. Verify default direction indicator
3. Click direction toggle button
4. Verify direction changes

**Expected Results**:
- Clear indicator of current direction
- Toggle button labeled correctly
- Direction switches BG↔DE
- Confirmation dialog may appear

**MCP Tools**: `browser_click`, `browser_snapshot`

### T6.2: Direction Affects Card Display
**Objective**: Verify direction changes card faces

**Steps**:
1. Select BG→DE direction
2. Start session
3. Verify Bulgarian on front, German on back
4. Switch to DE→BG
5. Verify German on front, Bulgarian on back

**Expected Results**:
- Direction setting persists
- Card faces swap correctly
- Examples match direction
- Notes relevant to direction

**MCP Tools**: `browser_click`, `browser_snapshot`

### T6.3: Direction Persistence
**Objective**: Test direction setting persists

**Steps**:
1. Set direction to DE→BG
2. Complete session
3. Navigate away and return
4. Verify direction still DE→BG

**Expected Results**:
- Direction saved to localStorage
- Setting persists across sessions
- No reset to default
- Clear visual indicator

**MCP Tools**: `browser_evaluate`

---

## Test Suite 7: Search & Filter

### T7.1: Live Search (Vocabulary)
**Objective**: Test real-time search on vocabulary page

**Steps**:
1. Navigate to `/vocabulary/`
2. Type "hello" in search
3. Verify instant filtering
4. Clear search
5. Verify all cards return

**Expected Results**:
- Search updates immediately
- No page reload
- Matches Bulgarian and German
- Clear search button works

**MCP Tools**: `browser_type`, `browser_snapshot`

### T7.2: Combined Filters
**Objective**: Test using multiple filters together

**Steps**:
1. Navigate to `/vocabulary/`
2. Select level "A1"
3. Select category "Begrüßung"
4. Type "Здра" in search
5. Verify results match all filters

**Expected Results**:
- Filters combine with AND logic
- Results match all criteria
- Filter count updates
- Performance remains good

**MCP Tools**: `browser_click`, `browser_type`, `browser_snapshot`

### T7.3: Empty Search Results
**Objective**: Handle no results gracefully

**Steps**:
1. Navigate to `/vocabulary/`
2. Type "xyznonexistent" in search
3. Verify "no results" message
4. Clear search
5. Verify vocabulary returns

**Expected Results**:
- Clear "no results" message
- Helpful text (e.g., "Try different search")
- No JavaScript errors
- Easy to recover from

**MCP Tools**: `browser_type`, `browser_snapshot`

---

## Test Suite 8: Accessibility

### T8.1: Keyboard Navigation
**Objective**: Verify full keyboard accessibility

**Steps**:
1. Navigate to `/practice/`
2. Use Tab key to navigate
3. Verify all interactive elements reachable
4. Test Space/Enter on buttons

**Expected Results**:
- All controls keyboard accessible
- Clear focus indicators
- Logical tab order
- No keyboard traps

**MCP Tools**: `browser_press_key`, `browser_snapshot`

### T8.2: Screen Reader Compatibility
**Objective**: Check ARIA labels and semantic HTML

**Steps**:
1. Navigate to `/vocabulary/`
2. Capture accessibility snapshot
3. Verify ARIA labels present
4. Check heading hierarchy

**Expected Results**:
- Proper heading structure (h1, h2, h3)
- ARIA labels on interactive elements
- Alt text on images
- Semantic HTML elements used

**MCP Tools**: `browser_snapshot`

### T8.3: Focus Management
**Objective**: Test focus handling in modals/navigation

**Steps**:
1. Open vocabulary detail modal
2. Verify focus moves to modal
3. Press Escape to close
4. Verify focus returns to trigger button

**Expected Results**:
- Focus trapped in modals
- Escape key closes modals
- Focus restoration works
- No lost focus scenarios

**MCP Tools**: `browser_press_key`, `browser_snapshot`

### T8.4: Color Contrast
**Objective**: Verify WCAG AA color contrast

**Steps**:
1. Navigate to all main pages
2. Take screenshots
3. Check text/background contrast
4. Verify grade buttons have good contrast

**Expected Results**:
- Text contrast ratio ≥4.5:1
- Interactive elements ≥3:1
- No reliance on color alone
- Dark mode support (if applicable)

**MCP Tools**: `browser_take_screenshot`, `browser_evaluate`

---

## Test Suite 9: Mobile Responsiveness

### T9.1: Mobile Viewport (360px)
**Objective**: Test at mobile breakpoint

**Steps**:
1. Resize browser to 360px width
2. Navigate to all main pages
3. Verify layouts adapt
4. Test all interactions

**Expected Results**:
- No horizontal scroll
- Touch targets ≥44px
- Readable text (≥16px)
- Navigation becomes hamburger menu

**MCP Tools**: `browser_resize`, `browser_snapshot`

### T9.2: Tablet Viewport (768px)
**Objective**: Test at tablet breakpoint

**Steps**:
1. Resize to 768px width
2. Check vocabulary grid layout
3. Test practice cards
4. Verify navigation

**Expected Results**:
- 2-column vocabulary grid
- Cards appropriately sized
- All features accessible
- Good use of space

**MCP Tools**: `browser_resize`, `browser_snapshot`

### T9.3: Touch Interactions
**Objective**: Simulate touch events

**Steps**:
1. Mobile viewport (360px)
2. Test tapping cards
3. Test swipe gestures (if any)
4. Verify no hover-dependent features

**Expected Results**:
- Tap works as click
- No hover-only content
- Touch targets appropriately sized
- Gestures work smoothly

**MCP Tools**: `browser_click`, `browser_evaluate`

---

## Test Suite 10: Offline Functionality

### T10.1: Service Worker Registration
**Objective**: Verify PWA service worker installs

**Steps**:
1. Navigate to homepage
2. Check service worker registration
3. Verify service worker active

**Expected Results**:
- Service worker registers successfully
- Active state achieved
- No registration errors
- Manifest.json loads

**MCP Tools**: `browser_evaluate`, `browser_console_messages`

### T10.2: Offline Page Access
**Objective**: Test pages load offline

**Steps**:
1. Visit all pages online first
2. Simulate offline mode
3. Navigate to cached pages
4. Verify content displays

**Expected Results**:
- Cached pages load offline
- Images and assets available
- Practice works offline
- Graceful degradation for uncached

**MCP Tools**: `browser_evaluate`, `browser_navigate`

### T10.3: Offline Practice Session
**Objective**: Test flashcards work offline

**Steps**:
1. Visit practice page online
2. Go offline
3. Start practice session
4. Complete 5 cards

**Expected Results**:
- Practice functions offline
- Grading works
- Progress saves to localStorage
- No network errors

**MCP Tools**: `browser_evaluate`, `browser_click`

---

## Test Suite 11: LocalStorage Persistence

### T11.1: Progress Saves
**Objective**: Verify practice progress persists

**Steps**:
1. Complete practice session
2. Close browser/tab
3. Reopen application
4. Check progress still exists

**Expected Results**:
- Review schedules persist
- Session history intact
- User preferences saved
- No data loss

**MCP Tools**: `browser_evaluate`

### T11.2: LocalStorage Quota
**Objective**: Test storage limits

**Steps**:
1. Check current localStorage usage
2. Simulate many practice sessions
3. Monitor storage size
4. Verify no quota errors

**Expected Results**:
- Storage within limits (~5MB)
- Old data pruned if needed
- No quota exceeded errors
- Graceful handling if full

**MCP Tools**: `browser_evaluate`

### T11.3: Data Export/Import
**Objective**: Test progress portability (if implemented)

**Steps**:
1. Complete several sessions
2. Export progress data
3. Clear localStorage
4. Import progress data
5. Verify restore successful

**Expected Results**:
- Export creates valid JSON
- Import validates data
- All progress restored
- No data corruption

**MCP Tools**: `browser_click`, `browser_evaluate`

---

## Test Suite 12: Performance

### T12.1: Page Load Time
**Objective**: Measure initial load performance

**Steps**:
1. Navigate to homepage (cold cache)
2. Measure time to interactive
3. Check Lighthouse performance score

**Expected Results**:
- Load time <3 seconds (3G)
- Time to interactive <5 seconds
- Lighthouse score ≥90
- No render-blocking resources

**MCP Tools**: `browser_evaluate`, `browser_console_messages`

### T12.2: Vocabulary Filtering Performance
**Objective**: Test filtering speed with 750 items

**Steps**:
1. Navigate to `/vocabulary/`
2. Apply various filters
3. Measure filter response time
4. Type in search and measure

**Expected Results**:
- Filter updates <100ms
- Search updates <200ms
- No UI freezing
- Smooth interactions

**MCP Tools**: `browser_evaluate`, `browser_type`

### T12.3: Memory Leaks
**Objective**: Check for memory leaks during long sessions

**Steps**:
1. Start practice session
2. Complete 50 cards
3. Monitor memory usage
4. Check for continuous growth

**Expected Results**:
- Memory usage stable
- No continuous growth
- Garbage collection works
- No memory warnings

**MCP Tools**: `browser_evaluate`

---

## Test Execution Protocol

### Before Testing
1. ✅ Start Hugo development server
2. ✅ Clear browser cache
3. ✅ Clear localStorage
4. ✅ Open browser console
5. ✅ Prepare test results document

### During Testing
1. Follow test steps precisely
2. Record actual results
3. Screenshot any failures
4. Note console errors
5. Document unexpected behavior

### After Testing
1. Save all screenshots
2. Export localStorage data
3. Generate test report
4. File bugs for failures
5. Update documentation

---

## Test Results Template

```markdown
## Test Results: [Suite Name]

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: Hugo Local Dev / macOS / Chrome

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| T1.1 | Homepage Loads | ✅ PASS | Loaded in 1.2s |
| T1.2 | Resources Load | ❌ FAIL | vocabulary.json 404 |
| T1.3 | Navigation Visible | ✅ PASS | - |

### Bugs Found
1. **[BUG-001]** vocabulary.json not loading - 404 error
   - **Severity**: Critical
   - **Steps to reproduce**: [...]
   - **Expected**: [...]
   - **Actual**: [...]

### Screenshots
- [screenshot-001-homepage.png]
- [screenshot-002-error.png]
```

---

## Automated Test Script Template

```javascript
// Example MCP test automation
async function testHomepageLoad() {
  // Navigate to homepage
  await mcp__mcp_playwright__browser_navigate({
    url: 'http://localhost:1313/'
  });

  // Wait and capture snapshot
  await new Promise(r => setTimeout(r, 1000));
  const snapshot = await mcp__mcp_playwright__browser_snapshot();

  // Check for errors
  const console = await mcp__mcp_playwright__browser_console_messages({
    onlyErrors: true
  });

  // Assertions
  assert(snapshot.includes('Bulgarian'), 'Homepage content loaded');
  assert(console.length === 0, 'No console errors');

  console.log('✅ Test passed: Homepage loads successfully');
}
```

---

## Bug Severity Classification

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | App unusable | Cannot start practice session |
| **High** | Major feature broken | Search doesn't work |
| **Medium** | Feature partially broken | Filter shows wrong results |
| **Low** | Minor issue, workaround exists | Typo in UI text |
| **Cosmetic** | Visual only, no functional impact | Button alignment off by 2px |

---

## Success Criteria

### Minimum Passing Requirements
- ✅ All Critical and High severity bugs fixed
- ✅ 95% of test cases pass
- ✅ No console errors on core flows
- ✅ Keyboard navigation works completely
- ✅ Mobile viewport (360px) fully functional

### Ideal Passing Requirements
- ✅ 100% test case pass rate
- ✅ All severity bugs fixed
- ✅ Lighthouse score ≥95
- ✅ WCAG 2.1 AA compliance
- ✅ Offline mode fully functional

---

## Continuous Testing Strategy

### Per Sprint
- Run full test suite on all new features
- Regression test existing features
- Update test cases for changes

### Pre-Release
- Complete test suite execution
- Performance benchmarking
- Accessibility audit
- Cross-browser testing

### Post-Release
- Monitor for user-reported issues
- Analyze usage patterns
- Update test cases based on real usage

---

**Document Version**: 1.0
**Last Updated**: January 4, 2025
**Next Review**: After first test execution
