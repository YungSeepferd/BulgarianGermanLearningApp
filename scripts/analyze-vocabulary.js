#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

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

async function analyzeVocabulary() {
  try {
    // 1. Load vocabulary
    const vocabPath = path.join(__dirname, '..', 'data', 'vocabulary.json');
    const vocabulary = JSON.parse(await readFile(vocabPath, 'utf8'));

    // 2. Run semantic chunking with Roo Code Context
    const contextPrompt = `Analyze the following Bulgarian-German vocabulary entries and suggest semantic groupings based on:
1. Core concepts and derived terms
2. Common usage contexts
3. Related grammatical patterns
4. Cultural/pragmatic connections

Vocabulary to analyze: ${JSON.stringify(vocabulary)}

For each group, provide:
- Central concept/theme
- Member words/phrases
- Common contexts of use
- Learning progression order
- Cross-references to other groups

Rules:
1. Focus on natural language acquisition patterns
2. Consider both Bulgarian and German semantic fields
3. Note false friends and potential confusion points
4. Suggest memory hooks and learning strategies

Return the result in JSON format with semantic_groups array containing theme, core_concepts, derived_terms, usage_contexts, progression, related_groups, false_friends, and memory_hooks.`;

    console.log('Running semantic analysis with Roo Code Context...');
    const chunks = await callRooCodeModel('roo-context', contextPrompt);

    // 3. Validate progression with Roo Code Reasoner
    const reasonerPrompt = `Analyze vocabulary progression across CEFR levels for the following Bulgarian-German vocabulary:

Vocabulary to validate: ${JSON.stringify(vocabulary)}

Provide detailed analysis of:
1. CEFR Alignment (A1-B2 levels)
   - A1: Basic everyday expressions, simple personal information, essential survival phrases
   - A2: Regular daily activities, simple descriptions, basic social interactions
   - B1: Work and study topics, personal opinions, future plans and past experiences
   - B2: Technical discussions, abstract concepts, complex opinions

2. Learning Dependencies
   - Core vocabulary prerequisites
   - Grammar concept requirements
   - Cultural knowledge needs
   - Communication skill level

3. Usage Analysis
   - Frequency in target contexts
   - Pragmatic importance
   - Regional variation impact
   - Register requirements

4. Bidirectional Considerations
   - BG→DE specific challenges (case system, word order)
   - DE→BG specific issues (aspect system, verb conjugation)

5. Progression Logic and optimization suggestions

Return in structured JSON format with progression_analysis containing metadata, entries, and optimization_suggestions.`;

    console.log('Validating learning progression with Roo Code Reasoner...');
    const validation = await callRooCodeModel('roo-reasoner', reasonerPrompt);

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
      progression_validation: JSON.parse(validation),
      models_used: {
        semantic: 'roo-context',
        validation: 'roo-reasoner'
      }
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
============================
Total entries analyzed: ${vocabulary.length}
Models used:
- roo-context: Semantic analysis and grouping
- roo-reasoner: Progression validation and CEFR alignment

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
  const { timestamp, vocabulary_count, semantic_analysis, progression_validation, models_used } = results;
  
  return `# Vocabulary Analysis Report
Generated: ${timestamp}
Total entries: ${vocabulary_count}
Analysis models: ${models_used.semantic} (semantic), ${models_used.validation} (progression)

## Semantic Analysis
${formatSemanticAnalysis(semantic_analysis)}

## Progression Validation
${formatProgressionValidation(progression_validation)}

## Recommendations
${generateRecommendations(semantic_analysis, progression_validation)}

## Analysis Summary
This analysis was performed using Roo Code's specialized models:
- **roo-context** provided semantic grouping and relationship analysis
- **roo-reasoner** delivered CEFR alignment and learning progression validation

The dual-model approach ensures both comprehensive semantic understanding and precise educational progression analysis.
`;
}

function formatSemanticAnalysis(analysis) {
  // Format the semantic groups in a readable way
  return (analysis.semantic_groups || [])
    .map(group => `
### ${group.theme}
- **Core concepts**: ${group.core_concepts?.join(', ') || 'N/A'}
- **Derived terms**: ${group.derived_terms?.map(terms => terms.join(', ')).join('; ') || 'N/A'}
- **Usage contexts**: ${group.usage_contexts?.join(', ') || 'N/A'}
- **Suggested progression**: ${group.progression?.join(' → ') || 'N/A'}
- **Related groups**: ${group.related_groups?.join(', ') || 'N/A'}
${group.false_friends && group.false_friends.length > 0 ? `- **False friends**: ${group.false_friends.map(f => `${f.bg} ≠ ${f.not} (${f.de})`).join(', ')}` : ''}
${group.memory_hooks && group.memory_hooks.length > 0 ? `- **Memory hooks**: ${group.memory_hooks.join(', ')}` : ''}
`).join('\n');
}

function formatProgressionValidation(validation) {
  // Format the validation results clearly
  const progression = validation.progression_analysis || validation;
  
  let output = '';
  
  if (progression.metadata) {
    output += `
### Metadata
- **Total entries**: ${progression.metadata.total_entries}
- **Level distribution**: ${Object.entries(progression.metadata.level_distribution || {}).map(([level, count]) => `${level}: ${count}`).join(', ')}
- **Analysis date**: ${progression.metadata.analysis_date}
`;
  }

  if (progression.optimization_suggestions) {
    output += `
### Optimization Suggestions
${formatOptimizationSuggestions(progression.optimization_suggestions)}
`;
  }

  return output;
}

function formatOptimizationSuggestions(suggestions) {
  let output = '';
  
  if (suggestions.reordering && suggestions.reordering.length > 0) {
    output += `
**Reordering:**
${suggestions.reordering.map(item => `- Move ${item.move.join(', ')} from ${item.from} to ${item.to} (${item.reason})`).join('\n')}
`;
  }

  if (suggestions.level_adjustments && suggestions.level_adjustments.length > 0) {
    output += `
**Level Adjustments:**
${suggestions.level_adjustments.map(item => `- ${item.term}: ${item.current} → ${item.suggested} (${item.reason})`).join('\n')}
`;
  }

  if (suggestions.gap_analysis) {
    output += `
**Gap Analysis:**
${Object.entries(suggestions.gap_analysis).map(([type, gaps]) => `
**${type}:**
${Array.isArray(gaps) ? gaps.map(gap => `- ${gap.concept || gap} (impact: ${gap.impact})`).join('\n') : ''}
`).join('\n')}
`;
  }

  return output;
}

function generateRecommendations(semantic_analysis, progression_validation) {
  // Generate actionable recommendations based on the analysis
  const recommendations = [];
  
  // Add semantic grouping recommendations
  if (semantic_analysis.recommendations) {
    recommendations.push(...semantic_analysis.recommendations);
  }
  
  // Add progression-based recommendations
  const progression = progression_validation.progression_analysis || progression_validation;
  if (progression.optimization_suggestions) {
    const suggestions = progression.optimization_suggestions;
    
    if (suggestions.level_adjustments) {
      recommendations.push(`Consider ${suggestions.level_adjustments.length} level adjustments for better CEFR alignment`);
    }
    
    if (suggestions.reordering) {
      recommendations.push(`Review ${suggestions.reordering.length} suggested reordering for improved learning flow`);
    }
    
    if (suggestions.gap_analysis) {
      const totalGaps = Object.values(suggestions.gap_analysis).reduce((sum, gaps) => sum + (Array.isArray(gaps) ? gaps.length : 0), 0);
      if (totalGaps > 0) {
        recommendations.push(`Address ${totalGaps} identified gaps in learning progression`);
      }
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Vocabulary structure appears well-organized with no major issues identified');
  }
  
  return recommendations
    .map(rec => `- ${rec}`)
    .join('\n');
}

// If called directly
if (require.main === module) {
  analyzeVocabulary();
}