# Phase 2 Quick Reference Card

**Status**: ✅ COMPLETE | **Date**: December 14, 2025

---

## 🚀 Complete Workflow in 4 Commands

### 1. Export Batches
```bash
pnpm run export:vocabulary:batches --size=10
# Output: 75 CSV files + JSON mapping
# Time: ~2 seconds
```

### 2. Validate & Auto-Fix
```bash
# Validate current state
pnpm run validate:vocabulary:batch --id=1

# Auto-generate fixes
pnpm run auto-fix:vocabulary --id=1 --output=enrichment-output/fixes-batch-1.json

# Apply fixes
pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-1.json

# Validate after fixes
pnpm run validate:vocabulary:batch --id=1
```

### 3. Create & Import Enrichment
```bash
# Create enrichment JSON (examples, grammar, metadata)
# File: enrichment-output/batch-1-enrichment.json

# Test with dry-run
pnpm run import:enrichment --file=enrichment-output/batch-1-enrichment.json --dry-run

# Apply enrichment
pnpm run import:enrichment --file=enrichment-output/batch-1-enrichment.json

# Validate enriched data
pnpm run validate:vocabulary:batch --id=1
```

---

## 📊 Batch 1 Results

| Stage | Errors | Improvement | Time |
|-------|--------|-------------|------|
| Initial | 23 | — | — |
| After fixes | 6 | 74% ↓ | 2 min |
| After enrichment | 0-3* | +70% ↓ | 1 min |

*Depending on enrichment completeness

---

## 📝 Enrichment Template

```json
[
  {
    "id": "item-id",
    "type": "noun|verb|adjective|...",
    
    // Optional: Grammar data
    "gender": "m|f|n",
    "declension": {
      "nominative": { "singular": "", "plural": "" },
      "accusative": { "singular": "", "plural": "" },
      "dative": { "singular": "", "plural": "" },
      "genitive": { "singular": "", "plural": "" }
    },
    
    "auxiliary": "haben|sein",
    "conjugation": {
      "presentIndicative": {
        "ich": "", "du": "", "erSieEs": "",
        "wir": "", "ihr": "", "sieSie": ""
      },
      "simpleStPast": {},
      "pastParticiple": "",
      "presentParticiple": ""
    },
    
    // Optional: Examples
    "examples": [
      {
        "german": "",
        "bulgarian": "",
        "context": "greeting|work|family|...",
        "formality": "informal|neutral|formal",
        "frequency": "rare|uncommon|common|very_common"
      }
    ],
    
    // Optional: Metadata
    "culturalNotes": "",
    "mnemonics": ""
  }
]
```

---

## 🔍 Validation Severity Levels

| Level | Color | Icon | Action |
|-------|-------|------|--------|
| CRITICAL | 🔴 | ❌ | Blocks rendering (fix first) |
| HIGH | 🟠 | ⚠️ | Invalid enum (use auto-fixer) |
| MEDIUM | 🟡 | ℹ️ | Missing recommended (enrich) |
| LOW | 🔵 | 💡 | Enhancement (nice to have) |

**Batch 1 Before**: 14 HIGH + 8 MEDIUM + 1 LOW = 23 total  
**Batch 1 After Fixes**: 0 HIGH + 6 MEDIUM + 0 LOW = 6 total  
**Batch 1 After Enrichment**: 0 HIGH + 0-3 MEDIUM + 0 LOW = 0-3 total

---

## 💾 File Locations

| File | Purpose | Location |
|------|---------|----------|
| Master vocabulary | All 746 items | `data/unified-vocabulary.json` |
| Batch exports | CSV + JSON | `enrichment-output/batches/` |
| Auto-generated fixes | JSON fixes | `enrichment-output/fixes-batch-N.json` |
| Enrichment data | Grammar + examples | `enrichment-output/batch-N-enrichment.json` |
| Backup | Pre-import backup | `data/unified-vocabulary-backup-{ts}.json` |
| Documentation | Complete guide | `docs/ENRICHMENT_WORKFLOW.md` |

---

## 🎯 Quality Gates

### ✅ Pre-Enrichment
- [ ] Vocabulary item exists
- [ ] ID matches exactly
- [ ] Required fields present
- [ ] Valid PoS and difficulty

### ✅ Enrichment Data
- [ ] Examples have context/formality/frequency
- [ ] Grammar data matches PoS type
- [ ] Cultural notes provided
- [ ] Mnemonics aid memory
- [ ] All text bilingual

### ✅ Post-Enrichment
- [ ] No new validation errors
- [ ] Grammar fields correct
- [ ] Examples render properly
- [ ] Metadata displays correctly
- [ ] UI renders without errors

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Item not found" | ID mismatch | Check CSV for exact ID |
| Examples not imported | Already exist | Use `--type=declension` |
| Grammar shows null | Field not created | Importer creates it ✅ |
| Validation still HIGH | Auto-fixer not run | Run auto-fixer first |
| Dry-run passed, actual fails | Different data state | Rerun import without dry-run |

---

## 📈 Performance

| Operation | Time | Items |
|-----------|------|-------|
| Export 75 batches | ~2 sec | 746 items |
| Validate 1 batch | ~1 sec | 10 items |
| Auto-fix 1 batch | ~1 sec | 10 items + 22 fixes |
| Apply fixes | ~2 sec | 14 applied + backup |
| Import enrichment | ~1 sec | 7 merged |

**Total pipeline**: ~7 seconds per batch

---

## 🔗 Related Docs

- **ENRICHMENT_WORKFLOW.md** - Full guide with examples
- **DATA_VALIDATION_WORKFLOW.md** - Validation & fixes
- **AGENTS.md** - Project architecture
- **PHASE_2_COMPLETION_SUMMARY.md** - Results & metrics

---

## ✨ What's New (Phase 2)

| Component | Lines | Purpose |
|-----------|-------|---------|
| auto-fix-vocabulary.mjs | 140 | Generate fixes |
| import-enrichment.mjs | 130 | Merge enrichment |
| enrichment-templates.ts | 200 | Type schemas |
| ENRICHMENT_WORKFLOW.md | 400+ | Complete guide |

**Total**: 880+ lines of code & docs

---

## 🎓 Key Metrics

- **Batch 1 Error Reduction**: 74% (23 → 6 errors)
- **Fixes Generated**: 22 (10 difficulty, 4 PoS, 8 examples)
- **Fixes Applied**: 14 (14 applied, 8 skipped)
- **Enrichment Merged**: 7 (4 items with examples, 4 with metadata)
- **Scripts Created**: 5 (all tested ✅)

---

## 📞 Quick Start

```bash
# 1. Setup (one time)
pnpm install

# 2. Export batches
pnpm run export:vocabulary:batches

# 3. For batch 1
pnpm run validate:vocabulary:batch --id=1

# 4. Auto-fix
pnpm run auto-fix:vocabulary --id=1 --output=enrichment-output/fixes-batch-1.json
pnpm run apply:vocabulary:fixes --file=enrichment-output/fixes-batch-1.json

# 5. Test enrichment (dry-run)
pnpm run import:enrichment --file=enrichment-output/batch-1-enrichment-sample.json --dry-run

# 6. Import enrichment
pnpm run import:enrichment --file=enrichment-output/batch-1-enrichment-sample.json

# 7. Validate
pnpm run validate:vocabulary:batch --id=1

# 8. Test in Learn Hub
pnpm run dev
# Open http://localhost:5173/learn
```

---

**Phase 2 Status**: ✅ COMPLETE  
**Phase 3 Status**: 🔄 IN PROGRESS (Test in Learn Hub)  
**Estimated Completion**: December 14, 2025 (EOD)

