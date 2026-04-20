import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Fix Missing Required Fields
 * 
 * Adds default values for required fields:
 * - difficulty: defaults to 1 (A1)
 * - categories: defaults to ['uncategorized']
 * - cefrLevel: defaults to 'A1'
 */

const DATA_PATH = resolve(process.cwd(), 'data/unified-vocabulary.json');

// Pattern-based category assignment
const CATEGORY_PATTERNS: Record<string, string[]> = {
  'hallo': ['greetings'],
  'tschüss': ['farewells'],
  'danke': ['everyday-phrases'],
  'bitte': ['everyday-phrases'],
  'mutter': ['family'],
  'vater': ['family'],
  'brot': ['food'],
  'fleisch': ['food'],
  'milch': ['food'],
  'wasser': ['food'],
  'eins': ['numbers'],
  'zwei': ['numbers'],
  'rot': ['colors'],
  'blau': ['colors'],
  'haus': ['home'],
  'auto': ['transport'],
  'zug': ['transport'],
  'fluss': ['places'],
  'berg': ['nature'],
  'baum': ['nature'],
  'hund': ['animals'],
  'katze': ['animals'],
  'apfel': ['food'],
  'zeit': ['time'],
  'tag': ['time'],
  'nacht': ['time'],
  'essen': ['food', 'verbs'],
  'trinken': ['food', 'verbs'],
  'schlafen': ['daily-routine'],
  'arbeiten': ['work'],
  'lernen': ['education'],
  'sprechen': ['communication'],
  'lesen': ['education'],
  'schreiben': ['education']
};

// German/Bulgarian common word patterns for category detection
function inferCategories(german: string, bulgarian: string, partOfSpeech: string): string[] {
  const germanLower = german.toLowerCase();
  const bulgarianLower = bulgarian.toLowerCase();
  
  // Check exact patterns first
  for (const [pattern, categories] of Object.entries(CATEGORY_PATTERNS)) {
    if (germanLower.includes(pattern) || bulgarianLower.includes(pattern)) {
      return categories;
    }
  }
  
  // Part of speech-based defaults
  if (partOfSpeech === 'number' || germanLower.match(/^(eins|zwei|drei|vier|fünf|null|hundert)/)) {
    return ['numbers'];
  }
  
  if (partOfSpeech === 'adjective' || germanLower.match(/^(rot|blau|grün|gelb|schwarz|weiß)/)) {
    return ['colors'];
  }
  
  // Family-related words
  if (germanLower.match(/(mutter|vater|bruder|schwester|familie|oma|opa)/) ||
      bulgarianLower.match(/(майка|баща|брат|сестра|семейство|баба|дядо)/)) {
    return ['family'];
  }
  
  // Food-related words
  if (germanLower.match(/(brot|fleisch|milch|wasser|essen|trinken|apfel|käse)/) ||
      bulgarianLower.match(/(хляб|месо|мляко|вода|храна|ябълка|сирене)/)) {
    return ['food'];
  }
  
  // Time-related words
  if (germanLower.match(/(zeit|tag|nacht|morgen|abend|woche|jahr)/) ||
      bulgarianLower.match(/(време|ден|нощ|сутрин|вечер|седмица|година)/)) {
    return ['time'];
  }
  
  // Default category based on part of speech
  if (partOfSpeech === 'verb') {
    return ['actions'];
  }
  
  if (partOfSpeech === 'phrase') {
    return ['everyday-phrases'];
  }
  
  if (partOfSpeech === 'noun') {
    return ['common-nouns'];
  }
  
  return ['uncategorized'];
}

// Calculate difficulty based on word complexity
function calculateDifficulty(german: string, bulgarian: string): number {
  const germanLength = german.length;
  const bulgarianLength = bulgarian.length;
  const hasSpecialChars = /[äöüßА-Яа-я]/.test(german + bulgarian);
  
  // Simple length-based complexity
  if (germanLength <= 4 && bulgarianLength <= 4) return 1;      // A1
  if (germanLength <= 7 && bulgarianLength <= 7) return 2;      // A2
  if (germanLength <= 10 && bulgarianLength <= 10) return 3;    // B1
  if (germanLength <= 15 || hasSpecialChars) return 4;          // B2
  return 5;                                                      // C1
}

// Map to CEFR level
function difficultyToCEFR(difficulty: number): string {
  const mapping: Record<number, string> = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'C1'
  };
  return mapping[difficulty] || 'A1';
}

// Main fix function
function fixMissingFields() {
  console.log('🔧 Fixing missing required fields in vocabulary data...\n');
  
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  let fixedCount = 0;
  const fixedItems: Array<{ index: number; word: string; difficulty: number; categories: string[]; cefrLevel: string }> = [];
  
  console.log('📊 Processing', data.length, 'items...\n');
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    let itemModified = false;
    
    // Fix missing difficulty
    if (item.difficulty === undefined || item.difficulty === null) {
      item.difficulty = calculateDifficulty(item.german, item.bulgarian);
      itemModified = true;
    }
    
    // Fix missing categories
    if (!item.categories || item.categories.length === 0) {
      item.categories = inferCategories(item.german, item.bulgarian, item.partOfSpeech);
      itemModified = true;
    }
    
    // Add cefrLevel based on difficulty
    if (!item.cefrLevel) {
      item.cefrLevel = difficultyToCEFR(item.difficulty);
      itemModified = true;
    }
    
    if (itemModified) {
      fixedCount++;
      fixedItems.push({
        index: i + 1,
        word: item.german,
        difficulty: item.difficulty,
        categories: item.categories,
        cefrLevel: item.cefrLevel
      });
    }
  }
  
  // Write fixed data
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  
  // Also update static copy
  const STATIC_PATH = resolve(process.cwd(), 'static/data/unified-vocabulary.json');
  writeFileSync(STATIC_PATH, JSON.stringify(data, null, 2), 'utf-8');
  
  // Summary
  console.log('✅ Fix complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total items: ${data.length}`);
  console.log(`   Fixed items: ${fixedCount} (${((fixedCount / data.length) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('📝 Fields added:');
  console.log(`   - difficulty: calculated from word complexity`);
  console.log(`   - categories: inferred from word patterns`);
  console.log(`   - cefrLevel: mapped from difficulty`);
  console.log('');
  
  // Show sample of first 10 fixed items
  console.log('📋 Sample fixed items (first 10):');
  fixedItems.slice(0, 10).forEach(item => {
    console.log(`   ${item.index}. ${item.word}: difficulty=${item.difficulty}, categories=[${item.categories.join(',')}], cefrLevel=${item.cefrLevel}`);
  });
  console.log('');
  
  console.log('💾 Files updated:');
  console.log(`   - ${DATA_PATH}`);
  console.log(`   - ${STATIC_PATH}`);
  console.log('');
}

// Run the fix
fixMissingFields();
