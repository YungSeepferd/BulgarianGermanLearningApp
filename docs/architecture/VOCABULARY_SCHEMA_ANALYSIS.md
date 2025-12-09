# Vocabulary Schema Analysis and Unification Plan

## 📋 Table of Contents
- [1. Current Schema Overview](#-current-schema-overview)
- [2. Legacy Schema Variations](#-legacy-schema-variations)
- [3. Schema Differences Analysis](#-schema-differences-analysis)
- [4. Unified Schema Design](#-unified-schema-design)
- [5. Migration Strategy](#-migration-strategy)
- [6. Deduplication Strategy](#-deduplication-strategy)
- [7. Category Standardization](#-category-standardization)
- [8. Validation Rules](#-validation-rules)
- [9. Implementation Plan](#-implementation-plan)

---

## 1. Current Schema Overview

### Current [`vocabulary.json`](src/lib/data/vocabulary.json) Schema
```typescript
interface CurrentVocabularyItem {
  id: string;                     // e.g., "v001-apfel"
  german: string;                 // e.g., "der Apfel"
  bulgarian: string;              // e.g., "ябълката"
  category: string;               // e.g., "Food"
  tags: string[];                 // e.g., ["Noun", "A1", "Food"]
  type: "word";                   // Always "word" in current schema
  difficulty: string;             // e.g., "A1"
  pronunciation?: string;         // e.g., "German: [ˈap͡fl̩], Bulgarian: [ˈjabɐɫkɐtɐ]"
  example?: string;               // e.g., "German: 'Ich esse einen Apfel.', Bulgarian: 'Аз ям ябълка.'"
  contextual_nuance?: string;     // Cultural/linguistic nuances
  mnemonics?: string;             // Memory aids
  emoji?: string;                 // e.g., "🍎"
  audio_url?: string;             // e.g., "/audio/bg/v001-apfel.mp3"
  grammar_details: {
    verb_aspect?: string | null;  // e.g., "imperfective"
    verb_partner_id?: string | null; // e.g., "v004-gegangen"
    noun_gender?: string | null;  // e.g., "masculine"
    plural_form?: string | null;  // e.g., "Äpfel"
  };
  xp_value: number;               // e.g., 10
}
```

### Current TypeScript Schema ([`src/lib/schemas/vocabulary.ts`](src/lib/schemas/vocabulary.ts))
```typescript
interface VocabularyItem {
  id: string;                     // LegacyIdSchema (supports UUID, string, number)
  german: string;                 // min 1, max 100 chars
  bulgarian: string;              // min 1, max 100 chars
  partOfSpeech: PartOfSpeech;    // enum: noun, verb, adjective, etc.
  difficulty: number;             // 1-5 scale (1=easiest)
  categories: VocabularyCategory[]; // enum: greetings, numbers, family, etc.
  transliteration?: string;       // Latin characters for pronunciation
  emoji?: string;                 // Visual representation
  literalBreakdown?: Array<{     // For compound words
    segment: string;
    literal: string;
    grammarTag: string;
  }>;
  metadata?: {
    gender?: "masculine" | "feminine" | "neuter";
    pluralForm?: string;
    conjugation?: Record<string, string>;
    examples?: Array<{
      german: string;
      bulgarian: string;
      context?: string;
    }>;
    synonyms?: string[];
    antonyms?: string[];
    relatedWords?: string[];
    notes?: string;
    mnemonic?: string;
    culturalNote?: string;
    etymology?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isCommon: boolean;
  isVerified: boolean;
  learningPhase: number;          // 0-6 (0=Not Started, 1-6=SRS Phases)
}
```

---

## 2. Legacy Schema Variations

### 2.1 Batch Files Schema (e.g., [`vocabulary-batch-2-numbers-verbs.json`](_legacy_archive/data/archive-data-cleanup/vocabulary-batch-2-numbers-verbs.json))
```typescript
interface LegacyBatchItem {
  id: string;                     // e.g., "a1_number_014"
  word: string;                   // Bulgarian word (e.g., "Четиринадесет")
  translation: string;            // German translation (e.g., "vierzehn")
  source_lang: "bg";              // Always "bg"
  target_lang: "de";              // Always "de"
  category: string;               // e.g., "Zahlen"
  level: string;                  // e.g., "A1"
  notes?: string;                 // General notes
  notes_bg_to_de?: string;        // Notes for Bulgarian speakers learning German
  notes_de_to_bg?: string;        // Notes for German speakers learning Bulgarian
  etymology?: string;             // Word origin
  cultural_note?: string;         // Cultural context
  difficulty: number;             // 1-5 scale
  frequency: number;              // 1-100 scale
  examples?: Array<{             // Usage examples
    sentence: string;            // Bulgarian sentence
    translation: string;         // German translation
    context?: string;            // Context description
  }>;
  linguistic_note?: string;       // Linguistic observations
  linguistic_note_bg_to_de?: string;
  linguistic_note_de_to_bg?: string;
}
```

### 2.2 Color Files Schema (e.g., [`vocabulary-batch-5a-colors.json`](_legacy_archive/data/archive-data-cleanup/vocabulary-batch-5a-colors.json))
```typescript
interface LegacyColorItem {
  id: string;                     // e.g., "a1_color_001"
  word: string;                   // Bulgarian word (e.g., "Черен")
  translation: string;            // German translation (e.g., "schwarz")
  source_lang: "bg";
  target_lang: "de";
  category: string;               // e.g., "Farben"
  level: string;                  // e.g., "A1"
  notes: string;                  // Comprehensive notes
  notes_bg_to_de: string;         // Notes for Bulgarian speakers
  notes_de_to_bg: string;         // Notes for German speakers
  etymology: string;              // Word origin
  cultural_note: string;          // Cultural context
  difficulty: number;             // 1-2 scale
  frequency: number;              // 65-85 scale
  examples: Array<{              // Usage examples
    bg: string;                   // Bulgarian sentence
    de: string;                   // German translation
    context?: string;             // Context description
  }>;
  linguistic_note: string;        // Pronunciation and grammar notes
  linguistic_note_bg_to_de: string;
  linguistic_note_de_to_bg: string;
}
```

### 2.3 Family Files Schema (e.g., [`vocabulary-batch-7a-family.json`](_legacy_archive/data/archive-data-cleanup/vocabulary-batch-7a-family.json))
```typescript
interface LegacyFamilyItem {
  id: string;                     // e.g., "a1_family_001"
  word: string;                   // Bulgarian word (e.g., "Майка")
  translation: string;            // German translation (e.g., "die Mutter")
  source_lang: "bg";
  target_lang: "de";
  category: string;               // e.g., "Familie"
  level: string;                  // e.g., "A1"
  notes: string | null;           // Basic notes
  notes_bg_to_de: string;         // Notes for Bulgarian speakers
  notes_de_to_bg: string;         // Notes for German speakers
  etymology: string;              // Word origin
  cultural_note: string;          // Cultural context
  difficulty: number;             // Always 1
  frequency: number;              // 70-95 scale
  examples: Array<{              // Usage examples
    bg: string;                   // Bulgarian sentence
    de: string;                   // German translation
    context: string;              // Context description
  }>;
  linguistic_note: string;        // Gender/grammar notes
  linguistic_note_bg_to_de: string;
  linguistic_note_de_to_bg: string;
}
```

### 2.4 Fixed Vocabulary Schema (e.g., [`vocabulary-fixed.json`](_legacy_archive/data/archive-data-cleanup/vocabulary-fixed.json))
```typescript
interface LegacyFixedItem {
  id: string;                     // e.g., "zdravej_001", "guten_tag"
  word: string;                   // Bulgarian word/phrase
  translation: string;            // German translation
  source_lang: "bg";
  target_lang: "de";
  category: string;               // e.g., "Begrüßung", "Ausdruck"
  level: string;                  // e.g., "A1", "A2"
  notes: string | null;           // Comprehensive notes
  notes_bg_to_de?: string;        // Notes for Bulgarian speakers
  notes_de_to_bg?: string;        // Notes for German speakers
  etymology?: string;             // Word origin
  cultural_note?: string;         // Cultural context
  difficulty: number;             // 1-3 scale
  frequency: number;              // 60-100 scale
  examples?: Array<{             // Usage examples
    sentence?: string;           // Bulgarian sentence
    translation?: string;        // German translation
    bg?: string;                  // Alternative format
    de?: string;                  // Alternative format
    context?: string;             // Context description
  }>;
  linguistic_note_bg_to_de?: string;
  linguistic_note_de_to_bg?: string;
  // Some items have additional fields like:
  // - etymology (detailed)
  // - cultural_note (detailed)
  // - examples with different formats
}
```

---

## 3. Schema Differences Analysis

### 3.1 Field Mapping Across Schemas

| Current Schema Field       | Legacy Batch Field       | Legacy Color Field       | Legacy Family Field      | Legacy Fixed Field       | Notes                                                                 |
|----------------------------|--------------------------|--------------------------|--------------------------|--------------------------|-----------------------------------------------------------------------|
| id                         | id                       | id                       | id                       | id                       | Different ID formats                                                 |
| german                     | -                        | -                        | -                        | -                        | Missing in legacy (uses translation)                                |
| bulgarian                  | word                     | word                     | word                     | word                     | Field name difference                                                |
| partOfSpeech               | -                        | -                        | -                        | -                        | Missing in legacy                                                    |
| difficulty                 | difficulty               | difficulty               | difficulty               | difficulty               | Different scales (string vs number)                                  |
| categories                 | category                 | category                 | category                 | category                 | Single category vs array                                             |
| -                          | level                    | level                    | level                    | level                    | A1/A2 level designation                                              |
| -                          | source_lang              | source_lang              | source_lang              | source_lang              | Always "bg"                                                          |
| -                          | target_lang              | target_lang              | target_lang              | target_lang              | Always "de"                                                          |
| pronunciation              | -                        | -                        | -                        | -                        | Missing in legacy                                                    |
| metadata.examples          | examples                 | examples                 | examples                 | examples                 | Different formats (array of objects)                                |
| metadata.notes             | notes                    | notes                    | notes                    | notes                    | Comprehensive notes                                                   |
| -                          | notes_bg_to_de           | notes_bg_to_de           | notes_bg_to_de           | notes_bg_to_de           | Notes for Bulgarian speakers                                         |
| -                          | notes_de_to_bg           | notes_de_to_bg           | notes_de_to_bg           | notes_de_to_bg           | Notes for German speakers                                            |
| -                          | linguistic_note          | linguistic_note          | linguistic_note          | -                       | Linguistic observations                                               |
| -                          | linguistic_note_bg_to_de | linguistic_note_bg_to_de | linguistic_note_bg_to_de | linguistic_note_bg_to_de | Linguistic notes for Bulgarian speakers                              |
| -                          | linguistic_note_de_to_bg | linguistic_note_de_to_bg | linguistic_note_de_to_bg | linguistic_note_de_to_bg | Linguistic notes for German speakers                                 |
| metadata.etymology         | etymology                | etymology                | etymology                | etymology                | Word origin                                                          |
| metadata.culturalNote      | cultural_note            | cultural_note            | cultural_note            | cultural_note            | Cultural context                                                     |
| metadata.mnemonic          | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| emoji                      | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| audio_url                  | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| grammar_details            | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| metadata.gender            | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| metadata.pluralForm        | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| metadata.synonyms          | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| metadata.antonyms          | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| metadata.relatedWords      | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| createdAt                  | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| updatedAt                  | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| isCommon                   | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| isVerified                 | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| learningPhase              | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| xp_value                   | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| -                          | frequency                | frequency                | frequency                | frequency               | Frequency rating (60-100)                                            |
| transliteration            | -                        | -                        | -                        | -                       | Missing in legacy                                                    |
| literalBreakdown           | -                        | -                        | -                        | -                       | Missing in legacy                                                    |

### 3.2 Key Differences Summary

1. **Field Naming Inconsistencies**:
   - `bulgarian` vs `word` (same content, different names)
   - `german` vs `translation` (same content, different names)

2. **Structural Differences**:
   - Current schema uses `metadata` object for nested data
   - Legacy schemas use flat structure with many specific fields
   - Current schema uses arrays for categories, legacy uses single string

3. **Missing Data in Legacy**:
   - No part of speech classification
   - No grammar details (gender, plural forms, verb aspects)
   - No audio URLs
   - No emoji
   - No timestamps
   - No learning phase tracking
   - No verification status

4. **Additional Data in Legacy**:
   - Language direction fields (`source_lang`, `target_lang`)
   - Direction-specific notes (`notes_bg_to_de`, `notes_de_to_bg`)
   - Direction-specific linguistic notes
   - Frequency ratings
   - Level designations (A1, A2)

5. **Example Format Differences**:
   - Current: `{ german: string, bulgarian: string, context?: string }`
   - Legacy: `{ sentence: string, translation: string, context?: string }` or `{ bg: string, de: string, context?: string }`

6. **ID Format Differences**:
   - Current: `v001-apfel` (simple sequential)
   - Legacy: `a1_number_014`, `a1_color_001`, `a1_family_001`, `zdravej_001` (category-based)

---

## 4. Unified Schema Design

### 4.1 Unified Vocabulary Item Schema

```typescript
interface UnifiedVocabularyItem {
  id: string;                     // Unique identifier (UUID or legacy format)
  german: string;                 // German word/phrase
  bulgarian: string;              // Bulgarian word/phrase
  partOfSpeech: PartOfSpeech;    // Enum: noun, verb, adjective, etc.
  difficulty: number;             // 1-5 scale (1=easiest)
  categories: VocabularyCategory[]; // Array of standardized categories
  transliteration?: {            // Pronunciation guides
    german?: string;             // Latin transcription for German
    bulgarian?: string;          // Latin transcription for Bulgarian
  };
  emoji?: string;                 // Visual representation
  audio?: {                       // Audio resources
    german?: string;             // URL for German pronunciation
    bulgarian?: string;          // URL for Bulgarian pronunciation
  };
  grammar?: {                    // Grammar details
    gender?: "masculine" | "feminine" | "neuter"; // For nouns
    pluralForm?: string;         // Plural form
    verbAspect?: "perfective" | "imperfective" | null; // For verbs
    verbPartnerId?: string;      // ID of aspectual partner verb
    conjugation?: Record<string, string>; // Verb conjugations
  };
  examples: Array<{             // Usage examples
    german: string;             // German example
    bulgarian: string;          // Bulgarian example
    context?: string;           // Context description
    source?: "current" | "legacy" | "merged"; // Source of example
  }>;
  notes?: {                     // Comprehensive notes
    general?: string;           // General notes
    forBulgarianSpeakers?: string; // Notes for Bulgarians learning German
    forGermanSpeakers?: string; // Notes for Germans learning Bulgarian
    linguistic?: string;        // Linguistic observations
    linguisticForBulgarians?: string; // Linguistic notes for Bulgarians
    linguisticForGermans?: string; // Linguistic notes for Germans
    source?: "current" | "legacy" | "merged"; // Source of notes
  };
  etymology?: string;           // Word origin
  culturalNotes?: string[];     // Cultural context notes
  mnemonics?: string[];         // Memory aids
  synonyms?: string[];          // Synonyms
  antonyms?: string[];          // Antonyms
  relatedWords?: string[];      // Related words
  metadata?: {                  // Additional metadata
    frequency?: number;         // 1-100 frequency rating
    level?: "A1" | "A2" | "B1" | "B2" | "C1"; // CEFR level
    isCommon?: boolean;         // Common word flag
    isVerified?: boolean;       // Verification status
    learningPhase?: number;     // 0-6 (0=Not Started, 1-6=SRS Phases)
    xpValue?: number;           // Experience points value
    sourceFiles?: string[];     // Source files where this item appeared
    mergeSources?: string[];    // IDs of items merged into this one
  };
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
  version: number;              // Schema version (1 for unified schema)
}
```

### 4.2 Unified Vocabulary Collection Schema

```typescript
interface UnifiedVocabularyCollection {
  id: string;                     // UUID for the collection
  name: string;                   // Collection name
  description: string;            // Description
  languagePair: "de-bg" | "bg-de"; // Language direction
  difficultyRange: [number, number]; // Min/max difficulty (1-5)
  categories: VocabularyCategory[]; // All categories in collection
  itemCount: number;              // Total number of items
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  version: number;                // Schema version
  items: UnifiedVocabularyItem[]; // Array of vocabulary items
  statistics?: {                 // Collection statistics
    byPartOfSpeech: Record<string, number>;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  };
}
```

### 4.3 Enumerated Types

```typescript
type PartOfSpeech =
  | "noun"        // Noun (e.g., "Haus", "дом")
  | "verb"        // Verb (e.g., "gehen", "ходя")
  | "adjective"   // Adjective (e.g., "groß", "голям")
  | "adverb"      // Adverb (e.g., "schnell", "бързо")
  | "pronoun"     // Pronoun (e.g., "ich", "аз")
  | "preposition" // Preposition (e.g., "in", "в")
  | "conjunction" // Conjunction (e.g., "und", "и")
  | "interjection" // Interjection (e.g., "ah", "ах")
  | "article"     // Article (e.g., "der", "the")
  | "number"      // Number (e.g., "eins", "едно")
  | "phrase"      // Common phrase (e.g., "Wie geht's?", "Как си?")
  | "expression"; // Idiomatic expression

type VocabularyCategory =
  | "greetings"
  | "numbers"
  | "family"
  | "food"
  | "colors"
  | "animals"
  | "body"
  | "clothing"
  | "house"
  | "nature"
  | "transport"
  | "technology"
  | "time"
  | "weather"
  | "professions"
  | "places"
  | "grammar"
  | "culture"
  | "common_phrases"
  | "verbs"
  | "adjectives"
  | "adverbs"
  | "pronouns"
  | "prepositions"
  | "conjunctions"
  | "interjections"
  | "uncategorized";
```

---

## 5. Migration Strategy

### 5.1 Migration Process Overview

1. **Backup Current Data**: Create backup of all vocabulary files
2. **Schema Conversion**: Convert all legacy formats to unified schema
3. **Data Merging**: Merge items with the same meaning/content
4. **Deduplication**: Remove exact duplicates
5. **Category Standardization**: Map legacy categories to standardized ones
6. **Data Enrichment**: Add missing fields with default values
7. **Validation**: Validate the unified data structure
8. **Testing**: Test with sample queries and edge cases
9. **Deployment**: Replace current vocabulary.json with unified version

### 5.2 Field Migration Mapping

| Unified Field               | Source(s)                                                                 | Transformation Rules                                                                 |
|-----------------------------|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| id                          | legacy.id, current.id                                                    | Preserve legacy IDs; generate UUIDs for new items                                   |
| german                      | legacy.translation, current.german                                       | Use current.german if available, otherwise legacy.translation                       |
| bulgarian                   | legacy.word, current.bulgarian                                           | Use current.bulgarian if available, otherwise legacy.word                           |
| partOfSpeech                | current.partOfSpeech, tags, category                                     | Use current.partOfSpeech; infer from tags/category if missing                       |
| difficulty                  | current.difficulty, legacy.difficulty, legacy.level                     | Convert to 1-5 scale: A1=1, A2=2, B1=3, B2=4, C1=5                                  |
| categories                  | current.categories, legacy.category                                      | Convert single category to array; standardize category names                        |
| transliteration             | current.transliteration, pronunciation                                   | Split pronunciation into separate German/Bulgarian transliterations                |
| emoji                       | current.emoji                                                            | Preserve current emoji                                                              |
| audio                       | current.audio_url                                                        | Convert to structured format                                                        |
| grammar                     | current.grammar_details, legacy.notes                                   | Map current.grammar_details; extract grammar info from legacy.notes                |
| examples                    | current.metadata.examples, legacy.examples                              | Normalize example formats; merge similar examples                                  |
| notes                       | current.contextual_nuance, legacy.notes, legacy.notes_*, legacy.linguistic_note | Consolidate all notes into structured format                                        |
| etymology                   | current.metadata.etymology, legacy.etymology                             | Preserve most detailed etymology                                                    |
| culturalNotes               | current.metadata.culturalNote, legacy.cultural_note                     | Convert to array; preserve all cultural notes                                       |
| mnemonics                   | current.mnemonics                                                         | Preserve current mnemonics                                                          |
| synonyms                    | current.metadata.synonyms                                                | Preserve current synonyms                                                           |
| antonyms                    | current.metadata.antonyms                                                | Preserve current antonyms                                                           |
| relatedWords                | current.metadata.relatedWords                                           | Preserve current related words                                                      |
| metadata.frequency          | legacy.frequency                                                         | Preserve legacy frequency rating                                                    |
| metadata.level              | legacy.level                                                             | Preserve legacy level designation                                                   |
| metadata.isCommon           | -                                                                         | Default to false; set to true for high frequency items                              |
| metadata.isVerified         | -                                                                         | Default to false; set to true for current verified items                            |
| metadata.learningPhase      | current.learningPhase                                                    | Preserve current learning phase                                                     |
| metadata.xpValue            | current.xp_value                                                         | Preserve current XP value                                                           |
| metadata.sourceFiles        | File origin                                                              | Track which files each item came from                                               |
| createdAt                   | current.createdAt, file modification time                               | Use current.createdAt if available, otherwise file modification time                |
| updatedAt                   | current.updatedAt, file modification time                               | Use current.updatedAt if available, otherwise file modification time                |
| version                     | -                                                                         | Set to 1 for unified schema                                                         |

---

## 6. Deduplication Strategy

### 6.1 Deduplication Criteria

1. **Exact Match Deduplication**:
   - Same `german` AND same `bulgarian` content
   - Same `german` AND same `partOfSpeech` AND similar `bulgarian`
   - Same `bulgarian` AND same `partOfSpeech` AND similar `german`

2. **Content-Based Deduplication**:
   - Same meaning with different spellings (e.g., "Apfel" vs "der Apfel")
   - Same meaning with different word forms (e.g., "laufen" vs "gegangen")
   - Same meaning with different grammatical gender (e.g., "der/die/das")

3. **ID-Based Deduplication**:
   - Same ID across different files
   - Different IDs but same content (merge and preserve both IDs)

### 6.2 Merging Algorithm

```typescript
function mergeVocabularyItems(items: UnifiedVocabularyItem[]): UnifiedVocabularyItem {
  // 1. Select the item with the most complete data as the base
  const baseItem = selectMostCompleteItem(items);

  // 2. Create a new merged item
  const mergedItem: UnifiedVocabularyItem = {
    ...baseItem,
    id: generateMergedId(items), // Create a new ID that references all source IDs
    metadata: {
      ...baseItem.metadata,
      mergeSources: items.map(item => item.id), // Track all source IDs
      sourceFiles: [...new Set(items.flatMap(item => item.metadata?.sourceFiles || []))],
    },
    examples: mergeExamples(items),
    notes: mergeNotes(items),
    culturalNotes: mergeCulturalNotes(items),
    mnemonics: mergeMnemonics(items),
    updatedAt: new Date(),
  };

  // 3. Merge specific fields with quality preservation
  mergedItem.german = selectBestGerman(items);
  mergedItem.bulgarian = selectBestBulgarian(items);
  mergedItem.partOfSpeech = selectBestPartOfSpeech(items);
  mergedItem.difficulty = selectBestDifficulty(items);
  mergedItem.categories = mergeCategories(items);
  mergedItem.transliteration = mergeTransliterations(items);
  mergedItem.emoji = selectBestEmoji(items);
  mergedItem.audio = mergeAudio(items);
  mergedItem.grammar = mergeGrammar(items);
  mergedItem.etymology = selectBestEtymology(items);
  mergedItem.synonyms = mergeSynonyms(items);
  mergedItem.antonyms = mergeAntonyms(items);
  mergedItem.relatedWords = mergeRelatedWords(items);
  mergedItem.metadata = mergeMetadata(items);

  return mergedItem;
}
```

### 6.3 Quality Preservation Rules

1. **Field-Specific Quality Metrics**:
   - **Examples**: Prefer examples with context > examples without context
   - **Notes**: Prefer detailed notes > brief notes; prefer direction-specific notes
   - **Etymology**: Prefer detailed etymology > brief etymology
   - **Audio**: Prefer existing audio > no audio
   - **Emoji**: Prefer existing emoji > no emoji

2. **Source Priority**:
   - Current `vocabulary.json` > Legacy fixed files > Legacy batch files
   - Manually curated > Automatically generated
   - Verified > Unverified

3. **Temporal Priority**:
   - Newer timestamps > Older timestamps
   - More recent updates > Older updates

---

## 7. Category Standardization

### 7.1 Legacy to Standard Category Mapping

| Legacy Category       | Standard Category       | Notes                                                                 |
|-----------------------|-------------------------|-----------------------------------------------------------------------|
| Food                  | food                    |                                                                       |
| Household             | house                   |                                                                       |
| Verbs                 | verbs                   |                                                                       |
| Adjectives            | adjectives              |                                                                       |
| Greetings             | greetings               |                                                                       |
| Zahlen                | numbers                 | German for "numbers"                                                  |
| Familie               | family                  | German for "family"                                                   |
| Farben                | colors                  | German for "colors"                                                   |
| Begrüßung             | greetings               | German for "greeting"                                                 |
| Ausdruck              | common_phrases          | German for "expression"                                               |
| Substantiv            | uncategorized           | German for "noun" - too generic                                       |
| Verb                  | verbs                   |                                                                       |
| Tag                   | time                    | Days of week                                                          |
| Zeit                  | time                    | Time concepts                                                         |
| Lebensmittel          | food                    | German for "groceries"                                                |
| Transport             | transport               |                                                                       |
| Gesundheit            | body                    | Health-related                                                        |
| Natur                 | nature                  |                                                                       |
| Einkauf               | uncategorized           | Shopping - too specific                                               |
| Quantor               | grammar                 | Quantifiers                                                           |
| -                     | animals                 | Missing in legacy                                                     |
| -                     | clothing                | Missing in legacy                                                     |
| -                     | technology              | Missing in legacy                                                     |
| -                     | weather                 | Missing in legacy                                                     |
| -                     | professions             | Missing in legacy                                                     |
| -                     | places                  | Missing in legacy                                                     |
| -                     | culture                 | Missing in legacy                                                     |
| -                     | prepositions            | Missing in legacy                                                     |
| -                     | conjunctions            | Missing in legacy                                                     |
| -                     | interjections           | Missing in legacy                                                     |

### 7.2 Category Hierarchy

```
vocabulary/
├── greetings/
├── numbers/
├── family/
├── food/
│   ├── fruits/
│   ├── vegetables/
│   ├── meats/
│   ├── dairy/
│   └── beverages/
├── colors/
├── animals/
├── body/
│   ├── anatomy/
│   └── health/
├── clothing/
├── house/
│   ├── furniture/
│   ├── appliances/
│   └── rooms/
├── nature/
│   ├── weather/
│   ├── geography/
│   └── plants/
├── transport/
├── technology/
├── time/
│   ├── days/
│   ├── months/
│   └── time_expressions/
├── weather/
├── professions/
├── places/
├── grammar/
│   ├── verbs/
│   ├── nouns/
│   ├── adjectives/
│   ├── adverbs/
│   ├── pronouns/
│   ├── prepositions/
│   ├── conjunctions/
│   └── interjections/
├── culture/
├── common_phrases/
└── uncategorized/
```

---

## 8. Validation Rules

### 8.1 Structural Validation

1. **Required Fields**:
   - `id`, `german`, `bulgarian`, `partOfSpeech`, `difficulty`, `categories`
   - `createdAt`, `updatedAt`, `version`

2. **Field Type Validation**:
   - All fields must match their declared types
   - Enumerated fields must contain valid values
   - Arrays must not be empty (except optional arrays)

3. **Content Validation**:
   - `german` and `bulgarian` must not be empty strings
   - `difficulty` must be between 1-5
   - `categories` must contain at least one valid category
   - `partOfSpeech` must be a valid part of speech

### 8.2 Logical Validation

1. **Grammar Consistency**:
   - Nouns should have `grammar.gender` specified
   - Verbs should have `grammar.verbAspect` specified when applicable
   - Plural forms should be provided for nouns when applicable

2. **Example Validation**:
   - Examples should contain both German and Bulgarian text
   - Examples should be relevant to the vocabulary item

3. **Metadata Validation**:
   - `metadata.frequency` should be between 1-100 if provided
   - `metadata.level` should be a valid CEFR level if provided
   - `metadata.learningPhase` should be between 0-6 if provided

4. **Temporal Validation**:
   - `createdAt` should not be in the future
   - `updatedAt` should not be before `createdAt`

### 8.3 Cross-Item Validation

1. **ID Uniqueness**: All IDs must be unique across the collection
2. **Content Uniqueness**: No duplicate items with the same meaning
3. **Reference Integrity**: All `verbPartnerId` references must exist
4. **Category Consistency**: All categories must be standardized

---

## 9. Implementation Plan

### 9.1 Micro-Steps Implementation

1. **Schema Definition**:
   - Create TypeScript interfaces for unified schema
   - Create Zod validation schemas
   - Create migration utilities

2. **Data Conversion**:
   - Convert current `vocabulary.json` to unified format
   - Convert legacy batch files to unified format
   - Convert legacy color files to unified format
   - Convert legacy family files to unified format
   - Convert legacy fixed files to unified format

3. **Deduplication**:
   - Implement exact match deduplication
   - Implement content-based deduplication
   - Implement ID-based deduplication
   - Create merging algorithm

4. **Category Standardization**:
   - Map legacy categories to standard categories
   - Implement category hierarchy
   - Create category validation

5. **Data Enrichment**:
   - Add missing fields with default values
   - Infer part of speech from context
   - Generate transliterations
   - Add timestamps

6. **Validation**:
   - Implement structural validation
   - Implement logical validation
   - Implement cross-item validation
   - Create validation reports

7. **Testing**:
   - Test with sample queries
   - Test edge cases
   - Test performance
   - Create test reports

8. **Documentation**:
   - Update schema documentation
   - Create migration documentation
   - Update user documentation

9. **Deployment**:
   - Create backup of current data
   - Replace current vocabulary.json
   - Update code references
   - Monitor for issues

### 9.2 Timeline Estimate

| Phase                  | Estimated Time | Status       |
|------------------------|----------------|--------------|
| Schema Design          | 1-2 days        | In Progress  |
| Data Conversion        | 2-3 days        | Pending      |
| Deduplication          | 2 days          | Pending      |
| Category Standardization | 1 day         | Pending      |
| Data Enrichment        | 1 day           | Pending      |
| Validation             | 1-2 days        | Pending      |
| Testing                | 2 days          | Pending      |
| Documentation          | 1 day           | Pending      |
| Deployment             | 1 day           | Pending      |
| **Total**              | **11-14 days**  |              |

---