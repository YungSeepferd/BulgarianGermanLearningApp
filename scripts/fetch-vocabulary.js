#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// Roo Code API integration
async function callRooCodeModel(model, prompt) {
  try {
    const cmd = `ollama run ${model} "${prompt}"`;
    const result = execSync(cmd, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    console.error(`Error calling Roo Code model ${model}:`, error);
    throw error;
  }
}

async function fetchVocabulary(url) {
  try {
    // 1. Use Roo Code Planner to fetch and process vocabulary
    const plannerPrompt = `You are a vocabulary extraction specialist for Bulgarian-German language learning. 

Extract vocabulary items and metadata from the following URL: ${url}

URL Validation:
1. Check for valid language learning resource
2. Verify content reliability and accuracy
3. Extract publication/last update date
4. Note any regional/dialect focus

Content Processing:
1. Word/phrase extraction with context
2. Translation verification (BG ↔ DE)
3. Usage pattern analysis
4. CEFR level assessment

Required Entry Fields:
1. Bulgarian term with pronunciation
2. German translation(s)
3. Part of speech
4. CEFR level (A1-C2)
5. Usage examples
6. Category tags
7. Source metadata

Return the result in JSON format with the structure:
{
  "source_metadata": {...},
  "vocabulary_entries": [...],
  "validation": {...}
}`;

    const result = await callRooCodeModel('roo-planner', plannerPrompt);

    // 2. Parse and validate the JSON
    const vocab = JSON.parse(result);
    
    // 3. Load existing vocabulary
    const existingPath = path.join(__dirname, '..', 'data', 'vocabulary.json');
    const existing = JSON.parse(await readFile(existingPath, 'utf8'));

    // 4. Merge and deduplicate
    const merged = mergeVocabulary(existing, vocab.vocabulary_entries);

    // 5. Run semantic chunking with Roo Code Context
    const contextPrompt = `Analyze the following Bulgarian-German vocabulary entries and suggest semantic groupings based on:
1. Core concepts and derived terms
2. Common usage contexts
3. Related grammatical patterns
4. Cultural/pragmatic connections

Vocabulary to analyze: ${JSON.stringify(merged)}

Return semantic groups with themes, core concepts, usage contexts, and learning progression order.`;

    const chunks = await callRooCodeModel('roo-context', contextPrompt);

    // 6. Validate progression with Roo Code Reasoner
    const reasonerPrompt = `Analyze vocabulary progression across CEFR levels for the following Bulgarian-German vocabulary:

Vocabulary to validate: ${JSON.stringify(merged)}

Provide detailed analysis of:
1. CEFR alignment (A1-B2)
2. Learning dependencies
3. Usage patterns
4. Bidirectional considerations (BG→DE, DE→BG)
5. Optimization suggestions

Return in structured JSON format with progression analysis and recommendations.`;

    const validation = await callRooCodeModel('roo-reasoner', reasonerPrompt);

    // 7. Save results
    const timestamp = new Date().toISOString();
    const resultsDir = path.join(__dirname, '..', 'data', 'vocabulary-updates');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    await writeFile(
      path.join(resultsDir, `update-${timestamp}.json`),
      JSON.stringify({
        source: url,
        timestamp,
        vocabulary: merged,
        semantic_analysis: JSON.parse(chunks),
        progression_validation: JSON.parse(validation)
      }, null, 2)
    );

    console.log(`
Vocabulary Processing Complete
============================
Source: ${url}
New entries: ${vocab.vocabulary_entries.length}
Total entries: ${merged.length}
Results saved to: data/vocabulary-updates/update-${timestamp}.json

Models used:
- roo-planner: Vocabulary extraction and processing
- roo-context: Semantic analysis and grouping
- roo-reasoner: Progression validation and CEFR alignment

Next steps:
1. Review the semantic analysis in the output file
2. Check the progression validation report
3. Run tests: npm run test
4. If everything looks good, copy the new vocabulary.json to data/
    `);

  } catch (error) {
    console.error('Error processing vocabulary:', error);
    process.exit(1);
  }
}

function mergeVocabulary(existing, newItems) {
  const seen = new Set(existing.map(e => `${e.bg?.term || e.bulgarian}-${e.de?.primary || e.german}`));
  const merged = [...existing];

  for (const item of newItems) {
    const key = `${item.bg?.term || item.bulgarian}-${item.de?.primary || item.german}`;
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  }

  return merged.sort((a, b) => (a.id || a.bg?.term).localeCompare(b.id || b.bg?.term));
}

// If called directly
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node fetch-vocabulary.js <URL>');
    process.exit(1);
  }
  fetchVocabulary(url);
}