import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { DataLoader } from '$lib/data/DataLoader.svelte';
import { diContainer } from '$lib/services/di-container';
import { EventTypes } from '$lib/services/event-bus';
import type { VocabularyItem } from '$lib/types/vocabulary';
import type { LessonDifficulty } from '$lib/schemas/lesson';
import type { VocabularyCategory, PartOfSpeech } from '$lib/schemas/vocabulary';

class VocabularyDB {
    // Reactive state using Svelte 5 Runes
    /** @type {VocabularyItem[]} */
    items = $state<VocabularyItem[]>([]);
    /** @type {boolean} */
    initialized = $state<boolean>(false);

    constructor() {
        // Don't load data in constructor to prevent SSR fetch calls
        // Data loading will be triggered explicitly when needed
    }

    async initialize() {
        if (browser && !this.initialized) {
            await this.loadInitialData();
        }
    }

    async loadInitialData() {
        try {
            Debug.log('VocabularyDB', 'Loading initial vocabulary data');
            // Use the DataLoader which now includes Zod validation
            const dataLoader = DataLoader.getInstance();
            const result = await dataLoader.getVocabularyBySearch({
                limit: Number.MAX_SAFE_INTEGER,
                offset: 0
            });

            // Convert UnifiedVocabularyItem to VocabularyItem format
            // Ensure all required fields are present with defaults
            this.items = result.items.map(item => ({
                ...item,
                category: item.categories[0] || 'greetings',
                categories: item.categories || ['greetings'],
                tags: (item.tags ?? []),
                // Ensure required fields from metadata or use defaults
                isCommon: item.metadata?.isCommon ?? false,
                isVerified: item.metadata?.isVerified ?? false,
                learningPhase: item.metadata?.learningPhase ?? 0,
                xp_value: item.xp_value ?? item.metadata?.xpValue ?? 10
            }));

            this.initialized = true;
            Debug.log('VocabularyDB', 'Vocabulary data loaded successfully', {
                itemCount: this.items.length,
                initialized: this.initialized
            });
        } catch (error) {
            Debug.error('VocabularyDB', 'Failed to load initial vocabulary data', error as Error);
            // Store the error for user feedback
            this.items = [];
            this.initialized = true;

            // Emit error event for global error handling
            const eventBus = diContainer.getService('eventBus');
            eventBus.emit(EventTypes.ERROR, {
                error: new Error('Failed to load vocabulary data'),
                context: 'VocabularyDB.loadInitialData',
                timestamp: new Date()
            });
        }
    }

    // Remove the unused import workaround since we're using DataLoader instead

    /** @param {VocabularyItem} item */
    add(item) {
        this.items.push(item);
    }

    /** @param {string} id @param {Partial<VocabularyItem>} updates */
    update(id, updates) {
        const index = this.items.findIndex((i) => i.id === id);
        if (index !== -1) {
            const current = this.items[index];
            this.items[index] = { ...current, ...updates };
        }
    }

    /** @param {string} id @returns {VocabularyItem | undefined} */
    get(id) {
        return this.items.find((i) => i.id === id);
    }

    /**
     * Get all vocabulary items
     */
    getVocabulary(): VocabularyItem[] {
        return this.items;
    }

    /**
     * Get vocabulary items by difficulty level
     * @param difficulty CEFR difficulty level
     * @returns Array of vocabulary items matching the difficulty
     */
    getVocabularyByDifficulty(difficulty: LessonDifficulty): VocabularyItem[] {
        const difficultyRange = this.getDifficultyRange(difficulty);
        return this.items.filter(item =>
            item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
        );
    }

    /**
     * Get vocabulary items by category
     * @param category Vocabulary category
     * @returns Array of vocabulary items in the specified category
     */
    getVocabularyByCategory(category: VocabularyCategory): VocabularyItem[] {
        return this.items.filter(item => item.categories.includes(category));
    }

    /**
     * Get vocabulary items by part of speech
     * @param partOfSpeech Part of speech
     * @returns Array of vocabulary items with the specified part of speech
     */
    getVocabularyByPartOfSpeech(partOfSpeech: PartOfSpeech): VocabularyItem[] {
        return this.items.filter(item => item.partOfSpeech === partOfSpeech);
    }

