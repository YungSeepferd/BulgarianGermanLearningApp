<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import type { VocabularyItem } from '../types';
  import type { PerformanceMetrics, DeviceCapabilities } from '../types';

  export interface VirtualListProps {
    items: VocabularyItem[];
    itemHeight?: number;
    overscan?: number;
    threshold?: number;
    enabled?: boolean;
    containerClass?: string;
    itemClass?: string;
    renderItem?: (item: VocabularyItem, index: number) => string;
    autoDetectHeight?: boolean;
  }

  // Default props
  const defaultProps: Required<Omit<VirtualListProps, 'items'>> = {
    itemHeight: 80,
    overscan: 5,
    threshold: 100,
    enabled: true,
    containerClass: 'virtual-list-container',
    itemClass: 'virtual-list-item',
    renderItem: (item: VocabularyItem, index: number) => `
      <div class="vocab-item" data-index="${index}" data-id="${item.id}">
        <div class="vocab-word">${item.word}</div>
        <div class="vocab-translation">${item.translation}</div>
        <div class="vocab-meta">
          <span class="vocab-level">${item.level}</span>
          <span class="vocab-category">${item.category}</span>
        </div>
      </div>
    `,
    autoDetectHeight: false
  };

  // Export props for TypeScript
  export let items: VocabularyItem[] = [];
  export let itemHeight: number = defaultProps.itemHeight;
  export let overscan: number = defaultProps.overscan;
  export let threshold: number = defaultProps.threshold;
  export let enabled: boolean = defaultProps.enabled;
  export let containerClass: string = defaultProps.containerClass;
  export let itemClass: string = defaultProps.itemClass;
  export let renderItem: (item: VocabularyItem, index: number) => string = defaultProps.renderItem;
  export let autoDetectHeight: boolean = defaultProps.autoDetectHeight;

  // Internal state
  let container: HTMLElement;
  let scrollTop = 0;
  let containerHeight = 0;
  let measuredHeights = new Map<number, number>();
  let resizeObserver: ResizeObserver;
  let intersectionObserver: IntersectionObserver;

  // Stores for reactive state
  const visibleRange = writable({ start: 0, end: 0 });
  const totalHeight = writable(0);
  const performanceMetrics = writable<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    networkRequests: 0,
    errorCount: 0
  });

  // Derived stores
  const visibleItems = derived(
    [visibleRange, $ => items],
    ([range, items]) => {
      if (!enabled || items.length <= threshold) {
        return items.map((item, index) => ({ item, index, visible: true }));
      }

      const start = Math.max(0, range.start - overscan);
      const end = Math.min(items.length, range.end + overscan);
      
      return items.slice(start, end).map((item, relativeIndex) => ({
        item,
        index: start + relativeIndex,
        visible: true
      }));
    }
  );

  const transformOffset = derived(
    [visibleRange, $ => items, $ => itemHeight, $ => measuredHeights],
    ([range, items, height, measured]) => {
      if (!enabled || items.length <= threshold) {
        return 0;
      }

      let offset = 0;
      for (let i = 0; i < range.start; i++) {
        offset += measured.get(i) || height;
      }
      return offset;
    }
  );

  // Performance monitoring
  let loadStartTime = 0;
  let renderStartTime = 0;

  /**
   * Calculate visible range based on scroll position
   */
  function calculateVisibleRange(): { start: number; end: number } {
    if (!container || items.length === 0) {
      return { start: 0, end: 0 };
    }

    const scrollPosition = scrollTop;
    const viewportHeight = containerHeight;
    
    if (!enabled || items.length <= threshold) {
      return { start: 0, end: items.length };
    }

    // Calculate start index
    let startIndex = 0;
    let accumulatedHeight = 0;
    
    for (let i = 0; i < items.length; i++) {
      const itemHeight = measuredHeights.get(i) || defaultProps.itemHeight;
      if (accumulatedHeight + itemHeight > scrollPosition) {
        startIndex = i;
        break;
      }
      accumulatedHeight += itemHeight;
    }

    // Calculate end index
    let endIndex = startIndex;
    accumulatedHeight = 0;
    
    for (let i = startIndex; i < items.length; i++) {
      const itemHeight = measuredHeights.get(i) || defaultProps.itemHeight;
      accumulatedHeight += itemHeight;
      if (accumulatedHeight >= viewportHeight) {
        endIndex = i + 1;
        break;
      }
    }

    // Ensure we have at least one item visible
    if (endIndex <= startIndex) {
      endIndex = Math.min(items.length, startIndex + 1);
    }

    return { start: startIndex, end: endIndex };
  }

  /**
   * Measure item heights if auto-detection is enabled
   */
  async function measureItemHeights(): Promise<void> {
    if (!autoDetectHeight || !container) return;

    const itemsToMeasure = Array.from(container.querySelectorAll('.virtual-list-item'));
    
    for (const item of itemsToMeasure) {
      const index = parseInt(item.getAttribute('data-index') || '0');
      const height = item.getBoundingClientRect().height;
      
      if (height > 0) {
        measuredHeights.set(index, height);
      }
    }

    // Recalculate total height
    updateTotalHeight();
  }

  /**
   * Update total height of the virtual list
   */
  function updateTotalHeight(): void {
    if (items.length === 0) {
      totalHeight.set(0);
      return;
    }

    if (!enabled || items.length <= threshold) {
      totalHeight.set(items.length * itemHeight);
      return;
    }

    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += measuredHeights.get(i) || itemHeight;
    }
    totalHeight.set(height);
  }

  /**
   * Handle scroll events
   */
  function handleScroll(): void {
    if (!container) return;

    scrollTop = container.scrollTop;
    containerHeight = container.clientHeight;
    
    const newRange = calculateVisibleRange();
    visibleRange.set(newRange);

    // Performance monitoring
    const now = performance.now();
    performanceMetrics.update(metrics => ({
      ...metrics,
      renderTime: now - renderStartTime
    }));
    renderStartTime = now;
  }

  /**
   * Handle resize events
   */
  function handleResize(): void {
    if (!container) return;

    containerHeight = container.clientHeight;
    const newRange = calculateVisibleRange();
    visibleRange.set(newRange);
  }

  /**
   * Handle intersection observer callback
   */
  function handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting && autoDetectHeight) {
        measureItemHeights();
      }
    }
  }

  // Lifecycle
  onMount(async () => {
    if (!container) return;

    loadStartTime = performance.now();
    
    // Initial measurements
    containerHeight = container.clientHeight;
    scrollTop = container.scrollTop;
    
    // Set up resize observer
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Set up intersection observer for auto-height detection
    if (autoDetectHeight) {
      intersectionObserver = new IntersectionObserver(handleIntersection, {
        root: container,
        threshold: 0.1
      });
    }

    // Initial calculation
    const initialRange = calculateVisibleRange();
    visibleRange.set(initialRange);
    updateTotalHeight();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initial height measurement on next tick
    await tick();
    if (autoDetectHeight) {
      measureItemHeights();
    }

    // Record load time
    const loadTime = performance.now() - loadStartTime;
    performanceMetrics.set({
      loadTime,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      networkRequests: 0,
      errorCount: 0
    });
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    if (container) {
      container.removeEventListener('scroll', handleScroll);
    }
  });

  // React to items changes
  $: {
    if (items) {
      updateTotalHeight();
      const newRange = calculateVisibleRange();
      visibleRange.set(newRange);
      
      if (autoDetectHeight) {
        // Reset measured heights when items change
        measuredHeights.clear();
        // Schedule height measurement
        setTimeout(() => measureItemHeights(), 0);
      }
    }
  }

  // React to enabled changes
  $: if (enabled !== undefined) {
    updateTotalHeight();
    const newRange = calculateVisibleRange();
    visibleRange.set(newRange);
  }
