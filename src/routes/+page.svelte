<script lang="ts">
  import SimpleProgressCounter from '$lib/components/SimpleProgressCounter.svelte';
  import { onMount } from 'svelte';
  import { initializeApp } from '$lib/state/app.svelte';
  import { t, onTranslationsChange, offTranslationsChange } from '$lib/services/localization';

  // Reactive translation for dashboard title
  let dashboardTitle = $state('');

  // Update translations reactively
  function updateTranslations() {
    dashboardTitle = t('dashboard.title') || 'Dashboard';
  }

  // Set up reactive translation updates
  onMount(() => {
    updateTranslations(); // Initial update
    onTranslationsChange(updateTranslations);

    return () => {
      offTranslationsChange(updateTranslations);
    };
  });

  // Initialize application
  onMount(async () => {
    try {
      // Initialize app state
      await initializeApp();
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  });
</script>

<div class="dashboard-container">
  <h1>{dashboardTitle}</h1>
  <SimpleProgressCounter />
</div>

<style>
  .dashboard-container {
    max-width: 1400px; /* Increased from 1200px for better space usage */
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
  }
</style>