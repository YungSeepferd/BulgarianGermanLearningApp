/**
 * Vocabulary Migration Script
 *
 * This script unifies and extends vocabulary data from all `data/vocab/*.json`
 * files into a single, comprehensive `unified-vocabulary.json` file.
 *
 * The script performs the following steps:
 * 1. Loads the main `unified-vocabulary.json` file.
 * 2. Loads all specialized vocabulary files from `data/vocab/`.
 * 3. Maps all data to the `UnifiedVocabularyItemSchema`.
 * 4. Corrects any data inconsistencies (e.g., swapped fields).
 * 5. Deduplicates entries based on ID and content.
 * 6. Merges metadata to preserve the highest quality information.
 * 7. Saves the unified data to `src/lib/data/unified-vocabulary.json`.
 */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { UnifiedVocabularyItemSchema, UnifiedVocabularyCollectionSchema } from '../src/lib/schemas/unified-vocabulary.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const VOCAB_DIR = path.resolve(DATA_DIR, 'vocab');
const OUTPUT_DIR = path.resolve(process.cwd(), 'src/lib/data');

type UnifiedVocabularyItem = z.infer<typeof UnifiedVocabularyItemSchema>;

async function loadMainVocabulary(): Promise<UnifiedVocabularyItem[]> {
  const filePath = path.resolve(OUTPUT_DIR, 'unified-vocabulary.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(fileContent);
  return data.items;
}

async function loadSpecializedVocabulary(): Promise<UnifiedVocabularyItem[]> {
  const files = await fs.readdir(VOCAB_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'index.json');
  
  let items: UnifiedVocabularyItem[] = [];

  for (const file of jsonFiles) {
    const filePath = path.resolve(VOCAB_DIR, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    items = items.concat(data);
  }

  return items;
}

function deduplicateAndMerge(items: UnifiedVocabularyItem[]): UnifiedVocabularyItem[] {
  const itemMap = new Map<string, UnifiedVocabularyItem>();

  for (const item of items) {
    const normalizedItem = UnifiedVocabularyItemSchema.parse(item);
    const key = `${normalizedItem.german.toLowerCase()}|${normalizedItem.bulgarian.toLowerCase()}`;

    if (itemMap.has(key)) {
      const existingItem = itemMap.get(key)!;

      // Merge metadata
      existingItem.metadata = {
        ...existingItem.metadata,
        ...normalizedItem.metadata,
        examples: [
          ...(existingItem.metadata?.examples || []),
          ...(normalizedItem.metadata?.examples || [])
        ]
      };

      // Merge categories
      existingItem.categories = [...new Set([...existingItem.categories, ...normalizedItem.categories])];

      // Update timestamps
      existingItem.createdAt = new Date(Math.min(
        new Date(existingItem.createdAt).getTime(),
        new Date(normalizedItem.createdAt).getTime()
      ));
      existingItem.updatedAt = new Date(Math.max(
        new Date(existingItem.updatedAt).getTime(),
        new Date(normalizedItem.updatedAt).getTime()
      ));

      // Update verification status
      existingItem.isVerified = existingItem.isVerified || normalizedItem.isVerified;

    } else {
      itemMap.set(key, normalizedItem);
    }
  }

  return Array.from(itemMap.values());
}

async function migrate() {
  console.log('Starting vocabulary migration...');

  const mainVocab = await loadMainVocabulary();
  const specializedVocab = await loadSpecializedVocabulary();

  const allItems = [...mainVocab, ...specializedVocab];

  console.log(`Loaded ${mainVocab.length} items from main vocabulary.`);
  console.log(`Loaded ${specializedVocab.length} items from specialized vocabulary.`);
  console.log(`Total items to process: ${allItems.length}`);
  
  const deduplicatedItems = deduplicateAndMerge(allItems);

  console.log(`Total items after deduplication: ${deduplicatedItems.length}`);

  // Create a backup of the current unified-vocabulary.json file
  const backupFile = path.resolve(OUTPUT_DIR, `unified-vocabulary-backup-${new Date().toISOString().split('T')[0]}.json`);
  await fs.copyFile(path.resolve(OUTPUT_DIR, 'unified-vocabulary.json'), backupFile);
  console.log(`Backup created at ${backupFile}`);

  const unifiedCollection = {
    id: 'd90bfaa2-8f93-4fb2-8571-8133bb392434', // Preserve existing ID
    name: 'Unified German-Bulgarian Vocabulary Collection',
    description: 'A comprehensive, unified vocabulary collection for the language learning app.',
    items: deduplicatedItems,
    languagePair: 'de-bg' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validatedCollection = UnifiedVocabularyCollectionSchema.parse(unifiedCollection);

  // Overwrite the original unified-vocabulary.json file
  await fs.writeFile(path.resolve(OUTPUT_DIR, 'unified-vocabulary.json'), JSON.stringify(validatedCollection, null, 2));

  console.log(`Successfully migrated and saved ${validatedCollection.items.length} items to unified-vocabulary.json`);
}

migrate().catch(error => {
  console.error('Vocabulary migration failed:', error);
});