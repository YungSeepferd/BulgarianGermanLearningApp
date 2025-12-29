#!/usr/bin/env node

/**
 * Batch 20 Linguistic Correction
 * Fixes critical issues in entries 951-1000
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch20.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch20.json');

console.log('🔧 Batch 20 Linguistic Correction (Entries 951-1000)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch20 = data.items.slice(950, 1000); // Entries 951-1000

batch20.forEach((entry, index) => {
  const entryNum = 951 + index;
  
  // Note: Entry 985 is actually correct - "Не, благодаря" means "No, thank you"
  if (entryNum === 985 && entry.id === 'wv_pc_7fc9c4f3') {
    console.log(`\nℹ️  Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  German: "${entry.german}"`);
    console.log(`  Bulgarian: "${entry.bulgarian}"`);
    console.log(`  ✅ Note: "Не, благодаря" is correct Bulgarian for "No, thank you"`);
  }
  
  // Fix Entry 980: Remove mixed language content and convert numbers to Cyrillic
  if (entryNum === 980 && entry.id === 'wv_aed8066f') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "нощ"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content and English explanation`);
    correctionsApplied++;
  }
  
  // Fix Entry 991: Remove mixed language content
  if (entryNum === 991 && entry.id === 'wv_pc_6fbb475b') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "девет"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 996: Remove trailing parenthesis
  if (entryNum === 996 && entry.id === 'wv_0f474f93') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = entry.bulgarian.trim().replace(/\s*\)$/, '');
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed trailing parenthesis`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 20 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch20.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 20 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 20 correction process complete!');