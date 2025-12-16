# ⚡ Quick Verification Checklist

**Ready to Test?** Follow this 15-minute verification procedure.

---

## 🟢 Pre-Flight Checks (Done ✅)

- ✅ TypeScript checks: 0 errors
- ✅ ESLint: Clean
- ✅ Build: Successful
- ✅ CI Simulation: All checks pass
- ✅ Code deployed: Ready for testing

---

## 🧪 Manual Testing (15 minutes)

### Start Dev Server
```bash
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
pnpm run dev
```
→ Opens at `http://localhost:5173`

---

## ✅ Test #1: Langenscheidt Link (2 min)

**What**: URL domain should be German (`de`), not Bulgarian (`bg`)

**Steps**:
1. Navigate to `/vocabulary`
2. Click any [Lernen] button
3. Scroll to "External Links" section at bottom
4. Click "Langenscheidt" link
5. **EXPECT**: Page opens with German dictionary interface
6. **VERIFY URL**: Should show `https://de.langenscheidt.com/deutsch-bulgarisch/...`

**Pass Criteria**: ✅ German interface loads, URL is correct

---

## ✅ Test #2: Difficulty Badges (3 min)

**What**: All cards should show difficulty level (A1-C2) with color-coding

**Steps**:
1. Navigate to `/vocabulary`
2. **Look at card headers**
3. **EXPECT**: Each card shows difficulty badge (e.g., "A1", "B2", "C1")
4. **VERIFY COLORS**:
   - A1/A2 = Green 🟢
   - B1/B2 = Yellow 🟡
   - C1/C2 = Orange 🟠
5. Switch view to list mode (if available)
6. **EXPECT**: Badges still visible

**Pass Criteria**: ✅ All cards show colored difficulty badges

---

## ✅ Test #3: Learn Button (3 min)

**What**: Each card should have [Lernen] button next to [Üben] button

**Steps**:
1. Navigate to `/vocabulary`
2. **Look at card action buttons**
3. **EXPECT**: Each card shows TWO buttons:
   - [Lernen] (🧠 icon) - for learning/flashcard
   - [Üben] (📝 icon) - for practice
4. Click [Lernen] button
5. **EXPECT**: Navigates to `/learn/[word-id]` page
6. **VERIFY**: 
   - Flashcard shows the word
   - Examples displayed
   - Grammar tabs visible
7. Go back to vocabulary
8. **EXPECT**: Can click [Üben] for practice

**Pass Criteria**: ✅ Learn button present and navigates correctly

---

## ✅ Test #4: Bilingual Mode (2 min)

**What**: Everything should work in both German (DE_BG) and Bulgarian (BG_DE) modes

**Steps**:
1. Navigate to `/vocabulary`
2. **Top Right**: Click language toggle (currently "DE" or "BG")
3. **EXPECT**: Interface switches language
4. **Verify buttons**:
   - German: "Lernen" button
   - Bulgarian: "Научи" button
5. Click Learn button
6. **EXPECT**: Flashcard interface in selected language
7. **VERIFY**: All text is in correct language

**Pass Criteria**: ✅ Bilingual support works for all fixes

---

## ✅ Test #5: Browser Console (1 min)

**What**: No errors or warnings related to fixes

**Steps**:
1. Press `F12` or `Cmd+Option+I` to open DevTools
2. Go to "Console" tab
3. Navigate through pages
4. **EXPECT**: No red error messages
5. **EXPECT**: No errors about undefined refs

**Pass Criteria**: ✅ Console is clean (no errors)

---

## ✅ Test #6: Mobile View (2 min)

**What**: Fixes work on mobile devices

**Steps**:
1. In DevTools, toggle device toolbar (`Cmd+Shift+M`)
2. Set to mobile view (375px width)
3. Navigate to vocabulary
4. **EXPECT**:
   - Difficulty badges visible
   - Lernen button clickable
   - Layout responsive
5. Zoom in/out to test responsiveness

**Pass Criteria**: ✅ Mobile layout works

---

## ✅ Test #7: Keyboard Navigation (1 min)

**What**: Can use keyboard (Tab + Enter) to access all fixes

**Steps**:
1. Navigate to vocabulary
2. Press `Tab` multiple times
3. **EXPECT**: Focus moves to Learn button
4. Press `Enter` with Learn button focused
5. **EXPECT**: Navigates to flashcard page
6. Works without mouse

**Pass Criteria**: ✅ Keyboard navigation works

---

## 📊 Summary Check

| Test | Status | Time |
|------|--------|------|
| #1 Langenscheidt Link | ⏳ Pending | 2 min |
| #2 Difficulty Badges | ⏳ Pending | 3 min |
| #3 Learn Button | ⏳ Pending | 3 min |
| #4 Bilingual Mode | ⏳ Pending | 2 min |
| #5 Browser Console | ⏳ Pending | 1 min |
| #6 Mobile View | ⏳ Pending | 2 min |
| #7 Keyboard Nav | ⏳ Pending | 1 min |
| **TOTAL** | | **15 min** |

---

## 🎯 All Tests Pass? ✅

If you checked all 7 tests above and they all passed:

1. **Deployment Ready**: Push to main branch
   ```bash
   git add .
   git commit -m "fix: resolve 3 critical issues (Langenscheidt URL, difficulty badges, Learn button)"
   git push origin main
   ```

2. **GitHub Pages**: Automatically deploys (watch Actions tab)

3. **Live Testing**: Test on production URL
   ```
   https://yungseepferd.github.io/BulgarianGermanLearningApp/
   ```

---

## ❌ Test Failed?

Check [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for detailed verification steps or [TESTING_QUICK_REFERENCE.md](TESTING_QUICK_REFERENCE.md) for troubleshooting.

---

**Ready to test?** 🚀 Start with `pnpm run dev` and follow the 7 tests above!

