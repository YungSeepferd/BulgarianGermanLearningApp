/**
 * Service Exports - Simple Module Exports
 *
 * This module provides direct singleton exports of services.
 * Replaces the previous DI container pattern for simplicity.
 */

import { ProgressService } from './progress';
import { LearningSession, learningSession } from '../state/session.svelte';
import { LessonGenerationEngine } from './lesson-generation/lesson-generator';
import { lessonTemplateRepository } from './lesson-generation/lesson-templates';
import { culturalGrammarService } from './lesson-generation/cultural-grammar';
import { templateRenderer } from './lesson-generation/template-renderer';
import { vocabularyRepository } from '../data/vocabulary-repository.svelte';

// Create singleton instances
export const progressService = new ProgressService();
export const learningSessionInstance = learningSession;
export const lessonGenerationEngine = new LessonGenerationEngine(
    lessonTemplateRepository,
    culturalGrammarService,
    templateRenderer
);

/**
 * Initialize the vocabulary repository (client only)
 */
export async function initializeVocabularyRepository(): Promise<void> {
    await vocabularyRepository.initialize();
}

/**
 * Get the ProgressService instance
 * @deprecated Direct import of progressService is preferred
 */
export function getProgressService(): ProgressService {
    return progressService;
}

/**
 * Get the LessonGenerationEngine instance
 * @deprecated Direct import of lessonGenerationEngine is preferred
 */
export function getLessonGenerationEngine(): LessonGenerationEngine {
    return lessonGenerationEngine;
}

/**
 * Get the LearningSession instance
 * @deprecated Direct import of learningSessionInstance is preferred
 */
export function getLearningSession(): LearningSession | null {
    return learningSessionInstance;
}