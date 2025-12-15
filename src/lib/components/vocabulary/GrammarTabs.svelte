<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item } = $props<{ item: VocabularyItem }>();

  let activeTab = $state('nominative');

  const cases = ['nominative', 'accusative', 'dative', 'genitive'];
  const caseLabels: Record<string, string> = {
    nominative: 'Nominativ',
    accusative: 'Akkusativ',
    dative: 'Dativ',
    genitive: 'Genitiv'
  };

  let hasDeclension = $derived(!!item.grammar?.declension);
</script>

{#if hasDeclension && item.grammar?.declension}
  <div class="grammar-tabs">
    <div class="tabs" role="tablist">
      {#each cases as caseName}
        <button
          class="tab-btn"
          class:active={activeTab === caseName}
          role="tab"
          aria-selected={activeTab === caseName}
          onclick={() => activeTab = caseName}
        >
          {caseLabels[caseName]}
        </button>
      {/each}
    </div>

    <div class="tab-content" role="tabpanel">
      <table class="declension-table">
        <thead>
          <tr>
            <th>Singular</th>
            <th>Plural</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{item.grammar.declension[activeTab as keyof typeof item.grammar.declension]?.singular || '-'}</td>
            <td>{item.grammar.declension[activeTab as keyof typeof item.grammar.declension]?.plural || '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .grammar-tabs {
    margin-top: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .tabs {
    display: flex;
    background-color: var(--color-surface-alt);
    border-bottom: 1px solid var(--color-border);
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .tab-btn.active {
    background-color: var(--color-surface);
    color: var(--color-primary);
    font-weight: 600;
    border-bottom: 2px solid var(--color-primary);
  }

  .tab-content {
    padding: 1rem;
    background-color: var(--color-surface);
  }

  .declension-table {
    width: 100%;
    border-collapse: collapse;
  }

  .declension-table th,
  .declension-table td {
    padding: 0.5rem;
    text-align: center;
    border: 1px solid var(--color-border);
  }

  .declension-table th {
    background-color: var(--color-surface-alt);
    font-weight: 600;
    font-size: 0.875rem;
  }
</style>
