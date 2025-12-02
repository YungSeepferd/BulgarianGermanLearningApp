/**
 * Performance Monitor for Bulgarian-German Learning App
 *
 * Tracks and reports performance metrics for optimization
 */
interface PageLoadMetrics {
    dns: number;
    tcp: number;
    request: number;
    response: number;
    dom: number;
    load: number;
    total: number;
}
interface StorageItemMetrics {
    size: number;
    sizeKB: string;
}
interface StorageMetrics {
    totalSize: number;
    totalKB: string;
    totalMB: string;
    items: Record<string, StorageItemMetrics>;
    itemCount: number;
}
interface FunctionMetrics {
    count: number;
    totalDuration: number;
    minDuration: number;
    maxDuration: number;
    avgDuration: number;
}
interface MemoryMetrics {
    usedMB: string;
    limitMB: string;
}
interface PerformanceMetrics {
    pageLoad?: PageLoadMetrics;
    storage?: StorageMetrics;
    memory?: MemoryMetrics;
    functions?: Record<string, FunctionMetrics>;
}
declare class PerformanceMonitor {
    private metrics;
    isProduction: boolean;
    constructor();
    /**
     * Initialize performance monitoring
     */
    init(): void;
    /**
     * Track page load metrics
     */
    trackPageLoad(): void;
    /**
     * Track localStorage usage
     */
    trackStorageUsage(): void;
    /**
     * Measure function execution time
     * @param name - Metric name
     * @param fn - Function to measure
     * @returns Function result
     */
    measure<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Mark a custom timing point
     * @param name - Mark name
     */
    mark(name: string): void;
    /**
     * Measure between two marks
     * @param measureName - Measure name
     * @param startMark - Start mark name
     * @param endMark - End mark name
     * @returns Duration in ms
     */
    measureBetween(measureName: string, startMark: string, endMark: string): number;
    /**
     * Check current performance
     */
    checkPerformance(): string[];
    /**
     * Get all metrics
     * @returns All collected metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get performance summary
     * @returns Human-readable summary
     */
    getSummary(): string;
    /**
     * Export metrics for analysis
     * @returns JSON string of metrics
     */
    export(): string;
    /**
     * Clear all metrics
     */
    clear(): void;
}
declare const performanceMonitor: PerformanceMonitor;
export default performanceMonitor;
//# sourceMappingURL=performance-monitor.d.ts.map