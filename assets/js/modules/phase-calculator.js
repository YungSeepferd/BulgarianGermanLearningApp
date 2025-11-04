/**
 * Phase Calculator Module
 * Maps SM-2 ease factors to 6-phase learning progression system
 *
 * Phase System:
 * - Phase 1 (New): EF < 2.0 - Just introduced, frequent reviews
 * - Phase 2 (Learning): EF 2.0-2.2 - Building familiarity
 * - Phase 3 (Familiar): EF 2.2-2.4 - Recognizable but needs practice
 * - Phase 4 (Known): EF 2.4-2.6 - Comfortable recall
 * - Phase 5 (Mastered): EF 2.6-2.8 - Strong retention
 * - Phase 6 (Expert): EF 2.8-3.0 - Nearly perfect
 * - Learned: EF ≥ 3.0 - Long-term memory, periodic maintenance
 */

class PhaseCalculator {
  constructor() {
    // Phase thresholds based on ease factor
    this.PHASE_THRESHOLDS = {
      PHASE_1: { min: 0, max: 2.0, name: 'New', color: '#ef4444' },
      PHASE_2: { min: 2.0, max: 2.2, name: 'Learning', color: '#f97316' },
      PHASE_3: { min: 2.2, max: 2.4, name: 'Familiar', color: '#eab308' },
      PHASE_4: { min: 2.4, max: 2.6, name: 'Known', color: '#84cc16' },
      PHASE_5: { min: 2.6, max: 2.8, name: 'Mastered', color: '#22c55e' },
      PHASE_6: { min: 2.8, max: 3.0, name: 'Expert', color: '#10b981' },
      LEARNED: { min: 3.0, max: Infinity, name: 'Learned', color: '#06b6d4' }
    };

    // Minimum correct reviews required to advance from Phase 1
    this.MIN_REVIEWS_TO_ADVANCE = 3;

    // Learned status requires sustained high performance
    this.LEARNED_MIN_REPETITIONS = 5;
  }

  /**
   * Calculate current phase based on ease factor
   * @param {number} easeFactor - SM-2 ease factor (typically 1.3-3.0+)
   * @param {number} repetitions - Number of successful repetitions
   * @returns {number} Phase number (1-6) or 0 for "Learned"
   */
  calculatePhase(easeFactor, repetitions = 0) {
    // Ensure ease factor is within valid range
    const ef = Math.max(1.3, easeFactor);

    // Check if vocabulary has reached "Learned" status
    if (ef >= 3.0 && repetitions >= this.LEARNED_MIN_REPETITIONS) {
      return 0; // 0 represents "Learned" status
    }

    // Determine phase based on ease factor
    if (ef < 2.0) return 1;
    if (ef < 2.2) return 2;
    if (ef < 2.4) return 3;
    if (ef < 2.6) return 4;
    if (ef < 2.8) return 5;
    if (ef < 3.0) return 6;

    // If EF >= 3.0 but not enough repetitions, stay in Phase 6
    return 6;
  }

  /**
   * Get phase details including name, color, and thresholds
   * @param {number} phase - Phase number (0-6)
   * @returns {Object} Phase details
   */
  getPhaseDetails(phase) {
    switch (phase) {
      case 0:
        return this.PHASE_THRESHOLDS.LEARNED;
      case 1:
        return this.PHASE_THRESHOLDS.PHASE_1;
      case 2:
        return this.PHASE_THRESHOLDS.PHASE_2;
      case 3:
        return this.PHASE_THRESHOLDS.PHASE_3;
      case 4:
        return this.PHASE_THRESHOLDS.PHASE_4;
      case 5:
        return this.PHASE_THRESHOLDS.PHASE_5;
      case 6:
        return this.PHASE_THRESHOLDS.PHASE_6;
      default:
        return this.PHASE_THRESHOLDS.PHASE_1;
    }
  }

  /**
   * Calculate new phase after a review
   * @param {number} currentPhase - Current phase (0-6)
   * @param {number} quality - Review quality (0-5)
   * @param {number} newEaseFactor - Updated ease factor after review
   * @param {number} repetitions - Number of successful repetitions
   * @returns {number} New phase number
   */
  calculateNewPhase(currentPhase, quality, newEaseFactor, repetitions) {
    // If answer was incorrect (quality < 3), move back one phase
    if (quality < 3) {
      // Don't move below Phase 1
      return Math.max(1, currentPhase - 1);
    }

    // For correct answers, recalculate phase based on new ease factor
    const newPhase = this.calculatePhase(newEaseFactor, repetitions);

    // Prevent skipping phases - can only advance one phase at a time
    // Exception: Can jump to "Learned" (phase 0) from Phase 6
    if (newPhase === 0 && currentPhase === 6) {
      return 0;
    }

    // Otherwise, advance at most one phase
    if (newPhase > currentPhase) {
      return Math.min(newPhase, currentPhase + 1);
    }

    return newPhase;
  }

  /**
   * Check if vocabulary item can advance to next phase
   * @param {number} currentPhase - Current phase (1-6)
   * @param {number} repetitions - Number of successful repetitions
   * @param {number} easeFactor - Current ease factor
   * @returns {boolean} True if ready to advance
   */
  canAdvanceToNextPhase(currentPhase, repetitions, easeFactor) {
    // Already learned
    if (currentPhase === 0) {
      return false;
    }

    // Phase 1 requires minimum reviews before advancing
    if (currentPhase === 1 && repetitions < this.MIN_REVIEWS_TO_ADVANCE) {
      return false;
    }

    // Check if ease factor is high enough for next phase
    const nextPhaseThreshold = this.getPhaseDetails(currentPhase + 1).min;
    return easeFactor >= nextPhaseThreshold;
  }

