#!/usr/bin/env tsx
/**
 * Build Pre-computed Search Index
 *
 * Generates a serialized Fuse.js index for instant client-side search.
 */

import fs from 'fs/promises';
import path from 'path';
import Fuse from 'fuse.js';
import { z } from 'zod';
import { UnifiedVocabularyItemSchema, type UnifiedVocabularyItem } from '../src/lib/schemas/unified-vocabulary.js';

// CEFR levels in order
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
type CEFRLevel = typeof CEFR_LEVELS[number];

interface SearchIndexConfig {
  vocabDir: string;
  outputDir: string;
  staticDir: string;
}

/**
 * Load all vocabulary chunks
 */
async function loadAllChunks(vocabDir: string): Promise<{
  items: UnifiedVocabularyItem[];
  idToLevelMap: Record<string, CEFRLevel>;
}> {
  const items: UnifiedVocabularyItem[] = [];
  const idToLevelMap: Record<string, CEFRLevel> = {};

  console.log('Loading vocabulary chunks...');

  for (const level of CEFR_LEVELS) {
    const chunkPath = path.join(vocabDir, `${level}.json`);

    try {
      const content = await fs.readFile(chunkPath, 'utf-8');
      const data = JSON.parse(content);

      if (!Array.isArray(data)) {
        throw new Error(`Invalid chunk format: ${level}.json is not an array`);
      }

      // Validate items
      const validItems = data.map((item, index) => {
        try {
          return UnifiedVocabularyItemSchema.parse(item);
        } catch (e) {
          console.warn(`  Warning: Invalid item at ${level}[${index}]:`, e);
          return null;
        }
      }).filter((item): item is UnifiedVocabularyItem => item !== null);

      items.push(...validItems);

      // Build ID to level mapping
      for (const item of validItems) {
        idToLevelMap[item.id] = level;
      }

      console.log(`  ${level}: ${validItems.length} items`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`  ${level}: Chunk file not found, skipping`);
      } else {
        throw error;
      }
    }
  }

  console.log(`Total loaded: ${items.length} items\n`);

  return { items, idToLevelMap };
}

/**
 * Build Fuse.js index
 */
function buildFuseIndex(items: UnifiedVocabularyItem[]): Fuse<UnifiedVocabularyItem> {
  console.log('Building Fuse.js index...');

  // Configure Fuse for optimal search results
  const fuse = new Fuse(items, {
    keys: [
      { name: 'german', weight: 0.4 },
      { name: 'bulgarian', weight: 0.4 },
      { name: 'transliteration.german', weight: 0.2 },
      { name: 'transliteration.bulgarian', weight: 0.2 },
      { name: 'categories', weight: 0.15 },
      { name: 'tags', weight: 0.1 },
      { name: 'examples.german', weight: 0.1 },
      { name: 'examples.bulgarian', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    ignoreLocation: true,
    shouldSort: true
  });

  console.log('Index built successfully\n');
  return fuse;
}

/**
 * Create mini-index for fast previews
 */
function createMiniIndex(items: UnifiedVocabularyItem[]): Array<{
  id: string;
  german: string;
  bulgarian: string;
  cefrLevel: string;
  partOfSpeech: string;
  categories: string[];
}> {
  return items.map(item => ({
    id: item.id,
    german: item.german,
    bulgarian: item.bulgarian,
    cefrLevel: item.cefrLevel || 'A1',
    partOfSpeech: item.partOfSpeech,
    categories: item.categories
  }));
}

/**
 * Main build function
 */
async function buildSearchIndex(config: SearchIndexConfig): Promise<void> {
  console.log('\n=== Building Search Index ===\n');

  // Ensure output directories exist
  await fs.mkdir(config.outputDir, { recursive: true });
  await fs.mkdir(config.staticDir, { recursive: true });

  // Load all chunks
  const { items, idToLevelMap } = await loadAllChunks(config.vocabDir);

  if (items.length === 0) {
    throw new Error('No vocabulary items found in chunks');
  }

  // Build Fuse index
  const fuse = buildFuseIndex(items);

  // Get the internal Fuse index
  const fuseIndex = fuse.getIndex();

  // Create mini-index for fast results
  const miniIndex = createMiniIndex(items);

  // Get the serialized index (toJSON returns { keys, records })
  const serializedIndex = fuseIndex.toJSON();

  // Build output - store keys and records separately for Fuse.parseIndex()
  const searchIndexData = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    fuseOptions: {
      keys: [
        { name: 'german', weight: 0.4 },
        { name: 'bulgarian', weight: 0.4 },
        { name: 'transliteration.german', weight: 0.2 },
        { name: 'transliteration.bulgarian', weight: 0.2 },
        { name: 'categories', weight: 0.15 },
        { name: 'tags', weight: 0.1 },
        { name: 'examples.german', weight: 0.1 },
        { name: 'examples.bulgarian', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    },
    // Serialized Fuse index - { keys, records } format for Fuse.parseIndex()
    index: {
      keys: serializedIndex.keys,
      records: serializedIndex.records
    },
    // ID to level mapping for chunk loading
    idToLevelMap,
    // Mini-index for fast preview results
    miniIndex
  };

  // Validate the index can be serialized
  const content = JSON.stringify(searchIndexData);
  const size = Buffer.byteLength(content, 'utf-8');

  // Write index file
  await fs.writeFile(
    path.join(config.outputDir, 'search-index.json'),
    JSON.stringify(searchIndexData, null, 2)
  );

  // Write to static directory
  await fs.writeFile(
    path.join(config.staticDir, 'search-index.json'),
    JSON.stringify(searchIndexData, null, 2)
  );

  // Summary
  console.log('=== Search Index Complete ===\n');
  console.log(`Items indexed: ${items.length}`);
  console.log(`Index size: ${(size / 1024).toFixed(1)}KB`);
  console.log(`Mini-index size: ${(JSON.stringify(miniIndex).length / 1024).toFixed(1)}KB\n`);

  console.log('Files created:');
  console.log(`  ${config.outputDir}/search-index.json`);
  console.log(`  ${config.staticDir}/search-index.json\n`);

  // Test the index
  console.log('Testing index...');
  const testQuery = 'Haus';
  const results = fuse.search(testQuery, { limit: 5 });
  console.log(`  Search "${testQuery}": ${results.length} results`);
  results.slice(0, 3).forEach((r, i) => {
    console.log(`    ${i + 1}. "${r.item.german}" → "${r.item.bulgarian}" (score: ${r.score?.toFixed(3)})`);
  });
  console.log('');
}

// CLI entry point
const config: SearchIndexConfig = {
  vocabDir: process.argv[2] || 'data/vocabulary',
  outputDir: 'data/vocabulary',
  staticDir: 'static/data/vocabulary'
};

buildSearchIndex(config).catch(error => {
  console.error('\nBuild failed:', error);
  process.exit(1);
});
