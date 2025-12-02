/**
 * Rune-based Flashcard Store for Svelte 5
 * @file stores/rune-based-flashcard.ts
 * @description Modern Svelte 5 store using runes for flashcard state management
 * @version 1.0.0
 * @updated November 2025
 */

import type {
  VocabularyItem,
  ReviewState,
  LanguageDirection,
  SessionStats,
  FlashcardConfig
} from '$lib/types/index.js';
import {
  createSpacedRepetitionSystem,
  isValidGrade
} from '$lib/utils/spaced-repetition.js';

// ============================================================================
// CORE STATE USING RUNES
// ============================================================================

/**
 * Main flashcard state using Svelte 5 runes
 */
export const flashcardState = {
  // Reactive state variables
  currentCard: $state<VocabularyItem | null>(null),
  currentIndex: $state(0),
  cards: $state<VocabularyItem[]>([]),
  isFlipped: $state(false),
  isLoading: $state(false),
  hasError: $state(false),
  errorMessage: $state(''),
  
  // Configuration
  config: $state<FlashcardConfig>({
    category: 'all',
    level: 'all',
    limit: 20,
    mode: 'practice',
    shuffle: true
  }),
  
  // Language direction
  direction: $state<LanguageDirection>('bg-de'),
  
  // Session statistics
  sessionStats: $state<SessionStats>({
    startTime: null,
    endTime: null,
    totalCards: 0,
    reviewedCards: 0,
    correctAnswers: 0,
    grades: []
  })
};

// ============================================================================
// DERIVED VALUES USING $DERIVED
// ============================================================================

/**
 * Current card text (front and back)
 */
export const cardText = $derived(() => {
  if (!flashcardState.currentCard) {
    return { frontText: '', backText: '' };
  }
  
  const card = flashcardState.currentCard;
  const isBgToDe = flashcardState.direction === 'bg-de';
  
  return {
    frontText: isBgToDe ? card.word : card.translation,
    backText: isBgToDe ? card.translation : card.word
  };
});

/**
 * Current progress through the session
 */
export const progress = $derived(() => {
  const { currentIndex, cards } = flashcardState;
  return {
    current: currentIndex + 1,
    total: cards.length,
    percentage: cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  };
});

/**
 * Enhanced session statistics
 */
export const enhancedSessionStats = $derived(() => {
  const { sessionStats } = flashcardState;
  const accuracy = sessionStats.reviewedCards > 0 
    ? (sessionStats.correctAnswers / sessionStats.reviewedCards) * 100 
    : 0;
  
  const averageGrade = sessionStats.grades.length > 0
    ? sessionStats.grades.reduce((sum, grade) => sum + grade, 0) / sessionStats.grades.length
    : 0;

  return {
    ...sessionStats,
    accuracy: Math.round(accuracy * 10) / 10,
    averageGrade: Math.round(averageGrade * 10) / 10
  };
});

/**
 * Whether grading controls should be shown
 */
export const showGradingControls = $derived(
  flashcardState.isFlipped && !flashcardState.sessionStats.endTime
);

// ============================================================================
// SPACED REPETITION SYSTEM
// ============================================================================

const spacedRepetitionSystem = createSpacedRepetitionSystem();

/**
 * Current review state for the card
 */
export const currentReviewState = $derived(() => {
  if (!flashcardState.currentCard) {
    return null;
  }
  
  const currentDirection = flashcardState.currentCard.source_lang === 'bg' ? 'bg-de' : 'de-bg';
  return spacedRepetitionSystem.loadState(flashcardState.currentCard.id, currentDirection);
});

// ============================================================================
// STORE ACTIONS
// ============================================================================

/**
 * Flashcard store actions
 */
