const fs = require('fs');
const items = (JSON.parse(fs.readFileSync('data/unified-vocabulary.json', 'utf8')).items) || [];
const lessThan2 = items.filter(it => !it.examples || it.examples.length < 2).length;
console.log('Items with < 2 examples:', lessThan2);
