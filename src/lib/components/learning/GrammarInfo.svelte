<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  interface Props {
    item: VocabularyItem;
  }

  let { item }: Props = $props();

  // Gender display for nouns
  const genderInfo = $derived.by(() => {
    if (item.partOfSpeech === 'noun' && item.grammar?.gender) {
      const genderDetails: Record<string, { label: string; article: string; description: string }> = {
        masculine: {
          label: 'Masculine',
          article: 'der',
          description: 'Masculine nouns typically end in consonants or -er'
        },
        feminine: {
          label: 'Feminine',
          article: 'die',
          description: 'Feminine nouns often end in -e, -in, -ung, -heit, -keit'
        },
        neuter: {
          label: 'Neuter',
          article: 'das',
          description: 'Neuter nouns often end in -chen, -lein, -um'
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
        <p class="gender-description">{genderInfo.description}</p>
      </div>
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

  <!-- Conjugation (for verbs) - Future Phase 2 -->
  {#if item.partOfSpeech === 'verb'}
    <section class="grammar-section">
      <h4>Conjugation</h4>
      <div class="info-card coming-soon">
        <p>📚 Verb conjugation tables coming in Phase 2</p>
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

  /* Grammar Topics */
  .grammar-topics {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2, 0.5rem);
  }

  .topic-badge {
    padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    background-color: var(--color-bg-secondary, #f3f4f6);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  /* Coming Soon */
  .coming-soon {
    text-align: center;
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .coming-soon p {
    margin: 0;
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
