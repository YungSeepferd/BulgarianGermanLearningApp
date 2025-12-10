/**
 * Part-of-Speech Utility Functions
 *
 * This file contains utility functions for working with part-of-speech classifications,
 * including display formatting and validation.
 */

/**
 * Correct part-of-speech label for display
 *
 * This utility function standardizes part-of-speech labels for
 * consistent display in the UI.
 *
 * @param pos - The part-of-speech classification
 * @returns Display-friendly part-of-speech label
 */
export function correctPartOfSpeech(pos: string): string {
  const displayNames: Record<string, string> = {
    'noun': 'Noun',
    'verb': 'Verb',
    'adjective': 'Adjective',
    'adverb': 'Adverb',
    'pronoun': 'Pronoun',
    'preposition': 'Preposition',
    'conjunction': 'Conjunction',
    'interjection': 'Interjection',
    'numeral': 'Numeral',
    'article': 'Article',
    'phrase': 'Phrase'
  };

  return displayNames[pos] || pos;
}