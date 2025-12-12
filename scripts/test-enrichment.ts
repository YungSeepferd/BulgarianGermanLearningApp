#!/usr/bin/env tsx
/**
 * Simple vocabulary enrichment test
 * Tests the enrichment system with a pilot batch
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    console.log('🚀 Starting Vocabulary Enrichment Pilot Test');
    console.log('============================================\n');

    // Import modules
    const { EnrichmentPipeline } = await import('./enrichment/enrichment-pipeline.js');
    const { LangenscheidtScraper } = await import('./enrichment/langenscheidt-scraper.js');

    // Setup paths
    const archiveDir = path.join(__dirname, '../_legacy_archive/data/archive-data-cleanup');
    const outputDir = path.join(__dirname, '../enrichment-output');

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    console.log('📂 Output directory:', outputDir);

    // Load legacy vocabulary (single batch for pilot)
    const batchFile = path.join(archiveDir, 'vocabulary-batch-5a-colors.json');
    
    if (!(await fs.stat(batchFile).catch(() => null))) {
      console.log('❌ Batch file not found:', batchFile);
      process.exit(1);
    }

    console.log('📥 Loading batch file:', batchFile);
    const legacyData = JSON.parse(await fs.readFile(batchFile, 'utf-8'));
    console.log(`✅ Loaded ${legacyData.length} entries from batch\n`);

    // Load existing vocabulary
    const existingVocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
    let existingVocab: any[] = [];
    
    if (await fs.stat(existingVocabPath).catch(() => null)) {
      const existingData = JSON.parse(await fs.readFile(existingVocabPath, 'utf-8'));
      existingVocab = Array.isArray(existingData) ? existingData : [];
      console.log(`✅ Loaded ${existingVocab.length} entries from existing vocabulary\n`);
    }

    // Create pipeline
    const pipeline = new EnrichmentPipeline();
    await pipeline.initialize(existingVocab);

    // Run enrichment
    console.log('🔄 Starting enrichment pipeline...');
    const config = {
      batchSize: 10,
      maxConcurrency: 2
    };

    const report = await pipeline.enrichVocabulary(legacyData, config);

    // Save reports
    await fs.writeFile(
      path.join(outputDir, 'enrichment-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate summary
    const summary = `
# Vocabulary Enrichment Pilot Test Results

**Date**: ${new Date().toISOString()}

## Summary
- Total items processed: ${report.successCount + report.errorCount}
- Successfully enriched: ${report.successCount}
- Failed: ${report.errorCount}
- Success rate: ${((report.successCount / (report.successCount + report.errorCount)) * 100).toFixed(1)}%

## Statistics
${JSON.stringify(report.statistics, null, 2)}

## Files Generated
- enrichment-report.json - Full enrichment details
- validation-report.md - Quality metrics
- audit-trail.json - Complete operation history

## Next Steps
If successful, run full enrichment:
\`\`\`bash
pnpm run enrich:vocabulary
\`\`\`
`;

    await fs.writeFile(path.join(outputDir, 'SUMMARY.md'), summary);

    console.log('\n✅ Enrichment completed!');
    console.log('📊 Summary:', {
      successCount: report.successCount,
      errorCount: report.errorCount,
      successRate: `${((report.successCount / (report.successCount + report.errorCount)) * 100).toFixed(1)}%`
    });
    console.log('\n📁 Reports saved to:', outputDir);
    console.log('\n📖 View summary: cat', path.join(outputDir, 'SUMMARY.md'));

  } catch (error) {
    console.error('❌ Error during enrichment:', error);
    process.exit(1);
  }
}

main();
