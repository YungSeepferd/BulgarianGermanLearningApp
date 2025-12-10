import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { diContainer } from '../services/di-container';
import { EventBus, EventTypes } from '../services/event-bus';
import { StateError, StorageError, ErrorHandler } from '../services/errors';
import { calculateLevel, calculateXPForLevel } from '../schemas/progress';

const DAILY_XP_TARGET = 50;
const XP_PER_WORD = 10;

export class LearningSession {
    // Session State with proper typing
    isActive = $state<boolean>(false);
    currentStreak = $state<number>(0);
    sessionXP = $state<number>(0);
    dailyXP = $state<number>(0);
    lastPracticeDate = $state<string | null>(null);

    // Gamification
    dailyTarget = DAILY_XP_TARGET;

    // Reference to ProgressService for total XP
    private progressService = diContainer.getService('progressService');
    private xpEventUnsubscribe: (() => void) | null = null;

    // Level System (Derived) with memoization
    level = $derived.by(() => calculateLevel(this.getTotalXP()));
    nextLevelXP = $derived.by(() => calculateXPForLevel(this.level + 1));
    currentLevelStartXP = $derived.by(() => calculateXPForLevel(this.level));

    levelProgress = $derived.by(() => {
        const totalXP = this.getTotalXP();
        const xpInLevel = totalXP - this.currentLevelStartXP;
        const levelSpan = this.nextLevelXP - this.currentLevelStartXP;

        // Ensure we don't divide by zero and return a valid percentage
        if (levelSpan <= 0) return 0;
        return Math.min(100, Math.max(0, (xpInLevel / levelSpan) * 100));
    });

    progressPercentage = $derived.by(() => {
        // Ensure we don't divide by zero
        if (this.dailyTarget <= 0) return 0;
        return Math.min(100, (this.dailyXP / this.dailyTarget) * 100);
    });
    isDailyGoalReached = $derived(this.dailyXP >= this.dailyTarget);

    constructor() {
        if (browser) {
            this.loadState();
        }

        // Subscribe to XP events with proper typing
        const eventBus = diContainer.getService<EventBus>('eventBus');
        this.xpEventUnsubscribe = eventBus.subscribe(EventTypes.XP_EARNED, (event: { amount: number }) => {
            this.handleXPEarned(event.amount);
        });

        // Initialize derived values with cleanup
        $effect(() => {
            // This effect ensures derived values are calculated on initialization
            this.level;
            this.nextLevelXP;
            this.currentLevelStartXP;
            this.levelProgress;
            this.progressPercentage;
            this.isDailyGoalReached;

            // Return cleanup function
            return () => {
                // Cleanup any resources if needed
            };
        });
    }

    startSession() {
        this.isActive = true;
        this.sessionXP = 0;
        this.checkStreak();
    }

    endSession() {
        this.isActive = false;
        this.saveState();
    }

    /**
     * Award XP for the current session
     * @param amount Amount of XP to award (default: XP_PER_WORD)
     * @returns boolean indicating if a level up occurred
     * @throws StateError if the amount is invalid
     */
    awardXP(amount: number = XP_PER_WORD): boolean {
        // Validate input
        if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
            throw new StateError('Invalid XP amount', { amount });
        }

        this.sessionXP += amount;
        this.dailyXP += amount;
        this.saveState();
        return false; // Level up is now handled by event listeners
    }

    /**
     * Calculate the current level based on total XP
     * @param xp Total XP
     * @returns Current level
     */
    private calculateLevel(xp: number): number {
        return calculateLevel(xp);
    }

    /**
     * Handle XP earned event from ProgressService
     * @param amount Amount of XP earned
     */
    private handleXPEarned(amount: number) {
        // Reset daily XP if it's a new day
        this.checkStreak();

        // The actual XP tracking is handled by ProgressService
        // We just need to update our derived state
    }

    /**
     * Get the total XP from ProgressService
     * @returns Total XP
     */
    getTotalXP(): number {
        try {
            const progressData = this.progressService.getProgressData();
            return progressData.overallProgress.totalXP;
        } catch (error) {
            console.error('Failed to get total XP from ProgressService:', error);
            return 0;
        }
    }

    /**
     * Check and update streak information
     * @throws StateError if date operations fail
     */
    private checkStreak(): void {
        try {
            const today = new Date().toISOString().split('T')[0];

            if (!today) {
                throw new Error('Failed to get current date');
            }

            if (this.lastPracticeDate === today) return; // Already practiced today

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (!yesterdayStr) {
                throw new Error('Failed to get yesterday date');
            }

            if (this.lastPracticeDate === yesterdayStr) {
                // Continued streak
                this.currentStreak++;
            } else if (this.lastPracticeDate && this.lastPracticeDate < yesterdayStr) {
                // Streak broken
                this.currentStreak = 1;
            } else {
                // First time or fresh start
                if (this.currentStreak === 0) this.currentStreak = 1;
            }

            this.lastPracticeDate = today;
            this.saveState();
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to check streak');
            throw new StateError('Failed to check streak', { error });
        }
    }

    // Persistence
    /**
     * Load the session state from localStorage
     * @throws StorageError if loading fails
     */
    private loadState(): void {
        if (!browser) return;

        try {
            const saved = localStorage.getItem('learning-session');
            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate and set state with proper typing
                this.currentStreak = typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0;
                this.lastPracticeDate = typeof parsed.lastPracticeDate === 'string' ? parsed.lastPracticeDate : null;
                this.dailyXP = typeof parsed.dailyXP === 'number' ? parsed.dailyXP : 0;

                // Reset daily XP if it's a new day
                const today = new Date().toISOString().split('T')[0];
                if (parsed.lastPracticeDate !== today) {
                    this.dailyXP = 0;
                }
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to load learning session state');
            // Re-throw to allow application to handle initialization failure
            throw new StorageError('Failed to load learning session state', {
                error,
                hasSavedData: saved !== null
            });
        }
    }

    /**
     * Save the current session state to localStorage
     * @throws StorageError if saving fails
     */
    private saveState(): void {
        if (!browser) return;
        try {
            // Validate state before saving
            if (typeof this.currentStreak !== 'number' || typeof this.dailyXP !== 'number') {
                throw new Error('Invalid session state: numbers expected');
            }

            localStorage.setItem('learning-session', JSON.stringify({
                currentStreak: this.currentStreak,
                dailyXP: this.dailyXP,
                lastPracticeDate: this.lastPracticeDate
            }));
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to save learning session state');
            throw new StorageError('Failed to save learning session state', {
                error,
                currentStreakType: typeof this.currentStreak,
                dailyXPType: typeof this.dailyXP,
                lastPracticeDateType: typeof this.lastPracticeDate
            });
        }
    }
}

    destroy(): void {
        Debug.log('LearningSession', 'Destroying LearningSession, cleaning up resources');
        if (this.xpEventUnsubscribe) {
            this.xpEventUnsubscribe();
            this.xpEventUnsubscribe = null;
        }
    }

// Create singleton instance
export const learningSession = new LearningSession();

// Add cleanup for application shutdown
if (browser) {
    window.addEventListener('beforeunload', () => {
        learningSession.destroy();
    });
}