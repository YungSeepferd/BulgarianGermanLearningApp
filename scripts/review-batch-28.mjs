#!/usr/bin/env node

/**
 * Batch 28 Linguistic Review
 * Focused review of entries 1351-1400
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');

// Load the vocabulary data
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const batch28 = data.items.slice(1350, 1400); // Entries 1351-1400

console.log('🔍 Batch 28 Linguistic Review (Entries 1351-1400)');
console.log('='.repeat(50));

let issuesFound = 0;
const correctionsNeeded = [];

batch28.forEach((entry, index) => {
  const entryNum = 1351 + index;
  
  // Check for obvious issues
  const bulgarianIssues = [];
  const germanIssues = [];
  
  // 1. Check for mixed language content (Latin characters in Bulgarian)
  if (entry.bulgarian && /[a-zA-Z]/.test(entry.bulgarian)) {
    bulgarianIssues.push('Contains Latin characters');
  }
  
  // 2. Check for empty or very short translations
  if (entry.german && entry.german.trim().length < 2) {
    germanIssues.push('German translation too short');
  }
  if (entry.bulgarian && entry.bulgarian.trim().length < 2) {
    // Allow single-character Bulgarian prepositions and conjunctions like "В" (in), "И" (and)
    const validSingleChar = ['В', 'в', 'С', 'с', 'К', 'к', 'О', 'о', 'И', 'и'];
    if (!validSingleChar.includes(entry.bulgarian.trim())) {
      bulgarianIssues.push('Bulgarian translation too short');
    }
  }
  
  // 3. Check for identical translations (likely error)
  if (entry.german && entry.bulgarian && entry.german.trim() === entry.bulgarian.trim()) {
    bulgarianIssues.push('Identical to German (likely error)');
  }
  
  // 4. Check for obvious semantic mismatches
  const germanLower = entry.german ? entry.german.toLowerCase() : '';
  const bulgarianLower = entry.bulgarian ? entry.bulgarian.toLowerCase() : '';
  
  // Common semantic mismatches to check
  if (germanLower.includes('bitte') && bulgarianLower.includes('не')) {
    bulgarianIssues.push('Possible semantic mismatch (Bitte → Не)');
  }
  
  if (germanLower.includes('danke') && bulgarianLower.includes('не')) {
    bulgarianIssues.push('Possible semantic mismatch (Danke → Не)');
  }
  
  if (germanLower.includes('ja') && bulgarianLower.includes('не')) {
    bulgarianIssues.push('Possible semantic mismatch (Ja → Не)');
  }
  
  // 5. Check for formatting issues
  if (entry.bulgarian && (entry.bulgarian.startsWith('(') || entry.bulgarian.endsWith(')'))) {
    bulgarianIssues.push('Possible formatting issue with parentheses');
  }
  
  // 6. Check for multiple spaces or unusual spacing
  if (entry.bulgarian && entry.bulgarian.includes('  ')) {
    bulgarianIssues.push('Multiple spaces detected');
  }
  
  // 7. Check for single quotes that might indicate unfinished content
  if (entry.bulgarian && entry.bulgarian.includes("'") && !entry.bulgarian.includes("''")) {
    bulgarianIssues.push('Single quote detected (possible unfinished content)');
  }
  
  // 8. Check for numbers in Bulgarian text (should be Cyrillic or properly formatted)
  if (entry.bulgarian && /\d/.test(entry.bulgarian)) {
    bulgarianIssues.push('Contains numeric digits (should use Cyrillic numbers)');
  }
  
  if (germanIssues.length > 0 || bulgarianIssues.length > 0) {
    issuesFound++;
    
    console.log(`\n📝 Entry ${entryNum} (ID: ${entry.id}):`);
    console.log(`  German: "${entry.german}"`);
    console.log(`  Bulgarian: "${entry.bulgarian}"`);
    
    if (germanIssues.length > 0) {
      console.log(`  🇩🇪 Issues: ${germanIssues.join(', ')}`);
    }
    if (bulgarianIssues.length > 0) {
      console.log(`  🇧🇬 Issues: ${bulgarianIssues.join(', ')}`);
    }
    
    // Add to corrections needed if critical issues
    if (bulgarianIssues.some(issue => issue.includes('semantic')) ||
        bulgarianIssues.some(issue => issue.includes('Latin')) ||
        bulgarianIssues.some(issue => issue.includes('Multiple spaces')) ||
        bulgarianIssues.some(issue => issue.includes('Single quote')) ||
        bulgarianIssues.some(issue => issue.includes('numeric'))) {
      correctionsNeeded.push({
        entryNum,
        id: entry.id,
        german: entry.german,
        bulgarian: entry.bulgarian,
        issues: [...germanIssues, ...bulgarianIssues]
      });
    }
  }
});

console.log(`\n📊 Batch 28 Summary:`);
console.log(`  Entries reviewed: ${batch28.length}`);
console.log(`  Issues found: ${issuesFound}`);
console.log(`  Critical corrections needed: ${correctionsNeeded.length}`);

if (correctionsNeeded.length > 0) {
  console.log('\n⚠️  Critical issues requiring correction:');
  correctionsNeeded.forEach(correction => {
    console.log(`\n  Entry ${correction.entryNum}: "${correction.german}" → "${correction.bulgarian}"`);
    console.log(`  Issues: ${correction.issues.join(', ')}`);
  });
} else {
  console.log('\n✅ No critical issues found in Batch 28!');
}

console.log('\n🎉 Batch 28 review complete!');