#!/usr/bin/env tsx
/**
 * Vocabulary Data Quality Audit Script
 *
 * Identifies translation mismatches, duplicates, and data quality issues
 * in the unified vocabulary file.
 */

import fs from 'fs/promises';
import path from 'path';
import { UnifiedVocabularyItemSchema, type UnifiedVocabularyItem } from '../src/lib/schemas/unified-vocabulary.js';
import { z } from 'zod';

interface AuditIssue {
  type: 'mismatch' | 'duplicate' | 'needsReview' | 'missing' | 'invalid';
  id: string;
  german: string;
  bulgarian: string;
  details: string;
  severity: 'error' | 'warning' | 'info';
}

interface AuditReport {
  totalItems: number;
  issues: AuditIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    needsReview: number;
    duplicates: number;
  };
}

// Known problematic translation patterns
const SUSPICIOUS_PATTERNS = [
  // German phrase that doesn't match Bulgarian meaning
  { de: 'bitte, nehmen sie platz', bg: 'да, благодаря', issue: 'Mismatched phrases' },
  { de: 'bitte, nehmen sie platz', bg: 'а мляко', issue: 'Mismatched phrases' }
];

async function loadVocabulary(filePath: string): Promise<UnifiedVocabularyItem[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  const items = Array.isArray(data) ? data : data.items;

  if (!Array.isArray(items)) {
    throw new Error('Invalid vocabulary format: expected array');
  }

  // Validate each item
  return items.map((item, index) => {
    try {
      return UnifiedVocabularyItemSchema.parse(item);
    } catch (e) {
      console.error(`Validation error at index ${index}:`, e);
      return null;
    }
  }).filter((item): item is UnifiedVocabularyItem => item !== null);
}

function auditTranslations(items: UnifiedVocabularyItem[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const item of items) {
    const deLower = item.german.toLowerCase().trim();
    const bgLower = item.bulgarian.toLowerCase().trim();

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (deLower.includes(pattern.de) && bgLower.includes(pattern.bg)) {
        issues.push({
          type: 'mismatch',
          id: item.id,
          german: item.german,
          bulgarian: item.bulgarian,
          details: `Detected known mismatch: "${item.german}" → "${item.bulgarian}" (${pattern.issue})`,
          severity: 'error'
        });
      }
    }

    // Check for empty or very short translations
    if (item.bulgarian.length < 2 || item.german.length < 2) {
      issues.push({
        type: 'invalid',
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        details: 'Translation too short or empty',
        severity: 'error'
      });
    }

    // Check for identical strings (except case) - likely copy-paste error
    if (deLower === bgLower && !/^\d+$/.test(deLower)) {
      issues.push({
        type: 'mismatch',
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        details: 'German and Bulgarian are identical - possible copy-paste error',
        severity: 'warning'
      });
    }

    // Flag entries marked for review
    if ((item as any).needsReview) {
      issues.push({
        type: 'needsReview',
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        details: 'Entry flagged with needsReview=true',
        severity: 'info'
      });
    }

    // Check for missing examples
    if (!item.examples || item.examples.length === 0) {
      issues.push({
        type: 'missing',
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        details: 'No examples provided',
        severity: 'info'
      });
    }
  }

  return issues;
}

function findDuplicates(items: UnifiedVocabularyItem[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const seen = new Map<string, UnifiedVocabularyItem[]>();

  // Group by German phrase
  for (const item of items) {
    const key = item.german.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(item);
  }

  // Find duplicates with different Bulgarian translations
  for (const [german, duplicates] of seen) {
    if (duplicates.length > 1) {
      const bulgarianVariants = new Set(duplicates.map(d => d.bulgarian.toLowerCase().trim()));

      if (bulgarianVariants.size > 1) {
        issues.push({
          type: 'duplicate',
          id: duplicates.map(d => d.id).join(', '),
          german: duplicates[0].german,
          bulgarian: Array.from(bulgarianVariants).join(' | '),
          details: `${duplicates.length} entries with same German but ${bulgarianVariants.size} different Bulgarian translations`,
          severity: 'error'
        });
      } else {
        issues.push({
          type: 'duplicate',
          id: duplicates.map(d => d.id).join(', '),
          german: duplicates[0].german,
          bulgarian: duplicates[0].bulgarian,
          details: `${duplicates.length} duplicate entries with identical content`,
          severity: 'warning'
        });
      }
    }
  }

  return issues;
}

function generateReport(items: UnifiedVocabularyItem[], issues: AuditIssue[]): AuditReport {
  const summary = {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    needsReview: issues.filter(i => i.type === 'needsReview').length,
    duplicates: issues.filter(i => i.type === 'duplicate').length
  };

  return {
    totalItems: items.length,
    issues,
    summary
  };
}

function printReport(report: AuditReport): void {
  console.log('\n=== Vocabulary Data Quality Audit Report ===\n');
  console.log(`Total items audited: ${report.totalItems}`);
  console.log(`\nSummary:`);
  console.log(`  Errors:   ${report.summary.errors}`);
  console.log(`  Warnings: ${report.summary.warnings}`);
  console.log(`  Info:     ${report.summary.info}`);
  console.log(`  Needs Review: ${report.summary.needsReview}`);
  console.log(`  Duplicates: ${report.summary.duplicates}`);

  if (report.issues.length > 0) {
    console.log(`\n--- Issues by Severity ---\n`);

    // Group by severity
    const bySeverity = {
      error: report.issues.filter(i => i.severity === 'error'),
      warning: report.issues.filter(i => i.severity === 'warning'),
      info: report.issues.filter(i => i.severity === 'info')
    };

    for (const [severity, issues] of Object.entries(bySeverity)) {
      if (issues.length > 0) {
        console.log(`\n${severity.toUpperCase()} (${issues.length}):`);
        for (const issue of issues.slice(0, 20)) { // Show first 20
          console.log(`  [${issue.type}] ${issue.id}`);
          console.log(`    DE: "${issue.german}"`);
          console.log(`    BG: "${issue.bulgarian}"`);
          console.log(`    ${issue.details}`);
          console.log('');
        }
        if (issues.length > 20) {
          console.log(`    ... and ${issues.length - 20} more ${severity}s`);
        }
      }
    }
  } else {
    console.log('\n✅ No issues found!');
  }

  console.log('\n=== End of Report ===\n');
}

async function main(): Promise<void> {
  const vocabPath = process.argv[2] || 'data/unified-vocabulary.json';

  console.log(`Auditing vocabulary file: ${vocabPath}`);

  try {
    const items = await loadVocabulary(vocabPath);
    console.log(`Loaded ${items.length} items`);

    // Run audits
    const translationIssues = auditTranslations(items);
    const duplicateIssues = findDuplicates(items);

    // Combine and generate report
    const allIssues = [...translationIssues, ...duplicateIssues];
    const report = generateReport(items, allIssues);

    // Print report
    printReport(report);

    // Exit with error code if critical issues found
    if (report.summary.errors > 0) {
      console.error(`❌ Found ${report.summary.errors} critical issues`);
      process.exit(1);
    }

    console.log('✅ Audit passed with no critical issues');
    process.exit(0);

  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

main();
