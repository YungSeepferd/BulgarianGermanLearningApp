#!/usr/bin/env tsx
/**
 * Vocabulary Chunking Migration Script
 *
 * Splits unified-vocabulary.json into CEFR-level chunks and generates index.
 */

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import {
  UnifiedVocabularyItemSchema,
  type UnifiedVocabularyItem
} from '../src/lib/schemas/unified-vocabulary.js';
import {
  VocabularyIndexSchema,
  createIndexItem,
  calculateStatistics,
  groupByLevel,
  CEFR_LEVELS,
  type CEFRLevel,
  type VocabularyIndex
} from '../src/lib/schemas/vocabulary-index.js';

interface ChunkConfig {
  sourceFile: string;
  outputDir: string;
  staticDir: string;
}

/**
 * Load and validate source vocabulary data
 */
async function loadSourceData(filePath: string): Promise<UnifiedVocabularyItem[]> {
  console.log(`Loading source data from ${filePath}...`);

  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);

  // Handle both array and object with items property
  const rawItems = Array.isArray(data) ? data : data.items;

  if (!Array.isArray(rawItems)) {
    throw new Error('Invalid source data: expected array or object with items property');
  }

  console.log(`Parsing ${rawItems.length} items...`);

  // Validate and normalize - use resilient parsing to skip invalid items
  const items: UnifiedVocabularyItem[] = [];
  const errors: { index: number; error: unknown }[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    try {
      const parsed = UnifiedVocabularyItemSchema.parse(rawItems[i]);
      items.push(parsed);
    } catch (e) {
      errors.push({ index: i, error: e });
      // Log first few errors
      if (errors.length <= 5) {
        console.warn(`  Warning: Item at index ${i} failed validation:`, e);
      }
    }
  }

  if (errors.length > 0) {
    console.warn(`  ${errors.length} items failed validation and were skipped`);
  }

  console.log(`Successfully parsed ${items.length} valid items`);
  return items;
}

/**
 * Group full items by CEFR level
 */
function groupItemsByLevel(items: UnifiedVocabularyItem[]): Record<CEFRLevel, UnifiedVocabularyItem[]> {
  const grouped: Record<CEFRLevel, UnifiedVocabularyItem[]> = {
    A1: [], A2: [], B1: [], B2: [], C1: []
  };

  for (const item of items) {
    // Handle missing or invalid cefrLevel
    let level = (item.cefrLevel || 'A1') as CEFRLevel;

    // Validate level
    if (!CEFR_LEVELS.includes(level)) {
      // Try to infer from difficulty
      if (item.difficulty === 1) level = 'A1';
      else if (item.difficulty === 2) level = 'A2';
      else if (item.difficulty === 3) level = 'B1';
      else if (item.difficulty === 4) level = 'B2';
      else level = 'C1';
    }

    grouped[level].push(item);
  }

  return grouped;
}

/**
 * Calculate detailed statistics for a level
 */
