<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item, exampleSentences = [], alternatives = [] } = $props<{ 
    item: VocabularyItem,
    exampleSentences?: Array<{ source: string; target: string; context?: string | undefined }>,
    alternatives?: string[]
  }>();

  const dirArrow = $derived(appState.languageMode === 'DE_BG' ? '→' : '←');
</script>

<section class="panel overview-panel">
  <div class="panel__header">
    <h3>{appState.languageMode === 'DE_BG' ? '� Schnellübersicht' : '📊 Бърз преглед'}</h3>
  </div>
  <div class="overview-grid">
    <!-- Quick properties -->
    <div class="overview-section">
      <h4 class="section-title">
        {appState.languageMode === 'DE_BG' ? 'Grundinformationen' : 'Основна информация'}
      </h4>
      <div class="property-list">
        <div class="property-item">
          <span class="property-label">
            {appState.languageMode === 'DE_BG' ? 'Wortart' : 'Част на речта'}
          </span>
          <span class="property-value">{item.partOfSpeech}</span>
        </div>
        {#if item.cefrLevel}
          <div class="property-item">
            <span class="property-label">CEFR</span>
            <span class="property-value badge-inline badge--cefr">{item.cefrLevel}</span>
          </div>
        {/if}
        {#if item.categories?.length}
          <div class="property-item">
            <span class="property-label">
              {appState.languageMode === 'DE_BG' ? 'Kategorien' : 'Категории'}
            </span>
            <span class="property-value">{item.categories.slice(0, 3).join(', ')}</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Quick examples -->
    {#if exampleSentences.length > 0}
      <div class="overview-section">
        <h4 class="section-title">
          {appState.languageMode === 'DE_BG' ? 'Top-Beispiele' : 'Топ примери'}
        </h4>
        <ul class="example-list-compact">
          {#each exampleSentences.slice(0, 3) as ex}
            <li class="example-row-compact">
              <span class="example-src-compact">{ex.source}</span>
              <span class="example-arrow-compact" aria-hidden="true">{dirArrow}</span>
              <span class="example-tgt-compact">{ex.target}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Quick alternatives -->
    {#if alternatives.length > 0}
      <div class="overview-section">
        <h4 class="section-title">
          {appState.languageMode === 'DE_BG' ? 'Verwandte Formen' : 'Свързани форми'}
        </h4>
        <div class="tag-list">
          {#each alternatives.slice(0, 5) as alt}
            <span class="tag">{alt}</span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  /* Panel styles */
  .panel { 
    border: 1px solid var(--color-neutral-border); 
    border-radius: var(--border-radius-xl); 
    background: var(--color-neutral-light); 
    padding: var(--space-5); 
    box-shadow: var(--shadow-card); 
  }

  .panel__header h3 { 
    margin: 0 0 var(--space-4) 0; 
    font-size: var(--text-xl); 
    font-weight: var(--font-bold);
    color: var(--color-neutral-dark);
  }

  /* Overview panel specific styles */
  .overview-panel {
    background: linear-gradient(135deg, var(--color-neutral-light) 0%, white 100%);
  }

  .overview-grid {
    display: grid;
    gap: var(--space-5);
  }

  .overview-section {
    background: white;
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-4);
  }

  .section-title {
    margin: 0 0 var(--space-3) 0;
    font-size: var(--text-md);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-dark);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-neutral-border);
  }

  .property-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .property-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2);
    border-radius: var(--border-radius-md);
    background: var(--color-neutral-light);
  }

  .property-label {
    font-size: var(--text-sm);
    color: var(--color-neutral-text);
    font-weight: var(--font-medium);
  }

  .property-value {
    font-size: var(--text-sm);
    color: var(--color-neutral-dark);
    font-weight: var(--font-semibold);
  }

  .badge-inline {
    padding: var(--space-1) var(--space-2);
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
  }
  
  .badge--cefr { 
    background: var(--color-warning-light); 
    border-color: var(--color-warning); 
    border: 1px solid var(--color-warning);
  }

  /* Compact example styles for overview */
  .example-list-compact {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .example-row-compact {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-2);
    align-items: center;
    font-size: var(--text-sm);
    padding: var(--space-2);
    background: var(--color-neutral-light);
    border-radius: var(--border-radius-sm);
  }

  .example-src-compact {
    font-weight: var(--font-medium);
    color: var(--color-neutral-dark);
  }

  .example-tgt-compact {
    color: var(--color-primary-darker);
  }

  .example-arrow-compact {
    color: var(--color-neutral-text);
    font-size: var(--text-xs);
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tag {
    padding: var(--space-1) var(--space-2);
    background: var(--color-neutral-light);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-sm);
    font-size: var(--text-sm);
    color: var(--color-neutral-dark);
  }

  @media (max-width: var(--breakpoint-md)) {
    .overview-grid {
      grid-template-columns: 1fr;
    }

    .example-row-compact {
      grid-template-columns: 1fr;
      gap: var(--space-1);
      text-align: center;
    }

    .example-arrow-compact {
      transform: rotate(90deg);
      margin: var(--space-1) 0;
    }
  }
</style>
