import { TemplateRenderer } from './src/lib/services/lesson-generation/template-renderer';
import type { LessonTemplate, TemplateRenderingContext } from './src/lib/services/lesson-generation/types';

const renderer = new TemplateRenderer();

// Simple test template
const simpleTemplate: LessonTemplate = {
  id: 'simple_template',
  name: 'Simple Template',
  description: 'A simple test template',
  type: 'vocabulary',
  difficultyRange: ['A1', 'C1'],
  template: 'Hello {{name}}! You have {{count}} items: {{#each items}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.',
  variables: [
    { name: 'name', type: 'string', required: true, description: 'User name' },
    { name: 'count', type: 'number', required: true, description: 'Item count' },
    { name: 'items', type: 'array', required: true, description: 'Array of items' }
  ]
};

// Test data
const testData: TemplateRenderingContext = {
  name: 'John',
  count: 3,
  items: ['apple', 'banana', 'cherry']
};

try {
  const result = renderer.render(simpleTemplate, testData);
  console.log('Rendered result:');
  console.log(result);
  console.log('Success!');
} catch (error) {
  console.error('Error:', error);
}