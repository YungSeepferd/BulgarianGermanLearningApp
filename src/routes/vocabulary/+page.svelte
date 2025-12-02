<script lang="ts">
  import TestCard from '$lib/components/TestCard.svelte';

  // Store vocabulary items using $state
  let vocabularyItems = $state([
    { word: "Apple", translation: "Ябълка" },
    { word: "Banana", translation: "Банан" },
    { word: "Cherry", translation: "Череша" },
    { word: "Orange", translation: "Портокал" }
  ]);

  // Search functionality using reactive state
  let searchTerm = $state('');

  // Derived filtered vocabulary using $derived
  let filteredVocabulary = $derived(
    searchTerm.length > 0
      ? vocabularyItems.filter(item =>
          item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.translation.toLowerCase().includes(searchTerm.toLowerCase()))
      : vocabularyItems
  );

  // Add effects using $effect
  $effect(() => {
    // eslint-disable-next-line no-console
    console.log(`Searching for: ${searchTerm}`);
  });

  // Example of data fetching with onMount and $state
  let loading = $state(true);

  // Fetch more vocabulary data (example)
  async function fetchMoreData() {
    loading = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    vocabularyItems = [
      ...vocabularyItems,
      { word: "Grapes", translation: "Грозде" },
      { word: "Peach", translation: "Праскова" }
    ];
    loading = false;
  }
</script>

<h1>Bulgarian Vocabulary</h1>

<div class="page-grid">
  <!-- First test card -->
  <TestCard
    title="Vocabulary"
    content="Learn essential Bulgarian words and phrases"
    showShadow
    link="#"
  />

  <!-- Search bar -->
  <div class="search-container">
    <input
      type="search"
      placeholder="Search vocabulary..."
      bind:value={searchTerm}
      class="search-input"
    />
  </div>

  <!-- Vocabulary list -->
  {#if filteredVocabulary.length > 0}
    <ul class="vocabulary-list">
      {#each filteredVocabulary as { word, translation }}
        <li class="vocabulary-item">
          <span class="word">{word}</span>
          <span class="translation">{translation}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="no-results">No vocabulary items match your search.</div>
  {/if}

  <!-- Example button with click event converted to standard attribute -->
  <button onclick={fetchMoreData} disabled={loading}>
    {loading ? 'Loading...' : 'Load More Vocabulary'}
  </button>
</div>

<!-- CSS using scoped styles -->
<style>
  .page-grid {
    display: grid;
    gap: 1rem;
  }

  .search-container {
    margin: 1rem 0;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .vocabulary-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .vocabulary-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .vocabulary-item:hover {
    background-color: #e9e9e9;
  }

  .word {
    font-weight: 600;
    color: #333;
  }

  .translation {
    color: #666;
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: #666;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>