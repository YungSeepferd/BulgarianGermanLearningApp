// Performance Monitor with Web Vitals
// Tracks Core Web Vitals, custom metrics, and performance analytics

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.config = {
      enableWebVitals: true,
      enableCustomMetrics: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      sampleRate: 1.0, // 100% sampling by default
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
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
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
    } catch (error) {
      console.warn('[PerformanceMonitor] LCP observation failed:', error);
    }
  }

  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          this.recordMetric('FID', {
            value: entry.processingStart - entry.startTime,
            eventType: entry.name,
            timestamp: Date.now(),
            rating: this.rateFID(entry.processingStart - entry.startTime)
          });
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] FID observation failed:', error);
    }
  }

  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
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
    } catch (error) {
      console.warn('[PerformanceMonitor] CLS observation failed:', error);
    }
  }

  observeFCP() {
    if (!('PerformanceObserver' in window)) return;

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
    } catch (error) {
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
    } catch (error) {
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
      const vocabContainer = document.getElementById('vocabulary-grid');
      if (vocabContainer) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              const loadTime = performance.now() - startTime;
              
              this.recordMetric('VocabularyLoadTime', {
                value: loadTime,
                itemCount: vocabContainer.children.length,
                timestamp: Date.now(),
                rating: loadTime < 1000 ? 'good' : loadTime < 2500 ? 'needs-improvement' : 'poor'
              });
              
              observer.disconnect();
            }
          });
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
        query: query.substring(0, 50), // Limit query length for privacy
        resultCount,
        responseTime,
        timestamp: Date.now(),
        rating: responseTime < 100 ? 'good' : responseTime < 300 ? 'needs-improvement' : 'poor'
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
      setInterval(() => {
        const memory = performance.memory;
        
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
        stack: event.error?.stack?.substring(0, 500) || '',
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
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.initiatorType && entry.duration > 0) {
            this.recordMetric('ResourceTiming', {
              name: entry.name.split('/').pop() || entry.name,
              type: entry.initiatorType,
              duration: entry.duration,
              size: entry.transferSize || 0,
              cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
              timestamp: Date.now()
            });
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
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
      } else {
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
      userAgent: navigator.userAgent.substring(0, 100),
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
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  rateFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  rateCLS(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  rateFCP(value) {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  rateTTFB(value) {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  // Reporting
  setupReporting() {
    if (this.config.reportingEndpoint) {
      this.reportingTimer = setInterval(() => {
        this.sendReport();
      }, this.config.reportingInterval);
    }
  }

  async sendReport() {
    if (this.buffer.length === 0) return;

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
      
    } catch (error) {
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
      
      keys.slice(10).forEach(key => localStorage.removeItem(key));
      
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to store local report:', error);
    }
  }

  // Public API
  getMetrics() {
    return Array.from(this.metrics.values());
  }

  getWebVitals() {
    const vitals = {};
    
    for (const [key, metric] of this.metrics) {
      if (['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(metric.name)) {
        vitals[metric.name] = metric;
      }
    }
    
    return vitals;
  }

  getSummary() {
    const webVitals = this.getWebVitals();
    const customMetrics = this.getMetrics().filter(m => 
      !['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name)
    );

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
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 50;
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
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configuration
  configure(options) {
    Object.assign(this.config, options);
  }

  // Cleanup
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
}

// Create and export singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}
