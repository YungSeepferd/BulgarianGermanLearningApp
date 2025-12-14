# Phase 3 - Manual Testing Plan

**Project**: Bulgarian-German Learning App  
**Phase**: 3 - Design System & Component Migration  
**Testing Date**: December 13, 2025  
**Dev Server**: http://localhost:5174  
**Tester**: _____________  
**Duration Estimate**: 60-90 minutes

---

## 📋 Pre-Testing Checklist

Before starting, ensure:
- [ ] Dev server running at http://localhost:5174
- [ ] Browser console open (F12) to monitor errors
- [ ] Screen size noted for responsive testing
- [ ] This document ready for marking checkboxes

---

## 🎯 Testing Overview

**Total Test Categories**: 8  
**Total Test Cases**: 45  
**Critical Path Tests**: 15  
**Nice-to-Have Tests**: 30

**Priority Levels**:
- 🔴 **Critical** - Must pass before deployment
- 🟡 **Important** - Should pass, investigate if failing
- 🟢 **Optional** - Nice to verify, not blocking

---

## Test Category 1: VocabularyCard Grid Variant (Vocabulary Page)

**URL**: http://localhost:5174/vocabulary  
**Component**: VocabularyCard variant="grid"  
**Priority**: 🔴 Critical

### Test 1.1: Page Load and Layout
**Priority**: 🔴 Critical

**Steps**:
1. Navigate to http://localhost:5174/vocabulary
2. Wait for page to fully load

**Expected Results**:
- [ ] Page loads without errors in console
- [ ] Vocabulary cards display in 3-column grid on desktop (>1024px)
- [ ] Cards display in 2-column grid on tablet (768-1024px)
- [ ] Cards display in 1-column on mobile (<768px)
- [ ] All cards show German word, Bulgarian translation, part of speech badge
- [ ] CEFR difficulty level visible on each card

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.2: Search Functionality - German Input
**Priority**: 🔴 Critical

**Steps**:
1. On vocabulary page, locate search input
2. Type "Hallo" (German word)
3. Observe results update

**Expected Results**:
- [ ] Search input accepts text
- [ ] Results filter immediately (no delay >500ms)
- [ ] Cards containing "Hallo" appear
- [ ] Cards not matching are hidden
- [ ] Clear button (×) appears in search field

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.3: Search Functionality - Bulgarian (Cyrillic) Input
**Priority**: 🔴 Critical

**Steps**:
1. Clear previous search
2. Type "Здравей" (Bulgarian word in Cyrillic)
3. Observe results update

**Expected Results**:
- [ ] Search accepts Cyrillic characters
- [ ] Results filter correctly
- [ ] Cards containing "Здравей" appear
- [ ] No console errors about character encoding

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.4: CEFR Level Filtering
**Priority**: 🔴 Critical

**Steps**:
1. Clear search field
2. Click CEFR filter dropdown/buttons
3. Select "A1" level
4. Observe cards update

**Expected Results**:
- [ ] Only A1 level cards displayed
- [ ] Filter control shows "A1" as active
- [ ] Card count updates correctly
- [ ] Can clear filter to show all cards again

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.5: Category Filtering
**Priority**: 🟡 Important

**Steps**:
1. Clear all filters
2. Select a category (e.g., "Greetings")
3. Observe filtered results

**Expected Results**:
- [ ] Only cards in selected category displayed
- [ ] Category tags visible on cards
- [ ] Can select multiple categories
- [ ] Can clear category filters

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.6: "Practice This" Button
**Priority**: 🔴 Critical

**Steps**:
1. Hover over a vocabulary card
2. Click "Practice This" button (if visible)
3. Observe navigation/action

**Expected Results**:
- [ ] Button appears on hover or is always visible
- [ ] Button click triggers action (navigate to practice or add to queue)
- [ ] Button styling matches ActionButton "practice" variant
- [ ] No console errors

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.7: Quick Practice (⚡) Button
**Priority**: 🟡 Important

**Steps**:
1. Locate quick practice button (lightning icon)
2. Click button
3. Observe action

**Expected Results**:
- [ ] Button click starts practice immediately
- [ ] Navigates to practice page or opens practice modal
- [ ] Icon visible and recognizable
- [ ] ActionButton styling applied

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.8: Metadata Display (Enriched Entries)
**Priority**: 🟢 Optional

