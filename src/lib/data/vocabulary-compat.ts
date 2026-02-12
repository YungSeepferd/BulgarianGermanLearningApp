/**
 * Vocabulary Compatibility Layer
 *
 * Maintains the legacy loader.ts API while using the new chunked loader internally.
 * This allows gradual migration of components without breaking changes.
 *
 * @deprecated Use vocabulary-loader.ts or vocabulary-repository.svelte.ts directly
 */

import { DataError, ErrorHandler } from '../services/errors';
import { EventBus } from '../services/event-bus';
import { Debug } from '../utils';

import {
  UnifiedVocabularyCollectionSchema,
  type UnifiedVocabularyCollection,
  type UnifiedVocabularyItem
} from '../schemas/unified-vocabulary';

import {
  vocabularyRepository,
  getRepositoryStats,
  isLevelLoaded,
  ensureLevelLoaded
} from './vocabulary-repository.svelte';

// Re-export types for compatibility
export type { VocabularySearchParams } from './loader';

// Helper to build options with optional eventBus
function buildOptions(eventBus?: EventBus): { eventBus?: EventBus } {
  return eventBus ? buildOptions(eventBus) : {};
}

// ======================
// Legacy API Implementation
// ======================

/**
 * Load full vocabulary collection (legacy compatibility)
 * Aggregates all level chunks into collection format
 * @deprecated Use vocabularyRepository.initialize() + vocabularyRepository.getAll()
 */
export async function loadVocabulary(eventBus?: EventBus): Promise<UnifiedVocabularyCollection> {
  Debug.log('vocabulary-compat', 'loadVocabulary() called - using chunked loader');

  try {
    // Try new repository first
    if (!vocabularyRepository.loaded) {
      await vocabularyRepository.initialize(buildOptions(eventBus));
    }

    // Ensure all levels are loaded
    await vocabularyRepository.loadAll(buildOptions(eventBus));

    const allItems = vocabularyRepository.getAll();

    // Build collection from chunks
    const collection: UnifiedVocabularyCollection = {
      id: crypto.randomUUID(),
      name: 'German-Bulgarian Vocabulary',
      description: `Chunked vocabulary with ${allItems.length} items`,
      languagePair: 'de-bg',
      difficultyRange: [1, 5] as [number, number],
      categories: [...new Set(allItems.flatMap(i => i.categories))],
      itemCount: allItems.length,
      items: allItems,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 2 // Version bump for chunked format
    };

    return UnifiedVocabularyCollectionSchema.parse(collection);

  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.loadVocabulary', eventBus);

    // Fall back to legacy loader
    Debug.log('vocabulary-compat', 'Falling back to legacy loader');
    const { loadVocabulary: legacyLoad } = await import('./loader');
    return legacyLoad(eventBus);
  }
}

/**
 * Load vocabulary by search parameters (legacy compatibility)
 * @deprecated Use vocabularyRepository.search()
 */
export async function loadVocabularyBySearch(
  params: {
    query?: string;
    partOfSpeech?: string;
    difficulty?: number;
    categories?: string[];
    limit?: number;
    offset?: number;
  },
  eventBus?: EventBus
): Promise<{ items: UnifiedVocabularyItem[]; total: number; hasMore: boolean }> {
  Debug.log('vocabulary-compat', 'loadVocabularyBySearch() called', { params });

  try {
    // Initialize repository
    if (!vocabularyRepository.loaded) {
      await vocabularyRepository.initialize(buildOptions(eventBus));
    }

    // If we have a query, use search
    if (params.query) {
      const searchResults = await vocabularyRepository.search(params.query, {
        ...(params.limit !== undefined && { limit: params.limit }),
        loadFullItems: true
      });

      let items = searchResults
        .map(r => r.item)
        .filter((item): item is UnifiedVocabularyItem => item !== undefined);

      // Apply additional filters
      if (params.partOfSpeech) {
        items = items.filter(i => i.partOfSpeech === params.partOfSpeech);
      }

      if (params.difficulty) {
        items = items.filter(i => i.difficulty === params.difficulty);
      }

      if (params.categories && params.categories.length > 0) {
        items = items.filter(i =>
          i.categories.some(c => params.categories?.includes(c))
        );
      }

      const total = items.length;
      const offset = params.offset || 0;
      const limit = params.limit || 20;

      items = items.slice(offset, offset + limit);

      return {
        items,
        total,
        hasMore: offset + limit < total
      };
    }

    // No query - use filtering on loaded items
    let items = vocabularyRepository.getAll();

    if (params.partOfSpeech) {
      items = items.filter(i => i.partOfSpeech === params.partOfSpeech);
    }

    if (params.difficulty) {
      items = items.filter(i => i.difficulty === params.difficulty);
    }

    if (params.categories && params.categories.length > 0) {
      items = items.filter(i =>
        i.categories.some(c => params.categories?.includes(c))
      );
    }

    const total = items.length;
    const offset = params.offset || 0;
    const limit = params.limit || 20;

    items = items.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: offset + limit < total
    };

  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.loadVocabularyBySearch', eventBus);

    // Fall back to legacy
    const { loadVocabularyBySearch: legacySearch } = await import('./loader');
    return legacySearch(params, eventBus);
  }
}

/**
 * Load vocabulary item by ID (legacy compatibility)
 * @deprecated Use vocabularyRepository.getById()
 */
