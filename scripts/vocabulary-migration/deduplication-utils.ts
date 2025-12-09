/**
 * Deduplication Utilities for Vocabulary Migration
 *
 * Provides functions for identifying duplicate vocabulary items
 * and merging them while preserving the highest quality metadata
 */

import type { UnifiedVocabularyItem, VocabularyCategory } from '../../src/lib/schemas/unified-vocabulary.js';

import type { ProcessingVocabularyItem } from '../types/vocabulary-types.js';
import { levenshteinDistance, normalizeText } from './text-utils';
import { standardizeCategory } from './category-utils.js';

/**
 * Deduplication configuration
 */
export interface DeduplicationConfig {
  /**
   * Threshold for considering two strings as similar (0-1)
   * @default 0.85
   */
  similarityThreshold: number;

  /**
   * Maximum Levenshtein distance for considering two strings as similar
   * @default 3
   */
  maxLevenshteinDistance: number;

  /**
   * Whether to consider different grammatical forms as duplicates
   * @default true
   */
  considerGrammaticalForms: boolean;

  /**
   * Whether to consider different word orders as duplicates
   * @default true
   */
  considerWordOrder: boolean;

  /**
   * Minimum number of examples to consider an item well-documented
   * @default 2
   */
  minExamplesForQuality: number;

  /**
   * Minimum length of notes to consider an item well-documented
   * @default 50
   */
  minNotesLengthForQuality: number;
}

export const DEFAULT_DEDUPLICATION_CONFIG: DeduplicationConfig = {
  similarityThreshold: 0.85,
  maxLevenshteinDistance: 3,
  considerGrammaticalForms: true,
  considerWordOrder: true,
  minExamplesForQuality: 2,
  minNotesLengthForQuality: 50
};

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarityScore: number;
  duplicateType: 'exact' | 'similar' | 'grammatical' | 'content' | 'none';
  duplicateGroup?: string[];
}

/**
 * Quality assessment result
 */
export interface QualityAssessment {
  score: number;
  hasExamples: boolean;
  hasDetailedNotes: boolean;
  hasGrammarInfo: boolean;
  hasAudio: boolean;
  hasEtymology: boolean;
  hasCulturalNotes: boolean;
  hasMnemonics: boolean;
  completenessScore: number;
}

/**
 * Duplicate group with quality assessment
 */
export interface DuplicateGroup {
  groupId: string;
  items: Array<{
    id: string;
    item: UnifiedVocabularyItem;
    quality: QualityAssessment;
    source: string;
  }>;
  similarityType: 'exact' | 'similar' | 'grammatical' | 'content';
}

/**
 * Check if two vocabulary items are duplicates
 */
export function isDuplicate(
  item1: UnifiedVocabularyItem | ProcessingVocabularyItem,
  item2: UnifiedVocabularyItem | ProcessingVocabularyItem,
  config: DeduplicationConfig = DEFAULT_DEDUPLICATION_CONFIG
): DuplicateDetectionResult {
  // Quick check: if either item is missing required fields, they're not duplicates
  if (!item1.german || !item1.bulgarian || !item1.partOfSpeech ||
      !item2.german || !item2.bulgarian || !item2.partOfSpeech) {
    return {
      isDuplicate: false,
      similarityScore: 0.0,
      duplicateType: 'none'
    };
  }

  // Normalize both items
  const normalized1 = normalizeVocabularyItem(item1);
  const normalized2 = normalizeVocabularyItem(item2);

  // 1. Check for exact matches (case-sensitive, no normalization)
  if (item1.german === item2.german &&
      item1.bulgarian === item2.bulgarian &&
      item1.partOfSpeech === item2.partOfSpeech) {
    return {
      isDuplicate: true,
      similarityScore: 1.0,
      duplicateType: 'exact'
    };
  }

  // 2. Check for exact matches on normalized text
  if (isExactMatch(normalized1, normalized2)) {
    return {
      isDuplicate: true,
      similarityScore: 1.0,
      duplicateType: 'exact'
    };
  }

  // 3. Check for grammatical form variations (only if enabled and same part of speech)
  if (config.considerGrammaticalForms && isGrammaticalVariation(normalized1, normalized2)) {
    return {
      isDuplicate: true,
      similarityScore: 0.95,
      duplicateType: 'grammatical'
    };
  }

  // 4. Check for content similarity (only for items with the same part of speech)
  if (normalized1.partOfSpeech === normalized2.partOfSpeech) {
    const similarity = calculateContentSimilarity(normalized1, normalized2, config);

    if (similarity.similarityScore >= config.similarityThreshold) {
      return {
        isDuplicate: true,
        similarityScore: similarity.similarityScore,
        duplicateType: similarity.duplicateType
      };
    }
  }

  return {
    isDuplicate: false,
    similarityScore: 0.0,
    duplicateType: 'none'
  };
}

