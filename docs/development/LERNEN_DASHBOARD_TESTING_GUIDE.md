# Lernen Dashboard - Quick Testing Guide

**Quick Start**: Navigate to http://localhost:5173/vocabulary → Click any flashcard → Explore the 7 dashboard tabs

---

## 🎯 5-Minute Quick Test

### 1. Navigation Test (30 seconds)
1. Go to http://localhost:5173/vocabulary
2. Click the **first flashcard** in the list
3. ✅ Verify you land on `/learn/[id]` page
4. ✅ Verify flashcard is displayed at top
5. ✅ Verify hero section shows: German ↔ Bulgarian

### 2. Tab Navigation Test (1 minute)
Click through all 7 tabs in order:

1. **📋 Überblick** (Overview) → Should show quick summary
2. **📖 Grammatik** (Grammar) → Should show grammar content
3. **🔗 Wortfamilie** (Family) → Should show synonyms/antonyms
4. **💬 Beispiele** (Examples) → Should show example sentences
5. **🔍 Analyse** (Analysis) → Should show etymology
6. **📝 Notizen** (Notes) → Should show cultural notes
7. **🌐 Ressourcen** (Resources) → Should show external links

✅ Verify each tab loads without errors

### 3. Language Toggle Test (30 seconds)
1. Click **BG** button (top right)
2. ✅ Verify all tab labels change to Bulgarian
3. ✅ Verify hero section arrow flips (← instead of →)
4. Click **DE** button
5. ✅ Verify everything switches back to German

### 4. Keyboard Navigation Test (1 minute)
1. Click on first tab (Überblick)
2. Press **Tab** key repeatedly
3. ✅ Verify you can navigate through all tabs
4. Press **Enter** on a tab
5. ✅ Verify tab activates
6. Press **Escape**
7. ✅ Verify you return to previous page

### 5. External Links Test (30 seconds)
1. Click **🌐 Ressourcen** tab
2. Click **Langenscheidt** link
3. ✅ Verify it opens in new tab
4. ✅ Verify URL contains Bulgarian word
5. Close tab and return to dashboard

---

## 📋 Comprehensive Test Scenarios

### Scenario 1: Test with Noun (Declension Table)

**Test Word**: "Haus" (house)

1. Search for "Haus" in vocabulary
2. Click the flashcard
3. Navigate to **📖 Grammatik** tab
4. ✅ Verify declension table is displayed
5. ✅ Verify table has 4 rows (Nominativ, Akkusativ, Dativ, Genitiv)
6. ✅ Verify table has 2 columns (Singular, Plural)

**Expected Output**:
```
┌──────────────┬──────────┬──────────┐
│ Case         │ Singular │ Plural   │
├──────────────┼──────────┼──────────┤
│ Nominativ    │ das Haus │ die Häuser│
│ Akkusativ    │ das Haus │ die Häuser│
│ Dativ        │ dem Haus │ den Häusern│
│ Genitiv      │ des Hauses│ der Häuser│
└──────────────┴──────────┴──────────┘
```

---

### Scenario 2: Test with Verb (Conjugation Table)

**Test Word**: "spielen" (to play)

1. Search for "spielen" in vocabulary
2. Click the flashcard
3. Navigate to **📖 Grammatik** tab
4. ✅ Verify conjugation table is displayed
5. ✅ Verify 4 tense tabs (Präsens, Vergangenheit, Perfekt, Futur)
6. Click each tense tab
7. ✅ Verify 6 pronoun rows (ich, du, er/sie/es, wir, ihr, sie/Sie)

**Expected Output (Präsens)**:
```
┌─────────────┬──────────────┐
│ Pronoun     │ Form         │
├─────────────┼──────────────┤
│ ich         │ spiele       │
│ du          │ spielst      │
│ er/sie/es   │ spielt       │
│ wir         │ spielen      │
│ ihr         │ spielt       │
│ sie/Sie     │ spielen      │
└─────────────┴──────────────┘
```

---

### Scenario 3: Test with Word Family

**Test Word**: "gut" (good)

1. Search for "gut" in vocabulary
2. Click the flashcard
3. Navigate to **🔗 Wortfamilie** tab
4. ✅ Verify synonyms section (green cards)
5. ✅ Verify antonyms section (red cards)
6. ✅ Hover over word cards
7. ✅ Verify hover animation (lift + shadow)

**Expected Sections**:
- ✅ Synonyme (schön, prima, toll)
- ⇄ Antonyme (schlecht, böse)
- 🔗 Verwandte Wörter (besser, am besten)

---

### Scenario 4: Test with Examples

**Test Word**: "Hallo" (hello)

1. Search for "Hallo" in vocabulary
2. Click the flashcard
3. Navigate to **💬 Beispiele** tab
4. ✅ Verify numbered examples (1, 2, 3...)
5. ✅ Verify direction arrow (→ or ←)
6. ✅ Verify context labels (if present)

**Expected Format**:
```
[1]  Hallo, wie geht's?
     ─────────→─────────
     Здравей, как си?
     ℹ️ Informal greeting
```

---

### Scenario 5: Test Etymology & Breakdown

**Test Word**: "Vorstellung" (introduction / imagination)

1. Search for "Vorstellung" in vocabulary
2. Click the flashcard
3. Navigate to **🔍 Analyse** tab
4. ✅ Verify etymology section (if available)
5. ✅ Verify word breakdown (Vor- + Stellung)
6. ✅ Verify component meanings

**Expected Breakdown**:
```
Vor-  →  before, in front of
        Note: Prefix indicating spatial/temporal precedence

Stellung  →  position, placement
           Note: Noun derived from "stellen" (to place)
```

