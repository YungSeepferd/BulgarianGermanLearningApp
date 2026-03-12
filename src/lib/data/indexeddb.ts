/**
 * IndexedDB Database Module using Dexie.js
 *
 * Provides persistent storage for:
 * - Vocabulary cache (index, chunks, search index)
 * - Progress data (vocabulary mastery, lesson progress, quiz performance)
 * - Favorites
 * - Settings
 *
 * Replaces localStorage for larger data storage with better performance.
 */

import Dexie, { type Table } from 'dexie';
import type { UnifiedVocabularyItem } from '$lib/schemas/unified-vocabulary';
import type { VocabularyIndex } from '$lib/schemas/vocabulary-index';
import type { CEFRLevel } from '$lib/schemas/vocabulary-index';
import type { VocabularyMastery, LessonProgress, QuizPerformance, QuestionPerformance, DailyProgress, OverallProgress } from '$lib/schemas/progress';
import type { IFuseOptions, FuseIndexRecords } from 'fuse.js';

// ======================
// Database Schema Types
// ======================

export interface VocabularyCacheEntry {
  id: string; // CEFR level (A1, A2, etc.) or 'index' or 'search-index'
  data: UnifiedVocabularyItem[] | VocabularyIndex | SearchIndexData;
  timestamp: string;
  version: number;
}

export interface SearchIndexData {
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
}

export interface ProgressEntry {
  id: string; // 'progress' for main progress data
  data: ProgressDataStore;
  timestamp: string;
  version: number;
}

export interface ProgressDataStore {
  vocabularyMastery: Record<string, VocabularyMastery>;
  lessonProgress: Record<string, LessonProgress>;
  quizPerformance: Record<string, QuizPerformance>;
  questionPerformance: Record<string, QuestionPerformance>;
  dailyProgress: Record<string, DailyProgress>;
  overallProgress: OverallProgress;
}

export interface FavoriteEntry {
  id: string; // item ID
  addedAt: string;
}

export interface SettingsEntry {
  id: string; // 'settings'
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AppStateEntry {
  id: string; // 'app-state'
  data: {
    practiceStats: Record<string, { correct: number; incorrect: number; lastPracticed: string }>;
    favorites: string[];
    recentSearches: string[];
  };
  timestamp: string;
  version: number;
}

// ======================
// Database Class
// ======================

class BulgarianAppDatabase extends Dexie {
  vocabularyCache!: Table<VocabularyCacheEntry, string>;
  progress!: Table<ProgressEntry, string>;
  favorites!: Table<FavoriteEntry, string>;
  settings!: Table<SettingsEntry, string>;
  appState!: Table<AppStateEntry, string>;

