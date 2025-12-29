/**
 * IPA Enhancement Script
 * Adds IPA transcriptions to vocabulary items
 */

import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';

// Load IPA mappings
const ipaMappings = JSON.parse(fs.readFileSync('data/ipa_mappings.json', 'utf8'));

// Load vocabulary data
const vocabulary = JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8'));

// Function to generate IPA transcription
function generateIPA(word) {
  if (!word) return '';
  
  // Check common words first
  if (ipaMappings.commonWords[word.toLowerCase()]) {
    return ipaMappings.commonWords[word.toLowerCase()];
  }
  
  // Generate IPA from letters
  let ipa = '';
  for (const char of word.toLowerCase()) {
    if (ipaMappings.mappings[char]) {
      ipa += ipaMappings.mappings[char];
    } else {
      ipa += char; // Fallback: keep original character
    }
  }
  
  return ipa;
}

// Enhance vocabulary with IPA
const enhancedVocabulary = vocabulary.map(item => {
  // Generate IPA for Bulgarian word
  const bulgarianIPA = generateIPA(item.bulgarian);
  
  // Generate IPA for German word
  const germanIPA = generateIPA(item.german);
  
  return {
    ...item,
    ipa: {
      bulgarian: bulgarianIPA,
      german: germanIPA
    }
  };
});

// Save enhanced vocabulary
await writeFile('data/unified-vocabulary.json', JSON.stringify(enhancedVocabulary, null, 2));

console.log('✅ IPA enhancement complete');
console.log(`Enhanced ${enhancedVocabulary.length} vocabulary items with IPA transcriptions`);