/**
 * Virtual Scrolling Utilities
 * @file utils/virtual-scrolling.ts
 * @description Utility functions for virtual scrolling implementation
 * @version 1.0.0
 * @updated November 2025
 */

import type { VocabularyItem } from '../types';
import type { PerformanceMetrics, DeviceCapabilities } from '../types';

/**
 * Virtual scrolling configuration interface
 * @interface VirtualScrollingConfig
 */
export interface VirtualScrollingConfig {
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of items to render outside viewport for smooth scrolling */
  overscan: number;
  /** Minimum number of items to enable virtual scrolling */
  threshold: number;
  /** Whether virtual scrolling is enabled */
  enabled: boolean;
  /** Whether to auto-detect item heights */
  autoDetectHeight: boolean;
  /** Performance monitoring options */
  performanceMonitoring: boolean;
}

/**
 * Virtual scrolling state interface
 * @interface VirtualScrollingState
 */
export interface VirtualScrollingState {
  /** Current scroll position */
  scrollTop: number;
  /** Container height */
  containerHeight: number;
  /** Start index of visible range */
  startIndex: number;
  /** End index of visible range */
  endIndex: number;
  /** Total number of items */
  totalItems: number;
  /** Measured heights of items */
  measuredHeights: Map<number, number>;
  /** Performance metrics */
  performance: PerformanceMetrics;
}

/**
 * Virtual scrolling result interface
 * @interface VirtualScrollingResult
 */
export interface VirtualScrollingResult {
  /** Items to render */
  items: VocabularyItem[];
  /** Start index of rendered items */
  startIndex: number;
  /** End index of rendered items */
  endIndex: number;
  /** Transform offset for positioning */
  transformOffset: number;
  /** Total height of the virtual list */
  totalHeight: number;
  /** Performance metrics */
  performance: PerformanceMetrics;
}

/**
 * Default virtual scrolling configuration
 * @constant DEFAULT_VIRTUAL_SCROLLING_CONFIG
 */
export const DEFAULT_VIRTUAL_SCROLLING_CONFIG: VirtualScrollingConfig = {
  itemHeight: 80,
  overscan: 5,
  threshold: 100,
  enabled: true,
  autoDetectHeight: false,
  performanceMonitoring: true
};

/**
 * Calculate visible range based on scroll position and container height
 * @function calculateVisibleRange
 * @param {number} scrollTop - Current scroll position
 * @param {number} containerHeight - Container height
 * @param {number} totalItems - Total number of items
 * @param {Map<number, number>} measuredHeights - Measured item heights
 * @param {VirtualScrollingConfig} config - Configuration
 * @returns {Object} Visible range { start: number, end: number }
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  totalItems: number,
  measuredHeights: Map<number, number>,
  config: VirtualScrollingConfig
): { start: number; end: number } {
  if (totalItems === 0) {
    return { start: 0, end: 0 };
  }

  if (!config.enabled || totalItems <= config.threshold) {
    return { start: 0, end: totalItems };
  }

  // Calculate start index
  let startIndex = 0;
  let accumulatedHeight = 0;
  
  for (let i = 0; i < totalItems; i++) {
    const itemHeight = measuredHeights.get(i) || config.itemHeight;
    if (accumulatedHeight + itemHeight > scrollTop) {
      startIndex = i;
      break;
    }
    accumulatedHeight += itemHeight;
  }

  // Calculate end index
  let endIndex = startIndex;
  accumulatedHeight = 0;
  
  for (let i = startIndex; i < totalItems; i++) {
    const itemHeight = measuredHeights.get(i) || config.itemHeight;
    accumulatedHeight += itemHeight;
    if (accumulatedHeight >= containerHeight) {
      endIndex = i + 1;
      break;
    }
  }

  // Ensure we have at least one item visible
  if (endIndex <= startIndex) {
    endIndex = Math.min(totalItems, startIndex + 1);
  }

  return { start: startIndex, end: endIndex };
}

/**
 * Calculate total height of the virtual list
 * @function calculateTotalHeight
 * @param {number} totalItems - Total number of items
 * @param {Map<number, number>} measuredHeights - Measured item heights
 * @param {VirtualScrollingConfig} config - Configuration
 * @returns {number} Total height in pixels
 */
export function calculateTotalHeight(
  totalItems: number,
  measuredHeights: Map<number, number>,
  config: VirtualScrollingConfig
): number {
  if (totalItems === 0) {
    return 0;
  }

  if (!config.enabled || totalItems <= config.threshold) {
    return totalItems * config.itemHeight;
  }

  let height = 0;
  for (let i = 0; i < totalItems; i++) {
    height += measuredHeights.get(i) || config.itemHeight;
  }
  return height;
}

/**
 * Calculate transform offset for positioning the virtual window
 * @function calculateTransformOffset
 * @param {number} startIndex - Start index of visible range
 * @param {Map<number, number>} measuredHeights - Measured item heights
 * @param {VirtualScrollingConfig} config - Configuration
 * @returns {number} Transform offset in pixels
 */
