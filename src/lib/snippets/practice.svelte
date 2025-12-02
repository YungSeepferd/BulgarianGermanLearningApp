// Practice snippet for Svelte 5
<script lang="ts">
  import { appState } from '$lib/state/app.svelte.ts';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  // Reactive state
  let currentItem = $state<VocabularyItem | null>(null);
  let showAnswer = $state(false);

  // Practice functions
  function startPractice(item: VocabularyItem) {
    currentItem = item;
    showAnswer = false;
    appState.setCurrentItem(item);
  }

  function revealAnswer() {
    showAnswer = true;
    appState.toggleShowAnswer();
  }

  function nextItem() {
    // Implementation would fetch next item from data loader
    currentItem = null;
    showAnswer = false;
  }
</script>

{#if currentItem}
  <div class="practice-card">
    <div class="question">
      {appState.currentDirection === 'DE->BG' ? currentItem.german : currentItem.bulgarian}
    </div>

    {#if showAnswer}
      <div class="answer">
        {appState.currentDirection === 'DE->BG' ? currentItem.bulgarian : currentItem.german}
      </div>
    {:else}
      <button on:click={revealAnswer} class="reveal-btn">
        Show Answer
      </button>
    {/if}

    <div class="actions">
      <button on:click={nextItem} class="next-btn">
        Next
      </button>
    </div>
  </div>
{/if}

<style>
  .practice-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
  }

  .question {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    text-align: center;
  }

  .answer {
    font-size: 1.3rem;
    color: #007bff;
    text-align: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .reveal-btn, .next-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reveal-btn {
    background: #007bff;
    color: white;
    margin: 0 auto;
  }

  .reveal-btn:hover {
    background: #0069d9;
  }

  .next-btn {
    background: #28a745;
    color: white;
  }

  .next-btn:hover {
    background: #218838;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
</style>