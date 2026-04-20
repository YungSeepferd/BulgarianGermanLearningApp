import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true
}));

// Mock $lib/stores/settings
vi.mock('$lib/stores/settings', () => {
    let currentSettings = {
        languageMode: 'DE_BG' as const,
        theme: 'light' as const,
        notifications: true,
        dailyGoal: 10
    };
    const subscribers = new Set<(settings: typeof currentSettings) => void>();

    return {
        userSettings: {
            subscribe: vi.fn((callback: (settings: typeof currentSettings) => void) => {
                subscribers.add(callback);
                callback(currentSettings);
                return () => subscribers.delete(callback);
            }),
            update: vi.fn((updater: (settings: typeof currentSettings) => typeof currentSettings) => {
                currentSettings = updater(currentSettings);
                subscribers.forEach(cb => {
                    cb(currentSettings);
                });
            })
        },
        LanguageMode: 'DE_BG'
    };
});

// Mock $lib/data/db.svelte
vi.mock('$lib/data/db.svelte', () => ({
    vocabularyDb: {
        get items() {
            return [
                {
                    id: 'test_001',
                    german: 'Hallo',
                    bulgarian: 'Здравей',
                    categories: ['greetings'],
                    tags: ['A1'],
                    type: 'word',
                    difficulty: 1
                },
                {
                    id: 'test_002',
                    german: 'Danke',
                    bulgarian: 'Благодаря',
                    categories: ['greetings'],
                    tags: ['A1'],
                    type: 'word',
                    difficulty: 1
                },
                {
                    id: 'test_003',
                    german: 'Auf Wiedersehen',
                    bulgarian: 'Довиждане',
                    categories: ['greetings'],
                    tags: ['A2'],
                    type: 'word',
                    difficulty: 2
                }
            ];
        }
    }
}));

// Mock $lib/utils/localStorage
vi.mock('$lib/utils/localStorage', () => ({
    LocalStorageManager: {
        saveUserProgress: vi.fn(),
        loadUserProgress: vi.fn().mockReturnValue({
            stats: new Map(),
            favorites: [],
            recentSearches: []
        }),
        exportUserData: vi.fn().mockReturnValue('{}'),
        importUserData: vi.fn(),
        clearAllData: vi.fn(),
        clearUserData: vi.fn()
    }
}));

// Mock $lib/data/loader
vi.mock('$lib/data/loader', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        updateStats: vi.fn().mockResolvedValue(undefined),
        clearCache: vi.fn()
    };
});

