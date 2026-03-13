#!/usr/bin/env tsx
/**
 * Verify Chunked Vocabulary Data
 *
 * Validates that chunk files are consistent and complete.
 */

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { UnifiedVocabularyItemSchema } from '../src/lib/schemas/unified-vocabulary.js';
import { VocabularyIndexSchema, CEFR_LEVELS, type CEFRLevel } from '../src/lib/schemas/vocabulary-index.js';

interface VerifyConfig {
  vocabDir: string;
}

interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalInIndex: number;
    totalInChunks: number;
    indexSize: number;
    chunkSizes: Record<CEFRLevel, number>;
    itemCounts: Record<CEFRLevel, number>;
  };
}

/**
 * Load and validate the index file
 */
async function loadAndValidateIndex(vocabDir: string): Promise<{
  index: ReturnType<typeof VocabularyIndexSchema.parse>;
  size: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const content = await fs.readFile(path.join(vocabDir, 'index.json'), 'utf-8');
    const size = Buffer.byteLength(content, 'utf-8');
    const data = JSON.parse(content);

    try {
      const index = VocabularyIndexSchema.parse(data);
      return { index, size, errors };
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.push(`Index validation failed: ${e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`);
      } else {
        errors.push(`Index validation failed: ${e}`);
      }
      throw new Error(errors.join('; '));
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      errors.push('Index file not found: index.json');
    } else {
      errors.push(`Failed to load index: ${error}`);
    }
    throw new Error(errors.join('; '));
  }
}

/**
 * Load and validate a chunk file
 */
async function loadAndValidateChunk(
  vocabDir: string,
  level: CEFRLevel
): Promise<{
  items: ReturnType<typeof UnifiedVocabularyItemSchema.parse>[];
  size: number;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const chunkPath = path.join(vocabDir, `${level}.json`);

  try {
    const content = await fs.readFile(chunkPath, 'utf-8');
    const size = Buffer.byteLength(content, 'utf-8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      errors.push(`${level}.json is not an array`);
      return { items: [], size, errors, warnings };
    }

    const items: ReturnType<typeof UnifiedVocabularyItemSchema.parse>[] = [];
    const invalidIndices: number[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const item = UnifiedVocabularyItemSchema.parse(data[i]);

        // Check cefrLevel matches chunk
        const itemLevel = item.cefrLevel || 'A1';
        if (itemLevel !== level) {
          warnings.push(`${level}[${i}]: Item has cefrLevel=${itemLevel} but in ${level} chunk`);
        }

        items.push(item);
      } catch (e) {
        invalidIndices.push(i);
        if (invalidIndices.length <= 3) {
          if (e instanceof z.ZodError) {
            errors.push(`${level}[${i}]: ${e.errors[0]?.message || 'Validation failed'}`);
          } else {
            errors.push(`${level}[${i}]: ${e}`);
          }
        }
      }
    }

    if (invalidIndices.length > 3) {
      errors.push(`${level}: ${invalidIndices.length} additional items failed validation`);
    }

    // Check for duplicate IDs within chunk
    const seenIds = new Set<string>();
    const duplicateIds: string[] = [];

    for (const item of items) {
      if (seenIds.has(item.id)) {
        duplicateIds.push(item.id);
      }
      seenIds.add(item.id);
    }

    if (duplicateIds.length > 0) {
      errors.push(`${level}: Found ${duplicateIds.length} duplicate IDs: ${duplicateIds.slice(0, 3).join(', ')}${duplicateIds.length > 3 ? '...' : ''}`);
    }

    return { items, size, errors, warnings };

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      errors.push(`${level}.json not found`);
    } else {
      errors.push(`Failed to load ${level}.json: ${error}`);
    }
    return { items: [], size: 0, errors, warnings };
  }
}

/**
 * Main verification function
 */
