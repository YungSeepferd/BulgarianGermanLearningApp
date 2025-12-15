import fs from 'fs';

const BATCH_START = 200;
const BATCH_END = 500;

const items = (JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8')).items) || [];
const batchItems = items.slice(BATCH_START, BATCH_END);

const adjectives = batchItems.filter(it => it.partOfSpeech === 'adjective');

const outputPath = 'enrichment-output/adjectives-b21-50-list.json';
fs.writeFileSync(outputPath, JSON.stringify(adjectives.map(a => ({
    id: a.id,
    german: a.german,
    cleanGerman: a.german.split(',')[0].trim()
})), null, 2));

console.log(`Found ${adjectives.length} adjectives in batches 21-50.`);
console.log(`Saved list to ${outputPath}`);
