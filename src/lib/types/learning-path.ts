/**
 * Learning Path Schema - Structured curriculum grouping related lessons
 * Inspired by Bulgaro.io's 25-level progression model
 */

import type { Lesson, DifficultyLevel } from './lesson';

export interface LearningPath {
	/** Unique path identifier (e.g., "basics", "intermediate") */
	id: string;

	/** Display title (e.g., "German Basics") */
	title: string;

	/** Subtitle or tagline */
	subtitle?: string;

	/** Description of what this path covers */
	description: string;

	/** Difficulty range */
	difficulty: DifficultyLevel;

	/** Ordered list of lessons in this path */
	lessons: Lesson[];

	/** Estimated total duration in minutes */
	totalDuration: number;

	/** Total vocabulary items covered */
	totalVocabulary: number;

	/** Icon or emoji for visual identification */
	icon?: string;

	/** Color theme for this path */
	color?: string;

	/** Order in the overall curriculum (for display) */
	order: number;

	/** Prerequisites (other paths that should be completed first) */
	prerequisites?: string[];

	/** Metadata */
	metadata?: {
		createdAt?: string;
		updatedAt?: string;
		author?: string;
	};
}

export interface LearningPathProgress {
	/** Learning path ID */
	pathId: string;

	/** Currently active lesson ID */
	currentLesson: string;

	/** Completed lesson IDs */
	completedLessons: string[];

	/** Overall progress percentage (0-100) */
	progress: number;

	/** Start date (ISO 8601) */
	startedAt?: string;

	/** Completion date */
	completedAt?: string;

	/** Total time spent in minutes */
	timeSpent: number;
}
