<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TypingExercise } from '$lib/schemas/exercises';
  import { ExerciseService } from '$lib/services/exercise';

  let { exercise = $bindable() }: { exercise: TypingExercise } = $props();
  const dispatch = createEventDispatcher();

  let userAnswer = $state('');
  let showFeedback = $state(false);
  let isCorrect = $state(false);
  let similarity = $state(0);

  const currentQuestion = $derived(exercise.questions[exercise.currentQuestionIndex]);

  function checkAnswer() {
    if (!userAnswer.trim()) return;

    // Calculate similarity
    similarity = ExerciseService.calculateSimilarity(
      userAnswer.toLowerCase(),
      (currentQuestion?.correctAnswer || '').toLowerCase()
    );

    // Determine if correct (default threshold 0.85)
    // Default threshold 0.85
    isCorrect = similarity >= 0.85;

    showFeedback = true;

    // Store feedback
    exercise.feedback.push({
      questionId: currentQuestion?.id || 'unknown',
      isCorrect,
      userAnswer,
      correctAnswer: currentQuestion?.correctAnswer || '',
      similarity,
    });

    // Store user answer
    exercise.userAnswers.push(userAnswer);
  }

  function nextQuestion() {
    userAnswer = '';
    showFeedback = false;
    similarity = 0;
    dispatch('next');
  }

  function skipQuestion() {
    exercise.userAnswers.push('');
    dispatch('skip');
  }

  function revealAnswer() {
    userAnswer = currentQuestion?.correctAnswer || '';
  }

  function getSimilarityPercentage(): number {
    return Math.round(similarity * 100);
  }

  function getSimilarityStatus(): 'correct' | 'close' | 'incorrect' {
    if (isCorrect) return 'correct';
    if (similarity >= 0.7) return 'close';
    return 'incorrect';
  }
</script>

<div class="typing">
  <div class="question">
    <h3>{currentQuestion ? (currentQuestion as any).prompt : ''}</h3>
  </div>

  <!-- Image is not part of TypingExercise schema; removed -->

  <div class="input-group">
    <input
      type="text"
      bind:value={userAnswer}
      placeholder="Type your answer..."
      class="answer-input"
      onkeydown={(e) => e.key === 'Enter' && checkAnswer()}
      disabled={showFeedback}
      spellcheck="false"
      autocomplete="off"
    />
    {#if !showFeedback}
      <button onclick={checkAnswer} class="btn btn-check">Check</button>
    {/if}
  </div>

  {#if showFeedback}
    <div class={`feedback ${getSimilarityStatus()}`}>
      <div class="feedback-header">
        {#if isCorrect}
          <span class="icon">✓</span>
          <span>Perfect!</span>
        {:else if getSimilarityStatus() === 'close'}
          <span class="icon">~</span>
          <span>Close!</span>
        {:else}
          <span class="icon">✗</span>
          <span>Not quite right</span>
        {/if}
      </div>

      <div class="similarity-info">
        <div class="similarity-bar">
          <div class="similarity-fill" style={`width: ${getSimilarityPercentage()}%`}></div>
        </div>
        <span class="similarity-text">{getSimilarityPercentage()}% match</span>
      </div>

      <div class="answer-comparison">
        <div class="answer-row">
          <strong>Your answer:</strong>
          <span>{userAnswer}</span>
        </div>
        <div class="answer-row">
          <strong>Correct answer:</strong>
          <span>{currentQuestion?.correctAnswer || ''}</span>
        </div>
      </div>

      {#if currentQuestion && currentQuestion.hints && currentQuestion.hints.length > 0}
        <div class="hints">
          <strong>Tips:</strong>
          <ul>
            {#each (currentQuestion?.hints ?? []) as hint}
              <li>{hint}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="action-buttons">
        {#if !isCorrect}
          <button onclick={revealAnswer} class="btn btn-secondary">Show Answer</button>
        {/if}
        <button onclick={nextQuestion} class="btn btn-primary">Next</button>
        <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .typing {
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

  .question-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: var(--radius-md);
    margin-top: var(--spacing-md);
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
    font-family: monospace;
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
    border-left: 4px solid;
  }

  .feedback.correct {
    background: var(--color-success-light);
    border-color: var(--color-success);
    color: var(--color-success-dark);
  }

  .feedback.close {
    background: var(--color-warning-light);
    border-color: var(--color-warning);
    color: var(--color-warning-dark);
  }

  .feedback.incorrect {
    background: var(--color-error-light);
    border-color: var(--color-error);
    color: var(--color-error-dark);
  }

  .feedback-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-weight: bold;
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
  }

  .icon {
    font-size: 1.5rem;
  }

  .similarity-info {
    margin-bottom: var(--spacing-md);
  }

  .similarity-bar {
    width: 100%;
    height: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--spacing-sm);
  }

  .similarity-fill {
    height: 100%;
    background: linear-gradient(to right, var(--color-error), var(--color-warning), var(--color-success));
    transition: width 0.3s ease;
  }

  .similarity-text {
    font-size: 0.875rem;
    font-weight: 500;
    display: block;
  }

  .answer-comparison {
    background: rgba(0, 0, 0, 0.05);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
  }

  .answer-row {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
  }

  .answer-row:last-child {
    margin-bottom: 0;
  }

  .answer-row strong {
    min-width: 120px;
  }

  .answer-row span {
    font-family: monospace;
    word-break: break-all;
  }

  .hints {
    background: rgba(0, 0, 0, 0.05);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
  }

  .hints strong {
    display: block;
    margin-bottom: var(--spacing-sm);
  }

  .hints ul {
    margin: 0;
    padding-left: var(--spacing-lg);
  }

  .hints li {
    margin: var(--spacing-sm) 0;
    font-size: 0.9375rem;
  }

  .action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    flex-wrap: wrap;
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
    background: rgba(0, 0, 0, 0.1);
    color: var(--color-text);
  }

  .btn-secondary:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 640px) {
    .input-group {
      flex-direction: column;
    }

    .btn-check {
      width: 100%;
    }

    .action-buttons {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
