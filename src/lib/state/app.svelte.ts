/**
 * App State Module - Backward Compatible State Facade for Svelte 5 Runes
 *
 * This module provides backward compatibility for components that expect the
 * traditional app state interface while using the new Svelte 5 runes-based
 * state management system.
 *
 * The architecture has evolved to separate concerns:
 * - app-ui.svelte.ts: UI state management using Svelte 5 runes
 * - app-data.svelte.ts: Data state management using Svelte 5 runes
 * - app-state.ts: Legacy facade combining both states
 * - app.svelte.ts: Svelte 5 runes-based backward compatible facade
 */

import { appUIState, appDataState } from './app-state.js';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Export the singleton instances for backward compatibility
export const appUI = appUIState;
export const appData = appDataState;

// Export the combined state interface using Svelte 5 runes
class AppStateFacade {
    // UI State accessors with proper typing
    get languageMode() { return appUIState.languageMode; }
    get searchQuery() { return appUIState.searchQuery; }
    get currentItem() { return appUIState.currentItem; }
    get showAnswer() { return appUIState.showAnswer; }
    get practiceMode() { return appUIState.practiceMode; }
    get isLoading() { return appUIState.isLoading; }
    get error() { return appUIState.error; }
    get filteredItems() { return appUIState.filteredItems; }
    get displayDirection() { return appUIState.displayDirection; }
    get practiceRecommendations() { return appUIState.practiceRecommendations; }

    // Data State accessors with proper typing
    get practiceStats() { return appDataState.practiceStats; }
    get recentSearches() { return appDataState.recentSearches; }
    get favorites() { return appDataState.favorites; }

    // Method accessors with proper typing
    toggleLanguageMode() { return appUIState.toggleLanguageMode(); }
    toggleDirection() { return appUIState.toggleDirection(); }
    setSearchQuery(query: string) { return appUIState.setSearchQuery(query); }
    setCurrentItem(item: VocabularyItem | null) { return appUIState.setCurrentItem(item); }
    togglePracticeMode() { return appUIState.togglePracticeMode(); }
    startPracticeSession(item: VocabularyItem) { return appUIState.startPracticeSession(item); }
    toggleShowAnswer() { return appUIState.toggleShowAnswer(); }
    setError(error: string | null) { return appUIState.setError(error); }

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
    toggleFavorite(itemId: string) { return appDataState.toggleFavorite(itemId); }

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
export const appState = new AppStateFacade();

// Export function to get all vocabulary items for convenience
export function getAllVocabularyItems() {
    return appDataState.allItems;
}

// Import the learning session setter
import { setLearningSession } from './session.svelte';
import { diContainer } from '$lib/services/di-container';

// Export initialization function
export async function initializeApp() {
    try {
        // Initialize DI container first
        await diContainer.initialize();

        // Set the learning session from DI container
        const session = diContainer.getService('learningSession');
        setLearningSession(session);

        // Initialize both state modules
        await appDataState.init();
        await appUIState.init();
    } catch (error) {
        console.error('Failed to initialize app state:', error);
        throw error;
    }
}

// Re-export types for convenience
export type { LanguageMode } from './app-ui.svelte';
export type { VocabularyItem };