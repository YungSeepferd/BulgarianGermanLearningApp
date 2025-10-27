/**
 * Performance Monitor for Bulgarian-German Learning App
 *
 * Tracks and reports performance metrics for optimization
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.isProduction = !window.location.hostname.includes('localhost');
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    // Track page load performance
    if (window.performance && performance.timing) {
      window.addEventListener('load', () => {
        this.trackPageLoad();
      });
    }

    // Track localStorage usage
    this.trackStorageUsage();

    // Setup periodic checks
    if (!this.isProduction) {
      setInterval(() => this.checkPerformance(), 30000); // Every 30 seconds in dev
    }
  }

  /**
   * Track page load metrics
   */
  trackPageLoad() {
    const timing = performance.timing;
    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart
    };

    this.metrics.pageLoad = metrics;

    if (!this.isProduction) {
      console.log('[PerformanceMonitor] Page Load Metrics:', metrics);
    }

    // Store in localStorage
    try {
      localStorage.setItem('bgde:performance:pageLoad', JSON.stringify(metrics));
    } catch (e) {
      console.warn('Could not store performance metrics:', e);
    }
  }

  /**
   * Track localStorage usage
   */
  trackStorageUsage() {
    try {
      let totalSize = 0;
      const items = {};

      for (let key in localStorage) {
        if (key.startsWith('bgde:')) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          totalSize += size;
          items[key] = {
            size,
            sizeKB: (size / 1024).toFixed(2)
          };
        }
      }

      this.metrics.storage = {
        totalSize,
        totalKB: (totalSize / 1024).toFixed(2),
        totalMB: (totalSize / 1024 / 1024).toFixed(2),
        items,
        itemCount: Object.keys(items).length
      };

      if (!this.isProduction) {
        console.log('[PerformanceMonitor] Storage Usage:', this.metrics.storage);
      }

      // Warn if storage is getting full (> 4MB)
      if (totalSize > 4 * 1024 * 1024) {
        console.warn('[PerformanceMonitor] Storage usage high:', this.metrics.storage.totalMB, 'MB');
      }
    } catch (e) {
      console.warn('Could not track storage usage:', e);
    }
  }

  /**
   * Measure function execution time
   * @param {string} name - Metric name
   * @param {Function} fn - Function to measure
   * @returns {*} Function result
   */
  async measure(name, fn) {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      if (!this.metrics.functions) {
        this.metrics.functions = {};
      }

      if (!this.metrics.functions[name]) {
        this.metrics.functions[name] = {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0
        };
      }

      const metric = this.metrics.functions[name];
      metric.count++;
      metric.totalDuration += duration;
      metric.minDuration = Math.min(metric.minDuration, duration);
      metric.maxDuration = Math.max(metric.maxDuration, duration);
      metric.avgDuration = metric.totalDuration / metric.count;

      if (!this.isProduction) {
        console.log(`[PerformanceMonitor] ${name}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      console.error(`[PerformanceMonitor] Error in ${name}:`, error);
      throw error;
    }
  }

  /**
   * Mark a custom timing point
   * @param {string} name - Mark name
   */
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   * @param {string} measureName - Measure name
   * @param {string} startMark - Start mark name
   * @param {string} endMark - End mark name
   * @returns {number} Duration in ms
   */
  measureBetween(measureName, startMark, endMark) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];

      if (!this.isProduction) {
        console.log(`[PerformanceMonitor] ${measureName}: ${measure.duration.toFixed(2)}ms`);
      }

      return measure.duration;
    } catch (e) {
      console.warn(`Could not measure ${measureName}:`, e);
      return 0;
    }
  }

  /**
   * Check current performance
   */
  checkPerformance() {
    const warnings = [];

    // Check memory (if available)
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      this.metrics.memory = {
        usedMB: memoryMB.toFixed(2),
        limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
      };

      if (memoryMB > 50) { // More than 50MB
        warnings.push(`High memory usage: ${memoryMB.toFixed(2)}MB`);
      }
    }

    // Check localStorage usage
    this.trackStorageUsage();

    // Report warnings
    if (warnings.length > 0 && !this.isProduction) {
      console.warn('[PerformanceMonitor] Performance Warnings:', warnings);
    }

    return warnings;
  }

  /**
   * Get all metrics
   * @returns {Object} All collected metrics
   */
  getMetrics() {
    this.checkPerformance();
    return this.metrics;
  }

  /**
   * Get performance summary
   * @returns {string} Human-readable summary
   */
  getSummary() {
    const metrics = this.getMetrics();
    const lines = ['=== Performance Summary ==='];

    if (metrics.pageLoad) {
      lines.push('\nPage Load:');
      lines.push(`  Total: ${metrics.pageLoad.total}ms`);
      lines.push(`  DOM: ${metrics.pageLoad.dom}ms`);
      lines.push(`  Load: ${metrics.pageLoad.load}ms`);
    }

    if (metrics.storage) {
      lines.push('\nStorage:');
      lines.push(`  Total: ${metrics.storage.totalKB} KB`);
      lines.push(`  Items: ${metrics.storage.itemCount}`);
    }

    if (metrics.memory) {
      lines.push('\nMemory:');
      lines.push(`  Used: ${metrics.memory.usedMB} MB`);
      lines.push(`  Limit: ${metrics.memory.limitMB} MB`);
    }

    if (metrics.functions) {
      lines.push('\nFunction Timings:');
      for (const [name, metric] of Object.entries(metrics.functions)) {
        lines.push(`  ${name}:`);
        lines.push(`    Calls: ${metric.count}`);
        lines.push(`    Avg: ${metric.avgDuration.toFixed(2)}ms`);
        lines.push(`    Min: ${metric.minDuration.toFixed(2)}ms`);
        lines.push(`    Max: ${metric.maxDuration.toFixed(2)}ms`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export metrics for analysis
   * @returns {string} JSON string of metrics
   */
  export() {
    return JSON.stringify({
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = {};
    localStorage.removeItem('bgde:performance:pageLoad');
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = performanceMonitor;
}

// Make available globally for debugging
window.bgdePerformanceMonitor = performanceMonitor;

// Log initialization
if (!performanceMonitor.isProduction) {
  console.log('[PerformanceMonitor] Initialized. Access via window.bgdePerformanceMonitor');
  console.log('[PerformanceMonitor] Commands: .getMetrics(), .getSummary(), .export()');
}
