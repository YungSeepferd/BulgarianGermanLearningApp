# 🎯 Quick Reference: Phase 1 Manual Remediation Framework

**Status**: ✅ Phase 1 Complete | Batch-001 Ready  
**Date**: December 12, 2025  
**Dataset**: 746 vocabulary items | 441 flagged for review (59.12%)

---

## 📂 What You Need to Know

### The Problem
- 746 vocabulary items in German-Bulgarian dictionary
- 441 items (59%) have invalid or missing categories
- Need human-reviewed categorization into 19 valid categories (max 2 per item)
- Goal: Achieve 100% valid categorization with documented rationale

### The Solution
A structured, batch-based manual review framework with validation gates and UI verification.

---

## 🚀 Start Here (Read These Files First)

### 1. **Understand the Task** (5 min)
→ Read: `reports/PHASE-1-COMPLETE-SUMMARY.md`
- Phase 1 accomplishments
- Current status
- Phase 2-5 overview

### 2. **Learn Decision Rules** (15 min)
→ Read: `reports/MANUAL_REVIEW_GUIDE.md`
- 19 category definitions
- Decision examples
- Validation checklists
- Timeline estimates

### 3. **Review Batch-001** (2-3 hours)
→ Open & Edit: `reports/batch-001-sampling-export.json`
- 100 items ready for categorization
- Fill in: `suggestedCategories`, `decidedCategories`, `rationale`
- Mark: `approved: true` for each item

---

## 📊 Key Numbers

| Metric | Value |
|--------|-------|
| Total items | 746 |
| Valid items (40.88%) | 305 ✅ |
| Flagged items (59.12%) | 441 🔄 |
| Valid categories | 19 |
| Max categories per item | 2 |
| Batch size | 100 items |
| Estimated total batches | 4-5 |
| Total time to completion | 9-13 hours |

---

## 📁 Directory Structure

```
reports/
├── PHASE-1-COMPLETE-SUMMARY.md      ← START HERE (Phase overview)
├── MANUAL_REVIEW_GUIDE.md           ← Decision rules & examples
├── batch-001-sampling-export.json   ← 100 items to categorize
├── validation-summary.json          ← Full analysis (counts per category)
├── validation-flagged-items.md      ← All 441 flagged items listed
└── category-changelog.md            ← Batch tracking log

data/
├── category-whitelist.json          ← 19 canonical categories
└── unified-vocabulary.json          ← Main vocabulary file
```

---

## 🎓 19 Valid Categories

```
greetings           → Hallo, Auf Wiedersehen
numbers             → eins, zwei, Nummer
family              → Mutter, Vater, Großvater
food                → Apfel, Brot, Wasser
colors              → rot, blau, gelb
animals             → Katze, Hund, Vogel
body-parts          → Auge, Hand, Fuß
clothing            → Hemd, Jacke, Schuh
home                → Haus, Tisch, Fenster
nature              → Baum, Blume, Berg
transport           → Auto, Zug, Flugzeug
technology          → Computer, Telefon
time                → Stunde, Tag, Jahreszeit
weather             → Regen, Sonne, Schnee
professions         → Arzt, Lehrer, Ingenieur
places              → Stadt, Straße, Park
grammar             → Verb, Adjektiv, Nominativ
culture             → Musik, Kunstwerk, Tradition
everyday-phrases    → bitte, danke, wie geht's?
```

---

## 🔄 Decision Template

Each item in `batch-001-sampling-export.json` has this structure:

```json
{
  "batchIndex": 1,
  "itemId": "together_001",
  "german": "zusammen",
  "bulgarian": "заедно",
  "currentCategories": [],
  "issue": "invalid-categories",
  "invalidCategories": [],
  
  // FILL THESE IN:
  "suggestedCategories": ["everyday-phrases"],      // 1-2 suggestions
  "decidedCategories": ["everyday-phrases"],        // Final choice
  "rationale": "Common word meaning 'together'",    // Why?
  "approved": true                                  // Done?
}
```

---

## ✅ Workflow (Phase 2-5)

### Phase 2: Manual Review (2-3 hours)
```
1. Open batch-001-sampling-export.json
2. For each of 100 items:
   ├─ Read German & Bulgarian
   ├─ Think about context
   ├─ Fill suggestedCategories (max 2)
   ├─ Fill decidedCategories (final choice)
   ├─ Add rationale (brief explanation)
   └─ Set approved: true
3. Save file
```

### Phase 3: Validate (30 min)
```bash
# Preview what will change
pnpm node fix-remaining-categories.mjs --batch batch-001-sampling-export.json --dry

# Review reports/category-fix-report.json
```

### Phase 4: Apply (5 min)
```bash
# Apply changes (creates backup first)
pnpm node fix-remaining-categories.mjs --batch batch-001-sampling-export.json

# Confirms: "✅ Data saved"
```

