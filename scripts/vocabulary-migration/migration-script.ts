#!/usr/bin/env node
/**
 * Vocabulary Migration Script
 *
 * Executes the complete migration process to unify all vocabulary data
 * into the new unified schema format
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { UnifiedVocabularyItem, UnifiedVocabularyCollection } from '../../src/lib/schemas/unified-vocabulary.js';
import {
  mergeVocabularyItems,
  convertToUnifiedItem,
  createVocabularyCollection
} from './merging-utils.js';
import { validateAndFixCollection } from './validation-utils.js';
import { consolidateCollectionCategories } from './category-utils.js';
import { findDuplicateGroups, mergeDuplicateGroup } from './deduplication-utils.js';
import type { ProcessingVocabularyItem } from '../types/vocabulary-types.js';

// Configuration
const CONFIG = {
  inputFiles: {
    current: 'src/lib/data/vocabulary.json',
    legacy: [
      '_legacy_archive/data/archive-data-cleanup/vocabulary-fixed.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-merged.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-2-numbers-verbs.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-2b-tens-verbs.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-2c-hundreds-verbs-essential.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-3a-questions-verbs.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-3b-verbs.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-3c-food-adjectives.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-4a-question-words.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-4b-food-vegetables.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-5a-colors.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-5b-adjectives-size-quality.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-5c-verbs-daily.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-6a-days-time.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-6b-months.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-6c-household.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-7a-family.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-7b-body.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-7c-pronouns.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-8-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-9-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-10-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-11-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-12-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-13-comprehensive.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-14-final.json',
      '_legacy_archive/data/archive-data-cleanup/vocabulary-batch-15-final57.json'
    ]
  },
  output: {
    unified: 'src/lib/data/unified-vocabulary.json',
    backup: 'data/backups/vocabulary-backup-{{timestamp}}.json',
    reports: 'reports/migration-reports'
  },
  collection: {
    name: 'German-Bulgarian Vocabulary',
    description: 'Comprehensive German-Bulgarian vocabulary collection with unified schema'
  }
};

/**
 * Load JSON data from file
 */
async function loadJsonFile(filePath: string): Promise<any> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Could not load file ${filePath}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Load all vocabulary data from input files
 */
async function loadAllVocabularyData(): Promise<Array<ProcessingVocabularyItem | any>> {
  console.log('📚 Loading vocabulary data...');

  const allItems: Array<ProcessingVocabularyItem | any> = [];

  // Load current vocabulary
  const currentData = await loadJsonFile(CONFIG.inputFiles.current);
  if (currentData) {
    const items = Array.isArray(currentData) ? currentData : [currentData];
    allItems.push(...items);
    console.log(`   ✅ Loaded ${items.length} items from ${CONFIG.inputFiles.current}`);
  }

  // Load legacy vocabulary files
  for (const legacyFile of CONFIG.inputFiles.legacy) {
    const legacyData = await loadJsonFile(legacyFile);
    if (legacyData) {
      const items = Array.isArray(legacyData) ? legacyData : [legacyData];
      allItems.push(...items);
      console.log(`   ✅ Loaded ${items.length} items from ${legacyFile}`);
    }
  }

  console.log(`   📊 Total items loaded: ${allItems.length}`);
  return allItems;
}

/**
 * Create backup of current vocabulary
 */
