import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { renderComponent, cleanup } from '../svelte5-test-utils';

describe('Flashcard Component - Svelte 5', () => {
  let flashcardInstance: any;
  
  const mockProps = {
    word: 'здравей',
    translation: 'hello',
    examples: ['Здравей, как си?', 'Hello, how are you?']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean the DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(async () => {
    // Clean up after each test
    if (flashcardInstance) {
      await flashcardInstance.unmount();
      flashcardInstance = null;
    }
    // Global cleanup
    cleanup();
  });

  it('renders with default props', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    flashcardInstance = await renderComponent(Flashcard, {
      props: {
        word: mockProps.word,
        translation: mockProps.translation,
        examples: mockProps.examples
      }
    });
    
    expect(screen.getByTestId('front-word')).toBeVisible();
    expect(screen.getByTestId('card-front')).toBeVisible();
    expect(screen.queryByTestId('card-back')).toBeInTheDocument();
    // The back word should be in the document but not visible initially
    expect(screen.getByTestId('back-word')).toBeInTheDocument();
  });

  it('flips when clicked', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    flashcardInstance = await renderComponent(Flashcard, {
      props: {
        word: mockProps.word,
        translation: mockProps.translation
      }
    });
    const card = screen.getByTestId('flashcard');
    
    // Flip the card
    await fireEvent.click(card);
    await tick();
    
    // The card should now show the back
    expect(screen.getByTestId('card-back')).toBeVisible();
  });

  it('shows examples when provided', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    flashcardInstance = await renderComponent(Flashcard, {
      props: {
        word: mockProps.word,
        translation: mockProps.translation,
        examples: mockProps.examples
      }
    });
    
    // Flip to see examples
    const card = screen.getByTestId('flashcard');
    await fireEvent.click(card);
    await tick();
    
    // Check examples are displayed
    expect(screen.getByText('Examples:')).toBeVisible();
    expect(screen.getByText('Здравей, как си?')).toBeVisible();
  });

  it('auto-flips back after timeout', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    vi.useFakeTimers();
    
    flashcardInstance = await renderComponent(Flashcard, {
      props: {
        word: mockProps.word,
        translation: mockProps.translation
      }
    });
    const card = screen.getByTestId('flashcard');
    
    await fireEvent.click(card);
    await tick();
    
    // Card should be flipped
    expect(screen.getByTestId('card-back')).toBeVisible();
    
    vi.advanceTimersByTime(5000);
    await tick();
    
    // Card should auto-flip back
    expect(screen.getByTestId('card-front')).toBeVisible();
    vi.useRealTimers();
  });

  it('maintains state during interactions', async () => {
    const { default: Flashcard } = await import('$lib/components/Flashcard.svelte');
    flashcardInstance = await renderComponent(Flashcard, {
      props: {
        word: mockProps.word,
        translation: mockProps.translation
      }
    });
    const card = screen.getByTestId('flashcard');
    
    // Multiple flips
    for (let i = 0; i < 3; i++) {
      await fireEvent.click(card);
      await tick();
    }
    
    // Component should still be functional
    expect(screen.getByTestId('flashcard')).toBeInTheDocument();
  });
});