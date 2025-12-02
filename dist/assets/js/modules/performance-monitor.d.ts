/**
 * Performance Monitor with Web Vitals
 *
 * Tracks Core Web Vitals, custom metrics, and performance analytics for the
 * Bulgarian-German learning application. This service monitors page performance,
 * user interactions, and application-specific metrics to provide insights into
 * user experience and application health.
 *
 * @example
 * ```typescript
 * import performanceMonitor from './performance-monitor';
 *
 * // Get current performance summary
 * const summary = performanceMonitor.getSummary();
 * console.log('Overall score:', summary.overallScore);
 * console.log('Recommendations:', summary.recommendations);
 *
 * // Listen for performance metrics
 * window.addEventListener('performance-metric', (event) => {
 *   console.log('New metric:', event.detail);
 * });
 * ```
 *
 * @since 1.0.0
 */
/**
 * Configuration options for the performance monitor
 *
 * @interface PerformanceMonitorConfig
 * @property {boolean} [enableWebVitals=true] - Enable Core Web Vitals tracking
 * @property {boolean} [enableCustomMetrics=true] - Enable custom application metrics
 * @property {boolean} [enableResourceTiming=true] - Enable resource timing monitoring
 * @property {boolean} [enableNavigationTiming=true] - Enable navigation timing monitoring
 * @property {number} [sampleRate=1] - Sampling rate (0-1) for metric collection
 * @property {string|null} [reportingEndpoint=null] - Endpoint for sending performance reports
 * @property {number} [bufferSize=100] - Maximum number of metrics to buffer
 * @property {number} [reportingInterval=30000] - Interval for sending reports in milliseconds
 */
interface PerformanceMonitorConfig {
    enableWebVitals?: boolean;
    enableCustomMetrics?: boolean;
    enableResourceTiming?: boolean;
    enableNavigationTiming?: boolean;
    sampleRate?: number;
    reportingEndpoint?: string | null;
    bufferSize?: number;
    reportingInterval?: number;
}
/**
 * Web Vitals performance rating categories
 *
 * @type {WebVitalsRating}
 * @property {string} good - Performance meets recommended thresholds
 * @property {string} needs-improvement - Performance is below optimal but acceptable
 * @property {string} poor - Performance requires immediate attention
 */
type WebVitalsRating = 'good' | 'needs-improvement' | 'poor';
/**
 * Base interface for all performance metrics
 *
 * @interface BaseMetric
 * @property {string} name - Metric name/identifier
 * @property {string} sessionId - Unique session identifier
 * @property {string} url - Page URL where metric was collected
 * @property {string} userAgent - Browser user agent (truncated)
 * @property {number} timestamp - Unix timestamp when metric was recorded
 */
interface BaseMetric {
    name: string;
    sessionId: string;
    url: string;
    userAgent: string;
    timestamp: number;
}
/**
 * Largest Contentful Paint (LCP) metric
 *
 * @interface LCPMetric
 * @extends BaseMetric
 * @property {number} value - Render time in milliseconds
 * @property {string} element - HTML element tag name
 * @property {string} url - URL of the content element
 * @property {WebVitalsRating} rating - Performance rating
 */
interface LCPMetric extends BaseMetric {
    value: number;
    element: string;
    url: string;
    rating: WebVitalsRating;
}
/**
 * First Input Delay (FID) metric
 *
 * @interface FIDMetric
 * @extends BaseMetric
 * @property {number} value - Input delay in milliseconds
 * @property {string} eventType - Type of input event
 * @property {WebVitalsRating} rating - Performance rating
 */
interface FIDMetric extends BaseMetric {
    value: number;
    eventType: string;
    rating: WebVitalsRating;
}
/**
 * Cumulative Layout Shift (CLS) metric
 *
 * @interface CLSMetric
 * @extends BaseMetric
 * @property {number} value - CLS score (0+)
 * @property {number} entries - Number of layout shift entries
 * @property {WebVitalsRating} rating - Performance rating
 */
interface CLSMetric extends BaseMetric {
    value: number;
    entries: number;
    rating: WebVitalsRating;
}
/**
 * First Contentful Paint (FCP) metric
 *
 * @interface FCPMetric
 * @extends BaseMetric
 * @property {number} value - Paint time in milliseconds
 * @property {WebVitalsRating} rating - Performance rating
 */
