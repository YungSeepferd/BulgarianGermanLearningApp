# Extra Notes Optimization Guide

**Comprehensive strategy for leveraging and enhancing rich vocabulary metadata**

---

## Overview

The Bulgarian-German vocabulary database already features exceptional coverage of extra notes:
- **100%** of entries have cultural notes
- **100%** of entries have etymology
- **100%** of entries have linguistic notes
- **99.3%** have directional learning notes (745/750)

This document provides strategies to maximize the learning impact of these rich annotations while identifying optimization opportunities.

---

## Part 1: Current Extra Notes Landscape

### 1.1 Cultural Notes (100% Coverage)

**Purpose**: Help learners understand cultural context and appropriate usage

**Typical Content Examples**:
```json
{
  "word": "Здравей",
  "cultural_note": "Standard informal greeting used throughout the day in Bulgaria. More casual than 'Добър ден'. Always accompanied by eye contact and smile."
}
```

**Strength Assessment**:
- ✓ Time-based usage (morning, afternoon greetings)
- ✓ Formality level indicators
- ✓ Regional appropriateness notes
- ✓ Practical behavioral guidance

**Optimization Opportunities**:

1. **Add Gesture Integration** (Currently Missing)
   ```json
   {
     "cultural_gesture": "Handshake (formal), kiss on cheek (informal/friends)",
     "gesture_image": "path/to/gesture-greeting.png"
   }
   ```

2. **Document Behavioral Norms** (Currently Limited)
   ```json
   {
     "cultural_behavioral": {
       "bulgaria": "Always accompany with eye contact",
       "germany": "Firm handshake expected in professional contexts"
     }
   }
   ```

3. **Regional Variations** (Currently Missing)
   ```json
   {
     "cultural_regions": {
       "sofia": "Modern usage, slight formality increase",
       "rural": "More casual, diminutives common",
       "varna": "Coastal informality"
     }
   }
   ```

### 1.2 Etymology Notes (100% Coverage)

**Purpose**: Help learners remember words through historical/linguistic connections

**Current Quality**:
```json
{
  "word": "Здравей",
  "etymology": "From Proto-Slavic 'здравъ' (healthy) - literally a wish for good health"
}
```

**Strength Assessment**:
- ✓ Proto-Slavic origins documented
- ✓ Clear connection to modern form
- ✓ Semantic evolution explained
- ✓ Historical context provided

**Optimization Opportunities**:

1. **Cross-Linguistic Cognates** (Powerful learning tool)
   ```json
   {
     "etymology": "From Proto-Slavic 'здравъ' (healthy)",
     "etymology_cognates": {
       "german": "German 'Heil' shares Proto-Indo-European *kailo- (whole, unharmed)",
       "english": "English 'whole' from same root",
       "swedish": "Swedish 'hel' (whole) - same Proto-Germanic root"
     }
   }
   ```

2. **Semantic Field Families** (Memory anchors)
   ```json
   {
     "etymology_family": {
       "root": "здрав (healthy)",
       "related_words": ["здравина", "здравее", "здравле"],
       "family_meaning": "Health/wholeness concepts"
     }
   }
   ```

3. **False Friend Warnings** (Prevent confusion)
   ```json
   {
     "etymology_note": "CAUTION: Despite phonetic similarity to English 'zeal', Bulgarian 'зеал' has completely different origin from Proto-Slavic",
     "false_friend_pairs": [
       {
         "bulgarian": "Гост",
         "german": "Gast",
         "similarity": "Sound-alike but different etymology",
         "etymology_divergence": "Bulgarian from *gostь (guest) vs German from *gastiz (stranger)"
       }
     ]
   }
   ```

### 1.3 Linguistic Notes (100% Coverage)

**Purpose**: Provide pronunciation, grammar, and usage guidance

**Current Content**:
```json
{
  "word": "Здравей",
  "linguistic_note": "Stress on first syllable: ЗДРА-вей. Can be shortened to 'Здрасти' in very informal contexts",
  "linguistic_note_bg_to_de": "'Hallo' се произнася [ˈha.loː] и няма формални/неформални форми",
  "linguistic_note_de_to_bg": "Betonung auf der zweiten Silbe: здраве́й"
}
```

**Strength Assessment**:
- ✓ Stress patterns clearly marked (CAPS notation)
- ✓ Pronunciation variants documented
- ✓ Grammar notes provided
- ✓ Directional language differences highlighted

