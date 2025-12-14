#!/usr/bin/env node

/**
 * Apply Vocabulary Fixes
 * 
 * Applies corrections and enrichments to vocabulary data.
 * Usage: pnpm run apply:vocabulary:fixes --file=fixes-batch-1.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const FIXES_FILE = process.argv.find(arg => arg.includes('--file='))?.split('=')[1];
const VOCAB_FILE = join(process.cwd(), 'data', 'unified-vocabulary.json');
const BACKUP_DIR = join(process.cwd(), 'data');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Utility to set nested value: setNestedValue(obj, "grammar.gender", "f")
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

// Utility to get nested value: getNestedValue(obj, "grammar.gender")
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, part) => current?.[part], obj);
}

async function createBackup() {
  const timestamp = Date.now();
  const backupFile = join(BACKUP_DIR, `unified-vocabulary-backup-${timestamp}.json`);

  const source = readFileSync(VOCAB_FILE, 'utf-8');
  writeFileSync(backupFile, source);

  console.log(`${GREEN}✅ Backup created:${RESET} ${backupFile}`);
  return backupFile;
}

async function applyFixes() {
  if (!FIXES_FILE) {
    console.error(`${RED}❌ Error: No fixes file specified${RESET}`);
    console.error('Usage: pnpm run apply:vocabulary:fixes --file=fixes.json');
    process.exit(1);
  }

  const fixesPath = join(process.cwd(), FIXES_FILE);
  if (!existsSync(fixesPath)) {
    console.error(`${RED}❌ Error: Fixes file not found${RESET}: ${fixesPath}`);
    process.exit(1);
  }

  // Create backup first
  const backupFile = await createBackup();

  // Load vocabulary and fixes
  const vocabData = JSON.parse(readFileSync(VOCAB_FILE, 'utf-8'));
  const vocabulary = Array.isArray(vocabData) ? vocabData : vocabData.items || [];
  const fixes = JSON.parse(readFileSync(fixesPath, 'utf-8'));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔧 Applying Vocabulary Fixes`);
  console.log(`Total fixes: ${fixes.length}`);
  console.log(`${'='.repeat(70)}\n`);

  const report = {
    timestamp: new Date().toISOString(),
    appliedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    backup: backupFile,
    details: {
      applied: [],
      skipped: [],
      errors: []
    }
  };

  // Apply each fix
  fixes.forEach((fix, idx) => {
    try {
      const item = vocabulary.find(v => v.id === fix.id);
      if (!item) {
        report.skippedCount++;
        report.details.skipped.push({ fix, reason: `Item not found: ${fix.id}` });
        console.log(`${YELLOW}⊘${RESET}  Skipped: ${fix.id} (not found)`);
        return;
      }

      const currentValue = getNestedValue(item, fix.fieldPath);
      if (currentValue !== fix.oldValue) {
        report.skippedCount++;
        report.details.skipped.push({
          fix,
          reason: `Value mismatch: expected "${fix.oldValue}", got "${currentValue}"`
        });
        console.log(`${YELLOW}⊘${RESET}  Skipped: ${fix.id}.${fix.fieldPath} (value mismatch)`);
        return;
      }

      setNestedValue(item, fix.fieldPath, fix.newValue);
      report.appliedCount++;
      report.details.applied.push(fix);
      console.log(`${GREEN}✅${RESET} Applied: ${fix.id}.${fix.fieldPath} = "${fix.newValue}"`);

    } catch (error) {
      report.errorCount++;
      report.details.errors.push({ fix, error: error.message });
      console.log(`${RED}❌${RESET} Error: ${fix.id}.${fix.fieldPath} - ${error.message}`);
    }
  });

  // Save updated vocabulary preserving metadata
  const outputData = Array.isArray(vocabData)
    ? vocabulary
    : { ...vocabData, items: vocabulary, itemCount: vocabulary.length, updatedAt: new Date().toISOString() };

  writeFileSync(VOCAB_FILE, JSON.stringify(outputData, null, 2));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 Summary`);
  console.log(`${'='.repeat(70)}`);
  console.log(`${GREEN}✅ Applied: ${report.appliedCount}${RESET}`);
  console.log(`${YELLOW}⊘ Skipped: ${report.skippedCount}${RESET}`);
  console.log(`${RED}❌ Errors: ${report.errorCount}${RESET}`);
  console.log(`\n📁 Backup: ${backupFile}`);
  console.log(`${'='.repeat(70)}\n`);

  // Save report
  const reportFile = join(process.cwd(), 'enrichment-output', `fixes-report-${Date.now()}.json`);
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved: ${reportFile}\n`);

  if (report.errorCount === 0 && report.appliedCount > 0) {
    console.log(`${GREEN}✨ All fixes applied successfully!${RESET}\n`);
    process.exit(0);
  } else if (report.appliedCount === 0) {
    console.log(`${YELLOW}⚠️  No fixes were applied. Check the report for details.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${YELLOW}⚠️  Some fixes had errors. Check the report for details.${RESET}\n`);
    process.exit(1);
  }
}

// Execute
applyFixes().catch(error => {
  console.error(`${RED}❌ Fatal error:${RESET}`, error);
  process.exit(1);
});
