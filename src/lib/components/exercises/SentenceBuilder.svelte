<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SentenceBuilderExercise } from '$lib/schemas/exercises';

  let { exercise = $bindable() }: { exercise: SentenceBuilderExercise } = $props();
  const dispatch = createEventDispatcher();

  // State management
  let userOrder: string[] = $state([]);
  let availableWords: string[] = $state([]);
  let showFeedback = $state(false);
  let isCorrect = $state(false);
  let attempts = $state(0);

  const currentQuestion = $derived<SentenceBuilderExercise['questions'][number] | undefined>(
    exercise.questions[exercise.currentQuestionIndex]
  );

  // Reset whenever the active question changes
  $effect(() => {
    if (!currentQuestion) return;
    availableWords = [...currentQuestion.words].sort(() => Math.random() - 0.5);
    userOrder = [];
    showFeedback = false;
    isCorrect = false;
    attempts = 0;
  });

  function handleWordClick(word: string) {
    if (showFeedback || !currentQuestion) return;
    
    userOrder = [...userOrder, word];
    availableWords = availableWords.filter(w => w !== word);
  }

  function removeWord(index: number) {
    if (showFeedback) return;
    
    const [removed] = userOrder.splice(index, 1);
    if (!removed) return;
    availableWords = [...availableWords, removed].sort(() => Math.random() - 0.5);
  }

  function checkAnswer() {
    if (!userOrder.length || showFeedback || !currentQuestion) return;
    
    attempts++;
    const question = currentQuestion;

    // Check if order matches correct answer
    isCorrect = JSON.stringify(userOrder) === JSON.stringify(question.correctOrder);
    
    showFeedback = true;
    
    // Store result
    exercise.feedback.push({
      questionId: question.id,
      isCorrect,
      userAnswer: userOrder.join(' '),
      correctAnswer: question.correctOrder.join(' '),
      attempts,
      timestamp: new Date()
    });
    
    // Dispatch event
    dispatch('exerciseComplete', {
      exerciseId: exercise.id,
      isCorrect,
      userAnswer: userOrder.join(' ')
    });
  }

  function resetExercise() {
    if (!currentQuestion) return;
    const question = currentQuestion;
    availableWords = [...question.words].sort(() => Math.random() - 0.5);
    userOrder = [];
    showFeedback = false;
    isCorrect = false;
    attempts = 0;
  }

  function getFeedbackMessage(): string {
    if (!showFeedback || !currentQuestion) return '';
    
    if (isCorrect) {
      return exercise.feedbackMessages?.correct || '✅ Correct! Well done!';
    } else {
      const question = currentQuestion;
      return exercise.feedbackMessages?.incorrect || `❌ Try again. Correct order: ${question.correctOrder.join(' ')}`;
    }
  }
</script>

<div class="sentence-builder-container">
  <!-- Exercise Prompt -->
  <div class="prompt">
    <h3>{currentQuestion?.prompt}</h3>
    {#if exercise.grammarHint}
      <div class="grammar-hint">
        💡 {exercise.grammarHint}
      </div>
    {/if}
  </div>

  <!-- User's Sentence Construction -->
  <div class="user-sentence">
    {#if userOrder.length > 0}
      <div class="sentence-construction">
        {#each userOrder as word, i}
          <button
            class="word-bubble selected"
            onclick={() => removeWord(i)}
            title="Click to remove"
          >
            {word}
          </button>
          {#if i < userOrder.length - 1}<span class="spacer"></span>{/if}
        {/each}
      </div>
    {:else}
      <div class="empty-sentence">
        <p>Click words below to build the sentence</p>
      </div>
    {/if}
  </div>

  <!-- Available Words -->
  <div class="word-bank">
    {#each availableWords as word}
      <button
        class="word-bubble"
        onclick={() => handleWordClick(word)}
        disabled={showFeedback}
      >
        {word}
      </button>
    {/each}
  </div>

  <!-- Feedback and Actions -->
  <div class="feedback-section">
    {#if showFeedback}
      <div class="feedback-message" class:correct={isCorrect}>
        {getFeedbackMessage()}
      </div>
      <div class="actions">
        <button onclick={resetExercise} class="reset-btn">
          Try Again
        </button>
        {#if isCorrect && exercise.currentQuestionIndex < exercise.questions.length - 1}
          <button
            onclick={() => {
              exercise.currentQuestionIndex++;
              resetExercise();
            }}
            class="next-btn"
          >
            Next Question →
          </button>
        {/if}
      </div>
    {:else if userOrder.length > 0}
      <button onclick={checkAnswer} class="check-btn">
        Check Answer
      </button>
    {/if}
  </div>

  <!-- Progress -->
  {#if exercise.questions.length > 1}
    <div class="progress-indicator">
      Question {exercise.currentQuestionIndex + 1} of {exercise.questions.length}
    </div>
  {/if}
</div>

<style>
  .sentence-builder-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--surface);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .prompt {
    text-align: center;
    margin-bottom: 1rem;
  }

  .prompt h3 {
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  .grammar-hint {
    background: var(--primary-light);
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .user-sentence {
    min-height: 4rem;
    border: 2px dashed var(--primary);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--surface-variant);
  }

  .sentence-construction {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .empty-sentence {
    color: var(--on-surface-variant);
    font-style: italic;
  }

  .word-bank {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    padding: 1rem;
    background: var(--background);
    border-radius: 8px;
  }

  .word-bubble {
    padding: 0.75rem 1.25rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .word-bubble:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: var(--primary-dark);
  }

  .word-bubble:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .word-bubble.selected {
    background: var(--secondary);
    position: relative;
  }

  .spacer {
    width: 0.5rem;
  }

  .feedback-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .feedback-message {
    padding: 1rem;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.1rem;
    transition: all 0.3s;
  }

  .feedback-message.correct {
    background: var(--success-container);
    color: var(--on-success-container);
  }

  .feedback-message:not(.correct) {
    background: var(--error-container);
    color: var(--on-error-container);
  }

  .actions {
    display: flex;
    gap: 1rem;
  }

  .check-btn, .reset-btn, .next-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .check-btn {
    background: var(--primary);
    color: white;
  }

  .check-btn:hover {
    background: var(--primary-dark);
  }

  .reset-btn {
    background: var(--secondary-container);
    color: var(--on-secondary-container);
  }

  .reset-btn:hover {
    background: var(--secondary);
    color: white;
  }

  .next-btn {
    background: var(--tertiary);
    color: white;
  }

  .next-btn:hover {
    background: var(--tertiary-dark);
  }

  .progress-indicator {
    text-align: center;
    color: var(--on-surface-variant);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  @media (max-width: 600px) {
    .word-bubble {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .check-btn, .reset-btn, .next-btn {
      padding: 0.5rem 1rem;
    }
  }
</style>