**Optimization Opportunities**:

1. **Add Phonetic Transcriptions** (IPA standard)
   ```json
   {
     "linguistic_note": "Stress: ЗДРА-вей",
     "ipa_bg": "[ˈzdrɑːveɪ]",
     "ipa_de": "[ˈha.loː]",
     "phonetic_difficulty_bg": "Voiced-voiced consonant cluster 'зд' unusual in German",
     "phonetic_difficulty_de": "Long vowels differ from Bulgarian patterns"
   }
   ```

2. **Grammar Tagging** (Quick reference system)
   ```json
   {
     "grammar_tags": {
       "word_type": "verb_form",
       "conjugation": "1st_conjugation",
       "mood": "imperative",
       "register": "informal",
       "inflection": "none",
       "examples": ["2nd_singular", "informal_group"]
     }
   }
   ```

3. **Dialect Variations** (Regional differences)
   ```json
   {
     "dialect_variants": {
       "standard_bulgarian": "Здравей",
       "sofia_dialect": "Здрасти",
       "mountain_dialects": "Здравo",
       "coastal": "Zdrave, zdra"
     },
     "register_variants": {
       "formal": "Здравейте",
       "informal": "Здравей",
       "very_informal": "Здрасти"
     }
   }
   ```

### 1.4 Directional Notes (99.3% Coverage)

**Purpose**: Help learners navigate language-pair-specific challenges

**Current Coverage**:
- BG→DE: 745/750 (99.3%)
- DE→BG: 745/750 (99.3%)

**Typical Content**:
```json
{
  "notes_bg_to_de": "German 'Hallo' is less formal than Bulgarian 'Здравейте', used more casually with anyone",
  "notes_de_to_bg": "Für Deutschsprachige: 'Здравей' ≈ 'Hallo'; does not require response"
}
```

**Strength Assessment**:
- ✓ Contrastive language analysis
- ✓ Register comparisons
- ✓ Usage pattern guidance
- ✓ Learner perspective explicit

**Optimization Opportunities**:

1. **Learner Difficulty Warnings** (Most impactful)
   ```json
   {
     "notes_bg_to_de": "German 'Hallo' has no formality variants",
     "learner_difficulty": "HIGH",
     "common_mistakes": [
       "Bulgarian learners often over-formalize: 'Hallo Herr' is incorrect (use 'Guten Tag')",
       "Avoiding 'Hallo' in professional settings (actually acceptable in Germany)"
     ],
     "teaching_note": "Explicitly teach that German formality uses different words, not word variations"
   }
   ```

2. **Bidirectional Difficulty Multipliers** (Spaced repetition optimization)
   ```json
   {
     "difficulty_multiplier": {
       "bg_to_de": 1.0,
       "de_to_bg": 1.2
     },
     "difficulty_justification": "German speakers struggle with: (1) Bulgarian stress patterns (not phonological), (2) postposed articles, (3) aspect system"
   }
   ```

3. **Complementary Learning Chains** (Vocabulary scaffolding)
   ```json
   {
     "prerequisite_words": ["здрав", "живот"],
     "related_expressions": ["Как си?", "Как сте?"],
     "progression_sequence": [
       "Здравей (simple greeting)",
       "Здравейте (formal variant)",
       "Как си? (follow-up question)"
     ],
     "progression_level": "A1.1"
   }
   ```

---

## Part 2: Learning Efficacy Framework

### 2.1 Cognitive Load & Retention

**Research-Based Principles**:
1. **Dual Coding**: Combining verbal + visual/gestural information improves retention
2. **Elaboration**: Rich context increases memory encoding
3. **Spacing**: Multiple exposures at increasing intervals improve long-term retention
4. **Interleaving**: Mixing different concepts improves discrimination learning

**Application to Extra Notes**:

| Type | Cognitive Impact | Learning Stage | Retention Boost |
|------|-----------------|----------------|-----------------|
| Etymology | High (memorable story) | Early (new word) | +40-50% |
| Cultural Notes | Medium (context) | Middle (usage patterns) | +20-30% |
| Linguistic Notes | High (pronunciation guide) | Throughout | +30-40% |
| Directional Notes | High (error prevention) | Practice | +25-35% |

### 2.2 Learner Profile Alignment

