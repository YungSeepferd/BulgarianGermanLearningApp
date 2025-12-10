<script lang="ts">
  /**
   * LessonGenerator Component
   *
   * Provides a comprehensive interface for generating dynamic lessons with advanced parameters.
   * Supports all lesson types (vocabulary, grammar, mixed) with detailed customization options.
   */

  import { enhancedLessonService } from '$lib/services/enhanced-lesson';
  import { t } from '$lib/services/localization';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';

  // Simple error handler
  function handleError(error, context) {
    console.error(`[${context}]`, error);
  }

  // Props
  let { isOpen = false, onClose = () => {}, onLessonGenerated = () => {} } = $props();

  // State
  let isGenerating = $state(false);
  let error = $state(null);
  let successMessage = $state(null);
  let hasError = $state(false);

  // Lesson generation parameters
  let lessonParams = $state<{
    title: string;
    description: string;
    type: LessonType | '';
    difficulty: LessonDifficulty | '';
    category: VocabularyCategory | '';
    partOfSpeech: PartOfSpeech | '';
    conceptType: string;
    limit: number;
    includePractice: boolean;
    includeComparison: boolean;
    includeReview: boolean;
  }>({
    title: '',
    description: '',
    type: '',
    difficulty: '',
    category: '',
    partOfSpeech: '',
    conceptType: '',
    limit: 10,
    includePractice: true,
    includeComparison: false,
    includeReview: false
  });

  // Computed
  let isVocabularyLesson = $derived(lessonParams.type === 'vocabulary');
  let isGrammarLesson = $derived(lessonParams.type === 'grammar');
  let isMixedLesson = $derived(lessonParams.type === 'mixed');

  // Methods
  function resetForm() {
    lessonParams = {
      title: '',
      description: '',
      type: '',
      difficulty: '',
      category: '',
      partOfSpeech: '',
      conceptType: '',
      limit: 10,
      includePractice: true,
      includeComparison: false,
      includeReview: false
    };
    error = null;
    successMessage = null;
  }

  function closeModal() {
    resetForm();
    onClose();
  }

  /**
   * Generate a lesson with proper error handling and validation
   * @throws Error if lesson generation fails
   */
  async function generateLesson() {
    try {
      isGenerating = true;
      error = null;
      successMessage = null;
      hasError = false;

      // Validate required fields with proper type checking
      if (!lessonParams.type || typeof lessonParams.type !== 'string') {
        throw new Error(t('lesson.generator.errors.select_valid_lesson_type'));
      }

      if (!lessonParams.difficulty || typeof lessonParams.difficulty !== 'string') {
        throw new Error(t('lesson.generator.errors.select_valid_difficulty'));
      }

      // Generate appropriate lesson based on type
      let generatedLesson;

      if (isVocabularyLesson) {
        // Generate vocabulary lesson
        const categories = lessonParams.category ? [lessonParams.category] : undefined;
        generatedLesson = await enhancedLessonService.generateThematicLesson(
          categories || [],
          lessonParams.difficulty,
          {
            includePractice: lessonParams.includePractice,
            includeReview: lessonParams.includeReview
          }
        );
      }
      else if (isGrammarLesson) {
        // Generate grammar lesson
        generatedLesson = await enhancedLessonService.generateGrammarLesson(
          lessonParams.conceptType || 'basic',
          lessonParams.difficulty,
          {
            includePractice: lessonParams.includePractice,
            includeComparison: lessonParams.includeComparison
          }
        );
      }
      else if (isMixedLesson) {
        // Generate mixed lesson
        const category = lessonParams.category || 'common_phrases';
        generatedLesson = await enhancedLessonService.generateMixedLesson(
          category,
          lessonParams.difficulty,
          {
            includePractice: lessonParams.includePractice,
            includeReview: lessonParams.includeReview
          }
        );
      }
      else {
        // Fallback to dynamic lesson
        const params = {
          type: lessonParams.type,
          difficulty: lessonParams.difficulty,
          criteria: {
            categories: lessonParams.category ? [lessonParams.category] : undefined,
            partOfSpeech: lessonParams.partOfSpeech,
            conceptType: lessonParams.conceptType,
            limit: lessonParams.limit
          },
          metadata: {
            includePractice: lessonParams.includePractice,
            includeComparison: lessonParams.includeComparison,
            includeReview: lessonParams.includeReview
          }
        };

        generatedLesson = await enhancedLessonService.generateDynamicLesson(params);
      }

      // Apply custom title and description if provided
      if (lessonParams.title) {
        generatedLesson.title = lessonParams.title;
      }

      if (lessonParams.description) {
        generatedLesson.description = lessonParams.description;
      }

      // Notify parent component
      onLessonGenerated(generatedLesson);

      // Show success message
      successMessage = t('lesson.generator.success_message');

      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (err) {
      handleError(err, 'Failed to generate lesson');
      error = err instanceof Error ? err.message : t('lesson.generator.errors.generation_failed');
      hasError = true;

      // Re-throw to allow parent components to handle the error
      throw err;
    } finally {
      isGenerating = false;
    }
  }

  function getLessonTypeName(type) {
    const typeNames = {
      'vocabulary': t('lesson.types.vocabulary'),
      'grammar': t('lesson.types.grammar'),
      'mixed': t('lesson.types.mixed'),
      'conversation': t('lesson.types.conversation'),
      'reading': t('lesson.types.reading'),
      'listening': t('lesson.types.listening'),
      'writing': t('lesson.types.writing'),
      'culture': t('lesson.types.culture'),
      'contextual': t('lesson.types.contextual')
    };
    return typeNames[type] || type;
  }

  function getCategoryDisplayName(category) {
    const displayNames = {
      'greetings': t('vocabulary.categories.greetings'),
      'numbers': t('vocabulary.categories.numbers'),
      'family': t('vocabulary.categories.family'),
      'food': t('vocabulary.categories.food'),
      'colors': t('vocabulary.categories.colors'),
      'animals': t('vocabulary.categories.animals'),
      'body': t('vocabulary.categories.body_parts'),
      'clothing': t('vocabulary.categories.clothing'),
      'house': t('vocabulary.categories.house_home'),
      'nature': t('vocabulary.categories.nature'),
      'transport': t('vocabulary.categories.transportation'),
      'technology': t('vocabulary.categories.technology'),
      'time': t('vocabulary.categories.time_date'),
      'weather': t('vocabulary.categories.weather'),
      'professions': t('vocabulary.categories.professions'),
      'places': t('vocabulary.categories.places'),
      'grammar': t('vocabulary.categories.grammar'),
      'culture': t('vocabulary.categories.culture'),
      'common_phrases': t('vocabulary.categories.common_phrases'),
      'uncategorized': t('vocabulary.categories.uncategorized')
    };

    return displayNames[category] || category;
  }

  function getPartOfSpeechDisplayName(partOfSpeech) {
    const displayNames = {
      'noun': t('vocabulary.parts_of_speech.nouns'),
      'verb': t('vocabulary.parts_of_speech.verbs'),
      'adjective': t('vocabulary.parts_of_speech.adjectives'),
      'adverb': t('vocabulary.parts_of_speech.adverbs'),
      'pronoun': t('vocabulary.parts_of_speech.pronouns'),
      'preposition': t('vocabulary.parts_of_speech.prepositions'),
      'conjunction': t('vocabulary.parts_of_speech.conjunctions'),
      'interjection': t('vocabulary.parts_of_speech.interjections'),
      'article': t('vocabulary.parts_of_speech.articles'),
      'number': t('vocabulary.parts_of_speech.numbers'),
      'phrase': t('vocabulary.parts_of_speech.phrases')
    };

    return displayNames[partOfSpeech] || partOfSpeech;
  }

  function getDifficultyLevels(): LessonDifficulty[] {
    return ['A1', 'A2', 'B1', 'B2', 'C1'];
  }

  function getVocabularyCategories(): VocabularyCategory[] {
    return [
      'greetings', 'numbers', 'family', 'food', 'colors', 'animals', 'body',
      'clothing', 'house', 'nature', 'transport', 'technology', 'time', 'weather',
      'professions', 'places', 'grammar', 'culture', 'common_phrases'
    ];
  }

  function getPartsOfSpeech(): PartOfSpeech[] {
    return ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'phrase'];
  }

  function getLessonTypes(): LessonType[] {
    return ['vocabulary', 'grammar', 'mixed', 'conversation', 'culture'];
  }