export async function loadVocabularyById(
  id: string,
  eventBus?: EventBus
): Promise<UnifiedVocabularyItem | null> {
  Debug.log('vocabulary-compat', 'loadVocabularyById() called', { id });

  try {
    // Use repository which handles chunked lookup
    const item = await vocabularyRepository.getById(id);
    return item || null;
  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.loadVocabularyById', eventBus);
    return null;
  }
}

/**
 * Load vocabulary by category (legacy compatibility)
 * @deprecated Use vocabularyRepository.getAll() + filtering
 */
export async function loadVocabularyByCategory(
  category: string,
  options: { limit?: number; difficulty?: number } = {},
  eventBus?: EventBus
): Promise<UnifiedVocabularyItem[]> {
  Debug.log('vocabulary-compat', 'loadVocabularyByCategory() called', { category, options });

  try {
    // Ensure loaded
    if (!vocabularyRepository.loaded) {
      await vocabularyRepository.initialize(buildOptions(eventBus));
    }

    // Get from index (which has all items' metadata)
    const indexItems = vocabularyRepository.getAllIndexItems();

    // Find items in category
    const matchingIds = indexItems
      .filter(i => i.categories.includes(category as any))
      .map(i => i.id);

    // Load full items
    const items: UnifiedVocabularyItem[] = [];
    for (const id of matchingIds.slice(0, options.limit || 100)) {
      const item = await vocabularyRepository.getById(id);
      if (item) {
        // Apply difficulty filter
        if (options.difficulty && item.difficulty !== options.difficulty) {
          continue;
        }
        items.push(item);
      }
    }

    return items;

  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.loadVocabularyByCategory', eventBus);
    return [];
  }
}

/**
 * Load vocabulary by difficulty (legacy compatibility)
 * @deprecated Use vocabularyRepository.getAll() + filtering
 */
export async function loadVocabularyByDifficulty(
  difficulty: number,
  options: { limit?: number; category?: string } = {},
  eventBus?: EventBus
): Promise<UnifiedVocabularyItem[]> {
  Debug.log('vocabulary-compat', 'loadVocabularyByDifficulty() called', { difficulty, options });

  try {
    // Ensure loaded
    if (!vocabularyRepository.loaded) {
      await vocabularyRepository.initialize(buildOptions(eventBus));
    }

    // Get from index
    const indexItems = vocabularyRepository.getAllIndexItems();

    // Filter by difficulty
    let matchingIds = indexItems
      .filter(i => i.difficulty === difficulty)
      .map(i => i.id);

    // Apply category filter if specified
    if (options.category) {
      matchingIds = indexItems
        .filter(i =>
          i.difficulty === difficulty &&
          i.categories.includes(options.category as any)
        )
        .map(i => i.id);
    }

    // Load full items
    const items: UnifiedVocabularyItem[] = [];
    for (const id of matchingIds.slice(0, options.limit || 100)) {
      const item = await vocabularyRepository.getById(id);
      if (item) {
        items.push(item);
      }
    }

    return items;

  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.loadVocabularyByDifficulty', eventBus);
    return [];
  }
}

/**
 * Get random vocabulary items (legacy compatibility)
 * @deprecated Use vocabularyRepository.getAll() + shuffle
 */
export async function getRandomVocabulary(
  count: number = 5,
  options: { difficulty?: number; category?: string } = {},
  eventBus?: EventBus
): Promise<UnifiedVocabularyItem[]> {
  Debug.log('vocabulary-compat', 'getRandomVocabulary() called', { count, options });

  try {
    // Load all levels for random selection
    if (!vocabularyRepository.loaded) {
      await vocabularyRepository.initialize(buildOptions(eventBus));
    }
    await vocabularyRepository.loadAll(buildOptions(eventBus));

    let items = vocabularyRepository.getAll();

    if (options.difficulty) {
      items = items.filter(i => i.difficulty === options.difficulty);
    }

    if (options.category) {
      items = items.filter(i => i.categories.includes(options.category as any));
    }

    // Shuffle and select
    const shuffled = items.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));

  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.getRandomVocabulary', eventBus);
    return [];
  }
}

/**
 * Initialize vocabulary data (legacy compatibility)
 * @deprecated Use vocabularyRepository.initialize()
 */
export async function initializeVocabulary(eventBus?: EventBus): Promise<void> {
  Debug.log('vocabulary-compat', 'initializeVocabulary() called');

  try {
    await vocabularyRepository.initialize(buildOptions(eventBus));
  } catch (error) {
    ErrorHandler.handleError(error, 'vocabulary-compat.initializeVocabulary', eventBus);
    throw new DataError('Failed to initialize vocabulary', { error });
  }
}

/**
 * Cache vocabulary data (legacy compatibility - no-op with new loader)
 * @deprecated Caching is now handled automatically by vocabulary-loader
 */
export function cacheVocabulary(_data: unknown): void {
  Debug.log('vocabulary-compat', 'cacheVocabulary() called - no-op, caching is automatic');
  // No-op: caching is now automatic in vocabulary-loader
}

// ======================
// New API Exports
// ======================

/**
 * Get repository statistics (new API)
 */
export { getRepositoryStats, isLevelLoaded, ensureLevelLoaded };

/**
 * Get the underlying repository instance (for advanced use)
 */
export function getVocabularyRepository() {
  return vocabularyRepository;
}

/**
 * Check if using chunked loader (diagnostic)
 */
export function isChunkedLoaderActive(): boolean {
  return vocabularyRepository.loaded && !!vocabularyRepository.index;
}
