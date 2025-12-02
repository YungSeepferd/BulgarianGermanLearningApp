# Bulgarian-German Learning App - Comprehensive Roadmap

**Document Version**: 2.0
**Last Updated**: October 27, 2025
**Status**: Active Development
**Target Completion**: March 2026 (5 months)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Vision & Goals](#project-vision--goals)
3. [Current State Assessment](#current-state-assessment)
4. [Vocabulary Expansion Strategy](#vocabulary-expansion-strategy)
5. [Technical Roadmap](#technical-roadmap)
6. [Testing & Quality Assurance](#testing--quality-assurance)
7. [Deployment & Launch](#deployment--launch)
8. [Success Metrics](#success-metrics)
9. [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

The Bulgarian-German Learning App is a **Hugo-based static tandem language learning platform** with spaced repetition, bidirectional vocabulary practice, and PWA offline support. Currently at **750 A1-compliant vocabulary entries** (100% quality rating), the project is ready for expansion to comprehensive A1-C2 CEFR coverage.

### Project Snapshot

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| **Vocabulary Entries** | 750 (A1) | 4,400+ (A1-C2) | 17% |
| **CEFR Levels Covered** | A1 only | A1-C2 | 16.7% |
| **Code Quality** | Good | Excellent | 75% |
| **Test Coverage** | Partial (15/40 E2E) | 80%+ | 37.5% |
| **Mobile Support** | Blocked (P0 bugs) | Full | 0% |
| **Production Readiness** | Development | Launched | 60% |

### Key Priorities

1. **🚀 CRITICAL**: Fix mobile navigation and vocabulary card loading (P0 bugs) - **4-6 hours**
2. **📚 PRIMARY GOAL**: Expand vocabulary from 750 to 4,400+ entries across A1-C2 levels - **3-4 months**
3. **🧪 QUALITY**: Achieve 80%+ test coverage and fix failing tests - **2-3 weeks**
4. **🎨 ENHANCEMENT**: Complete grammar module with interactive exercises - **3-4 weeks**
5. **🌍 DEPLOYMENT**: Public launch with full mobile support - **1 week after P0 fixes**

---

## Project Vision & Goals

### Vision Statement

> Create the **most comprehensive free open-source tandem language learning platform** for Bulgarian and German, supporting true bidirectional learning with cultural context, spaced repetition, and CEFR-aligned vocabulary from A1 to C2.

### Core Differentiators

1. **True Tandem Learning**: Unlike Duolingo/Babbel (monodirectional), we support:
   - Bulgarian speakers learning German (BG→DE)
   - German speakers learning Bulgarian (DE→BG)
   - Direction-specific notes, difficulty multipliers, and cultural context

2. **Bilingual Excellence**: All vocabulary includes:
   - Bulgarian explanations of German words (for BG speakers)
   - German explanations of Bulgarian words (for DE speakers)
   - Etymology, cultural notes, linguistic notes in both languages

3. **CEFR-Aligned Quality**: Based on official resources:
   - Goethe-Institut German vocabulary lists (A1-B1)
   - Sofioter University Bulgarian STBFL standards
   - Academic frequency lists (DeReWo, Leipzig Corpora)

4. **No Vendor Lock-in**: 100% free, open-source, works offline, no ads, no subscriptions

### Target Audience

**Primary Users:**
- **Vincent** (28, German software developer in Sofia) - Learning Bulgarian for daily life
- **Ida** (25, Bulgarian medical student in Berlin) - Learning German for career

**Secondary Users:**
- Language enthusiasts interested in both languages
- Researchers studying tandem learning effectiveness
- Educators using bilingual teaching materials

---

## Current State Assessment

### ✅ Completed Features (Working Well)

#### Core Infrastructure
- ✅ Hugo Extended site with ES modules
- ✅ PWA with offline support (service worker v1.3.0)
- ✅ GitHub Pages CI/CD deployment
- ✅ Security headers (CSP, Permissions-Policy)
- ✅ Dependency scanning (npm audit, govulncheck)
- ✅ Pinned GitHub Actions for supply-chain security

#### Learning Features
- ✅ Spaced repetition (SM-2 algorithm, unified v2.0)
- ✅ Flashcard practice with keyboard shortcuts (Space/Enter flip, 1-5 grade)
- ✅ Bidirectional learning (BG→DE / DE→BG with direction multipliers)
- ✅ Progress tracking (localStorage persistence)
- ✅ Language direction toggle with confirmation modal
- ✅ Cultural context display (etymology, linguistic notes)
- ✅ Vocabulary filtering (level, category, search)
- ✅ **NEW**: Pagination with virtual scroll, persistence, keyboard shortcuts, URL filters

#### Data Quality
- ✅ **750 vocabulary entries** (100% A1-compliant)
- ✅ Average difficulty: 1.20 (excellent for beginners)
- ✅ Average frequency: 82.7 (all common words)
- ✅ 30+ categories (verbs, nouns, adjectives, time, food, etc.)
- ✅ Bidirectional notes for all entries
- ✅ Cultural/etymological context for all entries

### 🟡 Partial/Incomplete Features (Needs Work)

#### Mobile Experience (CRITICAL - P0)
- ❌ **Navigation not visible on mobile viewports** (10+ tests failing)
- ❌ **Vocabulary cards load inconsistently** (8 tests failing, blank states)
- ❌ **Keyboard events lost after re-init** (5 tests failing)
- ❌ **Language toggle state not syncing** (2 tests failing)

**Impact**: Public launch blocked until mobile fixes complete

#### Grammar Module
- ✅ Grammar rules browser (Markdown content)
- ❌ Interactive exercises (client-side quizzes) - **Not implemented**
- ⚠️ Examples with audio - **Needs verification**
- ❌ Progress tracking - **Not implemented**

**Status**: Partially complete, needs 3-4 weeks development

#### Testing
- ⚠️ E2E tests: 15/40 passing (37.5%)
- ❌ Unit tests: Not implemented
- ✅ Playwright configured
- ❌ Accessibility audit incomplete

**Status**: Needs 2-3 weeks dedicated QA work

### ❌ Missing Features (Planned)

1. **Vocabulary Expansion**: 750 → 4,400+ entries (A1-C2)
2. **Audio Pronunciation**: Text-to-speech integration partial, needs full workflow
3. **Offline Audio**: Cached pronunciation for offline practice
4. **Analytics Consent**: GDPR-compliant consent banner (required for EU)
5. **Loading States**: Skeleton screens, spinners for async operations
6. **Error Handling**: User-friendly error messages, retry logic
7. **Unit Tests**: SM-2 math validation, data adapter tests

---

## Vocabulary Expansion Strategy

### CEFR Vocabulary Targets

Based on official Goethe-Institut and Sofioter University standards:

| Level | Current | Target | Additional Needed | Priority | Timeline |
|-------|---------|--------|-------------------|----------|----------|
| **A1** | 750 | 650 | ✅ **Surplus (+100)** | Completed | Done |
| **A2** | 0 | 1,300 | **+650 words** | HIGH | Month 1-2 |
| **B1** | 0 | 2,400 | **+1,100 words** | HIGH | Month 2-3 |
| **B2** | 0 | 4,000-5,000 | **+1,600 words** | MEDIUM | Month 3-4 |
| **C1** | 0 | 8,000-10,000 | Subset only | LOW | Month 4-5 |
| **C2** | 0 | 15,000+ | Not planned | - | Future |

**Total Target**: **4,400 vocabulary entries** (A1-B2 comprehensive + C1 subset)

### Vocabulary Sources

#### German Vocabulary (Official Sources)

1. **Goethe-Institut Lists** (FREE):
   - A1: 650 words ([Download PDF](https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf))
   - A2: 1,300 words ([Download PDF](https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_A2_Wortliste.pdf))
   - B1: 2,400 words ([Download PDF](https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_B1_Wortliste.pdf))

2. **DeReWo (German Reference Corpus)** (FREE):
   - 350,000+ lemma entries
   - Frequency classes
   - POS-tagged
   - [Download](https://www.ids-mannheim.de/en/s/corpus-linguistics/projects/methods-of-analysis/corpus-based-lemma-and-word-form-lists/)

3. **Routledge Frequency Dictionary** (PAID: ~$60):
   - 5,000 most frequent words
   - English translations
   - Example sentences
   - 21 thematic lists

4. **Leipzig Corpora Collection** (FREE):
   - 36 million sentences
   - Co-occurrence data
   - REST API available
   - [Download](https://downloads.wortschatz-leipzig.de/corpora/)

#### Bulgarian Vocabulary (Official Sources)

1. **Sofioter University STBFL Standards**:
   - A2-C2 levels (no official A1)
   - Structured curriculum
   - ALTE-certified

2. **Wiktionary Bulgarian List** (FREE):
   - 5,000 most frequent words
   - OpenSubtitles.org source
   - Public domain
   - [View List](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Bulgarian_wordlist)

3. **MostUsedWords Bulgarian Dictionary** (PAID: ~$20):
   - 2,500 most frequent words
   - IPA transcriptions
   - Bilingual examples
   - Organized by frequency/POS

4. **Leipzig Corpora Bulgarian** (FREE):
   - News/Web/Wikipedia sources
   - Multiple corpus sizes
   - Co-occurrence data

5. **Здравейте! Textbook Series**:
   - Red Book (A1-A2): ~264 pages
   - Blue Book (B1-B2): ~300 pages
   - Green Book (C1-C2): ~384 pages

#### Bilingual Resources

1. **dict.cc Deutsch-Bulgarisch** (FREE):
   - 43,891 verified translations
   - Community-driven
   - Bidirectional
   - Downloadable database
   - [Access](https://bgde.dict.cc/)

2. **PONS Online Dictionary** (FREE):
   - 1+ million entries
   - Audio pronunciations
   - Professional lexicographers
   - [Access](https://en.pons.com/translate/german-bulgarian)

3. **Assimil "Bulgarisch ohne Mühe"** (PAID: €99.80):
   - 100 progressive lessons
   - 2,000 vocabulary words
   - Audio by native speakers
   - A1-B2 coverage

### Vocabulary Acquisition Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Data Collection (2-3 weeks)                        │
│ ─────────────────────────────────────────────────────────   │
│ 1. Download Goethe-Institut PDFs (A1-B1)                    │
│ 2. Extract vocabulary from DeReWo/Leipzig Corpora           │
│ 3. Parse Wiktionary Bulgarian list                          │
│ 4. Cross-reference dict.cc database                         │
│ 5. Purchase Routledge/MostUsedWords if budget available     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: Data Processing (3-4 weeks)                        │
│ ─────────────────────────────────────────────────────────   │
│ 1. Deduplicate entries (merge by lemma)                     │
│ 2. Assign CEFR levels based on source                       │
│ 3. Calculate frequency scores (Leipzig Corpora)             │
│ 4. Assign difficulty ratings (1-5 scale)                    │
│ 5. Categorize by topic (30+ categories)                     │
│ 6. Extract POS tags, gender, plural forms                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: Bilingual Content Creation (8-12 weeks)            │
│ ─────────────────────────────────────────────────────────   │
│ FOR EACH VOCABULARY ENTRY:                                  │
│                                                              │
│ 1. BG→DE Direction (Bulgarian speaker learning German)      │
│    ├─ notes_bg_to_de: Bulgarian explanation of German word  │
│    ├─ examples_bg_to_de: 2-3 example sentences             │
│    ├─ cultural_note: Cultural context in Bulgarian          │
│    └─ linguistic_note_bg_to_de: Grammar notes in Bulgarian  │
│                                                              │
│ 2. DE→BG Direction (German speaker learning Bulgarian)      │
│    ├─ notes_de_to_bg: German explanation of Bulgarian word  │
│    ├─ examples_de_to_bg: 2-3 example sentences             │
│    ├─ cultural_note: Cultural context in German             │
│    └─ linguistic_note_de_to_bg: Grammar notes in German     │
│                                                              │
│ 3. Shared Fields                                            │
│    ├─ etymology: Word origin (bilingual: BG\nDE)           │
│    ├─ pronunciation_ipa: IPA transcription                  │
│    ├─ audio_file: Path to pronunciation audio              │
│    └─ related_words: Synonyms, antonyms, derivatives        │
│                                                              │
│ TOOLS:                                                       │
│ - AI-assisted content generation (Claude, GPT-4)            │
│ - Native speaker review (iTalki tutors)                     │
│ - Batch processing scripts                                  │
│ - Quality validation (scripts/validate-data.mjs)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: Quality Assurance (2-3 weeks)                      │
│ ─────────────────────────────────────────────────────────   │
│ 1. Validate data schema (all required fields present)       │
│ 2. Check CEFR level appropriateness                         │
│ 3. Verify frequency/difficulty scores                       │
│ 4. Native speaker review of cultural notes                  │
│ 5. Test pronunciations (IPA + audio)                        │
│ 6. Ensure bidirectional content balance                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: Integration & Testing (1-2 weeks)                  │
│ ─────────────────────────────────────────────────────────   │
│ 1. Merge into data/vocabulary.json                          │
│ 2. Rebuild Hugo site                                        │
│ 3. Test pagination with 4,400+ items                        │
│ 4. Verify virtual scrolling performance                     │
│ 5. Update filters to include all levels                     │
│ 6. E2E testing of new vocabulary                            │
└─────────────────────────────────────────────────────────────┘
```

### Content Creation Strategy

#### Batch Processing Approach

**Target**: 650 words/month (A2 level in Month 1-2)

**Daily Goal**: ~22 words/day (1-2 hours/day)

**Workflow**:
1. **Morning (30 min)**: Extract 22 words from Goethe-Institut list
2. **Afternoon (30 min)**: Add German translations via PONS/dict.cc
3. **Evening (30 min)**: Create BG→DE notes (Bulgarian explanations)
4. **Next Day Morning (30 min)**: Create DE→BG notes (German explanations)
5. **Quality Check (15 min)**: Run validation script, fix errors

**Automation Tools**:
- `scripts/extract-goethe-vocabulary.mjs` - Parse PDF lists
- `scripts/enrich-vocabulary.mjs` - Add translations from dict.cc API
- `scripts/generate-notes-template.mjs` - Create note templates
- `scripts/validate-data.mjs` - Quality checks (already exists)

#### AI-Assisted Content Generation

**Use Claude/GPT-4 for**:
- Generating cultural context notes
- Creating example sentences
- Writing etymology explanations
- Translating notes between languages

**Human Review Required for**:
- Cultural sensitivity (idioms, stereotypes)
- Grammatical accuracy (cases, gender)
- Pronunciation IPA transcriptions
- Audio file selection/recording

#### Native Speaker Involvement

**Budget**: ~$200/month for iTalki tutors

**Tasks for Bulgarian Native Speakers**:
- Review BG→DE notes (ensure natural Bulgarian)
- Validate cultural notes from Bulgarian perspective
- Record audio pronunciations (optional)

**Tasks for German Native Speakers**:
- Review DE→BG notes (ensure natural German)
- Validate cultural notes from German perspective
- Check Goethe-Institut list alignment

### Quality Criteria

Each vocabulary entry must meet these standards:

| Criterion | A1-A2 | B1-B2 | C1-C2 |
|-----------|-------|-------|-------|
| **Bidirectional Notes** | Required | Required | Required |
| **Example Sentences** | 2+ | 3+ | 4+ |
| **Cultural Context** | Optional | Recommended | Required |
| **Etymology** | Optional | Recommended | Required |
| **Audio Pronunciation** | Optional | Recommended | Required |
| **IPA Transcription** | Optional | Required | Required |
| **Related Words** | 1+ | 3+ | 5+ |
| **Difficulty Score** | 1-2 | 2-3 | 3-5 |
| **Frequency Score** | 60+ | 40+ | 20+ |

**Validation Script**: `npm run validate:vocabulary`

---

## Technical Roadmap

### Phase 1: Critical Fixes (Week 1) 🚨

**Priority**: P0 - Blocks public launch

#### 1.1 Mobile Navigation Fix (Est: 2-3 hours)
- **Files**: `assets/scss/components/_navigation.scss`, `layouts/partials/header.html`
- **Issue**: Navigation links not visible on mobile viewports
- **Tests Failing**: 10+ E2E tests
- **Solution**: Fix media queries, ensure hamburger menu works

#### 1.2 Vocabulary Card Loading Fix (Est: 1-2 hours)
- **Files**: `assets/js/vocab-cards.js`, `assets/js/enhanced-vocab-cards.js`
- **Issue**: Cards load inconsistently, causing blank states
- **Tests Failing**: 8 E2E tests
- **Solution**: Fix initialization timing, add loading states

#### 1.3 Keyboard Event Persistence (Est: 1 hour)
- **Files**: `assets/js/flashcards.js`
- **Issue**: Keyboard grading lost after flashcard re-initialization
- **Tests Failing**: 5 E2E tests
- **Solution**: Use event delegation pattern

#### 1.4 Language Toggle State Sync (Est: 1 hour)
- **Files**: `assets/js/unified-practice-session.js`
- **Issue**: Practice sessions don't reflect language direction changes
- **Tests Failing**: 2 E2E tests
- **Solution**: Fix localStorage sync

**Acceptance Criteria**:
- ✅ All 25 failing tests pass
- ✅ Mobile navigation works on 360px viewport
- ✅ Vocabulary cards load consistently
- ✅ Keyboard shortcuts work after re-init
- ✅ Language toggle reflects immediately

---

### Phase 2: Vocabulary Expansion (Months 1-4) 📚

See detailed [Vocabulary Expansion Strategy](#vocabulary-expansion-strategy) above.

**Milestones**:
- Month 1: +650 words (A2 complete) → 1,400 total
- Month 2: +550 words (A2 polished, B1 started) → 1,950 total
- Month 3: +1,100 words (B1 complete) → 3,050 total
- Month 4: +1,350 words (B2 complete) → 4,400 total

**Deliverables**:
- `data/vocabulary.json` with 4,400+ entries
- All entries with bidirectional notes
- All entries CEFR-level tagged
- All entries validated (schema + quality checks)

---

### Phase 3: Grammar Module Completion (Weeks 5-8) 📖

#### 3.1 Interactive Exercises
- **Format**: JSON-based exercises with client-side validation
- **Types**: Multiple choice, fill-in-blank, drag-and-drop, translation
- **Files**: `data/grammar-exercises.json`, `assets/js/grammar-quiz.js`
- **Target**: 10 exercises per grammar topic (12 topics = 120 exercises)

#### 3.2 Audio Examples
- **Source**: Text-to-speech (Web Speech API) + recorded native audio
- **Files**: `static/audio/grammar/` directory structure
- **Integration**: `layouts/shortcodes/grammar-example.html`

#### 3.3 Progress Tracking
- **Storage**: localStorage (`bgde:grammar-progress`)
- **Features**: Exercise completion, quiz scores, last reviewed
- **UI**: Progress bars, completion badges

**Acceptance Criteria**:
- ✅ 120+ grammar exercises implemented
- ✅ Audio for all example sentences
- ✅ Progress tracking persistent
- ✅ Mobile-responsive quiz UI

---

### Phase 4: Testing & Quality (Weeks 9-11) 🧪

#### 4.1 Unit Tests
- **Framework**: Vitest
- **Coverage Target**: 80%+
- **Files**: `tests/unit/`
- **Scope**:
  - SM-2 algorithm math validation
  - Data adapters (vocabulary, grammar)
  - Utility functions (storage, validation)

#### 4.2 E2E Tests
- **Current**: 15/40 passing (37.5%)
- **Target**: 80%+ (32/40 passing)
- **Focus**:
  - Fix mobile test failures
  - Add vocabulary filtering tests
  - Add pagination tests
  - Add grammar quiz tests

#### 4.3 Accessibility Audit
- **Tools**: axe DevTools, NVDA screen reader, keyboard-only navigation
- **WCAG Level**: AA compliance
- **Focus Areas**:
  - Keyboard navigation (all features accessible)
  - Screen reader announcements (page changes, quiz results)
  - Color contrast (minimum 4.5:1)
  - Focus indicators (visible on all interactive elements)

**Acceptance Criteria**:
- ✅ 80%+ unit test coverage
- ✅ 80%+ E2E tests passing
- ✅ WCAG AA compliance
- ✅ No axe violations

---

### Phase 5: Performance & Polish (Weeks 12-14) 🎨

#### 5.1 Loading States
- **Components**: Vocabulary grid, practice session, grammar quiz
- **Implementation**: Skeleton screens, spinners, progress indicators
- **Files**: `assets/scss/components/_loading.scss`

#### 5.2 Error Handling
- **Features**: User-friendly error messages, retry logic, offline fallback
- **Files**: `assets/js/error-handler.js`
- **Scope**: Network errors, parsing errors, quota exceeded (localStorage)

#### 5.3 Icon Optimization
- **Current**: 15KB (192px), 45KB (512px)
- **Target**: <10KB (192px), <30KB (512px)
- **Tools**: ImageOptim, Squoosh

#### 5.4 Analytics Consent (GDPR)
- **Implementation**: Cookie consent banner
- **Files**: `layouts/partials/cookie-consent.html`
- **Scope**: Gate Google Analytics script load

**Acceptance Criteria**:
- ✅ All async operations have loading states
- ✅ All errors show user-friendly messages
- ✅ Icons optimized
- ✅ GDPR-compliant analytics

---

### Phase 6: Audio Integration (Weeks 15-17) 🔊

#### 6.1 Text-to-Speech Workflow
- **API**: Web Speech API (browser-native)
- **Fallback**: Recorded audio files
- **Languages**: German (de-DE), Bulgarian (bg-BG)

#### 6.2 Pronunciation Practice
- **Features**: Record user audio, compare with reference
- **Files**: `assets/js/pronunciation-practice.js`
- **Scope**: Flashcard mode + dedicated pronunciation page

#### 6.3 Offline Audio Cache
- **Implementation**: Service worker caches audio files
- **Scope**: Most common 100 words per level
- **Total**: ~600 audio files (A1-B2)

**Acceptance Criteria**:
- ✅ TTS works for all vocabulary
- ✅ Pronunciation practice functional
- ✅ Offline audio for top 600 words

---

## Testing & Quality Assurance

### Test Pyramid

```
                    ┌──────────────┐
                    │   E2E Tests  │  40 tests (Playwright)
                    │  User Flows  │  Target: 80% passing
                    └──────────────┘
                 ┌─────────────────────┐
                 │  Integration Tests  │  20 tests
                 │  API + Components   │  Target: 100%
                 └─────────────────────┘
            ┌────────────────────────────────┐
            │        Unit Tests              │  100+ tests
            │  Functions + Modules           │  Target: 80% coverage
            └────────────────────────────────┘
```

### Testing Strategy

#### Unit Tests (Vitest)
- **Path**: `tests/unit/`
- **Scope**: Pure functions, utilities, SM-2 algorithm
- **Example**: `tests/unit/spaced-repetition.test.js`

```javascript
describe('SM-2 Algorithm', () => {
  it('should calculate next review interval correctly', () => {
    const result = scheduleNext(1.3, 0, 5);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeGreaterThan(1.3);
  });
});
```

#### Integration Tests
- **Scope**: Component interactions, data flow
- **Example**: Vocabulary filtering + pagination

#### E2E Tests (Playwright)
- **Current**: 15/40 passing
- **Priority**: Fix mobile failures first
- **Coverage**:
  - Vocabulary browsing and filtering
  - Flashcard practice with SM-2
  - Grammar exercises
  - Language toggle
  - Offline mode

### QA Checklist

**Before Each Release**:
- [ ] All P0/P1 bugs fixed
- [ ] 80%+ tests passing
- [ ] No console errors
- [ ] Lighthouse score: 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] Mobile tested on real devices (iOS Safari, Android Chrome)
- [ ] Offline mode works
- [ ] Service worker updates correctly

---

## Deployment & Launch

### Pre-Launch Checklist

**Technical**:
- [ ] Fix all P0 mobile bugs
- [ ] 80%+ test coverage
- [ ] WCAG AA accessibility compliance
- [ ] Lighthouse scores 90+
- [ ] Security audit passed (npm audit, govulncheck)

**Content**:
- [ ] Minimum 1,400 vocabulary entries (A1+A2)
- [ ] All entries have bidirectional notes
- [ ] Grammar module functional
- [ ] Audio for top 100 words

**Legal/Compliance**:
- [ ] GDPR cookie consent banner
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Attribution for data sources

### Launch Strategy

**Phase 1: Soft Launch** (Week 1)
- Deploy to GitHub Pages
- Share with beta testers (10-20 users)
- Monitor analytics, collect feedback
- Fix critical bugs

**Phase 2: Public Launch** (Week 2)
- Announce on:
  - Reddit (r/languagelearning, r/German, r/bulgaria)
  - HackerNews (Show HN)
  - Product Hunt
  - Language learning forums
- Press release to language learning blogs
- Social media posts

**Phase 3: Growth** (Months 2-6)
- SEO optimization
- Content marketing (blog posts about tandem learning)
- Community building (Discord server)
- Feature requests and roadmap updates

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### User Engagement
- **Daily Active Users (DAU)**: Target 100+ within 3 months
- **Session Duration**: Target 15+ minutes/session
- **Return Rate**: Target 40%+ weekly return users
- **Completion Rate**: Target 30%+ complete at least one practice session

#### Learning Outcomes
- **Vocabulary Learned**: Track words marked as "known" (grade 4-5)
- **Streak Days**: Encourage daily practice
- **CEFR Progress**: Track level transitions (A1→A2→B1)
- **Session Success**: Average grade 3+ indicates effective learning

#### Technical Performance
- **Page Load Time**: < 2s on 3G
- **Time to Interactive**: < 3s
- **Offline Success Rate**: 95%+ of features work offline
- **Error Rate**: < 1% of requests

#### Content Quality
- **Vocabulary Coverage**: 4,400+ entries (A1-B2 complete)
- **Data Accuracy**: 95%+ correct translations (native speaker validated)
- **Bidirectional Balance**: All entries have both BG→DE and DE→BG notes

### Analytics Setup

**Tools**:
- Google Analytics 4 (with GDPR consent)
- Custom events for learning actions
- localStorage metrics dashboard

**Events to Track**:
- `practice_session_start`
- `practice_session_complete`
- `vocabulary_card_view`
- `flashcard_grade` (with grade 0-5)
- `filter_applied` (level, category)
- `language_direction_changed`
- `grammar_quiz_completed`

---

## Timeline & Milestones

### Overall Timeline: 5 Months (Nov 2025 - Mar 2026)

```
┌──────────────────────────────────────────────────────────────────────┐
│ November 2025 - Critical Fixes & A2 Vocabulary                       │
│ ──────────────────────────────────────────────────────────────────── │
│ Week 1: Fix P0 mobile bugs (navigation, cards, keyboard, toggle)    │
│ Week 2-3: Add 650 A2 words (Goethe-Institut list)                   │
│ Week 4: Soft launch with 1,400 words (A1+A2)                        │
│                                                                       │
│ Milestone: 🚀 Public launch with mobile support                      │
│ Deliverable: 1,400 vocabulary entries (A1+A2 complete)               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ December 2025 - B1 Vocabulary & Grammar Module                       │
│ ──────────────────────────────────────────────────────────────────── │
│ Week 1-2: Add 550 B1 words (progress to 1,950 total)                │
│ Week 3-4: Complete grammar interactive exercises (120 exercises)     │
│                                                                       │
│ Milestone: 📚 Grammar module complete                                 │
│ Deliverable: 1,950 vocabulary entries, 120 grammar exercises         │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ January 2026 - B1/B2 Vocabulary & Testing                            │
│ ──────────────────────────────────────────────────────────────────── │
│ Week 1-2: Complete B1 vocabulary (+550 words → 2,500 total)         │
│ Week 3: Unit tests (80% coverage target)                            │
│ Week 4: Fix E2E tests (80% passing target)                          │
│                                                                       │
│ Milestone: 🧪 80%+ test coverage achieved                             │
│ Deliverable: 2,500 vocabulary entries, comprehensive test suite      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ February 2026 - B2 Vocabulary & Audio Integration                    │
│ ──────────────────────────────────────────────────────────────────── │
│ Week 1-3: Add B2 vocabulary (+1,350 words → 3,850 total)            │
│ Week 4: Audio integration (TTS + offline cache)                     │
│                                                                       │
│ Milestone: 🔊 Audio features complete                                 │
│ Deliverable: 3,850 vocabulary entries, audio for top 600 words       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ March 2026 - B2 Polish & C1 Subset                                   │
│ ──────────────────────────────────────────────────────────────────── │
│ Week 1-2: Polish B2 vocabulary, add cultural notes                  │
│ Week 3-4: Add C1 subset (+550 high-frequency words → 4,400 total)   │
│                                                                       │
│ Milestone: 🎯 CEFR A1-B2 Complete + C1 Subset                         │
│ Deliverable: 4,400 vocabulary entries (production-ready)             │
└──────────────────────────────────────────────────────────────────────┘
```

### Monthly Breakdown

#### Month 1 (November 2025): Launch Foundation
- **Week 1**: Critical mobile fixes (P0 bugs)
- **Week 2**: A2 vocabulary (325 words)
- **Week 3**: A2 vocabulary (325 words) - Complete 650 total
- **Week 4**: Soft launch, beta testing, feedback

**Deliverable**: 1,400 words (A1+A2), mobile-ready app

#### Month 2 (December 2025): Grammar & B1 Start
- **Week 1**: B1 vocabulary (275 words)
- **Week 2**: B1 vocabulary (275 words)
- **Week 3**: Grammar exercises (60 exercises)
- **Week 4**: Grammar exercises (60 exercises)

**Deliverable**: 1,950 words (A1+A2+B1 partial), grammar module

#### Month 3 (January 2026): B1 Complete & Testing
- **Week 1**: B1 vocabulary (275 words)
- **Week 2**: B1 vocabulary (275 words) - Complete 1,100 B1 total
- **Week 3**: Unit tests (80% coverage)
- **Week 4**: E2E test fixes (80% passing)

**Deliverable**: 2,500 words (A1+A2+B1), comprehensive tests

#### Month 4 (February 2026): B2 Vocabulary
- **Week 1**: B2 vocabulary (450 words)
- **Week 2**: B2 vocabulary (450 words)
- **Week 3**: B2 vocabulary (450 words)
- **Week 4**: Audio integration (TTS + cache)

**Deliverable**: 3,850 words (A1-B2 partial), audio features

#### Month 5 (March 2026): B2 Polish & C1 Subset
- **Week 1**: B2 vocabulary polish (cultural notes, quality review)
- **Week 2**: C1 subset vocabulary (275 high-frequency words)
- **Week 3**: C1 subset vocabulary (275 high-frequency words)
- **Week 4**: Final QA, performance optimization, launch preparation

**Deliverable**: 4,400 words (A1-B2 complete + C1 subset), production-ready

---

## Risk Management

### High-Risk Items

#### 1. Vocabulary Content Creation Bottleneck
- **Risk**: Creating 3,650 new entries (with bidirectional notes) may take longer than estimated
- **Mitigation**:
  - Use AI-assisted content generation (Claude, GPT-4)
  - Hire freelancers for batch translation (Upwork, Fiverr)
  - Community contributions (GitHub PRs)
  - Reduce target to B1 (2,500 total) if timeline slips

#### 2. Native Speaker Review Availability
- **Risk**: Cannot find reliable Bulgarian/German native speakers for quality review
- **Mitigation**:
  - Use iTalki tutor network (pre-book sessions)
  - Language exchange partners (Tandem app)
  - University language departments (Sofia University, Goethe-Institut)

#### 3. Mobile Test Failures Persist
- **Risk**: Fixing mobile issues takes longer than 1 week
- **Mitigation**:
  - Prioritize navigation fix (highest impact)
  - Use mobile-first CSS approach going forward
  - Add mobile-specific E2E tests to prevent regression

#### 4. Performance Issues with 4,400+ Entries
- **Risk**: Virtual scrolling may not be sufficient, page becomes slow
- **Mitigation**:
  - Already implemented virtual scrolling (1000+ threshold)
  - Lazy-load vocabulary data (pagination at data level)
  - Code splitting for better initial load
  - Consider server-side pagination if needed (upgrade to Netlify/Vercel)

### Medium-Risk Items

#### 5. Audio File Storage/Bandwidth
- **Risk**: 4,400 audio files may exceed GitHub Pages limits
- **Mitigation**:
  - Use TTS (Web Speech API) as primary, audio files as fallback
  - Compress audio with Opus codec (<5KB per file)
  - Host audio on separate CDN (Cloudflare R2, Backblaze B2)

#### 6. GDPR Compliance Complexity
- **Risk**: Cookie consent implementation more complex than expected
- **Mitigation**:
  - Use existing GDPR-compliant solutions (Cookiebot, OneTrust free tier)
  - Minimize tracking (only essential analytics)
  - Make app fully functional without consent

---

## Resources & Budget

### Time Investment

**Total Estimated Hours**: 400-500 hours over 5 months

| Phase | Hours | Weekly |
|-------|-------|--------|
| Mobile Fixes (Week 1) | 6 hours | 6 |
| Vocabulary Expansion (Months 1-4) | 200 hours | 12-15 |
| Grammar Module (Month 2) | 40 hours | 10 |
| Testing (Month 3) | 40 hours | 10 |
| Audio Integration (Month 4) | 30 hours | 8 |
| Polish & C1 (Month 5) | 40 hours | 10 |
| Project Management | 50 hours | 2-3 |

**Recommended Schedule**: 12-15 hours/week (evenings + weekends)

### Financial Budget

**Optional Investments** (Total: $200-400):

| Item | Cost | Priority |
|------|------|----------|
| Routledge Frequency Dictionary | $60 | MEDIUM |
| MostUsedWords Bulgarian Dictionary | $20 | MEDIUM |
| Assimil Textbook (reference) | $100 | LOW |
| iTalki Native Speaker Reviews | $100-200 | HIGH |
| **Total** | **$280-380** | - |

**Free Alternatives**:
- Use Goethe-Institut PDFs (FREE)
- Use Leipzig Corpora (FREE)
- Use Wiktionary frequency lists (FREE)
- Community review via GitHub (FREE)

**Recommended**: Start with free resources, invest in iTalki reviews ($100-200) for quality assurance.

---

## Next Steps (Immediate Actions)

### This Week (Week of Oct 28, 2025)

**Day 1 (Monday)**:
- [ ] Fix mobile navigation visibility (2-3 hours)
- [ ] Test on real mobile devices (iOS Safari, Android Chrome)

**Day 2 (Tuesday)**:
- [ ] Fix vocabulary card loading timing (1-2 hours)
- [ ] Add loading states (skeleton screens)

**Day 3 (Wednesday)**:
- [ ] Fix keyboard event persistence (1 hour)
- [ ] Fix language toggle state sync (1 hour)
- [ ] Run full E2E test suite

**Day 4 (Thursday)**:
- [ ] Download Goethe-Institut A2 PDF
- [ ] Create `scripts/extract-goethe-vocabulary.mjs`
- [ ] Extract first 100 A2 words

**Day 5 (Friday)**:
- [ ] Create note templates for 100 words
- [ ] Add translations from dict.cc
- [ ] Validate with `npm run validate:vocabulary`

**Weekend**:
- [ ] Write bidirectional notes for 100 words
- [ ] Test new vocabulary in app
- [ ] Prepare soft launch announcement

### Next Month (November 2025)

**Week 1**: Mobile fixes complete, soft launch
**Week 2-3**: Add 650 A2 words
**Week 4**: Beta testing, feedback, iteration

---

## Appendices

### A. Data Schema

See `docs/API.md` for complete vocabulary JSON schema.

**Minimum Required Fields**:
```json
{
  "id": "word_001",
  "word": "Здравей",
  "translation": "Hallo",
  "level": "A1",
  "category": "Begrüßung",
  "difficulty": 1,
  "frequency": 95,
  "notes_bg_to_de": "...",
  "notes_de_to_bg": "..."
}
```

### B. CEFR Level Descriptions

**A1 (Beginner)**: Can understand and use familiar everyday expressions and very basic phrases.

**A2 (Elementary)**: Can communicate in simple and routine tasks requiring a simple and direct exchange of information.

**B1 (Intermediate)**: Can deal with most situations likely to arise while traveling in an area where the language is spoken.

**B2 (Upper Intermediate)**: Can understand the main ideas of complex text on both concrete and abstract topics.

**C1 (Advanced)**: Can understand a wide range of demanding, longer texts, and recognize implicit meaning.

**C2 (Proficient)**: Can understand with ease virtually everything heard or read.

### C. Official Resources Links

**German (Deutsch als Fremdsprache)**:
- Goethe-Institut A1: https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf
- Goethe-Institut A2: https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_A2_Wortliste.pdf
- Goethe-Institut B1: https://www.goethe.de/pro/relaunch/prf/en/Goethe-Zertifikat_B1_Wortliste.pdf
- DeReWo Corpus: https://www.ids-mannheim.de/en/s/corpus-linguistics/
- Leipzig Corpora: https://downloads.wortschatz-leipzig.de/corpora/

**Bulgarian (Bulgarisch als Fremdsprache)**:
- Sofioter University STBFL: https://deo.uni-sofia.bg/en/bulgarian-language/
- Wiktionary List: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Bulgarian_wordlist
- Leipzig Bulgarian: https://downloads.wortschatz-leipzig.de/corpora/

**Bilingual Dictionaries**:
- dict.cc: https://bgde.dict.cc/
- PONS: https://en.pons.com/translate/german-bulgarian

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 27, 2025 | Initial comprehensive roadmap | Claude Code |
| 2.0 | Oct 27, 2025 | Added pagination enhancements, vocabulary expansion strategy | Claude Code |

---

## Conclusion

This roadmap provides a **structured 5-month plan** to transform the Bulgarian-German Learning App from a solid A1-level prototype (750 words) into a **comprehensive tandem learning platform** with 4,400+ CEFR-aligned vocabulary entries (A1-C2).

**Key Success Factors**:
1. **Fix mobile issues immediately** (Week 1) to unblock public launch
2. **Systematic vocabulary expansion** using official Goethe-Institut and academic sources
3. **Quality-first approach** with native speaker review and validation scripts
4. **Incremental delivery** with monthly milestones and soft launch early
5. **Community involvement** via GitHub for contributions and feedback

**Realistic Outcome**: By March 2026, the app will be the **most comprehensive free open-source Bulgarian-German tandem learning resource**, rivaling commercial platforms while maintaining full offline support and zero vendor lock-in.

**Next Action**: Fix mobile P0 bugs this week, then start A2 vocabulary extraction.

---

**Roadmap Owner**: Project Maintainers
**Review Cycle**: Monthly
**Last Review**: October 27, 2025
**Next Review**: November 27, 2025
