/**
 * @file unified-spaced-repetition.ts
 * @description Unified SM-2 spaced repetition with bidirectional support, 6-phase system, and legacy migration
 * @status ACTIVE
 * @replaces enhanced-spaced-repetition.js, spaced-repetition.js
 * @features
 *   - Direction-aware SM-2 (bg-de, de-bg with difficulty multipliers)
 *   - 6-phase learning progression system integrated with SM-2
 *   - Automatic migration from legacy schema (bgde:review:<id>) to enhanced (bgde:review_<id>_<direction>)
 *   - Phase tracking and progression based on ease factor
 *   - Backward-compatible state loading
 *   - Export/import with schema version tracking
 * @version 3.0.0
 * @updated November 2025
 */
import type { ReviewState, MigrationLogEntry, MigrationResults, ImportResults, DueItemsStats } from './types.js';
interface PhaseCalculator {
    calculatePhase(easeFactor: number, repetitions?: number): number;
    calculateNewPhase(currentPhase: number, quality: number, newEaseFactor: number, repetitions: number): number;
    getPhaseIntervalMultiplier(phase: number): number;
}
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
    /**
     * Detect reviews without phase field (v2 schema) and log migration opportunities
     */
    private detectPhaselessReviews;
    /**
     * Detect legacy localStorage keys and log migration opportunities
     */
    private detectLegacyData;
    /**
     * Initialize review state for a new vocabulary item
     * @param itemId - Unique identifier for the vocabulary item
     * @param direction - Learning direction ('bg-de' or 'de-bg')
     * @returns Initial review state
     */
    initReviewState(itemId: string, direction?: 'bg-de' | 'de-bg'): ReviewState;
    /**
     * Calculate next review using SM-2 algorithm with direction multipliers and phase tracking
     * @param state - Current review state
     * @param grade - Quality of response (0-5, where 3+ is correct)
     * @param direction - Learning direction (optional, uses state.direction if not provided)
     * @returns Updated review state
     */
    scheduleNext(state: ReviewState, grade: number, direction?: 'bg-de' | 'de-bg' | null): ReviewState;
    /**
     * Load review state with automatic legacy migration and phase auto-migration
     * @param itemId - Item identifier
     * @param direction - Learning direction
     * @returns Review state (migrated if necessary)
     */
    loadState(itemId: string, direction?: 'bg-de' | 'de-bg'): ReviewState;
    /**
     * Migrate legacy state to enhanced schema with phase calculation
     * @param legacyState - Legacy review state
     * @param itemId - Item ID
     * @param direction - Target direction
     * @returns Enhanced state with phase field
     */
    private migrateLegacyState;
    /**
     * Load data from localStorage with error handling
     * @param key - Storage key
     * @returns Parsed state or null
     */
    private loadFromStorage;
    /**
     * Save review state to localStorage with profile namespacing
     * @param state - Review state
     * @returns Success status
     */
    saveState(state: ReviewState): boolean;
    /**
     * Get all items due for review (profile-aware)
     * @param direction - Optional direction filter
     * @returns Array of due states
     */
    getDueItems(direction?: 'bg-de' | 'de-bg' | null): ReviewState[];
    /**
     * Get statistics for a specific direction or overall (profile-aware)
     * @param direction - Optional direction filter
     * @returns Statistics
     */
    getStats(direction?: 'bg-de' | 'de-bg' | null): DueItemsStats;
    /**
     * Batch migrate all legacy keys to enhanced format
     * @param defaultDirection - Default direction for migration ('bg-de' or 'de-bg')
     * @returns Migration results
     */
    migrateAllLegacy(defaultDirection?: 'bg-de' | 'de-bg'): MigrationResults;
    /**
     * Export all review data with schema version
     * @returns JSON string of all data
     */
    exportData(): string;
    /**
     * Import review data with schema validation
     * @param jsonData - JSON export string
     * @returns Import results
     */
    importData(jsonData: string): ImportResults;
    /**
     * Validate state object structure
     * @param state - State to validate
     * @returns Validation result
     */
    private validateState;
    /**
     * Get migration log
     * @returns Migration history
     */
    getMigrationLog(): MigrationLogEntry[];
}
export default UnifiedSpacedRepetition;
//# sourceMappingURL=unified-spaced-repetition.d.ts.map