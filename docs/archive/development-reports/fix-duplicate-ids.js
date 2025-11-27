#!/usr/bin/env node
/**
 * Fix Duplicate Vocabulary IDs
 *
 * Reads vocabulary.json, finds duplicate IDs, and renames them with suffixes
 * to ensure all vocabulary entries have unique IDs.
 */

const fs = require('fs');
const path = require('path');

const VOCAB_FILE = path.join(__dirname, 'data', 'vocabulary.json');

console.log('[Fix Duplicates] Loading vocabulary data...');

// Read vocabulary data
const vocabularyData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));

console.log(`[Fix Duplicates] Loaded ${vocabularyData.length} vocabulary entries`);

// Find duplicates
const idCounts = {};
const duplicateIds = new Set();

vocabularyData.forEach((entry, index) => {
  const id = entry.id;
  if (!idCounts[id]) {
    idCounts[id] = [];
  }
  idCounts[id].push(index);

  if (idCounts[id].length > 1) {
    duplicateIds.add(id);
  }
});

console.log(`[Fix Duplicates] Found ${duplicateIds.size} duplicate IDs`);

// Fix duplicates
let fixCount = 0;
const changes = [];

duplicateIds.forEach(duplicateId => {
  const indices = idCounts[duplicateId];
  console.log(`[Fix Duplicates] Processing '${duplicateId}' (${indices.length} occurrences)`);

  // Keep first occurrence unchanged, rename subsequent ones
  for (let i = 1; i < indices.length; i++) {
    const index = indices[i];
    const entry = vocabularyData[index];
    const oldId = entry.id;
    const newId = `${oldId}_dup${i}`;

    entry.id = newId;
    fixCount++;

    changes.push({
      index,
      oldId,
      newId,
      bulgarian: entry.bulgarian,
      german: entry.german
    });

    console.log(`  [${index}] ${oldId} → ${newId} (${entry.bulgarian} / ${entry.german})`);
  }
});

console.log(`\n[Fix Duplicates] Fixed ${fixCount} duplicate entries`);

// Verify all IDs are now unique
const finalIds = vocabularyData.map(e => e.id);
const finalIdSet = new Set(finalIds);

if (finalIds.length !== finalIdSet.size) {
  console.error('[Fix Duplicates] ERROR: Still have duplicates after fix!');
  process.exit(1);
}

console.log('[Fix Duplicates] ✅ All IDs are now unique');

// Write back to file
const outputData = JSON.stringify(vocabularyData, null, 2);
fs.writeFileSync(VOCAB_FILE, outputData, 'utf8');

console.log(`[Fix Duplicates] ✅ Written ${vocabularyData.length} entries to ${VOCAB_FILE}`);

// Write change log
const logFile = path.join(__dirname, 'docs', 'vocabulary-id-fixes.log');
const logContent = `# Vocabulary ID Fixes - ${new Date().toISOString()}

Fixed ${fixCount} duplicate vocabulary IDs.

## Changes Made:

${changes.map(c => `[${c.index}] ${c.oldId} → ${c.newId}
   BG: ${c.bulgarian}
   DE: ${c.german}
`).join('\n')}

## Summary:
- Total duplicate IDs found: ${duplicateIds.size}
- Total entries renamed: ${fixCount}
- Verification: All ${vocabularyData.length} entries now have unique IDs
`;

fs.writeFileSync(logFile, logContent, 'utf8');
console.log(`[Fix Duplicates] ✅ Change log written to ${logFile}`);

console.log('\n[Fix Duplicates] ✅ All done! Vocabulary data fixed successfully.');
