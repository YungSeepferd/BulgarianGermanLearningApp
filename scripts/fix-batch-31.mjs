#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backup before making changes
const vocabPath = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.json');
const backupPath = path.join(__dirname, '../static/data/unified-vocabulary.linguistic-corrected.backup-batch31.json');

// Load the vocabulary file
let vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log('🔧 Batch 31 Linguistic Correction (Entries 1501-1550)');
console.log('====================================================\n');

let correctionsApplied = 0;

// Apply corrections to entries with issues
const entriesToFix = [
    { entryNum: 1501, id: 'mlenpt-1hh9wu', before: 'Мле́чен път m ·', after: 'Млечен път' },
    { entryNum: 1502, id: 'dg-i4351', before: 'дъга́ f d əˈɡa]', after: 'дъга' },
    { entryNum: 1503, id: 'mda-wpxwca', before: 'ми́да f ·', after: 'мида' },
    { entryNum: 1504, id: 'tjlo-idjvu', before: 'тя́ло n ˈtʲalo]', after: 'тяло' },
    { entryNum: 1505, id: 'grb-mbgc6f', before: 'гръб m ɡrɤp]', after: 'гръб' },
    { entryNum: 1506, id: 'grd-4qorxq', before: 'гърда́ f ɡərˈda]', after: 'гърда' },
    { entryNum: 1507, id: 'grd-n7p0rw', before: 'гърди́ pl ·', after: 'гърди' },
    { entryNum: 1508, id: 'gz-k59pd', before: 'гъз m ˈɡɤs]', after: 'гъз' },
    { entryNum: 1509, id: 'cca-kxttla', before: 'ци́ца f ˈtsitsə ]', after: 'цица' },
    { entryNum: 1510, id: 'pitjl-0bhte8', before: 'пищя́л m ·', after: 'пищял' },
    { entryNum: 1511, id: 'stplo-4v4xfj', before: 'стъпа́ло m st əˈ palo]', after: 'стъпало' },
    { entryNum: 1512, id: 'prst-12vxsw', before: 'пръст m pr ɤ st]', after: 'пръст' },
    { entryNum: 1513, id: 'dta-6n62y3', before: 'да́та f ·', after: 'дата' },
    { entryNum: 1514, id: 'vza-si0wgh', before: 'ви́за f ˈvizə ]', after: 'виза' }
];

entriesToFix.forEach(entry => {
    const vocabEntry = vocabulary.items[entry.entryNum - 1];
    if (vocabEntry && vocabEntry.id === entry.id && vocabEntry.bulgarian === entry.before) {
        console.log(`📝 Entry ${entry.entryNum} (ID: ${entry.id}):`);
        console.log(`  Before: "${entry.before}"`);
        vocabEntry.bulgarian = entry.after;
        console.log(`  After:  "${entry.after}"`);
        console.log(`  ✅ Fixed: Removed IPA transcription, Latin characters, and formatting artifacts`);
        correctionsApplied++;
    }
});

console.log('\n📊 Batch 31 Correction Summary:');
console.log(`  Corrections applied: ${correctionsApplied}`);
console.log(`  Entries processed: ${entriesToFix.length}`);

if (correctionsApplied > 0) {
    // Save backup
    fs.writeFileSync(backupPath, JSON.stringify(vocabulary, null, 2));
    console.log(`\n💾 Backup created: unified-vocabulary.linguistic-corrected.backup-batch31.json`);
    
    // Save the corrected vocabulary
    fs.writeFileSync(vocabPath, JSON.stringify(vocabulary, null, 2));
    console.log('\n✅ Batch 31 corrections completed successfully!');
    console.log('   Remember to verify corrections before proceeding.');
} else {
    console.log('\n⚠️  No corrections were applied.');
}

console.log('\n🎉 Batch 31 correction process complete!');
