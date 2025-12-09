/**
 * Integration tests for EnhancedLessonService
 *
 * These tests verify the complete end-to-end functionality of the dynamic lesson generation system,
 * including integration with the LessonGenerationEngine, template rendering, and data services.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { enhancedLessonService } from '../../src/lib/services/enhanced-lesson';
import { lessonGenerationEngine } from '../../src/lib/services/lesson-generation/lesson-generator';
import { lessonTemplateRepository } from '../../src/lib/services/lesson-generation/lesson-templates';
import { culturalGrammarService } from '../../src/lib/services/lesson-generation/cultural-grammar';
import { templateRenderer } from '../../src/lib/services/lesson-generation/template-renderer';
import { db } from '../../src/lib/data/db.svelte';
import type { Lesson, LessonDifficulty, LessonType } from '../../src/lib/schemas/lesson';
import type { VocabularyCategory, PartOfSpeech } from '../../src/lib/schemas/vocabulary';

describe('EnhancedLessonService Integration Tests', () => {
  beforeEach(async () => {
    // Initialize all services
    await enhancedLessonService.initialize();
    await db.initialize();
  });

  afterEach(() => {
    // Clean up
  });

  describe('End-to-End Lesson Generation', () => {
    it('should generate a complete vocabulary lesson from parameters to final format', async () => {
      // Test the complete flow from parameters to final Lesson format
      const params = {
        type: 'vocabulary' as LessonType,
        difficulty: 'A1' as LessonDifficulty,
        criteria: {
          categories: ['food'] as VocabularyCategory[],
          limit: 5
        },
        metadata: {
          includePractice: true,
          includeReview: false
        }
      };

      // Generate the lesson
      const lesson = await enhancedLessonService.generateDynamicLesson(params);

      // Verify the lesson structure
      expect(lesson).toBeDefined();
      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(lesson.description).toBeDefined();
      expect(lesson.difficulty).toBe('A1');
      expect(lesson.type).toBe('vocabulary');
      expect(lesson.duration).toBeGreaterThan(0);
      expect(lesson.vocabulary).toBeDefined();
      expect(lesson.objectives).toBeDefined();
      expect(lesson.sections).toBeDefined();
      expect(lesson.metadata).toBeDefined();

      // Verify sections have proper structure
      expect(lesson.sections.length).toBeGreaterThan(0);
      lesson.sections.forEach(section => {
        expect(section.id).toBeDefined();
        expect(section.title).toBeDefined();
        expect(section.content).toBeDefined();
        expect(section.type).toBeDefined();
      });

      // Verify vocabulary items
      if (lesson.vocabulary.length > 0) {
        lesson.vocabulary.forEach(vocab => {
          expect(vocab.german).toBeDefined();
          expect(vocab.bulgarian).toBeDefined();
        });
      }

      // Verify learning objectives
      expect(lesson.objectives.length).toBeGreaterThan(0);
      lesson.objectives.forEach(objective => {
        expect(objective.id).toBeDefined();
        expect(objective.description).toBeDefined();
        expect(objective.isCompleted).toBe(false);
      });

      // Verify tags
      expect(lesson.metadata.tags).toContain('vocabulary');
      expect(lesson.metadata.tags).toContain('A1');
    });

    it('should generate a complete grammar lesson with cultural context', async () => {
      // Test grammar lesson generation with cultural context
      const params = {
        type: 'grammar' as LessonType,
        difficulty: 'A2' as LessonDifficulty,
        criteria: {
          conceptType: 'noun_gender',
          limit: 3
        },
        metadata: {
          includePractice: true,
          includeComparison: true
        }
      };

      // Generate the lesson
      const lesson = await enhancedLessonService.generateGrammarLesson('noun_gender', 'A2', {
        includePractice: true,
        includeComparison: true
      });

      // Verify the lesson structure
      expect(lesson).toBeDefined();
      expect(lesson.type).toBe('grammar');
      expect(lesson.difficulty).toBe('A2');
      expect(lesson.sections.length).toBeGreaterThan(0);

      // Verify cultural context is included
      const culturalSection = lesson.sections.find(s => s.type === 'cultural');
      if (culturalSection) {
        expect(culturalSection.content).toContain('Bulgarian');
        expect(culturalSection.content).toContain('German');
      }

      // Verify tags include grammar concepts
      expect(lesson.metadata.tags).toContain('grammar');
      expect(lesson.metadata.tags).toContain('A2');
    });

    it('should generate a mixed lesson combining vocabulary and grammar', async () => {
      // Test mixed lesson generation
      const lesson = await enhancedLessonService.generateMixedLesson('family', 'B1', {
        includePractice: true,
        includeReview: true
      });

      // Verify the lesson structure
      expect(lesson).toBeDefined();
      expect(lesson.type).toBe('mixed');
      expect(lesson.difficulty).toBe('B1');
      expect(lesson.sections.length).toBeGreaterThan(0);

      // Verify both vocabulary and grammar content
      const hasVocabulary = lesson.vocabulary.length > 0;
      const hasGrammar = lesson.metadata.tags.some(tag =>
        tag.includes('grammar') || tag.includes('Grammatik') || tag.includes('Граматика')
      );

      expect(hasVocabulary || hasGrammar).toBe(true);
    });

    it('should handle fallback gracefully when generation fails', async () => {
      // Test error handling with fallback
      const originalGenerate = lessonGenerationEngine.generateLesson;
      try {
        // Mock a failure in the generation engine
        vi.spyOn(lessonGenerationEngine, 'generateLesson').mockRejectedValue(new Error('Generation failed'));

        const params = {
          type: 'vocabulary' as LessonType,
          difficulty: 'A1' as LessonDifficulty,
          criteria: {
            categories: ['nonexistent_category'] as VocabularyCategory[]
          }
        };

        const lesson = await enhancedLessonService.generateDynamicLesson(params);

        // Should return a fallback lesson
        expect(lesson.title).toContain('Unavailable');
        expect(lesson.description).toContain('failed');
        expect(lesson.metadata.fallback).toBe(true);
      } finally {
        // Restore original function
        vi.spyOn(lessonGenerationEngine, 'generateLesson').mockImplementation(originalGenerate);
      }
    });
  });

  describe('Service Integration', () => {
    it('should integrate with LessonTemplateRepository for template selection', async () => {
      // Verify template repository integration
      const getTemplateSpy = vi.spyOn(lessonTemplateRepository, 'getTemplate');

      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Should have called the template repository
      expect(getTemplateSpy).toHaveBeenCalled();
      expect(lesson.sections.length).toBeGreaterThan(0);
    });

    it('should integrate with CulturalGrammarService for grammar data', async () => {
      // Verify cultural grammar service integration
      const querySpy = vi.spyOn(culturalGrammarService, 'query');

      const lesson = await enhancedLessonService.generateGrammarLesson('noun_gender', 'A2');

      // Should have called the cultural grammar service
      expect(querySpy).toHaveBeenCalled();
      expect(lesson.sections.length).toBeGreaterThan(0);
    });

    it('should integrate with TemplateRenderer for content generation', async () => {
      // Verify template renderer integration
      const renderSpy = vi.spyOn(templateRenderer, 'render');

      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Should have called the template renderer
      expect(renderSpy).toHaveBeenCalled();
      expect(lesson.sections[0].content).toBeDefined();
    });

    it('should integrate with VocabularyDatabase for vocabulary data', async () => {
      // Verify vocabulary database integration
      const getVocabularySpy = vi.spyOn(db, 'getVocabularyByCategory');

      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Should have called the vocabulary database
      expect(getVocabularySpy).toHaveBeenCalledWith('food');
      expect(lesson.vocabulary).toBeDefined();
    });
  });

  describe('Parameter Validation and Defaults', () => {
    it('should use default values for invalid parameters', async () => {
      // Test parameter validation with invalid inputs
      const params = {
        type: 'invalid_type' as any,
        difficulty: 'invalid_difficulty' as any,
        criteria: {}
      };

      const lesson = await enhancedLessonService.generateDynamicLesson(params);

      // Should use default values
      expect(lesson.type).toBe('vocabulary');
      expect(lesson.difficulty).toBe('A1');
    });

    it('should handle empty criteria gracefully', async () => {
      // Test with empty criteria
      const params = {
        type: 'vocabulary' as LessonType,
        difficulty: 'A1' as LessonDifficulty,
        criteria: {}
      };

      const lesson = await enhancedLessonService.generateDynamicLesson(params);

      // Should generate a valid lesson
      expect(lesson).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(lesson.sections.length).toBeGreaterThan(0);
    });

    it('should respect custom title and description when provided', async () => {
      // Test custom title and description
      const customTitle = 'My Custom Lesson';
      const customDescription = 'This is a custom lesson description';

      const params = {
        type: 'vocabulary' as LessonType,
        difficulty: 'A1' as LessonDifficulty,
        criteria: {
          categories: ['food']
        },
        metadata: {
          customTitle,
          customDescription
        }
      };

      const lesson = await enhancedLessonService.generateDynamicLesson(params);

      // Should use the custom title and description
      expect(lesson.title).toBe(customTitle);
      expect(lesson.description).toBe(customDescription);
    });
  });

  describe('Lesson Format Conversion', () => {
    it('should properly convert GeneratedLesson to Lesson format with section type preservation', async () => {
      // Test section type preservation
      const lesson = await enhancedLessonService.generateGrammarLesson('noun_gender', 'A2');

      // Verify section types are preserved from the original generated lesson
      const hasGrammarSection = lesson.sections.some(s => s.type === 'grammar');
      const hasExerciseSection = lesson.sections.some(s => s.type === 'exercise');
      const hasCulturalSection = lesson.sections.some(s => s.type === 'cultural');

      // Should preserve original section types
      expect(hasGrammarSection || hasExerciseSection || hasCulturalSection).toBe(true);
    });

    it('should calculate duration based on number of sections', async () => {
      // Test duration calculation
      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Should calculate duration as 5 minutes per section + 5 minutes buffer
      const expectedDuration = lesson.sections.length * 5 + 5;
      expect(lesson.duration).toBe(expectedDuration);
    });

    it('should generate comprehensive tags including categories and concepts', async () => {
      // Test tag generation
      const lesson = await enhancedLessonService.generateThematicLesson(['food', 'family'], 'B1');

      // Should include comprehensive tags
      expect(lesson.metadata.tags).toContain('vocabulary');
      expect(lesson.metadata.tags).toContain('B1');

      // Should include vocabulary categories
      const hasFoodTag = lesson.metadata.tags.some(tag => tag.toLowerCase().includes('food'));
      const hasFamilyTag = lesson.metadata.tags.some(tag => tag.toLowerCase().includes('family'));

      expect(hasFoodTag || hasFamilyTag).toBe(true);
    });

    it('should generate meaningful descriptions based on lesson content', async () => {
      // Test description generation
      const lesson = await enhancedLessonService.generateGrammarLesson('verb_conjugation', 'B2');

      // Should generate a meaningful description
      expect(lesson.description).toContain('upper intermediate');
      expect(lesson.description).toContain('grammar concepts');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing LessonService API', async () => {
      // Test backward compatibility
      const lessons = enhancedLessonService.getLessons();
      expect(Array.isArray(lessons)).toBe(true);

      const lessonById = enhancedLessonService.getLessonById('test-id');
      expect(lessonById).toBeUndefined();

      const lessonsByDifficulty = enhancedLessonService.getLessonsByDifficulty('A1');
      expect(Array.isArray(lessonsByDifficulty)).toBe(true);

      const lessonsByType = enhancedLessonService.getLessonsByType('vocabulary');
      expect(Array.isArray(lessonsByType)).toBe(true);
    });

    it('should proxy existing methods while adding new functionality', async () => {
      // Test that proxy methods work while new methods are available
      const dynamicLesson = await enhancedLessonService.generateDynamicLesson({
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: { categories: ['food'] }
      });

      expect(dynamicLesson).toBeDefined();

      // Proxy methods should still work
      const randomLessons = enhancedLessonService.getRandomLessons(3);
      expect(Array.isArray(randomLessons)).toBe(true);
    });
  });
});