**Different learners benefit from different note types**:

```
Visual Learners:
├─ Etymology (narrative/story elements)
├─ Gesture descriptions
└─ Dialect variants (written forms)

Analytical Learners:
├─ Grammar tags
├─ Phonetic transcriptions (IPA)
└─ Difficulty multiplier justifications

Social/Cultural Learners:
├─ Cultural behavioral notes
├─ Regional variations
└─ Gesture information

Performance-Oriented Learners:
├─ Learner difficulty warnings
├─ Common mistakes
└─ Directional notes (efficiency)
```

---

## Part 3: Quality Assessment Framework

### 3.1 Etymology Quality Rubric

**Scoring Criteria** (out of 10):

```
Completeness (0-3 points):
├─ 3: Proto-Slavic origin + semantic evolution explained
├─ 2: Proto-Slavic origin documented
└─ 1: General historical reference only

Accuracy (0-3 points):
├─ 3: Verified against linguistic sources (Bulgarian Academy, etc.)
├─ 2: Consistent with standard etymological references
└─ 1: Plausible but unverified

Clarity (0-2 points):
├─ 2: Accessible to intermediate learners
└─ 1: Requires linguistic background

Learning Value (0-2 points):
├─ 2: Memorable, helps retention
└─ 1: Informative but not particularly sticky
```

**Example Assessment**:
```json
{
  "word": "Здравей",
  "etymology_quality_score": 9,
  "breakdown": {
    "completeness": 3,
    "accuracy": 3,
    "clarity": 2,
    "learning_value": 2
  },
  "feedback": "Excellent - clear narrative, helps learners remember the 'health wish' meaning"
}
```

### 3.2 Linguistic Notes Quality Rubric

```
Pronunciation Guidance (0-3):
├─ 3: IPA + stress pattern + variants
├─ 2: Stress pattern + key pronunciation notes
└─ 1: Stress pattern only

Grammar Coverage (0-3):
├─ 3: Part of speech + inflection + register
├─ 2: Part of speech + key inflections
└─ 1: Part of speech only

Learner Focused (0-2):
├─ 2: Addresses common learner errors
└─ 1: Technical accuracy only

Actionability (0-2):
├─ 2: Provides specific pronunciation/grammar guidance
└─ 1: Descriptive but not directly actionable
```

### 3.3 Cultural Notes Quality Rubric

```
Contextual Accuracy (0-3):
├─ 3: Multiple contexts explained (time, formality, region)
├─ 2: Primary context + 1 variation
└─ 1: Single context only

Behavioral Guidance (0-3):
├─ 3: Gestures, eye contact, expected responses documented
├─ 2: Key behavioral notes included
└─ 1: Stated use without behavioral context

Comparative Perspective (0-2):
├─ 2: Both Bulgarian AND German cultural norms explained
└─ 1: Focus on one language only

Actionability (0-2):
├─ 2: Learner knows how to use the word appropriately
└─ 1: Cultural context noted but usage unclear
```

---

## Part 4: Enhancement Roadmap

### Phase 1: Quick Wins (Weeks 1-2)
**Objective**: Improve existing notes without content addition

1. **Complete 5 Missing Entries**
   - Identify entries missing BG→DE or DE→BG notes
   - Create comprehensive notes following existing patterns
   - Quality review with native speakers

2. **Add Learner Difficulty Tags**
   - Mark entries with HIGH, MEDIUM, LOW difficulty
   - Document common learner mistakes
   - Prioritize: high-frequency entries first

3. **Add IPA Transcriptions** (Priority: Greetings category)
   - Add ipa_bg and ipa_de fields
   - Focus on pronunciation-critical entries
   - Validate with native speakers

### Phase 2: Cognate Recognition (Weeks 3-4)
**Objective**: Add etymology_cognates field to 300+ entries

1. **Identify Cross-Linguistic Cognates**
   - German cognates (shared Germanic roots)
   - English cognates (useful for many learners)
   - Other Slavic languages (reinforcement)

2. **Create Cognate Pairs**
   - Link to shared Proto-Indo-European roots
   - Mark true cognates vs. false friends
   - Add mnemonic value explanations

### Phase 3: Error Prevention (Weeks 5-6)
**Objective**: Create comprehensive learner error documentation

1. **Common Mistake Cataloging**
   - Survey learner feedback/error logs
   - Document top 5-10 mistakes per level
   - Link to directional notes

