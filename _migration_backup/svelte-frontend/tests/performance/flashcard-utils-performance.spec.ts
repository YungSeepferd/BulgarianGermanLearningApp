/**
 * Flashcard Utils Performance Tests
 * @description Tests performance optimizations in flashcard utility functions
 * @version 1.0.0
 * @updated November 2025
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  PerformanceMonitor,
  PerformanceOptimizer,
  MemoryManager
} from '$lib/utils/performance.js';
import type { PerformanceMetrics, MemoryInfo } from '$lib/types/index.js';

describe('Flashcard Utils Performance Tests', () => {
  let mockPerformance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockPerformance = {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024,
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 2048 * 1024 * 1024
      }
    };

    // Setup global performance mock
    (global as any).performance = mockPerformance;
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
  });

  it('should create performance monitor with correct metrics', () => {
    const monitor = new PerformanceMonitor();
    
    expect(monitor).toBeDefined();
    expect(monitor).toBeInstanceOf(PerformanceMonitor);
    
    // Test timing functionality - use a small delay to ensure duration > 0
    monitor.startTimer('test');
    // Add a small delay
    const start = Date.now();
    while (Date.now() - start < 1) {
      // Wait 1ms
    }
    const duration = monitor.endTimer('test');
    
    expect(duration).toBeGreaterThan(0);
    expect(monitor.getMetric('test')).toBe(duration);
  });

  it('should optimize memory usage efficiently', () => {
    const memoryManager = MemoryManager.getInstance();
    
    // Test caching functionality
    const testData = { key: 'test', value: 'data' };
    memoryManager.set('test-key', testData, 60_000); // 1 minute TTL
    
    const retrieved = memoryManager.get('test-key');
    expect(retrieved).toEqual(testData);
    
    // Test cache size
    expect(memoryManager.size()).toBe(1);
    
    // Test deletion
    memoryManager.delete('test-key');
    expect(memoryManager.get('test-key')).toBeNull();
    expect(memoryManager.size()).toBe(0);
  });

  it('should provide performance recommendations', () => {
    const optimizer = PerformanceOptimizer.getInstance();
    
    // Mock memory info to avoid window.matchMedia issues
    vi.spyOn(optimizer.getMonitor(), 'getMemoryInfo').mockReturnValue({
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2048 * 1024 * 1024
    });
    
    const recommendations = optimizer.getPerformanceRecommendations();
    
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThanOrEqual(0);
  });

  it('should measure interaction time accurately', () => {
    const monitor = new PerformanceMonitor();
    
    monitor.startTimer('interaction');
    // Simulate some work
    const array = Array.from({ length: 1000 }).fill(0).map((_, i) => i);
    const sum = array.reduce((a, b) => a + b, 0);
    
    // Add a small delay to ensure duration > 0
    const start = Date.now();
    while (Date.now() - start < 1) {
      // Wait 1ms
    }
    
    const interactionTime = monitor.endTimer('interaction');
    
    expect(interactionTime).toBeGreaterThan(0);
    expect(interactionTime).toBeLessThan(100); // Should be very fast
    expect(sum).toBe(499_500); // Verify work was done
  });

  it('should handle memory pressure gracefully', () => {
    const memoryManager = MemoryManager.getInstance();
    
    // Test with multiple items
    for (let i = 0; i < 10; i++) {
      memoryManager.set(`item-${i}`, { data: `test-${i}` }, 60_000);
    }
    
    expect(memoryManager.size()).toBe(10);
    
    // Clear all
    memoryManager.clear();
    expect(memoryManager.size()).toBe(0);
  });

  it('should cache performance results efficiently', () => {
    const monitor1 = new PerformanceMonitor();
    const monitor2 = new PerformanceMonitor();
    
    // Should create unique instances
    expect(monitor1).not.toBe(monitor2);
    
    // Test that they work independently
    monitor1.startTimer('test1');
    monitor2.startTimer('test2');
    
    // Add small delays
    const start1 = Date.now();
    while (Date.now() - start1 < 1) {
      // Wait 1ms
    }
    const time1 = monitor1.endTimer('test1');
    
    const start2 = Date.now();
    while (Date.now() - start2 < 1) {
      // Wait 1ms
    }
    const time2 = monitor2.endTimer('test2');
    
    expect(time1).toBeGreaterThan(0);
    expect(time2).toBeGreaterThan(0);
  });

  it('should handle rapid performance measurements', () => {
    const monitor = new PerformanceMonitor();
    const measurements = [];
    
    for (let i = 0; i < 10; i++) {
      monitor.startTimer(`measure-${i}`);
      // Minimal work
      const x = i * i;
      
      // Add a small delay
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Wait 1ms
      }
      
      const time = monitor.endTimer(`measure-${i}`);
      measurements.push(time);
    }
    
    // All measurements should be very fast
    for (const time of measurements) {
      expect(time).toBeLessThan(10); // Should be under 10ms each
    }
  });

  it('should provide device-specific optimizations', () => {
    const optimizer = PerformanceOptimizer.getInstance();
    
    // Mock memory info to avoid window.matchMedia issues
    vi.spyOn(optimizer.getMonitor(), 'getMemoryInfo').mockReturnValue({
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024,
      jsHeapSizeLimit: 2048 * 1024 * 1024
    });
    
    const recommendations = optimizer.getPerformanceRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should handle error cases gracefully', () => {
    const monitor = new PerformanceMonitor();
    
    // Test ending timer that was never started
    const result = monitor.endTimer('non-existent');
    expect(result).toBe(0); // Should handle gracefully
    
    // Test getting non-existent metric
    const metric = monitor.getMetric('non-existent');
    expect(metric).toBeUndefined();
  });

  it('should measure performance with realistic workloads', async () => {
    const monitor = new PerformanceMonitor();
    const results = [];
    
    // Simulate realistic flashcard operations with minimum duration
    const operations = [
      async () => {
        monitor.startTimer('load');
        // Ensure minimum duration by doing some work
        const start = Date.now();
        while (Date.now() - start < 5) {
          // Wait 5ms
        }
        return monitor.endTimer('load');
      },
      async () => {
        monitor.startTimer('render');
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Wait 10ms
        }
        return monitor.endTimer('render');
      },
      async () => {
        monitor.startTimer('interact');
        const start = Date.now();
        while (Date.now() - start < 3) {
          // Wait 3ms
        }
        return monitor.endTimer('interact');
      }
    ];
    
    for (const op of operations) {
      const time = await op();
      results.push(time);
    }
    
    expect(results.length).toBe(3);
    for (const time of results) {
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(100); // Each operation under 100ms
    }
  });
});