#!/usr/bin/env node

/**
 * Simple Vocabulary Cleanup Script
 * Robust cleanup with proper data handling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load vocabulary data
const vocabularyPath = path.join(__dirname, '../static/data/unified-vocabulary.json');
const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));

console.log('🚀 Starting simple vocabulary cleanup...');
console.log(`📚 Found ${vocabularyData.items.length} vocabulary items`);

// Simple cleanup - just remove the most obviously corrupted Peace Corps entries
function isCorrupted(item) {
  // Check for obvious translation mismatches
  const corruptedPatterns = [
    // German response vs Bulgarian question
    (item.german.startsWith('B: Ja,') && item.bulgarian.startsWith('Може ли')),
    (item.german.startsWith('B: Nein,') && item.bulgarian.startsWith('Искате ли')),
    // Food mismatches
    (item.german.includes('Milch') && item.bulgarian.includes('салам')),
    (item.german.includes('Kaffee') && item.bulgarian.includes('сирене')),
    // Mixed language
    (item.bulgarian && item.bulgarian.includes('A:')),
    (item.bulgarian && item.bulgarian.includes('B:'))
  ];
  
  return corruptedPatterns.some(pattern => pattern);
}

// Process items safely
const cleanedItems = vocabularyData.items.filter(item => {
  // Keep item if it's not corrupted
  return !isCorrupted(item);
});

console.log(`📊 Cleanup results:`);
console.log(`📝 Original: ${vocabularyData.items.length}`);
console.log(`🧹 Removed: ${vocabularyData.items.length - cleanedItems.length}`);
console.log(`✅ Cleaned: ${cleanedItems.length}`);

// Save cleaned data
const outputPath = path.join(__dirname, '../static/data/unified-vocabulary.simple-cleaned.json');
fs.writeFileSync(outputPath, JSON.stringify({
  ...vocabularyData,
  items: cleanedItems
}, null, 2));

console.log(`💾 Simple cleaned dataset saved to ${outputPath}`);

// Verify the output
const verificationSample = cleanedItems.slice(0, 10);
console.log('\n🔍 Verification sample:');
verificationSample.forEach((item, index) => {
  console.log(`${index + 1}. ${item.german} → ${item.bulgarian} (${item.partOfSpeech})`);
});

console.log('\n🎉 Simple cleanup completed!');
console.log('🎯 This is a conservative cleanup - only removed obviously corrupted items.');
console.log('📋 Next: Manual review of remaining items for quality assurance.');