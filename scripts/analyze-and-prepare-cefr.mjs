#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data
const vocabPath = path.join(__dirname, '../data/unified-vocabulary.json');
const batchPath = path.join(__dirname, '../reports/batch-001-sampling-export.json');

let vocabData = {};
let vocab = [];
let batch = {};

try {
  const data = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
  vocab = data.items || data.vocabulary || [];
  console.log(`✅ Loaded vocabulary: ${vocab.length} items`);
} catch (e) {
  console.error(`❌ Failed to load vocabulary: ${e.message}`);
  process.exit(1);
}

try {
  const bData = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
  batch = bData;
  console.log(`✅ Loaded batch: ${batch.items?.length || 0} items`);
} catch (e) {
  console.error(`⚠️  Batch not loaded yet`);
}

// Sample analysis
console.log(`\n📊 VOCABULARY STRUCTURE ANALYSIS`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// Examine first 5 items
console.log(`\n📝 Sample items (first 5):`);
vocab.slice(0, 5).forEach((item, idx) => {
  console.log(`\n[${idx + 1}] ${item.german} → ${item.bulgarian}`);
  console.log(`    ID: ${item.id}`);
  console.log(`    Categories: ${(item.categories || []).join(', ') || 'NONE'}`);
  console.log(`    Difficulty: ${item.difficulty || 'NONE'}`);
  console.log(`    POS: ${item.partOfSpeech || 'NONE'}`);
});

// Difficulty distribution
const diffDist = {};
vocab.forEach(item => {
  const diff = item.difficulty || 'unknown';
  diffDist[diff] = (diffDist[diff] || 0) + 1;
});

console.log(`\n📊 Difficulty Distribution:`);
Object.entries(diffDist).sort().forEach(([diff, count]) => {
  console.log(`   Difficulty ${diff}: ${count} items`);
});

// Part of speech analysis
const posDist = {};
vocab.forEach(item => {
  const pos = item.partOfSpeech || 'unknown';
  posDist[pos] = (posDist[pos] || 0) + 1;
});

console.log(`\n📚 Part of Speech Distribution:`);
Object.entries(posDist)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([pos, count]) => {
    console.log(`   ${pos}: ${count} items`);
  });

// CEFR Mapping Strategy
console.log(`\n🎯 CEFR LEVEL MAPPING STRATEGY`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const cefrMapping = {
  'A1': {
    name: 'Elementary',
    description: 'Beginner level - most common words',
    difficultyRange: [1, 1.5],
    categories: ['greetings', 'numbers', 'family', 'everyday-phrases', 'colors'],
    examples: ['Hallo', 'Mutter', 'eins', 'rot', 'danke']
  },
  'A2': {
    name: 'Elementary Plus',
    description: 'Post-beginner - basic communicative competence',
    difficultyRange: [1.5, 2.5],
    categories: ['food', 'clothing', 'home', 'animals', 'time', 'weather', 'everyday-phrases'],
    examples: ['Apfel', 'Hemd', 'Haus', 'Katze', 'Tag', 'Regen']
  },
  'B1': {
    name: 'Intermediate',
    description: 'Independent user - can handle routine situations',
    difficultyRange: [2.5, 3.5],
    categories: ['professions', 'places', 'nature', 'transport', 'culture', 'technology', 'grammar'],
    examples: ['Arzt', 'Stadt', 'Berg', 'Auto', 'Musik', 'Computer', 'Verb']
  },
  'B2': {
    name: 'Upper Intermediate',
    description: 'Advanced independent user - wide range of vocabulary',
    difficultyRange: [3.5, 5],
    categories: ['culture', 'technology', 'grammar', 'places', 'nature', 'body-parts'],
    examples: ['Kunstwerk', 'Nominativ', 'Ingenieur']
  }
};

console.log(`\n${Object.entries(cefrMapping).map(([level, info]) => 
  `${level} - ${info.name}\n    Range: ${info.difficultyRange.join('-')}\n    Categories: ${info.categories.slice(0, 3).join(', ')}...`
).join('\n\n')}`);

// Create assignment logic
console.log(`\n🔧 ASSIGNMENT LOGIC`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

console.log(`
Strategy:
1. Primary: Use difficulty level (1-5 scale)
   - Difficulty 1.0-1.5 → A1
   - Difficulty 1.5-2.5 → A2
   - Difficulty 2.5-3.5 → B1
   - Difficulty 3.5-5.0 → B2

2. Secondary: Use part of speech for borderline cases
   - Common nouns, verbs, adjectives → lower level
   - Abstract, specialized terms → higher level

3. Tertiary: Use category as tiebreaker
   - Beginner categories (greetings, numbers) → A1
   - Intermediate categories (professions, places) → B1/B2

4. Validation: Each level should have ~20-25% of items
   - A1: 150-200 items
   - A2: 150-200 items  
   - B1: 150-200 items
   - B2: 100-150 items
`);

// Save analysis report
const report = {
  timestamp: new Date().toISOString(),
  totalItems: vocab.length,
  difficultyDistribution: diffDist,
  partOfSpeechDistribution: posDist,
  cefrStrategy: cefrMapping,
  sampledItems: vocab.slice(0, 5).map(item => ({
    german: item.german,
    bulgarian: item.bulgarian,
    difficulty: item.difficulty,
    partOfSpeech: item.partOfSpeech,
    categories: item.categories
  }))
};

const reportPath = path.join(__dirname, '../reports/CEFR-ANALYSIS.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✅ Analysis saved: ${reportPath}`);

