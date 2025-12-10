import { AppUIState } from './app-ui.svelte';
import { AppDataState } from './app-data.svelte';
import { diContainer } from '../services/di-container.js';

// Create the data state instance
export const appDataState = new AppDataState();
appDataState.init();

// Create the UI state instance with reference to data state
export const appUIState = new AppUIState(appDataState);
appUIState.init();

// Export async initialization function
export async function initializeAppState() {
    try {
        // Ensure DI container is initialized
        await diContainer.initialize();

        // Note: The DI container now handles proper initialization sequence
        // The appDataState and appUIState instances are already properly initialized
        return {
            appDataState,
            appUIState
        };
    } catch (error) {
        console.error('Failed to initialize app state:', error);
        throw error;
    }
}

// Export a combined interface for backward compatibility
import type { VocabularyItem } from '$lib/types/vocabulary';

export class AppState {
    // UI State accessors with proper typing
    get languageMode(): 'DE_BG' | 'BG_DE' { return appUIState.languageMode; }
    get searchQuery(): string { return appUIState.searchQuery; }
    get currentItem(): VocabularyItem | null { return appUIState.currentItem; }
    get showAnswer(): boolean { return appUIState.showAnswer; }
    get practiceMode(): 'practice' | 'search' { return appUIState.practiceMode; }
    get isLoading(): boolean { return appUIState.isLoading; }
    get error(): string | null { return appUIState.error; }
    get filteredItems(): VocabularyItem[] { return appUIState.filteredItems; }
    get displayDirection(): 'DE->BG' | 'BG->DE' { return appUIState.displayDirection; }
    get practiceRecommendations(): VocabularyItem[] { return appUIState.practiceRecommendations; }

    // Data State accessors with proper typing
    get practiceStats(): Map<string, { correct: number; incorrect: number; lastPracticed: string }> {
        return appDataState.practiceStats;
    }
    get recentSearches(): string[] { return appDataState.recentSearches; }
    get favorites(): string[] { return appDataState.favorites; }

    // Method accessors with proper typing
    toggleLanguageMode(): void { return appUIState.toggleLanguageMode(); }
    toggleDirection(): void { return appUIState.toggleDirection(); }
    setSearchQuery(query: string): void { return appUIState.setSearchQuery(query); }
    setCurrentItem(item: VocabularyItem | null): void { return appUIState.setCurrentItem(item); }
    togglePracticeMode(): void { return appUIState.togglePracticeMode(); }
    startPracticeSession(item: VocabularyItem): void { return appUIState.startPracticeSession(item); }
    toggleShowAnswer(): void { return appUIState.toggleShowAnswer(); }
    setError(error: string | null): void { return appUIState.setError(error); }

    /**
     * Record a practice result with proper typing
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in milliseconds (optional)
     */
    async recordPracticeResult(itemId: string, correct: boolean, responseTime?: number): Promise<void> {
        return appDataState.recordPracticeResult(itemId, correct, responseTime);
    }

    /**
     * Toggle favorite status for a vocabulary item
     * @param itemId The ID of the vocabulary item
     */
    toggleFavorite(itemId: string): void { return appDataState.toggleFavorite(itemId); }

    /**
     * Check if an item is favorited
     * @param itemId The ID of the vocabulary item
     * @returns boolean indicating if the item is favorited
     */
    isFavorite(itemId: string): boolean { return appDataState.isFavorite(itemId); }

    /**
     * Clear all user data
     */
    async clearAllData(): Promise<void> { return appDataState.clearAllData(); }

    /**
     * Export user data as JSON
     * @returns JSON string of user data
     */
    exportData(): string { return appDataState.exportData(); }

    /**
     * Import user data from JSON
     * @param jsonData JSON string of user data
     */
    importData(jsonData: string): void { return appDataState.importData(jsonData); }
}

// Export the singleton instance for backward compatibility
// Note: This should be used after calling initializeAppState()
export const appState = new AppState();