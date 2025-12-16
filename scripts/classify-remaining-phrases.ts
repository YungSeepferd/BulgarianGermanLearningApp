#!/usr/bin/env tsx
/**
 * Manual Classification for Remaining 77 "phrase" Items
 * 
 * Analysis of remaining items shows:
 * - Adjectives (no article): interessant, schmutzig, voll, leer, weich, hart, glatt
 * - Prepositions: in, mit, ohne, vor, nach, über, unter, bei
 * - Conjunctions: dass
 * - Nouns (needing article correction): Regel, Fehler, Antwort, Frage, etc.
 * - Special verb form: sein (perfektiv)
 */

import * as fs from 'fs';
import * as path from 'path';

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  grammar?: any;
  [key: string]: any;
}

// Classification rules for remaining items
const ADJECTIVES = [
  'interessant', 'schmutzig', 'voll', 'leer', 'weich', 'hart', 'glatt',
  'heiß', 'kalt', 'warm', 'kühl', 'trocken', 'nass', 'feucht',
  'sauber', 'rein', 'hell', 'dunkel', 'laut', 'leise', 'ruhig'
];

const PREPOSITIONS = [
  'in', 'mit', 'ohne', 'vor', 'nach', 'über', 'unter', 'bei',
  'aus', 'zu', 'von', 'für', 'gegen', 'durch', 'um', 'an', 'auf'
];

const CONJUNCTIONS = [
  'dass', 'wenn', 'weil', 'ob', 'als', 'während', 'bis', 'seit',
  'obwohl', 'damit', 'falls', 'sodass'
];

const ADVERBS = [
  'sehr', 'ganz', 'ziemlich', 'fast', 'nur', 'auch', 'noch', 'schon',
  'immer', 'nie', 'oft', 'manchmal', 'selten', 'heute', 'morgen', 'gestern'
];

// Articles that indicate nouns (for items missing articles)
const NOUN_INDICATORS: { [key: string]: 'masculine' | 'feminine' | 'neuter' } = {
  'Regel': 'feminine',
  'Fehler': 'masculine',
  'Antwort': 'feminine',
  'Frage': 'feminine',
  'Problem': 'neuter',
  'Lösung': 'feminine',
  'Anfang': 'masculine',
  'Ende': 'neuter',
  'Mitte': 'feminine',
  'Welt': 'feminine',
  'Erde': 'feminine',
  'Luft': 'feminine',
  'Feuer': 'neuter',
  'Wasser': 'neuter',
  'Eis': 'neuter',
  'Stein': 'masculine',
  'Sand': 'masculine',
  'Staub': 'masculine',
  'Rauch': 'masculine',
  'Licht': 'neuter',
  'Stimme': 'feminine'
};

function classifyItem(german: string): {
  partOfSpeech: string;
  gender?: 'masculine' | 'feminine' | 'neuter';
  needsArticle?: boolean;
} {
  const cleanGerman = german.trim().toLowerCase();
  const capitalizedGerman = german.trim();

  // Check adjectives (lowercase, no article)
  if (ADJECTIVES.includes(cleanGerman)) {
    return { partOfSpeech: 'adjective' };
  }

  // Check prepositions
  if (PREPOSITIONS.includes(cleanGerman)) {
    return { partOfSpeech: 'preposition' };
  }

  // Check conjunctions
  if (CONJUNCTIONS.includes(cleanGerman)) {
    return { partOfSpeech: 'conjunction' };
  }

  // Check adverbs
  if (ADVERBS.includes(cleanGerman)) {
    return { partOfSpeech: 'adverb' };
  }

  // Check if it's a noun without article (capitalized first letter in German)
  for (const [noun, gender] of Object.entries(NOUN_INDICATORS)) {
    if (capitalizedGerman.includes(noun)) {
      return { 
        partOfSpeech: 'noun', 
        gender,
        needsArticle: true
      };
    }
  }

  // Special cases
  if (cleanGerman.includes('sein') && cleanGerman.includes('perfektiv')) {
    return { partOfSpeech: 'verb' };
  }

  if (capitalizedGerman.includes('Land') || capitalizedGerman.includes('Seite')) {
    return { partOfSpeech: 'noun', gender: 'neuter', needsArticle: true };
  }

  if (capitalizedGerman.includes('Geräusch') || capitalizedGerman.includes('Klang')) {
    return { partOfSpeech: 'noun', gender: 'neuter', needsArticle: true };
  }

  // Default: keep as phrase for manual review
  return { partOfSpeech: 'phrase' };
}

