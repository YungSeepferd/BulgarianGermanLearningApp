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
  'body',
  'clothing',
  'house',
  'nature',
  'transport',
  'technology',
  'time',
  'weather',
  'professions',
  'places',
  'grammar',
  'culture',
  'common_phrases',
  'verbs',
  'adjectives',
  'adverbs',
  'pronouns',
  'prepositions',
  'conjunctions',
  'interjections',
  'uncategorized'
]);

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

/**
 * Verb aspects
 */
export const VerbAspectSchema = z.enum([
  'perfective',    // Completed action
  'imperfective',  // Ongoing or habitual action
  null             // Not applicable
]);

/**
 * Noun genders
 */
export const NounGenderSchema = z.enum([
  'masculine',
  'feminine',
  'neuter'
]);

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
  sourceFiles: z.array(z.string()).optional().describe('Source files where this item appeared'),
  mergeSources: z.array(z.string()).optional().describe('IDs of items merged into this one'),
  createdBy: z.string().optional().describe('Creator of the item'),
  lastUpdatedBy: z.string().optional().describe('Last person to update the item')
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
  categories: z.array(VocabularyCategorySchema).min(1).describe('Categories the item belongs to'),
  transliteration: TransliterationSchema.optional().describe('Pronunciation guides in Latin script'),
  emoji: z.string().emoji().optional().describe('Emoji representation of the word'),
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
  metadata: VocabularyMetadataSchema.optional().describe('Additional metadata'),
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