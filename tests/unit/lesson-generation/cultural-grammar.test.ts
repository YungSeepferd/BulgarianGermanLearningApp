/**
 * Unit tests for CulturalGrammarService
 *
 * This file tests the grammar data loading, validation, and query functionality
 * of the CulturalGrammarService.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CulturalGrammarService } from '$lib/services/lesson-generation/cultural-grammar';
import type { CulturalGrammarConcept, GrammarQueryCriteria } from '$lib/services/lesson-generation/types';
import { LessonGenerationError, DataValidationError } from '$lib/services/lesson-generation/types';

// Mock grammar concept data
const mockConcept: CulturalGrammarConcept = {
  id: 'article-usage',
  name: {
    bulgarian: 'Употреба на членове',
    german: 'Artikelgebrauch'
  },
  description: {
    bulgarian: 'Разлики в употребата на членове между българския и немския език',
    german: 'Unterschiede im Artikelgebrauch zwischen Bulgarisch und Deutsch'
  },
  difficulty: 'A1',
  partOfSpeech: ['noun'],
  culturalContext: {
    bulgarianPerspective: 'В българския език няма членове...',
    germanPerspective: 'Im Deutschen sind Artikel obligatorisch...',
    crossLinguisticExplanation: {
      bgToDe: 'В български няма членове...',
      deToBg: 'Im Bulgarischen gibt es keine Artikel...'
    }
  },
  examples: [
    {
      bulgarian: 'Книгата е на масата.',
      german: 'Das Buch ist auf dem Tisch.',
      explanationBgToDe: 'В български няма членове...',
      explanationDeToBg: 'Im Deutschen gibt es Artikel...'
    }
  ],
  commonMistakes: {
    bgToDe: ['Забравяне на членове'],
    deToBg: ['Добавяне на несъществуващи членове']
  },
  relatedConcepts: ['noun-gender'],
  metadata: {}
};

const mockConcept2: CulturalGrammarConcept = {
  id: 'verb-conjugation',
  name: {
    bulgarian: 'Спрежение на глаголите',
    german: 'Verbkonjugation'
  },
  description: {
    bulgarian: 'Разлики в спрежението на глаголите',
    german: 'Unterschiede in der Verbkonjugation'
  },
  difficulty: 'A2',
  partOfSpeech: ['verb'],
  culturalContext: {
    bulgarianPerspective: 'В български глаголите имат по-просто спрежение...',
    germanPerspective: 'Im Deutschen ist die Verbkonjugation komplexer...',
    crossLinguisticExplanation: {
      bgToDe: 'В български личните местоимения често се изпускат...',
      deToBg: 'Im Deutschen sind Personalpronomen obligatorisch...'
    }
  },
  examples: [
    {
      bulgarian: 'Аз чета. / Чета.',
      german: 'Ich lese.',
      explanationBgToDe: 'В български може да се изпусне личното местоимение...',
      explanationDeToBg: 'Im Deutschen ist das Personalpronomen obligatorisch...'
    }
  ],
  commonMistakes: {
    bgToDe: ['Изпускане на лично местоимение'],
    deToBg: ['Добавяне на ненужни местоимения']
  },
  relatedConcepts: ['personal-pronouns'],
  metadata: {}
};

const invalidConcept = {
  id: 'invalid-concept',
  name: {
    bulgarian: 'Невалиден концепт',
    german: '' // Missing german name
  },
  description: {
    bulgarian: 'Описание на невалиден концепт',
    german: 'Description'
  },
  difficulty: 'A0', // Invalid difficulty
  partOfSpeech: ['invalid'], // Invalid part of speech
  culturalContext: {},
  examples: [],
  commonMistakes: {},
  relatedConcepts: []
};

describe('CulturalGrammarService', () => {
  let service: CulturalGrammarService;

  beforeEach(() => {
    service = new CulturalGrammarService();
    // Reset the initialized state for each test
    (service as any)._initialized = false;
    (service as any).grammarConcepts = [];
  });

  describe('initialize', () => {
    it('should initialize the service and load grammar concepts', async () => {
      // Mock the loadGrammarData method
      const loadDataSpy = vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept]);

      await service.initialize();

      expect(loadDataSpy).toHaveBeenCalled();
      expect((service as any)._initialized).toBe(true);
    });

    it('should throw an error if grammar data loading fails', async () => {
      // Mock the loadGrammarData method to throw an error
      vi.spyOn(service as any, 'loadGrammarData').mockRejectedValue(new Error('Loading failed'));

      await expect(service.initialize()).rejects.toThrow(LessonGenerationError);
    });
  });

  describe('query', () => {
    it('should return concepts matching the criteria', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept, mockConcept2]);
      await service.initialize();

      const criteria: GrammarQueryCriteria = {
        difficulty: 'A1',
        partOfSpeech: 'noun',
        limit: 1
      };

      const concepts = await service.query(criteria);

      expect(concepts.length).toBe(1);
      expect(concepts[0].id).toBe('article-usage');
      expect(concepts[0].difficulty).toBe('A1');
      expect(concepts[0].partOfSpeech).toContain('noun');
    });

    it('should return concepts matching concept type criteria', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept, mockConcept2]);
      await service.initialize();

      const criteria: GrammarQueryCriteria = {
        conceptType: 'noun-gender',
        limit: 1
      };

      const concepts = await service.query(criteria);

      expect(concepts.length).toBe(1);
      expect(concepts[0].id).toBe('article-usage');
      expect(concepts[0].relatedConcepts).toContain('noun-gender');
    });

    it('should return empty array when no concepts match criteria', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept]);
      await service.initialize();

      const criteria: GrammarQueryCriteria = {
        difficulty: 'C1', // No concepts with this difficulty
        limit: 1
      };

      const concepts = await service.query(criteria);

      expect(concepts.length).toBe(0);
    });

    it('should use default limit of 1 when not specified', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept, mockConcept2]);
      await service.initialize();

      const criteria: GrammarQueryCriteria = {
        difficulty: 'A1'
      };

      const concepts = await service.query(criteria);

      expect(concepts.length).toBe(1);
    });
  });

  describe('getAllConcepts', () => {
    it('should return all grammar concepts', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept, mockConcept2]);
      await service.initialize();

      const concepts = await service.getAllConcepts();

      expect(concepts.length).toBe(2);
      expect(concepts.map(c => c.id)).toContain('article-usage');
      expect(concepts.map(c => c.id)).toContain('verb-conjugation');
    });

    it('should return empty array if no concepts are loaded', async () => {
      // Mock the loadGrammarData method to return empty array
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([]);
      await service.initialize();

      const concepts = await service.getAllConcepts();

      expect(concepts.length).toBe(0);
    });
  });

  describe('conceptAppliesToPartOfSpeech', () => {
    it('should return true when concept applies to part of speech', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept]);
      await service.initialize();

      const result = service.conceptAppliesToPartOfSpeech(mockConcept, 'noun');
      expect(result).toBe(true);
    });

    it('should return false when concept does not apply to part of speech', async () => {
      // Mock the loadGrammarData method
      vi.spyOn(service as any, 'loadGrammarData').mockResolvedValue([mockConcept]);
      await service.initialize();

      const result = service.conceptAppliesToPartOfSpeech(mockConcept, 'verb');
      expect(result).toBe(false);
    });
  });

  describe('validateConcept', () => {
    it('should return true for valid concepts', () => {
      const isValid = (service as any).validateConcept(mockConcept);
      expect(isValid).toBe(true);
    });

    it('should throw DataValidationError for invalid concepts', () => {
      expect(() => (service as any).validateConcept(invalidConcept as any)).toThrow(DataValidationError);
    });

    it('should throw DataValidationError for missing required fields', () => {
      const invalidConcept = { ...mockConcept, id: undefined };

      expect(() => (service as any).validateConcept(invalidConcept as any)).toThrow(DataValidationError);
    });

    it('should throw DataValidationError for invalid difficulty', () => {
      const invalidConcept = { ...mockConcept, difficulty: 'A0' };

      expect(() => (service as any).validateConcept(invalidConcept as any)).toThrow(DataValidationError);
    });

    it('should throw DataValidationError for invalid part of speech', () => {
      const invalidConcept = { ...mockConcept, partOfSpeech: ['invalid'] };

      expect(() => (service as any).validateConcept(invalidConcept as any)).toThrow(DataValidationError);
    });

    it('should throw DataValidationError for empty examples array', () => {
      const invalidConcept = { ...mockConcept, examples: [] };

      expect(() => (service as any).validateConcept(invalidConcept as any)).toThrow(DataValidationError);
    });
  });

  describe('loadGrammarData', () => {
    it('should load grammar data from file system', async () => {
      // Mock the test environment check
      const originalEnv = import.meta.env;
      Object.defineProperty(import.meta, 'env', {
        value: { MODE: 'test' },
        writable: true
      });

      const concepts = await (service as any).loadGrammarData();

      expect(concepts.length).toBeGreaterThan(0);
      expect(concepts[0].id).toBe('fallback-article-usage');

      // Restore original env
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv
      });
    });

    it('should use fallback data when loading fails', async () => {
      // Mock the test environment check to simulate non-test environment
      const originalEnv = import.meta.env;
      Object.defineProperty(import.meta, 'env', {
        value: { MODE: 'production' },
        writable: true
      });

      // Mock the import to throw an error
      vi.mock('$lib/data/cultural-grammar.json', () => {
        throw new Error('File not found');
      });

      // Mock the fallback data method
      const fallbackSpy = vi.spyOn(service as any, 'getFallbackGrammarData').mockReturnValue([mockConcept]);

      const concepts = await (service as any).loadGrammarData();

      expect(concepts.length).toBe(1);
      expect(concepts[0].id).toBe('article-usage');
      expect(fallbackSpy).toHaveBeenCalled();

      // Restore original env
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv
      });
    });
  });

  describe('getFallbackGrammarData', () => {
    it('should return valid fallback grammar data', () => {
      const fallbackData = (service as any).getFallbackGrammarData();

      expect(fallbackData.length).toBe(1);
      expect(fallbackData[0].id).toBe('fallback-article-usage');
      expect((service as any).validateConcept(fallbackData[0])).toBe(true);
    });
  });
});