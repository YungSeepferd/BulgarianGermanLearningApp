// LocalStorage utilities for the Bulgarian-German Learning App
import type { PracticeSession } from '$lib/types/vocabulary';
import {
  UserProgressStorageSchema,
  safeValidateUserProgressStorage,
  isPracticeStat
} from '$lib/schemas/localStorage';
import { PracticeSessionSchema } from '$lib/schemas/vocabulary';
import { StorageError, ErrorHandler } from '../services/errors';
import { EventBus } from '../services/event-bus';

/**
 * LocalStorage utility class for managing user progress
 */
export class LocalStorageManager {
  private static readonly PREFIX = 'tandem_';
  private static readonly USER_PROGRESS_KEY = `${LocalStorageManager.PREFIX}user_progress`;
  private static readonly SESSION_KEY = `${LocalStorageManager.PREFIX}active_session`;

  /**
   * Save user progress to localStorage
   * @param progress Object containing user progress data
   * @param eventBus Optional event bus for error handling
   * @throws StorageError if saving fails
   */
  public static saveUserProgress(progress: {
    stats: Map<string, { correct: number; incorrect: number; lastPracticed: string }>;
    favorites: string[];
    recentSearches: string[];
  }, eventBus?: EventBus): void {
    try {
        const serializedStats = Array.from(progress.stats.entries()).map(([id, data]) => ({
            id,
            correct: data.correct,
            incorrect: data.incorrect,
            lastPracticed: data.lastPracticed
        }));

        const dataToSave = {
            stats: serializedStats,
            favorites: progress.favorites,
            recentSearches: progress.recentSearches,
            lastUpdated: new Date().toISOString()
        };

        // Validate before saving
        const validationResult = UserProgressStorageSchema.safeParse(dataToSave);
        if (!validationResult.success) {
            throw new StorageError('Invalid user progress data', { validationResult });
        }

        localStorage.setItem(
            LocalStorageManager.USER_PROGRESS_KEY,
            JSON.stringify(dataToSave)
        );
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to save user progress', eventBus);
        throw new StorageError('Failed to save user progress', { error });
    }
  }

  /**
   * Load user progress from localStorage
   * @param eventBus Optional event bus for error handling
   * @returns Object containing user progress data or null if not found
   * @throws StorageError if loading fails
   */
  public static loadUserProgress(eventBus?: EventBus): {
    stats: Map<string, { correct: number; incorrect: number; lastPracticed: string }>;
    favorites: string[];
    recentSearches: string[];
    lastUpdated: string;
  } | null {
    try {
        const data = localStorage.getItem(LocalStorageManager.USER_PROGRESS_KEY);
        if (!data) return null;

        const parsedData = JSON.parse(data);

        // Validate parsed data with Zod
        const validationResult = safeValidateUserProgressStorage(parsedData);
        if (!validationResult.success) {
            throw new StorageError('Invalid user progress data format', { validationResult });
        }

        // Convert stats array back to Map with type safety
        const statsMap = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
        validationResult.data.stats.forEach((item) => {
            if (isPracticeStat(item)) {
                statsMap.set(item.id, {
                    correct: item.correct,
                    incorrect: item.incorrect,
                    lastPracticed: item.lastPracticed
                });
            }
        });

        return {
            stats: statsMap,
            favorites: validationResult.data.favorites || [],
            recentSearches: validationResult.data.recentSearches || [],
            lastUpdated: validationResult.data.lastUpdated
        };
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to load user progress', eventBus);
        throw new StorageError('Failed to load user progress', { error });
    }
  }

  /**
   * Save active practice session to localStorage
   * @param session Practice session data to save
   * @param eventBus Optional event bus for error handling
   * @throws StorageError if saving fails
   */
  public static savePracticeSession(session: PracticeSession, eventBus?: EventBus): void {
    try {
        // Validate practice session before saving
        const result = PracticeSessionSchema.safeParse(session);
        if (!result.success) {
            throw new StorageError('Invalid practice session data', { result });
        }

        localStorage.setItem(
            LocalStorageManager.SESSION_KEY,
            JSON.stringify(session)
        );
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to save practice session', eventBus);
        throw new StorageError('Failed to save practice session', { error });
    }
  }

  /**
   * Load active practice session from localStorage
   * @param eventBus Optional event bus for error handling
   * @returns Practice session data or null if not found
   * @throws StorageError if loading fails
   */
  public static loadPracticeSession(eventBus?: EventBus): PracticeSession | null {
    try {
        const data = localStorage.getItem(LocalStorageManager.SESSION_KEY);
        if (!data) return null;

        const parsedData = JSON.parse(data);
        const result = PracticeSessionSchema.safeParse(parsedData);
        if (!result.success) {
            throw new StorageError('Invalid practice session data format', { result });
        }

        return result.data;
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to load practice session', eventBus);
        throw new StorageError('Failed to load practice session', { error });
    }
  }

  /**
   * Clear active practice session from localStorage
   * @param eventBus Optional event bus for error handling
   * @throws StorageError if clearing fails
   */
  public static clearPracticeSession(eventBus?: EventBus): void {
    try {
        localStorage.removeItem(LocalStorageManager.SESSION_KEY);
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to clear practice session', eventBus);
        throw new StorageError('Failed to clear practice session', { error });
    }
  }

  /**
   * Export user data as JSON string
   * @param eventBus Optional event bus for error handling
   * @returns JSON string containing all user data
   * @throws StorageError if exporting fails
   */
  public static exportUserData(eventBus?: EventBus): string {
    try {
        const progress = this.loadUserProgress(eventBus);
        const session = this.loadPracticeSession(eventBus);

        return JSON.stringify({
            progress,
            session,
            exportedAt: new Date().toISOString()
        }, null, 2);
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to export user data', eventBus);
        throw new StorageError('Failed to export user data', { error });
    }
  }

  /**
   * Import user data from JSON string
   * @param jsonData JSON string containing user data
   * @param eventBus Optional event bus for error handling
   * @throws StorageError if importing fails
   */
  public static importUserData(jsonData: string, eventBus?: EventBus): void {
    try {
        const data = JSON.parse(jsonData);

        if (data.progress) {
            this.saveUserProgress({
                stats: data.progress.stats,
                favorites: data.progress.favorites,
                recentSearches: data.progress.recentSearches
            }, eventBus);
        }

        if (data.session) {
            this.savePracticeSession(data.session, eventBus);
        }
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to import user data', eventBus);
        throw new StorageError('Failed to import user data', { error });
    }
  }

  /**
   * Clear all tandem-related data from localStorage
   * @param eventBus Optional event bus for error handling
   * @throws StorageError if clearing fails
   */
  public static clearAllData(eventBus?: EventBus): void {
    try {
        Object.keys(localStorage)
            .filter(key => key.startsWith(LocalStorageManager.PREFIX))
            .forEach(key => localStorage.removeItem(key));
    } catch (error) {
        ErrorHandler.handleError(error, 'Failed to clear all user data', eventBus);
        throw new StorageError('Failed to clear all user data', { error });
    }
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();