function calculateLevelStats(
  items: UnifiedVocabularyItem[],
  level: CEFRLevel
): VocabularyIndex['levels'][typeof level] {
  const byCategory: Record<string, number> = {};
  const byPartOfSpeech: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  for (const item of items) {
    // Categories
    for (const cat of item.categories) {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    // Part of speech
    byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;

    // Difficulty
    byDifficulty[String(item.difficulty)] = (byDifficulty[String(item.difficulty)] || 0) + 1;
  }

  return {
    count: items.length,
    chunkSize: 0, // Will be updated after writing
    chunkPath: `./${level}.json`,
    byCategory,
    byPartOfSpeech,
    byDifficulty
  };
}

/**
 * Write chunk file and return size
 */
async function writeChunk(
  items: UnifiedVocabularyItem[],
  level: CEFRLevel,
  outputDir: string,
  staticDir: string
): Promise<number> {
  const filename = `${level}.json`;
  const content = JSON.stringify(items, null, 2);
  const size = Buffer.byteLength(content, 'utf-8');

  // Write to data directory
  await fs.writeFile(path.join(outputDir, filename), content);

  // Write to static directory for runtime access
  await fs.writeFile(path.join(staticDir, filename), content);

  return size;
}

/**
 * Main migration function
 */
async function migrate(config: ChunkConfig): Promise<void> {
  console.log('\n=== Vocabulary Chunking Migration ===\n');

  // Ensure output directories exist
  await fs.mkdir(config.outputDir, { recursive: true });
  await fs.mkdir(config.staticDir, { recursive: true });

  // Load source data
  const items = await loadSourceData(config.sourceFile);

  if (items.length === 0) {
    throw new Error('No valid vocabulary items found');
  }

  // Group by CEFR level
  const grouped = groupItemsByLevel(items);

  // Calculate level statistics
  const levelStats: VocabularyIndex['levels'] = {
    A1: calculateLevelStats(grouped.A1, 'A1'),
    A2: calculateLevelStats(grouped.A2, 'A2'),
    B1: calculateLevelStats(grouped.B1, 'B1'),
    B2: calculateLevelStats(grouped.B2, 'B2'),
    C1: calculateLevelStats(grouped.C1, 'C1')
  };

  // Write chunk files
  console.log('\nWriting level chunks...');
  for (const level of CEFR_LEVELS) {
    const levelItems = grouped[level];
    const size = await writeChunk(levelItems, level, config.outputDir, config.staticDir);
    levelStats[level].chunkSize = size;

    console.log(`  ${level}: ${levelItems.length} items (${(size / 1024).toFixed(1)}KB)`);
  }

  // Create index items
  const indexItems = items.map(createIndexItem);

  // Calculate global statistics
  const globalStats = {
    byCategory: {} as Record<string, number>,
    byPartOfSpeech: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byLevel: {} as Record<string, number>
  };

  // Aggregate from level stats
  for (const level of CEFR_LEVELS) {
    globalStats.byLevel[level] = levelStats[level].count;

    for (const [cat, count] of Object.entries(levelStats[level].byCategory)) {
      globalStats.byCategory[cat] = (globalStats.byCategory[cat] || 0) + count;
    }

    for (const [pos, count] of Object.entries(levelStats[level].byPartOfSpeech)) {
      globalStats.byPartOfSpeech[pos] = (globalStats.byPartOfSpeech[pos] || 0) + count;
    }

    for (const [diff, count] of Object.entries(levelStats[level].byDifficulty)) {
      globalStats.byDifficulty[diff] = (globalStats.byDifficulty[diff] || 0) + count;
    }
  }

  // Generate master index
  const indexData: VocabularyIndex = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    totalItems: items.length,
    levels: levelStats,
    items: indexItems,
    statistics: globalStats
  };

  // Validate index
  VocabularyIndexSchema.parse(indexData);

  // Write index files
  const indexContent = JSON.stringify(indexData, null, 2);
  const indexSize = Buffer.byteLength(indexContent, 'utf-8');

  await fs.writeFile(path.join(config.outputDir, 'index.json'), indexContent);
  await fs.writeFile(path.join(config.staticDir, 'index.json'), indexContent);

  console.log(`\nIndex written: ${indexItems.length} items (${(indexSize / 1024).toFixed(1)}KB)`);

  // Calculate totals
  const totalChunkSize = Object.values(levelStats).reduce((sum, s) => sum + s.chunkSize, 0);

  // Print summary
  console.log('\n=== Migration Complete ===\n');
  console.log(`Total items: ${items.length}`);
  console.log(`Index size: ${(indexSize / 1024).toFixed(1)}KB`);
  console.log(`Total chunk size: ${(totalChunkSize / 1024).toFixed(1)}KB`);
  console.log(`Original size: ~${(Buffer.byteLength(JSON.stringify(items), 'utf-8') / 1024).toFixed(1)}KB`);
  console.log(`Size reduction: ${(100 - (indexSize + levelStats.A1.chunkSize) / Buffer.byteLength(JSON.stringify(items), 'utf-8') * 100).toFixed(0)}% for initial load\n`);

  console.log('Level distribution:');
  for (const level of CEFR_LEVELS) {
    const stats = levelStats[level];
    console.log(`  ${level}: ${stats.count} items (${(stats.chunkSize / 1024).toFixed(1)}KB)`);
  }

  console.log('\nFiles created:');
  console.log(`  ${config.outputDir}/index.json`);
  console.log(`  ${config.outputDir}/{A1,A2,B1,B2,C1}.json`);
  console.log(`  ${config.staticDir}/index.json (runtime)`);
  console.log(`  ${config.staticDir}/{A1,A2,B1,B2,C1}.json (runtime)\n`);
}

// CLI entry point
const config: ChunkConfig = {
  sourceFile: process.argv[2] || 'data/unified-vocabulary.json',
  outputDir: 'data/vocabulary',
  staticDir: 'static/data/vocabulary'
};

migrate(config).catch(error => {
  console.error('\nMigration failed:', error);
  process.exit(1);
});
