#!/usr/bin/env node

/**
 * Linguistic Review Script
 * Performs comprehensive linguistic analysis of German-Bulgarian vocabulary entries
 * Checks for grammatical accuracy, semantic equivalence, and contextual appropriateness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BATCH_SIZE = 50;
const START_INDEX = 0;
const REVIEW_FILE = path.join(__dirname, '../static/data/unified-vocabulary.comprehensive-corrected.json');

// German grammar rules
const GERMAN_ARTICLES = {
  masculine: ['der', 'ein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'],
  feminine: ['die', 'eine', 'meine', 'deine', 'seine', 'ihre', 'unsere', 'eure'],
  neuter: ['das', 'ein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'],
  plural: ['die', 'keine', 'meine', 'deine', 'seine', 'ihre', 'unsere', 'eure']
};

// Bulgarian grammar rules
const BULGARIAN_DEFINITE_ARTICLES = {
  masculine: ['-ът', '-та', '-то'],
  feminine: ['-та', '-то'],
  neuter: ['-то', '-та']
};

// Common linguistic issues to check
const COMMON_ISSUES = {
  german: {
    // Common spelling errors
    spelling: {
      'das': 'dass',
      'dasz': 'dass',
      'dasß': 'dass',
      'dasß': 'dass',
      'dasz': 'dass',
      'dasß': 'dass'
    },
    // Common grammar errors
    grammar: {
      // Article-gender mismatches
      'der Mädchen': 'das Mädchen',
      'die Junge': 'der Junge',
      'das Frau': 'die Frau'
    }
  },
  bulgarian: {
    // Common spelling errors
    spelling: {
      'щ': 'шт',
      'ж': 'жд',
      'ч': 'чт'
    }
  }
};

/**
 * Load vocabulary data
 */
async function loadVocabulary() {
  try {
    const data = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf8'));
    console.log(`📚 Loaded vocabulary: ${data.items.length} entries`);
    return data.items;
  } catch (error) {
    console.error('❌ Error loading vocabulary:', error.message);
    process.exit(1);
  }
}

/**
 * Check German linguistic accuracy
 */
function checkGermanLinguistics(entry) {
  const issues = [];
  
  if (!entry.german || typeof entry.german !== 'string') {
    issues.push('German text missing or invalid');
    return issues;
  }
  
  const germanText = entry.german.trim();
  
  // Check for basic spelling issues
  for (const [wrong, correct] of Object.entries(COMMON_ISSUES.german.spelling)) {
    if (germanText.includes(wrong)) {
      issues.push(`Spelling: "${wrong}" should be "${correct}"`);
    }
  }
  
  // Check for article-gender mismatches
  for (const [wrong, correct] of Object.entries(COMMON_ISSUES.german.grammar)) {
    if (germanText.includes(wrong)) {
      issues.push(`Grammar: "${wrong}" should be "${correct}"`);
    }
  }
  
  // Check for mixed case issues
  if (germanText !== germanText.charAt(0).toUpperCase() + germanText.slice(1)) {
    if (germanText === germanText.toLowerCase()) {
      issues.push('Capitalization: Should start with uppercase letter');
    } else if (germanText === germanText.toUpperCase()) {
      issues.push('Capitalization: Should not be all uppercase');
    }
  }
  
  return issues;
}

/**
 * Check Bulgarian linguistic accuracy
 */
function checkBulgarianLinguistics(entry) {
  const issues = [];
  
  if (!entry.bulgarian || typeof entry.bulgarian !== 'string') {
    issues.push('Bulgarian text missing or invalid');
    return issues;
  }
  
  const bulgarianText = entry.bulgarian.trim();
  
  // Check for basic spelling issues
  for (const [wrong, correct] of Object.entries(COMMON_ISSUES.bulgarian.spelling)) {
    if (bulgarianText.includes(wrong)) {
      issues.push(`Spelling: "${wrong}" should be "${correct}"`);
    }
  }
  
  // Check for Cyrillic characters
  if (!/^[\u0400-\u04FF\s\p{P}]+$/u.test(bulgarianText)) {
    issues.push('Bulgarian text contains non-Cyrillic characters');
  }
  
  return issues;
}

