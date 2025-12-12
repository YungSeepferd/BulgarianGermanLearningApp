/**
 * Vocabulary Enrichment Pipeline
 *
 * Orchestrates the complete enrichment process:
 * 1. Load legacy vocabulary entries
 * 2. Scrape external definitions (Langenscheidt)
 * 3. Validate and deduplicate data
 * 4. Merge into existing vocabulary schema
 * 5. Generate audit trail and report
 *
 * Usage:
 * ```typescript
 * const pipeline = new EnrichmentPipeline();
 * const result = await pipeline.enrichLegacyVocabulary(
 *   legacyEntries,
 *   { batchSize: 50, maxConcurrency: 5 }
 * );
 * ```
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  LangenscheidtScraper,
  EnrichedVocabularyEntry
} from './langenscheidt-scraper';
import {
  VocabularyValidator,
  ValidationReport,
  BatchValidationReport
} from './vocabulary-validator';
import { VocabularyItem } from '../../src/lib/schemas/vocabulary';

/**
 * Configuration for enrichment pipeline
 */
export interface EnrichmentConfig {
  batchSize?: number;
  maxConcurrency?: number;
  skipScraping?: boolean; // Use cached data only
  validateOnly?: boolean; // Don't merge into existing vocab
  outputDir?: string;
  auditTrail?: boolean;
}

/**
 * Enrichment result for a single vocabulary item
 */
export interface EnrichmentResult {
  originalId: string;
  German: string;
  bulgarian: string;
  enrichedWith: {
    definitions?: string[];
    examples?: Array<{ source: string; target: string }>;
    synonyms?: string[];
    culturalNotes?: string[];
    grammaticalInfo?: Record<string, any>;
  };
  mergeSuggestions: any[];
  confidence: number;
  timestamp: string;
  sourceUrl?: string;
}

/**
 * Complete pipeline execution report
 */
export interface PipelineReport {
  startTime: string;
  endTime: string;
  totalInput: number;
  successfulEnrichments: number;
  failedEnrichments: number;
  duplicatesSkipped: number;
  validationReport: BatchValidationReport;
  enrichmentResults: EnrichmentResult[];
  errors: Array<{ term: string; error: string }>;
  stats: {
    averageConfidence: number;
    processingTimeMs: number;
    itemsPerSecond: number;
  };
}

/**
 * Main enrichment pipeline orchestrator
 */
export class EnrichmentPipeline {
  private scraper?: LangenscheidtScraper;
  private validator?: VocabularyValidator;
  private outputDir: string;
  private auditLog: any[] = [];

  constructor(outputDir: string = './enrichment-output') {
    this.outputDir = outputDir;
  }

