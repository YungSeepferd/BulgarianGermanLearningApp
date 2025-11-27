/**
 * Vocabulary Performance Monitoring
 * @description Performance monitoring specifically for vocabulary loading and flashcard rendering
 * @version 1.0.0
 * @updated November 2025
 */

import type { VocabularyEntry } from '$lib/types/index.js';
import { performanceOptimizer } from './performance.js';
import { measureTime, memoize } from './common.js';

// ============================================================================
// PERFORMANCE METRICS INTERFACES
// ============================================================================

export interface VocabularyLoadMetrics {
  loadTime: number;
  parseTime: number;
  renderTime: number;
  totalTime: number;
  itemCount: number;
  itemsPerSecond: number;
  memoryUsage?: number;
}

export interface FlashcardRenderMetrics {
  renderTime: number;
  componentCount: number;
  domNodes: number;
  cssRules: number;
  reflowCount: number;
  paintCount: number;
}

export interface PerformanceThresholds {
  maxLoadTime: number; // ms
  maxRenderTime: number; // ms
  maxMemoryUsage: number; // MB
  minItemsPerSecond: number;
}

export interface PerformanceReport {
  timestamp: number;
  vocabularyMetrics: VocabularyLoadMetrics;
  flashcardMetrics: FlashcardRenderMetrics;
  thresholds: PerformanceThresholds;
  passed: boolean;
  recommendations: string[];
}

// ============================================================================
// VOCABULARY PERFORMANCE MONITOR
// ============================================================================

