<script lang="ts">
  import TestCard from '$lib/components/TestCard.svelte';

  // Reactive state using $state
  let exercises = $state([
    { title: "Multiple Choice", description: "Select the correct translation for the word 'apple'.", type: "mcq", status: "progress" },
    { title: "Fill in the Blank", description: "Complete the sentence: 'Az _____ kaza.' (I _____ say.)", type: "text", status: "progress" },
    { title: "Sentence Translation", description: "Translate 'I eat an apple every day.' to Bulgarian", type: "translation", status: "not-started" },
    { title: "Verb Conjugation", description: "Conjugate the verb 'to say' in present tense", type: "verbs", status: "not-started" }
  ]);

  // Current exercise state
  let currentExercise = $state(0);
  let selectedAnswer = $state("");
  let isSubmitted = $state(false);
  let isCorrect = $state(false);

  // Exercise result information
  let resultMessage = $state("");
  let showResultMessage = $state(false);
  let currentScore = $state(0);

  // Exercise content using $derived
  let currentExContent = $derived(
    exercises.find((_, index) => index === currentExercise) || exercises[0]
  );

  // Answers for multiple choice
  let answerOptions = $state(["Ябълка", "Банан", "Портокал"]);

  // Correct answer for the current question
  let correctAnswer = $derived(
    currentExContent?.title === "Multiple Choice" ? "Ябълка" : ""
  );

  // Navigation functions
  function prevExercise() {
    if (currentExercise > 0) {
      currentExercise--;
      resetState();
    }
  }

  function nextExercise() {
    if (currentExercise < exercises.length - 1) {
      currentExercise++;
      resetState();
    }
  }

  // Submit answer using standard attribute
  function submitAnswer() {
    showResultMessage = true;

    // Check if answer is correct
    if (selectedAnswer === correctAnswer) {
      resultMessage = "Correct! Great job!";
      isCorrect = true;
      currentScore++;

      // Mark exercise as completed
      const exIndex = exercises.findIndex((_, i) => i === currentExercise);
      if (exIndex >= 0 && exercises[exIndex]) {
        exercises[exIndex].status = "completed";
      }
    } else {
      resultMessage = "Not quite! Try again.";
      isCorrect = false;
    }

    isSubmitted = true;
  }

  // Reset answer state
  function resetState() {
    selectedAnswer = "";
    isSubmitted = false;
    isCorrect = false;
    showResultMessage = false;
  }
</script>

<h1>Bulgarian Language Practice</h1>

<div class="page-grid">
  <!-- Test card component example -->
  <TestCard
    title="Practice"
    content="Test your knowledge of Bulgarian with interactive exercises"
    showShadow
    link="#"
  />

  <div class="practice-container">
    <!-- Exercise navigation -->
    <div class="exercise-nav">
      <span>Exercise {currentExercise + 1} of {exercises.length}</span>
    </div>

    <!-- Current exercise -->
    <div class="exercise-display">
      <h2>{currentExContent?.title}</h2>
      <p>{currentExContent?.description}</p>
    </div>

    <!-- Multiple Choice Question -->
    {#if currentExContent?.type === "mcq"}
      <div class="mcq-container">
        {#each answerOptions as option}
          <div
            class="answer-option"
            class:selected={selectedAnswer === option}
            class:correct={isSubmitted && option === correctAnswer}
            class:incorrect={isSubmitted && selectedAnswer === option && option !== correctAnswer}
            onclick={() => { if (!isSubmitted) { selectedAnswer = option } }}
            role="button"
            tabindex="0"
          >
            {option}
          </div>
        {/each}
      </div>

    <!-- Text/Fill in the blank exercise -->
    {:else if currentExContent?.type === "text"}
      <div class="text-exercise">
        <input type="text"
               placeholder="Your answer"
               bind:value={selectedAnswer}
               class="text-input"
               disabled={isSubmitted}
        />
      </div>
    {/if}

    <!-- Submit answer button -->
    <button onclick={submitAnswer} disabled={!selectedAnswer || isSubmitted}>
      {isSubmitted ? "Submitted" : "Submit Answer"}
    </button>

    <!-- Result message -->
    {#if showResultMessage}
      <div class="result-message" class:correct={isCorrect}>
        {resultMessage}
      </div>
    {/if}

    <!-- Navigation buttons -->
    <div class="navigation-buttons">
      <button onclick={prevExercise} disabled={currentExercise === 0}>
        « Previous Exercise
      </button>
      <button onclick={nextExercise} disabled={currentExercise === exercises.length - 1}>
        Next Exercise »
      </button>
    </div>

    <!-- Exercise progress tracker -->
    <div class="progress-tracker">
      <h3>Exercise Progress</h3>
      <ul class="progress-list">
        {#each exercises as exercise}
          <li class="progress-item" class:completed={exercise.status === "completed"}>
            {exercise.title}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<!-- CSS using Svelte's scoped styles -->
<style>
  .page-grid {
    display: grid;
    gap: 1rem;
  }

  .practice-container {
    margin-top: 1rem;
  }

  .exercise-nav {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .exercise-display {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .exercise-display h2 {
    margin-top: 0;
    color: #333;
  }

  .mcq-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .answer-option {
    padding: 0.75rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .answer-option:hover:not(.selected) {
    background-color: #fcfcfa;
  }

  .answer-option.selected {
    background-color: #e1f5fe;
    border-color: #4285f4;
  }

  .answer-option.correct {
    background-color: #e8f5e9 !important;
    border-color: #2e7d32 !important;
  }

  .answer-option.incorrect {
    background-color: #ffebee;
    border-color: #d32f2f;
  }

  .text-exercise {
    margin-bottom: 1rem;
  }

  .text-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    margin-bottom: 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .result-message {
    padding: 0.75rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .result-message.correct {
    background-color: #e8f5e9;
    color: #2e7d32;
  }

  .navigation-buttons {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .navigation-buttons button {
    flex: 1;
  }

  .progress-tracker {
    margin-top: 2rem;
  }

  .progress-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }

  .progress-item {
    padding: 0.5rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .progress-item.completed {
    background-color: #e8f5e9;
  }
</style>