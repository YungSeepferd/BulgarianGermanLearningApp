#!/usr/bin/env node

/**
 * Dialogue Entry Correction Script
 * Fix dialogue markers and split compound entries into individual words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting dialogue entry correction...');

// Load vocabulary data
const vocabPath = path.join(__dirname, '../static/data/unified-vocabulary.simple-cleaned.json');
const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log(`📚 Loaded ${vocabData.items.length} vocabulary items`);

// Dialogue patterns to fix
const dialoguePatterns = [
  { pattern: /^A: /, description: "Remove 'A: ' prefix" },
  { pattern: /^B: /, description: "Remove 'B: ' prefix" },
  { pattern: / A: /, description: "Remove ' A: ' from middle" },
  { pattern: / B: /, description: "Remove ' B: ' from middle" }
];

// Words that should be individual entries
const compoundWords = [
  "Bitte, nehmen Sie Platz!",
  "Ja, bitte schön!",
  "Nein, das tue ich nicht.",
  "Nein, ich mag keine Milch."
];

// Correction functions
function removeDialogueMarkers(text) {
  let cleaned = text;
  dialoguePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern.pattern, '').trim();
  });
  return cleaned;
}

function shouldSplitEntry(item) {
  return compoundWords.some(phrase => item.german === phrase || item.bulgarian === phrase);
}

function splitCompoundEntry(item) {
  // Example: "Bitte, nehmen Sie Platz!" -> ["Bitte", "nehmen", "Sie", "Platz"]
  const germanWords = item.german.replace(/[!,?]/g, '').split(' ').filter(w => w && w !== ',');
  
  // For now, we'll just clean the dialogue markers
  // Full splitting would require more complex logic and examples
  return {
    ...item,
    german: removeDialogueMarkers(item.german),
    bulgarian: removeDialogueMarkers(item.bulgarian)
  };
}

// Process items
let correctedCount = 0;
const correctedItems = vocabData.items.map(item => {
  // Check if this is a dialogue entry that needs correction
  const needsCorrection = dialoguePatterns.some(pattern => pattern.pattern.test(item.german) || pattern.pattern.test(item.bulgarian));
  
  if (needsCorrection) {
    correctedCount++;
    console.log(`🔧 Correcting: "${item.german}" → "${item.bulgarian}"`);
    
    // Apply corrections
    const correctedItem = splitCompoundEntry(item);
    
    // Add note about the correction
    correctedItem.correctionNote = "Removed dialogue markers from phrase";
    correctedItem.needsReview = true;
    
    return correctedItem;
  }
  
  return item;
});

console.log(`📊 Corrected ${correctedCount} dialogue entries`);

// Save corrected data
const outputPath = path.join(__dirname, '../static/data/unified-vocabulary.dialogue-corrected.json');
fs.writeFileSync(outputPath, JSON.stringify({
  ...vocabData,
  items: correctedItems,
  correctionSummary: {
    date: new Date().toISOString(),
    itemsCorrected: correctedCount,
    itemsTotal: vocabData.items.length,
    actions: ["Removed dialogue markers from phrases"]
  }
}, null, 2));

console.log(`💾 Corrected data saved to ${outputPath}`);

// Show sample corrections
const samples = correctedItems.filter(item => item.correctionNote).slice(0, 5);
console.log('\n🔍 Sample Corrections:');
samples.forEach((item, index) => {
  console.log(`${index + 1}. ${item.german} → ${item.bulgarian}`);
});

console.log('\n🎉 Dialogue Entry Correction Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Review corrected entries');
console.log('2. Consider splitting compound phrases into individual words');
console.log('3. Add proper example sentences for each word');
console.log('4. Validate the corrections manually');