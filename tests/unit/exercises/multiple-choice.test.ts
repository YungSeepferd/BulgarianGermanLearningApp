import { describe, it, expect } from 'vitest';
import { ExerciseService } from '$lib/services/exercise';
import type { MultipleChoiceExercise } from '$lib/schemas/exercises';

describe('ExerciseService - Multiple Choice', () => {
  const exercise: MultipleChoiceExercise = {
    id: 'mc-1',
    type: 'multiple-choice',
    sessionId: 'session-1',
    startedAt: new Date(),
    currentQuestionIndex: 0,
    userAnswers: [],
    feedback: [],
    questions: [
      {
        id: 'q1',
        question: 'What is the German word for "book"?',
        options: [
          { id: 'opt1', text: 'Brot' },
          { id: 'opt2', text: 'Buch' },
          { id: 'opt3', text: 'Baum' }
        ],
        correctOptionId: 'opt2',
        explanation: 'Buch is German for book. Brot means bread and Baum means tree.'
      },
      {
        id: 'q2',
        question: 'What is the Bulgarian word for "hello"?',
        options: [
          { id: 'opt1', text: 'Здравей' },
          { id: 'opt2', text: 'Благодаря' },
          { id: 'opt3', text: 'Довиждане' }
        ],
        correctOptionId: 'opt1',
        explanation: 'Здравей (Zdravey) means hello. Благодаря means thank you.'
      }
    ]
  };

  describe('validateMultipleChoiceAnswer', () => {
    it('should return true for correct option', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('opt2', 'opt2');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect option', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('opt1', 'opt2');
      expect(isValid).toBe(false);
    });

    it('should handle Bulgarian options correctly', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('opt1', 'opt1');
      expect(isValid).toBe(true);
    });

    it('should be case-sensitive for option IDs', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('OPT2', 'opt2');
      expect(isValid).toBe(false);
    });

    it('should handle empty option IDs', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('', 'opt2');
      expect(isValid).toBe(false);
    });

    it('should handle non-existent options', () => {
      const isValid = ExerciseService.validateMultipleChoiceAnswer('opt99', 'opt2');
      expect(isValid).toBe(false);
    });
  });

  describe('Multiple Choice Exercise Flow', () => {
    it('should track user answers correctly', () => {
      const userAnswers: string[] = [];

      // Simulate user answering questions
      const answer1 = ExerciseService.validateMultipleChoiceAnswer('opt2', 'opt2');
      userAnswers.push('opt2');
      expect(answer1).toBe(true);

      const answer2 = ExerciseService.validateMultipleChoiceAnswer('opt3', 'opt1');
      userAnswers.push('opt3');
      expect(answer2).toBe(false);

      expect(userAnswers.length).toBe(2);
    });

    it('should calculate statistics from multiple choice answers', () => {
      const feedback = [
        { isCorrect: true },
        { isCorrect: false },
        { isCorrect: true }
      ];
      const stats = ExerciseService.calculateStats(feedback);

      expect(stats.accuracy).toBe(66.66666666666666);
      expect(stats.correctAnswers).toBe(2);
      expect(stats.incorrectAnswers).toBe(1);
    });
  });
});
