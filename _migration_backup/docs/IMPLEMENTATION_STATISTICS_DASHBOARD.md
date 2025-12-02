# Implementation Guide: Statistics Dashboard Feature

## Overview

Create a comprehensive analytics dashboard showing learning progress, accuracy trends, vocabulary mastery, and engagement metrics. This helps users track progress and stay motivated.

**Estimated Effort**: 4-5 days
**Priority**: HIGH (Essential for engagement and motivation)
**Dependencies**: Chart.js or similar visualization library

---

## Feature Requirements

### Core Metrics
1. **Overall Progress**: Total items learned, mastery percentage
2. **Study Streak**: Current and longest streak
3. **Learning Stats**: Items practiced today, this week, this month
4. **Accuracy**: Performance trend over time
5. **Language Performance**: DE→BG vs BG→DE comparison
6. **Category Performance**: Breakdown by vocabulary category
7. **Level Progress**: A1-B2 completion percentages
8. **Time Tracking**: Total study time, daily average

### Visualizations
- Line chart: Accuracy over time
- Bar chart: Category performance
- Donut chart: Level completion
- Progress bars: Daily/weekly/monthly goals
- Heat map: Study frequency calendar

---

## Implementation Steps

### Step 1: Create Statistics Collection Module

**File**: `assets/js/modules/statistics-collector.js`

