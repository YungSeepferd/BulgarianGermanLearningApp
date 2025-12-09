import { z } from 'zod';
import { db as vocabularyDb } from '$lib/data/db.svelte';
// Store generated questions in memory for the current session
const generatedQuestions = new Map();
// Quiz Question Schema
const QuizQuestionSchema = z.object({
    id: z.string().uuid(),
    question: z.string().min(3).max(500),
    questionType: z.enum(['multiple_choice']),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
    category: z.array(z.string()),
    vocabularyIds: z.array(z.string().uuid()),
    explanation: z.string().optional()
});
// Quiz Schema
const QuizSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'Mixed']),
    type: z.enum(['vocabulary']),
    questions: z.array(z.string().uuid()),
    estimatedTime: z.number().int().positive()
});
// Quiz Session Schema
const QuizSessionSchema = z.object({
    id: z.string().uuid(),
    quizId: z.string().uuid(),
    questions: z.array(z.object({
        questionId: z.string().uuid(),
        userAnswer: z.string().optional(),
        isCorrect: z.boolean().optional()
    })),
    score: z.number().int().nonnegative().optional(),
    status: z.enum(['in_progress', 'completed'])
});
export class QuizService {
    constructor() {
        this.vocabularyDb = vocabularyDb;
    }
    generateQuiz(criteria) {
        const limit = criteria.limit || 10;
        const difficulty = criteria.difficulty || 'Mixed';
        const vocabulary = this.vocabularyDb.query({
            difficulty: difficulty !== 'Mixed' ? difficulty : undefined,
            limit
        });
        if (vocabulary.length === 0) {
            throw new Error('No vocabulary items match the specified criteria');
        }
        const questions = this.generateVocabularyQuestions(vocabulary);
        const quiz = {
            id: crypto.randomUUID(),
            title: this.generateQuizTitle(vocabulary, criteria),
            description: this.generateQuizDescription(vocabulary, criteria),
            difficulty: difficulty,
            type: 'vocabulary',
            questions: questions.map(q => q.id),
            estimatedTime: this.calculateEstimatedTime(questions.length)
        };
        return QuizSchema.parse(quiz);
    }
    generateVocabularyQuestions(vocabulary) {
        const questions = [];
        for (const item of vocabulary) {
            const incorrectOptions = this.getIncorrectOptions(item, vocabulary);
            const options = this.shuffleArray([item.bulgarian, ...incorrectOptions]);
            const question = {
                id: crypto.randomUUID(),
                question: `What is the Bulgarian translation of "${item.german}"?`,
                questionType: 'multiple_choice',
                options,
                correctAnswer: item.bulgarian,
                difficulty: item.difficulty,
                category: item.category,
                vocabularyIds: [item.id],
                explanation: item.example ? `Example: ${item.example[0].german} = ${item.example[0].bulgarian}` : undefined
            };
            questions.push(QuizQuestionSchema.parse(question));
        }
        return questions;
    }
    getIncorrectOptions(correctItem, vocabulary) {
        const otherItems = vocabulary.filter(item => item.id !== correctItem.id);
        return this.shuffleArray(otherItems)
            .slice(0, 3)
            .map(item => item.bulgarian);
    }
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    generateQuizTitle(vocabulary, criteria) {
        const difficulty = criteria.difficulty || vocabulary[0].difficulty;
        const category = vocabulary[0].category[0];
        return `Vocabulary Quiz: ${difficulty} ${category}`;
    }
    generateQuizDescription(vocabulary, criteria) {
        const difficulty = criteria.difficulty || vocabulary[0].difficulty;
        const category = vocabulary[0].category[0];
        const count = vocabulary.length;
        return `Test your knowledge of ${difficulty} level ${category} vocabulary. This quiz contains ${count} questions.`;
    }
    calculateEstimatedTime(questionCount) {
        return questionCount * 30;
    }
    startQuizSession(quiz) {
        const session = {
            id: crypto.randomUUID(),
            quizId: quiz.id,
            questions: quiz.questions.map(questionId => ({
                questionId,
                userAnswer: undefined,
                isCorrect: undefined
            })),
            score: 0,
            status: 'in_progress'
        };
        return QuizSessionSchema.parse(session);
    }
    submitAnswer(session, questionIndex, answer) {
        const questionId = session.questions[questionIndex].questionId;
        const question = this.getQuestionById(questionId);
        if (!question) {
            throw new Error(`Question with ID ${questionId} not found`);
        }
        const isCorrect = answer === question.correctAnswer;
        session.questions[questionIndex] = {
            ...session.questions[questionIndex],
            userAnswer: answer,
            isCorrect
        };
        session.score = session.questions.filter(q => q.isCorrect).length;
        if (session.questions.every(q => q.userAnswer !== undefined)) {
            session.status = 'completed';
        }
        return QuizSessionSchema.parse(session);
    }
    getQuestionById(questionId) {
        // In a real implementation, we would store questions in a database
        return undefined;
    }
}
export const quizService = new QuizService();
//# sourceMappingURL=quiz.js.map