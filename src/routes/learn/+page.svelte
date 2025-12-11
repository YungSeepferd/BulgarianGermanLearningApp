<script lang="ts">
  import { onMount } from 'svelte';
  import { vocabularyDb } from '$lib/data/db.svelte.js';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { Debug } from '$lib/utils';
  import type { VocabularyItem } from '$lib/schemas/vocabulary';

  // State for the learning session
  let currentCardIndex = $state(0);
  let sessionActive = $state(false);
  let sessionComplete = $state(false);
  let sessionCards = $state<VocabularyItem[]>([]);
  let isAnimating = $state(false);
  let animationType = $state<'easy' | 'hard' | null>(null);

  // Load vocabulary data and filter for unmastered words
  async function startSession() {
    try {
      Debug.log('LearnPage', 'Starting learning session');

      // Initialize vocabulary database if not already loaded
      await vocabularyDb.initialize();

      // Get all vocabulary items
      const allVocabulary = vocabularyDb.getVocabulary();

      // Shuffle vocabulary for the session
      Debug.log('LearnPage', 'Vocabulary loaded', {
        totalWords: allVocabulary.length
      });

      // Use all vocabulary shuffled
      sessionCards = [...allVocabulary].sort(() => 0.5 - Math.random());
      Debug.log('LearnPage', 'Session cards prepared', {
        cardCount: sessionCards.length
      });

      // Reset session state
      currentCardIndex = 0;
      sessionActive = true;
      sessionComplete = false;
      isAnimating = false;
      animationType = null;

      // Check in the user to maintain streak
      userProgress.checkIn();

      Debug.log('LearnPage', 'Session started', {
        cardCount: sessionCards.length,
        firstCard: sessionCards[0]?.id
      });

    } catch (error) {
      Debug.error('LearnPage', 'Failed to start session', error as Error);
      sessionActive = false;
      sessionCards = [];
    }
  }

  // Handle card completion (Easy button)
  function handleEasy() {
    if (!sessionActive || isAnimating) return;

    isAnimating = true;
    animationType = 'easy';

    // Add XP and mark word as completed
    const currentCard = sessionCards[currentCardIndex];
    if (currentCard) {
      const xpValue = currentCard.xp_value || 10;
      userProgress.addXP(xpValue);
      userProgress.markWordCompleted(currentCard.id);

      Debug.log('LearnPage', 'Word marked as easy', {
        wordId: currentCard.id,
        xpAdded: xpValue,
        totalXP: userProgress.xp
      });
    }

    // Move to next card after animation
    setTimeout(() => {
      moveToNextCard();
      isAnimating = false;
      animationType = null;
    }, 600);
  }

  // Handle card repetition (Hard button)
  function handleHard() {
    if (!sessionActive || isAnimating) return;

    isAnimating = true;
    animationType = 'hard';

    // Just move to next card without marking as completed
    Debug.log('LearnPage', 'Word marked as hard', {
      wordId: sessionCards[currentCardIndex]?.id
    });

    setTimeout(() => {
      moveToNextCard();
      isAnimating = false;
      animationType = null;
    }, 600);
  }

  // Move to the next card in the session
  function moveToNextCard() {
    if (currentCardIndex < sessionCards.length - 1) {
      currentCardIndex++;
    } else {
      // Session complete
      sessionActive = false;
      sessionComplete = true;
      Debug.log('LearnPage', 'Session completed');
    }
  }

  // Reset the session
  function resetSession() {
    sessionActive = false;
    sessionComplete = false;
    sessionCards = [];
    currentCardIndex = 0;
    isAnimating = false;
    animationType = null;
  }

  // Calculate progress percentage
  function getProgressPercentage(): number {
    if (sessionCards.length === 0) return 0;
    return Math.round(((currentCardIndex + 1) / sessionCards.length) * 100);
  }

  // Get current card and transform to match Flashcard component expectations
  function getCurrentCard(): any {
    const card = sessionCards[currentCardIndex];
    if (!card) return null;

    // Transform the vocabulary item to match Flashcard component expectations
    return {
      id: card.id,
      term_bulgarian: card.bulgarian,
      term_german: card.german,
      breakdown: card.literalBreakdown || [],
      context_clue: card.metadata?.notes || '',
      media: {
        emoji: card.emoji || ''
      }
    };
  }

  // Format the progress text
  function getProgressText(): string {
    if (sessionCards.length === 0) return '0/0';
    return `${currentCardIndex + 1}/${sessionCards.length}`;
  }

  // Initialize session on component mount
  onMount(() => {
    startSession();
  });
