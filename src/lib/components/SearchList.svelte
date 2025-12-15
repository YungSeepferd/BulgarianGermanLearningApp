<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { flip } from 'svelte/animate';
  import { appState } from '$lib/state/app-state';
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

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        emptyTitle: 'Kein Vokabular gefunden',
        emptyHint: 'Versuche andere Suchbegriffe oder prüfe die Schreibweise.',
        found: (n: number) => `${n} ${n === 1 ? 'Treffer' : 'Treffer'}`,
        showing: 'Deutsch → Bulgarisch',
        showingReverse: 'Bulgarisch → Deutsch'
      }
    : {
        emptyTitle: 'Няма намерени думи',
        emptyHint: 'Опитайте с други думи или проверете правописа.',
        found: (n: number) => `${n} ${n === 1 ? 'резултат' : 'резултата'}`,
        showing: 'Немски → Български',
        showingReverse: 'Български → Немски'
      });

  // Interaction functions
  function handlePracticeClick(item: VocabularyItem, event: MouseEvent) {
    event.stopPropagation(); // Prevent modal from opening
    onSelectItem(item); // Start practice session
  }

  function handleQuickPractice(item: VocabularyItem, event: MouseEvent) {
    event.stopPropagation(); // Prevent modal from opening
    appState.startPracticeSession(item);
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
        <div animate:flip={{ duration: 300 }}>
          <VocabularyCard
            {item}
            variant="list"
            direction={direction === 'DE->BG' ? 'DE->BG' : 'BG->DE'}
            isSelected={selectedItems.has(item.id)}
            showMetadata={true}
            showActions={showQuickPractice}
            showTags={true}
            onPractice={() => handlePracticeClick(item, new MouseEvent('click'))}
            onQuickPractice={() => handleQuickPractice(item, new MouseEvent('click'))}
            onToggleSelect={() => onToggleSelectItem(item.id)}
            onOpenDetail={() => openDetailModal(item)}
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

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: #f9fafb;
    border-radius: 12px;
    border: 2px dashed #e5e7eb;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .results-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .direction-info {
    font-size: 0.9rem;
    color: #6b7280;
    font-weight: 500;
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
  }
</style>