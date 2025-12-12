/**
 * Unified Vocabulary Schema - Comprehensive schema for German-Bulgarian vocabulary
 * with support for all legacy data formats and enhanced metadata
 */

import { z } from 'zod';

// ======================
// Enumerated Types
// ======================

/**
 * Parts of speech for vocabulary items
 */
export const PartOfSpeechSchema = z.enum([
  'noun',        // Noun (e.g., "Haus", "дом")
  'verb',        // Verb (e.g., "gehen", "ходя")
  'adjective',   // Adjective (e.g., "groß", "голям")
  'adverb',      // Adverb (e.g., "schnell", "бързо")
  'pronoun',     // Pronoun (e.g., "ich", "аз")
  'preposition', // Preposition (e.g., "in", "в")
  'conjunction', // Conjunction (e.g., "und", "и")
  'interjection', // Interjection (e.g., "ah", "ах")
  'article',     // Article (e.g., "der", "the")
  'number',      // Number (e.g., "eins", "едно")
  'phrase',      // Common phrase (e.g., "Wie geht's?", "Как си?")
  'expression'   // Idiomatic expression
]);

export type PartOfSpeech = z.infer<typeof PartOfSpeechSchema>;

/**
 * Standardized vocabulary categories
 */
export const VocabularyCategorySchema = z.enum([
  'greetings',
  'numbers',
  'family',
  'food',
  'colors',
  'animals',
  'body-parts',
  'clothing',
  'home',
  'nature',
  'transport',
  'technology',
  'time',
  'weather',
  'professions',
  'places',
  'grammar',
  'culture',
  'everyday-phrases'
]);

export type VocabularyCategory = z.infer<typeof VocabularyCategorySchema>;

/**
 * CEFR language levels
 */
export const LanguageLevelSchema = z.enum([
  'A1',  // Beginner
  'A2',  // Elementary
  'B1',  // Intermediate
  'B2',  // Upper Intermediate
  'C1'   // Advanced
]);

export type LanguageLevel = z.infer<typeof LanguageLevelSchema>;

/**
 * Verb aspects
 */
export const VerbAspectSchema = z.union([
  z.literal('perfective'),    // Completed action
  z.literal('imperfective'),  // Ongoing or habitual action
  z.literal(null)             // Not applicable
]);

export type VerbAspect = z.infer<typeof VerbAspectSchema>;

/**
 * Noun genders
 */
export const NounGenderSchema = z.enum([
  'masculine',
  'feminine',
  'neuter'
]);

export type NounGender = z.infer<typeof NounGenderSchema>;

// ======================
// Complex Types
// ======================

/**
 * Transliteration schema for pronunciation guides
 */
export const TransliterationSchema = z.object({
  german: z.string().optional().describe('Latin transcription for German pronunciation'),
  bulgarian: z.string().optional().describe('Latin transcription for Bulgarian pronunciation')
});

/**
 * Audio resources schema
 */
export const AudioSchema = z.object({
  german: z.string().url().optional().describe('URL for German pronunciation audio'),
  bulgarian: z.string().url().optional().describe('URL for Bulgarian pronunciation audio')
});

/**
 * Grammar details schema
 */
export const GrammarSchema = z.object({
  gender: NounGenderSchema.optional().describe('Noun gender (masculine, feminine, neuter)'),
  pluralForm: z.string().optional().describe('Plural form of the word'),
  verbAspect: VerbAspectSchema.optional().describe('Verb aspect (perfective/imperfective)'),
  verbPartnerId: z.string().optional().describe('ID of the aspectual partner verb'),
  conjugation: z.record(z.string(), z.string()).optional().describe('Verb conjugations by person/tense')
});

/**
 * Enrichment metadata from external dictionary sources (e.g., Langenscheidt)
 */
