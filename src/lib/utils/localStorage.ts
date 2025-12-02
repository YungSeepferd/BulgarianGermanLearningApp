// LocalStorage utilities for the Bulgarian-German Learning App
import type { PracticeSession } from '$lib/types/vocabulary';

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
   */
  public static saveUserProgress(progress: {
    stats: Map<string, { correct: number; incorrect: number; lastPracticed: string }>;
    favorites: string[];
    recentSearches: string[];
  }): void {
    try {
      const serializedStats = Array.from(progress.stats.entries()).map(([id, data]) => ({
        id,
        ...data
      }));

      const dataToSave = {
        stats: serializedStats,
        favorites: progress.favorites,
        recentSearches: progress.recentSearches,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(
        LocalStorageManager.USER_PROGRESS_KEY,
        JSON.stringify(dataToSave)
      );
    } catch (error) {
      // console.error('Failed to save user progress:', error);
    }
  }

  /**
   * Load user progress from localStorage
   * @returns Object containing user progress data or null if not found
   */
  public static loadUserProgress(): {
    stats: Map<string, { correct: number; incorrect: number; lastPracticed: string }>;
    favorites: string[];
    recentSearches: string[];
    lastUpdated: string;
  } | null {
    try {
      const data = localStorage.getItem(LocalStorageManager.USER_PROGRESS_KEY);
      if (!data) return null;

      const parsedData = JSON.parse(data);

      // Convert stats array back to Map
      const statsMap = new Map<string, { correct: number; incorrect: number; lastPracticed: string }>();
      parsedData.stats.forEach((item: any) => {
        statsMap.set(item.id, {
          correct: item.correct,
          incorrect: item.incorrect,
          lastPracticed: item.lastPracticed
        });
      });

      return {
        stats: statsMap,
        favorites: parsedData.favorites || [],
        recentSearches: parsedData.recentSearches || [],
        lastUpdated: parsedData.lastUpdated
      };
    } catch (error) {
      // console.error('Failed to load user progress:', error);
      return null;
    }
  }

  /**
   * Save active practice session to localStorage
   * @param session Practice session data to save
   */
  public static savePracticeSession(session: PracticeSession): void {
    try {
      localStorage.setItem(
        LocalStorageManager.SESSION_KEY,
        JSON.stringify(session)
      );
    } catch (error) {
      // console.error('Failed to save practice session:', error);
    }
  }

  /**
   * Load active practice session from localStorage
   * @returns Practice session data or null if not found
   */
  public static loadPracticeSession(): PracticeSession | null {
    try {
      const data = localStorage.getItem(LocalStorageManager.SESSION_KEY);
      if (!data) return null;

      return JSON.parse(data) as PracticeSession;
    } catch (error) {
      // console.error('Failed to load practice session:', error);
      return null;
    }
  }

  /**
   * Clear active practice session from localStorage
   */
  public static clearPracticeSession(): void {
    try {
      localStorage.removeItem(LocalStorageManager.SESSION_KEY);
    } catch (error) {
      // console.error('Failed to clear practice session:', error);
    }
  }

  /**
   * Export user data as JSON string
   * @returns JSON string containing all user data
   */
  public static exportUserData(): string {
    try {
      const progress = this.loadUserProgress();
      const session = this.loadPracticeSession();

      return JSON.stringify({
        progress,
        session,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } catch (error) {
      // console.error('Failed to export user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Import user data from JSON string
   * @param jsonData JSON string containing user data
   */
  public static importUserData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.progress) {
        this.saveUserProgress({
          stats: data.progress.stats,
          favorites: data.progress.favorites,
          recentSearches: data.progress.recentSearches
        });
      }

      if (data.session) {
        this.savePracticeSession(data.session);
      }
    } catch (error) {
      // console.error('Failed to import user data:', error);
      throw new Error('Failed to import user data');
    }
  }

  /**
   * Clear all tandem-related data from localStorage
   */
  public static clearAllData(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(LocalStorageManager.PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // console.error('Failed to clear all data:', error);
    }
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager();