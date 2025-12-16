#!/usr/bin/env tsx
/**
 * Fix "phrase" PartOfSpeech Issues
 * 
 * This script corrects 240 vocabulary items that were incorrectly marked as "phrase"
 * by classifying them into proper parts of speech (noun, verb, adjective) based on
 * German language patterns.
 * 
 * Classification Rules:
 * 1. If starts with "der/die/das " → noun
 * 2. If ends with "-en" and no article → verb
 * 3. Otherwise → adjective (requires manual review)
 * 
 * Also adds basic grammar structure for each type.
 */

import fs from 'fs';
import path from 'path';

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: string;
  categories: string[];
  grammar?: {
    gender?: 'masculine' | 'feminine' | 'neuter';
    pluralForm?: string;
    declension?: Record<string, { singular: string; plural: string }>;
    conjugation?: Record<string, any>;
  };
  [key: string]: any;
}

interface VocabularyData {
  items: VocabularyItem[];
  [key: string]: any;
}

const DATA_PATH = path.join(process.cwd(), 'data', 'unified-vocabulary.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', `unified-vocabulary-backup-${new Date().toISOString().split('T')[0]}.json`);

// Helper functions
function startsWithArticle(german: string): { isNoun: boolean; article?: string; baseWord?: string } {
  const articlePattern = /^(der|die|das)\s+(.+)/i;
  const match = german.match(articlePattern);
  if (match) {
    return { isNoun: true, article: match[1].toLowerCase(), baseWord: match[2] };
  }
  return { isNoun: false };
}

function extractGender(article: string): 'masculine' | 'feminine' | 'neuter' | null {
  const genderMap: Record<string, 'masculine' | 'feminine' | 'neuter'> = {
    der: 'masculine',
    die: 'feminine',
    das: 'neuter'
  };
  return genderMap[article.toLowerCase()] || null;
}

function isVerb(german: string): boolean {
  // Verbs end in -en and don't have articles
  if (startsWithArticle(german).isNoun) return false;
  return /\w+en($|,|\s)/.test(german);
}

function classifyPartOfSpeech(german: string): 'noun' | 'verb' | 'adjective' | 'phrase' {
  const articleCheck = startsWithArticle(german);
  if (articleCheck.isNoun) return 'noun';
  if (isVerb(german)) return 'verb';
  // If it has commas (like "teuer, lieb"), likely adjective
  if (german.includes(',')) return 'adjective';
  // Otherwise, needs manual review
  return 'phrase';
}

function createBasicGrammarForNoun(article: string, baseWord: string): any {
  const gender = extractGender(article);
  if (!gender) return null;

  // Create basic declension structure (can be refined later)
  const capitalizedBase = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
  const pluralGuess = `${capitalizedBase}e`; // Very basic plural guess

  return {
    gender,
    pluralForm: pluralGuess,
    declension: {
      nominative: { singular: capitalizedBase, plural: pluralGuess },
      accusative: { singular: capitalizedBase, plural: pluralGuess },
      dative: { singular: capitalizedBase, plural: `${pluralGuess}n` },
      genitive: { singular: `${capitalizedBase}s`, plural: pluralGuess }
    }
  };
}

function createBasicGrammarForVerb(): any {
  // Create basic conjugation structure (can be refined later)
  return {
    conjugation: {
      presentIndicative: {
        ich: '-',
        du: '-',
        erSieEs: '-',
        wir: '-',
        ihr: '-',
        sieSie: '-'
      }
    }
  };
}

// Main correction function
function correctPhraseItems(data: VocabularyData): {
  corrected: number;
  stillPhrase: number;
  nounsFixed: number;
  verbsFixed: number;
  adjectivesFixed: number;
  details: Array<{ id: string; german: string; oldType: string; newType: string; hasGrammar: boolean }>;
} {
  const stats = {
    corrected: 0,
    stillPhrase: 0,
    nounsFixed: 0,
    verbsFixed: 0,
    adjectivesFixed: 0,
    details: [] as Array<{ id: string; german: string; oldType: string; newType: string; hasGrammar: boolean }>
  };

  for (const item of data.items) {
    if (item.partOfSpeech === 'phrase') {
      const oldType = item.partOfSpeech;
      const newType = classifyPartOfSpeech(item.german);

      if (newType !== 'phrase') {
        item.partOfSpeech = newType;
        stats.corrected++;

        // Add grammar data based on new type
        let grammarAdded = false;
        if (newType === 'noun') {
          const articleCheck = startsWithArticle(item.german);
          if (articleCheck.article && articleCheck.baseWord) {
            const grammar = createBasicGrammarForNoun(articleCheck.article, articleCheck.baseWord);
            if (grammar) {
              item.grammar = grammar;
              grammarAdded = true;
            }
          }
          stats.nounsFixed++;
        } else if (newType === 'verb') {
          item.grammar = createBasicGrammarForVerb();
          grammarAdded = true;
          stats.verbsFixed++;
        } else if (newType === 'adjective') {
          stats.adjectivesFixed++;
          // Adjectives don't need declension in basic form
        }

        stats.details.push({
          id: item.id,
          german: item.german,
          oldType,
          newType,
          hasGrammar: grammarAdded
        });
      } else {
        stats.stillPhrase++;
      }
    }
  }

  return stats;
}

// Main execution
async function main() {
  console.log('🔍 Reading vocabulary data...');
  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  const data: VocabularyData = JSON.parse(rawData);

  console.log(`📊 Total items: ${data.items.length}`);
  const phraseCount = data.items.filter(item => item.partOfSpeech === 'phrase').length;
  console.log(`⚠️  Items marked as "phrase": ${phraseCount}`);

  if (phraseCount === 0) {
    console.log('✅ No "phrase" items found. Nothing to fix!');
    return;
  }

  console.log('\n💾 Creating backup...');
  fs.writeFileSync(BACKUP_PATH, rawData, 'utf-8');
  console.log(`✅ Backup saved: ${BACKUP_PATH}`);

  console.log('\n🔧 Correcting partOfSpeech and adding grammar data...');
  const stats = correctPhraseItems(data);

  console.log('\n📈 Results:');
  console.log(`  ✅ Corrected: ${stats.corrected}`);
  console.log(`    - Nouns: ${stats.nounsFixed}`);
  console.log(`    - Verbs: ${stats.verbsFixed}`);
  console.log(`    - Adjectives: ${stats.adjectivesFixed}`);
  console.log(`  ⚠️  Still "phrase": ${stats.stillPhrase}`);

  if (stats.details.length > 0) {
    console.log('\n📝 Sample corrections (first 10):');
    stats.details.slice(0, 10).forEach((detail, i) => {
      const grammarStatus = detail.hasGrammar ? '✓ grammar added' : '✗ no grammar';
      console.log(`  ${i + 1}. ${detail.german}`);
      console.log(`     ${detail.oldType} → ${detail.newType} (${grammarStatus})`);
    });
  }

  console.log('\n💾 Saving corrected data...');
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✅ Data saved!');

  console.log('\n🎯 Next steps:');
  console.log('  1. Review the corrections in the data file');
  console.log('  2. Test the Grammar tab for "das Buch" and other nouns');
  console.log('  3. Manually review any remaining "phrase" items');
  console.log('  4. Refine plural forms and conjugations as needed');
}

main().catch(console.error);
