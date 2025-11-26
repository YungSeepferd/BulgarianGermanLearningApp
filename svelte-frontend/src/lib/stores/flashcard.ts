/**
 * Flashcard Store for SvelteKit
 * @file stores/flashcard.ts
 * @description Svelte stores for managing flashcard state and SM-2 integration
 * @version 1.0.0
 * @updated November 2025
 */

import { writable, derived, readable } from 'svelte/store';
import type { 
  VocabularyItem, 
  ReviewState, 
  LanguageDirection, 
  SessionStats, 
  FlashcardUIState, 
  FlashcardStoreState, 
  FlashcardStoreActions,
  GradeFeedback,
  FlashcardConfig
} from '$lib/types/index.js';
import { 
  UnifiedSpacedRepetition, 
  PhaseCalculator, 
  createSpacedRepetitionSystem,
  generateGradeFeedback,
  isValidGrade,
  getGradeFeedbackMessage
} from '$lib/utils/spaced-repetition.js';

// ============================================================================
// CORE STORES
// ============================================================================

/**
 * Initial flashcard store state
 */
const initialState: FlashcardStoreState = {
  currentCard: null,
  currentIndex: 0,
  cards: [],
  isFlipped: false,
  isLoading: false,
  hasError: false,
  errorMessage: '',
  sessionStats: {
    startTime: null,
    endTime: null,
    totalCards: 0,
    reviewedCards: 0,
    correctAnswers: 0,
    grades: []
  },
  uiState: {
    isLoading: false,
    hasError: false,
    errorMessage: '',
    isPaused: false,
    isComplete: false,
    currentCardIndex: 0,
    isFlipped: false,
    showGradingControls: false
  }
};

/**
 * Main flashcard store
 */
export const flashcardStore = writable<FlashcardStoreState>(initialState);

/**
 * Configuration store
 */
export const configStore = writable<FlashcardConfig>({
  category: 'all',
  level: 'all',
  limit: 20,
  mode: 'practice',
  shuffle: true
});

/**
 * Language direction store
 */
export const directionStore = writable<LanguageDirection>('bg-de');

/**
 * Spaced repetition system instance
 */
const spacedRepetitionSystem = createSpacedRepetitionSystem();
const phaseCalculator = new PhaseCalculator();

// ============================================================================
// DERIVED STORES
// ============================================================================

/**
 * Current card text (front and back)
 */
export const cardTextStore = derived(
  [flashcardStore, directionStore],
  ([$flashcardStore, $direction]) => {
    if (!$flashcardStore.currentCard) return { frontText: '', backText: '' };
    
    const card = $flashcardStore.currentCard;
    const isBgToDe = $direction === 'bg-de';
    
    return {
      frontText: isBgToDe ? card.word : card.translation,
      backText: isBgToDe ? card.translation : card.word
    };
  }
);

/**
 * Current progress through the session
 */
export const progressStore = derived(
  flashcardStore,
  ($flashcardStore) => {
    const { currentIndex, cards } = $flashcardStore;
    return {
      current: currentIndex + 1,
      total: cards.length,
      percentage: cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
    };
  }
);

/**
 * Session statistics
 */
export const sessionStatsStore = derived(
  flashcardStore,
  ($flashcardStore) => {
    const { sessionStats } = $flashcardStore;
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
  }
);

/**
 * Whether grading controls should be shown
 */
export const showGradingControlsStore = derived(
  flashcardStore,
  ($flashcardStore) => $flashcardStore.isFlipped && !$flashcardStore.uiState.isComplete
);

/**
 * Current review state for the card
 */
export const currentReviewStateStore = readable<ReviewState | null>(null, (set) => {
  let unsubscribe: (() => void) | null = null;
  
  unsubscribe = flashcardStore.subscribe(($flashcardStore) => {
    if ($flashcardStore.currentCard) {
      const state = spacedRepetitionSystem.loadState(
        $flashcardStore.currentCard.id, 
        $flashcardStore.currentCard.source_lang === 'bg' ? 'bg-de' : 'de-bg'
      );
      set(state);
    } else {
      set(null);
    }
  });
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
});

// ============================================================================
// STORE ACTIONS
// ============================================================================

/**
 * Flashcard store actions
 */
