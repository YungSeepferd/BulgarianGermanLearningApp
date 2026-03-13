#!/usr/bin/env tsx
/**
 * Find Verbs Misclassified as Phrases
 */

import fs from 'fs';
import { glob } from 'glob';

// Common Bulgarian verb dictionary forms (first person singular present)
// These are the most reliable patterns for Bulgarian verbs
const verbPatterns = [
  /вам$/,       // First conjugation: работЯ (often -вам in dictionary form: работя)
  /ям$/,        // ям
  /ша$/,        // -ша pattern: пиша
  /ща$/,        // искам pattern: ща -> искам
  /[ая]м$/,     // -ам/-ям: чета (in some dialects)
  /се$/,        // Reflexive verbs ending in -се
  /си$/        // Reflexive verbs ending in -си
];

// German verbs that are very commonly in the vocabulary
const knownGermanVerbs = new Set([
  'anfangen', 'beginnen', 'anhalten', 'stoppen', 'aufhören', 'anhören', 'aufstehen', 'werden', 'stehen',
  'anmachen', 'ausmachen', 'aufmachen', 'zumachen', 'schließen', 'öffnen',
  'anziehen', 'ausziehen', 'tragen', 'kleiden',
  'arbeiten', 'lernen', 'studieren', 'lehren', 'unterrichten',
  'beenden', 'abschließen', 'fertigstellen', 'schließen',
  'bekommen', 'erhalten', 'kriegen', 'empfangen',
  'benutzen', 'verwenden', 'nutzen', 'gebrauchen',
  'bezahlen', 'zahlen', 'abrechnen',
  'bitten', 'fragen', 'betragen', 'ersuchen',
  'bleiben', 'verbleiben', 'dauern', 'warten',
  'danken', 'grüßen', 'begrüßen',
  'einkaufen', 'kaufen', 'verkaufen', 'bestellen',
  'entschuldigen', 'verzeihen', 'vergeben',
  'essen', 'trinken', 'schmecken', 'kochen', 'backen',
  'fahren', 'fahren', 'gehen', 'laufen', 'reisen', 'kommen',
  'fangen', 'ergreifen', 'halten', 'nehmen',
  'finden', 'suchen', 'entdecken', 'erfahren',
  'fortsetzen', 'weitermachen', 'setzen', 'stellen', 'legen',
  'fühlen', 'führen', 'gehen', 'machen', 'tun',
  'geben', 'schenken', 'reichen', 'übergeben',
  'gehen', 'laufen', 'schreiten', 'wandeln',
  'glauben', 'meinen', 'denken', 'glauben',
  'haben', 'besitzen', 'haben', 'halten',
  'heißen', 'nennen', 'rufen', 'schreien',
  'helfen', 'unterstützen', 'beisten', 'assistieren',
  'kennen', 'wissen', 'kennenlernen', 'wissen',
  'kommen', 'ankommen', 'eintreffen', 'gelangen',
  'können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen',
  'lassen', 'erlauben', 'gestatten',
  'liegen', 'stehen', 'sitzen', 'hängen',
  'machen', 'tun', 'herstellen', 'produzieren',
  'nehmen', 'bringen', 'holen', 'tragen',
  'regnen', 'schneien', 'donnern', 'blitzen',
  'sagen', 'sprechen', 'reden', 'äußern',
  'schlafen', 'schlafen', 'ruhen', 'schlummern',
  'schreiben', 'schreiben', 'dichten', 'verfassen',
  'sehen', 'gucken', 'schauen', 'blicken',
  'sein', 'werden', 'bleiben', 'existieren',
  'setzen', 'stellen', 'legen', 'lagern',
  'singen', 'singen', 'trällern', 'summen',
  'spielen', 'spielen', 'schauen', 'gucken',
  'sprechen', 'reden', 'sagen', 'äußern',
  'stehen', 'stehen', 'liegen', 'sitzen',
  'studieren', 'lernen', 'lernen', 'studieren',
  'suchen', 'finden', 'suchen', 'fahnden',
  'tanzen', 'tanzen', 'tänzeln', 'hüpfen',
  'tragen', 'tragen', 'bringen', 'tragen',
  'treffen', 'begegnen', 'antreffen', 'auffinden',
  'trinken', 'saufen', 'schlürfen', 'sippen',
  'tun', 'machen', 'tun', 'machen',
  'verlieren', 'verlieren', 'verlegen', 'verschlammern',
  'verstehen', 'verstehen', 'begreifen', 'kapieren',
  'warten', 'warten', 'harren', 'ausharren',
  'waschen', 'waschen', 'reinigen', 'putzen',
  'werden', 'werden', 'wachsen', 'reifen',
  'wissen', 'kennen', 'wissen', 'kennen',
  'wohnen', 'wohnen', 'leben', 'residieren'
]);

