/**
 * Type definitions derived from Zod schemas for runtime validation
 * This ensures type safety by deriving TypeScript types from runtime schemas
 */

export type {
  VocabularyItem,
  VocabularySearchResult,
  PracticeSession,
  UserProgress,
  PracticeRecommendation,
  Example,
  Pronunciation,
  Grammar,
  GlobalStats
} from '$lib/schemas/vocabulary.js';

// Re-export validation functions for convenience
export {
  validateVocabularyItem,
  validateVocabularyArray,
  safeValidateVocabularyItem,
  safeValidateVocabularyArray,
  normalizeVocabularyItem
} from '$lib/schemas/vocabulary.js';