/**
 * Unit tests for LessonTemplateRepository
 *
 * This file tests the template loading, validation, and selection functionality
 * of the LessonTemplateRepository service.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LessonTemplateRepository } from '$lib/services/lesson-generation/lesson-templates';
import type { LessonTemplate, LessonType, LessonDifficulty } from '$lib/services/lesson-generation/types';
import { LessonGenerationError, DataValidationError } from '$lib/services/lesson-generation/types';

// Mock template data
const mockTemplate: LessonTemplate = {
  id: 'test_template',
  name: 'Test Template',
  description: 'A test template',
  type: 'vocabulary',
  difficultyRange: ['A1', 'B1'],
  template: '# {{title}}\n\n{{content}}',
  variables: [
    { name: 'title', type: 'string', required: true, description: 'Section title' },
    { name: 'content', type: 'string', required: true, description: 'Section content' }
  ]
};

const mockTemplate2: LessonTemplate = {
  id: 'test_template_2',
  name: 'Test Template 2',
  description: 'Another test template',
  type: 'vocabulary',
  difficultyRange: ['A2', 'C1'],
  template: '# {{heading}}\n\n{{body}}',
  variables: [
    { name: 'heading', type: 'string', required: true, description: 'Section heading' },
    { name: 'body', type: 'string', required: true, description: 'Section body' }
  ]
};

const invalidTemplate = {
  id: 'invalid_template',
  name: 'Invalid Template',
  description: 'An invalid template',
  type: 'invalid_type',
  difficultyRange: ['C1', 'A1'], // Invalid range (descending)
  template: '# {{title}}',
  variables: [
    { name: 'title', type: 'invalid_type', required: 'not_boolean' }
  ]
};

describe('LessonTemplateRepository', () => {
  let repository: LessonTemplateRepository;

  beforeEach(() => {
    repository = new LessonTemplateRepository();
    // Reset the initialized state for each test
    (repository as any)._initialized = false;
    (repository as any).templates = [];
    (repository as any).templateCache = new Map();
  });

  describe('initialize', () => {
    it('should initialize the repository and load templates', async () => {
      // Mock the loadTemplates method
      const loadTemplatesSpy = vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate]);

      await repository.initialize();

      expect(loadTemplatesSpy).toHaveBeenCalled();
      expect((repository as any).initialized).toBe(true);
    });

    it('should throw an error if template loading fails', async () => {
      // Mock the loadTemplates method to throw an error
      vi.spyOn(repository as any, 'loadTemplates').mockRejectedValue(new Error('Loading failed'));

      await expect(repository.initialize()).rejects.toThrow(LessonGenerationError);
    });
  });

  describe('getTemplate', () => {
    it('should return a template for valid type and difficulty', async () => {
      // Mock the loadTemplates method
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate]);
      await repository.initialize();

      const template = await repository.getTemplate('vocabulary', 'A1');

      expect(template).toBeDefined();
      expect(template.id).toBe('test_template');
      expect(template.type).toBe('vocabulary');
    });

    it('should return a random template from matching ones', async () => {
      // Mock the loadTemplates method with multiple templates
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate, mockTemplate2]);
      await repository.initialize();

      // This test is probabilistic - we just check that we get one of the templates
      const template = await repository.getTemplate('vocabulary', 'A2');

      expect(template).toBeDefined();
      expect(['test_template', 'test_template_2']).toContain(template.id);
    });

    it('should throw an error when no template is found', async () => {
      // Mock the loadTemplates method with no matching templates
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate]);
      await repository.initialize();

      await expect(repository.getTemplate('grammar', 'A1')).rejects.toThrow(LessonGenerationError);
    });

    it('should cache templates after first retrieval', async () => {
      // Mock the loadTemplates method
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate]);
      await repository.initialize();

      // First call
      const template1 = await repository.getTemplate('vocabulary', 'A1');

      // Second call should use cache
      const cacheSpy = vi.spyOn(repository as any, 'cacheTemplates');
      const template2 = await repository.getTemplate('vocabulary', 'A1');

      expect(template1.id).toBe(template2.id);
      expect(cacheSpy).not.toHaveBeenCalled(); // Cache should already be populated
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', async () => {
      // Mock the loadTemplates method
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([mockTemplate, mockTemplate2]);
      await repository.initialize();

      const templates = await repository.getAllTemplates();

      expect(templates.length).toBe(2);
      expect(templates.map(t => t.id)).toContain('test_template');
      expect(templates.map(t => t.id)).toContain('test_template_2');
    });

    it('should return empty array if no templates are loaded', async () => {
      // Mock the loadTemplates method to return empty array
      vi.spyOn(repository as any, 'loadTemplates').mockResolvedValue([]);
      await repository.initialize();

      const templates = await repository.getAllTemplates();

      expect(templates.length).toBe(0);
    });
  });

  describe('validateTemplate', () => {
    it('should return true for valid templates', () => {
      const isValid = repository.validateTemplate(mockTemplate);
      expect(isValid).toBe(true);
    });

    it('should throw DataValidationError for invalid templates', () => {
      expect(() => repository.validateTemplate(invalidTemplate as any)).toThrow(DataValidationError);
    });

    it('should throw DataValidationError for missing required fields', () => {
      const invalidTemplate = { ...mockTemplate, id: undefined };

      expect(() => repository.validateTemplate(invalidTemplate as any)).toThrow(DataValidationError);
    });

    it('should validate variable types correctly', () => {
      // Test with invalid variable type
      const invalidVarTemplate = {
        ...mockTemplate,
        variables: [{ name: 'test', type: 'invalid', required: true }]
      };

      expect(() => repository.validateTemplate(invalidVarTemplate as any)).toThrow(DataValidationError);
    });

    it('should validate difficulty range correctly', () => {
      // Test with invalid difficulty range
      const invalidRangeTemplate = {
        ...mockTemplate,
        difficultyRange: ['C1', 'A1'] // Descending order
      };

      expect(() => repository.validateTemplate(invalidRangeTemplate as any)).toThrow(DataValidationError);
    });
  });

  describe('isDifficultyInRange', () => {
    it('should return true for difficulties within range', () => {
      const result1 = (repository as any).isDifficultyInRange('A1', ['A1', 'B1']);
      const result2 = (repository as any).isDifficultyInRange('A2', ['A1', 'B1']);
      const result3 = (repository as any).isDifficultyInRange('B1', ['A1', 'B1']);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('should return false for difficulties outside range', () => {
      const result1 = (repository as any).isDifficultyInRange('B2', ['A1', 'B1']);
      const result2 = (repository as any).isDifficultyInRange('C1', ['A1', 'B1']);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('isValidDifficultyRange', () => {
    it('should return true for valid difficulty ranges', () => {
      const result1 = (repository as any).isValidDifficultyRange(['A1', 'B1']);
      const result2 = (repository as any).isValidDifficultyRange(['A1', 'A1']);
      const result3 = (repository as any).isValidDifficultyRange(['A1', 'C1']);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('should return false for invalid difficulty ranges', () => {
      const result1 = (repository as any).isValidDifficultyRange(['B1', 'A1']); // Descending
      const result2 = (repository as any).isValidDifficultyRange(['A0', 'B1']); // Invalid difficulty
      const result3 = (repository as any).isValidDifficultyRange(['A1', 'C2']); // Invalid difficulty

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('loadTemplates', () => {
    it('should load templates from file system', async () => {
      // Mock the test environment check
      const originalEnv = import.meta.env;
      Object.defineProperty(import.meta, 'env', {
        value: { MODE: 'test' },
        writable: true
      });

      // Set test templates
      (repository as any)._testTemplates = [mockTemplate];

      const templates = await (repository as any).loadTemplates();
      expect(templates.length).toBe(1);
      expect(templates[0].id).toBe('test_template');

      // Restore original env
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv
      });
    });

    it('should use fallback template when no templates are found', async () => {
      // Mock the test environment check
      const originalEnv = import.meta.env;
      Object.defineProperty(import.meta, 'env', {
        value: { MODE: 'test' },
        writable: true
      });

      // Don't set test templates
      (repository as any)._testTemplates = undefined;

      const templates = await (repository as any).loadTemplates();
      expect(templates.length).toBe(1);
      expect(templates[0].id).toBe('fallback_template');

      // Restore original env
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv
      });
    });
  });

  describe('createFallbackTemplate', () => {
    it('should create a valid fallback template', () => {
      const fallbackTemplate = (repository as any).createFallbackTemplate();

      expect(fallbackTemplate.id).toBe('fallback_template');
      expect(fallbackTemplate.type).toBe('vocabulary');
      expect(fallbackTemplate.difficultyRange).toEqual(['A1', 'C1']);
      expect(repository.validateTemplate(fallbackTemplate)).toBe(true);
    });
  });
});