/**
 * Find all duplicate groups in a collection
 */
export function findDuplicateGroups(
  items: Array<UnifiedVocabularyItem | ProcessingVocabularyItem>,
  config: DeduplicationConfig = DEFAULT_DEDUPLICATION_CONFIG
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processedItems = new Set<string>();
  const itemMap = new Map<string, {
    item: UnifiedVocabularyItem | ProcessingVocabularyItem;
    quality: QualityAssessment;
    source: string;
  }>();

  // Create item map with quality assessment
  items.forEach(item => {
    const id = 'id' in item ? item.id : `temp-${Math.random().toString(36).substring(2, 9)}`;
    itemMap.set(id, {
      item,
      quality: assessItemQuality(item),
      source: 'source' in item ? (item as { source: string }).source : 'unknown'
    });
  });

  // Find duplicate groups
  for (const [id1, entry1] of itemMap) {
    if (processedItems.has(id1)) continue;

    const group: DuplicateGroup = {
      groupId: `group-${Math.random().toString(36).substring(2, 9)}`,
      items: [{
        id: id1,
        item: entry1.item as UnifiedVocabularyItem,
        quality: entry1.quality,
        source: entry1.source
      }],
      similarityType: 'exact'
    };

    for (const [id2, entry2] of itemMap) {
      if (id1 === id2 || processedItems.has(id2)) continue;

      const result = isDuplicate(entry1.item, entry2.item, config);

      if (result.isDuplicate) {
        group.items.push({
          id: id2,
          item: entry2.item as UnifiedVocabularyItem,
          quality: entry2.quality,
          source: entry2.source
        });
        processedItems.add(id2);

        // Update group similarity type
        if (result.duplicateType === 'grammatical' && group.similarityType === 'exact') {
          group.similarityType = 'grammatical';
        } else if (result.duplicateType === 'similar' && group.similarityType !== 'content') {
          group.similarityType = 'similar';
        } else if (result.duplicateType === 'content') {
          group.similarityType = 'content';
        }
      }
    }

    if (group.items.length > 1) {
      groups.push(group);
    }
    processedItems.add(id1);
  }

  return groups;
}

/**
 * Merge duplicate items into a single high-quality item
 */