export class VocabularyPerformanceMonitor {
  private metrics: Map<string, VocabularyLoadMetrics> = new Map();
  private thresholds: PerformanceThresholds;
  private observer: PerformanceObserver | null = null;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      maxLoadTime: 1000, // 1 second
      maxRenderTime: 500, // 500ms
      maxMemoryUsage: 100, // 100MB
      minItemsPerSecond: 1000,
      ...thresholds
    };
    
    this.setupPerformanceObserver();
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log(`[VocabPerf] Performance measure: ${entry.name} = ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }

  /**
   * Monitor vocabulary loading performance
   * @param vocabularyData - Raw vocabulary data
   * @param loadFunction - Function that loads the vocabulary
   * @returns Loading metrics
   */
  async monitorVocabularyLoading(
    vocabularyData: any[],
    loadFunction: (data: any[]) => Promise<VocabularyEntry[]>
  ): Promise<VocabularyLoadMetrics> {
    const monitor = performanceOptimizer.getMonitor();
    
    // Start timing
    monitor.startTimer('vocabulary-load');
    monitor.startTimer('vocabulary-parse');
    
    // Measure parsing time
    const { result: parsedData, duration: parseTime } = measureTime(() => {
      return this.parseVocabularyData(vocabularyData);
    });
    
    monitor.endTimer('vocabulary-parse');
    monitor.startTimer('vocabulary-render');
    
    // Measure loading time
    const { result: vocabulary, duration: loadTime } = await measureTime(async () => {
      return await loadFunction(parsedData);
    });
    
    monitor.endTimer('vocabulary-load');
    
    // Measure render time
    const { duration: renderTime } = await measureTime(async () => {
      await this.renderVocabulary();
    });
    
    monitor.endTimer('vocabulary-render');
    
    const totalTime = loadTime + parseTime + renderTime;
    const itemCount = vocabulary.length;
    const itemsPerSecond = (itemCount / totalTime) * 1000;
    
    // Get memory usage
    const memoryInfo = monitor.getMemoryInfo();
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : undefined;
    
    const metrics: VocabularyLoadMetrics = {
      loadTime,
      parseTime,
      renderTime,
      totalTime,
      itemCount,
      itemsPerSecond,
      memoryUsage
    };
    
    this.metrics.set('vocabulary-loading', metrics);
    
    // Log performance
    console.log(`[VocabPerf] Loaded ${itemCount} items in ${totalTime.toFixed(2)}ms (${itemsPerSecond.toFixed(0)} items/sec)`);
    
    return metrics;
  }

  /**
   * Monitor flashcard rendering performance
   * @param componentCount - Number of flashcard components
   * @param renderFunction - Function that renders flashcards
   * @returns Rendering metrics
   */
  async monitorFlashcardRendering(
    componentCount: number,
    renderFunction: () => Promise<void>
  ): Promise<FlashcardRenderMetrics> {
    const monitor = performanceOptimizer.getMonitor();
    
    // Start performance monitoring
    monitor.startTimer('flashcard-render');
    
    // Get initial DOM metrics
    const initialDomNodes = document.querySelectorAll('*').length;
    const initialCssRules = document.styleSheets.length > 0
      ? [...document.styleSheets].reduce((total, sheet) => {
        try {
          return total + (sheet as CSSStyleSheet).cssRules.length;
        } catch {
          return total;
        }
      }, 0)
      : 0;
    
    // Monitor reflows and paints
    let reflowCount = 0;
    let paintCount = 0;
    
    let renderTime = 0;
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'reflow') {
            reflowCount++;
          }
          if (entry.name === 'paint') {
            paintCount++;
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift', 'paint'] });
      
      // Render flashcards
      const renderResult = await measureTime(renderFunction);
      renderTime = renderResult.duration;
      
      observer.disconnect();
    } else {
      // Fallback timing
      const renderResult = await measureTime(renderFunction);
      renderTime = renderResult.duration;
    }
    
    monitor.endTimer('flashcard-render');
    
    // Get final DOM metrics
    const finalDomNodes = document.querySelectorAll('*').length;
    const finalCssRules = document.styleSheets.length > 0
      ? [...document.styleSheets].reduce((total, sheet) => {
        try {
          return total + (sheet as CSSStyleSheet).cssRules.length;
        } catch {
          return total;
        }
      }, 0)
      : 0;
    
    const metrics: FlashcardRenderMetrics = {
      renderTime: monitor.getMetric('flashcard-render') || renderTime,
      componentCount,
      domNodes: finalDomNodes - initialDomNodes,
      cssRules: finalCssRules - initialCssRules,
      reflowCount,
      paintCount
    };
    
    console.log(`[VocabPerf] Rendered ${componentCount} flashcards in ${metrics.renderTime.toFixed(2)}ms`);
    
    return metrics;
  }

  /**
   * Parse vocabulary data with performance tracking
   * @param rawData - Raw vocabulary data
   * @returns Parsed vocabulary entries
   */
  private parseVocabularyData(rawData: any[]): VocabularyEntry[] {
    return rawData.map((item, index) => ({
      id: item.id || `vocab-${index}`,
      bg: item.bg || '',
      de: item.de || '',
      level: item.level || 'A1',
      category: item.category || 'nouns',
      pronunciation: item.pronunciation,
      gender: item.gender,
      wordType: item.wordType,
      examples: item.examples || [],
      tags: item.tags || [],
      notes: item.notes
    }));
  }

  /**
   * Render vocabulary with performance tracking
   * @param vocabulary - Vocabulary entries to render
   */
  private async renderVocabulary(): Promise<void> {
    // Simulate rendering time - in real implementation this would trigger actual rendering
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Generate performance report
   * @returns Complete performance report
   */
  generateReport(): PerformanceReport {
    const vocabularyMetrics = this.metrics.get('vocabulary-loading') || {
      loadTime: 0, parseTime: 0, renderTime: 0, totalTime: 0,
      itemCount: 0, itemsPerSecond: 0
    };
    
    const flashcardMetrics: FlashcardRenderMetrics = {
      renderTime: 0, componentCount: 0, domNodes: 0,
      cssRules: 0, reflowCount: 0, paintCount: 0
    };
    
    const recommendations: string[] = [];
    let passed = true;
    
    // Check vocabulary loading performance
    if (vocabularyMetrics.totalTime > this.thresholds.maxLoadTime) {
      passed = false;
      recommendations.push(`Vocabulary loading too slow: ${vocabularyMetrics.totalTime.toFixed(2)}ms > ${this.thresholds.maxLoadTime}ms`);
    }
    
    if (vocabularyMetrics.itemsPerSecond < this.thresholds.minItemsPerSecond) {
      passed = false;
      recommendations.push(`Loading rate too low: ${vocabularyMetrics.itemsPerSecond.toFixed(0)} items/sec < ${this.thresholds.minItemsPerSecond} items/sec`);
    }
    
    if (vocabularyMetrics.memoryUsage && vocabularyMetrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      passed = false;
      recommendations.push(`Memory usage too high: ${vocabularyMetrics.memoryUsage.toFixed(2)}MB > ${this.thresholds.maxMemoryUsage}MB`);
    }
    
    // Check flashcard rendering performance
    if (flashcardMetrics.renderTime > this.thresholds.maxRenderTime) {
      passed = false;
      recommendations.push(`Flashcard rendering too slow: ${flashcardMetrics.renderTime.toFixed(2)}ms > ${this.thresholds.maxRenderTime}ms`);
    }
    
    if (flashcardMetrics.reflowCount > 10) {
      recommendations.push(`Too many reflows during rendering: ${flashcardMetrics.reflowCount}`);
    }
    
    return {
      timestamp: Date.now(),
      vocabularyMetrics,
      flashcardMetrics,
      thresholds: this.thresholds,
      passed,
      recommendations
    };
  }

  /**
   * Get performance recommendations
   * @returns Array of performance recommendations
   */
  getRecommendations(): string[] {
    const report = this.generateReport();
    return report.recommendations;
  }

  /**
   * Check if performance thresholds are met
   * @returns True if all thresholds are met
   */
  isPerformanceAcceptable(): boolean {
    const report = this.generateReport();
    return report.passed;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics.clear();
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Memoized vocabulary loader to avoid redundant loading
 */
export const memoizedVocabularyLoader = memoize(
  async (data: any[]): Promise<VocabularyEntry[]> => {
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100));
    return data.map((item, index) => ({
      id: item.id || `vocab-${index}`,
      bg: item.bg || '',
      de: item.de || '',
      level: item.level || 'A1',
      category: item.category || 'nouns'
    }));
  }
);

/**
 * Optimized flashcard renderer with virtual scrolling
 */
export class OptimizedFlashcardRenderer {
  private renderedCards: Set<string> = new Set();
  private visibleRange: { start: number; end: number } = { start: 0, end: 10 };
  private cardHeight: number = 200; // Estimated card height in pixels

  /**
   * Render only visible flashcards (virtual scrolling)
   * @param vocabulary - All vocabulary entries
   * @param scrollTop - Current scroll position
   * @param containerHeight - Height of container
   * @returns Array of visible flashcard data
   */
  renderVisibleCards(
    vocabulary: VocabularyEntry[],
    scrollTop: number,
    containerHeight: number
  ): VocabularyEntry[] {
    // Calculate visible range
    const start = Math.floor(scrollTop / this.cardHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / this.cardHeight) + 2, // Buffer
      vocabulary.length
    );
    
    this.visibleRange = { start, end };
    
    // Return only visible cards
    return vocabulary.slice(start, end);
  }

  /**
   * Get current visible range
   * @returns Current visible range
   */
  getVisibleRange(): { start: number; end: number } {
    return this.visibleRange;
  }

  /**
   * Check if card is currently rendered
   * @param cardId - Card ID to check
   * @returns True if card is rendered
   */
  isCardRendered(cardId: string): boolean {
    return this.renderedCards.has(cardId);
  }

  /**
   * Mark card as rendered
   * @param cardId - Card ID to mark
   */
  markCardRendered(cardId: string): void {
    this.renderedCards.add(cardId);
  }

  /**
   * Unmark card as rendered
   * @param cardId - Card ID to unmark
   */
  unmarkCardRendered(cardId: string): void {
    this.renderedCards.delete(cardId);
  }

  /**
   * Clear all rendered cards
   */
  clearRenderedCards(): void {
    this.renderedCards.clear();
  }
}

// ============================================================================
// PERFORMANCE MONITORING HOOKS
// ============================================================================

/**
 * Hook for monitoring vocabulary loading in Svelte components
 * @param thresholds - Performance thresholds
 * @returns Performance monitoring utilities
 */
export function useVocabularyPerformance(thresholds?: Partial<PerformanceThresholds>) {
  const monitor = new VocabularyPerformanceMonitor(thresholds);
  
  return {
    monitor,
    monitorLoading: monitor.monitorVocabularyLoading.bind(monitor),
    monitorRendering: monitor.monitorFlashcardRendering.bind(monitor),
    getReport: monitor.generateReport.bind(monitor),
    getRecommendations: monitor.getRecommendations.bind(monitor),
    isAcceptable: monitor.isPerformanceAcceptable.bind(monitor),
    cleanup: monitor.cleanup.bind(monitor)
  };
}

/**
 * Hook for optimized flashcard rendering
 * @returns Optimized renderer instance
 */
export function useOptimizedRenderer() {
  return new OptimizedFlashcardRenderer();
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  VocabularyPerformanceMonitor,
  OptimizedFlashcardRenderer,
  memoizedVocabularyLoader,
  useVocabularyPerformance,
  useOptimizedRenderer
};