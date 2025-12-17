<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import PathBrowser from '$lib/components/learning/PathBrowser.svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import { getLearningPaths, getLearningPathProgress } from '$lib/services/learning-paths';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let paths = $state<LearningPath[]>([]);
  let pathProgress = $state<Map<string, LearningPathProgress>>(new Map());

  onMount(async () => {
    try {
      const loadedPaths = await getLearningPaths();
      const progressMap = new Map<string, LearningPathProgress>();

      for (const path of loadedPaths) {
        const progress = await getLearningPathProgress(path.id);
        progressMap.set(path.id, progress);
      }

      paths = loadedPaths;
      pathProgress = progressMap;
    } catch (e) {
      error = (e as Error).message ?? 'Failed to load learning paths';
    } finally {
      loading = false;
    }
  });

  const handlePathSelect = (pathId: string) => {
    goto(`${base}/learn/paths/${pathId}`);
  };
</script>

<div class="page">
  <header class="header">
    <div>
      <p class="eyebrow">Learning Hub</p>
      <h1>Choose a learning path</h1>
      <p class="subtitle">Browse available paths and jump into the lessons.</p>
    </div>
  </header>

  {#if loading}
    <div class="state">Loading learning paths…</div>
  {:else if error}
    <div class="state error">{error}</div>
  {:else}
    <PathBrowser paths={paths} pathProgress={pathProgress} onPathSelect={handlePathSelect} />
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: var(--color-background, #f9fafb);
    min-height: 100vh;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .eyebrow {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #6b7280);
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    color: var(--color-text-primary, #111827);
  }

  .subtitle {
    margin: 0;
    color: var(--color-text-secondary, #6b7280);
  }

  .state {
    padding: 1rem;
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 0.75rem;
    color: var(--color-text-primary, #111827);
  }

  .state.error {
    border-color: #ef4444;
    color: #b91c1c;
  }
</style>
