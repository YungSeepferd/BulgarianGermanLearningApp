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
class UnifiedSpacedRepetition {
    constructor(phaseCalculator = null, profileManager = null) {
        this.storagePrefix = 'bgde:';
        this.schemaVersion = 3; // Incremented for phase system
        this.difficultyMultipliers = {
            'bg-de': 1.1, // Bulgarian to German
            'de-bg': 1.2 // German to Bulgarian (harder)
        };
        this.legacyKeyPattern = /^bgde:review:/; // Legacy format (no profile namespace)
        this.enhancedKeyPattern = /^bgde:review_(.+)_(bg-de|de-bg)$/; // Enhanced format (no profile namespace)
        this.profiledKeyPattern = /^bgde:([^:]+):review_(.+)_(bg-de|de-bg)$/; // Profile-namespaced format
        // Track migration status
        this.migrationLog = [];
        this.phaseCalculator = phaseCalculator;
        this.profileManager = profileManager;
        this.init();
    }
    init() {
        console.log('[UnifiedSR] Initialized unified spaced repetition system v3.0 with 6-phase progression');
        // Check for legacy data and offer migration
        this.detectLegacyData();
        // Check for reviews without phase field (schema v2 -> v3 migration)
        this.detectPhaselessReviews();
    }
    /**
     * Detect reviews without phase field (v2 schema) and log migration opportunities
     */
    detectPhaselessReviews() {
        const phaselessKeys = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && this.enhancedKeyPattern.test(key)) {
                    const data = this.loadFromStorage(key);
                    if (data && data.phase === undefined) {
                        phaselessKeys.push(key);
                    }
                }
            }
            if (phaselessKeys.length > 0) {
                console.log(`[UnifiedSR] Found ${phaselessKeys.length} reviews without phase field. Auto-migration will occur on next load.`);
            }
        }
        catch (error) {
            console.warn('[UnifiedSR] Failed to detect phaseless reviews:', error);
        }
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
        }
        catch (error) {
            console.warn('[UnifiedSR] Failed to detect legacy data:', error);
        }
    }
    /**
     * Initialize review state for a new vocabulary item
     * @param itemId - Unique identifier for the vocabulary item
     * @param direction - Learning direction ('bg-de' or 'de-bg')
     * @returns Initial review state
     */
    initReviewState(itemId, direction = 'bg-de') {
        const now = Date.now();
        // Calculate initial phase (should be Phase 1 for new items)
        const initialPhase = this.phaseCalculator
            ? this.phaseCalculator.calculatePhase(2.5, 0)
            : 1;
        return {
            itemId,
            direction,
            schemaVersion: this.schemaVersion,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            phase: initialPhase, // Phase tracking (1-6, or 0 for "Learned")
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
     * Calculate next review using SM-2 algorithm with direction multipliers and phase tracking
     * @param state - Current review state
     * @param grade - Quality of response (0-5, where 3+ is correct)
     * @param direction - Learning direction (optional, uses state.direction if not provided)
     * @returns Updated review state
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
        // Store current phase for phase progression calculation
        const currentPhase = updatedState.phase || 1;
        if (isCorrect) {
            updatedState.correctAnswers = (updatedState.correctAnswers || 0) + 1;
            updatedState.correctStreak = (updatedState.correctStreak || 0) + 1;
            // Calculate new ease factor using SM-2 formula
            const newEF = Math.max(1.3, updatedState.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
            updatedState.easeFactor = Math.round(newEF * 100) / 100;
            // Calculate interval based on repetition count
            if (updatedState.repetitions === 0) {
                updatedState.interval = 1;
            }
            else if (updatedState.repetitions === 1) {
                updatedState.interval = 6;
            }
            else {
                // Apply direction-specific difficulty multiplier
                const multiplier = this.difficultyMultipliers[activeDirection] || 1;
                updatedState.interval = Math.round(updatedState.interval * updatedState.easeFactor * multiplier);
            }
            updatedState.repetitions = (updatedState.repetitions || 0) + 1;
        }
        else {
            // Reset on incorrect answer
            updatedState.correctStreak = 0;
            updatedState.repetitions = 0;
            updatedState.interval = 1;
            // Reduce ease factor but keep minimum at 1.3
            updatedState.easeFactor = Math.max(1.3, updatedState.easeFactor - 0.2);
        }
        // Calculate next review date (interval is in days)
        updatedState.nextReview = now + (updatedState.interval * 24 * 60 * 60 * 1000);
        // Update phase based on new ease factor and repetitions
        if (this.phaseCalculator) {
            const newPhase = this.phaseCalculator.calculateNewPhase(currentPhase, grade, updatedState.easeFactor, updatedState.repetitions);
            updatedState.phase = newPhase;
            // Apply phase-based interval multiplier for learned items
            if (newPhase === 0) { // Learned status
                const phaseMultiplier = this.phaseCalculator.getPhaseIntervalMultiplier(0);
                updatedState.interval = Math.round(updatedState.interval * phaseMultiplier);
                updatedState.nextReview = now + (updatedState.interval * 24 * 60 * 60 * 1000);
            }
            // Log phase transitions
            if (newPhase !== currentPhase) {
                console.log(`[UnifiedSR] Phase transition: ${currentPhase} → ${newPhase} (EF: ${updatedState.easeFactor})`);
            }
        }
        else {
            // Fallback if no phase calculator
            updatedState.phase = currentPhase;
        }
        return updatedState;
    }
    /**
     * Load review state with automatic legacy migration and phase auto-migration
     * @param itemId - Item identifier
     * @param direction - Learning direction
     * @returns Review state (migrated if necessary)
     */
    loadState(itemId, direction = 'bg-de') {
        // Build base key
        const baseKey = `review_${itemId}_${direction}`;
        // Try profile-namespaced key first (if profileManager available)
        const profiledKey = this.profileManager
            ? this.profileManager.getNamespacedKey(baseKey)
            : `${this.storagePrefix}${baseKey}`;
        const profiledData = this.loadFromStorage(profiledKey);
        if (profiledData) {
            // Auto-migrate if phase field is missing (schema v2 -> v3)
            if (profiledData.phase === undefined && this.phaseCalculator) {
                profiledData.phase = this.phaseCalculator.calculatePhase(profiledData.easeFactor || 2.5, profiledData.repetitions || 0);
                profiledData.schemaVersion = this.schemaVersion;
                this.saveState(profiledData);
                console.log(`[UnifiedSR] Auto-migrated review ${itemId} to v3 with phase ${profiledData.phase}`);
            }
            return profiledData;
        }
        // Try non-profiled enhanced key for backward compatibility
        const enhancedKey = `${this.storagePrefix}review_${itemId}_${direction}`;
        const enhancedData = this.loadFromStorage(enhancedKey);
        if (enhancedData) {
            // Migrate to profile-namespaced storage if profileManager available
            if (this.profileManager) {
                console.log(`[UnifiedSR] Migrating ${itemId} to profile-namespaced storage`);
                enhancedData.schemaVersion = this.schemaVersion;
                // Add phase if missing
                if (enhancedData.phase === undefined && this.phaseCalculator) {
                    enhancedData.phase = this.phaseCalculator.calculatePhase(enhancedData.easeFactor || 2.5, enhancedData.repetitions || 0);
                }
                // Save to profile-namespaced key
                this.saveState(enhancedData);
                // Remove old non-profiled key
                localStorage.removeItem(enhancedKey);
            }
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
     * Migrate legacy state to enhanced schema with phase calculation
     * @param legacyState - Legacy review state
     * @param itemId - Item ID
     * @param direction - Target direction
     * @returns Enhanced state with phase field
     */
    migrateLegacyState(legacyState, itemId, direction) {
        const now = Date.now();
        const easeFactor = legacyState.easinessFactor || legacyState.easeFactor || 2.5;
        const repetitions = legacyState.repetitions || 0;
        // Calculate phase based on ease factor and repetitions
        const phase = this.phaseCalculator
            ? this.phaseCalculator.calculatePhase(easeFactor, repetitions)
            : 1; // Default to Phase 1 if no calculator
        return {
            itemId: itemId,
            direction: direction,
            schemaVersion: this.schemaVersion,
            interval: legacyState.interval || 1,
            easeFactor: easeFactor,
            repetitions: repetitions,
            phase: phase, // NEW: Include phase in migrated data
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
     * @param key - Storage key
     * @returns Parsed state or null
     */
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data)
                return null;
            const parsed = JSON.parse(data);
            // Validate basic structure
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
            return null;
        }
        catch (error) {
            console.warn(`[UnifiedSR] Failed to load state from ${key}:`, error);
            return null;
        }
    }
    /**
     * Save review state to localStorage with profile namespacing
     * @param state - Review state
     * @returns Success status
     */
    saveState(state) {
        if (!state || !state.itemId || !state.direction) {
            console.warn('[UnifiedSR] Cannot save invalid state:', state);
            return false;
        }
        try {
            // Build base key
            const baseKey = `review_${state.itemId}_${state.direction}`;
            // Use profile namespacing if profileManager is available
            const key = this.profileManager
                ? this.profileManager.getNamespacedKey(baseKey)
                : `${this.storagePrefix}${baseKey}`;
            const data = JSON.stringify(state);
            localStorage.setItem(key, data);
            return true;
        }
        catch (error) {
            console.error('[UnifiedSR] Failed to save state:', error);
            // Handle quota exceeded
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.warn('[UnifiedSR] Storage quota exceeded. Consider cleanup.');
            }
            return false;
        }
    }
    /**
     * Get all items due for review (profile-aware)
     * @param direction - Optional direction filter
     * @returns Array of due states
     */
    getDueItems(direction = null) {
        const now = Date.now();
        const dueStates = [];
        // Get current profile ID if profileManager available
        const currentProfileId = this.profileManager
            ? this.profileManager.getActiveProfileId()
            : null;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Check profile-namespaced keys
                if (key && this.profiledKeyPattern.test(key)) {
                    const match = key.match(this.profiledKeyPattern);
                    const keyProfileId = match ? match[1] : null;
                    // Skip if doesn't match current profile
                    if (currentProfileId && keyProfileId !== currentProfileId) {
                        continue;
                    }
                    const state = this.loadFromStorage(key);
                    if (state && state.nextReview <= now && // Apply direction filter if specified
                        (!direction || state.direction === direction)) {
                        dueStates.push(state);
                    }
                }
                else if (!this.profileManager && key && this.enhancedKeyPattern.test(key)) {
                    const state = this.loadFromStorage(key);
                    if (state && state.nextReview <= now && (!direction || state.direction === direction)) {
                        dueStates.push(state);
                    }
                }
            }
        }
        catch (error) {
            console.error('[UnifiedSR] Failed to get due items:', error);
        }
        return dueStates;
    }
    /**
     * Get statistics for a specific direction or overall (profile-aware)
     * @param direction - Optional direction filter
     * @returns Statistics
     */
    getStats(direction = null) {
        let total = 0;
        let due = 0;
        let totalEF = 0;
        let totalAccuracy = 0;
        let itemsWithReviews = 0;
        // Get current profile ID if profileManager available
        const currentProfileId = this.profileManager
            ? this.profileManager.getActiveProfileId()
            : null;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Check profile-namespaced keys
                if (key && this.profiledKeyPattern.test(key)) {
                    const match = key.match(this.profiledKeyPattern);
                    const keyProfileId = match ? match[1] : null;
                    // Skip if doesn't match current profile
                    if (currentProfileId && keyProfileId !== currentProfileId) {
                        continue;
                    }
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
                else if (!this.profileManager && key && this.enhancedKeyPattern.test(key)) {
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
        }
        catch (error) {
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
     * @param defaultDirection - Default direction for migration ('bg-de' or 'de-bg')
     * @returns Migration results
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
                }
                else {
                    results.failed++;
                }
            }
            this.migrationLog.push({
                timestamp: Date.now(),
                type: 'batch_migration',
                results
            });
        }
        catch (error) {
            console.error('[UnifiedSR] Batch migration failed:', error);
        }
        return results;
    }
    /**
     * Export all review data with schema version
     * @returns JSON string of all data
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
        }
        catch (error) {
            console.error('[UnifiedSR] Export failed:', error);
            return '{}';
        }
    }
    /**
     * Import review data with schema validation
     * @param jsonData - JSON export string
     * @returns Import results
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
            for (const [, state] of Object.entries(data.states)) {
                if (this.validateState(state)) {
                    if (this.saveState(state)) {
                        results.imported++;
                    }
                    else {
                        results.failed++;
                    }
                }
                else {
                    results.skipped++;
                }
            }
            console.log('[UnifiedSR] Import complete:', results);
        }
        catch (error) {
            console.error('[UnifiedSR] Import failed:', error);
            results.failed++;
        }
        return results;
    }
    /**
     * Validate state object structure
     * @param state - State to validate
     * @returns Validation result
     */
    validateState(state) {
        return !!(state &&
            typeof state === 'object' &&
            state.itemId &&
            state.direction &&
            typeof state.easeFactor === 'number' &&
            typeof state.interval === 'number');
    }
    /**
     * Get migration log
     * @returns Migration history
     */
    getMigrationLog() {
        return [...this.migrationLog];
    }
}
// Export class for use in bundled spaced-repetition-system.js
// No singleton initialization here - handled by bundled file
if (typeof window !== 'undefined') {
    window.UnifiedSpacedRepetition = UnifiedSpacedRepetition;
}
export default UnifiedSpacedRepetition;
//# sourceMappingURL=unified-spaced-repetition.js.map