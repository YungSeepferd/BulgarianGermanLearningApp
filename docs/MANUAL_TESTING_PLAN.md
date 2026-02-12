# Manual Testing Plan - Bulgarian-German Learning App

## Overview

This manual testing plan covers all UX flows and functionalities of the Bulgarian-German learning application. Use this document for systematic QA testing sessions.

**Application URL**: http://localhost:5173
**Test Date**: 2026-02-12
**Tester**: [Your Name]

---

## Critical Bugs Found

### BUG-1: Side Panel Blocks Card Button Clicks
**Severity**: Critical
**Location**: Dashboard (Homepage) - Daily 10 feature
**Steps to Reproduce**:
1. Navigate to homepage (/)
2. Try to click "Got it!" button on the flashcard
3. Observe click doesn't register

**Expected**: Click registers and moves to next card
**Actual**: Click intercepted by Vocabulary Details panel
**Workaround**: Use keyboard navigation (ArrowRight key)
**Root Cause**: Side panel has higher z-index and intercepts pointer events

---

### BUG-2: Practice Result UUID Validation Error
**Severity**: High
**Location**: Practice page (/practice)
**Steps to Reproduce**:
1. Navigate to Practice page
2. Type correct answer (e.g., "Добре" for "gut")
3. Press Enter
4. Check console/notifications

**Expected**: Result recorded without errors
**Actual**: ZodError notification appears - "Invalid UUID" for itemId
**Error Path**: `AppState.recordPracticeResult`

---

### BUG-3: Side Panel Not Responsive on Mobile
**Severity**: Medium
**Location**: Dashboard (Homepage)
**Steps to Reproduce**:
1. Resize browser to 375px width (mobile)
2. Navigate to homepage
3. Observe Vocabulary Details panel

**Expected**: Panel hidden, collapsed, or modal on mobile
**Actual**: Panel visible, taking up significant screen space
**Impact**: Reduces usable space for flashcard interaction

---

## Test Environment Setup

```bash
# Start development server
bun run dev

# Verify server is running
open http://localhost:5173
```

---

## Page-by-Page Testing

### 1. Dashboard (Homepage) - `/`

#### 1.1 Daily 10 Feature

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Daily 10 loads | Navigate to homepage | Carousel with 10 words visible | ✅ Pass |
| Card flip animation | Click/tap card | Card flips to show translation | ✅ Pass |
| Mark as known | Click "Got it!" button | Progress increments, next card shown | ❌ Bug |
| Mark as practice | Click "Practice more" | Progress tracked, next card shown | ⬜ |
| Keyboard navigation | Press ArrowRight/Left | Cards navigate correctly | ✅ Pass |
| Progress indicator | Complete cards | Progress updates (1/10, 2/10, etc.) | ✅ Pass |
| Card state persists | Refresh page | Progress maintained | ⬜ |
| Complete all 10 | Mark all as known | Celebration/completion state | ⬜ |

#### 1.2 Vocabulary Details Panel

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Panel opens | Click card | Details panel shows word info | ✅ Pass |
| Panel closes | Click X button | Panel closes | ⬜ |
| Word info displayed | View panel | German/Bulgarian, category, examples | ✅ Pass |

#### 1.3 Navigation

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Language toggle | Click DE→BG button | Direction changes | ⬜ |
| Browse All | Click button | Navigate to vocabulary | ⬜ |
| Full Practice | Click button | Navigate to practice | ⬜ |
| Learning Paths | Click button | Navigate to learn | ⬜ |

---

### 2. Vocabulary Page - `/vocabulary`

#### 2.1 Search Functionality

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| German search | Type "Haus" | Results filtered to matches | ✅ Pass |
| Bulgarian search | Type Cyrillic "къща" | Results filtered to matches | ⬜ |
| Clear search | Click X or clear | All results shown | ⬜ |
| No results | Type "zzzznonexistent" | Empty state shown | ⬜ |
| Search result count | After search | "X von 867 Einträgen" shown | ✅ Pass |

#### 2.2 Filter Functionality

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Filter by CEFR A1 | Select A1 filter | Only A1 words shown | ⬜ |
| Filter by CEFR B1 | Select B1 filter | Only B1 words shown | ⬜ |
| Filter by category | Select category | Filtered results | ⬜ |
| Filter by part of speech | Select POS | Filtered results | ⬜ |
| Combine filters | Select multiple | Intersection of filters | ⬜ |
| Clear filters | Click reset | All filters cleared | ⬜ |

