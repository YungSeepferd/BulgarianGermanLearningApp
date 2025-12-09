export declare class LearningSession {
    isActive: boolean;
    currentStreak: number;
    sessionXP: number;
    dailyXP: number;
    totalXP: number;
    lastPracticeDate: string | null;
    dailyTarget: number;
    level: number;
    nextLevelXP: number;
    currentLevelStartXP: number;
    levelProgress: number;
    progressPercentage: number;
    isDailyGoalReached: boolean;
    constructor();
    startSession(): void;
    endSession(): void;
    awardXP(amount?: number): boolean;
    private calculateLevel;
    private calculateNextLevelXP;
    private calculateLevelStartXP;
    private checkLevelUp;
    private checkStreak;
    private loadState;
    private saveState;
}
export declare const learningSession: LearningSession;
//# sourceMappingURL=session.svelte.d.ts.map