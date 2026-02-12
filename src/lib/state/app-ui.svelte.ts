import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import type { VocabularyItem } from '$lib/types/vocabulary';
import type { AppDataState } from './app-data.svelte';
import { StateError, ErrorHandler } from '../services/errors';
import { userSettings, type LanguageMode } from '$lib/stores/settings';

// Re-export for backward compatibility
export type { LanguageMode };

export class AppUIState {
    // Reference to the data state
    private dataState: AppDataState;

    // UI State
    // Note: languageMode is now synced with the persisted store
    languageMode = $state<LanguageMode>('DE_BG');
    searchQuery = $state('');
    currentItem = $state<VocabularyItem | null>(null);
    showAnswer = $state(false);
    practiceMode = $state(false);
    isLoading = $state(false);
    error = $state<string | null>(null);

    // Derived state
    displayDirection = $derived(
        this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German'
    );

    // Unsubscribe function for the store subscription
    private unsubscribeSettings: (() => void) | null = null;

    constructor(dataState: AppDataState) {
        this.dataState = dataState;
    }

    toggleLanguageMode() {
        const newMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
        this.languageMode = newMode;

        // Update the persisted store
        userSettings.update(settings => ({
            ...settings,
            languageMode: newMode
        }));

        // Notify localization service about language change
        if (browser) {
            try {
                // Import the LocalizationService dynamically to avoid circular dependencies
                import('../services/localization').then(({ LocalizationService }) => {
                    LocalizationService.notifyLanguageChange();
                });
            } catch (error) {
                console.error('Failed to notify language change:', error);
            }
        }
    }

    // Legacy support alias for compatibility
    toggleDirection() {
        this.toggleLanguageMode();
    }

    setSearchQuery(query: string) {
        this.searchQuery = query;

        // Add to recent searches if not empty and not already in list
        if (query.trim() && !this.dataState.recentSearches.includes(query)) {
            this.dataState.recentSearches = [query, ...this.dataState.recentSearches.slice(0, 9)]; // Keep last 10
        }
    }

    setCurrentItem(item: VocabularyItem | null) {
        this.currentItem = item;
        this.showAnswer = false;
    }

    togglePracticeMode() {
        this.practiceMode = !this.practiceMode;
        if (!this.practiceMode) {
            this.setCurrentItem(null);
        }
    }

    /**
     * Enhanced practice session management for "Practice This" quick actions
     * This method provides a seamless way to start practicing a specific item
     */
    startPracticeSession(item: VocabularyItem) {
        // Set up the practice session
        this.practiceMode = true;
        this.setCurrentItem(item);
        this.showAnswer = false;

        // Clear any existing search query to focus on practice
        this.searchQuery = '';
    }

    toggleShowAnswer() {
        this.showAnswer = !this.showAnswer;
    }

    setError(error: string | null) {
        Debug.log('AppUIState', 'Setting error', { error });
        this.error = error;
    }

    // Derived state for filtered items
    filteredItems = $derived.by(() => {
        const query = this.searchQuery.trim();
        if (!query) return this.dataState.allItems;

        const q = query.toLowerCase();
        return this.dataState.allItems.filter((item: VocabularyItem) => {
            return item.german.toLowerCase().includes(q) ||
                   item.bulgarian.toLowerCase().includes(q) ||
                   item.categories.some(c => c.toLowerCase().includes(q)) ||
                   (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)));
        });
    });

    // Enhanced derived state for practice recommendations
    practiceRecommendations = $derived.by(() => {
        // Memoize the filtering logic to optimize performance
        const recommendations = this.dataState.allItems
            .filter((item: VocabularyItem) => {
                const stats = this.dataState.practiceStats.get(item.id);
                if (!stats) return true; // Include new items

                // Prioritize items that need more practice
                const totalAttempts = stats.correct + stats.incorrect;
                const successRate = totalAttempts > 0 ? stats.correct / totalAttempts : 0;

                // Include items with low success rate or few attempts
                return successRate < 0.8 || totalAttempts < 3;
            });

        // Limit to top 10 recommendations and ensure we don't exceed array bounds
        return recommendations.slice(0, Math.min(10, recommendations.length));
    });

    /**
     * Initialize the UI state
     * @throws StateError if initialization fails
     */
    init(): void {
        if (browser) {
            try {
                // Load initial language mode from persisted store
                // with migration from old localStorage keys
                let initialMode: LanguageMode = 'DE_BG';

                // Check for old storage keys and migrate
                const oldSaved = localStorage.getItem('tandem-direction');
                const oldLanguageMode = localStorage.getItem('app-language-mode');

                if (oldSaved === 'DE->BG') {
                    initialMode = 'DE_BG';
                    // Migration will happen automatically via store
                    localStorage.removeItem('tandem-direction');
                } else if (oldSaved === 'BG->DE') {
                    initialMode = 'BG_DE';
                    localStorage.removeItem('tandem-direction');
                } else if (oldLanguageMode === 'DE_BG' || oldLanguageMode === 'BG_DE') {
                    initialMode = oldLanguageMode as LanguageMode;
                    // Migrate to new store format
                    userSettings.update(s => ({ ...s, languageMode: initialMode }));
                    // Clean up old key (new store uses prefixed key)
                    localStorage.removeItem('app-language-mode');
                }

                // Set initial value
                this.languageMode = initialMode;

                // Subscribe to store changes for cross-tab synchronization
                this.unsubscribeSettings = userSettings.subscribe(settings => {
                    if (settings.languageMode !== this.languageMode) {
                        this.languageMode = settings.languageMode;
                    }
                });

                // Sync initial value to store if different
                userSettings.update(settings => {
                    if (settings.languageMode !== initialMode) {
                        return { ...settings, languageMode: initialMode };
                    }
                    return settings;
                });

            } catch (error) {
                ErrorHandler.handleError(error, 'Failed to initialize UI state');
                throw new StateError('Failed to initialize UI state', { error });
            }
        }
    }

    /**
     * Cleanup method to unsubscribe from stores
     */
    destroy(): void {
        if (this.unsubscribeSettings) {
            this.unsubscribeSettings();
            this.unsubscribeSettings = null;
        }
    }
}