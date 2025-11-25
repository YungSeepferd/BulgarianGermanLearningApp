#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const vocabPath = path.join(__dirname, '../data/vocabulary.json');
const batchPath = path.join(__dirname, '../data/vocabulary-batch-1-numbers-verbs.json');

console.log('Reading vocabulary.json...');
let content = fs.readFileSync(vocabPath, 'utf8');

// Fix all instances of \\n to \n (double backslash-n to single backslash-n)
console.log('Fixing \\\\n to \\n...');
const originalLength = content.length;
content = content.replaceAll('\\\\n', '\\n');
console.log(`Replaced ${originalLength - content.length} characters`);

// Write the fixed content
console.log('Writing fixed vocabulary.json...');
fs.writeFileSync(vocabPath, content, 'utf8');

// Parse to verify it's valid JSON now
try {
  const vocabData = JSON.parse(content);
  console.log(`✓ JSON parses successfully! Found ${vocabData.length} entries`);
  
  // Now merge the batch file
  console.log('\nReading batch file...');
  const batchContent = fs.readFileSync(batchPath, 'utf8');
  const batchData = JSON.parse(batchContent);
  console.log(`Found ${batchData.length} batch entries to merge`);
  
  // Check for duplicates by ID
  const existingIds = new Set(vocabData.map(e => e.id));
  const newEntries = batchData.filter(e => !existingIds.has(e.id));
  const duplicates = batchData.filter(e => existingIds.has(e.id));
  
  if (duplicates.length > 0) {
    console.log(`\nFound ${duplicates.length} duplicate entries (will skip):`);
    for (const e of duplicates) {
      console.log(`  - ${e.id}: ${e.word}`);
    }
  }
  
  console.log(`\nMerging ${newEntries.length} new entries...`);
  const mergedData = [...vocabData, ...newEntries];
  
  // Write the merged file
  fs.writeFileSync(vocabPath, JSON.stringify(mergedData, null, 2), 'utf8');
  console.log(`✓ Merged successfully! Total entries: ${mergedData.length}`);
  
} catch (error) {
  console.error('✗ JSON parse error after fix:', error.message);
  process.exit(1);
}

console.log('\n✓ All done!');
