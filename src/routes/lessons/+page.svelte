<script lang="ts">
  /**
   * Lessons Page
   *
   * Displays available lessons and allows users to browse and start learning.
   * Uses the enhanced LessonService for comprehensive lesson generation and management.
   */

  import { z } from 'zod';
  import { page } from '$app/stores';
  import LessonCard from '$lib/components/LessonCard.svelte';
  import { lessonService } from '$lib/services/lesson';
  import { db } from '$lib/data/db.svelte';
  import { LessonSchema, type Lesson, type LessonDifficulty, type LessonType } from '$lib/schemas/lesson';
  import type { VocabularyCategory, PartOfSpeech } from '$lib/schemas/vocabulary';

  // State
  let lessons = $state<Lesson[]>([]);
  let filteredLessons = $state<Lesson[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedDifficulty = $state<LessonDifficulty | 'all'>('all');
  let selectedType = $state<string>('all');
  let showLessonGenerationModal = $state(false);
  let newLessonCriteria = $state<{
    difficulty?: LessonDifficulty;
    type?: LessonType;
    category?: VocabularyCategory;
    partOfSpeech?: PartOfSpeech;
    limit?: number;
    title?: string;
    description?: string;
  }>({
    limit: 10
  });

  // Computed
  $: filteredLessons = $derived(
    lessons.filter(lesson => {
      const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      const typeMatch = selectedType === 'all' || lesson.type === selectedType;
      return difficultyMatch && typeMatch;
    })
  );

  // Initialize lessons
  $: {
    loadLessons();
  }

  /**
   * Load lessons from service
   */
  async function loadLessons() {
    try {
      isLoading = true;
      error = null;

      // Initialize lesson service
      await lessonService.initialize();

      // Generate comprehensive lessons using the enhanced service
      const generatedLessons = await generateComprehensiveLessons();

      lessons = generatedLessons;

    } catch (err) {
      console.error('Failed to load lessons:', err);
      error = err instanceof Error ? err.message : 'Failed to load lessons';
    } finally {
      isLoading = false;
    }
  }

  /**
   * Generate comprehensive lessons using the enhanced LessonService
   */
  async function generateComprehensiveLessons(): Promise<Lesson[]> {
    const lessons: Lesson[] = [];
    const vocabularyStats = db.getVocabularyStatsByDifficulty();

    // Generate lessons by difficulty level
    const difficulties: LessonDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

    for (const difficulty of difficulties) {
      if (vocabularyStats[difficulty] >= 5) {
        // Generate 2-3 lessons per difficulty level
        const lessonCount = Math.min(3, Math.floor(vocabularyStats[difficulty] / 5));

        for (let i = 0; i < lessonCount; i++) {
          try {
            const lesson = await lessonService.generateLessonFromCriteria({
              difficulty,
              limit: 8,
              type: i === 0 ? 'vocabulary' : (i === 1 ? 'conversation' : 'mixed')
            });
            lessons.push(lesson);
          } catch (error) {
            console.error(`Failed to generate ${difficulty} lesson ${i + 1}:`, error);
          }
        }
      }
    }

    // Generate lessons by category
    const categories: VocabularyCategory[] = [
      'greetings', 'numbers', 'family', 'food', 'colors', 'animals', 'body', 'clothing'
    ];

    for (const category of categories) {
      try {
        const categoryItems = db.getVocabularyByCategory(category);
        if (categoryItems.length >= 5) {
          const lesson = await lessonService.generateLessonFromCriteria({
            categories: [category],
            limit: 8,
            type: 'vocabulary',
            title: `Category: ${category}`
          });
          lessons.push(lesson);
        }
      } catch (error) {
        console.error(`Failed to generate ${category} category lesson:`, error);
      }
    }

    // Generate lessons by part of speech
    const partsOfSpeech: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb'];

    for (const partOfSpeech of partsOfSpeech) {
      try {
        const posItems = db.getVocabularyByPartOfSpeech(partOfSpeech);
        if (posItems.length >= 5) {
          const lesson = await lessonService.generateLessonFromCriteria({
            partOfSpeech,
            limit: 8,
            type: 'vocabulary',
            title: `Grammar: ${partOfSpeech}s`
          });
          lessons.push(lesson);
        }
      } catch (error) {
        console.error(`Failed to generate ${partOfSpeech} lesson:`, error);
      }
    }

    // Generate mixed lessons if we have enough vocabulary
    if (db.getVocabularyCount() >= 15) {
      try {
        const lesson = await lessonService.generateLessonFromCriteria({
          limit: 10,
          type: 'mixed',
          title: 'Mixed: Everyday Conversations'
        });
        lessons.push(lesson);
      } catch (error) {
        console.error('Failed to generate mixed lesson:', error);
      }
    }

    // If no lessons were generated, create fallback lessons
    if (lessons.length === 0 && db.getVocabularyCount() > 0) {
      console.warn('No lessons generated, creating fallback lessons');
      const fallbackLessons = generateFallbackLessons();
      lessons.push(...fallbackLessons);
    }

    return lessons;
  }

  /**
   * Generate fallback lessons when automatic generation fails
   */
  function generateFallbackLessons(): Lesson[] {
    const lessons: Lesson[] = [];
    const vocabularyData = db.getVocabulary();

    if (vocabularyData.length >= 5) {
      // Group vocabulary by difficulty
      const byDifficulty: Record<LessonDifficulty, VocabularyItem[]> = {
        A1: [],
        A2: [],
        B1: [],
        B2: [],
        C1: []
      };

      vocabularyData.forEach(item => {
        if (item.difficulty <= 1.5) byDifficulty.A1.push(item);
        else if (item.difficulty <= 2.5) byDifficulty.A2.push(item);
        else if (item.difficulty <= 3.5) byDifficulty.B1.push(item);
        else if (item.difficulty <= 4.5) byDifficulty.B2.push(item);
        else byDifficulty.C1.push(item);
      });

      // Create simple fallback lessons
      for (const [difficulty, items] of Object.entries(byDifficulty)) {
        if (items.length >= 5) {
          const lesson = lessonService.generateLessonFromVocabulary(
            items.slice(0, 8),
            {
              title: `${difficulty}: Basic Vocabulary`,
              difficulty: difficulty as LessonDifficulty,
              type: 'vocabulary'
            }
          );
          lessons.push(lesson);
        }
      }
    }

    return lessons;
  }

  /**
   * Generate a new custom lesson based on user criteria
   */
  async function generateCustomLesson() {
    try {
      const lesson = await lessonService.generateLessonFromCriteria({
        difficulty: newLessonCriteria.difficulty,
        type: newLessonCriteria.type,
        categories: newLessonCriteria.category ? [newLessonCriteria.category] : undefined,
        partOfSpeech: newLessonCriteria.partOfSpeech,
        limit: newLessonCriteria.limit,
        title: newLessonCriteria.title,
        description: newLessonCriteria.description
      });

      lessons.push(lesson);
      showLessonGenerationModal = false;
      newLessonCriteria = { limit: 10 };

    } catch (error) {
      console.error('Failed to generate custom lesson:', error);
      alert('Failed to generate lesson. Please try again.');
    }
  }

  /**
   * Get available lesson types
   */
  function getLessonTypes(): string[] {
    const types = new Set<string>();
    lessons.forEach(lesson => types.add(lesson.type));
    return ['all', ...Array.from(types)];
  }

  /**
   * Get difficulty levels
   */
  function getDifficultyLevels(): LessonDifficulty[] {
    return ['A1', 'A2', 'B1', 'B2', 'C1'];
  }

  /**
   * Get vocabulary categories for lesson generation
   */
  function getVocabularyCategories(): VocabularyCategory[] {
    return [
      'greetings', 'numbers', 'family', 'food', 'colors', 'animals', 'body',
      'clothing', 'house', 'nature', 'transport', 'technology', 'time', 'weather',
      'professions', 'places', 'grammar', 'culture', 'common_phrases'
    ];
  }

  /**
   * Get parts of speech for lesson generation
   */
  function getPartsOfSpeech(): PartOfSpeech[] {
    return ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'phrase'];
  }

  /**
   * Get lesson type display name
   */
  function getLessonTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'vocabulary': 'Vocabulary',
      'grammar': 'Grammar',
      'conversation': 'Conversation',
      'reading': 'Reading',
      'listening': 'Listening',
      'writing': 'Writing',
      'culture': 'Culture',
      'mixed': 'Mixed'
    };
    return typeNames[type] || type;
  }

  /**
   * Get category display name
   */
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

  /**
   * Get part of speech display name
   */
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
</script>