    /**
     * Get vocabulary items by multiple criteria
     * @param criteria Search criteria
     * @returns Array of vocabulary items matching all criteria
     */
    getVocabularyByCriteria(criteria: {
        difficulty?: LessonDifficulty;
        categories?: VocabularyCategory[];
        partOfSpeech?: PartOfSpeech;
        limit?: number;
    }): VocabularyItem[] {
        // Convert difficulty level to numeric range if provided
        const difficultyRange = criteria.difficulty
            ? this.getDifficultyRange(criteria.difficulty)
            : null;

        const filteredItems = this.items.filter(item => {
            // Filter by difficulty
            const difficultyMatch = difficultyRange
                ? item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
                : true;

            // Filter by categories
            const categoryMatch = criteria.categories && criteria.categories.length > 0
                ? item.categories.some(category => criteria.categories?.includes(category))
                : true;

            // Filter by part of speech
            const partOfSpeechMatch = criteria.partOfSpeech
                ? item.partOfSpeech === criteria.partOfSpeech
                : true;

            return difficultyMatch && categoryMatch && partOfSpeechMatch;
        });

        // Apply limit if specified
        return criteria.limit
            ? filteredItems.slice(0, criteria.limit)
            : filteredItems;
    }

    /**
     * Get random vocabulary items
     * @param count Number of items to return
     * @returns Array of random vocabulary items
     */
    getRandomVocabulary(count: number = 5): VocabularyItem[] {
        if (this.items.length === 0) return [];

        // Shuffle array and take first N items
        const shuffled = [...this.items].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this.items.length));
    }

    /**
     * Get vocabulary items by search query
     * @param query Search term
     * @returns Array of vocabulary items matching the search term
     */
    searchVocabulary(query: string): VocabularyItem[] {
        Debug.log('VocabularyDB', 'Searching vocabulary', { query });
        if (!query) {
            Debug.log('VocabularyDB', 'Empty search query, returning empty results');
            return [];
        }

        const lowerQuery = query.toLowerCase();
        const results = this.items.filter(item =>
            item.german.toLowerCase().includes(lowerQuery) ||
            item.bulgarian.toLowerCase().includes(lowerQuery) ||
            (item.tags ?? []).some(tag => tag.toLowerCase().includes(lowerQuery))
        );

        Debug.log('VocabularyDB', 'Vocabulary search completed', { query, results: results.length });
        return results;
    }

    /**
     * Get numeric difficulty range for a CEFR level
     * @param difficulty CEFR difficulty level
     * @returns Object with min and max difficulty values
     */
    private getDifficultyRange(difficulty: LessonDifficulty): { min: number; max: number } {
        const ranges: Record<LessonDifficulty, { min: number; max: number }> = {
            'A1': { min: 1, max: 1.5 },
            'A2': { min: 1.5, max: 2.5 },
            'B1': { min: 2.5, max: 3.5 },
            'B2': { min: 3.5, max: 4.5 },
            'C1': { min: 4.5, max: 5 }
        };
        return ranges[difficulty];
    }

    /**
     * Get the count of vocabulary items
     * @returns Total number of vocabulary items
     */
    getVocabularyCount(): number {
        return this.items.length;
    }

    /**
     * Get vocabulary statistics by difficulty level
     * @returns Object with count of items per difficulty level
     */
    getVocabularyStatsByDifficulty(): Record<LessonDifficulty, number> {
        const stats: Record<LessonDifficulty, number> = {
            'A1': 0,
            'A2': 0,
            'B1': 0,
            'B2': 0,
            'C1': 0
        };

        this.items.forEach(item => {
            if (item.difficulty <= 1.5) stats.A1++;
            else if (item.difficulty <= 2.5) stats.A2++;
            else if (item.difficulty <= 3.5) stats.B1++;
            else if (item.difficulty <= 4.5) stats.B2++;
            else stats.C1++;
        });

        return stats;
    }
}

// Initialize the database instance
const vocabularyDb = new VocabularyDB();

// Automatic initialization is now handled by the DataLoader
// No automatic initialization here to avoid SSR issues

/**
 * Singleton instance of VocabularyDB for global state management
 */
export { vocabularyDb };