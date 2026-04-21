<script lang="ts">
  import type { VocabularyItem } from '$lib/types/vocabulary';
  import { learningSession } from '$lib/state/session.svelte.js';
  import { slide } from 'svelte/transition';

  type Props = {
    item: VocabularyItem;
    onNext: () => void;
  };

  let { item, onNext }: Props = $props();

  let userAnswer = $state('');
  let feedbackStatus = $state<'idle' | 'correct' | 'incorrect'>('idle');
  let inputElement = $state<HTMLInputElement | null>(null);

  function checkAnswer() {
    if (!userAnswer.trim()) return;

    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = item.bulgarian.toLowerCase();

    // Simple strict comparison for now, could be enhanced with Levenshtein later
    if (normalizedUser === normalizedCorrect) {
      feedbackStatus = 'correct';
      if (learningSession) {
        learningSession.awardXP(item.xp_value || 10);
      }
    } else {
      feedbackStatus = 'incorrect';
    }
  }

  function handleNext() {
    userAnswer = '';
    feedbackStatus = 'idle';
    onNext();
    // Refocus input on next (optional, maybe better to keep focus or not depending on mobile)
    // Refocus input on next
    inputElement?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (feedbackStatus === 'idle') {
        checkAnswer();
      } else {
        handleNext();
      }
    }
  }
</script>

<div class="quiz-controller">
  <div class="input-container">
    {#if feedbackStatus === 'idle'}
      <input
        bind:this={inputElement}
        type="text"
        bind:value={userAnswer}
        placeholder="Type the Bulgarian word..."
        class="answer-input"
        onkeydown={handleKeydown}
        disabled={feedbackStatus !== 'idle'}
      />
      <button 
        class="check-btn" 
        onclick={checkAnswer}
        disabled={!userAnswer.trim()}
      >
        Check
      </button>
    {:else}
      <div 
        class="feedback-message" 
        class:correct={feedbackStatus === 'correct'}
        class:incorrect={feedbackStatus === 'incorrect'}
        in:slide
      >
        {#if feedbackStatus === 'correct'}
          <span class="icon">✅</span>
          <div class="text">
            <h3>Excellent!</h3>
            <p>+ {item.xp_value || 10} XP</p>
          </div>
        {:else}
          <span class="icon">❌</span>
          <div class="text">
            <h3>Not quite</h3>
            <p>Correct answer: <strong>{item.bulgarian}</strong></p>
          </div>
        {/if}
      </div>
      <button class="next-btn" onclick={handleNext}>
        Continue
      </button>
    {/if}
  </div>
</div>

<style>
  .quiz-controller {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem 1rem 2rem 1rem;
    background: var(--bg-elevated);
    box-shadow: var(--shadow-lg);
    z-index: 50;
  }

  .input-container {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .answer-input {
    flex: 1;
    padding: 1rem;
    border: 2px solid var(--border-default);
    border-radius: var(--radius-md);
    font-size: 1.125rem;
    background: var(--bg-card);
    color: var(--text-primary);
    transition: all var(--duration-200);
  }

  .answer-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }

  .check-btn, .next-btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: transform var(--duration-75);
  }

  .check-btn {
    background: var(--accent);
    color: var(--bg-base);
  }

  .check-btn:disabled {
    background: var(--text-tertiary);
    cursor: not-allowed;
  }

  .check-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .next-btn {
    width: 100%;
    background: var(--success);
    color: var(--bg-base);
  }

  /* Feedback State */
  .feedback-message {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
  }

  .feedback-message.correct .text h3 { color: var(--success); }
  .feedback-message.incorrect .text h3 { color: var(--danger); }

  .text h3 {
    margin: 0;
    font-size: 1.125rem;
  }

  .text p {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .icon {
    font-size: 2rem;
  }
</style>