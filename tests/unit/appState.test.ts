// Unit tests for AppState
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppState } from '$lib/state/app.svelte.ts';
import type { VocabularyItem } from '$lib/types/vocabulary';

// Mock browser environment
vi.stubGlobal('browser', true);

describe('AppState', () => {
  let appState: AppState;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    appState = new AppState();
    appState.init();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(appState.currentDirection).toBe('DE->BG');
      expect(appState.displayDirection).toBe('German → Bulgarian');
      expect(appState.searchQuery).toBe('');
      expect(appState.currentItem).toBeNull();
      expect(appState.practiceMode).toBe(false);
      expect(appState.showAnswer).toBe(false);
      expect(appState.isLoading).toBe(false);
      expect(appState.error).toBeNull();
    });
  });

  describe('Direction Toggles', () => {
    it('should toggle direction between DE->BG and BG->DE', () => {
      expect(appState.currentDirection).toBe('DE->BG');
      expect(appState.displayDirection).toBe('German → Bulgarian');

      appState.toggleDirection();
      expect(appState.currentDirection).toBe('BG->DE');
      expect(appState.displayDirection).toBe('Bulgarian → German');

      appState.toggleDirection();
      expect(appState.currentDirection).toBe('DE->BG');
      expect(appState.displayDirection).toBe('German → Bulgarian');
    });

    it('should persist direction in localStorage', () => {
      appState.toggleDirection();
      expect(localStorage.getItem('tandem-direction')).toBe('BG->DE');

      // Simulate re-initialization
      const newState = new AppState();
      newState.init();
      expect(newState.currentDirection).toBe('BG->DE');
    });
  });

  describe('Search Query', () => {
    it('should update search query', () => {
      appState.setSearchQuery('test');
      expect(appState.searchQuery).toBe('test');
    });
  });

  describe('Current Item', () => {
    const mockItem: VocabularyItem = {
      id: 'test_001',
      german: 'Test',
      bulgarian: 'Тест',
      category: 'Test',
      tags: ['test']
    };

    it('should set and reset current item', () => {
      appState.setCurrentItem(mockItem);
      expect(appState.currentItem).toEqual(mockItem);
      expect(appState.showAnswer).toBe(false);

      appState.setCurrentItem(null);
      expect(appState.currentItem).toBeNull();
    });

    it('should validate vocabulary item', () => {
      // Test missing required fields
      const invalidItem = { id: 'test_002' } as unknown as VocabularyItem;
      appState.setCurrentItem(invalidItem);

      expect(appState.currentItem).toBeNull();
      expect(appState.error).toContain('missing');
    });
  });

  describe('Practice Mode', () => {
    it('should toggle practice mode', () => {
      expect(appState.practiceMode).toBe(false);

      appState.togglePracticeMode();
      expect(appState.practiceMode).toBe(true);

      appState.togglePracticeMode();
      expect(appState.practiceMode).toBe(false);
    });

    it('should reset current item when leaving practice mode', () => {
      const mockItem: VocabularyItem = {
        id: 'test_003',
        german: 'Test',
        bulgarian: 'Тест',
        category: 'Test',
        tags: ['test']
      };

      appState.setCurrentItem(mockItem);
      appState.togglePracticeMode();
      appState.togglePracticeMode();

      expect(appState.currentItem).toBeNull();
      expect(appState.showAnswer).toBe(false);
    });
  });

  describe('Show Answer', () => {
    it('should toggle show answer', () => {
      expect(appState.showAnswer).toBe(false);

      appState.toggleShowAnswer();
      expect(appState.showAnswer).toBe(true);

      appState.toggleShowAnswer();
      expect(appState.showAnswer).toBe(false);
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading state', () => {
      expect(appState.isLoading).toBe(false);

      appState.setLoading(true);
      expect(appState.isLoading).toBe(true);

      appState.setLoading(false);
      expect(appState.isLoading).toBe(false);
    });

    it('should handle error state', () => {
      expect(appState.error).toBeNull();

      appState.setError('Test error');
      expect(appState.error).toBe('Test error');

      appState.setError(null);
      expect(appState.error).toBeNull();
    });
  });
});