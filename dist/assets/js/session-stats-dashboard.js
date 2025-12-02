/**
 * Session Statistics Dashboard
 * Provides comprehensive analytics and visualizations for learning progress
 */
class SessionStatsDashboard {
    constructor(options = {}) {
        this.chartColors = {
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            secondary: '#6b7280'
        };
        this.initialized = false;
        this.data = {
            sessions: { total: 0, totalTime: 0, avgAccuracy: 0 },
            reviews: { total: 0, correct: 0 },
            streaks: { current: 0, max: 0 },
            categories: {},
            directions: {},
            activity: {}
        };
        this.spacedRepetition = options.spacedRepetition;
        this.containerId = options.containerId || 'stats-dashboard';
    }
    /**
       * Initialize the dashboard
       */
    init() {
        if (this.initialized) {
            return;
        }
        this.createDashboardStructure();
        this.loadData();
        this.renderCharts();
        this.setupEventListeners();
        this.initialized = true;
    }
    /**
       * Create the dashboard HTML structure
       */
    createDashboardStructure() {
        const container = document.querySelector(`#${this.containerId}`);
        if (!container) {
            return;
        }
        container.innerHTML = `
            <div class="stats-dashboard">
                <div class="dashboard-header">
                    <h2>Lernstatistiken / Статистики за обучение</h2>
                    <div class="time-filter">
                        <select id="time-range">
                            <option value="7">Letzte 7 Tage / Последните 7 дни</option>
                            <option value="30" selected>Letzter Monat / Последният месец</option>
                            <option value="90">Letzte 3 Monate / Последните 3 месеца</option>
                            <option value="all">Alle Zeit / Цялото време</option>
                        </select>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-sessions">0</div>
                            <div class="stat-label">Sitzungen / Сесии</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-content">
                            <div class="stat-value" id="avg-accuracy">0%</div>
                            <div class="stat-label">Genauigkeit / Точност</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-content">
                            <div class="stat-value" id="current-streak">0</div>
                            <div class="stat-label">Aktuelle Serie / Текуща серия</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-content">
                            <div class="stat-value" id="total-time">0m</div>
                            <div class="stat-label">Lernzeit / Време за учене</div>
                        </div>
                    </div>
                </div>
                
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>Fortschritt über Zeit / Прогрес във времето</h3>
                        <canvas id="progress-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Genauigkeit nach Kategorie / Точност по категория</h3>
                        <canvas id="category-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Lernrichtung / Посока на обучение</h3>
                        <canvas id="direction-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Wöchentliche Aktivität / Седмична активност</h3>
                        <canvas id="activity-chart"></canvas>
                    </div>
                </div>
                
                <div class="detailed-stats">
                    <div class="stats-section">
                        <h3>Schwierige Wörter / Трудни думи</h3>
                        <div id="difficult-words" class="word-list"></div>
                    </div>
                    
                    <div class="stats-section">
                        <h3>Gemeisterte Wörter / Овладени думи</h3>
                        <div id="mastered-words" class="word-list"></div>
                    </div>
                </div>
            </div>
        `;
    }
    /**
       * Load statistical data
       */
    loadData() {
        const timeRange = document.querySelector('#time-range')?.value || '30';
        const cutoffDate = this.getCutoffDate(timeRange);
        this.data = {
            sessions: this.getSessionData(cutoffDate),
            reviews: this.getReviewData(cutoffDate),
            streaks: this.getStreakData(),
            categories: this.getCategoryStats(cutoffDate),
            directions: this.getDirectionStats(cutoffDate),
            activity: this.getActivityData(cutoffDate)
        };
    }
    /**
       * Get cutoff date for time range
       */
    getCutoffDate(timeRange) {
        if (timeRange === 'all') {
            return null;
        }
        const days = Number.parseInt(timeRange);
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }
    /**
       * Get session statistics
       */
    getSessionData(cutoffDate) {
        const sessions = this.getStoredSessions();
        const filtered = cutoffDate
            ? sessions.filter(s => new Date(s.date) >= cutoffDate)
            : sessions;
        return {
            total: filtered.length,
            totalTime: filtered.reduce((sum, s) => sum + (s.duration || 0), 0),
            avgAccuracy: filtered.length > 0
                ? Math.round(filtered.reduce((sum, s) => sum + s.accuracy, 0) / filtered.length)
                : 0
        };
    }
    /**
       * Get review statistics
       */
    getReviewData(cutoffDate) {
        if (!this.spacedRepetition) {
            return { total: 0, correct: 0 };
        }
        const reviews = Object.values(this.spacedRepetition?.reviewStates || {});
        const filtered = cutoffDate
            ? reviews.filter((r) => new Date(r.lastReview || 0) >= cutoffDate)
            : reviews;
        return {
            total: filtered.length,
            correct: filtered.filter((r) => r.repetitions > 0).length
        };
    }
    /**
       * Get streak statistics
       */
    getStreakData() {
        const sessions = this.getStoredSessions();
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        // Sort sessions by date
        sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Calculate current streak
        const today = new Date();
        for (const [i, session] of sessions.entries()) {
            if (!session)
                continue;
            const sessionDate = new Date(session.date);
            const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === i) {
                currentStreak++;
            }
            else {
                break;
            }
        }
        // Calculate max streak
        let lastDate = null;
        for (const session of sessions) {
            if (!session)
                continue;
            const sessionDate = new Date(session.date);
            if (!lastDate || Math.abs(sessionDate.getTime() - lastDate.getTime()) <= 86400000) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            }
            else {
                tempStreak = 1;
            }
            lastDate = sessionDate;
        }
        return { current: currentStreak, max: maxStreak };
    }
    /**
       * Get category statistics
       */
    getCategoryStats(cutoffDate) {
        const sessions = this.getStoredSessions();
        const filtered = cutoffDate
            ? sessions.filter(s => new Date(s.date) >= cutoffDate)
            : sessions;
        const categoryStats = {};
        for (const session of filtered) {
            if (session?.categories) {
                for (const cat of session.categories) {
                    if (!categoryStats[cat.name]) {
                        categoryStats[cat.name] = { correct: 0, total: 0 };
                    }
                    categoryStats[cat.name].correct += cat.correct;
                    categoryStats[cat.name].total += cat.total;
                }
            }
        }
        return categoryStats;
    }
    /**
       * Get learning direction statistics
       */
    getDirectionStats(cutoffDate) {
        const sessions = this.getStoredSessions();
        const filtered = cutoffDate
            ? sessions.filter(s => new Date(s.date) >= cutoffDate)
            : sessions;
        const directionStats = {
            'bg-de': { sessions: 0, accuracy: 0 },
            'de-bg': { sessions: 0, accuracy: 0 }
        };
        const normalizeDirection = (value) => {
            if (!value) {
                return null;
            }
            const normalized = value.toString().toLowerCase();
            if (normalized === 'bg-de' || normalized === 'bg_to_de') {
                return 'bg-de';
            }
            if (normalized === 'de-bg' || normalized === 'de_to_bg') {
                return 'de-bg';
            }
            return directionStats[normalized] ? normalized : null;
        };
        for (const session of filtered) {
            const directionKey = normalizeDirection(session.direction);
            if (directionKey && directionStats[directionKey]) {
                directionStats[directionKey].sessions++;
                directionStats[directionKey].accuracy += session.accuracy;
            }
        }
        // Calculate averages
        for (const direction of Object.keys(directionStats)) {
            const stats = directionStats[direction];
            if (stats && stats.sessions > 0) {
                stats.accuracy = Math.round(stats.accuracy / stats.sessions);
            }
        }
        return directionStats;
    }
    /**
       * Get weekly activity data
       */
    getActivityData(cutoffDate) {
        const sessions = this.getStoredSessions();
        const filtered = cutoffDate
            ? sessions.filter(s => new Date(s.date) >= cutoffDate)
            : sessions;
        const activityByDay = {};
        const daysOfWeek = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        // Initialize all days
        for (const day of daysOfWeek) {
            activityByDay[day] = 0;
        }
        // Count sessions by day of week
        for (const session of filtered) {
            const dayIndex = new Date(session.date).getDay();
            const dayName = daysOfWeek[dayIndex];
            if (dayName) {
                activityByDay[dayName]++;
            }
        }
        return activityByDay;
    }
    /**
       * Render all charts
       */
    renderCharts() {
        this.renderProgressChart();
        this.renderCategoryChart();
        this.renderDirectionChart();
        this.renderActivityChart();
        this.updateStatCards();
        this.updateWordLists();
    }
    /**
       * Render progress over time chart
       */
    renderProgressChart() {
        const canvas = document.querySelector('#progress-chart');
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const sessions = this.getStoredSessions().slice(-30); // Last 30 sessions
        // Simple line chart implementation
        this.drawLineChart(ctx, {
            labels: sessions.map((_, i) => `S${i + 1}`),
            data: sessions.map(s => s.accuracy),
            color: this.chartColors.primary,
            title: 'Accuracy Trend'
        });
    }
    /**
       * Render category accuracy chart
       */
    renderCategoryChart() {
        const canvas = document.querySelector('#category-chart');
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const categoryStats = this.data.categories;
        const categories = Object.keys(categoryStats);
        const accuracies = categories.map(cat => {
            const stats = categoryStats[cat];
            return stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        });
        this.drawBarChart(ctx, {
            labels: categories,
            data: accuracies,
            colors: categories.map((_, i) => this.getColorByIndex(i)),
            title: 'Category Accuracy'
        });
    }
    /**
       * Render learning direction chart
       */
    renderDirectionChart() {
        const canvas = document.querySelector('#direction-chart');
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const directionStats = this.data.directions;
        const bgToDe = directionStats['bg-de']?.sessions || 0;
        const deToBg = directionStats['de-bg']?.sessions || 0;
        this.drawPieChart(ctx, {
            labels: ['BG → DE', 'DE → BG'],
            data: [bgToDe, deToBg],
            colors: [this.chartColors.primary, this.chartColors.success]
        });
    }
    /**
       * Render weekly activity chart
       */
    renderActivityChart() {
        const canvas = document.querySelector('#activity-chart');
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const activityData = this.data.activity;
        this.drawBarChart(ctx, {
            labels: Object.keys(activityData),
            data: Object.values(activityData),
            colors: Object.keys(activityData).map(() => this.chartColors.secondary),
            title: 'Weekly Activity'
        });
    }
    /**
       * Simple line chart implementation
       */
    drawLineChart(ctx, options) {
        const { data, color } = options;
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);
        if (data.length === 0) {
            return;
        }
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        const maxValue = Math.max(...data, 100);
        const minValue = Math.min(...data, 0);
        const valueRange = maxValue - minValue || 1;
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        // Draw line
        ctx.strokeStyle = color || this.chartColors.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const [index, value] of data.entries()) {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        // Draw points
        ctx.fillStyle = color || this.chartColors.primary;
        for (const [index, value] of data.entries()) {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    /**
       * Simple bar chart implementation
       */
    drawBarChart(ctx, options) {
        const { data, colors } = options;
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);
        if (data.length === 0) {
            return;
        }
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        const barWidth = chartWidth / data.length * 0.8;
        const maxValue = Math.max(...data, 1);
        for (const [index, value] of data.entries()) {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + (index + 0.1) * (chartWidth / data.length);
            const y = height - padding - barHeight;
            ctx.fillStyle = colors?.[index] || this.chartColors.primary;
            ctx.fillRect(x, y, barWidth, barHeight);
            // Draw value on top
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        }
    }
    /**
       * Simple pie chart implementation
       */
    drawPieChart(ctx, options) {
        const { labels, data, colors } = options;
        const canvas = ctx.canvas;
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);
        const total = data.reduce((sum, value) => sum + value, 0);
        if (total === 0) {
            return;
        }
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        let currentAngle = -Math.PI / 2;
        for (const [index, value] of data.entries()) {
            const sliceAngle = (value / total) * 2 * Math.PI;
            ctx.fillStyle = colors?.[index] || this.getColorByIndex(index);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index] || '', labelX, labelY);
            currentAngle += sliceAngle;
        }
    }
    /**
       * Update stat cards with current data
       */
    updateStatCards() {
        const elements = {
            totalSessions: document.querySelector('#total-sessions'),
            avgAccuracy: document.querySelector('#avg-accuracy'),
            currentStreak: document.querySelector('#current-streak'),
            totalTime: document.querySelector('#total-time')
        };
        if (elements.totalSessions) {
            elements.totalSessions.textContent = this.data.sessions.total.toString();
        }
        if (elements.avgAccuracy) {
            elements.avgAccuracy.textContent = `${this.data.sessions.avgAccuracy}%`;
        }
        if (elements.currentStreak) {
            elements.currentStreak.textContent = this.data.streaks.current.toString();
        }
        if (elements.totalTime) {
            const hours = Math.floor(this.data.sessions.totalTime / 3600000);
            const minutes = Math.floor((this.data.sessions.totalTime % 3600000) / 60000);
            elements.totalTime.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
    }
    /**
       * Update word lists (difficult and mastered)
       */
    updateWordLists() {
        this.updateDifficultWords();
        this.updateMasteredWords();
    }
    /**
       * Update difficult words list
       */
    updateDifficultWords() {
        const container = document.querySelector('#difficult-words');
        if (!container || !this.spacedRepetition) {
            return;
        }
        const reviewStates = Object.values(this.spacedRepetition?.reviewStates || {});
        const difficultWords = reviewStates
            .filter((state) => state.easeFactor < 2 && state.repetitions > 2)
            .sort((a, b) => a.easeFactor - b.easeFactor)
            .slice(0, 10);
        if (difficultWords.length === 0) {
            container.innerHTML = '<p>Keine schwierigen Wörter! / Няма трудни думи!</p>';
            return;
        }
        container.innerHTML = difficultWords.map((state) => `
            <div class="word-item difficult">
                <span class="word">${state.itemId}</span>
                <span class="difficulty">${state.easeFactor.toFixed(1)}</span>
            </div>
        `).join('');
    }
    /**
       * Update mastered words list
       */
    updateMasteredWords() {
        const container = document.querySelector('#mastered-words');
        if (!container || !this.spacedRepetition) {
            return;
        }
        const reviewStates = Object.values(this.spacedRepetition?.reviewStates || {});
        const masteredWords = reviewStates
            .filter((state) => state.interval >= 30 && state.repetitions >= 5)
            .sort((a, b) => b.interval - a.interval)
            .slice(0, 10);
        if (masteredWords.length === 0) {
            container.innerHTML = '<p>Noch keine gemeisterten Wörter! / Още няма овладени думи!</p>';
            return;
        }
        container.innerHTML = masteredWords.map((state) => `
            <div class="word-item mastered">
                <span class="word">${state.itemId}</span>
                <span class="interval">${state.interval}d</span>
            </div>
        `).join('');
    }
    /**
       * Setup event listeners
       */
    setupEventListeners() {
        const timeRangeSelect = document.querySelector('#time-range');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', () => {
                this.loadData();
                this.renderCharts();
            });
        }
    }
    /**
       * Get stored session data from localStorage
       */
    getStoredSessions() {
        try {
            const stored = localStorage.getItem('bgde:session_history');
            return stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.warn('Failed to load session history:', error);
            return [];
        }
    }
    /**
       * Get color by index for charts
       */
    getColorByIndex(index) {
        const colors = [
            this.chartColors.primary,
            this.chartColors.success,
            this.chartColors.warning,
            this.chartColors.error,
            this.chartColors.secondary
        ];
        return colors[index % colors.length] || this.chartColors.primary;
    }
    /**
       * Refresh dashboard data and charts
       */
    refresh() {
        this.loadData();
        this.renderCharts();
    }
}
// Global availability for browser
if (typeof window !== 'undefined') {
    window.SessionStatsDashboard = SessionStatsDashboard;
}
export default SessionStatsDashboard;
//# sourceMappingURL=session-stats-dashboard.js.map