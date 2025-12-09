/**
 * Vocabulary Service
 *
 * Provides centralized access to vocabulary data with caching and search capabilities
 */

import { VocabularyItemSchema, VocabularyCollectionSchema, VocabularySearchParamsSchema } from '../schemas/vocabulary';
import { loadVocabulary, loadVocabularyById, loadVocabularyByCategory, loadVocabularyByDifficulty, getRandomVocabulary, cacheVocabulary } from './loader';
import { searchVocabulary, clearVocabularyCache, getVocabularyStats } from './search';
import { z } from 'zod';

export class VocabularyService {
  private static instance: VocabularyService;
  private vocabularyCollection: z.infer<typeof VocabularyCollectionSchema> | null = null;
  private isInitialized = false;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of VocabularyService
   */
  public static async getInstance(): Promise<VocabularyService> {
    if (!VocabularyService.instance) {
      VocabularyService.instance = new VocabularyService();
      await VocabularyService.instance.initialize();
    }
    return VocabularyService.instance;
  }

  /**
   * Initialize the service by loading vocabulary data
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.vocabularyCollection = await loadVocabulary();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize VocabularyService:', error);
      throw error;
    }
  }

  /**
   * Get all vocabulary items
   */
  public async getAllVocabulary(): Promise<z.infer<typeof VocabularyItemSchema>[]> {
    if (!this.vocabularyCollection) {
      await this.initialize();
    }
    return this.vocabularyCollection?.items || [];
  }

  /**
   * Get vocabulary item by ID
   */
  public async getVocabularyById(id: string): Promise<z.infer<typeof VocabularyItemSchema> | null> {
    return loadVocabularyById(id);
  }

  /**
   * Search vocabulary with various filters
   */
  public async searchVocabulary(params: z.infer<typeof VocabularySearchParamsSchema>): Promise<{
    items: z.infer<typeof VocabularyItemSchema>[];
    total: number;
    hasMore: boolean;
  }> {
    return searchVocabulary(params);
  }

  /**
   * Get vocabulary by category
   */
  public async getVocabularyByCategory(
    category: string,
    options: { limit?: number; difficulty?: number } = {}
  ): Promise<z.infer<typeof VocabularyItemSchema>[]> {
    return loadVocabularyByCategory(category, options);
  }

  /**
   * Get vocabulary by difficulty level
   */
  public async getVocabularyByDifficulty(
    difficulty: number,
    options: { limit?: number; category?: string } = {}
  ): Promise<z.infer<typeof VocabularyItemSchema>[]> {
    return loadVocabularyByDifficulty(difficulty, options);
  }

  /**
   * Get random vocabulary items
   */
  public async getRandomVocabulary(
    count: number = 5,
    options: { difficulty?: number; category?: string } = {}
  ): Promise<z.infer<typeof VocabularyItemSchema>[]> {
    return getRandomVocabulary(count, options);
  }

  /**
   * Get vocabulary items by multiple IDs
   */
  public async getVocabularyByIds(ids: string[]): Promise<z.infer<typeof VocabularyItemSchema>[]> {
    if (!this.vocabularyCollection) {
      await this.initialize();
    }

    return this.vocabularyCollection?.items.filter(item => ids.includes(item.id)) || [];
  }

  /**
   * Get all categories
   */
  public async getAllCategories(): Promise<string[]> {
    if (!this.vocabularyCollection) {
      await this.initialize();
    }

    return this.vocabularyCollection?.categories || [];
  }

  /**
   * Get vocabulary statistics for search filters
   */
  public async getVocabularyStats(): Promise<{
    partOfSpeech: Record<string, number>;
    difficulty: Record<string, number>;
    categories: Record<string, number>;
    learningPhase: Record<string, number>;
  }> {
    return getVocabularyStats();
  }

  /**
   * Get vocabulary collection statistics
   */
  public async getCollectionStats(): Promise<{
    totalItems: number;
    byPartOfSpeech: Record<string, number>;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    if (!this.vocabularyCollection) {
      await this.initialize();
    }

    const items = this.vocabularyCollection?.items || [];

    const byPartOfSpeech: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    items.forEach(item => {
      // Count by part of speech
      byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;

      // Count by difficulty
      byDifficulty[item.difficulty] = (byDifficulty[item.difficulty] || 0) + 1;

      // Count by category
      item.categories.forEach(category => {
        byCategory[category] = (byCategory[category] || 0) + 1;
      });
    });

    return {
      totalItems: items.length,
      byPartOfSpeech,
      byDifficulty,
      byCategory
    };
  }

  /**
   * Refresh vocabulary data from source
   */
  public async refreshVocabulary(): Promise<void> {
    try {
      this.vocabularyCollection = await loadVocabulary();
      cacheVocabulary(this.vocabularyCollection);
      clearVocabularyCache(); // Clear the search cache when data is refreshed
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to refresh vocabulary data:', error);
      throw error;
    }
  }

  /**
   * Get vocabulary collection metadata
   */
  public async getCollectionMetadata(): Promise<{
    id: string;
    name: string;
    description: string;
    languagePair: string;
    difficultyRange: [number, number];
    categories: string[];
    itemCount: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    if (!this.vocabularyCollection) {
      await this.initialize();
    }

    if (!this.vocabularyCollection) {
      throw new Error('Vocabulary collection not available');
    }

    return {
      id: this.vocabularyCollection.id,
      name: this.vocabularyCollection.name,
      description: this.vocabularyCollection.description,
      languagePair: this.vocabularyCollection.languagePair,
      difficultyRange: this.vocabularyCollection.difficultyRange,
      categories: this.vocabularyCollection.categories,
      itemCount: this.vocabularyCollection.items.length,
      createdAt: this.vocabularyCollection.createdAt,
      updatedAt: this.vocabularyCollection.updatedAt
    };
  }
}

// Export a singleton instance for convenience
export const vocabularyService = VocabularyService.getInstance();