interface FCPMetric extends BaseMetric {
    value: number;
    rating: WebVitalsRating;
}
/**
 * Time to First Byte (TTFB) metric
 *
 * @interface TTFBMetric
 * @extends BaseMetric
 * @property {number} value - Response time in milliseconds
 * @property {WebVitalsRating} rating - Performance rating
 */
interface TTFBMetric extends BaseMetric {
    value: number;
    rating: WebVitalsRating;
}
/**
 * Vocabulary loading performance metric
 *
 * @interface VocabularyLoadTimeMetric
 * @extends BaseMetric
 * @property {number} value - Load time in milliseconds
 * @property {number} itemCount - Number of vocabulary items loaded
 * @property {WebVitalsRating} rating - Performance rating
 */
interface VocabularyLoadTimeMetric extends BaseMetric {
    value: number;
    itemCount: number;
    rating: WebVitalsRating;
}
/**
 * Search performance metric
 *
 * @interface SearchPerformanceMetric
 * @extends BaseMetric
 * @property {string} query - Search query (truncated for privacy)
 * @property {number} resultCount - Number of search results
 * @property {number} responseTime - Search response time in milliseconds
 * @property {WebVitalsRating} rating - Performance rating
 */
interface SearchPerformanceMetric extends BaseMetric {
    query: string;
    resultCount: number;
    responseTime: number;
    rating: WebVitalsRating;
}
/**
 * Practice session performance metric
 *
 * @interface PracticeSessionMetric
 * @extends BaseMetric
 * @property {number} duration - Session duration in milliseconds
 * @property {number} accuracy - Accuracy percentage (0-100)
 * @property {number} itemCount - Number of items practiced
 * @property {number} itemsPerMinute - Items completed per minute
 */
interface PracticeSessionMetric extends BaseMetric {
    duration: number;
    accuracy: number;
    itemCount: number;
    itemsPerMinute: number;
}
/**
 * Memory usage metric
 *
 * @interface MemoryUsageMetric
 * @extends BaseMetric
 * @property {number} usedJSHeapSize - Used JavaScript heap size in bytes
 * @property {number} totalJSHeapSize - Total JavaScript heap size in bytes
 * @property {number} jsHeapSizeLimit - JavaScript heap size limit in bytes
 */
interface MemoryUsageMetric extends BaseMetric {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}
/**
 * JavaScript error metric
 *
 * @interface JavaScriptErrorMetric
 * @extends BaseMetric
 * @property {string} message - Error message
 * @property {string} filename - Source file name
 * @property {number} lineno - Line number
 * @property {number} colno - Column number
 * @property {string} stack - Stack trace (truncated)
 */
interface JavaScriptErrorMetric extends BaseMetric {
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    stack: string;
}
/**
 * Unhandled promise rejection metric
 *
 * @interface UnhandledPromiseRejectionMetric
 * @extends BaseMetric
 * @property {string} reason - Rejection reason
 */
interface UnhandledPromiseRejectionMetric extends BaseMetric {
    reason: string;
}
/**
 * Resource timing metric
 *
 * @interface ResourceTimingMetric
 * @extends BaseMetric
 * @property {string} name - Resource name (filename)
 * @property {string} type - Resource type (script, stylesheet, etc.)
 * @property {number} duration - Load duration in milliseconds
 * @property {number} size - Resource size in bytes
 * @property {boolean} cached - Whether resource was loaded from cache
 */
interface ResourceTimingMetric extends BaseMetric {
    name: string;
    type: string;
    duration: number;
    size: number;
    cached: boolean;
}
/**
 * Navigation timing metric
 *
 * @interface NavigationTimingMetric
 * @extends BaseMetric
 * @property {number} domContentLoaded - DOM content loaded time in milliseconds
 * @property {number} loadComplete - Load complete time in milliseconds
 * @property {number} domInteractive - DOM interactive time in milliseconds
 * @property {number} totalLoadTime - Total load time in milliseconds
 */
interface NavigationTimingMetric extends BaseMetric {
    domContentLoaded: number;
    loadComplete: number;
    domInteractive: number;
    totalLoadTime: number;
}
/**
 * Page visibility metric
 *
 * @interface PageVisibilityMetric
 * @extends BaseMetric
 * @property {'hidden'|'visible'} event - Visibility change event
 * @property {number} [visibleTime] - Total visible time in milliseconds
 */
