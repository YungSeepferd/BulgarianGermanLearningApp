/**
 * Validation utilities - Input validation and sanitization
 * @description Provides validation functions for practice settings and user inputs
 * @version 1.0.0
 * @updated November 2025
 */

import type { PracticeSettings, VocabularyEntry } from '$lib/types/index.js';

/**
 * Validates and sanitizes practice settings from URL parameters
 * @param rawSettings - Raw settings object from URL parameters
 * @returns Validated practice settings object
 * @throws Error if settings are invalid
 */
export function validatePracticeSettings(rawSettings: Record<string, string>): PracticeSettings {
  const settings: Partial<PracticeSettings> = {};

  // Validate direction
  const direction = rawSettings.direction?.toLowerCase();
  if (direction && ['bg-de', 'de-bg', 'all'].includes(direction)) {
    settings.direction = direction as 'bg-de' | 'de-bg' | 'all';
  } else {
    settings.direction = 'all'; // Default value
  }

  // Validate level
  const level = rawSettings.level?.toLowerCase();
  if (level && ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'all'].includes(level)) {
    settings.level = level;
  } else {
    settings.level = 'all'; // Default value
  }

  // Validate category
  const category = rawSettings.category?.toLowerCase();
  if (category && ['nouns', 'verbs', 'adjectives', 'phrases', 'all'].includes(category)) {
    settings.category = category;
  } else {
    settings.category = 'all'; // Default value
  }

  // Validate maxCards
  const maxCards = parseInt(rawSettings.maxCards || '20');
  if (isNaN(maxCards) || maxCards < 1 || maxCards > 100) {
    settings.maxCards = 20; // Default value
  } else {
    settings.maxCards = maxCards;
  }

  // Validate showHints
  const showHints = rawSettings.showHints?.toLowerCase();
  settings.showHints = showHints === 'true';

  // Validate autoAdvance
  const autoAdvance = rawSettings.autoAdvance?.toLowerCase();
  settings.autoAdvance = autoAdvance === 'true';

  // Validate difficulty
  const difficulty = rawSettings.difficulty?.toLowerCase();
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
    settings.difficulty = difficulty as 'easy' | 'medium' | 'hard';
  } else {
    settings.difficulty = 'medium'; // Default value
  }

  // Return validated settings with all required properties
  return settings as PracticeSettings;
}

/**
 * Validates a vocabulary entry
 * @param entry - Vocabulary entry to validate
 * @returns True if valid, throws error if invalid
 */
export function validateVocabularyEntry(entry: VocabularyEntry): boolean {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Vocabulary entry must be an object');
  }

  // Required fields
  const requiredFields = ['id', 'bg', 'de', 'level', 'category'];
  for (const field of requiredFields) {
    if (!(field in entry) || entry[field as keyof VocabularyEntry] === undefined) {
      throw new Error(`Vocabulary entry missing required field: ${field}`);
    }
  }

  // Validate ID
  if (typeof entry.id !== 'string' || entry.id.trim() === '') {
    throw new Error('Vocabulary entry ID must be a non-empty string');
  }

  // Validate Bulgarian text
  if (typeof entry.bg !== 'string' || entry.bg.trim() === '') {
    throw new Error('Vocabulary entry Bulgarian text must be a non-empty string');
  }

  // Validate German text
  if (typeof entry.de !== 'string' || entry.de.trim() === '') {
    throw new Error('Vocabulary entry German text must be a non-empty string');
  }

  // Validate level
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!validLevels.includes(entry.level)) {
    throw new Error(`Vocabulary entry level must be one of: ${validLevels.join(', ')}`);
  }

  // Validate category
  const validCategories = ['nouns', 'verbs', 'adjectives', 'phrases'];
  if (!validCategories.includes(entry.category)) {
    throw new Error(`Vocabulary entry category must be one of: ${validCategories.join(', ')}`);
  }

  // Validate optional fields
  if (entry.pronunciation && typeof entry.pronunciation !== 'string') {
    throw new Error('Vocabulary entry pronunciation must be a string');
  }

  if (entry.gender && !['masculine', 'feminine', 'neuter'].includes(entry.gender)) {
    throw new Error('Vocabulary entry gender must be masculine, feminine, or neuter');
  }

  if (entry.wordType && typeof entry.wordType !== 'string') {
    throw new Error('Vocabulary entry wordType must be a string');
  }

  if (entry.examples && !Array.isArray(entry.examples)) {
    throw new Error('Vocabulary entry examples must be an array');
  }

  if (entry.tags && !Array.isArray(entry.tags)) {
    throw new Error('Vocabulary entry tags must be an array');
  }

  if (entry.notes && typeof entry.notes !== 'string') {
    throw new Error('Vocabulary entry notes must be a string');
  }

  // Validate spaced repetition data if present
  if (entry.spacedRepetition) {
    validateSpacedRepetitionData(entry.spacedRepetition);
  }

  return true;
}

