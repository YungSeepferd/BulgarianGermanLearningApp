import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import type { VocabularyItem } from '$lib/types/vocabulary';
import type { AppDataState } from './app-data.svelte';
import { StateError, ErrorHandler } from '../services/errors';

export type LanguageMode = 'DE_BG' | 'BG_DE';

export class AppUIState {
    // Reference to the data state
    private dataState: AppDataState;

    // UI State
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

    constructor(dataState: AppDataState) {
        this.dataState = dataState;
    }

    toggleLanguageMode() {
        this.languageMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
        this.triggerLanguageModePersistence();
  
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

    /**
     * Trigger language mode persistence to localStorage
     * @throws StateError if saving fails
     */
    private triggerLanguageModePersistence(): void {
        if (browser) {
            try {
                localStorage.setItem('app-language-mode', this.languageMode);
                // Clean up old storage key if it exists
                if (localStorage.getItem('tandem-direction')) {
                    localStorage.removeItem('tandem-direction');
                }
            } catch (error) {
                ErrorHandler.handleError(error, 'Failed to save language mode');
                throw new StateError('Failed to save language mode', { error });
            }
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
                   item.category.toLowerCase().includes(q) ||
                   item.tags.some(tag => tag.toLowerCase().includes(q));
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
                // Load initial language mode
                const saved = localStorage.getItem('app-language-mode');
                const oldSaved = localStorage.getItem('tandem-direction');
  
                // Set default language if no preference exists
                if (saved === 'DE_BG' || saved === 'BG_DE') {
                    this.languageMode = saved as LanguageMode;
                } else if (oldSaved === 'DE->BG') {
                    this.languageMode = 'DE_BG';
                    // Migrate from old format to new format
                    localStorage.setItem('app-language-mode', 'DE_BG');
                    localStorage.removeItem('tandem-direction');
                } else if (oldSaved === 'BG->DE') {
                    this.languageMode = 'BG_DE';
                    // Migrate from old format to new format
                    localStorage.setItem('app-language-mode', 'BG_DE');
                    localStorage.removeItem('tandem-direction');
                } else {
                    // Set default language (DE_BG) when no saved preference exists
                    this.languageMode = 'DE_BG';
                    localStorage.setItem('app-language-mode', 'DE_BG');
                }
  
                // Set up automatic syncing with event listener
                window.addEventListener('storage', (e) => {
                    if (e.key === 'app-language-mode') {
                        const saved = localStorage.getItem('app-language-mode');
                        if (saved === 'DE_BG' || saved === 'BG_DE') {
                            this.languageMode = saved as LanguageMode;
                        }
                    }
                });
            } catch (error) {
                ErrorHandler.handleError(error, 'Failed to initialize UI state');
                throw new StateError('Failed to initialize UI state', { error });
            }
        }
    }
}