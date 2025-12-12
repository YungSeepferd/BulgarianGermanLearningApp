# Manual Categorization Review Guide

**Date**: December 12, 2025  
**Dataset**: German-Bulgarian Vocabulary (746 items)  
**Total Flagged**: 441 items (59.12% of total)

---

## 📊 Current Status

| Metric | Count |
|--------|-------|
| **Total Items** | 746 |
| **Valid (correct categories)** | 305 (40.88%) |
| **Flagged for Review** | 441 (59.12%) |
| **Invalid Categories** | 441 |
| **Multi-category Items** | 6 |
| **Ambiguity Flagged** | 0 |

---

## 🎯 Categorization Strategy

### Valid Categories (19 total)
```
greetings, numbers, family, food, colors, animals, body-parts,
clothing, home, nature, transport, technology, time, weather,
professions, places, grammar, culture, everyday-phrases
```

**Constraints**:
- Max 2 categories per item
- No "uncategorized" items allowed
- All items must be in whitelist categories

---

## 📋 Batch Processing Workflow

### Phase 1: Sampling & Review (Current)
1. **Batch-001**: 100-item sample from flagged items
   - File: `reports/batch-001-sampling-export.json`
   - Status: Ready for manual review
   - Remaining: 341 items

### Phase 2: Categorization (Next)
For each item in batch:
1. Review the German and Bulgarian terms
2. Assess semantic meaning and context
3. Select appropriate categories (max 2)
4. Add brief rationale
5. Mark as approved

### Phase 3: Validation & Integration (After Phase 2)
- Validate batch decisions against schema
- Apply categories back to main vocabulary
- Create audit trail of changes
- Generate diff report

### Phase 4: UI Verification (Parallel)
- Verify `/vocabulary` filters show all categories
- Confirm no "uncategorized" items appear
- Test language mode switching

---

## 📑 Files Generated

### Reports
| File | Purpose |
|------|---------|
| `validation-summary.json` | Full validation analysis (counts per category, flagged items) |
| `validation-flagged-items.md` | Markdown listing of all 441 flagged items |
| `batch-001-sampling-export.json` | 100-item batch with decision template |
| `category-whitelist.json` | Canonical category list |
| `category-changelog.md` | Batch-by-batch change log |

### Scripts
| Script | Purpose |
|--------|---------|
| `validate-vocabulary-comprehensive.mjs` | Generate validation report |
| `export-batch-sampling.mjs` | Export batch samples for review |
| `fix-remaining-categories.mjs` | Apply categorization decisions (with --dry for preview) |

---

## 🛠️ How to Review a Batch

### Manual Review Template

For each item in `batch-001-sampling-export.json`:

```json
{
  "batchIndex": 1,
  "itemId": "together_001",
  "german": "zusammen",
  "bulgarian": "заедно",
  "currentCategories": [],           // Currently assigned (empty or invalid)
  "issue": "invalid-categories",     // Reason flagged
  "suggestedCategories": [],         // FILL: Your suggestions (max 2)
  "decidedCategories": [],           // FILL: Final decision
  "rationale": "",                   // FILL: Why you chose these
  "approved": false                  // FILL: Mark true when done
}
```

### Decision Rationale Examples

**Example 1: Verb with clear context**
```
"german": "sprechen" (to speak)
"suggestedCategories": ["everyday-phrases", "greetings"]
"decidedCategories": ["everyday-phrases"]
"rationale": "Common communicative verb; everyday-phrases is primary, greetings is secondary but less essential"
```

**Example 2: Ambiguous term**
```
"german": "Löffel" (spoon)
"suggestedCategories": ["food", "home"]
"decidedCategories": ["food"]
"rationale": "Kitchen utensil; food is better category than home (more specific)"
```

**Example 3: Multi-category item**
```
"german": "Großmutter" (grandmother)
"suggestedCategories": ["family"]
"decidedCategories": ["family"]
"rationale": "Clear family relationship; single category sufficient"
```

---

## ✅ Validation Gates

### Before Applying Categories
- [ ] All items have decidedCategories
- [ ] No item has > 2 categories
- [ ] All categories in whitelist
- [ ] All items approved (approved === true)
- [ ] Rationale provided for uncertain decisions

### After Applying Categories
- [ ] Validation script passes (no invalid categories)
- [ ] Category distribution looks reasonable
- [ ] No "uncategorized" items remain
- [ ] Diff report reviewed for unexpected changes

### UI Verification
- [ ] Filters show all assigned categories
- [ ] No "uncategorized" filter option
- [ ] Language switching doesn't affect category display
- [ ] Search results show categories correctly

---

## 📈 Expected Timeline

| Phase | Items | Estimated Time |
|-------|-------|-----------------|
| **Phase 1 (Current)** | 100 | 2-3 hours |
| **Phase 2** | 100-200 | 4-6 hours |
| **Phase 3** | Remaining | 2-3 hours |
| **Phase 4** | All | 1 hour |
| **Total** | 441 | 9-13 hours |

---

## 🔄 Iterative Workflow

1. **Review Batch-001** (100 items)
   - Complete manual categorization
   - Validate all decisions
   - Mark approved

2. **Apply & Validate**
   - Run: `pnpm node fix-remaining-categories.mjs --batch batch-001-sampling-export.json`
   - Check validation report
   - Review diff

3. **UI Spot-Check**
   - Start dev server: `pnpm run dev`
   - Navigate to `/vocabulary`
   - Verify filters and display

4. **Next Batch**
   - Export next 100-200 items
   - Repeat process

5. **Final Commit**
   - Stage all changes
   - Create comprehensive commit message
   - Push to main

---

## 🎓 Decision Guide

### When to assign category X?
- **greetings**: Expressions used in introductions or farewells (Hallo, Auf Wiedersehen)
- **numbers**: Numerals and number-related words (eins, zehn, Nummer)
- **family**: Kinship terms (Mutter, Bruder, Großvater)
- **food**: Edible items and dining (Apfel, Brot, Suppe)
- **colors**: Color names and descriptors (rot, blau, gelb)
- **animals**: Living creatures (Katze, Hund, Vogel)
- **body-parts**: Anatomy (Auge, Hand, Fuß)
- **clothing**: Apparel and accessories (Hemd, Jacke, Schuh)
- **home**: Domestic spaces and furniture (Haus, Tisch, Fenster)
- **nature**: Natural phenomena (Baum, Blume, Berg)
- **transport**: Vehicles and travel (Auto, Zug, Flugzeug)
- **technology**: Modern tech and gadgets (Computer, Telefon, Internet)
- **time**: Temporal concepts (Stunde, Tag, Jahreszeit)
- **weather**: Atmospheric conditions (Regen, Sonne, Schnee)
- **professions**: Jobs and careers (Arzt, Lehrer, Ingenieur)
- **places**: Locations and geographical (Stadt, Straße, Park)
- **grammar**: Grammatical concepts (Verb, Adjektiv, Nominativ)
- **culture**: Cultural references (Musik, Kunstwerk, Tradition)
- **everyday-phrases**: Common expressions (bitte, danke, wie geht's?)

---

## 🚀 Next Actions

1. **Review** `reports/batch-001-sampling-export.json` manually
2. **Fill in**:
   - suggestedCategories (max 2 per item)
   - decidedCategories (final selection)
   - rationale (brief explanation)
   - approved (mark true when done)
3. **Save** updated batch file
4. **Run** validation to check for errors
5. **Apply** changes to main vocabulary
6. **Commit** with detailed message

---

**Questions?** Check `validation-flagged-items.md` for full list of all flagged items, or review `category-whitelist.json` for category definitions.
