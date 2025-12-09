/**
 * Unit tests for lesson generation type definitions
 *
 * This file tests the type validation functions and ensures the type definitions
 * work as expected.
 */

import { describe, it, expect } from 'vitest';
import {
  isLessonDifficulty,
  isLessonType,
  isPartOfSpeech,
  isVocabularyCategory,
  LessonGenerationError,
  TemplateRenderingError,
  DataValidationError
} from '$lib/services/lesson-generation/types';

describe('Type Validation Functions', () => {
  describe('isLessonDifficulty', () => {
    it('should return true for valid lesson difficulties', () => {
      expect(isLessonDifficulty('A1')).toBe(true);
      expect(isLessonDifficulty('A2')).toBe(true);
      expect(isLessonDifficulty('B1')).toBe(true);
      expect(isLessonDifficulty('B2')).toBe(true);
      expect(isLessonDifficulty('C1')).toBe(true);
    });

    it('should return false for invalid lesson difficulties', () => {
      expect(isLessonDifficulty('A0')).toBe(false);
      expect(isLessonDifficulty('B3')).toBe(false);
      expect(isLessonDifficulty('C2')).toBe(false);
      expect(isLessonDifficulty('beginner')).toBe(false);
      expect(isLessonDifficulty('')).toBe(false);
    });
  });

  describe('isLessonType', () => {
    it('should return true for valid lesson types', () => {
      expect(isLessonType('vocabulary')).toBe(true);
      expect(isLessonType('grammar')).toBe(true);
      expect(isLessonType('mixed')).toBe(true);
      expect(isLessonType('cultural')).toBe(true);
      expect(isLessonType('contextual')).toBe(true);
    });

    it('should return false for invalid lesson types', () => {
      expect(isLessonType('thematic')).toBe(false);
      expect(isLessonType('adaptive')).toBe(false);
      expect(isLessonType('')).toBe(false);
      expect(isLessonType('vocab')).toBe(false);
    });
  });

  describe('isPartOfSpeech', () => {
    it('should return true for valid parts of speech', () => {
      expect(isPartOfSpeech('noun')).toBe(true);
      expect(isPartOfSpeech('verb')).toBe(true);
      expect(isPartOfSpeech('adjective')).toBe(true);
      expect(isPartOfSpeech('adverb')).toBe(true);
      expect(isPartOfSpeech('preposition')).toBe(true);
      expect(isPartOfSpeech('conjunction')).toBe(true);
      expect(isPartOfSpeech('pronoun')).toBe(true);
      expect(isPartOfSpeech('interjection')).toBe(true);
      expect(isPartOfSpeech('article')).toBe(true);
      expect(isPartOfSpeech('numeral')).toBe(true);
    });

    it('should return false for invalid parts of speech', () => {
      expect(isPartOfSpeech('adverbium')).toBe(false);
      expect(isPartOfSpeech('')).toBe(false);
      expect(isPartOfSpeech('nouns')).toBe(false);
    });
  });

  describe('isVocabularyCategory', () => {
    it('should return true for valid vocabulary categories', () => {
      expect(isVocabularyCategory('home')).toBe(true);
      expect(isVocabularyCategory('family')).toBe(true);
      expect(isVocabularyCategory('food')).toBe(true);
      expect(isVocabularyCategory('travel')).toBe(true);
      expect(isVocabularyCategory('uncategorized')).toBe(true);
    });

    it('should return false for invalid vocabulary categories', () => {
      expect(isVocabularyCategory('')).toBe(false);
      expect(isVocabularyCategory('household')).toBe(false);
      expect(isVocabularyCategory('uncategorised')).toBe(false);
    });
  });
});

describe('Custom Error Classes', () => {
  it('should create LessonGenerationError with correct name and message', () => {
    const error = new LessonGenerationError('Test error');
    expect(error.name).toBe('LessonGenerationError');
    expect(error.message).toBe('Test error');
    expect(error instanceof Error).toBe(true);
  });

  it('should create TemplateRenderingError with correct name and message', () => {
    const error = new TemplateRenderingError('Template error');
    expect(error.name).toBe('TemplateRenderingError');
    expect(error.message).toBe('Template error');
    expect(error instanceof Error).toBe(true);
  });

  it('should create DataValidationError with correct name and message', () => {
    const error = new DataValidationError('Validation error');
    expect(error.name).toBe('DataValidationError');
    expect(error.message).toBe('Validation error');
    expect(error instanceof Error).toBe(true);
  });
});

describe('Type Import Compatibility', () => {
  it('should be compatible with existing vocabulary types', () => {
    // Test that our types work with existing vocabulary types
    const testVocabItem: import('$lib/types/vocabulary').VocabularyItem = {
      id: 'test',
      german: 'Haus',
      bulgarian: 'къща',
      partOfSpeech: 'noun',
      difficulty: 1.0,
      categories: ['home']
    };

    expect(testVocabItem.partOfSpeech).toBe('noun');
    expect(testVocabItem.categories[0]).toBe('home');
  });

  it('should be compatible with existing lesson types', () => {
    // Test that our types work with existing lesson types
    const testLesson: import('$lib/schemas/lesson').Lesson = {
      id: 'test',
      type: 'mixed',
      difficulty: 'A1',
      title: 'Test Lesson',
      sections: [],
      vocabulary: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(testLesson.type).toBe('mixed');
    expect(testLesson.difficulty).toBe('A1');
  });
});