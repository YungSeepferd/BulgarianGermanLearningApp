<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { appState } from '$lib/state/app-state';
  import { formatGermanTerm } from '$lib/utils/formatGerman';

  let {
    items = [],
    direction = 'DE->BG',
    onSelectItem = () => {},
    onToggleSelectItem = () => {},
    selectedItems = new Set<string>(),
    showQuickPractice = true // New prop for "Practice This" feature
  }: {
    items: VocabularyItem[];
    direction: 'DE->BG' | 'BG->DE';
    onSelectItem: (item: VocabularyItem) => void;
    onToggleSelectItem: (itemId: string) => void;
    selectedItems: Set<string>;
    showQuickPractice?: boolean;
  } = $props();

  let hoveredItemId = $state<string | null>(null);
  let showTooltips = $state(false);

  const categoryLabels = {
    de: {
      greetings: 'Begrüßungen',
      numbers: 'Zahlen',
      family: 'Familie',
      food: 'Essen',
      colors: 'Farben',
      animals: 'Tiere',
      body: 'Körper',
      clothing: 'Kleidung',
      house: 'Haus & Wohnen',
      nature: 'Natur',
      transport: 'Verkehr',
      technology: 'Technologie',
      time: 'Zeit',
      weather: 'Wetter',
      professions: 'Berufe',
      places: 'Orte',
      grammar: 'Grammatik',
      culture: 'Kultur',
      common_phrases: 'Alltagsphrasen'
    },
    bg: {
      greetings: 'Поздрави',
      numbers: 'Числа',
      family: 'Семейство',
      food: 'Храна',
      colors: 'Цветове',
      animals: 'Животни',
      body: 'Тяло',
      clothing: 'Облекло',
      house: 'Дом',
      nature: 'Природа',
      transport: 'Транспорт',
      technology: 'Технологии',
      time: 'Време',
      weather: 'Времето',
      professions: 'Професии',
      places: 'Места',
      grammar: 'Граматика',
      culture: 'Култура',
      common_phrases: 'Често срещани изрази'
    }
  } as const;

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        emptyTitle: 'Kein Vokabular gefunden',
        emptyHint: 'Versuche andere Suchbegriffe oder prüfe die Schreibweise.',
        found: (n: number) => `${n} ${n === 1 ? 'Treffer' : 'Treffer'}`,
        showing: 'Zeige Deutsch → Bulgarisch',
        showingReverse: 'Zeige Bulgarisch → Deutsch',
        quickPractice: 'Schnell üben',
        practice: 'Üben',
        selectForPractice: (text: string) => `${text} zum Üben auswählen`,
        quickPracticeLabel: (text: string) => `${text} schnell üben`,
        typeWord: 'Wort',
        typeRule: 'Regel',
        difficulty: 'Schwierigkeit',
        category: 'Kategorie',
        type: 'Typ',
        practiceStats: 'Übungsstatistik',
        correct: 'Richtig',
        incorrect: 'Falsch',
        successRate: 'Erfolgsrate',
        richContext: 'Kontext',
        note: 'Notiz',
        mnemonic: 'Eselsbrücke',
        culturalNote: 'Kulturelle Notiz',
        etymology: 'Etymologie'
      }
    : {
        emptyTitle: 'Няма намерени думи',
        emptyHint: 'Опитайте с други думи или проверете правописа.',
        found: (n: number) => `${n} ${n === 1 ? 'резултат' : 'резултата'}`,
        showing: 'Показва Немски → Български',
        showingReverse: 'Показва Български → Немски',
        quickPractice: 'Бърза практика',
        practice: 'Упражнение',
        selectForPractice: (text: string) => `Избери ${text} за упражнение`,
        quickPracticeLabel: (text: string) => `Бързо упражнявай ${text}`,
        typeWord: 'Дума',
        typeRule: 'Правило',
        difficulty: 'Трудност',
        category: 'Категория',
        type: 'Тип',
        practiceStats: 'Статистика',
        correct: 'Верни',
        incorrect: 'Грешни',
        successRate: 'Успеваемост',
        richContext: 'Контекст',
        note: 'Бележка',
        mnemonic: 'Мнемоника',
        culturalNote: 'Културна бележка',
        etymology: 'Етимология'
      });

  function getCategoryLabel(category?: string) {
    if (!category) return '';
    const labels = appState.languageMode === 'DE_BG' ? categoryLabels.de : categoryLabels.bg;
    return labels[category as keyof typeof labels] ?? category;
  }

  // Animation functions
  function itemAnimation(node: HTMLElement) {
    return fly(node, {
      y: 20,
      opacity: 1,
      duration: 300,
      easing: t => t
    });
  }

  function tagAnimation(node: HTMLElement) {
    return fade(node, {
      duration: 200,
      easing: t => t
    });
  }

  // Data functions
  function getItemText(item: VocabularyItem): string {
    if (direction === 'DE->BG') {
      return formatGermanTerm(item);
    }
    return item.bulgarian;
  }

  function getItemTranslation(item: VocabularyItem): string {
    if (direction === 'DE->BG') return item.bulgarian;
    return formatGermanTerm(item);
  }

  function getDifficultyColor(difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | undefined): string {
    if (!difficulty) return '#6c757d';
    if (['A1', 'A2'].includes(difficulty)) return '#28a745'; // green
    if (['B1', 'B2'].includes(difficulty)) return '#ffc107'; // yellow
    return '#dc3545'; // red
  }


  // Interaction functions
  function handleItemClick(item: VocabularyItem) {
    onSelectItem(item);
  }

  function handleQuickPractice(item: VocabularyItem) {
    appState.startPracticeSession(item);
  }

  function handleMouseEnter(itemId: string) {
    hoveredItemId = itemId;
  }

  function handleMouseLeave() {
    hoveredItemId = null;
  }
