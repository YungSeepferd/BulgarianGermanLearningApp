#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const batchPath = path.join(__dirname, '../reports/batch-001-categorized.json');
const backupPath = path.join(__dirname, '../data/unified-vocabulary-backup-batch001.json');

console.log(`�� APPLYING BATCH-001 CATEGORIZATIONS\n`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Load data
let vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
const vocab = vocabData.items || vocabData.vocabulary || [];
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));

console.log(`✅ Loaded vocabulary: ${vocab.length} items`);
console.log(`✅ Loaded batch: ${batch.items.length} categorized items\n`);

// Create backup
fs.writeFileSync(backupPath, JSON.stringify(vocabData, null, 2));
console.log(`✅ Backup created: unified-vocabulary-backup-batch001.json`);

// Apply categorizations
let updated = 0;
const updates = [];

batch.items.forEach(batchItem => {
  if (!batchItem.approved) {
    console.log(`⚠️  Skipping unapproved item: ${batchItem.itemId}`);
    return;
  }
  
  const vocabItem = vocab.find(v => v.id === batchItem.itemId);
  if (!vocabItem) {
    console.log(`⚠️  Item not found: ${batchItem.itemId}`);
    return;
  }
  
  const oldCategories = vocabItem.categories ? [...vocabItem.categories] : [];
  const oldCEFR = vocabItem.cefrLevel || 'unset';
  
  vocabItem.categories = batchItem.decidedCategories;
  vocabItem.cefrLevel = batchItem.cefrLevel;
  vocabItem.metadata = vocabItem.metadata || {};
  vocabItem.metadata.categorizedAt = batchItem.metadata?.categorizedAt || new Date().toISOString();
  vocabItem.metadata.categorizedBy = 'ai-agent-batch-001';
  
  updates.push({
    itemId: batchItem.itemId,
    german: batchItem.german,
    oldCategories,
    newCategories: batchItem.decidedCategories,
    oldCEFR,
    newCEFR: batchItem.cefrLevel,
    rationale: batchItem.rationale
  });
  
  updated++;
});

// Validation
console.log(`\n🔍 VALIDATION\n`);

let valid = 0;
let invalid = 0;
const issues = [];

vocab.forEach((item, idx) => {
  const errors = [];
  
  // Check categories
  if (!item.categories || item.categories.length === 0) {
    errors.push(`Missing categories`);
  } else if (item.categories.length > 2) {
    errors.push(`Too many categories (${item.categories.length} > 2)`);
  }
  
  // Check CEFR
  if (!item.cefrLevel) {
    errors.push(`Missing CEFR level`);
  } else if (!['A1', 'A2', 'B1', 'B2'].includes(item.cefrLevel)) {
    errors.push(`Invalid CEFR level: ${item.cefrLevel}`);
  }
  
  // Check required fields
  if (!item.id || !item.german || !item.bulgarian) {
    errors.push(`Missing core fields`);
  }
  
  if (errors.length === 0) {
    valid++;
  } else {
    invalid++;
    issues.push({
      itemId: item.id,
      german: item.german,
      errors
    });
  }
});

console.log(`✅ Valid items: ${valid}/${vocab.length}`);
console.log(`❌ Invalid items: ${invalid}/${vocab.length}`);

if (invalid > 0) {
  console.log(`\n⚠️  Issues found (first 5):`);
  issues.slice(0, 5).forEach(issue => {
    console.log(`   ${issue.german}: ${issue.errors.join(', ')}`);
  });
}

// CEFR distribution
const cefrDist = {};
vocab.forEach(item => {
  const level = item.cefrLevel || 'unset';
  cefrDist[level] = (cefrDist[level] || 0) + 1;
});

console.log(`\n📊 CEFR Distribution (all ${vocab.length} items):`);
Object.entries(cefrDist).sort().forEach(([level, count]) => {
  const pct = (count / vocab.length * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(pct / 2));
  console.log(`   ${level}: ${count.toString().padStart(3)} (${pct.padStart(5)}%) ${bar}`);
});

// Save updated vocabulary
vocabData.items = vocab;
vocabData.metadata = vocabData.metadata || {};
vocabData.metadata.lastUpdated = new Date().toISOString();
vocabData.metadata.updatedBy = 'batch-001-categorization';
vocabData.metadata.batchApplied = 'batch-001';

fs.writeFileSync(vocabPath, JSON.stringify(vocabData, null, 2));

console.log(`\n✅ Vocabulary updated: ${updated} items categorized`);
console.log(`✅ Saved: data/unified-vocabulary.json`);

// Save update log
const logPath = path.join(__dirname, '../reports/batch-001-apply-log.json');
fs.writeFileSync(logPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  batchSize: batch.items.length,
  itemsUpdated: updated,
  validationResult: {
    totalValid: valid,
    totalInvalid: invalid,
    totalItems: vocab.length
  },
  cefrDistribution: cefrDist,
  updates: updates.slice(0, 5)
}, null, 2));

console.log(`✅ Log saved: batch-001-apply-log.json\n`);

console.log(`✅ BATCH-001 APPLICATION COMPLETE`);

