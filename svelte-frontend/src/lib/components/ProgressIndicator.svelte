<!--
  ProgressIndicator.svelte - Session progress component
  @description Visual progress indicator for flashcard sessions with detailed statistics
  @version 1.0.0
  @updated November 2025
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SessionStats } from '$lib/types/index.js';

  // Props
  export let current: number = 0;
  export let total: number = 0;
  export let sessionStats: SessionStats | null = null;
  export let showDetails: boolean = true;
  export let showTime: boolean = true;
  export let compact: boolean = false;
  export let showPercentage: boolean = true;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Computed values
  $: percentage = total > 0 ? (current / total) * 100 : 0;
  $: accuracy = sessionStats && sessionStats.reviewedCards > 0 
    ? (sessionStats.correctAnswers / sessionStats.reviewedCards) * 100 
    : 0;
  $: averageGrade = sessionStats && sessionStats.grades.length > 0
    ? sessionStats.grades.reduce((sum, grade) => sum + grade, 0) / sessionStats.grades.length
    : 0;
  $: duration = sessionStats && sessionStats.startTime && sessionStats.endTime
    ? (sessionStats.endTime.getTime() - sessionStats.startTime.getTime()) / 1000 / 60 // in minutes
    : sessionStats && sessionStats.startTime
    ? (Date.now() - sessionStats.startTime.getTime()) / 1000 / 60
    : 0;

  // Progress color based on performance
  $: progressColor = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : percentage >= 25 ? 'bg-yellow-500' : 'bg-red-500';

  // Format time display
  function formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  // Get progress status message
  function getProgressMessage(): string {
    if (total === 0) return 'No cards in session';
    if (current === 0) return 'Ready to start';
    if (current === total) return 'Session complete!';
    return `${current} of ${total} cards`;
  }

  // Handle progress bar click (jump to specific position)
  function handleProgressClick(event: MouseEvent): void {
    if (!compact && total > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickPercentage = clickX / rect.width;
      const targetCard = Math.round(clickPercentage * total);
      
      dispatch('jump', { card: Math.max(0, Math.min(targetCard, total)) });
    }
  }

  // Get grade distribution
  function getGradeDistribution(): Record<number, number> {
    if (!sessionStats) return {};
    
    const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    for (const grade of sessionStats.grades) {
      if (grade >= 0 && grade <= 5) {
        distribution[grade]++;
      }
    }
    
    return distribution;
  }

  $: gradeDistribution = getGradeDistribution();
</script>

