/**
 * Validation Utilities for Vocabulary Migration
 *
 * Provides functions for validating unified vocabulary data
 * and ensuring data integrity throughout the migration process
 */

import type { UnifiedVocabularyItem, UnifiedVocabularyCollection } from '../../src/lib/schemas/unified-vocabulary.js';
import { UnifiedVocabularyItemSchema, UnifiedVocabularyCollectionSchema } from '../../src/lib/schemas/unified-vocabulary.js';
import { z } from 'zod';
import type { ProcessingVocabularyItem, VocabularyIssue, VocabularyVerificationReport } from '../types/vocabulary-types.js';

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /**
   * Whether to allow missing optional fields
   * @default false
   */
  allowMissingOptional: boolean;

  /**
   * Whether to validate content quality (not just structure)
   * @default true
   */
  validateContentQuality: boolean;

  /**
   * Minimum number of examples required for quality validation
   * @default 1
   */
  minExamples: number;

  /**
   * Minimum length of notes required for quality validation
   * @default 20
   */
  minNotesLength: number;

  /**
   * Whether to validate ID uniqueness
   * @default true
   */
  validateIdUniqueness: boolean;

  /**
   * Whether to validate reference integrity
   * @default true
   */
  validateReferences: boolean;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  allowMissingOptional: false,
  validateContentQuality: true,
  minExamples: 1,
  minNotesLength: 20,
  validateIdUniqueness: true,
  validateReferences: true
};

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  issues: VocabularyIssue[];
  warnings: VocabularyIssue[];
  validatedItems: number;
  invalidItems: number;
}

/**
 * Validate a single vocabulary item
 */
export function validateVocabularyItem(
  item: UnifiedVocabularyItem | ProcessingVocabularyItem,
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): ValidationResult {
  const issues: VocabularyIssue[] = [];
  const warnings: VocabularyIssue[] = [];

  // 1. Structural validation using Zod schema
  const schemaResult = UnifiedVocabularyItemSchema.safeParse(item);

  if (!schemaResult.success) {
    const schemaIssues = schemaResult.error.issues.map(issue => ({
      id: 'id' in item ? item.id : 'unknown',
      type: 'schema_validation',
      message: `Schema validation failed: ${issue.path.join('.')} - ${issue.message}`,
      severity: 'high' as const,
      data: {
        path: issue.path,
        code: issue.code,
        received: issue.received
      }
    }));

    issues.push(...schemaIssues);
  }

  // 2. Content validation
  if (config.validateContentQuality) {
    const contentIssues = validateItemContent(item, config);
    issues.push(...contentIssues.issues);
    warnings.push(...contentIssues.warnings);
  }

  // 3. Logical validation
  const logicalIssues = validateItemLogic(item);
  issues.push(...logicalIssues.issues);
  warnings.push(...logicalIssues.warnings);

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    validatedItems: 1,
    invalidItems: issues.length > 0 ? 1 : 0
  };
}

/**
 * Validate a vocabulary collection
 */
export function validateVocabularyCollection(
  collection: UnifiedVocabularyCollection | any,
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): ValidationResult {
  const issues: VocabularyIssue[] = [];
  const warnings: VocabularyIssue[] = [];

  // 1. Validate collection structure
  const collectionSchemaResult = UnifiedVocabularyCollectionSchema.safeParse(collection);

  if (!collectionSchemaResult.success) {
    const schemaIssues = collectionSchemaResult.error.issues.map(issue => ({
      id: collection.id || 'unknown',
      type: 'collection_schema_validation',
      message: `Collection schema validation failed: ${issue.path.join('.')} - ${issue.message}`,
      severity: 'critical' as const,
      data: {
        path: issue.path,
        code: issue.code,
        received: issue.received
      }
    }));

    issues.push(...schemaIssues);
    return {
      isValid: false,
      issues,
      warnings,
      validatedItems: 0,
      invalidItems: 0
    };
  }

  const validatedCollection = collectionSchemaResult.data;
  let validatedItems = 0;
  let invalidItems = 0;

  // 2. Validate each item in the collection
  for (const item of validatedCollection.items) {
    const itemResult = validateVocabularyItem(item, config);
    issues.push(...itemResult.issues);
    warnings.push(...itemResult.warnings);
    validatedItems += itemResult.validatedItems;
    invalidItems += itemResult.invalidItems;
  }

  // 3. Cross-item validation
  if (config.validateIdUniqueness) {
    const idIssues = validateIdUniqueness(validatedCollection.items);
    issues.push(...idIssues);
  }

  if (config.validateReferences) {
    const referenceIssues = validateReferenceIntegrity(validatedCollection.items);
    issues.push(...referenceIssues);
  }

  // 4. Collection-level validation
  const collectionIssues = validateCollectionLevel(validatedCollection);
  issues.push(...collectionIssues.issues);
  warnings.push(...collectionIssues.warnings);

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    validatedItems,
    invalidItems
  };
}