// Bulgarian words that are NOT verbs despite endings
const falsePositives = new Set([
  'а', 'я', 'и', 'те', 'ме', 'ви', 'ни', 'го', 'се', 'си', 'му', 'й', 'с',
  'къща', 'каса', 'маса', 'карта', 'аптека', 'работа', 'вечеря', 'почивка',
  'сутрин', 'вечер', 'седмица', 'минута', 'секунда', 'година', 'врата',
  'кухня', 'спалня', 'баня', 'маза', 'таван', 'пола', 'риза', 'рокля',
  'зала', 'листа', 'цветя', 'врата', 'глава', 'ръка', 'нога', 'коса',
  'зъб', 'зъби', 'уста', 'ухо', 'уши', 'око', 'очи', 'сърце', 'сърца',
  'седем', 'осем', 'девет', 'десет', 'сто', 'хиляда', 'милион',
  'осемнадесет', 'осемдесет', 'деветнадесет', 'деветдесет',
  'всички', 'някои', 'други', 'много', 'малко', 'повече', 'най',
  'гаран', 'баня', 'главна', 'задна', 'предна', 'лява', 'дясна',
  'карт', 'аптек', 'банк', 'ста', 'кухн', 'спалн', 'работ', 'почивк',
  'сутрин', 'минут', 'секунд', 'седмиц', 'годин', 'врат', 'вратите',
  'къщ', 'къщата', 'мас', 'масата', 'карт', 'картата', 'аптеката',
  'работата', 'вечерята', 'почивката', 'седмицата', 'минутата',
  'годината', 'вратата', 'кухнята', 'спалнята', 'банята', 'полата',
  'ризата', 'роклята', 'залата', 'листата', 'главата', 'ръката',
  'ногата', 'косата', 'зъба', 'зъбите', 'устата', 'ухото', 'ушите',
  'окото', 'очите', 'сърцето', 'сърцата'
]);

// German verb patterns (infinitives)
const germanVerbPatterns = [
  /en$/,        // Most German infinitives end in -en
  /eln$/,       // Some verbs: lächeln
  /ern$/       // Some verbs: wandern
];

async function main() {
  const files = await glob('data/vocabulary/*.json');
  const potentialVerbs: Array<{
    id: string;
    german: string;
    bulgarian: string;
    reason: string;
  }> = [];

  for (const file of files) {
    if (file.includes('index') || file.includes('search')) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data)) continue;

    for (const item of data) {
      if (item.partOfSpeech !== 'phrase') continue;

      const de = item.german.toLowerCase().trim();
      const bg = item.bulgarian.toLowerCase().trim();

      // Skip known false positives
      if (falsePositives.has(bg)) continue;
      // Also check without trailing а/я/и
      const bgStem = bg.replace(/[аяи]$/, '');
      if (falsePositives.has(bgStem)) continue;

      // Extract single words from German (remove parenthetical notes)
      const deWords = de.split(/[\s,\/]+/).map(w => w.replace(/[()]/g, '').trim()).filter(w => w.length > 2);

      // Check if any German word is a known verb or looks like an infinitive
      const isGermanVerb = deWords.length > 0 && deWords.some(word =>
        knownGermanVerbs.has(word) || germanVerbPatterns.some(p => p.test(word))
      );

      // Check if Bulgarian has verb endings (single word only, excluding short words)
      const bgWords = bg.split(/[\s,\/]+/).filter(w => w.length > 3);
      const isBulgarianVerb = bgWords.length > 0 && bgWords.some(word =>
        verbPatterns.some(p => p.test(word))
      );

      // Additional heuristics - Bulgarian verb markers
      const verbMarkerPattern = /\b(да|ще|съм|си|е|сме|сте|са)\b/;
      const hasVerbMarkers = verbMarkerPattern.test(bg);

      if (isGermanVerb || isBulgarianVerb || hasVerbMarkers) {
        const reasons = [];
        if (isGermanVerb) reasons.push('German -en ending');
        if (isBulgarianVerb) reasons.push('Bulgarian verb ending');
        if (hasVerbMarkers) reasons.push('Has verb markers');

        potentialVerbs.push({
          id: item.id,
          german: item.german,
          bulgarian: item.bulgarian,
          reason: reasons.join(', ')
        });
      }
    }
  }

  console.log(`Found ${potentialVerbs.length} potential verbs misclassified as phrases:\n`);
  potentialVerbs.slice(0, 30).forEach(v => {
    console.log(`  ${v.german} - ${v.bulgarian}`);
    console.log(`    Reason: ${v.reason}`);
    console.log();
  });

  if (potentialVerbs.length > 30) {
    console.log(`  ... and ${potentialVerbs.length - 30} more`);
  }
}

main();
