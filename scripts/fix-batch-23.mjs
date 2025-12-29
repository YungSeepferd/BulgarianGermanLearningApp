#!/usr/bin/env node

/**
 * Batch 23 Linguistic Correction
 * Fixes critical issues in entries 1101-1150
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch23.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch23.json');

console.log('🔧 Batch 23 Linguistic Correction (Entries 1101-1150)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch23 = data.items.slice(1100, 1150); // Entries 1101-1150

batch23.forEach((entry, index) => {
  const entryNum = 1101 + index;
  
  // Fix Entry 1108: Remove mixed language content
  if (entryNum === 1108 && entry.id === 'wv_pc_c7424da4') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "свинско"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1114: Remove mixed language content
  if (entryNum === 1114 && entry.id === 'wv_pc_ac616537') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "шест"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Note: Entry 1119 has trailing parenthesis but is otherwise correct
  if (entryNum === 1119 && entry.id === 'wv_d40029aa') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = entry.bulgarian.trim().replace(/\s*\)$/, '');
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed trailing parenthesis`);
    correctionsApplied++;
  }
  
  // Fix Entry 1140: Remove mixed language content
  if (entryNum === 1140 && entry.id === 'wv_pc_60c57686') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "седем"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Note: Entry 1145 has trailing parenthesis but is otherwise correct
  if (entryNum === 1145 && entry.id === 'wv_f00c43cd') {
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

console.log(`\n📊 Batch 23 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch23.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 23 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 23 correction process complete!');