/**
 * User Progress Schema - Tracks all user learning data
 * Supports spaced repetition, mastery tracking, and gamification
 */

export interface VocabularyProgress {
	/** Vocabulary item ID */
	itemId: string;

	/** Number of times practiced */
	attempts: number;

	/** Number of correct attempts */
	correct: number;

	/** Mastery level (0.0 - 1.0) */
	mastery: number;

	/** Last practice date (ISO 8601) */
	lastAttempt?: string;

	/** Next scheduled review date (for spaced repetition) */
	nextReview?: string;

	/** Spaced repetition interval in days */
	interval: number;

	/** Ease factor for SM-2 algorithm */
	easeFactor: number;

	/** First seen date */
	firstSeen: string;

	/** Times marked as favorite */
	favorited: boolean;
}

export interface UserProgress {
	/** User ID (local-first, default: "local-user") */
	userId: string;

	/** Vocabulary mastery tracking */
	vocabulary: Record<string, VocabularyProgress>;

	/** Current learning path progress */
	currentPath?: string;

	/** All learning path progress */
	paths: Record<string, {
		currentLesson: string;
		completedLessons: string[];
		completedExercises: string[];
		progress: number;
		startedAt: string;
		completedAt?: string;
		timeSpent: number;
	}>;

	/** Daily streak tracking */
	streak: {
		current: number;
		longest: number;
		lastActive: string;
	};

	/** Gamification stats */
	stats: {
		xp: number;
		level: number;
		wordsLearned: number;
		lessonsCompleted: number;
		exercisesCompleted: number;
		totalTimeMinutes: number;
		joinDate: string;
	};

	/** User preferences */
	preferences: {
		languageMode: 'DE_BG' | 'BG_DE';
		uiLanguage: 'de' | 'bg';
		theme?: 'light' | 'dark' | 'auto';
		notificationsEnabled: boolean;
		dailyGoal: number; // minutes per day
	};

	/** Last updated timestamp */
	lastUpdated: string;
}

export interface ExerciseProgress {
	/** Exercise ID */
	exerciseId: string;

	/** Lesson ID it belongs to */
	lessonId: string;

	/** Completion status */
	completed: boolean;

	/** Completion date */
	completedAt?: string;

	/** Attempts made */
	attempts: number;

	/** Correct on first try */
	firstTryCorrect: boolean;

	/** Mistakes made */
	mistakes: string[];

	/** Time spent in seconds */
	timeSpent: number;
}