**Steps**:
1. Find a card with enrichment data (examples, cultural notes)
2. Expand or view metadata section
3. Read content

**Expected Results**:
- [ ] Metadata section visible or expandable
- [ ] Examples displayed correctly
- [ ] Cultural notes readable
- [ ] Formatting clean and consistent

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 1.9: Language Mode Toggle
**Priority**: 🔴 Critical

**Steps**:
1. On vocabulary page, locate language mode toggle (DE↔BG)
2. Note current direction (e.g., DE→BG)
3. Click toggle to switch direction
4. Observe card updates

**Expected Results**:
- [ ] Toggle button clearly labeled
- [ ] Cards update to show opposite direction (BG→DE or DE→BG)
- [ ] Direction arrow on cards changes
- [ ] Source/target text swaps positions
- [ ] No page reload required

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 2: VocabularyCard List Variant (SearchList Component)

**Location**: Triggered from Vocabulary page search  
**Component**: VocabularyCard variant="list"  
**Priority**: 🟡 Important

### Test 2.1: List Display After Search
**Priority**: 🟡 Important

**Steps**:
1. On vocabulary page, perform a search
2. Observe if SearchList component appears
3. Check card layout

**Expected Results**:
- [ ] Cards display in horizontal/compact list layout
- [ ] Each card shows word, translation, part of speech
- [ ] Cards are more compact than grid variant
- [ ] Scrollable if many results

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 2.2: Selection Checkboxes
**Priority**: 🟢 Optional

**Steps**:
1. In search results, locate checkboxes on cards
2. Click checkbox to select a card
3. Select multiple cards

**Expected Results**:
- [ ] Checkboxes visible on each card
- [ ] Can select/deselect individual cards
- [ ] Selection state persists while viewing list
- [ ] Visual feedback when selected

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 2.3: Batch Actions (if implemented)
**Priority**: 🟢 Optional

**Steps**:
1. Select 2-3 cards
2. Look for batch action buttons (Practice Selected, etc.)
3. Click batch action

**Expected Results**:
- [ ] Batch actions appear when cards selected
- [ ] Actions work on all selected cards
- [ ] ActionButton styling applied

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 3: VocabularyCard Flashcard Variant (Learn Page)

**URL**: http://localhost:5174/learn  
**Component**: VocabularyCard variant="flashcard"  
**Priority**: 🔴 Critical (NEW - Just implemented)

### Test 3.1: Learn Page Load
**Priority**: 🔴 Critical

**Steps**:
1. Navigate to http://localhost:5174/learn
2. Wait for page to load
3. Observe initial state

**Expected Results**:
- [ ] Page loads without errors
- [ ] "Start Learning" or similar button visible
- [ ] Page shows learning options or instructions
- [ ] No console errors

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.2: Start Learning Session
**Priority**: 🔴 Critical

**Steps**:
1. Click "Start Learning" button
2. Wait for first flashcard to appear

**Expected Results**:
- [ ] Button click starts session
- [ ] First flashcard displays immediately (<500ms)
- [ ] Flashcard shows "Question" side (front)
- [ ] Progress indicator appears (e.g., "1/20")

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.3: Flashcard Flip Animation
**Priority**: 🔴 Critical

**Steps**:
1. With flashcard showing question side
2. Click anywhere on the card
3. Observe animation

**Expected Results**:
- [ ] Card flips with smooth animation (~300ms)
- [ ] Front side fades out
- [ ] Back side fades in
- [ ] No visual glitches or jumps
- [ ] Answer side now visible

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.4: Front Side Content (Question)
**Priority**: 🔴 Critical

**Steps**:
1. Start new flashcard session
2. Observe front side before flipping

**Expected Results**:
- [ ] Label shows "Frage" (DE mode) or "Въпрос" (BG mode)
- [ ] Source text displays (German in DE→BG, Bulgarian in BG→DE)
- [ ] Text is large and readable
- [ ] Hint text shows "Klicken zum Umdrehen" or "Кликнете за преглед"
- [ ] Clean, focused design

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.5: Back Side Content (Answer)
**Priority**: 🔴 Critical

**Steps**:
1. Flip a flashcard
2. Observe back side content

