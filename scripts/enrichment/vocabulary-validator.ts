/**
 * Vocabulary Validation & Deduplication Engine
 *
 * Validates enriched entries against existing vocabulary, detects duplicates,
 * flags inconsistencies, and prepares data for merging.
 *
 * Usage:
 * ```typescript
 * const validator = new VocabularyValidator(existingVocab);
 * const report = await validator.validateEnrichedEntry(enrichedEntry);
 *
 * if (report.isDuplicate) {
 *   console.log('Already exists:', report.existingId);
 * } else if (report.issues.length === 0) {
 *   console.log('Ready to merge:', enrichedEntry);
 * }
 * ```
 */

import { VocabularyItem } from '../../src/lib/schemas/vocabulary';

/**
 * Validation report for a single entry
 */
export interface ValidationReport {
  term: string;
  direction: 'de-bg' | 'bg-de';
  isValid: boolean;
  isDuplicate: boolean;
  existingId?: string;
  duplicateConfidence: number; // 0-1 score
  issues: ValidationIssue[];
  warnings: string[];
  suggestions: MergeSuggestion[];
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}

/**
 * Suggestion for merging data
 */
export interface MergeSuggestion {
  action: 'add' | 'update' | 'merge' | 'review';
  field: string;
  reason: string;
  existingValue?: any;
  suggestedValue?: any;
}

/**
 * Batch validation report
 */
export interface BatchValidationReport {
  totalEntries: number;
  validEntries: number;
  duplicates: number;
  entriesWithIssues: number;
  criticalIssues: ValidationIssue[];
  timestamp: string;
  details: Record<string, ValidationReport>;
}

/**
 * Vocabulary validator for enriched entries
 */
export class VocabularyValidator {
  private existingVocab: VocabularyItem[];
  private existingTerms: Map<string, VocabularyItem[]> = new Map(); // term -> entries
  private similarityCache: Map<string, number> = new Map(); // for performance

  constructor(existingVocab: VocabularyItem[]) {
    this.existingVocab = existingVocab;
    this.buildTermIndex();
  }

