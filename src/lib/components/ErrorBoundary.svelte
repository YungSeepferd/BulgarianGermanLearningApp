<script lang="ts">
  /**
   * ErrorBoundary - Global Error Handler Component
   *
   * Catches unhandled errors in child components and displays
   * a user-friendly error message with retry functionality.
   *
   * Usage:
   * <ErrorBoundary>
   *   <YourComponent />
   * </ErrorBoundary>
   */

  import { Button } from '$lib/components/ui/button';

  interface Props {
    children: import('svelte').Snippet;
    fallback?: import('svelte').Snippet<[Error, () => void]>;
    onError?: (error: Error) => void;
  }

  let { children, fallback, onError }: Props = $props();

  // Track retry count for max retries logic
  let errorCount = $state(0);

  // Maximum number of retries before giving up
  const MAX_RETRIES = 3;

  /**
   * Handle errors caught from child components
   */
  function handleError(err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    errorCount++;

    // Log to console for debugging
    console.error('[ErrorBoundary] Caught error:', errorObj);

    // Call optional error handler
    onError?.(errorObj);

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorObj.message,
        fatal: true
      });
    }
  }

  /**
   * Reset the error boundary completely
   */
  function reset() {
    errorCount = 0;
  }
</script>

<svelte:boundary onerror={handleError}>
  {@render children()}

  {#snippet failed(err: unknown, retryFn: () => void)}
    {@const error = err instanceof Error ? err : new Error(String(err))}
    {#if fallback}
      {@render fallback(error, retryFn)}
    {:else}
      <div class="error-boundary" role="alert" aria-live="assertive">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">Something went wrong</h2>
          <p class="error-message">
            {error.message || 'An unexpected error occurred'}
          </p>

          {#if errorCount < MAX_RETRIES}
            <div class="error-actions">
              <Button onclick={retryFn} variant="default" class="retry-btn">
                🔄 Try Again
              </Button>
              <Button onclick={reset} variant="outline" class="reset-btn">
                🔄 Reset
              </Button>
            </div>
          {:else}
            <div class="error-actions">
              <p class="max-retries-message">
                Too many failed attempts. Please refresh the page.
              </p>
              <Button onclick={() => window.location.reload()} variant="default">
                🔄 Refresh Page
              </Button>
            </div>
          {/if}

          {#if import.meta.env.DEV}
            <details class="error-details">
              <summary>Debug Information</summary>
              <pre class="error-stack">{error.stack}</pre>
            </details>
          {/if}
        </div>
      </div>
    {/if}
  {/snippet}
</svelte:boundary>

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: var(--spacing-6, 1.5rem);
    background-color: var(--color-bg-secondary, #f9fafb);
    border-radius: var(--radius-lg, 0.5rem);
  }

  .error-content {
    text-align: center;
    max-width: 480px;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-4, 1rem);
  }

  .error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
  }

  .error-message {
    font-size: 1rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0 0 var(--spacing-6, 1.5rem) 0;
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3, 0.75rem);
    align-items: center;
  }

  .max-retries-message {
    font-size: 0.875rem;
    color: var(--color-warning, #f59e0b);
    margin: 0 0 var(--spacing-2, 0.5rem) 0;
  }

  .error-details {
    margin-top: var(--spacing-6, 1.5rem);
    text-align: left;
    background-color: var(--color-bg-tertiary, #f3f4f6);
    border-radius: var(--radius-md, 0.375rem);
    padding: var(--spacing-4, 1rem);
  }

  .error-details summary {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary, #6b7280);
    cursor: pointer;
    user-select: none;
  }

  .error-stack {
    font-size: 0.75rem;
    font-family: 'Monaco', 'Menlo', monospace;
    color: var(--color-text-muted, #9ca3af);
    background-color: var(--color-bg-primary, #ffffff);
    padding: var(--spacing-3, 0.75rem);
    border-radius: var(--radius-sm, 0.25rem);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin-top: var(--spacing-3, 0.75rem);
  }

  @media (max-width: 640px) {
    .error-boundary {
      min-height: 300px;
      padding: var(--spacing-4, 1rem);
    }

    .error-icon {
      font-size: 3rem;
    }

    .error-title {
      font-size: 1.25rem;
    }

    .error-actions {
      flex-direction: column;
      width: 100%;
    }

    :global(.error-actions button) {
      width: 100%;
    }
  }
</style>
