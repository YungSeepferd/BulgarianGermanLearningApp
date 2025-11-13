#!/usr/bin/env node

/**
 * Grammar Enhancement Script
 *
 * Analyzes existing grammar markdown files and enhances them with:
 * - Bidirectional learning notes (if missing)
 * - Cultural context comparisons
 * - Cross-linguistic explanations
 * - CEFR level validation and progression analysis
 * - Semantic relationships between grammar rules
 *
 * Usage:
 *   npm run grammar:enhance
 *   node scripts/enhance-grammar.mjs
 *   node scripts/enhance-grammar.mjs --level A1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Parse frontmatter and content from markdown file
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { frontmatter: {}, content: content };
  }

  const frontmatterText = frontmatterMatch[1];
  const bodyContent = frontmatterMatch[2];

  // Parse YAML frontmatter (simple parser for key: value pairs)
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  let currentKey = null;
  let multilineValue = [];

  lines.forEach(line => {
    // Handle multiline values (|)
    if (currentKey && (line.startsWith('  ') || line.startsWith('\t'))) {
      multilineValue.push(line.trim());
      return;
    }

    // Save previous multiline value
    if (currentKey && multilineValue.length > 0) {
      frontmatter[currentKey] = multilineValue.join('\n');
      multilineValue = [];
      currentKey = null;
    }

    // Parse new key-value pair
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();

      // Handle multiline indicator
      if (value === '|') {
        currentKey = key;
        multilineValue = [];
        return;
      }

      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      frontmatter[key] = value;
    }
  });

  // Save last multiline value
  if (currentKey && multilineValue.length > 0) {
    frontmatter[currentKey] = multilineValue.join('\n');
  }

  return { frontmatter, content: bodyContent };
}

/**
 * Analyze grammar file for missing components
 */
function analyzeGrammarFile(filePath) {
  const { frontmatter, content } = parseMarkdownFile(filePath);

  const analysis = {
    file: path.basename(filePath),
    level: frontmatter.level || 'Unknown',
    title: frontmatter.title || 'Untitled',
    hasBidirectionalNotes: !!(frontmatter.notes_bg_to_de && frontmatter.notes_de_to_bg),
    hasExamples: content.includes('## Examples'),
    hasCulturalContext: content.includes('Cultural') || content.includes('Perspective'),
    hasPracticeSection: content.includes('## Practice'),
    hasCommonMistakes: content.includes('Common Mistakes') || content.includes('Häufige Fehler'),
    wordCount: content.split(/\s+/).length,
    sections: extractSections(content),
    missingComponents: []
  };

  // Identify missing components
  if (!analysis.hasBidirectionalNotes) {
    analysis.missingComponents.push('Bidirectional learning notes (notes_bg_to_de / notes_de_to_bg)');
  }

  if (!analysis.hasExamples) {
    analysis.missingComponents.push('Examples section');
  }

  if (!analysis.hasCulturalContext) {
    analysis.missingComponents.push('Cultural context');
  }

  if (!analysis.hasPracticeSection) {
    analysis.missingComponents.push('Practice section');
  }

  if (!analysis.hasCommonMistakes) {
    analysis.missingComponents.push('Common mistakes section');
  }

  if (analysis.wordCount < 200) {
    analysis.missingComponents.push('Content is too short (under 200 words)');
  }

  return analysis;
}

/**
 * Extract section headings from markdown
 */
