#!/usr/bin/env node

/**
 * Batch 16 Linguistic Correction
 * Fixes critical issues in entries 751-800
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch16.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch16.json');

console.log('🔧 Batch 16 Linguistic Correction (Entries 751-800)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch16 = data.items.slice(750, 800); // Entries 751-800

batch16.forEach((entry, index) => {
  const entryNum = 751 + index;
  
  // Fix Entry 767: Remove Latin character
  if (entryNum === 767 && entry.id === 'wv_pc_19b739b9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "дно кафе, моля"; // Replace Latin 'm' with Cyrillic 'м'
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Replaced Latin 'm' with Cyrillic 'м'`);
    correctionsApplied++;
  }
  
  // Fix Entry 773: Remove mixed language content
  if (entryNum === 773 && entry.id === 'wv_pc_033dc3ac') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "пиле"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 16 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch16.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 16 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 16 correction process complete!');