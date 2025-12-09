/**
 * Type definitions for vocabulary data processing scripts
 * Provides proper typing for vocabulary items and related data structures
 */

import type { VocabularyItem } from '../../src/lib/schemas/vocabulary';

/**
 * Extended vocabulary item type for data processing
 * Includes additional fields that might be present during processing
 */
export interface ProcessingVocabularyItem extends VocabularyItem {
  // Allow additional fields during processing
  [key: string]: unknown;

  // Legacy fields that might exist in source data
  category?: string;
  level?: number;
  gender?: string;
  plural?: string;
  examples?: Array<{
    german: string;
    bulgarian: string;
    context?: string;
  }>;
  synonyms?: string[];
  antonyms?: string[];
  related?: string[];
  notes?: string;
}

/**
 * Cleaning rule interface for vocabulary processing
 */
export interface VocabularyCleaningRule {
  name: string;
  test: (item: ProcessingVocabularyItem) => boolean;
  fix: (item: ProcessingVocabularyItem) => ProcessingVocabularyItem;
}

/**
 * Verification check interface for vocabulary processing
 */
export interface VocabularyVerificationCheck {
  name: string;
  test: (items: ProcessingVocabularyItem[]) => ProcessingVocabularyItem[];
  fix?: (items: ProcessingVocabularyItem[]) => ProcessingVocabularyItem[];
}

/**
 * Issue tracking interface for verification
 */
export interface VocabularyIssue {
  id: string;
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: unknown;
}

/**
 * Verification report structure
 */
export interface VocabularyVerificationReport {
  timestamp: string;
  totalItems: number;
  verifiedItems: number;
  issues: VocabularyIssue[];
  passRate: string;
}

/**
 * Cleaning report structure
 */
export interface VocabularyCleaningReport {
  timestamp: string;
  summary: {
    originalCount: number;
    cleanedCount: number;
    validationPassed: boolean;
  };
  schemaValidation: {
    valid: boolean;
    errors: Array<{ id: string; errors: string; details?: unknown }>;
  };
  rulesApplied: string[];
}

/**
 * Utility type for vocabulary processing
 */
export type VocabularyProcessingResult = {
  valid: boolean;
  errors: Array<{ id: string; errors: string; details?: unknown }>;
};