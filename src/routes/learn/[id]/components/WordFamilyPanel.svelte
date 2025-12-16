<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item }: { item: VocabularyItem } = $props();

  const synonyms = $derived(item.synonyms || []);
  const antonyms = $derived(item.antonyms || []);
  const relatedWords = $derived(item.relatedWords || []);

  const hasData = $derived(synonyms.length > 0 || antonyms.length > 0 || relatedWords.length > 0);
</script>

<div class="word-family-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Wortfamilie' : 'Семейство думи'}>
  {#if hasData}
    {#if synonyms.length > 0}
      <section class="family-section">
        <h4 class="family-title">
          {appState.languageMode === 'DE_BG' ? '✓ Synonyme' : '✓ Синоними'}
        </h4>
        <p class="family-description">
          {appState.languageMode === 'DE_BG' 
            ? 'Wörter mit ähnlicher Bedeutung' 
            : 'Думи със сходно значение'}
        </p>
        <ul class="word-list" role="list">
          {#each synonyms as word}
            <li class="word-tag synonym">{word}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if antonyms.length > 0}
      <section class="family-section">
        <h4 class="family-title">
          {appState.languageMode === 'DE_BG' ? '⇄ Antonyme' : '⇄ Антоними'}
        </h4>
        <p class="family-description">
          {appState.languageMode === 'DE_BG' 
            ? 'Wörter mit gegenteiliger Bedeutung' 
            : 'Думи с противоположно значение'}
        </p>
        <ul class="word-list" role="list">
          {#each antonyms as word}
            <li class="word-tag antonym">{word}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if relatedWords.length > 0}
      <section class="family-section">
        <h4 class="family-title">
          {appState.languageMode === 'DE_BG' ? '🔗 Verwandte Wörter' : '🔗 Свързани думи'}
        </h4>
        <p class="family-description">
          {appState.languageMode === 'DE_BG' 
            ? 'Zusammenhängende Begriffe und Wortbildungen' 
            : 'Свързани понятия и словообразувания'}
        </p>
        <ul class="word-list" role="list">
          {#each relatedWords as word}
            <li class="word-tag related">{word}</li>
          {/each}
        </ul>
      </section>
    {/if}
  {:else}
    <div class="no-data-container">
      <p class="no-data">
        {appState.languageMode === 'DE_BG' 
          ? 'Keine Wortfamilien-Daten verfügbar' 
          : 'Няма налични данни за семейство думи'}
      </p>
      <p class="no-data-hint">
        {appState.languageMode === 'DE_BG' 
          ? 'Diese Information wird mit zukünftigen Updates ergänzt.' 
          : 'Тази информация ще бъде допълнена с бъдещи актуализации.'}
      </p>
    </div>
  {/if}
</div>

<style>
  .word-family-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .family-section {
    background: var(--color-neutral-light);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-card);
  }

  .family-title {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
  }

  .family-description {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    line-height: 1.5;
  }

  .word-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .word-tag {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--border-radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: all 0.2s ease;
  }

  .word-tag:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-card);
  }

  .word-tag.synonym {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    color: #155724;
    border: 1px solid #b1dfbb;
  }

  .word-tag.antonym {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    color: #721c24;
    border: 1px solid #f1b0b7;
  }

  .word-tag.related {
    background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
    color: #0c5460;
    border: 1px solid #abdde5;
  }

  .no-data-container {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    background: var(--color-neutral-light);
    border: 1px dashed var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
  }

  .no-data {
    color: var(--color-neutral-text);
    font-style: italic;
    margin: 0;
    font-size: var(--text-md);
  }

  .no-data-hint {
    color: var(--color-neutral-text);
    font-size: var(--text-sm);
    margin: var(--space-2) 0 0 0;
  }
</style>
