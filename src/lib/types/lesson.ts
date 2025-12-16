/**
 * Lesson Schema - Represents a single lesson in a learning path
 * Based on Bulgaro.io pattern: structured lessons with vocabulary, grammar, and exercises
 */

export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Lesson {
	/** Unique lesson identifier (e.g., "basics-numbers-0-10") */
	id: string;

	/** Display title (e.g., "Numbers 0-10") */
	title: string;

	/** Optional subtitle for context */
	subtitle?: string;

	/** Order within the learning path (1-indexed) */
	order: number;

	/** Which learning path this belongs to (e.g., "basics", "intermediate") */
	path: string;

	/** Path to markdown content file (e.g., "/lessons/basics/numbers-0-10.md") */
	contentUrl: string;

	/** Estimated completion time in minutes */
	duration: number;

	/** CEFR difficulty level */
	difficulty: DifficultyLevel;

	/** Vocabulary item IDs covered in this lesson */
	vocabularyIds: string[];

	/** Exercise IDs for practice (optional for Phase 1) */
	exerciseIds?: string[];

	/** Grammar topics covered (e.g., ["definite-articles", "negation"]) */
	grammarTopics: string[];

	/** Prerequisite lesson IDs (must complete before unlocking) */
	prerequisites?: string[];

	/** Learning objectives for this lesson */
	objectives: string[];

	/** Optional metadata */
	metadata?: {
		createdAt?: string;
		updatedAt?: string;
		author?: string;
	};
}

export interface LessonProgress {
	/** Lesson ID */
	lessonId: string;

	/** Completion status */
	completed: boolean;

	/** Completion date (ISO 8601) */
	completedAt?: string;

	/** Last viewed date */
	lastViewed?: string;

	/** Progress percentage (0-100) */
	progress: number;

	/** Completed vocabulary items from this lesson */
	completedVocabulary: string[];

	/** Completed exercises from this lesson */
	completedExercises: string[];

	/** Time spent in minutes */
	timeSpent: number;
}
