import type { VocabularyItem } from '$lib/types/vocabulary.js';
export declare class DataLoader {
    private static instance;
    private constructor();
    /**
     * Get the singleton instance of DataLoader
     */
    static getInstance(): DataLoader;
    /**
     * Get random vocabulary items
     * @param count Number of items to return
     * @returns Array of random vocabulary items
     */
    getRandomItems(count?: number): Promise<VocabularyItem[]>;
    /**
     * Get vocabulary by search parameters
     * @param params Search parameters
     * @returns Search results
     */
    getVocabularyBySearch(params: {
        query?: string;
        partOfSpeech?: string;
        difficulty?: number;
        categories?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{
        items: VocabularyItem[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get vocabulary by ID
     * @param id Vocabulary item ID
     * @returns Vocabulary item or null if not found
     */
    getVocabularyById(id: string): Promise<VocabularyItem | null>;
    /**
     * Get vocabulary by category
     * @param category Category name
     * @param options Options
     * @returns Array of vocabulary items
     */
    getVocabularyByCategory(category: string, options?: {
        limit?: number;
        difficulty?: number;
    }): Promise<VocabularyItem[]>;
    /**
     * Get vocabulary by difficulty level
     * @param difficulty Difficulty level
     * @param options Options
     * @returns Array of vocabulary items
     */
    getVocabularyByDifficulty(difficulty: number, options?: {
        limit?: number;
        category?: string;
    }): Promise<VocabularyItem[]>;
}
//# sourceMappingURL=DataLoader.svelte.d.ts.map