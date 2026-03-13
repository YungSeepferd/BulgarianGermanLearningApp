#!/usr/bin/env tsx
/**
 * Add Missing Aspect Pairs to Vocabulary
 *
 * This script:
 * 1. Corrects aspect classification for existing verbs
 * 2. Adds missing perfective counterpart verbs
 * 3. Links imperfective ↔ perfective pairs
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Correct aspect pairs and their metadata
// [impfGerman, impfBulgarian, impfTransliteration, pfGerman, pfBulgarian, pfTransliteration]
const aspectPairs: Array<{
  impf: { german: string; bulgarian: string; transliteration: string };
  pf: { german: string; bulgarian: string; transliteration: string };
  category: string;
}> = [
  {
    impf: { german: 'schreiben', bulgarian: 'пиша', transliteration: 'pisha' },
    pf: { german: 'schreiben (fertig)', bulgarian: 'напиша', transliteration: 'napisha' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'lesen', bulgarian: 'чета', transliteration: 'cheta' },
    pf: { german: 'lesen (fertig)', bulgarian: 'прочета', transliteration: 'procheta' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'geben', bulgarian: 'давам', transliteration: 'davam' },
    pf: { german: 'geben', bulgarian: 'дам', transliteration: 'dam' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'sagen', bulgarian: 'казвам', transliteration: 'kazvam' },
    pf: { german: 'sagen', bulgarian: 'кажа', transliteration: 'kazha' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'machen', bulgarian: 'правя', transliteration: 'pravya' },
    pf: { german: 'machen', bulgarian: 'направя', transliteration: 'napravya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'nehmen', bulgarian: 'вземам', transliteration: 'vzemam' },
    pf: { german: 'nehmen', bulgarian: 'взема', transliteration: 'vzema' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'trinken', bulgarian: 'пия', transliteration: 'piya' },
    pf: { german: 'austrinken', bulgarian: 'изпия', transliteration: 'izpiya' },
    category: 'food'
  },
  {
    impf: { german: 'essen', bulgarian: 'ям', transliteration: 'yam' },
    pf: { german: 'aufessen', bulgarian: 'изям', transliteration: 'izyam' },
    category: 'food'
  },
  {
    impf: { german: 'sehen', bulgarian: 'гледам', transliteration: 'gledam' },
    pf: { german: 'sehen', bulgarian: 'видя', transliteration: 'vidya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'kommen', bulgarian: 'идвам', transliteration: 'idvam' },
    pf: { german: 'kommen', bulgarian: 'дойда', transliteration: 'doyda' },
    category: 'transport'
  },
  {
    impf: { german: 'gehen', bulgarian: 'ходя', transliteration: 'hodya' },
    pf: { german: 'gehen', bulgarian: 'отида', transliteration: 'otida' },
    category: 'transport'
  },
  {
    impf: { german: 'kaufen', bulgarian: 'купувам', transliteration: 'kupuvam' },
    pf: { german: 'kaufen', bulgarian: 'купя', transliteration: 'kupya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'verkaufen', bulgarian: 'продавам', transliteration: 'prodavam' },
    pf: { german: 'verkaufen', bulgarian: 'продам', transliteration: 'prodam' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'fragen', bulgarian: 'питам', transliteration: 'pitam' },
    pf: { german: 'fragen', bulgarian: 'попитам', transliteration: 'popitam' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'warten', bulgarian: 'чакам', transliteration: 'chakam' },
    pf: { german: 'warten', bulgarian: 'почакам', transliteration: 'pochakam' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'finden', bulgarian: 'намирам', transliteration: 'namiram' },
    pf: { german: 'finden', bulgarian: 'намеря', transliteration: 'namerya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'verstehen', bulgarian: 'разбирам', transliteration: 'razbiram' },
    pf: { german: 'verstehen', bulgarian: 'разбера', transliteration: 'razbera' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'öffnen', bulgarian: 'отварям', transliteration: 'otvaryam' },
    pf: { german: 'öffnen', bulgarian: 'отворя', transliteration: 'otvorya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'schließen', bulgarian: 'затварям', transliteration: 'zatvaryam' },
    pf: { german: 'schließen', bulgarian: 'затворя', transliteration: 'zatvorya' },
    category: 'everyday-phrases'
  },
  {
    impf: { german: 'aufstehen', bulgarian: 'ставам', transliteration: 'stavam' },
    pf: { german: 'aufstehen', bulgarian: 'стана', transliteration: 'stana' },
    category: 'everyday-phrases'
  }
];

function generateId(): string {
  return 'wv_' + Math.random().toString(36).substring(2, 10);
}

function createVerbItem(
  german: string,
  bulgarian: string,
  transliteration: string,
  aspect: 'imperfective' | 'perfective',
  partnerId: string,
  category: string,
  cefrLevel: string
) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    german,
    bulgarian,
    partOfSpeech: 'verb',
    difficulty: 2,
    cefrLevel,
    categories: [category],
    transliteration: { bulgarian: transliteration },
    emoji: '📝',
    grammar: {
      verbAspect: aspect,
      verbPartnerId: partnerId
    },
    examples: [],
    type: 'word',
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

async function main() {
  console.log('🔄 Adding missing aspect pairs...\n');

  // Load A1 vocabulary
  const a1File = 'data/vocabulary/A1.json';
  const content = fs.readFileSync(a1File, 'utf8');
  const data = JSON.parse(content);

  if (!Array.isArray(data)) {
    console.error('Invalid data format');
    process.exit(1);
  }

  // Create lookup by Bulgarian
  const byBulgarian = new Map<string, typeof data[0]>();
  for (const item of data) {
    byBulgarian.set(item.bulgarian.toLowerCase(), item);
  }

  let pairsCreated = 0;
  let verbsAdded = 0;

  for (const pair of aspectPairs) {
    const impfBg = pair.impf.bulgarian.toLowerCase();
    const pfBg = pair.pf.bulgarian.toLowerCase();

    let impfVerb = byBulgarian.get(impfBg);
    let pfVerb = byBulgarian.get(pfBg);

    // Update or create imperfective verb
    if (impfVerb) {
      // Update existing
      if (!impfVerb.grammar) impfVerb.grammar = {};
      impfVerb.grammar.verbAspect = 'imperfective';
      if (pfVerb) {
        impfVerb.grammar.verbPartnerId = pfVerb.id;
      }
      console.log(`  ✓ Updated imperfective: ${impfVerb.german} - ${impfVerb.bulgarian}`);
    }

    // Create perfective verb if missing
    if (!pfVerb) {
      const newPfId = generateId();
      pfVerb = createVerbItem(
        pair.pf.german,
        pair.pf.bulgarian,
        pair.pf.transliteration,
        'perfective',
        impfVerb?.id || '',
        pair.category,
        'A1'
      );
      data.push(pfVerb);
      byBulgarian.set(pfBg, pfVerb);
      verbsAdded++;
      console.log(`  + Added perfective: ${pfVerb.german} - ${pfVerb.bulgarian}`);
    } else {
      // Update existing perfective
      if (!pfVerb.grammar) pfVerb.grammar = {};
      pfVerb.grammar.verbAspect = 'perfective';
      if (impfVerb) {
        pfVerb.grammar.verbPartnerId = impfVerb.id;
      }
      console.log(`  ✓ Updated perfective: ${pfVerb.german} - ${pfVerb.bulgarian}`);
    }

    // Link the pair
    if (impfVerb && pfVerb) {
      impfVerb.grammar.verbPartnerId = pfVerb.id;
      pfVerb.grammar.verbPartnerId = impfVerb.id;
      pairsCreated++;
    }
  }

  // Save updated data
  fs.writeFileSync(a1File, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\n📊 Summary:`);
  console.log(`  Pairs created/updated: ${pairsCreated}`);
  console.log(`  New verbs added: ${verbsAdded}`);
  console.log(`  Total verbs now: ${data.filter((i: any) => i.partOfSpeech === 'verb').length}`);

  console.log('\n✅ Aspect pairs added!');
}

main().catch(console.error);
