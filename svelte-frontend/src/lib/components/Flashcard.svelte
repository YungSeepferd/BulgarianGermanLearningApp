<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import type { 
    VocabularyItem, 
    LanguageDirection, 
    ReviewState, 
    FlashcardComponentProps,
    FlashcardUIState,
    ScreenReaderAnnouncement
  } from '$lib/types/index.js';
  import { 
    flashcardStore, 
    cardTextStore, 
    progressStore, 
    sessionStatsStore,
    showGradingControlsStore,
    currentReviewStateStore,
    flashcardActions
  } from '$lib/stores/flashcard.js';
  
  // Lazy load heavy dependencies
  let spacedRepetitionSystem: any = null;
  let phaseCalculator: any = null;
  let currentReviewState: ReviewState | null = null;
  let isDependenciesLoaded = false;

  // Props
  export let vocabularyItem: VocabularyItem;
  export let direction: LanguageDirection = 'bg-de';
  export let onGrade: ((grade: number, state: ReviewState) => void) | undefined = undefined;
  export let onNext: (() => void) | undefined = undefined;
  export let onPrevious: (() => void) | undefined = undefined;
  export let showProgress: boolean = true;
  export let autoFlip: boolean = false;
  export let lazyLoad: boolean = true;

  // Local state with performance optimizations
  let isFlipped = false;
  let isAnimating = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let announcement: ScreenReaderAnnouncement | null = null;
  let isIntersecting = false;
  let isVisible = false;
  let intersectionObserver: IntersectionObserver | null = null;

  // Performance monitoring
  let renderStartTime = 0;
  let componentMounted = false;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Reactive stores with memoization
  $: cardText = $cardTextStore;
  $: progress = $progressStore;
  $: sessionStats = $sessionStatsStore;
  $: showGradingControls = $showGradingControlsStore;
  $: reviewState = $currentReviewStateStore;

  // Derived stores for performance
  const phaseInfo = derived([reviewState], ([$reviewState]) => {
    if (!isDependenciesLoaded || !$reviewState || !phaseCalculator) return null;
    
    const phase = $reviewState.phase || 1;
    const details = phaseCalculator.getPhaseDetails(phase);
    
    return {
      name: details.name,
      icon: phaseCalculator.getPhaseIcon(phase),
      color: details.color
    };
  });

  $: currentPhaseInfo = $phaseInfo;

  // Performance-optimized component lifecycle
  onMount(async () => {
    renderStartTime = performance.now();
    componentMounted = true;
    
    try {
      // Set up intersection observer for lazy loading
      if (lazyLoad && 'IntersectionObserver' in window) {
        setupIntersectionObserver();
      } else {
        isVisible = true;
        await initializeComponent();
      }

      console.log(`[Flashcard] Mounted for item ${vocabularyItem.id} (${direction}) in ${performance.now() - renderStartTime}ms`);
    } catch (error) {
      handleError(error, 'onMount');
    }
  });

  onDestroy(() => {
    cleanup();
  });

  // Intersection Observer for lazy loading
  function setupIntersectionObserver(): void {
    const element = document.querySelector('.flashcard-container');
    if (!element) return;

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry.isIntersecting;
        
        if (entry.isIntersecting && !isVisible) {
          isVisible = true;
          initializeComponent();
          // Unobserve after first intersection for performance
          intersectionObserver?.unobserve(element);
        }
      },
      {
        threshold: 0.1, // Load when 10% visible
        rootMargin: '50px' // Load 50px before entering viewport
      }
    );

    intersectionObserver.observe(element);
  }

  // Lazy initialization of heavy dependencies
  async function initializeComponent(): Promise<void> {
    if (isDependenciesLoaded) return;

    try {
      // Dynamic import of spaced repetition utilities
      const { 
        UnifiedSpacedRepetition, 
        PhaseCalculator,
        generateGradeFeedback,
        getGradeFeedbackMessage,
        getGradeColor,
        isValidGrade
      } = await import('$lib/utils/spaced-repetition.js');

      // Dynamic import of error handling utilities
      const { 
        createErrorContext,
        safeAsync,
        logError,
        reportError
      } = await import('$lib/utils/error-handling.js');

      // Initialize systems
      phaseCalculator = new PhaseCalculator();
      spacedRepetitionSystem = new UnifiedSpacedRepetition(phaseCalculator);
      isDependenciesLoaded = true;

      // Load review state
      await loadReviewState();

      // Set up event listeners
      setupEventListeners();

      // Auto-flip if enabled
      if (autoFlip) {
        setTimeout(() => flipCard(), 1000);
      }

      console.log(`[Flashcard] Dependencies loaded and initialized in ${performance.now() - renderStartTime}ms`);
    } catch (error) {
      handleError(error, 'initializeComponent');
    }
  }

  // Load review state with error handling
  async function loadReviewState(): Promise<void> {
    if (!isDependenciesLoaded) return;

    const { createErrorContext, safeAsync, logError, reportError } = await import('$lib/utils/error-handling.js');
    
    const context = createErrorContext('Flashcard', 'loadReviewState', {
      itemId: vocabularyItem.id,
      direction
    });

    const result = await safeAsync(async () => {
      const state = spacedRepetitionSystem.loadState(vocabularyItem.id, direction);
      currentReviewState = state;
      return state;
    }, context);

    if (result.error) {
      console.error('[Flashcard] Failed to load review state:', result.error);
      currentReviewState = spacedRepetitionSystem.initReviewState(vocabularyItem.id, direction);
    }
  }

  // Optimized flip function
  function flipCard(): void {
    if (!isVisible || isAnimating) return;

    isAnimating = true;
    isFlipped = !isFlipped;

    // Announce to screen readers
    announcement = {
      message: isFlipped ? 'Card flipped. Showing answer.' : 'Card flipped. Showing question.',
      priority: 'polite',
      timeout: 1000
    };

    // Reset animation flag with cleanup
    const animationTimeout = setTimeout(() => {
      isAnimating = false;
    }, 600);

    // Dispatch flip event
    dispatch('flip', { isFlipped, vocabularyItem, direction });
  }

  // Optimized grade handling
  async function handleGrade(grade: number): Promise<void> {
    if (!isDependenciesLoaded || !isVisible) return;

    const { isValidGrade } = await import('$lib/utils/spaced-repetition.js');
    
    if (!isValidGrade(grade) || !currentReviewState) {
      console.warn(`[Flashcard] Invalid grade or no review state: grade=${grade}, state=${!!currentReviewState}`);
      return;
    }

    const { createErrorContext, safeAsync, logError, reportError } = await import('$lib/utils/error-handling.js');
    const { generateGradeFeedback, getGradeFeedbackMessage } = await import('$lib/utils/spaced-repetition.js');

    const context = createErrorContext('Flashcard', 'handleGrade', {
      itemId: vocabularyItem.id,
      direction,
      grade
    });

    try {
      // Calculate next review state
      const updatedState = spacedRepetitionSystem.scheduleNext(currentReviewState, grade, direction);
      
      // Save updated state
      const saved = spacedRepetitionSystem.saveState(updatedState);
      if (!saved) {
        throw new Error('Failed to save review state');
      }

      // Generate feedback
      const feedback = generateGradeFeedback(grade, updatedState, phaseCalculator);
      const feedbackMessage = getGradeFeedbackMessage(grade, feedback);

      // Announce to screen readers
      announcement = {
        message: `Graded ${grade}. ${feedbackMessage}`,
        priority: 'polite',
        timeout: 2000
      };

      // Update current review state
      currentReviewState = updatedState;

      // Call external grade handler if provided
      if (onGrade) {
        onGrade(grade, updatedState);
      }

      // Dispatch grade event
      dispatch('grade', { 
        grade, 
        state: updatedState, 
        feedback, 
        vocabularyItem, 
        direction 
      });

      console.log(`[Flashcard] Graded card ${vocabularyItem.id}: ${feedbackMessage}`);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), context);
      reportError(error instanceof Error ? error : new Error(String(error)), context);
      
      // Show error to user
      announcement = {
        message: 'Failed to save your progress. Please try again.',
        priority: 'assertive',
        timeout: 3000
      };
    }
  }

  // Optimized keyboard handling
  function handleKeyDown(event: KeyboardEvent): void {
    if (!isVisible) return;

    // Ignore if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'Enter':
      case 'f':
      case 'F':
        event.preventDefault();
        flipCard();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        if (isFlipped) {
          event.preventDefault();
          handleGrade(parseInt(event.key));
        }
        break;
      case 'Escape':
        event.preventDefault();
        break;
      case 'n':
      case 'N':
        event.preventDefault();
        if (onNext) onNext();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        if (onPrevious) onPrevious();
        break;
    }
  }

  // Touch event handlers (optimized)
  function handleTouchStart(event: TouchEvent): void {
    if (!isVisible) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function handleTouchMove(event: TouchEvent): void {
    if (!isVisible) return;
    // Prevent scrolling during swipe
    event.preventDefault();
  }

  function handleTouchEnd(event: TouchEvent): void {
    if (!isVisible) return;
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
  }

  function handleSwipe(): void {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < maxVerticalDistance) {
      if (deltaX > 0) {
        if (onPrevious) onPrevious();
      } else {
        if (!isFlipped) {
          flipCard();
        } else if (onNext) {
          onNext();
        }
      }
    }
  }

  // Setup event listeners (optimized)
  function setupEventListeners(): void {
    document.addEventListener('keydown', handleKeyDown);
    
    const cardElement = document.querySelector('.flashcard');
    if (cardElement) {
      cardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      cardElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }

  // Cleanup function
  function cleanup(): void {
    document.removeEventListener('keydown', handleKeyDown);
    
    const cardElement = document.querySelector('.flashcard');
    if (cardElement) {
      cardElement.removeEventListener('touchstart', handleTouchStart);
      cardElement.removeEventListener('touchmove', handleTouchMove);
      cardElement.removeEventListener('touchend', handleTouchEnd);
    }

    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }

    componentMounted = false;
  }

  // Error handling
  async function handleError(error: any, phase: string): Promise<void> {
    try {
      const { createErrorContext, logError, reportError } = await import('$lib/utils/error-handling.js');
      const context = createErrorContext('Flashcard', phase, {
        itemId: vocabularyItem.id,
        direction
      });
      
      logError(error instanceof Error ? error : new Error(String(error)), context);
      reportError(error instanceof Error ? error : new Error(String(error)), context);
    } catch (handlingError) {
      console.error('[Flashcard] Error in error handling:', handlingError);
      console.error('[Flashcard] Original error:', error);
    }
  }

  // Get grade color (lazy loaded)
  async function getGradeColorClass(grade: number): Promise<string> {
    if (!isDependenciesLoaded) return 'grade-default';
    
    const { getGradeColor } = await import('$lib/utils/spaced-repetition.js');
    return getGradeColor(grade);
  }

  // Clear announcement after timeout
  $: if (announcement) {
    const timeout = setTimeout(() => {
      announcement = null;
    }, announcement.timeout);
  }
