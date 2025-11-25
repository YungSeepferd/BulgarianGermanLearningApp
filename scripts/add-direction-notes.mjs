/**
 * @file add-direction-notes.mjs
 * @description Adds comprehensive direction-specific learning notes to all vocabulary
 * @purpose Enable proper bidirectional learning with language-specific explanations
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = path.join(__dirname, '../data/vocabulary.json');

/**
 * Generates German explanation for German speakers learning Bulgarian
 * @param {Object} entry - Vocabulary entry
 * @returns {string} German explanation
 */
function generateNotesDeToБg(entry) {
  const { word, translation, linguistic_note } = entry;
  
  // Extract key information
  const wordParts = analyzeWord(word);
  let explanation = `Für Deutschsprachige: '${word}' ≈ '${translation}'`;
  
  // Add word breakdown if compound or has clear root
  if (wordParts.isCompound) {
    explanation += `; zusammengesetzt aus '${wordParts.parts.join("' + '")}'`;
  } else if (wordParts.root) {
    explanation += `; von '${wordParts.root}'`;
  }
  
  // Add pronunciation hint
  if (linguistic_note && linguistic_note.includes('Stress')) {
    const stressMatch = linguistic_note.match(/stress.*?[:：]\s*(.+?)(?:\.|$)/i);
    if (stressMatch) {
      explanation += `. Betonung: ${stressMatch[1]}`;
    }
  }
  
  // Add grammatical info
  explanation += `. ${getGrammarNote(entry, 'de')}`;
  
  // Add usage level
  explanation += ` ${getUsageLevel(entry, 'de')}`;
  
  return explanation.trim();
}

/**
 * Generates Bulgarian explanation for Bulgarian speakers learning German
 * @param {Object} entry - Vocabulary entry
 * @returns {string} Bulgarian explanation
 */
function generateNotesBgToDe(entry) {
  const { word, translation } = entry;
  
  // Bulgarian explanations in Bulgarian
  let explanation = `За българите: '${word}' на немски е '${translation}'`;
  
  // Add German word breakdown if compound
  const germanParts = analyzeGermanWord(translation);
  if (germanParts.isCompound) {
    explanation += `; немската дума се състои от '${germanParts.parts.join("' + '")}'`;
  }
  
  // Add grammatical comparison
  explanation += `. ${getGrammarNote(entry, 'bg')}`;
  
  // Add usage context
  explanation += ` ${getUsageLevel(entry, 'bg')}`;
  
  return explanation.trim();
}

/**
 * Analyzes Bulgarian word structure
 */
function analyzeWord(word) {
  const result = { isCompound: false, parts: [], root: null };
  
  // Common Bulgarian compound patterns
  if (word.includes(' ')) {
    result.isCompound = true;
    result.parts = word.split(' ');
    return result;
  }
  
  // Known roots and compounds
  const compoundPatterns = {
    'Добро утро': { parts: ['добро', 'утро'] },
    'Добър ден': { parts: ['добър', 'ден'] },
    'Добър вечер': { parts: ['добър', 'вечер'] },
    'Лека нощ': { parts: ['лека', 'нощ'] },
    'Благодаря': { root: 'благо + даря' },
    'Довиждане': { root: 'до + виждане' },
    'Училище': { root: 'уча (lernen)' },
    'Семейство': { root: 'семе (Samen)' },
    'Здравей': { root: 'здрав (gesund)' }
  };
  
  if (compoundPatterns[word]) {
    const pattern = compoundPatterns[word];
    if (pattern.parts) {
      result.isCompound = true;
      result.parts = pattern.parts;
    }
    if (pattern.root) {
      result.root = pattern.root;
    }
  }
  
  return result;
}

/**
 * Analyzes German word structure
 */
function analyzeGermanWord(word) {
  const result = { isCompound: false, parts: [] };
  
  // Common German compounds
  const compounds = {
    'Guten Morgen': ['Guten', 'Morgen'],
    'Guten Tag': ['Guten', 'Tag'],
    'Guten Abend': ['Guten', 'Abend'],
    'Gute Nacht': ['Gute', 'Nacht'],
    'Auf Wiedersehen': ['Auf', 'Wiedersehen'],
    'Es tut mir leid': ['Es tut mir leid']
  };
  
  if (compounds[word]) {
    result.isCompound = true;
    result.parts = compounds[word];
  }
  
  return result;
}

