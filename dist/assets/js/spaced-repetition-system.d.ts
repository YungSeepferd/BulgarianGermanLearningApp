/**
 * @file spaced-repetition-system.ts
 * @description Bundled file containing PhaseCalculator and UnifiedSpacedRepetition with profile isolation
 * @version 3.1.0 - Added profile namespacing support
 * @updated November 2025
 */
import type { ReviewState, MigrationLogEntry, MigrationResults, ImportResults, DueItemsStats, PhaseDetails, PhaseStatistics } from './types.js';
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
declare class PhaseCalculator {
    private PHASE_THRESHOLDS;
    private MIN_REVIEWS_TO_ADVANCE;
    private LEARNED_MIN_REPETITIONS;
    calculatePhase(easeFactor: number, repetitions?: number): number;
    getPhaseDetails(phase: number): PhaseDetails;
    calculateNewPhase(currentPhase: number, quality: number, newEaseFactor: number, repetitions: number): number;
    canAdvanceToNextPhase(currentPhase: number, repetitions: number, easeFactor: number): boolean;
    getPhaseProgress(phase: number, easeFactor: number): number;
    getPhaseStatistics(reviews: ReviewState[]): PhaseStatistics;
    getPhaseIntervalMultiplier(phase: number): number;
    needsMaintenanceReview(lastReviewDate: Date | string | number | null, easeFactor: number): boolean;
    getPhaseName(phase: number, language?: 'en' | 'de' | 'bg'): string;
    getPhaseIcon(phase: number): string;
}
/**
 * @file unified-spaced-repetition.ts
 * @description Unified SM-2 spaced repetition with bidirectional support, 6-phase system, profile isolation, and legacy migration
 * @status ACTIVE
 * @features
 *   - Direction-aware SM-2 (bg-de, de-bg with difficulty multipliers)
 *   - 6-phase learning progression system integrated with SM-2
 *   - Profile-isolated data storage (dual profile support)
 *   - Automatic migration from non-profiled to profile-namespaced storage
 *   - Automatic migration from legacy schema to enhanced schema
 *   - Phase tracking and progression based on ease factor
 *   - Backward-compatible state loading
 *   - Export/import with schema version tracking
 * @version 3.1.0 - Added profile isolation
 * @updated November 2025
 */
interface ProfileManager {
    getNamespacedKey(key: string, profileId?: string | null): string;
    getActiveProfileId(): string;
}
declare class UnifiedSpacedRepetition {
    private storagePrefix;
    private schemaVersion;
    private difficultyMultipliers;
    private legacyKeyPattern;
    private enhancedKeyPattern;
    private profiledKeyPattern;
    private phaseCalculator;
    private profileManager;
    private migrationLog;
    constructor(phaseCalculator?: PhaseCalculator | null, profileManager?: ProfileManager | null);
    private init;
    private detectPhaselessReviews;
    private detectLegacyData;
    initReviewState(itemId: string, direction?: 'bg-de' | 'de-bg'): ReviewState;
    scheduleNext(state: ReviewState, grade: number, direction?: 'bg-de' | 'de-bg' | null): ReviewState;
    loadState(itemId: string, direction?: 'bg-de' | 'de-bg'): ReviewState;
    private migrateLegacyState;
    private loadFromStorage;
    saveState(state: ReviewState): boolean;
    getDueItems(direction?: 'bg-de' | 'de-bg' | null): ReviewState[];
    getStats(direction?: 'bg-de' | 'de-bg' | null): DueItemsStats;
    migrateAllLegacy(defaultDirection?: 'bg-de' | 'de-bg'): MigrationResults;
    exportData(): string;
    importData(jsonData: string): ImportResults;
    private validateState;
    getMigrationLog(): MigrationLogEntry[];
}
export { PhaseCalculator, UnifiedSpacedRepetition };
//# sourceMappingURL=spaced-repetition-system.d.ts.map