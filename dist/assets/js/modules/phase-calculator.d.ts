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
declare class PhaseCalculator {
    private PHASE_THRESHOLDS;
    private MIN_REVIEWS_TO_ADVANCE;
    private LEARNED_MIN_REPETITIONS;
    /**
     * Calculate current phase based on ease factor
     * @param easeFactor - SM-2 ease factor (typically 1.3-3.0+)
     * @param repetitions - Number of successful repetitions
     * @returns Phase number (1-6) or 0 for "Learned"
     */
    calculatePhase(easeFactor: number, repetitions?: number): number;
    /**
     * Get phase details including name, color, and thresholds
     * @param phase - Phase number (0-6)
     * @returns Phase details
     */
    getPhaseDetails(phase: number): PhaseDetails;
    /**
     * Calculate new phase after a review
     * @param currentPhase - Current phase (0-6)
     * @param quality - Review quality (0-5)
     * @param newEaseFactor - Updated ease factor after review
     * @param repetitions - Number of successful repetitions
     * @returns New phase number
     */
    calculateNewPhase(currentPhase: number, quality: number, newEaseFactor: number, repetitions: number): number;
    /**
     * Check if vocabulary item can advance to next phase
     * @param currentPhase - Current phase (1-6)
     * @param repetitions - Number of successful repetitions
     * @param easeFactor - Current ease factor
     * @returns True if ready to advance
     */
    canAdvanceToNextPhase(currentPhase: number, repetitions: number, easeFactor: number): boolean;
    /**
     * Get progress within current phase (0-100%)
     * @param phase - Current phase (1-6)
     * @param easeFactor - Current ease factor
     * @returns Progress percentage
     */
    getPhaseProgress(phase: number, easeFactor: number): number;
    /**
     * Get all phase statistics for a collection of reviews
     * @param reviews - Array of review objects with easeFactor and phase
     * @returns Statistics by phase
     */
    getPhaseStatistics(reviews: ReviewState[]): PhaseStatistics;
    /**
     * Get recommended review interval multiplier based on phase
     * Higher phases = longer intervals
     * @param phase - Current phase (0-6)
     * @returns Interval multiplier
     */
    getPhaseIntervalMultiplier(phase: number): number;
    /**
     * Determine if a learned item needs periodic review
     * Learned items should be reviewed periodically to maintain retention
     * @param lastReviewDate - Date of last review
     * @param easeFactor - Current ease factor
     * @returns True if review is needed
     */
    needsMaintenanceReview(lastReviewDate: Date | string | number | null, easeFactor: number): boolean;
    /**
     * Get phase name in multiple languages
     * @param phase - Phase number (0-6)
     * @param language - Language code ('en', 'de', 'bg')
     * @returns Localized phase name
     */
    getPhaseName(phase: number, language?: 'en' | 'de' | 'bg'): string;
    /**
     * Get phase icon/emoji
     * @param phase - Phase number (0-6)
     * @returns Emoji representing the phase
     */
    getPhaseIcon(phase: number): string;
}
export default PhaseCalculator;
//# sourceMappingURL=phase-calculator.d.ts.map