</script>

<!-- Flashcard Container with lazy loading placeholder -->
<div class="flashcard-container" data-testid="flashcard-container" role="region" aria-label="Flashcard">
  {#if !isVisible && lazyLoad}
    <!-- Lazy loading placeholder -->
    <div class="flashcard-placeholder" data-testid="flashcard-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-animation"></div>
        <p>Loading flashcard...</p>
      </div>
    </div>
  {:else}
    <!-- Progress Bar (if enabled) -->
    {#if showProgress}
      <div class="progress-bar" role="progressbar" aria-valuenow={progress.current} aria-valuemin={0} aria-valuemax={progress.total} aria-label="Progress through flashcards">
        <div class="progress-fill" style="width: {progress.percentage}%"></div>
        <span class="progress-text">{progress.current} / {progress.total}</span>
      </div>
    {/if}

    <!-- Main Flashcard -->
    <div 
      class="flashcard {isFlipped ? 'flipped' : ''} {isAnimating ? 'animating' : ''}"
      role="button"
      tabindex={isVisible ? 0 : -1}
      aria-label="Flashcard. Press Space or Enter to flip."
      on:click={flipCard}
      on:keydown={handleKeyDown}
    >
      <!-- Card Front -->
      <div class="card-face card-front" data-testid="card-front" aria-hidden={isFlipped ? 'true' : 'false'}>
        <div class="card-content" data-testid="flashcard-content">
          <h2 class="card-word" id="front-word">
            {cardText.frontText}
          </h2>
          
          {#if vocabularyItem.notes && direction === 'bg-de'}
            <p class="card-notes">{vocabularyItem.notes}</p>
          {/if}
          
          {#if vocabularyItem.notes_de_to_bg && direction === 'de-bg'}
            <p class="card-notes">{vocabularyItem.notes_de_to_bg}</p>
          {/if}
        </div>
        
        <div class="card-hint">
          <span class="hint-text">Press Space or click to flip</span>
        </div>
      </div>

      <!-- Card Back -->
      <div class="card-face card-back" data-testid="card-back" aria-hidden={!isFlipped ? 'true' : 'false'}>
        <div class="card-content" data-testid="flashcard-content">
          <h2 class="card-word" id="back-word">
            {cardText.backText}
          </h2>
          
          {#if vocabularyItem.examples && vocabularyItem.examples.length > 0}
            <div class="card-examples">
              <h3>Examples:</h3>
              {#each vocabularyItem.examples.slice(0, 3) as example} <!-- Limit examples for performance -->
                <div class="example">
                  <p class="example-sentence">{example.sentence}</p>
                  <p class="example-translation">{example.translation}</p>
                </div>
              {/each}
              {#if vocabularyItem.examples.length > 3}
                <p class="more-examples">...and {vocabularyItem.examples.length - 3} more examples</p>
              {/if}
            </div>
          {/if}
          
          {#if vocabularyItem.etymology}
            <div class="card-etymology">
              <h3>Etymology:</h3>
              <p>{vocabularyItem.etymology}</p>
            </div>
          {/if}
          
          {#if vocabularyItem.cultural_note}
            <div class="cultural-note">
              <h3>Cultural Note:</h3>
              <p>{vocabularyItem.cultural_note}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Phase Information (if available) -->
    {#if currentPhaseInfo}
      <div class="phase-info" style="color: {currentPhaseInfo.color}">
        <span class="phase-icon">{currentPhaseInfo.icon}</span>
        <span class="phase-name">{currentPhaseInfo.name}</span>
      </div>
    {/if}

    <!-- Grading Controls (shown when flipped) -->
    {#if showGradingControls}
      <div class="grading-controls" role="group" aria-label="Grade your answer">
        <h3>How well did you know this?</h3>
        <div class="grade-buttons">
          {#each [0, 1, 2, 3, 4, 5] as grade}
            <button
              class="grade-button grade-default"
              on:click={() => handleGrade(grade)}
              aria-label={`Grade ${grade}: ${grade === 0 ? 'Again' : grade === 1 ? 'Hard' : grade === 2 ? 'Good' : grade === 3 ? 'Good' : grade === 4 ? 'Easy' : 'Easy'}`}
            >
              <span class="grade-number">{grade}</span>
              <span class="grade-label">
                {grade === 0 ? 'Again' : grade === 1 ? 'Hard' : grade === 2 ? 'Good' : grade === 3 ? 'Good' : grade === 4 ? 'Easy' : 'Easy'}
              </span>
            </button>
          {/each}
        </div>
        
        <div class="grade-hints">
          <small>Press 1-5 keys to grade quickly</small>
        </div>
      </div>
    {/if}

    <!-- Navigation Controls -->
    <div class="navigation-controls" role="group" aria-label="Navigation">
      {#if onPrevious}
        <button 
          class="nav-button previous"
          on:click={onPrevious}
          aria-label="Previous card"
        >
          ← Previous
        </button>
      {/if}
      
      {#if onNext}
        <button 
          class="nav-button next"
          on:click={onNext}
          aria-label="Next card"
        >
          Next →
        </button>
      {/if}
    </div>

    <!-- Screen Reader Announcements -->
    {#if announcement}
      <div 
        class="sr-only" data-testid="screen-reader-announcements" 
        role="status" 
        aria-live={announcement.priority}
        aria-atomic="true"
      >
        {announcement.message}
      </div>
    {/if}
  {/if}
</div>

<!-- Optimized Styles -->
<style>
  .flashcard-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    contain: layout style paint; /* Performance optimization */
  }

  /* Lazy loading placeholder */
  .flashcard-placeholder {
    width: 100%;
    height: 400px;
    background: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .placeholder-content {
    text-align: center;
    color: #6b7280;
  }

  .placeholder-animation {
    width: 60px;
    height: 60px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .progress-bar {
    position: relative;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    margin-bottom: 1rem;
    overflow: hidden;
    contain: layout paint; /* Performance optimization */
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 0.3s ease;
    will-change: width; /* Performance optimization */
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
  }

  .flashcard {
    position: relative;
    width: 100%;
    height: 400px;
    perspective: 1000px;
    cursor: pointer;
    border-radius: 12px;
    transition: transform 0.2s ease;
    will-change: transform; /* Performance optimization */
    contain: layout style paint; /* Performance optimization */
  }

  .flashcard:hover {
    transform: translateY(-2px);
  }

  .flashcard:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.6s ease, opacity 0.6s ease;
    contain: layout style paint; /* Performance optimization */
  }

  .card-front {
    transform: rotateY(0deg);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .card-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  .flashcard.flipped .card-front {
    transform: rotateY(-180deg);
  }

  .flashcard.flipped .card-back {
    transform: rotateY(0deg);
  }

  .flashcard.animating .card-face {
    transition: transform 0.6s ease;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    contain: layout; /* Performance optimization */
  }

  .card-word {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }

  .card-notes {
    font-size: 1rem;
    opacity: 0.9;
    text-align: center;
    margin: 0.5rem 0;
    font-style: italic;
  }

  .card-hint {
    text-align: center;
    opacity: 0.7;
    font-size: 0.875rem;
  }

  .card-examples {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    contain: layout; /* Performance optimization */
  }

  .card-examples h3 {
    font-size: 1rem;
    margin: 0 0 1rem 0;
    opacity: 0.9;
  }

  .example {
    margin-bottom: 1rem;
  }

  .example-sentence {
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .example-translation {
    opacity: 0.8;
    font-style: italic;
    margin: 0;
  }

  .more-examples {
    font-size: 0.875rem;
    opacity: 0.7;
    font-style: italic;
    margin-top: 0.5rem;
  }

  .card-etymology,
  .cultural-note {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .card-etymology h3,
  .cultural-note h3 {
    font-size: 0.875rem;
    margin: 0 0 0.5rem 0;
    opacity: 0.9;
  }

  .card-etymology p,
  .cultural-note p {
    font-size: 0.875rem;
    opacity: 0.8;
    margin: 0;
  }

  .phase-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .phase-icon {
    font-size: 1rem;
  }

  .grading-controls {
    margin: 2rem 0;
    text-align: center;
    contain: layout style; /* Performance optimization */
  }

  .grading-controls h3 {
    margin: 0 0 1rem 0;
    color: #374151;
  }

  .grade-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .grade-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
    will-change: transform; /* Performance optimization */
  }

  .grade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .grade-button:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .grade-number {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .grade-label {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .grade-hints {
    color: #6b7280;
    font-size: 0.75rem;
  }

  .navigation-controls {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
  }

  .nav-button {
    padding: 0.75rem 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    color: #374151;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    will-change: transform; /* Performance optimization */
  }

  .nav-button:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .nav-button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

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

  /* Grade color classes (will be applied dynamically) */
  .grade-0 { background: #ef4444; color: white; }
  .grade-1 { background: #f97316; color: white; }
  .grade-2 { background: #eab308; color: white; }
  .grade-3 { background: #22c55e; color: white; }
  .grade-4 { background: #3b82f6; color: white; }
  .grade-5 { background: #8b5cf6; color: white; }
  .grade-default { background: #6b7280; color: white; }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .flashcard-container {
      padding: 0.5rem;
    }

    .flashcard,
    .flashcard-placeholder {
      height: 350px;
    }

    .card-word {
      font-size: 2rem;
    }

    .grade-buttons {
      gap: 0.25rem;
    }

    .grade-button {
      padding: 0.5rem 0.75rem;
      min-width: 50px;
    }

    .grade-number {
      font-size: 1rem;
    }

    .grade-label {
      font-size: 0.625rem;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .flashcard:hover,
    .grade-button:hover,
    .nav-button:hover {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .card-face {
      border: 2px solid currentColor;
    }

    .flashcard:focus {
      outline-width: 3px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .flashcard,
    .card-face,
    .grade-button,
    .nav-button,
    .progress-fill {
      transition: none;
    }

    .flashcard.animating .card-face {
      transition: none;
    }

    .placeholder-animation {
      animation: none;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .flashcard-placeholder {
      background: #374151;
    }

    .placeholder-content {
      color: #d1d5db;
    }

    .placeholder-animation {
      border-color: #4b5563;
      border-top-color: #60a5fa;
    }

    .grading-controls h3 {
      color: #d1d5db;
    }

    .nav-button {
      background: #374151;
      color: #d1d5db;
      border-color: #4b5563;
    }

    .nav-button:hover {
      border-color: #60a5fa;
      color: #60a5fa;
    }

    .grade-hints {
      color: #9ca3af;
    }
  }
</style>