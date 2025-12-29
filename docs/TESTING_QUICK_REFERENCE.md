# Testing & Fixes Quick Reference

**Created**: December 17, 2025  
**Purpose**: Quick guide for testing and implementing fixes  
**Format**: Condensed checklists and command references

---

## Quick Start - Testing

### 1. Start Dev Server
```bash
cd /Users/dinz/Coding\ Projects/BulgariaLearn/BulgarianApp-Fresh
pnpm run dev
```
→ Open `http://localhost:5173` in browser

### 2. Open Dev Tools
- Press: `F12` or `Cmd+Option+I`
- Monitor: Console tab for errors
- Check: Network tab for broken links

### 3. Test Each Tab
```
Home (/) → Vocabulary (/vocabulary) → Grammar (/grammar) 
→ Practice (/practice) → Learn (/learn/[id])
```

---

## Three Critical Issues Summary

### Issue #1: Wrong Langenscheidt URL 🔴

| Aspect | Details |
|--------|---------|
| **File** | `src/routes/learn/[id]/components/ExternalLinksPanel.svelte` |
| **Line** | 14 |
| **Problem** | `https://bg.langenscheidt.com/...` (Bulgarian) |
| **Fix** | Change `bg` to `de` |
| **Result** | `https://de.langenscheidt.com/...` (German) |
| **Time** | 2 minutes |

**One-line fix**:
```svelte
// Line 14 - Change this:
return `https://bg.langenscheidt.com/bulgarisch-deutsch/${normalized}`;

// To this:
return `https://de.langenscheidt.com/bulgarisch-deutsch/${normalized}`;
```

---

### Issue #2: Missing Difficulty Level Display 🔴

| Aspect | Details |
|--------|---------|
| **File** | `src/lib/components/ui/VocabularyCard.svelte` |
| **Problem** | Difficulty (A1, B1, C2) not visible on card |
| **Fix** | Add difficulty badge component |
| **Result** | Difficulty displayed next to category and POS |
| **Time** | 15 minutes |

**Steps**:
1. Add HTML badge to card header
2. Add CSS color-coding
3. Test on /vocabulary page

**Visual Example**:
```
Card Header:  [Category] [POS] [A1] ← Add this
```

---

### Issue #3: Missing "Lernen" Button 🔴

| Aspect | Details |
|--------|---------|
| **File** | `src/lib/components/ui/VocabularyCard.svelte` |
| **Problem** | Only "Üben" button, missing "Lernen" button |
| **Fix** | Add Learn button with handler |
| **Result** | Cards show [Lernen] [Üben] [❤️] |
| **Time** | 20 minutes |

**Workflow**:
- Add `handleLearn()` function
- Add Learn button HTML
- Add button styling

**Result**: `goto(/learn/[id])`

---

## Testing Tab-by-Tab

### HOME / DASHBOARD 🏠
```
URL: http://localhost:5173/
Elements: Title, Progress Counter, Navigation
Buttons: Vocabulary, Grammar, Practice, Learn tabs
Language: Toggle DE/BG
✓ Pass if: Loads correctly, all tabs clickable, language switches
```

### VOCABULARY 📚
```
URL: http://localhost:5173/vocabulary
Elements: Search, Filters, 746 Cards, Count display
Cards Show: [Category] [POS] [A1*] German → Bulgarian
Buttons: [Lernen*] [Üben] [❤️]
  * These features need fixing
Filters: Difficulty, Category, POS, Learning Phase
✓ Pass if: 746 items load, filters work, buttons navigate
```

### GRAMMAR 📖
```
URL: http://localhost:5173/grammar
Content: 12 grammar rules with examples
Language: Both German and Bulgarian
✓ Pass if: All rules display, examples correct, no errors
```

### PRACTICE 🎯
```
URL: http://localhost:5173/practice
Modes: [📝 Üben] [🔍 Suchen]
Direction: [🇩🇪 DE → 🇧🇬 BG]
Flow: Word shown → User answers → Feedback
✓ Pass if: Q&A works, direction toggle works, feedback displays
```

### LEARN 🧠
```
URL: http://localhost:5173/learn/[id]
Features: Flashcard, Definitions, Examples
Links: Langenscheidt*, DWDS, Duden, БАН
  * Langenscheidt URL needs fixing
