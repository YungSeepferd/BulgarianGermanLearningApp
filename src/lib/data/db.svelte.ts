import { browser } from '$app/environment';
import type { VocabularyItem } from '$lib/types/vocabulary';
import type { LessonDifficulty } from '$lib/schemas/lesson';
import type { VocabularyCategory, PartOfSpeech } from '$lib/schemas/vocabulary';
import { loadVocabulary } from '$lib/data/loader';

export class VocabularyDB {
    // items = $state<VocabularyItem[]>([]);
    // initialized = $state(false);
    items: VocabularyItem[] = [];
    initialized = false;

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
            // Use the DataLoader which now includes Zod validation
            const data = await loadVocabulary();

            this.items = data;
            this.initialized = true;
            // VocabularyDB initialized
        } catch (_e) {
            // Silently fail if loading vocabulary fails
            this.items = [];
            this.initialized = true;
        }
    }

    add(item: VocabularyItem) {
        this.items.push(item);
    }

    update(id: string, updates: Partial<VocabularyItem>) {
        const index = this.items.findIndex((i: VocabularyItem) => i.id === id);
        if (index !== -1) {
            const current = this.items[index];
            this.items[index] = { ...current, ...updates } as VocabularyItem;
        }
    }

    get(id: string): VocabularyItem | undefined {
        return this.items.find((i: VocabularyItem) => i.id === id);
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
        if (!query) return [];

        const lowerQuery = query.toLowerCase();
        return this.items.filter(item =>
            item.german.toLowerCase().includes(lowerQuery) ||
            item.bulgarian.toLowerCase().includes(lowerQuery) ||
            item.categories.some(category => category.toLowerCase().includes(lowerQuery))
        );
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

export const db = new VocabularyDB();
export const vocabularyDb = db;