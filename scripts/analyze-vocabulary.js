#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function analyzeVocabulary() {
  try {
    // 1. Load vocabulary
    const vocabPath = path.join(__dirname, '..', 'data', 'vocabulary.json');
    const vocabulary = JSON.parse(await readFile(vocabPath, 'utf8'));

    // 2. Run semantic chunking
    const chunkPromptPath = path.join(__dirname, '..', '.claude', 'prompts', 'semantic-chunk.txt');
    const chunkPrompt = await readFile(chunkPromptPath, 'utf8');
    
    console.log('Running semantic analysis...');
    const chunkCmd = `claude -p "${chunkPrompt}\n\nVocabulary to analyze: ${JSON.stringify(vocabulary)}"`;
    const chunks = execSync(chunkCmd, { encoding: 'utf8' });

    // 3. Validate progression
    const validationPromptPath = path.join(__dirname, '..', '.claude', 'prompts', 'validate-progression.txt');
    const validationPrompt = await readFile(validationPromptPath, 'utf8');
    
    console.log('Validating learning progression...');
    const validateCmd = `claude -p "${validationPrompt}\n\nVocabulary to validate: ${JSON.stringify(vocabulary)}"`;
    const validation = execSync(validateCmd, { encoding: 'utf8' });

    // 4. Save results
    const timestamp = new Date().toISOString();
    const resultsDir = path.join(__dirname, '..', 'data', 'vocabulary-analysis');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const results = {
      timestamp,
      vocabulary_count: vocabulary.length,
      semantic_analysis: JSON.parse(chunks),
      progression_validation: JSON.parse(validation)
    };

    await writeFile(
      path.join(resultsDir, `analysis-${timestamp}.json`),
      JSON.stringify(results, null, 2)
    );

    // 5. Generate a human-readable report
    const reportPath = path.join(resultsDir, `analysis-${timestamp}.md`);
    const report = generateReport(results);
    await writeFile(reportPath, report);

    console.log(`
Vocabulary Analysis Complete
==========================
Total entries analyzed: ${vocabulary.length}
Results saved to: 
- JSON: data/vocabulary-analysis/analysis-${timestamp}.json
- Report: data/vocabulary-analysis/analysis-${timestamp}.md

Next steps:
1. Review the semantic groupings in the report
2. Check the progression validation findings
3. Consider suggested improvements
4. Run tests before applying any changes
    `);

  } catch (error) {
    console.error('Error analyzing vocabulary:', error);
    process.exit(1);
  }
}

function generateReport(results) {
  const { timestamp, vocabulary_count, semantic_analysis, progression_validation } = results;
  
  return `# Vocabulary Analysis Report
Generated: ${timestamp}
Total entries: ${vocabulary_count}

## Semantic Analysis
${formatSemanticAnalysis(semantic_analysis)}

## Progression Validation
${formatProgressionValidation(progression_validation)}

## Recommendations
${generateRecommendations(semantic_analysis, progression_validation)}
`;
}

function formatSemanticAnalysis(analysis) {
  // Format the semantic groups in a readable way
  return Object.entries(analysis.semantic_groups || {})
    .map(([theme, data]) => `
### ${theme}
- Core concepts: ${data.core_concepts.join(', ')}
- Derived terms: ${data.derived_terms.join(', ')}
- Usage contexts: ${data.usage_contexts.join(', ')}
- Suggested progression: ${data.progression.join(' → ')}
- Related groups: ${data.related_groups.join(', ')}
`).join('\n');
}

function formatProgressionValidation(validation) {
  // Format the validation results clearly
  return Object.entries(validation)
    .map(([aspect, details]) => `
### ${aspect}
${details}
`).join('\n');
}

function generateRecommendations(semantic_analysis, progression_validation) {
  // Generate actionable recommendations based on the analysis
  const recommendations = [];
  
  // Add semantic grouping recommendations
  if (semantic_analysis.recommendations) {
    recommendations.push(...semantic_analysis.recommendations);
  }
  
  // Add progression-based recommendations
  if (progression_validation.recommendations) {
    recommendations.push(...progression_validation.recommendations);
  }
  
  return recommendations
    .map(rec => `- ${rec}`)
    .join('\n');
}

// If called directly
if (require.main === module) {
  analyzeVocabulary();
}