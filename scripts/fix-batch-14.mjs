#!/usr/bin/env node

/**
 * Batch 14 Linguistic Correction
 * Fixes critical issues in entries 651-700
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const BACKUP_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch14.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Create backup before making changes
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch14.json');

console.log('🔧 Batch 14 Linguistic Correction (Entries 651-700)');
console.log('='.repeat(50));

let correctionsApplied = 0;

// Find and fix the problematic entry
const batch14 = data.items.slice(650, 700); // Entries 651-700

batch14.forEach((entry, index) => {
  const entryNum = 651 + index;
  
  // Fix Entry 656: Remove mixed language content
  if (entryNum === 656 && entry.id === 'wv_pc_4ccd16f5') {
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  Before: "${entry.bulgarian}"`);
    
    // Remove the mixed language content, keeping only the correct Bulgarian translation
    const originalBulgarian = entry.bulgarian;
    entry.bulgarian = "петнайсет"; // Correct Bulgarian for "fünfzehn"
    
    console.log(`  After:  "${entry.bulgarian}"`);
    console.log(`  ✅ Fixed: Removed mixed language content`);
    correctionsApplied++;
  }
  
  // Fix Entry 658: Remove trailing parenthesis
  if (entryNum === 658 && entry.id === 'wv_3cd44560') {
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

console.log(`\n📊 Batch 14 Correction Summary:`);
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${batch14.length}`);

if (correctionsApplied > 0) {
  console.log('\n✅ Batch 14 corrections completed successfully!');
  console.log('📝 Remember to verify corrections before proceeding.');
} else {
  console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 14 correction process complete!');