  /**
   * Get progress within current phase (0-100%)
   * @param {number} phase - Current phase (1-6)
   * @param {number} easeFactor - Current ease factor
   * @returns {number} Progress percentage
   */
  getPhaseProgress(phase, easeFactor) {
    if (phase === 0) {
      return 100; // Learned items are 100% complete
    }

    const phaseDetails = this.getPhaseDetails(phase);
    const range = phaseDetails.max - phaseDetails.min;

    if (range === 0 || range === Infinity) {
      return 0;
    }

    const progress = (easeFactor - phaseDetails.min) / range;
    return Math.max(0, Math.min(100, progress * 100));
  }

  /**
   * Get all phase statistics for a collection of reviews
   * @param {Array} reviews - Array of review objects with easeFactor and phase
   * @returns {Object} Statistics by phase
   */
  getPhaseStatistics(reviews) {
    const stats = {
      learned: { count: 0, percentage: 0 },
      phase1: { count: 0, percentage: 0 },
      phase2: { count: 0, percentage: 0 },
      phase3: { count: 0, percentage: 0 },
      phase4: { count: 0, percentage: 0 },
      phase5: { count: 0, percentage: 0 },
      phase6: { count: 0, percentage: 0 },
      total: reviews.length
    };

    if (reviews.length === 0) {
      return stats;
    }

    // Count items in each phase
    reviews.forEach(review => {
      const phase = review.phase ?? this.calculatePhase(review.easeFactor || 2.5, review.repetitions || 0);

      switch (phase) {
        case 0:
          stats.learned.count++;
          break;
        case 1:
          stats.phase1.count++;
          break;
        case 2:
          stats.phase2.count++;
          break;
        case 3:
          stats.phase3.count++;
          break;
        case 4:
          stats.phase4.count++;
          break;
        case 5:
          stats.phase5.count++;
          break;
        case 6:
          stats.phase6.count++;
          break;
      }
    });

    // Calculate percentages
    Object.keys(stats).forEach(key => {
      if (key !== 'total' && stats[key].count !== undefined) {
        stats[key].percentage = ((stats[key].count / stats.total) * 100).toFixed(1);
      }
    });

    return stats;
  }

  /**
   * Get recommended review interval multiplier based on phase
   * Higher phases = longer intervals
   * @param {number} phase - Current phase (0-6)
   * @returns {number} Interval multiplier
   */
  getPhaseIntervalMultiplier(phase) {
    switch (phase) {
      case 0: // Learned - very long intervals
        return 3.0;
      case 6: // Expert - long intervals
        return 2.0;
      case 5: // Mastered - moderately long
        return 1.5;
      case 4: // Known - standard
        return 1.2;
      case 3: // Familiar - slightly increased
        return 1.0;
      case 2: // Learning - standard SM-2
        return 0.9;
      case 1: // New - shorter intervals for reinforcement
      default:
        return 0.8;
    }
  }

  /**
   * Determine if a learned item needs periodic review
   * Learned items should be reviewed periodically to maintain retention
   * @param {Date} lastReviewDate - Date of last review
   * @param {number} easeFactor - Current ease factor
   * @returns {boolean} True if review is needed
   */
  needsMaintenanceReview(lastReviewDate, easeFactor) {
    if (!lastReviewDate) {
      return true;
    }

    const daysSinceReview = (Date.now() - new Date(lastReviewDate).getTime()) / (1000 * 60 * 60 * 24);

    // Maintenance review intervals based on performance
    // Higher EF = longer maintenance intervals
    let maintenanceInterval = 90; // Default: 90 days

    if (easeFactor >= 3.5) {
      maintenanceInterval = 180; // 6 months for very strong retention
    } else if (easeFactor >= 3.2) {
      maintenanceInterval = 120; // 4 months
    }

    return daysSinceReview >= maintenanceInterval;
  }

  /**
   * Get phase name in multiple languages
   * @param {number} phase - Phase number (0-6)
   * @param {string} language - Language code ('en', 'de', 'bg')
   * @returns {string} Localized phase name
   */
  getPhaseName(phase, language = 'en') {
    const names = {
      0: {
        en: 'Learned',
        de: 'Gelernt',
        bg: 'Научен'
      },
      1: {
        en: 'New',
        de: 'Neu',
        bg: 'Нов'
      },
      2: {
        en: 'Learning',
        de: 'Lernen',
        bg: 'Учене'
      },
      3: {
        en: 'Familiar',
        de: 'Vertraut',
        bg: 'Познат'
      },
      4: {
        en: 'Known',
        de: 'Bekannt',
        bg: 'Известен'
      },
      5: {
        en: 'Mastered',
        de: 'Gemeistert',
        bg: 'Овладян'
      },
      6: {
        en: 'Expert',
        de: 'Experte',
        bg: 'Експерт'
      }
    };

    return names[phase]?.[language] || names[phase]?.en || 'Unknown';
  }

  /**
   * Get phase icon/emoji
   * @param {number} phase - Phase number (0-6)
   * @returns {string} Emoji representing the phase
   */
  getPhaseIcon(phase) {
    const icons = {
      0: '🎓', // Learned - graduation cap
      1: '🌱', // New - seedling
      2: '📖', // Learning - book
      3: '👁️', // Familiar - eye
      4: '✅', // Known - check mark
      5: '⭐', // Mastered - star
      6: '🏆'  // Expert - trophy
    };

    return icons[phase] || '❓';
  }
}

// Export as ES6 module
export default PhaseCalculator;
