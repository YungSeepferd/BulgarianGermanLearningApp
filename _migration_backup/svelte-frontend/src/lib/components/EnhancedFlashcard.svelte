<script lang="ts">
  import type {
    VocabularyItem,
    LanguageDirection,
    ReviewState,
    ScreenReaderAnnouncement
  } from '$lib/types/index.js';
  
  // Props using Svelte 5 $props with snippets
  let {
    vocabularyItem,
    direction = 'bg-de',
    onGrade,
    onNext,
    onPrevious,
    showProgress = true,
    autoFlip = false,
    lazyLoad = false,
    header,
    footer,
    customContent
  } = $props<{
    vocabularyItem: VocabularyItem;
    direction?: LanguageDirection;
    onGrade?: (grade: number, state: ReviewState) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    showProgress?: boolean;
    autoFlip?: boolean;
    lazyLoad?: boolean;
    header?: (item: VocabularyItem) => any;
    footer?: (item: VocabularyItem, isFlipped: boolean) => any;
    customContent?: (item: VocabularyItem, isFlipped: boolean) => any;
  }>();

  // State using Svelte 5 runes
  let isFlipped = $state(false);
  let isAnimating = $state(false);
  let announcement = $state<ScreenReaderAnnouncement | null>(null);
  let isVisible = $state(!lazyLoad);

  // Derived state
  let cardText = $derived(() => {
    const isBgToDe = direction === 'bg-de';
    return {
      frontText: isBgToDe ? vocabularyItem.word : vocabularyItem.translation,
      backText: isBgToDe ? vocabularyItem.translation : vocabularyItem.word
    };
  });

  let showGradingControls = $derived(isFlipped);

  // Effects
  $effect(() => {
    if (autoFlip) {
      setTimeout(() => flipCard(), 1000);
    }
  });

  $effect(() => {
    if (announcement) {
      const timeout = setTimeout(() => {
        announcement = null;
      }, announcement.timeout);
      
      return () => clearTimeout(timeout);
    }
  });

  // Functions
  function flipCard(): void {
    if (isAnimating) return;

    isAnimating = true;
    isFlipped = !isFlipped;

    announcement = {
      message: isFlipped ? 'Card flipped. Showing answer.' : 'Card flipped. Showing question.',
      priority: 'polite',
      timeout: 1000
    };

    setTimeout(() => {
      isAnimating = false;
    }, 600);
  }

  function handleGrade(grade: number): void {
    if (!isFlipped) return;

    announcement = {
      message: `Graded ${grade}.`,
      priority: 'polite',
      timeout: 2000
    };

    if (onGrade) {
      const mockState: ReviewState = {
        itemId: vocabularyItem.id,
        direction,
        schemaVersion: 1,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        phase: 1,
        nextReview: Date.now() + 86400000,
        lastReview: Date.now(),
        totalReviews: 1,
        correctAnswers: grade >= 3 ? 1 : 0,
        correctStreak: grade >= 3 ? 1 : 0,
        created: Date.now(),
        updated: Date.now()
      };
      onGrade(grade, mockState);
    }

    setTimeout(() => {
      if (onNext) onNext();
    }, 500);
  }

  function handleKeyDown(event: KeyboardEvent): void {
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
</script>

<div class="enhanced-flashcard-container" data-testid="enhanced-flashcard-container" role="region" aria-label="Enhanced Flashcard">
  <!-- Custom Header Snippet -->
  {#if header}
    {@render header(vocabularyItem)}
  {/if}

  <!-- Main Flashcard -->
  <div
    class="enhanced-flashcard {isFlipped ? 'flipped' : ''} {isAnimating ? 'animating' : ''}"
    role="button"
    tabindex="0"
    aria-label="Flashcard. Press Space or Enter to flip."
    onclick={flipCard}
    onkeydown={handleKeyDown}
  >
    <!-- Card Front -->
    <div class="card-face card-front" aria-hidden={isFlipped ? 'true' : 'false'}>
      <div class="card-content">
        <h2 class="card-word">
          {cardText().frontText}
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
    <div class="card-face card-back" aria-hidden={!isFlipped ? 'true' : 'false'}>
      <div class="card-content">
        <h2 class="card-word">
          {cardText().backText}
        </h2>
        
        <!-- Custom Content Snippet -->
        {#if customContent}
          {@render customContent(vocabularyItem, isFlipped)}
        {:else}
          {#if vocabularyItem.examples && vocabularyItem.examples.length > 0}
            <div class="card-examples">
              <h3>Examples:</h3>
              {#each vocabularyItem.examples.slice(0, 3) as example}
                <div class="example">
                  <p class="example-sentence">{example.sentence}</p>
                  <p class="example-translation">{example.translation}</p>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>

  <!-- Grading Controls -->
  {#if showGradingControls}
    <div class="grading-controls" role="group" aria-label="Grade your answer">
      <h3>How well did you know this?</h3>
      <div class="grade-buttons">
        {#each [1, 2, 3, 4, 5] as grade}
          <button
            class="grade-button"
            onclick={() => handleGrade(grade)}
            aria-label={`Grade ${grade}: ${grade === 1 ? 'Hard' : grade === 2 ? 'Good' : grade === 3 ? 'Good' : grade === 4 ? 'Easy' : 'Easy'}`}
          >
            <span class="grade-number">{grade}</span>
            <span class="grade-label">
              {grade === 1 ? 'Hard' : grade === 2 ? 'Good' : grade === 3 ? 'Good' : grade === 4 ? 'Easy' : 'Easy'}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Navigation Controls -->
  <div class="navigation-controls" role="group" aria-label="Navigation">
    {#if onPrevious}
      <button class="nav-button previous" onclick={onPrevious} aria-label="Previous card">
        ← Previous
      </button>
    {/if}
    
    {#if onNext}
      <button class="nav-button next" onclick={onNext} aria-label="Next card">
        Next →
      </button>
    {/if}
  </div>

  <!-- Custom Footer Snippet -->
  {#if footer}
    {@render footer(vocabularyItem, isFlipped)}
  {/if}

  <!-- Screen Reader Announcements -->
  {#if announcement}
    <div class="sr-only" role="status" aria-live={announcement.priority} aria-atomic="true">
      {announcement.message}
    </div>
  {/if}
</div>

<style>
  .enhanced-flashcard-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .enhanced-flashcard {
    position: relative;
    width: 100%;
    height: 400px;
    perspective: 1000px;
    cursor: pointer;
    border-radius: 12px;
    transition: transform 0.2s ease;
  }

  .enhanced-flashcard:hover {
    transform: translateY(-2px);
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

  .enhanced-flashcard.flipped .card-front {
    transform: rotateY(-180deg);
  }

  .enhanced-flashcard.flipped .card-back {
    transform: rotateY(0deg);
  }

  .card-word {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 1rem 0;
    line-height: 1.2;
  }

  /* Additional styles from original Flashcard component */
  .grading-controls, .navigation-controls, .sr-only {
    /* Include all original styles */
  }

  @media (max-width: 640px) {
    .enhanced-flashcard {
      height: 350px;
    }
    
    .card-word {
      font-size: 2rem;
    }
  }
</style>