/**
 * Gets grammar note in target language
 */
function getGrammarNote(entry, targetLang) {
  const { category, word } = entry;
  
  if (targetLang === 'de') {
    // German explanations
    const notes = {
      'Begrüßung': 'Feste Redewendung.',
      'Ausdruck': 'Höflichkeitsausdruck.',
      'Substantiv': word.endsWith('а') || word.endsWith('я') ? 'Femininum.' : 
        (word.endsWith('о') || word.endsWith('е') ? 'Neutrum.' : 'Maskulinum.'),
      'Verb': 'Bulgarisches Verb.',
      'Adjektiv': 'Bulgarisches Adjektiv (flektiert nach Geschlecht).',
      'Adverb': 'Unveränderliches Adverb.',
      'Zahl': 'Zahlwort.',
      'Zeit': 'Zeitbegriff.',
      'Pronomen': 'Pronomen.'
    };
    return notes[category] || 'Bulgarisches Wort.';
  } else {
    // Bulgarian explanations
    const notes = {
      'Begrüßung': 'Устойчив израз за поздрав.',
      'Ausdruck': 'Учтив израз.',
      'Substantiv': 'Съществително име на немски.',
      'Verb': 'Глагол на немски.',
      'Adjektiv': 'Прилагателно на немски (променя се по род).',
      'Adverb': 'Наречие.',
      'Zahl': 'Числително.',
      'Zeit': 'Понятие за време.',
      'Pronomen': 'Местоимение.'
    };
    return notes[category] || 'Немска дума.';
  }
}

/**
 * Gets usage level description
 */
function getUsageLevel(entry, targetLang) {
  const { frequency } = entry;
  
  if (targetLang === 'de') {
    if (frequency >= 90) {
      return 'Sehr häufig verwendet.';
    }
    if (frequency >= 70) {
      return 'Häufig verwendet.';
    }
    if (frequency >= 50) {
      return 'Mäßig häufig.';
    }
    return 'Seltener verwendet.';
  } else {
    if (frequency >= 90) {
      return 'Много често използвана дума.';
    }
    if (frequency >= 70) {
      return 'Често използвана.';
    }
    if (frequency >= 50) {
      return 'Умерено често.';
    }
    return 'По-рядко използвана.';
  }
}

/**
 * Main enhancement function
 */
async function addDirectionNotes() {
  console.log('📚 Loading vocabulary...');
  
  try {
    const data = await fs.readFile(VOCAB_PATH, 'utf8');
    const vocabulary = JSON.parse(data);
    
    console.log(`✅ Loaded ${vocabulary.length} entries`);
    
    // Count incomplete
    const incomplete = vocabulary.filter(entry => 
      !entry.notes_de_to_bg || !entry.notes_bg_to_de
    );
    
    console.log(`🔄 Adding direction notes to ${incomplete.length} entries...`);
    
    // Enhance all entries
    const enhanced = vocabulary.map((entry, index) => {
      const result = { ...entry };
      
      // Add German → Bulgarian notes if missing
      if (!result.notes_de_to_bg) {
        result.notes_de_to_bg = generateNotesDeToБg(entry);
      }
      
      // Add Bulgarian → German notes if missing
      if (!result.notes_bg_to_de) {
        result.notes_bg_to_de = generateNotesBgToDe(entry);
      }
      
      if (index % 20 === 0) {
        console.log(`   Processing: ${index + 1}/${vocabulary.length}...`);
      }
      
      return result;
    });
    
    // Backup
    const backupPath = VOCAB_PATH.replace('.json', `.backup-direction-${Date.now()}.json`);
    await fs.writeFile(backupPath, data, 'utf8');
    console.log(`💾 Backup: ${path.basename(backupPath)}`);
    
    // Save
    await fs.writeFile(VOCAB_PATH, JSON.stringify(enhanced, null, 2), 'utf8');
    console.log('✅ Enhanced vocabulary saved');
    
    // Stats
    const complete = enhanced.filter(e => e.notes_de_to_bg && e.notes_bg_to_de);
    console.log('\n📊 Statistics:');
    console.log(`   Total: ${enhanced.length}`);
    console.log(`   Complete bidirectional notes: ${complete.length}`);
    console.log(`   Coverage: ${Math.round(complete.length / enhanced.length * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDirectionNotes();