---

### Scenario 6: Test Cultural Notes

**Test Word**: With cultural metadata

1. Find a word with cultural notes
2. Navigate to **📝 Notizen** tab
3. ✅ Verify cultural notes section (🌍 green gradient)
4. ✅ Verify mnemonics section (💡 yellow gradient)
5. ✅ Verify language-specific tips (🇩🇪 / 🇧🇬)

**Expected Sections**:
- 🌍 Kulturelle Hinweise
- 💡 Merkhilfe
- 📝 Allgemeine Hinweise
- 🎓 Lerntipps (Für Deutschsprachige / Für Bulgarischsprachige)

---

### Scenario 7: Test External Resources

**Test Any Word**:

1. Click any word
2. Navigate to **🌐 Ressourcen** tab
3. ✅ Verify Langenscheidt link (large featured card)
4. ✅ Verify German dictionaries (DWDS, Duden)
5. ✅ Verify Bulgarian dictionary (БАН Речник)
6. Click each link
7. ✅ Verify opens in new tab
8. ✅ Verify URLs are correct

**Expected Links**:
- ⭐ Langenscheidt: `https://bg.langenscheidt.com/bulgarisch-deutsch/[word]`
- 🇩🇪 DWDS: `https://www.dwds.de/wb/[german-word]`
- 🇩🇪 Duden: `https://www.duden.de/suchen/dudenonline/[german-word]`
- 🇧🇬 БАН: `https://ibl.bas.bg/rbe/lang/bg/[bulgarian-word]`

---

## 📱 Mobile Testing

### Test on Mobile Device (or resize browser to < 768px)

1. **Tab Navigation**:
   - ✅ Tabs show only icons (no labels)
   - ✅ Tab bar is scrollable horizontally
   - ✅ Active tab is highlighted

2. **Component Layout**:
   - ✅ All cards are single column
   - ✅ No horizontal overflow
   - ✅ Text is readable (no tiny fonts)

3. **Tables**:
   - ✅ Declension table is scrollable
   - ✅ Conjugation table is scrollable
   - ✅ Headers remain visible

4. **Examples**:
   - ✅ Source/target stack vertically
   - ✅ Arrow rotates 90° (↓)

---

## ♿ Accessibility Testing

### Screen Reader Test (VoiceOver on macOS)

1. Enable VoiceOver: `Cmd + F5`
2. Navigate to dashboard
3. ✅ Verify tab navigation is announced
4. ✅ Verify tab labels are read correctly
5. ✅ Verify table headers are read
6. ✅ Verify link descriptions are clear

### Keyboard-Only Test

1. **Disable mouse/trackpad**
2. Navigate using only keyboard:
   - **Tab**: Move between elements
   - **Shift+Tab**: Move backward
   - **Enter/Space**: Activate buttons/tabs
   - **Escape**: Close/go back

3. ✅ Verify all interactive elements are reachable
4. ✅ Verify focus is visible (blue outline)
5. ✅ Verify no keyboard traps

### Color Contrast Test

1. Use browser DevTools color contrast analyzer
2. ✅ Verify text has ≥ 4.5:1 contrast ratio
3. ✅ Verify buttons have ≥ 3:1 contrast ratio
4. ✅ Test with high contrast mode enabled

---

## 🐛 Known Issues to Check

### Potential Issues

1. **Missing Data**: Some words may not have all metadata
   - ✅ Verify empty states are shown gracefully
   - ✅ Verify no JavaScript errors in console

2. **Long Words**: German compound words can be very long
   - ✅ Verify text wraps correctly
   - ✅ Verify no horizontal overflow

3. **Special Characters**: Bulgarian Cyrillic, German umlauts
   - ✅ Verify all characters render correctly
   - ✅ Verify URLs are properly encoded

4. **Tab State**: Refreshing page should reset to Overview
   - ✅ Verify activeTab resets on page load
   - ✅ Verify no stale tab state

---

## 📊 Test Results Template

Copy and fill out during testing:

```markdown
## Test Results - [Date]

### Quick Tests
- [ ] Navigation from Vocabulary tab works
- [ ] All 7 tabs load without errors
- [ ] Language toggle works (DE ↔ BG)
- [ ] Keyboard navigation works
- [ ] External links open correctly

### Detailed Tests
- [ ] Noun declension table displays correctly
- [ ] Verb conjugation table displays correctly
- [ ] Word family (synonyms/antonyms) displays
- [ ] Examples with context display correctly
- [ ] Etymology and breakdown display correctly
- [ ] Cultural notes display correctly
- [ ] External resources display correctly

### Mobile Tests
- [ ] Tab icons only (no labels)
- [ ] Single column layout
- [ ] Tables are scrollable
- [ ] No horizontal overflow

### Accessibility Tests
- [ ] Screen reader announces correctly
- [ ] Keyboard-only navigation works
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG 2.1 AA

### Issues Found
1. [Issue description]
2. [Issue description]

### Browser Tested
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Overall Status
- [ ] ✅ Ready for production
- [ ] ⚠️ Minor issues (non-blocking)
- [ ] ❌ Critical issues (blocking)
```

---

## 🚀 Next Steps After Testing

1. **Fix any issues found** during manual testing
2. **Add automated tests** for critical paths
3. **Document edge cases** in AGENTS.md
4. **Update README** with new feature
5. **Deploy to staging** for user testing
6. **Collect user feedback**
7. **Iterate based on feedback**

---

## 📞 Support

**Issues Found?** Report in GitHub Issues with:
- Browser/device info
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)

**Test Results?** Share in project discussion or PR review

---

**Happy Testing! 🎉**

