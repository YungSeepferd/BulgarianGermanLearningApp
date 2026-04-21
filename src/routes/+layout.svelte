<script lang="ts">
  import Navigation from '$lib/components/Navigation.svelte';
  import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
  import Toaster from '$lib/components/ui/Toaster.svelte';
  import '$lib/styles/tokens.css';
  // Layout shell: no page-level logic needed here
  import { initializeVocabularyRepository } from '$lib/services/index';
  import { initializeAppState } from '$lib/state/app-state';
  import { ErrorHandler } from '$lib/services/errors';
  import { showError } from '$lib/services/toast.svelte';
  import { logger } from '$lib/services/logger';
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

  // Initialize logger on client startup
  $effect(() => {
    logger.init();
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
      <main aria-label="Main content">
        {@render children()}
      </main>
    </div>
  </ErrorBoundary>
</QueryClientProvider>

<!-- Global toast notifications -->
<Toaster />

<!-- Dev tools panel (tree-shaken in production via dynamic import) -->
{#if import.meta.env.DEV}
  {#await import('$lib/components/ui/DevTools/DevToolsPanel.svelte') then module}
    <module.default />
  {/await}
{/if}


<style>
  :global(html) {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: var(--leading-normal);
    color: var(--text-primary);
    background-color: var(--bg-base);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--bg-base);
    overflow-x: hidden;
  }

  :global(::selection) {
    background: var(--accent-dim);
    color: var(--accent);
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding: var(--space-6) var(--space-4);
    background-color: var(--bg-base);
  }

  @media (min-width: 769px) {
    main {
      padding: var(--space-8) var(--space-6);
      max-width: var(--container-max);
      margin: 0 auto;
      width: 100%;
    }
  }

  @media (min-width: 1024px) {
    main {
      padding: var(--space-10) var(--space-8);
    }
  }
</style>