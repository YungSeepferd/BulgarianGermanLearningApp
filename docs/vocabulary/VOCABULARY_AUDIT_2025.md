# Vocabulary Audit & Improvement Plan - January 2025

**Comprehensive analysis and action plan for vocabulary quality improvement**

## Executive Summary

This audit assessed the current vocabulary database against official language test standards (Goethe, TELC, STBFL/ECL) and identified opportunities for quality improvement, deduplication, and expansion.

### Current State
- **Total Entries**: 750 vocabulary items
- **Structure**: Well-formed JSON with bidirectional Bulgarian-German translations
- **CEFR Levels**: A1-B2 coverage
- **Data Quality**: Good ID integrity, but contains duplicate translations

### Key Findings
✅ **Strengths**:
- All 750 entries have unique IDs
- Zero missing required fields (ID, word, translation)
- Rich metadata: etymology, cultural notes, examples
- Bidirectional learning notes (bg_to_de / de_to_bg)

⚠️ **Issues Identified**:
- **20+ duplicate word-translation pairs** found
- Inconsistent optional field usage (some `null` values)
- No automated vocabulary source verification against official standards

---

## Official Language Test Standards Research

### German Language Tests

#### 1. Goethe-Institut Standards
**Official Resources Available**:
- ✅ A1 Vocabulary List (PDF): `Goethe-Zertifikat A1: Start Deutsch 1 Wortliste`
- ✅ A1 Youth List (PDF, 388 KB): `Goethe-Zertifikat A1: Fit in Deutsch 1`
- ✅ A2 Vocabulary List (PDF)
- ✅ B1 Vocabulary List (PDF) - Includes articles and plurals
- ❌ B2, C1, C2 - No comprehensive vocabulary lists published

**Access Point**: https://www.goethe.de/pro/relaunch/prf/de/

**Key Features**:
- Subject areas and word groups organized by CEFR level
- B1+ includes grammatical information (articles, plurals)
- A1/A2 exclude plural forms deemed unnecessary at those levels

#### 2. TELC (The European Language Certificates)
**Official Resources Available**:
- Vocabulary lists embedded in course materials (e.g., "Einfach gut! B1.2")
- Digital resources via TELC German Box app (iOS/Android)
- Teaching materials page: https://www.telc.net/en/teaching-materials/

**Key Features**:
- Free downloadable worksheets, audio, and vocabulary lists
- Available for all CEFR levels as part of course books
- Not standalone comprehensive lists like Goethe

**Recommendation**: Download TELC app for mobile vocabulary access

### Bulgarian Language Tests

#### 1. STBFL (Standard Test of Bulgarian as a Foreign Language)
**Administered By**: Sofia University Department of Language Teaching
**Levels**: A2, B1, B2, C1, C2 (CEFR-aligned)
**Website**: https://deo.uni-sofia.bg/en/

**Vocabulary Lists**: ❌ **Not publicly available**
- CEFR does not mandate vocabulary lists
- Focus on communicative competence, not memorization

#### 2. ECL Exam (European Consortium for the Certificate of Attainment)
**Levels**: A2, B1, B2, C1
**Website**: https://eclexam.eu/sample-test-bulgarian/

**Vocabulary Lists**: ❌ **Not publicly available**

#### 3. Available Materials
- **Test Preparation Book**: "Български език като чужд. Тестове за нива А1, А2, Б1, Б2, С1, С2" (Gutenberg, 2015)
  - Contains practice tests for all CEFR levels
  - May include representative vocabulary samples

---

## Vocabulary Quality Issues

### 1. Duplicate Word-Translation Pairs (20+ Found)

```
Бавно|langsam
Билет|Ticket
Бързо|schnell
Виждам|sehen
Вода|Wasser
Вторник|Dienstag
Голям|groß
Грозен|hässlich
Деветдесет|neunzig
Деветнадесет|neunzehn
Добре|gut
Добър ден|Guten Tag
Добър|gut
Имам|haben
Какво|was
Купувам|kaufen
Къде|wo
Лош|schlecht
Малък|klein
Мишка|die Maus
```

**Impact**:
- Confusing user experience (same card appearing multiple times)
- Skews spaced repetition statistics
- Wastes database space

**Action Required**: Merge duplicates, consolidate examples and notes

### 2. Inconsistent Field Usage

**Observed Patterns**:
```json
"notes": null  // Some entries
"notes": "Actual content..."  // Other entries
```

**Recommendation**:
- Remove `null` notes fields entirely (cleaner JSON)
- Or ensure all entries have at least basic notes

---

## CEFR Vocabulary Size Guidelines

While CEFR doesn't mandate specific vocabulary lists, research suggests:

