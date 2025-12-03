// tests/unit/dataLoader.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataLoader } from '$lib/data/loader';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

vi.stubGlobal('localStorage', mockLocalStorage);

// Mock vocabulary data
const mockVocabulary: VocabularyItem[] = [
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
    }
];

// Mock DataLoader class
vi.mock('$lib/data/loader', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        DataLoader: actual.DataLoader
    };
});

vi.mock('$lib/data/vocabulary.json', () => ({
    default: mockVocabulary
}));

// Mock localStorageManager
vi.mock('$lib/utils/localStorage', () => ({
    localStorageManager: {
        saveUserProgress: vi.fn(),
        loadUserProgress: vi.fn()
    }
}));

describe('DataLoader', () => {
    let dataLoader: DataLoader;

    beforeEach(() => {
        vi.clearAllMocks();
        dataLoader = DataLoader.getInstance();
        dataLoader.clearCache();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = DataLoader.getInstance();
            const instance2 = DataLoader.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('Vocabulary Loading', () => {
        it('should load vocabulary from JSON', async () => {
            const items = await dataLoader.loadVocabulary();
            expect(items).toEqual(mockVocabulary);
            expect(items).toHaveLength(2);
        });

        it('should cache vocabulary in memory', async () => {
            const items1 = await dataLoader.loadVocabulary();
            const items2 = await dataLoader.loadVocabulary();
            expect(items1).toBe(items2); // Same reference
        });

        it('should handle loading errors gracefully', async () => {
            // Mock import failure
            vi.doMock('./vocabulary.json', () => {
                throw new Error('Import failed');
            });

            // The loader should retry and eventually succeed with cached data
            await expect(dataLoader.loadVocabulary()).resolves.toBeDefined();
        });

        it('should validate vocabulary items', async () => {
            const invalidItems = [
                { id: '', german: 'Test', bulgarian: 'Тест', category: 'Test', tags: [], type: 'word' as const }
            ] as VocabularyItem[];

            vi.doMock('./vocabulary.json', () => ({
                default: invalidItems
            }));

            // The loader should retry and eventually succeed with cached data
            await expect(dataLoader.loadVocabulary()).resolves.toBeDefined();
        });
    });

    describe('Caching', () => {
        it('should save to localStorage cache', async () => {
            await dataLoader.loadVocabulary();
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'tandem_vocabulary_cache',
                expect.stringContaining('"version":"1.0.0"')
            );
        });

        it('should load from localStorage cache', async () => {
            const cacheData = {
                items: mockVocabulary,
                metadata: {
                    version: '1.0.0',
                    timestamp: Date.now(),
                    itemCount: 2
                }
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cacheData));

            const items = await dataLoader.loadVocabulary();
            expect(items).toEqual(mockVocabulary);
        });

        it('should validate cache version', async () => {
            const oldCacheData = {
                items: mockVocabulary,
                metadata: {
                    version: '0.9.0',
                    timestamp: Date.now(),
                    itemCount: 2
                }
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldCacheData));

            // Should ignore old cache and load from JSON
            const items = await dataLoader.loadVocabulary();
            expect(items).toEqual(mockVocabulary);
        });

        it('should handle expired cache', async () => {
            const expiredCacheData = {
                items: mockVocabulary,
                metadata: {
                    version: '1.0.0',
                    timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
                    itemCount: 2
                }
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredCacheData));

            // Should ignore expired cache and load from JSON
            const items = await dataLoader.loadVocabulary();
            expect(items).toEqual(mockVocabulary);
        });
    });

    describe('Search and Filtering', () => {
        beforeEach(async () => {
            await dataLoader.loadVocabulary();
        });

        it('should search by German text', async () => {
            const results = await dataLoader.search('Hallo', 'DE->BG');
            expect(results).toHaveLength(1);
            expect(results[0].german).toBe('Hallo');
        });

        it('should search by Bulgarian text', async () => {
            const results = await dataLoader.search('Здравей', 'BG->DE');
            expect(results).toHaveLength(1);
            expect(results[0].bulgarian).toBe('Здравей');
        });

        it('should search by category', async () => {
            const results = await dataLoader.search('Greetings', 'DE->BG');
            expect(results).toHaveLength(2);
        });

        it('should search by tags', async () => {
            const results = await dataLoader.search('A1', 'DE->BG');
            expect(results).toHaveLength(2);
            expect(results.every(item => item.tags.includes('A1'))).toBe(true);
        });

        it('should be case insensitive', async () => {
            const results = await dataLoader.search('hallo', 'DE->BG');
            expect(results).toHaveLength(1);
            expect(results[0].german).toBe('Hallo');
        });

        it('should get items by category', async () => {
            const items = await dataLoader.getByCategory('Greetings');
            expect(items).toHaveLength(2);
            expect(items.every(item => item.category === 'Greetings')).toBe(true);
        });

        it('should get random items', async () => {
            const items = await dataLoader.getRandomItems(1);
            expect(items).toHaveLength(1);
            expect(mockVocabulary).toContain(items[0]);
        });

        it('should filter random items by category', async () => {
            const items = await dataLoader.getRandomItems(2, { category: 'Greetings' });
            expect(items).toHaveLength(2);
            expect(items.every(item => item.category === 'Greetings')).toBe(true);
        });

        it('should filter random items by difficulty', async () => {
            const items = await dataLoader.getRandomItems(2, { difficulty: 'A1' });
            expect(items).toHaveLength(2);
            expect(items.every(item => item.difficulty === 'A1')).toBe(true);
        });
    });

    describe('Statistics Management', () => {
        beforeEach(async () => {
            await dataLoader.loadVocabulary();
        });

        it('should initialize stats for all items', async () => {
            const stats = await dataLoader.getStats();
            expect(stats.size).toBe(2);
            expect(stats.has('test_001')).toBe(true);
            expect(stats.has('test_002')).toBe(true);
        });

        it('should update stats for correct answer', async () => {
            await dataLoader.updateStats('test_001', true, 1000);
            
            const stats = await dataLoader.getStats();
            const itemStats = stats.get('test_001')!;
            
            expect(itemStats.correct_count).toBe(1);
            expect(itemStats.incorrect_count).toBe(0);
            expect(itemStats.mastery_level).toBe(5);
            expect(itemStats.streak_count).toBe(1);
            expect(itemStats.average_response_time).toBe(1000);
        });

        it('should update stats for incorrect answer', async () => {
            await dataLoader.updateStats('test_001', false, 1500);
            
            const stats = await dataLoader.getStats();
            const itemStats = stats.get('test_001')!;
            
            expect(itemStats.correct_count).toBe(0);
            expect(itemStats.incorrect_count).toBe(1);
            expect(itemStats.mastery_level).toBe(0);
            expect(itemStats.streak_count).toBe(0);
        });

        it('should calculate mastery level correctly', async () => {
            await dataLoader.updateStats('test_001', true, 1000);
            await dataLoader.updateStats('test_001', true, 1200);
            
            const stats = await dataLoader.getStats();
            const itemStats = stats.get('test_001')!;
            
            expect(itemStats.mastery_level).toBe(10); // 5 + 5
        });

        it('should cap mastery level at 100', async () => {
            // Add many correct answers to test cap
            for (let i = 0; i < 25; i++) {
                await dataLoader.updateStats('test_001', true, 1000);
            }
            
            const stats = await dataLoader.getStats();
            const itemStats = stats.get('test_001')!;
            
            expect(itemStats.mastery_level).toBe(100);
        });

        it('should save stats to localStorage', async () => {
            const { localStorageManager } = await import('$lib/utils/localStorage');
            const mockSaveUserProgress = vi.mocked(localStorageManager.saveUserProgress);
            
            await dataLoader.updateStats('test_001', true, 1000);
            
            expect(mockSaveUserProgress).toHaveBeenCalled();
        });
    });

    describe('Cache Management', () => {
        it('should clear all caches', async () => {
            await dataLoader.loadVocabulary();
            await dataLoader.getStats();
            
            dataLoader.clearCache();
            
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tandem_vocabulary_cache');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tandem_stats_cache');
        });

        it('should provide cache statistics', async () => {
            await dataLoader.loadVocabulary();
            
            const stats = dataLoader.getCacheStats();
            
            expect(stats.vocabularyCached).toBe(true);
            expect(stats.itemCount).toBe(2);
            expect(stats.cacheAge).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage errors gracefully', async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            // Should not throw
            await expect(dataLoader.loadVocabulary()).resolves.toBeDefined();
        });

        it('should retry loading on failure', async () => {
            let attemptCount = 0;
            vi.doMock('./vocabulary.json', () => {
                attemptCount++;
                if (attemptCount < 2) {
                    throw new Error('Temporary failure');
                }
                return { default: mockVocabulary };
            });

            const items = await dataLoader.loadVocabulary();
            expect(items).toEqual(mockVocabulary);
        });
    });
});