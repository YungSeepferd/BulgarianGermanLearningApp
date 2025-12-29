/**
 * Advanced Grammar Enhancement Script
 * Adds grammar tags to remaining items
 */

import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';

// Load vocabulary data
const vocabulary = JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8'));

// Enhance vocabulary with grammar tags
const enhancedVocabulary = vocabulary.map(item => {
  // Skip items that already have grammar
  if (item.grammar && Object.keys(item.grammar).length > 0) {
    return item;
  }
  
  // Add grammar based on part of speech
  const grammar = {};
  
  // Interjections
  if (item.partOfSpeech === 'interjection') {
    grammar.type = 'interjection';
  }
  
  // Numbers/Numerals
  if (item.partOfSpeech === 'number' || item.partOfSpeech === 'numeral') {
    grammar.type = 'cardinal';
  }
  
  // Particles
  if (item.partOfSpeech === 'particle') {
    grammar.type = 'particle';
  }
  
  // Phrases
  if (item.partOfSpeech === 'phrase') {
    grammar.type = 'phrase';
  }
  
  // Pronouns
  if (item.partOfSpeech === 'pronoun') {
    grammar.type = 'personal'; // Default, may need adjustment
  }
  
  return {
    ...item,
    grammar
  };
});

// Save enhanced vocabulary
await writeFile('data/unified-vocabulary.json', JSON.stringify(enhancedVocabulary, null, 2));

console.log('✅ Advanced grammar enhancement complete');
console.log(`Added grammar tags to remaining ${enhancedVocabulary.filter(item => item.grammar).length} items`);