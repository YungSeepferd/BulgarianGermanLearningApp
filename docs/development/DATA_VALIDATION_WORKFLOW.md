# Data Validation Workflow - Systematic Quality Assurance

**Goal**: Ensure 100% accuracy and completeness of 747 vocabulary entries  
**Estimated Time**: 62 hours (5 min/entry × 747 entries)  
**Timeline**: 10 entries/day = 75 days (~2.5 months part-time)  
**Priority**: Critical for app credibility

---

## 🎯 Validation Objectives

1. **Accuracy**: All translations, examples, and grammar data correct
2. **Completeness**: No missing required fields
3. **Consistency**: Uniform formatting, categorization, metadata
4. **Quality**: Examples are natural, notes are helpful
5. **Enrichment Readiness**: Identify words needing declension/conjugation tables

---

## 📋 Validation Checklist (Per Entry)

### ✅ Required Fields (2 minutes)

| Field | Validation | Action if Missing |
|-------|------------|-------------------|
| **id** | Unique UUID | ❌ Critical error - regenerate |
| **german** | Non-empty string | ❌ Critical error - add translation |
| **bulgarian** | Non-empty string | ❌ Critical error - add translation |
| **partOfSpeech** | Valid enum value | ✅ Fix - verify in dictionary |
| **difficulty** | A1, A2, B1, or B2 | ✅ Fix - assign based on frequency |

**Validation Script**:
```typescript
function validateRequiredFields(item: VocabularyItem): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!item.id || !isValidUUID(item.id)) {
    errors.push({ field: 'id', severity: 'critical', message: 'Invalid or missing ID' });
  }
  
  if (!item.german?.trim()) {
    errors.push({ field: 'german', severity: 'critical', message: 'Missing German translation' });
  }
  
  if (!item.bulgarian?.trim()) {
    errors.push({ field: 'bulgarian', severity: 'critical', message: 'Missing Bulgarian translation' });
  }
  
  const validPos = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];
  if (!validPos.includes(item.partOfSpeech)) {
    errors.push({ field: 'partOfSpeech', severity: 'high', message: `Invalid part of speech: ${item.partOfSpeech}` });
  }
  
  const validDifficulty = ['A1', 'A2', 'B1', 'B2'];
  if (!validDifficulty.includes(item.difficulty)) {
    errors.push({ field: 'difficulty', severity: 'medium', message: `Invalid difficulty: ${item.difficulty}` });
  }
  
  return errors;
}
```

### ✅ Translation Accuracy (1 minute)

**Check**:
- German ↔ Bulgarian translation is correct
- No false friends or mistranslations
- Multiple meanings captured in `definitions` array

