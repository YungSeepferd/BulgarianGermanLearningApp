/**
 * Chunked Vocabulary Loader
 *
 * Provides progressive loading of vocabulary data by CEFR level.
 * Supports:
 * - Index-only loading for browsing/listing (~15-20KB)
 * - Level-based chunk loading on demand
 * - Individual item fetching
 * - Pre-computed search index usage
 */

import { base } from '$app/paths';
import { browser } from '$app/environment';
import { Debug } from '../utils';
import { DataError, ErrorHandler } from '../services/errors';
import { EventBus } from '../services/event-bus';
import { z } from 'zod';
import Fuse from 'fuse.js';
import type { IFuseOptions, FuseIndexRecords } from 'fuse.js';

import {
  ResilientUnifiedVocabularyItemSchema,
  type UnifiedVocabularyItem
} from '../schemas/unified-vocabulary';
import {
  VocabularyIndexSchema,
  type VocabularyIndex,
  type CEFRLevel,
  CEFR_LEVELS
} from '../schemas/vocabulary-index';

// ======================
// Configuration
// ======================

const CACHE_KEY_PREFIX = 'vocab-chunk-';
const INDEX_CACHE_KEY = 'vocab-index-v2';
const SEARCH_INDEX_CACHE_KEY = 'vocab-search-index-v2';
const CACHE_EXPIRY_HOURS = 24;

// ======================
// In-Memory Cache
// ======================

const chunkCache = new Map<CEFRLevel, UnifiedVocabularyItem[]>();
let indexCache: VocabularyIndex | null = null;
let searchIndexCache: {
  index: { keys: string[]; records: FuseIndexRecords };
  options: IFuseOptions<UnifiedVocabularyItem>;
  idToLevelMap: Record<string, CEFRLevel>;
  miniIndex: Array<{
    id: string;
    german: string;
    bulgarian: string;
    cefrLevel: string;
    partOfSpeech: string;
    categories: string[];
  }>;
} | null = null;

// ======================
// Types
// ======================

export interface LoadOptions {
  eventBus?: EventBus;
  forceRefresh?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: string;
  version: number;
}

// ======================
// Index Loading
// ======================

/**
 * Load the master index with metadata for all items
 * This is lightweight (~15-20KB) and should be loaded first
 */
export async function loadIndex(options: LoadOptions = {}): Promise<VocabularyIndex> {
  if (!browser) {
    throw new DataError('Cannot load index during SSR');
  }

  if (indexCache && !options.forceRefresh) {
    return indexCache;
  }

  try {
    Debug.log('vocabulary-loader', 'Loading vocabulary index');

    // Try localStorage first
    const cached = localStorage.getItem(INDEX_CACHE_KEY);
    if (cached && !options.forceRefresh) {
      try {
        const entry: CacheEntry<unknown> = JSON.parse(cached);
        const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);

        if (age < CACHE_EXPIRY_HOURS && entry.version === 1) {
          const parsed = VocabularyIndexSchema.parse(entry.data);
          indexCache = parsed;
          Debug.log('vocabulary-loader', 'Index loaded from cache', { age: `${age.toFixed(1)}h` });
          return parsed;
        }
      } catch (e) {
        // Cache parse error, continue to fetch
        Debug.log('vocabulary-loader', 'Cache parse error, fetching fresh');
      }
    }

    // Fetch from network
    const response = await fetch(`${base}/data/vocabulary/index.json`);
    if (!response.ok) {
      throw new DataError(`HTTP ${response.status} loading index`);
    }

    const data = await response.json();
    const parsed = VocabularyIndexSchema.parse(data);
    indexCache = parsed;

    // Cache in localStorage
    const cacheEntry: CacheEntry<VocabularyIndex> = {
      data: parsed,
      timestamp: new Date().toISOString(),
      version: 1
    };

    try {
      localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (e) {
      // localStorage might be full
      Debug.log('vocabulary-loader', 'Failed to cache index to localStorage', { error: e });
    }

    Debug.log('vocabulary-loader', 'Index loaded from network', {
      items: parsed.totalItems,
      size: `${(JSON.stringify(data).length / 1024).toFixed(1)}KB`
    });

    return parsed;
  } catch (error) {
    ErrorHandler.handleError(error, 'Failed to load vocabulary index', options.eventBus);
    throw new DataError('Failed to load vocabulary index', { error });
  }
}