<!-- Progress Indicator Container -->
<div class="progress-indicator {compact ? 'compact' : ''}" role="region" aria-label="Session progress">
  <!-- Main Progress Bar -->
  <div class="progress-header">
    <div class="progress-info">
      <h2 class="progress-title">{getProgressMessage()}</h2>
      {#if showPercentage}
        <span class="progress-percentage">{Math.round(percentage)}%</span>
      {/if}
    </div>
    
    {#if !compact && showDetails}
      <div class="progress-stats">
        {#if sessionStats}
          <div class="stat-item">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">{Math.round(accuracy)}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Avg Grade</span>
            <span class="stat-value">{averageGrade.toFixed(1)}</span>
          </div>
          {#if showTime}
            <div class="stat-item">
              <span class="stat-label">Time</span>
              <span class="stat-value">{formatTime(duration * 60)}</span>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Progress Bar -->
  <div 
    class="progress-bar-container"
    role="progressbar"
    aria-valuenow={current}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-label="Session progress"
    on:click={handleProgressClick}
  >
    <div class="progress-bar">
      <div 
        class="progress-fill {progressColor}"
        style="width: {percentage}%"
      ></div>
    </div>
    
    <!-- Progress markers -->
    {#if !compact && total > 0}
      <div class="progress-markers">
        {#each Array.from({ length: Math.min(total, 10) }, (_, i) => i) as i}
          <div 
            class="progress-marker {i < current ? 'completed' : ''} {i === current ? 'current' : ''}"
            style="left: {(i / (total - 1)) * 100}%"
          ></div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Detailed Statistics -->
  {#if !compact && showDetails && sessionStats}
    <div class="progress-details">
      <!-- Session Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Cards Reviewed</h3>
          <div class="stat-number">{sessionStats.reviewedCards}</div>
          <div class="stat-subtitle">of {sessionStats.totalCards} total</div>
        </div>
        
        <div class="stat-card">
          <h3>Correct Answers</h3>
          <div class="stat-number">{sessionStats.correctAnswers}</div>
          <div class="stat-subtitle">{Math.round(accuracy)}% accuracy</div>
        </div>
        
        <div class="stat-card">
          <h3>Average Grade</h3>
          <div class="stat-number">{averageGrade.toFixed(1)}</div>
          <div class="stat-subtitle">out of 5.0</div>
        </div>
        
        {#if showTime}
          <div class="stat-card">
            <h3>Session Time</h3>
            <div class="stat-number">{formatTime(duration * 60)}</div>
            <div class="stat-subtitle">duration</div>
          </div>
        {/if}
      </div>

      <!-- Grade Distribution -->
      {#if sessionStats.grades.length > 0}
        <div class="grade-distribution">
          <h3>Grade Distribution</h3>
          <div class="grade-bars">
            {#each [0, 1, 2, 3, 4, 5] as grade}
              <div class="grade-bar-item">
                <span class="grade-label">{grade}</span>
                <div class="grade-bar-container">
                  <div 
                    class="grade-bar-fill"
                    style="width: {sessionStats.grades.length > 0 ? (gradeDistribution[grade] / sessionStats.grades.length) * 100 : 0}%"
                  ></div>
                </div>
                <span class="grade-count">{gradeDistribution[grade]}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Compact Mode Summary -->
  {#if compact}
    <div class="compact-summary">
      {#if sessionStats}
        <span class="compact-stat">{sessionStats.reviewedCards}/{sessionStats.totalCards}</span>
        <span class="compact-stat">{Math.round(accuracy)}%</span>
        <span class="compact-stat">{averageGrade.toFixed(1)}</span>
        {#if showTime}
          <span class="compact-stat">{formatTime(duration * 60)}</span>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<!-- Styles -->
<style>
  .progress-indicator {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
  }

  .progress-indicator.compact {
    padding: 1rem;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progress-info {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .progress-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
  }

  .progress-percentage {
    font-size: 1.125rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .progress-stats {
    display: flex;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .progress-bar-container {
    position: relative;
    height: 1rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .progress-bar {
    height: 100%;
    background: #e5e7eb;
    border-radius: 0.5rem;
    transition: width 0.3s ease;
  }

  .progress-fill {
    height: 100%;
    border-radius: 0.5rem;
    transition: width 0.3s ease, background-color 0.3s ease;
  }

  .progress-markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
  }

  .progress-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 0.25rem;
    height: 0.25rem;
    border-radius: 50%;
    background: #9ca3af;
    transition: all 0.2s ease;
  }

  .progress-marker.completed {
    background: #10b981;
  }

  .progress-marker.current {
    background: #3b82f6;
    width: 0.5rem;
    height: 0.5rem;
  }

  .progress-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .stat-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .stat-subtitle {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .grade-distribution {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .grade-distribution h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .grade-bars {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .grade-bar-item {
    display: grid;
    grid-template-columns: 2rem 1fr 2rem;
    align-items: center;
    gap: 0.5rem;
  }

  .grade-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    text-align: center;
  }

  .grade-bar-container {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .grade-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #84cc16, #22c55e, #10b981);
    border-radius: 0.25rem;
    transition: width 0.3s ease;
  }

  .grade-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-align: right;
  }

  .compact-summary {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .compact-stat {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  /* Progress bar colors */
  .bg-green-500 { background-color: #10b981; }
  .bg-blue-500 { background-color: #3b82f6; }
  .bg-yellow-500 { background-color: #eab308; }
  .bg-red-500 { background-color: #ef4444; }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .progress-indicator {
      padding: 1rem;
    }

    .progress-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .progress-stats {
      gap: 0.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .grade-bar-item {
      grid-template-columns: 1.5rem 1fr 1.5rem;
      gap: 0.25rem;
    }

    .compact-summary {
      gap: 0.5rem;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) {
    .progress-bar-container {
      cursor: default;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .progress-indicator {
      border-width: 2px;
    }

    .progress-bar-container {
      border: 2px solid currentColor;
    }

    .stat-card,
    .grade-distribution {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .progress-fill,
    .progress-marker,
    .grade-bar-fill {
      transition: none;
    }
  }
</style>