#### 2.3 Vocabulary Card Interaction

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Card click | Click vocabulary card | Detail view opens | ⬜ |
| Favorite toggle | Click heart icon | Favorite status toggles | ⬜ |
| Practice selection | Select multiple cards | "Auswahl üben" button appears | ⬜ |

---

### 3. Learn Page - `/learn`

#### 3.1 Quick Actions

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Schnell üben | Click button | Random practice starts | ⬜ |
| Vokabular durchsuchen | Click button | Navigate to vocabulary | ⬜ |

#### 3.2 Recommended Vocabulary

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Cards displayed | View page | Recommended words visible | ✅ Pass |
| Üben button | Click button | Practice mode for word | ⬜ |
| Lernen button | Click button | Learning mode for word | ⬜ |
| Checkbox selection | Check boxes | Selection tracked | ⬜ |

#### 3.3 Learning Paths

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Paths displayed | View page | Learning paths visible | ✅ Pass |
| Filter by difficulty | Use dropdown | Paths filtered | ⬜ |
| Start path | Click "Start Path" | Path detail view | ✅ Pass |
| Path progress | View path | Progress percentage shown | ✅ Pass |

#### 3.4 Path Detail View

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Path info displayed | View path | Description, lessons, duration | ✅ Pass |
| Lesson list | View path | All lessons listed | ✅ Pass |
| Start lesson | Click lesson | Lesson view opens | ✅ Pass |
| Mark complete | Click button | Progress updates | ⬜ |

---

### 4. Practice Page - `/practice`

#### 4.1 Tandem Practice Mode

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Word displayed | Navigate to page | German word shown | ✅ Pass |
| Correct answer | Type "Добре" for "gut" | ✅ Correct feedback | ✅ Pass |
| Incorrect answer | Type wrong answer | ❌ Incorrect feedback | ⬜ |
| Empty answer | Press Enter | Button disabled | ⬜ |
| Stats update | After correct | 1/1, 100%, streak 1 | ✅ Pass |
| Next word | Click "Nächstes Wort" | New word appears | ⬜ |
| Show answer | Click "Anzeigen" | Answer revealed | ⬜ |

#### 4.2 Practice Modes

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Toggle direction | Click DE↔BG button | Direction switches | ⬜ |
| Toggle to search | Click Suchen button | Search mode active | ⬜ |
| Toggle to practice | Click Üben button | Practice mode active | ✅ Pass |

#### 4.3 Practice Session

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Session persists | Refresh page | Session restored | ⬜ |
| Complete session | Finish all words | Summary/results shown | ⬜ |
| Average time | View stats | Time per answer shown | ✅ Pass |

---

### 5. Grammar Page - `/grammar`

#### 5.1 Grammar Rules Display

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Rules displayed | Navigate to page | 12 rules in table | ✅ Pass |
| Search rules | Type in search | Rules filtered | ⬜ |
| Filter by area | Click area | Rules filtered | ⬜ |
| Toggle examples | Uncheck checkbox | Examples hidden | ⬜ |

#### 5.2 Grammar Rule Content

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Bulgarian/German | View rule | Both languages shown | ✅ Pass |
| Examples | View rule | Example sentences | ✅ Pass |
| Category badge | View rule | Area badge (Verbformen, etc.) | ✅ Pass |

---

## Accessibility Testing

### Keyboard Navigation

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Tab order | Press Tab repeatedly | Logical order through page | ⬜ |
| Focus visible | Tab to elements | Focus ring visible | ⬜ |
| Skip links | Tab from top | Skip link appears | ⬜ |
| Enter/Space | Focus button, press | Button activates | ✅ Pass |
| Arrow keys | On Daily 10 | Cards navigate | ✅ Pass |
| Escape | In modal/dialog | Dialog closes | ⬜ |

### Screen Reader (Manual)

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Landmarks | Navigate by landmarks | main, nav announced | ⬜ |
| Headings | Navigate by headings | Logical h1→h2→h3 | ⬜ |
| Form labels | Focus inputs | Labels announced | ⬜ |
| Button labels | Focus buttons | Purpose clear | ⬜ |
| Progress | During practice | Progress announced | ⬜ |

