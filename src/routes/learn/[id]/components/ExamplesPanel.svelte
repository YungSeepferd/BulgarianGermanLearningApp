<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import ExampleCarousel from '$lib/components/vocabulary/ExampleCarousel.svelte';

  let { item }: { item: VocabularyItem } = $props();

  // Type-safe derived values with proper guards
  const exampleSentences = $derived.by(() => {
    // Prioritize top-level examples (Unified Schema)
    if (item.examples && item.examples.length > 0) {
      return item.examples.map((ex) => ({
        source: ex.german,
        target: ex.bulgarian,
        context: ex.context
      }));
    }

    const legacy = (item as any).examples;

    if (legacy && Array.isArray(legacy)) {
      return legacy.map((ex: any) => ({
        source: ex.german || ex.source || '',
        target: ex.bulgarian || ex.target || '',
        context: ex.context
      }));
    }

    if (Array.isArray(legacy)) {
      return legacy.map((ex: any) => ({
        source: ex.german || ex.source || ex.de || '',
        target: ex.bulgarian || ex.target || ex.bg || '',
        context: ex.context
      }));
    }

    return [];
  });

  const hasExamples = $derived(exampleSentences.length > 0);
</script>

<div class="examples-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Beispielsätze' : 'Примерни изречения'}>
  {#if hasExamples}
    <section class="examples-section">
      <h4 class="section-title">
        {appState.languageMode === 'DE_BG' ? '� Beispielsätze' : '💡 Примерни изречения'}
      </h4>
      <p class="section-description">
        {appState.languageMode === 'DE_BG' 
          ? 'Lernen Sie das Wort in verschiedenen Kontexten kennen' 
          : 'Научете думата в различни контексти'}
      </p>
      
      <ExampleCarousel {item} />
      
    </section>
  {:else}
    <div class="no-data-container">
      <p class="no-data">
        {appState.languageMode === 'DE_BG' 
          ? 'Noch keine Beispielsätze verfügbar' 
          : 'Все още няма налични примери'}
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
  .examples-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .examples-section {
    background: var(--color-neutral-light);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-card);
  }

  .section-title {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
  }

  .section-description {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    line-height: 1.5;
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