export function mergeDuplicateGroup(
  group: DuplicateGroup,
  _config: DeduplicationConfig = DEFAULT_DEDUPLICATION_CONFIG
): UnifiedVocabularyItem {
  if (group.items.length === 0) {
    throw new Error('Cannot merge empty group');
  }

  if (group.items.length === 1) {
    return group.items[0].item;
  }

  // 1. Select the highest quality item as the base
  const sortedItems = [...group.items].sort((a, b) => b.quality.score - a.quality.score);

  // Find the first item that has all required fields
  let baseItem = sortedItems[0].item;
  for (const itemEntry of sortedItems) {
    const item = itemEntry.item;
    if (item.german && item.bulgarian && item.partOfSpeech) {
      baseItem = item;
      break;
    }
  }

  // Ensure base item has required fields
  if (!baseItem.german || !baseItem.bulgarian || !baseItem.partOfSpeech) {
    // If no item has required fields, find the best available for each field
    const bestGerman = sortedItems.find(item => item.item.german)?.item.german || '';
    const bestBulgarian = sortedItems.find(item => item.item.bulgarian)?.item.bulgarian || '';
    const bestPartOfSpeech = sortedItems.find(item => item.item.partOfSpeech)?.item.partOfSpeech || 'noun';

    baseItem = {
      ...baseItem,
      german: bestGerman,
      bulgarian: bestBulgarian,
      partOfSpeech: bestPartOfSpeech
    };
  }

  // 2. Create merged item with base properties
  const mergedItem: UnifiedVocabularyItem = {
    ...baseItem,
    id: createMergedId(group.items.map(item => item.id)),
    metadata: {
      ...baseItem.metadata,
      mergeSources: group.items.map(item => item.id),
      sourceFiles: Array.from(new Set(group.items.flatMap(item =>
        item.item.metadata?.sourceFiles || []
      ))).filter(Boolean) as string[]
    },
    updatedAt: new Date(),
    // Ensure required fields are present
    german: baseItem.german || '',
    bulgarian: baseItem.bulgarian || '',
    partOfSpeech: baseItem.partOfSpeech || 'noun',
    difficulty: baseItem.difficulty || 1,
    categories: baseItem.categories || ['uncategorized'],
    createdAt: baseItem.createdAt || new Date()
  };

  // 3. Merge examples
  const allExamples = group.items.flatMap(item => item.item.examples || []);
  mergedItem.examples = mergeExamples(allExamples);

  // 4. Merge notes
  const allNotes = group.items.map(item => item.item.notes).filter(Boolean) as UnifiedVocabularyItem['notes'][];
  mergedItem.notes = mergeNotes(allNotes);

  // 5. Merge cultural notes
  const allCulturalNotes = group.items.flatMap(item => item.item.culturalNotes || []);
  mergedItem.culturalNotes = mergeCulturalNotes(allCulturalNotes);

  // 6. Merge mnemonics
  const allMnemonics = group.items.flatMap(item => item.item.mnemonics || []);
  mergedItem.mnemonics = mergeMnemonics(allMnemonics);

  // 7. Merge synonyms, antonyms, related words
  mergedItem.synonyms = mergeStringArrays(group.items.map(item => item.item.synonyms || []));
  mergedItem.antonyms = mergeStringArrays(group.items.map(item => item.item.antonyms || []));
  mergedItem.relatedWords = mergeStringArrays(group.items.map(item => item.item.relatedWords || []));

  // 8. Select best etymology
  mergedItem.etymology = selectBestEtymology(group.items.map(item => item.item.etymology).filter(Boolean) as string[]);

  // 9. Select best audio
  mergedItem.audio = selectBestAudio(group.items.map(item => item.item.audio).filter(Boolean) as Partial<UnifiedVocabularyItem['audio']>[]);

  // 10. Select best grammar info
  mergedItem.grammar = selectBestGrammar(group.items.map(item => item.item.grammar).filter(Boolean) as Partial<UnifiedVocabularyItem['grammar']>[]);

  // 11. Update categories
  mergedItem.categories = mergeCategories(group.items.map(item => item.item.categories));

  // 12. Update difficulty if needed
  mergedItem.difficulty = selectBestDifficulty(group.items.map(item => item.item.difficulty));

  // Ensure all required fields are present
  if (!mergedItem.german) {
    const germanItem = group.items.find(item => item.item.german)?.item;
    if (germanItem) {
      mergedItem.german = germanItem.german;
    }
  }

  if (!mergedItem.bulgarian) {
    const bulgarianItem = group.items.find(item => item.item.bulgarian)?.item;
    if (bulgarianItem) {
      mergedItem.bulgarian = bulgarianItem.bulgarian;
    }
  }

  if (!mergedItem.partOfSpeech) {
    const posItem = group.items.find(item => item.item.partOfSpeech)?.item;
    if (posItem) {
      mergedItem.partOfSpeech = posItem.partOfSpeech;
    } else {
      mergedItem.partOfSpeech = 'noun';
    }
  }

  if (!mergedItem.categories || mergedItem.categories.length === 0) {
    mergedItem.categories = ['uncategorized'];
  }

  if (!mergedItem.createdAt) {
    mergedItem.createdAt = new Date();
  }

  return mergedItem;
}

