/**
 * EnhancedLessonService - Extends the base LessonService to support dynamic lesson generation
 * while maintaining backward compatibility with existing functionality.
 *
 * This service integrates with the LessonGenerationEngine to provide dynamic lesson creation
 * based on templates, vocabulary, grammar concepts, and cultural context.
 */
import { lessonService } from './lesson';
import { lessonGenerationEngine } from './lesson-generation/lesson-generator';
import type { LessonGenerationParams, GeneratedLesson, EnhancedLessonCriteria } from './lesson-generation/types';
import { isLessonDifficulty, isLessonType } from './lesson-generation/types';
import type { Lesson, LearningObjective, LessonType, LessonDifficulty } from '../schemas/lesson';
import type { VocabularyItem, VocabularyCategory } from '../types/vocabulary';
import { v4 as uuidv4 } from 'uuid';

class EnhancedLessonService {
  private initialized = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    await lessonService.initialize();
    this.initialized = true;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a dynamic lesson based on the provided parameters
   * @param params Lesson generation parameters
   * @returns Generated lesson in standard Lesson format
   */
  async generateDynamicLesson(params: LessonGenerationParams): Promise<Lesson> {
    try {
      // Validate parameters
      const validatedParams = this.validateLessonGenerationParams(params);

      // Generate the lesson using the LessonGenerationEngine
      const generatedLesson = await lessonGenerationEngine.generateLesson(validatedParams);

      // Convert the generated lesson to the standard Lesson format
      return this.convertGeneratedLessonToLesson(generatedLesson);
    } catch (_error) {
      // Error handling is done by returning a fallback lesson
      return this.createFallbackLesson(params.type || 'vocabulary', params.difficulty || 'A1');
    }
  }

  /**
   * Generate a thematic lesson focused on specific vocabulary categories
   * @param categories Array of vocabulary categories
   * @param difficulty Lesson difficulty level
   * @param options Additional options for lesson generation
   * @returns Generated lesson in standard Lesson format
   */
  async generateThematicLesson(categories: VocabularyCategory[], difficulty: string, options?: { includePractice?: boolean; includeReview?: boolean }): Promise<Lesson> {
    const validatedDifficulty = isLessonDifficulty(difficulty) ? difficulty : 'A1';
    const params: LessonGenerationParams = {
      userId: 'default',
      type: 'vocabulary',
      difficulty: validatedDifficulty,
      criteria: { categories },
      metadata: {
        includePractice: options?.includePractice ?? true,
        includeReview: options?.includeReview ?? false
      }
    };

    return this.generateDynamicLesson(params);
  }

  /**
   * Generate a grammar lesson focused on a specific grammar concept
   * @param conceptType Grammar concept type
   * @param difficulty Lesson difficulty level
   * @param options Additional options for lesson generation
   * @returns Generated lesson in standard Lesson format
   */
  async generateGrammarLesson(conceptType: string, difficulty: string, options?: { includePractice?: boolean; includeComparison?: boolean }): Promise<Lesson> {
    const validatedDifficulty = isLessonDifficulty(difficulty) ? difficulty : 'A1';
    const params: LessonGenerationParams = {
      userId: 'default',
      type: 'grammar',
      difficulty: validatedDifficulty,
      criteria: { conceptType },
      metadata: {
        includePractice: options?.includePractice ?? true,
        includeComparison: options?.includeComparison ?? false
      }
    };

    return this.generateDynamicLesson(params);
  }

  /**
   * Generate a mixed lesson combining vocabulary and grammar
   * @param category Vocabulary category
   * @param difficulty Lesson difficulty level
   * @param options Additional options for lesson generation
   * @returns Generated lesson in standard Lesson format
   */
  async generateMixedLesson(category: VocabularyCategory, difficulty: string, options?: { includePractice?: boolean; includeReview?: boolean }): Promise<Lesson> {
    const validatedDifficulty = isLessonDifficulty(difficulty) ? difficulty : 'A1';
    const params: LessonGenerationParams = {
      userId: 'default',
      type: 'mixed',
      difficulty: validatedDifficulty,
      criteria: { categories: [category] },
      metadata: {
        includePractice: options?.includePractice ?? true,
        includeReview: options?.includeReview ?? false
      }
    };

    return this.generateDynamicLesson(params);
  }

