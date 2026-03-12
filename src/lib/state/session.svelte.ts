/**
 * Learning Session - Reactive Session State
 *
 * This module provides session state management using Svelte 5 runes.
 * Now uses gameState for XP/level tracking instead of event bus.
 */

import { browser } from '$app/environment';
import { Debug } from '$lib/utils';
import { StateError } from '../services/errors';
import { gameState } from './game-state.svelte';

const DAILY_XP_TARGET = 50;
const XP_PER_WORD = 10;

/**
 * Learning Session class
 * Delegates XP/level tracking to gameState
 */
export class LearningSession {
    // Session State - delegate to gameState
    get isActive(): boolean {
        return gameState.isActive;
    }
    
    get currentStreak(): number {
        return gameState.currentStreak;
    }
    
    get sessionXP(): number {
        return gameState.sessionXP;
    }
    
    get dailyXP(): number {
        return gameState.dailyXP;
    }
    
    get lastPracticeDate(): string | null {
        return gameState.lastPracticeDate;
    }
    
    get totalXP(): number {
        return gameState.totalXP;
    }

    // Gamification
    dailyTarget = DAILY_XP_TARGET;

    // Level System - delegate to gameState
    get level() {
        return gameState.level;
    }
    
    get nextLevelXP() {
        return gameState.nextLevelXP;
    }
    
    get currentLevelStartXP() {
        return gameState.currentLevelStartXP;
    }

    get levelProgress() {
        return gameState.levelProgress;
    }

    get progressPercentage() {
        return gameState.progressPercentage;
    }
    
    get isDailyGoalReached() {
        return gameState.isDailyGoalReached;
    }

    constructor() {
        if (browser) {
            this.loadState();
        }
    }

    startSession() {
        gameState.startSession();
    }

    endSession() {
        gameState.endSession();
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

        return gameState.awardXP(amount);
    }

    /**
     * Get the current total XP
     * @returns Total XP
     */
    getTotalXP(): number {
        return gameState.getTotalXP();
    }

    /**
     * Load the session state from localStorage
     * @throws StorageError if loading fails
     */
    private loadState(): void {
        // State is loaded by gameState constructor
    }

    destroy(): void {
        Debug.log('LearningSession', 'Destroying LearningSession');
        // Cleanup handled by gameState
    }
}

// Create singleton instance
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