**Expected Results**:
- [ ] Label shows "Antwort" (DE mode) or "Отговор" (BG mode)
- [ ] Target text displays (Bulgarian in DE→BG, German in BG→DE)
- [ ] Metadata sections visible (if showMetadata={true})
- [ ] Mnemonic displayed (if available)
- [ ] Examples displayed (if available)
- [ ] Cultural notes displayed (if available)

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.6: Easy Button (ActionButton)
**Priority**: 🔴 Critical

**Steps**:
1. Flip flashcard to see answer
2. Click "Easy" button (green/primary)
3. Observe behavior

**Expected Results**:
- [ ] Button labeled "Easy" or translated equivalent
- [ ] Button click advances to next card
- [ ] Card transition smooth (<500ms)
- [ ] Progress indicator updates
- [ ] ActionButton primary variant styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.7: Hard Button (ActionButton)
**Priority**: 🔴 Critical

**Steps**:
1. Flip flashcard
2. Click "Hard" button (orange/secondary)
3. Observe behavior

**Expected Results**:
- [ ] Button labeled "Hard" or translated equivalent
- [ ] Button click marks card for review
- [ ] May show same card again or queue for later
- [ ] Progress indicator updates appropriately
- [ ] ActionButton secondary variant styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.8: Progress Indicator
**Priority**: 🟡 Important

**Steps**:
1. During learning session, check progress bar/counter
2. Complete several cards
3. Watch progress update

**Expected Results**:
- [ ] Progress shows current card / total cards
- [ ] Progress bar fills as session continues
- [ ] Accurate count (e.g., "5/20")
- [ ] Updates immediately after Easy/Hard click

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.9: Session Completion
**Priority**: 🟡 Important

**Steps**:
1. Complete entire learning session (click through all cards)
2. Observe completion screen

**Expected Results**:
- [ ] Completion message appears
- [ ] Statistics shown (cards learned, accuracy, etc.)
- [ ] Option to start new session
- [ ] Option to return to home

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 3.10: Language Mode Switch During Session
**Priority**: 🟡 Important

**Steps**:
1. Start learning session
2. Flip a card to see answer
3. Switch language mode (DE↔BG toggle)
4. Observe card updates

**Expected Results**:
- [ ] Labels update immediately (Frage/Въпрос, Antwort/Отговор)
- [ ] Card content updates to match new direction
- [ ] No session reset or data loss
- [ ] Smooth transition

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 4: ActionButton Migrations (Practice Page)

**URL**: http://localhost:5174/practice  
**Component**: ActionButton (7 buttons migrated)  
**Priority**: 🔴 Critical

### Test 4.1: Practice Page Load
**Priority**: 🔴 Critical

**Steps**:
1. Navigate to http://localhost:5174/practice
2. Wait for page to load

**Expected Results**:
- [ ] Page loads without errors
- [ ] Practice mode options visible
- [ ] All buttons render correctly
- [ ] No console errors

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.2: "Quick Practice" Button
**Priority**: 🔴 Critical

**Steps**:
1. Locate "Quick Practice" button
2. Click button
3. Observe action

**Expected Results**:
- [ ] Button displays with ActionButton styling
- [ ] Click starts practice immediately
- [ ] Variant "practice" or "primary" styling
- [ ] Icon present (if applicable)

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.3: "Search Vocabulary" Button
**Priority**: 🟡 Important

**Steps**:
1. Locate "Search Vocabulary" button
2. Click button

**Expected Results**:
- [ ] Button click navigates to vocabulary page or opens search
- [ ] ActionButton styling applied
- [ ] Variant "secondary" or "text" styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.4: Start Practice → "Check Answer" Button
**Priority**: 🔴 Critical

**Steps**:
1. Start a practice session
2. Enter an answer in input field
3. Click "Check Answer" button

**Expected Results**:
- [ ] Button click validates answer
- [ ] Feedback shown (correct/incorrect)
- [ ] ActionButton primary variant styling
- [ ] Disabled state if no answer entered

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.5: "Next Word" Button
**Priority**: 🔴 Critical

**Steps**:
1. After checking an answer
2. Click "Next Word" button

**Expected Results**:
- [ ] Button click advances to next word
- [ ] Previous answer cleared
- [ ] New word displays
- [ ] ActionButton secondary variant styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.6: "Show/Hide Examples" Button
**Priority**: 🟡 Important

