#!/usr/bin/env node
/**
 * Normalize vocabulary and grammar datasets so they satisfy schema validation.
 * - Fills missing IDs, source/target language codes, and coerces numeric fields.
 * - Upgrades grammar entries to provide summary/content and structured examples.
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dataPath = (relative) => path.join(rootDir, 'data', relative);

function slugify(value, fallback) {
  if (!value) return fallback;
  const normalized = value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return normalized || fallback;
}

function coerceNumberInRange(value, min, max) {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (!Number.isFinite(num)) return undefined;
  return Math.min(max, Math.max(min, num));
}

function ensureUniqueId(base, used) {
  const sanitizedBase = base || 'entry';
  let candidate = sanitizedBase;
  let counter = 1;
  while (used.has(candidate)) {
    const suffix = String(counter).padStart(2, '0');
    candidate = `${sanitizedBase}_${suffix}`;
    counter += 1;
  }
  used.add(candidate);
  return candidate;
}

const latinRegex = /^[\p{Script=Latin}A-Za-z]/u;

function formatExamples(examples, { preserveEmpty = false } = {}) {
  if (!Array.isArray(examples)) return preserveEmpty ? [] : undefined;
  return examples
    .map((example) => {
      if (!example) return null;
      if (typeof example === 'string') {
        const trimmed = example.trim();
        if (!trimmed) return null;
        const parenMatch = trimmed.match(/^(.*?)(?:\s*\(([^)]*)\))?$/);
        const baseText = parenMatch?.[1]?.trim() || trimmed;
        const parenNote = parenMatch?.[2]?.trim();

        let sentence = baseText;
        const translationSegments = [];

        const dashIndex = baseText.indexOf(' – ');
        if (dashIndex !== -1) {
          const lhs = baseText.slice(0, dashIndex).trim();
          const rhs = baseText.slice(dashIndex + 3).trim();
          if (rhs && latinRegex.test(rhs)) {
            sentence = lhs;
            translationSegments.push(rhs);
          } else if (lhs) {
            sentence = `${lhs} – ${rhs}`.trim();
          }
        }

        if (parenNote) {
          translationSegments.push(parenNote);
        }

        let translation = '';
        if (translationSegments.length === 1) {
          translation = translationSegments[0].trim();
        } else if (translationSegments.length > 1) {
          const [primary, ...rest] = translationSegments;
          translation = `${primary.trim()} (${rest.join('; ').trim()})`.trim();
        }

        if (!translation) {
          translation = dashIndex !== -1
            ? baseText.slice(baseText.indexOf(' – ') + 3).trim() || sentence
            : sentence;
        }

        return { sentence, translation };
      }
      if (typeof example === 'object') {
        return {
          sentence: example.sentence?.trim() || '',
          translation: example.translation?.trim() || '',
          context: example.context ?? undefined,
          note: example.note ?? undefined,
        };
      }
      return null;
    })
    .filter((example) => example && (example.sentence || example.translation))
    .map((example) => ({
      ...example,
      sentence: example.sentence?.trim() || '',
      translation: example.translation?.trim() || '',
    }))
    .filter((example) => example.sentence || example.translation)
    .reduce((acc, example) => {
      if (!example.translation) {
        example.translation = example.sentence;
      }
      acc.push(example);
      return acc;
    }, []);
}

async function normalizeVocabulary() {
  const vocabRaw = await readFile(dataPath('vocabulary.json'), 'utf8');
  const vocab = JSON.parse(vocabRaw);
  const usedIds = new Set();

  const normalized = vocab.map((entry, index) => {
    if (!entry || typeof entry !== 'object') return entry;
    const copy = { ...entry };

    const fallbackBase =
      slugify(copy.translation, '') ||
      slugify(copy.word, '') ||
      `term_${String(index + 1).padStart(3, '0')}`;

    const hasExistingId =
      copy.id && typeof copy.id === 'string' && copy.id.trim().length;
    const baseId = hasExistingId ? copy.id.trim() : fallbackBase;
    copy.id = ensureUniqueId(baseId, usedIds);
    copy.word = typeof copy.word === 'string' ? copy.word.trim() : copy.word;
    copy.translation =
      typeof copy.translation === 'string'
        ? copy.translation.trim()
        : copy.translation;
    copy.source_lang =
      typeof copy.source_lang === 'string' && copy.source_lang.trim().length
        ? copy.source_lang.trim()
        : 'bg';
    copy.target_lang =
      typeof copy.target_lang === 'string' && copy.target_lang.trim().length
        ? copy.target_lang.trim()
        : 'de';
    copy.category =
      typeof copy.category === 'string' && copy.category.trim().length
        ? copy.category.trim()
        : copy.category ?? null;
    copy.level =
      typeof copy.level === 'string' && copy.level.trim().length
        ? copy.level.trim()
        : copy.level ?? null;
    copy.notes =
      typeof copy.notes === 'string' && copy.notes.trim().length
        ? copy.notes.trim()
        : copy.notes ?? null;
    copy.etymology =
      typeof copy.etymology === 'string' && copy.etymology.trim().length
        ? copy.etymology.trim()
        : copy.etymology ?? null;
    copy.cultural_note =
      typeof copy.cultural_note === 'string' && copy.cultural_note.trim().length
        ? copy.cultural_note.trim()
        : copy.cultural_note ?? null;
    copy.linguistic_note =
      typeof copy.linguistic_note === 'string' &&
      copy.linguistic_note.trim().length
        ? copy.linguistic_note.trim()
        : copy.linguistic_note ?? null;

    const difficulty = coerceNumberInRange(copy.difficulty, 1, 5);
    copy.difficulty = difficulty ?? copy.difficulty ?? null;
    const frequency = coerceNumberInRange(copy.frequency, 0, 100);
    copy.frequency = frequency ?? copy.frequency ?? null;

    const formattedExamples = formatExamples(copy.examples);
    copy.examples = formattedExamples?.length ? formattedExamples : undefined;

    return copy;
  });

  await writeFile(
    dataPath('vocabulary.json'),
    `${JSON.stringify(normalized, null, 2)}\n`
  );
}

function deriveSummary(content, title) {
  if (content && typeof content === 'string') {
    const firstSentenceMatch = content.trim().match(/^(.*?[\.\!\?])( |\n|$)/);
    if (firstSentenceMatch && firstSentenceMatch[1]) {
      return firstSentenceMatch[1].trim();
    }
  }
  return `${title} overview for Bulgarian learners.`;
}

async function normalizeGrammar() {
  const grammarRaw = await readFile(dataPath('grammar.json'), 'utf8');
  const grammar = JSON.parse(grammarRaw);
  const usedIds = new Set();

  const normalized = grammar.map((entry, index) => {
    if (!entry || typeof entry !== 'object') return entry;
    const copy = { ...entry };

    const title =
      typeof copy.title === 'string' && copy.title.trim().length
        ? copy.title.trim()
        : `Grammar Topic ${index + 1}`;
    copy.title = title;

    const baseId = slugify(copy.id || title, `grammar_${index + 1}`);
    copy.id = ensureUniqueId(baseId, usedIds);

    const content =
      typeof copy.content === 'string' && copy.content.trim().length
        ? copy.content.trim()
        : typeof copy.description === 'string' && copy.description.trim().length
        ? copy.description.trim()
        : '';

    copy.content = content;
    copy.summary =
      typeof copy.summary === 'string' && copy.summary.trim().length
        ? copy.summary.trim()
        : deriveSummary(content, title);

    copy.category =
      typeof copy.category === 'string' && copy.category.trim().length
        ? copy.category.trim()
        : copy.category ?? null;
    copy.level =
      typeof copy.level === 'string' && copy.level.trim().length
        ? copy.level.trim()
        : copy.level ?? null;

    const formattedExamples = formatExamples(copy.examples, {
      preserveEmpty: true,
    });
    copy.examples = formattedExamples;

    delete copy.description;

    return copy;
  });

  await writeFile(
    dataPath('grammar.json'),
    `${JSON.stringify(normalized, null, 2)}\n`
  );
}

async function main() {
  await normalizeVocabulary();
  await normalizeGrammar();
  console.log('Datasets normalized.');
}

main().catch((error) => {
  console.error('Failed to normalize datasets:', error);
  process.exit(1);
});
