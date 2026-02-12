/**
 * Settings Stores
 *
 * User preferences and app settings persisted across sessions.
 * All stores automatically sync with localStorage.
 *
 * @example
 * ```svelte
 * <script>
 *   import { userSettings } from '$lib/stores/settings'
 *   $userSettings.languageMode = 'BG_DE'
 * </script>
 * ```
 */

import { persisted } from './persisted';

// ============================================
// Types
// ============================================

export type LanguageMode = 'DE_BG' | 'BG_DE';
export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  /** Learning direction: German->Bulgarian or Bulgarian->German */
  languageMode: LanguageMode;
  /** Daily vocabulary goal */
  dailyGoal: number;
  /** Enable audio pronunciation */
  audioEnabled: boolean;
  /** Enable push notifications */
  notificationsEnabled: boolean;
  /** UI theme preference */
  theme: Theme;
  /** UI language */
  uiLanguage: 'de' | 'bg' | 'en';
}

export interface StudyProgress {
  /** Current streak of consecutive days studied */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Date of last study session (ISO format) */
  lastStudyDate: string | null;
  /** Total words marked as learned */
  totalWordsLearned: number;
  /** Total XP earned */
  totalXP: number;
  /** Current user level */
  level: number;
}

export interface LessonState {
  /** Current active lesson ID */
  currentLessonId: string | null;
  /** IDs of completed items in current lesson */
  completedItemIds: string[];
  /** Session start timestamp */
  startTime: number | null;
  /** Last activity timestamp for session recovery */
  lastActivity: number | null;
}

export interface PracticePreferences {
  /** Auto-show answer after delay (ms, 0 = disabled) */
  autoShowAnswerDelay: number;
  /** Enable haptic feedback on mobile */
  hapticFeedback: boolean;
  /** Show transliteration by default */
  showTransliteration: boolean;
  /** Card flip animation duration (ms) */
  flipAnimationDuration: number;
}

// ============================================
// User Settings Store
// ============================================

export const userSettings = persisted<UserSettings>('settings', {
  languageMode: 'DE_BG',
  dailyGoal: 10,
  audioEnabled: true,
  notificationsEnabled: false,
  theme: 'system',
  uiLanguage: 'de'
});

// ============================================
// Study Progress Store
// ============================================

export const studyProgress = persisted<StudyProgress>('progress', {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  totalWordsLearned: 0,
  totalXP: 0,
  level: 1
});

// ============================================
// Lesson State Store
// ============================================

export const lessonState = persisted<LessonState>('lesson', {
  currentLessonId: null,
  completedItemIds: [],
  startTime: null,
  lastActivity: null
});

// ============================================
// Practice Preferences Store
// ============================================

export const practicePreferences = persisted<PracticePreferences>('practice-prefs', {
  autoShowAnswerDelay: 0,
  hapticFeedback: true,
  showTransliteration: true,
  flipAnimationDuration: 300
});

// ============================================
// Helper Functions
// ============================================

/**
 * Update study progress after a completed session
 */
export function recordStudySession(wordsLearned: number = 0, xpEarned: number = 0): void {
  const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10);

  studyProgress.update(progress => {
    const lastDate = progress.lastStudyDate;
    let newStreak = progress.currentStreak;

    // Calculate streak
    if (lastDate && typeof lastDate === 'string') {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - continue streak
        newStreak = progress.currentStreak + 1;
      } else if (diffDays > 1) {
        // Streak broken - start over
        newStreak = 1;
      }
      // diffDays === 0 means same day - don't increment streak
    } else {
      // First session ever
      newStreak = 1;
    }

    const updated: StudyProgress = {
      ...progress,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, progress.longestStreak),
      lastStudyDate: today ?? null,
      totalWordsLearned: progress.totalWordsLearned + wordsLearned,
      totalXP: progress.totalXP + xpEarned,
      level: Math.floor((progress.totalXP + xpEarned) / 100) + 1
    };
    return updated;
  });
}

/**
 * Toggle language mode between DE_BG and BG_DE
 */
export function toggleLanguageMode(): void {
  userSettings.update(settings => ({
    ...settings,
    languageMode: settings.languageMode === 'DE_BG' ? 'BG_DE' : 'DE_BG'
  }));
}

/**
 * Set language mode explicitly
 */
export function setLanguageMode(mode: LanguageMode): void {
  userSettings.update(settings => ({
    ...settings,
    languageMode: mode
  }));
}

/**
 * Check if today has been studied
 */
export function hasStudiedToday(): boolean {
  const today = new Date().toISOString().split('T')[0];
  let result = false;

  studyProgress.subscribe(progress => {
    result = progress.lastStudyDate === today;
  })();

  return result;
}

/**
 * Get streak status for UI display
 */
export function getStreakStatus(): {
  active: boolean;
  days: number;
  atRisk: boolean;
} {
  let status = { active: false, days: 0, atRisk: false };

  studyProgress.subscribe(progress => {
    if (!progress.lastStudyDate) {
      status = { active: false, days: 0, atRisk: false };
      return;
    }

    const today = new Date();
    const lastDate = new Date(progress.lastStudyDate);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    status = {
      active: diffDays <= 1,
      days: progress.currentStreak,
      atRisk: diffDays === 1 // Streak will break if not studied today
    };
  })();

  return status;
}

/**
 * Reset lesson state (call when starting fresh or completing)
 */
export function resetLessonState(): void {
  lessonState.set({
    currentLessonId: null,
    completedItemIds: [],
    startTime: null,
    lastActivity: null
  });
}

/**
 * Start a new lesson session
 */
export function startLesson(lessonId: string): void {
  lessonState.set({
    currentLessonId: lessonId,
    completedItemIds: [],
    startTime: Date.now(),
    lastActivity: Date.now()
  });
}

/**
 * Mark an item as completed in the current lesson
 */
export function completeLessonItem(itemId: string): void {
  lessonState.update(state => ({
    ...state,
    completedItemIds: [...state.completedItemIds, itemId],
    lastActivity: Date.now()
  }));
}

/**
 * Export all user data as JSON
 */
export function exportAllUserData(): string {
  let data = {};

  const subscriptions = [
    userSettings.subscribe(s => data = { ...data, settings: s }),
    studyProgress.subscribe(s => data = { ...data, progress: s }),
    lessonState.subscribe(s => data = { ...data, lesson: s }),
    practicePreferences.subscribe(s => data = { ...data, practice: s })
  ];

  // Unsubscribe all
  subscriptions.forEach(unsub => unsub());

  return JSON.stringify(data, null, 2);
}

/**
 * Import user data from JSON
 */
export function importAllUserData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.settings) userSettings.set(data.settings);
    if (data.progress) studyProgress.set(data.progress);
    if (data.lesson) lessonState.set(data.lesson);
    if (data.practice) practicePreferences.set(data.practice);

    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}
