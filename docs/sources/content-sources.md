# Content Sources Documentation

**Purpose:** Track all sources of vocabulary, grammar, and cultural content for CEFR levels A1-B2.

**Last Updated:** 2025-11-13

---

## Source Categories

### 1. Primary Academic Sources
**License Required:** Yes
**Usage:** Grammar rules, linguistic explanations, contrastive analysis

| Source | Type | Coverage | License | Contact | Status |
|--------|------|----------|---------|---------|--------|
| Sofia University Linguistics Dept | Academic | BG grammar, contrastive | Pending | contact@uni-sofia.bg | To contact |
| Humboldt University Slavic Dept | Academic | DE-BG contrastive | Pending | slavistik@hu-berlin.de | To contact |
| Bulgarian Academy of Sciences | Academic | BG corpus, lexicon | Public | bas.bg | Available |

### 2. Official Educational Resources
**License Required:** May vary
**Usage:** CEFR-aligned content, official word lists

| Source | Type | Coverage | License | URL | Status |
|--------|------|----------|---------|-----|--------|
| Goethe-Institut | Official | A1-C2 German | Mixed | goethe.de | To review |
| Deutsche Welle "Deutsch Lernen" | Official | A1-B2 German | CC BY-NC-ND | dw.com/de/deutsch-lernen | Available |
| Bulgarian Ministry of Education | Official | A1-B2 standards | Public domain | mon.bg | Available |
| CEFR Reference Framework (Council of Europe) | Official | All levels | Public | coe.int | Available |

### 3. Online Dictionaries & Corpora
**License Required:** Check terms
**Usage:** Translations, example sentences, frequency data

| Source | Type | Coverage | License | URL | Status |
|--------|------|----------|---------|-----|--------|
| PONS Bulgarian-German | Dictionary | All levels | Terms of use | pons.com | Available |
| Bulgarian National Corpus | Corpus | Authentic BG | Research license | search.dcl.bas.bg | Available |
| German Digital Dictionary (DWDS) | Dictionary/Corpus | Authentic DE | Public | dwds.de | Available |
| OPUS Parallel Corpora | Parallel texts | BG-DE pairs | Various | opus.nlpl.eu | Available |
| Wiktionary BG/DE | Dictionary | All levels | CC BY-SA | wiktionary.org | Available |

### 4. Language Learning Platforms
**License Required:** Yes (scraping prohibited)
**Usage:** Reference only, inspiration for structure

| Source | Type | Coverage | License | URL | Notes |
|--------|------|----------|---------|-----|-------|
| Memrise | Platform | User-generated | Proprietary | memrise.com | Reference only |
| Duolingo | Platform | A1-B1 | Proprietary | duolingo.com | Reference only |
| Clozemaster | Platform | All levels | Proprietary | clozemaster.com | Reference only |

### 5. Open Educational Resources (OER)
**License Required:** No (but attribution required)
**Usage:** All content types

| Source | Type | Coverage | License | URL | Status |
|--------|------|----------|---------|-----|--------|
| Learn Bulgarian Online | Tutorial | A1-A2 | CC BY | 101languages.net/bulgarian | Available |
| Wikibooks Bulgarian | Tutorial | A1-B1 | CC BY-SA | wikibooks.org/wiki/Bulgarian | Available |
| Wikibooks German | Tutorial | All levels | CC BY-SA | wikibooks.org/wiki/German | Available |
| Bulgarian Grammar by Kuehl & Fielder | Textbook | All levels | Academic use | - | To acquire |

### 6. Cultural Context Sources
**License Required:** Attribution
**Usage:** Cultural insights, pragmatic notes

| Source | Type | Coverage | License | URL | Status |
|--------|------|----------|---------|-----|--------|
| Bulgarian Cultural Institute | Cultural | General | Public | bulgarianinstitute.com | Available |
| Goethe-Institut Cultural Programs | Cultural | German culture | Public | goethe.de/kultur | Available |
| Academic papers on BG-DE cultural differences | Research | Specific topics | Academic | Various journals | To review |

---

## Source Selection Criteria

### Quality Standards
- ✅ CEFR level explicitly stated or verifiable
- ✅ Native speaker verification available
- ✅ Examples from authentic sources (corpus-based)
- ✅ License allows educational use
- ✅ Regular updates/maintenance

### Content Validation Process
1. **Source Identification:** Find potential source
2. **License Check:** Verify usage rights
3. **Quality Review:** Check against standards
4. **Cross-Reference:** Validate with 2+ sources
5. **Native Speaker Review:** Bulgarian + German native speakers
6. **Integration:** Add to app with attribution

---

## A2 Level Content Sources (Priority)

### A2 Vocabulary Sources

**Target:** 800-1000 words across 10 themes

#### Theme 1: Daily Routines & Time (100 words)
- [ ] Deutsche Welle "Im Alltag" A2 module
- [ ] Bulgarian textbook "Български език за всеки ден" (if available)
- [ ] PONS thematic word lists
- [ ] Frequency lists from DWDS (top 3000 German words)
- [ ] Bulgarian National Corpus frequency data

#### Theme 2: Work & Education (120 words)
- [ ] Goethe-Institut "Arbeit und Beruf" materials
- [ ] Bulgarian Ministry of Education vocabulary lists
- [ ] Job posting corpora (BG-DE)
- [ ] University websites (terminology)

#### Theme 3-10: (See development plan)
- [ ] To be identified per theme
- [ ] Cross-reference multiple sources
- [ ] Validate CEFR level assignments

### A2 Grammar Sources

**Target:** 15-20 topics

#### Priority Topics to Source:
1. **Past Tenses Deep Dive**
   - [ ] "A Comprehensive Bulgarian Grammar" by Fielder
   - [ ] "Hammer's German Grammar" - past tense sections
   - [ ] Academic papers on BG aorist/imperfect vs DE Präteritum/Perfekt

2. **Future Tenses & Intentions**
   - [ ] Goethe-Institut future tense materials
   - [ ] Bulgarian grammar references on "ще + present"

3. **Modal Verbs**
   - [ ] Contrastive study: BG particles vs DE modal verbs
   - [ ] Examples from parallel corpora

4-15. (Other topics)
   - [ ] To be sourced systematically

---

## B1 Level Content Sources (Future)

**Status:** Planning phase
**Timeline:** Weeks 17-24

### Preliminary Sources Identified:
- Academic discourse: University corpora
- Current events: News corpora (Deutsche Welle, BG news sites)
- Professional life: Business German textbooks, BG business language guides

---

## B2 Level Content Sources (Future)

**Status:** Planning phase
**Timeline:** Weeks 25-32

### Preliminary Sources Identified:
- Academic papers repositories
- Literature corpora
- Specialized domain glossaries

---

## Attribution & Copyright

### Content Created by This Project
- All bidirectional learning notes
- All cultural context comparisons
- All cross-linguistic explanations
- Original examples (not from corpora)

**License:** MIT (same as project)

### Third-Party Content
All third-party content will be:
1. Used only if license permits
2. Properly attributed with source URL
3. Marked clearly in data files with `source` field
4. Reviewed for copyright compliance

### Example Attribution Format:
```json
{
  "id": "example_word_123",
  "bulgarian": "пример",
  "german": "Beispiel",
  "source": {
    "url": "https://dwds.de/wb/Beispiel",
    "license": "Public Domain",
    "retrieved": "2025-11-13"
  }
}
```

---

## Source Acquisition Timeline

### Week 1-2: Initial Contact
- [ ] Contact Sofia University for permission
- [ ] Contact Goethe-Institut for materials access
- [ ] Set up Deutsche Welle content extraction
- [ ] Review all OER materials

### Week 3-4: Content Extraction
- [ ] Extract A2 vocabulary from approved sources
- [ ] Parse grammar explanations
- [ ] Build initial A2 word lists
- [ ] Validate CEFR levels

### Week 5+: Ongoing Maintenance
- [ ] Regular corpus updates
- [ ] New source discovery
- [ ] License renewals
- [ ] Quality audits

---

## Notes for Content Creators

### When Adding New Sources:
1. Add to appropriate section above
2. Document license clearly
3. Add retrieval date
4. Note any restrictions
5. Update this file via git commit

### When Using Sources:
1. Check license allows your use case
2. Add proper attribution
3. Validate content quality
4. Cross-reference with other sources
5. Have native speaker review

### Red Flags (Do Not Use):
- ❌ No clear license or copyright
- ❌ Proprietary content without permission
- ❌ User-generated content without verification
- ❌ Inconsistent CEFR levels
- ❌ Machine-translated content without review

---

**Maintained by:** Bulgarian-German Learning App Team
**Review Schedule:** Monthly
**Contact:** See project README for contribution guidelines