</script>

<div class="virtual-list-wrapper">
  <div
    class="{containerClass}"
    bind:this={container}
    style="height: 100%; overflow-y: auto; position: relative;"
    role="list"
    aria-label="Vocabulary list"
  >
    {#if $visibleItems.length === 0}
      <div class="virtual-list-empty" role="status" aria-live="polite">
        <p>No vocabulary items to display</p>
      </div>
    {:else if !enabled || items.length <= threshold}
      <!-- Render all items when virtual scrolling is disabled -->
      {#each $visibleItems as { item, index } (item.id)}
        <div
          class="{itemClass}"
          data-index={index}
          data-id={item.id}
          role="listitem"
          aria-posinset={index + 1}
          aria-setsize={items.length}
        >
          {@html renderItem(item, index)}
        </div>
      {/each}
    {:else}
      <!-- Virtual scrolling with windowing -->
      <div
        class="virtual-list-scroll-area"
        style="height: {$totalHeight}px; position: relative;"
        role="presentation"
      >
        <div
          class="virtual-list-window"
          style="transform: translateY({$transformOffset}px); position: absolute; top: 0; left: 0; right: 0;"
          role="presentation"
        >
          {#each $visibleItems as { item, index } (item.id)}
            <div
              class="{itemClass}"
              data-index={index}
              data-id={item.id}
              role="listitem"
              aria-posinset={index + 1}
              aria-setsize={items.length}
              style="position: absolute; top: 0; left: 0; right: 0;"
            >
              {@html renderItem(item, index)}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Performance metrics display (debug only) -->
  {#if import.meta.env.DEV}
    <div class="virtual-list-debug" style="position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 12px; z-index: 1000;">
      <div>Items: {items.length}</div>
      <div>Visible: {$visibleRange.start} - {$visibleRange.end}</div>
      <div>Rendering: {$visibleItems.length}</div>
      <div>Load Time: {$performanceMetrics.loadTime.toFixed(2)}ms</div>
      <div>Render Time: {$performanceMetrics.renderTime.toFixed(2)}ms</div>
    </div>
  {/if}
</div>

<style>
  .virtual-list-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    position: relative;
    contain: layout style paint;
  }

  .virtual-list-item {
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 16px;
    transition: background-color 0.2s ease;
    contain: layout style;
  }

  .virtual-list-item:hover {
    background-color: #f5f5f5;
  }

  .virtual-list-item:focus {
    outline: 2px solid #007acc;
    outline-offset: -2px;
  }

  .virtual-list-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
    font-style: italic;
  }

  /* Vocabulary item styles */
  .vocab-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .vocab-word {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .vocab-translation {
    font-size: 16px;
    color: #666;
  }

  .vocab-meta {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: #999;
  }

  .vocab-level {
    background: #e3f2fd;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .vocab-category {
    background: #f3e5f5;
    padding: 2px 6px;
    border-radius: 3px;
  }

  /* Accessibility improvements */
  .virtual-list-container:focus-visible {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }

  /* Performance optimizations */
  .virtual-list-scroll-area {
    will-change: transform;
  }

  .virtual-list-window {
    will-change: transform;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .virtual-list-item {
      transition: none;
    }
    
    .virtual-list-scroll-area,
    .virtual-list-window {
      will-change: auto;
    }
  }
</style>