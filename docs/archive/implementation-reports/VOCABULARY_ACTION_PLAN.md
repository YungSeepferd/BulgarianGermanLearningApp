# Bulgarian-German Vocabulary Expansion Action Plan
## Immediate Implementation Strategy

**Created:** October 23, 2025  
**Priority:** PHASE 1 - Foundation (A1 Completion)  
**Target:** Complete A1 level to 750 words within 2 months

---

## Current Status

**Existing Vocabulary:**
- Total entries: 156
- A1 level: 120 words (16% of target)
- A2 level: 30 words (2% of target)
- B1 level: 6 words (<1% of target)

**Gap Analysis:**
- A1 needs: **630 more words** to reach 750
- A2 needs: **620 more words** after A1 is complete
- Structure is good, content needs expansion

---

## Phase 1: A1 Foundation (PRIORITY 1)

### Week 1-2: Core Expansion (Add 200 words)

#### Task 1.1: Numbers & Counting (50 words)
**Priority: CRITICAL - needed for basic communication**

Numbers to add:
- 11-20: единадесет, дванадесет, тринадесет, etc.
- 20-90 by tens: двадесет, тридесет, четиридесет, etc.
- 100-1000: сто, двеста, триста, хиляда
- Ordinals: първи, втори, трети, etc.

**File location:** Add to `/data/vocabulary.json`

```json
{
  "id": "a1_numbers_11",
  "word": "Единадесет",
  "translation": "Elf",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "Zahl",
  "level": "A1",
  "notes": "The number 11",
  "notes_bg_to_de": "В немски '11' се произнася 'елф'. Внимавайте да не го бъркате с 'zwölf' (12).",
  "notes_de_to_bg": "Für Deutschsprachige: 'Единадесет' = 'Elf'. Betonung auf der ersten Silbe.",
  "etymology": "From 'един' (one) + 'десет' (ten), literally 'one-ten'",
  "cultural_note": "Bulgarian numbers follow Slavic patterns",
  "linguistic_note": "Numbers 11-19 in Bulgarian follow pattern: unit + на + десет",
  "difficulty": 1,
  "frequency": 75,
  "examples": [
    {
      "sentence": "Имам единадесет години.",
      "translation": "Ich bin elf Jahre alt.",
      "context": "informal"
    }
  ]
}
```

#### Task 1.2: Days & Months (20 words)
**Priority: HIGH**

Already have basics, but ensure completeness:
- All 7 days: понеделник-неделя
- All 12 months: януари-декември
- Related: седмица, месец, година, календар

#### Task 1.3: Colors (Extended) (15 words)
**Priority: HIGH**

Add beyond basics (червен, син, etc.):
- светло/тъмно (light/dark) + color combinations
- оранжев, розов, лилав, кафяв, сив

#### Task 1.4: Food & Drink (50 words)
**Priority: CRITICAL - daily use**

Must-have items:
- Breakfast: яйце, масло, мармалад, кафе, чай
- Fruits: ябълка, круша, портокал, банан, грозде
- Vegetables: домат, краставица, морков, картоф
- Drinks: сок, бира, вино, минерална вода

#### Task 1.5: Common Verbs (40 words)
**Priority: CRITICAL**

Essential verbs missing:
- спя (sleep), работя (work), уча (study/learn)
- обичам (love), искам (want), мога (can)
- трябва (must), давам (give), взимам (take)
- купувам (buy), продавам (sell)
- отивам (go), идвам (come)
- разбирам (understand), знам (know)

#### Task 1.6: Question Words (10 words)
**Priority: CRITICAL**

- кой (who), какво (what), къде (where)
- кога (when), как (how), защо (why)
- колко (how much/many), чий (whose)

#### Task 1.7: Common Adjectives (15 words)
**Priority: HIGH**

- хубав (nice/beautiful), грозен (ugly)
- бърз (fast), бавен (slow)
- скъп (expensive), евтин (cheap)
- дълъг (long), къс (short)
- широк (wide), тесен (narrow)

### Week 3-4: Practical Communication (Add 200 words)

#### Task 2.1: House & Home (40 words)
- стая (room), спалня (bedroom), баня (bathroom)
- кухня (kitchen), дневна (living room)
- врата (door), прозорец (window)
- мебел (furniture), легло (bed), диван (couch)

#### Task 2.2: Clothing (30 words)
- дрехи (clothes), риза (shirt), блуза (blouse)
- панталони (trousers), рокля (dress), пола (skirt)
- палто (coat), якет (jacket), обувки (shoes)

#### Task 2.3: Weather (20 words)
- слънце (sun), дъжд (rain), сняг (snow)
- облак (cloud), вятър (wind), мъгла (fog)
- горещо (hot), студено (cold), топло (warm)

#### Task 2.4: Basic Activities (50 words)
- Activities: играя (play), пеня (sing), танцувам (dance)
- School: учебник (textbook), молив (pencil), химикалка (pen)
- Shopping: пазар (market), пазарувам (to shop)

#### Task 2.5: Personal Information (30 words)
- име (name), фамилия (surname), адрес (address)
- телефон (phone), имейл (email), възраст (age)
- професия (profession), националност (nationality)

#### Task 2.6: Pronouns & Articles (30 words)
- Personal: аз, ти, той, тя, ние, вие, те
- Demonstrative: този, тази, това (this)
- Possessive: мой, твой, негов, нейн (my, your, his, her)

### Week 5-6: Social & Travel (Add 150 words)

#### Task 3.1: Restaurant & Cafe (40 words)
- ресторант (restaurant), кафене (cafe), бар (bar)
- меню (menu), сервитьор (waiter), касиер (cashier)
- поръчвам (to order), плащам (to pay), сметка (bill)
- чаша (glass), чиния (plate), прибори (cutlery)

