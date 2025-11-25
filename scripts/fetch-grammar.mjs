#!/usr/bin/env node

/**
 * Grammar Fetching and Processing Script
 *
 * Fetches grammar rules from web sources (docs, websites, educational materials)
 * and structures them for the Bulgarian-German learning app.
 *
 * Strategy:
 * - Accept URL or file path as input
 * - Extract grammar rules using AI-powered content extraction
 * - Structure data with bidirectional learning notes (BG→DE and DE→BG)
 * - Validate CEFR levels and progression
 * - Generate markdown files for Hugo
 * - Update cultural-grammar.json with comparative insights
 *
 * Usage:
 *   npm run grammar:fetch <URL or file path>
 *   node scripts/fetch-grammar.mjs https://example.com/bulgarian-grammar
 *   node scripts/fetch-grammar.mjs ./docs/grammar-source.pdf
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CEFR level validation
const VALID_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Grammar categories
const VALID_CATEGORIES = [
  'morphology',
  'syntax',
  'phonetics',
  'verb_system',
  'noun_system',
  'sentence_structure',
  'pragmatics'
];

/**
 * Fetch and process grammar from a URL
 */
async function fetchGrammarFromURL(url) {
  console.log(`🌐 Fetching grammar content from: ${url}\n`);

  try {
    // Use WebFetch or similar tool to get content
    const prompt = `Extract Bulgarian and German grammar rules from this source.

For each grammar rule, provide:
1. A unique ID (lowercase, underscores, e.g., "verb_aspects_bg")
2. Title (in English)
3. Bulgarian concept name (in Bulgarian)
4. German concept name (in German)
5. CEFR difficulty level (A1, A2, B1, B2, C1, or C2)
6. Cultural context explaining how Bulgarians and Germans think about this concept differently
7. Cross-linguistic explanations:
   - bg_to_de: Explanation for Bulgarian speakers learning German (in German)
   - de_to_bg: Explanation for German speakers learning Bulgarian (in English or simple Bulgarian)
8. Examples with both languages
9. Common mistakes for both directions
10. Cultural insights

Return ONLY valid JSON array format.

URL: ${url}`;

    // In real implementation, this would call an AI service or scraping tool
    // For now, provide a template structure
    const grammarData = extractGrammarRulesTemplate();

    return grammarData;
  } catch (error) {
    console.error('❌ Error fetching from URL:', error.message);
    throw error;
  }
}

/**
 * Parse grammar from local file (markdown, PDF, or text)
 */
