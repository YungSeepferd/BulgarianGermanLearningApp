<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item }: { item: VocabularyItem } = $props();

  const dirArrow = $derived(appState.languageMode === 'DE_BG' ? '→' : '←');

  // Type-safe derived values with proper guards
  const exampleSentences = $derived.by(() => {
    const metadata = item.metadata;
    const legacy = (item as any).examples;

    if (metadata?.examples) {
      return metadata.examples.map((ex) => ({
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
        {appState.languageMode === 'DE_BG' ? '💬 Beispielsätze' : '💬 Примерни изречения'}
      </h4>
      <p class="section-description">
        {appState.languageMode === 'DE_BG' 
          ? 'Lernen Sie das Wort in verschiedenen Kontexten kennen' 
          : 'Научете думата в различни контексти'}
      </p>
      <ul class="example-list" role="list">
        {#each exampleSentences as ex, index}
          <li class="example-card">
            <div class="example-number" aria-label={appState.languageMode === 'DE_BG' ? `Beispiel ${index + 1}` : `Пример ${index + 1}`}>
              {index + 1}
            </div>
            <div class="example-content">
              <div class="example-row">
                <span class="example-src">{ex.source}</span>
              </div>
              <div class="example-divider" aria-hidden="true">
                <span class="example-arrow">{dirArrow}</span>
              </div>
              <div class="example-row">
                <span class="example-tgt">{ex.target}</span>
              </div>
              {#if ex.context}
                <div class="example-context">
                  <span class="context-icon" aria-hidden="true">ℹ️</span>
                  <span class="context-text">{ex.context}</span>
                </div>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
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
  }

  .section-title {
    margin: 0 0 var(--space-1) 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
  }

  .section-description {
    margin: 0 0 var(--space-4) 0;
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    line-height: 1.5;
  }

  .example-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--space-3);
  }

  .example-card {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    background: white;
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    transition: all 0.2s ease;
  }

  .example-card:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-primary);
  }

  .example-number {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    font-weight: var(--font-bold);
    font-size: var(--text-sm);
  }

  .example-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .example-row {
    font-size: var(--text-md);
    line-height: 1.6;
    color: var(--color-neutral-dark);
  }

  .example-src {
    font-weight: var(--font-medium);
  }

  .example-tgt {
    color: var(--color-primary-darker);
  }

  .example-divider {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .example-divider::before,
  .example-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-neutral-border);
  }

  .example-arrow {
    color: var(--color-neutral-text);
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
  }

  .example-context {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2);
    background: var(--color-info-light);
    border-radius: var(--border-radius-sm);
    margin-top: var(--space-1);
  }

  .context-icon {
    flex-shrink: 0;
  }

  .context-text {
    font-size: var(--text-sm);
    color: var(--color-info-dark);
    font-style: italic;
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

  @media (max-width: 768px) {
    .example-card {
      flex-direction: column;
    }

    .example-number {
      align-self: flex-start;
    }
  }
</style>
