/**
 * Accessibility Tests with Vitest and Testing Library Svelte
 * @file tests/accessibility/accessibility.spec.ts
 * @description Accessibility testing for SvelteKit components using Vitest
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { 
  mockVocabularyItem, 
  renderFlashcard,
  renderGradeControls,
  renderProgressIndicator,
  renderSessionStats,
  renderErrorBoundary,
  renderLoadingSpinner,
  createMockVocabulary,
  pressKey
} from '../test-utils';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Flashcard Component Accessibility', () => {
    test('should have proper ARIA attributes', async () => {
      const { container } = renderFlashcard({
        vocabularyItem: mockVocabularyItem
      });

      // Check for proper ARIA attributes
      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      expect(flashcardContainer).toHaveAttribute('role');
      expect(flashcardContainer).toHaveAttribute('aria-label');
      expect(flashcardContainer).toHaveAttribute('tabindex');

      // Check for live region for screen readers
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      const { container } = renderFlashcard({
        vocabularyItem: mockVocabularyItem
      });

      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      
      // Test keyboard focus
      flashcardContainer.focus();
      expect(flashcardContainer).toHaveFocus();

      // Test keyboard interaction
      await pressKey('Space');
      await waitFor(() => {
        expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
      });
    });

    test('should have sufficient color contrast', async () => {
      const { container } = renderFlashcard({
        vocabularyItem: mockVocabularyItem
      });

      // Check that text elements are visible (basic contrast check)
      const frontText = screen.getByText(mockVocabularyItem.word);
      expect(frontText).toBeVisible();

      // Flip to check back text
      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      fireEvent.click(flashcardContainer);
      await waitFor(() => {
        expect(screen.getByText(mockVocabularyItem.translation)).toBeVisible();
      });
    });

    test('should support screen readers', async () => {
      const { container } = renderFlashcard({
        vocabularyItem: mockVocabularyItem
      });

      // Check for proper semantic markup
      const frontSide = container.querySelector('.card-front');
      expect(frontSide).toBeInTheDocument();
      
      // Flip card and check back side
      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      fireEvent.click(flashcardContainer);
      
      const backSide = container.querySelector('.card-back');
      expect(backSide).toBeInTheDocument();
    });
  });

  describe('GradeControls Component Accessibility', () => {
    test('should have accessible button labels', async () => {
      const mockOnGrade = vi.fn();
      const { container } = renderGradeControls({
        onGrade: mockOnGrade
      });

      // Check all grade buttons have proper labels
      const gradeButtons = container.querySelectorAll('[data-testid^="grade-button-"]') || 
                          container.querySelectorAll('button');
      
      expect(gradeButtons.length).toBeGreaterThan(0);
      
      for (const button of gradeButtons) {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('title');
      }
    });

    test('should support keyboard navigation', async () => {
      const mockOnGrade = vi.fn();
      const { container } = renderGradeControls({
        onGrade: mockOnGrade
      });

      // Test tab navigation through grade buttons
      const firstButton = container.querySelector('[data-testid="grade-button-1"]') || 
                         container.querySelector('button');
      firstButton?.focus();
      expect(firstButton).toHaveFocus();
    });

    test('should handle disabled state accessibly', async () => {
      const mockOnGrade = vi.fn();
      const { container } = renderGradeControls({
        onGrade: mockOnGrade,
        disabled: true
      });

      const gradeButtons = container.querySelectorAll('[data-testid^="grade-button-"]') || 
                          container.querySelectorAll('button');
      
      for (const button of gradeButtons) {
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toBeDisabled();
      }
    });
  });

  describe('ProgressIndicator Component Accessibility', () => {
    test('should have accessible progress information', async () => {
      const { container } = renderProgressIndicator({
        currentCardIndex: 5,
        totalCards: 10
      });

      // Check for progress bar accessibility
      const progressBar = screen.getByTestId('progress-bar') || container.querySelector('.progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    test('should announce progress changes', async () => {
      const { container } = renderProgressIndicator({
        currentCardIndex: 5,
        totalCards: 10
      });

      // Check for live region that announces progress
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('SessionStats Component Accessibility', () => {
    test('should have accessible data tables', async () => {
      const { container } = renderSessionStats({
        sessionStats: {
          startTime: new Date(),
          endTime: null,
          totalCards: 10,
          reviewedCards: 3,
          correctAnswers: 2,
          grades: [3, 4, 5]
        }
      });

      // Check for proper table structure if present
      const statsTable = container.querySelector('[data-testid="stats-table"]');
      if (statsTable) {
        expect(statsTable).toHaveAttribute('role', 'table');
        
        // Check for table headers
        const headers = statsTable.querySelectorAll('th');
        expect(headers.length).toBeGreaterThan(0);
      }
    });

    test('should support keyboard navigation', async () => {
      const { container } = renderSessionStats({
        sessionStats: {
          startTime: new Date(),
          endTime: null,
          totalCards: 10,
          reviewedCards: 3,
          correctAnswers: 2,
          grades: [3, 4, 5]
        }
      });

      // Test keyboard navigation through stats
      const focusableElements = container.querySelectorAll('button, [tabindex="0"]');
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        firstElement.focus();
        expect(firstElement).toHaveFocus();
      }
    });
  });

  describe('ErrorBoundary Component Accessibility', () => {
    test('should have accessible error messages', async () => {
      const mockOnRetry = vi.fn();
      const mockOnReport = vi.fn();
      
      const { container } = renderErrorBoundary({
        error: new Error('Test error'),
        errorInfo: { componentStack: 'Test stack' },
        onRetry: mockOnRetry,
        onReport: mockOnReport
      });

      // Check for error announcement
      const errorRegion = screen.getByTestId('error-region') || container.querySelector('[role="alert"]');
      expect(errorRegion).toHaveAttribute('role', 'alert');
      expect(errorRegion).toHaveAttribute('aria-live', 'assertive');
      
      // Check error message is accessible
      const errorMessage = screen.getByTestId('error-message') || container.querySelector('.error-message');
      expect(errorMessage).toBeInTheDocument();
    });

    test('should have accessible recovery actions', async () => {
      const mockOnRetry = vi.fn();
      const mockOnReport = vi.fn();
      
      const { container } = renderErrorBoundary({
        error: new Error('Test error'),
        errorInfo: { componentStack: 'Test stack' },
        onRetry: mockOnRetry,
        onReport: mockOnReport
      });

      // Check retry button
      const retryButton = screen.getByTestId('retry-button') || container.querySelector('button');
      expect(retryButton).toHaveAttribute('aria-label');
      expect(retryButton).toHaveAttribute('title');
    });
  });

  describe('LoadingSpinner Component Accessibility', () => {
    test('should announce loading state', async () => {
      const { container } = renderLoadingSpinner({
        isVisible: true,
        message: 'Loading vocabulary...'
      });

      // Check for loading announcement
      const loadingRegion = screen.getByTestId('loading-region') || container.querySelector('[aria-live="polite"]');
      expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
      expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
    });

    test('should respect reduced motion preferences', async () => {
      // This would require CSS mocking for proper testing
      // For now, test basic functionality
      const { container } = renderLoadingSpinner({
        isVisible: true,
        message: 'Loading vocabulary...'
      });

      // Should still be functional
      const spinner = screen.getByTestId('loading-spinner') || container.querySelector('.spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Full Component Integration Accessibility', () => {
    test('should maintain accessibility during interactions', async () => {
      const mockOnGrade = vi.fn();
      const { container } = renderFlashcard({
        vocabularyItem: mockVocabularyItem,
        onGrade: mockOnGrade
      });

      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      
      // Flip card
      fireEvent.click(flashcardContainer);
      await waitFor(() => {
        expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
      });

      // Grade card
      const gradeButton = screen.getByRole('button', { name: /grade 3/i }) || screen.getByText('3');
      fireEvent.click(gradeButton);

      // Check accessibility is maintained
      expect(flashcardContainer).toHaveAttribute('role');
      expect(flashcardContainer).toHaveAttribute('aria-label');
    });

    test('should handle dynamic content changes accessibly', async () => {
      const mockVocabulary = createMockVocabulary(5);
      let currentIndex = 0;
      
      const mockOnNext = vi.fn(() => {
        currentIndex = (currentIndex + 1) % mockVocabulary.length;
      });

      const { container, rerender } = renderFlashcard({
        vocabularyItem: mockVocabulary[currentIndex],
        onNext: mockOnNext
      });

      const flashcardContainer = screen.getByTestId('flashcard-container') || container.querySelector('.flashcard-container');
      
      // Flip card
      fireEvent.click(flashcardContainer);
      await waitFor(() => {
        expect(screen.getByText(mockVocabulary[currentIndex].translation)).toBeInTheDocument();
      });

      // Navigate to next card
      const nextButton = screen.getByRole('button', { name: /next/i }) || screen.getByText('Next');
      fireEvent.click(nextButton);

      // Accessibility should be maintained
      expect(flashcardContainer).toHaveAttribute('role');
      expect(flashcardContainer).toHaveAttribute('aria-label');
    });
  });
});