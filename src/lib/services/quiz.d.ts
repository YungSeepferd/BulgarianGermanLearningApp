import { z } from 'zod';
declare const _QuizSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "Mixed"]>;
    type: z.ZodEnum<["vocabulary"]>;
    questions: z.ZodArray<z.ZodString, "many">;
    estimatedTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed";
    type: "vocabulary";
    id: string;
    description: string;
    title: string;
    questions: string[];
    estimatedTime: number;
}, {
    difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "Mixed";
    type: "vocabulary";
    id: string;
    description: string;
    title: string;
    questions: string[];
    estimatedTime: number;
}>;
declare const _QuizSessionSchema: z.ZodObject<{
    id: z.ZodString;
    quizId: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        userAnswer: z.ZodOptional<z.ZodString>;
        isCorrect: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        userAnswer?: string | undefined;
        isCorrect?: boolean | undefined;
    }, {
        questionId: string;
        userAnswer?: string | undefined;
        isCorrect?: boolean | undefined;
    }>, "many">;
    score: z.ZodOptional<z.ZodNumber>;
    status: z.ZodEnum<["in_progress", "completed"]>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "in_progress";
    id: string;
    quizId: string;
    questions: {
        questionId: string;
        userAnswer?: string | undefined;
        isCorrect?: boolean | undefined;
    }[];
    score?: number | undefined;
}, {
    status: "completed" | "in_progress";
    id: string;
    quizId: string;
    questions: {
        questionId: string;
        userAnswer?: string | undefined;
        isCorrect?: boolean | undefined;
    }[];
    score?: number | undefined;
}>;
type Quiz = z.infer<typeof _QuizSchema>;
type QuizSession = z.infer<typeof _QuizSessionSchema>;
type QuizCriteria = {
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Mixed';
    limit?: number;
};
export declare class QuizService {
    private vocabularyDb;
    constructor();
    generateQuiz(criteria: QuizCriteria): Quiz;
    private generateVocabularyQuestions;
    private getIncorrectOptions;
    private shuffleArray;
    private generateQuizTitle;
    private generateQuizDescription;
    private calculateEstimatedTime;
    startQuizSession(quiz: Quiz): QuizSession;
    submitAnswer(session: QuizSession, questionIndex: number, answer: string): QuizSession;
    private getQuestionById;
}
export declare const quizService: QuizService;
export {};
//# sourceMappingURL=quiz.d.ts.map