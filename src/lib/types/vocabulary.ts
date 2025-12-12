/**
 * App-wide vocabulary types normalized for UI components and services.
 * These types align with items produced by vocabularyDb and validated data loaders.
 */
import type { PartOfSpeech as SchemaPartOfSpeech, VocabularyCategory as SchemaVocabularyCategory } from '$lib/schemas/vocabulary';

// Re-export for convenience
export type PartOfSpeech = SchemaPartOfSpeech;
export type VocabularyCategory = SchemaVocabularyCategory;

export interface VocabularyExamplePreview {
  sentence: string;
  translation: string;
  context?: string;
}

export interface VocabularyMetadataLite {
  notes?: string;
  mnemonic?: string;
  culturalNote?: string;
  etymology?: string;
  article?: 'der' | 'die' | 'das' | 'ein' | 'eine';
  gender?: 'masculine' | 'feminine' | 'neuter';
  examples?: Array<{ german: string; bulgarian: string; context?: string }>;
  components?: Array<{ part: string; meaning: string; note?: string }>;
}

export interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  // Primary category (first of categories) kept for UI convenience
  category: VocabularyCategory | string;
  // All categories per schema
  categories: VocabularyCategory[];
  // Optional tag list for search filters and badges
  tags?: string[];
  // 1..5 numeric difficulty (maps to CEFR for display)
  difficulty: number;
  partOfSpeech: PartOfSpeech;
  literalBreakdown?: Array<{ segment: string; literal: string; grammarTag?: string; note?: string }>;
  emoji?: string;
  audioUrl?: string;
  contextualNuance?: string;
  // UX fields that may exist from data import
  xp_value?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Optional data used by some components
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type?: 'word' | 'rule';
  global_stats?: { correct_count: number; incorrect_count: number; success_rate: number };
  // Legacy examples preview (SearchList/TandemPractice may check presence)
  examples?: VocabularyExamplePreview[];
  metadata?: VocabularyMetadataLite;
  media?: { emoji?: string };
  grammar?: {
    part_of_speech?: string;
    gender?: 'masculine' | 'feminine' | 'neuter';
    verb_aspect?: string;
  };
  mnemonics?: string;
  pronunciation?: { bulgarian?: string; german?: string };
}

export type { PracticeSession } from '$lib/schemas/practiceSession';
export type { PracticeStat, UserProgressStorage, ExportedUserData } from '$lib/schemas/localStorage';