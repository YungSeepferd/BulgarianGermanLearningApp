/**
 * Enhanced Spaced Repetition with Bidirectional Learning Support
 * Implements SM-2 algorithm with language direction awareness
 */

class EnhancedSpacedRepetition {
    constructor() {
        this.storagePrefix = 'bgde:';
        this.reviewStates = this.loadReviewStates();
        this.currentDirection = localStorage.getItem('bgde:learning_direction') || 'bg_to_de';
        
        // Direction difficulty multipliers based on research
        this.difficultyMultipliers = {
            'bg_to_de': 1.2,  // Bulgarian to German is harder (cases, compounds)
            'de_to_bg': 1.1,  // German to Bulgarian is moderately harder (aspects)
            'both': 1.15      // Mixed mode average
        };
    }
    
    /**
     * Initialize review state for new vocabulary item
     * @param {string} itemId - Unique item identifier
     * @param {string} learningMode - Learning direction
     * @returns {Object} Initial review state
     */
    initReviewState(itemId, learningMode = null) {
        const mode = learningMode || this.currentDirection;
        
        return {
            itemId: itemId,
            learningMode: mode,
            sourceLang: mode === 'de_to_bg' ? 'de' : 'bg',
            targetLang: mode === 'de_to_bg' ? 'bg' : 'de',
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: new Date(),
            lastReview: null,
            correctStreak: 0,
            totalReviews: 0,
            successRate: 0
        };
    }
    
    /**
     * Calculate next review using enhanced SM-2 algorithm
     * @param {boolean} correct - Whether answer was correct
     * @param {Object} state - Current review state
     * @param {Object} item - Vocabulary item (for difficulty)
     * @returns {Object} Updated review state
     */
    calculateNextReview(correct, state, item = null) {
        // Base quality score adjusted for difficulty
        let quality = correct ? 5 : 2;
        
        // Adjust quality based on item difficulty
        if (item && item.difficulty) {
            if (correct && item.difficulty >= 4) {
                quality = 5; // Bonus for difficult items
            } else if (!correct && item.difficulty <= 2) {
                quality = 1; // Penalty for easy items failed
            }
        }
        
        const newState = {
            ...state,
            lastReview: new Date(),
            totalReviews: state.totalReviews + 1
        };
        
        // Update success tracking
        if (correct) {
            newState.correctStreak = state.correctStreak + 1;
        } else {
            newState.correctStreak = 0;
        }
        
        newState.successRate = newState.correctStreak / newState.totalReviews;
        
        // SM-2 algorithm logic
        if (quality < 3) {
            // Incorrect answer - reset repetitions and interval
            newState.repetitions = 0;
            newState.interval = 1;
        } else {
            // Correct answer - update interval based on repetitions
            newState.repetitions = state.repetitions + 1;
            
            if (newState.repetitions === 1) {
                newState.interval = 1;
            } else if (newState.repetitions === 2) {
                newState.interval = 6;
            } else {
                // For subsequent reviews, multiply by ease factor
                newState.interval = Math.round(newState.interval * newState.easeFactor);
            }
        }
        
        // Apply direction difficulty multiplier
        const multiplier = this.getDirectionMultiplier(state.learningMode);
        newState.interval = Math.round(newState.interval * multiplier);
        
        // Update ease factor (bounded between 1.3 and 2.5)
        const q = quality;
        newState.easeFactor = newState.easeFactor + (0.1 - (5.0 - q) * (0.08 + (5.0 - q) * 0.02));
        newState.easeFactor = Math.max(1.3, newState.easeFactor);
        
        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newState.interval);
        newState.nextReview = nextReview;
        
