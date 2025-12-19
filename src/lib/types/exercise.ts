/**
 * Exercise Schema - Future-proof for Phase 2 implementation
 * Supports multiple exercise types inspired by Bulgaro.io
 */

export type ExerciseType = 'cloze' | 'sentence-builder' | 'typing' | 'multiple-choice' | 'matching';

export interface BaseExercise {
	/** Unique exercise ID */
	id: string;

	/** Exercise type */
	type: ExerciseType;

	/** Which lesson this belongs to */
	lessonId: string;

	/** Display title */
	title: string;

	/** Instructions for the user */
	instructions: string;

	/** Difficulty level */
	difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

	/** Related vocabulary item IDs */
	vocabularyIds: string[];
}

export interface ClozeExercise extends BaseExercise {
	type: 'cloze';
	content: {
		sentences: Array<{
			german: string; // Sentence with ___ for blank
			bulgarian: string; // Translation
			answer: string; // Correct word to fill in
			hints?: string[]; // Optional hints
			commonMistakes?: Array<{
				mistake: string;
				explanation: string;
			}>;
		}>;
	};
}

export interface SentenceBuilderExercise extends BaseExercise {
	type: 'sentence-builder';
	content: {
		questions: Array<{
			prompt: string; // "Build: The woman is here"
			targetSentence: string; // "Die Frau ist hier"
			translation: string; // "Жената е тук"
			words: string[]; // ["Die", "Frau", "ist", "hier"] + distractors
			correctOrder: number[]; // [0, 1, 2, 3]
		}>;
	};
}

export interface TypingExercise extends BaseExercise {
	type: 'typing';
	content: {
		questions: Array<{
			prompt: string; // German or Bulgarian
			answer: string; // Expected translation
			acceptableVariants?: string[]; // Other correct answers
			hints?: string[];
		}>;
	};
}

export interface MultipleChoiceExercise extends BaseExercise {
	type: 'multiple-choice';
	content: {
		questions: Array<{
			question: string;
			options: string[];
			correctIndex: number;
			explanation?: string;
		}>;
	};
}

export interface MatchingExercise extends BaseExercise {
	type: 'matching';
	content: {
		pairs: Array<{
			german: string;
			bulgarian: string;
		}>;
		// Randomize and present as two columns to match
	};
}

export type Exercise =
	| ClozeExercise
	| SentenceBuilderExercise
	| TypingExercise
	| MultipleChoiceExercise
	| MatchingExercise;
