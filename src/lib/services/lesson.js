/**
 * Lesson Service for Bulgarian-German Language Learning Application
 *
 * This service provides comprehensive business logic for creating, managing, and delivering
 * curriculum-based lessons with robust vocabulary integration, error handling, and performance optimization.
 */
import { z } from 'zod';
import { LessonSchema, LessonDifficulty, LessonType } from '../schemas/lesson';
import { VocabularyItemSchema } from '../schemas/vocabulary';
import { db } from '../data/db.svelte';
/**
 * Lesson Service Class
 */
export class LessonService {
    constructor() {
        this.lessons = [];
        this.vocabularyData = [];
        this.initialized = $state(false);
        // Initialize will be called explicitly to prevent SSR issues
    }
    /**
     * Initialize the lesson service with vocabulary data
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            await db.initialize();
            const vocabData = await db.getVocabulary();
            this.vocabularyData = vocabData;
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize LessonService:', error);
            this.vocabularyData = [];
            this.initialized = false;
            throw error;
        }
    }
    /**
     * Check if service is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Generate a lesson from specific vocabulary items
     */
    generateLessonFromVocabulary(vocabularyItems, options = {}) {
        // Validate input
        if (!vocabularyItems || vocabularyItems.length === 0) {
            return this.createFallbackLesson('No vocabulary items provided');
        }
        const { title, difficulty, type = 'vocabulary', description } = options;
        // Determine lesson title
        const lessonTitle = title || this.generateLessonTitle(vocabularyItems, type);
        // Determine difficulty if not provided
        const lessonDifficulty = difficulty || this.determineLessonDifficulty(vocabularyItems);
        // Create learning objectives
        const objectives = this.createLearningObjectives(vocabularyItems, lessonDifficulty, type);
        // Create the lesson
        const lesson = {
            id: crypto.randomUUID(),
            title: lessonTitle,
            description: description || this.generateLessonDescription(vocabularyItems, lessonDifficulty, type),
            difficulty: lessonDifficulty,
            type,
            duration: this.calculateLessonDuration(vocabularyItems.length),
            vocabulary: vocabularyItems.map(item => ({
                id: item.id,
                german: item.german,
                bulgarian: item.bulgarian,
                partOfSpeech: item.partOfSpeech,
                difficulty: item.difficulty,
                categories: item.categories
            })),
            objectives,
            isCompleted: false,
            completionPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                tags: this.generateLessonTags(vocabularyItems, lessonDifficulty, type),
                prerequisites: [],
                relatedLessons: []
            }
        };
        // Validate the lesson
        return this.validateLesson(lesson);
    }
    /**
     * Generate a lesson from criteria (difficulty, type, theme, etc.)
     */
    async generateLessonFromCriteria(criteria = {}) {
        try {
            // Ensure service is initialized
            if (!this.initialized) {
                await this.initialize();
            }
            // Query vocabulary based on criteria
            const vocabularyItems = this.queryVocabulary(criteria);
            // Apply limit if specified
            const limitedItems = criteria.limit
                ? vocabularyItems.slice(0, criteria.limit)
                : vocabularyItems;
            // Generate lesson
            return this.generateLessonFromVocabulary(limitedItems, {
                title: criteria.title,
                difficulty: criteria.difficulty,
                type: criteria.type,
                description: criteria.description
            });
        }
        catch (error) {
            console.error('Failed to generate lesson from criteria:', error);
            return this.createFallbackLesson('Failed to generate lesson from criteria');
        }
    }
    /**
     * Query vocabulary based on criteria
     */
    queryVocabulary(criteria) {
        if (this.vocabularyData.length === 0) {
            console.warn('No vocabulary data available');
            return [];
        }
        // Convert difficulty level to numeric range if provided
        const difficultyRange = criteria.difficulty
            ? this.getDifficultyRange(criteria.difficulty)
            : null;
        return this.vocabularyData.filter(item => {
            // Filter by difficulty
            const difficultyMatch = difficultyRange
                ? item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
                : true;
            // Filter by categories
            const categoryMatch = criteria.categories && criteria.categories.length > 0
                ? item.categories.some(category => criteria.categories?.includes(category))
                : true;
            // Filter by part of speech
            const partOfSpeechMatch = criteria.partOfSpeech
                ? item.partOfSpeech === criteria.partOfSpeech
                : true;
            return difficultyMatch && categoryMatch && partOfSpeechMatch;
        });
    }
    /**
     * Get numeric difficulty range for a CEFR level
     */
    getDifficultyRange(difficulty) {
        const ranges = {
            'A1': { min: 1, max: 1.5 },
            'A2': { min: 1.5, max: 2.5 },
            'B1': { min: 2.5, max: 3.5 },
            'B2': { min: 3.5, max: 4.5 },
            'C1': { min: 4.5, max: 5 }
        };
        return ranges[difficulty];
    }
    /**
     * Generate a lesson title based on vocabulary content
     */
    generateLessonTitle(vocabularyItems, type) {
        if (vocabularyItems.length === 0)
            return 'New Lesson';
        // Extract unique categories
        const categories = new Set();
        vocabularyItems.forEach(item => {
            item.categories.forEach(category => categories.add(category));
        });
        // Determine lesson type name
        const typeNames = {
            'vocabulary': 'Vocabulary',
            'grammar': 'Grammar',
            'conversation': 'Conversation',
            'reading': 'Reading',
            'listening': 'Listening',
            'writing': 'Writing',
            'culture': 'Culture',
            'mixed': 'Mixed Topics'
        };
        const typeName = typeNames[type] || 'Lesson';
        // If single category, use it in the title
        if (categories.size === 1) {
            const category = categories.values().next().value;
            return `${typeName}: ${this.getCategoryDisplayName(category)}`;
        }
        // If multiple categories, use a generic title
        return `${typeName} Lesson (${vocabularyItems.length} items)`;
    }
    /**
     * Generate a lesson description
     */
    generateLessonDescription(vocabularyItems, difficulty, type) {
        const typeDescriptions = {
            'vocabulary': 'vocabulary building',
            'grammar': 'grammar concepts',
            'conversation': 'conversation practice',
            'reading': 'reading comprehension',
            'listening': 'listening skills',
            'writing': 'writing practice',
            'culture': 'cultural insights',
            'mixed': 'various language skills'
        };
        const partsOfSpeech = new Set();
        vocabularyItems.forEach(item => partsOfSpeech.add(item.partOfSpeech));
        const partOfSpeechList = Array.from(partsOfSpeech)
            .map(pos => this.getPartOfSpeechDisplayName(pos))
            .join(', ');
        return `This ${difficulty} level lesson focuses on ${typeDescriptions[type]} with ${vocabularyItems.length} vocabulary items covering ${partOfSpeechList}.`;
    }
    /**
     * Calculate lesson duration based on number of vocabulary items
     */
    calculateLessonDuration(itemCount) {
        // Base duration: 2 minutes per item
        const baseDuration = itemCount * 2;
        // Add buffer time for lessons with many items
        if (itemCount > 15) {
            return Math.min(baseDuration + 10, 120); // Max 120 minutes
        }
        else if (itemCount > 10) {
            return baseDuration + 5;
        }
        else {
            return Math.max(baseDuration, 15); // Minimum 15 minutes
        }
    }
    /**
     * Create learning objectives for a lesson
     */
    createLearningObjectives(vocabularyItems, difficulty, type) {
        const objectives = [];
        // Base objectives
        objectives.push({
            id: crypto.randomUUID(),
            description: `Learn ${vocabularyItems.length} new vocabulary items at ${difficulty} level`,
            isCompleted: false,
            createdAt: new Date()
        });
        // Type-specific objectives
        const typeObjectives = {
            'vocabulary': 'Practice using new vocabulary in context',
            'grammar': 'Understand and apply grammar concepts',
            'conversation': 'Engage in conversation using learned vocabulary',
            'reading': 'Read and comprehend texts using learned vocabulary',
            'listening': 'Listen and understand spoken language at this level',
            'writing': 'Write sentences or paragraphs using learned vocabulary',
            'culture': 'Understand cultural context of vocabulary',
            'mixed': 'Practice various language skills at this level'
        };
        objectives.push({
            id: crypto.randomUUID(),
            description: typeObjectives[type],
            isCompleted: false,
            createdAt: new Date()
        });
        // Difficulty-specific objectives
        if (difficulty === 'A1' || difficulty === 'A2') {
            objectives.push({
                id: crypto.randomUUID(),
                description: 'Recognize basic words and phrases in context',
                isCompleted: false,
                createdAt: new Date()
            });
        }
        else if (difficulty === 'B1' || difficulty === 'B2') {
            objectives.push({
                id: crypto.randomUUID(),
                description: 'Use vocabulary in complete sentences and questions',
                isCompleted: false,
                createdAt: new Date()
            });
        }
        else {
            objectives.push({
                id: crypto.randomUUID(),
                description: 'Use advanced vocabulary in complex sentences and discussions',
                isCompleted: false,
                createdAt: new Date()
            });
        }
        return objectives;
    }
    /**
     * Generate tags for a lesson
     */
    generateLessonTags(vocabularyItems, difficulty, type) {
        const tags = [type, difficulty];
        // Add categories as tags
        const categories = new Set();
        vocabularyItems.forEach(item => {
            item.categories.forEach(category => categories.add(category));
        });
        // Add up to 3 categories as tags
        Array.from(categories).slice(0, 3).forEach(category => {
            tags.push(this.getCategoryDisplayName(category));
        });
        return tags;
    }
    /**
     * Get display name for a vocabulary category
     */
    getCategoryDisplayName(category) {
        const displayNames = {
            'greetings': 'Greetings',
            'numbers': 'Numbers',
            'family': 'Family',
            'food': 'Food',
            'colors': 'Colors',
            'animals': 'Animals',
            'body': 'Body Parts',
            'clothing': 'Clothing',
            'house': 'House & Home',
            'nature': 'Nature',
            'transport': 'Transportation',
            'technology': 'Technology',
            'time': 'Time & Date',
            'weather': 'Weather',
            'professions': 'Professions',
            'places': 'Places',
            'grammar': 'Grammar',
            'culture': 'Culture',
            'common_phrases': 'Common Phrases',
            'uncategorized': 'Uncategorized'
        };
        return displayNames[category] || category;
    }
    /**
     * Get display name for part of speech
     */
    getPartOfSpeechDisplayName(partOfSpeech) {
        const displayNames = {
            'noun': 'Nouns',
            'verb': 'Verbs',
            'adjective': 'Adjectives',
            'adverb': 'Adverbs',
            'pronoun': 'Pronouns',
            'preposition': 'Prepositions',
            'conjunction': 'Conjunctions',
            'interjection': 'Interjections',
            'article': 'Articles',
            'number': 'Numbers',
            'phrase': 'Phrases'
        };
        return displayNames[partOfSpeech] || partOfSpeech;
    }
    /**
     * Determine lesson difficulty based on vocabulary items
     */
    determineLessonDifficulty(vocabularyItems) {
        if (vocabularyItems.length === 0)
            return 'A1';
        const totalDifficulty = vocabularyItems.reduce((sum, item) => sum + item.difficulty, 0);
        const avgDifficulty = totalDifficulty / vocabularyItems.length;
        if (avgDifficulty <= 1.5)
            return 'A1';
        if (avgDifficulty <= 2.5)
            return 'A2';
        if (avgDifficulty <= 3.5)
            return 'B1';
        if (avgDifficulty <= 4.5)
            return 'B2';
        return 'C1';
    }
    /**
     * Validate a lesson against the schema
     */
    validateLesson(lesson) {
        const result = LessonSchema.safeParse(lesson);
        if (result.success) {
            return result.data;
        }
        else {
            console.warn('Lesson validation failed:', {
                error: result.error.message,
                lessonId: lesson.id,
                lessonTitle: lesson.title
            });
            return this.createFallbackLesson('Lesson validation failed');
        }
    }
    /**
     * Create a fallback lesson when validation or generation fails
     */
    createFallbackLesson(errorMessage) {
        console.warn(`Creating fallback lesson: ${errorMessage}`);
        return {
            id: `fallback-${Date.now()}-${crypto.randomUUID()}`,
            title: 'Lesson Unavailable',
            description: 'This lesson could not be generated. Please try again later.',
            difficulty: 'A1',
            type: 'vocabulary',
            duration: 15,
            vocabulary: [],
            objectives: [
                {
                    id: crypto.randomUUID(),
                    description: 'Lesson generation failed - please try again',
                    isCompleted: false,
                    createdAt: new Date()
                }
            ],
            isCompleted: false,
            completionPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                tags: ['error'],
                prerequisites: [],
                relatedLessons: []
            }
        };
    }
    /**
     * Get all lessons
     */
    getLessons() {
        return this.lessons;
    }
    /**
     * Get a specific lesson by ID
     */
    getLessonById(id) {
        return this.lessons.find(lesson => lesson.id === id);
    }
    /**
     * Add a lesson to the collection
     */
    addLesson(lesson) {
        const validatedLesson = this.validateLesson(lesson);
        this.lessons.push(validatedLesson);
    }
    /**
     * Update a lesson
     */
    updateLesson(id, updates) {
        const index = this.lessons.findIndex(lesson => lesson.id === id);
        if (index === -1)
            return undefined;
        const currentLesson = this.lessons[index];
        const updatedLesson = {
            ...currentLesson,
            ...updates,
            updatedAt: new Date()
        };
        const validatedLesson = this.validateLesson(updatedLesson);
        this.lessons[index] = validatedLesson;
        return validatedLesson;
    }
    /**
     * Remove a lesson
     */
    removeLesson(id) {
        const initialLength = this.lessons.length;
        this.lessons = this.lessons.filter(lesson => lesson.id !== id);
        return this.lessons.length !== initialLength;
    }
    /**
     * Get lessons by difficulty level
     */
    getLessonsByDifficulty(difficulty) {
        return this.lessons.filter(lesson => lesson.difficulty === difficulty);
    }
    /**
     * Get lessons by type
     */
    getLessonsByType(type) {
        return this.lessons.filter(lesson => lesson.type === type);
    }
    /**
     * Get lessons by tag
     */
    getLessonsByTag(tag) {
        return this.lessons.filter(lesson => lesson.metadata.tags.includes(tag));
    }
    /**
     * Get random lessons for recommendation
     */
    getRandomLessons(count = 3) {
        if (this.lessons.length === 0)
            return [];
        // Shuffle array and take first N items
        const shuffled = [...this.lessons].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this.lessons.length));
    }
}
// Export a singleton instance
export const lessonService = new LessonService();
//# sourceMappingURL=lesson.js.map