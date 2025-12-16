/**
 * Vocabulary Data Loader
 *
 * Handles loading, caching, and validation of vocabulary data
 * Supports both server-side and client-side loading patterns
 */

import { base } from '$app/paths';
import { Debug } from '../utils';
import { DataError, ErrorHandler } from '../services/errors';
import { EventBus } from '../services/event-bus';

// DataLoader is unused

import { UnifiedVocabularyItemSchema, UnifiedVocabularyCollectionSchema, ResilientUnifiedVocabularyCollectionSchema, VocabularyCategorySchema } from '../schemas/unified-vocabulary';
import { z } from 'zod';

/**
 * Vocabulary search parameters
 */
export interface VocabularySearchParams {
  query?: string;
  partOfSpeech?: string;
  difficulty?: number;
  categories?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Update practice statistics for a vocabulary item
 * @param itemId The ID of the vocabulary item
 * @param correct Whether the answer was correct
 * @param responseTime Response time in seconds (optional)
 * @param eventBus Optional event bus for error handling
 */
export async function updateStats(itemId: string, correct: boolean, responseTime?: number, eventBus?: EventBus): Promise<void> {
  try {
    Debug.log('loader', 'Updating stats for vocabulary item', { itemId, correct, responseTime });

    // In a real implementation, this would update server-side statistics
    // For now, we'll just log it and update the local cache if available

    // Check if we have the item in memory (client-side only)
    if (typeof window !== 'undefined') {
      const collection = await loadVocabulary();
      const itemIndex = collection.items.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        // Update the cache with the modified item
        cacheVocabulary(collection);
        Debug.log('loader', 'Updated stats for vocabulary item in cache', { itemId });
      }
    }

  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to update vocabulary item statistics', eventBus);
    throw new DataError('Failed to update vocabulary item statistics', { itemId, error: typedError });
  }
}

// Cache configuration
const CACHE_KEY = 'vocabulary-cache';
const CACHE_EXPIRY_HOURS = 24;

/**
 * Load vocabulary data from various sources with fallback mechanism
 * @param eventBus Optional event bus for error handling
 * @throws DataError if all loading methods fail
 */
export async function loadVocabulary(eventBus?: EventBus): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    // Try to load from static endpoint first (fastest)
    return await loadFromStaticEndpoint(eventBus);
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary from static endpoint', eventBus);
    // Failed to load from static endpoint, trying cache
    try {
      // Fallback to cache
      return await loadFromCache(eventBus);
    } catch (cacheError: unknown) {
      const typedCacheError = cacheError instanceof Error ? cacheError : new Error(String(cacheError));
      ErrorHandler.handleError(typedCacheError, 'Failed to load vocabulary from cache', eventBus);
      // Failed to load from cache, trying bundled data
      try {
        // Final fallback to bundled data
        return await loadBundledData(eventBus);
      } catch (bundledError: unknown) {
        const typedBundledError = bundledError instanceof Error ? bundledError : new Error(String(bundledError));
        ErrorHandler.handleError(typedBundledError, 'Failed to load vocabulary from bundled data', eventBus);
        // All loading methods failed
        throw new DataError('Failed to load vocabulary data from all sources', {
          error: error as Error,
          cacheError: cacheError as Error,
          bundledError: bundledError as Error
        });
      }
    }
  }
}

