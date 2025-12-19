#!/usr/bin/env node

/**
 * Migration Script: Backup → Production Schema
 * 
 * Purpose: Transform vocabulary-backup-2025-12-03.json into production schema
 * Input: data/vocabulary-backup-2025-12-03.json (914 items, wrapped structure)
 * Output: data/vocab/migrated-backup.json (array format, production schema)
 * 
 * Schema Mapping:
 *   backup.id → production.id (preserved)
 *   backup.german → production.german
 *   backup.bulgarian → production.bulgarian
 *   backup.partOfSpeech → production.partOfSpeech
 *   backup.difficulty (1-5) → production.cefr (A1-B2)
 *   backup.metadata.notes → production.definitions.german
 *   backup.metadata.examples → production.examples
 *   backup.categories → production.categories + tags
 *   NEW: culturalNotes (empty array)
 *   NEW: grammar (empty object)
 *   NEW: definitions.bulgarian (auto-generated from notes)
 *   NEW: lastModified (current timestamp)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Zod schema for validation
const isValidItem = (item) => {
  return (
    item.id &&
    item.german &&
    item.bulgarian &&
    item.partOfSpeech &&
    item.cefr &&
    typeof item.definitions === 'object' &&
    Array.isArray(item.examples) &&
    Array.isArray(item.categories) &&
    typeof item.grammar === 'object' &&
    Array.isArray(item.culturalNotes) &&
    Array.isArray(item.tags) &&
    item.lastModified
  );
};

// Difficulty to CEFR mapping
const difficultyToCefr = (difficulty) => {
  const mapping = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'C1'
  };
  return mapping[difficulty] || 'A1';
};

// Transform single item from backup to production schema
const transformItem = (backupItem) => {
  const cefr = difficultyToCefr(backupItem.difficulty || 1);
  const metadata = backupItem.metadata || {};
  const notes = metadata.notes || '';
  
  // Transform examples
  const examples = (metadata.examples || []).map(ex => ({
    german: ex.german || '',
    bulgarian: ex.bulgarian || '',
    context: ex.context || 'neutral'
  }));
  
  // Create production item
  return {
    id: backupItem.id,
    german: backupItem.german,
    bulgarian: backupItem.bulgarian,
    partOfSpeech: backupItem.partOfSpeech,
    cefr: cefr,
    definitions: {
      german: notes || `${backupItem.german} (${backupItem.partOfSpeech})`,
      bulgarian: `${backupItem.bulgarian} (${backupItem.partOfSpeech})`
    },
    examples: examples.length > 0 ? examples : [
      {
        german: `Example with ${backupItem.german}`,
        bulgarian: `Пример с ${backupItem.bulgarian}`,
        context: 'neutral'
      }
    ],
    categories: backupItem.categories || [],
    grammar: {},
    culturalNotes: [],
    tags: [cefr, ...(backupItem.categories || [])],
    lastModified: new Date().toISOString()
  };
};

// Main migration function
async function migrateBackup() {
  console.log('\n🔄 MIGRATION: Backup → Production Schema');
  console.log('=' .repeat(50));
  
  try {
    // 1. Load backup file
    console.log('\n📂 Loading backup file...');
    const backupPath = path.join(PROJECT_ROOT, 'data', 'vocabulary-backup-2025-12-03.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const backupItems = backupData.items || [];
    console.log(`   ✅ Loaded ${backupItems.length} items from backup`);
    
    // 2. Transform items
    console.log('\n🔀 Transforming items to production schema...');
    let successCount = 0;
    let errorCount = 0;
    const transformedItems = [];
    
    backupItems.forEach((item, index) => {
      try {
        const transformed = transformItem(item);
        
        // Validate transformed item
        if (!isValidItem(transformed)) {
          throw new Error(`Invalid schema for item ${item.id}`);
        }
        
        transformedItems.push(transformed);
        successCount++;
        
        // Progress indicator
        if ((index + 1) % 100 === 0) {
          console.log(`   Processing: ${index + 1}/${backupItems.length}`);
        }
      } catch (error) {
        console.error(`   ❌ Error transforming item ${item.id}:`, error.message);
        errorCount++;
      }
    });
    
    console.log(`   ✅ Transformed ${successCount} items`);
    if (errorCount > 0) console.log(`   ⚠️  ${errorCount} errors`);
    
    // 3. Save to file
    console.log('\n💾 Saving transformed data...');
    const outputDir = path.join(PROJECT_ROOT, 'data', 'vocab');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`   📁 Created directory: ${outputDir}`);
    }
    
    const outputPath = path.join(outputDir, 'migrated-backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(transformedItems, null, 2), 'utf8');
    console.log(`   ✅ Saved to: data/vocab/migrated-backup.json`);
    console.log(`   📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    // 4. Verification
    console.log('\n✅ VERIFICATION');
    console.log('   Array format:', Array.isArray(transformedItems) ? '✅' : '❌');
    console.log('   Item count:', transformedItems.length);
    console.log('   First item ID:', transformedItems[0].id);
    console.log('   First item schema check:', isValidItem(transformedItems[0]) ? '✅' : '❌');
    
    // Sample items
    console.log('\n📋 SAMPLE TRANSFORMED ITEMS:');
    console.log('   Item 1:', transformedItems[0].german, '↔', transformedItems[0].bulgarian, `(${transformedItems[0].cefr})`);
    console.log('   Item 2:', transformedItems[1].german, '↔', transformedItems[1].bulgarian, `(${transformedItems[1].cefr})`);
    console.log('   Item 100:', transformedItems[99].german, '↔', transformedItems[99].bulgarian, `(${transformedItems[99].cefr})`);
    
    console.log('\n🎉 MIGRATION COMPLETE');
    console.log('   Ready for merge with: node scripts/merge-manual-vocabulary.mjs data/vocab/migrated-backup.json');
    console.log('=' .repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateBackup();
