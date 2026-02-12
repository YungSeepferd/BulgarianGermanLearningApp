/**
 * Stores Module
 *
 * Centralized reactive state management with persistence.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { userSettings, studyProgress } from '$lib/stores'
 *
 *   $userSettings.languageMode = 'BG_DE'
 *   console.log($studyProgress.currentStreak)
 * </script>
 * ```
 */

// Core persisted store utilities
export { persisted, sessionPersisted } from './persisted';
export type { StorageType, PersistedOptions, Serializer } from './persisted';

// Settings and user data stores
export {
  userSettings,
  studyProgress,
  lessonState,
  practicePreferences,
  // Actions
  recordStudySession,
  toggleLanguageMode,
  setLanguageMode,
  hasStudiedToday,
  getStreakStatus,
  resetLessonState,
  startLesson,
  completeLessonItem,
  exportAllUserData,
  importAllUserData
} from './settings';
export type { UserSettings, StudyProgress, LessonState, PracticePreferences } from './settings';

// Re-export language mode type for convenience
export type { LanguageMode } from './settings';
