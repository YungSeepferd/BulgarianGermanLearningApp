/**
 * Vocabulary Service
 *
 * Provides centralized access to vocabulary data with caching and search capabilities
 */
import { VocabularyItemSchema, VocabularyCollectionSchema, VocabularySearchParamsSchema } from '../schemas/vocabulary';
import { loadVocabulary, loadVocabularyBySearch, loadVocabularyById, loadVocabularyByCategory, loadVocabularyByDifficulty, getRandomVocabulary, cacheVocabulary } from './loader';
import { z } from 'zod';
export class VocabularyService {
    // Private constructor to prevent direct instantiation
    constructor() {
        this.vocabularyCollection = null;
        this.isInitialized = false;
        // Private constructor for singleton pattern
    }
    /**
     * Get the singleton instance of VocabularyService
     */
    static async getInstance() {
        if (!VocabularyService.instance) {
            VocabularyService.instance = new VocabularyService();
            await VocabularyService.instance.initialize();
        }
        return VocabularyService.instance;
    }
    /**
     * Initialize the service by loading vocabulary data
     */
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            this.vocabularyCollection = await loadVocabulary();
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Failed to initialize VocabularyService:', error);
            throw error;
        }
    }
    /**
     * Get all vocabulary items
     */
    async getAllVocabulary() {
        if (!this.vocabularyCollection) {
            await this.initialize();
        }
        return this.vocabularyCollection?.items || [];
    }
    /**
     * Get vocabulary item by ID
     */
    async getVocabularyById(id) {
        return loadVocabularyById(id);
    }
    /**
     * Search vocabulary with various filters
     */
    async searchVocabulary(params) {
        return loadVocabularyBySearch(params);
    }
    /**
     * Get vocabulary by category
     */
    async getVocabularyByCategory(category, options = {}) {
        return loadVocabularyByCategory(category, options);
    }
    /**
     * Get vocabulary by difficulty level
     */
    async getVocabularyByDifficulty(difficulty, options = {}) {
        return loadVocabularyByDifficulty(difficulty, options);
    }
    /**
     * Get random vocabulary items
     */
    async getRandomVocabulary(count = 5, options = {}) {
        return getRandomVocabulary(count, options);
    }
    /**
     * Get vocabulary items by multiple IDs
     */
    async getVocabularyByIds(ids) {
        if (!this.vocabularyCollection) {
            await this.initialize();
        }
        return this.vocabularyCollection?.items.filter(item => ids.includes(item.id)) || [];
    }
    /**
     * Get all categories
     */
    async getAllCategories() {
        if (!this.vocabularyCollection) {
            await this.initialize();
        }
        return this.vocabularyCollection?.categories || [];
    }
    /**
     * Get vocabulary statistics
     */
    async getVocabularyStats() {
        if (!this.vocabularyCollection) {
            await this.initialize();
        }
        const items = this.vocabularyCollection?.items || [];
        const byPartOfSpeech = {};
        const byDifficulty = {};
        const byCategory = {};
        items.forEach(item => {
            // Count by part of speech
            byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;
            // Count by difficulty
            byDifficulty[item.difficulty] = (byDifficulty[item.difficulty] || 0) + 1;
            // Count by category
            item.categories.forEach(category => {
                byCategory[category] = (byCategory[category] || 0) + 1;
            });
        });
        return {
            totalItems: items.length,
            byPartOfSpeech,
            byDifficulty,
            byCategory
        };
    }
    /**
     * Refresh vocabulary data from source
     */
    async refreshVocabulary() {
        try {
            this.vocabularyCollection = await loadVocabulary();
            cacheVocabulary(this.vocabularyCollection);
            this.isInitialized = true;
        }
        catch (error) {
            console.error('Failed to refresh vocabulary data:', error);
            throw error;
        }
    }
    /**
     * Get vocabulary collection metadata
     */
    async getCollectionMetadata() {
        if (!this.vocabularyCollection) {
            await this.initialize();
        }
        if (!this.vocabularyCollection) {
            throw new Error('Vocabulary collection not available');
        }
        return {
            id: this.vocabularyCollection.id,
            name: this.vocabularyCollection.name,
            description: this.vocabularyCollection.description,
            languagePair: this.vocabularyCollection.languagePair,
            difficultyRange: this.vocabularyCollection.difficultyRange,
            categories: this.vocabularyCollection.categories,
            itemCount: this.vocabularyCollection.items.length,
            createdAt: this.vocabularyCollection.createdAt,
            updatedAt: this.vocabularyCollection.updatedAt
        };
    }
}
// Export a singleton instance for convenience
export const vocabularyService = VocabularyService.getInstance();
//# sourceMappingURL=vocabulary.js.map