interface PageVisibilityMetric extends BaseMetric {
    event: 'hidden' | 'visible';
    visibleTime?: number;
}
/**
 * Session summary metric
 *
 * @interface SessionSummaryMetric
 * @extends BaseMetric
 * @property {number} totalVisibleTime - Total time page was visible in milliseconds
 * @property {number} totalSessionTime - Total session duration in milliseconds
 */
interface SessionSummaryMetric extends BaseMetric {
    totalVisibleTime: number;
    totalSessionTime: number;
}
/**
 * Union type for all possible performance metrics
 *
 * @type {Metric}
 */
type Metric = LCPMetric | FIDMetric | CLSMetric | FCPMetric | TTFBMetric | VocabularyLoadTimeMetric | SearchPerformanceMetric | PracticeSessionMetric | MemoryUsageMetric | JavaScriptErrorMetric | UnhandledPromiseRejectionMetric | ResourceTimingMetric | NavigationTimingMetric | PageVisibilityMetric | SessionSummaryMetric;
/**
 * Web Vitals summary containing core metrics
 *
 * @interface WebVitalsSummary
 * @property {LCPMetric} [LCP] - Largest Contentful Paint metric
 * @property {FIDMetric} [FID] - First Input Delay metric
 * @property {CLSMetric} [CLS] - Cumulative Layout Shift metric
 * @property {FCPMetric} [FCP] - First Contentful Paint metric
 * @property {TTFBMetric} [TTFB] - Time to First Byte metric
 */
interface WebVitalsSummary {
    LCP?: LCPMetric;
    FID?: FIDMetric;
    CLS?: CLSMetric;
    FCP?: FCPMetric;
    TTFB?: TTFBMetric;
}
/**
 * Comprehensive performance summary
 *
 * @interface PerformanceSummary
 * @property {string} sessionId - Unique session identifier
 * @property {WebVitalsSummary} webVitals - Core Web Vitals metrics
 * @property {number} customMetricsCount - Number of custom metrics collected
 * @property {number} overallScore - Overall performance score (0-100)
 * @property {string[]} recommendations - Performance improvement recommendations
 */
interface PerformanceSummary {
    sessionId: string;
    webVitals: WebVitalsSummary;
    customMetricsCount: number;
    overallScore: number;
    recommendations: string[];
}
/**
 * Performance Monitor Service Class
 *
 * Comprehensive performance monitoring service that tracks Core Web Vitals,
 * custom application metrics, and provides performance analytics and recommendations.
 * Automatically initializes on import and begins monitoring page performance.
 *
 * @class PerformanceMonitor
 *
 * @example
 * ```typescript
 * import performanceMonitor from './performance-monitor';
 *
 * // Get current performance metrics
 * const metrics = performanceMonitor.getMetrics();
 *
 * // Get Web Vitals summary
 * const webVitals = performanceMonitor.getWebVitals();
 *
 * // Get comprehensive performance summary
 * const summary = performanceMonitor.getSummary();
 * console.log('Performance score:', summary.overallScore);
 * ```
 *
 * @since 1.0.0
 */
