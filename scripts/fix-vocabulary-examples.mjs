#!/usr/bin/env node
/**
 * Fix vocabulary.json examples schema
 *
 * Problem: Some entries use {bg, de, context} schema
 * Expected: {sentence, translation, context} schema
 *
 * This script normalizes all examples to the expected schema.
 */

import { readFile, writeFile } from 'node:fs/promises';

async function main() {
  const vocabPath = 'data/vocabulary.json';

  console.log('📖 Reading vocabulary data...');
  const data = JSON.parse(await readFile(vocabPath, 'utf8'));

  let fixCount = 0;
  let exampleCount = 0;

  for (const entry of data) {
    if (!entry.examples || !Array.isArray(entry.examples)) {
      continue;
    }

    let entryFixed = false;
    for (const example of entry.examples) {
      // Check if example uses old schema (bg/de instead of sentence/translation)
      if (example.bg !== undefined || example.de !== undefined) {
        // Normalize to new schema
        if (example.bg && !example.sentence) {
          example.sentence = example.bg;
          delete example.bg;
          entryFixed = true;
          exampleCount++;
        }
        if (example.de && !example.translation) {
          example.translation = example.de;
          delete example.de;
          entryFixed = true;
          exampleCount++;
        }
      }

      // Ensure sentence and translation are strings (not null/undefined)
      if (!example.sentence || typeof example.sentence !== 'string' || example.sentence.trim() === '') {
        console.warn(`⚠️  Entry ${entry.id}: example has invalid sentence field`);
      }
      if (!example.translation || typeof example.translation !== 'string' || example.translation.trim() === '') {
        console.warn(`⚠️  Entry ${entry.id}: example has invalid translation field`);
      }
    }

    if (entryFixed) {
      fixCount++;
    }
  }

  console.log(`✅ Fixed ${exampleCount} examples in ${fixCount} entries`);

  // Create backup
  const backupPath = 'data/vocabulary.json.backup';
  console.log(`💾 Creating backup: ${backupPath}`);
  await writeFile(backupPath, JSON.stringify(data, null, 2), 'utf8');

  // Write fixed data
  console.log(`💾 Writing fixed data to ${vocabPath}`);
  await writeFile(vocabPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('✨ Done! Run `npm run lint:data` to verify.');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
