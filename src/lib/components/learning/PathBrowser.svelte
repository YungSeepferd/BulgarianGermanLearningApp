<script lang="ts">
  import { onMount } from 'svelte';
  import type { LearningPath, LearningPathProgress } from '$lib/types/learning-path';
  import { getLearningPaths, getLearningPathProgress } from '$lib/db/queries';
  import PathCard from './PathCard.svelte';
  
  interface Props {
    onPathSelect?: (pathId: string) => void;
  }
  
  let { onPathSelect }: Props = $props();
  
  let paths = $state<LearningPath[]>([]);
  let pathProgress = $state<Map<string, LearningPathProgress>>(new Map());
  let loading = $state(true);
  let error = $state<string | undefined>();
  let selectedPath = $state<string | undefined>();
  let difficultyFilter = $state<string>('all');
  
  onMount(async () => {
    try {
      // Fetch all learning paths
      const allPaths = await getLearningPaths();
      paths = allPaths;
      
      // Fetch progress for each path
      for (const path of allPaths) {
        const progress = await getLearningPathProgress(path.id);
        if (progress) {
          pathProgress.set(path.id, progress);
        }
      }
      
      loading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load learning paths';
      loading = false;
    }
  });
  
  // Derived: filtered paths based on difficulty
  const filteredPaths = $derived.by(() => {
    if (difficultyFilter === 'all') return paths;
    return paths.filter(p => p.difficulty === difficultyFilter);
  });
  
  // Derived: path completion stats
  const completionStats = $derived.by(() => {
    return filteredPaths.map(path => {
      const progress = pathProgress.get(path.id);
      const lessonsCompleted = progress?.lessonsCompleted ?? 0;
      const totalLessons = path.lessons?.length ?? 0;
      const completionPercentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
      
      return {
        pathId: path.id,
        completed: lessonsCompleted,
        total: totalLessons,
        percentage: completionPercentage
      };
    });
  });
  
  const handlePathSelect = (pathId: string) => {
    selectedPath = pathId;
    onPathSelect?.(pathId);
  };
</script>

<div class="path-browser">
  <div class="browser-header">
    <h2>Learning Paths</h2>
    
    <div class="filter-controls">
      <label for="difficulty-filter">Filter by difficulty:</label>
      <select id="difficulty-filter" bind:value={difficultyFilter}>
        <option value="all">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="elementary">Elementary</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
      </select>
    </div>
    
    <div class="path-stats">
      <span class="stat-item">
        <strong>{filteredPaths.length}</strong> paths available
      </span>
      <span class="separator">•</span>
      <span class="stat-item">
        <strong>{completionStats.reduce((sum, s) => sum + s.percentage, 0) / Math.max(completionStats.length, 1) | 0}%</strong> average progress
      </span>
    </div>
  </div>
  
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading learning paths...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{error}</p>
      <button class="retry-btn" onclick={() => location.reload()}>Retry</button>
    </div>
  {:else if filteredPaths.length === 0}
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2L15.09 8.26H22L17.18 12.74L19.34 19.26L12 14.97L4.66 19.26L6.82 12.74L2 8.26H8.91L12 2Z"></path>
      </svg>
      <p>No learning paths found for this filter</p>
      <button class="reset-btn" onclick={() => difficultyFilter = 'all'}>Clear filters</button>
    </div>
  {:else}
    <div class="paths-grid">
      {#each filteredPaths as path (path.id)}
        {#if completionStats.find(s => s.pathId === path.id) is { percentage, completed, total } stats}
          <PathCard
            {path}
            progress={{ completed: stats.completed, total: stats.total, percentage: stats.percentage }}
            isSelected={selectedPath === path.id}
            onSelect={() => handlePathSelect(path.id)}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .path-browser {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem;
    background: var(--color-surface, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .browser-header {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
    padding-bottom: 1.5rem;
  }
  
  .browser-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .filter-controls label {
    font-weight: 500;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .filter-controls select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.5rem;
    background: var(--color-background, #f9fafb);
    color: var(--color-text-primary, #111827);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-controls select:hover {
    border-color: var(--color-primary, #3b82f6);
  }
  
  .filter-controls select:focus {
    outline: none;
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .path-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .stat-item strong {
    color: var(--color-primary, #3b82f6);
    font-weight: 600;
  }
  
  .separator {
    opacity: 0.3;
  }
  
  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid var(--color-border, #e5e7eb);
    border-top-color: var(--color-primary, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    text-align: center;
    background: var(--color-error-light, #fee2e2);
    border-radius: 0.75rem;
    color: var(--color-error-dark, #991b1b);
  }
  
  .error-icon {
    width: 3rem;
    height: 3rem;
    color: var(--color-error, #dc2626);
  }
  
  .retry-btn {
    padding: 0.5rem 1rem;
    background: var(--color-error, #dc2626);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .retry-btn:hover {
    background: var(--color-error-dark, #991b1b);
  }
  
  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .empty-icon {
    width: 3rem;
    height: 3rem;
    opacity: 0.5;
  }
  
  .reset-btn {
    padding: 0.5rem 1rem;
    background: var(--color-primary, #3b82f6);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .reset-btn:hover {
    background: var(--color-primary-dark, #2563eb);
  }
  
  /* Paths Grid */
  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .path-browser {
      padding: 1rem;
      gap: 1.5rem;
    }
    
    .paths-grid {
      grid-template-columns: 1fr;
    }
    
    .filter-controls {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
