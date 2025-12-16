const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

const nouns = items.filter(it => it.partOfSpeech === 'noun');
const missingDeclension = nouns.filter(it => !it.grammar || !it.grammar.declension);

const out = path.join(__dirname, '../enrichment-output/nouns-missing-declension.json');
fs.writeFileSync(out, JSON.stringify({ count: missingDeclension.length, items: missingDeclension }, null, 2));

console.log(`Found ${missingDeclension.length} nouns missing declension`);
