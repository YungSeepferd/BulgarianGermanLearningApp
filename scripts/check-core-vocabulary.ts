#!/usr/bin/env node
/**
 * Core Vocabulary Completeness Check
 *
 * Checks if essential A1/A2 vocabulary is present in the database
 * and generates a report of missing entries.
 *
 * Usage:
 * pnpm tsx scripts/check-core-vocabulary.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import CoreVocabularyChecker from './enrichment/core-vocabulary-checker';

// Get the directory of the current script
const scriptDir = __dirname;

async function checkCoreVocabulary() {
  try {
    console.log('🔍 Checking core vocabulary completeness...');

    // Load vocabulary data
    const vocabPath = join(scriptDir, '../src/lib/data/unified-vocabulary.json');
    const vocabData = JSON.parse(readFileSync(vocabPath, 'utf-8'));
    const vocabulary = vocabData.items;

    console.log(`📚 Loaded ${vocabulary.length} vocabulary entries`);

    // Check completeness
    const checker = new CoreVocabularyChecker(vocabulary);
    const report = checker.checkCompleteness();

    // Generate markdown report
    const reportMd = checker.generateReport(report);
    const reportPath = join(scriptDir, '../reports/core-vocabulary-completeness.md');
    writeFileSync(reportPath, reportMd);

    console.log(`✅ Report generated: ${reportPath}`);

    // Generate template for missing entries
    if (report.missingEntries.length > 0) {
      const template = checker.generateMissingEntriesTemplate(report.missingEntries);
      const templatePath = join(scriptDir, '../reports/missing-core-vocabulary-template.json');
      writeFileSync(templatePath, template);
      console.log(`📋 Template for missing entries: ${templatePath}`);
    }

    // Output summary
    console.log(`\n📊 Core Vocabulary Completeness:`);
    console.log(`   Total Core Entries: ${report.totalCoreEntries}`);
    console.log(`   Present: ${report.presentEntries} (${report.completenessPercentage.toFixed(1)}%)`);
    console.log(`   Missing: ${report.missingEntries.length}`);

    if (report.missingEntries.length > 0) {
      console.log(`\n🚨 Missing Entries:`);
      const byLevel = report.missingEntries.reduce((acc, entry) => {
        acc[entry.level] = (acc[entry.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const [level, count] of Object.entries(byLevel)) {
        console.log(`   ${level}: ${count} missing`);
      }
    }

    console.log(`\n🎯 Recommendations:`);
    if (report.completenessPercentage < 90) {
      console.log(`   ❗ High Priority: Add missing A1 level vocabulary immediately`);
    } else if (report.completenessPercentage < 95) {
      console.log(`   ⚠️ Medium Priority: Add remaining missing vocabulary`);
    } else {
      console.log(`   ✅ Excellent: Core vocabulary is complete`);
    }

  } catch (error) {
    console.error('❌ Error checking core vocabulary:', error);
    process.exit(1);
  }
}

// Run the check
checkCoreVocabulary();