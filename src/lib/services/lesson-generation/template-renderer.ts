/**
 * TemplateRenderer - Service for rendering lesson templates with data
 *
 * This service provides template rendering functionality with support for variables,
 * conditionals, and loops for dynamic lesson generation.
 */

import type {
  LessonTemplate,
  TemplateRenderingContext,
  ITemplateRenderer
} from './types';
import { TemplateRenderingError, DataValidationError } from './types';

/**
 * TemplateRenderer class
 *
 * Implements the ITemplateRenderer interface to provide template rendering
 * functionality for the dynamic lesson generation system.
 */
export class TemplateRenderer implements ITemplateRenderer {
  /**
   * Render a template with the provided data
   * @param template - Lesson template to render
   * @param data - Data to render into the template
   * @returns Rendered content as a string
   */
  render(template: LessonTemplate, data: TemplateRenderingContext): string {
    this.validateData(template, data);

    try {
      return this.renderTemplate(template.template, data);
    } catch (error) {
      if (error instanceof TemplateRenderingError) {
        throw error;
      }
      throw new TemplateRenderingError(`Template rendering failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate template data against template variables
   * @param template - Lesson template
   * @param data - Data to validate
   * @returns True if data is valid
   * @throws DataValidationError if data is invalid
   */
  validateData(template: LessonTemplate, data: TemplateRenderingContext): boolean {
    for (const variable of template.variables) {
      if (variable.required && data[variable.name] === undefined) {
        throw new DataValidationError(`Required variable '${variable.name}' is missing`);
      }

      if (data[variable.name] !== undefined && !this.isValidValue(data[variable.name], variable.type)) {
        throw new DataValidationError(`Variable '${variable.name}' must be of type ${variable.type}`);
      }
    }

    return true;
  }

  /**
   * Validate a template structure
   * @param template - Template to validate
   * @returns True if template is valid
   */
  validateTemplate(template: LessonTemplate): boolean {
    if (!template.template || typeof template.template !== 'string') {
      throw new DataValidationError('Template content is required and must be a string');
    }

    if (!template.variables || !Array.isArray(template.variables)) {
      throw new DataValidationError('Template variables is required and must be an array');
    }

    return true;
  }

  /**
   * Render a template string with the given data
   * @param templateString - Template string to render
   * @param data - Data for rendering
   * @returns Rendered content
   */
  private renderTemplate(templateString: string, data: TemplateRenderingContext): string {
    let content = templateString;
    let previousContent: string;
    let passCount = 0;
    const maxPasses = 20; // Increased to support deeper nesting

    do {
      previousContent = content;

      // Process loops (they may contain conditionals and variables)
      content = this.processLoops(content, data);

      // Process conditionals (they may contain variables)
      content = this.processConditionals(content, data);

      // Process variables
      content = this.processVariables(content, data);

      passCount++;

      // Stop if we've done too many passes
      if (passCount >= maxPasses) {
        // Maximum template processing passes reached - this is expected for complex templates
        break;
      }

    } while (content !== previousContent);

    return content;
  }

  /**
   * Resolve a variable value from data, supporting dotted notation
   * @param path - Variable path (e.g. "user.name")
   * @param data - Data context
   * @returns The resolved value or undefined
   */
  private resolveValue(path: string, data: TemplateRenderingContext): string | number | boolean | object | unknown[] | undefined {
    if (data[path] !== undefined) return data[path];

    if (!path.includes('.')) return undefined;

    return path.split('.').reduce((obj, key) => {
      return (obj && typeof obj === 'object') ? obj[key] : undefined;
    }, data);
  }

  /**
   * Process variables in template content
   * @param content - Template content
   * @param data - Data for rendering
   * @returns Content with variables replaced
   */
  private processVariables(content: string, data: TemplateRenderingContext): string {
    // Updated regex to support dotted paths
    return content.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*\}\}/g, (match, variableName) => {
      // Skip special template variables
      if (variableName.startsWith('@') || variableName === 'this' || variableName === 'else') {
        return match;
      }

      const value = this.resolveValue(variableName, data);

      if (value === undefined) {
        // If it's a dotted path that failed, it might be optional, but strict mode says throw.
        // However, for single level variables, we must throw.
        // Let's stick to the requirement: throw if undefined.
        throw new TemplateRenderingError(`Variable '${variableName}' is not defined`);
      }

      if (typeof value === 'object' && value !== null) {
        throw new TemplateRenderingError(`Variable '${variableName}' is an object and cannot be rendered directly`);
      }

      return String(value);
    });
  }

  /**
   * Process conditional blocks in template content
   * @param content - Template content
   * @param data - Data for rendering
   * @returns Content with conditionals processed
   */
  private processConditionals(content: string, data: TemplateRenderingContext): string {
    // Process {{#unless variable}}...{{/unless}} blocks
    // Updated regex to support dotted paths ([@a-zA-Z_][a-zA-Z0-9_.]*)
    content = content.replace(/\{\{\s*#unless\s+([@a-zA-Z_][a-zA-Z0-9_.]*)\s*\}\}((?:(?!\{\{\s*#unless)[\s\S])*?)\{\{\s*\/unless\s*\}\}/g, (match, variableName, blockContent) => {
      const value = this.resolveValue(variableName, data);
      const condition = Boolean(value) && value !== 'false' && value !== '0';
      return condition ? '' : this.renderTemplate(blockContent, data);
    });

    // Process {{#if variable}}...{{/if}} blocks (handling optional {{else}})
    // Updated regex to support dotted paths
    content = content.replace(/\{\{\s*#if\s+([@a-zA-Z_][a-zA-Z0-9_.]*)\s*\}\}((?:(?!\{\{\s*#if)[\s\S])*?)\{\{\s*\/if\s*\}\}/g, (match, variableName, fullBlockContent) => {
      const value = this.resolveValue(variableName, data);
      const condition = Boolean(value) && value !== 'false' && value !== '0';

      // Check for {{else}} block
      const elseSplit = fullBlockContent.split(/\{\{\s*else\s*\}\}/);

      if (elseSplit.length > 1) {
        const trueBlock = elseSplit[0];
        const falseBlock = elseSplit.slice(1).join('{{else}}'); // Rejoin if multiple elses (though invalid)
        return condition ? this.renderTemplate(trueBlock, data) : this.renderTemplate(falseBlock, data);
      }

      return condition ? this.renderTemplate(fullBlockContent, data) : '';
    });

    return content;
  }

  /**
   * Process loop blocks in template content
   * @param content - Template content
   * @param data - Data for rendering
   * @returns Content with loops processed
   */
  private processLoops(content: string, data: TemplateRenderingContext): string {
    // Use a regex that targets innermost loops first to handle nesting
    // Matches {{#each var}} content {{/each}} where content doesn't contain another {{#each}}
    const eachRegex = /\{\{\s*#each\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}((?:(?!\{\{\s*#each)[\s\S])*?)\{\{\s*\/each\s*\}\}/g;
    let result = content;
    let match;

    while ((match = eachRegex.exec(result)) !== null) {
      const [fullMatch, arrayName, blockContent] = match;
      const arrayValue = data[arrayName];

      // Skip processing if the variable is not defined
      if (arrayValue === undefined) {
        eachRegex.lastIndex = 0;
        result = result.replace(fullMatch, '');
        continue;
      }

      if (!Array.isArray(arrayValue)) {
        // If we are here, it means validation passed but data is inconsistent or we are testing processLoops directly
        // Throw error to satisfy "should throw error for non-array" test case when invoked directly
        throw new TemplateRenderingError(`Variable '${arrayName}' must be an array for #each loop`);
      }

      if (arrayValue.length === 0) {
        result = result.replace(fullMatch, '');
        eachRegex.lastIndex = 0;
        continue;
      }

      const renderedItems = arrayValue.map((item, index) => {
        // Create a new context for each iteration
        const iterationContext = {
          ...data,
          // If item is object, spread it. If primitive, put in 'this'
          // BUT: also need to support 'this' for objects if template uses {{this.prop}}
          // The robust way: 'this': item, and spread properties if object
          'this': item,
          '@index': index,
          '@first': index === 0,
          '@last': index === arrayValue.length - 1
        };

        if (typeof item === 'object' && item !== null) {
            Object.assign(iterationContext, item);
        }

        // We need to manually process {{this}} and @ variables BEFORE recursion
        // because renderTemplate might not handle them if they are not in "variables" definition of template schema
        // or simply to ensure they are bound to THIS iteration context immediately.
        let processedBlock = blockContent;
        
        // Replace special variables eagerly in this block
        // This is crucial because renderTemplate() recursion might treat them as standard variables
        processedBlock = processedBlock.replace(/\{\{\s*this\s*\}\}/g, String(item));
        processedBlock = processedBlock.replace(/\{\{\s*@index\s*\}\}/g, String(index));
        processedBlock = processedBlock.replace(/\{\{\s*@first\s*\}\}/g, String(index === 0));
        processedBlock = processedBlock.replace(/\{\{\s*@last\s*\}\}/g, String(index === arrayValue.length - 1));

        // Now recursively render the rest (conditionals, other variables)
        return this.renderTemplate(processedBlock, iterationContext);
      }).join('');

      result = result.replace(fullMatch, renderedItems);
      eachRegex.lastIndex = 0; // Reset regex index after replacement
    }

    return result;
  }

  /**
   * Check if a value is valid for the specified type
   * @param value - Value to check
   * @param type - Expected type
   * @returns True if value is valid for the type
   */
  private isValidValue(value: string | number | boolean | object | unknown[], type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
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
}

/**
 * Singleton instance of TemplateRenderer
 */
export const templateRenderer = new TemplateRenderer();