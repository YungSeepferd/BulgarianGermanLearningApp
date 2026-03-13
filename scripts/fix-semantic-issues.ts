#!/usr/bin/env tsx
/**
 * Fix Semantic Issues in Vocabulary
 *
 * Fixes examples that were flagged by the semantic validation script.
 */

import fs from 'fs/promises';

interface Example {
  german: string;
  bulgarian: string;
  context?: string;
  source?: string;
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  examples?: Example[];
  [key: string]: unknown;
}

// Fixes to apply
const FIXES: Record<string, { badExample: string; newExample: Example }[]> = {
  'a1_adj_025': [ // reich (rich)
    {
      badExample: 'Das Wetter ist reich',
      newExample: {
        german: 'Das Land ist reich',
        bulgarian: 'Страната е богата',
        context: 'Description (n) - country',
        source: 'corrected'
      }
    }
  ],
  'a1_adj_026': [ // arm (poor)
    {
      badExample: 'Das Wetter ist arm',
      newExample: {
        german: 'Die Familie ist arm',
        bulgarian: 'Семейството е бедно',
        context: 'Description (n) - family',
        source: 'corrected'
      }
    }
  ]
};

async function main() {
  console.log('🔧 Fixing Semantic Issues in Vocabulary\n');

  const vocabPath = 'data/unified-vocabulary.json';
  const content = await fs.readFile(vocabPath, 'utf-8');
  const items: VocabularyItem[] = JSON.parse(content);

  let fixCount = 0;

  for (const item of items) {
    const fixes = FIXES[item.id];
    if (!fixes || !item.examples) continue;

    for (const fix of fixes) {
      const badIndex = item.examples.findIndex(
        ex => ex.german === fix.badExample
      );

      if (badIndex !== -1) {
        console.log(`Fixing ${item.id} (${item.german}):`);
        console.log(`  Old: "${fix.badExample}"`);
        console.log(`  New: "${fix.newExample.german}" = "${fix.newExample.bulgarian}"`);

        item.examples[badIndex] = fix.newExample;
        fixCount++;
      }
    }
  }

  if (fixCount > 0) {
    // Create backup
    const backupPath = `data/unified-vocabulary-backup-${Date.now()}.json`;
    await fs.copyFile(vocabPath, backupPath);
    console.log(`\n📦 Backup created: ${backupPath}`);

    // Write fixed data
    await fs.writeFile(vocabPath, JSON.stringify(items, null, 2));
    console.log(`\n✅ Fixed ${fixCount} semantic issues.`);
    console.log(`📝 Updated: ${vocabPath}`);
  } else {
    console.log('No fixes needed.');
  }
}

main().catch(console.error);