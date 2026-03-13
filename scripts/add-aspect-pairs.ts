#!/usr/bin/env tsx
/**
 * Add Verb Aspect Information and Pairs
 *
 * This script:
 * 1. Identifies verb aspect (imperfective vs perfective)
 * 2. Creates aspect pairs between related verbs
 * 3. Adds grammar.verbAspect and grammar.verbPartnerId
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Known aspect pairs - imperfective → perfective
const knownAspectPairs: Array<[string, string, string, string]> = [
  // [impfGerman, impfBulgarian, pfGerman, pfBulgarian]
  ['lesen', 'чета', 'lesen', 'прочета'],
  ['schreiben', 'пиша', 'schreiben', 'напиша'],
  ['sprechen', 'говоря', 'sagen', 'кажа'],
  ['essen', 'ям', 'essen', 'изям'],
  ['trinken', 'пия', 'trinken', 'изпия'],
  ['machen', 'правя', 'machen', 'направя'],
  ['sehen', 'гледам', 'sehen', 'погледна'],
  ['nehmen', 'вземам', 'nehmen', 'взема'],
  ['geben', 'давам', 'geben', 'дам'],
  ['sagen', 'казвам', 'sagen', 'кажа'],
  ['fragen', 'питам', 'fragen', 'попитам'],
  ['warten', 'чакам', 'warten', 'почакам'],
  ['arbeiten', 'работя', 'arbeiten', 'поработя'],
  ['kommen', 'идвам', 'kommen', 'дойда'],
  ['gehen', 'ходя', 'gehen', 'ида'],
  ['aufstehen', 'ставам', 'aufstehen', 'стана'],
  ['schlafen', 'спя', 'schlafen', 'заспя'],
  ['wohnen', 'живея', 'wohnen', 'поживея'],
  ['finden', 'намирам', 'finden', 'намеря'],
  ['lernen', 'уча', 'lernen', 'науча'],
  ['tragen', 'обличам', 'tragen', 'облека'],
  ['öffnen', 'отварям', 'öffnen', 'отворя'],
  ['schließen', 'затварям', 'schließen', 'затворя'],
  ['kaufen', 'купувам', 'kaufen', 'купя'],
  ['verkaufen', 'продавам', 'verkaufen', 'продам'],
  ['beginnen', 'започвам', 'beginnen', 'започна'],
  ['hören', 'слушам', 'hören', 'чуя'],
  ['wissen', 'зная', 'wissen', 'науча'],
  ['verstehen', 'разбирам', 'verstehen', 'разбера'],
  ['lesen', 'чета', 'lesen', 'прочета']
];

// Perfective prefixes in Bulgarian
const perfectivePrefixes = ['на', 'по', 'про', 'из', 'въз', 'за', 'пре', 'от', 'под', 'с', 'в'];

// Imperfective suffixes (dictionary form)
const imperfectiveIndicators = ['вам', 'ам', 'ям', 'я', 'а', 'шеш', 'ят', 'ят', 'ете'];

interface VerbInfo {
  id: string;
  german: string;
  bulgarian: string;
  file: string;
  aspect?: 'imperfective' | 'perfective';
  partnerId?: string;
}

function detectAspect(german: string, bulgarian: string): 'imperfective' | 'perfective' | null {
  const bg = bulgarian.toLowerCase();

  // Check for perfective prefixes
  for (const prefix of perfectivePrefixes) {
    if (bg.startsWith(prefix)) {
      // Additional check: if the word without prefix is also a valid stem
      // then it's likely perfective
      const withoutPrefix = bg.slice(prefix.length);
      if (withoutPrefix.length > 3) {
        return 'perfective';
      }
    }
  }

  // Check for imperfective indicators (not definitive but suggestive)
  if (bg.endsWith('вам') || bg.endsWith('ам') || bg.endsWith('ям')) {
    return 'imperfective';
  }

  // Check if in known pairs as imperfective
  for (const [impfGer, impfBg] of knownAspectPairs) {
    if (german.toLowerCase() === impfGer && bg === impfBg) {
      return 'imperfective';
    }
  }

  // Check if in known pairs as perfective
  for (const [, , pfGer, pfBg] of knownAspectPairs) {
    if (german.toLowerCase() === pfGer && bg === pfBg) {
      return 'perfective';
    }
  }

  // Default assumption: most basic verbs are imperfective
  return 'imperfective';
}

async function main() {
  console.log('🔍 Analyzing verb aspects...\n');

  const files = await glob('data/vocabulary/*.json');
  const verbs: VerbInfo[] = [];

  // Load all verbs
  for (const file of files) {
    if (file.includes('index') || file.includes('search')) continue;

    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) continue;

    for (const item of data) {
      if (item.partOfSpeech === 'verb') {
        verbs.push({
          id: item.id,
          german: item.german,
          bulgarian: item.bulgarian,
          file,
          aspect: item.grammar?.verbAspect,
          partnerId: item.grammar?.verbPartnerId
        });
      }
    }
  }

  console.log(`Found ${verbs.length} verbs\n`);

  // Detect aspects for verbs that don't have one
  let aspectDetected = 0;
  for (const verb of verbs) {
    if (!verb.aspect) {
      const detected = detectAspect(verb.german, verb.bulgarian);
      if (detected) {
        verb.aspect = detected;
        aspectDetected++;
      }
    }
  }

  console.log(`📊 Detected aspect for ${aspectDetected} verbs\n`);

  // Create lookup maps
  const byBulgarian = new Map<string, VerbInfo[]>();
  const byGerman = new Map<string, VerbInfo[]>();

  for (const verb of verbs) {
    const bgKey = verb.bulgarian.toLowerCase();
    const deKey = verb.german.toLowerCase();

    if (!byBulgarian.has(bgKey)) byBulgarian.set(bgKey, []);
    if (!byGerman.has(deKey)) byGerman.set(deKey, []);

    byBulgarian.get(bgKey)!.push(verb);
    byGerman.get(deKey)!.push(verb);
  }

  // Find pairs
  let pairsFound = 0;

  for (const [impfGer, impfBg, pfGer, pfBg] of knownAspectPairs) {
    const impfVerbs = byBulgarian.get(impfBg) || [];
    const pfVerbs = byBulgarian.get(pfBg) || [];

    for (const impf of impfVerbs) {
      for (const pf of pfVerbs) {
        // Match found - set partner IDs
        if (!impf.partnerId) {
          impf.partnerId = pf.id;
          pairsFound++;
        }
        if (!pf.partnerId) {
          pf.partnerId = impf.id;
        }
      }
    }
  }

  console.log(`🔗 Found ${pairsFound} aspect pairs\n`);

  // Save changes back to files
  let updatedFiles = 0;
  for (const file of files) {
    if (file.includes('index') || file.includes('search')) continue;

    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) continue;

    let fileUpdated = false;

    for (const item of data) {
      if (item.partOfSpeech !== 'verb') continue;

      const verb = verbs.find(v => v.id === item.id);
      if (!verb) continue;

      if (!item.grammar) item.grammar = {};

      if (verb.aspect && !item.grammar.verbAspect) {
        item.grammar.verbAspect = verb.aspect;
        fileUpdated = true;
      }

      if (verb.partnerId && !item.grammar.verbPartnerId) {
        item.grammar.verbPartnerId = verb.partnerId;
        fileUpdated = true;
      }
    }

    if (fileUpdated) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
      console.log(`  ✅ ${path.basename(file)} updated`);
      updatedFiles++;
    }
  }

  console.log(`\n📊 Updated ${updatedFiles} files`);

  // Show sample pairs
  console.log('\n📝 Sample aspect pairs:');
  const pairedVerbs = verbs.filter(v => v.partnerId).slice(0, 10);
  for (const v of pairedVerbs) {
    const partner = verbs.find(p => p.id === v.partnerId);
    if (partner) {
      console.log(`  ${v.german} - ${v.bulgarian} [${v.aspect}]`);
      console.log(`    → ${partner.german} - ${partner.bulgarian} [${partner.aspect}]`);
    }
  }

  // Stats
  const withAspect = verbs.filter(v => v.aspect).length;
  const withPartner = verbs.filter(v => v.partnerId).length;
  const impfCount = verbs.filter(v => v.aspect === 'imperfective').length;
  const pfCount = verbs.filter(v => v.aspect === 'perfective').length;

  console.log(`\n📈 Final stats:`);
  console.log(`  Total verbs: ${verbs.length}`);
  console.log(`  With aspect: ${withAspect}`);
  console.log(`  With partner: ${withPartner}`);
  console.log(`  Imperfective: ${impfCount}`);
  console.log(`  Perfective: ${pfCount}`);

  console.log('\n✅ Aspect pair assignment complete!');
}

main().catch(console.error);
