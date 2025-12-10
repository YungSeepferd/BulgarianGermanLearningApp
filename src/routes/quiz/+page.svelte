<script lang="ts">
  import { quizService } from '$lib/services/quiz';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import FlashCard from '$lib/components/flashcard/flash-card.svelte';
  import QuizController from '$lib/components/flashcard/quiz-controller.svelte';

  // State
  let quiz = $state(null);
  let session = $state(null);
  let isLoading = $state(false);
  let error = $state(null);
  let currentQuestionIndex = $state(0);
  let currentItem = $state(null);

  // Generate quiz
  async function generateQuiz() {
    isLoading = true;
    error = null;

    try {
      // Generate quiz with 5 questions
      quiz = quizService.generateQuiz({
        difficulty: 'A1',
        limit: 5
      });

      // Start quiz session
      session = quizService.startQuizSession(quiz);

      // Set first question
      if (quiz && quiz.questions.length > 0) {
        currentQuestionIndex = 0;
        // Note: In a real implementation, we would fetch the actual question data
        // For now, we'll use a placeholder
        currentItem = {
          german: "Example word",
          bulgarian: "Пример",
          category: ["vocabulary"],
          difficulty: "A1"
        };
      }
    } catch (err) {
      error = err.message;
      // Error generating quiz
    } finally {
      isLoading = false;
    }
  }

  function handleNext() {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      currentQuestionIndex += 1;
      // Update current item for the new question
      // Note: In a real implementation, we would fetch the actual question data
      currentItem = {
        german: `Example word ${currentQuestionIndex + 1}`,
        bulgarian: `Пример ${currentQuestionIndex + 1}`,
        category: ["vocabulary"],
        difficulty: "A1"
      };
    }
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-6">Vocabulary Quiz</h1>

  {#if !quiz}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Start a New Quiz</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Test your knowledge of Bulgarian vocabulary with our interactive quiz.
      </p>

      <button
        onclick={generateQuiz}
        disabled={isLoading}
        class="button button-primary px-6 py-3"
      >
        {#if isLoading}
          <span>Generating Quiz...</span>
        {:else}
          <span>Start Quiz</span>
        {/if}
      </button>

      {#if error}
        <div class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
          Error: {error}
        </div>
      {/if}
    </div>
  {:else}
    <div class="quiz-container">
      {#if currentItem}
        <FlashCard
          item={currentItem}
          flipped={false}
          onFlip={() => {}}
        />
        <QuizController
          item={currentItem}
          onNext={handleNext}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .quiz-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-height: 600px;
  }
</style>