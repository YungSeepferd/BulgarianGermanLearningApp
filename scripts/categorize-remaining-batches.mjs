#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
let vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
const vocab = vocabData.items || vocabData.vocabulary || [];

console.log(`🔧 CATEGORIZING REMAINING 646 ITEMS (BATCHES 2-4)\n`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Category assignment function  
function assignCategories(german, bulgarian, pos, difficulty) {
  const g = german.toLowerCase();
  const b = bulgarian.toLowerCase();
  
  const categoryMap = {
    'greetings': /^(hallo|guten|gute|hi|hej|willkommen|bye|auf wiedersehen|tschüss|cheerio|danke|bitte)/i,
    'numbers': /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|einhundert|tausend|null|erste|zweite)/i,
    'family': /^(mutter|vater|sohn|tochter|bruder|schwester|großvater|großmutter|ehemann|ehefrau|cousin)/i,
    'food': /^(apfel|orange|banane|brokkoli|karotte|kartoffel|mais|tomate|gurke|salat|butter|käse|brot|milch|wasser|beer|wein|kaffee|tee|zucker)/i,
    'colors': /^(rot|blau|grün|gelb|orange|violett|lila|rosa|schwarz|weiß|grau|braun)/i,
    'animals': /^(hund|katze|vogel|fisch|pferd|kuh|schwein|schaf|ziege|kaninchen|hamster|löwe|tiger|bär|elefant)/i,
    'body-parts': /^(auge|ohr|nase|mund|zahn|zunge|hand|fuß|finger|kopf|gesicht|hals|schulter|arm|bein|knie)/i,
    'clothing': /^(hemd|hose|kleid|jacke|mantel|schuh|stiefel|strumpf|handschuh|mütze|hut|schal|krawatte)/i,
    'home': /^(haus|wohnung|zimmer|schlafzimmer|wohnzimmer|küche|badezimmer|toilette|fenster|tür|wand|dach|bett)/i,
    'nature': /^(baum|blume|gras|strauch|wald|berg|fluss|see|meer|strand|dorf|stein|sand|wasser|feuer|regen)/i,
    'transport': /^(auto|bus|zug|fahrrad|motorrad|schiff|flugzeug|boot|wagen|roller|skateboard)/i,
    'technology': /^(computer|telefon|handy|tablet|laptop|drucker|monitor|tastatur|maus|fernseher|radio|uhr)/i,
    'time': /^(morgen|mittag|abend|nacht|tag|woche|monat|jahr|stunde|minute|sekunde|uhr|zeit|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i,
    'weather': /^(regen|schnee|sturm|wind|nebel|hagel|gewitter|blitz|donner|sonne|wolke|eis|frost|hitze)/i,
    'professions': /^(arzt|krankenschwester|lehrer|schüler|student|ingenieur|programmierer|mechaniker|polizist|feuerwehrmann|pilot|stewardess|kellner|koch|bäcker|metzger|schneider|friseur|zahnarzt)/i,
    'places': /^(stadt|dorf|land|straße|platz|brücke|kirche|schule|hospital|krankenhaus|polizei|feuerwehr|post|bank|bahnhof|flughafen|markt|park|theater|museum|kino|restaurant|café|hotel)/i,
    'grammar': /^(nominativ|genitiv|dativ|akkusativ|verb|nomen|adjektiv|adverb|pronomen|konjunktion|präposition|artikel|infinitiv|partizip|imperfekt|perfekt|futur|modus|subjunktiv|imperativ)/i,
    'culture': /^(musik|lied|tanz|theater|film|bild|kunst|buch|roman|gedicht|geschichte|sage|märchen|legend|tradition|brauch|fest|feiertag|kirche|religion|glaube|gott|priester)/i,
    'everyday-phrases': /^(ich|du|er|sie|es|wir|ihr|Sie|bin|bist|ist|sind|habe|hast|hat|haben|werde|wird|werden|kann|kennst|darf|will|muss|soll)/i
  };
  
  const matched = [];
  for (const [cat, pattern] of Object.entries(categoryMap)) {
    if (pattern.test(g)) {
      matched.push(cat);
      if (matched.length >= 2) break;
    }
  }
  
  return matched.length > 0 ? matched : ['everyday-phrases'];
}

// CEFR assignment
function assignCEFR(difficulty) {
  if (difficulty <= 1.5) return 'A1';
  if (difficulty <= 2.5) return 'A2';
  if (difficulty <= 3.5) return 'B1';
  return 'B2';
}

// Find uncategorized items
const uncategorized = vocab.filter(item => !item.cefrLevel);
console.log(`Found ${uncategorized.length} items needing categorization\n`);

// Process all uncategorized items
let processed = 0;
uncategorized.forEach((item, idx) => {
  const difficulty = item.difficulty || 1;
  const pos = item.partOfSpeech || 'unknown';
  
  item.cefrLevel = assignCEFR(difficulty);
  if (!item.categories || item.categories.length === 0) {
    item.categories = assignCategories(item.german, item.bulgarian, pos, difficulty);
  }
  
  if ((idx + 1) % 100 === 0) {
    console.log(`✓ Processed ${idx + 1}/${uncategorized.length} items`);
  }
  processed++;
});

console.log(`✅ Processed ${processed} items\n`);

// Validation
const cefrDist = {};
const catDist = {};

vocab.forEach(item => {
  const level = item.cefrLevel || 'unset';
  cefrDist[level] = (cefrDist[level] || 0) + 1;
  
  if (item.categories) {
    item.categories.forEach(cat => {
      catDist[cat] = (catDist[cat] || 0) + 1;
    });
  }
});

console.log(`📊 FINAL CEFR Distribution (all ${vocab.length} items):`);
Object.entries(cefrDist).sort().forEach(([level, count]) => {
  const pct = (count / vocab.length * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(pct / 2.5));
  console.log(`   ${level}: ${count.toString().padStart(3)} items (${pct.padStart(5)}%) ${bar}`);
});

console.log(`\n📚 Top 10 Categories:`);
Object.entries(catDist)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => {
    const pct = (count / vocab.length * 100).toFixed(1);
    console.log(`   ${cat.padEnd(18)}: ${count.toString().padStart(3)} items (${pct}%)`);
  });

// Save updated vocabulary
vocabData.items = vocab;
vocabData.metadata = vocabData.metadata || {};
vocabData.metadata.lastUpdated = new Date().toISOString();
vocabData.metadata.updatedBy = 'bulk-categorization-batches-2-4';
vocabData.metadata.allBatchesApplied = 'batch-001-to-004';

fs.writeFileSync(vocabPath, JSON.stringify(vocabData, null, 2));

console.log(`\n✅ Vocabulary saved: data/unified-vocabulary.json`);

// Save summary
const summaryPath = path.join(__dirname, '../reports/BULK-CATEGORIZATION-SUMMARY.json');
fs.writeFileSync(summaryPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalItemsProcessed: processed,
  cefrDistribution: cefrDist,
  categoryDistribution: Object.fromEntries(
    Object.entries(catDist).sort((a, b) => b[1] - a[1]).slice(0, 20)
  ),
  allItemsCategorized: !Object.values(cefrDist).includes(0) && !cefrDist['unset']
}, null, 2));

console.log(`✅ Summary saved: BULK-CATEGORIZATION-SUMMARY.json`);
console.log(`\n✅ ALL BATCHES CATEGORIZED SUCCESSFULLY`);

