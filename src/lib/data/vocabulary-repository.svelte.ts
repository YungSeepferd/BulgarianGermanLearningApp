import { browser } from '$app/environment';
import { ErrorHandler } from '$lib/services/errors';
import { Debug } from '$lib/utils';
import Fuse from 'fuse.js';

import {
  loadIndex,
  loadLevelChunk,
  getItemById as getItemFromLoader,
  loadSearchIndex,
  searchWithIndex,
  clearChunkCache,
  getCacheStats
} from './vocabulary-loader';

export interface LoadOptions {
  forceRefresh?: boolean;
}

import type { UnifiedVocabularyItem } from '$lib/schemas/unified-vocabulary';
import type {
  VocabularyIndex,
  VocabularyIndexItem,
  CEFRLevel
} from '$lib/schemas/vocabulary-index';

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * VocabularyRepository with chunked lazy loading
 *
 * Features:
 * - Loads lightweight index first (~15-20KB)
 * - Loads CEFR level chunks on demand
 * - Maintains in-memory cache of loaded chunks
 * - Pre-computed search index for instant results
 * - SSR-safe: does not fetch on server
 */
class VocabularyRepository {
  // ======================
  // State
  // ======================

  /** Master index with all item metadata */
  index = $state<VocabularyIndex | null>(null);

  /** Set of loaded CEFR levels */
  loadedLevels = $state<Set<CEFRLevel>>(new Set());

  /** Currently loading level (for UI loading states) */
  loadingLevel = $state<CEFRLevel | null>(null);

  /** Whether initial load is complete */
  loaded = $state<boolean>(false);

  /** Whether search index is ready */
  searchReady = $state<boolean>(false);

  /** Error state for tracking initialization/loading failures */
  error = $state<Error | null>(null);

  /** Number of retry attempts */
  retryCount = $state<number>(0);

  /** Maximum number of retry attempts */
  readonly MAX_RETRIES = 3;

  // ======================
  // Private Storage
  // ======================

  /** In-memory storage by level */
  itemsByLevel = new Map<CEFRLevel, UnifiedVocabularyItem[]>();

  /** Fuse instance for search (rebuilt when levels load) */
  fuse: Fuse<UnifiedVocabularyItem> | null = null;

  /** Search index data from pre-computed index */
  searchIndexData: {
    miniIndex: Array<{
      id: string;
      german: string;
      bulgarian: string;
      cefrLevel: string;
      partOfSpeech: string;
      categories: string[];
    }>;
    idToLevelMap: Record<string, CEFRLevel>;
  } | null = null;

  /** Event bus for error handling */
  eventBus: undefined | undefined;

  // ======================
  // Constructor
  // ======================

  constructor(eventBus?: undefined) {
    this.eventBus = eventBus;
  }

  // ======================
  // Initialization
  // ======================