/**
 * Normalize vocabulary item for comparison
 */
function normalizeVocabularyItem(item: UnifiedVocabularyItem | ProcessingVocabularyItem): ProcessingVocabularyItem {
  const normalized: ProcessingVocabularyItem = {
    ...item,
    german: normalizeText(item.german),
    bulgarian: normalizeText(item.bulgarian),
    partOfSpeech: item.partOfSpeech || 'noun'
  };

  // Normalize examples
  if (item.examples) {
    normalized.examples = item.examples.map(example => ({
      german: normalizeText(example.german),
      bulgarian: normalizeText(example.bulgarian),
      context: example.context ? normalizeText(example.context) : undefined
    }));
  }

  return normalized;
}

/**
 * Check for exact match between two items
 */
function isExactMatch(
  item1: ProcessingVocabularyItem,
  item2: ProcessingVocabularyItem
): boolean {
  return item1.german === item2.german &&
         item1.bulgarian === item2.bulgarian &&
         item1.partOfSpeech === item2.partOfSpeech;
}

/**
 * Check if two items are grammatical variations of the same word
 */
function isGrammaticalVariation(
  item1: ProcessingVocabularyItem,
  item2: ProcessingVocabularyItem
): boolean {
  // Same base word but different grammatical forms
  if (item1.partOfSpeech === item2.partOfSpeech) {
    const germanSimilar = areGrammaticalForms(item1.german, item2.german);
    const bulgarianSimilar = areGrammaticalForms(item1.bulgarian, item2.bulgarian);

    return germanSimilar && bulgarianSimilar;
  }

  return false;
}

/**
 * Check if two strings are grammatical forms of the same word
 */
function areGrammaticalForms(str1: string, str2: string): boolean {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  // For very short words, require exact match
  if (normalized1.length < 3 || normalized2.length < 3) {
    return false;
  }

  // Check for common grammatical variations - more conservative approach
  const variations = [
    // German articles (only at beginning)
    { pattern: /^(der|die|das|dem|den|des)\s+(.+)$/, replacement: '$2' },

    // Bulgarian definite articles (only at end)
    { pattern: /^(.+)(ът|та|то|те)$/, replacement: '$1' },

    // Plural forms (only for longer words)
    { pattern: /^(.{4,})e$/, replacement: '$1' }, // German plural - only for words 4+ chars
    { pattern: /^(.{4,})en$/, replacement: '$1' }, // German plural - only for words 4+ chars
    { pattern: /^(.{4,})er$/, replacement: '$1' }, // German plural - only for words 4+ chars
    { pattern: /^(.{4,})s$/, replacement: '$1' }, // German plural - only for words 4+ chars
    { pattern: /^(.{4,})и$/, replacement: '$1' }, // Bulgarian plural - only for words 4+ chars
    { pattern: /^(.{5,})ове$/, replacement: '$1' }, // Bulgarian plural - only for words 5+ chars
    { pattern: /^(.{5,})еве$/, replacement: '$1' }, // Bulgarian plural - only for words 5+ chars

    // Verb conjugations (only for longer words)
    { pattern: /^(.{4,})(e|st|t|en|et)$/, replacement: '$1' }, // German verb endings
    { pattern: /^(.{4,})(ам|аш|а|аме|ате|ат)$/, replacement: '$1' } // Bulgarian verb endings
  ];

  // Apply variations and check for match
  for (const variation of variations) {
    const match1 = normalized1.replace(variation.pattern, variation.replacement);
    const match2 = normalized2.replace(variation.pattern, variation.replacement);

    if (match1 === match2 && match1.length > 3) { // Require longer base form
      return true;
    }
  }

  return false;
}

