<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { appState } from '$lib/state/app-state';
  import EnrichmentBadge from './EnrichmentBadge.svelte';
  import DefinitionLink from './DefinitionLink.svelte';

  let {
    item,
    open = false,
    onClose
  }: {
    item: VocabularyItem;
    open: boolean;
    onClose: () => void;
  } = $props();

  const isNoun = $derived(item.partOfSpeech === 'noun');
  const isVerb = $derived(item.partOfSpeech === 'verb');
  const isAdjective = $derived(item.partOfSpeech === 'adjective');

  // Get article for nouns
  const article = $derived(item.grammar?.gender 
    ? item.grammar.gender === 'masculine' ? 'der'
    : item.grammar.gender === 'feminine' ? 'die'
    : 'das'
    : undefined
  );

  // German cases for declension table
  const cases = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
  
  // Verb tenses for conjugation table
  const verbForms = [
    { key: 'present', label: 'Präsens / Сегашно време' },
    { key: 'past', label: 'Präteritum / Минало време' },
    { key: 'perfect', label: 'Perfekt / Перфект' },
    { key: 'future', label: 'Futur / Бъдеще време' }
  ];

  // Adjective declension patterns
  const adjDeclension = [
    { case: 'Nominativ', m: '-er', f: '-e', n: '-es' },
    { case: 'Akkusativ', m: '-en', f: '-e', n: '-es' },
    { case: 'Dativ', m: '-em', f: '-er', n: '-em' },
    { case: 'Genitiv', m: '-en', f: '-er', n: '-en' }
  ];

  const ui = $derived(appState.languageMode === 'DE_BG' ? {
    close: 'Schließen',
    externalLinks: 'Externe Wörterbücher',
    examples: 'Beispielsätze',
    literalTranslation: 'Wörtliche Übersetzung',
    declension: 'Deklination',
    conjugation: 'Konjugation',
    article: 'Artikel',
    gender: 'Geschlecht',
    pluralForm: 'Pluralform',
    culturalNotes: 'Kulturelle Hinweise',
    etymology: 'Etymologie',
    synonyms: 'Synonyme',
    antonyms: 'Antonyme'
  } : {
    close: 'Затвори',
    externalLinks: 'Външни речници',
    examples: 'Примерни изречения',
    literalTranslation: 'Буквален превод',
    declension: 'Склонение',
    conjugation: 'Спрежение',
    article: 'Член',
    gender: 'Род',
    pluralForm: 'Множествена форма',
    culturalNotes: 'Културни бележки',
    etymology: 'Етимология',
    synonyms: 'Синоними',
    antonyms: 'Антоними'
  });
</script>

