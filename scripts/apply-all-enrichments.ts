#!/usr/bin/env tsx
/**
 * Comprehensive Enrichment Import Script
 *
 * Applies all enrichment data from enrichment-output/ to vocabulary chunks.
 * Handles: gender, declension, conjugation, examples, and more.
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface EnrichmentData {
  id: string;
  gender?: string;
  declension?: {
    nominative?: { singular?: string; plural?: string };
    accusative?: { singular?: string; plural?: string };
    dative?: { singular?: string; plural?: string };
    genitive?: { singular?: string; plural?: string };
  };
  conjugation?: Record<string, unknown>;
  grammar?: {
    comparative?: string;
    superlative?: string;
  };
  examples?: Array<{
    german?: string;
    bulgarian?: string;
    source?: string;
    target?: string;
    context?: string;
  }>;
  metadata?: {
    enrichmentDate?: string;
    source?: string;
    confidence?: string;
  };
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  grammar?: {
    gender?: string;
    pluralForm?: string;
    verbAspect?: string | null;
    verbPartnerId?: string;
    conjugation?: Record<string, unknown>;
    declension?: Record<string, { singular?: string; plural?: string }>;
  };
  examples?: Array<{
    german: string;
    bulgarian: string;
    context?: string;
  }>;
  metadata?: {
    isVerified?: boolean;
    enrichment?: {
      enriched?: boolean;
      confidence?: number;
      source?: string;
      enrichedAt?: string;
    };
  };
}

const ENRICHMENT_DIR = 'enrichment-output';
const VOCAB_DIR = 'data/vocabulary';

async function loadEnrichmentFiles(): Promise<EnrichmentData[]> {
  const allEnrichments: EnrichmentData[] = [];

  // Find all enrichment files
  const patterns = [
    'batch-*-gender-enrichment.json',
    'batch-*-verb-enrichment.json',
    'batch-*-adjective-enrichment.json',
    'nouns-declension-enrichment.json',
    'examples-*.json'
  ];

  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: ENRICHMENT_DIR });
    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(ENRICHMENT_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          allEnrichments.push(...data);
        } else if (typeof data === 'object' && data !== null) {
          // Handle object format with IDs as keys
          Object.entries(data).forEach(([id, value]) => {
            if (typeof value === 'object' && value !== null) {
              allEnrichments.push({ ...(value as object), id } as EnrichmentData);
            }
          });
        }
      } catch (e) {
        console.warn(`⚠️  Could not load ${file}: ${e}`);
      }
    }
  }

  return allEnrichments;
}

async function loadVocabularyChunks(): Promise<Map<string, VocabularyItem[]>> {
  const chunks = new Map<string, VocabularyItem[]>();

  const files = await glob('*.json', { cwd: VOCAB_DIR });
  for (const file of files) {
    if (file === 'index.json' || file === 'search-index.json') continue;

    const content = await fs.readFile(path.join(VOCAB_DIR, file), 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      chunks.set(file, data);
    }
  }

  return chunks;
}

function mergeEnrichment(
  item: VocabularyItem,
  enrichment: EnrichmentData
): VocabularyItem {
  const merged = { ...item };

  // Ensure grammar object exists
  if (!merged.grammar) {
    merged.grammar = {};
  }

  // Merge gender
  if (enrichment.gender) {
    const genderMap: Record<string, string> = {
      'm': 'masculine',
      'f': 'feminine',
      'n': 'neuter'
    };
    merged.grammar.gender = genderMap[enrichment.gender] || enrichment.gender;
  }

  // Merge declension
  if (enrichment.declension) {
    merged.grammar.declension = {
      ...merged.grammar.declension,
      ...enrichment.declension
    };
  }

  // Merge conjugation
  if (enrichment.conjugation) {
    merged.grammar.conjugation = {
      ...merged.grammar.conjugation,
      ...enrichment.conjugation
    };
  }

  // Merge comparative/superlative for adjectives
  if (enrichment.grammar?.comparative) {
    if (!merged.grammar) merged.grammar = {};
    (merged.grammar as Record<string, unknown>).comparative = enrichment.grammar.comparative;
  }
  if (enrichment.grammar?.superlative) {
    if (!merged.grammar) merged.grammar = {};
    (merged.grammar as Record<string, unknown>).superlative = enrichment.grammar.superlative;
  }

  // Merge examples
  if (enrichment.examples && enrichment.examples.length > 0) {
    const newExamples = enrichment.examples.map(ex => ({
      german: ex.german || ex.source || '',
      bulgarian: ex.bulgarian || ex.target || '',
      context: ex.context
    })).filter(ex => ex.german && ex.bulgarian);

    if (newExamples.length > 0) {
      merged.examples = [...(merged.examples || []), ...newExamples];
      // Deduplicate
      const seen = new Set<string>();
      merged.examples = merged.examples.filter(ex => {
        const key = `${ex.german}|${ex.bulgarian}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  }

  // Update enrichment metadata
  if (!merged.metadata) {
    merged.metadata = {};
  }
  merged.metadata.enrichment = {
    enriched: true,
    confidence: enrichment.metadata?.confidence === 'high' ? 0.9 :
                enrichment.metadata?.confidence === 'medium' ? 0.7 : 0.5,
    source: enrichment.metadata?.source || 'batch-import',
    enrichedAt: enrichment.metadata?.enrichmentDate || new Date().toISOString()
  };
  merged.metadata.isVerified = true;

  return merged;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        APPLYING VOCABULARY ENRICHMENTS                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Load all enrichment data
  console.log('📚 Loading enrichment files...');
  const enrichments = await loadEnrichmentFiles();
  console.log(`   Found ${enrichments.length} enrichment entries\n`);

  // Create enrichment lookup map
  const enrichmentMap = new Map<string, EnrichmentData>();
  for (const enrichment of enrichments) {
    if (enrichmentMap.has(enrichment.id)) {
      // Merge multiple enrichments for same item
      const existing = enrichmentMap.get(enrichment.id)!;
      enrichmentMap.set(enrichment.id, {
        ...existing,
        ...enrichment,
        declension: { ...existing.declension, ...enrichment.declension },
        grammar: { ...existing.grammar, ...enrichment.grammar },
        examples: [...(existing.examples || []), ...(enrichment.examples || [])]
      });
    } else {
      enrichmentMap.set(enrichment.id, enrichment);
    }
  }
  console.log(`   Unique items to enrich: ${enrichmentMap.size}\n`);

  // Load vocabulary chunks
  console.log('📂 Loading vocabulary chunks...');
  const chunks = await loadVocabularyChunks();
  let totalItems = 0;
  for (const [file, items] of chunks) {
    console.log(`   ${file}: ${items.length} items`);
    totalItems += items.length;
  }
  console.log(`   Total: ${totalItems} items\n`);

  // Apply enrichments
  console.log('🔄 Applying enrichments...');
  let appliedCount = 0;
  let skippedCount = 0;

  for (const [file, items] of chunks) {
    let fileApplied = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const enrichment = enrichmentMap.get(item.id);

      if (enrichment) {
        items[i] = mergeEnrichment(item, enrichment);
        appliedCount++;
        fileApplied++;
      } else {
        skippedCount++;
      }
    }

    if (fileApplied > 0) {
      console.log(`   ✅ ${file}: ${fileApplied} items enriched`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Enriched: ${appliedCount} items`);
  console.log(`   Skipped: ${skippedCount} items`);
  console.log(`   Coverage: ${((appliedCount / totalItems) * 100).toFixed(1)}%\n`);

  // Save enriched chunks
  console.log('💾 Saving enriched chunks...');
  for (const [file, items] of chunks) {
    await fs.writeFile(
      path.join(VOCAB_DIR, file),
      JSON.stringify(items, null, 2),
      'utf-8'
    );
    console.log(`   ✅ ${file}`);
  }

  console.log('\n✅ Enrichment import complete!');
  console.log('\nNext steps:');
  console.log('   1. npm run build:search-index  # Regenerate search index');
  console.log('   2. npm run build               # Build application');
  console.log('   3. npm run preview             # Test changes\n');
}

main().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
