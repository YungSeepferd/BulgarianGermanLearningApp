/**
 * Database Query Operations
 * Read-only operations for retrieving data from IndexedDB
 */

import { getDB } from './idb';
import type { VocabularyProgress, ExerciseProgress } from '$lib/types/progress';
import type { LessonProgress } from '$lib/types/lesson';
import type { LearningPathProgress } from '$lib/types/learning-path';

/**
 * Get vocabulary progress for a specific item
 */
export async function getVocabularyProgress(itemId: string): Promise<VocabularyProgress | undefined> {
	const db = await getDB();
	return await db.get('vocabularyProgress', itemId);
}

/**
 * Get all vocabulary progress (for dashboard stats)
 */
export async function getAllVocabularyProgress(): Promise<VocabularyProgress[]> {
	const db = await getDB();
	return await db.getAll('vocabularyProgress');
}

/**
 * Get vocabulary items due for review (spaced repetition)
 */
export async function getVocabularyDueForReview(): Promise<VocabularyProgress[]> {
	const db = await getDB();
	const now = new Date().toISOString();
	const allProgress = await db.getAll('vocabularyProgress');
	return allProgress.filter(
		(item) => item.nextReview && item.nextReview <= now
	);
}

/**
 * Get lesson progress by lesson ID
 */
export async function getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
	const db = await getDB();
	return await db.get('lessonProgress', lessonId);
}

/**
 * Get all lesson progress
 */
export async function getAllLessonProgress(): Promise<LessonProgress[]> {
	const db = await getDB();
	return await db.getAll('lessonProgress');
}

/**
 * Get completed lessons count
 */
export async function getCompletedLessonsCount(): Promise<number> {
	const db = await getDB();
	const tx = db.transaction('lessonProgress', 'readonly');
	const index = tx.store.index('completed');
	return await index.count(IDBKeyRange.only(true));
}

/**
 * Get learning path progress
 */
export async function getLearningPathProgress(
	pathId: string
): Promise<LearningPathProgress | undefined> {
	const db = await getDB();
	return await db.get('learningPathProgress', pathId);
}

/**
 * Get all learning path progress
 */
export async function getAllLearningPathProgress(): Promise<LearningPathProgress[]> {
	const db = await getDB();
	return await db.getAll('learningPathProgress');
}

/**
 * Get exercise progress by exercise ID
 */
export async function getExerciseProgress(exerciseId: string): Promise<ExerciseProgress | undefined> {
	const db = await getDB();
	return await db.get('exerciseProgress', exerciseId);
}

/**
 * Get all exercise progress for a lesson
 */
export async function getExerciseProgressByLesson(lessonId: string): Promise<ExerciseProgress[]> {
	const db = await getDB();
	const tx = db.transaction('exerciseProgress', 'readonly');
	const index = tx.store.index('lessonId');
	return await index.getAll(lessonId);
}

/**
 * Get user progress (global stats)
 */
export async function getUserProgress(userId: string = 'local-user'): Promise<any> {
	const db = await getDB();
	const progress = await db.get('userProgress', userId);
	
	// Initialize default if not found
	if (!progress) {
		return {
			userId,
			vocabulary: {},
			paths: {},
			streak: {
				current: 0,
				longest: 0,
				lastActive: new Date().toISOString()
			},
			stats: {
				xp: 0,
				level: 1,
				wordsLearned: 0,
				lessonsCompleted: 0,
				exercisesCompleted: 0,
				totalTimeMinutes: 0,
				joinDate: new Date().toISOString()
			},
			preferences: {
				languageMode: 'DE_BG' as const,
				uiLanguage: 'de' as const,
				theme: 'auto' as const,
				notificationsEnabled: true,
				dailyGoal: 15
			},
			lastUpdated: new Date().toISOString()
		};
	}
	
	return progress;
}

/**
 * Get edit history for a vocabulary item
 */
export async function getEditHistory(itemId: string): Promise<any[]> {
	const db = await getDB();
	const tx = db.transaction('editHistory', 'readonly');
	const index = tx.store.index('itemId');
	return await index.getAll(itemId);
}

/**
 * Get vocabulary item with user edits
 */
export async function getVocabularyItem(itemId: string): Promise<any> {
	const db = await getDB();
	return await db.get('vocabulary', itemId);
}

/**
 * Get all vocabulary items
 */
export async function getAllVocabularyItems(): Promise<any[]> {
	const db = await getDB();
	return await db.getAll('vocabulary');
}

/**
 * Search vocabulary by part of speech
 */
export async function getVocabularyByPartOfSpeech(partOfSpeech: string): Promise<any[]> {
	const db = await getDB();
	const tx = db.transaction('vocabulary', 'readonly');
	const index = tx.store.index('partOfSpeech');
	return await index.getAll(partOfSpeech);
}

/**
 * Get mastered vocabulary (mastery >= 0.8)
 */
export async function getMasteredVocabulary(): Promise<VocabularyProgress[]> {
	const db = await getDB();
	const allProgress = await db.getAll('vocabularyProgress');
	return allProgress.filter((item) => item.mastery >= 0.8);
}

/**
 * Get learning vocabulary (0.3 <= mastery < 0.8)
 */
export async function getLearningVocabulary(): Promise<VocabularyProgress[]> {
	const db = await getDB();
	const allProgress = await db.getAll('vocabularyProgress');
	return allProgress.filter((item) => item.mastery >= 0.3 && item.mastery < 0.8);
}

/**
 * Get struggling vocabulary (mastery < 0.3)
 */
export async function getStrugglingVocabulary(): Promise<VocabularyProgress[]> {
	const db = await getDB();
	const allProgress = await db.getAll('vocabularyProgress');
	return allProgress.filter((item) => item.mastery < 0.3);
}