| Level | Estimated Active Vocabulary |
|-------|---------------------------|
| A1    | 500-800 words |
| A2    | 1,000-1,500 words |
| B1    | 2,500-3,000 words |
| B2    | 4,000-5,000 words |
| C1    | 8,000+ words |
| C2    | 12,000+ words |

**Current App Coverage**: 750 total entries
- Sufficient for **A1-A2** complete coverage
- Partial **B1** coverage
- Foundation for B2 expansion

---

## Action Plan: Vocabulary Improvement

### Phase 1: Data Quality (Immediate)

#### 1.1 Deduplication Script
**Priority**: HIGH
**File**: `scripts/deduplicate-vocabulary.mjs`

**Tasks**:
- Identify all duplicate word-translation pairs
- Merge entries intelligently:
  - Combine examples from both entries
  - Merge linguistic notes
  - Keep richest metadata
- Preserve unique IDs
- Generate deduplication report

**Script Logic**:
```javascript
// Group by word+translation key
// For each duplicate group:
//   - Select entry with most complete metadata as base
//   - Merge examples arrays
//   - Combine notes (bg_to_de, de_to_bg, linguistic)
//   - Keep highest frequency/difficulty values
//   - Archive removed entry IDs for reference
```

#### 1.2 Schema Validation
**Priority**: MEDIUM
**File**: `scripts/validate-vocabulary-schema.mjs`

**Checks**:
- Required fields present (id, word, translation, level, category)
- Valid CEFR levels (A1, A2, B1, B2, C1, C2)
- Valid language codes (bg, de)
- Array fields are arrays (examples)
- Numeric fields are numbers (difficulty, frequency)

#### 1.3 Null Field Cleanup
**Priority**: LOW
**Task**: Remove or populate null optional fields

```javascript
// Option 1: Remove null fields entirely
delete entry.notes if entry.notes === null

// Option 2: Provide default values
entry.notes = entry.notes || ""
```

### Phase 2: Official Vocabulary Integration (Short-term)

#### 2.1 Goethe Vocabulary Cross-Reference
**Priority**: HIGH
**Source**: Goethe A1, A2, B1 PDFs

**Process**:
1. Download official Goethe vocabulary PDFs
2. Parse PDFs to extract vocabulary (manual or OCR)
3. Create cross-reference mapping:
   ```
   German word → Is in App? → CEFR level match?
   ```
4. Identify missing high-frequency Goethe vocabulary
5. Generate "vocabulary gaps" report

**Deliverables**:
- `docs/vocabulary/GOETHE_CROSSREFERENCE.md`
- `data/goethe-vocabulary-a1.json` (reference)
- `data/goethe-vocabulary-a2.json` (reference)
- `data/goethe-vocabulary-b1.json` (reference)

#### 2.2 Vocabulary Gap Filling
**Priority**: MEDIUM
**Task**: Add missing essential vocabulary from Goethe lists

**Criteria for Addition**:
- Word appears in official Goethe list
- Word is not in current database
- Word has high practical utility (frequency >70)

**Script**: `scripts/add-missing-goethe-vocab.mjs`

### Phase 3: Vocabulary Fetching Infrastructure (Medium-term)

#### 3.1 Web Scraping Strategy
**Priority**: MEDIUM
**Compliance**: Respect robots.txt, rate limits, copyright

**Potential Sources**:
- **Goethe PDFs**: Manual extraction + OCR for structured data
- **Wiktionary API**: https://en.wiktionary.org/w/api.php
  - Etymology data
  - Example sentences
  - Translations verification
- **Linguee API** (unofficial): Contextual translations
- **Forvo API**: Audio pronunciation links

**Implementation**:
```javascript
// scripts/fetch-vocabulary-enrichment.mjs
async function enrichFromWiktionary(word, lang) {
  // Fetch etymology, definitions, examples
  // Format: { etymology, definitions[], examples[] }
}

async function enrichFromForvo(word, lang) {
  // Fetch pronunciation audio URLs
  // Format: { audioUrl, native_speaker_id }
}
```

#### 3.2 Automated Vocabulary Updater
**File**: `scripts/auto-update-vocabulary.mjs`

**Features**:
- Check for new Goethe vocabulary releases (quarterly)
- Fetch updated word frequency data
- Validate against authoritative sources
- Generate PR with suggested additions
- **Human review required before merge**

### Phase 4: Continuous Improvement (Long-term)

#### 4.1 Community Contributions
- GitHub issue template for vocabulary suggestions
- Validation checklist for contributors
- Native speaker review process

#### 4.2 Usage Analytics
- Track which vocabulary items cause most difficulty
- Identify words users mark as "learned" fastest
- Adjust difficulty multipliers based on real data

