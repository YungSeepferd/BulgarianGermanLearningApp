<script lang="ts">
  import { onMount } from 'svelte';
  import ExerciseContainer from '$lib/components/exercises/ExerciseContainer.svelte';
  import type { Exercise } from '$lib/schemas/exercises';
  // app state not needed for default exercise

  let currentExercise = $state<Exercise | null>(null);
  let isLoading = $state(true);
  let exerciseCompleted = $state(false);

  onMount(async () => {
    try {
      // Load initial exercise from app state or create default
      currentExercise = generateDefaultExercise();
      isLoading = false;
    } catch (error) {
      console.error('Failed to load exercise:', error);
      isLoading = false;
    }
  });

  function generateDefaultExercise(): Exercise {
    // This would typically come from a lesson or session
    // For now, we'll create a simple fill-in-the-blank exercise
    return {
      id: 'exercise-1',
      type: 'fill-in-blank',
      currentQuestionIndex: 0,
      userAnswers: [],
      isComplete: false,
      feedback: [],
      questions: [
        {
          id: 'q1',
          vocabularyId: 'vocab-guten-tag',
          german: 'Guten _',
          bulgarian: 'Добър _',
          partOfSpeech: 'noun',
          difficulty: 'easy',
          type: 'fill-in-blank',
          question: 'Fill in the blank: "Guten ___"',
          blankPosition: 12,
          correctAnswer: 'Tag',
          acceptedVariations: ['tag', 'TAG'],
          hints: ['German greeting', 'Means "day"'],
          source: 'german'
        },
        {
          id: 'q2',
          vocabularyId: 'vocab-dir',
          german: 'Wie geht es _?',
          bulgarian: 'Как си _?',
          partOfSpeech: 'other',
          difficulty: 'easy',
          type: 'fill-in-blank',
          question: 'Fill in the blank: "Wie geht es ___?"',
          blankPosition: 16,
          correctAnswer: 'dir',
          acceptedVariations: ['dir', 'DIR'],
          hints: ['German question', 'Informal "you"'],
          source: 'german'
        }
      ]
    };
  }

  function handleExerciseComplete() {
    exerciseCompleted = true;
  }

  function handleSkip() {
    // Skip to next question
    if (currentExercise && currentExercise.type !== 'matching' && currentExercise.type !== 'ordering') {
      const ex = currentExercise as any;
      if (ex.currentQuestionIndex < ex.questions.length - 1) {
        ex.currentQuestionIndex++;
      }
    }
  }

  function startNewExercise() {
    exerciseCompleted = false;
    currentExercise = generateDefaultExercise();
  }
</script>

<div class="exercises-page">
  <div class="header">
    <h1>Practice Exercises</h1>
    <p class="subtitle">Improve your language skills with interactive exercises</p>
  </div>

  <div class="content">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading exercise...</p>
      </div>
    {:else if exerciseCompleted}
      <div class="completion-screen">
        <div class="success-icon">🎉</div>
        <h2>Exercise Complete!</h2>
        <p>Great job! You've completed the exercise.</p>
        <button onclick={startNewExercise} class="btn btn-primary">Start New Exercise</button>
      </div>
    {:else if currentExercise}
      <div class="exercise-wrapper">
        <ExerciseContainer
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
          onSkip={handleSkip}
        />
      </div>
    {:else}
      <div class="error">
        <p>Failed to load exercise. Please try again.</p>
        <button onclick={() => location.reload()} class="btn btn-primary">Reload</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .exercises-page {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%);
    padding: var(--spacing-lg);
  }

  .header {
    max-width: 800px;
    margin: 0 auto var(--spacing-xl);
    text-align: center;
  }

  .header h1 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 2rem;
    color: var(--color-text);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  .content {
    max-width: 800px;
    margin: 0 auto;
  }

  .loading,
  .error {
    text-align: center;
    padding: var(--spacing-xl);
  }

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto var(--spacing-md);
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .completion-screen {
    text-align: center;
    padding: var(--spacing-xl);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
  }

  .completion-screen h2 {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.5rem;
    color: var(--color-text);
  }

  .completion-screen p {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--color-text-secondary);
  }

  .exercise-wrapper {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn {
    padding: var(--spacing-md) var(--spacing-lg);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 640px) {
    .exercises-page {
      padding: var(--spacing-md);
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .exercise-wrapper {
      padding: var(--spacing-md);
    }
  }
</style>
