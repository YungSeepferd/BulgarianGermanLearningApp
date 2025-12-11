/**
 * Practice Session Schema - Defines the structure and validation rules for practice sessions
 * Separated to avoid circular dependencies between vocabulary and localStorage schemas
 */

import { z } from 'zod';

// Schema for practice sessions
export const PracticeSessionSchema = z.object({
  id: z.string().uuid(),
  currentItemId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  score: z.number().min(0).max(100).default(0),
  itemsPracticed: z.number().min(0).default(0),
  correctAnswers: z.number().min(0).default(0),
  incorrectAnswers: z.number().min(0).default(0),
  sessionType: z.enum(['vocabulary', 'grammar', 'listening', 'speaking']),
  completed: z.boolean().default(false)
});

// TypeScript type derived from Zod schema
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;