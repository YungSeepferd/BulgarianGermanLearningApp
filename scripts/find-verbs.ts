#!/usr/bin/env tsx
/**
 * Find and Analyze Verbs in Vocabulary
 *
 * Identifies all verbs and their current aspect status
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface VerbInfo {
  id: string;
  german: string;
  bulgarian: string;
  file: string;
  aspect?: string;
  partnerId?: string;
  hasGrammar: boolean;
}

async function findVerbs(): Promise<VerbInfo[]> {
  const vocabDir = 'data/vocabulary';
  const files = await glob('*.json', { cwd: vocabDir });
  const verbs: VerbInfo[] = [];

  for (const file of files) {
    if (file === 'index.json' || file === 'search-index.json') continue;

    const content = await fs.readFile(path.join(vocabDir, file), 'utf-8');
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
          partnerId: item.grammar?.verbPartnerId,
          hasGrammar: !!item.grammar
        });
      }
    }
  }

  return verbs;
}

async function main() {
  console.log('🔍 Analyzing verbs in vocabulary...\n');

  const verbs = await findVerbs();

  // Group by CEFR level from filename
  const byLevel: Record<string, VerbInfo[]> = {};
  for (const verb of verbs) {
    const level = verb.file.replace('.json', '');
    if (!byLevel[level]) byLevel[level] = [];
    byLevel[level].push(verb);
  }

  console.log(`📊 Found ${verbs.length} verbs total\n`);

  // Summary by level
  console.log('By Level:');
  for (const [level, items] of Object.entries(byLevel).sort()) {
    const withAspect = items.filter(v => v.aspect).length;
    const withPartner = items.filter(v => v.partnerId).length;
    console.log(`  ${level}: ${items.length} verbs (${withAspect} with aspect, ${withPartner} with partner)`);
  }

  // Verbs without aspect
  const withoutAspect = verbs.filter(v => !v.aspect);
  console.log(`\n⚠️  Verbs without aspect: ${withoutAspect.length}`);

  // Verbs without partner
  const withoutPartner = verbs.filter(v => !v.partnerId);
  console.log(`⚠️  Verbs without aspect partner: ${withoutPartner.length}`);

  // Show sample verbs
  console.log('\n📝 Sample verbs:');
  verbs.slice(0, 15).forEach(v => {
    const aspect = v.aspect || '?';
    const partner = v.partnerId ? `→ ${v.partnerId}` : 'no partner';
    console.log(`  ${v.german} - ${v.bulgarian} [${aspect}] (${partner})`);
  });

  // Look for potential aspect pairs by Bulgarian suffix patterns
  console.log('\n🔎 Potential aspect pairs by Bulgarian patterns:');

  // Common patterns:
  // Imperfective verbs often end in -а, -я, -ам, -ям
  // Perfective verbs often have prefixes: по-, на-, про-, с-, из-, в-, за-

  const potentialPairs: Array<[VerbInfo, VerbInfo]> = [];

  for (const verb of verbs) {
    const bg = verb.bulgarian.toLowerCase();

    // Check if it starts with a perfective prefix
    const perfectivePrefixes = ['на', 'по', 'про', 'с', 'из', 'въз', 'за', 'пре', 'от', 'под', 'обез'];
    const hasPrefix = perfectivePrefixes.some(p => bg.startsWith(p));

    if (hasPrefix) {
      // Look for imperfective counterpart (without prefix)
      const withoutPrefix = perfectivePrefixes.reduce((str, prefix) => {
        return str.startsWith(prefix) ? str.slice(prefix.length) : str;
      }, bg);

      const counterpart = verbs.find(v => {
        const otherBg = v.bulgarian.toLowerCase();
        return otherBg === withoutPrefix || otherBg === withoutPrefix.replace('и', 'я');
      });

      if (counterpart && counterpart.id !== verb.id) {
        potentialPairs.push([counterpart, verb]);
      }
    }
  }

  console.log(`  Found ${potentialPairs.length} potential pairs:`);
  potentialPairs.slice(0, 10).forEach(([imp, perf]) => {
    console.log(`    ${imp.bulgarian} (imp.) → ${perf.bulgarian} (perf.)`);
  });

  console.log('\n✅ Analysis complete!');
}

main().catch(console.error);
