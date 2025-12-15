/**
 * LessonTemplateRepository - Service for managing and retrieving lesson templates
 *
 * This service handles the loading, validation, and selection of lesson templates
 * for dynamic lesson generation.
 */

import type {
  LessonTemplate,
  LessonType,
  LessonDifficulty,
  ILessonTemplateRepository
} from './types';
import { LessonGenerationError, DataValidationError } from './types';

/**
 * LessonTemplateRepository class
 *
 * Implements the ILessonTemplateRepository interface to provide template management
 * functionality for the dynamic lesson generation system.
 */
export class LessonTemplateRepository implements ILessonTemplateRepository {
  private templates: LessonTemplate[] = [];
  private _initialized = false;
  private templateCache: Map<string, LessonTemplate> = new Map();
  public _testTemplates?: LessonTemplate[];

  /**
   * Get the initialization status
   */
  get initialized(): boolean {
    return this._initialized;
  }

  /**
   * Initialize the template repository by loading templates
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;

    try {
      this.templates = await this.loadTemplates();
      this._initialized = true;
      this.cacheTemplates();
    } catch (_error) {
      throw new LessonGenerationError('Failed to initialize template repository');
    }
  }

  /**
   * Get a template by type and difficulty
   * @param type - Lesson type
   * @param difficulty - Lesson difficulty
   * @returns Promise resolving to a lesson template
   */
  async getTemplate(type: LessonType, difficulty: LessonDifficulty): Promise<LessonTemplate> {
    if (!this._initialized) {
      await this.initialize();
    }

    // Check cache first
    const cacheKey = `${type}-${difficulty}`;
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    const matchingTemplates = this.templates.filter(template =>
      template.type === type &&
      this.isDifficultyInRange(difficulty, template.difficultyRange)
    );

    if (matchingTemplates.length === 0) {
      throw new LessonGenerationError(
        `No template found for type ${type} and difficulty ${difficulty}`
      );
    }

    // Return random template from matching ones for variety
    const selectedTemplate = matchingTemplates[
      Math.floor(Math.random() * matchingTemplates.length)
    ];

    if (!selectedTemplate) {
      throw new LessonGenerationError(`Failed to select a template for type ${type}`);
    }

    // Cache the selected template
    this.templateCache.set(cacheKey, selectedTemplate);

    return selectedTemplate;
  }

