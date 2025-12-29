#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the vocabulary file
const vocabPath = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log('🔍 Batch 33 Linguistic Review (Entries 1601-1650)');
console.log('=================================================\n');

let issuesFound = 0;

// Review entries 1601-1650 (0-indexed: 1600-1649)
const batchEntries = vocabulary.items.slice(1600, 1650);

batchEntries.forEach((entry, index) => {
    const entryNum = 1601 + index;
    let hasIssues = false;
    let issueDetails = [];
    
    // Check for IPA transcriptions
    const hasIPA = entry.bulgarian.includes('ˈ') || 
                  entry.bulgarian.includes('ˌ') || 
                  entry.bulgarian.includes('ː') ||
                  entry.bulgarian.includes('ɐ') ||
                  entry.bulgarian.includes('ɑ') ||
                  entry.bulgarian.includes('ɔ') ||
                  entry.bulgarian.includes('ə') ||
                  entry.bulgarian.includes('ɛ') ||
                  entry.bulgarian.includes('ɜ') ||
                  entry.bulgarian.includes('ɟ') ||
                  entry.bulgarian.includes('ɡ') ||
                  entry.bulgarian.includes('ɣ') ||
                  entry.bulgarian.includes('ɥ') ||
                  entry.bulgarian.includes('ɦ') ||
                  entry.bulgarian.includes('ɨ') ||
                  entry.bulgarian.includes('ɪ') ||
                  entry.bulgarian.includes('ɫ') ||
                  entry.bulgarian.includes('ɬ') ||
                  entry.bulgarian.includes('ɯ') ||
                  entry.bulgarian.includes('ɰ') ||
                  entry.bulgarian.includes('ɱ') ||
                  entry.bulgarian.includes('ɲ') ||
                  entry.bulgarian.includes('ɳ') ||
                  entry.bulgarian.includes('ɵ') ||
                  entry.bulgarian.includes('ɸ') ||
                  entry.bulgarian.includes('ɹ') ||
                  entry.bulgarian.includes('ɻ') ||
                  entry.bulgarian.includes('ɽ') ||
                  entry.bulgarian.includes('ɾ') ||
                  entry.bulgarian.includes('ʀ') ||
                  entry.bulgarian.includes('ʁ') ||
                  entry.bulgarian.includes('ʂ') ||
                  entry.bulgarian.includes('ʃ') ||
                  entry.bulgarian.includes('ʈ') ||
                  entry.bulgarian.includes('ʉ') ||
                  entry.bulgarian.includes('ʊ') ||
                  entry.bulgarian.includes('ʋ') ||
                  entry.bulgarian.includes('ʌ') ||
                  entry.bulgarian.includes('ʎ') ||
                  entry.bulgarian.includes('ʐ') ||
                  entry.bulgarian.includes('ʑ') ||
                  entry.bulgarian.includes('ʒ') ||
                  entry.bulgarian.includes('ʔ') ||
                  entry.bulgarian.includes('ʕ') ||
                  entry.bulgarian.includes('ʗ') ||
                  entry.bulgarian.includes('ʘ') ||
                  entry.bulgarian.includes('ʙ') ||
                  entry.bulgarian.includes('ʜ') ||
                  entry.bulgarian.includes('ʝ') ||
                  entry.bulgarian.includes('ʞ') ||
                  entry.bulgarian.includes('ʟ') ||
                  entry.bulgarian.includes('ʠ') ||
                  entry.bulgarian.includes('ʡ') ||
                  entry.bulgarian.includes('ʣ') ||
                  entry.bulgarian.includes('ʤ') ||
                  entry.bulgarian.includes('ʦ') ||
                  entry.bulgarian.includes('ʧ');
    
    if (hasIPA) {
        hasIssues = true;
        issueDetails.push('IPA transcription found');
    }
    
    // Check for Latin characters (basic check)
    const hasLatin = /[a-zA-Z]/.test(entry.bulgarian);
    if (hasLatin) {
        hasIssues = true;
        issueDetails.push('Latin characters found');
    }
    
    // Check for formatting artifacts
    const hasArtifacts = entry.bulgarian.includes('·') || 
                         entry.bulgarian.includes('[') || 
                         entry.bulgarian.includes(']') ||
                         entry.bulgarian.includes('m ') ||
                         entry.bulgarian.includes('f ') ||
                         entry.bulgarian.includes('n ') ||
                         entry.bulgarian.includes('pf/impf') ||
                         entry.bulgarian.includes('pf') ||
                         entry.bulgarian.includes('impf');
    
    if (hasArtifacts) {
        hasIssues = true;
        issueDetails.push('Formatting artifacts found');
    }
    
    if (hasIssues) {
        issuesFound++;
        console.log(`❌ Entry ${entryNum} (ID: ${entry.id}):`);
        console.log(`   Bulgarian: "${entry.bulgarian}"`);
        console.log(`   Issues: ${issueDetails.join(', ')}`);
        console.log('');
    }
});

console.log('📊 Batch 33 Review Summary:');
console.log(`   Total entries reviewed: 50`);
console.log(`   Issues found: ${issuesFound}`);
console.log(`   Clean entries: ${50 - issuesFound}`);

if (issuesFound === 0) {
    console.log('\n✅ Batch 33 Review PASSED - No issues found!');
    console.log('   All entries are clean and ready for certification.');
} else {
    console.log(`\n⚠️  Batch 33 Review COMPLETED - ${issuesFound} issues need correction`);
    console.log('   Please create a fix script to address these issues.');
}

console.log('\n🎉 Batch 33 review process complete!');
