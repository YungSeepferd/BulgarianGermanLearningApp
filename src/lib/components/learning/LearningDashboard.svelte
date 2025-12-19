<script lang="ts">
  import { onMount } from 'svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import type { VocabularyProgress } from '$lib/types/progress';
  import { getVocabularyProgress } from '$lib/db/queries';
  import WordCard from './WordCard.svelte';
  import ProgressStats from './ProgressStats.svelte';
  import ExampleCard from './ExampleCard.svelte';
  import GrammarInfo from './GrammarInfo.svelte';

  interface Props {
    item: VocabularyItem;
  }

  let { item }: Props = $props();

  // Reactive state with Svelte 5 runes
  let progress = $state<VocabularyProgress | undefined>();
  let loading = $state(true);
  let error = $state<string | undefined>();
  let activeTab = $state<'overview' | 'exercises' | 'grammar' | 'edit'>('overview');

  // Load data from IndexedDB on mount
  onMount(async () => {
    try {
      loading = true;
      error = undefined;

      // Load vocabulary progress
      const vocabProgress = await getVocabularyProgress(item.id);
      progress = vocabProgress;

    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load progress data';
      console.error('Error loading dashboard data:', e);
    } finally {
      loading = false;
    }
  });

  // Tab navigation handler
  function selectTab(tab: typeof activeTab) {
    activeTab = tab;
  }
</script>