/**
 * Validate item content quality
 */
function validateItemContent(
  item: UnifiedVocabularyItem | ProcessingVocabularyItem,
  config: ValidationConfig
): { issues: VocabularyIssue[]; warnings: VocabularyIssue[] } {
  const issues: VocabularyIssue[] = [];
  const warnings: VocabularyIssue[] = [];

  const itemId = 'id' in item ? item.id : 'unknown';

  // 1. Check for examples
  if (config.validateContentQuality && config.minExamples > 0) {
    const exampleCount = item.examples?.length || 0;

    if (exampleCount < config.minExamples) {
      warnings.push({
        id: itemId,
        type: 'content_quality',
        message: `Item has only ${exampleCount} examples, minimum recommended is ${config.minExamples}`,
        severity: 'medium',
        data: { current: exampleCount, minimum: config.minExamples }
      });
    }

    // Check example quality
    if (item.examples) {
      for (let i = 0; i < item.examples.length; i++) {
        const example = item.examples[i];

        if (!example.german || example.german.trim().length < 3) {
          warnings.push({
            id: itemId,
            type: 'example_quality',
            message: `Example ${i + 1} has incomplete or very short German text`,
            severity: 'low',
            data: { exampleIndex: i, field: 'german' }
          });
        }

        if (!example.bulgarian || example.bulgarian.trim().length < 3) {
          warnings.push({
            id: itemId,
            type: 'example_quality',
            message: `Example ${i + 1} has incomplete or very short Bulgarian text`,
            severity: 'low',
            data: { exampleIndex: i, field: 'bulgarian' }
          });
        }
      }
    }
  }

  // 2. Check for notes
  if (config.validateContentQuality && config.minNotesLength > 0) {
    const hasGeneralNotes = item.notes?.general && item.notes.general.trim().length > 0;
    const hasBgNotes = item.notes?.forBulgarianSpeakers && item.notes.forBulgarianSpeakers.trim().length > 0;
    const hasDeNotes = item.notes?.forGermanSpeakers && item.notes.forGermanSpeakers.trim().length > 0;

    const totalNotesLength = (item.notes?.general?.length || 0) +
                            (item.notes?.forBulgarianSpeakers?.length || 0) +
                            (item.notes?.forGermanSpeakers?.length || 0);

    if (totalNotesLength < config.minNotesLength) {
      warnings.push({
        id: itemId,
        type: 'content_quality',
        message: `Item has only ${totalNotesLength} characters of notes, minimum recommended is ${config.minNotesLength}`,
        severity: 'medium',
        data: { current: totalNotesLength, minimum: config.minNotesLength }
      });
    }

    if (!hasGeneralNotes && !hasBgNotes && !hasDeNotes) {
      warnings.push({
        id: itemId,
        type: 'content_quality',
        message: 'Item has no notes at all',
        severity: 'medium',
        data: { hasGeneralNotes, hasBgNotes, hasDeNotes }
      });
    }
  }

  // 3. Check for cultural notes
  if (config.validateContentQuality && item.culturalNotes && item.culturalNotes.length === 0) {
    warnings.push({
      id: itemId,
      type: 'content_quality',
      message: 'Item has empty cultural notes array',
      severity: 'low',
      data: { culturalNotesCount: item.culturalNotes.length }
    });
  }

  // 4. Check for etymology
  if (config.validateContentQuality && !item.etymology) {
    warnings.push({
      id: itemId,
      type: 'content_quality',
      message: 'Item has no etymology information',
      severity: 'low',
      data: { hasEtymology: !!item.etymology }
    });
  }

  // 5. Check for grammar information
  if (config.validateContentQuality && !item.grammar) {
    warnings.push({
      id: itemId,
      type: 'content_quality',
      message: 'Item has no grammar information',
      severity: 'medium',
      data: { hasGrammar: !!item.grammar }
    });
  } else if (item.grammar) {
    // Check grammar field quality
    const grammar = item.grammar;
    const hasGender = !!grammar.gender;
    const hasPlural = !!grammar.pluralForm;
    const hasAspect = !!grammar.verbAspect;
    const hasConjugation = !!grammar.conjugation;

    if (!hasGender && !hasPlural && !hasAspect && !hasConjugation) {
      warnings.push({
        id: itemId,
        type: 'grammar_quality',
        message: 'Grammar information exists but contains no specific details',
        severity: 'medium',
        data: { hasGender, hasPlural, hasAspect, hasConjugation }
      });
    }
  }

  return { issues, warnings };
}

