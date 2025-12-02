// Unit tests for DataLoader
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataLoader } from '$lib/data/loader';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock vocabulary data
const mockVocabulary: VocabularyItem[] = [
  {
    id: 'test_001',
    german: 'Hallo',
    bulgarian: 'Здравей',
    category: 'Greetings',
    level: 'A1',
    difficulty: 1,
    tags: ['a1', 'greeting']
  },
  {
    id: 'test_002',
    german: 'Danke',
    bulgarian: 'Благодаря',
    category: 'Greetings',
    level: 'A1',
    difficulty: 1,
    tags: ['a1', 'greeting']
  },
  {
    id: 'test_003',
    german: 'Wie geht es dir?',
    bulgarian: 'Как си?',
    category: 'Questions',
    level: 'A2',
    difficulty: 2,
    tags: ['a2', 'question']
  }
];

// Mock fetch
global.fetch = vi.fn();

describe('DataLoader', () => {
  let dataLoader: DataLoader;

  beforeEach(() => {
    // Reset DataLoader instance
    dataLoader = DataLoader.getInstance();
    dataLoader.clearCache();

    // Mock successful fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVocabulary)
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadVocabulary', () => {
    it('should load vocabulary data successfully', async () => {
      const result = await dataLoader.loadVocabulary();
      expect(result).toEqual(mockVocabulary);
      expect(fetch).toHaveBeenCalledWith('/data/vocabulary-unified.json');
    });

    it('should cache vocabulary data', async () => {
      const firstCall = await dataLoader.loadVocabulary();
      const secondCall = await dataLoader.loadVocabulary();

      expect(firstCall).toEqual(secondCall);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors with retries', async () => {
      // Mock failed fetch then successful
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVocabulary)
        });

      const result = await dataLoader.loadVocabulary();
      expect(result).toEqual(mockVocabulary);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      // Mock multiple failed fetches
      global.fetch = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      await expect(dataLoader.loadVocabulary(1)).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate data structure', async () => {
      // Mock invalid data format
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('invalid data')
      });

      await expect(dataLoader.loadVocabulary()).rejects.toThrow('Invalid data format');
    });
  });

  describe('getByCategory', () => {
    it('should filter items by category', async () => {
      const result = await dataLoader.getByCategory('Greetings');
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Greetings');
    });

    it('should be case insensitive', async () => {
      const result = await dataLoader.getByCategory('greetings');
      expect(result).toHaveLength(2);
    });
  });

  describe('getByLevel', () => {
    it('should filter items by level', async () => {
      const result = await dataLoader.getByLevel('A1');
      expect(result).toHaveLength(2);
      expect(result[0].level).toBe('A1');
    });
  });

  describe('search', () => {
    it('should search by German text', async () => {
      const result = await dataLoader.search('Hallo');
      expect(result).toHaveLength(1);
      expect(result[0].german).toBe('Hallo');
    });

    it('should search by Bulgarian text', async () => {
      const result = await dataLoader.search('Благодаря', 'BG->DE');
      expect(result).toHaveLength(1);
      expect(result[0].bulgarian).toBe('Благодаря');
    });

    it('should search by category', async () => {
      const result = await dataLoader.search('Questions');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Questions');
    });

    it('should search by tags', async () => {
      const result = await dataLoader.search('a1');
      expect(result).toHaveLength(2);
      expect(result[0].tags).toContain('a1');
    });
  });

  describe('getRandomItems', () => {
    it('should return random items', async () => {
      const result = await dataLoader.getRandomItems(2);
      expect(result).toHaveLength(2);
      expect(mockVocabulary).toContainEqual(result[0]);
      expect(mockVocabulary).toContainEqual(result[1]);
    });

    it('should apply filters', async () => {
      const result = await dataLoader.getRandomItems(2, { level: 'A2' });
      expect(result).toHaveLength(1);
      expect(result[0].level).toBe('A2');
    });

    it('should not exceed requested count', async () => {
      const result = await dataLoader.getRandomItems(5);
      expect(result).toHaveLength(3);
    });
  });

  describe('getStats', () => {
    it('should initialize stats for all items', async () => {
      const stats = await dataLoader.getStats();
      expect(stats.size).toBe(3);
      mockVocabulary.forEach(item => {
        const itemStats = stats.get(item.id);
        expect(itemStats).toBeDefined();
        expect(itemStats?.correct_count).toBe(0);
        expect(itemStats?.incorrect_count).toBe(0);
      });
    });

    it('should cache stats', async () => {
      const firstCall = await dataLoader.getStats();
      const secondCall = await dataLoader.getStats();

      expect(firstCall).toBe(secondCall);
    });
  });

  describe('updateStats', () => {
    it('should update stats for correct answer', async () => {
      const stats = await dataLoader.getStats();
      await dataLoader.updateStats('test_001', true);

      const updatedStats = await dataLoader.getStats();
      const itemStats = updatedStats.get('test_001');

      expect(itemStats?.correct_count).toBe(1);
      expect(itemStats?.mastery_level).toBe(5);
      expect(itemStats?.streak_count).toBe(1);
    });

    it('should update stats for incorrect answer', async () => {
      const stats = await dataLoader.getStats();
      await dataLoader.updateStats('test_001', false);

      const updatedStats = await dataLoader.getStats();
      const itemStats = updatedStats.get('test_001');

      expect(itemStats?.incorrect_count).toBe(1);
      expect(itemStats?.mastery_level).toBe(0);
      expect(itemStats?.streak_count).toBe(0);
    });

    it('should track response time', async () => {
      await dataLoader.updateStats('test_001', true, 1000);
      const stats = await dataLoader.getStats();
      const itemStats = stats.get('test_001');

      expect(itemStats?.average_response_time).toBe(1000);
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', async () => {
      await dataLoader.loadVocabulary();
      await dataLoader.getStats();

      dataLoader.clearCache();

      // Verify caches are cleared
      // This is a bit tricky to test directly, but we can verify the next call to loadVocabulary makes a new fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockVocabulary)
      });

      await dataLoader.loadVocabulary();
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});