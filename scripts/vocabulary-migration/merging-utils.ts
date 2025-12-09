/**
 * Merging Utilities for Vocabulary Migration
 *
 * Provides functions for merging vocabulary items from different sources
 * while preserving the highest quality metadata
 */

import type { UnifiedVocabularyItem, VocabularyCategory } from '../../src/lib/schemas/unified-vocabulary.js';
import { UnifiedVocabularyItemSchema, VocabularyCategorySchema, convertLegacyDifficulty, convertLegacyCategory, normalizeExample } from '../../src/lib/schemas/unified-vocabulary.js';
import type { ProcessingVocabularyItem } from '../types/vocabulary-types.js';
import type { DeduplicationConfig } from './deduplication-utils.js';
import { findDuplicateGroups, mergeDuplicateGroup, DEFAULT_DEDUPLICATION_CONFIG } from './deduplication-utils.js';

/**
 * Merge strategy configuration
 */
export interface MergeStrategyConfig {
  /**
   * Deduplication configuration
   */
  deduplication: DeduplicationConfig;

  /**
   * Priority order for source files
   * Higher priority sources take precedence
   */
  sourcePriority: string[];

  /**
   * Default values for missing fields
   */
  defaults: {
    difficulty: number;
    isCommon: boolean;
    isVerified: boolean;
    learningPhase: number;
  };

  /**
   * Field-specific merging strategies
   */
  fieldStrategies: {
    [key: string]: 'best_quality' | 'merge_all' | 'priority_source' | 'longest' | 'most_recent';
  };
}

export const DEFAULT_MERGE_STRATEGY: MergeStrategyConfig = {
  deduplication: DEFAULT_DEDUPLICATION_CONFIG,
  sourcePriority: [
    'vocabulary.json', // Current main file
    'vocabulary-fixed.json', // Legacy fixed file
    'vocabulary-batch-', // Legacy batch files
    'vocabulary-merged.json', // Legacy merged file
    'vocabulary-original-broken.json' // Original broken file
  ],
  defaults: {
    difficulty: 1,
    isCommon: false,
    isVerified: false,
    learningPhase: 0
  },
  fieldStrategies: {
    german: 'best_quality',
    bulgarian: 'best_quality',
    partOfSpeech: 'best_quality',
    difficulty: 'best_quality',
    categories: 'merge_all',
    transliteration: 'merge_all',
    emoji: 'best_quality',
    audio: 'best_quality',
    grammar: 'best_quality',
    examples: 'merge_all',
    notes: 'merge_all',
    etymology: 'longest',
    culturalNotes: 'merge_all',
    mnemonics: 'merge_all',
    synonyms: 'merge_all',
    antonyms: 'merge_all',
    relatedWords: 'merge_all',
    metadata: 'merge_all'
  }
};

/**
 * Merge multiple vocabulary items from different sources
 */
export function mergeVocabularyItems(
  items: Array<UnifiedVocabularyItem | ProcessingVocabularyItem>,
  config: MergeStrategyConfig = DEFAULT_MERGE_STRATEGY
): UnifiedVocabularyItem {
  if (items.length === 0) {
    throw new Error('Cannot merge empty array of items');
  }

  if (items.length === 1) {
    return convertToUnifiedItem(items[0]);
  }

  // 1. Find duplicate groups
  const duplicateGroups = findDuplicateGroups(items, config.deduplication);

  // 2. If no duplicates found, create a new merged item
  if (duplicateGroups.length === 0) {
    return createMergedItemFromAll(items, config);
  }

  // 3. If duplicates found, merge each group
  const mergedItems: UnifiedVocabularyItem[] = [];

  // Process each duplicate group
  for (const group of duplicateGroups) {
    const mergedItem = mergeDuplicateGroup(group, config.deduplication);
    mergedItems.push(mergedItem);
  }

  // 4. If there are non-duplicate items, merge them with the duplicate results
  const allItems = items.map(item => convertToUnifiedItem(item));
  const processedIds = new Set(mergedItems.flatMap(item =>
    item.metadata?.mergeSources || [item.id]
  ));

  const remainingItems = allItems.filter(item => {
    const itemId = item.id;
    const sourceIds = item.metadata?.mergeSources || [itemId];
    return !sourceIds.some(id => processedIds.has(id));
  });

  if (remainingItems.length > 0) {
    const additionalMerged = createMergedItemFromAll(remainingItems, config);
    mergedItems.push(additionalMerged);
  }

  // 5. If we have multiple merged items, merge them again
  if (mergedItems.length > 1) {
    return mergeVocabularyItems(mergedItems, config);
  }

  return mergedItems[0];
}

/**
 * Create a merged item from all provided items (no deduplication)
 */
