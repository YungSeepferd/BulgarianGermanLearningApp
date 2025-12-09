/**
 * DataLoader Class - Singleton wrapper for the function-based vocabulary loader
 *
 * This class provides a singleton interface for the vocabulary data loading system,
 * maintaining backward compatibility with existing code while using the new function-based loader.
 */
import { loadVocabulary, getRandomVocabulary } from './loader.js';
export class DataLoader {
    constructor() {
        // Private constructor to enforce singleton pattern
    }
    /**
     * Get the singleton instance of DataLoader
     */
    static getInstance() {
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
    async getRandomItems(count = 5) {
        try {
            const _vocabulary = await loadVocabulary();
            // Use the getRandomVocabulary function from loader
            const items = await getRandomVocabulary(count);
            return items;
        }
        catch (_error) {
            // Failed to get random vocabulary items
            return [];
        }
    }
    /**
     * Get vocabulary by search parameters
     * @param params Search parameters
     * @returns Search results
     */
    async getVocabularyBySearch(params) {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyBySearch } = await import('./loader.js');
        return loadVocabularyBySearch(params);
    }
    /**
     * Get vocabulary by ID
     * @param id Vocabulary item ID
     * @returns Vocabulary item or null if not found
     */
    async getVocabularyById(id) {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyById } = await import('./loader.js');
        return loadVocabularyById(id);
    }
    /**
     * Get vocabulary by category
     * @param category Category name
     * @param options Options
     * @returns Array of vocabulary items
     */
    async getVocabularyByCategory(category, options = {}) {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyByCategory } = await import('./loader.js');
        return loadVocabularyByCategory(category, options);
    }
    /**
     * Get vocabulary by difficulty level
     * @param difficulty Difficulty level
     * @param options Options
     * @returns Array of vocabulary items
     */
    async getVocabularyByDifficulty(difficulty, options = {}) {
        // Import the function here to avoid circular dependencies
        const { loadVocabularyByDifficulty } = await import('./loader.js');
        return loadVocabularyByDifficulty(difficulty, options);
    }
}
//# sourceMappingURL=DataLoader.svelte.js.map