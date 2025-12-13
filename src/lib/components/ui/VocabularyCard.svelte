<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { appState } from '$lib/state/app-state';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { APP_ICONS, PRACTICE_ICONS } from '$lib/constants/icons';
  import ActionButton from '$lib/components/ui/ActionButton.svelte';

  // Props with Svelte 5 runes
  let {
    item,
    variant = 'grid', // 'grid' | 'list' | 'flashcard' | 'lesson'
    direction = appState.languageMode === 'DE_BG' ? 'DE->BG' : 'BG->DE',
    isSelected = false,
    isFlipped = false,
    showMetadata = true,
    showActions = true,
    showTags = true,
    onPractice = () => {},
    onQuickPractice = () => {},
    onToggleSelect = () => {},
    onFlip = () => {},
    onOpenDetail = () => {}
  }: {
    item: VocabularyItem;
    variant?: 'grid' | 'list' | 'flashcard' | 'lesson';
    direction?: 'DE->BG' | 'BG->DE';
    isSelected?: boolean;
    isFlipped?: boolean;
    showMetadata?: boolean;
    showActions?: boolean;
    showTags?: boolean;
    onPractice?: (item: VocabularyItem) => void;
    onQuickPractice?: (item: VocabularyItem) => void;
    onToggleSelect?: (itemId: string) => void;
    onFlip?: () => void;
    onOpenDetail?: (item: VocabularyItem) => void;
  } = $props();

  // Derived state
  const isDE_BG = $derived(direction === 'DE->BG');
  const sourceText = $derived(isDE_BG ? item.german : item.bulgarian);
  const targetText = $derived(isDE_BG ? item.bulgarian : item.german);
  const arrowDirection = $derived(isDE_BG ? '→' : '←');

  // Card class based on variant
  const cardClass = $derived.by(() => {
    const base = 'vocabulary-card';
    const variantClass = `variant-${variant}`;
    const selectedClass = isSelected ? 'selected' : '';
    const flippedClass = isFlipped && variant === 'flashcard' ? 'flipped' : '';
    return `${base} ${variantClass} ${selectedClass} ${flippedClass}`.trim();
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

    const labels = appState.languageMode === 'DE_BG' ? categoryLabels.de : categoryLabels.bg;
    return labels[category as keyof typeof labels] ?? category;
  }

  // Get part of speech label
  function getPartOfSpeechLabel(pos?: string): string {
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
        number: 'Zahlwort',
        phrase: 'Phrase'
      },
      bg: {
        noun: 'Съществително',
        verb: 'Глагол',
        adjective: 'Прилагателното',
        adverb: 'Наречие',
        pronoun: 'Местоимение',
        preposition: 'Предлог',
        conjunction: 'Съюз',
        interjection: 'Междуметие',
        article: 'Член',
        number: 'Числително',
        phrase: 'Фраза'
      }
    } as const;

    const lang = appState.languageMode === 'DE_BG' ? 'de' : 'bg';
    return labels[lang][pos as keyof typeof labels['de']] ?? pos;
  }

  // Handle practice click
  function handlePracticeClick(e: Event) {
    e.stopPropagation();
    onPractice(item);
  }

  // Handle quick practice click
  function handleQuickPracticeClick(e: Event) {
    e.stopPropagation();
    onQuickPractice(item);
  }

  // Handle select/checkbox
  function handleToggleSelect(e: Event) {
    e.stopPropagation();
    onToggleSelect(item.id);
  }

  // Handle card click (open detail modal)
  function handleCardClick(e: Event) {
    // Don't open detail if clicking buttons/checkboxes
    const target = e.target as HTMLElement;
    if (target.closest('button, input[type="checkbox"], .action-buttons, .card-actions')) {
      return;
    }
    onOpenDetail(item);
  }

  // Handle flip for flashcard variant
  function handleFlipClick() {
    onFlip();
  }
</script>

