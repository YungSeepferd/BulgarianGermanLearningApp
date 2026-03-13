/**
 * Split Vocabulary by CEFR Level
 * 
 * Creates chunked vocabulary files for lazy loading:
 * - A1.json, A2.json, B1.json, B2.json, C1.json
 * - index.json (lightweight metadata index)
 * - search-index.json (pre-computed search index)
 * 
 * Run: npx tsx scripts/split-vocabulary-by-cefr.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'static', 'data', 'vocabulary');
const UNIFIED_FILE = path.join(process.cwd(), 'data', 'unified-vocabulary.json');

// CEFR levels
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
type CEFRLevel = typeof CEFR_LEVELS[number];

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: number;
  categories: string[];
  examples: Array<{
    german: string;
    bulgarian: string;
    context?: string;
    source?: string;
  }>;
  type: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  cefrLevel: string;
  cefrInference?: {
    inferredAt: string;
    difficulty: number;
    method: string;
  };
  tags?: string[];
}

interface LevelStats {
  count: number;
  chunkSize: number;
  chunkPath: string;
  byCategory: Record<string, number>;
  byPartOfSpeech: Record<string, number>;
  byDifficulty: Record<number, number>;
}

interface VocabularyIndex {
  version: number;
  lastUpdated: string;
  totalItems: number;
  levels: Record<CEFRLevel, LevelStats>;
  items: Array<{
    id: string;
    german: string;
    bulgarian: string;
    cefrLevel: string;
    partOfSpeech: string;
    categories: string[];
    difficulty: number;
  }>;
}

interface SearchIndexItem {
  id: string;
  german: string;
  bulgarian: string;
  cefrLevel: string;
  partOfSpeech: string;
  categories: string[];
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function calculateChunkSize(items: VocabularyItem[]): number {
  return JSON.stringify(items).length;
}

function getLevelStats(items: VocabularyItem[]): LevelStats {
  const byCategory: Record<string, number> = {};
  const byPartOfSpeech: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};

  for (const item of items) {
    // Count categories
    for (const cat of item.categories || []) {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
    
    // Count part of speech
    const pos = item.partOfSpeech || 'noun';
    byPartOfSpeech[pos] = (byPartOfSpeech[pos] || 0) + 1;
    
    // Count difficulty
    const diff = item.difficulty || 1;
    byDifficulty[diff] = (byDifficulty[diff] || 0) + 1;
  }

  return {
    count: items.length,
    chunkSize: calculateChunkSize(items),
    chunkPath: '', // Will be set per level
    byCategory,
    byPartOfSpeech,
    byDifficulty
  };
}

async function main() {
  console.log('🔄 Splitting vocabulary by CEFR level...\n');

  // Ensure output directory exists
  ensureDir(DATA_DIR);

  // Load unified vocabulary
  console.log('📂 Loading unified vocabulary...');
  const rawData = fs.readFileSync(UNIFIED_FILE, 'utf-8');
  const vocabulary: VocabularyItem[] = JSON.parse(rawData);
  console.log(`   Loaded ${vocabulary.length} items\n`);

  // Group items by CEFR level
  const itemsByLevel: Record<CEFRLevel, VocabularyItem[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: []
  };

  for (const item of vocabulary) {
    const level = (item.cefrLevel || 'A1') as CEFRLevel;
    if (itemsByLevel[level]) {
      itemsByLevel[level].push(item);
    } else {
      itemsByLevel.A1.push(item); // Default to A1
    }
  }

  // Print distribution
  console.log('📊 CEFR Level Distribution:');
  for (const level of CEFR_LEVELS) {
    const count = itemsByLevel[level].length;
    const size = calculateChunkSize(itemsByLevel[level]);
    console.log(`   ${level}: ${count} items (${(size / 1024).toFixed(1)} KB)`);
  }
  console.log();

  // Write level chunks
  console.log('💾 Writing level chunks...');
  for (const level of CEFR_LEVELS) {
    const items = itemsByLevel[level];
    const filePath = path.join(DATA_DIR, `${level}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    console.log(`   ✓ ${level}.json (${items.length} items)`);
  }

  // Build index
  console.log('\n📋 Building vocabulary index...');
  const indexItems: VocabularyIndex['items'] = [];
  
  for (const item of vocabulary) {
    indexItems.push({
      id: item.id,
      german: item.german,
      bulgarian: item.bulgarian,
      cefrLevel: item.cefrLevel || 'A1',
      partOfSpeech: item.partOfSpeech || 'noun',
      categories: item.categories || [],
      difficulty: item.difficulty || 1
    });
  }

  const index: VocabularyIndex = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    totalItems: vocabulary.length,
    levels: {} as Record<CEFRLevel, LevelStats>,
    items: indexItems
  };

  // Calculate level stats
  for (const level of CEFR_LEVELS) {
    const items = itemsByLevel[level];
    const stats = getLevelStats(items);
    stats.chunkPath = `./${level}.json`;
    index.levels[level] = stats;
  }

  // Write index
  const indexPath = path.join(DATA_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`   ✓ index.json (${(JSON.stringify(index).length / 1024).toFixed(1)} KB)`);

  // Build search index (mini version for fast fuzzy search)
  console.log('\n🔍 Building search index...');
  const searchIndex: SearchIndexItem[] = [];
  const idToLevelMap: Record<string, string> = {};

  for (const item of vocabulary) {
    searchIndex.push({
      id: item.id,
      german: item.german,
      bulgarian: item.bulgarian,
      cefrLevel: item.cefrLevel || 'A1',
      partOfSpeech: item.partOfSpeech || 'noun',
      categories: item.categories || []
    });
    idToLevelMap[item.id] = item.cefrLevel || 'A1';
  }

  // Write search index (simplified - just the mini index, no Fuse data)
  const searchIndexPath = path.join(DATA_DIR, 'search-index.json');
  const searchIndexData = {
    miniIndex: searchIndex,
    idToLevelMap,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndexData, null, 2));
  console.log(`   ✓ search-index.json (${(JSON.stringify(searchIndexData).length / 1024).toFixed(1)} KB)`);

  // Summary
  console.log('\n✅ Split complete!\n');
  console.log('📁 Output files:');
  
  const files = fs.readdirSync(DATA_DIR);
  let totalSize = 0;
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    console.log(`   ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
  }
  
  console.log(`\n📊 Total size: ${(totalSize / 1024).toFixed(1)} KB`);
  console.log(`   (vs original 1.3MB monolithic file)`);
}

main().catch(console.error);