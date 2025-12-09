import type { VocabularyItem } from '$lib/types/vocabulary';
import { LessonDifficulty } from '$lib/schemas/lesson';
export declare class VocabularyDB {
    items: VocabularyItem[];
    initialized: boolean;
    constructor();
    initialize(): Promise<void>;
    loadInitialData(): Promise<void>;
    add(item: VocabularyItem): void;
    update(id: string, updates: Partial<VocabularyItem>): void;
    get(id: string): VocabularyItem | undefined;
    /**
     * Get all vocabulary items
     */
    getVocabulary(): VocabularyItem[];
    /**
     * Get vocabulary items by difficulty level
     * @param difficulty CEFR difficulty level
     * @returns Array of vocabulary items matching the difficulty
     */
    getVocabularyByDifficulty(difficulty: LessonDifficulty): VocabularyItem[];
    /**
     * Get vocabulary items by category
     * @param category Vocabulary category
     * @returns Array of vocabulary items in the specified category
     */
    getVocabularyByCategory(category: VocabularyCategory): VocabularyItem[];
    /**
     * Get vocabulary items by part of speech
     * @param partOfSpeech Part of speech
     * @returns Array of vocabulary items with the specified part of speech
     */
    getVocabularyByPartOfSpeech(partOfSpeech: PartOfSpeech): VocabularyItem[];
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
    }): VocabularyItem[];
    /**
     * Get random vocabulary items
     * @param count Number of items to return
     * @returns Array of random vocabulary items
     */
    getRandomVocabulary(count?: number): VocabularyItem[];
    /**
     * Get vocabulary items by search query
     * @param query Search term
     * @returns Array of vocabulary items matching the search term
     */
    searchVocabulary(query: string): VocabularyItem[];
    /**
     * Get numeric difficulty range for a CEFR level
     * @param difficulty CEFR difficulty level
     * @returns Object with min and max difficulty values
     */
    private getDifficultyRange;
    /**
     * Get the count of vocabulary items
     * @returns Total number of vocabulary items
     */
    getVocabularyCount(): number;
    /**
     * Get vocabulary statistics by difficulty level
     * @returns Object with count of items per difficulty level
     */
    getVocabularyStatsByDifficulty(): Record<LessonDifficulty, number>;
}
export declare const db: VocabularyDB;
//# sourceMappingURL=db.svelte.d.ts.map