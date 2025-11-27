/**
 * Flashcard Component Tests
 * @file tests/components/Flashcard.test.ts
 * @description Comprehensive tests for the Flashcard.svelte component using Vitest
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/svelte';
import { renderFlashcard, mockVocabularyItem } from '../test-utils';
import type { VocabularyItem, ReviewState } from '$lib/types';

// Mock data
const mockReviewState: ReviewState = {
  itemId: 'test-1',
  direction: 'bg-de',
  schemaVersion: 3,
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  phase: 1,
  nextReview: Date.now() + 86_400_000,
  lastReview: null,
  totalReviews: 0,
  correctAnswers: 0,
  correctStreak: 0,
  created: Date.now(),
  updated: Date.now()
};

describe('Flashcard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with default props', async () => {
    const result = await renderFlashcard();
    
    // Debug: log what's actually rendered
    console.log('Container HTML:', result.container?.innerHTML);
    
    // Check that vocabulary content is displayed
    expect(screen.getByText('здравей')).toBeInTheDocument();
    expect(screen.getByText('hallo')).toBeInTheDocument();
    
    // Check that card is initially showing front
    expect(screen.getByText('здравей')).toBeVisible();
    expect(screen.getByText('hallo')).not.toBeVisible();
  });

  test('displays correct language direction', async () => {
    // Test BG to DE direction
    await renderFlashcard({
      direction: 'bg-de'
    });
    
    expect(screen.getByText('здравей')).toBeInTheDocument();
    expect(screen.getByText('hallo')).toBeInTheDocument();

    // Test DE to BG direction
    await renderFlashcard({
      direction: 'de-bg'
    });
    
    expect(screen.getByText('hallo')).toBeInTheDocument();
    expect(screen.getByText('здравей')).toBeInTheDocument();
  });

  test('flips card when clicked', async () => {
    await renderFlashcard();
    
    // Initially should show front
    expect(screen.getByText('здравей')).toBeVisible();
    expect(screen.getByText('hallo')).not.toBeVisible();
    
    // Click to flip
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Should show back after flip
    await waitFor(() => {
      expect(screen.getByText('hallo')).toBeVisible();
      expect(screen.getByText('здравей')).not.toBeVisible();
    });
  });

  test('calls onGrade callback when grade is selected', async () => {
    const mockOnGrade = vi.fn();
    
    await renderFlashcard({
      onGrade: mockOnGrade
    });
    
    // Flip card to show grading controls
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Wait for grading controls to appear
    await waitFor(() => {
      expect(screen.getByText('How well did you know this?')).toBeInTheDocument();
    });
    
    // Click grade button 3
    const gradeButton = screen.getByLabelText('Grade 3 - Correct with moderate effort');
    await fireEvent.click(gradeButton);
    
    // Check callback was called
    await waitFor(() => {
      expect(mockOnGrade).toHaveBeenCalledWith(3, expect.any(Object));
    });
  });

  test('calls onNext callback when next button is clicked', async () => {
    const mockOnNext = vi.fn();
    
    await renderFlashcard({
      onNext: mockOnNext
    });
    
    // Flip card to show navigation
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Click next button
    const nextButton = screen.getByLabelText('Next card');
    await fireEvent.click(nextButton);
    
    // Check callback was called
    expect(mockOnNext).toHaveBeenCalled();
  });

  test('shows progress indicator when showProgress is true', async () => {
    await renderFlashcard({
      showProgress: true
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('hides progress indicator when showProgress is false', async () => {
    await renderFlashcard({
      showProgress: false
    });
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('displays examples when available', async () => {
    await renderFlashcard();
    
    // Flip to see examples
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Check examples are displayed
    await waitFor(() => {
      expect(screen.getByText('Здравей, как си?')).toBeInTheDocument();
      expect(screen.getByText('Hallo, wie geht es dir?')).toBeInTheDocument();
    });
  });

  test('handles vocabulary items without examples', async () => {
    const itemWithoutExamples = {
      ...mockVocabularyItem,
      examples: []
    };
    
    await renderFlashcard({
      vocabularyItem: itemWithoutExamples
    });
    
    // Flip card
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Examples section should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Examples')).not.toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    await renderFlashcard();
    
    // Check accessibility features
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  test('handles error states gracefully', async () => {
    // Test with invalid vocabulary item
    const invalidItem = {
      ...mockVocabularyItem,
      word: '',
      translation: ''
    };
    
    await renderFlashcard({
      vocabularyItem: invalidItem
    });
    
    // Should show error state
    expect(screen.getByText(/invalid|error/i)).toBeInTheDocument();
  });

  test('maintains state during rapid interactions', async () => {
    await renderFlashcard();
    
    const card = screen.getByRole('button');
    
    // Rapidly flip card multiple times
    for (let i = 0; i < 5; i++) {
      await fireEvent.click(card);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Should still be functional
    expect(card).toBeInTheDocument();
  });

  test('supports screen reader announcements', async () => {
    await renderFlashcard();
    
    // Check for screen reader elements
    expect(screen.getByText('здравей')).toBeInTheDocument();
    
    // Flip card
    const card = screen.getByRole('button');
    await fireEvent.click(card);
    
    // Should have updated content for screen readers
    await waitFor(() => {
      expect(screen.getByText('hallo')).toBeVisible();
    });
  });
});