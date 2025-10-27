# QA Test Plan: Vocabulary Language Direction Fix

## Issue Description
Vocabulary cards were showing mixed languages (German, Bulgarian, English) regardless of the language direction setting. When German speakers (DE→BG) were learning Bulgarian, some descriptions appeared in English instead of German. Similarly, Bulgarian speakers (BG→DE) learning German saw English descriptions instead of Bulgarian.

## Root Cause Analysis

### Data Structure
Vocabulary items in `data/vocabulary.json` have multiple note fields:

1. **Direction-specific fields**:
   - `notes_bg_to_de` - Bulgarian speaker learning German (notes in Bulgarian)
   - `notes_de_to_bg` - German speaker learning Bulgarian (notes in German)
   - `linguistic_note_bg_to_de` - Linguistic notes in Bulgarian
   - `linguistic_note_de_to_bg` - Linguistic notes in German

2. **Bilingual fields** (separated by `\n`):
   - `etymology` - Bulgarian text first, then German
   - `cultural_note` - Bulgarian text first, then German

3. **Fallback fields** (English):
   - `notes` - General notes
   - `linguistic_note` - General linguistic notes

### Code Issue
The JavaScript file `assets/js/vocab-cards.js` was:
- Only using direction-specific `notes` fields
- Ignoring `linguistic_note_bg_to_de` / `linguistic_note_de_to_bg`
- Not parsing bilingual `etymology` and `cultural_note` fields
- Falling back to English content when it should show localized content

## Solution Implemented

### Changes to `assets/js/vocab-cards.js`

#### 1. Enhanced `buildNotesHtml()` Method (lines 317-345)
Now renders all direction-aware content:
- Notes
- Etymology (with Bulgarian/German headers)
- Cultural notes (with Bulgarian/German headers)
- Linguistic notes (with Bulgarian/German headers)

#### 2. New `getDirectionSpecificContent()` Helper (lines 347-381)
Smart content resolution with fallback chain:
1. Try direction-specific field (e.g., `notes_de_to_bg`)
2. Parse bilingual fields (split by `\n`, Bulgarian first, German second)
3. Fallback to generic field if available

## Test Cases

### Test Case 1: German Speaker Learning Bulgarian (DE→BG)
**Preconditions**: Language direction set to DE→BG

**Vocabulary Word**: Здравей (Hello)

**Expected Results**:
- ✅ Notes in German: "Für Deutschsprachige: 'Здравей' (zdravej) ≈ 'Hallo'; von 'здрав' (gesund)..."
- ✅ Etymology label: "Etymologie:"
- ✅ Etymology content: "Zusammensetzung aus 'добро' (gut) und 'утро' (Morgen)"
- ✅ Cultural note label: "Kulturelle Anmerkung:"
- ✅ Cultural note in German
- ✅ Linguistic note label: "Linguistische Anmerkung:"
- ✅ Linguistic note in German

**Test Steps**:
1. Open vocabulary page
2. Set language toggle to DE→BG (German speaker learning Bulgarian)
3. View vocabulary card for "Здравей"
4. Flip card to see back
5. Verify all text is in German (no Bulgarian or English)

### Test Case 2: Bulgarian Speaker Learning German (BG→DE)
**Preconditions**: Language direction set to BG→DE

**Vocabulary Word**: Hallo (Здравей)

**Expected Results**:
- ✅ Notes in Bulgarian: "В немски 'Hallo' е универсално и неформално приветствие..."
- ✅ Etymology label: "Произход:"
- ✅ Etymology content: "'добро' + 'утро' (сложна форма)"
- ✅ Cultural note label: "Културна бележка:"
- ✅ Cultural note in Bulgarian
- ✅ Linguistic note label: "Лингвистична бележка:"
- ✅ Linguistic note in Bulgarian

**Test Steps**:
1. Open vocabulary page
2. Set language toggle to BG→DE (Bulgarian speaker learning German)
3. View vocabulary card for "Hallo"
4. Flip card to see back
5. Verify all text is in Bulgarian (no German or English)

### Test Case 3: Language Direction Switch
**Objective**: Verify dynamic re-rendering when language direction changes

