/**
 * Grammar Enhancement Script
 * Adds basic grammar tags to vocabulary items
 */

import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';

// Load vocabulary data
const vocabulary = JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8'));

// Enhance vocabulary with basic grammar tags
const enhancedVocabulary = vocabulary.map(item => {
  // Add basic grammar based on part of speech
  const grammar = {};
  
  // Nouns
  if (item.partOfSpeech === 'noun') {
    grammar.gender = 'unknown'; // Will need manual review
    grammar.number = 'singular'; // Default, may need adjustment
  }
  
  // Verbs
  if (item.partOfSpeech === 'verb') {
    grammar.tense = ['present']; // Default, may need expansion
    grammar.mood = 'indicative';
  }
  
  // Adjectives
  if (item.partOfSpeech === 'adjective') {
    grammar.degree = 'positive';
  }
  
  // Adverbs
  if (item.partOfSpeech === 'adverb') {
    grammar.type = 'manner'; // Default, may need adjustment
  }
  
  // Prepositions
  if (item.partOfSpeech === 'preposition') {
    grammar.type = 'simple';
  }
  
  // Conjunctions
  if (item.partOfSpeech === 'conjunction') {
    grammar.type = 'coordinating'; // Default, may need adjustment
  }
  
  return {
    ...item,
    grammar
  };
});

// Save enhanced vocabulary
await writeFile('data/unified-vocabulary.json', JSON.stringify(enhancedVocabulary, null, 2));

console.log('✅ Grammar enhancement complete');
console.log(`Added basic grammar tags to ${enhancedVocabulary.length} vocabulary items`);