import type { VocabularyItem } from '$lib/types/vocabulary.js';

interface LearningStats {
  correct_count: number;
  incorrect_count: number;
  last_practiced: string | null;
  difficulty_rating: number | string;
  mastery_level: number;
  average_response_time: number | null;
  streak_count: number;
}

/**
 * Data loader utility for the Tandem Learning System
 * Handles loading, filtering, and processing of vocabulary data
 */

export class DataLoader {
  private static instance: DataLoader;
  private vocabularyCache: VocabularyItem[] | null = null;
  private statsCache: Map<string, LearningStats> | null = null;

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
   * Load all vocabulary items with enhanced error handling and retries
   */
  public async loadVocabulary(maxRetries: number = 2): Promise<VocabularyItem[]> {
    if (this.vocabularyCache) {
      return this.vocabularyCache;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Load from our unified data format
        // In a real app, this would be imported or fetched from an API
        // For now we use the dynamic import of the JSON file we created
        const module = await import('./vocabulary.json');
        const data = (module.default || module) as VocabularyItem[];
        
        this.vocabularyCache = data;
        return this.vocabularyCache;
        /*
        const response = await fetch('/data/vocabulary.json');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        */
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
      item.tags.some(tag => tag.includes(lowerQuery))
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
   * Get learning statistics for all items with enhanced initialization
   */
  public async getStats(): Promise<Map<string, LearningStats>> {
    if (this.statsCache) {
      return this.statsCache;
    }

    const allItems = await this.loadVocabulary();
    this.statsCache = new Map();

    // Initialize stats for all items with more complete defaults
    allItems.forEach(item => {
      this.statsCache!.set(item.id, {
        correct_count: 0,
        incorrect_count: 0,
        last_practiced: null,
        difficulty_rating: item.difficulty || 'A1',
        mastery_level: 0,
        average_response_time: null,
        streak_count: 0
      });
    });

    return this.statsCache;
  }

  /**
   * Update learning statistics for an item
   */
  /**
   * Update learning statistics with enhanced tracking
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
    }
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.vocabularyCache = null;
    this.statsCache = null;
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();