async function createBackup(): Promise<void> {
  console.log('💾 Creating backup...');

  try {
    const currentData = await loadJsonFile(CONFIG.inputFiles.current);
    if (!currentData) {
      console.warn('   ⚠️  No current vocabulary data found to backup');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = CONFIG.output.backup.replace('{{timestamp}}', timestamp);
    const backupDir = path.dirname(backupPath);

    // Create backup directory if it doesn't exist
    await mkdir(backupDir, { recursive: true });

    // Save backup
    await writeFile(backupPath, JSON.stringify(currentData, null, 2));
    console.log(`   ✅ Backup created: ${backupPath}`);
  } catch (error) {
    console.error('   ❌ Failed to create backup:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Execute the full migration process
 */
async function executeMigration(): Promise<void> {
  console.log('🚀 Starting vocabulary migration...');

  try {
    // Step 1: Create backup
    await createBackup();

    // Step 2: Load all vocabulary data
    const allItems = await loadAllVocabularyData();
    if (allItems.length === 0) {
      throw new Error('No vocabulary data loaded. Migration aborted.');
    }

    // Step 3: Convert all items to unified format
    console.log('\n🔄 Converting items to unified format...');
    const unifiedItems = allItems.map(convertToUnifiedItem);
    console.log(`   ✅ Converted ${unifiedItems.length} items to unified format`);

    // Step 4: Consolidate categories
    console.log('\n🏷️  Consolidating categories...');
    const categoryResult = consolidateCollectionCategories(unifiedItems);
    console.log(`   ✅ Consolidated categories for ${categoryResult.items.length} items`);
    console.log(`   📋 Categories found: ${categoryResult.allCategories.length}`);

    // Update items with consolidated categories
    const itemsWithConsolidatedCategories = unifiedItems.map(item => {
      const consolidatedItem = categoryResult.items.find(catItem => catItem.id === item.id);
      if (consolidatedItem) {
        return { ...item, categories: consolidatedItem.categories };
      }
      return item;
    });

    // Step 5: Deduplicate items
    console.log('\n🔍 Identifying and merging duplicates...');
    // Use more conservative deduplication settings
    const deduplicationConfig = {
      similarityThreshold: 0.95,  // More strict similarity threshold
      maxLevenshteinDistance: 2,  // More strict Levenshtein distance
      considerGrammaticalForms: false,  // Disable grammatical form consideration
      considerWordOrder: true,
      minExamplesForQuality: 2,
      minNotesLengthForQuality: 50
    };
    const duplicateGroups = findDuplicateGroups(unifiedItems, deduplicationConfig);
    console.log(`   📊 Found ${duplicateGroups.length} duplicate groups`);

    const deduplicatedItems = itemsWithConsolidatedCategories.filter(item => {
      return !duplicateGroups.some(group =>
        group.items.some(groupItem => groupItem.id === item.id)
      );
    });

    const mergedItems = duplicateGroups.map(group => mergeDuplicateGroup(group, deduplicationConfig));
    const allMergedItems = [...deduplicatedItems, ...mergedItems];
    console.log(`   ✅ After deduplication: ${allMergedItems.length} items`);

    // Step 6: Create vocabulary collection
    console.log('\n📚 Creating vocabulary collection...');
    const collection = createVocabularyCollection(
      allMergedItems,
      CONFIG.collection.name,
      CONFIG.collection.description
    );

    // Update collection with consolidated categories
    collection.categories = categoryResult.allCategories;
    console.log(`   ✅ Collection created with ${collection.itemCount} items`);

    // Step 7: Validate and fix collection
    console.log('\n✅ Validating and fixing collection...');
    const { validationResult, fixedCollection, report } = validateAndFixCollection(collection);

    console.log(`   📊 Validation results:`);
    console.log(`      Valid: ${validationResult.isValid}`);
    console.log(`      Issues: ${validationResult.issues.length}`);
    console.log(`      Warnings: ${validationResult.warnings.length}`);
    console.log(`      Final item count: ${fixedCollection.itemCount}`);

    // Step 8: Save results
    console.log('\n💾 Saving results...');

    // Create output directories
    await mkdir(CONFIG.output.reports, { recursive: true });

    // Save unified vocabulary
    const outputDir = path.dirname(CONFIG.output.unified);
    await mkdir(outputDir, { recursive: true });
    await writeFile(CONFIG.output.unified, JSON.stringify(fixedCollection, null, 2));
    console.log(`   ✅ Unified vocabulary saved to ${CONFIG.output.unified}`);

    // Save validation report
    const reportPath = path.join(CONFIG.output.reports, 'migration-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`   ✅ Migration report saved to ${reportPath}`);

    // Save statistics
    const statsPath = path.join(CONFIG.output.reports, 'migration-statistics.json');
    const stats = {
      originalItemCount: allItems.length,
      unifiedItemCount: unifiedItems.length,
      afterDeduplication: allMergedItems.length,
      finalItemCount: fixedCollection.itemCount,
      duplicateGroups: duplicateGroups.length,
      categories: fixedCollection.categories.length,
      difficultyRange: fixedCollection.difficultyRange,
      timestamp: new Date().toISOString()
    };
    await writeFile(statsPath, JSON.stringify(stats, null, 2));
    console.log(`   ✅ Migration statistics saved to ${statsPath}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log(`   📊 Summary:`);
    console.log(`      Original items: ${allItems.length}`);
    console.log(`      Final items: ${fixedCollection.itemCount}`);
    console.log(`      Categories: ${fixedCollection.categories.length}`);
    console.log(`      Difficulty range: ${fixedCollection.difficultyRange[0]} - ${fixedCollection.difficultyRange[1]}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Execute the migration
executeMigration().catch(error => {
  console.error('Migration process failed:', error);
  process.exit(1);
});