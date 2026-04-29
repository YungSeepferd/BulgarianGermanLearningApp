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
  import { logger } from '$lib/services/logger';

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
        quickPractice: 'Schnell üben',
        browseVocab: 'Vokabular durchsuchen',
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
        quickPractice: 'Бърза практика',
        browseVocab: 'Преглед на речника',
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

  onMount(() => {
    let mounted = true;

    async function loadData() {
      try {
        isLoading = true;

        // Initialize vocabulary database
        await vocabularyDb.initialize();
        if (!mounted) return;

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
            if (!mounted) return;
            const progress = await getLearningPathProgress(path.id);
            progressMap.set(path.id, progress);
          }

          if (mounted) {
            paths = loadedPaths;
            pathProgress = progressMap;
          }
        } catch (err) {
          if (mounted) {
            pathsError = (err as Error).message ?? 'Failed to load learning paths';
          }
        } finally {
          if (mounted) {
            pathsLoading = false;
          }
        }
      } catch (e) {
        logger.error('LearnPage', 'Failed to load learn data', e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (mounted) {
          isLoading = false;
        }
      }
    }

    loadData();

    // Cleanup function
    return () => {
      mounted = false;
    };
  });

  function handleCardClick(item: VocabularyItem) {
    goto(`${base}/learn/${item.id}`);
  }

  function handleQuickPractice() {
    // Get all vocabulary items and select a random one
    const items = vocabularyDb.getVocabulary();
      if (!items || items.length === 0) return;

    // Select random vocabulary item
    const randomItem = items[Math.floor(Math.random() * items.length)];
      if (randomItem) {
        // Navigate to vocabulary detail view which shows the learning hub
        goto(`${base}/vocabulary/${randomItem.id}`);
      }
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

  <header class="hero">
    <h1 class="hero-title">{ui.title}</h1>
    <p class="hero-subtitle">{ui.subtitle}</p>
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
        <h2 class="section-title">{ui.recentTitle}</h2>
        <div class="horizontal-scroll">
          {#each recentWords as word (word.id)}
            <div class="glass-card">
              <VocabularyCard
                item={word}
                variant="grid"
                direction={appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE'}
                onOpenDetail={() => handleCardClick(word)}
              />
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if recommendedWords.length > 0}
      <section class="recommended-section">
        <h2 class="section-title">{ui.recommendedTitle}</h2>
        <div class="horizontal-scroll">
          {#each recommendedWords as word (word.id)}
            <div class="glass-card recommended-card">
              <span class="badge">Recommended</span>
              <VocabularyCard
                item={word}
                variant="grid"
                direction={appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE'}
                onOpenDetail={() => handleCardClick(word)}
              />
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
      <h2 class="section-title">{ui.pathsTitle}</h2>
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
    background: var(--bg-base);
    min-height: 100vh;
  }

  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: 4rem;
    padding: 3rem 1rem;
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: var(--text-4xl);
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    font-family: var(--font-body);
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin: 0;
    max-width: 600px;
    margin-inline: auto;
  }

  /* Section Titles */
  .section-title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 4rem;
    flex-wrap: wrap;
  }

  /* Horizontal Scroll Container */
  .horizontal-scroll {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding-bottom: 1.5rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: var(--accent-dim) var(--bg-surface);
  }

  .horizontal-scroll::-webkit-scrollbar {
    height: 6px;
  }

  .horizontal-scroll::-webkit-scrollbar-track {
    background: var(--bg-surface);
    border-radius: 3px;
  }

  .horizontal-scroll::-webkit-scrollbar-thumb {
    background: var(--accent-dim);
    border-radius: 3px;
  }

  /* Dark Glass Cards */
  .glass-card {
    flex: 0 0 280px;
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    scroll-snap-align: start;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: var(--shadow-md);
  }

  .glass-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg), 0 0 20px rgba(45, 212, 191, 0.1);
  }

  /* Recommended Card Badge */
  .recommended-card {
    position: relative;
  }

  .badge {
    position: absolute;
    top: -0.5rem;
    right: 0.75rem;
    max-width: calc(100% - 1.5rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--accent);
    color: var(--bg-base);
    font-family: var(--font-body);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--accent-glow);
  }

  /* Sections */
  .recent-section,
  .recommended-section,
  .no-recommended,
  .paths-section {
    margin-bottom: 4rem;
  }

  /* No Recommended State */
  .no-recommended {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--bg-elevated);
    border-radius: var(--radius-xl);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    font-family: var(--font-body);
  }

  /* Loading State */
  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-tertiary);
    font-family: var(--font-body);
  }

  .loading.error {
    color: #ef4444;
  }

  /* Card Wrapper Hover */
  .card-wrapper {
    cursor: pointer;
    border-radius: var(--radius-lg);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card-wrapper:hover,
  .card-wrapper:focus-visible {
    transform: translateY(-2px);
    outline: none;
  }

  /* Paths Grid (handled by PathBrowser but global reset here) */
  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .learn-hub {
      padding: 1rem;
    }

    .hero {
      padding: 2rem 0.5rem;
      margin-bottom: 2.5rem;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .section-title {
      font-size: 1.4rem;
    }

    .horizontal-scroll {
      gap: 1rem;
    }

    .glass-card {
      flex: 0 0 240px;
      padding: 1rem;
    }

    .quick-actions {
      flex-direction: column;
      gap: 1rem;
    }
  }

  /* Mobile: full-width cards to prevent overflow */
  @media (max-width: 640px) {
    .glass-card {
      flex: 0 0 calc(100% - 1rem);
      max-width: none;
    }

    .recommended-card {
      flex: 0 0 calc(100% - 1rem);
    }

    .horizontal-scroll {
      padding-inline: 0.25rem;
    }
  }
</style>
