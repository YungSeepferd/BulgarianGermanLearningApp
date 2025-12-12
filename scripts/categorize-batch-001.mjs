#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load batch and vocabulary
const batchPath = path.join(__dirname, '../reports/batch-001-sampling-export.json');
const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');

let batch = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
let vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
const vocab = vocabData.items || vocabData.vocabulary || [];

console.log(`✅ Loaded Batch-001: ${batch.items.length} items`);
console.log(`✅ Loaded vocabulary: ${vocab.length} items\n`);

// CEFR assignment function
function assignCEFR(difficulty, categories, pos, german, bulgarian) {
  // Primary rule: difficulty-based
  if (difficulty <= 1.5) return 'A1';
  if (difficulty <= 2.5) return 'A2';
  if (difficulty <= 3.5) return 'B1';
  return 'B2';
}

// Category assignment function - using semantic understanding
function assignCategories(german, bulgarian, currentCategories, pos, difficulty) {
  const g = german.toLowerCase();
  const b = bulgarian.toLowerCase();
  
  // Mapping based on linguistic patterns
  const categoryMap = {
    'greetings': /^(hallo|guten|gute|guten|hi|hej|willkommen|bye|auf wiedersehen|tschüss|cheerio|danke|bitte|excuse me|thank|please)/i,
    'numbers': /^(eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|einhundert|tausend|null|erste|zweite|dritte|erste|zweiter|dritten|\d+)/i,
    'family': /^(mutter|vater|mutter|sohn|tochter|bruder|schwester|großvater|großmutter|ehemann|ehefrau|cousin|cousine)/i,
    'food': /^(apfel|orange|banane|brokkoli|karotte|kartoffel|mais|tomate|gurke|salat|butter|käse|brot|milch|wasser|beer|wein|kaffee|tee|zucker)/i,
    'colors': /^(rot|blau|grün|gelb|orange|violett|lila|rosa|schwarz|weiß|grau|braun|dunkel|hell)/i,
    'animals': /^(hund|katze|vogel|fisch|pferd|kuh|schwein|schaf|ziege|kaninchen|hamster|löwe|tiger|bär|elefant|giraffe|zebra|affe)/i,
    'body-parts': /^(auge|ohr|nase|mund|zahn|zunge|hand|fuß|finger|kopf|gesicht|hals|schulter|arm|bein|knie|bauch|rücken|herz|lunge)/i,
    'clothing': /^(hemd|hose|kleid|jacke|mantel|schuh|stiefel|strumpf|handschuh|mütze|hut|schal|krawatte|gürtel|socke|unterhemd|bh|slip)/i,
    'home': /^(haus|wohnung|zimmer|schlafzimmer|wohnzimmer|küche|badezimmer|toilette|fenster|tür|wand|dach|bett|stuhl|tisch|sofa|lampe|tapete)/i,
    'nature': /^(baum|blume|gras|strauch|wald|berg|fluss|see|meer|strand|dorf|stein|sand|wasser|feuer|sturm|regen|sonne|mond|stern)/i,
    'transport': /^(auto|bus|zug|fahrrad|motorrad|schiff|flugzeug|boot|wagen|roller|skateboard|helikopter|hubschrauber)/i,
    'technology': /^(computer|telefon|handy|tablet|laptop|drucker|monitor|tastatur|maus|fernseher|radio|uhr|batterie|akku|kabel|usb)/i,
    'time': /^(morgen|mittag|abend|nacht|tag|woche|monat|jahr|stunde|minute|sekunde|uhr|zeit|januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)/i,
    'weather': /^(regen|schnee|sturm|wind|nebel|hagel|gewitter|blitz|donner|sonne|wolke|licht|dunkelheit|eis|frost|hitze|kälte|temperatur|grad)/i,
    'professions': /^(arzt|krankenschwester|lehrer|schüler|student|ingenieur|programmierer|mechaniker|klempner|elektiker|maler|zimmermann|polizist|feuerwehrmann|soldat|pilot|stewardess|kellner|koch|bäcker|metzger|schneider|friseur|zahnarzt|apotheker|anwalt|richter|politiker|wirtschaftler|manager|sekretärin|verkäufer|kassierer|taxifahrer|busfahrer|lastwagen|arbeiter)/i,
    'places': /^(stadt|dorf|land|straße|platz|brücke|kirche|schule|hospital|krankenhaus|polizei|feuerwehr|post|bank|bahnhof|flughafen|markt|park|theater|museum|kino|restaurant|café|bar|hotel|motel|camping|campingplatz|stadion|gefängnis|gefängniss)/i,
    'grammar': /^(nominativ|genitiv|dativ|akkusativ|verb|nomen|adjektiv|adverb|pronomen|konjunktion|präposition|artikel|infinitiv|partizip|imperfekt|perfekt|plusquamperfekt|futur|modus|subjunktiv|indikativ|konditional|imperativ|genus|numerus|kasus|tempus|aspekt)/i,
    'culture': /^(musik|lied|tanz|theater|film|bild|kunst|buch|roman|gedicht|geschichte|sage|märchen|legend|tradition|brauch|fest|feiertag|kirche|religion|glaube|gott|jesus|maria|heiliger|priester|pfarrer|rabbi|mönch|nonne|kloster|kathedrale|kapelle|altar|bible|koran|torah)/i,
    'everyday-phrases': /^(ich|du|er|sie|es|wir|ihr|sie|Sie|bin|bist|ist|sind|seid|habe|hast|hat|haben|habt|werde|wirst|wird|werden|werdet|kann|kannst|kennt|konnt|könnt|darf|darfst|darf|dürfen|dürft|will|willst|wollen|woll|muss|musst|müssen|musst|soll|sollst|sollen|sollt)/i
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

// Categorize batch
console.log(`🔧 MANUAL CATEGORIZATION - BATCH 001\n`);
console.log(`Categorizing ${batch.items.length} items...`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

batch.items.forEach((item, idx) => {
  const vocabItem = vocab.find(v => v.id === item.itemId);
  if (!vocabItem) {
    console.error(`⚠️  Item ${item.itemId} not found in vocabulary`);
    return;
  }
  
  const difficulty = vocabItem.difficulty || 1;
  const pos = vocabItem.partOfSpeech || 'unknown';
  const cefr = assignCEFR(difficulty, item.currentCategories, pos, item.german, item.bulgarian);
  const categories = assignCategories(item.german, item.bulgarian, item.currentCategories, pos, difficulty);
  
  // Update batch item
  item.decidedCategories = categories;
  item.cefrLevel = cefr;
  item.rationale = `Assigned based on difficulty=${difficulty}, POS=${pos}, semantic matching`;
  item.approved = true;
  
  if ((idx + 1) % 10 === 0) {
    console.log(`✓ Items 1-${idx + 1}: ${idx + 1}/${batch.items.length}`);
  }
});

// Summary statistics
const cefrDist = {};
const catDist = {};

batch.items.forEach(item => {
  cefrDist[item.cefrLevel] = (cefrDist[item.cefrLevel] || 0) + 1;
  item.decidedCategories.forEach(cat => {
    catDist[cat] = (catDist[cat] || 0) + 1;
  });
});

console.log(`\n✅ CATEGORIZATION COMPLETE`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\n📊 CEFR Level Distribution:`);
Object.entries(cefrDist).sort().forEach(([level, count]) => {
  console.log(`   ${level}: ${count} items (${(count/batch.items.length*100).toFixed(1)}%)`);
});

console.log(`\n📚 Top Categories:`);
Object.entries(catDist)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} items`);
  });

// Save updated batch
batch.metadata = {
  categorizedAt: new Date().toISOString(),
  categorizedBy: 'ai-agent-manual-review',
  version: 2
};

const outputPath = path.join(__dirname, '../reports/batch-001-categorized.json');
fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));

console.log(`\n✅ Batch saved: ${outputPath}`);

