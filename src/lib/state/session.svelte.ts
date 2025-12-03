import { browser } from '$app/environment';

const DAILY_XP_TARGET = 50;
const XP_PER_WORD = 10;

export class LearningSession {
    // Session State
    isActive = $state(false);
    currentStreak = $state(0);
    sessionXP = $state(0);
    dailyXP = $state(0);
    lastPracticeDate = $state<string | null>(null);
    
    // Gamification
    dailyTarget = DAILY_XP_TARGET;
    
    // Derived
    progressPercentage = $derived(Math.min(100, (this.dailyXP / this.dailyTarget) * 100));
    isDailyGoalReached = $derived(this.dailyXP >= this.dailyTarget);

    constructor() {
        if (browser) {
            this.loadState();
        }
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

    awardXP(amount: number = XP_PER_WORD) {
        this.sessionXP += amount;
        this.dailyXP += amount;
        this.saveState();
    }

    // Streak Logic
    private checkStreak() {
        const today = new Date().toISOString().split('T')[0];
        
        if (today && this.lastPracticeDate === today) return; // Already practiced today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (yesterdayStr && this.lastPracticeDate === yesterdayStr) {
            // Continued streak
            this.currentStreak++;
        } else if (this.lastPracticeDate && yesterdayStr && this.lastPracticeDate < yesterdayStr) {
            // Streak broken
            this.currentStreak = 1;
        } else {
            // First time or fresh start
            if (this.currentStreak === 0) this.currentStreak = 1;
        }

        this.lastPracticeDate = today || null;
        this.saveState();
    }

    // Persistence
    private loadState() {
        try {
            const saved = localStorage.getItem('learning-session');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.currentStreak = parsed.currentStreak || 0;
                this.lastPracticeDate = parsed.lastPracticeDate || null;
                
                // Reset daily XP if it's a new day
                const today = new Date().toISOString().split('T')[0];
                if (parsed.lastPracticeDate === today) {
                    this.dailyXP = parsed.dailyXP || 0;
                } else {
                    this.dailyXP = 0;
                }
            }
        } catch (e) {
            console.error('Failed to load session state', e);
        }
    }

    private saveState() {
        if (!browser) return;
        try {
            localStorage.setItem('learning-session', JSON.stringify({
                currentStreak: this.currentStreak,
                dailyXP: this.dailyXP,
                lastPracticeDate: this.lastPracticeDate
            }));
        } catch (e) {
            console.error('Failed to save session state', e);
        }
    }
}

export const learningSession = new LearningSession();