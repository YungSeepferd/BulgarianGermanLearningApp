import { AppUIState } from './app-ui.svelte';
import { AppDataState } from './app-data.svelte';
import { getProgressService, eventBus } from '$lib/services/di-container';
import type { VocabularyMastery, OverallProgress } from '$lib/schemas/progress';
import { ErrorHandler } from '$lib/services/errors';

// Export initialization function instead of direct instances
// Initialize and export the state instances directly
export const appDataState = new AppDataState();
export const appUIState = new AppUIState(appDataState);

// Export async initialization function
export async function initializeAppState() {
    try {
        // Initialize the state instances
        await appDataState.init();
        await appUIState.init();

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
    get practiceMode(): 'practice' | 'search' { return appUIState.practiceMode ? 'practice' : 'search'; }
    get isLoading(): boolean { return appUIState.isLoading; }
    get error(): string | null { return appUIState.error; }
    get filteredItems(): VocabularyItem[] { return appUIState.filteredItems; }
    get displayDirection(): string { return appUIState.displayDirection; }
    get practiceRecommendations(): VocabularyItem[] { return appUIState.practiceRecommendations; }

    // Data State accessors with proper typing
    get practiceStats(): Map<string, { correct: number; incorrect: number; lastPracticed: string }> {
        // Derive practice stats from ProgressService to avoid duplication
        try {
            const svc = getProgressService();
            const all = svc.getAllVocabularyMastery();
            const stats = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
            for (const [itemId, mastery] of Object.entries(all)) {
                stats.set(itemId, {
                    correct: mastery.correctCount,
                    incorrect: mastery.incorrectCount,
                    lastPracticed: mastery.lastPracticed || ''
                });
            }
            return stats;
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.practiceStats');
            return appDataState.practiceStats;
        }
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
     * Return all vocabulary items currently loaded
     */
    getAllVocabularyItems(): VocabularyItem[] { return appDataState.allItems; }

    /**
     * Record a practice result with proper typing
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in milliseconds (optional)
     */
    async recordPracticeResult(itemId: string, correct: boolean, responseTime?: number): Promise<void> {
        try {
            const svc = getProgressService();
            await svc.recordVocabularyPractice(itemId, correct, responseTime);
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.recordPracticeResult', eventBus);
            // Fallback to legacy path if service fails
            return appDataState.recordPracticeResult(itemId, correct, responseTime);
        }
    }

    /** Get detailed mastery info from ProgressService */
    getVocabularyMastery(itemId: string): VocabularyMastery | null {
        try {
            const svc = getProgressService();
            return svc.getVocabularyMastery(itemId);
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.getVocabularyMastery', eventBus);
            return null;
        }
    }

    /** Get overall progress summary */
    getOverallProgress(): OverallProgress {
        try {
            const svc = getProgressService();
            return svc.getOverallProgress();
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.getOverallProgress', eventBus);
            // Provide a minimal empty summary fallback
            return {
                id: 'fallback',
                totalXP: 0,
                totalWordsPracticed: 0,
                totalLessonsCompleted: 0,
                totalQuizzesTaken: 0,
                totalTimeSpent: 0,
                currentLevel: 1,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
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