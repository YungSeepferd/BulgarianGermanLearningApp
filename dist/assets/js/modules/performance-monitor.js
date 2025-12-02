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
class PerformanceMonitor {
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
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.config = {
            enableWebVitals: true,
            enableCustomMetrics: true,
            enableResourceTiming: true,
            enableNavigationTiming: true,
            sampleRate: 1, // 100% sampling by default
            reportingEndpoint: null,
            bufferSize: 100,
            reportingInterval: 30000 // 30 seconds
        };
        this.buffer = [];
        this.reportingTimer = null;
        this.sessionId = this.generateSessionId();
        this.pageLoadTime = performance.now();
        this.init();
    }
    /**
     * Initializes the performance monitor with all tracking systems
     *
     * @private
     * @description Sets up Web Vitals monitoring, custom metrics, resource timing,
     * navigation timing, periodic reporting, and visibility tracking based on configuration.
     * Only initializes if the current session should be sampled.
     */
    init() {
        if (!this.shouldSample()) {
            return;
        }
        // Initialize Web Vitals monitoring
        if (this.config.enableWebVitals) {
            this.initWebVitals();
        }
        // Initialize custom metrics
        if (this.config.enableCustomMetrics) {
            this.initCustomMetrics();
        }
        // Initialize resource timing
        if (this.config.enableResourceTiming) {
            this.initResourceTiming();
        }
        // Initialize navigation timing
        if (this.config.enableNavigationTiming) {
            this.initNavigationTiming();
        }
        // Set up periodic reporting
        this.setupReporting();
        // Listen for page visibility changes
        this.setupVisibilityTracking();
        console.log('[PerformanceMonitor] Initialized with session:', this.sessionId);
    }
    // Web Vitals Implementation
    initWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();
        // First Input Delay (FID)
        this.observeFID();
        // Cumulative Layout Shift (CLS)
        this.observeCLS();
        // First Contentful Paint (FCP)
        this.observeFCP();
        // Time to First Byte (TTFB)
        this.observeTTFB();
    }
    observeLCP() {
        if (!('PerformanceObserver' in window)) {
            return;
        }
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries.at(-1);
                this.recordMetric('LCP', {
                    value: lastEntry.startTime,
                    element: lastEntry.element?.tagName || 'unknown',
                    url: lastEntry.url || '',
                    timestamp: Date.now(),
                    rating: this.rateLCP(lastEntry.startTime)
                });
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', observer);
        }
        catch (error) {
            console.warn('[PerformanceMonitor] LCP observation failed:', error);
        }
    }
    observeFID() {
        if (!('PerformanceObserver' in window)) {
            return;
        }
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    const fidEntry = entry;
                    this.recordMetric('FID', {
                        value: fidEntry.processingStart - fidEntry.startTime,
                        eventType: fidEntry.name,
                        timestamp: Date.now(),
                        rating: this.rateFID(fidEntry.processingStart - fidEntry.startTime)
                    });
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', observer);
        }
        catch (error) {
            console.warn('[PerformanceMonitor] FID observation failed:', error);
        }
    }
    observeCLS() {
        if (!('PerformanceObserver' in window)) {
            return;
        }
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const layoutShiftEntry = entry;
                    if (!layoutShiftEntry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries.at(-1);
                        if (sessionValue &&
                            lastSessionEntry &&
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += layoutShiftEntry.value;
                            sessionEntries.push(entry);
                        }
                        else {
                            sessionValue = layoutShiftEntry.value;
                            sessionEntries = [entry];
                        }
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            this.recordMetric('CLS', {
                                value: clsValue,
                                entries: sessionEntries.length,
                                timestamp: Date.now(),
                                rating: this.rateCLS(clsValue)
                            });
                        }
                    }
                }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', observer);
        }
        catch (error) {
            console.warn('[PerformanceMonitor] CLS observation failed:', error);
        }
    }
    observeFCP() {
        if (!('PerformanceObserver' in window)) {
            return;
        }
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('FCP', {
                            value: entry.startTime,
                            timestamp: Date.now(),
                            rating: this.rateFCP(entry.startTime)
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
            this.observers.set('fcp', observer);
        }
        catch (error) {
            console.warn('[PerformanceMonitor] FCP observation failed:', error);
        }
    }
    observeTTFB() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                this.recordMetric('TTFB', {
                    value: ttfb,
                    timestamp: Date.now(),
                    rating: this.rateTTFB(ttfb)
                });
            }
        }
        catch (error) {
            console.warn('[PerformanceMonitor] TTFB measurement failed:', error);
        }
    }
    // Custom Metrics
    initCustomMetrics() {
        // Vocabulary loading time
        this.trackVocabularyLoading();
        // Search performance
        this.trackSearchPerformance();
        // Practice session metrics
        this.trackPracticeSession();
        // Memory usage
        this.trackMemoryUsage();
        // JavaScript errors
        this.trackJavaScriptErrors();
    }
    trackVocabularyLoading() {
        const startTime = performance.now();
        // Monitor when vocabulary data is loaded
        document.addEventListener('DOMContentLoaded', () => {
            const vocabContainer = document.querySelector('#vocabulary-grid');
            if (vocabContainer) {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            const loadTime = performance.now() - startTime;
                            this.recordMetric('VocabularyLoadTime', {
                                value: loadTime,
                                itemCount: vocabContainer.children.length,
                                timestamp: Date.now(),
                                rating: loadTime < 1000 ? 'good' : (loadTime < 2500 ? 'needs-improvement' : 'poor')
                            });
                            observer.disconnect();
                        }
                    }
                });
                observer.observe(vocabContainer, { childList: true });
            }
        });
    }
    trackSearchPerformance() {
        // This would be called by the search engine
        window.addEventListener('search-performed', (event) => {
            const { query, resultCount, responseTime } = event.detail;
            this.recordMetric('SearchPerformance', {
                query: query.slice(0, 50), // Limit query length for privacy
                resultCount,
                responseTime,
                timestamp: Date.now(),
                rating: responseTime < 100 ? 'good' : (responseTime < 300 ? 'needs-improvement' : 'poor')
            });
        });
    }
    trackPracticeSession() {
        // Track practice session metrics
        window.addEventListener('practice-session-completed', (event) => {
            const { duration, accuracy, itemCount } = event.detail;
            this.recordMetric('PracticeSession', {
                duration,
                accuracy,
                itemCount,
                itemsPerMinute: itemCount / (duration / 60000),
                timestamp: Date.now()
            });
        });
    }
    trackMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            window.setInterval(() => {
                this.recordMetric('MemoryUsage', {
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
            }, 30000); // Every 30 seconds
        }
    }
    trackJavaScriptErrors() {
        window.addEventListener('error', (event) => {
            this.recordMetric('JavaScriptError', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack?.slice(0, 500) || '',
                timestamp: Date.now()
            });
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.recordMetric('UnhandledPromiseRejection', {
                reason: event.reason?.toString?.() || 'Unknown',
                timestamp: Date.now()
            });
        });
    }
    // Resource Timing
    initResourceTiming() {
        if (!('PerformanceObserver' in window)) {
            return;
        }
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    const resourceEntry = entry;
                    if (resourceEntry.initiatorType && resourceEntry.duration > 0) {
                        this.recordMetric('ResourceTiming', {
                            name: resourceEntry.name.split('/').pop() || resourceEntry.name,
                            type: resourceEntry.initiatorType,
                            duration: resourceEntry.duration,
                            size: resourceEntry.transferSize || 0,
                            cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0,
                            timestamp: Date.now()
                        });
                    }
                }
            });
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('resource', observer);
        }
        catch (error) {
            console.warn('[PerformanceMonitor] Resource timing observation failed:', error);
        }
    }
    // Navigation Timing
    initNavigationTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.recordMetric('NavigationTiming', {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    domInteractive: navigation.domInteractive - navigation.navigationStart,
                    totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
                    timestamp: Date.now()
                });
            }
        });
    }
    // Visibility Tracking
    setupVisibilityTracking() {
        let visibilityStart = Date.now();
        let totalVisibleTime = 0;
        const handleVisibilityChange = () => {
            if (document.hidden) {
                totalVisibleTime += Date.now() - visibilityStart;
                this.recordMetric('PageVisibility', {
                    event: 'hidden',
                    visibleTime: totalVisibleTime,
                    timestamp: Date.now()
                });
            }
            else {
                visibilityStart = Date.now();
                this.recordMetric('PageVisibility', {
                    event: 'visible',
                    timestamp: Date.now()
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // Track total session time on page unload
        window.addEventListener('beforeunload', () => {
            if (!document.hidden) {
                totalVisibleTime += Date.now() - visibilityStart;
            }
            this.recordMetric('SessionSummary', {
                totalVisibleTime,
                totalSessionTime: Date.now() - this.pageLoadTime,
                timestamp: Date.now()
            });
        });
    }
    // Metric Recording and Rating
    recordMetric(name, data) {
        const metric = {
            name,
            sessionId: this.sessionId,
            url: window.location.pathname,
            userAgent: navigator.userAgent.slice(0, 100),
            ...data
        };
        this.metrics.set(`${name}-${Date.now()}`, metric);
        this.buffer.push(metric);
        // Emit event for real-time monitoring
        window.dispatchEvent(new CustomEvent('performance-metric', { detail: metric }));
        // Limit buffer size
        if (this.buffer.length > this.config.bufferSize) {
            this.buffer = this.buffer.slice(-this.config.bufferSize);
        }
    }
    // Web Vitals Rating Functions
    rateLCP(value) {
        if (value <= 2500) {
            return 'good';
        }
        if (value <= 4000) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    rateFID(value) {
        if (value <= 100) {
            return 'good';
        }
        if (value <= 300) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    rateCLS(value) {
        if (value <= 0.1) {
            return 'good';
        }
        if (value <= 0.25) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    rateFCP(value) {
        if (value <= 1800) {
            return 'good';
        }
        if (value <= 3000) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    rateTTFB(value) {
        if (value <= 800) {
            return 'good';
        }
        if (value <= 1800) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    // Reporting
    setupReporting() {
        if (this.config.reportingEndpoint) {
            this.reportingTimer = window.setInterval(() => {
                this.sendReport();
            }, this.config.reportingInterval);
        }
    }
    async sendReport() {
        if (this.buffer.length === 0) {
            return;
        }
        const report = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            url: window.location.href,
            metrics: [...this.buffer]
        };
        try {
            if (this.config.reportingEndpoint) {
                await fetch(this.config.reportingEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                });
            }
            // Store locally as backup
            this.storeLocalReport(report);
            // Clear buffer after successful send
            this.buffer = [];
        }
        catch (error) {
            console.warn('[PerformanceMonitor] Failed to send report:', error);
        }
    }
    storeLocalReport(report) {
        try {
            const key = `bgde:perf-report-${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(report));
            // Clean up old reports (keep last 10)
            const keys = Object.keys(localStorage)
                .filter(k => k.startsWith('bgde:perf-report-'))
                .sort()
                .reverse();
            for (const key of keys.slice(10)) {
                localStorage.removeItem(key);
            }
        }
        catch (error) {
            console.warn('[PerformanceMonitor] Failed to store local report:', error);
        }
    }
    // Public API
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
    getMetrics() {
        return [...this.metrics.values()];
    }
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
    getWebVitals() {
        const vitals = {};
        for (const [, metric] of this.metrics) {
            if (['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(metric.name)) {
                vitals[metric.name] = metric;
            }
        }
        return vitals;
    }
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
    getSummary() {
        const webVitals = this.getWebVitals();
        const customMetrics = this.getMetrics().filter(m => !['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name));
        return {
            sessionId: this.sessionId,
            webVitals,
            customMetricsCount: customMetrics.length,
            overallScore: this.calculateOverallScore(webVitals),
            recommendations: this.generateRecommendations(webVitals)
        };
    }
    calculateOverallScore(webVitals) {
        const scores = Object.values(webVitals).map(metric => {
            switch (metric.rating) {
                case 'good': {
                    return 100;
                }
                case 'needs-improvement': {
                    return 50;
                }
                case 'poor': {
                    return 0;
                }
                default: {
                    return 50;
                }
            }
        });
        return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
    }
    generateRecommendations(webVitals) {
        const recommendations = [];
        if (webVitals.LCP?.rating === 'poor') {
            recommendations.push('Optimize largest contentful paint by reducing image sizes and server response times');
        }
        if (webVitals.FID?.rating === 'poor') {
            recommendations.push('Improve first input delay by reducing JavaScript execution time');
        }
        if (webVitals.CLS?.rating === 'poor') {
            recommendations.push('Reduce cumulative layout shift by setting image dimensions and avoiding dynamic content insertion');
        }
        return recommendations;
    }
    // Utility Methods
    shouldSample() {
        return Math.random() < this.config.sampleRate;
    }
    generateSessionId() {
        // Use cryptographically secure random values for session id
        let randStr;
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            // Browser: Use crypto.getRandomValues
            const buf = new Uint32Array(3); // 96 bits
            window.crypto.getRandomValues(buf);
            randStr = [...buf].map(val => val.toString(36)).join('');
        }
        else if (typeof require === 'undefined') {
            // Fallback (not recommended): use Math.random
            randStr = Math.random().toString(36).slice(2, 11);
        }
        else {
            // NodeJS: Use crypto.randomBytes
            try {
                const crypto = eval('require')('node:crypto');
                randStr = crypto.randomBytes(12).toString('base64url'); // 12 bytes -> 16 chars
            }
            catch {
                // Fallback to Math.random only if secure RNG is missing (not recommended)
                randStr = Math.random().toString(36).slice(2, 11);
            }
        }
        return `perf_${Date.now()}_${randStr}`;
    }
    // Configuration
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
    configure(options) {
        Object.assign(this.config, options);
    }
    // Cleanup
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
    destroy() {
        // Disconnect all observers
        for (const observer of this.observers.values()) {
            observer.disconnect();
        }
        this.observers.clear();
        // Clear reporting timer
        if (this.reportingTimer) {
            clearInterval(this.reportingTimer);
        }
        // Send final report
        if (this.buffer.length > 0) {
            this.sendReport();
        }
    }
    // Getters
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
    get sessionIdValue() {
        return this.sessionId;
    }
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
    get monitorConfig() {
        return { ...this.config };
    }
}
// Create and export singleton instance
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
    window.performanceMonitor = performanceMonitor;
}
//# sourceMappingURL=performance-monitor.js.map