/**
 * Validate item logic
 */
function validateItemLogic(item: UnifiedVocabularyItem | ProcessingVocabularyItem): {
  issues: VocabularyIssue[];
  warnings: VocabularyIssue[];
} {
  const issues: VocabularyIssue[] = [];
  const warnings: VocabularyIssue[] = [];

  const itemId = 'id' in item ? item.id : 'unknown';

  // 1. Check part of speech consistency
  if (item.partOfSpeech === 'noun' && item.grammar?.verbAspect) {
    issues.push({
      id: itemId,
      type: 'logic_error',
      message: 'Noun has verb aspect information in grammar',
      severity: 'high',
      data: { partOfSpeech: item.partOfSpeech, verbAspect: item.grammar?.verbAspect }
    });
  }

  if (item.partOfSpeech === 'verb' && item.grammar?.gender) {
    issues.push({
      id: itemId,
      type: 'logic_error',
      message: 'Verb has noun gender information in grammar',
      severity: 'high',
      data: { partOfSpeech: item.partOfSpeech, gender: item.grammar?.gender }
    });
  }

  // 2. Check difficulty level
  if (item.difficulty < 1 || item.difficulty > 5) {
    issues.push({
      id: itemId,
      type: 'logic_error',
      message: `Difficulty level ${item.difficulty} is out of range (1-5)`,
      severity: 'high',
      data: { difficulty: item.difficulty }
    });
  }

  // 3. Check categories
  if (item.categories.length === 0) {
    issues.push({
      id: itemId,
      type: 'logic_error',
      message: 'Item has no categories',
      severity: 'high',
      data: { categories: item.categories }
    });
  } else if (item.categories.includes('uncategorized') && item.categories.length > 1) {
    warnings.push({
      id: itemId,
      type: 'category_warning',
      message: 'Item is categorized as "uncategorized" but has other categories too',
      severity: 'medium',
      data: { categories: item.categories }
    });
  }

  // 4. Check example relevance
  if (item.examples) {
    for (let i = 0; i < item.examples.length; i++) {
      const example = item.examples[i];

      // Check if example contains the word
      const germanContainsWord = example.german.toLowerCase().includes(item.german.toLowerCase());
      const bulgarianContainsWord = example.bulgarian.toLowerCase().includes(item.bulgarian.toLowerCase());

      if (!germanContainsWord && !bulgarianContainsWord) {
        warnings.push({
          id: itemId,
          type: 'example_relevance',
          message: `Example ${i + 1} doesn't contain the vocabulary word in either language`,
          severity: 'medium',
          data: {
            exampleIndex: i,
            germanContainsWord,
            bulgarianContainsWord,
            exampleGerman: example.german,
            exampleBulgarian: example.bulgarian,
            itemGerman: item.german,
            itemBulgarian: item.bulgarian
          }
        });
      }
    }
  }

  // 5. Check metadata
  if (item.metadata) {
    if (item.metadata.frequency && (item.metadata.frequency < 1 || item.metadata.frequency > 100)) {
      issues.push({
        id: itemId,
        type: 'metadata_error',
        message: `Frequency ${item.metadata.frequency} is out of range (1-100)`,
        severity: 'high',
        data: { frequency: item.metadata.frequency }
      });
    }

    if (item.metadata.learningPhase && (item.metadata.learningPhase < 0 || item.metadata.learningPhase > 6)) {
      issues.push({
        id: itemId,
        type: 'metadata_error',
        message: `Learning phase ${item.metadata.learningPhase} is out of range (0-6)`,
        severity: 'high',
        data: { learningPhase: item.metadata.learningPhase }
      });
    }
  }

  // 6. Check timestamps
  if ('createdAt' in item && 'updatedAt' in item) {
    if (item.createdAt > item.updatedAt) {
      issues.push({
        id: itemId,
        type: 'timestamp_error',
        message: 'CreatedAt is after updatedAt',
        severity: 'high',
        data: {
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      });
    }

    if (item.createdAt > new Date()) {
      warnings.push({
        id: itemId,
        type: 'timestamp_warning',
        message: 'CreatedAt is in the future',
        severity: 'medium',
        data: { createdAt: item.createdAt }
      });
    }
  }

  return { issues, warnings };
}

/**
 * Validate ID uniqueness across items
 */
function validateIdUniqueness(items: UnifiedVocabularyItem[]): VocabularyIssue[] {
  const issues: VocabularyIssue[] = [];
  const idMap = new Map<string, string[]>();

  // Track all IDs
  items.forEach(item => {
    const id = item.id;
    if (idMap.has(id)) {
      idMap.get(id)!.push(id);
    } else {
      idMap.set(id, [id]);
    }
  });

  // Check for duplicate IDs
  for (const [id, occurrences] of idMap) {
    if (occurrences.length > 1) {
      issues.push({
        id,
        type: 'duplicate_id',
        message: `ID "${id}" appears ${occurrences.length} times in the collection`,
        severity: 'critical',
        data: { occurrences: occurrences.length }
      });
    }
  }

  return issues;
}

/**
 * Validate reference integrity
 */
function validateReferenceIntegrity(items: UnifiedVocabularyItem[]): VocabularyIssue[] {
  const issues: VocabularyIssue[] = [];
  const idSet = new Set(items.map(item => item.id));

  // Check verb partner references
  items.forEach(item => {
    if (item.grammar?.verbPartnerId) {
      const partnerId = item.grammar.verbPartnerId;
      if (!idSet.has(partnerId)) {
        issues.push({
          id: item.id,
          type: 'broken_reference',
          message: `Verb partner reference "${partnerId}" does not exist`,
          severity: 'high',
          data: {
            referenceType: 'verbPartnerId',
            referenceId: partnerId
          }
        });
      }
    }
  });

  return issues;
}

/**
 * Validate collection-level properties
 */
function validateCollectionLevel(collection: UnifiedVocabularyCollection): {
  issues: VocabularyIssue[];
  warnings: VocabularyIssue[];
} {
  const issues: VocabularyIssue[] = [];
  const warnings: VocabularyIssue[] = [];

  // 1. Check item count consistency
  if (collection.itemCount !== collection.items.length) {
    issues.push({
      id: collection.id,
      type: 'collection_error',
      message: `Item count mismatch: declared ${collection.itemCount}, actual ${collection.items.length}`,
      severity: 'high',
      data: {
        declaredCount: collection.itemCount,
        actualCount: collection.items.length
      }
    });
  }

  // 2. Check difficulty range consistency
  const actualMinDifficulty = Math.min(...collection.items.map(item => item.difficulty));
  const actualMaxDifficulty = Math.max(...collection.items.map(item => item.difficulty));

  if (collection.difficultyRange[0] !== actualMinDifficulty ||
      collection.difficultyRange[1] !== actualMaxDifficulty) {
    warnings.push({
      id: collection.id,
      type: 'collection_warning',
      message: `Difficulty range mismatch: declared [${collection.difficultyRange[0]}, ${collection.difficultyRange[1]}], actual [${actualMinDifficulty}, ${actualMaxDifficulty}]`,
      severity: 'medium',
      data: {
        declaredRange: collection.difficultyRange,
        actualRange: [actualMinDifficulty, actualMaxDifficulty]
      }
    });
  }

  // 3. Check category consistency
  const actualCategories = new Set<VocabularyCategory>();
  collection.items.forEach(item => {
    item.categories.forEach(category => actualCategories.add(category));
  });

  const declaredCategories = new Set(collection.categories);
  const missingCategories = Array.from(actualCategories).filter(
    cat => !declaredCategories.has(cat)
  );
  const extraCategories = Array.from(declaredCategories).filter(
    cat => !actualCategories.has(cat)
  );

  if (missingCategories.length > 0) {
    warnings.push({
      id: collection.id,
      type: 'collection_warning',
      message: `Collection is missing ${missingCategories.length} categories in declaration: ${missingCategories.join(', ')}`,
      severity: 'medium',
      data: { missingCategories }
    });
  }

  if (extraCategories.length > 0) {
    warnings.push({
      id: collection.id,
      type: 'collection_warning',
      message: `Collection declares ${extraCategories.length} categories not used in items: ${extraCategories.join(', ')}`,
      severity: 'low',
      data: { extraCategories }
    });
  }

  // 4. Check statistics consistency
  if (collection.statistics) {
    const stats = collection.statistics;

    // Check part of speech statistics
    const actualPosCounts: Record<string, number> = {};
    collection.items.forEach(item => {
      actualPosCounts[item.partOfSpeech] = (actualPosCounts[item.partOfSpeech] || 0) + 1;
    });

    for (const [pos, count] of Object.entries(stats.byPartOfSpeech)) {
      if (actualPosCounts[pos] !== count) {
        warnings.push({
          id: collection.id,
          type: 'statistics_warning',
          message: `Part of speech statistics mismatch for "${pos}": declared ${count}, actual ${actualPosCounts[pos] || 0}`,
          severity: 'medium',
          data: {
            partOfSpeech: pos,
            declaredCount: count,
            actualCount: actualPosCounts[pos] || 0
          }
        });
      }
    }

    // Check difficulty statistics
    const actualDifficultyCounts: Record<string, number> = {};
    collection.items.forEach(item => {
      actualDifficultyCounts[item.difficulty.toString()] =
        (actualDifficultyCounts[item.difficulty.toString()] || 0) + 1;
    });

    for (const [difficulty, count] of Object.entries(stats.byDifficulty)) {
      if (actualDifficultyCounts[difficulty] !== count) {
        warnings.push({
          id: collection.id,
          type: 'statistics_warning',
          message: `Difficulty statistics mismatch for level ${difficulty}: declared ${count}, actual ${actualDifficultyCounts[difficulty] || 0}`,
          severity: 'medium',
          data: {
            difficulty: parseInt(difficulty),
            declaredCount: count,
            actualCount: actualDifficultyCounts[difficulty] || 0
          }
        });
      }
    }
  }

  return { issues, warnings };
}

/**
 * Generate a verification report
 */
export function generateVerificationReport(
  validationResult: ValidationResult,
  collectionName: string = 'Vocabulary Collection'
): VocabularyVerificationReport {
  const totalItems = validationResult.validatedItems;
  const invalidItems = validationResult.invalidItems;
  const verifiedItems = totalItems - invalidItems;
  const passRate = totalItems > 0 ? (verifiedItems / totalItems * 100).toFixed(2) : '100.00';

  // Group issues by severity
  const issuesBySeverity: Record<string, VocabularyIssue[]> = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  validationResult.issues.forEach(issue => {
    issuesBySeverity[issue.severity].push(issue);
  });

  // Group warnings by severity
  const warningsBySeverity: Record<string, VocabularyIssue[]> = {
    high: [],
    medium: [],
    low: []
  };

  validationResult.warnings.forEach(warning => {
    warningsBySeverity[warning.severity].push(warning);
  });

  return {
    timestamp: new Date().toISOString(),
    totalItems,
    verifiedItems,
    issues: validationResult.issues,
    passRate: `${passRate}%`,
    summary: {
      collectionName,
      totalItems,
      verifiedItems,
      invalidItems,
      criticalIssues: issuesBySeverity.critical.length,
      highIssues: issuesBySeverity.high.length,
      mediumIssues: issuesBySeverity.medium.length,
      lowIssues: issuesBySeverity.low.length,
      highWarnings: warningsBySeverity.high.length,
      mediumWarnings: warningsBySeverity.medium.length,
      lowWarnings: warningsBySeverity.low.length
    },
    issuesBySeverity,
    warningsBySeverity
  };
}

/**
 * Fix common validation issues
 */
export function fixValidationIssues(
  items: UnifiedVocabularyItem[],
  issues: VocabularyIssue[]
): UnifiedVocabularyItem[] {
  const fixedItems = [...items];
  const itemMap = new Map<string, UnifiedVocabularyItem>();

  // Create a map of items by ID
  fixedItems.forEach(item => {
    itemMap.set(item.id, item);
  });

  // Apply fixes for each issue
  issues.forEach(issue => {
    const item = itemMap.get(issue.id);
    if (!item) return;

    switch (issue.type) {
      case 'duplicate_id':
        // Generate a new unique ID
        item.id = `fixed-${crypto.randomUUID()}`;
        break;

      case 'broken_reference':
        if (issue.data.referenceType === 'verbPartnerId') {
          // Remove the broken reference
          if (item.grammar) {
            item.grammar.verbPartnerId = undefined;
            // If grammar is now empty, remove it
            if (Object.keys(item.grammar).length === 0) {
              item.grammar = undefined;
            }
          }
        }
        break;

      case 'logic_error':
        if (issue.message.includes('Noun has verb aspect')) {
          // Remove verb aspect from nouns
          if (item.grammar?.verbAspect) {
            item.grammar.verbAspect = undefined;
            // If grammar is now empty, remove it
            if (item.grammar && Object.keys(item.grammar).length === 0) {
              item.grammar = undefined;
            }
          }
        } else if (issue.message.includes('Verb has noun gender')) {
          // Remove gender from verbs
          if (item.grammar?.gender) {
            item.grammar.gender = undefined;
            // If grammar is now empty, remove it
            if (item.grammar && Object.keys(item.grammar).length === 0) {
              item.grammar = undefined;
            }
          }
        } else if (issue.message.includes('Difficulty level')) {
          // Fix difficulty level
          item.difficulty = Math.min(Math.max(item.difficulty, 1), 5);
        }
        break;

      case 'timestamp_error':
        if (issue.message.includes('CreatedAt is after updatedAt')) {
          // Set createdAt to updatedAt
          item.createdAt = item.updatedAt;
        }
        break;

      case 'metadata_error':
        if (issue.message.includes('Frequency')) {
          // Fix frequency
          if (item.metadata?.frequency) {
            item.metadata.frequency = Math.min(Math.max(item.metadata.frequency, 1), 100);
          }
        } else if (issue.message.includes('Learning phase')) {
          // Fix learning phase
          if (item.metadata?.learningPhase) {
            item.metadata.learningPhase = Math.min(Math.max(item.metadata.learningPhase, 0), 6);
          }
        }
        break;
    }

    // Update the item in the map
    itemMap.set(item.id, item);
  });

  return Array.from(itemMap.values());
}

/**
 * Validate and fix a vocabulary collection
 */
export function validateAndFixCollection(
  collection: UnifiedVocabularyCollection,
  config: ValidationConfig = DEFAULT_VALIDATION_CONFIG
): {
  validationResult: ValidationResult;
  fixedCollection: UnifiedVocabularyCollection;
  report: VocabularyVerificationReport;
} {
  // First validation pass
  const validationResult = validateVocabularyCollection(collection, config);

  if (validationResult.isValid) {
    // If already valid, return as is
    const report = generateVerificationReport(validationResult, collection.name);
    return { validationResult, fixedCollection: collection, report };
  }

  // Fix issues
  const fixedItems = fixValidationIssues(collection.items, validationResult.issues);

  // Create fixed collection
  const fixedCollection: UnifiedVocabularyCollection = {
    ...collection,
    items: fixedItems,
    updatedAt: new Date()
  };

  // Recalculate statistics
  fixedCollection.statistics = calculateCollectionStatistics(fixedCollection);

  // Second validation pass
  const finalValidationResult = validateVocabularyCollection(fixedCollection, config);
  const report = generateVerificationReport(finalValidationResult, collection.name);

  return { validationResult: finalValidationResult, fixedCollection, report };
}

/**
 * Calculate collection statistics
 */
function calculateCollectionStatistics(collection: UnifiedVocabularyCollection): any {
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
  collection.items.forEach(item => item.categories.forEach(cat => allCategories.add(cat)));
  Array.from(allCategories).forEach(cat => byCategory[cat] = 0);

  ['A1', 'A2', 'B1', 'B2', 'C1'].forEach(level => byLevel[level] = 0);

  // Count items
  collection.items.forEach(item => {
    // Count by part of speech
    byPartOfSpeech[item.partOfSpeech] = (byPartOfSpeech[item.partOfSpeech] || 0) + 1;

    // Count by difficulty
    const difficulty = item.difficulty || 1;
    byDifficulty[difficulty.toString()] = (byDifficulty[difficulty.toString()] || 0) + 1;
    minDifficulty = Math.min(minDifficulty, difficulty);
    maxDifficulty = Math.max(maxDifficulty, difficulty);

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