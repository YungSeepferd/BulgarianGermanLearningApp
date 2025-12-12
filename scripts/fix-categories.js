import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'static', 'data', 'unified-vocabulary.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let fixedCount = 0;
const fixes = [];

// Category mapping rules based on partOfSpeech
const partOfSpeechToCategory = {
  'number': 'numbers',
  'numeral': 'numbers',
  'verb': 'verbs',
  'adjective': 'adjectives',
  'adverb': 'adverbs',
  'pronoun': 'pronouns',
  'preposition': 'prepositions',
  'conjunction': 'conjunctions',
  'interjection': 'interjections',
  'greeting': 'greetings'
};

// Additional context-based rules
const contextRules = [
  {
    test: (item) => /^(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)$/i.test(item.german),
    category: 'time',
    description: 'Month names'
  },
  {
    test: (item) => /^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)$/i.test(item.german),
    category: 'time',
    description: 'Day names'
  },
  {
    test: (item) => /^(Mutter|Vater|Bruder|Schwester|Oma|Opa|Tante|Onkel|Kind|Baby)$/i.test(item.german),
    category: 'family',
    description: 'Family members'
  },
  {
    test: (item) => /^(Hund|Katze|Vogel|Fisch|Pferd|Kuh|Schwein)$/i.test(item.german),
    category: 'animals',
    description: 'Common animals'
  },
  {
    test: (item) => /^(rot|blau|grün|gelb|schwarz|weiß|braun|orange|lila|rosa)$/i.test(item.german),
    category: 'colors',
    description: 'Colors'
  },
  {
    test: (item) => /^(Haus|Wohnung|Zimmer|Küche|Bad|Tür|Fenster|Tisch|Stuhl|Bett)$/i.test(item.german),
    category: 'house',
    description: 'House and furniture'
  },
  {
    test: (item) => /^(Kopf|Auge|Nase|Mund|Ohr|Hand|Fuß|Bein|Arm)$/i.test(item.german),
    category: 'body',
    description: 'Body parts'
  },
  {
    test: (item) => /^(Hemd|Hose|Kleid|Rock|Jacke|Schuhe|Mantel)$/i.test(item.german),
    category: 'clothing',
    description: 'Clothing'
  },
  {
    test: (item) => /^(Brot|Wasser|Milch|Käse|Fleisch|Fisch|Gemüse|Obst|Apfel|Banane)$/i.test(item.german),
    category: 'food',
    description: 'Food and drinks'
  },
  {
    test: (item) => /^(Auto|Bus|Zug|Flugzeug|Fahrrad|Schiff|Straße|Bahnhof|Flughafen)$/i.test(item.german),
    category: 'transport',
    description: 'Transport'
  },
  {
    test: (item) => /^(Arbeit|Lehrer|Arzt|Ingenieur|Verkäufer|Koch|Polizist)$/i.test(item.german),
    category: 'professions',
    description: 'Professions'
  },
  {
    test: (item) => /^(Stadt|Land|Berg|Meer|Fluss|See|Park|Straße|Platz)$/i.test(item.german),
    category: 'places',
    description: 'Places and geography'
  },
  {
    test: (item) => /^(Sonne|Regen|Schnee|Wind|Wolke|Nebel|Gewitter)$/i.test(item.german),
    category: 'weather',
    description: 'Weather'
  },
  {
    test: (item) => /^(Computer|Handy|Internet|E-Mail|Drucker)$/i.test(item.german),
    category: 'technology',
    description: 'Technology'
  }
];

data.items.forEach((item, index) => {
  if (!item.categories || !item.categories.length || item.categories.includes('uncategorized')) {
    let newCategory = null;
    let reason = null;

    // First try partOfSpeech mapping
    if (item.partOfSpeech && partOfSpeechToCategory[item.partOfSpeech]) {
      newCategory = partOfSpeechToCategory[item.partOfSpeech];
      reason = `partOfSpeech: ${item.partOfSpeech}`;
    }

    // Then try context rules
    if (!newCategory) {
      for (const rule of contextRules) {
        if (rule.test(item)) {
          newCategory = rule.category;
          reason = rule.description;
          break;
        }
      }
    }

    // Apply fix if we found a category
    if (newCategory) {
      const oldCategories = item.categories || [];
      item.categories = [newCategory];
      fixedCount++;
      fixes.push({
        id: item.id,
        german: item.german,
        partOfSpeech: item.partOfSpeech,
        oldCategories,
        newCategories: item.categories,
        reason
      });
    }
  }
});

// Write fixed data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

// Write report
const reportPath = path.join(__dirname, '..', 'category-fix-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalItems: data.items.length,
  fixedItems: fixedCount,
  percentFixed: Math.round((fixedCount / data.items.length) * 100),
  fixes: fixes.slice(0, 50) // First 50 fixes for preview
}, null, 2), 'utf-8');

console.log(`Fixed ${fixedCount} items (${Math.round((fixedCount / data.items.length) * 100)}%)`);
console.log(`Report saved to: ${reportPath}`);
console.log(`\nFirst 10 fixes:`);
fixes.slice(0, 10).forEach((fix, i) => {
  console.log(`${i + 1}. ${fix.german} (${fix.partOfSpeech}): ${fix.oldCategories.join(', ')} → ${fix.newCategories.join(', ')} [${fix.reason}]`);
});
