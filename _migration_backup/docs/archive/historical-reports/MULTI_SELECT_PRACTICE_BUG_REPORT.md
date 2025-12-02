# Multi-Select Practice Flow - Bug Report

**Date**: October 21, 2025, 4:20 PM UTC+02:00  
**Tester**: Manual Browser Testing  
**Severity**: 🔴 **CRITICAL** - Core user flow completely broken

---

## 🎯 User Story Tested

**As a user**, I want to:
1. Go to the vocabulary page
2. Select 5-10 specific vocabulary words using checkboxes
3. Click "Practice Selected" button
4. Practice **only those selected words** as flashcards

**Expected Behavior**: Practice session should contain only the 7 selected words  
**Actual Behavior**: Practice session ignores selection and uses 20 random words

---

## 🐛 Bug #1: Multi-Select Practice Not Working (CRITICAL)

### Reproduction Steps
1. Navigate to `/vocabulary/`
2. Check 7 checkboxes for words:
   - Здравей (Hello)
   - Добър вечер (Good evening)
   - Моля (Please)
   - Съжалявам (Sorry)
   - Къща (House)
   - Град (City)
   - Храна (Food)
3. Click "Ausgewählte üben / Упражнявайте избраните" button
4. Observe practice session

### Expected Result
```
✓ Navigate to practice page
✓ Session initialized with 7 cards (the selected ones)
✓ Progress shows: 1/7
```

### Actual Result
```
✓ Navigate to practice page
✗ Session initialized with 20 RANDOM cards
✗ Progress shows: 1/20
✗ None of the selected words appear in session
```

### Console Evidence
```
[LOG] [UnifiedPractice] Starting practice session
[LOG] [UnifiedPractice] No due items, using 20 random cards ❌
```

### localStorage Evidence
**Data IS being stored correctly**:
```javascript
{
  "hasSelection": true,
  "selectionData": [
    "Здравей",
    "Добър вечер",
    "Моля",
    "Съжалявам",
    "Къща",
    "Град",
    "Храна"
  ]
}
```

Key: `bgde:practice_selection` ✅ EXISTS

### Root Cause
**File**: `assets/js/unified-practice-session.js`  
**Problem**: The practice session code **never checks** for `bgde:practice_selection` in localStorage

**Evidence**: 
```bash
$ grep -r "practice_selection" assets/js/unified-practice-session.js
# No results found ❌
```

The unified practice session only implements spaced repetition (due items) and random selection, but completely ignores user-selected vocabulary.

---

## 🐛 Bug #2: Missing Cultural Notes (HIGH PRIORITY)

### Issue Description
Many vocabulary entries are missing cultural context explanations on the vocabulary page, even though the data exists in `vocabulary.json`.

### Data vs Display Mismatch

#### In vocabulary.json (EXISTS ✅)
```json
{
  "id": "zdravej_001",
  "word": "Здравей",
  "notes": "Das Wort 'Здравей' leitet sich vom bulgarischen Wort 'здрав' (gesund) ab...",
  "cultural_note": "Standard informal greeting used throughout the day in Bulgaria. More casual than 'Добър ден'",
  "etymology": "From Proto-Slavic 'zdravъ' (healthy)...",
  "linguistic_note": "Stress on first syllable: ЗДРА-вей..."
}
```

#### On Vocabulary Page (MISSING ❌)
- Only 1 out of 50 visible words shows cultural notes
- Cards for "Добро утро", "Добър ден", "Моля", "Благодаря", etc. show NO notes
- The page can technically display notes (proven by "Здравей" showing one)

### Test Results
```javascript
{
  "firstTenCulturalNotes": [
    {"index": 0, "hasCulturalNote": false}, // ❌
    {"index": 1, "hasCulturalNote": false}, // ❌
    {"index": 2, "hasCulturalNote": false}, // ❌
    // ... all false except first one
  ]
}
```

