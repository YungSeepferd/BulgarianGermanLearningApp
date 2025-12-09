<script lang="ts">
  /**
   * LessonGenerator Component
   *
   * Provides a comprehensive interface for generating dynamic lessons with advanced parameters.
   * Supports all lesson types (vocabulary, grammar, mixed) with detailed customization options.
   */

  import { z } from 'zod';
  import { enhancedLessonService } from '$lib/services/enhanced-lesson';
  import { LessonSchema, type Lesson, type LessonDifficulty, type LessonType } from '$lib/schemas/lesson';
  import type { VocabularyCategory, PartOfSpeech } from '$lib/schemas/vocabulary';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';

  // Props
  let { isOpen = false, onClose = () => {}, onLessonGenerated = () => {} } = $props<{
    isOpen: boolean;
    onClose?: () => void;
    onLessonGenerated?: (lesson: Lesson) => void;
  }>();

  // State
  let isGenerating = $state(false);
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

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
  $: isVocabularyLesson = $derived(lessonParams.type === 'vocabulary');
  $: isGrammarLesson = $derived(lessonParams.type === 'grammar');
  $: isMixedLesson = $derived(lessonParams.type === 'mixed');

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

  async function generateLesson() {
    try {
      isGenerating = true;
      error = null;
      successMessage = null;

      // Validate required fields
      if (!lessonParams.type) {
        error = 'Please select a lesson type';
        return;
      }

      if (!lessonParams.difficulty) {
        error = 'Please select a difficulty level';
        return;
      }

      // Generate appropriate lesson based on type
      let generatedLesson: Lesson;

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
          type: lessonParams.type as LessonType,
          difficulty: lessonParams.difficulty as LessonDifficulty,
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
      successMessage = 'Lesson generated successfully!';

      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (err) {
      console.error('Failed to generate lesson:', err);
      error = err instanceof Error ? err.message : 'Failed to generate lesson. Please try again.';
    } finally {
      isGenerating = false;
    }
  }

  function getLessonTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'vocabulary': 'Vocabulary',
      'grammar': 'Grammar',
      'mixed': 'Mixed',
      'conversation': 'Conversation',
      'reading': 'Reading',
      'listening': 'Listening',
      'writing': 'Writing',
      'culture': 'Culture',
      'contextual': 'Contextual'
    };
    return typeNames[type] || type;
  }

  function getCategoryDisplayName(category: VocabularyCategory): string {
    const displayNames: Record<VocabularyCategory, string> = {
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

  function getPartOfSpeechDisplayName(partOfSpeech: PartOfSpeech): string {
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
      'phrase': 'Phrases'
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

<Dialog open={isOpen} on:openChange={(e) => !e.detail && closeModal()}>
  <DialogContent class="lesson-generator-modal">
    <DialogHeader>
      <DialogTitle>Generate Dynamic Lesson</DialogTitle>
      <DialogDescription>
        Create personalized lessons with advanced customization options
      </DialogDescription>
    </DialogHeader>

    <div class="lesson-generator-form">
      {#if error}
        <div class="error-message">
          ⚠️ {error}
        </div>
      {/if}

      {#if successMessage}
        <div class="success-message">
          ✅ {successMessage}
        </div>
      {/if}

      <div class="form-section">
        <h3>Basic Information</h3>

        <div class="form-group">
          <label for="lesson-title">Lesson Title (Optional)</label>
          <input
            id="lesson-title"
            type="text"
            bind:value={lessonParams.title}
            placeholder="e.g., 'Daily Conversations'"
          />
        </div>

        <div class="form-group">
          <label for="lesson-description">Description (Optional)</label>
          <textarea
            id="lesson-description"
            bind:value={lessonParams.description}
            placeholder="Describe what this lesson will cover..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <div class="form-section">
        <h3>Lesson Parameters</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="lesson-type">Lesson Type *</label>
            <select id="lesson-type" bind:value={lessonParams.type}>
              <option value="">Select Lesson Type</option>
              {#each getLessonTypes() as type}
                <option value={type}>{getLessonTypeName(type)}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="lesson-difficulty">Difficulty Level *</label>
            <select id="lesson-difficulty" bind:value={lessonParams.difficulty}>
              <option value="">Select Difficulty</option>
              {#each getDifficultyLevels() as level}
                <option value={level}>{level}</option>
              {/each}
            </select>
          </div>
        </div>

        {#if isVocabularyLesson || isMixedLesson}
          <div class="form-row">
            <div class="form-group">
              <label for="lesson-category">Category</label>
              <select id="lesson-category" bind:value={lessonParams.category}>
                <option value="">Any Category</option>
                {#each getVocabularyCategories() as category}
                  <option value={category}>{getCategoryDisplayName(category)}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="lesson-part-of-speech">Part of Speech</label>
              <select id="lesson-part-of-speech" bind:value={lessonParams.partOfSpeech}>
                <option value="">Any Part of Speech</option>
                {#each getPartsOfSpeech() as partOfSpeech}
                  <option value={partOfSpeech}>{getPartOfSpeechDisplayName(partOfSpeech)}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}

        {#if isGrammarLesson}
          <div class="form-group">
            <label for="lesson-concept-type">Grammar Concept</label>
            <input
              id="lesson-concept-type"
              type="text"
              bind:value={lessonParams.conceptType}
              placeholder="e.g., 'verb_conjugation', 'noun_declension', 'articles'"
            />
          </div>
        {/if}

        <div class="form-group">
          <label for="lesson-limit">Number of Items</label>
          <select id="lesson-limit" bind:value={lessonParams.limit}>
            <option value="5">5 items</option>
            <option value="8">8 items</option>
            <option value="10" selected>10 items</option>
            <option value="15">15 items</option>
            <option value="20">20 items</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h3>Options</h3>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" bind:checked={lessonParams.includePractice} />
              Include Practice Exercises
            </label>
          </div>

          {#if isGrammarLesson}
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" bind:checked={lessonParams.includeComparison} />
                Include Language Comparison
              </label>
            </div>
          {/if}

          {#if isVocabularyLesson || isMixedLesson}
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" bind:checked={lessonParams.includeReview} />
                Include Review Section
              </label>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="secondary" on:click={closeModal} disabled={isGenerating}>
        Cancel
      </Button>
      <Button
        variant="default"
        on:click={generateLesson}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Lesson'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<style>
  .lesson-generator-modal {
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
  }

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

    .lesson-generator-modal {
      max-width: 95vw;
    }
  }
</style>