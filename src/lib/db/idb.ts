/**
 * IndexedDB Database Initialization
 * Creates and manages the local database for user progress, vocabulary edits, and preferences
 */

import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { VocabularyItem } from '$lib/schemas/vocabulary';
import type { UserProgress, VocabularyProgress, ExerciseProgress } from '$lib/types/progress';
import type { Lesson, LessonProgress } from '$lib/types/lesson';
import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';

export interface AppDatabase extends DBSchema {
	vocabulary: {
		key: string;
		value: VocabularyItem & {
			// User edits
			userEdits?: {
				mnemonics?: string;
				culturalNotes?: string;
				personalNotes?: string;
				editedAt?: string;
			};
		};
		indexes: {
			partOfSpeech: string;
			difficulty: string;
			learningPath: string;
		};
	};
	vocabularyProgress: {
		key: string;
		value: VocabularyProgress;
		indexes: {
			mastery: number;
			nextReview: string;
		};
	};
	lessonProgress: {
		key: string;
		value: LessonProgress;
		indexes: {
			lessonId: string;
			completed: boolean;
		};
	};
	learningPathProgress: {
		key: string;
		value: LearningPathProgress;
		indexes: {
			pathId: string;
		};
	};
	exerciseProgress: {
		key: string;
		value: ExerciseProgress;
		indexes: {
			lessonId: string;
			exerciseId: string;
			completed: boolean;
		};
	};
	userProgress: {
		key: string;
		value: UserProgress;
	};
	editHistory: {
		key: string;
		value: {
			itemId: string;
			field: string;
			oldValue: string;
			newValue: string;
			timestamp: string;
			userId: string;
		};
		indexes: {
			itemId: string;
			timestamp: string;
		};
	};
}

let dbInstance: IDBPDatabase<AppDatabase> | null = null;

/**
 * Initialize IndexedDB database with all stores
 */
export async function initializeDB(): Promise<IDBPDatabase<AppDatabase>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<AppDatabase>('BulgarianGermanApp', 1, {
		upgrade(db, oldVersion, newVersion, transaction) {
			console.log(`[IndexedDB] Upgrading from v${oldVersion} to v${newVersion}`);

			// Vocabulary store (with user edits)
			if (!db.objectStoreNames.contains('vocabulary')) {
				const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'id' });
				vocabStore.createIndex('partOfSpeech', 'partOfSpeech');
				vocabStore.createIndex('difficulty', 'difficulty');
				vocabStore.createIndex('learningPath', 'learningPath');
				console.log('[IndexedDB] Created vocabulary store');
			}

			// Vocabulary progress (mastery tracking)
			if (!db.objectStoreNames.contains('vocabularyProgress')) {
				const vocabProgressStore = db.createObjectStore('vocabularyProgress', {
					keyPath: 'itemId'
				});
				vocabProgressStore.createIndex('mastery', 'mastery');
				vocabProgressStore.createIndex('nextReview', 'nextReview');
				console.log('[IndexedDB] Created vocabularyProgress store');
			}

			// Lesson progress
			if (!db.objectStoreNames.contains('lessonProgress')) {
				const lessonProgressStore = db.createObjectStore('lessonProgress', {
					keyPath: 'lessonId'
				});
				lessonProgressStore.createIndex('lessonId', 'lessonId');
				lessonProgressStore.createIndex('completed', 'completed');
				console.log('[IndexedDB] Created lessonProgress store');
			}

			// Learning path progress
			if (!db.objectStoreNames.contains('learningPathProgress')) {
				const pathProgressStore = db.createObjectStore('learningPathProgress', {
					keyPath: 'pathId'
				});
				pathProgressStore.createIndex('pathId', 'pathId');
				console.log('[IndexedDB] Created learningPathProgress store');
			}

			// Exercise progress
			if (!db.objectStoreNames.contains('exerciseProgress')) {
				const exerciseProgressStore = db.createObjectStore('exerciseProgress', { keyPath: 'exerciseId' });
				exerciseProgressStore.createIndex('lessonId', 'lessonId');
				exerciseProgressStore.createIndex('exerciseId', 'exerciseId');
				exerciseProgressStore.createIndex('completed', 'completed');
				console.log('[IndexedDB] Created exerciseProgress store');
			}

			// User progress (global stats, preferences)
			if (!db.objectStoreNames.contains('userProgress')) {
				db.createObjectStore('userProgress', { keyPath: 'userId' });
				console.log('[IndexedDB] Created userProgress store');
			}

			// Edit history (track user contributions)
			if (!db.objectStoreNames.contains('editHistory')) {
				const editHistoryStore = db.createObjectStore('editHistory', {
					keyPath: 'timestamp',
					autoIncrement: true
				});
				editHistoryStore.createIndex('itemId', 'itemId');
				editHistoryStore.createIndex('timestamp', 'timestamp');
				console.log('[IndexedDB] Created editHistory store');
			}
		},
		blocked() {
			console.warn('[IndexedDB] Database upgrade blocked - close other tabs');
		},
		blocking() {
			console.warn('[IndexedDB] Blocking database upgrade in another tab');
		},
		terminated() {
			console.error('[IndexedDB] Database connection terminated unexpectedly');
			dbInstance = null;
		}
	});

	console.log('[IndexedDB] Database initialized successfully');
	return dbInstance;
}

/**
 * Get database instance (initialize if needed)
 */
export async function getDB(): Promise<IDBPDatabase<AppDatabase>> {
	if (!dbInstance) {
		return await initializeDB();
	}
	return dbInstance;
}

/**
 * Close database connection
 */
export function closeDB(): void {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
		console.log('[IndexedDB] Database connection closed');
	}
}

/**
 * Delete entire database (for testing/reset)
 */
export async function deleteDB(): Promise<void> {
	closeDB();
	await indexedDB.deleteDatabase('BulgarianGermanApp');
	console.log('[IndexedDB] Database deleted');
}
