<script lang="ts">
  import { onMount } from 'svelte';
  import SearchList from '$lib/components/SearchList.svelte';
  import TestCard from '$lib/components/TestCard.svelte';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import type { VocabularyCategory } from '$lib/schemas/vocabulary';

  // State management with Svelte 5 Runes
  let vocabularyItems = $state<VocabularyItem[]>([]);
  let searchTerm = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedCategory = $state<VocabularyCategory | 'all'>('all');
  let selectedDifficulty = $state<number | null>(null);
  let selectedPartOfSpeech = $state<string | null>(null);
  let selectedLearningPhase = $state<number | null>(null);
  let currentPage = $state(0);
  const ITEMS_PER_PAGE = 20;
  let selectedItems = $state(new Set<string>());
 
  // Categories for filtering
  const categories: VocabularyCategory[] = [
    'greetings', 'numbers', 'family', 'food', 'colors', 'animals',
    'body', 'clothing', 'house', 'nature', 'transport', 'technology',
    'time', 'weather', 'professions', 'places', 'grammar', 'culture',
    'common_phrases'
  ];

  // Difficulty levels
  const difficultyLevels = [1, 2, 3, 4, 5];

  // Parts of speech for filtering
  const partsOfSpeech = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun',
    'preposition', 'conjunction', 'interjection', 'article', 'number', 'phrase'
  ];
  
  const learningPhases = [
    { value: 0, label: 'Not Started' },
    { value: 1, label: 'Phase 1: New' },
    { value: 2, label: 'Phase 2: Learning' },
    { value: 3, label: 'Phase 3: Familiar' },
    { value: 4, label: 'Phase 4: Known' },
    { value: 5, label: 'Phase 5: Mastered' },
    { value: 6, label: 'Phase 6: Expert' }
  ];
 
  // Helper to filter all items based on current UI state
  function filterItems(all: VocabularyItem[]) {
    return all.filter((item) => {
      const q = (searchTerm || '').toLowerCase();
      const queryMatch = q
        ? item.german.toLowerCase().includes(q) ||
          item.bulgarian.toLowerCase().includes(q) ||
          (item.tags || []).some(tag => tag.toLowerCase().includes(q))
        : true;
      const posMatch = selectedPartOfSpeech ? item.partOfSpeech === selectedPartOfSpeech : true;
      const diffMatch = selectedDifficulty != null ? Math.round(item.difficulty) === selectedDifficulty : true;
        const catMatch = selectedCategory !== 'all' ? item.categories.includes(selectedCategory as VocabularyCategory) : true;
      // learningPhase not present in app type; ignore for now
      return queryMatch && posMatch && diffMatch && catMatch;
    });
  }

  // Fetch vocabulary data with filters
  async function loadVocabulary() {
    try {
      loading = true;
      error = null;

      await vocabularyDb.initialize();
      const all = vocabularyDb.getVocabulary();
      const offset = currentPage * ITEMS_PER_PAGE;

      const filtered = filterItems(all);

      hasMore = offset + ITEMS_PER_PAGE < filtered.length;
      vocabularyItems = filtered.slice(offset, offset + ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
      error = 'Failed to load vocabulary data. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Handle item selection for practice
  function handleSelectItem(item: VocabularyItem) {
    appState.startPracticeSession(item);
  }

  function handleToggleSelectItem(itemId: string) {
    if (selectedItems.has(itemId)) {
      selectedItems.delete(itemId);
    } else {
      selectedItems.add(itemId);
    }
  }

  function startPracticeWithSelected() {
    const itemsToPractice = vocabularyItems.filter(item => selectedItems.has(item.id));
    const firstItem = itemsToPractice[0];
    if (firstItem) {
      // Start practice with the first selected item
      appState.startPracticeSession(firstItem);
      selectedItems.clear();
    }
  }

  // Handle search input changes
  $effect(() => {
    currentPage = 0; // Reset to first page on new search
    loadVocabulary();
  });

  // Handle filter changes
  $effect(() => {
    if (selectedCategory || selectedDifficulty || selectedPartOfSpeech || selectedLearningPhase) {
      currentPage = 0; // Reset to first page on filter change
      loadVocabulary();
    }
  });

  // Initialize on component mount
  onMount(async () => {
    await loadVocabulary();
  });

  // Load more items
  let hasMore = $state(false);
  async function loadMore() {
    if (!hasMore) return;

    currentPage++;
    try {
      loading = true;
      await vocabularyDb.initialize();
      const all = vocabularyDb.getVocabulary();
      const offset = currentPage * ITEMS_PER_PAGE;
      const filtered = filterItems(all);
      hasMore = offset + ITEMS_PER_PAGE < filtered.length;
      const nextSlice = filtered.slice(offset, offset + ITEMS_PER_PAGE);
      vocabularyItems = [...vocabularyItems, ...nextSlice];
    } catch (err) {
      console.error('Failed to load more vocabulary:', err);
    } finally {
      loading = false;
    }
  }

  // Reset all filters
  function resetFilters() {
    searchTerm = '';
    selectedCategory = 'all';
    selectedDifficulty = null;
    selectedPartOfSpeech = null;
    selectedLearningPhase = null;
  }

  // Get direction for SearchList component
  let direction = $derived<'DE->BG' | 'BG->DE'>(
    appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE'
  );
</script>

<h1 class="page-title">Bulgarian Vocabulary</h1>

<div class="vocabulary-grid">
  <!-- Header card -->
  <TestCard
    title="Vocabulary"
    content="Learn essential Bulgarian words and phrases with rich context"
    showShadow
    link="#"
  />

  <!-- Search and filters -->
  <div class="search-filters-container">
    <!-- Search bar -->
    <div class="search-container">
      <input
        type="search"
        placeholder="Search vocabulary..."
        bind:value={searchTerm}
        class="search-input"
        aria-label="Search vocabulary"
      />
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <!-- Category filter -->
      <div class="filter-group">
        <label for="category-filter" class="filter-label">Category</label>
        <select id="category-filter" bind:value={selectedCategory} class="filter-select">
          <option value="all">All Categories</option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
      </div>

      <!-- Difficulty filter -->
      <div class="filter-group">
        <label for="difficulty-filter" class="filter-label">Difficulty</label>
        <select id="difficulty-filter" bind:value={selectedDifficulty} class="filter-select">
          <option value={null}>All Difficulties</option>
          {#each difficultyLevels as level}
            <option value={level}>{level}</option>
          {/each}
        </select>
      </div>

      <!-- Part of speech filter -->
      <div class="filter-group">
        <label for="pos-filter" class="filter-label">Part of Speech</label>
        <select id="pos-filter" bind:value={selectedPartOfSpeech} class="filter-select">
          <option value={null}>All Types</option>
          {#each partsOfSpeech as pos}
            <option value={pos}>{pos}</option>
          {/each}
        </select>
      </div>

      <!-- Learning Phase filter -->
      <div class="filter-group">
        <label for="learning-phase-filter" class="filter-label">Learning Phase</label>
        <select id="learning-phase-filter" bind:value={selectedLearningPhase} class="filter-select">
          <option value={null}>All Phases</option>
          {#each learningPhases as phase}
            <option value={phase.value}>{phase.label}</option>
          {/each}
        </select>
      </div>
 
      <!-- Reset button -->
      <button class="reset-btn" onclick={resetFilters}>
        Reset Filters
      </button>

      <button class="practice-selected-btn" onclick={startPracticeWithSelected} disabled={selectedItems.size === 0}>
        Practice Selected ({selectedItems.size})
      </button>
    </div>
  </div>

  <!-- Loading and error states -->
  {#if loading && vocabularyItems.length === 0}
    <div class="loading-state">
      <div class="spinner">🌀</div>
      <p>Loading vocabulary...</p>
    </div>
  {:else if error}
    <div class="error-state" role="alert">
      <span class="error-icon">⚠️</span>
      <p>{error}</p>
    </div>
  {:else if vocabularyItems.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No vocabulary found</h3>
      <p>Try adjusting your search or filters</p>
    </div>
  {/if}

  <!-- Search results -->
  {#if vocabularyItems.length > 0}
    <div class="search-results-container">
      <SearchList
        items={vocabularyItems}
        direction={direction}
        onSelectItem={handleSelectItem}
        onToggleSelectItem={handleToggleSelectItem}
        selectedItems={selectedItems}
        showQuickPractice={true}
      />

      <!-- Load more button -->
      {#if hasMore}
        <div class="load-more-container">
          <button
            onclick={loadMore}
            disabled={loading}
            class="load-more-btn"
            aria-label={loading ? 'Loading more vocabulary' : 'Load more vocabulary'}
          >
            {loading ? 'Loading...' : 'Load More Vocabulary'}
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Enhanced CSS with responsive design -->
<style>
  .vocabulary-grid {
    display: grid;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
    text-align: center;
  }

  .search-filters-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .search-container {
    margin: 0.5rem 0;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
  }

  .filters-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
  }

  .filter-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9rem;
    background-color: white;
    transition: border-color 0.2s ease;
  }

  .filter-select:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }

  .reset-btn {
    padding: 0.5rem 1rem;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-self: end;
    margin-top: auto;
  }

  .reset-btn:hover {
    background-color: #5a6268;
  }

  .practice-selected-btn {
    padding: 0.5rem 1rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-self: end;
  }

  .practice-selected-btn:hover:not(:disabled) {
    background-color: #218838;
  }

  .practice-selected-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
 
  .loading-state, .empty-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: #6c757d;
    gap: 1rem;
  }

  .spinner {
    font-size: 2rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .error-icon {
    font-size: 2rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .search-results-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .load-more-btn {
    padding: 0.75rem 1.5rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }

  .load-more-btn:hover:not(:disabled) {
    background-color: #3367d6;
    transform: translateY(-1px);
  }

  .load-more-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .vocabulary-grid {
      padding: 0.5rem;
    }

    .filters-container {
      grid-template-columns: 1fr;
    }

    .search-filters-container {
      padding: 1rem;
    }

    .filter-select {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 1.5rem;
    }

    .filters-container {
      gap: 0.75rem;
    }
  }
</style>