  /**
   * Initialize pipeline (setup scraper, loader, validator)
   */
  async initialize(existingVocab: VocabularyItem[]): Promise<void> {
    console.log('🚀 Initializing enrichment pipeline...');

    // Initialize scraper
    this.scraper = new LangenscheidtScraper();
    await this.scraper.initialize();

    // Initialize validator
    this.validator = new VocabularyValidator(existingVocab);

    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });

    console.log('✅ Pipeline initialized');
  }

  /**
   * Main enrichment orchestration
   */
  async enrichVocabulary(
    legacyEntries: any[],
    config: EnrichmentConfig = {}
  ): Promise<PipelineReport> {
    const startTime = new Date();
    const {
      batchSize = 50,
      maxConcurrency = 5,
      skipScraping = false,
      validateOnly = false,
      auditTrail = true
    } = config;

    console.log(`\n📚 Starting vocabulary enrichment pipeline`);
    console.log(`   Input entries: ${legacyEntries.length}`);
    console.log(`   Batch size: ${batchSize}`);
    console.log(`   Skip scraping: ${skipScraping}`);
    console.log(`   Validate only: ${validateOnly}\n`);

    const enrichmentResults: EnrichmentResult[] = [];
    const errors: Array<{ term: string; error: string }> = [];
    const enrichedEntries: any[] = [];
    let successCount = 0;
    let failureCount = 0;
    let duplicateCount = 0;

    // Process in batches
    for (let i = 0; i < legacyEntries.length; i += batchSize) {
      const batch = legacyEntries.slice(i, Math.min(i + batchSize, legacyEntries.length));
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(legacyEntries.length / batchSize);

      console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} entries)...`);

      // Enrich batch entries
      for (const entry of batch) {
        try {
          const enriched = await this.enrichEntry(entry, {
            skipScraping,
            auditTrail
          });

          if (enriched) {
            enrichedEntries.push(enriched);
            enrichmentResults.push({
              originalId: entry.id,
              German: entry.word || entry.german || 'unknown',
              bulgarian: entry.translation || entry.bulgarian || 'unknown',
              enrichedWith: {
                definitions: enriched.definitions?.map((d: any) => d.definition),
                examples: enriched.examples,
                synonyms: enriched.synonyms,
                culturalNotes: enriched.culturalNotes,
                grammaticalInfo: enriched.grammaticalInfo
              },
              mergeSuggestions: enriched.mergeSuggestions || [],
              confidence: enriched.confidence || 0,
              timestamp: enriched.scrapedAt,
              sourceUrl: enriched.sourceUrl
            });
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({
            term: entry.word || entry.german || entry.id,
            error: errorMsg
          });
          failureCount++;
        }
      }

      console.log(`   ✅ ${batch.length} entries processed`);
    }

    // Validate enriched entries
    console.log(`\n🔍 Validating enriched entries...`);
    if (!this.validator) throw new Error('Validator not initialized');

    const validationReport = await this.validator.batchValidate(enrichedEntries);
    duplicateCount = validationReport.duplicates;

    // Generate reports
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const report: PipelineReport = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalInput: legacyEntries.length,
      successfulEnrichments: successCount,
      failedEnrichments: failureCount,
      duplicatesSkipped: duplicateCount,
      validationReport,
      enrichmentResults,
      errors,
      stats: {
        averageConfidence:
          enrichmentResults.length > 0
            ? enrichmentResults.reduce((sum, r) => sum + r.confidence, 0) /
              enrichmentResults.length
            : 0,
        processingTimeMs: duration,
        itemsPerSecond: (legacyEntries.length / (duration / 1000)).toFixed(2)
      }
    };

    // Save reports and data
    await this.saveReports(report, validationReport);

    // Shutdown scraper
    if (this.scraper) {
      await this.scraper.shutdown();
    }

    console.log(`\n✅ Enrichment pipeline complete!`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`   Success: ${successCount}/${legacyEntries.length}`);
    console.log(`   Duplicates: ${duplicateCount}`);
    console.log(`   Average confidence: ${(report.stats.averageConfidence * 100).toFixed(1)}%`);

    return report;
  }

  /**
   * Enrich a single entry
   */
  private async enrichEntry(
    legacyEntry: any,
    options: { skipScraping?: boolean; auditTrail?: boolean } = {}
  ): Promise<EnrichedVocabularyEntry | null> {
    const german = legacyEntry.word || legacyEntry.german || legacyEntry.translation;
    const bulgarian = legacyEntry.translation || legacyEntry.bulgarian || legacyEntry.word;
    const direction: 'de-bg' | 'bg-de' = legacyEntry.source_lang === 'de' ? 'de-bg' : 'bg-de';

    if (!this.scraper) throw new Error('Scraper not initialized');

    try {
      // Determine which term to scrape
      const termToScrape = direction === 'de-bg' ? german : bulgarian;

      console.log(`  📖 Enriching: ${termToScrape} (${direction})`);

      // Scrape or use cache
      let enriched: EnrichedVocabularyEntry | null = null;

      if (!options.skipScraping) {
        enriched = await this.scraper.scrapeTerm(termToScrape, direction);
      }

      if (enriched) {
        // Merge with legacy data
        enriched = this.mergeWithLegacy(enriched, legacyEntry);

        if (options.auditTrail) {
          this.auditLog.push({
            timestamp: new Date().toISOString(),
            legacyId: legacyEntry.id,
            term: termToScrape,
            direction,
            sourceUrl: enriched.sourceUrl,
            confidence: enriched.confidence
          });
        }

        return enriched;
      }

      return null;
    } catch (error) {
      console.error(`   ❌ Error enriching entry:`, error);
      return null;
    }
  }

  /**
   * Merge enriched data with legacy entry
   */
  private mergeWithLegacy(
    enriched: EnrichedVocabularyEntry,
    legacyEntry: any
  ): EnrichedVocabularyEntry {
    // Preserve and enhance with legacy data
    const merged = { ...enriched };

    // Merge examples
    if (legacyEntry.examples) {
      merged.examples = [
        ...merged.examples,
        ...legacyEntry.examples.map((ex: any) => ({
          source: ex.sentence || ex.source,
          target: ex.translation || ex.target,
          context: ex.context
        }))
      ];
    }

    // Merge notes and cultural information
    if (legacyEntry.cultural_note) {
      merged.culturalNotes.push(legacyEntry.cultural_note);
    }

    if (legacyEntry.linguistic_note) {
      merged.culturalNotes.push(`Linguistic: ${legacyEntry.linguistic_note}`);
    }

    // Merge etymology if available
    if (legacyEntry.etymology) {
      merged.culturalNotes.push(`Etymology: ${legacyEntry.etymology}`);
    }

    // Update confidence based on available data
    const dataPoints =
      (merged.definitions?.length || 0) +
      (merged.examples?.length || 0) * 0.5 +
      (merged.synonyms?.length || 0) * 0.3;
    merged.confidence = Math.min(0.99, 0.7 + dataPoints * 0.05);

    return merged;
  }

  /**
   * Save reports and data exports
   */
  private async saveReports(
    report: PipelineReport,
    validationReport: BatchValidationReport
  ): Promise<void> {
    console.log(`\n💾 Saving reports and data...`);

    // Save main report as JSON
    const reportPath = path.join(this.outputDir, 'enrichment-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`   📄 Report: ${reportPath}`);

    // Save enrichment results
    const resultsPath = path.join(this.outputDir, 'enriched-entries.json');
    await fs.writeFile(resultsPath, JSON.stringify(report.enrichmentResults, null, 2), 'utf-8');
    console.log(`   📋 Enriched entries: ${resultsPath}`);

    // Save validation report as markdown
    if (this.validator) {
      const validator = this.validator;
      const markdownReport = validator.generateReport(validationReport);
      const mdPath = path.join(this.outputDir, 'validation-report.md');
      await fs.writeFile(mdPath, markdownReport, 'utf-8');
      console.log(`   📑 Validation report: ${mdPath}`);
    }

    // Save audit trail
    if (this.auditLog.length > 0) {
      const auditPath = path.join(this.outputDir, 'audit-trail.json');
      await fs.writeFile(auditPath, JSON.stringify(this.auditLog, null, 2), 'utf-8');
      console.log(`   🔐 Audit trail: ${auditPath}`);
    }

    // Save errors
    if (report.errors.length > 0) {
      const errorsPath = path.join(this.outputDir, 'errors.json');
      await fs.writeFile(errorsPath, JSON.stringify(report.errors, null, 2), 'utf-8');
      console.log(`   ⚠️  Errors: ${errorsPath}`);
    }

    console.log(`\n✅ All reports saved to: ${this.outputDir}`);
  }

  /**
   * Export enriched vocabulary in standard schema format
   */
  async exportToSchema(enrichmentResults: EnrichmentResult[]): Promise<VocabularyItem[]> {
    console.log(`\n🔄 Converting to standard vocabulary schema...`);

    const converted: VocabularyItem[] = [];

    for (const result of enrichmentResults) {
      try {
        const item: VocabularyItem = {
          id: result.originalId,
          German: result.German,
          bulgarian: result.bulgarian,
          partOfSpeech: 'unknown',
          difficulty: 2,
          categories: ['uncategorized'],
          metadata: {
            examples: result.enrichedWith.examples?.map((ex) => ({
              german: ex.source,
              bulgarian: ex.target
            })),
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
        };

        converted.push(item);
      } catch (error) {
        console.error(`Error converting ${result.originalId}:`, error);
      }
    }

    console.log(`✅ Converted ${converted.length} entries to schema format`);
    return converted;
  }
}

export default EnrichmentPipeline;
