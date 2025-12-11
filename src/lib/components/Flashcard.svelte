<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';

  let { vocabularyItem } = $props<{ vocabularyItem: VocabularyItem }>();

  // State for card flip
  let flipped = $state(false);

  // Toggle flip state
  function toggleFlip() {
    flipped = !flipped;
  }
</script>

<div class="flashcard-container">
  <button
    class="flashcard {flipped ? 'flipped' : ''}"
    onclick={toggleFlip}
    aria-label={flipped ? 'Show front of card' : 'Show back of card'}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    }}
  >
    <!-- Front of the card -->
    <div class="flashcard-front">
      <div class="front-content">
        <div class="emoji-container">
          {#if vocabularyItem.media?.emoji}
            <span class="emoji">{vocabularyItem.media.emoji}</span>
          {/if}
        </div>
        <h2 class="bulgarian-text">{vocabularyItem.term_bulgarian}</h2>
        <div class="flip-hint">Click to flip</div>
      </div>
    </div>

    <!-- Back of the card -->
    <div class="flashcard-back">
      <div class="back-content">
        <div class="german-translation">
          <strong>{vocabularyItem.term_german}</strong>
        </div>

        <div class="phrase-breakdown">
          <h3 class="breakdown-title">Phrase Breakdown</h3>
          <div class="breakdown-container">
            {#each vocabularyItem.breakdown as item, index}
              <div class="breakdown-item">
                <div class="breakdown-part">
                  {item.part}
                  {#if index < vocabularyItem.breakdown.length - 1}
                    <span class="connector">→</span>
                  {/if}
                </div>
                <div class="breakdown-meaning">
                  {item.meaning}
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if vocabularyItem.context_clue}
          <div class="context-clue">
            <strong>Context:</strong> {vocabularyItem.context_clue}
          </div>
        {/if}
      </div>
    </div>
  </button>
</div>

<style>
  .flashcard-container {
    perspective: 1000px;
    width: 100%;
    max-width: 400px;
    height: 500px;
    margin: 0 auto;
  }

  .flashcard {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    cursor: pointer;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .flashcard.flipped {
    transform: rotateY(180deg);
  }

  .flashcard-front,
  .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: white;
  }

  .flashcard-back {
    transform: rotateY(180deg);
  }

  .front-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .emoji-container {
    font-size: 4rem;
    margin-bottom: 2rem;
    min-height: 64px;
  }

  .bulgarian-text {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    color: #1f2937;
    margin-bottom: 1.5rem;
  }

  .flip-hint {
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: auto;
  }

  .back-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 8px 0;
  }

  .german-translation {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #1f2937;
  }

  .phrase-breakdown {
    flex-grow: 1;
    margin-bottom: 1rem;
    overflow-y: auto;
  }

  .breakdown-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
    text-align: center;
  }

  .breakdown-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .breakdown-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .breakdown-part {
    font-size: 1.2rem;
    font-weight: 500;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breakdown-meaning {
    font-size: 0.95rem;
    color: #6b7280;
    text-align: center;
  }

  .connector {
    color: #9ca3af;
    font-size: 1.2rem;
  }

  .context-clue {
    font-size: 0.9rem;
    color: #4b5563;
    text-align: center;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
    margin-top: auto;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .bulgarian-text {
      font-size: 2rem;
    }

    .german-translation {
      font-size: 1.2rem;
    }

    .breakdown-part {
      font-size: 1rem;
    }

    .breakdown-meaning {
      font-size: 0.85rem;
    }
  }
</style>