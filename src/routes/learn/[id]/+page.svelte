<script lang="ts">
  import { appState } from '$lib/state/app-state';
  import { calculateMasteryLevel } from '$lib/schemas/progress';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import MasteryGauge from '$lib/components/ui/MasteryGauge.svelte';
  
  // Dashboard components
  import DashboardTabs from './components/DashboardTabs.svelte';
  import OverviewPanel from './components/OverviewPanel.svelte';
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
  type TabId = 'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'resources';
  let activeTab = $state<TabId>('overview');
  let initialized = false;

  $effect(() => {
    if (!browser) return;
    
    if (!initialized) {
        const tab = $page.url.searchParams.get('tab') as TabId;
        if (tab && ['overview', 'grammar', 'family', 'examples', 'analysis', 'notes', 'resources'].includes(tab)) {
            activeTab = tab;
        }
        initialized = true;
    } else {
        const url = new URL(window.location.href);
        if (url.searchParams.get('tab') !== activeTab) {
            url.searchParams.set('tab', activeTab);
            goto(url, { replaceState: true, keepFocus: true, noScroll: true });
        }
    }
  });

  // Type-safe derived values with proper guards
  
  // Define legacy interface for type safety
  interface LegacyVocabularyItem {
    exampleSentences?: Array<{ source?: string; de?: string; target?: string; bg?: string; context?: string }>;
    alternatives?: string[];
  }

  const exampleSentences = $derived.by(() => {
    if (!item) return [];
    
    if (item.examples && item.examples.length > 0) {
      return item.examples.map(ex => ({
        source: ex.german,
        target: ex.bulgarian,
        context: ex.context
      }));
    }

    const legacyItem = item as unknown as LegacyVocabularyItem;
    const legacy = legacyItem.exampleSentences;
    
    if (Array.isArray(legacy)) {
      return legacy.map(ex => ({
        source: ex.source ?? ex.de ?? '',
        target: ex.target ?? ex.bg ?? '',
        context: ex.context
      }));
    }
    
    return [];
  });

  const alternatives = $derived.by(() => {
    if (!item) return [];
    
    // Prefer standard synonyms if available
    if (item.synonyms && item.synonyms.length > 0) {
        return item.synonyms;
    }

    const legacyItem = item as unknown as LegacyVocabularyItem;
    const alts = legacyItem.alternatives;
    return Array.isArray(alts) ? alts : [];
  });

  const sourceText = $derived(appState.languageMode === 'DE_BG' ? item?.german : item?.bulgarian);
  const targetText = $derived(appState.languageMode === 'DE_BG' ? item?.bulgarian : item?.german);
  const targetLang = $derived(appState.languageMode === 'DE_BG' ? 'bg' : 'de');
  const sourceLang = $derived(appState.languageMode === 'DE_BG' ? 'de' : 'bg');

  const stats = $derived(item ? appState.practiceStats.get(item.id) : undefined);
  const mastery = $derived(stats ? calculateMasteryLevel(stats.correct, stats.incorrect) : 0);
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === 'Escape') {
    window.history.back();
  }
}} />

<div class="learn-container" role="main" aria-labelledby="learn-title">
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
  {#if error}
    <div class="state-block" role="alert"><p>{error}</p></div>
  {:else if item}
    <!-- Screen reader only heading -->
    <h1 id="learn-title" class="sr-only">
      {appState.languageMode === 'DE_BG' ? 'Lernen: ' : 'Учене: '}
      {item.german} {dirArrow} {item.bulgarian}
    </h1>

    <!-- Flashcard primary learn UI -->
    <div class="learn-card">
      <Flashcard vocabularyItem={item} />
    </div>

    <!-- Hero section with word title -->
    <header class="hero" aria-hidden="true">
      <div class="hero__main">
        <div class="hero__title" lang={sourceLang}>{sourceText}</div>
        <div class="hero__arrow">{dirArrow}</div>
        <div class="hero__subtitle" lang={targetLang}>{targetText}</div>
      </div>
      <div class="hero__badges">
        {#if item.cefrLevel}<span class="badge badge--cefr">CEFR {item.cefrLevel}</span>{/if}
        <span class="badge badge--pos">{item.partOfSpeech}</span>
        {#if item.categories?.length}
          {#each item.categories.slice(0, 3) as cat}
            <span class="badge badge--cat">{cat}</span>
          {/each}
        {/if}
        <div class="mastery-badge">
          <MasteryGauge {mastery} />
        </div>
      </div>
    </header>

    <!-- Dashboard tabs navigation -->
    <DashboardTabs bind:activeTab />

    <!-- Dashboard panels -->
    <div class="dashboard-content">
      {#if activeTab === 'overview'}
        <OverviewPanel {item} {exampleSentences} {alternatives} />
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
    <nav class="actions" aria-label={appState.languageMode === 'DE_BG' ? 'Lernaktionen' : 'Учебни действия'}>
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
  }
</style>
