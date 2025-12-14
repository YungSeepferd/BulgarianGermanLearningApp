# Data Validation & Fixes Workflow

**Last Updated**: December 14, 2025  
**Status**: Ready for use  
**Phase**: Data Quality & Enrichment

---

## Overview

This document describes the complete workflow for validating and fixing vocabulary data through batch processing. The system allows you to:

1. **Export** vocabulary into manageable batches (CSV + JSON)
2. **Validate** each batch against quality criteria
3. **Fix** issues and apply corrections back to the main vocabulary database

---

## Quick Start

### Export Batches

```bash
pnpm run export:vocabulary:batches --size=10
```

**Output**: `enrichment-output/batches/`
- `batch_001.csv`, `batch_002.csv`, ... (75 batches for 746 items)
- `batches.json` (consolidated JSON map)

**CSV Format** (ready for Google Sheets):
```csv
ID,German,Bulgarian,Part of Speech,Difficulty,Gender,Plural,Examples,Categories,Status,Notes
zusammen_bg_zaedno_sample,"zusammen","заедно","adverb",2,"","","0","","unreviewed",""
```

### Validate a Batch

```bash
pnpm run validate:vocabulary:batch --id=1
```

**Output**: Console report with errors by severity
```
✅ zusammen → заедно
    HIGH  difficulty: Invalid difficulty: 2
    MEDIUM  examples: No examples provided
```

**Severity Levels**:
- 🔴 **Critical**: Missing required fields (blocks usage)
- 🟡 **High**: Invalid enum values (PoS, difficulty)
- 🔵 **Medium**: Missing recommended data (examples, categories)
- 🔷 **Low**: Enhancement suggestions (additional examples)

### Apply Fixes

Create a fixes JSON file with corrections:

```json
[
  {
    "id": "zusammen_bg_zaedno_sample",
    "fieldPath": "difficulty",
    "oldValue": 2,
    "newValue": "A1"
  },
  {
    "id": "zusammen_bg_zaedno_sample",
    "fieldPath": "examples",
    "oldValue": [],
    "newValue": [{"german": "Wir arbeiten zusammen.", "bulgarian": "Ние работим заедно."}]
  }
]
```

Apply the fixes:

```bash
pnpm run apply:vocabulary:fixes --file=fixes-batch-1.json
```

**Output**: 
- Backup created: `data/unified-vocabulary-backup-{timestamp}.json`
- Fixes applied to `data/unified-vocabulary.json`
- Report saved: `enrichment-output/fixes-report-{timestamp}.json`

---

## Validation Criteria

### Required Fields (Critical)

All vocabulary items must have:
- `id` (string, unique)
- `german` (string, non-empty)
- `bulgarian` (string, non-empty)
- `partOfSpeech` (valid enum: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection)
- `difficulty` (valid enum: A1, A2, B1, B2)

### Grammar Data (High Priority)

Based on part of speech:

| PoS | Required Field | Example |
|-----|---|---|
| noun | `grammar.gender` | "f" (feminine), "m" (masculine), "n" (neuter) |
| verb | `grammar.auxiliary` | "haben", "sein", or both |
| adjective | `grammar.comparative`, `grammar.superlative` | "schöner", "schönster" |

### Examples (Medium Priority)

- Minimum 1 example (recommended 2+)
- Each example should have both German and Bulgarian translations
- Format: `{ "german": "...", "bulgarian": "..." }`

### Categories (Medium Priority)

- At least 1 category assigned
- Categories must be from whitelist in `data/category-whitelist.json`
- Format: array of strings, e.g. `["everyday-phrases", "greetings"]`

---

## Field Path Reference

Use dot notation to specify nested fields in fixes:

```json
{
  "fieldPath": "grammar.gender",      // Sets item.grammar.gender
  "fieldPath": "categories[0]",       // Sets item.categories[0]
  "fieldPath": "examples.length",     // Sets item.examples.length
  "fieldPath": "metadata.declension"  // Sets item.metadata.declension
}
```

---

## Workflow Example: Fix Batch 1

### Step 1: Export batches

```bash
pnpm run export:vocabulary:batches --size=10
# Creates: enrichment-output/batches/batch_001.csv through batch_075.csv
```

### Step 2: Validate batch 1

```bash
pnpm run validate:vocabulary:batch --id=1
# Reports 10 entries with errors (difficulty, PoS, examples issues)
```

### Step 3: Create fixes

Review the CSV in Google Sheets or manually inspect `enrichment-output/batches/batches.json`:

```json
[
  {
    "id": "zusammen_bg_zaedno_sample",
    "fieldPath": "difficulty",
    "oldValue": 2,
    "newValue": "A1",
    "reason": "Numeric difficulty should be A1-A2 level"
  },
  {
    "id": "hallo_bg_zdravej_sample",
    "fieldPath": "difficulty",
    "oldValue": 1,
    "newValue": "A1",
    "reason": "Normalize difficulty to valid enum"
  },
  {
    "id": "bitte_bg_molya_sample",
    "fieldPath": "partOfSpeech",
    "oldValue": "phrase",
    "newValue": "interjection",
    "reason": "Classify phrase as interjection"
  }
]
```

Save as: `enrichment-output/fixes-batch-1.json`

### Step 4: Apply fixes

```bash
pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-1.json
# Creates backup
# Applies 3 fixes
# Reports success
```

### Step 5: Validate again