#### Task 3.2: Shopping (30 words)
- магазин (shop), супермаркет (supermarket)
- продавач (salesperson), купувач (buyer)
- каса (checkout), торба (bag), бон (receipt)

#### Task 3.3: Basic Travel (40 words)
- More transport: метро (metro), трамвай (tram)
- гара (station), летище (airport), спирка (stop)
- билет (ticket), карта (map), информация (information)

#### Task 3.4: Accommodation (20 words)
- хотел (hotel), рецепция (reception)
- стая (room), ключ (key), багаж (luggage)

#### Task 3.5: Feelings & States (20 words)
- щастлив (happy), тъжен (sad), уморен (tired)
- гладен (hungry), жаден (thirsty), болен (sick)

### Week 7-8: Completion & Quality (Add 80 words + Review)

#### Task 4.1: Missing Essentials (40 words)
- Review Goethe A1 list for gaps
- Add any critical missing vocabulary
- Focus on highest frequency words

#### Task 4.2: Animals (20 words)
- Complete common animals list
- домашни любимци (pets)

#### Task 4.3: Basic Expressions (20 words)
- да (yes), не (no), може би (maybe)
- много (very/much), малко (little/few)
- още (more/still), вече (already)

#### Task 4.4: Quality Assurance
- Review ALL 750 A1 entries
- Ensure every entry has:
  - ✅ Etymology
  - ✅ Cultural note (if culturally specific)
  - ✅ Linguistic note (pronunciation/stress)
  - ✅ At least 1 example for most common 400 words
  - ✅ Frequency rating (0-100)
  - ✅ Difficulty rating (1-2 for A1)

---

## Implementation Guidelines

### Entry Template for Quick Addition:

```json
{
  "id": "a1_[sequence]",
  "word": "[Bulgarian Cyrillic]",
  "translation": "[German with article if noun]",
  "source_lang": "bg",
  "target_lang": "de",
  "category": "[Category name]",
  "level": "A1",
  "notes": "[General note]",
  "notes_bg_to_de": "[Note for BG speakers learning DE]",
  "notes_de_to_bg": "[Note for DE speakers learning BG]",
  "etymology": "[Word origin]",
  "cultural_note": "[Cultural context]",
  "linguistic_note": "[Pronunciation, stress, grammar]",
  "difficulty": 1,
  "frequency": [0-100],
  "examples": [
    {
      "sentence": "[BG sentence]",
      "translation": "[DE translation]",
      "context": "informal|formal"
    }
  ]
}
```

### Frequency Guidelines:
- **90-100**: Top 100 most common words (съм, имам, правя, etc.)
- **80-89**: Top 500 words (daily essentials)
- **70-79**: Top 1000 words (common communication)
- **60-69**: Useful but less frequent
- **50-59**: A1 but specialized

### Difficulty Guidelines (A1):
- **1**: Extremely basic, direct cognate or simple concept
- **2**: Basic but requires some learning

---

## Tools & Resources for Implementation

### Reference Sources:
1. **Goethe Institut A1 Wortliste** - Use as master checklist
2. **Bulgarian Frequency Dictionary** - Verify frequency ratings
3. **Bulgarian-German Dictionary** - Verify translations
4. **Native Speaker Consultation** - For cultural notes

### Batch Processing Strategy:

**Morning Session (2-3 hours):**
1. Select category (e.g., Food & Drink)
2. Research 15-20 words
3. Fill in all required fields
4. Add examples for high-frequency words

**Afternoon Session (1-2 hours):**
5. Review morning's work
6. Add cultural and linguistic notes
7. Verify with native speaker if possible
8. Add to vocabulary.json

**Target:** 25-30 words per day = 750 words in ~25-30 working days

---

## Phase 2 Preview: A2 Preparation

### Once A1 is complete (750 words), immediately start A2:

**Priority A2 Categories:**
1. Shopping & Money (detailed)
2. Clothing & Fashion
3. Health & Body
4. Work & Professions
5. Technology (basic)
6. Entertainment

**Target:** Add 650 new words over 4-6 weeks

---

## Quality Checklist Before Moving to Next Phase

**Before starting A2, verify:**
- [ ] Total A1 entries = 750
- [ ] All entries have complete metadata
- [ ] 80%+ have etymology
- [ ] 90%+ have linguistic notes
- [ ] 70%+ have cultural notes (where relevant)
- [ ] 50%+ of high-frequency words (freq > 80) have examples
- [ ] Frequency ratings completed for all
- [ ] Difficulty ratings completed for all
- [ ] No duplicate entries
- [ ] All Bulgarian words verified for correct spelling
- [ ] All German translations verified (including articles for nouns)

---

## Success Metrics

**Weekly Tracking:**
- [ ] Words added this week: _____ / 125 target
- [ ] Quality review completed: YES/NO
- [ ] Native speaker review: YES/NO
- [ ] Examples added: _____ / 50 target

**Phase 1 Completion Criteria:**
- ✅ 750 A1 words total
- ✅ 100% completeness on required fields
- ✅ Quality assurance passed
- ✅ Ready for A2 expansion

---

## Next Steps After Phase 1

1. **Immediate:** Start A2 vocabulary collection
2. **Parallel:** Begin creating flashcard sets for A1
3. **Testing:** User testing of A1 vocabulary
4. **Integration:** Connect to spaced repetition system
5. **Documentation:** Create A1 study guide

---

**Document Status:** Active Implementation  
**Owner:** Development Team  
**Review Frequency:** Weekly during Phase 1  
**Completion Target:** December 20, 2025
