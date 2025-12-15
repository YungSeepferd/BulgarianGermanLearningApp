import fs from 'fs';

const BATCH_START = 200;
const BATCH_END = 500;

const items = (JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8')).items) || [];
const batchItems = items.slice(BATCH_START, BATCH_END);

const verbs = batchItems.filter(it => it.partOfSpeech === 'verb');

console.log(`Checked items ${BATCH_START} to ${BATCH_END - 1} (Batches 21-50).`);
console.log(`Found ${verbs.length} verbs.`);

if (verbs.length > 0) {
    console.log('Sample verbs:', verbs.slice(0, 5).map(v => v.german).join(', '));
}
