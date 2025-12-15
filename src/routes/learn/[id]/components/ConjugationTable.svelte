<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let {
    item,
    tense = $bindable('present')
  }: {
    item: VocabularyItem;
    tense?: 'present' | 'past' | 'perfect' | 'future';
  } = $props();

  const conjugation = $derived(item.grammar?.conjugation || {});

  const tenses = $derived.by(() => {
    const isDE = appState.languageMode === 'DE_BG';
    return [
      { id: 'present' as const, label: isDE ? 'Präsens' : 'Сегашно време' },
      { id: 'past' as const, label: isDE ? 'Präteritum' : 'Минало свършено време' },
      { id: 'perfect' as const, label: isDE ? 'Perfekt' : 'Минало неопределено време' },
      { id: 'future' as const, label: isDE ? 'Futur I' : 'Бъдеще време' }
    ];
  });

  const pronouns = $derived.by(() => {
    const isDE = appState.languageMode === 'DE_BG';
    return [
      { key: 'ich', label: isDE ? 'ich' : 'аз' },
      { key: 'du', label: isDE ? 'du' : 'ти' },
      { key: 'er_sie_es', label: isDE ? 'er/sie/es' : 'той/тя/то' },
      { key: 'wir', label: isDE ? 'wir' : 'ние' },
      { key: 'ihr', label: isDE ? 'ihr' : 'вие' },
      { key: 'sie_Sie', label: isDE ? 'sie/Sie' : 'те/Вие' }
    ];
  });

  const hasData = $derived(Object.keys(conjugation).length > 0);
</script>

<div class="conjugation-panel">
  <!-- Tense tabs -->
  <div class="tense-tabs" role="tablist" aria-label={appState.languageMode === 'DE_BG' ? 'Zeitformen' : 'Времена'}>
    {#each tenses as t}
      <button
        class="tense-tab"
        class:active={tense === t.id}
        role="tab"
        aria-selected={tense === t.id}
        aria-controls="{t.id}-conjugation"
        onclick={() => (tense = t.id)}
      >
        {t.label}
      </button>
    {/each}
  </div>

  <!-- Conjugation table -->
  {#if hasData}
    <div id="{tense}-conjugation" role="tabpanel" aria-labelledby="{tense}-tab">
      <table aria-label={appState.languageMode === 'DE_BG' ? 'Konjugationstabelle' : 'Таблица на спрежение'}>
        <thead>
          <tr>
            <th scope="col">{appState.languageMode === 'DE_BG' ? 'Pronomen' : 'Местоимение'}</th>
            <th scope="col">{appState.languageMode === 'DE_BG' ? 'Form' : 'Форма'}</th>
          </tr>
        </thead>
        <tbody>
          {#each pronouns as pronoun}
            {@const formKey = `${tense}_${pronoun.key}`}
            {#if conjugation[formKey]}
              <tr>
                <th scope="row" class="pronoun">{pronoun.label}</th>
                <td class="form">{conjugation[formKey]}</td>
              </tr>
            {:else}
              <tr>
                <th scope="row" class="pronoun">{pronoun.label}</th>
                <td class="form muted">—</td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="no-data">
      {appState.languageMode === 'DE_BG' ? 'Keine Konjugationsdaten verfügbar' : 'Няма налични данни за спрежение'}
    </p>
  {/if}
</div>

<style>
  .conjugation-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .tense-tabs {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .tense-tab {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
    cursor: pointer;
    border-radius: var(--border-radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-neutral-dark);
    transition: all 0.2s ease;
  }

  .tense-tab:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
  }

  .tense-tab.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    font-weight: var(--font-semibold);
  }

  .tense-tab:focus-visible {
    outline: 3px solid var(--color-focus-ring, #0d6efd);
    outline-offset: 2px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    background: var(--color-neutral-light);
  }

  thead th {
    background: var(--color-primary-light);
    color: var(--color-primary-darker);
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  th,
  td {
    padding: var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-neutral-border);
  }

  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: none;
  }

  .pronoun {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }

  .form {
    font-size: var(--text-md);
    color: var(--color-neutral-dark);
  }

  .form.muted {
    color: var(--color-neutral-text);
  }

  .no-data {
    color: var(--color-neutral-text);
    font-style: italic;
    text-align: center;
    padding: var(--space-6);
  }

  @media (max-width: 768px) {
    .tense-tab {
      font-size: var(--text-xs);
      padding: var(--space-1) var(--space-2);
    }

    th,
    td {
      padding: var(--space-2);
      font-size: var(--text-sm);
    }
  }
</style>
