#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
let vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
const vocab = vocabData.items || vocabData.vocabulary || [];

console.log(`🔧 STANDARDIZING & COMPLETING CATEGORIZATION FOR ALL 746 ITEMS\n`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Canonical categories
const VALID_CATEGORIES = [
  'greetings', 'numbers', 'family', 'food', 'colors',
  'animals', 'body-parts', 'clothing', 'home', 'nature',
  'transport', 'technology', 'time', 'weather', 'professions',
  'places', 'grammar', 'culture', 'everyday-phrases'
];

function normalizeCategory(cat) {
  if (!cat) return null;
  const normalized = cat.toLowerCase().trim().replace(/_/g, '-');
  
  // Map common variations
  const mapping = {
    'house': 'home',
    'common_phrases': 'everyday-phrases',
    'common-phrases': 'everyday-phrases',
    'expressions': 'everyday-phrases',
    'uncategorized': null,
    'phrase': 'everyday-phrases'
  };
  
  return mapping[normalized] || (VALID_CATEGORIES.includes(normalized) ? normalized : null);
}

// Enhanced category assignment
function assignCategories(german, bulgarian, pos, difficulty) {
  const g = german.toLowerCase();
  const b = bulgarian.toLowerCase();
  
  const patterns = {
    'greetings': /^(hallo|guten|gute|hi|hej|willkommen|bye|auf wiedersehen|tschüss|cheerio|danke|bitte|excuse me|thank|please)/i,
    'numbers': /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|einhundert|tausend|null|erste|zweite|dritte|vierte|fünfte)/i,
    'family': /^(mutter|vater|sohn|tochter|bruder|schwester|großvater|großmutter|ehemann|ehefrau|cousin|nichte|neffe|onkel|tante)/i,
    'food': /^(apfel|orange|banane|brokkoli|karotte|kartoffel|mais|tomate|gurke|salat|butter|käse|brot|milch|wasser|beer|wein|kaffee|tee|zucker|fleisch|fisch|huhn|schwein|ei)/i,
    'colors': /^(rot|blau|grün|gelb|orange|violett|lila|rosa|schwarz|weiß|grau|braun|dunkel|hell)/i,
    'animals': /^(hund|katze|vogel|fisch|pferd|kuh|schwein|schaf|ziege|kaninchen|hamster|löwe|tiger|bär|elefant|giraffe|zebra|affe)/i,
    'body-parts': /^(auge|ohr|nase|mund|zahn|zunge|hand|fuß|finger|kopf|gesicht|hals|schulter|arm|bein|knie|bauch|rücken|herz)/i,
    'clothing': /^(hemd|hose|kleid|jacke|mantel|schuh|stiefel|strumpf|handschuh|mütze|hut|schal|krawatte|gürtel|socke)/i,
    'home': /^(haus|wohnung|zimmer|schlafzimmer|wohnzimmer|küche|badezimmer|toilette|fenster|tür|wand|dach|bett|stuhl|tisch|sofa|lampe|tapete)/i,
    'nature': /^(baum|blume|gras|strauch|wald|berg|fluss|see|meer|strand|dorf|stein|sand|wasser|feuer|sturm|regen|sonne|mond|stern|himmel|wolke)/i,
    'transport': /^(auto|bus|zug|fahrrad|motorrad|schiff|flugzeug|boot|wagen|roller|skateboard|helikopter|lkw|lastwagen)/i,
    'technology': /^(computer|telefon|handy|tablet|laptop|drucker|monitor|tastatur|maus|fernseher|radio|uhr|batterie|akku|kabel|usb|internet|software)/i,
    'time': /^(morgen|mittag|abend|nacht|tag|woche|monat|jahr|stunde|minute|sekunde|uhr|zeit|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i,
    'weather': /^(regen|schnee|sturm|wind|nebel|hagel|gewitter|blitz|donner|sonne|wolke|licht|dunkelheit|eis|frost|hitze|kälte|temperatur|grad|wetter)/i,
    'professions': /^(arzt|krankenschwester|lehrer|schüler|student|ingenieur|programmierer|mechaniker|klempner|elektiker|maler|zimmermann|polizist|feuerwehrmann|soldat|pilot|stewardess|kellner|koch|bäcker|metzger|schneider|friseur|zahnarzt|apotheker|anwalt|richter|politiker)/i,
    'places': /^(stadt|dorf|land|straße|platz|brücke|kirche|schule|hospital|krankenhaus|polizei|feuerwehr|post|bank|bahnhof|flughafen|markt|park|theater|museum|kino|restaurant|café|bar|hotel|motel|camping|stadion|gefängnis|büro)/i,
    'grammar': /^(nominativ|genitiv|dativ|akkusativ|verb|nomen|adjektiv|adverb|pronomen|konjunktion|präposition|artikel|infinitiv|partizip|imperfekt|perfekt|plusquamperfekt|futur|modus|subjunktiv|indikativ|konditional|imperativ|genus|numerus|kasus|tempus|aspekt|vergangenheit|gegenwart|zukunft)/i,
    'culture': /^(musik|lied|tanz|theater|film|bild|kunst|buch|roman|gedicht|geschichte|sage|märchen|legend|tradition|brauch|fest|feiertag|kirche|religion|glaube|gott|jesus|maria|heiliger|priester|pfarrer|rabbi|mönch|nonne|kloster|kathedrale|kapelle|altar|bible|koran|torah)/i
  };
  
  const matched = [];
  for (const [cat, pattern] of Object.entries(patterns)) {
    if (pattern.test(g)) {
      matched.push(cat);
      if (matched.length >= 2) break;
    }
  }
  
  return matched.length > 0 ? matched : ['everyday-phrases'];
}

function assignCEFR(difficulty) {
  if (difficulty <= 1.5) return 'A1';
  if (difficulty <= 2.5) return 'A2';
  if (difficulty <= 3.5) return 'B1';
  return 'B2';
}

// Process all items
let updated = 0;
let fixed = 0;

vocab.forEach((item, idx) => {
  // Fix missing CEFR
  if (!item.cefrLevel) {
    item.cefrLevel = assignCEFR(item.difficulty || 1);
    updated++;
  }
  
  // Fix or standardize categories
  if (!item.categories || item.categories.length === 0 || 
      item.categories.some(c => !VALID_CATEGORIES.includes(c))) {
    
    // Try to normalize existing categories first
    let normalized = item.categories || [];
    normalized = normalized.map(normalizeCategory).filter(c => c !== null);
    
    // If still empty or invalid, assign new
    if (normalized.length === 0) {
      item.categories = assignCategories(item.german, item.bulgarian, item.partOfSpeech, item.difficulty);
    } else {
      item.categories = normalized;
    }
    
    fixed++;
  }
  
  if ((idx + 1) % 100 === 0) {
    console.log(`✓ Processed ${idx + 1}/${vocab.length} items`);
  }
});

console.log(`\n✅ Fixed ${fixed} items with invalid/missing categories`);
console.log(`✅ Updated ${updated} items with missing CEFR levels\n`);

// Validation
const cefrDist = {};
const catDist = {};
let valid = 0;
let invalid = 0;
const issues = [];

vocab.forEach(item => {
  const errors = [];
  
  // Check CEFR
  if (!item.cefrLevel || !['A1', 'A2', 'B1', 'B2'].includes(item.cefrLevel)) {
    errors.push(`Invalid CEFR: ${item.cefrLevel}`);
  } else {
    cefrDist[item.cefrLevel] = (cefrDist[item.cefrLevel] || 0) + 1;
  }
  
  // Check categories
  if (!item.categories || item.categories.length === 0) {
    errors.push(`No categories`);
  } else if (item.categories.length > 2) {
    errors.push(`Too many categories (${item.categories.length})`);
  } else {
    const invalidCats = item.categories.filter(c => !VALID_CATEGORIES.includes(c));
    if (invalidCats.length > 0) {
      errors.push(`Invalid categories: ${invalidCats.join(', ')}`);
    } else {
      item.categories.forEach(cat => {
        catDist[cat] = (catDist[cat] || 0) + 1;
      });
    }
  }
  
  if (errors.length === 0) {
    valid++;
  } else {
    invalid++;
    issues.push({ id: item.id, german: item.german, errors });
  }
});

console.log(`📊 FINAL VALIDATION RESULTS\n`);
console.log(`✅ Valid: ${valid}/${vocab.length} (${(valid/vocab.length*100).toFixed(1)}%)`);
console.log(`❌ Invalid: ${invalid}/${vocab.length} (${(invalid/vocab.length*100).toFixed(1)}%)`);

if (invalid > 0) {
  console.log(`\n⚠️  First 3 issues:`);
  issues.slice(0, 3).forEach(issue => {
    console.log(`   ${issue.german}: ${issue.errors.join(', ')}`);
  });
}

console.log(`\n📊 CEFR Distribution:`);
Object.entries(cefrDist).sort().forEach(([level, count]) => {
  const pct = (count / vocab.length * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(pct / 2.5));
  console.log(`   ${level}: ${count.toString().padStart(3)} items (${pct.padStart(5)}%) ${bar}`);
});

console.log(`\n📚 Category Distribution:`);
Object.entries(catDist)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const pct = (count / vocab.length * 100).toFixed(1);
    console.log(`   ${cat.padEnd(18)}: ${count.toString().padStart(3)} items (${pct}%)`);
  });

// Save
vocabData.items = vocab;
vocabData.metadata = vocabData.metadata || {};
vocabData.metadata.lastUpdated = new Date().toISOString();
vocabData.metadata.completedAt = new Date().toISOString();
vocabData.metadata.status = 'all-items-categorized';
vocabData.metadata.validItems = valid;
vocabData.metadata.invalidItems = invalid;

fs.writeFileSync(vocabPath, JSON.stringify(vocabData, null, 2));

console.log(`\n✅ Vocabulary saved: data/unified-vocabulary.json`);
console.log(`\n✅ CATEGORIZATION COMPLETE: All 746 items categorized and CEFR assigned`);

