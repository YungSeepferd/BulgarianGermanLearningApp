#!/usr/bin/env tsx
/**
 * Prepare A1 translated vocabulary for merge into unified-vocabulary.
 * - Loads enrichment-output/a1-bulgarian-words-translated.json
 * - Loads static/data/unified-vocabulary.json (version 9)
 * - Deduplicates by normalized Bulgarian and German
 * - Emits enrichment-output/a1-merge-ready.json with merge candidates
 *
 * This script does NOT write into static/data/unified-vocabulary.json.
 * Run separately a merge step (not provided here) after review.
 */

import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

const ROOT = process.cwd();
const TRANSLATED_PATH = path.resolve(ROOT, 'enrichment-output/a1-bulgarian-words-translated.json');
const UNIFIED_PATH = path.resolve(ROOT, 'static/data/unified-vocabulary.json');
const OUTPUT_PATH = path.resolve(ROOT, 'enrichment-output/a1-merge-ready.json');

function loadJSON<T>(p: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(p: string, data: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

type Translated = {
  bulgarian: string;
  english: string | null;
  german: string | null;
  sources: { english: string; german: string };
  page: number;
  context: string;
};

type UnifiedItem = {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech?: string;
  difficulty?: number;
  categories?: string[];
  examples?: Array<{ german: string; bulgarian: string; context?: string; source?: string }>;
  type?: string;
};

type UnifiedDataset = {
  version?: string | number;
  totalItems?: number;
  items: UnifiedItem[];
};

function main() {
  const translated = loadJSON<Translated[]>(TRANSLATED_PATH, []);
  if (!translated.length) {
    console.error('No translated data found at', TRANSLATED_PATH);
    process.exit(1);
  }
  const unified = loadJSON<UnifiedDataset>(UNIFIED_PATH, { items: [] });
  const existingBg = new Set(unified.items.map((i) => normalize(i.bulgarian)));
  const existingDe = new Set(unified.items.map((i) => normalize(i.german)));

  const candidates: UnifiedItem[] = [];
  let skippedBg = 0;
  let skippedDe = 0;

  for (const t of translated) {
    if (!t.german || !t.english) continue;
    const bgKey = normalize(t.bulgarian);
    const deKey = normalize(t.german);
    if (existingBg.has(bgKey)) {
      skippedBg++;
      continue;
    }
    if (existingDe.has(deKey)) {
      skippedDe++;
      continue;
    }
    candidates.push({
      id: `a1_auto_${uuid()}`,
      german: t.german,
      bulgarian: t.bulgarian,
      partOfSpeech: 'unknown',
      difficulty: 1,
      categories: ['a1'],
      examples: [
        {
          german: t.german,
          bulgarian: t.bulgarian,
          context: 'auto-import',
          source: 'a1-extraction'
        }
      ],
      type: 'word'
    });
  }

  saveJSON(OUTPUT_PATH, {
    source: 'a1-bulgarian-words-translated.json',
    generatedAt: new Date().toISOString(),
    totalCandidates: candidates.length,
    skippedBg,
    skippedDe,
    candidates
  });

  console.log('Prepared merge candidates:', candidates.length);
  console.log('Skipped (BG dup):', skippedBg, 'Skipped (DE dup):', skippedDe);
  console.log('Output:', OUTPUT_PATH);
  console.log('Review this file, then merge manually into static/data/unified-vocabulary.json with version bump (v9→v10).');
}

main();