export const EnrichmentSchema = z.object({
  enriched: z.boolean().optional().describe('Indicates item has been enriched'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score for enrichment match'),
  sourceURL: z.string().url().optional().describe('Primary dictionary URL for the enrichment'),
  enrichedAt: z.string().datetime().optional().describe('ISO timestamp of enrichment run'),
  source: z.string().optional().describe('Source label for enrichment run')
}).partial();

/**
 * External dictionary definition links (deduplicated by URL)
 */
export const DefinitionLinkSchema = z.object({
  source: z.string().optional().describe('Dictionary source identifier (e.g., langenscheidt, duden)'),
  url: z.string().url().describe('Absolute URL to external definition'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score for this link'),
  language: z.string().optional().describe('Language pair or locale for the definition')
});

/**
 * Example schema
 */
export const ExampleSchema = z.object({
  german: z.string().describe('German example sentence'),
  bulgarian: z.string().describe('Bulgarian example sentence'),
  context: z.string().optional().describe('Context description for the example'),
  source: z.enum(['current', 'legacy', 'merged', 'generated']).default('merged').describe('Source of the example')
});

/**
 * Notes schema with direction-specific content
 */
export const NotesSchema = z.object({
  general: z.string().optional().describe('General notes about the word/phrase'),
  forBulgarianSpeakers: z.string().optional().describe('Notes for Bulgarian speakers learning German'),
  forGermanSpeakers: z.string().optional().describe('Notes for German speakers learning Bulgarian'),
  linguistic: z.string().optional().describe('Linguistic observations'),
  linguisticForBulgarians: z.string().optional().describe('Linguistic notes for Bulgarian speakers'),
  linguisticForGermans: z.string().optional().describe('Linguistic notes for German speakers'),
  source: z.enum(['current', 'legacy', 'merged', 'generated']).default('merged').describe('Source of the notes')
});

/**
 * Metadata schema for additional information
 */
export const VocabularyMetadataSchema = z.object({
  frequency: z.number().min(1).max(100).optional().describe('Frequency rating (1-100)'),
  level: LanguageLevelSchema.optional().describe('CEFR language level (A1, A2, B1, B2, C1)'),
  isCommon: z.boolean().default(false).describe('Whether the word is common'),
  isVerified: z.boolean().default(false).describe('Whether the item has been verified'),
  learningPhase: z.number().min(0).max(6).optional().describe('SRS learning phase (0-6)'),
  xpValue: z.number().min(1).max(100).optional().describe('Experience points value'),
  components: z.array(z.object({
    part: z.string(),
    meaning: z.string()
  })).optional().describe('Word components for compound words'),
  notes: z.string().optional().describe('General notes about the item'),
  mnemonic: z.string().optional().describe('Memory aid or mnemonic device'),
  etymology: z.string().optional().describe('Word origin and etymology'),
  culturalNote: z.string().optional().describe('Cultural context or usage notes'),
  sourceFiles: z.array(z.string()).optional().describe('Source files where this item appeared'),
  mergeSources: z.array(z.string()).optional().describe('IDs of items merged into this one'),
  createdBy: z.string().optional().describe('Creator of the item'),
  lastUpdatedBy: z.string().optional().describe('Last person to update the item'),
  declension: z.record(
    z.string(), // case name (e.g., 'Nominative', 'Accusative')
    z.object({
      singular: z.string().optional(),
      plural: z.string().optional()
    })
  ).optional().describe('Declension table for nouns: case -> {singular, plural}'),
  links: z.array(z.object({
    label: z.string().describe('Link label (e.g., "DWDS", "Duden")'),
    url: z.string().url().describe('Absolute URL to external dictionary')
  })).optional().describe('External dictionary links')
});

// ======================
// Main Schema
// ======================

/**
 * Unified Vocabulary Item Schema
 */
export const UnifiedVocabularyItemSchema = z.object({
  id: z.string().describe('Unique identifier for the vocabulary item'),
  german: z.string().min(1).max(200).describe('German word or phrase'),
  bulgarian: z.string().min(1).max(200).describe('Bulgarian word or phrase'),
  partOfSpeech: PartOfSpeechSchema.describe('Part of speech classification'),
  difficulty: z.number().min(1).max(5).describe('Difficulty level (1-5, 1=easiest)'),
  cefrLevel: LanguageLevelSchema.optional().describe('CEFR proficiency level (A1/A2/B1/B2/C1)'),
  categories: z.array(VocabularyCategorySchema).min(1).describe('Categories the item belongs to'),
  transliteration: TransliterationSchema.optional().describe('Pronunciation guides in Latin script'),
  emoji: z.string().emoji().optional().describe('Emoji representation of the word'),
  literalBreakdown: z.array(z.object({
    segment: z.string(),
    literal: z.string(),
    grammarTag: z.string()
  })).optional().describe('Breakdown of compound words/grammar for learning'),
  audio: AudioSchema.optional().describe('Audio resources for pronunciation'),
  grammar: GrammarSchema.optional().describe('Grammar details and properties'),
  examples: z.array(ExampleSchema).default([]).describe('Usage examples'),
  notes: NotesSchema.optional().describe('Comprehensive notes about the item'),
  etymology: z.string().optional().describe('Word origin and etymology'),
  culturalNotes: z.array(z.string()).optional().describe('Cultural context notes'),
  mnemonics: z.array(z.string()).optional().describe('Memory aids and techniques'),
  synonyms: z.array(z.string()).optional().describe('Synonyms for this word/phrase'),
  antonyms: z.array(z.string()).optional().describe('Antonyms for this word/phrase'),
  relatedWords: z.array(z.string()).optional().describe('Related words or phrases'),
  type: z.enum(['word', 'rule', 'phrase']).optional().default('word').describe('Type of vocabulary entry'),
  tags: z.array(z.string()).optional().describe('Custom tags for filtering and organization'),
  level: LanguageLevelSchema.optional().describe('CEFR language level (direct accessor, mirrors cefrLevel)'),
  xp_value: z.number().min(1).max(100).optional().describe('Experience points value (direct accessor, mirrors metadata.xpValue)'),
  global_stats: z.object({
    correct_count: z.number().min(0).default(0),
    incorrect_count: z.number().min(0).default(0),
    success_rate: z.number().min(0).max(100).default(0)
  }).optional().describe('Global practice statistics for this item'),
  metadata: VocabularyMetadataSchema.optional().describe('Additional metadata'),
  enrichment: EnrichmentSchema.optional().describe('External enrichment metadata'),
  definitions: z.array(DefinitionLinkSchema).optional().describe('Links to external dictionary definitions'),
  createdAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).describe('Creation timestamp'),
  updatedAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).describe('Last update timestamp'),
  version: z.number().default(1).describe('Schema version number')
});

