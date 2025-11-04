#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

async function fetchVocabulary(url) {
  try {
    // 1. Use Claude to fetch and process vocabulary
    const promptPath = path.join(__dirname, '..', '.claude', 'prompts', 'fetch-vocabulary.txt');
    const prompt = await readFile(promptPath, 'utf8');
    
    const claudeCmd = `claude -p "${prompt}\n\nURL to process: ${url}"`;
    const result = execSync(claudeCmd, { encoding: 'utf8' });

    // 2. Parse and validate the JSON
    const vocab = JSON.parse(result);
    
    // 3. Load existing vocabulary
    const existingPath = path.join(__dirname, '..', 'data', 'vocabulary.json');
    const existing = JSON.parse(await readFile(existingPath, 'utf8'));

    // 4. Merge and deduplicate
    const merged = mergeVocabulary(existing, vocab);

    // 5. Run semantic chunking
    const chunkPromptPath = path.join(__dirname, '..', '.claude', 'prompts', 'semantic-chunk.txt');
    const chunkPrompt = await readFile(chunkPromptPath, 'utf8');
    
    const chunkCmd = `claude -p "${chunkPrompt}\n\nVocabulary to analyze: ${JSON.stringify(merged)}"`;
    const chunks = execSync(chunkCmd, { encoding: 'utf8' });

    // 6. Validate progression
    const validationPromptPath = path.join(__dirname, '..', '.claude', 'prompts', 'validate-progression.txt');
    const validationPrompt = await readFile(validationPromptPath, 'utf8');
    
    const validateCmd = `claude -p "${validationPrompt}\n\nVocabulary to validate: ${JSON.stringify(merged)}"`;
    const validation = execSync(validateCmd, { encoding: 'utf8' });

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
New entries: ${vocab.length}
Total entries: ${merged.length}
Results saved to: data/vocabulary-updates/update-${timestamp}.json

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
  const seen = new Set(existing.map(e => `${e.bulgarian}-${e.german}`));
  const merged = [...existing];

  for (const item of newItems) {
    const key = `${item.bulgarian}-${item.german}`;
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  }

  return merged.sort((a, b) => a.id.localeCompare(b.id));
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