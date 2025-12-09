/**
 * Text Utilities for Vocabulary Migration
 *
 * Provides text processing functions for normalization,
 * similarity calculation, and text analysis
 */

import type { DeduplicationConfig } from './deduplication-utils';
import { DEFAULT_DEDUPLICATION_CONFIG } from './deduplication-utils';

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    // Remove articles
    .replace(/\b(der|die|das|dem|den|des|ein|eine|einer|eines|einem|einen)\b/g, '')
    .replace(/\b(ът|та|то|те|а|я|о|и)\b/g, '')
    // Remove punctuation
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits to change one string into another)
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate Jaro-Winkler similarity between two strings
 * (measures similarity, with preference for strings that match from the beginning)
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const m = matchingCharacters(s1, s2);
  if (m === 0) return 0;

  const t = transpositions(s1, s2);
  const s1Length = s1.length;
  const s2Length = s2.length;

  const jaro = ((m / s1Length) + (m / s2Length) + ((m - t) / m)) / 3;

  // Calculate prefix scale (Winkler modification)
  const prefixScale = Math.min(prefixMatch(s1, s2), 4) * 0.1;

  return jaro + (prefixScale * (1 - jaro));
}

/**
 * Count matching characters between two strings
 */
function matchingCharacters(s1: string, s2: string): number {
  const s1Length = s1.length;
  const s2Length = s2.length;
  const matchDistance = Math.floor(Math.max(s1Length, s2Length) / 2) - 1;

  let matches = 0;
  const s1Matches = new Array(s1Length).fill(false);
  const s2Matches = new Array(s2Length).fill(false);

  for (let i = 0; i < s1Length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2Length);

    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  return matches;
}

/**
 * Count transpositions between two strings
 */
function transpositions(s1: string, s2: string): number {
  let transpositions = 0;
  let k = 0;

  for (let i = 0; i < s1.length; i++) {
    if (s1[i] === s2[k]) {
      k++;
    } else if (k > 0 && s1[i] === s2[k - 1]) {
      transpositions++;
    }
  }

  return Math.floor(transpositions / 2);
}

/**
 * Count prefix matches between two strings
 */
function prefixMatch(s1: string, s2: string): number {
  let n = Math.min(s1.length, s2.length, 4);
  let i = 0;

  while (i < n && s1[i] === s2[i]) {
    i++;
  }

  return i;
}

/**
 * Calculate text similarity using multiple algorithms
 */
export function calculateTextSimilarity(
  text1: string,
  text2: string,
  config: DeduplicationConfig = DEFAULT_DEDUPLICATION_CONFIG
): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  // If texts are identical
  if (normalized1 === normalized2) return 1.0;

  // If texts are very short, use exact match
  if (normalized1.length < 3 || normalized2.length < 3) {
    return normalized1 === normalized2 ? 1.0 : 0.0;
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalized1, normalized2);

  // Calculate Jaro-Winkler similarity
  const jaroWinkler = jaroWinklerSimilarity(normalized1, normalized2);

  // Normalize Levenshtein distance by the length of the longer text
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const normalizedDistance = distance / maxLength;

  // Calculate similarity score (0-1)
  const levenshteinSimilarity = 1 - normalizedDistance;

  // Combine similarity scores
  const combinedSimilarity = (levenshteinSimilarity * 0.6) + (jaroWinkler * 0.4);

  // Check if within Levenshtein distance threshold
  if (distance <= config.maxLevenshteinDistance) {
    return Math.min(combinedSimilarity * 1.2, 1.0); // Boost similarity for small distances
  }

  return combinedSimilarity;
}

/**
 * Extract base form of a word (remove grammatical endings)
 */
export function extractBaseForm(word: string, language: 'german' | 'bulgarian'): string {
  const normalized = normalizeText(word);

  if (language === 'german') {
    return extractGermanBaseForm(normalized);
  } else {
    return extractBulgarianBaseForm(normalized);
  }
}

/**
 * Extract base form of a German word
 */
function extractGermanBaseForm(word: string): string {
  // Remove common German grammatical endings
  const endings = [
    'e', 'en', 'em', 'es', 'er', 'st', 't', 'te', 'test', 'ten', 'tet', // verb conjugations
    's', 'n', 'es', 'e', 'er', 'en', 'em', // noun declensions
    'er', 'e', 'es', 'en', 'em', // adjective declensions
    'heit', 'keit', 'ung', 'schaft', 'tum', 'nis', 'ling', 'chen', 'lein' // noun suffixes
  ];

  for (const ending of endings) {
    if (word.endsWith(ending) && word.length > ending.length) {
      return word.substring(0, word.length - ending.length);
    }
  }

  return word;
}

/**
 * Extract base form of a Bulgarian word
 */
function extractBulgarianBaseForm(word: string): string {
  // Remove common Bulgarian grammatical endings
  const endings = [
    'ът', 'та', 'то', 'те', // definite articles
    'а', 'я', 'о', 'е', 'и', // noun endings
    'ам', 'аш', 'а', 'аме', 'ате', 'ат', // verb conjugations
    'и', 'я', 'а', 'о', 'е', // adjective endings
    'ия', 'ие', 'ият', 'ия', 'ието', 'ията' // noun suffixes
  ];

  for (const ending of endings) {
    if (word.endsWith(ending) && word.length > ending.length) {
      return word.substring(0, word.length - ending.length);
    }
  }

  return word;
}

/**
 * Check if two words are different grammatical forms of the same base word
 */
export function areGrammaticalForms(
  word1: string,
  word2: string,
  language: 'german' | 'bulgarian'
): boolean {
  const base1 = extractBaseForm(word1, language);
  const base2 = extractBaseForm(word2, language);

  return base1 === base2 && base1.length > 2;
}

/**
 * Tokenize text into words
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];

  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Calculate word overlap between two texts
 */
export function calculateWordOverlap(text1: string, text2: string): number {
  const words1 = tokenizeText(text1);
  const words2 = tokenizeText(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Check if text contains a specific word form
 */
export function containsWordForm(text: string, word: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedWord = normalizeText(word);

  // Check for exact match
  if (normalizedText.includes(normalizedWord)) {
    return true;
  }

  // Check for grammatical variations
  const words = tokenizeText(normalizedText);
  for (const w of words) {
    if (areGrammaticalForms(w, normalizedWord, 'german') ||
        areGrammaticalForms(w, normalizedWord, 'bulgarian')) {
      return true;
    }
  }

  return false;
}