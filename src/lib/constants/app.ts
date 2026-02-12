/**
 * App-level Constants
 *
 * Centralized constants for the Bulgarian-German Learning App
 * This ensures consistency and makes changes easier across the codebase.
 */

// ======================
// Daily Practice
// ======================

/** Number of vocabulary items in daily practice */
export const DAILY_VOCABULARY_COUNT = 10;

/** Maximum number of recommendations to show */
export const MAX_RECOMMENDATIONS = 3;

// ======================
// Retry & Timeout
// ======================

/** Maximum number of retry attempts for operations */
export const MAX_RETRY_ATTEMPTS = 3;

/** Default timeout for async operations (ms) */
export const DEFAULT_TIMEOUT_MS = 5000;

/** Quick delay for UI feedback (ms) */
export const UI_FEEDBACK_DELAY_MS = 300;

/** Short delay for mode transitions (ms) */
export const MODE_TRANSITION_DELAY_MS = 10;

/** Delay before closing modal after success (ms) */
export const MODAL_CLOSE_DELAY_MS = 2000;

// ======================
// Animation
// ======================

/** Default animation duration (ms) */
export const DEFAULT_ANIMATION_DURATION_MS = 200;

/** Card swipe animation duration (ms) */
export const CARD_SWIPE_DURATION_MS = 200;

// ======================
// Storage
// ======================

/** Local storage key prefix */
export const STORAGE_KEY_PREFIX = 'bg-de-learn';

/** Maximum local storage size (bytes) - 5MB typical limit */
export const MAX_STORAGE_SIZE_BYTES = 5 * 1024 * 1024;

// ======================
// Pagination
// ======================

/** Default number of items per page */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size */
export const MAX_PAGE_SIZE = 100;

// ======================
// Difficulty Levels (CEFR)
// ======================

/** CEFR difficulty levels in order */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

/** Default difficulty level */
export const DEFAULT_DIFFICULTY_LEVEL = 'A1';

// ======================
// Scoring
// ======================

/** XP value for correct answer */
export const XP_CORRECT_ANSWER = 10;

/** XP value for streak bonus (per streak level) */
export const XP_STREAK_BONUS = 5;

/** Minimum streak to show fire emoji */
export const STREAK_FIRE_THRESHOLD = 10;

/** Minimum streak to show star emoji */
export const STREAK_STAR_THRESHOLD = 5;

/** Minimum streak to show sparkle emoji */
export const STREAK_SPARKLE_THRESHOLD = 3;
