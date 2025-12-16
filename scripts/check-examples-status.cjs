const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

let total = items.length;
let lessThan2 = 0;
let zero = 0;

items.forEach(item => {
  const count = item.examples ? item.examples.length : 0;
  if (count === 0) zero++;
  if (count < 2) lessThan2++;
});

console.log(`Total items: ${total}`);
console.log(`Items with 0 examples: ${zero}`);
console.log(`Items with < 2 examples: ${lessThan2}`);
console.log(`Percentage with < 2 examples: ${((lessThan2 / total) * 100).toFixed(1)}%`);
