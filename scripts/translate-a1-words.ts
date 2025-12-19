#!/usr/bin/env tsx
/**
 * Auto-translate A1 Bulgarian words to English and German.
 *
 * Strategy:
 * 1) Match Bulgarian → German from existing vocabulary (static/data/unified-vocabulary.json)
 * 2) Translate Bulgarian → English via API (MyMemory) with caching + throttling
 * 3) If no German match, translate Bulgarian → German via API
 * 4) Emit provenance of each field (matched/api)
 *
 * Input: enrichment-output/a1-bulgarian-words.json
 * Output: enrichment-output/a1-bulgarian-words-translated.json
 * Cache: enrichment-output/translation-cache.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import PQueue from 'p-queue';

type InputWord = {
  bulgarian: string;
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
};

type UnifiedDataset = {
  version?: string | number;
  items: UnifiedItem[];
};

type Provenance = 'matched' | 'api' | 'none';

type OutputWord = {
  bulgarian: string;
  english: string | null;
  german: string | null;
  sources: { english: Provenance; german: Provenance };
  page: number;
  context: string;
};

type CacheEntry = {
  text: string;
  from: string;
  to: string;
  translation: string;
  provider: string;
  ts: string; // ISO timestamp
};

type CacheFile = {
  entries: CacheEntry[];
};

const ROOT = process.cwd();
const INPUT_PATH = path.resolve(ROOT, 'enrichment-output/a1-bulgarian-words.json');
const STATIC_VOCAB_PATH = path.resolve(ROOT, 'static/data/unified-vocabulary.json');
const OUTPUT_PATH = path.resolve(ROOT, 'enrichment-output/a1-bulgarian-words-translated.json');
const CACHE_PATH = path.resolve(ROOT, 'enrichment-output/translation-cache.json');

const program = new Command();
program
  .option('--limit <number>', 'limit number of words to process', '')
  .option('--dry-run', 'do not write output file', false)
  .option('--provider <name>', 'translation provider (mymemory|libre)', 'mymemory')
  .option('--concurrency <n>', 'API concurrency (default 2)', '2')
  .option('--rate <rps>', 'approx requests per second (default 3)', '3')
  .option('--resume', 'use existing cache to skip known translations', true)
  .parse(process.argv);

const opts = program.opts();

function loadJSON<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function normalizeBg(s: string): string {
  return s
    .trim()
    .replace(/[.,;:!?()"'„“”’`]|\s+/g, (m) => (m.trim() ? '' : ' '))
    .replace(/\s{2,}/g, ' ')
    .toLowerCase();
}

function buildBgToDeLookup(dataset: UnifiedDataset): Map<string, string> {
  const map = new Map<string, string>();
  for (const it of dataset.items || []) {
    if (!it?.bulgarian || !it?.german) continue;
    const key = normalizeBg(it.bulgarian);
    if (!map.has(key)) map.set(key, it.german);
  }
  return map;
}

function buildCacheIndex(cache: CacheFile): Map<string, string> {
  const idx = new Map<string, string>();
  for (const e of cache.entries) {
    idx.set(`${e.from}|${e.to}|${e.text}`, e.translation);
  }
  return idx;
}

async function translateMyMemory(text: string, from: string, to: string): Promise<string | null> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'BulgarianGermanLearningApp/1.0 (auto-translation script)' }
  });
  if (!res.ok) return null;
  const data = (await res.json()) as any;
  const translated = data?.responseData?.translatedText as string | undefined;
  if (translated && typeof translated === 'string') return translated;
  return null;
}

async function translateLibre(text: string, from: string, to: string): Promise<string | null> {
  // Public demo can be flaky; allow optional use
  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const translated = data?.translatedText as string | undefined;
    if (translated && typeof translated === 'string') return translated;
    return null;
  } catch {
    return null;
  }
}

async function translator(text: string, from: string, to: string): Promise<{ translation: string | null; provider: string }> {
  const provider = String(opts.provider || 'mymemory').toLowerCase();
  if (provider === 'libre') {
    const t = await translateLibre(text, from, to);
    return { translation: t, provider: 'libre' };
  } else {
    const t = await translateMyMemory(text, from, to);
    return { translation: t, provider: 'mymemory' };
  }
}

async function main() {
  console.log('→ Loading input and datasets…');
  const input: InputWord[] = loadJSON<InputWord[]>(INPUT_PATH, []);
  if (!Array.isArray(input) || input.length === 0) {
    console.error('No input words found at', INPUT_PATH);
    process.exit(1);
  }
  const staticVocab: UnifiedDataset = loadJSON<UnifiedDataset>(STATIC_VOCAB_PATH, { items: [] });
  const bg2de = buildBgToDeLookup(staticVocab);

  const limit = opts.limit ? Number(opts.limit) : undefined;
  const items = typeof limit === 'number' && limit > 0 ? input.slice(0, limit) : input;

  const cacheFile: CacheFile = loadJSON<CacheFile>(CACHE_PATH, { entries: [] });
  const cacheIdx = buildCacheIndex(cacheFile);

  const concurrency = Math.max(1, Number(opts.concurrency || 2));
  const rps = Math.max(1, Number(opts.rate || 2));
  const queue = new PQueue({ concurrency, interval: 1000, intervalCap: rps });

  const out: OutputWord[] = [];
  let matchedDe = 0;
  let apiDe = 0;
  let apiEn = 0;

  function getCached(text: string, from: string, to: string): string | null {
    const key = `${from}|${to}|${text}`;
    return cacheIdx.get(key) ?? null;
  }

  function putCache(text: string, from: string, to: string, translation: string, provider: string) {
    const entry: CacheEntry = {
      text,
      from,
      to,
      translation,
      provider,
      ts: new Date().toISOString()
    };
    cacheFile.entries.push(entry);
    cacheIdx.set(`${from}|${to}|${text}`, translation);
  }

  console.log(`→ Processing ${items.length} words (concurrency=${concurrency}, rps=${rps})…`);
  for (const it of items) {
    const bg = it.bulgarian.trim();
    const norm = normalizeBg(bg);

    // Bulgarian → German via dataset match
    let german: string | null = null;
    let germanSource: Provenance = 'none';
    const matched = bg2de.get(norm);
    if (matched) {
      german = matched;
      germanSource = 'matched';
      matchedDe++;
    }

    // Bulgarian → English via API (always attempt for coverage)
    const english = await queue.add(async () => {
      const cached = getCached(bg, 'bg', 'en');
      if (cached) return { text: cached, provider: 'cache' } as const;
      const { translation, provider } = await translator(bg, 'bg', 'en');
      if (translation) {
        putCache(bg, 'bg', 'en', translation, provider);
        return { text: translation, provider } as const;
      }
      return { text: null, provider: 'none' } as const;
    });

    if (english.text) apiEn++;

    // If no German match, fallback to API for German
    if (!german) {
      const de = await queue.add(async () => {
        const cached = getCached(bg, 'bg', 'de');
        if (cached) return { text: cached, provider: 'cache' } as const;
        const { translation, provider } = await translator(bg, 'bg', 'de');
        if (translation) {
          putCache(bg, 'bg', 'de', translation, provider);
          return { text: translation, provider } as const;
        }
        return { text: null, provider: 'none' } as const;
      });
      german = de.text;
      if (german) {
        germanSource = de.provider === 'cache' ? 'api' : 'api';
        apiDe++;
      }
    }

    out.push({
      bulgarian: bg,
      english: english.text,
      german,
      sources: {
        english: english.text ? (english.provider === 'cache' ? 'api' : 'api') : 'none',
        german: german ? germanSource : 'none'
      },
      page: it.page,
      context: it.context
    });
  }

  // Sort for stable output
  out.sort((a, b) => a.bulgarian.localeCompare(b.bulgarian, 'bg'));

  if (!opts.dryRun) {
    console.log('→ Writing output and cache…');
    saveJSON(OUTPUT_PATH, out);
    saveJSON(CACHE_PATH, cacheFile);
  } else {
    console.log('Dry run enabled: not writing output.');
  }

  const covered = out.filter((x) => x.german || x.english).length;
  console.log('\n=== Translation Summary ===');
  console.log('Total words:        ', items.length);
  console.log('With any translation', covered);
  console.log('Matched German:     ', matchedDe);
  console.log('API German:         ', apiDe);
  console.log('API English:        ', apiEn);
  console.log('Output:             ', OUTPUT_PATH);
  console.log('Cache:              ', CACHE_PATH);
}

main().catch((err) => {
  console.error('Translation pipeline failed:', err);
  process.exit(1);
});