function createMergedItemFromAll(
  items: Array<UnifiedVocabularyItem | ProcessingVocabularyItem>,
  config: MergeStrategyConfig
): UnifiedVocabularyItem {
  // Sort items by source priority
  const sortedItems = sortItemsByPriority(items, config.sourcePriority);

  // Select the highest priority item as base
  const baseItem = convertToUnifiedItem(sortedItems[0]);

  // Create merged item
  const mergedItem: UnifiedVocabularyItem = {
    ...baseItem,
    id: `merged-${sortedItems.map(item => item.id).join('-')}`,
    metadata: {
      ...baseItem.metadata,
      mergeSources: sortedItems.map(item => item.id),
      sourceFiles: Array.from(new Set(sortedItems.flatMap(item =>
        item.metadata?.sourceFiles || []
      ))).filter(Boolean) as string[]
    },
    updatedAt: new Date()
  };

  // Apply field-specific merging strategies
  for (const [field, strategy] of Object.entries(config.fieldStrategies)) {
    switch (strategy) {
      case 'best_quality':
        mergedItem[field as keyof UnifiedVocabularyItem] = selectBestQualityField(
          field as keyof UnifiedVocabularyItem,
          sortedItems.map(item => convertToUnifiedItem(item))
        ) as any;
        break;

      case 'merge_all':
        mergedItem[field as keyof UnifiedVocabularyItem] = mergeFieldAll(
          field as keyof UnifiedVocabularyItem,
          sortedItems.map(item => convertToUnifiedItem(item))
        ) as any;
        break;

      case 'priority_source':
        mergedItem[field as keyof UnifiedVocabularyItem] = selectPrioritySourceField(
          field as keyof UnifiedVocabularyItem,
          sortedItems.map(item => convertToUnifiedItem(item)),
          config.sourcePriority
        ) as any;
        break;

      case 'longest':
        mergedItem[field as keyof UnifiedVocabularyItem] = selectLongestField(
          field as keyof UnifiedVocabularyItem,
          sortedItems.map(item => convertToUnifiedItem(item))
        ) as any;
        break;

      case 'most_recent':
        mergedItem[field as keyof UnifiedVocabularyItem] = selectMostRecentField(
          field as keyof UnifiedVocabularyItem,
          sortedItems.map(item => convertToUnifiedItem(item))
        ) as any;
        break;
    }
  }

  return mergedItem;
}

/**
 * Convert any vocabulary item to unified format
 */
export function convertToUnifiedItem(item: any): UnifiedVocabularyItem {
  // If already in unified format, return as is
  if (item.version === 1) {
    return item as UnifiedVocabularyItem;
  }

  // Handle current format first (has german and bulgarian, or de and bg)
  // This should be checked BEFORE legacy format since some legacy items might have these fields too
  if ((item.german !== undefined && item.bulgarian !== undefined) ||
      (item.de !== undefined && item.bg !== undefined) ||
      (item.de !== undefined && item.bul !== undefined) ||
      (item.german !== undefined && (item.bg !== undefined || item.bul !== undefined)) ||
      (item.bulgarian !== undefined && (item.de !== undefined || item.germanText !== undefined))) {
    return convertCurrentItem(item);
  }

  // Handle legacy format (has word and translation)
  if ((item.word !== undefined && item.translation !== undefined) ||
      (item.word !== undefined && item.de !== undefined) ||
      (item.bg !== undefined && item.translation !== undefined) ||
      (item.word !== undefined && item.target_lang === 'de') ||
      (item.word !== undefined && item.source_lang !== undefined)) {
    return convertLegacyItem(item);
  }

  // Check for any fields that might indicate this is a vocabulary item
  const hasVocabFields = item.german || item.bulgarian || item.de || item.bg ||
                        item.word || item.translation || item.bul ||
                        item.germanText || item.bulgarianText || item.deText || item.bgText;

  if (hasVocabFields) {
    // This appears to be a vocabulary item but with incomplete format
    return createBasicUnifiedItem(item);
  }

  // Fallback: create a basic unified item for truly unknown formats
  return createBasicUnifiedItem(item);
}

/**
 * Convert legacy item to unified format
 */