/**
 * Unified Vocabulary Collection Schema
 */
export const UnifiedVocabularyCollectionSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the collection'),
  name: z.string().min(3).max(100).describe('Name of the vocabulary collection'),
  description: z.string().min(10).max(1000).describe('Description of the collection'),
  languagePair: z.enum(['de-bg', 'bg-de']).describe('Language direction'),
  difficultyRange: z.tuple([z.number().min(1), z.number().max(5)]).describe('Min and max difficulty levels'),
  categories: z.array(VocabularyCategorySchema).describe('All categories in the collection'),
  itemCount: z.number().min(0).describe('Total number of items in the collection'),
  createdAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).describe('Creation timestamp'),
  updatedAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).describe('Last update timestamp'),
  version: z.number().default(1).describe('Schema version number'),
  items: z.array(UnifiedVocabularyItemSchema).describe('Array of vocabulary items'),
  statistics: z.object({
    byPartOfSpeech: z.record(z.string(), z.number()).optional().describe('Count by part of speech'),
    byDifficulty: z.record(z.string(), z.number()).optional().describe('Count by difficulty level'),
    byCategory: z.record(z.string(), z.number()).optional().describe('Count by category'),
    byLevel: z.record(z.string(), z.number()).optional().describe('Count by CEFR level')
  }).optional().describe('Collection statistics')
});

// ======================
// Utility Functions
// ======================

/**
 * Create a fallback unified vocabulary item when validation fails
 */
