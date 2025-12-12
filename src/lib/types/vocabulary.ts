/**
 * App-wide vocabulary types - SINGLE SOURCE OF TRUTH
 * All vocabulary data uses UnifiedVocabularyItem from unified-vocabulary.ts
 */
import type { 
  UnifiedVocabularyItem,
  PartOfSpeech as SchemaPartOfSpeech, 
  VocabularyCategory as SchemaVocabularyCategory 
} from '$lib/schemas/unified-vocabulary';

// Re-export unified types as canonical VocabularyItem
export type VocabularyItem = UnifiedVocabularyItem;
export type PartOfSpeech = SchemaPartOfSpeech;
export type VocabularyCategory = SchemaVocabularyCategory;

// Re-export other related types
export type { PracticeSession } from '$lib/schemas/practiceSession';
export type { PracticeStat, UserProgressStorage, ExportedUserData } from '$lib/schemas/localStorage';
