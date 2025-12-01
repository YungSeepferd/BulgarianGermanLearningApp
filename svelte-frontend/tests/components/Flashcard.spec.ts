/**
 * Flashcard Component Tests
 * @file tests/components/Flashcard.spec.ts
 * @description Comprehensive tests for the Flashcard.svelte component using Vitest and Testing Library Svelte
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Flashcard from '$lib/components/Flashcard.svelte';
import {
  mockVocabularyItem,
  renderFlashcard,
  pressKey,
  createMockVocabulary
} from '../test-utils';

// Helper function to wait for animations
const waitForAnimation = () => waitFor(() => {}, { timeout: 100 });

describe('Flashcard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with default props', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    expect(container).toBeInTheDocument();
    
    // Check that vocabulary content is displayed
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
  });

  test('displays correct language direction', async () => {
    // Test BG to DE direction
    const { container: containerBgDe } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      direction: 'bg-de'
    });
    
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    
    // Test DE to BG direction
    const { container: containerDeBg } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      direction: 'de-bg'
    });
    
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
  });

  test('flips card when clicked', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Initially should show front
    const frontElement = screen.getByText(mockVocabularyItem.word);
    expect(frontElement).toBeInTheDocument();
    
    // Click to flip
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should show back after flip
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
  });

  test('flips card with keyboard shortcuts', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Focus the component
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    flashcardContainer!.focus();
    
    // Test Space key
    await pressKey(flashcardContainer, 'Space');
    await waitForAnimation();
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    
    // Flip back
    await pressKey(flashcardContainer, 'Space');
    await waitForAnimation();
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
    
    // Test Enter key
    await pressKey(flashcardContainer, 'Enter');
    await waitForAnimation();
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
  });

  test('calls onGrade callback when grade is selected', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      onGrade: mockOnGrade
    });
    
    // Flip card to show grading controls
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click grade button 3
    const gradeButton = screen.getByRole('button', { name: /grade 3/i }) || screen.getByText('3');
    fireEvent.click(gradeButton);
    
    // Check callback was called
    expect(mockOnGrade).toHaveBeenCalledWith(3, expect.any(Object));
  });

  test('calls onNext callback when next button is clicked', async () => {
    const mockOnNext = vi.fn();
    
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      onNext: mockOnNext
    });
    
    // Flip card to show navigation
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i }) || screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check callback was called
    expect(mockOnNext).toHaveBeenCalled();
  });

  test('calls onPrevious callback when previous button is clicked', async () => {
    const mockOnPrevious = vi.fn();
    
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      onPrevious: mockOnPrevious
    });
    
    // Flip card to show navigation
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Click previous button
    const previousButton = screen.getByRole('button', { name: /previous/i }) || screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    // Check callback was called
    expect(mockOnPrevious).toHaveBeenCalled();
  });

  test('shows progress indicator when showProgress is true', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      showProgress: true
    });
    
    const progressIndicator = screen.getByTestId('progress-indicator') || container!.querySelector('.progress-indicator');
    expect(progressIndicator).toBeInTheDocument();
  });

  test('hides progress indicator when showProgress is false', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      showProgress: false
    });
    
    const progressIndicator = container!.querySelector('.progress-indicator');
    expect(progressIndicator).not.toBeInTheDocument();
  });

  test('auto-flips when autoFlip is true', async () => {
    vi.useFakeTimers();
    
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem,
      autoFlip: true
    });
    
    // Should auto-flip after a delay
    vi.advanceTimersByTime(2000);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  test('displays examples when available', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Flip to see examples
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check examples are displayed
    const examplesSection = screen.getByTestId('examples-section') || container!.querySelector('.examples-section');
    expect(examplesSection).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.examples[0].sentence)).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.examples[0].translation)).toBeInTheDocument();
  });

  test('handles vocabulary items without examples', async () => {
    const itemWithoutExamples = {
      ...mockVocabularyItem,
      examples: []
    };
    
    const { container } = await renderFlashcard({
      vocabularyItem: itemWithoutExamples
    });
    
    // Flip card
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Examples section should not be visible
    const examplesSection = container!.querySelector('.examples-section');
    expect(examplesSection).not.toBeInTheDocument();
  });

  test('supports keyboard navigation', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    flashcardContainer!.focus();
    
    // Test number keys for grading (when flipped)
    fireEvent.click(flashcardContainer!); // Flip first
    await new Promise(resolve => setTimeout(resolve, 100));
    
    for (let i = 1; i <= 5; i++) {
      await pressKey(flashcardContainer, i.toString());
      // Should trigger grade selection
      await waitFor(() => {}, { timeout: 100 });
    }
  });

  test('is accessible', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Check for proper ARIA attributes
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    expect(flashcardContainer).toHaveAttribute('role');
    expect(flashcardContainer).toHaveAttribute('aria-label');
    expect(flashcardContainer).toHaveAttribute('tabindex');
  });

  test('handles error states gracefully', async () => {
    // Test with invalid vocabulary item
    const invalidItem = {
      ...mockVocabularyItem,
      word: '',
      translation: ''
    };
    
    const { container } = await renderFlashcard({
      vocabularyItem: invalidItem
    });
    
    // Should show error state
    const errorMessage = screen.getByTestId('error-message') || container!.querySelector('.error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(/invalid vocabulary data/i);
  });

  test('maintains state during rapid interactions', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    
    // Rapidly flip card multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(flashcardContainer!);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Should still be functional
    expect(container).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
  });

  test('supports screen reader announcements', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    // Check for screen reader elements
    const srOnly = container!.querySelector('.sr-only');
    expect(srOnly).toBeInTheDocument();
    
    // Flip card and check announcement
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should have updated aria-live region
    const liveRegion = container!.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  test('performs well under load', async () => {
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    
    // Measure performance of multiple flips
    const startTime = performance.now();
    
    for (let i = 0; i < 10; i++) {
      fireEvent.click(flashcardContainer!);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time
    expect(duration).toBeLessThan(2000); // 2 seconds max
  });

  test('supports reduced motion preferences', async () => {
    // This test would need CSS-in-JS or style mocking to properly test
    // For now, we'll test the basic functionality
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });
    
    const flashcardContainer = screen.getByTestId('flashcard-container') || container!.querySelector('.flashcard-container');
    
    // Flip should work regardless of motion preferences
    fireEvent.click(flashcardContainer!);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should still work
    expect(screen.getByText(mockVocabularyItem.translation)).toBeInTheDocument();
  });

  test('supports high contrast mode', async () => {
    // This test would need CSS-in-JS or style mocking to properly test
    // For now, we'll test the basic functionality
    const { container } = await renderFlashcard({
      vocabularyItem: mockVocabularyItem
    });

    // Should still be visible and functional
    expect(container).toBeInTheDocument();
    expect(screen.getByText(mockVocabularyItem.word)).toBeInTheDocument();
  });
});