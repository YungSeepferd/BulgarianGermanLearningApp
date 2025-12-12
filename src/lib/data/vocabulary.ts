/**
 * Vocabulary Service
 *
 * Provides a unified interface for accessing vocabulary data throughout the application.
 * This service acts as a facade that abstracts the underlying data loading and search functionality.
 */

import { searchVocabulary, getVocabularyStats, getSearchSuggestions, clearVocabularyCache } from '../services/search';
import { loadVocabularyById, loadVocabularyByCategory, loadVocabularyByDifficulty, getRandomVocabulary } from './loader';
import { vocabularyDb } from './db.svelte';
import { type VocabularyItem, type VocabularyCategory } from '../schemas/vocabulary';
import { Debug } from '../utils';

/**
 * Vocabulary Service Interface
 *
 * Provides comprehensive access to vocabulary data with search, filtering, and retrieval capabilities.
 */
const vocabularyService = {
    /**
     * Search vocabulary with advanced filtering and pagination
     * @param params Search parameters including query, filters, and pagination
     * @returns Promise resolving to search results with pagination metadata
     */
    searchVocabulary: async (params: {
        query?: string;
        partOfSpeech?: string;
        difficulty?: number;
        categories?: string[];
        learningPhase?: number;
        limit?: number;
        offset?: number;
    }) => {
        try {
            Debug.log('vocabularyService', 'Searching vocabulary with params', params);
            const result = await searchVocabulary({
                query: params.query,
                partOfSpeech: params.partOfSpeech,
                difficulty: params.difficulty,
                categories: params.categories,
                learningPhase: params.learningPhase,
                limit: params.limit || 20,
                offset: params.offset || 0,
                sortBy: 'german',
                sortOrder: 'asc'
            });
            Debug.log('vocabularyService', 'Search completed', { count: result.items.length });
            return result;
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to search vocabulary', error as Error);
            return { items: [], total: 0, hasMore: false };
        }
    },

    /**
     * Get vocabulary item by ID
     * @param id The ID of the vocabulary item
     * @returns Promise resolving to the vocabulary item or null if not found
     */
    getVocabularyById: async (id: string): Promise<VocabularyItem | null> => {
        try {
            Debug.log('vocabularyService', 'Getting vocabulary by ID', { id });
            return await loadVocabularyById(id);
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get vocabulary by ID', error as Error);
            return null;
        }
    },

    /**
     * Get vocabulary items by category
     * @param category The category to filter by
     * @param options Additional filtering options
     * @returns Promise resolving to an array of vocabulary items
     */
    getVocabularyByCategory: async (category: VocabularyCategory, options: { limit?: number; difficulty?: number } = {}) => {
        try {
            Debug.log('vocabularyService', 'Getting vocabulary by category', { category, options });
            return await loadVocabularyByCategory(category, options);
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get vocabulary by category', error as Error);
            return [];
        }
    },

    /**
     * Get vocabulary items by difficulty level
     * @param difficulty The difficulty level to filter by
     * @param options Additional filtering options
     * @returns Promise resolving to an array of vocabulary items
     */
    getVocabularyByDifficulty: async (difficulty: number, options: { limit?: number; category?: string } = {}) => {
        try {
            Debug.log('vocabularyService', 'Getting vocabulary by difficulty', { difficulty, options });
            return await loadVocabularyByDifficulty(difficulty, options);
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get vocabulary by difficulty', error as Error);
            return [];
        }
    },

    /**
     * Get random vocabulary items for practice
     * @param count Number of items to return
     * @param options Filtering options
     * @returns Promise resolving to an array of random vocabulary items
     */
    getRandomVocabulary: async (count: number = 5, options: { difficulty?: number; category?: string } = {}) => {
        try {
            Debug.log('vocabularyService', 'Getting random vocabulary', { count, options });
            return await getRandomVocabulary(count, options);
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get random vocabulary', error as Error);
            return [];
        }
    },

    /**
     * Get vocabulary statistics for filters
     * @returns Promise resolving to statistics for part of speech, difficulty, categories, and learning phases
     */
    getVocabularyStats: async () => {
        try {
            Debug.log('vocabularyService', 'Getting vocabulary statistics');
            return await getVocabularyStats();
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get vocabulary statistics', error as Error);
            return {
                partOfSpeech: {},
                difficulty: {},
                categories: {},
                learningPhase: {}
            };
        }
    },

    /**
     * Get search suggestions for autocomplete
     * @param query The search query
     * @param limit Maximum number of suggestions to return
     * @returns Promise resolving to an array of search suggestions
     */
    getSearchSuggestions: async (query: string, limit: number = 5) => {
        try {
            Debug.log('vocabularyService', 'Getting search suggestions', { query, limit });
            return await getSearchSuggestions(query, limit);
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to get search suggestions', error as Error);
            return [];
        }
    },

    /**
     * Update practice statistics for a vocabulary item
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     * @returns Promise that resolves when the update is complete
     */
    updateStats: async (itemId: string, correct: boolean, responseTime?: number) => {
        try {
            Debug.log('vocabularyService', 'Updating stats', { itemId, correct, responseTime });

            // Get the current item from the database
            const item = vocabularyDb.get(itemId);
            if (!item) {
                throw new Error(`Item with ID ${itemId} not found`);
            }

            // Update the item's practice statistics
            const now = new Date();
            const stats = item.stats || {
                correctCount: 0,
                incorrectCount: 0,
                lastPracticed: null,
                lastCorrect: null,
                streak: 0
            };

            if (correct) {
                stats.correctCount++;
                stats.lastCorrect = now;
                stats.streak++;
            } else {
                stats.incorrectCount++;
                stats.streak = 0;
            }

            stats.lastPracticed = now;

            // Update the item in the database
            vocabularyDb.update(itemId, {
                stats,
                updatedAt: now
            });

            // Clear cache to ensure fresh data
            clearVocabularyCache();
        } catch (error) {
            Debug.error('vocabularyService', 'Failed to update stats', error as Error);
        }
    },

    /**
     * Clear the vocabulary cache to force fresh data loading
     */
    clearCache: () => {
        Debug.log('vocabularyService', 'Clearing vocabulary cache');
        clearVocabularyCache();
    }
};

// Export the service directly
export { vocabularyService };