        return newState;
    }
    
    /**
     * Get difficulty multiplier for learning direction
     * @param {string} learningMode - Learning direction
     * @returns {number} Difficulty multiplier
     */
    getDirectionMultiplier(learningMode) {
        return this.difficultyMultipliers[learningMode] || 1.0;
    }
    
    /**
     * Get items due for review in specific direction
     * @param {string} learningMode - Learning direction filter
     * @returns {Array} Due review states
     */
    getDueItems(learningMode = null) {
        const mode = learningMode || this.currentDirection;
        const now = new Date();
        
        return Object.values(this.reviewStates).filter(state => {
            // Filter by learning mode if specified
            if (mode !== 'both' && state.learningMode !== mode) {
                return false;
            }
            
            // Check if due for review
            const nextReview = new Date(state.nextReview);
            return nextReview <= now;
        });
    }
    
    /**
     * Get new items that haven't been reviewed yet
     * @param {Array} allItems - All vocabulary items
     * @param {string} learningMode - Learning direction
     * @param {number} maxItems - Maximum items to return
     * @returns {Array} New items for learning
     */
    getNewItems(allItems, learningMode = null, maxItems = 5) {
        const mode = learningMode || this.currentDirection;
        const reviewedIds = new Set(Object.keys(this.reviewStates));
        
        return allItems
            .filter(item => {
                // Skip already reviewed items
                if (reviewedIds.has(item.id)) return false;
                
                // Filter by learning direction
                if (mode === 'bg_to_de' && item.source_lang !== 'bg') return false;
                if (mode === 'de_to_bg' && item.source_lang !== 'de') return false;
                
                return true;
            })
            .sort((a, b) => {
                // Sort by difficulty (easier first) then frequency (higher first)
                if (a.difficulty !== b.difficulty) {
                    return (a.difficulty || 2) - (b.difficulty || 2);
                }
                return (b.frequency || 50) - (a.frequency || 50);
            })
            .slice(0, maxItems);
    }
    
    /**
     * Create practice session with optimal item selection
     * @param {Array} allItems - All vocabulary items
     * @param {Object} options - Session options
     * @returns {Object} Practice session
     */
    createPracticeSession(allItems, options = {}) {
        const {
            maxItems = 20,
            learningMode = this.currentDirection,
            includeNew = true,
            targetLevel = null
        } = options;
        
        // Get due items first
        let dueItems = this.getDueItems(learningMode);
        
        // Filter by level if specified
        if (targetLevel) {
            const levelItems = allItems.filter(item => item.level === targetLevel);
            const levelIds = new Set(levelItems.map(item => item.id));
            dueItems = dueItems.filter(state => levelIds.has(state.itemId));
        }
        
        // Sort due items by priority (overdue first)
        dueItems.sort((a, b) => {
            const aOverdue = new Date() - new Date(a.nextReview);
            const bOverdue = new Date() - new Date(b.nextReview);
            return bOverdue - aOverdue;
        });
        
        let sessionItems = dueItems.slice(0, maxItems);
        
        // Fill remaining slots with new items if enabled
        if (includeNew && sessionItems.length < maxItems) {
            const newItems = this.getNewItems(
                allItems, 
                learningMode, 
                maxItems - sessionItems.length
            );
            
            // Create initial review states for new items
            newItems.forEach(item => {
                const state = this.initReviewState(item.id, learningMode);
                sessionItems.push(state);
            });
        }
        
        return {
            sessionId: this.generateSessionId(),
            learningMode,
            items: sessionItems,
            startTime: new Date(),
            targetLevel,
            maxItems
        };
    }
    
    /**
     * Record review result and update state
     * @param {string} itemId - Item identifier
     * @param {boolean} correct - Whether answer was correct
     * @param {Object} item - Vocabulary item data
     * @param {number} responseTime - Time taken to answer (ms)
     */
    recordReview(itemId, correct, item = null, responseTime = null) {
        let state = this.reviewStates[itemId];
        
        if (!state) {
            // Create new state if doesn't exist
            state = this.initReviewState(itemId, this.currentDirection);
        }
        
        // Calculate next review
        const updatedState = this.calculateNextReview(correct, state, item);
        
        // Add response time if provided
        if (responseTime !== null) {
            updatedState.lastResponseTime = responseTime;
        }
        
        // Save updated state
        this.reviewStates[itemId] = updatedState;
        this.saveReviewStates();
        
        return updatedState;
    }
    
    /**
     * Get statistics for learning progress
     * @param {string} learningMode - Learning direction
     * @returns {Object} Progress statistics
     */
    getProgressStats(learningMode = null) {
        const mode = learningMode || this.currentDirection;
        const states = Object.values(this.reviewStates);
        const modeStates = states.filter(state => 
            mode === 'both' || state.learningMode === mode
        );
        
        const totalItems = modeStates.length;
        const dueItems = this.getDueItems(mode).length;
        const masteredItems = modeStates.filter(state => 
            state.repetitions >= 3 && state.successRate >= 0.8
        ).length;
        
        const averageSuccessRate = totalItems > 0 
            ? modeStates.reduce((sum, state) => sum + state.successRate, 0) / totalItems
            : 0;
        
        return {
            totalItems,
            dueItems,
            masteredItems,
            averageSuccessRate,
            learningMode: mode,
            lastUpdated: new Date()
        };
    }
    
    /**
     * Load review states from localStorage
     * @returns {Object} Review states
     */
    loadReviewStates() {
        try {
            const stored = localStorage.getItem(this.storagePrefix + 'review_states');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to load review states:', error);
            return {};
        }
    }
    
    /**
     * Save review states to localStorage
     */
    saveReviewStates() {
        try {
            localStorage.setItem(
                this.storagePrefix + 'review_states', 
                JSON.stringify(this.reviewStates)
            );
        } catch (error) {
            console.warn('Failed to save review states:', error);
        }
    }
    
    /**
     * Export review data for backup
     * @returns {Object} Exportable review data
     */
    exportData() {
        return {
            reviewStates: this.reviewStates,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * Import review data from backup
     * @param {Object} data - Imported review data
     * @returns {boolean} Success status
     */
    importData(data) {
        try {
            if (data.reviewStates && typeof data.reviewStates === 'object') {
                this.reviewStates = data.reviewStates;
                this.saveReviewStates();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    /**
     * Generate unique session ID
     * @returns {string} Session identifier
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSpacedRepetition;
}

// Global availability for browser
if (typeof window !== 'undefined') {
    window.EnhancedSpacedRepetition = EnhancedSpacedRepetition;
}