// ======================
// Level Chunk Loading
// ======================

/**
 * Load a specific CEFR level chunk
 */
export async function loadLevelChunk(
  level: CEFRLevel,
  options: LoadOptions = {}
): Promise<UnifiedVocabularyItem[]> {
  if (!browser) {
    throw new DataError('Cannot load chunks during SSR');
  }

  // Check memory cache
  if (chunkCache.has(level) && !options.forceRefresh) {
    return chunkCache.get(level)!;
  }

  // Check localStorage
  const cacheKey = `${CACHE_KEY_PREFIX}${level}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached && !options.forceRefresh) {
      try {
        const entry: CacheEntry<unknown> = JSON.parse(cached);
        const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);

        if (age < CACHE_EXPIRY_HOURS && entry.version === 1) {
          const parsed = z.array(ResilientUnifiedVocabularyItemSchema).parse(entry.data);
          chunkCache.set(level, parsed);
          Debug.log('vocabulary-loader', `Level ${level} loaded from cache`, { count: parsed.length });
          return parsed;
        }
      } catch (e) {
        // Cache parse error
        Debug.log('vocabulary-loader', `Level ${level} cache parse error`);
      }
    }
  } catch (e) {
    // localStorage not available
  }

  // Fetch from network
  try {
    Debug.log('vocabulary-loader', `Loading level ${level} chunk`);
    const response = await fetch(`${base}/data/vocabulary/${level}.json`);

    if (!response.ok) {
      throw new DataError(`HTTP ${response.status} loading ${level}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new DataError(`Invalid ${level} chunk format: expected array`);
    }

    // Parse with resilient schema to handle bad data
    const items = data.map((item, index) => {
      try {
        return ResilientUnifiedVocabularyItemSchema.parse(item);
      } catch (e) {
        Debug.log('vocabulary-loader', `Item ${index} in ${level} failed parsing`, { error: e });
        return null;
      }
    }).filter((item): item is UnifiedVocabularyItem => item !== null);

    // Update caches
    chunkCache.set(level, items);

    try {
      const cacheEntry: CacheEntry<unknown> = {
        data: items,
        timestamp: new Date().toISOString(),
        version: 1
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (e) {
      // localStorage might be full
      Debug.log('vocabulary-loader', 'Failed to cache chunk to localStorage', { error: e });
    }

    Debug.log('vocabulary-loader', `Level ${level} loaded`, { count: items.length });
    return items;
  } catch (error) {
    ErrorHandler.handleError(error, `Failed to load level ${level}`, options.eventBus);
    throw new DataError(`Failed to load level ${level}`, { level, error });
  }
}

/**
 * Load multiple levels at once
 */
export async function loadLevels(
  levels: CEFRLevel[],
  options: LoadOptions = {}
): Promise<UnifiedVocabularyItem[]> {
  const chunks = await Promise.all(
    levels.map(level => loadLevelChunk(level, options))
  );
  return chunks.flat();
}

// ======================
// Item Lookup
// ======================

/**
 * Get a specific item by ID
 * Uses index to determine level, then loads appropriate chunk
 */
export async function getItemById(
  id: string,
  options: LoadOptions = {}
): Promise<UnifiedVocabularyItem | null> {
  // First check loaded chunks
  for (const items of chunkCache.values()) {
    const found = items.find(item => item.id === id);
    if (found) return found;
  }

  // Load index to find which level
  const index = await loadIndex(options);
  const indexItem = index.items.find(item => item.id === id);

  if (!indexItem) {
    return null;
  }

  // Load the appropriate level chunk
  const level = indexItem.cefrLevel as CEFRLevel;
  const chunk = await loadLevelChunk(level, options);

  return chunk.find(item => item.id === id) || null;
}

