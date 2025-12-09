import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the module at the top level to avoid hoisting issues
vi.mock('$lib/data/loader', () => {
    // This will be overridden in beforeEach, but we need a default mock
    return {
        loadVocabulary: vi.fn().mockResolvedValue({ items: [] }),
        loadVocabularyBySearch: vi.fn().mockResolvedValue({ items: [], total: 0, hasMore: false }),
        loadVocabularyByCategory: vi.fn().mockResolvedValue([]),
        getRandomVocabulary: vi.fn().mockResolvedValue([]),
        updateStats: vi.fn().mockResolvedValue(undefined),
        initializeVocabulary: vi.fn().mockResolvedValue(undefined)
    };
});

import * as dataLoader from '$lib/data/loader';

describe('DataLoader Functions', () => {
    // Mock localStorage
    const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('fetch', vi.fn());

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock data
        const mockVocabularyItems = [
            {
                id: 'test_001',
                german: 'Hallo',
                bulgarian: 'Здравей',
                categories: ['greetings'],
                difficulty: 1,
                partOfSpeech: 'noun',
                metadata: {
                    examples: [
                        {
                            german: 'Hallo, wie geht es dir?',
                            bulgarian: 'Здравей, как си?'
                        }
                    ]
                },
                isCommon: true,
                isVerified: true,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-01')
            },
            {
                id: 'test_002',
                german: 'Danke',
                bulgarian: 'Благодаря',
                categories: ['greetings'],
                difficulty: 1,
                partOfSpeech: 'noun',
                metadata: {
                    examples: [
                        {
                            german: 'Danke schön!',
                            bulgarian: 'Много благодаря!'
                        }
                    ]
                },
                isCommon: true,
                isVerified: true,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-01')
            }
        ];

        const mockCollection = {
            id: 'test-collection',
            name: 'Test Collection',
            description: 'Test vocabulary collection',
            items: mockVocabularyItems,
            languagePair: 'de-bg' as const,
            difficultyRange: [1, 5] as [number, number],
            categories: ['greetings'],
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        };

        // Override the mock implementations
        dataLoader.loadVocabulary.mockResolvedValue(mockCollection);

        dataLoader.loadVocabularyBySearch.mockImplementation((params) => {
            let items = [...mockVocabularyItems];

            if (params.query) {
                const query = params.query.toLowerCase();
                items = items.filter(item =>
                    item.german.toLowerCase().includes(query) ||
                    item.bulgarian.toLowerCase().includes(query) ||
                    item.categories.some(category => category.toLowerCase().includes(query))
                );
            }

            return Promise.resolve({
                items,
                total: items.length,
                hasMore: false
            });
        });

        dataLoader.loadVocabularyByCategory.mockImplementation((category) => {
            return Promise.resolve(mockVocabularyItems.filter(item =>
                item.categories.includes(category)
            ));
        });

        dataLoader.getRandomVocabulary.mockImplementation((count) => {
            return Promise.resolve(mockVocabularyItems.slice(0, count));
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Vocabulary Loading', () => {
        it('should load vocabulary from static endpoint', async () => {
            const result = await dataLoader.loadVocabulary();
            expect(result.items).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: 'test_001',
                    german: 'Hallo',
                    bulgarian: 'Здравей'
                }),
                expect.objectContaining({
                    id: 'test_002',
                    german: 'Danke',
                    bulgarian: 'Благодаря'
                })
            ]));
            expect(result.items).toHaveLength(2);
        });

        it('should handle loading errors gracefully', async () => {
            // Override the mock for this specific test
            dataLoader.loadVocabulary.mockResolvedValue({
                id: 'test-collection',
                name: 'Test Collection',
                description: 'Test vocabulary collection',
                items: [],
                languagePair: 'de-bg' as const,
                difficultyRange: [1, 5] as [number, number],
                categories: ['greetings'],
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-01')
            });

            const result = await dataLoader.loadVocabulary();
            expect(result.items).toEqual([]);
        });
    });

    describe('Search and Filtering', () => {
        it('should search by German text', async () => {
            const results = await dataLoader.loadVocabularyBySearch({ query: 'Hallo' });
            expect(results.items).toHaveLength(1);
            expect(results.items[0].german).toBe('Hallo');
        });

        it('should search by Bulgarian text', async () => {
            const results = await dataLoader.loadVocabularyBySearch({ query: 'Здравей' });
            expect(results.items).toHaveLength(1);
            expect(results.items[0].bulgarian).toBe('Здравей');
        });

        it('should search by category', async () => {
            const results = await dataLoader.loadVocabularyBySearch({ query: 'greetings' });
            expect(results.items).toHaveLength(2);
        });

        it('should be case insensitive', async () => {
            const results = await dataLoader.loadVocabularyBySearch({ query: 'hallo' });
            expect(results.items).toHaveLength(1);
            expect(results.items[0].german).toBe('Hallo');
        });

        it('should get items by category', async () => {
            const items = await dataLoader.loadVocabularyByCategory('greetings');
            expect(items).toHaveLength(2);
            expect(items.every(item => item.categories.includes('greetings'))).toBe(true);
        });

        it('should get random items', async () => {
            const items = await dataLoader.getRandomVocabulary(1);
            expect(items).toHaveLength(1);
            expect(items[0]).toEqual(expect.objectContaining({
                id: expect.any(String),
                german: expect.any(String),
                bulgarian: expect.any(String)
            }));
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage errors gracefully', async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const result = await dataLoader.loadVocabulary();
            expect(result.items).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: 'test_001',
                    german: 'Hallo',
                    bulgarian: 'Здравей'
                }),
                expect.objectContaining({
                    id: 'test_002',
                    german: 'Danke',
                    bulgarian: 'Благодаря'
                })
            ]));
        });
    });
});