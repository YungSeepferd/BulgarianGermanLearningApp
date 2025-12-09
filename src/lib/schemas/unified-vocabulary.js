/**
 * Unified Vocabulary Schema
 *
 * This schema extends the base VocabularyItemSchema to create a comprehensive,
 * unified structure that accommodates data from all vocabulary sources,
 * including the detailed fields from the `data/vocab/*.json` files.
 *
 * The goal is to create a single, consistent schema that preserves all
 * valuable metadata during the unification and migration process.
 */
import { z } from 'zod';
import { VocabularyItemSchema, PartOfSpeechSchema, DifficultyLevelSchema, VocabularyCategorySchema } from './vocabulary';
// Extend the base schema to include all fields from the data/vocab files
export const UnifiedVocabularyItemSchema = VocabularyItemSchema.extend({
    // Add new fields to preserve all metadata
    word: z.string().optional(),
    translation: z.string().optional(),
    source_lang: z.string().optional(),
    target_lang: z.string().optional(),
    level: DifficultyLevelSchema.optional(),
    frequency: z.number().optional(),
    // Detailed notes fields
    notes_bg_to_de: z.string().optional(),
    notes_de_to_bg: z.string().optional(),
    linguistic_note: z.string().optional(),
    linguistic_note_bg_to_de: z.string().optional(),
    linguistic_note_de_to_bg: z.string().optional(),
    // Add all legacy fields to ensure no data is lost during migration
    legacy_id: z.string().optional(),
    legacy_notes: z.string().optional(),
    // Ensure all examples and metadata are preserved
    examples: z.array(z.object({
        sentence: z.string().optional(),
        translation: z.string().optional(),
        context: z.string().optional(),
        german: z.string().optional(),
        bulgarian: z.string().optional(),
    })).optional(),
});
// Create a new collection schema for the unified vocabulary
export const UnifiedVocabularyCollectionSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    items: z.array(UnifiedVocabularyItemSchema),
    languagePair: z.enum(['de-bg', 'bg-de']),
    createdAt: z.date(),
    updatedAt: z.date(),
});
//# sourceMappingURL=unified-vocabulary.js.map