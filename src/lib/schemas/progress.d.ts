/**
 * Progress Tracking Schema
 *
 * This module defines the Zod schemas for tracking user progress in the language learning application.
 * It includes schemas for vocabulary mastery, lesson completion, quiz performance, and overall progress.
 */
import { z } from 'zod';
export declare const VocabularyMasterySchema: z.ZodObject<{
    id: z.ZodString;
    itemId: z.ZodString;
    correctCount: z.ZodDefault<z.ZodNumber>;
    incorrectCount: z.ZodDefault<z.ZodNumber>;
    totalAttempts: z.ZodDefault<z.ZodNumber>;
    lastPracticed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    masteryLevel: z.ZodDefault<z.ZodNumber>;
    isMastered: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    lastPracticed: string | null;
    itemId: string;
    correctCount: number;
    incorrectCount: number;
    totalAttempts: number;
    masteryLevel: number;
    isMastered: boolean;
}, {
    id: string;
    itemId: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    lastPracticed?: string | null | undefined;
    correctCount?: number | undefined;
    incorrectCount?: number | undefined;
    totalAttempts?: number | undefined;
    masteryLevel?: number | undefined;
    isMastered?: boolean | undefined;
}>;
export type VocabularyMastery = z.infer<typeof VocabularyMasterySchema>;
export declare const LessonProgressSchema: z.ZodObject<{
    id: z.ZodString;
    lessonId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["not_started", "in_progress", "completed", "mastered"]>>;
    completionPercentage: z.ZodDefault<z.ZodNumber>;
    lastAccessed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    completedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "not_started" | "in_progress" | "mastered";
    id: string;
    createdAt: string;
    updatedAt: string;
    completionPercentage: number;
    lessonId: string;
    lastAccessed: string | null;
    completedAt: string | null;
    userId?: string | undefined;
}, {
    id: string;
    lessonId: string;
    status?: "completed" | "not_started" | "in_progress" | "mastered" | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    userId?: string | undefined;
    completionPercentage?: number | undefined;
    lastAccessed?: string | null | undefined;
    completedAt?: string | null | undefined;
}>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export declare const QuizPerformanceSchema: z.ZodObject<{
    id: z.ZodString;
    quizId: z.ZodString;
    sessionId: z.ZodString;
    score: z.ZodDefault<z.ZodNumber>;
    totalQuestions: z.ZodDefault<z.ZodNumber>;
    correctAnswers: z.ZodDefault<z.ZodNumber>;
    incorrectAnswers: z.ZodDefault<z.ZodNumber>;
    timeTaken: z.ZodDefault<z.ZodNumber>;
    completedAt: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    completedAt: string;
    quizId: string;
    sessionId: string;
    totalQuestions: number;
    timeTaken: number;
}, {
    id: string;
    quizId: string;
    sessionId: string;
    createdAt?: string | undefined;
    score?: number | undefined;
    correctAnswers?: number | undefined;
    incorrectAnswers?: number | undefined;
    completedAt?: string | undefined;
    totalQuestions?: number | undefined;
    timeTaken?: number | undefined;
}>;
export type QuizPerformance = z.infer<typeof QuizPerformanceSchema>;
export declare const QuestionPerformanceSchema: z.ZodObject<{
    id: z.ZodString;
    quizPerformanceId: z.ZodString;
    questionId: z.ZodString;
    questionType: z.ZodString;
    wasCorrect: z.ZodDefault<z.ZodBoolean>;
    userAnswer: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    correctAnswer: z.ZodString;
    timeTaken: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    timeTaken: number;
    quizPerformanceId: string;
    questionId: string;
    questionType: string;
    wasCorrect: boolean;
    userAnswer: string | null;
    correctAnswer: string;
}, {
    id: string;
    quizPerformanceId: string;
    questionId: string;
    questionType: string;
    correctAnswer: string;
    createdAt?: string | undefined;
    timeTaken?: number | undefined;
    wasCorrect?: boolean | undefined;
    userAnswer?: string | null | undefined;
}>;
export type QuestionPerformance = z.infer<typeof QuestionPerformanceSchema>;
export declare const DailyProgressSchema: z.ZodObject<{
    id: z.ZodString;
    date: z.ZodDefault<z.ZodString>;
    xpEarned: z.ZodDefault<z.ZodNumber>;
    wordsPracticed: z.ZodDefault<z.ZodNumber>;
    lessonsCompleted: z.ZodDefault<z.ZodNumber>;
    quizzesTaken: z.ZodDefault<z.ZodNumber>;
    timeSpent: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    xpEarned: number;
    wordsPracticed: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    timeSpent: number;
}, {
    id: string;
    date?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    xpEarned?: number | undefined;
    wordsPracticed?: number | undefined;
    lessonsCompleted?: number | undefined;
    quizzesTaken?: number | undefined;
    timeSpent?: number | undefined;
}>;
export type DailyProgress = z.infer<typeof DailyProgressSchema>;
export declare const OverallProgressSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    totalXP: z.ZodDefault<z.ZodNumber>;
    totalWordsPracticed: z.ZodDefault<z.ZodNumber>;
    totalLessonsCompleted: z.ZodDefault<z.ZodNumber>;
    totalQuizzesTaken: z.ZodDefault<z.ZodNumber>;
    totalTimeSpent: z.ZodDefault<z.ZodNumber>;
    currentLevel: z.ZodDefault<z.ZodNumber>;
    currentStreak: z.ZodDefault<z.ZodNumber>;
    longestStreak: z.ZodDefault<z.ZodNumber>;
    lastActiveDate: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    totalXP: number;
    totalWordsPracticed: number;
    totalLessonsCompleted: number;
    totalQuizzesTaken: number;
    totalTimeSpent: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    userId?: string | undefined;
}, {
    id: string;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    userId?: string | undefined;
    totalXP?: number | undefined;
    totalWordsPracticed?: number | undefined;
    totalLessonsCompleted?: number | undefined;
    totalQuizzesTaken?: number | undefined;
    totalTimeSpent?: number | undefined;
    currentLevel?: number | undefined;
    currentStreak?: number | undefined;
    longestStreak?: number | undefined;
    lastActiveDate?: string | null | undefined;
}>;
export type OverallProgress = z.infer<typeof OverallProgressSchema>;
export declare const ProgressDataSchema: z.ZodObject<{
    vocabularyMastery: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        itemId: z.ZodString;
        correctCount: z.ZodDefault<z.ZodNumber>;
        incorrectCount: z.ZodDefault<z.ZodNumber>;
        totalAttempts: z.ZodDefault<z.ZodNumber>;
        lastPracticed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        masteryLevel: z.ZodDefault<z.ZodNumber>;
        isMastered: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDefault<z.ZodString>;
        updatedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        lastPracticed: string | null;
        itemId: string;
        correctCount: number;
        incorrectCount: number;
        totalAttempts: number;
        masteryLevel: number;
        isMastered: boolean;
    }, {
        id: string;
        itemId: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        lastPracticed?: string | null | undefined;
        correctCount?: number | undefined;
        incorrectCount?: number | undefined;
        totalAttempts?: number | undefined;
        masteryLevel?: number | undefined;
        isMastered?: boolean | undefined;
    }>>;
    lessonProgress: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        lessonId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["not_started", "in_progress", "completed", "mastered"]>>;
        completionPercentage: z.ZodDefault<z.ZodNumber>;
        lastAccessed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        completedAt: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodDefault<z.ZodString>;
        updatedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "not_started" | "in_progress" | "mastered";
        id: string;
        createdAt: string;
        updatedAt: string;
        completionPercentage: number;
        lessonId: string;
        lastAccessed: string | null;
        completedAt: string | null;
        userId?: string | undefined;
    }, {
        id: string;
        lessonId: string;
        status?: "completed" | "not_started" | "in_progress" | "mastered" | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        userId?: string | undefined;
        completionPercentage?: number | undefined;
        lastAccessed?: string | null | undefined;
        completedAt?: string | null | undefined;
    }>>;
    quizPerformance: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        quizId: z.ZodString;
        sessionId: z.ZodString;
        score: z.ZodDefault<z.ZodNumber>;
        totalQuestions: z.ZodDefault<z.ZodNumber>;
        correctAnswers: z.ZodDefault<z.ZodNumber>;
        incorrectAnswers: z.ZodDefault<z.ZodNumber>;
        timeTaken: z.ZodDefault<z.ZodNumber>;
        completedAt: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        score: number;
        correctAnswers: number;
        incorrectAnswers: number;
        completedAt: string;
        quizId: string;
        sessionId: string;
        totalQuestions: number;
        timeTaken: number;
    }, {
        id: string;
        quizId: string;
        sessionId: string;
        createdAt?: string | undefined;
        score?: number | undefined;
        correctAnswers?: number | undefined;
        incorrectAnswers?: number | undefined;
        completedAt?: string | undefined;
        totalQuestions?: number | undefined;
        timeTaken?: number | undefined;
    }>>;
    questionPerformance: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        quizPerformanceId: z.ZodString;
        questionId: z.ZodString;
        questionType: z.ZodString;
        wasCorrect: z.ZodDefault<z.ZodBoolean>;
        userAnswer: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        correctAnswer: z.ZodString;
        timeTaken: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        timeTaken: number;
        quizPerformanceId: string;
        questionId: string;
        questionType: string;
        wasCorrect: boolean;
        userAnswer: string | null;
        correctAnswer: string;
    }, {
        id: string;
        quizPerformanceId: string;
        questionId: string;
        questionType: string;
        correctAnswer: string;
        createdAt?: string | undefined;
        timeTaken?: number | undefined;
        wasCorrect?: boolean | undefined;
        userAnswer?: string | null | undefined;
    }>>;
    dailyProgress: z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        date: z.ZodDefault<z.ZodString>;
        xpEarned: z.ZodDefault<z.ZodNumber>;
        wordsPracticed: z.ZodDefault<z.ZodNumber>;
        lessonsCompleted: z.ZodDefault<z.ZodNumber>;
        quizzesTaken: z.ZodDefault<z.ZodNumber>;
        timeSpent: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDefault<z.ZodString>;
        updatedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        xpEarned: number;
        wordsPracticed: number;
        lessonsCompleted: number;
        quizzesTaken: number;
        timeSpent: number;
    }, {
        id: string;
        date?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        xpEarned?: number | undefined;
        wordsPracticed?: number | undefined;
        lessonsCompleted?: number | undefined;
        quizzesTaken?: number | undefined;
        timeSpent?: number | undefined;
    }>>;
    overallProgress: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        totalXP: z.ZodDefault<z.ZodNumber>;
        totalWordsPracticed: z.ZodDefault<z.ZodNumber>;
        totalLessonsCompleted: z.ZodDefault<z.ZodNumber>;
        totalQuizzesTaken: z.ZodDefault<z.ZodNumber>;
        totalTimeSpent: z.ZodDefault<z.ZodNumber>;
        currentLevel: z.ZodDefault<z.ZodNumber>;
        currentStreak: z.ZodDefault<z.ZodNumber>;
        longestStreak: z.ZodDefault<z.ZodNumber>;
        lastActiveDate: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodDefault<z.ZodString>;
        updatedAt: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        totalXP: number;
        totalWordsPracticed: number;
        totalLessonsCompleted: number;
        totalQuizzesTaken: number;
        totalTimeSpent: number;
        currentLevel: number;
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        userId?: string | undefined;
    }, {
        id: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        userId?: string | undefined;
        totalXP?: number | undefined;
        totalWordsPracticed?: number | undefined;
        totalLessonsCompleted?: number | undefined;
        totalQuizzesTaken?: number | undefined;
        totalTimeSpent?: number | undefined;
        currentLevel?: number | undefined;
        currentStreak?: number | undefined;
        longestStreak?: number | undefined;
        lastActiveDate?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    vocabularyMastery: Record<string, {
        id: string;
        createdAt: string;
        updatedAt: string;
        lastPracticed: string | null;
        itemId: string;
        correctCount: number;
        incorrectCount: number;
        totalAttempts: number;
        masteryLevel: number;
        isMastered: boolean;
    }>;
    lessonProgress: Record<string, {
        status: "completed" | "not_started" | "in_progress" | "mastered";
        id: string;
        createdAt: string;
        updatedAt: string;
        completionPercentage: number;
        lessonId: string;
        lastAccessed: string | null;
        completedAt: string | null;
        userId?: string | undefined;
    }>;
    quizPerformance: Record<string, {
        id: string;
        createdAt: string;
        score: number;
        correctAnswers: number;
        incorrectAnswers: number;
        completedAt: string;
        quizId: string;
        sessionId: string;
        totalQuestions: number;
        timeTaken: number;
    }>;
    questionPerformance: Record<string, {
        id: string;
        createdAt: string;
        timeTaken: number;
        quizPerformanceId: string;
        questionId: string;
        questionType: string;
        wasCorrect: boolean;
        userAnswer: string | null;
        correctAnswer: string;
    }>;
    dailyProgress: Record<string, {
        date: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        xpEarned: number;
        wordsPracticed: number;
        lessonsCompleted: number;
        quizzesTaken: number;
        timeSpent: number;
    }>;
    overallProgress: {
        id: string;
        createdAt: string;
        updatedAt: string;
        totalXP: number;
        totalWordsPracticed: number;
        totalLessonsCompleted: number;
        totalQuizzesTaken: number;
        totalTimeSpent: number;
        currentLevel: number;
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        userId?: string | undefined;
    };
}, {
    vocabularyMastery: Record<string, {
        id: string;
        itemId: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        lastPracticed?: string | null | undefined;
        correctCount?: number | undefined;
        incorrectCount?: number | undefined;
        totalAttempts?: number | undefined;
        masteryLevel?: number | undefined;
        isMastered?: boolean | undefined;
    }>;
    lessonProgress: Record<string, {
        id: string;
        lessonId: string;
        status?: "completed" | "not_started" | "in_progress" | "mastered" | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        userId?: string | undefined;
        completionPercentage?: number | undefined;
        lastAccessed?: string | null | undefined;
        completedAt?: string | null | undefined;
    }>;
    quizPerformance: Record<string, {
        id: string;
        quizId: string;
        sessionId: string;
        createdAt?: string | undefined;
        score?: number | undefined;
        correctAnswers?: number | undefined;
        incorrectAnswers?: number | undefined;
        completedAt?: string | undefined;
        totalQuestions?: number | undefined;
        timeTaken?: number | undefined;
    }>;
    questionPerformance: Record<string, {
        id: string;
        quizPerformanceId: string;
        questionId: string;
        questionType: string;
        correctAnswer: string;
        createdAt?: string | undefined;
        timeTaken?: number | undefined;
        wasCorrect?: boolean | undefined;
        userAnswer?: string | null | undefined;
    }>;
    dailyProgress: Record<string, {
        id: string;
        date?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        xpEarned?: number | undefined;
        wordsPracticed?: number | undefined;
        lessonsCompleted?: number | undefined;
        quizzesTaken?: number | undefined;
        timeSpent?: number | undefined;
    }>;
    overallProgress: {
        id: string;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        userId?: string | undefined;
        totalXP?: number | undefined;
        totalWordsPracticed?: number | undefined;
        totalLessonsCompleted?: number | undefined;
        totalQuizzesTaken?: number | undefined;
        totalTimeSpent?: number | undefined;
        currentLevel?: number | undefined;
        currentStreak?: number | undefined;
        longestStreak?: number | undefined;
        lastActiveDate?: string | null | undefined;
    };
}>;
export type ProgressData = z.infer<typeof ProgressDataSchema>;
export declare const calculateMasteryLevel: (correct: number, incorrect: number) => number;
export declare const isItemMastered: (masteryLevel: number) => boolean;
export declare const calculateLevel: (totalXP: number) => number;
export declare const calculateXPForLevel: (level: number) => number;
//# sourceMappingURL=progress.d.ts.map