#!/usr/bin/env tsx
/**
 * Rebuild Vocabulary Script
 * Regenerates unified-vocabulary.json from source vocab/*.json files
 * with proper mapping to the UnifiedVocabularyItemSchema
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { UnifiedVocabularyItemSchema, UnifiedVocabularyCollectionSchema, type PartOfSpeech, type VocabularyCategory } from '../src/lib/schemas/unified-vocabulary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOCAB_DIR = path.resolve(__dirname, '../data/vocab');
const OUTPUT_FILE = path.resolve(__dirname, '../data/unified-vocabulary.json');

// Category mapping from legacy to new schema
const CATEGORY_MAP: Record<string, VocabularyCategory> = {
  'Begrüßung': 'greetings',
  'Zahlen': 'numbers',
  'Familie': 'family',
  'Essen': 'food',
  'Farben': 'colors',
  'Tiere': 'animals',
  'Körper': 'body',
  'Kleidung': 'clothing',
  'Haus': 'house',
  'Natur': 'nature',
  'Transport': 'transport',
  'Technologie': 'technology',
  'Zeit': 'time',
  'Wetter': 'weather',
  'Berufe': 'professions',
  'Orte': 'places',
  'Grammatik': 'grammar',
  'Kultur': 'culture',
  'Phrase': 'common_phrases',
  'Verb': 'verbs',
  'Adjektiv': 'adjectives',
  'Adverb': 'adverbs',
  'Pronomen': 'pronouns',
  'Präposition': 'prepositions',
  'Konjunktion': 'conjunctions',
  'Interjektion': 'interjections',
  'Einkauf': 'common_phrases',
  'Aktivitäten': 'common_phrases',
  'Bildung': 'common_phrases',
  'Gesundheit': 'body',
  'Unterhaltung': 'common_phrases',
  'Gegenstände': 'house',
  'Lebensmittel': 'food',
  'Quantor': 'adjectives',
  'Substantiv': 'uncategorized',
  'Ausdruck': 'common_phrases',
  'Fragewörter': 'pronouns'
};

// Part of speech mapping
const POS_MAP: Record<string, PartOfSpeech> = {
  'Substantiv': 'noun',
  'Verb': 'verb',
  'Adjektiv': 'adjective',
  'Adverb': 'adverb',
  'Pronomen': 'pronoun',
  'Präposition': 'preposition',
  'Konjunktion': 'conjunction',
  'Interjektion': 'interjection',
  'Artikel': 'article',
  'Zahl': 'number',
  'Phrase': 'phrase',
  'Ausdruck': 'expression'
};

interface LegacyVocabItem {
  id: string;
  word: string;  // Bulgarian text
  translation: string;  // German text
  source_lang: 'bg' | 'de';
  target_lang: 'de' | 'bg';
  category: string;
  level?: string;
  difficulty?: number;
  frequency?: number;
  notes?: string | null;
  notes_bg_to_de?: string;
  notes_de_to_bg?: string;
  linguistic_note?: string;
  linguistic_note_bg_to_de?: string;
  linguistic_note_de_to_bg?: string;
  etymology?: string;
  cultural_note?: string;
  examples?: Array<{ sentence: string; translation: string; context?: string }>;
}

/**
 * Map legacy item to UnifiedVocabularyItem format
 */
