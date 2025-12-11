import { z } from 'zod';
import type { VocabularyItem } from '$lib/schemas/vocabulary';
import { vocabularyDb } from '$lib/data/db.svelte.ts';

// Store generated questions in memory for the current session
const _generatedQuestions = new Map<string, QuizQuestion>();

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

type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
type Quiz = z.infer<typeof QuizSchema>;
type QuizSession = z.infer<typeof QuizSessionSchema>;
type QuizCriteria = {
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Mixed';
  limit?: number;
};

export class QuizService {
  private vocabularyDb: typeof vocabularyDb;

  constructor() {
    this.vocabularyDb = vocabularyDb;
  }

  generateQuiz(criteria: QuizCriteria): Quiz {
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

    const quiz: Quiz = {
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

  private generateVocabularyQuestions(vocabulary: VocabularyItem[]): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    for (const item of vocabulary) {
      const incorrectOptions = this.getIncorrectOptions(item, vocabulary);
      const options = this.shuffleArray([item.bulgarian, ...incorrectOptions]);

      const question: QuizQuestion = {
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

  private getIncorrectOptions(correctItem: VocabularyItem, vocabulary: VocabularyItem[]): string[] {
    const otherItems = vocabulary.filter(item => item.id !== correctItem.id);
    return this.shuffleArray(otherItems)
      .slice(0, 3)
      .map(item => item.bulgarian);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private generateQuizTitle(vocabulary: VocabularyItem[], criteria: QuizCriteria): string {
    const difficulty = criteria.difficulty || vocabulary[0].difficulty;
    const category = vocabulary[0].category[0];
    return `Vocabulary Quiz: ${difficulty} ${category}`;
  }

  private generateQuizDescription(vocabulary: VocabularyItem[], criteria: QuizCriteria): string {
    const difficulty = criteria.difficulty || vocabulary[0].difficulty;
    const category = vocabulary[0].category[0];
    const count = vocabulary.length;
    return `Test your knowledge of ${difficulty} level ${category} vocabulary. This quiz contains ${count} questions.`;
  }

  private calculateEstimatedTime(questionCount: number): number {
    return questionCount * 30;
  }

  startQuizSession(quiz: Quiz): QuizSession {
    const session: QuizSession = {
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

  submitAnswer(session: QuizSession, questionIndex: number, answer: string): QuizSession {
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

  private getQuestionById(_questionId: string): QuizQuestion | undefined {
    // In a real implementation, we would store questions in a database
    return undefined;
  }
}

export const quizService = new QuizService();