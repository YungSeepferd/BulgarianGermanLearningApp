<script lang="ts">
  import { Motion } from 'svelte-motion';
  import type { ToastType } from '$lib/services/toast.svelte';

  // Props
  let {
    type = 'info',
    title = undefined,
    message,
    dismissible = true,
    onDismiss = undefined
  }: {
    type: ToastType;
    title: string | undefined;
    message: string;
    dismissible: boolean;
    onDismiss: (() => void) | undefined;
  } = $props();

  // Icon mapping
  const icons: Record<ToastType, string> = {
    error: '⚠️',
    success: '✅',
    warning: '⚡',
    info: 'ℹ️'
  };

  // Color schemes - using explicit colors that meet WCAG 4.5:1 on all light backgrounds
  const colors: Record<ToastType, { bg: string; border: string; title: string; message: string }> = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'rgb(31 41 55)', // gray-800 - WCAG compliant on red-50
      message: 'rgb(55 65 81)' // gray-700 - WCAG compliant on red-50
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'rgb(31 41 55)', // gray-800 - WCAG compliant on green-50
      message: 'rgb(55 65 81)' // gray-700 - WCAG compliant on green-50
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'rgb(31 41 55)', // gray-800 - WCAG compliant on amber-50
      message: 'rgb(55 65 81)' // gray-700 - WCAG compliant on amber-50
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'rgb(31 41 55)', // gray-800 - WCAG compliant on blue-50
      message: 'rgb(55 65 81)' // gray-700 - WCAG compliant on blue-50
    }
  };

  function handleDismiss() {
    onDismiss?.();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && dismissible) {
      handleDismiss();
    }
  }
</script>

<Motion
  let:motion
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, x: 100, scale: 0.95 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  <div
    use:motion
    class="toast {colors[type].bg} {colors[type].border}"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
    tabindex="-1"
    onkeydown={handleKeyDown}
  >
  <div class="toast-icon" aria-hidden="true">
    {icons[type]}
  </div>

  <div class="toast-content">
    {#if title}
      <h4 class="toast-title" style="color: {colors[type].title} !important">
        {title}
      </h4>
    {/if}
    <p class="toast-message" style="color: {colors[type].message} !important">
      {message}
    </p>
  </div>

  {#if dismissible}
    <button
      class="toast-close"
      onclick={handleDismiss}
      aria-label="Dismiss notification"
      type="button"
    >
      <span aria-hidden="true">×</span>
    </button>
  {/if}
  </div>
</Motion>

<style>
  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-width: 400px;
    min-width: 300px;
    pointer-events: auto;
  }

  .toast:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .toast-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0 0 0.25rem 0;
    color: inherit !important;
  }

  .toast-message {
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
    color: inherit !important;
  }

  .toast-close {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 1.25rem;
    color: #6b7280;
    transition: all 0.2s ease;
  }

  .toast-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1f2937;
  }

  .toast-close:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toast {
      transition: none;
    }
  }
</style>
