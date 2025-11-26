<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import type { VocabularyEntry, SessionStats as SessionStatsType, PracticeSettings } from '$lib/types/index.js';
  

  let loading: boolean = true;
  let error: Error | null = null;

  onMount(async () => {
    try {
      // Simple initialization for now
      loading = false;
    } catch (err) {
      error = err instanceof Error ? err : new Error('Failed to initialize');
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Practice Session - Bulgarian-German Learning App</title>
  <meta name="description" content="Practice Bulgarian-German vocabulary with spaced repetition flashcards" />
</svelte:head>

<div class="practice-container">
  <h1>Practice Session</h1>
  
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>Error: {error.message}</p>
  {:else}
    <p>Practice session ready!</p>
  {/if}
</div>

<style>
  .practice-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
</style>