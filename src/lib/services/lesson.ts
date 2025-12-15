/**
 * Lesson Service for Bulgarian-German Language Learning Application
 *
 * This service provides comprehensive business logic for creating, managing, and delivering
 * curriculum-based lessons with robust vocabulary integration, error handling, and performance optimization.
 */

import { LessonSchema } from '../schemas/lesson';
import type { Lesson, LearningObjective, LessonDifficulty, LessonType } from '../schemas/lesson';
import type { VocabularyItem, VocabularyCategory, PartOfSpeech } from '../types/vocabulary';
import { vocabularyDb as db } from '../data/db.svelte.js';

/**
 * Lesson Service Class
 */
export class LessonService {
  private lessons: Lesson[] = [];
  private vocabularyData: VocabularyItem[] = [];
  private initialized = false;

  constructor() {
    // Initialize will be called explicitly to prevent SSR issues
  }

  /**
   * Initialize the lesson service with vocabulary data
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await db.initialize();
      const vocabData = await db.getVocabulary();
      // Normalize unified vocabulary items to lesson service expectations
      this.vocabularyData = vocabData.map((item) => ({
        ...item,
        categories: this.normalizeCategories(item.categories as VocabularyCategory[] | undefined),
        metadata: (item.metadata ?? {}) as any,
        isCommon: item.isCommon ?? false,
        isVerified: item.isVerified ?? false,
        learningPhase: (item as { learningPhase?: number }).learningPhase ?? 0,
        createdAt: (item as { createdAt?: Date }).createdAt ?? new Date(),
        updatedAt: (item as { updatedAt?: Date }).updatedAt ?? new Date(),
        cefrLevel: this.normalizeCefrLevel((item as { cefrLevel?: LessonDifficulty | 'C1' }).cefrLevel)
      }));
      this.initialized = true;
    } catch (_error) {
      // Failed to initialize LessonService
      this.vocabularyData = [];
      this.initialized = false;
      throw _error;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a lesson from specific vocabulary items
   */
  generateLessonFromVocabulary(
    vocabularyItems: VocabularyItem[],
    options: {
      title?: string;
      difficulty?: LessonDifficulty;
      type?: LessonType;
      description?: string;
    } = {}
  ): Lesson {
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
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      title: lessonTitle,
      description: description || this.generateLessonDescription(vocabularyItems, lessonDifficulty, type),
      difficulty: lessonDifficulty,
      type,
      duration: this.calculateLessonDuration(vocabularyItems.length),
      vocabulary: vocabularyItems.map(item => this.normalizeVocabularyItem(item)),
      objectives,
      isCompleted: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        tags: this.generateLessonTags(vocabularyItems, lessonDifficulty, type),
        prerequisites: [],
        relatedLessons: [],
        isPremium: false
      }
    };

    // Validate the lesson
    return this.validateLesson(lesson);
  }

  /**
   * Generate a lesson from criteria (difficulty, type, theme, etc.)
   */
  async generateLessonFromCriteria(
    criteria: {
      difficulty?: LessonDifficulty;
      type?: LessonType;
      categories?: VocabularyCategory[];
      partOfSpeech?: PartOfSpeech;
      limit?: number;
      title?: string;
      description?: string;
    } = {}
  ): Promise<Lesson> {
    try {
      // Ensure service is initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Query vocabulary based on criteria
      const vocabularyItems = this.queryVocabulary(criteria);

      // Apply limit if specified and normalize items for schema compatibility
      const limitedItems = (criteria.limit
        ? vocabularyItems.slice(0, criteria.limit)
        : vocabularyItems).map(item => this.normalizeVocabularyItem(item));

      // Generate lesson
      return this.generateLessonFromVocabulary(limitedItems, {
        title: criteria.title ?? 'Untitled Lesson',
        difficulty: criteria.difficulty ?? 'A1',
        type: criteria.type ?? 'vocabulary',
        description: criteria.description ?? ''
      });

    } catch (_error) {
      // Failed to generate lesson from criteria
      return this.createFallbackLesson('Failed to generate lesson from criteria');
    }
  }

  /**
   * Query vocabulary based on criteria
   */
  private queryVocabulary(criteria: {
    difficulty?: LessonDifficulty;
    categories?: VocabularyCategory[];
    partOfSpeech?: PartOfSpeech;
    limit?: number;
  }): VocabularyItem[] {
    if (this.vocabularyData.length === 0) {
      // No vocabulary data available
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
  private getDifficultyRange(difficulty: LessonDifficulty): { min: number; max: number } {
    const ranges: Record<LessonDifficulty, { min: number; max: number }> = {
      'A1': { min: 1, max: 1.5 },
      'A2': { min: 1.5, max: 2.5 },
      'B1': { min: 2.5, max: 3.5 },
      'B2': { min: 3.5, max: 4.5 },
      'C1': { min: 4.5, max: 5 }
    };
    return ranges[difficulty];
  }

  private normalizeCefrLevel(level?: LessonDifficulty | 'C1'): LessonDifficulty {
    if (level === 'A1' || level === 'A2' || level === 'B1' || level === 'B2') {
      return level;
    }
    return 'A1';
  }

  /**
   * Generate a lesson title based on vocabulary content
   */
  private generateLessonTitle(vocabularyItems: VocabularyItem[], type: LessonType): string {
    if (vocabularyItems.length === 0) return 'New Lesson';

    // Extract unique categories
    const categories = new Set<VocabularyCategory>();
    vocabularyItems.forEach(item => {
      this.normalizeCategories(item.categories).forEach(category => categories.add(category));
    });

    // Determine lesson type name
    const typeNames: Record<LessonType, string> = {
      'vocabulary': 'Vocabulary',
      'grammar': 'Grammar',
      'conversation': 'Conversation',
      'reading': 'Reading',
      'listening': 'Listening',
      'writing': 'Writing',
      'culture': 'Culture',
      'mixed': 'Mixed Topics',
      'contextual': 'Contextual'
    };

    const typeName = typeNames[type] || 'Lesson';

    // If single category, use it in the title
    if (categories.size === 1) {
      const categoryEntry = categories.values().next();
      if (!categoryEntry.done) {
        return `${typeName}: ${this.getCategoryDisplayName(categoryEntry.value)}`;
      }
    }

    // If multiple categories, use a generic title
    return `${typeName} Lesson (${vocabularyItems.length} items)`;
  }

  /**
   * Generate a lesson description
   */
  private generateLessonDescription(
    vocabularyItems: VocabularyItem[],
    difficulty: LessonDifficulty,
    type: LessonType
  ): string {
    const typeDescriptions: Record<LessonType, string> = {
      'vocabulary': 'vocabulary building',
      'grammar': 'grammar concepts',
      'conversation': 'conversation practice',
      'reading': 'reading comprehension',
      'listening': 'listening skills',
      'writing': 'writing practice',
      'culture': 'cultural insights',
      'mixed': 'various language skills',
      'contextual': 'contextual usage'
    };

    const partsOfSpeech = new Set<PartOfSpeech>();
    vocabularyItems.forEach(item => partsOfSpeech.add(item.partOfSpeech));

    const partOfSpeechList = Array.from(partsOfSpeech)
      .map(pos => this.getPartOfSpeechDisplayName(pos))
      .join(', ');

    return `This ${difficulty} level lesson focuses on ${typeDescriptions[type]} with ${vocabularyItems.length} vocabulary items covering ${partOfSpeechList}.`;
  }

  /**
   * Calculate lesson duration based on number of vocabulary items
   */
  private calculateLessonDuration(itemCount: number): number {
    // Base duration: 2 minutes per item
    const baseDuration = itemCount * 2;

    // Add buffer time for lessons with many items
    if (itemCount > 15) {
      return Math.min(baseDuration + 10, 120); // Max 120 minutes
    } else if (itemCount > 10) {
      return baseDuration + 5;
    } else {
      return Math.max(baseDuration, 15); // Minimum 15 minutes
    }
  }

  /**
   * Create learning objectives for a lesson
   */
  private createLearningObjectives(
    vocabularyItems: VocabularyItem[],
    difficulty: LessonDifficulty,
    type: LessonType
  ): LearningObjective[] {
    const objectives: LearningObjective[] = [];

    // Base objectives
    objectives.push({
      id: crypto.randomUUID(),
      description: `Learn ${vocabularyItems.length} new vocabulary items at ${difficulty} level`,
      isCompleted: false,
      createdAt: new Date()
    });

    // Type-specific objectives
    const typeObjectives: Record<LessonType, string> = {
      'vocabulary': 'Practice using new vocabulary in context',
      'grammar': 'Understand and apply grammar concepts',
      'conversation': 'Engage in conversation using learned vocabulary',
      'reading': 'Read and comprehend texts using learned vocabulary',
      'listening': 'Listen and understand spoken language at this level',
      'writing': 'Write sentences or paragraphs using learned vocabulary',
      'culture': 'Understand cultural context of vocabulary',
      'mixed': 'Practice various language skills at this level',
      'contextual': 'Use vocabulary in specific contexts'
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
    } else if (difficulty === 'B1' || difficulty === 'B2') {
      objectives.push({
        id: crypto.randomUUID(),
        description: 'Use vocabulary in complete sentences and questions',
        isCompleted: false,
        createdAt: new Date()
      });
    } else {
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
  private generateLessonTags(
    vocabularyItems: VocabularyItem[],
    difficulty: LessonDifficulty,
    type: LessonType
  ): string[] {
    const tags: string[] = [type, difficulty];

    // Add categories as tags
    const categories = new Set<VocabularyCategory>();
    vocabularyItems.forEach(item => {
      this.normalizeCategories(item.categories).forEach(category => categories.add(category));
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
  public getCategoryDisplayName(category: VocabularyCategory): string {
    const displayNames: Record<VocabularyCategory, string> = {
      'greetings': 'Greetings',
      'numbers': 'Numbers',
      'family': 'Family',
      'food': 'Food',
      'colors': 'Colors',
      'animals': 'Animals',
      'body-parts': 'Body Parts',
      'clothing': 'Clothing',
      'home': 'House & Home',
      'nature': 'Nature',
      'transport': 'Transportation',
      'technology': 'Technology',
      'time': 'Time & Date',
      'weather': 'Weather',
      'professions': 'Professions',
      'places': 'Places',
      'grammar': 'Grammar',
      'culture': 'Culture',
      'everyday-phrases': 'Everyday Phrases'
    };

    return displayNames[category] || category;
  }

  /**
   * Get display name for part of speech
   */
  private getPartOfSpeechDisplayName(partOfSpeech: PartOfSpeech): string {
    const displayNames: Record<PartOfSpeech, string> = {
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
      'phrase': 'Phrases',
      'expression': 'Expressions'
    };

    return displayNames[partOfSpeech] || partOfSpeech;
  }

  /**
   * Coerce category strings into the schema-backed category union
   */
  private normalizeCategories(categories?: VocabularyCategory[] | string[]): VocabularyCategory[] {
    const allowed: VocabularyCategory[] = [
      'greetings',
      'numbers',
      'family',
      'food',
      'colors',
      'animals',
      'body-parts',
      'clothing',
      'home',
      'nature',
      'transport',
      'technology',
      'time',
      'weather',
      'professions',
      'places',
      'grammar',
      'culture',
      'everyday-phrases'
    ];

    if (!categories || categories.length === 0) {
      return ['culture'];
    }

    const normalized = categories
      .map(category => (allowed.includes(category as VocabularyCategory) ? (category as VocabularyCategory) : 'culture'))
      .filter(Boolean) as VocabularyCategory[];

    return normalized.length > 0 ? normalized : ['culture'];
  }

  /**
   * Align vocabulary items with LessonSchema requirements
   */
  private normalizeVocabularyItem(item: VocabularyItem): VocabularyItem {
    return {
      ...item,
      categories: this.normalizeCategories(item.categories),
      metadata: (item.metadata ?? {}) as any,
      isCommon: item.isCommon ?? false,
      isVerified: item.isVerified ?? false,
      learningPhase: item.learningPhase ?? 0,
      createdAt: item.createdAt ?? new Date(),
      updatedAt: item.updatedAt ?? new Date(),
      cefrLevel: item.cefrLevel ?? 'A1'
    };
  }

  /**
   * Determine lesson difficulty based on vocabulary items
   */
  private determineLessonDifficulty(vocabularyItems: VocabularyItem[]): LessonDifficulty {
    if (vocabularyItems.length === 0) return 'A1';

    const totalDifficulty = vocabularyItems.reduce((sum, item) => sum + item.difficulty, 0);
    const avgDifficulty = totalDifficulty / vocabularyItems.length;

    if (avgDifficulty <= 1.5) return 'A1';
    if (avgDifficulty <= 2.5) return 'A2';
    if (avgDifficulty <= 3.5) return 'B1';
    if (avgDifficulty <= 4.5) return 'B2';
    return 'C1';
  }

  /**
   * Validate a lesson against the schema
   */
  private validateLesson(lesson: Lesson): Lesson {
    const result = LessonSchema.safeParse(lesson);
    if (result.success) {
      return result.data;
    } else {
      // Lesson validation failed
      return this.createFallbackLesson('Lesson validation failed');
    }
  }

  /**
   * Create a fallback lesson when validation or generation fails
   */
  private createFallbackLesson(_errorMessage: string): Lesson {
    // Creating fallback lesson

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
        relatedLessons: [],
        isPremium: false
      }
    };
  }

  /**
   * Get all lessons
   */
  getLessons(): Lesson[] {
    return this.lessons;
  }

  /**
   * Get a specific lesson by ID
   */
  getLessonById(id: string): Lesson | undefined {
    return this.lessons.find(lesson => lesson.id === id);
  }

  /**
   * Add a lesson to the collection
   */
  addLesson(lesson: Lesson): void {
    const validatedLesson = this.validateLesson(lesson);
    this.lessons.push(validatedLesson);
  }

  /**
   * Update a lesson
   */
  updateLesson(id: string, updates: Partial<Lesson>): Lesson | undefined {
    const index = this.lessons.findIndex(lesson => lesson.id === id);
    if (index === -1) return undefined;

    const currentLesson = this.lessons[index];
    const baseLesson = {
      ...currentLesson,
      ...updates,
      updatedAt: new Date()
    };

    const updatedLesson = {
      ...baseLesson,
      id: baseLesson.id ?? `lesson_${Date.now()}`,
      title: baseLesson.title ?? 'Untitled',
      description: baseLesson.description ?? '',
      difficulty: (baseLesson.difficulty ?? 'A1') as 'A1' | 'A2' | 'B1' | 'B2' | 'C1',
      type: (baseLesson.type ?? 'vocabulary') as LessonType,
      vocabulary: baseLesson.vocabulary ?? [],
      duration: baseLesson.duration ?? 0,
      objectives: baseLesson.objectives ?? [],
      isCompleted: baseLesson.isCompleted ?? false,
      completionPercentage: baseLesson.completionPercentage ?? 0
    };

    const validatedLesson = this.validateLesson(updatedLesson as Lesson);
    this.lessons[index] = validatedLesson;
    return validatedLesson;
  }

  /**
   * Remove a lesson
   */
  removeLesson(id: string): boolean {
    const initialLength = this.lessons.length;
    this.lessons = this.lessons.filter(lesson => lesson.id !== id);
    return this.lessons.length !== initialLength;
  }

  /**
   * Get lessons by difficulty level
   */
  getLessonsByDifficulty(difficulty: LessonDifficulty): Lesson[] {
    return this.lessons.filter(lesson => lesson.difficulty === difficulty);
  }

  /**
   * Get lessons by type
   */
  getLessonsByType(type: LessonType): Lesson[] {
    return this.lessons.filter(lesson => lesson.type === type);
  }

  /**
   * Get lessons by tag
   */
  getLessonsByTag(tag: string): Lesson[] {
    return this.lessons.filter(lesson =>
      lesson.metadata.tags.includes(tag)
    );
  }

  /**
   * Get random lessons for recommendation
   */
  getRandomLessons(count: number = 3): Lesson[] {
    if (this.lessons.length === 0) return [];

    // Shuffle array and take first N items
    const shuffled = [...this.lessons].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, this.lessons.length));
  }
}

// Export a singleton instance
export const lessonService = new LessonService();