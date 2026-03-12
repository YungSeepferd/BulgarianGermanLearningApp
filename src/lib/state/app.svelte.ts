/**
 * App State Module - Svelte 5 Runes-Based State Management
 *
 * This module provides module-level reactive state using Svelte 5 runes.
 * Uses a class with $state() fields for proper reactivity.
 *
 * Uses IndexedDB (via Dexie) for storage with localStorage fallback.
 */

import { browser } from '$app/environment';
import { vocabularyDb } from '$lib/data/db.svelte';
import { LocalStorageManager } from '$lib/utils/localStorage';
import { Debug } from '$lib/utils';
import { userSettings, type LanguageMode, type UserSettings } from '$lib/stores/settings';
import { progressService } from '$lib/services/index';
import { ErrorHandler, StateError, StorageError } from '$lib/services/errors';
import type { VocabularyItem } from '$lib/types/vocabulary';
import type { VocabularyMastery, OverallProgress } from '$lib/schemas/progress';
import { AppStateDB } from '$lib/data/indexeddb';

// ============================================================================
// STATE CLASS - Using Svelte 5 $state() fields
// ============================================================================

class AppStateClass {
    // Data State - $state() fields
    practiceStats = $state<Map<string, { correct: number; incorrect: number; lastPracticed: string }>>(new Map());
    recentSearches = $state<string[]>([]);
    favorites = $state<string[]>([]);
    
    // Error state
    lastError = $state<string | null>(null);
    isError = $state<boolean>(false);

    // UI State - $state() fields
    languageMode = $state<LanguageMode>('DE_BG');
    searchQuery = $state('');
    currentItem = $state<VocabularyItem | null>(null);
    showAnswer = $state(false);
    practiceMode = $state(false);
    isLoading = $state(false);
    error = $state<string | null>(null);

    // Derived state - $derived()
    displayDirection = $derived(
        this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German'
    );

    get allItems(): VocabularyItem[] {
        return vocabularyDb.items;
    }

    /**
     * Get all vocabulary items - for backward compatibility
     */
    getAllVocabularyItems(): VocabularyItem[] {
        return this.allItems;
    }