</script>

<Dialog open={isOpen} onclick={(e) => {
  try {
    if (!e.detail) closeModal();
  } catch (err) {
    handleError(err, 'Failed to close lesson generator modal');
    hasError = true;
  }
}}>
  <DialogContent class="lesson-generator-modal">
    <DialogHeader>
      <DialogTitle>{t('lesson.generator.title')}</DialogTitle>
      <DialogDescription>
        {t('lesson.generator.description')}
      </DialogDescription>
    </DialogHeader>

    <div class="lesson-generator-form">
      {#if hasError}
        <div class="error-message">
          ⚠️ {error}
          <button
            class="retry-button"
            onclick={() => {
              try {
                error = null;
                hasError = false;
              } catch (err) {
                handleError(err, 'Failed to clear error state');
              }
            }}
          >
            {t('common.try_again')}
          </button>
        </div>
      {/if}

      {#if successMessage}
        <div class="success-message">
          ✅ {successMessage}
        </div>
      {/if}

      <div class="form-section">
        <h3>{t('lesson.generator.basic_information')}</h3>

        <div class="form-group">
          <label for="lesson-title">{t('lesson.generator.lesson_title')}</label>
          <input
            id="lesson-title"
            type="text"
            bind:value={lessonParams.title}
            placeholder={t('lesson.generator.lesson_title_placeholder')}
          />
        </div>

        <div class="form-group">
          <label for="lesson-description">{t('lesson.generator.description')}</label>
          <textarea
            id="lesson-description"
            bind:value={lessonParams.description}
            placeholder={t('lesson.generator.description_placeholder')}
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="form-section">
        <h3>{t('lesson.generator.lesson_parameters')}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="lesson-type">{t('lesson.generator.lesson_type_required')}</label>
            <select id="lesson-type" bind:value={lessonParams.type}>
              <option value="">{t('lesson.generator.select_lesson_type')}</option>
              {#each getLessonTypes() as type}
                <option value={type}>{getLessonTypeName(type)}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="lesson-difficulty">{t('lesson.generator.difficulty_level_required')}</label>
            <select id="lesson-difficulty" bind:value={lessonParams.difficulty}>
              <option value="">{t('lesson.generator.select_difficulty')}</option>
              {#each getDifficultyLevels() as level}
                <option value={level}>{level}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if isVocabularyLesson || isMixedLesson}
          <div class="form-row">
            <div class="form-group">
              <label for="lesson-category">{t('lesson.generator.category')}</label>
              <select id="lesson-category" bind:value={lessonParams.category}>
                <option value="">{t('lesson.generator.any_category')}</option>
                {#each getVocabularyCategories() as category}
                  <option value={category}>{getCategoryDisplayName(category)}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="lesson-part-of-speech">{t('lesson.generator.part_of_speech')}</label>
              <select id="lesson-part-of-speech" bind:value={lessonParams.partOfSpeech}>
                <option value="">{t('lesson.generator.any_part_of_speech')}</option>
                {#each getPartsOfSpeech() as partOfSpeech}
                  <option value={partOfSpeech}>{getPartOfSpeechDisplayName(partOfSpeech)}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}

        {#if isGrammarLesson}
          <div class="form-group">
            <label for="lesson-concept-type">{t('lesson.generator.grammar_concept')}</label>
            <input
              id="lesson-concept-type"
              type="text"
              bind:value={lessonParams.conceptType}
              placeholder={t('lesson.generator.grammar_concept_placeholder')}
            />
          </div>
        {/if}

        <div class="form-group">
          <label for="lesson-limit">{t('lesson.generator.number_of_items')}</label>
          <select id="lesson-limit" bind:value={lessonParams.limit}>
            <option value="5">5 {t('lesson.generator.items')}</option>
            <option value="8">8 {t('lesson.generator.items')}</option>
            <option value="10" selected>10 {t('lesson.generator.items')}</option>
            <option value="15">15 {t('lesson.generator.items')}</option>
            <option value="20">20 {t('lesson.generator.items')}</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h3>{t('lesson.generator.options')}</h3>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" bind:checked={lessonParams.includePractice} />
              {t('lesson.generator.include_practice_exercises')}
            </label>
          </div>

          {#if isGrammarLesson}
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" bind:checked={lessonParams.includeComparison} />
                {t('lesson.generator.include_language_comparison')}
              </label>
            </div>
          {/if}

          {#if isVocabularyLesson || isMixedLesson}
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" bind:checked={lessonParams.includeReview} />
                {t('lesson.generator.include_review_section')}
              </label>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="secondary"
        onclick={() => {
          try {
            closeModal();
          } catch (err) {
            handleError(err, 'Failed to close modal');
            hasError = true;
          }
        }}
        disabled={isGenerating}
      >
        {t('common.cancel')}
      </Button>
      <Button
        variant="default"
        onclick={() => {
          try {
            generateLesson();
          } catch (err) {
            // Error is already handled in the generateLesson function
          }
        }}
        disabled={isGenerating}
      >
        {isGenerating ? t('lesson.generator.generating') : t('lesson.generator.generate_lesson')}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<style>

  .lesson-generator-form {
    padding: 1rem 0;
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .form-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .form-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 0.875rem;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-group input {
    width: auto;
  }

  .error-message {
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border-radius: 8px;
    color: #ef4444;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .success-message {
    padding: 0.75rem 1rem;
    background: #f0fdf4;
    border-radius: 8px;
    color: #10b981;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

  }
</style>