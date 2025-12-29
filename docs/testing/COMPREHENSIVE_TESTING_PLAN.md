# Comprehensive Testing Plan - Bulgarian-German Learning App

**Document Created**: December 17, 2025  
**Phase**: Final Functional Testing & Content Verification  
**Scope**: Tab-by-Tab Navigation Testing with All Buttons & Functionalities  
**Priority**: Critical - Pre-Deployment Verification

---

## 📋 Table of Contents

1. [Overview & Objectives](#overview--objectives)
2. [Known Issues to Test](#known-issues-to-test)
3. [Navigation Structure](#navigation-structure)
4. [Tab-by-Tab Testing Plan](#tab-by-tab-testing-plan)
5. [Component Testing Checklist](#component-testing-checklist)
6. [External Links Verification](#external-links-verification)
7. [UI/UX Verification](#uiux-verification)
8. [Data Quality Verification](#data-quality-verification)
9. [Test Execution Log](#test-execution-log)
10. [Recommended Improvements](#recommended-improvements)

---

## Overview & Objectives

### Test Goals

✅ **Primary Objectives**:
1. Verify all navigation tabs are accessible and functional
2. Test all clickable buttons and ensure correct navigation/functionality
3. Verify all external links resolve to correct URLs
4. Check UI consistency across all pages
5. Validate data display accuracy
6. Test bilingual support (German ↔ Bulgarian)
7. Verify page transitions work smoothly
8. Ensure no broken links or missing content

✅ **Secondary Objectives**:
1. Document any UI/UX issues found
2. Identify missing features or improvements
3. Test accessibility features
4. Verify responsive design on different devices
5. Check performance and load times

### Success Criteria

- ✅ All navigation tabs clickable and load correctly
- ✅ All buttons navigate to intended pages/perform intended actions
- ✅ All external links work and resolve to correct resources
- ✅ No console errors or warnings
- ✅ Consistent UI across pages
- ✅ Bilingual support working (both languages selectable)
- ✅ Data displays correctly in both languages
- ✅ No missing vocabulary level indicators
- ✅ Responsive layout on mobile/tablet/desktop

---

## Known Issues to Test

### Issue #1: Incorrect Langenscheidt URL Language Code 🔴

**Location**: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L14)

**Current Code**:
```svelte
return `https://bg.langenscheidt.com/bulgarisch-deutsch/${normalized}`;
```

**Problem**: Uses `bg.langenscheidt.com` (Bulgarian interface) instead of `de.langenscheidt.com` (German interface)

**Expected**: German users should access the German Langenscheidt site: `https://de.langenscheidt.com/bulgarisch-deutsch/{word}`

**Test**: Click external Langenscheidt link from Learn page, verify URL starts with `de.langenscheidt.com` not `bg.langenscheidt.com`

**Recommended Fix**: Change line 14 to:
```svelte
return `https://de.langenscheidt.com/bulgarisch-deutsch/${normalized}`;
```

---

### Issue #2: Vocabulary Card Missing Difficulty Level Display 🔴

**Location**: [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte)

**Problem**: Cards show category badge (blue box) and part-of-speech label but difficulty level (A1, A2, B1, etc.) is not visually displayed

**Expected**: Difficulty level should be visible on card (e.g., "A1", "B1", "C2")

**Current Display**:
- ✅ Category: "Begrüßung" (blue badge)
- ✅ Part of Speech: "Substantiv"
- ❌ Difficulty Level: Not visible (but data exists in `item.difficulty`)

**Test**: 
1. Open /vocabulary page
2. Look at any vocabulary card
3. Check if difficulty level (A1-C2) is displayed
4. Should show alongside category and part-of-speech

**Recommended Fix**: Add difficulty level display to VocabularyCard component:
```svelte
<!-- Add after part-of-speech -->
<span class="difficulty-badge">{item.difficulty}</span>
```

---

### Issue #3: Missing "Lernen" (Learn) Tab on Vocabulary Page 🔴

**Location**: [src/routes/vocabulary/+page.svelte](src/routes/vocabulary/+page.svelte#L1)

**Problem**: Vocabulary page only has "Üben" (Practice) button. Missing "Lernen" (Learn) button for learning before practicing.

**Expected Workflow**:
1. User views vocabulary item
2. User can click "Lernen" to learn the item (view flashcard, definitions, examples)
3. User can click "Üben" to practice the item (test understanding)

**Current Workflow**: Only practice available, no learning step

**Test**: 
1. Open /vocabulary page
2. Look for "Lernen" button on vocabulary cards
3. Should navigate to `/learn/[id]` page

**Recommended Implementation**: Add "Lernen" button to VocabularyCard:
```svelte
<!-- Alongside existing "Üben" button -->
<button onclick={() => goto(`/learn/${item.id}`)} class="learn-btn">
  Lernen
</button>
```

---

## Navigation Structure

### Current Navigation Tabs

```yaml
Navigation Bar (Top):
├── 🏠 Home (Dashboard)
│   └── Route: /
│   └── Content: Progress counter, quick links
│
├── 📚 Vocabulary / Речник
│   └── Route: /vocabulary
│   └── Content: Searchable vocabulary list with filters
│   └── Actions: Practice (Üben), Learn (Lernen - MISSING)
│
├── 📖 Grammar / Граматика
│   └── Route: /grammar
│   └── Content: Grammar rules and examples
│   └── Actions: View grammar rules, examples
│
├── 🎯 Practice / Упражнения
│   └── Route: /practice
│   └── Content: Interactive practice mode
│   └── Actions: Answer questions, check results
│
└── 🧠 Learn / Учене
    └── Route: /learn/[id]
    └── Content: Flashcard learning interface
    └── Actions: Flip cards, view definitions, external resources

Language Toggle (Top-Right):
├── DE (German) / BG (Bulgarian)
└── Switches entire UI language
```

---

## Tab-by-Tab Testing Plan

### TAB 1: HOME / DASHBOARD 🏠

**Route**: `/`  
**Access**: Click "Home" or navigate directly to `http://localhost:5173/`

#### Elements to Verify

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Page Title | Text | "Dashboard" in both languages | ⏳ TO TEST |
| Progress Counter | Component | Shows statistics (items studied, accuracy, streak) | ⏳ TO TEST |
| Quick Links | Buttons | Navigate to other tabs | ⏳ TO TEST |
| Language Toggle | Button | Switches UI language | ⏳ TO TEST |
| Navigation Bar | Menu | All tabs visible and clickable | ⏳ TO TEST |

#### Buttons to Test

1. **"Vocabulary" / "Речник" Button**
   - Expected: Navigate to /vocabulary
   - Verify: URL changes, vocabulary list loads

2. **"Grammar" / "Граматика" Button**
   - Expected: Navigate to /grammar
   - Verify: Grammar content loads

3. **"Practice" / "Упражнения" Button**
   - Expected: Navigate to /practice
   - Verify: Practice interface loads

4. **"Learn" / "Учене" Button**
   - Expected: Navigate to /learn or show available lessons
   - Verify: Learn interface loads

#### Language Testing

- [ ] Switch to German (DE) - UI displays in German
- [ ] Switch to Bulgarian (BG) - UI displays in Bulgarian
- [ ] Verify "Dashboard" → "Табло" translation
- [ ] Verify all labels translated correctly

#### Issues to Watch

- [ ] Missing progress data (if user has no practice history)
- [ ] Counters showing incorrect values
- [ ] Quick links not navigating

---

### TAB 2: VOCABULARY / РЕЧНИК 📚

**Route**: `/vocabulary`  
**Access**: Click "Vocabulary" or navigate to `http://localhost:5173/vocabulary`

#### Elements to Verify

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Page Title | Text | "Wortschatz sicher aufbauen" (DE) / "Надграждай уверено..." (BG) | ⏳ TO TEST |
| Search Bar | Input | Real-time vocabulary filtering | ⏳ TO TEST |
| Filter Panel | Sidebar | Category, Difficulty, Part-of-Speech, Learning Phase filters | ⏳ TO TEST |
| Vocabulary Cards | Grid | Display vocabulary items with German-Bulgarian pairs | ⏳ TO TEST |
| Item Count | Text | "746 von 746 Einträgen" or "746 от 746 записа" | ⏳ TO TEST |
| Difficulty Badge | Badge | **🔴 ISSUE: Not visible** - Should show A1/B1/C2 | ⏳ TO TEST |

#### Buttons to Test

1. **Individual "Üben" Button (on each card)**
   - Expected: Navigate to practice mode with that item selected
   - Verify: ✅ ALREADY TESTED - WORKING
   - Test again: Click different items, verify each loads correct item

2. **Individual "Lernen" Button (MISSING)**
   - Expected: Navigate to learn page for that item
   - Status: 🔴 MISSING - Should be added

3. **"Auswahl üben" Batch Button (Header)**
   - Expected: Enable when items are checked, navigate to practice with selected items
   - Verify: 
     - [ ] Disabled when no items selected
     - [ ] Enabled when ≥1 item selected
     - [ ] Click text updates: "Auswahl üben (0)" → "Auswahl üben (3)"
     - [ ] Click button navigates to /practice
     - [ ] First selected item loads in practice

4. **"Filter zurücksetzen" Button (Header)**
   - Expected: Clear all filters and reset to show all 746 items
   - Verify:
     - [ ] Click button
     - [ ] Search field clears
     - [ ] All filter selections reset
     - [ ] Item count shows "746 von 746"
     - [ ] All cards visible again

5. **Difficulty Buttons (Filter Panel)**
   - Expected: Filter vocabulary by difficulty level
   - Buttons: "Alle", "A1", "A2", "B1", "B2", "C1"
   - Verify each:
     - [ ] Click button
     - [ ] Card list updates immediately
     - [ ] Item count decreases
     - [ ] Only items with selected difficulty show
     - [ ] Button stays highlighted

6. **Category Dropdown (Filter Panel)**
   - Expected: Filter by vocabulary category
   - Options: 19 categories (Greetings, Numbers, Family, Food, etc.)
   - Verify:
     - [ ] Dropdown opens
     - [ ] Can select any category
     - [ ] List filters correctly
     - [ ] Can select "All" to clear filter

7. **Part of Speech Dropdown (Filter Panel)**
   - Expected: Filter by word type
   - Options: Noun, Verb, Adjective, Adverb, etc.
   - Verify:
     - [ ] Dropdown opens
     - [ ] Can select any POS
     - [ ] List filters correctly

8. **Learning Phase Dropdown (Filter Panel)**
   - Expected: Filter by learning stage
   - Options: 1-7
   - Verify:
     - [ ] Dropdown opens
     - [ ] Can select any phase
     - [ ] List filters correctly

9. **Search Input**
   - Expected: Real-time filtering as user types
   - Verify:
     - [ ] Type "Hallo" - shows only "Hallo" items
     - [ ] Type "Hallo Welt" - shows both
     - [ ] Type gibberish - shows "No results"
     - [ ] Clear search - shows all items again

10. **Checkbox Selection**
    - Expected: Select individual items for batch practice
    - Verify:
        - [ ] Click checkbox - item selected (visual feedback)
        - [ ] Item highlights
        - [ ] "Auswahl üben" button updates count
        - [ ] Uncheck - item deselected
        - [ ] Multiple selections work

#### Filter Combinations to Test

- [ ] Difficulty A1 + Category Greetings
- [ ] Difficulty B1 + Part-of-Speech Noun
- [ ] Learning Phase 1 + Search "Hallo"
- [ ] Multiple filters together
- [ ] Apply filters → Reset → Verify all 746 items return

#### UI/UX to Verify

- [ ] Vocabulary cards display correctly:
  - [ ] Category badge (blue box)
  - [ ] Part-of-speech label
  - [ ] **Difficulty level (MISSING - should add)**
  - [ ] German word
  - [ ] Arrow/direction indicator
  - [ ] Bulgarian translation
- [ ] Cards are clickable for navigation
- [ ] Responsive layout on mobile
- [ ] Filter panel collapses on mobile

#### Language Testing

- [ ] Toggle to German - All labels in German
- [ ] Toggle to Bulgarian - All labels in Bulgarian
- [ ] Card content displays in correct language direction:
  - [ ] DE→BG: "German → Bulgarian"
  - [ ] BG→DE: "Bulgarian ← German"

---

### TAB 3: GRAMMAR / ГРАМАТИКА 📖

**Route**: `/grammar`  
**Access**: Click "Grammar" or navigate to `http://localhost:5173/grammar`

#### Elements to Verify

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Page Title | Text | "Grammatik" (DE) / "Граматика" (BG) | ⏳ TO TEST |
| Grammar Rules | Content | List of 12 Bulgarian grammar rules with examples | ⏳ TO TEST |
| Examples | Text | Examples in both German and Bulgarian | ⏳ TO TEST |
| Navigation | Links | Can return to other tabs | ⏳ TO TEST |

#### Buttons/Links to Test

1. **Back to Vocabulary**
   - Expected: Navigate back to /vocabulary
   - Verify: URL changes, vocabulary list loads

2. **Grammar Rule Links (if any)**
   - Expected: Link to detailed rule pages
   - Verify: Navigation works

3. **Example Expansion (if collapsible)**
   - Expected: Click to show/hide detailed examples
   - Verify: Toggle works smoothly

#### Content Verification

- [ ] All 12 grammar rules display
- [ ] Rule titles in both languages
- [ ] Examples provided for each rule
- [ ] Examples grammatically correct in both languages
- [ ] No missing content
- [ ] Formatting is readable

#### Language Testing

- [ ] German mode (DE) - Text in German
- [ ] Bulgarian mode (BG) - Text in Bulgarian
- [ ] Example translations accurate

---

### TAB 4: PRACTICE / УПРАЖНЕНИЯ 🎯

**Route**: `/practice`  
**Access**: Click "Practice" or click "Üben" button from vocabulary

#### Elements to Verify

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Page Title | Text | "Üben" (DE) / "Упражнения" (BG) | ⏳ TO TEST |
| Mode Selector | Buttons | "📝 Üben", "🔍 Suchen" buttons | ⏳ TO TEST |
| Language Direction | Toggle | "🇩🇪 Deutsch → 🇧🇬 Bulgarisch" | ⏳ TO TEST |
| Statistics | Display | Correct/Incorrect count, accuracy %, series | ⏳ TO TEST |
| Word Display | Card | German or Bulgarian word (based on mode) | ⏳ TO TEST |
| Input Field | Input | Text field for entering answer | ⏳ TO TEST |
| Check Button | Button | "Antwort prüfen" / "Провери отговор" | ⏳ TO TEST |

#### Buttons to Test

1. **"📝 Üben" Mode Button**
   - Expected: User guesses translation of displayed word
   - Verify:
     - [ ] Shows German word (if DE→BG mode)
     - [ ] Shows Bulgarian word (if BG→DE mode)
     - [ ] Input accepts text
     - [ ] Submit button checks answer
     - [ ] Feedback displays (correct/incorrect)

2. **"🔍 Suchen" Search Mode Button**
   - Expected: User searches for correct word from list
   - Verify:
     - [ ] Shows search interface
     - [ ] Can type to filter
     - [ ] Clicking word marks as answer
     - [ ] Feedback displays

3. **Language Direction Toggle**
   - Expected: Switch between DE→BG and BG→DE
   - Verify:
     - [ ] Clicking toggles direction
     - [ ] Questions change language
     - [ ] Answers expected in correct language

4. **Navigation Back Button**
   - Expected: Return to vocabulary or previous page
   - Verify: URL changes, vocabulary loads

#### Practice Flow to Test

- [ ] Load practice mode
- [ ] View first question
- [ ] Type answer
- [ ] Click "Check Answer"
- [ ] See feedback (correct/incorrect)
- [ ] Next question appears
- [ ] Statistics update
- [ ] Continue for 5-10 questions
- [ ] No errors in console

#### Language Testing

- [ ] All UI text in German (DE mode)
- [ ] All UI text in Bulgarian (BG mode)
- [ ] Questions display in correct language
- [ ] Feedback in correct language

---

### TAB 5: LEARN / УЧЕНЕ 🧠

**Route**: `/learn/[id]`  
**Access**: Click "Learn" from vocabulary card (feature to add) or navigate directly

#### Elements to Verify

| Element | Type | Expected Behavior | Status |
|---------|------|-------------------|--------|
| Flashcard | Component | German-Bulgarian word pair on card | ⏳ TO TEST |
| Flip Animation | Animation | Card flips to show other language | ⏳ TO TEST |
| Definition | Text | Word definition and usage | ⏳ TO TEST |
| Examples | Text | Usage examples in context | ⏳ TO TEST |
| External Links | Links | Langenscheidt, DWDS, etc. | ⏳ TO TEST |
| Navigation | Buttons | Next/Previous cards, back to list | ⏳ TO TEST |

#### Buttons to Test

1. **Flashcard Flip Button**
   - Expected: Click to flip and see other side
   - Verify:
     - [ ] Card flips with animation
     - [ ] German shows German side
     - [ ] Bulgarian shows Bulgarian side
     - [ ] Can flip multiple times

2. **Langenscheidt Link**
   - Expected: Opens external dictionary link
   - **🔴 ISSUE**: Currently uses `bg.langenscheidt.com` instead of `de.langenscheidt.com`
   - Verify:
     - [ ] Click link opens in new tab
     - [ ] URL is correct: `https://de.langenscheidt.com/bulgarisch-deutsch/...`
     - [ ] ⚠️ Currently has wrong URL (bg instead of de)

3. **DWDS Link (German Resources)**
   - Expected: Opens DWDS dictionary
   - Verify:
     - [ ] Click opens DWDS page
     - [ ] Word is correctly encoded in URL
     - [ ] Page loads

4. **Duden Link (German Resources)**
   - Expected: Opens Duden dictionary
   - Verify:
     - [ ] Click opens Duden page
     - [ ] Word encoded correctly
     - [ ] Page loads

5. **Bulgarian Academy (БАН) Link**
   - Expected: Opens Bulgarian dictionary
   - Verify:
     - [ ] Click opens БАН page
     - [ ] Word encoded correctly
     - [ ] Page loads

6. **Next Button**
   - Expected: Navigate to next vocabulary item
   - Verify:
     - [ ] Click loads next item
     - [ ] Card updates with new word
     - [ ] No errors

7. **Previous Button**
   - Expected: Navigate to previous vocabulary item
   - Verify:
     - [ ] Click loads previous item
     - [ ] Card updates with new word

8. **Back to List Button**
   - Expected: Return to vocabulary list
   - Verify:
     - [ ] Click navigates to /vocabulary
     - [ ] Vocabulary list loads

#### External Links to Verify

| Resource | URL Format | Status | Notes |
|----------|-----------|--------|-------|
| Langenscheidt | `https://de.langenscheidt.com/bulgarisch-deutsch/{word}` | 🔴 BROKEN | Currently uses `bg` instead of `de` |
| DWDS | `https://www.dwds.de/wb/{german-word}` | ⏳ TO TEST | German dictionary |
| Duden | `https://www.duden.de/suchen/dudenonline/{german-word}` | ⏳ TO TEST | German reference |
| БАН | `https://ibl.bas.bg/rbe/lang/bg/{bulgarian-word}` | ⏳ TO TEST | Bulgarian academy |

#### Content to Verify

- [ ] Word definition displays
- [ ] Usage examples present
- [ ] Translation accurate
- [ ] Related words suggested
- [ ] Audio pronunciation available (if implemented)
- [ ] Cultural notes displayed (if available)

#### Language Testing

- [ ] German UI (DE mode)
- [ ] Bulgarian UI (BG mode)
- [ ] Card displays both languages correctly

---

## Component Testing Checklist

### VocabularyCard Component

**File**: [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte)

#### Visual Elements

- [ ] Category badge displays correctly
  - [ ] Color is blue
  - [ ] Text is category name
  - [ ] Positioned correctly on card

- [ ] Part-of-Speech label displays
  - [ ] Shows word type (Noun, Verb, Adjective, etc.)
  - [ ] Correct word type shown
  - [ ] Positioned correctly

- [ ] **Difficulty Level** 🔴 MISSING
  - [ ] Should show difficulty badge (A1, A2, B1, B2, C1, C2)
  - [ ] Color-coded by difficulty level
  - [ ] Positioned visibly on card
  - [ ] Currently NOT visible

- [ ] German-Bulgarian word pair
  - [ ] German word displayed
  - [ ] Arrow or separator shown
  - [ ] Bulgarian translation displayed
  - [ ] Correct direction indicator

#### Interactive Elements

- [ ] "Üben" (Practice) button
  - [ ] Clickable
  - [ ] Correct styling
  - [ ] Navigates to practice mode
  - [ ] ✅ TESTED & WORKING

- [ ] "Lernen" (Learn) button 🔴 MISSING
  - [ ] Should exist on card
  - [ ] Clickable
  - [ ] Navigates to learn page
  - [ ] Currently NOT present

- [ ] Selection checkbox (on vocabulary page)
  - [ ] Clickable
  - [ ] Toggles selection state
  - [ ] Updates batch button count
  - [ ] Visual feedback on click

#### Responsive Design

- [ ] Desktop (1200px+)
  - [ ] Card size appropriate
  - [ ] All elements visible
  - [ ] Buttons accessible

- [ ] Tablet (768px-1199px)
  - [ ] Card size responsive
  - [ ] Text readable
  - [ ] Buttons still clickable

- [ ] Mobile (< 768px)
  - [ ] Card stacks correctly
  - [ ] Text wraps properly
  - [ ] Buttons accessible on small screens

### Navigation Component

**File**: [src/routes/+layout.svelte](src/routes/+layout.svelte)

#### Tab Visibility

- [ ] All navigation tabs visible
  - [ ] Home icon visible
  - [ ] Vocabulary tab visible
  - [ ] Grammar tab visible
  - [ ] Practice tab visible
  - [ ] Learn tab visible

#### Navigation Functionality

- [ ] All tabs clickable
  - [ ] Home navigation works
  - [ ] Vocabulary navigation works
  - [ ] Grammar navigation works
  - [ ] Practice navigation works
  - [ ] Learn navigation works

- [ ] Current page highlighted
  - [ ] Active tab shows different styling
  - [ ] Highlights correct current page
  - [ ] Updates when navigating

#### Language Toggle

- [ ] Language switch visible
  - [ ] DE button visible
  - [ ] BG button visible

- [ ] Language switching works
  - [ ] Click DE - entire UI in German
  - [ ] Click BG - entire UI in Bulgarian
  - [ ] Language persists on page refresh

---

## External Links Verification

### Langenscheidt Dictionary Links

**Issue**: 🔴 **CRITICAL** - Wrong domain used

**Current Implementation**:
- File: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L8-L14)
- URL: `https://bg.langenscheidt.com/bulgarisch-deutsch/{word}`
- Problem: Uses Bulgarian site (`bg`) instead of German site (`de`)

**Correct Implementation Should Be**:
```svelte
const langenscheidtUrl = $derived.by(() => {
  const bulgarian = item.bulgarian;
  const normalized = bulgarian
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-я0-9-]/g, '');
  return `https://de.langenscheidt.com/bulgarisch-deutsch/${normalized}`;  // ← Change bg to de
});
```

**Why This Matters**:
- User expects to access German interface
- Bulgarian interface less helpful for German learners
- Inconsistent with app's German→Bulgarian learning focus

### DWDS Dictionary Links

**File**: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L21-L26)

**URL Pattern**: `https://www.dwds.de/wb/{german-word}`

**Test Steps**:
1. [ ] Open /learn/[id] page
2. [ ] Find DWDS link
3. [ ] Click link
4. [ ] Verify opens DWDS.de with correct word
5. [ ] URL properly encoded (spaces → +, special chars handled)

### Duden Dictionary Links

**File**: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L27-L32)

**URL Pattern**: `https://www.duden.de/suchen/dudenonline/{german-word}`

**Test Steps**:
1. [ ] Open /learn/[id] page
2. [ ] Find Duden link
3. [ ] Click link
4. [ ] Verify opens Duden.de with correct search
5. [ ] URL properly encoded

### Bulgarian Academy (БАН) Links

**File**: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L33-L39)

**URL Pattern**: `https://ibl.bas.bg/rbe/lang/bg/{bulgarian-word}`

**Test Steps**:
1. [ ] Open /learn/[id] page
2. [ ] Find БАН link
3. [ ] Click link
4. [ ] Verify opens БАН website with Bulgarian word
5. [ ] URL properly encoded

---

## UI/UX Verification

### Visual Consistency

#### Color Scheme

- [ ] Primary colors consistent across pages
- [ ] Buttons use consistent colors
- [ ] Category badges use consistent blue
- [ ] Difficulty badges (if added) use consistent colors
  - [ ] A1/A2 - Light green
  - [ ] B1/B2 - Yellow
  - [ ] C1/C2 - Orange/Red

#### Typography

- [ ] Page titles consistent size
- [ ] Body text readable
- [ ] Labels clear and concise
- [ ] Font families consistent

#### Spacing & Layout

- [ ] Margins consistent
- [ ] Padding consistent
- [ ] Grid alignment proper
- [ ] White space appropriate

### Accessibility

- [ ] Buttons have accessible labels
- [ ] Links have descriptive text
- [ ] Images have alt text
- [ ] Color not only distinguishing feature
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Responsive Design

- [ ] Mobile (320px-767px)
  - [ ] Layout stacks properly
  - [ ] Touch targets large enough (48px minimum)
  - [ ] Text readable without zoom
  - [ ] Buttons accessible

- [ ] Tablet (768px-1023px)
  - [ ] Layout optimized for tablet
  - [ ] Sidebar collapses if needed
  - [ ] Grid 2-column if appropriate
  - [ ] All content visible

- [ ] Desktop (1024px+)
  - [ ] Sidebar visible
  - [ ] Multi-column layout
  - [ ] Full width utilized
  - [ ] All features visible

---

## Data Quality Verification

### Vocabulary Items

#### Structure Verification

- [ ] All 746 items present
- [ ] Each item has:
  - [ ] ID (unique)
  - [ ] German word
  - [ ] Bulgarian translation
  - [ ] Category
  - [ ] Part of speech
  - [ ] Difficulty level
  - [ ] Learning phase

#### Content Verification

- [ ] German words grammatically correct
- [ ] Bulgarian words grammatically correct
- [ ] Translations accurate
- [ ] Categories appropriate
- [ ] Difficulty levels correct
- [ ] No missing data
- [ ] No duplicate entries

#### Display Verification

- [ ] Words display in correct language
- [ ] Translations display correctly
- [ ] Categories show correctly
- [ ] Difficulty visible (after fix)
- [ ] No encoding issues
- [ ] Special characters display properly

### Categories

- [ ] All 19 categories present
- [ ] Category labels correct
- [ ] Items assigned to correct categories
- [ ] All categories have items
- [ ] No orphaned items

### Difficulty Levels

- [ ] A1 items present
- [ ] A2 items present
- [ ] B1 items present
- [ ] B2 items present
- [ ] C1 items present
- [ ] C2 items present
- [ ] Count of each level reasonable

---

## Test Execution Log

### Day 1: Navigation Testing

#### Home / Dashboard Tab
- [ ] Navigate to /
- [ ] Page loads correctly
- [ ] Title displays: "Dashboard"
- [ ] Progress counter shows
- [ ] Language toggle works
- [ ] All navigation tabs visible
- [ ] Click each tab - navigates correctly
- **Status**: ⏳ PENDING

#### Vocabulary Tab
- [ ] Navigate to /vocabulary
- [ ] Page loads with 746 items
- [ ] Search works
- [ ] All filters work
- [ ] Reset button works
- [ ] "Üben" buttons work ✅ (already tested)
- [ ] "Lernen" button missing 🔴
- [ ] Difficulty level not visible 🔴
- **Status**: ⏳ PENDING - Known issues noted

#### Grammar Tab
- [ ] Navigate to /grammar
- [ ] Grammar rules display
- [ ] Examples show
- [ ] Language toggle works
- **Status**: ⏳ PENDING

#### Practice Tab
- [ ] Navigate to /practice
- [ ] Interface loads
- [ ] Modes available
- [ ] Language direction toggle works
- [ ] Can enter answers
- [ ] Feedback works
- **Status**: ⏳ PENDING

#### Learn Tab
- [ ] Navigate to /learn/[id]
- [ ] Flashcard displays
- [ ] Flip works
- [ ] Definitions show
- [ ] External links work (except Langenscheidt 🔴)
- **Status**: ⏳ PENDING - Known issue noted

### Day 2: Detailed Component Testing

- [ ] VocabularyCard component
- [ ] Navigation component
- [ ] Flashcard component
- [ ] Practice interface
- [ ] All buttons tested individually

### Day 3: External Links Verification

- [ ] Langenscheidt links (fix URL issue 🔴)
- [ ] DWDS links
- [ ] Duden links
- [ ] БАН links

### Day 4: UI/UX & Responsive Testing

- [ ] Mobile responsive (320px)
- [ ] Tablet responsive (768px)
- [ ] Desktop display (1200px)
- [ ] Visual consistency
- [ ] Accessibility

### Day 5: Data Quality & Final Verification

- [ ] All 746 items display
- [ ] No encoding issues
- [ ] Translations accurate
- [ ] Categories correct
- [ ] Difficulty levels correct
- [ ] Final sign-off

---

## Recommended Improvements

### Priority 1: Critical Fixes (Must Do)

#### 1.1 Fix Langenscheidt URL 🔴
- **File**: [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte#L14)
- **Change**: `bg.langenscheidt.com` → `de.langenscheidt.com`
- **Complexity**: Easy (1-line fix)
- **Time**: 2 minutes

#### 1.2 Add Difficulty Level Display 🔴
- **File**: [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte)
- **Add**: Visual difficulty badge showing A1-C2
- **Placement**: Alongside category and POS labels
- **Complexity**: Easy (add component property)
- **Time**: 15 minutes

#### 1.3 Add "Lernen" Button to Vocabulary Page 🔴
- **Files**: 
  - [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte)
  - [src/routes/vocabulary/+page.svelte](src/routes/vocabulary/+page.svelte)
- **Add**: "Lernen" button alongside "Üben" button
- **Navigation**: Go to `/learn/[id]`
- **Complexity**: Medium (add button + handler)
- **Time**: 20 minutes

### Priority 2: Enhancements (Should Do)

#### 2.1 Add Audio Pronunciation
- **Implement**: Play pronunciation for German and Bulgarian
- **Resources**: Google Translate API or Forvo
- **Status**: Future enhancement

#### 2.2 Add More Examples
- **Implement**: 2-3 example sentences per word
- **Language**: Both German and Bulgarian
- **Status**: Data enrichment needed

#### 2.3 Add Cultural Notes
- **Implement**: Context about when/how to use words
- **Language**: Both German and Bulgarian
- **Status**: Future enhancement

### Priority 3: Nice-to-Have (Could Do)

#### 3.1 Dark Mode
- **Implement**: Toggle for dark theme
- **Complexity**: Medium (CSS variables)
- **Status**: Future enhancement

#### 3.2 Word Frequency Statistics
- **Implement**: Show how common each word is
- **Data**: Need frequency analysis
- **Status**: Future enhancement

#### 3.3 Related Words Suggestions
- **Implement**: Show similar words or word families
- **Data**: Need semantic relationships
- **Status**: Future enhancement

---

## Context & Reference Files

### Essential Documentation

| File | Purpose |
|------|---------|
| [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | Current project status and phase completion |
| [AGENTS.md](AGENTS.md) | Development guidelines and best practices |
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | Quick start guide |
| [docs/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | System architecture overview |
| [docs/DEVELOPMENT.md](docs/development/DEVELOPMENT.md) | Development patterns and guidelines |

### Key Source Files

| File | Component | Purpose |
|------|-----------|---------|
| [src/routes/+page.svelte](src/routes/+page.svelte) | Home/Dashboard | Dashboard landing page |
| [src/routes/vocabulary/+page.svelte](src/routes/vocabulary/+page.svelte) | Vocabulary Page | Main vocabulary interface |
| [src/routes/grammar/+page.svelte](src/routes/grammar/+page.svelte) | Grammar Page | Grammar reference |
| [src/routes/practice/+page.svelte](src/routes/practice/+page.svelte) | Practice Interface | Practice mode |
| [src/routes/learn/[id]/+page.svelte](src/routes/learn/[id]/+page.svelte) | Learn Page | Flashcard learning |
| [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte) | VocabularyCard | Card component |
| [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte) | External Links | External resource links |

### Data Files

| File | Content | Size |
|------|---------|------|
| [data/unified-vocabulary.json](data/unified-vocabulary.json) | 746 vocabulary items | ~350KB |
| [data/cultural-grammar.json](data/cultural-grammar.json) | 12 grammar rules | ~50KB |

---

## Test Execution Instructions

### Setup

1. **Start Dev Server**:
   ```bash
   cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
   pnpm run dev
   ```

2. **Open in Browser**:
   ```
   http://localhost:5173
   ```

3. **Open Developer Tools**:
   - F12 or Cmd+Option+I
   - Monitor Console for errors
   - Check Network tab for broken links

### Testing Workflow

1. **Navigate to each tab** in order
2. **Test all buttons** on that tab
3. **Document results** in test log
4. **Screenshot any issues**
5. **Note console errors** if any

### Sign-Off

**All tests pass when**:
- ✅ All navigation tabs accessible
- ✅ All buttons navigate correctly
- ✅ All external links work
- ✅ No console errors
- ✅ UI consistent
- ✅ Data accurate
- ✅ Responsive on all devices
- ✅ Both languages work
- ✅ No broken functionality

---

## Summary

This comprehensive testing plan covers:

✅ **5 Navigation Tabs** - Home, Vocabulary, Grammar, Practice, Learn

✅ **3 Critical Issues Identified**:
1. 🔴 Langenscheidt URL uses wrong language domain
2. 🔴 Vocabulary cards missing difficulty level display
3. 🔴 Vocabulary page missing "Lernen" (Learn) button

✅ **Components to Test** - Cards, Navigation, Flashcards, etc.

✅ **20+ Buttons to Verify** - Navigation, Filters, Actions, Links

✅ **Data Quality Checks** - 746 items, all categories, all difficulty levels

✅ **Responsive Design** - Mobile, Tablet, Desktop

✅ **Languages** - German and Bulgarian UI switching

**Estimated Testing Time**: 4-6 hours  
**Estimated Fix Time for Issues**: 45 minutes  
**Priority**: Complete before deployment

---

**Document Status**: Ready for Testing  
**Last Updated**: December 17, 2025  
**Next Step**: Begin Tab-by-Tab Testing execution
