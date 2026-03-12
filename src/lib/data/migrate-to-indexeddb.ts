/**
 * Migration Utility: localStorage to IndexedDB
 *
 * This module handles migrating existing data from localStorage to IndexedDB
 * on first load. It provides backward compatibility and graceful error handling.
 */

import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { getDatabase, VocabularyCacheDB, ProgressDB, FavoritesDB, AppStateDB, SettingsDB, hasData } from './indexeddb';
import type { ProgressDataStore } from './indexeddb';


// ======================
// Migration Keys (localStorage)
// ======================

const LEGACY_KEYS = {
  // Vocabulary cache keys
  VOCAB_INDEX: 'vocab-index-v2',
  VOCAB_SEARCH_INDEX: 'vocab-search-index-v2',
  VOCAB_CHUNK_PREFIX: 'vocab-chunk-',
  
  // Progress keys
  PROGRESS_DATA: 'tandem_progress_data',
  OLD_PROGRESS: 'tandem_user_progress',
  
  // App state keys
  USER_PROGRESS: 'vocabulary-cache',
  FAVORITES: 'favorites',
  RECENT_SEARCHES: 'recent-searches',
  
  // Settings keys
  SETTINGS: 'app-settings',
  LANGUAGE_MODE: 'app-language-mode'
} as const;

// ======================
// Migration Status
// ======================

export interface MigrationStatus {
  migrated: boolean;
  vocabularyCache: boolean;
  progress: boolean;
  favorites: boolean;
  appState: boolean;
  settings: boolean;
  errors: string[];
}

/**
 * Check if migration has already been completed
 */
export async function isMigrationComplete(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    return await hasData();
  } catch {
    return false;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  if (!browser) {
    return {
      migrated: false,
      vocabularyCache: false,
      progress: false,
      favorites: false,
      appState: false,
      settings: false,
      errors: ['Not in browser environment']
    };
  }

  const errors: string[] = [];
  let vocabularyCache = false;
  let progress = false;
  let favorites = false;
  let appState = false;
  let settings = false;

  try {
    const db = getDatabase();
    vocabularyCache = (await db.vocabularyCache.count()) > 0;
    progress = (await db.progress.count()) > 0;
    favorites = (await db.favorites.count()) > 0;
    appState = (await db.appState.count()) > 0;
    settings = (await db.settings.count()) > 0;
  } catch (e) {
    errors.push(`Failed to check migration status: ${e}`);
  }

  return {
    migrated: vocabularyCache || progress || favorites || appState || settings,
    vocabularyCache,
    progress,
    favorites,
    appState,
    settings,
    errors
  };
}

// ======================
// Vocabulary Cache Migration
// ======================

async function migrateVocabularyCache(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Check if already migrated
    const existingIndex = await VocabularyCacheDB.getIndex();
    if (existingIndex) {
      Debug.log('migrate-to-indexeddb', 'Vocabulary index already migrated');
      return true;
    }

    // Migrate index
    const indexData = localStorage.getItem(LEGACY_KEYS.VOCAB_INDEX);
    if (indexData) {
      try {
        const entry = JSON.parse(indexData);
        if (entry.data && entry.timestamp && entry.version === 1) {
          await VocabularyCacheDB.saveIndex(entry.data);
          Debug.log('migrate-to-indexeddb', 'Vocabulary index migrated');
        }
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse vocabulary index', { error: e });
      }
    }

    // Migrate chunks
    const chunkKeys = Object.keys(localStorage).filter(k => k.startsWith(LEGACY_KEYS.VOCAB_CHUNK_PREFIX));
    for (const key of chunkKeys) {
      const level = key.replace(LEGACY_KEYS.VOCAB_CHUNK_PREFIX, '');
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const entry = JSON.parse(cached);
          if (entry.data && Array.isArray(entry.data)) {
            await VocabularyCacheDB.saveChunk(level as any, entry.data);
          }
        } catch (e) {
          Debug.log('migrate-to-indexeddb', `Failed to migrate chunk ${level}`, { error: e });
        }
      }
    }

    // Migrate search index
    const searchIndexData = localStorage.getItem(LEGACY_KEYS.VOCAB_SEARCH_INDEX);
    if (searchIndexData) {
      try {
        const entry = JSON.parse(searchIndexData);
        if (entry.data && entry.timestamp && entry.version === 1) {
          await VocabularyCacheDB.saveSearchIndex(entry.data);
          Debug.log('migrate-to-indexeddb', 'Search index migrated');
        }
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse search index', { error: e });
      }
    }

    return true;
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to migrate vocabulary cache', error as Error);
    return false;
  }
}

