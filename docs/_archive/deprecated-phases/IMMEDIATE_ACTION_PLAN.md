# 🚀 Immediate Action Plan

**Date**: December 11, 2025 | **Status**: Ready for implementation

This document outlines the exact steps to fix the 3 critical issues found during deep analysis.

---

## ⏱️ Time Estimate: 30 minutes total

- Issue #1 Fix: 15 minutes
- Issue #2 Fix: 0 minutes (automatic)
- Issue #3 Fix: 5 minutes
- Testing: 10 minutes

---

## 🔴 Issue #1: Vocabulary Data Incomplete

**File**: `data/unified-vocabulary.json`

### Problem
Current file has 750 incomplete items (only id + categories). Expected: 2,743 complete items.

### Fix Steps

**Step 1: Create rebuild script**
Create `scripts/rebuild-vocabulary.ts` with the complete script from [CRITICAL_ISSUES_DETAILS.md](docs/CRITICAL_ISSUES_DETAILS.md) (~350 lines).

OR use quick command if available:
```bash
pnpm run rebuild:vocabulary
```

**Step 2: Run the rebuild**
```bash
pnpm run rebuild:vocabulary
# This will regenerate data/unified-vocabulary.json with complete data
```

**Step 3: Verify the fix**
```bash
pnpm run verify:vocabulary
# Expected output:
# ✅ Found 2,743 items
# ✅ All items have required fields
```

**Step 4: Check the file**
```bash
# Verify the file size increased (was 48 KB, should be ~5.2 MB)
ls -lh data/unified-vocabulary.json
```

### Success Indicators
✅ `data/unified-vocabulary.json` exists  
✅ File size is ~5.2 MB (was 48 KB)  
✅ Contains 2,743+ items  
✅ Each item has: id, german, bulgarian, partOfSpeech, difficulty, categories  

---

## 🟠 Issue #2: Practice & Learn Routes Blank

**Files**: 
- `src/routes/practice/+page.svelte`
- `src/routes/learn/+page.svelte`

