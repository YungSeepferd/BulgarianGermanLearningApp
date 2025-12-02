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
      opacity: [0, 1],
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

  function getDifficultyColor(difficulty: number): string {
    if (difficulty <= 2) return '#28a745'; // green
    if (difficulty <= 4) return '#ffc107'; // yellow
    return '#dc3545'; // red
  }

  function getLevelColor(level: string): string {
    const levelColors: Record<string, string> = {
      'A1': '#28a745',
      'A2': '#17a2b8',
      'B1': '#6f42c1',
      'B2': '#e83e8c',
      'C1': '#fd7e14',
      'C2': '#dc3545'
    };
    return levelColors[level] || '#6c757d';
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

  function toggleTooltips() {
    showTooltips = !showTooltips;
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
          on:click={() => handleItemClick(item)}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleItemClick(item);
            }
          }}
          on:mouseenter={() => handleMouseEnter(item.id)}
          on:mouseleave={handleMouseLeave}
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
            <div class="action-hint">
              <span class="hint-text">Click to practice</span>
              <span class="hint-icon">→</span>
            </div>
          </div>
          
          <div class="item-meta">
            <div class="meta-tags">
              <span
                class="level-tag"
                style="background-color: {getLevelColor(item.level)}20; color: {getLevelColor(item.level)}"
                in:tagAnimation
              >
                {item.level}
              </span>
            
              <span
                class="difficulty-tag"
                style="background-color: {getDifficultyColor(item.difficulty)}20; color: {getDifficultyColor(item.difficulty)}"
                in:tagAnimation
              >
                {item.difficulty}/5
              </span>
            
              <span class="category-tag" in:tagAnimation>
                {item.category}
              </span>
            
              {#if showTooltips}
                <div class="meta-tooltip">
                  <p><strong>Level:</strong> {item.level}</p>
                  <p><strong>Difficulty:</strong> {item.difficulty}/5</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Frequency:</strong> {item.frequency}% common</p>
                  <p><strong>Type:</strong> {item.type === 'word' ? 'Word' : 'Rule'}</p>
                </div>
              {/if}
            </div>
            
            <div class="stats">
              <span class="frequency">
                <span class="stat-icon">📊</span>
                {item.frequency}% common
              </span>
            
              <span class="type">
                <span class="stat-icon">{item.type === 'word' ? '📝' : '📋'}</span>
                {item.type === 'word' ? 'Word' : 'Rule'}
              </span>
            
              {#if showTooltips}
                <div class="stats-tooltip">
                  <p><strong>Frequency:</strong> {item.frequency}% common</p>
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
          
          {#if item.examples && item.examples.length > 0}
            <div class="examples-preview">
              <div class="example-item">
                <span class="example-text">
                  {direction === 'DE->BG' ? item.examples[0].translation : item.examples[0].sentence}
                </span>
                <span class="example-translation">
                  {direction === 'DE->BG' ? item.examples[0].sentence : item.examples[0].translation}
                </span>
              </div>
              {#if item.examples.length > 1}
                <div class="more-examples">
                  +{item.examples.length - 1} more example{item.examples.length - 1 === 1 ? '' : 's'}
                </div>
              {/if}
            </div>
          {/if}
          
          {#if item.notes || item.cultural_note}
            <div class="notes-preview">
              {#if item.notes}
                <div class="note">
                  <span class="note-icon">📝</span>
                  <span class="note-text">{item.notes.slice(0, 100)}{item.notes.length > 100 ? '...' : ''}</span>
                </div>
              {/if}
              
              {#if item.cultural_note}
                <div class="cultural-note">
                  <span class="note-icon">🌍</span>
                  <span class="note-text">{item.cultural_note.slice(0, 100)}{item.cultural_note.length > 100 ? '...' : ''}</span>
                </div>
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

  /* Toggle button for tooltips */
  .tooltips-toggle {
    position: absolute;
    top: -3rem;
    right: 0;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tooltips-toggle:hover {
    background: #e9ecef;
  }

  /* Visual hierarchy improvements */
  .word {
    font-weight: 600;
    transition: font-size 0.2s ease;
  }

  .vocabulary-item:hover .word {
    font-size: 1.3rem;
  }

  .hint-icon {
    transition: transform 0.3s ease, color 0.3s ease;
  }

  .vocabulary-item:hover .hint-icon {
    transform: translateX(4px);
    color: #0056b3;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-state h3 {
    margin-bottom: 0.5rem;
    color: #495057;
  }
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.5rem;
  }
  
  .results-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
  }
  
  .direction-info {
    font-size: 0.9rem;
    color: #6c757d;
    background: #f8f9fa;
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }
  
  .items-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 768px) {
    .items-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .items-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .vocabulary-item {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  
  .vocabulary-item:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .vocabulary-item:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .main-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .word {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.2;
  }
  
  .translation {
    font-size: 1rem;
    color: #007bff;
    font-weight: 500;
  }
  
  .action-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .vocabulary-item:hover .action-hint {
    opacity: 1;
  }
  
  .hint-text {
    font-size: 0.8rem;
    color: #6c757d;
    white-space: nowrap;
  }
  
  .hint-icon {
    font-size: 1rem;
    color: #007bff;
    transition: transform 0.2s ease;
  }
  
  .vocabulary-item:hover .hint-icon {
    transform: translateX(2px);
  }
  
  .item-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .meta-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .level-tag,
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
  
  .frequency,
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
  
  .example-translation {
    color: #007bff;
    font-size: 0.9rem;
  }
  
  .more-examples {
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 0.5rem;
    font-style: italic;
  }
  
  .notes-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .note,
  .cultural-note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .note-icon {
    font-size: 0.9rem;
    margin-top: 0.1rem;
  }
  
  .note-text {
    flex: 1;
    line-height: 1.3;
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