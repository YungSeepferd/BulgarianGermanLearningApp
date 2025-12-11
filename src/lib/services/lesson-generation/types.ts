/**
 * Type definitions for the Dynamic Lesson Generation system
 *
 * This file contains all TypeScript interfaces and types used in the lesson generation
 * system, ensuring type safety and clear contracts between components.
 */

import type { VocabularyItem, PartOfSpeech, VocabularyCategory } from '$lib/types/vocabulary';
import type { Lesson as _Lesson, LessonDifficulty as _LessonDifficulty, LessonType as _LessonType } from '$lib/schemas/lesson';

/**
 * Lesson difficulty levels
 */
export type LessonDifficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/**
 * Lesson types
 */
export type LessonType = 'vocabulary' | 'grammar' | 'mixed' | 'culture' | 'contextual';

/**
 * Template variable types
 */
export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Template variable definition
 */
export interface TemplateVariable {
  name: string;
  type: TemplateVariableType;
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean | object | unknown[];
}

/**
 * Lesson template structure
 */
export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  type: LessonType;
  difficultyRange: [LessonDifficulty, LessonDifficulty];
  template: string;
  variables: TemplateVariable[];
  exampleData?: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Grammar query criteria
 */
export interface GrammarQueryCriteria {
  difficulty?: LessonDifficulty;
  partOfSpeech?: PartOfSpeech;
  limit?: number;
  conceptType?: string;
}

/**
 * Cultural grammar concept structure
 */