function convertLegacyItem(legacyItem: any): UnifiedVocabularyItem {
  const now = new Date();

  // Handle language direction
  let german: string;
  let bulgarian: string;

  if (legacyItem.source_lang === 'bg' && legacyItem.target_lang === 'de') {
    // Bulgarian to German: word=bulgarian, translation=german
    german = legacyItem.translation || legacyItem.de || legacyItem.german || 'unknown';
    bulgarian = legacyItem.word || legacyItem.bg || legacyItem.bul || legacyItem.bulgarian || 'unknown';
  } else if (legacyItem.source_lang === 'de' && legacyItem.target_lang === 'bg') {
    // German to Bulgarian: word=german, translation=bulgarian
    german = legacyItem.word || legacyItem.de || legacyItem.german || 'unknown';
    bulgarian = legacyItem.translation || legacyItem.bg || legacyItem.bul || legacyItem.bulgarian || 'unknown';
  } else {
    // Default: try to determine direction from available fields
    if (legacyItem.word && legacyItem.translation) {
      // If we have both word and translation, assume word=bulgarian, translation=german
      german = legacyItem.translation;
      bulgarian = legacyItem.word;
    } else {
      // Fallback: try all possible field combinations
      german = legacyItem.translation || legacyItem.de || legacyItem.german || 'unknown';
      bulgarian = legacyItem.word || legacyItem.bg || legacyItem.bul || legacyItem.bulgarian || 'unknown';
    }
  }

  // Determine part of speech from category or tags
  let partOfSpeech: any = 'noun';
  if (legacyItem.category) {
    const category = legacyItem.category.toLowerCase();
    if (category.includes('verb')) {
      partOfSpeech = 'verb';
    } else if (category.includes('adjective')) {
      partOfSpeech = 'adjective';
    } else if (category.includes('adverb')) {
      partOfSpeech = 'adverb';
    } else if (category.includes('pronoun')) {
      partOfSpeech = 'pronoun';
    } else if (category.includes('preposition')) {
      partOfSpeech = 'preposition';
    } else if (category.includes('conjunction')) {
      partOfSpeech = 'conjunction';
    } else if (category.includes('interjection')) {
      partOfSpeech = 'interjection';
    } else if (category.includes('number')) {
      partOfSpeech = 'number';
    } else if (category.includes('phrase') || category.includes('expression')) {
      partOfSpeech = 'phrase';
    }
  } else if (legacyItem.partOfSpeech) {
    partOfSpeech = legacyItem.partOfSpeech;
    // Fix common part of speech values
    if (partOfSpeech === 'word') partOfSpeech = 'noun';
    if (partOfSpeech === 'phrase') partOfSpeech = 'phrase';
  }

  // Convert examples
  const examples = legacyItem.examples
    ? legacyItem.examples.map(normalizeExample)
    : [];

  // Convert notes
  const notes: any = {};
  if (legacyItem.notes) notes.general = legacyItem.notes;
  if (legacyItem.notes_bg_to_de) notes.forBulgarianSpeakers = legacyItem.notes_bg_to_de;
  if (legacyItem.notes_de_to_bg) notes.forGermanSpeakers = legacyItem.notes_de_to_bg;
  if (legacyItem.linguistic_note) notes.linguistic = legacyItem.linguistic_note;
  if (legacyItem.linguistic_note_bg_to_de) notes.linguisticForBulgarians = legacyItem.linguistic_note_bg_to_de;
  if (legacyItem.linguistic_note_de_to_bg) notes.linguisticForGermans = legacyItem.linguistic_note_de_to_bg;

  // Convert grammar
  const grammar: any = {};
  if (legacyItem.gender) grammar.gender = legacyItem.gender;
  if (legacyItem.plural) grammar.pluralForm = legacyItem.plural;
  if (legacyItem.verb_aspect) grammar.verbAspect = legacyItem.verb_aspect;

  // Convert categories
  const categories = legacyItem.category
    ? [convertLegacyCategory(legacyItem.category)]
    : ['uncategorized'];

  // Convert difficulty
  let difficulty = 1;
  if (legacyItem.difficulty) {
    if (typeof legacyItem.difficulty === 'string') {
      // Convert string difficulty (A1, A2, etc.) to number
      const levelMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      difficulty = levelMap[legacyItem.difficulty.toUpperCase()] || 1;
    } else {
      difficulty = convertLegacyDifficulty(legacyItem.difficulty);
    }
  }

  return {
    id: legacyItem.id,
    german,
    bulgarian,
    partOfSpeech,
    difficulty,
    categories,
    examples,
    notes: Object.keys(notes).length > 0 ? notes : undefined,
    etymology: legacyItem.etymology,
    culturalNotes: legacyItem.cultural_note ? [legacyItem.cultural_note] : undefined,
    grammar: Object.keys(grammar).length > 0 ? grammar : undefined,
    metadata: {
      frequency: legacyItem.frequency,
      level: legacyItem.level,
      sourceFiles: legacyItem.source ? [legacyItem.source] : legacyItem.sourceFiles
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

/**
 * Convert current item to unified format
 */
function convertCurrentItem(currentItem: any): UnifiedVocabularyItem {
  const now = new Date();

  // Extract german and bulgarian - the current format uses these fields directly
  // No need for complex fallback logic since we know this is the current format
  const german = currentItem.german !== undefined ? currentItem.german : 'unknown';
  const bulgarian = currentItem.bulgarian !== undefined ? currentItem.bulgarian : 'unknown';

  // Convert examples - handle the specific format from current vocabulary.json
  let examples = currentItem.examples || [];

  if (currentItem.example && typeof currentItem.example === 'string') {
    try {
      // Format: "German: 'Ich esse einen Apfel.', Bulgarian: 'Аз ям ябълка.'"
      const germanPart = currentItem.example.split('Bulgarian:')[0].replace('German:', '').trim();
      const bulgarianPart = currentItem.example.split('Bulgarian:')[1]?.trim() || '';

      examples.push({
        german: germanPart,
        bulgarian: bulgarianPart,
        source: 'current'
      });
    } catch (error) {
      // If parsing fails, just skip the example
    }
  }

  // Map current grammar_details to unified grammar
  const grammar: any = {};
  if (currentItem.grammar_details) {
    if (currentItem.grammar_details.noun_gender) {
      grammar.gender = currentItem.grammar_details.noun_gender;
    }
    if (currentItem.grammar_details.plural_form) {
      grammar.pluralForm = currentItem.grammar_details.plural_form;
    }
    if (currentItem.grammar_details.verb_aspect) {
      grammar.verbAspect = currentItem.grammar_details.verb_aspect;
    }
    if (currentItem.grammar_details.verb_partner_id) {
      grammar.verbPartnerId = currentItem.grammar_details.verb_partner_id;
    }
  }
  // Also check for direct grammar fields
  if (currentItem.gender) grammar.gender = currentItem.gender;
  if (currentItem.plural) grammar.pluralForm = currentItem.plural;
  if (currentItem.verb_aspect) grammar.verbAspect = currentItem.verb_aspect;

  // Convert notes
  const notes: any = {};
  if (currentItem.contextual_nuance) notes.general = currentItem.contextual_nuance;
  if (currentItem.mnemonics) {
    notes.general = notes.general
      ? `${notes.general}\n\n${currentItem.mnemonics}`
      : currentItem.mnemonics;
  }

  // Determine part of speech
  let partOfSpeech = 'noun';
  if (currentItem.partOfSpeech) {
    partOfSpeech = currentItem.partOfSpeech;
    // Fix common part of speech values
    if (partOfSpeech === 'word') partOfSpeech = 'noun';
    if (partOfSpeech === 'phrase') partOfSpeech = 'phrase';
  } else if (currentItem.type) {
    partOfSpeech = currentItem.type;
    // Fix common type values
    if (partOfSpeech === 'word') partOfSpeech = 'noun';
    if (partOfSpeech === 'phrase') partOfSpeech = 'phrase';
  } else if (currentItem.tags) {
    if (currentItem.tags.includes('Verb')) partOfSpeech = 'verb';
    if (currentItem.tags.includes('Adjective')) partOfSpeech = 'adjective';
    if (currentItem.tags.includes('Adverb')) partOfSpeech = 'adverb';
  }

  // Determine categories
  let categories = ['uncategorized'];
  if (currentItem.categories) {
    categories = currentItem.categories;
  } else if (currentItem.category) {
    categories = [currentItem.category];
  } else if (currentItem.tags) {
    // Extract categories from tags
    const categoryTags = currentItem.tags.filter((tag: string) =>
      !['Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase', 'A1', 'A2', 'B1', 'B2', 'C1'].includes(tag)
    );
    if (categoryTags.length > 0) {
      categories = categoryTags;
    }
  }

  // Convert difficulty to number
  let difficulty = 1;
  if (currentItem.difficulty) {
    if (typeof currentItem.difficulty === 'string') {
      // Convert string difficulty (A1, A2, etc.) to number
      const levelMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      difficulty = levelMap[currentItem.difficulty.toUpperCase()] || 1;
    } else {
      difficulty = currentItem.difficulty;
    }
  }

  return {
    id: currentItem.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
    german: german,
    bulgarian: bulgarian,
    partOfSpeech,
    difficulty,
    categories,
    examples: examples.length > 0 ? examples : [],
    notes: Object.keys(notes).length > 0 ? notes : undefined,
    grammar: Object.keys(grammar).length > 0 ? grammar : undefined,
    etymology: currentItem.etymology,
    culturalNotes: currentItem.cultural_note ? [currentItem.cultural_note] : undefined,
    metadata: {
      frequency: currentItem.frequency,
      level: currentItem.level || (typeof currentItem.difficulty === 'string' ? currentItem.difficulty : undefined),
      xpValue: currentItem.xp_value,
      isVerified: currentItem.isVerified,
      learningPhase: currentItem.learningPhase,
      sourceFiles: currentItem.source ? [currentItem.source] : currentItem.sourceFiles
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

/**
 * Create a basic unified item from any input
 */
function createBasicUnifiedItem(item: any): UnifiedVocabularyItem {
  const now = new Date();

  // Extract german and bulgarian from various possible field names
  let german: string;
  let bulgarian: string;

  // Handle legacy format with source_lang/target_lang
  if (item.source_lang === 'bg' && item.target_lang === 'de') {
    // Bulgarian to German: word=bulgarian, translation=german
    german = item.translation || item.de || item.german || item.germanText || item.deText;
    bulgarian = item.word || item.bg || item.bul || item.bulgarian || item.bulgarianText || item.bgText;
  } else if (item.source_lang === 'de' && item.target_lang === 'bg') {
    // German to Bulgarian: word=german, translation=bulgarian
    german = item.word || item.de || item.german || item.germanText || item.deText;
    bulgarian = item.translation || item.bg || item.bul || item.bulgarian || item.bulgarianText || item.bgText;
  }
  // Handle current format with direct fields
  else if ((item.german !== undefined && item.bulgarian !== undefined) ||
           (item.de !== undefined && item.bg !== undefined) ||
           (item.de !== undefined && item.bul !== undefined)) {
    german = item.german || item.de || item.germanText || item.deText;
    bulgarian = item.bulgarian || item.bg || item.bul || item.bulgarianText || item.bgText;
  }
  // Handle legacy format with word/translation
  else if (item.word !== undefined && item.translation !== undefined) {
    // Default: assume word=bulgarian, translation=german
    german = item.translation;
    bulgarian = item.word;
  }
  // Fallback: try all possible field combinations
  else {
    german = item.german || item.de || item.translation || item.germanText || item.deText || 'unknown';
    bulgarian = item.bulgarian || item.bg || item.bul || item.word || item.bulgarianText || item.bgText || 'unknown';
  }

  // Ensure we have valid values (not undefined)
  german = german || 'unknown';
  bulgarian = bulgarian || 'unknown';

  // Determine part of speech from available data
  let partOfSpeech: any = 'noun';
  if (item.partOfSpeech) {
    partOfSpeech = item.partOfSpeech;
    // Fix common part of speech values
    if (partOfSpeech === 'word') partOfSpeech = 'noun';
    if (partOfSpeech === 'phrase') partOfSpeech = 'phrase';
  } else if (item.category) {
    const category = item.category.toLowerCase();
    if (category.includes('verb')) {
      partOfSpeech = 'verb';
    } else if (category.includes('adjective')) {
      partOfSpeech = 'adjective';
    } else if (category.includes('adverb')) {
      partOfSpeech = 'adverb';
    } else if (category.includes('pronoun')) {
      partOfSpeech = 'pronoun';
    } else if (category.includes('preposition')) {
      partOfSpeech = 'preposition';
    } else if (category.includes('conjunction')) {
      partOfSpeech = 'conjunction';
    } else if (category.includes('interjection')) {
      partOfSpeech = 'interjection';
    } else if (category.includes('number')) {
      partOfSpeech = 'number';
    } else if (category.includes('phrase') || category.includes('expression')) {
      partOfSpeech = 'phrase';
    }
  }

  // Extract examples if available
  const examples = [];
  if (item.examples) {
    if (Array.isArray(item.examples)) {
      examples.push(...item.examples.map(normalizeExample));
    } else if (typeof item.examples === 'string') {
      examples.push(normalizeExample(item.examples));
    }
  } else if (item.example) {
    if (typeof item.example === 'string') {
      examples.push(normalizeExample(item.example));
    } else if (Array.isArray(item.example)) {
      examples.push(...item.example.map(normalizeExample));
    }
  }

  // Extract notes if available
  const notes: any = {};
  if (item.notes) notes.general = item.notes;
  if (item.contextual_nuance) notes.general = item.contextual_nuance;
  if (item.mnemonics) {
    notes.general = notes.general
      ? `${notes.general}\n\n${item.mnemonics}`
      : item.mnemonics;
  }
  // Add legacy note fields
  if (item.notes_bg_to_de) notes.forBulgarianSpeakers = item.notes_bg_to_de;
  if (item.notes_de_to_bg) notes.forGermanSpeakers = item.notes_de_to_bg;
  if (item.linguistic_note) notes.linguistic = item.linguistic_note;
  if (item.linguistic_note_bg_to_de) notes.linguisticForBulgarians = item.linguistic_note_bg_to_de;
  if (item.linguistic_note_de_to_bg) notes.linguisticForGermans = item.linguistic_note_de_to_bg;

  // Extract grammar if available
  const grammar: any = {};
  if (item.grammar) {
    Object.assign(grammar, item.grammar);
  }
  if (item.grammar_details) {
    Object.assign(grammar, item.grammar_details);
  }
  if (item.gender) grammar.gender = item.gender;
  if (item.plural) grammar.pluralForm = item.plural;
  if (item.verb_aspect) grammar.verbAspect = item.verb_aspect;

  // Extract categories
  const categories = item.categories || item.category
    ? [item.category ? convertLegacyCategory(item.category) : item.categories].flat()
    : ['uncategorized'];

  // Determine difficulty
  let difficulty = 1;
  if (item.difficulty) {
    if (typeof item.difficulty === 'string') {
      // Convert string difficulty (A1, A2, etc.) to number
      const levelMap: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5 };
      difficulty = levelMap[item.difficulty.toUpperCase()] || 1;
    } else {
      difficulty = convertLegacyDifficulty(item.difficulty);
    }
  }

  return {
    id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
    german,
    bulgarian,
    partOfSpeech,
    difficulty,
    categories,
    examples: examples.length > 0 ? examples : [],
    notes: Object.keys(notes).length > 0 ? notes : undefined,
    grammar: Object.keys(grammar).length > 0 ? grammar : undefined,
    metadata: {
      frequency: item.frequency,
      level: item.level,
      sourceFiles: item.source ? [item.source] : item.sourceFiles,
      xpValue: item.xp_value,
      isVerified: item.isVerified,
      learningPhase: item.learningPhase
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

/**
 * Sort items by source priority
 */
function sortItemsByPriority(
  items: Array<UnifiedVocabularyItem | ProcessingVocabularyItem>,
  sourcePriority: string[]
): Array<UnifiedVocabularyItem | ProcessingVocabularyItem> {
  return [...items].sort((a, b) => {
    const aSource = getItemSource(a, sourcePriority);
    const bSource = getItemSource(b, sourcePriority);

    const aIndex = sourcePriority.findIndex(source =>
      aSource.includes(source)
    );
    const bIndex = sourcePriority.findIndex(source =>
      bSource.includes(source)
    );

    // If both have known sources, sort by priority
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only a has known source, a comes first
    if (aIndex !== -1) return -1;

    // If only b has known source, b comes first
    if (bIndex !== -1) return 1;

    // If neither has known source, maintain original order
    return 0;
  });
}

/**
 * Get source information for an item
 */
function getItemSource(
  item: UnifiedVocabularyItem | ProcessingVocabularyItem,
  sourcePriority: string[]
): string {
  if ('metadata' in item && item.metadata?.sourceFiles) {
    return item.metadata.sourceFiles.join(', ');
  }

  if ('source' in item) {
    return item.source as string;
  }

  // Check if ID contains source information
  const id = 'id' in item ? item.id : '';
  for (const source of sourcePriority) {
    if (id.includes(source)) {
      return source;
    }
  }

  return 'unknown';
}

/**
 * Select the best quality field from multiple items
 */
function selectBestQualityField(
  field: keyof UnifiedVocabularyItem,
  items: UnifiedVocabularyItem[]
): any {
  // Filter out items that don't have the field
  const itemsWithField = items.filter(item => item[field] !== undefined);

  if (itemsWithField.length === 0) {
    return undefined;
  }

  if (itemsWithField.length === 1) {
    return itemsWithField[0][field];
  }

  // Field-specific quality assessment
  switch (field) {
    case 'german':
    case 'bulgarian':
      // Select the most complete version
      return itemsWithField.reduce((best, current) => {
        const bestValue = best[field] as string;
        const currentValue = current[field] as string;

        // Prefer longer, more complete versions
        if (currentValue.length > bestValue.length) {
          return current;
        }

        // If same length, prefer the one with more examples
        if (currentValue.length === bestValue.length) {
          if ((current.examples?.length || 0) > (best.examples?.length || 0)) {
            return current;
          }
        }

        return best;
      })[field];

    case 'partOfSpeech':
      // Select the most specific part of speech
      const partOfSpeechPriority = [
        'noun', 'verb', 'adjective', 'adverb', 'pronoun',
        'preposition', 'conjunction', 'interjection', 'article',
        'number', 'phrase', 'expression'
      ];

      return itemsWithField.reduce((best, current) => {
        const bestIndex = partOfSpeechPriority.indexOf(best.partOfSpeech);
        const currentIndex = partOfSpeechPriority.indexOf(current.partOfSpeech);

        // Select the more specific (earlier in the list) part of speech
        return currentIndex < bestIndex ? current : best;
      }).partOfSpeech;

    case 'difficulty':
      // Select the highest difficulty (most specific)
      return Math.max(...itemsWithField.map(item => item.difficulty));

    case 'emoji':
      // Select the first non-empty emoji
      for (const item of itemsWithField) {
        if (item.emoji) return item.emoji;
      }
      return undefined;

    case 'audio':
      // Select the most complete audio
      return itemsWithField.reduce((best, current) => {
        const bestAudio = best.audio;
        const currentAudio = current.audio;

        if (!bestAudio) return current;
        if (!currentAudio) return best;

        const bestScore = (bestAudio.german ? 1 : 0) + (bestAudio.bulgarian ? 1 : 0);
        const currentScore = (currentAudio.german ? 1 : 0) + (currentAudio.bulgarian ? 1 : 0);

        return currentScore > bestScore ? current : best;
      }).audio;

    case 'grammar':
      // Select the most complete grammar
      return itemsWithField.reduce((best, current) => {
        const bestGrammar = best.grammar;
        const currentGrammar = current.grammar;

        if (!bestGrammar) return current;
        if (!currentGrammar) return best;

        const bestScore = Object.keys(bestGrammar).length;
        const currentScore = Object.keys(currentGrammar).length;

        return currentScore > bestScore ? current : best;
      }).grammar;

    case 'etymology':
      // Select the longest etymology
      return itemsWithField.reduce((best, current) => {
        const bestEtymology = best.etymology;
        const currentEtymology = current.etymology;

        if (!bestEtymology) return current;
        if (!currentEtymology) return best;

        return currentEtymology.length > bestEtymology.length ? current : best;
      }).etymology;

    default:
      // For other fields, select the first non-empty value
      for (const item of itemsWithField) {
        if (item[field] !== undefined && item[field] !== null) {
          return item[field];
        }
      }
      return undefined;
  }
}

/**
 * Merge all values of a field from multiple items
 */
function mergeFieldAll(
  field: keyof UnifiedVocabularyItem,
  items: UnifiedVocabularyItem[]
): any {
  // Filter out items that don't have the field
  const itemsWithField = items.filter(item => item[field] !== undefined);

  if (itemsWithField.length === 0) {
    return undefined;
  }

  if (itemsWithField.length === 1) {
    return itemsWithField[0][field];
  }

  // Field-specific merging
  switch (field) {
    case 'categories':
      // Merge and deduplicate categories
      const allCategories = itemsWithField.flatMap(item => item.categories);
      const uniqueCategories = new Set<VocabularyCategory>(allCategories);
      return Array.from(uniqueCategories);

    case 'examples':
      // Merge and deduplicate examples
      const allExamples = itemsWithField.flatMap(item => item.examples || []);
      const uniqueExamples = new Map<string, any>();

      allExamples.forEach(example => {
        const key = `${example.german}|${example.bulgarian}|${example.context || ''}`;
        if (!uniqueExamples.has(key)) {
          uniqueExamples.set(key, example);
        }
      });

      return Array.from(uniqueExamples.values());

    case 'notes':
      // Merge notes
      const allNotes = itemsWithField.map(item => item.notes).filter(Boolean) as any[];
      const mergedNotes: any = {};

      allNotes.forEach(notes => {
        for (const [key, value] of Object.entries(notes)) {
          if (value) {
            if (mergedNotes[key]) {
              mergedNotes[key] = `${mergedNotes[key]}\n\n${value}`;
            } else {
              mergedNotes[key] = value;
            }
          }
        }
      });

      return Object.keys(mergedNotes).length > 0 ? mergedNotes : undefined;

    case 'culturalNotes':
      // Merge and deduplicate cultural notes
      const allCulturalNotes = itemsWithField.flatMap(item => item.culturalNotes || []);
      const uniqueCulturalNotes = new Set<string>(allCulturalNotes);
      return Array.from(uniqueCulturalNotes);

    case 'mnemonics':
      // Merge and deduplicate mnemonics
      const allMnemonics = itemsWithField.flatMap(item => item.mnemonics || []);
      const uniqueMnemonics = new Set<string>(allMnemonics);
      return Array.from(uniqueMnemonics);

    case 'synonyms':
    case 'antonyms':
    case 'relatedWords':
      // Merge and deduplicate string arrays
      const allItems = itemsWithField.flatMap(item => item[field] as any[] || []);
      const uniqueItems = new Set<string>(allItems);
      return Array.from(uniqueItems);

    case 'transliteration':
      // Merge transliterations
      const allTransliterations = itemsWithField.map(item => item.transliteration).filter(Boolean) as any[];
      const mergedTransliteration: any = {};

      allTransliterations.forEach(trans => {
        if (trans.german) mergedTransliteration.german = trans.german;
        if (trans.bulgarian) mergedTransliteration.bulgarian = trans.bulgarian;
      });

      return Object.keys(mergedTransliteration).length > 0 ? mergedTransliteration : undefined;

    case 'metadata':
      // Merge metadata
      const allMetadata = itemsWithField.map(item => item.metadata).filter(Boolean) as any[];
      const mergedMetadata: any = {};

      allMetadata.forEach(metadata => {
        for (const [key, value] of Object.entries(metadata)) {
          if (value !== undefined) {
            if (key === 'sourceFiles' || key === 'mergeSources') {
              // Merge arrays
              if (mergedMetadata[key]) {
                mergedMetadata[key] = Array.from(new Set([
                  ...mergedMetadata[key],
                  ...(value as any[])
                ]));
              } else {
                mergedMetadata[key] = Array.from(new Set(value as any[]));
              }
            } else if (key === 'frequency' || key === 'difficulty' || key === 'xpValue') {
              // Take the highest value
              if (mergedMetadata[key] === undefined || value > mergedMetadata[key]) {
                mergedMetadata[key] = value;
              }
            } else if (key === 'isCommon' || key === 'isVerified') {
              // Take the most permissive value
              mergedMetadata[key] = mergedMetadata[key] || value;
            } else {
              // Take the first value
              if (mergedMetadata[key] === undefined) {
                mergedMetadata[key] = value;
              }
            }
          }
        }
      });

      return Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined;

    default:
      // For other fields, use the first non-empty value
      for (const item of itemsWithField) {
        if (item[field] !== undefined && item[field] !== null) {
          return item[field];
        }
      }
      return undefined;
  }
}

/**
 * Select field from the highest priority source
 */
function selectPrioritySourceField(
  field: keyof UnifiedVocabularyItem,
  items: UnifiedVocabularyItem[],
  sourcePriority: string[]
): any {
  // Sort items by source priority
  const sortedItems = sortItemsByPriority(items, sourcePriority);

  // Select the first non-empty value
  for (const item of sortedItems) {
    if (item[field] !== undefined && item[field] !== null) {
      return item[field];
    }
  }

  return undefined;
}

/**
 * Select the longest field value
 */
function selectLongestField(
  field: keyof UnifiedVocabularyItem,
  items: UnifiedVocabularyItem[]
): any {
  // Filter out items that don't have the field
  const itemsWithField = items.filter(item => item[field] !== undefined);

  if (itemsWithField.length === 0) {
    return undefined;
  }

  if (itemsWithField.length === 1) {
    return itemsWithField[0][field];
  }

  // Select the longest value
  return itemsWithField.reduce((best, current) => {
    const bestValue = best[field];
    const currentValue = current[field];

    if (typeof bestValue === 'string' && typeof currentValue === 'string') {
      return currentValue.length > bestValue.length ? current : best;
    }

    if (Array.isArray(bestValue) && Array.isArray(currentValue)) {
      return currentValue.length > bestValue.length ? current : best;
    }

    return best;
  })[field];
}

/**
 * Select the most recent field value
 */
function selectMostRecentField(
  field: keyof UnifiedVocabularyItem,
  items: UnifiedVocabularyItem[]
): any {
  // Filter out items that don't have the field
  const itemsWithField = items.filter(item => item[field] !== undefined);

  if (itemsWithField.length === 0) {
    return undefined;
  }

  if (itemsWithField.length === 1) {
    return itemsWithField[0][field];
  }

  // Select the item with the most recent updatedAt
  return itemsWithField.reduce((best, current) => {
    return current.updatedAt > best.updatedAt ? current : best;
  })[field];
}

/**
 * Create a collection from merged items
 */
export function createVocabularyCollection(
  items: Array<UnifiedVocabularyItem | ProcessingVocabularyItem>,
  name: string = 'German-Bulgarian Vocabulary',
  description: string = 'Comprehensive German-Bulgarian vocabulary collection with unified schema'
): any {
  // Convert all items to unified format
  const unifiedItems = items.map(item => convertToUnifiedItem(item));

  // Calculate statistics
  const statistics = calculateCollectionStatistics(unifiedItems);

  return {
    id: crypto.randomUUID(),
    name,
    description,
    languagePair: 'de-bg',
    difficultyRange: statistics.difficultyRange,
    categories: statistics.categories,
    itemCount: unifiedItems.length,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    items: unifiedItems,
    statistics
  };
}

/**
 * Calculate collection statistics
 */
function calculateCollectionStatistics(items: UnifiedVocabularyItem[]): any {
  const byPartOfSpeech: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byLevel: Record<string, number> = {};

  let minDifficulty = 5;
  let maxDifficulty = 1;

  // Initialize counters
  const partOfSpeechValues = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun',
    'preposition', 'conjunction', 'interjection', 'article',
    'number', 'phrase', 'expression'
  ];

  partOfSpeechValues.forEach(pos => byPartOfSpeech[pos] = 0);

  for (let i = 1; i <= 5; i++) {
    byDifficulty[i.toString()] = 0;
  }

  const allCategories = new Set<VocabularyCategory>();
  items.forEach(item => item.categories.forEach(cat => allCategories.add(cat)));
  Array.from(allCategories).forEach(cat => byCategory[cat] = 0);

  ['A1', 'A2', 'B1', 'B2', 'C1'].forEach(level => byLevel[level] = 0);

  // Count items
  items.forEach(item => {
    // Count by part of speech
    byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;

    // Count by difficulty
    const difficulty = item.difficulty || 1;
    const validDifficulty = typeof difficulty === 'number' && !isNaN(difficulty) ? difficulty : 1;
    byDifficulty[validDifficulty.toString()] = (byDifficulty[validDifficulty.toString()] || 0) + 1;
    minDifficulty = Math.min(minDifficulty, validDifficulty);
    maxDifficulty = Math.max(maxDifficulty, validDifficulty);

    // Count by category
    item.categories.forEach(category => {
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    // Count by level
    if (item.metadata?.level) {
      byLevel[item.metadata.level] = (byLevel[item.metadata.level] || 0) + 1;
    }
  });

  return {
    byPartOfSpeech,
    byDifficulty,
    byCategory,
    byLevel,
    difficultyRange: [minDifficulty, maxDifficulty] as [number, number],
    categories: Array.from(allCategories)
  };
}