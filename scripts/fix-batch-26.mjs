#!/usr/bin/env node

/**
 * Batch 26 Linguistic Correction
 * Fixes critical issues in entries 1251-1300
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch26.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch26.json');

console.log('🔧 Batch 26 Linguistic Correction (Entries 1251-1300)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch26 = data.items.slice(1250, 1300); // Entries 1251-1300

batch26.forEach((entry, index) => {
  const entryNum = 1251 + index;
  
  // Fix Entry 1259: Remove mixed language content
  if (entryNum === 1259 && entry.id === 'wv_4c91758d') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    console.log(`  Example before: "${entry.examples[0].bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "помалко"; // Keep only the correct Bulgarian translation
    entry.examples[0].bulgarian = "помалко"; // Fix the example as well
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  Example after:  "${entry.examples[0].bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content from both main and example fields`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 26 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch26.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 26 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 26 correction process complete!');