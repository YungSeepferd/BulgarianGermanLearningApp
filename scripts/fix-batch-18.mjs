#!/usr/bin/env node

/**
 * Batch 18 Linguistic Correction
 * Fixes critical issues in entries 851-900
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch18.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch18.json');

console.log('🔧 Batch 18 Linguistic Correction (Entries 851-900)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch18 = data.items.slice(850, 900); // Entries 851-900

batch18.forEach((entry, index) => {
  const entryNum = 851 + index;
  
  // Note: Entry 857 is actually correct - "Извинете" is a polite Bulgarian phrase
  if (entryNum === 857 && entry.id === 'wv_59195815') {
    console.log(`\nℹ️  Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  German: "${entry.german}"`);
    console.log(`  Bulgarian: "${entry.bulgarian}"`);
    console.log(`  ✅ Note: "Извинете" is correct Bulgarian for polite request`);
  }
  
  // Fix Entry 867: Remove mixed language content
  if (entryNum === 867 && entry.id === 'wv_pc_47085b10') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "картофи"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 897: Remove mixed language content
  if (entryNum === 897 && entry.id === 'wv_pc_e02d7169') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "агнешко"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 18 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch18.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 18 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 18 correction process complete!');