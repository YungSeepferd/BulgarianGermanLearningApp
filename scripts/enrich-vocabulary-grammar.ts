#!/usr/bin/env tsx
/**
 * Vocabulary Grammar Enrichment Script
 * 
 * Auto-detects and adds missing grammatical information:
 * - Noun gender from articles (der/die/das)
 * - Noun plural forms (common patterns)
 * - Verb conjugations (present tense)
 * - Adjective declensions
 * 
 * Usage: pnpm tsx scripts/enrich-vocabulary-grammar.ts [--dry-run] [--limit N]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface GrammarInfo {
  gender?: 'masculine' | 'feminine' | 'neuter';
  pluralForm?: string;
  verbAspect?: 'perfective' | 'imperfective' | null;
  conjugation?: {
    present: Record<string, string>;
    past?: Record<string, string>;
  };
  declension?: Record<string, { singular?: string; plural?: string }>;
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  cefrLevel?: string;
  categories: string[];
  difficulty: number;
  grammar?: GrammarInfo;
  examples?: Array<{ german: string; bulgarian: string }>;
}

interface EnrichmentStats {
  nounsEnriched: number;
  verbsEnriched: number;
  adjectivesEnriched: number;
  skipped: number;
  errors: string[];
}

// German article to gender mapping
const ARTICLE_GENDER: Record<string, 'masculine' | 'feminine' | 'neuter'> = {
  'der': 'masculine',
  'die': 'feminine',
  'das': 'neuter',
  'ein': 'neuter',  // ein (neuter) is more common than ein (masculine)
  'eine': 'feminine',
  'einen': 'masculine'
};

// Common German plural patterns
const PLURAL_PATTERNS: Array<{ pattern: RegExp; suffix: string }> = [
  { pattern: /um$/i, suffix: 'en' },      // Datum -> Daten
  { pattern: /us$/i, suffix: 'se' },      // Fokus -> Fokusse
  { pattern: /on$/i, suffix: 'en' },      // Funktion -> Funktionen
  { pattern: /ei$/i, suffix: 'en' },      // Bäckerei -> Bäckereien
  { pattern: /heit$/i, suffix: 'en' },    // Freiheit -> Freiheiten
  { pattern: /keit$/i, suffix: 'en' },    // Möglichkeit -> Möglichkeiten
  { pattern: /ung$/i, suffix: 'en' },      // Bildung -> Bildungen
  { pattern: /schaft$/i, suffix: 'en' },   // Wissenschaft -> Wissenschaften
  { pattern: /tum$/i, suffix: 'er' },      // Irrtum -> Irrtümer
  { pattern: /ling$/i, suffix: 'e' },     // Lehrling -> Lehrlinge
  { pattern: /ich$/i, suffix: 'e' },      // Teppich -> Teppiche
  { pattern: /ig$/i, suffix: 'e' },        // Honig -> Honige
  { pattern: /el$/i, suffix: '' },         // Apfel -> Äpfel (umlaut)
  { pattern: /en$/i, suffix: '' },         // Garten -> Gärten (umlaut)
  { pattern: /er$/i, suffix: '' },         // Lehrer -> Lehrer (same)
  { pattern: /eur$/i, suffix: 'en' },      // Ingenieur -> Ingenieure
  { pattern: /ier$/i, suffix: 'e' },       // Tier -> Tiere
];

// Common German verb conjugation patterns
const VERB_CONJUGATIONS: Record<string, Record<string, string>> = {
  // Regular -en verbs
  'gehen': {
    'ich': 'gehe',
    'du': 'gehst',
    'er/sie/es': 'geht',
    'wir': 'gehen',
    'ihr': 'geht',
    'sie/Sie': 'gehen'
  },
  'sein': {
    'ich': 'bin',
    'du': 'bist',
    'er/sie/es': 'ist',
    'wir': 'sind',
    'ihr': 'seid',
    'sie/Sie': 'sind'
  },
  'haben': {
    'ich': 'habe',
    'du': 'hast',
    'er/sie/es': 'hat',
    'wir': 'haben',
    'ihr': 'habt',
    'sie/Sie': 'haben'
  },
  'werden': {
    'ich': 'werde',
    'du': 'wirst',
    'er/sie/es': 'wird',
    'wir': 'werden',
    'ihr': 'werdet',
    'sie/Sie': 'werden'
  }
};

function detectNounGender(german: string): 'masculine' | 'feminine' | 'neuter' | null {
  const words = german.toLowerCase().split(/\s+/);
  const firstWord = words[0];
  
  if (ARTICLE_GENDER[firstWord]) {
    return ARTICLE_GENDER[firstWord];
  }
  
  // Heuristics for words without articles
  // Words ending in -e are often feminine
  if (german.match(/[^aeiou]e$/i) && !german.match(/(der|die|das)\s/i)) {
    return 'feminine';
  }
  // Words ending in -er, -ig, -ling are often masculine
  if (german.match(/(er|ig|ling)$/i)) {
    return 'masculine';
  }
  // Words ending in -chen, -lein, -tum are neuter
  if (german.match(/(chen|lein|tum)$/i)) {
    return 'neuter';
  }
  
  return null;
}

function generatePluralForm(singular: string, gender: 'masculine' | 'feminine' | 'neuter' | null): string | null {
  // Remove article if present
  const word = singular.replace(/^(der|die|das|ein|eine)\s+/i, '');
  
  // Check patterns
  for (const { pattern, suffix } of PLURAL_PATTERNS) {
    if (pattern.test(word)) {
      return word + suffix;
    }
  }
  
  // Default patterns by gender
  if (gender === 'feminine') {
    // Most feminine nouns add -en or -n
    return word + (word.endsWith('e') ? 'n' : 'en');
  } else if (gender === 'neuter') {
    // Many neuter nouns add -er with umlaut
    // This is a simplification - actual plural requires dictionary lookup
    return word + 'er';
  } else {
    // Masculine nouns often add -e or -en
    return word + 'e';
  }
}

function generateConjugation(infinitive: string): Record<string, string> | null {
  // Check if we have a predefined conjugation
  if (VERB_CONJUGATIONS[infinitive.toLowerCase()]) {
    return VERB_CONJUGATIONS[infinitive.toLowerCase()];
  }
  
  // Regular verb conjugation
  const stem = infinitive.replace(/en$/, '').replace(/n$/, '');
  
  // Check for stem vowel change (e -> i, a -> ä, etc.)
  const stemVowel = stem.match(/[aeiouäöü]/i)?.[0];
  
  // Regular conjugation
  return {
    'ich': stem + 'e',
    'du': stem + 'st',
    'er/sie/es': stem + 't',
    'wir': infinitive,
    'ihr': stem + 't',
    'sie/Sie': infinitive
  };
}

function enrichItem(item: VocabularyItem, stats: EnrichmentStats): VocabularyItem {
  const enriched = { ...item };
  
  if (!enriched.grammar) {
    enriched.grammar = {};
  }
  
  switch (item.partOfSpeech) {
    case 'noun':
      // Detect gender
      if (!enriched.grammar.gender) {
        const gender = detectNounGender(item.german);
        if (gender) {
          enriched.grammar.gender = gender;
          stats.nounsEnriched++;
        }
      }
      
      // Generate plural form
      if (!enriched.grammar.pluralForm) {
        const plural = generatePluralForm(item.german, enriched.grammar.gender || null);
        if (plural) {
          enriched.grammar.pluralForm = plural;
        }
      }
      break;
      
    case 'verb':
      // Generate conjugation
      if (!enriched.grammar.conjugation) {
        const conj = generateConjugation(item.german);
        if (conj) {
          enriched.grammar.conjugation = { present: conj };
          stats.verbsEnriched++;
        }
      }
      break;
      
    case 'adjective':
      // Adjective declension would require more complex logic
      // For now, just mark as needing manual review
      break;
      
    default:
      stats.skipped++;
  }
  
  return enriched;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const checkOnly = args.includes('--check-only');
  const limitArg = args.find(a => a.startsWith('--limit'));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;
  
  console.log('🔧 Vocabulary Grammar Enrichment\n');
  console.log('='.repeat(60));
  if (dryRun) {
    console.log('📋 DRY RUN - No changes will be made\n');
  }
  if (checkOnly) {
    console.log('🔍 CHECK ONLY - Will report missing grammar without changes\n');
  }
  
  const vocabularyPath = join(process.cwd(), 'static/data/vocabulary/index.json');
  const data = JSON.parse(readFileSync(vocabularyPath, 'utf-8'));
  const items: VocabularyItem[] = data.items;
  
  console.log(`📊 Processing ${Math.min(items.length, limit)} items...\n`);
  
  const stats: EnrichmentStats = {
    nounsEnriched: 0,
    verbsEnriched: 0,
    adjectivesEnriched: 0,
    skipped: 0,
    errors: []
  };
  
  const enrichedItems = items.slice(0, limit).map(item => {
    try {
      return enrichItem(item, stats);
    } catch (error) {
      stats.errors.push(`Item ${item.id}: ${error}`);
      return item;
    }
  });
  
  // If limit was applied, append remaining items unchanged
  const allItems = limit < items.length 
    ? [...enrichedItems, ...items.slice(limit)]
    : enrichedItems;
  
  console.log('📈 Enrichment Results:');
  console.log(`   Nouns enriched with gender:    ${stats.nounsEnriched}`);
  console.log(`   Verbs enriched with conjugations: ${stats.verbsEnriched}`);
  console.log(`   Adjectives processed:          ${stats.adjectivesEnriched}`);
  console.log(`   Skipped (phrases, etc.):      ${stats.skipped}`);
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    stats.errors.forEach(e => { console.log(`   ${e}`); });
  }
  
  if (checkOnly) {
    // Report items missing grammar
    const missingGrammar = items.filter(item => {
      if (item.partOfSpeech === 'noun' && !item.grammar?.gender) return true;
      if (item.partOfSpeech === 'verb' && !item.grammar?.conjugation) return true;
      return false;
    });
    
    console.log('\n📊 Grammar Completeness Check:');
    console.log(`   Total items: ${items.length}`);
    console.log(`   Missing grammar: ${missingGrammar.length}`);
    console.log(`   Completeness: ${((items.length - missingGrammar.length) / items.length * 100).toFixed(1)}%`);
    
    if (missingGrammar.length > 0) {
      console.log('\n⚠️  Items needing grammar enrichment:');
      missingGrammar.slice(0, 10).forEach(item => {
        console.log(`   - ${item.german} (${item.partOfSpeech}): missing ${item.partOfSpeech === 'noun' ? 'gender' : 'conjugation'}`);
      });
      if (missingGrammar.length > 10) {
        console.log(`   ... and ${missingGrammar.length - 10} more`);
      }
      process.exit(1);
    }
    
    console.log('\n✅ All items have grammar information!');
    process.exit(0);
  }
  
  if (!dryRun) {
    const outputPath = join(process.cwd(), 'static/data/vocabulary/index.json');
    const outputData = {
      ...data,
      items: allItems,
      lastUpdated: new Date().toISOString()
    };
    writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\n✅ Saved enriched vocabulary to: ${outputPath}`);
  } else {
    console.log('\n📋 Dry run complete. No changes made.');
    console.log('   Run without --dry-run to apply changes.');
  }
  
  // Show examples
  console.log('\n📝 Example enrichments:');
  const examples = enrichedItems
    .filter(i => i.grammar?.gender || i.grammar?.conjugation)
    .slice(0, 5);
  
  examples.forEach(item => {
    if (item.grammar?.gender) {
      console.log(`   ${item.german} → gender: ${item.grammar.gender}`);
    }
    if (item.grammar?.conjugation) {
      console.log(`   ${item.german} → conjugation: ich ${item.grammar.conjugation.present['ich']}`);
    }
  });
}

main();