#!/usr/bin/env tsx
/**
 * Reclassify Verbs from Phrase to Verb partOfSpeech
 *
 * Identifies single-word verbs misclassified as phrases and reclassifies them.
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Known single-word German verbs
const germanVerbs = new Set([
  'anfangen', 'beginnen', 'aufhören', 'anhalten', 'stoppen', 'aufstehen', 'stehen',
  'anziehen', 'ausziehen', 'tragen', 'kleiden', 'legen', 'setzen', 'stellen',
  'arbeiten', 'lernen', 'studieren', 'lehren', 'unterrichten',
  'beenden', 'abschließen', 'fertigstellen', 'schließen', 'öffnen',
  'bekommen', 'erhalten', 'kriegen', 'empfangen',
  'benutzen', 'verwenden', 'nutzen', 'gebrauchen', 'benützen',
  'bezahlen', 'zahlen', 'abrechnen', 'blechen', 'zahlen',
  'bitten', 'fragen', 'ersuchen', 'bitten',
  'bleiben', 'verbleiben', 'dauern', 'warten', 'harren',
  'danken', 'grüßen', 'begrüßen', 'bedanken',
  'einkaufen', 'kaufen', 'verkaufen', 'bestellen', 'shoppen',
  'entschuldigen', 'verzeihen', 'vergeben', 'entschuldigen',
  'essen', 'trinken', 'schmecken', 'kochen', 'backen', 'braten', 'sieden',
  'fahren', 'gehen', 'laufen', 'reisen', 'kommen', 'ankommen',
  'fangen', 'ergreifen', 'halten', 'nehmen', 'greifen',
  'finden', 'suchen', 'entdecken', 'erfahren', 'wissen',
  'fortsetzen', 'weitermachen', 'setzen',
  'fühlen', 'führen', 'empfinden', 'spüren',
  'geben', 'schenken', 'reichen', 'übergeben', 'spenden',
  'gehen', 'laufen', 'schreiten', 'wandeln', 'spazieren',
  'glauben', 'meinen', 'denken', 'glauben', 'trauen',
  'haben', 'besitzen', 'halten',
  'heißen', 'nennen', 'rufen', 'schreien', 'heißen',
  'helfen', 'unterstützen', 'assistieren', 'beistehen',
  'kennen', 'wissen', 'kennenlernen',
  'kommen', 'ankommen', 'eintreffen', 'gelangen',
  'können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen', 'möchten',
  'lassen', 'erlauben', 'gestatten',
  'liegen', 'sitzen', 'hängen',
  'machen', 'tun', 'herstellen', 'produzieren', 'anfertigen',
  'nehmen', 'bringen', 'holen',
  'regnen', 'schneien', 'donnern', 'blitzen', 'nieseln',
  'sagen', 'sprechen', 'reden', 'äußern', 'berichten',
  'schlafen', 'ruhen', 'schlummern', 'dösen',
  'schreiben', 'dichten', 'verfassen',
  'sehen', 'gucken', 'schauen', 'blicken', 'gucken',
  'sein', 'werden', 'existieren', 'leben',
  'singen', 'trällern', 'summen',
  'spielen', 'spielen', 'tun',
  'sprechen', 'reden', 'sagen',
  'studieren', 'lernen',
  'suchen', 'finden', 'fahnden',
  'tanzen', 'tänzeln', 'hüpfen',
  'tragen', 'bringen',
  'treffen', 'begegnen', 'antreffen', 'auffinden',
  'trinken', 'saufen', 'schlürfen', 'sippen',
  'tun', 'machen',
  'verlieren', 'verlegen', 'verschlammern',
  'verstehen', 'begreifen', 'kapieren', 'checken',
  'warten', 'harren', 'ausharren',
  'waschen', 'reinigen', 'putzen', 'säubern',
  'werden', 'wachsen', 'reifen', 'entstehen',
  'wissen', 'kennen',
  'wohnen', 'leben', 'residieren', 'hausen'
]);

// Bulgarian verb patterns (dictionary form - first person singular)
const bulgarianVerbPatterns = [
  /вам$/, /ям$/, /ша$/, /ща$/, /[ая]м$/, /се$/, /си$/
];

// False positives - Bulgarian words that look like verbs but are nouns
const falsePositives = new Set([
  'аптека', 'баня', 'банка', 'работа', 'почивка', 'сутрин', 'вечеря', 'вечер',
  'минута', 'седмица', 'секунда', 'година', 'кухня', 'спалня', 'спал',
  'пола', 'риза', 'рокля', 'зала', 'цветя', 'глава', 'ръка', 'нога', 'коса',
  'зъб', 'уста', 'ухо', 'сърце', 'седем', 'осем', 'девет', 'десет', 'сто',
  'хиляда', 'милион', 'човек', 'всички', 'някои', 'други', 'много', 'малко',
  'повече', 'най', 'къща', 'маса', 'карта', 'чаша', 'врата', 'такси', 'изпит',
  'храна', 'конец', 'градина', 'летище', 'благодаря', 'моля'
]);

async function main() {
  console.log('🔄 Reclassifying verbs...\n');

  const files = await glob('data/vocabulary/*.json');
  let totalReclassified = 0;
  const reclassified: Array<{file: string, id: string, german: string, bulgarian: string}> = [];

  for (const file of files) {
    if (file.includes('index') || file.includes('search')) continue;

    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) continue;

    let fileReclassified = 0;

    for (const item of data) {
      if (item.partOfSpeech !== 'phrase') continue;

      // Check if it's a single-word German verb
      const de = item.german.toLowerCase().trim();
      const bg = item.bulgarian.toLowerCase().trim();

      // Must be single words (no spaces or very short phrases)
      if (de.includes(' ') || bg.includes(' ')) continue;
      if (de.length < 3 || bg.length < 3) continue;

      // Skip false positives
      if (falsePositives.has(bg)) continue;

      // Check German
      const isGermanVerb = germanVerbs.has(de) || de.endsWith('en') || de.endsWith('eln') || de.endsWith('ern');

      // Check Bulgarian
      const isBulgarianVerb = bulgarianVerbPatterns.some(p => p.test(bg));

      if (isGermanVerb && isBulgarianVerb) {
        item.partOfSpeech = 'verb';
        // Initialize grammar if not present
        if (!item.grammar) {
          item.grammar = {};
        }
        fileReclassified++;
        reclassified.push({
          file: path.basename(file),
          id: item.id,
          german: item.german,
          bulgarian: item.bulgarian
        });
      }
    }

    if (fileReclassified > 0) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  ✅ ${path.basename(file)}: ${fileReclassified} reclassified`);
      totalReclassified += fileReclassified;
    }
  }

  console.log(`\n📊 Total reclassified: ${totalReclassified} verbs\n`);

  if (reclassified.length > 0) {
    console.log('📝 Reclassified items:');
    reclassified.slice(0, 20).forEach(v => {
      console.log(`  ${v.german} - ${v.bulgarian} (${v.file})`);
    });
    if (reclassified.length > 20) {
      console.log(`  ... and ${reclassified.length - 20} more`);
    }
  }

  console.log('\n✅ Reclassification complete!');
}

main().catch(console.error);