**Steps**:
1. Locate "Show Examples" or "Hide Examples" button
2. Click button
3. Observe examples section

**Expected Results**:
- [ ] Button toggles examples visibility
- [ ] Label changes between "Show" and "Hide"
- [ ] Examples section expands/collapses
- [ ] ActionButton text variant styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 4.7: Error State Buttons ("Reload" or "Try Again")
**Priority**: 🟡 Important

**Steps**:
1. Trigger an error state (if possible, or visually inspect)
2. Observe error buttons

**Expected Results**:
- [ ] Error buttons render with ActionButton styling
- [ ] "Reload" or "Try Again" labeled clearly
- [ ] Click resets state or reloads data
- [ ] Variant "danger" or "secondary" styling

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 5: ActionButton Migrations (Learn Page)

**URL**: http://localhost:5174/learn  
**Component**: ActionButton (Easy/Hard buttons)  
**Priority**: 🔴 Critical (Covered in Category 3, verify styling)

### Test 5.1: Easy Button Styling
**Priority**: 🟡 Important

**Steps**:
1. Start learning session
2. Inspect "Easy" button visually

**Expected Results**:
- [ ] ActionButton component used (not raw `<button>`)
- [ ] Primary variant styling (green/prominent)
- [ ] Size "lg" (large)
- [ ] Consistent with design tokens

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 5.2: Hard Button Styling
**Priority**: 🟡 Important

**Steps**:
1. During learning session
2. Inspect "Hard" button visually

**Expected Results**:
- [ ] ActionButton component used
- [ ] Secondary variant styling (orange/less prominent)
- [ ] Size "lg" (large)
- [ ] Consistent with design tokens

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 6: Mobile Responsiveness

**Priority**: 🔴 Critical  
**Tools**: Browser DevTools responsive mode or actual mobile device

### Test 6.1: Breakpoint - Mobile (375px width)
**Priority**: 🔴 Critical

**Steps**:
1. Open DevTools (F12)
2. Enable responsive design mode
3. Set viewport to 375px × 667px (iPhone SE)
4. Navigate through all pages

**Expected Results**:
- [ ] All pages readable at 375px width
- [ ] VocabularyCard grid switches to 1 column
- [ ] Buttons remain tappable (min 44px height)
- [ ] Text readable without zooming
- [ ] No horizontal scrolling

**Pages to Check**:
- [ ] Vocabulary page
- [ ] Learn page
- [ ] Practice page
- [ ] Home/dashboard

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 6.2: Breakpoint - Tablet (768px width)
**Priority**: 🟡 Important

**Steps**:
1. Set viewport to 768px × 1024px (iPad)
2. Navigate through all pages

**Expected Results**:
- [ ] VocabularyCard grid shows 2 columns
- [ ] Flashcards appropriately sized
- [ ] Buttons well-spaced
- [ ] Layout adapts to tablet size

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 6.3: Breakpoint - Desktop (1024px+ width)
**Priority**: 🟡 Important

**Steps**:
1. Set viewport to 1280px × 720px (desktop)
2. Navigate through all pages

**Expected Results**:
- [ ] VocabularyCard grid shows 3 columns
- [ ] All content uses available space well
- [ ] No awkward gaps or stretching
- [ ] Flashcards centered and appropriately sized

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 6.4: Landscape Orientation (Mobile)
**Priority**: 🟢 Optional

**Steps**:
1. Rotate mobile viewport to landscape (667px × 375px)
2. Check key pages

**Expected Results**:
- [ ] Content adapts to landscape
- [ ] No content cut off
- [ ] Flashcards still usable

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 7: Accessibility Compliance

**Priority**: 🔴 Critical (WCAG 2.1 AA)  
**Tools**: Keyboard, Screen reader (optional), axe DevTools

### Test 7.1: Keyboard Navigation - Tab Order
**Priority**: 🔴 Critical

**Steps**:
1. Navigate to vocabulary page
2. Press Tab key repeatedly
3. Observe focus indicator

**Expected Results**:
- [ ] Tab key moves focus to all interactive elements
- [ ] Focus visible (outline or highlight)
- [ ] Tab order logical (top to bottom, left to right)
- [ ] Can reach all buttons, links, inputs
- [ ] No keyboard traps

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.2: Keyboard Navigation - Enter/Space on Buttons
**Priority**: 🔴 Critical

