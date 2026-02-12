<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import DefiniteArticlePatterns from './DefiniteArticlePatterns.svelte';

  interface Props {
    item: VocabularyItem;
  }

  let { item }: Props = $props();

  // Gender display for nouns
  const genderInfo = $derived.by(() => {
    if (item.partOfSpeech === 'noun' && item.grammar?.gender) {
      const genderDetails: Record<string, { label: string; article: string; description: string; bulgarianArticle: string }> = {
        masculine: {
          label: 'Masculine',
          article: 'der',
          description: 'Masculine nouns typically end in consonants or -er',
          bulgarianArticle: 'мъжки род'
        },
        feminine: {
          label: 'Feminine',
          article: 'die',
          description: 'Feminine nouns often end in -e, -in, -ung, -heit, -keit',
          bulgarianArticle: 'женски род'
        },
        neuter: {
          label: 'Neuter',
          article: 'das',
          description: 'Neuter nouns often end in -chen, -lein, -um',
          bulgarianArticle: 'среден род'
        }
      };
      return genderDetails[item.grammar.gender] || null;
    }
    return null;
  });

  // Declension info for nouns
  const hasDeclension = $derived(
    item.partOfSpeech === 'noun' && item.grammar?.declension
  );

  // Verb aspect info
  const hasVerbAspect = $derived(
    item.partOfSpeech === 'verb' && item.grammar?.verbAspect
  );

  function getAspectInfo(aspect: string | null | undefined) {
    if (!aspect) return null;
    return aspect === 'perfective'
      ? { label: 'Perfective', bg: 'Свършен вид', symbol: '✓', desc: 'Completed, one-time action' }
      : { label: 'Imperfective', bg: 'Несвършен вид', symbol: '⟳', desc: 'Ongoing, habitual or repeated action' };
  }
</script>

