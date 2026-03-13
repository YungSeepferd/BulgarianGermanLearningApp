#!/usr/bin/env tsx
/**
 * Verify Aspect Pairs
 */

import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/vocabulary/A1.json', 'utf8'));
const verbs = data.filter((i: any) => i.partOfSpeech === 'verb');

console.log('\n📊 VERB ASPECT PAIRS SUMMARY\n');
console.log('Imperfective → Perfective pairs:');
verbs
  .filter((v: any) => v.grammar?.verbAspect === 'imperfective' && v.grammar?.verbPartnerId)
  .forEach((v: any) => {
    const partner = verbs.find((p: any) => p.id === v.grammar.verbPartnerId);
    if (partner) {
      console.log(`  ${v.german} - ${v.bulgarian} → ${partner.german} - ${partner.bulgarian}`);
    }
  });

console.log('\nStandalone verbs (no pair):');
verbs
  .filter((v: any) => !v.grammar?.verbPartnerId)
  .forEach((v: any) => {
    console.log(`  ${v.german} - ${v.bulgarian} [${v.grammar?.verbAspect || 'unknown'}]`);
  });

const impfCount = verbs.filter((v: any) => v.grammar?.verbAspect === 'imperfective').length;
const pfCount = verbs.filter((v: any) => v.grammar?.verbAspect === 'perfective').length;
const pairedCount = verbs.filter((v: any) => v.grammar?.verbPartnerId).length;

console.log(`\n📈 Stats:`);
console.log(`  Total verbs: ${verbs.length}`);
console.log(`  Imperfective: ${impfCount}`);
console.log(`  Perfective: ${pfCount}`);
console.log(`  With pairs: ${pairedCount / 2} pairs (${pairedCount} verbs)`);