export const _createFallbackUnifiedItem = (input: unknown): z.infer<typeof UnifiedVocabularyItemSchema> => {
  const now = new Date();

  return {
    id: `fallback-${crypto.randomUUID()}`,
    german: typeof input === 'object' && input && 'german' in input && typeof input.german === 'string'
      ? input.german
      : 'unknown',
    bulgarian: typeof input === 'object' && input && 'bulgarian' in input && typeof input.bulgarian === 'string'
      ? input.bulgarian
      : 'unknown',
    partOfSpeech: 'noun',
    difficulty: 1,
    categories: ['greetings'],
    examples: [],
    createdAt: now,
    updatedAt: now,
    version: 1
  };
};

/**
 * Resilient schema with fallback for failed validations
 */
export const ResilientUnifiedVocabularyItemSchema = UnifiedVocabularyItemSchema.catch((ctx) => {
  // Validation failed for unified vocabulary item
  return _createFallbackUnifiedItem(ctx.input);
});

/**
 * Resilient collection schema with fallback items
 */
export const ResilientUnifiedVocabularyCollectionSchema = UnifiedVocabularyCollectionSchema.extend({
  items: z.array(ResilientUnifiedVocabularyItemSchema)
});

// ======================
// Type Exports
// ======================

export type UnifiedVocabularyItem = z.infer<typeof UnifiedVocabularyItemSchema>;
export type UnifiedVocabularyCollection = z.infer<typeof UnifiedVocabularyCollectionSchema>;
export type Transliteration = z.infer<typeof TransliterationSchema>;
export type Audio = z.infer<typeof AudioSchema>;
export type Grammar = z.infer<typeof GrammarSchema>;
export type Example = z.infer<typeof ExampleSchema>;
export type Notes = z.infer<typeof NotesSchema>;
export type VocabularyMetadata = z.infer<typeof VocabularyMetadataSchema>;

// ======================
// Helper Functions
// ======================

/**
 * Get difficulty label from numeric value
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels = {
    1: 'Beginner (A1)',
    2: 'Elementary (A2)',
    3: 'Intermediate (B1)',
    4: 'Upper Intermediate (B2)',
    5: 'Advanced (C1/C2)'
  };
  return labels[difficulty as keyof typeof labels] || 'Unknown';
}

/**
 * Get part of speech label
 */
export function _getPartOfSpeechLabel(partOfSpeech: PartOfSpeech): string {
  const labels: Record<PartOfSpeech, string> = {
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    pronoun: 'Pronoun',
    preposition: 'Preposition',
    conjunction: 'Conjunction',
    interjection: 'Interjection',
    article: 'Article',
    number: 'Number',
    phrase: 'Phrase',
    expression: 'Expression'
  };
  return labels[partOfSpeech];
}

/**
 * Get category label
 */
export function _getCategoryLabel(category: VocabularyCategory): string {
  const labels: Record<VocabularyCategory, string> = {
    greetings: 'Greetings',
    numbers: 'Numbers',
    family: 'Family',
    food: 'Food',
    colors: 'Colors',
    animals: 'Animals',
    'body-parts': 'Body Parts',
    clothing: 'Clothing',
    home: 'Home',
    nature: 'Nature',
    transport: 'Transport',
    technology: 'Technology',
    time: 'Time',
    weather: 'Weather',
    professions: 'Professions',
    places: 'Places',
    grammar: 'Grammar',
    culture: 'Culture',
    'everyday-phrases': 'Everyday Phrases',
    'everyday-phrases': 'Everyday Phrases'
  };
  return labels[category];
}

/**
 * Convert legacy difficulty to unified scale
 */
export function convertLegacyDifficulty(legacyDifficulty: number | string): number {
  if (typeof legacyDifficulty === 'number') {
    // Legacy 1-5 scale (1=easiest)
    return Math.min(Math.max(legacyDifficulty, 1), 5);
  }

  // Legacy string scale (A1, A2, etc.)
  const levelMap: Record<string, number> = {
    'A1': 1,
    'A2': 2,
    'B1': 3,
    'B2': 4,
    'C1': 5
  };

  return levelMap[legacyDifficulty.toUpperCase()] || 1;
}

