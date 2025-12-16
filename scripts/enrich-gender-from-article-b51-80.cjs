const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../enrichment-output/nouns-b51-80-missing-gender.json');
const outputFile = path.join(__dirname, '../enrichment-output/batch-51-80-gender-enrichment.json');

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const items = data.items;

const enrichment = items.map(item => {
  let gender = null;
  const german = item.german.toLowerCase();

  if (german.startsWith('der ') || german.includes(', der ')) {
    gender = 'm';
  } else if (german.startsWith('die ') || german.includes(', die ')) {
    gender = 'f';
  } else if (german.startsWith('das ') || german.includes(', das ')) {
    gender = 'n';
  }

  // Heuristics for words without articles or multiple words
  if (!gender) {
      if (german.endsWith('ung') || german.endsWith('heit') || german.endsWith('keit') || german.endsWith('schaft') || german.endsWith('tät') || german.endsWith('ion') || german.endsWith('e')) {
          gender = 'f';
      } else if (german.endsWith('chen') || german.endsWith('lein') || german.endsWith('ment') || german.endsWith('tum') || german.endsWith('um')) {
          gender = 'n';
      } else if (german.endsWith('er') || german.endsWith('en') || german.endsWith('ismus') || german.endsWith('ist') || german.endsWith('or')) {
          gender = 'm';
      }
  }

  if (gender) {
    return {
      id: item.id,
      gender: gender
    };
  } else {
      console.log(`Could not determine gender for: ${item.german} (${item.id})`);
  }
  return null;
}).filter(item => item !== null);

fs.writeFileSync(outputFile, JSON.stringify(enrichment, null, 2));
console.log(`Generated gender enrichment for ${enrichment.length} items.`);
