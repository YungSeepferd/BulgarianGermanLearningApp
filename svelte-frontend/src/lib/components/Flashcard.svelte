<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define component events
  type FlashcardEvents = {
    flip: { flipped: boolean; attempts: number };
    reviewed: { timestamp: Date };
  };

  // Define props with TypeScript
  type FlashcardProps = {
    word: string;
    translation: string;
    examples?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  };

  // Initialize props with defaults
  let { 
    word, 
    translation, 
    examples = [],
    difficulty: initialDifficulty = 'easy'
  } = $props<FlashcardProps>();

  // Component state
  let flipped = $state(false);
  let attempts = $state(0);
  let lastReviewed = $state<Date | null>(null);
  let difficulty = $state(initialDifficulty);

  // Derived state
  let status = $derived(flipped ? 'flipped' : '');
  let reviewCount = $derived(attempts);
  let isNew = $derived(attempts === 0);

  // Component events
  const dispatch = createEventDispatcher<FlashcardEvents>();

  // Lifecycle methods
  $effect(() => {
    // On mount
    console.log('Flashcard mounted');
    
    return () => {
      // On destroy
      console.log('Flashcard destroyed');
    };
  });

  $effect(() => {
    // When flipped state changes
    if (flipped) {
      // Auto-flip back after 5 seconds
      const timer = setTimeout(() => {
        if (flipped) flip();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  });

  // Methods
  function flip() {
    const wasFlipped = flipped;
    flipped = !flipped;
    
    if (!wasFlipped) {
      // First flip in this cycle
      attempts++;
      lastReviewed = new Date();
      dispatch('reviewed', { timestamp: lastReviewed });
    }
    
    dispatch('flip', { flipped, attempts });
  }

  // Methods are automatically exposed in Svelte 5
</script>

<div
  class="flashcard {status} {difficulty}"
  class:flipped={flipped}
  onclick={flip}
  onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? flip() : null}
  data-testid="flashcard-container"
  role="button"
  tabindex="0"
  aria-label={flipped ? `Back: ${translation}` : `Front: ${word}`}
  aria-pressed={flipped}
>
  <div class="front card-front" aria-hidden={flipped} data-testid="card-front">
    <h2 data-testid="front-word">{word}</h2>
    {#if isNew}
      <p class="hint" data-testid="hint-text">New card - click to reveal</p>
    {:else}
      <p class="hint" data-testid="hint-text">Reviewed {reviewCount} times</p>
    {/if}
  </div>
  
  <div class="back card-back" aria-hidden={!flipped} data-testid="card-back">
    <h2 data-testid="back-word">{translation}</h2>
    
    {#if examples.length > 0}
      <div class="examples" data-testid="examples-section">
        <h3>Examples:</h3>
        <ul>
          {#each examples as example, i}
            <li data-testid={`example-${i}`}>{example}</li>
          {/each}
        </ul>
      </div>
    {/if}
    
    <div class="stats" data-testid="stats-section">
      <p>Attempts: <span data-testid="attempts-count">{attempts}</span></p>
      <p>Difficulty: <span data-testid="difficulty-level">{difficulty}</span></p>
      {#if lastReviewed}
        <p>Last reviewed: {lastReviewed.toLocaleDateString()}</p>
      {/if}
    </div>
  </div>
  
  <!-- Screen reader announcements -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {flipped ? `Showing translation: ${translation}` : `Showing word: ${word}`}
  </div>
</div>

<style>
  .flashcard {
    position: relative;
    width: 300px;
    height: 400px;
    perspective: 1000px;
    cursor: pointer;
  }
  
  .front, .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transition: transform 0.6s;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .front {
    background: white;
  }
  
  .back {
    background: #f8f8f8;
    transform: rotateY(180deg);
  }
  
  .flipped .front {
    transform: rotateY(180deg);
  }
  
  .flipped .back {
    transform: rotateY(0deg);
  }
  
  .hint {
    color: #666;
    font-style: italic;
  }
  
  .stats {
    margin-top: 20px;
    font-size: 0.9em;
    color: #555;
  }
  
  /* Screen reader only content */
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