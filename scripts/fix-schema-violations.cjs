const fs = require('fs');

const validCats = new Set([
  'greetings','numbers','family','food','colors','animals','body-parts',
  'clothing','home','nature','transport','technology','time','weather',
  'professions','places','grammar','culture','everyday-phrases'
]);

const catMap = {
  'a1': 'greetings',
  'common-nouns': 'grammar',
  'actions': 'grammar',
  'education': 'culture',
  'verbs': 'grammar'
};

const validSources = new Set(['current','legacy','merged','generated']);

const data = JSON.parse(fs.readFileSync('data/unified-vocabulary.json','utf8'));
const now = new Date().toISOString();

let fixedCats=0, fixedSources=0, fixedCreated=0;

for (const item of data) {
  // Ensure createdAt/updatedAt exist
  if (!item.createdAt) { item.createdAt = now; fixedCreated++; }
  if (!item.updatedAt) { item.updatedAt = now; }

  // Fix categories
  if (Array.isArray(item.categories)) {
    item.categories = item.categories.map(c => {
      if (validCats.has(c)) return c;
      const mapped = catMap[c];
      if (mapped) { fixedCats++; return mapped; }
      fixedCats++;
      return 'grammar';
    });
  }

  // Fix example sources
  if (Array.isArray(item.examples)) {
    for (const ex of item.examples) {
      if (ex.source && !validSources.has(ex.source)) {
        ex.source = 'legacy';
        fixedSources++;
      }
      if (!ex.source) ex.source = 'legacy';
      if (!ex.german || typeof ex.german !== 'string') ex.german = ex.german || item.german || '';
      if (!ex.bulgarian || typeof ex.bulgarian !== 'string') ex.bulgarian = ex.bulgarian || item.bulgarian || '';
    }
  }
}

fs.writeFileSync('data/unified-vocabulary.json', JSON.stringify(data, null, 2));
console.log('Fixed', fixedCreated, 'missing createdAt,', fixedCats, 'bad categories,', fixedSources, 'bad sources');
console.log('Total items:', data.length);
