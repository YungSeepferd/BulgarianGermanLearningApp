<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { appState } from '$lib/state/app-state';
  import ActionButton from '$lib/components/ui/ActionButton.svelte';
  import type { PageData } from './$types';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { data }: { data: PageData } = $props();

  // Reactive state
  let currentTab = $state<'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'sources'>('overview');
  let item = $state<VocabularyItem>(data.item);
  let allItems = $state<VocabularyItem[]>(data.allItems);

  // Reactive derived values
  const isDE_BG = $derived(appState.languageMode === 'DE_BG');
  const sourceText = $derived(isDE_BG ? item.german : item.bulgarian);
  const targetText = $derived(isDE_BG ? item.bulgarian : item.german);
  const arrowDirection = $derived(isDE_BG ? '→' : '←');
  
  type Tab = 'overview' | 'grammar' | 'family' | 'examples' | 'analysis' | 'notes' | 'sources';
  const TABS: Tab[] = ['overview', 'grammar', 'family', 'examples', 'analysis', 'notes', 'sources'];

  // UI labels
  const labels = $derived(isDE_BG
    ? {
        back: '← Zurück zum Wörterbuch',
        practice: 'Üben',
        overview: 'Überblick',
        grammar: 'Grammatik',
        family: 'Wortfamilie',
        examples: 'Beispiele',
        analysis: 'Analyse',
        notes: 'Notizen',
        sources: 'Quellen',
        examples_label: 'Beispielsätze:',
        difficulty: 'Schwierigkeit:',
        category: 'Kategorie:',
        partOfSpeech: 'Wortart:',
        pronunciation: 'Aussprache:',
        etymology: 'Etymologie:',
        grammarRules: 'Grammatikregeln:',
        relatedWords: 'Verwandte Wörter:',
        noExamples: 'Keine Beispiele verfügbar',
        noRelated: 'Keine verwandten Wörter verfügbar',
        noNotes: 'Noch keine Notizen hinzugefügt'
      }
    : {
        back: '← Назад към речника',
        practice: 'Упражнения',
        overview: 'Преглед',
        grammar: 'Граматика',
        family: 'Словна семейство',
        examples: 'Примери',
        analysis: 'Анализ',
        notes: 'Бележки',
        sources: 'Източници',
        examples_label: 'Примерни изречения:',
        difficulty: 'Трудност:',
        category: 'Категория:',
        partOfSpeech: 'Вид дума:',
        pronunciation: 'Произношение:',
        etymology: 'Етимология:',
        grammarRules: 'Граматични правила:',
        relatedWords: 'Свързани думи:',
        noExamples: 'Няма налични примери',
        noRelated: 'Няма налични свързани думи',
        noNotes: 'Все още не сте добавили бележки'
      });

  // Get category label
  function getCategoryLabel(category?: string): string {
    if (!category) return '';
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

    const lang = isDE_BG ? 'de' : 'bg';
    return categoryLabels[lang]?.[category as keyof typeof categoryLabels[typeof lang]] || category;
  }

  // Get difficulty label
  function getDifficultyLabel(difficulty?: number): string {
    const levels = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1' };
    return difficulty ? levels[difficulty as keyof typeof levels] : 'N/A';
  }

  // Get part of speech label
  function getPartsOfSpeechLabel(pos?: string): string {
    if (!pos) return '';
    const labels = {
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
        number: 'Zahl',
        phrase: 'Satz',
        expression: 'Ausdruck'
      },
      bg: {
        noun: 'Съществително име',
        verb: 'Глагол',
        adjective: 'Прилагателно име',
        adverb: 'Наречие',
        pronoun: 'Местоимение',
        preposition: 'Предлог',
        conjunction: 'Съюз',
        interjection: 'Междометие',
        article: 'Член',
        number: 'Число',
        phrase: 'Фраза',
        expression: 'Израз'
      }
    } as const;

    const lang = isDE_BG ? 'de' : 'bg';
    return labels[lang]?.[pos as keyof typeof labels[typeof lang]] || pos;
  }

  // Find related words (same category or similar)
  function getRelatedWords(): VocabularyItem[] {
    if (!item.categories || item.categories.length === 0) return [];
    return allItems
      .filter(
        w =>
          w.id !== item.id &&
          w.categories &&
          w.categories.some(cat => item.categories?.includes(cat))
      )
      .slice(0, 5);
  }

  // Navigate back to vocabulary page
  function handleBack() {
    goto(`${base}/vocabulary`);
  }

  // Navigate to practice for this word
  function handlePractice() {
    // Could navigate to practice mode with this word pre-selected
    // For now, just show a message
    console.log('Practice mode for:', item.id);
  }

  // Navigation to next/previous items
  function goToPrevious() {
    const currentIndex = allItems.findIndex(i => i.id === item.id);
    if (currentIndex > 0 && allItems[currentIndex - 1]) {
      const prevItem = allItems[currentIndex - 1]!;
      goto(`${base}/vocabulary/${prevItem.id}`);
    }
  }

  function goToNext() {
    const currentIndex = allItems.findIndex(i => i.id === item.id);
    if (currentIndex < allItems.length - 1 && allItems[currentIndex + 1]) {
      const nextItem = allItems[currentIndex + 1]!;
      goto(`${base}/vocabulary/${nextItem.id}`);
    }
  }

  const relatedWords = $derived(getRelatedWords());
  const currentIndex = $derived(allItems.findIndex(i => i.id === item.id));
  const isFirst = $derived(currentIndex === 0);
  const isLast = $derived(currentIndex === allItems.length - 1);
