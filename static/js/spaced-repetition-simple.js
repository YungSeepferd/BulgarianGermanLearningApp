/**
 * Simplified Spaced Repetition System (SM-2 Algorithm)
 * Global functions approach - no ES modules
 */

// Extend global namespace
window.BgDeApp = window.BgDeApp || {};

// Spaced repetition functionality
BgDeApp.spacedRepetition = {
  storagePrefix: 'bgde:'
};

/**
 * Initialize review state for a new vocabulary item
 */
BgDeApp.spacedRepetition.initReviewState = function(wordId) {
  const now = new Date();
  const state = {
    wordId: wordId,
    easinessFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: now.toISOString(),
    lastReviewDate: null,
    totalReviews: 0,
    correctAnswers: 0,
    streak: 0,
    created: now.toISOString(),
    updated: now.toISOString()
  };
  
  BgDeApp.spacedRepetition.saveState(wordId, state);
  return state;
};

/**
 * Calculate next review date using SM-2 algorithm
 */
BgDeApp.spacedRepetition.scheduleNext = function(reviewState, grade) {
  if (!reviewState || grade < 0 || grade > 5) {
    throw new Error('Invalid review state or grade');
  }

  const now = new Date();
  const updatedState = Object.assign({}, reviewState);
  
  // Update statistics
  updatedState.totalReviews++;
  updatedState.lastReviewDate = now.toISOString();
  updatedState.updated = now.toISOString();
  
  // Grade 3 or higher is considered correct
  const isCorrect = grade >= 3;
  
  if (isCorrect) {
    updatedState.correctAnswers++;
    updatedState.streak++;
    
    // Calculate new easiness factor (SM-2 formula)
    const newEF = Math.max(1.3, 
      updatedState.easinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    );
    updatedState.easinessFactor = Math.round(newEF * 100) / 100;
    
    // Calculate new interval
    if (updatedState.repetitions === 0) {
      updatedState.interval = 1;
    } else if (updatedState.repetitions === 1) {
      updatedState.interval = 6;
    } else {
      updatedState.interval = Math.round(updatedState.interval * updatedState.easinessFactor);
    }
    
    updatedState.repetitions++;
    
  } else {
    // Reset on incorrect answer
    updatedState.streak = 0;
    updatedState.repetitions = 0;
    updatedState.interval = 1;
    // Don't reset easiness factor below 1.3
    updatedState.easinessFactor = Math.max(1.3, updatedState.easinessFactor - 0.2);
  }
  
  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + updatedState.interval);
  updatedState.nextReviewDate = nextReview.toISOString();
  
  // Save updated state
  BgDeApp.spacedRepetition.saveState(updatedState.wordId, updatedState);
  
  return updatedState;
};

/**
 * Load review state from localStorage
 */
BgDeApp.spacedRepetition.loadState = function(wordId) {
  try {
    const key = BgDeApp.spacedRepetition.storagePrefix + 'review:' + wordId;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    const state = JSON.parse(data);
    
    // Validate state structure
    if (!BgDeApp.spacedRepetition.isValidState(state)) {
      console.warn('Invalid review state for ' + wordId + ', reinitializing');
      return BgDeApp.spacedRepetition.initReviewState(wordId);
    }
    
    return state;
    
  } catch (error) {
    console.error('Failed to load review state for ' + wordId + ':', error);
    return null;
  }
};

/**
 * Save review state to localStorage
 */
BgDeApp.spacedRepetition.saveState = function(wordId, state) {
  try {
    const key = BgDeApp.spacedRepetition.storagePrefix + 'review:' + wordId;
    const data = JSON.stringify(state);
    
    localStorage.setItem(key, data);
    return true;
    
  } catch (error) {
    console.error('Failed to save review state for ' + wordId + ':', error);
    return false;
  }
};

/**
 * Get review statistics for a vocabulary item
 */
BgDeApp.spacedRepetition.getStats = function(wordId) {
  const state = BgDeApp.spacedRepetition.loadState(wordId);
  
  if (!state) {
    return {
      totalReviews: 0,
      correctAnswers: 0,
      accuracy: 0,
      streak: 0,
      easinessFactor: 2.5,
      nextReviewDate: null,
      interval: 1
    };
  }
  
  return {
    totalReviews: state.totalReviews,
    correctAnswers: state.correctAnswers,
    accuracy: state.totalReviews > 0 ? 
      Math.round((state.correctAnswers / state.totalReviews) * 100) : 0,
    streak: state.streak,
    easinessFactor: state.easinessFactor,
    nextReviewDate: state.nextReviewDate,
    interval: state.interval,
    lastReviewDate: state.lastReviewDate
  };
};

/**
 * Validate review state structure
 */
BgDeApp.spacedRepetition.isValidState = function(state) {
  if (!state || typeof state !== 'object') return false;
  
  const required = [
    'wordId', 'easinessFactor', 'interval', 'repetitions',
    'nextReviewDate', 'totalReviews', 'correctAnswers', 'streak'
  ];
  
  return required.every(function(field) {
    return state.hasOwnProperty(field);
  });
};
