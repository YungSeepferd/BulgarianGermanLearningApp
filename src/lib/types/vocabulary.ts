/**
 * App-wide vocabulary types - SINGLE SOURCE OF TRUTH
 * All vocabulary data uses UnifiedVocabularyItem from unified-vocabulary.ts
 * Extended with top-level fields required by lesson services
 */
import type { 
  UnifiedVocabularyItem,
  PartOfSpeech as SchemaPartOfSpeech, 
  VocabularyCategory as SchemaVocabularyCategory 
} from '$lib/schemas/unified-vocabulary';

/**
 * Extended vocabulary item with top-level fields for lesson/practice services
 * These fields may come from metadata or be added during normalization
 */
export type VocabularyItem = UnifiedVocabularyItem & {
  /** Whether the word is common enough for basic lessons (default: false) */
  isCommon: boolean;
  /** Whether the item has been manually verified (default: false) */
  isVerified: boolean;
  /** SRS learning phase (0-6, default: 0 for unstarted) */
  learningPhase: number;
};

export type PartOfSpeech = SchemaPartOfSpeech;
export type VocabularyCategory = SchemaVocabularyCategory;

// Re-export other related types
export type { PracticeSession } from '$lib/schemas/practiceSession';
export type { PracticeStat, UserProgressStorage, ExportedUserData } from '$lib/schemas/localStorage';
