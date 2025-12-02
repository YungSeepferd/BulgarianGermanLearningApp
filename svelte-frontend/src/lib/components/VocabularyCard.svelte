<script>
  import { onMount } from 'svelte';

  let word = $state('Haus');
  let translation = $state('House');
  let examples = $state(['Das Haus ist groß.', 'Ich wohne in einem kleinen Haus.']);

  $: revealed = $derived(false);
  $: currentExample = $derived(examples[0]);

  function toggleReveal() {
    revealed = !revealed;
  }

  function cycleExample() {
    const currentIndex = examples.indexOf(currentExample);
    const nextIndex = (currentIndex + 1) % examples.length;
    currentExample = examples[nextIndex];
  }

  onMount(() => {
    console.log('VocabularyCard component mounted');
  });
</script>

<div class="vocabulary-card" on:click={toggleReveal}>
  <h2 class="word">{word}</h2>
  {#if revealed}
    <div class="translation-container">
      <p class="translation">{translation}</p>
      <p class="example">{currentExample}</p>
      <button on:click|stopPropagation={cycleExample} class="example-button">
        Next Example
      </button>
    </div>
  {/if}
</div>

<style>
  .vocabulary-card {
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin: 1rem 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .vocabulary-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .word {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2563eb;
  }

  .translation-container {
    margin-top: 1rem;
  }

  .translation {
    font-size: 1.2rem;
    color: #1e40af;
  }

  .example {
    font-style: italic;
    color: #4b5563;
    margin: 0.5rem 0;
  }

  .example-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .example-button:hover {
    background-color: #2563eb;
  }
</style>