<div class="grammar-info">
  <h3>Grammar Information</h3>

  <!-- Part of Speech -->
  <section class="grammar-section">
    <h4>Part of Speech</h4>
    <div class="info-card">
      <p class="part-of-speech">{item.partOfSpeech}</p>
    </div>
  </section>

  <!-- Gender (for nouns) -->
  {#if genderInfo}
    <section class="grammar-section">
      <h4>Gender & Article</h4>
      <div class="info-card gender-card">
        <div class="gender-header">
          <span class="article">{genderInfo.article}</span>
          <span class="gender-label">{genderInfo.label}</span>
        </div>
        <p class="bulgarian-rod">{genderInfo.bulgarianArticle}</p>
        <p class="gender-description">{genderInfo.description}</p>
      </div>
      <!-- Bulgarian Definite Article Patterns -->
      {#if item.grammar?.gender}
        <DefiniteArticlePatterns gender={item.grammar.gender} bulgarianWord={item.bulgarian} />
      {/if}
    </section>
  {/if}

  <!-- Declension (for nouns) -->
  {#if hasDeclension && item.grammar?.declension}
    <section class="grammar-section">
      <h4>Declension</h4>
      <div class="declension-table">
        <div class="table-row header">
          <div class="table-cell">Case</div>
          <div class="table-cell">Singular</div>
          <div class="table-cell">Plural</div>
        </div>
        {#each Object.entries(item.grammar.declension) as [caseName, caseValue]}
          <div class="table-row">
            <div class="table-cell case-label">{caseName}</div>
            <div class="table-cell">{caseValue.singular || '-'}</div>
            <div class="table-cell">{caseValue.plural || '-'}</div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Verb Aspect (Bulgarian-specific) -->
  {#if hasVerbAspect}
    {@const aspect = getAspectInfo(item.grammar?.verbAspect)}
    {#if aspect}
      <section class="grammar-section">
        <h4>Verb Aspect</h4>
        <div class="info-card aspect-card">
          <div class="aspect-header">
            <span class="aspect-symbol">{aspect.symbol}</span>
            <div class="aspect-labels">
              <span class="aspect-label">{aspect.label}</span>
              <span class="aspect-bulgarian">{aspect.bg}</span>
            </div>
          </div>
          <p class="aspect-description">{aspect.desc}</p>
          {#if item.grammar?.verbPartnerId}
            <div class="aspect-pair">
              <span class="pair-label">Aspectual pair:</span>
              <span class="pair-id">{item.grammar.verbPartnerId}</span>
            </div>
          {/if}
        </div>
      </section>
    {/if}
  {/if}

  <!-- Conjugation (for verbs) -->
  {#if item.partOfSpeech === 'verb' && item.grammar?.conjugation}
    <section class="grammar-section">
      <h4>Conjugation</h4>
      <div class="conjugation-table">
        {#each Object.entries(item.grammar.conjugation) as [tense, forms]}
          <div class="tense-section">
            <h5 class="tense-name">{tense}</h5>
            {#if typeof forms === 'object' && forms !== null}
              <div class="tense-forms">
                {#each Object.entries(forms) as [person, form]}
                  <div class="form-row">
                    <span class="person-label">{person}</span>
                    <span class="form-value">{form}</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {:else if item.partOfSpeech === 'verb'}
    <section class="grammar-section">
      <h4>Conjugation</h4>
      <div class="info-card placeholder-card" role="status" aria-live="polite">
        <div class="placeholder-content">
          <span class="placeholder-icon">📚</span>
          <p>Conjugation data being enriched</p>
          <span class="placeholder-hint">Check back soon for full conjugation tables</span>
        </div>
      </div>
    </section>
  {/if}

  <!-- Usage Notes -->
  {#if item.notes?.linguistic}
    <section class="grammar-section">
      <h4>Linguistic Notes</h4>
      <div class="info-card usage-notes">
        <p>{item.notes.linguistic}</p>
      </div>
    </section>
  {/if}

  <!-- Grammar Topics (removed - not in schema) -->
</div>

<style>
  .grammar-info {
    padding: var(--spacing-6, 1.5rem);
  }

  .grammar-info h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--spacing-6, 1.5rem) 0;
  }

  .grammar-section {
    margin-bottom: var(--spacing-6, 1.5rem);
  }

  .grammar-section:last-child {
    margin-bottom: 0;
  }

  .grammar-section h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--spacing-3, 0.75rem) 0;
  }

  .info-card {
    padding: var(--spacing-4, 1rem);
    background-color: var(--color-bg-secondary, #f9fafb);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
  }

  .part-of-speech {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
    text-transform: capitalize;
  }

  /* Gender Card */
  .gender-card {
    background-color: var(--color-bg-tertiary, #eff6ff);
    border-color: #bfdbfe;
  }

  .gender-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
    margin-bottom: var(--spacing-2, 0.5rem);
  }

  .article {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary, #3b82f6);
  }

  .gender-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .gender-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.5;
  }

  .bulgarian-rod {
    margin: var(--spacing-1, 0.25rem) 0 var(--spacing-2, 0.5rem) 0;
    font-size: 0.875rem;
    color: var(--color-primary, #3b82f6);
    font-style: italic;
  }

  /* Aspect Card */
  .aspect-card {
    background-color: var(--color-bg-tertiary, #faf5ff);
    border-color: #e9d5ff;
  }

  .aspect-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-3, 0.75rem);
    margin-bottom: var(--spacing-2, 0.5rem);
  }

  .aspect-symbol {
    font-size: 1.5rem;
  }

  .aspect-labels {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1, 0.25rem);
  }

  .aspect-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }

  .aspect-bulgarian {
    font-size: 0.875rem;
    color: var(--color-primary, #7c3aed);
    font-style: italic;
  }

  .aspect-description {
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .aspect-pair {
    display: flex;
    align-items: center;
    gap: var(--spacing-2, 0.5rem);
    padding-top: var(--spacing-2, 0.5rem);
    border-top: 1px solid var(--color-border, #e5e7eb);
    font-size: 0.875rem;
  }

  .pair-label {
    color: var(--color-text-secondary, #6b7280);
  }

  .pair-id {
    color: var(--color-primary, #7c3aed);
    font-weight: 500;
  }

  /* Conjugation Table */
  .conjugation-table {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4, 1rem);
  }

  .tense-section {
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    overflow: hidden;
  }

  .tense-name {
    margin: 0;
    padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    background-color: var(--color-bg-tertiary, #f3f4f6);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    text-transform: capitalize;
  }

  .tense-forms {
    padding: var(--spacing-2, 0.5rem);
  }

  .form-row {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
    border-bottom: 1px solid var(--color-border, #f3f4f6);
  }

  .form-row:last-child {
    border-bottom: none;
  }

  .person-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .form-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #111827);
  }

  /* Placeholder Card */
  .placeholder-card {
    background-color: var(--color-bg-tertiary, #f9fafb);
    border-style: dashed;
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--spacing-2, 0.5rem);
  }

  .placeholder-icon {
    font-size: 1.5rem;
    opacity: 0.6;
  }

  .placeholder-card p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-primary, #111827);
  }

  .placeholder-hint {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }

  /* Declension Table */
  .declension-table {
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-md, 0.375rem);
    overflow: hidden;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .table-row.header {
    background-color: var(--color-bg-tertiary, #f3f4f6);
    font-weight: 600;
  }

  .table-row:not(.header):nth-child(even) {
    background-color: var(--color-bg-secondary, #f9fafb);
  }

  .table-cell {
    padding: var(--spacing-3, 0.75rem);
    border-right: 1px solid var(--color-border, #e5e7eb);
    font-size: 0.875rem;
  }

  .table-cell:last-child {
    border-right: none;
  }

  .case-label {
    font-weight: 600;
    color: var(--color-text-secondary, #6b7280);
  }

  /* Usage Notes */
  .usage-notes {
    background-color: var(--color-bg-tertiary, #f0fdf4);
    border-color: #bbf7d0;
  }

  .usage-notes p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-text-primary, #111827);
  }

  @media (max-width: 640px) {
    .table-row {
      grid-template-columns: 1fr;
    }

    .table-cell {
      border-right: none;
      border-bottom: 1px solid var(--color-border, #e5e7eb);
    }

    .table-row:last-child .table-cell:last-child {
      border-bottom: none;
    }

    .case-label::before {
      content: 'Case: ';
      font-weight: 400;
    }
  }
</style>
