/**
 * Progress Tracking Service
 *
 * This service provides comprehensive progress tracking functionality for the language learning application.
 * It handles vocabulary mastery, lesson completion, quiz performance, and overall user progress.
 */

import { browser } from '$app/environment';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorageManager } from '$lib/utils/localStorage';
import {
  VocabularyMasterySchema,
  LessonProgressSchema,
  QuizPerformanceSchema,
  QuestionPerformanceSchema,
  DailyProgressSchema,
  ProgressDataSchema,
  type VocabularyMastery,
  type LessonProgress,
  type QuizPerformance,
  type QuestionPerformance,
  type DailyProgress,
  type OverallProgress,
  type ProgressData,
  calculateMasteryLevel,
  isItemMastered,
  calculateLevel,
  calculateXPForLevel
} from '$lib/schemas/progress';
// OverallProgressSchema is unused
import { learningSession } from '$lib/state/session.svelte';

export class ProgressService {
  private static instance: ProgressService;
  private progressData: ProgressData = this.getDefaultProgressData();

  // XP values for different actions
  private static readonly XP_VALUES = {
    VOCABULARY_PRACTICE: 10,
    VOCABULARY_MASTERED: 50,
    LESSON_COMPLETED: 100,
    QUIZ_COMPLETED: 150,
    DAILY_GOAL: 200
  };

