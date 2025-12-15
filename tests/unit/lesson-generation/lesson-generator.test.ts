/**
 * Unit tests for LessonGenerationEngine
 *
 * This file tests the core lesson generation logic, including:
 * - Thematic vocabulary lesson generation
 * - Grammar lesson generation
 * - Contextual/Mixed lesson generation
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessonGenerationEngine } from '$lib/services/lesson-generation/lesson-generator';
import type {
  ILessonTemplateRepository,
  ICulturalGrammarService,
  ITemplateRenderer,
  LessonTemplate,
  CulturalGrammarConcept,
  TemplateRenderingContext,
  LessonGenerationParams
} from '$lib/services/lesson-generation/types';
import type { VocabularyService } from '$lib/data/vocabulary';
import type { VocabularyItem } from '$lib/types/vocabulary';
import * as loader from '$lib/data/loader';

// Mock loader
vi.mock('$lib/data/loader', () => ({
  loadVocabulary: vi.fn(),
  loadVocabularyByCategory: vi.fn(),
  loadVocabularyBySearch: vi.fn(),
  getRandomVocabulary: vi.fn()
}));

// Mocks
const mockTemplateRepository = {
  getTemplate: vi.fn(),
  getTemplateById: vi.fn(),
  getAllTemplates: vi.fn(),
  validateTemplate: vi.fn()
} as unknown as ILessonTemplateRepository;

const mockGrammarService = {
  query: vi.fn(),
  getAllConcepts: vi.fn(),
  conceptAppliesToPartOfSpeech: vi.fn()
} as unknown as ICulturalGrammarService;

const mockRenderer = {
  render: vi.fn(),
  validateTemplate: vi.fn(),
  validateData: vi.fn()
} as unknown as ITemplateRenderer;

// Mock Data
const mockTemplate: LessonTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'Test Description',
  type: 'vocabulary',
  difficultyRange: ['A1', 'A2'],
  template: 'Rendered Content',
  variables: []
};

const mockVocabularyItem: VocabularyItem = {
  id: 'vocab-1',
  german: 'Haus',
  bulgarian: 'Къща',
  partOfSpeech: 'noun',
  difficulty: 1,
  categories: ['home'],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockGrammarConcept: CulturalGrammarConcept = {
  id: 'grammar-1',
  name: { bulgarian: 'Concept', german: 'Konzept' },
  description: { bulgarian: 'Desc', german: 'Desc' },
  difficulty: 'A1',
  partOfSpeech: ['noun'],
  culturalContext: {
    bulgarianPerspective: 'BG',
    germanPerspective: 'DE',
    crossLinguisticExplanation: { bgToDe: '', deToBg: '' }
  },
  examples: [],
  commonMistakes: { bgToDe: [], deToBg: [] },
  relatedConcepts: [],
  metadata: {}
};

describe('LessonGenerationEngine', () => {
  let engine: LessonGenerationEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for loadVocabulary to prevent undefined errors
    vi.mocked(loader.loadVocabulary).mockResolvedValue({ items: [mockVocabularyItem] } as any);
    
    engine = new LessonGenerationEngine(
      mockTemplateRepository,
      mockGrammarService,
      mockRenderer
    );
  });

  describe('generateThematicLesson', () => {
    it('should generate a thematic vocabulary lesson successfully', async () => {
      // Setup mocks
      vi.mocked(mockTemplateRepository.getTemplateById).mockResolvedValue(mockTemplate);
      vi.mocked(loader.loadVocabulary).mockResolvedValue({ items: [mockVocabularyItem] } as any);
      vi.mocked(loader.loadVocabularyByCategory).mockResolvedValue([mockVocabularyItem]);
      vi.mocked(mockRenderer.render).mockReturnValue('Rendered Content');

      const params: LessonGenerationParams = {
        type: 'vocabulary',
        difficulty: 'A1',
        criteria: {
          categories: ['home']
        },
        userId: 'user-1'
      };

      // Execute
      const result = await engine.generateThematicLesson(params);

      // Verify interactions
      expect(loader.loadVocabularyByCategory).toHaveBeenCalledWith('home', expect.anything());
      expect(mockRenderer.render).toHaveBeenCalled();

      // Verify result
      expect(result).toBeDefined();
      expect(result.type).toBe('vocabulary');
      expect(result.title).toContain('home');
      expect(result.sections[0].content).toBe('Rendered Content');
      expect(result.vocabulary).toHaveLength(1);
    });

    it('should fallback to random vocabulary if no category specified', async () => {
        vi.mocked(mockTemplateRepository.getTemplateById).mockResolvedValue(mockTemplate);
        vi.mocked(loader.getRandomVocabulary).mockResolvedValue([mockVocabularyItem]);
        vi.mocked(mockRenderer.render).mockReturnValue('Rendered Content');

        const params: LessonGenerationParams = {
            type: 'vocabulary',
            difficulty: 'A1',
            criteria: {},
            userId: 'user-1'
        };

        await engine.generateThematicLesson(params);

        expect(loader.getRandomVocabulary).toHaveBeenCalled();
    });

    it('should include practice section by default', async () => {
        vi.mocked(mockTemplateRepository.getTemplateById).mockResolvedValue(mockTemplate);
        vi.mocked(loader.getRandomVocabulary).mockResolvedValue([mockVocabularyItem]);
        vi.mocked(mockRenderer.render).mockReturnValue('Rendered Content');

        const params: LessonGenerationParams = {
            type: 'vocabulary',
            difficulty: 'A1',
            criteria: {},
            userId: 'user-1'
        };

        const result = await engine.generateThematicLesson(params);

        const practiceSection = result.sections.find(s => s.title === 'Practice');
        expect(practiceSection).toBeDefined();
    });

    it('should include review section if requested', async () => {
        vi.mocked(mockTemplateRepository.getTemplateById).mockResolvedValue(mockTemplate);
        vi.mocked(loader.getRandomVocabulary).mockResolvedValue([mockVocabularyItem]);
        vi.mocked(mockRenderer.render).mockReturnValue('Rendered Content');

        const params: LessonGenerationParams = {
            type: 'vocabulary',
            difficulty: 'A1',
            criteria: {},
            userId: 'user-1',
            metadata: { includeReview: true }
        };

        const result = await engine.generateThematicLesson(params);

        const reviewSection = result.sections.find(s => s.title === 'Review');
        expect(reviewSection).toBeDefined();
    });
  });

  describe('generateGrammarLesson', () => {
    it('should generate a multi-section grammar lesson successfully', async () => {
      const conceptTemplate = { ...mockTemplate, id: 'grammar-concept' };
      const practiceTemplate = { ...mockTemplate, id: 'grammar-practice' };
      vi.mocked(mockTemplateRepository.getTemplateById)
        .mockResolvedValueOnce(conceptTemplate)
        .mockResolvedValueOnce(practiceTemplate);
      vi.mocked(mockGrammarService.query).mockResolvedValue([mockGrammarConcept]);
      vi.mocked(loader.loadVocabularyBySearch).mockResolvedValue({ items: [mockVocabularyItem], total: 1, hasMore: false });
      vi.mocked(mockRenderer.render).mockReturnValue('Rendered Section');

      const params: LessonGenerationParams = {
        type: 'grammar',
        difficulty: 'A1',
        criteria: { conceptType: 'noun-gender' },
        userId: 'user-1',
        metadata: { includeComparison: false }
      };

      const result = await engine.generateGrammarLesson(params);

      expect(mockGrammarService.query).toHaveBeenCalled();
      expect(mockTemplateRepository.getTemplateById).toHaveBeenCalledWith('grammar-concept');
      expect(mockTemplateRepository.getTemplateById).toHaveBeenCalledWith('grammar-practice');
      expect(mockRenderer.render).toHaveBeenCalledTimes(2);
      expect(result.sections).toHaveLength(2);
      expect(result.sections.find(s => s.type === 'grammar')).toBeDefined();
      expect(result.sections.find(s => s.type === 'exercise')).toBeDefined();
      expect(result.grammarConcepts).toContain(mockGrammarConcept);
    });

    it('should include comparison section when requested', async () => {
        const conceptTemplate = { ...mockTemplate, id: 'grammar-concept' };
        const practiceTemplate = { ...mockTemplate, id: 'grammar-practice' };
        const comparisonTemplate = { ...mockTemplate, id: 'grammar-comparison', type: 'cultural' };
        vi.mocked(mockTemplateRepository.getTemplateById)
            .mockResolvedValueOnce(conceptTemplate)
            .mockResolvedValueOnce(practiceTemplate)
            .mockResolvedValueOnce(comparisonTemplate);
      vi.mocked(mockGrammarService.query).mockResolvedValue([mockGrammarConcept]);
      vi.mocked(loader.loadVocabularyBySearch).mockResolvedValue({ items: [mockVocabularyItem], total: 1, hasMore: false });
      vi.mocked(mockRenderer.render).mockReturnValue('Rendered Section');

      const params: LessonGenerationParams = {
        type: 'grammar',
        difficulty: 'A2',
        criteria: {},
        userId: 'user-1',
        metadata: { includeComparison: true, includePractice: true }
      };

      const result = await engine.generateGrammarLesson(params);
      
      const comparisonSection = result.sections.find(s => s.title === 'Comparison');
      expect(comparisonSection).toBeDefined();
      if(comparisonSection) {
          expect(comparisonSection.type).toBe('cultural');
      }
    });
  });

  describe('generateLesson (dispatcher)', () => {
      it('should dispatch to generateThematicLesson for vocabulary type', async () => {
          const spy = vi.spyOn(engine, 'generateThematicLesson').mockResolvedValue({} as any);
          
          await engine.generateLesson({ type: 'vocabulary', difficulty: 'A1', criteria: {}, userId: '1' });
          
          expect(spy).toHaveBeenCalled();
      });

      it('should dispatch to generateGrammarLesson for grammar type', async () => {
        const spy = vi.spyOn(engine, 'generateGrammarLesson').mockResolvedValue({} as any);
        
        await engine.generateLesson({ type: 'grammar', difficulty: 'A1', criteria: {}, userId: '1' });
        
        expect(spy).toHaveBeenCalled();
    });
  });
});