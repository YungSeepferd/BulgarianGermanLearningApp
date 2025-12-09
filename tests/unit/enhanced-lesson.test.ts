/**
 * Unit tests for EnhancedLessonService
 *
 * These tests verify the integration between EnhancedLessonService and LessonGenerationEngine,
 * ensuring that dynamic lessons are properly generated and converted to the standard Lesson format.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enhancedLessonService } from '../../src/lib/services/enhanced-lesson';
import { lessonGenerationEngine } from '../../src/lib/services/lesson-generation/lesson-generator';
import { lessonService } from '../../src/lib/services/lesson';
import type { GeneratedLesson, LessonGenerationParams } from '../../src/lib/services/lesson-generation/types';
import type { Lesson } from '../../src/lib/schemas/lesson';

// Mock the LessonGenerationEngine
vi.mock('../../src/lib/services/lesson-generation/lesson-generator', () => {
  return {
    lessonGenerationEngine: {
      generateLesson: vi.fn()
    }
  };
});

// Mock the LessonService class
vi.mock('../../src/lib/services/lesson', () => {
  // Create a mock LessonService class
  class MockLessonService {
    initialize = vi.fn().mockResolvedValue(undefined);
    isInitialized = vi.fn().mockReturnValue(true);
    validateLesson = vi.fn().mockImplementation(lesson => {
      // Return the lesson as-is for testing
      return lesson;
    });
    createFallbackLesson = vi.fn().mockReturnValue({
      id: 'fallback-lesson',
      title: 'Lesson Unavailable',
      description: 'This lesson could not be generated.',
      difficulty: 'A1',
      type: 'vocabulary',
      duration: 15,
      vocabulary: [],
      objectives: [],
      sections: [],
      isCompleted: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { tags: ['error'], prerequisites: [], relatedLessons: [] }
    });
    getLessons = vi.fn().mockReturnValue([]);
    getLessonById = vi.fn().mockReturnValue(undefined);
    addLesson = vi.fn();
    updateLesson = vi.fn();
    removeLesson = vi.fn();
    getLessonsByDifficulty = vi.fn().mockReturnValue([]);
    getLessonsByType = vi.fn().mockReturnValue([]);
    getLessonsByTag = vi.fn().mockReturnValue([]);
    getRandomLessons = vi.fn().mockReturnValue([]);
    generateLessonFromCriteria = vi.fn().mockResolvedValue({
      id: 'fallback-lesson',
      title: 'Lesson Unavailable',
      description: 'This lesson could not be generated.',
      difficulty: 'A1',
      type: 'vocabulary',
      duration: 15,
      vocabulary: [],
      objectives: [],
      sections: [],
      isCompleted: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { tags: ['error'], prerequisites: [], relatedLessons: [] }
    });
    generateLessonFromVocabulary = vi.fn().mockReturnValue({
      id: 'fallback-lesson',
      title: 'Lesson Unavailable',
      description: 'This lesson could not be generated.',
      difficulty: 'A1',
      type: 'vocabulary',
      duration: 15,
      vocabulary: [],
      objectives: [],
      sections: [],
      isCompleted: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { tags: ['error'], prerequisites: [], relatedLessons: [] }
    });
    getCategoryDisplayName = vi.fn().mockImplementation(category => category);
  }

  return {
    lessonService: new MockLessonService()
  };
});

describe('EnhancedLessonService', () => {
  const mockGeneratedLesson: GeneratedLesson = {
    id: 'generated-lesson-1',
    type: 'vocabulary',
    difficulty: 'A1',
    title: 'Thematic Lesson: Home',
    sections: [
      {
        id: 'section-1',
        title: 'Introduction',
        content: 'This is the introduction content.',
        type: 'introduction',
        metadata: { templateId: 'vocabulary-intro' }
      },
      {
        id: 'section-2',
        title: 'Practice',
        content: 'This is the practice content.',
        type: 'exercise',
        metadata: { templateId: 'vocabulary-practice' }
      }
    ],
    vocabulary: [
      {
        id: 'vocab-1',
        german: 'das Haus',
        bulgarian: 'къщата',
        partOfSpeech: 'noun',
        difficulty: 1,
        categories: ['house']
      }
    ],
    grammarConcepts: [],
    learningObjectives: [
      'Learn 1 new word related to Home',
      'Practice pronunciation and usage'
    ],
    metadata: {},
    createdAt: new Date('2025-12-09T10:00:00Z'),
    updatedAt: new Date('2025-12-09T10:00:00Z')
  };

  const mockGrammarLesson: GeneratedLesson = {
    id: 'generated-grammar-lesson-1',
    type: 'grammar',
    difficulty: 'A2',
    title: 'Grammar: Noun Genders',
    sections: [
      {
        id: 'section-1',
        title: 'Explanation',
        content: 'This explains noun genders in German.',
        type: 'grammar',
        metadata: { templateId: 'grammar-concept', conceptId: 'noun-gender' }
      },
      {
        id: 'section-2',
        title: 'Practice',
        content: 'Practice exercises for noun genders.',
        type: 'exercise',
        metadata: { templateId: 'grammar-practice' }
      }
    ],
    vocabulary: [
      {
        id: 'vocab-1',
        german: 'der Tisch',
        bulgarian: 'масата',
        partOfSpeech: 'noun',
        difficulty: 2,
        categories: ['house']
      },
      {
        id: 'vocab-2',
        german: 'die Lampe',
        bulgarian: 'лампите',
        partOfSpeech: 'noun',
        difficulty: 2,
        categories: ['house']
      }
    ],
    grammarConcepts: [
      {
        id: 'noun-gender',
        name: { german: 'Nomen Geschlecht', bulgarian: 'Род на съществителните' },
        description: 'German nouns have three genders: masculine, feminine, and neuter.',
        partOfSpeech: ['noun'],
        difficulty: 'A2',
        culturalContext: {
          bulgarian: 'Bulgarian has only masculine and feminine genders for nouns.',
          german: 'Deutsch hat drei Genera: maskulin, feminin und neutral.',
          crossLinguistic: 'While Bulgarian has only two genders, German has three. This affects articles, adjectives, and pronouns.'
        },
        examples: [
          {
            german: 'der Tisch (masculine)',
            bulgarian: 'масата (feminine)',
            explanation: 'The table is masculine in German but feminine in Bulgarian.'
          }
        ]
      }
    ],
    learningObjectives: [
      'Understand the concept of noun genders in German',
      'Compare noun genders between German and Bulgarian',
      'Apply the correct articles in context'
    ],
    metadata: {},
    createdAt: new Date('2025-12-09T10:00:00Z'),
    updatedAt: new Date('2025-12-09T10:00:00Z')
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock the LessonGenerationEngine to return our test data
    vi.mocked(lessonGenerationEngine.generateLesson).mockImplementation(async (params: LessonGenerationParams) => {
      if (params.type === 'grammar') {
        return mockGrammarLesson;
      } else if (params.type === 'mixed') {
        return {
          ...mockGeneratedLesson,
          type: 'mixed',
          title: 'Mixed Lesson: Home and Grammar',
          sections: [
            {
              id: 'section-1',
              title: 'Main Content',
              content: 'Mixed content with vocabulary and grammar',
              type: 'mixed',
              metadata: { templateId: 'mixed-lesson' }
            }
          ],
          grammarConcepts: [
            {
              id: 'basic-grammar',
              name: { german: 'Grundgrammatik', bulgarian: 'Основна граматика' },
              description: 'Basic grammar concepts',
              partOfSpeech: [],
              difficulty: 'A1'
            }
          ]
        };
      } else {
        return mockGeneratedLesson;
      }
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await enhancedLessonService.initialize();
      expect(enhancedLessonService.isInitialized()).toBe(true);
    });
  });

  describe('generateDynamicLesson', () => {
    it('should generate a dynamic lesson successfully', async () => {
      const params: LessonGenerationParams = {
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: {
          categories: ['home']
        }
      };

      const result = await enhancedLessonService.generateDynamicLesson(params);

      // Verify the result is in the correct format
      expect(result).toBeDefined();
      expect(result.id).toBe('generated-lesson-1');
      expect(result.title).toBe('Thematic Lesson: Home');
      expect(result.difficulty).toBe('A1');
      expect(result.type).toBe('vocabulary');
      expect(result.vocabulary).toHaveLength(1);
      expect(result.sections).toHaveLength(2);
      expect(result.objectives).toHaveLength(2);

      // Verify sections are properly converted
      expect(result.sections[0].title).toBe('Introduction');
      expect(result.sections[0].content).toBe('This is the introduction content.');
      expect(result.sections[0].type).toBe('introduction');

      expect(result.sections[1].title).toBe('Practice');
      expect(result.sections[1].content).toBe('This is the practice content.');
      expect(result.sections[1].type).toBe('exercise');

      // Verify vocabulary is properly converted
      expect(result.vocabulary[0].german).toBe('das Haus');
      expect(result.vocabulary[0].bulgarian).toBe('къщата');

      // Verify learning objectives
      expect(result.objectives[0].description).toBe('Learn 1 new word related to Home');
      expect(result.objectives[1].description).toBe('Practice pronunciation and usage');
    });

    it('should handle generation errors gracefully', async () => {
      // Mock a failure in the generation engine
      vi.mocked(lessonGenerationEngine.generateLesson).mockRejectedValue(new Error('Generation failed'));

      const params: LessonGenerationParams = {
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: {
          categories: ['home']
        }
      };

      const result = await enhancedLessonService.generateDynamicLesson(params);

      // Should return a fallback lesson
      expect(result.title).toBe('Lesson Unavailable');
      expect(result.description).toContain('Dynamic lesson generation failed');
    });

    it('should validate parameters and use defaults for invalid input', async () => {
      const params: any = {
        type: 'invalid-type',
        difficulty: 'invalid-difficulty',
        criteria: {}
      };

      const result = await enhancedLessonService.generateDynamicLesson(params);

      // Should use default values
      expect(result).toBeDefined();
      expect(result.type).toBe('vocabulary'); // Default type
      expect(result.difficulty).toBe('A1'); // Default difficulty
    });
  });

  describe('generateThematicLesson', () => {
    it('should generate a thematic vocabulary lesson', async () => {
      const result = await enhancedLessonService.generateThematicLesson(['home'], 'A1');

      expect(result).toBeDefined();
      expect(result.title).toBe('Thematic Lesson: Home');
      expect(result.type).toBe('vocabulary');
      expect(result.difficulty).toBe('A1');
      expect(result.sections).toHaveLength(2);
    });

    it('should include practice section by default', async () => {
      const result = await enhancedLessonService.generateThematicLesson(['home'], 'A1');

      const practiceSection = result.sections.find(s => s.title === 'Practice');
      expect(practiceSection).toBeDefined();
    });

    it('should include review section when requested', async () => {
      // Mock to return a lesson with review section
      vi.mocked(lessonGenerationEngine.generateLesson).mockResolvedValue({
        ...mockGeneratedLesson,
        sections: [
          ...mockGeneratedLesson.sections,
          {
            id: 'section-3',
            title: 'Review',
            content: 'Review content',
            type: 'summary',
            metadata: { templateId: 'vocabulary-review' }
          }
        ]
      });

      const result = await enhancedLessonService.generateThematicLesson(['home'], 'A1', {
        includeReview: true
      });

      const reviewSection = result.sections.find(s => s.title === 'Review');
      expect(reviewSection).toBeDefined();
      expect(result.sections).toHaveLength(3);
    });
  });

  describe('generateGrammarLesson', () => {
    it('should generate a grammar lesson with cultural context', async () => {
      const result = await enhancedLessonService.generateGrammarLesson('noun-gender', 'A2');

      expect(result).toBeDefined();
      expect(result.title).toBe('Grammar: Noun Genders');
      expect(result.type).toBe('grammar');
      expect(result.difficulty).toBe('A2');
      expect(result.sections).toHaveLength(2);

      // Verify grammar concept is included in the lesson
      expect(result.metadata.tags).toContain('Nomen Geschlecht');

      // Verify sections are properly typed (preserving original section types)
      expect(result.sections[0].type).toBe('grammar');
      expect(result.sections[1].type).toBe('exercise'); // exercise section
    });

    it('should include comparison section when requested', async () => {
      // Mock to return a lesson with comparison section
      vi.mocked(lessonGenerationEngine.generateLesson).mockResolvedValue({
        ...mockGrammarLesson,
        sections: [
          ...mockGrammarLesson.sections,
          {
            id: 'section-3',
            title: 'Comparison',
            content: 'Cultural comparison content',
            type: 'cultural',
            metadata: { templateId: 'grammar-comparison' }
          }
        ]
      });

      const result = await enhancedLessonService.generateGrammarLesson('noun-gender', 'A2', {
        includeComparison: true
      });

      const comparisonSection = result.sections.find(s => s.title === 'Comparison');
      expect(comparisonSection).toBeDefined();
      expect(comparisonSection?.type).toBe('cultural');
      expect(result.sections).toHaveLength(3);
    });
  });

  describe('generateMixedLesson', () => {
    it('should generate a mixed lesson combining vocabulary and grammar', async () => {
      // Mock to return a mixed lesson
      vi.mocked(lessonGenerationEngine.generateLesson).mockResolvedValue({
        ...mockGeneratedLesson,
        type: 'mixed',
        title: 'Mixed Lesson: Home and Grammar',
        sections: [
          {
            id: 'section-1',
            title: 'Main Content',
            content: 'Mixed content with vocabulary and grammar',
            type: 'mixed',
            metadata: { templateId: 'mixed-lesson' }
          }
        ],
        grammarConcepts: [
          {
            id: 'basic-grammar',
            name: { german: 'Grundgrammatik', bulgarian: 'Основна граматика' },
            description: 'Basic grammar concepts',
            partOfSpeech: [],
            difficulty: 'A1'
          }
        ]
      });

      const result = await enhancedLessonService.generateMixedLesson('home', 'A1');

      expect(result).toBeDefined();
      expect(result.title).toContain('Home and Grammar');
      expect(result.type).toBe('mixed');
      expect(result.sections[0].type).toBe('mixed');
      expect(result.metadata.tags).toContain('Grundgrammatik');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with existing LessonService methods', async () => {
      // Test proxy methods
      const lessons = enhancedLessonService.getLessons();
      expect(lessons).toEqual([]);

      const lesson = enhancedLessonService.getLessonById('test-id');
      expect(lesson).toBeUndefined();

      // Mock the lessonService to return a proper fallback lesson
      vi.mocked(lessonService.generateLessonFromVocabulary).mockReturnValueOnce({
        id: 'fallback-lesson',
        title: 'Lesson Unavailable',
        description: 'This lesson could not be generated.',
        difficulty: 'A1',
        type: 'vocabulary',
        duration: 15,
        vocabulary: [],
        objectives: [],
        sections: [],
        isCompleted: false,
        completionPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: { tags: ['error'], prerequisites: [], relatedLessons: [] }
      });

      const fallbackLesson = enhancedLessonService.generateLessonFromVocabulary([]);
      expect(fallbackLesson.title).toBe('Lesson Unavailable');
    });

    it('should proxy generateLessonFromCriteria to maintain compatibility', async () => {
      // This should use the existing LessonService, not the dynamic generation
      const result = await enhancedLessonService.generateLessonFromCriteria({
        difficulty: 'A1',
        categories: ['home']
      });

      expect(result.title).toBe('Lesson Unavailable'); // From fallback
    });
  });

  describe('Lesson Conversion', () => {
    it('should properly convert GeneratedLesson to Lesson format', async () => {
      const result = await enhancedLessonService.generateDynamicLesson({
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: {
          categories: ['home']
        }
      });

      // Verify all required fields are present
      expect(result.id).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.difficulty).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.duration).toBeDefined();
      expect(result.vocabulary).toBeDefined();
      expect(result.objectives).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.isCompleted).toBe(false);
      expect(result.completionPercentage).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.metadata).toBeDefined();
    });

    it('should calculate duration based on number of sections', async () => {
      const result = await enhancedLessonService.generateDynamicLesson({
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: {
          categories: ['home']
        }
      });

      // Should be 2 sections * 5 minutes + 5 minutes buffer = 15 minutes
      expect(result.duration).toBe(15);
    });

    it('should generate appropriate tags for the lesson', async () => {
      const result = await enhancedLessonService.generateGrammarLesson('noun-gender', 'A2');

      expect(result.metadata.tags).toContain('grammar');
      expect(result.metadata.tags).toContain('A2');
      expect(result.metadata.tags).toContain('Nomen Geschlecht');
      expect(result.metadata.tags).toContain('house');
    });

    it('should generate a meaningful description', async () => {
      const result = await enhancedLessonService.generateGrammarLesson('noun-gender', 'A2');

      expect(result.description).toContain('This elementary level lesson focuses on grammar concepts');
      expect(result.description).toContain('Nomen Geschlecht');
    });
  });
});