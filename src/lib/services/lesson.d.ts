/**
 * Lesson Service for Bulgarian-German Language Learning Application
 *
 * This service provides comprehensive business logic for creating, managing, and delivering
 * curriculum-based lessons with robust vocabulary integration, error handling, and performance optimization.
 */
import { LessonDifficulty, LessonType } from '../schemas/lesson';
import type { Lesson } from '../schemas/lesson';
import type { VocabularyItem, VocabularyCategory, PartOfSpeech } from '../schemas/vocabulary';
/**
 * Lesson Service Class
 */
export declare class LessonService {
    private lessons;
    private vocabularyData;
    private initialized;
    constructor();
    /**
     * Initialize the lesson service with vocabulary data
     */
    initialize(): Promise<void>;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
    /**
     * Generate a lesson from specific vocabulary items
     */
    generateLessonFromVocabulary(vocabularyItems: VocabularyItem[], options?: {
        title?: string;
        difficulty?: LessonDifficulty;
        type?: LessonType;
        description?: string;
    }): Lesson;
    /**
     * Generate a lesson from criteria (difficulty, type, theme, etc.)
     */
    generateLessonFromCriteria(criteria?: {
        difficulty?: LessonDifficulty;
        type?: LessonType;
        categories?: VocabularyCategory[];
        partOfSpeech?: PartOfSpeech;
        limit?: number;
        title?: string;
        description?: string;
    }): Promise<Lesson>;
    /**
     * Query vocabulary based on criteria
     */
    private queryVocabulary;
    /**
     * Get numeric difficulty range for a CEFR level
     */
    private getDifficultyRange;
    /**
     * Generate a lesson title based on vocabulary content
     */
    private generateLessonTitle;
    /**
     * Generate a lesson description
     */
    private generateLessonDescription;
    /**
     * Calculate lesson duration based on number of vocabulary items
     */
    private calculateLessonDuration;
    /**
     * Create learning objectives for a lesson
     */
    private createLearningObjectives;
    /**
     * Generate tags for a lesson
     */
    private generateLessonTags;
    /**
     * Get display name for a vocabulary category
     */
    private getCategoryDisplayName;
    /**
     * Get display name for part of speech
     */
    private getPartOfSpeechDisplayName;
    /**
     * Determine lesson difficulty based on vocabulary items
     */
    private determineLessonDifficulty;
    /**
     * Validate a lesson against the schema
     */
    private validateLesson;
    /**
     * Create a fallback lesson when validation or generation fails
     */
    private createFallbackLesson;
    /**
     * Get all lessons
     */
    getLessons(): Lesson[];
    /**
     * Get a specific lesson by ID
     */
    getLessonById(id: string): Lesson | undefined;
    /**
     * Add a lesson to the collection
     */
    addLesson(lesson: Lesson): void;
    /**
     * Update a lesson
     */
    updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined;
    /**
     * Remove a lesson
     */
    removeLesson(id: string): boolean;
    /**
     * Get lessons by difficulty level
     */
    getLessonsByDifficulty(difficulty: LessonDifficulty): Lesson[];
    /**
     * Get lessons by type
     */
    getLessonsByType(type: LessonType): Lesson[];
    /**
     * Get lessons by tag
     */
    getLessonsByTag(tag: string): Lesson[];
    /**
     * Get random lessons for recommendation
     */
    getRandomLessons(count?: number): Lesson[];
}
export declare const lessonService: LessonService;
//# sourceMappingURL=lesson.d.ts.map