  /**
   * Validate lesson generation parameters and provide defaults for invalid values
   * @param params Lesson generation parameters
   * @returns Validated parameters with defaults applied
   */
  private validateLessonGenerationParams(params: LessonGenerationParams): LessonGenerationParams {
    // Default values
    const defaults = {
      userId: 'default',
      type: 'vocabulary' as const,
      difficulty: 'A1' as const,
      criteria: {},
      metadata: {}
    };

    // Validate and apply defaults
    const validatedParams: LessonGenerationParams = {
      userId: params.userId || defaults.userId,
      type: (['vocabulary', 'grammar', 'mixed', 'culture', 'contextual'] as const).includes(params.type as any) ? params.type : defaults.type,
      difficulty: (['A1', 'A2', 'B1', 'B2', 'C1'] as const).includes(params.difficulty as any) ? params.difficulty : defaults.difficulty,
      criteria: params.criteria || defaults.criteria,
      metadata: params.metadata || defaults.metadata
    };

    return validatedParams;
  }

  /**
   * Convert a GeneratedLesson to the standard Lesson format
   * @param generatedLesson The lesson generated by the LessonGenerationEngine
   * @returns Lesson in standard format
   */
  private convertGeneratedLessonToLesson(generatedLesson: GeneratedLesson): Lesson {
    // Converting generated lesson to standard format

    // Note: Lesson schema does NOT have sections field
    // Convert sections to content string instead
    const sectionContent = generatedLesson.sections
      .map(section => `## ${section.title || section.type}\n${section.content || ''}`)
      .join('\n\n');

    // Convert learning objectives
    const objectives: LearningObjective[] = generatedLesson.learningObjectives.map(objective => ({
      id: uuidv4(),
      description: objective,
      isCompleted: false,
      createdAt: new Date()
    }));

    // Calculate duration (5 minutes per section + 5 minutes buffer)
    const duration = generatedLesson.sections.length * 5 + 5;

    // Generate tags
    const tags = this.generateLessonTags(generatedLesson);

    // Create the lesson object
    const lesson: Lesson = {
      id: generatedLesson.id,
      title: generatedLesson.title,
      description: this.generateLessonDescription(generatedLesson),
      difficulty: this.normalizeDifficulty(generatedLesson.difficulty),
      type: this.normalizeLessonType(generatedLesson.type),
      duration,
      vocabulary: this.normalizeVocabulary(generatedLesson.vocabulary || []),
      objectives,
      content: sectionContent || this.generateLessonDescription(generatedLesson),
      isCompleted: false,
      completionPercentage: 0,
      createdAt: generatedLesson.createdAt || new Date(),
      updatedAt: generatedLesson.updatedAt || new Date(),
      metadata: {
        tags,
        prerequisites: [],
        relatedLessons: [],
        isPremium: false,
        ...generatedLesson.metadata
      }
    };

    // Lesson object created successfully
    return lesson;
  }

  /**
   * Generate appropriate tags for the lesson
   * @param generatedLesson The generated lesson
   * @returns Array of tags
   */
  private generateLessonTags(generatedLesson: GeneratedLesson): string[] {
    const tags: string[] = [];

    // Add basic type and difficulty tags
    tags.push(generatedLesson.type);
    tags.push(generatedLesson.difficulty);

    // Add grammar concept names if available
    if (generatedLesson.grammarConcepts && generatedLesson.grammarConcepts.length > 0) {
      generatedLesson.grammarConcepts.forEach(concept => {
        if (concept.name?.german) {
          tags.push(concept.name.german);
        }
      });
    }

    // Add vocabulary categories if available
    if (generatedLesson.vocabulary && generatedLesson.vocabulary.length > 0) {
      const categories = new Set<string>();
      generatedLesson.vocabulary.forEach(vocab => {
        if (vocab.categories) {
          vocab.categories.forEach(category => {
            // Add both display name and raw category name
            const displayName = lessonService.getCategoryDisplayName(category);
            categories.add(displayName);
            categories.add(category); // Add raw category name as well
          });
        }
      });
      tags.push(...Array.from(categories));
    }

    return tags;
  }

