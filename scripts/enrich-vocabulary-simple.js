#!/usr/bin/env node

/**
 * Simplified Vocabulary Enrichment Script
 * Focused on systematically enhancing vocabulary items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load vocabulary data
const vocabularyPath = path.join(__dirname, '../data/unified-vocabulary.json');
const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));

console.log('🚀 Starting simplified vocabulary enrichment...');
console.log(`📚 Found ${vocabularyData.length} vocabulary items`);

// Enhanced definitions for common words
const enhancedDefinitions = {
  'Guten Morgen': {
    de: 'Formelle Begrüßung am Morgen (bis ca. 10-11 Uhr).',
    bg: 'Формално поздравление сутрин (до около 10-11 часа).'
  },
  'Guten Tag': {
    de: 'Allgemeine Begrüßung am Tag (ab ca. 10-11 Uhr bis Abend).',
    bg: 'Общо поздравление през деня (от около 10-11 часа до вечер).'
  },
  'die Mutter': {
    de: 'Die weibliche Elternteil; Frau, die ein oder mehrere Kinder geboren hat.',
    bg: 'Женски родител; жена, която е родила едно или повече деца.'
  },
  'der Vater': {
    de: 'Der männliche Elternteil; Mann, der ein oder mehrere Kinder gezeugt hat.',
    bg: 'Мъжки родител; мъж, който е заченал едно или повече деца.'
  },
  'sprechen': {
    de: 'Mit jemandem kommunizieren, Worte sagen, eine Sprache beherrschen.',
    bg: 'Да комуникирам с някого, да говоря, да владея език.'
  }
};

// Cultural notes
const culturalNotes = {
  'Guten Morgen': [
    'In Deutschland wird "Guten Morgen" bis etwa 10-11 Uhr verwendet, danach "Guten Tag".',
    'In Bulgarien wird "Добро утро" bis etwa 10-11 Uhr verwendet, danach "Добър ден".'
  ],
  'die Mutter': [
    'In Deutschland ist Muttertag am zweiten Sonntag im Mai.',
    'In Bulgarien wird Muttertag am 8. März als Teil des Internationalen Frauentags gefeiert.'
  ]
};

// Grammar enrichment rules
function enrichGrammar(item) {
  const grammar = item.grammar || {};
  
  if (item.partOfSpeech === 'noun') {
    // Extract gender from existing grammar info (handle both formats)
    let gender, article, plural;
    
    // Check if grammar is in the new format (grammar.de)
    if (grammar.de) {
      if (grammar.de.includes('feminine')) {
        gender = 'feminine';
        article = 'die';
      } else if (grammar.de.includes('masculine')) {
        gender = 'masculine';
        article = 'der';
      } else if (grammar.de.includes('neuter')) {
        gender = 'neuter';
        article = 'das';
      }
    }
    // Check if grammar is in the old format (flat object)
    else if (grammar.gender) {
      gender = grammar.gender;
      article = grammar.article || ({ masculine: 'der', feminine: 'die', neuter: 'das' }[gender]);
      plural = grammar.plural;
    }
    // Try to infer from the German word itself
    else {
      // Infer from article in the German word
      if (item.german.startsWith('die ')) {
        gender = 'feminine';
        article = 'die';
      } else if (item.german.startsWith('der ')) {
        gender = 'masculine';
        article = 'der';
      } else if (item.german.startsWith('das ')) {
        gender = 'neuter';
        article = 'das';
      }
    }
    
    if (gender) {
      // Use existing plural if available, otherwise create one
      const cleanWord = item.german.replace(/^(der|die|das) /, '');
      
      // Use existing plural from old grammar format if available
      if (!plural && grammar.plural) {
        // Handle different plural formats
        if (typeof grammar.plural === 'string') {
          plural = grammar.plural.replace(/^die /, '');
        } else if (grammar.plural.de) {
          plural = grammar.plural.de.replace(/^die /, '');
        }
      }
      
      // Create plural form if we don't have one
      if (!plural) {
        plural = cleanWord;
        
        if (gender === 'feminine') {
          if (cleanWord.endsWith('in')) plural = cleanWord + 'nen';
          else if (cleanWord.endsWith('ung') || cleanWord.endsWith('heit') || cleanWord.endsWith('keit')) plural = cleanWord + 'en';
          else plural = cleanWord + 'n';
        } else if (gender === 'masculine') {
          if (cleanWord.endsWith('er')) plural = cleanWord;
          else if (cleanWord.endsWith('el')) plural = cleanWord + 'n';
          else plural = cleanWord + 'e';
        } else if (gender === 'neuter') {
          if (cleanWord.endsWith('chen') || cleanWord.endsWith('lein')) plural = cleanWord + 'er';
          else if (cleanWord.endsWith('um')) plural = cleanWord + 'en';
          else plural = cleanWord + 'er';
        }
      }
      
      // Create declension table
      const declension = {
        Nominative: { singular: `${article} ${cleanWord}`, plural: `die ${plural}` },
        Accusative: { singular: gender === 'masculine' ? `den ${cleanWord}` : `${article} ${cleanWord}`, plural: `die ${plural}` },
        Dative: { singular: gender === 'masculine' ? `dem ${cleanWord}` : `der ${cleanWord}`, plural: `den ${plural}n` },
        Genitive: { singular: gender === 'masculine' ? `des ${cleanWord}s` : `der ${cleanWord}`, plural: `der ${plural}` }
      };
      
      return {
        de: {
          gender,
          article,
          plural,
          declension
        },
        bg: grammar.bg || {}
      };
    }
  } else if (item.partOfSpeech === 'verb') {
    // Basic verb conjugation
    const stem = getVerbStem(item.german);
    return {
      de: {
        type: 'regular verb',
        auxiliary: 'haben',
        present: {
          ich: stem + 'e',
          du: stem + 'st',
          'er/sie/es': stem + 't',
          wir: stem + 'en',
          ihr: stem + 't',
          'sie/Sie': stem + 'en'
        }
      },
      bg: grammar.bg || {}
    };
  }
  
  return grammar;
}

function getVerbStem(verb) {
  if (verb.endsWith('eln')) return verb.slice(0, -3);
  if (verb.endsWith('ern')) return verb.slice(0, -3);
  if (verb.endsWith('en')) return verb.slice(0, -2);
  return verb.slice(0, -1);
}

// Process items one by one
let enrichedCount = 0;
const enrichedItems = vocabularyData.map((item, index) => {
  console.log(`\n📝 Processing item ${index + 1}/${vocabularyData.length}: ${item.german}`);
  
  const enrichedItem = { ...item };
  
  // Enhance definitions if available
  if (enhancedDefinitions[item.german]) {
    enrichedItem.definitions = enhancedDefinitions[item.german];
    console.log(`✅ Enhanced definitions for ${item.german}`);
  }
  
  // Add cultural notes if available
  if (culturalNotes[item.german]) {
    enrichedItem.culturalNotes = culturalNotes[item.german];
    console.log(`✅ Added cultural notes for ${item.german}`);
  }
  
  // Enhance grammar
  const newGrammar = enrichGrammar(enrichedItem);
  if (newGrammar && Object.keys(newGrammar).length > 0) {
    enrichedItem.grammar = newGrammar;
    console.log(`✅ Enhanced grammar for ${item.german}`);
    enrichedCount++;
  }
  
  // Ensure tags include CEFR and part of speech
  const tags = new Set(enrichedItem.tags || []);
  tags.add(enrichedItem.cefr);
  tags.add(enrichedItem.partOfSpeech);
  enrichedItem.categories.forEach(cat => tags.add(cat));
  enrichedItem.tags = Array.from(tags);
  
  return enrichedItem;
});

console.log(`\n🎉 Enrichment completed!`);
console.log(`📊 Processed ${vocabularyData.length} items`);
console.log(`📈 Enriched ${enrichedCount} items with grammar information`);

// Save enriched data
const outputPath = path.join(__dirname, '../data/unified-vocabulary.enriched.json');
fs.writeFileSync(outputPath, JSON.stringify(enrichedItems, null, 2));
console.log(`💾 Saved enriched vocabulary to ${outputPath}`);

// Create backup
const backupPath = path.join(__dirname, '../data/unified-vocabulary.backup.json');
fs.writeFileSync(backupPath, JSON.stringify(vocabularyData, null, 2));
console.log(`🔒 Created backup of original data at ${backupPath}`);

console.log('\n🎯 Next steps:');
console.log('1. Review enriched vocabulary file');
console.log('2. Manually enhance specific items as needed');
console.log('3. Add more cultural notes and examples');
console.log('4. Validate grammatical accuracy');