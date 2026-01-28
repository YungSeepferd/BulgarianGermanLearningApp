<script lang="ts">
  import { spring } from 'svelte/motion';
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { appState } from '$lib/state/app-state';

  // Props
  let {
    item,
    isActive = false,
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onTap = () => {}
  }: {
    item: VocabularyItem;
    isActive?: boolean;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onTap?: () => void;
  } = $props();

  // State
  let isFlipped = $state(false);
  let isDragging = $state(false);
  let startX = $state(0);
  let startY = $state(0);
  let cardElement: HTMLElement;

  // Spring animation for smooth movement
  const position = spring({ x: 0, y: 0 }, {
    stiffness: 0.2,
    damping: 0.8
  });

  const rotation = spring(0, {
    stiffness: 0.2,
    damping: 0.8
  });

  // Derived state
  const isDE_BG = $derived(appState.languageMode === 'DE_BG');
  const sourceText = $derived(isDE_BG ? item.german : item.bulgarian);
  const targetText = $derived(isDE_BG ? item.bulgarian : item.german);

  // Get category display
  function getCategoryDisplay(categories?: string[]): string {
    if (!categories || categories.length === 0) return '';
    const firstCategory = categories[0];
    if (!firstCategory) return '';
    return firstCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get part of speech display
  function getPartOfSpeechDisplay(pos?: string): string {
    if (!pos || pos === 'unknown') return '';
    const labels: Record<string, string> = {
      noun: 'Noun',
      verb: 'Verb',
      adjective: 'Adj',
      adverb: 'Adv',
      pronoun: 'Pron',
      preposition: 'Prep',
      conjunction: 'Conj',
      phrase: 'Phrase'
    };
    return labels[pos] || pos;
  }

  // Touch/Mouse handlers
  function handlePointerDown(e: PointerEvent) {
    if (!isActive) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    cardElement?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging || !isActive) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    position.set({ x: deltaX, y: deltaY * 0.3 });
    rotation.set(deltaX * 0.05);
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    
    isDragging = false;
    cardElement?.releasePointerCapture(e.pointerId);
    
    const deltaX = e.clientX - startX;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      // Swipe detected
      if (deltaX > 0) {
        // Swipe right - "I know this"
        animateOffScreen('right');
      } else {
        // Swipe left - "Need practice"
        animateOffScreen('left');
      }
    } else {
      // Return to center (tap detected if minimal movement)
      position.set({ x: 0, y: 0 });
      rotation.set(0);
      
      if (Math.abs(deltaX) < 10 && Math.abs(e.clientY - startY) < 10) {
        handleTap();
      }
    }
  }

  function animateOffScreen(direction: 'left' | 'right') {
    const exitX = direction === 'right' ? 500 : -500;
    position.set({ x: exitX, y: 0 });
    rotation.set(direction === 'right' ? 30 : -30);
    
    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      // Reset for next card
      position.set({ x: 0, y: 0 }, { hard: true });
      rotation.set(0, { hard: true });
      isFlipped = false;
    }, 200);
  }

  function handleTap() {
    isFlipped = !isFlipped;
    onTap();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isActive) return;
    
    if (e.key === 'ArrowRight') {
      animateOffScreen('right');
    } else if (e.key === 'ArrowLeft') {
      animateOffScreen('left');
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleTap();
    }
  }
</script>

<div
  bind:this={cardElement}
  class="swipeable-card"
  class:active={isActive}
  class:flipped={isFlipped}
  class:dragging={isDragging}
  style="transform: translateX({$position.x}px) translateY({$position.y}px) rotate({$rotation}deg)"
  role="button"
  tabindex={isActive ? 0 : -1}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  onkeydown={handleKeyDown}
  aria-label={isFlipped 
    ? `${sourceText} means ${targetText}. Swipe right if you know it, left to practice more.`
    : `${sourceText} - Tap to reveal translation`}
  aria-pressed={isFlipped}
