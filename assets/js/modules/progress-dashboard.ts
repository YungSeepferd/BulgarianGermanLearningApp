/**
 * Progress Dashboard Module
 * Handles data aggregation and visualization for learning progress
 * Displays charts, statistics, and session history
 */

import type { VocabularyItem, ReviewState } from '../types.js';

// Chart.js type declaration (if available, otherwise use simple visualization)

interface ProgressData {
  phaseDistribution: Record<string, number>;
  categoryStats: Record<string, { total: number; learned: number; reviewed: number }>;
  directionStats: Record<string, { reviewed: number; learned: number }>;
  sessionHistory: SessionHistoryEntry[];
  activityData: Record<string, number>;
}

// ChartInstance interface removed as it's not used

interface SessionHistoryEntry {
  timestamp: string | number;
  reviewed: number;
  correct: number;
  duration?: number;
}

export class ProgressDashboard {
  private profileId: string | null = null;
  private vocabulary: VocabularyItem[] = [];
  private charts: Record<string, unknown> = {};
  private data: ProgressData = {
    phaseDistribution: {},
    categoryStats: {},
    directionStats: {},
    sessionHistory: [],
    activityData: {}
  };

  constructor() {
    // Properties are initialized above with type annotations
  }

  /**
   * Initialize the dashboard
   */
  async initialize() {
    try {
      // Wait for profileManager and phaseCalculator to be available
      await this.waitForDependencies();

      this.profileId = window.profileManager?.getActiveProfileId() || 'german_learner';
      this.vocabulary = this.getVocabularyData();

      // Calculate all metrics
      this.calculateMetrics();

      // Update key metrics display
      this.updateKeyMetrics();

      // Render all charts
      this.renderCharts();

      // Display session history
      this.populateSessionHistory();

      // Listen for profile changes
      if (window.profileManager) {
        window.profileManager.onProfileChange(() => {
          this.handleProfileChange();
        });
      }

      console.log('[ProgressDashboard] Initialized successfully');
    } catch (error) {
      console.error('[ProgressDashboard] Initialization error:', error);
      this.showEmptyState();
    }
  }

