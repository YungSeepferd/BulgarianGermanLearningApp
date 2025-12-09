import { z } from 'zod';
export declare const QuizQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    question: z.ZodString;
    questionType: z.ZodEnum<["multiple_choice", "true_false", "fill_blank", "matching"]>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctAnswer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    difficulty: z.ZodEnum<["A1", "A2", "B1", "B2", "C1"]>;
    category: z.ZodArray<z.ZodString, "many">;
    vocabularyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    explanation: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1";
    id: string;
    createdAt: string;
    updatedAt: string;
    questionType: "multiple_choice" | "true_false" | "fill_blank" | "matching";
    correctAnswer: string | string[];
    question: string;
    category: string[];
    options?: string[] | undefined;
    vocabularyIds?: string[] | undefined;
    explanation?: string | undefined;
}, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1";
    id: string;
    createdAt: string;
    updatedAt: string;
    questionType: "multiple_choice" | "true_false" | "fill_blank" | "matching";
    correctAnswer: string | string[];
    question: string;
    category: string[];
    options?: string[] | undefined;
    vocabularyIds?: string[] | undefined;
    explanation?: string | undefined;
}>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export declare const QuizSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "Mixed"]>;
    type: z.ZodEnum<["vocabulary", "grammar", "mixed"]>;
    questions: z.ZodArray<z.ZodString, "many">;
    estimatedTime: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed";
    type: "grammar" | "vocabulary" | "mixed";
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    title: string;
    questions: string[];
    estimatedTime: number;
}, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed";
    type: "grammar" | "vocabulary" | "mixed";
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    title: string;
    questions: string[];
    estimatedTime: number;
}>;
export type Quiz = z.infer<typeof QuizSchema>;
export declare const QuizSessionSchema: z.ZodObject<{
    id: z.ZodString;
    quizId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    questions: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        userAnswer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        isCorrect: z.ZodOptional<z.ZodBoolean>;
        timeTaken: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        timeTaken?: number | undefined;
        userAnswer?: string | string[] | undefined;
        isCorrect?: boolean | undefined;
    }, {
        questionId: string;
        timeTaken?: number | undefined;
        userAnswer?: string | string[] | undefined;
        isCorrect?: boolean | undefined;
    }>, "many">;
    score: z.ZodOptional<z.ZodNumber>;
    totalQuestions: z.ZodNumber;
    status: z.ZodEnum<["in_progress", "completed", "abandoned"]>;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "in_progress" | "abandoned";
    id: string;
    createdAt: string;
    updatedAt: string;
    quizId: string;
    totalQuestions: number;
    questions: {
        questionId: string;
        timeTaken?: number | undefined;
        userAnswer?: string | string[] | undefined;
        isCorrect?: boolean | undefined;
    }[];
    startedAt: string;
    userId?: string | undefined;
    score?: number | undefined;
    completedAt?: string | undefined;
}, {
    status: "completed" | "in_progress" | "abandoned";
    id: string;
    createdAt: string;
    updatedAt: string;
    quizId: string;
    totalQuestions: number;
    questions: {
        questionId: string;
        timeTaken?: number | undefined;
        userAnswer?: string | string[] | undefined;
        isCorrect?: boolean | undefined;
    }[];
    startedAt: string;
    userId?: string | undefined;
    score?: number | undefined;
    completedAt?: string | undefined;
}>;
export type QuizSession = z.infer<typeof QuizSessionSchema>;
export declare const QuizCriteriaSchema: z.ZodObject<{
    difficulty: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "Mixed"]>>;
    type: z.ZodOptional<z.ZodEnum<["vocabulary", "grammar", "mixed"]>>;
    category: z.ZodOptional<z.ZodString>;
    questionTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["multiple_choice", "true_false", "fill_blank", "matching"]>, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
    estimatedTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    difficulty?: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed" | undefined;
    limit?: number | undefined;
    type?: "grammar" | "vocabulary" | "mixed" | undefined;
    category?: string | undefined;
    estimatedTime?: number | undefined;
    questionTypes?: ("multiple_choice" | "true_false" | "fill_blank" | "matching")[] | undefined;
}, {
    difficulty?: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed" | undefined;
    limit?: number | undefined;
    type?: "grammar" | "vocabulary" | "mixed" | undefined;
    category?: string | undefined;
    estimatedTime?: number | undefined;
    questionTypes?: ("multiple_choice" | "true_false" | "fill_blank" | "matching")[] | undefined;
}>;
export type QuizCriteria = z.infer<typeof QuizCriteriaSchema>;
//# sourceMappingURL=quiz.d.ts.map