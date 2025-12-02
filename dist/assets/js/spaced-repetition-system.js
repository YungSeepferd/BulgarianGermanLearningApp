/**
 * @file spaced-repetition-system.ts
 * @description Bundled file containing PhaseCalculator and UnifiedSpacedRepetition with profile isolation
 * @version 3.1.0 - Added profile namespacing support
 * @updated November 2025
 */
// ============================================================================
// PHASE CALCULATOR
// ============================================================================
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
            PHASE_1: { min: 0, max: 2, name: 'New', color: '#ef4444' },
            PHASE_2: { min: 2, max: 2.2, name: 'Learning', color: '#f97316' },
            PHASE_3: { min: 2.2, max: 2.4, name: 'Familiar', color: '#eab308' },
            PHASE_4: { min: 2.4, max: 2.6, name: 'Known', color: '#84cc16' },
            PHASE_5: { min: 2.6, max: 2.8, name: 'Mastered', color: '#22c55e' },
            PHASE_6: { min: 2.8, max: 3, name: 'Expert', color: '#10b981' },
            LEARNED: { min: 3, max: Number.POSITIVE_INFINITY, name: 'Learned', color: '#06b6d4' }
        };
        // Minimum correct reviews required to advance from Phase 1
        this.MIN_REVIEWS_TO_ADVANCE = 3;
        // Learned status requires sustained high performance
        this.LEARNED_MIN_REPETITIONS = 5;
    }
    calculatePhase(easeFactor, repetitions = 0) {
        const ef = Math.max(1.3, easeFactor);
        if (ef >= 3 && repetitions >= this.LEARNED_MIN_REPETITIONS) {
            return 0; // Learned status
        }
        if (ef < 2)
            return 1;
        if (ef < 2.2)
            return 2;
        if (ef < 2.4)
            return 3;
        if (ef < 2.6)
            return 4;
        if (ef < 2.8)
            return 5;
        if (ef < 3)
            return 6;
        return 6;
    }
    getPhaseDetails(phase) {
        const phaseMap = {
            0: 'LEARNED',
            1: 'PHASE_1',
            2: 'PHASE_2',
            3: 'PHASE_3',
            4: 'PHASE_4',
            5: 'PHASE_5',
            6: 'PHASE_6'
        };
        const phaseKey = phaseMap[phase] || 'PHASE_1';
        return this.PHASE_THRESHOLDS[phaseKey];
    }
    calculateNewPhase(currentPhase, quality, newEaseFactor, repetitions) {
        if (quality < 3) {
            return Math.max(1, currentPhase - 1);
        }
        const newPhase = this.calculatePhase(newEaseFactor, repetitions);
        if (newPhase === 0 && currentPhase === 6) {
            return 0;
        }
        if (newPhase > currentPhase) {
            return Math.min(newPhase, currentPhase + 1);
        }
        return newPhase;
    }
    canAdvanceToNextPhase(currentPhase, repetitions, easeFactor) {
        if (currentPhase === 0) {
            return false;
        }
        if (currentPhase === 1 && repetitions < this.MIN_REVIEWS_TO_ADVANCE) {
            return false;
        }
        const nextPhaseThreshold = this.getPhaseDetails(currentPhase + 1).min;
        return easeFactor >= nextPhaseThreshold;
    }
    getPhaseProgress(phase, easeFactor) {
        if (phase === 0) {
            return 100;
        }
        const phaseDetails = this.getPhaseDetails(phase);
        const range = phaseDetails.max - phaseDetails.min;
        if (range === 0 || range === Number.POSITIVE_INFINITY) {
            return 0;
        }
        const progress = (easeFactor - phaseDetails.min) / range;
        return Math.max(0, Math.min(100, progress * 100));
    }
    getPhaseStatistics(reviews) {
        const stats = {
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
        for (const key of Object.keys(stats)) {
            if (key !== 'total' && stats[key]?.count !== undefined) {
                const statEntry = stats[key];
                if (statEntry) {
                    statEntry.percentage = ((statEntry.count / stats.total) * 100).toFixed(1);
                }
            }
        }
        return stats;
    }
    getPhaseIntervalMultiplier(phase) {
        const multipliers = {
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
    needsMaintenanceReview(lastReviewDate, easeFactor) {
        if (!lastReviewDate) {
            return true;
        }
        const lastReviewTime = typeof lastReviewDate === 'number'
            ? lastReviewDate
            : new Date(lastReviewDate).getTime();
        const daysSinceReview = (Date.now() - lastReviewTime) / (1000 * 60 * 60 * 24);
        let maintenanceInterval = 90;
        if (easeFactor >= 3.5) {
            maintenanceInterval = 180;
        }
        else if (easeFactor >= 3.2) {
            maintenanceInterval = 120;
        }
        return daysSinceReview >= maintenanceInterval;
    }
    getPhaseName(phase, language = 'en') {
        const names = {
            0: { en: 'Learned', de: 'Gelernt', bg: 'Научен' },
            1: { en: 'New', de: 'Neu', bg: 'Нов' },
            2: { en: 'Learning', de: 'Lernen', bg: 'Учене' },
            3: { en: 'Familiar', de: 'Vertraut', bg: 'Познат' },
            4: { en: 'Known', de: 'Bekannt', bg: 'Известен' },
            5: { en: 'Mastered', de: 'Gemeistert', bg: 'Овладян' },
            6: { en: 'Expert', de: 'Experte', bg: 'Експерт' }
        };
        return names[phase]?.[language] || names[phase]?.en || 'Unknown';
    }
    getPhaseIcon(phase) {
        const icons = {
            0: '🎓', 1: '🌱', 2: '📖', 3: '👁️',
            4: '✅', 5: '⭐', 6: '🏆'
        };
        return icons[phase] || '❓';
    }
}
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
        const profileStatus = this.profileManager ? 'with profile isolation' : 'without profile isolation';
        console.log(`[UnifiedSR] Initialized unified spaced repetition system v3.1 with 6-phase progression ${profileStatus}`);
        this.detectLegacyData();
        this.detectPhaselessReviews();
    }
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
    initReviewState(itemId, direction = 'bg-de') {
        const now = Date.now();
        const initialPhase = this.phaseCalculator ? this.phaseCalculator.calculatePhase(2.5, 0) : 1;
        return {
            itemId, direction,
            schemaVersion: this.schemaVersion,
            interval: 1, easeFactor: 2.5, repetitions: 0,
            phase: initialPhase,
            nextReview: now, lastReview: null,
            totalReviews: 0, correctAnswers: 0, correctStreak: 0,
            created: now, updated: now
        };
    }
    scheduleNext(state, grade, direction = null) {
        if (!state || grade < 0 || grade > 5) {
            throw new Error('Invalid review state or grade');
        }
        const now = Date.now();
        const updatedState = { ...state };
        const activeDirection = direction || state.direction || 'bg-de';
        updatedState.lastReview = now;
        updatedState.totalReviews = (updatedState.totalReviews || 0) + 1;
        updatedState.updated = now;
        updatedState.direction = activeDirection;
        updatedState.schemaVersion = this.schemaVersion;
        const isCorrect = grade >= 3;
        const currentPhase = updatedState.phase || 1;
        if (isCorrect) {
            updatedState.correctAnswers = (updatedState.correctAnswers || 0) + 1;
            updatedState.correctStreak = (updatedState.correctStreak || 0) + 1;
            const newEF = Math.max(1.3, updatedState.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
            updatedState.easeFactor = Math.round(newEF * 100) / 100;
            if (updatedState.repetitions === 0) {
                updatedState.interval = 1;
            }
            else if (updatedState.repetitions === 1) {
                updatedState.interval = 6;
            }
            else {
                const multiplier = this.difficultyMultipliers[activeDirection] || 1;
                updatedState.interval = Math.round(updatedState.interval * updatedState.easeFactor * multiplier);
            }
            updatedState.repetitions = (updatedState.repetitions || 0) + 1;
        }
        else {
            updatedState.correctStreak = 0;
            updatedState.repetitions = 0;
            updatedState.interval = 1;
            updatedState.easeFactor = Math.max(1.3, updatedState.easeFactor - 0.2);
        }
        updatedState.nextReview = now + (updatedState.interval * 24 * 60 * 60 * 1000);
        if (this.phaseCalculator) {
            const newPhase = this.phaseCalculator.calculateNewPhase(currentPhase, grade, updatedState.easeFactor, updatedState.repetitions);
            updatedState.phase = newPhase;
            if (newPhase === 0) {
                const phaseMultiplier = this.phaseCalculator.getPhaseIntervalMultiplier(0);
                updatedState.interval = Math.round(updatedState.interval * phaseMultiplier);
                updatedState.nextReview = now + (updatedState.interval * 24 * 60 * 60 * 1000);
            }
            if (newPhase !== currentPhase) {
                console.log(`[UnifiedSR] Phase transition: ${currentPhase} → ${newPhase} (EF: ${updatedState.easeFactor})`);
            }
        }
        else {
            updatedState.phase = currentPhase;
        }
        return updatedState;
    }
    loadState(itemId, direction = 'bg-de') {
        const baseKey = `review_${itemId}_${direction}`;
        const profiledKey = this.profileManager
            ? this.profileManager.getNamespacedKey(baseKey)
            : `${this.storagePrefix}${baseKey}`;
        const profiledData = this.loadFromStorage(profiledKey);
        if (profiledData) {
            if (profiledData.phase === undefined && this.phaseCalculator) {
                profiledData.phase = this.phaseCalculator.calculatePhase(profiledData.easeFactor || 2.5, profiledData.repetitions || 0);
                profiledData.schemaVersion = this.schemaVersion;
                this.saveState(profiledData);
                console.log(`[UnifiedSR] Auto-migrated review ${itemId} to v3 with phase ${profiledData.phase}`);
            }
            return profiledData;
        }
        const enhancedKey = `${this.storagePrefix}review_${itemId}_${direction}`;
        const enhancedData = this.loadFromStorage(enhancedKey);
        if (enhancedData) {
            if (this.profileManager) {
                console.log(`[UnifiedSR] Migrating ${itemId} to profile-namespaced storage`);
                enhancedData.schemaVersion = this.schemaVersion;
                if (enhancedData.phase === undefined && this.phaseCalculator) {
                    enhancedData.phase = this.phaseCalculator.calculatePhase(enhancedData.easeFactor || 2.5, enhancedData.repetitions || 0);
                }
                this.saveState(enhancedData);
                localStorage.removeItem(enhancedKey);
            }
            return enhancedData;
        }
        const legacyKey = `${this.storagePrefix}review:${itemId}`;
        const legacyData = this.loadFromStorage(legacyKey);
        if (legacyData) {
            console.log(`[UnifiedSR] Migrating legacy state for ${itemId}`);
            const migrated = this.migrateLegacyState(legacyData, itemId, direction);
            this.saveState(migrated);
            this.migrationLog.push({
                timestamp: Date.now(),
                type: 'migration',
                itemId, direction,
                from: 'legacy',
                to: 'enhanced'
            });
            return migrated;
        }
        return this.initReviewState(itemId, direction);
    }
    migrateLegacyState(legacyState, itemId, direction) {
        const now = Date.now();
        const easeFactor = legacyState.easinessFactor || legacyState.easeFactor || 2.5;
        const repetitions = legacyState.repetitions || 0;
        const phase = this.phaseCalculator ? this.phaseCalculator.calculatePhase(easeFactor, repetitions) : 1;
        return {
            itemId, direction,
            schemaVersion: this.schemaVersion,
            interval: legacyState.interval || 1,
            easeFactor, repetitions, phase,
            nextReview: legacyState.nextReviewDate ? new Date(legacyState.nextReviewDate).getTime() : now,
            lastReview: legacyState.lastReviewDate ? new Date(legacyState.lastReviewDate).getTime() : null,
            totalReviews: legacyState.totalReviews || 0,
            correctAnswers: legacyState.correctAnswers || 0,
            correctStreak: legacyState.streak || legacyState.correctStreak || 0,
            created: legacyState.created ? new Date(legacyState.created).getTime() : now,
            updated: now
        };
    }
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data)
                return null;
            const parsed = JSON.parse(data);
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
    saveState(state) {
        if (!state || !state.itemId || !state.direction) {
            console.warn('[UnifiedSR] Cannot save invalid state:', state);
            return false;
        }
        try {
            const baseKey = `review_${state.itemId}_${state.direction}`;
            const key = this.profileManager
                ? this.profileManager.getNamespacedKey(baseKey)
                : `${this.storagePrefix}${baseKey}`;
            const data = JSON.stringify(state);
            localStorage.setItem(key, data);
            return true;
        }
        catch (error) {
            console.error('[UnifiedSR] Failed to save state:', error);
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.warn('[UnifiedSR] Storage quota exceeded. Consider cleanup.');
            }
            return false;
        }
    }
    getDueItems(direction = null) {
        const now = Date.now();
        const dueStates = [];
        const currentProfileId = this.profileManager ? this.profileManager.getActiveProfileId() : null;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && this.profiledKeyPattern.test(key)) {
                    const match = key.match(this.profiledKeyPattern);
                    const keyProfileId = match ? match[1] : null;
                    if (currentProfileId && keyProfileId !== currentProfileId) {
                        continue;
                    }
                    const state = this.loadFromStorage(key);
                    if (state && state.nextReview <= now && (!direction || state.direction === direction)) {
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
    getStats(direction = null) {
        let total = 0, due = 0, totalEF = 0, totalAccuracy = 0, itemsWithReviews = 0;
        const currentProfileId = this.profileManager ? this.profileManager.getActiveProfileId() : null;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && this.profiledKeyPattern.test(key)) {
                    const match = key.match(this.profiledKeyPattern);
                    const keyProfileId = match ? match[1] : null;
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
            total, due,
            avgEaseFactor: total > 0 ? Math.round((totalEF / total) * 100) / 100 : 2.5,
            avgAccuracy: itemsWithReviews > 0 ? Math.round(totalAccuracy / itemsWithReviews) : 0,
            direction: direction || 'all'
        };
    }
    migrateAllLegacy(defaultDirection = 'bg-de') {
        const results = { migrated: 0, failed: 0, skipped: 0 };
        try {
            const legacyKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && this.legacyKeyPattern.test(key)) {
                    legacyKeys.push(key);
                }
            }
            for (const legacyKey of legacyKeys) {
                const itemId = legacyKey.replace(this.legacyKeyPattern, '');
                const legacyData = this.loadFromStorage(legacyKey);
                if (!legacyData) {
                    results.failed++;
                    continue;
                }
                const enhancedKey = `${this.storagePrefix}review_${itemId}_${defaultDirection}`;
                if (localStorage.getItem(enhancedKey)) {
                    results.skipped++;
                    continue;
                }
                const migrated = this.migrateLegacyState(legacyData, itemId, defaultDirection);
                if (this.saveState(migrated)) {
                    results.migrated++;
                    console.log(`[UnifiedSR] Migrated ${itemId} to enhanced schema`);
                }
                else {
                    results.failed++;
                }
            }
            this.migrationLog.push({ timestamp: Date.now(), type: 'batch_migration', results });
        }
        catch (error) {
            console.error('[UnifiedSR] Batch migration failed:', error);
        }
        return results;
    }
    exportData() {
        const exportData = { version: this.schemaVersion, exported: Date.now(), states: {} };
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
    importData(jsonData) {
        const results = { imported: 0, skipped: 0, failed: 0 };
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
    validateState(state) {
        return !!(state && typeof state === 'object' &&
            state.itemId && state.direction &&
            typeof state.easeFactor === 'number' &&
            typeof state.interval === 'number');
    }
    getMigrationLog() {
        return [...this.migrationLog];
    }
}
// ============================================================================
// INITIALIZATION
// ============================================================================
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.phaseCalculator = new PhaseCalculator();
        window.unifiedSpacedRepetition = new UnifiedSpacedRepetition(window.phaseCalculator, window.profileManager // Pass profileManager for data isolation
        );
        console.log('[SpacedRepetitionSystem] Initialized with 6-phase progression and profile isolation');
    });
}
else {
    window.phaseCalculator = new PhaseCalculator();
    window.unifiedSpacedRepetition = new UnifiedSpacedRepetition(window.phaseCalculator, window.profileManager // Pass profileManager for data isolation
    );
    console.log('[SpacedRepetitionSystem] Initialized with 6-phase progression and profile isolation');
}
export { PhaseCalculator, UnifiedSpacedRepetition };
//# sourceMappingURL=spaced-repetition-system.js.map