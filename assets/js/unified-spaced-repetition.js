/**
 * @file unified-spaced-repetition.js
 * @description Unified SM-2 spaced repetition with bidirectional support and legacy migration
 * @status ACTIVE
 * @replaces enhanced-spaced-repetition.js, spaced-repetition.js
 * @features
 *   - Direction-aware SM-2 (bg-de, de-bg with difficulty multipliers)
 *   - Automatic migration from legacy schema (bgde:review:<id>) to enhanced (bgde:review_<id>_<direction>)
 *   - Backward-compatible state loading
 *   - Export/import with schema version tracking
 * @version 2.0.0
 * @updated October 2025
 */

class UnifiedSpacedRepetition {
  constructor() {
    this.storagePrefix = 'bgde:';
    this.schemaVersion = 2; // Incremented for unified format
    this.difficultyMultipliers = {
      'bg-de': 1.1, // Bulgarian to German
      'de-bg': 1.2  // German to Bulgarian (harder)
    };
    this.legacyKeyPattern = /^bgde:review:/; // Legacy format
    this.enhancedKeyPattern = /^bgde:review_(.+)_(bg-de|de-bg)$/; // Enhanced format
    
    // Track migration status
    this.migrationLog = [];
    this.init();
  }

  init() {
    console.log('[UnifiedSR] Initialized unified spaced repetition system v2.0');
    
    // Check for legacy data and offer migration
    this.detectLegacyData();
  }

