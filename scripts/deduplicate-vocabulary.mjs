#!/usr/bin/env node

/**
 * Vocabulary Deduplication Script
 *
 * Identifies and intelligently merges duplicate word-translation pairs
 * while preserving rich metadata, examples, and linguistic notes.
 *
 * Usage:
 *   node scripts/deduplicate-vocabulary.mjs [--dry-run] [--report]
 *
 * Options:
 *   --dry-run    Show what would be changed without modifying files
 *   --report     Generate detailed deduplication report
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOCAB_FILE = path.join(__dirname, '../data/vocabulary.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');
const REPORT_FILE = path.join(__dirname, '../docs/vocabulary/DEDUPLICATION_REPORT.md');

// Parse command line arguments
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const GENERATE_REPORT = args.has('--report');

/**
 * Main deduplication engine
 */
class VocabularyDeduplicator {
  constructor(vocabularyData) {
    this.vocabulary = vocabularyData;
    this.duplicateGroups = [];
    this.mergedEntries = [];
    this.removedIds = [];
  }

  /**
   * Find all duplicate word-translation pairs
   */
  findDuplicates() {
    const seen = new Map();

    for (const [index, entry] of this.vocabulary.entries()) {
      const key = `${entry.word}|${entry.translation}`.toLowerCase();

      if (!seen.has(key)) {
        seen.set(key, []);
      }

      seen.get(key).push({ ...entry, originalIndex: index });
    }

    // Filter to only groups with duplicates
    this.duplicateGroups = [...seen.entries()]
      .filter(([_, entries]) => entries.length > 1)
      .map(([key, entries]) => ({
        key,
        entries,
        count: entries.length
      }));

    return this.duplicateGroups;
  }

  /**
   * Intelligently merge duplicate entries
   * Strategy: Keep entry with richest metadata as base, merge all content
   */
  mergeDuplicates() {
    for (const group of this.duplicateGroups) {
      // Select best entry as base (most complete metadata)
      const baseEntry = this.selectBestEntry(group.entries);

      // Merge content from all duplicates
      const merged = this.mergeEntryContent(baseEntry, group.entries);

      // Track which IDs were removed
      const removedIds = group.entries
        .filter(e => e.id !== merged.id)
        .map(e => e.id);

      this.mergedEntries.push(merged);
      this.removedIds.push(...removedIds);
    }
  }

  /**
   * Select the "best" entry to use as merge base
   * Criteria: Most examples, most notes, highest frequency
   */
  selectBestEntry(entries) {
    let best = entries[0];
    for (const current of entries) {
      const bestScore = this.calculateCompletenessScore(best);
      const currentScore = this.calculateCompletenessScore(current);
      if (currentScore > bestScore) {
        best = current;
      }
    }
    return best;
  }

  /**
   * Calculate completeness score for an entry
   */
  calculateCompletenessScore(entry) {
    let score = 0;

    // Examples are very valuable
    score += (entry.examples?.length || 0) * 10;

    // Notes and linguistic information
    if (entry.notes && entry.notes !== null) {
      score += 5;
    }
    if (entry.notes_bg_to_de) {
      score += 5;
    }
    if (entry.notes_de_to_bg) {
      score += 5;
    }
    if (entry.linguistic_note) {
      score += 3;
    }
    if (entry.linguistic_note_bg_to_de) {
      score += 3;
    }
    if (entry.linguistic_note_de_to_bg) {
      score += 3;
    }

    // Cultural and etymological data
    if (entry.etymology) {
      score += 4;
    }
    if (entry.cultural_note) {
      score += 4;
    }

    // Frequency indicates importance
    score += (entry.frequency || 0) / 10;

    return score;
  }