/**
 * Calculate content similarity between two items
 */
function calculateContentSimilarity(
  item1: ProcessingVocabularyItem,
  item2: ProcessingVocabularyItem,
  config: DeduplicationConfig
): { similarityScore: number; duplicateType: 'similar' | 'content' } {
  // Calculate similarity for each field
  const germanSimilarity = calculateTextSimilarity(item1.german, item2.german, config);
  const bulgarianSimilarity = calculateTextSimilarity(item1.bulgarian, item2.bulgarian, config);

  // For short words, require exact match or very high similarity
  const isShortWord = item1.german.length <= 5 || item1.bulgarian.length <= 5 ||
                      item2.german.length <= 5 || item2.bulgarian.length <= 5;

  if (isShortWord) {
    // For short words, require both languages to be very similar
    const shortWordThreshold = 0.95;
    if (germanSimilarity >= shortWordThreshold && bulgarianSimilarity >= shortWordThreshold) {
      return { similarityScore: (germanSimilarity + bulgarianSimilarity) / 2, duplicateType: 'similar' };
    } else {
      return { similarityScore: 0.0, duplicateType: 'content' };
    }
  }

  // Calculate example similarity
  const exampleSimilarity = calculateExampleSimilarity(item1.examples || [], item2.examples || []);

  // Calculate overall similarity
  const contentWeight = 0.7;  // Increased weight for content
  const exampleWeight = 0.3;  // Decreased weight for examples

  const overallSimilarity = (germanSimilarity * 0.5 + bulgarianSimilarity * 0.5) * contentWeight +
                           exampleSimilarity * exampleWeight;

  // Determine duplicate type - more strict criteria
  if (germanSimilarity > 0.95 && bulgarianSimilarity > 0.95) {
    return { similarityScore: overallSimilarity, duplicateType: 'similar' };
  } else if (overallSimilarity >= config.similarityThreshold &&
             germanSimilarity > 0.85 && bulgarianSimilarity > 0.85) {
    return { similarityScore: overallSimilarity, duplicateType: 'content' };
  } else {
    return { similarityScore: 0.0, duplicateType: 'content' };
  }
}

/**
 * Calculate text similarity between two strings
 */
function calculateTextSimilarity(
  text1: string,
  text2: string,
  config: DeduplicationConfig
): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  // If texts are identical
  if (normalized1 === normalized2) return 1.0;

  // If texts are very short, use exact match
  if (normalized1.length < 3 || normalized2.length < 3) {
    return normalized1 === normalized2 ? 1.0 : 0.0;
  }

  // For short words (3-5 characters), be more strict
  if (normalized1.length <= 5 || normalized2.length <= 5) {
    // Require exact match or very small Levenshtein distance
    const distance = levenshteinDistance(normalized1, normalized2);
    if (distance <= 1) {
      return 0.95; // High similarity for almost identical short words
    } else {
      return 0.0;
    }
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalized1, normalized2);

  // Normalize distance by the length of the longer text
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const normalizedDistance = distance / maxLength;

  // Calculate similarity score (0-1)
  const similarity = 1 - normalizedDistance;

  // Check if within Levenshtein distance threshold
  if (distance <= config.maxLevenshteinDistance) {
    return Math.min(similarity * 1.1, 1.0); // Less aggressive boost
  }

  return similarity;
}

/**
 * Calculate example similarity between two example sets
 */