/**
 * Convert legacy category to standardized category
 */
export function convertLegacyCategory(legacyCategory: string): VocabularyCategory {
  const categoryMap: Record<string, VocabularyCategory> = {
    // English categories
    'Food': 'food',
    'Household': 'home',
    'Verbs': 'grammar',
    'Adjectives': 'grammar',
    'Greetings': 'greetings',
    'Body': 'body-parts',

    // German categories
    'Zahlen': 'numbers',
    'Familie': 'family',
    'Farben': 'colors',
    'Begrüßung': 'greetings',
    'Ausdruck': 'everyday-phrases',
    'Lebensmittel': 'food',
    'Transport': 'transport',
    'Gesundheit': 'body-parts',
    'Natur': 'nature',
    'Einkauf': 'places',
    'Tag': 'time',
    'Zeit': 'time',

    // Bulgarian categories
    'Храна': 'food',
    'Дом': 'home',
    'Глаголи': 'grammar',
    'Прилагателни': 'grammar',
    'Поздрави': 'greetings'
  };

  return categoryMap[legacyCategory] || 'greetings';
}

/**
 * Type guards for different example formats
 */
function isLegacyExampleFormat1(example: object): example is { sentence: unknown, translation: unknown, context?: unknown } {
  return 'sentence' in example && 'translation' in example;
}

function isLegacyExampleFormat2(example: object): example is { bg: unknown, de: unknown, context?: unknown } {
  return 'bg' in example && 'de' in example;
}

function isCurrentExampleFormat(example: object): example is { german: unknown, bulgarian: unknown, context?: unknown } {
  return 'german' in example && 'bulgarian' in example;
}

/**
 * Normalize example format from legacy to unified
 */
export function normalizeExample(example: unknown): Example {
  if (typeof example === 'object' && example) {
    // Legacy format 1: { sentence: string, translation: string, context?: string }
    if (isLegacyExampleFormat1(example)) {
      return {
        german: typeof example.translation === 'string' ? example.translation : 'Beispiel',
        bulgarian: typeof example.sentence === 'string' ? example.sentence : 'пример',
        context: typeof example.context === 'string' ? example.context : undefined,
        source: 'legacy'
      };
    }
    // Legacy format 2: { bg: string, de: string, context?: string }
    else if (isLegacyExampleFormat2(example)) {
      return {
        german: typeof example.de === 'string' ? example.de : 'Beispiel',
        bulgarian: typeof example.bg === 'string' ? example.bg : 'пример',
        context: typeof example.context === 'string' ? example.context : undefined,
        source: 'legacy'
      };
    }
    // Current format: { german: string, bulgarian: string, context?: string }
    else if (isCurrentExampleFormat(example)) {
      return {
        german: typeof example.german === 'string' ? example.german : 'Beispiel',
        bulgarian: typeof example.bulgarian === 'string' ? example.bulgarian : 'пример',
        context: typeof example.context === 'string' ? example.context : undefined,
        source: 'current'
      };
    }
  }

  // Fallback for invalid examples
  return {
    german: 'Beispiel',
    bulgarian: 'пример',
    source: 'generated'
  };
}

/**
 * Merge multiple examples arrays
 */
export function mergeExamples(exampleArrays: Example[][]): Example[] {
  const merged = exampleArrays.flat();

  // Deduplicate examples
  const uniqueExamples = new Map<string, Example>();
  merged.forEach(example => {
    const key = `${example.german}|${example.bulgarian}|${example.context || ''}`;
    if (!uniqueExamples.has(key)) {
      uniqueExamples.set(key, example);
    }
  });

  return Array.from(uniqueExamples.values());
}

/**
 * Create a merged ID from multiple source IDs
 */
export function createMergedId(ids: string[]): string {
  if (ids.length === 0) return `fallback-${crypto.randomUUID()}`;
  if (ids.length === 1) return ids[0] ?? `fallback-${crypto.randomUUID()}`;

  // For multiple IDs, create a composite ID
  return `merged-${ids.join('-')}`;
}