  /**
   * Merge content from all duplicate entries into base entry
   */
  mergeEntryContent(baseEntry, allEntries) {
    const merged = { ...baseEntry };

    // Merge examples (deduplicate by sentence)
    const allExamples = allEntries.flatMap(e => e.examples || []);
    const uniqueExamples = this.deduplicateExamples(allExamples);
    if (uniqueExamples.length > 0) {
      merged.examples = uniqueExamples;
    }

    // Merge notes intelligently
    merged.notes = this.mergeTextField('notes', allEntries);
    merged.notes_bg_to_de = this.mergeTextField('notes_bg_to_de', allEntries);
    merged.notes_de_to_bg = this.mergeTextField('notes_de_to_bg', allEntries);
    merged.linguistic_note = this.mergeTextField('linguistic_note', allEntries);
    merged.linguistic_note_bg_to_de = this.mergeTextField('linguistic_note_bg_to_de', allEntries);
    merged.linguistic_note_de_to_bg = this.mergeTextField('linguistic_note_de_to_bg', allEntries);

    // Merge etymology and cultural notes
    merged.etymology = this.mergeTextField('etymology', allEntries);
    merged.cultural_note = this.mergeTextField('cultural_note', allEntries);

    // Use highest frequency and lowest difficulty
    merged.frequency = Math.max(...allEntries.map(e => e.frequency || 0));
    merged.difficulty = Math.min(...allEntries.map(e => e.difficulty || 5));

    return merged;
  }

