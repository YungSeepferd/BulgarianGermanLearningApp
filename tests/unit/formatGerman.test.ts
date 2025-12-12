/**
 * Tests for German term formatting and normalization across components
 * Verifies shared formatGermanTerm helper ensures consistency
 */

import { describe, it, expect } from 'vitest';
import { formatGermanTerm } from '$lib/utils/formatGerman';
import {
  nounWithDeclension,
  compoundWordWithBreakdown,
  wordNeedingNormalization,
  verbWithoutArticle,
  adjectiveWithoutArticle,
  wordWithOnlyLinks,
  fullyFeaturedNoun
} from '../fixtures/vocabulary-with-declension';

describe('formatGermanTerm', () => {
  describe('Article normalization', () => {
    it('should preserve explicit articles', () => {
      const result = formatGermanTerm(nounWithDeclension);
      expect(result).toBe('die Schule');
    });

    it('should capitalize noun after explicit article', () => {
      const result = formatGermanTerm(wordNeedingNormalization);
      // Input: 'der apfel', should normalize to 'der Apfel'
      expect(result).toMatch(/^der\s+[A-Z]/);
      expect(result.toLowerCase()).toContain('apfel');
    });

    it('should add default article for nouns without one', () => {
      const noArticleNoun = {
        ...wordNeedingNormalization,
        german: 'apfel', // no article
        metadata: { gender: 'masculine' }
      };
      const result = formatGermanTerm(noArticleNoun);
      expect(result).toBe('der Apfel');
    });

    it('should use fallback article from metadata', () => {
      const result = formatGermanTerm(fullyFeaturedNoun);
      // metadata.article: 'das' -> should use 'das'
      expect(result).toBe('das Fenster');
    });
  });

  describe('Non-noun handling', () => {
    it('should not add article to verbs', () => {
      const result = formatGermanTerm(verbWithoutArticle);
      expect(result).toBe('lesen');
      expect(result).not.toContain('der');
      expect(result).not.toContain('die');
      expect(result).not.toContain('das');
    });

    it('should not add article to adjectives', () => {
      const result = formatGermanTerm(adjectiveWithoutArticle);
      expect(result).toBe('groß');
      expect(result).not.toContain('der');
      expect(result).not.toContain('die');
      expect(result).not.toContain('das');
    });

    it('should preserve adverb as-is', () => {
      const result = formatGermanTerm(compoundWordWithBreakdown);
      expect(result).toBe('zusammen');
    });
  });

  describe('Empty and edge cases', () => {
    it('should handle empty german string', () => {
      const emptyItem = { ...wordNeedingNormalization, german: '' };
      const result = formatGermanTerm(emptyItem);
      expect(result).toBe('');
    });

    it('should handle whitespace-only german', () => {
      const whitespaceItem = { ...wordNeedingNormalization, german: '   ' };
      const result = formatGermanTerm(whitespaceItem);
      expect(result).toBe('');
    });

    it('should handle null metadata gracefully', () => {
      const noMetadata = { ...wordNeedingNormalization, metadata: undefined };
      const result = formatGermanTerm(noMetadata);
      expect(result).toBeTruthy();
    });
  });
});
