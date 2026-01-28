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

<div class="daily-carousel">
  <!-- Header with progress -->
  <header class="carousel-header">
    <div class="header-content">
      <h2 class="title">Today's Words</h2>
      <p class="subtitle">
        {#if isComplete}
          All done for today! 🎉
        {:else}
          {completedCount}/10 completed
        {/if}
      </p>
    </div>
    
    {#if isComplete}
      <button class="reset-btn" onclick={handleReset}>
        <span>🔄</span>
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
      <div class="complete-state">
        <span class="complete-icon">🎊</span>
        <h3>Congratulations!</h3>
        <p>You've reviewed all 10 words for today.</p>
        
        <div class="stats-summary">
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
    color: #0f172a;
    margin: 0;
  }

  :global(.dark) .title {
    color: #f1f5f9;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .reset-btn:hover {
    background: #2563eb;
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
    border: 2px solid #e2e8f0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
  }

  :global(.dark) .dot {
    border-color: #334155;
    background: #1e293b;
    color: #94a3b8;
  }

  .dot.current {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
    transform: scale(1.1);
  }

  .dot.known {
    border-color: #22c55e;
    background: #22c55e;
    color: white;
  }

  .dot.practice {
    border-color: #f59e0b;
    background: #f59e0b;
    color: white;
  }

  .dot:hover:not(.current):not(.known):not(.practice) {
    border-color: #3b82f6;
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
    background: #f8fafc;
    border-radius: 1.5rem;
    border: 2px dashed #e2e8f0;
  }

  :global(.dark) .loading-state,
  :global(.dark) .empty-state,
  :global(.dark) .complete-state {
    background: #1e293b;
    border-color: #334155;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
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
    color: #0f172a;
    margin: 0;
  }

  :global(.dark) .complete-state h3 {
    color: #f1f5f9;
  }

  .complete-state p {
    color: #64748b;
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
    color: #64748b;
  }

  .stat.known .stat-value {
    color: #22c55e;
  }

  .stat.practice .stat-value {
    color: #f59e0b;
  }

  .practice-weak-btn {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 9999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .practice-weak-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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
    color: #64748b;
  }

  .instruction.left {
    color: #f59e0b;
  }

  .instruction.right {
    color: #22c55e;
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
</style>
