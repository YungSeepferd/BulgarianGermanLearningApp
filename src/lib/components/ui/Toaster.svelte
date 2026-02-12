<script lang="ts">
  import { toastStore } from '$lib/services/toast.svelte';
  import Toast from './Toast.svelte';
</script>

<!--
  Toaster - Toast Notification Container

  Place this component in your root layout to display toast notifications globally.
-->

<div
  class="toaster"
  role="region"
  aria-label="Notifications"
  aria-live="polite"
>
  {#each toastStore.toasts as toast (toast.id)}
    <Toast
      type={toast.type}
      title={toast.title}
      message={toast.message}
      dismissible={toast.dismissible}
      onDismiss={() => toastStore.dismiss(toast.id)}
    />
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 100%;
    padding: 0.5rem;
    pointer-events: none;
  }

  /* Mobile: full width at bottom */
  @media (max-width: 640px) {
    .toaster {
      top: auto;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      align-items: stretch;
    }

    .toaster > :global(*) {
      max-width: 100%;
      min-width: auto;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .toaster {
      transition: none;
    }
  }
</style>
