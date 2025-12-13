/**
 * App-wide Icon System
 * 
 * Unified icon constants to ensure consistency across all pages.
 * Use these constants instead of hardcoding emoji icons.
 * 
 * @see docs/DESIGN_SYSTEM_AUDIT.md for design rationale
 */

export const APP_ICONS = {
  // Navigation & Main Actions
  DASHBOARD: '🏠',
  VOCABULARY: '📚',
  GRAMMAR: '📖',
  PRACTICE: '✏️',
  QUICK_PRACTICE: '⚡',
  LEARN: '🧠',
  
  // Content Types
  EXAMPLE: '💡',
  MNEMONIC: '🎯',
  NOTE: '📝',
  CULTURAL_NOTE: '🌍',
  ETYMOLOGY: '📜',
  
  // User Actions
  FAVORITE: '⭐',
  FAVORITE_FILLED: '★',
  CHECK: '✓',
  CROSS: '✗',
  SEARCH: '🔍',
  FILTER: '🔽',
  
  // Feedback
  CORRECT: '✅',
  INCORRECT: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  SUCCESS: '✓',
  
  // Lesson Types
  LISTENING: '🎧',
  CONVERSATION: '💬',
  READING: '📖',
  WRITING: '✍️',
  MIXED: '🎯',
  CULTURE: '🌍',
  
  // Progress & Stats
  TROPHY: '🏆',
  MEDAL: '🏅',
  STREAK: '🔥',
  LEVEL_UP: '⬆️',
  XP: '✨',
  
  // UI Elements
  LOADING: '🌀',
  EMPTY: '🔍',
  ERROR: '⚠️',
  CLOSE: '✕',
  MENU: '☰',
  ARROW_RIGHT: '→',
  ARROW_LEFT: '←',
  ARROW_DOWN: '↓',
  ARROW_UP: '↑'
} as const;

/**
 * Icon type helper for TypeScript autocomplete
 */
export type AppIconKey = keyof typeof APP_ICONS;

/**
 * Get icon by key with fallback
 */
export function getIcon(key: AppIconKey, fallback = '📝'): string {
  return APP_ICONS[key] ?? fallback;
}

/**
 * Practice action icons (for buttons)
 */
export const PRACTICE_ICONS = {
  STANDARD: APP_ICONS.PRACTICE,      // ✏️
  QUICK: APP_ICONS.QUICK_PRACTICE,   // ⚡
  LEARN: APP_ICONS.LEARN             // 🧠
} as const;

/**
 * CEFR level badge styles with consistent icons
 */
export const CEFR_ICONS = {
  A1: '🟦', // Blue square
  A2: '🟦',
  B1: '🟪', // Purple square
  B2: '🟪',
  C1: '🟣'  // Purple circle
} as const;

/**
 * Category badge icons (optional, can be removed if using colored tags only)
 */
export const CATEGORY_ICONS = {
  greetings: '👋',
  numbers: '🔢',
  family: '👨‍👩‍👧‍👦',
  food: '🍽️',
  colors: '🎨',
  animals: '🐾',
  'body-parts': '🫀',
  clothing: '👕',
  home: '🏠',
  nature: '🌳',
  transport: '🚗',
  technology: '💻',
  time: '⏰',
  weather: '☀️',
  professions: '💼',
  places: '🏛️',
  grammar: '📖',
  culture: '🌍',
  'everyday-phrases': '💬'
} as const;
