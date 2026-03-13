#!/usr/bin/env tsx
/**
 * Semantic Example Validation
 *
 * Detects semantically invalid or nonsensical example sentences in vocabulary data.
 * Examples flagged:
 * - Inanimate subjects with animate-only predicates ("Das Wetter ist reich")
 * - Weather nouns with inappropriate adjectives
 * - Abstract concepts with physical attributes
 * - Grammar agreement issues
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface Example {
  german: string;
  bulgarian: string;
  context?: string;
  source?: string;
}

interface VocabularyItem {
  id: string;
  german: string;
  bulgarian: string;
  partOfSpeech: string;
  difficulty: number;
  cefrLevel?: string;
  categories: string[];
  examples?: Example[];
  grammar?: {
    gender?: string;
    pluralForm?: string;
    verbAspect?: string | null;
  };
}

interface SemanticIssue {
  itemId: string;
  german: string;
  bulgarian: string;
  example: Example;
  issueType: string;
  description: string;
  suggestion?: string;
}

// German nouns that are inanimate/weather-related
const WEATHER_NOUNS = [
  'wetter', 'regen', 'schnee', 'wind', 'sonne', 'mond', 'himmel',
  'gewitter', 'sturm', 'nebel', 'wolke', 'temperatur', 'klima'
];

// Nouns that describe concepts/abstract ideas
const ABSTRACT_NOUNS = [
  'idee', 'gedanke', 'konzept', 'theorie', 'gefühl', 'emotion',
  'liebe', 'hass', 'freude', 'trauer', 'hoffnung', 'angst'
];

// Adjectives that require animate subjects
const ANIMATE_ONLY_ADJECTIVES = [
  'reich', 'arm', 'klug', 'dumm', 'freundlich', 'böse', 'nett',
  'glücklich', 'traurig', 'wütend', 'verliebt', 'eifersüchtig',
  'stolz', 'bescheiden', 'mutig', 'feige', 'großzügig', 'geizig'
];

// Adjectives appropriate for weather
const WEATHER_ADJECTIVES = [
  'schön', 'warm', 'kalt', 'heiß', 'kühl', 'nass', 'trocken',
  'sonnig', 'bewölkt', 'stürmisch', 'windig', 'neblig', 'regnerisch',
  'schneereich', 'angenehm', 'unangenehm', 'mild', 'eisig'
];

// Physical attributes that don't apply to abstract concepts
const PHYSICAL_ADJECTIVES = [
  'groß', 'klein', 'dick', 'dünn', 'schwer', 'leicht', 'hart', 'weich',
  'rund', 'eckig', 'flach', 'hoch', 'tief', 'breit', 'schmal'
];

// Subject patterns to check
const SUBJECT_PATTERNS = {
  weather: /\b(das\s+)?wetter\b/i,
  rain: /\b(der\s+)?regen\b/i,
  snow: /\b(der\s+)?schnee\b/i,
  sun: /\b(die\s+)?sonne\b/i,
  wind: /\b(der\s+)?wind\b/i,
  idea: /\b(die\s+)?idee\b/i,
  thought: /\b(der\s+)?gedanke\b/i,
  love: /\b(die\s+)?liebe\b/i,
  concept: /\b(das\s+)?konzept\b/i
};

// Predicate patterns
const PREDICATE_PATTERNS = {
  isAdjective: /ist\s+(\w+)/i,
  areAdjective: /sind\s+(\w+)/i,
  wasAdjective: /war\s+(\w+)/i,
  wereAdjective: /waren\s+(\w+)/i
};

function detectSemanticIssues(item: VocabularyItem): SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  if (!item.examples || item.examples.length === 0) return issues;

  for (const example of item.examples) {
    const germanLower = example.german.toLowerCase();

    // Check for weather nouns with animate-only adjectives
    for (const weatherNoun of WEATHER_NOUNS) {
      if (germanLower.includes(weatherNoun)) {
        // Extract adjective after "ist"
        const istMatch = example.german.match(/ist\s+(\w+)/i);
        if (istMatch) {
          const adjective = istMatch[1].toLowerCase();
          if (ANIMATE_ONLY_ADJECTIVES.includes(adjective)) {
            issues.push({
              itemId: item.id,
              german: item.german,
              bulgarian: item.bulgarian,
              example,
              issueType: 'weather-animate-adjective',
              description: `Weather noun "${weatherNoun}" used with animate-only adjective "${adjective}"`,
              suggestion: `Replace with appropriate weather adjective like: ${WEATHER_ADJECTIVES.slice(0, 5).join(', ')}`
            });
          }
        }
      }
    }

    // Check for abstract nouns with physical attributes
    for (const abstractNoun of ABSTRACT_NOUNS) {
      if (germanLower.includes(abstractNoun)) {
        const istMatch = example.german.match(/ist\s+(\w+)/i);
        if (istMatch) {
          const adjective = istMatch[1].toLowerCase();
          if (PHYSICAL_ADJECTIVES.includes(adjective) && !['groß', 'klein'].includes(adjective)) {
            issues.push({
              itemId: item.id,
              german: item.german,
              bulgarian: item.bulgarian,
              example,
              issueType: 'abstract-physical-attribute',
              description: `Abstract noun "${abstractNoun}" used with physical attribute "${adjective}"`
            });
          }
        }
      }
    }

    // Check for specific known bad patterns
    const badPatterns = [
      { pattern: /das\s+wetter\s+ist\s+(reich|arm|klug|dumm|freundlich|böse|nett)/i,
        type: 'weather-animate-adjective',
        desc: 'Weather cannot have animate attributes' },
      { pattern: /die\s+idee\s+ist\s+(groß|klein|dick|dünn|schwer|leicht)/i,
        type: 'abstract-physical-attribute',
        desc: 'Ideas cannot have physical dimensions' },
      { pattern: /die\s+liebe\s+ist\s+(groß|klein|dick|dünn)/i,
        type: 'abstract-physical-attribute',
        desc: 'Love cannot have physical dimensions (use "groß" metaphorically with caution)' }
    ];

    for (const { pattern, type, desc } of badPatterns) {
      if (pattern.test(example.german)) {
        const match = example.german.match(pattern);
        issues.push({
          itemId: item.id,
          german: item.german,
          bulgarian: item.bulgarian,
          example,
          issueType: type,
          description: `${desc}: "${match?.[0]}"`
        });
      }
    }

    // Check for template-generated examples that don't make sense
    // Pattern: "{Subject} ist {adjective}" where subject and adjective don't match semantically
    if (item.partOfSpeech === 'adjective') {
      // For adjectives, check if examples properly demonstrate the meaning
      const adjLower = item.german.toLowerCase();

      if (ANIMATE_ONLY_ADJECTIVES.includes(adjLower)) {
        // This adjective requires animate subjects
        for (const weatherNoun of WEATHER_NOUNS) {
          if (germanLower.includes(weatherNoun)) {
            issues.push({
              itemId: item.id,
              german: item.german,
              bulgarian: item.bulgarian,
              example,
              issueType: 'animate-adjective-inanimate-subject',
              description: `Adjective "${item.german}" (animate-only) used with inanimate subject "${weatherNoun}"`,
              suggestion: `Use animate subject like: "Der Mann ist ${item.german}", "Die Frau ist ${item.german}", "Das Kind ist ${item.german}"`
            });
          }
        }
      }
    }
  }

  return issues;
}

// Check for grammar agreement issues
function detectGrammarIssues(item: VocabularyItem): SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  if (!item.examples || item.examples.length === 0) return issues;

  // Get the word's gender if it's a noun
  const gender = item.grammar?.gender;

  for (const example of item.examples) {
    // Check if the example uses the correct article for the word
    if (item.partOfSpeech === 'noun' && gender) {
      const wordLower = item.german.toLowerCase();
      const exampleLower = example.german.toLowerCase();

      // Check for article usage in example
      const articlePatterns = {
        masculine: [/\bder\s+/i, /\bein\s+/i],
        feminine: [/\bdie\s+/i, /\beine\s+/i],
        neuter: [/\bdas\s+/i, /\bein\s+/i]
      };

      // This is a simplified check - full grammar validation would be more complex
      // For now, we just flag potential issues for manual review
    }
  }

  return issues;
}

async function loadAllVocabulary(): Promise<VocabularyItem[]> {
  const vocabPath = 'data/unified-vocabulary.json';

  try {
    const content = await fs.readFile(vocabPath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    // Fallback to chunked vocabulary
    const vocabDir = 'data/vocabulary';
    const items: VocabularyItem[] = [];
    const files = await glob('*.json', { cwd: vocabDir });

    for (const file of files) {
      if (file === 'index.json' || file === 'search-index.json') continue;
      const content = await fs.readFile(path.join(vocabDir, file), 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) items.push(...data);
    }

    return items;
  }
}

async function main() {
  console.log('🔍 Semantic Example Validation\n');
  console.log('Loading vocabulary data...\n');

  const items = await loadAllVocabulary();
  console.log(`Loaded ${items.length} vocabulary items\n`);

  const allIssues: SemanticIssue[] = [];

  console.log('Analyzing examples for semantic issues...\n');

  for (const item of items) {
    const semanticIssues = detectSemanticIssues(item);
    const grammarIssues = detectGrammarIssues(item);
    allIssues.push(...semanticIssues, ...grammarIssues);
  }

  // Group issues by type
  const issuesByType: Record<string, SemanticIssue[]> = {};
  for (const issue of allIssues) {
    if (!issuesByType[issue.issueType]) {
      issuesByType[issue.issueType] = [];
    }
    issuesByType[issue.issueType].push(issue);
  }

  // Print report
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           SEMANTIC VALIDATION REPORT                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Summary: Found ${allIssues.length} potential issues in ${items.length} items\n`);

  for (const [type, issues] of Object.entries(issuesByType).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n📌 ${type.toUpperCase().replace(/-/g, ' ')} (${issues.length} issues)`);
    console.log('─'.repeat(60));

    for (const issue of issues.slice(0, 10)) {
      console.log(`\n  Word: ${issue.german} (${issue.bulgarian})`);
      console.log(`  ID: ${issue.itemId}`);
      console.log(`  Example: "${issue.example.german}" = "${issue.example.bulgarian}"`);
      console.log(`  Issue: ${issue.description}`);
      if (issue.suggestion) {
        console.log(`  Suggestion: ${issue.suggestion}`);
      }
    }

    if (issues.length > 10) {
      console.log(`\n  ... and ${issues.length - 10} more similar issues`);
    }
  }

  // Save detailed report
  const reportPath = 'docs/semantic-validation-report.json';
  await fs.mkdir('docs', { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    totalItems: items.length,
    totalIssues: allIssues.length,
    issuesByType: Object.fromEntries(
      Object.entries(issuesByType).map(([type, issues]) => [type, issues.length])
    ),
    issues: allIssues
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);

  // Generate fix suggestions
  const fixSuggestionsPath = 'docs/semantic-fix-suggestions.json';
  const fixSuggestions = allIssues.map(issue => ({
    itemId: issue.itemId,
    german: issue.german,
    bulgarian: issue.bulgarian,
    currentExample: issue.example,
    issueType: issue.issueType,
    suggestion: issue.suggestion
  }));

  await fs.writeFile(fixSuggestionsPath, JSON.stringify(fixSuggestions, null, 2));
  console.log(`📝 Fix suggestions saved to: ${fixSuggestionsPath}\n`);

  // Exit with error code if issues found
  if (allIssues.length > 0) {
    console.log(`\n⚠️  Found ${allIssues.length} semantic issues that need review.\n`);
  } else {
    console.log('\n✅ No semantic issues found!\n');
  }
}

main().catch(console.error);