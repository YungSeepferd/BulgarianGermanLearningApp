#!/usr/bin/env node

/**
 * Export Vocabulary to Batch Format
 * 
 * This script creates batch files for validation and enrichment.
 * Usage: pnpm run export:vocabulary:batches --size=10
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BATCH_SIZE = parseInt(process.argv.find(arg => arg.includes('--size='))?.split('=')[1] || '10');
const OUTPUT_DIR = join(process.cwd(), 'enrichment-output', 'batches');

mkdirSync(OUTPUT_DIR, { recursive: true });

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Create output directory if it doesn't exist
mkdirSync(OUTPUT_DIR, { recursive: true });

try {
  // Read vocabulary data
  const vocabData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'unified-vocabulary.json'), 'utf-8'));
  const vocabulary = Array.isArray(vocabData) ? vocabData : vocabData.items || [];

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📦 Exporting Vocabulary Batches`);
  console.log(`Total items: ${vocabulary.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`${'='.repeat(70)}\n`);

  // Create batches
  const batches = {};
  let batchNum = 1;

  for (let i = 0; i < vocabulary.length; i += BATCH_SIZE) {
    const batch = vocabulary.slice(i, Math.min(i + BATCH_SIZE, vocabulary.length));
    const batchId = `batch_${String(batchNum).padStart(3, '0')}`;

    // Create CSV
    const csvHeader = [
      'ID',
      'German',
      'Bulgarian',
      'Part of Speech',
      'Difficulty',
      'Gender',
      'Plural',
      'Examples',
      'Categories',
      'Status',
      'Notes'
    ].join(',');

    const csvRows = batch.map(item => [
      item.id,
      `"${(item.german || '').replace(/"/g, '""')}"`,
      `"${(item.bulgarian || '').replace(/"/g, '""')}"`,
      item.partOfSpeech || '',
      item.difficulty || '',
      item.grammar?.gender || '',
      item.grammar?.plural || '',
      item.examples?.length || 0,
      (item.categories || []).join(';'),
      'unreviewed',
      ''
    ].join(','));

    const csvContent = [csvHeader, ...csvRows].join('\n');
    const csvFile = join(OUTPUT_DIR, `${batchId}.csv`);
    writeFileSync(csvFile, csvContent);

    batches[batchId] = batch;
    console.log(`${GREEN}✅${RESET} Created ${BLUE}${batchId}.csv${RESET} (${batch.length} items)`);

    batchNum++;
  }

  // Create JSON batches file
  const jsonFile = join(OUTPUT_DIR, 'batches.json');
  writeFileSync(jsonFile, JSON.stringify(batches, null, 2));
  console.log(`${GREEN}✅${RESET} Created ${BLUE}batches.json${RESET} (${Object.keys(batches).length} batches)\n`);

  console.log(`${'='.repeat(70)}`);
  console.log(`📊 Summary`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Total batches created: ${Object.keys(batches).length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`CSV files ready for Google Sheets import`);
  console.log(`JSON file ready for programmatic access`);
  console.log(`${'='.repeat(70)}\n`);

} catch (error) {
  console.error('\x1b[31m❌ Error exporting batches:\x1b[0m', error);
  process.exit(1);
}
