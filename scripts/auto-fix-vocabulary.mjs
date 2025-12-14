#!/usr/bin/env node

/**
 * Auto-Fix Common Vocabulary Issues
 * 
 * Automatically generates fixes for common data quality issues:
 * - Numeric difficulty values → A1/A2/B1/B2
 * - Invalid part of speech (phrase) → interjection
 * - Missing examples → add placeholder
 * - Missing categories → assign default
 * 
 * Usage: pnpm run auto-fix:vocabulary --id=1 --output=fixes-batch-1.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BATCH_ID = parseInt(process.argv.find(arg => arg.includes('--id='))?.split('=')[1] || '1');
const OUTPUT_FILE = process.argv.find(arg => arg.includes('--output='))?.split('=')[1] || `enrichment-output/fixes-batch-${String(BATCH_ID).padStart(3, '0')}.json`;
const BATCH_SIZE = 10;

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Mapping: numeric difficulty to enum
const difficultyMap = {
  '1': 'A1',
  '2': 'A2',
  '3': 'B1',
  '4': 'B2',
  '5': 'B2',
  1: 'A1',
  2: 'A2',
  3: 'B1',
  4: 'B2',
  5: 'B2'
};

// Valid PoS values
const validPoS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];

// PoS remapping
const poSRemap = {
  'phrase': 'interjection',
  'Phrase': 'interjection',
  'phrasal verb': 'verb',
  'expression': 'interjection',
  'article': 'pronoun',
  'Article': 'pronoun'
};

function generateFixes() {
  // Load vocabulary
  const vocabData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'unified-vocabulary.json'), 'utf-8'));
  const vocabulary = Array.isArray(vocabData) ? vocabData : vocabData.items || [];

  // Extract batch
  const startIdx = (BATCH_ID - 1) * BATCH_SIZE;
  const endIdx = Math.min(startIdx + BATCH_SIZE, vocabulary.length);
  const batch = vocabulary.slice(startIdx, endIdx);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔧 Auto-Fixing Vocabulary Issues`);
  console.log(`Batch ${BATCH_ID} (entries ${startIdx + 1}-${endIdx})`);
  console.log(`${'='.repeat(70)}\n`);

  const fixes = [];

  batch.forEach((item, idx) => {
    const itemNum = startIdx + idx + 1;

    // Fix 1: Numeric difficulty → A1/A2/B1/B2
    if (typeof item.difficulty !== 'string' || !['A1', 'A2', 'B1', 'B2'].includes(item.difficulty)) {
      if (item.difficulty in difficultyMap) {
        fixes.push({
          id: item.id,
          fieldPath: 'difficulty',
          oldValue: item.difficulty,
          newValue: difficultyMap[item.difficulty],
          reason: 'Normalize numeric difficulty to A1/A2/B1/B2 enum'
        });
        console.log(`${YELLOW}⚙️${RESET}  [${itemNum}] Difficulty: ${item.difficulty} → ${difficultyMap[item.difficulty]}`);
      }
    }

    // Fix 2: Invalid PoS → remap or set default
    if (!validPoS.includes(item.partOfSpeech)) {
      const newPoS = poSRemap[item.partOfSpeech] || 'noun';
      fixes.push({
        id: item.id,
        fieldPath: 'partOfSpeech',
        oldValue: item.partOfSpeech,
        newValue: newPoS,
        reason: `Normalize invalid PoS "${item.partOfSpeech}" → ${newPoS}`
      });
      console.log(`${YELLOW}⚙️${RESET}  [${itemNum}] PoS: "${item.partOfSpeech}" → "${newPoS}"`);
    }

    // Fix 3: Missing examples → add placeholder
    if (!item.examples || item.examples.length === 0) {
      fixes.push({
        id: item.id,
        fieldPath: 'examples',
        oldValue: item.examples || [],
        newValue: [{
          german: `Example with ${item.german}`,
          bulgarian: `Пример с ${item.bulgarian}`
        }],
        reason: 'Add placeholder example'
      });
      console.log(`${YELLOW}⚙️${RESET}  [${itemNum}] Examples: Added placeholder`);
    }

    // Fix 4: Missing categories → assign defaults based on PoS + difficulty
    if (!item.categories || item.categories.length === 0) {
      const defaultCategory = item.difficulty === 'A1' ? 'everyday-phrases' : 'vocabulary';
      fixes.push({
        id: item.id,
        fieldPath: 'categories',
        oldValue: item.categories || [],
        newValue: [defaultCategory],
        reason: `Assign default category "${defaultCategory}"`
      });
      console.log(`${YELLOW}⚙️${RESET}  [${itemNum}] Categories: Added "${defaultCategory}"`);
    }
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Auto-Fix Summary`);
  console.log(`${'='.repeat(70)}`);
  console.log(`${GREEN}✅ Total fixes generated: ${fixes.length}${RESET}`);
  console.log(`Breakdown:`);
  console.log(`  - Difficulty fixes: ${fixes.filter(f => f.fieldPath === 'difficulty').length}`);
  console.log(`  - PoS fixes: ${fixes.filter(f => f.fieldPath === 'partOfSpeech').length}`);
  console.log(`  - Example fixes: ${fixes.filter(f => f.fieldPath === 'examples').length}`);
  console.log(`  - Category fixes: ${fixes.filter(f => f.fieldPath === 'categories').length}`);

  // Create output directory
  mkdirSync(join(process.cwd(), 'enrichment-output'), { recursive: true });

  // Save fixes
  const outputPath = join(process.cwd(), OUTPUT_FILE);
  writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n${GREEN}✅ Fixes saved:${RESET} ${outputPath}`);

  console.log(`\n${BLUE}Next steps:${RESET}`);
  console.log(`1. Review fixes: cat ${OUTPUT_FILE}`);
  console.log(`2. Apply fixes: pnpm run apply:vocabulary:fixes --file=${OUTPUT_FILE}`);
  console.log(`3. Validate batch: pnpm run validate:vocabulary:batch --id=${BATCH_ID}`);
  console.log(`${'='.repeat(70)}\n`);

  return fixes;
}

try {
  generateFixes();
} catch (error) {
  console.error('\x1b[31m❌ Error generating fixes:\x1b[0m', error);
  process.exit(1);
}
