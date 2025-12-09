/**
 * Unit tests for TemplateRenderer
 *
 * This file tests the template rendering functionality including variables,
 * conditionals, and loops.
 */

import { describe, it, expect } from 'vitest';
import { TemplateRenderer } from '$lib/services/lesson-generation/template-renderer';
import type { LessonTemplate, TemplateRenderingContext } from '$lib/services/lesson-generation/types';
import { TemplateRenderingError, DataValidationError } from '$lib/services/lesson-generation/types';

// Mock template for testing
const mockTemplate: LessonTemplate = {
  id: 'test_template',
  name: 'Test Template',
  description: 'A test template for rendering',
  type: 'vocabulary',
  difficultyRange: ['A1', 'C1'],
  template: '# {{title}}\n\n{{content}}\n\n{{#if showSection}}Section content{{/if}}\n\n{{#each items}}{{this}}{{#if @last}}!{{else}}, {{/if}}{{/each}}',
  variables: [
    { name: 'title', type: 'string', required: true, description: 'Section title' },
    { name: 'content', type: 'string', required: true, description: 'Section content' },
    { name: 'showSection', type: 'boolean', required: false, description: 'Whether to show section' },
    { name: 'items', type: 'array', required: false, description: 'Array of items' }
  ]
};

const mockVocabularyTemplate: LessonTemplate = {
  id: 'vocabulary_template',
  name: 'Vocabulary Template',
  description: 'Template for vocabulary lessons',
  type: 'vocabulary',
  difficultyRange: ['A1', 'C1'],
  template: '# {{sectionTitle}}\n\nThis section introduces {{count}} {{theme}} vocabulary items.\n\n{{#each vocabulary}}\n## {{german}} / {{bulgarian}}\n\n- **Part of Speech**: {{partOfSpeech}}\n- **Difficulty**: {{difficulty}}\n\n{{#if metadata.gender}}\n- **Gender**: {{metadata.gender}}\n{{/if}}\n\n{{#if metadata.culturalContext}}\n- **Cultural Context**: {{metadata.culturalContext}}\n{{/if}}\n\n{{/each}}',
  variables: [
    { name: 'sectionTitle', type: 'string', required: true, description: 'Section title' },
    { name: 'count', type: 'number', required: true, description: 'Number of vocabulary items' },
    { name: 'theme', type: 'string', required: true, description: 'Theme of vocabulary' },
    { name: 'vocabulary', type: 'array', required: true, description: 'Array of vocabulary items' }
  ]
};

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;

  beforeEach(() => {
    renderer = new TemplateRenderer();
  });

  describe('render', () => {
    it('should render template with basic variables', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content'
      };

      const result = renderer.render(mockTemplate, data);

      expect(result).toContain('# Test Title');
      expect(result).toContain('Test Content');
      expect(result).not.toContain('{{title}}');
      expect(result).not.toContain('{{content}}');
    });

    it('should render template with conditional blocks (true condition)', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        showSection: true
      };

      const result = renderer.render(mockTemplate, data);

      expect(result).toContain('Section content');
    });

    it('should render template with conditional blocks (false condition)', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        showSection: false
      };

      const result = renderer.render(mockTemplate, data);

      expect(result).not.toContain('Section content');
    });

    it('should render template with else conditionals', () => {
      const templateWithElse: LessonTemplate = {
        ...mockTemplate,
        template: '{{#if showSection}}Section content{{else}}No section{{/if}}'
      };

      // Test true condition
      const dataTrue: TemplateRenderingContext = {
        title: 'Test',
        content: 'Test',
        showSection: true
      };
      const resultTrue = renderer.render(templateWithElse, dataTrue);
      expect(resultTrue).toContain('Section content');
      expect(resultTrue).not.toContain('No section');

      // Test false condition
      const dataFalse: TemplateRenderingContext = {
        title: 'Test',
        content: 'Test',
        showSection: false
      };
      const resultFalse = renderer.render(templateWithElse, dataFalse);
      expect(resultFalse).toContain('No section');
      expect(resultFalse).not.toContain('Section content');
    });

    it('should render template with loop blocks', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        items: ['item1', 'item2', 'item3']
      };

      const result = renderer.render(mockTemplate, data);

      expect(result).toContain('item1, item2, item3!');
      expect(result).not.toContain('{{each}}');
      expect(result).not.toContain('{{this}}');
    });

    it('should render template with loop and conditional blocks', () => {
      const template: LessonTemplate = {
        id: 'loop_test',
        name: 'Loop Test',
        description: 'Test template with loops and conditionals',
        type: 'vocabulary',
        difficultyRange: ['A1', 'C1'],
        template: '{{#each items}}{{this}}{{#if @last}}.{{else}}, {{/if}}{{/each}}',
        variables: [
          { name: 'items', type: 'array', required: true, description: 'Array of items' }
        ]
      };

      const data: TemplateRenderingContext = {
        items: ['apple', 'banana', 'cherry']
      };

      const result = renderer.render(template, data);

      expect(result).toBe('apple, banana, cherry.');
    });

    it('should render vocabulary template with real data', () => {
      const vocabularyData = {
        sectionTitle: 'House Vocabulary',
        count: 2,
        theme: 'home',
        vocabulary: [
          {
            german: 'Haus',
            bulgarian: 'къща',
            partOfSpeech: 'noun',
            difficulty: 1.0,
            metadata: {
              gender: 'das',
              culturalContext: 'In Germany, houses often have sloped roofs.'
            }
          },
          {
            german: 'Tür',
            bulgarian: 'врата',
            partOfSpeech: 'noun',
            difficulty: 1.0,
            metadata: {
              gender: 'die'
            }
          }
        ]
      };

      const result = renderer.render(mockVocabularyTemplate, vocabularyData);

      expect(result).toContain('# House Vocabulary');
      expect(result).toContain('This section introduces 2 home vocabulary items.');
      expect(result).toContain('## Haus / къща');
      expect(result).toContain('## Tür / врата');
      expect(result).toContain('- **Gender**: das');
      expect(result).toContain('- **Gender**: die');
      expect(result).toContain('- **Cultural Context**: In Germany, houses often have sloped roofs.');
    });

    it('should handle empty arrays in loops', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        items: []
      };

      const result = renderer.render(mockTemplate, data);

      expect(result).not.toContain('{{each}}');
      expect(result).toContain('# Test Title');
    });

    it('should handle loop variables like @index, @first, @last', () => {
      const template: LessonTemplate = {
        id: 'loop_vars_test',
        name: 'Loop Variables Test',
        description: 'Test template with loop variables',
        type: 'vocabulary',
        difficultyRange: ['A1', 'C1'],
        template: '{{#each items}}{{@index}}: {{this}}{{#if @first}} (first){{/if}}{{#if @last}} (last){{/if}}{{#unless @last}}, {{/unless}}{{/each}}',
        variables: [
          { name: 'items', type: 'array', required: true, description: 'Array of items' }
        ]
      };

      const data: TemplateRenderingContext = {
        items: ['apple', 'banana', 'cherry']
      };

      const result = renderer.render(template, data);

      expect(result).toBe('0: apple (first), 1: banana, 2: cherry (last)');
    });

    it('should throw error for missing required variables', () => {
      const data: TemplateRenderingContext = {
        // Missing required 'title' and 'content'
      };

      expect(() => renderer.render(mockTemplate, data)).toThrow(DataValidationError);
    });

    it('should throw error for undefined variables in template', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content'
        // Missing 'showSection' which is used in template but not required
      };

      // This should work because showSection is not required
      const result = renderer.render(mockTemplate, data);
      expect(result).not.toContain('Section content');

      // But if we try to use an undefined variable in a way that causes rendering issues
      const badTemplate: LessonTemplate = {
        ...mockTemplate,
        template: '{{undefinedVariable}}'
      };

      expect(() => renderer.render(badTemplate, data)).toThrow(TemplateRenderingError);
    });

    it('should throw error for invalid variable types', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 123 // Should be string
      };

      expect(() => renderer.render(mockTemplate, data)).toThrow(DataValidationError);
    });

    it('should throw error for non-array in each block', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        items: 'not an array' // Should be array
      };

      // Depending on whether validateData is called or processLoops runs first
      // validateData throws DataValidationError, processLoops throws TemplateRenderingError
      // render calls validateData first
      expect(() => renderer.render(mockTemplate, data)).toThrow(DataValidationError);
    });
  });

  describe('validateData', () => {
    it('should return true for valid data', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content',
        showSection: true,
        items: ['item1', 'item2']
      };

      const isValid = renderer.validateData(mockTemplate, data);
      expect(isValid).toBe(true);
    });

    it('should throw error for missing required variables', () => {
      const data: TemplateRenderingContext = {
        // Missing required 'title' and 'content'
        showSection: true
      };

      expect(() => renderer.validateData(mockTemplate, data)).toThrow(DataValidationError);
    });

    it('should throw error for invalid variable types', () => {
      const data: TemplateRenderingContext = {
        title: 123, // Should be string
        content: 'Test Content'
      };

      expect(() => renderer.validateData(mockTemplate, data)).toThrow(DataValidationError);
    });

    it('should allow optional variables to be missing', () => {
      const data: TemplateRenderingContext = {
        title: 'Test Title',
        content: 'Test Content'
        // showSection and items are optional and missing
      };

      const isValid = renderer.validateData(mockTemplate, data);
      expect(isValid).toBe(true);
    });
  });

  describe('validateTemplate', () => {
    it('should return true for valid templates', () => {
      const isValid = renderer.validateTemplate(mockTemplate);
      expect(isValid).toBe(true);
    });

    it('should throw error for missing template content', () => {
      const invalidTemplate = { ...mockTemplate, template: undefined };

      expect(() => renderer.validateTemplate(invalidTemplate as any)).toThrow(DataValidationError);
    });

    it('should throw error for missing variables', () => {
      const invalidTemplate = { ...mockTemplate, variables: undefined };

      expect(() => renderer.validateTemplate(invalidTemplate as any)).toThrow(DataValidationError);
    });
  });

  describe('processVariables', () => {
    it('should replace variables with their values', () => {
      const content = 'Hello {{name}}, you are {{age}} years old.';
      const data: TemplateRenderingContext = { name: 'John', age: 30 };

      const result = (renderer as any).processVariables(content, data);

      expect(result).toBe('Hello John, you are 30 years old.');
    });

    it('should throw error for undefined variables', () => {
      const content = 'Hello {{undefinedVar}}';
      const data: TemplateRenderingContext = { name: 'John' };

      expect(() => (renderer as any).processVariables(content, data)).toThrow(TemplateRenderingError);
    });

    it('should throw error for object variables', () => {
      const content = 'Hello {{user}}';
      const data: TemplateRenderingContext = { user: { name: 'John' } };

      expect(() => (renderer as any).processVariables(content, data)).toThrow(TemplateRenderingError);
    });
  });

  describe('processConditionals', () => {
    it('should process if blocks with true conditions', () => {
      const content = '{{#if show}}Content{{/if}}';
      const data: TemplateRenderingContext = { show: true };

      const result = (renderer as any).processConditionals(content, data);

      expect(result).toBe('Content');
    });

    it('should process if blocks with false conditions', () => {
      const content = '{{#if show}}Content{{/if}}';
      const data: TemplateRenderingContext = { show: false };

      const result = (renderer as any).processConditionals(content, data);

      expect(result).toBe('');
    });

    it('should process if-else blocks with true conditions', () => {
      const content = '{{#if show}}Content{{else}}No content{{/if}}';
      const data: TemplateRenderingContext = { show: true };

      const result = (renderer as any).processConditionals(content, data);

      expect(result).toBe('Content');
    });

    it('should process if-else blocks with false conditions', () => {
      const content = '{{#if show}}Content{{else}}No content{{/if}}';
      const data: TemplateRenderingContext = { show: false };

      const result = (renderer as any).processConditionals(content, data);

      expect(result).toBe('No content');
    });

    it('should handle multiple if blocks', () => {
      const content = '{{#if show1}}Content1{{/if}} {{#if show2}}Content2{{/if}}';
      const data: TemplateRenderingContext = { show1: true, show2: false };

      const result = (renderer as any).processConditionals(content, data);

      expect(result).toBe('Content1 ');
    });
  });

  describe('processLoops', () => {
    it('should process each blocks with array data', () => {
      const content = '{{#each items}}{{this}} {{/each}}';
      const data: TemplateRenderingContext = { items: ['apple', 'banana', 'cherry'] };

      const result = (renderer as any).processLoops(content, data);

      expect(result).toBe('apple banana cherry ');
    });

    it('should handle empty arrays in each blocks', () => {
      const content = '{{#each items}}{{this}} {{/each}}';
      const data: TemplateRenderingContext = { items: [] };

      const result = (renderer as any).processLoops(content, data);

      expect(result).toBe('');
    });

    it('should throw error for non-array in each blocks', () => {
      const content = '{{#each items}}{{this}} {{/each}}';
      const data: TemplateRenderingContext = { items: 'not an array' };

      expect(() => (renderer as any).processLoops(content, data)).toThrow(TemplateRenderingError);
    });

    it('should process nested variables in each blocks', () => {
      const content = '{{#each users}}{{name}} ({{age}}){{#unless @last}}, {{/unless}}{{/each}}';
      const data: TemplateRenderingContext = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      };

      const result = (renderer as any).processLoops(content, data);

      expect(result).toBe('John (30), Jane (25)');
    });
  });

  describe('isValidValue', () => {
    it('should return true for valid string values', () => {
      expect((renderer as any).isValidValue('test', 'string')).toBe(true);
      expect((renderer as any).isValidValue('', 'string')).toBe(true);
    });

    it('should return false for invalid string values', () => {
      expect((renderer as any).isValidValue(123, 'string')).toBe(false);
      expect((renderer as any).isValidValue(true, 'string')).toBe(false);
      expect((renderer as any).isValidValue({}, 'string')).toBe(false);
    });

    it('should return true for valid number values', () => {
      expect((renderer as any).isValidValue(123, 'number')).toBe(true);
      expect((renderer as any).isValidValue(0, 'number')).toBe(true);
      expect((renderer as any).isValidValue(-1, 'number')).toBe(true);
      expect((renderer as any).isValidValue(3.14, 'number')).toBe(true);
    });

    it('should return false for invalid number values', () => {
      expect((renderer as any).isValidValue('123', 'number')).toBe(false);
      expect((renderer as any).isValidValue(NaN, 'number')).toBe(false);
      expect((renderer as any).isValidValue(true, 'number')).toBe(false);
    });

    it('should return true for valid boolean values', () => {
      expect((renderer as any).isValidValue(true, 'boolean')).toBe(true);
      expect((renderer as any).isValidValue(false, 'boolean')).toBe(true);
    });

    it('should return false for invalid boolean values', () => {
      expect((renderer as any).isValidValue('true', 'boolean')).toBe(false);
      expect((renderer as any).isValidValue(1, 'boolean')).toBe(false);
      expect((renderer as any).isValidValue(0, 'boolean')).toBe(false);
    });

    it('should return true for valid array values', () => {
      expect((renderer as any).isValidValue([], 'array')).toBe(true);
      expect((renderer as any).isValidValue([1, 2, 3], 'array')).toBe(true);
      expect((renderer as any).isValidValue(['a', 'b'], 'array')).toBe(true);
    });

    it('should return false for invalid array values', () => {
      expect((renderer as any).isValidValue('array', 'array')).toBe(false);
      expect((renderer as any).isValidValue({}, 'array')).toBe(false);
      expect((renderer as any).isValidValue(123, 'array')).toBe(false);
    });

    it('should return true for valid object values', () => {
      expect((renderer as any).isValidValue({}, 'object')).toBe(true);
      expect((renderer as any).isValidValue({ key: 'value' }, 'object')).toBe(true);
    });

    it('should return false for invalid object values', () => {
      expect((renderer as any).isValidValue('object', 'object')).toBe(false);
      expect((renderer as any).isValidValue([], 'object')).toBe(false);
      expect((renderer as any).isValidValue(null, 'object')).toBe(false);
    });
  });
});