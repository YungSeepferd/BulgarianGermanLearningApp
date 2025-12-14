#!/usr/bin/env node

/**
 * Batch Enrichment Importer
 * 
 * Imports enrichment data (declension, conjugation, examples) and merges with vocabulary.
 * Supports batch operations and validation.
 * 
 * Usage: pnpm run import:enrichment --file=enrichment-batch-1.json --type=declension
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENRICHMENT_FILE = process.argv.find(arg => arg.includes('--file='))?.split('=')[1];
const ENRICHMENT_TYPE = process.argv.find(arg => arg.includes('--type='))?.split('=')[1] || 'mixed';
const DRY_RUN = process.argv.includes('--dry-run');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function importEnrichment() {
  if (!ENRICHMENT_FILE) {
    console.error(`${RED}❌ Error: No enrichment file specified${RESET}`);
    console.error('Usage: pnpm run import:enrichment --file=enrichment.json [--type=declension|conjugation|examples|mixed] [--dry-run]');
    process.exit(1);
  }

  const enrichmentPath = join(process.cwd(), ENRICHMENT_FILE);
  if (!existsSync(enrichmentPath)) {
    console.error(`${RED}❌ Error: Enrichment file not found${RESET}: ${enrichmentPath}`);
    process.exit(1);
  }

  // Load files
  const vocabData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'unified-vocabulary.json'), 'utf-8'));
  const vocabulary = Array.isArray(vocabData) ? vocabData : vocabData.items || [];
  const enrichmentData = JSON.parse(readFileSync(enrichmentPath, 'utf-8'));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📚 Batch Enrichment Importer`);
  console.log(`Type: ${ENRICHMENT_TYPE} | Dry Run: ${DRY_RUN ? 'YES' : 'NO'}`);
  console.log(`${'='.repeat(70)}\n`);

  // Parse enrichment data (can be array or object)
  const enrichments = Array.isArray(enrichmentData) ? enrichmentData : Object.values(enrichmentData);
  
  console.log(`Loading enrichment: ${enrichments.length} entries`);

  let mergedCount = 0;
  let skippedCount = 0;
  const errors = [];

  // Import enrichment data
  enrichments.forEach((enrichment, idx) => {
    try {
      // Find matching vocabulary item
      const vocabItem = vocabulary.find(v => v.id === enrichment.id);
      if (!vocabItem) {
        skippedCount++;
        console.log(`${YELLOW}⊘${RESET}  [${idx + 1}] Item not found: ${enrichment.id}`);
        return;
      }

      // Merge enrichment data based on type
      if (ENRICHMENT_TYPE === 'declension' || ENRICHMENT_TYPE === 'mixed') {
        // Merge gender (for nouns)
        if (enrichment.gender) {
          if (!vocabItem.grammar) vocabItem.grammar = {};
          vocabItem.grammar.gender = enrichment.gender;
        }
        
        // Merge declension
        if (enrichment.declension) {
          if (!vocabItem.grammar) vocabItem.grammar = {};
          vocabItem.grammar.declension = enrichment.declension;
          console.log(`${GREEN}✅${RESET} [${idx + 1}] Merged declension${enrichment.gender ? ` (${enrichment.gender})` : ''}: ${vocabItem.german}`);
          mergedCount++;
        }
      }

      if (ENRICHMENT_TYPE === 'conjugation' || ENRICHMENT_TYPE === 'mixed') {
        if (enrichment.conjugation) {
          if (!vocabItem.grammar) vocabItem.grammar = {};
          vocabItem.grammar.conjugation = enrichment.conjugation;
          console.log(`${GREEN}✅${RESET} [${idx + 1}] Merged conjugation: ${vocabItem.german}`);
          mergedCount++;
        }
      }

      if (ENRICHMENT_TYPE === 'examples' || ENRICHMENT_TYPE === 'mixed') {
        if (enrichment.examples && Array.isArray(enrichment.examples)) {
          vocabItem.examples = enrichment.examples;
          console.log(`${GREEN}✅${RESET} [${idx + 1}] Merged examples: ${vocabItem.german} (${enrichment.examples.length} examples)`);
          mergedCount++;
        }
      }

      // Add metadata
      if (enrichment.culturalNotes) {
        if (!vocabItem.metadata) vocabItem.metadata = {};
        vocabItem.metadata.culturalNotes = enrichment.culturalNotes;
      }

      if (enrichment.mnemonics) {
        if (!vocabItem.metadata) vocabItem.metadata = {};
        vocabItem.metadata.mnemonics = enrichment.mnemonics;
      }

    } catch (error) {
      errors.push({ enrichment: enrichment.id, error: error.message });
      console.log(`${RED}❌${RESET} [${idx + 1}] Error: ${enrichment.id} - ${error.message}`);
    }
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Summary`);
  console.log(`${'='.repeat(70)}`);
  console.log(`${GREEN}✅ Merged: ${mergedCount}${RESET}`);
  console.log(`${YELLOW}⊘ Skipped: ${skippedCount}${RESET}`);
  console.log(`${RED}❌ Errors: ${errors.length}${RESET}`);

  if (!DRY_RUN && mergedCount > 0) {
    // Create backup
    const timestamp = Date.now();
    const backupPath = join(process.cwd(), 'data', `unified-vocabulary-backup-${timestamp}.json`);
    writeFileSync(backupPath, JSON.stringify(vocabData, null, 2));
    console.log(`\n${GREEN}✅ Backup created:${RESET} ${backupPath}`);

    // Save enriched vocabulary
    const outputData = Array.isArray(vocabData)
      ? vocabulary
      : { ...vocabData, items: vocabulary, itemCount: vocabulary.length, updatedAt: new Date().toISOString() };

    writeFileSync(join(process.cwd(), 'data', 'unified-vocabulary.json'), JSON.stringify(outputData, null, 2));
    console.log(`${GREEN}✅ Vocabulary updated with enrichment data${RESET}`);
  } else if (DRY_RUN) {
    console.log(`\n${YELLOW}ℹ️  Dry run mode - no changes written${RESET}`);
  }

  console.log(`${'='.repeat(70)}\n`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

try {
  importEnrichment();
} catch (error) {
  console.error(`${RED}❌ Error importing enrichment:${RESET}`, error);
  process.exit(1);
}
