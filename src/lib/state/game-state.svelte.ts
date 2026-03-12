/**
 * Game State - Reactive State for XP, Level, and Progress
 *
 * This module provides direct reactive state for gamification features
 * using Svelte 5 runes. Replaces the event bus pattern for XP/level updates.
 */

import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { calculateLevel, calculateXPForLevel } from '$lib/schemas/progress';

const DAILY_XP_TARGET = 50;
const XP_PER_WORD = 10;

/**
 * Reactive game state singleton
 * Uses Svelte 5 runes for automatic reactivity
 */
class GameState {
    // Session State
    isActive = $state<boolean>(false);
    currentStreak = $state<number>(0);
    sessionXP = $state<number>(0);
    dailyXP = $state<number>(0);
    lastPracticeDate = $state<string | null>(null);
    totalXP = $state<number>(0);

    // Gamification
    dailyTarget = DAILY_XP_TARGET;

    // Level System (Derived)
    level = $derived.by(() => calculateLevel(this.totalXP));
    nextLevelXP = $derived.by(() => calculateXPForLevel(this.level + 1));
    currentLevelStartXP = $derived.by(() => calculateXPForLevel(this.level));

    levelProgress = $derived.by(() => {
        const xpInLevel = this.totalXP - this.currentLevelStartXP;
        const levelSpan = this.nextLevelXP - this.currentLevelStartXP;
        if (levelSpan <= 0) return 0;
        return Math.min(100, Math.max(0, (xpInLevel / levelSpan) * 100));
    });

    progressPercentage = $derived.by(() => {
        if (this.dailyTarget <= 0) return 0;
        return Math.min(100, (this.dailyXP / this.dailyTarget) * 100);
    });

    isDailyGoalReached = $derived(this.dailyXP >= this.dailyTarget);

    // Callbacks for level-up (set by consumers)
    private onLevelUpCallbacks: Array<(oldLevel: number, newLevel: number, totalXP: number) => void> = [];

    constructor() {
        if (browser) {
            this.loadState();
        }
    }

    /**
     * Register a callback for level-up events
     */
    onLevelUp(callback: (oldLevel: number, newLevel: number, totalXP: number) => void): () => void {
        this.onLevelUpCallbacks.push(callback);
        return () => {
            const index = this.onLevelUpCallbacks.indexOf(callback);
            if (index > -1) {
                this.onLevelUpCallbacks.splice(index, 1);
            }
        };
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
     */
    awardXP(amount: number = XP_PER_WORD): boolean {
        if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
            throw new Error('Invalid XP amount');
        }

        const oldLevel = this.level;
        
        this.sessionXP += amount;
        this.dailyXP += amount;
        this.totalXP += amount;

        // Check for level up
        const newLevel = this.level;
        if (newLevel > oldLevel) {
            // Notify all level-up callbacks
            for (const callback of this.onLevelUpCallbacks) {
                callback(oldLevel, newLevel, this.totalXP);
            }
            Debug.log('GameState', `Level up: ${oldLevel} -> ${newLevel}`);
        }

        this.checkStreak();
        this.saveState();
        
        return newLevel > oldLevel;
    }

    /**
     * Add XP from external source (e.g., ProgressService)
     * @param amount Amount of XP to add
     * @param reason Reason for XP (for logging)
     */
    addXP(amount: number, reason: string = 'Progress'): void {
        if (typeof amount !== 'number' || amount < 0) {
            Debug.warn('GameState', 'Invalid XP amount', { amount, reason });
            return;
        }

        const oldLevel = this.level;
        
        this.totalXP += amount;
        this.dailyXP += amount;

        // Check for level up
        const newLevel = this.level;
        if (newLevel > oldLevel) {

            for (const callback of this.onLevelUpCallbacks) {
                callback(oldLevel, newLevel, this.totalXP);
            }
            Debug.log('GameState', `Level up: ${oldLevel} -> ${newLevel}`, { reason });
        }

        this.checkStreak();
        this.saveState();
    }

    /**
     * Set total XP directly (e.g., from loaded state)
     */
    setTotalXP(xp: number): void {
        if (typeof xp !== 'number' || xp < 0) return;
        
        const oldLevel = this.level;
        this.totalXP = xp;
        
        const newLevel = this.level;
        if (newLevel > oldLevel) {

            for (const callback of this.onLevelUpCallbacks) {
                callback(oldLevel, newLevel, this.totalXP);
            }
        }
    }

    /**
     * Get the current total XP
     */
    getTotalXP(): number {
        return this.totalXP;
    }

    /**
     * Check and update streak information
     */
    private checkStreak(): void {
        try {
            const today = new Date().toISOString().split('T')[0];
            if (!today) return;

            if (this.lastPracticeDate === today) return;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (!yesterdayStr) return;

            if (this.lastPracticeDate === yesterdayStr) {
                this.currentStreak++;
            } else if (this.lastPracticeDate && this.lastPracticeDate < yesterdayStr) {
                this.currentStreak = 1;
            } else {
                if (this.currentStreak === 0) this.currentStreak = 1;
            }

            if (this.lastPracticeDate !== today) {
                this.dailyXP = 0;
            }

            this.lastPracticeDate = today;
        } catch (error) {
            Debug.error('GameState', 'Failed to check streak', error as Error);
        }
    }

    /**
     * Load the session state from localStorage
     */
    private loadState(): void {
        if (!browser) return;

        try {
            const saved = localStorage.getItem('learning-session');
            if (saved) {
                const parsed = JSON.parse(saved);

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
            Debug.error('GameState', 'Failed to load state', error as Error);
        }
    }

    /**
     * Save the current session state to localStorage
     */
    private saveState(): void {
        if (!browser) return;
        
        try {
            localStorage.setItem('learning-session', JSON.stringify({
                currentStreak: this.currentStreak,
                dailyXP: this.dailyXP,
                lastPracticeDate: this.lastPracticeDate,
                totalXP: this.totalXP
            }));
        } catch (error) {
            Debug.error('GameState', 'Failed to save state', error as Error);
        }
    }
}

// Singleton instance
export const gameState = new GameState();

// Convenience exports
export const {
    isActive,
    currentStreak,
    sessionXP,
    dailyXP,
    lastPracticeDate,
    totalXP,
    dailyTarget,
    level,
    nextLevelXP,
    currentLevelStartXP,
    levelProgress,
    progressPercentage,
    isDailyGoalReached
} = gameState;