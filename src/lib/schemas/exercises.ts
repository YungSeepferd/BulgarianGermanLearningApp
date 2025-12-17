import { z } from 'zod';

/**
 * Exercise Type Definitions
 * 
 * Schemas for all 5 exercise types in Phase 2:
 * 1. Fill-in-the-Blank
 * 2. Multiple Choice
 * 3. Matching
 * 4. Ordering/Sequencing
 * 5. Typing
 */

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

/**
 * Base exercise item (shared across all types)
 */
export const ExerciseItemBaseSchema = z.object({
  id: z.string().min(1, 'Exercise item ID is required'),
  vocabularyId: z.string().min(1, 'Vocabulary ID is required'),
  german: z.string().min(1, 'German text is required'),
  bulgarian: z.string().min(1, 'Bulgarian text is required'),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'other']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.string().optional(),
});

/**
 * Exercise attempt result
 */
export const ExerciseAttemptResultSchema = z.object({
  exerciseId: z.string(),
  correct: z.boolean(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  timeSpent: z.number().min(0, 'Time spent must be positive'),
  timestamp: z.date().default(() => new Date()),
});

/**
 * Exercise session progress
 */
export const ExerciseSessionSchema = z.object({
  sessionId: z.string(),
  exerciseType: z.enum(['fill-in-blank', 'multiple-choice', 'matching', 'ordering', 'typing']),
  startTime: z.date(),
  endTime: z.date().optional(),
  totalAttempts: z.number().min(0).default(0),
  correctAttempts: z.number().min(0).default(0),
  results: z.array(ExerciseAttemptResultSchema).default([]),
});

// ============================================================================
// 1. FILL-IN-THE-BLANK EXERCISE
// ============================================================================

/**
 * Fill-in-the-Blank question with blanks marked by underscores
 * Example: "Das Haus ist sehr ____" -> answer: "schön"
 */
export const FillInTheBlankQuestionSchema = ExerciseItemBaseSchema.extend({
  type: z.literal('fill-in-blank'),
  question: z.string().min(10, 'Question must be at least 10 characters'),
  blankPosition: z.number().min(0, 'Blank position must be non-negative'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  hints: z.array(z.string()).optional(),
  acceptedVariations: z.array(z.string()).optional(),
  source: z.enum(['german', 'bulgarian']),
});

export const FillInTheBlankExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('fill-in-blank'),
  questions: z.array(FillInTheBlankQuestionSchema),
  currentQuestionIndex: z.number().min(0).default(0),
  userAnswers: z.array(z.string()).default([]),
  isComplete: z.boolean().default(false),
  feedback: z.array(z.object({
    questionId: z.string(),
    isCorrect: z.boolean(),
    userAnswer: z.string(),
    correctAnswer: z.string(),
  })).default([]),
});

// ============================================================================
// 2. MULTIPLE CHOICE EXERCISE
// ============================================================================

/**
 * Multiple choice option
 */
export const MultipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

/**
 * Multiple choice question
 */
export const MultipleChoiceQuestionSchema = ExerciseItemBaseSchema.extend({
  type: z.literal('multiple-choice'),
  question: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(MultipleChoiceOptionSchema).min(2, 'At least 2 options required'),
  explanation: z.string().optional(),
  source: z.enum(['german', 'bulgarian']),
});

export const MultipleChoiceExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('multiple-choice'),
  questions: z.array(MultipleChoiceQuestionSchema),
  currentQuestionIndex: z.number().min(0).default(0),
  userAnswers: z.array(z.string()).default([]),
  isComplete: z.boolean().default(false),
  feedback: z.array(z.object({
    questionId: z.string(),
    isCorrect: z.boolean(),
    userAnswer: z.string(),
    correctAnswerId: z.string(),
  })).default([]),
});

// ============================================================================
// 3. MATCHING EXERCISE
// ============================================================================

/**
 * Matching pair (connect left item to right item)
 */
export const MatchingPairSchema = z.object({
  id: z.string(),
  leftId: z.string(),
  leftText: z.string().min(1, 'Left text is required'),
  rightId: z.string(),
  rightText: z.string().min(1, 'Right text is required'),
});

export const MatchingExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('matching'),
  title: z.string().min(5, 'Title is required'),
  pairs: z.array(MatchingPairSchema).min(2, 'At least 2 pairs required'),
  userMatches: z.array(z.object({
    leftId: z.string(),
    rightId: z.string(),
  })).default([]),
  isComplete: z.boolean().default(false),
  correctCount: z.number().min(0).default(0),
});

