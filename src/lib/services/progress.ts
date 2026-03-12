/**
 * Progress Tracking Service
 *
 * This service provides comprehensive progress tracking functionality for the language learning application.
 * It handles vocabulary mastery, lesson completion, quiz performance, and overall user progress.
 *
 * Uses IndexedDB (via Dexie) for storage with localStorage fallback.
 */

import { v4 as uuidv4 } from 'uuid';
import { browser } from '$app/environment';
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
import { gameState } from '$lib/state/game-state.svelte';
import { ProgressError, StorageError, ValidationError, ErrorHandler } from './errors';
import { Debug } from '../utils';
import { ProgressDB } from '$lib/data/indexeddb';
import type { ProgressDataStore } from '$lib/data/indexeddb';

export class ProgressService {
  private progressData: ProgressData = this.getDefaultProgressData();
  private static instance: ProgressService | null = null;

  // XP values for different actions
  private static readonly XP_VALUES = {
    VOCABULARY_PRACTICE: 10,
    VOCABULARY_MASTERED: 50,
    LESSON_COMPLETED: 100,
    QUIZ_COMPLETED: 150,
    DAILY_GOAL: 200
  };

  constructor() {
    if (browser) {
      this.loadProgress();
    }
  }

  /**
   * Get the singleton instance of ProgressService
   * @deprecated Use DI container instead
   */
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
   * Record a vocabulary practice result using atomic transaction
   * @param itemId The ID of the vocabulary item
   * @param correct Whether the answer was correct
   * @param responseTime Response time in seconds (optional)
   * @throws ProgressError if recording fails
   */
  async recordVocabularyPractice(itemId: string, correct: boolean, responseTime?: number): Promise<void> {
    // Validate input parameters
    if (!itemId || typeof itemId !== 'string') {
      throw new ValidationError('Invalid item ID', { itemId });
    }
    if (typeof correct !== 'boolean') {
      throw new ValidationError('Invalid correct flag', { correct });
    }
    if (responseTime !== undefined && (typeof responseTime !== 'number' || responseTime < 0)) {
      throw new ValidationError('Invalid response time', { responseTime });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
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
        await this.updateOverallProgress({
            xpEarned: ProgressService.XP_VALUES.VOCABULARY_PRACTICE,
            wordsPracticed: 1,
            timeSpent: responseTime || 0
        });

        // Award bonus XP for mastering an item
        const updatedMastery = this.progressData.vocabularyMastery[itemId];
        if (updatedMastery && updatedMastery.isMastered && updatedMastery.totalAttempts === 1) {
            await this.awardXP(ProgressService.XP_VALUES.VOCABULARY_MASTERED, 'Vocabulary mastered');
        }

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record vocabulary practice', undefined);
        throw new ProgressError('Failed to record vocabulary practice', { itemId, error: error instanceof Error ? error : new Error(String(error)) });
    }
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
   * Record lesson progress using atomic transaction
   * @param lessonId The ID of the lesson
   * @param completionPercentage The percentage of completion (0-100)
   * @throws ProgressError if recording fails
   */
  async recordLessonProgress(lessonId: string, completionPercentage: number): Promise<void> {
    // Validate input parameters
    if (!lessonId || typeof lessonId !== 'string') {
      throw new ValidationError('Invalid lesson ID', { lessonId });
    }
    if (typeof completionPercentage !== 'number' || completionPercentage < 0 || completionPercentage > 100) {
      throw new ValidationError('Invalid completion percentage', { completionPercentage });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
        const now = new Date().toISOString();

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

        // Update overall progress if lesson is completed
        const updatedLessonProgress = this.progressData.lessonProgress[lessonId];
        if (updatedLessonProgress && updatedLessonProgress.status === 'completed' && updatedLessonProgress.completionPercentage === 100) {
            await this.updateOverallProgress({
                xpEarned: ProgressService.XP_VALUES.LESSON_COMPLETED,
                lessonsCompleted: 1,
                timeSpent: 0
            });
        }

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record lesson progress', undefined);
        throw new ProgressError('Failed to record lesson progress', { lessonId, completionPercentage, error });
    }
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
   * Record quiz performance using atomic transaction
   * @param quizId The ID of the quiz
   * @param score The score achieved (0-100)
   * @param totalQuestions Total number of questions
   * @param correctAnswers Number of correct answers
   * @param timeTaken Time taken in seconds
   * @param sessionId The session ID for this quiz attempt
   * @throws ProgressError if recording fails
   */
  async recordQuizPerformance(
    quizId: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    timeTaken: number,
    sessionId: string
  ): Promise<void> {
    // Validate input parameters
    if (!quizId || typeof quizId !== 'string') {
      throw new ValidationError('Invalid quiz ID', { quizId });
    }
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new ValidationError('Invalid score', { score });
    }
    if (typeof totalQuestions !== 'number' || totalQuestions <= 0) {
      throw new ValidationError('Invalid total questions', { totalQuestions });
    }
    if (typeof correctAnswers !== 'number' || correctAnswers < 0 || correctAnswers > totalQuestions) {
      throw new ValidationError('Invalid correct answers', { correctAnswers, totalQuestions });
    }
    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      throw new ValidationError('Invalid time taken', { timeTaken });
    }
    if (!sessionId || typeof sessionId !== 'string') {
      throw new ValidationError('Invalid session ID', { sessionId });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
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
        await this.updateOverallProgress({
            xpEarned: ProgressService.XP_VALUES.QUIZ_COMPLETED,
            quizzesTaken: 1,
            timeSpent: timeTaken
        });

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record quiz performance', undefined);
        throw new ProgressError('Failed to record quiz performance', { quizId, score, error });
    }
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
   * @throws ProgressError if recording fails
   */
  /**
   * Record question performance using atomic transaction
   * @param quizPerformanceId The ID of the quiz performance record
   * @param questionId The ID of the question
   * @param questionType The type of the question
   * @param wasCorrect Whether the answer was correct
   * @param userAnswer The user's answer
   * @param correctAnswer The correct answer
   * @param timeTaken Time taken in seconds
   * @throws ProgressError if recording fails
   */
  async recordQuestionPerformance(
    quizPerformanceId: string,
    questionId: string,
    questionType: string,
    wasCorrect: boolean,
    userAnswer: string | null,
    correctAnswer: string,
    timeTaken: number
  ): Promise<void> {
    // Validate input parameters
    if (!quizPerformanceId || typeof quizPerformanceId !== 'string') {
      throw new ValidationError('Invalid quiz performance ID', { quizPerformanceId });
    }
    if (!questionId || typeof questionId !== 'string') {
      throw new ValidationError('Invalid question ID', { questionId });
    }
    if (!questionType || typeof questionType !== 'string') {
      throw new ValidationError('Invalid question type', { questionType });
    }
    if (typeof wasCorrect !== 'boolean') {
      throw new ValidationError('Invalid wasCorrect flag', { wasCorrect });
    }
    if (userAnswer !== null && typeof userAnswer !== 'string') {
      throw new ValidationError('Invalid user answer', { userAnswer });
    }
    if (!correctAnswer || typeof correctAnswer !== 'string') {
      throw new ValidationError('Invalid correct answer', { correctAnswer });
    }
    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      throw new ValidationError('Invalid time taken', { timeTaken });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
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

        // Update vocabulary mastery if applicable
        if (questionType.includes('vocabulary') && questionId) {
            await this.recordVocabularyPractice(questionId, wasCorrect, timeTaken);
        }

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record question performance', undefined);
        throw new ProgressError('Failed to record question performance', { questionId, error: error instanceof Error ? error : new Error(String(error)) });
    }
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
   * Record daily progress using atomic transaction
   * @param date The date in YYYY-MM-DD format
   * @param xpEarned XP earned on this date
   * @param wordsPracticed Number of words practiced
   * @param lessonsCompleted Number of lessons completed
   * @param quizzesTaken Number of quizzes taken
   * @param timeSpent Time spent in seconds
   * @throws ProgressError if recording fails
   */
  async recordDailyProgress(
    date: string,
    xpEarned: number,
    wordsPracticed: number,
    lessonsCompleted: number,
    quizzesTaken: number,
    timeSpent: number
  ): Promise<void> {
    // Validate input parameters
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError('Invalid date format', { date });
    }
    if (typeof xpEarned !== 'number' || xpEarned < 0) {
      throw new ValidationError('Invalid XP earned', { xpEarned });
    }
    if (typeof wordsPracticed !== 'number' || wordsPracticed < 0) {
      throw new ValidationError('Invalid words practiced', { wordsPracticed });
    }
    if (typeof lessonsCompleted !== 'number' || lessonsCompleted < 0) {
      throw new ValidationError('Invalid lessons completed', { lessonsCompleted });
    }
    if (typeof quizzesTaken !== 'number' || quizzesTaken < 0) {
      throw new ValidationError('Invalid quizzes taken', { quizzesTaken });
    }
    if (typeof timeSpent !== 'number' || timeSpent < 0) {
      throw new ValidationError('Invalid time spent', { timeSpent });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
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

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record daily progress', undefined);
        throw new ProgressError('Failed to record daily progress', { date, error: error instanceof Error ? error : new Error(String(error)) });
    }
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
      const dateStr = date.toISOString().split('T')[0] as string;
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
   * Update overall progress with new activity using atomic transaction
   * @param params Object containing progress updates
   * @throws ValidationError if input parameters are invalid
   */
  private async updateOverallProgress(params: {
    xpEarned: number;
    wordsPracticed?: number;
    lessonsCompleted?: number;
    quizzesTaken?: number;
    timeSpent: number;
  }): Promise<void> {
    // Validate input parameters
    if (typeof params.xpEarned !== 'number' || params.xpEarned < 0) {
      throw new ValidationError('Invalid XP earned', { xpEarned: params.xpEarned });
    }
    if (params.wordsPracticed !== undefined && (typeof params.wordsPracticed !== 'number' || params.wordsPracticed < 0)) {
      throw new ValidationError('Invalid words practiced', { wordsPracticed: params.wordsPracticed });
    }
    if (params.lessonsCompleted !== undefined && (typeof params.lessonsCompleted !== 'number' || params.lessonsCompleted < 0)) {
      throw new ValidationError('Invalid lessons completed', { lessonsCompleted: params.lessonsCompleted });
    }
    if (params.quizzesTaken !== undefined && (typeof params.quizzesTaken !== 'number' || params.quizzesTaken < 0)) {
      throw new ValidationError('Invalid quizzes taken', { quizzesTaken: params.quizzesTaken });
    }
    if (typeof params.timeSpent !== 'number' || params.timeSpent < 0) {
      throw new ValidationError('Invalid time spent', { timeSpent: params.timeSpent });
    }
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
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
        }

        // Update streak information
        if (today) {
            this.updateStreak(today);
        }

        // Record daily progress
        if (today) {
            await this.recordDailyProgress(
                today,
                params.xpEarned,
                params.wordsPracticed || 0,
                params.lessonsCompleted || 0,
                params.quizzesTaken || 0,
                params.timeSpent
            );
        }

        // Update game state with XP
        gameState.addXP(params.xpEarned, 'Progress update');

        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to update overall progress', undefined);
        throw new ProgressError('Failed to update overall progress', { error });
    }
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
   * @throws ValidationError if input parameters are invalid
   */
  async awardXP(amount: number, reason: string): Promise<void> {
    // Validate input parameters
    if (typeof amount !== 'number' || amount <= 0) {
      throw new ValidationError('Invalid XP amount', { amount });
    }
    if (!reason || typeof reason !== 'string') {
      throw new ValidationError('Invalid reason', { reason });
    }

    await this.updateOverallProgress({
      xpEarned: amount,
      timeSpent: 0
    });
  }