```javascript
/**
 * Statistics Collector & Analyzer
 * Collects and analyzes learning data
 */

class StatisticsCollector {
  constructor() {
    this.STATS_KEY = 'bgde:statistics';
    this.SESSION_HISTORY_KEY = 'bgde:session_history';
    this.initializeStats();
  }

  /**
   * Initialize statistics if not exists
   */
  initializeStats() {
    const existing = localStorage.getItem(this.STATS_KEY);
    if (!existing) {
      const stats = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalPracticeTime: 0, // minutes
        totalSessionsCompleted: 0,
        totalItemsPracticed: 0,
        categoryStats: {},
        languageStats: {
          'bg-de': { correct: 0, total: 0 },
          'de-bg': { correct: 0, total: 0 }
        },
        levelStats: {
          'A1': { mastered: 0, total: 0 },
          'A2': { mastered: 0, total: 0 },
          'B1': { mastered: 0, total: 0 },
          'B2': { mastered: 0, total: 0 }
        },
        dailyStats: {} // {date: {itemsPracticed, correct, sessions}}
      };
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    }
  }

  /**
   * Record practice session
   */
  recordSession(sessionData) {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    const today = new Date().toISOString().split('T')[0];

    // Update basic stats
    stats.totalSessionsCompleted += 1;
    stats.totalItemsPracticed += sessionData.itemsReviewed || 0;
    stats.totalPracticeTime += sessionData.durationMinutes || 0;
    stats.updatedAt = new Date().toISOString();

    // Update language stats
    const langKey = sessionData.direction === 'bg-de' ? 'bg-de' : 'de-bg';
    stats.languageStats[langKey].correct += sessionData.correctCount || 0;
    stats.languageStats[langKey].total += sessionData.itemsReviewed || 0;

    // Update daily stats
    if (!stats.dailyStats[today]) {
      stats.dailyStats[today] = {
        itemsPracticed: 0,
        correct: 0,
        sessions: 0,
        durationMinutes: 0
      };
    }
    stats.dailyStats[today].itemsPracticed += sessionData.itemsReviewed || 0;
    stats.dailyStats[today].correct += sessionData.correctCount || 0;
    stats.dailyStats[today].sessions += 1;
    stats.dailyStats[today].durationMinutes += sessionData.durationMinutes || 0;

    // Update category stats
    if (sessionData.categories) {
      sessionData.categories.forEach(cat => {
        if (!stats.categoryStats[cat]) {
          stats.categoryStats[cat] = { correct: 0, total: 0 };
        }
        stats.categoryStats[cat].total += 1;
        stats.categoryStats[cat].correct += (sessionData.categoryScores?.[cat] || 0);
      });
    }

    // Update level stats
    if (sessionData.level) {
      if (!stats.levelStats[sessionData.level]) {
        stats.levelStats[sessionData.level] = { mastered: 0, total: 0 };
      }
      stats.levelStats[sessionData.level].total += 1;
      stats.levelStats[sessionData.level].mastered += (sessionData.correctCount || 0);
    }

    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));

    // Record in session history
    this.recordSessionHistory(sessionData);
  }

  /**
   * Record session in history
   */
  recordSessionHistory(sessionData) {
    let history = JSON.parse(localStorage.getItem(this.SESSION_HISTORY_KEY) || '[]');
    
    history.push({
      timestamp: new Date().toISOString(),
      correct: sessionData.correctCount || 0,
      total: sessionData.itemsReviewed || 0,
      accuracy: sessionData.itemsReviewed ? (sessionData.correctCount / sessionData.itemsReviewed * 100) : 0,
      duration: sessionData.durationMinutes || 0,
      direction: sessionData.direction || 'de-bg'
    });

    // Keep only last 100 sessions
    if (history.length > 100) {
      history = history.slice(-100);
    }

    localStorage.setItem(this.SESSION_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Get overall statistics
   */
  getOverallStats() {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    
    const totalCorrect = stats.languageStats['bg-de'].correct + stats.languageStats['de-bg'].correct;
    const totalAttempts = stats.languageStats['bg-de'].total + stats.languageStats['de-bg'].total;
    const accuracy = totalAttempts ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0;

    return {
      totalSessions: stats.totalSessionsCompleted,
      totalItems: stats.totalItemsPracticed,
      totalTime: Math.round(stats.totalPracticeTime),
      accuracy: parseFloat(accuracy),
      totalCorrect,
      totalAttempts
    };
  }

  /**
   * Get daily statistics
   */
  getDailyStats(daysBack = 30) {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    const data = [];

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayStats = stats.dailyStats[dateStr] || {
        itemsPracticed: 0,
        correct: 0,
        sessions: 0,
        durationMinutes: 0
      };

      data.push({
        date: dateStr,
        ...dayStats,
        accuracy: dayStats.itemsPracticed ? 
          (dayStats.correct / dayStats.itemsPracticed * 100).toFixed(1) : 0
      });
    }

    return data;
  }

  /**
   * Get category performance
   */
  getCategoryStats() {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    const categories = Object.entries(stats.categoryStats).map(([cat, data]) => ({
      category: cat,
      correct: data.correct,
      total: data.total,
      accuracy: data.total ? (data.correct / data.total * 100).toFixed(1) : 0
    }));

    return categories.sort((a, b) => b.total - a.total);
  }

  /**
   * Get language direction performance
   */
  getLanguageStats() {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    
    return {
      'BG→DE': {
        correct: stats.languageStats['bg-de'].correct,
        total: stats.languageStats['bg-de'].total,
        accuracy: stats.languageStats['bg-de'].total ? 
          (stats.languageStats['bg-de'].correct / stats.languageStats['bg-de'].total * 100).toFixed(1) : 0
      },
      'DE→BG': {
        correct: stats.languageStats['de-bg'].correct,
        total: stats.languageStats['de-bg'].total,
        accuracy: stats.languageStats['de-bg'].total ? 
          (stats.languageStats['de-bg'].correct / stats.languageStats['de-bg'].total * 100).toFixed(1) : 0
      }
    };
  }

  /**
   * Get level progress
   */
  getLevelStats() {
    const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
    const levels = {};

    Object.entries(stats.levelStats).forEach(([level, data]) => {
      levels[level] = {
        mastered: data.mastered,
        total: data.total,
        percentage: data.total ? (data.mastered / data.total * 100).toFixed(1) : 0
      };
    });

    return levels;
  }

  /**
   * Get recent accuracy trend
   */
  getAccuracyTrend(sessions = 20) {
    const history = JSON.parse(localStorage.getItem(this.SESSION_HISTORY_KEY) || '[]');
    return history.slice(-sessions).map((session, index) => ({
      session: index + 1,
      accuracy: session.accuracy,
      correct: session.correct,
      total: session.total
    }));
  }

  /**
   * Get learning insights
   */
  getLearningInsights() {
    const stats = this.getOverallStats();
    const dailyStats = this.getDailyStats(7);
    const categoryStats = this.getCategoryStats();

    const thisWeekItems = dailyStats.reduce((sum, day) => sum + day.itemsPracticed, 0);
    const thisWeekSessions = dailyStats.reduce((sum, day) => sum + day.sessions, 0);
    const strongestCategory = categoryStats[0];
    const weakestCategory = categoryStats[categoryStats.length - 1];

    return {
      thisWeekItems,
      thisWeekSessions,
      averageSessionLength: thisWeekSessions ? (thisWeekItems / thisWeekSessions).toFixed(1) : 0,
      strongestCategory,
      weakestCategory,
      overallAccuracy: stats.accuracy,
      consistencyScore: this.calculateConsistency(dailyStats)
    };
  }

  /**
   * Calculate consistency score (0-100)
   */
  calculateConsistency(dailyStats) {
    const daysWithPractice = dailyStats.filter(day => day.sessions > 0).length;
    const totalDays = dailyStats.length;
    return Math.round((daysWithPractice / totalDays) * 100);
  }

  /**
   * Reset statistics (for testing)
   */
  reset() {
    localStorage.removeItem(this.STATS_KEY);
    localStorage.removeItem(this.SESSION_HISTORY_KEY);
    this.initializeStats();
  }
}

export default StatisticsCollector;
```

