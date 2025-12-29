<script lang="ts">
  import { page } from '$app/stores';
  import { appState } from '$lib/state/app-state';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import type {
    SentenceBuilderExercise,
    FillInTheBlankExerciseV2,
    TypingExercise as TypingExerciseType,
    MatchingExercise as MatchingExerciseType,
    OrderingExercise as OrderingExerciseType
  } from '$lib/schemas/exercises';
  
  // Import exercise components
  import SentenceBuilder from '$lib/components/exercises/SentenceBuilder.svelte';
  import FillInTheBlank from '$lib/components/exercises/FillInTheBlankExercise.svelte';
  import TypingExercise from '$lib/components/exercises/TypingExercise.svelte';
  import MatchingExercise from '$lib/components/exercises/MatchingExercise.svelte';
  import OrderingExercise from '$lib/components/exercises/OrderingExercise.svelte';

  // Type for lesson data
  interface Lesson {
    id: string;
    title: string;
    description: string;
    level: string;
    grammarPoints: string[];
    vocabularyIds: string[];
    exercises: Array<
      | SentenceBuilderExercise
      | FillInTheBlankExerciseV2
      | TypingExerciseType
      | MatchingExerciseType
      | OrderingExerciseType
    >;
    prerequisites: string[];
    unlocks: string[];
    estimatedTime: number;
  }

  // Load lesson data
  let lesson = $state<Lesson | null>(null);
  let currentExerciseIndex = $state(0);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Get lesson ID from URL
  const lessonId = $page.params['lessonId'];

  // Load lesson on mount
  onMount(async () => {
    try {
      loading = true;
      error = null;
      
      // Import lesson data dynamically
      const lessonModule = await import(`../../../../data/lessons/lesson-${lessonId}.json`);
      lesson = lessonModule.default as Lesson;
      
      if (!lesson) {
        throw new Error('Lesson not found');
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
      error = appState.languageMode === 'DE_BG' 
        ? 'Lektion nicht gefunden' 
        : 'Урокът не е намерен';
    } finally {
      loading = false;
    }
  });

  // Get current exercise
  const currentExercise = $derived<Lesson['exercises'][number] | undefined>(
    lesson ? lesson.exercises?.[currentExerciseIndex] : undefined
  );

  // Navigation handlers
  function nextExercise() {
    if (lesson && currentExerciseIndex < lesson.exercises.length - 1) {
      currentExerciseIndex++;
    }
  }

  function prevExercise() {
    if (lesson && currentExerciseIndex > 0) {
      currentExerciseIndex--;
    }
  }

  function goToExercise(index: number) {
    if (lesson) {
      currentExerciseIndex = index;
    }
  }

  // Calculate progress
  const progress = $derived(
    lesson
      ? {
          current: currentExerciseIndex + 1,
          total: lesson.exercises.length,
          percentage: Math.round(((currentExerciseIndex + 1) / lesson.exercises.length) * 100)
        }
      : { current: 0, total: 0, percentage: 0 }
  );

  function getExerciseTitle(exercise: Lesson['exercises'][number], index: number): string {
    if ('title' in exercise && exercise.title) {
      return `${index + 1}. ${exercise.title}`;
    }
    return `${index + 1}. ${exercise.type}`;
  }

  // Exercise completion handler
  function handleExerciseComplete(event: CustomEvent<{ isCorrect: boolean }>) {
    // Could add celebration or tracking here
    console.log('Exercise completed:', event.detail.isCorrect);
  }
</script>

<div class="lesson-container" role="main" aria-labelledby="lesson-title">
  <!-- Loading state -->
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>{appState.languageMode === 'DE_BG' ? 'Lade Lektion...' : 'Зареждане на урока...'}</p>
    </div>
  
  <!-- Error state -->
  {:else if error}
    <div class="error-state" role="alert">
      <h2>{appState.languageMode === 'DE_BG' ? 'Fehler' : 'Грешка'}</h2>
      <p>{error}</p>
      <a href="{base}/learn" class="button">
        {appState.languageMode === 'DE_BG' ? 'Zurück zu Lektionen' : 'Назад към уроците'}
      </a>
    </div>
  
  <!-- Lesson loaded -->
  {:else if lesson}
    <!-- Lesson header -->
    <header class="lesson-header">
      <h1 id="lesson-title" class="lesson-title">
        {lesson.title}
      </h1>
      <p class="lesson-description">{lesson.description}</p>
      
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {progress.percentage}%"
          ></div>
        </div>
        <span class="progress-text">
          {appState.languageMode === 'DE_BG' 
            ? `${progress.current} von ${progress.total} Übungen`
            : `${progress.current} от ${progress.total} упражнения`}
        </span>
      </div>
    </header>

    <!-- Exercise content -->
    <main class="lesson-content">
      {#if currentExercise}
        <!-- Sentence Builder -->
        {#if currentExercise.type === 'sentence-builder'}
          <SentenceBuilder
            exercise={currentExercise}
            on:exerciseComplete={handleExerciseComplete}
          />
        
        <!-- Fill in the Blank -->
        {:else if currentExercise.type === 'fill-in-blank'}
          <FillInTheBlank
            exercise={currentExercise}
            on:exerciseComplete={handleExerciseComplete}
          />
        
        <!-- Typing -->
        {:else if currentExercise.type === 'typing'}
          <TypingExercise
            exercise={currentExercise}
            on:exerciseComplete={handleExerciseComplete}
          />
        
        <!-- Matching -->
        {:else if currentExercise.type === 'matching'}
          <MatchingExercise
            exercise={currentExercise}
            on:exerciseComplete={handleExerciseComplete}
          />
        
        <!-- Ordering -->
        {:else if currentExercise.type === 'ordering'}
          <OrderingExercise
            exercise={currentExercise}
            on:exerciseComplete={handleExerciseComplete}
          />
        {/if}
      {/if}
    </main>

    <!-- Navigation -->
    <nav class="lesson-navigation">
      <div class="nav-buttons">
        <button
          on:click={prevExercise}
          disabled={currentExerciseIndex === 0}
          class="button button--secondary"
        >
          {appState.languageMode === 'DE_BG' ? 'Zurück' : 'Назад'}
        </button>
        
        {#if currentExerciseIndex < lesson.exercises.length - 1}
          <button
            on:click={nextExercise}
            class="button button--primary"
          >
            {appState.languageMode === 'DE_BG' ? 'Weiter' : 'Напред'}
          </button>
        {:else}
          <a href="{base}/learn" class="button button--primary">
            {appState.languageMode === 'DE_BG' ? 'Alle Lektionen' : 'Всички уроци'}
          </a>
        {/if}
      </div>
      
      <!-- Exercise selector -->
      <div class="exercise-selector">
        <span>{appState.languageMode === 'DE_BG' ? 'Übung:' : 'Упражнение:'}</span>
        <select
          on:change={(event) => {
            const target = event.target as HTMLSelectElement | null;
            if (target) {
              goToExercise(parseInt(target.value, 10));
            }
          }}
          value={currentExerciseIndex}
          class="select-exercise"
        >
          {#each lesson.exercises as exercise, i}
            <option value={i}>
              {getExerciseTitle(exercise, i)}
            </option>
          {/each}
        </select>
      </div>
    </nav>
  {/if}
</div>

<style>
  .lesson-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
    color: var(--color-neutral-dark);
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    gap: var(--space-4);
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--color-neutral-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error state */
  .error-state {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-error);
  }

  .error-state h2 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-3);
  }

  /* Lesson header */
  .lesson-header {
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .lesson-title {
    font-size: var(--text-3xl);
    font-weight: var(--font-extrabold);
    color: var(--color-primary-darker);
    margin-bottom: var(--space-2);
  }

  .lesson-description {
    font-size: var(--text-lg);
    color: var(--color-neutral-text);
    margin-bottom: var(--space-4);
  }

  /* Progress bar */
  .progress-container {
    margin-bottom: var(--space-5);
  }

  .progress-bar {
    height: 8px;
    background: var(--color-neutral-border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--space-2);
  }

  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
  }

  /* Lesson content */
  .lesson-content {
    margin-bottom: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* Navigation */
  .lesson-navigation {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-5);
  }

  .nav-buttons {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--border-radius-lg);
    font-weight: var(--font-semibold);
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }

  .button--primary {
    background: var(--color-primary);
    color: white;
  }

  .button--secondary {
    background: var(--color-secondary-light);
    color: var(--color-neutral-dark);
    border: 1px solid var(--color-neutral-border);
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Exercise selector */
  .exercise-selector {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    justify-content: center;
  }

  .select-exercise {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-neutral-border);
    background: white;
    font-size: var(--text-sm);
    cursor: pointer;
  }

  /* Responsive */
  @media (max-width: var(--breakpoint-md)) {
    .nav-buttons {
      flex-direction: column;
    }
    
    .button {
      width: 100%;
    }
  }
</style>