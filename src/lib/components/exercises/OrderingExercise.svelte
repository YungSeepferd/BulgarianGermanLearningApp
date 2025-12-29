<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { OrderingExercise } from '$lib/schemas/exercises';
  import { ExerciseService } from '$lib/services/exercise';

  let { exercise = $bindable() }: { exercise: OrderingExercise } = $props();
  const dispatch = createEventDispatcher();

  let items = $state<Array<{ id: string; text: string }>>([]);
  let showFeedback = $state(false);
  let isCorrect = $state(false);
  let draggedItem = $state<string | null>(null);

  // Derive correct order from item positions
  const correctOrderIds = $derived([...exercise.items].sort((a, b) => a.correctPosition - b.correctPosition).map((i) => i.id));

  $effect(() => {
    // Shuffle items on component mount
    items = exercise.items
      .map((item) => ({ id: item.id, text: item.text }))
      .sort(() => Math.random() - 0.5);
  });

  function handleDragStart(e: DragEvent, itemId: string) {
    draggedItem = itemId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault();

    if (!draggedItem) return;

    const draggedIndex = items.findIndex((item) => item.id === draggedItem);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      draggedItem = null;
      return;
    }

    // Reorder items
    const removed = items.splice(draggedIndex, 1)[0];
    if (!removed) {
      draggedItem = null;
      return;
    }
    items.splice(targetIndex, 0, removed);
    draggedItem = null;
  }

  function checkAnswer() {
    const userOrder = items.map((item) => item.id);
    const correctOrder = correctOrderIds;

    isCorrect = ExerciseService.validateOrdering(userOrder, correctOrder);
    showFeedback = true;
  }

  function nextQuestion() {
    items = [];
    showFeedback = false;
    draggedItem = null;
    dispatch('next');
  }

  function skipQuestion() {
    dispatch('skip');
  }

  function shuffleItems() {
    items = items.sort(() => Math.random() - 0.5);
  }
</script>

<div class="ordering">
  <div class="question">
    <h3>{exercise.title}</h3>
  </div>

  <div class="description">
    <p>Drag and drop the items to arrange them in the correct order.</p>
  </div>

  <div class="items-container">
    {#each items as item, index (item.id)}
      <div
        class="item"
        draggable={!showFeedback}
        ondragstart={(e) => handleDragStart(e, item.id)}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, index)}
        role="listitem"
        class:dragging={draggedItem === item.id}
        class:disabled={showFeedback}
      >
        <span class="order-number">{index + 1}</span>
        <span class="item-text">{item.text}</span>
        {#if showFeedback}
          {#if correctOrderIds[index] === item.id}
            <span class="status correct">✓</span>
          {:else}
            <span class="status incorrect">✗</span>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  {#if !showFeedback}
    <div class="action-buttons">
      <button onclick={shuffleItems} class="btn btn-secondary">Shuffle</button>
      <button onclick={checkAnswer} class="btn btn-primary">Check Order</button>
      <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
    </div>
  {:else}
    <div class={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
      {#if isCorrect}
        <span class="feedback-icon">✓</span>
        <span>Perfect! You have the correct order!</span>
      {:else}
        <span class="feedback-icon">✗</span>
        <span>Not quite right. Check the marked items and try again.</span>
      {/if}
    </div>

    <div class="correct-order">
      <strong>Correct Order:</strong>
      <ol>
        {#each correctOrderIds as itemId}
          {@const correctItem = exercise.items.find((i) => i.id === itemId)}
          <li>{correctItem?.text}</li>
        {/each}
      </ol>
    </div>

    <div class="action-buttons">
      <button onclick={nextQuestion} class="btn btn-primary">Next</button>
      <button onclick={skipQuestion} class="btn btn-secondary">Skip</button>
    </div>
  {/if}
</div>

<style>
  .ordering {
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

  .description {
    padding: var(--spacing-md);
    background: var(--color-info-light);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-info);
  }

  .description p {
    margin: 0;
    color: var(--color-text);
    font-size: 0.9375rem;
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .item {
    padding: var(--spacing-md);
    background: white;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
  }

  .item:not(.disabled):hover {
    border-color: var(--color-primary);
    background: var(--color-bg-tertiary);
  }

  .item.dragging {
    opacity: 0.5;
    background: var(--color-primary-light);
    border-color: var(--color-primary);
  }

  .item.disabled {
    cursor: not-allowed;
  }

  .order-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
  }

  .item-text {
    flex: 1;
    font-weight: 500;
  }

  .status {
    font-weight: bold;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .status.correct {
    color: var(--color-success);
  }

  .status.incorrect {
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

  .correct-order {
    padding: var(--spacing-md);
    background: var(--color-info-light);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
  }

  .correct-order strong {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--color-info-dark);
  }

  .correct-order ol {
    margin: 0;
    padding-left: var(--spacing-lg);
  }

  .correct-order li {
    margin: var(--spacing-sm) 0;
    color: var(--color-text);
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
    background: var(--color-border);
    color: var(--color-text);
  }

  .btn-secondary:hover {
    background: var(--color-border-dark);
  }
</style>
