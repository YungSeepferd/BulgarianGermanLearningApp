import { describe, it, expect } from 'vitest';
import { ExerciseService } from '$lib/services/exercise';

describe('ExerciseService - Matching Exercise', () => {
  describe('validateMatching', () => {
    it('should return true when all pairs are correct', () => {
      const userPairs = [
        { leftId: 'left1', rightId: 'right1' },
        { leftId: 'left2', rightId: 'right2' },
      ];
      const correctPairs = [
        { leftId: 'left1', rightId: 'right1' },
        { leftId: 'left2', rightId: 'right2' },
      ];

      const isValid = ExerciseService.validateMatching(userPairs, correctPairs);
      expect(isValid).toBe(true);
    });

    it('should return false when any pair is incorrect', () => {
      const userPairs = [
        { leftId: 'left1', rightId: 'right1' },
        { leftId: 'left2', rightId: 'right99' }, // Wrong match
      ];
      const correctPairs = [
        { leftId: 'left1', rightId: 'right1' },
        { leftId: 'left2', rightId: 'right2' },
      ];

      const isValid = ExerciseService.validateMatching(userPairs, correctPairs);
      expect(isValid).toBe(false);
    });

    it('should handle German-Bulgarian matching', () => {
      const userPairs = [
        { leftId: 'de1', rightId: 'bg1' },
        { leftId: 'de2', rightId: 'bg2' },
        { leftId: 'de3', rightId: 'bg3' },
      ];
      const correctPairs = [
        { leftId: 'de1', rightId: 'bg1' },
        { leftId: 'de2', rightId: 'bg2' },
        { leftId: 'de3', rightId: 'bg3' },
      ];

      const isValid = ExerciseService.validateMatching(userPairs, correctPairs);
      expect(isValid).toBe(true);
    });

    it('should return false for incomplete matching', () => {
      const userPairs = [{ leftId: 'left1', rightId: 'right1' }]; // Only 1 of 2
      const correctPairs = [
        { leftId: 'left1', rightId: 'right1' },
        { leftId: 'left2', rightId: 'right2' },
      ];

      const isValid = ExerciseService.validateMatching(userPairs, correctPairs);
      expect(isValid).toBe(false);
    });

    it('should handle empty arrays', () => {
      const isValid = ExerciseService.validateMatching([], []);
      expect(isValid).toBe(true);
    });
  });
});

describe('ExerciseService - Ordering Exercise', () => {
  describe('validateOrdering', () => {
    it('should return true when order is correct', () => {
      const userOrder = ['item1', 'item2', 'item3'];
      const correctOrder = ['item1', 'item2', 'item3'];

      const isValid = ExerciseService.validateOrdering(userOrder, correctOrder);
      expect(isValid).toBe(true);
    });

    it('should return false when order is incorrect', () => {
      const userOrder = ['item1', 'item3', 'item2'];
      const correctOrder = ['item1', 'item2', 'item3'];

      const isValid = ExerciseService.validateOrdering(userOrder, correctOrder);
      expect(isValid).toBe(false);
    });

    it('should handle sentence ordering', () => {
      const userOrder = ['s1', 's2', 's3', 's4'];
      const correctOrder = ['s1', 's2', 's3', 's4'];

      const isValid = ExerciseService.validateOrdering(userOrder, correctOrder);
      expect(isValid).toBe(true);
    });

    it('should be strict about order', () => {
      const userOrder = ['a', 'b', 'c'];
      const correctOrder = ['a', 'c', 'b'];

      const isValid = ExerciseService.validateOrdering(userOrder, correctOrder);
      expect(isValid).toBe(false);
    });

    it('should handle single items', () => {
      const isValid = ExerciseService.validateOrdering(['item1'], ['item1']);
      expect(isValid).toBe(true);
    });

    it('should return false for different lengths', () => {
      const userOrder = ['item1', 'item2'];
      const correctOrder = ['item1', 'item2', 'item3'];

      const isValid = ExerciseService.validateOrdering(userOrder, correctOrder);
      expect(isValid).toBe(false);
    });
  });
});

describe('ExerciseService - Typing Exercise', () => {
  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      const similarity = ExerciseService.calculateSimilarity('hello', 'hello');
      expect(similarity).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      const similarity = ExerciseService.calculateSimilarity('abc', 'xyz');
      expect(similarity).toBeCloseTo(0, 1);
    });

    it('should handle case-insensitive comparison', () => {
      const similarity = ExerciseService.calculateSimilarity('Hello', 'hello');
      expect(similarity).toBe(1.0);
    });

    it('should handle one-character difference', () => {
      const similarity = ExerciseService.calculateSimilarity('cat', 'bat');
      // 2 out of 3 characters match
      expect(similarity).toBeGreaterThan(0.6);
      expect(similarity).toBeLessThan(0.8);
    });

    it('should handle transposition', () => {
      const similarity = ExerciseService.calculateSimilarity('abc', 'bac');
      // Similar strings should have high similarity
      expect(similarity).toBeGreaterThan(0.6);
    });

    it('should handle longer strings', () => {
      const similarity = ExerciseService.calculateSimilarity('kitten', 'sitting');
      // Should calculate Levenshtein distance correctly
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });

    it('should handle German words', () => {
      const similarity = ExerciseService.calculateSimilarity('Buch', 'Buch');
      expect(similarity).toBe(1.0);
    });

    it('should handle Bulgarian words', () => {
      const similarity = ExerciseService.calculateSimilarity('Здравей', 'Здравей');
      expect(similarity).toBe(1.0);
    });

    it('should handle similar Bulgarian words', () => {
      const similarity = ExerciseService.calculateSimilarity('Благодаря', 'Благодари');
      expect(similarity).toBeGreaterThan(0.8);
    });
  });

  describe('validateTypingAnswer with similarity', () => {
    it('should validate typing with default threshold', () => {
      // Using calculateSimilarity for typing validation
      const similarity = ExerciseService.calculateSimilarity('hello', 'hello');
      const isValid = similarity >= 0.85;
      expect(isValid).toBe(true);
    });

    it('should handle similar but not exact answers', () => {
      const similarity = ExerciseService.calculateSimilarity('programing', 'programming');
      const isValid = similarity >= 0.85;
      // Should be close enough
      expect(similarity).toBeGreaterThan(0.8);
    });

    it('should reject very different answers', () => {
      const similarity = ExerciseService.calculateSimilarity('cat', 'dog');
      const isValid = similarity >= 0.85;
      expect(isValid).toBe(false);
    });

    it('should handle empty strings', () => {
      const similarity = ExerciseService.calculateSimilarity('', '');
      expect(similarity).toBe(1.0);
    });
  });
});