// ======================
// Progress Migration
// ======================

async function migrateProgress(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Check if already migrated
    const existingProgress = await ProgressDB.getProgress();
    if (existingProgress) {
      Debug.log('migrate-to-indexeddb', 'Progress already migrated');
      return true;
    }

    // Try new format first
    const newFormatData = localStorage.getItem(LEGACY_KEYS.PROGRESS_DATA);
    if (newFormatData) {
      try {
        const parsed = JSON.parse(newFormatData);
        const progressData: ProgressDataStore = {
          vocabularyMastery: parsed.vocabularyMastery || {},
          lessonProgress: parsed.lessonProgress || {},
          quizPerformance: parsed.quizPerformance || {},
          questionPerformance: parsed.questionPerformance || {},
          dailyProgress: parsed.dailyProgress || {},
          overallProgress: parsed.overallProgress || {
            id: 'default',
            totalXP: 0,
            totalWordsPracticed: 0,
            totalLessonsCompleted: 0,
            totalQuizzesTaken: 0,
            totalTimeSpent: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        await ProgressDB.saveProgress(progressData);
        Debug.log('migrate-to-indexeddb', 'Progress data migrated');
        return true;
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse progress data', { error: e });
      }
    }

    // Try old format
    const oldFormatData = localStorage.getItem(LEGACY_KEYS.OLD_PROGRESS);
    if (oldFormatData) {
      try {
        const parsed = JSON.parse(oldFormatData);
        const progressData: ProgressDataStore = {
          vocabularyMastery: parsed.vocabularyMastery || {},
          lessonProgress: parsed.lessonProgress || {},
          quizPerformance: parsed.quizPerformance || {},
          questionPerformance: parsed.questionPerformance || {},
          dailyProgress: parsed.dailyProgress || {},
          overallProgress: parsed.overallProgress || {
            id: 'default',
            totalXP: 0,
            totalWordsPracticed: 0,
            totalLessonsCompleted: 0,
            totalQuizzesTaken: 0,
            totalTimeSpent: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
        await ProgressDB.saveProgress(progressData);
        Debug.log('migrate-to-indexeddb', 'Old progress data migrated');
        return true;
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse old progress data', { error: e });
      }
    }

    return true; // No data to migrate is also a success
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to migrate progress', error as Error);
    return false;
  }
}

// ======================
// Favorites Migration
// ======================

async function migrateFavorites(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Check if already migrated
    const existingFavorites = await FavoritesDB.getAll();
    if (existingFavorites.length > 0) {
      Debug.log('migrate-to-indexeddb', 'Favorites already migrated');
      return true;
    }

    // Try new format
    const favoritesData = localStorage.getItem(LEGACY_KEYS.FAVORITES);
    if (favoritesData) {
      try {
        const parsed = JSON.parse(favoritesData);
        if (Array.isArray(parsed)) {
          for (const id of parsed) {
            await FavoritesDB.add(id);
          }
          Debug.log('migrate-to-indexeddb', 'Favorites migrated', { count: parsed.length });
        }
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse favorites', { error: e });
      }
    }

    return true;
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to migrate favorites', error as Error);
    return false;
  }
}

// ======================
// App State Migration
// ======================

async function migrateAppState(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Check if already migrated
    const existingState = await AppStateDB.get();
    if (existingState) {
      Debug.log('migrate-to-indexeddb', 'App state already migrated');
      return true;
    }

    // Try new format
    const userProgressData = localStorage.getItem(LEGACY_KEYS.USER_PROGRESS);
    if (userProgressData) {
      try {
        const parsed = JSON.parse(userProgressData);
        const appStateData = {
          practiceStats: parsed.stats || {},
          favorites: parsed.favorites || [],
          recentSearches: parsed.recentSearches || []
        };
        await AppStateDB.save(appStateData);
        Debug.log('migrate-to-indexeddb', 'App state migrated');
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse app state', { error: e });
      }
    }

    return true;
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to migrate app state', error as Error);
    return false;
  }
}

// ======================
// Settings Migration
// ======================

async function migrateSettings(): Promise<boolean> {
  if (!browser) return false;
  
  try {
    // Check if already migrated
    const existingSettings = await SettingsDB.get();
    if (existingSettings) {
      Debug.log('migrate-to-indexeddb', 'Settings already migrated');
      return true;
    }

    // Try new format
    const settingsData = localStorage.getItem(LEGACY_KEYS.SETTINGS);
    if (settingsData) {
      try {
        const parsed = JSON.parse(settingsData);
        await SettingsDB.save(parsed);
        Debug.log('migrate-to-indexeddb', 'Settings migrated');
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to parse settings', { error: e });
      }
    }

    // Migrate language mode
    const languageMode = localStorage.getItem(LEGACY_KEYS.LANGUAGE_MODE);
    if (languageMode) {
      try {
        const currentSettings = await SettingsDB.get() || {};
        await SettingsDB.save({
          ...currentSettings,
          languageMode
        });
        Debug.log('migrate-to-indexeddb', 'Language mode migrated');
      } catch (e) {
        Debug.log('migrate-to-indexeddb', 'Failed to migrate language mode', { error: e });
      }
    }

    return true;
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to migrate settings', error as Error);
    return false;
  }
}

// ======================
// Main Migration Function
// ======================

/**
 * Run full migration from localStorage to IndexedDB
 * Returns migration status
 */
export async function migrateFromLocalStorage(): Promise<MigrationStatus> {
  if (!browser) {
    return {
      migrated: false,
      vocabularyCache: false,
      progress: false,
      favorites: false,
      appState: false,
      settings: false,
      errors: ['Not in browser environment']
    };
  }

  const errors: string[] = [];
  
  Debug.log('migrate-to-indexeddb', 'Starting migration from localStorage');

  // Run all migrations
  const results = await Promise.all([
    migrateVocabularyCache(),
    migrateProgress(),
    migrateFavorites(),
    migrateAppState(),
    migrateSettings()
  ]);

  const [vocabularyCache, progress, favorites, appState, settings] = results;

  if (!vocabularyCache) errors.push('Vocabulary cache migration failed');
  if (!progress) errors.push('Progress migration failed');
  if (!favorites) errors.push('Favorites migration failed');
  if (!appState) errors.push('App state migration failed');
  if (!settings) errors.push('Settings migration failed');

  const migrated = vocabularyCache && progress && favorites && appState && settings;

  Debug.log('migrate-to-indexeddb', 'Migration complete', {
    migrated,
    vocabularyCache,
    progress,
    favorites,
    appState,
    settings,
    errors: errors.length
  });

  return {
    migrated,
    vocabularyCache,
    progress,
    favorites,
    appState,
    settings,
    errors
  };
}

/**
 * Clear localStorage after successful migration (optional)
 * Only call this after confirming migration was successful
 */
export async function clearLegacyLocalStorage(): Promise<void> {
  if (!browser) return;
  
  try {
    // Only clear the specific keys we migrated
    const keysToRemove: string[] = [
      LEGACY_KEYS.VOCAB_INDEX,
      LEGACY_KEYS.VOCAB_SEARCH_INDEX,
      LEGACY_KEYS.PROGRESS_DATA,
      LEGACY_KEYS.OLD_PROGRESS,
      LEGACY_KEYS.USER_PROGRESS,
      LEGACY_KEYS.FAVORITES,
      LEGACY_KEYS.RECENT_SEARCHES,
      LEGACY_KEYS.SETTINGS,
      LEGACY_KEYS.LANGUAGE_MODE
    ];

    // Add chunk keys
    const chunkKeys = Object.keys(localStorage).filter(k => k.startsWith(LEGACY_KEYS.VOCAB_CHUNK_PREFIX));
    keysToRemove.push(...chunkKeys);

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    Debug.log('migrate-to-indexeddb', 'Legacy localStorage cleared');
  } catch (error) {
    Debug.error('migrate-to-indexeddb', 'Failed to clear legacy localStorage', error as Error);
  }
}

/**
 * Initialize migration on app startup
 * Should be called early in the app initialization
 */
export async function initializeMigration(): Promise<MigrationStatus> {
  if (!browser) {
    return {
      migrated: false,
      vocabularyCache: false,
      progress: false,
      favorites: false,
      appState: false,
      settings: false,
      errors: ['Not in browser environment']
    };
  }

  // Check if already migrated
  const alreadyMigrated = await isMigrationComplete();
  if (alreadyMigrated) {
    Debug.log('migrate-to-indexeddb', 'Data already migrated, skipping');
    return {
      migrated: true,
      vocabularyCache: true,
      progress: true,
      favorites: true,
      appState: true,
      settings: true,
      errors: []
    };
  }

  // Run migration
  return migrateFromLocalStorage();
}