<div class="lessons-page">
  <header class="lessons-header">
    <h1>Lessons</h1>
    <p class="subtitle">Structured learning experiences for Bulgarian and German</p>
    <button class="create-lesson-button" on:click={() => showLessonGenerationModal = true}>
      ✨ Create Custom Lesson
    </button>
  </header>

  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading lessons...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{error}</p>
      <button class="retry-button" on:click={loadLessons}>Retry</button>
    </div>
  {:else if lessons.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📚</div>
      <p>No lessons available. Create your first custom lesson!</p>
      <button class="create-lesson-button" on:click={() => showLessonGenerationModal = true}>
        Create Your First Lesson
      </button>
    </div>
  {:else}
    <div class="lessons-filters">
      <div class="filter-group">
        <label for="difficulty-filter">Difficulty</label>
        <select id="difficulty-filter" bind:value={selectedDifficulty}>
          <option value="all">All Levels</option>
          {#each getDifficultyLevels() as level}
            <option value={level}>{level}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label for="type-filter">Type</label>
        <select id="type-filter" bind:value={selectedType}>
          <option value="all">All Types</option>
          {#each getLessonTypes() as type}
            <option value={type}>{getLessonTypeName(type)}</option>
          {/each}
        </select>
      </div>

      <button class="create-lesson-button mobile" on:click={() => showLessonGenerationModal = true}>
        ✨ Create Lesson
      </button>
    </div>

    <div class="lessons-grid">
      {#each filteredLessons as lesson (lesson.id)}
        <div class="lesson-card-wrapper">
          <LessonCard {lesson} />
        </div>
      {/each}
    </div>

    <div class="lessons-summary">
      <p>
        Showing {filteredLessons.length} of {lessons.length} lessons
        {#if selectedDifficulty !== 'all' || selectedType !== 'all'}
          • <button class="reset-filters" on:click={() => { selectedDifficulty = 'all'; selectedType = 'all'; }}>Reset filters</button>
        {/if}
      </p>
    </div>
  {/if}

  <!-- Lesson Generation Modal -->
  {#if showLessonGenerationModal}
    <div class="modal-overlay" on:click={() => showLessonGenerationModal = false}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
          <h2>Create Custom Lesson</h2>
          <button class="close-button" on:click={() => showLessonGenerationModal = false}>
            ×
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="lesson-title">Lesson Title</label>
            <input
              id="lesson-title"
              type="text"
              bind:value={newLessonCriteria.title}
              placeholder="e.g., 'Daily Conversations'"
            />
          </div>

          <div class="form-group">
            <label for="lesson-description">Description (Optional)</label>
            <textarea
              id="lesson-description"
              bind:value={newLessonCriteria.description}
              placeholder="Describe what this lesson will cover..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="lesson-difficulty">Difficulty Level</label>
              <select id="lesson-difficulty" bind:value={newLessonCriteria.difficulty}>
                <option value="">Any Difficulty</option>
                {#each getDifficultyLevels() as level}
                  <option value={level}>{level}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="lesson-type">Lesson Type</label>
              <select id="lesson-type" bind:value={newLessonCriteria.type}>
                <option value="">Any Type</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="conversation">Conversation</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="culture">Culture</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="lesson-category">Category</label>
              <select id="lesson-category" bind:value={newLessonCriteria.category}>
                <option value="">Any Category</option>
                {#each getVocabularyCategories() as category}
                  <option value={category}>{getCategoryDisplayName(category)}</option>
                {/each}
              </select>
            </div>

            <div class="form-group">
              <label for="lesson-part-of-speech">Part of Speech</label>
              <select id="lesson-part-of-speech" bind:value={newLessonCriteria.partOfSpeech}>
                <option value="">Any Part of Speech</option>
                {#each getPartsOfSpeech() as partOfSpeech}
                  <option value={partOfSpeech}>{getPartOfSpeechDisplayName(partOfSpeech)}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="lesson-limit">Number of Vocabulary Items</label>
            <select id="lesson-limit" bind:value={newLessonCriteria.limit}>
              <option value="5">5 items</option>
              <option value="8">8 items</option>
              <option value="10" selected>10 items</option>
              <option value="15">15 items</option>
              <option value="20">20 items</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" on:click={() => showLessonGenerationModal = false}>
            Cancel
          </button>
          <button class="generate-button" on:click={generateCustomLesson}>
            Generate Lesson
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .lessons-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .lessons-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .lessons-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #64748b;
    font-size: 1rem;
  }

  .lessons-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
    justify-content: center;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }

  select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 0.875rem;
    cursor: pointer;
    min-width: 150px;
  }

  .lessons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .lesson-card-wrapper {
    height: 500px;
  }

  .loading-state, .error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .error-icon, .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-state p {
    color: #ef4444;
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }

  .empty-state p {
    color: #64748b;
    font-size: 1.125rem;
  }

  .retry-button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .lessons-summary {
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
  }

  .reset-filters {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    font-size: 0.875rem;
  }

  /* Button Styles */
  .create-lesson-button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .create-lesson-button:hover {
    background: #2563eb;
  }

  .create-lesson-button.mobile {
    display: none;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #64748b;
    padding: 0.5rem;
  }

  .close-button:hover {
    color: #1e293b;
  }

  .modal-body {
    padding: 1.5rem;
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
    margin-bottom: 1rem;
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

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .cancel-button {
    padding: 0.5rem 1rem;
    background: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s ease;
  }

  .cancel-button:hover {
    background: #d1d5db;
  }

  .generate-button {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s ease;
  }

  .generate-button:hover {
    background: #059669;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .lessons-page {
      padding: 1rem;
    }

    .lessons-grid {
      grid-template-columns: 1fr;
    }

    .lessons-filters {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-group {
      align-items: stretch;
    }

    select {
      min-width: 100%;
    }
  }
</style>