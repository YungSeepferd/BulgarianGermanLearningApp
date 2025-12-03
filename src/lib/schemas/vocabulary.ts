import { z } from 'zod';

/**
 * Zod schema for validating vocabulary items at runtime
 * This schema challenges the assumption that "any JSON is fine" and provides
 * robust validation for the actual data structure used in the application
 */

// Schema for example sentences
export const ExampleSchema = z.object({
  sentence: z.string(),
  translation: z.string(),
  context: z.string().optional()
});

// Schema for pronunciation guidance
export const PronunciationSchema = z.object({
  bulgarian: z.string(),
  german: z.string()
});

// Schema for grammar information
export const GrammarSchema = z.object({
  part_of_speech: z.string(),
  gender: z.enum(['masculine', 'feminine', 'neuter', 'variable']).nullable().or(z.string().nullable()),
  declension: z.string().nullable(),
  
  // Rich context extensions
  verb_aspect: z.enum(['perfective', 'imperfective']).optional(),
  verb_partner_id: z.string().optional(), // ID of the aspectual pair
  plural_form: z.string().optional(),
  conjugation_class: z.string().optional()
});

// Schema for global statistics
export const GlobalStatsSchema = z.object({
  correct_count: z.number().int().nonnegative(),
  incorrect_count: z.number().int().nonnegative(),
  success_rate: z.number().min(0).max(100),
  last_practiced: z.string().datetime().optional()
});

