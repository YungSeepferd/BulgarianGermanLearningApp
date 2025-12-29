#!/usr/bin/env node

/**
 * Batch 17 Linguistic Correction
 * Fixes critical issues in entries 801-850
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch17.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch17.json');

console.log('🔧 Batch 17 Linguistic Correction (Entries 801-850)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch17 = data.items.slice(800, 850); // Entries 801-850

batch17.forEach((entry, index) => {
  const entryNum = 801 + index;
  
  // Fix Entry 809: Replace Latin character with Cyrillic
  if (entryNum === 809 && entry.id === 'wv_pc_21cd3731') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "Боли ме стомаха"; // Replace Latin 'x' with Cyrillic 'х'
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Replaced Latin 'x' with Cyrillic 'х'`);
    correctionsApplied++;
  }
  
  // Note: Entry 830 "В" is a valid Bulgarian preposition, not an error
  if (entryNum === 830 && entry.id === 'a1_grammar_006') {
    console.log(`\nℹ️  Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  German: "${entry.german}"`);
    console.log(`  Bulgarian: "${entry.bulgarian}"`);
    console.log(`  ✅ Note: "В" is a valid Bulgarian preposition meaning "in"`);
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 17 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch17.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 17 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 17 correction process complete!');