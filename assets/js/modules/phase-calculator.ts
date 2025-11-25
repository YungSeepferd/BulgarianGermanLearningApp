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

import type { PhaseDetails, PhaseStatistics, ReviewState } from '../types.js';

class PhaseCalculator {
  // Phase thresholds based on ease factor
  private PHASE_THRESHOLDS: Record<string, PhaseDetails> = {
    PHASE_1: { min: 0, max: 2, name: 'New', color: '#ef4444' },
    PHASE_2: { min: 2, max: 2.2, name: 'Learning', color: '#f97316' },
    PHASE_3: { min: 2.2, max: 2.4, name: 'Familiar', color: '#eab308' },
    PHASE_4: { min: 2.4, max: 2.6, name: 'Known', color: '#84cc16' },
    PHASE_5: { min: 2.6, max: 2.8, name: 'Mastered', color: '#22c55e' },
    PHASE_6: { min: 2.8, max: 3, name: 'Expert', color: '#10b981' },
    LEARNED: { min: 3, max: Number.POSITIVE_INFINITY, name: 'Learned', color: '#06b6d4' }
  };

  // Minimum correct reviews required to advance from Phase 1
  private MIN_REVIEWS_TO_ADVANCE: number = 3;

  // Learned status requires sustained high performance
  private LEARNED_MIN_REPETITIONS: number = 5;

  /**
   * Calculate current phase based on ease factor
   * @param easeFactor - SM-2 ease factor (typically 1.3-3.0+)
   * @param repetitions - Number of successful repetitions
   * @returns Phase number (1-6) or 0 for "Learned"
   */
  calculatePhase(easeFactor: number, repetitions: number = 0): number {
    // Ensure ease factor is within valid range
    const ef = Math.max(1.3, easeFactor);

    // Check if vocabulary has reached "Learned" status
    if (ef >= 3 && repetitions >= this.LEARNED_MIN_REPETITIONS) {
      return 0; // 0 represents "Learned" status
    }

    // Determine phase based on ease factor
    if (ef < 2) return 1;
    if (ef < 2.2) return 2;
    if (ef < 2.4) return 3;
    if (ef < 2.6) return 4;
    if (ef < 2.8) return 5;
    if (ef < 3) return 6;

    // If EF >= 3.0 but not enough repetitions, stay in Phase 6
    return 6;
  }

  /**
   * Get phase details including name, color, and thresholds
   * @param phase - Phase number (0-6)
   * @returns Phase details
   */
  getPhaseDetails(phase: number): PhaseDetails {
    const phaseMap: Record<number, string> = {
      0: 'LEARNED',
      1: 'PHASE_1',
      2: 'PHASE_2',
      3: 'PHASE_3',
      4: 'PHASE_4',
      5: 'PHASE_5',
      6: 'PHASE_6'
    };
    
    const phaseKey = phaseMap[phase] || 'PHASE_1';
    return this.PHASE_THRESHOLDS[phaseKey]!;
  }

