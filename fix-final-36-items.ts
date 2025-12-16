#!/usr/bin/env ts-node

/**
 * Fix Final 36 "Phrase" Items
 * 
 * This script addresses the remaining 36 vocabulary items that are still marked as "phrase":
 * - 29 simple nouns: Add articles (der/die/das) and grammar data
 * - 5 compound terms: Split into separate entries
 * - 2 adjectives: Correct partOfSpeech classification
 * - 2 duplicates: Remove duplicate entries
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GrammarData {
  gender?: 'masculine' | 'feminine' | 'neuter';
  declension?: {
    nominative: string;
    accusative: string;
    dative: string;
    genitive: string;
  };
  plural?: string;
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  level?: string;
  category?: string;
  grammar?: GrammarData;
  [key: string]: any;
}

// Nouns with their articles, genders, and plural forms
const NOUNS_TO_FIX: Record<string, { article: string; gender: 'masculine' | 'feminine' | 'neuter'; plural: string }> = {
  'Lärm': { article: 'der', gender: 'masculine', plural: 'die Lärmarten' },
  'Stille': { article: 'die', gender: 'feminine', plural: 'die Stillen' },
  'Geschwindigkeit': { article: 'die', gender: 'feminine', plural: 'die Geschwindigkeiten' },
  'Richtung': { article: 'die', gender: 'feminine', plural: 'die Richtungen' },
  'Entfernung': { article: 'die', gender: 'feminine', plural: 'die Entfernungen' },
  'Punkt': { article: 'der', gender: 'masculine', plural: 'die Punkte' },
  'Linie': { article: 'die', gender: 'feminine', plural: 'die Linien' },
  'Form': { article: 'die', gender: 'feminine', plural: 'die Formen' },
  'Größe': { article: 'die', gender: 'feminine', plural: 'die Größen' },
  'Farbe': { article: 'die', gender: 'feminine', plural: 'die Farben' },
  'Geruch': { article: 'der', gender: 'masculine', plural: 'die Gerüche' },
  'Geschmack': { article: 'der', gender: 'masculine', plural: 'die Geschmäcke' },
  'Gefühl': { article: 'das', gender: 'neuter', plural: 'die Gefühle' },
  'Gedanke': { article: 'der', gender: 'masculine', plural: 'die Gedanken' },
  'Idee': { article: 'die', gender: 'feminine', plural: 'die Ideen' },
  'Plan': { article: 'der', gender: 'masculine', plural: 'die Pläne' },
  'Ziel': { article: 'das', gender: 'neuter', plural: 'die Ziele' },
  'Ergebnis': { article: 'das', gender: 'neuter', plural: 'die Ergebnisse' },
  'Beispiel': { article: 'das', gender: 'neuter', plural: 'die Beispiele' },
  'Tatsache': { article: 'die', gender: 'feminine', plural: 'die Tatsachen' },
  'Wahrheit': { article: 'die', gender: 'feminine', plural: 'die Wahrheiten' },
  'Lüge': { article: 'die', gender: 'feminine', plural: 'die Lügen' },
  'Geheimnis': { article: 'das', gender: 'neuter', plural: 'die Geheimnisse' },
  'Gesetz': { article: 'das', gender: 'neuter', plural: 'die Gesetze' },
  'Gruppe': { article: 'die', gender: 'feminine', plural: 'die Gruppen' },
  'Mitglied': { article: 'das', gender: 'neuter', plural: 'die Mitglieder' },
  'Gesellschaft': { article: 'die', gender: 'feminine', plural: 'die Gesellschaften' }
};

// Compound terms to split
const COMPOUNDS_TO_SPLIT: Record<string, Array<{ german: string; bulgarian: string; article: string; gender: 'masculine' | 'feminine' | 'neuter'; plural: string }>> = {
  'Platz/Ort': [
    { german: 'Platz', bulgarian: 'Място', article: 'der', gender: 'masculine', plural: 'die Plätze' },
    { german: 'Ort', bulgarian: 'Място', article: 'der', gender: 'masculine', plural: 'die Orte' }
  ],
  'Art/Weise': [
    { german: 'Art', bulgarian: 'Начин', article: 'die', gender: 'feminine', plural: 'die Arten' },
    { german: 'Weise', bulgarian: 'Начин', article: 'die', gender: 'feminine', plural: 'die Weisen' }
  ],
  'Grund/Ursache': [
    { german: 'Grund', bulgarian: 'Причина', article: 'der', gender: 'masculine', plural: 'die Gründe' },
    { german: 'Ursache', bulgarian: 'Причина', article: 'die', gender: 'feminine', plural: 'die Ursachen' }
  ],
  'Recht/Gerechtigkeit': [
    { german: 'Recht', bulgarian: 'Правосъдие', article: 'das', gender: 'neuter', plural: 'die Rechte' },
    { german: 'Gerechtigkeit', bulgarian: 'Справедливост', article: 'die', gender: 'feminine', plural: 'die Gerechtigkeiten' }
  ],
  'Ordnung/Reihe': [
    { german: 'Ordnung', bulgarian: 'Ред', article: 'die', gender: 'feminine', plural: 'die Ordnungen' },
    { german: 'Reihe', bulgarian: 'Ред', article: 'die', gender: 'feminine', plural: 'die Reihen' }
  ]
};

// Adjectives to fix
const ADJECTIVES = ['neu', 'alt'];

// Duplicates to remove (these already exist with correct data)
const DUPLICATES = ['Arbeit', 'Buch'];

function createBasicGrammarForNoun(article: string, noun: string, gender: 'masculine' | 'feminine' | 'neuter', plural: string): GrammarData {
  const nominative = `${article} ${noun}`;
  let accusative: string;
  let dative: string;
  let genitive: string;

  if (gender === 'masculine') {
    accusative = `den ${noun}`;
    dative = `dem ${noun}`;
    genitive = `des ${noun}s`;
  } else if (gender === 'feminine') {
    accusative = nominative;
    dative = `der ${noun}`;
    genitive = `der ${noun}`;
  } else { // neuter
    accusative = nominative;
    dative = `dem ${noun}`;
    genitive = `des ${noun}s`;
  }

  return {
    gender,
    declension: {
      nominative,
      accusative,
      dative,
      genitive
    },
    plural
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

async function fixFinal36Items() {
  const dataPath = path.join(__dirname, 'data', 'unified-vocabulary.json');
  const backupPath = path.join(__dirname, 'data', `unified-vocabulary-backup-${new Date().toISOString().split('T')[0]}-3.json`);

  console.log('🔍 Reading vocabulary data...');
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const jsonData = JSON.parse(fileContent);
  const data: VocabularyItem[] = jsonData.items || jsonData;

  console.log(`📊 Total items: ${data.length}`);

  // Count current "phrase" items
  const phraseItems = data.filter(item => item.partOfSpeech === 'phrase');
  console.log(`⚠️  Items still marked as "phrase": ${phraseItems.length}`);

  // Create backup
  console.log('\n💾 Creating backup...');
  fs.writeFileSync(backupPath, JSON.stringify(jsonData, null, 2));
  console.log(`✅ Backup saved: ${backupPath}`);

  console.log('\n🔧 Processing final 36 items...\n');

  let nounsFixed = 0;
  let compoundsSplit = 0;
  let adjectivesFixed = 0;
  let duplicatesRemoved = 0;
  const newItems: VocabularyItem[] = [];
  const itemsToRemove: string[] = [];

  // Process each item
  for (const item of data) {
    if (item.partOfSpeech !== 'phrase') continue;

    const germanWord = item.german;

    // Check if it's a simple noun to fix
    if (NOUNS_TO_FIX[germanWord]) {
      const { article, gender, plural } = NOUNS_TO_FIX[germanWord];
      item.german = `${article} ${germanWord}`;
      item.partOfSpeech = 'noun';
      item.grammar = createBasicGrammarForNoun(article, germanWord, gender, plural);
      nounsFixed++;
      console.log(`  ✅ Fixed noun: "${germanWord}" → "${item.german}"`);
      continue;
    }

    // Check if it's a compound to split
    if (COMPOUNDS_TO_SPLIT[germanWord]) {
      const compounds = COMPOUNDS_TO_SPLIT[germanWord];
      itemsToRemove.push(item.id);

      for (const compound of compounds) {
        const newItem: VocabularyItem = {
          ...item,
          id: generateId(),
          german: `${compound.article} ${compound.german}`,
          bulgarian: compound.bulgarian,
          partOfSpeech: 'noun',
          grammar: createBasicGrammarForNoun(compound.article, compound.german, compound.gender, compound.plural)
        };
        newItems.push(newItem);
        console.log(`  ✅ Split compound: "${germanWord}" → "${newItem.german}"`);
      }
      compoundsSplit++;
      continue;
    }

    // Check if it's an adjective
    if (ADJECTIVES.includes(germanWord)) {
      item.partOfSpeech = 'adjective';
      adjectivesFixed++;
      console.log(`  ✅ Fixed adjective: "${germanWord}"`);
      continue;
    }

    // Check if it's a duplicate
    if (DUPLICATES.includes(germanWord)) {
      itemsToRemove.push(item.id);
      duplicatesRemoved++;
      console.log(`  ✅ Removed duplicate: "${germanWord}"`);
      continue;
    }
  }

  // Remove duplicates and compounds
  const filteredData = data.filter(item => !itemsToRemove.includes(item.id));

  // Add new split compound items
  const finalData = [...filteredData, ...newItems];

  console.log('\n📈 Results:');
  console.log(`  ✅ Nouns fixed: ${nounsFixed}`);
  console.log(`  ✅ Compounds split: ${compoundsSplit} (created ${newItems.length} new entries)`);
  console.log(`  ✅ Adjectives fixed: ${adjectivesFixed}`);
  console.log(`  ✅ Duplicates removed: ${duplicatesRemoved}`);
  console.log(`  📊 Total items: ${data.length} → ${finalData.length}`);

  // Count remaining "phrase" items
  const remainingPhrases = finalData.filter(item => item.partOfSpeech === 'phrase');
  console.log(`  ⚠️  Remaining "phrase" items: ${remainingPhrases.length}`);

  if (remainingPhrases.length > 0) {
    console.log('\n⚠️  Items still marked as "phrase":');
    remainingPhrases.slice(0, 10).forEach((item, i) => {
      console.log(`    ${i + 1}. "${item.german}" (${item.bulgarian})`);
    });
    if (remainingPhrases.length > 10) {
      console.log(`    ... and ${remainingPhrases.length - 10} more`);
    }
  }

  // Save updated data
  console.log('\n💾 Saving corrected data...');
  const outputData = jsonData.items ? { ...jsonData, items: finalData } : finalData;
  fs.writeFileSync(dataPath, JSON.stringify(outputData, null, 2));
  console.log('✅ Data saved!');

  console.log('\n🎯 Next steps:');
  console.log('  1. Copy data to src: cp data/unified-vocabulary.json src/lib/data/unified-vocabulary.json');
  console.log('  2. Restart dev server to see changes');
  console.log('  3. Test the Grammar tab for corrected items');
  console.log('  4. Verify all filters work correctly');
}

// Run the script
fixFinal36Items().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
