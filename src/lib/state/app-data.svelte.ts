import { browser } from '$app/environment';
import { vocabularyDb } from '$lib/data/db.svelte';
import { LocalStorageManager } from '$lib/utils/localStorage';
import { Debug } from '$lib/utils';
import type { VocabularyItem } from '$lib/types/vocabulary';
import { StateError, StorageError, ErrorHandler } from '../services/errors';

export class AppDataState {
    // Data-related state with proper typing
    practiceStats = $state<Map<string, { correct: number; incorrect: number; lastPracticed: string }>>(new Map());
    recentSearches = $state<string[]>([]);
    favorites = $state<string[]>([]);

    // Error state for user feedback
    lastError = $state<string | null>(null);
    isError = $state<boolean>(false);

    // Get all vocabulary items from the database
    get allItems(): VocabularyItem[] {
        return vocabularyDb.items;
    }

    /**
     * Toggle favorite status for a vocabulary item
     * @param itemId The ID of the vocabulary item
     * @throws StateError if the item ID is invalid
     */
    toggleFavorite(itemId: string): void {
        Debug.log('AppDataState', 'Toggling favorite', { itemId });
        try {
            if (typeof itemId !== 'string' || !itemId.trim()) {
                throw new Error('Invalid item ID: must be a non-empty string');
            }

            const index = this.favorites.indexOf(itemId);
            if (index > -1) {
                this.favorites = this.favorites.filter(fav => fav !== itemId);
            } else {
                this.favorites = [...this.favorites, itemId];
            }
            this.saveProgress();
        } catch (error) {
            this.handleError(error, 'Failed to toggle favorite');
            throw new StateError('Failed to toggle favorite', { itemId, error });
        }
    }

    isFavorite(itemId: string): boolean {
        return this.favorites.includes(itemId);
    }

    /**
     * Record a practice result for a vocabulary item using atomic transaction
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     * @throws StateError if recording fails
     */
    async recordPracticeResult(itemId: string, correct: boolean, responseTime?: number): Promise<void> {
        if (typeof itemId !== 'string' || !itemId.trim()) {
            const error = new Error('Invalid item ID: must be a non-empty string');
            this.handleError(error, 'Failed to record practice result');
            throw new StateError('Invalid item ID', { itemId });
        }
        if (typeof correct !== 'boolean') {
            const error = new Error('Invalid correct flag: must be a boolean');
            this.handleError(error, 'Failed to record practice result');
            throw new StateError('Invalid correct flag', { correct });
        }
        if (responseTime !== undefined && (typeof responseTime !== 'number' || responseTime < 0 || !Number.isFinite(responseTime))) {
            const error = new Error('Invalid response time: must be a non-negative number');
            this.handleError(error, 'Failed to record practice result');
            throw new StateError('Invalid response time', { responseTime });
        }

        // Store original state for rollback on error
        const originalStats = new Map(this.practiceStats);
        const originalFavorites = [...this.favorites];
        const originalSearches = [...this.recentSearches];

        try {
            const current = this.practiceStats.get(itemId) || { correct: 0, incorrect: 0, lastPracticed: '' };
            const updatedStats = {
                correct: correct ? current.correct + 1 : current.correct,
                incorrect: !correct ? current.incorrect + 1 : current.incorrect,
                lastPracticed: new Date().toISOString()
            };
            const newStats = new Map(this.practiceStats);
            newStats.set(itemId, updatedStats);
            this.practiceStats = newStats;

            await this.saveProgress();

        } catch (error) {
            // Restore original state on error
            this.practiceStats = originalStats;
            this.favorites = originalFavorites;
            this.recentSearches = originalSearches;

            this.handleError(error, 'Failed to record practice result');
            ErrorHandler.handleError(error as Error, 'Failed to record practice result', undefined);
            throw new StateError('Failed to record practice result', { itemId, error });
        }
    }

