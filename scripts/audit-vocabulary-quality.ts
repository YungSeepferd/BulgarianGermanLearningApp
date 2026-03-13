#!/usr/bin/env tsx
/**
 * Vocabulary Quality Audit
 *
 * Checks for:
 * 1. Russian vs Bulgarian language detection
 * 2. Missing metadata that impacts learning hub experience
 * 3. Data quality issues
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: number;
  cefrLevel?: string;
  categories: string[];
  transliteration?: {
    german?: string;
    bulgarian?: string;
  };
  grammar?: {
    gender?: string;
    pluralForm?: string;
    verbAspect?: string | null;
    verbPartnerId?: string;
    conjugation?: Record<string, unknown>;
    declension?: Record<string, { singular?: string; plural?: string }>;
  };
  examples?: Array<{
    german: string;
    bulgarian: string;
    context?: string;
  }>;
  notes?: {
    general?: string;
    forBulgarianSpeakers?: string;
    forGermanSpeakers?: string;
    linguistic?: string;
  };
  etymology?: string;
  culturalNotes?: string;
  mnemonic?: {
    text: string;
    author?: string;
  };
  mnemonics?: string[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
  metadata?: {
    frequency?: number;
    isCommon?: boolean;
    isVerified?: boolean;
    components?: Array<{ part: string; meaning: string }>;
    mnemonic?: string;
    etymology?: string;
    culturalNote?: string;
    declension?: Record<string, { singular?: string; plural?: string }>;
  };
  literalBreakdown?: Array<{
    segment: string;
    literal: string;
    grammarTag: string;
  }>;
  enrichment?: {
    enriched?: boolean;
    confidence?: number;
    sourceURL?: string;
  };
  definitions?: Array<{
    source: string;
    url: string;
  }>;
  emoji?: string;
  audioUrl?: string;
}

// Russian-specific characters not used in Bulgarian
const RUSSIAN_ONLY_CHARS = /[ыэъё]/i;

// Bulgarian-specific characters not used in Russian
const BULGARIAN_ONLY_CHARS = /[щюя]/i;

// Common confusion pairs
const SUSPICIOUS_PATTERNS = [
  { pattern: /ы/, reason: 'Russian letter "ы" (yeru) not used in Bulgarian' },
  { pattern: /э/, reason: 'Russian letter "э" (e) not used in Bulgarian' },
  { pattern: /ъ/, reason: 'Russian hard sign "ъ" - Bulgarian uses it differently' },
  { pattern: /ё/, reason: 'Russian letter "ё" (yo) not used in Bulgarian' },
  { pattern: /жд/, reason: 'Pattern "жд" is rare in Bulgarian, common in Russian' }
];

interface AuditResult {
  totalItems: number;
  potentialRussian: Array<{
    id: string;
    bulgarian: string;
    german: string;
    reason: string;
  }>;
  missingGrammar: number;
  missingExamples: number;
  missingEtymology: number;
  missingMnemonic: number;
  missingNotes: number;
  missingCulturalNotes: number;
  missingAudio: number;
  missingEmoji: number;
  missingTransliteration: number;
  byCategory: Record<string, number>;
  byPartOfSpeech: Record<string, number>;
  byCefrLevel: Record<string, number>;
  enrichedItems: number;
  itemsWithDefinitions: number;
  richMetadataItems: number;
  minimalItems: number;
}

async function loadAllVocabulary(): Promise<VocabularyItem[]> {
  const vocabDir = 'data/vocabulary';
  const items: VocabularyItem[] = [];

  const files = await glob('*.json', { cwd: vocabDir });

  for (const file of files) {
    if (file === 'index.json' || file === 'search-index.json') continue;

    const content = await fs.readFile(path.join(vocabDir, file), 'utf-8');
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      items.push(...data);
    }
  }

  return items;
}

function detectPotentialRussian(item: VocabularyItem): string | null {
  const bulgarian = item.bulgarian.toLowerCase();

  for (const { pattern, reason } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(bulgarian)) {
      return reason;
    }
  }

  return null;
}

function hasRichMetadata(item: VocabularyItem): boolean {
  let score = 0;

  // Grammar details
  if (item.grammar?.gender) score++;
  if (item.grammar?.pluralForm) score++;
  if (item.grammar?.conjugation) score += 2;
  if (item.grammar?.declension) score += 2;

  // Examples (quality check)
  if (item.examples && item.examples.length >= 2) score += 2;
  else if (item.examples && item.examples.length === 1) score++;

  // Educational content
  if (item.etymology || item.metadata?.etymology) score++;
  if (item.mnemonic || item.mnemonics?.length || item.metadata?.mnemonic) score++;
  if (item.culturalNotes || item.metadata?.culturalNote) score++;
  if (item.notes?.general || item.notes?.linguistic) score++;

  // Word relationships
  if (item.synonyms?.length) score++;
  if (item.antonyms?.length) score++;
  if (item.relatedWords?.length) score++;

  // Visual/audio aids
  if (item.emoji) score++;
  if (item.audioUrl) score++;
  if (item.transliteration?.bulgarian) score++;

  // External resources
  if (item.definitions?.length) score++;
  if (item.enrichment?.enriched) score += 2;

  // Literal breakdown for compounds
  if (item.literalBreakdown?.length) score += 2;

  return score >= 5; // Threshold for "rich" metadata
}

function analyzeMetadata(item: VocabularyItem): {
  hasGrammar: boolean;
  hasExamples: boolean;
  hasEtymology: boolean;
  hasMnemonic: boolean;
  hasNotes: boolean;
  hasCulturalNotes: boolean;
  hasAudio: boolean;
  hasEmoji: boolean;
  hasTransliteration: boolean;
  exampleCount: number;
} {
  return {
    hasGrammar: !!(
      item.grammar?.gender ||
      item.grammar?.pluralForm ||
      item.grammar?.conjugation ||
      item.grammar?.declension ||
      item.metadata?.declension
    ),
    hasExamples: !!(item.examples && item.examples.length > 0),
    hasEtymology: !!(item.etymology || item.metadata?.etymology),
    hasMnemonic: !!(item.mnemonic || item.mnemonics?.length || item.metadata?.mnemonic),
    hasNotes: !!(item.notes?.general || item.notes?.linguistic || item.notes?.forBulgarianSpeakers || item.notes?.forGermanSpeakers),
    hasCulturalNotes: !!(item.culturalNotes || item.metadata?.culturalNote),
    hasAudio: !!(item.audioUrl || item.transliteration?.bulgarian),
    hasEmoji: !!item.emoji,
    hasTransliteration: !!(item.transliteration?.bulgarian || item.transliteration?.german),
    exampleCount: item.examples?.length || 0
  };
}

async function runAudit(): Promise<AuditResult> {
  console.log('🔍 Loading vocabulary data...\n');
  const items = await loadAllVocabulary();

  const result: AuditResult = {
    totalItems: items.length,
    potentialRussian: [],
    missingGrammar: 0,
    missingExamples: 0,
    missingEtymology: 0,
    missingMnemonic: 0,
    missingNotes: 0,
    missingCulturalNotes: 0,
    missingAudio: 0,
    missingEmoji: 0,
    missingTransliteration: 0,
    byCategory: {},
    byPartOfSpeech: {},
    byCefrLevel: {},
    enrichedItems: 0,
    itemsWithDefinitions: 0,
    richMetadataItems: 0,
    minimalItems: 0
  };

  for (const item of items) {
    // Check for potential Russian
    const russianReason = detectPotentialRussian(item);
    if (russianReason) {
      result.potentialRussian.push({
        id: item.id,
        bulgarian: item.bulgarian,
        german: item.german,
        reason: russianReason
      });
    }

    // Analyze metadata
    const meta = analyzeMetadata(item);
    if (!meta.hasGrammar) result.missingGrammar++;
    if (!meta.hasExamples) result.missingExamples++;
    if (!meta.hasEtymology) result.missingEtymology++;
    if (!meta.hasMnemonic) result.missingMnemonic++;
    if (!meta.hasNotes) result.missingNotes++;
    if (!meta.hasCulturalNotes) result.missingCulturalNotes++;
    if (!meta.hasAudio) result.missingAudio++;
    if (!meta.hasEmoji) result.missingEmoji++;
    if (!meta.hasTransliteration) result.missingTransliteration++;

    // Count by category
    for (const cat of item.categories) {
      result.byCategory[cat] = (result.byCategory[cat] || 0) + 1;
    }

    // Count by part of speech
    result.byPartOfSpeech[item.partOfSpeech] = (result.byPartOfSpeech[item.partOfSpeech] || 0) + 1;

    // Count by CEFR level
    const level = item.cefrLevel || 'unknown';
    result.byCefrLevel[level] = (result.byCefrLevel[level] || 0) + 1;

    // Count enriched items
    if (item.enrichment?.enriched) {
      result.enrichedItems++;
    }

    // Count items with external definitions
    if (item.definitions?.length) {
      result.itemsWithDefinitions++;
    }

    // Count rich vs minimal metadata
    if (hasRichMetadata(item)) {
      result.richMetadataItems++;
    } else {
      result.minimalItems++;
    }
  }

  return result;
}

function printReport(result: AuditResult) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           VOCABULARY QUALITY AUDIT REPORT                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total Items: ${result.totalItems}\n`);

  // Language detection
  console.log('🌐 LANGUAGE DETECTION');
  console.log('───────────────────────────────────────');
  if (result.potentialRussian.length === 0) {
    console.log('✅ No potential Russian words detected\n');
  } else {
    console.log(`⚠️  Found ${result.potentialRussian.length} items with potential Russian characters:\n`);
    for (const item of result.potentialRussian.slice(0, 20)) {
      console.log(`   • ${item.bulgarian} (${item.german})`);
      console.log(`     ID: ${item.id}`);
      console.log(`     Issue: ${item.reason}\n`);
    }
    if (result.potentialRussian.length > 20) {
      console.log(`   ... and ${result.potentialRussian.length - 20} more\n`);
    }
  }

  // Metadata completeness
  console.log('\n📚 METADATA COMPLETENESS');
  console.log('───────────────────────────────────────');
  console.log(`Grammar details:     ${result.totalItems - result.missingGrammar}/${result.totalItems} (${((1 - result.missingGrammar/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Examples:            ${result.totalItems - result.missingExamples}/${result.totalItems} (${((1 - result.missingExamples/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Etymology:           ${result.totalItems - result.missingEtymology}/${result.totalItems} (${((1 - result.missingEtymology/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Mnemonics:           ${result.totalItems - result.missingMnemonic}/${result.totalItems} (${((1 - result.missingMnemonic/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Notes:               ${result.totalItems - result.missingNotes}/${result.totalItems} (${((1 - result.missingNotes/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Cultural notes:      ${result.totalItems - result.missingCulturalNotes}/${result.totalItems} (${((1 - result.missingCulturalNotes/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Audio/Transliteration: ${result.totalItems - result.missingAudio}/${result.totalItems} (${((1 - result.missingAudio/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Emoji:               ${result.totalItems - result.missingEmoji}/${result.totalItems} (${((1 - result.missingEmoji/result.totalItems) * 100).toFixed(1)}%)`);

  // Rich vs minimal
  console.log('\n📊 METADATA QUALITY');
  console.log('───────────────────────────────────────');
  console.log(`Rich metadata (≥5 points):  ${result.richMetadataItems} (${((result.richMetadataItems/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Minimal metadata:           ${result.minimalItems} (${((result.minimalItems/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Enriched items:             ${result.enrichedItems} (${((result.enrichedItems/result.totalItems) * 100).toFixed(1)}%)`);
  console.log(`Items with definitions:     ${result.itemsWithDefinitions} (${((result.itemsWithDefinitions/result.totalItems) * 100).toFixed(1)}%)`);

  // Distribution
  console.log('\n📈 DISTRIBUTION BY CEFR LEVEL');
  console.log('───────────────────────────────────────');
  for (const [level, count] of Object.entries(result.byCefrLevel).sort()) {
    const bar = '█'.repeat(Math.round(count / result.totalItems * 40));
    console.log(`${level.padEnd(4)} ${bar} ${count}`);
  }

  console.log('\n📈 DISTRIBUTION BY PART OF SPEECH');
  console.log('───────────────────────────────────────');
  for (const [pos, count] of Object.entries(result.byPartOfSpeech).sort((a, b) => b[1] - a[1])) {
    const bar = '█'.repeat(Math.round(count / result.totalItems * 40));
    console.log(`${pos.padEnd(15)} ${bar} ${count}`);
  }

  console.log('\n📈 TOP CATEGORIES');
  console.log('───────────────────────────────────────');
  const sortedCats = Object.entries(result.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [cat, count] of sortedCats) {
    const bar = '█'.repeat(Math.round(count / result.totalItems * 40));
    console.log(`${cat.padEnd(20)} ${bar} ${count}`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS FOR LEARNING HUB');
  console.log('───────────────────────────────────────');

  const recommendations = [];

  if (result.missingGrammar > result.totalItems * 0.5) {
    recommendations.push(`• Add grammar details (gender, plural forms, conjugations) to ${result.missingGrammar} items for grammar grid display`);
  }

  if (result.missingExamples > result.totalItems * 0.3) {
    recommendations.push(`• Expand contextual examples for ${result.missingExamples} items - needed for memorable usage contexts`);
  }

  if (result.missingEtymology > result.totalItems * 0.7) {
    recommendations.push(`• Add etymology to ${result.missingEtymology} items - enhances understanding and memorability`);
  }

  if (result.missingMnemonic > result.totalItems * 0.8) {
    recommendations.push(`• Create mnemonics for ${result.missingMnemonic} items - critical for retention in learning hub`);
  }

  if (result.missingCulturalNotes > result.totalItems * 0.8) {
    recommendations.push(`• Add cultural context to ${result.missingCulturalNotes} items - important for "cultural notes" feature`);
  }

  if (result.missingEmoji > result.totalItems * 0.5) {
    recommendations.push(`• Add emoji to ${result.missingEmoji} items - visual anchors improve recall`);
  }

  if (result.missingAudio > result.totalItems * 0.7) {
    recommendations.push(`• Add pronunciation guides to ${result.missingAudio} items - essential for audio playback feature`);
  }

  if (recommendations.length === 0) {
    console.log('✅ Vocabulary data is well-enriched for the learning hub!');
  } else {
    for (const rec of recommendations) {
      console.log(rec);
    }
  }

  console.log('\n');
}

async function main() {
  try {
    const result = await runAudit();
    printReport(result);

    // Save detailed report
    const reportPath = 'docs/vocabulary-audit-report.json';
    await fs.mkdir('docs', { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(result, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