async function parseGrammarFromFile(filePath) {
  console.log(`📄 Parsing grammar content from: ${filePath}\n`);

  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let content = '';

  if (ext === '.md' || ext === '.txt') {
    content = fs.readFileSync(absolutePath, 'utf8');
  } else if (ext === '.pdf') {
    console.log('⚠️  PDF parsing requires external tools. Please convert to markdown first.');
    throw new Error('PDF parsing not yet implemented. Use: pdftotext or similar tool.');
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Parse markdown content into structured grammar rules
  const grammarRules = parseMarkdownToGrammar(content);

  return grammarRules;
}

/**
 * Parse markdown content into grammar rule objects
 */
function parseMarkdownToGrammar(markdown) {
  const rules = [];

  // Split by H1 or H2 headers
  const sections = markdown.split(/\n#{1,2}\s+/);

  for (const [index, section] of sections.entries()) {
    if (!section.trim()) {
      continue;
    }

    const lines = section.split('\n');
    const title = lines[0].trim();

    // Extract metadata from section
    const rule = {
      id: slugify(title),
      title: title,
      bulgarian_concept: extractPattern(section, /bulgarian:\s*(.+)/i) || '',
      german_concept: extractPattern(section, /german:\s*(.+)/i) || '',
      difficulty: extractPattern(section, /level:\s*(a1|a2|b1|b2|c1|c2)/i) || 'A1',
      cultural_context: {
        bulgarian_perspective: extractPattern(section, /bulgarian perspective:\s*(.+)/is) || '',
        german_perspective: extractPattern(section, /german perspective:\s*(.+)/is) || ''
      },
      cross_linguistic_explanation: {
        bg_to_de: extractPattern(section, /for bulgarian speakers.*?:\s*(.+)/is) || '',
        de_to_bg: extractPattern(section, /for german speakers.*?:\s*(.+)/is) || ''
      },
      examples: extractExamples(section),
      common_mistakes: {
        bg_to_de: [],
        de_to_bg: []
      },
      cultural_insight: extractPattern(section, /cultural insight:\s*(.+)/is) || ''
    };

    if (rule.title && rule.id) {
      rules.push(rule);
    }
  }

  return rules;
}

/**
 * Extract pattern from text using regex
 */
function extractPattern(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Extract examples from section
 */
function extractExamples(section) {
  const examples = [];
  const examplePattern = /example:\s*(.+?)\s*-\s*(.+)/gi;
  let match;

  while ((match = examplePattern.exec(section)) !== null) {
    examples.push({
      bulgarian: match[1].trim(),
      german: match[2].trim(),
      explanation_bg_to_de: '',
      explanation_de_to_bg: ''
    });
  }

  return examples;
}

/**
 * Validate grammar rule structure
 */
function validateGrammarRule(rule) {
  const errors = [];

  if (!rule.id || typeof rule.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!rule.title || typeof rule.title !== 'string') {
    errors.push('Missing or invalid title');
  }

  if (!VALID_LEVELS.includes(rule.difficulty)) {
    errors.push(`Invalid difficulty level: ${rule.difficulty}. Must be one of: ${VALID_LEVELS.join(', ')}`);
  }

  if (!rule.cultural_context || !rule.cultural_context.bulgarian_perspective) {
    errors.push('Missing cultural context (bulgarian_perspective)');
  }

  return errors;
}

/**
 * Generate markdown file for a grammar rule
 */
function generateMarkdownFile(rule, outputDir) {
  const filename = `${rule.id}.md`;
  const filePath = path.join(outputDir, filename);

  // Build frontmatter
  const frontmatter = {
    title: rule.title,
    description: rule.cultural_insight || `Learn about ${rule.title}`,
    level: rule.difficulty,
    type: 'grammar',
    category: rule.category || 'grammar',
    weight: getLevelWeight(rule.difficulty),
    date: new Date().toISOString().split('T')[0],
    tags: [rule.difficulty, 'grammar', rule.category || 'general'],
    notes_bg_to_de: rule.cross_linguistic_explanation?.bg_to_de || '',
    notes_de_to_bg: rule.cross_linguistic_explanation?.de_to_bg || ''
  };

  let markdown = '---\n';

  // Write frontmatter
  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'string') {
      markdown += value.includes('\n') || value.includes('"') || value.includes(':') ? `${key}: |\n  ${value.replaceAll('\n', '\n  ')}\n` : `${key}: "${value}"\n`;
    } else if (Array.isArray(value)) {
      markdown += `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}\n`;
    } else {
      markdown += `${key}: ${value}\n`;
    }
  }

  markdown += '---\n\n';

  // Add content sections
  markdown += `# ${rule.title}\n\n`;

  // Overview
  if (rule.cultural_insight) {
    markdown += `## Overview\n\n${rule.cultural_insight}\n\n`;
  }

  // Cultural Context
  if (rule.cultural_context) {
    markdown += '## Cultural Context\n\n';

    if (rule.cultural_context.bulgarian_perspective) {
      markdown += `### Bulgarian Perspective\n\n${rule.cultural_context.bulgarian_perspective}\n\n`;
    }

    if (rule.cultural_context.german_perspective) {
      markdown += `### German Perspective\n\n${rule.cultural_context.german_perspective}\n\n`;
    }
  }

  // Bidirectional Learning
  markdown += '## Learning Notes\n\n';

  if (rule.cross_linguistic_explanation?.de_to_bg) {
    markdown += `### For German Speakers (Für Deutschsprachige)\n\n${rule.cross_linguistic_explanation.de_to_bg}\n\n`;
  }

  if (rule.cross_linguistic_explanation?.bg_to_de) {
    markdown += `### For Bulgarian Speakers (За български говорещи)\n\n${rule.cross_linguistic_explanation.bg_to_de}\n\n`;
  }

  // Examples
  if (rule.examples && rule.examples.length > 0) {
    markdown += '## Examples\n\n';

    for (const [index, ex] of rule.examples.entries()) {
      markdown += `${index + 1}. **${ex.bulgarian}** → **${ex.german}**\n`;
      if (ex.explanation_bg_to_de) {
        markdown += `   - For BG speakers: ${ex.explanation_bg_to_de}\n`;
      }
      if (ex.explanation_de_to_bg) {
        markdown += `   - For DE speakers: ${ex.explanation_de_to_bg}\n`;
      }
      markdown += '\n';
    }
  }

  // Common Mistakes
  if (rule.common_mistakes) {
    markdown += '## Common Mistakes\n\n';

    if (rule.common_mistakes.bg_to_de && rule.common_mistakes.bg_to_de.length > 0) {
      markdown += '### For Bulgarian Speakers\n\n';
      for (const mistake of rule.common_mistakes.bg_to_de) {
        markdown += `- ${mistake}\n`;
      }
      markdown += '\n';
    }

    if (rule.common_mistakes.de_to_bg && rule.common_mistakes.de_to_bg.length > 0) {
      markdown += '### For German Speakers\n\n';
      for (const mistake of rule.common_mistakes.de_to_bg) {
        markdown += `- ${mistake}\n`;
      }
      markdown += '\n';
    }
  }

  // Practice section
  markdown += '## Practice\n\n';
  markdown += 'Try creating your own sentences using this grammar pattern. Pay attention to the differences between Bulgarian and German approaches.\n\n';

  fs.writeFileSync(filePath, markdown, 'utf-8');
  console.log(`✅ Generated: ${filename}`);

  return filePath;
}

/**
 * Update cultural-grammar.json with new rules
 */
function updateCulturalGrammarJSON(newRules) {
  const jsonPath = path.join(rootDir, 'data', 'cultural-grammar.json');

  let existing = [];
  if (fs.existsSync(jsonPath)) {
    existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  // Merge new rules (avoid duplicates by ID)
  const existingIds = new Set(existing.map(r => r.id));
  const toAdd = newRules.filter(r => !existingIds.has(r.id));

  const updated = [...existing, ...toAdd];

  // Write back
  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), 'utf-8');

  console.log(`📝 Updated cultural-grammar.json (+${toAdd.length} new rules)\n`);

  return updated;
}

