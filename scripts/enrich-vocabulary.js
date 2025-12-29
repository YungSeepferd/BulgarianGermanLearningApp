#!/usr/bin/env node

/**
 * Vocabulary Enrichment Script
 * Systematic enhancement of vocabulary items with grammatical and cultural information
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

// Grammar reference data
const germanGrammar = {
  nouns: {
    // Common noun patterns and declensions
    feminine: {
      patterns: ['die Mutter', 'die Schwester', 'die Frau'],
      declensionTemplate: {
        Nominative: { singular: 'die {word}', plural: 'die {plural}' },
        Accusative: { singular: 'die {word}', plural: 'die {plural}' },
        Dative: { singular: 'der {word}', plural: 'den {plural}n' },
        Genitive: { singular: 'der {word}', plural: 'der {plural}' }
      }
    },
    masculine: {
      patterns: ['der Vater', 'der Mann', 'der Tag'],
      declensionTemplate: {
        Nominative: { singular: 'der {word}', plural: 'die {plural}' },
        Accusative: { singular: 'den {word}', plural: 'die {plural}' },
        Dative: { singular: 'dem {word}', plural: 'den {plural}n' },
        Genitive: { singular: 'des {word}s', plural: 'der {plural}' }
      }
    },
    neuter: {
      patterns: ['das Kind', 'das Haus', 'das Buch'],
      declensionTemplate: {
        Nominative: { singular: 'das {word}', plural: 'die {plural}' },
        Accusative: { singular: 'das {word}', plural: 'die {plural}' },
        Dative: { singular: 'dem {word}', plural: 'den {plural}n' },
        Genitive: { singular: 'des {word}s', plural: 'der {plural}' }
      }
    }
  },
  verbs: {
    strong: ['sprechen', 'verstehen', 'essen', 'geben', 'nehmen'],
    weak: ['machen', 'arbeiten', 'lernen', 'studieren'],
    mixed: ['bringen', 'denken', 'wissen']
  }
};

const bulgarianGrammar = {
  nouns: {
    feminine: {
      patterns: ['майката', 'сестрата', 'жената'],
      definiteArticle: '-та',
      pluralPattern: (word) => {
        if (word.endsWith('ка')) return word.slice(0, -1) + 'ки';
        if (word.endsWith('а')) return word.slice(0, -1) + 'и';
        return word + 'и';
      }
    },
    masculine: {
      patterns: ['бащата', 'мъжът', 'денят'],
      definiteArticle: '-ът',
      pluralPattern: (word) => {
        if (word.endsWith('т')) return word.slice(0, -1) + 'ти';
        if (word.endsWith('к')) return word.slice(0, -1) + 'ци';
        return word + 'ове';
      }
    },
    neuter: {
      patterns: ['детето', 'кучето', 'момичето'],
      definiteArticle: '-то',
      pluralPattern: (word) => {
        if (word.endsWith('е')) return word.slice(0, -1) + 'та';
        if (word.endsWith('о')) return word.slice(0, -1) + 'а';
        return word + 'та';
      }
    }
  }
};

// Enhanced definitions
const enhancedDefinitions = {
  'die Mutter': {
    de: 'Die weibliche Elternteil; Frau, die ein oder mehrere Kinder geboren hat.',
    bg: 'Женски родител; жена, която е родила едно или повече деца.'
  },
  'der Vater': {
    de: 'Der männliche Elternteil; Mann, der ein oder mehrere Kinder gezeugt hat.',
    bg: 'Мъжки родител; мъж, който е заченал едно или повече деца.'
  },
  'die Schwester': {
    de: 'Weibliches Geschwister; Schwester einer Person.',
    bg: 'Женско братче; сестра на човек.'
  },
  'sprechen': {
    de: 'Mit jemandem kommunizieren, Worte sagen, eine Sprache beherrschen.',
    bg: 'Да комуникирам с някого, да говоря, да владея език.'
  },
  'verstehen': {
    de: 'Das Sinn oder Bedeutung einer Sache erfassen, begreifen, nachvollziehen können.',
    bg: 'Да разбера смисъла или значението на нещо, да схвана, да проумея.'
  }
};

// Cultural notes
const culturalNotes = {
  'die Mutter': [
    'In German culture, Mother\'s Day (\'Muttertag\') is celebrated on the second Sunday in May.',
    'In Bulgarian culture, Mother\'s Day (\'Ден на майката\') is celebrated on March 8th as part of International Women\'s Day.',
    'The word \'Mutter\' is also used in many German compound words like \'Muttersprache\' (mother tongue).'
  ],
  'der Vater': [
    'Father\'s Day in Germany is celebrated on Ascension Day (Christihimmelfahrt).',
    'In Bulgaria, Father\'s Day is not officially celebrated, but there are initiatives to establish it.',
    'The German word \'Vater\' is used in expressions like \'Vater Staat\' (the state as provider).'
  ],
  'Guten Morgen': [
    'In Germany, \'Guten Morgen\' is used until about 10-11 AM, after which \'Guten Tag\' is more appropriate.',
    'In Bulgaria, \'Добро утро\' is used until about 10-11 AM, after which \'Добър ден\' is used.',
    'Formal variant: \'Guten Morgen, Herr/Frau [Nachname]\'; Informal: \'Morgen!\''
  ]
};

// Enhanced examples
const enhancedExamples = {
  'die Mutter': [
    {
      german: 'Meine Mutter kocht sehr gut.',
      bulgarian: 'Майка ми готви много добре.',
      context: 'family'
    },
    {
      german: 'Die Mutter des Kindes wartet draußen.',
      bulgarian: 'Майката на детето чака отвън.',
      context: 'neutral'
    },
    {
      german: 'Ich habe meiner Mutter ein Geschenk gekauft.',
      bulgarian: 'Купих подарък на майка си.',
      context: 'personal'
    }
  ],
  'der Vater': [
    {
      german: 'Mein Vater arbeitet als Ingenieur.',
      bulgarian: 'Баща ми работи като инженер.',
      context: 'profession'
    },
    {
      german: 'Der Vater hilft seinem Sohn bei den Hausaufgaben.',
      bulgarian: 'Бащата помага на сина си с домашните.',
      context: 'family'
    }
  ]
};

// Enrich a single vocabulary item
function enrichVocabularyItem(item) {
  const enrichedItem = { ...item };
  
  // Enhance definitions
  if (enhancedDefinitions[item.german]) {
    enrichedItem.definitions = enhancedDefinitions[item.german];
  }
  
  // Add cultural notes
  if (culturalNotes[item.german]) {
    enrichedItem.culturalNotes = culturalNotes[item.german];
  }
  
  // Enhance examples
  if (enhancedExamples[item.german]) {
    enrichedItem.examples = enhancedExamples[item.german];
  }
  
  // Enhance grammar based on part of speech
  switch (item.partOfSpeech) {
    case 'noun':
      enrichedItem = enrichNoun(enrichedItem);
      break;
    case 'verb':
      enrichedItem = enrichVerb(enrichedItem);
      break;
    case 'adjective':
      enrichedItem = enrichAdjective(enrichedItem);
      break;
    case 'phrase':
      enrichedItem = enrichPhrase(enrichedItem);
      break;
  }
  
  // Add metadata
  enrichedItem.metadata = createMetadata(enrichedItem);
  
  // Add tags
  enrichedItem.tags = createTags(enrichedItem);
  
  return enrichedItem;
}

function enrichNoun(item) {
  const enriched = { ...item };
  
  // Parse current grammar info
  const currentGrammar = item.grammar || {};
  const deInfo = currentGrammar.de || '';
  const bgInfo = currentGrammar.bg || '';
  
  // Extract gender and article from German
  let gender, article;
  if (deInfo.includes('feminine')) {
    gender = 'feminine';
    article = 'die';
  } else if (deInfo.includes('masculine')) {
    gender = 'masculine';
    article = 'der';
  } else if (deInfo.includes('neuter')) {
    gender = 'neuter';
    article = 'das';
  }
  
  // Create plural form
  const plural = createGermanPlural(item.german, gender);
  
  // Create declension table
  const declension = createGermanDeclension(item.german, plural, gender, article);
  
  // Extract Bulgarian definite article
  let bgArticle = '';
  if (bgInfo.includes('-та')) bgArticle = '-та';
  else if (bgInfo.includes('-ът')) bgArticle = '-ът';
  else if (bgInfo.includes('-то')) bgArticle = '-то';
  
  // Create Bulgarian plural
  const bgPlural = createBulgarianPlural(item.bulgarian);
  
  // Create vocative form
  const vocative = createBulgarianVocative(item.bulgarian);
  
  enriched.grammar = {
    de: {
      gender,
      article,
      plural,
      declension
    },
    bg: {
      gender,
      definiteArticle: bgArticle,
      plural: bgPlural,
      vocative
    }
  };
  
  return enriched;
}

function createGermanPlural(word, gender) {
  // Remove article if present
  const cleanWord = word.replace(/^(der|die|das) /, '');
  
  // Common plural patterns
  if (gender === 'feminine') {
    if (cleanWord.endsWith('in')) return cleanWord + 'nen';
    if (cleanWord.endsWith('ung')) return cleanWord + 'en';
    if (cleanWord.endsWith('heit') || cleanWord.endsWith('keit')) return cleanWord + 'en';
    return cleanWord + 'n';
  }
  
  if (gender === 'masculine') {
    if (cleanWord.endsWith('er')) return cleanWord;
    if (cleanWord.endsWith('el')) return cleanWord + 'n';
    if (cleanWord.endsWith('en')) return cleanWord;
    return cleanWord + 'e';
  }
  
  if (gender === 'neuter') {
    if (cleanWord.endsWith('chen')) return cleanWord + 'er';
    if (cleanWord.endsWith('lein')) return cleanWord + 'er';
    if (cleanWord.endsWith('um')) return cleanWord + 'en';
    return cleanWord + 'er';
  }
  
  return cleanWord + 'en'; // Default
}

function createGermanDeclension(word, plural, gender, article) {
  // Remove article from word
  const cleanWord = word.replace(/^(der|die|das) /, '');
  
  const templates = {
    feminine: {
      Nominative: { singular: `die ${cleanWord}`, plural: `die ${plural}` },
      Accusative: { singular: `die ${cleanWord}`, plural: `die ${plural}` },
      Dative: { singular: `der ${cleanWord}`, plural: `den ${plural}n` },
      Genitive: { singular: `der ${cleanWord}`, plural: `der ${plural}` }
    },
    masculine: {
      Nominative: { singular: `der ${cleanWord}`, plural: `die ${plural}` },
      Accusative: { singular: `den ${cleanWord}`, plural: `die ${plural}` },
      Dative: { singular: `dem ${cleanWord}`, plural: `den ${plural}n` },
      Genitive: { singular: `des ${cleanWord}s`, plural: `der ${plural}` }
    },
    neuter: {
      Nominative: { singular: `das ${cleanWord}`, plural: `die ${plural}` },
      Accusative: { singular: `das ${cleanWord}`, plural: `die ${plural}` },
      Dative: { singular: `dem ${cleanWord}`, plural: `den ${plural}n` },
      Genitive: { singular: `des ${cleanWord}s`, plural: `der ${plural}` }
    }
  };
  
  return templates[gender] || templates.feminine;
}

function createBulgarianPlural(word) {
  // Remove definite article
  const cleanWord = word.replace(/(-та|-ът|-то)$/, '');
  
  if (cleanWord.endsWith('ка')) return cleanWord.slice(0, -1) + 'ки';
  if (cleanWord.endsWith('а')) return cleanWord.slice(0, -1) + 'и';
  if (cleanWord.endsWith('я')) return cleanWord.slice(0, -1) + 'и';
  if (cleanWord.endsWith('т')) return cleanWord.slice(0, -1) + 'ти';
  if (cleanWord.endsWith('к')) return cleanWord.slice(0, -1) + 'ци';
  if (cleanWord.endsWith('е')) return cleanWord.slice(0, -1) + 'та';
  if (cleanWord.endsWith('о')) return cleanWord.slice(0, -1) + 'а';
  
  return cleanWord + 'ове'; // Default
}

function createBulgarianVocative(word) {
  // Remove definite article
  const cleanWord = word.replace(/(-та|-ът|-то)$/, '');
  
  if (cleanWord.endsWith('а')) return cleanWord.slice(0, -1) + 'о';
  if (cleanWord.endsWith('я')) return cleanWord.slice(0, -1) + 'о';
  if (cleanWord.endsWith('ка')) return cleanWord.slice(0, -1) + 'ко';
  if (cleanWord.endsWith('т')) return cleanWord.slice(0, -1) + 'те';
  if (cleanWord.endsWith('к')) return cleanWord.slice(0, -1) + 'ко';
  
  return cleanWord; // Default (no change)
}

function enrichVerb(item) {
  const enriched = { ...item };
  const currentGrammar = item.grammar || {};
  
  // Determine verb type
  const verbType = germanGrammar.verbs.strong.includes(item.german) ? 'strong' : 
                   germanGrammar.verbs.mixed.includes(item.german) ? 'mixed' : 'weak';
  
  // Determine auxiliary
  const auxiliary = verbType === 'strong' ? 'haben' : 'haben'; // Most verbs use haben
  
  // Create basic conjugation
  const conjugation = createGermanConjugation(item.german, verbType);
  
  enriched.grammar = {
    de: {
      type: verbType + ' verb',
      auxiliary,
      separable: item.german.includes('-') || item.german.includes('ab') || item.german.includes('an'),
      conjugation,
      ...currentGrammar
    },
    bg: {
      type: 'imperfective', // Default, would need specific analysis
      ...(currentGrammar.bg || {})
    }
  };
  
  return enriched;
}

function createGermanConjugation(verb, type) {
  const stem = getVerbStem(verb);
  
  // Present tense
  const present = {
    'ich': stem + (type === 'strong' ? 'e' : 'e'),
    'du': stem + (type === 'strong' ? 'st' : 'st'),
    'er/sie/es': stem + (type === 'strong' ? 't' : 't'),
    'wir': stem + 'en',
    'ihr': stem + 't',
    'sie/Sie': stem + 'en'
  };
  
  // Past tense (simplified)
  const past = {
    'ich': type === 'strong' ? getStrongPast(verb) : stem + 'te',
    'du': type === 'strong' ? getStrongPast(verb) + 'st' : stem + 'test',
    'er/sie/es': type === 'strong' ? getStrongPast(verb) : stem + 'te',
    'wir': type === 'strong' ? getStrongPast(verb) + 'en' : stem + 'ten',
    'ihr': type === 'strong' ? getStrongPast(verb) + 't' : stem + 'tet',
    'sie/Sie': type === 'strong' ? getStrongPast(verb) + 'en' : stem + 'ten'
  };
  
  return {
    present,
    past,
    perfect: getPastParticiple(verb, type),
    imperative: {
      'du': stem + (type === 'strong' ? '' : 'e'),
      'ihr': stem + 't',
      'Sie': stem + 'en Sie'
    }
  };
}

function getVerbStem(verb) {
  if (verb.endsWith('eln')) return verb.slice(0, -3);
  if (verb.endsWith('ern')) return verb.slice(0, -3);
  if (verb.endsWith('en')) return verb.slice(0, -2);
  return verb.slice(0, -1);
}

function getStrongPast(verb) {
  // Simplified strong past forms
  const strongPastMap = {
    'sprechen': 'sprach',
    'verstehen': 'verstand',
    'essen': 'aß',
    'geben': 'gab',
    'nehmen': 'nahm'
  };
  
  return strongPastMap[verb] || verb.slice(0, -1) + 'te';
}

function getPastParticiple(verb, type) {
  const strongParticipleMap = {
    'sprechen': 'gesprochen',
    'verstehen': 'verstanden',
    'essen': 'gegessen',
    'geben': 'gegeben',
    'nehmen': 'genommen'
  };
  
  if (type === 'strong') {
    return strongParticipleMap[verb] || 'ge' + verb + 'en';
  }
  
  return 'ge' + verb + 't';
}

function enrichAdjective(item) {
  const enriched = { ...item };
  const currentGrammar = item.grammar || {};
  
  // Create comparative and superlative
  const comparative = createGermanComparative(item.german);
  const superlative = createGermanSuperlative(item.german);
  
  enriched.grammar = {
    de: {
      comparative,
      superlative,
      adverb: item.german, // Default, would need specific rules
      ...currentGrammar
    },
    bg: {
      comparative: 'по-' + item.bulgarian,
      superlative: 'най-' + item.bulgarian,
      ...(currentGrammar.bg || {})
    }
  };
  
  return enriched;
}

function createGermanComparative(adj) {
  if (adj.endsWith('e')) return adj + 'r';
  if (adj.endsWith('el')) return adj.slice(0, -1) + 'ler';
  if (adj.endsWith('er')) return adj + 'er';
  return adj + 'er';
}

function createGermanSuperlative(adj) {
  return 'am ' + createGermanComparative(adj) + 'sten';
}

function enrichPhrase(item) {
  const enriched = { ...item };
  
  // Enhance definitions with usage context
  if (!enriched.definitions || Object.keys(enriched.definitions).length === 0) {
    enriched.definitions = {
      german: `Eine übliche ${item.partOfSpeech} im Deutschen.`,
      bulgarian: `Обичайна ${item.partOfSpeech} на български.`
    };
  }
  
  // Add variants if not present
  if (!enriched.variants) {
    enriched.variants = {
      formal: { de: item.german, bg: item.bulgarian },
      informal: { de: item.german, bg: item.bulgarian }
    };
  }
  
  return enriched;
}

function createMetadata(item) {
  const metadata = {};
  
  // Extract basic info from grammar
  if (item.grammar?.de) {
    if (item.grammar.de.gender) metadata.gender = item.grammar.de.gender;
    if (item.grammar.de.article) metadata.article = item.grammar.de.article;
    if (item.grammar.de.plural) metadata.pluralForm = item.grammar.de.plural;
    if (item.grammar.de.declension) metadata.declension = item.grammar.de.declension;
  }
  
  return metadata;
}

function createTags(item) {
  const tags = item.tags || [];
  
  // Add CEFR level tag
  if (item.cefr && !tags.includes(item.cefr)) {
    tags.push(item.cefr);
  }
  
  // Add part of speech tag
  if (!tags.includes(item.partOfSpeech)) {
    tags.push(item.partOfSpeech);
  }
  
  // Add category tags
  item.categories.forEach(cat => {
    if (!tags.includes(cat)) {
      tags.push(cat);
    }
  });
  
  return tags;
}

// Main enrichment function
function enrichVocabularyData(data) {
  return data.map((item, index) => {
    console.log(`Enriching item ${index + 1}/${data.length}: ${item.german}`);
    
    try {
      const enrichedItem = enrichVocabularyItem(item);
      console.log(`✅ Enriched: ${item.german} -> ${JSON.stringify(enrichedItem.grammar, null, 2).substring(0, 100)}...`);
      return enrichedItem;
    } catch (error) {
      console.error(`❌ Error enriching ${item.german}:`, error.message);
      return item; // Return original if error
    }
  });
}

// Process vocabulary in batches
function processInBatches(data, batchSize = 10) {
  const enrichedData = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const enrichedBatch = enrichVocabularyData(batch);
    enrichedData.push(...enrichedBatch);
    
    console.log(`\n📊 Batch ${Math.floor(i / batchSize) + 1} completed: ${enrichedBatch.length} items processed`);
    console.log(`📈 Total progress: ${enrichedData.length}/${data.length} (${Math.round((enrichedData.length / data.length) * 100)}%)`);
    
    // Save progress after each batch
    const progressData = JSON.stringify(enrichedData, null, 2);
    fs.writeFileSync(vocabularyPath + '.enriched', progressData);
    console.log(`💾 Progress saved to ${vocabularyPath}.enriched`);
  }
  
  return enrichedData;
}

// Main execution
console.log('🚀 Starting vocabulary enrichment process...');
console.log(`📚 Processing ${vocabularyData.length} vocabulary items...`);

// Process in batches to handle large dataset
const enrichedVocabulary = processInBatches(vocabularyData, 5);

console.log('\n🎉 Vocabulary enrichment completed!');
console.log(`📊 Total items processed: ${enrichedVocabulary.length}`);

// Save final result
const outputPath = vocabularyPath.replace('.json', '.enriched.json');
fs.writeFileSync(outputPath, JSON.stringify(enrichedVocabulary, null, 2));
console.log(`💾 Final enriched vocabulary saved to ${outputPath}`);

// Create backup of original
const backupPath = vocabularyPath.replace('.json', '.backup-' + new Date().toISOString().slice(0, 10) + '.json');
fs.writeFileSync(backupPath, JSON.stringify(vocabularyData, null, 2));
console.log(`🔒 Original vocabulary backed up to ${backupPath}`);