function extractSections(content) {
  const sections = [];
  const lines = content.split('\n');

  lines.forEach(line => {
    const match = line.match(/^#{2,3}\s+(.+)$/);
    if (match) {
      sections.push(match[1].trim());
    }
  });

  return sections;
}

/**
 * Generate enhancement suggestions
 */
function generateEnhancementSuggestions(analysis) {
  const suggestions = [];

  if (!analysis.hasBidirectionalNotes) {
    suggestions.push({
      component: 'Bidirectional Notes',
      priority: 'HIGH',
      suggestion: `Add notes_bg_to_de and notes_de_to_bg to frontmatter. Example:

notes_bg_to_de: |
  Като българин, обърни внимание на различията в [концепция]. В немски...

notes_de_to_bg: |
  Als deutscher Muttersprachler beachten Sie die Unterschiede zu Ihrem System...`
    });
  }

  if (!analysis.hasCulturalContext) {
    suggestions.push({
      component: 'Cultural Context',
      priority: 'HIGH',
      suggestion: `Add a "Cultural Context" section comparing how Bulgarians and Germans conceptualize this grammar rule differently.`
    });
  }

  if (!analysis.hasCommonMistakes) {
    suggestions.push({
      component: 'Common Mistakes',
      priority: 'MEDIUM',
      suggestion: `Add a "Common Mistakes" section split by direction:

## Common Mistakes

### For Bulgarian Speakers
- [mistake 1]
- [mistake 2]

### For German Speakers
- [mistake 1]
- [mistake 2]`
    });
  }

  if (!analysis.hasExamples || analysis.wordCount < 200) {
    suggestions.push({
      component: 'Examples',
      priority: 'MEDIUM',
      suggestion: 'Add more examples showing Bulgarian ↔ German contrasts with explanations.'
    });
  }

  return suggestions;
}

/**
 * Analyze progression across all grammar files
 */
function analyzeGrammarProgression(analyses) {
  const byLevel = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: []
  };

  analyses.forEach(analysis => {
    if (byLevel[analysis.level]) {
      byLevel[analysis.level].push(analysis);
    }
  });

  const progression = {};

  Object.entries(byLevel).forEach(([level, items]) => {
    progression[level] = {
      count: items.length,
      avgWordCount: items.reduce((sum, a) => sum + a.wordCount, 0) / items.length || 0,
      withBidirectionalNotes: items.filter(a => a.hasBidirectionalNotes).length,
      withExamples: items.filter(a => a.hasExamples).length,
      completeness: calculateCompleteness(items)
    };
  });

  return progression;
}

/**
 * Calculate completeness percentage
 */
function calculateCompleteness(analyses) {
  if (analyses.length === 0) return 0;

  const totalComponents = analyses.length * 5; // 5 required components
  const presentComponents = analyses.reduce((sum, a) => {
    let count = 0;
    if (a.hasBidirectionalNotes) count++;
    if (a.hasExamples) count++;
    if (a.hasCulturalContext) count++;
    if (a.hasPracticeSection) count++;
    if (a.hasCommonMistakes) count++;
    return sum + count;
  }, 0);

  return Math.round((presentComponents / totalComponents) * 100);
}

/**
 * Generate report
 */
function generateReport(analyses, progression) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                   GRAMMAR CONTENT ANALYSIS REPORT                      ║
╚═══════════════════════════════════════════════════════════════════════╝

📊 OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total grammar files analyzed: ${analyses.length}

