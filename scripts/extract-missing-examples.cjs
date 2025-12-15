const fs = require('fs');
const items = (JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8')).items) || [];
const missing = items.filter(it => {
    if (!it.examples || it.examples.length < 2) return true;
    return !it.examples.every(ex => ex.german && ex.bulgarian && ex.german.trim() !== '' && ex.bulgarian.trim() !== '');
}).map(it => ({
    id: it.id,
    german: it.german,
    bulgarian: it.bulgarian,
    partOfSpeech: it.partOfSpeech,
    existingExamples: it.examples || []
}));

fs.writeFileSync('enrichment-output/items-missing-examples.json', JSON.stringify({count: missing.length, items: missing}, null, 2));
console.log(`Found ${missing.length} items missing valid examples.`);