/**
 * Validates spaced repetition data
 * @param data - Spaced repetition data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateSpacedRepetitionData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    throw new Error('Spaced repetition data must be an object');
  }

  // Validate easeFactor
  if (typeof data.easeFactor !== 'number' || data.easeFactor < 1.3 || data.easeFactor > 2.5) {
    throw new Error('Spaced repetition easeFactor must be a number between 1.3 and 2.5');
  }

  // Validate interval
  if (typeof data.interval !== 'number' || data.interval < 0) {
    throw new Error('Spaced repetition interval must be a non-negative number');
  }

  // Validate repetitions
  if (typeof data.repetitions !== 'number' || data.repetitions < 0) {
    throw new Error('Spaced repetition repetitions must be a non-negative number');
  }

  // Validate nextReview
  if (data.nextReview && !(data.nextReview instanceof Date) && typeof data.nextReview !== 'string') {
    throw new Error('Spaced repetition nextReview must be a Date or ISO string');
  }

  // Validate lastReview
  if (data.lastReview && !(data.lastReview instanceof Date) && typeof data.lastReview !== 'string') {
    throw new Error('Spaced repetition lastReview must be a Date or ISO string');
  }

  return true;
}

// Note: sanitizeText, validateGrade, validateSessionId, and validateDateString
// are now imported from './common.js' to eliminate duplication

/**
 * Validates an array of vocabulary entries
 * @param entries - Array of vocabulary entries to validate
 * @returns True if all entries are valid, throws error if any are invalid
 */
export function validateVocabularyArray(entries: VocabularyEntry[]): boolean {
  if (!Array.isArray(entries)) {
    throw new TypeError('Vocabulary data must be an array');
  }

  if (entries.length === 0) {
    throw new Error('Vocabulary array cannot be empty');
  }

  // Validate each entry
  for (const [i, entry] of entries.entries()) {
    try {
      validateVocabularyEntry(entry);
    } catch (error) {
      throw new Error(`Vocabulary entry at index ${i} is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate vocabulary entry ID found: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  return true;
}

/**
 * Validates API response data
 * @param data - Response data to validate
 * @param expectedType - Expected data type
 * @returns True if valid, throws error if invalid
 */
export function validateApiResponse(data: any, expectedType: 'vocabulary' | 'stats' | 'settings'): boolean {
  if (!data || typeof data !== 'object') {
    throw new Error('API response must be an object');
  }

  switch (expectedType) {
  case 'vocabulary': {
    if (!Array.isArray(data)) {
      throw new TypeError('Vocabulary API response must be an array');
    }
    return validateVocabularyArray(data);
  }

  case 'stats': {
    // Validate stats object structure
    const requiredStatsFields = ['reviewedCards', 'correctAnswers', 'grades', 'startTime'];
    for (const field of requiredStatsFields) {
      if (!(field in data)) {
        throw new Error(`Stats API response missing required field: ${field}`);
      }
    }
    return true;
  }

  case 'settings': {
    // Validate settings object structure
    validatePracticeSettings(data);
    return true;
  }

  default: {
    throw new Error(`Unknown expected type: ${expectedType}`);
  }
  }
}

/**
 * Creates a validation error with context
 * @param message - Error message
 * @param field - Field that caused the error
 * @param value - Value that caused the error
 * @returns Validation error object
 */
export function createValidationError(message: string, field?: string, value?: any): Error {
  const errorMessage = field ? `${field}: ${message}` : message;
  const error = new Error(errorMessage);
  
  // Add context to error
  (error as any).field = field;
  (error as any).value = value;
  (error as any).isValidationError = true;
  
  return error;
}

/**
 * Checks if an error is a validation error
 * @param error - Error to check
 * @returns True if validation error, false otherwise
 */
export function isValidationError(error: any): boolean {
  return error && error.isValidationError === true;
}