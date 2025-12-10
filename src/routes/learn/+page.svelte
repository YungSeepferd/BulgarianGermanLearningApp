<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { lessonService } from '$lib/services/lesson.svelte';
  import { lessonGenerationEngine } from '$lib/services/lesson-generation/lesson-generator';
  import { learningSession } from '$lib/state/session.svelte';
  import { fireConfetti } from '$lib/utils/confetti';
  import GeneratedLesson from '$lib/components/GeneratedLesson.svelte';
  import LessonCard from '$lib/components/LessonCard.svelte';
  import LevelUp from '$lib/components/gamification/LevelUp.svelte';
  import type { Lesson, LessonDifficulty, LessonType } from '$lib/schemas/lesson';
  import type { GeneratedLesson as GeneratedLessonType } from '$lib/services/lesson-generation/types';

  // State
  let lessons = $state<Lesson[]>([]);
  let generatedLesson = $state<GeneratedLessonType | null>(null);
  let selectedLesson = $state<Lesson | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let showLessonSelection = $state(true);
  let difficultyFilter = $state<LessonDifficulty | 'all'>('all');
  let typeFilter = $state<LessonType | 'all'>('all');

  // Difficulty levels
  const difficultyLevels: LessonDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const lessonTypes: LessonType[] = ['vocabulary', 'grammar', 'conversation', 'mixed'];

  onMount(async () => {
    console.log('Mounting learn page - directly generating lesson...');
    try {
      // Directly generate a lesson for testing
      await generateDynamicLesson();
      console.log('Lesson generated successfully:', generatedLesson);
    } catch (err) {
      console.error('Error generating lesson:', err);
      error = "Failed to generate lesson. Please try again.";
    }
  });

  async function loadLessons() {
    try {
      isLoading = true;
      error = null;

      // Initialize lesson service
      await lessonService.initialize();

      // Generate some sample lessons
      await generateSampleLessons();

      // Load existing lessons
      lessons = lessonService.getLessons();
      console.log('Loaded lessons:', lessons);

      if (lessons.length === 0) {
        // If no lessons, generate some default ones
        await generateDefaultLessons();
        lessons = lessonService.getLessons();
      }

      // Filter out lessons with empty or invalid vocabulary to prevent rendering errors
      lessons = lessons.filter(lesson => {
        if (!lesson.vocabulary || lesson.vocabulary.length === 0) {
          console.warn('Lesson with empty vocabulary filtered out:', lesson.title);
          return false;
        }

        // Check if vocabulary items are valid
        const hasValidVocabulary = lesson.vocabulary.every(vocab =>
          vocab && (typeof vocab === 'string' || (vocab.german && vocab.bulgarian))
        );

        if (!hasValidVocabulary) {
          console.warn('Lesson with invalid vocabulary filtered out:', lesson.title, lesson.vocabulary);
        }

        return hasValidVocabulary;
      });

    } catch (err) {
      console.error('Failed to load lessons:', err);
      error = "Failed to load lessons. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  async function generateSampleLessons() {
    try {
      // Generate a few sample lessons
      const sampleLessons = [
        await lessonService.generateLessonFromCriteria({
          difficulty: 'A1',
          type: 'vocabulary',
          categories: ['greetings'],
          limit: 5
        }),
        await lessonService.generateLessonFromCriteria({
          difficulty: 'A2',
          type: 'vocabulary',
          categories: ['food'],
          limit: 8
        }),
        await lessonService.generateLessonFromCriteria({
          difficulty: 'B1',
          type: 'grammar',
          limit: 6
        })
      ];

      // Add generated lessons to service
      sampleLessons.forEach(lesson => {
        if (lesson && lesson.vocabulary && lesson.vocabulary.length > 0) {
          lessonService.addLesson(lesson);
        }
      });
    } catch (err) {
      console.error('Failed to generate sample lessons:', err);
    }
  }

  async function generateDefaultLessons() {
    try {
      // Generate default lessons for different difficulty levels
      const defaultLessons = [
        await lessonService.generateLessonFromCriteria({
          difficulty: 'A1',
          type: 'vocabulary',
          categories: ['greetings', 'numbers'],
          limit: 6,
          title: 'Beginner Vocabulary',
          description: 'Learn essential greetings and numbers for beginners'
        }),
        await lessonService.generateLessonFromCriteria({
          difficulty: 'A2',
          type: 'vocabulary',
          categories: ['food', 'family'],
          limit: 8,
          title: 'Everyday Vocabulary',
          description: 'Learn words for food and family members'
        }),
        await lessonService.generateLessonFromCriteria({
          difficulty: 'B1',
          type: 'grammar',
          limit: 5,
          title: 'Basic Grammar',
          description: 'Learn essential grammar concepts for intermediate learners'
        }),
        await lessonService.generateLessonFromCriteria({
          difficulty: 'B2',
          type: 'mixed',
          categories: ['travel'],
          limit: 10,
          title: 'Travel Phrases',
          description: 'Learn vocabulary and grammar for travel situations'
        })
      ];

      // Add generated lessons to service
      defaultLessons.forEach(lesson => {
        if (lesson && lesson.vocabulary && lesson.vocabulary.length > 0) {
          lessonService.addLesson(lesson);
        }
      });
    } catch (err) {
      console.error('Failed to generate default lessons:', err);
    }
  }

  async function generateDynamicLesson() {
    try {
      isLoading = true;
      error = null;

      // Generate a dynamic lesson based on filters
      const lesson = await lessonGenerationEngine.generateLesson({
        type: typeFilter === 'all' ? 'vocabulary' : typeFilter,
        difficulty: difficultyFilter === 'all' ? 'A1' : difficultyFilter,
        criteria: {
          categories: typeFilter === 'vocabulary' || typeFilter === 'mixed' ? ['common_phrases'] : undefined,
          partOfSpeech: undefined,
          limit: 8
        },
        metadata: {
          includePractice: true,
          includeReview: false
        }
      });

      generatedLesson = lesson;
      showLessonSelection = false;
    } catch (err) {
      console.error('Failed to generate dynamic lesson:', err);
      error = "Failed to generate lesson. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  function startLesson(lesson: Lesson) {
    selectedLesson = lesson;
    showLessonSelection = false;
  }

  function backToSelection() {
    selectedLesson = null;
    generatedLesson = null;
    showLessonSelection = true;
  }

  function getDifficultyColor(difficulty: LessonDifficulty): string {
    const colors: Record<LessonDifficulty, string> = {
      'A1': 'bg-green-100 text-green-800 border-green-300',
      'A2': 'bg-green-200 text-green-900 border-green-400',
      'B1': 'bg-blue-100 text-blue-800 border-blue-300',
      'B2': 'bg-blue-200 text-blue-900 border-blue-400',
      'C1': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  /**
   * Convert GeneratedLessonType to Lesson type for compatibility with GeneratedLesson component
   */
  function convertGeneratedLessonToLesson(generatedLesson: GeneratedLessonType): Lesson {
    // Convert vocabulary items to ensure they have the correct structure
    const convertedVocabulary = generatedLesson.vocabulary.map(vocab => {
      if (typeof vocab === 'string') {
        // If vocabulary is a string ID, create a minimal object structure
        return {
          id: vocab,
          german: vocab.split('-')[0] || vocab,
          bulgarian: vocab.split('-')[1] || vocab,
          partOfSpeech: 'noun',
          difficulty: 1,
          categories: ['uncategorized']
        };
      } else if (vocab && typeof vocab === 'object') {
        // If vocabulary is already an object, ensure it has all required properties
        return {
          id: vocab.id || `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          german: vocab.german || vocab.bulgarian || 'Unknown',
          bulgarian: vocab.bulgarian || vocab.german || 'Unknown',
          partOfSpeech: vocab.partOfSpeech || 'noun',
          difficulty: vocab.difficulty || 1,
          categories: vocab.categories || ['uncategorized']
        };
      } else {
        // Fallback for invalid vocabulary items
        return {
          id: `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          german: 'Unknown',
          bulgarian: 'Unknown',
          partOfSpeech: 'noun',
          difficulty: 1,
          categories: ['uncategorized']
        };
      }
    });

    // Convert sections to the format expected by Lesson schema
    const sections = generatedLesson.sections.map(section => ({
      id: section.id || crypto.randomUUID(),
      title: section.title,
      content: section.content,
      type: section.type,
      metadata: section.metadata || {}
    }));

    // Handle cases where learningObjectives might not exist
    const objectives = generatedLesson.learningObjectives
      ? generatedLesson.learningObjectives.map((obj, index) => ({
          id: `obj-${index}-${Date.now()}`,
          description: obj,
          isCompleted: false,
          createdAt: new Date()
        }))
      : [{
          id: `obj-${Date.now()}`,
          description: 'Learn new vocabulary',
          isCompleted: false,
          createdAt: new Date()
        }];

    return {
      id: generatedLesson.id,
      title: generatedLesson.title || 'Generated Lesson',
      description: generatedLesson.sections.map(s => s.content).join('\n\n') || generatedLesson.title || 'Generated lesson content',
      difficulty: generatedLesson.difficulty || 'A1',
      type: generatedLesson.type || 'vocabulary',
      duration: Math.max(15, generatedLesson.sections.length * 5), // Estimate duration
      vocabulary: convertedVocabulary,
      objectives: objectives,
      sections: sections, // This is the key fix - include sections in the correct format
      content: generatedLesson.sections.map(s => s.content).join('\n\n'),
      isCompleted: false,
      completionPercentage: 0,
      createdAt: generatedLesson.createdAt || new Date(),
      updatedAt: generatedLesson.updatedAt || new Date(),
      metadata: generatedLesson.metadata || {}
    };
  }

  function getLessonTypeIcon(type: LessonType): string {
    const icons: Record<LessonType, string> = {
      'vocabulary': '📚',
      'grammar': '📖',
      'conversation': '💬',
      'reading': '📄',
      'listening': '🔊',
      'writing': '✍️',
      'culture': '🏛️',
      'mixed': '🎯'
    };
    return icons[type] || '📚';
  }
</script>

<div class="learn-page">
  <LevelUp />

  <!-- Header -->
  <header class="header">
    <a href="/" class="back-link" aria-label="Back to Dashboard">←</a>
    <h1 class="page-title">Learn Bulgarian</h1>
    <div class="streak" title="Current Streak">
      <span class="fire">🔥</span>
      <span class="count">{learningSession.currentStreak}</span>
    </div>
  </header>

  <main class="main-content">
    {#if isLoading}
      <div class="loading-state" in:fade>
        <div class="spinner"></div>
        <p>Loading lessons...</p>
      </div>
    {:else if error}
      <div class="error-state" in:fade>
        <p>{error}</p>
        <button class="btn-primary" onclick={loadLessons}>Try Again</button>
        <a href="/" class="btn-secondary">Go Home</a>
      </div>
    {:else if showLessonSelection}
      <!-- Lesson Selection -->
      <div class="lesson-selection-container">
        <div class="filters">
          <div class="filter-group">
            <label for="difficulty-filter">Difficulty</label>
            <select id="difficulty-filter" bind:value={difficultyFilter} class="filter-select">
              <option value="all">All Difficulties</option>
              {#each difficultyLevels as level}
                <option value={level}>{level}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label for="type-filter">Lesson Type</label>
            <select id="type-filter" bind:value={typeFilter} class="filter-select">
              <option value="all">All Types</option>
              {#each lessonTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>

          <button class="generate-btn" onclick={generateDynamicLesson}>
            Generate Custom Lesson
          </button>
        </div>

        <div class="lessons-grid">
          {#each lessons as lesson}
            <div class="lesson-card-wrapper" in:fly={{ y: 20, delay: 100 * lessons.indexOf(lesson) }}>
              <LessonCard
                lesson={lesson}
                onStart={() => startLesson(lesson)}
              />
            </div>
          {/each}
        </div>
      </div>
    {:else if selectedLesson}
      <!-- Lesson View -->
      <div class="lesson-view-container" in:fade>
        <div class="lesson-header">
          <button class="back-button" onclick={backToSelection} aria-label="Back to lessons">
            ← Back to Lessons
          </button>
          <h2 class="lesson-title">{selectedLesson.title}</h2>
          <div class="lesson-meta">
            <span class="lesson-badge {getDifficultyColor(selectedLesson.difficulty)}">
              {selectedLesson.difficulty} • {selectedLesson.duration} min
            </span>
            <span class="lesson-type" aria-label={`Lesson type: ${selectedLesson.type}`}>
              {getLessonTypeIcon(selectedLesson.type)}
            </span>
          </div>
        </div>

        <div class="lesson-content">
          <p class="lesson-description">{selectedLesson.description}</p>

          <div class="lesson-vocabulary-preview">
            <h3>Vocabulary ({selectedLesson.vocabulary.length})</h3>
            <div class="vocabulary-tags">
              {#each selectedLesson.vocabulary.slice(0, 5) as vocab}
                <span class="vocabulary-tag" title={vocab?.german || 'Unknown'}>
                  {vocab?.german || 'Unknown'}
                </span>
              {/each}
              {#if selectedLesson.vocabulary.length > 5}
                <span class="vocabulary-tag more">+{selectedLesson.vocabulary.length - 5}</span>
              {/if}
            </div>
          </div>

          <div class="lesson-actions">
            <button class="btn-primary" onclick={() => alert('Lesson started!')}>
              Start Lesson
            </button>
            <button class="btn-secondary" onclick={backToSelection}>
              Choose Another Lesson
            </button>
          </div>
        </div>
      </div>
    {:else if generatedLesson}
      <!-- Generated Lesson View -->
      <div class="generated-lesson-container" in:fade>
        <div class="lesson-header">
          <button class="back-button" onclick={backToSelection} aria-label="Back to lessons">
            ← Back to Lessons
          </button>
          <h2 class="lesson-title">{generatedLesson.title}</h2>
          <div class="lesson-meta">
            <span class="lesson-badge {getDifficultyColor(generatedLesson.difficulty)}">
              {generatedLesson.difficulty} • {generatedLesson.sections.length} sections
            </span>
            <span class="lesson-type" aria-label={`Lesson type: ${generatedLesson.type}`}>
              {getLessonTypeIcon(generatedLesson.type)}
            </span>
          </div>
        </div>

        <GeneratedLesson lesson={generatedLesson ? convertGeneratedLessonToLesson(generatedLesson) : null} />

        <div class="lesson-actions">
          <button class="btn-primary" onclick={() => {
            // Award XP for completing the lesson
            learningSession.awardXP(100);
            fireConfetti();
            alert('Great job! You earned 100 XP for completing this lesson!');
          }}>
            Complete Lesson
          </button>
          <button class="btn-secondary" onclick={backToSelection}>
            Choose Another Lesson
          </button>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  /* Standard Button Styles */
  .button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
  }

  .button-primary {
    background: #3b82f6;
    color: white;
  }

  .button-primary:hover {
    background: #2563eb;
  }

  .button-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .button-secondary:hover {
    background: #e2e8f0;
  }

  .button:active {
    transform: scale(0.98);
  }

  .learn-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-link {
    text-decoration: none;
    font-size: 1.5rem;
    color: #64748b;
    line-height: 1;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    flex: 1;
    text-align: center;
  }

  .streak {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    color: #ea580c;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* Loading State */
  .loading-state, .error-state {
    text-align: center;
    color: #64748b;
    padding: 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Filters */
  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: flex-end;
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

  .filter-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: white;
    min-width: 150px;
  }

  .generate-btn {
    padding: 0.5rem 1rem;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin-left: auto;
  }

  .generate-btn:hover {
    background-color: #059669;
  }

  /* Lessons Grid */
  .lessons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .lesson-card-wrapper {
    transition: transform 0.2s ease;
  }

  .lesson-card-wrapper:hover {
    transform: translateY(-4px);
  }

  /* Lesson View */
  .lesson-view-container {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .lesson-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1rem;
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #475569;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lesson-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    flex: 1;
  }

  .lesson-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lesson-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid;
    display: inline-block;
  }

  .lesson-type {
    font-size: 1.25rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
  }

  .lesson-description {
    color: #64748b;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .lesson-vocabulary-preview {
    margin-bottom: 1.5rem;
  }

  .lesson-vocabulary-preview h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
  }

  .vocabulary-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .vocabulary-tag {
    padding: 0.25rem 0.75rem;
    background: #f1f5f9;
    border-radius: 20px;
    font-size: 0.875rem;
    color: #475569;
    border: 1px solid #e2e8f0;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .vocabulary-tag.more {
    background: #e2e8f0;
  }

  .lesson-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  /* Generated Lesson Container */
  .generated-lesson-container {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  /* Buttons */
  .btn-primary, .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: transform 0.1s ease;
    flex: 1;
    max-width: 200px;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary:hover {
    background: #e2e8f0;
  }

  .btn-primary:active, .btn-secondary:active {
    transform: scale(0.98);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }

    .filters {
      flex-direction: column;
      align-items: stretch;
    }

    .generate-btn {
      margin-left: 0;
      width: 100%;
    }

    .lessons-grid {
      grid-template-columns: 1fr;
    }

    .lesson-actions {
      flex-direction: column;
    }

    .btn-primary, .btn-secondary {
      max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    .header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .page-title {
      text-align: left;
    }

    .lesson-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .lesson-meta {
      margin-top: 0.5rem;
    }
  }
</style>