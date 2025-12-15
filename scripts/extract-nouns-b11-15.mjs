#!/usr/bin/env node
// Extract nouns without gender from batches 11-15
// Outputs: enrichment-output/nouns-b11-15.json

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VOCAB_PATH = path.join(ROOT, 'data', 'unified-vocabulary.json');
const OUTPUT_DIR = path.join(ROOT, 'enrichment-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'nouns-b11-15.json');

function loadVocabulary() {
  const raw = fs.readFileSync(VOCAB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function isBatchInRange(item) {
  const batchId = item?.metadata?.batchId ?? item?.batchId ?? null;
  if (batchId === null || batchId === undefined) return false;
  const n = Number(batchId);
  return Number.isFinite(n) && n >= 11 && n <= 15;
}

function isNounWithoutGender(item) {
  const pos = (item.partOfSpeech || '').toLowerCase();
  const gender = item?.grammar?.gender;
  return pos === 'noun' && (!gender || gender === '' || gender === null);
}

function summarize(items) {
  const byBatch = new Map();
  for (const it of items) {
    const b = it.metadata?.batchId ?? it.batchId ?? 'unknown';
    byBatch.set(b, (byBatch.get(b) || 0) + 1);
  }
  return Object.fromEntries(byBatch.entries());
}

function main() {
  try {
    const vocabData = loadVocabulary();
    const vocab = vocabData.items;
    const targets = [];

    for (const item of vocab) {
      if (!isBatchInRange(item)) continue;
      if (!isNounWithoutGender(item)) continue;
      targets.push({
        id: item.id,
        german: item.german,
        bulgarian: item.bulgarian,
        partOfSpeech: item.partOfSpeech,
        batchId: item.metadata?.batchId ?? item.batchId ?? null,
      });
    }

    ensureOutputDir();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
      count: targets.length,
      summary: summarize(targets),
      nouns: targets,
    }, null, 2));

    console.log(`✅ Extracted ${targets.length} nouns needing gender (batches 11-15).`);
    console.log(`→ Saved: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('❌ Extraction failed:', err);
    process.exit(1);
  }
}

main();