<div class="learning-dashboard">
  <!-- Header with word information -->
  <div class="dashboard-header">
    <WordCard {item} />
    {#if !loading && progress}
      <ProgressStats {progress} />
    {/if}
  </div>

  <!-- Tab Navigation -->
  <div class="tabs" role="tablist">
    <button
      role="tab"
      aria-selected={activeTab === 'overview'}
      class="tab"
      class:active={activeTab === 'overview'}
      onclick={() => selectTab('overview')}
    >
      Overview
    </button>
    <button
      role="tab"
      aria-selected={activeTab === 'exercises'}
      class="tab"
      class:active={activeTab === 'exercises'}
      onclick={() => selectTab('exercises')}
    >
      Exercises
    </button>
    <button
      role="tab"
      aria-selected={activeTab === 'grammar'}
      class="tab"
      class:active={activeTab === 'grammar'}
      onclick={() => selectTab('grammar')}
    >
      Grammar
    </button>
    <button
      role="tab"
      aria-selected={activeTab === 'edit'}
      class="tab"
      class:active={activeTab === 'edit'}
      onclick={() => selectTab('edit')}
    >
      Edit
    </button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content" role="tabpanel">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    {:else if error}
      <div class="error">
        <p>⚠️ {error}</p>
      </div>
    {:else}
      <!-- Overview Tab -->
      {#if activeTab === 'overview'}
        <div class="overview-panel">
          <section class="examples-section">
            <h3>Example Sentences</h3>
            {#if item.examples && item.examples.length > 0}
              <div class="examples-grid">
                {#each item.examples as example}
                  <ExampleCard {example} />
                {/each}
              </div>
            {:else}
              <p class="empty-state">No examples available yet.</p>
            {/if}
          </section>

          {#if item.culturalNotes}
            <section class="cultural-notes">
              <h3>Cultural Notes</h3>
              <p>{item.culturalNotes}</p>
            </section>
          {/if}

          {#if item.synonyms && item.synonyms.length > 0}
            <section class="synonyms">
              <h3>Synonyms</h3>
              <div class="synonym-list">
                {#each item.synonyms as synonym}
                  <span class="synonym-badge">{synonym}</span>
                {/each}
              </div>
            </section>
          {/if}
        </div>
      {/if}

      <!-- Exercises Tab -->
      {#if activeTab === 'exercises'}
        <div class="exercises-panel">
          <h3>Practice Exercises</h3>
          <p class="coming-soon">📚 Exercises coming in Phase 2</p>
          <div class="exercise-preview">
            <p>Future exercise types:</p>
            <ul>
              <li>Fill in the blank (Cloze)</li>
              <li>Sentence builder</li>
              <li>Multiple choice</li>
              <li>Typing practice</li>
              <li>Listening comprehension</li>
            </ul>
          </div>
        </div>
      {/if}

      <!-- Grammar Tab -->
      {#if activeTab === 'grammar'}
        <GrammarInfo {item} />
      {/if}

      <!-- Edit Tab -->
      {#if activeTab === 'edit'}
        <div class="edit-panel">
          <h3>Edit Word</h3>
          <p class="coming-soon">✏️ User editing coming in Phase 3</p>
          <p class="info">
            You'll be able to:
          </p>
          <ul>
            <li>Add your own examples</li>
            <li>Add personal notes</li>
            <li>Suggest corrections</li>
            <li>Add custom mnemonics</li>
          </ul>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .learning-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-4, 1rem);
  }

  .dashboard-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--spacing-4, 1rem);
    margin-bottom: var(--spacing-6, 1.5rem);
    align-items: start;
  }

  @media (max-width: 768px) {
    .dashboard-header {
      grid-template-columns: 1fr;
    }
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: var(--spacing-2, 0.5rem);
    border-bottom: 2px solid var(--color-border, #e5e7eb);
    margin-bottom: var(--spacing-4, 1rem);
    overflow-x: auto;
  }

  .tab {
    padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: var(--color-text-secondary, #6b7280);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab:hover {
    color: var(--color-text-primary, #111827);
    background-color: var(--color-bg-hover, #f9fafb);
  }

  .tab.active {
    color: var(--color-primary, #3b82f6);
    border-bottom-color: var(--color-primary, #3b82f6);
  }

  .tab:focus-visible {
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
  }

  /* Tab Content */
  .tab-content {
    min-height: 400px;
  }

  /* Loading & Error States */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-8, 2rem);
    gap: var(--spacing-4, 1rem);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border, #e5e7eb);
    border-top-color: var(--color-primary, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    padding: var(--spacing-4, 1rem);
    background-color: var(--color-error-bg, #fef2f2);
    border: 1px solid var(--color-error-border, #fecaca);
    border-radius: var(--radius-md, 0.375rem);
    color: var(--color-error-text, #991b1b);
  }

  /* Overview Panel */
  .overview-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-6, 1.5rem);
  }

  .examples-section h3,
  .cultural-notes h3,
  .synonyms h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: var(--spacing-4, 1rem);
    color: var(--color-text-primary, #111827);
  }

  .examples-grid {
    display: grid;
    gap: var(--spacing-4, 1rem);
  }

  .empty-state {
    padding: var(--spacing-6, 1.5rem);
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
    background-color: var(--color-bg-secondary, #f9fafb);
    border-radius: var(--radius-md, 0.375rem);
  }

  .cultural-notes {
    padding: var(--spacing-4, 1rem);
    background-color: var(--color-bg-tertiary, #eff6ff);
    border-left: 4px solid var(--color-primary, #3b82f6);
    border-radius: var(--radius-md, 0.375rem);
  }

  .cultural-notes p {
    color: var(--color-text-primary, #111827);
    line-height: 1.6;
  }

  .synonym-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2, 0.5rem);
  }

  .synonym-badge {
    padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    background-color: var(--color-bg-secondary, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  /* Exercises Panel */
  .exercises-panel,
  .edit-panel {
    padding: var(--spacing-6, 1.5rem);
  }

  .exercises-panel h3,
  .edit-panel h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-4, 1rem);
  }

  .coming-soon {
    font-size: 1.125rem;
    color: var(--color-text-secondary, #6b7280);
    margin-bottom: var(--spacing-4, 1rem);
  }

  .exercise-preview,
  .info {
    margin-top: var(--spacing-4, 1rem);
    padding: var(--spacing-4, 1rem);
    background-color: var(--color-bg-secondary, #f9fafb);
    border-radius: var(--radius-md, 0.375rem);
  }

  .exercise-preview ul,
  .edit-panel ul {
    margin-top: var(--spacing-2, 0.5rem);
    padding-left: var(--spacing-6, 1.5rem);
    color: var(--color-text-secondary, #6b7280);
  }

  .exercise-preview li,
  .edit-panel li {
    margin-bottom: var(--spacing-2, 0.5rem);
  }
</style>
