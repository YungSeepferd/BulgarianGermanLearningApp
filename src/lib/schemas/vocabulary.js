/**
 * Vocabulary Schema - Defines the structure and validation rules for vocabulary items
 * Used for runtime validation, type safety, and data integrity
 */
import { z } from 'zod';
// Base schema for vocabulary parts of speech
export const PartOfSpeechSchema = z.enum([
    'noun', // Noun (e.g., "Haus", "дом")
    'verb', // Verb (e.g., "gehen", "ходя")
    'adjective', // Adjective (e.g., "groß", "голям")
    'adverb', // Adverb (e.g., "schnell", "бързо")
    'pronoun', // Pronoun (e.g., "ich", "аз")
    'preposition', // Preposition (e.g., "in", "в")
    'conjunction', // Conjunction (e.g., "und", "и")
    'interjection', // Interjection (e.g., "ah", "ах")
    'article', // Article (e.g., "der", "the")
    'number', // Number (e.g., "eins", "едно")
    'phrase' // Common phrase (e.g., "Wie geht's?", "Как си?")
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
    'uncategorized' // Fallback for migration
]);
// Schema for vocabulary difficulty levels
export const DifficultyLevelSchema = z.enum([
    'beginner', // A1 level
    'elementary', // A2 level
    'intermediate', // B1 level
    'upper_intermediate', // B2 level
    'advanced' // C1/C2 level
]);
// Schema for vocabulary metadata
export const VocabularyMetadataSchema = z.object({
    gender: z.enum(['masculine', 'feminine', 'neuter']).optional(), // For nouns
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
    etymology: z.string().optional()
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
    if (typeof val === 'number')
        return `legacy-${val}`;
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
    literalBreakdown: z.array(z.object({
        segment: z.string(),
        literal: z.string(),
        grammarTag: z.string()
    })).optional(),
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
/**
 * Fallback vocabulary item for failed validations
 * Creates a valid item with fallback values when validation fails
 */
export const createFallbackItem = (input) => {
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
    // Safe error logging without circular reference issues
    const _safeInput = typeof ctx.input === 'object' && ctx.input
        ? { ...ctx.input, metadata: ctx.input.metadata ? '[metadata]' : undefined }
        : ctx.input;
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
// Schema for practice sessions
export const PracticeSessionSchema = z.object({
    id: z.string().uuid(),
    currentItemId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    score: z.number().min(0).max(100).default(0),
    itemsPracticed: z.number().min(0).default(0),
    correctAnswers: z.number().min(0).default(0),
    incorrectAnswers: z.number().min(0).default(0),
    sessionType: z.enum(['vocabulary', 'grammar', 'listening', 'speaking']),
    completed: z.boolean().default(false)
});
// Utility functions
export function getDifficultyLabel(difficulty) {
    const labels = {
        1: 'Beginner (A1)',
        2: 'Elementary (A2)',
        3: 'Intermediate (B1)',
        4: 'Upper Intermediate (B2)',
        5: 'Advanced (C1/C2)'
    };
    return labels[difficulty] || 'Unknown';
}
export function getPartOfSpeechLabel(partOfSpeech) {
    const labels = {
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
        phrase: 'Phrase'
    };
    return labels[partOfSpeech];
}
//# sourceMappingURL=vocabulary.js.map