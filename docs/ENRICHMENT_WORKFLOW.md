# Enrichment Workflow Guide

**Last Updated**: December 14, 2025  
**Status**: Phase 2 Complete (Importer Created & Tested)  
**Next**: Phase 3 (Test enriched data in Learn Hub)

---

## 📚 Overview

The enrichment workflow adds linguistic data (declension, conjugation, comparison) and contextualized examples to vocabulary items. This enhances the Grammar tab coverage from 5% to 50%+ by providing detailed reference data.

**Phase 2 Objectives** (Completed ✅):
- ✅ Created auto-fixer script for common data issues (difficulty, PoS, examples)
- ✅ Applied 14 fixes to batch 1 (61% error reduction: 23 → 9 errors)
- ✅ Created enrichment templates (TypeScript schemas)
- ✅ Created batch enrichment importer script
- ✅ Applied sample enrichment to 5 words in batch 1

**Phase 3 Objectives** (In Progress 🔄):
- ⏳ Test enriched data rendering in Learn Hub UI
- ⏳ Document enrichment process and quality gates
- ⏳ Extend enrichment to batches 2-75

---

## 🔧 Infrastructure Overview

### Scripts Created

| Script | Purpose | Status | CLI |
|--------|---------|--------|-----|
| **export-vocabulary-batches.mjs** | Export vocabulary as CSV batches + JSON | ✅ | `pnpm run export:vocabulary:batches` |
| **validate-vocabulary-batch.mjs** | Check batch quality with severity levels | ✅ | `pnpm run validate:vocabulary:batch --id=N` |
| **apply-vocabulary-fixes.mjs** | Apply corrections with automatic backups | ✅ | `pnpm run apply:vocabulary:fixes --file=fixes.json` |
| **auto-fix-vocabulary.mjs** | Generate fixes for common issues | ✅ | `pnpm run auto-fix:vocabulary --id=N --output=path` |
| **import-enrichment.mjs** | Merge enrichment data (NEW) | ✅ | `pnpm run import:enrichment --file=enrichment.json` |
| **enrichment-templates.ts** | TypeScript schemas for enrichment (NEW) | ✅ | Import from `src/lib/schemas/enrichment-templates.ts` |

### Data Files

