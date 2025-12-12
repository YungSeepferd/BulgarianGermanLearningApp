<script lang="ts">
  import { onMount } from 'svelte';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import { appState } from '$lib/state/app-state';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { Debug } from '$lib/utils';
  import type { VocabularyItem } from '$lib/types/vocabulary';

  // State for the learning session
  let currentCardIndex = $state(0);
  let sessionActive = $state(false);
  let sessionComplete = $state(false);
  let sessionCards = $state<VocabularyItem[]>([]);
  let isAnimating = $state(false);
  let animationType = $state<'easy' | 'hard' | null>(null);
  let loadError = $state<string | null>(null);

  function capitalizeNoun(term: string): string {
    if (!term) return term;
    return term.charAt(0).toUpperCase() + term.slice(1);
  }

  function chooseArticle(gender?: string, fallback?: string): string | null {
    if (fallback) return fallback;
    if (!gender) return null;
    const map: Record<string, string> = { masculine: 'der', feminine: 'die', neuter: 'das' };
    return map[gender] || null;
  }

  function formatGermanTerm(item: VocabularyItem): string {
    const raw = (item.german || '').trim();
    if (!raw) return raw;
    const hasArticlePrefix = /^(der|die|das|ein|eine|einen|einem|einer|eines)\s/i.test(raw);
    if (hasArticlePrefix) {
      const [articlePart, ...rest] = raw.split(/\s+/);
      const nounPart = rest.join(' ');
      const normalizedNoun = item.partOfSpeech === 'noun' ? capitalizeNoun(nounPart) : nounPart;
      return [articlePart, normalizedNoun].filter(Boolean).join(' ').trim();
    }
    const base = item.partOfSpeech === 'noun' ? capitalizeNoun(raw) : raw;
    const article = chooseArticle(item.metadata?.gender, item.metadata?.article) || (item.partOfSpeech === 'noun' ? 'der' : null);
    return article ? `${article} ${base}` : base;
  }

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? {
        heading: 'Lernkarten',
        hard: '🔴 Schwer',
        easy: '🟢 Leicht',
        completedTitle: '🎉 Großartige Arbeit!',
        completedBody: 'Du hast diese Lerneinheit beendet.',
        startNew: 'Neue Einheit starten',
        loading: 'Vokabular wird geladen...',
        retry: 'Erneut versuchen',
        mastered: 'Keine Wörter zu üben. Alles gemeistert!'
      }
    : {
        heading: 'Карти за учене',
        hard: '🔴 Трудно',
        easy: '🟢 Лесно',
        completedTitle: '🎉 Страхотна работа!',
        completedBody: 'Завърши тази сесия за учене.',
        startNew: 'Започни нова сесия',
        loading: 'Зареждане на речника...',
        retry: 'Опитай отново',
        mastered: 'Няма думи за упражнение. Всичко е усвоено!'
      });

  // Load vocabulary data and filter for unmastered words
  async function startSession() {
    try {
      loadError = null;
      Debug.log('LearnPage', 'Starting learning session');

      // Initialize vocabulary database if not already loaded
      await vocabularyDb.initialize();

      // Get all vocabulary items
      const allVocabulary = vocabularyDb.getVocabulary().map((item) => ({
        ...item,
        german: formatGermanTerm(item)
      }));

      if (allVocabulary.length === 0) {
        loadError = 'No vocabulary loaded. Please check the data files and try again.';
        sessionActive = false;
        sessionComplete = false;
        sessionCards = [];
        return;
      }

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

      Debug.log('LearnPage', 'Session started', {
        cardCount: sessionCards.length,
        firstCard: sessionCards[0]?.id
      });

    } catch (error) {
      Debug.error('LearnPage', 'Failed to start session', error as Error);
      loadError = 'Failed to start session. Please retry.';
      sessionActive = false;
      sessionCards = [];
    }
  }

  // Handle card completion (Easy button)
  function handleEasy() {
    if (!sessionActive || isAnimating) return;

    isAnimating = true;
    animationType = 'easy';

    // Mark word as completed
    const currentCard = sessionCards[currentCardIndex];
    if (currentCard) {
      const xpValue = currentCard.xp_value || 10;

      Debug.log('LearnPage', 'Word marked as easy', {
        wordId: currentCard.id,
        xpAdded: xpValue
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

    return {
      ...card,
      media: card.media ?? { emoji: card.emoji },
      literalBreakdown: card.literalBreakdown ?? card.metadata?.components?.map((c) => ({
        segment: c.part,
        literal: c.meaning,
        grammarTag: c.note
      })) ?? []
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
          {ui.hard}
        </button>
        <button
          class="easy-button"
          onclick={handleEasy}
          disabled={isAnimating}
        >
          {ui.easy}
        </button>
      </div>
    {:else if sessionComplete}
      <!-- Session completion message -->
      <div class="completion-message">
        <h2>{ui.completedTitle}</h2>
        <p>{ui.completedBody}</p>
        <button onclick={startSession} class="restart-button">
          {ui.startNew}
        </button>
      </div>
    {:else}
      <!-- Loading or initial state -->
      <div class="loading-message">
        {#if loadError}
          <p>{loadError}</p>
          <button onclick={startSession} class="restart-button">
            {ui.retry}
          </button>
        {:else if sessionCards.length === 0}
          <p>{ui.loading}</p>
        {:else}
          <p>{ui.mastered}</p>
          <button onclick={startSession} class="restart-button">
            {ui.startNew}
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
    justify-content: flex-start;
    align-items: center;
    position: relative;
    gap: 1rem;
  }

  .flashcard-wrapper {
    width: 100%;
    max-width: 400px;
    margin-bottom: 1.25rem;
    transition: transform 0.6s ease;
    position: relative;
    z-index: 1; /* Lower z-index than buttons */
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
    position: relative;
    z-index: 10; /* Higher z-index to ensure buttons are on top */
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