  constructor() {
    super('BulgarianGermanLearningApp');

    this.version(1).stores({
      vocabularyCache: 'id',
      progress: 'id',
      favorites: 'id, addedAt',
      settings: 'id',
      appState: 'id'
    });
  }
}

// ======================
// Singleton Instance
// ======================

let dbInstance: BulgarianAppDatabase | null = null;

export function getDatabase(): BulgarianAppDatabase {
  if (!dbInstance) {
    dbInstance = new BulgarianAppDatabase();
  }
  return dbInstance;
}

// ======================
// Vocabulary Cache Operations
// ======================

const CACHE_VERSION = 1;
const CACHE_EXPIRY_HOURS = 24;

export const VocabularyCacheDB = {
  /**
   * Get cached vocabulary index
   */
  async getIndex(): Promise<VocabularyIndex | null> {
    const db = getDatabase();
    const entry = await db.vocabularyCache.get('index');
    
    if (!entry) return null;
    
    const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    if (age >= CACHE_EXPIRY_HOURS || entry.version !== CACHE_VERSION) {
      await db.vocabularyCache.delete('index');
      return null;
    }
    
    return entry.data as VocabularyIndex;
  },

  /**
   * Save vocabulary index to cache
   */
  async saveIndex(index: VocabularyIndex): Promise<void> {
    const db = getDatabase();
    await db.vocabularyCache.put({
      id: 'index',
      data: index,
      timestamp: new Date().toISOString(),
      version: CACHE_VERSION
    });
  },

  /**
   * Get cached vocabulary chunk for a CEFR level
   */
  async getChunk(level: CEFRLevel): Promise<UnifiedVocabularyItem[] | null> {
    const db = getDatabase();
    const entry = await db.vocabularyCache.get(level);
    
    if (!entry) return null;
    
    const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    if (age >= CACHE_EXPIRY_HOURS || entry.version !== CACHE_VERSION) {
      await db.vocabularyCache.delete(level);
      return null;
    }
    
    return entry.data as UnifiedVocabularyItem[];
  },

  /**
   * Save vocabulary chunk to cache
   */
  async saveChunk(level: CEFRLevel, items: UnifiedVocabularyItem[]): Promise<void> {
    const db = getDatabase();
    await db.vocabularyCache.put({
      id: level,
      data: items,
      timestamp: new Date().toISOString(),
      version: CACHE_VERSION
    });
  },

  /**
   * Get cached search index
   */
  async getSearchIndex(): Promise<SearchIndexData | null> {
    const db = getDatabase();
    const entry = await db.vocabularyCache.get('search-index');
    
    if (!entry) return null;
    
    const age = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
    if (age >= CACHE_EXPIRY_HOURS || entry.version !== CACHE_VERSION) {
      await db.vocabularyCache.delete('search-index');
      return null;
    }
    
    return entry.data as SearchIndexData;
  },

  /**
   * Save search index to cache
   */
  async saveSearchIndex(data: SearchIndexData): Promise<void> {
    const db = getDatabase();
    await db.vocabularyCache.put({
      id: 'search-index',
      data,
      timestamp: new Date().toISOString(),
      version: CACHE_VERSION
    });
  },

  /**
   * Clear all vocabulary cache
   */
  async clearCache(): Promise<void> {
    const db = getDatabase();
    await db.vocabularyCache.clear();
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ entries: number; size: number }> {
    const db = getDatabase();
    const count = await db.vocabularyCache.count();
    
    // Estimate size by getting all entries
    let size = 0;
    const entries = await db.vocabularyCache.toArray();
    for (const entry of entries) {
      size += JSON.stringify(entry).length;
    }
    
    return { entries: count, size };
  }
};

// ======================
// Progress Operations
// ======================

export const ProgressDB = {
  /**
   * Get all progress data
   */
  async getProgress(): Promise<ProgressDataStore | null> {
    const db = getDatabase();
    const entry = await db.progress.get('progress');
    return entry?.data ?? null;
  },

  /**
   * Save all progress data
   */
  async saveProgress(data: ProgressDataStore): Promise<void> {
    const db = getDatabase();
    await db.progress.put({
      id: 'progress',
      data,
      timestamp: new Date().toISOString(),
      version: CACHE_VERSION
    });
  },

  /**
   * Clear all progress data
   */
  async clearProgress(): Promise<void> {
    const db = getDatabase();
    await db.progress.clear();
  }
};

// ======================
// Favorites Operations
// ======================

export const FavoritesDB = {
  /**
   * Get all favorites
   */
  async getAll(): Promise<string[]> {
    const db = getDatabase();
    const favorites = await db.favorites.toArray();
    return favorites.map(f => f.id);
  },

  /**
   * Add a favorite
   */
  async add(itemId: string): Promise<void> {
    const db = getDatabase();
    await db.favorites.put({
      id: itemId,
      addedAt: new Date().toISOString()
    });
  },

  /**
   * Remove a favorite
   */
  async remove(itemId: string): Promise<void> {
    const db = getDatabase();
    await db.favorites.delete(itemId);
  },

  /**
   * Check if item is favorited
   */
  async isFavorite(itemId: string): Promise<boolean> {
    const db = getDatabase();
    const favorite = await db.favorites.get(itemId);
    return !!favorite;
  },

  /**
   * Clear all favorites
   */
  async clear(): Promise<void> {
    const db = getDatabase();
    await db.favorites.clear();
  }
};

// ======================
// Settings Operations
// ======================

export const SettingsDB = {
  /**
   * Get settings
   */
  async get(): Promise<Record<string, unknown> | null> {
    const db = getDatabase();
    const entry = await db.settings.get('settings');
    return entry?.data ?? null;
  },

  /**
   * Save settings
   */
  async save(data: Record<string, unknown>): Promise<void> {
    const db = getDatabase();
    await db.settings.put({
      id: 'settings',
      data,
      timestamp: new Date().toISOString()
    });
  }
};

// ======================
// App State Operations
// ======================

export const AppStateDB = {
  /**
   * Get app state (practice stats, favorites, recent searches)
   */
  async get(): Promise<AppStateEntry['data'] | null> {
    const db = getDatabase();
    const entry = await db.appState.get('app-state');
    return entry?.data ?? null;
  },

  /**
   * Save app state
   */
  async save(data: AppStateEntry['data']): Promise<void> {
    const db = getDatabase();
    await db.appState.put({
      id: 'app-state',
      data,
      timestamp: new Date().toISOString(),
      version: CACHE_VERSION
    });
  },

  /**
   * Clear app state
   */
  async clear(): Promise<void> {
    const db = getDatabase();
    await db.appState.clear();
  }
};

// ======================
// Utility Functions
// ======================

/**
 * Delete the entire database (for testing or reset)
 */
export async function deleteDatabase(): Promise<void> {
  const db = getDatabase();
  await db.delete();
  dbInstance = null;
}

/**
 * Check if database exists and has data
 */
export async function hasData(): Promise<boolean> {
  const db = getDatabase();
  const vocabCount = await db.vocabularyCache.count();
  const progressCount = await db.progress.count();
  return vocabCount > 0 || progressCount > 0;
}

/**
 * Get database info
 */
export async function getDatabaseInfo(): Promise<{
  vocabCacheEntries: number;
  progressEntries: number;
  favoritesCount: number;
  settingsCount: number;
  appStateCount: number;
}> {
  const db = getDatabase();
  return {
    vocabCacheEntries: await db.vocabularyCache.count(),
    progressEntries: await db.progress.count(),
    favoritesCount: await db.favorites.count(),
    settingsCount: await db.settings.count(),
    appStateCount: await db.appState.count()
  };
}