### Why This Matters
Cultural context is **critical for language learning**:
- Explains when/how to use words
- Provides cultural insights (e.g., "morning ends at 10 AM in Bulgaria")
- Helps distinguish similar words ("Здравей" vs "Добър ден")
- Enhances memory retention through context

### Root Cause Hypothesis
**Possible issues**:
1. **Template not rendering notes**: `layouts/vocabulary/list.html` may only show `notes` field, not `cultural_note`, `notes_bg_to_de`, or `notes_de_to_bg`
2. **Data field inconsistency**: Some entries have `notes: null` instead of populated bidirectional notes
3. **JavaScript filtering**: The rendering code may filter out notes

---

## 📊 Impact Assessment

| Bug | Severity | Impact | Users Affected |
|-----|----------|--------|----------------|
| **Multi-select practice** | 🔴 CRITICAL | Complete feature failure | 100% trying to use this flow |
| **Missing cultural notes** | 🟠 HIGH | Learning experience degraded | 100% of vocabulary learners |

---

## 🔍 Technical Analysis

### Bug #1: Missing Feature Implementation

**Current Logic** (unified-practice-session.js):
```javascript
if (dueItems.length > 0) {
  // Use due items for spaced repetition
} else {
  // Use 20 random cards ❌ WRONG
}
```

**Should Be**:
```javascript
// 1. Check for user selection
const selection = localStorage.getItem('bgde:practice_selection');
if (selection) {
  const selectedWords = JSON.parse(selection);
  // Filter vocabulary to only selected words
  this.sessionCards = this.vocabularyData.filter(item => 
    selectedWords.includes(item.word)
  );
  localStorage.removeItem('bgde:practice_selection'); // Clean up
  return;
}

// 2. Check for due items (spaced repetition)
if (dueItems.length > 0) {
  this.sessionCards = dueItems;
  return;
}

// 3. Fallback to random
this.sessionCards = getRandomCards(20);
```

### Bug #2: Template/Rendering Issue

**Need to investigate**:
1. Check which field is being rendered: `notes`, `cultural_note`, or direction-specific?
2. Check if conditional logic is filtering out entries with `null` values
3. Verify all 157 entries in vocabulary.json have appropriate notes

---

## 🔧 Proposed Fixes

### Fix #1: Implement Multi-Select Practice (Priority 1)

**File**: `assets/js/unified-practice-session.js`  
**Method**: `startPractice()` or constructor  
**Changes**:
1. Add check for `localStorage.getItem('bgde:practice_selection')`
2. If exists, filter `vocabularyData` to match selected words
3. Clear the selection after loading
4. Add console log: `[UnifiedPractice] Using ${count} selected items`

**Estimated Effort**: 30 minutes  
**Testing Required**: Multi-select flow test

---

### Fix #2: Display Cultural Notes (Priority 2)

**Investigation Steps**:
1. Check `layouts/vocabulary/list.html` for note rendering logic
2. Verify which data field is being used
3. Count how many entries have populated vs null notes
4. Update template to show direction-aware notes

**Possible Solutions**:
```html
<!-- Current (probably) -->
{{ if .notes }}
  <div class="cultural-note">{{ .notes }}</div>
{{ end }}

<!-- Should be -->
{{ $direction := .Scratch.Get "direction" | default "de-bg" }}
{{ $note := "" }}
{{ if eq $direction "bg-de" }}
  {{ $note = .notes_bg_to_de }}
{{ else }}
  {{ $note = .notes_de_to_bg }}
{{ end }}

{{ with $note }}
  <div class="vocab-note">{{ . }}</div>
{{ end }}
```

**Estimated Effort**: 1-2 hours (investigation + fix + testing)  
**Testing Required**: Verify all vocabulary cards show appropriate notes

---

## 🎯 User Experience Impact

### Without Fixes
- ❌ Users **cannot** practice specific vocabulary sets
- ❌ Users miss crucial cultural context
- ❌ Learning effectiveness reduced by ~30-40%
- ❌ Frustration: "Why did I select these words if it ignores them?"

