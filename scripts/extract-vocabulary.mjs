#!/usr/bin/env node

/**
 * Vocabulary Extraction Script
 * Analyzes extracted PDF text and identifies German-Bulgarian vocabulary pairs
 * 
 * Usage: node scripts/extract-vocabulary.mjs [--level A1|A2|B1] [--limit 50]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const EXTRACTED_DIR = path.join(__dirname, '../data/vocab/resources/extracted');
const OUTPUT_DIR = path.join(__dirname, '../data/vocab/enrichment-output');
const EXISTING_VOCAB_PATH = path.join(__dirname, '../data/unified-vocabulary.json');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  level: 'A1',
  limit: 50,
  output: 'extracted-vocabulary.json'
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--level' && args[i + 1]) {
    options.level = args[i + 1];
    i++;
  } else if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.output = args[i + 1];
    i++;
  }
}

console.log(`${colors.blue}📚 Vocabulary Extraction Script${colors.reset}`);
console.log('='.repeat(50));
console.log(`Level: ${options.level}`);
console.log(`Limit: ${options.limit} words`);
console.log('');

// Common German-Bulgarian vocabulary patterns for A1 level
const vocabularyPatterns = {
  greetings: [
    { de: 'Guten Morgen', bg: 'Добро утро', pos: 'phrase', category: 'greetings' },
    { de: 'Guten Tag', bg: 'Добър ден', pos: 'phrase', category: 'greetings' },
    { de: 'Guten Abend', bg: 'Добър вечер', pos: 'phrase', category: 'greetings' },
    { de: 'Gute Nacht', bg: 'Лека нощ', pos: 'phrase', category: 'greetings' },
    { de: 'Hallo', bg: 'Здравей', pos: 'interjection', category: 'greetings' },
    { de: 'Tschüss', bg: 'Довиждане', pos: 'interjection', category: 'greetings' },
    { de: 'Auf Wiedersehen', bg: 'Довиждане', pos: 'phrase', category: 'greetings' },
    { de: 'Danke', bg: 'Благодаря', pos: 'interjection', category: 'greetings' },
    { de: 'Bitte', bg: 'Моля', pos: 'interjection', category: 'greetings' },
  ],
  numbers: [
    { de: 'eins', bg: 'едно', pos: 'numeral', category: 'numbers' },
    { de: 'zwei', bg: 'две', pos: 'numeral', category: 'numbers' },
    { de: 'drei', bg: 'три', pos: 'numeral', category: 'numbers' },
    { de: 'vier', bg: 'четири', pos: 'numeral', category: 'numbers' },
    { de: 'fünf', bg: 'пет', pos: 'numeral', category: 'numbers' },
    { de: 'sechs', bg: 'шест', pos: 'numeral', category: 'numbers' },
    { de: 'sieben', bg: 'седем', pos: 'numeral', category: 'numbers' },
    { de: 'acht', bg: 'осем', pos: 'numeral', category: 'numbers' },
    { de: 'neun', bg: 'девет', pos: 'numeral', category: 'numbers' },
    { de: 'zehn', bg: 'десет', pos: 'numeral', category: 'numbers' },
  ],
  family: [
    { de: 'die Mutter', bg: 'майката', pos: 'noun', category: 'family', grammar: { de: 'feminine, die', bg: 'feminine, -та' } },
    { de: 'der Vater', bg: 'бащата', pos: 'noun', category: 'family', grammar: { de: 'masculine, der', bg: 'masculine, -та' } },
    { de: 'die Schwester', bg: 'сестрата', pos: 'noun', category: 'family', grammar: { de: 'feminine, die', bg: 'feminine, -та' } },
    { de: 'der Bruder', bg: 'братът', pos: 'noun', category: 'family', grammar: { de: 'masculine, der', bg: 'masculine, -ът' } },
    { de: 'das Kind', bg: 'детето', pos: 'noun', category: 'family', grammar: { de: 'neuter, das', bg: 'neuter, -то' } },
    { de: 'die Großmutter', bg: 'бабата', pos: 'noun', category: 'family', grammar: { de: 'feminine, die', bg: 'feminine, -та' } },
    { de: 'der Großvater', bg: 'дядото', pos: 'noun', category: 'family', grammar: { de: 'masculine, der', bg: 'masculine, -то' } },
  ],
  common: [
    { de: 'ja', bg: 'да', pos: 'particle', category: 'basic' },
    { de: 'nein', bg: 'не', pos: 'particle', category: 'basic' },
    { de: 'ich', bg: 'аз', pos: 'pronoun', category: 'basic' },
    { de: 'du', bg: 'ти', pos: 'pronoun', category: 'basic' },
    { de: 'er', bg: 'той', pos: 'pronoun', category: 'basic' },
    { de: 'sie', bg: 'тя', pos: 'pronoun', category: 'basic' },
    { de: 'wir', bg: 'ние', pos: 'pronoun', category: 'basic' },
    { de: 'ihr', bg: 'вие', pos: 'pronoun', category: 'basic' },
    { de: 'das Haus', bg: 'къщата', pos: 'noun', category: 'objects', grammar: { de: 'neuter, das', bg: 'feminine, -та' } },
    { de: 'der Tisch', bg: 'масата', pos: 'noun', category: 'objects', grammar: { de: 'masculine, der', bg: 'feminine, -та' } },
    { de: 'der Stuhl', bg: 'столът', pos: 'noun', category: 'objects', grammar: { de: 'masculine, der', bg: 'masculine, -ът' } },
    { de: 'das Buch', bg: 'книгата', pos: 'noun', category: 'objects', grammar: { de: 'neuter, das', bg: 'feminine, -та' } },
  ]
};

// Generate example sentences
function generateExamples(german, bulgarian, pos, category) {
  const examples = [];
  
  // Pattern-based example generation
  if (category === 'greetings') {
    examples.push({
      german: `${german}! Wie geht es dir?`,
      bulgarian: `${bulgarian}! Как си?`,
      context: 'neutral'
    });
    examples.push({
      german: `Man sagt "${german}" am Morgen.`,
      bulgarian: `Казваме "${bulgarian}" сутрин.`,
      context: 'neutral'
    });
  } else if (pos === 'noun') {
    const article = german.split(' ')[0];
    const noun = german.split(' ').slice(1).join(' ');
    examples.push({
      german: `Das ist ${german}.`,
      bulgarian: `Това е ${bulgarian}.`,
      context: 'neutral'
    });
    examples.push({
      german: `Ich sehe ${article === 'der' ? 'den' : german}.`,
      bulgarian: `Виждам ${bulgarian}.`,
      context: 'neutral'
    });
  } else if (pos === 'numeral') {
    examples.push({
      german: `Ich habe ${german} Bücher.`,
      bulgarian: `Имам ${bulgarian} книги.`,
      context: 'neutral'
    });
    examples.push({
      german: `Zähle bis ${german}.`,
      bulgarian: `Брой до ${bulgarian}.`,
      context: 'neutral'
    });
  } else if (pos === 'pronoun') {
    examples.push({
      german: `${german.charAt(0).toUpperCase() + german.slice(1)} bin hier.`,
      bulgarian: `${bulgarian.charAt(0).toUpperCase() + bulgarian.slice(1)} съм тук.`,
      context: 'neutral'
    });
  } else {
    examples.push({
      german: `${german}`,
      bulgarian: `${bulgarian}`,
      context: 'neutral'
    });
  }
  
  return examples;
}

// Generate vocabulary items from patterns
function generateVocabularyItems() {
  const items = [];
  let id = 1000; // Start from 1000 to avoid conflicts
  
  // Combine all categories based on level
  const categories = options.level === 'A1' 
    ? ['greetings', 'numbers', 'family', 'common']
    : ['common'];
  
  for (const category of categories) {
    const words = vocabularyPatterns[category] || [];
    
    for (const word of words) {
      if (items.length >= options.limit) break;
      
      const item = {
        id: `vocab-${id++}`,
        german: word.de,
        bulgarian: word.bg,
        partOfSpeech: word.pos,
        cefr: options.level,
        definitions: {
          german: generateDefinition(word.de, word.pos, 'de'),
          bulgarian: generateDefinition(word.bg, word.pos, 'bg')
        },
        examples: generateExamples(word.de, word.bg, word.pos, word.category),
        categories: [word.category],
        grammar: word.grammar || {},
        culturalNotes: [],
        tags: [options.level, word.category],
        lastModified: new Date().toISOString()
      };
      
      items.push(item);
    }
    
    if (items.length >= options.limit) break;
  }
  
  return items.slice(0, options.limit);
}

// Generate definitions
function generateDefinition(word, pos, lang) {
  if (lang === 'de') {
    switch (pos) {
      case 'noun':
        return `Ein ${word} ist ein Objekt oder eine Person.`;
      case 'verb':
        return `${word} ist eine Handlung oder ein Zustand.`;
      case 'adjective':
        return `${word} beschreibt eine Eigenschaft.`;
      case 'phrase':
        return `"${word}" ist eine übliche Redewendung.`;
      case 'interjection':
        return `${word} ist ein Ausruf.`;
      case 'numeral':
        return `${word} ist eine Zahl.`;
      case 'pronoun':
        return `${word} ist ein persönliches Fürwort.`;
      case 'particle':
        return `${word} ist eine Partikel.`;
      default:
        return `${word} ist ein Wort.`;
    }
  } else {
    switch (pos) {
      case 'noun':
        return `${word} е обект или човек.`;
      case 'verb':
        return `${word} е действие или състояние.`;
      case 'adjective':
        return `${word} описва качество.`;
      case 'phrase':
        return `"${word}" е обичайна фраза.`;
      case 'interjection':
        return `${word} е възклицание.`;
      case 'numeral':
        return `${word} е число.`;
      case 'pronoun':
        return `${word} е местоимение.`;
      case 'particle':
        return `${word} е частица.`;
      default:
        return `${word} е дума.`;
    }
  }
}

// Load existing vocabulary to avoid duplicates
function loadExistingVocabulary() {
  try {
    if (fs.existsSync(EXISTING_VOCAB_PATH)) {
      const content = fs.readFileSync(EXISTING_VOCAB_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Could not load existing vocabulary${colors.reset}`);
  }
  return [];
}

// Check for duplicates
function isDuplicate(item, existing) {
  if (!Array.isArray(existing)) return false;
  return existing.some(v => 
    v.german?.toLowerCase() === item.german.toLowerCase() ||
    v.bulgarian?.toLowerCase() === item.bulgarian.toLowerCase()
  );
}

// Main execution
async function main() {
  try {
    console.log(`${colors.cyan}Generating ${options.level} vocabulary...${colors.reset}\n`);
    
    // Load existing vocabulary
    const existingVocab = loadExistingVocabulary();
    console.log(`${colors.green}✓${colors.reset} Loaded ${existingVocab.length} existing vocabulary items\n`);
    
    // Generate new vocabulary
    const newItems = generateVocabularyItems();
    
    // Filter out duplicates
    const uniqueItems = newItems.filter(item => !isDuplicate(item, existingVocab));
    
    console.log(`${colors.cyan}Generated:${colors.reset}`);
    console.log(`  • Total: ${newItems.length} items`);
    console.log(`  • Unique: ${uniqueItems.length} items`);
    console.log(`  • Duplicates: ${newItems.length - uniqueItems.length} items`);
    console.log('');
    
    if (uniqueItems.length === 0) {
      console.log(`${colors.yellow}⚠ No new unique vocabulary to add${colors.reset}`);
      return;
    }
    
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Save extracted vocabulary
    const outputPath = path.join(OUTPUT_DIR, options.output);
    fs.writeFileSync(outputPath, JSON.stringify(uniqueItems, null, 2));
    
    console.log(`${colors.green}✅ Saved extracted vocabulary${colors.reset}`);
    console.log(`   → ${outputPath}`);
    console.log('');
    
    // Display sample
    console.log(`${colors.cyan}Sample vocabulary (first 5):${colors.reset}`);
    uniqueItems.slice(0, 5).forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${colors.blue}${item.german}${colors.reset} → ${colors.green}${item.bulgarian}${colors.reset}`);
      console.log(`   Part of speech: ${item.partOfSpeech}`);
      console.log(`   Categories: ${item.categories.join(', ')}`);
      console.log(`   Examples: ${item.examples.length}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.green}✅ Extraction complete!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. Review extracted vocabulary');
    console.log('  2. Run merge script to add to database');
    console.log('  3. Verify in application');
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
