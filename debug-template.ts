import { TemplateRenderer } from './src/lib/services/lesson-generation/template-renderer';

const renderer = new TemplateRenderer();

// Test the unless block specifically
const unlessTest = '{{#unless @last}}, {{/unless}}';

console.log('Testing unless block:', unlessTest);
console.log('Regex matches:', [...unlessTest.matchAll(/\{\{\s*#unless\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}([\s\S]*?)\{\{\s*\/unless\s*\}\}/g)]);

// Test the unless processing directly
const testData = { '@last': false };

const processed = unlessTest.replace(/\{\{\s*#unless\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}([\s\S]*?)\{\{\s*\/unless\s*\}\}/g, (match, variableName, blockContent) => {
  console.log('Match:', match);
  console.log('Variable name:', variableName);
  console.log('Block content:', blockContent);
  const value = testData[variableName];
  const condition = Boolean(value) && value !== 'false' && value !== '0';
  console.log('Condition:', condition);
  return condition ? '' : blockContent;
});

console.log('Processed result:', processed);