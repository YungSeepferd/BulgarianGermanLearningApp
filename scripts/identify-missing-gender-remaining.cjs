const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

// Remaining batches: 800 to end
const slice = items.slice(800);

const nouns = slice.map((it, idx) => ({
  index: 800 + idx + 1,
  id: it.id,
  german: it.german,
  partOfSpeech: it.partOfSpeech,
  hasGender: Boolean(it.grammar?.gender)
})).filter(it => it.partOfSpeech === 'noun' && !it.hasGender);

const out = path.join(__dirname, '../enrichment-output/nouns-remaining-missing-gender.json');
fs.writeFileSync(out, JSON.stringify({ count: nouns.length, items: nouns }, null, 2));

console.log(`Found ${nouns.length} nouns missing gender in remaining batches`);
