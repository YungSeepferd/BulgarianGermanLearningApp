#!/usr/bin/env node

/**
 * Vocabulary Cleanup Script
 * Systematic correction of Peace Corps PDF translation mismatches and other issues
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

console.log('🚀 Starting vocabulary cleanup...');
console.log(`📚 Processing ${vocabularyData.items.length} vocabulary items`);

// IPA generation for Bulgarian
const bulgarianIPA = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'ɡ', 'д': 'd',
  'е': 'ɛ', 'ж': 'ʒ', 'з': 'z', 'и': 'i', 'й': 'j',
  'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'ɔ',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 't͡s', 'ч': 't͡ʃ', 'ш': 'ʃ',
  'щ': 'ʃt', 'ъ': 'ɤ', 'ь': 'ʲ', 'ю': 'ju', 'я': 'ja'
};

function generateIPA(bulgarian) {
  return '/' + bulgarian.split('').map(char => 
    bulgarianIPA[char.toLowerCase()] || char
  ).join('') + '/';
}

// German gender detection
function detectGermanGender(german) {
  if (german.startsWith('der ')) return { gender: 'm', article: 'der' };
  if (german.startsWith('die ')) return { gender: 'f', article: 'die' };
  if (german.startsWith('das ')) return { gender: 'n', article: 'das' };
  return null;
}

// Cleanup functions
function cleanPeaceCorpsEntries() {
  const corruptedPatterns = [
    { german: /^B: /, bulgarian: /^(Извинете|Може ли|Обичате ли|Да,|Не,)/ }, // Response vs Question mismatch
    { german: /^B: Ja,/, bulgarian: /^(Може ли|Обичате ли)/ }, // Yes response vs question
    { german: /^B: Nein,/, bulgarian: /^(Искате ли|Може ли)/ }, // No response vs question
    { german: /Milch$/, bulgarian: /салам|сирене/ }, // Milk vs cheese/sausage mismatch
    { german: /Kaffee$/, bulgarian: /салам|сирене/ } // Coffee vs cheese/sausage mismatch
  ];

  return vocabularyData.items.filter(item => {
    // Keep items that don't match corruption patterns
    const isCorrupted = corruptedPatterns.some(pattern => 
      pattern.german.test(item.german) && pattern.bulgarian.test(item.bulgarian)
    );
    
    return !isCorrupted || !item.enrichment?.source?.includes('peace-corps-pdf');
  });
}

function fixPartOfSpeech(item) {
  // Fix obvious misclassifications
  if (item.german.match(/^(der|die|das) \w+/) && item.partOfSpeech !== 'noun') {
    return 'noun';
  }
  if (item.german.includes('/') && item.partOfSpeech !== 'phrase') {
    return 'phrase';
  }
  if (item.german.match(/\d+/) && item.partOfSpeech !== 'number') {
    return 'number';
  }
  return item.partOfSpeech;
}

function correctGrammarErrors(item) {
  const correctedItem = { ...item };
  
  // Fix examples with common German errors
  if (correctedItem.examples) {
    correctedItem.examples = correctedItem.examples.map(ex => {
      const correctedExample = { ...ex };
      
      // Fix "Ich bekommen" -> "Ich bekomme"
      if (correctedExample.german.includes('Ich bekommen ')) {
        correctedExample.german = correctedExample.german.replace('Ich bekommen ', 'Ich bekomme ');
      }
      
      // Fix "Ich benutzen" -> "Ich benutze"
      if (correctedExample.german.includes('Ich benutzen ')) {
        correctedExample.german = correctedExample.german.replace('Ich benutzen ', 'Ich benutze ');
      }
      
      // Fix "Ich haben" -> "Ich habe"
      if (correctedExample.german.includes('Ich haben ')) {
        correctedExample.german = correctedExample.german.replace('Ich haben ', 'Ich habe ');
      }
      
      return correctedExample;
    });
  }
  
  return correctedItem;
}

function addMissingIPA(item) {
  if (!item.ipa && item.bulgarian) {
    return { ...item, ipa: generateIPA(item.bulgarian) };
  }
  return item;
}

function validateGender(item) {
  if (item.partOfSpeech === 'noun' && item.german) {
    const genderInfo = detectGermanGender(item.german);
    if (genderInfo) {
      return { 
        ...item,
        gender: genderInfo.gender,
        article: genderInfo.article
      };
    }
  }
  return item;
}

function removeMixedLanguage(item) {
  const correctedItem = { ...item };
  
  // Remove English text from Bulgarian fields
  if (correctedItem.bulgarian && correctedItem.bulgarian.includes(' ')) {
    const parts = correctedItem.bulgarian.split(' ');
    const cyrillicParts = parts.filter(part => /^[А-Яа-яЁё]+$/.test(part));
    if (cyrillicParts.length > 0) {
      correctedItem.bulgarian = cyrillicParts.join(' ');
    }
  }
  
  // Remove English from examples
  if (correctedItem.examples) {
    correctedItem.examples = correctedItem.examples.map(ex => {
      if (ex.bulgarian && ex.bulgarian.includes('A:') || ex.bulgarian.includes('B:')) {
        ex.bulgarian = ex.bulgarian.replace(/[AB]: /g, '');
      }
      return ex;
    });
  }
  
  return correctedItem;
}

function standardizeCapitalization(item) {
  const correctedItem = { ...item };
  
  // Standardize Bulgarian capitalization
  if (correctedItem.bulgarian && correctedItem.bulgarian === correctedItem.bulgarian.toUpperCase()) {
    correctedItem.bulgarian = correctedItem.bulgarian.charAt(0).toUpperCase() + 
                              correctedItem.bulgarian.slice(1).toLowerCase();
  }
  
  return correctedItem;
}

// Main cleanup pipeline
function cleanupVocabularyData(data) {
  console.log('🧹 Starting cleanup pipeline...');
  
  // Step 1: Remove corrupted Peace Corps entries
  console.log('🗑️  Removing corrupted Peace Corps entries...');
  let cleanedItems = cleanPeaceCorpsEntries();
  console.log(`📊 Removed ${data.items.length - cleanedItems.length} corrupted entries`);
  
  // Step 2: Process remaining items
  console.log('🔧 Processing remaining items...');
  cleanedItems = cleanedItems.map((item, index) => {
    if ((index + 1) % 100 === 0) {
      console.log(`📝 Processing item ${index + 1}/${cleanedItems.length}...`);
    }
    
    // Skip if item is not an object (shouldn't happen, but safety check)
    if (typeof item !== 'object' || item === null) {
      console.warn(`⚠️  Skipping invalid item at index ${index}`);
      return null;
    }
    
    // Apply all cleanup functions
    let cleanedItem = fixPartOfSpeech(item);
    cleanedItem = correctGrammarErrors(cleanedItem);
    cleanedItem = addMissingIPA(cleanedItem);
    cleanedItem = validateGender(cleanedItem);
    cleanedItem = removeMixedLanguage(cleanedItem);
    cleanedItem = standardizeCapitalization(cleanedItem);
    
    return cleanedItem;
  }).filter(item => item !== null); // Remove any null items
  
  return { ...data, items: cleanedItems };
}

// Process in batches
function processInBatches(data, batchSize = 500) {
  const totalItems = data.items.length;
  const batches = Math.ceil(totalItems / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, totalItems);
    const batch = data.items.slice(start, end);
    
    console.log(`\n📦 Processing batch ${i + 1}/${batches} (items ${start + 1}-${end})...`);
    
    const batchData = { ...data, items: batch };
    const cleanedBatch = cleanupVocabularyData(batchData);
    
    // Save progress
    const progressPath = vocabularyPath.replace('.json', `.cleaned.batch${i + 1}.json`);
    fs.writeFileSync(progressPath, JSON.stringify(cleanedBatch, null, 2));
    console.log(`💾 Saved batch ${i + 1} to ${progressPath}`);
  }
}

// Main execution
console.log('🚀 Starting comprehensive vocabulary cleanup...');

// Process in batches to handle large dataset
processInBatches(vocabularyData);

console.log('\n🎉 Cleanup process completed!');
console.log('📋 Summary:');
console.log('1. Removed corrupted Peace Corps translation mismatches');
console.log('2. Fixed part-of-speech misclassifications');
console.log('3. Corrected grammatical errors in examples');
console.log('4. Added missing IPA transcriptions');
console.log('5. Validated gender assignments for nouns');
console.log('6. Removed mixed-language content');
console.log('7. Standardized capitalization');

console.log('\n🎯 Next steps:');
console.log('1. Review cleaned batches');
console.log('2. Merge cleaned batches into final dataset');
console.log('3. Add cultural context and usage notes');
console.log('4. Implement validation framework');