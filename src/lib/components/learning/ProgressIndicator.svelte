<script lang="ts">
  interface Props {
    completed: number;
    total: number;
    timeSpent?: number; // in minutes
    xpEarned?: number;
  }
  
  let { completed = 0, total = 1, timeSpent = 0, xpEarned = 0 }: Props = $props();
  
  // Derived values
  const percentage = $derived(total > 0 ? Math.round((completed / total) * 100) : 0);
  const remaining = $derived(total - completed);
  
  const progressStatus = $derived(
    percentage === 0 ? 'Not started' :
    percentage === 100 ? 'Completed!' :
    percentage >= 75 ? 'Almost done' :
    percentage >= 50 ? 'Halfway there' :
    'Just started'
  );
  
  const statusColor = $derived(
    percentage === 0 ? 'gray' :
    percentage === 100 ? 'success' :
    percentage >= 75 ? 'success' :
    percentage >= 50 ? 'info' :
    'warning'
  );
  
  const hours = $derived(Math.floor(timeSpent / 60));
  const minutes = $derived(timeSpent % 60);
  
  const timeDisplay = $derived(
    hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`
  );
</script>

<div class="progress-indicator">
  <div class="progress-main">
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {percentage}%"></div>
      </div>
      <div class="progress-labels">
        <span class="progress-count">{completed}/{total}</span>
        <span class="progress-percentage">{percentage}%</span>
      </div>
    </div>
    
    <div class="progress-status" data-status={statusColor}>
      <svg class="status-icon" viewBox="0 0 24 24" fill="currentColor">
        {#if percentage === 0}
          <circle cx="12" cy="12" r="10"></circle>
        {:else if percentage === 100}
          <path d="M9 16.2L4.8 12m-1.4 1.4L9 19 21 7"></path>
        {:else if percentage >= 75}
          <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        {:else if percentage >= 50}
          <path d="M7 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"></path>
        {:else}
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
        {/if}
      </svg>
      <span class="status-text">{progressStatus}</span>
    </div>
  </div>
  
  <div class="progress-metrics">
    <div class="metric-item">
      <div class="metric-icon">📚</div>
      <div class="metric-info">
        <span class="metric-label">Remaining</span>
        <span class="metric-value">{remaining} lesson{remaining !== 1 ? 's' : ''}</span>
      </div>
    </div>
    
    {#if timeSpent > 0}
      <div class="metric-item">
        <div class="metric-icon">⏱️</div>
        <div class="metric-info">
          <span class="metric-label">Time spent</span>
          <span class="metric-value">{timeDisplay}</span>
        </div>
      </div>
    {/if}
    
    {#if xpEarned > 0}
      <div class="metric-item">
        <div class="metric-icon">⭐</div>
        <div class="metric-info">
          <span class="metric-label">XP earned</span>
          <span class="metric-value">+{xpEarned} XP</span>
        </div>
      </div>
    {/if}
  </div>
  
  {#if percentage > 0}
    <div class="progress-details">
      <div class="detail-row">
        <span class="detail-label">Progress breakdown:</span>
      </div>
      <div class="detail-bars">
        <div class="detail-bar">
          <div class="bar-fill" style="background: #10b981; width: {(completed / total) * 100}%"></div>
          <span class="bar-label">{completed} completed</span>
        </div>
        <div class="detail-bar">
          <div class="bar-fill" style="background: #d1d5db; width: {(remaining / total) * 100}%"></div>
          <span class="bar-label">{remaining} remaining</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-indicator {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--accent-dim) 0%, var(--bg-elevated) 100%);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
  }

  .progress-main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .progress-bar-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-bar {
    width: 100%;
    height: 1rem;
    background: var(--border-default);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent) 0%, var(--info, #06b6d4) 100%);
    transition: width 0.5s ease;
    border-radius: 9999px;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .progress-count {
    font-weight: 600;
    color: var(--text-primary);
  }

  .progress-percentage {
    font-weight: 600;
    color: var(--accent);
  }

  .progress-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    width: fit-content;
  }

  .progress-status[data-status='gray'] {
    border-color: var(--border-default);
    color: var(--text-secondary);
  }

  .progress-status[data-status='warning'] {
    border-color: var(--warning);
    background: var(--warning);
    opacity: 0.15;
    color: var(--warning);
  }

  .progress-status[data-status='info'] {
    border-color: var(--info, #06b6d4);
    background: var(--info, #06b6d4);
    opacity: 0.15;
    color: var(--info, #06b6d4);
  }

  .progress-status[data-status='success'] {
    border-color: var(--success);
    background: var(--success);
    opacity: 0.15;
    color: var(--success);
  }

  .status-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .status-text {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .progress-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .metric-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
  }

  .metric-icon {
    font-size: 1.5rem;
  }

  .metric-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-weight: 600;
  }

  .metric-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .progress-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
  }

  .detail-row {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .detail-bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 2rem;
  }

  .bar-fill {
    height: 0.625rem;
    border-radius: 9999px;
    min-width: 0;
  }

  .bar-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .progress-indicator {
      padding: 1rem;
      gap: 1rem;
    }

    .progress-metrics {
      grid-template-columns: 1fr;
    }

    .metric-item {
      padding: 0.75rem;
      gap: 0.75rem;
    }
  }
</style>
