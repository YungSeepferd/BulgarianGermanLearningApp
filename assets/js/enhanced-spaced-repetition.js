/**
 * Enhanced Spaced Repetition System
 * SM-2 algorithm with bidirectional learning support and difficulty multipliers
 */

class EnhancedSpacedRepetition {
  constructor() {
    this.storagePrefix = 'bgde:';
    this.difficultyMultipliers = {
      'bg-de': 1.1, // Bulgarian to German
      'de-bg': 1.2  // German to Bulgarian (harder)
    };
    this.init();
  }
  
  init() {
    // Initialize with existing simple spaced repetition if available
    if (window.BgDeApp && window.BgDeApp.spacedRepetition) {
      this.fallbackSystem = window.BgDeApp.spacedRepetition;
    }
  }
  
  // Initialize review state for an item
  initReviewState(itemId, direction = 'bg-de') {
    return {
      itemId: itemId,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: Date.now(),
      lastReview: null,
      direction: direction,
      totalReviews: 0,
      correctStreak: 0
    };
  }
  
  // Schedule next review based on SM-2 algorithm
  scheduleNext(state, grade, direction = 'bg-de') {
    const now = Date.now();
    const newState = { ...state };
    
    newState.lastReview = now;
    newState.totalReviews += 1;
    newState.direction = direction;
    
    // Apply difficulty multiplier based on direction
    const multiplier = this.difficultyMultipliers[direction] || 1.0;
    const adjustedGrade = Math.max(0, Math.min(5, grade));
    
    if (adjustedGrade >= 3) {
      // Correct response
      newState.correctStreak += 1;
      
      if (newState.repetitions === 0) {
        newState.interval = 1;
      } else if (newState.repetitions === 1) {
        newState.interval = 6;
      } else {
        newState.interval = Math.round(newState.interval * newState.easeFactor * multiplier);
      }
      
      newState.repetitions += 1;
    } else {
      // Incorrect response - reset
      newState.repetitions = 0;
      newState.interval = 1;
      newState.correctStreak = 0;
    }
    
    // Update ease factor
    newState.easeFactor = Math.max(1.3, 
      newState.easeFactor + (0.1 - (5 - adjustedGrade) * (0.08 + (5 - adjustedGrade) * 0.02))
    );
    
    // Calculate next review time
    newState.nextReview = now + (newState.interval * 24 * 60 * 60 * 1000);
    
    return newState;
  }
  
  // Get items due for review
  getDueItems(states, now = Date.now()) {
    return Object.values(states).filter(state => state.nextReview <= now);
  }
  
  // Load review state from storage
  loadState(itemId, direction = 'bg-de') {
    try {
      const key = `${this.storagePrefix}review_${itemId}_${direction}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load review state:', error);
    }
    
    return this.initReviewState(itemId, direction);
  }
  
  // Save review state to storage
  saveState(state) {
    try {
      const key = `${this.storagePrefix}review_${state.itemId}_${state.direction}`;
      localStorage.setItem(key, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn('Failed to save review state:', error);
      return false;
    }
  }
  
  // Load all review states
  loadAllStates() {
    const states = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.storagePrefix}review_`)) {
          const state = JSON.parse(localStorage.getItem(key));
          states[`${state.itemId}_${state.direction}`] = state;
        }
      }
    } catch (error) {
      console.warn('Failed to load review states:', error);
    }
    
    return states;
  }
  
  // Get review statistics
  getStats(direction = null) {
    const states = this.loadAllStates();
    const filteredStates = direction 
      ? Object.values(states).filter(s => s.direction === direction)
      : Object.values(states);
    
    const total = filteredStates.length;
    const due = this.getDueItems(states).length;
    const avgEaseFactor = total > 0 
      ? filteredStates.reduce((sum, s) => sum + s.easeFactor, 0) / total 
      : 2.5;
    
    return {
      total,
      due,
      avgEaseFactor: Math.round(avgEaseFactor * 100) / 100,
      direction
    };
  }
}

// Make globally available
window.EnhancedSpacedRepetition = EnhancedSpacedRepetition;
