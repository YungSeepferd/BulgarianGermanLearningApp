#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

function isString(x) {
  return typeof x === 'string' && x.trim().length > 0; 
}
function isOptionalString(x) {
  return x === null || x === undefined || typeof x === 'string'; 
}
function isOptionalNumberIn(x, min, max) {
  if (x === null || x === undefined) {
    return true;
  }
  const n = Number(x);
  return Number.isFinite(n) && n >= min && n <= max;
}

function validateExamples(examples, ctx, errs) {
  if (examples === undefined) {
    return;
  }
  if (!Array.isArray(examples)) {
    errs.push(`${ctx}: examples must be an array`);
    return;
  }
  for (const [i, ex] of examples.entries()) {
    if (!ex || typeof ex !== 'object') {
      errs.push(`${ctx}: examples[${i}] must be an object`);
      continue;
    }
    if (!isString(ex.sentence)) {
      errs.push(`${ctx}: examples[${i}].sentence is required string`);
    }
    if (!isString(ex.translation)) {
      errs.push(`${ctx}: examples[${i}].translation is required string`);
    }
    if (!isOptionalString(ex.context) && !isOptionalString(ex.note)) {
      // allow either context (vocab) or note (grammar) optionally
      errs.push(`${ctx}: examples[${i}] optional context/note must be string/null if present`);
    }
  }
}

function validateVocabularyArray(arr) {
  const errs = [];
  if (!Array.isArray(arr)) {
    return ['vocabulary.json root must be an array'];
  }
  const ids = new Set();
  for (const [idx, it] of arr.entries()) {
    const ctx = `vocabulary[${idx}] (id=${it?.id ?? 'n/a'})`;
    if (!it || typeof it !== 'object') {
      errs.push(`${ctx}: entry must be object`); continue; 
    }
    if (!isString(it.id)) {
      errs.push(`${ctx}: id is required string`);
    }
    if (ids.has(it.id)) {
      errs.push(`${ctx}: id must be unique (duplicate)`);
    } else {
      ids.add(it.id);
    }
    if (!isString(it.word)) {
      errs.push(`${ctx}: word is required string`);
    }
    if (!isString(it.translation)) {
      errs.push(`${ctx}: translation is required string`);
    }
    if (!isString(it.source_lang)) {
      errs.push(`${ctx}: source_lang is required string`);
    }
    if (!isString(it.target_lang)) {
      errs.push(`${ctx}: target_lang is required string`);
    }
    if (!isOptionalString(it.category)) {
      errs.push(`${ctx}: category must be string/null if present`);
    }
    if (!isOptionalString(it.level)) {
      errs.push(`${ctx}: level must be string/null if present`);
    }
    if (!isOptionalString(it.notes)) {
      errs.push(`${ctx}: notes must be string/null if present`);
    }
    if (!isOptionalString(it.notes_bg_to_de)) {
      errs.push(`${ctx}: notes_bg_to_de must be string/null if present`);
    }
    if (!isOptionalString(it.notes_de_to_bg)) {
      errs.push(`${ctx}: notes_de_to_bg must be string/null if present`);
    }
    if (it.notes_bg_to_de && !/[ЁЄІЇА-яёєіїҐґ]/.test(it.notes_bg_to_de)) {
      errs.push(`${ctx}: notes_bg_to_de should contain Bulgarian Cyrillic text`);
    }
    if (it.notes_de_to_bg && !/[A-Za-zÄÖÜßäöü]/.test(it.notes_de_to_bg)) {
      errs.push(`${ctx}: notes_de_to_bg should contain German/Latin text`);
    }
    if (!isOptionalString(it.etymology)) {
      errs.push(`${ctx}: etymology must be string/null if present`);
    }
    if (!isOptionalString(it.cultural_note)) {
      errs.push(`${ctx}: cultural_note must be string/null if present`);
    }
    if (!isOptionalString(it.linguistic_note)) {
      errs.push(`${ctx}: linguistic_note must be string/null if present`);
    }
    // Warn if directional notes are missing but generic notes exist
    if (isString(it.notes) && !it.notes_bg_to_de && !it.notes_de_to_bg) {
      console.warn(`⚠ ${ctx}: has generic notes but missing directional notes (notes_bg_to_de, notes_de_to_bg)`);
    }
    if (!isOptionalNumberIn(it.difficulty, 1, 5)) {
      errs.push(`${ctx}: difficulty must be number 1..5 if present`);
    }
    if (!isOptionalNumberIn(it.frequency, 0, 100)) {
      errs.push(`${ctx}: frequency must be number 0..100 if present`);
    }
    if (isString(it.source_lang) && it.source_lang !== 'bg') {
      errs.push(`${ctx}: source_lang should be 'bg'`);
    }
    if (isString(it.target_lang) && it.target_lang !== 'de') {
      errs.push(`${ctx}: target_lang should be 'de'`);
    }
    validateExamples(it.examples, ctx, errs);
  }
  return errs;
}

async function main() {
  const vocabPath = 'data/vocabulary.json';
  const outputs = [];

  // Validate vocabulary.json
  try {
    const vocabRaw = await readFile(vocabPath, 'utf8');
    const vocab = JSON.parse(vocabRaw);
    const vErrs = validateVocabularyArray(vocab);
    if (vErrs.length > 0) {
      outputs.push({ file: vocabPath, ok: false, errors: vErrs });
    } else {
      outputs.push({ file: vocabPath, ok: true });
    }
  } catch (error) {
    outputs.push({ file: vocabPath, ok: false, errors: [error.message] });
  }

  // Grammar is now in Markdown files (content/grammar/*.md)
  // Grammar structure is validated by:
  // 1. Hugo's markdown parsing (automatically)
  // 2. Go CLI tool: ./hugo-bg-de validate (checks MD files exist)
  console.log('ℹ Grammar content in Markdown format (validated by Go CLI tool)');

  let exitCode = 0;
  for (const out of outputs) {
    if (out.ok) {
      console.log(`✔ ${out.file}: OK`);
    } else {
      exitCode = 1;
      console.error(`✖ ${out.file}: ${out.errors.length} issue(s)`);
      for (const err of out.errors.slice(0, 50)) {
        console.error('  -', err);
      }
      if (out.errors.length > 50) {
        console.error(`  ... and ${out.errors.length - 50} more`);
      }
    }
  }

  process.exit(exitCode);
}

main().catch(error => {
  console.error('Validator crashed:', error);
  process.exit(1);
});
