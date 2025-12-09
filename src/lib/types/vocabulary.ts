/**
 * Type definitions derived from Zod schemas for runtime validation
 * This ensures type safety by deriving TypeScript types from runtime schemas
 */

export type {
  VocabularyItem,
  PracticeSession
} from '$lib/schemas/vocabulary.js';
export type {
  PracticeStat,
  UserProgressStorage,
  ExportedUserData
} from '$lib/schemas/localStorage.js';