export function calculateTransformOffset(
  startIndex: number,
  measuredHeights: Map<number, number>,
  config: VirtualScrollingConfig
): number {
  let offset = 0;
  for (let i = 0; i < startIndex; i++) {
    offset += measuredHeights.get(i) || config.itemHeight;
  }
  return offset;
}

/**
 * Get items to render with overscan
 * @function getItemsToRender
 * @param {VocabularyItem[]} items - All items
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @param {number} overscan - Number of items to overscan
 * @param {boolean} enabled - Whether virtual scrolling is enabled
 * @param {number} threshold - Threshold for enabling virtual scrolling
 * @returns {VocabularyItem[]} Items to render
 */
export function getItemsToRender(
  items: VocabularyItem[],
  startIndex: number,
  endIndex: number,
  overscan: number,
  enabled: boolean,
  threshold: number
): VocabularyItem[] {
  if (!enabled || items.length <= threshold) {
    return items;
  }

  const start = Math.max(0, startIndex - overscan);
  const end = Math.min(items.length, endIndex + overscan);
  
  return items.slice(start, end);
}

/**
 * Measure item heights from DOM elements
 * @function measureItemHeights
 * @param {HTMLElement} container - Container element
 * @param {Map<number, number>} measuredHeights - Map to store measured heights
 * @returns {Promise<void>}
 */
export async function measureItemHeights(
  container: HTMLElement,
  measuredHeights: Map<number, number>
): Promise<void> {
  if (!container) return;

  const itemsToMeasure = Array.from(container.querySelectorAll('[data-index]'));
  
  for (const item of itemsToMeasure) {
    const index = parseInt(item.getAttribute('data-index') || '0');
    const height = (item as HTMLElement).getBoundingClientRect().height;
    
    if (height > 0) {
      measuredHeights.set(index, height);
    }
  }
}

/**
 * Create performance metrics for virtual scrolling
 * @function createPerformanceMetrics
 * @param {number} loadTime - Load time in milliseconds
 * @param {number} renderTime - Render time in milliseconds
 * @param {number} memoryUsage - Memory usage in bytes
 * @returns {PerformanceMetrics} Performance metrics
 */
export function createPerformanceMetrics(
  loadTime: number = 0,
  renderTime: number = 0,
  memoryUsage: number = 0
): PerformanceMetrics {
  return {
    loadTime,
    renderTime,
    memoryUsage,
    cacheHitRate: 0,
    networkRequests: 0,
    errorCount: 0
  };
}

/**
 * Update performance metrics
 * @function updatePerformanceMetrics
 * @param {PerformanceMetrics} current - Current metrics
 * @param {Partial<PerformanceMetrics>} updates - Updates to apply
 * @returns {PerformanceMetrics} Updated metrics
 */
export function updatePerformanceMetrics(
  current: PerformanceMetrics,
  updates: Partial<PerformanceMetrics>
): PerformanceMetrics {
  return { ...current, ...updates };
}

/**
 * Check if virtual scrolling should be enabled based on device capabilities
 * @function shouldEnableVirtualScrolling
 * @param {DeviceCapabilities} device - Device capabilities
 * @param {number} itemCount - Number of items
 * @param {number} threshold - Threshold for enabling
 * @returns {boolean} Whether virtual scrolling should be enabled
 */
export function shouldEnableVirtualScrolling(
  device: DeviceCapabilities,
  itemCount: number,
  threshold: number = DEFAULT_VIRTUAL_SCROLLING_CONFIG.threshold
): boolean {
  // Always enable for large datasets
  if (itemCount > threshold * 2) {
    return true;
  }

  // Disable for low-end devices with small datasets
  if (itemCount <= threshold) {
    return false;
  }

  // Check device capabilities
  const isLowEndDevice = 
    device.memory < 4000000000 || // Less than 4GB RAM
    device.cores < 4 || // Less than 4 cores
    (device.connection && (
      device.connection.effectiveType === '2g' ||
      device.connection.downlink < 1 // Less than 1 Mbps
    ));

  return !isLowEndDevice;
}

/**
 * Optimize virtual scrolling configuration for device
 * @function optimizeConfigForDevice
 * @param {VirtualScrollingConfig} config - Base configuration
 * @param {DeviceCapabilities} device - Device capabilities
 * @returns {VirtualScrollingConfig} Optimized configuration
 */
export function optimizeConfigForDevice(
  config: VirtualScrollingConfig,
  device: DeviceCapabilities
): VirtualScrollingConfig {
  const optimized = { ...config };

  // Reduce overscan for low-end devices
  if (device.memory < 4000000000 || device.cores < 4) {
    optimized.overscan = Math.max(2, config.overscan - 2);
  }

  // Disable auto-height detection for low-end devices
  if (device.memory < 2000000000) {
    optimized.autoDetectHeight = false;
  }

  // Reduce performance monitoring for very low-end devices
  if (device.memory < 1000000000) {
    optimized.performanceMonitoring = false;
  }

  return optimized;
}

