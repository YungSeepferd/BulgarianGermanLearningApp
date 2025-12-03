<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import { DataLoader } from '$lib/data/loader.js';
  import { learningSession } from '$lib/state/session.svelte.js';
  import { fireConfetti } from '$lib/utils/confetti.js';
  import FlashCard from '$lib/components/flashcard/FlashCard.svelte';
  import QuizController from '$lib/components/flashcard/QuizController.svelte';
  import LevelUp from '$lib/components/gamification/LevelUp.svelte';
  import type { VocabularyItem } from '$lib/types/vocabulary.js';

  let items = $state<VocabularyItem[]>([]);
  let currentIndex = $state(0);
  let isCardFlipped = $state(false);
  let sessionComplete = $state(false);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  const progressBar = tweened(0, {
    duration: 400,
    easing: cubicOut
  });

  // Derived current item
  let currentItem = $derived(items[currentIndex]);

  onMount(async () => {
    await startNewSession();
  });

  async function startNewSession() {
    isLoading = true;
    error = null;
    sessionComplete = false;
    currentIndex = 0;
    progressBar.set(0);
    learningSession.startSession();

    try {
        // Fetch 10 random items for the session
        // Note: In a real app, we'd use a smarter algorithm (SRS)
        const newItems = await DataLoader.getInstance().getRandomItems(10);
        if (newItems && newItems.length > 0) {
          items = newItems;
        } else {
          error = "No vocabulary items found. Please add some data.";
        }
    } catch (_e) {
        error = "Failed to load session. Please try again.";
    } finally {
        isLoading = false;
    }
  }

  function handleCardFlip() {
    isCardFlipped = !isCardFlipped;
  }

  function handleNext() {
    if (currentIndex < items.length - 1) {
      // Small delay to allow exit animation if we add one
      currentIndex++;
      isCardFlipped = false;
      progressBar.set((currentIndex / items.length) * 100);
    } else {
      finishSession();
    }
  }

  function finishSession() {
    sessionComplete = true;
    progressBar.set(100);
    learningSession.endSession();
    fireConfetti();
  }
</script>

<div class="learn-page">
    <LevelUp />
    <!-- Header -->
    <header class="header">
        <a href="/" class="back-link" aria-label="Back to Dashboard">←</a>
        
        <div class="progress-container">
            <div class="progress-bar" style="width: {$progressBar}%"></div>
        </div>
        
        <div class="stats">
             <div class="streak" title="Current Streak">
                <span class="fire">🔥</span>
                <span class="count">{learningSession.currentStreak}</span>
             </div>
        </div>
    </header>

    <main class="main-content">
        {#if isLoading}
            <div class="loading-state" in:fade>
                <div class="spinner"></div>
                <p>Preparing your session...</p>
            </div>
        {:else if error}
            <div class="error-state" in:fade>
                <p>{error}</p>
                <button class="btn-primary" onclick={startNewSession}>Try Again</button>
                <a href="/" class="btn-secondary">Go Home</a>
            </div>
        {:else if sessionComplete}
            <div class="completion-screen" in:fly={{ y: 20 }}>
                <div class="completion-icon">🎉</div>
                <h1>Session Complete!</h1>
                
                <div class="xp-summary">
                    <span class="xp-amount">+{learningSession.sessionXP} XP</span>
                    <span class="xp-label">Earned</span>
                </div>
                
                <div class="daily-goal">
                    <p>Daily Goal: {learningSession.dailyXP} / {learningSession.dailyTarget} XP</p>
                    <div class="daily-progress">
                        <div class="fill" style="width: {learningSession.progressPercentage}%"></div>
                    </div>
                </div>

                <div class="actions">
                    <button class="btn-primary" onclick={startNewSession}>Practice Again</button>
                    <a href="/" class="btn-secondary">Back to Dashboard</a>
                </div>
            </div>
        {:else if currentItem}
            <div class="session-active" in:fade>
                <div class="card-container">
                    <FlashCard 
                        item={currentItem} 
                        flipped={isCardFlipped} 
                        onFlip={handleCardFlip} 
                    />
                </div>
                
                <QuizController 
                    item={currentItem} 
                    onNext={handleNext} 
                />
            </div>
        {/if}
    </main>
</div>

<style>
    .learn-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f8fafc;
        padding-bottom: 120px; /* Space for QuizController */
    }

    .header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .back-link {
        text-decoration: none;
        font-size: 1.5rem;
        color: #64748b;
        line-height: 1;
    }

    .progress-container {
        flex: 1;
        height: 0.75rem;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: #3b82f6;
        border-radius: 999px;
    }

    .stats {
        display: flex;
        gap: 1rem;
    }

    .streak {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 700;
        color: #ea580c;
    }

    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }

    .card-container {
        width: 100%;
        margin-top: 2rem;
    }

    /* Loading State */
    .loading-state, .error-state {
        text-align: center;
        color: #64748b;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Completion Screen */
    .completion-screen {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
    }

    .completion-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .xp-summary {
        margin: 2rem 0;
    }

    .xp-amount {
        display: block;
        font-size: 2.5rem;
        font-weight: 800;
        color: #eab308;
    }

    .daily-goal {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
    }

    .daily-progress {
        height: 0.5rem;
        background: #e2e8f0;
        border-radius: 999px;
        margin-top: 0.5rem;
        overflow: hidden;
    }

    .daily-progress .fill {
        height: 100%;
        background: #22c55e;
        transition: width 1s ease-out;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .btn-primary, .btn-secondary {
        padding: 1rem;
        border-radius: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        border: none;
        transition: transform 0.1s;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
    }

    .btn-secondary {
        background: #f1f5f9;
        color: #475569;
    }

    .btn-primary:active, .btn-secondary:active {
        transform: scale(0.98);
    }
</style>