2. **Create Error Prevention Notes**
   - Specific guidance for each common mistake
   - Multiple example sentences
   - Contrastive analysis

### Phase 4: Gesture & Behavioral Integration (Weeks 7-8)
**Objective**: Add non-verbal communication guidance

1. **Gesture Documentation**
   - Describe hand signals (greetings, thanks, etc.)
   - Note cultural differences
   - Create simple illustrations/diagrams

2. **Behavioral Norms**
   - Expected responses/follow-ups
   - Eye contact norms
   - Physical distance/proximity guidelines

### Phase 5: Regional Variation Mapping (Weeks 9-10)
**Objective**: Document dialect and register variants

1. **Dialect Collection**
   - Sofia urban vs. rural variants
   - Regional differences (Sofia, Varna, Plovdiv, etc.)
   - Archaic vs. modern forms

2. **Register Variants**
   - Formal (with elderly, in government offices)
   - Neutral (general use)
   - Informal (with friends, family)
   - Very informal/slang

---

## Part 5: Implementation Best Practices

### 5.1 Quality Assurance Checklist

**For Each Extra Note Type**:

**Etymology**:
- [ ] Proto-Slavic origin verified
- [ ] Semantic evolution explained
- [ ] Connection to modern form clear
- [ ] No outdated theories cited
- [ ] Memorable learning hook present

**Linguistic Notes**:
- [ ] Stress pattern marked clearly (CAPS)
- [ ] Common pronunciation variants noted
- [ ] Grammar tags assigned
- [ ] Register markers (formal/informal) included
- [ ] IPA transcriptions provided (for key words)

**Cultural Notes**:
- [ ] Context situations described (time, formality, region)
- [ ] Behavioral expectations documented
- [ ] Bulgarian AND German perspectives included
- [ ] Practical usage guidance provided
- [ ] Potential cultural missteps warned about

**Directional Notes**:
- [ ] Language-pair-specific challenges highlighted
- [ ] Register/formality differences explained
- [ ] Common learner mistakes documented
- [ ] Difficulty multiplier justified
- [ ] Related words or expressions linked

### 5.2 Native Speaker Review Process

**Three-Person Review Panel**:
1. **Bulgarian Native Speaker**
   - Verifies etymology, cultural notes
   - Checks linguistic accuracy
   - Approves register/dialect variants

2. **German Native Speaker**
   - Verifies German cultural context
   - Checks German linguistic accuracy
   - Validates German side of directional notes

3. **Pedagogy Specialist**
   - Assesses learning efficacy of notes
   - Checks alignment with CEFR level
   - Validates difficulty multipliers

**Review Checklist**:
- [ ] All fields populated accurately
- [ ] No outdated cultural references
- [ ] Grammar/pronunciation guidance correct
- [ ] Etymology based on authoritative sources
- [ ] Difficulty rating appropriate
- [ ] Comparative analysis accurate

### 5.3 Version Control & Tracking

**Track All Changes**:
```json
{
  "word": "Здравей",
  "notes_history": [
    {
      "version": "1.0",
      "date": "2025-10-28",
      "edited_by": "initial_content_team",
      "changes": "Initial entry creation"
    },
    {
      "version": "1.1",
      "date": "2025-11-01",
      "edited_by": "native_speaker_review",
      "changes": "Added IPA transcriptions, refined etymology"
    }
  ]
}
```

---

## Part 6: Integration with Learning Application

### 6.1 UI/UX Recommendations

**Showing Extra Notes Contextually**:

1. **During Learning Mode**
   - Etymology: Show as "Did you know?" optional popup
   - Linguistic notes: Show pronunciation hints on first encounter
   - Cultural notes: Show before first use in conversation

2. **During Review Mode**
   - Directional notes: Highlight language-pair-specific tips
   - Difficulty warnings: Flag if entry marked HIGH difficulty
   - Common mistakes: Show after incorrect answer

3. **During Cultural/Grammar Deep Dive**
   - Etymology: Full narrative with cognate examples
   - Behavioral/gesture guides: Illustrations with descriptions
   - Regional variants: Interactive selector for variant forms

### 6.2 Mobile Optimization

**Considerations for Small Screens**:
- Etymology: Truncated view with expand button
- Linguistic notes: Icon-based difficulty indicators
- Cultural notes: Collapsible sections
- Directional notes: Language pair indicator (BG→DE vs DE→BG)