/**
 * Create a virtual scrolling manager
 * @class VirtualScrollingManager
 */
export class VirtualScrollingManager {
  private config: VirtualScrollingConfig;
  private state: VirtualScrollingState;
  private items: VocabularyItem[];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(
    items: VocabularyItem[] = [],
    config: VirtualScrollingConfig = DEFAULT_VIRTUAL_SCROLLING_CONFIG
  ) {
    this.items = items;
    this.config = config;
    this.state = {
      scrollTop: 0,
      containerHeight: 0,
      startIndex: 0,
      endIndex: 0,
      totalItems: items.length,
      measuredHeights: new Map(),
      performance: createPerformanceMetrics()
    };
  }

  /**
   * Update scroll position
   * @method updateScrollPosition
   * @param {number} scrollTop - New scroll position
   */
  updateScrollPosition(scrollTop: number): void {
    this.state.scrollTop = scrollTop;
    this.calculateVisibleRange();
  }

  /**
   * Update container height
   * @method updateContainerHeight
   * @param {number} containerHeight - New container height
   */
  updateContainerHeight(containerHeight: number): void {
    this.state.containerHeight = containerHeight;
    this.calculateVisibleRange();
  }

  /**
   * Update items
   * @method updateItems
   * @param {VocabularyItem[]} items - New items
   */
  updateItems(items: VocabularyItem[]): void {
    this.items = items;
    this.state.totalItems = items.length;
    this.state.measuredHeights.clear();
    this.calculateVisibleRange();
  }

  /**
   * Calculate visible range
   * @method calculateVisibleRange
   */
  private calculateVisibleRange(): void {
    const { scrollTop, containerHeight, totalItems, measuredHeights } = this.state;
    
    const range = calculateVisibleRange(
      scrollTop,
      containerHeight,
      totalItems,
      measuredHeights,
      this.config
    );
    
    this.state.startIndex = range.start;
    this.state.endIndex = range.end;
  }

  /**
   * Get current virtual scrolling result
   * @method getResult
   * @returns {VirtualScrollingResult} Virtual scrolling result
   */
  getResult(): VirtualScrollingResult {
    const { startIndex, endIndex, measuredHeights, totalItems } = this.state;
    
    const itemsToRender = getItemsToRender(
      this.items,
      startIndex,
      endIndex,
      this.config.overscan,
      this.config.enabled,
      this.config.threshold
    );

    const totalHeight = calculateTotalHeight(
      totalItems,
      measuredHeights,
      this.config
    );

    const transformOffset = calculateTransformOffset(
      startIndex,
      measuredHeights,
      this.config
    );

    return {
      items: itemsToRender,
      startIndex,
      endIndex,
      transformOffset,
      totalHeight,
      performance: this.state.performance
    };
  }

  /**
   * Measure item heights
   * @method measureItemHeights
   * @param {HTMLElement} container - Container element
   * @returns {Promise<void>}
   */
  async measureItemHeights(container: HTMLElement): Promise<void> {
    if (!this.config.autoDetectHeight) return;
    
    await measureItemHeights(container, this.state.measuredHeights);
    this.calculateVisibleRange();
  }

  /**
   * Set up resize observer
   * @method setupResizeObserver
   * @param {HTMLElement} container - Container element
   * @param {Function} callback - Callback function
   */
  setupResizeObserver(container: HTMLElement, callback: () => void): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateContainerHeight(container.clientHeight);
      callback();
    });

    this.resizeObserver.observe(container);
  }

  /**
   * Set up intersection observer
   * @method setupIntersectionObserver
   * @param {HTMLElement} container - Container element
   * @param {Function} callback - Callback function
   */
  setupIntersectionObserver(container: HTMLElement, callback: () => void): void {
    if (!this.config.autoDetectHeight) return;

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callback();
          }
        }
      },
      {
        root: container,
        threshold: 0.1
      }
    );
  }

  /**
   * Clean up observers
   * @method cleanup
   */
  cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  /**
   * Get current state
   * @method getState
   * @returns {VirtualScrollingState} Current state
   */
  getState(): VirtualScrollingState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   * @method getConfig
   * @returns {VirtualScrollingConfig} Current configuration
   */
  getConfig(): VirtualScrollingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @method updateConfig
   * @param {Partial<VirtualScrollingConfig>} updates - Configuration updates
   */
  updateConfig(updates: Partial<VirtualScrollingConfig>): void {
    this.config = { ...this.config, ...updates };
    this.calculateVisibleRange();
  }
}

// Export utility functions and classes
export {
  calculateVisibleRange,
  calculateTotalHeight,
  calculateTransformOffset,
  getItemsToRender,
  measureItemHeights,
  createPerformanceMetrics,
  updatePerformanceMetrics,
  shouldEnableVirtualScrolling,
  optimizeConfigForDevice,
  VirtualScrollingManager
};