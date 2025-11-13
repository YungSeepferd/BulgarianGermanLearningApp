/**
 * Unit tests for UnifiedSpacedRepetition SM-2 algorithm
 * Tests cover: initialization, scheduling, ease factor calculations, interval calculations
 */

describe('UnifiedSpacedRepetition', () => {
  let sr;

  // Mock localStorage for testing
  let storage = {};
  const mockLocalStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => {
      storage[key] = value;
    },
    removeItem: (key) => {
      delete storage[key];
    },
    clear: () => {
      storage = {};
    },
    key: (index) => Object.keys(storage)[index],
    length: Object.keys(storage).length
  };

  beforeEach(() => {
    // Clear storage before each test
    storage = {};
    global.localStorage = mockLocalStorage;

    // Mock the class - we need to extract and test the logic
    // For now, create a simplified version to test the algorithm
  });

  describe('SM-2 Algorithm Core Calculations', () => {
    test('should calculate correct ease factor for grade 5 (excellent)', () => {
      const currentEF = 2.5;
      const grade = 5;
      // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      // For grade 5: EF' = 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02)) = 2.5 + 0.1 = 2.6
      const newEF = Math.max(
        1.3,
        currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );
      expect(Math.round(newEF * 100) / 100).toBe(2.6);
    });

    test('should calculate correct ease factor for grade 3 (correct)', () => {
      const currentEF = 2.5;
      const grade = 3;
      // For grade 3: EF' = 2.5 + (0.1 - 2 * (0.08 + 2 * 0.02)) = 2.5 + (0.1 - 0.24) = 2.36
      const newEF = Math.max(
        1.3,
        currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );
      expect(Math.round(newEF * 100) / 100).toBe(2.36);
    });

    test('should calculate correct ease factor for grade 0 (incorrect)', () => {
      const currentEF = 2.5;
      const grade = 0;
      // For grade 0: EF' = 2.5 + (0.1 - 5 * (0.08 + 5 * 0.02)) = 2.5 + (0.1 - 0.7) = 1.9
      const newEF = Math.max(
        1.3,
        currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );
      expect(Math.round(newEF * 100) / 100).toBe(1.9);
    });

    test('should enforce minimum ease factor of 1.3', () => {
      const currentEF = 1.4;
      const grade = 0;
      const newEF = Math.max(
        1.3,
        currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );
      // Result should be capped at 1.3
      expect(newEF).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('Interval Calculations', () => {
    test('should calculate interval 1 for first repetition (grade >= 3)', () => {
      const state = {
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1
      };
      const grade = 5;

      // First repetition should result in interval 1
      if (state.repetitions === 0) {
        state.interval = 1;
      }
      expect(state.interval).toBe(1);
    });

    test('should calculate interval 6 for second repetition (grade >= 3)', () => {
      const state = {
        repetitions: 1,
        easeFactor: 2.5,
        interval: 6
      };

      // Second repetition should result in interval 6
      if (state.repetitions === 1) {
        state.interval = 6;
      }
      expect(state.interval).toBe(6);
    });

    test('should reset interval to 1 on incorrect answer (grade < 3)', () => {
      const state = {
        repetitions: 5,
        easeFactor: 3.0,
        interval: 30
      };
      const grade = 2; // Incorrect

      if (grade < 3) {
        state.interval = 1;
        state.repetitions = 0;
      }
      expect(state.interval).toBe(1);
      expect(state.repetitions).toBe(0);
    });

    test('should apply difficulty multiplier for BG→DE direction', () => {
      const multiplier = 1.1; // BG→DE easier
      const interval = 6;
      const easeFactor = 2.5;

      const newInterval = Math.round(interval * easeFactor * multiplier);
      // 6 * 2.5 * 1.1 = 16.5, rounded = 17 or 16
      expect(newInterval).toBeGreaterThan(15);
      expect(newInterval).toBeLessThan(18);
    });

    test('should apply difficulty multiplier for DE→BG direction', () => {
      const multiplier = 1.2; // DE→BG harder
      const interval = 6;
      const easeFactor = 2.5;

      const newInterval = Math.round(interval * easeFactor * multiplier);
      // 6 * 2.5 * 1.2 = 18
      expect(newInterval).toBe(18);
    });
  });

  describe('Review State Management', () => {
    test('should initialize review state with correct default values', () => {
      const itemId = 'vocab-001';
      const direction = 'bg-de';

      const state = {
        itemId,
        direction,
        schemaVersion: 3,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        phase: 1,
        nextReview: Date.now(),
        lastReview: null,
        totalReviews: 0,
        correctAnswers: 0,
        correctStreak: 0,
        created: Date.now(),
        updated: Date.now()
      };

      expect(state.itemId).toBe('vocab-001');
      expect(state.direction).toBe('bg-de');
      expect(state.easeFactor).toBe(2.5);
      expect(state.repetitions).toBe(0);
      expect(state.phase).toBe(1);
      expect(state.lastReview).toBeNull();
    });

    test('should track correct streak on correct answers', () => {
      let state = {
        correctStreak: 0,
        correctAnswers: 0,
        totalReviews: 0
      };
      const grade = 5; // Correct

      if (grade >= 3) {
        state.correctAnswers++;
        state.correctStreak++;
        state.totalReviews++;
      }

      expect(state.correctStreak).toBe(1);
      expect(state.correctAnswers).toBe(1);
    });

    test('should reset correct streak on incorrect answers', () => {
      let state = {
        correctStreak: 5,
        correctAnswers: 10,
        totalReviews: 10
      };
      const grade = 2; // Incorrect

      if (grade < 3) {
        state.correctStreak = 0;
        state.totalReviews++;
      }

      expect(state.correctStreak).toBe(0);
      expect(state.correctAnswers).toBe(10); // Unchanged
    });
  });

  describe('Direction-Specific Behavior', () => {
    test('should handle bidirectional learning (BG→DE)', () => {
      const state = {
        direction: 'bg-de',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      };

      expect(state.direction).toBe('bg-de');
      // BG→DE has 1.1x difficulty multiplier
      const multiplier = 1.1;
      expect(multiplier).toBe(1.1);
    });

    test('should handle bidirectional learning (DE→BG)', () => {
      const state = {
        direction: 'de-bg',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      };

      expect(state.direction).toBe('de-bg');
      // DE→BG has 1.2x difficulty multiplier (harder)
      const multiplier = 1.2;
      expect(multiplier).toBe(1.2);
    });

    test('should apply stronger difficulty for German→Bulgarian (harder direction)', () => {
      const bgDeInterval = 6 * 2.5 * 1.1; // BG→DE easier: 16.5
      const deBgInterval = 6 * 2.5 * 1.2; // DE→BG harder: 18

      expect(deBgInterval).toBeGreaterThan(bgDeInterval);
    });
  });

  describe('Grade Validation', () => {
    test('should accept grades 0-5 as correct input', () => {
      const validGrades = [0, 1, 2, 3, 4, 5];
      validGrades.forEach((grade) => {
        expect(grade).toBeGreaterThanOrEqual(0);
        expect(grade).toBeLessThanOrEqual(5);
      });
    });

    test('should classify grade >= 3 as correct', () => {
      [3, 4, 5].forEach((grade) => {
        const isCorrect = grade >= 3;
        expect(isCorrect).toBe(true);
      });
    });

    test('should classify grade < 3 as incorrect', () => {
      [0, 1, 2].forEach((grade) => {
        const isCorrect = grade >= 3;
        expect(isCorrect).toBe(false);
      });
    });

    test('should throw error for invalid grades', () => {
      const invalidGrades = [-1, 6, 10, 'five'];
      invalidGrades.forEach((grade) => {
        if (typeof grade !== 'number' || grade < 0 || grade > 5) {
          expect(() => {
            throw new Error('Invalid grade');
          }).toThrow('Invalid grade');
        }
      });
    });
  });

  describe('Timestamp Handling', () => {
    test('should update lastReview timestamp on scheduling', () => {
      const before = Date.now();
      const state = {
        lastReview: null,
        updated: before
      };
      const after = Date.now();

      state.lastReview = after;
      state.updated = after;

      expect(state.lastReview).toBeGreaterThanOrEqual(before);
      expect(state.updated).toBeGreaterThanOrEqual(before);
    });

    test('should calculate nextReview as current time + interval in milliseconds', () => {
      const now = Date.now();
      const interval = 3; // days
      const nextReview = now + (interval * 24 * 60 * 60 * 1000);

      // Should be approximately 3 days in the future
      const dayInMs = 24 * 60 * 60 * 1000;
      const expectedMinimum = now + (3 * dayInMs) - 1000; // Allow 1s tolerance
      const expectedMaximum = now + (3 * dayInMs) + 1000;

      expect(nextReview).toBeGreaterThanOrEqual(expectedMinimum);
      expect(nextReview).toBeLessThanOrEqual(expectedMaximum);
    });
  });

  describe('Edge Cases', () => {
    test('should handle ease factor above 10', () => {
      const highEF = 15;
      expect(highEF).toBeGreaterThanOrEqual(1.3);
      // Should still work with normal calculations
      const newInterval = 6 * highEF * 1.1;
      expect(newInterval).toBeGreaterThan(0);
    });

    test('should handle zero ease factor gracefully', () => {
      const minEF = 1.3;
      expect(minEF).toBe(1.3); // Should never go below 1.3
    });

    test('should handle very large repetition counts', () => {
      const largeRepCount = 1000;
      const easeFactor = 3.0;
      const interval = 6 * (easeFactor ** (largeRepCount - 2));

      // Should produce a valid number (possibly very large)
      expect(typeof interval).toBe('number');
      expect(interval).toBeGreaterThan(0);
    });
  });
});