  /**
   * Generate a meaningful description for the lesson
   * @param generatedLesson The generated lesson
   * @returns Lesson description
   */
  private generateLessonDescription(generatedLesson: GeneratedLesson): string {
    const difficultyMap: Record<string, string> = {
      'A1': 'beginner',
      'A2': 'elementary',
      'B1': 'intermediate',
      'B2': 'upper intermediate',
      'C1': 'advanced'
    };

    const typeMap: Record<string, string> = {
      'vocabulary': 'vocabulary building',
      'grammar': 'grammar concepts',
      'mixed': 'various language skills',
      'contextual': 'contextual learning'
    };

    const difficultyLevel = difficultyMap[generatedLesson.difficulty] || 'beginner';
    const focusArea = typeMap[generatedLesson.type] || 'language learning';

    // Count vocabulary items
    const vocabCount = generatedLesson.vocabulary?.length || 0;

    // List grammar concepts
    let grammarConceptsText = '';
    if (generatedLesson.grammarConcepts && generatedLesson.grammarConcepts.length > 0) {
      const conceptNames = generatedLesson.grammarConcepts
        .map(concept => concept.name?.german || concept.id)
        .join(', ');
      grammarConceptsText = `. It covers grammar concepts including ${conceptNames}.`;
    }

    return `This ${difficultyLevel} level lesson focuses on ${focusArea} with ${vocabCount} vocabulary items${grammarConceptsText}`;
  }

  private normalizeLessonType(type: LessonType | 'contextual' | undefined): LessonType {
    if (type === 'vocabulary' || type === 'grammar' || type === 'conversation' || type === 'reading' || type === 'listening' || type === 'writing' || type === 'culture' || type === 'mixed') {
      return type;
    }
    return 'mixed';
  }

  private normalizeDifficulty(difficulty: LessonDifficulty | undefined): LessonDifficulty {
    if (difficulty === 'A1' || difficulty === 'A2' || difficulty === 'B1' || difficulty === 'B2' || difficulty === 'C1') {
      return difficulty;
    }
    return 'A1';
  }

  private normalizeVocabulary(items: VocabularyItem[]): VocabularyItem[] {
    return items.map(item => ({
      ...item,
      isCommon: item.isCommon ?? false,
      isVerified: item.isVerified ?? false,
      learningPhase: item.learningPhase ?? 0,
      categories: item.categories ?? [],
      metadata: (item.metadata ?? {}) as any
    }));
  }

  /**
   * Create a fallback lesson when generation fails
   * @param type Lesson type
   * @param difficulty Lesson difficulty
   * @returns Fallback lesson
   */
  private createFallbackLesson(type: string, difficulty: string): Lesson {
    return {
      id: `fallback-lesson-${uuidv4()}`,
      title: 'Lesson Unavailable',
      description: 'Dynamic lesson generation failed. Please try again or select a different lesson.',
      difficulty: isLessonDifficulty(difficulty) ? difficulty : 'A1',
      type: isLessonType(type) ? type : 'vocabulary',
      duration: 10,
      vocabulary: [],
      objectives: [],
      isCompleted: false,
      completionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        tags: [type, difficulty],
        prerequisites: [],
        relatedLessons: [],
        isPremium: false
      }
    };
  }

  // Proxy methods for backward compatibility with existing LessonService
  getLessons() {
    return lessonService.getLessons() || [];
  }

  getLessonById(id: string) {
    return lessonService.getLessonById(id);
  }

  generateLessonFromVocabulary(vocabularyItems: VocabularyItem[]) {
    return lessonService.generateLessonFromVocabulary(vocabularyItems);
  }

  async generateLessonFromCriteria(criteria: EnhancedLessonCriteria) {
    const normalizedCriteria = {
      ...criteria,
      type: criteria.type ? this.normalizeLessonType(criteria.type) : undefined,
      difficulty: criteria.difficulty ? this.normalizeDifficulty(criteria.difficulty as LessonDifficulty) : undefined,
      categories: criteria.categories as VocabularyCategory[] | undefined
    };

    const result = await lessonService.generateLessonFromCriteria(normalizedCriteria as any);
    return result || this.createFallbackLesson('vocabulary', 'A1');
  }

  getLessonsByDifficulty(difficulty: string) {
    if (isLessonDifficulty(difficulty)) {
      return lessonService.getLessonsByDifficulty(difficulty) || [];
    }
    return [];
  }

  getLessonsByType(type: string) {
    if (isLessonType(type)) {
      return lessonService.getLessonsByType(type) || [];
    }
    return [];
  }

  getLessonsByTag(tag: string) {
    return lessonService.getLessonsByTag(tag) || [];
  }

  getRandomLessons(count: number) {
    return lessonService.getRandomLessons(count) || [];
  }

  addLesson(lesson: Lesson) {
    return lessonService.addLesson(lesson);
  }

  updateLesson(id: string, updates: Partial<Lesson>) {
    return lessonService.updateLesson(id, updates);
  }

  removeLesson(id: string) {
    return lessonService.removeLesson(id);
  }
}

// Export a singleton instance
export const enhancedLessonService = new EnhancedLessonService();