// ======================
// Search Index
// ======================

/**
 * Load and initialize pre-computed search index
 */
export async function loadSearchIndex(options: LoadOptions = {}): Promise<{
  fuse: Fuse<UnifiedVocabularyItem> | null;
  miniIndex: typeof searchIndexCache extends null ? never : NonNullable<typeof searchIndexCache>['miniIndex'];
  idToLevelMap: Record<string, CEFRLevel>;
}> {
  if (searchIndexCache && !options.forceRefresh) {
    // Rehydrate Fuse from cached index using parseIndex
    const fuseIndex = Fuse.parseIndex<UnifiedVocabularyItem>(
      searchIndexCache.index as { keys: string[]; records: FuseIndexRecords }
    );
    const fuse = new Fuse<UnifiedVocabularyItem>(
      [],
      searchIndexCache.options,
      fuseIndex
    );
    return {
      fuse,
      miniIndex: searchIndexCache.miniIndex,
      idToLevelMap: searchIndexCache.idToLevelMap
    };
  }

  try {
    // Try localStorage first
    const cached = localStorage.getItem(SEARCH_INDEX_CACHE_KEY);
    if (cached && !options.forceRefresh) {
      try {
        const entry: CacheEntry<unknown> = JSON.parse(cached);
        const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);

        if (age < CACHE_EXPIRY_HOURS && entry.version === 1) {
          const data = entry.data as NonNullable<typeof searchIndexCache>;

          searchIndexCache = data;

          // Rehydrate Fuse from cached data using parseIndex
          const fuseIndex = Fuse.parseIndex<UnifiedVocabularyItem>(
            data.index as { keys: string[]; records: FuseIndexRecords }
          );
          const fuse = new Fuse<UnifiedVocabularyItem>(
            [],
            data.options,
            fuseIndex
          );

          return {
            fuse,
            miniIndex: data.miniIndex,
            idToLevelMap: data.idToLevelMap
          };
        }
      } catch (e) {
        Debug.log('vocabulary-loader', 'Search index cache parse error');
      }
    }

    // Fetch from network
    const response = await fetch(`${base}/data/vocabulary/search-index.json`);
    if (!response.ok) {
      throw new DataError(`HTTP ${response.status} loading search index`);
    }

    const data = await response.json();

    // Cache the raw data
    searchIndexCache = {
      index: data.index,
      options: data.fuseOptions,
      idToLevelMap: data.idToLevelMap,
      miniIndex: data.miniIndex
    };

    try {
      const cacheEntry: CacheEntry<typeof searchIndexCache> = {
        data: searchIndexCache,
        timestamp: new Date().toISOString(),
        version: 1
      };
      localStorage.setItem(SEARCH_INDEX_CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (e) {
      Debug.log('vocabulary-loader', 'Failed to cache search index to localStorage', { error: e });
    }

    // Rehydrate Fuse using parseIndex
    const fuseIndex = Fuse.parseIndex<UnifiedVocabularyItem>(
      data.index as { keys: string[]; records: FuseIndexRecords }
    );
    const fuse = new Fuse<UnifiedVocabularyItem>(
      [],
      data.fuseOptions,
      fuseIndex
    );

    return {
      fuse,
      miniIndex: data.miniIndex,
      idToLevelMap: data.idToLevelMap
    };
  } catch (error) {
    ErrorHandler.handleError(error, 'Failed to load search index', options.eventBus);
    // Return null fuse but still provide mini-index if available
    return { fuse: null, miniIndex: [], idToLevelMap: {} };
  }
}

/**
 * Search using pre-computed index
 */
export async function searchWithIndex(
  query: string,
  options: {
    limit?: number;
    loadItems?: boolean; // Whether to load full items or return mini-index results
  } = {}
): Promise<Array<{ item?: UnifiedVocabularyItem; mini: { id: string; german: string; bulgarian: string; cefrLevel: string; partOfSpeech: string; categories: string[] }; score: number }>> {
  const { fuse, miniIndex } = await loadSearchIndex();
  const limit = options.limit || 20;

  if (!fuse) {
    // Fallback to mini-index filtering
    const q = query.toLowerCase();
    const filtered = miniIndex
      .filter(m =>
        m.german.toLowerCase().includes(q) ||
        m.bulgarian.toLowerCase().includes(q)
      )
      .slice(0, limit);

    return filtered.map(m => ({ mini: m, score: 0 }));
  }

  // Use Fuse index for fuzzy search
  // Note: Fuse index doesn't contain the items, so we search the mini-index
  // and then load full items if needed
  const results: Array<{ mini: typeof miniIndex[0]; score: number }> = [];

  // Simple search on mini-index for now (Fuse index needs actual items to work against)
  // TODO: Enhance to use the Fuse index properly with the mini-index
  const q = query.toLowerCase();
  const matches = miniIndex.filter(m =>
    m.german.toLowerCase().includes(q) ||
    m.bulgarian.toLowerCase().includes(q) ||
    m.categories.some(c => c.toLowerCase().includes(q))
  );

  for (const mini of matches.slice(0, limit)) {
    results.push({ mini, score: 0 });
  }

  // Load full items if requested
  if (options.loadItems) {
    const withItems = await Promise.all(
      results.map(async r => {
        const item = await getItemById(r.mini.id);
        return { ...r, item };
      })
    );
    return withItems.filter((r): r is typeof r & { item: NonNullable<typeof r['item']> } => r.item != null);
  }

  return results;
}

// ======================
// Cache Management
// ======================

/**
 * Clear all vocabulary caches
 */
export function clearChunkCache(): void {
  chunkCache.clear();
  indexCache = null;
  searchIndexCache = null;

  if (typeof localStorage !== 'undefined') {
    // Clear all vocabulary cache keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX) ||
          key === INDEX_CACHE_KEY ||
          key === SEARCH_INDEX_CACHE_KEY ||
          key?.startsWith('vocab-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  Debug.log('vocabulary-loader', 'All caches cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  memoryChunks: CEFRLevel[];
  localStorageKeys: string[];
  indexLoaded: boolean;
  searchIndexLoaded: boolean;
  totalCachedItems: number;
} {
  let localStorageKeys: string[] = [];

  if (typeof localStorage !== 'undefined') {
    localStorageKeys = Object.keys(localStorage).filter(k =>
      k.startsWith(CACHE_KEY_PREFIX) ||
      k === INDEX_CACHE_KEY ||
      k === SEARCH_INDEX_CACHE_KEY
    );
  }

  let totalCachedItems = 0;
  for (const items of chunkCache.values()) {
    totalCachedItems += items.length;
  }

  return {
    memoryChunks: Array.from(chunkCache.keys()),
    localStorageKeys,
    indexLoaded: indexCache !== null,
    searchIndexLoaded: searchIndexCache !== null,
    totalCachedItems
  };
}

// ======================
// Legacy Compatibility
// ======================

/**
 * Load all vocabulary (legacy compatibility)
 * Aggregates all level chunks into a single collection
 */
export async function loadAllVocabulary(options: LoadOptions = {}): Promise<{
  items: UnifiedVocabularyItem[];
  total: number;
  byLevel: Record<CEFRLevel, number>;
}> {
  const index = await loadIndex(options);
  const levelsToLoad = CEFR_LEVELS.filter(level => index.levels[level].count > 0);

  const allItems = await loadLevels(levelsToLoad, options);

  const byLevel: Record<CEFRLevel, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, C1: 0
  };

  for (const item of allItems) {
    const level = (item.cefrLevel || 'A1') as CEFRLevel;
    if (CEFR_LEVELS.includes(level)) {
      byLevel[level]++;
    }
  }

  return {
    items: allItems,
    total: allItems.length,
    byLevel
  };
}