export interface CulturalGrammarConcept {
  id: string;
  name: {
    bulgarian: string;
    german: string;
  };
  description: {
    bulgarian: string;
    german: string;
  };
  difficulty: LessonDifficulty;
  partOfSpeech: PartOfSpeech[];
  culturalContext: {
    bulgarianPerspective: string;
    germanPerspective: string;
    crossLinguisticExplanation: {
      bgToDe: string;
      deToBg: string;
    };
  };
  examples: Array<{
    bulgarian: string;
    german: string;
    explanationBgToDe: string;
    explanationDeToBg: string;
  }>;
  commonMistakes: {
    bgToDe: string[];
    deToBg: string[];
  };
  relatedConcepts: string[];
  metadata: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Lesson generation parameters
 */
export interface LessonGenerationParams {
  type: LessonType;
  difficulty: LessonDifficulty;
  criteria: {
    categories?: VocabularyCategory[];
    partOfSpeech?: PartOfSpeech;
    difficulty?: LessonDifficulty;
    limit?: number;
    conceptType?: string;
  };
  userId: string;
  metadata?: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Generated lesson content section
 */
export interface GeneratedLessonSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'vocabulary' | 'grammar' | 'exercise' | 'summary' | 'cultural';
  metadata?: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Generated lesson structure
 */
export interface GeneratedLesson {
  id: string;
  type: LessonType;
  difficulty: LessonDifficulty;
  title: string;
  sections: GeneratedLessonSection[];
  vocabulary: VocabularyItem[];
  grammarConcepts: CulturalGrammarConcept[];
  learningObjectives: string[];
  metadata: Record<string, string | number | boolean | object | unknown[]>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User learning profile for adaptive learning
 */
export interface UserLearningProfile {
  userId: string;
  proficiency: Record<LessonDifficulty, number>;
  learningHistory: Record<string, {
    lastReviewed: Date | null;
    reviewCount: number;
    proficiency: number;
    learningPhase: number;
  }>;
  preferences: {
    lessonTypes: LessonType[];
    difficultyPreferences: Record<LessonType, LessonDifficulty>;
    learningGoals: string[];
  };
  metadata: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Template rendering context
 */
export interface TemplateRenderingContext {
  [key: string]: string | number | boolean | object | unknown[] | undefined;
  sectionTitle?: string;
  count?: number;
  theme?: string;
  difficulty?: LessonDifficulty;
  vocabulary?: VocabularyItem[];
  grammarConcept?: CulturalGrammarConcept;
  learningTip?: string;
  learningObjectives?: string[];
}

/**
 * Lesson generation algorithm options
 */
export interface LessonGenerationOptions {
  useSpacedRepetition?: boolean;
  difficultyAdjustment?: boolean;
  culturalContext?: boolean;
  personalizationLevel?: 'low' | 'medium' | 'high';
  maxItems?: number;
}

/**
 * Enhanced lesson criteria (extends legacy format)
 */
export interface EnhancedLessonCriteria {
  userId?: string;
  type?: LessonType;
  difficulty?: LessonDifficulty;
  categories?: VocabularyCategory[];
  partOfSpeech?: PartOfSpeech;
  limit?: number;
  conceptType?: string;
  metadata?: Record<string, string | number | boolean | object | unknown[]>;
}

/**
 * Template repository interface
 */
export interface ILessonTemplateRepository {
  getTemplate(type: LessonType, difficulty: LessonDifficulty): Promise<LessonTemplate>;
  getTemplateById(templateId: string): Promise<LessonTemplate | undefined>;
  getAllTemplates(): Promise<LessonTemplate[]>;
  validateTemplate(template: LessonTemplate): boolean;
}

/**
 * Cultural grammar service interface
 */
export interface ICulturalGrammarService {
  query(criteria: GrammarQueryCriteria): Promise<CulturalGrammarConcept[]>;
  getAllConcepts(): Promise<CulturalGrammarConcept[]>;
  conceptAppliesToPartOfSpeech(concept: CulturalGrammarConcept, partOfSpeech: PartOfSpeech): boolean;
}

/**
 * Template renderer interface
 */
export interface ITemplateRenderer {
  render(template: LessonTemplate, data: TemplateRenderingContext): string;
  validateTemplate(template: LessonTemplate): boolean;
  validateData(template: LessonTemplate, data: TemplateRenderingContext): boolean;
}

/**
 * Lesson generation engine interface
 */
export interface ILessonGenerationEngine {
  generateLesson(params: LessonGenerationParams, options?: LessonGenerationOptions): Promise<GeneratedLesson>;
  generateThematicLesson(params: LessonGenerationParams, options?: LessonGenerationOptions): Promise<GeneratedLesson>;
  generateGrammarLesson(params: LessonGenerationParams, options?: LessonGenerationOptions): Promise<GeneratedLesson>;
  generateContextualLesson(params: LessonGenerationParams, options?: LessonGenerationOptions): Promise<GeneratedLesson>;
  generateAdaptiveLesson(params: LessonGenerationParams, options?: LessonGenerationOptions): Promise<GeneratedLesson>;
}

/**
 * Utility type for template variable validation
 */
export type TemplateVariableValidator = (value: string | number | boolean | object | unknown[], variable: TemplateVariable) => boolean;

/**
 * Error types for lesson generation
 */
export class LessonGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LessonGenerationError';
  }
}

export class TemplateRenderingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateRenderingError';
  }
}

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}

/**
 * Utility functions for type validation
 */
export const isLessonDifficulty = (value: string): value is LessonDifficulty => {
  return ['A1', 'A2', 'B1', 'B2', 'C1'].includes(value);
};

export const isLessonType = (value: string): value is LessonType => {
  return ['vocabulary', 'grammar', 'mixed', 'cultural', 'contextual'].includes(value);
};

export const isPartOfSpeech = (value: string): value is PartOfSpeech => {
  return ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'article', 'numeral'].includes(value);
};

export const isVocabularyCategory = (value: string): value is VocabularyCategory => {
  return [
    'home', 'family', 'food', 'travel', 'work', 'education', 'nature', 'animals',
    'body', 'health', 'clothing', 'colors', 'numbers', 'time', 'weather', 'emotions',
    'sports', 'hobbies', 'technology', 'transportation', 'culture', 'society',
    'business', 'science', 'art', 'literature', 'history', 'geography', 'uncategorized'
  ].includes(value);
};