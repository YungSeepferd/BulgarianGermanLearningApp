/**
 * Vocabulary Service
 *
 * Provides centralized access to vocabulary data with caching and search capabilities
 */
import { VocabularyItemSchema, VocabularySearchParamsSchema } from '../schemas/vocabulary';
import { z } from 'zod';
export declare class VocabularyService {
    private static instance;
    private vocabularyCollection;
    private isInitialized;
    private constructor();
    /**
     * Get the singleton instance of VocabularyService
     */
    static getInstance(): Promise<VocabularyService>;
    /**
     * Initialize the service by loading vocabulary data
     */
    private initialize;
    /**
     * Get all vocabulary items
     */
    getAllVocabulary(): Promise<z.infer<typeof VocabularyItemSchema>[]>;
    /**
     * Get vocabulary item by ID
     */
    getVocabularyById(id: string): Promise<z.infer<typeof VocabularyItemSchema> | null>;
    /**
     * Search vocabulary with various filters
     */
    searchVocabulary(params: z.infer<typeof VocabularySearchParamsSchema>): Promise<{
        items: z.infer<typeof VocabularyItemSchema>[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get vocabulary by category
     */
    getVocabularyByCategory(category: string, options?: {
        limit?: number;
        difficulty?: number;
    }): Promise<z.infer<typeof VocabularyItemSchema>[]>;
    /**
     * Get vocabulary by difficulty level
     */
    getVocabularyByDifficulty(difficulty: number, options?: {
        limit?: number;
        category?: string;
    }): Promise<z.infer<typeof VocabularyItemSchema>[]>;
    /**
     * Get random vocabulary items
     */
    getRandomVocabulary(count?: number, options?: {
        difficulty?: number;
        category?: string;
    }): Promise<z.infer<typeof VocabularyItemSchema>[]>;
    /**
     * Get vocabulary items by multiple IDs
     */
    getVocabularyByIds(ids: string[]): Promise<z.infer<typeof VocabularyItemSchema>[]>;
    /**
     * Get all categories
     */
    getAllCategories(): Promise<string[]>;
    /**
     * Get vocabulary statistics
     */
    getVocabularyStats(): Promise<{
        totalItems: number;
        byPartOfSpeech: Record<string, number>;
        byDifficulty: Record<string, number>;
        byCategory: Record<string, number>;
    }>;
    /**
     * Refresh vocabulary data from source
     */
    refreshVocabulary(): Promise<void>;
    /**
     * Get vocabulary collection metadata
     */
    getCollectionMetadata(): Promise<{
        id: string;
        name: string;
        description: string;
        languagePair: string;
        difficultyRange: [number, number];
        categories: string[];
        itemCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const vocabularyService: Promise<VocabularyService>;
//# sourceMappingURL=vocabulary.d.ts.map