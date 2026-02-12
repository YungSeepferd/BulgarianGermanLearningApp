<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  import Toaster from '$lib/components/ui/Toaster.svelte';
  import '$lib/styles/tokens.css';
  // Layout shell: no page-level logic needed here
  import { initializeVocabularyRepository } from '$lib/services/di-container';
  import { initializeAppState } from '$lib/state/app-state';
  import { ErrorHandler } from '$lib/services/errors';
  import { showError } from '$lib/services/toast.svelte';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

  let { children } = $props();

  // Register toast handler for error notifications
  ErrorHandler.registerToastHandler((context, error) => {
    const message = error instanceof Error ? error.message : String(error);
    showError(message, context);
  });

  // Create QueryClient with default options
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });

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

  // Handle errors from error boundary
  function handleBoundaryError(error: Error) {
    ErrorHandler.handleError(error, 'ErrorBoundary');
  }
</script>

<svelte:head>
  <title>Bulgarian-German Learning App</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <ErrorBoundary onError={handleBoundaryError}>
    <div class="app-layout">
      <Navigation />
      <main>
        {@render children()}
      </main>
    </div>
  </ErrorBoundary>
</QueryClientProvider>

<!-- Global toast notifications -->
<Toaster />


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