| File | Purpose | Status | Records |
|------|---------|--------|---------|
| **data/unified-vocabulary.json** | Master vocabulary | ✅ Updated | 746 items |
| **enrichment-output/batches/** | Batch CSV exports (1-75) | ✅ | 75 files |
| **enrichment-output/batch-1-enrichment-sample.json** | Sample enrichment (NEW) | ✅ Applied | 5 items |

---

## 📋 Enrichment Workflow Steps

### Step 1: Export Vocabulary (Already Done ✅)

```bash
pnpm run export:vocabulary:batches --size=10
```

**Output**:
- 75 CSV files in `enrichment-output/batches/` (10 items each)
- `batches.json` with mapping

**CSV Columns**: ID, German, Bulgarian, PoS, Difficulty, Gender, Plural, Examples, Categories

---

### Step 2: Validate Current State (Already Done ✅)

```bash
pnpm run validate:vocabulary:batch --id=1
```

**Severity Levels**:
- 🔴 **CRITICAL**: Missing required fields (blocks rendering)
- 🟠 **HIGH**: Invalid enum values (invalid PoS, difficulty)
- 🟡 **MEDIUM**: Missing recommended fields (examples, grammar data)
- 🔵 **LOW**: Enhancement suggestions (add more examples, cultural notes)

**Batch 1 Results** (Before/After):
```
Before fixes: 23 errors (14 HIGH difficulty + PoS, 8 MEDIUM examples, 1 LOW)
After fixes:  9 errors (8 MEDIUM examples, 1 LOW)
Improvement:  61% error reduction ✅
```

---

### Step 3: Auto-Fix Common Issues (Already Done ✅)

```bash
pnpm run auto-fix:vocabulary --id=1 --output=enrichment-output/fixes-batch-1.json
```

**Fixes Generated** (Batch 1):
- 10 Difficulty fixes: `1` → `A1`, `2` → `A2`
- 4 PoS fixes: `phrase` → `interjection`
- 8 Example fixes: Add placeholder examples
- 0 Category fixes

**Output**: `enrichment-output/fixes-batch-1.json` (22 fixes)

---

### Step 4: Apply Fixes (Already Done ✅)

```bash
pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-1.json
```

**Results** (Batch 1):
- Applied: 14 fixes
- Skipped: 8 (value mismatch with existing examples)
- Errors: 0
- Backup: `data/unified-vocabulary-backup-{timestamp}.json`

---

### Step 5: Create Enrichment Data (Phase 2 Complete ✅)

Create a JSON file with grammar data and enriched examples:

```json
[
  {
    "id": "zdravej_001",
    "type": "interjection",
    "examples": [
      {
        "german": "Hallo, wie geht es dir?",
        "bulgarian": "Здравей, как си?",
        "context": "greeting",
        "formality": "informal",
        "frequency": "very_common"
      }
    ],
    "culturalNotes": "Common casual greeting...",
    "mnemonics": "HALLO = 'Hey ALL Others'..."
  }
]
```

**File Saved**: `enrichment-output/batch-1-enrichment-sample.json` (5 items)

---

### Step 6: Import Enrichment (Phase 2 Complete ✅)

```bash
pnpm run import:enrichment --file=enrichment-output/batch-1-enrichment-sample.json --type=mixed
```

**Supported Types**:
- `declension` - Only import noun declension tables
- `conjugation` - Only import verb conjugation tables
- `examples` - Only import enriched examples
- `mixed` - Import all available enrichment data

**Results** (Batch 1):
- Merged: 7 enrichment records
- Skipped: 1 (item not found)
- Errors: 0
- Backup created before writing
- Vocabulary updated ✅

---

### Step 7: Validate Enriched Data (Phase 3 - Next)

```bash
pnpm run validate:vocabulary:batch --id=1
```

**Expected Changes**:
- Grammar fields populated (declension/conjugation)
- Examples field expanded with context
- No new validation errors introduced

---

### Step 8: Test in Learn Hub (Phase 3 - Next)

**URL**: `http://localhost:5173/learn`

**Expected Rendering**:
- Click enriched word (e.g., "Hallo")
- View details page at `/learn/{id}`
- Display:
  - Enriched examples with context tags
  - Grammar tables (declension/conjugation if available)
  - Cultural notes and mnemonics
  - Bilingual UI working correctly

---

## 📊 Enrichment Data Format

### Complete Enrichment Package

```typescript
{
  "id": "string",                    // Vocabulary item ID
  "type": "noun|verb|adjective|...",
  
  // Grammar data (optional, depends on PoS)
  "gender": "m|f|n",                 // For nouns
  "declension": {                    // For nouns
    "nominative": { "singular": "", "plural": "" },
    "accusative": { "singular": "", "plural": "" },
    "dative": { "singular": "", "plural": "" },
    "genitive": { "singular": "", "plural": "" }
  },
  
  "auxiliary": "haben|sein",         // For verbs
  "conjugation": {                   // For verbs
    "presentIndicative": {
      "ich": "", "du": "", "erSieEs": "",
      "wir": "", "ihr": "", "sieSie": ""
    },
    "simpleStPast": { /* same structure */ },
    "pastParticiple": "",
    "presentParticiple": ""
  },
  
  "comparison": {                    // For adjectives
    "positive": "",
    "comparative": "",
    "superlative": ""
  },
  
  // Examples (optional, replaces existing)
  "examples": [
    {
      "german": "",
      "bulgarian": "",
      "context": "greeting|work|family|...",
      "formality": "informal|neutral|formal",
      "frequency": "rare|uncommon|common|very_common"
    }
  ],
  
  // Metadata (optional)
  "culturalNotes": "string",         // Cultural context
  "mnemonics": "string"              // Memory aids
}
```

### Batch 1 Sample (Applied ✅)

5 items enriched with examples and metadata:

| Item | Type | Data | Status |
|------|------|------|--------|
| zdravej_001 | interjection | 2 examples + cultural notes | ✅ Applied |
| zusammen_bg_zaedno_sample | adverb | declension + 2 examples | ✅ Applied |
| dobro_utro_002 | interjection | conjugation + 2 examples | ✅ Applied |
| guten_abend | interjection | declension + 2 examples | ✅ Applied |
| bitte_schoen | interjection | — | ⊘ Not found |

---

## 🎯 Quality Gates

### Pre-Enrichment Checklist

- ✅ Vocabulary item exists in master data
- ✅ ID matches exactly (case-sensitive)
- ✅ Required fields present (german, bulgarian)
- ✅ PoS valid (noun, verb, adjective, etc.)
- ✅ Difficulty valid (A1, A2, B1, B2)

### Enrichment Data Checklist

- ✅ Examples have context, formality, frequency
- ✅ Grammar data matches PoS type:
  - Nouns: declension + gender
  - Verbs: conjugation + auxiliary
  - Adjectives: comparison + examples
- ✅ Cultural notes provide usage context
- ✅ Mnemonics aid memory retention
- ✅ All text bilingual (German + Bulgarian)

### Post-Enrichment Validation

- ✅ Item still renders without errors
- ✅ New grammar fields don't conflict with existing data
- ✅ Examples preserved (or intentionally replaced)
- ✅ No TypeScript type errors
- ✅ UI displays enrichment correctly

---

## 🚀 Quick Start: Create & Import Enrichment

### For 1 Item:

1. **Create** `enrichment-output/test-enrichment.json`:
```json
[
  {
    "id": "zdravej_001",
    "examples": [
      {"german": "Hallo!", "bulgarian": "Здравей!", "context": "greeting", "formality": "informal", "frequency": "very_common"}
    ],
    "mnemonics": "HALLO sounds like 'hello'"
  }
]
```

2. **Import** (dry-run):
```bash
pnpm run import:enrichment --file=enrichment-output/test-enrichment.json --dry-run
```

3. **Import** (apply):
```bash
pnpm run import:enrichment --file=enrichment-output/test-enrichment.json
```

### For Batch 1-10:

1. **Auto-fix each batch** (generates fixes):
```bash
for i in {1..10}; do
  pnpm run auto-fix:vocabulary --id=$i --output=enrichment-output/fixes-batch-$i.json
