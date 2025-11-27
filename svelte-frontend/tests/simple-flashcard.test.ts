/**
 * Simple Flashcard Test - Direct component testing without SvelteKit infrastructure
 * This test bypasses the server-side rendering issue by testing the component directly
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Flashcard from '../src/lib/components/Flashcard.svelte';

// Mock vocabulary item for testing
const mockVocabularyItem = {
  id: 'test-1',
  word: 'здравей',
  translation: 'hallo',
  category: 'greetings',
  level: 'A1',
  examples: [
    { sentence: 'Здравей, как си?', translation: 'Hallo, wie geht es dir?' }
  ],
  pronunciation: 'zdravay',
  audioUrl: '/audio/zdravay.mp3',
  tags: ['basic', 'greeting'],
  difficulty: 1,
  created: Date.now(),
  updated: Date.now()
};

describe('Simple Flashcard Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Flashcard component directly', async () => {
    console.log('Starting direct Flashcard test...');
    
    // Render the component directly without SvelteKit infrastructure
    const { container } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabularyItem,
        direction: 'bg-de',
        showProgress: true
      }
    });

    console.log('Container after render:', container.innerHTML);
    
    // Wait for component to mount
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    // Check basic rendering
    expect(container.querySelector('.flashcard-container')).toBeInTheDocument();
    
    // Check that vocabulary content is displayed
    expect(screen.getByText('здравей')).toBeInTheDocument();
    expect(screen.getByText('hallo')).toBeInTheDocument();
  });

  test('flips card when clicked', async () => {
    const { container } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabularyItem,
        direction: 'bg-de'
      }
    });

    // Initially should show front
    expect(screen.getByText('здравей')).toBeVisible();
    
    // Click to flip
    const card = container.querySelector('.flashcard');
    if (card) {
      await fireEvent.click(card);
    }
    
    // Should show back after flip
    await waitFor(() => {
      expect(screen.getByText('hallo')).toBeVisible();
    });
  });

  test('handles grade selection', async () => {
    const mockOnGrade = vi.fn();
    
    const { container } = render(Flashcard, {
      props: {
        vocabularyItem: mockVocabularyItem,
        direction: 'bg-de',
        onGrade: mockOnGrade
      }
    });

    // Flip card to show grading controls
    const card = container.querySelector('.flashcard');
    if (card) {
      await fireEvent.click(card);
    }
    
    // Wait for grading controls to appear
    await waitFor(() => {
      expect(screen.getByText('How well did you know this?')).toBeInTheDocument();
    });
    
    // Click grade button 3
    const gradeButton = screen.getByText('3');
    await fireEvent.click(gradeButton);
    
    // Check callback was called
    await waitFor(() => {
      expect(mockOnGrade).toHaveBeenCalledWith(3, expect.any(Object));
    });
  });
});