**Steps**:
1. Tab to a button (e.g., "Quick Practice")
2. Press Enter key
3. Press Space key (on another button)

**Expected Results**:
- [ ] Enter key activates button
- [ ] Space key activates button
- [ ] Same behavior as mouse click
- [ ] All ActionButton instances work

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.3: Keyboard Navigation - Flashcard Flip
**Priority**: 🔴 Critical

**Steps**:
1. Start learning session
2. Tab to flashcard
3. Press Enter or Space to flip

**Expected Results**:
- [ ] Flashcard receives focus
- [ ] Enter/Space flips card
- [ ] Focus remains on card after flip
- [ ] Can flip back with Enter/Space

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.4: ARIA Labels and Roles
**Priority**: 🟡 Important

**Steps**:
1. Open browser DevTools
2. Inspect ActionButton elements
3. Check for ARIA attributes

**Expected Results**:
- [ ] Buttons have `role="button"` (if not `<button>`)
- [ ] Interactive elements have `aria-label` or visible text
- [ ] Flashcard has `role="button"` or `role="region"`
- [ ] No ARIA errors in console

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.5: Screen Reader (Optional)
**Priority**: 🟢 Optional

**Steps**:
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate vocabulary page
3. Navigate learn page with flashcards

**Expected Results**:
- [ ] Buttons announced with labels
- [ ] Flashcard content read aloud
- [ ] Language mode toggle announced
- [ ] Form inputs labeled

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.6: Color Contrast
**Priority**: 🟡 Important

**Steps**:
1. Visually inspect text on backgrounds
2. Use axe DevTools or contrast checker
3. Check all button variants

**Expected Results**:
- [ ] Text readable against backgrounds (4.5:1 ratio minimum)
- [ ] ActionButton variants have sufficient contrast
- [ ] Difficulty badges readable
- [ ] Links distinguishable from text

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 7.7: Focus Indicators
**Priority**: 🔴 Critical

**Steps**:
1. Tab through all pages
2. Observe focus styles on each element

**Expected Results**:
- [ ] Focus visible on all interactive elements
- [ ] Focus indicator contrasts with background (3:1 ratio)
- [ ] Focus not removed by CSS (`outline: none` avoided)
- [ ] Custom focus styles if needed (ring, highlight)

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## Test Category 8: Performance & Error Handling

**Priority**: 🟡 Important

### Test 8.1: Console Errors
**Priority**: 🔴 Critical

**Steps**:
1. Open browser console (F12 → Console tab)
2. Navigate to each page
3. Perform key actions (search, flip cards, click buttons)
4. Observe console messages

**Expected Results**:
- [ ] No red errors in console
- [ ] No uncaught exceptions
- [ ] Warnings acceptable if documented
- [ ] No 404s for missing resources

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 8.2: Page Load Time
**Priority**: 🟢 Optional

**Steps**:
1. Open DevTools → Network tab
2. Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)
3. Note load time

**Expected Results**:
- [ ] Page loads in <2 seconds
- [ ] No excessive resource sizes (>1MB)
- [ ] Vocabulary data loads successfully

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

### Test 8.3: Interaction Responsiveness
**Priority**: 🟡 Important

**Steps**:
1. Click buttons rapidly
2. Flip flashcards quickly
3. Type in search field fast

**Expected Results**:
- [ ] UI responds immediately (<100ms perceived delay)
- [ ] No lag or freezing
- [ ] Animations smooth (60fps)
- [ ] Search debounced appropriately

**Actual Result**: _______________________________________________

**Status**: ⏳ Not Started | ✅ Pass | ❌ Fail  
**Notes**: _____________________________________________________

---

## 📊 Test Results Summary

**Date Completed**: _______________  
**Tester**: _______________  
**Browser**: _______________ (Chrome, Firefox, Safari)  
**OS**: _______________ (macOS, Windows, Linux)

