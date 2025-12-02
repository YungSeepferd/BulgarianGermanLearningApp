# Vocabulary Dataset Merge Strategy

Last Updated: 2025-10-19

## Current State

### `data/vocabulary.json` (Primary Dataset)
- **Size:** ~2400 lines, 100+ entries
- **Schema:** Full bidirectional structure with `source_lang`, `target_lang`, directional notes
- **Coverage:** Mixed completeness—some entries have full annotations, others have nulls
- **Usage:** Referenced by layouts, adapters, practice sessions

### `data/vocabulary-enhanced.json` (Curated Subset)
- **Size:** ~160 lines, 6 entries
- **Schema:** Same structure as primary dataset
- **Coverage:** Rich annotations (etymology, cultural/linguistic notes, multiple examples)
- **Purpose:** Appears to be a testing/showcase subset with enhanced content

## Issues Identified

- **Duplication:** Entries like `zdravej_001`, `dobur_den_002` exist in both files with slight variations
- **Inconsistent Directional Notes:** Primary dataset has `notes_bg_to_de`/`notes_de_to_bg`, but enhanced subset sometimes omits them in favor of generic `notes`
- **Schema Drift Risk:** Two sources of truth create maintenance burden and potential divergence

## Merge Strategy

### Phase 1: Validation & Deduplication

Create validation script (`scripts/merge-vocabulary.mjs`) to:

1. Load both datasets
2. Detect duplicate entries by `id` field
3. Compare field completeness (which has richer data?)
4. Generate merge report showing conflicts

### Phase 2: Consolidation Rules

**Priority Order:**
1. **ID Uniqueness:** Keep one entry per unique `id`
2. **Field Richness:** Prefer entry with more non-null fields
3. **Directional Notes:** Ensure both `notes_bg_to_de` and `notes_de_to_bg` are populated
4. **Examples:** Merge example arrays (union, deduplicate by `sentence`)

**Merge Logic:**
```javascript
merged = {
  ...primaryEntry,
  ...enhancedEntry, // Override with enhanced if present
  notes_bg_to_de: enhancedEntry.notes_bg_to_de || primaryEntry.notes_bg_to_de || primaryEntry.notes,
  notes_de_to_bg: enhancedEntry.notes_de_to_bg || primaryEntry.notes_de_to_bg || primaryEntry.notes,
  examples: [...(primaryEntry.examples || []), ...(enhancedEntry.examples || [])].filter(uniqueBySentence)
}
```

### Phase 3: Migration Path

1. **Backup:** Archive current `data/vocabulary.json` as `data/vocabulary.backup.YYYYMMDD.json`
2. **Merge:** Run merge script to generate `data/vocabulary-merged.json`
3. **Validate:** Run `npm run lint:data` to ensure schema compliance
4. **Test:** Build Hugo site and test practice sessions with merged data
5. **Replace:** Rename `vocabulary-merged.json` → `vocabulary.json`
6. **Archive:** Move `vocabulary-enhanced.json` to `data/archive/`

### Phase 4: Documentation Updates

- Update `docs/ARCHITECTURE.md` to reflect single vocabulary source
- Note in `docs/DEVELOPMENT.md` that `vocabulary-enhanced.json` is deprecated
- Add migration notes to `docs/audit/data-schema.md`

## Implementation Script Outline

```javascript
// scripts/merge-vocabulary.mjs
import fs from 'fs';
import path from 'path';

const primary = JSON.parse(fs.readFileSync('data/vocabulary.json', 'utf-8'));
const enhanced = JSON.parse(fs.readFileSync('data/vocabulary-enhanced.json', 'utf-8'));

const idMap = new Map();

// Build map from primary
primary.forEach(entry => idMap.set(entry.id, { source: 'primary', data: entry }));

// Merge enhanced
enhanced.forEach(enhEntry => {
  if (idMap.has(enhEntry.id)) {
    const primEntry = idMap.get(enhEntry.id).data;
    idMap.set(enhEntry.id, {
      source: 'merged',
      data: mergeEntries(primEntry, enhEntry)
    });
  } else {
    idMap.set(enhEntry.id, { source: 'enhanced', data: enhEntry });
  }
});

function mergeEntries(prim, enh) {
  return {
    ...prim,
    ...enh,
    notes_bg_to_de: enh.notes_bg_to_de || prim.notes_bg_to_de || prim.notes,
    notes_de_to_bg: enh.notes_de_to_bg || prim.notes_de_to_bg || prim.notes,
    examples: mergeExamples(prim.examples, enh.examples),
    // Prefer non-null from enhanced for richness fields
    etymology: enh.etymology || prim.etymology,
    cultural_note: enh.cultural_note || prim.cultural_note,
    linguistic_note: enh.linguistic_note || prim.linguistic_note
  };
}

function mergeExamples(primEx = [], enhEx = []) {
  const seen = new Set();
  const merged = [];
  
  [...primEx, ...enhEx].forEach(ex => {
    if (!seen.has(ex.sentence)) {
      seen.add(ex.sentence);
      merged.push(ex);
    }
  });
  
  return merged;
}

const merged = Array.from(idMap.values()).map(entry => entry.data);

fs.writeFileSync('data/vocabulary-merged.json', JSON.stringify(merged, null, 2));
console.log(`Merged ${merged.length} entries`);
```

## Rollback Plan

If merged dataset causes issues:

1. Restore from backup: `cp data/vocabulary.backup.YYYYMMDD.json data/vocabulary.json`
2. Revert `vocabulary-enhanced.json` from git history if needed
3. Re-run Hugo build to clear cache

## Acceptance Criteria

- [ ] All unique `id` values preserved
- [ ] No schema validation errors (`npm run lint:data`)
- [ ] All directional notes populated or explicitly null
- [ ] Examples arrays deduplicated
- [ ] Hugo builds without warnings
- [ ] Practice sessions load and function correctly
- [ ] Learner progress unaffected (localStorage keys reference `id` only)

## Next Steps

1. Implement `scripts/merge-vocabulary.mjs`
2. Run merge in dry-run mode (output to console for review)
3. Get approval on merge report
4. Execute merge with backup
5. Test and validate
6. Archive deprecated files
