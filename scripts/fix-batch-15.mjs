#!/usr/bin/env node

/**
 * Batch 15 Linguistic Correction
 * Fixes critical issues in entries 701-750
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch15.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch15.json');

console.log('🔧 Batch 15 Linguistic Correction (Entries 701-750)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entries
const batch15 = data.items.slice(700, 750); // Entries 701-750

batch15.forEach((entry, index) => {
  const entryNum = 701 + index;
  
  // Fix Entry 705: Remove Latin character
  if (entryNum === 705 && entry.id === 'wv_pc_bc12fbd9') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "Това е хотел"; // Replace Latin 'x' with Cyrillic 'х'
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Replaced Latin 'x' with Cyrillic 'х'`);
    correctionsApplied++;
  }
  
  // Fix Entry 709: Remove mixed language content
  if (entryNum === 709 && entry.id === 'wv_pc_c0a50c6f') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "краставици"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 740: Remove mixed language content
  if (entryNum === 740 && entry.id === 'wv_pc_f6c5ef09') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "Баня"; // Keep only the correct Bulgarian translation
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
});

// Save the corrected data
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

console.log(`\n📊 Batch 15 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch15.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 15 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 15 correction process complete!');