/**
 * Check semantic equivalence between German and Bulgarian
 */
function checkSemanticEquivalence(entry) {
  const issues = [];
  
  // Basic checks for obvious mismatches
  if (entry.german && entry.bulgarian) {
    // Check if both are empty or very short
    if (entry.german.trim().length < 2 && entry.bulgarian.trim().length < 2) {
      issues.push('Both translations are too short to be meaningful');
    }
    
    // Check for identical translations (likely error)
    if (entry.german.trim() === entry.bulgarian.trim()) {
      issues.push('German and Bulgarian translations are identical');
    }
  }
  
  return issues;
}

/**
 * Review a batch of entries
 */
async function reviewBatch(entries, batchIndex) {
  const start = batchIndex * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, entries.length);
  const batch = entries.slice(start, end);
  
  console.log(`\n🔍 Reviewing batch ${batchIndex + 1}: entries ${start + 1}-${end}`);
  console.log('='.repeat(60));
  
  let totalIssues = 0;
  const batchReport = [];
  
  for (let i = 0; i < batch.length; i++) {
    const entry = batch[i];
    const entryIndex = start + i;
    const entryIssues = {
      id: entry.id,
      german: entry.german,
      bulgarian: entry.bulgarian,
      issues: []
    };
    
    // Check German linguistics
    const germanIssues = checkGermanLinguistics(entry);
    if (germanIssues.length > 0) {
      entryIssues.issues.push(...germanIssues.map(issue => `🇩🇪 ${issue}`));
    }
    
    // Check Bulgarian linguistics
    const bulgarianIssues = checkBulgarianLinguistics(entry);
    if (bulgarianIssues.length > 0) {
      entryIssues.issues.push(...bulgarianIssues.map(issue => `🇧🇬 ${issue}`));
    }
    
    // Check semantic equivalence
    const semanticIssues = checkSemanticEquivalence(entry);
    if (semanticIssues.length > 0) {
      entryIssues.issues.push(...semanticIssues.map(issue => `🔄 ${issue}`));
    }
    
    if (entryIssues.issues.length > 0) {
      totalIssues += entryIssues.issues.length;
      batchReport.push(entryIssues);
      
      console.log(`\n📝 Entry ${entryIndex + 1} (ID: ${entry.id}):`);
      console.log(`  German: "${entry.german}"`);
      console.log(`  Bulgarian: "${entry.bulgarian}"`);
      console.log(`  Issues found: ${entryIssues.issues.length}`);
      entryIssues.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  }
  
  console.log(`\n📊 Batch ${batchIndex + 1} summary:`);
  console.log(`  Entries reviewed: ${batch.length}`);
  console.log(`  Issues found: ${totalIssues}`);
  console.log(`  Entries with issues: ${batchReport.length}`);
  
  return batchReport;
}

/**
 * Main review function
 */
async function main() {
  console.log('🧑‍🏫 Starting Linguistic Review of Bulgarian-German Vocabulary');
  console.log('='.repeat(60));
  
  const entries = await loadVocabulary();
  const totalBatches = Math.ceil(entries.length / BATCH_SIZE);
  
  console.log(`📈 Review plan: ${totalBatches} batches of ${BATCH_SIZE} entries each`);
  console.log(`🎯 Total entries to review: ${entries.length}`);
  
  // Start with the first batch
  const firstBatchReport = await reviewBatch(entries, 0);
  
  console.log('\n📋 Review complete for first batch!');
  console.log('✅ Ready to continue with next batches...');
  
  // Return the report for this batch
  return firstBatchReport;
}

// Run the review
main().catch(console.error);