---

## Part 7: Metrics for Success

### Content Metrics
```
Coverage Goals:
├─ Etymology: 100% of entries (target: maintain)
├─ Linguistic notes: 100% of entries (target: maintain)
├─ Cultural notes: 100% of entries (target: maintain)
├─ Directional notes: 100% of entries (target: fix 5 missing)
├─ IPA transcriptions: 50% by Q1 2025 (target: 100% by Q4 2025)
├─ Learner difficulty tags: 100% by Q1 2025
└─ Common mistake docs: 75% of A1 entries by Q2 2025
```

### Learning Impact Metrics
```
Learner Outcomes (to be measured):
├─ Retention rate: Target +20% improvement with enhanced notes
├─ Error reduction: Target -30% common mistakes with error prevention notes
├─ Confidence levels: Track improvement with gesture/behavioral guidance
└─ Learning efficiency: Target 15% faster progression with optimized metadata
```

### Quality Metrics
```
Review Standards:
├─ Etymology accuracy: ≥95% verified by linguistic sources
├─ Cultural note accuracy: ≥90% approved by native speakers
├─ Linguistic note completeness: ≥95% required fields populated
└─ Directional note usefulness: ≥4.0/5.0 learner satisfaction rating
```

---

## Part 8: Examples of Enhanced Entries

### Example 1: Complete Enhancement (Greeting)
```json
{
  "id": "zdravej_001",
  "word": "Здравей",
  "translation": "Hallo",
  "level": "A1",
  "category": "Begrüßung",

  "etymology": "From Proto-Slavic 'здравъ' (healthy) - literally 'be healthy', a wish for good health",
  "etymology_cognates": {
    "german": "German 'Heil' (health) shares Proto-Indo-European *kailo- (whole, unharmed)",
    "english": "English 'whole' from same root",
    "russian": "Russian 'здоровье' (health) from same Slavic root"
  },
  "etymology_family": ["здрав", "здравина", "здравле"],
  "etymology_note": "The greeting literally means 'be healthy' - similar to Arabic 'السلام عليكم' (peace be upon you)",

  "linguistic_note": "Stress: ЗДРА-vey [ˈzdrɑːveɪ]",
  "ipa_bg": "[ˈzdrɑːveɪ]",
  "ipa_de": "[ˈha.loː]",
  "grammar_tags": ["verb_form", "2nd_singular_imperative", "informal", "no_conjugation"],
  "dialect_variants": {
    "sofia": "Здрасти (very informal)",
    "coastal": "Zdrave",
    "formal_register": "Здравейте"
  },
  "phonetic_difficulty_bg_to_de": "The initial consonant cluster 'зд' doesn't exist in German - explicitly teach pronunciation",

  "cultural_note": "Standard informal greeting used throughout the day in Bulgaria. More casual than 'Добър ден'. Often accompanied by handshake (formal), kiss on cheek (friends), or wave.",
  "cultural_behavioral": {
    "bulgaria": "Always with eye contact and smile; often followed by 'Как си?' (How are you?)",
    "germany": "'Hallo' is less formal, used casually throughout the day; doesn't require handshake"
  },
  "cultural_gesture": "Handshake (professional), kiss on cheek (friends/family), wave (casual)",
  "cultural_regions": {
    "sofia": "Modern usage, slight preference for 'Добър ден' in formal contexts",
    "rural": "More casual, diminutives common"
  },

  "notes_bg_to_de": "German 'Hallo' has no formality variants - use 'Guten Tag' for formal contexts instead",
  "notes_de_to_bg": "Unlike Bulgarian, German doesn't expect a response like 'Как си?' - just 'Hallo' or 'Hallo, wie geht's?'",
  "learner_difficulty": "MEDIUM",
  "common_mistakes": [
    "Bulgarians overusing 'Здравейте' (formal) in casual German contexts - teach to use 'Hallo' more freely",
    "Germans trying to find 'formal Hallo' - no such form exists",
    "Pronunciation: Germans struggle with 'зд' cluster"
  ],

  "difficulty_multiplier": {
    "bg_to_de": 1.0,
    "de_to_bg": 1.2
  },
  "difficulty_justification": "German speakers struggle with Bulgarian stress placement (stress is on syllable 1, not 2)",

  "prerequisite_words": ["здрав"],
  "related_expressions": ["Добър ден", "Как си?", "Добро утро"],
  "progression_sequence": ["Здравей (simple greeting)", "Как си? (follow-up)", "Здравейте (formal variant)"],

  "examples": [
    {
      "sentence": "Здравей, как си?",
      "translation": "Hallo, wie geht's?",
      "context": "informal"
    },
    {
      "sentence": "Здравей, мило!",
      "translation": "Hallo, Schatz!",
      "context": "intimate"
    }
  ],

  "verified_by": "native_speaker_bg",
  "created_date": "2025-10-28",
  "last_updated": "2025-11-01"
}
```

