<!--
  SessionStats.svelte - Session statistics display component
  @description Comprehensive session statistics with performance metrics and insights
  @version 1.0.0
  @updated November 2025
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SessionStats, ReviewState } from '$lib/types/index.js';
  import { getDueItems, getStatistics } from '$lib/utils/spaced-repetition.js';

  // Props
  export let sessionStats: SessionStats | null = null;
  export let direction: 'bg-de' | 'de-bg' | 'all' = 'all';
  export let showDetails: boolean = true;
  export let showInsights: boolean = true;
  export let compact: boolean = false;
  export let refreshInterval: number = 5000; // Auto-refresh every 5 seconds

  // Local state
  let dueItemsCount: number = 0;
  let overallStats: { total: number; due: number; avgEaseFactor: number; avgAccuracy: number } | null = null;
  let lastRefresh: Date = new Date();
  let refreshTimer: number | null = null;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Computed values
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
  $: cardsPerMinute = duration > 0 ? sessionStats?.reviewedCards / duration : 0;

  // Load statistics
  async function loadStatistics(): Promise<void> {
    try {
      // Get due items count
      const dueItems = getDueItems(direction === 'all' ? undefined : direction);
      dueItemsCount = dueItems.length;

      // Get overall statistics
      overallStats = getStatistics(direction === 'all' ? undefined : direction);
      lastRefresh = new Date();

      dispatch('refreshed', { dueItemsCount, overallStats });
    } catch (error) {
      console.error('[SessionStats] Failed to load statistics:', error);
    }
  }

  // Auto-refresh
  function startAutoRefresh(): void {
    if (refreshInterval > 0) {
      refreshTimer = setInterval(loadStatistics, refreshInterval);
    }
  }

  function stopAutoRefresh(): void {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  }

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

  // Get performance rating
  function getPerformanceRating(): { rating: string; color: string; message: string } {
    if (!sessionStats || sessionStats.reviewedCards === 0) {
      return { rating: 'No Data', color: 'text-gray-500', message: 'No cards reviewed yet' };
    }

    if (accuracy >= 90 && averageGrade >= 4.0) {
      return { rating: 'Excellent', color: 'text-green-600', message: 'Outstanding performance!' };
    } else if (accuracy >= 80 && averageGrade >= 3.5) {
      return { rating: 'Good', color: 'text-blue-600', message: 'Good performance' };
    } else if (accuracy >= 70 && averageGrade >= 3.0) {
      return { rating: 'Fair', color: 'text-yellow-600', message: 'Room for improvement' };
    } else {
      return { rating: 'Needs Work', color: 'text-red-600', message: 'Keep practicing!' };
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

  // Get insights
  function getInsights(): string[] {
    const insights: string[] = [];
    
    if (!sessionStats) return insights;

    // Performance insights
    if (accuracy >= 90) {
      insights.push('🎯 Excellent accuracy! You\'re mastering these cards.');
    } else if (accuracy < 60) {
      insights.push('💪 Consider reviewing difficult cards more frequently.');
    }

    // Speed insights
    if (cardsPerMinute > 10) {
      insights.push('⚡ Great speed! You\'re reviewing cards quickly.');
    } else if (cardsPerMinute < 3 && sessionStats.reviewedCards > 5) {
      insights.push('🐌 Take your time to ensure quality learning.');
    }

    // Grade distribution insights
    const distribution = getGradeDistribution();
    const hardGrades = distribution[0] + distribution[1];
    const easyGrades = distribution[4] + distribution[5];
    
    if (hardGrades > easyGrades) {
      insights.push('📚 Focus on difficult cards - they need more attention.');
    } else if (easyGrades > hardGrades * 2) {
      insights.push('🚀 Many cards are easy - consider increasing difficulty.');
    }

    // Session length insights
    if (duration > 30) {
      insights.push('⏰ Long session! Consider taking breaks to maintain focus.');
    } else if (duration < 5 && sessionStats.reviewedCards > 0) {
      insights.push('⏱️ Quick session! Consider longer sessions for better retention.');
    }

    return insights;
  }

  // Lifecycle
  $: if (sessionStats) {
    loadStatistics();
    startAutoRefresh();
  }

  // Cleanup
  $: {
    stopAutoRefresh();
  }

  $: gradeDistribution = getGradeDistribution();
  $: performanceRating = getPerformanceRating();
  $: insights = getInsights();
</script>

<!-- Session Stats Container -->
<div class="session-stats {compact ? 'compact' : ''}" role="region" aria-label="Session statistics">
  <!-- Header -->
  <div class="stats-header">
    <h2 class="stats-title">Session Statistics</h2>
    {#if !compact}
      <div class="stats-meta">
        <span class="last-refresh">Last updated: {lastRefresh.toLocaleTimeString()}</span>
        <button 
          class="refresh-button"
          on:click={loadStatistics}
          aria-label="Refresh statistics"
        >
          🔄 Refresh
        </button>
      </div>
    {/if}
  </div>

  <!-- Performance Overview -->
  <div class="performance-overview">
    <div class="performance-rating">
      <div class="rating-circle {performanceRating.color}">
        <span class="rating-text">{performanceRating.rating}</span>
      </div>
      <div class="rating-details">
        <h3>{performanceRating.message}</h3>
        <p>Keep up the great work!</p>
      </div>
    </div>
  </div>

  <!-- Main Statistics -->
  <div class="stats-grid">
    <!-- Session Performance -->
    <div class="stat-card primary">
      <div class="stat-header">
        <h3>Session Performance</h3>
        <div class="stat-icon">📊</div>
      </div>
      <div class="stat-content">
        <div class="stat-row">
          <span class="stat-label">Cards Reviewed</span>
          <span class="stat-value">{sessionStats?.reviewedCards || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Correct</span>
          <span class="stat-value">{sessionStats?.correctAnswers || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Accuracy</span>
          <span class="stat-value">{Math.round(accuracy)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg Grade</span>
          <span class="stat-value">{averageGrade.toFixed(1)}</span>
        </div>
        {#if showDetails}
          <div class="stat-row">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{formatTime(duration * 60)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Speed</span>
            <span class="stat-value">{cardsPerMinute.toFixed(1)}/min</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Overall Progress -->
    <div class="stat-card secondary">
      <div class="stat-header">
        <h3>Overall Progress</h3>
        <div class="stat-icon">📈</div>
      </div>
      <div class="stat-content">
        <div class="stat-row">
          <span class="stat-label">Total Cards</span>
          <span class="stat-value">{overallStats?.total || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Due for Review</span>
          <span class="stat-value due-highlight">{dueItemsCount}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg Ease Factor</span>
          <span class="stat-value">{overallStats?.avgEaseFactor.toFixed(2) || '2.50'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Overall Accuracy</span>
          <span class="stat-value">{Math.round(overallStats?.avgAccuracy || 0)}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Detailed Statistics -->
  {#if showDetails && !compact}
    <div class="detailed-stats">
      <!-- Grade Distribution -->
      {#if sessionStats && sessionStats.grades.length > 0}
        <div class="stats-section">
          <h3>Grade Distribution</h3>
          <div class="grade-chart">
            {#each [0, 1, 2, 3, 4, 5] as grade}
              <div class="grade-item">
                <div class="grade-label">{grade}</div>
                <div class="grade-bar">
                  <div 
                    class="grade-fill"
                    style="width: {sessionStats.grades.length > 0 ? (gradeDistribution[grade] / sessionStats.grades.length) * 100 : 0}%"
                  ></div>
                </div>
                <div class="grade-count">{gradeDistribution[grade]}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Performance Insights -->
      {#if showInsights && insights.length > 0}
        <div class="stats-section">
          <h3>Performance Insights</h3>
          <div class="insights-list">
            {#each insights as insight}
              <div class="insight-item">{insight}</div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Compact Mode Summary -->
  {#if compact}
    <div class="compact-stats">
      <div class="compact-row">
        <span class="compact-label">Reviewed:</span>
        <span class="compact-value">{sessionStats?.reviewedCards || 0}</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">Accuracy:</span>
        <span class="compact-value">{Math.round(accuracy)}%</span>
      </div>
      <div class="compact-row">
        <span class="compact-label">Due:</span>
        <span class="compact-value due-highlight">{dueItemsCount}</span>
      </div>
    </div>
  {/if}
</div>

<!-- Styles -->
<style>
  .session-stats {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
  }

  .session-stats.compact {
    padding: 1rem;
  }

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .stats-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #374151;
  }

  .stats-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .refresh-button {
    padding: 0.25rem 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }

  .refresh-button:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .performance-overview {
    margin-bottom: 1.5rem;
  }

  .performance-rating {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .rating-circle {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .rating-details h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
  }

  .rating-details p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .stat-card.primary {
    border-left: 4px solid #3b82f6;
  }

  .stat-card.secondary {
    border-left: 4px solid #10b981;
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .stat-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .stat-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .due-highlight {
    color: #ef4444;
    font-weight: 700;
  }

  .detailed-stats {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stats-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
  }

  .grade-chart {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .grade-item {
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

  .grade-bar {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .grade-fill {
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

  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .insight-item {
    padding: 0.75rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #166534;
  }

  .compact-stats {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .compact-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .compact-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .compact-value {
    font-size: 1rem;
    font-weight: 700;
    color: #374151;
  }

  /* Color classes */
  .text-green-600 { color: #059669; }
  .text-blue-600 { color: #2563eb; }
  .text-yellow-600 { color: #d97706; }
  .text-red-600 { color: #dc2626; }
  .text-gray-500 { color: #6b7280; }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .session-stats {
      padding: 1rem;
    }

    .stats-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .performance-rating {
      flex-direction: column;
      text-align: center;
      gap: 0.75rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .grade-item {
      grid-template-columns: 1.5rem 1fr 1.5rem;
      gap: 0.25rem;
    }

    .compact-stats {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .session-stats {
      border-width: 2px;
    }

    .stat-card,
    .performance-rating {
      border-width: 2px;
    }

    .refresh-button {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .rating-circle,
    .grade-fill {
      transition: none;
    }
  }
</style>