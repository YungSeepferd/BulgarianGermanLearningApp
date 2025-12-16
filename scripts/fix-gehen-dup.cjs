const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

const targetId = "a1_final14_005_dup1";
let updated = false;

const item = items.find(it => it.id === targetId);
if (item) {
  if (item.partOfSpeech === 'noun') {
    item.partOfSpeech = 'verb';
    if (item.grammar && item.grammar.gender) {
      delete item.grammar.gender;
    }
    if (item.grammar && Object.keys(item.grammar).length === 0) {
      delete item.grammar;
    }
    console.log(`Fixed ${item.german} (${item.id}): noun -> verb`);
    updated = true;
  }
}

if (updated) {
  fs.writeFileSync(vocabPath, JSON.stringify(items, null, 2));
  console.log(`Updated 1 item.`);
} else {
  console.log('Item not found or already fixed.');
}
