/**
 * DataLoader Class - Singleton wrapper for the function-based vocabulary loader
 *
 * This class provides a singleton interface for the vocabulary data loading system,
 * maintaining backward compatibility with existing code while using the new function-based loader.
 */
import { getRandomVocabulary } from './loader';
import { Debug } from '../utils';
import type { UnifiedVocabularyItem, VocabularyCategory } from '../schemas/unified-vocabulary';

export class DataLoader {
    private static instance: DataLoader;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    /**
     * Get the singleton instance of DataLoader
     */
    public static getInstance(): DataLoader {
        if (!DataLoader.instance) {
            DataLoader.instance = new DataLoader();
        }
        return DataLoader.instance;
    }

    /**
     * Get random vocabulary items
     * @param count Number of items to return
     * @returns Array of random vocabulary items
     */
    public async getRandomItems(count: number = 5): Promise<UnifiedVocabularyItem[]> {
        try {
            // Use the getRandomVocabulary function from loader
            const items = await getRandomVocabulary(count);
            return items;
        } catch (_error) {
            // Failed to get random vocabulary items
            return [];
        }
    }

    /**
     * Get vocabulary by search parameters
     * @param params Search parameters
     * @returns Search results
     */
    public async getVocabularyBySearch(params: {
        query?: string;
        partOfSpeech?: string;
        difficulty?: number;
        categories?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{
        items: UnifiedVocabularyItem[];
        total: number;
        hasMore: boolean;
    }> {
        // Use the new search service
        const { searchVocabulary } = await import('../services/search');
        
        // Cast parameters to correct types (schema validation is done by searchVocabulary)
        return searchVocabulary({
            query: params.query,
            partOfSpeech: params.partOfSpeech as any,
            difficulty: params.difficulty,
            categories: params.categories as any,
            limit: params.limit || 20,
            offset: params.offset || 0,
            sortBy: 'german',
            sortOrder: 'asc'
        });
    }

    /**
     * Get vocabulary by ID
     * @param id Vocabulary item ID
     * @returns Vocabulary item or null if not found
     */
    public async getVocabularyById(id: string): Promise<UnifiedVocabularyItem | null> {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyById } = await import('./loader');
        return loadVocabularyById(id);
    }

    /**
     * Get vocabulary by category
     * @param category Category name
     * @param options Options
     * @returns Array of vocabulary items
     */
    public async getVocabularyByCategory(category: string, options: { limit?: number; difficulty?: number } = {}): Promise<UnifiedVocabularyItem[]> {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyByCategory } = await import('./loader');
        return loadVocabularyByCategory(category as VocabularyCategory, options);
    }

    /**
     * Get vocabulary by difficulty level
     * @param difficulty Difficulty level
     * @param options Options
     * @returns Array of vocabulary items
     */
    public async getVocabularyByDifficulty(difficulty: number, options: { limit?: number; category?: string } = {}): Promise<UnifiedVocabularyItem[]> {
        try {
            Debug.log('DataLoader', 'Getting vocabulary by difficulty', { difficulty, options });
            // Import the function here to avoid circular dependencies
            const { loadVocabularyByDifficulty } = await import('./loader');
            const items = await loadVocabularyByDifficulty(difficulty, options);
            Debug.log('DataLoader', 'Retrieved vocabulary by difficulty', { difficulty, count: items.length });
            return items;
        } catch (error) {
            Debug.error('DataLoader', 'Failed to get vocabulary by difficulty', error as Error);
            return [];
        }
    }
}