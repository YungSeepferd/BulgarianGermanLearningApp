<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item }: { item: VocabularyItem } = $props();

  const etymology = $derived(item.etymology || item.metadata?.etymology || '');
  
  const components = $derived.by(() => {
    if (item.literalBreakdown) {
      return item.literalBreakdown.map(c => ({
        part: c.segment,
        meaning: c.literal,
        note: c.grammarTag
      }));
    }
    if (item.metadata?.components) {
      return item.metadata.components.map(c => ({
        part: c.part,
        meaning: c.meaning,
        note: ''
      }));
    }
    return [];
  });

  const contextualNuance = $derived((item as any).contextualNuance || (item as any).metadata?.contextualNuance || '');

  const hasData = $derived(!!etymology || components.length > 0 || !!contextualNuance);
</script>

<div class="etymology-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Wortanalyse' : 'Анализ на думата'}>
  {#if hasData}
    <!-- Etymology -->
    {#if etymology}
      <section class="etymology-section">
        <h4 class="section-title">
          {appState.languageMode === 'DE_BG' ? '📜 Etymologie & Ursprung' : '📜 Етимология и произход'}
        </h4>
        <div class="etymology-content">
          <p class="etymology-text">{etymology}</p>
        </div>
      </section>
    {/if}

    <!-- Word Breakdown / Components -->
    {#if components.length > 0}
      <section class="breakdown-section">
        <h4 class="section-title">
          {appState.languageMode === 'DE_BG' ? '🔍 Wort-Zerlegung' : '🔍 Разделяне на думата'}
        </h4>
        <p class="section-description">
          {appState.languageMode === 'DE_BG' 
            ? 'Wie setzt sich dieses Wort zusammen?' 
            : 'Как се съставя тази дума?'}
        </p>
        <div class="component-list">
          {#each components as component}
            <div class="component-card">
              <div class="component-part">
                {component.part}
              </div>
              <div class="component-arrow" aria-hidden="true">→</div>
              <div class="component-meaning">
                {component.meaning}
              </div>
              {#if component.note}
                <div class="component-note">
                  {component.note}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Contextual Nuance -->
    {#if contextualNuance}
      <section class="nuance-section">
        <h4 class="section-title">
          {appState.languageMode === 'DE_BG' ? '💡 Verwendungshinweise' : '💡 Указания за употреба'}
        </h4>
        <div class="nuance-content">
          <p class="nuance-text">{contextualNuance}</p>
        </div>
      </section>
    {/if}
  {:else}
    <div class="no-data-container">
      <p class="no-data">
        {appState.languageMode === 'DE_BG' 
          ? 'Keine Wortanalyse-Daten verfügbar' 
          : 'Няма налични данни за анализ'}
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
  .etymology-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .etymology-section,
  .breakdown-section,
  .nuance-section {
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

  .etymology-content,
  .nuance-content {
    padding: var(--space-3);
    background: white;
    border-radius: var(--border-radius-md);
    border-left: 4px solid var(--color-primary);
  }

  .etymology-text,
  .nuance-text {
    margin: 0;
    line-height: 1.7;
    color: var(--color-neutral-dark);
    font-size: var(--text-md);
  }

  .component-list {
    display: grid;
    gap: var(--space-3);
  }

  .component-card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    background: white;
    transition: all 0.2s ease;
  }

  .component-card:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-primary);
  }

  .component-part {
    font-weight: var(--font-bold);
    color: var(--color-primary);
    font-size: var(--text-lg);
  }

  .component-arrow {
    color: var(--color-neutral-text);
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
  }

  .component-meaning {
    color: var(--color-neutral-dark);
    font-size: var(--text-md);
    font-weight: var(--font-medium);
  }

  .component-note {
    grid-column: 1 / -1;
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    font-style: italic;
    padding-top: var(--space-2);
    border-top: 1px dashed var(--color-neutral-border);
    margin-top: var(--space-2);
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

  @media (max-width: var(--breakpoint-md)) {
    .component-card {
      grid-template-columns: 1fr;
      gap: var(--space-2);
      text-align: center;
    }

    .component-arrow {
      transform: rotate(90deg);
    }

    .component-note {
      grid-column: 1;
    }
  }
</style>