  private constructor() {
    if (browser) {
      this.loadProgress();
    }
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  private getDefaultProgressData(): ProgressData {
    return {
      vocabularyMastery: {},
      lessonProgress: {},
      quizPerformance: {},
      questionPerformance: {},
      dailyProgress: {},
      overallProgress: {
        id: uuidv4(),
        totalXP: 0,
        totalWordsPracticed: 0,
        totalLessonsCompleted: 0,
        totalQuizzesTaken: 0,
        totalTimeSpent: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  //#region Vocabulary Mastery Tracking

  /**
   * Record a vocabulary practice result
   * @param itemId The ID of the vocabulary item
   * @param correct Whether the answer was correct
   * @param responseTime Response time in seconds (optional)
   */
  recordVocabularyPractice(itemId: string, correct: boolean, responseTime?: number): void {
    const _today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Get or create mastery record
    let mastery = this.progressData.vocabularyMastery[itemId] || {
      id: uuidv4(),
      itemId,
      correctCount: 0,
      incorrectCount: 0,
      totalAttempts: 0,
      lastPracticed: null,
      masteryLevel: 0,
      isMastered: false,
      createdAt: now,
      updatedAt: now
    };

    // Update mastery stats
    if (correct) {
      mastery.correctCount++;
    } else {
      mastery.incorrectCount++;
    }
    mastery.totalAttempts++;
    mastery.lastPracticed = now;
    mastery.updatedAt = now;

    // Calculate mastery level
    mastery.masteryLevel = calculateMasteryLevel(mastery.correctCount, mastery.incorrectCount);
    mastery.isMastered = isItemMastered(mastery.masteryLevel);

    // Update the record
    this.progressData.vocabularyMastery[itemId] = VocabularyMasterySchema.parse(mastery);

    // Update overall progress
    this.updateOverallProgress({
      xpEarned: ProgressService.XP_VALUES.VOCABULARY_PRACTICE,
      wordsPracticed: 1,
      timeSpent: responseTime || 0
    });

    // Award bonus XP for mastering an item
    if (mastery.isMastered && mastery.totalAttempts === 1) {
      this.awardXP(ProgressService.XP_VALUES.VOCABULARY_MASTERED, 'Vocabulary mastered');
    }

    this.saveProgress();
  }

  /**
   * Get mastery data for a specific vocabulary item
   * @param itemId The ID of the vocabulary item
   * @returns VocabularyMastery or null if not found
   */
  getVocabularyMastery(itemId: string): VocabularyMastery | null {
    return this.progressData.vocabularyMastery[itemId] || null;
  }

  /**
   * Get all vocabulary mastery data
   * @returns Record of vocabulary mastery data
   */
  getAllVocabularyMastery(): Record<string, VocabularyMastery> {
    return this.progressData.vocabularyMastery;
  }

  /**
   * Get vocabulary items that need practice
   * @param limit Maximum number of items to return
   * @returns Array of vocabulary items that need practice
   */
  getVocabularyNeedingPractice(limit: number = 10): VocabularyMastery[] {
    return Object.values(this.progressData.vocabularyMastery)
      .filter(item => {
        // Items that haven't been mastered yet
        if (item.isMastered) return false;

        // Items with low mastery level or few attempts
        const totalAttempts = item.correctCount + item.incorrectCount;
        const successRate = totalAttempts > 0 ? item.correctCount / totalAttempts : 0;

        return successRate < 0.8 || totalAttempts < 3;
      })
      .sort((a, b) => {
        // Sort by mastery level (lowest first) and then by last practiced (oldest first)
        if (a.masteryLevel !== b.masteryLevel) {
          return a.masteryLevel - b.masteryLevel;
        }
        return new Date(a.lastPracticed || 0).getTime() - new Date(b.lastPracticed || 0).getTime();
      })
      .slice(0, limit);
  }

  //#endregion

  //#region Lesson Progress Tracking

  /**
   * Record lesson progress
   * @param lessonId The ID of the lesson
   * @param completionPercentage The percentage of completion (0-100)
   */
  recordLessonProgress(lessonId: string, completionPercentage: number): void {
    const now = new Date().toISOString();
    const _today = now.split('T')[0];

    // Get or create lesson progress record
    let lessonProgress = this.progressData.lessonProgress[lessonId] || {
      id: uuidv4(),
      lessonId,
      status: 'not_started',
      completionPercentage: 0,
      lastAccessed: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now
    };

    // Update lesson progress
    lessonProgress.completionPercentage = Math.min(100, Math.max(0, completionPercentage));
    lessonProgress.lastAccessed = now;
    lessonProgress.updatedAt = now;

    // Update status based on completion percentage
    if (lessonProgress.completionPercentage >= 100) {
      lessonProgress.status = 'completed';
      lessonProgress.completedAt = now;
    } else if (lessonProgress.completionPercentage > 0) {
      lessonProgress.status = 'in_progress';
    }

    // Update the record
    this.progressData.lessonProgress[lessonId] = LessonProgressSchema.parse(lessonProgress);

    // If lesson is completed, update overall progress
    if (lessonProgress.status === 'completed' && lessonProgress.completionPercentage === 100) {
      this.updateOverallProgress({
        xpEarned: ProgressService.XP_VALUES.LESSON_COMPLETED,
        lessonsCompleted: 1,
        timeSpent: 0 // Time spent on lessons is tracked separately
      });
    }

    this.saveProgress();
  }

  /**
   * Get progress for a specific lesson
   * @param lessonId The ID of the lesson
   * @returns LessonProgress or null if not found
   */
  getLessonProgress(lessonId: string): LessonProgress | null {
    return this.progressData.lessonProgress[lessonId] || null;
  }

  /**
   * Get all lesson progress data
   * @returns Record of lesson progress data
   */
  getAllLessonProgress(): Record<string, LessonProgress> {
    return this.progressData.lessonProgress;
  }

  //#endregion

  //#region Quiz Performance Tracking

  /**
   * Record quiz performance
   * @param quizId The ID of the quiz
   * @param score The score achieved (0-100)
   * @param totalQuestions Total number of questions
   * @param correctAnswers Number of correct answers
   * @param timeTaken Time taken in seconds
   * @param sessionId The session ID for this quiz attempt
   */
  recordQuizPerformance(
    quizId: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    timeTaken: number,
    sessionId: string
  ): void {
    const now = new Date().toISOString();

    // Create quiz performance record
    const quizPerformance: QuizPerformance = {
      id: uuidv4(),
      quizId,
      sessionId,
      score: Math.min(100, Math.max(0, score)),
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      timeTaken,
      completedAt: now,
      createdAt: now
    };

    // Add to progress data
    this.progressData.quizPerformance[quizPerformance.id] = QuizPerformanceSchema.parse(quizPerformance);

    // Update overall progress
    this.updateOverallProgress({
      xpEarned: ProgressService.XP_VALUES.QUIZ_COMPLETED,
      quizzesTaken: 1,
      timeSpent: timeTaken
    });

    this.saveProgress();
  }

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
  recordQuestionPerformance(
    quizPerformanceId: string,
    questionId: string,
    questionType: string,
    wasCorrect: boolean,
    userAnswer: string | null,
    correctAnswer: string,
    timeTaken: number
  ): void {
    const now = new Date().toISOString();

    // Create question performance record
    const questionPerformance: QuestionPerformance = {
      id: uuidv4(),
      quizPerformanceId,
      questionId,
      questionType,
      wasCorrect,
      userAnswer,
      correctAnswer,
      timeTaken,
      createdAt: now
    };

    // Add to progress data
    this.progressData.questionPerformance[questionPerformance.id] =
      QuestionPerformanceSchema.parse(questionPerformance);

    // If the question was part of vocabulary practice, update vocabulary mastery
    if (questionType.includes('vocabulary') && questionId) {
      this.recordVocabularyPractice(questionId, wasCorrect, timeTaken);
    }

    this.saveProgress();
  }

  /**
   * Get quiz performance by ID
   * @param quizPerformanceId The ID of the quiz performance record
   * @returns QuizPerformance or null if not found
   */
  getQuizPerformance(quizPerformanceId: string): QuizPerformance | null {
    return this.progressData.quizPerformance[quizPerformanceId] || null;
  }

  /**
   * Get all quiz performance records
   * @returns Record of quiz performance data
   */
  getAllQuizPerformance(): Record<string, QuizPerformance> {
    return this.progressData.quizPerformance;
  }

  /**
   * Get quiz performance records for a specific quiz
   * @param quizId The ID of the quiz
   * @returns Array of quiz performance records
   */
  getQuizPerformanceByQuizId(quizId: string): QuizPerformance[] {
    return Object.values(this.progressData.quizPerformance)
      .filter(performance => performance.quizId === quizId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  //#endregion

  //#region Daily Progress Tracking

  /**
   * Record daily progress
   * @param date The date in YYYY-MM-DD format
   * @param xpEarned XP earned on this date
   * @param wordsPracticed Number of words practiced
   * @param lessonsCompleted Number of lessons completed
   * @param quizzesTaken Number of quizzes taken
   * @param timeSpent Time spent in seconds
   */
  recordDailyProgress(
    date: string,
    xpEarned: number,
    wordsPracticed: number,
    lessonsCompleted: number,
    quizzesTaken: number,
    timeSpent: number
  ): void {
    const now = new Date().toISOString();

    // Get or create daily progress record
    let dailyProgress = this.progressData.dailyProgress[date] || {
      id: uuidv4(),
      date: new Date(date).toISOString(),
      xpEarned: 0,
      wordsPracticed: 0,
      lessonsCompleted: 0,
      quizzesTaken: 0,
      timeSpent: 0,
      createdAt: now,
      updatedAt: now
    };

    // Update daily progress
    dailyProgress.xpEarned += xpEarned;
    dailyProgress.wordsPracticed += wordsPracticed;
    dailyProgress.lessonsCompleted += lessonsCompleted;
    dailyProgress.quizzesTaken += quizzesTaken;
    dailyProgress.timeSpent += timeSpent;
    dailyProgress.updatedAt = now;

    // Update the record
    this.progressData.dailyProgress[date] = DailyProgressSchema.parse(dailyProgress);

    this.saveProgress();
  }

  /**
   * Get daily progress for a specific date
   * @param date The date in YYYY-MM-DD format
   * @returns DailyProgress or null if not found
   */
  getDailyProgress(date: string): DailyProgress | null {
    return this.progressData.dailyProgress[date] || null;
  }

  /**
   * Get all daily progress records
   * @returns Record of daily progress data
   */
  getAllDailyProgress(): Record<string, DailyProgress> {
    return this.progressData.dailyProgress;
  }

  /**
   * Get daily progress for the last N days
   * @param days Number of days to retrieve
   * @returns Array of daily progress records
   */
  getRecentDailyProgress(days: number = 7): DailyProgress[] {
    const today = new Date();
    const result: DailyProgress[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const progress = this.progressData.dailyProgress[dateStr];
      if (progress) {
        result.push(progress);
      }
    }

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  //#endregion

  //#region Overall Progress Tracking

  /**
   * Update overall progress with new activity
   * @param params Object containing progress updates
   */
  private updateOverallProgress(params: {
    xpEarned: number;
    wordsPracticed?: number;
    lessonsCompleted?: number;
    quizzesTaken?: number;
    timeSpent: number;
  }): void {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Update overall progress
    this.progressData.overallProgress.totalXP += params.xpEarned;
    this.progressData.overallProgress.totalWordsPracticed += params.wordsPracticed || 0;
    this.progressData.overallProgress.totalLessonsCompleted += params.lessonsCompleted || 0;
    this.progressData.overallProgress.totalQuizzesTaken += params.quizzesTaken || 0;
    this.progressData.overallProgress.totalTimeSpent += params.timeSpent;
    this.progressData.overallProgress.lastActiveDate = now;
    this.progressData.overallProgress.updatedAt = now;

    // Update level based on total XP
    const newLevel = calculateLevel(this.progressData.overallProgress.totalXP);
    if (newLevel > this.progressData.overallProgress.currentLevel) {
      this.progressData.overallProgress.currentLevel = newLevel;
      // Level up event is handled by the UI
    }

    // Update streak information
    this.updateStreak(today);

    // Record daily progress
    this.recordDailyProgress(
      today,
      params.xpEarned,
      params.wordsPracticed || 0,
      params.lessonsCompleted || 0,
      params.quizzesTaken || 0,
      params.timeSpent
    );

    // Update learning session
    learningSession.awardXP(params.xpEarned);

    this.saveProgress();
  }

  /**
   * Update streak information
   * @param today Today's date in YYYY-MM-DD format
   */
  private updateStreak(today: string): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If this is the first activity, initialize streak
    if (!this.progressData.overallProgress.lastActiveDate) {
      this.progressData.overallProgress.currentStreak = 1;
      this.progressData.overallProgress.longestStreak = 1;
      return;
    }

    // Check if the last activity was yesterday
    if (this.progressData.overallProgress.lastActiveDate === yesterdayStr) {
      // Continue the streak
      this.progressData.overallProgress.currentStreak++;
    } else if (this.progressData.overallProgress.lastActiveDate !== today) {
      // Streak is broken
      this.progressData.overallProgress.currentStreak = 1;
    }

    // Update longest streak if needed
    if (this.progressData.overallProgress.currentStreak > this.progressData.overallProgress.longestStreak) {
      this.progressData.overallProgress.longestStreak = this.progressData.overallProgress.currentStreak;
    }
  }

  /**
   * Get overall progress
   * @returns OverallProgress
   */
  getOverallProgress(): OverallProgress {
    return this.progressData.overallProgress;
  }

  /**
   * Get current level information
   * @returns Object containing level information
   */
  getLevelInfo(): { level: number; currentXP: number; nextLevelXP: number; progressPercentage: number } {
    const level = this.progressData.overallProgress.currentLevel;
    const currentXP = this.progressData.overallProgress.totalXP;
    const nextLevelXP = calculateXPForLevel(level + 1);
    const currentLevelXP = calculateXPForLevel(level);
    const xpInLevel = currentXP - currentLevelXP;
    const levelSpan = nextLevelXP - currentLevelXP;
    const progressPercentage = Math.min(100, Math.max(0, (xpInLevel / levelSpan) * 100));

    return {
      level,
      currentXP,
      nextLevelXP,
      progressPercentage
    };
  }

  /**
   * Award XP for an achievement
   * @param amount Amount of XP to award
   * @param reason Reason for awarding XP
   */
  awardXP(amount: number, _reason: string): void {
    this.updateOverallProgress({
      xpEarned: amount,
      timeSpent: 0
    });
  }

  //#endregion

  //#region Progress Data Management

  /**
   * Load progress data from localStorage
   */
  private loadProgress(): void {
    try {
      const savedData = LocalStorageManager.loadUserProgress();
      if (savedData) {
        // Validate and parse the saved data
        const parsedData = ProgressDataSchema.safeParse(savedData);
        if (parsedData.success) {
          this.progressData = parsedData.data;
        } else {
          // Invalid progress data, using default
          this.progressData = this.getDefaultProgressData();
        }
      }
    } catch (_error) {
      // Error loading progress data
      this.progressData = this.getDefaultProgressData();
    }
  }

  /**
   * Save progress data to localStorage
   */
  private saveProgress(): void {
    if (!browser) return;

    try {
      LocalStorageManager.saveUserProgress(this.progressData);
    } catch (_error) {
      // Error saving progress data
    }
  }

  /**
   * Export progress data as JSON
   * @returns JSON string of progress data
   */
  exportProgress(): string {
    return JSON.stringify(this.progressData, null, 2);
  }

  /**
   * Import progress data from JSON
   * @param jsonData JSON string of progress data
   * @throws Error if import fails
   */
  importProgress(jsonData: string): void {
    try {
      const parsedData = JSON.parse(jsonData);
      const validatedData = ProgressDataSchema.parse(parsedData);
      this.progressData = validatedData;
      this.saveProgress();
    } catch (_error) {
      // Error importing progress data
      throw new Error('Failed to import progress data');
    }
  }

  /**
   * Reset all progress data
   */
  resetProgress(): void {
    this.progressData = this.getDefaultProgressData();
    this.saveProgress();
  }

  //#endregion

  //#region Utility Methods

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
  } {
    const levelInfo = this.getLevelInfo();
    const overallProgress = this.getOverallProgress();
    const today = new Date().toISOString().split('T')[0];
    const dailyProgress = this.getDailyProgress(today) || { xpEarned: 0 };

    return {
      totalXP: overallProgress.totalXP,
      currentLevel: levelInfo.level,
      levelProgress: levelInfo.progressPercentage,
      wordsPracticed: overallProgress.totalWordsPracticed,
      lessonsCompleted: overallProgress.totalLessonsCompleted,
      quizzesTaken: overallProgress.totalQuizzesTaken,
      currentStreak: overallProgress.currentStreak,
      longestStreak: overallProgress.longestStreak,
      dailyGoalProgress: Math.min(100, (dailyProgress.xpEarned / learningSession.dailyTarget) * 100)
    };
  }

  /**
   * Get vocabulary mastery statistics
   * @returns Object containing vocabulary mastery statistics
   */
  getVocabularyMasteryStats(): {
    totalItems: number;
    masteredItems: number;
    masteryPercentage: number;
    averageMasteryLevel: number;
  } {
    const allItems = Object.values(this.progressData.vocabularyMastery);
    const masteredItems = allItems.filter(item => item.isMastered).length;
    const totalItems = allItems.length;

    const averageMasteryLevel = totalItems > 0
      ? allItems.reduce((sum, item) => sum + item.masteryLevel, 0) / totalItems
      : 0;

    const masteryPercentage = totalItems > 0
      ? (masteredItems / totalItems) * 100
      : 0;

    return {
      totalItems,
      masteredItems,
      masteryPercentage,
      averageMasteryLevel
    };
  }

  /**
   * Get lesson completion statistics
   * @returns Object containing lesson completion statistics
   */
  getLessonCompletionStats(): {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
  } {
    const allLessons = Object.values(this.progressData.lessonProgress);
    const completedLessons = allLessons.filter(lesson => lesson.status === 'completed').length;
    const totalLessons = allLessons.length;

    const completionPercentage = totalLessons > 0
      ? (completedLessons / totalLessons) * 100
      : 0;

    return {
      totalLessons,
      completedLessons,
      completionPercentage
    };
  }

  //#endregion
}

export const progressService = ProgressService.getInstance();