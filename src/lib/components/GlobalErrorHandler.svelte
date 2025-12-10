<script lang="ts">
  /**
   * Global Error Handler Component
   *
   * Provides centralized error handling and user feedback for the application.
   * Listens for error events and displays them to users in a consistent way.
   */

  import { diContainer } from '$lib/services/di-container';
  import { EventTypes, type ErrorEvent } from '$lib/services/event-bus';
  import { Debug } from '$lib/utils';

  // State for error display
  let currentError = $state<string | null>(null);
  let errorDetails = $state<string | null>(null);
  let showDetails = $state(false);

  // Subscribe to global error events
  $effect(() => {
    Debug.log('GlobalErrorHandler', 'Initializing global error handler');
    const eventBus = diContainer.getService('eventBus');
    const unsubscribe = eventBus.subscribe(EventTypes.ERROR, (event: ErrorEvent) => {
      handleErrorEvent(event);
    });

    return () => {
      Debug.log('GlobalErrorHandler', 'Cleaning up error event subscription');
      unsubscribe();
    };
  });

  function handleErrorEvent(event: ErrorEvent) {
    Debug.error('GlobalErrorHandler', 'Global error received', event.error);

    // Format error message for user display
    const errorMessage = formatErrorMessage(event.error);
    const details = formatErrorDetails(event.error, event.context);

    // Store the error
    currentError = errorMessage;
    errorDetails = details;

    // Show error to user
    Debug.log('GlobalErrorHandler', 'Displaying error to user', { error: errorMessage });
  }

  function formatErrorMessage(error: Error): string {
    // Customize error messages based on error type
    if (error.name === 'NetworkError') {
      return 'Network connection issue. Please check your internet connection.';
    } else if (error.name === 'StorageError') {
      return 'Data storage issue. Some features may not work properly.';
    } else if (error.name === 'ValidationError') {
      return 'Data validation issue. Some data may be corrupted.';
    } else if (error.message.includes('Failed to load')) {
      return 'Failed to load data. Please refresh the page.';
    } else if (error.message.includes('Failed to save')) {
      return 'Failed to save your progress. Please try again.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  function formatErrorDetails(error: Error, context?: string): string {
    return `Error: ${error.name}
Message: ${error.message}
Context: ${context || 'Not specified'}
Stack: ${error.stack || 'No stack trace available'}`;
  }

  function dismissError() {
    currentError = null;
    errorDetails = null;
    showDetails = false;
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

<!-- Error Toast Notification -->
{#if currentError}
  <div class="error-toast" role="alert" aria-live="assertive">
    <div class="error-content">
      <div class="error-message">
        ⚠️ {currentError}
      </div>
      <div class="error-actions">
        <button on:click={toggleDetails} class="details-btn">
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <button on:click={dismissError} class="dismiss-btn" aria-label="Dismiss error">
          ✕
        </button>
      </div>
    </div>

    {#if showDetails && errorDetails}
      <div class="error-details">
        <pre>{errorDetails}</pre>
      </div>
    {/if}
  </div>
{/if}

<style>
  .error-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    max-width: 400px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .error-content {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .error-message {
    flex: 1;
    color: #dc2626;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .error-actions {
    display: flex;
    gap: 0.5rem;
  }

  .details-btn, .dismiss-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    background: none;
    color: #dc2626;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .details-btn:hover, .dismiss-btn:hover {
    background-color: #fecaca;
  }

  .error-details {
    border-top: 1px solid #fecaca;
    padding: 1rem;
    background: #fef2f2;
    border-radius: 0 0 8px 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .error-details pre {
    margin: 0;
    font-size: 0.75rem;
    color: #dc2626;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .error-toast {
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      max-width: none;
    }
  }
</style>