function addArticleToGerman(german: string, gender: 'masculine' | 'feminine' | 'neuter'): string {
  const articles = {
    masculine: 'der',
    feminine: 'die',
    neuter: 'das'
  };

  // If already has article, return as is
  if (german.match(/^(der|die|das)\s/i)) {
    return german;
  }

  // If it's a combined form like "Land/Seite", handle specially
  if (german.includes('/')) {
    return german; // Keep as is for manual review
  }

  // Add article
  return `${articles[gender]} ${german}`;
}

function createBasicGrammarForNoun(gender: 'masculine' | 'feminine' | 'neuter', german: string): any {
  const cleanGerman = german.replace(/^(der|die|das)\s+/i, '');
  const pluralForm = cleanGerman + 'e'; // Basic guess

  const declension = {
    nominative: { singular: cleanGerman, plural: pluralForm },
    accusative: { singular: cleanGerman, plural: pluralForm },
    dative: { singular: cleanGerman, plural: pluralForm + 'n' },
    genitive: { singular: cleanGerman + 's', plural: pluralForm }
  };

  return { gender, pluralForm, declension };
}

async function classifyRemainingPhrases() {
  console.log('🔍 Reading vocabulary data...');
  
  const dataPath = path.join(process.cwd(), 'data', 'unified-vocabulary.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const data = jsonData.items || jsonData;

  console.log(`📊 Total items: ${data.length}`);

  // Find remaining "phrase" items
  const phraseItems = data.filter((item: VocabularyItem) => item.partOfSpeech === 'phrase');
  console.log(`⚠️  Items still marked as "phrase": ${phraseItems.length}`);

  // Create backup
  console.log('\n💾 Creating backup...');
  const backupPath = path.join(
    process.cwd(),
    'data',
    `unified-vocabulary-backup-${new Date().toISOString().split('T')[0]}-2.json`
  );
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`✅ Backup saved: ${backupPath}`);

  // Classify and correct
  console.log('\n🔧 Classifying remaining items...\n');

  let corrected = 0;
  let nounsWithArticle = 0;
  let adjectives = 0;
  let prepositions = 0;
  let conjunctions = 0;
  let adverbs = 0;
  let stillPhrase = 0;
  const corrections: string[] = [];

  for (const item of data) {
    if (item.partOfSpeech !== 'phrase') continue;

    const classification = classifyItem(item.german);
    
    if (classification.partOfSpeech !== 'phrase') {
      item.partOfSpeech = classification.partOfSpeech;
      corrected++;

      // Add article for nouns
      if (classification.partOfSpeech === 'noun' && classification.needsArticle && classification.gender) {
        item.german = addArticleToGerman(item.german, classification.gender);
        item.grammar = createBasicGrammarForNoun(classification.gender, item.german);
        nounsWithArticle++;
      }

      if (classification.partOfSpeech === 'adjective') adjectives++;
      if (classification.partOfSpeech === 'preposition') prepositions++;
      if (classification.partOfSpeech === 'conjunction') conjunctions++;
      if (classification.partOfSpeech === 'adverb') adverbs++;

      corrections.push(`  ${corrected}. "${item.german}" → ${classification.partOfSpeech}${classification.needsArticle ? ' (✓ article added)' : ''}`);
    } else {
      stillPhrase++;
    }
  }

  console.log('📈 Results:');
  console.log(`  ✅ Corrected: ${corrected}`);
  console.log(`    - Nouns: ${nounsWithArticle} (articles added)`);
  console.log(`    - Adjectives: ${adjectives}`);
  console.log(`    - Prepositions: ${prepositions}`);
  console.log(`    - Conjunctions: ${conjunctions}`);
  console.log(`    - Adverbs: ${adverbs}`);
  console.log(`  ⚠️  Still "phrase": ${stillPhrase}`);

  console.log('\n📝 Sample corrections (first 20):');
  console.log(corrections.slice(0, 20).join('\n'));

  if (corrections.length > 20) {
    console.log(`  ... and ${corrections.length - 20} more`);
  }

  // Save corrected data
  console.log('\n💾 Saving corrected data...');
  if (jsonData.items) {
    jsonData.items = data;
    fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
  } else {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }
  console.log('✅ Data saved!');

  console.log('\n🎯 Next steps:');
  console.log('  1. Review the corrections in the data file');
  console.log('  2. Manually review any remaining "phrase" items');
  console.log('  3. Copy data to src: cp data/unified-vocabulary.json src/lib/data/unified-vocabulary.json');
  console.log('  4. Test the Grammar tab for corrected items');
}

classifyRemainingPhrases().catch(console.error);
