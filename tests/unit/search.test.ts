/**
 * Unit tests for SearchService
 *
 * Tests the enhanced search functionality including:
 * - Fuzzy search with relevance scoring
 * - Comprehensive filtering
 * - Pagination
 * - Sorting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchVocabulary, clearVocabularyCache, getSearchSuggestions, getVocabularyStats } from '$lib/services/search';
import { loadVocabulary } from '$lib/data/loader';
import type { VocabularyItem } from '$lib/schemas/vocabulary';

// Mock the loader to return test data
vi.mock('$lib/data/loader', () => {
  return {
    loadVocabulary: vi.fn()
  };
});

describe('SearchService', () => {
  const mockVocabularyItems: VocabularyItem[] = [
    {
      id: '1',
      german: 'Haus',
      bulgarian: 'къща',
      partOfSpeech: 'noun',
      difficulty: 1,
      categories: ['house'],
      transliteration: 'kŭshta',
      metadata: {
        examples: [
          { german: 'Das Haus ist groß.', bulgarian: 'Къщата е голяма.' }
        ],
        notes: 'Common word for house'
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      isCommon: true,
      isVerified: true,
      learningPhase: 0
    },
    {
      id: '2',
      german: 'Apfel',
      bulgarian: 'ябълка',
      partOfSpeech: 'noun',
      difficulty: 1,
      categories: ['food'],
      transliteration: 'yabŭlka',
      metadata: {
        examples: [
          { german: 'Ich esse einen Apfel.', bulgarian: 'Аз ям ябълка.' }
        ],
        mnemonic: 'Sounds like "apple"'
      },
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
      isCommon: true,
      isVerified: true,
      learningPhase: 1
    },
    {
      id: '3',
      german: 'laufen',
      bulgarian: 'тичам',
      partOfSpeech: 'verb',
      difficulty: 2,
      categories: ['activities'],
      transliteration: 'ticham',
      metadata: {
        examples: [
          { german: 'Ich laufe schnell.', bulgarian: 'Аз тичам бързо.' }
        ]
      },
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
      isCommon: true,
      isVerified: true,
      learningPhase: 2
    },
    {
      id: '4',
      german: 'groß',
      bulgarian: 'голям',
      partOfSpeech: 'adjective',
      difficulty: 2,
      categories: ['adjectives'],
      transliteration: 'golyam',
      createdAt: new Date('2025-01-04'),
      updatedAt: new Date('2025-01-04'),
      isCommon: true,
      isVerified: true,
      learningPhase: 3
    },
    {
      id: '5',
      german: 'schnell',
      bulgarian: 'бързо',
      partOfSpeech: 'adverb',
      difficulty: 3,
      categories: ['adverbs'],
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05'),
      isCommon: true,
      isVerified: true,
      learningPhase: 4
    }
  ];

  beforeEach(() => {
    // Clear the cache before each test
    clearVocabularyCache();

    // Mock the loader to return test data
    (loadVocabulary as any).mockResolvedValue({
      items: mockVocabularyItems,
      categories: ['house', 'food', 'activities', 'adjectives', 'adverbs'],
      languagePair: 'de-bg',
      difficultyRange: [1, 5] as [number, number],
      id: 'test-collection',
      name: 'Test Collection',
      description: 'Test collection for unit tests',
      createdAt: new Date(),
      updatedAt: new Date()
    });
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
      const suggestions = await getSearchSuggestions('Hau');

      expect(suggestions).toContain('Haus');
    });

    it('should return suggestions for bulgarian words', async () => {
      const suggestions = await getSearchSuggestions('ябъл');

      expect(suggestions).toContain('ябълка');
    });

    it('should return suggestions for transliteration', async () => {
      const suggestions = await getSearchSuggestions('kŭ');

      expect(suggestions).toContain('kŭshta');
    });

    it('should limit the number of suggestions', async () => {
      const suggestions = await getSearchSuggestions('a', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await getSearchSuggestions('');

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

      expect(stats.difficulty[1]).toBe(2);
      expect(stats.difficulty[2]).toBe(2);
      expect(stats.difficulty[3]).toBe(1);
    });

    it('should return statistics by category', async () => {
      const stats = await getVocabularyStats();

      expect(stats.categories.house).toBe(1);
      expect(stats.categories.food).toBe(1);
      expect(stats.categories.activities).toBe(1);
      expect(stats.categories.adjectives).toBe(1);
      expect(stats.categories.adverbs).toBe(1);
    });

    it('should return statistics by learning phase', async () => {
      const stats = await getVocabularyStats();

      expect(stats.learningPhase[0]).toBe(1);
      expect(stats.learningPhase[1]).toBe(1);
      expect(stats.learningPhase[2]).toBe(1);
      expect(stats.learningPhase[3]).toBe(1);
      expect(stats.learningPhase[4]).toBe(1);
    });
  });

  describe('clearVocabularyCache', () => {
    it('should clear the vocabulary cache', async () => {
      // Reset the mock to track calls accurately
      vi.clearAllMocks();

      // First call should load from loader
      await searchVocabulary({
        query: '',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      // Clear the cache
      clearVocabularyCache();

      // The mock should be called again after cache is cleared
      await searchVocabulary({
        query: '',
        limit: 20,
        offset: 0,
        sortBy: 'german',
        sortOrder: 'asc'
      });

      // loadVocabulary should be called twice (once for each cache miss)
      expect(loadVocabulary).toHaveBeenCalledTimes(2);
    });
  });
});