**Verification Sources**:
1. [Langenscheidt DE-BG Dictionary](https://bg.langenscheidt.com/)
2. [DWDS](https://www.dwds.de/)
3. [Google Translate](https://translate.google.com/) (for verification only)

**Process**:
```bash
# 1. Look up German word in Langenscheidt
# 2. Compare with entry's Bulgarian translation
# 3. If mismatch:
#    - Update primary translation
#    - Add alternative to definitions array
#    - Document in review notes
```

**Example Review**:
```json
{
  "id": "abc-123",
  "german": "Bank",
  "bulgarian": "банка",
  "definitions": [
    {
      "meaning": "финансова институция",
      "example": "Ich gehe zur Bank. - Отивам в банката."
    },
    {
      "meaning": "пейка (за сядане)",
      "example": "Ich sitze auf der Bank. - Седя на пейката."
    }
  ],
  "reviewNotes": "Word has two meanings - added both to definitions. Primary = financial institution (more common)."
}
```

### ✅ Grammar Data (1 minute)

**For Nouns**:
- [ ] Gender is correct (masculine, feminine, neuter)
- [ ] Plural form is provided (if word has plural)
- [ ] Plural is spelled correctly

**For Verbs**:
- [ ] Infinitive form is correct
- [ ] Auxiliary verb specified (haben/sein for perfect tense)
- [ ] Verb type tagged (regular/irregular/separable/modal)

**For Adjectives**:
- [ ] Comparative form provided
- [ ] Superlative form provided

**Validation Script**:
```typescript
function validateGrammarData(item: VocabularyItem): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (item.partOfSpeech === 'noun') {
    if (!item.grammar?.gender) {
      errors.push({ field: 'grammar.gender', severity: 'high', message: 'Missing gender' });
    }
    
    if (!item.grammar?.plural && !item.metadata?.noPluralForm) {
      errors.push({ field: 'grammar.plural', severity: 'medium', message: 'Missing plural form' });
    }
  }
  
  if (item.partOfSpeech === 'verb') {
    if (!item.grammar?.auxiliary) {
      errors.push({ field: 'grammar.auxiliary', severity: 'medium', message: 'Missing auxiliary verb' });
    }
  }
  
  if (item.partOfSpeech === 'adjective') {
    if (!item.grammar?.comparative || !item.grammar?.superlative) {
      errors.push({ field: 'grammar.forms', severity: 'low', message: 'Missing comparison forms' });
    }
  }
  
  return errors;
}
```

### ✅ Examples Quality (1 minute)

**Check**:
- [ ] At least 1 example provided
- [ ] Example is natural German (not literal translation)
- [ ] Bulgarian translation is accurate
- [ ] Example demonstrates word usage in context

**Quality Criteria**:
- **Natural**: "Ich gehe zur Schule." ✅ vs "Ich bin zur Schule gehend." ❌
- **Contextual**: Shows word in typical usage scenario
- **Clear**: Translation is unambiguous
- **Appropriate**: No offensive/controversial content

**Review Process**:
```bash
# 1. Read German example
# 2. Translate mentally to Bulgarian
# 3. Compare with provided translation
# 4. If mismatch or unnatural:
#    - Rewrite example or translation
#    - Document in review notes
```

**Example Corrections**:
```json
// BEFORE (unnatural)
{
  "examples": [
    {
      "german": "Der Mann ist gehend.",
      "bulgarian": "Мъжът е вървящ."
    }
  ]
}

// AFTER (natural)
{
  "examples": [
    {
      "german": "Der Mann geht zur Arbeit.",
      "bulgarian": "Мъжът отива на работа."
    }
  ],
  "reviewNotes": "Changed to more natural present tense usage."
}
```

### ✅ Categorization (30 seconds)

**Check**:
- [ ] Categories are accurate and complete
- [ ] At least 1 category assigned
- [ ] Categories follow whitelist (data/category-whitelist.json)

**Common Categories**:
- Basic: Family, Food, Travel, Work, Education
- Themes: Weather, Time, Numbers, Colors, Body Parts
- Skills: Business, Technology, Sports, Arts

**Category Audit Script**:
```typescript
function validateCategories(item: VocabularyItem): ValidationError[] {
  const errors: ValidationError[] = [];
  const whitelist = JSON.parse(readFileSync('./data/category-whitelist.json', 'utf-8'));
  
  if (!item.categories || item.categories.length === 0) {
    errors.push({ field: 'categories', severity: 'medium', message: 'No categories assigned' });
  }
  
  item.categories?.forEach(cat => {
    if (!whitelist.includes(cat)) {
      errors.push({ field: 'categories', severity: 'low', message: `Invalid category: ${cat}` });
    }
  });
  
  return errors;
}
```

---

## 🔍 Validation Workflow

### Step 1: Setup (30 minutes, one-time)

```bash
# 1. Create Google Sheet for collaborative review
# Copy template: https://docs.google.com/spreadsheets/d/[TEMPLATE_ID]

# 2. Import vocabulary data
pnpm run export:vocabulary:to-sheets

# 3. Set up validation scripts
pnpm run validate:vocabulary:setup

# 4. Create review batches (10 entries per batch)
pnpm run create:review:batches --size=10
```

**Google Sheets Template**:

| ID | German | Bulgarian | PoS | Difficulty | Grammar | Examples | Categories | Status | Notes |
|----|--------|-----------|-----|------------|---------|----------|------------|--------|-------|
| abc-123 | Mann | мъж | noun | A1 | m, Männer | Ich sehe den Mann. - Виждам мъжа. | Family, People | ✅ | Verified |
| def-456 | gehen | отивам | verb | A1 | sein | Ich gehe zur Schule. - Отивам на училище. | Travel, Actions | 🔄 | Missing conjugation |

**Status Codes**:
- ✅ Verified - Fully validated, no issues
- 🔄 In Review - Needs attention
- ❌ Critical Error - Missing required data
- 🟡 Minor Issue - Non-critical fix needed
- ⭐ Enrichment Candidate - Needs declension/conjugation

### Step 2: Batch Review (5 minutes per entry)

**Process**:
1. Open batch (10 entries) in Google Sheets
2. For each entry:
   - Run through checklist above
   - Mark status (✅/🔄/❌/🟡/⭐)
   - Add notes for issues found
   - Suggest fixes in "Notes" column
3. Export batch to JSON
4. Apply fixes via script
5. Re-validate with automated tests

**Example Batch Review Session** (50 minutes for 10 entries):

```typescript
// Review entry #1: "Mann" (5 minutes)
const entry1 = vocabulary[0];

// ✅ Required fields - all present
// ✅ Translation - correct (checked Langenscheidt)
// ✅ Grammar - gender: masculine, plural: Männer (correct)
// ✅ Examples - 2 examples, both natural
// ✅ Categories - Family, People (appropriate)
// ⭐ ENRICHMENT: Add declension table

markStatus(entry1.id, 'verified', 'Enrichment candidate - add declension');

// Review entry #2: "gehen" (7 minutes - found issues)
const entry2 = vocabulary[1];

// ✅ Required fields - all present
// ✅ Translation - correct
// 🔄 Grammar - auxiliary should be "sein" not "haben" ❌
// 🔄 Examples - only 1 example, should have 2+ ❌
// ✅ Categories - Travel, Actions
// ⭐ ENRICHMENT: Add conjugation table

markStatus(entry2.id, 'in-review', 'Fix auxiliary verb, add more examples, add conjugation');
suggestFix(entry2.id, 'grammar.auxiliary', 'sein');
suggestFix(entry2.id, 'examples', 'Add: "Wir gehen ins Kino. - Ходим на кино."');
```

### Step 3: Apply Fixes (Automated)

```bash
# 1. Export fixes from Google Sheets
pnpm run export:fixes:from-sheets --batch=1

# 2. Preview fixes
pnpm run preview:fixes --file=fixes-batch-1.json

# 3. Apply fixes (creates backup first)
pnpm run apply:fixes --file=fixes-batch-1.json

# 4. Re-validate
pnpm run validate:vocabulary --batch=1

# 5. Commit if all tests pass
git add data/unified-vocabulary.json
git commit -m "fix(vocab): batch 1 validation fixes (entries 1-10)"
```

**Fix Application Script**:
```typescript
// scripts/apply-vocabulary-fixes.ts
import { readFileSync, writeFileSync } from 'fs';
import type { VocabularyItem, VocabularyFix } from '../src/lib/types';

function applyFixes(fixes: VocabularyFix[]): void {
  const vocab: VocabularyItem[] = JSON.parse(
    readFileSync('./data/unified-vocabulary.json', 'utf-8')
  );
  
  // Create backup
  writeFileSync(
    `./data/unified-vocabulary-backup-${Date.now()}.json`,
    JSON.stringify(vocab, null, 2)
  );
  
  fixes.forEach(fix => {
    const item = vocab.find(v => v.id === fix.vocabularyId);
    if (!item) {
      console.error(`❌ Item not found: ${fix.vocabularyId}`);
      return;
    }
    
    // Apply fix based on field path
    setNestedProperty(item, fix.fieldPath, fix.newValue);
    
    console.log(`✅ Fixed ${fix.vocabularyId}: ${fix.fieldPath} → ${fix.newValue}`);
  });
  
  // Write updated vocabulary
  writeFileSync(
    './data/unified-vocabulary.json',
    JSON.stringify(vocab, null, 2)
  );
  
  console.log(`\n✅ Applied ${fixes.length} fixes to vocabulary.json`);
}

function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}
```

### Step 4: Quality Assurance (10 minutes per batch)

```bash
# 1. Run automated validation
pnpm run validate:vocabulary --batch=1

# 2. Spot-check 3 random entries manually
pnpm run spot-check --batch=1 --count=3

# 3. Generate quality report
pnpm run quality:report --batch=1

# 4. Review report and fix any remaining issues
```

**Quality Report Example**:
```
=== Vocabulary Quality Report ===
Batch: 1 (Entries 1-10)
Validation Date: 2025-12-14

✅ PASSED: 8/10 entries (80%)
🔄 IN REVIEW: 2/10 entries (20%)
❌ CRITICAL ERRORS: 0/10 entries (0%)

DETAILS:
- Entry #2 (gehen): Missing conjugation table ⭐
- Entry #5 (schön): Missing comparative/superlative forms 🟡

FIXES APPLIED:
- 3 grammar corrections
- 5 examples added
- 2 categories updated

ENRICHMENT CANDIDATES:
- 4 nouns need declension tables
- 2 verbs need conjugation tables
- 3 adjectives need comparison forms

NEXT ACTIONS:
1. Add conjugation for "gehen"
2. Add comparison forms for "schön"
3. Mark batch as complete
```

---

## 📊 Prioritization Strategy

### Priority 1: A1/A2 Words (400 entries, 33 hours)

**Rationale**: Most frequently used words, critical for beginners

**Criteria**:
- Difficulty = A1 or A2
- High-frequency words (top 1000 German words)
- Core vocabulary categories (Family, Food, Travel)

**Timeline**: 10 entries/day = 40 days

### Priority 2: Words with Examples (300 entries, 25 hours)

**Rationale**: Already have examples from Langenscheidt enrichment, need validation

**Criteria**:
- Has 1+ examples
- Examples need quality review

**Timeline**: 10 entries/day = 30 days

### Priority 3: Words Missing Grammar Data (47 entries, 4 hours)

**Rationale**: Critical gaps in grammar information

**Criteria**:
- Nouns missing gender or plural
- Verbs missing auxiliary
- Adjectives missing comparison forms

**Timeline**: 2 days (intensive review)

---

## 🛠️ Automation Tools

### Validation Scripts

```bash
# 1. Check required fields
pnpm run validate:required-fields

# 2. Check grammar completeness
pnpm run validate:grammar

# 3. Check example quality (AI-assisted)
pnpm run validate:examples

# 4. Check category consistency
pnpm run validate:categories

# 5. Full validation suite
pnpm run validate:all
```

### Google Sheets Integration

```typescript
// scripts/sheets-integration.ts
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readFileSync } from 'fs';

async function exportToSheets(batchId: number, batchSize: number = 10): Promise<void> {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!
  });
  
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[`Batch ${batchId}`] || await doc.addSheet({
    title: `Batch ${batchId}`,
    headerValues: ['ID', 'German', 'Bulgarian', 'PoS', 'Difficulty', 'Grammar', 'Examples', 'Categories', 'Status', 'Notes']
  });
  
  const vocab: VocabularyItem[] = JSON.parse(
    readFileSync('./data/unified-vocabulary.json', 'utf-8')
  );
  
  const batchStart = (batchId - 1) * batchSize;
  const batch = vocab.slice(batchStart, batchStart + batchSize);
  
  const rows = batch.map(item => ({
    ID: item.id,
    German: item.german,
    Bulgarian: item.bulgarian,
    PoS: item.partOfSpeech,
    Difficulty: item.difficulty,
    Grammar: JSON.stringify(item.grammar),
    Examples: item.examples?.length || 0,
    Categories: item.categories?.join(', '),
    Status: '🔄',
    Notes: ''
  }));
  
  await sheet.addRows(rows);
  console.log(`✅ Exported batch ${batchId} to Google Sheets`);
}
```

### AI-Assisted Validation (Optional)

```typescript
// scripts/ai-validate-examples.ts
import OpenAI from 'openai';

async function validateExampleQuality(example: Example): Promise<ValidationResult> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const prompt = `
You are a German language expert. Evaluate this example sentence:

German: ${example.german}
Bulgarian: ${example.bulgarian}

Rate (1-5):
1. Grammar correctness
2. Naturalness (sounds like native speaker)
3. Translation accuracy
4. Contextual appropriateness

Provide suggestions if score < 4.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // Parse AI response and return validation result
  return parseValidationResponse(response.choices[0].message.content);
}
```

---

## 📅 Validation Timeline

### Month 1: A1 Words (150 entries)

**Week 1-2** (70 entries):
- Daily: 5 entries × 5 min = 25 min/day
- Focus: Basic nouns (Familie, Essen, Zahlen)

**Week 3-4** (80 entries):
- Daily: 6 entries × 5 min = 30 min/day
- Focus: Common verbs (sein, haben, gehen)

### Month 2: A2 Words (250 entries)

**Week 5-8** (250 entries):
- Daily: 9 entries × 5 min = 45 min/day
- Focus: Expanded vocabulary, daily life topics

### Month 3: B1/B2 Words (347 entries)

**Week 9-12** (347 entries):
- Daily: 13 entries × 5 min = 65 min/day (1 hour)
- Focus: Advanced vocabulary, specialized topics

**Total**: 75 days at 10 entries/day = 62.5 hours

---

## 🎯 Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Required Fields Complete | 100% | 99% | 🟡 |
| Translation Accuracy | 100% | Unknown | 🔄 |
| Grammar Data Complete (Nouns) | 100% | 94% | 🟡 |
| Grammar Data Complete (Verbs) | 100% | 96% | 🟡 |
| Examples Quality (Natural) | 100% | Unknown | 🔄 |
| Examples Count (2+ per word) | 80% | 35% | ❌ |
| Categorization Complete | 100% | 98% | 🟡 |
| Declension Tables (Nouns) | 50% | 5% | ❌ |
| Conjugation Tables (Verbs) | 50% | 5% | ❌ |

---

## 🚀 Next Steps (Immediate Actions)

### This Week (3 hours)

- [ ] Set up Google Sheets template (30 min)
- [ ] Create validation scripts (1 hour)
- [ ] Export first batch (Batch 1: entries 1-10) (15 min)
- [ ] Review first batch manually (50 min)
- [ ] Apply fixes and commit (25 min)

### Next Week (5 hours)

- [ ] Review Batches 2-6 (5 batches × 50 min = 4h 10m)
- [ ] Apply fixes for all batches (30 min)
- [ ] Generate quality report (20 min)

### Week 3 (5 hours)

- [ ] Review Batches 7-12 (A1 nouns complete)
- [ ] Start enrichment candidates (add declension to 10 nouns)

---

**Status**: 📋 Planning Phase  
**Next Action**: Set up Google Sheets template  
**Owner**: YungSeepferd  
**Estimated Completion**: March 2026 (3 months)