>
  <!-- Swipe indicators -->
  <div class="swipe-indicator left" class:visible={$position.x < -30}>
    <span class="indicator-icon">🔄</span>
    <span class="indicator-text">Practice</span>
  </div>
  <div class="swipe-indicator right" class:visible={$position.x > 30}>
    <span class="indicator-icon">✅</span>
    <span class="indicator-text">Got it!</span>
  </div>

  <!-- Card Front -->
  <div class="card-face front">
    <!-- Header badges -->
    <div class="card-header">
      {#if item.cefrLevel}
        <span class="badge cefr">{item.cefrLevel}</span>
      {/if}
      {#if getPartOfSpeechDisplay(item.partOfSpeech)}
        <span class="badge pos">{getPartOfSpeechDisplay(item.partOfSpeech)}</span>
      {/if}
    </div>

    <!-- Main word -->
    <div class="card-content">
      <h2 class="source-word">{sourceText}</h2>
      <p class="tap-hint">Tap to reveal</p>
    </div>

    <!-- Category footer -->
    <div class="card-footer">
      {#if item.categories && item.categories.length > 0}
        <span class="category">{getCategoryDisplay(item.categories)}</span>
      {/if}
    </div>
  </div>

  <!-- Card Back (flipped) -->
  <div class="card-face back">
    <!-- Header badges -->
    <div class="card-header">
      {#if item.cefrLevel}
        <span class="badge cefr">{item.cefrLevel}</span>
      {/if}
      {#if getPartOfSpeechDisplay(item.partOfSpeech)}
        <span class="badge pos">{getPartOfSpeechDisplay(item.partOfSpeech)}</span>
      {/if}
    </div>

    <!-- Content -->
    <div class="card-content">
      <p class="source-small">{sourceText}</p>
      <h2 class="target-word">{targetText}</h2>
      
      <!-- Example sentence if available -->
      {#if item.examples && item.examples.length > 0 && item.examples[0]}
        <div class="example-section">
          <p class="example-german">{item.examples[0].german}</p>
          <p class="example-bulgarian">{item.examples[0].bulgarian}</p>
        </div>
      {/if}

      <!-- Additional info -->
      {#if item.notes}
        <p class="notes">{item.notes}</p>
      {/if}
    </div>

    <!-- Swipe instructions -->
    <div class="card-footer">
      <div class="swipe-hint">
        <span class="hint-left">← Practice more</span>
        <span class="hint-right">Got it! →</span>
      </div>
    </div>
  </div>
</div>

<style>
  .swipeable-card {
    position: absolute;
    inset: 0;
    perspective: 1000px;
    touch-action: none;
    user-select: none;
    cursor: grab;
    will-change: transform;
    transition: box-shadow 0.2s ease;
  }

  .swipeable-card:focus {
    outline: 3px solid var(--color-primary, #3b82f6);
    outline-offset: 4px;
  }

  .swipeable-card.dragging {
    cursor: grabbing;
  }

  .swipeable-card:not(.active) {
    pointer-events: none;
    opacity: 0.5;
    transform: scale(0.95) !important;
  }

  /* Swipe indicators */
  .swipe-indicator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
    pointer-events: none;
  }

  .swipe-indicator.left {
    left: 1rem;
    color: #f59e0b;
  }

  .swipe-indicator.right {
    right: 1rem;
    color: #22c55e;
  }

  .swipe-indicator.visible {
    opacity: 1;
  }

  .indicator-icon {
    font-size: 2.5rem;
  }

  .indicator-text {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Card faces */
  .card-face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 1.5rem;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.12),
      0 2px 10px rgba(0, 0, 0, 0.08);
    backface-visibility: hidden;
    overflow: hidden;
    padding: 1.5rem;
  }

  .card-face.back {
    transform: rotateY(180deg);
  }

  .flipped .card-face.front {
    visibility: hidden;
  }

  .flipped .card-face.back {
    transform: rotateY(0deg);
    visibility: visible;
  }

  .flipped:not(.flipped) .card-face.back {
    visibility: hidden;
  }

  /* Dark mode support */
  :global(.dark) .card-face {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #f1f5f9;
  }

  /* Card header */
  .card-header {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  .badge {
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge.cefr {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
  }

  .badge.pos {
    background: #e2e8f0;
    color: #475569;
  }

  :global(.dark) .badge.pos {
    background: #334155;
    color: #cbd5e1;
  }

  /* Card content */
  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 1rem;
    padding: 1rem 0;
  }

  .source-word {
    font-size: clamp(1.75rem, 6vw, 2.5rem);
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
    margin: 0;
  }

  :global(.dark) .source-word {
    color: #f1f5f9;
  }

  .source-small {
    font-size: 1rem;
    color: #64748b;
    margin: 0;
  }

  .target-word {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: #059669;
    line-height: 1.2;
    margin: 0;
  }

  .tap-hint {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  /* Example section */
  .example-section {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(59, 130, 246, 0.08);
    border-radius: 0.75rem;
    border-left: 3px solid #3b82f6;
    text-align: left;
    width: 100%;
    max-width: 100%;
  }

  .example-german {
    font-size: 0.875rem;
    color: #334155;
    margin: 0 0 0.5rem 0;
    font-style: italic;
  }

  .example-bulgarian {
    font-size: 0.875rem;
    color: #059669;
    margin: 0;
  }

  :global(.dark) .example-section {
    background: rgba(59, 130, 246, 0.15);
  }

  :global(.dark) .example-german {
    color: #cbd5e1;
  }

  .notes {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
    padding: 0.5rem;
    background: #f1f5f9;
    border-radius: 0.5rem;
    width: 100%;
  }

  :global(.dark) .notes {
    background: #334155;
    color: #94a3b8;
  }

  /* Card footer */
  .card-footer {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  .category {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .swipe-hint {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .hint-left {
    color: #f59e0b;
  }

  .hint-right {
    color: #22c55e;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .card-face {
      padding: 1rem;
    }

    .example-section {
      padding: 0.75rem;
    }
  }
</style>
