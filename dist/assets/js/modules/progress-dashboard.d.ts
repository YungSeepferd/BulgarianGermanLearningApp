/**
 * Progress Dashboard Module
 * Handles data aggregation and visualization for learning progress
 * Displays charts, statistics, and session history
 */
import type { VocabularyItem, ReviewState } from '../types.js';
interface SessionHistoryEntry {
    timestamp: string | number;
    reviewed: number;
    correct: number;
    duration?: number;
}
export declare class ProgressDashboard {
    private profileId;
    private vocabulary;
    private charts;
    private data;
    constructor();
    /**
     * Initialize the dashboard
     */
    initialize(): Promise<void>;
    /**
     * Wait for required dependencies to load
     */
    waitForDependencies(): Promise<void>;
    /**
     * Get vocabulary data from the page
     */
    getVocabularyData(): VocabularyItem[];
    /**
     * Calculate all metrics from localStorage
     */
    calculateMetrics(): void;
    /**
     * Get review data from localStorage
     */
    getReviewData(storageKey: string): ReviewState | null;
    /**
     * Get phase from review data
     */
    getPhaseFromData(reviewData: ReviewState | null): string;
    /**
     * Get session history from localStorage
     */
    getSessionHistory(): SessionHistoryEntry[];
    /**
     * Calculate weekly activity data
     */
    calculateWeeklyActivity(): Record<string, number>;
    /**
     * Update key metrics in the DOM
     */
    updateKeyMetrics(): void;
    /**
     * Render all charts
     */
    renderCharts(): void;
    /**
     * Render phase distribution doughnut chart
     */
    renderPhaseChart(): void;
    /**
     * Render direction performance bar chart
     */
    renderDirectionChart(): void;
    /**
     * Render category performance bar chart
     */
    renderCategoryChart(): void;
    /**
     * Render weekly activity line chart
     */
    renderActivityChart(): void;
    /**
     * Populate session history table
     */
    populateSessionHistory(): void;
    /**
     * Format duration in seconds to human-readable format
     */
    formatDuration(seconds: number): string;
    /**
     * Handle profile change
     */
    handleProfileChange(): void;
    /**
     * Show empty state
     */
    showEmptyState(): void;
    /**
     * Simple HTML visualization for phase distribution
     */
    renderSimplePhaseChart(container: HTMLElement, data: Record<string, number>): void;
    /**
     * Simple HTML visualization for direction stats
     */
    renderSimpleDirectionChart(container: HTMLElement, stats: Record<string, {
        reviewed: number;
        learned: number;
    }>): void;
    /**
     * Simple HTML visualization for category stats
     */
    renderSimpleCategoryChart(container: HTMLElement, _stats: Record<string, {
        total: number;
        learned: number;
        reviewed: number;
    }>, categories: Array<[string, {
        total: number;
        learned: number;
        reviewed: number;
    }]>): void;
    /**
     * Simple HTML visualization for activity data
     */
    renderSimpleActivityChart(container: HTMLElement, activityData: Record<string, number>): void;
}
export {};
//# sourceMappingURL=progress-dashboard.d.ts.map