  /**
   * Deduplicate examples array by sentence content
   */
  deduplicateExamples(examples) {
    const seen = new Set();
    return examples.filter(ex => {
      const key = ex.sentence.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Merge text fields by combining unique non-null values
   */
  mergeTextField(fieldName, entries) {
    const values = entries
      .map(e => e[fieldName])
      .filter(v => v !== null && v !== undefined && v.trim() !== '');

    if (values.length === 0) {
      return null;
    }
    if (values.length === 1) {
      return values[0];
    }

    // Check if all values are identical
    const uniqueValues = [...new Set(values)];
    if (uniqueValues.length === 1) {
      return uniqueValues[0];
    }

    // Combine different values with separator
    return uniqueValues.join(' | ');
  }

  /**
   * Generate final deduplicated vocabulary array
   */
  generateDeduplicatedVocabulary() {
    // Remove all duplicate entries
    const idsToRemove = new Set(this.removedIds);
    const filtered = this.vocabulary.filter(e => !idsToRemove.has(e.id));

    // Add merged entries
    return [...filtered, ...this.mergedEntries];
  }

  /**
   * Generate markdown report
   */
  generateReport() {
    const totalDuplicates = this.removedIds.length;
    const groupCount = this.duplicateGroups.length;

    let report = '# Vocabulary Deduplication Report\n\n';
    report += `**Date**: ${new Date().toISOString().split('T')[0]}\n\n`;
    report += '## Summary\n\n';
    report += `- **Duplicate Groups Found**: ${groupCount}\n`;
    report += `- **Total Duplicate Entries Removed**: ${totalDuplicates}\n`;
    report += `- **Original Entry Count**: ${this.vocabulary.length}\n`;
    report += `- **Final Entry Count**: ${this.vocabulary.length - totalDuplicates}\n\n`;

    report += '## Duplicate Groups\n\n';

    for (const [index, group] of this.duplicateGroups.entries()) {
      report += `### ${index + 1}. ${group.key}\n\n`;
      report += `**Occurrences**: ${group.count}\n\n`;

      for (const [i, entry] of group.entries.entries()) {
        report += `#### Entry ${i + 1}: \`${entry.id}\`\n`;
        report += `- **Examples**: ${entry.examples?.length || 0}\n`;
        report += `- **Frequency**: ${entry.frequency || 'N/A'}\n`;
        report += `- **Completeness Score**: ${this.calculateCompletenessScore(entry)}\n\n`;
      }

      // Find the merged entry
      const mergedEntry = this.mergedEntries.find(m =>
        `${m.word}|${m.translation}`.toLowerCase() === group.key
      );

      if (mergedEntry) {
        report += `**✅ Merged Result**: ID \`${mergedEntry.id}\`\n`;
        report += `- **Total Examples**: ${mergedEntry.examples?.length || 0}\n`;
        report += `- **Frequency**: ${mergedEntry.frequency}\n\n`;
      }

      report += '---\n\n';
    }

    report += '## Removed Entry IDs\n\n';
    report += 'The following entry IDs were removed during deduplication:\n\n';
    report += this.removedIds.map(id => `- \`${id}\``).join('\n');
    report += '\n\n---\n\n';
    report += '**Note**: All unique content from removed entries has been merged into the kept entries.\n';

    return report;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Vocabulary Deduplication Tool\n');

  // Load vocabulary
  console.log('📖 Loading vocabulary...');
  const vocabData = JSON.parse(await fs.readFile(VOCAB_FILE, 'utf8'));
  console.log(`   Loaded ${vocabData.length} entries\n`);

  // Initialize deduplicator
  const deduplicator = new VocabularyDeduplicator(vocabData);

  // Find duplicates
  console.log('🔎 Scanning for duplicates...');
  const duplicateGroups = deduplicator.findDuplicates();
  console.log(`   Found ${duplicateGroups.length} duplicate groups\n`);

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found! Vocabulary is clean.\n');
    return;
  }

  // Display duplicate summary
  console.log('📊 Duplicate Summary:');
  for (const [index, group] of duplicateGroups.entries()) {
    console.log(`   ${index + 1}. "${group.key}" - ${group.count} occurrences`);
  }
  console.log();

  // Merge duplicates
  console.log('🔗 Merging duplicate entries...');
  deduplicator.mergeDuplicates();
  console.log(`   Merged ${duplicateGroups.length} groups`);
  console.log(`   Removed ${deduplicator.removedIds.length} duplicate entries\n`);

  // Generate deduplicated vocabulary
  const deduplicatedVocab = deduplicator.generateDeduplicatedVocabulary();
  console.log(`📋 Final vocabulary: ${deduplicatedVocab.length} entries\n`);

  if (DRY_RUN) {
    console.log('🏃 DRY RUN MODE - No files will be modified\n');

    if (GENERATE_REPORT) {
      const report = deduplicator.generateReport();
      console.log('📄 Deduplication Report:\n');
      console.log(report);
    }
  } else {
    // Create backup
    console.log('💾 Creating backup...');
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replaceAll(':', '-').split('.')[0];
    const backupFile = path.join(BACKUP_DIR, `vocabulary-${timestamp}.json`);
    await fs.writeFile(backupFile, JSON.stringify(vocabData, null, 2));
    console.log(`   Backup saved: ${backupFile}\n`);

    // Write deduplicated vocabulary
    console.log('💾 Writing deduplicated vocabulary...');
    await fs.writeFile(VOCAB_FILE, JSON.stringify(deduplicatedVocab, null, 2));
    console.log(`   Saved: ${VOCAB_FILE}\n`);

    // Generate report
    if (GENERATE_REPORT) {
      console.log('📄 Generating deduplication report...');
      const report = deduplicator.generateReport();
      await fs.mkdir(path.dirname(REPORT_FILE), { recursive: true });
      await fs.writeFile(REPORT_FILE, report);
      console.log(`   Report saved: ${REPORT_FILE}\n`);
    }

    console.log('✅ Deduplication complete!\n');
  }

  // Summary
  console.log('📈 Summary:');
  console.log(`   Original entries: ${vocabData.length}`);
  console.log(`   Duplicates removed: ${deduplicator.removedIds.length}`);
  console.log(`   Final entries: ${deduplicatedVocab.length}`);
  console.log(`   Space saved: ${((deduplicator.removedIds.length / vocabData.length) * 100).toFixed(1)}%\n`);
}

// Run the script
main().catch(console.error);