/**
 * Load vocabulary from static endpoint
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
async function loadFromStaticEndpoint(eventBus?: EventBus): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    // In Node.js environment (tests, scripts), load directly from the source file
    // In browser environment, fetch from static endpoint
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // Node.js environment - read file directly
      // @vite-ignore
      const fs = await import('fs/promises');
      // @vite-ignore
      const path = await import('path');
      // @vite-ignore
      const { fileURLToPath } = await import('url');
      // @vite-ignore
      const { dirname } = await import('path');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const filePath = path.join(__dirname, 'unified-vocabulary.json');

      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      return ResilientUnifiedVocabularyCollectionSchema.parse(jsonData);
    } else {
      // Browser environment - fetch from static endpoint
      const response = await fetch(`${base}/data/unified-vocabulary.json`);

      if (!response.ok) {
        throw new DataError(`HTTP error! status: ${response.status}`, { status: response.status });
      }

      const data = await response.json();
      return ResilientUnifiedVocabularyCollectionSchema.parse(data);
    }
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary from static endpoint', eventBus);
    throw new DataError('Failed to load vocabulary from static endpoint', { error: typedError });
  }
}

/**
 * Load vocabulary from localStorage cache
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
async function loadFromCache(eventBus?: EventBus): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    // In Node.js environment, skip cache
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      throw new Error('Cache not available in Node.js environment');
    }

    if (typeof localStorage === 'undefined') {
      throw new DataError('localStorage not available');
    }

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      throw new DataError('No cached vocabulary data found');
    }

    const { data, timestamp } = JSON.parse(cachedData);

    // Check if cache is expired
    const now = new Date();
    const cacheDate = new Date(timestamp);
    const hoursDiff = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > CACHE_EXPIRY_HOURS) {
      throw new DataError('Cache expired', { hoursDiff, cacheExpiryHours: CACHE_EXPIRY_HOURS });
    }

    return ResilientUnifiedVocabularyCollectionSchema.parse(data);
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary from cache', eventBus);
    throw new DataError('Failed to load vocabulary from cache', { error: typedError });
  }
}

/**
 * Load bundled vocabulary data (fallback)
 * Handles both browser and Node.js environments
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
async function loadBundledData(eventBus?: EventBus): Promise<z.infer<typeof UnifiedVocabularyCollectionSchema>> {
  try {
    // In Node.js environment, load directly from the source file
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // @vite-ignore
      const fs = await import('fs/promises');
      // @vite-ignore
      const path = await import('path');
      // @vite-ignore
      const { fileURLToPath } = await import('url');
      // @vite-ignore
      const { dirname } = await import('path');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const filePath = path.join(__dirname, 'unified-vocabulary.json');

      const data = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(data);
      return ResilientUnifiedVocabularyCollectionSchema.parse(jsonData);
    }

    // Browser environment - use fetch API
    let jsonData: unknown = null;
    try {
      const response = await fetch(`${base}/data/unified-vocabulary.json`);
      if (!response.ok) {
        throw new DataError(`HTTP error! status: ${response.status}`, { status: response.status });
      }
      jsonData = await response.json();
    } catch (_fetchError) {
      jsonData = null;
    }

    if (jsonData) {
      try {
        return ResilientUnifiedVocabularyCollectionSchema.parse(jsonData);
      } catch (_parseError) {
        // Continue to fallback collection below
      }
    }

    // Final fallback to an empty but well-formed collection
    const fallbackCollection = {
      id: crypto.randomUUID(),
      name: 'German-Bulgarian Vocabulary Collection (Fallback)',
      description: 'Fallback vocabulary collection when bundled data is unavailable',
      items: [],
      languagePair: 'de-bg' as const,
      difficultyRange: [1, 5] as [number, number],
      categories: [],
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    return ResilientUnifiedVocabularyCollectionSchema.parse(fallbackCollection);
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load bundled vocabulary data', eventBus);
    throw new DataError('Failed to load bundled vocabulary data', { error: typedError });
  }
}

/**
 * Cache vocabulary data in localStorage
 */
export function cacheVocabulary(data: z.infer<typeof UnifiedVocabularyCollectionSchema>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const cacheData = {
    data,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

/**
 * Load vocabulary by search parameters
 * @param params Search parameters
 * @param eventBus Optional event bus for error handling
 */
export async function loadVocabularyBySearch(
  params: VocabularySearchParams,
  eventBus?: EventBus
): Promise<{ items: z.infer<typeof UnifiedVocabularyItemSchema>[]; total: number; hasMore: boolean }> {
  try {
    const collection = await loadVocabulary(eventBus);
    let items = [...collection.items];

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      items = items.filter(item =>
        item.german.toLowerCase().includes(query) ||
        item.bulgarian.toLowerCase().includes(query) ||
        ((item.examples && item.examples.some((example: { german?: string; bulgarian?: string }) =>
          (example.german && example.german.toLowerCase().includes(query)) ||
          (example.bulgarian && example.bulgarian.toLowerCase().includes(query)))) ?? false)
      );
    }

    if (params.partOfSpeech) {
      items = items.filter(item => item.partOfSpeech === params.partOfSpeech);
    }

    if (params.difficulty) {
      items = items.filter(item => item.difficulty === params.difficulty);
    }

    if (params.categories && params.categories.length > 0) {
      items = items.filter(item =>
        item.categories.some(category => params.categories?.includes(category))
      );
    }

    // Get total count before pagination
    const total = items.length;

    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;

    items = items.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: offset + limit < total
    };
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to search vocabulary', eventBus);
    throw new DataError('Failed to search vocabulary', { params, error: typedError });
  }
}

