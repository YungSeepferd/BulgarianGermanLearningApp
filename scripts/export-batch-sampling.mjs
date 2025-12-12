#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load validation summary
const summaryPath = path.join(__dirname, '../reports/validation-summary.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

// Create batch sampling
const batchSize = 100;
const batch = summary.flaggedItems.slice(0, batchSize).map((item, idx) => ({
  batchIndex: idx + 1,
  itemId: item.id,
  german: item.german,
  bulgarian: item.bulgarian,
  currentCategories: item.assignedCategories || [],
  issue: item.issue,
  invalidCategories: item.invalidCategories || [],
  suggestedCategories: [],  // To be filled manually
  decidedCategories: [],    // Final decision
  rationale: '',            // Decision rationale
  approved: false           // QA approval
}));

// Save batch export
const batchPath = path.join(__dirname, '../reports/batch-001-sampling-export.json');
const batchDoc = {
  batchId: 'batch-001',
  createdAt: new Date().toISOString(),
  totalInBatch: batch.length,
  totalFlagged: summary.flaggedItems.length,
  instructions: `
Manual review batch for categorization decisions.

For each item:
1. Review the term and its context
2. Suggest appropriate categories (max 2) in "suggestedCategories"
3. Enter final decision in "decidedCategories"
4. Add rationale for the decision
5. Mark "approved" when reviewed

Categories: ${Object.keys(summary.categoryDistribution).join(', ')}
  `.trim(),
  items: batch
};

fs.writeFileSync(batchPath, JSON.stringify(batchDoc, null, 2));
console.log(`\n✅ Batch export created: ${batchPath}`);
console.log(`📦 Batch size: ${batch.length} items`);
console.log(`📊 Remaining flagged items: ${summary.flaggedItems.length - batchSize}`);
console.log(`\nSample items:`);
batch.slice(0, 5).forEach(item => {
  console.log(`  - [${item.batchIndex}] ${item.german} (${item.bulgarian}): ${item.issue}`);
});
