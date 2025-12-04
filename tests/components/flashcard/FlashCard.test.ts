import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import FlashCardWrapper from './FlashCardWrapper.test.svelte';
import type { VocabularyItem } from '$lib/types/vocabulary.js';

describe('FlashCard Component', () => {
  // Mock vocabulary item
  const mockVocabularyItem: VocabularyItem = {
    id: '1',
    type: 'word',
    german: 'Haus',
    bulgarian: 'Къща',
    category: 'Nouns',
    level: 'A1',
    tags: [],
    emoji: '🏠',
    pronunciation: {
      german: 'haʊs',
      bulgarian: 'kɤʃtə'
    },
    grammar: {
      part_of_speech: 'noun',
      gender: 'neuter'
    }
  };

  it('should render with default props (front side)', () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    // Should show front content
    expect(screen.getByText('Haus')).toBeInTheDocument();
    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('haʊs')).toBeInTheDocument();
    expect(screen.getByText('Tap to flip')).toBeInTheDocument();

    // With CSS 3D transforms, both sides are in the DOM but only front should be visible
    // Check that front content is visible and back content is hidden
    expect(screen.getByText('Haus')).toBeVisible();
    expect(screen.getByText('Tap to flip')).toBeVisible();

    // Back content should exist but not be visible
    const backContent = screen.getByText('Къща');
    expect(backContent).toBeInTheDocument();
    // Check that back content has the CSS class that makes it hidden
    expect(backContent.closest('.card-face-back')).toHaveClass('card-face-back');
    // The card should not have the is-flipped class initially
    expect(screen.getByText('Haus').closest('.card')).not.toHaveClass('is-flipped');
  });

  it('should flip to back when clicked', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    // Click the card to flip
    const card = screen.getByRole('button');
    await fireEvent.click(card);

    // Should show back content
    expect(screen.getByText('Къща')).toBeInTheDocument();
    expect(screen.getByText('Nouns')).toBeInTheDocument();
    expect(screen.getByText('neuter')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();

    // The card should have the is-flipped class after clicking
    expect(screen.getByText('Къща').closest('.card')).toHaveClass('is-flipped');

    // Front content should exist but not be visible
    const frontHint = screen.getByText('Tap to flip');
    expect(frontHint).toBeInTheDocument();
    // Front content should be in the DOM but not visible due to CSS transforms
  });

  it('should flip back to front when clicked twice', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    const card = screen.getByRole('button');
    await fireEvent.click(card); // Flip to back
    await fireEvent.click(card); // Flip back to front

    // Should show front content again
    expect(screen.getByText('Haus')).toBeInTheDocument();
    expect(screen.getByText('Tap to flip')).toBeInTheDocument();

    // The card should not have the is-flipped class after flipping back
    expect(screen.getByText('Haus').closest('.card')).not.toHaveClass('is-flipped');

    // Back content should exist but not be visible
    const backContent = screen.getByText('Къща');
    expect(backContent).toBeInTheDocument();
  });

  it('should flip when Enter key is pressed', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    const card = screen.getByRole('button');
    await fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

    // Should show back content
    expect(screen.getByText('Къща')).toBeInTheDocument();
  });

  it('should flip when Space key is pressed', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    const card = screen.getByRole('button');
    await fireEvent.keyDown(card, { key: ' ', code: 'Space' });

    // Should show back content
    expect(screen.getByText('Къща')).toBeInTheDocument();
  });

  it('should render audio button when audio_url is provided', () => {
    const itemWithAudio = {
      ...mockVocabularyItem,
      audio_url: '/audio/haus.mp3'
    };

    render(FlashCardWrapper, { item: itemWithAudio });

    // Should show audio button on front
    const audioButtons = screen.getAllByLabelText('Play pronunciation');
    expect(audioButtons.length).toBe(2); // One on front, one on back
    expect(audioButtons[0]).toBeInTheDocument();
  });

  it('should render contextual nuance when provided', async () => {
    const itemWithNuance = {
      ...mockVocabularyItem,
      contextual_nuance: 'Used for buildings where people live'
    };

    render(FlashCardWrapper, { item: itemWithNuance });

    // Flip to back to see nuance
    const card = screen.getByRole('button');
    await fireEvent.click(card);

    expect(screen.getByText('Used for buildings where people live')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });

  it('should render grammar information when provided', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    // Flip to back to see grammar
    const card = screen.getByRole('button');
    await fireEvent.click(card);

    expect(screen.getByText('noun')).toBeInTheDocument();
    expect(screen.getByText('neuter')).toBeInTheDocument();
  });

  it('should render mnemonic when provided', async () => {
    const itemWithMnemonic = {
      ...mockVocabularyItem,
      mnemonics: 'Think of a house with a cross on top'
    };

    render(FlashCardWrapper, { item: itemWithMnemonic });

    // Flip to back to see mnemonic
    const card = screen.getByRole('button');
    await fireEvent.click(card);

    // Check that the mnemonic text is in the document (partial match)
    expect(screen.getByText(/Think of a house with a cross on top/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
    expect(card).toHaveAttribute('aria-label', 'Flashcard: Haus. Click or press Enter to flip.');
  });

  it('should apply correct level badge styling', async () => {
    render(FlashCardWrapper, { item: mockVocabularyItem });

    const card = screen.getByRole('button');
    await fireEvent.click(card);

    const levelBadge = screen.getByText('A1');
    expect(levelBadge).toHaveClass('level-badge');
    expect(levelBadge).toHaveClass('a1');
  });
});