  /**
   * Get a template by specific ID
   * @param templateId - The unique identifier of the template
   * @returns Promise resolving to the requested lesson template
   */
  async getTemplateById(templateId: string): Promise<LessonTemplate | undefined> {
    if (!this._initialized) {
      await this.initialize();
    }

    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Get all templates
   * @returns Promise resolving to all lesson templates
   */
  async getAllTemplates(): Promise<LessonTemplate[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return [...this.templates];
  }

  /**
   * Validate a template structure
   * @param template - Template to validate
   * @returns True if template is valid
   * @throws DataValidationError if template is invalid
   */
  validateTemplate(template: LessonTemplate): boolean {
    // Check required fields
    if (!template.id || typeof template.id !== 'string') {
      throw new DataValidationError('Template id is required and must be a string');
    }

    if (!template.name || typeof template.name !== 'string') {
      throw new DataValidationError('Template name is required and must be a string');
    }

    if (!template.description || typeof template.description !== 'string') {
      throw new DataValidationError('Template description is required and must be a string');
    }

    if (!template.type || !['vocabulary', 'grammar', 'mixed', 'cultural', 'contextual'].includes(template.type)) {
      throw new DataValidationError('Template type is required and must be a valid LessonType');
    }

    if (!template.difficultyRange || !Array.isArray(template.difficultyRange) ||
        template.difficultyRange.length !== 2) {
      throw new DataValidationError('Template difficultyRange is required and must be an array of two elements');
    }

    if (!this.isValidDifficultyRange(template.difficultyRange)) {
      throw new DataValidationError('Template difficultyRange must contain valid difficulty levels in ascending order');
    }

    if (!template.template || typeof template.template !== 'string') {
      throw new DataValidationError('Template content is required and must be a string');
    }

    if (!template.variables || !Array.isArray(template.variables)) {
      throw new DataValidationError('Template variables is required and must be an array');
    }

    // Validate variables
    for (const variable of template.variables) {
      if (!variable.name || typeof variable.name !== 'string') {
        throw new DataValidationError(`Variable name is required and must be a string: ${JSON.stringify(variable)}`);
      }

      if (!variable.type || !['string', 'number', 'boolean', 'array', 'object'].includes(variable.type)) {
        throw new DataValidationError(`Variable type is required and must be a valid TemplateVariableType: ${variable.name}`);
      }

      if (typeof variable.required !== 'boolean') {
        throw new DataValidationError(`Variable required must be a boolean: ${variable.name}`);
      }

      if (variable.defaultValue !== undefined && !this.isValidDefaultValue(variable.defaultValue, variable.type)) {
        throw new DataValidationError(`Variable defaultValue must match the specified type: ${variable.name}`);
      }
    }

    return true;
  }

  /**
   * Load templates from the file system
   * @returns Promise resolving to an array of lesson templates
   */
  private async loadTemplates(): Promise<LessonTemplate[]> {
    try {
      // In test environment, we might not have access to import.meta.glob
      // so we'll use a fallback approach
      if (import.meta.env?.MODE === 'test') {
        // For testing, we'll check if we have any mock templates
        if (this._testTemplates) {
          return this._testTemplates;
        }
        return [this.createFallbackTemplate()];
      }

      // Import all template files dynamically
      const templateModules = import.meta.glob('$lib/data/templates/**/*.json');

      const templates: LessonTemplate[] = [];

      for (const [_path, importFn] of Object.entries(templateModules)) {
        try {
          const module = await importFn() as { default: LessonTemplate };
          const template = module.default;

          if (this.validateTemplate(template)) {
            templates.push(template);
          } else {
            // Skipping invalid template from ${path}
          }
        } catch (_error) {
        }
      }

      if (templates.length === 0) {
        // No valid templates found. Using fallback template.
        return [this.createFallbackTemplate()];
      }

      return templates;
    } catch (_error) {
      return [this.createFallbackTemplate()];
    }
  }

  /**
   * Cache templates for faster access
   */
  private cacheTemplates(): void {
    this.templateCache.clear();

    for (const template of this.templates) {
      // Cache by type-difficulty combinations
      for (const difficulty of this.getDifficultiesInRange(template.difficultyRange)) {
        const cacheKey = `${template.type}-${difficulty}`;
        this.templateCache.set(cacheKey, template);
      }
    }
  }

  /**
   * Check if a difficulty is within a range
   * @param difficulty - Difficulty to check
   * @param range - Difficulty range
   * @returns True if difficulty is in range
   */
  private isDifficultyInRange(difficulty: LessonDifficulty, range: [LessonDifficulty, LessonDifficulty]): boolean {
    const difficultyOrder: LessonDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const minIndex = difficultyOrder.indexOf(range[0]);
    const maxIndex = difficultyOrder.indexOf(range[1]);
    const difficultyIndex = difficultyOrder.indexOf(difficulty);

    return difficultyIndex >= minIndex && difficultyIndex <= maxIndex;
  }

  /**
   * Get all difficulties in a range
   * @param range - Difficulty range
   * @returns Array of difficulties in range
   */
  private getDifficultiesInRange(range: [LessonDifficulty, LessonDifficulty]): LessonDifficulty[] {
    const difficultyOrder: LessonDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const minIndex = difficultyOrder.indexOf(range[0]);
    const maxIndex = difficultyOrder.indexOf(range[1]);

    return difficultyOrder.slice(minIndex, maxIndex + 1);
  }

  /**
   * Check if a default value matches the variable type
   * @param value - Value to check
   * @param type - Expected type
   * @returns True if value matches type
   */
  private isValidDefaultValue(value: string | number | boolean | object | unknown[], type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return false;
    }
  }

  /**
   * Check if a difficulty range is valid
   * @param range - Difficulty range to validate
   * @returns True if range is valid
   */
  private isValidDifficultyRange(range: [LessonDifficulty, LessonDifficulty]): boolean {
    const difficultyOrder: LessonDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

    const minIndex = difficultyOrder.indexOf(range[0]);
    const maxIndex = difficultyOrder.indexOf(range[1]);

    return minIndex !== -1 && maxIndex !== -1 && minIndex <= maxIndex;
  }

  /**
   * Create a fallback template for error recovery
   * @returns Fallback lesson template
   */
  private createFallbackTemplate(): LessonTemplate {
    return {
      id: 'fallback_template',
      name: 'Fallback Template',
      description: 'Fallback template used when no other templates are available',
      type: 'vocabulary',
      difficultyRange: ['A1', 'C1'],
      template: '# {{sectionTitle}}\n\nThis lesson contains {{count}} vocabulary items.\n\n{{#each vocabulary}}\n- {{german}} / {{bulgarian}}\n{{/each}}',
      variables: [
        { name: 'sectionTitle', type: 'string', required: true, description: 'Title for the section' },
        { name: 'count', type: 'number', required: true, description: 'Number of vocabulary items' },
        { name: 'vocabulary', type: 'array', required: true, description: 'Array of vocabulary items' }
      ]
    };
  }
}

/**
 * Singleton instance of LessonTemplateRepository
 */
export const lessonTemplateRepository = new LessonTemplateRepository();