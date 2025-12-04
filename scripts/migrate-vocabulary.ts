#!/usr/bin/env tsx
/**
 * Vocabulary Data Migration Script
 *
 * This script consolidates vocabulary data from multiple legacy JSON files,
 * validates against Zod schemas, deduplicates, and outputs unified vocabulary data.
 *
 * Usage:
 *   pnpm migrate:vocabulary
 *   pnpm migrate:vocabulary -- --dry-run  # Test run without saving
 *   pnpm migrate:vocabulary -- --verbose  # Verbose output
 */

import { VocabularyItemSchema, VocabularyCategorySchema } from '../src/lib/schemas/vocabulary';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { Command } from 'commander';

// Configure command line options
const program = new Command();
program
  .option('--dry-run', 'Test run without saving files')
  .option('--verbose', 'Verbose output')
  .option('--output <path>', 'Output file path', 'data/vocabulary.json')
  .option('--static-output <path>', 'Static output file path', 'static/data/vocabulary-unified.json')
  .parse(process.argv);

const options = program.opts();
const verbose = options.verbose || false;
const dryRun = options.dryRun || false;

// Helper function for logging
function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  if (verbose || level !== 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

// Helper function to normalize strings
function normalizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.trim().toLowerCase();
}

// Helper function to determine part of speech from filename
function getPartOfSpeechFromFilename(filename: string): z.infer<typeof PartOfSpeechSchema> | undefined {
  const basename = path.basename(filename, '.json').toLowerCase();

  const mappings: Record<string, z.infer<typeof PartOfSpeechSchema>> = {
    'adjektive': 'adjective',
    'adverbien': 'adverb',
    'verben': 'verb',
    'substantive': 'noun',
    'nomen': 'noun',
    'pronomen': 'pronoun',
    'zahl': 'number',
    'zahlen': 'number',
    'fragewörter': 'pronoun',
    'grammatik': 'phrase',
    'aktivitäten': 'verb',
    'begrüßung': 'phrase',
    'berufe': 'noun',
    'bildung': 'noun',
    'einkauf': 'noun',
    'essen': 'noun',
    'familie': 'noun',
    'farben': 'noun',
    'gegenstände': 'noun',
    'gesundheit': 'noun',
    'haus': 'noun',
    'kleidung': 'noun',
    'körper': 'noun',
    'lebensmittel': 'noun',
    'natur': 'noun',
    'orte': 'noun',
    'technologie': 'noun',
    'tiere': 'noun',
    'transport': 'noun',
    'unterhaltung': 'noun',
    'wetter': 'noun',
    'zeit': 'noun'
  };

  return Object.entries(mappings).find(([key]) => basename.includes(key))?.[1];
}

// Helper function to determine categories from filename
function getCategoriesFromFilename(filename: string): z.infer<typeof VocabularyCategorySchema>[] {
  const basename = path.basename(filename, '.json').toLowerCase();
  const categories: VocabularyCategory[] = [];

  const categoryMappings: Record<string, z.infer<typeof VocabularyCategorySchema>> = {
    'adjektive': 'grammar',
    'adverbien': 'grammar',
    'verben': 'grammar',
    'substantive': 'grammar',
    'nomen': 'grammar',
    'pronomen': 'grammar',
    'zahl': 'numbers',
    'zahlen': 'numbers',
    'fragewörter': 'grammar',
    'aktivitäten': 'common_phrases',
    'begrüßung': 'greetings',
    'berufe': 'professions',
    'bildung': 'professions',
    'einkauf': 'common_phrases',
    'essen': 'food',
    'familie': 'family',
    'farben': 'colors',
    'gegenstände': 'house',
    'gesundheit': 'body',
    'haus': 'house',
    'kleidung': 'clothing',
    'körper': 'body',
    'lebensmittel': 'food',
    'natur': 'nature',
    'orte': 'places',
    'technologie': 'technology',
    'tiere': 'animals',
    'transport': 'transport',
    'unterhaltung': 'common_phrases',
    'wetter': 'weather',
    'zeit': 'time'
  };

  for (const [key, category] of Object.entries(categoryMappings)) {
    if (basename.includes(key)) {
      categories.push(category);
    }
  }

  // Default categories if none found
  if (categories.length === 0) {
    categories.push('common_phrases');
  }

  return [...new Set(categories)]; // Remove duplicates
}

