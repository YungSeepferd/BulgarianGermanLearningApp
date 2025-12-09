/**
 * Progress Tracking Service
 *
 * This service provides comprehensive progress tracking functionality for the language learning application.
 * It handles vocabulary mastery, lesson completion, quiz performance, and overall user progress.
 */
import { type VocabularyMastery, type LessonProgress, type QuizPerformance, type DailyProgress, type OverallProgress } from '$lib/schemas/progress';
export declare class ProgressService {
    private static instance;
    private progressData;
    private static readonly XP_VALUES;
    private constructor();
    static getInstance(): ProgressService;
    private getDefaultProgressData;
    /**
     * Record a vocabulary practice result
     * @param itemId The ID of the vocabulary item
     * @param correct Whether the answer was correct
     * @param responseTime Response time in seconds (optional)
     */
    recordVocabularyPractice(itemId: string, correct: boolean, responseTime?: number): void;
    /**
     * Get mastery data for a specific vocabulary item
     * @param itemId The ID of the vocabulary item
     * @returns VocabularyMastery or null if not found
     */
    getVocabularyMastery(itemId: string): VocabularyMastery | null;
    /**
     * Get all vocabulary mastery data
     * @returns Record of vocabulary mastery data
     */
    getAllVocabularyMastery(): Record<string, VocabularyMastery>;
    /**
     * Get vocabulary items that need practice
     * @param limit Maximum number of items to return
     * @returns Array of vocabulary items that need practice
     */
    getVocabularyNeedingPractice(limit?: number): VocabularyMastery[];
    /**
     * Record lesson progress
     * @param lessonId The ID of the lesson
     * @param completionPercentage The percentage of completion (0-100)
     */
    recordLessonProgress(lessonId: string, completionPercentage: number): void;
    /**
     * Get progress for a specific lesson
     * @param lessonId The ID of the lesson
     * @returns LessonProgress or null if not found
     */
    getLessonProgress(lessonId: string): LessonProgress | null;
    /**
     * Get all lesson progress data
     * @returns Record of lesson progress data
     */
    getAllLessonProgress(): Record<string, LessonProgress>;
    /**
     * Record quiz performance
     * @param quizId The ID of the quiz
     * @param score The score achieved (0-100)
     * @param totalQuestions Total number of questions
     * @param correctAnswers Number of correct answers
     * @param timeTaken Time taken in seconds
     * @param sessionId The session ID for this quiz attempt
     */
    recordQuizPerformance(quizId: string, score: number, totalQuestions: number, correctAnswers: number, timeTaken: number, sessionId: string): void;
    /**
     * Record question performance
     * @param quizPerformanceId The ID of the quiz performance record
     * @param questionId The ID of the question
     * @param questionType The type of the question
     * @param wasCorrect Whether the answer was correct
     * @param userAnswer The user's answer
     * @param correctAnswer The correct answer
     * @param timeTaken Time taken in seconds
     */
    recordQuestionPerformance(quizPerformanceId: string, questionId: string, questionType: string, wasCorrect: boolean, userAnswer: string | null, correctAnswer: string, timeTaken: number): void;
    /**
     * Get quiz performance by ID
     * @param quizPerformanceId The ID of the quiz performance record
     * @returns QuizPerformance or null if not found
     */
    getQuizPerformance(quizPerformanceId: string): QuizPerformance | null;
    /**
     * Get all quiz performance records
     * @returns Record of quiz performance data
     */
    getAllQuizPerformance(): Record<string, QuizPerformance>;
    /**
     * Get quiz performance records for a specific quiz
     * @param quizId The ID of the quiz
     * @returns Array of quiz performance records
     */
    getQuizPerformanceByQuizId(quizId: string): QuizPerformance[];
    /**
     * Record daily progress
     * @param date The date in YYYY-MM-DD format
     * @param xpEarned XP earned on this date
     * @param wordsPracticed Number of words practiced
     * @param lessonsCompleted Number of lessons completed
     * @param quizzesTaken Number of quizzes taken
     * @param timeSpent Time spent in seconds
     */
    recordDailyProgress(date: string, xpEarned: number, wordsPracticed: number, lessonsCompleted: number, quizzesTaken: number, timeSpent: number): void;
    /**
     * Get daily progress for a specific date
     * @param date The date in YYYY-MM-DD format
     * @returns DailyProgress or null if not found
     */
    getDailyProgress(date: string): DailyProgress | null;
    /**
     * Get all daily progress records
     * @returns Record of daily progress data
     */
    getAllDailyProgress(): Record<string, DailyProgress>;
    /**
     * Get daily progress for the last N days
     * @param days Number of days to retrieve
     * @returns Array of daily progress records
     */
    getRecentDailyProgress(days?: number): DailyProgress[];
    /**
     * Update overall progress with new activity
     * @param params Object containing progress updates
     */
    private updateOverallProgress;
    /**
     * Update streak information
     * @param today Today's date in YYYY-MM-DD format
     */
    private updateStreak;
    /**
     * Get overall progress
     * @returns OverallProgress
     */
    getOverallProgress(): OverallProgress;
    /**
     * Get current level information
     * @returns Object containing level information
     */
    getLevelInfo(): {
        level: number;
        currentXP: number;
        nextLevelXP: number;
        progressPercentage: number;
    };
    /**
     * Award XP for an achievement
     * @param amount Amount of XP to award
     * @param reason Reason for awarding XP
     */
    awardXP(amount: number, reason: string): void;
    /**
     * Load progress data from localStorage
     */
    private loadProgress;
    /**
     * Save progress data to localStorage
     */
    private saveProgress;
    /**
     * Export progress data as JSON
     * @returns JSON string of progress data
     */
    exportProgress(): string;
    /**
     * Import progress data from JSON
     * @param jsonData JSON string of progress data
     * @throws Error if import fails
     */
    importProgress(jsonData: string): void;
    /**
     * Reset all progress data
     */
    resetProgress(): void;
    /**
     * Get progress summary for dashboard display
     * @returns Object containing key progress metrics
     */
    getProgressSummary(): {
        totalXP: number;
        currentLevel: number;
        levelProgress: number;
        wordsPracticed: number;
        lessonsCompleted: number;
        quizzesTaken: number;
        currentStreak: number;
        longestStreak: number;
        dailyGoalProgress: number;
    };
    /**
     * Get vocabulary mastery statistics
     * @returns Object containing vocabulary mastery statistics
     */
    getVocabularyMasteryStats(): {
        totalItems: number;
        masteredItems: number;
        masteryPercentage: number;
        averageMasteryLevel: number;
    };
    /**
     * Get lesson completion statistics
     * @returns Object containing lesson completion statistics
     */
    getLessonCompletionStats(): {
        totalLessons: number;
        completedLessons: number;
        completionPercentage: number;
    };
}
export declare const progressService: ProgressService;
//# sourceMappingURL=progress.d.ts.map