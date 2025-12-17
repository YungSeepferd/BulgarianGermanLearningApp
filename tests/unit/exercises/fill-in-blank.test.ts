import { describe, it, expect } from 'vitest';
import { ExerciseService } from '$lib/services/exercise';
import type { FillInTheBlankExercise } from '$lib/schemas/exercises';

describe('ExerciseService - Fill In The Blank', () => {
  const exercise: FillInTheBlankExercise = {
    id: 'fill-1',
    type: 'fill-in-blank',
    sessionId: 'session-1',
    startedAt: new Date(),
    currentQuestionIndex: 0,
    userAnswers: [],
    feedback: [],
    questions: [
      {
        id: 'q1',
        question: 'Complete: "Guten ___"',
        correctAnswer: 'Tag',
        acceptedVariations: ['tag', 'TAG'],
        hints: ['German greeting'],
      },
      {
        id: 'q2',
        question: 'Complete: "Guten Morgen, ___ geht es dir?"',
        correctAnswer: 'wie',
        acceptedVariations: ['Wie', 'WIE'],
        hints: ['German question'],
      },
    ],
  };

  describe('validateFillInBlankAnswer', () => {
    it('should return true for exact match', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        'Tag',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(true);
    });

    it('should handle case-insensitive matches', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        'tag',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(true);
    });

    it('should handle variations', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        'TAG',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        'Nacht',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(false);
    });

    it('should trim whitespace', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        '  Tag  ',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(true);
    });

    it('should handle multiple accepted variations', () => {
      const variations = ['variant1', 'variant2', 'variant3'];
      const result1 = ExerciseService.validateFillInBlankAnswer(
        'variant1',
        'mainAnswer',
        variations
      );
      const result2 = ExerciseService.validateFillInBlankAnswer(
        'variant2',
        'mainAnswer',
        variations
      );
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should return false for empty answer', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        '',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      expect(isValid).toBe(false);
    });

    it('should handle answers with extra spaces', () => {
      const isValid = ExerciseService.validateFillInBlankAnswer(
        'T a g',
        exercise.questions[0].correctAnswer,
        exercise.questions[0].acceptedVariations
      );
      // This should be false as spaces are part of the answer
      expect(isValid).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly', () => {
      const correct = 3;
      const total = 5;
      const score = ExerciseService.calculateScore(correct, total);
      expect(score).toBe(60); // 3/5 = 0.6 = 60%
    });

    it('should handle perfect score', () => {
      const score = ExerciseService.calculateScore(5, 5);
      expect(score).toBe(100);
    });

    it('should handle zero score', () => {
      const score = ExerciseService.calculateScore(0, 5);
      expect(score).toBe(0);
    });

    it('should handle single question', () => {
      const score = ExerciseService.calculateScore(1, 1);
      expect(score).toBe(100);
    });
  });

  describe('calculateStats', () => {
    it('should calculate statistics correctly', () => {
      const feedback = [
        { isCorrect: true },
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true },
      ];
      const stats = ExerciseService.calculateStats(feedback);

      expect(stats.totalAttempts).toBe(4);
      expect(stats.correctAnswers).toBe(3);
      expect(stats.incorrectAnswers).toBe(1);
      expect(stats.accuracy).toBe(75);
    });

    it('should handle empty feedback array', () => {
      const stats = ExerciseService.calculateStats([]);
      expect(stats.totalAttempts).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.incorrectAnswers).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('should handle all correct answers', () => {
      const feedback = [{ isCorrect: true }, { isCorrect: true }, { isCorrect: true }];
      const stats = ExerciseService.calculateStats(feedback);

      expect(stats.accuracy).toBe(100);
      expect(stats.correctAnswers).toBe(3);
      expect(stats.incorrectAnswers).toBe(0);
    });

    it('should handle all incorrect answers', () => {
      const feedback = [{ isCorrect: false }, { isCorrect: false }];
      const stats = ExerciseService.calculateStats(feedback);

      expect(stats.accuracy).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.incorrectAnswers).toBe(2);
    });
  });
});
