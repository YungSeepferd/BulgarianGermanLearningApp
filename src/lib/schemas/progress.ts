/**
 * Progress Tracking Schema
 *
 * This module defines the Zod schemas for tracking user progress in the language learning application.
 * It includes schemas for vocabulary mastery, lesson completion, quiz performance, and overall progress.
 */
import { z } from 'zod';

// Vocabulary Mastery Schema
export const VocabularyMasterySchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  correctCount: z.number().int().min(0).default(0),
  incorrectCount: z.number().int().min(0).default(0),
  totalAttempts: z.number().int().min(0).default(0),
  lastPracticed: z.string().datetime().nullable().default(null),
  masteryLevel: z.number().min(0).max(100).default(0),
  isMastered: z.boolean().default(false),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString())
});

export type VocabularyMastery = z.infer<typeof VocabularyMasterySchema>;

// Lesson Progress Schema
export const LessonProgressSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().uuid(),
  userId: z.string().uuid().optional(), // For future multi-user support
  status: z.enum(['not_started', 'in_progress', 'completed', 'mastered']).default('not_started'),
  completionPercentage: z.number().min(0).max(100).default(0),
  lastAccessed: z.string().datetime().nullable().default(null),
  completedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString())
});

export type LessonProgress = z.infer<typeof LessonProgressSchema>;

// Quiz Performance Schema
export const QuizPerformanceSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  sessionId: z.string().uuid(),
  score: z.number().min(0).max(100).default(0),
  totalQuestions: z.number().int().min(1).default(1),
  correctAnswers: z.number().int().min(0).default(0),
  incorrectAnswers: z.number().int().min(0).default(0),
  timeTaken: z.number().int().min(0).default(0), // in seconds
  completedAt: z.string().datetime().default(() => new Date().toISOString()),
  createdAt: z.string().datetime().default(() => new Date().toISOString())
});

export type QuizPerformance = z.infer<typeof QuizPerformanceSchema>;

// Question Performance Schema
export const QuestionPerformanceSchema = z.object({
  id: z.string().uuid(),
  quizPerformanceId: z.string().uuid(),
  questionId: z.string().uuid(),
  questionType: z.string().min(1),
  wasCorrect: z.boolean().default(false),
  userAnswer: z.string().nullable().default(null),
  correctAnswer: z.string().min(1),
  timeTaken: z.number().int().min(0).default(0), // in seconds
  createdAt: z.string().datetime().default(() => new Date().toISOString())
});

export type QuestionPerformance = z.infer<typeof QuestionPerformanceSchema>;

// Daily Progress Schema
export const DailyProgressSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime().default(() => new Date().toISOString()),
  xpEarned: z.number().int().min(0).default(0),
  wordsPracticed: z.number().int().min(0).default(0),
  lessonsCompleted: z.number().int().min(0).default(0),
  quizzesTaken: z.number().int().min(0).default(0),
  timeSpent: z.number().int().min(0).default(0), // in seconds
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString())
});

export type DailyProgress = z.infer<typeof DailyProgressSchema>;

// Overall Progress Schema
export const OverallProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(), // For future multi-user support
  totalXP: z.number().int().min(0).default(0),
  totalWordsPracticed: z.number().int().min(0).default(0),
  totalLessonsCompleted: z.number().int().min(0).default(0),
  totalQuizzesTaken: z.number().int().min(0).default(0),
  totalTimeSpent: z.number().int().min(0).default(0), // in seconds
  currentLevel: z.number().int().min(1).default(1),
  currentStreak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastActiveDate: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString())
});

export type OverallProgress = z.infer<typeof OverallProgressSchema>;

// Progress Data Schema (for localStorage)
export const ProgressDataSchema = z.object({
  vocabularyMastery: z.record(z.string().uuid(), VocabularyMasterySchema),
  lessonProgress: z.record(z.string().uuid(), LessonProgressSchema),
  quizPerformance: z.record(z.string().uuid(), QuizPerformanceSchema),
  questionPerformance: z.record(z.string().uuid(), QuestionPerformanceSchema),
  dailyProgress: z.record(z.string(), DailyProgressSchema), // date as key
  overallProgress: OverallProgressSchema
});

export type ProgressData = z.infer<typeof ProgressDataSchema>;

// Utility functions for progress calculation
export const calculateMasteryLevel = (correct: number, incorrect: number): number => {
  const total = correct + incorrect;
  if (total === 0) return 0;
  // Simple mastery calculation: 80% correct = mastered
  const mastery = (correct / total) * 100;
  return Math.min(100, Math.max(0, Math.round(mastery)));
};

export const isItemMastered = (masteryLevel: number): boolean => {
  return masteryLevel >= 80;
};

export const calculateLevel = (totalXP: number): number => {
  // Level 1: 0-200 XP
  // Level 2: 201-500 XP
  // Level 3: 501-900 XP
  // Level 4: 901-1400 XP
  // Level 5: 1401-2000 XP
  // And so on...
  if (totalXP < 200) return 1;
  if (totalXP < 500) return 2;
  if (totalXP < 900) return 3;
  if (totalXP < 1400) return 4;
  if (totalXP < 2000) return 5;

  // For higher levels, use a formula
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  return Math.max(1, level);
};

export const calculateXPForLevel = (level: number): number => {
  if (level === 1) return 0;
  if (level === 2) return 200;
  if (level === 3) return 500;
  if (level === 4) return 900;
  if (level === 5) return 1400;

  // For higher levels, use the inverse of the level calculation
  return Math.pow(level - 1, 2) * 100;
};
