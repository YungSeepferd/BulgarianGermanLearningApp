#!/usr/bin/env node

/**
 * Grammar Migration Script
 *
 * Migrates grammar data from data/grammar.json into rich Markdown files
 * following Hugo best practices for content-driven pages.
 *
 * Strategy:
 * - Read data/grammar.json (source of truth for content)
 * - For each grammar topic, create enriched MD file with:
 *   - Complete frontmatter (metadata)
 *   - Prose content (main explanation)
 *   - Bidirectional learning notes
 *   - Examples in markdown format
 * - Archive old grammar.json after migration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load grammar JSON data
const grammarData = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data', 'grammar.json'), 'utf-8')
);

console.log(`📚 Loaded ${grammarData.length} grammar topics from data/grammar.json\n`);

// Mapping from grammar IDs to MD filenames
const fileMapping = {
  'word_order': 'word-order.md',
  'gender_of_nouns': 'gender-of-nouns.md',
  'singular_and_plural': 'singular-and-plural.md',
  'definite_article': 'definite-article.md',
  'pronouns_and_cases': 'pronouns-and-cases.md',
  'present_and_future_tenses': 'present-and-future-tenses.md',
  'past_tenses': 'past-tenses.md',
  'quantifiers_and_numbers': 'quantifiers-and-numbers.md',
  'time_expressions': 'time-expressions.md',
  'food_and_shopping_vocabulary': 'food-and-shopping-vocabulary.md',
  'travel_and_directions': 'travel-and-directions.md'
};

// Create backup
const timestamp = new Date().toISOString().split('T')[0];
const contentDir = path.join(rootDir, 'content', 'grammar');
const backupDir = path.join(rootDir, 'archive', 'old-grammar-md');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup existing MD files
const existingFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.md') && f !== '_index.md');
existingFiles.forEach(file => {
  const src = path.join(contentDir, file);
  const dest = path.join(backupDir, file);
  fs.copyFileSync(src, dest);
});

console.log(`✅ Backed up ${existingFiles.length} existing grammar MD files to ${backupDir}\n`);

// Generate enriched markdown for each grammar topic
let migratedCount = 0;
let warnings = [];

grammarData.forEach((topic) => {
  const filename = fileMapping[topic.id];

  if (!filename) {
    warnings.push(`⚠️  No filename mapping for ID: ${topic.id}`);
    return;
  }

  const filePath = path.join(contentDir, filename);

  // Build frontmatter
  const frontmatter = {
    title: topic.title,
    description: topic.summary || topic.content.split('\n')[0],
    level: topic.level,
    type: 'grammar',
    weight: topic.level === 'A1' ? 10 : 20,
    category: topic.category || 'grammar',
    date: '2025-10-24',
    tags: [topic.level, 'grammar']
  };

  // If bidirectional notes exist, add them to frontmatter
  if (topic.notes_bg_to_de || topic.notes_de_to_bg) {
    frontmatter.notes_bg_to_de = topic.notes_bg_to_de || '';
    frontmatter.notes_de_to_bg = topic.notes_de_to_bg || '';
  }

  // Build markdown content
  let markdown = '---\n';

  // Write frontmatter in YAML
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Escape quotes and handle multiline
      if (value.includes('\n') || value.includes('"') || value.includes(':')) {
        markdown += `${key}: |\n  ${value.replace(/\n/g, '\n  ')}\n`;
      } else {
        markdown += `${key}: "${value}"\n`;
      }
    } else if (Array.isArray(value)) {
      markdown += `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}\n`;
    } else {
      markdown += `${key}: ${value}\n`;
    }
  });

  markdown += '---\n\n';

  // Add main content
  markdown += `# ${topic.title}\n\n`;

  // Add summary
  if (topic.summary) {
    markdown += `## Overview\n\n`;
    markdown += `${topic.summary}\n\n`;
  }

  // Add detailed explanation
  markdown += `## Explanation\n\n`;
  markdown += topic.content.split('\n').join('\n\n') + '\n\n';

  // Add bidirectional learning notes
  if (topic.notes_bg_to_de || topic.notes_de_to_bg) {
    markdown += `## Learning Notes\n\n`;

    if (topic.notes_de_to_bg) {
      markdown += `### For German Speakers (Für Deutschsprachige)\n\n`;
      markdown += `${topic.notes_de_to_bg}\n\n`;
    }

    if (topic.notes_bg_to_de) {
      markdown += `### For Bulgarian Speakers (За български говорещи)\n\n`;
      markdown += `${topic.notes_bg_to_de}\n\n`;
    }
  }

  // Add examples
  if (topic.examples && topic.examples.length > 0) {
    markdown += `## Examples\n\n`;

    topic.examples.forEach((example, index) => {
      markdown += `${index + 1}. **${example.sentence}**\n`;
      markdown += `   - *${example.translation}*\n\n`;
    });
  }

  // Add practice section placeholder
  markdown += `## Practice\n\n`;
  markdown += `Try creating your own sentences using the patterns above. Focus on understanding how the grammar rule applies in different contexts.\n\n`;

  // Write the file
  fs.writeFileSync(filePath, markdown, 'utf-8');
  migratedCount++;
  console.log(`✅ Migrated: ${topic.title} → ${filename}`);
});

console.log(`\n📊 Migration Summary:`);
console.log(`   Topics migrated: ${migratedCount}/${grammarData.length}`);
console.log(`   Files updated: ${migratedCount}`);

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings:`);
  warnings.forEach(w => console.log(`   ${w}`));
}

console.log(`\n🎉 Grammar migration complete!`);
console.log(`\nNext steps:`);
console.log(`1. Review migrated files in content/grammar/`);
console.log(`2. Test with Hugo: npm run dev`);
console.log(`3. Archive data/grammar.json: mv data/grammar.json data/archive/`);
console.log(`4. Commit changes`);
