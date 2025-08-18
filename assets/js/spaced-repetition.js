/**
 * Spaced Repetition System (SM-2 Algorithm)
 * Client-side implementation for Bulgarian-German Learning App
 * Based on pseudocode/core/services.pseudo
 */

export class SpacedRepetition {
  constructor() {
    this.storagePrefix = 'bgde:';
  }

  /**
   * Initialize review state for a new vocabulary item
   * @param {string} wordId - Unique identifier for the vocabulary item
   * @returns {Object} Initial review state
   */
  initReviewState(wordId) {
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
    
    this.saveState(wordId, state);
    return state;
  }

  /**
   * Calculate next review date using SM-2 algorithm
   * @param {Object} reviewState - Current review state
   * @param {number} grade - Quality of response (0-5, where 3+ is correct)
   * @returns {Object} Updated review state with next review date
   */
  scheduleNext(reviewState, grade) {
    if (!reviewState || grade < 0 || grade > 5) {
      throw new Error('Invalid review state or grade');
    }

    const now = new Date();
    const updatedState = { ...reviewState };
    
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
    this.saveState(updatedState.wordId, updatedState);
    
    return updatedState;
  }

  /**
   * Load review state from localStorage
   * @param {string} wordId - Unique identifier for the vocabulary item
   * @returns {Object|null} Review state or null if not found
   */
  loadState(wordId) {
    try {
      const key = `${this.storagePrefix}review:${wordId}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }
      
      const state = JSON.parse(data);
      
      // Validate state structure
      if (!this.isValidState(state)) {
        console.warn(`Invalid review state for ${wordId}, reinitializing`);
        return this.initReviewState(wordId);
      }
      
      return state;
      
    } catch (error) {
      console.error(`Failed to load review state for ${wordId}:`, error);
      return null;
    }
  }

  /**
   * Save review state to localStorage
   * @param {string} wordId - Unique identifier for the vocabulary item
   * @param {Object} state - Review state to save
   * @returns {boolean} Success status
   */
  saveState(wordId, state) {
    try {
      const key = `${this.storagePrefix}review:${wordId}`;
      const data = JSON.stringify(state);
      
      localStorage.setItem(key, data);
      return true;
      
    } catch (error) {
      console.error(`Failed to save review state for ${wordId}:`, error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.cleanupOldStates();
        
        // Try again after cleanup
        try {
          localStorage.setItem(key, data);
          return true;
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Get all vocabulary items that are due for review
   * @returns {Array} Array of word IDs that need review
   */
  getDueItems() {
    const dueItems = [];
    const now = new Date();
    
    try {
      // Iterate through all localStorage keys with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(`${this.storagePrefix}review:`)) {
          const wordId = key.replace(`${this.storagePrefix}review:`, '');
          const state = this.loadState(wordId);
          
          if (state && new Date(state.nextReviewDate) <= now) {
            dueItems.push({
              wordId: wordId,
              nextReviewDate: state.nextReviewDate,
              priority: this.calculatePriority(state)
            });
          }
        }
      }
      
      // Sort by priority (higher priority first)
      dueItems.sort((a, b) => b.priority - a.priority);
      
      return dueItems.map(item => item.wordId);
      
    } catch (error) {
      console.error('Failed to get due items:', error);
      return [];
    }
  }

  /**
   * Calculate priority for review scheduling
   * @param {Object} state - Review state
   * @returns {number} Priority score (higher = more urgent)
   */
  calculatePriority(state) {
    const now = new Date();
    const nextReview = new Date(state.nextReviewDate);
    const overdueDays = Math.max(0, (now - nextReview) / (1000 * 60 * 60 * 24));
    
    // Base priority on how overdue the item is
    let priority = overdueDays * 10;
    
    // Boost priority for items with low easiness factor (difficult items)
    priority += (3.0 - state.easinessFactor) * 5;
    
    // Boost priority for items with broken streaks
    if (state.streak === 0 && state.totalReviews > 0) {
      priority += 15;
    }
    
    // Reduce priority for items with high streaks (well-learned items)
    priority -= Math.min(state.streak * 2, 20);
    
    return Math.max(0, priority);
  }

  /**
   * Get review statistics for a vocabulary item
   * @param {string} wordId - Unique identifier for the vocabulary item
   * @returns {Object} Statistics object
   */
  getStats(wordId) {
    const state = this.loadState(wordId);
    
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
  }

  /**
   * Get overall learning statistics
   * @returns {Object} Overall statistics
   */
  getOverallStats() {
    let totalItems = 0;
    let totalReviews = 0;
    let totalCorrect = 0;
    let dueCount = 0;
    let masteredCount = 0;
    const now = new Date();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(`${this.storagePrefix}review:`)) {
          totalItems++;
          const wordId = key.replace(`${this.storagePrefix}review:`, '');
          const state = this.loadState(wordId);
          
          if (state) {
            totalReviews += state.totalReviews;
            totalCorrect += state.correctAnswers;
            
            if (new Date(state.nextReviewDate) <= now) {
              dueCount++;
            }
            
            // Consider mastered if EF > 2.5, interval > 30 days, and streak > 5
            if (state.easinessFactor > 2.5 && state.interval > 30 && state.streak > 5) {
              masteredCount++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to calculate overall stats:', error);
    }
    
    return {
      totalItems,
      totalReviews,
      accuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
      dueCount,
      masteredCount,
      inProgressCount: totalItems - masteredCount
    };
  }

  /**
   * Export all review data as JSON
   * @returns {string} JSON string of all review data
   */
  exportData() {
    const data = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(`${this.storagePrefix}review:`)) {
          const wordId = key.replace(`${this.storagePrefix}review:`, '');
          const state = this.loadState(wordId);
          
          if (state) {
            data[wordId] = state;
          }
        }
      }
      
      return JSON.stringify(data, null, 2);
      
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  /**
   * Import review data from JSON
   * @param {string} jsonData - JSON string of review data
   * @returns {boolean} Success status
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      let importCount = 0;
      
      for (const [wordId, state] of Object.entries(data)) {
        if (this.isValidState(state)) {
          this.saveState(wordId, state);
          importCount++;
        }
      }
      
      console.log(`Successfully imported ${importCount} review states`);
      return true;
      
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Clear all review data (with confirmation)
   * @param {boolean} confirmed - Confirmation flag
   * @returns {boolean} Success status
   */
  clearAllData(confirmed = false) {
    if (!confirmed) {
      console.warn('clearAllData requires confirmed=true parameter');
      return false;
    }
    
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} review states`);
      return true;
      
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  /**
   * Validate review state structure
   * @param {Object} state - State to validate
   * @returns {boolean} Is valid
   */
  isValidState(state) {
    if (!state || typeof state !== 'object') return false;
    
    const required = [
      'wordId', 'easinessFactor', 'interval', 'repetitions',
      'nextReviewDate', 'totalReviews', 'correctAnswers', 'streak'
    ];
    
    return required.every(field => state.hasOwnProperty(field));
  }

  /**
   * Clean up old review states to free storage space
   */
  cleanupOldStates() {
    try {
      const states = [];
      
      // Collect all states with their last review dates
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(`${this.storagePrefix}review:`)) {
          const wordId = key.replace(`${this.storagePrefix}review:`, '');
          const state = this.loadState(wordId);
          
          if (state) {
            states.push({
              wordId,
              key,
              lastReview: new Date(state.lastReviewDate || state.created)
            });
          }
        }
      }
      
      // Sort by last review date (oldest first)
      states.sort((a, b) => a.lastReview - b.lastReview);
      
      // Remove oldest 10% of states
      const removeCount = Math.floor(states.length * 0.1);
      
      for (let i = 0; i < removeCount; i++) {
        localStorage.removeItem(states[i].key);
      }
      
      console.log(`Cleaned up ${removeCount} old review states`);
      
    } catch (error) {
      console.error('Failed to cleanup old states:', error);
    }
  }
}

// Export singleton instance
export const spacedRepetition = new SpacedRepetition();

// Export class for testing
export default SpacedRepetition;