**Test Steps**:
1. Open vocabulary page with DE→BG direction
2. Open vocabulary card "Добро утро" (Good Morning)
3. Verify notes are in German
4. Switch language direction to BG→DE using language toggle
5. Verify same card now shows notes in Bulgarian
6. Verify all labels changed (Etymologie → Произход, etc.)

**Expected Results**:
- ✅ Cards re-render automatically when direction changes
- ✅ No page reload required
- ✅ All content switches to appropriate language
- ✅ Labels update correctly

### Test Case 4: Fallback Handling
**Objective**: Verify graceful fallback for incomplete data

**Test Steps**:
1. Find vocabulary item with only generic notes (no direction-specific)
2. Switch between DE→BG and BG→DE
3. Verify same content shows in both directions

**Expected Results**:
- ✅ No errors or blank cards
- ✅ Generic content shown when direction-specific unavailable
- ✅ Bilingual fields correctly parsed

### Test Case 5: Multiple Vocabulary Items
**Objective**: Verify fix works across all vocabulary

**Test Steps**:
1. Load vocabulary page with all items (no filters)
2. Set direction to DE→BG
3. Flip through 10-15 random cards
4. Verify all notes are in German
5. Switch to BG→DE direction
6. Flip through same 10-15 cards
7. Verify all notes are now in Bulgarian

**Expected Results**:
- ✅ Consistent language across all cards
- ✅ No English content (except rare fallbacks)
- ✅ Performance remains acceptable

## Browser Compatibility Testing

Test in the following browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Regression Testing

Ensure existing functionality still works:
- ✅ Card flip animation
- ✅ Category filtering
- ✅ Level filtering (A1, A2, etc.)
- ✅ Search functionality
- ✅ Keyboard navigation
- ✅ Accessibility (screen readers)
- ✅ localStorage persistence of language direction

## Performance Testing

Verify no performance degradation:
- ✅ Initial page load time
- ✅ Language direction switch speed
- ✅ Card rendering with 100+ vocabulary items
- ✅ Memory usage (no leaks)

## Code Quality Checks

- ✅ ESM syntax check passes: `npm run lint:esm`
- ✅ No console errors
- ✅ Proper HTML escaping (XSS protection)
- ✅ JSDoc comments for new methods
- ✅ Code follows existing style conventions

## Known Limitations

1. **Server-rendered cards**: The `vocab-card.html` shortcode (for individual static cards) does not support dynamic language direction and will show mixed content
   - **Impact**: Low (rarely used, only in test pages)
   - **Mitigation**: Use `vocab.html` shortcode with VocabCards.js for production

2. **Vocabulary data quality**: Some older vocabulary items may have:
   - English-only content in generic fields
   - Missing direction-specific fields
   - **Impact**: Medium (affects user experience)
   - **Mitigation**: Data cleanup task scheduled

## Sign-Off Checklist

Before marking as complete, verify:
- [ ] All test cases pass
- [ ] No console errors in browser DevTools
- [ ] Language toggle works bidirectionally
- [ ] All vocabulary cards show correct language
- [ ] No English content visible (except rare fallbacks)
- [ ] Performance is acceptable
- [ ] Code review completed
- [ ] Documentation updated

## Testing Notes

**Test Date**: 2025-10-27
**Tested By**: QA Team
**Build**: claude/fix-build-cache-011CUXdRNoc3fbc57aB8KLT6
**Status**: Ready for Testing

---

## Sample Test Data

### German Speaker (DE→BG) - Expected German Output
```
Word: Здравей
Notes: "Für Deutschsprachige: 'Здравей' (zdravej) ≈ 'Hallo'; von 'здрав' (gesund)..."
Etymologie: "Zusammensetzung aus 'добро' (gut) und 'утро' (Morgen)"
Kulturelle Anmerkung: "Höfliche Morgenbegrüßung bis ca. 11 Uhr."
Linguistische Anmerkung: "Betonung auf der zweiten Silbe: здраве́й..."
```

### Bulgarian Speaker (BG→DE) - Expected Bulgarian Output
```
Word: Hallo
Notes: "В немски 'Hallo' е универсално и неформално приветствие..."
Произход: "'добро' + 'утро' (сложна форма)"
Културна бележка: "Използва се до около 10–11 ч. за учтиво сутрешно приветствие."
Лингвистична бележка: "'Guten Morgen' се произнася [ˈɡuːtn̩ ˈmɔʁɡn̩]..."
```