### Overall Results

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| 1. Vocabulary Grid | 9 | ___ | ___ | ___ | __% |
| 2. SearchList | 3 | ___ | ___ | ___ | __% |
| 3. Flashcard (Learn) | 10 | ___ | ___ | ___ | __% |
| 4. Practice Buttons | 7 | ___ | ___ | ___ | __% |
| 5. Learn Buttons | 2 | ___ | ___ | ___ | __% |
| 6. Responsive | 4 | ___ | ___ | ___ | __% |
| 7. Accessibility | 7 | ___ | ___ | ___ | __% |
| 8. Performance | 3 | ___ | ___ | ___ | __% |
| **TOTAL** | **45** | **___** | **___** | **___** | **___%** |

### Critical Test Results (Must Pass for Deployment)

**Total Critical Tests**: 19

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Page Load and Layout | ⏳ | _____ |
| 1.2 | Search - German | ⏳ | _____ |
| 1.3 | Search - Cyrillic | ⏳ | _____ |
| 1.4 | CEFR Filtering | ⏳ | _____ |
| 1.6 | Practice This Button | ⏳ | _____ |
| 1.9 | Language Mode Toggle | ⏳ | _____ |
| 3.1 | Learn Page Load | ⏳ | _____ |
| 3.2 | Start Learning | ⏳ | _____ |
| 3.3 | Flashcard Flip | ⏳ | _____ |
| 3.4 | Front Side Content | ⏳ | _____ |
| 3.5 | Back Side Content | ⏳ | _____ |
| 3.6 | Easy Button | ⏳ | _____ |
| 3.7 | Hard Button | ⏳ | _____ |
| 4.1 | Practice Page Load | ⏳ | _____ |
| 4.2 | Quick Practice Button | ⏳ | _____ |
| 4.4 | Check Answer Button | ⏳ | _____ |
| 4.5 | Next Word Button | ⏳ | _____ |
| 6.1 | Mobile 375px | ⏳ | _____ |
| 7.1 | Tab Order | ⏳ | _____ |

**Critical Pass Rate**: ___/19 = ___%  
**Deployment Recommendation**: ⏳ Pending | ✅ Approved | ❌ Blocked

---

## 🐛 Issues Found

### Issue Template

**Issue #**: ___  
**Test ID**: ___  
**Severity**: 🔴 Critical | 🟡 Important | 🟢 Minor  
**Description**: _______________________________________________  
**Steps to Reproduce**: _______________________________________  
**Expected**: _______________________________________________  
**Actual**: _______________________________________________  
**Screenshot/Console Error**: ________________________________  
**Browser/OS**: _______________________________________________  

---

### Tracked Issues

(Fill in as issues are found)

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Sign-off

### Tester

**Name**: _______________  
**Date**: _______________  
**Signature**: _______________  

**Recommendation**:
- [ ] ✅ **Approve for Deployment** - All critical tests passed
- [ ] ⚠️ **Approve with Caveats** - Minor issues noted, non-blocking
- [ ] ❌ **Block Deployment** - Critical issues must be fixed first

**Comments**: _________________________________________________  
_____________________________________________________________  
_____________________________________________________________

### Developer Response

**Name**: _______________  
**Date**: _______________  

**Actions Taken**:
- [ ] All critical issues fixed
- [ ] Important issues addressed or documented
- [ ] Regression testing completed
- [ ] Ready for deployment

**Comments**: _________________________________________________  
_____________________________________________________________  
_____________________________________________________________

---

## 📚 Reference Documents

- **PHASE_3_COMPLETION.md** - Full Phase 3 report
- **PHASE_3_VARIANT_IMPLEMENTATIONS.md** - Implementation details
- **PHASE_3_FLASHCARD_COMPLETION.md** - Flashcard variant specifics
- **COPILOT_INSTRUCTIONS_UPDATE.md** - Dev server management rules
- **INDEX.md** - Documentation index

---

## 🎯 Testing Tips

1. **Test in Multiple Browsers**: Chrome, Firefox, Safari (if on Mac)
2. **Use Private/Incognito Mode**: Avoid cache issues
3. **Clear Console Between Pages**: Fresh error detection
4. **Take Screenshots**: Document issues visually
5. **Note Browser/OS**: Issues may be environment-specific
6. **Test at Different Times**: Performance varies with system load
7. **Use Real Mobile Devices**: If available, supplement DevTools testing

---

**Testing Plan Version**: 1.0  
**Created**: December 13, 2025  
**Phase**: 3 - Design System & Component Migration  
**Estimated Duration**: 60-90 minutes