{#if open}
  <div
    class="modal-overlay"
    role="button"
    aria-label={ui.close}
    tabindex="0"
    onclick={onClose}
    onkeydown={(event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClose();
      }
    }}
  >
    <div
      class="modal-content"
      onclick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
      onkeydown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <!-- Header -->
      <div class="modal-header">
        <div class="header-main">
          <h2 id="modal-title" class="word-title">
            {#if article}<span class="article">{article}</span>{/if}
            {item.german}
          </h2>
          <p class="translation">{item.bulgarian}</p>
        </div>
        <button class="close-btn" onclick={onClose} aria-label={ui.close}>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div class="modal-body">
        <!-- External Dictionary Links -->
        {#if item.enrichment?.sourceURL || (item.definitions && item.definitions.length > 0)}
          <section class="section">
            <h3 class="section-title">
              <span class="icon" aria-hidden="true">📖</span>
              {ui.externalLinks}
            </h3>
            <div class="links-grid">
              {#if item.enrichment && item.enrichment.sourceURL}
                <EnrichmentBadge variant="card" enrichment={item.enrichment} />
              {/if}
              {#if item.definitions && Array.isArray(item.definitions)}
                {#each item.definitions as def}
                  <DefinitionLink definition={def} compact={false} showIcon={true} showLabel={true} />
                {/each}
              {/if}
            </div>
          </section>
        {/if}

        <!-- Grammar Information -->
        {#if isNoun && item.grammar}
          <section class="section">
            <h3 class="section-title">{ui.article} & {ui.gender}</h3>
            <div class="grammar-info">
              <div class="info-item">
                <span class="label">{ui.article}:</span>
                <span class="value">{article}</span>
              </div>
              {#if item.grammar.pluralForm}
                <div class="info-item">
                  <span class="label">{ui.pluralForm}:</span>
                  <span class="value">{item.grammar.pluralForm}</span>
                </div>
              {/if}
            </div>
          </section>

          <!-- Declension Table -->
          <section class="section">
            <h3 class="section-title">{ui.declension}</h3>
            <div class="table-wrapper">
              <table class="grammar-table">
                <thead>
                  <tr>
                    <th>Fall / Падеж</th>
                    <th>Singular</th>
                    {#if item.grammar.pluralForm}<th>Plural</th>{/if}
                  </tr>
                </thead>
                <tbody>
                  {#each cases as caseLabel}
                    <tr>
                      <td class="case-label">{caseLabel}</td>
                      <td>{article} {item.german}</td>
                      {#if item.grammar.pluralForm}<td>die {item.grammar.pluralForm}</td>{/if}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </section>
        {/if}

        {#if isVerb && item.grammar?.conjugation}
          <section class="section">
            <h3 class="section-title">{ui.conjugation}</h3>
            <div class="table-wrapper">
              <table class="grammar-table">
                <thead>
                  <tr>
                    <th>Zeit / Време</th>
                    <th>Deutsch</th>
                    <th>Български</th>
                  </tr>
                </thead>
                <tbody>
                  {#each verbForms as form}
                    <tr>
                      <td class="case-label">{form.label}</td>
                      <td>{item.grammar.conjugation[form.key] || '—'}</td>
                      <td>{item.bulgarian}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </section>
        {/if}

        {#if isAdjective}
          <section class="section">
            <h3 class="section-title">{ui.declension}</h3>
            <div class="table-wrapper">
              <table class="grammar-table">
                <thead>
                  <tr>
                    <th>Fall</th>
                    <th>Maskulin</th>
                    <th>Feminin</th>
                    <th>Neutrum</th>
                  </tr>
                </thead>
                <tbody>
                  {#each adjDeclension as row}
                    <tr>
                      <td class="case-label">{row.case}</td>
                      <td>{item.german}{row.m}</td>
                      <td>{item.german}{row.f}</td>
                      <td>{item.german}{row.n}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </section>
        {/if}

        <!-- Example Sentences with Literal Translation -->
        {#if item.examples && item.examples.length > 0}
          <section class="section">
            <h3 class="section-title">
              <span class="icon" aria-hidden="true">💬</span>
              {ui.examples}
            </h3>
            <div class="examples-list">
              {#each item.examples as example}
                <div class="example-card">
                  <p class="example-german">{example.german}</p>
                  <p class="example-bulgarian">{example.bulgarian}</p>
                  {#if example.context}
                    <p class="example-context">{example.context}</p>
                  {/if}
                  <div class="literal-translation">
                    <span class="literal-label">{ui.literalTranslation}:</span>
                    <span class="literal-text">{example.bulgarian}</span>
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Cultural Notes -->
        {#if item.culturalNotes && item.culturalNotes.length > 0}
          <section class="section">
            <h3 class="section-title">{ui.culturalNotes}</h3>
            <div class="notes-content">
              {#each item.culturalNotes as note}
                <p class="note-text">{note}</p>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Etymology -->
        {#if item.etymology}
          <section class="section">
            <h3 class="section-title">{ui.etymology}</h3>
            <p class="note-text">{item.etymology}</p>
          </section>
        {/if}

        <!-- Synonyms & Antonyms -->
        {#if item.synonyms || item.antonyms}
          <section class="section">
            <div class="related-words">
              {#if item.synonyms && item.synonyms.length > 0}
                <div class="word-group">
                  <h4 class="group-title">{ui.synonyms}</h4>
                  <div class="word-pills">
                    {#each item.synonyms as syn}
                      <span class="word-pill synonym">{syn}</span>
                    {/each}
                  </div>
                </div>
              {/if}
              {#if item.antonyms && item.antonyms.length > 0}
                <div class="word-group">
                  <h4 class="group-title">{ui.antonyms}</h4>
                  <div class="word-pills">
                    {#each item.antonyms as ant}
                      <span class="word-pill antonym">{ant}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    overflow-y: auto;
  }

  .modal-content {
    background: white;
    border-radius: 1rem;
    max-width: 900px;
    width: 100%;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    position: sticky;
    top: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 1rem 1rem 0 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 10;
  }

  .header-main {
    flex: 1;
  }

  .word-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .article {
    font-size: 1.5rem;
    opacity: 0.9;
    font-weight: 600;
  }

  .translation {
    font-size: 1.25rem;
    opacity: 0.95;
    margin: 0;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .links-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .grammar-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  .label {
    font-weight: 600;
    color: #6b7280;
  }

  .value {
    color: #1f2937;
    font-size: 1.125rem;
  }

  .table-wrapper {
    overflow-x: auto;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .grammar-table {
    width: 100%;
    border-collapse: collapse;
  }

  .grammar-table th,
  .grammar-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  .grammar-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
  }

  .grammar-table tr:last-child td {
    border-bottom: none;
  }

  .case-label {
    font-weight: 600;
    color: #667eea;
  }

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .example-card {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
    border-left: 4px solid #667eea;
  }

  .example-german {
    font-size: 1.125rem;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }

  .example-bulgarian {
    font-size: 1rem;
    color: #4b5563;
    margin: 0 0 0.5rem 0;
  }

  .example-context {
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
    margin: 0 0 0.75rem 0;
  }

  .literal-translation {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .literal-label {
    font-weight: 600;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .literal-text {
    color: #1f2937;
    font-size: 0.875rem;
  }

  .notes-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .note-text {
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }

  .related-words {
    display: grid;
    gap: 1.5rem;
  }

  .word-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .group-title {
    font-size: 1rem;
    font-weight: 600;
    color: #4b5563;
    margin: 0;
  }

  .word-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .word-pill {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .synonym {
    background: #dbeafe;
    color: #1e40af;
  }

  .antonym {
    background: #fee2e2;
    color: #991b1b;
  }

  @media (max-width: 640px) {
    .word-title {
      font-size: 1.5rem;
    }

    .translation {
      font-size: 1rem;
    }

    .grammar-table th,
    .grammar-table td {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }
</style>