export const flashcardActions: FlashcardStoreActions = {
  /**
   * Set current card by index
   */
  setCurrentCard: (index: number) => {
    flashcardStore.update(state => {
      if (index < 0 || index >= state.cards.length) {
        return state;
      }
      
      return {
        ...state,
        currentIndex: index,
        currentCard: state.cards[index],
        isFlipped: false,
        uiState: {
          ...state.uiState,
          currentCardIndex: index,
          isFlipped: false,
          showGradingControls: false
        }
      };
    });
  },

  /**
   * Flip the current card
   */
  flipCard: () => {
    flashcardStore.update(state => {
      const newFlippedState = !state.isFlipped;
      return {
        ...state,
        isFlipped: newFlippedState,
        uiState: {
          ...state.uiState,
          isFlipped: newFlippedState,
          showGradingControls: newFlippedState
        }
      };
    });
  },

  /**
   * Move to next card
   */
  nextCard: () => {
    flashcardStore.update(state => {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.cards.length) {
        return {
          ...state,
          uiState: {
            ...state.uiState,
            isComplete: true
          }
        };
      }
      
      return {
        ...state,
        currentIndex: nextIndex,
        currentCard: state.cards[nextIndex],
        isFlipped: false,
        uiState: {
          ...state.uiState,
          currentCardIndex: nextIndex,
          isFlipped: false,
          showGradingControls: false
        }
      };
    });
  },

  /**
   * Move to previous card
   */
  previousCard: () => {
    flashcardStore.update(state => {
      const prevIndex = Math.max(0, state.currentIndex - 1);
      return {
        ...state,
        currentIndex: prevIndex,
        currentCard: state.cards[prevIndex],
        isFlipped: false,
        uiState: {
          ...state.uiState,
          currentCardIndex: prevIndex,
          isFlipped: false,
          showGradingControls: false
        }
      };
    });
  },

  /**
   * Grade the current card
   */
  gradeCard: (grade: number) => {
    if (!isValidGrade(grade)) {
      console.warn(`Invalid grade: ${grade}`);
      return;
    }

    flashcardStore.update(state => {
      if (!state.currentCard) return state;

      // Get current review state
      const currentDirection = state.currentCard.source_lang === 'bg' ? 'bg-de' : 'de-bg';
      const reviewState = spacedRepetitionSystem.loadState(state.currentCard.id, currentDirection);
      
      // Calculate next review state
      const updatedState = spacedRepetitionSystem.scheduleNext(reviewState, grade, currentDirection);
      
      // Save updated state
      spacedRepetitionSystem.saveState(updatedState);
      
      // Update session statistics
      const isCorrect = grade >= 3;
      const newSessionStats = {
        ...state.sessionStats,
        reviewedCards: state.sessionStats.reviewedCards + 1,
        correctAnswers: state.sessionStats.correctAnswers + (isCorrect ? 1 : 0),
        grades: [...state.sessionStats.grades, grade]
      };

      // Generate feedback for logging
      const feedback = generateGradeFeedback(grade, updatedState, phaseCalculator);
      console.log(`[Flashcard] Graded card ${state.currentCard.id}: ${getGradeFeedbackMessage(grade, feedback)}`);

      return {
        ...state,
        sessionStats: newSessionStats
      };
    });

    // Auto-advance to next card after grading
    setTimeout(() => {
      flashcardActions.nextCard();
    }, 500);
  },

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    flashcardStore.update(state => ({
      ...state,
      isLoading: loading,
      uiState: {
        ...state.uiState,
        isLoading: loading
      }
    }));
  },

  /**
   * Set error state
   */
  setError: (error: string) => {
    flashcardStore.update(state => ({
      ...state,
      hasError: true,
      errorMessage: error,
      uiState: {
        ...state.uiState,
        hasError: true,
        errorMessage: error
      }
    }));
  },

  /**
   * Clear error state
   */
  clearError: () => {
    flashcardStore.update(state => ({
      ...state,
      hasError: false,
      errorMessage: '',
      uiState: {
        ...state.uiState,
        hasError: false,
        errorMessage: ''
      }
    }));
  },

  /**
   * Reset the entire session
   */
  resetSession: () => {
    flashcardStore.set(initialState);
  },

  /**
   * Update session statistics
   */
  updateSessionStats: (stats: Partial<SessionStats>) => {
    flashcardStore.update(state => ({
      ...state,
      sessionStats: {
        ...state.sessionStats,
        ...stats
      }
    }));
  }
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Initialize a new flashcard session
 */
export function initializeSession(cards: VocabularyItem[], config: FlashcardConfig = {}): void {
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

    // Update store with new session
    flashcardStore.update(state => ({
      ...state,
      cards: filteredCards,
      currentIndex: 0,
      currentCard: filteredCards.length > 0 ? filteredCards[0] : null,
      isFlipped: false,
      sessionStats: {
        startTime: new Date(),
        endTime: null,
        totalCards: filteredCards.length,
        reviewedCards: 0,
        correctAnswers: 0,
        grades: []
      },
      uiState: {
        ...state.uiState,
        isComplete: false,
        currentCardIndex: 0,
        isFlipped: false,
        showGradingControls: false
      }
    }));

    flashcardActions.setLoading(false);
    
    console.log(`[Flashcard] Session initialized with ${filteredCards.length} cards`);
  } catch (error) {
    flashcardActions.setError(`Failed to initialize session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    flashcardActions.setLoading(false);
  }
}

/**
 * End the current session
 */
export function endSession(): void {
  flashcardStore.update(state => ({
    ...state,
    sessionStats: {
      ...state.sessionStats,
      endTime: new Date()
    },
    uiState: {
      ...state.uiState,
      isComplete: true
    }
  }));
  
  console.log('[Flashcard] Session ended');
}

/**
 * Pause/resume the session
 */
export function togglePause(): void {
  flashcardStore.update(state => ({
    ...state,
    uiState: {
      ...state.uiState,
      isPaused: !state.uiState.isPaused
    }
  }));
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
  let isActive = false;
  flashcardStore.subscribe(state => {
    isActive = state.cards.length > 0 && !state.uiState.isComplete;
  })();
  return isActive;
}

/**
 * Get current session summary
 */
export function getSessionSummary(): SessionStats | null {
  let summary: SessionStats | null = null;
  flashcardStore.subscribe(state => {
    summary = state.sessionStats;
  })();
  return summary;
}

/**
 * Export session data
 */
export function exportSessionData(): string {
  return spacedRepetitionSystem.exportData();
}

/**
 * Import session data
 */
export function importSessionData(jsonData: string) {
  try {
    const results = spacedRepetitionSystem.importData(jsonData);
    console.log('[Flashcard] Import completed:', results);
    return results;
  } catch (error) {
    console.error('[Flashcard] Import failed:', error);
    throw error;
  }
}

// Export all stores and utilities
export {
  type FlashcardStoreState,
  type FlashcardStoreActions,
  type FlashcardConfig,
  type LanguageDirection,
  type VocabularyItem,
  type ReviewState,
  type SessionStats,
  type GradeFeedback
};