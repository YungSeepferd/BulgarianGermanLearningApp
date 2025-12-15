/**
 * Vocabulary Service
 *
 * Provides a unified interface for accessing vocabulary data throughout the application.
 * This service acts as a facade that abstracts the underlying data loading and search functionality.
 */

import { searchVocabulary, getVocabularyStats, getSearchSuggestions, clearVocabularyCache } from '../services/search';
import { loadVocabularyById, loadVocabularyByCategory, loadVocabularyByDifficulty, getRandomVocabulary } from './loader';
// import { vocabularyDb } from './db.svelte';
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
                partOfSpeech: params.partOfSpeech as any,
                difficulty: params.difficulty,
                categories: params.categories as any,
                learningPhase: params.learningPhase,
                limit: params.limit || 20,
                offset: params.offset || 0,
                sortBy: 'german',
                sortOrder: 'asc'
            });
            Debug.log('vocabularyService', 'Search completed', { count: result.items.length });
            
            // Map items to VocabularyItem
            return {
                ...result,
                items: result.items.map(item => ({
                    ...item,
                    isCommon: false,
                    isVerified: false,
                    learningPhase: 0
                })) as VocabularyItem[]
            };
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
            const item = await loadVocabularyById(id);
            if (!item) return null;
            return {
                ...item,
                isCommon: false,
                isVerified: false,
                learningPhase: 0
            } as VocabularyItem;
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
            const items = await loadVocabularyByCategory(category, options);
            return items.map(item => ({
                ...item,
                isCommon: false,
                isVerified: false,
                learningPhase: 0
            })) as VocabularyItem[];
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
            const items = await loadVocabularyByDifficulty(difficulty, options);
            return items.map(item => ({
                ...item,
                isCommon: false,
                isVerified: false,
                learningPhase: 0
            })) as VocabularyItem[];
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
            const items = await getRandomVocabulary(count, options);
            return items.map(item => ({
                ...item,
                isCommon: false,
                isVerified: false,
                learningPhase: 0
            })) as VocabularyItem[];
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
     * Clear the vocabulary cache to force fresh data loading
     */
    clearCache: () => {
        Debug.log('vocabularyService', 'Clearing vocabulary cache');
        clearVocabularyCache();
    }
};

// Export the service directly
export { vocabularyService };
export type _VocabularyService = typeof vocabularyService;
