<script lang="ts">
  import type { LearningPath } from '$lib/types/learning-path';
  
  interface Props {
    path: LearningPath;
    progress: {
      completed: number;
      total: number;
      percentage: number;
    };
    isSelected?: boolean;
    onSelect?: () => void;
  }
  
  let { path, progress, isSelected = false, onSelect }: Props = $props();
  
  // Derived values
  const progressClass = $derived(
    progress.percentage === 0 ? 'not-started' :
    progress.percentage === 100 ? 'completed' :
    'in-progress'
  );
  
  const difficultyColor = $derived(
    path.difficulty === 'beginner' ? 'success' :
    path.difficulty === 'elementary' ? 'info' :
    path.difficulty === 'intermediate' ? 'warning' :
    path.difficulty === 'advanced' ? 'danger' :
    'dark'
  );
  
  const estimatedDays = $derived(Math.ceil((path.lessons?.length ?? 0) / 5));
</script>

<div class="path-card" class:selected={isSelected} onclick={onSelect}>
  <div class="card-header">
    <div class="title-section">
      <h3 class="path-title">{path.title}</h3>
      
      <span class="difficulty-badge" data-difficulty={path.difficulty}>
        {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
      </span>
    </div>
    
    <div class="progress-ring">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" class="ring-bg"></circle>
        <circle
          cx="50"
          cy="50"
          r="45"
          class="ring-progress"
          style="stroke-dasharray: {progress.percentage * 2.827}; stroke-dashoffset: 0"
        ></circle>
      </svg>
      <div class="ring-label">{progress.percentage}%</div>
    </div>
  </div>
  
  {#if path.description}
    <p class="path-description">{path.description}</p>
  {/if}
  
  <div class="card-stats">
    <div class="stat-item">
      <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span class="stat-label">~{estimatedDays} days</span>
    </div>
    
    <div class="stat-item">
      <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      <span class="stat-label">{progress.total} lessons</span>
    </div>
    
    <div class="stat-item">
      <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 15 9 9 15"></polyline>
      </svg>
      <span class="stat-label">
        {progress.completed}/{progress.total}
      </span>
    </div>
  </div>
  
  <div class="card-progress">
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: {progress.percentage}%"></div>
    </div>
    <span class="progress-status" class:status={progressClass}>
      {progress.percentage === 0 ? 'Not started' :
       progress.percentage === 100 ? 'Completed ✓' :
       'In progress'}
    </span>
  </div>
  
  <div class="card-footer">
    <button class="action-btn" onclick={onSelect}>
      {progress.percentage === 0 ? 'Start Path' :
       progress.percentage === 100 ? 'Review' :
       'Continue'}
    </button>
  </div>
</div>

<style>
  .path-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-card-bg, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 0.75rem;
    transition: all 0.3s;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .path-card:hover {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
  
  .path-card.selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-light, #eff6ff);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .title-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }
  
  .path-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .difficulty-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    width: fit-content;
  }
  
  .difficulty-badge[data-difficulty='beginner'] {
    background: #dbeafe;
    color: #075985;
  }
  
  .difficulty-badge[data-difficulty='elementary'] {
    background: #dbeafe;
    color: #075985;
  }
  
  .difficulty-badge[data-difficulty='intermediate'] {
    background: #fef08a;
    color: #713f12;
  }
  
  .difficulty-badge[data-difficulty='advanced'] {
    background: #fed7aa;
    color: #92400e;
  }
  
  .difficulty-badge[data-difficulty='expert'] {
    background: #fecaca;
    color: #7f1d1d;
  }
  
  .progress-ring {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
  
  .progress-ring svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  .ring-bg {
    fill: none;
    stroke: var(--color-border, #e5e7eb);
    stroke-width: 3;
  }
  
  .ring-progress {
    fill: none;
    stroke: var(--color-primary, #3b82f6);
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s;
  }
  
  .ring-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
  }
  
  .path-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.5;
  }
  
  .card-stats {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--color-background, #f9fafb);
    border-radius: 0.5rem;
    font-size: 0.75rem;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-secondary, #6b7280);
  }
  
  .stat-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
  
  .stat-label {
    white-space: nowrap;
  }
  
  .card-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .progress-bar-bg {
    flex: 1;
    height: 0.5rem;
    background: var(--color-border, #e5e7eb);
    border-radius: 9999px;
    overflow: hidden;
  }
  
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-success, #10b981), var(--color-primary, #3b82f6));
    transition: width 0.3s;
  }
  
  .progress-status {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 70px;
    text-align: right;
  }
  
  .progress-status.status {
    color: var(--color-text-secondary, #6b7280);
  }
  
  .progress-status.not-started {
    color: var(--color-text-secondary, #6b7280);
  }
  
  .progress-status.in-progress {
    color: var(--color-warning, #f59e0b);
  }
  
  .progress-status.completed {
    color: var(--color-success, #10b981);
  }
  
  .card-footer {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border, #e5e7eb);
  }
  
  .action-btn {
    flex: 1;
    padding: 0.625rem 1rem;
    background: var(--color-primary, #3b82f6);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .action-btn:hover {
    background: var(--color-primary-dark, #2563eb);
  }
  
  .action-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 640px) {
    .path-card {
      padding: 1rem;
      gap: 0.75rem;
    }
    
    .card-header {
      gap: 0.75rem;
    }
    
    .progress-ring {
      width: 70px;
      height: 70px;
    }
    
    .card-stats {
      flex-wrap: wrap;
    }
  }
</style>
