const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

const targetId = "a1_final14_032";
let updated = false;

const item = items.find(it => it.id === targetId);
if (item) {
  if (item.german === 'Karte/Map') {
    item.german = 'Karte';
    console.log(`Fixed ${item.id}: Karte/Map -> Karte`);
    updated = true;
  }
}

if (updated) {
  fs.writeFileSync(vocabPath, JSON.stringify(items, null, 2));
  console.log(`Updated 1 item.`);
} else {
  console.log('Item not found or already fixed.');
}
