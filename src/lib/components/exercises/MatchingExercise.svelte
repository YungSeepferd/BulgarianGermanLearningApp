<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MatchingExercise } from '$lib/schemas/exercises';

  let { exercise = $bindable() }: { exercise: MatchingExercise } = $props();
  const dispatch = createEventDispatcher();

  let userMatches = $state<Record<string, string>>({});
  let showFeedback = $state(false);
  let isCorrect = $state(false);

  // Derive left/right items from pairs
  const leftItems = $derived(exercise.pairs.map((p) => ({ id: p.leftId, text: p.leftText })));
  const rightItems = $derived(exercise.pairs.map((p) => ({ id: p.rightId, text: p.rightText })));

  function toggleMatch(leftId: string, rightId: string) {
    if (showFeedback) return;

    if (userMatches[leftId] === rightId) {
      delete userMatches[leftId];
    } else {
      userMatches[leftId] = rightId;
    }
  }

  function checkAnswer() {
    const pairs = exercise.pairs.map((pair) => ({
      leftId: pair.leftId,
      rightId: userMatches[pair.leftId],
    }));

    // Validate by comparing with original pairs
    isCorrect = pairs.every((p) => {
      const correct = exercise.pairs.find((cp) => cp.leftId === p.leftId);
      return correct?.rightId === p.rightId;
    });
    showFeedback = true;
  }

  function nextQuestion() {
    userMatches = {};
    showFeedback = false;
    dispatch('next');
  }

  function skipQuestion() {
    dispatch('skip');
  }

  function isMatchCorrect(leftId: string, rightId: string): boolean {
    const correctMatch = exercise.pairs.find((p) => p.leftId === leftId);
    return correctMatch?.rightId === rightId;
  }

  function allMatched(): boolean {
    return exercise.pairs.every((pair) => userMatches[pair.leftId]);
  }

  function getRandomLeftItems() {
    return leftItems;
  }

  function getRightItems() {
    return rightItems;
  }
</script>

<div class="matching">
  <div class="question">
    <h3>{exercise.title}</h3>
  </div>

  <div class="matching-container">
    <div class="column left">
      <h4>Choose</h4>
      <div class="items">
        {#each getRandomLeftItems() as leftItem (leftItem.id)}
          <div class="item-group">
            <div class="item left-item">{leftItem.text}</div>
            <div class="connections">
              {#each getRightItems() as rightItem (rightItem.id)}
                <button
                  onclick={() => toggleMatch(leftItem.id, rightItem.id)}
                  class={`connection ${userMatches[leftItem.id] === rightItem.id ? 'active' : ''} ${showFeedback && isMatchCorrect(leftItem.id, userMatches[leftItem.id] || '') ? 'correct' : ''} ${showFeedback && userMatches[leftItem.id] === rightItem.id && !isMatchCorrect(leftItem.id, rightItem.id) ? 'incorrect' : ''}`}
                  disabled={showFeedback}
                  title={`Match to ${rightItem.text}`}
                >
                </button>
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
    gap: 1rem;
  }

  .question {
    padding: 1rem;
    background: var(--bg-surface);
    border-radius: 8px;
  }

  .question h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--text-primary);
  }

  .matching-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 1rem;
    background: var(--bg-elevated);
    border-radius: 8px;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .column h4 {
    margin: 0;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .item-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .item {
    padding: 1rem;
    background: var(--bg-base);
    border: 2px solid var(--border-default);
    border-radius: 8px;
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
    gap: 0.5rem;
  }

  .connection {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--border-default);
    background: var(--bg-base);
    cursor: pointer;
    transition: all 0.2s;
  }

  .connection:hover {
    background: var(--bg-surface);
    border-color: var(--accent);
  }

  .connection.active {
    background: var(--accent);
    border-color: var(--accent);
  }

  .connection.correct {
    background: var(--success);
    border-color: var(--success);
  }

  .connection.incorrect {
    background: var(--danger);
    border-color: var(--danger);
  }

  .connection:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .feedback {
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 500;
  }

  .feedback.correct {
    background: color-mix(in srgb, var(--success) 15%, transparent);
    color: var(--success);
  }

  .feedback.incorrect {
    background: color-mix(in srgb, var(--danger) 15%, transparent);
    color: var(--danger);
  }

  .feedback-icon {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--accent);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--accent-dim);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--border-default);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: var(--border-subtle);
  }

  @media (max-width: 768px) {
    .matching-container {
      grid-template-columns: 1fr;
    }
  }
</style>