function mapLegacyItem(item: LegacyVocabItem) {
  // Determine german and bulgarian based on source_lang
  let german: string;
  let bulgarian: string;

  if (item.source_lang === 'bg') {
    bulgarian = item.word;
    german = item.translation;
  } else {
    german = item.word;
    bulgarian = item.translation;
  }

  // Map category
  const category = CATEGORY_MAP[item.category] || 'uncategorized';
  
  // Infer part of speech from category if not provided
  let partOfSpeech: PartOfSpeech = 'phrase';  // default
  if (item.category === 'Verb' || category === 'verbs') {
    partOfSpeech = 'verb';
  } else if (item.category === 'Adjektiv' || category === 'adjectives') {
    partOfSpeech = 'adjective';
  } else if (item.category === 'Adverb' || category === 'adverbs') {
    partOfSpeech = 'adverb';
  } else if (item.category === 'Pronomen' || category === 'pronouns') {
    partOfSpeech = 'pronoun';
  } else if (item.category === 'Substantiv' || ['food', 'animals', 'body', 'house', 'nature', 'transport', 'technology'].includes(category)) {
    partOfSpeech = 'noun';
  } else if (item.category === 'Zahl' || item.category === 'Zahlen') {
    partOfSpeech = 'number';
  } else if (item.category === 'Interjektion' || category === 'greetings') {
    partOfSpeech = 'interjection';
  }

  // Map difficulty (1-5 scale)
  const difficulty = item.difficulty || (item.level === 'A1' ? 1 : item.level === 'A2' ? 2 : item.level === 'B1' ? 3 : 2);

  // Build notes object
  const notes: any = {};
  if (item.notes_bg_to_de) notes.forBulgarianSpeakers = item.notes_bg_to_de;
  if (item.notes_de_to_bg) notes.forGermanSpeakers = item.notes_de_to_bg;
  if (item.linguistic_note) notes.linguistic = item.linguistic_note;
  if (item.linguistic_note_bg_to_de) notes.linguisticForBulgarians = item.linguistic_note_bg_to_de;
  if (item.linguistic_note_de_to_bg) notes.linguisticForGermans = item.linguistic_note_de_to_bg;
  if (item.notes && item.notes !== null) notes.general = item.notes;

  // Build examples array
  const examples = (item.examples || []).map(ex => ({
    german: item.source_lang === 'bg' ? ex.translation : ex.sentence,
    bulgarian: item.source_lang === 'bg' ? ex.sentence : ex.translation,
    context: ex.context,
    source: 'legacy' as const
  }));

  // Build cultural notes array
  const culturalNotes = item.cultural_note ? [item.cultural_note] : undefined;

  return {
    id: item.id,
    german,
    bulgarian,
    partOfSpeech,
    difficulty,
    categories: [category],
    etymology: item.etymology || undefined,
    culturalNotes,
    examples,
    notes: Object.keys(notes).length > 0 ? notes : undefined,
    metadata: {
      frequency: item.frequency,
      level: item.level as any,
      isVerified: true,
      createdBy: 'vocab-migration'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Load all vocabulary items from source files
 */
async function loadVocabFiles(): Promise<LegacyVocabItem[]> {
  const files = await fs.readdir(VOCAB_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'resources');
  
  const items: LegacyVocabItem[] = [];
  
  for (const file of jsonFiles) {
    const filePath = path.join(VOCAB_DIR, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        items.push(...data);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
  
  return items;
}

/**
 * Deduplicate items by id
 */
function deduplicateItems(items: any[]): any[] {
  const seen = new Map<string, any>();
  
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.set(item.id, item);
    } else {
      // Merge categories if duplicate
      const existing = seen.get(item.id)!;
      existing.categories = [...new Set([...existing.categories, ...item.categories])];
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Main rebuild function
 */
async function rebuild() {
  console.log('🔄 Rebuilding unified vocabulary from source files...\n');
  
  // Load all legacy items
  console.log('📂 Loading vocabulary files from data/vocab/...');
  const legacyItems = await loadVocabFiles();
  console.log(`   Found ${legacyItems.length} items in source files\n`);
  
  // Map to new schema
  console.log('🔧 Mapping items to UnifiedVocabularyItemSchema...');
  const mappedItems = legacyItems.map(mapLegacyItem);
  console.log(`   Mapped ${mappedItems.length} items\n`);
  
  // Deduplicate
  console.log('🧹 Deduplicating items...');
  const uniqueItems = deduplicateItems(mappedItems);
  console.log(`   ${uniqueItems.length} unique items after deduplication\n`);
  
  // Validate against schema
  console.log('✅ Validating items against schema...');
  let validatedItems = [];
  let failedCount = 0;
  
  for (const item of uniqueItems) {
    try {
      const validated = UnifiedVocabularyItemSchema.parse(item);
      validatedItems.push(validated);
    } catch (error) {
      failedCount++;
      console.error(`   ❌ Failed to validate item ${item.id}:`, error.errors?.[0]?.message || error.message);
    }
  }
  
  console.log(`   ✅ ${validatedItems.length} items validated successfully`);
  if (failedCount > 0) {
    console.log(`   ⚠️  ${failedCount} items failed validation\n`);
  } else {
    console.log('');
  }
  
  // Create unified collection
  const collection = {
    id: 'd90bfaa2-8f93-4fb2-8571-8133bb392434',
    name: 'German-Bulgarian Vocabulary',
    description: 'Comprehensive German-Bulgarian vocabulary collection with unified schema',
    languagePair: 'de-bg' as const,
    difficultyRange: [1, 5] as [number, number],
    categories: [...new Set(validatedItems.flatMap(i => i.categories))],
    itemCount: validatedItems.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 2,
    items: validatedItems
  };
  
  // Validate collection
  console.log('🔍 Validating collection schema...');
  const validatedCollection = UnifiedVocabularyCollectionSchema.parse(collection);
  console.log('   ✅ Collection validated successfully\n');
  
  // Save to file
  console.log('💾 Saving to data/unified-vocabulary.json...');
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(validatedCollection, null, 2));
  console.log('   ✅ Saved successfully\n');
  
  // Copy to static folder
  const staticFile = path.resolve(__dirname, '../static/data/unified-vocabulary.json');
  await fs.mkdir(path.dirname(staticFile), { recursive: true });
  await fs.writeFile(staticFile, JSON.stringify(validatedCollection, null, 2));
  console.log('💾 Copied to static/data/unified-vocabulary.json\n');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   • Source items: ${legacyItems.length}`);
  console.log(`   • After deduplication: ${uniqueItems.length}`);
  console.log(`   • Validated items: ${validatedItems.length}`);
  console.log(`   • Failed validation: ${failedCount}`);
  console.log(`   • Categories: ${collection.categories.length}`);
  console.log('');
  console.log('✨ Vocabulary rebuild complete!');
}

rebuild().catch(error => {
  console.error('❌ Rebuild failed:', error);
  process.exit(1);
});