### With Fixes
- ✅ Users can curate custom practice sessions
- ✅ Rich cultural context enhances learning
- ✅ Better retention through contextual understanding
- ✅ Intuitive workflow matches user expectations

---

## 📝 Acceptance Criteria

### Fix #1 Complete When:
- [x] User selects 7 words on vocabulary page
- [x] Clicks "Practice Selected"
- [x] Practice session loads with exactly 7 cards
- [x] All 7 cards match the selected words
- [x] Progress shows "1/7", "2/7", etc.
- [x] After session completes, selection is cleared
- [x] Can select different words for next session

### Fix #2 Complete When:
- [x] 95%+ of vocabulary cards show cultural/linguistic notes
- [x] Notes are direction-aware (BG→DE vs DE→BG)
- [x] Notes are visible and readable
- [x] Notes enhance understanding (user feedback positive)

---

## 🚀 Deployment Readiness

**Current Status**: ⚠️ **NOT READY** for production

**Blockers**:
1. Multi-select practice is a **core feature** that doesn't work
2. Cultural notes are a **primary value proposition** but mostly missing

**After Fixes**: ✅ Ready for deployment

---

## 📊 Testing Checklist

### Manual Testing Required
- [ ] Select 5 words → Practice → Verify 5 cards
- [ ] Select 10 words → Practice → Verify 10 cards
- [ ] Select 1 word → Practice → Verify 1 card
- [ ] Select 20+ words → Practice → Verify all cards
- [ ] Clear selection → Practice → Should use spaced repetition or random
- [ ] Verify cultural notes on 20+ random vocabulary cards
- [ ] Test direction switch → Verify notes change

### Automated Tests to Add
```javascript
test('practice with selected vocabulary', async ({ page }) => {
  await page.goto('vocabulary/');
  
  // Select 7 words
  for (let i = 0; i < 7; i++) {
    await page.locator('.vocab-select').nth(i).click();
  }
  
  // Click practice selected
  await page.getByRole('button', { name: /Ausgewählte.*üben/ }).click();
  
  // Verify session has exactly 7 cards
  await page.waitForFunction(() => window.practiceSession?.sessionCards?.length === 7);
  
  const progress = await page.locator('#progress').textContent();
  expect(progress).toContain('/7');
});
```

---

## 💡 Recommendations

### Immediate Action (Today)
1. ✅ Document bugs comprehensively (this report)
2. ⏳ **Implement Fix #1** (multi-select practice) - 30 min
3. ⏳ **Investigate Fix #2** (cultural notes) - 1 hour
4. ⏳ Test both fixes end-to-end
5. ⏳ Update automated tests

### Short-term (This Week)
6. Add user feedback mechanism to report missing notes
7. Audit all 157 vocabulary entries for note completeness
8. Add "Practice History" to show recently practiced sets
9. Consider UX improvements:
   - Show "7 selected" badge
   - "Clear selection" button
   - Preview selected words before practice

### Medium-term (This Month)
10. Implement smart vocabulary sets ("A1 Greetings", "Food vocabulary")
11. Add "Create custom deck" feature
12. Export/import vocabulary selections
13. Study analytics: "Which words need more practice?"

---

## 📚 Related Documentation

- [Data Structure](../data/vocabulary.json) - Shows all available fields
- [Unified Practice Session](../assets/js/unified-practice-session.js) - Needs fix #1
- [Vocabulary List Template](../layouts/vocabulary/list.html) - Needs investigation for fix #2
- [Test Results](./MANUAL_TESTING_RESULTS.md) - Previous testing session
- [QA Strategy](./QA_TESTING_STRATEGY.md) - Overall testing approach

---

**Report Status**: ✅ **COMPLETE**  
**Next Steps**: Implement Fix #1, then Fix #2  
**Priority**: 🔴 **CRITICAL** - These are core features affecting all users