declare class PerformanceMonitor {
    private metrics;
    private observers;
    private config;
    private buffer;
    private reportingTimer;
    private sessionId;
    private pageLoadTime;
    /**
     * Creates a new PerformanceMonitor instance
     *
     * @public
     * @description Automatically initializes performance monitoring with default settings.
     * The monitor will start tracking Web Vitals, custom metrics, and other performance
     * indicators immediately upon instantiation.
     *
     * @example
     * ```typescript
     * // Performance monitor is automatically initialized
     * import performanceMonitor from './performance-monitor';
     *
     * // Monitor is now tracking performance metrics
     * const summary = performanceMonitor.getSummary();
     * ```
     */
    constructor();
    /**
     * Initializes the performance monitor with all tracking systems
     *
     * @private
     * @description Sets up Web Vitals monitoring, custom metrics, resource timing,
     * navigation timing, periodic reporting, and visibility tracking based on configuration.
     * Only initializes if the current session should be sampled.
     */
    private init;
    private initWebVitals;
    private observeLCP;
    private observeFID;
    private observeCLS;
    private observeFCP;
    private observeTTFB;
    private initCustomMetrics;
    private trackVocabularyLoading;
    private trackSearchPerformance;
    private trackPracticeSession;
    private trackMemoryUsage;
    private trackJavaScriptErrors;
    private initResourceTiming;
    private initNavigationTiming;
    private setupVisibilityTracking;
    private recordMetric;
    private rateLCP;
    private rateFID;
    private rateCLS;
    private rateFCP;
    private rateTTFB;
    private setupReporting;
    private sendReport;
    private storeLocalReport;
    /**
     * Gets all collected performance metrics
     *
     * @public
     * @returns {Metric[]} Array of all performance metrics collected during the session
     *
     * @example
     * ```typescript
     * const metrics = performanceMonitor.getMetrics();
     * console.log(`Collected ${metrics.length} performance metrics`);
     *
     * // Filter for specific metric types
     * const errorMetrics = metrics.filter(m => m.name === 'JavaScriptError');
     * ```
     */
    getMetrics(): Metric[];
    /**
     * Gets Core Web Vitals metrics summary
     *
     * @public
     * @returns {WebVitalsSummary} Object containing LCP, FID, CLS, FCP, and TTFB metrics
     *
     * @example
     * ```typescript
     * const webVitals = performanceMonitor.getWebVitals();
     *
     * if (webVitals.LCP) {
     *   console.log(`Largest Contentful Paint: ${webVitals.LCP.value}ms (${webVitals.LCP.rating})`);
     * }
     *
     * if (webVitals.CLS) {
     *   console.log(`Cumulative Layout Shift: ${webVitals.CLS.value} (${webVitals.CLS.rating})`);
     * }
     * ```
     */
    getWebVitals(): WebVitalsSummary;
    /**
     * Gets comprehensive performance summary with recommendations
     *
     * @public
     * @returns {PerformanceSummary} Complete performance analysis including scores and recommendations
     *
     * @example
     * ```typescript
     * const summary = performanceMonitor.getSummary();
     *
     * console.log(`Session ID: ${summary.sessionId}`);
     * console.log(`Overall Performance Score: ${summary.overallScore}/100`);
     * console.log(`Custom Metrics Collected: ${summary.customMetricsCount}`);
     *
     * if (summary.recommendations.length > 0) {
     *   console.log('Performance Recommendations:');
     *   summary.recommendations.forEach(rec => console.log(`- ${rec}`));
     * }
     * ```
     */
    getSummary(): PerformanceSummary;
    private calculateOverallScore;
    private generateRecommendations;
    private shouldSample;
    private generateSessionId;
    /**
     * Updates performance monitor configuration
     *
     * @public
     * @param {Partial<PerformanceMonitorConfig>} options - Configuration options to update
     *
     * @example
     * ```typescript
     * // Disable Web Vitals monitoring
     * performanceMonitor.configure({ enableWebVitals: false });
     *
     * // Set up remote reporting endpoint
     * performanceMonitor.configure({
     *   reportingEndpoint: 'https://api.example.com/performance',
     *   reportingInterval: 60000 // Report every minute
     * });
     *
     * // Adjust sampling rate for production
     * performanceMonitor.configure({ sampleRate: 0.1 }); // 10% sampling
     * ```
     */
    configure(options: Partial<PerformanceMonitorConfig>): void;
    /**
     * Destroys the performance monitor and cleans up resources
     *
     * @public
     * @description Disconnects all performance observers, clears timers,
     * and sends any remaining buffered metrics. Should be called when
     * the application is unloading or the monitor is no longer needed.
     *
     * @example
     * ```typescript
     * // Clean up when page is unloading
     * window.addEventListener('beforeunload', () => {
     *   performanceMonitor.destroy();
     * });
     *
     * // Or clean up manually
     * performanceMonitor.destroy();
     * console.log('Performance monitor cleaned up');
     * ```
     */
    destroy(): void;
    /**
     * Gets the unique session identifier
     *
     * @public
     * @readonly
     * @type {string}
     *
     * @example
     * ```typescript
     * console.log('Performance session ID:', performanceMonitor.sessionIdValue);
     * ```
     */
    get sessionIdValue(): string;
    /**
     * Gets the current monitor configuration
     *
     * @public
     * @readonly
     * @type {Required<PerformanceMonitorConfig>}
     *
     * @example
     * ```typescript
     * const config = performanceMonitor.monitorConfig;
     * console.log('Web Vitals enabled:', config.enableWebVitals);
     * console.log('Sample rate:', config.sampleRate);
     * console.log('Buffer size:', config.bufferSize);
     * ```
     */
    get monitorConfig(): Required<PerformanceMonitorConfig>;
}
declare const performanceMonitor: PerformanceMonitor;
export default performanceMonitor;
//# sourceMappingURL=performance-monitor.d.ts.map