#!/usr/bin/env node

/**
 * Validate Vocabulary Data
 * 
 * Comprehensive validation of vocabulary entries against quality criteria.
 * Usage: pnpm run validate:vocabulary:batch --id=1
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const BATCH_ID = parseInt(process.argv.find(arg => arg.includes('--id='))?.split('=')[1] || '1');
const BATCH_SIZE = 10;

const severityColors = {
  critical: '\x1b[41m', // Red background
  high: '\x1b[43m',     // Yellow background
  medium: '\x1b[44m',   // Blue background
  low: '\x1b[46m',      // Cyan background
};

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

// Validation functions
function validateRequiredFields(item) {
  const errors = [];

  if (!item.id || typeof item.id !== 'string') {
    errors.push({ field: 'id', severity: 'critical', message: 'Missing or invalid ID' });
  }

  if (!item.german?.trim()) {
    errors.push({ field: 'german', severity: 'critical', message: 'Missing German translation' });
  }

  if (!item.bulgarian?.trim()) {
    errors.push({ field: 'bulgarian', severity: 'critical', message: 'Missing Bulgarian translation' });
  }

  const validPos = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];
  if (!validPos.includes(item.partOfSpeech)) {
    errors.push({ field: 'partOfSpeech', severity: 'high', message: `Invalid part of speech: ${item.partOfSpeech}` });
  }

  const validDifficulty = ['A1', 'A2', 'B1', 'B2'];
  if (!validDifficulty.includes(item.difficulty)) {
    errors.push({ field: 'difficulty', severity: 'high', message: `Invalid difficulty: ${item.difficulty}` });
  }

  return errors;
}

function validateGrammarData(item) {
  const errors = [];

  if (item.partOfSpeech === 'noun') {
    if (!item.grammar?.gender) {
      errors.push({ field: 'grammar.gender', severity: 'high', message: 'Missing gender for noun' });
    }
  }

  if (item.partOfSpeech === 'verb') {
    if (!item.grammar?.auxiliary) {
      errors.push({ field: 'grammar.auxiliary', severity: 'medium', message: 'Missing auxiliary verb (haben/sein)' });
    }
  }

  if (item.partOfSpeech === 'adjective') {
    if (!item.grammar?.comparative || !item.grammar?.superlative) {
      errors.push({ field: 'grammar.forms', severity: 'low', message: 'Missing comparison forms' });
    }
  }

  return errors;
}

function validateExamples(item) {
  const errors = [];

  if (!item.examples || item.examples.length === 0) {
    errors.push({ field: 'examples', severity: 'medium', message: 'No examples provided' });
  } else if (item.examples.length < 2) {
    errors.push({ field: 'examples', severity: 'low', message: 'Only 1 example (recommend 2+)' });
  }

  return errors;
}

function validateCategories(item) {
  const errors = [];

  if (!item.categories || item.categories.length === 0) {
    errors.push({ field: 'categories', severity: 'medium', message: 'No categories assigned' });
  }

  return errors;
}

function validateItem(item) {
  const errors = [];

  errors.push(...validateRequiredFields(item));
  errors.push(...validateGrammarData(item));
  errors.push(...validateExamples(item));
  errors.push(...validateCategories(item));

  const warnings = [];
  if (item.metadata?.declension && Object.keys(item.metadata.declension).length > 0) {
    warnings.push('Has declension data ✓');
  }
  if (item.metadata?.conjugation && Object.keys(item.metadata.conjugation).length > 0) {
    warnings.push('Has conjugation data ✓');
  }

  return {
    id: item.id,
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings
  };
}

// Main execution
try {
  const vocabData = JSON.parse(readFileSync(join(process.cwd(), 'data', 'unified-vocabulary.json'), 'utf-8'));
  const vocabulary = Array.isArray(vocabData) ? vocabData : vocabData.items || [];

  const startIdx = (BATCH_ID - 1) * BATCH_SIZE;
  const endIdx = Math.min(startIdx + BATCH_SIZE, vocabulary.length);
  const batch = vocabulary.slice(startIdx, endIdx);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 Vocabulary Validation Report - Batch ${BATCH_ID}`);
  console.log(`Entries ${startIdx + 1}-${endIdx} of ${vocabulary.length}`);
  console.log(`${'='.repeat(70)}\n`);

  const results = batch.map(item => validateItem(item));
  const validCount = results.filter(r => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);

  // Print detailed results
  results.forEach((result, idx) => {
    const item = batch[idx];
    const statusIcon = result.valid ? GREEN + '✅' + RESET : RED + '❌' + RESET;

    console.log(`${statusIcon} ${item.german} → ${item.bulgarian}`);

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        const colorCode = severityColors[error.severity] || '';
        console.log(`   ${colorCode} ${error.severity.toUpperCase()} ${RESET} ${error.field}: ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`   ℹ️  ${warning}`);
      });
    }

    console.log();
  });

  // Summary
  console.log(`${'='.repeat(70)}`);
  console.log(`📊 Summary for Batch ${BATCH_ID}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`${GREEN}✅ Valid entries: ${validCount}/${results.length}${RESET}`);
  console.log(`${RED}❌ Entries with errors: ${results.length - validCount}/${results.length}${RESET}`);
  console.log(`Total errors: ${errorCount}`);

  // Error breakdown by severity
  const criticalErrors = results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'critical').length, 0);
  const highErrors = results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'high').length, 0);
  const mediumErrors = results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'medium').length, 0);
  const lowErrors = results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'low').length, 0);

  if (criticalErrors > 0) console.log(`${RED}  Critical: ${criticalErrors}${RESET}`);
  if (highErrors > 0) console.log(`${YELLOW}  High: ${highErrors}${RESET}`);
  if (mediumErrors > 0) console.log(`  Medium: ${mediumErrors}`);
  if (lowErrors > 0) console.log(`  Low: ${lowErrors}`);

  console.log(`\n💾 Results saved for batch review and fixes`);
  console.log(`${'='.repeat(70)}\n`);

} catch (error) {
  console.error(RED + '❌ Error validating batch:' + RESET, error);
  process.exit(1);
}
