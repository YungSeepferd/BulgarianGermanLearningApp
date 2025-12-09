import type { PracticeSession } from '$lib/types/vocabulary';
/**
 * LocalStorage utility class for managing user progress
 */
export declare class LocalStorageManager {
    private static readonly PREFIX;
    private static readonly USER_PROGRESS_KEY;
    private static readonly SESSION_KEY;
    /**
     * Save user progress to localStorage
     * @param progress Object containing user progress data
     */
    static saveUserProgress(progress: {
        stats: Map<string, {
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }>;
        favorites: string[];
        recentSearches: string[];
    }): void;
    /**
     * Load user progress from localStorage
     * @returns Object containing user progress data or null if not found
     */
    static loadUserProgress(): {
        stats: Map<string, {
            correct: number;
            incorrect: number;
            lastPracticed: string;
        }>;
        favorites: string[];
        recentSearches: string[];
        lastUpdated: string;
    } | null;
    /**
     * Save active practice session to localStorage
     * @param session Practice session data to save
     */
    static savePracticeSession(session: PracticeSession): void;
    /**
     * Load active practice session from localStorage
     * @returns Practice session data or null if not found
     */
    static loadPracticeSession(): PracticeSession | null;
    /**
     * Clear active practice session from localStorage
     */
    static clearPracticeSession(): void;
    /**
     * Export user data as JSON string
     * @returns JSON string containing all user data
     */
    static exportUserData(): string;
    /**
     * Import user data from JSON string
     * @param jsonData JSON string containing user data
     */
    static importUserData(jsonData: string): void;
    /**
     * Clear all tandem-related data from localStorage
     */
    static clearAllData(): void;
}
export declare const localStorageManager: LocalStorageManager;
//# sourceMappingURL=localStorage.d.ts.map