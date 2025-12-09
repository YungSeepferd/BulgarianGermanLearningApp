/**
 * LessonGenerationEngine - Core service for generating dynamic lessons
 *
 * This service coordinates the lesson generation process by using:
 * 1. LessonTemplateRepository to select appropriate templates
 * 2. VocabularyService to fetch vocabulary items
 * 3. CulturalGrammarService to fetch grammar concepts
 * 4. TemplateRenderer to generate the final lesson content
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ILessonGenerationEngine,
  LessonGenerationParams,
  LessonGenerationOptions,
  GeneratedLesson,
  GeneratedLessonSection,
  TemplateRenderingContext,
  CulturalGrammarConcept,
  ILessonTemplateRepository,
  ICulturalGrammarService,
  ITemplateRenderer
} from './types';
import { lessonTemplateRepository } from './lesson-templates';
import { culturalGrammarService } from './cultural-grammar';
import { templateRenderer } from './template-renderer';
import { VocabularyService } from '../../data/vocabulary';
import type { VocabularyItem, PartOfSpeech } from '$lib/types/vocabulary';

/**
 * LessonGenerationEngine class
 *
 * Implements the ILessonGenerationEngine interface to provide core lesson generation logic.
 */
export class LessonGenerationEngine implements ILessonGenerationEngine {
  private templateRepository: ILessonTemplateRepository;
  private grammarService: ICulturalGrammarService;
  private renderer: ITemplateRenderer;
  private vocabularyServicePromise: Promise<VocabularyService>;

  /**
   * Initialize with dependencies
   *
   * @param templateRepository - Repository for lesson templates
   * @param grammarService - Service for grammar concepts
   * @param renderer - Service for template rendering
   * @param vocabularyServicePromise - Promise resolving to VocabularyService instance
   */
  constructor(
    templateRepository: ILessonTemplateRepository = lessonTemplateRepository,
    grammarService: ICulturalGrammarService = culturalGrammarService,
    renderer: ITemplateRenderer = templateRenderer,
    vocabularyServicePromise: Promise<VocabularyService> = VocabularyService.getInstance()
  ) {
    this.templateRepository = templateRepository;
    this.grammarService = grammarService;
    this.renderer = renderer;
    this.vocabularyServicePromise = vocabularyServicePromise;
  }

  /**
   * Generate a lesson based on parameters and options
   *
   * @param params - Parameters for lesson generation
   * @param options - Options for generation algorithm
   * @returns Generated lesson
   */
  async generateLesson(
    params: LessonGenerationParams,
    options: LessonGenerationOptions = {}
  ): Promise<GeneratedLesson> {
    try {
      // Dispatch to specific generation method based on lesson type
      switch (params.type) {
        case 'vocabulary':
          return this.generateThematicLesson(params, options);
        case 'grammar':
          return this.generateGrammarLesson(params, options);
        case 'cultural':
          return this.generateContextualLesson(params, options);
        case 'mixed':
        case 'contextual':
          return this.generateContextualLesson(params, options);
        default:
          // Default to thematic/vocabulary if type is unknown or general
          return this.generateThematicLesson(params, options);
      }
    } catch (_error) {
      // Error handling is done by throwing a new error with the original message
      const error = _error as Error;
      throw new Error(`Failed to generate lesson: ${error.message}`);
    }
  }

