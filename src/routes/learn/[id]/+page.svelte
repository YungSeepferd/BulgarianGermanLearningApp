<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import Flashcard from '$lib/components/Flashcard.svelte';
  
  // Dashboard components
  import DashboardTabs from './components/DashboardTabs.svelte';
  import GrammarPanel from './components/GrammarPanel.svelte';
  import WordFamilyPanel from './components/WordFamilyPanel.svelte';
  import EtymologyPanel from './components/EtymologyPanel.svelte';
  import ExamplesPanel from './components/ExamplesPanel.svelte';
  import NotesPanel from './components/NotesPanel.svelte';
  import ExternalLinksPanel from './components/ExternalLinksPanel.svelte';

  let { data } = $props<{ data: { item: VocabularyItem | null } }>();
  let item = $derived<VocabularyItem | null>(data?.item ?? null);
  let error = $derived<string | null>(item ? null : (appState.languageMode === 'DE_BG' ? 'Eintrag nicht gefunden' : 'Записът не е намерен'));

  const dirArrow = $derived(appState.languageMode === 'DE_BG' ? '→' : '←');

  // Active tab state for dashboard
  let activeTab = $state<string>('overview');

  // Tab definitions with bilingual labels
  const tabs = $derived([
    { id: 'overview', icon: '📋', labelDE: 'Überblick', labelBG: 'Преглед' },
    { id: 'grammar', icon: '📖', labelDE: 'Grammatik', labelBG: 'Граматика' },
    { id: 'family', icon: '🔗', labelDE: 'Wortfamilie', labelBG: 'Семейство' },
    { id: 'examples', icon: '💬', labelDE: 'Beispiele', labelBG: 'Примери' },
    { id: 'analysis', icon: '🔍', labelDE: 'Analyse', labelBG: 'Анализ' },
    { id: 'notes', icon: '📝', labelDE: 'Notizen', labelBG: 'Бележки' },
    { id: 'resources', icon: '🌐', labelDE: 'Ressourcen', labelBG: 'Ресурси' }
  ]);

  // Type-safe derived values with proper guards
  const exampleSentences = $derived.by(() => {
    if (!item) return [];
    const metadata = item.metadata;
    const legacy = (item as any).exampleSentences;
    
    if (metadata?.examples) {
      return metadata.examples.map(ex => ({
        source: ex.german || ex.source || '',
        target: ex.bulgarian || ex.target || '',
        context: ex.context
      }));
    }
    
    if (Array.isArray(legacy)) {
      return legacy.map((ex: any) => ({
        source: ex.source ?? ex.de ?? '',
        target: ex.target ?? ex.bg ?? '',
        context: ex.context
      }));
    }
    
    return [];
  });

  const alternatives = $derived.by(() => {
    if (!item) return [];
    const alts = (item as any).alternatives;
    return Array.isArray(alts) ? alts : [];
  });
</script>