export const flashcardActions = {
  /**
   * Set current card by index
   */
  setCurrentCard(index: number): void {
    if (index < 0 || index >= flashcardState.cards.length) {
      return;
    }
    
    flashcardState.currentIndex = index;
    flashcardState.currentCard = flashcardState.cards[index];
    flashcardState.isFlipped = false;
  },

  /**
   * Flip the current card
   */
  flipCard(): void {
    flashcardState.isFlipped = !flashcardState.isFlipped;
  },

  /**
   * Move to next card
   */
  nextCard(): void {
    const nextIndex = flashcardState.currentIndex + 1;
    if (nextIndex >= flashcardState.cards.length) {
      flashcardState.sessionStats.endTime = new Date();
      return;
    }
    
    flashcardState.currentIndex = nextIndex;
    flashcardState.currentCard = flashcardState.cards[nextIndex];
    flashcardState.isFlipped = false;
  },

  /**
   * Move to previous card
   */
  previousCard(): void {
    const prevIndex = Math.max(0, flashcardState.currentIndex - 1);
    flashcardState.currentIndex = prevIndex;
    flashcardState.currentCard = flashcardState.cards[prevIndex];
    flashcardState.isFlipped = false;
  },

  /**
   * Grade the current card
   */
  gradeCard(grade: number): void {
    if (!isValidGrade(grade) || !flashcardState.currentCard) {
      console.warn(`Invalid grade or no current card: ${grade}`);
      return;
    }

    // Get current review state
    const currentDirection = flashcardState.currentCard.source_lang === 'bg' ? 'bg-de' : 'de-bg';
    const reviewState = spacedRepetitionSystem.loadState(flashcardState.currentCard.id, currentDirection);
    
    // Calculate next review state
    const updatedState = spacedRepetitionSystem.scheduleNext(reviewState, grade, currentDirection);
    
    // Save updated state
    spacedRepetitionSystem.saveState(updatedState);
    
    // Update session statistics
    const isCorrect = grade >= 3;
    flashcardState.sessionStats.reviewedCards++;
    flashcardState.sessionStats.correctAnswers += isCorrect ? 1 : 0;
    flashcardState.sessionStats.grades.push(grade);

    // Auto-advance to next card after grading
    setTimeout(() => {
      this.nextCard();
    }, 500);
  },

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    flashcardState.isLoading = loading;
  },

  /**
   * Set error state
   */
  setError(error: string): void {
    flashcardState.hasError = true;
    flashcardState.errorMessage = error;
  },

  /**
   * Clear error state
   */
  clearError(): void {
    flashcardState.hasError = false;
    flashcardState.errorMessage = '';
  },

  /**
   * Reset the entire session
   */
  resetSession(): void {
    flashcardState.currentCard = null;
    flashcardState.currentIndex = 0;
    flashcardState.cards = [];
    flashcardState.isFlipped = false;
    flashcardState.isLoading = false;
    flashcardState.hasError = false;
    flashcardState.errorMessage = '';
    flashcardState.sessionStats = {
      startTime: null,
      endTime: null,
      totalCards: 0,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };
  },

  /**
   * Update session statistics
   */
  updateSessionStats(stats: Partial<SessionStats>): void {
    flashcardState.sessionStats = {
      ...flashcardState.sessionStats,
      ...stats
    };
  }
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Initialize a new flashcard session
 */
export function initializeSession(cards: VocabularyItem[], config: Partial<FlashcardConfig> = {}): void {
  flashcardActions.setLoading(true);
  flashcardActions.clearError();

  try {
    // Apply configuration
    let filteredCards = [...cards];
    
    if (config.category && config.category !== 'all') {
      filteredCards = filteredCards.filter(card => card.category === config.category);
    }
    
    if (config.level && config.level !== 'all') {
      filteredCards = filteredCards.filter(card => card.level === config.level);
    }
    
    if (config.limit && config.limit > 0) {
      filteredCards = filteredCards.slice(0, config.limit);
    }
    
    if (config.shuffle) {
      filteredCards = [...filteredCards].sort(() => Math.random() - 0.5);
    }

    // Update state with new session
    flashcardState.cards = filteredCards;
    flashcardState.currentIndex = 0;
    flashcardState.currentCard = filteredCards.length > 0 ? filteredCards[0] : null;
    flashcardState.isFlipped = false;
    flashcardState.config = { ...flashcardState.config, ...config };
    flashcardState.sessionStats = {
      startTime: new Date(),
      endTime: null,
      totalCards: filteredCards.length,
      reviewedCards: 0,
      correctAnswers: 0,
      grades: []
    };

    flashcardActions.setLoading(false);
    
    console.log(`[RuneFlashcard] Session initialized with ${filteredCards.length} cards`);
  } catch (error) {
    flashcardActions.setError(`Failed to initialize session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    flashcardActions.setLoading(false);
  }
}

/**
 * End the current session
 */
export function endSession(): void {
  flashcardState.sessionStats.endTime = new Date();
  console.log('[RuneFlashcard] Session ended');
}

/**
 * Get due cards for review
 */
export function getDueCards(direction?: LanguageDirection): ReviewState[] {
  return spacedRepetitionSystem.getDueItems(direction || 'bg-de');
}

/**
 * Get statistics for the current direction
 */
export function getStatistics(direction?: LanguageDirection) {
  return spacedRepetitionSystem.getStats(direction || 'bg-de');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if session is active
 */
export function isSessionActive(): boolean {
  return flashcardState.cards.length > 0 && !flashcardState.sessionStats.endTime;
}

/**
 * Get current session summary
 */
export function getSessionSummary(): SessionStats {
  return flashcardState.sessionStats;
}

/**
 * Export session data
 */
export function exportSessionData(): string {
  return (spacedRepetitionSystem as any).exportData();
}

/**
 * Import session data
 */
export function importSessionData(jsonData: string) {
  try {
    const results = (spacedRepetitionSystem as any).importData(jsonData);
    console.log('[RuneFlashcard] Import completed:', results);
    return results;
  } catch (error) {
    console.error('[RuneFlashcard] Import failed:', error);
    throw error;
  }
}

// Export all state and utilities
export { flashcardState as state, flashcardActions as actions };