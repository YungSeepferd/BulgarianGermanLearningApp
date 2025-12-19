<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FillInTheBlankExercise } from '$lib/schemas/exercises';
  import { ExerciseService } from '$lib/services/exercise';

  let { exercise = $bindable(), onComplete }: { exercise: FillInTheBlankExercise; onComplete?: (results: any) => void } = $props();
  const dispatch = createEventDispatcher();

  let userAnswer = $state('');
  let showFeedback = $state(false);
  let isCorrect = $state(false);

  const currentQuestion = $derived(exercise.questions[exercise.currentQuestionIndex]);

  function checkAnswer() {
    if (!userAnswer.trim() || !currentQuestion) return;

    isCorrect = ExerciseService.validateFillInBlankAnswer(
      userAnswer,
      currentQuestion.correctAnswer,
      currentQuestion.acceptedVariations
    );

    showFeedback = true;

    // Store feedback
    exercise.feedback.push({
      questionId: currentQuestion.id,
      isCorrect,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
    });

    // Store user answer
    exercise.userAnswers.push(userAnswer);
  }

  function nextQuestion() {
    userAnswer = '';
    showFeedback = false;
    dispatch('next');
  }

  function skipQuestion() {
    exercise.userAnswers.push('');
    dispatch('skip');
  }
</script>

<div class="fill-in-blank">
  {#if currentQuestion}
    <div class="question">
      <h3>{currentQuestion.question}</h3>
    </div>

    <div class="input-group">
      <input
        type="text"
        bind:value={userAnswer}
        placeholder="Enter your answer"
        class="answer-input"
        onkeydown={(e) => e.key === 'Enter' && checkAnswer()}
        disabled={showFeedback}
      />
      {#if !showFeedback}
        <button onclick={checkAnswer} class="btn btn-check">Check</button>
      {/if}
    </div>

    {#if showFeedback}
      <div class={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
        {#if isCorrect}
          <span class="feedback-icon">✓</span>
          <span>Correct!</span>
        {:else}
          <span class="feedback-icon">✗</span>
          <span>Incorrect. The correct answer is: <strong>{currentQuestion.correctAnswer}</strong></span>
        {/if}
      </div>

        {#if currentQuestion.hints && currentQuestion.hints.length > 0}
          <div class="hints">
            <strong>Hints:</strong>
            <ul>
              {#each currentQuestion.hints as hint}
                <li>{hint}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="action-buttons">
          <button onclick={nextQuestion} class="btn btn-primary">Next</button>
          <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
        </div>
      {/if}
    {/if}
</div>

<style>
  .fill-in-blank {
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

  .input-group {
    display: flex;
    gap: var(--spacing-md);
  }

  .answer-input {
    flex: 1;
    padding: var(--spacing-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .answer-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .answer-input:disabled {
    background: var(--color-bg-secondary);
    cursor: not-allowed;
  }

  .btn-check {
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-check:hover {
    background: var(--color-primary-dark);
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

  .hints {
    padding: var(--spacing-md);
    background: var(--color-info-light);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
  }

  .hints strong {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--color-info-dark);
  }

  .hints ul {
    margin: 0;
    padding-left: var(--spacing-lg);
  }

  .hints li {
    margin: var(--spacing-sm) 0;
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