  /**
   * Generate a thematic vocabulary lesson
   *
   * @param params - Parameters for lesson generation
   * @param options - Options for generation algorithm
   * @returns Generated lesson
   */
  async generateThematicLesson(
    params: LessonGenerationParams,
    options: LessonGenerationOptions = {}
  ): Promise<GeneratedLesson> {
    // 1. Determine Lesson Structure based on metadata or defaults
    // A standard thematic lesson has an Introduction and a Practice section
    const includePractice = params.metadata?.includePractice !== false;
    const includeReview = params.metadata?.includeReview === true;

    const sections: GeneratedLessonSection[] = [];
    const allVocabularyItems: VocabularyItem[] = [];
    let learningObjectives: string[] = [];

    // 2. Fetch Vocabulary
    const vocabularyService = await this.vocabularyServicePromise;
    const limit = params.criteria.limit || options.maxItems || 10;
    const numericDifficulty = this.mapDifficultyToNumber(params.difficulty);
    
    let vocabularyItems: VocabularyItem[] = [];
    
    // Smart Selection:
    // - If categories provided, prioritize them
    // - If partOfSpeech provided, filter by it
    // - Ensure difficulty match
    
    if (params.criteria.categories && params.criteria.categories.length > 0) {
      // Fetch for each category and combine
      for (const category of params.criteria.categories) {
        // We'll use searchVocabulary for more granular control if needed,
        // but getVocabularyByCategory is optimized for this
        const items = await vocabularyService.getVocabularyByCategory(category, {
          difficulty: numericDifficulty,
          limit: Math.ceil(limit / params.criteria.categories.length)
        });
        
        // Filter by POS if requested
        const filteredItems = params.criteria.partOfSpeech
          ? items.filter(i => i.partOfSpeech === params.criteria.partOfSpeech)
          : items;
          
        vocabularyItems = [...vocabularyItems, ...filteredItems];
      }
    } else {
      // Fallback: Random but respect POS
      if (params.criteria.partOfSpeech) {
        const result = await vocabularyService.searchVocabulary({
          difficulty: numericDifficulty,
          partOfSpeech: params.criteria.partOfSpeech,
          limit: limit
        });
        vocabularyItems = result.items;
      } else {
        vocabularyItems = await vocabularyService.getRandomVocabulary(limit, {
          difficulty: numericDifficulty
        });
      }
    }
    
    // Ensure we respect the limit
    vocabularyItems = vocabularyItems.slice(0, limit);
    allVocabularyItems.push(...vocabularyItems);

    // 3. Generate Introduction Section
    try {
      // We explicitly look for the 'vocabulary-intro' template we created
      const introTemplate = await this.templateRepository.getTemplateById('vocabulary-intro')
        || await this.templateRepository.getTemplate('vocabulary', params.difficulty);
      
      const themeName = params.criteria.categories?.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') || 'General';
      
      const introContext: TemplateRenderingContext = {
        sectionTitle: `Vocabulary: ${themeName}`,
        count: vocabularyItems.length,
        theme: themeName,
        difficulty: params.difficulty,
        vocabulary: vocabularyItems,
        learningTip: 'Focus on the gender of nouns (der, die, das) as you learn them.',
        learningObjectives: [
          `Learn ${vocabularyItems.length} new words related to ${themeName}`,
          'Practice pronunciation and usage'
        ]
      };
      
      learningObjectives = [...introContext.learningObjectives || []];

      const introContent = this.renderer.render(introTemplate, introContext);
      
      sections.push({
        id: uuidv4(),
        title: introContext.sectionTitle || 'Introduction',
        content: introContent,
        type: 'introduction',
        metadata: { templateId: introTemplate.id }
      });
    } catch (_error) {
      // Intro section generation failed, but we continue with other sections
      // Continue or throw depending on severity. Here we log and continue if possible.
    }

    // 4. Generate Practice Section (if requested)
    if (includePractice && vocabularyItems.length > 0) {
      try {
        const practiceTemplate = await this.templateRepository.getTemplateById('vocabulary-practice')
          || await this.templateRepository.getTemplate('vocabulary', params.difficulty);

        const practiceContext: TemplateRenderingContext = {
          sectionTitle: 'Practice Exercises',
          instructions: 'Test your knowledge of the new words.',
          vocabulary: vocabularyItems
        };

        const practiceContent = this.renderer.render(practiceTemplate, practiceContext);

        sections.push({
          id: uuidv4(),
          title: 'Practice',
          content: practiceContent,
          type: 'exercise',
          metadata: { templateId: practiceTemplate.id }
        });
      } catch (_error) {
        // Practice section generation failed, but we continue with other sections
      }
    }

    // 5. Generate Review Section (if requested)
    if (includeReview) {
      try {
        const reviewTemplate = await this.templateRepository.getTemplateById('vocabulary-review')
          || await this.templateRepository.getTemplate('vocabulary', params.difficulty);

        // Fetch some older vocabulary for review (mocking this logic for now)
        // In a real app, this would come from the user's learning history (UserLearningProfile)
        // For now, we'll just grab some random words different from the main vocabulary
        const reviewItems = await vocabularyService.getRandomVocabulary(5, {
          difficulty: numericDifficulty
        });

        const reviewContext: TemplateRenderingContext = {
          sectionTitle: 'Review',
          context: 'Previous Lessons',
          vocabulary: reviewItems
        };

        const reviewContent = this.renderer.render(reviewTemplate, reviewContext);

        sections.push({
          id: uuidv4(),
          title: 'Review',
          content: reviewContent,
          type: 'summary', // using summary type for review for now
          metadata: { templateId: reviewTemplate.id }
        });
      } catch (_error) {
        // Review section generation failed, but we continue with other sections
      }
    }

    // 6. Construct Final Lesson Object
    return {
      id: uuidv4(),
      type: params.type,
      difficulty: params.difficulty,
      title: `Thematic Lesson: ${params.criteria.categories?.join(', ') || 'General'}`,
      sections: sections,
      vocabulary: allVocabularyItems,
      grammarConcepts: [],
      learningObjectives: learningObjectives,
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate a grammar-focused lesson
   *
   * @param params - Parameters for lesson generation
   * @param options - Options for generation algorithm
   * @returns Generated lesson
   */
  async generateGrammarLesson(
    params: LessonGenerationParams,
    _options: LessonGenerationOptions = {}
  ): Promise<GeneratedLesson> {
    const includePractice = params.metadata?.includePractice !== false;
    const includeComparison = params.metadata?.includeComparison !== false;

    const sections: GeneratedLessonSection[] = [];
    
    // 1. Fetch Grammar Concepts
    // We try to find a concept matching specific criteria, or get a suitable one for the level
    const grammarConcepts = await this.grammarService.query({
      difficulty: params.difficulty,
      partOfSpeech: params.criteria.partOfSpeech,
      conceptType: params.criteria.conceptType
    });

    if (grammarConcepts.length === 0) {
      // No grammar concepts found, using fallback logic
      // In production, might throw or fallback more gracefully
    }

    const mainConcept = grammarConcepts[0]; // Primary focus
    
    // 2. Fetch Supporting Vocabulary
    const vocabularyService = await this.vocabularyServicePromise;
    const numericDifficulty = this.mapDifficultyToNumber(params.difficulty);
    let exampleVocabulary: VocabularyItem[] = [];

    // Find vocabulary relevant to the grammar concept (e.g. nouns for gender rules)
    if (mainConcept && mainConcept.partOfSpeech && mainConcept.partOfSpeech.length > 0) {
      const searchResult = await vocabularyService.searchVocabulary({
        difficulty: numericDifficulty,
        partOfSpeech: mainConcept.partOfSpeech[0], // Prioritize primary POS
        limit: 8
      });
      exampleVocabulary = searchResult.items;
    } else {
      exampleVocabulary = await vocabularyService.getRandomVocabulary(8, { difficulty: numericDifficulty });
    }

    // 3. Generate Concept Explanation Section
    try {
      const conceptTemplate = await this.templateRepository.getTemplateById('grammar-concept')
        || await this.templateRepository.getTemplate('grammar', params.difficulty);

      const conceptContext: TemplateRenderingContext = {
        sectionTitle: `Grammar: ${mainConcept ? mainConcept.name.german : 'Grammar Rule'}`,
        grammarConcept: mainConcept,
        vocabulary: exampleVocabulary,
        learningTip: 'Focus on understanding the underlying logic rather than just memorizing rules.',
        learningObjectives: [
          `Understand the concept of ${mainConcept ? mainConcept.name.german : 'this grammar rule'}`,
          `Compare ${mainConcept ? mainConcept.name.german : 'it'} with Bulgarian usage`
        ]
      };

      const conceptContent = this.renderer.render(conceptTemplate, conceptContext);

      sections.push({
        id: uuidv4(),
        title: 'Explanation',
        content: conceptContent,
        type: 'grammar',
        metadata: { templateId: conceptTemplate.id, conceptId: mainConcept?.id }
      });
    } catch (_error) {
      // Grammar explanation generation failed, but we continue with other sections
    }

    // 4. Generate Practice Section (if requested)
    if (includePractice && mainConcept) {
      try {
        const practiceTemplate = await this.templateRepository.getTemplateById('grammar-practice')
          || await this.templateRepository.getTemplate('grammar', params.difficulty);

        const practiceContext: TemplateRenderingContext = {
          sectionTitle: 'Grammar Practice',
          grammarConcept: mainConcept,
          vocabulary: exampleVocabulary.slice(0, 5) // Use a subset for practice
        };

        const practiceContent = this.renderer.render(practiceTemplate, practiceContext);

        sections.push({
          id: uuidv4(),
          title: 'Practice',
          content: practiceContent,
          type: 'exercise',
          metadata: { templateId: practiceTemplate.id }
        });
      } catch (_error) {
        // Grammar practice generation failed, but we continue with other sections
      }
    }

    // 5. Generate Comparison Section (if requested and relevant)
    if (includeComparison && mainConcept && mainConcept.culturalContext) {
      try {
        const comparisonTemplate = await this.templateRepository.getTemplateById('grammar-comparison');
        
        // Only generate if we have a specific comparison template
        if (comparisonTemplate) {
          const comparisonContext: TemplateRenderingContext = {
            sectionTitle: 'Cultural Comparison',
            grammarConcept: mainConcept
          };

          const comparisonContent = this.renderer.render(comparisonTemplate, comparisonContext);

          sections.push({
            id: uuidv4(),
            title: 'Comparison',
            content: comparisonContent,
            type: 'cultural',
            metadata: { templateId: comparisonTemplate.id }
          });
        }
      } catch (_error) {
        // Comparison section generation failed, but we continue with other sections
      }
    }

    // 6. Construct Final Lesson Object
    return {
      id: uuidv4(),
      type: params.type,
      difficulty: params.difficulty,
      title: mainConcept ? `Grammar: ${mainConcept.name.german}` : 'Grammar Lesson',
      sections: sections,
      vocabulary: exampleVocabulary,
      grammarConcepts: mainConcept ? [mainConcept] : [],
      learningObjectives: [
        `Understand ${mainConcept ? mainConcept.name.german : 'the grammar rule'}`,
        'Apply the rule in context',
        'Compare with Bulgarian usage'
      ],
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate a contextual or mixed lesson
   *
   * @param params - Parameters for lesson generation
   * @param options - Options for generation algorithm
   * @returns Generated lesson
   */
  async generateContextualLesson(
    params: LessonGenerationParams,
    options: LessonGenerationOptions = {}
  ): Promise<GeneratedLesson> {
    // For now, treat as mixed vocabulary + grammar
    // 1. Select Template (mixed or contextual)
    const template = await this.templateRepository.getTemplateById('mixed-lesson')
      || await this.templateRepository.getTemplate('mixed', params.difficulty);

    // 2. Fetch Grammar & Vocabulary
    // Get one grammar concept
    const grammarConcepts = await this.grammarService.query({
      difficulty: params.difficulty,
      limit: 1
    });
    const mainConcept = grammarConcepts[0];

    // Get vocabulary related to a theme
    const vocabularyService = await this.vocabularyServicePromise;
    const numericDifficulty = this.mapDifficultyToNumber(params.difficulty);
    const limit = options.maxItems || 8;
    
    // Pick a category if none provided
    const category = params.criteria.categories?.[0] || 'travel'; // Default to travel for context
    
    const vocabularyItems = await vocabularyService.getVocabularyByCategory(category, {
      difficulty: numericDifficulty,
      limit: limit
    });

    // 3. Prepare Context
    const context: TemplateRenderingContext = {
      sectionTitle: `Contextual Lesson: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      theme: category,
      difficulty: params.difficulty,
      grammarConcept: mainConcept,
      vocabulary: vocabularyItems,
      learningTip: 'Try to narrate a short story using these words.',
      learningObjectives: [
        `Master vocabulary related to ${category}`,
        mainConcept ? `Apply ${mainConcept.name.german} in context` : 'Practice sentence construction',
        'Build reading comprehension'
      ]
    };

    // 4. Render
    const renderedContent = this.renderer.render(template, context);

    // 5. Construct
    return this.createLessonObject(
      params,
      context.sectionTitle || 'Contextual Lesson',
      renderedContent,
      vocabularyItems,
      mainConcept ? [mainConcept] : [],
      context.learningObjectives || []
    );
  }

  /**
   * Generate an adaptive lesson based on user profile
   * (Placeholder for future implementation)
   */
  async generateAdaptiveLesson(
    params: LessonGenerationParams,
    _options: LessonGenerationOptions = {}
  ): Promise<GeneratedLesson> {
    // Logic would involve analyzing user profile and picking weak spots
    // For now, delegate to thematic
    return this.generateThematicLesson(params, _options);
  }

  /**
   * Helper to map CEFR difficulty (A1-C1) to numeric (1-5)
   */
  private mapDifficultyToNumber(difficulty: LessonDifficulty): number {
    const map: Record<LessonDifficulty, number> = {
      'A1': 1,
      'A2': 2,
      'B1': 3,
      'B2': 4,
      'C1': 5
    };
    return map[difficulty] || 1;
  }

  /**
   * Helper to create the standard GeneratedLesson object
   */
  private createLessonObject(
    params: LessonGenerationParams,
    title: string,
    content: string,
    vocabulary: VocabularyItem[],
    grammarConcepts: CulturalGrammarConcept[],
    learningObjectives: string[]
  ): GeneratedLesson {
    const section: GeneratedLessonSection = {
      id: uuidv4(),
      title: 'Main Content', // Could be dynamic
      content: content,
      type: params.type === 'vocabulary' ? 'vocabulary' : 
            params.type === 'grammar' ? 'grammar' : 'mixed',
      metadata: {}
    };

    return {
      id: uuidv4(),
      type: params.type,
      difficulty: params.difficulty,
      title: title,
      sections: [section],
      vocabulary: vocabulary,
      grammarConcepts: grammarConcepts,
      learningObjectives: learningObjectives,
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Singleton instance of LessonGenerationEngine
 */
export const lessonGenerationEngine = new LessonGenerationEngine();