// Helper function to determine difficulty from filename
function getDifficultyFromFilename(filename: string): number {
  const basename = path.basename(filename, '.json').toLowerCase();

  if (basename.includes('a1')) return 1;
  if (basename.includes('a2')) return 2;
  if (basename.includes('b1')) return 3;
  if (basename.includes('b2')) return 4;
  if (basename.includes('advanced') || basename.includes('c1')) return 5;

  // Default to beginner if no difficulty indicator
  return 1;
}

// Helper function to extract metadata from legacy data
function extractMetadata(legacyItem: any): z.infer<typeof VocabularyItemSchema>['metadata'] {
  const metadata: z.infer<typeof VocabularyItemSchema>['metadata'] = {};

  if (legacyItem.gender) {
    metadata.gender = legacyItem.gender;
  }

  if (legacyItem.plural) {
    metadata.pluralForm = legacyItem.plural;
  }

  if (legacyItem.examples) {
    metadata.examples = legacyItem.examples.map((example: any) => ({
      german: example.de || example.german || '',
      bulgarian: example.bg || example.bulgarian || '',
      context: example.context
    }));
  }

  if (legacyItem.synonyms) {
    metadata.synonyms = legacyItem.synonyms;
  }

  if (legacyItem.antonyms) {
    metadata.antonyms = legacyItem.antonyms;
  }

  if (legacyItem.notes) {
    metadata.notes = legacyItem.notes;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

// Main migration function
async function migrateVocabulary() {
  log('Starting vocabulary data migration', 'info');

  try {
    // 1. Find all vocabulary files
    const legacyFiles = await glob('_legacy_archive/data/archive-data-cleanup/vocabulary-batch-*.json');
    const currentFiles = await glob('data/vocab/*.json');
    const allFiles = [...legacyFiles, ...currentFiles];

    log(`Found ${allFiles.length} vocabulary files to process`, 'info');

    if (verbose) {
      log(`Files to process: ${allFiles.join(', ')}`, 'info');
    }

    // 2. Process each file
    const vocabularyItems: z.infer<typeof VocabularyItemSchema>[] = [];
    const processedItems = new Map<string, z.infer<typeof VocabularyItemSchema>>();
    const duplicates = new Map<string, number>();
    const validationErrors: Array<{file: string, item: any, error: z.ZodError}> = [];

    for (const file of allFiles) {
      log(`Processing file: ${file}`, 'info');

      try {
        const content = await fs.readFile(file, 'utf-8');
        const data = JSON.parse(content);

        // Handle different file formats
        const items = Array.isArray(data) ? data : Object.values(data);

        log(`Found ${items.length} items in ${file}`, 'info');

        // Determine part of speech, categories, and difficulty from filename
        const partOfSpeech = getPartOfSpeechFromFilename(file);
        const categories = getCategoriesFromFilename(file);
        const difficulty = getDifficultyFromFilename(file);

        for (const item of items) {
          try {
            // Normalize the item data
            const normalizedItem = {
              id: item.id ? String(item.id) : crypto.randomUUID(),
              german: normalizeString(item.german || item.de || item.word || item.name || ''),
              bulgarian: normalizeString(item.bulgarian || item.bg || item.translation || item.definition || ''),
              partOfSpeech: partOfSpeech || item.partOfSpeech || item.type || 'noun',
              difficulty: item.difficulty || difficulty,
              categories: item.categories || categories,
              metadata: extractMetadata(item),
              isCommon: item.isCommon || false,
              isVerified: item.isVerified || false
            };

            // Validate the item - handle empty strings gracefully
            const validated = VocabularyItemSchema.parse({
              ...normalizedItem,
              german: normalizedItem.german || 'unknown_german',
              bulgarian: normalizedItem.bulgarian || 'unknown_bulgarian'
            });

            // Create a unique key for deduplication
            const uniqueKey = `${normalizedItem.german.replace(/\s+/g, '_')}-${normalizedItem.bulgarian.replace(/\s+/g, '_')}-${normalizedItem.partOfSpeech}`;

            // Check for duplicates
            if (processedItems.has(uniqueKey)) {
              duplicates.set(uniqueKey, (duplicates.get(uniqueKey) || 1) + 1);
              continue;
            }

            // Add to processed items
            processedItems.set(uniqueKey, validated);
            vocabularyItems.push(validated);

          } catch (error) {
            if (error instanceof z.ZodError) {
              validationErrors.push({ file, item, error });
              const errorDetails = error.errors.map(err => ({
                code: err.code,
                message: err.message,
                path: err.path.join('.')
              }));
              log(`Validation failed for item in ${file}: ${JSON.stringify(errorDetails, null, 2)}`, 'warn');
            } else {
              log(`Error processing item in ${file}: ${error instanceof Error ? error.message : String(error)}`, 'error');
            }
          }
        }

      } catch (error) {
        log(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`, 'error');
      }
    }

    log(`Processed ${vocabularyItems.length} unique vocabulary items`, 'info');
    log(`Found ${duplicates.size} duplicate items`, 'info');
    log(`Encountered ${validationErrors.length} validation errors`, 'warn');

    if (verbose && validationErrors.length > 0) {
      validationErrors.forEach(({ file, item, error }) => {
        log(`Validation error in ${file}: ${JSON.stringify(item)} - ${error.message}`, 'warn');
      });
    }

    // 3. Sort vocabulary items
    vocabularyItems.sort((a, b) => {
      // Sort by difficulty, then by german word
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.german.localeCompare(b.german);
    });

    // 4. Create vocabulary collection
    const vocabularyCollection = {
      id: crypto.randomUUID(),
      name: 'German-Bulgarian Vocabulary Collection',
      description: 'Comprehensive vocabulary collection for German-Bulgarian language learning',
      items: vocabularyItems,
      languagePair: 'de-bg' as const,
      difficultyRange: [1, 5] as [number, number],
      categories: Array.from(new Set(vocabularyItems.flatMap(item => item.categories))),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 5. Save results
    if (!dryRun) {
      // Ensure directories exist
      await fs.mkdir(path.dirname(options.output), { recursive: true });
      await fs.mkdir(path.dirname(options.staticOutput), { recursive: true });

      // Save vocabulary collection
      await fs.writeFile(options.output, JSON.stringify(vocabularyCollection, null, 2));
      log(`Saved vocabulary collection to ${options.output}`, 'info');

      // Save static version
      await fs.writeFile(options.staticOutput, JSON.stringify(vocabularyItems, null, 2));
      log(`Saved static vocabulary data to ${options.staticOutput}`, 'info');

      // Save backup
      const backupPath = `data/vocabulary-backup-${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(backupPath, JSON.stringify(vocabularyCollection, null, 2));
      log(`Created backup at ${backupPath}`, 'info');
    } else {
      log('Dry run completed. No files were saved.', 'info');
    }

    // 6. Generate migration report
    const report = {
      timestamp: new Date().toISOString(),
      filesProcessed: allFiles.length,
      itemsProcessed: vocabularyItems.length + Array.from(duplicates.values()).reduce((a, b) => a + b, 0),
      uniqueItems: vocabularyItems.length,
      duplicates: Object.fromEntries(duplicates),
      validationErrors: validationErrors.length,
      outputFiles: dryRun ? [] : [options.output, options.staticOutput],
      dryRun
    };

    const reportPath = 'data/vocabulary-migration-report.json';
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    log(`Generated migration report at ${reportPath}`, 'info');

    log('Vocabulary data migration completed successfully', 'info');
    return vocabularyItems;

  } catch (error) {
    log(`Migration failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    throw error;
  }
}

// Run the migration
migrateVocabulary()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));