<div class="learn-container" role="main" aria-label={appState.languageMode === 'DE_BG' ? 'Lernseite für Vokabel' : 'Страница за учене на дума'} onkeydown={(e) => {
  if (e.key === 'Escape') {
    window.history.back();
  }
}}>
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
  {#if error}
    <div class="state-block" role="alert"><p>{error}</p></div>
  {:else if item}
    <!-- Flashcard primary learn UI -->
    <div class="learn-card">
      <Flashcard vocabularyItem={item} />
    </div>

    <!-- Hero section with word title -->
    <header class="hero" aria-labelledby="learn-title">
      <div class="hero__main">
        <h1 id="learn-title" class="hero__title">{item.german}</h1>
        <div class="hero__arrow" aria-hidden="true">{dirArrow}</div>
        <h2 class="hero__subtitle">{item.bulgarian}</h2>
      </div>
      <div class="hero__badges" role="list" aria-label={appState.languageMode === 'DE_BG' ? 'Wort-Eigenschaften' : 'Свойства на думата'}>
        {#if item.cefrLevel}<span class="badge badge--cefr" role="listitem">CEFR {item.cefrLevel}</span>{/if}
        <span class="badge badge--pos" role="listitem">{item.partOfSpeech}</span>
        {#if item.categories?.length}
          {#each item.categories.slice(0, 3) as cat}
            <span class="badge badge--cat" role="listitem">{cat}</span>
          {/each}
        {/if}
      </div>
    </header>

    <!-- Dashboard tabs navigation -->
    <DashboardTabs {tabs} bind:activeTab />

    <!-- Dashboard panels -->
    <div class="dashboard-content">
      {#if activeTab === 'overview'}
        <!-- Overview panel - Quick summary of the word -->
        <section class="panel overview-panel">
          <div class="panel__header">
            <h3>{appState.languageMode === 'DE_BG' ? '📋 Schnellübersicht' : '📋 Бърз преглед'}</h3>
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
      {:else if activeTab === 'grammar'}
        <GrammarPanel {item} />
      {:else if activeTab === 'family'}
        <WordFamilyPanel {item} />
      {:else if activeTab === 'examples'}
        <ExamplesPanel {item} />
      {:else if activeTab === 'analysis'}
        <EtymologyPanel {item} />
      {:else if activeTab === 'notes'}
        <NotesPanel {item} />
      {:else if activeTab === 'resources'}
        <ExternalLinksPanel {item} />
      {/if}
    </div>

    <!-- Actions -->
    <nav class="actions" role="navigation" aria-label={appState.languageMode === 'DE_BG' ? 'Lernaktionen' : 'Учебни действия'}>
      <a class="button" href="/practice" aria-label={appState.languageMode === 'DE_BG' ? 'Mit diesem Wort üben' : 'Упражнявай тази дума'}>
        {appState.languageMode === 'DE_BG' ? 'Üben' : 'Упражнения'}
      </a>
      <a class="button button--secondary" href="/vocabulary">{appState.languageMode === 'DE_BG' ? 'Zurück zum Wörterbuch' : 'Назад към речника'}</a>
    </nav>
  {/if}
</div>

<style>
  .learn-container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--space-7) var(--space-5) var(--space-7);
    color: var(--color-neutral-dark);
  }

  .learn-card { 
    display: flex; 
    justify-content: center; 
    margin-bottom: var(--space-5); 
  }

  /* Hero section */
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .hero__main { 
    display: flex; 
    align-items: baseline; 
    gap: var(--space-3); 
  }

  .hero__title { 
    margin: 0; 
    font-size: var(--text-3xl); 
    font-weight: var(--font-extrabold); 
    color: var(--color-neutral-dark); 
  }

  .hero__subtitle { 
    margin: 0; 
    font-size: var(--text-2xl); 
    color: var(--color-primary-darker); 
  }

  .hero__arrow { 
    color: var(--color-neutral-text); 
    font-size: var(--text-xl); 
  }

  .hero__badges { 
    display: flex; 
    flex-wrap: wrap; 
    gap: var(--space-2); 
  }

  /* Badges */
  .badge { 
    padding: var(--space-1) var(--space-2); 
    border-radius: 999px; 
    font-size: var(--text-sm); 
    border: 1px solid var(--color-neutral-border); 
  }

  .badge--cefr { 
    background: var(--color-warning-light); 
    border-color: var(--color-warning); 
  }

  .badge--pos { 
    background: var(--color-primary-light); 
    border-color: var(--color-primary); 
  }

  .badge--cat { 
    background: var(--color-secondary-light); 
  }

  .badge-inline {
    padding: var(--space-1) var(--space-2);
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
  }

  /* Dashboard content */
  .dashboard-content {
    margin-top: var(--space-5);
    margin-bottom: var(--space-6);
  }

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
    color: var(--color-neutral-dark);
  }

  .example-arrow-compact {
    color: var(--color-neutral-text);
    font-weight: var(--font-bold);
  }

  .example-tgt-compact {
    color: var(--color-primary-darker);
    font-weight: var(--font-medium);
  }

  /* Tag list */
  .tag-list { 
    display: flex; 
    flex-wrap: wrap; 
    gap: var(--space-2); 
  }

  .tag { 
    padding: var(--space-1) var(--space-3); 
    border-radius: 999px; 
    background: var(--color-primary-light); 
    color: var(--color-primary-darker);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    border: 1px solid var(--color-primary);
  }

  /* Actions */
  .actions { 
    display: flex; 
    gap: var(--space-3); 
    margin-top: var(--space-6); 
  }

  .button { 
    padding: var(--space-3) var(--space-4); 
    border-radius: var(--border-radius-lg); 
    background: var(--color-button-primary); 
    color: #fff; 
    text-decoration: none; 
    font-weight: var(--font-semibold);
    transition: all 0.2s ease;
  }

  .button:hover {
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
  }

  .button:focus-visible { 
    outline: 3px solid var(--color-focus-ring, #0d6efd); 
    outline-offset: 2px; 
  }

  .button--secondary { 
    background: var(--color-secondary-light); 
    color: var(--color-neutral-dark); 
    border: 1px solid var(--color-neutral-border); 
  }

  /* State messages */
  .state-block { 
    text-align: center; 
    color: var(--color-neutral-text); 
    padding: var(--space-8);
  }

  .sr-only { 
    position: absolute; 
    width: 1px; 
    height: 1px; 
    padding: 0; 
    margin: -1px; 
    overflow: hidden; 
    clip: rect(0, 0, 0, 0); 
    white-space: nowrap; 
    border-width: 0; 
  }

  /* Responsive design */
  @media (max-width: var(--breakpoint-md)) {
    .hero { 
      flex-direction: column; 
      align-items: flex-start; 
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .example-row-compact {
      grid-template-columns: 1fr;
      gap: var(--space-1);
      text-align: center;
    }

    .example-arrow-compact {
      display: none;
    }
  }
</style>
