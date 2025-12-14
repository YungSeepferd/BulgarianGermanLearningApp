# Data Enrichment Plan - Declension & Conjugation Tables

**Goal**: Systematically add grammatical tables (declension for nouns, conjugation for verbs) to vocabulary database  
**Target**: Top 300 words (200 nouns + 100 verbs)  
**Estimated Time**: 40-60 hours (10-15 words/hour)  
**Priority**: High-frequency words first (CEFR A1-A2)

---

## 📊 Current Data Status

**Analysis of `unified-vocabulary.json` (747 entries)**:

| Category | Count | With Declension/Conjugation | Coverage |
|----------|-------|----------------------------|----------|
| **Nouns** | ~350 | ~18 (5%) | ❌ Very Low |
| **Verbs** | ~200 | ~10 (5%) | ❌ Very Low |
| **Adjectives** | ~120 | ~5 (4%) | ❌ Very Low |
| **Other** | ~77 | N/A | N/A |

**Priority Data Gaps**:
- ✅ Examples: 90% coverage (Langenscheidt enrichment successful)
- ✅ Etymology: 85% coverage
- ❌ Declension tables: 5% coverage (**TARGET FOR ENRICHMENT**)
- ❌ Conjugation tables: 5% coverage (**TARGET FOR ENRICHMENT**)
- ⚠️ Audio files: 0% coverage (future phase)

---

## 🎯 Phase 1: Top 100 Nouns (15-20 hours)

### Selection Criteria

```typescript
// Priority algorithm
const priorityScore = (item: VocabularyItem) => {
  let score = 0;
  
  // CEFR level (higher priority for beginner words)
  if (item.cefrLevel === 'A1') score += 100;
  if (item.cefrLevel === 'A2') score += 80;
  if (item.cefrLevel === 'B1') score += 60;
  if (item.cefrLevel === 'B2') score += 40;
  
  // Frequency (if available)
  score += (item.metadata?.frequency || 0) * 10;
  
  // Already has examples (easier to contextualize)
  if (item.metadata?.examples?.length > 0) score += 20;
  
  // Categories (everyday vocabulary gets boost)
  const everydayCategories = ['Alltag', 'Familie', 'Haus', 'Essen', 'Reisen'];
  if (item.categories?.some(cat => everydayCategories.includes(cat))) score += 30;
  
  return score;
};
```

### Target Nouns (Top 100)

**Selection Process**:
1. Run query to filter: `partOfSpeech === 'noun' && cefrLevel in ['A1', 'A2']`
2. Sort by priority score (descending)
3. Manually review top 100 for relevance
4. Group by declension pattern (saves time)

**Example Target List** (first 20):

| ID | German | Bulgarian | CEFR | Declension Type | Status |
|----|--------|-----------|------|-----------------|--------|
| 1 | der Mann | мъжът | A1 | Strong masculine | ⏳ |
| 2 | die Frau | жената | A1 | Strong feminine | ⏳ |
| 3 | das Kind | детето | A1 | Strong neuter | ⏳ |
| 4 | der Tag | денят | A1 | Strong masculine | ⏳ |
| 5 | das Jahr | годината | A1 | Strong neuter | ⏳ |
| 6 | die Zeit | времето | A1 | Strong feminine | ⏳ |
| 7 | das Haus | къщата | A1 | Strong neuter | ⏳ |
| 8 | der Freund | приятелят | A1 | Strong masculine | ⏳ |
| 9 | die Stadt | градът | A1 | Strong feminine | ⏳ |
| 10 | das Leben | животът | A1 | Strong neuter | ⏳ |
| ... | ... | ... | ... | ... | ... |

### Declension Schema

```typescript
interface DeclensionTable {
  nominative: { singular: string; plural: string };
  accusative: { singular: string; plural: string };
  dative: { singular: string; plural: string };
  genitive: { singular: string; plural: string };
  notes?: string; // Optional grammar notes
}

// Example: "der Mann" (the man)
const mannDeclension: DeclensionTable = {
  nominative: { singular: "der Mann", plural: "die Männer" },
  accusative: { singular: "den Mann", plural: "die Männer" },
  dative: { singular: "dem Mann", plural: "den Männern" },
  genitive: { singular: "des Mannes", plural: "der Männer" },
  notes: "Strong masculine noun with umlaut in plural"
};
```

### Data Sources for Declension

