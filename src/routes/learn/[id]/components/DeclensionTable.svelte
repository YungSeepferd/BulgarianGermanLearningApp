<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { item }: { item: VocabularyItem } = $props();

  const declension = $derived(item.metadata?.declension || {});

  const cases = $derived.by(() => {
    const isDE = appState.languageMode === 'DE_BG';
    return [
      { key: 'Nominative', label: isDE ? 'Nominativ' : 'Именителен падеж', description: isDE ? 'Wer/Was?' : 'Кой/Какво?' },
      { key: 'Accusative', label: isDE ? 'Akkusativ' : 'Винителен падеж', description: isDE ? 'Wen/Was?' : 'Кого/Какво?' },
      { key: 'Dative', label: isDE ? 'Dativ' : 'Дателен падеж', description: isDE ? 'Wem?' : 'Кому?' },
      { key: 'Genitive', label: isDE ? 'Genitiv' : 'Родителен падеж', description: isDE ? 'Wessen?' : 'Чий?' }
    ];
  });

  const hasData = $derived(Object.keys(declension).length > 0);
</script>

{#if hasData}
  <div class="declension-table">
    <table aria-label={appState.languageMode === 'DE_BG' ? 'Deklinationstabelle' : 'Таблица на склонение'}>
      <thead>
        <tr>
          <th scope="col">{appState.languageMode === 'DE_BG' ? 'Kasus' : 'Падеж'}</th>
          <th scope="col">{appState.languageMode === 'DE_BG' ? 'Singular' : 'Единствено число'}</th>
          <th scope="col">{appState.languageMode === 'DE_BG' ? 'Plural' : 'Множествено число'}</th>
        </tr>
      </thead>
      <tbody>
        {#each cases as caseRow}
          {#if declension[caseRow.key]}
            <tr>
              <th scope="row" class="case-label" title={caseRow.description}>
                {caseRow.label}
              </th>
            <td>{declension[caseRow.key]?.singular || '—'}</td>
            <td>{declension[caseRow.key]?.plural || '—'}</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="no-data">
    {appState.languageMode === 'DE_BG' ? 'Keine Deklinationsdaten verfügbar' : 'Няма налични данни за склонение'}
  </p>
{/if}

<style>
  .declension-table {
    overflow-x: auto;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-neutral-border);
  }

  thead th {
    background: var(--color-primary-light);
    color: var(--color-primary-darker);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }

  .case-label {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
    cursor: help;
  }

  td {
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
  }

  .no-data {
    color: var(--color-neutral-text);
    font-style: italic;
    text-align: center;
    padding: var(--space-6);
  }

  @media (max-width: var(--breakpoint-md)) {
    th,
    td {
      padding: var(--space-2);
      font-size: var(--text-sm);
    }

    thead th {
      font-size: var(--text-xs);
    }
  }
</style>
