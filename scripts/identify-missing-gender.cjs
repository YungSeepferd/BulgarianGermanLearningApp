const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const items = (JSON.parse(fs.readFileSync(vocabPath, 'utf8')).items) || [];

// Batches 21-50 correspond to items 200 to 500 (0-indexed: 200-499)
// Actually, let's check the batch logic. Usually batch size is 10.
// Batch 1: 0-9
// Batch 20: 190-199
// Batch 21 starts at 200.
// Batch 50 ends at 499.
const slice = items.slice(200, 500);

const nouns = slice.map((it, idx) => ({
  index: 200 + idx + 1,
  id: it.id,
  german: it.german,
  partOfSpeech: it.partOfSpeech,
  hasGender: Boolean(it.grammar?.gender)
})).filter(it => it.partOfSpeech === 'noun' && !it.hasGender);

const out = path.join(__dirname, '../enrichment-output/nouns-b21-50-missing-gender.json');
fs.writeFileSync(out, JSON.stringify({ count: nouns.length, items: nouns }, null, 2));

console.log(`Found ${nouns.length} nouns missing gender in batches 21-50`);