1. **Primary**: [DWDS](https://www.dwds.de/) - Digitales Wörterbuch der deutschen Sprache
2. **Secondary**: [Duden](https://www.duden.de/) - Authoritative German dictionary
3. **Verification**: [Wiktionary DE](https://de.wiktionary.org/) - Community-verified tables
4. **Cross-reference**: [Canoo.net](https://www.canoo.net/) - Grammar database

### Workflow (Per Noun)

```bash
# Time per noun: ~10 minutes

1. Look up word on DWDS (3 min)
2. Copy declension table (2 min)
3. Format as JSON (3 min)
4. Add to vocabulary item (1 min)
5. Verify with second source (1 min)

# Example command (manual):
# Edit: data/unified-vocabulary.json
# Find item with id: "xyz"
# Add metadata.declension: { ... }
# Save and commit
```

### Batch Script (Recommended)

Create: `scripts/add-declension.ts`

```typescript
import { readFileSync, writeFileSync } from 'fs';
import { UnifiedVocabularyItemSchema } from '../src/lib/schemas/vocabulary';

interface DeclensionInput {
  itemId: string;
  declension: DeclensionTable;
}

// Batch input (prepare in Google Sheets or CSV)
const declensionBatch: DeclensionInput[] = [
  {
    itemId: "noun-001",
    declension: {
      nominative: { singular: "der Mann", plural: "die Männer" },
      accusative: { singular: "den Mann", plural: "die Männer" },
      dative: { singular: "dem Mann", plural: "den Männern" },
      genitive: { singular: "des Mannes", plural: "der Männer" }
    }
  },
  // ... more entries
];

function addDeclensionBatch(batch: DeclensionInput[]) {
  const vocabPath = './data/unified-vocabulary.json';
  const vocab = JSON.parse(readFileSync(vocabPath, 'utf-8'));
  
  let updated = 0;
  batch.forEach(input => {
    const item = vocab.find((v: any) => v.id === input.itemId);
    if (item) {
      if (!item.metadata) item.metadata = {};
      item.metadata.declension = input.declension;
      updated++;
    }
  });
  
  // Validate schema
  vocab.forEach((item: any) => {
    UnifiedVocabularyItemSchema.parse(item);
  });
  
  writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
  console.log(`✅ Updated ${updated} nouns with declension tables`);
}

addDeclensionBatch(declensionBatch);
```

### Quality Assurance

- ✅ **Validation**: Zod schema ensures data integrity
- ✅ **Peer Review**: Every 20 words, have another person spot-check
- ✅ **Visual Check**: Test in dashboard UI (Grammar tab)
- ✅ **Git Commits**: Commit every 10 words with descriptive message

---

## 🎯 Phase 2: Top 50 Verbs (10-12 hours)

### Selection Criteria

Same priority algorithm as nouns, focusing on:
- High-frequency verbs (sein, haben, werden, können, etc.)
- Regular conjugation patterns first (easier to batch)
- Irregular verbs second (require more care)

### Target Verbs (Top 50)

| ID | German | Bulgarian | CEFR | Conjugation Type | Status |
|----|--------|-----------|------|------------------|--------|
| 1 | sein | съм | A1 | Irregular (essential) | ⏳ |
| 2 | haben | имам | A1 | Irregular (essential) | ⏳ |
| 3 | werden | ставам | A1 | Irregular (essential) | ⏳ |
| 4 | können | мога | A1 | Modal (irregular) | ⏳ |
| 5 | müssen | трябва | A1 | Modal (irregular) | ⏳ |
| 6 | sagen | казвам | A1 | Regular (weak) | ⏳ |
| 7 | machen | правя | A1 | Regular (weak) | ⏳ |
| 8 | geben | давам | A1 | Strong (irregular) | ⏳ |
| 9 | kommen | идвам | A1 | Strong (irregular) | ⏳ |
| 10 | gehen | отивам | A1 | Strong (irregular) | ⏳ |
| ... | ... | ... | ... | ... | ... |

### Conjugation Schema

```typescript
interface ConjugationTable {
  present: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  };
  past: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  };
  perfect: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  };
  future?: {
    ich: string;
    du: string;
    er_sie_es: string;
    wir: string;
    ihr: string;
    sie_Sie: string;
  };
  notes?: string;
}

// Example: "sein" (to be)
const seinConjugation: ConjugationTable = {
  present: {
    ich: "bin",
    du: "bist",
    er_sie_es: "ist",
    wir: "sind",
    ihr: "seid",
    sie_Sie: "sind"
  },
  past: {
    ich: "war",
    du: "warst",
    er_sie_es: "war",
    wir: "waren",
    ihr: "wart",
    sie_Sie: "waren"
  },
  perfect: {
    ich: "bin gewesen",
    du: "bist gewesen",
    er_sie_es: "ist gewesen",
    wir: "sind gewesen",
    ihr: "seid gewesen",
    sie_Sie: "sind gewesen"
  },
  notes: "Highly irregular auxiliary verb. Essential for German grammar."
};
```

### Data Sources for Conjugation

1. **Primary**: [Verbformen.de](https://www.verbformen.de/) - Comprehensive conjugation database
2. **Secondary**: [DWDS](https://www.dwds.de/) - Academic resource
3. **Verification**: [Wiktionary DE](https://de.wiktionary.org/)
4. **Cross-reference**: [Canoo.net](https://www.canoo.net/)

### Workflow (Per Verb)

```bash
# Time per verb: ~12 minutes

1. Look up verb on Verbformen.de (3 min)
2. Copy conjugation tables (present, past, perfect) (4 min)
3. Format as JSON (3 min)
4. Add to vocabulary item (1 min)
5. Verify with second source (1 min)
```

### Conjugation Patterns (for batching)

**Group 1: Regular (Weak) Verbs** (~20 verbs)
- Pattern: Same stem, add standard endings
- Examples: machen, sagen, spielen, lernen, arbeiten
- **Optimization**: Create template, fill in stem

**Group 2: Strong (Irregular) Verbs** (~20 verbs)
- Pattern: Vowel changes in past tense
- Examples: geben, nehmen, sehen, fahren, kommen
- **Optimization**: Manually verify each one

**Group 3: Modal Verbs** (~6 verbs)
- Pattern: Unique conjugation, no perfect form (use with haben)
- Examples: können, müssen, wollen, sollen, dürfen, mögen
- **Optimization**: Reference grammar book

**Group 4: Auxiliary Verbs** (~3 verbs)
- sein, haben, werden
- **Priority**: Do these first (most essential)

---

## 🎯 Phase 3: Adjectives Comparison (5-8 hours)

### Target: Top 50 Adjectives

Adjectives are simpler (only 3 forms):
- Positive (gut)
- Comparative (besser)
- Superlative (am besten)

### Comparison Schema

```typescript
interface AdjectiveComparison {
  positive: string;
  comparative: string;
  superlative: string;
  notes?: string;
}

// Example: "gut" (good)
const gutComparison: AdjectiveComparison = {
  positive: "gut",
  comparative: "besser",
  superlative: "am besten",
  notes: "Irregular comparison. Very common adjective."
};
```

### Time Estimate

- **Regular adjectives**: 5 min each (add -er, add -est)
- **Irregular adjectives**: 8 min each (manual lookup)
- **Total**: ~50 adjectives × 6 min avg = **5 hours**

---

## 📅 Implementation Timeline

### Month 1: Foundation (Weeks 1-4)

**Week 1**: Infrastructure Setup (8 hours)
- [ ] Create batch import scripts
- [ ] Set up validation pipeline
- [ ] Create Google Sheets template for data entry
- [ ] Test with 5 sample nouns

**Week 2**: Nouns Batch 1 (10 hours)
- [ ] Add declension for 50 nouns (A1 level)
- [ ] Quality check and commit
- [ ] Test in dashboard UI

**Week 3**: Nouns Batch 2 (10 hours)
- [ ] Add declension for 50 nouns (A2 level)
- [ ] Quality check and commit
- [ ] Test in dashboard UI

**Week 4**: Verbs Batch 1 (12 hours)
- [ ] Add conjugation for 25 verbs (A1 level, prioritize irregular)
- [ ] Quality check and commit
- [ ] Test in dashboard UI

### Month 2: Expansion (Weeks 5-8)

**Week 5**: Verbs Batch 2 (12 hours)
- [ ] Add conjugation for 25 verbs (A2 level)
- [ ] Quality check and commit

**Week 6**: Adjectives (8 hours)
- [ ] Add comparison for 50 adjectives
- [ ] Quality check and commit

**Week 7**: Testing & Refinement (10 hours)
- [ ] Manual testing of all tables
- [ ] Fix errors discovered during testing
- [ ] User feedback collection

**Week 8**: Documentation (6 hours)
- [ ] Update README with new features
- [ ] Create video tutorial showing grammar tables
- [ ] Write blog post about enrichment process

**Total Time**: ~76 hours over 8 weeks (~10 hours/week)

---

## 🛠️ Tools & Resources

### Data Entry Tools

1. **Google Sheets** (recommended for collaborative entry)
   - Template: [Declension Entry Template](https://docs.google.com/spreadsheets/...)
   - Columns: ID, German, Nominative Sing, Nominative Pl, Accusative Sing, ...
   - Export to CSV → Import script

2. **VS Code with JSON extension**
   - Direct editing in `unified-vocabulary.json`
   - Schema validation on save
   - Git integration for commits

3. **Custom Web Form** (future enhancement)
   - Build Next.js admin panel
   - Form inputs for each case/tense
   - Auto-save to JSON
   - Preview in dashboard UI

### Reference Resources

| Resource | URL | Use Case |
|----------|-----|----------|
| DWDS | https://www.dwds.de/ | Nouns, verbs, examples |
| Duden | https://www.duden.de/ | Grammar verification |
| Verbformen.de | https://www.verbformen.de/ | Verb conjugation |
| Canoo.net | https://www.canoo.net/ | Grammar rules |
| Wiktionary DE | https://de.wiktionary.org/ | Community verification |

### Quality Control Tools

```bash
# Validation script
pnpm run validate:vocabulary

# Visual inspection
pnpm run dev
# Navigate to /learn/[word-id]
# Check Grammar tab

# Automated tests (future)
pnpm run test:data-enrichment
```

---

## 📊 Success Metrics

### Coverage Goals

| Phase | Target | Current | Goal | Success Criteria |
|-------|--------|---------|------|------------------|
| Phase 1 | Top 100 nouns | 5% | 100% | All A1/A2 nouns have tables |
| Phase 2 | Top 50 verbs | 5% | 100% | All essential verbs conjugated |
| Phase 3 | Top 50 adj | 4% | 100% | Common adjectives with comparison |

### Quality Goals

- ✅ **Accuracy**: 100% (verified with 2+ sources)
- ✅ **Completeness**: All 4 cases (nouns), all 3-4 tenses (verbs)
- ✅ **Consistency**: Schema-validated, no missing fields
- ✅ **Usability**: Visible in dashboard, no rendering errors

### User Impact

**Before Enrichment**:
- 95% of words show "Keine Daten vorhanden" in Grammar tab
- Users must look up conjugations externally

**After Enrichment**:
- 40% of words show full declension/conjugation
- Users can learn grammar within the app
- Reduces need for external dictionaries

---

## 🚀 Next Steps (Immediate Actions)

1. **This Week** (4 hours):
   - [ ] Set up Google Sheets template
   - [ ] Create batch import script
   - [ ] Add declension for 5 test nouns
   - [ ] Verify display in dashboard

2. **Next Week** (10 hours):
   - [ ] Batch 1: 50 nouns (A1 level)
   - [ ] Commit to Git
   - [ ] Deploy to staging

3. **Week 3** (10 hours):
   - [ ] Batch 2: 50 nouns (A2 level)
   - [ ] Start verb conjugation (auxiliary verbs first)

---

## 💡 Optimization Tips

1. **Pattern Recognition**: Group similar declension patterns
2. **Bulk Operations**: Use spreadsheet formulas to auto-fill regular patterns
3. **Verification Shortcuts**: Bookmark DWDS pages for quick lookup
4. **Git Workflow**: Commit every 10 words (easier to rollback if needed)
5. **Break Tasks**: 1 hour sessions (avoid fatigue errors)
6. **Peer Review**: Have someone check every 20 entries

---

## 🎓 Learning Resources

If you need help understanding German grammar:

1. **Cases**: [German Cases Explained](https://www.germanveryeasy.com/cases)
2. **Conjugation**: [German Verb Conjugation Guide](https://www.verbformen.com/)
3. **Best Practices**: [Wiktionary Formatting Guidelines](https://de.wiktionary.org/wiki/Hilfe:Formatierung)

---

**Status**: 📋 Planning Phase  
**Next Action**: Set up batch import script  
**Owner**: YungSeepferd  
**Estimated Completion**: March 2026 (8 weeks of part-time work)