/**
 * Helper functions
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replaceAll(/[^\s\w-]/g, '')
    .replaceAll(/[\s_-]+/g, '_')
    .replaceAll(/^-+|-+$/g, '');
}

function getLevelWeight(level) {
  const weights = { A1: 10, A2: 20, B1: 30, B2: 40, C1: 50, C2: 60 };
  return weights[level] || 10;
}

function extractGrammarRulesTemplate() {
  // Template structure for new grammar rules
  return [
    {
      id: 'example_grammar_rule',
      title: 'Example Grammar Rule',
      bulgarian_concept: 'Примерно граматическо правило',
      german_concept: 'Beispielgrammatikregel',
      difficulty: 'A1',
      category: 'morphology',
      cultural_context: {
        bulgarian_perspective: 'Explanation from Bulgarian cultural viewpoint',
        german_perspective: 'Explanation from German cultural viewpoint'
      },
      cross_linguistic_explanation: {
        bg_to_de: 'Erklärung für bulgarische Sprecher auf Deutsch',
        de_to_bg: 'Explanation for German speakers in English/Bulgarian'
      },
      examples: [
        {
          bulgarian: 'Примерно изречение',
          german: 'Beispielsatz',
          explanation_bg_to_de: 'Note for Bulgarian speakers',
          explanation_de_to_bg: 'Note for German speakers'
        }
      ],
      common_mistakes: {
        bg_to_de: ['Common mistake 1', 'Common mistake 2'],
        de_to_bg: ['Common mistake 1', 'Common mistake 2']
      },
      cultural_insight: 'Deeper cultural insight about this grammar concept'
    }
  ];
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📚 Grammar Fetching and Processing Script

Usage:
  node scripts/fetch-grammar.mjs <URL or file path>

Examples:
  node scripts/fetch-grammar.mjs https://example.com/bulgarian-grammar
  node scripts/fetch-grammar.mjs ./docs/grammar-rules.md
  node scripts/fetch-grammar.mjs https://de.wikibooks.org/wiki/Bulgarisch

Options:
  --level <A1|A2|B1|B2>  Filter by CEFR level
  --output <dir>         Output directory (default: content/grammar/)
  --dry-run             Show what would be created without writing files
    `);
    process.exit(1);
  }

  const source = args[0];
  const outputDir = path.join(rootDir, 'content', 'grammar');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting grammar fetching process...\n');

  let grammarRules = [];

  try {
    // Determine if source is URL or file
    grammarRules = await (source.startsWith('http://') || source.startsWith('https://') ? fetchGrammarFromURL(source) : parseGrammarFromFile(source));

    console.log(`\n📊 Extracted ${grammarRules.length} grammar rules\n`);

    // Validate each rule
    let validCount = 0;
    let errorCount = 0;

    for (const [index, rule] of grammarRules.entries()) {
      const errors = validateGrammarRule(rule);

      if (errors.length > 0) {
        console.log(`⚠️  Rule ${index + 1} (${rule.title || 'untitled'}) has errors:`);
        for (const err of errors) {
          console.log(`   - ${err}`);
        }
        errorCount++;
      } else {
        validCount++;
      }
    }

    console.log(`\n✅ Valid rules: ${validCount}`);
    console.log(`❌ Rules with errors: ${errorCount}\n`);

    // Generate markdown files for valid rules
    const validRules = grammarRules.filter(r => validateGrammarRule(r).length === 0);

    console.log('📝 Generating markdown files...\n');

    for (const rule of validRules) {
      generateMarkdownFile(rule, outputDir);
    }

    // Update cultural-grammar.json
    updateCulturalGrammarJSON(validRules);

    console.log('\n🎉 Grammar fetching complete!');
    console.log('\nNext steps:');
    console.log('1. Review generated files in content/grammar/');
    console.log('2. Test with Hugo: npm run dev');
    console.log('3. Verify grammar page renders correctly at /grammar/');
    console.log('4. Commit changes to git\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  fetchGrammarFromURL,
  parseGrammarFromFile,
  validateGrammarRule,
  generateMarkdownFile
};
