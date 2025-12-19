/**
 * Database Mutation Operations
 * Write operations for updating IndexedDB data
 */

import { getDB } from './idb';
import type { VocabularyProgress, ExerciseProgress, UserProgress } from '$lib/types/progress';
import type { LessonProgress } from '$lib/types/lesson';
import type { LearningPathProgress } from '$lib/types/learning-path';

/**
 * Save or update vocabulary progress
 */
export async function saveVocabularyProgress(progress: VocabularyProgress): Promise<void> {
	const db = await getDB();
	await db.put('vocabularyProgress', progress);
}

/**
 * Record a practice attempt for vocabulary
 */
export async function recordVocabularyAttempt(
	itemId: string,
	correct: boolean
): Promise<VocabularyProgress> {
	const db = await getDB();
	let progress = await db.get('vocabularyProgress', itemId);

	if (!progress) {
		// Initialize new progress
		progress = {
			itemId,
			attempts: 0,
			correct: 0,
			mastery: 0,
			lastAttempt: new Date().toISOString(),
			interval: 1,
			easeFactor: 2.5,
			firstSeen: new Date().toISOString(),
			favorited: false
		};
	}

	// Update progress
	progress.attempts++;
	if (correct) {
		progress.correct++;
	}
	progress.mastery = progress.correct / progress.attempts;
	progress.lastAttempt = new Date().toISOString();

	// Calculate next review (simplified SM-2 algorithm)
	if (correct) {
		progress.interval = Math.round(progress.interval * progress.easeFactor);
		progress.easeFactor = Math.max(1.3, progress.easeFactor + 0.1);
	} else {
		progress.interval = 1;
		progress.easeFactor = Math.max(1.3, progress.easeFactor - 0.2);
	}

	const nextReview = new Date();
	nextReview.setDate(nextReview.getDate() + progress.interval);
	progress.nextReview = nextReview.toISOString();

	await db.put('vocabularyProgress', progress);
	return progress;
}

/**
 * Save or update lesson progress
 */
export async function saveLessonProgress(progress: LessonProgress): Promise<void> {
	const db = await getDB();
	await db.put('lessonProgress', progress as any);
}

/**
 * Mark lesson as completed
 */
export async function completLesson(lessonId: string): Promise<void> {
	const db = await getDB();
	let progress: any = await db.get('lessonProgress', lessonId);

	if (!progress) {
		progress = {
			lessonId,
			completed: false,
			progress: 0,
			completedVocabulary: [],
			completedExercises: [],
			timeSpent: 0
		};
	}

	progress.completed = true;
	progress.completedAt = new Date().toISOString();
	progress.progress = 100;

	await db.put('lessonProgress', progress);
}

/**
 * Save or update learning path progress
 */
export async function saveLearningPathProgress(progress: LearningPathProgress): Promise<void> {
	const db = await getDB();
	await db.put('learningPathProgress', progress);
}

/**
 * Save or update exercise progress
 */
export async function saveExerciseProgress(progress: ExerciseProgress): Promise<void> {
	const db = await getDB();
	await db.put('exerciseProgress', progress as any);
}

/**
 * Mark exercise as completed
 */
export async function completeExercise(
	exerciseId: string,
	lessonId: string,
	correct: boolean,
	timeSpent: number
): Promise<void> {
	const db = await getDB();
	let progress = await db.get('exerciseProgress', exerciseId);

	let ex: any = progress;
	if (!ex) {
		ex = {
			exerciseId,
			lessonId,
			completed: false,
			attempts: 0,
			firstTryCorrect: false,
			mistakes: [],
			timeSpent: 0
		};
	}

	ex.attempts++;
	ex.completed = correct;
	if (correct && ex.attempts === 1) {
		ex.firstTryCorrect = true;
	}
	if (correct) {
		ex.completedAt = new Date().toISOString();
	}
	ex.timeSpent += timeSpent;

	await db.put('exerciseProgress', ex);
}

/**
 * Save user progress (global stats)
 */
export async function saveUserProgress(progress: UserProgress): Promise<void> {
	const db = await getDB();
	progress.lastUpdated = new Date().toISOString();
	await db.put('userProgress', progress);
}

/**
 * Update user streak
 */
export async function updateStreak(userId: string = 'local-user'): Promise<void> {
	const db = await getDB();
	const progress = await db.get('userProgress', userId);

	if (!progress) return;

	const now = new Date();
	const lastActive = new Date(progress.streak.lastActive);
	const daysSinceActive = Math.floor(
		(now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
	);

	if (daysSinceActive === 0) {
		// Same day, no change
		return;
	} else if (daysSinceActive === 1) {
		// Continue streak
		progress.streak.current++;
		progress.streak.longest = Math.max(progress.streak.current, progress.streak.longest);
	} else {
		// Streak broken
		progress.streak.current = 1;
	}

	progress.streak.lastActive = now.toISOString();
	await saveUserProgress(progress);
}

/**
 * Add XP to user
 */
export async function addXP(xp: number, userId: string = 'local-user'): Promise<void> {
	const db = await getDB();
	const progress = await db.get('userProgress', userId);

	if (!progress) return;

	progress.stats.xp += xp;

	// Level up calculation (100 XP per level)
	const newLevel = Math.floor(progress.stats.xp / 100) + 1;
	if (newLevel > progress.stats.level) {
		progress.stats.level = newLevel;
		console.log(`[Gamification] Level up! Now level ${newLevel}`);
	}

	await saveUserProgress(progress);
}

/**
 * Save vocabulary item edit
 */
export async function saveVocabularyEdit(
	itemId: string,
	field: string,
	newValue: string,
	userId: string = 'local-user'
): Promise<void> {
	const db = await getDB();

	// Get current vocabulary item
	const item = await db.get('vocabulary', itemId);
	if (!item) return;

	// Save edit history
	const edit = {
		itemId,
		field,
		oldValue: (item as any)[field] || '',
		newValue,
		timestamp: new Date().toISOString(),
		userId
	};
	await db.put('editHistory', edit);

	// Update vocabulary item
	if (!item.userEdits) {
		item.userEdits = {};
	}
	(item.userEdits as any)[field] = newValue;
	item.userEdits.editedAt = new Date().toISOString();

	await db.put('vocabulary', item);
}

/**
 * Toggle favorite status for vocabulary item
 */
export async function toggleFavorite(itemId: string): Promise<boolean> {
	const db = await getDB();
	let progress = await db.get('vocabularyProgress', itemId);

	if (!progress) {
		progress = {
			itemId,
			attempts: 0,
			correct: 0,
			mastery: 0,
			interval: 1,
			easeFactor: 2.5,
			firstSeen: new Date().toISOString(),
			favorited: false
		};
	}

	progress.favorited = !progress.favorited;
	await db.put('vocabularyProgress', progress);

	return progress.favorited;
}

/**
 * Reset all user progress (for testing)
 */
export async function resetAllProgress(userId: string = 'local-user'): Promise<void> {
	const db = await getDB();

	// Clear all progress stores
	await db.clear('vocabularyProgress');
	await db.clear('lessonProgress');
	await db.clear('learningPathProgress');
	await db.clear('exerciseProgress');

	// Reset user progress
	const defaultProgress: UserProgress = {
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
			languageMode: 'DE_BG',
			uiLanguage: 'de',
			theme: 'auto',
			notificationsEnabled: true,
			dailyGoal: 15
		},
		lastUpdated: new Date().toISOString()
	};

	await db.put('userProgress', defaultProgress);
	console.log('[IndexedDB] All progress reset');
}
