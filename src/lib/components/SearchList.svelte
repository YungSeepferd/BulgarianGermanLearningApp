<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { appState } from '$lib/state/app-state';
  import { formatGermanTerm } from '$lib/utils/formatGerman';
  import { APP_ICONS, PRACTICE_ICONS } from '$lib/constants/icons';
  import EnrichmentBadge from '$lib/components/vocabulary/EnrichmentBadge.svelte';
  import DefinitionLink from '$lib/components/vocabulary/DefinitionLink.svelte';
  import WordDetailModal from '$lib/components/vocabulary/WordDetailModal.svelte';
  import VocabularyCard from '$lib/components/ui/VocabularyCard.svelte';

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
  let selectedItemForDetail = $state<VocabularyItem | null>(null);
  let showDetailModal = $state(false);

  function openDetailModal(item: VocabularyItem) {
    selectedItemForDetail = item;
    showDetailModal = true;
  }

  function closeDetailModal() {
    showDetailModal = false;
    selectedItemForDetail = null;
  }

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

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        emptyTitle: 'Kein Vokabular gefunden',
        emptyHint: 'Versuche andere Suchbegriffe oder prüfe die Schreibweise.',
        found: (n: number) => `${n} ${n === 1 ? 'Treffer' : 'Treffer'}`,
        showing: 'Deutsch → Bulgarisch',
        showingReverse: 'Bulgarisch → Deutsch',
        quickPractice: 'Sofort üben',
        practice: 'Üben',
        selectForPractice: (text: string) => `${text} zum Üben auswählen`,
        quickPracticeLabel: (text: string) => `${text} sofort üben`,
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
        etymology: 'Etymologie',
        sourceLang: 'Deutsch',
        targetLang: 'Bulgarisch',
        enrich: 'Wörterbuch',
        context: 'Kontext',
        examples: 'Beispiele'
      }
    : {
        emptyTitle: 'Няма намерени думи',
        emptyHint: 'Опитайте с други думи или проверете правописа.',
        found: (n: number) => `${n} ${n === 1 ? 'резултат' : 'резултата'}`,
        showing: 'Немски → Български',
        showingReverse: 'Български → Немски',
        quickPractice: 'Бързо упражнение',
        practice: 'Упражнявай',
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
        etymology: 'Етимология',
        sourceLang: 'Немски',
        targetLang: 'Български',
        enrich: 'Речник',
        context: 'Контекст',
        examples: 'Примери'
      });

  function getCategoryLabel(category?: string) {
    if (!category) return '';
    const labels = appState.languageMode === 'DE_BG' ? categoryLabels.de : categoryLabels.bg;
    return labels[category as keyof typeof labels] ?? category;
  }

  // Simple fade animation (no weird expand)
  function itemAnimation(node: HTMLElement) {
    return fade(node, { duration: 200 });
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
  function handleItemClick(item: VocabularyItem, event?: MouseEvent | KeyboardEvent) {
    // Prevent opening modal if clicking checkbox or buttons
    if (event && (event.target as HTMLElement).closest('input, button')) {
      return;
    }
    openDetailModal(item);
  }

  function handlePracticeClick(item: VocabularyItem, event: MouseEvent) {
    event.stopPropagation(); // Prevent modal from opening
    onSelectItem(item); // Start practice session
  }

  function handleQuickPractice(item: VocabularyItem, event: MouseEvent) {
    event.stopPropagation(); // Prevent modal from opening
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
          <VocabularyCard
            {item}
            variant="list"
            direction={direction === 'DE->BG' ? 'DE->BG' : 'BG->DE'}
            isSelected={selectedItems.has(item.id)}
            showMetadata={true}
            showActions={true}
            showTags={true}
            onPractice={() => handlePracticeClick(item, new MouseEvent('click'))}
            onQuickPractice={() => handleQuickPractice(item, new MouseEvent('click'))}
            onToggleSelect={() => onToggleSelectItem(item.id)}
          />
        </div>
      {/each}
    </div>
  {/if}
  
  <!-- Word Detail Modal -->
  {#if selectedItemForDetail}
    <WordDetailModal 
      item={selectedItemForDetail} 
      open={showDetailModal} 
      onClose={closeDetailModal} 
    />
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
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
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

  .item-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #6c757d;
  }

  .direction-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .term-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .word {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
  }

  .arrow {
    color: #6b7280;
    font-weight: 700;
  }

  .translation {
    font-size: 1rem;
    color: #374151;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .practice-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 10px;
    padding: 0.5rem 0.9rem;
    border: 1px solid #e5e7eb;
    background: white;
    color: #111827;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .practice-btn.primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    border: none;
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.2);
  }

  .practice-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
  }

  .practice-btn.ghost {
    background: #f9fafb;
    color: #111827;
    border-color: #e5e7eb;
    padding: 0.5rem 0.65rem;
  }

  .practice-btn.ghost:hover {
    background: #eef2ff;
    transform: translateY(-1px);
  }

  .btn-icon {
    font-size: 0.95rem;
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
    padding: 0.9rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .examples-header {
    font-weight: 700;
    font-size: 0.9rem;
    color: #1f2937;
    letter-spacing: 0.01em;
  }

  .enrichment-section {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem;
    margin: 0.5rem 0 0.75rem;
    border-radius: 8px;
    background: #f0f7ff;
    border: 1px solid #dbeafe;
  }

  .section-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #1d4ed8;
  }
  
  .example-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .example-text {
    font-weight: 600;
    color: #111827;
  }

  .example-translation {
    color: #374151;
    font-size: 0.95rem;
  }

  .example-context {
    color: #6b7280;
    font-size: 0.85rem;
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
      align-items: flex-start;
    }

    .item-head-left {
      width: 100%;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-start;
      width: 100%;
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