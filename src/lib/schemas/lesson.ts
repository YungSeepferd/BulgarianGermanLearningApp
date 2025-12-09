// Lesson Schema for Bulgarian-German Language Learning Application
import { z } from 'zod';
import {
  PartOfSpeechSchema,
  VocabularyCategorySchemaWithFallback,
  VocabularyMetadataSchema,
  LegacyIdSchema
} from './vocabulary';

// Create a base schema without catch for omit operations
const VocabularyItemBaseSchema = z.object({
  id: LegacyIdSchema,
  german: z.string().min(1).max(100),
  bulgarian: z.string().min(1).max(100),
  partOfSpeech: PartOfSpeechSchema.default('noun'),
  difficulty: z.number().min(1).max(5).default(1).describe('1-5 scale where 1 is easiest'),
  categories: z.array(VocabularyCategorySchemaWithFallback).min(1).default(['uncategorized']),
  metadata: VocabularyMetadataSchema.optional(),
  createdAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val)),
  updatedAt: z.union([
    z.date(),
    z.string().datetime().transform(str => new Date(str))
  ]).default(new Date()).transform(val => val instanceof Date ? val : new Date(val)),
  isCommon: z.boolean().default(false),
  isVerified: z.boolean().default(false)
});

// Vocabulary reference schema
export const VocabularyReferenceSchema = z.union([
  VocabularyItemBaseSchema.omit({ id: true }),  // Use base schema for omit()
  LegacyIdSchema,
  z.string().uuid()
]);

// Lesson difficulty levels
export const LessonDifficultySchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1']);

// Lesson types
export const LessonTypeSchema = z.enum([
  'vocabulary', 'grammar', 'conversation', 'reading', 'listening', 'writing', 'culture', 'mixed'
]);

// Learning objective schema
export const LearningObjectiveSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(5).max(200),
  isCompleted: z.boolean().default(false),
  createdAt: z.date().default(new Date())
});

// Lesson metadata
export const LessonMetadataSchema = z.object({
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(LegacyIdSchema).default([]),
  relatedLessons: z.array(LegacyIdSchema).default([]),
  isPremium: z.boolean().default(false)
}).default({});

// Main Lesson Schema
export const LessonSchema = z.object({
  id: LegacyIdSchema,
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  difficulty: LessonDifficultySchema.default('A1'),
  type: LessonTypeSchema.default('vocabulary'),
  duration: z.number().min(5).max(120).default(15),
  vocabulary: z.array(VocabularyReferenceSchema).default([]),
  objectives: z.array(LearningObjectiveSchema).default([]),
  content: z.string().optional(),
  isCompleted: z.boolean().default(false),
  completionPercentage: z.number().min(0).max(100).default(0),
  createdAt: z.union([z.date(), z.string().datetime().transform(str => new Date(str))]).default(new Date()),
  updatedAt: z.union([z.date(), z.string().datetime().transform(str => new Date(str))]).default(new Date()),
  metadata: LessonMetadataSchema
}).catch((_ctx) => {
  return {
    id: `fallback-${Date.now()}`,
    title: 'Invalid Lesson',
    description: 'This lesson failed validation',
    difficulty: 'A1',
    type: 'vocabulary',
    duration: 15,
    vocabulary: [],
    objectives: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {}
  };
});

// TypeScript types
export type VocabularyReference = z.infer<typeof VocabularyReferenceSchema>;
export type LessonDifficulty = z.infer<typeof LessonDifficultySchema>;
export type LessonType = z.infer<typeof LessonTypeSchema>;
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;
export type LessonMetadata = z.infer<typeof LessonMetadataSchema>;
export type Lesson = z.infer<typeof LessonSchema>;