<!-- GRID VARIANT: Vocabulary page compact grid cards -->
{#if variant === 'grid'}
  <div class={cardClass} transition:fade={{ duration: 200 }} onclick={handleCardClick} role="button" tabindex="0">
    <!-- Card Tags -->
    {#if showTags}
      <div class="card-tags">
        <span class="tag cerf-tag">{item.cefrLevel}</span>
        <span class="tag category-tag">{getCategoryLabel(item.categories[0])}</span>
        <span class="tag pos-tag">{getPartOfSpeechLabel(item.partOfSpeech)}</span>
      </div>
    {/if}

    <!-- Card Content -->
    <div class="card-content">
      <div class="vocab-pair">
        <div class="vocab-term source-lang">{sourceText}</div>
        <div class="vocab-arrow">{arrowDirection}</div>
        <div class="vocab-term target-lang">{targetText}</div>
      </div>

      <!-- Examples preview -->
      {#if showMetadata && item.metadata?.examples && item.metadata.examples.length > 0}
        <div class="examples-preview">
          <span class="example-label">{APP_ICONS.EXAMPLE}</span>
          <span class="example-text">
            {isDE_BG ? item.metadata.examples[0]?.german : item.metadata.examples[0]?.bulgarian}
          </span>
        </div>
      {/if}
    </div>

    <!-- Card Actions -->
    {#if showActions}
      <div class="card-actions">
        <ActionButton
          label={appState.languageMode === 'DE_BG' ? 'Üben' : 'Упражнявай'}
          variant="practice"
          size="sm"
          icon={PRACTICE_ICONS.STANDARD}
          on:click={handlePracticeClick}
        />
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={isSelected}
            onchange={handleToggleSelect}
            aria-label={appState.languageMode === 'DE_BG' ? 'Zum Üben auswählen' : 'Избери за упражнение'}
          />
          <span></span>
        </label>
      </div>
    {/if}
  </div>

  <!-- LIST VARIANT: SearchList result cards -->
{:else if variant === 'list'}
  <div
    class={cardClass}
    transition:fade={{ duration: 200 }}
    onclick={handleCardClick}
    role="button"
    tabindex="0"
  >
    <div class="item-header">
      <div class="item-head-left">
        <label class="item-select">
          <input
            type="checkbox"
            class="item-checkbox"
            checked={isSelected}
            onchange={handleToggleSelect}
            aria-label={appState.languageMode === 'DE_BG' ? 'Zum Üben auswählen' : 'Избери за упражнение'}
          />
          <span class="direction-pill">
            {direction === 'DE->BG' ? 'Deutsch → Bulgarisch' : 'Български → Немски'}
          </span>
        </label>
        <div class="term-row">
          <span class="word">{sourceText}</span>
          <span class="arrow">{arrowDirection}</span>
          <span class="translation">{targetText}</span>
        </div>
      </div>

      {#if showActions}
        <div class="action-buttons">
          <ActionButton
            label={appState.languageMode === 'DE_BG' ? 'Üben' : 'Упражнявай'}
            variant="practice"
            size="sm"
            icon={PRACTICE_ICONS.STANDARD}
            on:click={handlePracticeClick}
          />
          <button
            class="quick-practice-btn"
            onclick={handleQuickPracticeClick}
            aria-label={appState.languageMode === 'DE_BG' ? 'Sofort üben' : 'Бързо упражнение'}
            title={appState.languageMode === 'DE_BG' ? 'Sofort üben' : 'Бързо упражнение'}
          >
            <span>{PRACTICE_ICONS.QUICK}</span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Metadata & Tags -->
    {#if showMetadata}
      <div class="item-meta">
        <div class="meta-tags">
          {#if item.cefrLevel}
            <span class="difficulty-tag">{item.cefrLevel}</span>
          {/if}
          <span class="category-tag">{getCategoryLabel(item.categories[0])}</span>
          {#each item.tags || [] as tag}
            <span class="category-tag">{tag}</span>
          {/each}
        </div>

        <div class="stats">
          <span class="type">
            <span class="stat-icon">{APP_ICONS.VOCABULARY}</span>
            {getPartOfSpeechLabel(item.partOfSpeech)}
          </span>
        </div>
      </div>
    {/if}

    <!-- Examples preview -->
    {#if showMetadata && item.metadata?.examples && item.metadata.examples.length > 0}
      <div class="examples-preview">
        <div class="examples-header">{appState.languageMode === 'DE_BG' ? 'Beispiele' : 'Примери'}</div>
        {#each item.metadata.examples.slice(0, 2) as example}
          <div class="example-item">
            <span class="example-text">{isDE_BG ? example.german : example.bulgarian}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- FLASHCARD VARIANT: Learn page flip cards -->
{:else if variant === 'flashcard'}
  <div class={cardClass} transition:fade={{ duration: 200 }}>
    <div class="flashcard-inner" onclick={handleFlipClick} role="button" tabindex="0">
      {#if !isFlipped}
        <!-- Front side (question) -->
        <div class="flashcard-front" transition:fade={{ duration: 300 }}>
          <div class="flashcard-label">{appState.languageMode === 'DE_BG' ? 'Frage' : 'Въпрос'}</div>
          <div class="flashcard-content">
            <div class="flashcard-text">{sourceText}</div>
            <div class="flashcard-hint">{appState.languageMode === 'DE_BG' ? 'Klicken zum Umdrehen' : 'Кликнете за преглед'}</div>
          </div>
        </div>
      {:else}
        <!-- Back side (answer) -->
        <div class="flashcard-back" transition:fade={{ duration: 300 }}>
          <div class="flashcard-label">{appState.languageMode === 'DE_BG' ? 'Antwort' : 'Отговор'}</div>
          <div class="flashcard-content">
            <div class="flashcard-text">{targetText}</div>

            <!-- Metadata sections on back -->
            {#if showMetadata}
              {#if item.metadata?.mnemonic}
                <div class="flashcard-section">
                  <div class="flashcard-section-title">{APP_ICONS.MNEMONIC} {appState.languageMode === 'DE_BG' ? 'Eselsbrücke' : 'Мнемоника'}</div>
                  <div class="flashcard-section-content">{item.metadata.mnemonic}</div>
                </div>
              {/if}

              {#if item.metadata?.examples && item.metadata.examples.length > 0}
                <div class="flashcard-section">
                  <div class="flashcard-section-title">{APP_ICONS.EXAMPLE} {appState.languageMode === 'DE_BG' ? 'Beispiel' : 'Пример'}</div>
                  <div class="flashcard-section-content">
                    {isDE_BG ? item.metadata.examples[0]?.german : item.metadata.examples[0]?.bulgarian}
                  </div>
                </div>
              {/if}

              {#if item.metadata?.culturalNote}
                <div class="flashcard-section">
                  <div class="flashcard-section-title">{APP_ICONS.CULTURAL_NOTE} {appState.languageMode === 'DE_BG' ? 'Kulturelle Notiz' : 'Културна бележка'}</div>
                  <div class="flashcard-section-content">{item.metadata.culturalNote}</div>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/if}
    </div>

    {#if showActions}
      <div class="flashcard-actions">
        <ActionButton
          label={appState.languageMode === 'DE_BG' ? 'Leicht' : 'Лесно'}
          variant="success"
          size="sm"
          on:click={() => onQuickPractice(item)}
        />
        <ActionButton
          label={appState.languageMode === 'DE_BG' ? 'Normal' : 'Нормално'}
          variant="primary"
          size="sm"
          on:click={() => onPractice(item)}
        />
        <ActionButton
          label={appState.languageMode === 'DE_BG' ? 'Schwer' : 'Трудно'}
          variant="danger"
          size="sm"
          on:click={() => onPractice(item)}
        />
      </div>
    {/if}
  </div>

  <!-- LESSON VARIANT: Lesson preview cards -->
{:else if variant === 'lesson'}
  <div class={cardClass} transition:fade={{ duration: 200 }} onclick={handleCardClick} role="button" tabindex="0">
    <div class="lesson-card-content">
      <div class="lesson-header">
        <h3 class="lesson-title">{sourceText}</h3>
        {#if item.cefrLevel}
          <span class="lesson-difficulty">{item.cefrLevel}</span>
        {/if}
      </div>

      {#if item.metadata?.summary}
        <p class="lesson-summary">{item.metadata.summary}</p>
      {/if}

      {#if showTags && item.categories}
        <div class="lesson-tags">
          {#each item.categories as category}
            <span class="tag">{getCategoryLabel(category)}</span>
          {/each}
        </div>
      {/if}

      {#if showActions}
        <div class="lesson-actions">
          <ActionButton
            label={appState.languageMode === 'DE_BG' ? 'Lernen' : 'Учи'}
            variant="learn"
            size="md"
            icon={APP_ICONS.LEARN}
            on:click={handlePracticeClick}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Base card styles */
  .vocabulary-card {
    display: flex;
    flex-direction: column;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .vocabulary-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  .vocabulary-card.selected {
    background-color: #eff6ff;
    border-color: #3b82f6;
  }

  /* GRID VARIANT STYLES */
  .variant-grid {
    padding: 1rem;
    gap: 0.75rem;
  }

  .variant-grid .card-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .card-tags {
    margin-bottom: 0.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .cerf-tag {
    background-color: #dbeafe;
    color: #0c4a6e;
  }

  .category-tag {
    background-color: #f0fdf4;
    color: #166534;
  }

  .pos-tag {
    background-color: #fdf2f8;
    color: #831843;
  }

  .card-content {
    flex-grow: 1;
    margin-bottom: 0.75rem;
  }

  .vocab-pair {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .vocab-term {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .vocab-term.source-lang {
    color: #1f2937;
    flex: 1;
  }

  .vocab-term.target-lang {
    color: #0ea5e9;
    flex: 1;
  }

  .vocab-arrow {
    color: #9ca3af;
    font-weight: 300;
    flex-shrink: 0;
  }

  .examples-preview {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.4;
  }

  .example-label {
    flex-shrink: 0;
    font-size: 1rem;
  }

  .example-text {
    display: -webkit-box;
    display: block;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f3f4f6;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .checkbox-label input {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: #3b82f6;
  }

  /* LIST VARIANT STYLES */
  .variant-list {
    padding: 1rem;
    gap: 0.75rem;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .item-head-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .item-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .item-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: #3b82f6;
  }

  .direction-pill {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #0369a1;
    font-weight: 500;
  }

  .term-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .term-row .word {
    color: #1f2937;
  }

  .term-row .arrow {
    color: #9ca3af;
  }

  .term-row .translation {
    color: #0ea5e9;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quick-practice-btn {
    padding: 0.6rem 0.8rem;
    background-color: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s ease;
  }

  .quick-practice-btn:hover {
    background-color: #fde68a;
    transform: scale(1.05);
  }

  .item-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .meta-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .difficulty-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #dbeafe;
    color: #0c4a6e;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #6b7280;
  }

  .type {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .stat-icon {
    font-size: 1rem;
  }

  /* FLASHCARD VARIANT STYLES */
  .variant-flashcard {
    padding: 0;
    perspective: 1000px;
  }

  .flashcard-inner {
    position: relative;
    width: 100%;
    min-height: 300px;
    cursor: pointer;
    background-color: white;
    border-radius: 8px;
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    min-height: 300px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border: 2px solid #e5e7eb;
  }

  .flashcard-front {
    background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
  }

  .flashcard-back {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }

  .flashcard-label {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .flashcard-content {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .flashcard-text {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.3;
  }

  .flashcard-hint {
    font-size: 0.85rem;
    color: #9ca3af;
    font-style: italic;
  }

  .flashcard-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    text-align: left;
  }

  .flashcard-section-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .flashcard-section-content {
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.5;
  }

  .flashcard-actions {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1rem;
  }

  /* LESSON VARIANT STYLES */
  .variant-lesson {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .lesson-card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lesson-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .lesson-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
  }

  .lesson-difficulty {
    padding: 0.25rem 0.75rem;
    background-color: #dbeafe;
    color: #0c4a6e;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .lesson-summary {
    margin: 0;
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.6;
  }

  .lesson-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .lesson-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .variant-grid {
      padding: 0.75rem;
    }

    .item-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-buttons {
      width: 100%;
    }

    .flashcard-text {
      font-size: 1.5rem;
    }

    .flashcard-inner {
      min-height: 250px;
    }

    .flashcard-front,
    .flashcard-back {
      min-height: 250px;
      padding: 1.5rem;
    }
  }
</style>