  /**
   * Get the current progress data
   * @returns The current progress data
   */
  getProgressData(): ProgressData {
    return this.progressData;
  }

  /**
   * Validate and repair progress data if corrupted
   * @throws ValidationError if data cannot be repaired
   */
  async validateAndRepairProgressData(): Promise<void> {
    try {
      // Validate the current progress data
      ProgressDataSchema.parse(this.progressData);

      // If validation passes, data is valid
      return;
    } catch (validationError: unknown) {
      // If validation fails, try to repair the data
      ErrorHandler.handleError(validationError as Error, 'Progress data validation failed, attempting repair', undefined);

      try {
        // Create a new default progress data structure
        const defaultProgressData = this.getDefaultProgressData();

        // Attempt to salvage valid data from the corrupted structure
        const repairedData: ProgressData = {
          vocabularyMastery: {},
          lessonProgress: {},
          quizPerformance: {},
          questionPerformance: {},
          dailyProgress: {},
          overallProgress: defaultProgressData.overallProgress
        };

        // Repair vocabulary mastery data
        for (const [itemId, mastery] of Object.entries(this.progressData.vocabularyMastery)) {
          try {
            repairedData.vocabularyMastery[itemId] = VocabularyMasterySchema.parse(mastery);
          } catch {
            // If parsing fails, skip this item
            ErrorHandler.handleError(new Error('Invalid vocabulary mastery data'), `Failed to repair vocabulary mastery item ${itemId}`, undefined);
          }
        }

        // Repair lesson progress data
        for (const [lessonId, lesson] of Object.entries(this.progressData.lessonProgress)) {
          try {
            repairedData.lessonProgress[lessonId] = LessonProgressSchema.parse(lesson);
          } catch {
            // If parsing fails, skip this item
            ErrorHandler.handleError(new Error('Invalid lesson progress data'), `Failed to repair lesson progress item ${lessonId}`, undefined);
          }
        }

        // Repair quiz performance data
        for (const [quizId, quiz] of Object.entries(this.progressData.quizPerformance)) {
          try {
            repairedData.quizPerformance[quizId] = QuizPerformanceSchema.parse(quiz);
          } catch {
            // If parsing fails, skip this item
            ErrorHandler.handleError(new Error('Invalid quiz performance data'), `Failed to repair quiz performance item ${quizId}`, undefined);
          }
        }

        // Repair question performance data
        for (const [questionId, question] of Object.entries(this.progressData.questionPerformance)) {
          try {
            repairedData.questionPerformance[questionId] = QuestionPerformanceSchema.parse(question);
          } catch {
            // If parsing fails, skip this item
            ErrorHandler.handleError(new Error('Invalid question performance data'), `Failed to repair question performance item ${questionId}`, undefined);
          }
        }

        // Repair daily progress data
        for (const [date, daily] of Object.entries(this.progressData.dailyProgress)) {
          try {
            // Validate date format
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              repairedData.dailyProgress[date] = DailyProgressSchema.parse(daily);
            }
          } catch {
            // If parsing fails, skip this item
            ErrorHandler.handleError(new Error('Invalid daily progress data'), `Failed to repair daily progress item ${date}`, undefined);
          }
        }

        // Update the progress data with the repaired version
        this.progressData = repairedData;

        // Save the repaired data
        await this.saveProgress();

        // Log successful repair
        ErrorHandler.handleError(new Error('Progress data repair completed'), 'Successfully repaired progress data', undefined);

      } catch (repairError: unknown) {
        ErrorHandler.handleError(repairError as Error, 'Failed to repair progress data', undefined);
        throw new ValidationError('Failed to repair corrupted progress data', { validationError, repairError });
      }
    }
  }

  /**
   * Check if progress data is valid
   * @returns boolean indicating if data is valid
   */
  isProgressDataValid(): boolean {
    try {
      ProgressDataSchema.parse(this.progressData);
      return true;
    } catch {
      return false;
    }
  }

  //#endregion

  //#region Progress Data Management

 /**
  * Load progress data from localStorage
  * @throws StorageError if loading fails
  */

  /**
   * Load progress data
   * Uses IndexedDB first, then falls back to localStorage
   * @throws StorageError if loading fails
   */
  public async loadProgress(): Promise<void> {
    try {
        if (!browser) {
            Debug.log('ProgressService', 'Not in browser environment, skipping loadProgress');
            return;
        }

        // Try IndexedDB first
        try {
            const indexedDBData = await ProgressDB.getProgress();
            if (indexedDBData) {
                // Validate the data against our schema
                try {
                    const validatedData = ProgressDataSchema.parse(indexedDBData);
                    this.progressData = validatedData;
                    Debug.log('ProgressService', 'Progress loaded from IndexedDB');
                    return;
                } catch (validationError: unknown) {
                    Debug.log('ProgressService', 'IndexedDB data validation failed', { error: validationError });
                    // Continue to try localStorage
                }
            }
        } catch (e) {
            Debug.log('ProgressService', 'IndexedDB read error, trying localStorage', { error: e });
        }

        // Check for old data first - if it exists, migrate it regardless of new data
        const oldDataExists = localStorage.getItem('tandem_user_progress') !== null;

        if (oldDataExists) {
            await this.migrateOldProgressData();
            return;
        }

        // Try to load the new progress data format from localStorage
        const savedData = localStorage.getItem('tandem_progress_data');

        if (savedData) {
            // Parse the saved data
            const parsedData = JSON.parse(savedData);

            // Validate the data against our schema
            try {
              const validatedData = ProgressDataSchema.parse(parsedData);
              this.progressData = validatedData;
              
              // Migrate to IndexedDB
              try {
                await this.saveProgress();
              } catch (e) {
                Debug.log('ProgressService', 'Failed to migrate to IndexedDB', { error: e });
              }
              return;
            } catch (validationError: unknown) {
              ErrorHandler.handleError(validationError as Error, 'Data validation failed during progress load, attempting repair', undefined);

              // Try to repair the corrupted data
              try {
                // Create a temporary instance to validate and repair
                this.progressData = parsedData; // Temporarily set corrupted data

                // Attempt to validate and repair
                await this.validateAndRepairProgressData();

                // If repair succeeds, log and continue
                ErrorHandler.handleError(new Error('Progress data repair successful'), 'Successfully repaired corrupted progress data', undefined);
                return;
              } catch (repairError: unknown) {
                ErrorHandler.handleError(repairError as Error, 'Failed to repair corrupted progress data', undefined);
                    this.progressData = this.getDefaultProgressData();
                    await this.saveProgress(); // Save the default data to overwrite invalid data
                    throw new ValidationError('Invalid progress data format and repair failed', { validationError, repairError });
                }
            }
        }

        // If no data found, use default data
        this.progressData = this.getDefaultProgressData();
        await this.saveProgress(); // Save the default data

    } catch (error: unknown) {
        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to load progress data', undefined);
        this.progressData = this.getDefaultProgressData();
        throw new StorageError('Failed to load progress data', { error });
    }
  }

  /**
   * Save progress data
   * Uses IndexedDB first, then falls back to localStorage
   * @throws StorageError if saving fails
   */
  async saveProgress(): Promise<void> {
    try {
        if (!browser) return;

        // Try IndexedDB first
        try {
            const progressDataStore: ProgressDataStore = {
                vocabularyMastery: this.progressData.vocabularyMastery,
                lessonProgress: this.progressData.lessonProgress,
                quizPerformance: this.progressData.quizPerformance,
                questionPerformance: this.progressData.questionPerformance,
                dailyProgress: this.progressData.dailyProgress,
                overallProgress: this.progressData.overallProgress
            };
            await ProgressDB.saveProgress(progressDataStore);
            Debug.log('ProgressService', 'Progress saved to IndexedDB');
        } catch (e) {
            Debug.log('ProgressService', 'Failed to save to IndexedDB, using localStorage fallback', { error: e });
            // Fallback to localStorage
            localStorage.setItem('tandem_progress_data', JSON.stringify(this.progressData));
        }

    } catch (error: unknown) {
        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to save progress data', undefined);
        throw new StorageError('Failed to save progress data', { error });
    }
   }

  /**
   * Migrate old progress data to new format if needed
   * @throws StorageError if migration fails
   */
  private async migrateOldProgressData(): Promise<void> {
    try {
        // Use the same browser detection as loadProgress for consistency
        const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
        if (!isBrowser) return;

        // Check for old LocalStorageManager data
        const oldData = localStorage.getItem('tandem_user_progress');
        if (!oldData) {
            return;
        }

        // Parse the old data format
        const parsedOldData = JSON.parse(oldData);

        // Create new progress data structure from old data
        const newProgressData = this.getDefaultProgressData();

        // Migrate vocabulary mastery data from old stats
        if (parsedOldData.stats) {
            Object.entries(parsedOldData.stats).forEach(([itemId, stat]: [string, any]) => {
                if (stat && typeof stat.correct === 'number' && typeof stat.incorrect === 'number') {
                    const now = new Date().toISOString();
                    newProgressData.vocabularyMastery[itemId] = {
                        id: uuidv4(),
                        itemId,
                        correctCount: stat.correct,
                        incorrectCount: stat.incorrect,
                        totalAttempts: stat.correct + stat.incorrect,
                        lastPracticed: stat.lastPracticed || now,
                        masteryLevel: calculateMasteryLevel(stat.correct, stat.incorrect),
                        isMastered: isItemMastered(calculateMasteryLevel(stat.correct, stat.incorrect)),
                        createdAt: now,
                        updatedAt: now
                    };
                }
            });
        }

        // Save the migrated data
        this.progressData = newProgressData;
        await this.saveProgress();

        // Remove the old data to prevent future migration attempts
        localStorage.removeItem('tandem_user_progress');

    } catch (error: unknown) {
        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to migrate old progress data', undefined);
        throw new StorageError('Failed to migrate old progress data', { error });
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
  * Import progress data using atomic transaction
  * @param jsonData JSON string of progress data
  * @throws ValidationError if data validation fails
  * @throws StorageError if saving fails
  */
  async importProgress(jsonData: string): Promise<void> {
    // Validate input parameter
    if (!jsonData || typeof jsonData !== 'string') {
      throw new ValidationError('Invalid JSON data', { jsonData });
    }

    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
        const parsedData = JSON.parse(jsonData);
        const validatedData = ProgressDataSchema.parse(parsedData);
        this.progressData = validatedData;
        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to import progress data', undefined);
        throw new ValidationError('Failed to import progress data', { error });
    }
  }

  /**
   * Reset all progress data
   * @throws StorageError if saving fails
   */
  async resetProgress(): Promise<void> {
    // Store original state for rollback on error
    const originalProgressData = JSON.parse(JSON.stringify(this.progressData));

    try {
        this.progressData = this.getDefaultProgressData();
        await this.saveProgress();

    } catch (error: unknown) {
        // Restore original state on error
        this.progressData = originalProgressData;

        ErrorHandler.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to reset progress data', undefined);
        throw new StorageError('Failed to reset progress data', { error });
    }
  }

  /**
   * Force migration of old progress data
   * @throws StorageError if migration fails
   */
  public async forceMigration(): Promise<void> {
    Debug.log('ProgressService', 'Forcing migration of old progress data');
    // Use the same browser detection as loadProgress for consistency
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    if (isBrowser) {
      await this.migrateOldProgressData();
    }
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
    dailyXP: number;
  } {
    const levelInfo = this.getLevelInfo();
    const overallProgress = this.getOverallProgress();
    const today = new Date().toISOString().split('T')[0];
    const dailyProgress = (today ? this.getDailyProgress(today) : null) || { xpEarned: 0 };

    // Get the daily target - use a reasonable default to avoid circular dependency
    const dailyTarget = 50; // Default daily target
    const dailyXP = dailyProgress.xpEarned;

    return {
      totalXP: overallProgress.totalXP,
      currentLevel: levelInfo.level,
      levelProgress: levelInfo.progressPercentage,
      wordsPracticed: overallProgress.totalWordsPracticed,
      lessonsCompleted: overallProgress.totalLessonsCompleted,
      quizzesTaken: overallProgress.totalQuizzesTaken,
      currentStreak: overallProgress.currentStreak,
      longestStreak: overallProgress.longestStreak,
      dailyGoalProgress: Math.min(100, (dailyXP / dailyTarget) * 100),
      dailyXP: dailyXP
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

// Export the ProgressService class for use with dependency injection