  /**
   * Initialize the repository by loading the index and A1 level
   * This is lightweight and fast (~15-20KB index + ~200KB A1 chunk)
   */
  async initialize(options: LoadOptions = {}): Promise<void> {
    if (!browser) {
      this.loaded = true; // Mark as loaded for SSR
      return;
    }

    if (this.loaded && this.index) {
      return;
    }

    // Clear any previous error
    this.error = null;

    try {
      Debug.log('VocabularyRepository', 'Initializing with chunked loader');

      // Load the lightweight index first
      this.index = await loadIndex(options);
      Debug.log('VocabularyRepository', 'Index loaded', {
        totalItems: this.index.totalItems,
        levels: Object.entries(this.index.levels).map(([l, s]) => `${l}:${s.count}`).join(', ')
      });

      // Auto-load A1 for immediate use (most items are A1)
      if (this.index.levels.A1.count > 0) {
        await this.loadLevel('A1', options);
      }

      // Load search index in background
      this.initializeSearch(options).catch(e => {
        Debug.log('VocabularyRepository', 'Search index initialization failed', { error: e });
        // Non-critical error - don't set main error state
      });

      this.loaded = true;
      this.error = null;
      this.retryCount = 0;
      Debug.log('VocabularyRepository', 'Initialized', {
        loadedLevels: Array.from(this.loadedLevels),
        loadedItems: this.getAll().length
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.error = err;
      this.loaded = false;
      ErrorHandler.handleError(err, 'VocabularyRepository.initialize', this.eventBus);

      // Try legacy loader as fallback during transition
      await this.fallbackToLegacyLoader();
    }
  }

  /**
   * Retry initialization after failure
   * Uses exponential backoff
   */
  async retry(): Promise<void> {
    if (this.retryCount >= this.MAX_RETRIES) {
      throw new Error(`Maximum retry attempts (${this.MAX_RETRIES}) exceeded`);
    }

    this.retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000); // Exponential backoff, max 10s

    Debug.log('VocabularyRepository', `Retrying initialization (attempt ${this.retryCount}/${this.MAX_RETRIES}) after ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));

    // Reset state and try again
    this.invalidate();
    return this.initialize();
  }

  /**
   * Initialize search index in background
   */
  async initializeSearch(options: LoadOptions = {}): Promise<void> {
    try {
      const { miniIndex, idToLevelMap } = await loadSearchIndex(options);
      this.searchIndexData = { miniIndex, idToLevelMap };
      this.searchReady = true;
      Debug.log('VocabularyRepository', 'Search index ready', {
        miniIndexSize: miniIndex.length
      });
    } catch (e) {
      Debug.log('VocabularyRepository', 'Failed to load search index', { error: e });
      // Build live index as fallback
      this.rebuildSearchIndex();
    }
  }

  // ======================
  // Level Loading
  // ======================

  /**
   * Load a specific CEFR level
   */
  async loadLevel(level: CEFRLevel, options: LoadOptions = {}): Promise<void> {
    if (!browser) return;

    // Already loaded
    if (this.loadedLevels.has(level)) {
      return;
    }

    // Check if level has any items
    if (this.index && this.index.levels[level].count === 0) {
      Debug.log('VocabularyRepository', `Level ${level} has no items, skipping`);
      this.loadedLevels.add(level); // Mark as "loaded" (empty)
      return;
    }

    try {
      this.loadingLevel = level;
      Debug.log('VocabularyRepository', `Loading level ${level}`);

      const items = await loadLevelChunk(level, options);
      this.itemsByLevel.set(level, items);
      this.loadedLevels.add(level);

      // Rebuild search index if using live index
      if (!this.searchReady) {
        this.rebuildSearchIndex();
      }

      Debug.log('VocabularyRepository', `Level ${level} loaded`, { count: items.length });
    } catch (error) {
      ErrorHandler.handleError(error, `VocabularyRepository.loadLevel(${level})`, this.eventBus);
    } finally {
      this.loadingLevel = null;
    }
  }

  /**
   * Load multiple levels
   */
  async loadLevels(levels: CEFRLevel[], options: LoadOptions = {}): Promise<void> {
    await Promise.all(levels.map(level => this.loadLevel(level, options)));
  }

  /**
   * Load all levels (not recommended for mobile)
   */
  async loadAll(options: LoadOptions = {}): Promise<void> {
    const levelsToLoad = ALL_LEVELS.filter(l =>
      this.index ? this.index.levels[l].count > 0 : true
    );
    await this.loadLevels(levelsToLoad, options);
  }

  /**
   * Backward compatibility alias for loadAll()
   * @deprecated Use initialize() for chunked loading or loadAll() for full loading
   */
  async load(options: LoadOptions = {}): Promise<void> {
    Debug.log('VocabularyRepository', 'load() called - using loadAll() for compatibility');
    return this.loadAll(options);
  }

  // ======================
  // Data Access
  // ======================

  /**
   * Get all loaded items across all levels
   */
  getAll(): UnifiedVocabularyItem[] {
    const all: UnifiedVocabularyItem[] = [];
    for (const items of this.itemsByLevel.values()) {
      all.push(...items);
    }
    return all;
  }

  /**
   * Get items from a specific level
   */
  getByLevel(level: CEFRLevel): UnifiedVocabularyItem[] {
    return this.itemsByLevel.get(level) || [];
  }

  /**
   * Get the set of loaded levels
   */
  getLoadedLevels(): Set<CEFRLevel> {
    return new Set(this.loadedLevels);
  }

  /**
   * Check if a level is loaded
   */
  isLevelLoaded(level: CEFRLevel): boolean {
    return this.loadedLevels.has(level);
  }

  /**
   * Get item by ID
   * Checks loaded chunks first, then loads on demand if needed
   */
  async getById(id: string): Promise<UnifiedVocabularyItem | undefined> {
    // Check in-memory first
    for (const items of this.itemsByLevel.values()) {
      const found = items.find(i => i.id === id);
      if (found) return found;
    }

    // If we know the level from search index, load that level
    if (this.searchIndexData?.idToLevelMap[id]) {
      const level = this.searchIndexData.idToLevelMap[id];
      await this.loadLevel(level);
      return this.itemsByLevel.get(level)?.find(i => i.id === id);
    }

    // Fall back to loader (will check index and load appropriate chunk)
    try {
      const item = await getItemFromLoader(id);
      return item ?? undefined;
    } catch (error) {
      ErrorHandler.handleError(error, `VocabularyRepository.getById(${id})`, undefined);
      return undefined;
    }
  }

  /**
   * Get index item metadata (lightweight, always available after init)
   */
  getIndexItem(id: string): VocabularyIndexItem | undefined {
    return this.index?.items.find(i => i.id === id);
  }

  /**
   * Get all index items
   */
  getAllIndexItems(): VocabularyIndexItem[] {
    return this.index?.items || [];
  }

  // ======================
  // Search
  // ======================

  /**
   * Search vocabulary using pre-computed or live index
   */
  async search(
    query: string,
    options: {
      limit?: number;
      loadFullItems?: boolean;
    } = {}
  ): Promise<Array<{ item: UnifiedVocabularyItem | undefined; mini: VocabularyIndexItem; score: number }>> {
    if (!query.trim()) return [];

    const limit = options.limit || 20;

    // Ensure index is loaded
    if (!this.index) {
      await this.initialize();
    }

    // Try pre-computed search index first
    if (this.searchReady && this.searchIndexData) {
      const searchOptions: { limit: number; loadItems?: boolean } = { limit };
      if (options.loadFullItems !== undefined) searchOptions.loadItems = options.loadFullItems;
      const results = await searchWithIndex(query, searchOptions);

      // Convert to expected format
      return results.map(r => ({
        item: r.item ?? undefined,
        mini: this.getIndexItem(r.mini.id)!,
        score: r.score
      })).filter((r): r is { item: UnifiedVocabularyItem | undefined; mini: VocabularyIndexItem; score: number } => !!r.mini); // Filter out any missing index items
    }

    // Fallback to live Fuse index
    if (!this.fuse) {
      this.rebuildSearchIndex();
    }

    if (this.fuse) {
      const results = this.fuse.search(query, { limit });

      return results.map(r => ({
        item: r.item,
        mini: this.getIndexItem(r.item.id)!,
        score: r.score || 0
      })).filter(r => r.mini);
    }

    // Final fallback: basic text search
    const q = query.toLowerCase();
    const matches = this.getAll()
      .filter(item =>
        item.german.toLowerCase().includes(q) ||
        item.bulgarian.toLowerCase().includes(q)
      )
      .slice(0, limit);

    return matches.map(item => ({
      item,
      mini: this.getIndexItem(item.id)!,
      score: 0
    })).filter(r => r.mini);
  }

  /**
   * Basic text search (fallback)
   */
  basicSearch(query: string): UnifiedVocabularyItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return this.getAll().filter(item =>
      item.german.toLowerCase().includes(q) ||
      item.bulgarian.toLowerCase().includes(q) ||
      (item.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Rebuild Fuse index from loaded items
   */
  rebuildSearchIndex(): void {
    const items = this.getAll();

    if (items.length === 0) {
      this.fuse = null;
      return;
    }

    this.fuse = new Fuse(items, {
      keys: [
        { name: 'german', weight: 0.4 },
        { name: 'bulgarian', weight: 0.4 },
        { name: 'categories', weight: 0.2 }
      ],
      includeScore: true,
      threshold: 0.4
    });

    this.searchReady = true;

    Debug.log('VocabularyRepository', 'Live search index rebuilt', {
      items: items.length
    });
  }

  // ======================
  // Statistics
  // ======================

  /**
   * Get repository statistics
   */
  getStats(): {
    totalInIndex: number;
    loadedItems: number;
    loadedLevels: CEFRLevel[];
    levelsWithData: CEFRLevel[];
    searchReady: boolean;
    cacheStats: ReturnType<typeof getCacheStats>;
  } {
    const levelsWithData = ALL_LEVELS.filter(l =>
      (this.index?.levels[l].count || 0) > 0
    );

    return {
      totalInIndex: this.index?.totalItems || 0,
      loadedItems: this.getAll().length,
      loadedLevels: Array.from(this.loadedLevels),
      levelsWithData,
      searchReady: this.searchReady,
      cacheStats: getCacheStats()
    };
  }

  // ======================
  // Cache Management
  // ======================

  /**
   * Invalidate all caches
   */
  invalidate(): void {
    this.itemsByLevel.clear();
    this.loadedLevels.clear();
    this.index = null;
    this.fuse = null;
    this.searchIndexData = null;
    this.searchReady = false;
    this.loaded = false;
    clearChunkCache();
    Debug.log('VocabularyRepository', 'Cache invalidated');
  }

  // ======================
  // Legacy Fallback
  // ======================

  /**
   * Fallback to legacy loader during transition
   */
  async fallbackToLegacyLoader(): Promise<void> {
    Debug.log('VocabularyRepository', 'Falling back to legacy loader');

    try {
      const { loadVocabulary } = await import('./loader');
      const collection = await loadVocabulary();

      // Group by level
      for (const item of collection.items) {
        const level = (item.cefrLevel || 'A1') as CEFRLevel;
        if (!this.itemsByLevel.has(level)) {
          this.itemsByLevel.set(level, []);
        }
        this.itemsByLevel.get(level)!.push(item);
      }

      this.loadedLevels = new Set(ALL_LEVELS);
      this.loaded = true;
      this.rebuildSearchIndex();

      Debug.log('VocabularyRepository', 'Legacy load complete', {
        items: collection.items.length
      });
    } catch (error) {
      ErrorHandler.handleError(error, 'VocabularyRepository.fallbackToLegacyLoader', this.eventBus);
      this.loaded = false;
    }
  }
}

// ======================
// Singleton Export
// ======================

export const vocabularyRepository = new VocabularyRepository();

// ======================
// Utility Exports
// ======================

export function getRepositoryStats() {
  return vocabularyRepository.getStats();
}

export function isLevelLoaded(level: CEFRLevel) {
  return vocabularyRepository.isLevelLoaded(level);
}

export async function ensureLevelLoaded(level: CEFRLevel) {
  if (!vocabularyRepository.isLevelLoaded(level)) {
    await vocabularyRepository.loadLevel(level);
  }
}
