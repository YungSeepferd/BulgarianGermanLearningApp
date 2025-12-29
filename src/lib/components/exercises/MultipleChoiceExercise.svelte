<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MultipleChoiceExercise } from '$lib/schemas/exercises';

  let { exercise = $bindable() }: { exercise: MultipleChoiceExercise } = $props();
  const dispatch = createEventDispatcher();

  let selectedOptionId = $state<string | null>(null);
  let showFeedback = $state(false);
  let isCorrect = $state(false);

  const currentQuestion = $derived(exercise.questions[exercise.currentQuestionIndex]);

  function selectOption(optionId: string) {
    if (!showFeedback) {
      selectedOptionId = optionId;
    }
  }

  function checkAnswer() {
    if (!selectedOptionId || !currentQuestion) return;

    const correctOpt = currentQuestion.options.find((opt) => opt.isCorrect);
    isCorrect = selectedOptionId === (correctOpt?.id || null);

    showFeedback = true;

    // Store feedback
    exercise.feedback.push({
      questionId: currentQuestion.id,
      isCorrect,
      userAnswer: selectedOptionId,
      correctAnswerId: correctOpt?.id || ''
    });

    // Store user answer
    exercise.userAnswers.push(selectedOptionId);
  }

  function nextQuestion() {
    selectedOptionId = null;
    showFeedback = false;
    dispatch('next');
  }

  function skipQuestion() {
    exercise.userAnswers.push('');
    dispatch('skip');
  }

  function getCorrectOption() {
    return currentQuestion?.options.find((opt) => opt.isCorrect);
  }
</script>

{#if currentQuestion}
  <div class="multiple-choice">
    <div class="question">
      <h3>{currentQuestion.question}</h3>
    </div>

    <div class="options">
      {#each currentQuestion.options as option (option.id)}
      <button
        onclick={() => selectOption(option.id)}
        class={`option ${selectedOptionId === option.id ? 'selected' : ''} ${showFeedback && option.isCorrect ? 'correct' : ''} ${showFeedback && selectedOptionId === option.id && !isCorrect ? 'incorrect' : ''}`}
        disabled={showFeedback}
      >
        <span class="option-text">{option.text}</span>
        {#if showFeedback && option.isCorrect}
          <span class="icon">✓</span>
        {/if}
        {#if showFeedback && selectedOptionId === option.id && !isCorrect}
          <span class="icon">✗</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if !showFeedback}
    <div class="action-buttons">
      <button
        onclick={checkAnswer}
        disabled={!selectedOptionId}
        class="btn btn-primary"
      >
        Check Answer
      </button>
      <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
    </div>
  {:else}
    <div class={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
      {#if isCorrect}
        <span class="feedback-icon">✓</span>
        <span>Correct!</span>
      {:else}
        <span class="feedback-icon">✗</span>
        <span>Incorrect. The correct answer is: <strong>{getCorrectOption()?.text}</strong></span>
      {/if}
    </div>

    {#if currentQuestion.explanation}
      <div class="explanation">
        <strong>Explanation:</strong>
        <p>{currentQuestion.explanation}</p>
      </div>
    {/if}

    <div class="action-buttons">
      <button onclick={nextQuestion} class="btn btn-primary">Next</button>
        <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .multiple-choice {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .question {
    padding: var(--spacing-md);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-md);
  }

  .question h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--color-text);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .option {
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .option:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: var(--color-bg-tertiary);
  }

  .option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .option.correct {
    border-color: var(--color-success);
    background: var(--color-success-light);
  }

  .option.incorrect {
    border-color: var(--color-error);
    background: var(--color-error-light);
  }

  .option:disabled {
    cursor: not-allowed;
  }

  .option-text {
    flex: 1;
  }

  .icon {
    font-weight: bold;
    font-size: 1.25rem;
    margin-left: var(--spacing-md);
  }

  .option.correct .icon {
    color: var(--color-success);
  }

  .option.incorrect .icon {
    color: var(--color-error);
  }

  .feedback {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-weight: 500;
  }

  .feedback.correct {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }

  .feedback.incorrect {
    background: var(--color-error-light);
    color: var(--color-error-dark);
  }

  .feedback-icon {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .explanation {
    padding: var(--spacing-md);
    background: var(--color-info-light);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
  }

  .explanation strong {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--color-info-dark);
  }

  .explanation p {
    margin: 0;
    color: var(--color-text);
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
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

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-dark);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--color-border);
    color: var(--color-text);
  }

  .btn-secondary:hover {
    background: var(--color-border-dark);
  }
</style>
