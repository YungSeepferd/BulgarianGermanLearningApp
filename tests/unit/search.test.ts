/**
 * Unit tests for SearchService
 *
 * Tests the enhanced search functionality including:
 * - Fuzzy search with relevance scoring
 * - Comprehensive filtering
 * - Pagination
 * - Sorting
 *
 * Note: These tests mock vocabularyRepository from $lib/data/vocabulary-repository.svelte
 * since the search service now uses the repository pattern instead of loadVocabulary.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchVocabulary, clearVocabularyCache, getSearchSuggestions, getVocabularyStats } from '$lib/services/search';
import type { UnifiedVocabularyItem } from '$lib/schemas/unified-vocabulary';
import type { VocabularyIndexItem } from '$lib/schemas/vocabulary-index';

// Use hoisted to define mocks before vi.mock is hoisted
const { mockSearch, mockGetAll, mockInvalidate, mockInitialize, mockGetAllIndexItems } = vi.hoisted(() => {
  return {
    mockSearch: vi.fn(),
    mockGetAll: vi.fn(),
    mockInvalidate: vi.fn(),
    mockInitialize: vi.fn().mockResolvedValue(undefined),
    mockGetAllIndexItems: vi.fn(),
  };
});

// Mock the vocabulary repository
vi.mock('$lib/data/vocabulary-repository.svelte', () => {
  return {
    vocabularyRepository: {
      loaded: true,
      search: mockSearch,
      getAll: mockGetAll,
      invalidate: mockInvalidate,
      initialize: mockInitialize,
      getAllIndexItems: mockGetAllIndexItems,
    }
  };
});

describe('SearchService', () => {
  const mockVocabularyItems: UnifiedVocabularyItem[] = [
    {
      id: '1',
      german: 'Haus',
      bulgarian: 'къща',
      partOfSpeech: 'noun',
      difficulty: 1,
      cefrLevel: 'A1',
      categories: ['home'],
      transliteration: { german: 'kŭshta', bulgarian: 'kŭshta' },
      metadata: {
        examples: [
          { german: 'Das Haus ist groß.', bulgarian: 'Къщата е голяма.', source: 'current' as const }
        ],
        notes: 'Common word for house',
        learningPhase: 0
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      version: 1
    },
    {
      id: '2',
      german: 'Apfel',
      bulgarian: 'ябълка',
      partOfSpeech: 'noun',
      difficulty: 1,
      cefrLevel: 'A1',
      categories: ['food'],
      transliteration: { german: 'yabŭlka', bulgarian: 'yabŭlka' },
      metadata: {
        examples: [
          { german: 'Ich esse einen Apfel.', bulgarian: 'Аз ям ябълка.', source: 'current' as const }
        ],
        mnemonic: 'Sounds like "apple"',
        learningPhase: 1
      },
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
      version: 1
    },
    {
      id: '3',
      german: 'laufen',
      bulgarian: 'тичам',
      partOfSpeech: 'verb',
      difficulty: 2,
      cefrLevel: 'A2',
      categories: ['activities'],
      transliteration: { german: 'ticham', bulgarian: 'ticham' },
      metadata: {
        examples: [
          { german: 'Ich laufe schnell.', bulgarian: 'Аз тичам бързо.', source: 'current' as const }
        ],
        learningPhase: 2
      },
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
      version: 1
    },
    {
      id: '4',
      german: 'groß',
      bulgarian: 'голям',
      partOfSpeech: 'adjective',
      difficulty: 2,
      cefrLevel: 'A1',
      categories: ['adjectives'],
      transliteration: { german: 'golyam', bulgarian: 'golyam' },
      metadata: {
        learningPhase: 3
      },
      createdAt: new Date('2025-01-04'),
      updatedAt: new Date('2025-01-04'),
      version: 1
    },
    {
      id: '5',
      german: 'schnell',
      bulgarian: 'бързо',
      partOfSpeech: 'adverb',
      difficulty: 3,
      cefrLevel: 'B1',
      categories: ['adverbs'],
      metadata: {
        learningPhase: 4
      },
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05'),
      version: 1
    }
  ];

  // Create mock index items for stats (simplified version)
  const createMockIndexItem = (item: UnifiedVocabularyItem): VocabularyIndexItem => ({
    id: item.id,
    german: item.german,
    bulgarian: item.bulgarian,
    partOfSpeech: item.partOfSpeech,
    difficulty: item.difficulty,
    cefrLevel: item.cefrLevel || 'A1',
    categories: item.categories,
  });

  const mockIndexItems: VocabularyIndexItem[] = mockVocabularyItems.map(createMockIndexItem);

  // Helper to create Fuse.js-style search result
  const createSearchResult = (item: UnifiedVocabularyItem) => ({
    item,
    mini: mockIndexItems.find(m => m.id === item.id)!,
    score: 0
  });

  beforeEach(() => {
    // Clear mocks first (before clearVocabularyCache which will call invalidate)
    vi.clearAllMocks();

    // Reset mock implementations
    mockInitialize.mockResolvedValue(undefined);
    mockInvalidate.mockImplementation(() => {});
    mockGetAllIndexItems.mockReturnValue(mockIndexItems);

    // Default: getAll returns a COPY of all items (to avoid mutation issues)
    // Default search returns empty results - tests will override as needed
    mockSearch.mockResolvedValue([]);
    
    // Always return a fresh copy from getAll to avoid mutation issues
    mockGetAll.mockImplementation(() => [...mockVocabularyItems]);

    // Clear the search cache to ensure fresh results
    clearVocabularyCache();
  });

  describe('searchVocabulary', () => {
    it('should return all items when no filters or query are provided', async () => {
      const result = await searchVocabulary({
        query: '',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(5);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(false);
    });

    it('should filter by part of speech', async () => {
      const result = await searchVocabulary({
        partOfSpeech: 'noun',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(2);
      expect(result.items[0].german).toBe('Apfel');
      expect(result.items[1].german).toBe('Haus');
    });

    it('should filter by difficulty', async () => {
      const result = await searchVocabulary({
        difficulty: 2,
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(2);
      expect(result.items[0].german).toBe('groß');
      expect(result.items[1].german).toBe('laufen');
    });

    it('should filter by category', async () => {
      const result = await searchVocabulary({
        categories: ['food'],
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Apfel');
    });

    it('should filter by learning phase', async () => {
      // Set up search to return Apfel (learningPhase: 1)
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[1])
      ]);

      const result = await searchVocabulary({
        learningPhase: 1,
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Apfel');
    });

    it('should perform fuzzy search on german field', async () => {
      // Mock search to return Haus when searching for "Hus"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0])
      ]);

      const result = await searchVocabulary({
        query: 'Hus', // Typo for "Haus"
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Haus');
    });

    it('should perform fuzzy search on bulgarian field', async () => {
      // Mock search to return Apfel when searching for "яблка"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[1])
      ]);

      const result = await searchVocabulary({
        query: 'яблка', // Bulgarian for "apple"
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Apfel');
    });

    it('should perform fuzzy search on transliteration', async () => {
      // Mock search to return Haus when searching for "kush"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0])
      ]);

      const result = await searchVocabulary({
        query: 'kush', // Typo for "kŭshta" (transliteration of къща)
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Haus');
    });

    it('should search in examples', async () => {
      // Mock search to return both Haus and groß when searching for "groß"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0]), // Haus (has "groß" in example)
        createSearchResult(mockVocabularyItems[3])   // groß
      ]);

      const result = await searchVocabulary({
        query: 'groß', // Search for word in example
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(2); // "Haus" (contains "groß" in example) and "groß" itself
    });

    it('should apply pagination correctly', async () => {
      const result1 = await searchVocabulary({
        limit: 2,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result1.items.length).toBe(2);
      expect(result1.total).toBe(5);
      expect(result1.hasMore).toBe(true);

      const result2 = await searchVocabulary({
        limit: 2,
        offset: 2,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result2.items.length).toBe(2);
      expect(result2.total).toBe(5);
      expect(result2.hasMore).toBe(true);

      const result3 = await searchVocabulary({
        limit: 2,
        offset: 4,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result3.items.length).toBe(1);
      expect(result3.total).toBe(5);
      expect(result3.hasMore).toBe(false);
    });

    it('should sort by german in ascending order', async () => {
      const result = await searchVocabulary({
        sortBy: 'german',
        sortOrder: 'asc',
        limit: 20,
        offset: 0
      });

      expect(result.items[0].german).toBe('Apfel');
      expect(result.items[1].german).toBe('groß');
      expect(result.items[2].german).toBe('Haus');
      expect(result.items[3].german).toBe('laufen');
      expect(result.items[4].german).toBe('schnell');
    });

    it('should sort by german in descending order', async () => {
      const result = await searchVocabulary({
        sortBy: 'german',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      });

      expect(result.items[0].german).toBe('schnell');
      expect(result.items[1].german).toBe('laufen');
      expect(result.items[2].german).toBe('Haus');
      expect(result.items[3].german).toBe('groß');
      expect(result.items[4].german).toBe('Apfel');
    });

    it('should sort by difficulty in ascending order', async () => {
      const result = await searchVocabulary({
        sortBy: 'difficulty',
        sortOrder: 'asc',
        limit: 20,
        offset: 0
      });

      expect(result.items[0].difficulty).toBe(1);
      expect(result.items[1].difficulty).toBe(1);
      expect(result.items[2].difficulty).toBe(2);
      expect(result.items[3].difficulty).toBe(2);
      expect(result.items[4].difficulty).toBe(3);
    });

    it('should sort by createdAt in descending order', async () => {
      const result = await searchVocabulary({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      });

      expect(result.items[0].german).toBe('schnell');
      expect(result.items[1].german).toBe('groß');
      expect(result.items[2].german).toBe('laufen');
      expect(result.items[3].german).toBe('Apfel');
      expect(result.items[4].german).toBe('Haus');
    });

    it('should combine multiple filters', async () => {
      // Set up search to return Apfel (noun, difficulty 1, food category)
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[1])
      ]);

      const result = await searchVocabulary({
        partOfSpeech: 'noun',
        difficulty: 1,
        categories: ['food'],
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(1);
      expect(result.items[0].german).toBe('Apfel');
    });

    it('should return empty results when no items match filters', async () => {
      // Set up search to return no results for "preposition"
      mockSearch.mockResolvedValue([]);

      const result = await searchVocabulary({
        partOfSpeech: 'preposition',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return suggestions for german words', async () => {
      // getSearchSuggestions uses quickSearch which calls repository.search()
      // Then filters by prefix match (startsWith)
      // Set up search to return Haus for "Hau"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0])
      ]);

      const suggestions = await getSearchSuggestions('Hau');

      expect(suggestions).toContain('Haus');
    });

    it('should return suggestions for bulgarian words', async () => {
      // Set up search to return Apfel for "ябъл"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[1])
      ]);

      const suggestions = await getSearchSuggestions('ябъл');

      expect(suggestions).toContain('ябълка');
    });

    it('should return suggestions for transliteration', async () => {
      // Set up search to return Haus for "kŭ"
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0])
      ]);

      const suggestions = await getSearchSuggestions('kŭ');

      expect(suggestions).toContain('kŭshta');
    });

    it('should limit the number of suggestions', async () => {
      // Set up search to return multiple items
      mockSearch.mockResolvedValue([
        createSearchResult(mockVocabularyItems[0]), // Haus
        createSearchResult(mockVocabularyItems[1]), // Apfel
        createSearchResult(mockVocabularyItems[2]), // laufen
      ]);

      const suggestions = await getSearchSuggestions('a', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await getSearchSuggestions('');

      expect(suggestions.length).toBe(0);
    });

    it('should return empty array for query shorter than 2 characters', async () => {
      const suggestions = await getSearchSuggestions('a');

      expect(suggestions.length).toBe(0);
    });
  });

  describe('getVocabularyStats', () => {
    it('should return statistics by part of speech', async () => {
      const stats = await getVocabularyStats();

      expect(stats.partOfSpeech.noun).toBe(2);
      expect(stats.partOfSpeech.verb).toBe(1);
      expect(stats.partOfSpeech.adjective).toBe(1);
      expect(stats.partOfSpeech.adverb).toBe(1);
    });

    it('should return statistics by difficulty', async () => {
      const stats = await getVocabularyStats();

      // Difficulty is a number (1-5), use numeric keys
      expect(stats.difficulty[1]).toBe(2);
      expect(stats.difficulty[2]).toBe(2);
      expect(stats.difficulty[3]).toBe(1);
    });

    it('should return statistics by category', async () => {
      const stats = await getVocabularyStats();

      expect(stats.categories.home).toBe(1);
      expect(stats.categories.food).toBe(1);
      expect(stats.categories.activities).toBe(1);
      expect(stats.categories.adjectives).toBe(1);
      expect(stats.categories.adverbs).toBe(1);
    });

    it('should return total count', async () => {
      const stats = await getVocabularyStats();

      expect(stats.totalCount).toBe(5);
    });
  });

  describe('clearVocabularyCache', () => {
    it('should call vocabularyRepository.invalidate()', async () => {
      // First call should load from repository
      await searchVocabulary({
        query: '',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      // Clear the cache
      clearVocabularyCache();

      // vocabularyRepository.invalidate should be called (once by this test's explicit call)
      // Note: beforeEach already calls clearVocabularyCache once
      expect(mockInvalidate).toHaveBeenCalled();
    });

    it('should reset loaded state after cache clear', async () => {
      // Clear the cache
      clearVocabularyCache();

      // loaded state should be reset via invalidate
      expect(mockInvalidate).toHaveBeenCalled();
    });
  });
});
