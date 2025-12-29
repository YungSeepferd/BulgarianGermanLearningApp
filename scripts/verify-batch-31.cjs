#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the corrected vocabulary file
const vocabPath = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log('🔍 Batch 31 Verification (Entries 1501-1550)');
console.log('=============================================\n');

let verificationPassed = true;
let issuesFound = 0;

// Entries to verify (1501-1550)
const entriesToVerify = vocabulary.items.slice(1500, 1550);

entriesToVerify.forEach((entry, index) => {
    const entryNum = 1501 + index;
    
    // Check for common IPA transcription characters
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
    
    // Check for Latin characters
    const hasLatin = /[a-zA-Z]/.test(entry.bulgarian);
    
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
    
    if (hasIPA || hasLatin || hasArtifacts) {
        console.log(`❌ Entry ${entryNum} (ID: ${entry.id}):`);
        console.log(`   Bulgarian: "${entry.bulgarian}"`);
        console.log(`   Issue: Still contains IPA transcription, Latin characters, or formatting artifacts`);
        verificationPassed = false;
        issuesFound++;
    }
});

if (verificationPassed) {
    console.log('✅ Batch 31 Verification PASSED');
    console.log('   All IPA transcriptions, Latin characters, and formatting artifacts removed successfully');
    console.log('   All 50 entries verified clean');
} else {
    console.log(`❌ Batch 31 Verification FAILED`);
    console.log(`   Issues found: ${issuesFound}`);
    console.log('   Please review and correct the issues above');
}

console.log('\n📊 Verification Summary:');
console.log(`   Total entries verified: 50`);
console.log(`   Issues found: ${issuesFound}`);
console.log(`   Verification status: ${verificationPassed ? 'PASSED ✅' : 'FAILED ❌'}`);

if (verificationPassed) {
    console.log('\n🎉 Batch 31 is ready for certification!');
    console.log('   You can now proceed to Batch 32 (Entries 1551-1600)');
} else {
    console.log('\n⚠️  Please address the verification issues before proceeding.');
}
