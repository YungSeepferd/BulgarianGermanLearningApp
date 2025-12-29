<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import '$lib/styles/tokens.css';
  // Layout shell: no page-level logic needed here
  import { initializeVocabularyRepository } from '$lib/services/di-container';
  import { initializeAppState } from '$lib/state/app-state';
  import { ErrorHandler } from '$lib/services/errors';

  let { children } = $props();

  // Initialize shared data on client startup
  $effect(() => {
    (async () => {
      try {
        await initializeVocabularyRepository();
        await initializeAppState();
      } catch (error) {
        // Non-fatal: UI can still render empty states
        ErrorHandler.handleError(error, 'Layout Initialization');
      }
    })();
    return () => {};
  });
</script>

<svelte:head>
  <title>Bulgarian-German Learning App</title>
</svelte:head>

<div class="app-layout">
  <Navigation />
  <main>
    {@render children()}
  </main>
</div>


<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    overflow-x: hidden; /* Prevent horizontal scrolling */
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: 1rem;
    background-color: white;
  }

  @media (min-width: 769px) {
    main {
        padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
</style>