/**
 * Load vocabulary by ID
 * @param id The ID of the vocabulary item
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
export async function loadVocabularyById(id: string, eventBus?: EventBus): Promise<z.infer<typeof UnifiedVocabularyItemSchema> | null> {
  try {
    const collection = await loadVocabulary(eventBus);
    return collection.items.find(item => item.id === id) || null;
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary by ID', eventBus);
    throw new DataError('Failed to load vocabulary by ID', { id, error: typedError });
  }
}

/**
 * Load vocabulary by category
 * @param category The category to filter by
 * @param options Filtering options
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
export async function loadVocabularyByCategory(
  category: z.infer<typeof VocabularyCategorySchema>,
  options: { limit?: number; difficulty?: number } = {},
  eventBus?: EventBus
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  try {
    const collection = await loadVocabulary(eventBus);

    let items = collection.items.filter(item =>
      item.categories.includes(category)
    );

    if (options.difficulty) {
      items = items.filter(item => item.difficulty === options.difficulty);
    }

    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary by category', eventBus);
    throw new DataError('Failed to load vocabulary by category', { category, options, error: typedError });
  }
}

/**
 * Load vocabulary by difficulty level
 * @param difficulty The difficulty level to filter by
 * @param options Filtering options
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
export async function loadVocabularyByDifficulty(
  difficulty: number,
  options: { limit?: number; category?: string } = {},
  eventBus?: EventBus
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  try {
    const collection = await loadVocabulary(eventBus);

    let items = collection.items.filter(item =>
      item.difficulty === difficulty
    );

    if (options.category) {
      const category = options.category as z.infer<typeof VocabularyCategorySchema>;
      items = items.filter(item => item.categories.includes(category));
    }

    if (options.limit) {
      items = items.slice(0, options.limit);
    }

    return items;
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to load vocabulary by difficulty', eventBus);
    throw new DataError('Failed to load vocabulary by difficulty', { difficulty, options, error: typedError });
  }
}

/**
 * Get random vocabulary items
 * @param count Number of items to return
 * @param options Filtering options
 * @param eventBus Optional event bus for error handling
 * @throws DataError if loading fails
 */
export async function getRandomVocabulary(
  count: number = 5,
  options: { difficulty?: number; category?: string } = {},
  eventBus?: EventBus
): Promise<z.infer<typeof UnifiedVocabularyItemSchema>[]> {
  try {
    const collection = await loadVocabulary(eventBus);

    let items = [...collection.items];

    if (options.difficulty) {
      items = items.filter((item: z.infer<typeof UnifiedVocabularyItemSchema>) => item.difficulty === options.difficulty);
    }

    if (options.category) {
      const category = options.category as z.infer<typeof VocabularyCategorySchema>;
      items = items.filter((item: z.infer<typeof UnifiedVocabularyItemSchema>) => item.categories.includes(category));
    }

    // Shuffle and select random items
    const shuffled = items.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to get random vocabulary items', eventBus);
    throw new DataError('Failed to get random vocabulary items', { count, options, error: typedError });
  }
}

/**
 * Initialize vocabulary data (should be called during app startup)
 * @param eventBus Optional event bus for error handling
 * @throws DataError if initialization fails
 */
export async function initializeVocabulary(eventBus?: EventBus): Promise<void> {
  try {
    // Load and cache vocabulary data
    const vocabulary = await loadVocabulary(eventBus);
    cacheVocabulary(vocabulary);
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handleError(typedError, 'Failed to initialize vocabulary data', eventBus);
    throw new DataError('Failed to initialize vocabulary data', { error: typedError });
  }
}