async function verifyChunks(config: VerifyConfig): Promise<VerificationResult> {
  console.log('\n=== Verifying Chunked Vocabulary ===\n');

  const result: VerificationResult = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      totalInIndex: 0,
      totalInChunks: 0,
      indexSize: 0,
      chunkSizes: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 },
      itemCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 }
    }
  };

  // Verify index
  console.log('Checking index.json...');
  let index: ReturnType<typeof VocabularyIndexSchema.parse>;

  try {
    const indexResult = await loadAndValidateIndex(config.vocabDir);
    index = indexResult.index;
    result.stats.indexSize = indexResult.size;
    result.stats.totalInIndex = index.totalItems;
    result.errors.push(...indexResult.errors);
    console.log(`  ✓ Index valid: ${index.totalItems} items (${(indexResult.size / 1024).toFixed(1)}KB)`);
  } catch (e) {
    result.errors.push(String(e));
    result.valid = false;
    console.log(`  ✗ Index invalid: ${e}`);
    return result;
  }

  // Verify chunks
  console.log('\nChecking level chunks...');

  const allChunkIds = new Set<string>();
  const duplicateAcrossChunks: string[] = [];

  for (const level of CEFR_LEVELS) {
    const chunkResult = await loadAndValidateChunk(config.vocabDir, level);

    result.stats.chunkSizes[level] = chunkResult.size;
    result.stats.itemCounts[level] = chunkResult.items.length;
    result.stats.totalInChunks += chunkResult.items.length;
    result.errors.push(...chunkResult.errors);
    result.warnings.push(...chunkResult.warnings);

    // Check for duplicates across chunks
    for (const item of chunkResult.items) {
      if (allChunkIds.has(item.id)) {
        duplicateAcrossChunks.push(`${item.id} (${level})`);
      }
      allChunkIds.add(item.id);
    }

    if (chunkResult.errors.length === 0) {
      console.log(`  ✓ ${level}.json: ${chunkResult.items.length} items (${(chunkResult.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`  ✗ ${level}.json: ${chunkResult.errors.length} errors`);
      result.valid = false;
    }

    // Compare with index
    const indexCount = index.levels[level].count;
    if (chunkResult.items.length !== indexCount) {
      result.errors.push(`${level}: Count mismatch - index says ${indexCount}, chunk has ${chunkResult.items.length}`);
      result.valid = false;
    }
  }

  if (duplicateAcrossChunks.length > 0) {
    result.errors.push(`Found ${duplicateAcrossChunks.length} duplicate IDs across chunks: ${duplicateAcrossChunks.slice(0, 3).join(', ')}${duplicateAcrossChunks.length > 3 ? '...' : ''}`);
    result.valid = false;
  }

  // Verify total counts
  console.log('\nVerifying totals...');

  if (result.stats.totalInIndex !== result.stats.totalInChunks) {
    result.errors.push(`Total count mismatch: index has ${result.stats.totalInIndex}, chunks have ${result.stats.totalInChunks}`);
    result.valid = false;
    console.log(`  ✗ Total mismatch: ${result.stats.totalInIndex} (index) vs ${result.stats.totalInChunks} (chunks)`);
  } else {
    console.log(`  ✓ Totals match: ${result.stats.totalInIndex} items`);
  }

  // Verify search index exists
  console.log('\nChecking search index...');
  try {
    const searchIndexContent = await fs.readFile(path.join(config.vocabDir, 'search-index.json'), 'utf-8');
    const searchIndexSize = Buffer.byteLength(searchIndexContent, 'utf-8');
    const searchIndex = JSON.parse(searchIndexContent);

    if (searchIndex.totalItems !== result.stats.totalInIndex) {
      result.warnings.push(`Search index has ${searchIndex.totalItems} items, but index has ${result.stats.totalInIndex}`);
    }

    console.log(`  ✓ search-index.json: ${searchIndex.totalItems} items (${(searchIndexSize / 1024).toFixed(1)}KB)`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      result.warnings.push('search-index.json not found (run build-search-index)');
      console.log('  ⚠ search-index.json not found');
    } else {
      result.errors.push(`Failed to load search-index.json: ${error}`);
      result.valid = false;
      console.log(`  ✗ search-index.json error: ${error}`);
    }
  }

  return result;
}

/**
 * Print verification report
 */
function printReport(result: VerificationResult): void {
  console.log('\n=== Verification Report ===\n');

  if (result.warnings.length > 0) {
    console.log(`Warnings (${result.warnings.length}):`);
    result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
    console.log('');
  }

  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    result.errors.forEach(e => console.log(`  ✗ ${e}`));
    console.log('');
  }

  console.log('Statistics:');
  console.log(`  Total items: ${result.stats.totalInChunks}`);
  console.log(`  Index size: ${(result.stats.indexSize / 1024).toFixed(1)}KB`);
  console.log(`  Total chunk size: ${(Object.values(result.stats.chunkSizes).reduce((a, b) => a + b, 0) / 1024).toFixed(1)}KB`);
  console.log('  By level:');
  CEFR_LEVELS.forEach(level => {
    console.log(`    ${level}: ${result.stats.itemCounts[level]} items (${(result.stats.chunkSizes[level] / 1024).toFixed(1)}KB)`);
  });

  console.log('');

  if (result.valid) {
    console.log('✅ All checks passed!\n');
  } else {
    console.log('❌ Verification failed\n');
  }
}

// CLI entry point
const config: VerifyConfig = {
  vocabDir: process.argv[2] || 'data/vocabulary'
};

verifyChunks(config)
  .then(result => {
    printReport(result);
    process.exit(result.valid ? 0 : 1);
  })
  .catch(error => {
    console.error('\nVerification error:', error);
    process.exit(1);
  });