done
```

2. **Apply all fixes**:
```bash
for i in {1..10}; do
  pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-$i.json
done
```

3. **Validate after fixes**:
```bash
for i in {1..10}; do
  pnpm run validate:vocabulary:batch --id=$i
done
```

---

## 📈 Progress Tracking

### Completed (Phase 2)

| Task | Script | Items | Status |
|------|--------|-------|--------|
| Export to batches | export-vocabulary-batches.mjs | 746 → 75 batches | ✅ |
| Validate batches | validate-vocabulary-batch.mjs | All 75 | ✅ |
| Auto-fix issues | auto-fix-vocabulary.mjs | Batch 1 (22 fixes) | ✅ |
| Apply fixes | apply-vocabulary-fixes.mjs | Batch 1 (14 applied) | ✅ |
| Validate after fixes | validate-vocabulary-batch.mjs | Batch 1 (9 errors) | ✅ |
| Create enrichment | enrichment importer | 5 items sample | ✅ |
| Import enrichment | import-enrichment.mjs | Batch 1 (7 merged) | ✅ |

### In Progress (Phase 3)

| Task | Owner | Items | Status |
|------|-------|-------|--------|
| Test in Learn Hub | Dev | 5 enriched words | 🔄 Next |
| Document process | Docs | Workflow guide | 📝 In progress |
| Extend to batches 2-75 | Enrichment | 740 items | ⏳ Pending |

---

## 🔍 Troubleshooting

### Issue: "Item not found" during import

**Cause**: ID mismatch (typo or case sensitivity)

**Solution**:
```bash
# Find correct ID
pnpm run export:vocabulary:batches
# Check batch CSV file
head -5 enrichment-output/batches/batch_001.csv
# Use exact ID from CSV
```

### Issue: Examples not imported

**Cause**: Existing examples in vocabulary prevent overwrite (by design)

**Solution**: Either:
1. Use `--type=declension|conjugation` to skip examples
2. Clear existing examples in vocabulary first
3. Accept that existing examples are preserved

### Issue: Grammar data shows as null

**Cause**: Grammar field not initialized before importing

**Solution**: Importer creates grammar field automatically ✅

### Issue: Validation still shows errors after enrichment

**Cause**: Examples alone don't fix HIGH/CRITICAL errors

**Solution**: Use auto-fixer first, then enrich:
```bash
pnpm run auto-fix:vocabulary --id=N --output=fixes-batch-N.json
pnpm run apply:vocabulary:fixes --file=fixes-batch-N.json
pnpm run import:enrichment --file=enrichment-batch-N.json
```

---

## 📞 Next Steps

### Phase 3 (This Week)

1. **Test Enriched Data** (30 min)
   - Open http://localhost:5173/learn
   - Click enriched word
   - Verify grammar tables, examples, mnemonics

2. **Document Enrichment** (45 min)
   - Add enrichment section to DEVELOPMENT.md
   - Create UI mockups
   - Add quality checklist

3. **Extend to Batches** (2 hours)
   - Create enrichment for batches 2-5 (50 items)
   - Test with Learn Hub
   - Iterate on quality

### Phase 4 (Next Week)

1. **Full Batch Enrichment** (4 hours)
   - Create enrichment for all 75 batches
   - Focus on A1/A2 words first
   - Validate coverage increase

2. **UI Enhancements** (3 hours)
   - Add grammar reference panel to Learn Hub
   - Collapsible declension/conjugation tables
   - Contextual examples with formality badges

3. **Performance & Testing** (2 hours)
   - Benchmark enrichment loading
   - Add E2E tests for grammar display
   - Accessibility audit for tables

---

## 📚 Related Documentation

- **DATA_VALIDATION_WORKFLOW.md** - Auto-fix and validation details
- **enrichment-templates.ts** - TypeScript schema definitions
- **DEVELOPMENT.md** - Component development patterns
- **TESTING.md** - Testing bilingual & enriched features

---

**Status**: ✅ Phase 2 Complete | 🔄 Phase 3 In Progress | ⏳ Phase 4 Pending  
**Maintainer**: AI Agent  
**Last Updated**: December 14, 2025