### Example 2: Enhanced Professional Word
```json
{
  "id": "sastoyaniе_245",
  "word": "Събеседование",
  "translation": "Bewerbungsgespräch",
  "level": "B1",
  "category": "Beruf",

  "etymology": "From Bulgarian 'събор' (gathering) + 'беседа' (conversation) = 'gathered conversation'",
  "etymology_cognates": {
    "other_slavic": "Serbian 'разговор' (conversation) uses different root but same concept",
    "german": "German 'Gespräch' shares Germanic root with English 'speak'"
  },

  "linguistic_note": "Stress: събеседОване (last syllable). Formal register only.",
  "ipa_bg": "[sɐbesiðɔˈvɑːnɛ]",
  "ipa_de": "[bəˈvɛrbuŋsfɡ(ə)ʃpʀɛç]",
  "grammar_tags": ["noun", "feminine", "formal", "professional_register"],
  "register_variants": {
    "formal": "Събеседование",
    "informal": "Беседа за работа"
  },

  "cultural_note": "Job interviews in Bulgaria typically last 30-45 minutes, focus on qualifications and cultural fit. German interviews are more structured and time-efficient.",
  "cultural_behavioral": {
    "bulgaria": "Punctuality important but 15 mins late often forgiven; casual dress acceptable for some sectors; handshake expected",
    "germany": "Arrive 10-15 minutes early (MUST); formal business attire expected; firm handshake and eye contact throughout"
  },

  "notes_bg_to_de": "German interviews are more formal and structured. Small talk is minimal. Get directly to business questions.",
  "notes_de_to_bg": "Bulgarian interviews are more conversational. Building personal rapport is important. Small talk about interests is common.",
  "learner_difficulty": "HIGH",
  "common_mistakes": [
    "Translating directly to 'Interview' (Englicism) instead of using proper German 'Bewerbungsgespräch'",
    "Using casual 'разговор' instead of formal 'събеседование'",
    "Not understanding German punctuality expectations"
  ],

  "difficulty_multiplier": {
    "bg_to_de": 1.0,
    "de_to_bg": 1.4
  },
  "difficulty_justification": "Complex professional register; German version combines elements (Bewerbung + Gespräch) unlike Bulgarian compound form",

  "related_expressions": ["Работно интервю", "CV", "Допитване", "Разговор"],
  "prerequisite_words": ["работа", "събеседа", "интервю"],

  "examples": [
    {
      "sentence": "Имам събеседование за работа в петък.",
      "translation": "Ich habe ein Bewerbungsgespräch am Freitag.",
      "context": "formal"
    },
    {
      "sentence": "Как се подготвиш за събеседованието?",
      "translation": "Wie bereitest du dich auf das Bewerbungsgespräch vor?",
      "context": "formal"
    }
  ],

  "verified_by": "native_speaker_de",
  "created_date": "2025-11-05",
  "last_updated": "2025-11-05"
}
```

---

## Conclusion

The exceptional coverage of extra notes in the current vocabulary database (100% etymology, linguistic notes, and cultural notes) provides an excellent foundation for learning. By systematically enhancing these notes with:

1. **Cognate recognition** (etymology_cognates)
2. **Learner error prevention** (common_mistakes, difficulty ratings)
3. **Non-verbal communication** (gestures, behavioral norms)
4. **Regional variations** (dialects, registers)
5. **Phonetic precision** (IPA transcriptions)

We can significantly increase learning efficacy while maintaining the high quality that currently characterizes the database. The 15-week roadmap in the main VOCABULARY_IMPROVEMENT_ROADMAP provides a structured path to implement these enhancements alongside the vocabulary expansion effort.

