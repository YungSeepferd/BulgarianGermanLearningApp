import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appState } from '$lib/state/app.svelte';
import { appUIState, appDataState } from '$lib/state/app-state';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true
}));

// Mock the effect to trigger immediately in tests
vi.mock('svelte', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        effect: vi.fn((fn) => fn())
    };
});

// Mock db
vi.mock('$lib/data/db.svelte', () => {
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
            tags: ['A2'], // Changed from A1 to A2 to match the test expectation
            type: 'word',
            difficulty: 2
        }
    ];

    return {
        vocabularyDb: {
            get items() {
                return mockItems;
            }
        }
    };
});

// Mock dataLoader functions
vi.mock('$lib/data/loader', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        updateStats: vi.fn().mockResolvedValue(undefined),
        clearCache: vi.fn()
    };
});

vi.mock('$lib/utils/localStorage', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        LocalStorageManager: {
            saveUserProgress: vi.fn(),
            loadUserProgress: vi.fn().mockReturnValue({
                stats: new Map(),
                favorites: [],
                recentSearches: []
            }),
            exportUserData: vi.fn(),
            importUserData: vi.fn(),
            clearUserData: vi.fn(),
            clearAllData: vi.fn()
        }
    };
});

describe('AppState', () => {
    beforeEach(() => {
        const localStorageMock = {
            getItem: vi.fn().mockReturnValue(null), // Default to null
            setItem: vi.fn(),
            clear: vi.fn(),
            removeItem: vi.fn()
        };
        vi.stubGlobal('localStorage', localStorageMock);

        // Reset the state instances by using the appState methods
        appState.setError(null);
        appState.setSearchQuery('');
        appState.setCurrentItem(null);
        if (appState.practiceMode) {
            appState.togglePracticeMode();
        }

        // Reset data state using appState methods
        appState.clearAllData();

        // Reset language mode to default using public API
        if (appState.languageMode !== 'DE_BG') {
            appState.toggleDirection();
        }

        // Re-initialize the state instances to ensure they pick up the mock data
        // Note: We don't call init() here because it's already called when the modules are imported
        // and calling it again would cause issues with the test environment
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
            expect(appState.filteredItems).toHaveLength(3); // Should have all test items
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
            // Clear any previous calls to localStorage.setItem
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
            appState.setSearchQuery('Greetings');
            expect(appState.filteredItems).toHaveLength(3);
        });

        it('should search by tags', () => {
            appState.setSearchQuery('A1');
            // Should match 2 items (test_001 and test_002) since test_003 has A2
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
                const { LocalStorageManager } = await import('$lib/utils/localStorage');
                const mockSaveUserProgress = vi.mocked(LocalStorageManager.saveUserProgress);

                await appState.recordPracticeResult('test_001', true, 1000);

                expect(mockSaveUserProgress).toHaveBeenCalled();
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
                // Add some practice stats to test recommendations
                appState.practiceStats.set('test_001', { correct: 2, incorrect: 0, lastPracticed: new Date().toISOString() });
                appState.practiceStats.set('test_002', { correct: 0, incorrect: 3, lastPracticed: new Date().toISOString() });

                const recommendations = appState.practiceRecommendations;

                // Should recommend items that need more practice
                expect(recommendations.length).toBeGreaterThan(0);
                expect(recommendations.some(item => item.id === 'test_002')).toBe(true);
            });
        });

        describe('Data Management', () => {
            it('should clear all data', () => {
                appDataState.practiceStats.set('test_001', { correct: 1, incorrect: 0, lastPracticed: new Date().toISOString() });
                appDataState.favorites = ['test_001'];
                appDataState.recentSearches = ['test'];

                appState.clearAllData();

                expect(appState.practiceStats.size).toBe(0);
                expect(appState.favorites).toEqual([]);
                expect(appState.recentSearches).toEqual([]);
                expect(localStorage.removeItem).toHaveBeenCalledWith('vocabulary-cache');
            });
        });
    });
});