✓ Pass if: Flashcard works, definitions load, links work
```

---

## All Buttons to Test

### Navigation Tabs
- [ ] Home
- [ ] Vocabulary
- [ ] Grammar
- [ ] Practice
- [ ] Learn

### Vocabulary Page Buttons
- [ ] Individual "Üben" ✅ TESTED & WORKING
- [ ] Individual "Lernen" 🔴 MISSING
- [ ] Batch "Auswahl üben" ✅ CODE VERIFIED
- [ ] Filter "Schwierigkeit" (Difficulty)
- [ ] Filter "Kategorie" (Category)
- [ ] Filter "Wortart" (POS)
- [ ] Filter "Lernphase" (Learning Phase)
- [ ] Reset "Filter zurücksetzen" ✅ CODE VERIFIED
- [ ] Search input (real-time filtering)
- [ ] Item checkboxes (selection)

### Practice Page Buttons
- [ ] Mode "📝 Üben"
- [ ] Mode "🔍 Suchen"
- [ ] Direction toggle
- [ ] Check Answer
- [ ] Next/Previous
- [ ] Back to Vocabulary

### Learn Page Links
- [ ] Langenscheidt 🔴 WRONG URL
- [ ] DWDS
- [ ] Duden
- [ ] БАН (Bulgarian Academy)

### Other Buttons
- [ ] Language toggle (DE/BG)
- [ ] Favorite/Heart button
- [ ] Back/Close buttons

---

## Issue Fix Order

### Recommended Order (Fastest First)

**1. Fix Langenscheidt URL** (2 min)
```bash
# Edit file
code src/routes/learn/[id]/components/ExternalLinksPanel.svelte
# Change line 14: bg → de
```

**2. Add Difficulty Display** (15 min)
```bash
# Edit file
code src/lib/components/ui/VocabularyCard.svelte
# Add badge HTML and CSS
```

**3. Add Learn Button** (20 min)
```bash
# Edit file
code src/lib/components/ui/VocabularyCard.svelte
# Add handler, button HTML, and CSS
```

**Total Time**: 37 minutes

---

## Testing Commands

### Check for Errors
```bash
# Type checking
pnpm run check

# Linting
pnpm run lint

# Full CI simulation
pnpm run simulate-ci
```

### Build & Deploy
```bash
# Production build
pnpm run build

# GitHub Pages build
pnpm run build:gh-pages

# Preview production build
pnpm run preview
```

---

## Context Files Reference

### Main Documentation
- [COMPREHENSIVE_TESTING_PLAN.md](COMPREHENSIVE_TESTING_PLAN.md) - Full testing guide
- [CRITICAL_ISSUES_AND_FIXES.md](CRITICAL_ISSUES_AND_FIXES.md) - Detailed issue analysis

### Project Status
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) - Current phase and progress
- [INDEX.md](INDEX.md) - Documentation hub
- [AGENTS.md](AGENTS.md) - Development guidelines

### Architecture & Development
- [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) - System design
- [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md) - Code patterns
- [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) - Quick setup

### Key Source Files
- [src/routes/vocabulary/+page.svelte](src/routes/vocabulary/+page.svelte) - Vocabulary page
- [src/lib/components/ui/VocabularyCard.svelte](src/lib/components/ui/VocabularyCard.svelte) - Card component
- [src/routes/learn/[id]/components/ExternalLinksPanel.svelte](src/routes/learn/[id]/components/ExternalLinksPanel.svelte) - Learn page links

---

## Before Deployment Checklist

### Code Fixes ✅
- [ ] Langenscheidt URL fixed (bg → de)
- [ ] Difficulty badges added and styled
- [ ] Learn button added with handler
- [ ] No console errors

### Testing ✅
- [ ] All navigation tabs work
- [ ] All buttons navigate correctly
- [ ] External links have correct URLs
- [ ] Language switching works (DE/BG)
- [ ] Responsive on mobile/tablet/desktop

### Build & Quality ✅
- [ ] `pnpm run check` passes (TypeScript)
- [ ] `pnpm run lint` passes
- [ ] `pnpm run simulate-ci` passes (full CI)
- [ ] Production build succeeds
- [ ] No warnings or errors

### Documentation ✅
- [ ] Testing completed
- [ ] Issues documented
- [ ] Fixes documented
- [ ] Ready for deployment notes

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Dev server not running | `pnpm run dev` in correct directory |
| Changes not appearing | Check HMR (auto-reload), hard refresh browser (Cmd+Shift+R) |
| TypeScript errors | Run `pnpm run check`, fix errors shown |
| Lint errors | Run `pnpm run lint --fix` for auto-fixes |
| Build fails | Run `pnpm run build` for detailed errors |

---

## Success Criteria

✅ **All items must pass before deployment**:

- [ ] All three issues fixed
- [ ] All buttons tested and working
- [ ] All external links correct
- [ ] No console errors
- [ ] TypeScript checks pass
- [ ] Linting passes
- [ ] Production build succeeds
- [ ] Responsive design verified
- [ ] Both languages work (DE/BG)
- [ ] Documentation complete

---

## Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Fix issues | 45 min | Ready |
| Test all tabs | 2 hours | Pending |
| Verify deployment | 30 min | Pending |
| Documentation | 30 min | Partial |
| **TOTAL** | **3.5 hours** | |

---

**Status**: Ready to execute  
**Priority**: Critical - pre-deployment  
**Next Step**: Begin testing with comprehensive testing plan

---

## Quick Reference URLs

```
Dashboard:    http://localhost:5173/
Vocabulary:   http://localhost:5173/vocabulary
Grammar:      http://localhost:5173/grammar
Practice:     http://localhost:5173/practice
Learn:        http://localhost:5173/learn/[id]
```

---

**Document Status**: Complete  
**Last Updated**: December 17, 2025  
**Ready for Testing**: YES