### Problem
Routes show blank pages because vocabulary data is incomplete (Issue #1).

### Fix Steps

**Step 1: Wait for Issue #1 fix**
Once Issue #1 is fixed, this automatically resolves.

**Step 2: Verify the fix**
```bash
pnpm run dev
# Open http://localhost:5173/practice
# Should show practice interface (not blank)

# Open http://localhost:5173/learn
# Should show lesson interface (not blank)
```

### Success Indicators
✅ `/practice` page loads (not blank)  
✅ `/learn` page loads (not blank)  
✅ Vocabulary items appear in both  
✅ No console errors  

---

## 🟡 Issue #3: Grammar Examples in Latin

**File**: `src/routes/grammar/+page.svelte` (lines 7-12)

### Problem
Grammar examples show Latin transliteration instead of Cyrillic.

### Fix Steps

**Step 1: Open the file**
```bash
# Open in editor
code src/routes/grammar/+page.svelte
```

**Step 2: Find the grammar rules**
Look for the `grammarRules` array around line 7-12.

**Step 3: Replace 6 examples**

**BEFORE** (current):
```svelte
const grammarRules = [
  { rule: 'Nominative', example: 'Az kaza - I say', explanation: 'Subject form' },
  { rule: 'Accusative', example: 'Ty grabish - You grab', explanation: 'Object form' },
  { rule: 'Dative', example: 'Toi/Tya grab - He/She grabs', explanation: 'Indirect object' },
  // ... more items with Latin text
];
```

**AFTER** (fixed):
```svelte
const grammarRules = [
  { rule: 'Nominative', example: 'Аз казвам - I say', explanation: 'Subject form' },
  { rule: 'Accusative', example: 'Ти грабиш - You grab', explanation: 'Object form' },
  { rule: 'Dative', example: 'Той/Тя грабя - He/She grabs', explanation: 'Indirect object' },
  // ... more items with Cyrillic text
];
```

**Step 4: Find and replace all**
Use Find & Replace (Ctrl+H / Cmd+H) with these mappings:

| Find | Replace |
|------|---------|
| Az kaza | Аз казвам |
| Ty grabish | Ти грабиш |
| Toi/Tya grab | Той/Тя грабя |
| Mi grabim | Ми грабим |
| Vi grabite | Ви грабите |
| Tei grabat | Те грабят |

**Step 5: Verify the fix**
```bash
pnpm run dev
# Open http://localhost:5173/grammar
# All examples should show in Cyrillic (not Latin)
```

### Success Indicators
✅ All grammar examples use Cyrillic  
✅ Text is readable (not Latin transliteration)  
✅ No syntax errors in page  

---

## ✅ Testing & Verification

### Test All Fixes
```bash
# 1. Start dev server
pnpm run dev

# 2. Verify data loading
pnpm run verify:vocabulary
# Should show: ✅ Found 2,743 items

# 3. Run unit tests
pnpm run test:unit

# 4. Run E2E tests
pnpm run test:e2e

# 5. Full CI simulation
pnpm run simulate-ci
```

### Manual Verification

**Test Issue #1 (Vocabulary)**
1. Open http://localhost:5173
2. Go to dashboard
3. Should show vocabulary items
4. Click search
5. Should load vocabulary list

**Test Issue #2 (Practice/Learn)**
1. Go to http://localhost:5173/practice
2. Should show practice interface (not blank)
3. Should show vocabulary items
4. Go to http://localhost:5173/learn
5. Should show lesson interface (not blank)

**Test Issue #3 (Grammar)**
1. Go to http://localhost:5173/grammar
2. Check all examples show in Cyrillic
3. Text should be readable (not Latin)

---

## 📋 Complete Checklist

### Issue #1: Vocabulary Data
- [ ] Run `pnpm run rebuild:vocabulary`
- [ ] Verify `data/unified-vocabulary.json` is ~5.2 MB
- [ ] Run `pnpm run verify:vocabulary` (should pass)
- [ ] File contains 2,743+ items
- [ ] Each item has required fields

### Issue #2: Practice/Learn Routes
- [ ] Navigate to http://localhost:5173/practice
- [ ] Page shows content (not blank)
- [ ] Navigate to http://localhost:5173/learn
- [ ] Page shows content (not blank)
- [ ] No console errors on either page

### Issue #3: Grammar Examples
- [ ] Edit `src/routes/grammar/+page.svelte`
- [ ] Replace 6 Latin examples with Cyrillic
- [ ] Navigate to http://localhost:5173/grammar
- [ ] All examples show in Cyrillic
- [ ] Text is readable

### Testing
- [ ] Run `pnpm run test:unit` (should pass)
- [ ] Run `pnpm run test:e2e` (should pass)
- [ ] Run `pnpm run simulate-ci` (should pass)
- [ ] No console warnings/errors

---

## 🔗 Additional Resources

**For Issue #1 Details**
→ [docs/CRITICAL_ISSUES_DETAILS.md](docs/CRITICAL_ISSUES_DETAILS.md) (complete rebuild script)

**For Understanding the Issues**
→ [docs/CRITICAL_ISSUES_ANALYSIS.md](docs/CRITICAL_ISSUES_ANALYSIS.md)

**For Development Help**
→ [docs/DEVELOPMENT.md](docs/development/DEVELOPMENT.md)

**For Troubleshooting**
→ [docs/DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md)

---

## 📞 Getting Help

**If Issue #1 rebuild fails:**
1. Check error message
2. See [docs/DEBUGGING_GUIDE.md](docs/DEBUGGING_GUIDE.md)
3. Review [docs/CRITICAL_ISSUES_DETAILS.md](docs/CRITICAL_ISSUES_DETAILS.md)

**If Issue #2 still shows blank pages:**
1. Clear browser cache (hard refresh)
2. Stop dev server and restart
3. Check console for errors
4. Verify Issue #1 rebuild completed

**If Issue #3 has display issues:**
1. Check file encoding (should be UTF-8)
2. Verify Cyrillic characters copied correctly
3. Check for typos in replace operation

---

## ⏱️ Timeline

```
[Start] → Issue #1 (15 min) → Issue #2 (auto) → Issue #3 (5 min) → Testing (10 min) → [Complete]
         [Rebuild vocab]     [Verify pages]   [Grammar text]      [Run tests]
```

---

## 🎯 Success

When all fixes are complete:
✅ Vocabulary page loads and searches work  
✅ Practice page shows interface with items  
✅ Learn page shows interface with items  
✅ Grammar page shows examples in Cyrillic  
✅ All tests pass  
✅ No console errors  

---

**Start Time**: [Your time]  
**Expected End**: [Your time + 30 minutes]  
**Next Step**: Run `pnpm run rebuild:vocabulary` → Follow checklist above