### Step 2: Create Statistics Dashboard UI

**File**: `assets/js/modules/statistics-dashboard.js`

```javascript
/**
 * Statistics Dashboard UI Component
 * Renders learning analytics and visualizations
 */

import StatisticsCollector from './statistics-collector.js';

class StatisticsDashboard {
  constructor(containerSelector = '#statistics-dashboard') {
    this.collector = new StatisticsCollector();
    this.container = document.querySelector(containerSelector);
    this.charts = {};
  }

  /**
   * Initialize dashboard
   */
  init() {
    if (!this.container) return;
    this.render();
    this.loadCharts();
  }

  /**
   * Render dashboard
   */
  render() {
    const insights = this.collector.getLearningInsights();
    const overall = this.collector.getOverallStats();

    const html = `
      <div class="statistics-container">
        <!-- Header with key metrics -->
        <div class="stats-header">
          <h1>Your Learning Progress</h1>
          <div class="header-metrics">
            <div class="metric-card">
              <div class="metric-icon">📚</div>
              <div class="metric-content">
                <div class="metric-label">Items Practiced</div>
                <div class="metric-value">${overall.totalItems}</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">✅</div>
              <div class="metric-content">
                <div class="metric-label">Accuracy</div>
                <div class="metric-value">${overall.accuracy}%</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">⏱️</div>
              <div class="metric-content">
                <div class="metric-label">Study Time</div>
                <div class="metric-value">${this.formatTime(overall.totalTime)}</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">🎯</div>
              <div class="metric-content">
                <div class="metric-label">Sessions</div>
                <div class="metric-value">${overall.totalSessions}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick insights -->
        <div class="quick-insights">
          <div class="insight-item">
            <span class="insight-label">This Week</span>
            <span class="insight-value">${insights.thisWeekItems} items</span>
          </div>
          <div class="insight-item">
            <span class="insight-label">Consistency</span>
            <span class="insight-value">${insights.consistencyScore}%</span>
          </div>
          <div class="insight-item">
            <span class="insight-label">Strongest</span>
            <span class="insight-value">${insights.strongestCategory?.category || 'N/A'}</span>
          </div>
          <div class="insight-item">
            <span class="insight-label">Needs Work</span>
            <span class="insight-value">${insights.weakestCategory?.category || 'N/A'}</span>
          </div>
        </div>

        <!-- Charts section -->
        <div class="charts-section">
          <div class="chart-container">
            <h3>Accuracy Trend (Last 20 Sessions)</h3>
            <canvas id="accuracy-chart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Language Direction Performance</h3>
            <canvas id="language-chart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Top Categories</h3>
            <canvas id="category-chart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Level Progress</h3>
            <canvas id="level-chart"></canvas>
          </div>

          <div class="chart-container">
            <h3>Daily Practice (Last 30 Days)</h3>
            <canvas id="daily-chart"></canvas>
          </div>
        </div>

        <!-- Detailed statistics -->
        <div class="detailed-stats">
          <h3>Detailed Statistics</h3>
          
          <div class="stats-table">
            <h4>Language Performance</h4>
            <table id="language-table"></table>
          </div>

          <div class="stats-table">
            <h4>Category Performance</h4>
            <table id="category-table"></table>
          </div>
        </div>

        <!-- Export option -->
        <div class="stats-actions">
          <button id="export-stats-btn" class="action-btn">📥 Export Statistics</button>
          <button id="reset-stats-btn" class="action-btn danger">🔄 Reset Statistics</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
    this.renderTables();
  }

  /**
   * Load and render charts
   */
  loadCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    this.renderAccuracyChart();
    this.renderLanguageChart();
    this.renderCategoryChart();
    this.renderLevelChart();
    this.renderDailyChart();
  }

  /**
   * Render accuracy trend chart
   */
  renderAccuracyChart() {
    const ctx = document.getElementById('accuracy-chart')?.getContext('2d');
    if (!ctx) return;

    const trend = this.collector.getAccuracyTrend(20);
    const labels = trend.map(t => `S${t.session}`);
    const data = trend.map(t => t.accuracy);

    this.charts.accuracy = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Accuracy %',
          data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#667eea'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });
  }

  /**
   * Render language performance chart
   */
  renderLanguageChart() {
    const ctx = document.getElementById('language-chart')?.getContext('2d');
    if (!ctx) return;

    const langStats = this.collector.getLanguageStats();
    const labels = Object.keys(langStats);
    const data = labels.map(lang => parseFloat(langStats[lang].accuracy));

    this.charts.language = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Accuracy %',
          data,
          backgroundColor: ['#667eea', '#764ba2'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 100 } }
      }
    });
  }

  /**
   * Render category performance chart
   */
  renderCategoryChart() {
    const ctx = document.getElementById('category-chart')?.getContext('2d');
    if (!ctx) return;

    const categoryStats = this.collector.getCategoryStats().slice(0, 8);
    const labels = categoryStats.map(c => c.category);
    const data = categoryStats.map(c => parseFloat(c.accuracy));

    this.charts.category = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Accuracy %',
          data,
          backgroundColor: '#764ba2',
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { min: 0, max: 100 } }
      }
    });
  }

  /**
   * Render level progress chart
   */
  renderLevelChart() {
    const ctx = document.getElementById('level-chart')?.getContext('2d');
    if (!ctx) return;

    const levelStats = this.collector.getLevelStats();
    const labels = Object.keys(levelStats);
    const data = labels.map(level => parseFloat(levelStats[level].percentage));
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

    this.charts.level = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  /**
   * Render daily practice chart
   */
  renderDailyChart() {
    const ctx = document.getElementById('daily-chart')?.getContext('2d');
    if (!ctx) return;

    const dailyStats = this.collector.getDailyStats(30);
    const labels = dailyStats.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = dailyStats.map(d => d.itemsPracticed);

    this.charts.daily = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Items Practiced',
          data,
          backgroundColor: '#667eea',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  /**
   * Render data tables
   */
  renderTables() {
    this.renderLanguageTable();
    this.renderCategoryTable();
  }

  /**
   * Render language performance table
   */
  renderLanguageTable() {
    const table = document.getElementById('language-table');
    const langStats = this.collector.getLanguageStats();

    let html = '<thead><tr><th>Direction</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr></thead><tbody>';
    
    Object.entries(langStats).forEach(([lang, stats]) => {
      html += `
        <tr>
          <td>${lang}</td>
          <td>${stats.correct}</td>
          <td>${stats.total}</td>
          <td>${stats.accuracy}%</td>
        </tr>
      `;
    });

    html += '</tbody>';
    if (table) table.innerHTML = html;
  }

  /**
   * Render category performance table
   */
  renderCategoryTable() {
    const table = document.getElementById('category-table');
    const categoryStats = this.collector.getCategoryStats();

    let html = '<thead><tr><th>Category</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr></thead><tbody>';
    
    categoryStats.forEach(cat => {
      html += `
        <tr>
          <td>${cat.category}</td>
          <td>${cat.correct}</td>
          <td>${cat.total}</td>
          <td>${cat.accuracy}%</td>
        </tr>
      `;
    });

    html += '</tbody>';
    if (table) table.innerHTML = html;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const exportBtn = document.getElementById('export-stats-btn');
    const resetBtn = document.getElementById('reset-stats-btn');

    exportBtn?.addEventListener('click', () => this.exportStats());
    resetBtn?.addEventListener('click', () => this.resetStats());
  }

  /**
   * Export statistics as JSON
   */
  exportStats() {
    const stats = {
      exported: new Date().toISOString(),
      overall: this.collector.getOverallStats(),
      daily: this.collector.getDailyStats(30),
      categories: this.collector.getCategoryStats(),
      languages: this.collector.getLanguageStats(),
      levels: this.collector.getLevelStats(),
      insights: this.collector.getLearningInsights()
    };

    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  /**
   * Reset statistics with confirmation
   */
  resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      this.collector.reset();
      this.render();
      this.loadCharts();
    }
  }

  /**
   * Format time in minutes to human-readable format
   */
  formatTime(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}

export default StatisticsDashboard;
```

### Step 3: Add CSS Styling

**File**: `assets/scss/components/_statistics.scss`

```scss
.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .stats-header {
    margin-bottom: 2rem;

    h1 {
      margin: 0 0 1.5rem 0;
      font-size: 2rem;
      color: #333;
    }

    .header-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;

      .metric-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .metric-icon {
          font-size: 2rem;
        }

        .metric-content {
          flex: 1;

          .metric-label {
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }

          .metric-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #667eea;
          }
        }
      }
    }
  }

  .quick-insights {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    .insight-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      text-align: center;

      .insight-label {
        font-size: 0.85rem;
        opacity: 0.9;
        margin-bottom: 0.5rem;
      }

      .insight-value {
        font-size: 1.3rem;
        font-weight: 600;
      }
    }
  }

  .charts-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;

    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: #333;
      }

      canvas {
        max-width: 100%;
        height: auto;
      }
    }
  }

  .detailed-stats {
    margin-bottom: 2rem;

    h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.3rem;
      color: #333;
    }

    .stats-table {
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      h4 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: #666;
      }

      table {
        width: 100%;
        border-collapse: collapse;

        thead {
          background: #f8f9fa;

          th {
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e9ecef;
          }
        }

        tbody {
          tr {
            border-bottom: 1px solid #e9ecef;

            &:hover {
              background: #f8f9fa;
            }

            td {
              padding: 0.75rem;
              color: #666;
            }
          }
        }
      }
    }
  }

  .stats-actions {
    display: flex;
    gap: 1rem;

    .action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &.danger {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

        &:hover {
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .statistics-container {
    padding: 1rem;

    .stats-header h1 {
      font-size: 1.5rem;
    }

    .charts-section {
      grid-template-columns: 1fr;
    }
  }
}
```

---

## Testing Checklist

- [ ] Statistics properly recorded from practice sessions
- [ ] All charts render correctly
- [ ] Data exports as valid JSON
- [ ] Statistics persist across sessions
- [ ] Responsive on mobile
- [ ] Tables display correctly
- [ ] No console errors

---

## Deployment Checklist

- [ ] Add statistics-collector.js
- [ ] Add statistics-dashboard.js
- [ ] Add _statistics.scss
- [ ] Include Chart.js library (CDN or npm)
- [ ] Create dashboard page/route
- [ ] Integrate session recording in practice module
- [ ] Test data persistence
- [ ] Verify export functionality
- [ ] Mobile responsive testing

---

## Future Enhancements

1. **Goal Progress Tracking**: Visual representation of weekly/monthly goals
2. **Predictive Analytics**: Estimated mastery date
3. **Comparisons**: Week-over-week, month-over-month trends
4. **Study Recommendations**: AI-powered suggestions based on weak areas
5. **Public Profile**: Share learning progress (optional)
