<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MatchingExercise } from '$lib/schemas/exercises';
  import { ExerciseService } from '$lib/services/exercise';

  let { exercise = $bindable(), onComplete }: { exercise: MatchingExercise; onComplete?: (results: any) => void } = $props();
  const dispatch = createEventDispatcher();

  let userMatches = $state<Record<string, string>>({});
  let showFeedback = $state(false);
  let isCorrect = $state(false);

  const currentQuestion = $derived(exercise.questions[exercise.currentQuestionIndex]);

  function toggleMatch(leftId: string, rightId: string) {
    if (showFeedback) return;

    if (userMatches[leftId] === rightId) {
      delete userMatches[leftId];
    } else {
      userMatches[leftId] = rightId;
    }
  }

  function checkAnswer() {
    const pairs = currentQuestion.pairs.map((pair) => ({
      leftId: pair.leftId,
      rightId: userMatches[pair.leftId],
    }));

    isCorrect = ExerciseService.validateMatching(pairs, currentQuestion.correctPairs);
    showFeedback = true;

    // Store feedback
    exercise.feedback.push({
      questionId: currentQuestion.id,
      isCorrect,
      userMatches,
      correctPairs: currentQuestion.correctPairs.reduce(
        (acc, pair) => {
          acc[pair.leftId] = pair.rightId;
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    // Store user answer
    exercise.userAnswers.push(JSON.stringify(userMatches));
  }

  function nextQuestion() {
    userMatches = {};
    showFeedback = false;
    dispatch('next');
  }

  function skipQuestion() {
    exercise.userAnswers.push('');
    dispatch('skip');
  }

  function isMatchCorrect(leftId: string, rightId: string): boolean {
    const correctMatch = currentQuestion.correctPairs.find((p) => p.leftId === leftId);
    return correctMatch?.rightId === rightId;
  }

  function allMatched(): boolean {
    return currentQuestion.pairs.every((pair) => userMatches[pair.leftId]);
  }

  function getRandomLeftItems() {
    return currentQuestion.pairs.map((p) => ({ id: p.leftId, text: p.leftText }));
  }

  function getRightItems() {
    return currentQuestion.rightItems;
  }
</script>

<div class="matching">
  <div class="question">
    <h3>{currentQuestion.question}</h3>
  </div>

  <div class="matching-container">
    <div class="column left">
      <h4>Choose</h4>
      <div class="items">
        {#each getRandomLeftItems() as leftItem (leftItem.id)}
          <div class="item-group">
            <div class="item left-item">{leftItem.text}</div>
            <div class="connections">
              {#each currentQuestion.rightItems as rightItem (rightItem.id)}
                <button
                  onclick={() => toggleMatch(leftItem.id, rightItem.id)}
                  class={`connection ${userMatches[leftItem.id] === rightItem.id ? 'active' : ''} ${showFeedback && isMatchCorrect(leftItem.id, userMatches[leftItem.id] || '') ? 'correct' : ''} ${showFeedback && userMatches[leftItem.id] === rightItem.id && !isMatchCorrect(leftItem.id, rightItem.id) ? 'incorrect' : ''}`}
                  disabled={showFeedback}
                  title={`Match to ${rightItem.text}`}
                />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="column right">
      <h4>Match with</h4>
      <div class="items">
        {#each getRightItems() as rightItem (rightItem.id)}
          <div class="item right-item">{rightItem.text}</div>
        {/each}
      </div>
    </div>
  </div>

  {#if !showFeedback}
    <div class="action-buttons">
      <button
        onclick={checkAnswer}
        disabled={!allMatched()}
        class="btn btn-primary"
      >
        Check Matches
      </button>
      <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
    </div>
  {:else}
    <div class={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
      {#if isCorrect}
        <span class="feedback-icon">✓</span>
        <span>Perfect! All matches are correct!</span>
      {:else}
        <span class="feedback-icon">✗</span>
        <span>Some matches are incorrect. Try again or skip to continue.</span>
      {/if}
    </div>

    <div class="action-buttons">
      <button onclick={nextQuestion} class="btn btn-primary">Next</button>
      <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
    </div>
  {/if}
</div>

<style>
  .matching {
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

  .matching-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .column h4 {
    margin: 0;
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .item-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .item {
    padding: var(--spacing-md);
    background: white;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    flex: 1;
    font-weight: 500;
  }

  .left-item {
    text-align: right;
  }

  .right-item {
    text-align: left;
  }

  .connections {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .connection {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .connection:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
  }

  .connection.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  .connection.correct {
    background: var(--color-success);
    border-color: var(--color-success);
  }

  .connection.incorrect {
    background: var(--color-error);
    border-color: var(--color-error);
  }

  .connection:disabled {
    cursor: not-allowed;
    opacity: 0.6;
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

  @media (max-width: 768px) {
    .matching-container {
      grid-template-columns: 1fr;
    }
  }
</style>
