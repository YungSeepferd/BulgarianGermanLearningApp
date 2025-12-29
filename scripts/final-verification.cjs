#!/usr/bin/env node

/**
 * Final Verification
 * Comprehensive verification of all certified batches (1-750)
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

console.log('🔍 Final Verification (Entries 1-750)');
console.log('='.repeat(50));

let totalIssues = 0;
let totalEntries = 0;
const batchResults = [];

// Verify all certified batches (1-26 = 1300 entries)
for (let batchNum = 1; batchNum <= 26; batchNum++) {
  const startIndex = (batchNum - 1) * 50;
  const endIndex = batchNum * 50;
  const batchEntries = data.items.slice(startIndex, endIndex);
  
  let batchIssues = 0;
  
  batchEntries.forEach((entry, index) => {
    const entryNum = startIndex + 1 + index;
    totalEntries++;
    
    // Check for any issues
    const issues = [];
    
    // 1. Check for mixed language content (Latin characters in Bulgarian)
    if (entry.bulgarian && /[a-zA-Z]/.test(entry.bulgarian)) {
      issues.push('Contains Latin characters');
    }
    
    // 2. Check for empty translations (but allow single-character valid words like "В")
    if (entry.german && entry.german.trim().length < 2) {
      issues.push('German translation too short');
    }
    if (entry.bulgarian && entry.bulgarian.trim().length < 2) {
      // Allow single-character Bulgarian prepositions and conjunctions like "В" (in), "И" (and)
      const validSingleChar = ['В', 'в', 'С', 'с', 'К', 'к', 'О', 'о', 'И', 'и'];
      if (!validSingleChar.includes(entry.bulgarian.trim())) {
        issues.push('Bulgarian translation too short');
      }
    }
    
    // 3. Check for identical translations (likely error)
    if (entry.german && entry.bulgarian && entry.german.trim() === entry.bulgarian.trim()) {
      issues.push('Identical to German (likely error)');
    }
    
    // 4. Check for formatting issues
    if (entry.bulgarian && (entry.bulgarian.startsWith('(') || entry.bulgarian.endsWith(')'))) {
      issues.push('Possible formatting issue with parentheses');
    }
    
    // 5. Check for multiple spaces
    if (entry.bulgarian && entry.bulgarian.includes('  ')) {
      issues.push('Multiple spaces detected');
    }
    
    // 6. Check for single quotes
    if (entry.bulgarian && entry.bulgarian.includes("'") && !entry.bulgarian.includes("''")) {
      issues.push('Single quote detected');
    }
    
    // 7. Check for numbers in Bulgarian text
    if (entry.bulgarian && /\d/.test(entry.bulgarian)) {
      issues.push('Contains numeric digits');
    }
    
    if (issues.length > 0) {
      batchIssues++;
      totalIssues++;
      
      console.log(`\n❌ Entry ${entryNum} (Batch ${batchNum}, ID: ${entry.id}):`);
      console.log(`  German: "${entry.german}"`);
      console.log(`  Bulgarian: "${entry.bulgarian}"`);
      console.log(`  Issues: ${issues.join(', ')}`);
    }
  });
  
  batchResults.push({
    batchNum,
    entries: batchEntries.length,
    issues: batchIssues,
    clean: batchIssues === 0
  });
}

console.log(`\n📊 Final Verification Summary:`);
console.log(`  Total entries verified: ${totalEntries}`);
console.log(`  Total issues found: ${totalIssues}`);
console.log(`  Clean batches: ${batchResults.filter(r => r.clean).length}/15`);

console.log('\n📝 Batch-by-Batch Results:');
batchResults.forEach(batch => {
  const status = batch.clean ? '✅ CLEAN' : '❌ HAS ISSUES';
  console.log(`  Batch ${batch.batchNum} (Entries ${(batch.batchNum-1)*50+1}-${batch.batchNum*50}): ${status}`);
  console.log(`    Entries: ${batch.entries}, Issues: ${batch.issues}`);
});

if (totalIssues === 0) {
  console.log('\n✅ Final verification PASSED!');
  console.log('🎉 All 1300 entries (26 batches) are clean and certified!');
  console.log('📊 Progress: 1300/2146 entries (60.6%) certified');
} else {
  console.log('\n❌ Final verification FAILED!');
  console.log(`⚠️  ${totalIssues} issues found that need to be addressed.`);
}

console.log('\n🎉 Final verification complete!');