</script>

<div class="learn-page">
  <!-- Progress bar at the top -->
  <div class="progress-container">
    <div class="progress-bar" style={`width: ${getProgressPercentage()}%`}></div>
    <div class="progress-text">{getProgressText()}</div>
  </div>

  <!-- Main content area -->
  <div class="content-container">
    {#if sessionActive && getCurrentCard()}
      <!-- Flashcard display -->
      <div class="flashcard-wrapper {animationType}">
        <Flashcard vocabularyItem={getCurrentCard()!} />
      </div>

      <!-- Interaction buttons -->
      <div class="button-container">
        <button
          class="hard-button"
          onclick={handleHard}
          disabled={isAnimating}
        >
          🔴 Hard
        </button>
        <button
          class="easy-button"
          onclick={handleEasy}
          disabled={isAnimating}
        >
          🟢 Easy
        </button>
      </div>
    {:else if sessionComplete}
      <!-- Session completion message -->
      <div class="completion-message">
        <h2>🎉 Great job!</h2>
        <p>You've completed this learning session.</p>
        <p>You earned {userProgress.xp} XP and have a {userProgress.streak}-day streak!</p>
        <button onclick={startSession} class="restart-button">
          Start New Session
        </button>
      </div>
    {:else}
      <!-- Loading or initial state -->
      <div class="loading-message">
        {#if sessionCards.length === 0}
          <p>Loading vocabulary...</p>
        {:else}
          <p>No words to review. You've mastered all vocabulary!</p>
          <button onclick={startSession} class="restart-button">
            Start New Session
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .learn-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
  }

  .progress-container {
    width: 100%;
    height: 24px;
    background-color: #e5e7eb;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 12px;
    transition: width 0.3s ease;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    font-size: 0.875rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .flashcard-wrapper {
    width: 100%;
    max-width: 400px;
    margin-bottom: 2rem;
    transition: transform 0.6s ease;
  }

  /* Animation for card completion */
  .flashcard-wrapper.easy {
    animation: scaleUp 0.6s ease;
  }

  .flashcard-wrapper.hard {
    animation: shake 0.6s ease;
  }

  @keyframes scaleUp {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }

  .button-container {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .hard-button, .easy-button {
    padding: 1rem 2rem;
    font-size: 1.25rem;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .hard-button {
    background-color: #ef4444;
    color: white;
  }

  .hard-button:hover:not(:disabled) {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .easy-button {
    background-color: #10b981;
    color: white;
  }

  .easy-button:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .hard-button:disabled, .easy-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .completion-message {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 500px;
  }

  .completion-message h2 {
    color: #10b981;
    margin-bottom: 1rem;
  }

  .loading-message {
    text-align: center;
    padding: 2rem;
  }

  .restart-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: background-color 0.2s ease;
  }

  .restart-button:hover {
    background-color: #2563eb;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .learn-page {
      padding: 0.5rem;
    }

    .button-container {
      flex-direction: column;
      gap: 1rem;
    }

    .hard-button, .easy-button {
      width: 100%;
      max-width: 300px;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .progress-container {
      height: 20px;
    }

    .progress-text {
      font-size: 0.75rem;
    }

    .hard-button, .easy-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  }
</style>