### Phase 5: UI Verify (30 min)
```bash
# Start dev server
pnpm run dev

# Check in browser:
# 1. Go to /vocabulary
# 2. Look at filters - see your categories?
# 3. Search for a word - does it show?
# 4. Switch language - still works?
# 5. No "uncategorized" anywhere?
```

### Phase 6: Commit (10 min)
```bash
git add reports/ data/
git commit -m "Batch-001: Manual categorization (100 items)"
git push
```

---

## 🎯 Decision Examples

### Example 1: Easy (Clear category)
```
German:  "Mutter" (mother)
Bulgarian: "Майка"

→ Category: family (obvious kinship term)
→ Rationale: "Direct kinship term; family category is primary"
```

### Example 2: Ambiguous (Choose one)
```
German:  "Suppe" (soup)
Bulgarian: "Супа"

→ Suggestions: food, home (soup is food, made in home kitchen)
→ Decided: food (more specific than home)
→ Rationale: "Edible item; food more specific than home"
```

### Example 3: Multi-use (Accept 2 categories)
```
German:  "Fenster" (window)
Bulgarian: "Прозорец"

→ Suggestions: home, architecture
→ Decided: home (max 1 since architecture not in whitelist)
→ Rationale: "Found in home; primary usage context"
```

---

## 🚨 Common Pitfalls

| ❌ Don't | ✅ Do |
|---------|------|
| Use categories not in whitelist | Use only the 19 valid categories |
| Assign more than 2 categories | Limit to max 2 per item |
| Leave decidedCategories empty | Always fill in decision |
| Skip rationale for uncertain items | Always explain your choice |
| Mark approved: false | Only mark true when review complete |
| Leave batch in limbo | Apply & commit when ready |

---

## 📋 Validation Checklists

### Before You Apply Batch
- [ ] All 100 items have decidedCategories filled
- [ ] No item has more than 2 categories
- [ ] All categories exist in whitelist
- [ ] All items marked approved: true
- [ ] Rationale provided for unclear decisions

### After You Apply Batch
- [ ] validation-summary.json shows more valid items
- [ ] No "uncategorized" items remain
- [ ] Category distribution looks balanced
- [ ] Diff report shows expected changes only
- [ ] No error messages in console

### UI Verification
- [ ] Filters on /vocabulary show all categories
- [ ] No "uncategorized" filter option
- [ ] Search results include categories
- [ ] Language toggle doesn't break display
- [ ] No console errors

---

## 📈 Progress Tracking

### Current Phase
- ✅ Phase 1: Infrastructure created
- 🔄 Phase 2: Manual review (awaiting your input)
- ⏳ Phase 3: Validation & apply
- ⏳ Phase 4: UI verification
- ⏳ Phase 5: Commit
- ⏳ Repeat for Batches 2-4

### Items Processed
- Batch-001: 0/100 (awaiting review)
- Batch-002: Not created yet
- Batch-003: Not created yet
- Batch-004: Not created yet
- **Total: 0/441 (0%)**

---

## 🆘 Troubleshooting

### "I'm unsure about a category"
→ Read the category definitions in `reports/MANUAL_REVIEW_GUIDE.md`
→ Look at examples provided
→ When in doubt, choose ONE category (the most relevant)

### "The JSON format looks wrong"
→ Validate using online JSON validator
→ Ensure: `suggestedCategories` and `decidedCategories` are arrays
→ Example: `"decidedCategories": ["family"]` (not just `"family"`)

### "Script won't apply my changes"
→ Run with `--dry` first: `pnpm node fix-remaining-categories.mjs --batch batch-001-sampling-export.json --dry`
→ Check `reports/category-fix-report.json` for errors
→ Verify all items are approved: true

### "UI still shows wrong categories"
→ Clear browser cache (Cmd+Shift+R)
→ Restart dev server: Kill and `pnpm run dev` again
→ Check `unified-vocabulary.json` was actually updated

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| Where's the batch file? | `reports/batch-001-sampling-export.json` |
| How do I know what categories to use? | `reports/MANUAL_REVIEW_GUIDE.md` |
| What if I disagree with a decision? | Document your rationale; decisions are tracked |
| Can I change a batch after applying? | Yes; create new batch with corrections |
| How many batches total? | 4-5 batches for 441 items |
| How long does this take? | 2-3 hours per batch = 9-13 hours total |

---

## 🎯 Next Action

**→ OPEN**: `reports/batch-001-sampling-export.json`  
**→ READ**: `reports/MANUAL_REVIEW_GUIDE.md`  
**→ REVIEW**: 100 items  
**→ FILL**: suggestedCategories, decidedCategories, rationale  
**→ MARK**: approved: true  
**→ SAVE**: File  

**Then proceed with Phase 3 validation!**

---

**Phase 1**: ✅ Complete  
**Batch-001**: 🟢 Ready for manual review  
**Your role**: 👤 Categorization reviewer  
**Status**: 🟡 Awaiting manual decisions

*Phase 1 Summary | December 12, 2025*
