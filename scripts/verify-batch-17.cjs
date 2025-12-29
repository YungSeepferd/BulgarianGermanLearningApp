#!/usr/bin/env node

/**
 * Batch 17 Verification
 * Verifies corrections for entries 801-850
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const batch17 = data.items.slice(800, 850); // Entries 801-850

console.log('🔍 Batch 17 Verification (Entries 801-850)');
console.log('='.repeat(50));

let allClean = true;
const verificationResults = [];

batch17.forEach((entry, index) => {
  const entryNum = 801 + index;
  
  // Check for any remaining issues
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
    // Allow single-character Bulgarian prepositions like "В" (in)
    const validSingleChar = ['В', 'в', 'С', 'с', 'К', 'к', 'О', 'о'];
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
    allClean = false;
    verificationResults.push({
      entryNum,
      id: entry.id,
      german: entry.german,
      bulgarian: entry.bulgarian,
      issues,
      status: '❌ FAILED'
    });
    
    console.log(`\n❌ Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  German: "${entry.german}"`);
    console.log(`  Bulgarian: "${entry.bulgarian}"`);
    console.log(`  Issues: ${issues.join(', ')}`);
  } else {
    verificationResults.push({
      entryNum,
      id: entry.id,
      german: entry.german,
      bulgarian: entry.bulgarian,
      issues: [],
      status: '✅ PASSED'
    });
  }
});

console.log(`\n📊 Batch 17 Verification Summary:`);
console.log(`  Entries verified: ${batch17.length}`);
console.log(`  Clean entries: ${verificationResults.filter(r => r.status === '✅ PASSED').length}`);
console.log(`  Issues found: ${verificationResults.filter(r => r.status === '❌ FAILED').length}`);

if (allClean) {
  console.log('\n✅ Batch 17 verification PASSED!');
  console.log('🎉 All entries are clean and ready for certification.');
} else {
  console.log('\n❌ Batch 17 verification FAILED!');
  console.log('⚠️  Issues remain that need to be addressed.');
}

// Show specific results for corrected entries
console.log('\n📝 Corrected Entries Status:');
const correctedEntries = verificationResults.filter(r => [809].includes(r.entryNum));
correctedEntries.forEach(entry => {
  console.log(`  Entry ${entry.entryNum}: ${entry.status}`);
  console.log(`    "${entry.german}" → "${entry.bulgarian}"`);
});

console.log('\n🎉 Batch 17 verification complete!');