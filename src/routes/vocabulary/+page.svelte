<script lang="ts">
  import { t } from '$lib/services/localization';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  import { ErrorHandler } from '$lib/services/errors';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import type { VocabularyCategory } from '$lib/schemas/vocabulary';
  import { PRACTICE_ICONS } from '$lib/constants/icons';
  import ActionButton from '$lib/components/ui/ActionButton.svelte';
  import VocabularyCard from '$lib/components/ui/VocabularyCard.svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { Grid } from 'svelte-virtual';

  type ActiveFilter = {
    key: string;
    label: string;
    onClear: () => void;
  };

  // State management with Svelte 5 Runes
  let vocabularyItems = $state<VocabularyItem[]>([]);
  let searchTerm = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedCategory = $state<VocabularyCategory | 'all'>('all');
  let selectedDifficulty = $state<string | null>(null);
  let selectedPartOfSpeech = $state<string | null>(null);
  let selectedLearningPhase = $state<number | null>(null);
  let currentPage = $state(0);
  const ITEMS_PER_PAGE = 750; // Load all items at once
  let selectedItems = $state(new Set<string>());
  let filteredCount = $state(0);
  let totalCount = $state(0);

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        title: 'Vokabular',
        introTitle: 'Wortschatz sicher aufbauen',
        introLede: 'Filtern nach Kategorie, Schwierigkeit oder Wortart und direkt mit den ausgewählten Wörtern üben.',
        searchPlaceholder: t('search.search_placeholder'),
        searchAria: t('search.search_vocabulary'),
        category: 'Kategorie',
        difficulty: 'Schwierigkeit',
        pos: 'Wortart',
        learningPhase: 'Lernphase',
        reset: 'Filter zurücksetzen',
        practiceSelected: (n: number) => `Auswahl üben (${n})`,
        loading: 'Vokabular wird geladen...',
        error: 'Fehler beim Laden. Bitte erneut versuchen.',
        emptyTitle: 'Keine Einträge gefunden',
        emptyHint: 'Passe Suche oder Filter an.',
        loadMore: 'Mehr laden'
      }
    : {
        practiceSelected: (n: number) => `Упражнявай избраните (${n})`,
        loading: 'Зареждане на речника...',
        error: 'Грешка при зареждане. Опитайте отново.',
        emptyTitle: 'Няма намерени записи',
        emptyHint: 'Променете търсенето или филтрите.',
        loadMore: 'Зареди още'
      });

  const countLabel = $derived(appState.languageMode === 'DE_BG'
    ? `${filteredCount} von ${totalCount} Einträgen`
    : `${filteredCount} от ${totalCount} записа`);
 
  // Categories for filtering
  const categories: VocabularyCategory[] = [
    'greetings',
    'numbers',
    'family',
    'food',
    'colors',
    'animals',
    'body-parts',
    'clothing',
    'home',
    'nature',
    'transport',
    'technology',
    'time',
    'weather',
    'professions',
    'places',
    'grammar',
    'culture',
    'everyday-phrases'
  ];

  const categoryLabels = {
    de: {
      greetings: 'Begrüßungen',
      numbers: 'Zahlen',
      family: 'Familie',
      food: 'Essen',
      colors: 'Farben',
      animals: 'Tiere',
      'body-parts': 'Körperteile',
      clothing: 'Kleidung',
      home: 'Zuhause',
      nature: 'Natur',
      transport: 'Verkehr',
      technology: 'Technologie',
      time: 'Zeit',
      weather: 'Wetter',
      professions: 'Berufe',
      places: 'Orte',
      grammar: 'Grammatik',
      culture: 'Kultur',
      'everyday-phrases': 'Alltagsphrasen'
    },
    bg: {
      greetings: 'Поздрави',
      numbers: 'Числа',
      family: 'Семейство',
      food: 'Храна',
      colors: 'Цветове',
      animals: 'Животни',
      'body-parts': 'Части на тялото',
      clothing: 'Облекло',
      home: 'Дом',
      nature: 'Природа',
      transport: 'Транспорт',
      technology: 'Технологии',
      time: 'Време',
      weather: 'Времето',
      professions: 'Професии',
      places: 'Места',
      grammar: 'Граматика',
      culture: 'Култура',
      'everyday-phrases': 'Често срещани изрази'
    }
  } as const;

  // CEFR Difficulty levels
  const difficultyLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  // Parts of speech for filtering
  const partsOfSpeech = [
    'noun', 'verb', 'adjective', 'adverb', 'pronoun',
    'preposition', 'conjunction', 'interjection', 'article', 'number', 'phrase'
  ];
  
  const partOfSpeechLabels = {
    de: {
      noun: 'Substantiv',
      verb: 'Verb',
      adjective: 'Adjektiv',
      adverb: 'Adverb',
      pronoun: 'Pronomen',
      preposition: 'Präposition',
      conjunction: 'Konjunktion',
      interjection: 'Interjektion',
      article: 'Artikel',
      number: 'Zahlwort',
      phrase: 'Redewendung'
    },
    bg: {
      noun: 'Съществително',
      verb: 'Глагол',
      adjective: 'Прилагателно',
      adverb: 'Наречие',
      pronoun: 'Местоимение',
      preposition: 'Предлог',
      conjunction: 'Съюз',
      interjection: 'Междуметие',
      article: 'Член',
      number: 'Числително',
      phrase: 'Израз'
    }
  } as const;

  const learningPhases = [
    { value: 0, de: 'Nicht gestartet', bg: 'Не е започната' },
    { value: 1, de: 'Phase 1: Neu', bg: 'Фаза 1: Нова' },
    { value: 2, de: 'Phase 2: Lernen', bg: 'Фаза 2: Учене' },
    { value: 3, de: 'Phase 3: Vertraut', bg: 'Фаза 3: Позната' },
    { value: 4, de: 'Phase 4: Bekannt', bg: 'Фаза 4: Позната добре' },
    { value: 5, de: 'Phase 5: Beherrscht', bg: 'Фаза 5: Овладяна' },
    { value: 6, de: 'Phase 6: Experte', bg: 'Фаза 6: Експерт' }
  ] as const;

  function getCategoryLabel(category: VocabularyCategory | string | undefined): string {
    if (!category) return '';
    const labels = appState.languageMode === 'DE_BG' ? categoryLabels.de : categoryLabels.bg;
    return (labels[category as VocabularyCategory] ?? category) as string;
  }

  function getPartOfSpeechLabel(pos: string): string {
    const labels = appState.languageMode === 'DE_BG' ? partOfSpeechLabels.de : partOfSpeechLabels.bg;
    return labels[pos as keyof typeof labels] ?? pos;
  }

  function getLearningPhaseLabel(value: number): string {
    const phase = learningPhases.find((p) => p.value === value);
    if (!phase) return String(value);
    return appState.languageMode === 'DE_BG' ? phase.de : phase.bg;
  }

  const activeFilters = $derived<ActiveFilter[]>([
    searchTerm
      ? {
          key: 'search',
          label: appState.languageMode === 'DE_BG' ? `Suche: "${searchTerm}"` : `Търсене: "${searchTerm}"`,
          onClear: () => (searchTerm = '')
        }
      : null,
    selectedDifficulty
      ? {
          key: 'difficulty',
          label: `${ui.difficulty}: ${selectedDifficulty}`,
          onClear: () => (selectedDifficulty = null)
        }
      : null,
    selectedCategory !== 'all'
      ? {
          key: 'category',
          label: `${ui.category}: ${getCategoryLabel(selectedCategory)}`,
          onClear: () => (selectedCategory = 'all')
        }
      : null,
    selectedPartOfSpeech
      ? {
          key: 'pos',
          label: `${ui.pos}: ${getPartOfSpeechLabel(selectedPartOfSpeech)}`,
          onClear: () => (selectedPartOfSpeech = null)
        }
      : null,
    selectedLearningPhase !== null
      ? {
          key: 'learningPhase',
          label: `${ui.learningPhase}: ${getLearningPhaseLabel(selectedLearningPhase)}`,
          onClear: () => (selectedLearningPhase = null)
        }
      : null
  ].filter(Boolean) as ActiveFilter[]);
 
  // Helper to filter all items based on current UI state
  function filterItems(all: VocabularyItem[]) {
    return all.filter((item) => {
      const q = (searchTerm || '').toLowerCase();
      const queryMatch = q
        ? item.german.toLowerCase().includes(q) ||
          item.bulgarian.toLowerCase().includes(q) ||
          item.categories.some(cat => cat.toLowerCase().includes(q))
        : true;
      const posMatch = selectedPartOfSpeech ? item.partOfSpeech === selectedPartOfSpeech : true;
      const diffMatch = selectedDifficulty != null ? item.cefrLevel === selectedDifficulty : true;
        const catMatch = selectedCategory !== 'all' ? item.categories.includes(selectedCategory as VocabularyCategory) : true;
      // learningPhase not present in app type; ignore for now
      return queryMatch && posMatch && diffMatch && catMatch;
    });
  }

  // Fetch vocabulary data with filters
  async function loadVocabulary() {
    try {
      loading = true;
      error = null;

      await vocabularyDb.initialize();
      const all = vocabularyDb.getVocabulary();
      totalCount = all.length;
      const offset = currentPage * ITEMS_PER_PAGE;

      const filtered = filterItems(all);
      filteredCount = filtered.length;

      hasMore = offset + ITEMS_PER_PAGE < filtered.length;
      vocabularyItems = filtered.slice(offset, offset + ITEMS_PER_PAGE);
    } catch (err) {
      ErrorHandler.handleError(err, 'Vocabulary Page: loadVocabulary');
      error = ui.error;
    } finally {
      loading = false;
    }
  }

  // Handle item selection for practice
  function handleSelectItem(item: VocabularyItem) {
    appState.startPracticeSession(item);
    goto(`${base}/practice`);
  }

  function handleToggleSelectItem(itemId: string) {
    if (selectedItems.has(itemId)) {
      selectedItems.delete(itemId);
    } else {
      selectedItems.add(itemId);
    }
    selectedItems = new Set(selectedItems);
  }

  function startPracticeWithSelected() {
    const itemsToPractice = vocabularyItems.filter(item => selectedItems.has(item.id));
    const firstItem = itemsToPractice[0];
    if (firstItem) {
      // Start practice with the first selected item
      appState.startPracticeSession(firstItem);
      selectedItems.clear();
      goto(`${base}/practice`);
    }
  }

  // React to search and filter changes
  $effect(() => {
    // Track dependencies explicitly for the effect
    searchTerm;
    selectedCategory;
    selectedDifficulty;
    selectedPartOfSpeech;
    selectedLearningPhase;

    currentPage = 0;
    loadVocabulary();
  });

  // Load more items
  let hasMore = $state(false);
  async function loadMore() {
    if (!hasMore) return;

    currentPage++;
    try {
      loading = true;
      await vocabularyDb.initialize();
      const all = vocabularyDb.getVocabulary();
      const offset = currentPage * ITEMS_PER_PAGE;
      const filtered = filterItems(all);
      filteredCount = filtered.length;
      hasMore = offset + ITEMS_PER_PAGE < filtered.length;
      const nextSlice = filtered.slice(offset, offset + ITEMS_PER_PAGE);
      vocabularyItems = [...vocabularyItems, ...nextSlice];
    } catch (err) {
      ErrorHandler.handleError(err, 'Vocabulary Page: loadMore');
    } finally {
      loading = false;
    }
  }

  async function resetFilters() {
    searchTerm = '';
    selectedCategory = 'all';
    selectedDifficulty = null;
    selectedPartOfSpeech = null;
    selectedLearningPhase = null;
    currentPage = 0;
    await loadVocabulary();
  }



  // Sidebar state
  let showFilters = $state(true);

  // Virtual grid state
  let containerWidth = $state(0);
  let containerHeight = $state(600);
  const ITEM_MIN_WIDTH = 280;
  const ITEM_HEIGHT = 180;

  // Calculate responsive columns based on container width
  const gridColumns = $derived.by(() => {
    if (containerWidth === 0) return 2;
    const cols = Math.floor(containerWidth / ITEM_MIN_WIDTH);
    return Math.max(2, Math.min(cols, 4));
  });

  // Calculate item width based on column count
  const itemWidth = $derived.by(() => {
    const cols = gridColumns;
    return Math.floor((containerWidth - (cols - 1) * 16) / cols);
  });
