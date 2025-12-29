#!/usr/bin/env node

/**
 * Correction Script for Linguistic Issues
 * Applies corrections to the identified issues in batch 1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.comprehensive-corrected.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

console.log('🔧 Starting Corrections for Batch 1 Issues');
console.log('='.repeat(50));

let correctionsMade = 0;

// Apply corrections to specific entries
const corrections = [
  // Fix Entry 4: Semantic mismatch
  {
    id: 'wv_pc_c65c3b24',
    fixes: {
      bulgarian: 'Моля, седнете' // Correct translation for "Bitte, nehmen Sie Platz"
    }
  },
  
  // Fix Entry 6: Remove non-Cyrillic characters
  {
    id: 'wv_a57f6890',
    fixes: {
      bulgarian: 'вечер' // Remove " starting around 5PM"
    }
  },
  
  // Fix Entry 11: Remove non-Cyrillic characters
  {
    id: 'wv_pc_da599994',
    fixes: {
      bulgarian: 'осем' // Remove " sixty shey'set шейсет"
    }
  },
  
  // Fix Entry 16: Remove extra character
  {
    id: 'wv_5b9be793',
    fixes: {
      bulgarian: 'осемдесет' // Remove ")"
    }
  }
];

// Apply the corrections
corrections.forEach(correction => {
  const entryIndex = data.items.findIndex(item => item.id === correction.id);
  
  if (entryIndex !== -1) {
    const entry = data.items[entryIndex];
    console.log(`\n📝 Correcting entry ${entryIndex + 1} (ID: ${correction.id}):`);
    console.log(`  Before: German="${entry.german}", Bulgarian="${entry.bulgarian}"`);
    
    // Apply fixes
    for (const [field, value] of Object.entries(correction.fixes)) {
      entry[field] = value;
      console.log(`  Fixed ${field}: "${value}"`);
    }
    
    console.log(`  After: German="${entry.german}", Bulgarian="${entry.bulgarian}"`);
    correctionsMade++;
  }
});

// Fix capitalization issues for German entries
console.log('\n🔤 Fixing German capitalization issues...');
let capitalizationFixes = 0;

data.items.forEach((entry, index) => {
  if (entry.german && typeof entry.german === 'string') {
    const trimmedGerman = entry.german.trim();
    
    // Only fix if it's lowercase and should be capitalized
    if (trimmedGerman && trimmedGerman === trimmedGerman.toLowerCase() && 
        trimmedGerman.length > 1 && 
        !trimmedGerman.includes(' ') && // Don't auto-fix phrases
        !/^[a-zäöüß]/.test(trimmedGerman)) { // Already lowercase
      
      const capitalized = trimmedGerman.charAt(0).toUpperCase() + trimmedGerman.slice(1);
      entry.german = capitalized;
      capitalizationFixes++;
      
      if (capitalizationFixes <= 5) { // Show first few examples
        console.log(`  Fixed: "${trimmedGerman}" → "${capitalized}"`);
      }
    }
  }
});

console.log(`  Total capitalization fixes: ${capitalizationFixes}`);

// Save the corrected data
const backupFile = path.join(__dirname, '../static/data/unified-vocabulary.backup-before-linguistic-fixes.json');
fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
console.log(`\n💾 Backup created: ${path.basename(backupFile)}`);

// Save corrected version
const correctedFile = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
fs.writeFileSync(correctedFile, JSON.stringify(data, null, 2));
console.log(`💾 Corrected version saved: ${path.basename(correctedFile)}`);

console.log('\n✅ Corrections Summary:');
console.log(`  Specific corrections: ${correctionsMade}`);
console.log(`  Capitalization fixes: ${capitalizationFixes}`);
console.log(`  Total changes: ${correctionsMade + capitalizationFixes}`);
console.log('\n🎉 Linguistic corrections applied successfully!');