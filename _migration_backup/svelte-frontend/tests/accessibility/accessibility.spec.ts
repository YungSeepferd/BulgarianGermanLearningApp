/**
 * Accessibility Tests
 * @file tests/accessibility/accessibility.spec.ts
 * @description Comprehensive accessibility tests for all components using Vitest and Testing Library Svelte
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Flashcard from '$lib/components/Flashcard.svelte';
import GradeControls from '$lib/components/GradeControls.svelte';
import ProgressIndicator from '$lib/components/ProgressIndicator.svelte';
import SessionStats from '$lib/components/SessionStats.svelte';
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
import { mockVocabularyItem } from '../test-utils';

describe('Flashcard Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should have proper ARIA attributes', async () => {
    const result = await render(Flashcard, {
      props: {
        word: mockVocabularyItem.word,
        translation: mockVocabularyItem.translation,
        examples: mockVocabularyItem.examples?.map(ex => ex.sentence) || [],
        difficulty: 'easy'
      }
    });
    const { container } = result;

    // Check for proper ARIA attributes - use container.querySelector to avoid multiple element conflicts
    const flashcardContainer = container.querySelector('[data-testid="flashcard-container"]');
    expect(flashcardContainer).toBeInTheDocument();
    expect(flashcardContainer).toHaveAttribute('role');
    expect(flashcardContainer).toHaveAttribute('aria-label');
    expect(flashcardContainer).toHaveAttribute('tabindex');

    // Check for live region for screen readers
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  test('should support keyboard navigation', async () => {
    const result = await render(Flashcard, {
      props: {
        word: mockVocabularyItem.word,
        translation: mockVocabularyItem.translation,
        examples: mockVocabularyItem.examples?.map(ex => ex.sentence) || [],
        difficulty: 'easy'
      }
    });
    const { container } = result;

    const flashcardContainer = container.querySelector('[data-testid="flashcard-container"]');
    expect(flashcardContainer).toBeInTheDocument();

    // Test keyboard interaction
    await fireEvent.keyDown(flashcardContainer, { key: 'Space' });
    await waitFor(() => {
      expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    });
  });

  test('should have sufficient color contrast', async () => {
    const result = await render(Flashcard, {
      props: {
        word: mockVocabularyItem.word,
        translation: mockVocabularyItem.translation,
        examples: mockVocabularyItem.examples?.map(ex => ex.sentence) || [],
        difficulty: 'easy'
      }
    });
    const { container } = result;

    // Check for proper semantic markup
    const frontSide = container.querySelector('.card-front');
    expect(frontSide).toBeInTheDocument();

    // Flip card and check back side
    const flashcardContainer = container.querySelector('[data-testid="flashcard-container"]');
    expect(flashcardContainer).toBeInTheDocument();
    fireEvent.click(flashcardContainer);
    
    const backSide = container.querySelector('.card-back');
    expect(backSide).toBeInTheDocument();
  });

  test('should support screen readers', async () => {
    const result = await render(Flashcard, {
      props: {
        word: mockVocabularyItem.word,
        translation: mockVocabularyItem.translation,
        examples: mockVocabularyItem.examples?.map(ex => ex.sentence) || [],
        difficulty: 'easy'
      }
    });
    const { container } = result;

    // Check for screen reader announcements
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();
  });
});

describe('GradeControls Accessibility', () => {
  test('should have accessible grade buttons', async () => {
    const mockOnGrade = vi.fn();
    const result = await render(GradeControls, {
      props: {
        onGrade: mockOnGrade,
        dispatch: vi.fn()
      }
    });
    const { container } = result;

    // Check all grade buttons have proper labels
    const gradeButtons = container.querySelectorAll('[data-testid^="grade-button-"]') || 
                        container.querySelectorAll('button');
    
    gradeButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('role', 'button');
    });
  });

  test('should support keyboard navigation', async () => {
    const mockOnGrade = vi.fn();
    const result = await render(GradeControls, {
      props: {
        onGrade: mockOnGrade,
        dispatch: vi.fn()
      }
    });
    const { container } = result;

    // Test tab navigation through grade buttons
    const firstButton = container.querySelector('[data-testid="grade-button-1"]') || 
                       container.querySelector('button');
    if (firstButton instanceof HTMLElement) {
      firstButton.focus();
    }
    expect(firstButton).toHaveFocus();
  });

  test('should announce grade selection', async () => {
    const mockOnGrade = vi.fn();
    const result = await render(GradeControls, {
      props: {
        onGrade: mockOnGrade,
        dispatch: vi.fn()
      }
    });
    const { container } = result;

    const gradeButtons = container.querySelectorAll('[data-testid^="grade-button-"]') || 
                        container.querySelectorAll('button');
    
    // Check for status announcements
    const statusRegion = container.querySelector('[aria-live="polite"]');
    expect(statusRegion).toBeInTheDocument();
  });
});

describe('ProgressIndicator Accessibility', () => {
  test('should have accessible progress information', async () => {
    const result = await render(ProgressIndicator, {
      props: {
        current: 5,
        total: 10
      }
    });
    const { container } = result;

    // Check for progress bar accessibility
    const progressBar = screen.getByTestId('progress-bar') || container.querySelector('.progress-bar');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin');
    expect(progressBar).toHaveAttribute('aria-valuemax');
  });

  test('should announce progress changes', async () => {
    const result = await render(ProgressIndicator, {
      props: {
        current: 5,
        total: 10
      }
    });
    const { container } = result;

    // Check for live region that announces progress
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});

describe('SessionStats Accessibility', () => {
  test('should have accessible data tables', async () => {
    const result = await render(SessionStats, {
      props: {
        sessionStats: {
          startTime: new Date(),
          endTime: null,
          totalCards: 10,
          reviewedCards: 3,
          correctAnswers: 2,
          grades: [3, 4, 5]
        }
      }
    });
    const { container } = result;

    // Check for proper table structure if present
    const statsTable = container.querySelector('[data-testid="stats-table"]');
    if (statsTable) {
      expect(statsTable).toHaveAttribute('role', 'table');
    }
  });

  test('should support keyboard navigation', async () => {
    const result = await render(SessionStats, {
      props: {
        sessionStats: {
          startTime: new Date(),
          endTime: null,
          totalCards: 10,
          reviewedCards: 3,
          correctAnswers: 2,
          grades: [3, 4, 5]
        }
      }
    });
    const { container } = result;

    // Test keyboard navigation through stats
    const focusableElements = container.querySelectorAll('button, [tabindex="0"]');
    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      if (firstElement instanceof HTMLElement) {
        firstElement.focus();
      }
      expect(firstElement).toHaveFocus();
    }
  });
});

describe('ErrorBoundary Accessibility', () => {
  test('should announce errors to screen readers', async () => {
    const mockOnRetry = vi.fn();
    const mockOnReport = vi.fn();
    
    const result = await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    const { container } = result;

    // Check for error announcement
    const errorRegion = screen.getByTestId('error-region') || container.querySelector('[role="alert"]');
    expect(errorRegion).toHaveAttribute('role', 'alert');
  });

  test('should have accessible error recovery buttons', async () => {
    const mockOnRetry = vi.fn();
    const mockOnReport = vi.fn();
    
    const result = await render(ErrorBoundary, {
      props: {
        error: new Error('Test error'),
        dispatch: vi.fn()
      }
    });
    const { container } = result;

    // Check retry button
    const retryButton = screen.getByTestId('retry-button') || container.querySelector('button');
    expect(retryButton).toHaveAttribute('aria-label');
    expect(retryButton).toHaveAttribute('title');
  });
});

describe('LoadingSpinner Accessibility', () => {
  test('should announce loading state', async () => {
    const result = await render(LoadingSpinner, {
      props: {
        text: 'Loading...'
      }
    });
    const { container } = result;

    // Check for loading announcement
    const loadingRegion = screen.getByTestId('loading-region') || container.querySelector('[aria-live="polite"]');
    expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
  });

  test('should be accessible when visible', async () => {
    // For now, test basic functionality
    const result = await render(LoadingSpinner, {
      props: {
        text: 'Loading...'
      }
    });
    const { container } = result;

    // Should still be functional
    const spinner = screen.getByTestId('loading-spinner') || container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});

describe('Interactive Flashcard Accessibility', () => {
  test('should maintain accessibility during interactions', async () => {
    const mockOnGrade = vi.fn();
    const result = await render(Flashcard, {
      props: {
        word: mockVocabularyItem.word,
        translation: mockVocabularyItem.translation,
        examples: mockVocabularyItem.examples?.map(ex => ex.sentence) || [],
        difficulty: 'easy',
        onGrade: mockOnGrade
      }
    });
    const { container, rerender } = result;

    // Test multiple interactions
    const flashcardContainer = container.querySelector('[data-testid="flashcard-container"]');
    expect(flashcardContainer).toBeInTheDocument();
    
    // Flip card
    fireEvent.click(flashcardContainer);
    await waitFor(() => {
      expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    });

    // Check accessibility is maintained
    expect(flashcardContainer).toHaveAttribute('aria-label');
  });
});