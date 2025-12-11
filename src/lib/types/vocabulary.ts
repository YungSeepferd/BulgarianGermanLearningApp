/**
 * Type definitions derived from Zod schemas for runtime validation
 * This ensures type safety by deriving TypeScript types from runtime schemas
 */

/**
 * Represents a breakdown part of a vocabulary phrase with its meaning
 * @property {string} part - The individual part/segment of the phrase
 * @property {string} meaning - The meaning/translation of this part
 */
export interface PhraseBreakdown {
  part: string;
  meaning: string;
}

/**
 * Represents media information for a vocabulary item
 * @property {string} emoji - Emoji representation of the vocabulary item
 * @property {string} [audio_url] - Optional URL to audio pronunciation
 */
export interface VocabularyMedia {
  emoji: string;
  audio_url?: string;
}

/**
 * Standard interface for vocabulary items with rich context
 * @property {string} id - Unique identifier for the vocabulary item
 * @property {string} term_bulgarian - Bulgarian term (e.g., 'за едно')
 * @property {string} term_german - German term (e.g., 'zusammen (getrennte Rechnungen)')
 * @property {PhraseBreakdown[]} breakdown - Array of objects for phrase deconstruction
 * @property {string} context_clue - Specific usage note (e.g., 'Used only in restaurants when paying')
 * @property {VocabularyMedia} media - Object containing emoji and optional audio URL
 * @property {string} category - Category of the vocabulary item (e.g., 'restaurant', 'food', 'grammar')
 * @property {number} difficulty - Difficulty level on a 1-5 scale
 * @property {string} part_of_speech - Part of speech (e.g., 'phrase', 'noun', 'verb', 'adjective')
 */
export interface VocabularyItem {
  id: string;
  term_bulgarian: string;
  term_german: string;
  breakdown: PhraseBreakdown[];
  context_clue: string;
  media: VocabularyMedia;
  category: string;
  difficulty: number;
  part_of_speech: string;
}

export type {
  PracticeSession
} from '$lib/schemas/practiceSession';
export type {
  PracticeStat,
  UserProgressStorage,
  ExportedUserData
} from '$lib/schemas/localStorage';