// ============================================================================
// 4. ORDERING/SEQUENCING EXERCISE
// ============================================================================

/**
 * Sequencing item (words, sentences, or steps to arrange)
 */
export const SequencingItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Item text is required'),
  correctPosition: z.number().min(0, 'Correct position must be non-negative'),
});

export const OrderingExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('ordering'),
  title: z.string().min(5, 'Title is required'),
  instruction: z.string().default('Put the items in the correct order'),
  items: z.array(SequencingItemSchema).min(2, 'At least 2 items required'),
  userOrder: z.array(z.string()).default([]),
  isComplete: z.boolean().default(false),
  correctCount: z.number().min(0).default(0),
});

// ============================================================================
// 5. TYPING EXERCISE
// ============================================================================

/**
 * Typing exercise - translate or transcribe
 */
export const TypingExerciseQuestionSchema = ExerciseItemBaseSchema.extend({
  type: z.literal('typing'),
  prompt: z.string().min(5, 'Prompt is required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  caseSensitive: z.boolean().default(false),
  acceptedVariations: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
  source: z.enum(['german', 'bulgarian']),
  exerciseMode: z.enum(['translation', 'transcription']),
});

export const TypingExerciseSchema = z.object({
  id: z.string(),
  type: z.literal('typing'),
  questions: z.array(TypingExerciseQuestionSchema),
  currentQuestionIndex: z.number().min(0).default(0),
  userAnswers: z.array(z.string()).default([]),
  isComplete: z.boolean().default(false),
  feedback: z.array(z.object({
    questionId: z.string(),
    isCorrect: z.boolean(),
    userAnswer: z.string(),
    correctAnswer: z.string(),
    similarity: z.number().min(0).max(1),
  })).default([]),
});

// ============================================================================
// UNION TYPES & GENERAL SCHEMAS
// ============================================================================

/**
 * Any exercise type
 */
export const ExerciseSchema = z.union([
  FillInTheBlankExerciseSchema,
  MultipleChoiceExerciseSchema,
  MatchingExerciseSchema,
  OrderingExerciseSchema,
  TypingExerciseSchema,
]);

/**
 * Exercise results for tracking and analytics
 */
export const ExerciseResultsSchema = z.object({
  userId: z.string(),
  exerciseId: z.string(),
  exerciseType: z.string(),
  completionTime: z.number().min(0),
  score: z.number().min(0).max(100),
  attempts: z.number().min(1),
  passedOnFirstAttempt: z.boolean(),
  timestamp: z.date().default(() => new Date()),
});

/**
 * Exercise statistics for user progress
 */
export const ExerciseStatsSchema = z.object({
  totalExercises: z.number().min(0),
  completedExercises: z.number().min(0),
  averageScore: z.number().min(0).max(100),
  totalTime: z.number().min(0),
  byType: z.object({
    'fill-in-blank': z.number().min(0),
    'multiple-choice': z.number().min(0),
    'matching': z.number().min(0),
    'ordering': z.number().min(0),
    'typing': z.number().min(0),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ExerciseItemBase = z.infer<typeof ExerciseItemBaseSchema>;
export type ExerciseAttemptResult = z.infer<typeof ExerciseAttemptResultSchema>;
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>;

export type FillInTheBlankQuestion = z.infer<typeof FillInTheBlankQuestionSchema>;
export type FillInTheBlankExercise = z.infer<typeof FillInTheBlankExerciseSchema>;

export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOptionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;
export type MultipleChoiceExercise = z.infer<typeof MultipleChoiceExerciseSchema>;

export type MatchingPair = z.infer<typeof MatchingPairSchema>;
export type MatchingExercise = z.infer<typeof MatchingExerciseSchema>;

export type SequencingItem = z.infer<typeof SequencingItemSchema>;
export type OrderingExercise = z.infer<typeof OrderingExerciseSchema>;

export type TypingExerciseQuestion = z.infer<typeof TypingExerciseQuestionSchema>;
export type TypingExercise = z.infer<typeof TypingExerciseSchema>;

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseResults = z.infer<typeof ExerciseResultsSchema>;
export type ExerciseStats = z.infer<typeof ExerciseStatsSchema>;
