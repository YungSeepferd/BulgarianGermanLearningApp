#!/usr/bin/env tsx

/**
 * Vocabulary Enrichment Orchestration Script
 *
 * Main entry point for the vocabulary enrichment system.
 * Handles:
 * - Loading legacy vocabulary from archive
 * - Orchestrating enrichment pipeline
 * - Merging results into existing vocabulary
 * - Generating comprehensive reports
 *
 * Usage:
 * ```bash
 * # Full enrichment pipeline
 * pnpm run enrich:vocabulary
 *
 * # Dry run (validation only)
 * pnpm run enrich:vocabulary -- --validate-only
 *
 * # Use cached data only
 * pnpm run enrich:vocabulary -- --skip-scraping
 *
 * # Enrich specific batch
 * pnpm run enrich:vocabulary -- --batch-file vocabulary-batch-5a-colors.json
 * ```
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import { EnrichmentPipeline } from './enrichment-pipeline';
import { LangenscheidtScraper } from './langenscheidt-scraper';

/**
 * Parse command line arguments
 */
function createCLI() {
  const program = new Command();

  program
    .name('enrich-vocabulary')
    .description('Enrich vocabulary with external definitions from Langenscheidt')
    .option('--batch-file <file>', 'Specific batch file to process')
    .option('--skip-scraping', 'Use cached data only')
    .option('--validate-only', 'Validate without merging')
    .option('--batch-size <number>', 'Number of items per batch', '50')
    .option('--max-concurrency <number>', 'Max concurrent scraping requests', '5')
    .option('--output-dir <dir>', 'Output directory for reports', './enrichment-output')
    .option('--dry-run', 'Simulate without saving changes')
    .parse();

  return program.opts();
}

/**
 * Load existing vocabulary
 */
async function loadExistingVocabulary(): Promise<any[]> {
  console.log('📖 Loading existing vocabulary...');

  const vocabPaths = [
    './data/unified-vocabulary.json',
    './src/lib/data/unified-vocabulary.json',
    './build/data/unified-vocabulary.json'
  ];

  for (const vocabPath of vocabPaths) {
    try {
      const content = await fs.readFile(vocabPath, 'utf-8');
      const data = JSON.parse(content);
      const items = data.items || data;
      console.log(`✅ Loaded ${Array.isArray(items) ? items.length : 0} existing vocabulary items`);
      return Array.isArray(items) ? items : [items];
    } catch {
      // Continue to next path
    }
  }

  console.warn('⚠️  No existing vocabulary found, proceeding with new enrichment');
  return [];
}

/**
 * Load legacy vocabulary from archive
 */
async function loadLegacyVocabulary(specificFile?: string): Promise<any[]> {
  console.log('📚 Loading legacy vocabulary from archive...');

  const archiveDir = './_legacy_archive/data/archive-data-cleanup';
  let files: string[] = [];

  try {
    const entries = await fs.readdir(archiveDir);
    files = entries
      .filter((f) => f.endsWith('.json') && f.startsWith('vocabulary-batch'))
      .sort();
  } catch (error) {
    console.error('❌ Failed to read archive directory:', error);
    return [];
  }

  if (files.length === 0) {
    console.warn('⚠️  No legacy vocabulary files found');
    return [];
  }

  // Filter to specific file if provided
  if (specificFile) {
    files = files.filter((f) => f.includes(specificFile));
    if (files.length === 0) {
      console.error(`❌ No files matching: ${specificFile}`);
      return [];
    }
  }

  console.log(`📦 Found ${files.length} legacy vocabulary file(s)`);

  const allEntries: any[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(archiveDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const entries = JSON.parse(content);
      const parsed = Array.isArray(entries) ? entries : [entries];

      console.log(`   ✅ ${file}: ${parsed.length} entries`);
      allEntries.push(...parsed);
    } catch (error) {
      console.error(`   ❌ Failed to read ${file}:`, error);
    }
  }

  console.log(`\n✅ Loaded ${allEntries.length} legacy vocabulary entries total`);
  return allEntries;
}

/**
 * Merge enriched entries into existing vocabulary
 */
async function mergeEnrichedEntries(
  existingVocab: any[],
  enrichedResults: any[],
  dryRun: boolean = false
): Promise<any[]> {
  console.log(`\n🔀 Merging enriched entries...`);

  const merged = [...existingVocab];
  let addedCount = 0;
  let updatedCount = 0;

  for (const result of enrichedResults) {
    const existingIndex = merged.findIndex(
      (item) =>
        (item.id === result.originalId ||
          (item.german?.toLowerCase() === result.German?.toLowerCase() &&
            item.bulgarian?.toLowerCase() === result.bulgarian?.toLowerCase())) &&
        !result.isDuplicate
    );

    if (existingIndex >= 0) {
      // Update existing entry with enriched data
      const existing = merged[existingIndex];
      existing.metadata = existing.metadata || {};
      existing.metadata.examples = [
        ...(existing.metadata.examples || []),
        ...(result.enrichedWith.examples || [])
      ];
      existing.metadata.synonyms = [
        ...(existing.metadata.synonyms || []),
        ...(result.enrichedWith.synonyms || [])
      ];
      existing.metadata.culturalNote = [existing.metadata.culturalNote, ...result.enrichedWith.culturalNotes]
        .filter(Boolean)
        .join('\n');

      if (result.sourceUrl) {
        existing.metadata.links = existing.metadata.links || [];
        existing.metadata.links.push({
          label: 'Langenscheidt',
          url: result.sourceUrl
        });
      }

      existing.isVerified = existing.isVerified || result.confidence > 0.85;
      updatedCount++;
    } else if (!result.isDuplicate) {
      // Add new entry
      merged.push({
        id: result.originalId,
        german: result.German,
        bulgarian: result.bulgarian,
        partOfSpeech: 'unknown',
        difficulty: 2,
        categories: ['uncategorized'],
        metadata: {
          examples: result.enrichedWith.examples,
          synonyms: result.enrichedWith.synonyms,
          culturalNote: result.enrichedWith.culturalNotes?.join('\n'),
          links: result.sourceUrl
            ? [
                {
                  label: 'Langenscheidt',
                  url: result.sourceUrl
                }
              ]
            : undefined
        },
        isVerified: result.confidence > 0.85,
        createdAt: new Date(result.timestamp)
      });
      addedCount++;
    }
  }

  console.log(`✅ Merge complete:`);
  console.log(`   Added: ${addedCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Total: ${merged.length}`);

  return merged;
}

