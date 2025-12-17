<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  import VocabularyCard from '$lib/components/ui/VocabularyCard.svelte';
  import ActionButton from '$lib/components/ui/ActionButton.svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import PathBrowser from '$lib/components/learning/PathBrowser.svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import { getLearningPaths, getLearningPathProgress } from '$lib/services/learning-paths';

  let isLoading = $state(true);
  let recentWords = $state<VocabularyItem[]>([]);
  let recommendedWords = $state<VocabularyItem[]>([]);
  let paths = $state<LearningPath[]>([]);
  let pathProgress = $state<Map<string, LearningPathProgress>>(new Map());
  let pathsLoading = $state(true);
  let pathsError = $state<string | null>(null);

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        title: 'Lernen',
        subtitle: 'Wähle Wörter zum Lernen oder starte eine zufällige Übungssitzung',
        recentTitle: 'Zuletzt angesehen',
        recommendedTitle: 'Empfohlen für dich',
        pathsTitle: 'Lernpfade',
        quickPractice: '🎲 Schnell üben',
        browseVocab: '📚 Vokabular durchsuchen',
        noRecent: 'Keine kürzlich angesehenen Wörter',
        noRecommended: 'Alle Wörter sind gemeistert! 🎉',
        essentialA1: 'Essenzielle A1 Wörter',
        essentialA2: 'Essenzielle A2 Wörter',
        intermediateB1: 'Zwischenstufe B1',
        advancedB2: 'Fortgeschritten B2',
        words: 'Wörter',
        complete: 'Fertig',
        inProgress: 'In Bearbeitung'
      }
    : {
        title: 'Учене',
        subtitle: 'Изберете думи за учене или започнете случайна практика',
        recentTitle: 'Отскоро разглеждано',
        recommendedTitle: 'Препоръчано за теб',
        pathsTitle: 'Пътеки за учене',
        quickPractice: '🎲 Бърза практика',
        browseVocab: '📚 Преглед на речника',
        noRecent: 'Нямате отскоро разглеждани думи',
        noRecommended: 'Всички думи са усвоени! 🎉',
        essentialA1: 'Основни думи A1',
        essentialA2: 'Основни думи A2',
        intermediateB1: 'Междинна степен B1',
        advancedB2: 'Напредна степен B2',
        words: 'думи',
        complete: 'Завършено',
        inProgress: 'В ход'
      });

  onMount(async () => {
    try {
      isLoading = true;
      
      // Initialize vocabulary database
      await vocabularyDb.initialize();
      const allVocab = vocabularyDb.getVocabulary();

      // Get recent words from progress tracking (fallback to recent searches)
      const recentIds = appState.practiceStats?.keys() ? Array.from(appState.practiceStats.keys()).slice(0, 6) : [];
      recentWords = recentIds
        .map(id => allVocab.find(v => v.id === id))
        .filter(Boolean) as VocabularyItem[];

      // If no recent words, show some from recent searches
      if (recentWords.length === 0) {
        const searchTerms = appState.recentSearches?.slice(0, 3) || [];
        recentWords = searchTerms
          .map(term => allVocab.find(v => v.german?.toLowerCase().includes(term.toLowerCase()) || v.bulgarian?.toLowerCase().includes(term.toLowerCase())))
          .filter(Boolean) as VocabularyItem[];
      }

      // Get recommended words (A1/A2 difficulty, not yet mastered)
      const masteredIds = new Set(
        Array.from(appState.practiceStats?.entries() || [])
          .filter(([, stats]) => stats && stats.correct >= 3)
          .map(([id]) => id)
      );

      recommendedWords = allVocab
        .filter(v => (v.cefrLevel === 'A1' || v.cefrLevel === 'A2') && !masteredIds.has(v.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);

      // Real learning paths from service
      try {
        const loadedPaths = await getLearningPaths();
        const progressMap = new Map<string, LearningPathProgress>();

        for (const path of loadedPaths) {
          const progress = await getLearningPathProgress(path.id);
          progressMap.set(path.id, progress);
        }

        paths = loadedPaths;
        pathProgress = progressMap;
      } catch (err) {
        pathsError = (err as Error).message ?? 'Failed to load learning paths';
      } finally {
        pathsLoading = false;
      }
    } catch (e) {
      console.error('Error in Learn page onMount:', e);
    } finally {
      isLoading = false;
    }
  });

  function handleCardClick(item: VocabularyItem) {
    goto(`${base}/learn/${item.id}`);
  }

  function handleQuickPractice() {
    goto(`${base}/learn/shuffle`);
  }

  function handleBrowseVocab() {
    goto(`${base}/vocabulary`);
  }

  function handlePathOpen(pathId: string) {
    goto(`${base}/learn/paths/${pathId}`);
  }
</script>

<svelte:head>
  <title>{ui.title}</title>
</svelte:head>

<div class="learn-hub">

  <header class="learn-header">
    <h1>{ui.title}</h1>
    <p class="subtitle">{ui.subtitle}</p>
  </header>

  {#if isLoading}
    <div class="loading">
      <p>{ui.title === 'Lernen' ? 'Wörter werden geladen...' : 'Думите се зареждат...'}</p>
    </div>
  {:else}
    <section class="quick-actions">
      <ActionButton
        label={ui.quickPractice}
        icon="🎲"
        onclick={handleQuickPractice}
        variant="primary"
      />
      <ActionButton
        label={ui.browseVocab}
        icon="📚"
        onclick={handleBrowseVocab}
        variant="secondary"
      />
    </section>

    {#if recentWords.length > 0}
      <section class="recent-section">
        <h2>{ui.recentTitle}</h2>
        <div class="word-grid">
          {#each recentWords as word (word.id)}
            <div class="card-wrapper">
              <VocabularyCard item={word} variant="grid" onOpenDetail={() => handleCardClick(word)} />
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if recommendedWords.length > 0}
      <section class="recommended-section">
        <h2>{ui.recommendedTitle}</h2>
        <div class="word-grid">
          {#each recommendedWords as word (word.id)}
            <div class="card-wrapper">
              <VocabularyCard item={word} variant="grid" onOpenDetail={() => handleCardClick(word)} />
            </div>
          {/each}
        </div>
      </section>
    {:else}
      <section class="no-recommended">
        <p>{ui.noRecommended}</p>
      </section>
    {/if}

    <section class="paths-section">
      <h2>{ui.pathsTitle}</h2>
      {#if pathsLoading}
        <div class="loading">
          <p>{ui.title === 'Lernen' ? 'Lernpfade werden geladen…' : 'Пътеките се зареждат…'}</p>
        </div>
      {:else if pathsError}
        <div class="loading error">{pathsError}</div>
      {:else}
        <PathBrowser paths={paths} pathProgress={pathProgress} onPathSelect={handlePathOpen} />
      {/if}
    </section>
  {/if}
</div>

<style>
  .learn-hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .learn-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .learn-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }

  .subtitle {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--color-text-secondary);
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .recent-section,
  .recommended-section,
  .no-recommended,
  .paths-section {
    margin-bottom: 3rem;
  }

  .recent-section h2,
  .recommended-section h2,
  .paths-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }

  .word-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .card-wrapper {
    cursor: pointer;
    border-radius: 0.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card-wrapper:hover,
  .card-wrapper:focus-visible {
    transform: translateY(-2px);
    outline: none;
  }

  .no-recommended {
    text-align: center;
    padding: 2rem;
    background: var(--color-background-secondary);
    border-radius: 0.5rem;
    color: var(--color-text-secondary);
  }

  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .path-card {
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1.5rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .path-card:hover,
  .path-card:focus-visible {
    background: var(--color-background-tertiary);
    border-color: var(--color-primary);
    outline: none;
  }

  .path-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .path-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    flex: 1;
  }

  .word-count {
    background: var(--color-primary-light);
    color: var(--color-primary-dark);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .progress-bar {
    height: 6px;
    background: var(--color-background);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-success);
    transition: width 0.3s;
    border-radius: 3px;
  }

  .progress-text {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  @media (max-width: 768px) {
    .learn-hub {
      padding: 1rem;
    }

    .learn-header h1 {
      font-size: 1.75rem;
    }

    .word-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .paths-grid {
      grid-template-columns: 1fr;
    }

    .quick-actions {
      flex-direction: column;
    }
  }
</style>
