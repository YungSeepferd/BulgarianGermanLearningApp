/**
 * Vocabulary Data Loader
 *
 * Handles loading, caching, and validation of vocabulary data
 * Supports both server-side and client-side loading patterns
 */
import { VocabularyItemSchema, VocabularyCollectionSchema } from '../schemas/vocabulary';
import { z } from 'zod';
/**
 * Load vocabulary data from various sources with fallback mechanism
 */
export declare function loadVocabulary(): Promise<z.infer<typeof VocabularyCollectionSchema>>;
/**
 * Cache vocabulary data in localStorage
 */
export declare function cacheVocabulary(data: z.infer<typeof VocabularyCollectionSchema>): void;
/**
 * Load vocabulary by search parameters
 */
export declare function loadVocabularyBySearch(params: Partial<{
    query: string;
    partOfSpeech: string;
    difficulty: number;
    categories: string[];
    limit: number;
    offset: number;
}>): Promise<{
    items: z.infer<typeof VocabularyItemSchema>[];
    total: number;
    hasMore: boolean;
}>;
/**
 * Load vocabulary by ID
 */
export declare function loadVocabularyById(id: string): Promise<z.infer<typeof VocabularyItemSchema> | null>;
/**
 * Load vocabulary by category
 */
export declare function loadVocabularyByCategory(category: string, options?: {
    limit?: number;
    difficulty?: number;
}): Promise<z.infer<typeof VocabularyItemSchema>[]>;
/**
 * Load vocabulary by difficulty level
 */
export declare function loadVocabularyByDifficulty(difficulty: number, options?: {
    limit?: number;
    category?: string;
}): Promise<z.infer<typeof VocabularyItemSchema>[]>;
/**
 * Get random vocabulary items
 */
export declare function getRandomVocabulary(count?: number, options?: {
    difficulty?: number;
    category?: string;
}): Promise<z.infer<typeof VocabularyItemSchema>[]>;
/**
 * Initialize vocabulary data (should be called during app startup)
 */
export declare function initializeVocabulary(): Promise<void>;
//# sourceMappingURL=loader.d.ts.map