  /**
   * Calculate new phase after a review
   * @param currentPhase - Current phase (0-6)
   * @param quality - Review quality (0-5)
   * @param newEaseFactor - Updated ease factor after review
   * @param repetitions - Number of successful repetitions
   * @returns New phase number
   */
  calculateNewPhase(currentPhase: number, quality: number, newEaseFactor: number, repetitions: number): number {
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
   * @param currentPhase - Current phase (1-6)
   * @param repetitions - Number of successful repetitions
   * @param easeFactor - Current ease factor
   * @returns True if ready to advance
   */
  canAdvanceToNextPhase(currentPhase: number, repetitions: number, easeFactor: number): boolean {
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
   * @param phase - Current phase (1-6)
   * @param easeFactor - Current ease factor
   * @returns Progress percentage
   */
  getPhaseProgress(phase: number, easeFactor: number): number {
    if (phase === 0) {
      return 100; // Learned items are 100% complete
    }

    const phaseDetails = this.getPhaseDetails(phase);
    const range = phaseDetails.max - phaseDetails.min;

    if (range === 0 || range === Number.POSITIVE_INFINITY) {
      return 0;
    }

    const progress = (easeFactor - phaseDetails.min) / range;
    return Math.max(0, Math.min(100, progress * 100));
  }

  /**
   * Get all phase statistics for a collection of reviews
   * @param reviews - Array of review objects with easeFactor and phase
   * @returns Statistics by phase
   */
  getPhaseStatistics(reviews: ReviewState[]): PhaseStatistics {
    const stats: PhaseStatistics = {
      learned: { count: 0, percentage: '0' },
      phase1: { count: 0, percentage: '0' },
      phase2: { count: 0, percentage: '0' },
      phase3: { count: 0, percentage: '0' },
      phase4: { count: 0, percentage: '0' },
      phase5: { count: 0, percentage: '0' },
      phase6: { count: 0, percentage: '0' },
      total: reviews.length
    };

    if (reviews.length === 0) {
      return stats;
    }

    // Count items in each phase
    for (const review of reviews) {
      const phase = review.phase ?? this.calculatePhase(review.easeFactor || 2.5, review.repetitions || 0);

      switch (phase) {
      case 0: {
        stats.learned.count++;
      
        break;
      }
      case 1: {
        stats.phase1.count++;
      
        break;
      }
      case 2: {
        stats.phase2.count++;
      
        break;
      }
      case 3: {
        stats.phase3.count++;
      
        break;
      }
      case 4: {
        stats.phase4.count++;
      
        break;
      }
      case 5: {
        stats.phase5.count++;
      
        break;
      }
      case 6: {
        stats.phase6.count++;
      
        break;
      }
      // No default
      }
    }

    // Calculate percentages
    for (const key of Object.keys(stats)) {
      if (key !== 'total') {
        const phaseStat = stats[key as keyof PhaseStatistics];
        if (phaseStat && typeof phaseStat === 'object' && 'count' in phaseStat) {
          const phaseStatWithCount = phaseStat as { count: number; percentage: string };
          phaseStatWithCount.percentage = ((phaseStatWithCount.count / stats.total) * 100).toFixed(1);
        }
      }
    }

    return stats;
  }

  /**
   * Get recommended review interval multiplier based on phase
   * Higher phases = longer intervals
   * @param phase - Current phase (0-6)
   * @returns Interval multiplier
   */
  getPhaseIntervalMultiplier(phase: number): number {
    const multipliers: Record<number, number> = {
      0: 3, // Learned - very long intervals
      6: 2, // Expert - long intervals
      5: 1.5, // Mastered - moderately long
      4: 1.2, // Known - standard
      3: 1, // Familiar - slightly increased
      2: 0.9, // Learning - standard SM-2
      1: 0.8 // New - shorter intervals for reinforcement
    };
    
    return multipliers[phase] ?? 0.8;
  }

  /**
   * Determine if a learned item needs periodic review
   * Learned items should be reviewed periodically to maintain retention
   * @param lastReviewDate - Date of last review
   * @param easeFactor - Current ease factor
   * @returns True if review is needed
   */
  needsMaintenanceReview(lastReviewDate: Date | string | number | null, easeFactor: number): boolean {
    if (!lastReviewDate) {
      return true;
    }

    const lastReviewTime = typeof lastReviewDate === 'number' 
      ? lastReviewDate 
      : new Date(lastReviewDate).getTime();
    
    const daysSinceReview = (Date.now() - lastReviewTime) / (1000 * 60 * 60 * 24);

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
   * @param phase - Phase number (0-6)
   * @param language - Language code ('en', 'de', 'bg')
   * @returns Localized phase name
   */
  getPhaseName(phase: number, language: 'en' | 'de' | 'bg' = 'en'): string {
    const names: Record<number, Record<string, string>> = {
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
   * @param phase - Phase number (0-6)
   * @returns Emoji representing the phase
   */
  getPhaseIcon(phase: number): string {
    const icons: Record<number, string> = {
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