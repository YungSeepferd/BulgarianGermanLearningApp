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

  .description {
    padding: 1rem;
    background: var(--bg-surface);
    border-radius: 8px;
    border-left: 4px solid var(--accent);
  }

  .description p {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.9375rem;
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .item {
    padding: 1rem;
    background: var(--bg-base);
    border: 2px solid var(--border-default);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
  }

  .item:not(.disabled):hover {
    border-color: var(--accent);
    background: var(--bg-surface);
  }

  .item.dragging {
    opacity: 0.5;
    background: var(--bg-surface);
    border-color: var(--accent);
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
    background: var(--accent);
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
    color: var(--success);
  }

  .status.incorrect {
    color: var(--danger);
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

  .correct-order {
    padding: 1rem;
    background: var(--bg-surface);
    border-left: 4px solid var(--accent);
    border-radius: 8px;
  }

  .correct-order strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .correct-order ol {
    margin: 0;
    padding-left: 1.5rem;
  }

  .correct-order li {
    margin: 0.5rem 0;
    color: var(--text-primary);
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
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

  .btn-primary:hover {
    background: var(--accent-dim);
  }

  .btn-secondary {
    background: var(--border-default);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: var(--border-subtle);
  }
</style>
