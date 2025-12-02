/**
 * Session Statistics Dashboard
 * Provides comprehensive analytics and visualizations for learning progress
 */
import type { ReviewState } from './types';
interface SessionStatsDashboardOptions {
    spacedRepetition?: {
        reviewStates?: Record<string, ReviewState>;
    };
    containerId?: string;
}
interface SessionData {
    date: string;
    duration?: number;
    accuracy: number;
    categories?: Array<{
        name: string;
        correct: number;
        total: number;
    }>;
    direction?: string;
}
interface SessionStats {
    total: number;
    totalTime: number;
    avgAccuracy: number;
}
interface ReviewStats {
    total: number;
    correct: number;
}
interface StreakStats {
    current: number;
    max: number;
}
interface CategoryStats {
    [key: string]: {
        correct: number;
        total: number;
    };
}
interface DirectionStats {
    [key: string]: {
        sessions: number;
        accuracy: number;
    };
}
interface ActivityData {
    [key: string]: number;
}
interface ChartOptions {
    labels: string[];
    data: number[];
    color?: string;
    colors?: string[];
    title?: string;
}
declare class SessionStatsDashboard {
    private spacedRepetition;
    private containerId;
    private chartColors;
    private initialized;
    private data;
    constructor(options?: SessionStatsDashboardOptions);
    /**
       * Initialize the dashboard
       */
    init(): void;
    /**
       * Create the dashboard HTML structure
       */
    createDashboardStructure(): void;
    /**
       * Load statistical data
       */
    loadData(): void;
    /**
       * Get cutoff date for time range
       */
    getCutoffDate(timeRange: string): Date | null;
    /**
       * Get session statistics
       */
    getSessionData(cutoffDate: Date | null): SessionStats;
    /**
       * Get review statistics
       */
    getReviewData(cutoffDate: Date | null): ReviewStats;
    /**
       * Get streak statistics
       */
    getStreakData(): StreakStats;
    /**
       * Get category statistics
       */
    getCategoryStats(cutoffDate: Date | null): CategoryStats;
    /**
       * Get learning direction statistics
       */
    getDirectionStats(cutoffDate: Date | null): DirectionStats;
    /**
       * Get weekly activity data
       */
    getActivityData(cutoffDate: Date | null): ActivityData;
    /**
       * Render all charts
       */
    renderCharts(): void;
    /**
       * Render progress over time chart
       */
    renderProgressChart(): void;
    /**
       * Render category accuracy chart
       */
    renderCategoryChart(): void;
    /**
       * Render learning direction chart
       */
    renderDirectionChart(): void;
    /**
       * Render weekly activity chart
       */
    renderActivityChart(): void;
    /**
       * Simple line chart implementation
       */
    drawLineChart(ctx: CanvasRenderingContext2D, options: ChartOptions): void;
    /**
       * Simple bar chart implementation
       */
    drawBarChart(ctx: CanvasRenderingContext2D, options: ChartOptions): void;
    /**
       * Simple pie chart implementation
       */
    drawPieChart(ctx: CanvasRenderingContext2D, options: ChartOptions): void;
    /**
       * Update stat cards with current data
       */
    updateStatCards(): void;
    /**
       * Update word lists (difficult and mastered)
       */
    updateWordLists(): void;
    /**
       * Update difficult words list
       */
    updateDifficultWords(): void;
    /**
       * Update mastered words list
       */
    updateMasteredWords(): void;
    /**
       * Setup event listeners
       */
    setupEventListeners(): void;
    /**
       * Get stored session data from localStorage
       */
    getStoredSessions(): SessionData[];
    /**
       * Get color by index for charts
       */
    getColorByIndex(index: number): string;
    /**
       * Refresh dashboard data and charts
       */
    refresh(): void;
}
export default SessionStatsDashboard;
//# sourceMappingURL=session-stats-dashboard.d.ts.map