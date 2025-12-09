import type { VocabularyItem } from '$lib/types/vocabulary';
export type LanguageMode = 'DE_BG' | 'BG_DE';
export declare class AppState {
    languageMode: LanguageMode;
    searchQuery: string;
    currentItem: VocabularyItem | null;
    showAnswer: boolean;
    practiceMode: boolean;
    isLoading: boolean;
    error: string | null;
    practiceStats: Map<string, {
        correct: number;
        incorrect: number;
        lastPracticed: string;
    }>;
    recentSearches: string[];
    favorites: string[];
    filteredItems: any;
    displayDirection: any;
    practiceRecommendations: any;
    toggleLanguageMode(): void;
    toggleDirection(): void;
    setSearchQuery(query: string): void;
    setCurrentItem(item: VocabularyItem | null): void;
    togglePracticeMode(): void;
    /**
     * Enhanced practice session management for "Practice This" quick actions
     * This method provides a seamless way to start practicing a specific item
     */
    startPracticeSession(item: VocabularyItem): void;
    toggleShowAnswer(): void;
    setError(error: string | null): void;
    recordPracticeResult(itemId: string, correct: boolean, responseTime?: number): Promise<void>;
    toggleFavorite(itemId: string): void;
    isFavorite(itemId: string): boolean;
    private saveProgress;
    private loadProgress;
    init(): void;
    clearAllData(): void;
    exportData(): string;
    importData(jsonData: string): void;
}
export declare const appState: AppState;
//# sourceMappingURL=app.svelte.d.ts.map