</script>

<div class="search-list">
  {#if items.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>{ui.emptyTitle}</h3>
      <p>{ui.emptyHint}</p>
    </div>
  {:else}
    <div class="results-header">
      <h3>{ui.found(items.length)}</h3>
      <div class="direction-info">
        {direction === 'DE->BG' ? ui.showing : ui.showingReverse}
      </div>
    </div>
    
    <div class="items-grid">
      {#each items as item (item.id)}
        <div animate:flip>
          <div
            class="vocabulary-item"
            class:active={hoveredItemId === item.id}
            onmouseenter={() => handleMouseEnter(item.id)}
            onmouseleave={handleMouseLeave}
            role="button"
            tabindex="0"
            in:itemAnimation
          >
          <div class="item-header">
            <div class="main-text">
               <input
                type="checkbox"
                class="item-checkbox"
                checked={selectedItems.has(item.id)}
                onchange={() => onToggleSelectItem(item.id)}
                aria-label={ui.selectForPractice(getItemText(item))}
              />
              <span class="word">{getItemText(item)}</span>
              <span class="translation">{getItemTranslation(item)}</span>
            </div>
            <div class="action-buttons">
              {#if showQuickPractice}
                <button
                  class="practice-btn quick-practice"
                  onclick={() => handleQuickPractice(item)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleQuickPractice(item);
                    }
                  }}
                  aria-label={ui.quickPracticeLabel(getItemText(item))}
                >
                  <span class="btn-icon">⚡</span>
                  <span class="btn-text">{ui.quickPractice}</span>
                </button>
              {/if}
              <button
                class="practice-btn"
                onclick={() => handleItemClick(item)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleItemClick(item);
                  }
                }}
                aria-label={`${ui.practice}: ${getItemText(item)}`}
              >
                <span class="btn-icon">📝</span>
                <span class="btn-text">{ui.practice}</span>
              </button>
            </div>
          </div>

          <div class="item-meta">
            <div class="meta-tags">
              {#if item.level}
                <span
                  class="difficulty-tag"
                  style="background-color: {getDifficultyColor(item.level)}20; color: {getDifficultyColor(item.level)}"
                  in:tagAnimation
                >
                  {item.level}
                </span>
              {/if}

              <span class="category-tag" in:tagAnimation>
                {getCategoryLabel(item.category)}
              </span>

              {#each item.tags || [] as tag}
                <span class="category-tag">{tag}</span>
              {/each}

              {#if showTooltips}
                <div class="meta-tooltip">
                  <p><strong>{ui.difficulty}:</strong> {item.level || 'N/A'}</p>
                  <p><strong>{ui.category}:</strong> {getCategoryLabel(item.category)}</p>
                  <p><strong>{ui.type}:</strong> {item.type === 'word' ? ui.typeWord : ui.typeRule}</p>
                </div>
              {/if}
            </div>

            <div class="stats">
              <span class="type">
                <span class="stat-icon">{item.type === 'word' ? '📝' : '📋'}</span>
                {item.type === 'word' ? ui.typeWord : ui.typeRule}
              </span>

              {#if showTooltips}
                <div class="stats-tooltip">
                  <p><strong>{ui.type}:</strong> {item.type === 'word' ? ui.typeWord : ui.typeRule}</p>
                  {#if item.global_stats}
                    <p><strong>{ui.practiceStats}:</strong></p>
                    <p>{ui.correct}: {item.global_stats.correct_count}</p>
                    <p>{ui.incorrect}: {item.global_stats.incorrect_count}</p>
                    <p>{ui.successRate}: {Math.round(item.global_stats.success_rate)}%</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          {#if item.examples && item.examples.length > 0 && item.examples[0]}
            <div class="examples-preview">
              <div class="example-item">
                <span class="example-text">
                  {item.examples[0].sentence} - {item.examples[0].translation}
                </span>
              </div>
            </div>
          {/if}
          </div>
          {#if hoveredItemId === item.id}
          <div class="rich-context-details" transition:fade>
            <h4>{ui.richContext}</h4>
            {#if (item.literalBreakdown && item.literalBreakdown.length) || (item.metadata?.components && item.metadata.components.length)}
              <p><strong>{ui.etymology}:</strong>
                {#if item.literalBreakdown && item.literalBreakdown.length}
                  {item.literalBreakdown.map((p) => `${p.segment} → ${p.literal}`).join(' + ')}
                {:else}
                  {item.metadata?.components?.map((p) => `${p.part} → ${p.meaning}`).join(' + ')}
                {/if}
              </p>
            {/if}
            {#if item.metadata?.notes}
              <p><strong>{ui.note}:</strong> {item.metadata.notes}</p>
            {/if}
            {#if item.metadata?.mnemonic}
              <p><strong>{ui.mnemonic}:</strong> {item.metadata.mnemonic}</p>
            {/if}
            {#if item.metadata?.culturalNote}
              <p><strong>{ui.culturalNote}:</strong> {item.metadata.culturalNote}</p>
            {/if}
            {#if item.metadata?.etymology}
              <p><strong>{ui.etymology}:</strong> {item.metadata.etymology}</p>
            {/if}
            {#if item.metadata?.links && item.metadata.links.length > 0}
              <p><strong>{appState.languageMode === 'DE_BG' ? 'Wörterbuch' : 'Речници'}:</strong>
                {#each item.metadata.links as link}
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label || 'Link'}</a>
                {/each}
              </p>
            {/if}
          </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  /* Animation styles */
  .vocabulary-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .vocabulary-item.active {
    transform: scale(1.02);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.2);
    z-index: 10;
  }

  /* Tooltip styles */
  .meta-tags, .stats {
    position: relative;
  }

  .meta-tooltip, .stats-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #2c3e50;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    min-width: 200px;
    text-align: left;
  }

  .meta-tags:hover .meta-tooltip,
  .stats:hover .stats-tooltip {
    opacity: 1;
    visibility: visible;
  }

  .meta-tooltip::after, .stats-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #2c3e50 transparent transparent transparent;
  }

  .meta-tooltip p, .stats-tooltip p {
    margin: 0.25rem 0;
  }

  .difficulty-tag,
  .category-tag {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .category-tag {
    background: #e9ecef;
    color: #495057;
  }
  
  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #6c757d;
  }
  
  .type {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stat-icon {
    font-size: 0.9rem;
  }
  
  .examples-preview {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .example-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .example-text {
    font-weight: 500;
    color: #495057;
  }
  
  /* Quick practice button styles */
  .practice-btn.quick-practice {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(247, 147, 30, 0.3);
  }

  .practice-btn.quick-practice:hover {
    background: linear-gradient(135deg, #e55a2b, #e5821a);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(247, 147, 30, 0.4);
  }

  .practice-btn.quick-practice:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(247, 147, 30, 0.3);
  }

  .rich-context-details {
    background-color: #f0f4f8;
    padding: 1rem;
    border-radius: 0 0 12px 12px;
    margin-top: -1rem; /* Overlap with the item above */
    border-top: 1px solid #e0e6ed;
  }
  .rich-context-details h4 {
    margin-top: 0;
    color: #2c3e50;
  }
  .rich-context-details p {
    font-size: 0.9rem;
    color: #495057;
    margin: 0.5rem 0;
  }

  @media (max-width: 768px) {
    .items-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .results-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
    
    .item-header {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .practice-btn {
      flex: 1;
      min-width: 120px;
    }
    
    .stats {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .meta-tags {
      justify-content: center;
    }
  }
</style>