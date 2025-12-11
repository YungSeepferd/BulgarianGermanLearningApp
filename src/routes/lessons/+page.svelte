<script lang="ts">
  /**
   * Lessons Page
   *
   * Displays available lessons and allows users to browse and start learning.
   * Uses the enhanced LessonService for comprehensive lesson generation and management.
   */

  import LessonCard from '$lib/components/LessonCard.svelte';
  import GeneratedLesson from '$lib/components/GeneratedLesson.svelte';
  import LessonGenerator from '$lib/components/LessonGenerator.svelte';
  import { enhancedLessonService } from '$lib/services/enhanced-lesson';
  import { lessonService } from '$lib/services/lesson';  import LessonCard from '$lib/components/LessonCard.svelte';  import { vocabularyDb as db } from '$lib/data/db.svelte';
  import { vocabularyDb as db } from '$lib/data/db.svelte';
  import type { VocabularyCategory, PartOfSpeech } from '$lib/schemas/vocabulary';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  // State
  let lessons = $state<Lesson[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let selectedDifficulty = $state<LessonDifficulty | 'all'>('all');
  let selectedType = $state<string>('all');
  let showLessonGenerationModal = $state(false);
  let showGeneratedLesson = $state<Lesson | null>(null);
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
  let filteredLessons = $derived(
    lessons.filter(lesson => {
      const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      const typeMatch = selectedType === 'all' || lesson.type === selectedType;
      return difficultyMatch && typeMatch;
    })
  );

  // Initialize lessons
  $effect(() => {
    loadLessons();
  });

  /**
   * Load lessons from service
   */
  async function loadLessons() {
    try {
      isLoading = true;
      error = null;

      // Initialize enhanced lesson service
      await enhancedLessonService.initialize();

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
   * Handle generated lesson
   */
  function handleLessonGenerated(lesson: Lesson) {
    lessons.push(lesson);
    showGeneratedLesson = lesson;
    showLessonGenerationModal = false;
  }

  /**
   * Close generated lesson view
   */
  function closeGeneratedLesson() {
    showGeneratedLesson = null;
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
    <button class="create-lesson-button" onclick={() => showLessonGenerationModal = true}>
      ✨ Create Dynamic Lesson
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
      <button class="retry-button" onclick={loadLessons}>Retry</button>
    </div>
  {:else if lessons.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📚</div>
      <p>No lessons available. Create your first custom lesson!</p>
      <button class="create-lesson-button" onclick={() => showLessonGenerationModal = true}>
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

      <button class="create-lesson-button mobile" onclick={() => showLessonGenerationModal = true}>
        ✨ Create Lesson
      </button>
    </div>

    {#if showGeneratedLesson}
      <GeneratedLesson lesson={showGeneratedLesson} />
      <div class="back-to-lessons">
        <button class="back-button" onclick={closeGeneratedLesson}>
          ← Back to All Lessons
        </button>
      </div>
    {:else}
      <div class="lessons-grid">
        {#each filteredLessons as lesson (lesson.id)}
          <div class="lesson-card-wrapper">
            <LessonCard {lesson} />
          </div>
        {/each}
      </div>
    {/if}

    <div class="lessons-summary">
      <p>
        Showing {filteredLessons.length} of {lessons.length} lessons
        {#if selectedDifficulty !== 'all' || selectedType !== 'all'}
          • <button class="reset-filters" onclick={() => { selectedDifficulty = 'all'; selectedType = 'all'; }}>Reset filters</button>
        {/if}
      </p>
    </div>
  {/if}

  <!-- Lesson Generator Component -->
  <LessonGenerator
    isOpen={showLessonGenerationModal}
    onClose={() => showLessonGenerationModal = false}
    onLessonGenerated={handleLessonGenerated}
  />
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


  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .back-to-lessons {
    text-align: center;
    margin: 2rem 0;
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
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