</script>

<div class="vocabulary-detail">
  <!-- Header with back button -->
  <div class="detail-header">
    <button class="back-button" onclick={handleBack} title={labels.back}>
      {labels.back}
    </button>
    <div class="header-actions">
      <ActionButton
        variant="primary"
        size="md"
        onclick={handlePractice}
        label={labels.practice}
      />
    </div>
  </div>

  <!-- Main word display -->
  <div class="word-display-section">
    <div class="word-main">
      <div class="word-source">{sourceText}</div>
      <div class="arrow">{arrowDirection}</div>
      <div class="word-target">{targetText}</div>
    </div>

    <!-- Quick info badges -->
    <div class="quick-info">
      {#if item.partOfSpeech}
        <span class="badge badge-pos">{getPartsOfSpeechLabel(item.partOfSpeech)}</span>
      {/if}
      {#if item.difficulty}
        <span class="badge badge-difficulty">{getDifficultyLabel(item.difficulty)}</span>
      {/if}
      {#if item.categories && item.categories.length > 0}
        {#each item.categories.slice(0, 2) as category}
          <span class="badge badge-category">{getCategoryLabel(category)}</span>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Tab navigation -->
  <div class="tabs-navigation">
    {#each TABS as tab}
      <button
        class="tab-button {currentTab === tab ? 'active' : ''}"
        onclick={() => (currentTab = tab)}
      >
        {labels[tab as keyof typeof labels]}
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  <div class="tabs-content">
    {#if currentTab === 'overview'}
      <div class="tab-pane">
        <h3>{labels.overview}</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>{labels.partOfSpeech}</label>
            <div>{getPartsOfSpeechLabel(item.partOfSpeech)}</div>
          </div>
          <div class="info-item">
            <label>{labels.difficulty}</label>
            <div>{getDifficultyLabel(item.difficulty)}</div>
          </div>
          {#if item.categories && item.categories.length > 0}
            <div class="info-item">
              <label>{labels.category}</label>
              <div>
                {item.categories.map(c => getCategoryLabel(c)).join(', ')}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else if currentTab === 'grammar'}
      <div class="tab-pane">
        <h3>{labels.grammar}</h3>
        <div class="grammar-info">
          <p class="info-text">
            {isDE_BG
              ? 'Grammatikregeln für dieses Wort werden in der Regel angewendet...'
              : 'Граматичните правила за тази дума обикновено се прилагат...'}
          </p>
        </div>
      </div>
    {:else if currentTab === 'family'}
      <div class="tab-pane">
        <h3>{labels.family}</h3>
        {#if relatedWords.length > 0}
          <div class="related-words-list">
            {#each relatedWords as relatedItem}
              <button
                type="button"
                class="related-word-item"
                onclick={() => goto(`${base}/vocabulary/${relatedItem.id}`)}
              >
                <div class="related-word-text">
                  <strong>{isDE_BG ? relatedItem.german : relatedItem.bulgarian}</strong>
                  <span class="arrow">{arrowDirection}</span>
                  <span>{isDE_BG ? relatedItem.bulgarian : relatedItem.german}</span>
                </div>
                <div class="related-word-meta">
                  {#if relatedItem.partOfSpeech}
                    <span class="small-badge">{getPartsOfSpeechLabel(relatedItem.partOfSpeech)}</span>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <p class="empty-state">{labels.noRelated}</p>
        {/if}
      </div>
    {:else if currentTab === 'examples'}
      <div class="tab-pane">
        <h3>{labels.examples}</h3>
        {#if item.examples && item.examples.length > 0}
          <div class="examples-list">
            {#each item.examples as example}
              <div class="example-item">
                <p class="example-source">
                  {isDE_BG ? example.german : example.bulgarian}
                </p>
                <p class="example-translation">
                  {isDE_BG ? example.bulgarian : example.german}
                </p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-state">{labels.noExamples}</p>
        {/if}
      </div>
    {:else if currentTab === 'analysis'}
      <div class="tab-pane">
        <h3>{labels.analysis}</h3>
        <div class="analysis-content">
          <p class="info-text">
            {isDE_BG
              ? 'Wort-Analyse und Häufigkeitsstatistiken...'
              : 'Анализ на думи и статистика на честотата...'}
          </p>
          <!-- Frequency not present on VocabularyItem; remove block to satisfy types -->
        </div>
      </div>
    {:else if currentTab === 'notes'}
      <div class="tab-pane">
        <h3>{labels.notes}</h3>
        <div class="notes-container">
          <p class="empty-state">{labels.noNotes}</p>
          <textarea
            class="notes-input"
            placeholder={isDE_BG
              ? 'Notizen für dieses Wort hinzufügen...'
              : 'Добавете бележки за тази дума...'}
            rows={4}
          ></textarea>
        </div>
      </div>
    {:else if currentTab === 'sources'}
      <div class="tab-pane">
        <h3>{labels.sources}</h3>
        <div class="sources-content">
          <p class="source-info">
            {isDE_BG
              ? 'Quellen und Verweise für dieses Wort...'
              : 'Външни источники и препратки за тази дума...'}
          </p>
          <!-- Sources intentionally omitted as not part of core VocabularyItem type -->
        </div>
      </div>
    {/if}
  </div>

  <!-- Navigation arrows at bottom -->
  <div class="detail-footer">
    <button
      class="nav-button prev-button"
      onclick={goToPrevious}
      disabled={isFirst}
      title={isDE_BG ? 'Vorheriges Wort' : 'Предишна дума'}
    >
      ← {isDE_BG ? 'Vorher' : 'Назад'}
    </button>

    <div class="word-counter">
      {currentIndex + 1} / {allItems.length}
    </div>

    <button
      class="nav-button next-button"
      onclick={goToNext}
      disabled={isLast}
      title={isDE_BG ? 'Nächstes Wort' : 'Следваща дума'}
    >
      {isDE_BG ? 'Weiter' : 'Напред'} →
    </button>
  </div>
</div>

<style>
  .vocabulary-detail {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    background: var(--color-surface);
    min-height: 100vh;
  }

  /* Header */
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .back-button {
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }

  .back-button:hover {
    background-color: var(--color-surface-hover);
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Word display */
  .word-display-section {
    background: var(--color-surface-elevated);
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 2px solid var(--color-border);
  }

  .word-main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .word-source {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-primary);
    text-align: center;
    flex: 1;
    min-width: 150px;
  }

  .arrow {
    font-size: 1.5rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .word-target {
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-secondary);
    text-align: center;
    flex: 1;
    min-width: 150px;
  }

  /* Quick info badges */
  .quick-info {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .badge-pos {
    background-color: var(--color-info-light);
    color: var(--color-info);
  }

  .badge-difficulty {
    background-color: var(--color-warning-light);
    color: var(--color-warning);
  }

  .badge-category {
    background-color: var(--color-success-light);
    color: var(--color-success);
  }

  .small-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    background-color: var(--color-info-light);
    color: var(--color-info);
  }

  /* Tabs */
  .tabs-navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--color-border);
    overflow-x: auto;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tab-button:hover {
    color: var(--color-primary);
  }

  .tab-button.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  /* Tab content */
  .tabs-content {
    margin-bottom: 2rem;
  }

  .tab-pane {
    animation: fadeIn 0.2s;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tab-pane h3 {
    margin-bottom: 1rem;
    color: var(--color-text-primary);
    font-size: 1.2rem;
  }

  /* Info grid */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .info-item {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .info-item label {
    display: block;
    font-weight: 600;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .info-item div {
    color: var(--color-text-primary);
    font-size: 1rem;
  }

  /* Grammar info */
  .grammar-info {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .grammar-notes {
    margin-bottom: 1rem;
    color: var(--color-text-primary);
  }

  /* Examples list */
  .examples-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .example-item {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .example-source {
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .example-translation {
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 0;
  }

  /* Related words */
  .related-words-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .related-word-item {
    background: var(--color-surface-elevated);
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all 0.2s;
  }

  .related-word-item:hover {
    background-color: var(--color-surface-hover);
    border-color: var(--color-primary);
  }

  .related-word-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .related-word-meta {
    font-size: 0.8rem;
  }

  /* Analysis */
  .analysis-content {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .stat-item {
    margin-top: 1rem;
  }

  .stat-item label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .frequency-bar {
    height: 8px;
    background: var(--color-surface);
    border-radius: 4px;
    overflow: hidden;
  }

  .frequency-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    transition: width 0.3s;
  }

  /* Notes */
  .notes-container {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .notes-input {
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
  }

  /* Sources */
  .sources-content {
    background: var(--color-surface-elevated);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
  }

  .source-info {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .sources-list {
    list-style: disc;
    margin-left: 1.5rem;
    color: var(--color-text-primary);
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 2rem;
    background: var(--color-surface-elevated);
    border-radius: 0.5rem;
    margin: 0;
  }

  .info-text {
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  /* Footer navigation */
  .detail-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
    margin-top: 2rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .nav-button:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .word-counter {
    color: var(--color-text-secondary);
    font-weight: 500;
    white-space: nowrap;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .vocabulary-detail {
      padding: 1rem;
    }

    .word-main {
      flex-direction: column;
      gap: 0.5rem;
    }

    .word-source,
    .word-target {
      font-size: 1.5rem;
    }

    .tabs-navigation {
      gap: 0;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    .tab-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }

    .detail-footer {
      flex-direction: column;
    }

    .nav-button {
      width: 100%;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
