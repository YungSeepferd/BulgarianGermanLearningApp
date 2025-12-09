#!/usr/bin/env node
/**
 * Debug script to understand the conversion issue
 */

import { readFile } from 'fs/promises';
import { convertToUnifiedItem } from './merging-utils.js';

async function debugConversion() {
  console.log('🔍 Debugging conversion issue...');

  // Load sample data
  const legacyData = await readFile('_legacy_archive/data/archive-data-cleanup/vocabulary-fixed.json', 'utf-8');
  const currentData = await readFile('src/lib/data/vocabulary.json', 'utf-8');

  const legacyItems = JSON.parse(legacyData);
  const currentItems = JSON.parse(currentData);

  console.log('\n📋 Sample legacy item:');
  const sampleLegacy = legacyItems[0];
  console.log('Keys:', Object.keys(sampleLegacy));
  console.log('Sample:', {
    id: sampleLegacy.id,
    word: sampleLegacy.word,
    translation: sampleLegacy.translation,
    german: sampleLegacy.german,
    bulgarian: sampleLegacy.bulgarian,
    hasWord: 'word' in sampleLegacy,
    hasTranslation: 'translation' in sampleLegacy,
    hasGerman: 'german' in sampleLegacy,
    hasBulgarian: 'bulgarian' in sampleLegacy
  });

  console.log('\n📋 Sample current item:');
  const sampleCurrent = currentItems[0];
  console.log('Keys:', Object.keys(sampleCurrent));
  console.log('Sample:', {
    id: sampleCurrent.id,
    word: sampleCurrent.word,
    translation: sampleCurrent.translation,
    german: sampleCurrent.german,
    bulgarian: sampleCurrent.bulgarian,
    hasWord: 'word' in sampleCurrent,
    hasTranslation: 'translation' in sampleCurrent,
    hasGerman: 'german' in sampleCurrent,
    hasBulgarian: 'bulgarian' in sampleCurrent
  });

  console.log('\n🔄 Testing conversion on legacy item:');
  const convertedLegacy = convertToUnifiedItem(sampleLegacy);
  console.log('Converted legacy:', {
    id: convertedLegacy.id,
    german: convertedLegacy.german,
    bulgarian: convertedLegacy.bulgarian,
    partOfSpeech: convertedLegacy.partOfSpeech,
    difficulty: convertedLegacy.difficulty,
    categories: convertedLegacy.categories
  });

  console.log('\n🔄 Testing conversion on current item:');
  const convertedCurrent = convertToUnifiedItem(sampleCurrent);
  console.log('Converted current:', {
    id: convertedCurrent.id,
    german: convertedCurrent.german,
    bulgarian: convertedCurrent.bulgarian,
    partOfSpeech: convertedCurrent.partOfSpeech,
    difficulty: convertedCurrent.difficulty,
    categories: convertedCurrent.categories
  });

  console.log('\n📊 Testing all legacy items:');
  for (let i = 0; i < Math.min(5, legacyItems.length); i++) {
    const item = legacyItems[i];
    const converted = convertToUnifiedItem(item);
    console.log(`Item ${i}:`, {
      id: converted.id,
      hasGerman: converted.german !== undefined,
      hasBulgarian: converted.bulgarian !== undefined,
      partOfSpeech: converted.partOfSpeech,
      difficulty: converted.difficulty
    });
  }

  console.log('\n📊 Testing all current items:');
  for (let i = 0; i < Math.min(5, currentItems.length); i++) {
    const item = currentItems[i];
    const converted = convertToUnifiedItem(item);
    console.log(`Item ${i}:`, {
      id: converted.id,
      hasGerman: converted.german !== undefined,
      hasBulgarian: converted.bulgarian !== undefined,
      partOfSpeech: converted.partOfSpeech,
      difficulty: converted.difficulty
    });
  }
}

debugConversion().catch(error => {
  console.error('Debug failed:', error);
  process.exit(1);
});