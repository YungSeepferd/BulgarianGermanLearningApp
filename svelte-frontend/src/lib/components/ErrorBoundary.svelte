<!--
  ErrorBoundary.svelte - Error boundary component for graceful error handling
  @description Catches and displays errors with recovery options and detailed error reporting
  @version 1.0.0
  @updated November 2025
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import type { ErrorContext } from '$lib/types/index.js';

  // Props using Svelte 5 runes
  let {
    error = null,
    errorContext = null,
    devMode = false,
    showReportButton = true,
    fallback = null,
    dispatch
  } = $props();

  // Handle retry action
  function handleRetry(): void {
    dispatch('retry');
  }

  // Handle reload action
  function handleReload(): void {
    window.location.reload();
  }

  // Handle report action
  function handleReport(): void {
    dispatch('report', { error, errorContext });
  }

  // Auto-detect dev mode
  onMount(() => {
    if (typeof window !== 'undefined') {
      devMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }
  });
</script>

{#if error}
  <div class="error-boundary" role="alert" aria-live="polite">
    <div class="error-container">
      <!-- Error Icon and Title -->
      <div class="error-header">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <h2 class="error-title">Something went wrong</h2>
      </div>

      <!-- Error Message -->
      <div class="error-content">
        <p class="error-message">
          {error.message || 'An unexpected error occurred'}
        </p>
        
        <!-- Error Details (Development) -->
        {#if devMode && error.stack}
          <details class="error-details">
            <summary>Error Details</summary>
            <pre class="error-stack">{error.stack}</pre>
          </details>
        {/if}

        <!-- Error Context -->
        {#if errorContext}
          <div class="error-context">
            <h3>Context Information</h3>
            <div class="context-grid">
              <div class="context-item">
                <span class="context-label">Component:</span>
                <span class="context-value">{errorContext.component || 'Unknown'}</span>
              </div>
              <div class="context-item">
                <span class="context-label">Action:</span>
                <span class="context-value">{errorContext.action || 'Unknown'}</span>
              </div>
              {#if errorContext.userAgent}
                <div class="context-item">
                  <span class="context-label">User Agent:</span>
                  <span class="context-value">{errorContext.userAgent}</span>
                </div>
              {/if}
              {#if errorContext.timestamp}
                <div class="context-item">
                  <span class="context-label">Time:</span>
                  <span class="context-value">{errorContext.timestamp.toLocaleString()}</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- Recovery Actions -->
      <div class="error-actions">
        <button 
          class="action-button primary"
          onclick={handleRetry}
          aria-label="Try again"
        >
          🔄 Try Again
        </button>
        
        <button 
          class="action-button secondary"
          onclick={handleReload}
          aria-label="Reload page"
        >
          🔃 Reload Page
        </button>
        
        {#if showReportButton}
          <button 
            class="action-button tertiary"
            onclick={handleReport}
            aria-label="Report error"
          >
            📝 Report Issue
          </button>
        {/if}
      </div>

      <!-- Help Section -->
      <div class="error-help">
        <h3>Need Help?</h3>
        <ul class="help-list">
          <li>Try refreshing the page</li>
          <li>Check your internet connection</li>
          <li>Clear your browser cache</li>
          <li>Contact support if the problem persists</li>
        </ul>
      </div>
    </div>
  </div>
{/if}

<!-- Fallback UI for when no error is present -->
{#if !error && fallback}
  <div class="fallback-content">
    {#if typeof fallback === 'function'}
      {@html fallback()}
    {:else}
      {fallback}
    {/if}
  </div>
{/if}

<!-- Styles -->
<style>
  .error-boundary {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 2rem;
    margin: 1rem 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: center;
    flex-direction: column;
  }

  .error-icon {
    font-size: 3rem;
    line-height: 1;
  }

  .error-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #dc2626;
  }

  .error-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error-message {
    margin: 0;
    font-size: 1rem;
    color: #374151;
    line-height: 1.5;
    text-align: center;
  }

  .error-details {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .error-stack {
    background: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    overflow-x: auto;
    white-space: pre-wrap;
    margin: 0;
  }

  .error-context {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 1rem;
  }

  .error-context h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #0369a1;
  }

  .context-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .context-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .context-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
  }

  .context-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .severity-low { color: #059669; }
  .severity-medium { color: #d97706; }
  .severity-high { color: #dc2626; }
  .severity-critical { color: #7c3aed; }

  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .action-button:active {
    transform: translateY(0);
  }

  .action-button.primary {
    background: #3b82f6;
    color: white;
  }

  .action-button.primary:hover {
    background: #2563eb;
  }

  .action-button.secondary {
    background: #6b7280;
    color: white;
  }

  .action-button.secondary:hover {
    background: #4b5563;
  }

  .action-button.tertiary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .action-button.tertiary:hover {
    background: #e5e7eb;
  }

  .error-help {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .error-help h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .help-list {
    margin: 0;
    padding-left: 1.5rem;
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .help-list li {
    margin-bottom: 0.25rem;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .error-boundary {
      padding: 1.5rem 1rem;
      margin: 0.5rem;
    }

    .error-header {
      gap: 0.75rem;
    }

    .error-icon {
      font-size: 2.5rem;
    }

    .error-title {
      font-size: 1.25rem;
    }

    .error-actions {
      flex-direction: column;
    }

    .action-button {
      justify-content: center;
    }

    .context-grid {
      grid-template-columns: 1fr;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .error-boundary {
      border-width: 2px;
    }

    .action-button {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .action-button {
      transition: none;
    }

    .action-button:hover {
      transform: none;
    }
  }
</style>