/**
 * Performance optimization utilities for flashcard components
 * @description Provides performance monitoring, lazy loading, and optimization utilities
 * @version 1.0.0
 * @updated November 2025
 */

import type { PerformanceMetrics, LazyLoadConfig, MemoryInfo } from '$lib/types/index.js';

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  /**
   * Start timing a performance metric
   */
  startTimer(name: string): void {
    this.metrics.set(`${name}_start`, performance.now());
  }

  /**
   * End timing a performance metric and return duration
   */
  endTimer(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (!startTime) {
      console.warn(`[Performance] No start time found for metric: ${name}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.metrics.set(name, duration);
    this.metrics.delete(`${name}_start`);
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Get a performance metric
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics {
    const result: PerformanceMetrics = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Monitor long tasks
   */
  monitorLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }

  /**
   * Monitor memory usage
   */
  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

/**
 * Lazy loading utility class
 */
export class LazyLoader {
  private loadedItems: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  /**
   * Load a module dynamically with caching
   */
  async loadModule<T>(modulePath: string, cacheKey?: string): Promise<T> {
    const key = cacheKey || modulePath;
    
    if (this.loadedItems.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key) as Promise<T>;
    }

    const loadPromise = import(modulePath);
    this.loadingPromises.set(key, loadPromise);
    
    try {
      const module = await loadPromise;
      this.loadedItems.add(key);
      return module;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  /**
   * Check if a module is loaded
   */
  isLoaded(key: string): boolean {
    return this.loadedItems.has(key);
  }

  /**
   * Preload critical modules
   */
  async preloadModules(modulePaths: string[]): Promise<void> {
    const promises = modulePaths.map(path => this.loadModule(path));
    await Promise.allSettled(promises);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.loadedItems.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Intersection Observer utility for lazy loading
 */
export class LazyIntersectionObserver {
  private observer: IntersectionObserver | null = null;
  private callbacks: Map<Element, () => void> = new Map();

  /**
   * Create intersection observer for lazy loading
   */
  constructor(private config: LazyLoadConfig = {}) {
    this.setupObserver();
  }

  private setupObserver(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('[LazyLoader] IntersectionObserver not supported');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.observer?.unobserve(entry.target);
              this.callbacks.delete(entry.target);
            }
          }
        });
      },
      {
        threshold: this.config.threshold || 0.1,
        rootMargin: this.config.rootMargin || '50px'
      }
    );
  }

  /**
   * Observe an element for lazy loading
   */
  observe(element: Element, callback: () => void): void {
    if (!this.observer) {
      // Fallback: execute immediately
      callback();
      return;
    }

    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  /**
   * Unobserve an element
   */
  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
    this.callbacks.delete(element);
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Store data in cache with TTL
   */
  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Cleanup expired items
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private monitor: PerformanceMonitor;
  private lazyLoader: LazyLoader;
  private memoryManager: MemoryManager;

  private constructor() {
    this.monitor = new PerformanceMonitor();
    this.lazyLoader = new LazyLoader();
    this.memoryManager = MemoryManager.getInstance();
    this.monitor.monitorLongTasks();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Get performance monitor
   */
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  /**
   * Get lazy loader
   */
  getLazyLoader(): LazyLoader {
    return this.lazyLoader;
  }

  /**
   * Get memory manager
   */
  getMemoryManager(): MemoryManager {
    return this.memoryManager;
  }

  /**
   * Optimize image loading
   */
  optimizeImageLoading(img: HTMLImageElement): void {
    // Use loading="lazy" for native lazy loading
    img.loading = 'lazy';
    
    // Add decoding for async loading
    img.decoding = 'async';
    
    // Add error handling
    img.addEventListener('error', () => {
      console.warn('[Performance] Failed to load image:', img.src);
    });
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Request idle callback for non-critical tasks
   */
  requestIdleCallback(callback: () => void, options?: { timeout?: number }): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, options);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(callback, 1);
    }
  }

  /**
   * Check if device is low-end
   */
  isLowEndDevice(): boolean {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for low memory (if available)
    const memory = this.monitor.getMemoryInfo();
    const lowMemory = memory ? memory.totalJSHeapSize < 1000000000 : false; // Less than 1GB
    
    // Check for slow connection
    const slowConnection = 'connection' in navigator && 
      (navigator as any).connection?.effectiveType && 
      ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType);
    
    return prefersReducedMotion || lowMemory || slowConnection;
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.monitor.getAllMetrics();
    const memory = this.monitor.getMemoryInfo();

    // Check render time
    const renderTime = metrics.component_render;
    if (renderTime && renderTime > 100) {
      recommendations.push('Component render time is high. Consider optimizing the component.');
    }

    // Check memory usage
    if (memory) {
      const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        recommendations.push('Memory usage is high. Consider implementing memory cleanup.');
      }
    }

    // Check if low-end device
    if (this.isLowEndDevice()) {
      recommendations.push('Low-end device detected. Consider reducing animations and complex features.');
    }

    return recommendations;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.monitor.cleanup();
    this.lazyLoader.clearCache();
    this.memoryManager.destroy();
  }
}

/**
 * Export singleton instance for easy access
 */
export const performanceOptimizer = PerformanceOptimizer.getInstance();

/**
 * Utility functions for common performance optimizations
 */
export const optimizeComponent = {
  /**
   * Add CSS containment to element
   */
  addContainment(element: HTMLElement, types: 'layout' | 'style' | 'paint' | 'size'[] = ['layout', 'style', 'paint']): void {
    element.style.contain = types.join(' ');
  },

  /**
   * Add will-change hint for animations
   */
  addWillChange(element: HTMLElement, properties: string[]): void {
    element.style.willChange = properties.join(', ');
  },

  /**
   * Remove will-change hint after animation
   */
  removeWillChange(element: HTMLElement): void {
    element.style.willChange = 'auto';
  },

  /**
   * Optimize images in a container
   */
  optimizeImages(container: HTMLElement): void {
    const images = container.querySelectorAll('img');
    images.forEach(img => performanceOptimizer.optimizeImageLoading(img));
  },

  /**
   * Add loading states with skeleton screens
   */
  createSkeleton(width: string, height: string): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton';
    skeleton.style.cssText = `
      width: ${width};
      height: ${height};
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    `;
    return skeleton;
  }
};

// Add loading animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}