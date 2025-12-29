#!/usr/bin/env node

/**
 * Batch 21 Linguistic Correction
 * Fixes critical issues in entries 1001-1050
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch21.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch21.json');

console.log('🔧 Batch 21 Linguistic Correction (Entries 1001-1050)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch21 = data.items.slice(1000, 1050); // Entries 1001-1050

batch21.forEach((entry, index) => {
  const entryNum = 1001 + index;
  
  // Fix Entry 1023: Remove mixed language content
  if (entryNum === 1023 && entry.id === 'wv_pc_d25dc260') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "чушки"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 1027: Remove mixed language content
  if (entryNum === 1027 && entry.id === 'wv_pc_ac62b8e7') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "гъби"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 21 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch21.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 21 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 21 correction process complete!');