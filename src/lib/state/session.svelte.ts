import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { EventBus, EventTypes, type XPEvent, type LevelUpEvent } from '../services/event-bus';
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
    totalXP = $state<number>(0); // Track total XP from events

    // Gamification
    dailyTarget = DAILY_XP_TARGET;

    // Event handling
    private eventBus: EventBus;
    private xpEventUnsubscribe: (() => void) | null = null;
    private levelUpEventUnsubscribe: (() => void) | null = null;

    // Level System (Derived) with memoization
    level = $derived.by(() => calculateLevel(this.totalXP));
    nextLevelXP = $derived.by(() => calculateXPForLevel(this.level + 1));
    currentLevelStartXP = $derived.by(() => calculateXPForLevel(this.level));

    levelProgress = $derived.by(() => {
        const xpInLevel = this.totalXP - this.currentLevelStartXP;
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

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;

        if (browser) {
            this.loadState();
        }

        // Subscribe to XP events with proper typing
        this.xpEventUnsubscribe = eventBus.subscribe(EventTypes.XP_EARNED, (event: XPEvent) => {
            this.handleXPEarned(event);
        });

        // Subscribe to level up events
        this.levelUpEventUnsubscribe = eventBus.subscribe(EventTypes.LEVEL_UP, (event: LevelUpEvent) => {
            this.handleLevelUp(event);
        });

        // Initialize derived values - no effect needed for derived values
        // Derived values are automatically calculated when accessed
        this.level;
        this.nextLevelXP;
        this.currentLevelStartXP;
        this.levelProgress;
        this.progressPercentage;
        this.isDailyGoalReached;
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

        // Emit XP earned event
        this.eventBus.emit(EventTypes.XP_EARNED, {
            amount,
            reason: 'Session activity',
            timestamp: new Date()
        } as XPEvent);

        this.saveState();
        return false;
    }

    /**
     * Handle XP earned event from ProgressService
     * @param event XP event containing amount and metadata
     */
    private handleXPEarned(event: XPEvent) {
        // Update our total XP tracking
        this.totalXP += event.amount;

        // Reset daily XP if it's a new day
        this.checkStreak();

        this.saveState();
    }

    /**
     * Handle level up event from ProgressService
     * @param event Level up event containing level information
     */
    private handleLevelUp(event: LevelUpEvent) {
        // Level up is handled by ProgressService, we just need to update our state
        this.totalXP = event.totalXP;
        Debug.log('LearningSession', `Level up detected: ${event.oldLevel} -> ${event.newLevel}`);
    }

    /**
     * Get the current total XP
     * @returns Total XP
     */
    getTotalXP(): number {
        return this.totalXP;
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

            // Reset daily XP if it's a new day
            if (this.lastPracticeDate !== today) {
                this.dailyXP = 0;
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

        let saved: string | null = null;
        try {
            saved = localStorage.getItem('learning-session');
            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate and set state with proper typing
                this.currentStreak = typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0;
                this.lastPracticeDate = typeof parsed.lastPracticeDate === 'string' ? parsed.lastPracticeDate : null;
                this.dailyXP = typeof parsed.dailyXP === 'number' ? parsed.dailyXP : 0;
                this.totalXP = typeof parsed.totalXP === 'number' ? parsed.totalXP : 0;

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
            if (typeof this.currentStreak !== 'number' || typeof this.dailyXP !== 'number' || typeof this.totalXP !== 'number') {
                throw new Error('Invalid session state: numbers expected');
            }

            localStorage.setItem('learning-session', JSON.stringify({
                currentStreak: this.currentStreak,
                dailyXP: this.dailyXP,
                lastPracticeDate: this.lastPracticeDate,
                totalXP: this.totalXP
            }));
        } catch (error) {
            ErrorHandler.handleError(error, 'Failed to save learning session state');
            throw new StorageError('Failed to save learning session state', {
                error,
                currentStreakType: typeof this.currentStreak,
                dailyXPType: typeof this.dailyXP,
                lastPracticeDateType: typeof this.lastPracticeDate,
                totalXPType: typeof this.totalXP
            });
        }
    }

    destroy(): void {
        Debug.log('LearningSession', 'Destroying LearningSession, cleaning up resources');
        if (this.xpEventUnsubscribe) {
            this.xpEventUnsubscribe();
            this.xpEventUnsubscribe = null;
        }
        if (this.levelUpEventUnsubscribe) {
            this.levelUpEventUnsubscribe();
            this.levelUpEventUnsubscribe = null;
        }
    }
}
// Create singleton instance - will be initialized by DI container
let learningSessionInstance: LearningSession | null = null;

// Export a getter and setter to avoid direct import reassignment issues
export function getLearningSession(): LearningSession | null {
    return learningSessionInstance;
}

export function setLearningSession(session: LearningSession): void {
    learningSessionInstance = session;
}

export { learningSessionInstance as learningSession };

// Add cleanup for application shutdown
export function setupSessionCleanup() {
    if (browser) {
        window.addEventListener('beforeunload', () => {
            const session = getLearningSession();
            if (session) {
                session.destroy();
            }
        });
    }
}

// Initialize cleanup
setupSessionCleanup();