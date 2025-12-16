const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const items = Array.isArray(data) ? data : (data.items || []);

const verbIds = [
  "a1_final14_001", // singen
  "a1_final14_002", // tanzen
  "a1_final14_003", // schwimmen
  "a1_final14_004", // laufen
  "a1_final14_005", // gehen
  "a1_final14_006", // sitzen
  "a1_final14_007", // liegen
  "a1_final14_008", // stehen
  "a1_final14_009", // weinen
  "a1_final14_010", // lachen
  "a1_final14_011", // waschen
  "a1_final14_012", // kochen
  "a1_final14_013", // putzen
  "a1_final14_014", // anziehen
  "a1_final14_015", // schneiden
  "a1_final14_047_dup1" // gehen (dup)
];

let updatedCount = 0;

items.forEach(item => {
  if (verbIds.includes(item.id)) {
    if (item.partOfSpeech === 'noun') {
      item.partOfSpeech = 'verb';
      if (item.grammar && item.grammar.gender) {
        delete item.grammar.gender;
      }
      // If grammar is empty, remove it
      if (item.grammar && Object.keys(item.grammar).length === 0) {
        delete item.grammar;
      }
      console.log(`Fixed ${item.german} (${item.id}): noun -> verb`);
      updatedCount++;
    }
  }
});

if (updatedCount > 0) {
  fs.writeFileSync(vocabPath, JSON.stringify(items, null, 2));
  console.log(`Updated ${updatedCount} items.`);
} else {
  console.log('No items needed updating.');
}
