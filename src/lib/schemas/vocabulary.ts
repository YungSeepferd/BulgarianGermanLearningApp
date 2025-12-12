/**
 * Vocabulary Schema - Defines the structure and validation rules for vocabulary items
 * Used for runtime validation, type safety, and data integrity
 */

import { z } from 'zod';

// Base schema for vocabulary parts of speech
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
  'expression'   // Expression or idiom
]);

// Schema for vocabulary categories (used for grouping)
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
  'verbs',        // Verb-specific category
  'uncategorized' // Fallback for migration
]);

// Schema for vocabulary difficulty levels
export const DifficultyLevelSchema = z.enum([
  'beginner',    // A1 level
  'elementary',  // A2 level
  'intermediate', // B1 level
  'upper_intermediate', // B2 level
  'advanced'     // C1/C2 level
]);

// Schema for vocabulary metadata
export const VocabularyMetadataSchema = z.object({
  gender: z.enum(['masculine', 'feminine', 'neuter']).optional(), // For nouns
  article: z.enum(['der', 'die', 'das', 'ein', 'eine']).optional(),
  pluralForm: z.string().optional(), // Plural form for nouns
  conjugation: z.record(z.string(), z.string()).optional(), // Verb conjugations
  examples: z.array(z.object({
    german: z.string(),
    bulgarian: z.string(),
    context: z.string().optional()
  })).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  relatedWords: z.array(z.string()).optional(),
  notes: z.string().optional(),
  mnemonic: z.string().optional(),
  culturalNote: z.string().optional(),
  etymology: z.string().optional(),
  components: z.array(z.object({ part: z.string(), meaning: z.string(), note: z.string().optional() })).optional(),
  contextualNuance: z.string().optional(),
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

/**
 * Schema for legacy ID formats (numeric, string, UUID)
 * Supports: UUIDs, numeric IDs, string IDs, and auto-generation
 */
export const LegacyIdSchema = z.union([
  z.string().uuid(),
  z.string().min(1).max(100),
  z.number().positive()
]).transform((val) => {
  if (typeof val === 'number') return `legacy-${val}`;
  return val;
});

// Fallback category for migration
export const VocabularyCategorySchemaWithFallback = VocabularyCategorySchema.or(z.literal('uncategorized'));

// Main Vocabulary Item Schema with resilient validation
const BaseVocabularyItemSchema = z.object({
  id: LegacyIdSchema,
  german: z.string().min(1).max(100),
  bulgarian: z.string().min(1).max(100),
  partOfSpeech: PartOfSpeechSchema.default('noun'),
  difficulty: z.number().min(1).max(5).default(1).describe('1-5 scale where 1 is easiest'),
  categories: z.array(VocabularyCategorySchemaWithFallback).min(1).default(['uncategorized']),
  transliteration: z.string().optional(), // Latin characters for pronunciation
  emoji: z.string().optional(), // Visual representation
  literalBreakdown: z.array(z.object({ // For understanding compound words/grammar
    segment: z.string(),
    literal: z.string(),
    grammarTag: z.string()
  })).optional(),
  contextualNuance: z.string().optional(),
  metadata: VocabularyMetadataSchema.optional(),
  createdAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val)),
  updatedAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val)),
  isCommon: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  learningPhase: z.number().min(0).max(6).optional().default(0) // 0: Not Started, 1-6: SRS Phases
});

export type VocabularyItem = z.infer<typeof BaseVocabularyItemSchema>;

/**
 * Fallback vocabulary item for failed validations
 * Creates a valid item with fallback values when validation fails
 */
export const createFallbackItem = (input: unknown): VocabularyItem => {
  return {
    id: `fallback-${crypto.randomUUID()}`,
    german: typeof input === 'object' && input && 'german' in input && typeof input.german === 'string' ? input.german : 'unknown',
    bulgarian: typeof input === 'object' && input && 'bulgarian' in input && typeof input.bulgarian === 'string' ? input.bulgarian : 'unknown',
    partOfSpeech: 'noun',
    difficulty: 1,
    categories: ['uncategorized'],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    isCommon: false,
    isVerified: false,
    learningPhase: 0
  };
};

export const VocabularyItemSchema = BaseVocabularyItemSchema.catch((ctx) => {
  // Validation failed for item
  return createFallbackItem(ctx.input);
});

// Schema for vocabulary collections
export const VocabularyCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  items: z.array(VocabularyItemSchema),
  languagePair: z.enum(['de-bg', 'bg-de']),
  difficultyRange: z.tuple([z.number().min(1), z.number().max(5)]),
  categories: z.array(VocabularyCategorySchema),
  createdAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val)),
  updatedAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val))
});

// Schema for vocabulary search parameters
export const VocabularySearchParamsSchema = z.object({
  query: z.string().optional(),
  partOfSpeech: PartOfSpeechSchema.optional(),
  difficulty: z.number().min(1).max(5).optional(),
  categories: z.array(VocabularyCategorySchema).optional(),
  learningPhase: z.number().min(0).max(6).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['german', 'bulgarian', 'difficulty', 'createdAt']).default('german'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Schema for vocabulary progress tracking
export const VocabularyProgressSchema = z.object({
  userId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  learned: z.boolean().default(false),
  proficiency: z.number().min(0).max(100).default(0),
  lastReviewed: z.date().optional(),
  reviewCount: z.number().min(0).default(0),
  nextReviewDate: z.date().optional()
});

// PracticeSession type is defined in practiceSession.ts to avoid circular dependencies

// Type exports for TypeScript
export type PartOfSpeech = z.infer<typeof PartOfSpeechSchema>;
export type VocabularyCategory = z.infer<typeof VocabularyCategorySchema>;
// VocabularyItem is already exported above
export type VocabularyCollection = z.infer<typeof VocabularyCollectionSchema>;
export type VocabularySearchParams = z.infer<typeof VocabularySearchParamsSchema>;
export type VocabularyProgress = z.infer<typeof VocabularyProgressSchema>;
// PracticeSession type is exported from practiceSession.ts

// Utility functions
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