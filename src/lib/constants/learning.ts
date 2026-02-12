/**
 * Learning & Practice Constants
 *
 * Constants for lesson generation and practice modes
 */

// ======================
// Lesson Generation
// ======================

/** Default number of items in a lesson */
export const DEFAULT_LESSON_SIZE = 10;

/** Minimum lesson size */
export const MIN_LESSON_SIZE = 5;

/** Maximum lesson size */
export const MAX_LESSON_SIZE = 20;

/** Available lesson sizes */
export const LESSON_SIZE_OPTIONS = [5, 8, 10, 15, 20] as const;

// ======================
// Practice Modes
// ======================

/** Practice modes available */
export const PRACTICE_MODES = ['practice', 'search'] as const;

/** Language modes */
export const LANGUAGE_MODES = ['DE_BG', 'BG_DE'] as const;

// ======================
// Card Interactions
// ======================

/** Swipe threshold in pixels to trigger action */
export const SWIPE_THRESHOLD_PX = 100;

/** Distance to animate card off screen (px) */
export const CARD_EXIT_DISTANCE_PX = 500;

/** Rotation angle for card swipe (degrees) */
export const CARD_SWIPE_ROTATION_DEG = 30;

/** Minimum drag distance to consider a tap (px) */
export const TAP_MAX_DRAG_PX = 10;

/** Card height (px) */
export const SWIPEABLE_CARD_HEIGHT = 400;

/** Maximum card width (px) */
export const SWIPEABLE_CARD_MAX_WIDTH = 400;

// ======================
// Progress Thresholds
// ======================

/** Threshold to show progress as "good" (%) */
export const PROGRESS_GOOD_THRESHOLD = 80;

/** Threshold to show progress as "medium" (%) */
export const PROGRESS_MEDIUM_THRESHOLD = 50;

/** Mastery threshold - consider word learned (%) */
export const MASTERY_THRESHOLD_PERCENT = 80;

// ======================
// Gamification
// ======================

/** Points for learning a new word */
export const POINTS_NEW_WORD = 10;

/** Points for correct practice */
export const POINTS_CORRECT_PRACTICE = 5;

/** Points for completing daily goal */
export const POINTS_DAILY_GOAL = 50;

// ======================
// Spaced Repetition
// ======================

/** Initial interval for new words (hours) */
export const SRS_INITIAL_INTERVAL_HOURS = 24;

/** Multiplier for correct answers */
export const SRS_EASE_FACTOR_CORRECT = 1.2;

/** Multiplier for incorrect answers */
export const SRS_EASE_FACTOR_INCORRECT = 0.8;