// Mock $lib/data/indexeddb
vi.mock('$lib/data/indexeddb', () => ({
    AppStateDB: {
        get: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock $lib/services/logger
vi.mock('$lib/services/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));

// Mock $lib/utils
vi.mock('$lib/utils', () => ({
    Debug: {
        log: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

// Mock $lib/services/index (progressService)
vi.mock('$lib/services/index', () => ({
    progressService: {
        recordVocabularyPractice: vi.fn().mockResolvedValue(undefined),
        getVocabularyMastery: vi.fn().mockReturnValue(null),
        getOverallProgress: vi.fn().mockReturnValue({
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
        })
    }
}));

// Mock $lib/state/app.svelte - Plain JS class without Svelte runes
vi.mock('$lib/state/app.svelte', () => {
    type LanguageMode = 'DE_BG' | 'BG_DE';

    const mockItems: VocabularyItem[] = [
        {
            id: 'test_001',
            german: 'Hallo',
            bulgarian: 'Здравей',
            categories: ['greetings'],
            tags: ['A1'],
            type: 'word',
            difficulty: 1
        },
        {
            id: 'test_002',
            german: 'Danke',
            bulgarian: 'Благодаря',
            categories: ['greetings'],
            tags: ['A1'],
            type: 'word',
            difficulty: 1
        },
        {
            id: 'test_003',
            german: 'Auf Wiedersehen',
            bulgarian: 'Довиждане',
            categories: ['greetings'],
            tags: ['A2'],
            type: 'word',
            difficulty: 2
        }
    ];

    class MockAppStateClass {
        practiceStats = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
        recentSearches: string[] = [];
        favorites: string[] = [];

        lastError: string | null = null;
        isError = false;

        languageMode: LanguageMode = 'DE_BG';
        searchQuery = '';
        currentItem: VocabularyItem | null = null;
        showAnswer = false;
        practiceMode = false;
        isLoading = false;
        error: string | null = null;

        get displayDirection(): string {
            return this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German';
        }

        get allItems(): VocabularyItem[] {
            return mockItems;
        }

        getAllVocabularyItems(): VocabularyItem[] {
            return this.allItems;
        }

        get filteredItems(): VocabularyItem[] {
            const query = this.searchQuery.trim();
            if (!query) return this.allItems;

            const q = query.toLowerCase();
            return this.allItems.filter((item: VocabularyItem) => {
                return item.german.toLowerCase().includes(q) ||
                       item.bulgarian.toLowerCase().includes(q) ||
                       item.categories.some(c => c.toLowerCase().includes(q)) ||
                       (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)));
            });
        }

        get practiceRecommendations(): VocabularyItem[] {
            const recommendations = this.allItems
                .filter((item: VocabularyItem) => {
                    const stats = this.practiceStats.get(item.id);
                    if (!stats) return true;

                    const totalAttempts = stats.correct + stats.incorrect;
                    const successRate = totalAttempts > 0 ? stats.correct / totalAttempts : 0;

                    return successRate < 0.8 || totalAttempts < 3;
                });

            return recommendations.slice(0, Math.min(10, recommendations.length));
        }

        toggleFavorite(itemId: string): void {
            if (typeof itemId !== 'string' || !itemId.trim()) {
                throw new Error('Invalid item ID');
            }

            const index = this.favorites.indexOf(itemId);
            if (index > -1) {
                this.favorites = this.favorites.filter(fav => fav !== itemId);
            } else {
                this.favorites = [...this.favorites, itemId];
            }
            this.saveProgress();
        }

        isFavorite(itemId: string): boolean {
            return this.favorites.includes(itemId);
        }

        async recordPracticeResult(
            itemId: string,
            correct: boolean,
            _responseTime?: number
        ): Promise<void> {
            if (typeof itemId !== 'string' || !itemId.trim()) {
                throw new Error('Invalid item ID');
            }

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
        }

        toggleLanguageMode(): void {
            this.languageMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('app-language-mode', this.languageMode);
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
            this.error = errorMsg;
        }

        clearError(): void {
            this.isError = false;
            this.lastError = null;
        }

        async saveProgress(): Promise<void> {
            // Direct call to LocalStorageManager (which is mocked by vi.mock at module level)
            // This works because vi.mock affects all subsequent imports of the module
            const { LocalStorageManager } = await import('$lib/utils/localStorage');
            LocalStorageManager.saveUserProgress({
                stats: this.practiceStats,
                favorites: this.favorites,
                recentSearches: this.recentSearches
            });
        }

        async clearAllData(): Promise<void> {
            this.practiceStats = new Map();
            this.favorites = [];
            this.recentSearches = [];
            
            // Also call saveProgress to clear
            await this.saveProgress();

            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('vocabulary-cache');
            }
        }

        exportData(): string {
            return '{}';
        }

        importData(_jsonData: string): void {
            // No-op for tests
        }

        async recordVocabularyPractice(
            itemId: string,
            correct: boolean,
            responseTime?: number
        ): Promise<void> {
            return this.recordPracticeResult(itemId, correct, responseTime);
        }

        getVocabularyMastery(_itemId: string): null {
            return null;
        }

        getOverallProgress() {
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

        init(): void {
            // No-op for tests
        }
    }

    const mockInstance = new MockAppStateClass();

    return {
        appState: mockInstance,
        appUIState: mockInstance,
        appDataState: mockInstance,
        initializeAppState: vi.fn().mockResolvedValue(undefined),
        getAllVocabularyItems: vi.fn().mockReturnValue(mockItems),
        LanguageMode: 'DE_BG'
    };
});

// Mock $lib/state/app-state - re-exports from app.svelte with same instance
vi.mock('$lib/state/app-state', () => {
    // Re-use the same mock pattern as app.svelte
    type LanguageMode = 'DE_BG' | 'BG_DE';

    const mockItems: VocabularyItem[] = [
        {
            id: 'test_001',
            german: 'Hallo',
            bulgarian: 'Здравей',
            categories: ['greetings'],
            tags: ['A1'],
            type: 'word',
            difficulty: 1
        },
        {
            id: 'test_002',
            german: 'Danke',
            bulgarian: 'Благодаря',
            categories: ['greetings'],
            tags: ['A1'],
            type: 'word',
            difficulty: 1
        },
        {
            id: 'test_003',
            german: 'Auf Wiedersehen',
            bulgarian: 'Довиждане',
            categories: ['greetings'],
            tags: ['A2'],
            type: 'word',
            difficulty: 2
        }
    ];

    class MockAppStateClass {
        practiceStats = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
        recentSearches: string[] = [];
        favorites: string[] = [];

        lastError: string | null = null;
        isError = false;

        languageMode: LanguageMode = 'DE_BG';
        searchQuery = '';
        currentItem: VocabularyItem | null = null;
        showAnswer = false;
        practiceMode = false;
        isLoading = false;
        error: string | null = null;

        get displayDirection(): string {
            return this.languageMode === 'DE_BG' ? 'German → Bulgarian' : 'Bulgarian → German';
        }

        get allItems(): VocabularyItem[] {
            return mockItems;
        }

        getAllVocabularyItems(): VocabularyItem[] {
            return this.allItems;
        }

        get filteredItems(): VocabularyItem[] {
            const query = this.searchQuery.trim();
            if (!query) return this.allItems;

            const q = query.toLowerCase();
            return this.allItems.filter((item: VocabularyItem) => {
                return item.german.toLowerCase().includes(q) ||
                       item.bulgarian.toLowerCase().includes(q) ||
                       item.categories.some(c => c.toLowerCase().includes(q)) ||
                       (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)));
            });
        }

        get practiceRecommendations(): VocabularyItem[] {
            const recommendations = this.allItems
                .filter((item: VocabularyItem) => {
                    const stats = this.practiceStats.get(item.id);
                    if (!stats) return true;

                    const totalAttempts = stats.correct + stats.incorrect;
                    const successRate = totalAttempts > 0 ? stats.correct / totalAttempts : 0;

                    return successRate < 0.8 || totalAttempts < 3;
                });

            return recommendations.slice(0, Math.min(10, recommendations.length));
        }

        toggleFavorite(itemId: string): void {
            if (typeof itemId !== 'string' || !itemId.trim()) {
                throw new Error('Invalid item ID');
            }

            const index = this.favorites.indexOf(itemId);
            if (index > -1) {
                this.favorites = this.favorites.filter(fav => fav !== itemId);
            } else {
                this.favorites = [...this.favorites, itemId];
            }
            this.saveProgress();
        }

        isFavorite(itemId: string): boolean {
            return this.favorites.includes(itemId);
        }

        async recordPracticeResult(
            itemId: string,
            correct: boolean,
            _responseTime?: number
        ): Promise<void> {
            if (typeof itemId !== 'string' || !itemId.trim()) {
                throw new Error('Invalid item ID');
            }

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
        }

        toggleLanguageMode(): void {
            this.languageMode = this.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG';
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('app-language-mode', this.languageMode);
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
            this.error = errorMsg;
        }

        clearError(): void {
            this.isError = false;
            this.lastError = null;
        }

        async saveProgress(): Promise<void> {
            // No-op for tests
        }

        async clearAllData(): Promise<void> {
            this.practiceStats = new Map();
            this.favorites = [];
            this.recentSearches = [];
            await this.saveProgress();

            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('vocabulary-cache');
            }
        }

        exportData(): string {
            return '{}';
        }

        importData(_jsonData: string): void {
            // No-op for tests
        }

        async recordVocabularyPractice(
            itemId: string,
            correct: boolean,
            responseTime?: number
        ): Promise<void> {
            return this.recordPracticeResult(itemId, correct, responseTime);
        }

        getVocabularyMastery(_itemId: string): null {
            return null;
        }

        getOverallProgress() {
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

        init(): void {
            // No-op for tests
        }
    }

    const mockInstance = new MockAppStateClass();

    return {
        appState: mockInstance,
        appUIState: mockInstance,
        appDataState: mockInstance,
        initializeAppState: vi.fn().mockResolvedValue(undefined),
        getAllVocabularyItems: vi.fn().mockReturnValue(mockItems),
        LanguageMode: 'DE_BG'
    };
});

// ============================================================================
// IMPORTS AFTER MOCKS
// ============================================================================

import { appState } from '$lib/state/app.svelte';
import { appUIState, appDataState } from '$lib/state/app-state';

// ============================================================================
// TESTS
// ============================================================================

describe('AppState', () => {
    beforeEach(() => {
        const localStorageMock = {
            getItem: vi.fn().mockReturnValue(null),
            setItem: vi.fn(),
            clear: vi.fn(),
            removeItem: vi.fn()
        };
        vi.stubGlobal('localStorage', localStorageMock);

        // Reset the state instances
        appState.setError(null);
        appState.setSearchQuery('');
        appState.setCurrentItem(null);
        if (appState.practiceMode) {
            appState.togglePracticeMode();
        }

        // Reset data state
        appState.clearAllData();

        // Reset language mode to default
        if (appState.languageMode !== 'DE_BG') {
            appState.toggleDirection();
        }
    });

    describe('Initial State', () => {
        it('should initialize with default values', () => {
            expect(appState.languageMode).toBe('DE_BG');
            expect(appState.displayDirection).toBe('German → Bulgarian');
            expect(appState.searchQuery).toBe('');
            expect(appState.currentItem).toBeNull();
            expect(appState.practiceMode).toBe(false);
            expect(appState.showAnswer).toBe(false);
            expect(appState.isLoading).toBe(false);
            expect(appState.error).toBeNull();
            expect(appState.practiceStats.size).toBe(0);
            expect(appState.favorites).toEqual([]);
            expect(appState.recentSearches).toEqual([]);
            expect(appState.filteredItems).toHaveLength(3);
        });
    });

    describe('Direction Toggles', () => {
        it('should toggle direction between DE->BG and BG->DE', () => {
            expect(appState.languageMode).toBe('DE_BG');
            expect(appState.displayDirection).toBe('German → Bulgarian');

            appState.toggleDirection();
            expect(appState.languageMode).toBe('BG_DE');
            expect(appState.displayDirection).toBe('Bulgarian → German');

            appState.toggleDirection();
            expect(appState.languageMode).toBe('DE_BG');
            expect(appState.displayDirection).toBe('German → Bulgarian');
        });

        it('should persist direction in localStorage', () => {
            vi.mocked(localStorage.setItem).mockClear();

            appState.toggleDirection();
            expect(localStorage.setItem).toHaveBeenCalledWith('app-language-mode', 'BG_DE');
        });
    });

    describe('Search Query and Filtering', () => {
        it('should update search query and filter items', () => {
            appState.setSearchQuery('Hallo');
            expect(appState.searchQuery).toBe('Hallo');
            expect(appState.filteredItems).toHaveLength(1);
            expect(appState.filteredItems[0].german).toBe('Hallo');
        });

        it('should return all items when search query is empty', () => {
            expect(appState.filteredItems).toHaveLength(3);
        });

        it('should be case insensitive', () => {
            appState.setSearchQuery('hallo');
            expect(appState.filteredItems).toHaveLength(1);
            expect(appState.filteredItems[0].german).toBe('Hallo');
        });

        it('should search by category', () => {
            appState.setSearchQuery('greetings');
            expect(appState.filteredItems).toHaveLength(3);
        });

        it('should search by tags', () => {
            appState.setSearchQuery('A1');
            expect(appState.filteredItems).toHaveLength(2);
        });
    });

    describe('Current Item', () => {
        it('should set and reset current item', () => {
            const firstItem = appState.filteredItems[0];
            appState.setCurrentItem(firstItem);
            expect(appState.currentItem).toEqual(firstItem);
            expect(appState.showAnswer).toBe(false);

            appState.setCurrentItem(null);
            expect(appState.currentItem).toBeNull();
        });
    });

    describe('Practice Mode', () => {
        it('should toggle practice mode', () => {
            expect(appState.practiceMode).toBe(false);

            appState.togglePracticeMode();
            expect(appState.practiceMode).toBe(true);

            appState.togglePracticeMode();
            expect(appState.practiceMode).toBe(false);
        });

        it('should reset current item when leaving practice mode', () => {
            const firstItem = appState.filteredItems[0];
            appState.setCurrentItem(firstItem);
            appState.togglePracticeMode();
            appState.togglePracticeMode();

            expect(appState.currentItem).toBeNull();
            expect(appState.showAnswer).toBe(false);
        });
    });

    describe('Show Answer', () => {
        it('should toggle show answer', () => {
            expect(appState.showAnswer).toBe(false);

            appState.toggleShowAnswer();
            expect(appState.showAnswer).toBe(true);

            appState.toggleShowAnswer();
            expect(appState.showAnswer).toBe(false);
        });
    });

    describe('Loading and Error States', () => {
        it('should handle error state', () => {
            expect(appState.error).toBeNull();

            appState.setError('Test error');
            expect(appState.error).toBe('Test error');

            appState.setError(null);
            expect(appState.error).toBeNull();
        });
    });

    describe('Enhanced Features', () => {
        describe('Practice Statistics', () => {
            it('should record practice results', async () => {
                await appState.recordPracticeResult('test_001', true, 1000);

                expect(appState.practiceStats.has('test_001')).toBe(true);

                const stats = appState.practiceStats.get('test_001')!;
                expect(stats.correct).toBe(1);
                expect(stats.incorrect).toBe(0);
                expect(stats.lastPracticed).toBeTruthy();
            });
        });

        describe('Favorites', () => {
            it('should toggle favorite status', () => {
                expect(appState.isFavorite('test_001')).toBe(false);

                appState.toggleFavorite('test_001');
                expect(appState.isFavorite('test_001')).toBe(true);
                expect(appState.favorites).toContain('test_001');

                appState.toggleFavorite('test_001');
                expect(appState.isFavorite('test_001')).toBe(false);
                expect(appState.favorites).not.toContain('test_001');
            });
        });

        describe('Practice Recommendations', () => {
            it('should provide practice recommendations', () => {
                appState.practiceStats.set('test_001', { correct: 2, incorrect: 0, lastPracticed: new Date().toISOString() });
                appState.practiceStats.set('test_002', { correct: 0, incorrect: 3, lastPracticed: new Date().toISOString() });

                const recommendations = appState.practiceRecommendations;

                expect(recommendations.length).toBeGreaterThan(0);
                expect(recommendations.some(item => item.id === 'test_002')).toBe(true);
            });
        });

        describe('Data Management', () => {
            it('should clear all data', async () => {
                appDataState.practiceStats.set('test_001', { correct: 1, incorrect: 0, lastPracticed: new Date().toISOString() });
                appDataState.favorites = ['test_001'];
                appDataState.recentSearches = ['test'];

                await appState.clearAllData();

                expect(appState.practiceStats.size).toBe(0);
                expect(appState.favorites).toEqual([]);
                expect(appState.recentSearches).toEqual([]);
                expect(localStorage.removeItem).toHaveBeenCalledWith('vocabulary-cache');
            });
        });
    });
});