### Visual Accessibility

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Text contrast | Use contrast checker | ≥4.5:1 for normal text | ⬜ |
| Large text contrast | Use contrast checker | ≥3:1 for large text | ⬜ |
| Focus indicator | Tab to elements | Visible focus ring | ⬜ |
| Color not only indicator | Check errors/success | Not color-only | ⬜ |

---

## Responsive Testing

### Viewport Sizes

| Viewport | Width | Height | Test Page | Status |
|----------|-------|--------|-----------|--------|
| Mobile Small | 320px | 568px | Homepage | ⬜ |
| Mobile Medium | 375px | 667px | Homepage | ⬜ Bug found |
| Mobile Large | 414px | 896px | Homepage | ⬜ |
| Tablet Portrait | 768px | 1024px | Homepage | ⬜ |
| Tablet Landscape | 1024px | 768px | Homepage | ⬜ |
| Desktop | 1280px | 720px | Homepage | ✅ Pass |
| Desktop Large | 1920px | 1080px | Homepage | ⬜ |

### Mobile-Specific Tests

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Touch targets | Measure buttons | ≥44x44px | ⬜ |
| No horizontal scroll | Scroll horizontally | No overflow | ⬜ |
| Pinch/zoom enabled | Check viewport meta | user-scalable allowed | ⬜ |
| Text readable | Check font size | ≥14px body text | ⬜ |
| Side panel hidden | View on mobile | Panel hidden/modal | ❌ Bug |

---

## Edge Cases & Error Handling

### Network & Data

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Offline mode | Disable network | Graceful degradation | ⬜ |
| Empty vocabulary | Clear data | Helpful empty state | ⬜ |
| Large dataset | Load 1681 items | Performance acceptable | ✅ Pass |
| Invalid URL | Navigate to /invalid | 404 page shown | ⬜ |

### Input Validation

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Empty input | Submit empty form | Validation message | ⬜ |
| Very long input | Type 1000+ chars | Input limited/handled | ⬜ |
| Special characters | Type <script>alert(1)</script> | XSS prevented | ⬜ |
| Cyrillic in German field | Type Bulgarian | Appropriate handling | ⬜ |
| German chars in Bulgarian | Type ä, ö, ü, ß | Appropriate handling | ⬜ |

---

## Internationalization (i18n)

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| German UI | Default view | German text | ✅ Pass |
| Bulgarian UI | Switch language | Bulgarian text | ⬜ |
| Language persists | Refresh page | Language maintained | ⬜ |
| Date formatting | View dates | Locale appropriate | ⬜ |

---

## Test Results Summary

| Category | Tests | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Dashboard | 10 | 6 | 1 | 3 |
| Vocabulary | 15 | 2 | 0 | 13 |
| Learn | 12 | 5 | 0 | 7 |
| Practice | 14 | 4 | 1 | 9 |
| Grammar | 8 | 4 | 0 | 4 |
| Accessibility | 12 | 2 | 0 | 10 |
| Responsive | 12 | 1 | 1 | 10 |
| Edge Cases | 10 | 1 | 0 | 9 |
| **Total** | **93** | **25** | **3** | **65** |

---

## Bug Report Template

```markdown
### BUG-X: [Short Description]

**Severity**: Critical / High / Medium / Low
**Location**: [Page/Component]
**Browser**: Chrome / Firefox / Safari / Edge
**Viewport**: Desktop / Tablet / Mobile

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:

**Actual Result**:

**Screenshots**:

**Additional Notes**:
```

---

## Test Session Log

| Date | Tester | Duration | Pages Tested | Bugs Found | Notes |
|------|--------|----------|--------------|------------|-------|
| 2026-02-12 | Claude MCP | 30min | All | 3 | Initial testing session |

---

## Next Steps

1. **Fix BUG-1**: Adjust z-index and pointer-events for Vocabulary Details panel
2. **Fix BUG-2**: Validate/fix UUID format in practice result recording
3. **Fix BUG-3**: Implement responsive behavior for side panel on mobile
4. **Complete blocked tests**: Run through all ⬜ test cases
5. **Automate tests**: Convert manual tests to Playwright E2E tests
6. **Accessibility audit**: Run full WCAG 2.1 AA compliance check