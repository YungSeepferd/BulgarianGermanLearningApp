#!/usr/bin/env tsx
/**
 * Analyze Parts of Speech in Vocabulary
 */

import fs from 'fs';
import { glob } from 'glob';

async function main() {
  const files = await glob('data/vocabulary/*.json');
  const posCounts: Record<string, number> = {};
  const sampleItems: Record<string, any> = {};

  for (const file of files) {
    if (file.includes('index') || file.includes('search')) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data)) continue;

    for (const item of data) {
      const pos = item.partOfSpeech || 'unknown';
      posCounts[pos] = (posCounts[pos] || 0) + 1;
      if (!sampleItems[pos]) sampleItems[pos] = item;
    }
  }

  console.log('Parts of speech in vocabulary:');
  for (const [pos, count] of Object.entries(posCounts).sort((a, b) => b[1] - a[1])) {
    const sample = sampleItems[pos];
    console.log(`  ${pos}: ${count} items (e.g., '${sample?.german}' - '${sample?.bulgarian}')`);
  }
}

main();