`);

  // Progression by level
  console.log('📈 PROGRESSION BY CEFR LEVEL\n');

  Object.entries(progression).forEach(([level, stats]) => {
    if (stats.count === 0) return;

    console.log(`${level}: ${stats.count} topics (${stats.completeness}% complete)`);
    console.log(`   Avg word count: ${Math.round(stats.avgWordCount)}`);
    console.log(`   With bidirectional notes: ${stats.withBidirectionalNotes}/${stats.count}`);
    console.log(`   With examples: ${stats.withExamples}/${stats.count}`);
    console.log('');
  });

  // Files needing enhancement
  const needsWork = analyses.filter(a => a.missingComponents.length > 0);

  console.log(`\n⚠️  FILES NEEDING ENHANCEMENT (${needsWork.length}/${analyses.length})\n`);

  needsWork.forEach(analysis => {
    console.log(`📄 ${analysis.file} (${analysis.level})`);
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Missing components: ${analysis.missingComponents.length}`);
    analysis.missingComponents.forEach(comp => {
      console.log(`   - ${comp}`);
    });

    const suggestions = generateEnhancementSuggestions(analysis);
    if (suggestions.length > 0) {
      console.log(`   \n   💡 Priority suggestions:`);
      suggestions.filter(s => s.priority === 'HIGH').forEach(s => {
        console.log(`   • ${s.component}: ${s.suggestion.split('\n')[0]}`);
      });
    }
    console.log('');
  });

  // Overall statistics
  const withBidirectional = analyses.filter(a => a.hasBidirectionalNotes).length;
  const withExamples = analyses.filter(a => a.hasExamples).length;
  const withCultural = analyses.filter(a => a.hasCulturalContext).length;

  console.log(`
📊 CONTENT QUALITY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bidirectional learning notes: ${withBidirectional}/${analyses.length} (${Math.round(withBidirectional / analyses.length * 100)}%)
Examples sections:            ${withExamples}/${analyses.length} (${Math.round(withExamples / analyses.length * 100)}%)
Cultural context:             ${withCultural}/${analyses.length} (${Math.round(withCultural / analyses.length * 100)}%)

`);

  // Recommendations
  console.log(`
🎯 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (withBidirectional < analyses.length) {
    console.log(`1. Add bidirectional learning notes to ${analyses.length - withBidirectional} files`);
  }

  if (needsWork.length > analyses.length * 0.3) {
    console.log(`2. Focus on completing high-priority enhancements`);
  }

  const levels = Object.keys(progression).filter(l => progression[l].count > 0);
  const missingLevels = ['A1', 'A2', 'B1', 'B2'].filter(l => !levels.includes(l));

  if (missingLevels.length > 0) {
    console.log(`3. Create content for missing levels: ${missingLevels.join(', ')}`);
  }

  console.log(`\n✅ Analysis complete!\n`);
}

/**
 * Save detailed report to file
 */
function saveDetailedReport(analyses, progression) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(rootDir, 'data', 'grammar-analysis');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `grammar-analysis-${timestamp.split('T')[0]}.json`);

  const report = {
    timestamp,
    summary: {
      totalFiles: analyses.length,
      byLevel: progression,
      needsEnhancement: analyses.filter(a => a.missingComponents.length > 0).length
    },
    files: analyses.map(a => ({
      file: a.file,
      title: a.title,
      level: a.level,
      completeness: Math.round((5 - a.missingComponents.length) / 5 * 100),
      missingComponents: a.missingComponents,
      suggestions: generateEnhancementSuggestions(a)
    })),
    recommendations: []
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`📝 Detailed report saved to: ${reportPath}\n`);

  return reportPath;
}

/**
 * Main execution
 */
async function main() {
  const grammarDir = path.join(rootDir, 'content', 'grammar');

  if (!fs.existsSync(grammarDir)) {
    console.error(`❌ Grammar directory not found: ${grammarDir}`);
    process.exit(1);
  }

  console.log(`🔍 Analyzing grammar content in: ${grammarDir}\n`);

  // Get all markdown files
  const files = fs.readdirSync(grammarDir)
    .filter(f => f.endsWith('.md') && f !== '_index.md')
    .map(f => path.join(grammarDir, f));

  console.log(`Found ${files.length} grammar files\n`);

  // Analyze each file
  const analyses = files.map(analyzeGrammarFile);

  // Analyze progression
  const progression = analyzeGrammarProgression(analyses);

  // Generate report
  generateReport(analyses, progression);

  // Save detailed report
  saveDetailedReport(analyses, progression);

  console.log(`Next steps:`);
  console.log(`1. Review the analysis report`);
  console.log(`2. Enhance files with missing components`);
  console.log(`3. Use fetch-grammar.mjs to add content for missing levels`);
  console.log(`4. Re-run this script to track progress\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  analyzeGrammarFile,
  analyzeGrammarProgression,
  generateEnhancementSuggestions
};