  /**
   * Detect legacy localStorage keys and log migration opportunities
   */
  detectLegacyData() {
    const legacyKeys = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.legacyKeyPattern.test(key)) {
          legacyKeys.push(key);
        }
      }
      
      if (legacyKeys.length > 0) {
        console.log(`[UnifiedSR] Found ${legacyKeys.length} legacy review states. Migration available.`);
        this.migrationLog.push({
          timestamp: Date.now(),
          type: 'detection',
          count: legacyKeys.length
        });
      }
    } catch (error) {
      console.warn('[UnifiedSR] Failed to detect legacy data:', error);
    }
  }

  /**
   * Initialize review state for a new vocabulary item
   * @param {string} itemId - Unique identifier for the vocabulary item
   * @param {string} direction - Learning direction ('bg-de' or 'de-bg')
   * @returns {Object} Initial review state
   */
  initReviewState(itemId, direction = 'bg-de') {
    const now = Date.now();
    
    return {
      itemId,
      direction,
      schemaVersion: this.schemaVersion,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: now,
      lastReview: null,
      totalReviews: 0,
      correctAnswers: 0,
      correctStreak: 0,
      created: now,
      updated: now
    };
  }

  /**
   * Calculate next review using SM-2 algorithm with direction multipliers
   * @param {Object} state - Current review state
   * @param {number} grade - Quality of response (0-5, where 3+ is correct)
   * @param {string} direction - Learning direction (optional, uses state.direction if not provided)
   * @returns {Object} Updated review state
   */
  scheduleNext(state, grade, direction = null) {
    if (!state || grade < 0 || grade > 5) {
      throw new Error('Invalid review state or grade');
    }

    const now = Date.now();
    const updatedState = { ...state };
    const activeDirection = direction || state.direction || 'bg-de';
    
    // Update metadata
    updatedState.lastReview = now;
    updatedState.totalReviews = (updatedState.totalReviews || 0) + 1;
    updatedState.updated = now;
    updatedState.direction = activeDirection;
    updatedState.schemaVersion = this.schemaVersion;
    
    // Determine if response is correct (grade 3+)
    const isCorrect = grade >= 3;
    
    if (isCorrect) {
      updatedState.correctAnswers = (updatedState.correctAnswers || 0) + 1;
      updatedState.correctStreak = (updatedState.correctStreak || 0) + 1;
      
      // Calculate new ease factor using SM-2 formula
      const newEF = Math.max(1.3, 
        updatedState.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
      );
      updatedState.easeFactor = Math.round(newEF * 100) / 100;
      
      // Calculate interval based on repetition count
      if (updatedState.repetitions === 0) {
        updatedState.interval = 1;
      } else if (updatedState.repetitions === 1) {
        updatedState.interval = 6;
      } else {
        // Apply direction-specific difficulty multiplier
        const multiplier = this.difficultyMultipliers[activeDirection] || 1.0;
        updatedState.interval = Math.round(updatedState.interval * updatedState.easeFactor * multiplier);
      }
      
      updatedState.repetitions = (updatedState.repetitions || 0) + 1;
      
    } else {
      // Reset on incorrect answer
      updatedState.correctStreak = 0;
      updatedState.repetitions = 0;
      updatedState.interval = 1;
      // Reduce ease factor but keep minimum at 1.3
      updatedState.easeFactor = Math.max(1.3, updatedState.easeFactor - 0.2);
    }
    
    // Calculate next review date (interval is in days)
    updatedState.nextReview = now + (updatedState.interval * 24 * 60 * 60 * 1000);
    
    return updatedState;
  }

  /**
   * Load review state with automatic legacy migration
   * @param {string} itemId - Item identifier
   * @param {string} direction - Learning direction
   * @returns {Object} Review state (migrated if necessary)
   */
  loadState(itemId, direction = 'bg-de') {
    // Try enhanced key first
    const enhancedKey = `${this.storagePrefix}review_${itemId}_${direction}`;
    const enhancedData = this.loadFromStorage(enhancedKey);
    
    if (enhancedData) {
      return enhancedData;
    }
    
    // Try legacy key and migrate if found
    const legacyKey = `${this.storagePrefix}review:${itemId}`;
    const legacyData = this.loadFromStorage(legacyKey);
    
    if (legacyData) {
      console.log(`[UnifiedSR] Migrating legacy state for ${itemId}`);
      const migrated = this.migrateLegacyState(legacyData, itemId, direction);
      this.saveState(migrated);
      
      // Log migration
      this.migrationLog.push({
        timestamp: Date.now(),
        type: 'migration',
        itemId,
        direction,
        from: 'legacy',
        to: 'enhanced'
      });
      
      return migrated;
    }
    
    // No existing state, return initialized state
    return this.initReviewState(itemId, direction);
  }

  /**
   * Migrate legacy state to enhanced schema
   * @param {Object} legacyState - Legacy review state
   * @param {string} itemId - Item ID
   * @param {string} direction - Target direction
   * @returns {Object} Enhanced state
   */
  migrateLegacyState(legacyState, itemId, direction) {
    const now = Date.now();
    
    return {
      itemId: itemId,
      direction: direction,
      schemaVersion: this.schemaVersion,
      interval: legacyState.interval || 1,
      easeFactor: legacyState.easinessFactor || legacyState.easeFactor || 2.5,
      repetitions: legacyState.repetitions || 0,
      nextReview: legacyState.nextReviewDate ? new Date(legacyState.nextReviewDate).getTime() : now,
      lastReview: legacyState.lastReviewDate ? new Date(legacyState.lastReviewDate).getTime() : null,
      totalReviews: legacyState.totalReviews || 0,
      correctAnswers: legacyState.correctAnswers || 0,
      correctStreak: legacyState.streak || legacyState.correctStreak || 0,
      created: legacyState.created ? new Date(legacyState.created).getTime() : now,
      updated: now
    };
  }

  /**
   * Load data from localStorage with error handling
   * @param {string} key - Storage key
   * @returns {Object|null} Parsed state or null
   */
  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // Validate basic structure
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.warn(`[UnifiedSR] Failed to load state from ${key}:`, error);
      return null;
    }
  }

  /**
   * Save review state to localStorage
   * @param {Object} state - Review state
   * @returns {boolean} Success status
   */
  saveState(state) {
    if (!state || !state.itemId || !state.direction) {
      console.warn('[UnifiedSR] Cannot save invalid state:', state);
      return false;
    }
    
    try {
      const key = `${this.storagePrefix}review_${state.itemId}_${state.direction}`;
      const data = JSON.stringify(state);
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.error('[UnifiedSR] Failed to save state:', error);
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('[UnifiedSR] Storage quota exceeded. Consider cleanup.');
      }
      
      return false;
    }
  }

  /**
   * Get all items due for review
   * @param {string} direction - Optional direction filter
   * @returns {Array} Array of due states
   */
  getDueItems(direction = null) {
    const now = Date.now();
    const dueStates = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check enhanced keys
        if (key && this.enhancedKeyPattern.test(key)) {
          const state = this.loadFromStorage(key);
          
          if (state && state.nextReview <= now) {
            // Apply direction filter if specified
            if (!direction || state.direction === direction) {
              dueStates.push(state);
            }
          }
        }
      }
    } catch (error) {
      console.error('[UnifiedSR] Failed to get due items:', error);
    }
    
    return dueStates;
  }

  /**
   * Get statistics for a specific direction or overall
   * @param {string} direction - Optional direction filter
   * @returns {Object} Statistics
   */
  getStats(direction = null) {
    let total = 0;
    let due = 0;
    let totalEF = 0;
    let totalAccuracy = 0;
    let itemsWithReviews = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && this.enhancedKeyPattern.test(key)) {
          const state = this.loadFromStorage(key);
          
          if (state && (!direction || state.direction === direction)) {
            total++;
            totalEF += state.easeFactor || 2.5;
            
            if (state.nextReview <= Date.now()) {
              due++;
            }
            
            if (state.totalReviews > 0) {
              itemsWithReviews++;
              totalAccuracy += (state.correctAnswers / state.totalReviews) * 100;
            }
          }
        }
      }
    } catch (error) {
      console.error('[UnifiedSR] Failed to calculate stats:', error);
    }
    
    return {
      total,
      due,
      avgEaseFactor: total > 0 ? Math.round((totalEF / total) * 100) / 100 : 2.5,
      avgAccuracy: itemsWithReviews > 0 ? Math.round(totalAccuracy / itemsWithReviews) : 0,
      direction: direction || 'all'
    };
  }

  /**
   * Batch migrate all legacy keys to enhanced format
   * @param {string} defaultDirection - Default direction for migration ('bg-de' or 'de-bg')
   * @returns {Object} Migration results
   */
  migrateAllLegacy(defaultDirection = 'bg-de') {
    const results = {
      migrated: 0,
      failed: 0,
      skipped: 0
    };
    
    try {
      const legacyKeys = [];
      
      // Collect all legacy keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.legacyKeyPattern.test(key)) {
          legacyKeys.push(key);
        }
      }
      
      // Migrate each legacy key
      for (const legacyKey of legacyKeys) {
        const itemId = legacyKey.replace(this.legacyKeyPattern, '');
        const legacyData = this.loadFromStorage(legacyKey);
        
        if (!legacyData) {
          results.failed++;
          continue;
        }
        
        // Check if enhanced version already exists
        const enhancedKey = `${this.storagePrefix}review_${itemId}_${defaultDirection}`;
        if (localStorage.getItem(enhancedKey)) {
          results.skipped++;
          continue;
        }
        
        // Migrate
        const migrated = this.migrateLegacyState(legacyData, itemId, defaultDirection);
        if (this.saveState(migrated)) {
          results.migrated++;
          console.log(`[UnifiedSR] Migrated ${itemId} to enhanced schema`);
        } else {
          results.failed++;
        }
      }
      
      this.migrationLog.push({
        timestamp: Date.now(),
        type: 'batch_migration',
        results
      });
      
    } catch (error) {
      console.error('[UnifiedSR] Batch migration failed:', error);
    }
    
    return results;
  }

  /**
   * Export all review data with schema version
   * @returns {string} JSON string of all data
   */
  exportData() {
    const exportData = {
      version: this.schemaVersion,
      exported: Date.now(),
      states: {}
    };
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && this.enhancedKeyPattern.test(key)) {
          const state = this.loadFromStorage(key);
          if (state) {
            exportData.states[key] = state;
          }
        }
      }
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('[UnifiedSR] Export failed:', error);
      return '{}';
    }
  }

  /**
   * Import review data with schema validation
   * @param {string} jsonData - JSON export string
   * @returns {Object} Import results
   */
  importData(jsonData) {
    const results = {
      imported: 0,
      skipped: 0,
      failed: 0
    };
    
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.states || typeof data.states !== 'object') {
        throw new Error('Invalid export format');
      }
      
      for (const [key, state] of Object.entries(data.states)) {
        if (this.validateState(state)) {
          if (this.saveState(state)) {
            results.imported++;
          } else {
            results.failed++;
          }
        } else {
          results.skipped++;
        }
      }
      
      console.log(`[UnifiedSR] Import complete:`, results);
    } catch (error) {
      console.error('[UnifiedSR] Import failed:', error);
      results.failed++;
    }
    
    return results;
  }

  /**
   * Validate state object structure
   * @param {Object} state - State to validate
   * @returns {boolean} Validation result
   */
  validateState(state) {
    return !!(
      state &&
      typeof state === 'object' &&
      state.itemId &&
      state.direction &&
      typeof state.easeFactor === 'number' &&
      typeof state.interval === 'number'
    );
  }

  /**
   * Get migration log
   * @returns {Array} Migration history
   */
  getMigrationLog() {
    return [...this.migrationLog];
  }
}

// Create singleton instance and expose globally
const unifiedSpacedRepetition = new UnifiedSpacedRepetition();

// Global access
if (typeof window !== 'undefined') {
  window.UnifiedSpacedRepetition = UnifiedSpacedRepetition;
  window.unifiedSpacedRepetition = unifiedSpacedRepetition;
}
