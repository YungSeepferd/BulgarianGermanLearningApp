import { browser } from '$app/environment';
import { vocabularyDb } from '$lib/data/db.svelte';
import { vocabularyService } from '$lib/data/vocabulary';
import { LocalStorageManager } from '$lib/utils/localStorage';
import { Debug } from '$lib/utils';
import { TransactionManager } from '$lib/utils/transaction';
import type { VocabularyItem } from '$lib/types/vocabulary';
import { StateError, StorageError, ErrorHandler } from '../services/errors';
import { EventBus } from '../services/event-bus';

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
            // Validate input with type guard
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

    // Enhanced progress tracking
    /**
     * Record a practice result for a vocabulary item
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     * @throws StateError if recording fails
     */
    /**
     * Record a practice result for a vocabulary item using atomic transaction
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     * @param eventBus Optional event bus for error handling
     * @throws StateError if recording fails
     */
    /**
     * Record a practice result for a vocabulary item using atomic transaction
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     * @param eventBus Optional event bus for error handling
     * @throws StateError if recording fails
     */
    async recordPracticeResult(itemId: string, correct: boolean, responseTime?: number, eventBus?: EventBus): Promise<void> {
        // Validate input parameters with type guards
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
        // Create a transaction to ensure atomic updates
        const transactionId = `practice-result-${itemId}-${Date.now()}`;
        const transaction = TransactionManager.startTransaction(transactionId);

        try {
            // Store current state for rollback
            const originalStats = new Map(this.practiceStats);
            const originalFavorites = [...this.favorites];
            const originalSearches = [...this.recentSearches];

            // Add data loader update operation
            transaction.addOperation(
                async () => {
                    await vocabularyService.updateStats(itemId, correct, responseTime);
                },
                async () => {
                    Debug.log('AppDataState', 'Rolling back data loader update', { itemId });
                    // No rollback needed for data loader as it's read-only
                }
            );

            // Add local stats update operation
            transaction.addOperation(
                async () => {
                    // Update local stats
                    const current = this.practiceStats.get(itemId) || { correct: 0, incorrect: 0, lastPracticed: '' };

                    // Update practice stats with proper typing
                    const updatedStats = {
                        correct: correct ? current.correct + 1 : current.correct,
                        incorrect: !correct ? current.incorrect + 1 : current.incorrect,
                        lastPracticed: new Date().toISOString()
                    };

                    // Create a new Map to trigger reactivity with Svelte 5 Runes
                    const newStats = new Map(this.practiceStats);
                    newStats.set(itemId, updatedStats);
                    this.practiceStats = newStats;
                },
                async () => {
                    Debug.log('AppDataState', 'Rolling back local stats update', { itemId });
                    this.practiceStats = originalStats;
                }
            );

            // Add save progress operation
            transaction.addOperation(
                async () => {
                    await this.saveProgress(eventBus);
                },
                async () => {
                    Debug.log('AppDataState', 'Rolling back save progress', { itemId });
                    this.favorites = originalFavorites;
                    this.recentSearches = originalSearches;
                }
            );

            // Commit the transaction
            await TransactionManager.commitTransaction(transactionId);

        } catch (error) {
            // Attempt to rollback the transaction if it wasn't committed
            try {
                await TransactionManager.rollbackTransaction(transactionId);
            } catch (rollbackError) {
                Debug.error('AppDataState', 'Failed to rollback transaction', rollbackError as Error);
            }

            this.handleError(error, 'Failed to record practice result');
            ErrorHandler.handleError(error as Error, 'Failed to record practice result', eventBus);
            throw new StateError('Failed to record practice result', { itemId, error });
        }
    }

    // Enhanced localStorage integration
    /**
     * Save progress data to localStorage
     * @param eventBus Optional event bus for error handling
     * @throws StorageError if saving fails
     */
    private async saveProgress(eventBus?: EventBus): Promise<void> {
        if (!browser) return;

        try {
            // Validate data before saving
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
            }, eventBus);
        } catch (error) {
            this.handleError(error, 'Failed to save progress data');
            ErrorHandler.handleError(error as Error, 'Failed to save app data state', eventBus);
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
     * @param eventBus Optional event bus for error handling
     * @throws StorageError if loading fails
     */
    private loadProgress(eventBus?: EventBus): void {
        if (!browser) return;

        try {
            const progress = LocalStorageManager.loadUserProgress(eventBus);
            if (progress) {
                // Validate loaded data
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
            ErrorHandler.handleError(error as Error, 'Failed to load app data state', eventBus);
            // Provide basic error context without progress data
            throw new StorageError('Failed to load app data state', {
                error,
                hasStats: false,
                hasFavorites: false,
                hasSearches: false
            });
        }
    }

    // Utility methods for enhanced functionality
    /**
     * Clear all user data
     * @param eventBus Optional event bus for error handling
     * @throws StorageError if clearing fails
     */
    /**
     * Clear all user data
     * @param eventBus Optional event bus for error handling
     * @throws StorageError if clearing fails
     */
    async clearAllData(eventBus?: EventBus): Promise<void> {
        try {
            // Clear state with proper typing
            this.practiceStats = new Map();
            this.favorites = [];
            this.recentSearches = [];
            await this.saveProgress(eventBus);

            // Clear vocabulary cache
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('vocabulary-cache');
            }
            LocalStorageManager.clearAllData(eventBus);
        } catch (error) {
            this.handleError(error, 'Failed to clear all user data');
            ErrorHandler.handleError(error as Error, 'Failed to clear all app data', eventBus);
            throw new StorageError('Failed to clear all app data', { error });
        }
    }

    /**
     * Export user data as JSON
     * @param eventBus Optional event bus for error handling
     * @returns JSON string of user data
     * @throws StorageError if export fails
     */
    exportData(eventBus?: EventBus): string {
        try {
            return LocalStorageManager.exportUserData(eventBus);
        } catch (error) {
            this.handleError(error, 'Failed to export user data');
            ErrorHandler.handleError(error as Error, 'Failed to export app data', eventBus);
            throw new StorageError('Failed to export app data', { error });
        }
    }

    /**
     * Import user data from JSON
     * @param jsonData JSON string of user data
     * @param eventBus Optional event bus for error handling
     * @throws StateError if import fails
     */
    /**
     * Import user data from JSON
     * @param jsonData JSON string of user data
     * @param eventBus Optional event bus for error handling
     * @throws StateError if import fails
     */
    importData(jsonData: string, eventBus?: EventBus): void {
        try {
            // Validate input with type guard
            if (typeof jsonData !== 'string' || !jsonData.trim()) {
                throw new Error('Invalid JSON data: must be a non-empty string');
            }

            LocalStorageManager.importUserData(jsonData, eventBus);
            this.loadProgress(eventBus);
        } catch (error) {
            this.handleError(error, 'Failed to import user data');
            ErrorHandler.handleError(error as Error, 'Failed to import app data', eventBus);
            throw new StateError('Failed to import app data', {
                error,
                jsonDataType: typeof jsonData,
                jsonDataLength: jsonData?.length
            });
        }
    }

    /**
     * Initialize the AppDataState
     * @param eventBus Optional event bus for error handling
     * @throws StateError if initialization fails
     */
    init(eventBus?: EventBus) {
        if (browser) {
            try {
                // Load user progress
                this.loadProgress(eventBus);
            } catch (error) {
                this.handleError(error, 'Failed to initialize application data');
                ErrorHandler.handleError(error as Error, 'Failed to initialize AppDataState', eventBus);
                // Re-throw to allow application to handle initialization failure
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

        // Clear error after 5 seconds
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