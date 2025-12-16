<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import GrammarTabs from '$lib/components/vocabulary/GrammarTabs.svelte';
  import ConjugationTable from './ConjugationTable.svelte';

  let { item }: { item: VocabularyItem } = $props();

  const isNoun = $derived(item.partOfSpeech === 'noun');
  const isVerb = $derived(item.partOfSpeech === 'verb');

  const article = $derived(null); // Article is not stored in new schema, derived from gender usually
  const gender = $derived(item.grammar?.gender || null);
  const pluralForm = $derived(item.grammar?.pluralForm || null);

  const genderLabel = $derived.by(() => {
    if (!gender) return null;
    const isDE = appState.languageMode === 'DE_BG';
    const labels: Record<string, { de: string; bg: string }> = {
      masculine: { de: 'maskulin', bg: 'мъжки род' },
      feminine: { de: 'feminin', bg: 'женски род' },
      neuter: { de: 'neutral', bg: 'среден род' }
    };
    return labels[gender]?.[isDE ? 'de' : 'bg'] || gender;
  });
</script>

<div class="grammar-panel" role="region" aria-label={appState.languageMode === 'DE_BG' ? 'Grammatik' : 'Граматика'}>
  <!-- Basic Properties -->
  <section class="grammar-section">
    <h3 class="section-title">
      {appState.languageMode === 'DE_BG' ? 'Grundeigenschaften' : 'Основни свойства'}
    </h3>
    <div class="property-grid">
      {#if article}
        <div class="property-card">
          <span class="property-label">
            {appState.languageMode === 'DE_BG' ? 'Artikel' : 'Член'}
          </span>
          <span class="property-value">{article}</span>
        </div>
      {/if}
      {#if genderLabel}
        <div class="property-card">
          <span class="property-label">
            {appState.languageMode === 'DE_BG' ? 'Genus' : 'Род'}
          </span>
          <span class="property-value">{genderLabel}</span>
        </div>
      {/if}
      {#if pluralForm}
        <div class="property-card">
          <span class="property-label">
            {appState.languageMode === 'DE_BG' ? 'Plural' : 'Множествено число'}
          </span>
          <span class="property-value">{pluralForm}</span>
        </div>
      {/if}
      <div class="property-card">
        <span class="property-label">
          {appState.languageMode === 'DE_BG' ? 'Wortart' : 'Част на речта'}
        </span>
        <span class="property-value">{item.partOfSpeech}</span>
      </div>
    </div>
  </section>

  <!-- Noun Declension -->
  {#if isNoun}
    <section class="grammar-section">
      <h3 class="section-title">
        {appState.languageMode === 'DE_BG' ? 'Deklination' : 'Склонение'}
      </h3>
      <GrammarTabs {item} />
    </section>
  {/if}

  <!-- Verb Conjugation -->
  {#if isVerb}
    <section class="grammar-section">
      <h3 class="section-title">
        {appState.languageMode === 'DE_BG' ? 'Konjugation' : 'Спрежение'}
      </h3>
      <ConjugationTable {item} />
    </section>
  {/if}

  <!-- Adjective Comparison (if data available) -->
  <!-- 
  {#if isAdjective && (item as any).metadata?.comparativeForms}
    <section class="grammar-section">
      <h3 class="section-title">
        {appState.languageMode === 'DE_BG' ? 'Steigerung' : 'Степенуване'}
      </h3>
      <div class="comparison-grid">
        <div class="comparison-card">
          <span class="comparison-label">Positiv</span>
          <span class="comparison-value">{item.german}</span>
        </div>
        {#if (item as any).metadata.comparativeForms.comparative}
          <div class="comparison-card">
            <span class="comparison-label">Komparativ</span>
            <span class="comparison-value">{(item as any).metadata.comparativeForms.comparative}</span>
          </div>
        {/if}
        {#if (item as any).metadata.comparativeForms.superlative}
          <div class="comparison-card">
            <span class="comparison-label">Superlativ</span>
            <span class="comparison-value">{(item as any).metadata.comparativeForms.superlative}</span>
          </div>
        {/if}
      </div>
    </section>
  {/if}
  -->

  <!-- Grammar Notes -->
  {#if item.metadata?.notes || (item as any).notes?.linguistic}
    <section class="grammar-section">
      <h3 class="section-title">
        {appState.languageMode === 'DE_BG' ? 'Grammatikalische Hinweise' : 'Граматически бележки'}
      </h3>
      <div class="notes-content">
        {#if item.metadata?.notes}
          <p>{item.metadata.notes}</p>
        {/if}
        {#if (item as any).notes?.linguistic}
          <p>{(item as any).notes.linguistic}</p>
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .grammar-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .grammar-section {
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

  .property-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3);
  }

  .property-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    background: white;
  }

  .property-label {
    font-size: var(--text-xs);
    color: var(--color-neutral-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: var(--font-medium);
  }

  .property-value {
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
    font-weight: var(--font-semibold);
  }



  .notes-content {
    padding: var(--space-3);
    background: white;
    border-radius: var(--border-radius-md);
    border: 1px dashed var(--color-neutral-border);
  }

  .notes-content p {
    margin: 0;
    line-height: 1.6;
    color: var(--color-neutral-dark);
  }

  .notes-content p + p {
    margin-top: var(--space-2);
  }

  @media (max-width: var(--breakpoint-md)) {
    .property-grid {
      grid-template-columns: 1fr;
    }


  }
</style>