    // Derived state for filtered items
    filteredItems = $derived.by(() => {
        const query = this.searchQuery.trim();
        if (!query) return this.allItems;

        const q = query.toLowerCase();
        return this.allItems.filter((item: VocabularyItem) => {
            return item.german.toLowerCase().includes(q) ||
                   item.bulgarian.toLowerCase().includes(q) ||
                   item.categories.some(c => c.toLowerCase().includes(q)) ||
                   (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)));
        });
    });

    // Derived state for practice recommendations
    practiceRecommendations = $derived.by(() => {
        const recommendations = this.allItems
            .filter((item: VocabularyItem) => {
                const stats = this.practiceStats.get(item.id);
                if (!stats) return true;

                const totalAttempts = stats.correct + stats.incorrect;
                const successRate = totalAttempts > 0 ? stats.correct / totalAttempts : 0;

                return successRate < 0.8 || totalAttempts < 3;
            });

        return recommendations.slice(0, Math.min(10, recommendations.length));
    });

    // ========================================================================
    // DATA STATE METHODS
    // ========================================================================

    toggleFavorite(itemId: string): void {
        Debug.log('AppState', 'Toggling favorite', { itemId });
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

    async recordPracticeResult(
        itemId: string,
        correct: boolean,
        responseTime?: number
    ): Promise<void> {
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

    // ========================================================================
    // UI STATE METHODS
    // ========================================================================

    toggleLanguageMode(): void {
        const newMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
        this.languageMode = newMode;

        userSettings.update((settings: UserSettings) => ({
            ...settings,
            languageMode: newMode
        }));

        if (browser) {
            try {
                import('../services/localization').then(({ LocalizationService }) => {
                    LocalizationService.notifyLanguageChange();
                });
            } catch (error) {
                console.error('Failed to notify language change:', error);
            }
        }
    }

    toggleDirection(): void {
        this.toggleLanguageMode();
    }

    setSearchQuery(query: string): void {
        this.searchQuery = query;

        if (query.trim() && !this.recentSearches.includes(query)) {
            this.recentSearches = [query, ...this.recentSearches.slice(0, 9)];
        }
    }

    setCurrentItem(item: VocabularyItem | null): void {
        this.currentItem = item;
        this.showAnswer = false;
    }

    togglePracticeMode(): void {
        this.practiceMode = !this.practiceMode;
        if (!this.practiceMode) {
            this.setCurrentItem(null);
        }
    }

    startPracticeSession(item: VocabularyItem): void {
        this.practiceMode = true;
        this.setCurrentItem(item);
        this.showAnswer = false;
        this.searchQuery = '';
    }

    toggleShowAnswer(): void {
        this.showAnswer = !this.showAnswer;
    }

    setError(errorMsg: string | null): void {
        Debug.log('AppState', 'Setting error', { error: errorMsg });
        this.error = errorMsg;
    }

    // ========================================================================
    // STORAGE METHODS
    // ========================================================================

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

            // Convert Map to object for storage
            const statsObject: Record<string, { correct: number; incorrect: number; lastPracticed: string }> = {};
            this.practiceStats.forEach((value, key) => {
                statsObject[key] = value;
            });

            // Try IndexedDB first
            try {
                await AppStateDB.save({
                    practiceStats: statsObject,
                    favorites: this.favorites,
                    recentSearches: this.recentSearches
                });
                Debug.log('AppState', 'Saved to IndexedDB');
            } catch (e) {
                Debug.log('AppState', 'Failed to save to IndexedDB, using localStorage fallback', { error: e });
                // Fallback to localStorage
                LocalStorageManager.saveUserProgress({
                    stats: this.practiceStats,
                    favorites: this.favorites,
                    recentSearches: this.recentSearches
                });
            }
        } catch (error) {
            this.handleError(error, 'Failed to save progress data');
            ErrorHandler.handleError(error as Error, 'Failed to save app state', undefined);
            throw new StorageError('Failed to save app state', {
                error,
                statsType: typeof this.practiceStats,
                favoritesType: typeof this.favorites,
                searchesType: typeof this.recentSearches
            });
        }
    }

    private async loadProgress(): Promise<void> {
        if (!browser) return;

        try {
            // Try IndexedDB first
            try {
                const indexedDBState = await AppStateDB.get();
                if (indexedDBState) {
                    if (indexedDBState.practiceStats && typeof indexedDBState.practiceStats === 'object') {
                        this.practiceStats = new Map(Object.entries(indexedDBState.practiceStats));
                    } else {
                        this.practiceStats = new Map();
                    }

                    this.favorites = Array.isArray(indexedDBState.favorites) ? indexedDBState.favorites : [];
                    this.recentSearches = Array.isArray(indexedDBState.recentSearches) ? indexedDBState.recentSearches : [];
                    Debug.log('AppState', 'Loaded from IndexedDB');
                    return;
                }
            } catch (e) {
                Debug.log('AppState', 'IndexedDB read error, trying localStorage', { error: e });
            }

            // Fallback to localStorage
            const progress = LocalStorageManager.loadUserProgress(undefined);
            if (progress) {
                if (progress.stats && typeof progress.stats === 'object') {
                    this.practiceStats = new Map(Object.entries(progress.stats));
                } else {
                    this.practiceStats = new Map();
                }

                this.favorites = Array.isArray(progress.favorites) ? progress.favorites : [];
                this.recentSearches = Array.isArray(progress.recentSearches) ? progress.recentSearches : [];

                // Migrate to IndexedDB
                try {
                    await this.saveProgress();
                } catch (e) {
                    Debug.log('AppState', 'Failed to migrate to IndexedDB', { error: e });
                }
            }
        } catch (error) {
            this.handleError(error, 'Failed to load progress data');
            ErrorHandler.handleError(error as Error, 'Failed to load app state', undefined);
            throw new StorageError('Failed to load app state', {
                error,
                hasStats: false,
                hasFavorites: false,
                hasSearches: false
            });
        }
    }

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

    exportData(): string {
        try {
            return LocalStorageManager.exportUserData(undefined);
        } catch (error) {
            this.handleError(error, 'Failed to export user data');
            ErrorHandler.handleError(error as Error, 'Failed to export app data', undefined);
            throw new StorageError('Failed to export app data', { error });
        }
    }

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

    // ========================================================================
    // PROGRESS SERVICE METHODS
    // ========================================================================

    async recordVocabularyPractice(
        itemId: string,
        correct: boolean,
        responseTime?: number
    ): Promise<void> {
        try {
            const svc = progressService;
            await svc.recordVocabularyPractice(itemId, correct, responseTime);
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.recordVocabularyPractice', undefined);
            return this.recordPracticeResult(itemId, correct, responseTime);
        }
    }

    getVocabularyMastery(itemId: string): VocabularyMastery | null {
        try {
            const svc = progressService;
            return svc.getVocabularyMastery(itemId);
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.getVocabularyMastery', undefined);
            return null;
        }
    }

    getOverallProgress(): OverallProgress {
        try {
            const svc = progressService;
            return svc.getOverallProgress();
        } catch (error) {
            ErrorHandler.handleError(error as Error, 'AppState.getOverallProgress', undefined);
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

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    private handleError(error: unknown, context: string): void {
        this.isError = true;
        this.lastError = `${context}: ${error instanceof Error ? error.message : String(error)}`;

        setTimeout(() => {
            this.isError = false;
            this.lastError = null;
        }, 5000);
    }

    clearError(): void {
        this.isError = false;
        this.lastError = null;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    async init(): Promise<void> {
        if (browser) {
            await this.loadProgress();

            let initialMode: LanguageMode = 'DE_BG';

            const oldSaved = localStorage.getItem('tandem-direction');
            const oldLanguageMode = localStorage.getItem('app-language-mode');

            if (oldSaved === 'DE->BG') {
                initialMode = 'DE_BG';
                localStorage.removeItem('tandem-direction');
            } else if (oldSaved === 'BG->DE') {
                initialMode = 'BG_DE';
                localStorage.removeItem('tandem-direction');
            } else if (oldLanguageMode === 'DE_BG' || oldLanguageMode === 'BG_DE') {
                initialMode = oldLanguageMode as LanguageMode;
                userSettings.update((s: UserSettings) => ({ ...s, languageMode: initialMode }));
                localStorage.removeItem('app-language-mode');
            }

            this.languageMode = initialMode;

            userSettings.update((settings: UserSettings) => {
                if (settings.languageMode !== initialMode) {
                    return { ...settings, languageMode: initialMode };
                }
                return settings;
            });

            userSettings.subscribe((settings: UserSettings) => {
                if (settings.languageMode !== this.languageMode) {
                    this.languageMode = settings.languageMode;
                }
            });
        }
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const appState = new AppStateClass();

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

// Re-export for backward compatibility
export type { LanguageMode } from '$lib/stores/settings';

// Legacy exports for components that import from app-state.ts
export const appUIState = appState;
export const appDataState = appState;

// Export initialization function
export async function initializeAppState(): Promise<void> {
    try {
        await appState.init();
    } catch (error) {
        console.error('Failed to initialize app state:', error);
        throw error;
    }
}

// Export getAllVocabularyItems for backward compatibility
export function getAllVocabularyItems(): VocabularyItem[] {
    return appState.allItems;
}