</script>

<svelte:head>
  <title>{ui.title} | {appState.languageMode === 'DE_BG' ? 'BulgarianApp' : 'BulgarianApp'}</title>
</svelte:head>

<div class="vocabulary-page">
  <header class="page-header">
    <div class="headline">
      <p class="eyebrow">{appState.languageMode === 'DE_BG' ? 'Wortschatz • Vocabulary' : 'Речник • Vocabulary'}</p>
      <h1 class="vocabulary-title">{ui.introTitle}</h1>
      <p class="intro-lede">{ui.introLede}</p>
    </div>
    <div class="header-actions">
      <ActionButton
        variant="primary"
        size="md"
        iconLeft={PRACTICE_ICONS.STANDARD}
        aria-label={ui.practiceSelected(selectedItems.size)}
        disabled={selectedItems.size === 0}
        onclick={startPracticeWithSelected}
      >
        {ui.practiceSelected(selectedItems.size)}
      </ActionButton>
      <button class="filter-toggle" onclick={() => (showFilters = !showFilters)} aria-expanded={showFilters}>
        {showFilters ? (appState.languageMode === 'DE_BG' ? 'Filter ausblenden' : 'Скрий филтрите') : (appState.languageMode === 'DE_BG' ? 'Filter anzeigen' : 'Покажи филтрите')}
      </button>
    </div>
  </header>

  <div class="vocabulary-layout">
    <aside class="filter-panel" data-open={showFilters}>
      <div class="filter-panel__header">
        <div>
          <p class="eyebrow-small">{ui.title}</p>
          <h2 class="panel-title">{appState.languageMode === 'DE_BG' ? 'Gezielt filtern' : 'Намери точните думи'}</h2>
        </div>
        <button class="panel-reset" onclick={resetFilters}>{ui.reset}</button>
      </div>

      <div class="filter-stack">
        <div class="filter-group">
          <label for="search-input" class="filter-label">{ui.searchAria || (appState.languageMode === 'DE_BG' ? 'Vokabular durchsuchen' : 'Търсене в речника')}</label>
          <input
            id="search-input"
            type="search"
            placeholder={ui.searchPlaceholder}
            bind:value={searchTerm}
            class="filter-input"
            aria-label={ui.searchAria || (appState.languageMode === 'DE_BG' ? 'Vokabular durchsuchen' : 'Търсене в речника')}
          />
        </div>

        <div class="filter-group">
          <span id="difficulty-label" class="filter-label">{ui.difficulty}</span>
          <div class="pill-row" role="group" aria-labelledby="difficulty-label">
            <button
              class={`pill ${selectedDifficulty === null ? 'pill--active' : ''}`}
              onclick={() => (selectedDifficulty = null)}
            >
              {appState.languageMode === 'DE_BG' ? 'Alle' : 'Всички'}
            </button>
            {#each difficultyLevels as level}
              <button
                class={`pill ${selectedDifficulty === level ? 'pill--active' : ''}`}
                onclick={() => (selectedDifficulty = level)}
              >
                {level}
              </button>
            {/each}
          </div>
        </div>

        <div class="filter-group">
          <label for="category-filter" class="filter-label">{ui.category}</label>
          <select id="category-filter" bind:value={selectedCategory} class="filter-select">
            <option value="all">{appState.languageMode === 'DE_BG' ? 'Alle Kategorien' : 'Всички категории'}</option>
            {#each categories as category}
              <option value={category}>{getCategoryLabel(category)}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group">
          <label for="pos-filter" class="filter-label">{ui.pos}</label>
          <select id="pos-filter" bind:value={selectedPartOfSpeech} class="filter-select">
            <option value={null}>{appState.languageMode === 'DE_BG' ? 'Alle Wortarten' : 'Всички части на речта'}</option>
            {#each partsOfSpeech as pos}
              <option value={pos}>{getPartOfSpeechLabel(pos)}</option>
            {/each}
          </select>
        </div>

        <div class="filter-group">
          <label for="learning-phase-filter" class="filter-label">{ui.learningPhase}</label>
          <select id="learning-phase-filter" bind:value={selectedLearningPhase} class="filter-select">
            <option value={null}>{appState.languageMode === 'DE_BG' ? 'Alle Phasen' : 'Всички етапи'}</option>
            {#each learningPhases as phase}
              <option value={phase.value}>{getLearningPhaseLabel(phase.value)}</option>
            {/each}
          </select>
        </div>

        <div class="filter-actions">
          <button class="secondary-button" onclick={resetFilters}>{ui.reset}</button>
          <button class="primary-button" onclick={startPracticeWithSelected} disabled={selectedItems.size === 0}>
            {ui.practiceSelected(selectedItems.size)}
          </button>
        </div>
      </div>
    </aside>

    <div class="vocabulary-content">
      <div class="summary-bar">
        <div class="summary-count">{countLabel}</div>
        <div class="active-filters">
          {#if activeFilters.length > 0}
            {#each activeFilters as filter (filter.key)}
              <button class="filter-chip" onclick={filter.onClear}>
                <span>{filter.label}</span>
                <span aria-hidden="true">✕</span>
              </button>
            {/each}
            <button class="clear-all" onclick={resetFilters}>
              {appState.languageMode === 'DE_BG' ? 'Alle zurücksetzen' : 'Изчисти всички'}
            </button>
          {:else}
            <span class="no-active-filters">{appState.languageMode === 'DE_BG' ? 'Alle Einträge aktiv' : 'Използваш всички записи'}</span>
          {/if}
        </div>
      </div>

      {#if loading && vocabularyItems.length === 0}
        <div class="state-block">
          <div class="spinner">🌀</div>
          <p>{ui.loading}</p>
        </div>
      {:else if error}
        <div class="state-block" role="alert">
          <span class="state-icon">⚠️</span>
          <p>{ui.error}</p>
        </div>
      {:else if vocabularyItems.length === 0}
        <div class="state-block">
          <div class="state-icon">🔍</div>
          <h3>{ui.emptyTitle}</h3>
          <p>{ui.emptyHint}</p>
        </div>
      {/if}

      {#if vocabularyItems.length > 0}
        <div 
          class="vocabulary-grid-container" 
          bind:clientWidth={containerWidth}
          bind:clientHeight={containerHeight}
        >
          {#if containerWidth > 0}
            <Grid
              itemCount={vocabularyItems.length}
              itemHeight={ITEM_HEIGHT}
              itemWidth={itemWidth}
              height={Math.min(containerHeight, Math.ceil(vocabularyItems.length / gridColumns) * ITEM_HEIGHT + 50, 1200)}
            >
              <div slot="item" let:index let:style class="card-link" {style}>
                {#if vocabularyItems[index]}
                  {@const item = vocabularyItems[index]!}
                  <VocabularyCard
                    {item}
                    variant="grid"
                    direction={appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE'}
                    isSelected={selectedItems.has(item.id)}
                    showMetadata={true}
                    showActions={true}
                    showTags={true}
                    onPractice={handleSelectItem}
                    onToggleSelect={handleToggleSelectItem}
                    onOpenDetail={(item) => goto(`${base}/learn/${item.id}`)}
                  />
                {/if}
              </div>
            </Grid>
          {:else}
            <div class="loading-placeholder">
              <div class="spinner">🌀</div>
            </div>
          {/if}
        </div>

        {#if hasMore}
          <div class="load-more-container">
            <button
              onclick={loadMore}
              disabled={loading}
              class="primary-button"
              aria-label={loading ? ui.loading : ui.loadMore}
            >
              {loading ? ui.loading : ui.loadMore}
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .vocabulary-page {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--space-7) var(--space-5) var(--space-7);
    color: var(--color-neutral-text-dark);
    overflow-x: hidden; /* Prevent horizontal overflow */
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    overflow-x: hidden; /* Prevent horizontal overflow */
  }

  .filter-chip:hover {
    background: var(--color-primary-light);
  }

  .clear-all {
    border: none;
    background: transparent;
    color: var(--color-primary-dark);
    font-weight: var(--font-semibold);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
  }

  .no-active-filters {
    color: var(--color-neutral-text);
    font-size: var(--text-sm);
  }

  .state-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-6) 0;
    color: var(--color-neutral-text);
    text-align: center;
  }

  .state-icon {
    font-size: var(--text-2xl);
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    margin-top: var(--space-5);
  }

  @media (min-width: var(--breakpoint-md)) {
    .vocabulary-grid-items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: var(--breakpoint-lg)) {
    .vocabulary-grid-items {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .filter-panel__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .panel-title {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--color-neutral-dark);
  }

  .panel-reset {
    border: none;
    background: transparent;
    color: var(--color-primary-darker);
    font-weight: var(--font-semibold);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
  }

  .filter-stack {
    display: flex;
    flex-direction: column;
    gap: var(--filter-group-spacing);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .filter-label {
    font-size: var(--text-sm);
    color: var(--color-neutral-text-dark);
    font-weight: var(--font-semibold);
  }

  .filter-input,
  .filter-select {
    width: 100%;
    padding: var(--space-3);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
    font-size: var(--text-base);
    color: var(--color-neutral-dark);
    transition: var(--transition-filter);
  }

  .filter-input:focus,
  .filter-select:focus {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: var(--color-focus-ring-offset);
  }

  .pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .pill {
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
    color: var(--color-neutral-dark);
    border-radius: 999px;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: var(--transition-filter);
  }

  .pill:hover {
    border-color: var(--color-primary);
  }

  .pill--active {
    background: var(--color-primary-light);
    color: var(--color-primary-darker);
    border-color: var(--color-primary);
    font-weight: var(--font-semibold);
  }

  .filter-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  .primary-button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--border-radius-lg);
    border: none;
    background: #1d4ed8; /* Blue-700 for WCAG 4.5:1 contrast */
    color: #ffffff;
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: var(--transition-filter);
  }

  .primary-button:disabled {
    background: var(--color-neutral-border);
    cursor: not-allowed;
  }

  .primary-button:not(:disabled):hover {
    background: var(--color-button-primary-hover);
  }

  .secondary-button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-neutral-border);
    background: var(--color-neutral-light);
    color: var(--color-neutral-dark);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: var(--transition-filter);
  }

  .secondary-button:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .vocabulary-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .vocabulary-grid-container {
    width: 100%;
    min-height: 400px;
  }

  .vocabulary-grid-container :global(.virtual-grid) {
    position: relative;
  }

  .vocabulary-grid-container :global(.virtual-grid-item) {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* Fix for grid children to respect container width */
  .vocabulary-layout > * {
    min-width: 0; /* Allow grid children to shrink below content size */
  }

  /* Fix for nested content to respect parent width */
  .vocabulary-content > * {
    min-width: 0; /* Allow nested content to shrink as well */
  }

  /* Force hide any overflow from phantom scrollWidth */
  .vocabulary-content,
  .vocabulary-grid-items {
    overflow-x: hidden;
  }

  .filter-panel {
    display: none; /* Hidden on mobile by default */
    position: sticky;
    top: 0;
    background: var(--color-filter-bg);
    border: 1px solid var(--color-neutral-border);
    border-radius: var(--border-radius-xl);
    padding: var(--filter-panel-padding);
    box-shadow: var(--shadow-filter-panel);
    flex-direction: column;
    gap: var(--filter-group-spacing);
  }

  @media (min-width: 768px) {
    .vocabulary-layout {
      grid-template-columns: minmax(280px, 360px) 1fr;
    }

    .filter-panel {
      display: flex; /* Show on tablet+ screens */
    }
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: 999px;
    border: 1px solid var(--color-primary);
    background: var(--color-primary-lighter);
    color: var(--color-primary-darker);
    cursor: pointer;
    transition: var(--transition-filter);
  }

  .filter-chip:hover {
    background: var(--color-primary-light);
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    margin-top: var(--space-5);
  }
</style>