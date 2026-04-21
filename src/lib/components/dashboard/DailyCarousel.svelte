<script lang="ts">
  import { dailyVocabularyService } from '$lib/services/daily-vocabulary.svelte';
  import SwipeableCard from './SwipeableCard.svelte';

  // Props
  let {
    onComplete = () => {}
  }: {
    onComplete?: () => void;
  } = $props();

  // Derived state from service
  const items = $derived(dailyVocabularyService.dailyItems);
  const progress = $derived(dailyVocabularyService.progress);
  const currentIndex = $derived(progress.currentIndex);
  const completedCount = $derived(dailyVocabularyService.completedCount);
  const isComplete = $derived(dailyVocabularyService.isComplete);
  const loading = $derived(dailyVocabularyService.loading);
  const initialized = $derived(dailyVocabularyService.initialized);

  // Handle swipe actions
  function handleSwipeRight() {
    dailyVocabularyService.swipeRight();
    checkCompletion();
  }

  function handleSwipeLeft() {
    dailyVocabularyService.swipeLeft();
    checkCompletion();
  }

  function handleTap() {
    // Card handles its own flip state
  }

  function checkCompletion() {
    if (dailyVocabularyService.isComplete) {
      onComplete();
    }
  }

  function handleReset() {
    dailyVocabularyService.resetProgress();
  }

  // Jump to specific card (for progress dots)
  function goToCard(index: number) {
    dailyVocabularyService.goToIndex(index);
  }

  // Get card status for progress indicators
  function getCardStatus(index: number): 'known' | 'practice' | 'current' | 'pending' {
    const item = items[index];
    if (!item) return 'pending';
    
    if (dailyVocabularyService.wasKnown(item.id)) return 'known';
    if (dailyVocabularyService.needsPractice(item.id)) return 'practice';
    if (index === currentIndex) return 'current';
    return 'pending';
  }
</script>

