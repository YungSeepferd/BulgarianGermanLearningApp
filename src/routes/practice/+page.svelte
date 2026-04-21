<script lang="ts">
  import TandemPractice from '$lib/components/TandemPractice.svelte';
  import { appState } from '$lib/state/app-state';

  const ui = $derived(appState.languageMode === 'DE_BG'
    ? { subtitle: 'DE → BG' }
    : { subtitle: 'BG → DE' });
</script>

<div class="practice-container">
  <header class="practice-header">
    <h1 class="practice-title">Practice Mode</h1>
    <p class="practice-subtitle">{ui.subtitle}</p>
  </header>

  <div class="practice-content">
    <TandemPractice />
  </div>
</div>

<style>
  .practice-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-8) var(--space-4);
    background: var(--bg-base);
  }

  .practice-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .practice-title {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    font-weight: 600;
  }

  .practice-subtitle {
    font-family: var(--font-body);
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
    letter-spacing: 0.05em;
  }

  .practice-content {
    width: 100%;
    max-width: 720px;
    background: var(--bg-elevated);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: var(--space-6);
  }
</style>