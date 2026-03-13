/**
 * Vocabulary Index Schema - Lightweight index for chunked vocabulary loading
 *
 * Provides a minimal metadata index for all vocabulary items, enabling:
 * - Fast initial load (~15-20KB vs 1.3MB)
 * - Progressive loading by CEFR level
 * - Cross-chunk item lookup
 */

import { z } from 'zod';
import { PartOfSpeechSchema, VocabularyCategorySchema, LanguageLevelSchema } from './unified-vocabulary';

// ======================
// Index Item Schema
// ======================

/**
 * Minimal vocabulary item metadata for the master index
 * Contains just enough info for browsing, filtering, and lookup
 */
export const VocabularyIndexItemSchema = z.object({
  id: z.string().describe('Unique identifier'),
  german: z.string().describe('German word/phrase'),
  bulgarian: z.string().describe('Bulgarian translation'),
  partOfSpeech: PartOfSpeechSchema.describe('Part of speech'),
  difficulty: z.number().min(1).max(5).describe('Difficulty 1-5'),
  cefrLevel: LanguageLevelSchema.describe('CEFR level A1-C1'),
  categories: z.array(VocabularyCategorySchema).describe('Categories'),
  tags: z.array(z.string()).optional().describe('Custom tags'),

  // Feature flags for quick filtering without loading full item
  // Made optional with defaults for backward compatibility with existing index
  hasExamples: z.boolean().optional().default(false).describe('Has usage examples'),
  hasGrammar: z.boolean().optional().default(false).describe('Has grammar details'),
  hasAudio: z.boolean().optional().default(false).describe('Has audio resources'),
  hasNotes: z.boolean().optional().default(false).describe('Has notes/mnemonics'),

  // Quick stats
  exampleCount: z.number().optional().default(0).describe('Number of examples'),

  // Sync timestamp for cache invalidation
  updatedAt: z.string().datetime().optional().describe('Last update timestamp')
});

export type VocabularyIndexItem = z.infer<typeof VocabularyIndexItemSchema>;

// ======================
// Level Statistics Schema
// ======================

export const LevelStatisticsSchema = z.object({
  count: z.number().min(0).describe('Number of items in this level'),
  chunkSize: z.number().min(0).describe('Size of chunk file in bytes'),
  chunkPath: z.string().describe('Relative path to chunk file'),

  // Distribution within level
  byCategory: z.record(z.string(), z.number()).optional().describe('Count by category'),
  byPartOfSpeech: z.record(z.string(), z.number()).optional().describe('Count by part of speech'),
  byDifficulty: z.record(z.string(), z.number()).optional().describe('Count by difficulty')
});

export type LevelStatistics = z.infer<typeof LevelStatisticsSchema>;

// ======================
// Master Index Schema
// ======================

export const VocabularyIndexSchema = z.object({
  // Metadata
  version: z.number().default(1).describe('Index schema version'),
  lastUpdated: z.string().datetime().describe('Index generation timestamp'),
  totalItems: z.number().min(0).describe('Total items across all levels'),

  // CEFR level statistics
  levels: z.object({
    A1: LevelStatisticsSchema,
    A2: LevelStatisticsSchema,
    B1: LevelStatisticsSchema,
    B2: LevelStatisticsSchema,
    C1: LevelStatisticsSchema
  }).describe('Statistics for each CEFR level'),

  // All items (minimal metadata only)
  items: z.array(VocabularyIndexItemSchema).describe('All items metadata'),

  // Global statistics
  statistics: z.object({
    byCategory: z.record(z.string(), z.number()).describe('Global count by category'),
    byPartOfSpeech: z.record(z.string(), z.number()).describe('Global count by part of speech'),
    byDifficulty: z.record(z.string(), z.number()).describe('Global count by difficulty'),
    byLevel: z.record(z.string(), z.number()).describe('Count by CEFR level')
  }).describe('Global statistics')
});

export type VocabularyIndex = z.infer<typeof VocabularyIndexSchema>;

// ======================
// CEFR Level Type
// ======================

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

// Type guard for CEFR levels
export function isCEFRLevel(level: string): level is CEFRLevel {
  return CEFR_LEVELS.includes(level as CEFRLevel);
}

// ======================
// Helper Functions
// ======================

/**
 * Create an index item from a full vocabulary item
 */
export function createIndexItem(item: {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: number;
  cefrLevel?: string;
  categories: string[];
  tags?: string[];
  examples?: unknown[];
  grammar?: unknown;
  audio?: unknown;
  audioUrl?: string;
  notes?: unknown;
  updatedAt?: Date | string;
}): VocabularyIndexItem {
  return {
    id: item.id,
    german: item.german,
    bulgarian: item.bulgarian,
    partOfSpeech: item.partOfSpeech as any,
    difficulty: item.difficulty,
    cefrLevel: (item.cefrLevel || 'A1') as any,
    categories: item.categories as any,
    tags: item.tags,
    hasExamples: Array.isArray(item.examples) && item.examples.length > 0,
    hasGrammar: !!item.grammar && Object.keys(item.grammar).length > 0,
    hasAudio: !!(item.audio || item.audioUrl),
    hasNotes: !!item.notes,
    exampleCount: Array.isArray(item.examples) ? item.examples.length : 0,
    updatedAt: item.updatedAt instanceof Date
      ? item.updatedAt.toISOString()
      : typeof item.updatedAt === 'string'
        ? item.updatedAt
        : new Date().toISOString()
  };
}

/**
 * Calculate statistics for a set of items
 */
export function calculateStatistics(items: VocabularyIndexItem[]) {
  const byCategory: Record<string, number> = {};
  const byPartOfSpeech: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byLevel: Record<string, number> = {};

  for (const item of items) {
    // Categories
    for (const cat of item.categories) {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Part of speech
    byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;

    // Difficulty
    byDifficulty[String(item.difficulty)] = (byDifficulty[String(item.difficulty)] || 0) + 1;

    // Level
    byLevel[item.cefrLevel] = (byLevel[item.cefrLevel] || 0) + 1;
  }

  return {
    byCategory,
    byPartOfSpeech,
    byDifficulty,
    byLevel
  };
}

/**
 * Group items by CEFR level
 */
export function groupByLevel(items: VocabularyIndexItem[]): Record<CEFRLevel, VocabularyIndexItem[]> {
  const grouped: Record<CEFRLevel, VocabularyIndexItem[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: []
  };

  for (const item of items) {
    const level = item.cefrLevel as CEFRLevel;
    if (CEFR_LEVELS.includes(level)) {
      grouped[level].push(item);
    } else {
      grouped.A1.push(item); // Fallback
    }
  }

  return grouped;
}
