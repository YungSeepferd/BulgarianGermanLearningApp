import { ExerciseResultsSchema, ExerciseStatsSchema } from '$lib/schemas/exercises';

/**
 * Exercise Service
 * Handles all exercise-related business logic:
 * - Exercise generation
 * - Answer validation
 * - Progress tracking
 * - Statistics
 */

export class ExerciseService {
  /**
   * Check if a fill-in-the-blank answer is correct
   * Handles variations and case sensitivity
   */
  static validateFillInBlankAnswer(
    userAnswer: string,
    correctAnswer: string,
    acceptedVariations?: string[]
  ): boolean {
    const normalized = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    // Check exact match
    if (normalized === normalizedCorrect) return true;

    // Check variations
    if (acceptedVariations) {
      for (const variation of acceptedVariations) {
        if (normalized === variation.trim().toLowerCase()) return true;
      }
    }

    return false;
  }

  /**
   * Check if a multiple choice answer is correct
   */
  static validateMultipleChoiceAnswer(selectedOptionId: string, correctOptionId: string): boolean {
    return selectedOptionId === correctOptionId;
  }

  /**
   * Validate matching exercise - check if all pairs are correct
   */
  static validateMatching(
    userMatches: Array<{ leftId: string; rightId: string }>,
    correctPairs: Array<{ leftId: string; rightId: string }>
  ): boolean {
    let correctCount = 0;

    for (const correctPair of correctPairs) {
      const userMatch = userMatches.find((m) => m.leftId === correctPair.leftId);
      if (userMatch && userMatch.rightId === correctPair.rightId) {
        correctCount++;
      }
    }

    return correctCount === correctPairs.length;
  }

  /**
   * Validate ordering exercise - check if items are in correct order
   */
  static validateOrdering(userOrder: string[], correctOrder: string[]): boolean {
    if (userOrder.length !== correctOrder.length) {
      return false;
    }

    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i] !== correctOrder[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate similarity between user and correct answer (0-1)
   * Used for typing exercises
   */
  static calculateSimilarity(userAnswer: string, correctAnswer: string): number {
    const user = userAnswer.trim().toLowerCase();
    const correct = correctAnswer.trim().toLowerCase();

    // Exact match
    if (user === correct) return 1;

    // Levenshtein distance
    const maxLength = Math.max(user.length, correct.length);
    if (maxLength === 0) return 1; // Both empty

    const distance = this.levenshteinDistance(user, correct);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * Levenshtein distance algorithm for string similarity
   */
  private static levenshteinDistance(a: string, b: string): number {
    const rows = b.length + 1;
    const cols = a.length + 1;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i < rows; i++) {
      const row = (matrix[i] = [] as number[]);
      row[0] = i;
    }

    const firstRow = (matrix[0] ?? (matrix[0] = [] as number[]));
    for (let j = 0; j < cols; j++) {
      firstRow[j] = j;
    }

    // Fill the matrix
    for (let i = 1; i < rows; i++) {
      const row = (matrix[i] ?? (matrix[i] = [] as number[]));
      for (let j = 1; j < cols; j++) {
        if (b[i - 1] === a[j - 1]) {
          row[j] = matrix[i - 1]?.[j - 1] ?? 0;
        } else {
          const val1 = matrix[i - 1]?.[j - 1] ?? 0;
          const val2 = row[j - 1] ?? 0;
          const val3 = matrix[i - 1]?.[j] ?? 0;

          row[j] = Math.min(val1, val2, val3) + 1;
        }
      }
    }

    const lastRow = matrix[b.length] ?? [];
    return lastRow[a.length] ?? 0;
  }

  /**
   * Validate typing answer with similarity threshold
   */
  static validateTypingAnswer(
    userAnswer: string,
    correctAnswer: string,
    caseSensitive: boolean = false,
    acceptedVariations?: string[],
    threshold: number = 0.85
  ): { isCorrect: boolean; similarity: number } {
    let normalizedUser = userAnswer.trim();
    let normalizedCorrect = correctAnswer.trim();

    if (!caseSensitive) {
      normalizedUser = normalizedUser.toLowerCase();
      normalizedCorrect = normalizedCorrect.toLowerCase();
    }

    // Check exact match
    if (normalizedUser === normalizedCorrect) {
      return { isCorrect: true, similarity: 1 };
    }

    // Check variations
    if (acceptedVariations) {
      for (const variation of acceptedVariations) {
        let normalizedVariation = variation.trim();
        if (!caseSensitive) {
          normalizedVariation = normalizedVariation.toLowerCase();
        }
        if (normalizedUser === normalizedVariation) {
          return { isCorrect: true, similarity: 1 };
        }
      }
    }

    // Calculate similarity
    const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
    return {
      isCorrect: similarity >= threshold,
      similarity
    };
  }

  /**
   * Calculate exercise score as percentage
   */
  static calculateScore(correctCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return Math.round((correctCount / totalCount) * 100);
  }

  /**
   * Calculate statistics from exercise results
   */
  static calculateStats(results: any[]): {
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  } {
    if (results.length === 0) {
      return { totalAttempts: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0 };
    }

    const totalAttempts = results.length;
    const correctAnswers = results.filter((r) => r.isCorrect || r.correct).length;
    const incorrectAnswers = totalAttempts - correctAnswers;
    const accuracy = (correctAnswers / totalAttempts) * 100;

    return { totalAttempts, correctAnswers, incorrectAnswers, accuracy };
  }

  /**
   * Validate exercise results
   */
  static validateResults(data: unknown) {
    return ExerciseResultsSchema.parse(data);
  }

  /**
   * Validate exercise statistics
   */
  static validateStats(data: unknown) {
    return ExerciseStatsSchema.parse(data);
  }
}
