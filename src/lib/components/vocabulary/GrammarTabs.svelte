<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item } = $props<{ item: VocabularyItem }>();

  // Noun State
  let activeCase = $state('nominative');
  const cases = ['nominative', 'accusative', 'dative', 'genitive'];
  const caseLabels: Record<string, string> = {
    nominative: 'Nominativ',
    accusative: 'Akkusativ',
    dative: 'Dativ',
    genitive: 'Genitiv'
  };

  // Verb State
  let activeTense = $state('presentIndicative');
  const tenses = ['presentIndicative', 'simpleStPast'];
  const tenseLabels: Record<string, string> = {
    presentIndicative: 'Präsens',
    simpleStPast: 'Präteritum'
  };
  
  const pronouns = ['ich', 'du', 'erSieEs', 'wir', 'ihr', 'sieSie'];
  const pronounLabels: Record<string, string> = {
    ich: 'ich',
    du: 'du',
    erSieEs: 'er/sie/es',
    wir: 'wir',
    ihr: 'ihr',
    sieSie: 'sie/Sie'
  };

  let hasDeclension = $derived(!!item.grammar?.declension);
  let hasConjugation = $derived(!!item.grammar?.conjugation);
  
  function getConjugation(tense: string, pronoun: string): string {
    if (!item.grammar?.conjugation) return '-';
    const tenseObj = item.grammar.conjugation[tense];
    if (typeof tenseObj === 'object' && tenseObj !== null) {
      return (tenseObj as Record<string, string>)[pronoun] || '-';
    }
    return '-';
  }
</script>

{#if hasDeclension && item.grammar?.declension}
  <div class="grammar-tabs">
    <div class="tabs" role="tablist">
      {#each cases as caseName}
        <button
          class="tab-btn"
          class:active={activeCase === caseName}
          role="tab"
          aria-selected={activeCase === caseName}
          onclick={() => activeCase = caseName}
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
            <td>{item.grammar.declension[activeCase as keyof typeof item.grammar.declension]?.singular || '-'}</td>
            <td>{item.grammar.declension[activeCase as keyof typeof item.grammar.declension]?.plural || '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{:else if hasConjugation && item.grammar?.conjugation}
  <div class="grammar-tabs">
    <div class="tabs" role="tablist">
      {#each tenses as tense}
        {#if item.grammar.conjugation[tense]}
          <button
            class="tab-btn"
            class:active={activeTense === tense}
            role="tab"
            aria-selected={activeTense === tense}
            onclick={() => activeTense = tense}
          >
            {tenseLabels[tense] || tense}
          </button>
        {/if}
      {/each}
    </div>

    <div class="tab-content" role="tabpanel">
      <table class="declension-table">
        <tbody>
          {#each pronouns as pronoun}
            <tr>
              <td class="pronoun-col">{pronounLabels[pronoun]}</td>
              <td>{getConjugation(activeTense, pronoun)}</td>
            </tr>
          {/each}
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

  .pronoun-col {
    font-weight: 600;
    color: var(--color-text-secondary);
    text-align: right;
    width: 40%;
    background-color: var(--color-surface-alt);
  }
</style>
