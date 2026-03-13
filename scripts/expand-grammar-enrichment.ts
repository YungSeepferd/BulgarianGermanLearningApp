#!/usr/bin/env tsx
/**
 * Expand Grammar Enrichment Coverage
 *
 * Automatically enriches vocabulary items with grammar data using linguistic rules:
 * 1. Infer German noun gender from word endings
 * 2. Generate declension tables based on gender patterns
 * 3. Process all items missing grammar data
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  grammar?: {
    gender?: string;
    pluralForm?: string;
    declension?: Record<string, { singular?: string; plural?: string }>;
  };
}

// German noun gender rules based on word endings
const GENDER_RULES: Array<{
  pattern: RegExp;
  gender: string;
  confidence: number;
  description: string;
}> = [
  // Masculine patterns
  { pattern: /(ant|ast|ich|ig|ing|ist)$/i, gender: 'masculine', confidence: 0.9, description: 'Agent nouns ending' },
  { pattern: /(or|er)$/i, gender: 'masculine', confidence: 0.85, description: 'Professional/person nouns' },
  { pattern: /(ismus|ist)$/i, gender: 'masculine', confidence: 0.95, description: 'Abstract concepts/professions' },
  { pattern: /(ner|ler)$/i, gender: 'masculine', confidence: 0.8, description: 'Occupation nouns' },

  // Feminine patterns
  { pattern: /(heit|keit|schaft|ung|tion|sion|ur|tät)$/i, gender: 'feminine', confidence: 0.95, description: 'Abstract noun suffixes' },
  { pattern: /(ie|ik|ei|in|anz|enz)$/i, gender: 'feminine', confidence: 0.9, description: 'Common feminine endings' },
  { pattern: /(a|e)$/i, gender: 'feminine', confidence: 0.6, description: 'Common feminine vowel endings' },

  // Neuter patterns
  { pattern: /(chen|lein)$/i, gender: 'neuter', confidence: 0.98, description: 'Diminutive suffixes' },
  { pattern: /(ium|um|ment)$/i, gender: 'neuter', confidence: 0.9, description: 'Scientific/foreign nouns' },
  { pattern: /(o|ett|ma)$/i, gender: 'neuter', confidence: 0.7, description: 'Foreign/origin nouns' },

  // Days, months, seasons are masculine
  { pattern: /(tag|monat|jahr|zeit)$/i, gender: 'masculine', confidence: 0.9, description: 'Time nouns' },

  // Weather phenomena are often neuter
  { pattern: /(wetter|licht|feuer|wasser)$/i, gender: 'neuter', confidence: 0.8, description: 'Elemental nouns' }
];

// Strong/weak declension patterns for German nouns
const DECLENSION_PATTERNS: Record<string, {
  nominative: { s: string; p: string };
  accusative: { s: string; p: string };
  dative: { s: string; p: string };
  genitive: { s: string; p: string };
}> = {
  masculine: {
    nominative: { s: '', p: 'e' },
    accusative: { s: '', p: 'e' },
    dative: { s: '', p: 'en' },
    genitive: { s: 'es', p: 'e' }
  },
  feminine: {
    nominative: { s: '', p: 'en' },
    accusative: { s: '', p: 'en' },
    dative: { s: '', p: 'en' },
    genitive: { s: '', p: 'en' }
  },
  neuter: {
    nominative: { s: '', p: 'e' },
    accusative: { s: '', p: 'e' },
    dative: { s: '', p: 'en' },
    genitive: { s: 'es', p: 'e' }
  }
};

// Specific exceptions that don't follow regular patterns
const DECLENSION_EXCEPTIONS: Record<string, Partial<ReturnType<typeof generateDeclension>>> = {
  // Masculine weak declension (adds -en/-n in all cases except nom sing)
  'Mensch': {
    accusative: { singular: 'Menschen' },
    dative: { singular: 'Menschen' },
    genitive: { singular: 'Menschen' }
  },
  'Herr': {
    accusative: { singular: 'Herrn' },
    dative: { singular: 'Herrn' },
    genitive: { singular: 'Herrn' }
  },
  'Name': {
    genitive: { singular: 'Namens' }
  },
  'Buch': {
    genitive: { singular: 'Buches' }
  },
  'Haus': {
    dative: { singular: 'Hause' },
    genitive: { singular: 'Hauses' }
  }
};

function inferGender(german: string): { gender: string; confidence: number; rule: string } | null {
  for (const rule of GENDER_RULES) {
    if (rule.pattern.test(german)) {
      return {
        gender: rule.gender,
        confidence: rule.confidence,
        rule: rule.description
      };
    }
  }
  return null;
}

function generateDeclension(german: string, gender: string): {
  nominative: { singular: string; plural: string };
  accusative: { singular: string; plural: string };
  dative: { singular: string; plural: string };
  genitive: { singular: string; plural: string };
} {
  const basePattern = DECLENSION_PATTERNS[gender];

  // Generate default forms
  const result = {
    nominative: {
      singular: german,
      plural: german + basePattern.nominative.p
    },
    accusative: {
      singular: german + basePattern.accusative.s,
      plural: german + basePattern.accusative.p
    },
    dative: {
      singular: german + basePattern.dative.s,
      plural: german + basePattern.dative.p
    },
    genitive: {
      singular: german + basePattern.genitive.s,
      plural: german + basePattern.genitive.p
    }
  };

  // Apply exceptions
  const exception = DECLENSION_EXCEPTIONS[german];
  if (exception) {
    Object.assign(result, exception);
  }

  // Handle umlaut in plurals for some words
  if (gender === 'masculine' || gender === 'neuter') {
    const umlautMap: Record<string, string> = {
      'a': 'ä', 'o': 'ö', 'u': 'ü', 'A': 'Ä', 'O': 'Ö', 'U': 'Ü'
    };

    // Common patterns that take umlaut in plural
    const umlautPatterns = /(stadt|mann|vater|mutter|bruder|tochter|baum|wasser)$/
    if (umlautPatterns.test(german.toLowerCase())) {
      result.nominative.plural = result.nominative.plural.replace(/([aou])/i, (m) => umlautMap[m] || m);
      result.accusative.plural = result.accusative.plural.replace(/([aou])/i, (m) => umlautMap[m] || m);
      result.dative.plural = result.dative.plural.replace(/([aou])/i, (m) => umlautMap[m] || m);
      result.genitive.plural = result.genitive.plural.replace(/([aou])/i, (m) => umlautMap[m] || m);
    }
  }

  return result;
}

async function loadVocabularyChunks(): Promise<Map<string, VocabularyItem[]>> {
  const chunks = new Map<string, VocabularyItem[]>();
  const vocabDir = 'data/vocabulary';

  const files = await glob('*.json', { cwd: vocabDir });
  for (const file of files) {
    if (file === 'index.json' || file === 'search-index.json') continue;

    const content = await fs.readFile(path.join(vocabDir, file), 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      chunks.set(file, data);
    }
  }

  return chunks;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    EXPANDING GRAMMAR ENRICHMENT COVERAGE                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Load vocabulary
  console.log('📂 Loading vocabulary chunks...');
  const chunks = await loadVocabularyChunks();
  let totalItems = 0;
  for (const [file, items] of chunks) {
    console.log(`   ${file}: ${items.length} items`);
    totalItems += items.length;
  }
  console.log(`   Total: ${totalItems} items\n`);

  // Count items needing enrichment
  let nounsWithoutGender = 0;
  let nounsWithoutDeclension = 0;

  for (const [, items] of chunks) {
    for (const item of items) {
      if (item.partOfSpeech === 'noun') {
        if (!item.grammar?.gender) nounsWithoutGender++;
        if (!item.grammar?.declension) nounsWithoutDeclension++;
      }
    }
  }

  console.log('📊 Grammar coverage before expansion:');
  console.log(`   Nouns without gender: ${nounsWithoutGender}`);
  console.log(`   Nouns without declension: ${nounsWithoutDeclension}\n`);

  // Apply enrichment
  console.log('🔄 Applying automated grammar enrichment...');
  let genderAdded = 0;
  let declensionAdded = 0;
  let failed = 0;
  const details: Array<{ word: string; gender: string; rule: string }> = [];

  for (const [file, items] of chunks) {
    let fileGender = 0;
    let fileDeclension = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Only process nouns
      if (item.partOfSpeech !== 'noun') continue;

      // Skip if already has complete grammar
      if (item.grammar?.gender && item.grammar?.declension) continue;

      const inferred = inferGender(item.german);

      if (inferred) {
        if (!item.grammar) {
          item.grammar = {};
        }

        // Add gender if missing
        if (!item.grammar.gender) {
          item.grammar.gender = inferred.gender;
          genderAdded++;
          fileGender++;
          details.push({ word: item.german, gender: inferred.gender, rule: inferred.rule });
        }

        // Add declension if missing
        if (!item.grammar.declension) {
          item.grammar.declension = generateDeclension(item.german, inferred.gender);
          declensionAdded++;
          fileDeclension++;
        }

        // Add enrichment metadata
        if (!item.metadata) {
          item.metadata = {};
        }
        item.metadata.enrichment = {
          enriched: true,
          confidence: inferred.confidence,
          source: 'automated_grammar_rules',
          enrichedAt: new Date().toISOString()
        };
      } else {
        failed++;
      }
    }

    if (fileGender > 0 || fileDeclension > 0) {
      console.log(`   ✅ ${file}: ${fileGender} gender, ${fileDeclension} declension`);
    }
  }

  // Show some examples
  console.log(`\n📝 Sample inferences:`);
  details.slice(0, 10).forEach(d => {
    console.log(`   ${d.word.padEnd(15)} → ${d.gender.padEnd(10)} (${d.rule})`);
  });
  if (details.length > 10) {
    console.log(`   ... and ${details.length - 10} more`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Gender added: ${genderAdded}`);
  console.log(`   Declension added: ${declensionAdded}`);
  console.log(`   Could not infer: ${failed}`);
  console.log(`   New coverage: ${((genderAdded + (totalItems - nounsWithoutGender)) / totalItems * 100).toFixed(1)}%\n`);

  // Save enriched chunks
  console.log('💾 Saving enriched chunks...');
  for (const [file, items] of chunks) {
    await fs.writeFile(
      path.join('data/vocabulary', file),
      JSON.stringify(items, null, 2),
      'utf-8'
    );
    console.log(`   ✅ ${file}`);
  }

  console.log('\n✅ Grammar enrichment expansion complete!');
  console.log('\nNext steps:');
  console.log('   1. npm run build:search-index  # Regenerate search index');
  console.log('   2. npm run build               # Build application');
  console.log('   3. npm run preview             # Test changes\n');
}

main().catch(error => {
  console.error('❌ Expansion failed:', error);
  process.exit(1);
});
