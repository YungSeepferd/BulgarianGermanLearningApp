<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary.js';
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  let {
    items = [],
    direction = 'DE->BG',
    onSelectItem = () => {}
  }: {
    items: VocabularyItem[];
    direction: 'DE->BG' | 'BG->DE';
    onSelectItem: (item: VocabularyItem) => void;
  } = $props();

  let hoveredItemId = $state<string | null>(null);
  let showTooltips = $state(false);

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
    return direction === 'DE->BG' ? item.german : item.bulgarian;
  }

  function getItemTranslation(item: VocabularyItem): string {
    return direction === 'DE->BG' ? item.bulgarian : item.german;
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
      <h3>No vocabulary found</h3>
      <p>Try searching with different keywords or check your spelling</p>
    </div>
  {:else}
    <div class="results-header">
      <h3>Found {items.length} {items.length === 1 ? 'word' : 'words'}</h3>
      <div class="direction-info">
        Showing {direction === 'DE->BG' ? 'German' : 'Bulgarian'} → {direction === 'DE->BG' ? 'Bulgarian' : 'German'}
      </div>
    </div>
    
    <div class="items-grid">
      {#each items as item (item.id)}
        <div
          class="vocabulary-item"
          class:active={hoveredItemId === item.id}
          onmouseenter={() => handleMouseEnter(item.id)}
          onmouseleave={handleMouseLeave}
          role="button"
          tabindex="0"
          in:itemAnimation
          animate:flip
        >
          <div class="item-header">
            <div class="main-text">
              <span class="word">{getItemText(item)}</span>
              <span class="translation">{getItemTranslation(item)}</span>
            </div>
            <div class="action-buttons">
              <button
                class="practice-btn"
                onclick={() => handleItemClick(item)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleItemClick(item);
                  }
                }}
                aria-label={`Practice ${getItemText(item)}`}
              >
                <span class="btn-icon">📝</span>
                <span class="btn-text">Practice</span>
              </button>
            </div>
          </div>

          <div class="item-meta">
            <div class="meta-tags">
              {#if item.difficulty}
                <span
                  class="difficulty-tag"
                  style="background-color: {getDifficultyColor(item.difficulty)}20; color: {getDifficultyColor(item.difficulty)}"
                  in:tagAnimation
                >
                  {item.difficulty}
                </span>
              {/if}

              <span class="category-tag" in:tagAnimation>
                {item.category}
              </span>

              {#each item.tags || [] as tag}
                <span class="category-tag">{tag}</span>
              {/each}

              {#if showTooltips}
                <div class="meta-tooltip">
                  <p><strong>Difficulty:</strong> {item.difficulty || 'N/A'}</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Type:</strong> {item.type === 'word' ? 'Word' : 'Rule'}</p>
                </div>
              {/if}
            </div>

            <div class="stats">
              <span class="type">
                <span class="stat-icon">{item.type === 'word' ? '📝' : '📋'}</span>
                {item.type === 'word' ? 'Word' : 'Rule'}
              </span>

              {#if showTooltips}
                <div class="stats-tooltip">
                  <p><strong>Type:</strong> {item.type === 'word' ? 'Word' : 'Rule'}</p>
                  {#if item.global_stats}
                    <p><strong>Practice Stats:</strong></p>
                    <p>Correct: {item.global_stats.correct_count}</p>
                    <p>Incorrect: {item.global_stats.incorrect_count}</p>
                    <p>Success Rate: {Math.round(item.global_stats.success_rate)}%</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          {#if item.example}
            <div class="examples-preview">
              <div class="example-item">
                <span class="example-text">
                  {item.example}
                </span>
              </div>
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
  
  @media (max-width: 768px) {
    .results-header {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
    
    .item-header {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .action-hint {
      justify-content: center;
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