<script lang="ts">
  import SimpleProgressCounter from '$lib/components/SimpleProgressCounter.svelte';
  import { diContainer } from '$lib/services/di-container';
  import { onMount } from 'svelte';
  import { initializeApp } from '$lib/state/app.svelte';
  import { t } from '$lib/services/localization';

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
  <h1>{t('dashboard.title')}</h1>
  <SimpleProgressCounter />
</div>

<style>
  .dashboard-container {
    max-width: 1200px;
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