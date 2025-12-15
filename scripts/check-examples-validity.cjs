const fs = require('fs');
const items = (JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8')).items) || [];
const validExamples = items.filter(it => {
    if (!it.examples || it.examples.length < 2) return false;
    // Check if examples have content
    return it.examples.every(ex => ex.german && ex.bulgarian && ex.german.trim() !== '' && ex.bulgarian.trim() !== '');
}).length;
console.log('Items with >= 2 valid examples:', validExamples);
console.log('Total items:', items.length);
