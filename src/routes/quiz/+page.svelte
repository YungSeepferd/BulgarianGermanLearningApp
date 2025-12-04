<script lang="ts">
  import { $state } from 'svelte';
  import { quizService } from '$lib/services/quiz';
  import { vocabularyDb } from '$lib/data/db.svelte';
  import QuizCard from '$lib/components/QuizCard.svelte';

  // State
  let quiz = $state(null);
  let session = $state(null);
  let isLoading = $state(false);
  let error = $state(null);

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
    } catch (err) {
      error = err.message;
      console.error('Error generating quiz:', err);
    } finally {
      isLoading = false;
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
        on:click={generateQuiz}
        disabled={isLoading}
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <QuizCard {quiz} {session} />
  {/if}
</div>