#### 4.3 Regular Audits
- Quarterly vocabulary quality audits
- Annual CEFR alignment review
- Bi-annual duplicate detection

---

## Vocabulary Fetching Script Design

### Script: `scripts/vocabulary-manager.mjs`

**Modular Design** with subcommands:

```bash
# Deduplication
npm run vocab:dedupe

# Validation
npm run vocab:validate

# Enrichment from external sources
npm run vocab:enrich --source=wiktionary --limit=50

# Gap analysis against Goethe
npm run vocab:gaps --standard=goethe --level=A1

# Export for review
npm run vocab:export --format=csv
```

### Core Modules

#### Module 1: Deduplication Engine
```javascript
class VocabularyDeduplicator {
  findDuplicates()
  mergeDuplicates(strategy = 'intelligent')
  generateReport()
}
```

#### Module 2: External Source Fetcher
```javascript
class VocabularyFetcher {
  async fetchFromWiktionary(word, lang)
  async fetchFromGoetheList(level)
  async fetchAudioFromForvo(word, lang)
  async validateTranslation(source, target)
}
```

#### Module 3: Validator
```javascript
class VocabularyValidator {
  validateSchema(entry)
  validateCEFRLevel(entry)
  checkDuplicates(entry)
  validateExamples(entry)
}
```

#### Module 4: Gap Analyzer
```javascript
class VocabularyGapAnalyzer {
  loadOfficialList(standard, level) // Goethe A1, etc.
  compareWithDatabase()
  identifyMissingWords()
  prioritizeByFrequency()
  generateReport()
}
```

---

## Implementation Timeline

### Week 1: Critical Fixes
- [ ] Create deduplication script
- [ ] Run deduplication on current database
- [ ] Test deduplicated vocabulary in dev environment
- [ ] Deploy deduplicated version

### Week 2-3: Validation & Standards
- [ ] Download Goethe A1, A2, B1 PDFs
- [ ] Parse Goethe vocabulary into JSON
- [ ] Create cross-reference tool
- [ ] Generate gap analysis report
- [ ] Prioritize 50-100 essential missing words

### Week 4-6: Enrichment Infrastructure
- [ ] Build Wiktionary API integration
- [ ] Build vocabulary enrichment pipeline
- [ ] Add missing high-priority vocabulary
- [ ] Create automated vocabulary manager CLI

### Month 2-3: Testing & Refinement
- [ ] Comprehensive QA testing
- [ ] User testing for vocabulary relevance
- [ ] Adjust CEFR level assignments based on feedback
- [ ] Document vocabulary contribution guidelines

---

## Success Metrics

### Quantitative
- **Zero duplicates** in production database
- **95%+ coverage** of Goethe A1 vocabulary
- **90%+ coverage** of Goethe A2 vocabulary
- **75%+ coverage** of Goethe B1 vocabulary
- **<3% null fields** across all entries

### Qualitative
- Native speaker validation of all new entries
- User feedback score >4.5/5 for vocabulary relevance
- CEFR level accuracy verified by language teachers

---

## Tools & Resources

### Development Tools
- **jq**: JSON parsing and validation
- **Node.js**: Script execution environment
- **Puppeteer/Playwright**: PDF parsing (if needed)
- **PDFjs**: Client-side PDF reading

### External APIs
- **Wiktionary API**: https://en.wiktionary.org/w/api.php
- **Forvo API**: https://api.forvo.com/ (requires API key)
- **DeepL API**: Translation validation (paid)

### Reference Materials
- Goethe-Institut Vocabulary Lists (A1, A2, B1)
- TELC course materials
- "Български език като чужд" test preparation book (Gutenberg, 2015)

---

## Documentation Updates

### To Archive
Move to `docs/archive-docs-cleanup/`:
- Redundant vocabulary implementation summaries
- Historical completion reports
- Outdated project plans superseded by this audit

### To Create/Update
- `docs/vocabulary/VOCABULARY_COMPLETE_GUIDE.md` - Update with new processes
- `docs/vocabulary/CONTRIBUTING_VOCABULARY.md` - Contributor guidelines
- `docs/vocabulary/GOETHE_CROSSREFERENCE.md` - Coverage mapping
- `docs/vocabulary/DEDUPLICATION_REPORT.md` - Results of cleanup

---

## Next Steps

1. **Review this audit** with project stakeholders
2. **Prioritize action items** based on user impact
3. **Create GitHub issues** for each Phase 1 task
4. **Assign resources** for vocabulary management
5. **Set up monitoring** for vocabulary quality metrics

---

**Document Status**: Draft for Review
**Author**: Vocabulary Audit Team
**Date**: January 4, 2025
**Version**: 1.0