  /**
   * Build index for fast lookups
   */
  private buildTermIndex(): void {
    for (const item of this.existingVocab) {
      const germLower = item.german.toLowerCase();
      const bulgLower = item.bulgarian.toLowerCase();

      if (!this.existingTerms.has(germLower)) {
        this.existingTerms.set(germLower, []);
      }
      this.existingTerms.get(germLower)!.push(item);

      if (!this.existingTerms.has(bulgLower)) {
        this.existingTerms.set(bulgLower, []);
      }
      this.existingTerms.get(bulgLower)!.push(item);
    }
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const cacheKey = `${str1}||${str2}`;
    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey)!;
    }

    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(s1, s2);
    const similarity = 1 - distance / maxLength;

    this.similarityCache.set(cacheKey, similarity);
    return similarity;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Find potential duplicates
   */
  private findDuplicates(term: string, threshold: number = 0.85): VocabularyItem[] {
    const candidates = this.existingTerms.get(term.toLowerCase()) || [];
    const matches: Array<{ item: VocabularyItem; score: number }> = [];

    for (const item of this.existingVocab) {
      const germSim = this.calculateSimilarity(term, item.german);
      const bulgSim = this.calculateSimilarity(term, item.bulgarian);
      const maxSim = Math.max(germSim, bulgSim);

      if (maxSim >= threshold) {
        matches.push({ item, score: maxSim });
      }
    }

    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score);
    return matches.map((m) => m.item);
  }

  /**
   * Validate a single enriched entry
   */
  async validateEnrichedEntry(entry: any): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];
    const suggestions: MergeSuggestion[] = [];

    // Validate required fields
    if (!entry.term) {
      issues.push({
        severity: 'error',
        code: 'MISSING_TERM',
        message: 'Term is required',
        field: 'term'
      });
    }

    if (!entry.primaryTranslation) {
      issues.push({
        severity: 'error',
        code: 'MISSING_TRANSLATION',
        message: 'Primary translation is required',
        field: 'primaryTranslation'
      });
    }

    if (!entry.direction || !['de-bg', 'bg-de'].includes(entry.direction)) {
      issues.push({
        severity: 'error',
        code: 'INVALID_DIRECTION',
        message: 'Direction must be "de-bg" or "bg-de"',
        field: 'direction'
      });
    }

    // Validate data quality
    if (entry.definitions && entry.definitions.length === 0) {
      warnings.push('No definitions provided');
    }

    if (entry.examples && entry.examples.length === 0) {
      warnings.push('No examples provided');
    }

    if (!entry.partOfSpeech || entry.partOfSpeech === 'unknown') {
      warnings.push('Part of speech not identified');
    }

    if (entry.confidence && entry.confidence < 0.7) {
      warnings.push(`Low confidence score: ${entry.confidence}`);
    }

    // Check for duplicates
    let isDuplicate = false;
    let existingId: string | undefined;
    let duplicateConfidence = 0;

    const searchTerm = entry.direction === 'de-bg' ? entry.term : entry.primaryTranslation;
    const duplicateCandidates = this.findDuplicates(searchTerm, 0.9);

    if (duplicateCandidates.length > 0) {
      const best = duplicateCandidates[0];
      const similarity = this.calculateSimilarity(
        entry.direction === 'de-bg' ? entry.term : entry.primaryTranslation,
        entry.direction === 'de-bg' ? best.german : best.bulgarian
      );

      if (similarity > 0.95) {
        isDuplicate = true;
        existingId = best.id;
        duplicateConfidence = similarity;

        issues.push({
          severity: 'warning',
          code: 'POTENTIAL_DUPLICATE',
          message: `Potential duplicate of existing entry (similarity: ${(similarity * 100).toFixed(1)}%)`,
          field: 'term'
        });

        // Suggest merging enriched data
        if (entry.definitions && entry.definitions.length > 0) {
          suggestions.push({
            action: 'merge',
            field: 'definitions',
            reason: 'Enrich existing entry with new definitions',
            existingValue: best.metadata?.examples,
            suggestedValue: entry.definitions
          });
        }

        if (entry.examples && entry.examples.length > 0) {
          suggestions.push({
            action: 'merge',
            field: 'examples',
            reason: 'Add more context examples',
            suggestedValue: entry.examples
          });
        }

        if (entry.synonyms && entry.synonyms.length > 0) {
          suggestions.push({
            action: 'merge',
            field: 'synonyms',
            reason: 'Enrich synonym list',
            suggestedValue: entry.synonyms
          });
        }
      } else if (similarity > 0.85) {
        warnings.push(
          `Similar to existing entry "${best.german}"/"${best.bulgarian}" (similarity: ${(similarity * 100).toFixed(1)}%) - manual review recommended`
        );
        suggestions.push({
          action: 'review',
          field: 'term',
          reason: 'Verify this is not a duplicate before merging'
        });
      }
    }

    return {
      term: entry.term,
      direction: entry.direction,
      isValid: issues.filter((i) => i.severity === 'error').length === 0,
      isDuplicate,
      existingId,
      duplicateConfidence,
      issues,
      warnings,
      suggestions
    };
  }

  /**
   * Batch validate multiple entries
   */
  async batchValidate(entries: any[]): Promise<BatchValidationReport> {
    console.log(`🔍 Validating ${entries.length} entries...`);

    const reports: Record<string, ValidationReport> = {};
    let validCount = 0;
    let duplicateCount = 0;
    let issueCount = 0;
    const criticalIssues: ValidationIssue[] = [];

    for (const entry of entries) {
      const report = await this.validateEnrichedEntry(entry);
      const key = `${entry.direction}:${entry.term}`;
      reports[key] = report;

      if (report.isValid) validCount++;
      if (report.isDuplicate) duplicateCount++;
      if (report.issues.length > 0) issueCount++;

      const errors = report.issues.filter((i) => i.severity === 'error');
      criticalIssues.push(...errors);
    }

    const batchReport: BatchValidationReport = {
      totalEntries: entries.length,
      validEntries: validCount,
      duplicates: duplicateCount,
      entriesWithIssues: issueCount,
      criticalIssues,
      timestamp: new Date().toISOString(),
      details: reports
    };

    console.log(`✅ Validation complete:`);
    console.log(`   Valid entries: ${validCount}/${entries.length}`);
    console.log(`   Duplicates detected: ${duplicateCount}`);
    console.log(`   Entries with issues: ${issueCount}`);
    console.log(`   Critical issues: ${criticalIssues.length}`);

    return batchReport;
  }

  /**
   * Generate detailed validation report (markdown format)
   */
  generateReport(batchReport: BatchValidationReport): string {
    let md = `# Vocabulary Validation Report\n\n`;
    md += `**Generated**: ${batchReport.timestamp}\n\n`;

    md += `## Summary\n`;
    md += `- **Total Entries**: ${batchReport.totalEntries}\n`;
    md += `- **Valid**: ${batchReport.validEntries} (${((batchReport.validEntries / batchReport.totalEntries) * 100).toFixed(1)}%)\n`;
    md += `- **Duplicates**: ${batchReport.duplicates}\n`;
    md += `- **With Issues**: ${batchReport.entriesWithIssues}\n`;
    md += `- **Critical Issues**: ${batchReport.criticalIssues.length}\n\n`;

    if (batchReport.criticalIssues.length > 0) {
      md += `## Critical Issues\n`;
      for (const issue of batchReport.criticalIssues.slice(0, 20)) {
        md += `- **${issue.code}** (${issue.field || 'general'}): ${issue.message}\n`;
      }
      if (batchReport.criticalIssues.length > 20) {
        md += `- ... and ${batchReport.criticalIssues.length - 20} more\n`;
      }
      md += `\n`;
    }

    md += `## Detailed Breakdown\n\n`;

    const validEntries = Object.values(batchReport.details).filter((r) => r.isValid && !r.isDuplicate);
    const duplicateEntries = Object.values(batchReport.details).filter((r) => r.isDuplicate);
    const problematicEntries = Object.values(batchReport.details).filter(
      (r) => !r.isValid || (r.issues.length > 0 && r.issues.some((i) => i.severity === 'error'))
    );

    if (validEntries.length > 0) {
      md += `### ✅ Ready for Merge (${validEntries.length})\n`;
      validEntries.slice(0, 10).forEach((r) => {
        md += `- \`${r.direction}: ${r.term}\` → \`${r.term === r.term ? '[enriched]' : 'mapped'}\`\n`;
      });
      if (validEntries.length > 10) md += `- ... and ${validEntries.length - 10} more\n`;
      md += `\n`;
    }

    if (duplicateEntries.length > 0) {
      md += `### ⚠️  Duplicates Detected (${duplicateEntries.length})\n`;
      duplicateEntries.slice(0, 10).forEach((r) => {
        md += `- \`${r.term}\` (${r.direction}) → Existing: \`${r.existingId}\` (confidence: ${(r.duplicateConfidence * 100).toFixed(1)}%)\n`;
      });
      if (duplicateEntries.length > 10) md += `- ... and ${duplicateEntries.length - 10} more\n`;
      md += `\n`;
    }

    if (problematicEntries.length > 0) {
      md += `### ❌ Requires Review (${problematicEntries.length})\n`;
      problematicEntries.slice(0, 10).forEach((r) => {
        const errorList = r.issues
          .filter((i) => i.severity === 'error')
          .map((i) => i.code)
          .join(', ');
        md += `- \`${r.term}\` (${r.direction}): ${errorList}\n`;
      });
      if (problematicEntries.length > 10) md += `- ... and ${problematicEntries.length - 10} more\n`;
      md += `\n`;
    }

    return md;
  }
}

export default VocabularyValidator;
