import { z } from 'zod';

// Quiz Question Schema
export const QuizQuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(3).max(500),
  questionType: z.enum(['multiple_choice', 'true_false', 'fill_blank', 'matching']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
  category: z.array(z.string()),
  vocabularyIds: z.array(z.string().uuid()).optional(),
  explanation: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Quiz Schema
export const QuizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'Mixed']),
  type: z.enum(['vocabulary', 'grammar', 'mixed']),
  questions: z.array(z.string().uuid()),
  estimatedTime: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type Quiz = z.infer<typeof QuizSchema>;

// Quiz Session Schema
export const QuizSessionSchema = z.object({
  id: z.string().uuid(),
  quizId: z.string().uuid(),
  userId: z.string().optional(),
  questions: z.array(z.object({
    questionId: z.string().uuid(),
    userAnswer: z.union([z.string(), z.array(z.string())]).optional(),
    isCorrect: z.boolean().optional(),
    timeTaken: z.number().int().nonnegative().optional()
  })),
  score: z.number().int().nonnegative().optional(),
  totalQuestions: z.number().int().positive(),
  status: z.enum(['in_progress', 'completed', 'abandoned']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type QuizSession = z.infer<typeof QuizSessionSchema>;

// Quiz Generation Criteria
export const QuizCriteriaSchema = z.object({
  difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'Mixed']).optional(),
  type: z.enum(['vocabulary', 'grammar', 'mixed']).optional(),
  category: z.string().optional(),
  questionTypes: z.array(z.enum(['multiple_choice', 'true_false', 'fill_blank', 'matching'])).optional(),
  limit: z.number().int().positive().min(1).max(50).optional(),
  estimatedTime: z.number().int().positive().optional()
});

export type QuizCriteria = z.infer<typeof QuizCriteriaSchema>;