<div class="daily-carousel" role="region" aria-label="Daily vocabulary practice">
  <!-- Header with progress -->
  <header class="carousel-header">
    <div class="header-content">
      <h2 class="title">Today's Words</h2>
      <p class="subtitle" aria-live="polite" aria-atomic="true">
        {#if isComplete}
          <span class="sr-only">All done for today!</span>
          <span aria-hidden="true">All done for today! 🎉</span>
        {:else}
          <span class="sr-only">{completedCount} of 10 completed</span>
          <span aria-hidden="true">{completedCount}/10 completed</span>
        {/if}
      </p>
    </div>

    {#if isComplete}
      <button
        class="reset-btn"
        onclick={handleReset}
        aria-label="Start over and practice all words again"
      >
        <span aria-hidden="true">🔄</span>
        <span>Practice Again</span>
      </button>
    {/if}
  </header>

  <!-- Progress dots -->
  <nav class="progress-dots" aria-label="Card progress">
    {#each items as _, i}
      {@const status = getCardStatus(i)}
      <button 
        class="dot {status}"
        onclick={() => goToCard(i)}
        aria-label="Card {i + 1}: {status}"
        aria-current={status === 'current' ? 'true' : undefined}
      >
        {#if status === 'known'}
          <span class="dot-icon">✓</span>
        {:else if status === 'practice'}
          <span class="dot-icon">↻</span>
        {:else}
          <span class="dot-number">{i + 1}</span>
        {/if}
      </button>
    {/each}
  </nav>

  <!-- Card stack area -->
  <div class="card-stack">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading today's vocabulary...</p>
      </div>
    {:else if !initialized}
      <div class="empty-state">
        <p>Initializing...</p>
      </div>
    {:else if items.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📚</span>
        <h3>No vocabulary loaded</h3>
        <p>Please check your connection and try again.</p>
      </div>
    {:else if isComplete}
      <div class="complete-state" role="status" aria-live="polite" aria-atomic="true">
        <span class="complete-icon" aria-hidden="true">🎊</span>
        <h3>Congratulations!</h3>
        <p>You've reviewed all 10 words for today.</p>
        <p class="sr-only">
          Summary: {progress.swipedRight.length} words marked as known,
          {progress.swipedLeft.length} words need more practice.
        </p>

        <div class="stats-summary" aria-hidden="true">
          <div class="stat known">
            <span class="stat-value">{progress.swipedRight.length}</span>
            <span class="stat-label">Known</span>
          </div>
          <div class="stat practice">
            <span class="stat-value">{progress.swipedLeft.length}</span>
            <span class="stat-label">Need practice</span>
          </div>
        </div>

        <button class="practice-weak-btn" onclick={handleReset}>
          Practice All Again
        </button>
      </div>
    {:else}
      <!-- Active cards -->
      {#each items as item, i (item.id)}
        <SwipeableCard
          {item}
          isActive={i === currentIndex}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onTap={handleTap}
        />
      {/each}
    {/if}
  </div>

  <!-- Keyboard instructions for screen readers -->
  <div class="sr-only" role="note" aria-label="Keyboard instructions">
    Use arrow keys to swipe cards. Left arrow for "need practice", Right arrow for "know it". Space or Enter to flip card.
  </div>

  <!-- Swipe instruction (shown only when cards are active) -->
  {#if !isComplete && items.length > 0 && !loading}
    <footer class="swipe-instructions">
      <div class="instruction left">
        <span class="arrow">←</span>
        <span>Practice more</span>
      </div>
      <div class="instruction center">
        <span>Tap to flip</span>
      </div>
      <div class="instruction right">
        <span>Got it!</span>
        <span class="arrow">→</span>
      </div>
    </footer>
  {/if}
</div>

<style>
  .daily-carousel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 500px;
    max-height: 100vh;
    padding: 1rem;
    gap: 1rem;
  }

  /* Header */
  .carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .subtitle {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: var(--bg-base);
    border: none;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .reset-btn:hover {
    background: var(--accent);
    opacity: 0.9;
  }

  /* Progress dots */
  .progress-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .dot {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 2px solid var(--border-default);
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .dot.current {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg-base);
    transform: scale(1.1);
  }

  .dot.known {
    border-color: var(--success);
    background: var(--success);
    color: var(--bg-base);
  }

  .dot.practice {
    border-color: var(--warning);
    background: var(--warning);
    color: var(--bg-base);
  }

  .dot:hover:not(.current):not(.known):not(.practice) {
    border-color: var(--accent);
  }

  .dot-icon {
    font-size: 0.875rem;
  }

  /* Card stack */
  .card-stack {
    flex: 1;
    position: relative;
    min-height: 300px;
    max-height: 500px;
  }

  /* States */
  .loading-state,
  .empty-state,
  .complete-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    gap: 1rem;
    padding: 2rem;
    background: var(--bg-surface);
    border-radius: 1.5rem;
    border: 2px dashed var(--border-default);
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid var(--border-default);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-icon,
  .complete-icon {
    font-size: 4rem;
  }

  .complete-state h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0;
  }

  .complete-state p {
    color: var(--text-secondary);
    margin: 0;
  }

  .stats-summary {
    display: flex;
    gap: 2rem;
    margin: 1rem 0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .stat.known .stat-value {
    color: var(--success);
  }

  .stat.practice .stat-value {
    color: var(--warning);
  }

  .practice-weak-btn {
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: var(--bg-base);
    border: none;
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .practice-weak-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  /* Instructions footer */
  .swipe-instructions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    flex-shrink: 0;
  }

  .instruction {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .instruction.left {
    color: var(--warning);
  }

  .instruction.right {
    color: var(--success);
  }

  .instruction.center {
    font-style: italic;
    opacity: 0.7;
  }

  .arrow {
    font-size: 1rem;
    font-weight: bold;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .daily-carousel {
      padding: 0.75rem;
    }

    .title {
      font-size: 1.25rem;
    }

    .dot {
      width: 1.75rem;
      height: 1.75rem;
    }

    .card-stack {
      min-height: 350px;
    }
  }

  @media (min-height: 800px) {
    .card-stack {
      max-height: 550px;
    }
  }

  /* Screen reader only - visually hidden but accessible */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