/**
 * Generate final summary report
 */
function generateSummaryReport(
  legacyCount: number,
  enrichedResults: any[],
  validationReport: any,
  outputDir: string
): string {
  let report = `# Vocabulary Enrichment Summary\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;

  report += `## Overview\n`;
  report += `- **Legacy entries processed**: ${legacyCount}\n`;
  report += `- **Successfully enriched**: ${enrichedResults.length}\n`;
  report += `- **Success rate**: ${((enrichedResults.length / legacyCount) * 100).toFixed(1)}%\n`;
  report += `- **Output directory**: ${outputDir}\n\n`;

  report += `## Quality Metrics\n`;
  report += `- **Average confidence**: ${(validationReport.stats?.averageConfidence * 100 || 0).toFixed(1)}%\n`;
  report += `- **Duplicates detected**: ${validationReport.duplicates}\n`;
  report += `- **Valid entries**: ${validationReport.validEntries}\n`;
  report += `- **Processing time**: ${(validationReport.stats?.processingTimeMs / 1000).toFixed(2)}s\n\n`;

  report += `## Files Generated\n`;
  report += `- \`enrichment-report.json\` - Detailed enrichment results\n`;
  report += `- \`enriched-entries.json\` - Enriched vocabulary data\n`;
  report += `- \`validation-report.md\` - Validation analysis\n`;
  report += `- \`audit-trail.json\` - Complete audit trail with sources\n`;
  report += `- \`errors.json\` - Failed enrichments (if any)\n\n`;

  report += `## Next Steps\n`;
  report += `1. Review \`validation-report.md\` for any issues\n`;
  report += `2. Inspect \`enriched-entries.json\` for data quality\n`;
  report += `3. Check \`audit-trail.json\` for transparency\n`;
  report += `4. If satisfied, merge results into \`data/unified-vocabulary.json\`\n`;
  report += `5. Run tests to verify schema compliance\n\n`;

  report += `## Recommendations\n`;
  report += `- Review duplicate candidates manually\n`;
  report += `- Verify high-confidence entries (>0.85)\n`;
  report += `- Consider manual review for entries with warnings\n`;
  report += `- Keep audit trail for reproducibility\n`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    const options = createCLI();

    console.log('🚀 Vocabulary Enrichment System\n');
    console.log('Options:');
    console.log(`  - Skip scraping: ${options.skipScraping}`);
    console.log(`  - Validate only: ${options.validateOnly}`);
    console.log(`  - Dry run: ${options.dryRun}`);
    console.log(`  - Batch size: ${options.batchSize}`);
    console.log(`  - Output: ${options.outputDir}\n`);

    // Load vocabularies
    const existingVocab = await loadExistingVocabulary();
    const legacyVocab = await loadLegacyVocabulary(options.batchFile);

    if (legacyVocab.length === 0) {
      console.error('❌ No vocabulary to enrich');
      process.exit(1);
    }

    // Initialize and run pipeline
    const pipeline = new EnrichmentPipeline(options.outputDir);
    await pipeline.initialize(existingVocab);

    const result = await pipeline.enrichVocabulary(legacyVocab, {
      batchSize: parseInt(options.batchSize),
      maxConcurrency: parseInt(options.maxConcurrency),
      skipScraping: options.skipScraping,
      validateOnly: options.validateOnly
    });

    // Generate summary
    const summaryReport = generateSummaryReport(
      legacyVocab.length,
      result.enrichmentResults,
      result.validationReport,
      options.outputDir
    );

    const summaryPath = path.join(options.outputDir, 'SUMMARY.md');
    await fs.writeFile(summaryPath, summaryReport, 'utf-8');
    console.log(`📄 Summary: ${summaryPath}`);

    // Merge if not validate-only and not dry-run
    if (!options.validateOnly && !options.dryRun) {
      const merged = await mergeEnrichedEntries(existingVocab, result.enrichmentResults);

      // Save merged vocabulary
      const outputPath = path.join(options.outputDir, 'merged-vocabulary.json');
      await fs.writeFile(outputPath, JSON.stringify(merged, null, 2), 'utf-8');
      console.log(`\n✅ Merged vocabulary saved to: ${outputPath}`);
      console.log(`   Total entries: ${merged.length}`);
    } else if (options.dryRun) {
      console.log('\n🔍 Dry run mode - no changes saved');
    } else {
      console.log('\n✅ Validation complete - no merging performed (--validate-only)');
    }

    console.log('\n✅ Enrichment complete!\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