  /**
   * Wait for required dependencies to load
   */
  waitForDependencies(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkDeps = () => {
        if (window.profileManager && window.phaseCalculator) {
          resolve();
        } else {
          setTimeout(checkDeps, 100);
        }
      };
      checkDeps();
    });
  }

  /**
   * Get vocabulary data from the page
   */
  getVocabularyData(): VocabularyItem[] {
    // Check if vocabulary is embedded in the page as JSON
    if (window.vocabulary && Array.isArray(window.vocabulary)) {
      return window.vocabulary;
    }

    // Try to extract from embedded script tag
    const vocabScript = document.querySelector('script[type="application/json"][data-vocab]');
    if (vocabScript) {
      try {
        return JSON.parse(vocabScript.textContent) as VocabularyItem[];
      } catch (error) {
        console.warn('[ProgressDashboard] Error parsing vocabulary:', error);
      }
    }

    return [];
  }

  /**
   * Calculate all metrics from localStorage
   */
  calculateMetrics() {
    const phaseDistribution: Record<string, number> = {
      '0': 0, // Learned
      '1': 0, // Phase 1
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      'not-started': 0
    };

    const categoryStats: Record<string, { total: number; learned: number; reviewed: number }> = {};
    const directionStats = {
      'de-bg': { reviewed: 0, learned: 0 },
      'bg-de': { reviewed: 0, learned: 0 }
    };

    // Iterate through vocabulary
    for (const item of this.vocabulary) {
      // Initialize category if not exists
      const category = item.category as string;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, learned: 0, reviewed: 0 };
      }
      categoryStats[category].total++;

      // Check review data for both directions
      const directions = ['de_bg', 'bg_de'];
      let hasReviewData = false;

      for (const direction of directions) {
        const storageKey = `bgde:${this.profileId}:review_${item.id}_${direction}`;
        const reviewData = this.getReviewData(storageKey);

        if (reviewData) {
          hasReviewData = true;
          categoryStats[category].reviewed++;

          const directionKey = direction === 'de_bg' ? 'de-bg' : 'bg-de';
          directionStats[directionKey].reviewed++;

          const phase = this.getPhaseFromData(reviewData);
          if (phase === '0') {
            directionStats[directionKey].learned++;
            categoryStats[category].learned++;
          }

          // Add to phase distribution
          phaseDistribution[phase as keyof typeof phaseDistribution]!++;
        }
      }

      // If no review data, it's not started
      if (!hasReviewData) {
        phaseDistribution['not-started']!++;
      }
    }

    this.data.phaseDistribution = phaseDistribution;
    this.data.categoryStats = categoryStats;
    this.data.directionStats = directionStats;
    this.data.sessionHistory = this.getSessionHistory();
    this.data.activityData = this.calculateWeeklyActivity();
  }

  /**
   * Get review data from localStorage
   */
  getReviewData(storageKey: string): ReviewState | null {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) as ReviewState : null;
    } catch (error) {
      console.warn(`[ProgressDashboard] Error parsing review data for ${storageKey}:`, error);
      return null;
    }
  }

  /**
   * Get phase from review data
   */
  getPhaseFromData(reviewData: ReviewState | null): string {
    if (!reviewData) {
      return 'not-started';
    }

    if (reviewData.phase !== undefined) {
      return reviewData.phase.toString();
    }

    // Calculate from easeFactor if available
    if (window.phaseCalculator && reviewData.easeFactor !== undefined) {
      const repetitions = reviewData.repetitions || 0;
      return window.phaseCalculator.calculatePhase(reviewData.easeFactor, repetitions).toString();
    }

    return 'not-started';
  }

  /**
   * Get session history from localStorage
   */
  getSessionHistory(): SessionHistoryEntry[] {
    try {
      const storageKey = `bgde:${this.profileId}:session_history`;
      const data = localStorage.getItem(storageKey);
      if (!data) {
        return [];
      }

      const history = JSON.parse(data) as SessionHistoryEntry[];
      // Return last 10 sessions, most recent first
      return Array.isArray(history) ? history.slice(-10).reverse() : [];
    } catch (error) {
      console.warn('[ProgressDashboard] Error parsing session history:', error);
      return [];
    }
  }

  /**
   * Calculate weekly activity data
   */
  calculateWeeklyActivity() {
    const activity: Record<string, number> = {};
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr) {
        activity[dateStr] = 0;
      }
    }

    // Count sessions per day
    for (const session of this.data.sessionHistory) {
      if (session.timestamp) {
        const date = new Date(session.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr && dateStr in activity) {
          activity[dateStr]! += session.reviewed || 0;
        }
      }
    }

    return activity;
  }

  /**
   * Update key metrics in the DOM
   */
  updateKeyMetrics() {
    const totalWords = this.vocabulary.length;
    const learnedCount = this.data.phaseDistribution['0'] || 0;
    const notStartedCount = this.data.phaseDistribution['not-started'] || 0;
    const inProgressCount = totalWords - learnedCount - notStartedCount;

    document.querySelector('#total-words')!.textContent = totalWords.toString();
    document.querySelector('#learned-count')!.textContent = learnedCount.toString();
    document.querySelector('#not-started-count')!.textContent = notStartedCount.toString();
    document.querySelector('#in-progress-count')!.textContent = inProgressCount.toString();

    // Update profile name
    const profileName = this.profileId === 'german_learner' ? 'German Learner 🇩🇪' : 'Bulgarian Learner 🇧🇬';
    document.querySelector('#active-profile-name')!.textContent = profileName;
  }

  /**
   * Render all charts
   */
  renderCharts() {
    this.renderPhaseChart();
    this.renderDirectionChart();
    this.renderCategoryChart();
    this.renderActivityChart();
  }

  /**
   * Render phase distribution doughnut chart
   */
  renderPhaseChart() {
    const ctx = document.querySelector('#phase-chart');
    if (!ctx) {
      return;
    }

    const data = this.data.phaseDistribution;
    const labels = [
      'Phase 0 (Learned)',
      'Phase 1 (New)',
      'Phase 2 (Learning)',
      'Phase 3 (Familiar)',
      'Phase 4 (Known)',
      'Phase 5 (Mastered)',
      'Phase 6 (Expert)',
      'Not Started'
    ];

    const values = [
      data['0'] || 0,
      data['1'] || 0,
      data['2'] || 0,
      data['3'] || 0,
      data['4'] || 0,
      data['5'] || 0,
      data['6'] || 0,
      data['not-started'] || 0
    ];

    const colors = [
      '#10b981', // Learned - green
      '#f59e0b', // Phase 1 - amber
      '#f97316', // Phase 2 - orange
      '#ec4899', // Phase 3 - pink
      '#8b5cf6', // Phase 4 - purple
      '#3b82f6', // Phase 5 - blue
      '#06b6d4', // Phase 6 - cyan
      '#6b7280'  // Not started - gray
    ];

    // Destroy existing chart if it exists
    if (this.charts.phase) {
      (this.charts.phase as { destroy(): void }).destroy();
    }

    // Check if Chart.js is available
    if (window.Chart) {
      const canvas = ctx as HTMLCanvasElement;
      this.charts.phase = new window.Chart(canvas.getContext('2d')!, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            }
          }
        }
      });
    } else {
      // Fallback: Simple HTML visualization for phase distribution
      this.renderSimplePhaseChart(ctx as HTMLElement, data);
    }
  }

  /**
   * Render direction performance bar chart
   */
  renderDirectionChart() {
    const ctx = document.querySelector('#direction-chart');
    if (!ctx) {
      return;
    }

    const stats = this.data.directionStats;
    const labels = ['German → Bulgarian', 'Bulgarian → German'];
    const reviewed = [stats['de-bg']?.reviewed || 0, stats['bg-de']?.reviewed || 0];
    const learned = [stats['de-bg']?.learned || 0, stats['bg-de']?.learned || 0];

    // Destroy existing chart if it exists
    if (this.charts.direction) {
      (this.charts.direction as { destroy(): void }).destroy();
    }

    if (window.Chart) {
      const canvas = ctx as HTMLCanvasElement;
      this.charts.direction = new window.Chart(canvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Reviewed',
              data: reviewed,
              backgroundColor: '#3b82f6'
            },
            {
              label: 'Learned',
              data: learned,
              backgroundColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } else {
      // Fallback: Simple HTML visualization for direction stats
      this.renderSimpleDirectionChart(ctx as HTMLElement, stats);
    }
  }

  /**
   * Render category performance bar chart
   */
  renderCategoryChart() {
    const ctx = document.querySelector('#category-chart');
    if (!ctx) {
      return;
    }

    const stats = this.data.categoryStats;
    const sortedCategories = Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10); // Top 10 categories

    const labels = sortedCategories.map(([cat]) => cat);
    const totalData = sortedCategories.map(([, data]) => data.total);
    const learnedData = sortedCategories.map(([, data]) => data.learned);

    // Destroy existing chart if it exists
    if (this.charts.category) {
      (this.charts.category as { destroy(): void }).destroy();
    }

    if (window.Chart) {
      const canvas = ctx as HTMLCanvasElement;
      this.charts.category = new window.Chart(canvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Words',
              data: totalData,
              backgroundColor: '#d1d5db'
            },
            {
              label: 'Learned',
              data: learnedData,
              backgroundColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } else {
      // Fallback: Simple HTML visualization for category stats
      this.renderSimpleCategoryChart(ctx as HTMLElement, stats, sortedCategories);
    }
  }

  /**
   * Render weekly activity line chart
   */
  renderActivityChart() {
    const ctx = document.querySelector('#activity-chart');
    if (!ctx) {
      return;
    }

    const activityData = this.data.activityData;
    const labels = Object.keys(activityData).map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = Object.values(activityData);

    // Destroy existing chart if it exists
    if (this.charts.activity) {
      (this.charts.activity as { destroy(): void }).destroy();
    }

    if (window.Chart) {
      const canvas = ctx as HTMLCanvasElement;
      this.charts.activity = new window.Chart(canvas.getContext('2d')!, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Words Reviewed',
            data: data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    } else {
      // Fallback: Simple HTML visualization for activity data
      this.renderSimpleActivityChart(ctx as HTMLElement, activityData);
    }
  }

  /**
   * Populate session history table
   */
  populateSessionHistory() {
    const tbody = document.querySelector('#session-tbody');
    const sessionCount = document.querySelector('#total-sessions');

    if (!this.data.sessionHistory || this.data.sessionHistory.length === 0) {
      tbody!.innerHTML = '<tr><td colspan="4" class="no-data">No sessions yet. Start practicing to track your progress!</td></tr>';
      sessionCount!.textContent = 'Total Sessions: 0';
      return;
    }

    const rows = this.data.sessionHistory.map(session => {
      const date = new Date(session.timestamp);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const accuracy = session.correct && session.reviewed
        ? Math.round((session.correct / session.reviewed) * 100)
        : 0;

      const duration = session.duration
        ? this.formatDuration(session.duration)
        : 'N/A';

      return `
        <tr>
          <td>${dateStr}</td>
          <td>${session.reviewed || 0}</td>
          <td>${accuracy}%</td>
          <td>${duration}</td>
        </tr>
      `;
    });

    tbody!.innerHTML = rows.join('');
    sessionCount!.textContent = `Total Sessions: ${this.data.sessionHistory.length}`;
  }

  /**
   * Format duration in seconds to human-readable format
   */
  formatDuration(seconds: number): string {
    if (!seconds) {
      return 'N/A';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (secs > 0) {
      parts.push(`${secs}s`);
    }

    return parts.join(' ') || '0s';
  }

  /**
   * Handle profile change
   */
  handleProfileChange() {
    this.profileId = window.profileManager?.getActiveProfileId() || 'german_learner';
    this.calculateMetrics();
    this.updateKeyMetrics();
    this.renderCharts();
    this.populateSessionHistory();
    console.log('[ProgressDashboard] Profile changed, metrics updated');
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    const emptyState = document.querySelector('#empty-state');
    const dashboard = document.querySelector('.progress-dashboard');

    if (emptyState && dashboard) {
      emptyState.style.display = 'block';
      dashboard.style.opacity = '0.5';
    }
  
  }

  /**
   * Simple HTML visualization for phase distribution
   */
  renderSimplePhaseChart(container: HTMLElement, data: Record<string, number>) {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      container.innerHTML = '<div class="no-data">No progress data available</div>';
      return;
    }

    const labels = ['Learned', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Not Started'];
    const values = [
      data['0'] || 0,
      data['1'] || 0,
      data['2'] || 0,
      data['3'] || 0,
      data['4'] || 0,
      data['5'] || 0,
      data['6'] || 0,
      data['not-started'] || 0
    ];

    const html = values.map((value, index) => {
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      return `
        <div class="phase-bar">
          <span class="phase-label">${labels[index]}</span>
          <div class="phase-progress">
            <div class="phase-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="phase-count">${value} (${percentage}%)</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="simple-phase-chart">${html}</div>`;
  }

  /**
   * Simple HTML visualization for direction stats
   */
  renderSimpleDirectionChart(container: HTMLElement, stats: Record<string, { reviewed: number; learned: number }>) {
    const directions = [
      { label: 'German → Bulgarian', key: 'de-bg' },
      { label: 'Bulgarian → German', key: 'bg-de' }
    ];

    const html = directions.map(dir => {
      const reviewed = stats[dir.key]?.reviewed || 0;
      const learned = stats[dir.key]?.learned || 0;
      return `
        <div class="direction-stat">
          <h4>${dir.label}</h4>
          <div class="stat-row">
            <span>Reviewed: ${reviewed}</span>
            <span>Learned: ${learned}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="simple-direction-chart">${html}</div>`;
  }

  /**
   * Simple HTML visualization for category stats
   */
  renderSimpleCategoryChart(container: HTMLElement, _stats: Record<string, { total: number; learned: number; reviewed: number }>, categories: Array<[string, { total: number; learned: number; reviewed: number }]>) {
    const html = categories.map(([category, data]) => {
      const total = data.total || 0;
      const learned = data.learned || 0;
      const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
      return `
        <div class="category-stat">
          <span class="category-name">${category}</span>
          <div class="category-progress">
            <div class="category-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="category-count">${learned}/${total} (${percentage}%)</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="simple-category-chart">${html}</div>`;
  }

  /**
   * Simple HTML visualization for activity data
   */
  renderSimpleActivityChart(container: HTMLElement, activityData: Record<string, number>) {
    const dates = Object.keys(activityData);
    const values = Object.values(activityData);
    const maxValue = Math.max(...values, 1);

    const html = dates.map((date, index) => {
      const value = values[index];
      const percentage = maxValue > 0 ? Math.round(((value || 0) / maxValue) * 100) : 0;
      const displayDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return `
        <div class="activity-day">
          <span class="activity-date">${displayDate}</span>
          <div class="activity-bar">
            <div class="activity-fill" style="height: ${percentage}%"></div>
          </div>
          <span class="activity-count">${value}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="simple-activity-chart">${html}</div>`;
  }
}