```bash
pnpm run validate:vocabulary:batch --id=1
# Should show fewer errors if fixes were correct
```

---

## Troubleshooting

### Issue: "Vocabulary not found" or "Total items: undefined"

**Cause**: Script can't locate `data/unified-vocabulary.json`

**Solution**:
```bash
# Verify file exists and has correct structure
head -20 data/unified-vocabulary.json
# Should show: { "id": "...", "items": [...], "itemCount": 746, ... }
```

### Issue: Validation reports many "HIGH  difficulty: Invalid difficulty" errors

**Cause**: Difficulty values are numeric (1, 2, 3, 4) instead of A1/A2/B1/B2

**Solution**: Create fixes batch to normalize all difficulty values

### Issue: Fixes weren't applied

**Cause**: Field path mismatch or oldValue doesn't match

**Solution**: 
```bash
# Check the fixes report
cat enrichment-output/fixes-report-{timestamp}.json
# Look for "skipped" entries - they show why fixes weren't applied
```

### Issue: Data lost or corrupted

**Solution**: Restore from backup

```bash
# Find latest backup
ls -lrt data/unified-vocabulary-backup-*.json | tail -1
# Restore
cp data/unified-vocabulary-backup-{timestamp}.json data/unified-vocabulary.json
```

---

## Batch Processing Strategy

### Batch Sizes

- **Size 10** (75 batches): Good for manual review via Google Sheets
- **Size 25** (30 batches): Balanced for larger fixes
- **Size 50** (15 batches): For quick spot-checks

### Recommended Workflow

1. **Start with batch 1-5** (50 items): Establish patterns for fixes
2. **Apply fixes** across all batches using the patterns found
3. **Validate remaining batches** (6-75)
4. **Iterate** on any new patterns that emerge

### Quality Gates

Before deploying fixes back to production:

- [ ] All critical errors resolved
- [ ] All HIGH priority errors addressed
- [ ] Examples added to 80%+ of entries
- [ ] No duplicate items in fixed batch
- [ ] Categories assigned to all items
- [ ] Grammar data complete for given PoS

---

## Integration with Enrichment

Once validation fixes are applied, the cleaned vocabulary is ready for enrichment:

1. **Batch 1-10** (100 items): Add declension/conjugation for A1 vocabulary
2. **Batch 11-20** (100 items): Add cultural notes and regional variants
3. **Batch 21-30** (100 items): Add pronunciation guides and mnemonics
4. **Continue** through batch 75

See **ENRICHMENT_WORKFLOW.md** for details.

---

## Script Reference

### export-vocabulary-batches.mjs

```bash
pnpm run export:vocabulary:batches [--size=N]
```

**Parameters**:
- `--size=N`: Batch size (default: 10, max: 100)

**Output**:
- `enrichment-output/batches/batch_*.csv`: CSV files
- `enrichment-output/batches/batches.json`: Consolidated JSON

**Example**:
```bash
pnpm run export:vocabulary:batches --size=25
# Creates 30 batches of ~25 items each
```

### validate-vocabulary-batch.mjs

```bash
pnpm run validate:vocabulary:batch [--id=N]
```

**Parameters**:
- `--id=N`: Batch number (default: 1)

**Output**: Console report with severity-coded errors

**Example**:
```bash
pnpm run validate:vocabulary:batch --id=1
# Validates entries 1-10 (first batch of size 10)
```

### apply-vocabulary-fixes.mjs

```bash
pnpm run apply:vocabulary:fixes --file=PATH
```

**Parameters**:
- `--file=PATH`: Path to fixes JSON file (required)

**Output**:
- Backup: `data/unified-vocabulary-backup-{timestamp}.json`
- Updated: `data/unified-vocabulary.json`
- Report: `enrichment-output/fixes-report-{timestamp}.json`

**Example**:
```bash
pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-1.json
```

---

## Data Format Reference

### Vocabulary Item Structure

```typescript
{
  id: string;                          // Unique identifier
  german: string;                      // German translation
  bulgarian: string;                   // Bulgarian translation
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'interjection';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  gender?: 'm' | 'f' | 'n';            // For nouns
  grammar?: {
    gender?: string;
    auxiliary?: string;                // For verbs (haben/sein)
    comparative?: string;              // For adjectives
    superlative?: string;
    plural?: string;
    declension?: Record<string, string>;  // For nouns
    conjugation?: Record<string, string>; // For verbs
  };
  examples?: Array<{
    german: string;
    bulgarian: string;
  }>;
  categories?: string[];
  metadata?: Record<string, any>;
}
```

### Fixes File Structure

```typescript
Array<{
  id: string;              // Vocabulary item ID
  fieldPath: string;       // Nested field path (dot notation)
  oldValue: any;           // Current value (must match exactly)
  newValue: any;           // Corrected value
  reason?: string;         // Optional explanation for the fix
}>
```

---

## Performance Notes

- **Export**: ~200ms for 746 items
- **Validation**: ~100ms per batch (10 items)
- **Apply Fixes**: ~300ms per fix + 500ms backup creation
- **Dev Server**: No impact (all scripts are CLI tools)

---

## Next Steps

1. Export and validate batch 1-5
2. Document patterns in fix requirements
3. Create automated batch fixer for common issues (PoS normalization, etc.)
4. Begin enrichment phase with cleaned data

---

**Questions?** See [docs/GETTING_STARTED.md](GETTING_STARTED.md) or check individual script headers for CLI options.
