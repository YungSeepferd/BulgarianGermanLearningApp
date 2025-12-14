# Phase 4 - Iterative Tab Testing Plan

**Project**: Bulgarian-German Learning App  
**Phase**: 4 - Comprehensive Tab-by-Tab Testing & Validation  
**Status**: 🚀 Ready to Execute  
**Date**: December 13, 2025  
**Dev Server**: http://localhost:5173  
**Build Status**: ✅ Passing (7.43s, 226 modules)

---

## 🎯 Executive Summary

**Objective**: Systematically test all 5 main tabs to verify Phase 2-3 implementations are production-ready

**Prerequisites Verified**:
- ✅ Dev server running on localhost:5173
- ✅ Build passing (no new TypeScript errors)
- ✅ Phase 2 complete (VocabularyCard + Design Tokens)
- ✅ Phase 3 complete (Button migrations + Flashcard variant)

**Test Scope**:
1. **Home/Dashboard** - Navigation hub
2. **Vocabulary** - VocabularyCard grid variant (Phase 2)
3. **Grammar** - Content display (critical issue #3 fix)
4. **Practice** - ActionButton implementations (Phase 3)
5. **Learn** - Flashcard variant (Phase 3)

**Timeline**: 90-120 minutes for complete testing

---

## 📋 Testing Methodology

### Test Levels

| Level | Purpose | Approach |
|-------|---------|----------|
| **Smoke Test** | Verify tab loads without errors | Quick page load check |
| **Functional Test** | Verify features work as expected | User flow validation |
| **Integration Test** | Verify components work together | End-to-end scenarios |
| **Visual Test** | Verify UI matches design system | Design token compliance |
| **Accessibility Test** | Verify keyboard/screen reader support | WCAG 2.1 AA compliance |

### Success Criteria

**Must Pass (Critical)**:
- ✅ Page loads without console errors
- ✅ All interactive elements functional
- ✅ Data displays correctly in both languages
- ✅ No visual regressions from Phase 2-3 changes

**Should Pass (Important)**:
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Design tokens applied consistently
- ✅ Accessibility standards met

**Nice to Have (Optional)**:
- ✅ Performance meets benchmarks (<2s load)
- ✅ Animations smooth and polished

---

## 🏠 Tab 1: Home/Dashboard

### Smoke Test ✅

**URL**: http://localhost:5173  
**Expected**: Dashboard loads with navigation tabs

**Checklist**:
- [ ] Page loads without console errors
- [ ] All 5 navigation tabs visible (Home, Vocabulary, Grammar, Practice, Learn)
- [ ] Language toggle visible (DE/BG)
- [ ] Hero section displays welcome message
- [ ] Quick action cards present

**Test Commands**:
```bash
# Open browser
open http://localhost:5173

# Check console for errors (should be 0)
# F12 → Console tab
```

**Expected Console**: No errors, clean load

---

### Functional Test

**Feature 1: Navigation Tabs**

**Steps**:
1. Click each tab in sequence
2. Verify page changes
3. Check URL updates
4. Verify back button works

**Expected Results**:
- [ ] Vocabulary tab → /vocabulary
- [ ] Grammar tab → /grammar
- [ ] Practice tab → /practice
- [ ] Learn tab → /learn
- [ ] Home tab → /

**Feature 2: Language Toggle**

**Steps**:
1. Click language toggle (DE/BG)
2. Observe UI text changes
3. Verify persistence on page refresh

**Expected Results**:
- [ ] UI language switches (DE → BG or BG → DE)
- [ ] Language preference persists after refresh
- [ ] All navigation labels update

**Feature 3: Quick Actions**

**Steps**:
1. Locate quick action cards
2. Click "Quick Practice"
3. Click "Browse Vocabulary"
4. Click "Start Learning"

**Expected Results**:
- [ ] Quick Practice → navigates to /practice
- [ ] Browse Vocabulary → navigates to /vocabulary
- [ ] Start Learning → navigates to /learn

---

### Visual Test

**Verify Design System Application**:
- [ ] Typography uses CSS variables (--text-base, --text-lg, etc.)
- [ ] Spacing uses CSS variables (--space-4, --gap-md, etc.)
- [ ] Colors use semantic tokens (--color-primary, etc.)
- [ ] Buttons use ActionButton component
- [ ] Consistent font sizing across sections

**Responsive Breakpoints**:
- [ ] Mobile (375px): Single column, stacked layout
- [ ] Tablet (768px): 2-column grid for quick actions
- [ ] Desktop (1024px+): Full 3-column layout

---

## 📚 Tab 2: Vocabulary (CRITICAL - Phase 2 Implementation)

### Smoke Test ✅

**URL**: http://localhost:5173/vocabulary  
**Expected**: Vocabulary grid loads with 746 items using VocabularyCard

**Checklist**:
- [ ] Page loads without console errors
- [ ] Vocabulary cards display in grid layout
- [ ] All 746 items render (check item count)
- [ ] VocabularyCard component confirmed (not legacy markup)
- [ ] Search bar visible at top
- [ ] Filter controls visible

**Verification Code**:
```javascript
// Open browser console and run:
document.querySelectorAll('[class*="vocabulary-card"]').length
// Should return 746 or visible count after pagination
```

---

### Functional Test: VocabularyCard Grid Variant

**Feature 1: Card Display**

**Steps**:
1. Scroll through vocabulary list
2. Observe card structure
3. Verify all card elements present

**Expected Card Elements**:
- [ ] CEFR badge (A1-C1 level)
- [ ] Part of speech badge (noun, verb, etc.)
- [ ] Category tags
- [ ] German word (large text)
- [ ] Bulgarian translation (Cyrillic)
- [ ] Direction arrow (→ for DE→BG, ← for BG→DE)
- [ ] Example sentences (if enriched)
- [ ] Practice button (ActionButton variant="practice")
- [ ] Quick practice button (⚡ icon)
- [ ] Selection checkbox

**Feature 2: Search Functionality**

**Test 2.1: German Search**
1. Type "Hallo" in search box
2. Observe results filter instantly
3. Verify only matching items show

**Expected**:
- [ ] Results filter in <500ms
- [ ] "Hallo" → "Здравей" card appears
- [ ] Non-matching cards hidden
- [ ] Clear button (×) appears

**Test 2.2: Bulgarian (Cyrillic) Search**
1. Clear search
2. Type "Здравей" (Bulgarian)
3. Verify Cyrillic input accepted

**Expected**:
- [ ] Cyrillic characters accepted
- [ ] Matching cards shown
- [ ] No encoding errors in console

**Test 2.3: Partial Match**
1. Type "hal" (partial word)
2. Verify partial matching works

**Expected**:
- [ ] Cards starting with "hal" appear
- [ ] Case-insensitive matching

---

### Functional Test: Filters

**Feature 3: CEFR Level Filtering**

**Steps**:
1. Clear all filters
2. Select A1 level
3. Observe filtered results
4. Select multiple levels (A1 + A2)
5. Clear filters

**Expected**:
- [ ] Only A1 cards show
- [ ] Multiple selection works
- [ ] Card count updates dynamically
- [ ] Clear button resets to all items

**Feature 4: Category Filtering**

**Steps**:
1. Select "Greetings" category
2. Verify only greeting words show
3. Select multiple categories
4. Clear filters

**Expected**:
- [ ] Category filter works
- [ ] Category tags visible on cards
- [ ] Multi-select works
- [ ] Filters combine correctly (AND logic)

**Feature 5: Part of Speech Filtering**

**Steps**:
1. Select "Noun" filter
2. Verify only nouns display
3. Combine with CEFR filter (A1 + Noun)

**Expected**:
- [ ] POS filter works independently
- [ ] Combines with other filters
- [ ] Badge reflects part of speech

---

### Functional Test: Actions

**Feature 6: Practice This Button**

**Steps**:
1. Hover over a vocabulary card
2. Click "Practice This" button
3. Observe action

**Expected**:
- [ ] Button visible (always or on hover)
- [ ] Click navigates to practice mode
- [ ] Selected item added to practice queue
- [ ] ActionButton styling applied

**Feature 7: Quick Practice (⚡) Button**

**Steps**:
1. Click lightning icon on card
2. Verify immediate practice starts

**Expected**:
- [ ] Practice starts instantly
- [ ] Single-item practice session
- [ ] Returns to vocabulary after completion

**Feature 8: Selection & Batch Actions**

**Steps**:
1. Click checkbox on 3 cards
2. Verify selection state
3. Click "Practice Selected" button (if available)

**Expected**:
- [ ] Checkboxes toggle selection
- [ ] Selected cards highlighted
- [ ] Batch actions enabled

---

### Visual Test: Design System Compliance

**Verify VocabularyCard Uses Design Tokens**:
- [ ] Card spacing: --space-4, --gap-md
- [ ] Card border-radius: --radius-lg
- [ ] Card shadow: --shadow-md
- [ ] Typography: --text-base, --text-lg, --text-sm
- [ ] Colors: --color-card-bg, --color-border
- [ ] CEFR badges: --color-a1, --color-a2, etc.
- [ ] Hover states: --color-card-hover

**Responsive Grid Layout**:
- [ ] Mobile (375px): 1 column, full width
- [ ] Tablet (768px): 2 columns
- [ ] Desktop (1024px): 3 columns
- [ ] Desktop Large (1440px+): 4 columns

---

### Integration Test: Language Mode Switching

**Scenario**: User switches learning direction mid-browsing

**Steps**:
1. On vocabulary page, note current direction arrow
2. Click language mode toggle (top right)
3. Observe cards update direction
4. Search for a word
5. Verify search works in new direction

**Expected**:
- [ ] Direction arrow flips (→ becomes ←)
- [ ] Card front/back languages swap
- [ ] Search adapts to new direction
- [ ] Filters remain applied
- [ ] No page reload required

---

## 📖 Tab 3: Grammar (Critical Issue #3 Verification)

### Smoke Test ✅

**URL**: http://localhost:5173/grammar  
**Expected**: Grammar rules load with examples in Bulgarian (not Latin)

**Critical Check** (Issue #3 from CRITICAL_ISSUES_ANALYSIS.md):
- [ ] Page loads without errors
- [ ] Examples display in Cyrillic Bulgarian
- [ ] No Lorem Ipsum or Latin placeholder text
- [ ] All grammar rules readable

**Verification**:
```javascript
// Check for Latin placeholders
document.body.innerText.includes('Lorem ipsum')
// Should return false
```

---

### Functional Test: Grammar Content

**Feature 1: Grammar Rule Display**

**Steps**:
1. Scroll through grammar rules
2. Read rule explanations
3. Review examples

**Expected**:
- [ ] Rules organized by topic
- [ ] Examples in both German and Bulgarian
- [ ] Cyrillic text renders correctly
- [ ] No encoding issues

**Feature 2: Interactive Examples**

**Steps**:
1. Click example sentence (if interactive)
2. Verify translation toggle works

**Expected**:
- [ ] Examples toggle between DE and BG
- [ ] Hover states visible
- [ ] Responsive on mobile

---

## 🎯 Tab 4: Practice (Phase 3 ActionButton Verification)

### Smoke Test ✅

**URL**: http://localhost:5173/practice  
**Expected**: Practice mode loads with ActionButton implementations

**Checklist**:
- [ ] Page loads without errors
- [ ] Practice interface displays
- [ ] ActionButton components render (not legacy buttons)
- [ ] Vocabulary items load for practice

**Critical Check** (Phase 3):
```javascript
// Verify ActionButton usage (not legacy <button>)
document.querySelectorAll('button[class*="action-button"]').length > 0
// Should return true
```

---

### Functional Test: Practice Flow

**Feature 1: Start Practice Session**

**Steps**:
1. Click "Start Practice" button
2. Observe practice session begins
3. Verify first vocabulary item displays

**Expected**:
- [ ] Button click starts session
- [ ] ActionButton variant="primary" confirmed
- [ ] Vocabulary item displays (German or Bulgarian based on mode)
- [ ] Answer input field appears

**Feature 2: Answer Checking**

**Steps**:
1. Type answer in input field
2. Click "Check Answer" button (ActionButton variant="primary")
3. Observe feedback

**Expected**:
- [ ] Answer validated
- [ ] Feedback shown (correct/incorrect)
- [ ] Correct answer displays if wrong
- [ ] ActionButton styling applied

**Feature 3: Next Button**

**Steps**:
1. After answer feedback, click "Next" button
2. Verify next item loads

**Expected**:
- [ ] Next button appears after answer check
- [ ] ActionButton variant="secondary" confirmed
- [ ] Next vocabulary item loads
- [ ] Progress indicator updates

**Feature 4: Show/Hide Examples**

**Steps**:
1. During practice, click "Show Examples" button
2. Verify examples display
3. Click "Hide Examples"

**Expected**:
- [ ] Examples toggle visibility
- [ ] ActionButton variant="text" confirmed
- [ ] Smooth expand/collapse animation

---

### Functional Test: Error States

**Feature 5: Error Handling**

**Steps**:
1. Simulate error (reload with network disabled)
2. Observe error message
3. Click "Retry" button

**Expected**:
- [ ] Error message displays
- [ ] Retry button present (ActionButton variant="secondary")
- [ ] Button click attempts reload
- [ ] Graceful fallback

---

### Visual Test: ActionButton Integration

**Verify Phase 3 Button Migration**:
- [ ] All buttons use ActionButton component
- [ ] No legacy `<button>` elements with inline styles
- [ ] Variant="primary" for main actions (Check, Start)
- [ ] Variant="secondary" for alternative actions (Next, Retry)
- [ ] Variant="text" for tertiary actions (Show/Hide)
- [ ] Size="md" for standard buttons
- [ ] Size="lg" for prominent CTAs

**Responsive Button Sizing**:
- [ ] Mobile: Full width buttons for main actions
- [ ] Tablet: Standard sizing
- [ ] Desktop: Standard sizing with hover states

---

## 🧠 Tab 5: Learn (Phase 3 Flashcard Variant Verification)

### Smoke Test ✅

**URL**: http://localhost:5173/learn  
**Expected**: Flashcard variant loads using VocabularyCard component

**Critical Check** (Phase 3):
- [ ] Page loads without errors
- [ ] VocabularyCard variant="flashcard" renders
- [ ] No custom Flashcard.svelte component used (archived in Phase 3)
- [ ] Flashcard displays vocabulary item

**Verification**:
```javascript
// Check for VocabularyCard usage
document.querySelector('[class*="flashcard-variant"]') !== null
// Should return true
```

---

### Functional Test: Flashcard Interaction

**Feature 1: Start Learning Session**

**Steps**:
1. Click "Start Learning" button
2. Observe session begins
3. Verify first flashcard displays

**Expected**:
- [ ] ActionButton variant="primary" or variant="learn"
- [ ] Session starts immediately
- [ ] Flashcard shows front side (question)
- [ ] Language-aware label ("Frage" or "Въпрос")

**Feature 2: Flip Animation**

**Steps**:
1. Click flashcard to flip
2. Observe animation
3. Verify back side displays

**Expected**:
- [ ] Flip animation smooth (300ms fade)
- [ ] Front side hides completely
- [ ] Back side displays answer + metadata
- [ ] Language-aware label ("Antwort" or "Отговор")

**Feature 3: Metadata Display (Back Side)**

**Steps**:
1. Flip card to back
2. Scroll through metadata sections
3. Verify all sections present

**Expected Back Side Sections**:
- [ ] Answer text (target language)
- [ ] Mnemonic section (if available)
- [ ] Example sentences section
- [ ] Cultural notes section (if available)
- [ ] Part of speech badge
- [ ] CEFR level badge

---

### Functional Test: Difficulty Buttons

**Feature 4: Easy Button**

**Steps**:
1. View flashcard back
2. Click "Easy" button
3. Observe card advances

**Expected**:
- [ ] ActionButton variant="primary" or variant="success"
- [ ] Card advances to next
- [ ] Progress updated
- [ ] Easy rating recorded

**Feature 5: Hard Button**

**Steps**:
1. View flashcard back
2. Click "Hard" button
3. Verify card repeats later

**Expected**:
- [ ] ActionButton variant="secondary" or variant="danger"
- [ ] Card added to review queue
- [ ] Progress updated
- [ ] Hard rating recorded

---

### Functional Test: Session Management

**Feature 6: Session Progress**

**Steps**:
1. Complete 5 flashcards
2. Observe progress indicator
3. Verify card count updates

**Expected**:
- [ ] Progress bar/counter visible
- [ ] Updates after each card
- [ ] Shows cards remaining

**Feature 7: Session Completion**

**Steps**:
1. Complete all cards in session
2. Observe completion screen
3. Click "Start New Session" button

**Expected**:
- [ ] Completion message displays
- [ ] Session statistics shown
- [ ] "Start New" button present (ActionButton)
- [ ] Button restarts session with new cards

---

### Integration Test: Bilingual Flashcard Flow

**Scenario**: User switches language mode during learning

**Steps**:
1. Start learning session in DE→BG mode
2. View 2 flashcards
3. Switch to BG→DE mode (language toggle)
4. Continue session
5. Verify labels and content update

**Expected**:
- [ ] Language mode toggle works mid-session
- [ ] Front/back languages swap
- [ ] Labels update ("Frage" → "Въпрос", etc.)
- [ ] Session continues without restart
- [ ] No data loss

---

### Visual Test: Flashcard Design System

**Verify VocabularyCard Flashcard Variant**:
- [ ] Card size: Mobile-friendly, centered
- [ ] Typography: --text-lg for question, --text-xl for answer
- [ ] Spacing: --space-6 padding, --gap-lg between sections
- [ ] Colors: --color-flashcard-front, --color-flashcard-back
- [ ] Border radius: --radius-xl for card edges
- [ ] Shadow: --shadow-2xl for depth

**Responsive Flashcard Layout**:
- [ ] Mobile (375px): Full width, reduced padding
- [ ] Tablet (768px): Max width 600px, centered
- [ ] Desktop (1024px): Max width 700px, centered

---

## 🔄 Iteration Loop Process

### Step-by-Step Execution

For each tab above:

1. **Run Smoke Test** (2 minutes)
   - Load page
   - Check console for errors
   - Verify basic rendering

2. **Run Functional Tests** (10-15 minutes per tab)
   - Execute each feature test
   - Mark checkboxes ✅ or ❌
   - Document failures in detail

3. **Run Visual Tests** (5 minutes per tab)
   - Verify design token usage
   - Test responsive breakpoints
   - Check hover/focus states

4. **Run Integration Tests** (5 minutes per tab)
   - Test cross-feature scenarios
   - Verify language switching
   - Test data persistence

5. **Document Findings** (5 minutes per tab)
   - Note all issues
   - Capture screenshots if needed
   - Create GitHub issues for bugs

6. **Move to Next Tab**
   - Repeat process
   - Build comprehensive report

---

## 📊 Test Report Template

After completing all tabs, fill out:

### Test Summary

| Tab | Smoke | Functional | Visual | Integration | Status |
|-----|-------|------------|--------|-------------|--------|
| Home | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Vocabulary | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Grammar | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Practice | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |
| Learn | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ | PASS/FAIL |

### Issues Found

| Issue ID | Tab | Severity | Description | Fix Estimate |
|----------|-----|----------|-------------|--------------|
| ISS-001 | Vocabulary | 🔴 Critical | ... | 30 min |
| ISS-002 | Practice | 🟡 Important | ... | 15 min |
| ISS-003 | Learn | 🟢 Minor | ... | 5 min |

### Recommendations

1. **Immediate Fixes** (blocking deployment):
   - Issue ISS-001: ...
   - Issue ISS-002: ...

2. **Follow-up Work** (post-deployment):
   - Enhancement: ...
   - Performance: ...

3. **Technical Debt**:
   - Refactor: ...
   - Documentation: ...

---

## ✅ Sign-Off Criteria

**Phase 4 Complete When**:
- [ ] All 5 tabs pass smoke tests
- [ ] All critical functional tests pass
- [ ] No blocking issues found
- [ ] Visual regressions documented
- [ ] Integration tests confirm Phase 2-3 implementations
- [ ] Test report created and reviewed

**Ready for Production When**:
- [ ] All critical issues resolved
- [ ] Important issues addressed or triaged
- [ ] Documentation updated with findings
- [ ] Performance benchmarks met
- [ ] Accessibility standards verified

---

## 📝 Next Steps After Testing

1. **Create GitHub Issues** for all bugs found
2. **Update CHANGELOG.md** with Phase 4 results
3. **Update CRITICAL_ISSUES_ANALYSIS.md** if new issues found
4. **Run E2E Test Suite**: `pnpm run test:e2e`
5. **Run Accessibility Tests**: `pnpm run test:accessibility`
6. **Prepare for deployment** if all tests pass

---

**Testing Start**: _____________  
**Testing End**: _____________  
**Tester**: _____________  
**Final Status**: ⏳ Pending / ✅ Complete / ❌ Failed
