// tests/unit/appState.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppState } from '$lib/state/app.svelte.ts';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock $app/environment
vi.mock('$app/environment', () => ({
    browser: true
}));

// Mock db
vi.mock('$lib/data/db.svelte', () => {
    const mockItems: VocabularyItem[] = [
        {
            id: 'test_001',
            german: 'Hallo',
            bulgarian: 'Здравей',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A1'
        },
        {
            id: 'test_002',
            german: 'Danke',
            bulgarian: 'Благодаря',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A1'
        },
        {
            id: 'test_003',
            german: 'Auf Wiedersehen',
            bulgarian: 'Довиждане',
            category: 'Greetings',
            tags: ['A1'],
            type: 'word',
            difficulty: 'A2'
        }
    ];
    
    return {
        db: {
            items: mockItems
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
            clearUserData: vi.fn()
        }
    };
});

describe('AppState', () => {
    let appState: AppState;

    beforeEach(() => {
        const localStorageMock = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
            removeItem: vi.fn()
        };
        vi.stubGlobal('localStorage', localStorageMock);
        appState = new AppState();
        appState.init();
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


        it('should handle legacy direction values from localStorage', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('DE->BG');
            const newState = new AppState();
            newState.init();
            expect(newState.languageMode).toBe('DE_BG');

            vi.mocked(localStorage.getItem).mockReturnValue('BG->DE');
            const newState2 = new AppState();
            newState2.init();
            expect(newState2.languageMode).toBe('BG_DE');
        });

        it('should persist direction in localStorage', () => {
            // Clear any previous calls to localStorage.setItem
            vi.mocked(localStorage.setItem).mockClear();

            appState.toggleDirection();
            expect(localStorage.setItem).toHaveBeenCalledWith('app-language-mode', 'BG_DE');

            // Simulate re-initialization
            vi.mocked(localStorage.getItem).mockReturnValue('BG_DE');
            const newState = new AppState();
            newState.init();
            expect(newState.languageMode).toBe('BG_DE');
            expect(newState.displayDirection).toBe('Bulgarian → German');
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
            expect(appState.filteredItems).toHaveLength(3);
        });

        it('should add to recent searches', () => {
            appState.setSearchQuery('Hallo');
            expect(appState.recentSearches).toContain('Hallo');
        });

        it('should not add empty queries to recent searches', () => {
            appState.setSearchQuery('');
            expect(appState.recentSearches).not.toContain('');
        });

        it('should not add duplicate queries to recent searches', () => {
            appState.setSearchQuery('Hallo');
            appState.setSearchQuery('Hallo');
            expect(appState.recentSearches.filter(s => s === 'Hallo')).toHaveLength(1);
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
        it('should handle loading state', () => {
            expect(appState.isLoading).toBe(false);

            appState.isLoading = true;
            expect(appState.isLoading).toBe(true);

            appState.isLoading = false;
            expect(appState.isLoading).toBe(false);
        });

        it('should handle error state', () => {
            expect(appState.error).toBeNull();

            appState.setError('Test error');
            expect(appState.error).toBe('Test error');

            appState.setError(null);
            expect(appState.error).toBeNull();
        });
    });

    describe('Reactivity', () => {
        it('should update derived values when state changes', () => {
            // Test displayDirection reactivity
            expect(appState.displayDirection).toBe('German → Bulgarian');
            appState.toggleDirection();
            expect(appState.displayDirection).toBe('Bulgarian → German');

            // Test filteredItems reactivity
            appState.setSearchQuery('Hallo');
            expect(appState.filteredItems).toHaveLength(1);
            expect(appState.filteredItems[0].german).toBe('Hallo');
            appState.setSearchQuery('');
            expect(appState.filteredItems).toHaveLength(3);
        });
    });

    describe('Persistence', () => {
        it('should load saved language mode from localStorage', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('BG_DE');
            const newState = new AppState();
            newState.init();
            expect(newState.languageMode).toBe('BG_DE');
            expect(newState.displayDirection).toBe('Bulgarian → German');
        });

        it('should handle missing localStorage values gracefully', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);
            const newState = new AppState();
            newState.init();
            expect(newState.languageMode).toBe('DE_BG');
        });
    });

    describe('Enhanced Features', () => {
        describe('Practice Statistics', () => {
            it('should record practice results', async () => {
                const { LocalStorageManager } = await import('$lib/utils/localStorage');
                const mockSaveUserProgress = vi.mocked(LocalStorageManager.saveUserProgress);

                // Wait for the async operation to complete
                await appState.recordPracticeResult('test_001', true, 1000);

                expect(mockSaveUserProgress).toHaveBeenCalled();
                expect(appState.practiceStats.has('test_001')).toBe(true);

                const stats = appState.practiceStats.get('test_001')!;
                expect(stats.correct).toBe(1);
                expect(stats.incorrect).toBe(0);
                expect(stats.lastPracticed).toBeTruthy();
            });

            it('should record incorrect answers', async () => {
                const { LocalStorageManager } = await import('$lib/utils/localStorage');
                const mockSaveUserProgress = vi.mocked(LocalStorageManager.saveUserProgress);

                // Wait for the async operation to complete
                await appState.recordPracticeResult('test_001', false, 1500);

                expect(mockSaveUserProgress).toHaveBeenCalled();
                expect(appState.practiceStats.has('test_001')).toBe(true);

                const stats = appState.practiceStats.get('test_001')!;
                expect(stats.correct).toBe(0);
                expect(stats.incorrect).toBe(1);
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

            it('should limit recommendations to 10 items', () => {
                const recommendations = appState.practiceRecommendations;
                expect(recommendations.length).toBeLessThanOrEqual(10);
            });
        });

        describe('Data Management', () => {
            it('should export user data', async () => {
                const { LocalStorageManager } = await import('$lib/utils/localStorage');
                const mockExportUserData = vi.mocked(LocalStorageManager.exportUserData);
                mockExportUserData.mockReturnValue('{"test": "data"}');
                
                const exported = appState.exportData();
                expect(mockExportUserData).toHaveBeenCalled();
                expect(exported).toBe('{"test": "data"}');
            });

            it('should import user data', async () => {
                const { LocalStorageManager } = await import('$lib/utils/localStorage');
                const mockImportUserData = vi.mocked(LocalStorageManager.importUserData);
                
                appState.importData('{"test": "data"}');
                expect(mockImportUserData).toHaveBeenCalledWith('{"test": "data"}');
            });

            it('should clear all data', () => {
                appState.practiceStats.set('test_001', { correct: 1, incorrect: 0, lastPracticed: new Date().toISOString() });
                appState.favorites = ['test_001'];
                appState.recentSearches = ['test'];

                appState.clearAllData();

                expect(appState.practiceStats.size).toBe(0);
                expect(appState.favorites).toEqual([]);
                expect(appState.recentSearches).toEqual([]);
                expect(localStorage.removeItem).toHaveBeenCalledWith('vocabulary-cache');
            });
        });
    });
});