function calculateExampleSimilarity(
  examples1: Array<{ german: string; bulgarian: string }>,
  examples2: Array<{ german: string; bulgarian: string }>
): number {
  if (examples1.length === 0 && examples2.length === 0) return 1.0;
  if (examples1.length === 0 || examples2.length === 0) return 0.0;

  let totalSimilarity = 0;
  let pairCount = 0;

  // Compare each example pair
  for (const ex1 of examples1) {
    for (const ex2 of examples2) {
      const germanSim = calculateTextSimilarity(ex1.german, ex2.german, DEFAULT_DEDUPLICATION_CONFIG);
      const bulgarianSim = calculateTextSimilarity(ex1.bulgarian, ex2.bulgarian, DEFAULT_DEDUPLICATION_CONFIG);
      const pairSim = (germanSim + bulgarianSim) / 2;

      totalSimilarity += pairSim;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalSimilarity / pairCount : 0;
}

/**
 * Assess the quality of a vocabulary item
 */
export function assessItemQuality(item: UnifiedVocabularyItem | ProcessingVocabularyItem): QualityAssessment {
  let score = 0;
  const maxScore = 10;

  // Examples (max 3 points)
  const hasExamples = (item.examples?.length || 0) > 0;
  const exampleScore = hasExamples
    ? Math.min((item.examples?.length || 0) / 3, 1) * 3
    : 0;

  // Notes (max 2 points)
  const hasDetailedNotes = item.notes?.general &&
    item.notes.general.length >= DEFAULT_DEDUPLICATION_CONFIG.minNotesLengthForQuality;
  const notesScore = hasDetailedNotes ? 2 : (item.notes?.general ? 1 : 0);

  // Grammar info (max 2 points)
  const hasGrammarInfo = !!item.grammar &&
    (item.grammar.gender || item.grammar.pluralForm || item.grammar.verbAspect);
  const grammarScore = hasGrammarInfo ? 2 : 0;

  // Audio (max 1 point)
  const hasAudio = !!item.audio &&
    (item.audio.german || item.audio.bulgarian);
  const audioScore = hasAudio ? 1 : 0;

  // Etymology (max 1 point)
  const hasEtymology = !!item.etymology;
  const etymologyScore = hasEtymology ? 1 : 0;

  // Cultural notes (max 0.5 point)
  const hasCulturalNotes = (item.culturalNotes?.length || 0) > 0;
  const culturalScore = hasCulturalNotes ? 0.5 : 0;

  // Mnemonics (max 0.5 point)
  const hasMnemonics = (item.mnemonics?.length || 0) > 0;
  const mnemonicScore = hasMnemonics ? 0.5 : 0;

  // Calculate total score
  score = exampleScore + notesScore + grammarScore + audioScore +
          etymologyScore + culturalScore + mnemonicScore;

  // Calculate completeness score (0-1)
  const completenessScore = score / maxScore;

  return {
    score,
    hasExamples,
    hasDetailedNotes,
    hasGrammarInfo,
    hasAudio,
    hasEtymology,
    hasCulturalNotes,
    hasMnemonics,
    completenessScore
  };
}

/**
 * Merge multiple examples arrays
 */
function mergeExamples(examples: Array<{ german: string; bulgarian: string; context?: string }>): Array<{
  german: string;
  bulgarian: string;
  context?: string;
  source?: 'current' | 'legacy' | 'merged' | 'generated';
}> {
  if (examples.length === 0) return [];

  // Deduplicate examples
  const uniqueExamples = new Map<string, {
    german: string;
    bulgarian: string;
    context?: string;
    sources: Set<string>;
  }>();

  examples.forEach(example => {
    const key = `${example.german}|${example.bulgarian}|${example.context || ''}`;
    if (uniqueExamples.has(key)) {
      const existing = uniqueExamples.get(key)!;
      existing.sources.add('merged');
    } else {
      uniqueExamples.set(key, {
        german: example.german,
        bulgarian: example.bulgarian,
        context: example.context,
        sources: new Set(['merged'])
      });
    }
  });

  // Convert to array and add source information
  return Array.from(uniqueExamples.values()).map(example => ({
    german: example.german,
    bulgarian: example.bulgarian,
    context: example.context,
    source: 'merged'
  }));
}

/**
 * Merge multiple notes objects
 */
function mergeNotes(notes: Array<{
  general?: string;
  forBulgarianSpeakers?: string;
  forGermanSpeakers?: string;
  linguistic?: string;
  linguisticForBulgarians?: string;
  linguisticForGermans?: string;
}>): {
  general?: string;
  forBulgarianSpeakers?: string;
  forGermanSpeakers?: string;
  linguistic?: string;
  linguisticForBulgarians?: string;
  linguisticForGermans?: string;
  source?: 'current' | 'legacy' | 'merged' | 'generated';
} {
  if (notes.length === 0) {
    return { source: 'generated' };
  }

  if (notes.length === 1) {
    return {
      ...notes[0],
      source: 'merged'
    };
  }

  // Merge notes by type
  const mergedNotes: Partial<UnifiedVocabularyItem['notes']> = { source: 'merged' };

  // Merge general notes
  const generalNotes = notes.map(n => n.general).filter(Boolean) as string[];
  if (generalNotes.length > 0) {
    mergedNotes.general = generalNotes.join('\n\n');
  }

  // Merge Bulgarian speaker notes
  const bgNotes = notes.map(n => n.forBulgarianSpeakers).filter(Boolean) as string[];
  if (bgNotes.length > 0) {
    mergedNotes.forBulgarianSpeakers = bgNotes.join('\n\n');
  }

  // Merge German speaker notes
  const deNotes = notes.map(n => n.forGermanSpeakers).filter(Boolean) as string[];
  if (deNotes.length > 0) {
    mergedNotes.forGermanSpeakers = deNotes.join('\n\n');
  }

  // Merge linguistic notes
  const linguisticNotes = notes.map(n => n.linguistic).filter(Boolean) as string[];
  if (linguisticNotes.length > 0) {
    mergedNotes.linguistic = linguisticNotes.join('\n\n');
  }

  // Merge Bulgarian linguistic notes
  const bgLinguisticNotes = notes.map(n => n.linguisticForBulgarians).filter(Boolean) as string[];
  if (bgLinguisticNotes.length > 0) {
    mergedNotes.linguisticForBulgarians = bgLinguisticNotes.join('\n\n');
  }

  // Merge German linguistic notes
  const deLinguisticNotes = notes.map(n => n.linguisticForGermans).filter(Boolean) as string[];
  if (deLinguisticNotes.length > 0) {
    mergedNotes.linguisticForGermans = deLinguisticNotes.join('\n\n');
  }

  return mergedNotes;
}

/**
 * Merge cultural notes
 */
function mergeCulturalNotes(notes: string[]): string[] {
  if (notes.length === 0) return [];

  // Deduplicate cultural notes
  const uniqueNotes = new Set<string>();
  notes.forEach(note => {
    if (note && note.trim()) {
      uniqueNotes.add(note.trim());
    }
  });

  return Array.from(uniqueNotes);
}

/**
 * Merge mnemonics
 */
function mergeMnemonics(mnemonics: string[]): string[] {
  if (mnemonics.length === 0) return [];

  // Deduplicate mnemonics
  const uniqueMnemonics = new Set<string>();
  mnemonics.forEach(mnemonic => {
    if (mnemonic && mnemonic.trim()) {
      uniqueMnemonics.add(mnemonic.trim());
    }
  });

  return Array.from(uniqueMnemonics);
}

/**
 * Merge string arrays (synonyms, antonyms, related words)
 */
function mergeStringArrays(arrays: string[][]): string[] {
  if (arrays.length === 0) return [];

  // Flatten and deduplicate
  const allItems = arrays.flat();
  const uniqueItems = new Set<string>();

  allItems.forEach(item => {
    if (item && item.trim()) {
      uniqueItems.add(item.trim());
    }
  });

  return Array.from(uniqueItems);
}

/**
 * Select the best etymology from multiple options
 */
function selectBestEtymology(etymologies: string[]): string | undefined {
  if (etymologies.length === 0) return undefined;

  // Select the longest, most detailed etymology
  return etymologies.reduce((best, current) => {
    return current.length > (best?.length || 0) ? current : best;
  }, etymologies[0]);
}

/**
 * Select the best audio resources
 */
function selectBestAudio(audios: Array<{
  german?: string;
  bulgarian?: string;
}>): {
  german?: string;
  bulgarian?: string;
} | undefined {
  if (audios.length === 0) return undefined;

  // Select the audio with the most complete resources
  return audios.reduce((best, current) => {
    const bestGerman = best.german ? 1 : 0;
    const bestBulgarian = best.bulgarian ? 1 : 0;
    const currentGerman = current.german ? 1 : 0;
    const currentBulgarian = current.bulgarian ? 1 : 0;

    const bestScore = bestGerman + bestBulgarian;
    const currentScore = currentGerman + currentBulgarian;

    return currentScore > bestScore ? current : best;
  }, audios[0]);
}

/**
 * Select the best grammar information
 */
function selectBestGrammar(grammars: Array<{
  gender?: 'masculine' | 'feminine' | 'neuter';
  pluralForm?: string;
  verbAspect?: 'perfective' | 'imperfective' | null;
  verbPartnerId?: string;
  conjugation?: Record<string, string>;
}>): {
  gender?: 'masculine' | 'feminine' | 'neuter';
  pluralForm?: string;
  verbAspect?: 'perfective' | 'imperfective' | null;
  verbPartnerId?: string;
  conjugation?: Record<string, string>;
} | undefined {
  if (grammars.length === 0) return undefined;

  // Select the grammar with the most complete information
  return grammars.reduce((best, current) => {
    const bestScore = Object.keys(best).length;
    const currentScore = Object.keys(current).length;

    return currentScore > bestScore ? current : best;
  }, grammars[0]);
}

/**
 * Select the best difficulty level
 */
function selectBestDifficulty(difficulties: number[]): number {
  if (difficulties.length === 0) return 1;

  // Select the most specific (highest) difficulty
  return Math.max(...difficulties);
}

/**
 * Merge categories
 */
function mergeCategories(categoriesArrays: VocabularyCategory[][]): VocabularyCategory[] {
  if (categoriesArrays.length === 0) return ['uncategorized'];

  // Flatten and deduplicate categories
  const allCategories = categoriesArrays.flat();
  const uniqueCategories = new Set<VocabularyCategory>();

  allCategories.forEach(category => {
    if (category) {
      // Standardize the category before adding to set
      const standardized = standardizeCategory(category);
      uniqueCategories.add(standardized);
    }
  });

  // If no categories, use uncategorized
  if (uniqueCategories.size === 0) {
    return ['uncategorized'];
  }

  return Array.from(uniqueCategories);
}

/**
 * Create a merged ID from multiple source IDs
 */
export function createMergedId(ids: string[]): string {
  if (ids.length === 0) {
    return `merged-${Math.random().toString(36).substring(2, 9)}`;
  }

  if (ids.length === 1) {
    return ids[0];
  }

  // Filter out temporary IDs
  const permanentIds = ids.filter(id => !id.startsWith('temp-') && !id.startsWith('fallback-'));

  if (permanentIds.length === 0) {
    return `merged-${ids.join('-')}`;
  }

  if (permanentIds.length === 1) {
    return permanentIds[0];
  }

  // Create a composite ID
  return `merged-${permanentIds.join('-')}`;
}