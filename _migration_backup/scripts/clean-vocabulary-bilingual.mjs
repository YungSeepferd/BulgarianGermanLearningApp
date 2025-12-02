#!/usr/bin/env node

/**
 * Script to clean vocabulary.json:
 * 1. Convert all multiline strings to single-line JSON strings
 * 2. Replace English-only fields with Bulgarian-German bilingual content
 * 3. Ensure proper formatting with \n separator
 */

import fs from 'node:fs';
import path from 'node:path';

const VOCAB_PATH = path.join(process.cwd(), 'data/vocabulary.json');


const CULTURAL_NOTE_TRANSLATIONS = {
  'Common everyday word in Bulgarian': 'Често срещана дума в българския език.',
  'Useful for A1 learners': 'Полезна за начинаещи (A1).',
  'Useful for A2 learners': 'Полезна за А2 ниво.',
  'Essential action word': 'Основен глагол.',
  'Bulgarian verbs conjugate for person and number': 'Българските глаголи се спрягат по лице и число.',
  'Descriptive word in Bulgarian': 'Описателна дума в българския.',
  'Adjectives agree with noun gender': 'Прилагателните се съгласуват с рода на съществителното.',
  'Common Bulgarian word at A1 level': 'Често срещана българска дума на ниво A1.',
  'Common Bulgarian word at A2 level': 'Често срещана българска дума на ниво A2.',
  'Useful for everyday communication': 'Полезна за ежедневна комуникация.',
  'Time concept in Bulgarian': 'Времеви концепт в българския език.',
  'Numbers in Bulgarian follow Slavic pattern': 'Числата в българския следват славянски модел.',
  'Gender agreement with counted nouns': 'Съгласуване по род с броените съществителни.'
};


function translateCulturalNote(englishText) {
  if (!englishText || englishText.includes('Културен контекст:') || englishText.includes('Kultureller Kontext:')) {
    return englishText;
  }

  let bgText = englishText;
  let deText = englishText;

  // Apply translations
  for (const [eng, bg] of Object.entries(CULTURAL_NOTE_TRANSLATIONS)) {
    bgText = bgText.replace(eng, bg);
  }

  // Create bilingual format
  if (bgText === englishText) {
    bgText = `Културен контекст: ${englishText}`;
    deText = `Kultureller Kontext: ${englishText}`;
  } else {
    deText = englishText.replace('Common everyday word in Bulgarian', 'Alltägliches Wort im Bulgarischen')
      .replace('Useful for', 'Nützlich für')
      .replace('Essential action word', 'Wesentliches Verb');
  }

  return `${bgText}\\nKultureller Kontext: ${deText}`;
}

function cleanEntry(entry) {
  const cleaned = { ...entry };

  // Clean etymology
  if (cleaned.etymology && typeof cleaned.etymology === 'string') {
    // Remove actual newlines and replace with \n
    cleaned.etymology = cleaned.etymology.replaceAll('\n', '\\n');
    
    // If it's English-only, translate it
    if (!cleaned.etymology.includes('Произход:') && !cleaned.etymology.includes('Herkunft:')) {
      // Check if it has the pattern "Bulgarian ... from Slavic"
      if (cleaned.etymology.includes('Bulgarian') && cleaned.etymology.includes('Slavic')) {
        const bgPart = `Произход: ${cleaned.etymology.replace('Bulgarian noun from Slavic root. Definite article is postfixed in Bulgarian', 'славянски корен; определителният член е постпозитивен.')}`;
        const dePart = 'Herkunft: Slawische Wurzel. Der bestimmte Artikel ist nachgestellt im Bulgarischen.';
        cleaned.etymology = `${bgPart}\\n${dePart}`;
      } else if (cleaned.etymology.includes('Slavic origin word')) {
        cleaned.etymology = 'Произход: славянски произход; свързан с други южнославянски езици.\\nHerkunft: Slawischen Ursprungs; verwandt mit anderen südslawischen Sprachen.';
      }
    }
  }

  // Clean cultural_note
  if (cleaned.cultural_note && typeof cleaned.cultural_note === 'string') {
    // Remove actual newlines and replace with \n
    cleaned.cultural_note = cleaned.cultural_note.replaceAll('\n', '\\n');
    
    // If it's English-only, translate it
    if (!cleaned.cultural_note.includes('Културен') && !cleaned.cultural_note.includes('Kultureller') && (cleaned.cultural_note.includes('Common') || cleaned.cultural_note.includes('Useful') || cleaned.cultural_note.includes('Essential'))) {
      cleaned.cultural_note = translateCulturalNote(cleaned.cultural_note);
    }
  }

  // Ensure notes is null if it's just a generic English phrase
  if (cleaned.notes && typeof cleaned.notes === 'string') {
    if (cleaned.notes.includes('bedeutet') || cleaned.notes.includes('meaning') || cleaned.notes.includes('ist ein')) {
      // Keep German notes
    } else if (cleaned.notes.startsWith("'") && cleaned.notes.includes("'")) {
      // Keep notes with quotes (usually already bilingual)
    } else {
      // Remove generic English notes
      cleaned.notes = null;
    }
  }

  // Clean linguistic notes - these should stay as is but ensure single-line format
  if (cleaned.linguistic_note_bg_to_de) {
    cleaned.linguistic_note_bg_to_de = cleaned.linguistic_note_bg_to_de.replaceAll('\n', ' ').trim();
  }
  if (cleaned.linguistic_note_de_to_bg) {
    cleaned.linguistic_note_de_to_bg = cleaned.linguistic_note_de_to_bg.replaceAll('\n', ' ').trim();
  }

  return cleaned;
}

function main() {
  console.log('🔧 Starting vocabulary cleanup...');

  // Read the vocabulary file
  const vocabData = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf8'));
  
  console.log(`📚 Processing ${vocabData.length} entries...`);

  // Clean each entry
  const cleaned = vocabData.map((entry, index) => {
    if (index % 20 === 0) {
      console.log(`  Processing entry ${index + 1}/${vocabData.length}...`);
    }
    return cleanEntry(entry);
  });

  // Write back to file with proper formatting
  fs.writeFileSync(VOCAB_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');

  console.log('✅ Cleanup complete!');
  console.log('📝 Validating JSON...');

  // Validate by reading it back
  try {
    JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf8'));
    console.log('✅ JSON is valid!');
  } catch (error) {
    console.error('❌ JSON validation failed:', error.message);
    process.exit(1);
  }
}

main();
