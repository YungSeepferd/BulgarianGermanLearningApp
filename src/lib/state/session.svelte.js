import { browser } from '$app/environment';
const DAILY_XP_TARGET = 50;
const XP_PER_WORD = 10;
export class LearningSession {
    constructor() {
        // Session State
        // isActive = $state(false);
        // currentStreak = $state(0);
        // sessionXP = $state(0);
        // dailyXP = $state(0);
        // totalXP = $state(0); // New: Persisted total XP
        // lastPracticeDate = $state<string | null>(null);
        this.isActive = false;
        this.currentStreak = 0;
        this.sessionXP = 0;
        this.dailyXP = 0;
        this.totalXP = 0;
        this.lastPracticeDate = null;
        // Gamification
        this.dailyTarget = DAILY_XP_TARGET;
        // Level System (Derived)
        // Level 1: 0-100 XP
        // Level 2: 101-300 XP (200 XP gap)
        // Level 3: 301-600 XP (300 XP gap)
        // Formula: Level = Math.floor(Math.sqrt(totalXP / 100)) + 1
        // or simplified buckets for now
        // level = $derived(this.calculateLevel(this.totalXP));
        // nextLevelXP = $derived(this.calculateNextLevelXP(this.level));
        // currentLevelStartXP = $derived(this.calculateLevelStartXP(this.level));
        this.level = 0;
        this.nextLevelXP = 0;
        this.currentLevelStartXP = 0;
        // levelProgress = $derived.by(() => {
        //     const xpInLevel = this.totalXP - this.currentLevelStartXP;
        //     const levelSpan = this.nextLevelXP - this.currentLevelStartXP;
        //     return Math.min(100, Math.max(0, (xpInLevel / levelSpan) * 100));
        // });
        //
        // progressPercentage = $derived(Math.min(100, (this.dailyXP / this.dailyTarget) * 100));
        // isDailyGoalReached = $derived(this.dailyXP >= this.dailyTarget);
        this.levelProgress = 0;
        this.progressPercentage = 0;
        this.isDailyGoalReached = false;
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
    awardXP(amount = XP_PER_WORD) {
        this.sessionXP += amount;
        this.dailyXP += amount;
        this.totalXP += amount;
        this.saveState();
        return this.checkLevelUp(); // Return true if level up occurred
    }
    // Helper: Simple linear-ish progression
    // Level 1: 0 - 200
    // Level 2: 200 - 500 (+300)
    // Level 3: 500 - 900 (+400)
    // ...
    calculateLevel(xp) {
        let level = 1;
        let threshold = 200;
        let gap = 300;
        while (xp >= threshold) {
            level++;
            threshold += gap;
            gap += 100; // Increase gap by 100 each level
        }
        return level;
    }
    calculateNextLevelXP(level) {
        let l = 1;
        let threshold = 200;
        let gap = 300;
        while (l < level) {
            l++;
            threshold += gap;
            gap += 100;
        }
        return threshold;
    }
    calculateLevelStartXP(level) {
        if (level === 1)
            return 0;
        let l = 1;
        let _threshold = 200;
        let gap = 300;
        // Calculate end of previous level
        while (l < level) {
            l++;
            _threshold += gap;
            gap += 100;
        }
        // Start of current level is end of previous level?
        // Re-calculating to be safe:
        // Level 1 starts at 0
        // Level 2 starts at 200
        // Level 3 starts at 500
        // The loop above actually calculates the threshold to REACH the next level.
        // So for level 2, the threshold calculated in prev loop step (when l=1) was 200.
        // Let's redo simply:
        let _currentGap = 200; // Gap for level 1
        for (let i = 1; i < level; i++) {
            _currentGap += 100; // Increment gap for next level
        }
        // Correction: My manual calculation above for calculateLevel used:
        // L1: 0-200 (gap 200? wait code said threshold 200, gap 300 for NEXT)
        // Let's stick to the code logic in calculateLevel:
        // Start: level=1, threshold=200.
        // If xp < 200 -> Level 1.
        // If xp >= 200 -> Level 2. Next threshold = 200 + 300 = 500.
        // If xp >= 500 -> Level 3. Next threshold = 500 + 400 = 900.
        // So start of Level 1 = 0.
        // Start of Level 2 = 200.
        // Start of Level 3 = 500.
        if (level === 1)
            return 0;
        let xp = 200;
        let g = 300;
        for (let i = 2; i < level; i++) {
            xp += g;
            g += 100;
        }
        return xp;
    }
    checkLevelUp() {
        // This is purely for side-effects if needed, or the UI can react to $derived level change
        // We might want to return true to trigger an animation
        return false; // Logic handled reactively in UI
    }
    // Streak Logic
    checkStreak() {
        const today = new Date().toISOString().split('T')[0];
        if (today && this.lastPracticeDate === today)
            return; // Already practiced today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (yesterdayStr && this.lastPracticeDate === yesterdayStr) {
            // Continued streak
            this.currentStreak++;
        }
        else if (this.lastPracticeDate && yesterdayStr && this.lastPracticeDate < yesterdayStr) {
            // Streak broken
            this.currentStreak = 1;
        }
        else {
            // First time or fresh start
            if (this.currentStreak === 0)
                this.currentStreak = 1;
        }
        this.lastPracticeDate = today || null;
        this.saveState();
    }
    // Persistence
    loadState() {
        try {
            const saved = localStorage.getItem('learning-session');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.currentStreak = parsed.currentStreak || 0;
                this.lastPracticeDate = parsed.lastPracticeDate || null;
                this.totalXP = parsed.totalXP || 0; // Load total XP
                // Reset daily XP if it's a new day
                const today = new Date().toISOString().split('T')[0];
                if (parsed.lastPracticeDate === today) {
                    this.dailyXP = parsed.dailyXP || 0;
                }
                else {
                    this.dailyXP = 0;
                }
            }
        }
        catch (_e) {
            // Silently fail on load errors
        }
    }
    saveState() {
        if (!browser)
            return;
        try {
            localStorage.setItem('learning-session', JSON.stringify({
                currentStreak: this.currentStreak,
                dailyXP: this.dailyXP,
                lastPracticeDate: this.lastPracticeDate,
                totalXP: this.totalXP // Save total XP
            }));
        }
        catch (_e) {
            // Silently fail on save errors
        }
    }
}
export const learningSession = new LearningSession();
//# sourceMappingURL=session.svelte.js.map