// Main vocabulary item schema based on actual data structure
export const VocabularyItemSchema = z.object({
  // Required fields from actual data
  id: z.string(),
  type: z.enum(['word', 'rule']),
  bulgarian: z.string(),
  german: z.string(),
  category: z.string(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  frequency: z.number().int().min(0).max(100).optional(),
  
  // Optional structured fields from actual data
  examples: z.array(ExampleSchema).optional(),
  pronunciation: PronunciationSchema.optional(),
  grammar: GrammarSchema.optional(),
  
  // Tags and metadata
  tags: z.array(z.string()).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  
  // Rich Context Fields
  contextual_nuance: z.string().optional(), // e.g., "za edno" -> "together" vs "for one"
  mnemonics: z.string().optional(), // e.g., "Think of 'Sonne' for 'Slantse'"
  emoji: z.string().optional(), // ⚡️ Visual anchor
  image_url: z.string().optional(), // URL for immersion
  audio_url: z.string().optional(), // /audio/bg/word_id.mp3
  xp_value: z.number().int().min(1).default(10), // Gamification value
  
  // Legacy/Helper fields
  searchIndex: z.string().optional(),
  relatedItems: z.array(z.string()).optional(),
  audioPath: z.string().optional(), // @deprecated: use audio_url
  imagePath: z.string().optional(), // @deprecated: use image_url
  contextHints: z.array(z.string()).optional(),
  
  // Global statistics (if present)
  global_stats: GlobalStatsSchema.optional()
});

// Schema for array of vocabulary items
export const VocabularyArraySchema = z.array(VocabularyItemSchema);

// Schema for vocabulary search results
export const VocabularySearchResultSchema = z.object({
  items: VocabularyArraySchema,
  total: z.number().int().nonnegative(),
  categories: z.array(z.string()),
  tags: z.array(z.string())
});

// Schema for practice session
export const PracticeSessionSchema = z.object({
  currentItem: VocabularyItemSchema.nullable(),
  showAnswer: z.boolean(),
  direction: z.enum(['DE->BG', 'BG->DE']),
  startTime: z.date(),
  itemsPracticed: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  sessionType: z.enum(['random', 'category', 'difficulty', 'favorites', 'recommended']).optional(),
  filters: z.object({
    category: z.string().optional(),
    difficulty: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  responseTimes: z.array(z.number()).optional(),
  difficultItems: z.array(z.string()).optional(),
  duration: z.number().optional()
});

// Schema for user progress
export const UserProgressSchema = z.object({
  stats: z.record(z.string(), z.object({
    correct: z.number().int().nonnegative(),
    incorrect: z.number().int().nonnegative(),
    lastPracticed: z.string(),
    averageResponseTime: z.number().optional(),
    masteryLevel: z.number().min(0).max(100).optional(),
    streakCount: z.number().int().nonnegative().optional()
  })),
  favorites: z.array(z.string()),
  recentSearches: z.array(z.string()),
  overallStats: z.object({
    totalPracticed: z.number().int().nonnegative(),
    totalCorrect: z.number().int().nonnegative(),
    averageAccuracy: z.number().min(0).max(100),
    currentStreak: z.number().int().nonnegative(),
    longestStreak: z.number().int().nonnegative(),
    totalTimeSpent: z.number().nonnegative(),
    lastPracticeDate: z.string()
  }),
  goals: z.object({
    dailyTarget: z.number().int().nonnegative(),
    weeklyTarget: z.number().int().nonnegative(),
    currentStreak: z.number().int().nonnegative(),
    achievements: z.array(z.string())
  }).optional()
});

// Schema for practice recommendations
export const PracticeRecommendationSchema = z.object({
  items: VocabularyArraySchema,
  reason: z.enum(['new', 'struggling', 'review', 'streak', 'balanced']),
  priority: z.number().min(0).max(100),
  userDifficulty: z.enum(['easy', 'medium', 'hard'])
});

// Type inference from Zod schemas
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;
export type VocabularySearchResult = z.infer<typeof VocabularySearchResultSchema>;
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
export type PracticeRecommendation = z.infer<typeof PracticeRecommendationSchema>;
export type Example = z.infer<typeof ExampleSchema>;
export type Pronunciation = z.infer<typeof PronunciationSchema>;
export type Grammar = z.infer<typeof GrammarSchema>;
export type GlobalStats = z.infer<typeof GlobalStatsSchema>;

// Validation functions
export function validateVocabularyItem(data: unknown): VocabularyItem {
  return VocabularyItemSchema.parse(data);
}

export function validateVocabularyArray(data: unknown): VocabularyItem[] {
  return VocabularyArraySchema.parse(data);
}

export function safeValidateVocabularyItem(data: unknown): { success: true; data: VocabularyItem } | { success: false; error: z.ZodError } {
  const result = VocabularyItemSchema.safeParse(data);
  return result.success 
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

export function safeValidateVocabularyArray(data: unknown): { success: true; data: VocabularyItem[] } | { success: false; error: z.ZodError } {
  const result = VocabularyArraySchema.safeParse(data);
  return result.success 
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

// Helper function to normalize data from different sources
export function normalizeVocabularyItem(data: unknown): VocabularyItem {
  const result = safeValidateVocabularyItem(data);
  
  if (result.success) {
    return result.data;
  }
  
  // Attempt to normalize from legacy format
  if (typeof data === 'object' && data !== null) {
    const legacyData = data as Record<string, unknown>;
    
    // Map legacy fields to new schema (using bracket notation for index signature)
    const normalized: Partial<VocabularyItem> = {
      id: String(legacyData['id'] || ''),
      type: legacyData['type'] === 'rule' ? 'rule' : 'word',
      bulgarian: String(legacyData['bulgarian'] || ''),
      german: String(legacyData['german'] || ''),
      category: String(legacyData['category'] || 'Uncategorized'),
      tags: Array.isArray(legacyData['tags']) ? legacyData['tags'].map(String) : [],
      level: legacyData['difficulty'] as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' || 'A1'
    };
    
    // Try validation again with normalized data
    const normalizedResult = safeValidateVocabularyItem(normalized);
    if (normalizedResult.success) {
      return normalizedResult.data;
    }
  }
  
  throw new Error(`Failed to normalize vocabulary item: ${result.error?.message || 'Invalid data structure'}`);
}