import type { VocabularyItem } from '$lib/types/vocabulary.js';
import { localStorageManager } from '$lib/utils/localStorage.js';

interface LearningStats {
  correct_count: number;
  incorrect_count: number;
  last_practiced: string | null;
  difficulty_rating: number | string;
  mastery_level: number;
  average_response_time: number | null;
  streak_count: number;
}

interface CacheMetadata {
  version: string;
  timestamp: number;
  itemCount: number;
}

/**
 * Enhanced data loader utility for the Tandem Learning System
 * Handles loading, filtering, and processing of vocabulary data with optimized caching
 */

export class DataLoader {
  private static instance: DataLoader;
  private vocabularyCache: VocabularyItem[] | null = null;
  private statsCache: Map<string, LearningStats> | null = null;
  private cacheMetadata: CacheMetadata | null = null;
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_KEY = 'tandem_vocabulary_cache';
  private readonly STATS_CACHE_KEY = 'tandem_stats_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load all vocabulary items from the unified data source
   */
  /**
   * Load all vocabulary items with enhanced caching and error handling
   */
  public async loadVocabulary(maxRetries: number = 2): Promise<VocabularyItem[]> {
    // Check memory cache first
    if (this.vocabularyCache && this.isCacheValid()) {
      return this.vocabularyCache;
    }

    // Try to load from localStorage cache
    const cachedData = this.loadFromCache();
    if (cachedData && this.isCacheValid(cachedData.metadata)) {
      this.vocabularyCache = cachedData.items;
      this.cacheMetadata = cachedData.metadata;
      return this.vocabularyCache;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Load from our unified data format
        const module = await import('./vocabulary.json');
        const data = (module.default || module) as VocabularyItem[];

        if (!Array.isArray(data)) {
          throw new Error('Loaded data is not an array');
        }

        if (data.length === 0) {
          throw new Error('Loaded data array is empty');
        }

        // Validate each item in the array
        for (const item of data) {
          if (!item.id || !item.german || !item.bulgarian) {
            throw new Error('Invalid vocabulary item: missing required fields');
          }
        }

        // Cache the data
        this.vocabularyCache = data;
        this.cacheMetadata = {
          version: this.CACHE_VERSION,
          timestamp: Date.now(),
          itemCount: data.length
        };
        this.saveToCache(data, this.cacheMetadata);

        return this.vocabularyCache;
      } catch (error) {
        lastError = error;
        // eslint-disable-next-line no-console
        console.error(`Attempt ${attempt + 1} failed to load vocabulary data:`, error);

        // Wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // eslint-disable-next-line no-console
    console.error('All attempts to load vocabulary data failed');
    throw lastError || new Error('Unknown error occurred while loading vocabulary data');
  }

  /**
   * Load vocabulary data from localStorage cache
   */
  private loadFromCache(): { items: VocabularyItem[]; metadata: CacheMetadata } | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const parsed = JSON.parse(cached);
      if (!parsed.items || !parsed.metadata) return null;

      return {
        items: parsed.items,
        metadata: parsed.metadata
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Save vocabulary data to localStorage cache
   */
  private saveToCache(items: VocabularyItem[], metadata: CacheMetadata): void {
    try {
      const cacheData = {
        items,
        metadata
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (_error) {
      // Silently fail if caching fails
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(metadata?: CacheMetadata): boolean {
    if (!metadata) return false;
    
    const now = Date.now();
    const cacheAge = now - metadata.timestamp;
    
    return cacheAge < this.CACHE_DURATION && metadata.version === this.CACHE_VERSION;
  }

  /**
   * Get vocabulary items by category
   */
  public async getByCategory(category: string): Promise<VocabularyItem[]> {
    const allItems = await this.loadVocabulary();
    return allItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search vocabulary items
   */
  public async search(query: string, direction: 'DE->BG' | 'BG->DE' = 'DE->BG'): Promise<VocabularyItem[]> {
    const allItems = await this.loadVocabulary();
    const searchField = direction === 'DE->BG' ? 'german' : 'bulgarian';
    const lowerQuery = query.toLowerCase();
    
    return allItems.filter(item =>
      item[searchField].toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get random vocabulary items for practice with enhanced performance
   */
  public async getRandomItems(count: number, filters?: {
    category?: string;
    difficulty?: string;
  }): Promise<VocabularyItem[]> {
    const allItems = await this.loadVocabulary();

    // Apply filters using a single filter operation for better performance
    const filteredItems = allItems.filter(item => {
      return (!filters?.category || item.category === filters.category) &&
             (!filters?.difficulty || item.difficulty === filters.difficulty);
    });

    // Use Fisher-Yates shuffle algorithm for better randomness
    const shuffled = [...filteredItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j] as VocabularyItem, shuffled[i] as VocabularyItem];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Get learning statistics for all items with localStorage integration
   */
  public async getStats(): Promise<Map<string, LearningStats>> {
    if (this.statsCache) {
      return this.statsCache;
    }

    // Try to load stats from localStorage first
    const savedProgress = localStorageManager.loadUserProgress();
    this.statsCache = new Map();

    if (savedProgress && savedProgress.stats) {
      // Load saved stats
      savedProgress.stats.forEach((stat, id) => {
        this.statsCache!.set(id, {
          correct_count: stat.correct,
          incorrect_count: stat.incorrect,
          last_practiced: stat.lastPracticed,
          difficulty_rating: 'A1', // Default, will be updated when item is loaded
          mastery_level: 0,
          average_response_time: null,
          streak_count: 0
        });
      });
    }

    // Initialize stats for any items that don't have saved stats
    const allItems = await this.loadVocabulary();
    allItems.forEach(item => {
      if (!this.statsCache!.has(item.id)) {
        this.statsCache!.set(item.id, {
          correct_count: 0,
          incorrect_count: 0,
          last_practiced: null,
          difficulty_rating: item.difficulty || 'A1',
          mastery_level: 0,
          average_response_time: null,
          streak_count: 0
        });
      }
    });

    return this.statsCache;
  }

  /**
   * Update learning statistics for an item
   */
  /**
   * Update learning statistics with localStorage persistence
   */
  public async updateStats(
    itemId: string,
    correct: boolean,
    responseTime?: number
  ): Promise<void> {
    const stats = await this.getStats();
    const itemStats = stats.get(itemId);

    if (itemStats) {
      // Update basic stats
      if (correct) {
        itemStats.correct_count++;
        itemStats.mastery_level = Math.min(100, itemStats.mastery_level + 5);
        itemStats.streak_count = (itemStats.streak_count || 0) + 1;
      } else {
        itemStats.incorrect_count++;
        itemStats.mastery_level = Math.max(0, itemStats.mastery_level - 3);
        itemStats.streak_count = 0;
      }

      // Update response time if provided
      if (responseTime) {
        const currentAvg = itemStats.average_response_time || 0;
        const count = itemStats.correct_count + itemStats.incorrect_count;
        itemStats.average_response_time = (currentAvg * (count - 1) + responseTime) / count;
      }

      // Update last practiced time
      itemStats.last_practiced = new Date().toISOString();
      stats.set(itemId, itemStats);

      // Save to localStorage
      this.saveStatsToStorage();
    }
  }

  /**
   * Save statistics to localStorage
   */
  private saveStatsToStorage(): void {
    if (!this.statsCache) return;

    const statsForStorage = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
    
    this.statsCache.forEach((stats, id) => {
      statsForStorage.set(id, {
        correct: stats.correct_count,
        incorrect: stats.incorrect_count,
        lastPracticed: stats.last_practiced || ''
      });
    });

    localStorageManager.saveUserProgress({
      stats: statsForStorage,
      favorites: [], // Will be enhanced later
      recentSearches: [] // Will be enhanced later
    });
  }

  /**
   * Clear all caches including localStorage
   */
  public clearCache(): void {
    this.vocabularyCache = null;
    this.statsCache = null;
    this.cacheMetadata = null;
    
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.STATS_CACHE_KEY);
    } catch (_error) {
      // Silently fail if clearing cache fails
    }
  }

  /**
   * Get cache statistics for debugging
   */
  public getCacheStats(): {
    vocabularyCached: boolean;
    statsCached: boolean;
    cacheAge: number | null;
    itemCount: number | null;
  } {
    return {
      vocabularyCached: !!this.vocabularyCache,
      statsCached: !!this.statsCache,
      cacheAge: this.cacheMetadata ? Date.now() - this.cacheMetadata.timestamp : null,
      itemCount: this.cacheMetadata?.itemCount || null
    };
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();