    /**
     * Save progress data to localStorage
     * @throws StorageError if saving fails
     */
    private async saveProgress(): Promise<void> {
        if (!browser) return;

        try {
            if (!(this.practiceStats instanceof Map)) {
                throw new Error('Invalid practice stats: expected Map');
            }
            if (!Array.isArray(this.favorites)) {
                throw new Error('Invalid favorites: expected array');
            }
            if (!Array.isArray(this.recentSearches)) {
                throw new Error('Invalid recent searches: expected array');
            }

            LocalStorageManager.saveUserProgress({
                stats: this.practiceStats,
                favorites: this.favorites,
                recentSearches: this.recentSearches
            });
        } catch (error) {
            this.handleError(error, 'Failed to save progress data');
            ErrorHandler.handleError(error as Error, 'Failed to save app data state', undefined);
            throw new StorageError('Failed to save app data state', {
                error,
                statsType: typeof this.practiceStats,
                favoritesType: typeof this.favorites,
                searchesType: typeof this.recentSearches
            });
        }
    }

    /**
     * Load progress data from localStorage
     * @throws StorageError if loading fails
     */
    private loadProgress(): void {
        if (!browser) return;

        try {
            const progress = LocalStorageManager.loadUserProgress();
            if (progress) {
                if (progress.stats && typeof progress.stats === 'object') {
                    this.practiceStats = new Map(Object.entries(progress.stats));
                } else {
                    this.practiceStats = new Map();
                }

                this.favorites = Array.isArray(progress.favorites) ? progress.favorites : [];
                this.recentSearches = Array.isArray(progress.recentSearches) ? progress.recentSearches : [];
            }
        } catch (error) {
            this.handleError(error, 'Failed to load progress data');
            ErrorHandler.handleError(error as Error, 'Failed to load app data state', undefined);
            throw new StorageError('Failed to load app data state', {
                error,
                hasStats: false,
                hasFavorites: false,
                hasSearches: false
            });
        }
    }

    /**
     * Clear all user data
     * @throws StorageError if clearing fails
     */
    async clearAllData(): Promise<void> {
        try {
            this.practiceStats = new Map();
            this.favorites = [];
            this.recentSearches = [];
            await this.saveProgress();

            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('vocabulary-cache');
            }
            LocalStorageManager.clearAllData();
        } catch (error) {
            this.handleError(error, 'Failed to clear all user data');
            ErrorHandler.handleError(error as Error, 'Failed to clear all app data', undefined);
            throw new StorageError('Failed to clear all app data', { error });
        }
    }

    /**
     * Export user data as JSON
     * @returns JSON string of user data
     * @throws StorageError if export fails
     */
    exportData(): string {
        try {
            return LocalStorageManager.exportUserData();
        } catch (error) {
            this.handleError(error, 'Failed to export user data');
            ErrorHandler.handleError(error as Error, 'Failed to export app data', undefined);
            throw new StorageError('Failed to export app data', { error });
        }
    }

    /**
     * Import user data from JSON
     * @param jsonData JSON string of user data
     * @throws StateError if import fails
     */
    importData(jsonData: string): void {
        try {
            if (typeof jsonData !== 'string' || !jsonData.trim()) {
                throw new Error('Invalid JSON data: must be a non-empty string');
            }

            LocalStorageManager.importUserData(jsonData);
            this.loadProgress();
        } catch (error) {
            this.handleError(error, 'Failed to import user data');
            ErrorHandler.handleError(error as Error, 'Failed to import app data', undefined);
            throw new StateError('Failed to import app data', {
                error,
                jsonDataType: typeof jsonData,
                jsonDataLength: jsonData?.length
            });
        }
    }

    /**
     * Initialize the AppDataState
     * @throws StateError if initialization fails
     */
    init() {
        if (browser) {
            try {
                this.loadProgress();
            } catch (error) {
                this.handleError(error, 'Failed to initialize application data');
                ErrorHandler.handleError(error as Error, 'Failed to initialize AppDataState', undefined);
                throw new StateError('Failed to initialize AppDataState', { error });
            }
        }
    }

    /**
     * Handle errors and provide user feedback
     * @param error The error to handle
     * @param context Context for the error
     */
    private handleError(error: unknown, context: string): void {
        this.isError = true;
        this.lastError = `${context}: ${error instanceof Error ? error.message : String(error)}`;

        setTimeout(() => {
            this.isError = false;
            this.lastError = null;
        }, 5000);
    }

    /**
     * Clear the current error state
     */
    clearError(): void {
        this.isError = false;
        this.lastError = null;
    }
}