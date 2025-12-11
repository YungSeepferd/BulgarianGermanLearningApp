/**
 * End-to-End Integration tests for the complete lesson generation flow
 *
 * These tests verify the complete user journey from parameter selection to lesson display,
 * including the integration between UI components, services, and data layers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enhancedLessonService } from '../../src/lib/services/enhanced-lesson';
import { vocabularyDb as db } from '../../src/lib/data/db.svelte.ts';
import type { Lesson, LessonDifficulty, LessonType } from '../../src/lib/schemas/lesson';
import type { VocabularyCategory, PartOfSpeech } from '../../src/lib/schemas/vocabulary';

// Mock the UI components to test the complete flow
vi.mock('$lib/components/LessonGenerator.svelte', () => {
  return {
    default: {
      generateLesson: vi.fn()
    }
  };
});

vi.mock('$lib/components/GeneratedLesson.svelte', () => {
  return {
    default: {
      displayLesson: vi.fn()
    }
  };
});

describe('End-to-End Lesson Generation Flow', () => {
  beforeEach(async () => {
    // Initialize services
    await enhancedLessonService.initialize();
    await db.initialize();
  });

  afterEach(() => {
    // Clean up
    vi.resetAllMocks();
  });

  describe('Complete User Journey', () => {
    it('should complete the full flow: parameter selection → generation → display', async () => {
      // Simulate user parameter selection
      const userParams = {
        title: 'My Custom Food Lesson',
        description: 'A lesson about food vocabulary and related grammar',
        type: 'mixed' as LessonType,
        difficulty: 'A2' as LessonDifficulty,
        category: 'food' as VocabularyCategory,
        partOfSpeech: 'noun' as PartOfSpeech,
        limit: 8,
        includePractice: true,
        includeComparison: true,
        includeReview: false
      };

      // Generate the lesson using the enhanced service
      const lesson = await enhancedLessonService.generateMixedLesson(
        userParams.category,
        userParams.difficulty,
        {
          includePractice: userParams.includePractice,
          includeReview: userParams.includeReview
        }
      );

      // Apply custom title and description
      lesson.title = userParams.title;
      lesson.description = userParams.description;

      // Verify the generated lesson
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe(userParams.title);
      expect(lesson.description).toBe(userParams.description);
      expect(lesson.type).toBe('mixed');
      expect(lesson.difficulty).toBe('A2');
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
      expect(lesson.objectives.length).toBeGreaterThan(0);

      // Verify the lesson can be displayed (simulate UI component)
      expect(lesson.sections.every(s => s.content)).toBe(true);
      expect(lesson.vocabulary.every(v => v.german && v.bulgarian)).toBe(true);
    });

    it('should handle the complete vocabulary lesson flow', async () => {
      // Test vocabulary lesson flow
      const lesson = await enhancedLessonService.generateThematicLesson(['food', 'family'], 'A1', {
        includePractice: true,
        includeReview: true
      });

      // Verify the lesson structure
      expect(lesson.type).toBe('vocabulary');
      expect(lesson.difficulty).toBe('A1');
      expect(lesson.sections.length).toBeGreaterThan(1); // Should have multiple sections

      // Verify vocabulary content
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
      lesson.vocabulary.forEach(vocab => {
        expect(vocab.german).toBeDefined();
        expect(vocab.bulgarian).toBeDefined();
        expect(vocab.categories).toContain('food');
      });

      // Verify sections include practice and review
      const practiceSection = lesson.sections.find(s => s.title.toLowerCase().includes('practice'));
      const reviewSection = lesson.sections.find(s => s.title.toLowerCase().includes('review'));

      expect(practiceSection).toBeDefined();
      expect(reviewSection).toBeDefined();
    });

    it('should handle the complete grammar lesson flow with cultural context', async () => {
      // Test grammar lesson flow
      const lesson = await enhancedLessonService.generateGrammarLesson('noun_gender', 'B1', {
        includePractice: true,
        includeComparison: true
      });

      // Verify the lesson structure
      expect(lesson.type).toBe('grammar');
      expect(lesson.difficulty).toBe('B1');
      expect(lesson.sections.length).toBeGreaterThan(1);

      // Verify grammar content
      const grammarSection = lesson.sections.find(s => s.type === 'grammar');
      const culturalSection = lesson.sections.find(s => s.type === 'cultural');

      expect(grammarSection).toBeDefined();
      expect(culturalSection).toBeDefined();

      // Verify cultural context is included
      if (culturalSection) {
        expect(culturalSection.content).toContain('Bulgarian');
        expect(culturalSection.content).toContain('German');
      }
    });

    it('should handle error cases gracefully throughout the flow', async () => {
      // Test error handling at different stages

      // 1. Test with invalid parameters
      const invalidParams = {
        type: 'invalid_type' as any,
        difficulty: 'invalid_difficulty' as any,
        criteria: {}
      };

      const lesson1 = await enhancedLessonService.generateDynamicLesson(invalidParams);
      expect(lesson1.type).toBe('vocabulary'); // Should use default
      expect(lesson1.difficulty).toBe('A1'); // Should use default

      // 2. Test with empty vocabulary database
      const originalGetVocabulary = db.getVocabularyByCategory;
      try {
        vi.spyOn(db, 'getVocabularyByCategory').mockReturnValue([]);

        const lesson2 = await enhancedLessonService.generateThematicLesson(['nonexistent_category'], 'A1');
        expect(lesson2).toBeDefined();
        expect(lesson2.metadata.fallback).toBe(true);
      } finally {
        vi.spyOn(db, 'getVocabularyByCategory').mockImplementation(originalGetVocabulary);
      }

      // 3. Test with failed template rendering
      const originalRender = templateRenderer.render;
      try {
        vi.spyOn(templateRenderer, 'render').mockImplementation(() => {
          throw new Error('Template rendering failed');
        });

        const lesson3 = await enhancedLessonService.generateThematicLesson(['food'], 'A1');
        expect(lesson3).toBeDefined();
        expect(lesson3.metadata.fallback).toBe(true);
      } finally {
        vi.spyOn(templateRenderer, 'render').mockImplementation(originalRender);
      }
    });
  });

  describe('UI Integration Flow', () => {
    it('should integrate with LessonGenerator component for parameter collection', async () => {
      // Simulate LessonGenerator component behavior
      const userParams = {
        type: 'vocabulary' as LessonType,
        difficulty: 'A1' as LessonDifficulty,
        category: 'food' as VocabularyCategory,
        limit: 10,
        includePractice: true
      };

      // Call the service directly (simulating what the LessonGenerator would do)
      const lesson = await enhancedLessonService.generateThematicLesson(
        [userParams.category],
        userParams.difficulty,
        { includePractice: userParams.includePractice }
      );

      // Verify the lesson was generated successfully
      expect(lesson).toBeDefined();
      expect(lesson.type).toBe(userParams.type);
      expect(lesson.difficulty).toBe(userParams.difficulty);
    });

    it('should integrate with GeneratedLesson component for display', async () => {
      // Generate a lesson
      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Verify the lesson can be displayed by the GeneratedLesson component
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
      expect(lesson.objectives.length).toBeGreaterThan(0);

      // Verify all sections have content
      lesson.sections.forEach(section => {
        expect(section.content).toBeDefined();
        expect(section.content.length).toBeGreaterThan(0);
      });

      // Verify vocabulary items are complete
      lesson.vocabulary.forEach(vocab => {
        expect(vocab.german).toBeDefined();
        expect(vocab.bulgarian).toBeDefined();
      });
    });

    it('should maintain data consistency throughout the flow', async () => {
      // Test data consistency from generation to display
      const lesson = await enhancedLessonService.generateMixedLesson('family', 'B1');

      // Verify data consistency
      expect(lesson.title).toBeDefined();
      expect(lesson.description).toBeDefined();
      expect(lesson.difficulty).toBe('B1');
      expect(lesson.type).toBe('mixed');

      // Verify sections have consistent IDs and types
      const sectionIds = new Set();
      lesson.sections.forEach(section => {
        expect(section.id).toBeDefined();
        expect(sectionIds.has(section.id)).toBe(false); // No duplicate IDs
        sectionIds.add(section.id);
        expect(section.type).toBeDefined();
      });

      // Verify vocabulary items have consistent structure
      lesson.vocabulary.forEach(vocab => {
        expect(vocab.id).toBeDefined();
        expect(vocab.german).toBeDefined();
        expect(vocab.bulgarian).toBeDefined();
      });

      // Verify objectives have consistent structure
      lesson.objectives.forEach(objective => {
        expect(objective.id).toBeDefined();
        expect(objective.description).toBeDefined();
        expect(objective.isCompleted).toBe(false);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('should generate lessons within acceptable time limits', async () => {
      // Test performance of lesson generation
      const startTime = Date.now();

      const lesson = await enhancedLessonService.generateThematicLesson(['food', 'family'], 'A1', {
        includePractice: true,
        includeReview: true
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds (adjust based on actual performance)
      expect(duration).toBeLessThan(2000);
      expect(lesson).toBeDefined();
    });

    it('should handle multiple concurrent lesson generations', async () => {
      // Test concurrent generation
      const promises = [
        enhancedLessonService.generateThematicLesson(['food'], 'A1'),
        enhancedLessonService.generateGrammarLesson('noun_gender', 'A2'),
        enhancedLessonService.generateMixedLesson('family', 'B1')
      ];

      const results = await Promise.all(promises);

      // All lessons should be generated successfully
      results.forEach(lesson => {
        expect(lesson).toBeDefined();
        expect(lesson.sections.length).toBeGreaterThan(0);
      });
    });

    it('should scale with increasing vocabulary items', async () => {
      // Test scalability with different vocabulary sizes
      const smallLesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1', { includePractice: false });
      const mediumLesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1', { includePractice: true });
      const largeLesson = await enhancedLessonService.generateThematicLesson(['food', 'family'], 'A1', { includePractice: true, includeReview: true });

      // Verify increasing complexity
      expect(smallLesson.sections.length).toBeLessThanOrEqual(mediumLesson.sections.length);
      expect(mediumLesson.sections.length).toBeLessThanOrEqual(largeLesson.sections.length);

      expect(smallLesson.vocabulary.length).toBeLessThanOrEqual(mediumLesson.vocabulary.length);
      expect(mediumLesson.vocabulary.length).toBeLessThanOrEqual(largeLesson.vocabulary.length);
    });
  });

  describe('Accessibility and Compliance', () => {
    it('should generate lessons with accessible content', async () => {
      // Test accessibility compliance
      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Verify content is accessible
      lesson.sections.forEach(section => {
        expect(section.content).not.toContain('<'); // Should not contain unescaped HTML
        expect(section.content).not.toContain('<script>'); // Should not contain scripts
      });

      // Verify vocabulary has proper structure for screen readers
      lesson.vocabulary.forEach(vocab => {
        expect(vocab.german).toMatch(/^[a-zA-ZäöüßÄÖÜ]+$/); // Basic validation
        expect(vocab.bulgarian).toBeDefined();
      });
    });

    it('should generate lessons with proper metadata for accessibility', async () => {
      // Test accessibility metadata
      const lesson = await enhancedLessonService.generateGrammarLesson('verb_conjugation', 'B1');

      // Verify metadata includes accessibility information
      expect(lesson.metadata).toBeDefined();
      expect(lesson.metadata.tags).toBeDefined();
      expect(lesson.metadata.tags.length).toBeGreaterThan(0);

      // Verify difficulty is properly indicated
      expect(lesson.difficulty).toMatch(/^(A1|A2|B1|B2|C1)$/);
    });

    it('should handle special characters and diacritics properly', async () => {
      // Test handling of special characters
      const lesson = await enhancedLessonService.generateThematicLesson(['food'], 'A1');

      // Verify special characters are handled properly
      const hasSpecialChars = lesson.vocabulary.some(vocab =>
        vocab.german.includes('ä') || vocab.german.includes('ö') || vocab.german.includes('ü') ||
        vocab.bulgarian.includes('ъ') || vocab.bulgarian.includes('ь') || vocab.bulgarian.includes('я')
      );

      if (hasSpecialChars) {
        // If there are special characters, verify they're rendered properly
        lesson.vocabulary.forEach(vocab => {
          expect(vocab.german).toMatch(/^[a-zA-ZäöüßÄÖÜ\s\-]+$/);
          expect(vocab.bulgarian).toMatch(/^[а-яА-Яъьѝѣѫѭ\s\-]+$/);
        });
      }
    });
  });
});