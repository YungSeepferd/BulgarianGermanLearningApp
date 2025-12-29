<script lang="ts">
  // no lifecycle imports needed
  import FillInTheBlankExercise from './FillInTheBlankExercise.svelte';
  import MultipleChoiceExercise from './MultipleChoiceExercise.svelte';
  import MatchingExercise from './MatchingExercise.svelte';
  import OrderingExercise from './OrderingExercise.svelte';
  import TypingExercise from './TypingExercise.svelte';

  // Props inferred from $props()

  let { exercise = $bindable(), onComplete, onSkip } = $props();

  // currentQuestion derived but not used in markup; remove to avoid unused warnings

  let progress = $derived.by(() => {
    if (exercise.type === 'fill-in-blank' || exercise.type === 'multiple-choice' || exercise.type === 'typing') {
      const current = (exercise as any).currentQuestionIndex;
      const total = (exercise as any).questions.length;
      return { current: current + 1, total };
    }
    return { current: 0, total: 0 };
  });

  function handleNext() {
    if (exercise.type === 'fill-in-blank' || exercise.type === 'multiple-choice' || exercise.type === 'typing') {
      const ex = exercise as any;
      if (ex.currentQuestionIndex < ex.questions.length - 1) {
        ex.currentQuestionIndex++;
      } else {
        handleComplete();
      }
    }
  }

  function handleComplete() {
    if (onComplete) {
      onComplete({
        exerciseId: exercise.id,
        exerciseType: exercise.type,
        feedback: (exercise as any).feedback || [],
        isComplete: true,
      });
    }
  }

  function handleSkip() {
    if (onSkip) {
      onSkip();
    }
  }
</script>

<div class="exercise-container">
  <div class="exercise-header">
    <div class="progress-info">
      {#if progress.total > 0}
        <span class="question-counter">
          Question {progress.current} of {progress.total}
        </span>
      {/if}
    </div>

    <div class="progress-bar">
      {#if progress.total > 0}
        <div class="progress-fill" style="width: {(progress.current / progress.total) * 100}%"></div>
      {/if}
    </div>
  </div>

  <div class="exercise-content">
    {#if exercise.type === 'fill-in-blank'}
      <FillInTheBlankExercise {exercise} on:next={handleNext} on:skip={handleSkip} />
    {:else if exercise.type === 'multiple-choice'}
      <MultipleChoiceExercise {exercise} on:next={handleNext} on:skip={handleSkip} />
    {:else if exercise.type === 'matching'}
      <MatchingExercise {exercise} on:skip={handleSkip} />
    {:else if exercise.type === 'ordering'}
      <OrderingExercise {exercise} on:skip={handleSkip} />
    {:else if exercise.type === 'typing'}
      <TypingExercise {exercise} on:next={handleNext} on:skip={handleSkip} />
    {/if}
  </div>

  <div class="exercise-footer">
    <button type="button" class="btn btn-secondary" onclick={handleSkip}>Skip</button>
    {#if exercise.type === 'fill-in-blank' || exercise.type === 'multiple-choice' || exercise.type === 'typing'}
      <button type="button" class="btn btn-primary" onclick={handleNext}>
        {progress.current === progress.total ? 'Complete' : 'Next'}
      </button>
    {/if}
  </div>
</div>

<style>
  .exercise-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }

  .exercise-header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .progress-info {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .question-counter {
    font-weight: 500;
  }

  .progress-bar {
    height: 4px;
    background: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s ease;
  }

  .exercise-content {
    flex: 1;
  }

  .exercise-footer {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .btn {
    padding: var(--spacing-md) var(--spacing-lg);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
  }

  .btn-secondary {
    background: var(--color-border);
    color: var(--color-text);
  }

  .btn-secondary:hover {
    background: var(--color-border-dark);
  }
</style>
