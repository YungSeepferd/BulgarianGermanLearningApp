/* eslint-disable no-console */
import type { VocabularyItem } from '$lib/types/vocabulary.js';
import {
  safeValidateVocabularyArray,
  normalizeVocabularyItem
} from '$lib/schemas/vocabulary.js';
import { LocalStorageManager } from '$lib/utils/localStorage.js';

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
  etag?: string | undefined;
}

/**
 * Enhanced data loader utility for the Tandem Learning System
 * Handles loading, filtering, and processing of vocabulary data with optimized caching
 * Now uses fetch() instead of dynamic imports for better testability and decoupling
 */

export class DataLoader {
  private static instance: DataLoader;
  private vocabularyCache: VocabularyItem[] | null = null;
  private statsCache: Map<string, LearningStats> | null = null;
  private cacheMetadata: CacheMetadata | null = null;
  private readonly CACHE_VERSION = '2.0.0';
  private readonly CACHE_KEY = 'tandem_vocabulary_cache';
  private readonly STATS_CACHE_KEY = 'tandem_stats_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly DATA_URL = '/data/vocabulary.json';
  private fetchFunction: typeof fetch = fetch;

  private constructor() {}

  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Set custom fetch function for SvelteKit compatibility
   */
  public setFetchFunction(fetchFn: typeof fetch): void {
    this.fetchFunction = fetchFn;
  }

  /**
   * Load all vocabulary items with enhanced caching and error handling
   * Uses fetch() to load data from static assets
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
      
      // Revalidate in background if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        this.revalidateCache().catch(err => console.error('Background revalidation failed:', err));
      }
      
      return this.vocabularyCache;
    }

    // Fetch from network
    return this.fetchFromNetwork(maxRetries);
  }

  /**
   * Fetch vocabulary data from the network
   */
  private async fetchFromNetwork(maxRetries: number): Promise<VocabularyItem[]> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchFunction(this.DATA_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vocabulary data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Loaded data is not an array');
        }

        if (data.length === 0) {
          throw new Error('Loaded data array is empty');
        }

        // Use Zod for robust validation - challenging the "any JSON is fine" assumption
        const validationResult = safeValidateVocabularyArray(data);
        
        if (!validationResult.success) {
          console.warn('Data validation failed, attempting normalization:', validationResult.error.errors);
          
          // Try to normalize and validate each item individually
          const normalizedData: VocabularyItem[] = [];
          const validationErrors: string[] = [];
          
          for (const item of data) {
            try {
              const normalizedItem = normalizeVocabularyItem(item);
              normalizedData.push(normalizedItem);
            } catch (normalizationError) {
              validationErrors.push(`Failed to normalize item: ${normalizationError}`);
              console.warn('Skipping invalid item:', item);
            }
          }
          
          if (normalizedData.length === 0) {
            throw new Error(`No valid vocabulary items found after normalization. Errors: ${validationErrors.join(', ')}`);
          }
          
          // Validate the normalized array
          const normalizedValidation = safeValidateVocabularyArray(normalizedData);
          if (!normalizedValidation.success) {
            throw new Error(`Normalized data still invalid: ${normalizedValidation.error.errors.map(e => e.message).join(', ')}`);
          }
          
          // Use the validated normalized data
          const validatedData = normalizedValidation.data;
          
          // Cache the data
          const metadata: CacheMetadata = {
            version: this.CACHE_VERSION,
            timestamp: Date.now(),
            itemCount: validatedData.length,
            etag: response.headers.get('ETag') || undefined
          };

          this.vocabularyCache = validatedData;
          this.cacheMetadata = metadata;
          
          this.saveToCache(validatedData, metadata);

          return this.vocabularyCache;
        } else {
          // Data is valid according to schema
          const validatedData = validationResult.data;
          
          // Cache the data
          const metadata: CacheMetadata = {
            version: this.CACHE_VERSION,
            timestamp: Date.now(),
            itemCount: validatedData.length,
            etag: response.headers.get('ETag') || undefined
          };

          this.vocabularyCache = validatedData;
          this.cacheMetadata = metadata;
          
          this.saveToCache(validatedData, metadata);

          return this.vocabularyCache;
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed to load vocabulary data:`, error);

        // Wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error('All attempts to load vocabulary data failed');
    throw lastError || new Error('Unknown error occurred while loading vocabulary data');
  }

  /**
   * Background revalidation of cache
   */
  private async revalidateCache(): Promise<void> {
      try {
          const response = await this.fetchFunction(this.DATA_URL, {
              method: 'HEAD'
          });
          
          if (!response.ok) return;
          
          const etag = response.headers.get('ETag');
          
          // If ETag matches, our cache is fresh
          if (etag && this.cacheMetadata?.etag === etag) {
              return;
          }
          
          // Data changed, fetch update
          await this.fetchFromNetwork(1);
          
      } catch (_error) {
          // Ignore validation errors
      }
  }

  /**
   * Load vocabulary data from localStorage cache
   */
  private loadFromCache(): { items: VocabularyItem[]; metadata: CacheMetadata } | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      
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
      if (typeof localStorage === 'undefined') return;
      
      const cacheData = {
        items,
        metadata
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (_error) {
      // Silently fail if caching fails (e.g. storage full)
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(metadata?: CacheMetadata): boolean {
    // Check if we have an in-memory cache but no metadata passed (internal check)
    let currentMetadata = metadata;
    if (!currentMetadata && this.cacheMetadata) {
        currentMetadata = this.cacheMetadata;
    }
    
    if (!currentMetadata) {
        return false;
    }
    
    const now = Date.now();
    const cacheAge = now - currentMetadata.timestamp;
    
    return cacheAge < this.CACHE_DURATION && currentMetadata.version === this.CACHE_VERSION;
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
             (!filters?.difficulty || item.level === filters.difficulty);
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
    const savedProgress = LocalStorageManager.loadUserProgress();
    this.statsCache = new Map();

    if (savedProgress && savedProgress.stats) {
      // Load saved stats
      savedProgress.stats.forEach((stat: any, id: string) => {
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

    LocalStorageManager.saveUserProgress({
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
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.CACHE_KEY);
        localStorage.removeItem(this.STATS_CACHE_KEY);
      }
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